/** @fileoverview Checks ordinary paragraph style reset, exact hint preservation, native repeated history and ODT export in real desktop/mobile UI. */
import { expect, test, type Locator } from "@playwright/test";
import fs from "node:fs/promises";
import { createDocument } from "../src/sfx2/source/doc/objsh";
import { SvxFirstLineIndentItem } from "../src/editeng/source/items/frmitems";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
import { readOdtDocument } from "../src/sw/source/filter/xml/swxml";

/** Requires a real native ODT fixture owner. @param value - Optional value. @returns Present value. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing native reset ODT owner");
  return value;
}

/** Builds real common styles, hard paragraph attributes and whole/partial formatting in an ODT. @returns Complete package bytes. */
function resetOdt(): Uint8Array {
  const doc = new SwDoc(),
    before = required(doc.paragraphs[0]);
  before.SetText("BeforeResetNeighbor");
  const a = doc.MakeTextFormatColl("Reset style A", doc.GetDfltTextFormatColl(), "ResetA"),
    b = doc.MakeTextFormatColl("Reset style B", doc.GetDfltTextFormatColl(), "ResetB");
  a.SetFormatAttr(new SvxFirstLineIndentItem(240, 92));
  b.SetFormatAttr(new SvxFirstLineIndentItem(360, 92));
  const whole = doc.GetNodes().MakeTextNode("WholeResetProof"),
    empty = doc.GetNodes().MakeTextNode(""),
    partial = doc.GetNodes().MakeTextNode("PartialResetProof"),
    link = doc.GetNodes().MakeTextNode("LinkResetProof");
  for (const node of [whole, empty, partial, link]) {
    node.ChgFormatColl(a);
    node.SetAttr(new SvxFirstLineIndentItem(720, 92));
  }
  whole.ToggleTextRangeFormat(0, whole.Len(), "bold");
  partial.ToggleTextRangeFormat(2, 7, "bold");
  link.SetHyperlink(0, link.Len(), {
    url: "https://example.test/style-reset",
    targetFrame: "_blank",
  });
  link.ToggleTextRangeFormat(0, link.Len(), "bold");
  doc.GetNodes().MakeTextNode("AfterResetNeighbor");
  const bytes = writeOdtDocument(
    doc,
    createDocument({ id: "reset-native", title: "Native style reset", suiteId: "writer" }),
  );
  doc.Dispose();
  return bytes;
}

/** Selects a real rendered inclusive range ending at offset zero. @param editor - Native DOM editing host. @returns Completion. */
async function selectRange(editor: Locator): Promise<void> {
  await editor.focus();
  await editor.evaluate(
    /** Uses only native DOM nodes and Selection. @param host - Editing host. @returns Nothing. */ (
      host,
    ) => {
      const paragraphs = Array.from(
          host.querySelectorAll<HTMLElement>("[data-writer-paragraph-id]"),
        ),
        first = paragraphs.find(
          /** Finds rendered first endpoint. @param node - Paragraph. @returns Match. */ (node) =>
            node.textContent === "WholeResetProof",
        ),
        last = paragraphs.find(
          /** Finds rendered last endpoint. @param node - Paragraph. @returns Match. */ (node) =>
            node.textContent === "LinkResetProof",
        );
      if (first === undefined || last === undefined)
        throw new Error("Missing rendered reset endpoints");
      const doc = host.ownerDocument,
        start = doc.createTreeWalker(first, NodeFilter.SHOW_TEXT).nextNode(),
        end = doc.createTreeWalker(last, NodeFilter.SHOW_TEXT).nextNode();
      if (start === null || end === null) throw new Error("Missing rendered reset text");
      doc.getSelection()?.setBaseAndExtent(start, 2, end, 0);
      doc.dispatchEvent(new Event("selectionchange"));
    },
  );
}

