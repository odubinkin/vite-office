/** @fileoverview Numerical ScAddress/ScRange owners from pinned sc/inc/address.hxx and sc/source/core/tool/address.cxx. No browser or Writer state enters these owners. */
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { FormulaGrammar, type AddressConvention } from "../../../../formula/inc/grammar";
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import {
  ScRefFlags,
  MAXTAB,
  SanitizeCol,
  SanitizeRow,
  applyStartToEndFlags,
} from "../../../inc/address";
import type { SCCOL, SCROW, SCTAB } from "../../../inc/types";

/** Structural view of the original ScDocument boundary used by address movement. */
export interface ScAddressDocument {
  /** Returns the document column maximum. @returns Maximum column. */
  MaxCol(): SCCOL;
  /** Returns the document row maximum. @returns Maximum row. */
  MaxRow(): SCROW;
  /** Returns the native table count, used inclusively by upstream Move. @returns Table count. */
  GetTableCount(): SCTAB;
}

/** Native address parsing convention and base coordinate value. Document-derived convention selection remains unsupported. */
export class ScAddressDetails {
  nRow: SCROW;
  nCol: SCCOL;
  /** Binds the source convention/base constructor family. @param eConv - Convention. @param rowOrAddress - Base row or address. @param col - Base column. @returns Details. */
  constructor(
    public eConv: AddressConvention,
    rowOrAddress: SCROW | ScAddress = 0,
    col: SCCOL = 0,
  ) {
    this.nRow = typeof rowOrAddress === "number" ? rowOrAddress | 0 : rowOrAddress.Row();
    this.nCol = typeof rowOrAddress === "number" ? (col << 16) >> 16 : rowOrAddress.Col();
  }
}
/** Mutable native coordinate value; API arguments are column, row, sheet. */
export class ScAddress {
  static readonly Details = ScAddressDetails;
  static readonly detailsOOOa1: Readonly<ScAddressDetails> = new ScAddressDetails(
    FormulaGrammar.AddressConvention.CONV_OOO,
  );
  /** Original local OOO A1 Format,including absolute flags and partial-valid axes. Sheet-qualified and alternate output conventions remain unported. @param flags - Native reference flags. @param doc - Optional document bounds. @param details - Output convention. @returns Owned UTF16 reference. */
  Format(
    flags: ScRefFlags,
    doc: ScAddressDocument | null = null,
    details: Readonly<ScAddressDetails> = ScAddress.detailsOOOa1,
  ): OUString {
    if (
      details.eConv !== FormulaGrammar.AddressConvention.CONV_OOO ||
      flags & (ScRefFlags.TAB_3D | ScRefFlags.FORCE_DOC)
    )
      throw new Error("Nonlocal address formatting is not implemented");
    if (flags & ScRefFlags.VALID)
      flags |= ScRefFlags.ROW_VALID | ScRefFlags.COL_VALID | ScRefFlags.TAB_VALID;
    let output = "";
    if (
      doc &&
      flags & ScRefFlags.TAB_VALID &&
      (this.Tab() < 0 || this.Tab() >= doc.GetTableCount())
    )
      output = "#REF!";
    else {
      if (flags & ScRefFlags.COL_VALID) {
        let letters = "",
          col = this.Col();
        do {
          letters = String.fromCharCode(65 + (col % 26)) + letters;
          col = Math.floor(col / 26) - 1;
        } while (col >= 0);
        output += (flags & ScRefFlags.COL_ABS ? "$" : "") + letters;
      }
      if (flags & ScRefFlags.ROW_VALID)
        output += (flags & ScRefFlags.ROW_ABS ? "$" : "") + (this.Row() + 1);
    }
    const units = new Uint16Array(output.length);
    for (let index = 0; index < output.length; ++index) units[index] = output.charCodeAt(index);
    return new OUString(units, units.length);
  }
  /** Implements the valid local A1 subset of native Parse; other conventions, sheet/external/name/error fallbacks are explicit missing APIs. @param value - Unwrapped local A1 address. @param doc - Limits owner. @param details - Convention/base. @returns Native valid/absolute flags. */
  Parse(
    value: OUStringConstReference,
    doc: ScAddressDocument,
    details: Readonly<ScAddressDetails>,
  ): ScRefFlags {
    if (
      details.eConv !== FormulaGrammar.AddressConvention.CONV_OOO &&
      details.eConv !== FormulaGrammar.AddressConvention.CONV_ODF
    )
      throw new Error("Only local A1 address parsing is implemented");
    const input = text(value);
    if (!input) return ScRefFlags.ZERO;
    const match = /^(\$?)([A-Za-z]+)(\$?)([0-9]+)$/.exec(input);
    if (!match)
      throw new Error("Sheet, external, named and invalid address fallbacks are not implemented");
    let column = 0;
    for (const c of match[2] as string) column = column * 26 + c.toUpperCase().charCodeAt(0) - 64;
    const row = Number(match[4]) - 1;
    if (column < 1 || column > doc.MaxCol() + 1 || row < 0 || row > doc.MaxRow())
      throw new Error("Out-of-bounds address/name fallback is not implemented");
    this.SetCol(column - 1);
    this.SetRow(row);
    return (ScRefFlags.VALID |
      ScRefFlags.COL_VALID |
      ScRefFlags.ROW_VALID |
      ScRefFlags.TAB_VALID |
      (match[1] ? ScRefFlags.COL_ABS : 0) |
      (match[3] ? ScRefFlags.ROW_ABS : 0)) as ScRefFlags;
  }
  public static readonly INITIALIZE_INVALID = "INITIALIZE_INVALID";
  private nRow: SCROW;
  private nCol: SCCOL;
  private nTab: SCTAB;

