/** @fileoverview Checks actual Chromium fixed and minimum row extents via ordinary production Open. */
import { expect, test } from "@playwright/test";
import { SwFormatFrameSize, SwFrameSize } from "../src/sw/inc/fmtfsize";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { createDocument } from "../src/sfx2/source/doc/objsh";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
/** Requires connected fixture owner. @param value - Optional owner. @returns Actual owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing physical fixed-row fixture");
  return value;
}
for (const width of [1280, 390])
  test(`Writer native fixed row clipping and minimum growth width=${width}`, /** Checks original editable cells and physical native extents. @param fixtures - Browser fixtures. @param fixtures.page - Production page. @returns Completion. */ async ({
    page,
  }) => {
    const doc = new SwDoc(),
      table = doc.nodes.MakeTableNode(
        "Height modes",
        { width: 3000, align: "left" },
        doc.paragraphs[0],
      );
    table.AddColumnWidth(3000);
    for (const type of [SwFrameSize.Fixed, SwFrameSize.Minimum]) {
      const row = doc.nodes.AppendTableRow(table, 1, {
        frameSize: new SwFormatFrameSize(type, 0, 600),
      });
      required(required(row.GetTabBoxes()[0]).GetParagraphs()[0]).SetText(
        "Several lines of original text in a native row. ".repeat(4),
      );
    }
    const bytes = writeOdtDocument(
      doc,
      createDocument({ id: "height-modes", suiteId: "writer", title: "Height modes" }),
    );
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/writer");
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("tab", { name: "On computer" }).click();
    await page.getByLabel("Browse").setInputFiles({
      buffer: Buffer.from(bytes),
      mimeType: "application/vnd.oasis.opendocument.text",
      name: "height-modes.odt",
    });
    await expect(page.getByRole("dialog", { name: "Open", exact: true })).toBeHidden();
    const displayed = page.getByRole("table", { name: "Height modes", exact: true }),
      fixed = displayed.locator("tr").nth(0),
      minimum = displayed.locator("tr").nth(1);
    await expect(fixed.locator("[data-writer-fixed-row-content]")).toHaveCSS("overflow", "hidden");
    await expect(fixed.locator("[data-writer-fixed-row-content]")).toHaveCSS("height", "40px");
    const fixedBounds = await fixed.boundingBox(),
      minBounds = await minimum.boundingBox();
    expect(fixedBounds).not.toBeNull();
    expect(minBounds).not.toBeNull();
    expect(fixedBounds?.height).toBeCloseTo(40, 0);
    expect(minBounds?.height).toBeGreaterThan(80);
    await expect(fixed.getByRole("textbox")).toHaveJSProperty("isContentEditable", true);
  });
