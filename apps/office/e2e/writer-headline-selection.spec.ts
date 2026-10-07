/** @fileoverview Verifies production cross-cell ranges and repeated table headline restrictions through genuine ODT UI. */
import { SwFormatFrameSize, SwFrameSize } from "../src/sw/inc/fmtfsize";
import { expect, test } from "@playwright/test";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { SwDocShell } from "../src/sw/source/uibase/app/docsh";
import { createDocument } from "../src/sfx2/source/doc/objsh";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
/** Requires an actual fixture owner. @param value - Resolved owner. @returns Connected owner. */
function required<T>(value: T | null | undefined): T {
  if (value === undefined || value === null) throw new Error("Missing actual fixture owner");
  return value;
}
for (const width of [1280, 390])
  test(`Writer native table range excludes repeated headline selection width=${width}`, /** Exercises actual browser ranges and shared original node editing. @param fixtures - Browser. @param fixtures.page - Actual page. @returns Completion. */ async ({
    page,
  }) => {
    const doc = new SwDoc(),
      body = required(doc.paragraphs[0]);
    body.SetText("Before");
    doc.GetPageDesc().SetValue({
      ...doc.GetPageDesc().GetValue(),
      height: 4400,
      topMargin: 600,
      bottomMargin: 600,
      width: 8000,
      leftMargin: 600,
      rightMargin: 600,
    });
    const table = doc.nodes.MakeTableNode(
      "Select",
      { width: 5000, headerRows: 1, repeatHeaderRows: true },
      body,
    );
    table.AddColumnWidth(2500);
    table.AddColumnWidth(2500);
    for (let row = 0; row < 5; row++)
      for (const [column, box] of doc.nodes
        .AppendTableRow(table, 2, {
          frameSize: new SwFormatFrameSize(SwFrameSize.Minimum, 0, 1000),
        })
        .GetTabBoxes()
        .entries())
        required(box.GetParagraphs()[0]).SetText(`Cell${row}-${column}`);
    doc.nodes.MakeTextNode("After");
    const metadata = createDocument({
        id: "select-headlines",
        suiteId: "writer",
        title: "Select headlines",
      }),
      shell = new SwDocShell(doc, metadata),
      bytes = writeOdtDocument(doc, metadata);
    shell.Close();
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/writer");
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("tab", { name: "On computer" }).click();
    await page.getByLabel("Browse").setInputFiles({
      buffer: Buffer.from(bytes),
      mimeType: "application/vnd.oasis.opendocument.text",
      name: "selection.odt",
    });
    const copies = page.getByRole("textbox", { name: "Row 1 column 1 paragraph 1", exact: true });
    await expect(copies).toHaveCount(3);
    await page.evaluate(
      /** Selects original distinct cell sections. @returns Nothing. */ () => {
        /** Requires an actual fixture owner. @param value - Resolved owner. @returns Connected owner. */
        function required<T>(value: T | null | undefined): T {
          if (value === undefined || value === null)
            throw new Error("Missing actual fixture owner");
          return value;
        }

        const a = required(
            document.querySelector(
              '[data-writer-table-row="0"]:not([data-writer-repeated-headline]) [data-writer-node-index]',
            ),
          ),
          b = required(
            document.querySelector(
              '[data-writer-table-row="1"] td:last-child [data-writer-node-index]',
            ),
          );
        const first = required(document.createTreeWalker(a, NodeFilter.SHOW_TEXT).nextNode()),
          last = required(document.createTreeWalker(b, NodeFilter.SHOW_TEXT).nextNode());
        window.getSelection()?.setBaseAndExtent(first, 1, last, 2);
        document.dispatchEvent(new Event("selectionchange"));
      },
    );
    await expect(page.locator('[data-writer-editor-selected="true"]')).toHaveCount(4);
    await expect(
      page.locator('[data-writer-repeated-headline="true"] [data-writer-editor-selected]'),
    ).toHaveCount(0);
    await page.getByRole("textbox", { name: "Writer document text", exact: true }).click();
    await expect(page.locator("[data-writer-editor-selected]")).toHaveCount(0);
    await page.evaluate(
      /** Installs forbidden follow headline moving endpoint. @returns Nothing. */ () => {
        /** Requires an actual fixture owner. @param value - Resolved owner. @returns Connected owner. */
        function required<T>(value: T | null | undefined): T {
          if (value === undefined || value === null)
            throw new Error("Missing actual fixture owner");
          return value;
        }

        const mark = required(
            document.querySelector('[data-writer-table-row="2"] [data-writer-node-index]'),
          ),
          point = required(
            document.querySelector(
              '[data-writer-repeated-headline="true"] [data-writer-node-index]',
            ),
          );
        const a = required(document.createTreeWalker(mark, NodeFilter.SHOW_TEXT).nextNode()),
          b = required(document.createTreeWalker(point, NodeFilter.SHOW_TEXT).nextNode());
        window.getSelection()?.setBaseAndExtent(a, 1, b, 2);
        document.dispatchEvent(new Event("selectionchange"));
      },
    );
    await expect(page.locator("[data-writer-editor-selected]")).toHaveCount(0);
    await expect
      .poll(
        /** Reads actual corrected fixed mark caret. @returns Native browser text and collapse state. */ () =>
          page.evaluate(
            /** Reads selection after shell restoration. @returns Actual view endpoint. */ () => ({
              collapsed: window.getSelection()?.isCollapsed,
              text: window.getSelection()?.focusNode?.textContent,
              offset: window.getSelection()?.focusOffset,
            }),
          ),
      )
      .toEqual({ collapsed: true, text: "Cell2-0", offset: 1 });
    const follow = copies.nth(1);
    await follow.click();
    await follow.press("End");
    await page.keyboard.type("X");
    for (let i = 0; i < 3; i++) await expect(copies.nth(i)).toHaveText("Cell0-0X");
    await page.keyboard.press("Control+z");
    for (let i = 0; i < 3; i++) await expect(copies.nth(i)).toHaveText("Cell0-0");
    await page.keyboard.press("Control+Shift+z");
    for (let i = 0; i < 3; i++) await expect(copies.nth(i)).toHaveText("Cell0-0X");
    await expect(
      page.getByRole("textbox", { name: "Row 3 column 1 paragraph 1", exact: true }),
    ).toHaveText("Cell2-0");
    await expect(
      page.getByRole("textbox", { name: "Writer document text", exact: true }),
    ).toHaveText("Before");
    await expect(page.getByRole("textbox", { name: "Writer paragraph 2", exact: true })).toHaveText(
      "After",
    );
  });

