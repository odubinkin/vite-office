/** @fileoverview Original selected UNIX SvFileStream, including internal share-lock table and real OSL file operations. JS objects/buffers remain VM-managed; physical ABI, invalid pointers and native threading are unqualified. */
import { SvStream, StreamMode, STREAM_SEEK_TO_END, type BytePointer } from "./stream.native";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { rtl_TextEncoding } from "../../../sal/inc/rtl/textenc";
import { File, DirectoryItem, FileStatus, FileBase } from "../../../sal/inc/osl/file.hxx";
import * as osl from "../../../sal/inc/osl/file";
import {
  osl_File_OpenFlag_Trunc,
  osl_File_OpenFlag_NoExcl,
} from "../../../sal/inc/osl/detail/file";
import { Mutex, UniqueLock } from "../../../external/libcxx/mutex";
import { setErrno } from "../../../external/emscripten/file";
import { GetSvError, GetSvErrorErrno } from "./strmunx.errors";
import {
  SVSTREAM_LOCKING_VIOLATION,
  SVSTREAM_DISK_FULL,
  SVSTREAM_SEEK_ERROR,
  SVSTREAM_GENERALERROR,
} from "../../../comphelper/inc/errcode";
// Selected pinned SDK fcntl.h constants; F_RDLCK is zero, preserving the source early return.
const F_RDLCK = 0,
  F_WRLCK = 1;
