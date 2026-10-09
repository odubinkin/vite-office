/** @fileoverview Original markmulti.cxx multi-selection owner and iterator over actual Calc mark arrays and shared boolean segment storage. */
import { ScMarkArray, ScMarkArrayIter, ScMarkEntry } from "../../../inc/markarr";
import { ScFlatBoolRowSegments, type ScFlatBoolRowRangeData } from "../../../inc/segmenttree";
import { ScSheetLimits } from "../../../inc/sheetlimits";
import { ScRangeList } from "../../../inc/rangelst";
import type { SCCOL, SCROW } from "../../../inc/types";

/** Original fields, shared privately with the native iterator friend. */
interface MultiSelectionState {
  aMultiSelContainer: ScMarkArray[];
  readonly aRowSel: ScMarkArray;
  readonly mrSheetLimits: ScSheetLimits;
}
/** Private native owner storage; borrowed public arrays retain their original owner identity. */
const states = new WeakMap<ScMultiSel, MultiSelectionState>();
/** Native std::vector allocation capacity affects whether immutable bound references are copied or assigned. */
const capacities = new WeakMap<ScMarkArray[], number>();
/** Reads initialized private storage for the original owner and friend. @param owner - Selection owner. @returns Native fields. */
function stateOf(owner: ScMultiSel): MultiSelectionState {
  return states.get(owner) as MultiSelectionState;
}
/** Adapts std::vector resize with the original explicit unmarked value owner. @param data - Vector. @param size - New size. @param limits - Original bounds. @returns Nothing. */
function resize(data: ScMarkArray[], size: number, limits: ScSheetLimits): void {
  const capacity = capacities.get(data) as number;
  if (size > capacity) {
    // The compared native libc++ vector recommends max(2*capacity,new_size).
    // Reallocation move-constructs values, retaining each source bounds reference.
    const old = data.splice(0);
    for (const array of old) data.push(ScMarkArray.move(array));
    capacities.set(data, Math.max(2 * capacity, size));
  }
  if (data.length > size) data.length = size;
  while (data.length < size) data.push(new ScMarkArray(limits));
}
/** Adapts native count insertion with move construction versus assignment of bound-bearing values. @param data - Vector. @param position - Insertion index. @param count - Count. @param limits - Inserted value bounds. @returns Nothing. */
function insertColumns(
  data: ScMarkArray[],
  position: number,
  count: number,
  limits: ScSheetLimits,
): void {
  const size = data.length,
    capacity = capacities.get(data) as number;
  if (size + count > capacity) {
    const old = data.splice(0);
    for (let i = 0; i < position; ++i) data.push(ScMarkArray.move(old[i] as ScMarkArray));
    for (let i = 0; i < count; ++i) data.push(new ScMarkArray(limits));
    for (let i = position; i < size; ++i) data.push(ScMarkArray.move(old[i] as ScMarkArray));
    capacities.set(data, Math.max(2 * capacity, size + count));
    return;
  }
  const tail = size - position,
    value = new ScMarkArray(limits);
  if (count < tail) {
    for (let i = size - count; i < size; ++i) data.push(ScMarkArray.move(data[i] as ScMarkArray));
    for (let i = size - count - 1; i >= position; --i)
      (data[i + count] as ScMarkArray).moveAssign(data[i] as ScMarkArray);
    for (let i = position; i < position + count; ++i) (data[i] as ScMarkArray).assign(value);
  } else {
    for (let i = 0; i < count - tail; ++i) data.push(new ScMarkArray(value));
    for (let i = position; i < size; ++i) data.push(ScMarkArray.move(data[i] as ScMarkArray));
    for (let i = position; i < size; ++i) (data[i] as ScMarkArray).assign(value);
  }
}
/** Adapts native range erase, moving values into retained destination slots before destroying the tail. @param data - Vector. @param position - First erased index. @param count - Number erased. @returns Nothing. */
function eraseColumns(data: ScMarkArray[], position: number, count: number): void {
  if (count === 0) return;
  for (let i = position; i + count < data.length; ++i)
    (data[i] as ScMarkArray).moveAssign(data[i + count] as ScMarkArray);
  data.length -= count;
}

