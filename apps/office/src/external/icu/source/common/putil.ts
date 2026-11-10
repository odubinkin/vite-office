/** @fileoverview ICU78.3 arithmetic, UTC clock and actual data/timezone-directory state from putil.cpp. Browser environment/build-install-directory inputs are absent; POSIX separator rules and original once/cleanup/status order are retained. No file mapper or file-access default is changed. */
import { UInitOnce, umtx_initOnce } from "./umutex.h";
import { ECleanupCommonType as C, ucln_common_registerCleanup } from "./ucln_cmn.h";
import { CharString } from "./charstr.h";
import { cStringLength } from "./stringpiece";
import { U_FAILURE } from "./unicode/utypes";
import { U_FILE_SEP_CHAR } from "./unicode/putil";
/** Original widened addition and output-store-before-overflow comparison. @param a - Signed32 input. @param b - Signed32 input. @param result - Signed32 output. @returns Overflow. */
export function uprv_add32_overflow(a: number, b: number, result: [number]): boolean {
  const wide = (a | 0) + (b | 0);
  result[0] = wide | 0;
  return wide !== result[0];
}
/** Original signed64 product and signed32 output narrowing. @param a - Signed32 input. @param b - Signed32 input. @param result - Signed32 output. @returns Overflow. */
export function uprv_mul32_overflow(a: number, b: number, result: [number]): boolean {
  const wide = BigInt(a | 0) * BigInt(b | 0);
  result[0] = Number(BigInt.asIntN(32, wide));
  return wide !== BigInt(result[0]);
}
/** Original platform UTC clock entrypoint. Date.now supplies the browser OS-clock boundary only; calendar/date parsing never uses host Date arithmetic. Debug fake-time hooks remain unported. @returns UTC milliseconds since 1970. */
export function uprv_getUTCtime(): number {
  return Date.now();
}

export const gDataDirInitOnce = new UInitOnce();
export let gDataDirectory: Uint8Array | null = null;
export const gTimeZoneFilesInitOnce = new UInitOnce();
export let gTimeZoneFilesDirectory: CharString | null = null;
const emptyDirectory = new Uint8Array([0]);
/** Original cleanup of the represented data/timezone-directory records. Unported OS locale/TZ-search caches are not manufactured. @returns True. */
export function putil_cleanup(): boolean {
  gDataDirectory = null;
  gDataDirInitOnce.reset();
  gTimeZoneFilesDirectory = null;
  gTimeZoneFilesInitOnce.reset();
  return true;
}
/** Original copied NUL path and cleanup registration. The pinned POSIX separators are equal, so alternate-separator rewriting is not selected. Native allocation failure/free remain outside managed storage. @param directory - Readable NUL pointer/null. @returns Nothing. */
export function u_setDataDirectory(directory: Uint8Array | null): void {
  let next: Uint8Array;
  if (directory === null || directory[0] === 0) next = emptyDirectory;
  else {
    const length = cStringLength(directory);
    next = new Uint8Array(length + 2);
    next.set(directory.subarray(0, length + 1));
  }
  gDataDirectory = next;
  ucln_common_registerCleanup(C.UCLN_COMMON_PUTIL, putil_cleanup);
}
/** Original once initializer for the browser process: no OS environment namespace or installed native archive directory is present. This binds absent getenv/build-directory inputs, preserving the final empty-path fallback and setter; it does not change file-access policy. @returns Nothing. */
function dataDirectoryInitFn(): void {
  if (gDataDirectory !== null) return;
  u_setDataDirectory(emptyDirectory);
}
/** Original lazy getter returns the actual owned NUL bytes, without a replacement default path. @returns Directory pointer. */
export function u_getDataDirectory(): Uint8Array {
  umtx_initOnce(gDataDirInitOnce, dataDirectoryInitFn);
  return gDataDirectory as Uint8Array;
}
/** Original absolute-path predicate for the pinned POSIX branch. @param path - Readable NUL pointer/null. @returns Absolute. */
export function uprv_pathIsAbsolute(path: Uint8Array | null): boolean {
  if (path === null || path[0] === 0) return false;
  return path[0] === U_FILE_SEP_CHAR;
}
/** Original timezone-directory copy after sticky-status guard. @param path - Readable NUL pointer/null. @param status - Source status. @returns Nothing. */
function setTimeZoneFilesDir(path: Uint8Array | null, status: [number]): void {
  if (U_FAILURE(status[0])) return;
  (gTimeZoneFilesDirectory as CharString).clear().append(path, status);
}
/** Original timezone initializer for absent browser OS environment/build-prefix inputs. Registration precedes construction, as source. @param status - Source status. @returns Nothing. */
function TimeZoneDataDirInitFn(status: [number]): void {
  ucln_common_registerCleanup(C.UCLN_COMMON_PUTIL, putil_cleanup);
  gTimeZoneFilesDirectory = new CharString();
  setTimeZoneFilesDir(emptyDirectory, status);
}
/** Original status-bearing once getter, returning the shared empty literal on failure. @param status - Source status. @returns Actual directory pointer. */
export function u_getTimeZoneFilesDirectory(status: [number]): Uint8Array {
  umtx_initOnce(gTimeZoneFilesInitOnce, TimeZoneDataDirInitFn, status);
  return U_FAILURE(status[0]) ? emptyDirectory : (gTimeZoneFilesDirectory as CharString).data();
}
/** Original setter initializes the environment-derived directory before replacing it, including on a first call. @param path - Readable NUL pointer/null. @param status - Source status. @returns Nothing. */
export function u_setTimeZoneFilesDirectory(path: Uint8Array | null, status: [number]): void {
  umtx_initOnce(gTimeZoneFilesInitOnce, TimeZoneDataDirInitFn, status);
  setTimeZoneFilesDir(path, status);
}
