/** @fileoverview Verifies production native column-page modes, field windows, selected-table sensitivity and actual browser history. */
import { expect, test, type Page } from "@playwright/test";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { HoriOrientation as H } from "../src/offapi/com/sun/star/text/HoriOrientation";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
import { selectBrowserTableRow } from "../test-support/table-mouse-e2e";
/** Opens an actual native table package through the established file interface. @param page - Browser. @param count - Actual columns. @returns Rendered table. */
async function open(page: Page, count = 3) {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Columns", {
      width: count === 3 ? 6000 : count * 1000,
      horiOrient: H.LEFT,
      headerRows: 0,
      repeatHeaderRows: false,
    });
  for (let c = 0; c < count; c++) table.AddColumnWidth(count === 3 ? 2000 : 1000);
  for (let r = 0; r < 2; r++)
    for (const [c, box] of doc.nodes.AppendTableRow(table, count).GetTabBoxes().entries()) {
      const node = box.GetParagraphs()[0];
      if (node === undefined) throw new Error("Missing column-page browser cell");
      node.SetText(r === 0 && c === 0 ? "Cell" : "B");
    }
  await page.goto("/writer");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: Buffer.from(writeOdtDocument(doc, { title: "Columns" })),
    mimeType: "application/vnd.oasis.opendocument.text",
    name: "columns.odt",
  });
  const rendered = page.getByRole("table", { name: "Columns", exact: true });
  await expect(rendered).toHaveCount(1);
  await page.getByRole("textbox", { name: "Row 1 column 1 paragraph 1", exact: true }).click();
  return rendered;
}
/** Opens the actual source-owned Columns page. @param page - Actual browser. @returns Completion. */
async function columns(page: Page) {
  await page.getByRole("button", { name: "Table Properties", exact: true }).click();
  await page.getByRole("tab", { name: "Columns", exact: true }).click();
}
for (const viewport of [1280, 390]) {
  test(`native column page modes and history width=${viewport}`, /** Checks physical production geometry, cancel, native modes and continued input. @param fixtures - Browser fixtures. @param fixtures.page - Actual browser. @returns Completion. */ async ({
    page,
  }) => {
    await page.setViewportSize({ width: viewport, height: 900 });
    const rendered = await open(page),
      first = rendered.locator("tr").first().locator("td,th").first(),
      second = rendered.locator("tr").first().locator("td,th").nth(1);
    await columns(page);
    await expect(page.getByRole("checkbox", { name: "Adapt table width" })).not.toBeChecked();
    await expect(page.getByRole("spinbutton", { name: "Column 4 width (cm)" })).toBeDisabled();
    await page.getByRole("spinbutton", { name: "Column 1 width (cm)" }).fill("5");
    await expect(page.getByRole("spinbutton", { name: "Column 2 width (cm)" })).toHaveValue("2.05");
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(rendered).toHaveCSS("width", "400px");
    await columns(page);
    await page.getByRole("spinbutton", { name: "Column 1 width (cm)" }).fill("5");
    await page.getByRole("button", { name: "OK", exact: true }).click();
    await expect
      .poll(
        /** Reads accepted physical first column. @returns Width. */ async () =>
          (await first.boundingBox())?.width,
      )
      .toBeCloseTo(189, 0);
    await expect
      .poll(
        /** Reads balanced physical next column. @returns Width. */ async () =>
          (await second.boundingBox())?.width,
      )
      .toBeCloseTo(1165 / 15, 0);
    await expect(rendered).toHaveCSS("width", "400px");
    for (let cycle = 0; cycle < 3; cycle++) {
      await page.getByRole("button", { name: "Undo", exact: true }).click();
      await expect
        .poll(
          /** Reads actual native undo column. @returns Width. */ async () =>
            (await first.boundingBox())?.width,
        )
        .toBeCloseTo(2000 / 15, 0);
      await page.getByRole("button", { name: "Redo", exact: true }).click();
      await expect
        .poll(
          /** Reads native redo column. @returns Width. */ async () =>
            (await first.boundingBox())?.width,
        )
        .toBeCloseTo(189, 0);
    }
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await columns(page);
    await page.getByRole("checkbox", { name: "Adapt table width" }).check();
    await page.getByRole("spinbutton", { name: "Column 1 width (cm)" }).fill("5");
    await page.getByRole("tab", { name: "Table", exact: true }).click();
    await expect(page.getByRole("spinbutton", { name: "Table width (cm)" })).toHaveValue("12.06");
    await page.getByRole("button", { name: "OK", exact: true }).click();
    await expect
      .poll(
        /** Reads accepted adapted width. @returns Width. */ async () =>
          (await rendered.boundingBox())?.width,
      )
      .toBeCloseTo(6835 / 15, 0);
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await columns(page);
    await page.getByRole("checkbox", { name: "Adjust columns proportionally" }).check();
    await expect(page.getByRole("checkbox", { name: "Adapt table width" })).toBeDisabled();
    await page.getByRole("spinbutton", { name: "Column 1 width (cm)" }).fill("5");
    await expect(page.getByRole("spinbutton", { name: "Column 3 width (cm)" })).toHaveValue("5");
    await page.getByRole("tab", { name: "Borders", exact: true }).click();
    await page.getByRole("tab", { name: "Columns", exact: true }).click();
    await expect(page.getByRole("checkbox", { name: "Adapt table width" })).toBeEnabled();
    await page.getByRole("button", { name: "OK", exact: true }).click();
    await expect
      .poll(
        /** Reads proportional actual table width. @returns Width. */ async () =>
          (await rendered.boundingBox())?.width,
      )
      .toBeCloseTo(567, 0);
    const editor = page.getByRole("textbox", { name: "Row 1 column 1 paragraph 1", exact: true });
    await editor.focus();
    await editor.evaluate(
      /** Places ordinary collapsed editing caret after modal acceptance. @param element - Actual paragraph. @returns Nothing. */ (
        element,
      ) => {
        const range = document.createRange();
        range.selectNodeContents(element);
        range.collapse(false);
        const selection = document.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        document.dispatchEvent(new Event("selectionchange"));
      },
    );
    await page.keyboard.type("X");
    await expect(editor).toHaveText("CellX");
  });
  test(`native column page window and selection width=${viewport}`, /** Checks native five-slot navigation and partial/whole-table sensitivity within viewport. @param fixtures - Browser fixtures. @param fixtures.page - Actual browser. @returns Completion. */ async ({
    page,
  }) => {
    await page.setViewportSize({ width: viewport, height: 900 });
    const rendered = await open(page, 7);
    await columns(page);
    await expect(page.getByRole("spinbutton")).toHaveCount(5);
    await page.getByRole("button", { name: "Next columns" }).click();
    await expect(page.getByRole("spinbutton", { name: "Column 6 width (cm)" })).toHaveValue("1.76");
    await page.getByRole("button", { name: "Next columns" }).click();
    await expect(page.getByRole("button", { name: "Next columns" })).toBeDisabled();
    await page.getByRole("spinbutton", { name: "Column 7 width (cm)" }).fill("2");
    await page.getByRole("button", { name: "Previous columns" }).click();
    const bounds = await page.locator("[data-writer-modal-panel]").boundingBox();
    if (bounds === null) throw new Error("Missing native columns panel");
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(viewport);
    await page.getByRole("button", { name: "OK", exact: true }).click();
    await expect
      .poll(
        /** Reads accepted seven-column width. @returns Width. */ async () =>
          (await rendered.boundingBox())?.width,
      )
      .toBeCloseTo(7000 / 15, 0);
    await selectBrowserTableRow(page, "Columns", 1);
    await columns(page);
    await expect(page.getByRole("checkbox", { name: "Adapt table width" })).toBeDisabled();
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    await page.getByRole("button", { name: "Table", exact: true }).click();
    await page.getByRole("menuitem", { name: "Select", exact: true }).hover();
    await page.getByRole("menuitem", { name: "Select Table", exact: true }).click();
    await columns(page);
    await expect(page.getByRole("checkbox", { name: "Adapt table width" })).toBeEnabled();
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
  });
}
