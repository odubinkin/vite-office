/** @fileoverview Original SheetDataBuffer merge finalization, cell/formula/table models and row/merge ranges. */
import { ScAddress, ScRange } from "../../../inc/address";
import { XML_TOKEN_INVALID } from "../../../../oox/source/token/tokenmap";
import { ValueRange } from "../../../../oox/inc/helper/containerhelper";
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { SvxBoxItem, SvxBoxItemLine } from "../../../../editeng/source/items/frmitems";
import type { ScDocument } from "../../../inc/document";
import type { CellAttributeHolder } from "../../../inc/patattr";
import { ScAttrEntry } from "../../core/data/attarray";
import { ATTR_BORDER } from "../../../inc/scitems";
import { Converter } from "../../../../sax/source/tools/converter";
import { DateTime } from "../../../../offapi/com/sun/star/util/DateTime";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import type { UnitConverter } from "./unitconverter";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import type { RichString } from "../inc/richstring";
import type { Font } from "./stylesbuffer";

/** Original ordered merge buffer for one worksheet. */
export class SheetDataBuffer {
  private readonly maMergedRanges: MergedRange[] = [];
  /** Binds the current worksheet's native document graph. @param document - Actual workbook. @param tab - Sheet index. @param units - Workbook converter. @returns Worksheet data buffer. */
  constructor(
    private readonly document: ScDocument,
    private readonly tab: number,
    private readonly units: UnitConverter,
  ) {}

  /** Writes the original nonempty scalar cell text. @param address - Native cell. @param value - Source string. @returns Nothing. */
  setStringCell(address: ScAddress, value: OUStringConstReference): void {
    if (!value.isEmpty()) this.document.SetTextCell(address, value);
  }

  /** Selects scalar storage or the actual Calc edit engine for rich text. @param address - Native cell. @param value - Imported string portions. @param firstFont - Optional original cell font. @returns Nothing. */
  setRichStringCell(address: ScAddress, value: RichString, firstFont?: Font): void {
    const plain = new OUString();
    try {
      if (value.extractPlainString(plain, firstFont)) {
        this.setStringCell(address, plain);
        return;
      }
    } finally {
      plain.dispose();
    }
    this.document.SetEditText(address, value.convert(this.document.GetEditEngine(), firstFont));
  }

  /** Parses an explicit date cell, retaining the original string on parse failure and the supplied XF in both cases. @param address - Actual cell. @param value - SpreadsheetML lexical date. @returns Nothing. */
  setDateCell(address: ScAddress, value: string): void {
    const date = new DateTime();
    if (Converter.parseDateTime(date, value)) {
      this.document.SetValue(address, this.units.calcSerialFromDateTime(date));
      return;
    }
    const string = unicode(value);
    try {
      this.document.SetTextCell(address, string);
    } finally {
      string.dispose();
    }
  }

  /** Imports a logical constant through the native formula compiler. @param address - Actual cell. @param value - Parsed logical value. @returns Nothing. */
  setBooleanCell(address: ScAddress, value: boolean): void {
    this.setCellFormula(address, value ? "TRUE()" : "FALSE()");
    // The scalar has no dependencies. Finish its result and automatic number format before recording sheet styles.
    this.document.GetFormulaCell(address)?.GetValue();
  }

  /** Imports an Excel error constant through the same compiler. @param address - Actual cell. @param value - Original Excel error token. @returns Nothing. */
  setErrorCell(address: ScAddress, value: string): void {
    this.setCellFormula(address, value);
  }

  /** Installs the native formula for a worksheet scalar constant. @param address - Actual cell. @param value - OOXML formula source. @returns Nothing. */
  private setCellFormula(address: ScAddress, value: string): void {
    const formula = unicode("=" + value);
    try {
      this.document.SetFormula(address, formula, FormulaGrammar.Grammar.GRAM_OOXML);
    } finally {
      formula.dispose();
    }
  }

  /** Stores the imported merge range by value. @param range - Parsed native range. @returns Nothing. */
  setMergedRange(range: ScRange): void {
    this.maMergedRanges.push(new MergedRange(range));
  }

  /** Applies the worksheet XF through the native pattern cache, including an empty cell. @param address - Actual cell. @param pattern - Workbook XF pattern. @returns Nothing. */
  setCellFormat(address: ScAddress, pattern: CellAttributeHolder): void {
    this.document.SetPattern(address.Col(), address.Row(), this.tab, pattern);
  }

