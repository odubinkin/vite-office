/** @fileoverview Production bookmark raw names,persistent operations,nested rename and ODT at desktop/narrow widths. */
import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { ZipFile } from "../src/package/source/zipapi/ZipFile";
for (const width of [1280, 390])
  test(`Writer native bookmark dialog width=${width}`, /** Exercises actual menu,model and filter owners without runtime injection. @param fixtures - Browser fixtures. @param fixtures.page - Actual page. @returns Completion. */ async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on(
      "pageerror",
      /** Captures real page errors. @param e - Browser error. @returns Nothing. */ (e) => {
        errors.push(e.message);
      },
    );
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/writer");
    const editor = page.getByRole("textbox", { name: "Writer document text", exact: true });
    await editor.fill("Alpha Beta");
    /** Opens the real source menu command. @returns Completion. */ async function open(): Promise<void> {
      await page.getByRole("menuitem", { name: "Insert", exact: true }).click();
      await page.getByRole("menuitem", { name: /^Bookmark/ }).click();
    }
    await open();
    let dialog = page.getByRole("dialog", { name: "Bookmark", exact: true });
    await expect(dialog.getByLabel("Name", { exact: true })).toHaveValue("Bookmark 1");
    await dialog.getByLabel("Name", { exact: true }).fill(" A ");
    await dialog.getByRole("button", { name: "Insert", exact: true }).click();
    await expect(dialog).toBeHidden();
    await editor.press("Home");
    await open();
    dialog = page.getByRole("dialog", { name: "Bookmark", exact: true });
    await dialog.getByLabel("Name", { exact: true }).fill("B");
    await dialog.getByRole("button", { name: "Insert", exact: true }).click();
    await expect(dialog).toBeHidden();
    await open();
    dialog = page.getByRole("dialog", { name: "Bookmark", exact: true });
    let list = dialog.getByRole("listbox", { name: "Existing bookmarks" });
    await list.selectOption(" A ");
    await dialog.getByRole("button", { name: "Rename", exact: true }).click();
    let rename = page.getByRole("dialog", { name: /^Rename object:/ });
    await expect(rename.getByRole("button", { name: "OK", exact: true })).toBeDisabled();
    await rename.press("Escape");
    await expect(rename).toBeHidden();
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Rename", exact: true })).toBeFocused();
    await dialog.getByRole("button", { name: "Rename", exact: true }).click();
    rename = page.getByRole("dialog", { name: /^Rename object:/ });
    await rename.getByLabel("New name").fill(" R/; ");
    await expect(rename.getByLabel("New name")).toHaveValue(" R ");
    await rename.getByRole("button", { name: "OK", exact: true }).click();
    await expect(rename).toBeHidden();
    await expect(dialog).toBeVisible();
    await list.selectOption(" R ");
    await dialog.getByRole("button", { name: "Go to", exact: true }).click();
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Close", exact: true }).last().click();
    await expect(dialog).toBeHidden();
    await page.keyboard.type("!");
    await expect(editor).toHaveText("Alpha Beta!");
    const pending = page.waitForEvent("download");
    await page.getByRole("menuitem", { name: "File", exact: true }).click();
    await page.getByRole("menuitem", { name: "Export…", exact: true }).click();
    await page.getByRole("button", { name: "Download ODT", exact: true }).click();
    const file = await (await pending).path();
    if (file === null) throw Error("Missing ODT download");
    const zip = new ZipFile(new Uint8Array(await readFile(file)));
    expect(await zip.readTextEntry("content.xml")).toContain('text:name=" R "');
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("tab", { name: "On computer", exact: true }).click();
    await page.getByLabel("Browse").setInputFiles({
      name: "bookmarks.odt",
      mimeType: "application/vnd.oasis.opendocument.text",
      buffer: await readFile(file),
    });
    await expect(page.getByRole("dialog", { name: "Open", exact: true })).toBeHidden();
    await open();
    dialog = page.getByRole("dialog", { name: "Bookmark", exact: true });
    list = dialog.getByRole("listbox", { name: "Existing bookmarks" });
    await expect(list.locator("option")).toHaveCount(2);
    await dialog.getByLabel("Name", { exact: true }).fill(" /R ");
    await expect(dialog.getByLabel("Name", { exact: true })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    await expect(dialog.getByRole("button", { name: "Go to", exact: true })).toBeEnabled();
    await dialog.getByLabel("Name", { exact: true }).fill("B; R ");
    await expect(dialog.getByRole("button", { name: "Delete", exact: true })).toBeEnabled();
    await expect(dialog.getByRole("button", { name: "Go to", exact: true })).toBeDisabled();
    await page.screenshot({
      path: `output/playwright/writer-full-checkpoint/QZAHNT-bookmarks-${width}.png`,
    });
    await dialog.getByRole("button", { name: "Delete", exact: true }).click();
    await expect(dialog).toBeVisible();
    await expect(list.locator("option")).toHaveCount(0);
    await expect(dialog.getByRole("button", { name: "Insert", exact: true })).toBeDisabled();
    await dialog.getByRole("button", { name: "Close", exact: true }).last().click();
    await open();
    dialog = page.getByRole("dialog", { name: "Bookmark", exact: true });
    await expect(dialog.getByRole("listbox").locator("option")).toHaveCount(0);
    await dialog.press("Escape");
    await expect(dialog).toBeHidden();
    expect(errors).toEqual([]);
  });
