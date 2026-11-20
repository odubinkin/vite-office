/** @fileoverview Emits ordered ODF table blocks from Writer's canonical table graph. */

import { escapeXml, exportOdfLength, type XMLTextParagraphSource } from "../text/txtparae";
import { encodeStyleName } from "../core/xmluconv";
import type { OdfBoxProperties } from "../style/bordrhdl";
import type { OdfTableVisualProperties } from "./XMLTableImport";
import { exportWritingDirection } from "../style/prhdlfac";
import {
  exportTextFrameStyle,
  exportTextFrameElement,
  type XMLTextFrameExportSource,
} from "../text/XMLTextFrameExport";
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
      relativeWidth?: number | undefined;
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
  readonly columnName: (index: number) => string;
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

/** Renders body and other text sections with shared automatic styles. @param blocks - Primary text blocks. @param renderParagraphs - Shared text exporter. @param isCancelled - Cooperative cancellation. @param sections - Additional text sections. @returns Rendered text and styles. */
export function exportTableBlocks(
  blocks: Iterable<XMLTextExportBlock>,
  renderParagraphs: (
    paragraphs: Iterable<XMLTextParagraphSource>,
    renderFrame: (frame: XMLTextFrameExportSource) => string,
  ) => string,
  isCancelled: () => boolean,
  sections?: Iterable<Iterable<XMLTextExportBlock>>,
): {
  readonly body: string;
  readonly automaticStyles: string;
  readonly sections?: readonly string[];
} {
  let automaticStyles = "";
  const tableStyleNames = new Set<string>();
  let frameIndex = 0;
  /** Shares graphic and table style identity across every nested native text box. @param frame - Native frame properties. @returns Frame XML. */
  function renderFrame(frame: XMLTextFrameExportSource): string {
    const name = `fr${++frameIndex}`;
    automaticStyles += exportTextFrameStyle(frame, name);
    return exportTextFrameElement(frame, name, renderBlocks(frame.content));
  }
  /** Exports ordered text and nested tables with one shared style identity counter. @param content - Blocks in this text section. @returns Ordered XML for the section. */
  function renderBlocks(content: Iterable<XMLTextExportBlock>): string {
    let body = "";
    let paragraphRun: XMLTextParagraphSource[] = [];
    const flush = /** Processes one ODF table value.  @returns Callback result. */ (): void => {
      body += renderParagraphs(paragraphRun, renderFrame);
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
      const base = table.name || "Table";
      let stylePrefix = base;
      let suffix = 0;
      while (tableStyleNames.has(stylePrefix)) stylePrefix = base + ++suffix;
      tableStyleNames.add(stylePrefix);
      const prefix = escapeXml(encodeStyleName(stylePrefix));
      const tableProperties =
        [
          table.format.width === undefined
            ? ""
            : ` style:width="${exportOdfLength(table.format.width)}"`,
          table.format.relativeWidth ? ` style:rel-width="${table.format.relativeWidth}%"` : "",
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
      const columnStyles = new Map<number, string>();
      for (let column = 0; column < table.columnWidths.length;) {
        const width = table.columnWidths[column] as number;
        let name = columnStyles.get(width);
        if (name === undefined) {
          name = escapeXml(encodeStyleName(`${stylePrefix}.${table.columnName(column)}`));
          columnStyles.set(width, name);
          const property =
            width <= 0
              ? ""
              : table.format.relativeWidth
                ? ` style:rel-column-width="${width}*"`
                : ` style:column-width="${exportOdfLength(width)}"`;
          automaticStyles += `<style:style style:name="${name}" style:family="table-column"><style:table-column-properties${property}/></style:style>`;
        }
        let end = column + 1;
        while (table.columnWidths[end] === width) end++;
        const repeat = end - column;
        body += `<table:table-column table:style-name="${name}"${repeat > 1 ? ` table:number-columns-repeated="${repeat}"` : ""}/>`;
        column = end;
      }
      const repeatedHeaders = table.format.repeatHeaderRows
        ? Math.min(table.format.headerRows ?? 0, table.rows.length)
        : 0;
      const rowStyles = new Map<string, string>();
      const cellStyles = new Map<string, string>();
      for (const [rowIndex, row] of table.rows.entries()) {
        if (rowIndex === 0 && repeatedHeaders > 0) body += "<table:table-header-rows>";
        if (rowIndex === repeatedHeaders && repeatedHeaders > 0)
          body += "</table:table-header-rows>";
        if (table.softPageBreakRows.includes(rowIndex)) body += "<text:soft-page-break/>";
        const rowName = escapeXml(encodeStyleName(`${stylePrefix}.${rowIndex + 1}`));
        const rowProperties = `${row.format.height === undefined ? "" : ` style:row-height="${exportOdfLength(row.format.height)}"`}${row.format.minHeight === undefined ? "" : ` style:min-row-height="${exportOdfLength(row.format.minHeight)}"`}${row.format.keepTogether === undefined ? "" : ` fo:keep-together="${row.format.keepTogether ? "always" : "auto"}"`}${exportTableVisualProperties(row.format)}`;
        let rowStyleName = rowStyles.get(rowProperties);
        if (rowProperties && rowStyleName === undefined) {
          rowStyleName = rowName;
          rowStyles.set(rowProperties, rowStyleName);
          automaticStyles += `<style:style style:name="${rowStyleName}" style:family="table-row"><style:table-row-properties${rowProperties}/></style:style>`;
        }
        body += `<table:table-row${rowStyleName === undefined ? "" : ` table:style-name="${rowStyleName}"`}>`;
        let column = 0;
        for (const cell of row.cells) {
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
          let cellName = cellStyles.get(cellProperties);
          if (cellProperties && cellName === undefined) {
            cellName = escapeXml(
              encodeStyleName(`${stylePrefix}.${table.columnName(column)}${rowIndex + 1}`),
            );
            cellStyles.set(cellProperties, cellName);
            automaticStyles += `<style:style style:name="${cellName}" style:family="table-cell"><style:table-cell-properties${cellProperties}/></style:style>`;
          }
          const style = cellName === undefined ? "" : ` table:style-name="${cellName}"`;
          const rowSpan = cell.rowSpan ?? 1;
          const columnSpan = cell.columnSpan ?? 1;
          if (rowSpan < 1) body += `<table:covered-table-cell${style}/>`;
          else {
            const rowSpanAttr = rowSpan > 1 ? ` table:number-rows-spanned="${rowSpan}"` : "";
            const columnSpanAttr =
              columnSpan > 1 ? ` table:number-columns-spanned="${columnSpan}"` : "";
            body += `<table:table-cell${style}${columnSpanAttr}${rowSpanAttr} office:value-type="string">${renderBlocks(cell.content)}</table:table-cell>`;
          }
          for (let covered = 1; covered < columnSpan; covered++)
            body += "<table:covered-table-cell/>";
          column += columnSpan;
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
  const sectionBodies = sections === undefined ? undefined : Array.from(sections, renderBlocks);
  return {
    body,
    automaticStyles,
    ...(sectionBodies === undefined ? {} : { sections: sectionBodies }),
  };
}
