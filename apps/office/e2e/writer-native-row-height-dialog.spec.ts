/** @fileoverview Checks the source-shaped height dialog and row mode history in real Chromium. */
import { expect, test } from "@playwright/test";
import { SwFormatFrameSize, SwFrameSize } from "../src/sw/inc/fmtfsize";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
for (const width of [1280, 390])
  test(
    "Writer native row height dialog width=" + width,
    /** Exercises separate command, Fixed/Minimum clipping, Cancel and native history. @param fixtures - Browser fixtures. @param fixtures.page - Production page. @returns Completion. */ async ({
      page,
    }) => {
      const doc = new SwDoc(),
        table = doc.nodes.MakeTableNode("RowHeight", { width: 3000 }, doc.paragraphs[0]);
      table.AddColumnWidth(3000);
      for (const type of [SwFrameSize.Fixed, SwFrameSize.Minimum]) {
        const row = doc.nodes.AppendTableRow(table, 1, {
            frameSize: new SwFormatFrameSize(type, 0, 600),
          }),
          node = row.GetTabBoxes()[0]?.GetParagraphs()[0];
        if (node === undefined) throw Error("Missing native browser height owner");
        node.SetText("Original native text. ".repeat(12));
      }
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/writer");
      await page.getByRole("button", { name: "Open", exact: true }).click();
      await page.getByRole("tab", { name: "On computer" }).click();
      await page.getByLabel("Browse").setInputFiles({
        buffer: Buffer.from(writeOdtDocument(doc, { title: "RowHeight" })),
        mimeType: "application/vnd.oasis.opendocument.text",
        name: "row-height.odt",
      });
      await expect(page.getByRole("dialog", { name: "Open", exact: true })).toBeHidden();
      const shown = page.getByRole("table", { name: "RowHeight", exact: true }),
        first = shown.locator("tr").nth(0),
        other = shown.locator("tr").nth(1),
        editor = first.getByRole("textbox");
      const original = "Original native text. ".repeat(12).trim();
      await editor.click({ position: { x: 8, y: 8 } });
      /** Opens the source Table > Size > Row Height command. @returns Completion. */
      async function open(): Promise<void> {
        await page.getByRole("button", { name: "Table", exact: true }).click();
        await page.getByRole("menuitem", { name: "Size", exact: true }).hover();
        await page.getByRole("menuitem", { name: "Row Height…", exact: true }).click();
      }
      await open();
      const height = page.getByRole("spinbutton", { name: "Height (cm)", exact: true }),
        fit = page.getByRole("checkbox", { name: "Fit to size", exact: true });
      await expect(height).toBeFocused();
      await expect(height).toHaveValue("1.06");
      await expect(fit).not.toBeChecked();
      await height.fill("1.59");
      await fit.check();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog", { name: "Row Height", exact: true })).toBeHidden();
      await expect(first.locator("[data-writer-fixed-row-content]")).toHaveCSS("height", "40px");
      await open();
      await height.fill("1.59");
      await fit.check();
      await height.press("Enter");
      for (let cycle = 0; cycle < 3; cycle++) {
        await expect(first.locator("[data-writer-fixed-row-content]")).toHaveCount(0);
        await expect(other.locator("[data-writer-fixed-row-content]")).toHaveCount(0);
        await expect(editor).toHaveText(original);
        await page.getByRole("button", { name: "Undo", exact: true }).click();
        await expect(first.locator("[data-writer-fixed-row-content]")).toHaveCSS("height", "40px");
        await page.getByRole("button", { name: "Redo", exact: true }).click();
        await expect(first.locator("[data-writer-fixed-row-content]")).toHaveCount(0);
      }
      await editor.click({ position: { x: 8, y: 8 } });
      await open();
      await expect(fit).toBeChecked();
      await fit.uncheck();
      await height.fill("1.06");
      await page.getByRole("button", { name: "OK", exact: true }).click();
      await expect(first.locator("[data-writer-fixed-row-content]")).toHaveCSS(
        "height",
        "40.0625px",
      );
      await expect(other.locator("[data-writer-fixed-row-content]")).toHaveCount(0);
      await editor.click({ position: { x: 8, y: 8 } });
      await page.keyboard.press("End");
      await page.keyboard.type("!");
      await expect(editor).toContainText("!");
    },
  );
