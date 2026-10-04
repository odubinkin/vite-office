/** @fileoverview Checks insertion at a stored default tab through Chromium without upstream dependencies. */
import { expect, test } from "@playwright/test";
import { SvxTabAdjust, SvxTabStop, SvxTabStopItem } from "../src/editeng/source/items/paraitem";
import { createDocument } from "../src/sfx2/source/doc/objsh";
import { RES_PARATR_TABSTOP } from "../src/sw/inc/hintids";
import { createWriterDocument } from "../src/sw/source/core/doc/doc";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
import { SwDocShell } from "../src/sw/source/uibase/app/docsh";
import { SwWrtShell } from "../src/sw/source/uibase/wrtsh/wrtsh1";

for (const width of [1280, 390]) {
  test(`Writer replaces a hidden default ruler tab at width ${width}`, /** Checks cancellation and one accepted undo transaction in the real browser. @param fixtures - Browser fixtures. @returns Completion. */ async ({
    page,
  }) => {
    const metadata = createDocument({
      id: "ruler-insertion",
      suiteId: "writer",
      title: "Ruler insertion",
    });
    const document = createWriterDocument();
    const shell = new SwWrtShell(new SwDocShell(document, metadata));
    shell.Insert("RulerTabInsertionProof");
    shell.SetParagraphItem(
      SvxTabStopItem.FromStops(
        RES_PARATR_TABSTOP,
        [new SvxTabStop(1200, SvxTabAdjust.Default, ",", "_")],
        720,
      ),
    );
    const bytes = writeOdtDocument(document, metadata);
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/writer");
    await page.getByRole("button", { name: "Open" }).click();
    await page.getByRole("tab", { name: "On computer" }).click();
    await page.getByLabel("Browse").setInputFiles({
      buffer: Buffer.from(bytes),
      mimeType: "application/vnd.oasis.opendocument.text",
      name: "ruler-insertion.odt",
    });
    const editor = page.getByLabel("Writer document body", { exact: true });
    const paragraph = page.getByRole("textbox", { name: "Writer document text" });
    await expect(paragraph).toHaveText("RulerTabInsertionProof");
    const handle = page.getByRole("button", { name: "Tab stop 1", exact: true });
    await expect(handle).toHaveCount(0);
    const surface = page
      .getByRole("toolbar", { name: "Writer horizontal ruler" })
      .locator(":scope > div");
    const box = await surface.boundingBox();
    if (box === null) throw new Error("Ruler surface is missing");
    await page.mouse.move(box.x + 200, box.y + 4);
    await page.mouse.down();
    await expect(page.locator('[data-ruler-guide="x"]')).toHaveCount(1);
    await page.keyboard.press("Escape");
    await page.mouse.up();
    await expect(handle).toHaveCount(0);
    await page.mouse.down();
    await page.keyboard.press("Enter");
    await page.mouse.up();
    await expect(handle).toBeVisible();
    expect(
      await handle.evaluate(
        /** Reads the accepted explicit marker. @param element - Tab button. @returns Page coordinate. */ (
          element,
        ) => Number.parseFloat(element.style.left),
      ),
    ).toBe(200);
    await editor.press("Control+z");
    await expect(handle).toHaveCount(0);
    await expect(paragraph).toHaveText("RulerTabInsertionProof");
    await editor.press("Control+Shift+z");
    await expect(handle).toBeVisible();
    await expect(page.locator('[data-ruler-guide="x"]')).toHaveCount(0);
    await editor.press("Control+a");
    await page.keyboard.insertText("RulerTabInsertionInputProof");
    await expect(editor).toContainText("RulerTabInsertionInputProof");
  });
}
