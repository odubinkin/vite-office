/** @fileoverview Verifies production properties preserve heterogeneous untouched cell borders and independent changed-item history. */
import { expect, test } from "@playwright/test";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
for (const width of [1280, 390])
  test(
    "native changed border properties preserve untouched cells width=" + width,
    /** Checks production open boundary, acceptance and original cell styling through history. @param fixtures - Browser fixtures. @param fixtures.page - Production page. @returns Completion. */ async ({
      page,
    }) => {
      const doc = new SwDoc(),
        table = doc.nodes.MakeTableNode("BorderState", { width: 6000 });
      table.AddColumnWidth(3000);
      table.AddColumnWidth(3000);
      const row = doc.nodes.AppendTableRow(table, 2, {}, [
        { padding: 567, border: "1pt solid #000000" },
        { padding: 1134, border: "none" },
      ]);
      for (const [i, box] of row.GetTabBoxes().entries()) {
        const node = box.GetParagraphs()[0];
        if (node === undefined) throw Error("Missing border text");
        node.SetText("Cell" + i);
      }
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/writer");
      await page.getByRole("button", { name: "Open", exact: true }).click();
      await page.getByRole("tab", { name: "On computer" }).click();
      await page.getByLabel("Browse").setInputFiles({
        buffer: Buffer.from(writeOdtDocument(doc, { title: "Borders" })),
        mimeType: "application/vnd.oasis.opendocument.text",
        name: "borders.odt",
      });
      const cells = page
        .getByRole("table", { name: "BorderState", exact: true })
        .locator("[data-writer-table-box]");
      await expect(cells).toHaveCount(2);
      await expect(cells.nth(0)).toHaveCSS("padding-left", "37.8px");
      await expect(cells.nth(1)).toHaveCSS("padding-left", "75.6px");
      await expect(cells.nth(0)).toHaveCSS("border-top-style", "solid");
      await expect(cells.nth(1)).toHaveCSS("border-top-style", "dashed");
      await page.getByRole("textbox", { name: "Row 1 column 1 paragraph 1", exact: true }).click();
      await page.getByRole("button", { name: "Table Properties", exact: true }).click();
      await page.getByRole("button", { name: "OK", exact: true }).click();
      await expect(cells.nth(0)).toHaveCSS("border-top-style", "solid");
      await expect(cells.nth(1)).toHaveCSS("border-top-style", "dashed");
      await expect(cells.nth(1)).toHaveCSS("padding-left", "75.6px");
      await page.getByRole("button", { name: "Table Properties", exact: true }).click();
      await page.getByRole("tab", { name: "Borders", exact: true }).click();
      await page.getByRole("combobox", { name: "Cell border" }).selectOption("none");
      await page.getByRole("button", { name: "OK", exact: true }).click();
      await expect(cells.nth(0)).toHaveCSS("border-top-style", "dashed");
      await expect(cells.nth(0)).toHaveCSS("padding-left", "37.8px");
      await expect(cells.nth(1)).toHaveCSS("padding-left", "37.8px");
      for (let cycle = 0; cycle < 3; cycle++) {
        await page.getByRole("button", { name: "Undo", exact: true }).click();
        await expect(cells.nth(0)).toHaveCSS("border-top-style", "solid");
        await expect(cells.nth(1)).toHaveCSS("border-top-style", "dashed");
        await page.getByRole("button", { name: "Redo", exact: true }).click();
        await expect(cells.nth(0)).toHaveCSS("border-top-style", "dashed");
        await expect(cells.nth(1)).toHaveCSS("padding-left", "37.8px");
      }
    },
  );
