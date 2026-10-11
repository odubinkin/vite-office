/** @fileoverview Checks actual native follow classification in paginated bullet rendering, editing, history and reopen. */
import { expect, test, type Page } from "@playwright/test";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
/** Opens the actual document through the local file dialog. @param page - Chromium page. @param bytes - Authored native ODT. @returns Completion. */
async function open(page: Page, bytes: Uint8Array): Promise<void> {
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: Buffer.from(bytes),
    mimeType: "application/vnd.oasis.opendocument.text",
    name: "follow.odt",
  });
}
test("one original bullet has native master/follows through reformat, edit, history and reopen", /** Checks actual glyph suppression on continuations and source-fragment text preservation. @param fixtures - Browser fixtures. @param fixtures.page - Actual Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  if (node === undefined) throw Error("Missing original text");
  const text = "Original text-frame continuation in physical Writer pages. ".repeat(160);
  node.SetText(text);
  doc.EnsureNumRule("NativeFollow", "bullet");
  node.SetNumRule("NativeFollow");
  node.AddToList();
  const bytes = writeOdtDocument(doc, { title: "Native follow" });
  doc.Dispose();
  await page.goto("/writer");
  await open(page, bytes);
  const fragments = page.locator("[data-writer-page] p[data-writer-paragraph-id]"),
    marker = page.locator("[data-writer-page] [data-writer-list-marker]"),
    undo = page.getByRole("button", { name: "Undo", exact: true }),
    redo = page.getByRole("button", { name: "Redo", exact: true });
  await expect
    .poll(
      /** Counts actual native paragraph fragments. @returns Fragment count. */ () =>
        fragments.count(),
    )
    .toBeGreaterThan(1);
  expect((await fragments.allTextContents()).join("")).toBe(text);
  await expect(marker).toHaveCount(1);
  await fragments.first().click();
  await page
    .getByRole("toolbar", { name: "Writer formatting toolbar" })
    .getByRole("button", { name: "Increase", exact: true })
    .click();
  await expect(marker).toHaveCount(1);
  expect((await fragments.allTextContents()).join("")).toBe(text);
  await undo.click();
  await expect(marker).toHaveCount(1);
  await fragments.first().click();
  await fragments.first().press("Control+Home");
  await page.keyboard.type("X");
  await expect
    .poll(
      /** Reads original text across actual native continuations. @returns Complete original text. */ async () =>
        (await fragments.allTextContents()).join(""),
    )
    .toBe("X" + text);
  await expect(marker).toHaveCount(1);
  await undo.click();
  await expect
    .poll(
      /** Reads undo through current physical fragments. @returns Complete text. */ async () =>
        (await fragments.allTextContents()).join(""),
    )
    .toBe(text);
  await redo.click();
  await expect
    .poll(
      /** Reads redo through current original fragments. @returns Complete text. */ async () =>
        (await fragments.allTextContents()).join(""),
    )
    .toBe("X" + text);
  await expect(marker).toHaveCount(1);
  await open(page, bytes);
  await expect
    .poll(
      /** Reads reopened original document fragments. @returns Complete text. */ async () =>
        (await fragments.allTextContents()).join(""),
    )
    .toBe(text);
  await expect(marker).toHaveCount(1);
});
