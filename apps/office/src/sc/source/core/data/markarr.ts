/** @fileoverview Original initialized sc/source/core/data/markarr.cxx row-mark intervals and iterator; module storage retains native friend access. */
import { ScSheetLimits } from "../../../inc/sheetlimits";
import type { SCROW } from "../../../inc/types";

/** Original signed30 row boundary and selected bit. */
export class ScMarkEntry {
  private row: SCROW;
  public bMarked: boolean;
  /** Creates an initialized native aggregate. @param nRow - Inclusive boundary. @param bMarked - Selected state. @returns Entry. */
  public constructor(nRow: SCROW, bMarked: boolean) {
    this.row = (nRow << 2) >> 2;
    this.bMarked = bMarked;
  }
  /** Reads the signed30 bitfield. @returns Inclusive boundary. */
  public get nRow(): SCROW {
    return this.row;
  }
  /** Assigns through the original signed30 bitfield. @param value - New boundary. @returns Nothing. */
  public set nRow(value: SCROW) {
    this.row = (value << 2) >> 2;
  }
  /** Compares both native fields. @param other - Other entry. @returns Equality. */
  public equals(other: ScMarkEntry): boolean {
    return this.row === other.row && this.bMarked === other.bMarked;
  }
}

/** Native private vector, accessible to the two original friend owners in this module. */
const entries = new WeakMap<ScMarkArray, ScMarkEntry[]>();

