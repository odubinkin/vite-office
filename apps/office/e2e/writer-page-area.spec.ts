/** @fileoverview Checks Page Style image import and visible physical page fill in Chromium. */
import { expect, test } from "@playwright/test";
import { openBrowserMenu } from "../test-support/menu-pointer-e2e";

test("Writer paints a bitmap page fill and reopens its native placement", /** Runs the actual Page Style command and edits native image placement and transparency. @param fixtures - Browser fixtures. @param fixtures.page - Browser page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/writer");
  await page.locator("[data-writer-paragraph-id]").first().click();
  const dialog = page.getByRole("dialog", { name: "Page Style", exact: true });

  /** Opens the existing Page Style command in its menu. @returns Completion. */
  async function open() {
    await openBrowserMenu(page, "Format");
    await page.getByRole("menuitem", { name: /^Page Style…?$/ }).click();
    await expect(dialog).toBeVisible();
  }

  await open();
  await dialog.getByRole("tab", { name: "Area" }).click();
  await dialog.getByRole("button", { name: "Image", exact: true }).click();
  await dialog.getByLabel("Add / Import").setInputFiles({
    name: "page-pattern.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAACgAAAAUCAYAAAD/Rn+7AAAAM0lEQVR4nO3OMQ0AAAjAMCQhGj1YAhVkHDv6N7pyPgs6YNAgHTBokA4YNEgHDBqkAwavLZKHN5nQxmcYAAAAAElFTkSuQmCC",
      "base64",
    ),
  });
  await expect(dialog.getByText("page-pattern.png")).toBeVisible();
  const placement = dialog.getByRole("combobox", { name: "Style", exact: true });
  await expect(placement.locator("option:checked")).toHaveText("Tiled");
  await placement.selectOption({ label: "Stretched" });
  await dialog.getByRole("tab", { name: "Transparency" }).click();
  await dialog.getByRole("radio", { name: "Transparency", exact: true }).check();
  await dialog.getByRole("spinbutton", { name: "Transparency" }).fill("35");
  await dialog.getByRole("button", { name: "OK", exact: true }).click();

  const background = page.locator("[data-writer-page='1'] [data-writer-page-background]");
  await expect(background).toHaveCSS("background-image", /data:image\/png;base64/);
  await expect(background).toHaveCSS("background-size", "100% 100%");
  await expect(background).toHaveCSS("opacity", "0.65");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(background).toHaveCount(0);
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(background).toHaveCSS("opacity", "0.65");

  await open();
  await dialog.getByRole("tab", { name: "Area", exact: true }).click();
  await expect(placement.locator("option:checked")).toHaveText("Stretched");
  await expect(dialog.getByText("page-pattern.png")).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
});
