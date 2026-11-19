/** @fileoverview Original file_misc.cxx directory item lifetime and public file copy/remove over actual libc and approved path hooks; directory enumeration over actual libc DIR cursors; move remains unbound. */
import { OString, type OStringConstReference } from "../../inc/rtl/string";
import { OUString } from "../../inc/rtl/ustring";
import { type rtl_uString, type rtl_uStringSlot } from "../../inc/rtl/ustring.h";
import {
  oslFileError as E,
  osl_File_OpenFlag_Read,
  osl_File_OpenFlag_Write,
  osl_File_OpenFlag_Create,
  osl_File_OpenFlag_NoLock,
  oslFileType,
  type oslFileHandle,
  type oslDirectoryItem,
  type oslDirectory,
} from "../../inc/osl/file";
import { convertUrlToPathname, FileURLToPath } from "./file_url";
import { systemPathMakeAbsolutePath, osl_systemPathRemoveSeparator } from "./file_path_helper";
import { isForbidden } from "./file.access";
import {
  access,
  pathMax,
  lstat,
  stat,
  unlink,
  rename,
  readlink,
  symlink,
  openCopyDestination,
  closeDescriptor,
  getErrno,
  mkdir,
  rmdir,
  openDirectory,
  closeDirectory,
  readDirectory,
} from "../../../external/emscripten/file";
import { osl_File_OpenFlag_NoExcl } from "../../inc/osl/detail/file";
import { openFilePath, osl_readFile, osl_closeFile } from "./file";
import { safeWrite } from "./readwrite_helper";
import { osl_File_OpenFlag_Private } from "../../inc/osl/detail/file";
import { convertPathnameToUrl } from "./file_url.encoding";
import { OStringBuffer } from "../../inc/rtl/strbuf";
import { oslTranslateFileError } from "./file_error_transl";
import { DirectoryItem_Impl } from "./file_impl";
/** Original URL validation/path conversion/read-access hook/access/new record sequence; output is not released by this C API. @param fileURL - Original URL pointer or null. @param item - Original output pointer or null. @returns Original status; output changes only on success. */
export function osl_getDirectoryItem(
  fileURL: rtl_uString | null,
  item: [oslDirectoryItem] | null,
): E {
  if (fileURL === null || fileURL.length === 0 || item === null) return E.INVAL;
  const path = new OString(),
    input: rtl_uStringSlot = [fileURL];
  try {
    const status = convertUrlToPathname(OUString.unacquired(input), path);
    if (status !== E.None) return status;
    osl_systemPathRemoveSeparator(path.pData);
    if (isForbidden(path, osl_File_OpenFlag_Read)) return E.ACCES;
    const result = access(path.getStr(), 0);
    if (result.result === -1) return oslTranslateFileError(result.errno);
    item[0] = new DirectoryItem_Impl(path);
    return status;
  } finally {
    path.dispose();
  }
}
/** Original nullable item acquire. @param item - Source handle. @returns Original status. */
export function osl_acquireDirectoryItem(item: oslDirectoryItem): E {
  if (item === null) return E.INVAL;
  item.acquire();
  return E.None;
}
/** Original nullable item release. @param item - Source handle. @returns Original status. */
export function osl_releaseDirectoryItem(item: oslDirectoryItem): E {
  if (item === null) return E.INVAL;
  item.release();
  return E.None;
}

