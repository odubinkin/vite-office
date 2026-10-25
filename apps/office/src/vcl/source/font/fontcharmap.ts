/** @fileoverview Native FontCharMap range/value operations from vcl/source/font/fontcharmap.cxx; ownership uses JavaScript lifetime. */

const defaultUnicodeRanges = [0x20, 0xd800, 0xe000, 0xfff0] as const;
const defaultSymbolRanges = [0x20, 0x100, 0xf020, 0xf100] as const;

/** Immutable half-open character ranges, in the source's sorted endpoint representation. */
export class FontCharMap {
  private readonly ranges: readonly number[];
  private readonly count: number;

  /** Creates the native default map or takes a detached range value. @param ranges - Ordered start/end pairs supplied by the font face. @returns Character map. */
  public constructor(ranges: readonly number[] = defaultUnicodeRanges) {
    this.ranges = ranges.map(
      /** Retains the native sal_UCS4 vector element type. @param value - Endpoint. @returns Unsigned endpoint. */
      (value) => value >>> 0,
    );
    let count = 0;
    for (let i = 0; i < this.ranges.length; i += 2)
      count += (this.ranges[i + 1] as number) - (this.ranges[i] as number);
    this.count = count;
  }

  /** Returns the native default Unicode or Microsoft-symbol value. @param microsoftSymbolMap - Whether the face uses the symbol encoding. @returns Default map. */
  public static GetDefaultMap(microsoftSymbolMap: boolean): FontCharMap {
    return new FontCharMap(microsoftSymbolMap ? defaultSymbolRanges : defaultUnicodeRanges);
  }

  /** Compares ranges, rather than constructor provenance, like ImplFontCharMap. @returns Whether either default range vector matches. */
  public IsDefaultMap(): boolean {
    return [defaultUnicodeRanges, defaultSymbolRanges].some(
      /** Compares one complete source vector. @param ranges - Default vector. @returns Equality. */
      (ranges) =>
        this.ranges.length === ranges.length &&
        ranges.every(
          /** Compares an endpoint. @param value - Default endpoint. @param index - Endpoint position. @returns Equality. */
          (value, index) => this.ranges[index] === value,
        ),
    );
  }

  /** Returns the number of represented codepoints. @returns Population. */
  public GetCharCount(): number {
    return this.count;
  }

  /** Counts actual characters in an inclusive source interval. @param min - First requested codepoint. @param max - Last requested codepoint. @returns Native count. */
  public CountCharsInRange(min: number, max: number): number {
    min >>>= 0;
    max >>>= 0;
    let count = 0;
    let first = this.findRangeIndex(min);
    if (first & 1) ++first;
    else if (min > (this.ranges[first] as number)) count -= min - (this.ranges[first] as number);
    let last = this.findRangeIndex(max);
    if (last & 1) --last;
    else count -= (this.ranges[last + 1] as number) - max - 1;
    for (let i = first; i <= last; i += 2)
      count += (this.ranges[i + 1] as number) - (this.ranges[i] as number);
    return count;
  }

  /** Tests one codepoint against actual range endpoints. @param char - Codepoint. @returns Membership. */
  public HasChar(char: number): boolean {
    char >>>= 0;
    const range = this.findRangeIndex(char);
    if (range === 0 && char < (this.ranges[0] as number)) return false;
    return (range & 1) === 0;
  }

  /** Returns the first represented character. @returns First codepoint. */
  public GetFirstChar(): number {
    return this.ranges[0] as number;
  }

  /** Returns the last represented character. @returns Last codepoint. */
  public GetLastChar(): number {
    return (this.ranges[this.ranges.length - 1] as number) - 1;
  }

  /** Advances across gaps and saturates at the source endpoints. @param char - Current codepoint. @returns Next available codepoint. */
  public GetNextChar(char: number): number {
    char >>>= 0;
    if (char < this.GetFirstChar()) return this.GetFirstChar();
    if (char >= this.GetLastChar()) return this.GetLastChar();
    const range = this.findRangeIndex(char + 1);
    return range & 1 ? (this.ranges[range + 1] as number) : char + 1;
  }

  /** Walks backward across gaps and saturates at the source endpoints. @param char - Current codepoint. @returns Previous available codepoint. */
  public GetPrevChar(char: number): number {
    char >>>= 0;
    if (char <= this.GetFirstChar()) return this.GetFirstChar();
    if (char > this.GetLastChar()) return this.GetLastChar();
    const range = this.findRangeIndex(char - 1);
    return range & 1 ? (this.ranges[range] as number) - 1 : char - 1;
  }

  /** Resolves native population index, excluding gaps. @param char - Requested codepoint. @returns Zero-based index or minus one. */
  public GetIndexFromChar(char: number): number {
    char >>>= 0;
    let index = 0;
    for (let i = 0; i < this.ranges.length; i += 2) {
      const first = this.ranges[i] as number;
      const last = this.ranges[i + 1] as number;
      if (char >= last) index += last - first;
      else if (char >= first) return index + char - first;
      else break;
    }
    return -1;
  }

  /** Resolves the source index, including its out-of-bounds fallback to the first character. @param index - Native signed index. @returns Character. */
  public GetCharFromIndex(index: number): number {
    index |= 0;
    for (let i = 0; i < this.ranges.length; i += 2) {
      const first = this.ranges[i] as number;
      const last = this.ranges[i + 1] as number;
      index -= last - first;
      if (index < 0) return (last + index) >>> 0;
    }
    return this.GetFirstChar();
  }

  /** Performs the source endpoint binary search. @param char - Requested codepoint. @returns Start/end endpoint position. */
  private findRangeIndex(char: number): number {
    let lower = 0;
    let mid = Math.trunc(this.ranges.length / 2);
    let upper = this.ranges.length - 1;
    while (lower < upper) {
      if (char >= (this.ranges[mid] as number)) lower = mid;
      else upper = mid - 1;
      mid = Math.trunc((lower + upper + 1) / 2);
    }
    return mid;
  }
}
