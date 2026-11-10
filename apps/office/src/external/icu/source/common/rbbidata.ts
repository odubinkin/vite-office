/** @fileoverview Original ICU78.3 raw-data and actual UDataMemory RBBIDataWrapper constructors. The real loader remains separate. Native descriptor/backing deallocation is managed by JS GC; allocator/thread/ABI and use after final release remain outside this binding. */
import { RBBIDataHeader, RBBIStateTable, RBBI_DATA_FORMAT_VERSION } from "./rbbidata.h";
import type { UCPTrie } from "./unicode/ucptrie";
import { ucptrie_getValueWidth, ucptrie_openFromBinary } from "./unicode/ucptrie";
import { UCPTrieType, UCPTrieValueWidth } from "./unicode/ucptrie";
import { UErrorCode as E, U_FAILURE } from "./unicode/utypes";
import { UnicodeString } from "./unistr";
import { StringPiece } from "./unicode/stringpiece";
import { UDataMemory } from "./udatamem.h";
import { udata_close } from "./unicode/udata";
import type { DataHeader } from "./ucmndata.h";
import { U_IS_BIG_ENDIAN, U_CHARSET_FAMILY } from "./unicode/platform";
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
  private fUDataMem: UDataMemory | null = null;
  private readonly fRuleString = new UnicodeString();
  private fDontFreeData = true;
  /** Original raw-data or data-handle constructors share this ESM signature. Null is readable only with pre-existing failure, as source. @param data - Actual header/allocation or initialized handle. @param status - Source status. @returns Owner. */
  constructor(data: RBBIDataHeader | UDataMemory | null, status: [number]);
  /** Original nonadopting raw-data constructor. @param data - Actual header/allocation. @param dontAdopt - Original kDontAdopt tag. @param status - Source status. @returns Owner. */
  constructor(data: RBBIDataHeader, dontAdopt: number, status: [number]);
  /** Original init0/init and post-init dont-adopt assignment order. @param data - Actual header. @param second - Status or tag. @param third - Status for the tagged overload. @returns Owner. */
  constructor(
    data: RBBIDataHeader | UDataMemory | null,
    second: [number] | number,
    third?: [number],
  ) {
    this.init0();
    const status = typeof second === "number" ? (third as [number]) : second;
    if (data instanceof RBBIDataHeader) {
      this.init(data, status);
      if (typeof second === "number") this.fDontFreeData = true;
    } else {
      if (U_FAILURE(status[0])) return;
      const memory = data as UDataMemory,
        header = memory.pHeader as DataHeader,
        headerSize = header.dataHeader.headerSize;
      if (!(
        headerSize >= 20 &&
        header.info.isBigEndian === U_IS_BIG_ENDIAN &&
        header.info.charsetFamily === U_CHARSET_FAMILY &&
        header.info.dataFormat[0] === 0x42 &&
        header.info.dataFormat[1] === 0x72 &&
        header.info.dataFormat[2] === 0x6b &&
        header.info.dataFormat[3] === 0x20 &&
        RBBIDataWrapper.isDataVersionAcceptable(header.info.formatVersion)
      )) {
        status[0] = E.U_INVALID_FORMAT_ERROR;
        return;
      }
      this.init(new RBBIDataHeader(header.data.subarray(headerSize)), status);
      // Original adoption is after init(), even if that call sets an error.
      this.fUDataMem = memory;
    }
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
  /** Original handle/raw destructor branches, with native free projected by managed ownership. GC releases adopted backing after references are dropped; heap-descriptor access after close is outside source contract. @returns Nothing. */
  private destroy(): void {
    this.fTrie = null;
    const dataOwned = this.fUDataMem !== null || !this.fDontFreeData;
    if (this.fUDataMem !== null) {
      udata_close(this.fUDataMem);
      this.fUDataMem = null;
    }
    if (dataOwned) {
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
