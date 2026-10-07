/** @fileoverview Verifies production table names through native Properties, source validation and history at desktop/mobile widths. */
import { expect, test } from "@playwright/test";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
for (const viewport of [1280, 390])
  test(`native table name validation unique allocation and history width=${viewport}`, /** Checks actual imported table and real controls. @param fixtures - Browser fixtures. @param fixtures.page - Browser. @returns Completion. */ async ({
    page,
  }) => {
    const doc = new SwDoc();
    for (const name of ["Original", "Occupied"]) {
      const table = doc.nodes.MakeTableNode(name, { width: 6000 });
      table.AddColumnWidth(6000);
      const node = doc.nodes.AppendTableRow(table, 1).GetTabBoxes()[0]?.GetParagraphs()[0];
      if (node === undefined) throw Error("Missing browser name fixture");
      node.SetText(name === "Original" ? "Cell" : "Other");
    }
    await page.setViewportSize({ width: viewport, height: 900 });
    await page.goto("/writer");
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("tab", { name: "On computer" }).click();
    await page.getByLabel("Browse").setInputFiles({
      buffer: Buffer.from(writeOdtDocument(doc, { title: "Names" })),
      mimeType: "application/vnd.oasis.opendocument.text",
      name: "names.odt",
    });
    const original = page.getByRole("table", { name: "Original", exact: true });
    await expect(original).toHaveCount(1);
    await expect(original).toContainText("Cell");
    await original.getByRole("textbox").click();
    await page.getByRole("button", { name: "Table Properties", exact: true }).click();
    const name = page.getByRole("textbox", { name: "Name", exact: true });
    await expect(name).toHaveValue("Original");
    await name.fill("Bad Name");
    await page.getByRole("tab", { name: "Columns", exact: true }).click();
    await expect(page.getByRole("tab", { name: "Table", exact: true })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(name).toBeFocused();
    await expect(page.getByText("The name of the table must not contain spaces.")).toBeVisible();
    await page.getByRole("button", { name: "OK", exact: true }).click();
    await expect(name).toBeFocused();
    await page.getByRole("button", { name: "Reset", exact: true }).click();
    await expect(name).toHaveValue("Original");
    await name.fill("Draft");
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(original).toHaveCount(1);
    await page.getByRole("button", { name: "Table Properties", exact: true }).click();
    await name.fill("Accepted");
    await page.getByRole("tab", { name: "Columns", exact: true }).click();
    await page.getByRole("button", { name: "OK", exact: true }).click();
    const accepted = page.getByRole("table", { name: "Accepted", exact: true });
    await expect(accepted).toContainText("Cell");
    for (let cycle = 0; cycle < 3; cycle++) {
      await page.getByRole("button", { name: "Undo", exact: true }).click();
      await expect(original).toContainText("Cell");
      await page.getByRole("button", { name: "Redo", exact: true }).click();
      await expect(accepted).toContainText("Cell");
    }
    await page.getByRole("button", { name: "Table Properties", exact: true }).click();
    await name.fill("");
    await page.getByRole("button", { name: "OK", exact: true }).click();
    await expect(page.getByRole("table", { name: "Table1", exact: true })).toContainText("Cell");
    await page.getByRole("button", { name: "Table Properties", exact: true }).click();
    await name.fill("Occupied");
    await page.getByRole("button", { name: "OK", exact: true }).click();
    const unique = page.getByRole("table", { name: "Table2", exact: true });
    await expect(unique).toContainText("Cell");
    await expect(page.getByRole("table", { name: "Occupied", exact: true })).toContainText("Other");
    const editor = unique.getByRole("textbox");
    await editor.focus();
    await editor.evaluate(
      /** Places the established native DOM end caret before continued editing. @param element - Original editable cell. @returns Nothing. */
      (element) => {
        const range = document.createRange();
        range.selectNodeContents(element);
        range.collapse(false);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        document.dispatchEvent(new Event("selectionchange"));
      },
    );
    await page.keyboard.type("X");
    await expect(editor).toHaveText("CellX");
  });
