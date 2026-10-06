/** @fileoverview Checks freshly exported native NONE numbering through ordinary production Open and native history. */
import { expect, test } from "@playwright/test";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { SwPosition } from "../src/sw/source/core/crsr/pam";
import { createWriterNumFormat } from "../src/sw/source/core/doc/number";
import { SwDocShell } from "../src/sw/source/uibase/app/docsh";
import { SwWrtShell } from "../src/sw/source/uibase/wrtsh/wrtsh1";
import { createDocument } from "../src/sfx2/source/doc/objsh";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
for (const width of [1280, 390])
  test(`Writer native NONE numbering roundtrip width=${width}`, /** Checks ordinary production UI without runtime injection. @param fixtures - Browser fixtures. @param fixtures.page - Real production page. @returns Completion. */ async ({
    page,
  }) => {
    const doc = new SwDoc(),
      first = doc.paragraphs[0],
      second = doc.nodes.MakeTextNode("Arabic"),
      plain = doc.nodes.MakeTextNode("Neighbor");
    if (first === undefined) throw new Error("Missing NONE fixture");
    first.SetText("No label");
    const metadata = createDocument({ id: "native-none", suiteId: "writer", title: "NONE" }),
      shell = new SwWrtShell(new SwDocShell(doc, metadata));
    for (const [node, none] of [
      [first, true],
      [second, false],
    ] as const) {
      const point = new SwPosition(node, 0);
      try {
        shell.SetCursor(point);
      } finally {
        point.Dispose();
      }
      const rule = doc.GetDocumentListsManager().CreateAutomaticNumRule("numbered");
      rule.Set(
        0,
        createWriterNumFormat("numbered", "", {
          numberingType: none ? "none" : "arabic",
          suffix: "",
        }),
      );
      shell.SetCurNumRule(rule, false, "", true);
    }
    if (plain.GetText() !== "Neighbor") throw new Error("Missing neighbor");
    const bytes = writeOdtDocument(doc, metadata);
    shell.Close();
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/writer");
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("tab", { name: "On computer" }).click();
    await page.getByLabel("Browse").setInputFiles({
      buffer: Buffer.from(bytes),
      mimeType: "application/vnd.oasis.opendocument.text",
      name: "native-none-numbering.odt",
    });
    await expect(page.getByRole("dialog", { name: "Open", exact: true })).toBeHidden();
    const firstEditor = page.getByRole("textbox", { name: "Writer document text", exact: true }),
      arabicEditor = page.getByRole("textbox", { name: "Writer paragraph 2", exact: true }),
      plainEditor = page.getByRole("textbox", { name: "Writer paragraph 3", exact: true });
    await expect(firstEditor).toHaveAttribute("data-list-kind", "numbered");
    await expect(firstEditor).toHaveAttribute("data-list-marker", "");
    await expect(arabicEditor).toHaveAttribute("data-list-marker", "1");
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
    await firstEditor.click({ position: { x: 10, y: 8 } });
    await menu();
    await expect(page.getByRole("menuitem", { name: "Demote Outline Level" })).toBeDisabled();
    await expect(page.getByRole("menuitem", { name: "Promote Outline Level" })).toBeDisabled();
    await close();
    await firstEditor.click({ position: { x: 10, y: 8 } });
    await page.keyboard.press("Control+Home");
    await page.keyboard.insertText("X");
    await expect(firstEditor).toHaveText("XNo label");
    await expect(firstEditor).toHaveAttribute("data-list-marker", "");
    await page.keyboard.press("Control+z");
    await expect(firstEditor).toHaveText("No label");
    await menu();
    await page.getByRole("menuitemradio", { name: "No List" }).click();
    await expect(firstEditor).toHaveAttribute("data-list-kind", "none");
    await firstEditor.click({ position: { x: 10, y: 8 } });
    await page.keyboard.press("Control+z");
    await expect(firstEditor).toHaveAttribute("data-list-kind", "numbered");
    await expect(firstEditor).toHaveAttribute("data-list-marker", "");
    await arabicEditor.click({ position: { x: 10, y: 8 } });
    await menu();
    await expect(page.getByRole("menuitem", { name: "Demote Outline Level" })).toBeEnabled();
    await close();
    await expect(arabicEditor).toHaveText("Arabic");
    await expect(arabicEditor).toHaveAttribute("data-list-marker", "1");
    await expect(plainEditor).toHaveText("Neighbor");
  });
