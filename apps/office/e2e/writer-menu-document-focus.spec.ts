/** @fileoverview Verifies Writer frame-client focus after unopened menubar deactivation. */
import { expect, test } from "@playwright/test";

test("unopened menu Escape without a saved owner focuses the Writer document", /** Checks real client fallback and editing. @param fixtures - Browser fixture. @returns Nothing. */ async ({
  page,
}) => {
  await page.goto("/writer");
  await page.evaluate(
    /** Clears the previous native focus. @returns Nothing. */ () => {
      (document.activeElement as HTMLElement).blur();
    },
  );
  const trigger = page.getByRole("button", { name: "View", exact: true });
  await trigger.focus();
  await expect(page.getByRole("menu")).toHaveCount(0);
  await trigger.press("Escape");
  const editor = page.getByLabel("Writer document body", { exact: true });
  await expect(editor).toBeFocused();
  await page.keyboard.insertText("DocumentFallbackProof");
  await expect(editor).toContainText("DocumentFallbackProof");
});

test("unopened menu Escape restores its saved Writer toolbar control", /** Checks a live owner takes precedence over client fallback. @param fixtures - Browser fixture. @returns Nothing. */ async ({
  page,
}) => {
  await page.goto("/writer");
  const owner = page.getByRole("combobox", { name: "Paragraph style", exact: true });
  await owner.focus();
  const trigger = page.getByRole("button", { name: "View", exact: true });
  await trigger.focus();
  await trigger.press("Escape");
  await expect(owner).toBeFocused();
  await expect(page.getByRole("menu")).toHaveCount(0);
});