/** Original multi-selection with independent per-column arrays and a shared row array. */
export class ScMultiSel {
  /** Constructs explicit bounds or the original default copy. @param source - Bounds or copied selection. @returns Owner. */
  public constructor(source: ScSheetLimits | ScMultiSel) {
    if (source instanceof ScMultiSel) {
      const other = stateOf(source);
      states.set(this, {
        aMultiSelContainer: other.aMultiSelContainer.map(
          /** Copies a native vector value. @param array - Source. @returns Independent array. */
          (array) => new ScMarkArray(array),
        ),
        aRowSel: new ScMarkArray(other.aRowSel),
        mrSheetLimits: other.mrSheetLimits,
      });
    } else
      states.set(this, {
        aMultiSelContainer: [],
        aRowSel: new ScMarkArray(source),
        mrSheetLimits: source,
      });
    const columns = stateOf(this).aMultiSelContainer;
    capacities.set(columns, columns.length);
  }
  /** Adapts the native default move constructor syntax. @param source - Moved owner. @returns New selection with source bounds. */
  public static move(source: ScMultiSel): ScMultiSel {
    return new ScMultiSel(stateOf(source).mrSheetLimits).moveAssign(source);
  }
  /** Copies original vector/row values; reused slots retain bounds, reallocated slots copy source bounds. @param source - Source owner. @returns This owner. */
  public assign(source: ScMultiSel): this {
    const data = stateOf(this),
      other = stateOf(source);
    if (other.aMultiSelContainer.length > (capacities.get(data.aMultiSelContainer) as number)) {
      data.aMultiSelContainer = other.aMultiSelContainer.map(
        /** Copy-constructs native reallocated slots. @param array - Source. @returns Independent value. */
        (array) => new ScMarkArray(array),
      );
      capacities.set(data.aMultiSelContainer, data.aMultiSelContainer.length);
    } else
      for (let i = 0; i < other.aMultiSelContainer.length; ++i) {
        const value = other.aMultiSelContainer[i] as ScMarkArray;
        if (i < data.aMultiSelContainer.length)
          (data.aMultiSelContainer[i] as ScMarkArray).assign(value);
        else data.aMultiSelContainer.push(new ScMarkArray(value));
      }
    data.aMultiSelContainer.length = other.aMultiSelContainer.length;
    data.aRowSel.assign(other.aRowSel);
    return this;
  }
  /** Transfers the original vector/row values; native moved-from states and pointer lifetimes remain runtime-dependent. @param source - Moved owner. @returns This owner. */
  public moveAssign(source: ScMultiSel): this {
    const data = stateOf(this),
      other = stateOf(source),
      columns = other.aMultiSelContainer;
    other.aMultiSelContainer = [];
    capacities.set(other.aMultiSelContainer, 0);
    data.aMultiSelContainer = source === this ? other.aMultiSelContainer : columns;
    data.aRowSel.moveAssign(other.aRowSel);
    return this;
  }
  /** Clears columns and resets the existing row owner. @returns Nothing. */
  public Clear(): void {
    const data = stateOf(this);
    data.aMultiSelContainer.length = 0;
    data.aRowSel.Reset();
  }
  /** Counts marked column arrays only, with original signed16 result width. @returns Count. */
  public GetMultiSelectionCount(): SCCOL {
    let count = 0;
    for (const array of stateOf(this).aMultiSelContainer)
      if (array.HasMarks()) count = ((count + 1) << 16) >> 16;
    return count;
  }
  /** Checks shared rows first, then the original column. @param col - Column. @returns Marks reported. */
  public HasMarks(col: SCCOL): boolean {
    col = (col << 16) >> 16;
    const data = stateOf(this);
    if (data.aRowSel.HasMarks()) return true;
    return (
      col < (data.aMultiSelContainer.length << 16) >> 16 &&
      (data.aMultiSelContainer[col] as ScMarkArray).HasMarks()
    );
  }
  /** Retains the original single-mark predicate, including an independent source with multiple marks. @param col - Column. @param start - Existing output start. @param end - Existing output end. @returns Found and output rows. */
  public HasOneMark(col: SCCOL, start: SCROW, end: SCROW): [boolean, SCROW, SCROW] {
    col = (col << 16) >> 16;
    const data = stateOf(this),
      [one, a, b] = data.aRowSel.HasOneMark(-1, -1);
    const [two, c, d] =
      col < (data.aMultiSelContainer.length << 16) >> 16
        ? (data.aMultiSelContainer[col] as ScMarkArray).HasOneMark(-1, -1)
        : [false, -1, -1];
    if (one || two) {
      if (one && two) {
        if (b + 1 < c || d + 1 < a) return [false, start | 0, end | 0];
        return [true, Math.min(a, b, c, d), Math.max(a, b, c, d)];
      }
      if (one) return [true, a, b];
      return [true, c, d];
    }
    return [false, start | 0, end | 0];
  }
  /** Reads the original row/column union without building a segment tree. @param col - Column. @param row - Row. @returns Marked. */
  public GetMark(col: SCCOL, row: SCROW): boolean {
    col = (col << 16) >> 16;
    row |= 0;
    const data = stateOf(this);
    if (data.aRowSel.GetMark(row)) return true;
    return (
      col < (data.aMultiSelContainer.length << 16) >> 16 &&
      (data.aMultiSelContainer[col] as ScMarkArray).GetMark(row)
    );
  }
  /** Checks one source directly or constructs the original two-source union iterator. @param col - Column. @param start - First row. @param end - Last row. @returns All marked. */
  public IsAllMarked(col: SCCOL, start: SCROW, end: SCROW): boolean {
    col = (col << 16) >> 16;
    start |= 0;
    end |= 0;
    const data = stateOf(this),
      one = data.aRowSel.HasMarks();
    const two =
      col < (data.aMultiSelContainer.length << 16) >> 16 &&
      (data.aMultiSelContainer[col] as ScMarkArray).HasMarks();
    if (!one && !two) return false;
    if (one && two) {
      if (
        data.aRowSel.IsAllMarked(start, end) ||
        (data.aMultiSelContainer[col] as ScMarkArray).IsAllMarked(start, end)
      )
        return true;
      const iterator = new ScMultiSelIter(this, col),
        range = { mnRow1: 0, mnRow2: 0, mbValue: false };
      const found = iterator.GetRangeData(start, range);
      return found && range.mbValue && range.mnRow2 >= end;
    }
    if (one) return data.aRowSel.IsAllMarked(start, end);
    return (data.aMultiSelContainer[col] as ScMarkArray).IsAllMarked(start, end);
  }
  /** Compares raw column arrays independently of global row marks. @param first - Column one. @param second - Column two. @returns Original equality. */
  public HasEqualRowsMarked(first: SCCOL, second: SCCOL): boolean {
    first = (first << 16) >> 16;
    second = (second << 16) >> 16;
    const columns = stateOf(this).aMultiSelContainer,
      size = (columns.length << 16) >> 16;
    const one = first < size,
      two = second < size;
    if (one || two) {
      if (one && two) return (columns[first] as ScMarkArray).equals(columns[second] as ScMarkArray);
      if (one) return !(columns[first] as ScMarkArray).HasMarks();
      return !(columns[second] as ScMarkArray).HasMarks();
    }
    return true;
  }
  /** Retains the original missing-column comparison against the row array. @param last - Last column. @param min - Inclusive minimum, default zero. @returns First equal column. */
  public GetStartOfEqualColumns(last: SCCOL, min: SCCOL = 0): SCCOL {
    last = (last << 16) >> 16;
    min = (min << 16) >> 16;
    const data = stateOf(this),
      columns = data.aMultiSelContainer,
      size = (columns.length << 16) >> 16;
    if (min > last) return min;
    if (last >= size) {
      if (min >= size) return min;
      let col = size - 1;
      while (col >= min && (columns[col] as ScMarkArray).equals(data.aRowSel)) --col;
      return col + 1;
    }
    let col = last - 1;
    while (col >= min && (columns[col] as ScMarkArray).equals(columns[last] as ScMarkArray)) --col;
    return col + 1;
  }
  /** Finds the nearer original row/column mark with native absent sentinels. @param col - Column. @param row - Starting row. @param up - Upward. @returns Next row. */
  public GetNextMarked(col: SCCOL, row: SCROW, up: boolean): SCROW {
    col = (col << 16) >> 16;
    row |= 0;
    const data = stateOf(this),
      columns = data.aMultiSelContainer;
    if (col >= (columns.length << 16) >> 16 || !(columns[col] as ScMarkArray).HasMarks())
      return data.aRowSel.GetNextMarked(row, up);
    let first = data.aRowSel.GetNextMarked(row, up),
      second = (columns[col] as ScMarkArray).GetNextMarked(row, up);
    if (first === second) return first;
    if (first === -1) return second;
    if (second === -1) return first;
    if (first > second) [first, second] = [second, first];
    return up ? second : first;
  }
  /** Resizes to the original full column count and marks every column separately. @param start - First row. @param end - Last row. @returns Nothing. */
  public MarkAllCols(start: SCROW, end: SCROW): void {
    start |= 0;
    end |= 0;
    const data = stateOf(this);
    resize(data.aMultiSelContainer, data.mrSheetLimits.mnMaxCol + 1, data.mrSheetLimits);
    for (let col = data.mrSheetLimits.mnMaxCol; col >= 0; --col)
      (data.aMultiSelContainer[col] as ScMarkArray).SetMarkArea(start, end, true);
  }
  /** Updates full-row or per-column marks with original row migration before partial deselection. @param startCol - First column. @param endCol - Last column. @param startRow - First row. @param endRow - Last row. @param marked - Selected. @returns Nothing. */
  public SetMarkArea(
    startCol: SCCOL,
    endCol: SCCOL,
    startRow: SCROW,
    endRow: SCROW,
    marked: boolean,
  ): void {
    startCol = (startCol << 16) >> 16;
    endCol = (endCol << 16) >> 16;
    startRow |= 0;
    endRow |= 0;
    const data = stateOf(this),
      limits = data.mrSheetLimits,
      columns = data.aMultiSelContainer;
    if (startCol === 0 && endCol === limits.mnMaxCol) {
      data.aRowSel.SetMarkArea(startRow, endRow, marked);
      if (!marked)
        for (const array of columns)
          if (array.HasMarks()) array.SetMarkArea(startRow, endRow, false);
      return;
    }
    if (!marked && data.aRowSel.HasMarks()) {
      let begin: SCROW,
        last = endRow;
      if (data.aRowSel.GetMark(startRow)) {
        begin = startRow;
        last = data.aRowSel.GetMarkEnd(startRow, false);
      } else {
        begin = data.aRowSel.GetNextMarked(startRow, false);
        if (begin !== limits.GetMaxRowCount()) last = data.aRowSel.GetMarkEnd(begin, false);
      }
      if (begin !== limits.GetMaxRowCount() && last >= endRow && begin <= endRow)
        this.MarkAllCols(begin, endRow);
      else {
        while (begin !== limits.GetMaxRowCount() && last < endRow) {
          this.MarkAllCols(begin, last);
          begin = data.aRowSel.GetNextMarked(last + 1, false);
          if (begin !== limits.GetMaxRowCount()) last = data.aRowSel.GetMarkEnd(begin, false);
        }
        if (begin !== limits.GetMaxRowCount() && last >= endRow && begin <= endRow)
          this.MarkAllCols(begin, endRow);
      }
      data.aRowSel.SetMarkArea(startRow, endRow, false);
    }
    if (endCol >= (columns.length << 16) >> 16) resize(columns, endCol + 1, limits);
    for (let col = endCol; col >= startCol; --col)
      (columns[col] as ScMarkArray).SetMarkArea(startRow, endRow, marked);
  }
  /** Initializes raw per-column entries from a row-sorted range-list copy, without adding terminal boundaries. @param list - Original initialized range list. @returns Nothing. */
  public Set(list: ScRangeList): void {
    this.Clear();
    if (list.empty()) return;
    // std::sort does not prescribe an equal-key permutation. JS sort retains
    // the same row comparator; platform-specific equal-key order is uncertified.
    const sorted = [...new ScRangeList(list)].sort(
      /** Orders by start row only. @param lhs - First range. @param rhs - Second range. @returns Comparator order. */
      (lhs, rhs) => lhs.aStart.Row() - rhs.aStart.Row(),
    );
    const data = stateOf(this),
      limits = data.mrSheetLimits;
    const perCol: ScMarkEntry[][] = Array.from(
      { length: limits.mnMaxCol + 1 },
      /** Constructs independent native temporary vectors. @returns Entries. */ () => [],
    );
    let maxCol = -1;
    for (const range of sorted) {
      const startCol = range.aStart.Col(),
        endCol = range.aEnd.Col(),
        startRow = range.aStart.Row(),
        endRow = range.aEnd.Row();
      if (endRow < startRow)
        throw new Error(
          "Assertion failed: this method assumes the input data has ranges with endrow>=startrow",
        );
      if (endCol < startCol)
        throw new Error(
          "Assertion failed: this method assumes the input data has ranges with endcol>=startcol",
        );
      if (startCol === 0 && endCol === limits.mnMaxCol)
        data.aRowSel.SetMarkArea(startRow, endRow, true);
      else {
        for (let col = startCol; col <= endCol; ++col) {
          const entries = perCol[col] as ScMarkEntry[],
            count = entries.length;
          if (
            count > 1 &&
            startRow >= (entries[count - 2] as ScMarkEntry).nRow + 1 &&
            startRow <= (entries[count - 1] as ScMarkEntry).nRow + 1
          )
            (entries[count - 1] as ScMarkEntry).nRow = Math.max(
              endRow,
              (entries[count - 1] as ScMarkEntry).nRow,
            );
          else {
            if (startRow > 0) entries.push(new ScMarkEntry(startRow - 1, false));
            entries.push(new ScMarkEntry(endRow, true));
          }
        }
        maxCol = Math.max(maxCol, endCol);
      }
    }
    resize(data.aMultiSelContainer, maxCol + 1, limits);
    for (let col = 0; col <= maxCol; ++col)
      if ((perCol[col] as ScMarkEntry[]).length)
        (data.aMultiSelContainer[col] as ScMarkArray).Set(perCol[col] as ScMarkEntry[]);
  }
  /** Reads only global row marks. @param row - Row. @returns Marked. */
  public IsRowMarked(row: SCROW): boolean {
    return stateOf(this).aRowSel.GetMark(row);
  }
  /** Reads original row interval end after a successful start. @param start - First row. @param end - Last row. @returns Row range marked. */
  public IsRowRangeMarked(start: SCROW, end: SCROW): boolean {
    start |= 0;
    end |= 0;
    const rows = stateOf(this).aRowSel;
    if (!rows.GetMark(start)) return false;
    return rows.GetMarkEnd(start, false) >= end;
  }
  /** Distinguishes allocated empty column storage from no storage. @returns Original emptiness. */
  public IsEmpty(): boolean {
    const data = stateOf(this);
    return data.aMultiSelContainer.length === 0 && !data.aRowSel.HasMarks();
  }
  /** Builds an independent normalized mark array through the original union iterator. @param col - Column. @returns Array value. */
  public GetMarkArray(col: SCCOL): ScMarkArray {
    const iterator = new ScMultiSelIter(this, col),
      array = new ScMarkArray(stateOf(this).mrSheetLimits);
    for (let result = iterator.Next(0, 0); result[0]; result = iterator.Next(0, 0))
      array.SetMarkArea(result[1], result[2], true);
    return array;
  }
  /** Reports any row or column marks without interpreting allocation as marks. @returns Any marks. */
  public HasAnyMarks(): boolean {
    const data = stateOf(this);
    if (data.aRowSel.HasMarks()) return true;
    for (const array of data.aMultiSelContainer) if (array.HasMarks()) return true;
    return false;
  }
  /** Retains original insertion/erase count, including the trailing-entry deletion boundary. @param start - First column. @param offset - Signed32 displacement. @returns Nothing. */
  public ShiftCols(start: SCCOL, offset: number): void {
    start = (start << 16) >> 16;
    offset |= 0;
    const data = stateOf(this),
      columns = data.aMultiSelContainer,
      size = (columns.length << 16) >> 16;
    if (start > data.mrSheetLimits.mnMaxCol || start >= size) return;
    if (offset > 0) {
      insertColumns(columns, start, offset, data.mrSheetLimits);
    } else {
      const count = start - offset >= size ? size - start - 1 : -offset;
      eraseColumns(columns, start, count);
    }
  }
  /** Delegates original signed32 displacement to each actual signed30 mark-array owner. @param start - First row. @param offset - Displacement. @returns Nothing. */
  public ShiftRows(start: SCROW, offset: number): void {
    start |= 0;
    offset |= 0;
    const data = stateOf(this);
    for (const array of data.aMultiSelContainer) array.Shift(start, offset);
    data.aRowSel.Shift(start, offset);
  }
  /** Borrows the original row owner. @returns Row selection. */
  public GetRowSelArray(): ScMarkArray {
    return stateOf(this).aRowSel;
  }
  /** Borrows existing raw column storage or the native null pointer. @param col - Column. @returns Array or null. */
  public GetMultiSelArray(col: SCCOL): ScMarkArray | null {
    col = (col << 16) >> 16;
    const columns = stateOf(this).aMultiSelContainer;
    if (col >= (columns.length << 16) >> 16) return null;
    return columns[col] as ScMarkArray;
  }
}

