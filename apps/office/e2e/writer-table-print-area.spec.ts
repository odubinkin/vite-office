/** @fileoverview Verifies actual production table alignment, column scaling and repeated headline edits through ODT Open. */
import { nativeBoxFormat } from "../src/test/table-box-test-helpers";
import { SwFormatFrameSize, SwFrameSize } from "../src/sw/inc/fmtfsize";
import { expect, test } from "@playwright/test";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { SwDocShell } from "../src/sw/source/uibase/app/docsh";
import { createDocument } from "../src/sfx2/source/doc/objsh";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";

/** Requires an actual native fixture owner. @param value - Resolved owner. @returns Connected value. */
function required<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error("Missing actual fixture owner");
  return value;
}
for (const viewport of [1280, 390])
  for (const [align, left, width] of [
    ["left", 300, 3000],
    ["center", 1900, 3000],
    ["right", 3800, 3000],
    ["margins", 300, 5900],
  ] as const)
    test(`Writer native table print geometry ${align} width=${viewport}`, /** Exercises real ODT layout and native editing/history. @param fixtures - Browser fixtures. @param fixtures.page - Actual browser. @returns Completion. */ async ({
      page,
    }) => {
      const doc = new SwDoc(),
        body = required(doc.paragraphs[0]);
      body.SetText("Before");
      doc.GetPageDesc().SetValue({
        ...doc.GetPageDesc().GetValue(),
        width: 8000,
        height: 4400,
        leftMargin: 600,
        rightMargin: 600,
        topMargin: 600,
        bottomMargin: 600,
      });
      const table = doc.nodes.MakeTableNode(
        "Geometry",
        {
          align,
          width: 3000,
          marginLeft: 300,
          marginRight: 600,
          headerRows: 1,
          repeatHeaderRows: true,
        },
        body,
      );
      table.AddColumnWidth(1000);
      table.AddColumnWidth(3000);
      for (let row = 0; row < 5; row++)
        for (const [col, box] of doc.nodes
          .AppendTableRow(
            table,
            2,
            { frameSize: new SwFormatFrameSize(SwFrameSize.Minimum, 0, 1000) },
            [
              nativeBoxFormat({ padding: 0, border: "0px none" }),
              nativeBoxFormat({ padding: 0, border: "0px none" }),
            ],
          )
          .GetTabBoxes()
          .entries())
          required(box.GetParagraphs()[0]).SetText(`Cell${row}-${col}`);
      doc.nodes.MakeTextNode("After");
      const metadata = createDocument({ id: "geometry", suiteId: "writer", title: "Geometry" }),
        shell = new SwDocShell(doc, metadata),
        bytes = writeOdtDocument(doc, metadata);
      shell.Close();
      await page.setViewportSize({ width: viewport, height: 900 });
      await page.goto("/writer");
      await page.getByRole("button", { name: "Open", exact: true }).click();
      await page.getByRole("tab", { name: "On computer" }).click();
      await page.getByLabel("Browse").setInputFiles({
        buffer: Buffer.from(bytes),
        mimeType: "application/vnd.oasis.opendocument.text",
        name: "geometry.odt",
      });
      const tables = page.getByRole("table", { name: "Geometry" }),
        copies = page.getByRole("textbox", { name: "Row 1 column 1 paragraph 1", exact: true });
      await expect(copies).toHaveCount(3);
      await expect(tables).toHaveCount(3);
      const bounds = await tables.evaluateAll(
        /** Reads native page/table/cell rectangles. @param elements - Visible table fragments. @returns Physical bounds. */ (
          elements,
        ) =>
          elements.map(
            /** Reads one actual fragment. @param table - Visible table. @returns Relative geometry. */ (
              table,
            ) => {
              const rect = table.getBoundingClientRect(),
                parent = table.closest("[data-writer-page]");
              if (parent === null) throw new Error("Missing native page");
              const page = parent.getBoundingClientRect(),
                cells = table.querySelectorAll("tr:first-child th,tr:first-child td");
              return {
                left: rect.left - page.left - 40,
                width: rect.width,
                columns: [...cells].map(
                  /** Reads actual cell extent. @param cell - Visible native cell. @returns Width. */ (
                    cell,
                  ) => cell.getBoundingClientRect().width,
                ),
              };
            },
          ),
      );
      for (const value of bounds) {
        expect(value.left).toBeCloseTo(left / 15, 0);
        expect(value.width).toBeCloseTo(width / 15, 0);
        expect(value.columns[0]).toBeCloseTo(width / 60, 0);
        expect(value.columns[1]).toBeCloseTo(width / 20, 0);
      }
      await copies.nth(1).click();
      if (align === "margins") await copies.nth(1).press("End");
      else
        await copies.nth(1).evaluate(
          /** Places an explicit native end caret in a wrapped narrow cell. @param element - Actual follow paragraph. @returns Nothing. */ (
            element,
          ) => {
            const text = document.createTreeWalker(element, NodeFilter.SHOW_TEXT).nextNode();
            if (text === null) throw new Error("Missing real header text");
            window
              .getSelection()
              ?.setBaseAndExtent(
                text,
                text.textContent?.length ?? 0,
                text,
                text.textContent?.length ?? 0,
              );
            document.dispatchEvent(new Event("selectionchange"));
          },
        );
      await page.keyboard.type("X");
      for (let i = 0; i < 3; i++) await expect(copies.nth(i)).toHaveText("Cell0-0X");
      await page.keyboard.press("Control+z");
      for (let i = 0; i < 3; i++) await expect(copies.nth(i)).toHaveText("Cell0-0");
      await page.keyboard.press("Control+Shift+z");
      for (let i = 0; i < 3; i++) await expect(copies.nth(i)).toHaveText("Cell0-0X");
      await expect(
        page.getByRole("textbox", { name: "Row 3 column 2 paragraph 1", exact: true }),
      ).toHaveText("Cell2-1");
      await expect(
        page.getByRole("textbox", { name: "Writer document text", exact: true }),
      ).toHaveText("Before");
      await expect(
        page.getByRole("textbox", { name: "Writer paragraph 2", exact: true }),
      ).toHaveText("After");
    });
