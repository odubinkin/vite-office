/** @fileoverview Verifies the existing detached XML table ingress does not invent a missing header count. */
import { expect, it } from "vitest";
import { exportTextParagraphs, type XMLTextParagraphSource } from "../text/txtparae";
import type { XMLTableExportSource } from "./XMLTableExport";

it("exports all ordinary cells when a legacy repeat flag omits the numeric header count", /** Exercises the real shared text/table export pass and preserves the detached input. @returns Nothing. */ () => {
  const paragraph: XMLTextParagraphSource = {
      style: "Standard",
      runs: [
        {
          text: "Original & preserved",
          properties: { bold: false, italic: false, underline: false },
        },
      ],
    },
    table: XMLTableExportSource = {
      name: "MissingHeaderCount",
      format: { repeatHeaderRows: true },
      columnWidths: [3000],
      softPageBreakRows: [],
      rows: [{ format: {}, cells: [{ format: {}, paragraphs: [paragraph] }] }],
    };
  const result = exportTextParagraphs({
    paragraphs:
      /** Supplies the actual table paragraph for automatic-style collection. @returns Original text owners. */ () => [
        paragraph,
      ],
    blocks:
      /** Supplies the public detached table boundary. @returns Original ordered table. */ () => [
        { kind: "table", table },
      ],
  });
  expect(result.body).toContain('table:name="MissingHeaderCount"');
  expect(result.body).toContain("<table:table-row");
  expect(result.body).toContain("<table:table-cell");
  expect(result.body).toContain("Original<text:s/>&amp;<text:s/>preserved");
  expect(result.body).not.toContain("table:table-header-rows");
  expect(result.automaticStyles).toContain('style:family="table-row"');
  expect(table.format).toEqual({ repeatHeaderRows: true });
  expect(table.rows[0]?.cells[0]?.paragraphs[0]).toBe(paragraph);
});