  /** Constructs zero, invalid, copied or explicit coordinates. @param col - Column, source or invalid tag. @param row - Row. @param tab - Sheet. @returns New address. */
  public constructor(
    col: SCCOL | ScAddress | typeof ScAddress.INITIALIZE_INVALID = 0,
    row: SCROW = 0,
    tab: SCTAB = 0,
  ) {
    if (col instanceof ScAddress) [col, row, tab] = col.GetVars();
    if (col === ScAddress.INITIALIZE_INVALID) [col, row, tab] = [-1, -1, -1];
    this.nCol = (col << 16) >> 16;
    this.nRow = row | 0;
    this.nTab = (tab << 16) >> 16;
  }
  /** Assigns coordinates with native signed widths. @param col - Column. @param row - Row. @param tab - Sheet. @returns Nothing. */
  public Set(col: SCCOL, row: SCROW, tab: SCTAB): void {
    this.SetCol(col);
    this.SetRow(row);
    this.SetTab(tab);
  }
  /** Reads row. @returns Row. */
  public Row(): SCROW {
    return this.nRow;
  }
  /** Reads column. @returns Column. */
  public Col(): SCCOL {
    return this.nCol;
  }
  /** Reads sheet. @returns Sheet. */
  public Tab(): SCTAB {
    return this.nTab;
  }
  /** Sets row. @param row - Coordinate. @returns Nothing. */
  public SetRow(row: SCROW): void {
    this.nRow = row | 0;
  }
  /** Sets column. @param col - Coordinate. @returns Nothing. */
  public SetCol(col: SCCOL): void {
    this.nCol = (col << 16) >> 16;
  }
  /** Sets sheet. @param tab - Coordinate. @returns Nothing. */
  public SetTab(tab: SCTAB): void {
    this.nTab = (tab << 16) >> 16;
  }
  /** Resets all coordinates to the invalid sentinel. @returns Nothing. */
  public SetInvalid(): void {
    this.Set(-1, -1, -1);
  }
  /** Tests native nonnegative validity, without document bounds. @returns Validity. */
  public IsValid(): boolean {
    return this.nRow >= 0 && this.nCol >= 0 && this.nTab >= 0;
  }
  /** Orders each axis independently between both mutable owners. @param other - Opposite endpoint. @returns Nothing. */
  public PutInOrder(other: ScAddress): void {
    if (other.nCol < this.nCol) [this.nCol, other.nCol] = [other.nCol, this.nCol];
    if (other.nRow < this.nRow) [this.nRow, other.nRow] = [other.nRow, this.nRow];
    if (other.nTab < this.nTab) [this.nTab, other.nTab] = [other.nTab, this.nTab];
  }
  /** Increments row with native narrowing. @param delta - Displacement, one by default. @returns Nothing. */
  public IncRow(delta: SCROW = 1): void {
    this.SetRow(this.nRow + delta);
  }
  /** Increments column with native narrowing. @param delta - Displacement, one by default. @returns Nothing. */
  public IncCol(delta: SCCOL = 1): void {
    this.SetCol(this.nCol + delta);
  }
  /** Increments sheet with native narrowing. @param delta - Displacement, one by default. @returns Nothing. */
  public IncTab(delta: SCTAB = 1): void {
    this.SetTab(this.nTab + delta);
  }
  /** Projects native output reference parameters into a fresh tuple. @returns Column, row, sheet. */
  public GetVars(): [SCCOL, SCROW, SCTAB] {
    return [this.nCol, this.nRow, this.nTab];
  }
  /** Implements native value assignment without replacing the recipient. @param other - Source address. @returns Recipient. */
  public assign(other: ScAddress): this {
    this.Set(...other.GetVars());
    return this;
  }
  /** Compares all native coordinates. @param other - Address. @returns Equality. */
  public equals(other: ScAddress): boolean {
    return this.nRow === other.nRow && this.nCol === other.nCol && this.nTab === other.nTab;
  }
  /** Implements tab, column, row ordering. @param other - Address. @returns Signed order. */
  public compare(other: ScAddress): number {
    return this.nTab - other.nTab || this.nCol - other.nCol || this.nRow - other.nRow;
  }
  /** Implements native row-major ordering for import/export. @param other - Address. @returns Whether earlier. */
  public lessThanByRow(other: ScAddress): boolean {
    return (this.nTab - other.nTab || this.nRow - other.nRow || this.nCol - other.nCol) < 0;
  }
  /** Moves, clamps and preserves original out-of-bounds error coordinates. @param dx - Column delta. @param dy - Row delta. @param dz - Sheet delta. @param error - Error output owner. @param doc - Native document bounds. @returns Whether the movement stayed within bounds. */
  public Move(dx: SCCOL, dy: SCROW, dz: SCTAB, error: ScAddress, doc: ScAddressDocument): boolean {
    dx = ((this.nCol + dx) << 16) >> 16;
    dy = (this.nRow + dy) | 0;
    dz = ((this.nTab + dz) << 16) >> 16;
    const maxTab = doc.GetTableCount();
    const maxCol = doc.MaxCol();
    const maxRow = doc.MaxRow();
    error.Set(dx, dy, dz);
    if (dz > maxTab) error.SetTab(MAXTAB + 1);
    this.Set(
      SanitizeCol(dx, maxCol),
      SanitizeRow(dy, maxRow),
      dz < 0 ? 0 : dz > maxTab ? maxTab : dz,
    );
    return dx >= 0 && dx <= maxCol && dy >= 0 && dy <= maxRow && dz >= 0 && dz <= maxTab;
  }
}

