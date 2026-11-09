/** @fileoverview Original ICU data opening, path iteration, common-data cache, and application-data registration. */
import {
  UDataMemory,
  UDataMemory_init,
  UDataMemory_setData,
  UDataMemory_createNewInstance,
  UDataMemory_isLoaded,
  UDatamemory_assign,
} from "./udatamem.h";
import {
  UDataFileAccess,
  U_ICUDATA_ALIAS,
  U_TREE_ENTRY_SEP_CHAR,
  U_TREE_SEPARATOR,
  type UDataMemoryIsAcceptable,
} from "./unicode/udata";
import { udata_close } from "./udatamem";
import { COMMON_DATA_NAME, DataHeader, udata_checkCommonData } from "./ucmndata.h";
import * as H from "./uhash";
import { UInitOnce, umtx_initOnce } from "./umutex.h";
import { ECleanupCommonType as C, ucln_common_registerCleanup } from "./ucln_cmn.h";
import { UErrorCode as E, U_FAILURE, U_SUCCESS, U_ICUDATA_NAME } from "./unicode/utypes";
import { CharString } from "./charstr.h";
import { StringPiece } from "./unicode/stringpiece";
import { cStringLength } from "./stringpiece";
import { U_FILE_SEP_CHAR, U_PATH_SEP_CHAR } from "./unicode/putil";
import { u_getDataDirectory, u_getTimeZoneFilesDirectory, uprv_pathIsAbsolute } from "./putil";
import { uprv_mapFile } from "./umapfile.h";
import { U_ICUDATA_ENTRY_POINT } from "../stubdata/stubdata";
/** Original cache entry record. Native allocation is represented by actual managed storage. */
export interface DataCacheElement {
  name: string;
  item: UDataMemory;
}
export let gCommonDataCache: H.UHashtable<string, DataCacheElement> | null = null;
export const gCommonDataCacheInitOnce = new UInitOnce();
const gCommonICUDataArray: (UDataMemory | null)[] = Array(10).fill(null);
export let gHaveTriedToLoadCommonData = 0;
// UDATA_DEFAULT_ACCESS is the zero-valued FILES_FIRST enumerator.
let gDataFileAccess: UDataFileAccess = 0;
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

/** Projects a narrow string as NUL-terminated bytes. @param value - Narrow string. @returns Byte storage. */
function narrowBytes(value: string): Uint8Array {
  const bytes = new Uint8Array(value.length + 1);
  for (let i = 0; i < value.length; ++i) bytes[i] = value.charCodeAt(i);
  return bytes;
}

/** Projects actual narrow bytes for the existing string-keyed ICU hash table. @param bytes - NUL bytes. @returns Narrow string. */
function narrowString(bytes: Uint8Array): string {
  let value = "";
  for (let i = 0; bytes[i] !== 0; ++i) value += String.fromCharCode(bytes[i] as number);
  return value;
}

/** Original common-data slot installation retains existing owners and deduplicates by address. @param data - Source descriptor. @param warn - Warn when full. @param status - Sticky status. @returns Whether a slot was written. */
function setCommonICUData(data: UDataMemory, warn: boolean, status: [number]): boolean {
  const owned = UDataMemory_createNewInstance(status);
  if (owned === null) return false;
  UDatamemory_assign(owned, data);
  for (let i = 0; i < gCommonICUDataArray.length; ++i) {
    const existing = gCommonICUDataArray[i];
    if (existing === null) {
      gCommonICUDataArray[i] = owned;
      ucln_common_registerCleanup(C.UCLN_COMMON_UDATA, udata_cleanup);
      return true;
    }
    if (samePathAddress(existing?.pHeader?.data ?? null, data.pHeader?.data ?? null)) return false;
  }
  if (warn) status[0] = E.U_USING_DEFAULT_WARNING;
  return false;
}

/** Original validated registration of caller-owned ICU common data. @param pointer - Header address/null. @param status - Sticky status or null. @returns Nothing. */
export function udata_setCommonData(
  pointer: Uint8Array | DataHeader | null,
  status: [number] | null,
): void {
  if (status === null || U_FAILURE(status[0])) return;
  if (pointer === null) {
    status[0] = E.U_ILLEGAL_ARGUMENT_ERROR;
    return;
  }
  const data = new UDataMemory();
  UDataMemory_init(data);
  UDataMemory_setData(data, pointer);
  udata_checkCommonData(data, status);
  if (U_SUCCESS(status[0])) setCommonICUData(data, true, status);
}

