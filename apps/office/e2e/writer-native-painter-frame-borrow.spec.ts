/** @fileoverview Verifies original native frame border paint remains correct across browser history and editing. */
import { Color } from "../src/tools/inc/color";
import { expect, test } from "@playwright/test";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { SvxBoxItem } from "../src/editeng/source/items/frmitems";
import { SvxBorderLine } from "../src/editeng/source/items/borderline";
import { RES_BOX } from "../src/sw/inc/hintids";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
for (const width of [1280, 390])
  test(
    "Writer borrowed native border paint survives history and editing width=" + width,
    /** Checks actual source edge winners, native mode history and subsequent cell typing. @param fixtures - Browser fixtures. @param fixtures.page - Original browser. @returns Completion. */ async ({
      page,
    }) => {
      const doc = new SwDoc(),
        table = doc.nodes.MakeTableNode("BorrowedNativePaint", {
          width: 6000,
          borderModel: "collapsing",
        });
      table.AddColumnWidth(3000);
      table.AddColumnWidth(3000);
      for (const [index, cell] of doc.nodes.AppendTableRow(table, 2).GetTabBoxes().entries()) {
        const box = new SvxBoxItem(RES_BOX);
        for (const edge of [0, 1, 2, 3] as const)
          box.SetLine(new SvxBorderLine(new Color(index === 0 ? 0xff0000 : 0x0000ff), 20), edge);
        cell.SetFormat({ box });
        const node = cell.GetParagraphs()[0];
        if (node === undefined) throw Error("Missing original native cell");
        node.SetText(index === 0 ? "Borrowed" : "Neighbor");
      }
      const bytes = writeOdtDocument(doc, { title: "Borrowed native frames" });
      doc.Dispose();
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/writer");
      await page.getByRole("button", { name: "Open", exact: true }).click();
      await page.getByRole("tab", { name: "On computer" }).click();
      await page.getByLabel("Browse").setInputFiles({
        buffer: Buffer.from(bytes),
        mimeType: "application/vnd.oasis.opendocument.text",
        name: "borrowed.odt",
      });
      const view = page.getByRole("table", { name: "BorrowedNativePaint", exact: true }),
        cells = view.locator("td,th"),
        editor = page.getByRole("textbox", { name: "Row 1 column 1 paragraph 1", exact: true });
      await expect(cells).toHaveText(["Borrowed", "Neighbor"]);
      /** Checks the original source shared-edge winner. @returns Completion. */
      async function collapsed() {
        await expect(view).toHaveCSS("border-collapse", "collapse");
        await expect(cells.nth(0)).toHaveCSS("border-right-color", "rgb(0, 0, 255)");
        await expect(cells.nth(1)).toHaveCSS("border-left-color", "rgb(0, 0, 255)");
      }
      await collapsed();
      await editor.click();
      await page
        .getByRole("complementary", { name: "Writer properties sidebar" })
        .getByRole("button", { name: "Table Properties", exact: true })
        .click();
      await page.getByRole("tab", { name: "Borders", exact: true }).click();
      await page
        .getByRole("checkbox", { name: "Merge adjacent line styles", exact: true })
        .uncheck();
      await page.getByRole("button", { name: "OK", exact: true }).click();
      await expect(view).toHaveCSS("border-collapse", "separate");
      await expect(cells.nth(0)).toHaveCSS("border-right-color", "rgb(255, 0, 0)");
      for (let cycle = 0; cycle < 2; cycle++) {
        await page.getByRole("button", { name: "Undo", exact: true }).click();
        await collapsed();
        await page.getByRole("button", { name: "Redo", exact: true }).click();
        await expect(view).toHaveCSS("border-collapse", "separate");
        await expect(cells.nth(0)).toHaveCSS("border-right-color", "rgb(255, 0, 0)");
      }
      await editor.click();
      await editor.press("End");
      await editor.pressSequentially("!");
      await expect(editor).toHaveText("Borrowed!");
      await expect(cells.nth(1)).toHaveText("Neighbor");
      await editor.press("Control+z");
      await expect(editor).toHaveText("Borrowed");
      await expect(view).toHaveCSS("border-collapse", "separate");
    },
  );