/** Original unlink helper checks lstat type and removes links themselves. @param path - Terminated path. @returns Source status. */
function osl_unlinkFile(path: Uint8Array): E {
  const info = lstat(path);
  if (info.value === null) return oslTranslateFileError(info.errno);
  if (info.value.type === oslFileType.Directory) return E.ISDIR;
  const removed = unlink(path);
  return removed.result < 0 ? oslTranslateFileError(removed.errno) : E.None;
}
/** Original removeFile URL conversion and approved write gate. @param fileURL - Original nonnull URL. @returns Source status. */
export function osl_removeFile(fileURL: rtl_uString): E {
  const path = new Uint8Array(pathMax());
  const status = FileURLToPath(path, path.length, fileURL);
  if (status !== E.None) return status;
  const name = new OString(path, path.indexOf(0));
  try {
    if (isForbidden(name, osl_File_OpenFlag_Write)) return E.ACCES;
    return osl_unlinkFile(path);
  } finally {
    name.dispose();
  }
}
/** Original link-copy body retains relative/dangling target contents. @param source - Terminated source. @param destination - Terminated destination. @returns Native errno or zero. */
function oslDoCopyLink(source: Uint8Array, destination: Uint8Array): number {
  const maximum = pathMax(),
    content = new Uint8Array(maximum + 1);
  const read = readlink(source, content, maximum);
  if (read.result < 0) return read.errno;
  content[read.result] = 0;
  const made = symlink(content, destination);
  return made.result < 0 ? made.errno : 0;
}
/** Original buffered copy body, including global errno fallback and ignored source close result. @param source - Source path owner. @param destination - Terminated destination. @param size - Original wasm32 size_t. @param mode - Original stat mode. @returns Native errno or zero. */
function oslDoCopyFile(
  source: OString,
  destination: Uint8Array,
  size: number,
  mode: number,
): number {
  const handle: [oslFileHandle] = [null];
  if (
    openFilePath(
      source,
      handle,
      osl_File_OpenFlag_Read | osl_File_OpenFlag_NoLock | osl_File_OpenFlag_NoExcl,
      -1,
    ) !== E.None
  )
    return getErrno();
  const opened = openCopyDestination(destination, mode);
  if (opened.result < 0) {
    osl_closeFile(handle[0]);
    return opened.errno;
  }
  let remaining = size,
    result = 0;
  if (remaining) {
    const buffer = new Uint8Array(0x7fff),
      read: [bigint] = [0n];
    do {
      const count = Math.min(buffer.length, remaining);
      if (
        osl_readFile(handle[0], buffer, BigInt(count), read) !== E.None ||
        read[0] > BigInt(count) ||
        read[0] === 0n
      )
        break;
      if (!safeWrite(opened.result, buffer, Number(read[0]))) break;
      remaining -= Number(read[0]);
    } while (remaining);
  }
  if (remaining) result = getErrno() || 51; // Selected SDK ENOSPC.
  osl_closeFile(handle[0]);
  const closed = closeDescriptor(opened.result);
  if (closed.result === -1 && result === 0) result = closed.errno;
  return result;
}
/** Original destination backup/copy/rollback transaction; cleanup errors are intentionally ignored. @param source - Source path. @param destination - Destination path. @param mode - Source mode. @param size - Original size_t. @param exists - Source destination stat decision. @returns Source status. */
function oslDoCopy(
  source: OString,
  destination: OString,
  mode: number,
  size: number,
  exists: boolean,
): E {
  const temporary = new OString();
  try {
    if (exists) {
      const buffer = new OStringBuffer(destination);
      try {
        buffer.append(Uint8Array.of(46, 111, 115, 108, 45, 116, 109, 112));
        const value = buffer.makeStringAndClear();
        try {
          temporary.assign(value);
        } finally {
          value.dispose();
        }
      } finally {
        buffer.dispose();
      }
      const moved = rename(destination.getStr(), temporary.getStr());
      if (moved.result !== 0) {
        if (moved.errno === 44) exists = false;
        else return E.EXIST;
      }
    }
    let result: number;
    if ((mode & 0o170000) === 0o100000)
      result = oslDoCopyFile(source, destination.getStr(), size, mode);
    else if ((mode & 0o170000) === 0o120000)
      result = oslDoCopyLink(source.getStr(), destination.getStr());
    else result = 28; // Selected SDK EINVAL.
    if (result > 0 && exists) {
      unlink(destination.getStr());
      rename(temporary.getStr(), destination.getStr());
    }
    if (result > 0) return oslTranslateFileError(result);
    if (exists) unlink(temporary.getStr());
    return E.None;
  } finally {
    temporary.dispose();
  }
}
/** Original public-copy path (preserveMetadata=false); the unused move metadata branch is unbound. @param source - Native source path. @param destination - Native destination path. @returns Source status. */
function osl_psz_copyFile(source: OString, destination: OString): E {
  if (
    isForbidden(source, osl_File_OpenFlag_Read) ||
    isForbidden(destination, osl_File_OpenFlag_Create)
  )
    return E.ACCES;
  const input = lstat(source.getStr());
  if (input.value === null) return oslTranslateFileError(input.errno);
  if (input.value.type === oslFileType.Directory) return E.ISDIR;
  const output = stat(destination.getStr());
  let exists = true;
  if (output.value === null && output.errno === 44) exists = false;
  if (output.value !== null && output.value.type === oslFileType.Directory) return E.ISDIR;
  return oslDoCopy(
    source,
    destination,
    input.value.mode,
    Number(BigInt.asUintN(32, input.value.size)),
    exists,
  );
}
/** Original public URL conversion order and copy dispatch. @param sourceURL - Original nonnull source URL. @param destinationURL - Original nonnull destination URL. @returns Source status. */
export function osl_copyFile(sourceURL: rtl_uString, destinationURL: rtl_uString): E {
  const source = new Uint8Array(pathMax()),
    destination = new Uint8Array(pathMax());
  let status = FileURLToPath(source, source.length, sourceURL);
  if (status !== E.None) return status;
  status = FileURLToPath(destination, destination.length, destinationURL);
  if (status !== E.None) return status;
  const input = new OString(source, source.indexOf(0)),
    output = new OString(destination, destination.indexOf(0));
  try {
    return osl_psz_copyFile(input, output);
  } finally {
    output.dispose();
    input.dispose();
  }
}

