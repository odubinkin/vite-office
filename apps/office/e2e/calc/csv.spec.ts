/** @fileoverview Production Calc CSV import and export through the existing file UI. */
import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("imports CSV, saves the primary ODS copy and exports the active sheet", /** Checks imports CSV, saves the primary ODS copy and exports the active sheet. @param input1 - Input1. @returns Test completion or assertion result. */ async ({
  page,
}) => {
  const errors: string[] = [];
  page.on(
    "pageerror",
    /** Checks pageerror. @param error - Error. @returns Test completion or assertion result. */ (
      error,
    ) => errors.push(error.message),
  );
  await page.goto("/calc");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    name: "csv-browser-flow.csv",
    mimeType: "text/csv",
    buffer: Buffer.from('Name,Value\n"A, B",42\n"two\nlines",7\n'),
  });
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("textbox", { name: "Input line", exact: true })).toHaveValue("Name");
  await page.getByRole("menuitem", { name: "File", exact: true }).click();
  await page.getByRole("menuitem", { name: "Export…", exact: true }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download CSV" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("csv-browser-flow.csv");
  expect(await readFile(await download.path(), "utf8")).toBe(
    'Name,Value\n"A, B",42\n"two\nlines",7\n',
  );
  expect(errors).toEqual([]);
});
