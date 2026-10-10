/** @fileoverview Checks actual Chromium frame reformat, body/cell editing, history and document replacement. */
import { expect, test, type Page } from "@playwright/test";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
/** Opens a local ODT fixture through the real file dialog. @param page - Actual browser. @param bytes - Local document. @returns Completion. */
async function open(page: Page, bytes: Uint8Array): Promise<void> {
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: Buffer.from(bytes),
    mimeType: "application/vnd.oasis.opendocument.text",
    name: "owner.odt",
  });
}
test("native body/cell geometry survives reformat and history before document replacement", /** Checks actual physical pages and continued editing through current original owners. @param fixtures - Browser fixtures. @param fixtures.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const doc = new SwDoc(),
    body = doc.paragraphs[0],
    table = doc.nodes.MakeTableNode("Owner"),
    cell = doc.nodes.AppendTableRow(table, 1).GetTabBoxes()[0]?.GetParagraphs()[0];
  if (body === undefined || cell === undefined) throw Error("Missing native original text");
  body.SetText("BodyOwner");
  cell.SetText("CellOwner");
  table.AddColumnWidth(6000);
  for (let i = 0; i < 12; i++)
    doc.nodes.MakeTextNode(("Physical page content " + i + " ").repeat(80));
  const bytes = writeOdtDocument(doc, { title: "Owner" });
  doc.Dispose();
  await page.goto("/writer");
  await open(page, bytes);
  await expect
    .poll(
      /** Reads actual formatted pages. @returns Page count. */ () =>
        page.locator("[data-writer-page]").count(),
    )
    .toBeGreaterThan(1);
  const toolbar = page.getByRole("toolbar", { name: "Writer formatting toolbar" }),
    undo = page.getByRole("button", { name: "Undo", exact: true }),
    redo = page.getByRole("button", { name: "Redo", exact: true });
  for (const text of ["BodyOwner", "CellOwner"]) {
    const editor = page.locator("[data-writer-paragraph-id]").filter({ hasText: text });
    await expect(editor).toHaveText(text);
    await editor.click();
    await editor.press("End");
    await page.keyboard.type("X");
    await expect(editor).toHaveText(text + "X");
    await undo.click();
    await expect(editor).toHaveText(text);
    await redo.click();
    await expect(editor).toHaveText(text + "X");
    await toolbar.getByRole("button", { name: "Increase", exact: true }).click();
    await expect(editor).toHaveText(text + "X");
    await undo.click();
    await editor.click();
    await editor.press("Home");
    await page.keyboard.type("Y");
    await expect(editor).toHaveText("Y" + text + "X");
    await undo.click();
    await expect(editor).toHaveText(text + "X");
  }
  const replacement = new SwDoc(),
    target = replacement.paragraphs[0];
  if (target === undefined) throw Error("Missing replacement");
  target.SetText("ReplacementOwner");
  const replacementBytes = writeOdtDocument(replacement, { title: "Replacement" });
  replacement.Dispose();
  await open(page, replacementBytes);
  const editor = page.locator("[data-writer-paragraph-id]").filter({ hasText: "ReplacementOwner" });
  await expect(editor).toHaveText("ReplacementOwner");
  await expect(page.locator("[data-writer-page]")).toHaveCount(1);
  await editor.click();
  await editor.press("Home");
  await page.keyboard.type("Z");
  await expect(editor).toHaveText("ZReplacementOwner");
  await undo.click();
  await expect(editor).toHaveText("ReplacementOwner");
});
