/** @fileoverview Verifies real browser table properties, selected-cell scope and one native Undo/Redo without upstream execution. */
import { expect, test } from "@playwright/test";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
import { createDocument } from "../src/sfx2/source/doc/objsh";

for (const viewport of [1280, 390])
  test(`Writer table properties native history width=${viewport}`, /** Exercises production native properties and browser bounds. @param fixtures - Browser fixtures. @param fixtures.page - Actual browser. @returns Completion. */ async ({
    page,
  }) => {
    const doc = new SwDoc(),
      body = doc.paragraphs[0];
    if (body === undefined) throw new Error("Missing body owner");
    body.SetText("Before");
    const table = doc.nodes.MakeTableNode(
      "Properties",
      { width: 6000, align: "left", headerRows: 0, repeatHeaderRows: false },
      body,
    );
    table.AddColumnWidth(3000);
    table.AddColumnWidth(3000);
    for (let row = 0; row < 2; row++)
      for (const [column, box] of doc.nodes
        .AppendTableRow(table, 2, {}, [
          { padding: 50, border: "none", verticalAlign: "top" },
          { padding: 50, border: "none", verticalAlign: "top" },
        ])
        .GetTabBoxes()
        .entries()) {
        const node = box.GetParagraphs()[0];
        if (node === undefined) throw new Error("Missing cell owner");
        node.SetText(`Cell${row}-${column}`);
      }
    doc.nodes.MakeTextNode("After");
    const bytes = writeOdtDocument(
      doc,
      createDocument({ id: "properties", suiteId: "writer", title: "Properties" }),
    );
    await page.setViewportSize({ width: viewport, height: 900 });
    await page.goto("/writer");
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("tab", { name: "On computer" }).click();
    await page.getByLabel("Browse").setInputFiles({
      buffer: Buffer.from(bytes),
      mimeType: "application/vnd.oasis.opendocument.text",
      name: "properties.odt",
    });
    const rendered = page.getByRole("table", { name: "Properties" });
    await expect(rendered).toHaveCount(1);
    const cells = rendered.locator("[data-writer-table-box]"),
      width = await rendered.evaluate(
        /** Reads the initial native table bound. @param table - Actual table. @returns Width. */ (
          table,
        ) => table.getBoundingClientRect().width,
      );
    await page.getByRole("button", { name: "Select row 1 in Properties" }).click();
    await page.getByRole("button", { name: "Table Properties", exact: true }).click();
    await page.getByRole("spinbutton", { name: "Table width (cm)" }).fill("8");
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    expect(
      await rendered.evaluate(
        /** Reads canceled native table geometry. @param table - Actual table. @returns Width. */ (
          table,
        ) => table.getBoundingClientRect().width,
      ),
    ).toBeCloseTo(width, 2);
    await page.getByRole("button", { name: "Table Properties", exact: true }).click();
    await page.getByRole("spinbutton", { name: "Table width (cm)" }).fill("8");
    await page.getByRole("tab", { name: "Borders", exact: true }).click();
    await page.getByRole("spinbutton", { name: "Cell padding (cm)" }).fill("0.2");
    await page.getByRole("tab", { name: "Text Flow", exact: true }).click();
    await page.getByRole("combobox", { name: "Cell vertical alignment" }).selectOption("bottom");
    await page.getByRole("button", { name: "OK", exact: true }).click();
    await expect(rendered).toHaveCSS("width", "302.328px");
    await expect(cells.nth(0)).toHaveCSS("padding-left", "7.53333px");
    await expect(cells.nth(1)).toHaveCSS("padding-left", "7.53333px");
    await expect(cells.nth(2)).toHaveCSS("padding-left", "3.33333px");
    await expect(cells.nth(0)).toHaveCSS("vertical-align", "bottom");
    await expect(cells.nth(1)).toHaveCSS("vertical-align", "bottom");
    await expect(cells.nth(2)).toHaveCSS("vertical-align", "top");
    for (let cycle = 0; cycle < 2; cycle++) {
      await page.getByRole("button", { name: "Undo", exact: true }).click();
      await expect(rendered).toHaveCSS("width", "400px");
      await expect(cells.nth(0)).toHaveCSS("padding-left", "3.33333px");
      await expect(cells.nth(0)).toHaveCSS("vertical-align", "top");
      await page.getByRole("button", { name: "Redo", exact: true }).click();
      await expect(rendered).toHaveCSS("width", "302.328px");
      await expect(cells.nth(0)).toHaveCSS("vertical-align", "bottom");
      await expect(
        page.getByRole("textbox", { name: "Row 1 column 1 paragraph 1", exact: true }),
      ).toHaveText("Cell0-0");
      await expect(
        page.getByRole("textbox", { name: "Row 2 column 2 paragraph 1", exact: true }),
      ).toHaveText("Cell1-1");
    }
  });
