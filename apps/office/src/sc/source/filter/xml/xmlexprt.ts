/** @fileoverview Scalar ScXMLExport content path over actual row-major document cells and native ODFF serialization. */
import { WriteLabelRanges } from "./xmllabri";
import { ExportConditionalFormat } from "./xmlcondformat";
import { exportPageStyles } from "./xmlstyle.page";
import { externalRefCacheStyle, WriteExternalRefCaches } from "./xmlexprt.external";
import { GetPrintRanges } from "../../core/data/table1";
import { ScMyOpenCloseColumnRowGroup } from "./XMLColumnRowGroupExport";
import { ScMyDefaultStyles } from "./XMLStylesExportHelper";
import type { ScDocumentPool } from "../../core/data/docpool";
import { convert, Length } from "../../../../o3tl/inc/unit_conversion";
import { XMLFontAutoStylePool } from "../../../../xmloff/source/style/XMLFontAutoStylePool";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import {
  cellTextWhichIds,
  exportCellTextPropertyElement,
  exportCellPropertyElement,
  exportCellParagraphProperties,
  exportNamedCellStyles,
  getCellStyleXMLName,
  getCellStyleXMLNames,
} from "./xmlstyle";
import type { ScTable } from "../../../inc/table";
import { ScMatrixMode, type ScFormulaCell } from "../../../inc/formulacell";
import type { SharedStringConstReference } from "../../../../svl/inc/sharedstring";
import type { ScDocument } from "../../../inc/document";
import { MAXROW, ScAddress, ScRange, ScRefFlags } from "../../../inc/address";
import { ScMyNotEmptyCellsIterator } from "./XMLExportIterator";
import type { ScPostIt, ScThreadedCommentEntry } from "../../../inc/postit";
import { LANGUAGE_SYSTEM } from "../../../../i18nlangtag/inc/lang";
import { NfIndexTableOffset } from "../../../../svl/inc/zforlist";
import { CRFlags } from "../../../inc/global";
import { CellType } from "../../../inc/global";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { ScRangeStringConverter } from "../../core/tool/rangeutl";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import { SvXMLUnitConverter } from "../../../../xmloff/source/core/xmluconv";
import { escapeXml, exportText } from "../../../../xmloff/source/text/txtparae";
import { RangeDataType } from "../../core/tool/rangenam";
import { writeNumberFormatAttributes } from "../../../../xmloff/source/style/numehelp";
import { ScGlobal } from "../../core/data/global";
import { COL_AUTO } from "../../../../tools/inc/color";
import { Converter } from "../../../../sax/source/tools/converter";
import { DateTime } from "../../../../offapi/com/sun/star/util/DateTime";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { OUStringBuffer } from "../../../../sal/inc/rtl/ustrbuf";
import { approxEqual } from "../../../../sal/inc/rtl/math";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import type { ScRefCellValue } from "../../../inc/cellvalue";
import type { ScPatternAttr } from "../../../inc/patattr";
import { ATTR_VALUE_FORMAT } from "../../../inc/scitems";
import { SC_STYLE_PROG_STANDARD } from "../../../inc/stylehelper";
import type { ScMergeAttr, ScMergeFlagAttr } from "../../../inc/attrib";
import { ATTR_MERGE, ATTR_MERGE_FLAG } from "../../../inc/scitems";
import { SfxItemState } from "../../../../svl/source/items/itemset";
import { ExportNumberFormat } from "../../../../xmloff/source/style/xmlnumfe";
import { CellTextStylePool, writeCellParagraphs } from "./xmlexprt.celltext";
import { writeTableProtectionOptions } from "./xmlexprt.protection";
import type { ScTableProtection } from "../../core/data/tabprotection";
/** Effective style and merge state within a horizontal row run. */
interface RowCellRange {
  first: number;
  last: number;
  style: string;
  automatic: boolean;
  covered: boolean;
  merge: ScMergeAttr;
}
/** Browser export bounds/cancellation over the native content traversal. */
export interface ScXMLExportOptions {
  readonly isCancelled?: () => boolean;
  readonly maxOutputBytes?: number;
}
/** Streams native page breaks as runs of equal break state for ODS automatic styles. */
class ScPageBreakRanges {
  private readonly positions: Iterator<number>;
  private next: number | undefined;
  private start = -1;
  private end = -1;
  readonly last: number;

  /** Collects one ordered native manual-break axis. @param table - Native sheet. @param rows - Row or column axis. @returns Export cursor. */
  constructor(table: ScTable, rows: boolean) {
    const breaks = new Set<number>();
    if (rows) table.GetAllRowBreaks(breaks, false, true);
    else table.GetAllColBreaks(breaks, false, true);
    let last = -1;
    for (const position of breaks) last = position;
    this.last = last;
    this.positions = breaks.values();
    this.next = this.positions.next().value;
  }

