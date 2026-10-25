/** @fileoverview Verifies native line-number control sensitivity,draft lifetime,focus and ODT in production Chromium. */
import { expect, test } from "@playwright/test";
import { openBrowserMenu } from "../test-support/menu-pointer-e2e";
import { readFile } from "node:fs/promises";
import { ZipFile } from "../src/package/source/zipapi/ZipFile";
for (const width of [1280, 390])
  test(`Writer line number controls width=${width}`, /** Exercises actual source menu/document/filter owners. @param fixtures - Browser fixtures. @param fixtures.page - Actual page. @returns Completion. */ async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on(
      "pageerror",
      /** Captures actual page errors. @param e - Error. @returns Nothing. */ (e) => {
        errors.push(e.message);
      },
    );
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/writer");
    const editor = page.getByRole("textbox", { name: "Writer document text", exact: true });
    await editor.fill("Text");
    /** Opens the actual Tools command,including narrow overflow. @returns Completion. */ async function open() {
      await openBrowserMenu(page, "Tools");
      await page.getByRole("menuitem", { name: "Line Numbering…", exact: true }).click();
    }
    await open();
    let dialog = page.getByRole("dialog", { name: "Line Numbering", exact: true });
    const show = dialog.getByLabel("Show numbering");
    await expect(show).toBeFocused();
    await expect(dialog.getByLabel("Interval", { exact: true })).toBeDisabled();
    await show.check();
    await expect(dialog.getByLabel("Every", { exact: true })).toBeDisabled();
    await dialog.getByLabel("Separator text", { exact: true }).fill("*");
    await dialog.getByLabel("Every", { exact: true }).fill("0");
    await dialog.getByLabel("Interval", { exact: true }).fill("7");
    await show.uncheck();
    await expect(dialog.getByLabel("Every", { exact: true })).toHaveValue("0");
    await show.check();
    await page.screenshot({
      path: `output/playwright/writer-full-checkpoint/HGNC48-lines-${width}.png`,
    });
    await dialog.press("Escape");
    await expect(dialog).toBeHidden();
    await page.keyboard.type("!");
    await expect(editor).toHaveText("Text!");
    await open();
    dialog = page.getByRole("dialog", { name: "Line Numbering", exact: true });
    await expect(dialog.getByLabel("Show numbering")).not.toBeChecked();
    await dialog.getByLabel("Show numbering").check();
    await dialog.getByLabel("Separator text").fill("*");
    await dialog.getByLabel("Every", { exact: true }).fill("0");
    await dialog.getByLabel("Interval", { exact: true }).fill("7");
    await dialog.getByLabel("Interval", { exact: true }).press("Enter");
    await expect(dialog).toBeHidden();
    await open();
    await expect(dialog.getByLabel("Every", { exact: true })).toHaveValue("0");
    await expect(dialog.getByLabel("Interval", { exact: true })).toHaveValue("7");
    await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    const pending = page.waitForEvent("download");
    await openBrowserMenu(page, "File");
    await page.getByRole("menuitem", { name: "Export…", exact: true }).click();
    await page.getByRole("button", { name: "Download ODT", exact: true }).click();
    const file = await (await pending).path();
    if (file === null) throw Error("Missing download");
    const bytes = await readFile(file),
      zip = new ZipFile(new Uint8Array(bytes));
    expect(await zip.readTextEntry("styles.xml")).toContain(
      '<text:linenumbering-separator text:increment="0">*</text:linenumbering-separator>',
    );
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("tab", { name: "On computer", exact: true }).click();
    await page.getByLabel("Browse").setInputFiles({
      name: "lines.odt",
      mimeType: "application/vnd.oasis.opendocument.text",
      buffer: bytes,
    });
    await expect(page.getByRole("dialog", { name: "Open", exact: true })).toBeHidden();
    await open();
    await expect(dialog.getByLabel("Every", { exact: true })).toHaveValue("0");
    await dialog.press("Escape");
    expect(errors).toEqual([]);
  });
