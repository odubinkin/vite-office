/** @fileoverview Emits ordered ODF table blocks from Writer's canonical table graph. */

import { escapeXml, exportOdfLength, type XMLTextParagraphSource } from "../text/txtparae";
import type { OdfBoxProperties } from "../style/bordrhdl";
import type { OdfTableVisualProperties } from "./XMLTableImport";
import { exportWritingDirection } from "../style/prhdlfac";
import { WritingMode2 } from "../../../offapi/com/sun/star/text/WritingMode2";

/** Ordered text and table blocks supplied by Writer's canonical node array. */
export type XMLTextExportBlock =
  | Readonly<{ kind: "paragraph"; paragraph: XMLTextParagraphSource }>
  | Readonly<{ kind: "table"; table: XMLTableExportSource }>;

/** Neutral table values consumed by the xmloff export pass. */
export interface XMLTableExportSource {
  readonly name: string;
  readonly format: Readonly<
    OdfTableVisualProperties & {
      width?: number | undefined;
      align?: string | undefined;
      marginLeft?: number | undefined;
      marginRight?: number | undefined;
      marginTop?: number | undefined;
      marginBottom?: number | undefined;
      borderModel?: string | undefined;
      headerRows?: number | undefined;
      repeatHeaderRows?: boolean | undefined;
      layoutSplit?: boolean | undefined;
    }
  >;
  readonly columnWidths: readonly number[];
  readonly softPageBreakRows: readonly number[];
  readonly rows: readonly Readonly<{
    format: Readonly<
      Pick<OdfTableVisualProperties, "background"> & {
        minHeight?: number | undefined;
        height?: number | undefined;
        keepTogether?: boolean | undefined;
      }
    >;
    cells: readonly Readonly<{
      columnSpan?: number | undefined;
      rowSpan?: number | undefined;
      format: Readonly<
        OdfBoxProperties &
          OdfTableVisualProperties & {
            verticalAlign?: string | undefined;
          }
      >;
      content: readonly XMLTextExportBlock[];
    }>[];
  }>[];
}

/** Emits the original style/extension namespaces for native table visual properties. @param format - Table, row or cell properties. @param allowExtendedDirection - Original cell-only extension map. @returns Style attributes. */
function exportTableVisualProperties(
  format: OdfTableVisualProperties,
  allowExtendedDirection = false,
): string {
  let output =
    format.background === undefined ? "" : ` fo:background-color="${escapeXml(format.background)}"`;
  const mode = format.writingMode;
  if (mode === undefined) return output;
  const extended = mode === WritingMode2.BT_LR || mode === WritingMode2.TB_RL90;
  if (!extended || allowExtendedDirection) {
    const token = exportWritingDirection(mode);
    if (token) output += ` ${extended ? "loext" : "style"}:writing-mode="${token}"`;
  }
  return output;
}

