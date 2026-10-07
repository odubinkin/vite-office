/** @fileoverview Verifies production collapsing/separating table models and native checkbox history in Chromium. */
import { expect, test } from "@playwright/test";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { SvxBoxItem } from "../src/editeng/source/items/frmitems";
import { SvxBorderLine } from "../src/editeng/source/items/borderline";
import { RES_BOX } from "../src/sw/inc/hintids";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
import { selectBrowserTableRow } from "../test-support/table-mouse-e2e";
for (const width of [1280, 390])
  test(
    "native coupled border and merging item acceptance width=" + width,
    /** Checks current production input and coupled native table/cell items share one history action. @param fixtures - Browser fixtures. @param fixtures.page - Production browser. @returns Completion. */ async ({
      page,
    }) => {
      const doc = new SwDoc(),
        table = doc.nodes.MakeTableNode("CoupledBrowser", {
          width: 6000,
          borderModel: "separating",
        });
      table.AddColumnWidth(3000);
      table.AddColumnWidth(3000);
      for (let row = 0; row < 2; row++)
        for (const [column, box] of doc.nodes.AppendTableRow(table, 2).GetTabBoxes().entries()) {
          const item = new SvxBoxItem(RES_BOX);
          item.SetAllDistances(28);
          box.SetFormat({ box: item });
          const node = box.GetParagraphs()[0];
          if (node === undefined) throw Error("Missing coupled owner");
          node.SetText("Original " + row + column);
        }
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/writer");
      await page.getByRole("button", { name: "Open", exact: true }).click();
      await page.getByRole("tab", { name: "On computer" }).click();
      await page.getByLabel("Browse").setInputFiles({
        buffer: Buffer.from(writeOdtDocument(doc, { title: "Coupled" })),
        mimeType: "application/vnd.oasis.opendocument.text",
        name: "coupled.odt",
      });
      const view = page.getByRole("table", { name: "CoupledBrowser", exact: true }),
        cells = view.locator("td");
      await expect(cells).toHaveCount(4);
      await expect(cells).toHaveText(["Original 00", "Original 01", "Original 10", "Original 11"]);
      const original = await cells.allTextContents();
      await expect(view).toHaveCSS("border-collapse", "separate");
      await selectBrowserTableRow(page, "CoupledBrowser", 2);
      await page.getByRole("button", { name: "Table Properties", exact: true }).click();
      await page.getByRole("tab", { name: "Borders", exact: true }).click();
      await page.getByRole("checkbox", { name: "Merge adjacent line styles", exact: true }).check();
      await page
        .getByRole("button", { name: "Outer Border and All Inner Lines", exact: true })
        .click();
      await page
        .getByRole("combobox", { name: "Border thickness", exact: true })
        .selectOption("225");
      await page.getByLabel("Border line color", { exact: true }).fill("#abcdef");
      await page.getByRole("button", { name: "OK", exact: true }).click();
      await expect(view).toHaveCSS("border-collapse", "collapse");
      await expect(cells.nth(2)).toHaveCSS("border-left-style", "solid");
      await expect(cells.nth(2)).toHaveCSS("border-left-color", "rgb(171, 205, 239)");
      await expect(cells.nth(0)).toHaveCSS("border-left-style", "none");
      for (let cycle = 0; cycle < 3; cycle++) {
        await page.getByRole("button", { name: "Undo", exact: true }).click();
        await expect(view).toHaveCSS("border-collapse", "separate");
        await expect(cells.nth(2)).toHaveCSS("border-left-style", "none");
        await page.getByRole("button", { name: "Redo", exact: true }).click();
        await expect(view).toHaveCSS("border-collapse", "collapse");
        await expect(cells.nth(2)).toHaveCSS("border-left-color", "rgb(171, 205, 239)");
        expect(await cells.allTextContents()).toEqual(original);
      }
    },
  );
