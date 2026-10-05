/** @fileoverview Checks production heading Tab native styles, editing/history and real ODT persistence at two widths. */
import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { SwDocShell } from "../src/sw/source/uibase/app/docsh";
import { createDocument } from "../src/sfx2/source/doc/objsh";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
for (const width of [1280, 390])
  test(`Writer native heading Tab retains styles and history width=${width}`, /** Checks ordinary production UI without model injection. @param fixtures - Browser fixtures. @param fixtures.page - Page. @param fixtures.browser - Browser. @returns Completion. */ async ({
    page,
    browser,
  }) => {
    const doc = new SwDoc(),
      body = doc.paragraphs[0];
    if (body === undefined) throw new Error("Missing outline fixture");
    body.SetText("Heading");
    body.ChgFormatColl(doc.GetTextFormatColl("heading-2"));
    const table = doc.nodes.MakeTableNode("Outline", {}, body);
    table.AddColumnWidth(2400);
    const cell = doc.nodes.AppendTableRow(table, 1).GetTabBoxes()[0]?.GetParagraphs()[0];
    if (cell === undefined) throw new Error("Missing neighbor");
    cell.SetText("Neighbor");
    const metadata = createDocument({ id: "outline-tab", suiteId: "writer", title: "Outline Tab" }),
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
      name: "outline-tab.odt",
    });
    await expect(page.getByRole("dialog", { name: "Open", exact: true })).toBeHidden();
    const heading = page.getByRole("textbox", { name: "Writer document text", exact: true });
    await expect(heading).toHaveAttribute("data-style", "heading-2");
    await heading.click({ position: { x: 10, y: 8 } });
    await page.keyboard.press("Control+Home");
    await page.keyboard.press("Tab");
    await expect(heading).toHaveAttribute("data-style", "heading-3");
    await expect(heading).toHaveText("Heading");
    await page.keyboard.press("Shift+Tab");
    await expect(heading).toHaveAttribute("data-style", "heading-2");
    await page.keyboard.press("Control+z");
    await expect(heading).toHaveAttribute("data-style", "heading-3");
    await page.keyboard.press("Control+y");
    await expect(heading).toHaveAttribute("data-style", "heading-2");
    await page.keyboard.press("Tab");
    await expect(heading).toHaveAttribute("data-style", "heading-3");
    await page.keyboard.insertText("X");
    await expect(heading).toHaveText("XHeading");
    await page.keyboard.press("Control+z");
    await expect(heading).toHaveText("Heading");
    await expect(heading).toHaveAttribute("data-style", "heading-3");
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "File", exact: true }).click();
    await page.getByRole("menuitem", { name: "Export…" }).click();
    await page.getByRole("button", { name: "Download ODT" }).click();
    const path = await (await download).path();
    if (path === null) throw new Error("Missing outline export");
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      baseURL: "http://127.0.0.1:4173",
    });
    try {
      const reopened = await context.newPage();
      await reopened.goto("/writer");
      await reopened.getByRole("button", { name: "Open", exact: true }).click();
      await reopened.getByRole("tab", { name: "On computer" }).click();
      await reopened.getByLabel("Browse").setInputFiles({
        buffer: await readFile(path),
        mimeType: "application/vnd.oasis.opendocument.text",
        name: "reopened-outline.odt",
      });
      await expect(reopened.getByRole("dialog", { name: "Open", exact: true })).toBeHidden();
      const editor = reopened.getByRole("textbox", { name: "Writer document text", exact: true });
      await expect(editor).toHaveText("Heading");
      await expect(editor).toHaveAttribute("data-style", "heading-3");
      await editor.click({ position: { x: 10, y: 8 } });
      await reopened.keyboard.press("Control+Home");
      await reopened.keyboard.press("Shift+Tab");
      await expect(editor).toHaveAttribute("data-style", "heading-2");
      await reopened.keyboard.insertText("Y");
      await expect(editor).toHaveText("YHeading");
      await expect(reopened.getByLabel("Row 1 column 1 paragraph 1", { exact: true })).toHaveText(
        "Neighbor",
      );
    } finally {
      await context.close();
    }
  });

for (const width of [1280, 390])
  test(`Writer native tenth heading boundary width=${width}`, /** Checks corrected native tenth-level target in production. @param fixtures - Browser fixtures. @param fixtures.page - Actual production page. @returns Completion. */ async ({
    page,
  }) => {
    const doc = new SwDoc(),
      body = doc.paragraphs[0];
    if (body === undefined) throw new Error("Missing tenth heading");
    body.SetText("Tenth boundary");
    body.ChgFormatColl(doc.GetTextFormatColl("heading-9"));
    const metadata = createDocument({
        id: "tenth-outline",
        suiteId: "writer",
        title: "Tenth outline",
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
      name: "tenth-outline.odt",
    });
    await expect(page.getByRole("dialog", { name: "Open", exact: true })).toBeHidden();
    const editor = page.getByRole("textbox", { name: "Writer document text", exact: true });
    await expect(editor).toHaveAttribute("data-style", "heading-9");
    await editor.click({ position: { x: 10, y: 8 } });
    await page.keyboard.press("Control+Home");
    await page.keyboard.press("Tab");
    await expect(editor).toHaveAttribute("data-style", "heading-10");
    await expect(editor).toHaveText("Tenth boundary");
    await page.keyboard.press("Tab");
    await expect(editor).toHaveText("\tTenth boundary");
    await expect(editor).toHaveAttribute("data-style", "heading-10");
    await page.keyboard.press("Control+z");
    await expect(editor).toHaveText("Tenth boundary");
    await page.keyboard.press("Shift+Tab");
    await expect(editor).toHaveAttribute("data-style", "heading-9");
    await page.keyboard.press("Control+z");
    await expect(editor).toHaveAttribute("data-style", "heading-10");
    await page.keyboard.press("Control+y");
    await expect(editor).toHaveAttribute("data-style", "heading-9");
  });
