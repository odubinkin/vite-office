/** @fileoverview Checks visible inclusive paragraph StyleApply ranges, active-endpoint no-op correction, history and ODT export on desktop/mobile. */
import { expect, test, type Locator } from "@playwright/test";
import fs from "node:fs/promises";
import { createDocument } from "../src/sfx2/source/doc/objsh";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
import { readOdtDocument } from "../src/sw/source/filter/xml/swxml";

/** Creates an actual owned mixed-style ODT with untouched neighbors and an empty selected paragraph. @returns Complete package bytes. */
function mixedRangeOdt(): Uint8Array {
  const doc = new SwDoc(),
    first = doc.paragraphs[0];
  if (first === undefined) throw new Error("Missing native ODT paragraph");
  first.SetText("BeforeStyleRange");
  const a = doc.MakeTextFormatColl("Owned range A", doc.GetDfltTextFormatColl(), "OwnedA"),
    b = doc.MakeTextFormatColl("Owned range B", doc.GetDfltTextFormatColl(), "OwnedB");
  const selected = doc.GetNodes().MakeTextNode("FirstStyleRange");
  selected.ChgFormatColl(b);
  doc.GetNodes().MakeTextNode("");
  doc.GetNodes().MakeTextNode("LastStyleRange").ChgFormatColl(a);
  doc.GetNodes().MakeTextNode("AfterStyleRange");
  const result = writeOdtDocument(
    doc,
    createDocument({ id: "style-range", suiteId: "writer", title: "Style range" }),
  );
  doc.Dispose();
  return result;
}

/** Selects through real DOM point/anchor endpoints, without touching application models. @param editor - Current editing host. @returns Browser selection completion. */
async function selectParagraphRange(editor: Locator): Promise<void> {
  await editor.focus();
  await editor.evaluate(
    /** Uses only native DOM selection APIs on rendered paragraphs. @param host - Editing host. @returns Nothing. */ (
      host,
    ) => {
      const paragraphs = Array.from(
          host.querySelectorAll<HTMLElement>("[data-writer-paragraph-id]"),
        ),
        first = paragraphs.find(
          /** Finds the rendered first endpoint. @param node - Paragraph. @returns Match. */ (
            node,
          ) => node.textContent === "FirstStyleRange",
        ),
        last = paragraphs.find(
          /** Finds the rendered last endpoint. @param node - Paragraph. @returns Match. */ (
            node,
          ) => node.textContent === "LastStyleRange",
        );
      if (first === undefined || last === undefined)
        throw new Error("Missing rendered range endpoints");
      const doc = host.ownerDocument,
        start = doc.createTreeWalker(first, NodeFilter.SHOW_TEXT).nextNode(),
        end = doc.createTreeWalker(last, NodeFilter.SHOW_TEXT).nextNode();
      if (start === null || end === null) throw new Error("Missing rendered endpoint text");
      doc.getSelection()?.setBaseAndExtent(start, 2, end, 0);
      doc.dispatchEvent(new Event("selectionchange"));
    },
  );
}

for (const width of [1280, 390]) {
  test(`Writer inclusive paragraph style range width=${width}`, /** Checks actual ODT UI, history, selection/focus and exported ownership. @param fixtures - Browser page. @param testInfo - Screenshot output. @returns Completion. */ async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/writer");
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("tab", { name: "On computer" }).click();
    await page.getByLabel("Browse").setInputFiles({
      buffer: Buffer.from(mixedRangeOdt()),
      mimeType: "application/vnd.oasis.opendocument.text",
      name: "style-range.odt",
    });
    const editor = page.getByLabel("Writer document body", { exact: true }),
      select = page.getByRole("combobox", { name: "Paragraph style", exact: true });
    const first = editor
        .locator("[data-writer-paragraph-id]")
        .filter({ hasText: "FirstStyleRange" }),
      last = editor.locator("[data-writer-paragraph-id]").filter({ hasText: "LastStyleRange" }),
      before = editor.locator("[data-writer-paragraph-id]").filter({ hasText: "BeforeStyleRange" }),
      after = editor.locator("[data-writer-paragraph-id]").filter({ hasText: "AfterStyleRange" }),
      empty = editor.locator("[data-writer-paragraph-id]").nth(2);
    await expect(first).toHaveAttribute("data-style", "OwnedB");
    await expect(last).toHaveAttribute("data-style", "OwnedA");
    await expect(empty).toHaveAttribute("data-style", "default");
    const beforeStyle = await before.getAttribute("style"),
      afterStyle = await after.getAttribute("style");
    await selectParagraphRange(editor);
    await expect(select).toHaveValue("OwnedA");
    await select.selectOption("OwnedA");
    await expect(first).toHaveAttribute("data-style", "OwnedA");
    await expect(empty).toHaveAttribute("data-style", "OwnedA");
    await expect(last).toHaveAttribute("data-style", "OwnedA");
    await expect(editor).toBeFocused();
    await page.keyboard.press("Control+z");
    await expect(first).toHaveAttribute("data-style", "OwnedB");
    await expect(empty).toHaveAttribute("data-style", "default");
    await expect(last).toHaveAttribute("data-style", "OwnedA");
    await page.keyboard.press("Control+Shift+z");
    await expect(first).toHaveAttribute("data-style", "OwnedA");
    await expect(empty).toHaveAttribute("data-style", "OwnedA");
    await select.selectOption("OwnedB");
    for (const paragraph of [first, empty, last])
      await expect(paragraph).toHaveAttribute("data-style", "OwnedB");
    if (width === 1280)
      await expect(page.locator("p").filter({ hasText: /^Owned range B$/ })).toHaveCount(1);
    await last.click();
    await page.keyboard.press("End");
    await page.keyboard.insertText(":AfterRangeStyle");
    await expect(last).toHaveText("LastStyleRange:AfterRangeStyle");
    await expect(last).toHaveAttribute("data-style", "OwnedB");
    await page.keyboard.press("Control+z");
    await expect(last).toHaveText("LastStyleRange");
    await expect(before).toHaveAttribute("style", beforeStyle as string);
    await expect(after).toHaveAttribute("style", afterStyle as string);
    await expect(before).toHaveText("BeforeStyleRange");
    await expect(after).toHaveText("AfterStyleRange");
    await page.screenshot({
      path: testInfo.outputPath("inclusive-style-range.png"),
      scale: "css",
      fullPage: true,
    });
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "File", exact: true }).click();
    await page.getByRole("menuitem", { name: "Export…", exact: true }).click();
    await page.getByRole("button", { name: "Download ODT", exact: true }).click();
    const path = await (await download).path();
    if (path === null) throw new Error("Missing exported ODT");
    const loaded = await readOdtDocument(new Uint8Array(await fs.readFile(path)), {
      title: "Exported range",
    });
    expect(
      loaded.document.paragraphs.map(
        /** Reads genuine exported paragraph ownership. @param node - Imported paragraph. @returns Display name. */ (
          node,
        ) => node.GetTextFormatColl().GetName(),
      ),
    ).toEqual([
      "Default Paragraph Style",
      "Owned range B",
      "Owned range B",
      "Owned range B",
      "Default Paragraph Style",
    ]);
    loaded.document.Dispose();
  });
}
