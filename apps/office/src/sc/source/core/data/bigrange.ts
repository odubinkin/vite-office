/** @fileoverview Defined ScBigAddress/ScBigRange numerical contracts from pinned sc/inc/bigrange.hxx and sc/source/core/data/bigrange.cxx. */
import { MAXTAB, ScAddress, ScRange } from "../../../inc/address";
import type { ScAddressDocument } from "../tool/address";

/** Original signed64 coordinate value for references that may lie outside a document. */
export class ScBigAddress {
  private nRow: bigint;
  private nCol: bigint;
  private nTab: bigint;

  /** Constructs zero, explicit or copied native coordinates without clipping. @param args - Zero, address source or three native coordinates. @returns New owner. */
  public constructor(...args: [] | [ScBigAddress | ScAddress] | [bigint, bigint, bigint]) {
    const [col = 0n, row = 0n, tab = 0n] = args;
    if (typeof col === "bigint") {
      this.nCol = col;
      this.nRow = row;
      this.nTab = tab;
    } else {
      this.nCol = BigInt(col.Col());
      this.nRow = BigInt(col.Row());
      this.nTab = BigInt(col.Tab());
    }
  }
  /** Reads raw column. @returns Column. */
  public Col(): bigint {
    return this.nCol;
  }
  /** Reads raw row. @returns Row. */
  public Row(): bigint {
    return this.nRow;
  }
  /** Reads raw sheet. @returns Sheet. */
  public Tab(): bigint {
    return this.nTab;
  }
  /** Sets raw values without document sanitization. @param col - Column. @param row - Row. @param tab - Sheet. @returns Nothing. */
  public Set(col: bigint, row: bigint, tab: bigint): void {
    this.nCol = col;
    this.nRow = row;
    this.nTab = tab;
  }
  /** Sets column. @param col - Native value. @returns Nothing. */
  public SetCol(col: bigint): void {
    this.nCol = col;
  }
  /** Sets row. @param row - Native value. @returns Nothing. */
  public SetRow(row: bigint): void {
    this.nRow = row;
  }
  /** Sets sheet. @param tab - Native value. @returns Nothing. */
  public SetTab(tab: bigint): void {
    this.nTab = tab;
  }
  /** Increments column within the defined native signed64 arithmetic domain. @param delta - Displacement. @returns Nothing. */
  public IncCol(delta = 1n): void {
    this.nCol += delta;
  }
  /** Increments row within the defined native signed64 arithmetic domain. @param delta - Displacement. @returns Nothing. */
  public IncRow(delta = 1n): void {
    this.nRow += delta;
  }
  /** Increments sheet within the defined native signed64 arithmetic domain. @param delta - Displacement. @returns Nothing. */
  public IncTab(delta = 1n): void {
    this.nTab += delta;
  }
  /** Projects native output reference parameters into an exact fresh tuple. @returns Column,row,sheet. */
  public GetVars(): [bigint, bigint, bigint] {
    return [this.nCol, this.nRow, this.nTab];
  }
  /** Retains original per-axis sentinel validity and exclusive document sheet count. @param doc - Existing native document getter view. @returns Whether valid. */
  public IsValid(doc: ScAddressDocument): boolean {
    return (
      ((0n <= this.nCol && this.nCol <= BigInt(doc.MaxCol())) ||
        this.nCol === ScBigRange.nRangeMin ||
        this.nCol === ScBigRange.nRangeMax) &&
      ((0n <= this.nRow && this.nRow <= BigInt(doc.MaxRow())) ||
        this.nRow === ScBigRange.nRangeMin ||
        this.nRow === ScBigRange.nRangeMax) &&
      ((0n <= this.nTab && this.nTab < BigInt(doc.GetTableCount())) ||
        this.nTab === ScBigRange.nRangeMin ||
        this.nTab === ScBigRange.nRangeMax)
    );
  }
  /** Clips coordinates to ordinary document bounds and the global sheet bound. @param doc - Existing document getters. @returns Independent ordinary address. */
  public MakeAddress(doc: ScAddressDocument): ScAddress {
    let col: number, row: number, tab: number;
    if (this.nCol < 0n) col = 0;
    else if (this.nCol > BigInt(doc.MaxCol())) col = doc.MaxCol();
    else col = Number(this.nCol);
    if (this.nRow < 0n) row = 0;
    else if (this.nRow > BigInt(doc.MaxRow())) row = doc.MaxRow();
    else row = Number(this.nRow);
    if (this.nTab < 0n) tab = 0;
    else if (this.nTab > BigInt(MAXTAB)) tab = MAXTAB;
    else tab = Number(this.nTab);
    return new ScAddress(col, row, tab);
  }
  /** Assigns raw big or ordinary coordinates into the same value owner. @param source - Address source. @returns Recipient. */
  public assign(source: ScBigAddress | ScAddress): this {
    this.Set(BigInt(source.Col()), BigInt(source.Row()), BigInt(source.Tab()));
    return this;
  }
  /** Compares raw signed64 coordinates. @param other - Big address. @returns Equality. */
  public equals(other: ScBigAddress): boolean {
    return this.nCol === other.nCol && this.nRow === other.nRow && this.nTab === other.nTab;
  }
}

