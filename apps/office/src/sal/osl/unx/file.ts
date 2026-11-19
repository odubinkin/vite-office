/** @fileoverview Original FD FileHandle_Impl buffered IO/position/size protocol and consumed OSL APIs from sal/osl/unx/file.cxx. Actual Emscripten FS supplies POSIX primitives; original approved native path open/security hook; original file URL open entry points are bound. KIND_MEM, line reading, mapping and native pthread profile remain unported. */
import { pathMax } from "../../../external/emscripten/file";
import { FileURLToPath } from "./file_url";
import type { rtl_uString } from "../../inc/rtl/ustring.h";
import { OString } from "../../inc/rtl/string";
import { isForbidden } from "./file.access";
import { open, lockFile, close } from "../../../external/emscripten/file";
import { getenv } from "../../../external/emscripten/locale";
import {
  osl_File_OpenFlag_Write,
  osl_File_OpenFlag_Create,
  osl_File_OpenFlag_NoLock,
} from "../../inc/osl/file";
export { setAllowedPaths, isForbidden } from "./file.access";
import { getFileSystem } from "../../../external/emscripten/runtime";
import {
  oslFileError as E,
  osl_Pos_Absolut,
  osl_Pos_Current,
  osl_Pos_End,
} from "../../inc/osl/file";
import { setErrno } from "../../../external/emscripten/file";
import {
  oslTranslateFileError,
  translateFileException as translateException,
} from "./file_error_transl";
/** Mirrors the libc syscall wrapper: a real SDK FS failure publishes errno before its OSL translation. @param error - Actual caught SDK exception. @returns Original error enum. */
function translateFileException(error: unknown): E {
  const result = translateException(error);
  setErrno((error as { errno: number }).errno);
  return result;
}
const MAX_OFF_T = 0x7fffffffffffffffn,
  MAX_SSIZE_T = 0x7fffffffn;
