/** @fileoverview Original sal/osl/unx/file.cxx setAllowedPaths/isForbidden access lists and realpath/parent/prefix decisions. */
import { OString } from "../../inc/rtl/string";
import { RTL_TEXTENCODING_UTF8 } from "../../inc/rtl/textenc";
import { getToken } from "../../../o3tl/inc/string_view";
import { osl_File_OpenFlag_Write, osl_File_OpenFlag_Create } from "../../inc/osl/file";
import { realpath, pathMax, abort } from "../../../external/emscripten/file";
import { getenv } from "../../../external/emscripten/locale";
let abortOnForbidden = false;
const allowedPathsRead: OString[] = [],
  allowedPathsReadWrite: OString[] = [],
  allowedPathsExecute: OString[] = [];
/** Original OString lastIndexOf slash over the full logical string. @param path - Original path. @returns Last slash or -1. */
function lastSlash(path: OString): number {
  return path.getStr().subarray(0, path.getLength()).lastIndexOf(47);
}
/** Original parent folder, including the source's n<1 dot rule. @param path - Original path. @returns Parent OString. */
function getParentFolder(path: OString): OString {
  const n = lastSlash(path);
  return n < 1 ? new OString(Uint8Array.of(46), 1) : path.copy(0, n);
}
/** Original strlen on a terminated native byte buffer. @param path - Terminated bytes. @returns Bytes before NUL. */
function length(path: Uint8Array): number {
  return path.indexOf(0);
}
/** Original strcat for the source's valid nonnegative pointer-offset domain; native negative-pointer/overread behavior remains unqualified. @param resolved - Resolved parent. @param path - Original path. @param slash - Source pointer offset. @returns Appended terminated bytes. */
function append(resolved: Uint8Array, path: OString, slash: number): Uint8Array {
  const tail = path.getStr().subarray(slash),
    count = length(tail),
    result = new Uint8Array(length(resolved) + count + 1);
  result.set(resolved.subarray(0, length(resolved)));
  result.set(tail.subarray(0, count), length(resolved));
  return result;
}
/** Original list clearing destroys the contained OString values. @param list - Original list. @returns Nothing. */
function clear(list: OString[]): void {
  for (const value of list) value.dispose();
  list.length = 0;
}
/** Original colon-separated modes/paths, early failures and environment flag publication. @param paths - Original borrowed UTF16 string view, excluding terminator. @returns Nothing. */
export function setAllowedPaths(paths: Uint16Array): void {
  clear(allowedPathsRead);
  clear(allowedPathsReadWrite);
  clear(allowedPathsExecute);
  let type = 114;
  const index: [number] = [0];
  do {
    const token = getToken(paths, 0, 58, index),
      path = new OString(token, token.length, RTL_TEXTENCODING_UTF8);
    try {
      if (path.getLength() === 0) continue;
      if (path.getLength() === 1) {
        type = path.getStr()[0] as number;
        continue;
      }
      let resolved = realpath(path.getStr());
      if (resolved.path === null && resolved.errno === 44) {
        const n = lastSlash(path),
          folder = getParentFolder(path);
        try {
          resolved = realpath(folder.getStr());
        } finally {
          folder.dispose();
        }
        if (resolved.path === null || length(resolved.path) + path.getLength() - n + 1 >= pathMax())
          return;
        resolved = { path: append(resolved.path, path, n), errno: 0 };
      }
      if (resolved.path !== null) {
        const value = new OString(resolved.path, length(resolved.path));
        if (type === 114) allowedPathsRead.push(value);
        else if (type === 119) {
          allowedPathsRead.push(value);
          allowedPathsReadWrite.push(new OString(value));
        } else if (type === 120) allowedPathsExecute.push(value);
        else value.dispose();
      }
    } finally {
      path.dispose();
    }
  } while (index[0] !== -1);
  abortOnForbidden = getenv("SAL_ABORT_ON_FORBIDDEN") !== null;
}
/** Original recursive parent resolution and literal prefix check. @param path - Original OString path. @param flags - Original read/write/create/execute flags. @returns True when source rejects access; configured denial calls native abort. */
export function isForbidden(path: OString, flags: number): boolean {
  if (allowedPathsRead.length === 0) return false;
  let resolved = realpath(path.getStr());
  if (resolved.path === null) {
    const n = lastSlash(path),
      folder = getParentFolder(path);
    try {
      resolved = realpath(folder.getStr());
      if (resolved.path === null && resolved.errno === 44) return isForbidden(folder, flags);
      if (resolved.path === null || length(resolved.path) + path.getLength() - n + 1 >= pathMax())
        return true;
      resolved = { path: append(resolved.path, path, n), errno: 0 };
    } finally {
      folder.dispose();
    }
  }
  const resolvedPath = resolved.path as Uint8Array;
  const list =
    flags & osl_File_OpenFlag_Write || flags & osl_File_OpenFlag_Create
      ? allowedPathsReadWrite
      : flags & 0x80
        ? allowedPathsExecute
        : allowedPathsRead;
  let allowed = false;
  for (const prefix of list) {
    const data = prefix.getStr();
    let match = true;
    for (let i = 0; i < prefix.getLength(); i++) {
      if (resolvedPath[i] !== data[i]) {
        match = false;
        break;
      }
      if (data[i] === 0) break;
    }
    if (match) {
      allowed = true;
      break;
    }
  }
  if (abortOnForbidden && !allowed) abort();
  return !allowed;
}
