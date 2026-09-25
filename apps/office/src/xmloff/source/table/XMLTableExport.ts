/** @fileoverview Emits ordered ODF table blocks from Writer's canonical table graph. */

import { escapeXml, exportOdfLength, type XMLTextParagraphSource } from "../text/txtparae";

/** Ordered text and table blocks supplied by Writer's canonical node array. */
export type XMLTextExportBlock =
  | Readonly<{ kind: "paragraph"; paragraph: XMLTextParagraphSource }>
  | Readonly<{ kind: "table"; table: XMLTableExportSource }>;

/** Neutral table values consumed by the xmloff export pass. */
export interface XMLTableExportSource {
  readonly name: string;
  readonly format: Readonly<{
    width?: number | undefined;
    align?: string | undefined;
    marginLeft?: number | undefined;
    marginTop?: number | undefined;
    marginBottom?: number | undefined;
    borderModel?: string | undefined;
    headerRows?: number | undefined;
    repeatHeaderRows?: boolean | undefined;
  }>;
  readonly columnWidths: readonly number[];
  readonly softPageBreakRows: readonly number[];
  readonly rows: readonly Readonly<{
    format: Readonly<{ minHeight?: number | undefined; keepTogether?: boolean | undefined }>;
    cells: readonly Readonly<{
      format: Readonly<{
        padding?: number | undefined;
        border?: string | undefined;
        verticalAlign?: string | undefined;
      }>;
      paragraphs: readonly XMLTextParagraphSource[];
    }>[];
  }>[];
}

/** Renders table-owned styles and body elements while sharing paragraph automatic styles. */
/** Processes one ODF table value. @param argument1 - Callback input. @param argument2 - Callback input. @param argument3 - Callback input. @returns Callback result. */ export function exportTableBlocks(
  blocks: Iterable<XMLTextExportBlock>,
  renderParagraphs: (paragraphs: Iterable<XMLTextParagraphSource>) => string,
  isCancelled: () => boolean,
): { readonly body: string; readonly automaticStyles: string } {
  let body = "";
  let automaticStyles = "";
  let tableIndex = 0;
  let paragraphRun: XMLTextParagraphSource[] = [];
  const flush = /** Processes one ODF table value.  @returns Callback result. */ (): void => {
    body += renderParagraphs(paragraphRun);
    paragraphRun = [];
  };
  for (const block of blocks) {
    if (isCancelled()) throw new Error("ODT operation was cancelled.");
    if (block.kind === "paragraph") {
      paragraphRun.push(block.paragraph);
      continue;
    }
    flush();
    const table = block.table;
    const prefix = `T${++tableIndex}`;
    const tableProperties = [
      table.format.width === undefined
        ? ""
        : ` style:width="${exportOdfLength(table.format.width)}"`,
      table.format.align === undefined ? "" : ` table:align="${escapeXml(table.format.align)}"`,
      table.format.marginLeft === undefined
        ? ""
        : ` fo:margin-left="${exportOdfLength(table.format.marginLeft)}"`,
      table.format.marginTop === undefined
        ? ""
        : ` fo:margin-top="${exportOdfLength(table.format.marginTop)}"`,
      table.format.marginBottom === undefined
        ? ""
        : ` fo:margin-bottom="${exportOdfLength(table.format.marginBottom)}"`,
      table.format.borderModel === undefined
        ? ""
        : ` table:border-model="${escapeXml(table.format.borderModel)}"`,
    ].join("");
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
      if (rowIndex === repeatedHeaders && repeatedHeaders > 0) body += "</table:table-header-rows>";
      if (table.softPageBreakRows.includes(rowIndex)) body += "<text:soft-page-break/>";
      const rowName = `${prefix}.R${rowIndex + 1}`;
      const rowProperties = `${row.format.minHeight === undefined ? "" : ` style:min-row-height="${exportOdfLength(row.format.minHeight)}"`}${row.format.keepTogether === undefined ? "" : ` fo:keep-together="${row.format.keepTogether ? "always" : "auto"}"`}`;
      automaticStyles += `<style:style style:name="${rowName}" style:family="table-row"><style:table-row-properties${rowProperties}/></style:style>`;
      body += `<table:table-row table:style-name="${rowName}">`;
      for (const [cellIndex, cell] of row.cells.entries()) {
        const cellName = `${rowName}.C${cellIndex + 1}`;
        const cellProperties = `${cell.format.padding === undefined ? "" : ` fo:padding="${exportOdfLength(cell.format.padding)}"`}${cell.format.border === undefined ? "" : ` fo:border="${escapeXml(cell.format.border)}"`}${cell.format.verticalAlign === undefined ? "" : ` style:vertical-align="${escapeXml(cell.format.verticalAlign)}"`}`;
        automaticStyles += `<style:style style:name="${cellName}" style:family="table-cell"><style:table-cell-properties${cellProperties}/></style:style>`;
        body += `<table:table-cell table:style-name="${cellName}" office:value-type="string">${renderParagraphs(cell.paragraphs)}</table:table-cell>`;
      }
      body += "</table:table-row>";
    }
    if (repeatedHeaders === table.rows.length && repeatedHeaders > 0)
      body += "</table:table-header-rows>";
    if (table.softPageBreakRows.includes(table.rows.length)) body += "<text:soft-page-break/>";
    body += "</table:table>";
  }
  flush();
  return { body, automaticStyles };
}