/** Native value range with independently owned endpoints and inclusive bounds. */
export class ScRange {
  /** Original OOO/ODF local A1 cell/entire-axis range parse,including ordered endpoint flags and entire-axis sticky bits. Mixed partial-axis,named,external and sheet-qualified families require their native parser services. @param value - Source range. @param doc - Document. @param details - Convention. @returns Native parse flags. */
  Parse(
    value: OUStringConstReference,
    doc: ScAddressDocument,
    details: Readonly<ScAddressDetails>,
  ): ScRefFlags {
    if (
      details.eConv !== FormulaGrammar.AddressConvention.CONV_OOO &&
      details.eConv !== FormulaGrammar.AddressConvention.CONV_ODF
    )
      throw new Error("Range parsing convention is not implemented");
    const input = text(value),
      colon = input.indexOf(":");
    if (colon < 0) return ScRefFlags.ZERO;
    const columns = /^(\$?)([A-Za-z]+):(\$?)([A-Za-z]+)$/.exec(input),
      rows = /^(\$?)([1-9][0-9]*):(\$?)([1-9][0-9]*)$/.exec(input);
    const first = unicode(
      columns
        ? (columns[1] as string) + (columns[2] as string) + "1"
        : rows
          ? "A" + rows[1] + rows[2]
          : input.slice(0, colon),
    );
    const second = unicode(
      columns
        ? (columns[3] as string) + (columns[4] as string) + "1"
        : rows
          ? "A" + rows[3] + rows[4]
          : input.slice(colon + 1),
    );
    let flags1: ScRefFlags, flags2: ScRefFlags;
    try {
      flags1 = this.aStart.Parse(first, doc, details);
      if (!(flags1 & ScRefFlags.VALID)) return ScRefFlags.ZERO;
      this.aEnd.assign(this.aStart);
      flags2 = this.aEnd.Parse(second, doc, details);
    } finally {
      first.dispose();
      second.dispose();
    }
    if (columns) {
      this.aStart.SetRow(0);
      this.aEnd.SetRow(doc.MaxRow());
      flags1 |= ScRefFlags.ROW_ABS;
      flags2 |= ScRefFlags.ROW_ABS;
    } else if (rows) {
      this.aStart.SetCol(0);
      this.aEnd.SetCol(doc.MaxCol());
      flags1 |= ScRefFlags.COL_ABS;
      flags2 |= ScRefFlags.COL_ABS;
    }
    if (!(flags2 & ScRefFlags.VALID)) return ScRefFlags.ZERO;
    if (
      this.aStart.Row() === 0 &&
      this.aEnd.Row() === doc.MaxRow() &&
      !(flags1 & ScRefFlags.ROW_ABS) &&
      !(flags2 & ScRefFlags.ROW_ABS)
    ) {
      flags1 |= ScRefFlags.ROW_ABS;
      flags2 |= ScRefFlags.ROW_ABS;
    } else if (
      this.aStart.Col() === 0 &&
      this.aEnd.Col() === doc.MaxCol() &&
      !(flags1 & ScRefFlags.COL_ABS) &&
      !(flags2 & ScRefFlags.COL_ABS)
    ) {
      flags1 |= ScRefFlags.COL_ABS;
      flags2 |= ScRefFlags.COL_ABS;
    }
    if (this.aEnd.Col() < this.aStart.Col()) {
      const start = this.aStart.Col();
      this.aStart.SetCol(this.aEnd.Col());
      this.aEnd.SetCol(start);
      const mask = ScRefFlags.COL_VALID | ScRefFlags.COL_ABS,
        bits1 = flags1 & mask,
        bits2 = flags2 & mask;
      flags1 = (flags1 & ~mask) | bits2;
      flags2 = (flags2 & ~mask) | bits1;
    }
    if (this.aEnd.Row() < this.aStart.Row()) {
      const start = this.aStart.Row();
      this.aStart.SetRow(this.aEnd.Row());
      this.aEnd.SetRow(start);
      const mask = ScRefFlags.ROW_VALID | ScRefFlags.ROW_ABS,
        bits1 = flags1 & mask,
        bits2 = flags2 & mask;
      flags1 = (flags1 & ~mask) | bits2;
      flags2 = (flags2 & ~mask) | bits1;
    }
    return applyStartToEndFlags(flags1, flags2 & ScRefFlags.BITS) | (flags2 & ScRefFlags.VALID);
  }
  public readonly aStart: ScAddress;
  public readonly aEnd: ScAddress;

