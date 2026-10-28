/** @fileoverview Original internal OString literal and consumed ownership/search/copy methods; every dynamic value uses actual SAL byte data and C template owners. */
import {
  rtl_string_acquire,
  rtl_string_new,
  rtl_string_release,
  rtl_string_assign,
  rtl_string_newFromStr_WithLength,
  rtl_string_newFromSubString,
  rtl_str_indexOfChar_WithLength,
  rtl_str_indexOfStr_WithLength,
  type rtl_String,
  type rtl_StringSlot,
} from "./string.h";
import { SAL_NO_ACQUIRE, type __sal_NoAcquire } from "../types";
/** Original OStringLiteral str/more union over one static byte allocation. */
export class OStringLiteral {
  readonly more: rtl_String;
  readonly str: rtl_String;
  /** Original terminated literal initialization. @param literal - Bytes including terminator. @returns Literal. */
  constructor(literal: Uint8Array) {
    if (literal[literal.length - 1] !== 0) throw new Error("assert(literal[N - 1] == '\\0')");
    this.more = { refCount: 0x40000000, length: literal.length - 1, buffer: literal.slice() };
    this.str = this.more;
  }
  /** Original logical length. @returns Byte count. */ getLength(): number {
    return this.more.length;
  }
  /** Original terminated data view. @returns Borrowed bytes. */ getStr(): Uint8Array {
    return this.more.buffer;
  }
}
/** Const-reference surface of the implemented native OString methods. */
export type OStringConstReference = Readonly<
  Pick<OString, "pData" | "getLength" | "getStr" | "isEmpty" | "indexOf" | "copy">
>;
/** Original internal byte-string owner; numeric/concat/format and other conveniences remain unported. */
export class OString {
  private static readonly empty = new OStringLiteral(Uint8Array.of(0));
  private readonly slot: rtl_StringSlot = [null];
  /** Original public data pointer. @returns Actual SAL data. */ get pData(): rtl_String {
    return this.slot[0] as rtl_String;
  }
  /** Original unowned pointer field assignment. @param value - Data. @returns Nothing. */ set pData(
    value: rtl_String,
  ) {
    this.slot[0] = value;
  }
  /** Original address of data field. @returns Stable pointer slot. */ getDataAddress(): rtl_StringSlot {
    return this.slot;
  }
  /** Original selected default/copy/literal/bounded/no-acquire overloads. @param args - Declared native arguments. @returns Owner. */
  constructor(
    ...args:
      | []
      | [source: OStringConstReference | OStringLiteral | rtl_String]
      | [bytes: Uint8Array | null, length: number]
      | [source: rtl_String, noAcquire: __sal_NoAcquire]
  ) {
    if (args.length === 0) this.pData = OString.empty.str;
    else if (args.length === 2 && (args[0] === null || args[0] instanceof Uint8Array))
      rtl_string_newFromStr_WithLength(this.slot, args[0] as Uint8Array | null, args[1]);
    else if (args[0] instanceof OStringLiteral) this.pData = args[0].str;
    else {
      this.pData = (
        "pData" in (args[0] as OStringConstReference | rtl_String)
          ? (args[0] as OStringConstReference).pData
          : args[0]
      ) as rtl_String;
      if (args.length === 1 || args[1] !== SAL_NO_ACQUIRE) rtl_string_acquire(this.pData);
    }
  }
  /** Original move construction transfers and empties source. @param source - Actual rvalue. @returns Owner. */ static move(
    source: OString,
  ): OString {
    const result = new OString(source.pData, SAL_NO_ACQUIRE);
    source.slot[0] = null;
    rtl_string_new(source.slot);
    return result;
  }
  /** Original copy assignment acquires before release. @param source - Borrowed value. @returns This owner. */ assign(
    source: OStringConstReference,
  ): this {
    rtl_string_assign(this.slot, source.pData);
    return this;
  }
  /** Original move assignment releases destination and empties the transferred source. @param source - Rvalue. @returns This owner. */ moveAssign(
    source: OString,
  ): this {
    rtl_string_release(this.pData);
    this.pData = source.pData;
    source.slot[0] = null;
    rtl_string_new(source.slot);
    return this;
  }
  /** Original byte length. @returns Count excluding terminator. */ getLength(): number {
    return this.pData.length;
  }
  /** Original borrowed terminated storage. @returns Same actual buffer. */ getStr(): Uint8Array {
    return this.pData.buffer;
  }
  /** Original empty predicate. @returns Empty. */ isEmpty(): boolean {
    return this.pData.length === 0;
  }
  /** Original character or counted-view index search. @param needle - Declared char or view. @param fromIndex - Original default0. @returns Offset or -1. */
  indexOf(needle: number | Uint8Array, fromIndex = 0): number {
    if (fromIndex < 0) throw new Error("assert(fromIndex >= 0)");
    const data = this.getStr().subarray(fromIndex),
      length = this.getLength() - fromIndex;
    const ret =
      typeof needle === "number"
        ? rtl_str_indexOfChar_WithLength(data, length, needle)
        : rtl_str_indexOfStr_WithLength(data, length, needle, needle.length);
    return ret < 0 ? ret : ret + fromIndex;
  }
  /** Original substring construction shares a full range; other ranges allocate actual SAL data. @param beginIndex - Start. @param count - Original remaining-length overload when omitted. @returns Owned substring. */
  copy(beginIndex: number, count = this.getLength() - beginIndex): OString {
    const data: rtl_StringSlot = [null];
    rtl_string_newFromSubString(data, this.pData, beginIndex, count);
    return new OString(data[0] as rtl_String, SAL_NO_ACQUIRE);
  }
  /** Original byte owner destructor. @returns Nothing. */ dispose(): void {
    rtl_string_release(this.pData);
  }
}
