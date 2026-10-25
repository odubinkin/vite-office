/** @fileoverview Verifies represented native paragraph page break controls through actual command,history and ODT owners. */
import { expect, test } from "@playwright/test";
import { openBrowserMenu } from "../test-support/menu-pointer-e2e";
import { readFile } from "node:fs/promises";
import { ZipFile } from "../src/package/source/zipapi/ZipFile";
for (const width of [1280, 390])
  test(`Writer paragraph page breaks width=${width}`, /** Exercises real document formatting and persistence. @param fixtures - Browser fixtures. @param fixtures.page - Actual page. @returns Completion. */ async ({
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
    const dialog = page.getByRole("dialog", { name: "Paragraph", exact: true });
    const insert = dialog.getByRole("checkbox", { name: "Insert", exact: true });
    const position = dialog.getByRole("combobox", { name: "Position", exact: true });
    const style = dialog.getByLabel("With page style");
    const number = dialog.getByRole("spinbutton", { name: "Start page number", exact: true });
    await expect(position).toBeDisabled();
    await insert.check();
    await style.check();
    await dialog.getByLabel("Page number", { exact: true }).check();
    await number.fill("7");
    await position.selectOption("after");
    await expect(style).not.toBeChecked();
    await expect(style).toBeDisabled();
    await expect(number).toHaveValue("7");
    await expect(number).toBeDisabled();
    await position.selectOption("before");
    await style.check();
    await page.screenshot({
      path: `output/playwright/writer-full-checkpoint/0AGGG4-breaks-${width}.png`,
    });
    await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    await open();
    await expect(insert).not.toBeChecked();
    await insert.check();
    await style.check();
    await dialog.getByLabel("Page number", { exact: true }).check();
    await number.fill("7");
    await dialog.getByRole("button", { name: "OK", exact: true }).click();
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await open();
    await expect(insert).not.toBeChecked();
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
    expect(xml).toContain('style:page-number="7"');
    expect(xml).toContain('style:master-page-name="Standard"');
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("tab", { name: "On computer", exact: true }).click();
    await page.getByLabel("Browse").setInputFiles({
      name: "paragraph.odt",
      mimeType: "application/vnd.oasis.opendocument.text",
      buffer: bytes,
    });
    await expect(page.getByRole("dialog", { name: "Open", exact: true })).toBeHidden();
    await open();
    await expect(insert).toBeChecked();
    await expect(style).toBeChecked();
    await expect(number).toHaveValue("7");
    await expect(position).toHaveValue("before");
    await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    expect(errors).toEqual([]);
  });
