/** @fileoverview Checks actual Chromium native list clipboard selection in body and table paragraphs. */
import { expect, test } from "@playwright/test";
for (const cell of [false, true])
  for (const reverse of [false, true])
    for (const kind of ["numbered", "bullet"] as const)
      test(`Writer native clipboard lists cell=${cell} reverse=${reverse} kind=${kind}`, /** Checks real UI input, copy and history. @param root0 - Browser fixture. @param root0.page - Chromium page. @returns Completion. */ async ({
        page,
      }) => {
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
          first = page.getByRole("textbox", { name: "Row 1 column 1 paragraph 1", exact: true });
          await first.click();
        }
        await page.keyboard.type("Alpha");
        await page.keyboard.press("Enter");
        await page.keyboard.type("Omega");
        const secondLabel = cell ? "Row 1 column 1 paragraph 2" : "Writer paragraph 2",
          second = page.getByRole("textbox", { name: secondLabel });
        await first.click();
        await page.getByRole("button", { name: "Format", exact: true }).click();
        await page.getByRole("menuitem", { name: "Lists", exact: true }).click();
        await page
          .getByRole("menuitemradio", {
            name: kind === "numbered" ? "Ordered List" : "Unordered List",
            exact: true,
          })
          .click();
        /** Selects real DOM text and synchronizes native cursor ownership. @param start - First offset. @param end - Second offset. @param single - Same-node selection. @returns Completion. */
        async function select(start: number, end: number, single = false): Promise<void> {
          await first.evaluate(
            /** Sets native DOM endpoints. @param element - First editor. @param args - Range inputs. @returns Nothing. */ (
              element,
              args,
            ) => {
              const a = document.createTreeWalker(element, NodeFilter.SHOW_TEXT).nextNode(),
                last = document.querySelector(`[aria-label="${args.secondLabel}"]`),
                b = args.single
                  ? a
                  : last === null
                    ? null
                    : document.createTreeWalker(last, NodeFilter.SHOW_TEXT).nextNode();
              if (a === null || b === null) throw new Error("Missing list text endpoints");
              window
                .getSelection()
                ?.setBaseAndExtent(
                  args.reverse ? b : a,
                  args.reverse ? args.end : args.start,
                  args.reverse ? a : b,
                  args.reverse ? args.start : args.end,
                );
              document.dispatchEvent(new Event("selectionchange"));
            },
            { start, end, single, reverse, secondLabel },
          );
        }
        /** Copies through actual production event routing. @returns Native flavors. */
        async function copy() {
          return first.evaluate(
            /** Reads native transfer strings. @param element - Actual editor. @returns MIME outputs. */ (
              element,
            ) => {
              const data = new DataTransfer();
              element.dispatchEvent(
                new ClipboardEvent("copy", {
                  bubbles: true,
                  cancelable: true,
                  clipboardData: data,
                }),
              );
              return { plain: data.getData("text/plain"), html: data.getData("text/html") };
            },
          );
        }
        await select(0, 2);
        const partial = await copy();
        expect(partial.plain).toBe(kind === "numbered" ? "    1. Alpha\nOm" : "    • Alpha\nOm");
        expect(partial.html).toContain(kind === "numbered" ? "<ol" : "<ul");
        await select(1, 2);
        expect((await copy()).plain).toBe("lpha\nOm");
        await select(0, 5, true);
        expect((await copy()).plain).toBe("Alpha");
        await select(0, 5);
        await page.keyboard.insertText("Replacement");
        await expect(first).toHaveText("Replacement");
        await expect(second).toHaveCount(0);
        await page.keyboard.press("Control+z");
        await expect(first).toHaveText("Alpha");
        await expect(second).toHaveText("Omega");
        await page.keyboard.press("Control+y");
        await expect(first).toHaveText("Replacement");
        if (cell)
          await expect(page.getByRole("textbox", { name: "Writer document text" })).toHaveText(
            "Before",
          );
      });
