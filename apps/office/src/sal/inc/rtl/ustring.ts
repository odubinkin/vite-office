/** @fileoverview Original internal OUString literal, lifetime and reference contracts from include/rtl/ustring.hxx. */
import {
  rtl_uString_acquire,
  rtl_uString_assign,
  rtl_uString_new,
  rtl_uString_newFromStr,
  rtl_uString_newFromAscii,
  rtl_uString_newFromLiteral,
  rtl_uString_newFromStr_WithLength,
  rtl_uString_release,
  rtl_uString_iterateCodePoints,
  rtl_ustr_compare_WithLength,
  rtl_ustr_toInt32,
  rtl_ustr_toInt64,
  rtl_ustr_reverseCompare_WithLength,
  rtl_ustr_hashCode_WithLength,
  rtl_ustr_asciil_reverseEquals_WithLength,
  rtl_ustr_indexOfChar_WithLength,
  rtl_ustr_lastIndexOfChar_WithLength,
  rtl_ustr_indexOfStr_WithLength,
  rtl_ustr_lastIndexOfStr_WithLength,
  rtl_ustr_lastIndexOfAscii_WithLength,
  rtl_uString_newFromSubString,
} from "./ustring.h";
import type { rtl_uString, rtl_uStringSlot } from "./ustring.h";
import { StringNumber, StringConcat, StringConcatMarker } from "./stringconcat";
import type { UnicodeConcatOperand } from "./stringconcat";
import {
  rtl_uString_alloc,
  rtl_ustr_valueOfInt32,
  rtl_ustr_valueOfInt64,
  RTL_USTR_MAX_VALUEOFINT32,
  RTL_USTR_MAX_VALUEOFINT64,
  RTL_USTR_MAX_VALUEOFDOUBLE,
  rtl_string2UString,
  OSTRING_TO_OUSTRING_CVTFLAGS,
} from "./ustring.h";
import type { rtl_TextEncoding } from "./textenc";
import { rtl_math_doubleToUString, rtl_math_StringFormat } from "./math.h";
import { SAL_NO_ACQUIRE } from "../types";
import { ConstCharArrayDetector } from "./stringutils";
import type { __sal_NoAcquire } from "../types";

/** Original literal's overlapping str/more storage; native template/layout/constant-expression checks remain compiler responsibilities. */
export class OUStringLiteral {
  /** Original active Data member with static-only reference flags. */
  readonly more: rtl_uString;
  /** Original union view of the very same data. */
  readonly str: rtl_uString;
  /** Copies a terminating UTF16 literal into its original static data. @param literal - Complete literal including its final zero. @returns Initialized literal owner. */
  constructor(literal: Uint16Array) {
    if (literal[literal.length - 1] !== 0) throw new Error("assert(literal[N - 1] == '\\0')");
    this.more = { refCount: 0x40000000, length: literal.length - 1, buffer: literal.slice() };
    this.str = this.more;
  }
  /** Original literal length. @returns Number of units excluding terminator. */
  getLength(): number {
    return this.more.length;
  }
  /** Original borrowed literal storage. @returns Same initialized buffer. */
  getStr(): Uint16Array {
    return this.more.buffer;
  }
}

/** Const-reference surface of the implemented original OUString contract; borrowed views cannot acquire mutating/destructor APIs through this type. */
export type OUStringConstReference = Readonly<
  Pick<
    OUString,
    | "iterateCodePoints"
    | "toInt32"
    | "toInt64"
    | "getLength"
    | "getStr"
    | "isEmpty"
    | "equals"
    | "equalsAsciiL"
    | "notEquals"
    | "compareTo"
    | "reverseCompareTo"
    | "hashCode"
    | "lessThan"
    | "greaterThan"
    | "lessThanOrEqual"
    | "greaterThanOrEqual"
    | "indexOf"
    | "lastIndexOf"
    | "lastIndexOfAsciiL"
    | "copy"
    | "subView"
  > & { pData: rtl_uString | null }
