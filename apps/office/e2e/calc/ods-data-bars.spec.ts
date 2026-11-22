/** @fileoverview Production Calc data-bar painting and ODS round trips. */
import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../src/package/source/zippackage/document-archive";

/** Opens raw ODS through the mounted file picker. @param page - Calc page. @param bytes - Document package. @param name - Picker filename. @returns Completion. */
async function openOds(page: Page, bytes: Buffer, name: string): Promise<void> {
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    name,
    mimeType: "application/vnd.oasis.opendocument.spreadsheet",
    buffer: bytes,
  });
  await expect(page.getByRole("dialog")).toHaveCount(0);
}

test("paints imported ODS data bars and reopens a bar-only display", /** Checks the pinned fixture and a single native display attribute through the production grid and ODS output. @param fixtures - Chromium fixtures. @param fixtures.page - Calc page. @returns Completion. */ async ({
  page,
}) => {
  const original = await readFile(
    new URL(
      "../../../../vendor/libreoffice-reference/sc/qa/unit/data/ods/databar.ods",
      import.meta.url,
    ),
  );
  await page.goto("/calc");
  await openOds(page, original, "databar.ods");
  const positive = page.getByRole("gridcell", { name: "B4 2" });
  const positiveText = positive.locator('[id$="-text"]');
  const negative = page.getByRole("gridcell", { name: "B6 -2" });
  await expect(positive.locator("[data-calc-data-bar]")).toHaveCSS(
    "background-image",
    /to right, rgb\(0, 0, 255\)/u,
  );
  await expect(negative.locator("[data-calc-data-bar]")).toHaveCSS(
    "background-image",
    /to left, rgb\(255, 0, 0\)/u,
  );
  await expect(negative.locator("[data-calc-data-bar-axis]")).toHaveCount(1);
  await expect(
    page.getByRole("gridcell", { name: "B10 1" }).locator("[data-calc-data-bar-axis]"),
  ).toHaveCSS("background-image", /rgb\(0, 0, 128\)/u);
  await expect(positiveText).toHaveCSS("clip-path", "none");

  const archive = await DocumentArchive.open(original);
  const writer = new DocumentArchiveWriter();
  for (const entry of archive.getEntryNames()) {
    const bytes =
      entry === "content.xml"
        ? Buffer.from(
            (await archive.readTextEntry(entry)).replace(
              '<calcext:data-bar calcext:negative-color="#ff0000"',
              '<calcext:data-bar calcext:show-value="false" calcext:negative-color="#ff0000"',
            ),
          )
        : await archive.readEntry(entry);
    writer.putNextEntry(entry, bytes);
  }
  await openOds(page, Buffer.from(await writer.finish()), "Only bar.ods");
  await expect(positiveText).toHaveCSS("clip-path", "inset(50%)");
  await positive.click();
  await expect(page.getByRole("textbox", { name: "Input line" })).toHaveValue("2");
  const download = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File", exact: true }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download ODS" }).click();
  const path = await (await download).path();
  if (!path) throw new Error("Chromium did not expose the ODS download.");
  const saved = await readFile(path);
  expect(await (await DocumentArchive.open(saved)).readTextEntry("content.xml")).toContain(
    'calcext:show-value="false"',
  );
  await openOds(page, saved, "Only bar reopened.ods");
  await expect(positive.locator("[data-calc-data-bar]")).toHaveCount(1);
  await expect(positiveText).toHaveCSS("clip-path", "inset(50%)");
});
