/** @fileoverview Verifies production native whole-table page movement and exact ODT split policy. */
import { expect, test } from "@playwright/test";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
for (const width of [1280, 390])
  for (const split of [true, false]) {
    test(`native table split policy uses physical page owners width=${width} split=${split}`, /** Checks ODT page flow and actual editable cell history. @param fixtures - Browser fixtures. @param fixtures.page - Actual browser. @returns Completion. */ async ({
      page,
    }) => {
      const doc = new SwDoc(),
        body = doc.paragraphs[0];
      if (body === undefined) throw new Error("Missing real body");
      body.SetText("Before");
      doc.GetPageDesc().SetValue({
        ...doc.GetPageDesc().GetValue(),
        height: 1600,
        topMargin: 100,
        bottomMargin: 100,
        width: 8000,
        leftMargin: 100,
        rightMargin: 100,
      });
      const table = doc.nodes.MakeTableNode("Split", { width: 6000, layoutSplit: split }, body);
      table.AddColumnWidth(6000);
      for (let r = 0; r < 3; r++) {
        const node = doc.nodes
          .AppendTableRow(table, 1, { minHeight: 400 }, [{ padding: 0, border: "none" }])
          .GetTabBoxes()[0]
          ?.GetParagraphs()[0];
        if (node === undefined) throw new Error("Missing original row");
        node.SetText("Cell" + r);
      }
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/writer");
      await page.getByRole("button", { name: "Open", exact: true }).click();
      await page.getByRole("tab", { name: "On computer" }).click();
      await page.getByLabel("Browse").setInputFiles({
        buffer: Buffer.from(writeOdtDocument(doc, { title: "Split" })),
        mimeType: "application/vnd.oasis.opendocument.text",
        name: "table-split.odt",
      });
      const tables = page.getByRole("table", { name: "Split", exact: true });
      await expect(tables).toHaveCount(split ? 2 : 1);
      const indexes = await tables.evaluateAll(
        /** Reads existing physical page ownership. @param elements - Actual table frames. @returns Page indexes. */ (
          elements,
        ) =>
          elements.map(
            /** Reads one original frame. @param element - Table frame. @returns Physical page. */ (
              element,
            ) => Number(element.closest("[data-writer-page]")?.getAttribute("data-writer-page")),
          ),
      );
      expect(indexes).toEqual(split ? [1, 2] : [2]);
      const rowRanges = await tables.evaluateAll(
        /** Reads original row ownership without model access. @param elements - Actual frames. @returns Original row indexes. */ (
          elements,
        ) =>
          elements.map(
            /** Reads one frame's original rows. @param element - Table frame. @returns Row indexes. */ (
              element,
            ) =>
              [...element.querySelectorAll("tr[data-writer-table-row]")].map(
                /** Reads the original row identity. @param row - Rendered row. @returns Original index. */ (
                  row,
                ) => Number(row.getAttribute("data-writer-table-row")),
              ),
          ),
      );
      expect(rowRanges).toEqual(split ? [[0, 1], [2]] : [[0, 1, 2]]);
      await expect(page.locator('[data-writer-repeated-headline="true"]')).toHaveCount(0);
      const editor = page.getByRole("textbox", { name: "Row 1 column 1 paragraph 1", exact: true });
      await editor.click();
      await editor.evaluate(
        /** Places the browser caret in an actual original cell. @param element - Editable cell. @returns Nothing. */ (
          element,
        ) => {
          const range = document.createRange();
          range.selectNodeContents(element);
          range.collapse(false);
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
          document.dispatchEvent(new Event("selectionchange"));
        },
      );
      await page.keyboard.type("X");
      await expect(editor).toHaveText("Cell0X");
      for (let cycle = 0; cycle < 3; cycle++) {
        await editor.press("Control+z");
        await expect(editor).toHaveText("Cell0");
        await editor.press("Control+y");
        await expect(editor).toHaveText("Cell0X");
        await expect(tables).toHaveCount(split ? 2 : 1);
      }
      await expect(
        page.getByRole("textbox", { name: "Writer document text", exact: true }),
      ).toHaveText("Before");
      await expect(
        page.getByRole("textbox", { name: "Row 3 column 1 paragraph 1", exact: true }),
      ).toHaveText("Cell2");
    });
  }
