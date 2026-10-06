/** @fileoverview Checks actual Chromium text ranges and clipboard contain native paragraphs without synthetic descriptions. */
import { expect, test, type Page } from "@playwright/test";
/** Creates body or table text through actual UI input. @param page - Chromium page. @param cell - Cell context. @returns Actual paragraph locators. */
async function fixture(page: Page, cell: boolean) {
  await page.goto("/writer");
  let first = page.getByRole("textbox", { name: "Writer document text" });
  await first.click();
  if (cell) {
    await page.keyboard.type("Before");
    await page.getByRole("button", { name: "Insert Table" }).click();
    await page
      .getByLabel("Table size")
      .locator("..")
      .getByRole("button", { name: "More Options" })
      .click();
    await page
      .getByRole("dialog", { name: "Insert Table" })
      .getByRole("button", { name: "Insert" })
      .click();
    first = page.getByLabel("Row 1 column 1 paragraph 1", { exact: true });
    await first.click();
  }
  await page.keyboard.type("Alpha");
  await page.keyboard.press("Enter");
  await page.keyboard.type("Omega");
  const second = page.getByRole("textbox", {
    name: cell ? "Row 1 column 1 paragraph 2" : "Writer paragraph 2",
  });
  return { first, second };
}
/** Reads actual browser text and routes copy through the existing native handler. @param page - Chromium page. @returns Native text and transfer. */
async function textAndCopy(page: Page) {
  return page.evaluate(
    /** Captures real selected text and native clipboard output. @returns Selection and transfer values. */ () => {
      const selection = window.getSelection(),
        data = new DataTransfer(),
        target = selection?.focusNode?.parentElement;
      if (selection === null || target === undefined || target === null)
        throw new Error("Missing selected text owner");
      target.dispatchEvent(
        new ClipboardEvent("copy", { bubbles: true, cancelable: true, clipboardData: data }),
      );
      return {
        selected: selection.toString(),
        range: selection.getRangeAt(0).toString(),
        plain: data.getData("text/plain"),
        html: data.getData("text/html"),
      };
    },
  );
}
for (const cell of [false, true])
  for (const reverse of [false, true]) {
    test(`Writer native text surface cell=${cell} reverse=${reverse}`, /** Checks actual body/cell selection and native shortcut copy. @param root0 - Browser fixture. @param root0.page - Chromium page. @returns Completion. */ async ({
      page,
    }) => {
      const f = await fixture(page, cell);
      await f.first.evaluate(
        /** Selects real native paragraph portions in either direction. @param element - First paragraph. @param args - Native endpoint inputs. @returns Nothing. */ (
          element,
          args,
        ) => {
          const last = document.querySelector<HTMLElement>(`[aria-label="${args.secondLabel}"]`),
            start = element.firstChild,
            end = last?.firstChild;
          if (start === null || end === undefined || end === null)
            throw new Error("Missing native text endpoints");
          window
            .getSelection()
            ?.setBaseAndExtent(
              args.reverse ? end : start,
              args.reverse ? 4 : 1,
              args.reverse ? start : end,
              args.reverse ? 1 : 4,
            );
          document.dispatchEvent(new Event("selectionchange"));
        },
        { reverse, secondLabel: cell ? "Row 1 column 1 paragraph 2" : "Writer paragraph 2" },
      );
      const partial = await textAndCopy(page);
      expect(partial.range).toBe("lphaOmeg");
      expect(partial.selected).toBe("lpha\n\nOmeg");
      expect(partial.plain).toBe("lpha\nOmeg");
      expect(partial.html).not.toMatch(/Paragraph style:|Paragraph list:/);
      for (const paragraph of [f.first, f.second]) {
        await expect(paragraph).toHaveAccessibleDescription("");
        await expect(paragraph).not.toHaveAttribute("aria-describedby");
      }
      await expect(page.locator('[id^="writer-paragraph-style-"]')).toHaveCount(0);
      await page.keyboard.press(reverse ? "Meta+a" : "Control+a");
      const all = await textAndCopy(page);
      expect(all.range).toBe("AlphaOmega");
      expect(all.selected).toBe("Alpha\n\nOmega");
      expect(all.plain).toBe("Alpha\nOmega");
      await page.keyboard.insertText("Replacement");
      await expect(f.first).toHaveText("Replacement");
      await expect(f.second).toHaveCount(0);
      await page.keyboard.press("Control+z");
      await expect(f.first).toHaveText("Alpha");
      await expect(f.second).toHaveText("Omega");
      await page.keyboard.press("Control+y");
      await expect(f.first).toHaveText("Replacement");
      if (cell)
        await expect(page.getByRole("textbox", { name: "Writer document text" })).toHaveText(
          "Before",
        );
    });
  }
