/** @fileoverview Original segmenttree.cxx boolean and UInt16 segment owners over the shared mdds leaf/index implementation. */
import { flat_segment_tree } from "../../../../external/mdds/include/mdds/flat_segment_tree";
import { const_iterator } from "../../../../external/mdds/include/mdds/flat_segment_tree_itr";
import type { SegmentValue } from "../../../../external/mdds/include/mdds/node";
import { ScGlobal } from "../../../inc/global";
import type { SCROW, SCCOL, SCCOLROW } from "../../../inc/types";

/** Original internal inclusive range fields. */
interface RangeData<Value extends SegmentValue> {
  mnPos1: SCCOLROW;
  mnPos2: SCCOLROW;
  mnValue: Value;
}
/** Original row range aggregate; no native aggregate defaults are invented. */
export interface ScFlatBoolRowRangeData {
  mnRow1: SCROW;
  mnRow2: SCROW;
  mbValue: boolean;
}
/** Original column range aggregate. */
export interface ScFlatBoolColRangeData {
  mnCol1: SCCOL;
  mnCol2: SCCOL;
  mbValue: boolean;
}
/** Original UInt16 row range aggregate. */
export interface ScFlatUInt16RowRangeData {
  mnRow1: SCROW;
  mnRow2: SCROW;
  mnValue: number;
}

