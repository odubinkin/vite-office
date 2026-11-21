/** @fileoverview XLSX workbook and worksheet records over the actual Calc document, cell iterator and XML stream. */
import { getSheetTabSelected } from "../../core/data/document.sheet-visibility";
import type { ScExtDocOptions, ScExtTabSettings } from "../../ui/view/scextopt";
import { convertTwipToMm100 } from "../../../../tools/inc/UnitConversion";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { OFFICE_DOCUMENT_RELATION } from "../../../../oox/source/core/relations";
import { writeTheme } from "../../../../oox/source/export/ThemeExport";
import { ZipStorage, type ZipFragmentStream } from "../../../../oox/source/helper/zipstorage";
import { getRelationship, Relationship } from "../../../../oox/source/token/relationship";
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { FSNS, type FastSerializerHelper } from "../../../../sax/inc/fshelper";
import { ScAddress, ScRefFlags } from "../../../inc/address";
import type { ScRefCellValue } from "../../../inc/cellvalue";
import type { ScDocument } from "../../../inc/document";
import { ScHorizontalCellIterator } from "../../../inc/dociter";
import { CellType, CRFlags } from "../../../inc/global";
import type { ScTable } from "../../../inc/table";
import { spreadsheetNamespace } from "../oox/workbookfragment";
import { getMaxDigitWidth, type XlsxReferenceDevice } from "../oox/unitconverter";
import { XclExpXmlStream, XclXmlUtils } from "./xestream";
import { XclExpSheetProtection, XclExpXmlSheetPr } from "./excrecds";
import { XclExpMergedcells, XclExpSst } from "./xecontent";
import { XclExpExtCondFormat } from "./xeextlst";
import { SaveXmlConditionalFormats } from "./xecontent.conditional";
import { CreateString } from "./xehelper";
import { SaveXmlPageBreaks, XclExpPageSettings } from "./xepage";
import { SaveXmlNames } from "./xename";
import { SaveXmlTabViewSettings, SaveXmlWorkbookViewSettings } from "./xeview";
import { SaveXmlExternalLinks } from "./xelink";
import { XclExpOutlineBuffer } from "./xetable.outline";
import { XclExpXFBuffer, type XclExpFontBuffer } from "./xestyle.xml";

const workbookType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml";
const worksheetType = "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml";
const stylesType = "application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml";
const grammar = FormulaGrammar.Grammar.GRAM_OOXML;

/** Writes a SpreadsheetML element with escaped text. @param serializer - Original part writer. @param name - Element name. @param value - Lexical value. @returns Nothing. */
function writeValue(serializer: FastSerializerHelper, name: string, value: string): void {
  const id = token(name);
  serializer.startElement(id);
  serializer.writeEscaped(value);
  serializer.endElement(id);
}

/** Writes the original cell record with a native reference, value, or formula. @param serializer - Worksheet serializer. @param document - Actual workbook. @param address - Current native address. @param cell - Native cell view or styled blank. @param style - Native XF index. @param strings - Workbook shared strings. @param fonts - Workbook font table. @returns Nothing. */
function SaveXmlCell(
  serializer: FastSerializerHelper,
  document: ScDocument,
  address: ScAddress,
  cell: ScRefCellValue | null,
  style: number | null,
  strings: XclExpSst,
  fonts: XclExpFontBuffer,
): void {
  const position = address.Format(ScRefFlags.VALID);
  const c = token("c"),
    r = token("r"),
    t = token("t");
  try {
    const attributes = [r, position, token("s"), style === null ? null : String(style)];
    if (!cell) {
      serializer.singleElement(c, ...attributes);
      return;
    }
    const formula = cell.getFormula();
    const kind = cell.getType();
    if (formula) {
      const resultType: [string] = [""];
      const result = new OUString();
      const source = formula.GetFormula(grammar);
      try {
        XclXmlUtils.GetFormulaTypeAndValue(formula, resultType, result);
        serializer.startElement(c, ...attributes, t, resultType[0]);
        const expression = text(source);
        if (expression.startsWith("=")) writeValue(serializer, "f", expression.slice(1));
        if (resultType[0] === "inlineStr") {
          serializer.startElement(token("is"));
          writeValue(serializer, "t", text(result));
          serializer.endElement(token("is"));
        } else writeValue(serializer, "v", text(result));
      } finally {
        source.dispose();
        result.dispose();
      }
    } else if (kind === CellType.CELLTYPE_VALUE) {
      serializer.startElement(c, ...attributes);
      writeValue(serializer, "v", String(cell.getDouble()));
    } else {
      const index = strings.Insert(CreateString(document, address, cell, fonts));
      serializer.startElement(c, ...attributes, t, "s");
      writeValue(serializer, "v", String(index));
    }
    serializer.endElement(c);
  } finally {
    position.dispose();
  }
}