/** Source state flags. */
enum State {
  Seekable = 1,
  Readable = 2,
  Writeable = 4,
  Modified = 8,
}
/** Native pointer lvalue binding. */
type Count = [bigint];
/** Original FD owner. Buffer allocation is GC-managed; selected Emscripten non-pthread mutex primitives are no-ops. */
class FileHandle_Impl {
  m_state = State.Seekable | State.Readable;
  m_size = 0n;
  m_fileptr = 0n;
  m_bufptr = -1n;
  m_buflen = 0;
  readonly m_bufsiz = 65536; // sysconf(_SC_PAGESIZE), pinned musl arch/emscripten/bits/limits.h
  m_buffer: Uint8Array | null = new Uint8Array(this.m_bufsiz);
  /** Original KIND_FD construction. @param m_fd - Real libc descriptor. @returns Owner. */
  constructor(readonly m_fd: number) {}
  /** Original cached logical end includes dirty buffered bytes. @returns Logical size. */
  getSize(): bigint {
    const end = (this.m_bufptr > 0n ? this.m_bufptr : 0n) + BigInt(this.m_buflen);
    return this.m_size > end ? this.m_size : end;
  }
  /** Original ftruncate plus expand fallback and descriptor position restoration. @param size - Native offset. @returns Error code. */
  setSize(size: bigint): E {
    const fs = getFileSystem(),
      stream = fs.getStreamChecked(this.m_fd);
    try {
      fs.ftruncate(this.m_fd, Number(size));
    } catch (error) {
      const result = translateFileException(error);
      if (size <= this.getSize()) return result;
      let current: number;
      try {
        current = fs.llseek(stream, 0, 1);
      } catch (error) {
        translateFileException(error);
        return result;
      }
      try {
        fs.llseek(stream, Number(size - 1n), 0);
      } catch (error) {
        translateFileException(error);
        return result;
      }
      try {
        fs.write(stream, new Uint8Array(1), 0, 1);
      } catch (error) {
        translateFileException(error);
        try {
          fs.llseek(stream, current, 0);
        } catch (restore) {
          translateFileException(restore);
        }
        return result;
      }
      try {
        fs.llseek(stream, current, 0);
      } catch (error) {
        translateFileException(error);
        return result;
      }
    }
    this.m_size = size;
    return E.None;
  }
  /** Original pread; EOVERFLOW is deliberately treated as an empty successful read. @param offset - Position. @param buffer - Actual destination. @param count - Size. @param read - Output. @returns Error. */
  readAt(offset: bigint, buffer: Uint8Array, count: number, read: Count): E {
    if (!(this.m_state & State.Seekable)) return E.SPIPE;
    if (!(this.m_state & State.Readable)) return E.BADF;
    try {
      const fs = getFileSystem();
      read[0] = BigInt(fs.read(fs.getStreamChecked(this.m_fd), buffer, 0, count, Number(offset)));
    } catch (error) {
      const result = translateFileException(error);
      if (result !== E.OVERFLOW) return result;
      read[0] = 0n;
    }
    return E.None;
  }
  /** Original pwrite/size update. @param offset - Position. @param buffer - Source. @param count - Size. @param written - Output. @returns Error. */
  writeAt(offset: bigint, buffer: Uint8Array, count: number, written: Count): E {
    if (!(this.m_state & State.Seekable)) return E.SPIPE;
    if (!(this.m_state & State.Writeable)) return E.BADF;
    try {
      const fs = getFileSystem();
      written[0] = BigInt(
        fs.write(fs.getStreamChecked(this.m_fd), buffer, 0, count, Number(offset)),
      );
    } catch (error) {
      return translateFileException(error);
    }
    const end = offset + written[0];
    if (end > this.m_size) this.m_size = end;
    return E.None;
  }
  /** Original buffered read, preserving page refill/dirty flush and direct-read threshold. @param offset - Position. @param buffer - Destination. @param count - Size. @param read - Output. @returns Error. */
  readFileAt(offset: bigint, buffer: Uint8Array, count: number, read: Count): E {
    if (!(this.m_state & State.Seekable)) {
      try {
        const fs = getFileSystem();
        read[0] = BigInt(fs.read(fs.getStreamChecked(this.m_fd), buffer, 0, count));
        return E.None;
      } catch (error) {
        return translateFileException(error);
      }
    }
    if (!this.m_buffer) return this.readAt(offset, buffer, count, read);
    for (read[0] = 0n; count > 0;) {
      const pointer = (offset / BigInt(this.m_bufsiz)) * BigInt(this.m_bufsiz),
        position = Number(offset % BigInt(this.m_bufsiz));
      if (pointer !== this.m_bufptr) {
        let result = this.syncFile();
        if (result !== E.None) return result;
        this.m_bufptr = -1n;
        this.m_buflen = 0;
        const done: Count = [0n];
        if (count >= this.m_bufsiz) {
          result = this.readAt(offset, buffer.subarray(Number(read[0])), count, done);
          if (result !== E.None) return result;
          read[0] += done[0];
          return E.None;
        }
        result = this.readAt(pointer, this.m_buffer, this.m_bufsiz, done);
        if (result !== E.None) return result;
        this.m_bufptr = pointer;
        this.m_buflen = Number(done[0]);
      }
      if (position >= this.m_buflen) return E.None;
      const bytes = Math.min(this.m_buflen - position, count);
      buffer.set(this.m_buffer.subarray(position, position + bytes), Number(read[0]));
      count -= bytes;
      read[0] += BigInt(bytes);
      offset += BigInt(bytes);
    }
    return E.None;
  }
  /** Original buffered write, including read-before-partial-write and full-write IO check. @param offset - Position. @param buffer - Source. @param count - Size. @param written - Output. @returns Error. */
  writeFileAt(offset: bigint, buffer: Uint8Array, count: number, written: Count): E {
    if (!(this.m_state & State.Seekable)) {
      try {
        const fs = getFileSystem();
        written[0] = BigInt(fs.write(fs.getStreamChecked(this.m_fd), buffer, 0, count));
        return E.None;
      } catch (error) {
        return translateFileException(error);
      }
    }
    if (!this.m_buffer) return this.writeAt(offset, buffer, count, written);
    for (written[0] = 0n; count > 0;) {
      const pointer = (offset / BigInt(this.m_bufsiz)) * BigInt(this.m_bufsiz),
        position = Number(offset % BigInt(this.m_bufsiz));
      if (pointer !== this.m_bufptr) {
        let result = this.syncFile();
        if (result !== E.None) return result;
        this.m_bufptr = -1n;
        this.m_buflen = 0;
        const done: Count = [0n];
        if (count >= this.m_bufsiz) {
          result = this.writeAt(offset, buffer.subarray(Number(written[0])), count, done);
          if (result !== E.None) return result;
          if (done[0] !== BigInt(count)) return E.IO;
          written[0] += done[0];
          return E.None;
        }
        result = this.readAt(pointer, this.m_buffer, this.m_bufsiz, done);
        if (result !== E.None) return result;
        this.m_bufptr = pointer;
        this.m_buflen = Number(done[0]);
      }
      const bytes = Math.min(this.m_bufsiz - position, count),
        from = Number(written[0]);
      this.m_buffer.set(buffer.subarray(from, from + bytes), position);
      count -= bytes;
      written[0] += BigInt(bytes);
      offset += BigInt(bytes);
      this.m_buflen = Math.max(this.m_buflen, position + bytes);
      this.m_state |= State.Modified;
    }
    return E.None;
  }
  /** Original dirty-page writeback, clearing Modified only after full success. @returns Error. */
  syncFile(): E {
    if (this.m_state & State.Modified) {
      const done: Count = [0n],
        result = this.writeAt(this.m_bufptr, this.m_buffer as Uint8Array, this.m_buflen, done);
      if (result !== E.None) return result;
      if (done[0] !== BigInt(this.m_buflen)) return E.IO;
      this.m_state &= ~State.Modified;
    }
    return E.None;
  }
}
/** Original opaque OSL handle; no manufactured descriptor or replacement filesystem. */
export type oslFileHandle = FileHandle_Impl | null;
/** Original osl::detail constructor; assumes writeable even if the borrowed OS descriptor was opened readonly. @param fd - Actual libc descriptor. @returns Owning handle or null. */
export function createFileHandleFromFD(fd: number): oslFileHandle {
  if (fd === -1) return null;
  let stat;
  try {
    stat = getFileSystem().fstat(fd);
  } catch (error) {
    translateFileException(error);
    return null;
  }
  const handle = new FileHandle_Impl(fd);
  handle.m_state |= State.Writeable;
  if ((stat.mode & 0o170000) !== 0o100000) handle.m_state &= ~State.Seekable;
  else handle.m_size = BigInt(stat.size);
  return handle;
}
/** Original close flushes and still closes after a failed flush, returning the first failure. @param handle - Actual owner. @returns Error. */
export function osl_closeFile(handle: oslFileHandle): E {
  if (!handle || handle.m_fd < 0) return E.INVAL;
  let result = handle.syncFile();
  try {
    const fs = getFileSystem();
    fs.close(fs.getStreamChecked(handle.m_fd));
  } catch (error) {
    const closeError = translateFileException(error);
    if (result === E.None) result = closeError;
  }
  handle.m_buffer = null; // JS GC controls physical lifetime, source handle is destroyed here.
  return result;
}
/** Original syncFile then fsync; actual Emscripten fd_sync delegates stream_ops.fsync when present. @param handle - Actual owner. @returns Error. */
export function osl_syncFile(handle: oslFileHandle): E {
  if (!handle || handle.m_fd === -1) return E.INVAL;
  const result = handle.syncFile();
  if (result !== E.None) return result;
  try {
    const stream = getFileSystem().getStreamChecked(handle.m_fd),
      result = stream.stream_ops.fsync?.(stream) ?? 0;
    return result ? oslTranslateFileError(result) : E.None;
  } catch (error) {
    return translateFileException(error);
  }
}
/** Original sequential raw read with ssize_t bound and success-only logical cursor advance. @param handle - Owner. @param buffer - Destination pointer. @param requested - Unsigned count. @param read - Output lvalue. @returns Error. */
export function osl_readFile(
  handle: oslFileHandle,
  buffer: Uint8Array | null,
  requested: bigint,
  read: Count | null,
): E {
  if (!handle || handle.m_fd === -1 || !buffer || !read) return E.INVAL;
  if (requested > MAX_SSIZE_T) return E.OVERFLOW;
  const result = handle.readFileAt(handle.m_fileptr, buffer, Number(requested), read);
  if (result === E.None) handle.m_fileptr += read[0];
  return result;
}
/** Original sequential write and source writable/size checks. @param handle - Owner. @param buffer - Source. @param requested - Count. @param written - Output. @returns Error. */
export function osl_writeFile(
  handle: oslFileHandle,
  buffer: Uint8Array | null,
  requested: bigint,
  written: Count | null,
): E {
  if (!handle || handle.m_fd === -1 || !buffer || !written) return E.INVAL;
  if (!(handle.m_state & State.Writeable)) return E.BADF;
  if (requested > MAX_SSIZE_T) return E.OVERFLOW;
  const result = handle.writeFileAt(handle.m_fileptr, buffer, Number(requested), written);
  if (result === E.None) handle.m_fileptr += written[0];
  return result;
}
/** Original positional read; does not modify logical cursor. @param handle - Owner. @param buffer - Destination. @param offset - Position. @param requested - Count. @param read - Output. @returns Error. */
export function osl_readFileAt(
  handle: oslFileHandle,
  offset: bigint,
  buffer: Uint8Array | null,
  requested: bigint,
  read: Count | null,
): E {
  if (!handle || handle.m_fd === -1 || !buffer || !read) return E.INVAL;
  if (!(handle.m_state & State.Seekable)) return E.SPIPE;
  if (offset > MAX_OFF_T || requested > MAX_SSIZE_T) return E.OVERFLOW;
  return handle.readFileAt(offset, buffer, Number(requested), read);
}
/** Original positional write; does not modify logical cursor. @param handle - Owner. @param buffer - Source. @param offset - Position. @param requested - Count. @param written - Output. @returns Error. */
export function osl_writeFileAt(
  handle: oslFileHandle,
  offset: bigint,
  buffer: Uint8Array | null,
  requested: bigint,
  written: Count | null,
): E {
  if (!handle || handle.m_fd === -1 || !buffer || !written) return E.INVAL;
  if (!(handle.m_state & State.Seekable)) return E.SPIPE;
  if (!(handle.m_state & State.Writeable)) return E.BADF;
  if (offset > MAX_OFF_T || requested > MAX_SSIZE_T) return E.OVERFLOW;
  return handle.writeFileAt(offset, buffer, Number(requested), written);
}
/** Original equality predicate, deliberately not >= when cursor is past EOF. @param handle - Owner. @param eof - Output. @returns Error. */
export function osl_isEndOfFile(handle: oslFileHandle, eof: [boolean] | null): E {
  if (!handle || handle.m_fd === -1 || !eof) return E.INVAL;
  eof[0] = handle.m_fileptr === handle.getSize();
  return E.None;
}
/** Original atomic logical position borrow; single-threaded profile. @param handle - Owner. @param position - Output. @returns Error. */
export function osl_getFilePos(handle: oslFileHandle, position: Count | null): E {
  if (!handle || handle.m_fd === -1 || !position) return E.INVAL;
  position[0] = handle.m_fileptr;
  return E.None;
}
/** Original signed64 checked seek, keeping logical and physical positions independent. @param handle - Owner. @param how - Source origin. @param offset - Signed offset. @returns Error. */
export function osl_setFilePos(handle: oslFileHandle, how: number, offset: bigint): E {
  if (!handle || handle.m_fd === -1) return E.INVAL;
  if (offset > MAX_OFF_T || offset < -MAX_OFF_T - 1n) return E.OVERFLOW;
  let position = 0n;
  switch (how) {
    case osl_Pos_Absolut:
      if (offset < 0n) return E.INVAL;
      break;
    case osl_Pos_Current:
      position = handle.m_fileptr;
      if (offset < 0n && position < -offset) return E.INVAL;
      if (offset > MAX_OFF_T - position) return E.OVERFLOW;
      break;
    case osl_Pos_End:
      position = handle.getSize();
      if (offset < 0n && position < -offset) return E.INVAL;
      if (offset > MAX_OFF_T - position) return E.OVERFLOW;
      break;
    default:
      return E.INVAL;
  }
  handle.m_fileptr = position + offset;
  return E.None;
}
/** Original cached logical end query. @param handle - Owner. @param size - Output. @returns Error. */
export function osl_getFileSize(handle: oslFileHandle, size: Count | null): E {
  if (!handle || handle.m_fd === -1 || !size) return E.INVAL;
  size[0] = handle.getSize();
  return E.None;
}
/** Original sync/invalidate/resize ordering. @param handle - Owner. @param size - Unsigned64 size. @returns Error. */
export function osl_setFileSize(handle: oslFileHandle, size: bigint): E {
  if (!handle || handle.m_fd === -1) return E.INVAL;
  if (!(handle.m_state & State.Writeable)) return E.BADF;
  if (size > MAX_OFF_T) return E.OVERFLOW;
  const result = handle.syncFile();
  if (result !== E.None) return result;
  handle.m_bufptr = -1n;
  handle.m_buflen = 0;
  return handle.setSize(size);
}