for (const width of [1280, 390])
  for (const model of ["collapsing", "separating", undefined] as const)
    test(
      "native table merging model=" + model + " width=" + width,
      /** Exercises actual imported table format, native controls, history and continued editing. @param fixtures - Browser fixtures. @param fixtures.page - Production browser. @returns Completion. */ async ({
        page,
      }) => {
        const doc = new SwDoc(),
          table = doc.nodes.MakeTableNode("MergeBrowser", { width: 6000, borderModel: model });
        table.AddColumnWidth(3000);
        table.AddColumnWidth(3000);
        for (let row = 0; row < 2; row++)
          for (const [column, box] of doc.nodes.AppendTableRow(table, 2).GetTabBoxes().entries()) {
            const item = new SvxBoxItem(RES_BOX);
            for (const edge of [0, 1, 2, 3])
              item.SetLine(new SvxBorderLine(column ? 0x123456 : 0xabcdef, column ? 45 : 20), edge);
            item.SetAllDistances(28);
            box.SetFormat({ box: item });
            const node = box.GetParagraphs()[0];
            if (node === undefined) throw Error("Missing browser merge cell");
            node.SetText("Original " + row + column);
          }
        await page.setViewportSize({ width, height: 900 });
        await page.goto("/writer");
        await page.getByRole("button", { name: "Open", exact: true }).click();
        await page.getByRole("tab", { name: "On computer" }).click();
        await page.getByLabel("Browse").setInputFiles({
          buffer: Buffer.from(writeOdtDocument(doc, { title: "Merge" })),
          mimeType: "application/vnd.oasis.opendocument.text",
          name: "merge.odt",
        });
        const view = page.getByRole("table", { name: "MergeBrowser", exact: true }),
          cells = view.locator("td"),
          initial = model === "collapsing",
          next = initial ? "separate" : "collapse";
        await expect(view).toHaveCSS("border-collapse", initial ? "collapse" : "separate");
        await expect(view).toHaveCSS("border-spacing", "0px");
        await expect(cells).toHaveCount(4);
        const original = await cells.allTextContents();
        await selectBrowserTableRow(page, "MergeBrowser", 2);
        /** Opens the actual source-owned table page. @returns Native checkbox locator. */
        async function open() {
          await page.getByRole("button", { name: "Table Properties", exact: true }).click();
          await page.getByRole("tab", { name: "Borders", exact: true }).click();
          return page.getByRole("checkbox", { name: "Merge adjacent line styles", exact: true });
        }
        let check = await open();
        await expect(check).toBeChecked({ checked: initial });
        await check.click();
        await page.getByRole("button", { name: "Reset", exact: true }).click();
        await expect(check).toBeChecked({ checked: initial });
        await check.click();
        await page.getByRole("button", { name: "Cancel", exact: true }).click();
        await expect(view).toHaveCSS("border-collapse", initial ? "collapse" : "separate");
        check = await open();
        await check.click();
        await page.getByRole("button", { name: "OK", exact: true }).click();
        await expect(view).toHaveCSS("border-collapse", next);
        for (let cycle = 0; cycle < 3; cycle++) {
          await page.getByRole("button", { name: "Undo", exact: true }).click();
          await expect(view).toHaveCSS("border-collapse", initial ? "collapse" : "separate");
          await page.getByRole("button", { name: "Redo", exact: true }).click();
          await expect(view).toHaveCSS("border-collapse", next);
          expect(await cells.allTextContents()).toEqual(original);
        }
        const left = await cells.nth(0).boundingBox(),
          right = await cells.nth(1).boundingBox();
        if (left === null || right === null) throw Error("Missing contiguous native cells");
        expect(Math.abs(left.x + left.width - right.x)).toBeLessThan(1);
        await expect(cells.nth(0)).toHaveCSS(
          "border-right-color",
          next === "collapse" ? "rgb(18, 52, 86)" : "rgb(171, 205, 239)",
        );
        await expect(cells.nth(1)).toHaveCSS("border-left-color", "rgb(18, 52, 86)");
        const editor = page.getByRole("textbox", {
          name: "Row 2 column 1 paragraph 1",
          exact: true,
        });
        await editor.click();
        await editor.press("End");
        await editor.pressSequentially("!");
        await expect(editor).toContainText("!");
        await expect(view).toHaveCSS("border-collapse", next);
      },
    );
