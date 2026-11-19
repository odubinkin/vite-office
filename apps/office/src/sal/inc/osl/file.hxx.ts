/** @fileoverview Original consumed include/osl/file.hxx FileBase URL/RC, consumed File operations and FileStatus/DirectoryItem wrappers; volume operations remain unbound. */
import * as header from "./file";
import type { ByteElements } from "../rtl/byteseq.h";
import {
  type oslFileStatus,
  type oslDirectoryItem,
  type oslDirectory,
  oslFileType,
  oslFileError as E,
} from "./file";
import { TimeValue } from "./time";
import { OUString, type OUStringConstReference } from "../rtl/ustring";
import { rtl_uString_release } from "../rtl/ustring.h";
import { fileStatusSize } from "../../../external/emscripten/file";
/** Original stateless filesystem base and consumed URL methods. Other source FileBase operations remain unbound. */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- original FileBase provides static API and inherited RC aliases.
export class FileBase {
  /** Original RC alias. */ static readonly E_None = E.None;
  /** Original RC alias. */ static readonly E_PERM = E.PERM;
  /** Original RC alias. */ static readonly E_NOENT = E.NOENT;
  /** Original RC alias. */ static readonly E_SRCH = E.SRCH;
  /** Original RC alias. */ static readonly E_INTR = E.INTR;
  /** Original RC alias. */ static readonly E_IO = E.IO;
  /** Original RC alias. */ static readonly E_NXIO = E.NXIO;
  /** Original RC alias. */ static readonly E_2BIG = E["2BIG"];
  /** Original RC alias. */ static readonly E_NOEXEC = E.NOEXEC;
  /** Original RC alias. */ static readonly E_BADF = E.BADF;
  /** Original RC alias. */ static readonly E_CHILD = E.CHILD;
  /** Original RC alias. */ static readonly E_AGAIN = E.AGAIN;
  /** Original RC alias. */ static readonly E_NOMEM = E.NOMEM;
  /** Original RC alias. */ static readonly E_ACCES = E.ACCES;
  /** Original RC alias. */ static readonly E_FAULT = E.FAULT;
  /** Original RC alias. */ static readonly E_BUSY = E.BUSY;
  /** Original RC alias. */ static readonly E_EXIST = E.EXIST;
  /** Original RC alias. */ static readonly E_XDEV = E.XDEV;
  /** Original RC alias. */ static readonly E_NODEV = E.NODEV;
  /** Original RC alias. */ static readonly E_NOTDIR = E.NOTDIR;
  /** Original RC alias. */ static readonly E_ISDIR = E.ISDIR;
  /** Original RC alias. */ static readonly E_INVAL = E.INVAL;
  /** Original RC alias. */ static readonly E_NFILE = E.NFILE;
  /** Original RC alias. */ static readonly E_MFILE = E.MFILE;
  /** Original RC alias. */ static readonly E_NOTTY = E.NOTTY;
  /** Original RC alias. */ static readonly E_FBIG = E.FBIG;
  /** Original RC alias. */ static readonly E_NOSPC = E.NOSPC;
  /** Original RC alias. */ static readonly E_SPIPE = E.SPIPE;
  /** Original RC alias. */ static readonly E_ROFS = E.ROFS;
  /** Original RC alias. */ static readonly E_MLINK = E.MLINK;
  /** Original RC alias. */ static readonly E_PIPE = E.PIPE;
  /** Original RC alias. */ static readonly E_DOM = E.DOM;
  /** Original RC alias. */ static readonly E_RANGE = E.RANGE;
  /** Original RC alias. */ static readonly E_DEADLK = E.DEADLK;
  /** Original RC alias. */ static readonly E_NAMETOOLONG = E.NAMETOOLONG;
  /** Original RC alias. */ static readonly E_NOLCK = E.NOLCK;
  /** Original RC alias. */ static readonly E_NOSYS = E.NOSYS;
  /** Original RC alias. */ static readonly E_NOTEMPTY = E.NOTEMPTY;
  /** Original RC alias. */ static readonly E_LOOP = E.LOOP;
  /** Original RC alias. */ static readonly E_ILSEQ = E.ILSEQ;
  /** Original RC alias. */ static readonly E_NOLINK = E.NOLINK;
  /** Original RC alias. */ static readonly E_MULTIHOP = E.MULTIHOP;
  /** Original RC alias. */ static readonly E_USERS = E.USERS;
  /** Original RC alias. */ static readonly E_OVERFLOW = E.OVERFLOW;
  /** Original RC alias. */ static readonly E_NOTREADY = E.NOTREADY;
  /** Original RC alias. */ static readonly E_invalidError = E.invalidError;
  /** Original RC alias. */ static readonly E_TIMEDOUT = E.TIMEDOUT;
  /** Original RC alias. */ static readonly E_NETWORK = E.NETWORK;
  /** Original temporary-directory URL wrapper. @param url - Actual output. @returns Source status. */
  static getTempDirURL(url: OUString): E {
    return header.osl_getTempDirURL(url.getDataAddress());
  }
  /** Original public system-path to URL wrapper. @param path - Original input. @param url - Actual output string. @returns Source status. */
  static getFileURLFromSystemPath(path: OUStringConstReference, url: OUString): E {
    return header.osl_getFileURLFromSystemPath(
      path.pData as NonNullable<OUStringConstReference["pData"]>,
      url.getDataAddress(),
    );
  }
  /** Original public URL to Unicode path wrapper. @param url - Original input. @param path - Actual output string. @returns Source status. */
  static getSystemPathFromFileURL(url: OUStringConstReference, path: OUString): E {
    return header.osl_getSystemPathFromFileURL(
      url.pData as NonNullable<OUStringConstReference["pData"]>,
      path.getDataAddress(),
    );
  }
}
/** Original File owner and consumed inline methods; copy construction/assignment are absent as deleted upstream. */
export class File extends FileBase {
  private readonly _pData: [header.oslFileHandle] = [null];
  private readonly _aPath: OUString;
  /** Original URL-copy constructor with null handle. @param url - Original file URL. @returns File owner. */
  constructor(url: OUStringConstReference) {
    super();
    this._aPath = new OUString(url);
  }
  /** Original destructor closes before destroying its URL member. @returns Nothing. */
  dispose(): void {
    this.close();
    this._aPath.dispose();
  }
  /** Original by-value URL query. @returns Owned URL copy. */
  getURL(): OUString {
    return new OUString(this._aPath);
  }
  /** Original direct open delegation; an existing handle is not implicitly closed. @param flags - Open flags. @returns Source status. */
  open(flags: number): E {
    return header.osl_openFile(this._aPath.pData, this._pData, flags);
  }
  /** Original close clears the handle even on close failure; closed owners return BADF. @returns Source status. */
  close(): E {
    let result = E.BADF;
    if (this._pData[0]) {
      result = header.osl_closeFile(this._pData[0]);
      this._pData[0] = null;
    }
    return result;
  }
  /** Original seek delegation. @param how - Origin. @param position - Signed offset. @returns Source status. */
  setPos(how: number, position: bigint): E {
    return header.osl_setFilePos(this._pData[0], how, position);
  }
  /** Original position delegation. @param position - Actual output. @returns Source status. */
  getPos(position: [bigint]): E {
    return header.osl_getFilePos(this._pData[0], position);
  }
  /** Original EOF delegation. @param eof - Output pointer or null. @returns Source status. */
  isEndOfFile(eof: [boolean] | null): E {
    return header.osl_isEndOfFile(this._pData[0], eof);
  }
  /** Original resize delegation. @param size - Unsigned size. @returns Source status. */
  setSize(size: bigint): E {
    return header.osl_setFileSize(this._pData[0], size);
  }
  /** Original size delegation. @param size - Output reference. @returns Source status. */
  getSize(size: [bigint]): E {
    return header.osl_getFileSize(this._pData[0], size);
  }
  /** Original read delegation. @param buffer - Destination. @param count - Requested count. @param read - Output reference. @returns Source status. */
  read(buffer: ByteElements | null, count: bigint, read: [bigint]): E {
    if (!this._pData[0] || buffer === null || count > 0x7fffffffn)
      return header.osl_readFile(
        this._pData[0],
        buffer === null ? null : new Uint8Array(0),
        count,
        read,
      );
    const view = fileByteView(buffer, Number(count));
    try {
      return header.osl_readFile(this._pData[0], view, count, read);
    } finally {
      if (!ArrayBuffer.isView(buffer))
        for (let index = 0; index < Number(count); ++index)
          (buffer.get(index) as [number])[0] = ((view[index] as number) << 24) >> 24;
    }
  }
  /** Original write delegation. @param buffer - Source. @param count - Requested count. @param written - Output reference. @returns Source status. */
  write(buffer: ByteElements | null, count: bigint, written: [bigint]): E {
    if (!this._pData[0] || buffer === null || count > 0x7fffffffn)
      return header.osl_writeFile(
        this._pData[0],
        buffer === null ? null : new Uint8Array(0),
        count,
        written,
      );
    return header.osl_writeFile(
      this._pData[0],
      fileByteView(buffer, Number(count)),
      count,
      written,
    );
  }
  /** Original synchronization delegation including null-handle status. @returns Source status. */
  sync(): E {
    return header.osl_syncFile(this._pData[0]);
  }
  /** Original static copy delegation. @param source - Source URL. @param destination - Destination URL. @returns Source status. */
  static copy(source: OUStringConstReference, destination: OUStringConstReference): E {
    return header.osl_copyFile(
      source.pData as NonNullable<typeof source.pData>,
      destination.pData as NonNullable<typeof destination.pData>,
    );
  }
  /** Original static remove delegation. @param url - File URL. @returns Source status. */
  static remove(url: OUStringConstReference): E {
    return header.osl_removeFile(url.pData as NonNullable<typeof url.pData>);
  }
}
/** Original FileStatus owner. The friend-visible status/mask fields are shared only with the original DirectoryItem implementation. */
export class FileStatus {
  static readonly Directory = oslFileType.Directory;
  static readonly Volume = oslFileType.Volume;
  static readonly Regular = oslFileType.Regular;
  static readonly Fifo = oslFileType.Fifo;
  static readonly Socket = oslFileType.Socket;
  static readonly Link = oslFileType.Link;
  static readonly Special = oslFileType.Special;
  static readonly Unknown = oslFileType.Unknown;
  readonly _aStatus: oslFileStatus;
  readonly _nMask: number;
  /** Original zero-initialized aggregate and native sizeof field, available before runtime initialization. @param mask - Requested field mask. @returns Owner. */
  constructor(mask: number) {
    this._nMask = mask >>> 0;
    this._aStatus = {
      uStructSize: fileStatusSize(),
      uValidFields: 0,
      eType: 0,
      uAttributes: 0n,
      aCreationTime: new TimeValue(0, 0),
      aAccessTime: new TimeValue(0, 0),
      aModifyTime: new TimeValue(0, 0),
      uFileSize: 0n,
      ustrFileName: null,
      ustrFileURL: null,
      ustrLinkTargetURL: null,
    };
  }
  /** Original three owned pointer-field releases. @returns Nothing. */
  dispose(): void {
    for (const key of ["ustrFileURL", "ustrLinkTargetURL", "ustrFileName"] as const) {
      const value = this._aStatus[key];
      if (value) rtl_uString_release(value);
      this._aStatus[key] = null;
    }
  }
  /** Original all-requested-bits validity check. @param mask - Field mask. @returns Validity. */
  isValid(mask: number): boolean {
    return (mask & this._aStatus.uValidFields) >>> 0 === mask >>> 0;
  }
  /** Original type getter returns Unknown when its valid bit is absent. @returns Source type. */
  getFileType(): oslFileType {
    return this.isValid(header.osl_FileStatus_Mask_Type)
      ? this._aStatus.eType
      : oslFileType.Unknown;
  }
  /** Original directory predicate includes volume entries. @returns Whether the valid source type is Directory or Volume. */
  isDirectory(): boolean {
    return this.getFileType() === FileStatus.Directory || this.getFileType() === FileStatus.Volume;
  }
  /** Original regular-file predicate. @returns Regular flag. */
  isRegular(): boolean {
    return this.getFileType() === FileStatus.Regular;
  }
  /** Original link predicate. @returns Link flag. */
  isLink(): boolean {
    return this.getFileType() === FileStatus.Link;
  }
  /** Original attributes scalar getter, without validity repair. @returns Current value. */
  getAttributes(): bigint {
    return this._aStatus.uAttributes;
  }
  /** Original creation time copy, without validity repair. @returns Independent value. */
  getCreationTime(): TimeValue {
    return new TimeValue(this._aStatus.aCreationTime.Seconds, this._aStatus.aCreationTime.Nanosec);
  }
  /** Original access time copy, without validity repair. @returns Independent value. */
  getAccessTime(): TimeValue {
    return new TimeValue(this._aStatus.aAccessTime.Seconds, this._aStatus.aAccessTime.Nanosec);
  }
  /** Original modification time copy, without validity repair. @returns Independent value. */
  getModifyTime(): TimeValue {
    return new TimeValue(this._aStatus.aModifyTime.Seconds, this._aStatus.aModifyTime.Nanosec);
  }
  /** Original size scalar getter, retaining the stored value even if validity has changed. @returns Current size. */
  getFileSize(): bigint {
    return this._aStatus.uFileSize;
  }
  /** Original filename value getter, empty on invalid field. @returns Owned value. */
  getFileName(): OUString {
    return this.isValid(header.osl_FileStatus_Mask_FileName)
      ? new OUString(this._aStatus.ustrFileName as NonNullable<oslFileStatus["ustrFileName"]>)
      : new OUString();
  }
  /** Original file URL value getter, empty on invalid field. @returns Owned value. */
  getFileURL(): OUString {
    return this.isValid(header.osl_FileStatus_Mask_FileURL)
      ? new OUString(this._aStatus.ustrFileURL as NonNullable<oslFileStatus["ustrFileURL"]>)
      : new OUString();
  }
  /** Original link URL value getter, empty on invalid field. @returns Owned value. */
  getLinkTargetURL(): OUString {
    return this.isValid(header.osl_FileStatus_Mask_LinkTargetURL)
      ? new OUString(
          this._aStatus.ustrLinkTargetURL as NonNullable<oslFileStatus["ustrLinkTargetURL"]>,
        )
      : new OUString();
  }
}
/** Original DirectoryItem owner, preserving release-before-get/assignment and native source identity behavior. */
export class DirectoryItem extends FileBase {
  /** Original private slot; Directory has source friend access within this module. */
  private readonly _pData: [oslDirectoryItem] = [null];
  /** Original empty/copy constructors. @param other - Optional original source. @returns Owner. */
  constructor(other?: DirectoryItem) {
    super();
    if (other) {
      this._pData[0] = other._pData[0];
      if (this._pData[0]) header.osl_acquireDirectoryItem(this._pData[0]);
    }
  }
  /** Original conditional release. @returns Nothing. */
  dispose(): void {
    if (this._pData[0]) header.osl_releaseDirectoryItem(this._pData[0]);
    this._pData[0] = null;
  }
  /** Original identity-aware assignment, releasing the old item before acquiring the new one. @param other - Original right operand. @returns This owner. */
  assign(other: DirectoryItem): this {
    if (other !== this) {
      if (this._pData[0]) header.osl_releaseDirectoryItem(this._pData[0]);
      this._pData[0] = other._pData[0];
      if (this._pData[0]) header.osl_acquireDirectoryItem(this._pData[0]);
    }
    return this;
  }
  /** Original handle-validity predicate. @returns Validity. */
  is(): boolean {
    return this._pData[0] !== null;
  }
  /** Original wrapper destroys the previous output item before calling the C get operation. @param url - Borrowed source URL. @param output - Actual output owner. @returns Source status. */
  static get(url: OUStringConstReference, output: DirectoryItem): E {
    if (output._pData[0]) {
      header.osl_releaseDirectoryItem(output._pData[0]);
      output._pData[0] = null;
    }
    return header.osl_getDirectoryItem(url.pData, output._pData);
  }
  /** Original friend status call using its saved field mask. @param status - Original status owner. @returns Source status. */
  getFileStatus(status: FileStatus): E {
    return header.osl_getFileStatus(this._pData[0], status._aStatus, status._nMask);
  }
  /** Original underlying identity comparison. @param other - Original peer. @returns Source identity. */
  isIdenticalTo(other: DirectoryItem): boolean {
    return header.osl_identicalDirectoryItem(this._pData[0], other._pData[0]);
  }
}