>;

/** Original OUString value owner; explicit move factories and dispose adapt C++ rvalues and destructor invocation. */
export class OUString {
  /** Original NUL-terminated signed32 query, with native radix and overflow rules. @param radix - Original default decimal radix. @returns Signed32 or zero. */
  public toInt32(radix = 10): number {
    return rtl_ustr_toInt32(this.pData.buffer, radix);
  }

  /** Original const NUL-terminated integer conversion;embedded zeros end parsing even when logical length continues. @param radix - Original default decimal radix. @returns Exact signed64 or zero on overflow. */
  public toInt64(radix = 10): bigint {
    return rtl_ustr_toInt64((this.pData as rtl_uString).buffer, radix);
  }
  private static readonly empty = new OUStringLiteral(new Uint16Array([0]));
  private static readonly references = new WeakMap<rtl_uStringSlot, OUStringConstReference>();
  private slot: rtl_uStringSlot;

  /** Original public pointer field; tuple storage also supports the original pointer-to-field reference contract. @returns Current data pointer. */
  get pData(): rtl_uString {
    return this.slot[0] as rtl_uString;
  }
  /** Writes the original public pointer field without ownership work. @param value - New pointer. @returns Nothing. */
  set pData(value: rtl_uString) {
    this.slot[0] = value;
  }

  /** Logical compiler binding for the original address expression &pData. The existing field storage and object identity are borrowed without acquisition or a second owner. @returns Live pointer-field address. */
  getDataAddress(): rtl_uStringSlot {
    OUString.references.set(this.slot, this);
    return this.slot;
  }

  /** Selects original constructor argument combinations; numeric input witnesses sal_Unicode, whose C++ type is erased in JS. @param args - Default, value, no-acquire or known-length arguments. @returns Initialized value owner. */
  constructor(
    ...args:
      | []
      | [
          value:
            | OUStringConstReference
            | OUStringLiteral
            | rtl_uString
            | Uint16Array
            | Uint8Array
            | number
            | StringNumber
            | StringConcat,
        ]
      | [value: rtl_uString, noAcquire: __sal_NoAcquire]
      | [value: Uint16Array | null, length: number]
      | [
          value: Uint8Array | null,
          length: number,
          encoding: rtl_TextEncoding,
          convertFlags?: number,
        ]
  ) {
    const [value, argument] = args;
    this.slot = [null];
    if (args.length >= 3) {
      rtl_string2UString(
        this.slot,
        value as Uint8Array | null,
        argument as number,
        args[2] as rtl_TextEncoding,
        args[3] ?? OSTRING_TO_OUSTRING_CVTFLAGS,
      );
      if (this.slot[0] === null) throw new Error("std::bad_alloc");
    } else if (value === undefined) this.pData = OUString.empty.str;
    else if (value instanceof StringConcat) {
      const length = value.length();
      this.pData = rtl_uString_alloc(length) as rtl_uString;
      if (length !== 0) {
        const end = value.addData(this.pData.buffer);
        this.pData.length = length;
        end[0] = 0;
      }
    } else if (value instanceof StringNumber) {
      rtl_uString_newFromStr_WithLength(this.slot, value.buf, value.length);
    } else if (value instanceof Uint8Array) {
      // The shared original trait binds the erased const char[N] extent and literal validity.
      const length = value.length - 1;
      if (!ConstCharArrayDetector.isValid(value))
        throw new Error(
          "assert(libreoffice_internal::ConstCharArrayDetector<T>::isValid(literal))",
        );
      if (length === 0) rtl_uString_new(this.slot);
      else rtl_uString_newFromLiteral(this.slot, value, length, 0);
    } else if (value instanceof OUStringLiteral) this.pData = value.str;
    else if (typeof value === "number")
      rtl_uString_newFromStr_WithLength(this.slot, new Uint16Array([value]), 1);
    else if (value === null || value instanceof Uint16Array) {
      if (argument === undefined) rtl_uString_newFromStr(this.slot, value);
      else rtl_uString_newFromStr_WithLength(this.slot, value, argument);
    } else {
      this.pData = ("pData" in value ? value.pData : value) as rtl_uString;
      if (argument !== SAL_NO_ACQUIRE) rtl_uString_acquire(this.pData);
    }
  }