/** Original callback pointer signature; URL is borrowed only during notification. */
export type oslDirectoryCreationCallbackFunc = ((data: unknown, url: rtl_uString) => void) | null;
/** Original selected UNIX mkdir flag-to-mode calculation and existing create gate. @param path - Original path owner. @param flags - Original flags. @returns Source status. */
function osl_psz_createDirectory(path: OString, flags: number): E {
  if (isForbidden(path, osl_File_OpenFlag_Create)) return E.ACCES;
  const mode =
    (!(flags & osl_File_OpenFlag_Read) ? 0 : !(flags & osl_File_OpenFlag_Private) ? 0o555 : 0o500) |
    (!(flags & osl_File_OpenFlag_Write) ? 0 : !(flags & osl_File_OpenFlag_Private) ? 0o222 : 0o200);
  const result = mkdir(path.getStr(), mode);
  return result.result < 0 ? oslTranslateFileError(result.errno) : E.None;
}
/** Original default directory creation flags. @param url - Original nonnull URL. @returns Source status. */
export function osl_createDirectory(url: rtl_uString): E {
  return osl_createDirectoryWithFlags(url, osl_File_OpenFlag_Read | osl_File_OpenFlag_Write);
}
/** Original bounded URL conversion and mode-aware create. @param url - Original nonnull URL. @param flags - Source flags. @returns Source status. */
export function osl_createDirectoryWithFlags(url: rtl_uString, flags: number): E {
  const path = new Uint8Array(pathMax()),
    status = FileURLToPath(path, path.length, url);
  if (status !== E.None) return status;
  const value = new OString(path, path.indexOf(0));
  try {
    return osl_psz_createDirectory(value, flags);
  } finally {
    value.dispose();
  }
}
/** Original remove-directory conversion and write gate. @param url - Original nonnull URL. @returns Source status. */
export function osl_removeDirectory(url: rtl_uString): E {
  const path = new Uint8Array(pathMax()),
    status = FileURLToPath(path, path.length, url);
  if (status !== E.None) return status;
  const value = new OString(path, path.indexOf(0));
  try {
    if (isForbidden(value, osl_File_OpenFlag_Write)) return E.ACCES;
    const result = rmdir(path);
    return result.result < 0 ? oslTranslateFileError(result.errno) : E.None;
  } finally {
    value.dispose();
  }
}
/** Original successful mkdir notification; URL conversion status is intentionally ignored. @param path - Terminated mutable path. @param callback - Source callback. @param data - Opaque callback argument. @returns Source status. */
function create_dir_with_callback(
  path: Uint8Array,
  callback: oslDirectoryCreationCallbackFunc,
  data: unknown,
): E {
  const result = mkdir(path, 0o777);
  if (result.result !== 0) return oslTranslateFileError(result.errno);
  if (callback) {
    const url = new OUString(),
      value = new OString(path, path.indexOf(0));
    try {
      convertPathnameToUrl(value, url);
      callback(data, url.pData);
    } finally {
      value.dispose();
      url.dispose();
    }
  }
  return E.None;
}
/** Original recursive parent truncation/restoration and callback order. @param path - Original mutable C bytes. @param callback - Callback or null. @param data - Opaque argument. @returns Source status. */
function create_dir_recursively_(
  path: Uint8Array,
  callback: oslDirectoryCreationCallbackFunc,
  data: unknown,
): E {
  let status = create_dir_with_callback(path, callback, data);
  if (status !== E.NOENT) return status;
  const slash = path.subarray(0, path.indexOf(0)).lastIndexOf(47),
    position = slash > 0 ? slash : 0;
  if (position > 0) path[position] = 0;
  status = create_dir_recursively_(path, callback, data);
  if (status !== E.None && status !== E.EXIST) return status;
  path[position] = 47;
  return create_dir_with_callback(path, callback, data);
}
/** Original null guard, unbounded URL conversion, separator removal and single create gate. @param url - Original URL or null. @param callback - Callback or null. @param data - Opaque user pointer. @returns Source status. */
export function osl_createDirectoryPath(
  url: rtl_uString | null,
  callback: oslDirectoryCreationCallbackFunc,
  data: unknown,
): E {
  if (url === null) return E.INVAL;
  const path = new OString(),
    input: rtl_uStringSlot = [url];
  try {
    const status = convertUrlToPathname(OUString.unacquired(input), path);
    if (status !== E.None) return status;
    osl_systemPathRemoveSeparator(path.pData);
    if (isForbidden(path, osl_File_OpenFlag_Create)) return E.ACCES;
    return create_dir_recursively_(path.getStr(), callback, data);
  } finally {
    path.dispose();
  }
}

