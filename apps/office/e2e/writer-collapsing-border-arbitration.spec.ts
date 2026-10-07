/** @fileoverview Verifies source border competition and mode history in current production Chromium. */
import { expect, test } from "@playwright/test";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { SvxBoxItem } from "../src/editeng/source/items/frmitems";
import { SvxBorderLine } from "../src/editeng/source/items/borderline";
import { RES_BOX } from "../src/sw/inc/hintids";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
for (const width of [1280, 390])
  test(
    "native shared-border winner and mode history width=" + width,
    /** Checks source tie/double/gap/style competition in real imported native cells. @param fixtures - Browser devices. @param fixtures.page - Production page. @returns Completion. */ async ({
      page,
    }) => {
      const doc = new SwDoc(),
        table = doc.nodes.MakeTableNode("NativeConflictBrowser", {
          width: 6000,
          borderModel: "collapsing",
        });
      table.AddColumnWidth(3000);
      table.AddColumnWidth(3000);
      for (const [r, pair] of [
        [new SvxBorderLine(0xff0000, 20), new SvxBorderLine(0x0000ff, 20)],
        [new SvxBorderLine(0xff0000, 20, 2), new SvxBorderLine(0x0000ff, 20)],
        [new SvxBorderLine(0xff0000, 60), new SvxBorderLine(0x0000ff, 60, 3)],
      ].entries()) {
        for (const [c, cell] of doc.nodes.AppendTableRow(table, 2).GetTabBoxes().entries()) {
          const box = new SvxBoxItem(RES_BOX);
          box.SetAllDistances(28);
          box.SetLine(pair[c], c === 0 ? 3 : 2);
          cell.SetFormat({ box });
          const node = cell.GetParagraphs()[0];
          if (node === undefined) throw Error("Missing arbitration cell");
          node.SetText("Original " + r + c);
        }
      }
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/writer");
      await page.getByRole("button", { name: "Open", exact: true }).click();
      await page.getByRole("tab", { name: "On computer" }).click();
      await page.getByLabel("Browse").setInputFiles({
        buffer: Buffer.from(writeOdtDocument(doc, { title: "Conflict" })),
        mimeType: "application/vnd.oasis.opendocument.text",
        name: "conflict.odt",
      });
      const view = page.getByRole("table", { name: "NativeConflictBrowser", exact: true }),
        cells = view.locator("td");
      await expect(cells).toHaveCount(6);
      await expect(cells).toHaveText([
        "Original 00",
        "Original 01",
        "Original 10",
        "Original 11",
        "Original 20",
        "Original 21",
      ]);
      /** Checks native new-winner colors and source style ordering. @returns Completion. */
      async function collapsed(): Promise<void> {
        await expect(view).toHaveCSS("border-collapse", "collapse");
        for (let row = 0; row < 3; row++) {
          await expect(cells.nth(row * 2)).toHaveCSS("border-right-color", "rgb(0, 0, 255)");
          await expect(cells.nth(row * 2 + 1)).toHaveCSS("border-left-color", "rgb(0, 0, 255)");
        }
        await expect(cells.nth(2)).toHaveCSS("border-right-style", "solid");
        await expect(cells.nth(4)).toHaveCSS("border-right-style", "double");
        const left = await cells.nth(0).boundingBox(),
          right = await cells.nth(1).boundingBox();
        if (left === null || right === null) throw Error("Missing shared border geometry");
        expect(Math.abs(left.x + left.width - right.x)).toBeLessThan(1);
      }
      await collapsed();
      await page.getByRole("textbox", { name: "Row 1 column 1 paragraph 1", exact: true }).click();
      await page.getByRole("button", { name: "Table Properties", exact: true }).click();
      await page.getByRole("tab", { name: "Borders", exact: true }).click();
      await page
        .getByRole("checkbox", { name: "Merge adjacent line styles", exact: true })
        .uncheck();
      await page.getByRole("button", { name: "OK", exact: true }).click();
      await expect(view).toHaveCSS("border-collapse", "separate");
      await expect(cells.nth(0)).toHaveCSS("border-right-color", "rgb(255, 0, 0)");
      await expect(cells.nth(2)).toHaveCSS("border-right-style", "dashed");
      for (let cycle = 0; cycle < 3; cycle++) {
        await page.getByRole("button", { name: "Undo", exact: true }).click();
        await collapsed();
        await page.getByRole("button", { name: "Redo", exact: true }).click();
        await expect(view).toHaveCSS("border-collapse", "separate");
        await expect(cells.nth(0)).toHaveCSS("border-right-color", "rgb(255, 0, 0)");
      }
      const editor = page.getByRole("textbox", { name: "Row 1 column 1 paragraph 1", exact: true });
      await editor.click();
      await editor.press("End");
      await editor.pressSequentially("!");
      await expect(editor).toContainText("!");
      await expect(cells.nth(1)).toHaveText("Original 01");
      await expect(cells.nth(5)).toHaveText("Original 21");
    },
  );
