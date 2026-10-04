/** @fileoverview Checks automatic paragraph item state survives real ruler moves and Chromium history. */
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
  test(`Writer automatic ruler item history at width ${width}`, /** Checks real left/right tracking, complete mode/history and an untouched paragraph. @param fixtures - Browser fixtures. @param testInfo - Screenshot destination. @returns Completion. */ async ({
    page,
  }, testInfo) => {
    const metadata = createDocument({
      id: "ruler-indent-items",
      suiteId: "writer",
      title: "Indent items",
    });
    const writerDocument = createWriterDocument();
    const shell = new SwWrtShell(new SwDocShell(writerDocument, metadata));
    shell.Insert("RulerIndentItemsProof");
    shell.SetParagraphItems([
      new SvxTextLeftMarginItem(487, RES_MARGIN_TEXTLEFT),
      new SvxFirstLineIndentItem(367, RES_MARGIN_FIRSTLINE, true),
      new SvxRightMarginItem(6503, RES_MARGIN_RIGHT),
    ]);
    shell.SplitNode();
    shell.Insert("UntouchedParagraphProof");
    shell.SetParagraphItems([
      new SvxTextLeftMarginItem(900, RES_MARGIN_TEXTLEFT),
      new SvxFirstLineIndentItem(-120, RES_MARGIN_FIRSTLINE),
      new SvxRightMarginItem(2000, RES_MARGIN_RIGHT),
    ]);
    const bytes = writeOdtDocument(writerDocument, metadata);
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/writer");
    await page.getByRole("button", { name: "Open" }).click();
    await page.getByRole("tab", { name: "On computer" }).click();
    await page.getByLabel("Browse").setInputFiles({
      buffer: Buffer.from(bytes),
      mimeType: "application/vnd.oasis.opendocument.text",
      name: "ruler-indent-items.odt",
    });
    const editor = page.getByLabel("Writer document body", { exact: true });
    const firstParagraph = page
      .locator("[data-writer-paragraph-id]")
      .filter({ hasText: "RulerIndentItemsProof" });
    const untouched = page
      .locator("[data-writer-paragraph-id]")
      .filter({ hasText: "UntouchedParagraphProof" });
    await expect(firstParagraph).toHaveText("RulerIndentItemsProof");
    await expect(untouched).toHaveText("UntouchedParagraphProof");
    const untouchedStyle = await untouched.getAttribute("style");
    const toolbar = page.getByRole("toolbar", { name: "Writer horizontal ruler" });
    const assertAnchors =
      /** Checks automatic mode and exact left/right coordinates together. @param pixels - Expected anchors. @returns Completion. */ async (
        pixels: readonly number[],
      ) => {
        await expect(
          toolbar.getByRole("button", { name: "First line indent", exact: true }),
        ).toHaveCount(0);
        await expect(toolbar.getByRole("button", { name: "Paragraph left indent" })).toHaveCSS(
          "left",
          `${pixels[0]}px`,
        );
        await expect(toolbar.getByRole("button", { name: "Paragraph right indent" })).toHaveCSS(
          "left",
          `${pixels[1]}px`,
        );
      };
    await assertAnchors([152, 262]);
    for (const item of [
      { name: "Paragraph left indent", pixels: [173, 262] },
      { name: "Paragraph right indent", pixels: [152, 283] },
    ]) {
      const handle = toolbar.getByRole("button", { name: item.name, exact: true });
      const box = await handle.boundingBox();
      if (box === null) throw new Error("Automatic paragraph margin handle is missing");
      const point = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
      expect(
        await handle.evaluate(
          /** Confirms a visible margin owns input. @param element - Margin button. @param point - Inside its box. @returns Real hit admission. */ (
            element,
            point,
          ) => document.elementFromPoint(point.x, point.y)?.closest("button") === element,
          point,
        ),
      ).toBe(true);
      await page.mouse.move(point.x, point.y);
      await page.mouse.down();
      await page.keyboard.press("Enter");
      await page.mouse.up();
      await assertAnchors([152, 262]);
      await page.mouse.down();
      await page.mouse.move(point.x + 20, point.y, { steps: 3 });
      await page.keyboard.press("Escape");
      await page.mouse.up();
      await assertAnchors([152, 262]);
      await page.mouse.move(point.x, point.y);
      await page.mouse.down();
      await page.mouse.move(point.x + 20, point.y, { steps: 3 });
      await page.mouse.up();
      await assertAnchors(item.pixels);
      await page.getByRole("button", { name: "Format", exact: true }).click();
      await page.getByRole("menuitem", { name: "Paragraph…", exact: true }).click();
      const dialog = page.getByRole("dialog", { name: "Paragraph", exact: true });
      await expect(dialog.getByLabel("Automatic first-line indent")).toBeChecked();
      await expect(dialog.getByLabel("First line indent (pt)")).toHaveValue("18.35");
      await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
      await expect(dialog).toHaveCount(0);
      await editor.press("Control+z");
      await assertAnchors([152, 262]);
      await editor.press("Control+Shift+z");
      await assertAnchors(item.pixels);
      await editor.press("Control+z");
      await assertAnchors([152, 262]);
      await expect(untouched).toHaveAttribute("style", untouchedStyle as string);
      await expect(firstParagraph).toHaveText("RulerIndentItemsProof");
      await expect(untouched).toHaveText("UntouchedParagraphProof");
    }
    await toolbar.screenshot({
      path: testInfo.outputPath("automatic-indent-items.png"),
      scale: "css",
    });
    await expect(page.locator('[data-ruler-guide="x"]')).toHaveCount(0);
    await expect(page.locator('[data-ruler-new-tab="true"]')).toHaveCount(0);
    await editor.press("Control+a");
    await page.keyboard.insertText("RulerIndentItemsInputProof");
    await expect(editor).toContainText("RulerIndentItemsInputProof");
  });
}
