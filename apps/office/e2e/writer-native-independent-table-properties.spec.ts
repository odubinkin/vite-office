/** @fileoverview Verifies direct native table properties for independent rows in production Chromium. */
import { expect, test, type Page } from "@playwright/test";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { HoriOrientation as H } from "../src/offapi/com/sun/star/text/HoriOrientation";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
/** Opens authored independent native rows through the existing ODT interface. @param page - Browser. @returns Nothing. */
async function open(page: Page): Promise<void> {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("IndependentProperties", {
      width: 6000,
      horiOrient: H.LEFT,
      headerRows: 0,
      repeatHeaderRows: false,
    });
  table.AddColumnWidth(1000);
  table.AddColumnWidth(5000);
  for (const [r, values] of [
    [1000, 5000],
    [1000, 1000, 4000],
    [4000, 2000],
  ].entries()) {
    for (const [c, box] of doc.nodes.AppendTableRow(table, values.length).GetTabBoxes().entries()) {
      const size = box.GetFrameSize(),
        width = values[c],
        node = box.GetParagraphs()[0];
      if (width === undefined || node === undefined)
        throw new Error("Missing independent browser owner");
      size.SetWidth(width);
      box.SetFrameSize(size);
      node.SetText("r" + r + "c" + c);
    }
  }
  await page.goto("/writer");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: Buffer.from(writeOdtDocument(doc, { title: "IndependentProperties" })),
    mimeType: "application/vnd.oasis.opendocument.text",
    name: "independent-properties.odt",
  });
  await expect(page.getByRole("table", { name: "IndependentProperties", exact: true })).toHaveCount(
    1,
  );
  await page.getByRole("textbox", { name: "Row 2 column 3 paragraph 1", exact: true }).click();
}
/** Checks physical widths for every independent cell. @param page - Browser. @param expected - Literal twips per native row. @returns Completion. */
async function geometry(page: Page, expected: readonly (readonly number[])[]): Promise<void> {
  for (const [r, row] of expected.entries())
    for (const [c, width] of row.entries()) {
      const cell = page.getByRole("cell", { name: "r" + r + "c" + c, exact: true });
      await expect
        .poll(
          /** Reads the actual physical cell. @returns Width in pixels. */ async () =>
            (await cell.boundingBox())?.width,
        )
        .toBeCloseTo(width / 15, 0);
    }
}
for (const viewport of [1280, 390]) {
  test(`native independent properties columns frame-width and history width=${viewport}`, /** Checks the production native owner path and ordinary retained input. @param fixtures - Browser fixtures. @param fixtures.page - Browser. @returns Completion. */ async ({
    page,
  }) => {
    await page.setViewportSize({ width: viewport, height: 900 });
    await open(page);
    const original = [
        [1000, 5000],
        [1000, 1000, 4000],
        [4000, 2000],
      ],
      changed = [
        [1000, 5000],
        [1440, 560, 4000],
        [4000, 2000],
      ],
      scaled = [
        [240, 1200],
        [240, 240, 960],
        [960, 480],
      ];
    await geometry(page, original);
    await page.getByRole("button", { name: "Table Properties", exact: true }).click();
    await page.getByRole("tab", { name: "Columns", exact: true }).click();
    for (const [i, value] of ["1.76", "1.76", "7.06"].entries())
      await expect(
        page.getByRole("spinbutton", { name: "Column " + (i + 1) + " width (cm)", exact: true }),
      ).toHaveValue(value);
    await expect(
      page.getByRole("spinbutton", { name: "Column 4 width (cm)", exact: true }),
    ).toBeDisabled();
    await page.getByRole("spinbutton", { name: "Column 1 width (cm)", exact: true }).fill("2.54");
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    await geometry(page, original);
    await expect(page.getByRole("button", { name: "Undo", exact: true })).toBeDisabled();
    await page.getByRole("button", { name: "Table Properties", exact: true }).click();
    await page.getByRole("button", { name: "OK", exact: true }).click();
    await geometry(page, original);
    await expect(page.getByRole("button", { name: "Undo", exact: true })).toBeDisabled();
    await page.getByRole("button", { name: "Table Properties", exact: true }).click();
    await page.getByRole("tab", { name: "Columns", exact: true }).click();
    await page.getByRole("spinbutton", { name: "Column 1 width (cm)", exact: true }).fill("2.54");
    await page.getByRole("button", { name: "OK", exact: true }).click();
    await geometry(page, changed);
    for (let cycle = 0; cycle < 3; cycle++) {
      await page.getByRole("button", { name: "Undo", exact: true }).click();
      await geometry(page, original);
      await page.getByRole("button", { name: "Redo", exact: true }).click();
      await geometry(page, changed);
    }
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await page.getByRole("button", { name: "Table Properties", exact: true }).click();
    await page.getByRole("spinbutton", { name: "Table width (cm)", exact: true }).fill("2.54");
    await page.getByRole("button", { name: "OK", exact: true }).click();
    await geometry(page, scaled);
    for (let cycle = 0; cycle < 3; cycle++) {
      await page.getByRole("button", { name: "Undo", exact: true }).click();
      await geometry(page, original);
      await page.getByRole("button", { name: "Redo", exact: true }).click();
      await geometry(page, scaled);
    }
    const editor = page.getByRole("textbox", { name: "Row 2 column 3 paragraph 1", exact: true });
    await editor.focus();
    await editor.evaluate(
      /** Places an ordinary caret at retained native text. @param element - Original editing node. @returns Nothing. */ (
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
    await expect(editor).toHaveText("r1c2X");
  });
}
