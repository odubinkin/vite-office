/** @fileoverview Original xmlreader Span header/core value contract; strict native UTF8 conversion reuses actual OUString/UNO values. */
import { OUString } from "../../sal/inc/rtl/ustring";
import { RuntimeException } from "../../cppu/inc/com/sun/star/uno/RuntimeException";
import { Reference } from "../../cppu/inc/com/sun/star/uno/Reference";

/** Erased const char pointer: an actual borrowed byte-indexed view, without an address/allocator wrapper. */
export type ByteView = ArrayLike<number>;

/** Original shallow value span; callers retain native valid byte-range/lifetime preconditions. */
export class Span {
  public begin: ByteView | null;
  declare private length_: number;
  /** Original default/raw/literal/implicit-copy construction; literals include their final array element and exclude it from length. @param args - Actual selected native form. @returns Value span. */
  constructor(...args: [] | [value: Span | ByteView] | [begin: ByteView | null, length: number]) {
    if (args.length === 0) {
      this.begin = null;
      this.length = 0;
    } else if (args.length === 2) {
      this.begin = args[0];
      this.length = args[1];
    } else if (args[0] instanceof Span) {
      this.begin = args[0].begin;
      this.length = args[0].length;
    } else {
      this.begin = args[0];
      this.length = args[0].length - 1;
    }
  }
  /** Original signed32 length field. @returns Stored length. */
  public get length(): number {
    return this.length_;
  }
  /** Original field conversion at its public boundary. @param value - Scalar. @returns Nothing. */
  public set length(value: number) {
    this.length_ = value | 0;
  }
  /** Original clear changes only begin, retaining length. @returns Nothing. */
  public clear(): void {
    this.begin = null;
  }
  /** Original pointer-presence query. @returns Whether present. */
  public is(): boolean {
    return this.begin !== null;
  }
  /** Original length and memcmp byte equality, including the literal overload. @param value - Actual span or complete literal array. @returns Equality. */
  public operatorEquals(value: Span | ByteView): boolean {
    const other = value instanceof Span ? value : new Span(value);
    if (this.length !== other.length) return false;
    for (let i = 0; i < this.length; i++)
      if (
        (((this.begin as ByteView)[i] as number) & 0xff) !==
        (((other.begin as ByteView)[i] as number) & 0xff)
      )
        return false;
    return true;
  }
  /** Original inequality forwards to equality. @param value - Actual span/literal. @returns Inequality. */
  public operatorNotEquals(value: Span | ByteView): boolean {
    return !this.operatorEquals(value);
  }
  /** Original explicit pointer/length equality. @param begin - Actual byte view. @param length - Signed32 length. @returns Equality. */
  public equals(begin: ByteView | null, length: number): boolean {
    return this.operatorEquals(new Span(begin, length));
  }
  /** Original strict UTF8 conversion: all malformed input fails and BOM remains without GLOBAL_SIGNATURE. @returns Actual Unicode value. */
  public convertFromUtf8(): OUString {
    const bytes = new Uint8Array(this.length);
    for (let i = 0; i < this.length; i++) bytes[i] = (this.begin as ByteView)[i] as number;
    let decoded: string;
    try {
      decoded = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
    } catch {
      throw new RuntimeException(
        new OUString(
          new Uint8Array([
            99, 97, 110, 110, 111, 116, 32, 99, 111, 110, 118, 101, 114, 116, 32, 102, 114, 111,
            109, 32, 85, 84, 70, 45, 56, 0,
          ]),
        ),
        new Reference(),
      );
    }
    const units = new Uint16Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) units[i] = decoded.charCodeAt(i);
    return new OUString(units, units.length);
  }
}
