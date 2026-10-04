/** @fileoverview Checks the real Writer direct document focus key and modal precedence. */
import { expect, test } from "@playwright/test";

for (const origin of ["toolbar", "root", "child"] as const) {
  test(`Ctrl-F6 from the Writer ${origin} focuses the document and retains editing`, /** Checks frame routing and menu teardown in Chromium. @param fixtures - Browser fixture. @returns Nothing. */ async ({
    page,
  }) => {
    await page.goto("/writer");
    const owner = page.getByRole("combobox", { name: "Paragraph style", exact: true });
    await owner.focus();
    if (origin === "root") {
      await page.keyboard.press("F10");
      await expect(page.getByRole("button", { name: "File", exact: true })).toBeFocused();
    } else if (origin === "child") {
      await page.getByRole("button", { name: "View", exact: true }).click();
      const rulers = page.getByRole("menuitem", { name: "Rulers", exact: true });
      await rulers.focus();
      await rulers.press("ArrowRight");
      await expect(
        page.getByRole("menuitemcheckbox", { name: "Rulers", exact: true }),
      ).toBeFocused();
    }
    await page.keyboard.press("Control+F6");
    const editor = page.getByLabel("Writer document body", { exact: true });
    await expect(editor).toBeFocused();
    await expect(page.getByRole("menu")).toHaveCount(0);
    await expect(page.getByLabel("Writer horizontal ruler")).toBeVisible();
    await page.keyboard.insertText("DocumentKeyProof");
    await expect(editor).toContainText("DocumentKeyProof");
    await page.keyboard.press("F10");
    await page.keyboard.press("F10");
    await expect(editor).toBeFocused();
  });
}

test("Ctrl-F6 retains the Writer Hyperlink modal's input focus", /** Checks blocked document focus and resumed eligibility. @param fixtures - Browser fixture. @returns Nothing. */ async ({
  page,
}) => {
  await page.goto("/writer");
  await page.getByRole("button", { name: "Insert", exact: true }).click();
  await page.getByRole("menuitem", { name: "Hyperlink…", exact: true }).click();
  const url = page.getByRole("textbox", { name: "URL", exact: true });
  await expect(url).toBeFocused();
  await page.keyboard.press("Control+F6");
  await expect(url).toBeFocused();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.getByRole("combobox", { name: "Paragraph style", exact: true }).focus();
  await page.keyboard.press("Control+F6");
  await expect(page.getByLabel("Writer document body", { exact: true })).toBeFocused();
});
