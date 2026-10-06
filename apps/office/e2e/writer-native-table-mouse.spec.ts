/** @fileoverview Checks real native row, column, corner and captured table drag in production Chromium. */
import { expect, test } from "@playwright/test";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { createDocument } from "../src/sfx2/source/doc/objsh";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
import { exposeBrowserTableEdge } from "../test-support/table-mouse-e2e";
/** Requires a real fixture owner. @param value - Optional connected owner. @returns Actual owner. */
function required<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error("Missing real mouse fixture owner");
  return value;
}
for (const width of [1280, 390])
  test(`Writer native table mouse edge and drag width=${width}` /** Uses ordinary production Open and real platform mouse gestures. @param fixtures - Browser fixtures. @param fixtures.page - Production page. @returns Nothing. */, async ({
    page,
  }) => {
    const doc = new SwDoc(),
      body = required(doc.paragraphs[0]),
      table = doc.nodes.MakeTableNode(
        "Mouse",
        { width: 4500, marginTop: 600, ...(width === 390 ? { align: "left" as const } : {}) },
        body,
      );
    body.SetText("Body neighbor");
    for (let c = 0; c < 3; c++) table.AddColumnWidth(1500);
    for (let r = 0; r < 3; r++) {
      const row = doc.nodes.AppendTableRow(table, 3, { minHeight: 750 });
      for (const [c, box] of row.GetTabBoxes().entries())
        required(box.GetParagraphs()[0]).SetText(`Cell${r}${c}`);
    }
    const bytes = writeOdtDocument(
      doc,
      createDocument({ id: "mouse", suiteId: "writer", title: "Mouse" }),
    );
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/writer");
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("tab", { name: "On computer" }).click();
    await page.getByLabel("Browse").setInputFiles({
      buffer: Buffer.from(bytes),
      mimeType: "application/vnd.oasis.opendocument.text",
      name: "mouse.odt",
    });
    await expect(page.getByRole("dialog", { name: "Open", exact: true })).toBeHidden();
    const displayed = page.getByRole("table", { name: "Mouse", exact: true }),
      selected = displayed.locator('[data-writer-editor-selected="true"]');
    const bounds = await exposeBrowserTableEdge(page, displayed);
    const x = bounds.x,
      y = bounds.y,
      h = bounds.height / 3,
      w = bounds.width / 3;
    await expect(page.getByRole("button", { name: "Select row 1 in Mouse" })).toHaveCount(0);
    const host = page.locator("[data-writer-editing-host]");
    await page.mouse.move(x - 7, y + h / 2);
    await expect(host).toHaveCSS("cursor", /url\(.+\) 14 8, default/);
    await page.mouse.move(x + w, y + h / 2);
    await expect(host).toHaveCSS("cursor", "col-resize");
    await page.mouse.move(x + w / 2, y + h);
    await expect(host).toHaveCSS("cursor", "row-resize");
    await page.mouse.move(x + w / 2, y + h / 2);
    await expect(host).toHaveCSS("cursor", "auto");
    await page.mouse.move(x - 7, y - 7);
    await expect(host).toHaveCSS("cursor", /url\(.+\) 14 14, default/);
    await page.mouse.click(x - 10, y + h / 2);
    await expect(selected).toHaveCount(0);
    await page.mouse.click(x - 7, y + h / 2);
    await expect(selected).toHaveCount(3);
    await page.mouse.move(x - 7, y + h / 2);
    await expect(host).toHaveCSS("cursor", /url\(.+\) 14 8, default/);
    await page.mouse.move(x + w, y + h / 2);
    await expect(host).toHaveCSS("cursor", /url\(.+\) 14 8, default/);
    await page.mouse.move(x + w / 2, y - 7);
    await expect(host).toHaveCSS("cursor", /url\(.+\) 7 14, default/);
    await page.mouse.move(x - 7, y + h / 2);
    await page.mouse.down();
    await page.mouse.move(x + 2 * w, y + 2.5 * h);
    await expect(selected).toHaveCount(9);
    await page.mouse.move(x + 2 * w, y + 1.5 * h);
    await expect(selected).toHaveCount(6);
    await page.mouse.up();
    await page.mouse.click(x + 1.5 * w, y - 7);
    await expect(selected).toHaveCount(3);
    for (let r = 0; r < 3; r++)
      await expect(displayed.locator("tr").nth(r).locator("td").nth(1)).toHaveAttribute(
        "data-writer-editor-selected",
        "true",
      );
    await page.mouse.move(x + w / 2, y - 7);
    await page.mouse.down();
    await page.mouse.move(x + 2.5 * w, y + 2 * h);
    await expect(selected).toHaveCount(9);
    await page.mouse.move(x + 1.5 * w, y + 2 * h);
    await expect(selected).toHaveCount(6);
    await page.mouse.up();
    await page.mouse.click(x - 7, y - 7);
    await expect(selected).toHaveCount(9);
    await page.getByRole("button", { name: "Bold", exact: true }).click();
    await expect(displayed.locator("strong")).toHaveCount(9);
    await page.keyboard.press("Control+z");
    await expect(displayed.locator("strong")).toHaveCount(0);
    await page.keyboard.press("Control+y");
    await expect(displayed.locator("strong")).toHaveCount(9);
    await expect(
      page.getByRole("textbox", { name: "Writer document text", exact: true }),
    ).toHaveText("Body neighbor");
  });
