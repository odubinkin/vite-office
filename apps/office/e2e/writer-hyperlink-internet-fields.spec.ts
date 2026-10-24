/** @fileoverview Exercises source Internet query preference,editable common fields,actual Writer history/ODT and modal focus in production Chromium. */
import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { ZipFile } from "../src/package/source/zipapi/ZipFile";
for (const width of [1280, 390])
  test(`Writer Internet fields and query preference width=${width}`, /** Uses actual document/menu/controller/filter owners without injection. @param fixtures - Browser fixtures. @param fixtures.page - Actual page. @returns Completion. */ async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on(
      "pageerror",
      /** Captures actual browser errors. @param error - Browser error. @returns Nothing. */ (
        error,
      ) => {
        errors.push(error.message);
      },
    );
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/writer");
    const editor = page.getByRole("textbox", { name: "Writer document text", exact: true });
    await editor.fill("Before");
    const open = page.getByRole("button", { name: "Hyperlink", exact: true });
    await open.click();
    let dialog = page.getByRole("dialog", { name: "Hyperlink", exact: true });
    await expect(dialog.getByLabel("URL", { exact: true })).toBeFocused();
    await dialog.getByLabel("URL", { exact: true }).fill("https://example.test/cancel?x=1#part");
    await dialog.getByRole("checkbox", { name: "Remove query string" }).check();
    await expect(dialog.getByLabel("URL", { exact: true })).toHaveValue(
      "https://example.test/cancel#part",
    );
    await dialog.press("Escape");
    await expect(dialog).toBeHidden();
    await page.keyboard.type("!");
    await expect(editor).toHaveText("Before!");
    await expect(editor.getByRole("link")).toHaveCount(0);
    await open.click();
    dialog = page.getByRole("dialog", { name: "Hyperlink", exact: true });
    await expect(dialog.getByRole("checkbox")).toBeChecked();
    await dialog
      .getByLabel("URL", { exact: true })
      .fill("https://example.test/first?remove=1#anchor");
    await expect(dialog.getByLabel("URL", { exact: true })).toHaveValue(
      "https://example.test/first#anchor",
    );
    await dialog.getByLabel("Text", { exact: true }).fill("Linked");
    await dialog.getByLabel("Target", { exact: true }).fill(" Custom.Frame ");
    await dialog.getByLabel("Name", { exact: true }).fill(" Named link ");
    await expect(dialog.locator("datalist option")).toHaveCount(5);
    await page.screenshot({
      path: `output/playwright/writer-full-checkpoint/H0Q3NZ-internet-${width}.png`,
    });
    await dialog.getByRole("button", { name: "Apply", exact: true }).click();
    await expect(dialog).toBeHidden();
    const link = editor.getByRole("link", { name: "Linked", exact: true });
    await expect(link).toHaveAttribute("href", "https://example.test/first#anchor");
    await expect(link).toHaveAttribute("target", " Custom.Frame ");
    await link.click();
    await page.getByRole("menuitem", { name: "Edit", exact: true }).click();
    await page.getByRole("menuitem", { name: "Hyperlink…", exact: true }).click();
    dialog = page.getByRole("dialog", { name: "Hyperlink", exact: true });
    await expect(dialog.getByLabel("Target", { exact: true })).toHaveValue(" Custom.Frame ");
    await expect(dialog.getByLabel("Name", { exact: true })).toHaveValue(" Named link ");
    await dialog.getByRole("checkbox").uncheck();
    await dialog
      .getByLabel("URL", { exact: true })
      .fill("https://example.test/final?keep=1#anchor");
    await dialog.getByLabel("URL", { exact: true }).press("Enter");
    await expect(dialog).toBeHidden();
    await expect(link).toHaveAttribute("href", "https://example.test/final?keep=1#anchor");
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(link).toHaveAttribute("href", "https://example.test/first#anchor");
    await page.getByRole("button", { name: "Redo", exact: true }).click();
    await expect(link).toHaveAttribute("href", "https://example.test/final?keep=1#anchor");
    const pending = page.waitForEvent("download");
    await page.getByRole("menuitem", { name: "File", exact: true }).click();
    await page.getByRole("menuitem", { name: "Export…", exact: true }).click();
    await page.getByRole("button", { name: "Download ODT", exact: true }).click();
    const file = await (await pending).path();
    if (file === null) throw Error("Missing ODT download");
    const bytes = await readFile(file),
      zip = new ZipFile(new Uint8Array(bytes)),
      xml = await zip.readTextEntry("content.xml");
    expect(xml).toContain('office:target-frame-name=" Custom.Frame "');
    expect(xml).toContain('office:name=" Named link "');
    expect(xml).toContain('xlink:href="https://example.test/final?keep=1#anchor"');
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("tab", { name: "On computer", exact: true }).click();
    await page.getByLabel("Browse").setInputFiles({
      name: "hyperlink.odt",
      mimeType: "application/vnd.oasis.opendocument.text",
      buffer: bytes,
    });
    await expect(page.getByRole("dialog", { name: "Open", exact: true })).toBeHidden();
    await expect(link).toHaveAttribute("target", " Custom.Frame ");
    await expect(link).toHaveAttribute("href", "https://example.test/final?keep=1#anchor");
    await link.click({ modifiers: [] });
    await open.click();
    dialog = page.getByRole("dialog", { name: "Hyperlink", exact: true });
    await expect(dialog.getByRole("checkbox")).not.toBeChecked();
    await expect(dialog.getByLabel("Name", { exact: true })).toHaveValue(" Named link ");
    await expect(dialog.getByLabel("URL", { exact: true })).toHaveValue(
      "https://example.test/final?keep=1#anchor",
    );
    await dialog.getByLabel("Name", { exact: true }).fill("");
    await dialog.getByLabel("Target", { exact: true }).fill("");
    await dialog.getByRole("button", { name: "Apply", exact: true }).click();
    await expect(link).not.toHaveAttribute("target");
    expect(errors).toEqual([]);
  });