/** Alternating marked/unmarked intervals ending at each inclusive boundary. */
export class ScMarkArray {
  private readonly mrSheetLimits: ScSheetLimits;
  /** Constructs unmarked bounds or copies the original limits reference and values. @param source - Explicit bounds or copy source. @returns Owner. */
  public constructor(source: ScSheetLimits | ScMarkArray) {
    if (source instanceof ScMarkArray) {
      this.mrSheetLimits = source.mrSheetLimits;
      this.assign(source);
    } else {
      this.mrSheetLimits = source;
      this.Reset(false);
    }
  }
  /** Reads the original vector under the owner's initialized storage invariant. @returns Private entries. */
  private get mvData(): ScMarkEntry[] {
    return entries.get(this) as ScMarkEntry[];
  }
  /** Adapts explicit native move construction to JavaScript call syntax. @param source - Moved source. @returns New owner with the same limits reference. */
  public static move(source: ScMarkArray): ScMarkArray {
    const result = new ScMarkArray(source.mrSheetLimits);
    return result.moveAssign(source);
  }
  /** Replaces all entries with a single boundary; reserve capacity has no JS observable value. @param marked - Selected state. @param needed - Original reserve request. @returns Nothing. */
  public Reset(marked = false, needed = 1): void {
    // Native asserts needed != 0 in debug; release only reserves vector capacity.
    void needed;
    entries.set(this, [new ScMarkEntry(this.mrSheetLimits.mnMaxRow, marked)]);
  }
  /** Performs the original binary interval search, including negative rows. @param row - Native signed32 row. @returns Found flag and original output index (zero on failure). */
  public Search(row: SCROW): [boolean, number] {
    row |= 0;
    let high = this.mvData.length - 1;
    let low = 0;
    while (low <= high) {
      const i = Math.floor((low + high) / 2);
      if ((this.mvData[i] as ScMarkEntry).nRow < row) low = i + 1;
      else if (i > 0 && (this.mvData[i - 1] as ScMarkEntry).nRow >= row) high = i - 1;
      else return [true, i];
    }
    return [false, 0];
  }
  /** Reads selected state at the searched interval. @param row - Row. @returns Marked state, false on failed search. */
  public GetMark(row: SCROW): boolean {
    const [found, i] = this.Search(row);
    return found ? (this.mvData[i] as ScMarkEntry).bMarked : false;
  }
  /** Retains the original split/shrink/combine algorithm and entry order. @param start - First signed32 row. @param end - Last signed32 row. @param marked - New selected state. @returns Nothing. */
  public SetMarkArea(start: SCROW, end: SCROW, marked: boolean): void {
    start |= 0;
    end |= 0;
    if (!(this.mrSheetLimits.ValidRow(start) && this.mrSheetLimits.ValidRow(end))) return;
    if (start === 0 && end === this.mrSheetLimits.mnMaxRow) {
      this.Reset(marked);
      return;
    }
    let ni: number;
    let insert: number;
    let combined = false;
    let split = false;
    if (start > 0) {
      ni = this.Search(start)[1];
      insert = this.mrSheetLimits.GetMaxRowCount();
      if ((this.mvData[ni] as ScMarkEntry).bMarked !== marked) {
        if (ni === 0 || (this.mvData[ni - 1] as ScMarkEntry).nRow < start - 1) {
          if ((this.mvData[ni] as ScMarkEntry).nRow > end) split = true;
          ni++;
          insert = ni;
        } else {
          // Search guarantees previous boundary < start. The preceding branch
          // excludes ni==0 and previous < start-1, so original equality is true.
          insert = ni;
        }
      }
      if (ni > 0 && (this.mvData[ni - 1] as ScMarkEntry).bMarked === marked) {
        (this.mvData[ni - 1] as ScMarkEntry).nRow = end;
        insert = this.mrSheetLimits.GetMaxRowCount();
        combined = true;
      }
    } else {
      insert = 0;
      ni = 0;
    }
    let nj = ni;
    while (nj < this.mvData.length && (this.mvData[nj] as ScMarkEntry).nRow <= end) nj++;
    if (!split) {
      if (nj < this.mvData.length && (this.mvData[nj] as ScMarkEntry).bMarked === marked) {
        if (ni > 0) {
          if ((this.mvData[ni - 1] as ScMarkEntry).bMarked === marked) {
            (this.mvData[ni - 1] as ScMarkEntry).nRow = (this.mvData[nj] as ScMarkEntry).nRow;
            nj++;
          } else if (ni === insert) (this.mvData[ni - 1] as ScMarkEntry).nRow = start - 1;
        }
        insert = this.mrSheetLimits.GetMaxRowCount();
        combined = true;
      } else if (ni > 0 && ni === insert) (this.mvData[ni - 1] as ScMarkEntry).nRow = start - 1;
    }
    if (ni < nj) {
      if (!combined) {
        const entry = this.mvData[ni] as ScMarkEntry;
        entry.nRow = end;
        entry.bMarked = marked;
        ni++;
        insert = this.mrSheetLimits.GetMaxRowCount();
      }
      if (ni < nj) this.mvData.splice(ni, nj - ni);
    }
    if (insert < this.mrSheetLimits.GetMaxRowCount()) {
      // ni starts at a searched vector position and advances by at most one;
      // insert cannot exceed vector size before this insertion on valid ranges.
      if (!split) this.mvData.splice(insert, 0, new ScMarkEntry(end, marked));
      else {
        const previous = this.mvData[insert - 1] as ScMarkEntry;
        this.mvData.splice(
          insert,
          0,
          new ScMarkEntry(end, marked),
          new ScMarkEntry(previous.nRow, previous.bMarked),
        );
      }
      if (insert) (this.mvData[insert - 1] as ScMarkEntry).nRow = start - 1;
    }
  }
  /** Takes initialized entry storage without normalization. @param source - Moved entry vector; emptied after transfer. @returns Nothing. */
  public Set(source: ScMarkEntry[]): void {
    entries.set(this, source.splice(0));
  }
  /** Tests whether both rows search to the same marked interval. @param start - First row. @param end - Last row. @returns Original all-marked result. */
  public IsAllMarked(start: SCROW, end: SCROW): boolean {
    const [found, i] = this.Search(start);
    if (found && (this.mvData[i] as ScMarkEntry).bMarked) {
      const [endFound, j] = this.Search(end);
      if (endFound && i === j) return true;
    }
    return false;
  }
  /** Finds the original single marked interval and preserves caller outputs on failure. @param start - Existing output start. @param end - Existing output end. @returns Found flag and output rows. */
  public HasOneMark(start: SCROW, end: SCROW): [boolean, SCROW, SCROW] {
    start |= 0;
    end |= 0;
    if (this.mvData.length === 1) {
      if ((this.mvData[0] as ScMarkEntry).bMarked) return [true, 0, this.mrSheetLimits.mnMaxRow];
    } else if (this.mvData.length === 2) {
      const first = this.mvData[0] as ScMarkEntry;
      return first.bMarked
        ? [true, 0, first.nRow]
        : [true, first.nRow + 1, this.mrSheetLimits.mnMaxRow];
    } else if (this.mvData.length === 3) {
      if ((this.mvData[1] as ScMarkEntry).bMarked)
        return [
          true,
          (this.mvData[0] as ScMarkEntry).nRow + 1,
          (this.mvData[1] as ScMarkEntry).nRow,
        ];
    }
    return [false, start, end];
  }
  /** Reads the original size/first-bit predicate, without assuming normalized entries. @returns Whether any marks are reported. */
  public HasMarks(): boolean {
    return (
      this.mvData.length > 1 ||
      (this.mvData.length === 1 && (this.mvData[0] as ScMarkEntry).bMarked)
    );
  }
  /** Copies entries while retaining the receiving limits reference. @param source - Value source. @returns This owner. */
  public assign(source: ScMarkArray): this {
    entries.set(
      this,
      source.mvData.map(
        /** Copies one native aggregate. @param entry - Source. @returns Independent entry. */
        (entry) => new ScMarkEntry(entry.nRow, entry.bMarked),
      ),
    );
    return this;
  }
  /** Transfers values while retaining receiving limits; self move leaves an empty vector. @param source - Moved source. @returns This owner. */
  public moveAssign(source: ScMarkArray): this {
    const data = source.mvData;
    entries.set(source, []);
    entries.set(this, source === this ? [] : data);
    return this;
  }
  /** Compares only vector values, independently of limits. @param other - Other array. @returns Equality. */
  public equals(other: ScMarkArray): boolean {
    return (
      this.mvData.length === other.mvData.length &&
      this.mvData.every(
        /** Compares one ordered entry. @param entry - Entry. @param i - Index. @returns Equality. */
        (entry, i) => entry.equals(other.mvData[i] as ScMarkEntry),
      )
    );
  }
  /** Includes current row, preserving invalid input and original absent-mark sentinels. @param row - Row. @param up - Upward direction. @returns Next marked row. */
  public GetNextMarked(row: SCROW, up: boolean): SCROW {
    row |= 0;
    if (this.mrSheetLimits.ValidRow(row)) {
      const i = this.Search(row)[1];
      if (!(this.mvData[i] as ScMarkEntry).bMarked) {
        if (up) return i > 0 ? (this.mvData[i - 1] as ScMarkEntry).nRow : -1;
        return (this.mvData[i] as ScMarkEntry).nRow + 1;
      }
    }
    return row;
  }
  /** Reads the containing marked interval boundary (native debug asserts marking). @param row - Row. @param up - Upward direction. @returns Interval boundary. */
  public GetMarkEnd(row: SCROW, up: boolean): SCROW {
    const i = this.Search(row)[1];
    if (up) return i > 0 ? (this.mvData[i - 1] as ScMarkEntry).nRow + 1 : 0;
    return (this.mvData[i] as ScMarkEntry).nRow;
  }
  /** Shifts each eligible signed30 boundary before clamping, without coalescing. @param start - First signed32 boundary. @param offset - Native signed64 tools::Long displacement. @returns Nothing. */
  public Shift(start: SCROW, offset: bigint | number): void {
    start |= 0;
    const delta = BigInt.asIntN(64, BigInt(offset));
    if (delta === 0n || start > this.mrSheetLimits.mnMaxRow) return;
    for (const entry of this.mvData) {
      if (entry.nRow < start) continue;
      entry.nRow = Number(BigInt.asIntN(30, BigInt(entry.nRow) + delta));
      if (entry.nRow < 0) entry.nRow = 0;
      else if (entry.nRow > this.mrSheetLimits.mnMaxRow) entry.nRow = this.mrSheetLimits.mnMaxRow;
    }
  }
}

