/** @fileoverview Verifies production native split controls, physical pages, saved state and original editable history. */
import { nativeRowFormatForTest } from "../src/test/table-row-test-helpers";
import { nativeBoxFormat } from "../src/test/table-box-test-helpers";
import { SwFormatFrameSize, SwFrameSize } from "../src/sw/inc/fmtfsize";
import { expect, test } from "@playwright/test";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
for (const width of [1280, 390])
  test(`native split properties controls and physical pages width=${width}`, /** Checks native widgets and document publication through actual browser actions. @param fixtures - Browser fixtures. @param fixtures.page - Actual browser. @returns Completion. */ async ({
    page,
  }) => {
    const doc = new SwDoc(),
      body = doc.paragraphs[0];
    if (body === undefined) throw new Error("Missing body");
    body.SetText("Before");
    doc.GetPageDesc().SetValue({
      ...doc.GetPageDesc().GetValue(),
      height: 1600,
      topMargin: 100,
      bottomMargin: 100,
      width: 8000,
      leftMargin: 100,
      rightMargin: 100,
    });
    const table = doc.nodes.MakeTableNode("Split", { width: 6000, layoutSplit: true }, body);
    table.AddColumnWidth(6000);
    for (let r = 0; r < 3; r++) {
      const node = doc.nodes
        .AppendTableRow(
          table,
          1,
          nativeRowFormatForTest({
            frameSize: new SwFormatFrameSize(SwFrameSize.Minimum, 0, 400),
            keepTogether: r !== 1,
          }),
          [nativeBoxFormat({ padding: 0, border: "none" })],
        )
        .GetTabBoxes()[0]
        ?.GetParagraphs()[0];
      if (node === undefined) throw new Error("Missing row");
      node.SetText("Cell" + r);
    }
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/writer");
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("tab", { name: "On computer" }).click();
    await page.getByLabel("Browse").setInputFiles({
      buffer: Buffer.from(writeOdtDocument(doc, { title: "Split" })),
      mimeType: "application/vnd.oasis.opendocument.text",
      name: "split.odt",
    });
    const frames = page.getByRole("table", { name: "Split", exact: true }),
      editor = page.getByRole("textbox", { name: "Row 1 column 1 paragraph 1", exact: true }),
      parent = page.getByRole("checkbox", {
        name: "Allow table to split across pages and columns",
        exact: true,
      }),
      child = page.getByRole("checkbox", {
        name: "Allow row to break across pages and columns",
        exact: true,
      });
    await expect(frames).toHaveCount(2);
    await editor.click();
    /** Opens the actual native properties page. @returns Completion. */ async function properties() {
      await page.getByRole("button", { name: "Table Properties", exact: true }).click();
      await page.getByRole("tab", { name: "Text Flow", exact: true }).click();
    }
    await properties();
    await expect(parent).toBeChecked();
    await expect(child).toHaveAttribute("aria-checked", "mixed");
    await parent.uncheck();
    await expect(child).toBeDisabled();
    await expect(child).toHaveAttribute("aria-checked", "mixed");
    for (const tab of ["Borders", "Columns", "Table", "Text Flow"])
      await page.getByRole("tab", { name: tab, exact: true }).click();
    await expect(child).toBeDisabled();
    await page.getByRole("button", { name: "Reset", exact: true }).click();
    await expect(parent).toBeChecked();
    await expect(child).toHaveAttribute("aria-checked", "mixed");
    await parent.uncheck();
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(frames).toHaveCount(2);
    await properties();
    await parent.uncheck();
    await page.getByRole("button", { name: "OK", exact: true }).click();
    await expect(frames).toHaveCount(1);
    expect(
      await frames.evaluateAll(
        /** Reads canonical physical page ownership. @param elements - Actual table frames. @returns Page indexes. */ (
          elements,
        ) =>
          elements.map(
            /** Reads one original table frame. @param element - Rendered frame. @returns Page number. */ (
              element,
            ) => Number(element.closest("[data-writer-page]")?.getAttribute("data-writer-page")),
          ),
      ),
    ).toEqual([2]);
    for (let cycle = 0; cycle < 3; cycle++) {
      await properties();
      await expect(parent).not.toBeChecked();
      await expect(child).toBeDisabled();
      await expect(child).toHaveAttribute("aria-checked", "mixed");
      await page.getByRole("button", { name: "Cancel", exact: true }).click();
      await page.getByRole("button", { name: "Undo", exact: true }).click();
      await expect(frames).toHaveCount(2);
      await page.getByRole("button", { name: "Redo", exact: true }).click();
      await expect(frames).toHaveCount(1);
    }
    await properties();
    await parent.check();
    await child.check();
    await parent.uncheck();
    await expect(child).toBeChecked();
    await expect(child).toBeDisabled();
    await page.getByRole("button", { name: "OK", exact: true }).click();
    await properties();
    await expect(child).toBeChecked();
    await expect(child).toBeDisabled();
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    await editor.focus();
    await editor.evaluate(
      /** Sets a genuine browser caret in original text. @param element - Editable cell. @returns Nothing. */ (
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
    await expect(editor).toHaveText("Cell0X");
    await editor.press("Control+z");
    await expect(editor).toHaveText("Cell0");
    await editor.press("Control+y");
    await expect(editor).toHaveText("Cell0X");
    await expect(frames).toHaveCount(1);
    await expect(
      page.getByRole("textbox", { name: "Row 3 column 1 paragraph 1", exact: true }),
    ).toHaveText("Cell2");
  });
