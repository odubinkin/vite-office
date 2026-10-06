/** @fileoverview Chromium native insert inputs, linked repetition and compatibility warnings. */
import { expect, test } from "@playwright/test";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";

for (const width of [1280, 390])
  test(`native Insert Table inputs width=${width}`, /** Uses actual controls and model-backed table rendering. @param fixtures - Browser fixtures. @param fixtures.page - Browser. @returns Completion. */ async ({
    page,
  }) => {
    const doc = new SwDoc(),
      table = doc.nodes.MakeTableNode("Budget", { width: 6000, headerRows: 0 });
    table.AddColumnWidth(6000);
    doc.nodes.AppendTableRow(table, 1);
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/writer");
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("tab", { name: "On computer" }).click();
    await page.getByLabel("Browse").setInputFiles({
      buffer: Buffer.from(writeOdtDocument(doc, { title: "Inputs" })),
      mimeType: "application/vnd.oasis.opendocument.text",
      name: "insert-inputs.odt",
    });
    await expect(page.getByRole("table", { name: "Budget" })).toHaveCount(1);
    await page.getByRole("button", { name: "Insert Table", exact: true }).click();
    await page
      .getByLabel("Table size", { exact: true })
      .locator("..")
      .getByRole("button", { name: "More Options", exact: true })
      .click();
    const dialog = page.getByRole("dialog", { name: "Insert Table" }),
      rows = dialog.getByLabel("Rows", { exact: true }),
      columns = dialog.getByLabel("Columns", { exact: true }),
      repeat = dialog.getByLabel("Header rows", { exact: true });
    await expect(dialog.getByLabel("Header", { exact: true })).not.toBeChecked();
    await expect(repeat).toBeDisabled();
    await expect(dialog.getByLabel("Repeat header rows on new pages")).toBeChecked();
    await dialog.getByLabel("Name", { exact: true }).fill("B udg.et<>");
    await expect(dialog.getByLabel("Name", { exact: true })).toHaveValue("Budget");
    await expect(dialog.getByRole("button", { name: "Insert", exact: true })).toBeDisabled();
    await dialog.getByLabel("Name", { exact: true }).fill("Native_2");
    await dialog.getByLabel("Header", { exact: true }).check();
    await rows.fill("6");
    await repeat.fill("4");
    await rows.fill("2");
    await expect(repeat).toHaveValue("1");
    await rows.fill("6");
    await expect(repeat).toHaveValue("4");
    await columns.fill("64");
    await expect(dialog.getByRole("status")).toContainText(
      "Large tables may adversely affect performance and compatibility",
    );
    await expect(dialog.getByRole("button", { name: "Insert", exact: true })).toBeEnabled();
    await columns.fill("33");
    await rows.fill("256");
    await expect(dialog.getByRole("status")).toBeVisible();
    await rows.fill("3");
    await expect(dialog.getByRole("status")).toHaveCount(0);
    await expect(repeat).toHaveValue("2");
    await dialog.getByRole("button", { name: "Insert", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole("table", { name: "Native_2" })).toHaveCount(1);
    await expect(page.getByRole("table", { name: "Native_2" }).locator("tr")).toHaveCount(3);
    await expect(
      page.getByRole("table", { name: "Native_2" }).locator("tr").first().locator("th"),
    ).toHaveCount(33);
    await expect(
      page.getByRole("table", { name: "Native_2" }).locator("tr").last().locator("td"),
    ).toHaveCount(33);
  });
