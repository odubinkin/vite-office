/** @fileoverview Numerical ScRangeList contracts and fragment helpers from pinned sc/source/core/tool/rangelst.cxx. */
import { ScAddress, ScRange } from "../../../inc/address";
import type { SCSIZE } from "../../../inc/address";
import { UpdateRefMode } from "../../../inc/global";
import type { SCCOL, SCROW, SCTAB } from "../../../inc/types";
import { ScRefUpdate, ScRefUpdateRes } from "../inc/refupdat";
import type { ScRefUpdateDocument } from "../inc/refupdat";

/** Original ordered range value list with the upstream maximum-row append cache. */
export class ScRangeList implements Iterable<ScRange> {
  private maRanges: ScRange[] = [];
  private mnMaxRowUsed: SCROW = -1;

  /** Constructs empty, copied or singleton storage. @param source - Existing values. @returns New list. */
  public constructor(source?: ScRangeList | ScRange) {
    if (source instanceof ScRangeList) this.assign(source);
    else if (source) this.push_back(source);
  }
  /** Copies list values and the original row cache. @param source - Source. @returns Recipient. */
  public assign(source: ScRangeList): this {
    this.maRanges = source.maRanges.map(
      /** Copies one value. @param range - Source. @returns Independent range. */ (range) =>
        new ScRange(range),
    );
    this.mnMaxRowUsed = source.mnMaxRowUsed;
    return this;
  }
  /** Reads native emptiness. @returns Whether empty. */
  public empty(): boolean {
    return this.maRanges.length === 0;
  }
  /** Reads native count. @returns Range count. */
  public size(): SCSIZE {
    return this.maRanges.length;
  }
  /** Represents native operator[] for valid indices. @param index - Existing index. @returns Borrowed mutable value. */
  public at(index: SCSIZE): ScRange {
    return this.maRanges[index] as ScRange;
  }
  /** Reads first value of nonempty storage. @returns Borrowed range. */
  public front(): ScRange {
    return this.at(0);
  }
  /** Reads last value of nonempty storage. @returns Borrowed range. */
  public back(): ScRange {
    return this.at(this.maRanges.length - 1);
  }
  /** Iterates borrowed range values. @returns Iterator. */
  public [Symbol.iterator](): ArrayIterator<ScRange> {
    return this.maRanges.values();
  }
  /** Inserts copied values without updating the native append cache. @param position - Vector insertion index. @param source - Source values. @returns Nothing. */
  public insert(position: SCSIZE, source: Iterable<ScRange>): void {
    const values = Array.from(
      source,
      /** Copies one vector value. @param range - Source. @returns Independent range. */ (range) =>
        new ScRange(range),
    );
    this.maRanges = [
      ...this.maRanges.slice(0, position),
      ...values,
      ...this.maRanges.slice(position),
    ];
  }
  /** Appends a copied range and raises the maximum-row cache. @param range - Value. @returns Nothing. */
  public push_back(range: ScRange): void {
    this.maRanges.push(new ScRange(range));
    if (this.mnMaxRowUsed < range.aEnd.Row()) this.mnMaxRowUsed = range.aEnd.Row();
  }
  /** Removes an existing index, retaining the original cache. @param position - Index. @returns Nothing. */
  public Remove(position: SCSIZE): void {
    if (this.maRanges.length <= position) return;
    this.maRanges.splice(position, 1);
  }
  /** Clears values and resets the cache. @returns Nothing. */
  public RemoveAll(): void {
    this.maRanges.length = 0;
    this.mnMaxRowUsed = -1;
  }
  /** Swaps both native storage members. @param other - Opposite owner. @returns Nothing. */
  public swap(other: ScRangeList): void {
    [this.maRanges, other.maRanges] = [other.maRanges, this.maRanges];
    [this.mnMaxRowUsed, other.mnMaxRowUsed] = [other.mnMaxRowUsed, this.mnMaxRowUsed];
  }
  /** Compares ordered values; cache does not participate. @param other - List. @returns Equality. */
  public equals(other: ScRangeList): boolean {
    if (this === other) return true;
    return (
      this.maRanges.length === other.maRanges.length &&
      this.maRanges.every(
        /** Compares one vector position. @param range - Value. @param index - Position. @returns Equality. */ (
          range,
          index,
        ) => range.equals(other.at(index)),
      )
    );
  }
  /** Finds the first enclosing range. @param address - Address. @returns Borrowed range or null. */
  public Find(address: ScAddress): ScRange | null {
    return (
      this.maRanges.find(
        /** Checks original containment. @param range - Value. @returns Containment. */ (range) =>
          range.Contains(address),
      ) ?? null
    );
  }
  /** Tests any single enclosing range, without combining list coverage. @param range - Test range. @returns Containment. */
  public Contains(range: ScRange): boolean {
    return this.maRanges.some(
      /** Tests one enclosing range. @param current - Value. @returns Containment. */ (current) =>
        current.Contains(range),
    );
  }
  /** Tests any intersecting range. @param range - Test range. @returns Intersection. */
  public Intersects(range: ScRange): boolean {
    return this.maRanges.some(
      /** Tests one intersection. @param current - Value. @returns Intersection. */ (current) =>
        current.Intersects(range),
    );
  }
  /** Counts every range independently with native unsigned64 accumulation. @returns Exact cell count including overlaps. */
  public GetCellCount(): bigint {
    let count = 0n;
    for (const range of this.maRanges) {
      const [col1, row1, tab1, col2, row2, tab2] = range.GetVars();
      count = BigInt.asUintN(
        64,
        count +
          BigInt.asUintN(64, BigInt(col2 - col1 + 1)) *
            BigInt.asUintN(64, BigInt(row2 - row1 + 1)) *
            BigInt.asUintN(64, BigInt(tab2 - tab1 + 1)),
      );
    }
    return count;
  }
  /** Combines bounds without sorting raw endpoint values. @returns Independent range; zero range when empty. */
  public Combine(): ScRange {
    if (this.empty()) return new ScRange();
    const result = new ScRange(this.at(0));
    for (let index = 1; index < this.maRanges.length; ++index) {
      const range = this.at(index);
      if (result.aStart.Row() > range.aStart.Row()) result.aStart.SetRow(range.aStart.Row());
      if (result.aStart.Col() > range.aStart.Col()) result.aStart.SetCol(range.aStart.Col());
      if (result.aStart.Tab() > range.aStart.Tab()) result.aStart.SetTab(range.aStart.Tab());
      if (result.aEnd.Row() < range.aEnd.Row()) result.aEnd.SetRow(range.aEnd.Row());
      if (result.aEnd.Col() < range.aEnd.Col()) result.aEnd.SetCol(range.aEnd.Col());
      if (result.aEnd.Tab() < range.aEnd.Tab()) result.aEnd.SetTab(range.aEnd.Tab());
    }
    return result;
  }
  /** Finds the earliest start in native sheet,column,row order. @returns Independent address; zero when empty. */
  public GetTopLeftCorner(): ScAddress {
    if (this.empty()) return new ScAddress();
    let address = this.at(0).aStart;
    for (let index = 1; index < this.maRanges.length; ++index)
      if (this.at(index).aStart.compare(address) < 0) address = this.at(index).aStart;
    return new ScAddress(address);
  }
  /** Joins each independently clipped intersection in original iteration order. @param range - Clip range. @returns Independent list. */
  public GetIntersectedRange(range: ScRange): ScRangeList {
    const result = new ScRangeList();
    for (const current of this.maRanges) {
      if (current.Intersects(range)) {
        const [col1, row1, tab1, col2, row2, tab2] = current.GetVars();
        const [clipCol1, clipRow1, clipTab1, clipCol2, clipRow2, clipTab2] = range.GetVars();
        result.Join(
          new ScRange(
            Math.max(col1, clipCol1),
            Math.max(row1, clipRow1),
            Math.max(tab1, clipTab1),
            Math.min(col2, clipCol2),
            Math.min(row2, clipRow2),
            Math.min(tab2, clipTab2),
          ),
        );
      }
    }
    return result;
  }
  /** Joins by original containment, matching-axis adjacency and restart order. @param newRange - Source or borrowed list range. @param isInList - Whether source is already owned here. @returns Nothing. */
  public Join(newRange: ScRange, isInList = false): void {
    if (this.empty()) {
      this.push_back(newRange);
      return;
    }
    if (!isInList) {
      const row1 = newRange.aStart.Row();
      if (row1 > this.mnMaxRowUsed + 1) {
        this.push_back(newRange);
        return;
      } else if (row1 === this.mnMaxRowUsed + 1) {
        const last = this.back();
        if (
          last.aEnd.Row() + 1 === row1 &&
          last.aStart.Col() === newRange.aStart.Col() &&
          last.aEnd.Col() === newRange.aEnd.Col() &&
          last.aStart.Tab() === newRange.aStart.Tab() &&
          last.aEnd.Tab() === newRange.aEnd.Tab()
        ) {
          last.aEnd.SetRow(newRange.aEnd.Row());
          this.mnMaxRowUsed = newRange.aEnd.Row();
          return;
        }
      }
    }
    let joinedInput = false;
    let over = newRange;
    let restart = true;
    while (restart) {
      restart = false;
      const [col1, row1, tab1, col2, row2, tab2] = over.GetVars();
      let overPosition = -1;
      for (let index = 0; index < this.maRanges.length; ++index) {
        const range = this.at(index);
        if (range === over) {
          overPosition = index;
          continue;
        }
        let joined = false;
        if (range.Contains(over)) {
          if (isInList) joined = true;
          else {
            joinedInput = true;
            break;
          }
        } else if (over.Contains(range)) {
          range.assign(over);
          joined = true;
        }
        if (!joined && range.aStart.Tab() === tab1 && range.aEnd.Tab() === tab2) {
          if (range.aStart.Col() === col1 && range.aEnd.Col() === col2) {
            if (range.aStart.Row() <= row2 + 1 && range.aStart.Row() >= row1) {
              range.aStart.SetRow(row1);
              joined = true;
            } else if (range.aEnd.Row() >= row1 - 1 && range.aEnd.Row() <= row2) {
              range.aEnd.SetRow(row2);
              joined = true;
            }
          } else if (range.aStart.Row() === row1 && range.aEnd.Row() === row2) {
            if (range.aStart.Col() <= col2 + 1 && range.aStart.Col() >= col1) {
              range.aStart.SetCol(col1);
              joined = true;
            } else if (range.aEnd.Col() >= col1 - 1 && range.aEnd.Col() <= col2) {
              range.aEnd.SetCol(col2);
              joined = true;
            }
          }
        }
        if (joined) {
          if (isInList) {
            if (overPosition !== -1) {
              this.Remove(overPosition);
              // The scan has already passed overPosition, so it is strictly below index.
              --index;
            } else {
              for (let pos = 0; pos < this.maRanges.length; ++pos)
                if (this.at(pos) === over) {
                  this.Remove(pos);
                  break;
                }
            }
          }
          joinedInput = true;
          over = this.at(index);
          isInList = true;
          restart = true;
          break;
        }
      }
    }
    if (!isInList && !joinedInput) this.push_back(newRange);
  }
  /** Performs the original two-row backward partial combine. @param newRange - Source. @returns Nothing. */
  public AddAndPartialCombine(newRange: ScRange): void {
    if (this.empty()) {
      this.push_back(newRange);
      return;
    }
    const row1 = newRange.aStart.Row();
    if (row1 > this.mnMaxRowUsed + 1) {
      this.push_back(newRange);
      return;
    }
    for (
      let index = this.maRanges.length - 1;
      index >= 0 && this.at(index).aStart.Row() >= row1 - 2;
      --index
    ) {
      const last = this.at(index);
      if (
        last.aEnd.Row() + 1 === row1 &&
        last.aStart.Col() === newRange.aStart.Col() &&
        last.aEnd.Col() === newRange.aEnd.Col() &&
        last.aStart.Tab() === newRange.aStart.Tab() &&
        last.aEnd.Tab() === newRange.aEnd.Tab()
      ) {
        last.aEnd.SetRow(newRange.aEnd.Row());
        this.mnMaxRowUsed = Math.max(this.mnMaxRowUsed, newRange.aEnd.Row());
        return;
      }
    }
    this.push_back(newRange);
  }
  /** Updates original ordered references after pre-deletion and before backward joins. @param mode - Native update mode. @param document - Existing document getters. @param where - Affected area. @param rawDx - Column displacement. @param rawDy - Row displacement. @param rawDz - Sheet displacement. @returns Original change result, including deletion-result overwrite. */
  public UpdateReference(
    mode: UpdateRefMode,
    document: ScRefUpdateDocument,
    where: ScRange,
    rawDx: SCCOL,
    rawDy: SCROW,
    rawDz: SCTAB,
  ): boolean {
    if (this.maRanges.length === 0) return false;
    const dx = (rawDx << 16) >> 16,
      dy = rawDy | 0,
      dz = (rawDz << 16) >> 16;
    let changed = false;
    const [col1, row1, tab1, col2, row2, tab2] = where.GetVars();
    if (mode === UpdateRefMode.URM_INSDEL) {
      if (tab1 === tab2) {
        if (dx < 0)
          changed = this.DeleteArea(
            ((col1 + dx) << 16) >> 16,
            row1,
            tab1,
            ((col1 - 1) << 16) >> 16,
            row2,
            tab2,
          );
        if (dy < 0) changed = this.DeleteArea(col1, row1 + dy, tab1, col2, row1 - 1, tab2);
      }
    }
    if (this.maRanges.length === 0) return true;
    for (const range of this.maRanges) {
      const [result, firstCol, firstRow, firstTab, lastCol, lastRow, lastTab] = ScRefUpdate.Update(
        document,
        mode,
        col1,
        row1,
        tab1,
        col2,
        row2,
        tab2,
        dx,
        dy,
        dz,
        ...range.GetVars(),
      );
      if (result !== ScRefUpdateRes.UR_NOTHING) {
        changed = true;
        range.aStart.Set(firstCol, firstRow, firstTab);
        range.aEnd.Set(lastCol, lastRow, lastTab);
        if (this.mnMaxRowUsed < lastRow) this.mnMaxRowUsed = lastRow;
      }
    }
    if (mode === UpdateRefMode.URM_INSDEL) {
      if (dx < 0 || dy < 0) {
        for (let index = this.maRanges.length - 1; index > 0;) {
          this.Join(this.at(index), true);
          if (index >= this.maRanges.length) index = this.maRanges.length - 1;
          else --index;
        }
      }
    }
    return changed;
  }
  /** Extends row ends through the original OR overlap predicate and deferred Join. @param tab - Sheet. @param colStart - First column. @param colEnd - Last column. @param rowPosition - Inserted first row. @param size - Row count. @returns Nothing. */
  public InsertRow(
    tab: SCTAB,
    colStart: SCCOL,
    colEnd: SCCOL,
    rowPosition: SCROW,
    size: SCSIZE,
  ): void {
    const newRanges: ScRange[] = [];
    for (const range of this.maRanges) {
      if (range.aStart.Tab() <= tab && range.aEnd.Tab() >= tab) {
        if (
          range.aEnd.Row() === rowPosition - 1 &&
          (colStart <= range.aEnd.Col() || colEnd >= range.aStart.Col())
        ) {
          const endRow = (rowPosition + size - 1) | 0;
          newRanges.push(
            new ScRange(
              Math.max(colStart, range.aStart.Col()),
              range.aEnd.Row() + 1,
              tab,
              Math.min(colEnd, range.aEnd.Col()),
              endRow,
              tab,
            ),
          );
          if (this.mnMaxRowUsed < endRow) this.mnMaxRowUsed = endRow;
        }
      }
    }
    for (const range of newRanges) {
      if (!range.IsValid()) continue;
      this.Join(range);
    }
  }
  /** Retains both native column insertion overloads and deferred Join. @param args - Sheet,column or sheet,rowStart,rowEnd,column,count. @returns Nothing. */
  public InsertCol(...args: [SCTAB, SCCOL] | [SCTAB, SCROW, SCROW, SCCOL, SCSIZE]): void {
    const newRanges: ScRange[] = [];
    const tab = args[0];
    for (const range of this.maRanges) {
      if (range.aStart.Tab() <= tab && range.aEnd.Tab() >= tab) {
        if (args.length === 2) {
          const col = args[1];
          if (range.aEnd.Col() === col - 1)
            newRanges.push(
              new ScRange(
                range.aEnd.Col() + 1,
                range.aStart.Row(),
                tab,
                col,
                range.aEnd.Row(),
                tab,
              ),
            );
        } else {
          const [, rowStart, rowEnd, colPosition, size] = args;
          if (
            range.aEnd.Col() === colPosition - 1 &&
            (rowStart <= range.aEnd.Row() || rowEnd >= range.aStart.Row())
          )
            newRanges.push(
              new ScRange(
                range.aEnd.Col() + 1,
                Math.max(rowStart, range.aStart.Row()),
                tab,
                colPosition + size - 1,
                Math.min(rowEnd, range.aEnd.Row()),
                tab,
              ),
            );
        }
      }
    }
    for (const range of newRanges) {
      if (!range.IsValid()) continue;
      this.Join(range);
    }
  }
  /** Deletes with the original ordered one/two/three/four-fragment handlers; deleting sheets are assumed equal upstream. @param args - Native six coordinates. @returns Whether changed. */
  public DeleteArea(...args: [SCCOL, SCROW, SCTAB, SCCOL, SCROW, SCTAB]): boolean {
    let changed = false;
    const deleting = new ScRange(...args);
    for (let index = 0; index < this.maRanges.length;) {
      if (deleting.Contains(this.at(index))) {
        this.Remove(index);
        changed = true;
      } else ++index;
    }
    const newRanges: ScRange[] = [];
    for (const range of this.maRanges) {
      if (!range.Intersects(deleting)) continue;
      if (handleOneRange(deleting, range)) {
        changed = true;
        continue;
      } else if (handleTwoRanges(deleting, range, newRanges)) {
        changed = true;
        continue;
      } else if (handleThreeRanges(deleting, range, newRanges)) {
        changed = true;
        continue;
      } else {
        handleFourRanges(deleting, range, newRanges);
        changed = true;
        continue;
      }
    }
    for (const range of newRanges) this.Join(range);
    return changed;
  }
}

