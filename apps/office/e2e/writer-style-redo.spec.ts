/** @fileoverview Verifies native style/reset history asymmetry, expanded redo selection, typing and ODT export at desktop/mobile widths. */
import { expect, test } from "@playwright/test";
import fs from "node:fs/promises";
import { createDocument } from "../src/sfx2/source/doc/objsh";
import { SvxFirstLineIndentItem } from "../src/editeng/source/items/frmitems";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
import { readOdtDocument } from "../src/sw/source/filter/xml/swxml";

/** Builds native styles and real partial hint data without browser model injection. @returns Native ODT bytes. */
function historyOdt(): Uint8Array {
  const doc = new SwDoc(),
    before = doc.paragraphs[0];
  if (before === undefined) throw new Error("Missing initial native paragraph");
  before.SetText("BeforeHistoryNeighbor");
  const a = doc.MakeTextFormatColl("History style A", doc.GetDfltTextFormatColl(), "HistoryA"),
    b = doc.MakeTextFormatColl("History style B", doc.GetDfltTextFormatColl(), "HistoryB");
  a.SetFormatAttr(new SvxFirstLineIndentItem(240, 92));
  b.SetFormatAttr(new SvxFirstLineIndentItem(360, 92));
  const node = doc.GetNodes().MakeTextNode("StyleRedo Bold Link Tail");
  node.ChgFormatColl(a);
  node.SetAttr(new SvxFirstLineIndentItem(720, 92));
  node.ToggleTextRangeFormat(10, 14, "bold");
  node.SetHyperlink(15, 19, {
    url: "https://example.test/redo-history",
    targetFrame: "_blank",
    name: "Redo link",
  });
  doc.GetNodes().MakeTextNode("AfterHistoryNeighbor");
  const bytes = writeOdtDocument(
    doc,
    createDocument({ id: "redo-native", title: "Native redo history", suiteId: "writer" }),
  );
  doc.Dispose();
  return bytes;
}
for (const width of [1280, 390])
  test(
    "Writer native paired style history width=" + width,
    /** Checks genuine product style/Undo/Redo, DOM range, typing and exported graph. @param fixtures - Browser page. @param testInfo - Screenshot destination. @returns Completion. */ async (
      { page },
      testInfo,
    ) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/writer");
      await page.getByRole("button", { name: "Open", exact: true }).click();
      await page.getByRole("tab", { name: "On computer" }).click();
      await page.getByLabel("Browse").setInputFiles({
        name: "redo-native.odt",
        mimeType: "application/vnd.oasis.opendocument.text",
        buffer: Buffer.from(historyOdt()),
      });
      const editor = page.getByLabel("Writer document body", { exact: true }),
        select = page.getByRole("combobox", { name: "Paragraph style", exact: true }),
        paragraphs = editor.locator("[data-writer-paragraph-id]"),
        target = paragraphs.nth(1),
        before = paragraphs.nth(0),
        after = paragraphs.nth(2),
        beforeStyle = await before.getAttribute("style"),
        afterStyle = await after.getAttribute("style");
      await target.click();
      await page.keyboard.press("End");
      await expect(select).toHaveValue("HistoryA");
      await expect(target.locator("strong")).toHaveText("Bold");
      await expect(target.locator("a")).toHaveText("Link");
      await expect(target).toHaveCSS("text-indent", "48px");
      await select.selectOption("HistoryB");
      await expect(editor).toBeFocused();
      await expect(target).toHaveCSS("text-indent", "24px");
      await expect(target.locator("strong")).toHaveText("Bold");
      await expect(target.locator("a")).toHaveAttribute(
        "href",
        "https://example.test/redo-history",
      );
      await page.keyboard.press("Control+z");
      await expect(target).toHaveAttribute("data-style", "HistoryA");
      await expect(target).toHaveCSS("text-indent", "48px");
      await page.keyboard.press("Control+Shift+z");
      await expect(target).toHaveAttribute("data-style", "HistoryB");
      await expect(target).toHaveCSS("text-indent", "24px");
      await expect(target.locator("strong")).toHaveCount(0);
      await expect(target.locator("a")).toHaveCount(0);
      await expect(editor).toBeFocused();
      expect(
        await editor.evaluate(
          /** Reads only genuine DOM Selection text. @param host - Actual document body. @returns Selected visible text. */ (
            host,
          ) => host.ownerDocument.getSelection()?.toString(),
        ),
      ).toBe("StyleRedo Bold Link Tail");
      await page.keyboard.insertText("NativeRedoReplacement");
      await expect(target).toHaveText("NativeRedoReplacement");
      await page.keyboard.press("Control+z");
      await expect(target).toHaveText("StyleRedo Bold Link Tail");
      await expect(target.locator("strong")).toHaveCount(0);
      await expect(target.locator("a")).toHaveCount(0);
      await page.keyboard.press("Control+z");
      await expect(target).toHaveCSS("text-indent", "48px");
      await expect(target.locator("strong")).toHaveText("Bold");
      await expect(target.locator("a")).toHaveAttribute("target", "_blank");
      await page.keyboard.press("Control+Shift+z");
      await expect(target).toHaveCSS("text-indent", "24px");
      await expect(target.locator("strong")).toHaveCount(0);
      await expect(target.locator("a")).toHaveCount(0);
      await expect(before).toHaveText("BeforeHistoryNeighbor");
      await expect(after).toHaveText("AfterHistoryNeighbor");
      await expect(before).toHaveAttribute("style", beforeStyle as string);
      await expect(after).toHaveAttribute("style", afterStyle as string);
      if (width === 1280)
        await expect(page.locator("p").filter({ hasText: /^History style B$/ })).toHaveCount(1);
      await target.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: testInfo.outputPath("native-style-redo.png"),
        scale: "css",
        fullPage: true,
      });
      const download = page.waitForEvent("download");
      await page.getByRole("button", { name: "File", exact: true }).click();
      await page.getByRole("menuitem", { name: "Export…", exact: true }).click();
      await page.getByRole("button", { name: "Download ODT", exact: true }).click();
      const path = await (await download).path();
      if (path === null) throw new Error("Missing genuine redo export");
      const loaded = await readOdtDocument(new Uint8Array(await fs.readFile(path)), {
        title: "Native redo export",
      });
      const node = loaded.document.paragraphs[1];
      if (node === undefined) throw new Error("Missing exported target");
      expect(node.GetText()).toBe("StyleRedo Bold Link Tail");
      expect(node.GetTextFormatColl().GetName()).toBe("History style B");
      expect(node.GetParagraphFirstLineIndent()).toBe(360);
      expect(node.GetpSwAttrSet()?.GetItemIfSet(92, false)).toBeUndefined();
      expect(node.GetpSwpHints()).toBeUndefined();
      expect(
        loaded.document.paragraphs.map(
          /** Reads real exported text. @param paragraph - Owned paragraph. @returns Text. */ (
            paragraph,
          ) => paragraph.GetText(),
        ),
      ).toEqual(["BeforeHistoryNeighbor", "StyleRedo Bold Link Tail", "AfterHistoryNeighbor"]);
      loaded.document.Dispose();
    },
  );
