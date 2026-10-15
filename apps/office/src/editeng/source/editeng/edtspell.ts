/** @fileoverview Original WrongList stored state, value operations and text-range transformations from edtspell.cxx. Actual ContentNode-dependent ClearWrongs and spell/autocorrect services remain separate work. */
import { MisspellRange } from "../../inc/misspellrange";
/** Const original WrongList view without mutation operations. */
export type WrongListConstReference = Readonly<
  Pick<
    WrongList,
    | "GetRanges"
    | "IsValid"
    | "GetInvalidStart"
    | "GetInvalidEnd"
    | "NextWrong"
    | "HasWrong"
    | "HasAnyWrong"
    | "Clone"
    | "equals"
    | "empty"
  >
>;
/** Original error-range vector and independent invalid interval, using actual BigInt for unsigned64 size_t values. */
export class WrongList {
  private static readonly Valid = (1n << 64n) - 1n;
  private maRanges: MisspellRange[] = [];
  private mnInvalidStart = 0n;
  private mnInvalidEnd = WrongList.Valid;
  /** Original default/implicit-copy constructor. @param source - Optional actual source value. @returns Wrong list. */
  constructor(source?: WrongList) {
    if (source !== undefined) {
      this.maRanges = source.maRanges.map(
        /** Copies one native range value. @param value - Source range. @returns Copy. */
        (value) => new MisspellRange(value),
      );
      this.mnInvalidStart = source.mnInvalidStart;
      this.mnInvalidEnd = source.mnInvalidEnd;
    }
  }
  /** Original const vector access. @returns Borrowed actual ranges. */
  GetRanges(): readonly Readonly<MisspellRange>[] {
    return this.maRanges;
  }
  /** Original vector value assignment; rvalue lifetime syntax is erased under GC. @param ranges - Native range values. @returns Nothing. */
  SetRanges(ranges: readonly Readonly<MisspellRange>[]): void {
    this.maRanges = Array.from(
      ranges,
      /** Copies one transferred logical value. @param value - Input range. @returns Stored value. */
      (value) => new MisspellRange(value),
    );
  }
  /** Original single-marker validity check. @returns Valid predicate. */
  IsValid(): boolean {
    return this.mnInvalidStart === WrongList.Valid;
  }
  /** Original valid marker and independent end reset. @returns Nothing. */
  SetValid(): void {
    this.mnInvalidStart = WrongList.Valid;
    this.mnInvalidEnd = 0n;
  }
  /** Original min/max invalid-range extension. @param start - Unsigned64 start. @param end - Unsigned64 end. @returns Nothing. */
  SetInvalidRange(start: bigint, end: bigint): void {
    start = BigInt.asUintN(64, start);
    end = BigInt.asUintN(64, end);
    if (this.mnInvalidStart === WrongList.Valid || start < this.mnInvalidStart)
      this.mnInvalidStart = start;
    if (this.mnInvalidEnd < end) this.mnInvalidEnd = end;
  }
  /** Original independent interval assignment. @param start - Unsigned64 start. @param end - Unsigned64 end. @returns Nothing. */
  ResetInvalidRange(start: bigint, end: bigint): void {
    this.mnInvalidStart = BigInt.asUintN(64, start);
    this.mnInvalidEnd = BigInt.asUintN(64, end);
  }
  /** Original invalid start. @returns Stored size_t value. */
  GetInvalidStart(): bigint {
    return this.mnInvalidStart;
  }
  /** Original invalid end, including the real unsigned64 sentinel. @returns Stored size_t value. */
  GetInvalidEnd(): bigint {
    return this.mnInvalidEnd;
  }
  /** Original insertion update with unsigned arithmetic and the captured original vector loop bound. @param position - Native size_t position. @param length - Native size_t inserted length. @param separator - Source separator flag. @returns Nothing. */
  TextInserted(position: bigint, length: bigint, separator: boolean): void {
    position = BigInt.asUintN(64, position);
    length = BigInt.asUintN(64, length);
    if (this.IsValid()) {
      this.mnInvalidStart = position;
      this.mnInvalidEnd = BigInt.asUintN(64, position + length);
    } else {
      if (this.mnInvalidStart > position) this.mnInvalidStart = position;
      this.mnInvalidEnd = BigInt.asUintN(
        64,
        this.mnInvalidEnd >= position ? this.mnInvalidEnd + length : position + length,
      );
    }
    for (let i = 0, n = this.maRanges.length; i < n; i += 1) {
      const range = this.maRanges[i] as MisspellRange;
      if (range.mnEnd >= position) {
        if (range.mnStart > position) {
          range.mnStart = BigInt.asUintN(64, range.mnStart + length);
          range.mnEnd = BigInt.asUintN(64, range.mnEnd + length);
        } else if (range.mnEnd === position) {
          if (!separator) range.mnEnd = BigInt.asUintN(64, range.mnEnd + length);
        } else if (range.mnStart < position && range.mnEnd > position) {
          range.mnEnd = BigInt.asUintN(64, range.mnEnd + length);
          if (separator) {
            const added = new MisspellRange(range.mnStart, position);
            range.mnStart = BigInt.asUintN(64, position + 1n);
            this.maRanges.splice(i, 0, added);
            i += 1;
          }
        } else {
          // The preceding integer comparisons imply mnStart === position here.
          range.mnEnd = BigInt.asUintN(64, range.mnEnd + length);
          if (separator) range.mnStart = BigInt.asUintN(64, range.mnStart + 1n);
        }
      }
    }
  }
  /** Original erase/shift/truncate updates with unsigned64 arithmetic. @param position - Deletion position. @param length - Removed length. @returns Nothing. */
  TextDeleted(position: bigint, length: bigint): void {
    position = BigInt.asUintN(64, position);
    length = BigInt.asUintN(64, length);
    const end = BigInt.asUintN(64, position + length);
    if (this.IsValid()) {
      const start = position === 0n ? 0n : position - 1n;
      this.mnInvalidStart = start;
      this.mnInvalidEnd = BigInt.asUintN(64, start + 1n);
    } else {
      if (this.mnInvalidStart > position) this.mnInvalidStart = position;
      if (this.mnInvalidEnd > position)
        this.mnInvalidEnd = BigInt.asUintN(
          64,
          this.mnInvalidEnd > end ? this.mnInvalidEnd - length : position + 1n,
        );
    }
    for (let i = 0; i < this.maRanges.length;) {
      const range = this.maRanges[i] as MisspellRange;
      let remove = false;
      if (range.mnEnd >= position) {
        if (range.mnStart >= end) {
          range.mnStart = BigInt.asUintN(64, range.mnStart - length);
          range.mnEnd = BigInt.asUintN(64, range.mnEnd - length);
        } else if (range.mnStart >= position && range.mnEnd <= end) remove = true;
        else if (range.mnStart <= position && range.mnEnd > position) {
          range.mnEnd = range.mnEnd <= end ? position : BigInt.asUintN(64, range.mnEnd - length);
        } else if (range.mnStart >= position && range.mnEnd > end) {
          range.mnStart = BigInt.asUintN(64, end - length);
          range.mnEnd = BigInt.asUintN(64, range.mnEnd - length);
        }
      }
      if (remove) this.maRanges.splice(i, 1);
      else i += 1;
    }
  }
  /** Original next range lookup; failed lookup leaves both lvalues unchanged. @param start - In/out size_t start cell. @param end - Output size_t end cell. @returns Found predicate. */
  NextWrong(start: [bigint], end: [bigint]): boolean {
    for (const range of this.maRanges) {
      if (range.mnEnd > start[0]) {
        start[0] = range.mnStart;
        end[0] = range.mnEnd;
        return true;
      }
    }
    return false;
  }
  /** Original exact range lookup with original early-stop order. @param start - Start. @param end - End. @returns Exact match. */
  HasWrong(start: bigint, end: bigint): boolean {
    for (const range of this.maRanges) {
      if (range.mnStart === start && range.mnEnd === end) return true;
      else if (range.mnStart >= start) break;
    }
    return false;
  }
  /** Original asymmetric overlap predicate and early stop. @param start - Query start. @param end - Query end. @returns Overlap. */
  HasAnyWrong(start: bigint, end: bigint): boolean {
    for (const range of this.maRanges) {
      if (range.mnEnd >= start && range.mnStart < end) return true;
      else if (range.mnStart >= end) break;
    }
    return false;
  }
  /** Original sorted-position insertion, including source split adjustment on a matching start. @param start - New start. @param end - New end. @returns Nothing. */
  InsertWrong(start: bigint, end: bigint): void {
    start = BigInt.asUintN(64, start);
    end = BigInt.asUintN(64, end);
    const index = this.maRanges.findIndex(
      /** Original first range whose start is at least the inserted start. @param range - Candidate. @returns Native predicate. */
      (range) => range.mnStart >= start,
    );
    if (index >= 0) {
      const old = this.maRanges[index] as MisspellRange;
      if (old.mnStart === start && old.mnEnd > end) old.mnStart = BigInt.asUintN(64, end + 1n);
      this.maRanges.splice(index, 0, new MisspellRange(start, end));
    } else this.maRanges.push(new MisspellRange(start, end));
  }
  /** Original invalidation from first/last ranges only. @returns Nothing. */
  MarkWrongsInvalid(): void {
    if (this.maRanges.length !== 0)
      this.SetInvalidRange(
        (this.maRanges[0] as MisspellRange).mnStart,
        (this.maRanges[this.maRanges.length - 1] as MisspellRange).mnEnd,
      );
  }
  /** Original independent complete stored-state copy. @returns Actual wrong list. */
  Clone(): WrongList {
    return new WrongList(this);
  }
  /** Original complete invalid-interval and ordered-range equality. @param other - Actual source. @returns Equality. */
  equals(other: WrongListConstReference): boolean {
    if (
      this.mnInvalidStart !== other.GetInvalidStart() ||
      this.mnInvalidEnd !== other.GetInvalidEnd()
    )
      return false;
    const ranges = other.GetRanges();
    return (
      this.maRanges.length === ranges.length &&
      this.maRanges.every(
        /** Original two-endpoint range comparison. @param range - Local range. @param index - Source index. @returns Equality. */
        (range, index) =>
          range.mnStart === (ranges[index] as MisspellRange).mnStart &&
          range.mnEnd === (ranges[index] as MisspellRange).mnEnd,
      )
    );
  }
  /** Original vector emptiness. @returns Empty predicate. */
  empty(): boolean {
    return this.maRanges.length === 0;
  }
  /** Original vector value push. @param range - Native source range. @returns Nothing. */
  push_back(range: Readonly<MisspellRange>): void {
    this.maRanges.push(new MisspellRange(range));
  }
  /** Original borrowed mutable back value; nonempty vector is the native precondition. @returns Actual range. */
  back(): MisspellRange {
    return this.maRanges[this.maRanges.length - 1] as MisspellRange;
  }
}
