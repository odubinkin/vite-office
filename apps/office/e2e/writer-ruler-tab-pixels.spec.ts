/** @fileoverview Checks rounded native tab anchors and typed hit ownership in Chromium. */
import { expect, test } from "@playwright/test";
import { SvxTabAdjust, SvxTabStop, SvxTabStopItem } from "../src/editeng/source/items/paraitem";
import { createDocument } from "../src/sfx2/source/doc/objsh";
import { RES_PARATR_TABSTOP } from "../src/sw/inc/hintids";
import { createWriterDocument } from "../src/sw/source/core/doc/doc";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
import { SwDocShell } from "../src/sw/source/uibase/app/docsh";
import { SwWrtShell } from "../src/sw/source/uibase/wrtsh/wrtsh1";

for (const width of [1280, 390]) {
  test(`Writer rounded tab anchors at width ${width}`, /** Checks actual CSS bounds, free-surface exclusion and one accepted history transition. @param fixtures - Browser fixtures. @param testInfo - Screenshot destination. @returns Completion. */ async ({
    page,
  }, testInfo) => {
    const metadata = createDocument({
      id: "ruler-pixels",
      suiteId: "writer",
      title: "Ruler pixels",
    });
    const writerDocument = createWriterDocument();
    const shell = new SwWrtShell(new SwDocShell(writerDocument, metadata));
    shell.Insert("RulerTabPixelsProof");
    shell.SetParagraphItem(
      SvxTabStopItem.FromStops(
        RES_PARATR_TABSTOP,
        [
          new SvxTabStop(1207, SvxTabAdjust.Left, ",", "_"),
          new SvxTabStop(1700, SvxTabAdjust.Right, ",", "_"),
          new SvxTabStop(2007, SvxTabAdjust.Center, ",", "_"),
          new SvxTabStop(2300, SvxTabAdjust.Decimal, ",", "_"),
        ],
        720,
      ),
    );
    const bytes = writeOdtDocument(writerDocument, metadata);
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/writer");
    await page.getByRole("button", { name: "Open" }).click();
    await page.getByRole("tab", { name: "On computer" }).click();
    await page.getByLabel("Browse").setInputFiles({
      buffer: Buffer.from(bytes),
      mimeType: "application/vnd.oasis.opendocument.text",
      name: "ruler-pixels.odt",
    });
    const editor = page.getByLabel("Writer document body", { exact: true });
    const paragraph = page.getByRole("textbox", { name: "Writer document text" });
    await expect(paragraph).toHaveText("RulerTabPixelsProof");
    const toolbar = page.getByRole("toolbar", { name: "Writer horizontal ruler" });
    const markers = toolbar.getByRole("button", { name: /^Tab stop/ });
    await expect(markers).toHaveCount(4);
    for (const [index, item] of [
      { pixel: 200, offset: 0, width: 7 },
      { pixel: 233, offset: -8, width: 9 },
      { pixel: 254, offset: -3, width: 8 },
      { pixel: 273, offset: -3, width: 8 },
    ].entries()) {
      const handle = markers.nth(index);
      await expect(handle).toBeVisible();
      await expect(handle).toHaveCSS("left", `${item.pixel}px`);
      await expect(handle).toHaveCSS("width", `${item.width}px`);
      expect(
        await handle.evaluate(
          /** Reads the type-dependent hit-box offset. @param element - Explicit tab. @returns Inline transform. */ (
            element,
          ) => element.style.transform,
        ),
      ).toBe(`translateX(${item.offset}px)`);
      const bounds = await handle.boundingBox();
      const surface = await toolbar.locator(":scope > div").boundingBox();
      if (bounds === null || surface === null) throw new Error("Ruler geometry is missing");
      expect(bounds.x - surface.x).toBeCloseTo(item.pixel + item.offset, 5);
    }
    await toolbar.screenshot({
      path: testInfo.outputPath("rounded-tab-anchors.png"),
      scale: "css",
    });
    const right = toolbar.getByRole("button", { name: "Tab stop 2", exact: true });
    const box = await right.boundingBox();
    if (box === null) throw new Error("Rounded Right tab is missing");
    const point = { x: box.x + 3, y: box.y + box.height - 1 };
    expect(
      await right.evaluate(
        /** Verifies the painted typed marker owns the actual hit. @param handle - Right tab. @param point - Painted glyph point. @returns Whether the admitted owner is the handle. */ (
          handle,
          point,
        ) => document.elementFromPoint(point.x, point.y)?.closest("button") === handle,
        point,
      ),
    ).toBe(true);
    await page.mouse.move(point.x, point.y);
    await page.mouse.down();
    await page.keyboard.press("Enter");
    await page.mouse.up();
    await expect(right).toHaveCSS("left", "233px");
    await page.mouse.down();
    await page.mouse.move(point.x + 20, point.y, { steps: 3 });
    await page.keyboard.press("Escape");
    await page.mouse.up();
    await expect(right).toHaveCSS("left", "233px");
    await expect(markers).toHaveCount(4);
    await page.mouse.move(point.x, point.y);
    await page.mouse.down();
    await page.mouse.move(point.x + 20, point.y, { steps: 3 });
    await page.mouse.up();
    await expect(right).toHaveCSS("left", "253px");
    await expect(right).toHaveCSS("width", "9px");
    await expect(right.locator("svg rect").first()).toHaveAttribute("x", "-6");
    await editor.press("Control+z");
    await expect(right).toHaveCSS("left", "233px");
    await editor.press("Control+Shift+z");
    await expect(right).toHaveCSS("left", "253px");
    await expect(paragraph).toHaveText("RulerTabPixelsProof");
    await expect(page.locator('[data-ruler-guide="x"]')).toHaveCount(0);
    await expect(page.locator('[data-ruler-new-tab="true"]')).toHaveCount(0);
    await editor.press("Control+a");
    await page.keyboard.insertText("RulerTabPixelsInputProof");
    await expect(editor).toContainText("RulerTabPixelsInputProof");
  });
}
