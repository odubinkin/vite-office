/** @fileoverview Verifies production native format-page lifecycle, cancellation, cross-page ownership and grouped table history. */
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
  for (let r = 0; r < 2; r++)
    for (const [c, box] of doc.nodes.AppendTableRow(table, 3).GetTabBoxes().entries()) {
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
  test(`native format page local metrics cancel and native acceptance width=${viewport}`, /** Checks production metric/radio fields and original document state. @param fixtures - Browser fixtures. @param fixtures.page - Actual browser. @returns Completion. */ async ({
    page,
  }) => {
    await page.setViewportSize({ width: viewport, height: 900 });
    const rendered = await open(page);
    await page.getByRole("button", { name: "Table Properties", exact: true }).click();
    await page.getByRole("spinbutton", { name: "Table width (cm)", exact: true }).fill("5");
    await page.getByRole("radio", { name: "Automatic", exact: true }).check();
    await expect(
      page.getByRole("spinbutton", { name: "Table width (cm)", exact: true }),
    ).toBeDisabled();
    await page.getByRole("radio", { name: "Left", exact: true }).check();
    await expect(
      page.getByRole("spinbutton", { name: "Table width (cm)", exact: true }),
    ).toHaveValue("5");
    await page.getByRole("radio", { name: "Manual", exact: true }).check();
    await page.getByRole("spinbutton", { name: "Left (cm)", exact: true }).fill("1");
    for (const tab of ["Columns", "Text Flow", "Borders", "Table"])
      await page.getByRole("tab", { name: tab, exact: true }).click();
    const bounds = await page.locator('[data-writer-modal-panel="true"]').boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds?.x).toBeGreaterThanOrEqual(0);
    expect((bounds?.x ?? 0) + (bounds?.width ?? 0)).toBeLessThanOrEqual(viewport);
    await expect
      .poll(
        /** Reads unchanged canonical geometry under the modal. @returns Physical table width. */ async () =>
          (await rendered.boundingBox())?.width,
      )
      .toBeCloseTo(6000 / 15, 0);
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(page.getByRole("button", { name: "Undo", exact: true })).toBeDisabled();
    await page.getByRole("button", { name: "Table Properties", exact: true }).click();
    await expect(page.getByRole("radio", { name: "Left", exact: true })).toBeChecked();
    await page.getByRole("spinbutton", { name: "Table width (cm)", exact: true }).fill("5");
    await page.getByRole("radio", { name: "Center", exact: true }).check();
    await page.getByRole("spinbutton", { name: "Above (cm)", exact: true }).fill("1");
    await page.getByRole("spinbutton", { name: "Below (cm)", exact: true }).fill("0.5");
    await page.getByRole("tab", { name: "Borders", exact: true }).click();
    await page.getByRole("button", { name: "OK", exact: true }).click();
    await expect
      .poll(
        /** Reads accepted source geometry. @returns Physical table width. */ async () =>
          (await rendered.boundingBox())?.width,
      )
      .toBeCloseTo(2835 / 15, 0);
    for (let cycle = 0; cycle < 3; cycle++) {
      await page.getByRole("button", { name: "Undo", exact: true }).click();
      await expect
        .poll(
          /** Reads original native geometry. @returns Physical width. */ async () =>
            (await rendered.boundingBox())?.width,
        )
        .toBeCloseTo(6000 / 15, 0);
      await page.getByRole("button", { name: "Redo", exact: true }).click();
      await expect
        .poll(
          /** Reads retained native redo geometry. @returns Physical width. */ async () =>
            (await rendered.boundingBox())?.width,
        )
        .toBeCloseTo(2835 / 15, 0);
    }
  });
  test(`native format page activation consumes Columns width and retains browser input width=${viewport}`, /** Checks native cross-page values and original text owner after grouped acceptance. @param fixtures - Browser fixtures. @param fixtures.page - Actual browser. @returns Completion. */ async ({
    page,
  }) => {
    await page.setViewportSize({ width: viewport, height: 900 });
    const rendered = await open(page);
    await page.getByRole("button", { name: "Table Properties", exact: true }).click();
    await page.getByRole("tab", { name: "Columns", exact: true }).click();
    await page.getByRole("checkbox", { name: "Adapt table width", exact: true }).check();
    await page.getByRole("spinbutton", { name: "Column 1 width (cm)", exact: true }).fill("5");
    await page.getByRole("tab", { name: "Table", exact: true }).click();
    await expect(
      page.getByRole("spinbutton", { name: "Table width (cm)", exact: true }),
    ).toHaveValue("12.06");
    await page.getByRole("radio", { name: "Automatic", exact: true }).check();
    await page.getByRole("radio", { name: "Left", exact: true }).check();
    await expect(
      page.getByRole("spinbutton", { name: "Table width (cm)", exact: true }),
    ).toHaveValue("12.06");
    await page.getByRole("button", { name: "OK", exact: true }).click();
    await expect
      .poll(
        /** Reads source Columns width accepted by Table. @returns Physical width. */ async () =>
          (await rendered.boundingBox())?.width,
      )
      .toBeCloseTo(6835 / 15, 0);
    const editor = page.getByRole("textbox", { name: "Row 1 column 1 paragraph 1", exact: true });
    await editor.focus();
    await editor.evaluate(
      /** Places an ordinary browser caret at the original text end. @param element - Original editing node. @returns Nothing. */ (
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
