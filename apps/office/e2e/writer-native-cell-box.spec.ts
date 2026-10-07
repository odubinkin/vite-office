/** @fileoverview Checks independent native border and distance paint in real production Chromium. */
import { expect, test } from "@playwright/test";
import { createWriterDocument } from "../src/sw/source/core/doc/doc";
import { SvxBoxItem } from "../src/editeng/source/items/frmitems";
import { SvxBorderLine } from "../src/editeng/source/items/borderline";
import { RES_BOX } from "../src/sw/inc/hintids";
import { SwFormatFrameSize, SwFrameSize } from "../src/sw/inc/fmtfsize";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
for (const width of [1280, 390])
  for (const fixed of [false, true])
    test(`native four-edge cell paint and text history width=${width} fixed=${fixed}`, /** Checks ODF ingress and browser geometry without upstream access. @param fixtures - Browser fixtures. @param fixtures.page - Production page. @returns Completion. */ async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      const doc = createWriterDocument(),
        table = doc.nodes.MakeTableNode(
          "NativePaint",
          { width: 6000, align: "left" },
          doc.paragraphs[0],
        );
      table.AddColumnWidth(6000);
      const item = new SvxBoxItem(RES_BOX);
      for (const [edge, style] of [0, 2, 3, 11].entries()) {
        const line = new SvxBorderLine(0x112233 + edge, (edge + 1) * 20);
        line.SetBorderLineStyle(style);
        item.SetLine(line, edge);
        item.SetDistance((edge + 1) * 15, edge);
      }
      const row = doc.nodes.AppendTableRow(
          table,
          1,
          {
            frameSize: new SwFormatFrameSize(
              fixed ? SwFrameSize.Fixed : SwFrameSize.Minimum,
              0,
              1200,
            ),
          },
          [{ box: item }],
        ),
        node = row.GetTabBoxes()[0]?.GetParagraphs()[0];
      if (node === undefined) throw Error("Missing native paint owner");
      node.SetText("NativePaintProof");
      const bytes = writeOdtDocument(doc, { title: "Native paint" });
      doc.Dispose();
      await page.goto("/writer");
      await page.getByRole("button", { name: "Open", exact: true }).click();
      await page.getByRole("tab", { name: "On computer" }).click();
      await page.getByLabel("Browse").setInputFiles({
        buffer: Buffer.from(bytes),
        mimeType: "application/vnd.oasis.opendocument.text",
        name: "native-paint.odt",
      });
      const paragraph = page
        .locator("[data-writer-paragraph-id]")
        .filter({ hasText: "NativePaintProof" });
      await expect(paragraph).toHaveCount(1);
      const painted = fixed
        ? paragraph.locator("xpath=ancestor::*[@data-writer-fixed-row-content]")
        : paragraph.locator("xpath=ancestor::td");
      const measured = await painted.evaluate(
        /** Reads actual four-edge device paint. @param cell - Painted native cell. @returns Geometry. */ (
          cell,
        ) => {
          const style = getComputedStyle(cell);
          return {
            borders: [
              style.borderTopWidth,
              style.borderBottomWidth,
              style.borderLeftWidth,
              style.borderRightWidth,
            ].map(
              /** Reads pixel width. @param value - Computed length. @returns Pixels. */ (value) =>
                parseFloat(value),
            ),
            styles: [
              style.borderTopStyle,
              style.borderBottomStyle,
              style.borderLeftStyle,
              style.borderRightStyle,
            ],
            colors: [
              style.borderTopColor,
              style.borderBottomColor,
              style.borderLeftColor,
              style.borderRightColor,
            ],
            padding: [style.paddingTop, style.paddingBottom, style.paddingLeft, style.paddingRight],
            height: cell.getBoundingClientRect().height,
            overflow: style.overflow,
          };
        },
      );
      expect(measured.styles).toEqual(["solid", "dashed", "double", "groove"]);
      expect(measured.colors).toEqual([
        "rgb(17, 34, 51)",
        "rgb(17, 34, 52)",
        "rgb(17, 34, 53)",
        "rgb(17, 34, 54)",
      ]);
      for (const [edge, border] of measured.borders.entries())
        expect(border).toBe(Math.floor(((edge + 1) * 4) / 3));
      expect(measured.padding).toEqual(["1px", "2px", "3px", "4px"]);
      if (fixed) {
        expect(measured.height).toBeCloseTo(80, 1);
        expect(measured.overflow).toBe("hidden");
      }
      await paragraph.click();
      await paragraph.evaluate(
        /** Places the native text caret at its rendered end. @param p - Text surface. @returns Nothing. */ (
          p,
        ) => {
          const selection = window.getSelection();
          if (selection === null) throw Error("Missing browser selection");
          const range = document.createRange();
          range.selectNodeContents(p);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
        },
      );
      await page.keyboard.type("!");
      await expect(paragraph).toHaveText("NativePaintProof!");
      await paragraph.press("Control+z");
      await expect(paragraph).toHaveText("NativePaintProof");
      await paragraph.press("Control+y");
      await expect(paragraph).toHaveText("NativePaintProof!");
      await expect(painted).toHaveCSS("padding-right", "4px");
      await expect(painted).toHaveCSS("border-left-style", "double");
    });
