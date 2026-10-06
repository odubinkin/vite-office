/** @fileoverview Checks real browser physical separator drafts for relative native table widths and grouped history. */
import { expect, test } from "@playwright/test";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { HoriOrientation } from "../src/offapi/com/sun/star/text/HoriOrientation";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
import { selectBrowserTableRow } from "../test-support/table-mouse-e2e";
for (const viewport of [1280, 390])
  test(`native physical column draft from relative table width=${viewport}`, /** Uses production native separators and actual controls. @param fixtures - Browser fixtures. @param fixtures.page - Chromium page. @returns Completion. */ async ({
    page,
  }) => {
    const doc = new SwDoc(),
      table = doc.nodes.MakeTableNode("Relative", {
        width: 65535,
        horiOrient: HoriOrientation.FULL,
      });
    for (let i = 0; i < 3; i++) table.AddColumnWidth(21845);
    for (let row = 0; row < 2; row++)
      for (const [column, box] of doc.nodes.AppendTableRow(table, 3).GetTabBoxes().entries()) {
        const node = box.GetParagraphs()[0];
        if (node === undefined) throw new Error("Missing native cell owner");
        node.SetText(`Cell${row}-${column}`);
      }
    await page.setViewportSize({ width: viewport, height: 900 });
    await page.goto("/writer");
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("tab", { name: "On computer" }).click();
    await page.getByLabel("Browse").setInputFiles({
      buffer: Buffer.from(writeOdtDocument(doc, { title: "Relative" })),
      mimeType: "application/vnd.oasis.opendocument.text",
      name: "relative-columns.odt",
    });
    const rendered = page.getByRole("table", { name: "Relative" });
    await expect(rendered).toHaveCount(1);
    await selectBrowserTableRow(page, "Relative", 2);
    await page.getByRole("button", { name: "Table Properties", exact: true }).click();
    let dialog = page.getByRole("dialog", { name: "Table Properties" });
    await dialog.getByRole("tab", { name: "Columns", exact: true }).click();
    await expect(dialog.getByRole("spinbutton", { name: "Column 1 width (cm)" })).toHaveValue(
      "5.08",
    );
    await dialog.getByRole("spinbutton", { name: "Column 1 width (cm)" }).fill("4");
    await dialog.getByRole("button", { name: "OK", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    for (let cycle = 0; cycle < 3; cycle++) {
      await page.getByRole("button", { name: "Undo", exact: true }).click();
      await page.getByRole("button", { name: "Table Properties", exact: true }).click();
      dialog = page.getByRole("dialog", { name: "Table Properties" });
      await dialog.getByRole("tab", { name: "Columns", exact: true }).click();
      await expect(dialog.getByRole("spinbutton", { name: "Column 1 width (cm)" })).toHaveValue(
        "5.08",
      );
      await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
      await page.getByRole("button", { name: "Redo", exact: true }).click();
      await page.getByRole("button", { name: "Table Properties", exact: true }).click();
      dialog = page.getByRole("dialog", { name: "Table Properties" });
      await dialog.getByRole("tab", { name: "Columns", exact: true }).click();
      await expect(dialog.getByRole("spinbutton", { name: "Column 1 width (cm)" })).toHaveValue(
        "4",
      );
      await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
      await expect(rendered.locator("tr")).toHaveCount(2);
      await expect(
        page.getByRole("textbox", { name: "Row 2 column 1 paragraph 1", exact: true }),
      ).toHaveText("Cell1-0");
    }
  });
