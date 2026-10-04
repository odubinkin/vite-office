/** @fileoverview Checks four typed ruler glyphs, anchored hit targets and fresh insertion in Chromium. */
import { expect, test } from "@playwright/test";
import { SvxTabAdjust, SvxTabStop, SvxTabStopItem } from "../src/editeng/source/items/paraitem";
import { createDocument } from "../src/sfx2/source/doc/objsh";
import { RES_PARATR_TABSTOP } from "../src/sw/inc/hintids";
import { createWriterDocument } from "../src/sw/source/core/doc/doc";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
import { SwDocShell } from "../src/sw/source/uibase/app/docsh";
import { SwWrtShell } from "../src/sw/source/uibase/wrtsh/wrtsh1";

const cases = [
  {
    adjustment: SvxTabAdjust.Left,
    position: 720,
    offset: 0,
    width: 7,
    rectangles: [
      [0, -1, 7, 2],
      [0, -5, 2, 6],
    ],
  },
  {
    adjustment: SvxTabAdjust.Right,
    position: 1200,
    offset: -8,
    width: 9,
    rectangles: [
      [-6, -1, 7, 2],
      [-1, -5, 2, 6],
    ],
  },
  {
    adjustment: SvxTabAdjust.Center,
    position: 1800,
    offset: -3,
    width: 8,
    rectangles: [
      [-3, -1, 8, 2],
      [0, -5, 2, 6],
    ],
  },
  {
    adjustment: SvxTabAdjust.Decimal,
    position: 2400,
    offset: -3,
    width: 8,
    rectangles: [
      [-3, -1, 8, 2],
      [0, -5, 2, 6],
      [3, -4, 2, 2],
    ],
  },
] as const;

for (const width of [1280, 390]) {
  test(`Writer ruler typed glyphs at width ${width}`, /** Checks real type geometry, hit ownership, undo and fresh replacement. @param fixtures - Browser fixtures. @param testInfo - Owned screenshot destination. @returns Completion. */ async ({
    page,
  }, testInfo) => {
    const metadata = createDocument({
      id: "ruler-glyphs",
      suiteId: "writer",
      title: "Ruler glyphs",
    });
    const document = createWriterDocument();
    const shell = new SwWrtShell(new SwDocShell(document, metadata));
    shell.Insert("RulerTabGlyphProof");
    shell.SetParagraphItem(
      SvxTabStopItem.FromStops(
        RES_PARATR_TABSTOP,
        cases.map(
          /** Builds an owned explicit tab fixture. @param item - Typed case. @returns Model stop. */ (
            item,
          ) => new SvxTabStop(item.position, item.adjustment, ",", "_"),
        ),
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
      name: "ruler-glyphs.odt",
    });
    const editor = page.getByLabel("Writer document body", { exact: true });
    const paragraph = page.getByRole("textbox", { name: "Writer document text" });
    await expect(paragraph).toHaveText("RulerTabGlyphProof");
    const markers = page.getByRole("button", { name: /^Tab stop \d+$/ });
    await expect(markers).toHaveCount(4);
    for (const [index, item] of cases.entries()) {
      const handle = markers.nth(index);
      await expect(handle).toBeVisible();
      expect(
        await handle
          .locator("svg rect")
          .evaluateAll(
            /** Reads actual SVG rectangle attributes. @param rects - Rendered rectangles. @returns Ordered shape values. */ (
              rects,
            ) =>
              rects.map(
                /** Projects one rectangle. @param rect - SVG rectangle. @returns Primitive fields. */ (
                  rect,
                ) =>
                  ["x", "y", "width", "height"].map(
                    /** Reads one dimension. @param name - Attribute. @returns Numeric value. */ (
                      name,
                    ) => Number(rect.getAttribute(name)),
                  ),
              ),
          ),
      ).toEqual(item.rectangles);
      await expect(handle).toHaveCSS("width", `${item.width}px`);
      expect(
        await handle.evaluate(
          /** Reads marker anchor independently of its hit-box offset. @param element - Tab marker. @returns Inline position. */ (
            element,
          ) => Number.parseFloat(element.style.left),
        ),
      ).toBe((1800 + item.position) / 15);
      expect(
        await handle.evaluate(
          /** Reads the inspected type-dependent hit offset. @param element - Tab marker. @returns Inline transform. */ (
            element,
          ) => element.style.transform,
        ),
      ).toBe(`translateX(${item.offset}px)`);
    }
    const toolbar = page.getByRole("toolbar", { name: "Writer horizontal ruler" });
    await toolbar.screenshot({ path: testInfo.outputPath("typed-tab-glyphs.png"), scale: "css" });
    const right = markers.nth(1);
    const rightBox = await right.boundingBox();
    if (rightBox === null) throw new Error("Right tab hit target is missing");
    // The right glyph extends left of its anchor; this point lies on its horizontal bar.
    const hitX = rightBox.x + 3,
      hitY = rightBox.y + rightBox.height - 1;
    await page.mouse.move(hitX, hitY);
    await page.mouse.down();
    await page.mouse.move(hitX + 20, hitY, { steps: 3 });
    await page.mouse.up();
    expect(
      await right.evaluate(
        /** Reads the accepted Right tab anchor. @param element - Marker. @returns Position. */ (
          element,
        ) => Number.parseFloat(element.style.left),
      ),
    ).toBeCloseTo((1800 + 1474) / 15, 3);
    await editor.press("Control+z");
    expect(
      await right.evaluate(
        /** Reads the restored anchor after one undo. @param element - Marker. @returns Position. */ (
          element,
        ) => Number.parseFloat(element.style.left),
      ),
    ).toBe(200);
    await editor.press("Control+Shift+z");
    expect(
      await right.evaluate(
        /** Reads the reapplied typed drag. @param element - Marker. @returns Position. */ (
          element,
        ) => Number.parseFloat(element.style.left),
      ),
    ).toBeCloseTo((1800 + 1474) / 15, 3);
    await editor.press("Control+z");
    const surface = toolbar.locator(":scope > div");
    const box = await surface.boundingBox();
    if (box === null) throw new Error("Ruler surface is missing");
    await page.mouse.move(box.x + 200, box.y + 4);
    await page.mouse.down();
    await expect(page.locator('[data-ruler-new-tab="true"] svg rect')).toHaveCount(2);
    await page.keyboard.press("Escape");
    await page.mouse.up();
    await expect(right).toHaveCSS("width", "9px");
    await page.mouse.down();
    await page.keyboard.press("Enter");
    await page.mouse.up();
    await expect(right).toHaveCSS("width", "7px");
    await expect(right.locator("svg rect").first()).toHaveAttribute("x", "0");
    await editor.press("Control+z");
    await expect(right).toHaveCSS("width", "9px");
    await expect(right.locator("svg rect").first()).toHaveAttribute("x", "-6");
    await editor.press("Control+Shift+z");
    await expect(right).toHaveCSS("width", "7px");
    await expect(page.locator('[data-ruler-guide="x"]')).toHaveCount(0);
    await expect(paragraph).toHaveText("RulerTabGlyphProof");
    await editor.press("Control+a");
    await page.keyboard.insertText("RulerTabGlyphInputProof");
    await expect(editor).toContainText("RulerTabGlyphInputProof");
  });
}
