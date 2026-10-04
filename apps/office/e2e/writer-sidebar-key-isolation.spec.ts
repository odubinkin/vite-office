/** @fileoverview Checks Sidebar docking key isolation and HTML defaults in real Chromium. */
import { expect, test } from "@playwright/test";

for (const width of [1280, 390]) {
  test(`Sidebar docking key isolation at width ${width}`, /** Checks selected-document safety,local editing,activation and subsequent document input. @param fixtures - Browser fixtures. @returns Nothing. */ async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/writer");
    const editor = page.getByLabel("Writer document body", { exact: true });
    await editor.focus();
    await page.keyboard.insertText("ProtectedSelection");
    await editor.press("Control+a");
    const before = await editor.textContent();
    const sidebar = page.getByRole("complementary", { name: "Writer properties sidebar" });
    const owner = sidebar.getByRole("button", { name: "Start", exact: true });
    await owner.evaluate(
      /** Observes final default cancellation after the owning React boundary. @param element - Existing local control. @returns Nothing. */
      (element) => {
        element.addEventListener(
          "keydown",
          /** Records only the isolated clipboard key after bubbling completes. @param event - Native input. @returns Nothing. */
          (event) => {
            if (event instanceof KeyboardEvent && ["Insert", "Delete"].includes(event.key))
              setTimeout(
                /** Reads the final cancellation state. @returns Nothing. */ () =>
                  element.setAttribute("data-local-key-consumed", String(event.defaultPrevented)),
              );
          },
        );
      },
    );
    for (const shortcut of ["Shift+Delete", "Control+Insert", "Meta+Insert", "Shift+Insert"]) {
      await owner.focus();
      await owner.press(shortcut);
      await expect(owner).toHaveAttribute("data-local-key-consumed", "true");
      await expect(owner).toBeFocused();
      expect(await editor.textContent()).toBe(before);
      await expect(page.getByRole("dialog")).toHaveCount(0);
    }
    await sidebar.evaluate(
      /** Adds a local HTML fixture to exercise native input defaults inside the real boundary. @param element - Owned Sidebar root. @returns Nothing. */
      (element) => {
        const field = document.createElement("input");
        field.setAttribute("aria-label", "Sidebar local draft");
        field.value = "ABCDE";
        element.append(field);
      },
    );
    const field = sidebar.getByLabel("Sidebar local draft");
    await field.focus();
    await field.press("End");
    await field.press("Backspace");
    await expect(field).toHaveValue("ABCD");
    await field.press("Home");
    await field.press("Delete");
    await expect(field).toHaveValue("BCD");
    expect(await editor.textContent()).toBe(before);
    const options = sidebar.getByRole("button", { name: "More Options", exact: true });
    await options.focus();
    await options.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Paragraph", exact: true });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    await sidebar.getByRole("button", { name: "Paragraph", exact: true }).focus();
    await page.keyboard.press("Escape");
    await expect(editor).toBeFocused();
    await editor.press("Control+a");
    await page.keyboard.insertText("SidebarIsolationProof");
    await expect(editor).toContainText("SidebarIsolationProof");
  });
}
