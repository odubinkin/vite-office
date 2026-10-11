/** @fileoverview Original Unicode StringNumber and lazy StringConcat specializations from include/rtl/stringconcat.hxx; runtime dispatch adapts erased C++ ToStringHelper types. */
import { rtl_ustr_toAsciiUpperCase_WithLength } from "./ustring.h";

/** Original fixed local number representation; capacity witnesses the erased template buffer size. */
export class StringNumber<T extends number | bigint = number | bigint> {
  /** Original fixed buffer; only formatted units and zero are initialized upstream. */
  readonly buf: Uint16Array;
  /** Original written length excluding zero. */
  length: number;
  /** Invokes the original formatter with its selected integral specialization. @param capacity - Erased original template buffer size. @param formatter - Actual C formatter. @param value - Original integral argument. @param radix - Original radix argument. @returns Initialized number representation. */
  constructor(
    capacity: number,
    formatter: (buffer: Uint16Array, value: T, radix: number) => number,
    value: T,
    radix: number,
  ) {
    this.buf = new Uint16Array(capacity);
    this.length = formatter(this.buf, value, radix);
  }
  /** Original borrowed local buffer access. @returns Same fixed storage. */
  getStr(): Uint16Array {
    return this.buf;
  }
  /** Adapts original implicit basic_string_view conversion without copying. @returns Borrowed logical units. */
  view(): Uint16Array {
    return this.buf.subarray(0, this.length);
  }
  /** Original rvalue ASCII-uppercase operation and same-object return. @returns This original number representation. */
  toAsciiUpperCase(): this {
    rtl_ustr_toAsciiUpperCase_WithLength(this.buf, this.length);
    return this;
  }
}
export { StringNumber as OUStringNumber };

/** Original empty concat marker; it chooses the unary template specialization and contributes no data. */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- original template marker is an empty type.
export class StringConcatMarker {}
export { StringConcatMarker as OUStringConcatMarker };
/** Actual original OUString/OUStringLiteral helper contract; no parallel string owner. */
interface UnicodeStringOperand {
  /** Original logical length access. @returns Logical length. */
  getLength(): number;
  /** Original borrowed initialized storage. @returns Source units. */
  getStr(): Uint16Array;
}
/** Erased original Unicode specializations: value/literal owner, number, concat, known-length view and const ASCII literal including zero. */
export type UnicodeConcatOperand =
  UnicodeStringOperand | StringNumber | StringConcat | Uint16Array | Uint8Array;

/** Original memcpy helper over borrowed UTF16 pointer offsets; zero length performs no source read. @param buffer - Borrowed destination pointer. @param data - Borrowed source units. @param length - Original count. @returns Pointer immediately after written units. */
export function addDataHelper(buffer: Uint16Array, data: Uint16Array, length: number): Uint16Array {
  if (length !== 0) buffer.set(data.subarray(0, length));
  return buffer.subarray(length);
}
/** Original ToStringHelper specializations selected by actual erased operand types. */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- original template traits expose static operations.
export class ToStringHelper {
  /** Original helper logical lengths and const-char-array guard. @param value - Borrowed original operand. @returns Exact logical length. */
  static length(value: UnicodeConcatOperand): number {
    if (value instanceof StringNumber) return value.length;
    if (value instanceof StringConcat) return value.length();
    if (value instanceof Uint8Array) {
      if (value.indexOf(0) !== value.length - 1)
        throw new Error("assert( strlen( str ) == N - 1 )");
      return value.length - 1;
    }
    if (value instanceof Uint16Array) return value.length;
    return value.getLength();
  }
  /** Original helper call operator, preserving left/right pointer offsets and borrowed input identity. @param buffer - Borrowed output pointer. @param value - Borrowed original operand. @returns Original pointer after output. */
  static call(buffer: Uint16Array, value: UnicodeConcatOperand): Uint16Array {
    if (value instanceof StringNumber) return addDataHelper(buffer, value.buf, value.length);
    if (value instanceof StringConcat) return value.addData(buffer);
    if (value instanceof Uint8Array) {
      const length = value.length - 1;
      for (let i = 0; i < length; i++) {
        const byte = value[i] as number;
        buffer[i] = (byte << 24) >> 24;
      }
      return buffer.subarray(length);
    }
    if (value instanceof Uint16Array) return addDataHelper(buffer, value, value.length);
    return addDataHelper(buffer, value.getStr(), value.getLength());
  }
}
/** Original expression tree retaining references rather than materializing intermediate strings. */
export class StringConcat {
  private readonly left: UnicodeConcatOperand | null;
  private readonly right: UnicodeConcatOperand;
  /** Original binary or marker-selected unary constructor. @param left - Borrowed left operand or original marker. @param right - Borrowed right operand. @returns Lazy original expression. */
  constructor(left: UnicodeConcatOperand | StringConcatMarker, right: UnicodeConcatOperand) {
    this.left = left instanceof StringConcatMarker ? null : left;
    this.right = right;
  }
  /** Original deferred sum of helper lengths; marker specialization has only its right operand. @returns Live expression length. */
  length(): number {
    return this.left === null
      ? ToStringHelper.length(this.right)
      : ToStringHelper.length(this.left) + ToStringHelper.length(this.right);
  }
  /** Original nested left-then-right helper writes. @param buffer - Borrowed output pointer. @returns Original pointer immediately after output. */
  addData(buffer: Uint16Array): Uint16Array {
    return this.left === null
      ? ToStringHelper.call(buffer, this.right)
      : ToStringHelper.call(ToStringHelper.call(buffer, this.left), this.right);
  }
}
export { StringConcat as OUStringConcat };
