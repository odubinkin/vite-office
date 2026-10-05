/** @fileoverview Checks production native list context transitions, current level menus and text-shell history. */
import { expect, test } from "@playwright/test";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { SwPosition } from "../src/sw/source/core/crsr/pam";
import { createWriterNumFormat } from "../src/sw/source/core/doc/number";
import { SwDocShell } from "../src/sw/source/uibase/app/docsh";
import { SwWrtShell } from "../src/sw/source/uibase/wrtsh/wrtsh1";
import { createDocument } from "../src/sfx2/source/doc/objsh";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
for (const width of [1280, 390])
  test(`Writer native list context and point state width=${width}`, /** Checks ordinary production UI without runtime injection. @param fixtures - Browser fixtures. @param fixtures.page - Real production page. @returns Completion. */ async ({
    page,
  }) => {
    const doc = new SwDoc(),
      first = doc.paragraphs[0],
      second = doc.nodes.MakeTextNode("Maximum"),
      none = doc.nodes.MakeTextNode("No label"),
      plain = doc.nodes.MakeTextNode("Plain");
    if (first === undefined) throw new Error("Missing context fixture");
    first.SetText("First");
    const metadata = createDocument({
        id: "native-list-context",
        suiteId: "writer",
        title: "Context",
      }),
      shell = new SwWrtShell(new SwDocShell(doc, metadata));
    for (const [node, level] of [
      [first, 4],
      [second, 9],
    ] as const) {
      const point = new SwPosition(node, 0);
      try {
        shell.SetCursor(point);
      } finally {
        point.Dispose();
      }
      shell.SetParagraphListKind("numbered");
      node.SetAttrListLevel(level);
    }
    const point = new SwPosition(none, 0);
    try {
      shell.SetCursor(point);
    } finally {
      point.Dispose();
    }
    const rule = doc.GetDocumentListsManager().CreateAutomaticNumRule("numbered");
    rule.Set(0, createWriterNumFormat("numbered", "", { numberingType: "none" }));
    shell.SetCurNumRule(rule, false, "", true);
    const table = doc.nodes.MakeTableNode("Context", {}, plain);
    table.AddColumnWidth(2400);
    const cell = doc.nodes.AppendTableRow(table, 1).GetTabBoxes()[0]?.GetParagraphs()[0];
    if (cell === undefined) throw new Error("Missing context neighbor");
    cell.SetText("Neighbor");
    const bytes = writeOdtDocument(doc, metadata);
    shell.Close();
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/writer");
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("tab", { name: "On computer" }).click();
    await page.getByLabel("Browse").setInputFiles({
      buffer: Buffer.from(bytes),
      mimeType: "application/vnd.oasis.opendocument.text",
      name: "native-list-context.odt",
    });
    await expect(page.getByRole("dialog", { name: "Open", exact: true })).toBeHidden();
    const editors = page.getByRole("textbox", { name: "Writer document text", exact: true }),
      firstEditor = editors.nth(0),
      maximumEditor = page.getByRole("textbox", { name: "Writer paragraph 2", exact: true }),
      plainEditor = page.getByRole("textbox", { name: "Writer paragraph 4", exact: true });
    await expect(firstEditor).toHaveAttribute("data-list-level", "4");
    await expect(maximumEditor).toHaveAttribute("data-list-level", "9");
    /** Opens the real submenu through visible controls. @returns Completion. */
    async function menu(): Promise<void> {
      await page.getByRole("button", { name: "Format", exact: true }).click();
      await page.getByRole("menuitem", { name: "Lists", exact: true }).hover();
    }
    /** Closes the actual menu stack. @returns Completion. */
    async function close(): Promise<void> {
      await page.keyboard.press("Escape");
      await page.keyboard.press("Escape");
    }
    for (const editor of [plainEditor]) {
      await editor.click({ position: { x: 10, y: 8 } });
      await menu();
      await expect(page.getByRole("menuitem", { name: "Demote Outline Level" })).toBeDisabled();
      await expect(page.getByRole("menuitem", { name: "Promote Outline Level" })).toBeDisabled();
      await close();
    }
    await maximumEditor.click({ position: { x: 10, y: 8 } });
    await menu();
    await expect(page.getByRole("menuitem", { name: "Demote Outline Level" })).toBeDisabled();
    await expect(page.getByRole("menuitem", { name: "Promote Outline Level" })).toBeEnabled();
    await close();
    await firstEditor.click({ position: { x: 10, y: 8 } });
    await menu();
    await expect(page.getByRole("menuitem", { name: "Demote Outline Level" })).toBeEnabled();
    await page.getByRole("menuitem", { name: "Demote Outline Level" }).click();
    await expect(firstEditor).toHaveAttribute("data-list-level", "5");
    await firstEditor.click({ position: { x: 10, y: 8 } });
    await page.keyboard.press("Control+z");
    await expect(firstEditor).toHaveAttribute("data-list-level", "4");
    await menu();
    await page.getByRole("menuitemradio", { name: "No List" }).click();
    await expect(firstEditor).toHaveAttribute("data-list-kind", "none");
    await menu();
    await expect(page.getByRole("menuitem", { name: "Demote Outline Level" })).toBeDisabled();
    await close();
    await firstEditor.click({ position: { x: 10, y: 8 } });
    await page.keyboard.press("Control+z");
    await expect(firstEditor).toHaveAttribute("data-list-level", "4");
    await menu();
    await expect(page.getByRole("menuitem", { name: "Demote Outline Level" })).toBeEnabled();
    await close();
    await firstEditor.click({ position: { x: 10, y: 8 } });
    await page.keyboard.press("Control+Home");
    await page.keyboard.insertText("X");
    await expect(firstEditor).toHaveText("XFirst");
    await page.keyboard.press("Control+z");
    await expect(firstEditor).toHaveText("First");
    await expect(maximumEditor).toHaveText("Maximum");
    await expect(page.getByLabel("Row 1 column 1 paragraph 1")).toHaveText("Neighbor");
  });
