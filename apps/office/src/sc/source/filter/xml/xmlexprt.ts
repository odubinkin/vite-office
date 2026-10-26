/** @fileoverview Scalar ScXMLExport content path over actual row-major document cells and native ODFF serialization. */
import type { ScDocumentPool } from "../../core/data/docpool";
import { convert, Length } from "../../../../o3tl/inc/unit_conversion";
import { XMLFontAutoStylePool } from "../../../../xmloff/source/style/XMLFontAutoStylePool";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import {
  cellTextWhichIds,
  exportCellTextProperties,
  exportCellProperties,
  exportCellParagraphProperties,
} from "./xmlstyle";
import type { ScTable } from "../../../inc/table";
import type { ScFormulaCell } from "../../../inc/formulacell";
import type { SharedStringConstReference } from "../../../../svl/inc/sharedstring";
import type { ScDocument } from "../../../inc/document";
import { MAXCOL, MAXROW } from "../../../inc/address";
import { ScHorizontalCellIterator } from "../../../inc/dociter";
import { CRFlags } from "../../../inc/global";
import { CellType } from "../../../inc/global";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import { SvXMLUnitConverter } from "../../../../xmloff/source/core/xmluconv";
import { escapeXml, exportText } from "../../../../xmloff/source/text/txtparae";
import { doubleToString } from "../../../../sal/rtl/strtmpl.math";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import type { ScRefCellValue } from "../../../inc/cellvalue";
import type { ScPatternAttr } from "../../../inc/patattr";
import { SfxItemState } from "../../../../svl/source/items/itemset";
/** Browser export bounds/cancellation over the native content traversal. */
export interface ScXMLExportOptions {
  readonly isCancelled?: () => boolean;
  readonly maxOutputBytes?: number;
}
/** Native spreadsheet content traversal plus consumed automatic font-height styles. Other styles/objects remain unported. */
export class ScXMLExport {
  private fontPool = new XMLFontAutoStylePool();
  private readonly styles = new Map<string, string>();
  private readonly patternNames = new Map<ScPatternAttr, string>();
  private readonly columnStyles = new Map<number, string>();
  private readonly rowStyles = new Map<string, string>();
  /** Binds the actual document and bounds. @param document - Document. @param options - Controls. @returns Exporter. */
  constructor(
    private readonly document: ScDocument,
    private readonly options: ScXMLExportOptions = {},
  ) {}
  /** Registers direct font-height pattern data in the automatic-style pool. @param pattern - Real cell pattern. @returns Style name or empty default. */
  private styleName(pattern: ScPatternAttr): string {
    const cached = this.patternNames.get(pattern);
    if (cached !== undefined) return cached;
    const ids = cellTextWhichIds;
    if (
      !ids.some(
        /** Tests genuine direct item state. @param which - Identity. @returns Set. */ (which) =>
          pattern.GetItemSet().GetItemState(which, false) === SfxItemState.SET,
      )
    ) {
      this.patternNames.set(pattern, "");
      return "";
    }
    const text = exportCellTextProperties(pattern, this.fontPool),
      cell = exportCellProperties(pattern),
      paragraph = exportCellParagraphProperties(pattern),
      key = `${text ? `<style:text-properties${text}/>` : ""}${cell ? `<style:table-cell-properties${cell}/>` : ""}${paragraph ? `<style:paragraph-properties${paragraph}/>` : ""}`;
    let name = this.styles.get(key);
    if (name === undefined) {
      name = `ce${this.styles.size + 1}`;
      this.styles.set(key, name);
    }
    this.patternNames.set(pattern, name);
    return name;
  }
  /** Collects equal effective cell-style ranges with the minimum native row-repeat boundary,as WriteRowContent consumes ScRowFormatRanges. @param table - Actual sheet. @param row - First row in the format run. @returns Horizontal styles and their common row end. */
  private collectColumnStyles(
    table: ScTable,
    row: number,
  ): {
    endRow: number;
    ranges: { first: number; last: number; style: string }[];
  } {
    const first: [number] = [0],
      last: [number] = [0];
    const defaultPattern = table
      .GetDefaultColumnData()
      .GetPatternRange(first, last, row) as ScPatternAttr;
    let endRow = last[0];
    const allocated = table.GetAllocatedColumnsCount();
    const endColumn = this.styleName(defaultPattern) ? MAXCOL : Math.max(0, allocated - 1);
    const ranges: { first: number; last: number; style: string }[] = [];
    for (let column = 0; column <= endColumn;) {
      const pattern = table
        .GetColumnData(column)
        .GetPatternRange(first, last, row) as ScPatternAttr;
      endRow = Math.min(endRow, last[0]);
      const style = this.styleName(pattern),
        end = column < allocated ? column : endColumn;
      const previous = ranges.at(-1);
      if (previous !== undefined && previous.style === style) previous.last = end;
      else ranges.push({ first: column, last: end, style });
      column = end + 1;
    }
    return { endRow, ranges };
  }
  /** Traverses native content and attribute row runs without expanding styled empty cells or default-column tails. @returns ODF content. */
  exportContent(): string {
    this.fontPool = new XMLFontAutoStylePool();
    for (const which of [100, 111, 116]) {
      const font = (this.document.GetPool() as ScDocumentPool).GetUserOrPoolDefaultItem(
        which,
      ) as SvxFontItem;
      this.fontPool.Add(
        font.GetFamilyName(),
        font.GetStyleName(),
        font.GetFamily(),
        font.GetPitch(),
        font.GetCharSet(),
      );
    }
    this.styles.clear();
    this.patternNames.clear();
    this.rowStyles.clear();
    this.columnStyles.clear();
    let body = "";
    for (let tab = 0; tab < this.document.GetTableCount(); tab++) {
      const table = this.document.FetchTable(tab) as ScTable,
        name = new OUString();
      this.document.GetName(tab, name);
      body += `<table:table table:name="${escapeXml(text(name))}">`;
      name.dispose();
      for (let column = 0; column <= this.document.MaxCol();) {
        if (this.options.isCancelled?.()) throw new Error("ODS operation was cancelled");
        const width = table.GetColWidthRange(column),
          end: [number] = [0],
          hidden = table.ColHidden(column, undefined, end),
          stop = Math.min(this.document.MaxCol(), width.mnRow2, end[0]),
          count = stop - column + 1;
        let style = this.columnStyles.get(width.maValue);
        if (style === undefined) {
          style = "co" + (this.columnStyles.size + 1);
          this.columnStyles.set(width.maValue, style);
        }
        body += `<table:table-column table:style-name="${style}"${count > 1 ? ` table:number-columns-repeated="${count}"` : ""}${hidden ? ' table:visibility="collapse"' : ""}/>`;
        column = stop + 1;
      }
      const first: [number] = [0],
        last: [number] = [0],
        allocated = table.GetAllocatedColumnsCount();
      let maxRow = 0;
      const bounds = new ScHorizontalCellIterator(this.document, tab, 0, 0, MAXCOL, MAXROW),
        bc: [number] = [0],
        br: [number] = [0];
      while (bounds.GetNext(bc, br)) {
        if (this.options.isCancelled?.()) throw new Error("ODS operation was cancelled");
        maxRow = br[0];
      }
      for (let col = 0; col <= allocated; col++)
        for (let row = 0; row <= MAXROW;) {
          const pattern = table
            .GetColumnData(col)
            .GetPatternRange(first, last, row) as ScPatternAttr;
          if (this.styleName(pattern)) maxRow = Math.max(maxRow, last[0]);
          row = last[0] + 1;
        }
      for (let r = 0; r <= MAXROW;) {
        const h = table.GetRowHeightRange(r),
          f = table.GetRowFlagsRange(r),
          hiddenEnd: [number] = [0],
          filteredEnd: [number] = [0],
          hidden = table.RowHidden(r, undefined, hiddenEnd),
          filtered = table.getFilterData().rowFiltered(r, undefined, filteredEnd),
          end = Math.min(h.mnRow2, f.mnRow2, hiddenEnd[0], filteredEnd[0]);
        if (
          hidden ||
          filtered ||
          h.mnValue !== table.GetOptimalMinRowHeight() ||
          f.maValue & CRFlags.ManualSize
        )
          maxRow = Math.max(maxRow, end);
        r = end + 1;
      }
      const iterator = new ScHorizontalCellIterator(this.document, tab, 0, 0, MAXCOL, MAXROW),
        col: [number] = [0],
        row: [number] = [0];
      let cell = iterator.GetNext(col, row);
      let columnStyles: ReturnType<ScXMLExport["collectColumnStyles"]> | undefined;
      for (let currentRow = 0; currentRow <= maxRow;) {
        if (this.options.isCancelled?.()) throw new Error("ODS operation was cancelled");
        const heightRun = table.GetRowHeightRange(currentRow),
          flagsRun = table.GetRowFlagsRange(currentRow);
        const hiddenEnd: [number] = [0],
          filteredEnd: [number] = [0],
          hidden = table.RowHidden(currentRow, undefined, hiddenEnd),
          filtered = table.getFilterData().rowFiltered(currentRow, undefined, filteredEnd);
        let endRow = Math.min(
          maxRow,
          heightRun.mnRow2,
          flagsRun.mnRow2,
          hiddenEnd[0],
          filteredEnd[0],
        );
        const key =
          heightRun.mnValue + "," + (flagsRun.maValue & CRFlags.ManualSize ? "false" : "true");
        let rowStyle = this.rowStyles.get(key);
        if (rowStyle === undefined) {
          rowStyle = "ro" + (this.rowStyles.size + 1);
          this.rowStyles.set(key, rowStyle);
        }
        if (columnStyles === undefined || currentRow > columnStyles.endRow)
          columnStyles = this.collectColumnStyles(table, currentRow);
        endRow = Math.min(endRow, columnStyles.endRow);
        if (cell) endRow = Math.min(endRow, row[0] === currentRow ? currentRow : row[0] - 1);
        const repeat = endRow - currentRow + 1;
        body += `<table:table-row table:style-name="${rowStyle}"${hidden ? ` table:visibility="${filtered ? "filter" : "collapse"}"` : ""}${repeat > 1 ? ` table:number-rows-repeated="${repeat}"` : ""}>`;
        for (const range of columnStyles.ranges) {
          const attribute = range.style ? ` table:style-name="${range.style}"` : "";
          for (let column = range.first; column <= range.last;) {
            if (cell && row[0] === currentRow && col[0] === column) {
              body += this.exportCell(cell, attribute);
              column++;
              cell = iterator.GetNext(col, row);
            } else {
              const stop = Math.min(
                range.last + 1,
                cell && row[0] === currentRow ? col[0] : range.last + 1,
              );
              const count = stop - column;
              body += `<table:table-cell${attribute}${count > 1 ? ` table:number-columns-repeated="${count}"` : ""}/>`;
              column = stop;
            }
          }
        }
        body += "</table:table-row>";
        currentRow = endRow + 1;
      }
      body += "</table:table>";
    }
    let automatic = "";
    for (const [key, name] of this.styles) {
      automatic += `<style:style style:name="${name}" style:family="table-cell">${key}</style:style>`;
    }
    for (const [key, name] of this.rowStyles) {
      const [height, optimal] = key.split(",");
      automatic += `<style:style style:name="${name}" style:family="table-row"><style:table-row-properties style:row-height="${new SvXMLUnitConverter("twip").convertMeasureToXML(Number(height))}" style:use-optimal-row-height="${optimal}"/></style:style>`;
    }
    for (const [width, name] of this.columnStyles) {
      const hmm = Number(convert(BigInt(width), Length.twip, Length.mm100));
      automatic += `<style:style style:name="${name}" style:family="table-column"><style:table-column-properties style:column-width="${new SvXMLUnitConverter("mm100").convertMeasureToXML(hmm)}"/></style:style>`;
    }
    return `<?xml version="1.0" encoding="UTF-8"?><office:document-content xmlns:office="${ODF_NAMESPACES.office}" xmlns:table="${ODF_NAMESPACES.table}" xmlns:text="${ODF_NAMESPACES.text}" xmlns:of="${ODF_NAMESPACES.of}" xmlns:style="${ODF_NAMESPACES.style}" xmlns:fo="${ODF_NAMESPACES.fo}" xmlns:svg="${ODF_NAMESPACES.svg}" office:version="1.3">${this.fontPool.exportXML()}<office:automatic-styles>${automatic}</office:automatic-styles><office:body><office:spreadsheet>${body}</office:spreadsheet></office:body></office:document-content>`;
  }
  /** Serializes the original scalar/formula alternatives with actual result computation. @param cell - Native cell view. @param attribute - Escaped generated style attribute. @returns Cell XML. */
  private exportCell(cell: ScRefCellValue, attribute: string): string {
    let formula = "",
      value = "",
      children = "";
    const type = cell.getType();
    if (type === CellType.CELLTYPE_FORMULA) {
      const actual = cell.getFormula() as ScFormulaCell;
      const source = actual.GetFormula(FormulaGrammar.Grammar.GRAM_ODFF);
      try {
        formula = ` table:formula="of:${escapeXml(text(source))}"`;
      } finally {
        source.dispose();
      }
      if (actual.GetErrCode() === FormulaError.NONE && !actual.IsEmpty()) {
        if (actual.IsValue())
          value = ` office:value-type="float" office:value="${doubleToString(actual.GetValue())}"`;
        else {
          const string = text(actual.GetString().getString());
          value = ' office:value-type="string"';
          children = this.textParagraph(string);
        }
      }
    } else if (type === CellType.CELLTYPE_VALUE)
      value = ` office:value-type="float" office:value="${doubleToString(cell.getDouble())}"`;
    else if (type === CellType.CELLTYPE_EDIT) {
      value = ' office:value-type="string"';
      const edit = cell.getEditText();
      if (edit) {
        const paragraphs: string[] = [];
        for (let i = 0; i < edit.GetParagraphCount(); i++) {
          const part = edit.GetText(i);
          try {
            paragraphs.push(`<text:p>${exportText(text(part))}</text:p>`);
          } finally {
            part.dispose();
          }
        }
        children = paragraphs.join("");
      }
    } else {
      value = ' office:value-type="string"';
      const string = cell.getSharedString() as SharedStringConstReference;
      children = this.textParagraph(text(string.getString()));
    }
    return `<table:table-cell${attribute}${formula}${value}>${children}</table:table-cell>`;
  }
  /** Reuses actual shared Writer/Calc inline encoding for a simple literal paragraph. @param value - Literal simple text. @returns Paragraph XML. */
  private textParagraph(value: string): string {
    if (/[\r\n]/.test(value)) throw new Error("ODS multiline cell export is not implemented");
    return `<text:p>${exportText(value)}</text:p>`;
  }
}
