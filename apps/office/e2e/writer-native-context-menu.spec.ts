/** @fileoverview Verifies real Writer native context menu selection, frame resources, clicked commands and history. */
import { expect, test, type Locator } from "@playwright/test";
/** Places an actual direction-preserving document selection. @param paragraph - Current original paragraph. @param point - Moving offset. @param mark - Fixed offset. @returns Completion. */
async function select(paragraph: Locator, point: number, mark = point): Promise<void> {
  await paragraph.focus();
  await paragraph.evaluate(
    /** Uses original rendered text endpoints without a production test adapter. @param element - Actual paragraph. @param coordinates - Moving/fixed offsets. @returns Nothing. */ (
      element,
      coordinates,
    ) => {
      const nodes: Text[] = [],
        walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n !== null; n = walker.nextNode()) nodes.push(n as Text);
      /** Resolves one actual UTF-16 offset. @param offset - Source offset. @returns Actual text endpoint. */ function at(
        offset: number,
      ): [Text, number] {
        for (const node of nodes) {
          if (offset <= node.length) return [node, offset];
          offset -= node.length;
        }
        throw Error("Missing native endpoint");
      }
      const [a, ai] = at(coordinates.mark),
        [b, bi] = at(coordinates.point);
      window.getSelection()?.setBaseAndExtent(a, ai, b, bi);
      document.dispatchEvent(new Event("selectionchange"));
    },
    { point, mark },
  );
}
test("Writer native context menu removes actual mixed hyperlinks with one undo and redo", /** Exercises actual right-click resource and native selected Remove. @param fixtures - Browser fixtures. @param fixtures.page - Actual page. @returns Completion. */ async ({
  page,
}) => {
  const errors: string[] = [];
  page.on(
    "pageerror",
    /** Records actual runtime failures. @param error - Browser error. @returns Nothing. */ (
      error,
    ) => {
      errors.push(error.message);
    },
  );
  await page.goto("/writer");
  const editor = page.getByRole("textbox", { name: "Writer document text" });
  await editor.fill("abcdefgh");
  for (const [start, end, url] of [
    [0, 3, "https://example.test/a"],
    [5, 8, "https://example.test/b"],
  ] as const) {
    await select(editor, end, start);
    await page.getByRole("button", { name: "Hyperlink", exact: true }).click();
    await page.getByLabel("URL").fill(url);
    await page.getByRole("button", { name: "Apply", exact: true }).click();
  }
  await select(editor, 8, 0);
  await editor.locator('a[href="https://example.test/a"]').click({ button: "right" });
  const menu = page.getByRole("menu", { name: "Writer context menu" });
  await expect(menu).toBeFocused();
  await expect(menu.getByRole("menuitem", { name: "Edit Hyperlink…" })).toBeDisabled();
  await menu.getByRole("menuitem", { name: "Remove Hyperlink", exact: true }).click();
  await expect(menu).toHaveCount(0);
  await expect(editor.locator("a[data-writer-hyperlink]")).toHaveCount(0);
  await expect(editor).toHaveText("abcdefgh");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(editor.locator("a[data-writer-hyperlink]")).toHaveCount(2);
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(editor.locator("a[data-writer-hyperlink]")).toHaveCount(0);
  await expect(editor).toHaveText("abcdefgh");
  expect(errors).toEqual([]);
});
test("Writer native context menu follows the actual table shell and inserts a native row", /** Exercises real table resource ownership and native table history. @param fixtures - Browser fixtures. @param fixtures.page - Actual page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/writer");
  await page.getByRole("button", { name: "Insert Table", exact: true }).click();
  await page.getByRole("button", { name: "2 columns, 2 rows", exact: true }).click();
  await page.keyboard.type("Cell");
  const table = page.getByRole("table", { name: "Table1" }),
    cell = page.getByLabel("Row 1 column 1 paragraph 1", { exact: true });
  await cell.click({ button: "right" });
  const menu = page.getByRole("menu", { name: "Writer context menu" });
  await menu.getByRole("menuitem", { name: "Insert", exact: true }).hover();
  await page.getByRole("menuitem", { name: "Insert Rows Above", exact: true }).click();
  await expect(menu).toHaveCount(0);
  await expect(table.getByRole("row")).toHaveCount(3);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(table.getByRole("row")).toHaveCount(2);
  await expect(cell).toHaveText("Cell");
});
test("Writer native context menu keyboard cancellation retains the reversed original range", /** Checks actual keyboard input, saved focus and selected text editing. @param fixtures - Browser fixtures. @param fixtures.page - Actual page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/writer");
  const editor = page.getByRole("textbox", { name: "Writer document text" });
  await editor.fill("abcdefgh");
  await select(editor, 2, 6);
  await editor.press("Shift+F10");
  const menu = page.getByRole("menu", { name: "Writer context menu" });
  await expect(menu).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Space");
  await expect(menu).toBeVisible();
  await expect(editor).toHaveText("abcdefgh");
  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
  await expect(editor).toBeFocused();
  await editor.press("Backspace");
  await expect(editor).toHaveText("abgh");
  await editor.press("Control+z");
  await expect(editor).toHaveText("abcdefgh");
});