  /** Original terminated-char createFromAscii overload, transferring actual C constructor ownership. The distinct string_view/literal overload remains a separate source responsibility. @param value - Borrowed terminated ASCII bytes or null. @returns Original no-acquire value owner. */
  static createFromAscii(value: Uint8Array | null): OUString {
    // The erased null pointer/buffer overloads differ: preserve the original no-acquire pointer result directly, including allocator failure.
    const result = Object.create(OUString.prototype) as OUString;
    result.slot = [null];
    rtl_uString_newFromAscii(result.slot, value);
    return result;
  }

  /** Original signed32/signed64 number overloads; bigint preserves the signed64 overload. Default radix is10. @param value - Original integral argument. @param radix - Original signed16 radix. @returns Original fixed local representation. */
  static number(value: number | bigint, radix = 10): StringNumber {
    return typeof value === "number"
      ? new StringNumber(RTL_USTR_MAX_VALUEOFINT32, rtl_ustr_valueOfInt32, value, radix)
      : new StringNumber(RTL_USTR_MAX_VALUEOFINT64, rtl_ustr_valueOfInt64, value, radix);
  }
  /** Original number(double) overload, explicitly named for the erased scalar type. Requests the original17 significant digits, G notation, dot and fractional-zero erasure; the formatter retains its own rounding policy. @param value - Native binary64. @returns Owned native string. */
  static numberDouble(value: number): OUString {
    const result: rtl_uStringSlot = [null];
    rtl_math_doubleToUString(
      result,
      null,
      0,
      value,
      rtl_math_StringFormat.rtl_math_StringFormat_G,
      RTL_USTR_MAX_VALUEOFDOUBLE - 9 + 1,
      46,
      null,
      0,
      true,
    );
    if (result[0] === null) throw new Error("std::bad_alloc");
    return new OUString(result[0], SAL_NO_ACQUIRE);
  }
  /** Original marker entry into lazy Unicode concatenation. @param value - Borrowed original operand. @returns Original unary expression. */
  static Concat(value: UnicodeConcatOperand): StringConcat {
    return new StringConcat(new StringConcatMarker(), value);
  }

  /** Original move constructor, resetting the source through the C empty constructor. @param source - Original rvalue owner. @returns Transferred owner. */
  static move(source: OUString): OUString {
    const result = Object.create(OUString.prototype) as OUString;
    result.slot = [source.pData];
    source.slot[0] = null;
    rtl_uString_new(source.slot);
    return result;
  }

  /** Original reinterpret reference over a caller's pointer field, with stable JS view identity and no constructor/acquire/release. @param slot - Live field storage. @returns Live const view following pointer replacement. */
  static unacquired(slot: rtl_uStringSlot): OUStringConstReference {
    let reference = OUString.references.get(slot);
    if (reference === undefined) {
      const view = Object.create(OUString.prototype) as OUString;
      view.slot = slot;
      reference = view;
      OUString.references.set(slot, reference);
    }
    return reference;
  }