/** Original package cache lookup and file discovery. @param path - NUL package path. @param commonDataIndex - Linked data slot, or -1 for named package. @param status - Sticky status. @returns Common descriptor/null. */
function openCommonData(
  path: Uint8Array,
  commonDataIndex: number,
  status: [number],
): UDataMemory | null {
  if (U_FAILURE(status[0])) return null;
  const data = new UDataMemory();
  UDataMemory_init(data);
  if (commonDataIndex >= 0) {
    if (commonDataIndex >= gCommonICUDataArray.length) return null;
    const existing = gCommonICUDataArray[commonDataIndex];
    if (existing !== null) return existing as UDataMemory;
    for (let i = 0; i < commonDataIndex; ++i) {
      if (samePathAddress(gCommonICUDataArray[i]?.pHeader?.data ?? null, U_ICUDATA_ENTRY_POINT))
        return null;
    }
    UDataMemory_setData(data, U_ICUDATA_ENTRY_POINT);
    udata_checkCommonData(data, status);
    setCommonICUData(data, false, status);
    return gCommonICUDataArray[commonDataIndex] ?? null;
  }

  const basename = findBasename(path);
  if (basename[0] === 0) {
    status[0] = E.U_FILE_ACCESS_ERROR;
    return null;
  }
  const key = narrowString(basename);
  const cached = udata_findCachedData(key, status);
  if (cached !== null || U_FAILURE(status[0])) return cached;

  const iter = new UDataPathIterator(
    u_getDataDirectory(),
    basename,
    path,
    narrowBytes(".dat"),
    true,
    status,
  );
  let candidate: Uint8Array | null;
  while (!UDataMemory_isLoaded(data) && (candidate = iter.next(status)) !== null) {
    uprv_mapFile(data, candidate, status);
  }
  if (U_FAILURE(status[0])) return null;
  if (!UDataMemory_isLoaded(data)) {
    status[0] = E.U_FILE_ACCESS_ERROR;
    return null;
  }
  udata_checkCommonData(data, status);
  return udata_cacheDataItem(key, data, status);
}

/** Original one-attempt extension and cached-pointer lookup. @param status - Sticky status. @returns Whether extended data is visible. */
function extendICUData(status: [number]): boolean {
  if (!gHaveTriedToLoadCommonData) {
    const mapped = openCommonData(narrowBytes(U_ICUDATA_NAME), -1, status);
    if (mapped !== null) {
      const copy = new UDataMemory();
      UDataMemory_init(copy);
      UDatamemory_assign(copy, mapped);
      copy.map = null;
      copy.mapAddr = null;
      setCommonICUData(copy, false, status);
    }
    gHaveTriedToLoadCommonData = 1;
  }
  const cached = udata_findCachedData(U_ICUDATA_NAME, status);
  if (U_FAILURE(status[0]) || cached === null) return false;
  return gCommonICUDataArray.some(
    /** Tests the original header-address comparison. @param item - Common data slot. @returns Whether it holds the mapped data. */
    (item) =>
      item !== null && samePathAddress(item.pHeader?.data ?? null, cached.pHeader?.data ?? null),
  );
}

/** The original acceptance callback and its arguments travel together through the two load paths. */
interface DataItemRequest {
  type: string | null;
  name: string;
  isAcceptable: UDataMemoryIsAcceptable | null;
  context: unknown;
}

/** Original magic/callback checks and separate fatal/nonfatal status channels. @param header - Item header. @param request - Original acceptance arguments. @param subError - Nonfatal status. @param status - Fatal status. @returns Accepted descriptor/null. */
function checkDataItem(
  header: DataHeader,
  request: DataItemRequest,
  subError: [number],
  status: [number],
): UDataMemory | null {
  if (U_FAILURE(status[0])) return null;
  if (
    header.dataHeader.magic1 !== 0xda ||
    header.dataHeader.magic2 !== 0x27 ||
    (request.isAcceptable !== null &&
      !request.isAcceptable(request.context, request.type, request.name, header.info))
  ) {
    subError[0] = E.U_INVALID_FORMAT_ERROR;
    return null;
  }
  const data = UDataMemory_createNewInstance(status);
  if (data !== null) data.pHeader = header;
  return data;
}