/** Adapts the original debug assertion to JavaScript fail-fast diagnostics; release/process-abort policy is not certified. @returns Nothing. */
function assertIdleCalculation(): void {
  if (ScGlobal.bThreadedGroupCalcInProgress)
    throw new Error("Assertion failed: !ScGlobal::bThreadedGroupCalcInProgress");
}
/** Original anonymous-namespace template storage shared by boolean and UInt16 owners. */
class ScFlatSegmentsImpl<Value extends SegmentValue> {
  private readonly maSegments: flat_segment_tree<Value>;
  private maItr = new const_iterator<Value>();
  private mbTreeSearchEnabled: boolean;
  /** Initializes [0,max+1) or copies leaves/default/search policy while default-constructing the hint. @param source - Maximum or copy source. @param value - Original explicit default. @returns Owner. */
  public constructor(source: SCCOLROW | ScFlatSegmentsImpl<Value>, value?: Value) {
    if (source instanceof ScFlatSegmentsImpl) {
      this.maSegments = new flat_segment_tree(source.maSegments);
      this.mbTreeSearchEnabled = source.mbTreeSearchEnabled;
    } else {
      this.maSegments = new flat_segment_tree(0, source + 1, value as Value);
      this.mbTreeSearchEnabled = true;
    }
  }
  /** Sets the original inclusive span with the cached leaf hint. @param first - Inclusive first. @param last - Inclusive last. @param value - Value. @returns Native change flag. */
  public setValue(first: SCCOLROW, last: SCCOLROW, value: Value): boolean {
    const result = this.maSegments.insert(this.maItr, first, last + 1, value);
    this.maItr = result[0];
    return result[1];
  }
  /** Preserves original per-current-segment predicate order and lookup precondition. @param first - Valid first row. @param last - Last row. @param value - New value. @param predicate - Original condition. @returns Nothing. */
  public setValueIf(
    first: SCCOLROW,
    last: SCCOLROW,
    value: Value,
    predicate: (value: Value) => boolean,
  ): void {
    let current = first;
    while (current <= last) {
      // Scratch zeros select the shared mutable-output overload; successful
      // native lookup supplies all fields. Invalid rows violate the original
      // conditional-setter precondition and remain outside defined comparison.
      const data: RangeData<Value> = { mnPos1: 0, mnPos2: 0, mnValue: 0 as Value };
      this.getRangeData(current, data);
      if (predicate(data.mnValue)) this.setValue(current, Math.min(last, data.mnPos2), value);
      current = data.mnPos2 + 1;
    }
  }
  /** Reads original numeric zero on failed search without changing the owner hint. @param position - Row. @returns UInt16 value. */
  public getValue(position: SCCOLROW): Value {
    if (!this.mbTreeSearchEnabled) return this.maSegments.search(position, 0 as Value)[2];
    if (!this.maSegments.valid_tree()) {
      assertIdleCalculation();
      this.maSegments.build_tree();
    }
    return this.maSegments.search_tree(position, 0 as Value)[2];
  }
  /** Sums original inclusive numeric spans with distinct indexed/local and leaf/shared hint paths. @param first - First row. @param last - Last row. @returns Exact UInt64 sum. */
  public getSumValue(first: SCCOLROW, last: SCCOLROW): bigint {
    // Only the UInt16 facade calls this method: successful row positions are
    // nonnegative signed32 and values are narrowed to UInt16. Total interval
    // length is at most INT32_MAX; sum <= 65535*INT32_MAX < 2^47. Original
    // checked-multiply overflow/SAL_MAX_INT64 and saturating-add overflow paths
    // therefore cannot fire for defined owners. Exact bigint expresses this
    // invariant without changing native probe guards or adding exclusions.
    if (this.mbTreeSearchEnabled) {
      if (!this.maSegments.valid_tree()) {
        assertIdleCalculation();
        this.maSegments.build_tree();
      }
      let result = this.maSegments.search_tree(first, 0 as Value, 0, 0);
      if (!result[1]) return 0n;
      let iterator = result[0],
        value = result[2] as number,
        total = 0n,
        current = first,
        end = (result[4] as number) - 1;
      while (end <= last) {
        total += BigInt(value) * BigInt(end - current + 1);
        current = end + 1;
        result = this.maSegments.search(iterator, current, result[2], result[3], result[4]);
        if (!result[1]) break;
        iterator = result[0];
        value = result[2] as number;
        end = (result[4] as number) - 1;
      }
      if (current <= last) {
        end = Math.min(end, last);
        total += BigInt(value) * BigInt(end - current + 1);
      }
      return total;
    } else {
      const data: RangeData<Value> = { mnPos1: 0, mnPos2: 0, mnValue: 0 as Value };
      if (!this.getRangeDataLeaf(first, data)) return 0n;
      let total = 0n,
        current = first,
        end = data.mnPos2;
      while (end <= last) {
        total += BigInt(data.mnValue as number) * BigInt(end - current + 1);
        current = end + 1;
        if (!this.getRangeDataLeaf(current, data)) break;
        end = data.mnPos2;
      }
      if (current <= last) {
        end = Math.min(end, last);
        total += BigInt(data.mnValue as number) * BigInt(end - current + 1);
      }
      return total;
    }
  }
  /** Sets the original shared-template indexed-search policy. @param enabled - Policy. @returns Nothing. */
  public enableTreeSearch(enabled: boolean): void {
    this.mbTreeSearchEnabled = enabled;
  }
  /** Builds an invalid tree, then searches and caches the result; output fields remain unchanged on failure. @param position - Query. @param data - Output aggregate. @returns Found. */
  public getRangeData(position: SCCOLROW, data: RangeData<Value>): boolean {
    if (!this.mbTreeSearchEnabled) return this.getRangeDataLeaf(position, data);
    if (!this.maSegments.valid_tree()) {
      assertIdleCalculation();
      this.maSegments.build_tree();
    }
    const result = this.maSegments.search_tree(position, data.mnValue, data.mnPos1, data.mnPos2);
    if (!result[1]) return false;
    this.maItr = result[0];
    data.mnValue = result[2];
    data.mnPos1 = result[3] as number;
    data.mnPos2 = (result[4] as number) - 1;
    return true;
  }
  /** Searches linked leaves without building an index, preserving cached-hint fallback. @param position - Query. @param data - Output aggregate. @returns Found. */
  public getRangeDataLeaf(position: SCCOLROW, data: RangeData<Value>): boolean {
    const result = this.maSegments.search(
      this.maItr,
      position,
      data.mnValue,
      data.mnPos1,
      data.mnPos2,
    );
    if (!result[1]) return false;
    this.maItr = result[0];
    data.mnValue = result[2];
    data.mnPos1 = result[3] as number;
    data.mnPos2 = (result[4] as number) - 1;
    return true;
  }
  /** Removes the original half-open interval and resets the shared cursor. @param first - Inclusive first. @param end - Exclusive end. @returns Nothing. */
  public removeSegment(first: SCCOLROW, end: SCCOLROW): void {
    this.maSegments.shift_left(first, end);
    this.maItr = this.maSegments.begin();
  }
  /** Inserts positions with the original start-boundary skip policy. @param position - Insertion key. @param size - Count. @param skip - Start-boundary policy. @returns Nothing. */
  public insertSegment(position: SCCOLROW, size: SCCOLROW, skip: boolean): void {
    this.maSegments.shift_right(position, size, skip);
    this.maItr = this.maSegments.begin();
  }
  /** Returns the final position whose value differs from the supplied value, or signed32 maximum. @param value - Value to skip. @returns Original sentinel/position. */
  public findLastTrue(value: Value): SCCOLROW {
    let position = 2147483647;
    const iterator = this.maSegments.rbegin(),
      end = this.maSegments.rend();
    for (iterator.increment(); !iterator.equals(end); iterator.increment())
      if (iterator.value().second !== value) {
        position = iterator.decrement().value().first - 1;
        break;
      }
    return position;
  }
  /** Resets the owner-shared range cursor before reading the first interval. @param data - Output aggregate. @returns Found. */
  public getFirst(data: RangeData<Value>): boolean {
    this.maItr = this.maSegments.begin();
    return this.getNext(data);
  }
  /** Advances the owner-shared cursor including the terminal step's partial internal output update. @param data - Output aggregate. @returns Found. */
  public getNext(data: RangeData<Value>): boolean {
    const end = this.maSegments.end();
    if (this.maItr.equals(end)) return false;
    data.mnPos1 = this.maItr.value().first;
    data.mnValue = this.maItr.value().second;
    this.maItr.increment();
    if (this.maItr.equals(end)) return false;
    data.mnPos2 = this.maItr.value().first - 1;
    return true;
  }
  /** Checks the original thread precondition even for an already built index. @returns Nothing. */
  public makeReady(): void {
    assertIdleCalculation();
    if (!this.maSegments.valid_tree()) this.maSegments.build_tree();
  }
}
/** Original boolean specialization with default false. */
class ScFlatBoolSegmentsImpl extends ScFlatSegmentsImpl<boolean> {
  /** Initializes bool specialization or performs the original implicit derived copy. @param source - Maximum or copy source. @returns Owner. */
  public constructor(source: SCCOLROW | ScFlatBoolSegmentsImpl) {
    super(source, false);
  }
  /** Sets original inclusive true range. @param first - First position. @param last - Last position. @returns Change flag. */
  public setTrue(first: SCCOLROW, last: SCCOLROW): boolean {
    return this.setValue(first, last, true);
  }
  /** Sets original inclusive false range. @param first - First position. @param last - Last position. @returns Change flag. */
  public setFalse(first: SCCOLROW, last: SCCOLROW): boolean {
    return this.setValue(first, last, false);
  }
}
/** Original row owner private implementation, accessible to its two nested iterator friends. */
const implementations = new WeakMap<ScFlatBoolRowSegments, ScFlatBoolSegmentsImpl>();
/** Initializes scratch output references required by the TS mdds overload adapter; wrappers publish only successful values. @returns Scratch. */
function scratchRange(): RangeData<boolean> {
  return { mnPos1: 0, mnPos2: 0, mnValue: false };
}
/** Original row ForwardIterator, whose monotonic position/cache can remain stale after owner mutation. */
export class ScFlatBoolRowSegmentsForwardIterator {
  private readonly mrSegs: ScFlatBoolRowSegments;
  private mnCurPos = 0;
  private mnLastPos = -1;
  private mbCurValue = false;
  /** Borrows the original segment owner. @param segments - Owner. @returns Iterator. */
  public constructor(segments: ScFlatBoolRowSegments) {
    this.mrSegs = segments;
  }
  /** Retains forward-only position and the original cached interval. @param position - Requested row. @param value - Existing output reference. @returns Found/value. */
  public getValue(position: SCROW, value: boolean): [boolean, boolean] {
    position |= 0;
    if (position >= this.mnCurPos) this.mnCurPos = position;
    if (this.mnCurPos > this.mnLastPos) {
      const data: ScFlatBoolRowRangeData = { mnRow1: 0, mnRow2: 0, mbValue: false };
      if (!this.mrSegs.getRangeData(this.mnCurPos, data)) return [false, value];
      this.mbCurValue = data.mbValue;
      this.mnLastPos = data.mnRow2;
    }
    return [true, this.mbCurValue];
  }
  /** Reads the cached inclusive last row. @returns Row. */
  public getLastPos(): SCROW {
    return this.mnLastPos;
  }
}
/** Original RangeIterator borrows the owner-shared implementation cursor, not an independent cursor. */
export class ScFlatBoolRowSegmentsRangeIterator {
  private readonly mrSegs: ScFlatBoolRowSegments;
  /** Borrows the original owner. @param segments - Owner. @returns Iterator. */
  public constructor(segments: ScFlatBoolRowSegments) {
    this.mrSegs = segments;
  }
  /** Resets shared cursor and publishes a successful inclusive range. @param data - Caller output. @returns Found. */
  public getFirst(data: ScFlatBoolRowRangeData): boolean {
    const range = scratchRange();
    // The initialized native owner always retains both distinct border nodes.
    // getFirst resets to the left border, so getNext succeeds for that interval;
    // the wrapper's failure guard is unreachable without malformed ownership.
    (implementations.get(this.mrSegs) as ScFlatBoolSegmentsImpl).getFirst(range);
    data.mnRow1 = range.mnPos1;
    data.mnRow2 = range.mnPos2;
    data.mbValue = range.mnValue;
    return true;
  }
  /** Reads the current owner cursor, publishing nothing on either end failure. @param data - Caller output. @returns Found. */
  public getNext(data: ScFlatBoolRowRangeData): boolean {
    const range = scratchRange();
    if (!(implementations.get(this.mrSegs) as ScFlatBoolSegmentsImpl).getNext(range)) return false;
    data.mnRow1 = range.mnPos1;
    data.mnRow2 = range.mnPos2;
    data.mbValue = range.mnValue;
    return true;
  }
}
/** Original bool row segment facade, preserving its shared private implementation. */
export class ScFlatBoolRowSegments {
  /** Original nested forward iterator constructor. */
  public static readonly ForwardIterator = ScFlatBoolRowSegmentsForwardIterator;
  /** Original nested range iterator constructor. */
  public static readonly RangeIterator = ScFlatBoolRowSegmentsRangeIterator;
  /** Constructs explicit native bounds or copies the native implementation. @param source - Maximum or owner. @returns Owner. */
  public constructor(source: SCROW | ScFlatBoolRowSegments) {
    implementations.set(
      this,
      new ScFlatBoolSegmentsImpl(
        source instanceof ScFlatBoolRowSegments ? source.mpImpl : source | 0,
      ),
    );
  }
  /** Reads the original privately shared implementation. @returns Implementation. */
  private get mpImpl(): ScFlatBoolSegmentsImpl {
    return implementations.get(this) as ScFlatBoolSegmentsImpl;
  }
  /** Sets inclusive true rows. @param first - First row. @param last - Last row. @returns Changed. */
  public setTrue(first: SCROW, last: SCROW): boolean {
    return this.mpImpl.setTrue(first | 0, last | 0);
  }
  /** Sets inclusive false rows. @param first - First row. @param last - Last row. @returns Changed. */
  public setFalse(first: SCROW, last: SCROW): boolean {
    return this.mpImpl.setFalse(first | 0, last | 0);
  }
  /** Searches the original index and publishes successful ranges only. @param position - Row. @param data - Output. @returns Found. */
  public getRangeData(position: SCROW, data: ScFlatBoolRowRangeData): boolean {
    const range = scratchRange();
    if (!this.mpImpl.getRangeData(position | 0, range)) return false;
    data.mbValue = range.mnValue;
    data.mnRow1 = range.mnPos1;
    data.mnRow2 = range.mnPos2;
    return true;
  }
  /** Searches leaves without building a tree. @param position - Row. @param data - Output. @returns Found. */
  public getRangeDataLeaf(position: SCROW, data: ScFlatBoolRowRangeData): boolean {
    const range = scratchRange();
    if (!this.mpImpl.getRangeDataLeaf(position | 0, range)) return false;
    data.mbValue = range.mnValue;
    data.mnRow1 = range.mnPos1;
    data.mnRow2 = range.mnPos2;
    return true;
  }
  /** Removes the original half-open row interval. @param first - Inclusive first. @param end - Exclusive end. @returns Nothing. */
  public removeSegment(first: SCROW, end: SCROW): void {
    this.mpImpl.removeSegment(first | 0, end | 0);
  }
  /** Inserts rows while skipping a coinciding start boundary. @param position - Row. @param size - Count. @returns Nothing. */
  public insertSegment(position: SCROW, size: SCROW): void {
    this.mpImpl.insertSegment(position | 0, size | 0, true);
  }
  /** Reads the original final true row or signed32 maximum sentinel. @returns Position. */
  public findLastTrue(): SCROW {
    return this.mpImpl.findLastTrue(false);
  }
  /** Prepares the native search index. @returns Nothing. */
  public makeReady(): void {
    this.mpImpl.makeReady();
  }
  /** Preserves original diagnostic ASCII bytes; JS immutable strings adapt OString, not its allocation/refcount/capacity. @returns Diagnostic text. */
  public dumpAsString(): string {
    let text = "",
      row = 0;
    const data: ScFlatBoolRowRangeData = { mnRow1: 0, mnRow2: 0, mbValue: false };
    while (this.getRangeData(row, data)) {
      if (!row) text += (data.mbValue ? "1" : "0") + ":";
      text += data.mnRow2 + " ";
      row = data.mnRow2 + 1;
    }
    return text;
  }
}
/** Original bool column facade over the same implementation. */
export class ScFlatBoolColSegments {
  private readonly mpImpl: ScFlatBoolSegmentsImpl;
  /** Applies the original signed16 maximum or performs a copy. @param source - Maximum or owner. @returns Owner. */
  public constructor(source: SCCOL | ScFlatBoolColSegments) {
    this.mpImpl = new ScFlatBoolSegmentsImpl(
      source instanceof ScFlatBoolColSegments ? source.mpImpl : (source << 16) >> 16,
    );
  }
  /** Sets inclusive true columns. @param first - First column. @param last - Last column. @returns Changed. */
  public setTrue(first: SCCOL, last: SCCOL): boolean {
    return this.mpImpl.setTrue((first << 16) >> 16, (last << 16) >> 16);
  }
  /** Sets inclusive false columns. @param first - First column. @param last - Last column. @returns Changed. */
  public setFalse(first: SCCOL, last: SCCOL): boolean {
    return this.mpImpl.setFalse((first << 16) >> 16, (last << 16) >> 16);
  }
  /** Searches and retains original signed16 output assignments. @param position - Column. @param data - Output. @returns Found. */
  public getRangeData(position: SCCOL, data: ScFlatBoolColRangeData): boolean {
    const range = scratchRange();
    if (!this.mpImpl.getRangeData((position << 16) >> 16, range)) return false;
    data.mbValue = range.mnValue;
    data.mnCol1 = (range.mnPos1 << 16) >> 16;
    data.mnCol2 = (range.mnPos2 << 16) >> 16;
    return true;
  }
  /** Removes the original half-open column interval. @param first - First column. @param end - Exclusive end. @returns Nothing. */
  public removeSegment(first: SCCOL, end: SCCOL): void {
    this.mpImpl.removeSegment((first << 16) >> 16, (end << 16) >> 16);
  }
  /** Inserts columns with original boundary skipping. @param position - Column. @param size - Count. @returns Nothing. */
  public insertSegment(position: SCCOL, size: SCCOL): void {
    this.mpImpl.insertSegment((position << 16) >> 16, (size << 16) >> 16, true);
  }
  /** Prepares the original tree index. @returns Nothing. */
  public makeReady(): void {
    this.mpImpl.makeReady();
  }
  /** Preserves original column diagnostic ASCII text. @returns Diagnostic text. */
  public dumpAsString(): string {
    let text = "",
      column = 0;
    const data: ScFlatBoolColRangeData = { mnCol1: 0, mnCol2: 0, mbValue: false };
    while (this.getRangeData(column, data)) {
      if (!column) text += (data.mbValue ? "1" : "0") + ":";
      text += data.mnCol2 + " ";
      column = data.mnCol2 + 1;
    }
    return text;
  }
}
/** Original UInt16 specialization; the extended UInt32 alias does not alter stored values. */
class ScFlatUInt16SegmentsImpl extends ScFlatSegmentsImpl<number> {
  /** Initializes original explicit default or copies the implementation. @param source - Maximum or copied owner. @param value - Original default. @returns Owner. */
  public constructor(source: SCCOLROW | ScFlatUInt16SegmentsImpl, value?: number) {
    super(source, value);
  }
}
/** Original private numeric owner accessible to its nested iterator friend. */
const numericImplementations = new WeakMap<ScFlatUInt16RowSegments, ScFlatUInt16SegmentsImpl>();
/** Original numeric forward iterator, indexed first and cached-leaf thereafter. */
export class ScFlatUInt16RowSegmentsForwardIterator {
  private readonly mrSegs: ScFlatUInt16RowSegments;
  private mnCurPos = 0;
  private mnLastPos = -1;
  private mnCurValue = 0;
  /** Borrows the original owner. @param segments - Owner. @returns Iterator. */
  public constructor(segments: ScFlatUInt16RowSegments) {
    this.mrSegs = segments;
  }
  /** Preserves monotonic position, stale interval cache and caller output on failure. @param position - Row. @param value - Existing UInt16 output. @returns Found/value. */
  public getValue(position: SCROW, value: number): [boolean, number] {
    position |= 0;
    if (position >= this.mnCurPos) this.mnCurPos = position;
    if (this.mnCurPos > this.mnLastPos) {
      const data: RangeData<number> = { mnPos1: 0, mnPos2: 0, mnValue: 0 },
        impl = numericImplementations.get(this.mrSegs) as ScFlatUInt16SegmentsImpl;
      if (this.mnLastPos === -1) {
        if (!impl.getRangeData(this.mnCurPos, data)) return [false, value];
      } else if (!impl.getRangeDataLeaf(this.mnCurPos, data)) return [false, value];
      this.mnCurValue = data.mnValue;
      this.mnLastPos = data.mnPos2;
    }
    return [true, this.mnCurValue];
  }
  /** Reads the original cached inclusive last row. @returns Row. */
  public getLastPos(): SCROW {
    return this.mnLastPos;
  }
}
/** Original row-height UInt16 segment facade over the actual shared template. */
export class ScFlatUInt16RowSegments {
  /** Original nested iterator constructor. */
  public static readonly ForwardIterator = ScFlatUInt16RowSegmentsForwardIterator;
  /** Copies original leaf/default/policy values, default-constructing the hint. @param source - Copied owner. @returns Owner. */
  public constructor(source: ScFlatUInt16RowSegments);
  /** Initializes explicit original row maximum and UInt16 default. @param source - Maximum. @param value - Required default. @returns Owner. */
  public constructor(source: SCROW, value: number);
  /** Implements original constructor overloads with native numerical widths. @param source - Maximum or owner. @param value - Explicit default. @returns Owner. */
  public constructor(source: SCROW | ScFlatUInt16RowSegments, value?: number) {
    numericImplementations.set(
      this,
      new ScFlatUInt16SegmentsImpl(
        source instanceof ScFlatUInt16RowSegments ? source.mpImpl : source | 0,
        (value as number) & 65535,
      ),
    );
  }
  /** Reads original privately owned implementation. @returns Implementation. */
  private get mpImpl(): ScFlatUInt16SegmentsImpl {
    return numericImplementations.get(this) as ScFlatUInt16SegmentsImpl;
  }
  /** Sets original inclusive UInt16 values, discarding the internal change flag. @param first - First row. @param last - Last row. @param value - UInt16 value. @returns Nothing. */
  public setValue(first: SCROW, last: SCROW, value: number): void {
    this.mpImpl.setValue(first | 0, last | 0, value & 65535);
  }
  /** Visits original current segments and conditionally replaces them. @param first - Valid first row. @param last - Last row. @param value - New UInt16 value. @param predicate - Original value predicate. @returns Nothing. */
  public setValueIf(
    first: SCROW,
    last: SCROW,
    value: number,
    predicate: (value: number) => boolean,
  ): void {
    this.mpImpl.setValueIf(first | 0, last | 0, value & 65535, predicate);
  }
  /** Returns original UInt16 value or zero on failed search. @param position - Row. @returns Value. */
  public getValue(position: SCROW): number {
    return this.mpImpl.getValue(position | 0);
  }
  /** Sums inclusive rows using original search-policy paths. @param first - First row. @param last - Last row. @returns Exact UInt64 sum. */
  public getSumValue(first: SCROW, last: SCROW): bigint {
    return this.mpImpl.getSumValue(first | 0, last | 0);
  }
  /** Publishes original range fields only on success. @param position - Row. @param data - Caller output. @returns Found. */
  public getRangeData(position: SCROW, data: ScFlatUInt16RowRangeData): boolean {
    const range: RangeData<number> = { mnPos1: 0, mnPos2: 0, mnValue: 0 };
    if (!this.mpImpl.getRangeData(position | 0, range)) return false;
    data.mnRow1 = range.mnPos1;
    data.mnRow2 = range.mnPos2;
    data.mnValue = range.mnValue;
    return true;
  }
  /** Removes the original half-open row interval. @param first - First row. @param end - Exclusive end. @returns Nothing. */
  public removeSegment(first: SCROW, end: SCROW): void {
    this.mpImpl.removeSegment(first | 0, end | 0);
  }
  /** Inserts rows without skipping the coinciding start boundary. @param position - Row. @param size - Count. @returns Nothing. */
  public insertSegment(position: SCROW, size: SCROW): void {
    this.mpImpl.insertSegment(position | 0, size | 0, false);
  }
  /** Finds the last row differing from the supplied UInt16 value. @param value - Skipped value. @returns Row or signed32 maximum. */
  public findLastTrue(value: number): SCROW {
    return this.mpImpl.findLastTrue(value & 65535);
  }
  /** Sets original search policy without constructing or invalidating the index. @param enabled - Policy. @returns Nothing. */
  public enableTreeSearch(enabled: boolean): void {
    this.mpImpl.enableTreeSearch(enabled);
  }
  /** Prepares the index even when indexed lookup is disabled. @returns Nothing. */
  public makeReady(): void {
    this.mpImpl.makeReady();
  }
  /** Preserves original numeric ASCII diagnostics; RTL allocation remains unverified. @returns Text. */
  public dumpAsString(): string {
    let text = "",
      row = 0;
    const data = {} as ScFlatUInt16RowRangeData;
    while (this.getRangeData(row, data)) {
      text += data.mnValue + ":" + data.mnRow2 + " ";
      row = data.mnRow2 + 1;
    }
    return text;
  }
}