  /** Clips a format span at the next break-state change. @param first - Current position. @param last - End of the format span. @returns End and manual-break state. */
  ClipRange(first: number, last: number): { last: number; manual: boolean } {
    while (this.next !== undefined && this.next <= first) {
      this.start = this.end = this.next;
      while ((this.next = this.positions.next().value) === this.end + 1) this.end = this.next;
    }
    const manual = first >= this.start && first <= this.end;
    return { last: Math.min(last, manual ? this.end : (this.next ?? last + 1) - 1), manual };
  }
}

/** Native spreadsheet content export, including row and column automatic styles. */
export class ScXMLExport {
  private fontPool = new XMLFontAutoStylePool();
  private readonly pageFontPool = new XMLFontAutoStylePool();
  private readonly pageStyles: ReturnType<typeof exportPageStyles>;
  private textStyles: CellTextStylePool;
  private automaticStyleIndex = 0;
  private readonly reservedStyleNames: Set<string>;
  private readonly styles = new Map<
    string,
    { name: string; dataStyle: string; parent: string; properties: string }
  >();
  private readonly numberStyles = new Map<number, { name: string; xml: string } | null>();
  private readonly patternNames = new Map<ScPatternAttr, string>();
  private readonly automaticStyleNames = new Set<string>();
  private readonly columnStyles = new Map<string, string>();
  private readonly rowStyles = new Map<string, string>();
  /** Binds the actual document and bounds. @param document - Document. @param options - Controls. @returns Exporter. */
  constructor(
    private readonly document: ScDocument,
    private readonly options: ScXMLExportOptions = {},
  ) {
    this.reservedStyleNames = getCellStyleXMLNames(document);
    this.textStyles = new CellTextStylePool(document, this.fontPool);
    this.pageStyles = exportPageStyles(document, this.pageFontPool);
  }
  /** Registers direct font-height pattern data in the automatic-style pool. @param pattern - Real cell pattern. @returns Style name or empty default. */
  private styleName(pattern: ScPatternAttr): string {
    const cached = this.patternNames.get(pattern);
    if (cached !== undefined) return cached;
    const dataStyle = this.numberStyleName(pattern);
    const parent = getCellStyleXMLName(pattern.GetStyleName());
    const ids = cellTextWhichIds;
    if (
      !dataStyle &&
      !ids.some(
        /** Tests genuine direct item state. @param which - Identity. @returns Set. */ (which) =>
          pattern.GetItemSet().GetItemState(which, false) === SfxItemState.SET,
      )
    ) {
      const name = parent === text(SC_STYLE_PROG_STANDARD) ? "" : parent;
      this.patternNames.set(pattern, name);
      return name;
    }
    const chars = exportCellTextPropertyElement(pattern, this.fontPool),
      cell = exportCellPropertyElement(pattern),
      paragraph = exportCellParagraphProperties(pattern),
      properties = `${chars}${cell}${paragraph ? `<style:paragraph-properties${paragraph}/>` : ""}`;
    const name = this.registerCellStyle(parent, dataStyle, properties);
    this.patternNames.set(pattern, name);
    return name;
  }

  /** Deduplicates original automatic cell styles for sheet and external-cache entries. @param parent - Named parent. @param dataStyle - Number format style. @param properties - Other ODF properties. @returns Automatic style name. */
  private registerCellStyle(parent: string, dataStyle: string, properties: string): string {
    const key = JSON.stringify([parent, dataStyle, properties]);
    let style = this.styles.get(key);
    if (style === undefined) {
      let name: string;
      do name = `ce${++this.automaticStyleIndex}`;
      while (this.reservedStyleNames.has(name));
      style = { name, dataStyle, parent, properties };
      this.styles.set(key, style);
      this.automaticStyleNames.add(name);
    }
    return style.name;
  }
  /** Registers a compiled data style once for the effective native key. @param pattern - Native cell pattern. @returns Style name or the empty General default. */
  private numberStyleName(pattern: ScPatternAttr): string {
    if (pattern.GetItemSet().GetItemState(ATTR_VALUE_FORMAT, false) !== SfxItemState.SET) return "";
    return this.registerNumberStyle(pattern.GetNumberFormat(this.document.GetFormatTable()));
  }