/** One native column's attribute run as an XLSX row traversal cursor. */
interface StyledCellRun {
  row: number;
  last: number;
  col: number;
  xf: number;
}

/** Orders the sparse XLSX row buffer by worksheet coordinates. @param left - First cell. @param right - Second cell. @returns Native row order. */
function compareCells(
  left: { row: number; col: number },
  right: { row: number; col: number },
): number {
  return left.row - right.row || left.col - right.col;
}

/** Original XclExpColinfo export width in digit units, rounded half up to two decimals. @param width - Stored twips. @param digit - Maximum digit width in twips. @returns Column width. */
function getExcelColumnWidth(width: number, digit: number): number {
  const mm100 = Number(convertTwipToMm100(BigInt(width)));
  return Math.trunc((100 * mm100) / convertTwipToMm100(digit) + 0.5) / 100;
}

/** Writes contiguous native column geometry and XF records before the row table. @param serializer - Worksheet writer. @param table - Actual sheet. @param styles - Whole-column format indices. @param digit - Maximum digit width. @param defaultWidth - Default fixed-width character count. @param outline - Native outline export buffer. @returns Nothing. */
function SaveXmlColumns(
  serializer: FastSerializerHelper,
  table: ScTable,
  styles: readonly number[],
  digit: number,
  defaultWidth: number,
  outline: XclExpOutlineBuffer,
): void {
  const cols = token("cols");
  let opened = false;
  for (let first = 0; first < styles.length;) {
    const style = styles[first] as number;
    const width = table.GetColWidth(first, false);
    const hidden = table.ColHidden(first);
    const grouping = outline.GetRange(first);
    let end = first + 1;
    while (
      end < styles.length &&
      styles[end] === style &&
      table.GetColWidth(end, false) === width &&
      table.ColHidden(end) === hidden &&
      outline.GetRange(end).level === grouping.level &&
      outline.GetRange(end).collapsed === grouping.collapsed
    )
      end++;
    const custom = Math.abs(getColumnWidth256(width, digit) - defaultWidth) >= 16;
    if (style || hidden || custom || grouping.level || grouping.collapsed) {
      if (!opened) {
        serializer.startElement(cols);
        opened = true;
      }
      serializer.singleElement(
        token("col"),
        token("min"),
        String(first + 1),
        token("max"),
        String(end),
        token("style"),
        String(style),
        token("width"),
        String(getExcelColumnWidth(width, digit)),
        token("customWidth"),
        String(custom),
        token("hidden"),
        String(hidden),
        token("outlineLevel"),
        String(grouping.level),
        token("collapsed"),
        String(grouping.collapsed),
      );
    }
    first = end;
  }
  if (opened) serializer.endElement(cols);
}

/** Original XclTools column width in unsigned 1/256-digit units. @param width - Width in twips. @param digit - Digit width in twips. @returns Fixed width. */
function getColumnWidth256(width: number, digit: number): number {
  return Math.min(65535, Math.trunc(((width + 0.5) * 256) / digit));
}

