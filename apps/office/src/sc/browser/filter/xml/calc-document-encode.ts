/** @fileoverview Captures Calc workbook state for transfer to the ODF worker. */
import { encodeCalcChangeTrack } from "./calc-change-track-codec";
import { ScAreaLink } from "../../../source/ui/docshell/arealink";
import { encodeCalcAreaLink, type CalcAreaLinkRecord } from "./calc-area-link-codec";
import { encodeSheetLink } from "./calc-sheet-link-codec";
import { ATTR_VALIDDATA } from "../../../inc/scitems";
import { encodeCalcValidations } from "./calc-validation-codec";
import type { NoteEntry } from "../../../inc/postit";
import { encodeCalcDatabaseRanges } from "./calc-database-range-codec";
import {
  encodeCalcCellNote,
  encodeCalcPerson,
  type CalcCellNoteRecord,
  type CalcPersonRecord,
} from "./calc-note-codec";
import { encodeCalcIconSets } from "./calc-icon-set-codec";
import { escapeXml } from "../../../../xmloff/source/text/txtparae";
import { encodeMatrixCell } from "./calc-matrix-cell-codec";
import { COL_AUTO, COL_GRAY3 } from "../../../../tools/inc/color";
import { exportPageStyles } from "../../../source/filter/xml/xmlstyle.page";
import { GetPrintRanges } from "../../../source/core/data/table1";
import {
  getSheetCursor,
  getSheetTabSelected,
  getSheetPaneLayout,
} from "../../../source/core/data/document.sheet-visibility";
import type { ScDocument } from "../../../inc/document";
import {
  ScTableProtectionOption as ProtectionOption,
  ScDocProtectionOption,
} from "../../../inc/tabprotection";
import { ScDocProtection, ScTableProtection } from "../../../source/core/data/tabprotection";
import { type ScRangePairList } from "../../../inc/rangelst";
import { ScRange, MAXCOL, MAXROW } from "../../../inc/address";
import { ScHorizontalCellIterator } from "../../../inc/dociter";
import { CellType, CRFlags } from "../../../inc/global";
import { encodeConsolidation } from "./calc-consolidation-codec";
import { ScPatternAttr } from "../../../inc/patattr";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { XMLFontAutoStylePool } from "../../../../xmloff/source/style/XMLFontAutoStylePool";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import { ExportConditionalFormat } from "../../../source/filter/xml/xmlcondformat";
import {
  exportCellTextPropertyElement,
  exportCellPropertyElement,
  exportCellParagraphProperties,
  exportNamedCellStyles,
  getCellStyleXMLName,
  getCellStyleXMLNames,
} from "../../../source/filter/xml/xmlstyle";
import type { ScTable } from "../../../inc/table";
import { ViewOption } from "../../../inc/viewopti";
import { SfxUInt32Item } from "../../../../svl/source/items/intitem";
import { SvxFrameDirectionItem } from "../../../../editeng/source/items/frmitems.direction";
import { ATTR_MERGE, ATTR_VALUE_FORMAT, ATTR_WRITINGDIR } from "../../../inc/scitems";
import type { ScMergeAttr } from "../../../inc/attrib";
import { CellTextStylePool } from "../../../source/filter/xml/xmlexprt.celltext";
import { FormulaStringToken } from "../../../../formula/inc/token";
import { FormulaError, GetDoubleErrorValue } from "../../../../formula/inc/errorcodes";
import type {
  ExternalCell,
  ExternalFile,
  ExternalSheet,
  NumberFormat,
  OutlineGroup,
  RangeRecord,
  LabelRangeRecord,
  ProtectionRecord,
  Sheet,
  CalcDocumentRecord,
} from "./calc-document-codec";

/** Serializes both native endpoints, including their sheet positions. @param range - Owned range. @returns Transfer record. */
function encodeRange(range: ScRange): RangeRecord {
  return [...range.aStart.GetVars(), ...range.aEnd.GetVars()];
}

/** Preserves the original order of the native label-pair owner. @param list - Column or row labels. @returns Transfer pairs. */
function encodeLabelRanges(list: ScRangePairList): readonly LabelRangeRecord[] {
  const records: LabelRangeRecord[] = [];
  for (let index = 0; index < list.size(); ++index) {
    const pair = list.at(index);
    records.push([encodeRange(pair.GetRange(0)), encodeRange(pair.GetRange(1))]);
  }
  return records;
}