/** Original openDirectory validation, URL conversion, separator removal and approved read gate. @param url - Original URL pointer. @param output - Output handle slot, unchanged on failure. @returns Source status. */
export function osl_openDirectory(url: rtl_uString | null, output: [oslDirectory] | null): E {
  if (url === null || url.length === 0 || output === null) return E.INVAL;
  const path = new OString();
  try {
    const result = convertUrlToPathname(OUString.unacquired([url]), path);
    if (result !== E.None) return result;
    osl_systemPathRemoveSeparator(path.pData);
    if (isForbidden(path, osl_File_OpenFlag_Read)) return E.ACCES;
    const opened = openDirectory(path.getStr());
    if (!opened.handle) return oslTranslateFileError(opened.errno);
    output[0] = new DirectoryImpl(opened.handle, path);
    return E.None;
  } finally {
    path.dispose();
  }
}
/** Original null guard and native close followed by record destruction, even on close error. @param directory - Actual source handle. @returns Source status. */
export function osl_closeDirectory(directory: oslDirectory): E {
  if (directory === null) return E.INVAL;
  const closed = closeDirectory(directory.pDirStruct);
  directory.dispose();
  return closed.result === 0 ? E.None : oslTranslateFileError(closed.errno);
}
/** Original readdir filtering, path concatenation and successful-only replacement of the item slot. @param directory - Source directory handle. @param output - Existing item slot. @param hint - Ignored source hint. @returns Source status; null readdir is always NOENT. */
export function osl_getNextDirectoryItem(
  directory: oslDirectory,
  output: [oslDirectoryItem] | null,
  hint: number,
): E {
  void hint;
  if (directory === null || output === null) return E.INVAL;
  let entry;
  do {
    entry = readDirectory(directory.pDirStruct);
    if (entry === null) return E.NOENT;
  } while (
    entry.name[0] === 46 &&
    (entry.name[1] === 0 || (entry.name[1] === 46 && entry.name[2] === 0))
  );
  const filename = new OString(entry.name, entry.name.length - 1),
    path = systemPathMakeAbsolutePath(directory.strPath, filename);
  try {
    output[0]?.release();
    output[0] = new DirectoryItem_Impl(path, entry.type);
    return E.None;
  } finally {
    path.dispose();
    filename.dispose();
  }
}

/** Original DirectoryImpl: the VM owns this record, libc owns its DIR cursor. */
export class DirectoryImpl {
  readonly strPath: OString;
  /** Binds the actual opened cursor and acquires the source path. @param pDirStruct - Native DIR pointer. @param path - Borrowed original byte path. @returns Directory record. */
  constructor(
    readonly pDirStruct: number,
    path: OStringConstReference,
  ) {
    this.strPath = new OString(path);
  }
  /** Original record member destruction after closedir. @returns Nothing. */
  dispose(): void {
    this.strPath.dispose();
  }
}