/** Collects the most common stored native column width. @param table - Actual sheet. @param count - Sheet columns. @param digit - Digit width. @returns Default width in fixed character units. */
function getDefaultColumnWidth(table: ScTable, count: number, digit: number): number {
  const counts = new Map<number, number>();
  let best = 0,
    highest = 0;
  for (let col = 0; col < count;) {
    const run = table.GetColWidthRange(col);
    const end = Math.min(run.mnRow2 + 1, count);
    const width = getColumnWidth256(run.maValue, digit);
    const total = (counts.get(width) ?? 0) + end - col;
    counts.set(width, total);
    if (total > highest) {
      highest = total;
      best = width;
    }
    col = end;
  }
  return best;
}

/** Native height, manual sizing and visibility for one or more rows. */
interface RowGeometry {
  height: number;
  manual: boolean;
  hidden: boolean;
}

/** Reads native row geometry and its contiguous run boundary. @param table - Actual sheet. @param row - Row. @returns Geometry span. */
function getRowGeometry(table: ScTable, row: number): RowGeometry & { last: number } {
  const height = table.GetRowHeightRange(row);
  const flags = table.GetRowFlagsRange(row);
  const end: [number] = [row];
  const hidden = table.RowHidden(row, undefined, end);
  return {
    height: height.mnValue,
    manual: (flags.maValue & CRFlags.ManualSize) !== 0,
    hidden,
    last: Math.min(height.mnRow2, flags.mnRow2, end[0]),
  };
}

/** Compares the source fields representable in sheetFormatPr or row. @param a - First geometry. @param b - Second geometry. @returns Equality. */
function equalRowGeometry(a: RowGeometry, b: RowGeometry): boolean {
  return a.height === b.height && a.manual === b.manual && a.hidden === b.hidden;
}

/** Chooses the most common row geometry by native span length. @param table - Actual sheet. @param last - Last sheet row. @returns Default geometry. */
function getDefaultRowGeometry(table: ScTable, last: number): RowGeometry {
  const counts = new Map<number, number>();
  let best = getRowGeometry(table, 0),
    highest = 0;
  for (let row = 0; row <= last;) {
    const geometry = getRowGeometry(table, row);
    const key = geometry.height * 4 + 2 * Number(geometry.manual) + Number(geometry.hidden);
    const end = Math.min(last, geometry.last);
    const total = (counts.get(key) ?? 0) + end - row + 1;
    counts.set(key, total);
    if (total > highest) {
      highest = total;
      best = geometry;
    }
    row = end + 1;
  }
  return best;
}

/** Returns the next row that needs an explicit geometry record. @param table - Actual sheet. @param row - Start. @param last - Last valid row. @param defaults - Sheet default geometry. @param outline - Worksheet outline export buffer. @returns Row or end sentinel. */
function nextGeometryRow(
  table: ScTable,
  row: number,
  last: number,
  defaults: RowGeometry,
  outline: XclExpOutlineBuffer,
): number {
  while (row <= last) {
    const geometry = getRowGeometry(table, row);
    const grouping = outline.GetRange(row);
    if (!equalRowGeometry(geometry, defaults) || grouping.level || grouping.collapsed) break;
    row = Math.min(geometry.last, grouping.last) + 1;
  }
  return row;
}

/** Starts an XLSX row with its native geometry. @param serializer - Worksheet writer. @param row - Native row. @param geometry - Row properties. @param outline - Worksheet outline export buffer. @returns Nothing. */
function startRow(
  serializer: FastSerializerHelper,
  row: number,
  geometry: RowGeometry,
  outline: XclExpOutlineBuffer,
): void {
  const grouping = outline.GetRange(row);
  serializer.startElement(
    token("row"),
    token("r"),
    String(row + 1),
    token("ht"),
    String(geometry.height / 20),
    token("hidden"),
    String(geometry.hidden),
    token("customHeight"),
    String(geometry.manual),
    token("outlineLevel"),
    String(grouping.level),
    token("collapsed"),
    String(grouping.collapsed),
  );
}