  /** Registers a number style from its real formatter index. @param key - Native format index. @returns Data style name or General default. */
  private registerNumberStyle(key: number): string {
    const formatter = this.document.GetFormatTable();
    const cached = this.numberStyles.get(key);
    if (cached !== undefined) return cached?.name ?? "";
    const name = `N${this.numberStyles.size + 1}`;
    const xml = ExportNumberFormat(formatter, key, name);
    this.numberStyles.set(key, xml ? { name, xml } : null);
    return xml ? name : "";
  }
  /** Writes the recognized default style in the ODF named styles stream. @returns ODF styles XML or empty. */
  exportStyles(): string {
    const fontPool = this.pageFontPool;
    const styles = exportNamedCellStyles(this.document, fontPool);
    const { layouts, masters } = this.pageStyles;
    if (!styles && !layouts) return "";
    const pageStyles = layouts
      ? `<office:automatic-styles>${layouts}</office:automatic-styles>${masters}`
      : "";
    return `<?xml version="1.0" encoding="UTF-8"?><office:document-styles xmlns:office="${ODF_NAMESPACES.office}" xmlns:number="${ODF_NAMESPACES.number}" xmlns:text="${ODF_NAMESPACES.text}" xmlns:style="${ODF_NAMESPACES.style}" xmlns:fo="${ODF_NAMESPACES.fo}" xmlns:css3t="${ODF_NAMESPACES.css3t}" xmlns:svg="${ODF_NAMESPACES.svg}" xmlns:loext="${ODF_NAMESPACES.loext}" xmlns:xlink="${ODF_NAMESPACES.xlink}" office:version="1.3">${fontPool.exportXML()}${styles}${pageStyles}</office:document-styles>`;
  }
  /** Collects equal effective cell-style ranges with the minimum native row-repeat boundary, as WriteRowContent consumes ScRowFormatRanges. @param table - Actual sheet. @param row - First row in the format run. @param endColumn - Inclusive export column bound. @param defaults - Selected column styles. @returns Horizontal styles and their common row end. */
  private collectColumnStyles(
    table: ScTable,
    row: number,
    endColumn: number,
    defaults: ScMyDefaultStyles,
  ): {
    endRow: number;
    ranges: RowCellRange[];
  } {
    const first: [number] = [0],
      last: [number] = [0];
    let endRow = this.document.MaxRow();
    const allocated = table.GetAllocatedColumnsCount();
    const ranges: RowCellRange[] = [];
    for (let column = 0; column <= endColumn;) {
      const pattern = table
        .GetColumnData(column)
        .GetPatternRange(first, last, row) as ScPatternAttr;
      endRow = Math.min(endRow, last[0]);
      const name = this.styleName(pattern),
        style = name === defaults.Get(column) ? "" : name || text(SC_STYLE_PROG_STANDARD),
        automatic = this.automaticStyleNames.has(name),
        merge = pattern.GetItem(ATTR_MERGE) as ScMergeAttr,
        covered = (pattern.GetItem(ATTR_MERGE_FLAG) as ScMergeFlagAttr).IsOverlapped(),
        end = column < allocated ? column : endColumn;
      if (merge.IsMerged()) endRow = row;
      const previous = ranges.at(-1);
      if (
        previous?.style === style &&
        previous.automatic === automatic &&
        previous.covered === covered &&
        !merge.IsMerged() &&
        !previous.merge.IsMerged()
      )
        previous.last = end;
      else ranges.push({ first: column, last: end, style, automatic, covered, merge });
      column = end + 1;
    }
    return { endRow, ranges };
  }
  /** Traverses native content and attribute row runs without expanding styled empty cells or default-column tails. @param tableProtection - Prepared ODF protection attributes. @returns ODF content. */
  exportContent(
    tableProtection: ReadonlyMap<Readonly<ScTableProtection>, string> = new Map(),
  ): string {
    this.fontPool = new XMLFontAutoStylePool();
    this.textStyles = new CellTextStylePool(this.document, this.fontPool);
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
    this.automaticStyleIndex = 0;
    this.automaticStyleNames.clear();
    this.patternNames.clear();
    this.rowStyles.clear();
    this.columnStyles.clear();
    const defaultName = this.document.GetStyleSheetPool()?.GetDefaultStyle()?.GetItemSet().Count()
      ? text(SC_STYLE_PROG_STANDARD)
      : "";
    let body = this.WriteCalculationSettings();
    const tableStyles = new Map<string, { name: string; properties: string; master: string }>();
    for (let tab = 0; tab < this.document.GetTableCount(); tab++) {
      const table = this.document.FetchTable(tab) as ScTable,
        name = new OUString();
      this.document.GetName(tab, name);
      const ranges = ScRangeStringConverter.GetStringFromRangeList(
        GetPrintRanges(table).map(
          /** The sheet API supplies its tab regardless of the tab stored in a print area. @param source - Sheet-owned area. @returns Localized range. */
          (source) =>
            new ScRange(
              source.aStart.Col(),
              source.aStart.Row(),
              tab,
              source.aEnd.Col(),
              source.aEnd.Row(),
              tab,
            ),
        ),
        this.document,
        FormulaGrammar.AddressConvention.CONV_OOO,
      );
      const print = ranges
        ? ` table:print-ranges="${escapeXml(ranges)}"`
        : table.IsPrintEntireSheet()
          ? ""
          : ' table:print="false"';
      const protection = table.GetProtection();
      const protectionAttributes = protection?.isProtected() ? tableProtection.get(protection) : "";
      if (protectionAttributes === undefined) {
        name.dispose();
        throw new Error("Sheet protection changed during ODS export.");
      }
      let tableProperties = table.IsVisible() ? "" : ' table:display="false"';
      const color = table.GetTabBgColor();
      if (!color.equals(COL_AUTO)) {
        const rgb: [string] = [""];
        Converter.convertColor(rgb, color.toUInt32());
        tableProperties += ` table:tab-color="${rgb[0]}"`;
      }
      let styleAttribute = "";
      const master = this.pageStyles.names.get(table.GetPageStyle()) ?? "";
      if (tableProperties || master) {
        const key = master + "\0" + tableProperties;
        const style = tableStyles.get(key) ?? {
          name: `ta${tableStyles.size + 1}`,
          properties: tableProperties,
          master,
        };
        tableStyles.set(key, style);
        styleAttribute = ` table:style-name="${style.name}"`;
      }
      body += `<table:table table:name="${escapeXml(text(name))}"${styleAttribute}${protectionAttributes}${print}>`;
      name.dispose();
      if (protection?.isProtected()) body += writeTableProtectionOptions(protection);
      const outline = table.GetOutlineTable();
      const columnGroups = new ScMyOpenCloseColumnRowGroup(
        outline?.GetColArray(),
        false,
        table.GetRepeatColRange(),
      );
      const rowGroups = new ScMyOpenCloseColumnRowGroup(
        outline?.GetRowArray(),
        true,
        table.GetRepeatRowRange(),
      );
      const columnBreaks = new ScPageBreakRanges(table, false);
      const rowBreaks = new ScPageBreakRanges(table, true);
      const first: [number] = [0],
        last: [number] = [0],
        allocated = table.GetAllocatedColumnsCount();
      let maxRow = Math.max(0, rowGroups.GetLast(), rowBreaks.last);
      let maxColumn = Math.max(
        table.GetLastChangedColFlagsWidth(),
        columnGroups.GetLast(),
        columnBreaks.last,
      );
      const bounds = new ScMyNotEmptyCellsIterator(this.document, tab),
        bc: [number] = [0],
        br: [number] = [0];
      while (bounds.GetNext(bc, br)) {
        if (this.options.isCancelled?.()) throw new Error("ODS operation was cancelled");
        maxColumn = Math.max(maxColumn, bc[0]);
        maxRow = Math.max(maxRow, br[0]);
      }
      for (let col = 0; col <= Math.min(allocated, this.document.MaxCol()); col++)
        for (let row = 0; row <= MAXROW;) {
          const pattern = table
            .GetColumnData(col)
            .GetPatternRange(first, last, row) as ScPatternAttr;
          if (
            this.styleName(pattern) ||
            (pattern.GetItem(ATTR_MERGE) as ScMergeAttr).IsMerged() ||
            (pattern.GetItem(ATTR_MERGE_FLAG) as ScMergeFlagAttr).IsOverlapped()
          ) {
            maxColumn = Math.max(maxColumn, col === allocated ? this.document.MaxCol() : col);
            maxRow = Math.max(maxRow, last[0]);
          }
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
      const defaults = new ScMyDefaultStyles(
        this.document,
        tab,
        maxRow,
        allocated,
        /** Registers the selected native pattern. @param pattern - Pattern. @returns ODF style name. */ (
          pattern,
        ) => this.styleName(pattern),
      );
      for (let column = 0; column <= maxColumn;) {
        if (this.options.isCancelled?.()) throw new Error("ODS operation was cancelled");
        const width = table.GetColWidthRange(column),
          end: [number] = [0],
          hidden = table.ColHidden(column, undefined, end),
          span = columnBreaks.ClipRange(column, Math.min(maxColumn, width.mnRow2, end[0])),
          stop = defaults.ClipRange(column, columnGroups.ClipRange(column, span.last)),
          defaultStyle = defaults.Get(column) || defaultName,
          count = stop - column + 1,
          key = width.maValue + "," + (span.manual ? "page" : "auto");
        let style = this.columnStyles.get(key);
        if (style === undefined) {
          style = "co" + (this.columnStyles.size + 1);
          this.columnStyles.set(key, style);
        }
        body += columnGroups.OpenGroups(column);
        body += `<table:table-column table:style-name="${style}"${defaultStyle ? ` table:default-cell-style-name="${escapeXml(defaultStyle)}"` : ""}${count > 1 ? ` table:number-columns-repeated="${count}"` : ""}${hidden ? ' table:visibility="collapse"' : ""}/>`;
        body += columnGroups.CloseGroups(stop);
        column = stop + 1;
      }
      const iterator = new ScMyNotEmptyCellsIterator(this.document, tab),
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
        const span = rowBreaks.ClipRange(currentRow, endRow);
        endRow = span.last;
        const key =
          heightRun.mnValue +
          "," +
          (flagsRun.maValue & CRFlags.ManualSize ? "false" : "true") +
          "," +
          (span.manual ? "page" : "auto");
        let rowStyle = this.rowStyles.get(key);
        if (rowStyle === undefined) {
          rowStyle = "ro" + (this.rowStyles.size + 1);
          this.rowStyles.set(key, rowStyle);
        }
        if (columnStyles === undefined || currentRow > columnStyles.endRow)
          columnStyles = this.collectColumnStyles(table, currentRow, maxColumn, defaults);
        endRow = Math.min(endRow, columnStyles.endRow);
        if (cell) endRow = Math.min(endRow, row[0] === currentRow ? currentRow : row[0] - 1);
        endRow = rowGroups.ClipRange(currentRow, endRow);
        const repeat = endRow - currentRow + 1;
        body += rowGroups.OpenGroups(currentRow);
        body += `<table:table-row table:style-name="${rowStyle}"${hidden ? ` table:visibility="${filtered ? "filter" : "collapse"}"` : ""}${repeat > 1 ? ` table:number-rows-repeated="${repeat}"` : ""}>`;
        for (const range of columnStyles.ranges) {
          const element = range.covered ? "table:covered-table-cell" : "table:table-cell";
          let attribute = range.style ? ` table:style-name="${escapeXml(range.style)}"` : "";
          if (!range.covered && range.merge.IsMerged())
            attribute += ` table:number-columns-spanned="${range.merge.GetColMerge()}" table:number-rows-spanned="${range.merge.GetRowMerge()}"`;
          for (let column = range.first; column <= range.last;) {
            if (cell && row[0] === currentRow && col[0] === column) {
              body += this.exportCell(
                iterator.cell,
                iterator.note,
                new ScAddress(column, currentRow, tab),
                element,
                attribute,
              );
              column++;
              cell = iterator.GetNext(col, row);
            } else {
              const stop = Math.min(
                range.last + 1,
                cell && row[0] === currentRow ? col[0] : range.last + 1,
              );
              const count = stop - column;
              body += `<${element}${attribute}${count > 1 ? ` table:number-columns-repeated="${count}"` : ""}/>`;
              column = stop;
            }
          }
        }
        body += "</table:table-row>" + rowGroups.CloseGroups(endRow);
        currentRow = endRow + 1;
      }
      body +=
        this.WriteNamedRange(tab) +
        ExportConditionalFormat(this.document, table) +
        "</table:table>";
    }
    const external = WriteExternalRefCaches(
      this.document,
      /** Resolves the format-only automatic style of a cached cell. @param key - Native format index. @returns ODF cell style. */
      (key) => {
        if (key === 0) return "";
        const dataStyle = this.registerNumberStyle(key);
        return dataStyle ? this.registerCellStyle("", dataStyle, "") : "";
      },
    );
    body +=
      external + this.WritePersons() + this.WriteNamedRange(-1) + WriteLabelRanges(this.document);
    let automatic = this.textStyles.exportStyles() + (external ? externalRefCacheStyle : "");
    for (const { properties, name, master } of tableStyles.values()) {
      const page = master ? ` style:master-page-name="${master}"` : "";
      automatic += `<style:style style:name="${name}" style:family="table"${page}><style:table-properties${properties}/></style:style>`;
    }
    for (const style of this.numberStyles.values()) if (style) automatic += style.xml;
    for (const { name, dataStyle, parent, properties } of this.styles.values()) {
      automatic += `<style:style style:name="${name}" style:family="table-cell"${parent ? ` style:parent-style-name="${escapeXml(parent)}"` : ""}${dataStyle ? ` style:data-style-name="${dataStyle}"` : ""}>${properties}</style:style>`;
    }
    for (const [key, name] of this.rowStyles) {
      const [height, optimal, pageBreak] = key.split(",");
      automatic += `<style:style style:name="${name}" style:family="table-row"><style:table-row-properties style:row-height="${new SvXMLUnitConverter("twip").convertMeasureToXML(Number(height))}" fo:break-before="${pageBreak}" style:use-optimal-row-height="${optimal}"/></style:style>`;
    }
    for (const [key, name] of this.columnStyles) {
      const [width, pageBreak] = key.split(",");
      const hmm = Number(convert(BigInt(Number(width)), Length.twip, Length.mm100));
      automatic += `<style:style style:name="${name}" style:family="table-column"><style:table-column-properties fo:break-before="${pageBreak}" style:column-width="${new SvXMLUnitConverter("mm100").convertMeasureToXML(hmm)}"/></style:style>`;
    }
    return `<?xml version="1.0" encoding="UTF-8"?><office:document-content xmlns:calcext="${ODF_NAMESPACES.calcext}" xmlns:office="${ODF_NAMESPACES.office}" xmlns:dc="${ODF_NAMESPACES.dc}" xmlns:meta="${ODF_NAMESPACES.meta}" xmlns:number="${ODF_NAMESPACES.number}" xmlns:table="${ODF_NAMESPACES.table}" xmlns:text="${ODF_NAMESPACES.text}" xmlns:of="${ODF_NAMESPACES.of}" xmlns:style="${ODF_NAMESPACES.style}" xmlns:fo="${ODF_NAMESPACES.fo}" xmlns:css3t="${ODF_NAMESPACES.css3t}" xmlns:svg="${ODF_NAMESPACES.svg}" xmlns:loext="${ODF_NAMESPACES.loext}" xmlns:xlink="${ODF_NAMESPACES.xlink}" office:version="1.3">${this.fontPool.exportXML()}<office:automatic-styles>${automatic}</office:automatic-styles><office:body><office:spreadsheet>${body}</office:spreadsheet></office:body></office:document-content>`;
  }
  /** Writes calculation settings that differ from the ODF defaults. @returns ODF calculation settings. */
  private WriteCalculationSettings(): string {
    const day: [number] = [0],
      month: [number] = [0],
      year: [number] = [0];
    const options = this.document.GetDocOptions();
    options.GetDate(day, month, year);
    const attributes: string[] = [];
    if (options.IsIgnoreCase()) attributes.push('table:case-sensitive="false"');
    if (options.IsCalcAsShown()) attributes.push('table:precision-as-shown="true"');
    if (!options.IsMatchWholeCell())
      attributes.push('table:search-criteria-must-apply-to-whole-cell="false"');
    if (!options.IsLookUpColRowNames()) attributes.push('table:automatic-find-labels="false"');
    const wildcards = options.IsFormulaWildcardsEnabled();
    if (wildcards || !options.IsFormulaRegexEnabled())
      attributes.push('table:use-regular-expressions="false"');
    if (wildcards) attributes.push('table:use-wildcards="true"');
    if (options.GetYear2000() !== 1930)
      attributes.push(`table:null-year="${options.GetYear2000()}"`);

    let children = "";
    if (day[0] !== 30 || month[0] !== 12 || year[0] !== 1899) {
      const buffer = new OUStringBuffer();
      Converter.convertDateTime(
        buffer,
        new DateTime(0, 0, 0, 0, day[0], month[0], year[0], false),
        null,
      );
      const value = buffer.makeStringAndClear();
      try {
        children += `<table:null-date table:date-value="${text(value)}"/>`;
      } finally {
        value.dispose();
        buffer.dispose();
      }
    }
    const iteration: string[] = [];
    if (options.IsIter()) iteration.push('table:status="enable"');
    if (options.GetIterCount() !== 100) iteration.push(`table:steps="${options.GetIterCount()}"`);
    if (!approxEqual(options.GetIterEps(), 0.001)) {
      const buffer = new OUStringBuffer();
      Converter.convertDouble(buffer, options.GetIterEps());
      const value = buffer.makeStringAndClear();
      try {
        iteration.push(`table:maximum-difference="${text(value)}"`);
      } finally {
        value.dispose();
        buffer.dispose();
      }
    }
    if (iteration.length) children += `<table:iteration ${iteration.join(" ")}/>`;
    const start = attributes.length ? " " + attributes.join(" ") : "";
    if (children)
      return `<table:calculation-settings${start}>${children}</table:calculation-settings>`;
    return start ? `<table:calculation-settings${start}/>` : "";
  }
  /** Writes native named ranges and expressions at workbook or sheet scope. @param scope - Name scope. @returns ODF definitions. */
  private WriteNamedRange(scope: number): string {
    let output = "";
    const range = new ScRange();
    for (const entry of this.document.GetRangeName(scope) ?? []) {
      entry.ValidateTabRefs();
      const base = entry.pos.Format(ScRefFlags.ADDR_ABS_3D, this.document);
      const address = text(base);
      base.dispose();
      const properties = ` table:name="${escapeXml(entry.name)}" table:base-cell-address="${escapeXml(address)}"`;
      const symbol = entry.GetSymbol();
      if (entry.IsReference(range)) {
        const flags = [
          [RangeDataType.ColHeader, "repeat-column"],
          [RangeDataType.RowHeader, "repeat-row"],
          [RangeDataType.Criteria, "filter"],
          [RangeDataType.PrintArea, "print-range"],
          [RangeDataType.Hidden, "hidden"],
        ] as const;
        const usable = flags
          .flatMap(
            /** Preserves native ODF range flags. @param flag - Bit and lexical value. @returns Active flag. */
            ([bit, keyword]) => (entry.type & bit ? [keyword] : []),
          )
          .join(" ");
        output += `<table:named-range${properties} table:cell-range-address="${escapeXml(symbol.slice(1, -1))}"${usable ? ` table:range-usable-as="${usable}"` : ""}/>`;
      } else {
        output += `<table:named-expression${properties} table:expression="${escapeXml(symbol)}"${entry.type & RangeDataType.Hidden ? ' loext:hidden="true"' : ""}/>`;
      }
    }
    if (output) return "<table:named-expressions>" + output + "</table:named-expressions>";
    return scope < 0 ? "<table:named-expressions/>" : "";
  }
  /** Serializes the original scalar/formula alternatives with actual result computation. @param cell - Native cell view. @param note - Optional cell note. @param address - Actual source coordinate. @param element - ODF cell element. @param attribute - Generated cell attributes. @returns Cell XML. */
  private exportCell(
    cell: ScRefCellValue | null,
    note: ScPostIt | null,
    address: ScAddress,
    element: string,
    attribute: string,
  ): string {
    const annotation = note ? this.WriteAnnotation(note) : "";
    if (!cell) return `<${element}${attribute}>${annotation}</${element}>`;
    const formatter = this.document.GetFormatTable();
    const key = this.document.GetPattern(address)?.GetNumberFormat(formatter) ?? 0;
    let formula = "",
      value = "",
      children = "";
    const type = cell.getType();
    if (type === CellType.CELLTYPE_FORMULA) {
      const actual = cell.getFormula() as ScFormulaCell;
      const mode = actual.GetMatrixFlag();
      if (mode !== ScMatrixMode.Reference) {
        const source = actual.GetFormula(FormulaGrammar.Grammar.GRAM_ODFF);
        try {
          const dimensions = actual.GetMatColsRows();
          const code = text(source);
          formula = ` table:formula="of:${escapeXml(dimensions && code.startsWith("{") ? code.slice(1, -1) : code)}"`;
          if (dimensions)
            formula += ` table:number-matrix-columns-spanned="${dimensions[0]}" table:number-matrix-rows-spanned="${dimensions[1]}"`;
        } finally {
          source.dispose();
        }
      }
      const error = actual.GetErrCode();
      if (error !== FormulaError.NONE) {
        const message = ScGlobal.GetErrorString(error);
        try {
          const displayed = text(message);
          value = ` office:value-type="string" office:string-value="${escapeXml(displayed)}" calcext:value-type="error"`;
          children = this.textParagraph(displayed);
        } finally {
          message.dispose();
        }
      } else if (mode !== ScMatrixMode.NONE && actual.IsEmptyDisplayedAsString()) {
        value = ' office:value-type="float" office:value="0"';
        children = "<text:p/>";
      } else if (!actual.IsEmpty()) {
        if (actual.IsValue())
          value = writeNumberFormatAttributes(
            formatter,
            key,
            actual.GetValue(),
            formatter.GetNullDate(),
          );
        else {
          const string = text(actual.GetString().getString());
          if (string) {
            const xmlValue = escapeXml(string)
              .replaceAll("\n", "&#10;")
              .replaceAll("\r", "&#13;")
              .replaceAll("\t", "&#9;");
            value = ` office:value-type="string" office:string-value="${xmlValue}"`;
            children = string.includes("\n")
              ? string
                  .split("\n")
                  .map(
                    /** Writes a native formula result paragraph. @param line - Cached result line. @returns Paragraph XML. */
                    (line) => `<text:p>${escapeXml(line)}</text:p>`,
                  )
                  .join("")
              : this.textParagraph(string);
          }
        }
      }
    } else if (type === CellType.CELLTYPE_VALUE)
      value = writeNumberFormatAttributes(
        formatter,
        key,
        cell.getDouble(),
        formatter.GetNullDate(),
      );
    else if (type === CellType.CELLTYPE_EDIT) {
      value = ' office:value-type="string"';
      const edit = cell.getEditText();
      if (edit) children = writeCellParagraphs(this.textStyles.collect(edit));
    } else {
      value = ' office:value-type="string"';
      const string = cell.getSharedString() as SharedStringConstReference;
      children = this.textParagraph(text(string.getString()));
    }
    return `<${element}${attribute}${formula}${value}>${annotation}${children}</${element}>`;
  }
  /** Emits note metadata and caption text ahead of the cell's own text. @param note - Native note. @returns Annotation XML. */
  private WriteAnnotation(note: ScPostIt): string {
    const author = note.GetAuthor();
    const creator = author ? `<dc:creator>${escapeXml(author)}</dc:creator>` : "";
    const formatter = this.document.GetFormatTable();
    const key: [number] = [
      formatter.GetFormatIndex(NfIndexTableOffset.NF_DATE_SYS_DDMMYYYY, LANGUAGE_SYSTEM),
    ];
    const value: [number] = [0];
    const lexical = unicode(note.GetDate());
    let date: string;
    try {
      if (formatter.IsNumberFormat(lexical, key, value)) {
        const converted = SvXMLUnitConverter.convertDaysToDateTime(
          value[0],
          formatter.GetNullDate(),
        );
        date = `<dc:date>${converted}</dc:date>`;
      } else {
        date = `<meta:date-string>${escapeXml(note.GetDate())}</meta:date-string>`;
      }
    } finally {
      lexical.dispose();
    }
    const edit = note.GetEditTextObject();
    const caption = edit
      ? writeCellParagraphs(this.textStyles.collect(edit))
      : note
          .GetText()
          .split(/\r\n?|\n/gu)
          .map(
            /** Writes a note paragraph. @param line - Plain caption line. @returns Paragraph XML. */
            (line) => this.textParagraph(line),
          )
          .join("");
    const display = note.IsCaptionShown() ? ' office:display="true"' : "";
    return `<office:annotation${display}>${creator}${date}${this.WriteThreadedComment(note)}${caption}</office:annotation>`;
  }
  /** Emits the original fields of a root entry or reply. @param entry - Native thread entry. @param resolved - Whether this is a resolved root. @returns ODF attributes. */
  private threadedCommentAttributes(entry: ScThreadedCommentEntry, resolved = false): string {
    const date = entry.maDateTime ? ` loext:date-time="${escapeXml(entry.maDateTime)}"` : "";
    return ` loext:id="${escapeXml(entry.maGuid)}"${date}${resolved ? ' loext:resolved="true"' : ""} loext:person-id="${escapeXml(entry.maPersonId)}"`;
  }

