/** @fileoverview Original Word table cell shading through Writer's production file controls. */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { DocumentArchive } from "../src/package/source/zippackage/document-archive";

test("preserves Word table style fills through browser storage and the downloaded DOCX", /** Checks original table shading at desktop and mobile widths. @param fixtures - Playwright fixtures. @param fixtures.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const fixture = fileURLToPath(
    new URL(
      "../../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/tdf138020_undefined_firstCol.docx",
      import.meta.url,
    ),
  );
  const open = page.getByRole("button", { name: "Open", exact: true });
  const cell = page.getByRole("table").first().getByRole("row").first().getByRole("cell").first();
  await page.goto("/writer");
  await open.click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles(fixture);
  await expect(cell).toHaveCSS("background-color", "rgb(217, 242, 208)");
  await expect(page.getByRole("status", { name: "Writer status bar" })).toContainText(
    "Saved locally in this browser.",
  );

  await page.reload();
  await open.click();
  await page.getByRole("tab", { name: "In browser" }).click();
  await page.getByRole("button", { name: "tdf138020_undefined_firstCol", exact: true }).click();
  await expect(cell).toHaveCSS("background-color", "rgb(217, 242, 208)");

  const pending = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download DOCX" }).click();
  const path = await (await pending).path();
  if (!path) throw new Error("Missing DOCX download.");
  const bytes = await readFile(path);
  const archive = await DocumentArchive.open(bytes);
  const body = await archive.readTextEntry("word/document.xml");
  const styles = await archive.readTextEntry("word/styles.xml");
  expect(body).toMatch(/<w:shd [^>]*w:themeFill="accent6"[^>]*\/>/u);
  expect(styles).toMatch(/<w:tblStylePr w:type="band1Vert">.*?<w:shd [^>]*w:fill="D9F2D0"/u);

  await page.setViewportSize({ width: 390, height: 844 });
  await open.click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    name: "Reopened table shading.docx",
    buffer: bytes,
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  await expect(
    page.getByRole("button", { name: "Reopened table shading", exact: true }),
  ).toBeVisible();
  await expect(cell).toHaveCSS("background-color", "rgb(217, 242, 208)");
});