/** Merges native attribute runs without allocating a row record for every empty cell. @param document - Workbook. @param tab - Native tab. @param styles - Workbook XF buffer. @param columnStyles - Whole-column XFs. @returns Row-major styled cells. */
function* styledCells(
  document: ScDocument,
  tab: number,
  styles: XclExpXFBuffer,
  columnStyles: readonly number[],
): Generator<StyledCellRun> {
  const table = document.FetchTable(tab);
  if (!table) return;
  const runs: StyledCellRun[] = [];
  const first: [number] = [0],
    last: [number] = [0];
  table.GetDefaultColumnData().GetPatternRange(first, last, 0);
  const columns =
    last[0] === document.MaxRow() ? table.GetAllocatedColumnsCount() : columnStyles.length;
  for (let col = 0; col < columns; ++col) {
    const data = table.GetColumnData(col);
    for (let row = 0; row <= document.MaxRow(); row = last[0] + 1) {
      const pattern = data.GetPatternRange(first, last, row);
      if (!pattern) break;
      const xf = styles.Insert(pattern);
      if (xf !== columnStyles[col]) runs.push({ row, last: last[0], col, xf });
    }
  }
  // A sorted array is initially a heap; each consumed or advanced root is sifted down.
  runs.sort(compareCells);
  while (runs.length) {
    const head = runs[0] as StyledCellRun;
    yield head;
    if (head.row < head.last) head.row++;
    else {
      const tail = runs.pop() as StyledCellRun;
      if (runs.length === 0) break;
      runs[0] = tail;
    }
    for (let parent = 0; parent * 2 + 1 < runs.length;) {
      const left = parent * 2 + 1;
      const right = left + 1;
      const child =
        right < runs.length &&
        compareCells(runs[right] as StyledCellRun, runs[left] as StyledCellRun) < 0
          ? right
          : left;
      if (compareCells(runs[parent] as StyledCellRun, runs[child] as StyledCellRun) <= 0) break;
      [runs[parent], runs[child]] = [runs[child] as StyledCellRun, runs[parent] as StyledCellRun];
      parent = child;
    }
  }
}

