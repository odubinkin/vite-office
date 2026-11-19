/** @fileoverview Checks the shared immediate icon help in the actual suite workspaces. */
import { expect, test } from "@playwright/test";

for (const suite of ["Writer", "Calc"]) {
  test(`${suite} shows immediate help for compact toolbar icons`, /** Checks the rendered icon size, pointer help and keyboard dismissal. @param fixtures - Browser fixtures. @returns Completion. */ async ({
    page,
  }) => {
    await page.goto(`/${suite.toLowerCase()}`);
    const toolbar = page.getByRole("toolbar", { name: `${suite} standard toolbar` });
    const open = toolbar.getByRole("button", { name: "Open", exact: true });
    const tooltip = page.getByRole("tooltip");
    await expect(open).toBeEnabled();
    await expect(open).toHaveCSS("width", "28px");
    await expect(open.locator("svg")).toHaveCSS("width", "16px");
    await open.hover();
    await expect(tooltip).toHaveText("Open", { timeout: 350 });
    await expect(tooltip).toBeInViewport();
    await page.mouse.move(0, 0);
    await expect(tooltip).toHaveCount(0);
    await page.keyboard.press("Tab");
    await open.focus();
    await expect(tooltip).toHaveText("Open");
    await page.keyboard.press("Escape");
    await expect(tooltip).toHaveCount(0);
    await expect(open).toBeFocused();
  });
}