  /** Writes the same extension as LibreOffice's extended ODF note export. @param note - Native note. @returns Thread extension or empty content. */
  private WriteThreadedComment(note: ScPostIt): string {
    const thread = note.GetThreadedCommentData();
    if (!thread) return "";
    const root = thread.maRoot;
    let xml = `<loext:threaded-comment${this.threadedCommentAttributes(root, thread.mbDone)}><loext:text>${escapeXml(root.maText)}</loext:text>`;
    for (const reply of thread.maReplies)
      xml += `<loext:reply${this.threadedCommentAttributes(reply)}><loext:text>${escapeXml(reply.maText)}</loext:text></loext:reply>`;
    return xml + "</loext:threaded-comment>";
  }

  /** Writes the document's native persons after the sheet content. @returns ODF person declarations. */
  private WritePersons(): string {
    const persons = this.document.GetPersonList();
    if (!persons.length) return "";
    let xml = "<loext:persons>";
    for (const person of persons) {
      const user = person.maUserId ? ` loext:user-id="${escapeXml(person.maUserId)}"` : "";
      const provider = person.maProviderId
        ? ` loext:provider-id="${escapeXml(person.maProviderId)}"`
        : "";
      xml += `<loext:person loext:person-id="${escapeXml(person.maId)}" loext:display-name="${escapeXml(person.maDisplayName)}"${user}${provider}/>`;
    }
    return xml + "</loext:persons>";
  }

  /** Reuses actual shared Writer/Calc inline encoding for a simple literal paragraph. @param value - Literal simple text. @returns Paragraph XML. */
  private textParagraph(value: string): string {
    return `<text:p>${exportText(value.replace(/\r\n?/gu, "\n"))}</text:p>`;
  }
}