/** Renders table-owned styles and body elements while sharing paragraph automatic styles. */
/** Processes one ODF table value. @param argument1 - Callback input. @param argument2 - Callback input. @param argument3 - Callback input. @returns Callback result. */ export function exportTableBlocks(
  blocks: Iterable<XMLTextExportBlock>,
  renderParagraphs: (paragraphs: Iterable<XMLTextParagraphSource>) => string,
  isCancelled: () => boolean,
): { readonly body: string; readonly automaticStyles: string } {
  let automaticStyles = "";
  let tableIndex = 0;
  /** Exports ordered text and nested tables with one shared style identity counter. @param content - Blocks in this text section. @returns Ordered XML for the section. */
  function renderBlocks(content: Iterable<XMLTextExportBlock>): string {
    let body = "";
    let paragraphRun: XMLTextParagraphSource[] = [];
    const flush = /** Processes one ODF table value.  @returns Callback result. */ (): void => {
      body += renderParagraphs(paragraphRun);
      paragraphRun = [];
    };
    for (const block of content) {
      if (isCancelled()) throw new Error("ODT operation was cancelled.");
      if (block.kind === "paragraph") {
        paragraphRun.push(block.paragraph);
        continue;
      }
      flush();
      const table = block.table;
      const prefix = `T${++tableIndex}`;
      const tableProperties =
        [
          table.format.width === undefined
            ? ""
            : ` style:width="${exportOdfLength(table.format.width)}"`,
          table.format.align === undefined ? "" : ` table:align="${escapeXml(table.format.align)}"`,
          table.format.marginLeft === undefined
            ? ""
            : ` fo:margin-left="${exportOdfLength(table.format.marginLeft)}"`,
          table.format.marginRight === undefined
            ? ""
            : ` fo:margin-right="${exportOdfLength(table.format.marginRight)}"`,
          table.format.marginTop === undefined
            ? ""
            : ` fo:margin-top="${exportOdfLength(table.format.marginTop)}"`,
          table.format.marginBottom === undefined
            ? ""
            : ` fo:margin-bottom="${exportOdfLength(table.format.marginBottom)}"`,
          table.format.borderModel === undefined
            ? ""
            : ` table:border-model="${escapeXml(table.format.borderModel)}"`,
          table.format.layoutSplit === undefined
            ? ""
            : ` style:may-break-between-rows="${table.format.layoutSplit ? "true" : "false"}"`,
        ].join("") + exportTableVisualProperties(table.format);
      automaticStyles += `<style:style style:name="${prefix}" style:family="table"><style:table-properties${tableProperties}/></style:style>`;
      body += `<table:table table:name="${escapeXml(table.name)}" table:style-name="${prefix}">`;
      for (const [columnIndex, width] of table.columnWidths.entries()) {
        const styleName = `${prefix}.C${columnIndex + 1}`;
        automaticStyles += `<style:style style:name="${styleName}" style:family="table-column"><style:table-column-properties${width > 0 ? ` style:column-width="${exportOdfLength(width)}"` : ""}/></style:style>`;
        body += `<table:table-column table:style-name="${styleName}"/>`;
      }
      const repeatedHeaders = table.format.repeatHeaderRows
        ? Math.min(table.format.headerRows ?? 0, table.rows.length)
        : 0;
      for (const [rowIndex, row] of table.rows.entries()) {
        if (rowIndex === 0 && repeatedHeaders > 0) body += "<table:table-header-rows>";
        if (rowIndex === repeatedHeaders && repeatedHeaders > 0)
          body += "</table:table-header-rows>";
        if (table.softPageBreakRows.includes(rowIndex)) body += "<text:soft-page-break/>";
        const rowName = `${prefix}.R${rowIndex + 1}`;
        const rowProperties = `${row.format.height === undefined ? "" : ` style:row-height="${exportOdfLength(row.format.height)}"`}${row.format.minHeight === undefined ? "" : ` style:min-row-height="${exportOdfLength(row.format.minHeight)}"`}${row.format.keepTogether === undefined ? "" : ` fo:keep-together="${row.format.keepTogether ? "always" : "auto"}"`}${exportTableVisualProperties(row.format)}`;
        automaticStyles += `<style:style style:name="${rowName}" style:family="table-row"><style:table-row-properties${rowProperties}/></style:style>`;
        body += `<table:table-row table:style-name="${rowName}">`;
        for (const [cellIndex, cell] of row.cells.entries()) {
          const cellName = `${rowName}.C${cellIndex + 1}`;
          let cellProperties = `${cell.format.padding === undefined ? "" : ` fo:padding="${exportOdfLength(cell.format.padding)}"`}${cell.format.border === undefined ? "" : ` fo:border="${escapeXml(cell.format.border)}"`}${cell.format.verticalAlign === undefined ? "" : ` style:vertical-align="${escapeXml(cell.format.verticalAlign)}"`}${cell.format.borderLineWidth === undefined ? "" : ` style:border-line-width="${escapeXml(cell.format.borderLineWidth)}"`}`;
          for (const side of ["Top", "Bottom", "Left", "Right"]) {
            const padding = cell.format[`padding${side}` as keyof OdfBoxProperties],
              border = cell.format[`border${side}` as keyof OdfBoxProperties],
              compound = cell.format[`borderLineWidth${side}` as keyof OdfBoxProperties];
            if (typeof padding === "number")
              cellProperties += ` fo:padding-${side.toLowerCase()}="${exportOdfLength(padding)}"`;
            if (typeof border === "string")
              cellProperties += ` fo:border-${side.toLowerCase()}="${escapeXml(border)}"`;
            if (typeof compound === "string")
              cellProperties += ` style:border-line-width-${side.toLowerCase()}="${escapeXml(compound)}"`;
          }
          cellProperties += exportTableVisualProperties(cell.format, true);
          automaticStyles += `<style:style style:name="${cellName}" style:family="table-cell"><style:table-cell-properties${cellProperties}/></style:style>`;
          const rowSpan = cell.rowSpan ?? 1;
          if (rowSpan < 1) body += `<table:covered-table-cell table:style-name="${cellName}"/>`;
          else {
            const rowSpanAttr = rowSpan > 1 ? ` table:number-rows-spanned="${rowSpan}"` : "";
            body += `<table:table-cell table:style-name="${cellName}"${(cell.columnSpan ?? 1) > 1 ? ` table:number-columns-spanned="${cell.columnSpan}"` : ""}${rowSpanAttr} office:value-type="string">${renderBlocks(cell.content)}</table:table-cell>`;
          }
          for (let covered = 1; covered < (cell.columnSpan ?? 1); covered++)
            body += "<table:covered-table-cell/>";
        }
        body += "</table:table-row>";
      }
      if (repeatedHeaders === table.rows.length && repeatedHeaders > 0)
        body += "</table:table-header-rows>";
      if (table.softPageBreakRows.includes(table.rows.length)) body += "<text:soft-page-break/>";
      body += "</table:table>";
    }
    flush();
    return body;
  }
  const body = renderBlocks(blocks);
  return { body, automaticStyles };
}
