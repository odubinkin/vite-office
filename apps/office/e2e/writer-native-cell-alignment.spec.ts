/** @fileoverview Verifies production cell alignment state, geometry and native selected-cell history without upstream access. */
import { expect, test } from "@playwright/test";
import { selectBrowserTableRow } from "../test-support/table-mouse-e2e";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { SwFormatVertOrient } from "../src/sw/inc/fmtornt";
import { SwFormatFrameSize, SwFrameSize } from "../src/sw/inc/fmtfsize";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
for (const width of [1280, 390])
  test(
    "native common cell alignment and changed item history width=" + width,
    /** Checks native common selection, unchanged submission and real glyph geometry. @param fixtures - Browser fixtures. @param fixtures.page - Production browser. @returns Completion. */ async ({
      page,
    }) => {
      const doc = new SwDoc(),
        table = doc.nodes.MakeTableNode("NativeAlign", { width: 6000 });
      table.AddColumnWidth(3000);
      table.AddColumnWidth(3000);
      for (const [rowIndex, type] of [SwFrameSize.Minimum, SwFrameSize.Fixed].entries()) {
        const row = doc.nodes.AppendTableRow(
          table,
          2,
          { frameSize: new SwFormatFrameSize(type, 0, 1200) },
          [
            { padding: 30, vertOrient: new SwFormatVertOrient(0, rowIndex === 0 ? 3 : 0) },
            { padding: 30, vertOrient: new SwFormatVertOrient(0, rowIndex === 0 ? 2 : 3) },
          ],
        );
        for (const [column, box] of row.GetTabBoxes().entries()) {
          const node = box.GetParagraphs()[0];
          if (node === undefined) throw Error("Missing native text");
          node.SetText("Align" + rowIndex + "-" + column);
        }
      }
      const bytes = writeOdtDocument(doc, { title: "Native align" });
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/writer");
      await page.getByRole("button", { name: "Open", exact: true }).click();
      await page.getByRole("tab", { name: "On computer" }).click();
      await page.getByLabel("Browse").setInputFiles({
        buffer: Buffer.from(bytes),
        mimeType: "application/vnd.oasis.opendocument.text",
        name: "align.odt",
      });
      const rendered = page.getByRole("table", { name: "NativeAlign", exact: true }),
        cells = rendered.locator("[data-writer-table-box]");
      await expect(cells).toHaveCount(4);
      await expect(cells.nth(1)).toHaveCSS("vertical-align", "middle");
      const centered = page.getByRole("textbox", {
        name: "Row 1 column 2 paragraph 1",
        exact: true,
      });
      await centered.click();
      await page.getByRole("button", { name: "Table Properties", exact: true }).click();
      await page.getByRole("tab", { name: "Text Flow", exact: true }).click();
      await expect(page.getByRole("combobox", { name: "Cell vertical alignment" })).toHaveValue(
        "2",
      );
      await page.getByRole("button", { name: "OK", exact: true }).click();
      await expect(cells.nth(0)).toHaveCSS("vertical-align", "bottom");
      await expect(cells.nth(1)).toHaveCSS("vertical-align", "middle");
      const fixed = rendered.locator("[data-writer-fixed-row-content]").nth(1);
      await expect(fixed).toHaveCSS("justify-content", "safe flex-end");
      await selectBrowserTableRow(page, "NativeAlign", 2);
      await page.getByRole("button", { name: "Table Properties", exact: true }).click();
      await page.getByRole("tab", { name: "Text Flow", exact: true }).click();
      await expect(page.getByRole("combobox", { name: "Cell vertical alignment" })).toHaveValue(
        "0",
      );
      await page.getByRole("combobox", { name: "Cell vertical alignment" }).selectOption("3");
      await page.getByRole("button", { name: "OK", exact: true }).click();
      await expect(cells.nth(2)).toHaveCSS("vertical-align", "bottom");
      await expect(cells.nth(3)).toHaveCSS("vertical-align", "bottom");
      await expect(cells.nth(1)).toHaveCSS("vertical-align", "middle");
      const text = page.getByRole("textbox", { name: "Row 2 column 1 paragraph 1", exact: true }),
        geometry = await text.evaluate(
          /** Measures actual text and original cell extents. @param p - Original text host. @returns Device bounds. */ (
            p,
          ) => {
            const cell = p.closest("[data-writer-table-box]");
            if (cell === null) throw Error("Missing frame");
            const textRange = document.createRange();
            textRange.selectNodeContents(p);
            const label = textRange.getBoundingClientRect(),
              box = cell.getBoundingClientRect();
            return {
              top: label.top,
              bottom: label.bottom,
              cellTop: box.top,
              cellBottom: box.bottom,
            };
          },
        );
      expect(geometry.top - geometry.cellTop).toBeGreaterThan(20);
      expect(geometry.bottom).toBeLessThanOrEqual(geometry.cellBottom + 1);
      for (let cycle = 0; cycle < 3; cycle++) {
        await page.getByRole("button", { name: "Undo", exact: true }).click();
        await expect(cells.nth(2)).toHaveCSS("vertical-align", "top");
        await expect(cells.nth(3)).toHaveCSS("vertical-align", "bottom");
        await page.getByRole("button", { name: "Redo", exact: true }).click();
        await expect(cells.nth(2)).toHaveCSS("vertical-align", "bottom");
        await expect(text).toHaveText("Align1-0");
      }
    },
  );

test("native primitive cell orientation remains numeric across the browser open boundary", /** Checks current guarded worker ingress for all valid original native orientations. @param fixtures - Browser fixtures. @param fixtures.page - Production browser. @returns Completion. */ async ({
  page,
}) => {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("PrimitiveAlign", { width: 6000 });
  for (let column = 0; column < 3; column++) table.AddColumnWidth(2000);
  const row = doc.nodes.AppendTableRow(
    table,
    3,
    {},
    [0, 2, 3].map(
      /** Creates complete original native box items. @param orientation - Native ID. @returns Box format. */ (
        orientation,
      ) => ({ vertOrient: new SwFormatVertOrient(720, orientation, 7) }),
    ),
  );
  for (const [index, box] of row.GetTabBoxes().entries()) {
    const node = box.GetParagraphs()[0];
    if (node === undefined) throw Error("Missing native item paragraph");
    node.SetText("Primitive" + index);
  }
  const bytes = writeOdtDocument(doc, { title: "Primitive alignment" });
  await page.setViewportSize({ width: 860, height: 900 });
  await page.goto("/writer");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: Buffer.from(bytes),
    mimeType: "application/vnd.oasis.opendocument.text",
    name: "primitive.odt",
  });
  const rendered = page.getByRole("table", { name: "PrimitiveAlign", exact: true }),
    cells = rendered.locator("[data-writer-table-box]");
  await expect(cells).toHaveCount(3);
  for (const [index, align] of ["top", "middle", "bottom"].entries())
    await expect(cells.nth(index)).toHaveCSS("vertical-align", align);
  await page.getByRole("textbox", { name: "Row 1 column 2 paragraph 1", exact: true }).click();
  await page.getByRole("button", { name: "Table Properties", exact: true }).click();
  await page.getByRole("tab", { name: "Text Flow", exact: true }).click();
  await expect(page.getByRole("combobox", { name: "Cell vertical alignment" })).toHaveValue("2");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Row 1 column 2 paragraph 1", exact: true }),
  ).toHaveText("Primitive1");
});
