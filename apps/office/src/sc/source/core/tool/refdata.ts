/** @fileoverview Initialized ScSingleRefData contracts from pinned refdata.hxx/refdata.cxx; token-union storage and full document/compiler ownership remain separate. */
import { MAXTAB, ScAddress, ScRange, ValidTab } from "../../../inc/address";
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

/** Original range reference with independent endpoint values and trim state. */
export class ScComplexRefData {
  public readonly Ref1 = new ScSingleRefData();
  public readonly Ref2 = new ScSingleRefData();
  public bTrimToData = false;

  /** Represents native member storage or implicit value copying. @param source - Initialized source if copying. @returns New complex reference. */
  public constructor(source?: ScComplexRefData) {
    if (source) this.assign(source);
  }
  /** Copies into existing endpoint owners, including trim state. @param source - Initialized source. @returns Recipient. */
  public assign(source: ScComplexRefData): this {
    this.Ref1.assign(source.Ref1);
    this.Ref2.assign(source.Ref2);
    this.bTrimToData = source.bTrimToData;
    return this;
  }
  /** Clears endpoint flags without changing coordinates or trim. @returns Nothing. */
  public InitFlags(): void {
    this.Ref1.InitFlags();
    this.Ref2.InitFlags();
  }
  /** Initializes supplied endpoint values without reordering or changing trim. @param args - Range or six native coordinates. @returns Nothing. */
  public InitRange(...args: [ScRange] | [SCCOL, SCROW, SCTAB, SCCOL, SCROW, SCTAB]): void {
    if (args[0] instanceof ScRange) {
      this.Ref1.InitAddress(args[0].aStart);
      this.Ref2.InitAddress(args[0].aEnd);
    } else {
      const [col1, row1, tab1, col2, row2, tab2] = args as [
        SCCOL,
        SCROW,
        SCTAB,
        SCCOL,
        SCROW,
        SCTAB,
      ];
      this.Ref1.InitAddress(col1, row1, tab1);
      this.Ref2.InitAddress(col2, row2, tab2);
    }
  }
  /** Initializes both endpoints relative to the formula position, retaining trim. @param doc - Native document getter view. @param range - Absolute range. @param position - Formula position. @returns Nothing. */
  public InitRangeRel(doc: ScReferenceDocument, range: ScRange, position: ScAddress): void {
    this.Ref1.InitAddressRel(doc, range.aStart, position);
    this.Ref2.InitAddressRel(doc, range.aEnd, position);
  }
  /** Initializes original endpoint flags and 3D inheritance through sorted absolute range construction. @param doc - Document. @param first - First reference address. @param second - Second reference address. @param position - Formula position. @returns Nothing. */
  public InitFromRefAddresses(
    doc: ScReferenceDocument,
    first: ScRefAddress,
    second: ScRefAddress,
    position: ScAddress,
  ): void {
    this.InitFlags();
    this.Ref1.SetColRel(first.IsRelCol());
    this.Ref1.SetRowRel(first.IsRelRow());
    this.Ref1.SetTabRel(first.IsRelTab());
    this.Ref1.SetFlag3D(first.Tab() !== position.Tab() || first.Tab() !== second.Tab());
    this.Ref2.SetColRel(second.IsRelCol());
    this.Ref2.SetRowRel(second.IsRelRow());
    this.Ref2.SetTabRel(second.IsRelTab());
    this.Ref2.SetFlag3D(first.Tab() !== second.Tab());
    this.SetRange(
      doc.GetSheetLimits(),
      new ScRange(first.GetAddress(), second.GetAddress()),
      position,
    );
  }
  /** Checks both endpoint local domains. @param doc - Document. @returns Validity. */
  public Valid(doc: ScReferenceDocument): boolean {
    return this.Ref1.Valid(doc) && this.Ref2.Valid(doc);
  }
  /** Checks original external cache domains and masked sheet ordering. @param doc - Document. @returns External validity. */
  public ValidExternal(doc: ScReferenceDocument): boolean {
    return (
      this.Ref1.ValidExternal(doc) &&
      this.Ref2.ColValid(doc) &&
      this.Ref2.RowValid(doc) &&
      this.Ref1.Tab() <= this.Ref2.Tab()
    );
  }
  /** Resolves endpoints with the original independently sorted address-pair constructor. @param bounds - Limits or document. @param position - Formula position. @returns Independent absolute range. */
  public toAbs(bounds: ScSheetLimits | ScReferenceDocument, position: ScAddress): ScRange {
    const limits = bounds instanceof ScSheetLimits ? bounds : bounds.GetSheetLimits();
    return new ScRange(this.Ref1.toAbs(limits, position), this.Ref2.toAbs(limits, position));
  }
  /** Sets endpoint values using the existing flags and supplied ordering. @param limits - Sheet limits. @param range - Ordered absolute range. @param position - Formula position. @returns Nothing. */
  public SetRange(limits: ScSheetLimits, range: ScRange, position: ScAddress): void {
    this.Ref1.SetAddress(limits, range.aStart, position);
    this.Ref2.SetAddress(limits, range.aEnd, position);
  }
  /** Orders through the original single-reference provenance owner. @param position - Formula position. @returns Nothing. */
  public PutInOrder(position: ScAddress): void {
    ScSingleRefData.PutInOrder(this.Ref1, this.Ref2, position);
  }
  /** Compares raw endpoints; original trim state is excluded. @param other - Range reference. @returns Equality. */
  public equals(other: ScComplexRefData): boolean {
    return this.Ref1.equals(other.Ref1) && this.Ref2.equals(other.Ref2);
  }
  /** Extends with original sheet, relativity, 3D and relative-name inheritance. @param limits - Sheet limits. @param value - Single or complex reference, including aliases. @param position - Formula position. @returns Recipient. */
  public Extend(
    limits: ScSheetLimits,
    value: ScSingleRefData | ScComplexRefData,
    position: ScAddress,
  ): this {
    if (value instanceof ScComplexRefData)
      return this.Extend(limits, value.Ref1, position).Extend(limits, value.Ref2, position);
    const inherit3D = this.Ref1.IsFlag3D() && !this.Ref2.IsFlag3D() && !value.IsFlag3D();
    const absoluteRange = this.toAbs(limits, position);
    const reference = new ScSingleRefData(value);
    if (!value.IsFlag3D()) {
      if (this.Ref2.IsTabRel()) reference.SetRelTab(this.Ref2.Tab());
      else reference.SetAbsTab(this.Ref2.Tab());
    }
    const absolute = reference.toAbs(limits, position);
    if (absolute.Col() < absoluteRange.aStart.Col()) absoluteRange.aStart.SetCol(absolute.Col());
    if (absolute.Row() < absoluteRange.aStart.Row()) absoluteRange.aStart.SetRow(absolute.Row());
    if (absolute.Tab() < absoluteRange.aStart.Tab()) absoluteRange.aStart.SetTab(absolute.Tab());
    if (absoluteRange.aEnd.Col() < absolute.Col()) absoluteRange.aEnd.SetCol(absolute.Col());
    if (absoluteRange.aEnd.Row() < absolute.Row()) absoluteRange.aEnd.SetRow(absolute.Row());
    if (absoluteRange.aEnd.Tab() < absolute.Tab()) absoluteRange.aEnd.SetTab(absolute.Tab());
    if (absoluteRange.aEnd.Col() === absolute.Col()) this.Ref2.SetColRel(value.IsColRel());
    if (absoluteRange.aEnd.Row() === absolute.Row()) this.Ref2.SetRowRel(value.IsRowRel());
    if (absoluteRange.aStart.Tab() === absolute.Tab() && value.IsFlag3D())
      this.Ref1.SetTabRel(value.IsTabRel());
    if (absoluteRange.aEnd.Tab() === absolute.Tab())
      this.Ref2.SetTabRel(inherit3D ? this.Ref1.IsTabRel() : value.IsTabRel());
    if (
      absoluteRange.aStart.Tab() !== position.Tab() ||
      absoluteRange.aStart.Tab() !== absoluteRange.aEnd.Tab()
    )
      this.Ref1.SetFlag3D(true);
    if (absoluteRange.aStart.Tab() !== absoluteRange.aEnd.Tab()) this.Ref2.SetFlag3D(true);
    if (value.IsFlag3D()) this.Ref1.SetFlag3D(true);
    if (value.IsRelName()) this.Ref2.SetRelName(true);
    this.SetRange(limits, absoluteRange, position);
    return this;
  }
  /** Checks absolute full-row anchors for an entire-column reference. @param limits - Sheet limits. @returns Whether entire columns. */
  public IsEntireCol(limits: ScSheetLimits): boolean {
    return (
      this.Ref1.Row() === 0 &&
      this.Ref2.Row() === limits.MaxRow() &&
      !this.Ref1.IsRowRel() &&
      !this.Ref2.IsRowRel()
    );
  }
  /** Checks absolute full-column anchors for an entire-row reference. @param limits - Sheet limits. @returns Whether entire rows. */
  public IsEntireRow(limits: ScSheetLimits): boolean {
    return (
      this.Ref1.Col() === 0 &&
      this.Ref2.Col() === limits.MaxCol() &&
      !this.Ref1.IsColRel() &&
      !this.Ref2.IsColRel()
    );
  }
  /** Updates a masked absolute/relative column endpoint with native sticky semantics. @param doc - Document. @param delta - Column displacement. @param position - Formula position. @returns Native change result, which can be true for zero delta. */
  public IncEndColSticky(doc: ScReferenceDocument, delta: SCCOL, position: ScAddress): boolean {
    const col1 =
      ((this.Ref1.IsColRel() ? this.Ref1.Col() + position.Col() : this.Ref1.Col()) << 16) >> 16;
    const col2 =
      ((this.Ref2.IsColRel() ? this.Ref2.Col() + position.Col() : this.Ref2.Col()) << 16) >> 16;
    if (col1 >= col2) {
      this.Ref2.IncCol(delta);
      return true;
    }
    if (col2 === doc.MaxCol()) return false;
    if (col2 < doc.MaxCol()) {
      const col = Math.min(((col2 + delta) << 16) >> 16, doc.MaxCol());
      if (this.Ref2.IsColRel()) this.Ref2.SetRelCol(col - position.Col());
      else this.Ref2.SetAbsCol(col);
    } else this.Ref2.IncCol(delta);
    return true;
  }
  /** Updates a masked absolute/relative row endpoint with native sticky semantics. @param doc - Document. @param delta - Row displacement. @param position - Formula position. @returns Native change result, which can be true for zero delta. */
  public IncEndRowSticky(doc: ScReferenceDocument, delta: SCROW, position: ScAddress): boolean {
    const row1 = (this.Ref1.IsRowRel() ? this.Ref1.Row() + position.Row() : this.Ref1.Row()) | 0;
    const row2 = (this.Ref2.IsRowRel() ? this.Ref2.Row() + position.Row() : this.Ref2.Row()) | 0;
    if (row1 >= row2) {
      this.Ref2.IncRow(delta);
      return true;
    }
    if (row2 === doc.MaxRow()) return false;
    if (row2 < doc.MaxRow()) {
      const row = Math.min((row2 + delta) | 0, doc.MaxRow());
      if (this.Ref2.IsRowRel()) this.Ref2.SetRelRow(row - position.Row());
      else this.Ref2.SetAbsRow(row);
    } else this.Ref2.IncRow(delta);
    return true;
  }
  /** Checks deletion on either endpoint. @returns Whether deleted. */
  public IsDeleted(): boolean {
    return this.Ref1.IsDeleted() || this.Ref2.IsDeleted();
  }
  /** Reads trim state independently of reference equality. @returns Trim state. */
  public IsTrimToData(): boolean {
    return this.bTrimToData;
  }
  /** Sets trim state without altering endpoint values. @param value - Trim state. @returns Nothing. */
  public SetTrimToData(value: boolean): void {
    this.bTrimToData = value;
  }
}
