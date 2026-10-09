/** @fileoverview Initialized ScSingleRefData contracts from pinned refdata.hxx/refdata.cxx; token-union storage and full document/compiler ownership remain separate. */
import { MAXTAB, ScAddress, ValidTab } from "../../../inc/address";
import type { ScRefAddress } from "../../../inc/address";
import { ScSheetLimits } from "../../../inc/sheetlimits";
import type { SCCOL, SCROW, SCTAB } from "../../../inc/types";
import type { ScAddressDocument } from "./address";

/** Structural view of the original ScDocument getters used by reference data. */
export interface ScReferenceDocument extends ScAddressDocument {
  /** Returns the document-independent limits owner. @returns Sheet limits. */
  GetSheetLimits(): ScSheetLimits;
}

/** Raw coordinate value and original eight-bit flags; callers must initialize before use. */
export class ScSingleRefData {
  declare private mnCol: SCCOL;
  declare private mnRow: SCROW;
  declare private mnTab: SCTAB;
  declare private mnFlagValue: number;

  /** Represents native trivial storage or implicit copy, without zero initialization. @param source - Initialized source, if copying. @returns New reference storage. */
  public constructor(source?: ScSingleRefData) {
    if (source) this.assign(source);
  }
  /** Copies raw coordinates and flags, including deleted values. @param source - Initialized source. @returns Recipient. */
  public assign(source: ScSingleRefData): this {
    this.mnCol = source.mnCol;
    this.mnRow = source.mnRow;
    this.mnTab = source.mnTab;
    this.mnFlagValue = source.mnFlagValue;
    return this;
  }
  /** Clears only flags, leaving coordinates untouched. @returns Nothing. */
  public InitFlags(): void {
    this.mnFlagValue = 0;
  }
  /** Initializes flags and raw coordinates through the original overloads. @param args - Address or column/row/sheet. @returns Nothing. */
  public InitAddress(...args: [ScAddress] | [SCCOL, SCROW, SCTAB]): void {
    const [col, row, tab] =
      args[0] instanceof ScAddress ? args[0].GetVars() : (args as [SCCOL, SCROW, SCTAB]);
    this.InitFlags();
    this.mnCol = (col << 16) >> 16;
    this.mnRow = row | 0;
    this.mnTab = (tab << 16) >> 16;
  }
  /** Initializes every coordinate relative to the supplied position. @param doc - Native document getter view. @param address - Absolute address. @param position - Formula position. @returns Nothing. */
  public InitAddressRel(doc: ScReferenceDocument, address: ScAddress, position: ScAddress): void {
    this.InitFlags();
    this.SetColRel(true);
    this.SetRowRel(true);
    this.SetTabRel(true);
    this.SetAddress(doc.GetSheetLimits(), address, position);
  }
  /** Initializes the original independent flags and sheet-derived 3D marker. @param doc - Document. @param ref - Address and relative flags. @param position - Formula position. @returns Nothing. */
  public InitFromRefAddress(
    doc: ScReferenceDocument,
    ref: ScRefAddress,
    position: ScAddress,
  ): void {
    this.InitFlags();
    this.SetColRel(ref.IsRelCol());
    this.SetRowRel(ref.IsRelRow());
    this.SetTabRel(ref.IsRelTab());
    this.SetFlag3D(ref.Tab() !== position.Tab());
    this.SetAddress(doc.GetSheetLimits(), ref.GetAddress(), position);
  }
  /** Reads the native eight-bit union value. @returns Flags. */
  public FlagValue(): number {
    return this.mnFlagValue;
  }
  /** Sets only column relativity. @param value - Flag. @returns Nothing. */
  public SetColRel(value: boolean): void {
    this.mnFlagValue = value ? this.mnFlagValue | 1 : this.mnFlagValue & ~1;
  }
  /** Reads column relativity. @returns Flag. */
  public IsColRel(): boolean {
    return (this.mnFlagValue & 1) !== 0;
  }
  /** Sets only row relativity. @param value - Flag. @returns Nothing. */
  public SetRowRel(value: boolean): void {
    this.mnFlagValue = value ? this.mnFlagValue | 4 : this.mnFlagValue & ~4;
  }
  /** Reads row relativity. @returns Flag. */
  public IsRowRel(): boolean {
    return (this.mnFlagValue & 4) !== 0;
  }
  /** Sets only sheet relativity. @param value - Flag. @returns Nothing. */
  public SetTabRel(value: boolean): void {
    this.mnFlagValue = value ? this.mnFlagValue | 16 : this.mnFlagValue & ~16;
  }
  /** Reads sheet relativity. @returns Flag. */
  public IsTabRel(): boolean {
    return (this.mnFlagValue & 16) !== 0;
  }
  /** Writes absolute column without clearing deletion. @param value - Coordinate. @returns Nothing. */
  public SetAbsCol(value: SCCOL): void {
    this.SetColRel(false);
    this.mnCol = (value << 16) >> 16;
  }
  /** Writes relative column without clearing deletion. @param value - Offset. @returns Nothing. */
  public SetRelCol(value: SCCOL): void {
    this.SetColRel(true);
    this.mnCol = (value << 16) >> 16;
  }
  /** Increments raw column without changing flags. @param delta - Displacement. @returns Nothing. */
  public IncCol(delta: SCCOL): void {
    this.mnCol = ((this.mnCol + delta) << 16) >> 16;
  }
  /** Writes absolute row without clearing deletion. @param value - Coordinate. @returns Nothing. */
  public SetAbsRow(value: SCROW): void {
    this.SetRowRel(false);
    this.mnRow = value | 0;
  }
  /** Writes relative row without clearing deletion. @param value - Offset. @returns Nothing. */
  public SetRelRow(value: SCROW): void {
    this.SetRowRel(true);
    this.mnRow = value | 0;
  }
  /** Increments raw row without changing flags. @param delta - Displacement. @returns Nothing. */
  public IncRow(delta: SCROW): void {
    this.mnRow = (this.mnRow + delta) | 0;
  }
  /** Writes absolute sheet without clearing deletion. @param value - Coordinate. @returns Nothing. */
  public SetAbsTab(value: SCTAB): void {
    this.SetTabRel(false);
    this.mnTab = (value << 16) >> 16;
  }
  /** Writes relative sheet without clearing deletion. @param value - Offset. @returns Nothing. */
  public SetRelTab(value: SCTAB): void {
    this.SetTabRel(true);
    this.mnTab = (value << 16) >> 16;
  }
  /** Increments raw sheet without changing flags. @param delta - Displacement. @returns Nothing. */
  public IncTab(delta: SCTAB): void {
    this.mnTab = ((this.mnTab + delta) << 16) >> 16;
  }
  /** Sets only column deletion. @param value - Flag. @returns Nothing. */
  public SetColDeleted(value: boolean): void {
    this.mnFlagValue = value ? this.mnFlagValue | 2 : this.mnFlagValue & ~2;
  }
  /** Reads column deletion. @returns Flag. */
  public IsColDeleted(): boolean {
    return (this.mnFlagValue & 2) !== 0;
  }
  /** Sets only row deletion. @param value - Flag. @returns Nothing. */
  public SetRowDeleted(value: boolean): void {
    this.mnFlagValue = value ? this.mnFlagValue | 8 : this.mnFlagValue & ~8;
  }
  /** Reads row deletion. @returns Flag. */
  public IsRowDeleted(): boolean {
    return (this.mnFlagValue & 8) !== 0;
  }
  /** Sets only sheet deletion. @param value - Flag. @returns Nothing. */
  public SetTabDeleted(value: boolean): void {
    this.mnFlagValue = value ? this.mnFlagValue | 32 : this.mnFlagValue & ~32;
  }
  /** Reads sheet deletion. @returns Flag. */
  public IsTabDeleted(): boolean {
    return (this.mnFlagValue & 32) !== 0;
  }
  /** Tests whether any coordinate is deleted. @returns Whether deleted. */
  public IsDeleted(): boolean {
    return this.IsColDeleted() || this.IsRowDeleted() || this.IsTabDeleted();
  }
  /** Sets only the 3D marker. @param value - Flag. @returns Nothing. */
  public SetFlag3D(value: boolean): void {
    this.mnFlagValue = value ? this.mnFlagValue | 64 : this.mnFlagValue & ~64;
  }
  /** Reads the 3D marker. @returns Flag. */
  public IsFlag3D(): boolean {
    return (this.mnFlagValue & 64) !== 0;
  }
  /** Sets only the relative-name marker. @param value - Flag. @returns Nothing. */
  public SetRelName(value: boolean): void {
    this.mnFlagValue = value ? this.mnFlagValue | 128 : this.mnFlagValue & ~128;
  }
  /** Reads the relative-name marker. @returns Flag. */
  public IsRelName(): boolean {
    return (this.mnFlagValue & 128) !== 0;
  }
  /** Checks deletion and all native coordinate domains. @param doc - Document. @returns Validity. */
  public Valid(doc: ScReferenceDocument): boolean {
    return !this.IsDeleted() && this.ColValid(doc) && this.RowValid(doc) && this.TabValid(doc);
  }
  /** Checks raw column with the native relative or absolute domain. @param doc - Document. @returns Validity. */
  public ColValid(doc: ScReferenceDocument): boolean {
    if (this.IsColRel()) {
      if (this.mnCol < -doc.MaxCol() || doc.MaxCol() < this.mnCol) return false;
    } else if (this.mnCol < 0 || doc.MaxCol() < this.mnCol) return false;
    return true;
  }
  /** Checks raw row with the native relative or absolute domain. @param doc - Document. @returns Validity. */
  public RowValid(doc: ScReferenceDocument): boolean {
    if (this.IsRowRel()) {
      if (this.mnRow < -doc.MaxRow() || doc.MaxRow() < this.mnRow) return false;
    } else if (this.mnRow < 0 || doc.MaxRow() < this.mnRow) return false;
    return true;
  }
  /** Checks relative sheets globally, absolute sheets against an exclusive table count. @param doc - Document. @returns Validity. */
  public TabValid(doc: ScReferenceDocument): boolean {
    if (this.IsTabRel()) {
      if (this.mnTab < -MAXTAB || MAXTAB < this.mnTab) return false;
    } else if (this.mnTab < 0 || doc.GetTableCount() <= this.mnTab) return false;
    return true;
  }
  /** Preserves native external validation, ignoring deletion and relative sheet flags. @param doc - Document. @returns Validity. */
  public ValidExternal(doc: ScReferenceDocument): boolean {
    return this.ColValid(doc) && this.RowValid(doc) && this.mnTab >= -1;
  }
  /** Resolves raw coordinates independently, ignoring deletion flags. @param bounds - Limits or document. @param position - Formula position. @returns Address with invalid sentinels for failed axes. */
  public toAbs(bounds: ScSheetLimits | ScReferenceDocument, position: ScAddress): ScAddress {
    const limits = bounds instanceof ScSheetLimits ? bounds : bounds.GetSheetLimits();
    const col = ((this.IsColRel() ? this.mnCol + position.Col() : this.mnCol) << 16) >> 16;
    const row = (this.IsRowRel() ? this.mnRow + position.Row() : this.mnRow) | 0;
    const tab = ((this.IsTabRel() ? this.mnTab + position.Tab() : this.mnTab) << 16) >> 16;
    const absolute = new ScAddress(ScAddress.INITIALIZE_INVALID);
    if (limits.ValidCol(col)) absolute.SetCol(col);
    if (limits.ValidRow(row)) absolute.SetRow(row);
    if (ValidTab(tab)) absolute.SetTab(tab);
    return absolute;
  }
  /** Updates raw offsets, only adding invalid-axis deletion flags. @param limits - Sheet limits. @param address - Absolute address. @param position - Formula position. @returns Nothing. */
  public SetAddress(limits: ScSheetLimits, address: ScAddress, position: ScAddress): void {
    this.mnCol = ((this.IsColRel() ? address.Col() - position.Col() : address.Col()) << 16) >> 16;
    if (!limits.ValidCol(address.Col())) this.SetColDeleted(true);
    this.mnRow = (this.IsRowRel() ? address.Row() - position.Row() : address.Row()) | 0;
    if (!limits.ValidRow(address.Row())) this.SetRowDeleted(true);
    this.mnTab = ((this.IsTabRel() ? address.Tab() - position.Tab() : address.Tab()) << 16) >> 16;
    if (!ValidTab(address.Tab(), MAXTAB)) this.SetTabDeleted(true);
  }
  /** Reads row or its deleted sentinel. @returns Visible raw row. */
  public Row(): SCROW {
    return this.IsRowDeleted() ? -1 : this.mnRow;
  }
  /** Reads column or its deleted sentinel. @returns Visible raw column. */
  public Col(): SCCOL {
    return this.IsColDeleted() ? -1 : this.mnCol;
  }
  /** Reads sheet or its deleted sentinel. @returns Visible raw sheet. */
  public Tab(): SCTAB {
    return this.IsTabDeleted() ? -1 : this.mnTab;
  }
  /** Orders absolute axis values while transferring only original axis flags and relative-name provenance. @param first - First endpoint. @param second - Second endpoint. @param position - Formula position. @returns Nothing. */
  public static PutInOrder(
    first: ScSingleRefData,
    second: ScSingleRefData,
    position: ScAddress,
  ): void {
    const COL = 1,
      ROW = 2,
      TAB = 4;
    let relState1 = first.IsRelName()
      ? (first.IsTabRel() ? TAB : 0) | (first.IsRowRel() ? ROW : 0) | (first.IsColRel() ? COL : 0)
      : 0;
    let relState2 = second.IsRelName()
      ? (second.IsTabRel() ? TAB : 0) |
        (second.IsRowRel() ? ROW : 0) |
        (second.IsColRel() ? COL : 0)
      : 0;
    const col1 = ((first.IsColRel() ? position.Col() + first.mnCol : first.mnCol) << 16) >> 16;
    const col2 = ((second.IsColRel() ? position.Col() + second.mnCol : second.mnCol) << 16) >> 16;
    if (col2 < col1) {
      first.mnCol = ((second.IsColRel() ? col2 - position.Col() : col2) << 16) >> 16;
      second.mnCol = ((first.IsColRel() ? col1 - position.Col() : col1) << 16) >> 16;
      if (first.IsRelName() && first.IsColRel()) relState2 |= COL;
      else relState2 &= ~COL;
      if (second.IsRelName() && second.IsColRel()) relState1 |= COL;
      else relState1 &= ~COL;
      const relative = first.IsColRel(),
        deleted = first.IsColDeleted();
      first.SetColRel(second.IsColRel());
      second.SetColRel(relative);
      first.SetColDeleted(second.IsColDeleted());
      second.SetColDeleted(deleted);
    }
    const row1 = (first.IsRowRel() ? position.Row() + first.mnRow : first.mnRow) | 0;
    const row2 = (second.IsRowRel() ? position.Row() + second.mnRow : second.mnRow) | 0;
    if (row2 < row1) {
      first.mnRow = (second.IsRowRel() ? row2 - position.Row() : row2) | 0;
      second.mnRow = (first.IsRowRel() ? row1 - position.Row() : row1) | 0;
      if (first.IsRelName() && first.IsRowRel()) relState2 |= ROW;
      else relState2 &= ~ROW;
      if (second.IsRelName() && second.IsRowRel()) relState1 |= ROW;
      else relState1 &= ~ROW;
      const relative = first.IsRowRel(),
        deleted = first.IsRowDeleted();
      first.SetRowRel(second.IsRowRel());
      second.SetRowRel(relative);
      first.SetRowDeleted(second.IsRowDeleted());
      second.SetRowDeleted(deleted);
    }
    const tab1 = ((first.IsTabRel() ? position.Tab() + first.mnTab : first.mnTab) << 16) >> 16;
    const tab2 = ((second.IsTabRel() ? position.Tab() + second.mnTab : second.mnTab) << 16) >> 16;
    if (tab2 < tab1) {
      first.mnTab = ((second.IsTabRel() ? tab2 - position.Tab() : tab2) << 16) >> 16;
      second.mnTab = ((first.IsTabRel() ? tab1 - position.Tab() : tab1) << 16) >> 16;
      if (first.IsRelName() && first.IsTabRel()) relState2 |= TAB;
      else relState2 &= ~TAB;
      if (second.IsRelName() && second.IsTabRel()) relState1 |= TAB;
      else relState1 &= ~TAB;
      const relative = first.IsTabRel(),
        deleted = first.IsTabDeleted();
      first.SetTabRel(second.IsTabRel());
      second.SetTabRel(relative);
      first.SetTabDeleted(second.IsTabDeleted());
      second.SetTabDeleted(deleted);
    }
    first.SetRelName(relState1 !== 0);
    second.SetRelName(relState2 !== 0);
  }
  /** Compares all raw values, including values hidden by deletion. @param other - Reference. @returns Equality. */
  public equals(other: ScSingleRefData): boolean {
    return (
      this.mnFlagValue === other.mnFlagValue &&
      this.mnCol === other.mnCol &&
      this.mnRow === other.mnRow &&
      this.mnTab === other.mnTab
    );
  }
}