let fileLockingEnabled: boolean | undefined;
/** Original non-HAVE_O_EXLOCK native locking opt-in and lazy environment cache. @param flags - Source OSL flags. @returns Whether original whole-file locking is requested. */
function osl_file_queryLocking(flags: number): boolean {
  if (
    !(flags & osl_File_OpenFlag_NoLock) &&
    (flags & osl_File_OpenFlag_Write || flags & osl_File_OpenFlag_Create)
  )
    return (fileLockingEnabled ??= getenv("SAL_ENABLE_FILE_LOCKING") !== null);
  return false;
}
/** Original Emscripten openFilePath flags/security/open/stat/lock/handle order. URL conversion and public open delegate to this source owner. @param path - Original native byte path. @param result - Caller-owned output handle slot. @param flags - Original open flags. @param mode - Native explicit mode or -1 for original defaults. @returns Original OSL status; output changes only on success. */
export function openFilePath(
  path: OString,
  result: [oslFileHandle],
  flags: number,
  mode: number,
): E {
  if (isForbidden(path, flags)) return E.ACCES;
  const opened = open(path.getStr(), flags, mode);
  if (opened.fd === -1) return oslTranslateFileError(opened.errno);
  let stat;
  try {
    stat = getFileSystem().fstat(opened.fd);
  } catch (error) {
    const translated = translateFileException(error);
    close(opened.fd);
    return translated;
  }
  if ((stat.mode & 0o170000) !== 0o100000) {
    close(opened.fd);
    return E.INVAL;
  }
  if (osl_file_queryLocking(flags)) {
    const error = lockFile(opened.fd);
    if (error !== 0) {
      close(opened.fd);
      return oslTranslateFileError(error);
    }
  }
  const handle = new FileHandle_Impl(opened.fd);
  if (flags & (osl_File_OpenFlag_Write | osl_File_OpenFlag_Create))
    handle.m_state |= State.Writeable;
  handle.m_size = BigInt(stat.size);
  result[0] = handle;
  return E.None;
}

/** Original public open supplies the source default mode sentinel. @param fileURL - Original URL pointer or null. @param handle - Original output pointer or null. @param flags - Original open flags. @returns Original file status. */
export function osl_openFile(
  fileURL: rtl_uString | null,
  handle: [oslFileHandle] | null,
  flags: number,
): E {
  return openFile(fileURL, handle, flags, -1);
}
/** Original selected UNIX open URL validation, PATH_MAX conversion and native path-open delegation. @param fileURL - Original URL pointer or null. @param handle - Original output pointer or null. @param flags - Original flags. @param mode - Explicit native mode or -1 for defaults. @returns Original status; handle changes only on successful open. */
export function openFile(
  fileURL: rtl_uString | null,
  handle: [oslFileHandle] | null,
  flags: number,
  mode: number,
): E {
  if (fileURL === null || fileURL.length === 0 || handle === null) return E.INVAL;
  const buffer = new Uint8Array(pathMax()),
    status = FileURLToPath(buffer, buffer.length, fileURL);
  if (status !== E.None) return status;
  const path = new OString(buffer, buffer.indexOf(0));
  try {
    return openFilePath(path, handle, flags, mode);
  } finally {
    path.dispose();
  }
}
