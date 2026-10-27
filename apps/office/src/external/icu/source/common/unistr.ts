/** @fileoverview Consumed ICU78.3 UnicodeString UTF-16 value constructors, copying, equality and scalar queries for timezone identity. Host string allocation rejection maps to the consumed native bogus-state contract; native allocation/buffer/alias/ABI APIs remain unported. */
/** Internal storage admission preserves the native signed32 addition boundary independently of any host allocation limit. @param requestedLength - Nonnegative requested UTF16 capacity, before allocating storage. @returns Nothing on admission; throws on signed32 overflow for the owning operation to convert to bogus state. */
export function checkUnicodeStringLength(requestedLength: number): void {
  if (requestedLength > 2147483647)
    throw new RangeError("UnicodeString length exceeds signed32 storage");
}

/** Consumed UnicodeString value owner; JavaScript strings provide its actual readable UTF16 storage. */
export class UnicodeString {
  private value = "";
  private bogus = false;
  /** Original default/copy and const-char16 pointer constructors. JS strings project the supplied UTF-16 input; negative lengths use NUL termination. @param source - Copied value or UTF-16 source/null pointer. @param textLength - Explicit length or negative for NUL termination. @returns Constructed value. */
  constructor(source: UnicodeString | string | null = "", textLength = -1) {
    if (source instanceof UnicodeString) {
      this.assign(source);
      return;
    }
    if (source === null) return;
    textLength |= 0;
    const nul = source.indexOf("\0");
    this.value =
      textLength < 0 ? (nul < 0 ? source : source.slice(0, nul)) : source.slice(0, textLength);
  }
  /** Original UnicodeString assignment value contract, including bogus propagation and self assignment. @param source - Copied value. @returns This owner. */
  assign(source: UnicodeString): this {
    if (this !== source) {
      this.value = source.value;
      this.bogus = source.bogus;
    }
    return this;
  }
  /** Original whole-value remove also clears bogus state. Native buffer capacity/lifetime is projected by the owned JS value. @returns This owner. */
  remove(): this {
    this.value = "";
    this.bogus = false;
    return this;
  }
  /** Original native operator==, including two bogus values comparing equal. @param other - Compared value. @returns Equality. */
  equals(other: UnicodeString): boolean {
    return this.bogus ? other.bogus : !other.bogus && this.value === other.value;
  }
  /** Original whole-string UTF16 code-unit comparison, including bogus ordering. @param other - Compared string. @returns Minus one, zero or one. */
  compare(other: UnicodeString): number {
    if (other.bogus) return this.bogus ? 0 : 1;
    if (this.bogus) return -1;
    const length = Math.min(this.value.length, other.value.length);
    for (let i = 0; i < length; ++i) {
      const difference = this.value.charCodeAt(i) - other.value.charCodeAt(i);
      if (difference !== 0) return (difference >> 15) | 1;
    }
    return this.value.length < other.value.length
      ? -1
      : this.value.length > other.value.length
        ? 1
        : 0;
  }
  /** Original const getBuffer overload; JS string projects the borrowed UTF16 span, including embedded NUL. Writable/capacity overloads remain unported. @returns Borrowed value or null for bogus state. */
  getBuffer(): string | null {
    return this.bogus ? null : this.value;
  }
  /** Original UTF-16 length query. @returns Code-unit count. */
  length(): number {
    return this.value.length;
  }
  /** Original bogus flag query. @returns Bogus state. */
  isBogus(): boolean {
    return this.bogus;
  }
  /** Original empty-length query also returns true for bogus strings. @returns Empty. */
  isEmpty(): boolean {
    return this.value.length === 0;
  }
  /** Original invalid-code-unit sentinel for an out-of-range signed32 index. @param offset - UTF-16 offset. @returns Code unit or0xffff. */
  charAt(offset: number): number {
    offset |= 0;
    return offset >>> 0 < this.value.length ? this.value.charCodeAt(offset) : 0xffff;
  }
  /** Original U16_GET behavior combines a pair from either its lead or trail position. @param offset - UTF16 index. @returns Code point, lone surrogate or invalid0xffff. */
  char32At(offset: number): number {
    offset |= 0;
    if (offset >>> 0 >= this.value.length) return 0xffff;
    const unit = this.value.charCodeAt(offset);
    if (unit >= 0xd800 && unit <= 0xdbff && offset + 1 < this.value.length) {
      const trail = this.value.charCodeAt(offset + 1);
      if (trail >= 0xdc00 && trail <= 0xdfff)
        return ((unit - 0xd800) << 10) + trail - 0xdc00 + 0x10000;
    } else if (unit >= 0xdc00 && unit <= 0xdfff && offset > 0) {
      const lead = this.value.charCodeAt(offset - 1);
      if (lead >= 0xd800 && lead <= 0xdbff)
        return ((lead - 0xd800) << 10) + unit - 0xdc00 + 0x10000;
    }
    return unit;
  }
  /** Original bogus assignment discards text. @returns Nothing. */
  setToBogus(): void {
    this.value = "";
    this.bogus = true;
  }
  /** Original whole-value append: a bogus/empty source contributes no code units, and a bogus receiver stays unchanged. @param other - Appended value. @returns This owner. */
  append(other: UnicodeString): this {
    if (!this.bogus && other.length() !== 0) {
      try {
        checkUnicodeStringLength(this.length() + other.length());
        this.value += other.value;
      } catch {
        // Native doAppend/cloneArrayIfNeeded also discards the value when growth cannot allocate.
        this.setToBogus();
      }
    }
    return this;
  }
  /** Original operator+ constructs an empty result and appends both values; bogus zero-length operands do not propagate their flags. @param other - Right operand. @returns Independent result. */
  concat(other: UnicodeString): UnicodeString {
    // Each append owns the same checked growth/failure boundary as the original concatenation.
    return new UnicodeString().append(this).append(other);
  }
}