/** Original selected-interval iterator, retaining the array pointer across mutation. */
export class ScMarkArrayIter {
  private pArray: ScMarkArray | null;
  private nPos = 0;
  /** Borrows an array or null. @param array - Original pointer. @returns Iterator. */
  public constructor(array: ScMarkArray | null) {
    this.pArray = array;
  }
  /** Rebinds the pointer and resets its index. @param array - New array or null. @returns Nothing. */
  public reset(array: ScMarkArray | null): void {
    this.pArray = array;
    this.nPos = 0;
  }
  /** Finds the next selected interval; outputs remain untouched on failure. @param top - Existing top output. @param bottom - Existing bottom output. @returns Found flag and both output rows. */
  public Next(top: SCROW, bottom: SCROW): [boolean, SCROW, SCROW] {
    top |= 0;
    bottom |= 0;
    if (!this.pArray) return [false, top, bottom];
    const data = entries.get(this.pArray) as ScMarkEntry[];
    if (this.nPos >= data.length) return [false, top, bottom];
    while (!(data[this.nPos] as ScMarkEntry).bMarked) {
      ++this.nPos;
      if (this.nPos >= data.length) return [false, top, bottom];
    }
    bottom = (data[this.nPos] as ScMarkEntry).nRow;
    top = this.nPos === 0 ? 0 : (data[this.nPos - 1] as ScMarkEntry).nRow + 1;
    ++this.nPos;
    return [true, top, bottom];
  }
}
