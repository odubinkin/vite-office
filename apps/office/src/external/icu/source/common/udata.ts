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
/** Original last separator search over the narrow C span, with the pinned POSIX '/' platform binding. @param path - Nonnull C path. @returns Basename pointer represented by narrow storage. */
function findBasename(path: string): string {
  const nul = path.indexOf("\0"),
    span = nul < 0 ? path : path.slice(0, nul);
  const last = span.lastIndexOf("/");
  return last < 0 ? span : span.slice(last + 1);
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
