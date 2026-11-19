/** @fileoverview Original inline tools::Guid strict parse, native string formatting, array/copy/generation and comparison contracts. JS VM owns the fixed byte array; pointer views borrow that allocation. */
import { rtl_createUuid, rtl_compareUuid } from "../../sal/inc/rtl/uuid";
import { OString } from "../../sal/inc/rtl/string";
import { OUString } from "../../sal/inc/rtl/ustring";
import { RTL_TEXTENCODING_ASCII_US } from "../../sal/inc/rtl/textenc";
/** Original fixed-array GUID value; move construction remains absent, as it is deleted upstream. */
export class Guid {
  static readonly Generate = 0 as const;
  private readonly maGuidArray = new Uint8Array(16);
  private readonly endPointer = this.maGuidArray.subarray(16);
  /** Original default, GenerateTag, array, string-view and copy constructors. Host strings lower the source ASCII string view; non-ASCII cannot form a valid GUID. @param source - Original selected operand. @returns GUID value. */
  constructor(source?: typeof Guid.Generate | Uint8Array | string | Guid) {
    if (source === Guid.Generate) rtl_createUuid(this.maGuidArray, null, false);
    else if (source instanceof Guid) this.maGuidArray.set(source.maGuidArray);
    else if (typeof source === "string") Guid.prototype.parse.call(this, source);
    else if (source !== undefined) this.maGuidArray.set(source.subarray(0, 16));
  }
  /** Original validates the complete braced string before writing any byte. @param text - Original string view. @returns Nothing. */
  private parse(text: string): void {
    if (
      text.length !== 38 ||
      text[0] !== "{" ||
      text[37] !== "}" ||
      text[9] !== "-" ||
      text[14] !== "-" ||
      text[19] !== "-" ||
      text[24] !== "-"
    )
      return;
    const digits = text.slice(1, -1).replaceAll("-", "");
    if (!/^[0-9a-fA-F]{32}$/u.test(digits)) return;
    for (let index = 0; index < 16; ++index)
      this.maGuidArray[index] = Number.parseInt(digits.slice(index * 2, index * 2 + 2), 16);
  }
  /** Original memberwise copy assignment preserves this array's addresses. @param other - Original source. @returns Nothing. */
  assign(other: Guid): void {
    this.maGuidArray.set(other.maGuidArray);
  }
  /** Original maximum-byte test on the fixed nonempty unsigned array. @returns Whether all bytes are zero. */
  isEmpty(): boolean {
    return Math.max(...this.maGuidArray) === 0;
  }
  /** Original mutable begin pointer. @returns Borrowed byte view. */
  begin(): Uint8Array {
    return this.maGuidArray;
  }
  /** Original stable end pointer. @returns Borrowed one-past-end view. */
  end(): Uint8Array {
    return this.endPointer;
  }
  /** Original const begin pointer. @returns Borrowed const byte view. */
  cbegin(): Readonly<Uint8Array> {
    return this.maGuidArray;
  }
  /** Original const end pointer. @returns Borrowed one-past-end view. */
  cend(): Readonly<Uint8Array> {
    return this.endPointer;
  }
  /** Original uppercase braced snprintf output is returned as an actual owned OString. @returns Owned source string. */
  getString(): OString {
    let digits = "";
    for (const value of this.maGuidArray)
      digits += value.toString(16).toUpperCase().padStart(2, "0");
    const text = `{${digits.slice(0, 8)}-${digits.slice(8, 12)}-${digits.slice(12, 16)}-${digits.slice(16, 20)}-${digits.slice(20)}}`;
    return new OString(
      Uint8Array.from(
        text + "\0",
        /** Binds original ASCII output bytes. @param unit - ASCII unit. @returns Byte. */ (unit) =>
          unit.charCodeAt(0),
      ),
      38,
    );
  }
  /** Original OStringToOUString ASCII conversion through the same native constructor. @returns Owned UTF16 string. */
  getOUString(): OUString {
    const text = Guid.prototype.getString.call(this);
    try {
      return new OUString(text.getStr(), text.getLength(), RTL_TEXTENCODING_ASCII_US);
    } finally {
      text.dispose();
    }
  }
  /** Original RTL equality. @param other - Original comparison operand. @returns Whether equal. */
  equals(other: Guid): boolean {
    return rtl_compareUuid(this.maGuidArray, other.maGuidArray) === 0;
  }
  /** Original nonvirtual equality call. @param other - Original comparison operand. @returns Whether unequal. */
  notEquals(other: Guid): boolean {
    return !Guid.prototype.equals.call(this, other);
  }
}
