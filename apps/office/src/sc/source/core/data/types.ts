/** @fileoverview Original Calc range-matrix and nonempty-cell-state values from sc/inc/types.hxx and core/data/types.cxx; native widths use JS integer assignment boundaries. */
import type { ScMatrixRef } from "../../../inc/types";

/** Original sc::RangeMatrix value retains the real matrix owner and six signed32 coordinates. */
export class RangeMatrix {
  mpMat: ScMatrixRef = null;
  private _mnCol1 = -1;
  /** Original signed32 mnCol1 field. @returns Coordinate. */
  get mnCol1(): number {
    return this._mnCol1;
  }
  /** Original signed32 assignment boundary. @param value - Coordinate. @returns Nothing. */
  set mnCol1(value: number) {
    this._mnCol1 = value | 0;
  }
  private _mnRow1 = -1;
  /** Original signed32 mnRow1 field. @returns Coordinate. */
  get mnRow1(): number {
    return this._mnRow1;
  }
  /** Original signed32 assignment boundary. @param value - Coordinate. @returns Nothing. */
  set mnRow1(value: number) {
    this._mnRow1 = value | 0;
  }
  private _mnTab1 = -1;
  /** Original signed32 mnTab1 field. @returns Coordinate. */
  get mnTab1(): number {
    return this._mnTab1;
  }
  /** Original signed32 assignment boundary. @param value - Coordinate. @returns Nothing. */
  set mnTab1(value: number) {
    this._mnTab1 = value | 0;
  }
  private _mnCol2 = -1;
  /** Original signed32 mnCol2 field. @returns Coordinate. */
  get mnCol2(): number {
    return this._mnCol2;
  }
  /** Original signed32 assignment boundary. @param value - Coordinate. @returns Nothing. */
  set mnCol2(value: number) {
    this._mnCol2 = value | 0;
  }
  private _mnRow2 = -1;
  /** Original signed32 mnRow2 field. @returns Coordinate. */
  get mnRow2(): number {
    return this._mnRow2;
  }
  /** Original signed32 assignment boundary. @param value - Coordinate. @returns Nothing. */
  set mnRow2(value: number) {
    this._mnRow2 = value | 0;
  }
  private _mnTab2 = -1;
  /** Original signed32 mnTab2 field. @returns Coordinate. */
  get mnTab2(): number {
    return this._mnTab2;
  }
  /** Original signed32 assignment boundary. @param value - Coordinate. @returns Nothing. */
  set mnTab2(value: number) {
    this._mnTab2 = value | 0;
  }
  /** Original default and implicit-copy construction, retaining matrix identity. @param source - Optional initialized source. @returns Value. */
  constructor(source?: Readonly<RangeMatrix>) {
    if (source) this.copy_assign(source);
  }
  /** Original implicit value copy assignment. @param source - Initialized const source. @returns Recipient. */
  copy_assign(source: Readonly<RangeMatrix>): this {
    this.mpMat = source.mpMat;
    this.mnCol1 = source.mnCol1;
    this.mnRow1 = source.mnRow1;
    this.mnTab1 = source.mnTab1;
    this.mnCol2 = source.mnCol2;
    this.mnRow2 = source.mnRow2;
    this.mnTab2 = source.mnTab2;
    return this;
  }
  /** Original implicit move transfers matrix reference and retains source coordinates. @param source - Rvalue source. @returns Moved value. */
  static move(source: RangeMatrix): RangeMatrix {
    const result = new RangeMatrix(source);
    source.mpMat = null;
    return result;
  }
  /** Original implicit move assignment; native intrusive_ptr self-move leaves initialized value intact. @param source - Rvalue source. @returns Recipient. */
  move_assign(source: RangeMatrix): this {
    if (this !== source) {
      this.copy_assign(source);
      source.mpMat = null;
    }
    return this;
  }
  /** Original nonnegative/ordered coordinate predicate, independent of matrix presence and document bounds. @returns Range validity. */
  isRangeValid(): boolean {
    return (
      this.mnCol1 >= 0 &&
      this.mnRow1 >= 0 &&
      this.mnTab1 >= 0 &&
      this.mnCol2 >= 0 &&
      this.mnRow2 >= 0 &&
      this.mnTab2 >= 0 &&
      this.mnCol1 <= this.mnCol2 &&
      this.mnRow1 <= this.mnRow2 &&
      this.mnTab1 <= this.mnTab2
    );
  }
}

/** Original sc::MultiDataCellState value used by column nonempty-cell queries. */
export class MultiDataCellState {
  static readonly StateType = { Invalid: 0, Empty: 1, HasOneCell: 2, HasMultipleCells: 3 } as const;
  private _mnRow1 = -1;
  private _mnCol1 = -1;
  private _meState = MultiDataCellState.StateType.Invalid as number;
  /** Original signed32 first nonempty row. @returns Row. */
  get mnRow1(): number {
    return this._mnRow1;
  }
  /** Original signed32 assignment. @param value - Row. @returns Nothing. */
  set mnRow1(value: number) {
    this._mnRow1 = value | 0;
  }
  /** Original signed16 first nonempty column. @returns Column. */
  get mnCol1(): number {
    return this._mnCol1;
  }
  /** Original signed16 assignment. @param value - Column. @returns Nothing. */
  set mnCol1(value: number) {
    this._mnCol1 = (value << 16) >> 16;
  }
  /** Original fixed UInt8 StateType field. @returns State. */
  get meState(): number {
    return this._meState;
  }
  /** Original UInt8 assignment. @param value - State. @returns Nothing. */
  set meState(value: number) {
    this._meState = value & 0xff;
  }
  /** Original default/state and implicit-copy constructors. @param source - State or copied value. @returns Value. */
  constructor(
    source: number | Readonly<MultiDataCellState> = MultiDataCellState.StateType.Invalid,
  ) {
    if (typeof source === "number") this.meState = source;
    else this.copy_assign(source);
  }
  /** Original implicit scalar copy assignment, including self assignment. @param source - Initialized source. @returns Recipient. */
  copy_assign(source: Readonly<MultiDataCellState>): this {
    this.mnRow1 = source.mnRow1;
    this.mnCol1 = source.mnCol1;
    this.meState = source.meState;
    return this;
  }
}
