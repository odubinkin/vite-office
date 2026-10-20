/** @fileoverview Verifies actual Chromium creates separate adjacent identical hyperlink owners and edits one without merging its neighbor. */
import { expect, test, type Locator } from "@playwright/test";
/** Places actual DOM selection by native node text offsets. @param editor - Original editable paragraph. @param start - Mark offset. @param end - Point offset. @returns Completion. */
async function select(editor: Locator, start: number, end = start) {
  await editor.focus();
  await editor.evaluate(
    /** Maps literal source offsets through real rendered text nodes. @param element - Actual paragraph. @param offsets - Original mark/point. @returns Nothing. */ (
      element,
      offsets,
    ) => {
      const nodes: Text[] = [];
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n !== null; n = walker.nextNode()) nodes.push(n as Text);
      /** Resolves one actual text endpoint. @param offset - Source offset. @returns DOM owner/index. */ function at(
        offset: number,
      ): [Text, number] {
        for (const node of nodes) {
          if (offset <= node.length) return [node, offset];
          offset -= node.length;
        }
        throw Error("Missing source position");
      }
      const [mark, mi] = at(offsets.start),
        [point, pi] = at(offsets.end);
      window.getSelection()?.setBaseAndExtent(mark, mi, point, pi);
      document.dispatchEvent(new Event("selectionchange"));
    },
    { start, end },
  );
}
/** Applies a hyperlink through the real toolbar dialog. @param editor - Original paragraph. @param start - Selection start. @param end - Selection end. @returns Completion. */
async function add(editor: Locator, start: number, end: number) {
  const page = editor.page();
  await select(editor, start, end);
  await page.getByRole("button", { name: "Hyperlink", exact: true }).click();
  await page.getByLabel("URL").fill("https://example.test/same");
  await page.getByRole("button", { name: "Apply", exact: true }).click();
}
test("Chromium edits one independent identical hyperlink and replays native history", /** Checks genuine UI selection/dialog/owning range. @param fixtures - Browser fixture. @param fixtures.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/writer");
  const editor = page.getByRole("textbox", { name: "Writer document text" });
  await editor.fill("abcdef");
  await add(editor, 0, 3);
  await add(editor, 3, 6);
  await expect(editor).toHaveText("abcdef");
  await select(editor, 1);
  await page.getByRole("menuitem", { name: "Edit", exact: true }).click();
  await page.getByRole("menuitem", { name: "Hyperlink…" }).click();
  await page.getByLabel("URL").fill("https://example.test/changed");
  await page.getByRole("button", { name: "Apply", exact: true }).click();
  await expect(editor.locator('a[href="https://example.test/changed"]')).toHaveText("abc");
  await expect(editor.locator('a[href="https://example.test/same"]')).toHaveText("def");
  for (let i = 0; i < 3; i++) {
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(editor.locator('a[href="https://example.test/changed"]')).toHaveCount(0);
    await expect(editor).toHaveText("abcdef");
    await page.getByRole("button", { name: "Redo", exact: true }).click();
    await expect(editor.locator('a[href="https://example.test/changed"]')).toHaveText("abc");
    await expect(editor.locator('a[href="https://example.test/same"]')).toHaveText("def");
  }
});