  /** Original destructor; caller must invoke it exactly once at the end of a live owned lifetime. @returns Nothing. */
  dispose(): void {
    rtl_uString_release(this.pData);
  }
  /** Original copy assignment. @param source - Live source reference. @returns This owner. */
  assign(source: OUStringConstReference): this {
    rtl_uString_assign(this.slot, source.pData as rtl_uString);
    return this;
  }
  /** Original move assignment swaps both pointers, including self assignment. @param source - Rvalue owner. @returns This owner. */
  moveAssign(source: OUString): this {
    const data = this.pData;
    this.pData = source.pData;
    source.pData = data;
    return this;
  }
  /** Original clear delegates to the C empty constructor. @returns Nothing. */
  clear(): void {
    rtl_uString_new(this.slot);
  }
  /** Original direct length access, requiring live nonnull data. @returns Logical length. */
  getLength(): number {
    return this.pData.length;
  }
  /** Original codepoint forwarding with default increment one. @param indexUtf16 - Mutable unit index. @param incrementCodePoints - Signed codepoint increment. @returns Source codepoint. */
  iterateCodePoints(indexUtf16: [number], incrementCodePoints = 1): number {
    return rtl_uString_iterateCodePoints(this.pData, indexUtf16, incrementCodePoints);
  }
  /** Original empty predicate. @returns Whether logical length is zero. */
  isEmpty(): boolean {
    return this.pData.length === 0;
  }
  /** Original borrowed buffer access. @returns Actual backing storage. */
  getStr(): Uint16Array {
    return this.pData.buffer;
  }

  /** Original character and UTF16 string-view/const-reference search overloads. ASCII literal overloads remain separate. @param value - Character, borrowed UTF16 view or original string reference. @param fromIndex - Original starting offset. @returns First original unit offset or -1. */
  indexOf(value: number | Uint16Array | OUStringConstReference, fromIndex = 0): number {
    if (fromIndex < 0) throw new Error("assert(fromIndex >= 0)");
    const data = this.pData.buffer.subarray(fromIndex),
      length = this.pData.length - fromIndex;
    const result =
      typeof value === "number"
        ? rtl_ustr_indexOfChar_WithLength(data, length, value)
        : value instanceof Uint16Array
          ? rtl_ustr_indexOfStr_WithLength(data, length, value, value.length)
          : rtl_ustr_indexOfStr_WithLength(data, length, value.getStr(), value.getLength());
    return result < 0 ? result : result + fromIndex;
  }
  /** Original character and UTF16 string-view/const-reference reverse searches over the selected prefix. @param value - Character or original borrowed view/reference. @param fromIndex - Original exclusive prefix end. @returns Last original unit offset or -1. */
  lastIndexOf(
    value: number | Uint16Array | OUStringConstReference,
    fromIndex = this.pData.length,
  ): number {
    return typeof value === "number"
      ? rtl_ustr_lastIndexOfChar_WithLength(this.pData.buffer, fromIndex, value)
      : value instanceof Uint16Array
        ? rtl_ustr_lastIndexOfStr_WithLength(this.pData.buffer, fromIndex, value, value.length)
        : rtl_ustr_lastIndexOfStr_WithLength(
            this.pData.buffer,
            fromIndex,
            value.getStr(),
            value.getLength(),
          );
  }
  /** Original explicit known-length ASCII reverse search; C++ literal callers share this C owner. @param value - Original borrowed ASCII bytes. @param length - Explicit original byte count. @returns Last unit offset or -1. */
  lastIndexOfAsciiL(value: Uint8Array | null, length: number): number {
    return rtl_ustr_lastIndexOfAscii_WithLength(
      this.pData.buffer,
      this.pData.length,
      value,
      length,
    );
  }
  /** Original substring value construction through the real C owner and SAL_NO_ACQUIRE. @param beginIndex - Inclusive offset. @param count - Original count, or remainder for the one-argument overload. @returns Original owned string value. */
  copy(beginIndex: number, count = this.getLength() - beginIndex): OUString {
    const slot: rtl_uStringSlot = [null];
    rtl_uString_newFromSubString(slot, this.pData, beginIndex, count);
    return new OUString(slot[0] as rtl_uString, SAL_NO_ACQUIRE);
  }

