/** @fileoverview Checks automatic first-line ruler exclusion and manual restoration in Chromium. */
import { expect, test } from "@playwright/test";
import {
  SvxFirstLineIndentItem,
  SvxRightMarginItem,
  SvxTextLeftMarginItem,
} from "../src/editeng/source/items/frmitems";
import { createDocument } from "../src/sfx2/source/doc/objsh";
import { RES_MARGIN_FIRSTLINE, RES_MARGIN_RIGHT, RES_MARGIN_TEXTLEFT } from "../src/sw/inc/hintids";
import { createWriterDocument } from "../src/sw/source/core/doc/doc";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
import { SwDocShell } from "../src/sw/source/uibase/app/docsh";
import { SwWrtShell } from "../src/sw/source/uibase/wrtsh/wrtsh1";

for (const width of [1280, 390]) {
  test(`Writer automatic first-line ruler at width ${width}`, /** Checks import, dialog cancellation, restored hit target and history without a hidden input owner. @param fixtures - Browser fixtures. @param testInfo - Screenshot destination. @returns Completion. */ async ({
    page,
  }, testInfo) => {
    const metadata = createDocument({
      id: "ruler-auto-first",
      suiteId: "writer",
      title: "Auto first",
    });
    const writerDocument = createWriterDocument();
    const shell = new SwWrtShell(new SwDocShell(writerDocument, metadata));
    shell.Insert("RulerAutoFirstProof");
    shell.SetParagraphItems([
      new SvxTextLeftMarginItem(487, RES_MARGIN_TEXTLEFT),
      new SvxFirstLineIndentItem(367, RES_MARGIN_FIRSTLINE, true),
      new SvxRightMarginItem(6503, RES_MARGIN_RIGHT),
    ]);
    const bytes = writeOdtDocument(writerDocument, metadata);
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/writer");
    await page.getByRole("button", { name: "Open" }).click();
    await page.getByRole("tab", { name: "On computer" }).click();
    await page.getByLabel("Browse").setInputFiles({
      buffer: Buffer.from(bytes),
      mimeType: "application/vnd.oasis.opendocument.text",
      name: "ruler-auto-first.odt",
    });
    const editor = page.getByLabel("Writer document body", { exact: true });
    const paragraph = page.getByRole("textbox", { name: "Writer document text" });
    const toolbar = page.getByRole("toolbar", { name: "Writer horizontal ruler" });
    const first = toolbar.getByRole("button", { name: "First line indent", exact: true });
    await expect(paragraph).toHaveText("RulerAutoFirstProof");
    await expect(first).toHaveCount(0);
    await expect(page.locator('[aria-label="First line indent"]')).toHaveCount(0);
    await expect(toolbar.getByRole("button", { name: "Paragraph left indent" })).toHaveCSS(
      "left",
      "152px",
    );
    await expect(toolbar.getByRole("button", { name: "Paragraph right indent" })).toHaveCSS(
      "left",
      "262px",
    );
    await toolbar.screenshot({
      path: testInfo.outputPath("automatic-first-line.png"),
      scale: "css",
    });
    const openParagraph =
      /** Opens the existing formatting controller through its upstream menu placement. @returns Completion. */ async () => {
        await page.getByRole("button", { name: "Format", exact: true }).click();
        await page.getByRole("menuitem", { name: "Paragraph…", exact: true }).click();
        return page.getByRole("dialog", { name: "Paragraph", exact: true });
      };
    let dialog = await openParagraph();
    await expect(dialog.getByLabel("Automatic first-line indent")).toBeChecked();
    await expect(dialog.getByLabel("First line indent (pt)")).toHaveValue("18.35");
    await dialog.getByLabel("Automatic first-line indent").uncheck();
    await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(first).toHaveCount(0);
    dialog = await openParagraph();
    await expect(dialog.getByLabel("Automatic first-line indent")).toBeChecked();
    await dialog.getByLabel("Automatic first-line indent").uncheck();
    await dialog.getByRole("button", { name: "OK", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(first).toHaveCSS("left", "177px");
    await toolbar.screenshot({ path: testInfo.outputPath("manual-first-line.png"), scale: "css" });
    const box = await first.boundingBox();
    if (box === null) throw new Error("Manual first-line marker is missing");
    const point = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    expect(
      await first.evaluate(
        /** Confirms the restored marker is an actual input target. @param element - Indent button. @param point - Marker interior. @returns Hit ownership. */ (
          element,
          point,
        ) => document.elementFromPoint(point.x, point.y)?.closest("button") === element,
        point,
      ),
    ).toBe(true);
    await page.mouse.move(point.x, point.y);
    await page.mouse.down();
    await page.mouse.move(point.x + 20, point.y, { steps: 3 });
    await page.mouse.up();
    await expect(first).toHaveCSS("left", "196px");
    await editor.press("Control+z");
    await expect(first).toHaveCSS("left", "177px");
    await editor.press("Control+Shift+z");
    await expect(first).toHaveCSS("left", "196px");
    await editor.press("Control+z");
    await expect(first).toHaveCSS("left", "177px");
    await editor.press("Control+z");
    await expect(first).toHaveCount(0);
    await editor.press("Control+Shift+z");
    await expect(first).toHaveCSS("left", "177px");
    dialog = await openParagraph();
    await expect(dialog.getByLabel("Automatic first-line indent")).not.toBeChecked();
    await dialog.getByLabel("Automatic first-line indent").check();
    await dialog.getByRole("button", { name: "OK", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(first).toHaveCount(0);
    await editor.press("Control+z");
    await expect(first).toHaveCSS("left", "177px");
    await expect(toolbar.getByRole("button", { name: /^Tab stop/ })).toHaveCount(0);
    await expect(page.locator('[data-ruler-guide="x"]')).toHaveCount(0);
    await expect(paragraph).toHaveText("RulerAutoFirstProof");
    await editor.press("Control+a");
    await page.keyboard.insertText("RulerAutoFirstInputProof");
    await expect(editor).toContainText("RulerAutoFirstInputProof");
  });
}
