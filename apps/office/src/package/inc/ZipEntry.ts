/** @fileoverview Original package/inc/ZipEntry.hxx aggregate, with native OUString value lifetime. Numeric default-initialized members remain uninitialized until their source producer assigns them. */
import { OUString } from "../../sal/inc/rtl/ustring";
/** Actual source record; integer width lowering is performed by the source reader/writer. */
export class ZipEntry {
  nVersion!: number;
  nFlag!: number;
  nMethod!: number;
  nTime!: number;
  nCrc!: number;
  nCompressedSize!: bigint;
  nSize!: bigint;
  nOffset!: bigint;
  nPathLen!: number;
  nExtraLen!: number;
  readonly sPath: OUString;
  /** Original aggregate default/copy construction; no invented integer defaults. @param source - Optional copied record or compiler-known aggregate value-initialization witness. @returns Record. */
  constructor(source?: ZipEntry | "value-initialized") {
    this.sPath = source instanceof ZipEntry ? new OUString(source.sPath) : new OUString();
    if (source === "value-initialized") {
      // Original std::make_unique<ZipEntry>() value-initializes aggregate scalar members.
      this.nVersion = this.nFlag = this.nMethod = this.nTime = this.nCrc = 0;
      this.nCompressedSize = this.nSize = this.nOffset = 0n;
      this.nPathLen = this.nExtraLen = 0;
    } else if (source) {
      this.nVersion = source.nVersion;
      this.nFlag = source.nFlag;
      this.nMethod = source.nMethod;
      this.nTime = source.nTime;
      this.nCrc = source.nCrc;
      this.nCompressedSize = source.nCompressedSize;
      this.nSize = source.nSize;
      this.nOffset = source.nOffset;
      this.nPathLen = source.nPathLen;
      this.nExtraLen = source.nExtraLen;
    }
  }
  /** Original compiler-generated record assignment, retaining owned string identity. @param source - Borrowed original record. @returns This record. */
  assign(source: ZipEntry): this {
    this.sPath.assign(source.sPath);
    this.nVersion = source.nVersion;
    this.nFlag = source.nFlag;
    this.nMethod = source.nMethod;
    this.nTime = source.nTime;
    this.nCrc = source.nCrc;
    this.nCompressedSize = source.nCompressedSize;
    this.nSize = source.nSize;
    this.nOffset = source.nOffset;
    this.nPathLen = source.nPathLen;
    this.nExtraLen = source.nExtraLen;
    return this;
  }
  /** Original native member destruction. @returns Nothing. */
  dispose(): void {
    this.sPath.dispose();
  }
}