/** Writes a worksheet through the native sparse iterator in row-major order. @param stream - Active XLSX stream. @param document - Workbook. @param tab - Sheet index. @param styles - Workbook XF buffer. @param strings - Workbook shared strings. @param digit - Maximum digit advance in twips. @param view - Captured tab view, if available. @param selected - Whether the tab belongs to the export selection. @returns Nothing. */
function SaveXmlSheet(
  stream: XclExpXmlStream,
  document: ScDocument,
  tab: number,
  styles: XclExpXFBuffer,
  strings: XclExpSst,
  digit: number,
  view: ScExtTabSettings | undefined,
  selected: boolean,
): void {
  const serializer = stream.GetCurrentStream();
  const row = token("row");
  serializer.startElement(token("worksheet"), token("xmlns"), spreadsheetNamespace);
  const page = new XclExpPageSettings(document, tab, styles.GetFontBuffer().GetAppFontData());
  new XclExpXmlSheetPr(document.GetTabBgColor(tab), page.FitToPages()).SaveXml(stream);
  SaveXmlTabViewSettings(stream, document, tab, selected, view);
  const table = document.FetchTable(tab);
  if (!table) throw new Error("Worksheet table is missing.");
  const lastRow = document.MaxRow();
  const defaultWidth = getDefaultColumnWidth(table, document.GetMaxColCount(), digit);
  const defaultRow = getDefaultRowGeometry(table, lastRow);
  const outline = table.GetOutlineTable();
  const columns = outline?.GetColArray(),
    rows = outline?.GetRowArray();
  const columnOutline = new XclExpOutlineBuffer(columns, document.MaxCol());
  const rowOutline = new XclExpOutlineBuffer(rows, lastRow);
  serializer.singleElement(
    token("sheetFormatPr"),
    token("defaultColWidth"),
    String(defaultWidth / 256),
    token("defaultRowHeight"),
    String(defaultRow.height / 20),
    token("customHeight"),
    String(defaultRow.manual),
    token("zeroHeight"),
    String(defaultRow.hidden),
    token("outlineLevelRow"),
    String(rows?.GetDepth() ?? 0),
    token("outlineLevelCol"),
    String(columns?.GetDepth() ?? 0),
  );
  const defaults = new Array<number>(document.GetMaxColCount()).fill(
    styles.Insert(table.GetDefaultColumnData().GetPattern(lastRow)),
  );
  const allocated = table.GetAllocatedColumnsCount();
  for (let col = 0; col < allocated; ++col)
    defaults[col] = styles.Insert(table.GetColumnData(col).GetPattern(lastRow));
  SaveXmlColumns(serializer, table, defaults, digit, defaultWidth, columnOutline);
  serializer.startElement(token("sheetData"));
  const iterator = new ScHorizontalCellIterator(
    document,
    tab,
    0,
    0,
    document.MaxCol(),
    document.MaxRow(),
  );
  const column: [number] = [0],
    position: [number] = [0];
  let currentRow = -1;
  let geometryRow = nextGeometryRow(table, 0, lastRow, defaultRow, rowOutline);
  const formatted = styledCells(document, tab, styles, defaults);
  let styled = formatted.next();
  let cell = iterator.GetNext(column, position);
  while (cell || !styled.done || geometryRow <= lastRow) {
    if ((!cell || geometryRow < position[0]) && (styled.done || geometryRow < styled.value.row)) {
      if (currentRow !== -1) serializer.endElement(row);
      startRow(serializer, geometryRow, getRowGeometry(table, geometryRow), rowOutline);
      serializer.endElement(row);
      currentRow = -1;
      geometryRow = nextGeometryRow(table, geometryRow + 1, lastRow, defaultRow, rowOutline);
      continue;
    }
    const valueAddress = { row: position[0], col: column[0] };
    const order = styled.done ? -1 : cell ? compareCells(valueAddress, styled.value) : 1;
    const withValue = cell !== null && order <= 0;
    const point = withValue ? valueAddress : (styled.value as StyledCellRun);
    const y = point.row;
    if (y !== currentRow) {
      if (currentRow !== -1) serializer.endElement(row);
      startRow(serializer, y, getRowGeometry(table, y), rowOutline);
      currentRow = y;
      if (geometryRow === y)
        geometryRow = nextGeometryRow(table, y + 1, lastRow, defaultRow, rowOutline);
    }
    const address = new ScAddress(point.col, y, tab);
    const xf = !styled.done && order >= 0 ? styled.value.xf : null;
    SaveXmlCell(
      serializer,
      document,
      address,
      withValue ? cell : null,
      xf,
      strings,
      styles.GetFontBuffer(),
    );
    if (withValue) cell = iterator.GetNext(column, position);
    if (order >= 0) styled = formatted.next();
  }
  if (currentRow !== -1) serializer.endElement(row);
  serializer.endElement(token("sheetData"));
  const protection = document.GetTabProtection(tab);
  if (protection?.isProtected()) new XclExpSheetProtection(document, protection).SaveXml(stream);
  new XclExpMergedcells(document, tab).SaveXml(stream);
  const extended = new XclExpExtCondFormat();
  SaveXmlConditionalFormats(serializer, document, table, styles.dxfs, extended);
  page.SaveXml(stream);
  SaveXmlPageBreaks(stream, table);
  extended.SaveXml(serializer, document, styles.dxfs);
  serializer.endElement(token("worksheet"));
  serializer.endDocument();
}

/** Measures the exported application font or applies the source no-printer formula. @param styles - Workbook styles. @param device - Reference device. @returns Digit advance in twips. */
function getCharWidth(styles: XclExpXFBuffer, device?: XlsxReferenceDevice): number {
  const data = styles.GetAppFontData();
  return (
    getMaxDigitWidth(styles.GetAppFont(), device) || Math.trunc((11 * data.mnHeight) / 20) || 110
  );
}

/** Writes workbook parts and commits their original package relationships. @param document - Native Calc document. @param device - Workbook reference device. @param viewOptions - Captured live view state. @returns XLSX bytes. */
export async function exportXlsx(
  document: ScDocument,
  device?: XlsxReferenceDevice,
  viewOptions?: ScExtDocOptions,
): Promise<Uint8Array> {
  const output = new XclExpXmlStream(new ZipStorage(), false, false);
  output.WithValidatedTabNames(
    document,
    /** Serializes workbook names and native formula references in one scope. @returns Nothing. */
    () => SaveXmlWorkbook(output, document, device, viewOptions),
  );
  return await output.commitStorage();
}

