/** @fileoverview Original ICU application-data registration/common-data cache. Native module-static records are exported read-only ESM bindings for source-owned observation, not alternative factories. File loading/open orchestration remains separate and unimplemented here. Synchronous realm storage binds native mutex boundaries; physical allocation/free/thread ABI is unverified. */
import {
  UDataMemory,
  UDataMemory_init,
  UDataMemory_setData,
  UDataMemory_createNewInstance,
  UDatamemory_assign,
} from "./udatamem.h";
import { udata_close } from "./unicode/udata";
import { DataHeader, udata_checkCommonData } from "./ucmndata.h";
import * as H from "./uhash";
import { UInitOnce, umtx_initOnce } from "./umutex.h";
import { ECleanupCommonType as C, ucln_common_registerCleanup } from "./ucln_cmn.h";
import { UErrorCode as E, U_FAILURE } from "./unicode/utypes";
import { CharString } from "./charstr.h";
import { StringPiece } from "./unicode/stringpiece";
import { cStringLength } from "./stringpiece";
import { U_FILE_SEP_CHAR, U_PATH_SEP_CHAR } from "./unicode/putil";
import { u_getDataDirectory } from "./putil";
/** Original cache entry record. Native allocation is represented by actual managed storage. */
export interface DataCacheElement {
  name: string;
  item: UDataMemory;
}
export let gCommonDataCache: H.UHashtable<string, DataCacheElement> | null = null;
export const gCommonDataCacheInitOnce = new UInitOnce();
const gCommonICUDataArray: (UDataMemory | null)[] = Array(10).fill(null);
export let gHaveTriedToLoadCommonData = 0;
/** Original data cleanup body. No replacement public cleanup facade. @returns True. */
export function udata_cleanup(): boolean {
  if (gCommonDataCache !== null) {
    H.uhash_close(gCommonDataCache);
    gCommonDataCache = null;
  }
  gCommonDataCacheInitOnce.reset();
  for (let i = 0; i < gCommonICUDataArray.length && gCommonICUDataArray[i] !== null; ++i) {
    udata_close(gCommonICUDataArray[i] as UDataMemory);
    gCommonICUDataArray[i] = null;
  }
  gHaveTriedToLoadCommonData = 0;
  return true;
}
/** Original narrow basename query for cache string bindings. @param path - Readable C path. @returns Basename. */
function findBasename(path: string): string;
/** Original pointer-preserving basename query for the path iterator. @param path - Actual readable NUL bytes. @returns Borrowed basename pointer. */
function findBasename(path: Uint8Array): Uint8Array;
/** Original last separator search, preserving the original pointer when there is no separator. @param path - Narrow storage binding. @returns Basename. */
function findBasename(path: string | Uint8Array): string | Uint8Array {
  if (typeof path === "string") {
    const nul = path.indexOf("\0"),
      span = nul < 0 ? path : path.slice(0, nul),
      last = span.lastIndexOf("/");
    return last < 0 ? span : span.slice(last + 1);
  }
  let last = -1;
  for (let i = 0; path[i] !== 0; ++i) if (path[i] === U_FILE_SEP_CHAR) last = i;
  return last < 0 ? path : path.subarray(last + 1);
}
/** Original entry deleter closes its descriptor before freeing key/record storage; managed key/record release follows GC. @param entry - Actual owned entry. @returns Nothing. */
function DataCacheElement_deleter(entry: DataCacheElement): void {
  udata_close(entry.item);
}
/** Original table initialization and cleanup registration. @param error - Source status. @returns Nothing. */
function udata_initHashTable(error: [number]): void {
  gCommonDataCache = H.uhash_open<string, DataCacheElement>(
    H.uhash_hashChars,
    H.uhash_compareChars,
    null,
    error,
  );
  if (U_FAILURE(error[0])) return;
  H.uhash_setValueDeleter(
    gCommonDataCache as H.UHashtable<string, DataCacheElement>,
    DataCacheElement_deleter,
  );
  ucln_common_registerCleanup(C.UCLN_COMMON_UDATA, udata_cleanup);
}
/** Original lazy table getter. @param error - Source status. @returns Actual table/null. */
function udata_getHashTable(error: [number]): H.UHashtable<string, DataCacheElement> | null {
  umtx_initOnce(gCommonDataCacheInitOnce, udata_initHashTable, error);
  return gCommonDataCache;
}
/** Original cached lookup uses basename and returns the actual owned descriptor. Native static visibility is projected by an ESM export only for ownership/contract observation. @param path - Nonnull path. @param error - Source status. @returns Cached handle/null. */
export function udata_findCachedData(path: string, error: [number]): UDataMemory | null {
  const table = udata_getHashTable(error);
  if (U_FAILURE(error[0])) return null;
  const el = H.uhash_get(table as H.UHashtable<string, DataCacheElement>, findBasename(path));
  return el === null ? null : el.item;
}
/** Original cache insertion copies descriptor/key, checks duplicate by full path, then inserts by basename. CALC-467 is preserved. Native allocation-failure branches are outside the managed allocation binding. @param path - Nonnull path. @param item - Initialized descriptor. @param error - Source status. @returns Actual new/old handle/null. */
export function udata_cacheDataItem(
  path: string,
  item: UDataMemory,
  error: [number],
): UDataMemory | null {
  const table = udata_getHashTable(error);
  if (U_FAILURE(error[0])) return null;
  const memory = UDataMemory_createNewInstance(error);
  if (U_FAILURE(error[0])) return null;
  UDatamemory_assign(memory as UDataMemory, item);
  const el: DataCacheElement = { item: memory as UDataMemory, name: findBasename(path) },
    sub: [number] = [E.U_ZERO_ERROR],
    hash = table as H.UHashtable<string, DataCacheElement>;
  const old = H.uhash_get(hash, path);
  if (old !== null) sub[0] = E.U_USING_DEFAULT_WARNING;
  else H.uhash_put(hash, el.name, el, sub);
  if (sub[0] === E.U_USING_DEFAULT_WARNING || U_FAILURE(sub[0])) {
    error[0] = sub[0];
    return old === null ? null : old.item;
  }
  return el.item;
}
/** Original public application-data registration. No key normalization, extra data validation, cache shortcut or replacement loader. @param path - C path, nonnull when caching is reached. @param data - Actual data address or static managed header/null. @param error - Nullable status. @returns Nothing. */
export function udata_setAppData(
  path: string | null,
  data: Uint8Array | DataHeader | null,
  error: [number] | null,
): void {
  if (error === null || U_FAILURE(error[0])) return;
  if (data === null) {
    error[0] = E.U_ILLEGAL_ARGUMENT_ERROR;
    return;
  }
  const memory = new UDataMemory();
  UDataMemory_init(memory);
  UDataMemory_setData(memory, data);
  udata_checkCommonData(memory, error);
  udata_cacheDataItem(path as string, memory, error);
}