  /** Original OOO range Format uses endpoint flags and retains full-axis endpoint notation. @param doc - Document. @param flags - Native flags. @param details - Convention. @returns Owned UTF16 reference. */
  Format(
    doc: ScAddressDocument,
    flags: ScRefFlags,
    details: Readonly<ScAddressDetails> = ScAddress.detailsOOOa1,
  ): OUString {
    if (!(flags & ScRefFlags.VALID)) return new OUString(new Uint16Array([35, 82, 69, 70, 33]), 5);
    if (this.aStart.Tab() !== this.aEnd.Tab()) flags |= ScRefFlags.TAB_3D;
    const first = this.aStart.Format(flags, doc, details);
    if (
      this.aStart.equals(this.aEnd) &&
      Boolean(flags & ScRefFlags.COL_ABS) === Boolean(flags & ScRefFlags.COL2_ABS) &&
      Boolean(flags & ScRefFlags.ROW_ABS) === Boolean(flags & ScRefFlags.ROW2_ABS)
    )
      return first;
    const second = this.aEnd.Format(
        (ScRefFlags.VALID | ((flags >> 4) & ScRefFlags.BITS)) as ScRefFlags,
        null,
        details,
      ),
      units = new Uint16Array(first.getLength() + 1 + second.getLength());
    units.set(first.getStr().subarray(0, first.getLength()));
    units[first.getLength()] = 58;
    units.set(second.getStr().subarray(0, second.getLength()), first.getLength() + 1);
    first.dispose();
    second.dispose();
    return new OUString(units, units.length);
  }
  /** Preserves the native overloads and constructor-specific ordering. @param args - Zero, invalid, copy, address pair, numeric singleton or numeric endpoints. @returns New range. */
  public constructor(
    ...args:
      | []
      | [typeof ScAddress.INITIALIZE_INVALID]
      | [ScRange]
      | [ScAddress, ScAddress?]
      | [SCCOL, SCROW, SCTAB]
      | [SCCOL, SCROW, SCTAB, SCCOL, SCROW, SCTAB]
  ) {
    const [start = 0, row = 0, tab = 0, endCol, endRow, endTab] = args;
    if (start instanceof ScRange) {
      this.aStart = new ScAddress(start.aStart);
      this.aEnd = new ScAddress(start.aEnd);
    } else if (start instanceof ScAddress) {
      this.aStart = new ScAddress(start);
      this.aEnd = new ScAddress(row instanceof ScAddress ? row : start);
      this.PutInOrder();
    } else {
      this.aStart = new ScAddress(start, row as SCROW, tab);
      this.aEnd =
        endCol === undefined ? new ScAddress(this.aStart) : new ScAddress(endCol, endRow, endTab);
    }
  }
  /** Assigns a range or single address into existing endpoint owners. @param source - Source. @returns Recipient. */
  public assign(source: ScRange | ScAddress): this {
    this.aStart.assign(source instanceof ScRange ? source.aStart : source);
    this.aEnd.assign(source instanceof ScRange ? source.aEnd : source);
    return this;
  }
  /** Invalidates both endpoints. @returns Nothing. */
  public SetInvalid(): void {
    this.aStart.SetInvalid();
    this.aEnd.SetInvalid();
  }
  /** Sets both sheets. @param tab - Sheet. @returns Nothing. */
  public SetTab(tab: SCTAB): void {
    this.aStart.SetTab(tab);
    this.aEnd.SetTab(tab);
  }
  /** Tests endpoint nonnegative validity. @returns Validity. */
  public IsValid(): boolean {
    return this.aStart.IsValid() && this.aEnd.IsValid();
  }
  /** Orders each axis independently. @returns Nothing. */
  public PutInOrder(): void {
    this.aStart.PutInOrder(this.aEnd);
  }
  /** Reads native six output coordinates. @returns Fresh coordinate tuple. */
  public GetVars(): [SCCOL, SCROW, SCTAB, SCCOL, SCROW, SCTAB] {
    return [...this.aStart.GetVars(), ...this.aEnd.GetVars()];
  }
  /** Compares complete endpoints. @param other - Range. @returns Equality. */
  public equals(other: ScRange): boolean {
    return this.aStart.equals(other.aStart) && this.aEnd.equals(other.aEnd);
  }
  /** Orders start then end by native address order. @param other - Range. @returns Signed order. */
  public compare(other: ScRange): number {
    return this.aStart.compare(other.aStart) || this.aEnd.compare(other.aEnd);
  }
  /** Tests inclusive address or range containment. @param value - Address or range. @returns Whether contained. */
  public Contains(value: ScAddress | ScRange): boolean {
    const start = value instanceof ScRange ? value.aStart : value;
    const end = value instanceof ScRange ? value.aEnd : value;
    return (
      this.aStart.Col() <= start.Col() &&
      end.Col() <= this.aEnd.Col() &&
      this.aStart.Row() <= start.Row() &&
      end.Row() <= this.aEnd.Row() &&
      this.aStart.Tab() <= start.Tab() &&
      end.Tab() <= this.aEnd.Tab()
    );
  }
  /** Tests inclusive three-dimensional overlap. @param other - Range. @returns Whether intersecting. */
  public Intersects(other: ScRange): boolean {
    return (
      this.aStart.Col() <= other.aEnd.Col() &&
      other.aStart.Col() <= this.aEnd.Col() &&
      this.aStart.Row() <= other.aEnd.Row() &&
      other.aStart.Row() <= this.aEnd.Row() &&
      this.aStart.Tab() <= other.aEnd.Tab() &&
      other.aStart.Tab() <= this.aEnd.Tab()
    );
  }
  /** Returns the intersection or original invalid sentinel. @param other - Range. @returns Independent range. */
  public Intersection(other: ScRange): ScRange {
    const col = Math.max(this.aStart.Col(), other.aStart.Col());
    const endCol = Math.min(this.aEnd.Col(), other.aEnd.Col());
    const row = Math.max(this.aStart.Row(), other.aStart.Row());
    const endRow = Math.min(this.aEnd.Row(), other.aEnd.Row());
    const tab = Math.max(this.aStart.Tab(), other.aStart.Tab());
    const endTab = Math.min(this.aEnd.Tab(), other.aEnd.Tab());
    return col > endCol || row > endRow || tab > endTab
      ? new ScRange(ScAddress.INITIALIZE_INVALID)
      : new ScRange(col, row, tab, endCol, endRow, endTab);
  }
  /** Extends each axis or initializes an invalid recipient from the source. @param other - Source range. @returns Nothing. */
  public ExtendTo(other: ScRange): void {
    if (!this.IsValid()) {
      this.assign(other);
      return;
    }
    this.aStart.Set(
      Math.min(this.aStart.Col(), other.aStart.Col()),
      Math.min(this.aStart.Row(), other.aStart.Row()),
      Math.min(this.aStart.Tab(), other.aStart.Tab()),
    );
    this.aEnd.Set(
      Math.max(this.aEnd.Col(), other.aEnd.Col()),
      Math.max(this.aEnd.Row(), other.aEnd.Row()),
      Math.max(this.aEnd.Tab(), other.aEnd.Tab()),
    );
  }
  /** Moves both endpoints even after failure; entire-axis ranges retain that axis. @param dx - Column delta. @param dy - Row delta. @param dz - Sheet delta. @param error - Error range. @param doc - Document bounds. @returns Both endpoint movements valid. */
  public Move(dx: SCCOL, dy: SCROW, dz: SCTAB, error: ScRange, doc: ScAddressDocument): boolean {
    if (dy && this.aStart.Row() === 0 && this.aEnd.Row() === doc.MaxRow()) dy = 0;
    if (dx && this.aStart.Col() === 0 && this.aEnd.Col() === doc.MaxCol()) dx = 0;
    const startValid = this.aStart.Move(dx, dy, dz, error.aStart, doc);
    const endValid = this.aEnd.Move(dx, dy, dz, error.aEnd, doc);
    return startValid && endValid;
  }