/** Copies a native protection owner into the Worker record. @param protection - Workbook or sheet protection. @param optionCount - Native option count. @returns Detached state. */
function encodeProtection(
  protection: Readonly<ScDocProtection | ScTableProtection>,
  optionCount: number,
): ProtectionRecord {
  return {
    enabled: protection.isProtected(),
    options: Array.from(
      { length: optionCount },
      /** Reads a native option in enum order. @param _value - Uninitialized slot. @param option - Native option. @returns Permission. */
      (_value, option) => protection.isOptionEnabled(option),
    ),
    ooxHash: protection.getOoxPasswordHash(),
    storedHash: protection.getStoredPasswordHash(),
  };
}

/** Captures supported values without computing formula results or packaging XML. @param document - Model. @returns Incremental record. */
export function* encodeSteps(document: ScDocument): Generator<void, CalcDocumentRecord> {
  const sheets: Sheet[] = [],
    fonts = new XMLFontAutoStylePool(),
    styles = new Map<string, { name: string; parent: string; properties: string }>(),
    patternNames = new Map<ScPatternAttr, string>();
  const pageStyles = exportPageStyles(document, fonts);
  const reservedNames = getCellStyleXMLNames(document);
  let automaticStyleIndex = 0;
  const numberFormats: NumberFormat[] = [];
  const textStyles = new CellTextStylePool(document, fonts);
  const numberFormatIndices = new Map<number, number>();
  /** Adds one native format definition to the transfer table. @param key - Number-format index. @returns Transfer index, if represented. */
  function registerNumberFormat(key: number): number | undefined {
    const formatter = document.GetFormatTable();
    const existing = numberFormatIndices.get(key);
    if (existing !== undefined) return existing;
    const entry = formatter.GetEntry(key);
    if (!entry) return undefined;
    const index = numberFormats.push([entry.GetLanguage(), text(entry.GetFormatstring())]) - 1;
    numberFormatIndices.set(key, index);
    return index;
  }
  const styleName =
    /** Encodes native style identity for the Calc worker boundary. @param pattern - pattern. @returns Operation result. */ (
      pattern: ScPatternAttr,
    ): string => {
      const cached = patternNames.get(pattern);
      if (cached !== undefined) return cached;
      const t = exportCellTextPropertyElement(pattern, fonts),
        c = exportCellPropertyElement(pattern),
        p = exportCellParagraphProperties(pattern);
      const parent = getCellStyleXMLName(pattern.GetStyleName());
      const properties = `${t}${c}${p ? `<style:paragraph-properties${p}/>` : ""}`;
      if (!properties) {
        const name = parent === "Default" ? "" : parent;
        patternNames.set(pattern, name);
        return name;
      }
      const key = JSON.stringify([parent, properties]);
      let style = styles.get(key);
      if (!style) {
        let name: string;
        do name = `ce${++automaticStyleIndex}`;
        while (reservedNames.has(name));
        style = { name, parent, properties };
        styles.set(key, style);
      }
      patternNames.set(pattern, style.name);
      return style.name;
    };
  for (let tab = 0; tab < document.GetTableCount(); tab++) {
    const table = document.FetchTable(tab) as ScTable;
    const merges: NonNullable<Sheet["merges"]> = [];
    const outline = table.GetOutlineTable();
    const groups: OutlineGroup[] = [];
    const rowBreaks = new Set<number>();
    const columnBreaks = new Set<number>();
    table.GetAllRowBreaks(rowBreaks, false, true);
    table.GetAllColBreaks(columnBreaks, false, true);
    const repeatColumns = table.GetRepeatColRange();
    const repeatRows = table.GetRepeatRowRange();
    const protection = table.GetProtection();
    const link = encodeSheetLink(table);
    const cursor = getSheetCursor(document, tab);
    const tabSelected = getSheetTabSelected(document, tab);
    const panes = getSheetPaneLayout(document, tab);
    const tabColor = table.GetTabBgColor();
    const pageStyle = table.GetPageStyle();
    const conditionalFormats = ExportConditionalFormat(document, table, true);
    const conditionalIconSets = encodeCalcIconSets(table);
    const noteEntries: NoteEntry[] = [];
    document.GetAllNoteEntries(tab, noteEntries);
    const notes: CalcCellNoteRecord[] = [];
    const scenario = table.IsScenario() ? table.GetScenarioData() : undefined;
    const sheet: Sheet = {
      ...(scenario
        ? {
            scenario: {
              active: table.IsActiveScenario(),
              comment: scenario.comment,
              color: scenario.color.toUInt32(),
              flags: scenario.flags,
              ranges: Array.from(table.GetScenarioRanges(), encodeRange),
            },
          }
        : {}),
      ...(link ? { link } : {}),
      ...(pageStyles.names.has(pageStyle) ? { pageStyle } : {}),
      ...(tabColor.equals(COL_AUTO) ? {} : { tabColor: tabColor.toUInt32() }),
      ...(table.IsVisible() ? {} : { visible: false }),
      ...(table.IsLayoutRTL() ? { layoutRTL: true } : {}),
      ...(protection
        ? {
            protection: {
              ...encodeProtection(protection, ProtectionOption.NONE),
              enhanced: protection.getEnhancedProtection().map(
                /** Copies a native enhanced range into a realm-neutral record. @param entry - Native range record. @returns Transferrable record. */
                (entry) => ({ ...entry, ranges: Array.from(entry.ranges, encodeRange) }),
              ),
            },
          }
        : {}),
      ...(outline ? { outline: groups } : {}),
      ...(rowBreaks.size ? { rowBreaks: [...rowBreaks] } : {}),
      ...(columnBreaks.size ? { columnBreaks: [...columnBreaks] } : {}),
      ...(table.IsPrintEntireSheet()
        ? {}
        : { printRanges: GetPrintRanges(table).map(encodeRange) }),
      ...(conditionalFormats ? { conditionalFormats } : {}),
      ...(conditionalIconSets.length ? { conditionalIconSets } : {}),
      ...(repeatColumns ? { repeatColumns: encodeRange(repeatColumns) } : {}),
      ...(repeatRows ? { repeatRows: encodeRange(repeatRows) } : {}),
      name: text(table.GetName()),
      ...(document.GetSheetShowGrid(tab) ? {} : { showGrid: false }),
      ...(cursor[0] || cursor[1] ? { cursor } : {}),
      ...(tabSelected === undefined ? {} : { tabSelected }),
      ...(panes ? { panes } : {}),
      optimalMinRowHeight: table.GetOptimalMinRowHeight(),
      cells: [],
      ...(noteEntries.length ? { notes } : {}),
      patterns: [],
      merges,
      columns: [],
      rows: [],
    };
    sheets.push(sheet);
    for (const entry of noteEntries) {
      notes.push(encodeCalcCellNote(entry, textStyles));
      yield;
    }
    if (outline)
      for (const rows of [false, true]) {
        const axis = rows ? outline.GetRowArray() : outline.GetColArray();
        for (let level = 0; level < axis.GetDepth(); ++level)
          for (const entry of axis.GetEntries(level)) {
            groups.push([rows, entry.start, entry.end, entry.hidden, entry.visible]);
            yield;
          }
      }
    const iterator = new ScHorizontalCellIterator(document, tab, 0, 0, MAXCOL, MAXROW),
      col: [number] = [0],
      row: [number] = [0];
    let cell;
    while ((cell = iterator.GetNext(col, row))) {
      const formula = cell.getFormula();
      if (formula) {
        const matrix = encodeMatrixCell(formula);
        if (matrix) {
          sheet.cells.push(matrix);
          continue;
        }
        const source = formula.GetFormula(FormulaGrammar.Grammar.GRAM_ODFF);
        try {
          if (
            !formula.GetDirty() &&
            formula.GetErrCode() === FormulaError.NONE &&
            !formula.IsEmpty()
          ) {
            const result = formula.IsValue()
              ? formula.GetValue()
              : text(formula.GetString().getString());
            sheet.cells.push([
              col[0],
              row[0],
              "formula",
              text(source),
              [result, formula.NeedsNumberFormat()],
            ]);
          } else sheet.cells.push([col[0], row[0], "formula", text(source)]);
        } finally {
          source.dispose();
        }
      } else if (cell.getType() === CellType.CELLTYPE_VALUE)
        sheet.cells.push([col[0], row[0], "number", cell.getDouble()]);
      else if (cell.getType() === CellType.CELLTYPE_EDIT) {
        const edit = cell.getEditText();
        /* istanbul ignore if -- B8TCAE-C01: the actual borrowed EDIT view always retains its constructor-bound non-null edit owner. */
        if (!edit) throw new Error("Calc edit cell is unavailable.");
        else {
          /* Keep the genuine owned-value alternative visible to source mapping. */
        }
        sheet.cells.push([col[0], row[0], "edit", textStyles.collect(edit)]);
      } else {
        const string = cell.getSharedString();
        if (!string) throw new Error("Calc worker cell type is unsupported.");
        sheet.cells.push([col[0], row[0], "text", text(string.getString())]);
      }
      yield;
    }
    for (let column = -1; column < table.GetAllocatedColumnsCount(); column++) {
      const data = column === -1 ? table.GetDefaultColumnData() : table.GetColumnData(column);
      const first: [number] = [0],
        last: [number] = [0];
      for (let r = 0; r <= MAXROW;) {
        const pattern = data.GetPatternRange(first, last, r) as ScPatternAttr;
        const style = styleName(pattern);
        const numberFormat = pattern.GetItemSet().GetItemIfSet(ATTR_VALUE_FORMAT, false)
          ? registerNumberFormat(pattern.GetNumberFormat(document.GetFormatTable()))
          : undefined;
        const direction = (
          pattern.GetItemSet().GetItemIfSet(ATTR_WRITINGDIR, false) as
            SvxFrameDirectionItem | undefined
        )?.GetValue();
        const validation = (pattern.GetItem(ATTR_VALIDDATA) as SfxUInt32Item).GetValue();
        sheet.patterns.push(
          validation
            ? [column, r, last[0], style, numberFormat, direction, validation]
            : direction !== undefined
              ? [column, r, last[0], style, numberFormat, direction]
              : numberFormat === undefined
                ? [column, r, last[0], style]
                : [column, r, last[0], style, numberFormat],
        );
        const merge = pattern.GetItem(ATTR_MERGE) as ScMergeAttr;
        if (column >= 0 && merge.IsMerged()) {
          for (let row = r; row <= last[0]; ++row) {
            merges.push([
              column,
              row,
              column + merge.GetColMerge() - 1,
              row + merge.GetRowMerge() - 1,
            ]);
            yield;
          }
        }
        r = last[0] + 1;
        yield;
      }
    }
    for (let col = 0; col <= MAXCOL;) {
      const width = table.GetColWidthRange(col),
        end: [number] = [0],
        hidden = table.ColHidden(col, undefined, end),
        last = Math.min(width.mnRow2, end[0]);
      sheet.columns.push([col, last, width.maValue, hidden]);
      col = last + 1;
      yield;
    }
    for (let row = 0; row <= MAXROW;) {
      const height = table.GetRowHeightRange(row),
        flags = table.GetRowFlagsRange(row),
        hiddenEnd: [number] = [0],
        filteredEnd: [number] = [0];
      const hidden = table.RowHidden(row, undefined, hiddenEnd),
        filtered = table.getFilterData().rowFiltered(row, undefined, filteredEnd),
        last = Math.min(height.mnRow2, flags.mnRow2, hiddenEnd[0], filteredEnd[0]);
      sheet.rows.push([
        row,
        last,
        height.mnValue,
        !!(flags.maValue & CRFlags.ManualSize),
        hidden,
        filtered,
      ]);
      row = last + 1;
      yield;
    }
  }
  const namespaces = Object.entries(ODF_NAMESPACES)
    .map(
      /** Encodes native style identity for the Calc worker boundary. @param input1 - Operation input. @returns Operation result. */ ([
        prefix,
        uri,
      ]) => ` xmlns:${prefix}="${uri}"`,
    )
    .join("");
  const automatic = Array.from(
    styles.values(),
    /** Encodes an automatic pattern and its native named parent. @param style - Pattern style. @returns ODF style element. */ ({
      name,
      parent,
      properties,
    }) =>
      `<style:style style:name="${name}" style:family="table-cell"${parent ? ` style:parent-style-name="${escapeXml(parent)}"` : ""}>${properties}</style:style>`,
  ).join("");
  const defaults = exportNamedCellStyles(document, fonts);
  const defaultWritingDirection = (
    document
      .GetStyleSheetPool()
      ?.GetDefaultStyle()
      ?.GetItemSet()
      .GetItemIfSet(ATTR_WRITINGDIR, false) as SvxFrameDirectionItem | undefined
  )?.GetValue();
  const names: NonNullable<CalcDocumentRecord["names"]>[number][] = [];
  for (let scope = -1; scope < document.GetTableCount(); ++scope)
    for (const entry of document.GetRangeName(scope) ?? []) {
      names.push([
        entry.name,
        scope,
        entry.pos.Col(),
        entry.pos.Row(),
        entry.pos.Tab(),
        entry.type,
        entry.GetSymbol(),
      ]);
      yield;
    }
  const view = document.GetViewOptions();
  const externalFiles: ExternalFile[] = [];
  for (const file of document.GetExternalRefManager().getExternalFiles()) {
    const sheets: ExternalSheet[] = [];
    for (const sheet of file.tables.values()) {
      const cached: ExternalCell[] = [];
      for (const [row, cells] of sheet.cache.entries()) {
        for (const [col, { token, format }] of cells) {
          const index = format === 0 ? undefined : registerNumberFormat(format);
          const formatValue: [number?] = index === undefined ? [] : [index];
          if (token instanceof FormulaStringToken)
            cached.push([col, row, "string", text(token.GetString().getString()), ...formatValue]);
          else {
            const number = token.GetDouble();
            const error = GetDoubleErrorValue(number);
            cached.push(
              error === FormulaError.NONE
                ? [col, row, "double", number, ...formatValue]
                : [col, row, "error", error, ...formatValue],
            );
          }
          yield;
        }
      }
      sheets.push(
        sheet.cache.isWholeTableCached() ? [sheet.name, cached, true] : [sheet.name, cached],
      );
    }
    const filter =
      file.filterName || file.filterOptions
        ? ([file.filterName ?? "", file.filterOptions ?? ""] as const)
        : undefined;
    externalFiles.push(
      filter
        ? [file.name, sheets, file.relativeName, filter]
        : file.relativeName === undefined
          ? [file.name, sheets]
          : [file.name, sheets, file.relativeName],
    );
  }
  const options = document.GetDocOptions();
  const grid = view.GetGridOptions();
  const gridColor = view.GetGridColor();
  const config = document.GetCalcConfig();
  const persons: CalcPersonRecord[] = [];
  for (const person of document.GetPersonList()) {
    persons.push(encodeCalcPerson(person));
    yield;
  }
  const databaseRanges = encodeCalcDatabaseRanges(document);
  const validations = encodeCalcValidations(document);
  const documentMetaXml = document.documentProperties.GetTransferXml();
  const docProtection = document.GetDocProtection();
  const changeTrack = encodeCalcChangeTrack(document, textStyles);
  const consolidation = document.GetConsolidateDlgData();
  const embeddedFonts = document.GetEmbeddedFonts();
  const fontEmbedding = [
    document.IsEmbedFonts(),
    document.IsEmbedUsedFontsOnly(),
    document.IsEmbedFontScriptLatin(),
    document.IsEmbedFontScriptAsian(),
    document.IsEmbedFontScriptComplex(),
  ] as const;
  const areaLinks: CalcAreaLinkRecord[] = [];
  for (const link of document.GetDocLinkManager().getExistingLinkManager()?.GetLinks() ?? []) {
    if (link instanceof ScAreaLink) areaLinks.push(encodeCalcAreaLink(link));
    yield;
  }
  const columnLabels = encodeLabelRanges(document.GetColNameRanges());
  const rowLabels = encodeLabelRanges(document.GetRowNameRanges());
  return {
    version: 1,
    ...(columnLabels.length || rowLabels.length ? { labelRanges: [columnLabels, rowLabels] } : {}),
    ...(fontEmbedding[0] ||
    fontEmbedding[1] ||
    !fontEmbedding[2] ||
    !fontEmbedding[3] ||
    !fontEmbedding[4]
      ? { fontEmbedding }
      : {}),
    ...(embeddedFonts.length ? { embeddedFonts } : {}),
    ...(consolidation === undefined ? {} : { consolidation: encodeConsolidation(consolidation) }),
    ...(documentMetaXml === undefined ? {} : { documentMetaXml }),
    ...(docProtection
      ? { docProtection: encodeProtection(docProtection, ScDocProtectionOption.NONE) }
      : {}),
    ...(changeTrack ? { changeTrack } : {}),
    ...(FormulaGrammar.isPODF(document.GetStorageGrammar())
      ? { storageGrammar: FormulaGrammar.Grammar.GRAM_PODF }
      : {}),
    sheets,
    ...(databaseRanges ? { databaseRanges } : {}),
    ...(validations.length ? { validations } : {}),
    ...(externalFiles.length ? { externalFiles } : {}),
    ...(areaLinks.length ? { areaLinks } : {}),
    ...(persons.length ? { persons } : {}),
    ...(document.GetVisibleTab() ? { visibleTab: document.GetVisibleTab() } : {}),
    ...(view.GetOption(ViewOption.GRID) ? {} : { showGrid: false }),
    ...(view.GetOption(ViewOption.FORMULAS) ? { showFormulas: true } : {}),
    ...(view.GetOption(ViewOption.HEADER) ? {} : { showHeaders: false }),
    ...(view.GetOption(ViewOption.NULLVALS) ? {} : { showZeros: false }),
    ...(view.GetOption(ViewOption.OUTLINER) ? {} : { showOutline: false }),
    ...(view.GetOption(ViewOption.TABCONTROLS) ? {} : { showSheetTabs: false }),
    ...(view.GetOption(ViewOption.PAGEBREAKS) ? {} : { showPageBreaks: false }),
    ...(view.GetOption(ViewOption.NOTES) ? {} : { showNotes: false }),
    ...(view.GetOption(ViewOption.NOTEAUTHOR) ? {} : { showNoteAuthor: false }),
    ...(view.GetOption(ViewOption.FORMULAS_MARKS) ? { showFormulasMarks: true } : {}),
    ...(view.GetOption(ViewOption.SYNTAX) ? { valueHighlighting: true } : {}),
    ...(!gridColor.equals(COL_GRAY3) ? { gridColor: gridColor.toUInt32() } : {}),
    ...(document.GetAutoCalc() ? {} : { autoCalculate: false }),
    ...(config.mbHasStringRefSyntax ||
    config.meStringRefAddressSyntax !== FormulaGrammar.AddressConvention.CONV_UNSPECIFIED
      ? { stringRefSyntax: [config.meStringRefAddressSyntax, config.mbHasStringRefSyntax] as const }
      : {}),
    drawingGrid: [
      grid.GetFieldDrawX(),
      grid.GetFieldDrawY(),
      grid.GetFieldDivisionX(),
      grid.GetFieldDivisionY(),
      grid.GetUseGridSnap(),
      grid.GetGridVisible(),
      grid.GetSynchronize(),
    ],
    nullDate: document.GetFormatTable().GetNullDate().GetDate(),
    ...(options.IsIgnoreCase() ? { ignoreCase: true } : {}),
    calculationSettings: {
      calcAsShown: options.IsCalcAsShown(),
      lookUpLabels: options.IsLookUpColRowNames(),
      matchWholeCell: options.IsMatchWholeCell(),
      regex: options.IsFormulaRegexEnabled(),
      wildcards: options.IsFormulaWildcardsEnabled(),
      iterationEnabled: options.IsIter(),
      iterationCount: options.GetIterCount(),
      iterationEpsilon: options.GetIterEps(),
      year2000: options.GetYear2000(),
    },
    ...(defaultWritingDirection === undefined ? {} : { defaultWritingDirection }),
    ...(numberFormats.length ? { numberFormats } : {}),
    ...(names.length ? { names } : {}),
    styles: `<office:document-styles${namespaces} office:version="1.3">${fonts.exportXML()}${defaults}<office:automatic-styles>${automatic}${textStyles.exportStyles()}${pageStyles.layouts}</office:automatic-styles>${pageStyles.masters}</office:document-styles>`,
  };
}