/** Original individual-file load loop and mapping transfer. @param pkgName - Package bytes. @param dataPath - Search directory bytes. @param suffix - Item path suffix. @param path - Package path. @param request - Item request. @param subError - Nonfatal status. @param status - Fatal status. @returns Accepted descriptor/null. */
function doLoadFromIndividualFiles(
  pkgName: Uint8Array,
  dataPath: Uint8Array,
  suffix: Uint8Array,
  path: Uint8Array,
  request: DataItemRequest,
  subError: [number],
  status: [number],
): UDataMemory | null {
  const iter = new UDataPathIterator(dataPath, pkgName, path, suffix, false, status);
  const mapped = new UDataMemory();
  let candidate: Uint8Array | null;
  while ((candidate = iter.next(status)) !== null) {
    if (!uprv_mapFile(mapped, candidate, status)) continue;
    const data = checkDataItem(mapped.pHeader as DataHeader, request, subError, status);
    if (data !== null) {
      data.mapAddr = mapped.mapAddr;
      data.map = mapped.map;
      data.length = mapped.length;
      return data;
    }
    udata_close(mapped);
    if (U_FAILURE(status[0])) return null;
    subError[0] = E.U_INVALID_FORMAT_ERROR;
  }
  return null;
}

/** Original common-package lookup and extended ICU data retry. @param isICUData - Whether to search ICU slots. @param tocName - Original tree entry key. @param path - Package path. @param request - Item request. @param subError - Nonfatal status. @param status - Fatal status. @returns Accepted descriptor/null. */
function doLoadFromCommonData(
  isICUData: boolean,
  tocName: Uint8Array,
  path: Uint8Array,
  request: DataItemRequest,
  subError: [number],
  status: [number],
): UDataMemory | null {
  let index = isICUData ? 0 : -1;
  let checkedExtendedICUData = false;
  for (;;) {
    const common = openCommonData(path, index, subError);
    if (U_SUCCESS(subError[0]) && common !== null && common.vFuncs !== null) {
      const length: [number] = [-1];
      const header = common.vFuncs.Lookup(common, tocName, length, subError);
      if (header !== null) {
        const data = checkDataItem(header, request, subError, status);
        if (U_FAILURE(status[0])) return null;
        if (data !== null) {
          data.length = length[0];
          return data;
        }
      }
    }
    if (subError[0] === E.U_MEMORY_ALLOCATION_ERROR) {
      status[0] = subError[0];
      return null;
    }
    if (!isICUData) return null;
    if (common !== null) ++index;
    else if (!checkedExtendedICUData && extendICUData(subError)) checkedExtendedICUData = true;
    else return null;
  }
}

/** Original four timezone resource exceptions. @param name - Item name. @param type - Item type. @returns Whether a timezone directory override applies. */
function isTimeZoneFile(name: string, type: string | null): boolean {
  return (
    type === "res" &&
    (name === "zoneinfo64" ||
      name === "timezoneTypes" ||
      name === "windowsZones" ||
      name === "metaZones")
  );
}

