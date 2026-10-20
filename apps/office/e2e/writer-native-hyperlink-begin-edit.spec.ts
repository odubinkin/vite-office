/** @fileoverview Verifies actual Chromium begins hyperlink editing from the original link start and retains native cancellation selection. */
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
test("Chromium edits from the original link beginning and keeps selection on cancel", /** Checks real browser native command admission and cancellation. @param fixtures - Browser fixture. @param fixtures.page - Actual page. @returns Completion. */ async ({
  page,
}) => {
  const errors: string[] = [];
  page.on(
    "pageerror",
    /** Records real runtime page errors. @param error - Actual browser error. @returns Nothing. */ (
      error,
    ) => {
      errors.push(error.message);
    },
  );
  await page.goto("/writer");
  const editor = page.getByRole("textbox", { name: "Writer document text" });
  await editor.fill("xxaaabbb");
  await add(editor, 2, 5);
  await add(editor, 5, 8);
  await select(editor, 5);
  await page.getByRole("menuitem", { name: "Edit", exact: true }).click();
  const edit = page.getByRole("menuitem", { name: "Hyperlink…" });
  await expect(edit).toBeEnabled();
  await edit.click();
  await expect(page.getByLabel("URL")).toHaveValue("https://example.test/same");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.getByLabel("URL")).toHaveCount(0);
  await page.getByRole("menuitem", { name: "Edit", exact: true }).click();
  await page.getByRole("menuitem", { name: "Hyperlink…" }).click();
  await page.getByLabel("URL").fill("https://example.test/changed");
  await page.getByRole("button", { name: "Apply", exact: true }).click();
  await expect(editor.locator('a[href="https://example.test/changed"]')).toHaveText("bbb");
  await expect(editor.locator('a[href="https://example.test/same"]')).toHaveText("aaa");
  await expect(editor).toHaveText("xxaaabbb");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(editor.locator('a[href="https://example.test/changed"]')).toHaveCount(0);
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(editor.locator('a[href="https://example.test/changed"]')).toHaveText("bbb");
  expect(errors).toEqual([]);
});
