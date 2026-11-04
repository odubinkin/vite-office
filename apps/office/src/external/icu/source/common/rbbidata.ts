/** @fileoverview Original ICU78.3 RBBIDataWrapper raw-data constructors and operational bodies. Actual UDataMemory construction is not substituted by these overloads. Native descriptor/backing deallocation is managed by JS GC; allocator/thread/ABI and use after final release remain outside this binding. */
import { RBBIDataHeader, RBBIStateTable, RBBI_DATA_FORMAT_VERSION } from "./rbbidata.h";
import type { UCPTrie } from "./unicode/ucptrie";
import { ucptrie_getValueWidth, ucptrie_openFromBinary } from "./unicode/ucptrie";
import { UCPTrieType, UCPTrieValueWidth } from "./unicode/ucptrie";
import { UErrorCode as E, U_FAILURE } from "./unicode/utypes";
import { UnicodeString } from "./unistr";
import { StringPiece } from "./unicode/stringpiece";
/** Original owning/borrowed raw rule-data owner; no alternate file/rule/iterator factory. */
export class RBBIDataWrapper {
  static readonly kDontAdopt = 0;
  fHeader: RBBIDataHeader | null = null;
  fForwardTable: RBBIStateTable | null = null;
  fReverseTable: RBBIStateTable | null = null;
  fRuleSource: Uint8Array | null = null;
  fRuleStatusTable: Int32Array | null = null;
  fStatusMaxIdx!: number;
  fTrie: UCPTrie | null = null;
  private fRefCount = 0;
  private fUDataMem: null = null;
  private readonly fRuleString = new UnicodeString();
  private fDontFreeData = true;
  /** Original raw-data constructor. @param data - Actual header/allocation. @param status - Source status. @returns Owner. */
  constructor(data: RBBIDataHeader, status: [number]);
  /** Original nonadopting raw-data constructor. @param data - Actual header/allocation. @param dontAdopt - Original kDontAdopt tag. @param status - Source status. @returns Owner. */
  constructor(data: RBBIDataHeader, dontAdopt: number, status: [number]);
  /** Original init0/init and post-init dont-adopt assignment order. @param data - Actual header. @param second - Status or tag. @param third - Status for the tagged overload. @returns Owner. */
  constructor(data: RBBIDataHeader, second: [number] | number, third?: [number]) {
    this.init0();
    this.init(data, typeof second === "number" ? (third as [number]) : second);
    if (typeof second === "number") this.fDontFreeData = true;
  }
  /** Original version check examines only the major byte. @param version - Actual version bytes. @returns Acceptable. */
  static isDataVersionAcceptable(version: ArrayLike<number>): boolean {
    return version[0] === RBBI_DATA_FORMAT_VERSION[0];
  }
  /** Original reset does not initialize fStatusMaxIdx or clear the value-member rule string. @returns Nothing. */
  init0(): void {
    this.fHeader = null;
    this.fForwardTable = null;
    this.fReverseTable = null;
    this.fRuleSource = null;
    this.fRuleStatusTable = null;
    this.fTrie = null;
    this.fUDataMem = null;
    this.fRefCount = 0;
    this.fDontFreeData = true;
  }
  /** Original initialization order, checks and typed borrowed fields. @param data - Actual readable raw binary header/allocation. @param status - Shared status. @returns Nothing. */
  init(data: RBBIDataHeader, status: [number]): void {
    if (U_FAILURE(status[0])) return;
    this.fHeader = data;
    if (data.fMagic !== 0xb1a0 || !RBBIDataWrapper.isDataVersionAcceptable(data.fFormatVersion)) {
      status[0] = E.U_INVALID_FORMAT_ERROR;
      return;
    }
    this.fDontFreeData = false;
    if (data.fFTableLen !== 0)
      this.fForwardTable = new RBBIStateTable(data.data.subarray(data.fFTable));
    if (data.fRTableLen !== 0)
      this.fReverseTable = new RBBIStateTable(data.data.subarray(data.fRTable));
    this.fTrie = ucptrie_openFromBinary(
      UCPTrieType.UCPTRIE_TYPE_FAST,
      UCPTrieValueWidth.UCPTRIE_VALUE_BITS_ANY,
      data.data.subarray(data.fTrie),
      data.fTrieLen,
      null,
      status,
    );
    if (U_FAILURE(status[0])) return;
    const width = ucptrie_getValueWidth(this.fTrie as UCPTrie);
    if (
      width !== UCPTrieValueWidth.UCPTRIE_VALUE_BITS_8 &&
      width !== UCPTrieValueWidth.UCPTRIE_VALUE_BITS_16
    ) {
      status[0] = E.U_INVALID_FORMAT_ERROR;
      return;
    }
    this.fRuleSource = data.data.subarray(data.fRuleSource);
    this.fRuleString.assign(
      UnicodeString.fromUTF8(new StringPiece(this.fRuleSource, data.fRuleSourceLen)),
    );
    this.fRuleStatusTable = new Int32Array(
      data.data.buffer,
      data.data.byteOffset + data.fStatusTable,
      Math.trunc(data.fStatusTableLen / 4),
    );
    this.fStatusMaxIdx = Math.trunc(data.fStatusTableLen / 4);
    this.fRefCount = 1;
  }
  /** Original identity/length/full-byte equality. Native initialized-header/readable-span preconditions apply. @param other - Actual owner. @returns Equality. */
  equals(other: RBBIDataWrapper): boolean {
    if (this.fHeader === other.fHeader) return true;
    const left = this.fHeader as RBBIDataHeader,
      right = other.fHeader as RBBIDataHeader;
    if (left.data.buffer === right.data.buffer && left.data.byteOffset === right.data.byteOffset)
      return true;
    if (left.fLength !== right.fLength) return false;
    for (let i = 0; i < left.fLength; ++i) if (left.data[i] !== right.data[i]) return false;
    return true;
  }
  /** Original signed32 projection of forward-table byte length. @returns Source hash. */
  hashCode(): number {
    return (this.fHeader as RBBIDataHeader).fFTableLen | 0;
  }
  /** Original acquired same-owner return. @returns This owner. */
  addReference(): this {
    this.fRefCount = (this.fRefCount + 1) | 0;
    return this;
  }
  /** Original decrement, including zero/negative-counter behavior. Final descriptor/backing deletion releases actual managed references; use after final release is outside the native contract. @returns Nothing. */
  removeReference(): void {
    this.fRefCount = (this.fRefCount - 1) | 0;
    if (this.fRefCount === 0) this.destroy();
  }
  /** Raw-data destructor branch. No UDataMemory constructor or fake close provider is supplied; that member stays null in the represented overloads. GC releases adopted backing storage after owner references are dropped. @returns Nothing. */
  private destroy(): void {
    this.fTrie = null;
    if (this.fUDataMem === null && !this.fDontFreeData) {
      this.fHeader = null;
      this.fForwardTable = null;
      this.fReverseTable = null;
      this.fRuleSource = null;
      this.fRuleStatusTable = null;
    }
  }
  /** Original borrowed const value member. @returns Actual rule source. */
  getRuleSourceString(): Pick<
    UnicodeString,
    "length" | "getBuffer" | "isBogus" | "isEmpty" | "charAt" | "char32At"
  > {
    return this.fRuleString;
  }
}
