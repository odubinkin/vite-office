/** @fileoverview Original ZipEntry aggregate, primitive scalar fields and implicit Unicode value ownership. Uninitialized scalar reads have no valid native contract. */
import { OUString } from "../../sal/inc/rtl/ustring";
/** Native aggregate declaration; default construction initializes only its OUString member. */
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
  sPath: OUString;
  /** Original default/copy construction. @param source - Optional original copy source. @returns Native aggregate value. */
  constructor(source?: ZipEntry) {
    if (source !== undefined) this.copyScalars(source);
    this.sPath = source === undefined ? new OUString() : new OUString(source.sPath);
  }
  /** Compiler-emitted scalar member copies retain source declaration order and exact initialized values. @param source - Native value. @returns Nothing. */
  private copyScalars(source: ZipEntry): void {
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
  /** Original implicit assignment copies scalars then assigns the actual OUString member. @param source - Borrowed value. @returns Same destination. */
  assign(source: ZipEntry): this {
    this.copyScalars(source);
    this.sPath.assign(source.sPath);
    return this;
  }
  /** Original implicit move construction copies scalar fields and move-constructs its Unicode member; Object.create erases only compiler-emitted construction syntax. @param source - Actual rvalue. @returns Native moved value. */
  static move(source: ZipEntry): ZipEntry {
    const result = Object.create(ZipEntry.prototype) as ZipEntry;
    result.copyScalars(source);
    result.sPath = OUString.move(source.sPath);
    return result;
  }
  /** Original implicit move assignment swaps the Unicode pointers after scalar copies. @param source - Actual rvalue. @returns Same destination. */
  moveAssign(source: ZipEntry): this {
    this.copyScalars(source);
    this.sPath.moveAssign(source.sPath);
    return this;
  }
  /** Original implicit destructor destroys the sole owned member exactly once. @returns Nothing. */
  dispose(): void {
    this.sPath.dispose();
  }
}
