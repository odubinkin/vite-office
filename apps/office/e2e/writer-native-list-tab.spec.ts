/** @fileoverview Checks production ordinary paragraph/list/cell Tab priority and native history at two widths. */
import { expect, test } from "@playwright/test";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { SwDocShell } from "../src/sw/source/uibase/app/docsh";
import { SwWrtShell } from "../src/sw/source/uibase/wrtsh/wrtsh1";
import { SwPosition } from "../src/sw/source/core/crsr/pam";
import { createDocument } from "../src/sfx2/source/doc/objsh";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";

/** Requires a native fixture owner. @param value - Optional owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing native Tab fixture");
  return value;
}
for (const width of [1280, 390])
  test(`Writer body list and table Tab retain editing focus width=${width}`, /** Checks actual keys against the ordinary production Open path. @param fixtures - Browser fixtures. @param fixtures.page - Page. @returns Completion. */ async ({
    page,
  }) => {
    const doc = new SwDoc(),
      body = required(doc.paragraphs[0]),
      metadata = createDocument({ id: "native-tab", suiteId: "writer", title: "Native Tab" }),
      docShell = new SwDocShell(doc, metadata),
      shell = new SwWrtShell(docShell),
      position = new SwPosition(body, 0);
    body.SetText("body");
    try {
      shell.SetCursor(position);
    } finally {
      position.Dispose();
    }
    shell.SetParagraphListKind("numbered");
    body.SetAttrListLevel(2);
    const table = doc.nodes.MakeTableNode("Tab", {}, body);
    table.AddColumnWidth(2400);
    table.AddColumnWidth(2400);
    const row = doc.nodes.AppendTableRow(table, 2);
    required(required(row.GetTabBoxes()[0]).GetParagraphs()[0]).SetText("cell");
    required(required(row.GetTabBoxes()[1]).GetParagraphs()[0]).SetText("neighbor");
    const bytes = writeOdtDocument(doc, metadata);
    shell.Close();
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/writer");
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("tab", { name: "On computer" }).click();
    await page.getByLabel("Browse").setInputFiles({
      buffer: Buffer.from(bytes),
      mimeType: "application/vnd.oasis.opendocument.text",
      name: "native-tab.odt",
    });
    await expect(page.getByRole("dialog", { name: "Open", exact: true })).toBeHidden();
    const bodyEditor = page.getByRole("textbox", { name: "Writer document text", exact: true }),
      paragraph = bodyEditor,
      cell = page.getByRole("textbox", { name: "Row 1 column 1 paragraph 1", exact: true }),
      neighbor = page.getByRole("textbox", { name: "Row 1 column 2 paragraph 1", exact: true });
    await expect(bodyEditor).toHaveText("body");
    await expect(paragraph).toHaveAttribute("data-list-level", "2");
    await paragraph.click({ position: { x: 10, y: 8 } });
    await page.keyboard.press("Control+Home");
    await page.keyboard.press("Tab");
    await expect(paragraph).toHaveAttribute("data-list-level", "3");
    await expect(bodyEditor).toHaveText("body");
    await page.keyboard.press("Shift+Tab");
    await expect(paragraph).toHaveAttribute("data-list-level", "2");
    await page.keyboard.press("Control+z");
    await expect(paragraph).toHaveAttribute("data-list-level", "3");
    await page.keyboard.press("Control+y");
    await expect(paragraph).toHaveAttribute("data-list-level", "2");
    await page.keyboard.press("Control+Home");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Tab");
    await expect(paragraph).toHaveText("bo\tdy");
    await expect(paragraph).toHaveAttribute("data-list-level", "2");
    await page.keyboard.insertText("X");
    await expect(paragraph).toHaveText("bo\tXdy");
    await page.keyboard.press("Control+z");
    await expect(paragraph).toHaveText("bo\tdy");
    await page.keyboard.press("Control+z");
    await expect(paragraph).toHaveText("body");
    await cell.click({ position: { x: 10, y: 8 } });
    await page.keyboard.press("Control+End");
    await page.keyboard.press("Tab");
    await page.keyboard.insertText("Z");
    await expect(neighbor).toHaveText("Zneighbor");
    await expect(cell).toHaveText("cell");
    await expect(paragraph).toHaveText("body");
    await page.keyboard.press("Control+z");
    await expect(neighbor).toHaveText("neighbor");
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.insertText("Q");
    await expect(cell).toHaveText("Qcell");
    await expect(paragraph).toHaveAttribute("data-list-level", "2");
  });