/** Checks the original one-fragment span predicate. @param dx1 - Deleting first X. @param dx2 - Deleting last X. @param dy1 - Deleting first Y. @param dy2 - Deleting last Y. @param x1 - Original first X. @param x2 - Original last X. @param y1 - Original first Y. @param y2 - Original last Y. @returns Predicate. */
function checkForOneRange(
  dx1: number,
  dx2: number,
  dy1: number,
  dy2: number,
  x1: number,
  x2: number,
  y1: number,
  y2: number,
): boolean {
  return dx1 <= x1 && x2 <= dx2 && (dy1 <= y1 || y2 <= dy2);
}
/** Retains native one-fragment trimming, including deleting start-row plus1. @param deleting - Delete range. @param range - Mutable value. @returns Whether handled. */
function handleOneRange(deleting: ScRange, range: ScRange): boolean {
  const [dc1, dr1, , dc2, dr2] = deleting.GetVars();
  const [c1, r1, , c2, r2] = range.GetVars();
  if (checkForOneRange(dc1, dc2, dr1, dr2, c1, c2, r1, r2)) {
    if (dr1 <= r1) {
      range.aStart.SetRow(dr1 + 1);
      return true;
    } else {
      // checkForOneRange already guarantees r2 <= dr2 here.
      range.aEnd.SetRow(dr1 - 1);
      return true;
    }
  } else if (checkForOneRange(dr1, dr2, dc1, dc2, r1, r2, c1, c2)) {
    if (dc1 <= c1) {
      range.aStart.SetCol(dc2 + 1);
      return true;
    } else {
      // checkForOneRange already guarantees c2 <= dc2 here.
      range.aEnd.SetCol(dc1 - 1);
      return true;
    }
  }
  return false;
}
/** Retains native corner and full-span two-fragment splitting. @param deleting - Delete range. @param range - Mutable value. @param added - Deferred fragments. @returns Whether handled. */
function handleTwoRanges(deleting: ScRange, range: ScRange, added: ScRange[]): boolean {
  const [dc1, dr1, , dc2, dr2] = deleting.GetVars();
  const [c1, r1, tab, c2, r2, endTab] = range.GetVars();
  if (c1 < dc1 && dc1 <= c2 && c2 <= dc2) {
    if (r1 < dr1 && dr1 <= r2 && r2 <= dr2) {
      added.push(new ScRange(c1, dr1, tab, dc1 - 1, r2, tab));
      range.aEnd.SetRow(dr1 - 1);
      return true;
    } else if (r1 <= dr2 && dr2 < r2 && dr1 <= r1) {
      added.push(new ScRange(new ScAddress(c1, r1, tab), new ScAddress(dc1 - 1, r2, tab)));
      range.aStart.SetRow(dr2 + 1);
      return true;
    }
  } else if (c1 <= dc2 && dc2 < c2 && dc1 <= c1) {
    if (r1 < dr1 && dr1 <= r2 && r2 <= dr2) {
      added.push(new ScRange(new ScAddress(dc2 + 1, dr1, tab), new ScAddress(c2, r2, endTab)));
      range.aEnd.SetRow(dr1 - 1);
      return true;
    } else if (r1 <= dr2 && dr2 < r2 && dr1 <= r1) {
      added.push(new ScRange(dc2 + 1, r1, tab, c2, dr2, tab));
      range.aStart.SetRow(dr2 + 1);
      return true;
    }
  } else if (r1 < dr1 && dr2 < r2 && dc1 <= c1 && c2 <= dc2) {
    added.push(new ScRange(new ScAddress(c1, r1, tab), new ScAddress(c2, dr1 - 1, tab)));
    range.aStart.SetRow(dr2 + 1);
    return true;
  } else if (c1 < dc1 && dc2 < c2 && dr1 <= r1 && r2 <= dr2) {
    added.push(new ScRange(new ScAddress(c1, r1, tab), new ScAddress(dc1 - 1, r2, tab)));
    range.aStart.SetCol(dc2 + 1);
    return true;
  }
  return false;
}
/** Checks the original three-fragment span predicate. @param dx1 - Deleting first X. @param dx2 - Deleting last X. @param dy1 - Deleting first Y. @param dy2 - Deleting last Y. @param x1 - Original first X. @param x2 - Original last X. @param y1 - Original first Y. @param y2 - Original last Y. @returns Predicate. */
function checkForThreeRanges(
  dx1: number,
  dx2: number,
  dy1: number,
  dy2: number,
  x1: number,
  x2: number,
  y1: number,
  y2: number,
): boolean {
  if (x1 <= dx1 && x2 <= dx2 && y1 < dy1 && dy2 < y2) return true;
  if (dx1 <= x1 && dx2 <= x2 && y1 < dy1 && dy2 < y2) return true;
  return false;
}
/** Retains native edge-overlapping three-fragment splitting. @param deleting - Delete range. @param range - Mutable value. @param added - Deferred fragments. @returns Whether handled. */
function handleThreeRanges(deleting: ScRange, range: ScRange, added: ScRange[]): boolean {
  const [dc1, dr1, , dc2, dr2] = deleting.GetVars();
  const [c1, r1, tab, c2, r2, endTab] = range.GetVars();
  if (checkForThreeRanges(dc1, dc2, dr1, dr2, c1, c2, r1, r2)) {
    if (c1 < dc1) {
      added.push(new ScRange(dc1, r1, tab, c2, dr1 - 1, tab));
      added.push(new ScRange(new ScAddress(dc1, dr2 + 1, tab), new ScAddress(c2, r2, endTab)));
      range.aEnd.SetCol(dc1 - 1);
    } else {
      added.push(new ScRange(new ScAddress(c1, r1, tab), new ScAddress(dc2, dr1 - 1, tab)));
      added.push(new ScRange(c1, dr2 + 1, tab, dc2, r2, tab));
      range.aStart.SetCol(dc2 + 1);
    }
    return true;
  } else if (checkForThreeRanges(dr1, dr2, dc1, dc2, r1, r2, c1, c2)) {
    if (r1 < dr1) {
      added.push(new ScRange(c1, dr1, tab, dc1 - 1, r2, tab));
      added.push(new ScRange(new ScAddress(dc2 + 1, dr1, tab), new ScAddress(c2, r2, endTab)));
      range.aEnd.SetRow(dr1 - 1);
    } else {
      added.push(new ScRange(new ScAddress(c1, r1, tab), new ScAddress(dc1 - 1, dr2, tab)));
      added.push(new ScRange(dc2 + 1, r1, tab, c2, dr2, tab));
      range.aStart.SetRow(dr2 + 1);
    }
    return true;
  }
  return false;
}
/** Retains native interior four-fragment splitting and append order. @param deleting - Delete range. @param range - Mutable value. @param added - Deferred fragments. @returns Whether handled. */
function handleFourRanges(deleting: ScRange, range: ScRange, added: ScRange[]): boolean {
  const [dc1, dr1, , dc2, dr2] = deleting.GetVars();
  const [c1, , tab, c2, r2, endTab] = range.GetVars();
  // DeleteArea has proved intersection and excluded containment and all edge splits.
  // The remaining rectangle is strictly interior on both axes, as in the native guard.
  added.push(new ScRange(new ScAddress(c1, dr2 + 1, tab), new ScAddress(c2, r2, endTab)));
  added.push(new ScRange(c1, dr1, tab, dc1 - 1, dr2, tab));
  added.push(new ScRange(dc2 + 1, dr1, tab, c2, dr2, tab));
  range.aEnd.SetRow(dr1 - 1);
  return true;
}
