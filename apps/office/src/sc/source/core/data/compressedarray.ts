/** @fileoverview Original compressedarray.hxx/cxx numeric width and flag owners, retaining entry/capacity and mutation algorithms. */
import { CRFlags } from "../../../inc/global";
/** Explicit runtime witnesses for erased native SCROW/SCCOL and UInt16/CRFlags template arguments. */
export interface ScCompressedArrayTypes {
  access: 16 | 32;
  value: 8 | 16;
}
/** Original numeric DataEntry value. */
export interface ScCompressedArrayDataEntry {
  nEnd: number;
  aValue: number;
}
/** Original range-data aggregate. */
export interface ScCompressedArrayRangeData {
  mnRow1: number;
  mnRow2: number;
  maValue: number;
}
/** Private array storage shared with the original nested iterator friend. */
const arrays = new WeakMap<
  ScCompressedArray,
  { data: ScCompressedArrayDataEntry[]; types: ScCompressedArrayTypes }
>();
/** Narrows the original signed access type after arithmetic or parameter conversion. @param value - Coordinate. @param width - Native template width. @returns Coordinate. */
function access(value: number | bigint, width: 16 | 32): number {
  return Number(BigInt.asIntN(width, BigInt(value)));
}
/** Preserves native unsigned size_t parameter conversion. @param value - Count. @returns Count. */
function size(value: number | bigint): bigint {
  return BigInt.asUintN(64, BigInt(value));
}
/** Original borrowed iterator with a valid-region precondition and no end API. */
export class ScCompressedArrayIterator {
  /** Borrows the array and initializes original cursor fields. @param mrArray - Owner. @param mnIndex - Entry index. @param mnRegion - Region position. @returns Iterator. */
  public constructor(
    private readonly mrArray: ScCompressedArray,
    private mnIndex = 0,
    private mnRegion = 0,
  ) {}
  /** Original prefix increment. @returns Nothing. */
  public increment(): void {
    const storage = arrays.get(this.mrArray) as {
      data: ScCompressedArrayDataEntry[];
      types: ScCompressedArrayTypes;
    };
    this.mnRegion = access(this.mnRegion + 1, storage.types.access);
    if (this.mnRegion > (storage.data[this.mnIndex] as ScCompressedArrayDataEntry).nEnd)
      ++this.mnIndex;
  }
  /** Original iterator addition, retaining borrowed owner and independent position. @param count - Unsigned offset. @returns Iterator. */
  public add(count: number | bigint): ScCompressedArrayIterator {
    const storage = arrays.get(this.mrArray) as {
      data: ScCompressedArrayDataEntry[];
      types: ScCompressedArrayTypes;
    };
    const region = access(BigInt(this.mnRegion) + size(count), storage.types.access);
    let index = this.mnIndex;
    while (region > (storage.data[index] as ScCompressedArrayDataEntry).nEnd) ++index;
    return new ScCompressedArrayIterator(this.mrArray, index, region);
  }
  /** Original dereference through current live owner storage. @returns Numeric value. */
  public getValue(): number {
    return (
      (arrays.get(this.mrArray) as { data: ScCompressedArrayDataEntry[] }).data[
        this.mnIndex
      ] as ScCompressedArrayDataEntry
    ).aValue;
  }
}
/** Original compressed array specialization for actual numeric widths and CRFlags. */
export class ScCompressedArray {
  /** Original nested iterator syntax. */
  public static readonly Iterator = ScCompressedArrayIterator;
  protected nCount = 1;
  protected nLimit = 1;
  protected nMaxAccess: number;
  /** Initializes required maximum/value with explicit erased-template witnesses. @param maximum - Inclusive maximum. @param value - Explicit original default. @param types - Native template widths. @returns Owner. */
  public constructor(maximum: number, value: number, types: ScCompressedArrayTypes) {
    this.nMaxAccess = access(maximum, types.access);
    arrays.set(this, {
      types: { ...types },
      data: [{ nEnd: this.nMaxAccess, aValue: value & (types.value === 8 ? 255 : 65535) }],
    });
  }
  /** Reads original current entry storage. @returns Entries. */
  protected get pData(): ScCompressedArrayDataEntry[] {
    return (arrays.get(this) as { data: ScCompressedArrayDataEntry[] }).data;
  }
  /** Replaces storage while preserving the iterator's borrowed owner. @param data - Original replacement allocation. @returns Nothing. */
  protected set pData(data: ScCompressedArrayDataEntry[]) {
    (arrays.get(this) as { data: ScCompressedArrayDataEntry[] }).data = data;
  }
  /** Converts the original template access type. @param value - Coordinate. @returns Coordinate. */
  protected position(value: number | bigint): number {
    return access(value, (arrays.get(this) as { types: ScCompressedArrayTypes }).types.access);
  }
  /** Converts the original numeric template data type. @param value - Value. @returns Stored value. */
  protected value(value: number): number {
    return (
      value &
      ((arrays.get(this) as { types: ScCompressedArrayTypes }).types.value === 8 ? 255 : 65535)
    );
  }
  /** Reads an original entry; invalid native indexes remain outside defined contracts. @param index - Index. @returns Entry. */
  protected entry(index: number): ScCompressedArrayDataEntry {
    return this.pData[index] as ScCompressedArrayDataEntry;
  }
  /** Copies original POD entries with memmove overlap semantics. @param dest - Destination. @param src - Source. @param count - Entries. @returns Nothing. */
  private moveEntries(dest: number, src: number, count: number): void {
    const copied = this.pData.slice(src, src + count).map(
      /** Copies POD value. @param entry - Entry. @returns Independent value. */ (entry) => ({
        ...entry,
      }),
    );
    for (let i = 0; i < count; ++i) this.pData[dest + i] = copied[i] as ScCompressedArrayDataEntry;
  }
  /** Original reset takes a value copy before reallocation. @param value - Explicit new default. @returns Nothing. */
  public Reset(value: number): void {
    const temporary = this.value(value);
    this.nCount = this.nLimit = 1;
    this.pData = [{ aValue: temporary, nEnd: this.nMaxAccess }];
  }
  /** Original binary search and out-of-domain first/last fallback. @param position - Access. @returns Index. */
  public Search(position: number): number {
    position = this.position(position);
    if (position === 0) return 0;
    let low = 0,
      high = this.nCount - 1,
      i = 0,
      found = this.nCount === 1;
    while (!found && low <= high) {
      i = Math.trunc((low + high) / 2);
      const start = i > 0 ? this.entry(i - 1).nEnd : -1;
      const end = this.entry(i).nEnd;
      if (end < position) low = ++i;
      else if (start >= position) high = --i;
      else found = true;
    }
    return found ? i : position < 0 ? 0 : this.nCount - 1;
  }
  /** Retains original capacity, split, shrink and combination algorithm. @param first - Start. @param last - End or value. @param value - Optional overload value. @returns Nothing. */
  public SetValue(first: number, last: number, value?: number): void {
    if (value === undefined) {
      value = last;
      last = first;
    }
    first = this.position(first);
    last = this.position(last);
    value = this.value(value);
    if (!(
      0 <= first &&
      first <= this.nMaxAccess &&
      0 <= last &&
      last <= this.nMaxAccess &&
      first <= last
    ))
      return;
    if (first === 0 && last === this.nMaxAccess) {
      this.Reset(value);
      return;
    }
    const newValue = value,
      needed = this.nCount + 2;
    if (this.nLimit < needed) {
      this.nLimit = Math.trunc(this.nLimit * 1.5);
      if (this.nLimit < needed) this.nLimit = needed;
      const data = new Array<ScCompressedArrayDataEntry>(this.nLimit);
      for (let i = 0; i < this.nCount; ++i) data[i] = { ...this.entry(i) };
      this.pData = data;
    }
    let leading: number,
      insert: number,
      combined = false,
      split = false;
    if (first > 0) {
      leading = this.Search(first);
      insert = this.nMaxAccess + 1;
      if (this.entry(leading).aValue !== newValue) {
        if (leading === 0 || this.entry(leading - 1).nEnd < first - 1) {
          if (this.entry(leading).nEnd > last) split = true;
          ++leading;
          insert = leading;
        } else {
          // The preceding branch excludes leading===0 and previousEnd<first-1.
          // Original Search on ordered entries supplies previousEnd<first;
          // integral coordinates therefore imply previousEnd===first-1.
          insert = leading;
        }
      }
      if (leading > 0 && this.entry(leading - 1).aValue === newValue) {
        this.entry(leading - 1).nEnd = last;
        insert = this.nMaxAccess + 1;
        combined = true;
      }
    } else {
      insert = 0;
      leading = 0;
    }
    let stop = leading;
    while (stop < this.nCount && this.entry(stop).nEnd <= last) ++stop;
    if (!split) {
      if (stop < this.nCount && this.entry(stop).aValue === newValue) {
        if (leading > 0) {
          if (this.entry(leading - 1).aValue === newValue) {
            this.entry(leading - 1).nEnd = this.entry(stop).nEnd;
            ++stop;
          } else if (leading === insert) this.entry(leading - 1).nEnd = first - 1;
        }
        insert = this.nMaxAccess + 1;
        combined = true;
      } else if (leading > 0 && leading === insert) this.entry(leading - 1).nEnd = first - 1;
    }
    if (leading < stop) {
      if (!combined) {
        this.pData[leading] = { nEnd: last, aValue: newValue };
        ++leading;
        insert = this.nMaxAccess + 1;
      }
      if (leading < stop) {
        this.moveEntries(leading, stop, this.nCount - stop);
        this.nCount -= stop - leading;
      }
    }
    if (insert < this.nMaxAccess + 1) {
      // Active insert is 0, Search index, or Search index+1, hence <=nCount.
      // Every preceding combination/removal disables insertion with max+1;
      // nCount cannot shrink while this insertion remains active.
      if (!split) this.moveEntries(insert + 1, insert, this.nCount - insert);
      else {
        this.moveEntries(insert + 2, insert, this.nCount - insert);
        this.pData[insert + 1] = { ...this.entry(insert - 1) };
        ++this.nCount;
      }
      if (insert) this.entry(insert - 1).nEnd = first - 1;
      this.pData[insert] = { nEnd: last, aValue: newValue };
      ++this.nCount;
    }
  }
  /** Reads the original scalar value. @param position - Access. @returns Value. */
  public GetValue(position: number): number;
  /** Adapts original output references to a value/index/end tuple. @param position - Access. @param index - Existing index. @param end - Existing end. @returns Value/index/end. */
  public GetValue(position: number, index: number, end: number): [number, number, number];
  /** Original scalar or output-reference getter. @param position - Access. @param index - Overload index. @param end - Overwritten overload end. @returns Value or tuple. */
  public GetValue(
    position: number,
    index?: number,
    end?: number,
  ): number | [number, number, number] {
    void end; // Original output-reference input is overwritten.
    const found = this.Search(position);
    return index === undefined
      ? this.entry(found).aValue
      : [this.entry(found).aValue, found, this.entry(found).nEnd];
  }
  /** Reads original terminal position. @returns Position. */
  public GetLastPos(): number {
    return this.entry(this.nCount - 1).nEnd;
  }
  /** Reads original complete range even outside nominal domain. @param position - Access. @returns Range. */
  public GetRangeData(position: number): ScCompressedArrayRangeData {
    const index = this.Search(position);
    return {
      mnRow1: index === 0 ? 0 : this.position(this.entry(index - 1).nEnd + 1),
      mnRow2: this.entry(index).nEnd,
      maValue: this.entry(index).aValue,
    };
  }
  /** Increments the caller index once then repeatedly returns the terminal entry. @param index - Existing index. @param end - Existing overwritten end. @returns Value/index/end. */
  public GetNextValue(index: number, end: number): [number, number, number] {
    void end; // Original output-reference input is overwritten.
    if (index < this.nCount) ++index;
    const entry = this.entry(index < this.nCount ? index : this.nCount - 1);
    return [entry.aValue, index, entry.nEnd];
  }
  /** Extends the original entry before an exact start boundary and clips the tail. @param start - Position. @param count - Unsigned size. @returns Inherited value. */
  public Insert(start: number, count: number | bigint): number {
    start = this.position(start);
    const amount = size(count);
    let index = this.Search(start);
    if (index > 0 && this.entry(index - 1).nEnd + 1 === start) --index;
    const value = this.entry(index).aValue;
    do {
      this.entry(index).nEnd = this.position(BigInt(this.entry(index).nEnd) + amount);
      if (this.entry(index).nEnd >= this.nMaxAccess) {
        this.entry(index).nEnd = this.nMaxAccess;
        this.nCount = index + 1;
      }
    } while (++index < this.nCount);
    return value;
  }
  /** Preserves original insert/fill/remove order, including the terminal endpoint. @param start - Position. @param count - Unsigned size. @param fill - Fill value. @returns Nothing. */
  public InsertPreservingSize(start: number, count: number | bigint, fill: number): void {
    start = this.position(start);
    const amount = size(count),
      previous = this.GetLastPos();
    this.Insert(start, amount);
    for (let i = start; i < this.position(BigInt(start) + amount); i = this.position(i + 1))
      this.SetValue(i, fill);
    const next = this.GetLastPos();
    this.Remove(previous, next - previous);
  }
  /** Removes original entries and retains the terminal maximum. @param start - Position. @param count - Unsigned size. @returns Nothing. */
  public Remove(start: number, count: number | bigint): void {
    start = this.position(start);
    const amount = size(count),
      end = this.position(BigInt(start) + amount - 1n);
    let index = this.Search(start);
    if (end > this.entry(index).nEnd) this.SetValue(start, end, this.entry(index).aValue);
    if (
      (start === 0 || (index > 0 && start === this.entry(index - 1).nEnd + 1)) &&
      this.entry(index).nEnd === end &&
      index < this.nCount - 1
    ) {
      let remove;
      if (index > 0 && this.entry(index - 1).aValue === this.entry(index + 1).aValue) {
        remove = 2;
        --index;
      } else remove = 1;
      this.moveEntries(index, index + remove, this.nCount - (index + remove));
      this.nCount -= remove;
    }
    do {
      this.entry(index).nEnd = this.position(BigInt(this.entry(index).nEnd) - amount);
    } while (++index < this.nCount);
    this.entry(this.nCount - 1).nEnd = this.nMaxAccess;
  }
  /** Retains original remove/insert-preserving order. @param start - Position. @param count - Unsigned size. @param fill - Fill value. @returns Nothing. */
  public RemovePreservingSize(start: number, count: number | bigint, fill: number): void {
    start = this.position(start);
    const previous = this.GetLastPos();
    this.Remove(start, count);
    const next = this.GetLastPos();
    this.InsertPreservingSize(next, next - previous, fill);
  }
  /** Copies original inclusive regions with optional source offset; self copy violates the original assertion. @param source - Distinct source. @param first - Destination start. @param last - Destination end. @param sourceStart - Original inline overload uses first. @returns Nothing. */
  public CopyFrom(
    source: ScCompressedArray,
    first: number,
    last: number,
    sourceStart = first,
  ): void {
    if (this === source) throw new Error("Assertion failed: cannot copy self->self");
    first = this.position(first);
    last = this.position(last);
    sourceStart = this.position(sourceStart);
    let index = 0,
      regionEnd = 0;
    for (let j = first; j <= last; j = this.position(j + 1)) {
      const [value, nextIndex, end] =
        j === first
          ? source.GetValue(this.position(j - first + sourceStart), index, regionEnd)
          : source.GetNextValue(index, regionEnd);
      index = nextIndex;
      regionEnd = this.position(end - sourceStart + first);
      if (regionEnd > last) regionEnd = last;
      this.SetValue(j, regionEnd, value);
      j = regionEnd;
    }
  }
  /** Constructs the original beginning iterator. @returns Iterator. */
  public begin(): ScCompressedArrayIterator {
    return new ScCompressedArrayIterator(this);
  }
}
/** Original bit-mask specialization for row/column CRFlags. */
export class ScBitMaskCompressedArray extends ScCompressedArray {
  /** Initializes required original maximum/default and explicit erased access template. @param maximum - Maximum. @param value - CRFlags default. @param accessWidth - SCROW/SCCOL width. @returns Owner. */
  public constructor(maximum: number, value: CRFlags, accessWidth: 16 | 32) {
    super(maximum, value, { access: accessWidth, value: 8 });
  }
  /** Adapts original o3tl CRFlags wrapper mask assertion. @param value - Bit-operation result. @returns Flags. */
  private flags(value: number): CRFlags {
    if ((value & ~CRFlags.All) !== 0) throw new Error("Assertion failed: CRFlags typed flag mask");
    return value;
  }
  /** Original scalar AND. @param first - Position. @param value - Mask. @returns Nothing. */
  public AndValue(first: number, value: CRFlags): void;
  /** Original inclusive AND. @param first - Start. @param last - End. @param value - Mask. @returns Nothing. */
  public AndValue(first: number, last: number, value: CRFlags): void;
  /** Original current-region AND traversal and restart search after mutation. @param first - Start. @param last - End or mask. @param value - Mask overload. @returns Nothing. */
  public AndValue(first: number, last: number, value?: CRFlags): void {
    first = this.position(first);
    if (value === undefined) {
      const old = this.GetValue(first),
        next = this.flags(old & this.value(last));
      if (next !== old) this.SetValue(first, next);
      return;
    }
    last = this.position(last);
    value = this.value(value);
    if (first > last) return;
    let index = this.Search(first);
    do {
      const next = this.flags(this.entry(index).aValue & value);
      if (next !== this.entry(index).aValue) {
        const start = Math.max(index > 0 ? this.entry(index - 1).nEnd + 1 : 0, first),
          end = Math.min(this.entry(index).nEnd, last);
        this.SetValue(start, end, next);
        if (end >= last) break;
        index = this.Search(this.position(end + 1));
      } else if (this.entry(index).nEnd >= last) break;
      else ++index;
    } while (index < this.nCount);
  }
  /** Original scalar OR. @param first - Position. @param value - Mask. @returns Nothing. */
  public OrValue(first: number, value: CRFlags): void;
  /** Original inclusive OR. @param first - Start. @param last - End. @param value - Mask. @returns Nothing. */
  public OrValue(first: number, last: number, value: CRFlags): void;
  /** Original current-region OR traversal and restart search after mutation. @param first - Start. @param last - End or mask. @param value - Mask overload. @returns Nothing. */
  public OrValue(first: number, last: number, value?: CRFlags): void {
    first = this.position(first);
    if (value === undefined) {
      const old = this.GetValue(first),
        next = this.flags(old | this.value(last));
      if (next !== old) this.SetValue(first, next);
      return;
    }
    last = this.position(last);
    value = this.value(value);
    if (first > last) return;
    let index = this.Search(first);
    do {
      const next = this.flags(this.entry(index).aValue | value);
      if (next !== this.entry(index).aValue) {
        const start = Math.max(index > 0 ? this.entry(index - 1).nEnd + 1 : 0, first),
          end = Math.min(this.entry(index).nEnd, last);
        this.SetValue(start, end, next);
        if (end >= last) break;
        index = this.Search(this.position(end + 1));
      } else if (this.entry(index).nEnd >= last) break;
      else ++index;
    } while (index < this.nCount);
  }
  /** Original same-position source-region AND copy. @param source - Source. @param first - Start. @param last - End. @param mask - Flag mask. @returns Nothing. */
  public CopyFromAnded(
    source: ScBitMaskCompressedArray,
    first: number,
    last: number,
    mask: CRFlags,
  ): void {
    first = this.position(first);
    last = this.position(last);
    mask = this.value(mask);
    let index = 0,
      regionEnd = 0;
    for (let j = first; j <= last; j = this.position(j + 1)) {
      const [value, nextIndex, end] =
        j === first ? source.GetValue(j, index, regionEnd) : source.GetNextValue(index, regionEnd);
      index = nextIndex;
      regionEnd = end;
      if (regionEnd > last) regionEnd = last;
      this.SetValue(j, regionEnd, this.flags(value & mask));
      j = regionEnd;
    }
  }
  /** Original reverse bit search with native access-type maximum sentinel. @param mask - Flag mask. @returns Last position or sentinel. */
  public GetLastAnyBitAccess(mask: CRFlags): number {
    mask = this.value(mask);
    let end =
        (arrays.get(this) as { types: ScCompressedArrayTypes }).types.access === 16
          ? 32767
          : 2147483647,
      index = this.nCount - 1;
    while (true) {
      if (this.flags(this.entry(index).aValue & mask)) {
        end = this.entry(index).nEnd;
        break;
      } else if (index > 0) {
        --index;
        if (this.entry(index).nEnd < 0) break;
      } else break;
    }
    return end;
  }
}