  /** Moves while preserving existing or newly reached maximum end anchors. @param doc - Native document bounds. @param dx - Column delta. @param dy - Row delta. @param dz - Sheet delta. @param error - Error range. @returns Whether movement is valid after native sticky correction. */
  public MoveSticky(
    doc: ScAddressDocument,
    dx: SCCOL,
    dy: SCROW,
    dz: SCTAB,
    error: ScRange,
  ): boolean {
    const maxCol = doc.MaxCol(),
      maxRow = doc.MaxRow();
    let colRange = this.aStart.Col() < this.aEnd.Col();
    let rowRange = this.aStart.Row() < this.aEnd.Row();
    if (dy && this.aStart.Row() === 0 && this.aEnd.Row() === maxRow) dy = 0;
    if (dx && this.aStart.Col() === 0 && this.aEnd.Col() === maxCol) dx = 0;
    const startValid = this.aStart.Move(dx, dy, dz, error.aStart, doc);
    if (dx && colRange && this.aEnd.Col() === maxCol) dx = 0;
    if (dy && rowRange && this.aEnd.Row() === maxRow) dy = 0;
    const oldTab = this.aEnd.Tab();
    let endValid = this.aEnd.Move(dx, dy, dz, error.aEnd, doc);
    if (!endValid) {
      colRange = !dx || (colRange && this.aEnd.Col() === maxCol);
      if (dx && colRange) error.aEnd.SetCol(maxCol);
      rowRange = !dy || (rowRange && this.aEnd.Row() === maxRow);
      if (dy && rowRange) error.aEnd.SetRow(maxRow);
      endValid = colRange && rowRange && this.aEnd.Tab() - oldTab === dz;
    }
    return startValid && endValid;
  }

