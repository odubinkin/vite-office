/** @fileoverview Verifies the modeless Writer Navigator menu, shortcut and native cursor activation. */
import { expect, test } from "@playwright/test";
import { openBrowserMenu } from "../test-support/menu-pointer-e2e";

test("Writer Navigator opens from View and returns the cursor to a native heading", /** Exercises the upstream-shaped Navigator title, controls and outline tree. @param fixtures - Browser test inputs. @param fixtures.page - Writer page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/writer", { waitUntil: "domcontentloaded" });
  const first = page.locator("[data-writer-paragraph-id]").first();
  await first.click();
  await page.keyboard.insertText("Document chapter");
  const style = page
    .getByRole("toolbar", { name: "Writer formatting toolbar" })
    .getByRole("combobox", { name: "Paragraph style", exact: true });
  await style
    .locator("..")
    .getByRole("button", { name: "Show Paragraph style", exact: true })
    .click();
  const stylePopup = page.locator(`id=${await style.getAttribute("aria-controls")}`);
  await stylePopup.getByRole("option", { name: "Heading 1", exact: true }).click();
  await first.click();
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  await page.keyboard.insertText("Other text");

  await openBrowserMenu(page, "View");
  const command = page.getByRole("menuitemcheckbox", { name: "Navigator", exact: true });
  await expect(command).toHaveAttribute("aria-checked", "false");
  await command.click();
  const navigator = page.getByRole("dialog", { name: "Navigator", exact: true });
  const heading = navigator.getByRole("treeitem", { name: "Document chapter", exact: true });
  await expect(navigator.getByRole("spinbutton", { name: "Go to page", exact: true })).toHaveValue(
    "1",
  );
  await expect(heading).toBeVisible();
  await heading.dblclick();
  await expect
    .poll(
      /** Reads the live browser caret after the native navigation. @returns Current text. */
      () =>
        page.evaluate(
          /** Reads the painted paragraph containing the browser caret. @returns Text or absence. */
          () =>
            globalThis
              .getSelection()
              ?.focusNode?.parentElement?.closest("[data-writer-paragraph-id]")?.textContent,
        ),
    )
    .toBe("Document chapter");
  await navigator.getByRole("button", { name: "Close Navigator", exact: true }).click();
  await expect(navigator).toBeHidden();
  await page.keyboard.press("F5");
  await expect(navigator).toBeVisible();
  await expect(heading).toBeVisible();
});
