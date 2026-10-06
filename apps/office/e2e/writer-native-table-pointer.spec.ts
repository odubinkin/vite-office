/** @fileoverview Checks real table interior pointer placement and explicit row gutter selection. */
import { expect, test } from "@playwright/test";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { SwPosition } from "../src/sw/source/core/crsr/pam";
import { SwDocShell } from "../src/sw/source/uibase/app/docsh";
import { SwWrtShell } from "../src/sw/source/uibase/wrtsh/wrtsh1";
import { createDocument } from "../src/sfx2/source/doc/objsh";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";

for (const width of [1280, 390])
  test(`Writer native table interior and gutter pointer width=${width}`, /** Checks ordinary production Open then actual pointer/input/history. @param fixtures - Browser fixtures. @param fixtures.page - Production page. @returns Completion. */ async ({
    page,
  }) => {
    const doc = new SwDoc(),
      body = doc.paragraphs[0],
      metadata = createDocument({ id: "table-pointer", suiteId: "writer", title: "Pointer" });
    if (body === undefined) throw new Error("Missing body");
    body.SetText("Body neighbor");
    const table = doc.nodes.MakeTableNode("Pointer", { width: 6000, headerRows: 0 }, body);
    for (let column = 0; column < 3; column++) table.AddColumnWidth(2000);
    const row = doc.nodes.AppendTableRow(table, 3, { minHeight: 2400 });
    const first = row.GetTabBoxes()[0]?.GetParagraphs()[0],
      target = row.GetTabBoxes()[1]?.GetParagraphs()[0],
      empty = row.GetTabBoxes()[2]?.GetParagraphs()[0];
    if (first === undefined || target === undefined || empty === undefined)
      throw new Error("Missing table fixture");
    for (const box of row.GetTabBoxes())
      box.SetFormat({ padding: 300, border: "1px solid #000000" });
    first.SetText("Keep");
    target.SetText("Upper");
    const shell = new SwWrtShell(new SwDocShell(doc, metadata));
    const split = new SwPosition(target, target.Len());
    let lower;
    try {
      lower = shell.SplitParagraph(split);
    } finally {
      split.Dispose();
    }
    lower.SetText("Lower");
    const point = new SwPosition(first, 0);
    try {
      shell.SetCursor(point);
    } finally {
      point.Dispose();
    }
    shell.SetParagraphListKind("numbered");
    const bytes = writeOdtDocument(doc, metadata);
    shell.Close();
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/writer");
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("tab", { name: "On computer" }).click();
    await page.getByLabel("Browse").setInputFiles({
      buffer: Buffer.from(bytes),
      mimeType: "application/vnd.oasis.opendocument.text",
      name: "native-table-pointer.odt",
    });
    await expect(page.getByRole("dialog", { name: "Open", exact: true })).toBeHidden();
    const displayed = page.getByRole("table", { name: "Pointer" }),
      selector = page.getByRole("button", { name: "Select row 1 in Pointer" }),
      targetCell = displayed.locator("td").nth(1),
      emptyCell = displayed.locator("td").nth(2),
      firstEditor = page.getByLabel("Row 1 column 1 paragraph 1", { exact: true }),
      upperEditor = page.getByLabel("Row 1 column 2 paragraph 1", { exact: true }),
      lowerEditor = page.getByLabel("Row 1 column 2 paragraph 2", { exact: true }),
      emptyEditor = page.getByLabel("Row 1 column 3 paragraph 1", { exact: true });
    await selector.scrollIntoViewIfNeeded();
    const tableBounds = await displayed.boundingBox(),
      selectorBounds = await selector.boundingBox();
    if (tableBounds === null || selectorBounds === null) throw new Error("Missing gutter geometry");
    expect(selectorBounds.x + selectorBounds.width).toBeLessThanOrEqual(tableBounds.x + 1);
    expect(selectorBounds.y).toBeGreaterThanOrEqual(tableBounds.y - 1);
    await selector.click();
    await expect(displayed.locator('[data-writer-editor-selected="true"]')).toHaveCount(3);
    const targetBounds = await targetCell.boundingBox();
    if (targetBounds === null) throw new Error("Missing padded cell");
    await targetCell.click({ position: { x: targetBounds.width - 3, y: targetBounds.height - 3 } });
    await expect(displayed.locator('[data-writer-editor-selected="true"]')).toHaveCount(0);
    await page.keyboard.insertText("X");
    await expect(lowerEditor).toHaveText("LowerX");
    await expect(upperEditor).toHaveText("Upper");
    await expect(firstEditor).toHaveText("Keep");
    await page.keyboard.press("Control+z");
    await expect(lowerEditor).toHaveText("Lower");
    await selector.click();
    await emptyCell.click({ position: { x: 3, y: 25 } });
    await expect(displayed.locator('[data-writer-editor-selected="true"]')).toHaveCount(0);
    await page.keyboard.insertText("E");
    await expect(emptyEditor).toHaveText("E");
    await page.keyboard.press("Control+z");
    await expect(emptyEditor).toHaveText("");
    await selector.click();
    await displayed.locator("[data-writer-list-marker]").click();
    await expect(displayed.locator('[data-writer-editor-selected="true"]')).toHaveCount(0);
    // Native labels start ruler indent dragging; text-caret placement is not asserted here.
    await expect(firstEditor).toHaveText("Keep");
    await expect(
      page.getByRole("textbox", { name: "Writer document text", exact: true }),
    ).toHaveText("Body neighbor");
  });