/** Original range of independent signed64 endpoints, including whole-axis sentinels. */
export class ScBigRange {
  public static readonly nRangeMin = -(1n << 63n);
  public static readonly nRangeMax = (1n << 63n) - 1n;
  public readonly aStart: ScBigAddress;
  public readonly aEnd: ScBigAddress;

  /** Constructs zero, copied or six raw endpoints without ordering. @param args - Original numerical overloads. @returns New owner. */
  public constructor(
    ...args: [] | [ScBigRange | ScRange] | [bigint, bigint, bigint, bigint, bigint, bigint]
  ) {
    const [first = 0n, row1 = 0n, tab1 = 0n, col2 = 0n, row2 = 0n, tab2 = 0n] = args;
    if (typeof first === "bigint") {
      this.aStart = new ScBigAddress(first, row1, tab1);
      this.aEnd = new ScBigAddress(col2, row2, tab2);
    } else {
      this.aStart = new ScBigAddress(first.aStart);
      this.aEnd = new ScBigAddress(first.aEnd);
    }
  }
  /** Sets raw endpoint values in the original order. @param col1 - First column. @param row1 - First row. @param tab1 - First sheet. @param col2 - Last column. @param row2 - Last row. @param tab2 - Last sheet. @returns Nothing. */
  public Set(
    col1: bigint,
    row1: bigint,
    tab1: bigint,
    col2: bigint,
    row2: bigint,
    tab2: bigint,
  ): void {
    this.aStart.Set(col1, row1, tab1);
    this.aEnd.Set(col2, row2, tab2);
  }
  /** Projects the native six output reference parameters. @returns Fresh endpoint tuple. */
  public GetVars(): [bigint, bigint, bigint, bigint, bigint, bigint] {
    return [...this.aStart.GetVars(), ...this.aEnd.GetVars()];
  }
  /** Checks both raw endpoints without sorting. @param doc - Document. @returns Whether valid. */
  public IsValid(doc: ScAddressDocument): boolean {
    return this.aStart.IsValid(doc) && this.aEnd.IsValid(doc);
  }
  /** Clips both endpoints, then uses the original sorting address-pair constructor. @param doc - Document. @returns Independent ordinary range. */
  public MakeRange(doc: ScAddressDocument): ScRange {
    return new ScRange(this.aStart.MakeAddress(doc), this.aEnd.MakeAddress(doc));
  }
  /** Tests inclusive raw address or range containment. @param value - Original big value. @returns Whether contained. */
  public Contains(value: ScBigAddress | ScBigRange): boolean {
    if (value instanceof ScBigAddress)
      return (
        this.aStart.Col() <= value.Col() &&
        value.Col() <= this.aEnd.Col() &&
        this.aStart.Row() <= value.Row() &&
        value.Row() <= this.aEnd.Row() &&
        this.aStart.Tab() <= value.Tab() &&
        value.Tab() <= this.aEnd.Tab()
      );
    return (
      this.aStart.Col() <= value.aStart.Col() &&
      value.aEnd.Col() <= this.aEnd.Col() &&
      this.aStart.Row() <= value.aStart.Row() &&
      value.aEnd.Row() <= this.aEnd.Row() &&
      this.aStart.Tab() <= value.aStart.Tab() &&
      value.aEnd.Tab() <= this.aEnd.Tab()
    );
  }
  /** Tests inclusive raw range intersection without sorting. @param other - Range. @returns Whether intersecting. */
  public Intersects(other: ScBigRange): boolean {
    return (
      this.aStart.Col() <= other.aEnd.Col() &&
      other.aStart.Col() <= this.aEnd.Col() &&
      this.aStart.Row() <= other.aEnd.Row() &&
      other.aStart.Row() <= this.aEnd.Row() &&
      this.aStart.Tab() <= other.aEnd.Tab() &&
      other.aStart.Tab() <= this.aEnd.Tab()
    );
  }
  /** Assigns values into existing endpoint owners. @param source - Big range. @returns Recipient. */
  public assign(source: ScBigRange): this {
    this.aStart.assign(source.aStart);
    this.aEnd.assign(source.aEnd);
    return this;
  }
  /** Compares both raw endpoints in supplied order. @param other - Big range. @returns Equality. */
  public equals(other: ScBigRange): boolean {
    return this.aStart.equals(other.aStart) && this.aEnd.equals(other.aEnd);
  }
}
