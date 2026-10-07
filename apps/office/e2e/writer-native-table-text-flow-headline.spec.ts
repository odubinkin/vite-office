/** @fileoverview Verifies production native headline defaults, count bounds, page transitions and canonical history. */
import { nativeBoxFormat, tableBoxFormatForTest } from "../src/test/table-box-test-helpers";
import { expect, test, type Page } from "@playwright/test";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { HoriOrientation as H } from "../src/offapi/com/sun/star/text/HoriOrientation";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
/** Opens actual original table owners through the established document interface. @param page - Browser. @returns Rendered original table. */
async function open(page: Page) {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Format", {
      width: 6000,
      horiOrient: H.LEFT,
      headerRows: 0,
      repeatHeaderRows: false,
    });
  for (let c = 0; c < 3; c++) table.AddColumnWidth(2000);
  for (let r = 0; r < 3; r++)
    for (const [c, box] of doc.nodes.AppendTableRow(table, 3).GetTabBoxes().entries()) {
      box.SetFormat(nativeBoxFormat({ ...tableBoxFormatForTest(box.GetFormat()), padding: 80 }));
      const node = box.GetParagraphs()[0];
      if (node === undefined) throw new Error("Missing format lifecycle cell");
      node.SetText(r === 0 && c === 0 ? "Cell" : "B");
    }
  await page.goto("/writer");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: Buffer.from(writeOdtDocument(doc, { title: "Format" })),
    mimeType: "application/vnd.oasis.opendocument.text",
    name: "format-lifecycle.odt",
  });
  const rendered = page.getByRole("table", { name: "Format", exact: true });
  await expect(rendered).toHaveCount(1);
  await page.getByRole("textbox", { name: "Row 1 column 1 paragraph 1", exact: true }).click();
  return rendered;
}

for (const viewport of [1280, 390]) {
  test(`native Table Properties headline defaults and history width=${viewport}`, /** Checks production headerless import and native publication. @param fixtures - Browser fixtures. @param fixtures.page - Actual browser. @returns Completion. */ async ({
    page,
  }) => {
    await page.setViewportSize({ width: viewport, height: 900 });
    await open(page);
    /** Opens the native headline page. @returns Completion. */
    async function properties() {
      await page.getByRole("button", { name: "Table Properties", exact: true }).click();
      await page.getByRole("tab", { name: "Text Flow", exact: true }).click();
    }
    const repeat = page.getByRole("checkbox", { name: "Repeat header", exact: true }),
      count = page.getByRole("spinbutton", { name: "Header rows", exact: true });
    await properties();
    await expect(page.getByRole("checkbox", { name: "Header", exact: true })).toHaveCount(0);
    await expect(repeat).not.toBeChecked();
    await expect(count).toBeDisabled();
    await expect(count).toHaveValue("1");
    await page.getByRole("button", { name: "OK", exact: true }).click();
    await properties();
    await expect(repeat).not.toBeChecked();
    await repeat.check();
    await count.fill("2");
    for (const tab of ["Borders", "Columns", "Table", "Text Flow"])
      await page.getByRole("tab", { name: tab, exact: true }).click();
    await expect(repeat).toBeChecked();
    await expect(count).toHaveValue("2");
    await page.getByRole("button", { name: "Reset", exact: true }).click();
    await expect(repeat).not.toBeChecked();
    await expect(count).toHaveValue("1");
    await repeat.check();
    await count.fill("101");
    await expect(count).toHaveValue("100");
    await expect(count).toHaveAttribute("max", "100");
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    await properties();
    await expect(repeat).not.toBeChecked();
    await repeat.check();
    await count.fill("2");
    await page.getByRole("button", { name: "OK", exact: true }).click();
    for (let cycle = 0; cycle < 3; cycle++) {
      await properties();
      await expect(repeat).toBeChecked();
      await expect(count).toHaveValue("2");
      await page.getByRole("button", { name: "Cancel", exact: true }).click();
      await page.getByRole("button", { name: "Undo", exact: true }).click();
      await properties();
      await expect(repeat).not.toBeChecked();
      await expect(count).toHaveValue("1");
      await page.getByRole("button", { name: "Cancel", exact: true }).click();
      await page.getByRole("button", { name: "Redo", exact: true }).click();
    }
    await properties();
    await repeat.uncheck();
    await expect(count).toHaveValue("2");
    await expect(count).toBeDisabled();
    await page.getByRole("button", { name: "OK", exact: true }).click();
    await properties();
    await expect(repeat).not.toBeChecked();
    await expect(count).toHaveValue("1");
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    const editor = page.getByRole("textbox", { name: "Row 1 column 1 paragraph 1", exact: true });
    await editor.focus();
    await editor.evaluate(
      /** Places an ordinary browser caret. @param element - Original editable cell. @returns Nothing. */ (
        element,
      ) => {
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
}