  /** Adjusts columns strictly after the insertion/deletion boundary with native overlap limiting. @param doc - Document bounds. @param startCol - Boundary column. @param delta - Column displacement. @returns Nothing. */
  public IncColIfNotLessThan(doc: ScAddressDocument, startCol: SCCOL, delta: SCCOL): void {
    if (this.aStart.Col() > startCol) {
      let offset = delta;
      if (startCol + delta > this.aStart.Col()) offset = this.aStart.Col() - startCol;
      else if (startCol - delta > this.aStart.Col()) offset = -(this.aStart.Col() - startCol);
      this.aStart.IncCol(offset);
      if (this.aStart.Col() < 0) this.aStart.SetCol(0);
      else if (this.aStart.Col() > doc.MaxCol()) this.aStart.SetCol(doc.MaxCol());
    }
    if (this.aEnd.Col() > startCol) {
      let offset = delta;
      if (startCol + delta > this.aEnd.Col()) offset = this.aEnd.Col() - startCol;
      else if (startCol - delta > this.aEnd.Col()) offset = -(this.aEnd.Col() - startCol);
      this.aEnd.IncCol(offset);
      if (this.aEnd.Col() < 0) this.aEnd.SetCol(0);
      else if (this.aEnd.Col() > doc.MaxCol()) this.aEnd.SetCol(doc.MaxCol());
    }
  }