/** Original POSIX package/tree naming and file-access dispatch. @param path - Original package path. @param request - Item and acceptance arguments. @param status - Sticky status. @returns Data descriptor/null. */
function doOpenChoice(
  path: string | null,
  request: DataItemRequest,
  status: [number],
): UDataMemory | null {
  let pathBytes = path === null ? null : narrowBytes(path);
  const pathText = pathBytes === null ? null : narrowString(pathBytes);
  const isICUData =
    pathText === null ||
    pathText === U_ICUDATA_ALIAS ||
    pathText.startsWith(U_ICUDATA_NAME + "-") ||
    pathText.startsWith(U_ICUDATA_ALIAS + "-");
  const pkg = new CharString();
  const tree = new CharString();
  if (pathText === null) pkg.append(narrowBytes(U_ICUDATA_NAME), status);
  else {
    const first = pathText.indexOf("/");
    const last = pathText.lastIndexOf("/");
    if (uprv_pathIsAbsolute(pathBytes) || last !== first) {
      pkg.append((pathBytes as Uint8Array).subarray(last + 1), status);
    } else {
      const separator = (pathBytes as Uint8Array)
        .subarray(0, pathText.length)
        .indexOf(U_TREE_SEPARATOR);
      if (separator >= 0) {
        tree.append((pathBytes as Uint8Array).subarray(separator + 1), status);
        if (isICUData) pkg.append(narrowBytes(U_ICUDATA_NAME), status);
        else {
          pkg.append(pathBytes, separator, status);
          if (first < 0) pathBytes = pkg.data();
        }
      } else pkg.append(isICUData ? narrowBytes(U_ICUDATA_NAME) : pathBytes, status);
    }
  }

  const tocName = new CharString().append(pkg, status);
  const tocPath = new CharString().append(pkg, status);
  const suffixIndex = tocName.length();
  if (!tree.isEmpty()) {
    tocName.append(U_TREE_ENTRY_SEP_CHAR, status).append(tree, status);
    tocPath.append(U_FILE_SEP_CHAR, status).append(tree, status);
  }
  const name = narrowBytes(request.name);
  tocName.append(U_TREE_ENTRY_SEP_CHAR, status).append(name, status);
  tocPath.append(U_FILE_SEP_CHAR, status).append(name, status);
  const type = request.type === null ? null : narrowBytes(request.type);
  if (type !== null && type[0] !== 0) {
    tocName.append(46, status).append(type, status);
    tocPath.append(46, status).append(type, status);
  }
  const suffix = tocPath.data().subarray(suffixIndex + 1);
  pathBytes ??= narrowBytes(COMMON_DATA_NAME);
  const dataPath = u_getDataDirectory();
  const subError: [number] = [E.U_ZERO_ERROR];

  let result: UDataMemory | null;
  if (isICUData && isTimeZoneFile(narrowString(name), type === null ? null : narrowString(type))) {
    const directory = u_getTimeZoneFilesDirectory(status);
    if (directory[0] !== 0) {
      const empty = new Uint8Array([0]);
      result = doLoadFromIndividualFiles(
        empty,
        directory,
        suffix,
        empty,
        request,
        subError,
        status,
      );
      if (result !== null || U_FAILURE(status[0])) return result;
    }
  }
  if (gDataFileAccess === UDataFileAccess.UDATA_PACKAGES_FIRST) {
    result = doLoadFromCommonData(isICUData, tocName.data(), pathBytes, request, subError, status);
    if (result !== null || U_FAILURE(status[0])) return result;
  }
  if (
    (gDataFileAccess === UDataFileAccess.UDATA_PACKAGES_FIRST ||
      gDataFileAccess === UDataFileAccess.UDATA_FILES_FIRST) &&
    (dataPath[0] !== 0 || !isICUData)
  ) {
    result = doLoadFromIndividualFiles(
      pkg.data(),
      dataPath,
      suffix,
      pathBytes,
      request,
      subError,
      status,
    );
    if (result !== null || U_FAILURE(status[0])) return result;
  }
  if (
    gDataFileAccess === UDataFileAccess.UDATA_ONLY_PACKAGES ||
    gDataFileAccess === UDataFileAccess.UDATA_FILES_FIRST ||
    gDataFileAccess === UDataFileAccess.UDATA_NO_FILES
  ) {
    result = doLoadFromCommonData(isICUData, tocName.data(), pathBytes, request, subError, status);
    if (result !== null || U_FAILURE(status[0])) return result;
  }
  if (U_SUCCESS(status[0]))
    status[0] = U_SUCCESS(subError[0]) ? E.U_FILE_ACCESS_ERROR : subError[0];
  return null;
}

/** Original unconditional item admission with native argument guards. @param path - Package path/null. @param type - Item type/null. @param name - Item name/null. @param status - Sticky status/null. @returns Owned data descriptor/null. */
export function udata_open(
  path: string | null,
  type: string | null,
  name: string | null,
  status: [number] | null,
): UDataMemory | null {
  if (status === null || U_FAILURE(status[0])) return null;
  if (name === null || name.length === 0 || name.charCodeAt(0) === 0) {
    status[0] = E.U_ILLEGAL_ARGUMENT_ERROR;
    return null;
  }
  return doOpenChoice(path, { type, name, isAcceptable: null, context: null }, status);
}

/** Original caller-controlled item admission with native argument guards. @param path - Package path/null. @param type - Item type/null. @param name - Item name/null. @param isAcceptable - Callback/null. @param context - Callback context. @param status - Sticky status/null. @returns Owned data descriptor/null. */
export function udata_openChoice(
  path: string | null,
  type: string | null,
  name: string | null,
  isAcceptable: UDataMemoryIsAcceptable | null,
  context: unknown,
  status: [number] | null,
): UDataMemory | null {
  if (status === null || U_FAILURE(status[0])) return null;
  if (name === null || name.length === 0 || name.charCodeAt(0) === 0 || isAcceptable === null) {
    status[0] = E.U_ILLEGAL_ARGUMENT_ERROR;
    return null;
  }
  return doOpenChoice(path, { type, name, isAcceptable, context }, status);
}

/** Original unsynchronized file-access setting, which ignores status. @param access - Search policy. @param status - Unused status. @returns Nothing. */
export function udata_setFileAccess(access: UDataFileAccess, status: [number] | null): void {
  void status;
  gDataFileAccess = access;
}