/** Writes the workbook and its related streams using the validated export names. @param output - Package writer. @param document - Native workbook. @param device - Workbook reference device. @param viewOptions - Captured live view state. @returns Nothing. */
function SaveXmlWorkbook(
  output: XclExpXmlStream,
  document: ScDocument,
  device?: XlsxReferenceDevice,
  viewOptions?: ScExtDocOptions,
): void {
  const path = "xl/workbook.xml";
  output.addRelation(getRelationship(Relationship.OFFICEDOCUMENT), path);
  const workbook = output.openFragmentStreamWithSerializer(path, workbookType);
  const parent = workbook.getOutputStream() as ZipFragmentStream;
  const theme = document.theme;
  if (theme) {
    const relative = "theme/theme1.xml";
    writeTheme(
      output.openFragmentStreamWithSerializer(
        "xl/" + relative,
        "application/vnd.openxmlformats-officedocument.theme+xml",
      ),
      theme,
    );
    output.addRelation(parent, getRelationship(Relationship.THEME), relative);
  }
  const xmlns = token("xmlns"),
    r = token("r"),
    sheet = token("sheet");
  workbook.startElement(
    token("workbook"),
    xmlns,
    spreadsheetNamespace,
    FSNS(xmlns, r),
    OFFICE_DOCUMENT_RELATION.slice(0, -1),
  );
  workbook.singleElement(
    token("workbookPr"),
    token("date1904"),
    String(document.GetFormatTable().GetNullDate().GetDate() === 19040101),
  );
  const active = document.GetVisibleTab();
  let visible = active;
  if (!document.IsVisible(visible)) {
    visible = 0;
    while (visible + 1 < document.GetTableCount() && !document.IsVisible(visible)) ++visible;
  }
  SaveXmlWorkbookViewSettings(workbook, document, visible);
  workbook.startElement(token("sheets"));
  const name = new OUString();
  const styles = new XclExpXFBuffer(document, device);
  const strings = new XclExpSst();
  const digit = getCharWidth(styles, device);
  try {
    for (let tab = 0; tab < document.GetTableCount(); ++tab) {
      const relative = `worksheets/sheet${tab + 1}.xml`;
      const relation = output.addRelation(
        parent,
        getRelationship(Relationship.WORKSHEET),
        relative,
      );
      if (!document.GetName(tab, name)) throw new Error("Calc worksheet name is missing.");
      workbook.singleElement(
        sheet,
        token("name"),
        name,
        token("sheetId"),
        String(tab + 1),
        token("state"),
        document.IsVisible(tab) ? "visible" : "hidden",
        FSNS(r, token("id")),
        relation,
      );
      output.PushStream(output.openFragmentStreamWithSerializer("xl/" + relative, worksheetType));
      try {
        const view = viewOptions?.GetTabSettings(tab);
        const selected =
          tab === visible ||
          (viewOptions ? view?.mbSelected : getSheetTabSelected(document, tab)) === true;
        SaveXmlSheet(output, document, tab, styles, strings, digit, view, selected);
      } finally {
        output.PopStream();
      }
    }
    output.addRelation(parent, getRelationship(Relationship.STYLES), "styles.xml");
    output.PushStream(output.openFragmentStreamWithSerializer("xl/styles.xml", stylesType));
    try {
      styles.SaveXml(output);
    } finally {
      output.PopStream();
    }
    output.PushStream(workbook);
    try {
      strings.SaveXml(output, styles.GetFontBuffer());
    } finally {
      output.PopStream();
    }
  } finally {
    name.dispose();
    styles.Dispose();
  }
  workbook.endElement(token("sheets"));
  SaveXmlExternalLinks(output, workbook, document);
  SaveXmlNames(workbook, document);
  workbook.endElement(token("workbook"));
  workbook.endDocument();
}