  /** Adjusts rows strictly after the insertion/deletion boundary with native overlap limiting. @param doc - Document bounds. @param startRow - Boundary row. @param delta - Row displacement. @returns Nothing. */
  public IncRowIfNotLessThan(doc: ScAddressDocument, startRow: SCROW, delta: SCROW): void {
    if (this.aStart.Row() > startRow) {
      let offset = delta;
      if (startRow + delta > this.aStart.Row()) offset = this.aStart.Row() - startRow;
      else if (startRow - delta > this.aStart.Row()) offset = -(this.aStart.Row() - startRow);
      this.aStart.IncRow(offset);
      if (this.aStart.Row() < 0) this.aStart.SetRow(0);
      else if (this.aStart.Row() > doc.MaxRow()) this.aStart.SetRow(doc.MaxRow());
    }
    if (this.aEnd.Row() > startRow) {
      let offset = delta;
      if (startRow + delta > this.aEnd.Row()) offset = this.aEnd.Row() - startRow;
      else if (startRow - delta > this.aEnd.Row()) offset = -(this.aEnd.Row() - startRow);
      this.aEnd.IncRow(offset);
      if (this.aEnd.Row() < 0) this.aEnd.SetRow(0);
      else if (this.aEnd.Row() > doc.MaxRow()) this.aEnd.SetRow(doc.MaxRow());
    }
  }

  /** Tests a true multi-column range ending at the maximum. @param doc - Document bounds. @returns Whether sticky. */
  public IsEndColSticky(doc: ScAddressDocument): boolean {
    return this.aEnd.Col() === doc.MaxCol() && this.aStart.Col() < this.aEnd.Col();
  }
  /** Tests a true multi-row range ending at the maximum. @param doc - Document bounds. @returns Whether sticky. */
  public IsEndRowSticky(doc: ScAddressDocument): boolean {
    return this.aEnd.Row() === doc.MaxRow() && this.aStart.Row() < this.aEnd.Row();
  }

  /** Increments a column endpoint until sticky, narrowing before limiting. @param doc - Document bounds. @param delta - Displacement. @returns Nothing. */
  public IncEndColSticky(doc: ScAddressDocument, delta: SCCOL): void {
    const col = this.aEnd.Col();
    if (this.aStart.Col() >= col) {
      this.aEnd.IncCol(delta);
      return;
    }
    const maxCol = doc.MaxCol();
    if (col === maxCol) return;
    if (col < maxCol) this.aEnd.SetCol(Math.min(((col + delta) << 16) >> 16, maxCol));
    else this.aEnd.IncCol(delta);
  }
  /** Increments a row endpoint until sticky, narrowing before limiting. @param doc - Document bounds. @param delta - Displacement. @returns Nothing. */
  public IncEndRowSticky(doc: ScAddressDocument, delta: SCROW): void {
    const row = this.aEnd.Row();
    if (this.aStart.Row() >= row) {
      this.aEnd.IncRow(delta);
      return;
    }
    const maxRow = doc.MaxRow();
    if (row === maxRow) return;
    if (row < maxRow) this.aEnd.SetRow(Math.min((row + delta) | 0, maxRow));
    else this.aEnd.IncRow(delta);
  }
}