/** Original directory-creation observer interface. The actual Directory wrapper forwards this callback. */
export abstract class DirectoryCreationObserver {
  /** Original virtual creation notification. @param url - Borrowed original URL. @returns Nothing. */
  abstract DirectoryCreated(url: OUStringConstReference): void;
}
/** Original Directory cursor lifetime, enumeration and static creation/removal wrappers. */
export class Directory extends FileBase {
  private readonly _pData: [oslDirectory] = [null];
  private readonly _aPath: OUString;
  /** Original URL constructor, without opening. @param path - Fully qualified directory URL. @returns Directory wrapper. */
  constructor(path: OUStringConstReference) {
    super();
    this._aPath = new OUString(path);
  }
  /** Original destructor closes the cursor and destroys the path member. @returns Nothing. */
  dispose(): void {
    this.close();
    this._aPath.dispose();
  }
  /** Original by-value URL getter. @returns Owned URL. */
  getURL(): OUString {
    return new OUString(this._aPath);
  }
  /** Original open forwarding; repeated open retains the source overwrite behavior. @returns Source status. */
  open(): E {
    return header.osl_openDirectory(this._aPath.pData, this._pData);
  }
  /** Original cursor presence query. @returns Whether a handle exists. */
  isOpen(): boolean {
    return this._pData[0] !== null;
  }
  /** Original absent-handle BADF and unconditional nulling after close. @returns Source status. */
  close(): E {
    if (this._pData[0] === null) return E.BADF;
    const result = header.osl_closeDirectory(this._pData[0]);
    this._pData[0] = null;
    return result;
  }
  /** Original close then reopen, ignoring close status. @returns Open status. */
  reset(): E {
    this.close();
    return this.open();
  }
  /** Original friend access clears the old item before the C operation, including end-of-directory. @param item - Output item wrapper. @param hint - Original default zero. @returns Source status. */
  getNextItem(item: DirectoryItem, hint = 0): E {
    item["_pData"][0]?.release();
    item["_pData"][0] = null;
    return header.osl_getNextDirectoryItem(this._pData[0], item["_pData"], hint);
  }

