/** @fileoverview Checks three native rounded paragraph ruler anchors and real Chromium transactions. */
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
  test(`Writer rounded paragraph indents at width ${width}`, /** Checks literal integer anchors, actual handle hits and one history transition for each indent. @param fixtures - Browser fixtures. @param testInfo - Screenshot destination. @returns Completion. */ async ({
    page,
  }, testInfo) => {
    const metadata = createDocument({
      id: "ruler-indent-pixels",
      suiteId: "writer",
      title: "Ruler indent pixels",
    });
    const writerDocument = createWriterDocument();
    const shell = new SwWrtShell(new SwDocShell(writerDocument, metadata));
    shell.Insert("RulerIndentPixelsProof");
    shell.SetParagraphItems([
      new SvxTextLeftMarginItem(487, RES_MARGIN_TEXTLEFT),
      new SvxFirstLineIndentItem(367, RES_MARGIN_FIRSTLINE),
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
      name: "ruler-indent-pixels.odt",
    });
    const editor = page.getByLabel("Writer document body", { exact: true });
    const paragraph = page.getByRole("textbox", { name: "Writer document text" });
    await expect(paragraph).toHaveText("RulerIndentPixelsProof");
    const toolbar = page.getByRole("toolbar", { name: "Writer horizontal ruler" });
    const names = ["Paragraph left indent", "First line indent", "Paragraph right indent"];
    const assertAnchors =
      /** Verifies all literal accepted or restored anchors. @param pixels - Expected CSS coordinates. @returns Completion. */ async (
        pixels: readonly number[],
      ) => {
        for (const [index, name] of names.entries())
          await expect(toolbar.getByRole("button", { name, exact: true })).toHaveCSS(
            "left",
            `${pixels[index]}px`,
          );
      };
    await assertAnchors([152, 177, 262]);
    for (const name of names)
      await expect(toolbar.getByRole("button", { name, exact: true })).toBeVisible();
    await toolbar.screenshot({
      path: testInfo.outputPath("rounded-paragraph-indents.png"),
      scale: "css",
    });
    for (const item of [
      { name: names[0] as string, pixels: [173, 198, 262] },
      { name: names[1] as string, pixels: [152, 196, 262] },
      { name: names[2] as string, pixels: [152, 177, 283] },
    ]) {
      const handle = toolbar.getByRole("button", { name: item.name, exact: true });
      const box = await handle.boundingBox();
      if (box === null) throw new Error("Paragraph ruler handle is missing");
      const point = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
      expect(
        await handle.evaluate(
          /** Confirms a real displayed triangle owns input. @param element - Indent button. @param point - Inside its actual box. @returns Whether hit resolves to this handle. */ (
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
      await assertAnchors([152, 177, 262]);
      await page.mouse.down();
      await page.mouse.move(point.x + 20, point.y, { steps: 3 });
      await page.keyboard.press("Escape");
      await page.mouse.up();
      await assertAnchors([152, 177, 262]);
      await expect(page.locator('[data-ruler-new-tab="true"]')).toHaveCount(0);
      await page.mouse.move(point.x, point.y);
      await page.mouse.down();
      await page.mouse.move(point.x + 20, point.y, { steps: 3 });
      await page.mouse.up();
      await assertAnchors(item.pixels);
      await editor.press("Control+z");
      await assertAnchors([152, 177, 262]);
      await editor.press("Control+Shift+z");
      await assertAnchors(item.pixels);
      await editor.press("Control+z");
      await assertAnchors([152, 177, 262]);
    }
    await expect(paragraph).toHaveText("RulerIndentPixelsProof");
    await expect(toolbar.getByRole("button", { name: /^Tab stop/ })).toHaveCount(0);
    await expect(page.locator('[data-ruler-guide="x"]')).toHaveCount(0);
    await editor.press("Control+a");
    await page.keyboard.insertText("RulerIndentPixelsInputProof");
    await expect(editor).toContainText("RulerIndentPixelsInputProof");
  });
}