let singleton: Mutex | undefined;
/** Original function-static native mutex. @returns Actual mutex. */
function LockMutex(): Mutex {
  return (singleton ??= new Mutex());
}
const gLocks = new Map<SvFileStream, DirectoryItem>();
/** Original item/stat lookup then identity-aware share-denial scan. @param stream - Actual stream. @returns Whether locking succeeds. */
function lockFile(stream: SvFileStream): boolean {
  const item = new DirectoryItem(),
    status = new FileStatus(osl.osl_FileStatus_Mask_Type);
  try {
    if (DirectoryItem.get(stream.GetFileName(), item) !== FileBase.E_None) return true;
    if (item.getFileStatus(status) !== FileBase.E_None) return true;
    if (status.getFileType() === FileStatus.Directory) return true;
    const guard = new UniqueLock(LockMutex());
    try {
      for (const [locked, lockedItem] of gLocks) {
        if (item.isIdenticalTo(lockedItem)) {
          const mode = locked.GetStreamMode(),
            incoming = stream.GetStreamMode();
          if (
            mode & StreamMode.SHARE_DENYALL ||
            (mode & StreamMode.SHARE_DENYWRITE && incoming & StreamMode.WRITE) ||
            (mode & StreamMode.SHARE_DENYREAD && incoming & StreamMode.READ)
          )
            return false;
        }
      }
      const old = gLocks.get(stream);
      if (old) old.assign(item);
      else gLocks.set(stream, new DirectoryItem(item));
      return true;
    } finally {
      guard.dispose();
    }
  } finally {
    status.dispose();
    item.dispose();
  }
}
/** Original guarded erase invokes the stored item's destructor. @param stream - Actual stream key. @returns Nothing. */
function unlockFile(stream: SvFileStream): void {
  const guard = new UniqueLock(LockMutex());
  try {
    gLocks.get(stream)?.dispose();
    gLocks.delete(stream);
  } finally {
    guard.dispose();
  }
}
/** Compiler void-pointer view/marshalling for actual byte/UNO sequence storage; no stream provider is introduced. @param data - Original bytes. @param count - Valid native span. @returns Actual byte view or copied sequence span. */
function bytes(data: BytePointer, count: number): Uint8Array | null {
  if (data === null) return null;
  if (ArrayBuffer.isView(data))
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  const result = new Uint8Array(count);
  for (let i = 0; i < count; i++) result[i] = (data.get(i) as [number])[0] & 255;
  return result;
}
/** Original final noncopyable file stream over actual source OSL handles. */
export class SvFileStream extends SvStream {
  private mxFileHandle: osl.oslFileHandle = null;
  private readonly aFilename = new OUString();
  private bIsOpen = false;
  /** Original default and filename/mode/optional-encoding constructors. @param args - Original overload operands. @returns Stream owner. */
  constructor(
    ...args: [] | [name: OUStringConstReference, mode: StreamMode, encoding?: rtl_TextEncoding]
  ) {
    super();
    if (args.length && args[2] !== undefined) this.SetStreamEncoding(args[2]);
    this.bIsOpen = false;
    this.m_isWritable = false;
    this.SetBufferSize(1024);
    if (args.length) {
      const system = new OUString();
      try {
        if (FileBase.getSystemPathFromFileURL(args[0], system) !== FileBase.E_None)
          system.assign(args[0]);
        this.Open(system, args[1]);
      } finally {
        system.dispose();
      }
    }
  }
  /** Original derived destructor closes before member/base destruction. @returns Nothing. */
  override dispose(): void {
    this.Close();
    this.aFilename.dispose();
    super.dispose();
  }
  /** Original open flag query. @returns Whether a handle is open. */
  IsOpen(): boolean {
    return this.bIsOpen;
  }
  /** Original const filename member borrow. @returns Borrowed original filename. */
  GetFileName(): OUStringConstReference {
    return this.aFilename;
  }
  /** Original raw read and unsigned wasm32 error sentinel. @param data - Destination. @param count - Native count. @returns Read count or size_t(-1). */
  protected override GetData(data: BytePointer, count: number): number {
    const read: [bigint] = [0n];
    if (this.IsOpen()) {
      const buffer = bytes(data, count),
        status = osl.osl_readFile(this.mxFileHandle, buffer, BigInt(count), read);
      if (data !== null && !ArrayBuffer.isView(data))
        for (let i = 0; i < count; i++)
          (data.get(i) as [number])[0] = (((buffer as Uint8Array)[i] as number) << 24) >> 24;
      if (status !== osl.oslFileError.None) {
        this.SetError(GetSvError(status));
        return 0xffffffff;
      }
    }
    return Number(read[0]);
  }
  /** Original raw write with zero-progress DISK_FULL and unsigned error sentinel. @param data - Source. @param count - Native count. @returns Written count or size_t(-1). */
  protected override PutData(data: BytePointer, count: number): number {
    const written: [bigint] = [0n];
    if (this.IsOpen()) {
      const status = osl.osl_writeFile(
        this.mxFileHandle,
        bytes(data, count),
        BigInt(count),
        written,
      );
      if (status !== osl.oslFileError.None) {
        this.SetError(GetSvError(status));
        return 0xffffffff;
      }
      if (!written[0]) {
        this.SetError(SVSTREAM_DISK_FULL);
        return 0xffffffff;
      }
    }
    return Number(written[0]);
  }
  /** Original absolute/end seek, truncated-sentinel assertion and SEEK_ERROR mapping. @param position - Original offset. @returns New offset or zero. */
  protected override SeekPos(position: bigint): bigint {
    if (position === 0xffffffffn)
      throw new Error("assert(nPos != sal_uInt64(sal_uInt32(STREAM_SEEK_TO_END)))");
    if (this.IsOpen()) {
      const status =
        position !== STREAM_SEEK_TO_END
          ? osl.osl_setFilePos(this.mxFileHandle, osl.osl_Pos_Absolut, BigInt.asIntN(64, position))
          : osl.osl_setFilePos(this.mxFileHandle, osl.osl_Pos_End, 0n);
      if (status !== osl.oslFileError.None) {
        this.SetError(SVSTREAM_SEEK_ERROR);
        return 0n;
      }
      if (position !== STREAM_SEEK_TO_END) return position;
      const result: [bigint] = [0n];
      osl.osl_getFilePos(this.mxFileHandle, result);
      return result[0];
    }
    this.SetError(SVSTREAM_GENERALERROR);
    return 0n;
  }
  /** Original actual sync, including closed-handle error translation. @returns Nothing. */
  protected override FlushData(): void {
    const status = osl.osl_syncFile(this.mxFileHandle);
    if (status !== osl.oslFileError.None) this.SetError(GetSvError(status));
  }
  /** Original share flags decision and internal lock call. @returns Whether locking succeeds. */
  private LockFile(): boolean {
    let lockMode = 0;
    if (!this.IsOpen()) return false;
    if (this.m_eStreamMode & StreamMode.SHARE_DENYALL)
      lockMode = this.m_isWritable ? F_WRLCK : F_RDLCK;
    if (this.m_eStreamMode & StreamMode.SHARE_DENYREAD) {
      if (this.m_isWritable) lockMode = F_WRLCK;
      else {
        this.SetError(SVSTREAM_LOCKING_VIOLATION);
        return false;
      }
    }
    if (this.m_eStreamMode & StreamMode.SHARE_DENYWRITE)
      lockMode = this.m_isWritable ? F_WRLCK : F_RDLCK;
    if (!lockMode) return true;
    return lockFile(this);
  }
  /** Original closed guard and internal erase. @returns Nothing. */
  private UnlockFile(): void {
    if (this.IsOpen()) unlockFile(this);
  }
  /** Original close/stat/flags/symlink replacement/open/read-only retry/lock sequence. @param name - Original filename. @param mode - Original open mode. @returns Nothing. */
  Open(name: OUStringConstReference, mode: StreamMode): void {
    this.Close();
    setErrno(0);
    this.m_eStreamMode = mode & ~StreamMode.TRUNC;
    this.aFilename.assign(name);
    const url = new OUString(),
      item = new DirectoryItem(),
      status = new FileStatus(osl.osl_FileStatus_Mask_Type | osl.osl_FileStatus_Mask_LinkTargetURL);
    try {
      if (File.getFileURLFromSystemPath(this.aFilename, url) !== FileBase.E_None)
        url.assign(this.aFilename);
      let valid = true;
      if (!(mode & StreamMode.TEMPORARY)) {
        valid =
          DirectoryItem.get(url, item) === FileBase.E_None &&
          item.getFileStatus(status) === FileBase.E_None;
        if (valid && status.getFileType() === FileStatus.Directory) {
          this.SetError(GetSvErrorErrno(31));
          return;
        }
      }
      let flags = !(mode & StreamMode.WRITE)
        ? osl.osl_File_OpenFlag_Read
        : !(mode & StreamMode.READ)
          ? osl.osl_File_OpenFlag_Write
          : osl.osl_File_OpenFlag_Read | osl.osl_File_OpenFlag_Write;
      if (!(mode & StreamMode.NOCREATE) && flags !== osl.osl_File_OpenFlag_Read)
        flags |= osl.osl_File_OpenFlag_Create;
      if (mode & StreamMode.TRUNC) flags |= osl_File_OpenFlag_Trunc;
      flags |= osl_File_OpenFlag_NoExcl | osl.osl_File_OpenFlag_NoLock;
      if (
        mode & StreamMode.WRITE &&
        mode & StreamMode.COPY_ON_SYMLINK &&
        valid &&
        status.getFileType() === FileStatus.Link
      ) {
        const target = status.getLinkTargetURL();
        try {
          if (target.getLength() > 0 && File.remove(url) === FileBase.E_None)
            File.copy(target, url);
        } finally {
          target.dispose();
        }
      }
      const handle: [osl.oslFileHandle] = [null];
      let result = osl.osl_openFile(url.pData, handle, flags);
      if (result !== osl.oslFileError.None && flags & osl.osl_File_OpenFlag_Write) {
        flags &= ~osl.osl_File_OpenFlag_Write;
        result = osl.osl_openFile(url.pData, handle, flags);
      }
      if (result === osl.oslFileError.None) {
        this.mxFileHandle = handle[0];
        this.bIsOpen = true;
        if (flags & osl.osl_File_OpenFlag_Write) this.m_isWritable = true;
        if (!this.LockFile()) {
          osl.osl_closeFile(handle[0]);
          this.bIsOpen = false;
          this.m_isWritable = false;
          this.mxFileHandle = null;
        }
      } else this.SetError(GetSvError(result));
    } finally {
      status.dispose();
      item.dispose();
      url.dispose();
    }
  }
  /** Original unlock/flush/ignored-close then buffer/error reset. @returns Nothing. */
  Close(): void {
    this.UnlockFile();
    if (this.IsOpen()) {
      this.FlushBuffer();
      osl.osl_closeFile(this.mxFileHandle);
      this.mxFileHandle = null;
    }
    this.bIsOpen = false;
    this.m_isWritable = false;
    this.ClearBuffer();
    this.ClearError();
  }
  /** Original reset clears errors/EOF without seeking despite its source comment. @returns Nothing. */
  override ResetError(): void {
    this.ClearError();
  }
  /** Original resize changes the actual file only when open. @param size - Original size. @returns Nothing. */
  protected override SetSize(size: bigint): void {
    if (this.IsOpen()) {
      const status = osl.osl_setFileSize(this.mxFileHandle, size);
      if (status !== osl.oslFileError.None) this.SetError(GetSvError(status));
    }
  }
}
