/** @fileoverview Verifies represented native paragraph split options through actual command,history and ODT owners. */
import { expect, test } from "@playwright/test";
import { openBrowserMenu } from "../test-support/menu-pointer-e2e";
import { readFile } from "node:fs/promises";
import { ZipFile } from "../src/package/source/zipapi/ZipFile";
for (const width of [1280, 390])
  test(`Writer paragraph split controls width=${width}`, /** Exercises real document formatting and persistence. @param fixtures - Browser fixtures. @param fixtures.page - Actual page. @returns Completion. */ async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on(
      "pageerror",
      /** Records page errors. @param e - Actual error. @returns Nothing. */ (e) => {
        errors.push(e.message);
      },
    );
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/writer");
    await page
      .getByRole("textbox", { name: "Writer document text", exact: true })
      .fill("Paragraph text");
    /** Opens the actual Format command and original Text Flow page. @returns Completion. */ async function open() {
      await openBrowserMenu(page, "Format");
      await page.getByRole("menuitem", { name: /^Paragraph/ }).click();
      await page.getByRole("tab", { name: "Text Flow", exact: true }).click();
    }
    await open();
    const dialog = page.getByRole("dialog", { name: "Paragraph", exact: true }),
      allow = dialog.getByLabel("Allow to split paragraph"),
      orphan = dialog.getByLabel("Don’t split at beginning of paragraph"),
      widow = dialog.getByLabel("Don’t split at end of paragraph");
    const oldOrphan = await dialog.getByLabel("Orphan control (lines)").inputValue(),
      oldWidow = await dialog.getByLabel("Widow control (lines)").inputValue();
    await dialog.getByLabel("Orphan control (lines)").fill("3");
    await dialog.getByLabel("Widow control (lines)").fill("4");
    await orphan.uncheck();
    await widow.uncheck();
    await expect(allow).toBeDisabled();
    await expect(dialog.getByLabel("Widow control (lines)")).toBeDisabled();
    await orphan.check();
    await expect(allow).toBeEnabled();
    await widow.check();
    await expect(dialog.getByLabel("Widow control (lines)")).toHaveValue("4");
    await allow.uncheck();
    await expect(orphan).toBeDisabled();
    await expect(dialog.getByLabel("Orphan control (lines)")).toBeEnabled();
    await page.screenshot({
      path: `output/playwright/writer-full-checkpoint/Z2BZNW-split-${width}.png`,
    });
    await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    await open();
    await expect(allow).toBeChecked();
    await expect(dialog.getByLabel("Orphan control (lines)")).toHaveValue(oldOrphan);
    await dialog.getByLabel("Orphan control (lines)").fill("3");
    await dialog.getByLabel("Widow control (lines)").fill("4");
    await allow.uncheck();
    await dialog.getByRole("button", { name: "OK", exact: true }).click();
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await open();
    await expect(dialog.getByLabel("Widow control (lines)")).toHaveValue(oldWidow);
    await expect(allow).toBeChecked();
    await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    await page.getByRole("button", { name: "Redo", exact: true }).click();
    const pending = page.waitForEvent("download");
    await openBrowserMenu(page, "File");
    await page.getByRole("menuitem", { name: "Export…", exact: true }).click();
    await page.getByRole("button", { name: "Download ODT", exact: true }).click();
    const file = await (await pending).path();
    if (file === null) throw Error("Missing ODT");
    const bytes = await readFile(file),
      zip = new ZipFile(new Uint8Array(bytes)),
      xml = await zip.readTextEntry("content.xml");
    expect(xml).toContain('fo:orphans="3"');
    expect(xml).toContain('fo:widows="4"');
    expect(xml).toContain('fo:keep-together="always"');
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("tab", { name: "On computer", exact: true }).click();
    await page.getByLabel("Browse").setInputFiles({
      name: "paragraph.odt",
      mimeType: "application/vnd.oasis.opendocument.text",
      buffer: bytes,
    });
    await expect(page.getByRole("dialog", { name: "Open", exact: true })).toBeHidden();
    await open();
    await expect(allow).not.toBeChecked();
    await expect(dialog.getByLabel("Orphan control (lines)")).toHaveValue("3");
    await expect(dialog.getByLabel("Widow control (lines)")).toHaveValue("4");
    await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    expect(errors).toEqual([]);
  });
