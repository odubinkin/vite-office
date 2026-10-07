/** @fileoverview Checks fixed imported row clipping survives unrelated properties in real Chromium. */
import { expect, test } from "@playwright/test";
import { SwFormatFrameSize, SwFrameSize } from "../src/sw/inc/fmtfsize";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
for (const width of [1280, 390])
  test(
    "Writer unrelated properties preserve fixed row height width=" + width,
    /** Exercises merge-only accept/history over imported native cells. @param fixtures - Browser fixtures. @param fixtures.page - Production browser page. @returns Completion. */ async ({
      page,
    }) => {
      const doc = new SwDoc(),
        table = doc.nodes.MakeTableNode(
          "FixedProperties",
          { width: 3000, borderModel: "collapsing" },
          doc.paragraphs[0],
        );
      table.AddColumnWidth(3000);
      for (const mode of [SwFrameSize.Fixed, SwFrameSize.Minimum]) {
        const row = doc.nodes.AppendTableRow(table, 1, {
            frameSize: new SwFormatFrameSize(mode, 0, 600),
          }),
          node = row.GetTabBoxes()[0]?.GetParagraphs()[0];
        if (node === undefined) throw Error("Missing imported property row");
        node.SetText("Original native paragraph. ".repeat(12));
      }
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/writer");
      await page.getByRole("button", { name: "Open", exact: true }).click();
      await page.getByRole("tab", { name: "On computer" }).click();
      await page.getByLabel("Browse").setInputFiles({
        buffer: Buffer.from(writeOdtDocument(doc, { title: "FixedProperties" })),
        mimeType: "application/vnd.oasis.opendocument.text",
        name: "fixed-properties.odt",
      });
      await expect(page.getByRole("dialog", { name: "Open", exact: true })).toBeHidden();
      const displayed = page.getByRole("table", { name: "FixedProperties", exact: true }),
        fixed = displayed.locator("tr").nth(0),
        editor = fixed.getByRole("textbox"),
        original = "Original native paragraph. ".repeat(12).trim();
      await expect(editor).toHaveText(original);
      await editor.click({ position: { x: 8, y: 8 } });
      await page.getByRole("button", { name: "Table Properties", exact: true }).click();
      await page.getByRole("tab", { name: "Borders", exact: true }).click();
      await page
        .getByRole("checkbox", { name: "Merge adjacent line styles", exact: true })
        .uncheck();
      await page.getByRole("button", { name: "OK", exact: true }).click();
      for (let cycle = 0; cycle < 3; cycle++) {
        await expect(fixed.locator("[data-writer-fixed-row-content]")).toHaveCSS("height", "40px");
        await expect(fixed.locator("[data-writer-fixed-row-content]")).toHaveCSS(
          "overflow",
          "hidden",
        );
        await expect(displayed).toHaveCSS("border-collapse", "separate");
        await page.getByRole("button", { name: "Undo", exact: true }).click();
        await expect(displayed).toHaveCSS("border-collapse", "collapse");
        await expect(fixed.locator("[data-writer-fixed-row-content]")).toHaveCSS("height", "40px");
        await page.getByRole("button", { name: "Redo", exact: true }).click();
        await expect(displayed).toHaveCSS("border-collapse", "separate");
        await expect(fixed.locator("[data-writer-fixed-row-content]")).toHaveCSS("height", "40px");
        await expect(editor).toHaveText(original);
      }
      await editor.click({ position: { x: 8, y: 8 } });
      await page.keyboard.press("End");
      await page.keyboard.type("!");
      await expect(editor).toContainText("!");
      await expect(fixed.locator("[data-writer-fixed-row-content]")).toHaveCSS("height", "40px");
    },
  );
