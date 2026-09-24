/** @fileoverview Checks Writer page breaks at two Chromium device pixel ratios. */

import { expect, test } from "@playwright/test";

import { createDocument } from "../src/sfx2/source/doc/objsh";
import { createWriterDocument } from "../src/sw/source/core/doc/doc";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
import { SwDocShell } from "../src/sw/source/uibase/app/docsh";
import { SwWrtShell } from "../src/sw/source/uibase/wrtsh/wrtsh";

test("Writer keeps measured page breaks across device pixel ratios", /** Opens one document with two device scales. @param root0 - Playwright fixtures. @param root0.browser - Chromium browser. @returns Completion after both page counts. */ async ({
  browser,
}) => {
  const metadata = createDocument({
    id: "layout-ratios",
    suiteId: "writer",
    title: "Layout Ratios",
  });
  const document = createWriterDocument();
  const text = "Measured Writer paragraph for physical page comparison. ".repeat(160);
  new SwWrtShell(new SwDocShell(document, metadata)).Insert(text);
  const bytes = writeOdtDocument(document, metadata);
  const counts: number[] = [];
  for (const deviceScaleFactor of [1, 2]) {
    const context = await browser.newContext({
      deviceScaleFactor,
      viewport: { width: 1280, height: 800 },
    });
    try {
      const page = await context.newPage();
      await page.goto("http://127.0.0.1:4173/writer");
      await page.getByRole("button", { name: "Open" }).click();
      await page.getByRole("tab", { name: "On computer" }).click();
      await page.getByLabel("Browse").setInputFiles({
        buffer: Buffer.from(bytes),
        mimeType: "application/vnd.oasis.opendocument.text",
        name: "layout-ratios.odt",
      });
      const fragments = page.locator("[data-writer-page] [data-writer-paragraph-id]");
      await expect
        .poll(
          /** Counts paginated text fragments. @returns Fragment count. */ () => fragments.count(),
        )
        .toBeGreaterThan(1);
      expect((await fragments.allTextContents()).join("")).toBe(text);
      counts.push(await page.locator("[data-writer-page]").count());
    } finally {
      await context.close();
    }
  }
  expect(counts[0]).toBeGreaterThan(1);
  expect(counts[1]).toBe(counts[0]);
});