for (const width of [1280, 390])
  test(`Writer ordinary native style reset width=${width}`, /** Checks visible direct reset, preserved partial/hyperlink hints, repeat history and genuine export. @param fixtures - Browser page. @param testInfo - Screenshot destination. @returns Completion. */ async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/writer");
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("tab", { name: "On computer" }).click();
    await page.getByLabel("Browse").setInputFiles({
      name: "reset-native.odt",
      mimeType: "application/vnd.oasis.opendocument.text",
      buffer: Buffer.from(resetOdt()),
    });
    const editor = page.getByLabel("Writer document body", { exact: true }),
      select = page.getByRole("combobox", { name: "Paragraph style", exact: true }),
      paragraphs = editor.locator("[data-writer-paragraph-id]");
    const whole = paragraphs.filter({ hasText: "WholeResetProof" }),
      partial = paragraphs.filter({ hasText: "PartialResetProof" }),
      link = paragraphs.filter({ hasText: "LinkResetProof" }),
      empty = paragraphs.nth(2),
      before = paragraphs.filter({ hasText: "BeforeResetNeighbor" }),
      after = paragraphs.filter({ hasText: "AfterResetNeighbor" });
    const beforeStyle = await before.getAttribute("style"),
      afterStyle = await after.getAttribute("style");
    for (const node of [whole, empty, partial, link])
      await expect(node).toHaveCSS("text-indent", "48px");
    await expect(whole.locator("strong")).toHaveText("WholeResetProof");
    await expect(partial.locator("strong")).toHaveText("rtial");
    await expect(link.locator("a strong")).toHaveText("LinkResetProof");
    await selectRange(editor);
    await expect(select).toHaveValue("ResetA");
    await select.selectOption("ResetA");
    for (const node of [whole, empty, partial, link])
      await expect(node).toHaveCSS("text-indent", "16px");
    await expect(whole.locator("strong")).toHaveCount(0);
    await expect(link.locator("strong")).toHaveCount(0);
    await expect(partial.locator("strong")).toHaveText("rtial");
    await expect(link.locator("a")).toHaveAttribute("href", "https://example.test/style-reset");
    await expect(editor).toBeFocused();
    if (width === 1280)
      await expect(page.locator("p").filter({ hasText: /^Reset style A$/ })).toHaveCount(1);
    await select.selectOption("ResetA");
    await page.keyboard.press("Control+z");
    await expect(whole).toHaveCSS("text-indent", "16px");
    await expect(whole.locator("strong")).toHaveCount(0);
    await page.keyboard.press("Control+z");
    for (const node of [whole, empty, partial, link])
      await expect(node).toHaveCSS("text-indent", "48px");
    await expect(whole.locator("strong")).toHaveText("WholeResetProof");
    await expect(link.locator("a strong")).toHaveText("LinkResetProof");
    await page.keyboard.press("Control+Shift+z");
    await page.keyboard.press("Control+Shift+z");
    await expect(whole).toHaveCSS("text-indent", "16px");
    await select.selectOption("ResetB");
    for (const node of [whole, empty, partial, link]) {
      await expect(node).toHaveAttribute("data-style", "ResetB");
      await expect(node).toHaveCSS("text-indent", "24px");
    }
    await expect(before).toHaveAttribute("style", beforeStyle as string);
    await expect(after).toHaveAttribute("style", afterStyle as string);
    await after.click();
    await page.keyboard.press("End");
    await page.keyboard.insertText(":Continued");
    await expect(after).toHaveText("AfterResetNeighbor:Continued");
    await page.keyboard.press("Control+z");
    await expect(after).toHaveText("AfterResetNeighbor");
    await whole.scrollIntoViewIfNeeded();
    await page.screenshot({
      path: testInfo.outputPath("ordinary-style-reset.png"),
      scale: "css",
      fullPage: true,
    });
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "File", exact: true }).click();
    await page.getByRole("menuitem", { name: "Export…", exact: true }).click();
    await page.getByRole("button", { name: "Download ODT", exact: true }).click();
    const path = await (await download).path();
    if (path === null) throw new Error("Missing reset export");
    const imported = await readOdtDocument(new Uint8Array(await fs.readFile(path)), {
      title: "Native reset export",
    });
    expect(
      imported.document.paragraphs.map(
        /** Reads actual exported collections. @param node - Imported paragraph. @returns Display name. */ (
          node,
        ) => node.GetTextFormatColl().GetName(),
      ),
    ).toEqual([
      "Default Paragraph Style",
      "Reset style B",
      "Reset style B",
      "Reset style B",
      "Reset style B",
      "Default Paragraph Style",
    ]);
    const [exportedWhole, exportedEmpty, exportedPartial, exportedLink] =
      imported.document.paragraphs.slice(1, 5);
    for (const node of [
      required(exportedWhole),
      required(exportedEmpty),
      required(exportedPartial),
      required(exportedLink),
    ]) {
      expect(node.GetpSwAttrSet()?.GetItemIfSet(92, false)).toBeUndefined();
      expect(node.GetParagraphFirstLineIndent()).toBe(360);
    }
    expect(
      required(exportedWhole).GetTextRangeFormatState(0, required(exportedWhole).Len(), "bold"),
    ).toBe("off");
    expect(required(exportedPartial).GetTextRangeFormatState(2, 7, "bold")).toBe("on");
    expect(required(exportedLink).getHyperlinkAt(2)?.url).toBe("https://example.test/style-reset");
    imported.document.Dispose();
  });