  /** Original defaulted-flags creation wrapper. @param url - Original URL. @param flags - Original default flags. @returns Source status. */
  static create(
    url: OUStringConstReference,
    flags = header.osl_File_OpenFlag_Read | header.osl_File_OpenFlag_Write,
  ): E {
    return header.osl_createDirectoryWithFlags(url.pData as NonNullable<typeof url.pData>, flags);
  }
  /** Original remove wrapper. @param url - Original URL. @returns Source status. */
  static remove(url: OUStringConstReference): E {
    return header.osl_removeDirectory(url.pData as NonNullable<typeof url.pData>);
  }
  /** Original callback forwarding through the source temporary OUString. @param url - Original URL. @param observer - Actual observer or null. @returns Source status. */
  static createPath(
    url: OUStringConstReference,
    observer: DirectoryCreationObserver | null = null,
  ): E {
    return header.osl_createDirectoryPath(
      url.pData,
      observer ? onDirectoryCreated : null,
      observer,
    );
  }
}
/** Original implicit OUString pointer conversion acquires a temporary callback argument. @param data - Actual observer pointer. @param url - Original URL. @returns Nothing. */
function onDirectoryCreated(data: unknown, url: import("../rtl/ustring.h").rtl_uString): void {
  const value = new OUString(url);
  try {
    (data as DirectoryCreationObserver).DirectoryCreated(value);
  } finally {
    value.dispose();
  }
}

/** Compiler void-pointer marshalling between VM-managed UNO byte lvalues and the existing OSL typed-byte boundary; source bytes and unwritten tails are retained. @param data - Actual initialized byte span. @param count - Valid count after OSL handle/overflow guards. @returns Typed bytes, sharing existing typed views where possible. */
function fileByteView(data: ByteElements, count: number): Uint8Array {
  if (ArrayBuffer.isView(data))
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  const result = new Uint8Array(count);
  for (let index = 0; index < count; ++index)
    result[index] = (data.get(index) as [number])[0] & 255;
  return result;
}