  /** Original nonowning UTF16 substring view; native subarray preserves storage and unit offsets without copying or acquiring the string. Caller keeps its original owner alive and treats the borrowed units as const. @param beginIndex - Original inclusive signed32 offset. @param count - Original count, or the one-argument remainder overload. @returns Borrowed units without a terminator. */
  subView(beginIndex: number, count?: number): Uint16Array {
    if (beginIndex < 0) throw new Error("assert(beginIndex >= 0)");
    if (count === undefined) {
      if (beginIndex > this.getLength()) throw new Error("assert(beginIndex <= getLength())");
      return this.subView(beginIndex, this.getLength() - beginIndex);
    }
    if (count < 0) throw new Error("assert(count >= 0)");
    if (beginIndex > this.getLength()) throw new Error("assert(beginIndex <= getLength())");
    if (count > this.getLength() - beginIndex)
      throw new Error("assert(count <= getLength() - beginIndex)");
    return this.getStr().subarray(beginIndex, beginIndex + count);
  }

  /** Original normal comparison with the implicit string-view conversion of a live OUString reference. @param other - Original source reference. @returns Selected native UTF16 lexical result. */
  compareTo(other: OUStringConstReference): number {
    return rtl_ustr_compare_WithLength(
      this.pData.buffer,
      this.pData.length,
      other.getStr(),
      other.getLength(),
    );
  }
  /** Original reverse string-view comparison. @param other - Live reference. @returns Exact native reverse mismatch or length difference. */
  reverseCompareTo(other: OUStringConstReference): number {
    return rtl_ustr_reverseCompare_WithLength(
      this.pData.buffer,
      this.pData.length,
      other.getStr(),
      other.getLength(),
    );
  }
  /** Original equality checks lengths before pointer identity and reverse comparison. @param other - Live source reference. @returns Native equality result. */
  equals(other: OUStringConstReference): boolean {
    const data = other.pData as rtl_uString;
    if (this.pData.length !== data.length) return false;
    if (this.pData === data) return true;
    return (
      rtl_ustr_reverseCompare_WithLength(
        this.pData.buffer,
        this.pData.length,
        data.buffer,
        data.length,
      ) === 0
    );
  }
  /** Original friend inequality operator adapted to an explicit method. @param other - Live reference. @returns Negated equality. */
  notEquals(other: OUStringConstReference): boolean {
    return !this.equals(other);
  }
  /** Original known-length ASCII equality used by the literal operator== overload. @param asciiStr - Borrowed original char bytes. @param asciiStrLength - Native signed32 prefix length. @returns Original length guard and reverse equality. */
  equalsAsciiL(asciiStr: Uint8Array | null, asciiStrLength: number): boolean {
    asciiStrLength |= 0;
    if (this.pData.length !== asciiStrLength) return false;
    return rtl_ustr_asciil_reverseEquals_WithLength(this.pData.buffer, asciiStr, asciiStrLength);
  }
  /** Original less-than friend operator. @param other - Live reference. @returns Native ordering. */
  lessThan(other: OUStringConstReference): boolean {
    return this.compareTo(other) < 0;
  }
  /** Original greater-than friend operator. @param other - Live reference. @returns Native ordering. */
  greaterThan(other: OUStringConstReference): boolean {
    return this.compareTo(other) > 0;
  }
  /** Original less-than-or-equal friend operator. @param other - Live reference. @returns Native ordering. */
  lessThanOrEqual(other: OUStringConstReference): boolean {
    return this.compareTo(other) <= 0;
  }
  /** Original greater-than-or-equal friend operator. @param other - Live reference. @returns Native ordering. */
  greaterThanOrEqual(other: OUStringConstReference): boolean {
    return this.compareTo(other) >= 0;
  }
  /** Original public hash delegates to the common C polynomial hash owner. @returns Original signed32 hash. */
  hashCode(): number {
    return rtl_ustr_hashCode_WithLength(this.pData.buffer, this.pData.length);
  }
}

/** Original stateless OUStringHash functor; explicit call adapts operator() on the verified64-bit size_t target. */
export class OUStringHash {
  /** Original signed32-to-size_t conversion retains every unsigned64 bit. @param value - Live source reference. @returns Original size_t hash witness. */
  call(value: OUStringConstReference): bigint {
    return BigInt.asUintN(64, BigInt(value.hashCode()));
  }
}
