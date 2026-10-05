/** @fileoverview Checks production ODT cell lists, native continuation/restarts and real editing/history. */
import { expect, test } from "@playwright/test";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { applyWriterParagraphList } from "../src/sw/source/core/doc/list";
import { SwDocShell } from "../src/sw/source/uibase/app/docsh";
import { createDocument } from "../src/sfx2/source/doc/objsh";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";

/** Requires a real fixture owner instead of silently accepting a missing native node. @param value - Actual fixture value. @returns Valid owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing actual native fixture owner");
  return value;
}

test("Writer imported restarted table row Add to List preserves both starts and atomic selection", /** Checks real ODT imported cell restart values, native continuation and atomic history. @param fixtures - Browser fixtures. @param fixtures.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const doc = new SwDoc(),
    body = doc.paragraphs[0];
  if (body === undefined) throw new Error("Missing native body");
  body.SetText("Body");
  const table = doc.nodes.MakeTableNode("RestartRow", {}, body);
  table.AddColumnWidth(2000);
  table.AddColumnWidth(2000);
  const top = doc.nodes.AppendTableRow(table, 2),
    row = doc.nodes.AppendTableRow(table, 2),
    previous = top.GetTabBoxes()[1]?.GetParagraphs()[0],
    neighbor = top.GetTabBoxes()[0]?.GetParagraphs()[0],
    firstNode = row.GetTabBoxes()[0]?.GetParagraphs()[0],
    secondNode = row.GetTabBoxes()[1]?.GetParagraphs()[0];
  if (
    previous === undefined ||
    neighbor === undefined ||
    firstNode === undefined ||
    secondNode === undefined
  )
    throw new Error("Missing native table boxes");
  previous.SetText("Previous");
  neighbor.SetText("Neighbor");
  firstNode.SetText("First");
  secondNode.SetText("Second");
  applyWriterParagraphList(previous, { kind: "numbered", styleId: "Prior", listId: "prior" });
  applyWriterParagraphList(firstNode, {
    kind: "numbered",
    styleId: "Other",
    listId: "other",
    restart: true,
    startValue: 7,
  });
  applyWriterParagraphList(secondNode, {
    kind: "numbered",
    styleId: "Other",
    listId: "other",
    restart: true,
    startValue: 11,
  });
  const metadata = createDocument({ id: "restart-row", suiteId: "writer", title: "Restart row" }),
    shell = new SwDocShell(doc, metadata),
    bytes = writeOdtDocument(doc, metadata);
  shell.Close();
  await page.goto("/writer");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: Buffer.from(bytes),
    mimeType: "application/vnd.oasis.opendocument.text",
    name: "restart-row.odt",
  });
  const first = page.getByRole("textbox", { name: "Row 2 column 1 paragraph 1", exact: true }),
    second = page.getByRole("textbox", { name: "Row 2 column 2 paragraph 1", exact: true }),
    firstId = await first.getAttribute("data-writer-paragraph-id"),
    secondId = await second.getAttribute("data-writer-paragraph-id"),
    firstMarker = page.locator('[data-writer-list-marker="' + firstId + '"]'),
    secondMarker = page.locator('[data-writer-list-marker="' + secondId + '"]'),
    rendered = page.getByRole("table", { name: "RestartRow" });
  await expect(firstMarker).toHaveText("7.");
  await expect(secondMarker).toHaveText("11.");
  await page.getByRole("button", { name: "Select row 2 in RestartRow" }).click();
  await expect(rendered.locator('[data-writer-editor-selected="true"]')).toHaveCount(2);
  await page.getByRole("button", { name: "Format", exact: true }).click();
  await page.getByRole("menuitem", { name: "Lists", exact: true }).click();
  await page.getByRole("menuitem", { name: "Add to List", exact: true }).click();
  await expect(firstMarker).toHaveText("2.");
  await expect(secondMarker).toHaveText("3.");
  await expect(rendered.locator('[data-writer-editor-selected="true"]')).toHaveCount(2);
  for (let cycle = 0; cycle < 3; cycle++) {
    await page.keyboard.press("Control+z");
    await expect(firstMarker).toHaveText("7.");
    await expect(secondMarker).toHaveText("11.");
    await expect(rendered.locator('[data-writer-editor-selected="true"]')).toHaveCount(2);
    await page.keyboard.press("Control+y");
    await expect(firstMarker).toHaveText("2.");
    await expect(secondMarker).toHaveText("3.");
    await expect(rendered.locator('[data-writer-editor-selected="true"]')).toHaveCount(2);
  }
  await expect(first).toHaveText("First");
  await expect(second).toHaveText("Second");
  await expect(
    page.getByRole("textbox", { name: "Row 1 column 1 paragraph 1", exact: true }),
  ).toHaveText("Neighbor");
  await expect(
    page.getByRole("textbox", { name: "Row 1 column 2 paragraph 1", exact: true }),
  ).toHaveText("Previous");
});

test("Writer imported table list Enter edits native cell paragraphs and history", /** Verifies actual cell list Enter, markers and UndoRedo after production Worker import. @param fixtures - Browser fixture. @param fixtures.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const doc = new SwDoc(),
    body = required(doc.paragraphs[0]);
  body.SetText("Body");
  const table = doc.nodes.MakeTableNode("Editing", {}, body);
  table.AddColumnWidth(2000);
  table.AddColumnWidth(2000);
  const row = doc.nodes.AppendTableRow(table, 2),
    node = required(required(row.GetTabBoxes()[0]).GetParagraphs()[0]),
    neighbor = required(required(row.GetTabBoxes()[1]).GetParagraphs()[0]);
  node.SetText("First");
  neighbor.SetText("Neighbor");
  applyWriterParagraphList(node, {
    kind: "numbered",
    styleId: "Cell",
    listId: "cell",
    restart: true,
    startValue: 5,
  });
  const metadata = createDocument({ id: "cell-enter", suiteId: "writer", title: "Cell Enter" }),
    shell = new SwDocShell(doc, metadata),
    bytes = writeOdtDocument(doc, metadata);
  shell.Close();
  await page.goto("/writer");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: Buffer.from(bytes),
    mimeType: "application/vnd.oasis.opendocument.text",
    name: "cell-enter.odt",
  });
  const first = page.getByRole("textbox", { name: "Row 1 column 1 paragraph 1", exact: true }),
    next = page.getByRole("textbox", { name: "Row 1 column 1 paragraph 2", exact: true }),
    other = page.getByRole("textbox", { name: "Row 1 column 2 paragraph 1", exact: true });
  await expect(first).toHaveText("First");
  const id = await first.getAttribute("data-writer-paragraph-id");
  await expect(page.locator('[data-writer-list-marker="' + id + '"]')).toHaveText("5.");
  await first.click();
  await first.press("End");
  await first.press("Enter");
  await expect(next).toHaveText("");
  await expect(first).toHaveText("First");
  await expect(next).toHaveAttribute("data-list-kind", "numbered");
  const nextId = await next.getAttribute("data-writer-paragraph-id"),
    marker = page.locator('[data-writer-list-marker="' + nextId + '"]');
  await expect(marker).toHaveText("6.");
  await page.keyboard.insertText("Child");
  await expect(next).toHaveText("Child");
  await next.press("Control+z");
  await expect(next).toHaveText("");
  await page.keyboard.press("Control+z");
  await expect(next).toHaveCount(0);
  await expect(first).toHaveText("First");
  await page.keyboard.press("Control+y");
  await expect(next).toHaveText("");
  await expect(marker).toHaveText("6.");
  await page.keyboard.press("Control+y");
  await expect(next).toHaveText("Child");
  await expect(other).toHaveText("Neighbor");
  await expect(other).toHaveAttribute("data-list-kind", "none");
});