test("Writer native cross-cell bold formats the selected original rectangle and all headline text copies", /** Checks final interactive cursor ownership affects only selected cells through native format history. @param fixtures - Browser owners. @param fixtures.page - Actual page. @returns Completion. */ async ({
  page,
}) => {
  const doc = new SwDoc(),
    body = required(doc.paragraphs[0]);
  body.SetText("Before");
  doc.GetPageDesc().SetValue({
    ...doc.GetPageDesc().GetValue(),
    height: 4400,
    topMargin: 600,
    bottomMargin: 600,
    width: 8000,
    leftMargin: 600,
    rightMargin: 600,
  });
  const table = doc.nodes.MakeTableNode(
    "Select",
    { width: 5000, headerRows: 1, repeatHeaderRows: true },
    body,
  );
  table.AddColumnWidth(2500);
  table.AddColumnWidth(2500);
  for (let row = 0; row < 5; row++)
    for (const [column, box] of doc.nodes
      .AppendTableRow(table, 2, { frameSize: new SwFormatFrameSize(SwFrameSize.Minimum, 0, 1000) })
      .GetTabBoxes()
      .entries())
      required(box.GetParagraphs()[0]).SetText(`Cell${row}-${column}`);
  doc.nodes.MakeTextNode("After");
  const metadata = createDocument({
      id: "select-headlines",
      suiteId: "writer",
      title: "Select headlines",
    }),
    shell = new SwDocShell(doc, metadata),
    bytes = writeOdtDocument(doc, metadata);
  shell.Close();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/writer");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: Buffer.from(bytes),
    mimeType: "application/vnd.oasis.opendocument.text",
    name: "selection.odt",
  });
  const copies = page.getByRole("textbox", { name: "Row 1 column 1 paragraph 1", exact: true });
  await expect(copies).toHaveCount(3);
  await page.evaluate(
    /** Sets original rectangle before real formatting. @returns Nothing. */ () => {
      const a = document.querySelector(
          '[data-writer-table-row="0"]:not([data-writer-repeated-headline]) [data-writer-node-index]',
        ),
        b = document.querySelector(
          '[data-writer-table-row="1"] td:last-child [data-writer-node-index]',
        );
      if (a === null || b === null) throw new Error("Missing real table owners");
      const first = document.createTreeWalker(a, NodeFilter.SHOW_TEXT).nextNode(),
        last = document.createTreeWalker(b, NodeFilter.SHOW_TEXT).nextNode();
      if (first === null || last === null) throw new Error("Missing real text");
      window.getSelection()?.setBaseAndExtent(first, 1, last, 2);
      document.dispatchEvent(new Event("selectionchange"));
    },
  );
  await expect(page.locator('[data-writer-editor-selected="true"]')).toHaveCount(4);
  await page.keyboard.press("Control+b");
  for (let col = 1; col <= 2; col++) {
    const headers = page.getByRole("textbox", {
      name: `Row 1 column ${col} paragraph 1`,
      exact: true,
    });
    for (let i = 0; i < 3; i++)
      await expect(headers.nth(i).locator("strong")).toHaveText(`Cell0-${col - 1}`);
    await expect(
      page
        .getByRole("textbox", { name: `Row 2 column ${col} paragraph 1`, exact: true })
        .locator("strong"),
    ).toHaveText(`Cell1-${col - 1}`);
    await expect(
      page
        .getByRole("textbox", { name: `Row 3 column ${col} paragraph 1`, exact: true })
        .locator("strong"),
    ).toHaveCount(0);
  }
  await expect(
    page.locator('[data-writer-repeated-headline="true"] [data-writer-editor-selected]'),
  ).toHaveCount(0);
  await page.keyboard.press("Control+z");
  for (let col = 1; col <= 2; col++)
    await expect(
      page
        .getByRole("textbox", { name: `Row 1 column ${col} paragraph 1`, exact: true })
        .locator("strong"),
    ).toHaveCount(0);
  await page.keyboard.press("Control+Shift+z");
  for (let i = 0; i < 3; i++) await expect(copies.nth(i).locator("strong")).toHaveText("Cell0-0");
  await expect(page.getByRole("textbox", { name: "Writer document text", exact: true })).toHaveText(
    "Before",
  );
});
