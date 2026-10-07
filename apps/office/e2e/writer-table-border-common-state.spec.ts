/** @fileoverview Checks native common table-border input, partial changes and selected-row history in Chromium. */
import { expect, test } from "@playwright/test";
import { selectBrowserTableRow } from "../test-support/table-mouse-e2e";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { SvxBoxItem } from "../src/editeng/source/items/frmitems";
import { SvxBorderLine } from "../src/editeng/source/items/borderline";
import { RES_BOX } from "../src/sw/inc/hintids";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
for (const width of [1280, 390])
  test(
    "native common border input and selected four-distance history width=" + width,
    /** Checks actual ODT ingress, dialog command selection and native item application. @param fixtures - Browser fixtures. @param fixtures.page - Production page. @returns Completion. */ async ({
      page,
    }) => {
      const doc = new SwDoc(),
        table = doc.nodes.MakeTableNode("CommonBrowser", { width: 6000 });
      table.AddColumnWidth(3000);
      table.AddColumnWidth(3000);
      for (let row = 0; row < 2; row++)
        for (const [column, cell] of doc.nodes.AppendTableRow(table, 2).GetTabBoxes().entries()) {
          const box = new SvxBoxItem(RES_BOX);
          for (const edge of [0, 1, 2, 3]) {
            box.SetDistance((row + 1) * 100 + edge * 10, edge);
            box.SetLine(
              new SvxBorderLine(
                row === 0 ? (column === 0 ? 0x123456 : 0xabcdef) : 0x654321,
                row === 0 ? 20 : 40,
              ),
              edge,
            );
          }
          cell.SetFormat({ box });
          const text = cell.GetParagraphs()[0];
          if (text === undefined) throw Error("Missing browser border owner");
          text.SetText("Original " + row + column);
        }
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/writer");
      await page.getByRole("button", { name: "Open", exact: true }).click();
      await page.getByRole("tab", { name: "On computer" }).click();
      await page.getByLabel("Browse").setInputFiles({
        buffer: Buffer.from(writeOdtDocument(doc, { title: "Common" })),
        mimeType: "application/vnd.oasis.opendocument.text",
        name: "common.odt",
      });
      const cells = page
        .getByRole("table", { name: "CommonBrowser", exact: true })
        .locator("[data-writer-table-box]");
      await expect(cells).toHaveCount(4);
      await page.getByRole("textbox", { name: "Row 1 column 1 paragraph 1", exact: true }).click();
      await page.getByRole("button", { name: "Table Properties", exact: true }).click();
      await page.getByRole("tab", { name: "Borders", exact: true }).click();
      await expect(page.getByRole("spinbutton", { name: "Cell padding (cm)" })).toHaveValue("0");
      await expect(page.getByRole("combobox", { name: "Cell border" })).toHaveValue("mixed");
      await page.getByRole("spinbutton", { name: "Cell padding (cm)" }).fill("1");
      await page.getByRole("combobox", { name: "Cell border" }).selectOption("none");
      await page.getByRole("button", { name: "Reset", exact: true }).click();
      await expect(page.getByRole("spinbutton", { name: "Cell padding (cm)" })).toHaveValue("0");
      await expect(page.getByRole("combobox", { name: "Cell border" })).toHaveValue("mixed");
      await page.getByRole("button", { name: "Cancel", exact: true }).click();
      await expect(cells.nth(0)).toHaveCSS("padding-top", "6.66667px");
      await selectBrowserTableRow(page, "CommonBrowser", 2);
      await page.getByRole("button", { name: "Table Properties", exact: true }).click();
      await page.getByRole("tab", { name: "Borders", exact: true }).click();
      await expect(page.getByRole("spinbutton", { name: "Cell padding (cm)" })).toHaveValue("0.35");
      await expect(page.getByRole("combobox", { name: "Cell border" })).toHaveValue(
        "2pt solid #654321",
      );
      await page.getByRole("combobox", { name: "Cell border" }).selectOption("none");
      await page.getByRole("button", { name: "OK", exact: true }).click();
      for (const index of [2, 3]) {
        await expect(cells.nth(index)).toHaveCSS("padding-top", "13.3333px");
        await expect(cells.nth(index)).toHaveCSS("padding-bottom", "14px");
        await expect(cells.nth(index)).toHaveCSS("padding-left", "14.6667px");
        await expect(cells.nth(index)).toHaveCSS("padding-right", "15.3333px");
        await expect(cells.nth(index)).toHaveCSS("border-top-style", "none");
        await expect(cells.nth(index)).toHaveCSS("outline-style", "dashed");
      }
      await expect(cells.nth(0)).toHaveCSS("border-top-color", "rgb(18, 52, 86)");
      for (let cycle = 0; cycle < 3; cycle++) {
        await page.getByRole("button", { name: "Undo", exact: true }).click();
        await expect(cells.nth(2)).toHaveCSS("border-top-color", "rgb(101, 67, 33)");
        await page.getByRole("button", { name: "Redo", exact: true }).click();
        await expect(cells.nth(2)).toHaveCSS("border-top-style", "none");
        await expect(cells.nth(2)).toHaveCSS("outline-style", "dashed");
        await expect(cells.nth(2)).toHaveCSS("padding-left", "14.6667px");
      }
    },
  );