/** Original iterator: two-source snapshot segments or a borrowed single mark-array cursor. */
export class ScMultiSelIter {
  private pRowSegs: ScFlatBoolRowSegments | null = null;
  private readonly aMarkArrayIter = new ScMarkArrayIter(null);
  private nNextSegmentStart = 0;
  /** Selects the original ownership mode from current marks. @param selection - Owner. @param col - Column. @returns Iterator. */
  public constructor(selection: ScMultiSel, col: SCCOL) {
    col = (col << 16) >> 16;
    const data = stateOf(selection),
      one = data.aRowSel.HasMarks();
    const two =
      col < (data.aMultiSelContainer.length << 16) >> 16 &&
      (data.aMultiSelContainer[col] as ScMarkArray).HasMarks();
    if (one && two) {
      this.pRowSegs = new ScFlatBoolRowSegments(data.mrSheetLimits.mnMaxRow);
      this.pRowSegs.setFalse(0, data.mrSheetLimits.mnMaxRow);
      for (const array of [data.aRowSel, data.aMultiSelContainer[col] as ScMarkArray]) {
        const iterator = new ScMarkArrayIter(array);
        for (let result = iterator.Next(0, 0); result[0]; result = iterator.Next(0, 0))
          this.pRowSegs.setTrue(result[1], result[2]);
      }
    } else if (one) this.aMarkArrayIter.reset(data.aRowSel);
    else if (two) this.aMarkArrayIter.reset(data.aMultiSelContainer[col] as ScMarkArray);
  }
  /** Reads the next selected interval and preserves failed caller outputs. @param top - Existing top. @param bottom - Existing bottom. @returns Found and rows. */
  public Next(top: SCROW, bottom: SCROW): [boolean, SCROW, SCROW] {
    top |= 0;
    bottom |= 0;
    if (this.pRowSegs) {
      const range = { mnRow1: 0, mnRow2: 0, mbValue: false };
      let found = this.pRowSegs.getRangeData(this.nNextSegmentStart, range);
      if (found && !range.mbValue) {
        this.nNextSegmentStart = range.mnRow2 + 1;
        found = this.pRowSegs.getRangeData(this.nNextSegmentStart, range);
      }
      if (found) {
        top = range.mnRow1;
        bottom = range.mnRow2;
        this.nNextSegmentStart = bottom + 1;
      }
      return [found, top, bottom];
    }
    return this.aMarkArrayIter.Next(top, bottom);
  }
  /** Requires the original two-source segment mode. @param row - Query. @param range - Mutable output. @returns Found. */
  public GetRangeData(row: SCROW, range: ScFlatBoolRowRangeData): boolean {
    if (!this.pRowSegs) throw new Error("Assertion failed: pRowSegs");
    return this.pRowSegs.getRangeData(row, range);
  }
}