/** Compiler binding of native pointer equality, including distinct views of the same address. @param a - First pointer. @param b - Second pointer. @returns Same address. */
function samePathAddress(a: Uint8Array | null, b: Uint8Array | null): boolean {
  return (
    a === b || (a !== null && b !== null && a.buffer === b.buffer && a.byteOffset === b.byteOffset)
  );
}
/** Original strncmp primitive over readable narrow pointers. Stops at a differing byte or NUL; callers retain original readable-span preconditions. @param a - First pointer. @param b - Second pointer. @param length - Count. @returns Difference. */
function pathCompare(a: Uint8Array, b: Uint8Array, length: number): number {
  for (let i = 0; i < length; ++i) {
    const x = a[i] as number,
      y = b[i] as number;
    if (x !== y) return x - y;
    if (x === 0) break;
  }
  return 0;
}
/** Original path iterator defined in udata.cpp, using its actual CharString fields and borrowed C pointers. Returned buffers are invalidated by subsequent writes, as source; no path normalization or inferred filename fallback. */
export class UDataPathIterator {
  private readonly path: Uint8Array;
  private nextPath: Uint8Array | null;
  private readonly basename: Uint8Array;
  private readonly suffix: StringPiece;
  private readonly basenameLen: number;
  private readonly itemPath = new CharString();
  private readonly pathBuffer = new CharString();
  private readonly packageStub = new CharString();
  /** Original initialization and item-directory precedence. @param inPath - Search path/null for actual data-directory getter. @param pkg - NUL package name/null. @param item - Readable NUL item path. @param inSuffix - NUL suffix/null. @param checkLastFour - Original extension matching flag. @param error - Source status. @returns Iterator. */
  constructor(
    inPath: Uint8Array | null,
    pkg: Uint8Array | null,
    item: Uint8Array,
    inSuffix: Uint8Array | null,
    private readonly checkLastFour: boolean,
    error: [number],
  ) {
    this.path = inPath === null ? u_getDataDirectory() : inPath;
    if (pkg !== null) this.packageStub.append(U_FILE_SEP_CHAR, error).append(pkg, error);
    this.basename = findBasename(item);
    this.basenameLen = cStringLength(this.basename) >>> 0;
    if (samePathAddress(this.basename, item)) this.nextPath = this.path;
    else {
      this.itemPath.append(item, this.basename.byteOffset - item.byteOffset, error);
      this.nextPath = this.itemPath.data();
    }
    this.suffix = new StringPiece(inSuffix === null ? new Uint8Array([0]) : inSuffix);
  }
  /** Original next search candidate; empty segments and nonmatching dat files are skipped in source order. @param error - Source status. @returns Actual borrowed output bytes/null. */
  next(error: [number]): Uint8Array | null {
    if (U_FAILURE(error[0])) return null;
    do {
      if (this.nextPath === null) break;
      const currentPath = this.nextPath;
      let pathLen: number;
      if (samePathAddress(this.nextPath, this.itemPath.data())) {
        this.nextPath = this.path;
        pathLen = cStringLength(currentPath);
      } else {
        let separator = -1;
        for (let i = 0; currentPath[i] !== 0; ++i)
          if (currentPath[i] === U_PATH_SEP_CHAR) {
            separator = i;
            break;
          }
        if (separator < 0) {
          this.nextPath = null;
          pathLen = cStringLength(currentPath);
        } else {
          pathLen = separator;
          this.nextPath = currentPath.subarray(separator + 1);
        }
      }
      if (pathLen === 0) continue;
      this.pathBuffer.clear().append(currentPath, pathLen, error);
      const pathBasename = findBasename(this.pathBuffer.data());
      if (
        this.checkLastFour &&
        pathLen >= 4 &&
        pathCompare(
          this.pathBuffer.data().subarray(pathLen - 4),
          this.suffix.data() as Uint8Array,
          4,
        ) === 0 &&
        pathCompare(findBasename(this.pathBuffer.data()), this.basename, this.basenameLen) === 0 &&
        cStringLength(pathBasename) === this.basenameLen + 4
      ) {
        // Original matching explicit file: retain it without further writes.
      } else {
        if (this.pathBuffer.at(pathLen - 1) !== U_FILE_SEP_CHAR) {
          if (
            pathLen >= 4 &&
            pathCompare(
              this.pathBuffer.data().subarray(pathLen - 4),
              new Uint8Array([46, 100, 97, 116, 0]),
              4,
            ) === 0
          )
            continue;
          if (
            !this.packageStub.isEmpty() &&
            pathLen > this.packageStub.length() &&
            pathCompare(
              this.pathBuffer.data().subarray(pathLen - this.packageStub.length()),
              this.packageStub.data(),
              this.packageStub.length() + 1,
            ) === 0
          )
            this.pathBuffer.truncate(pathLen - this.packageStub.length());
          this.pathBuffer.append(U_FILE_SEP_CHAR, error);
        }
        this.pathBuffer.append(
          this.packageStub.data().subarray(1),
          this.packageStub.length() - 1,
          error,
        );
        if (!this.suffix.empty()) {
          if (this.suffix.length() > 4) this.pathBuffer.ensureEndsWithFileSeparator(error);
          this.pathBuffer.append(this.suffix, error);
        }
      }
      return this.pathBuffer.data();
    } while (this.path);
    return null;
  }
}