  /** Sets the original worksheet column defaults through native whole-column runs. @param first - First column. @param last - Last column. @param pattern - Workbook XF. @returns Nothing. */
  setColumnFormat(first: number, last: number, pattern: CellAttributeHolder): void {
    const table = this.document.FetchTable(this.tab);
    if (!table) return;
    const entry = new ScAttrEntry();
    entry.nEndRow = this.document.MaxRow();
    entry.setCellAttributeHolder(pattern);
    table.SetAttrEntries(first, last, [entry]);
  }

  /** Applies the original edge border and merge operations after cell data and formatting. @returns Nothing. */
  finalizeImport(): void {
    const table = this.document.FetchTable(this.tab);
    if (!table) return;
    for (const { maRange: range } of this.maMergedRanges) {
      const start = range.aStart,
        end = range.aEnd;
      const multiCol = start.Col() < end.Col(),
        multiRow = start.Row() < end.Row();
      if (multiCol) this.setBorderLine(range, SvxBoxItemLine.RIGHT);
      if (multiRow) this.setBorderLine(range, SvxBoxItemLine.BOTTOM);
      if (multiCol || multiRow)
        table.SetMergedCells(start.Col(), start.Row(), end.Col(), end.Row());
    }
  }

  /** Copies the native edge border onto the merged anchor. @param range - Source merge. @param side - Original right or bottom edge. @returns Nothing. */
  private setBorderLine(range: ScRange, side: SvxBoxItemLine): void {
    const table = this.document.FetchTable(this.tab);
    const start = range.aStart,
      end = range.aEnd;
    const column = side === SvxBoxItemLine.RIGHT ? end.Col() : start.Col();
    const row = side === SvxBoxItemLine.BOTTOM ? end.Row() : start.Row();
    const source = table?.GetPattern(column, row)?.GetItem(ATTR_BORDER) as SvxBoxItem | undefined;
    const destination = table?.GetPattern(start.Col(), start.Row())?.GetItem(ATTR_BORDER) as
      SvxBoxItem | undefined;
    if (!table || !source || !destination) return;
    const box = destination.Clone();
    try {
      box.SetLine(source.GetLine(side), side);
      table.ApplyAttr(start.Col(), start.Row(), box);
    } finally {
      box.Dispose();
    }
  }
}
/** Original current-cell model. */
export class CellModel {
  readonly maCellAddr: ScAddress;
  mnCellType: number;
  mnXfId: number;
  mbShowPhonetic: boolean;
  /** Original default/implicit-copy construction owns its address by value. @param source - Optional actual model. @returns Model. */
  constructor(source?: CellModel) {
    this.maCellAddr = source === undefined ? new ScAddress() : new ScAddress(source.maCellAddr);
    this.mnCellType = source?.mnCellType ?? XML_TOKEN_INVALID;
    this.mnXfId = source?.mnXfId ?? -1;
    this.mbShowPhonetic = source?.mbShowPhonetic ?? false;
  }
}
/** Original formula model preserves the range supplied by the parser. */
export class CellFormulaModel {
  readonly maFormulaRef: ScRange;
  mnFormulaType: number;
  mnSharedId: number;
  /** Original default/implicit-copy construction. @param source - Optional actual model. @returns Model. */
  constructor(source?: CellFormulaModel) {
    this.maFormulaRef = source === undefined ? new ScRange() : new ScRange(source.maFormulaRef);
    this.mnFormulaType = source?.mnFormulaType ?? XML_TOKEN_INVALID;
    this.mnSharedId = source?.mnSharedId ?? -1;
  }
  /** Original array predicate compares only the exact start address. @param address - Actual cell. @returns Whether start matches. */
  isValidArrayRef(address: ScAddress): boolean {
    return this.maFormulaRef.aStart.equals(address);
  }
  /** Original shared predicate checks start sheet and inclusive columns/rows, without checking the end sheet. @param address - Actual cell. @returns Whether source constraints match. */
  isValidSharedRef(address: ScAddress): boolean {
    return (
      this.maFormulaRef.aStart.Tab() === address.Tab() &&
      this.maFormulaRef.aStart.Col() <= address.Col() &&
      address.Col() <= this.maFormulaRef.aEnd.Col() &&
      this.maFormulaRef.aStart.Row() <= address.Row() &&
      address.Row() <= this.maFormulaRef.aEnd.Row()
    );
  }
}
/** Original table-operation model owns the two source references as Unicode values. */
export class DataTableModel {
  readonly maRef1: OUString;
  readonly maRef2: OUString;
  mb2dTable: boolean;
  mbRowTable: boolean;
  mbRef1Deleted: boolean;
  mbRef2Deleted: boolean;
  /** Original default/implicit-copy construction. @param source - Optional actual source. @returns Model. */
  constructor(source?: DataTableModel) {
    this.maRef1 = source === undefined ? new OUString() : new OUString(source.maRef1);
    this.maRef2 = source === undefined ? new OUString() : new OUString(source.maRef2);
    this.mb2dTable = source?.mb2dTable ?? false;
    this.mbRowTable = source?.mbRowTable ?? false;
    this.mbRef1Deleted = source?.mbRef1Deleted ?? false;
    this.mbRef2Deleted = source?.mbRef2Deleted ?? false;
  }
  /** Explicit binding of the two native Unicode member destructors. @returns Nothing. */
  dispose(): void {
    this.maRef1.dispose();
    this.maRef2.dispose();
  }
}
/** Original SheetDataBuffer::XfIdRowRange value, kept without inventing a SheetDataBuffer instance. */
export class XfIdRowRange {
  readonly maRowRange: ValueRange;
  mnXfId: number;
  /** Original default/implicit-copy construction. @param source - Optional actual value. @returns Row range. */
  constructor(source?: XfIdRowRange) {
    this.maRowRange = new ValueRange(source?.maRowRange ?? -1);
    this.mnXfId = source?.mnXfId ?? -1;
  }
  /** Original value assignment to the existing member. @param row - Signed32 row. @param xf - Signed32 style ID. @returns Nothing. */
  set(row: number, xf: number): void {
    this.maRowRange.mnFirst = row | 0;
    this.maRowRange.mnLast = row | 0;
    this.mnXfId = xf | 0;
  }
  /** Original expands by exactly one adjacent row, allowing either direction only for equal XF IDs. Signed overflow remains unqualified. @param row - Signed32 row. @param xf - Signed32 style ID. @returns Whether expanded. */
  tryExpand(row: number, xf: number): boolean {
    row |= 0;
    xf |= 0;
    if (this.mnXfId === xf) {
      if (this.maRowRange.mnLast + 1 === row) {
        ++this.maRowRange.mnLast;
        return true;
      }
      if (this.maRowRange.mnFirst === row + 1) {
        --this.maRowRange.mnFirst;
        return true;
      }
    }
    return false;
  }
}
/** Original SheetDataBuffer::MergedRange value and its deliberately sheet-independent expansion predicate. */
export class MergedRange {
  readonly maRange: ScRange;
  mnHorAlign: number;
  /** Original explicit range and implicit-copy constructors. @param source - Actual range or copied value. @returns Merge candidate. */
  constructor(source: ScRange | MergedRange);
  /** Original address constructor requires its alignment token. @param source - Actual address. @param alignment - Native token. @returns Merge candidate. */
  constructor(source: ScAddress, alignment: number);
  /** Original constructor selection without inventing a default alignment for the address overload. @param source - Actual source. @param alignment - Native token. @returns Merge candidate. */
  constructor(source: ScRange | ScAddress | MergedRange, alignment?: number) {
    this.maRange =
      source instanceof MergedRange
        ? new ScRange(source.maRange)
        : source instanceof ScRange
          ? new ScRange(source)
          : new ScRange(source, source);
    this.mnHorAlign =
      source instanceof MergedRange
        ? source.mnHorAlign
        : source instanceof ScRange
          ? XML_TOKEN_INVALID
          : (alignment as number) | 0;
  }
  /** Original right-neighbor expansion checks alignment and a single row but not sheet equality. @param address - Actual neighboring cell. @param alignment - Signed32 alignment token. @returns Whether expanded. */
  tryExpand(address: ScAddress, alignment: number): boolean {
    if (
      this.mnHorAlign === (alignment | 0) &&
      this.maRange.aStart.Row() === address.Row() &&
      this.maRange.aEnd.Row() === address.Row() &&
      this.maRange.aEnd.Col() + 1 === address.Col()
    ) {
      this.maRange.aEnd.IncCol();
      return true;
    }
    return false;
  }
}
