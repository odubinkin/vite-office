/** @fileoverview Checks live custom style selection through real ODT import, toolbar, paragraph draft and history. */
import { expect, test } from "@playwright/test";
import {
  SvxFirstLineIndentItem,
  SvxTextLeftMarginItem,
} from "../src/editeng/source/items/frmitems";
import { createDocument } from "../src/sfx2/source/doc/objsh";
import { RES_MARGIN_FIRSTLINE, RES_MARGIN_TEXTLEFT } from "../src/sw/inc/hintids";
import { createWriterDocument } from "../src/sw/source/core/doc/doc";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
import { SwDocShell } from "../src/sw/source/uibase/app/docsh";
import { SwWrtShell } from "../src/sw/source/uibase/wrtsh/wrtsh1";

for (const width of [1280, 390])
  test(`Writer live style selector width=${width}`, /** Checks actual named-style import, inherited glyph placement, raw draft and history. @param fixtures - Browser page. @param testInfo - Screenshot destination. @returns Completion. */ async ({
    page,
  }, testInfo) => {
    const metadata = createDocument({
      id: "named-history",
      suiteId: "writer",
      title: "Named history",
    });
    const document = createWriterDocument();
    const parent = document.MakeTextFormatColl(
      "Owned parent",
      document.GetDfltTextFormatColl(),
      "OwnedParent",
    );
    parent.SetFormatAttr(new SvxTextLeftMarginItem(600, RES_MARGIN_TEXTLEFT));
    parent.SetFormatAttr(new SvxFirstLineIndentItem(-240, RES_MARGIN_FIRSTLINE));
    document.MakeTextFormatColl("Owned child", parent, "OwnedChild");
    document.MakeTextFormatColl("Unused: & 字", document.GetDfltTextFormatColl(), "UnusedCustom");
    const docShell = new SwDocShell(document, metadata),
      shell = new SwWrtShell(docShell);
    shell.SetParagraphStyle("OwnedChild");
    shell.Insert("NamedHistoryProof");
    shell.SplitNode();
    shell.SetParagraphStyle("default");
    shell.Insert("UntouchedNamedProof");
    const bytes = writeOdtDocument(document, metadata);
    docShell.Close();
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/writer");
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("tab", { name: "On computer" }).click();
    await page.getByLabel("Browse").setInputFiles({
      buffer: Buffer.from(bytes),
      mimeType: "application/vnd.oasis.opendocument.text",
      name: "named-history.odt",
    });
    const editor = page.getByLabel("Writer document body", { exact: true });
    const paragraph = page
      .locator("[data-writer-paragraph-id]")
      .filter({ hasText: "NamedHistoryProof" });
    const untouched = page
      .locator("[data-writer-paragraph-id]")
      .filter({ hasText: "UntouchedNamedProof" });
    await expect(paragraph).toHaveText("NamedHistoryProof");
    await expect(paragraph).toHaveAttribute("data-style", "OwnedChild");
    await expect(untouched).toHaveAttribute("data-style", "default");
    const untouchedStyle = await untouched.getAttribute("style");
    const checkLayout =
      /** Checks raw manual rendering and exact style ownership. @param points - First-line offset. @returns Completion. */ async (
        points: number,
      ) => {
        await expect(paragraph).toHaveAttribute("data-style", "OwnedChild");
        await expect(paragraph).toHaveCSS("margin-left", "40px");
        await expect(paragraph).toHaveCSS("text-indent", `${(points * 4) / 3}px`);
        const offset = await paragraph.evaluate(
          /** Reads shaped first glyph relative to its paragraph. @param element - Paragraph. @returns Pixel offset. */ (
            element,
          ) => {
            const walker = element.ownerDocument.createTreeWalker(element, NodeFilter.SHOW_TEXT),
              first = walker.nextNode();
            if (first === null) throw new Error("Named glyph is missing");
            const range = element.ownerDocument.createRange();
            range.setStart(first, 0);
            range.setEnd(first, 1);
            return range.getBoundingClientRect().left - element.getBoundingClientRect().left;
          },
        );
        expect(offset).toBeCloseTo((points * 4) / 3, 1);
      };
    await checkLayout(-12);
    const select = page.getByRole("combobox", { name: "Paragraph style", exact: true });
    await expect(select).toHaveValue("OwnedChild");
    await expect(select.locator("option:checked")).toHaveText("Owned child");
    await expect(select.locator("optgroup")).toHaveCount(0);
    await expect(select.locator("option")).toHaveText([
      "Default Paragraph Style",
      "Text body",
      "Title",
      "Subtitle",
      "Heading 1",
      "Heading 2",
      "Heading 3",
      "Heading 4",
      "Quotations",
      "Preformatted Text",
      "Owned parent",
      "Owned child",
      "Unused: & 字",
    ]);
    await select.selectOption("UnusedCustom");
    await expect(select.locator("option:checked")).toHaveText("Unused: & 字");
    await expect(paragraph).toHaveAttribute("data-style", "UnusedCustom");
    await editor.press("Control+z");
    await expect(select).toHaveValue("OwnedChild");
    await editor.press("Control+Shift+z");
    await expect(select).toHaveValue("UnusedCustom");
    await editor.press("Control+z");
    await checkLayout(-12);
    if (width === 1280)
      await expect(page.locator("p").filter({ hasText: /^Owned child$/ })).toHaveCount(1);
    const openDialog = /** Opens the product paragraph draft. @returns Completion. */ async () => {
      await page.getByRole("button", { name: "Format", exact: true }).click();
      await page.getByRole("menuitem", { name: "Paragraph…", exact: true }).click();
    };
    const dialog = page.getByRole("dialog", { name: "Paragraph", exact: true });
    await openDialog();
    await expect(dialog.getByLabel("First line indent (pt)")).toHaveValue("-12");
    await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    await checkLayout(-12);
    await openDialog();
    await dialog.getByLabel("First line indent (pt)").fill("6");
    await dialog.getByRole("button", { name: "OK", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await checkLayout(6);
    await editor.press("Control+z");
    await checkLayout(-12);
    await editor.press("Control+Shift+z");
    await checkLayout(6);
    await editor.press("Control+z");
    await checkLayout(-12);
    await expect(untouched).toHaveText("UntouchedNamedProof");
    await expect(untouched).toHaveAttribute("style", untouchedStyle as string);
    await page.screenshot({
      path: testInfo.outputPath("live-style-selector.png"),
      scale: "css",
      fullPage: true,
    });
    await editor.press("Control+a");
    await page.keyboard.insertText("NamedEditingProof");
    await expect(editor).toContainText("NamedEditingProof");
  });
