/** @fileoverview Exercises Writer's nested list style dialog through the ordinary Paragraph command. */
import { expect, test } from "@playwright/test";
import { openBrowserMenu } from "../test-support/menu-pointer-e2e";
import { createWriterDocument } from "../src/sw/source/core/doc/doc";
import { applyWriterParagraphList } from "../src/sw/source/core/doc/list";
import { GetNumRuleFromPool } from "../src/sw/source/core/doc/poolfmt-num";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";

test("Writer edits a shared named list style without committing the paragraph draft", /** Checks nested focus, cancel, shared updates and history. @param fixtures - Browser fixtures. @param fixtures.page - Chrome page. @returns Completion. */ async ({
  page,
}) => {
  const document = createWriterDocument();
  const first = document.paragraphs[0];
  if (!first) throw new Error("Body is missing.");
  const second = document.nodes.MakeTextNode();
  GetNumRuleFromPool(document, "Numbering 123");
  for (const [node, id] of [
    [first, "First"],
    [second, "Second"],
  ] as const) {
    node.SetText(id);
    applyWriterParagraphList(node, {
      kind: "numbered",
      styleId: "Numbering 123",
      listId: id,
      level: 0,
    });
  }
  const bytes = await writeOdtDocument(document, { title: "List styles" });
  document.Dispose();
  await page.goto("/writer");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer", exact: true }).click();
  await page.getByLabel("Browse").setInputFiles({
    name: "list-styles.odt",
    mimeType: "application/vnd.oasis.opendocument.text",
    buffer: Buffer.from(bytes),
  });
  const markers = page.locator("[data-writer-list-marker]");
  await expect(markers).toHaveText(["1.", "1."]);
  await page
    .locator("[data-writer-paragraph-id]")
    .filter({ hasText: /^First$/u })
    .click();
  await openBrowserMenu(page, "Format");
  await page.getByRole("menuitem", { name: "Paragraph…", exact: true }).click();
  const paragraph = page.getByRole("dialog", { name: "Paragraph", exact: true });
  await paragraph.getByRole("tab", { name: "Outline & List", exact: true }).click();
  const edit = paragraph.getByRole("button", { name: "Edit Style", exact: true });
  const child = page.getByRole("dialog", { name: "List Style: Numbering 123", exact: true });
  await edit.click();
  await expect(child.getByRole("tab", { name: "General" })).toBeFocused();
  await child.getByRole("tab", { name: "Customize" }).click();
  await child.getByRole("spinbutton", { name: "Start at" }).fill("9");
  await child.press("Escape");
  await expect(edit).toBeFocused();
  await expect(markers).toHaveText(["1.", "1."]);

  await edit.click();
  await child.getByRole("tab", { name: "Ordered", exact: true }).click();
  await child.getByRole("button", { name: "I.", exact: true }).click();
  await child.getByRole("tab", { name: "Customize" }).click();
  await child.getByRole("spinbutton", { name: "Start at" }).fill("8");
  await child.getByRole("button", { name: "Apply", exact: true }).click();
  await expect(child).toBeVisible();
  await expect(markers).toHaveText(["VIII.", "VIII."]);
  await child.getByRole("button", { name: "OK", exact: true }).click();
  await expect(edit).toBeFocused();
  await paragraph.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(markers).toHaveText(["1.", "1."]);
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(markers).toHaveText(["VIII.", "VIII."]);
});
