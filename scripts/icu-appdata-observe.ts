/** @fileoverview Actual original app-data cache, UInitOnce, string-hash and cleanup drivers shared by native comparison/replay. Observes real source records; no cache/provider/allocator replacement. */
import * as U from "../apps/office/src/external/icu/source/common/unifiedcache";
import * as D from "../apps/office/src/external/icu/source/common/udata";
import * as H from "../apps/office/src/external/icu/source/common/uhash";
import {
  UInitOnce,
  umtx_initOnce,
  umtx_initImplPreInit,
  umtx_initImplPostInit,
} from "../apps/office/src/external/icu/source/common/umutex.h";
import {
  ECleanupCommonType,
  ucln_common_registerCleanup,
  ucln_lib_cleanup,
} from "../apps/office/src/external/icu/source/common/ucln_cmn.h";
import {
  ECleanupLibraryType,
  ucln_registerCleanup,
  ucln_cleanupOne,
} from "../apps/office/src/external/icu/source/common/ucln";
import {
  DataHeader,
  udata_checkCommonData,
  udata_getHeaderSize,
} from "../apps/office/src/external/icu/source/common/ucmndata.h";
import { PointerTOC } from "../apps/office/src/external/icu/source/common/ucmndata";
import {
  UDataMemory,
  UDataMemory_init,
  UDataMemory_setData,
  UDataMemory_normalizeDataPointer,
  udata_getLength,
} from "../apps/office/src/external/icu/source/common/udatamem.h";
import type { CommonPackage } from "./icu-common-data-observe";
/** Original method inputs. */
export interface AppDataOp {
  op: string;
  args: number[];
  path?: number[];
  other?: number[];
}
/** Actual narrow-byte string binding. @param bytes - Native bytes without implicit final NUL. @returns Byte string. */
function narrow(bytes: number[]): string {
  return String.fromCharCode(...bytes);
}
/** Observes native C content (without final NUL). @param value - Actual narrow key. @returns Length/payload. */
function key(value: string): number[] {
  const nul = value.indexOf("\0"),
    s = nul < 0 ? value : value.slice(0, nul);
  return [
    s.length,
    ...Array.from(
      s,
      /** Reads actual byte. @param c - Narrow unit. @returns Byte. */ (c) => c.charCodeAt(0) & 255,
    ),
  ];
}
/** Runs actual source operations in order over original generated package storage. @param ops - Sequence. @param pkg - Genuine common-data inputs. @returns Full initialized field snapshots. */
export function observeAppData(ops: AppDataOp[], pkg: CommonPackage): number[][] {
  ucln_lib_cleanup();
  const entries = pkg.entries.map(
    /** Binds actual original static C pointer fields. @param e - Original entry. @returns Managed fields. */ (
      e,
    ) => ({
      entryName: Uint8Array.from(e.name),
      pHeader: Uint8Array.from(Buffer.from(e.data, "base64")),
    }),
  );
  const packages: DataHeader[] = [];
  for (let i = 0; i < 6; ++i) {
    if (i === 2 || i === 3) {
      packages.push(new DataHeader(Uint8Array.from(Buffer.from(pkg.offset, "base64"))));
      continue;
    }
    const pre = i === 4 ? 8 : 0,
      bytes = new Uint8Array(pre + 40 + 16 * entries.length);
    bytes.set(pkg.pointerHeader, pre);
    new Uint32Array(bytes.buffer, pre + 32, 2).set([entries.length, 0]);
    if (i === 5) bytes[2] = 0;
    const table = new PointerTOC(bytes.subarray(pre + 32), entries);
    packages.push(new DataHeader(bytes, new Map([[pre + 32, table]])));
  }
  const canonical = packages.map(
    /** Reads actual source normalization, without a replacement package decoder. @param p - Address. @returns Header. */ (
      p,
    ) => UDataMemory_normalizeDataPointer(p),
  );
  /** Full real descriptor field projection. @param value - Handle/null. @returns Fields. */
  function memory(value: UDataMemory | null): number[] {
    if (value === null) return [-1];
    const h = value.pHeader;
    let id = -1;
    if (h !== null)
      for (let i = 0; i < canonical.length; ++i) {
        const p = canonical[i] as DataHeader;
        if (h.data.buffer === p.data.buffer && h.data.byteOffset === p.data.byteOffset) id = i;
      }
    const toc = value.toc as { data: Uint8Array } | null;
    const row = [
      id,
      Number(value.heapAllocated),
      value.length,
      Number(value.map !== null),
      Number(value.mapAddr !== null),
      Number(value.vFuncs !== null),
      toc === null ? -1 : toc.data.byteOffset,
      udata_getLength(value),
    ];
    if (h !== null) row.push(udata_getHeaderSize(h), ...h.data.subarray(0, 24));
    return row;
  }
  /** All represented initialized cache fields and live keys/values in original slot order. @returns Fields. */
  function cache(): number[] {
    const t = D.gCommonDataCache,
      row = [
        Number(D.gCommonDataCacheInitOnce.isReset()),
        D.gCommonDataCacheInitOnce["fState"],
        D.gCommonDataCacheInitOnce["fErrCode"],
        D.gHaveTriedToLoadCommonData,
        Number(t === null),
        U.gCacheInitOnce["fState"],
        U.gCacheInitOnce["fErrCode"],
        Number(U.gCache === null),
        U.gCache === null ? -1 : U.gCache.keyCount(),
      ];
    if (t === null) return row;
    row.push(
      t.primeIndex,
      t.length,
      t.count,
      t.highWaterMark,
      Number(t.keyHasher === H.uhash_hashChars),
      Number(t.keyComparator === H.uhash_compareChars),
      Number(t.keyDeleter !== null),
      Number(t.valueDeleter !== null),
    );
    for (const e of t.elements) {
      row.push(e.hashcode);
      if (e.hashcode >= 0) {
        row.push(
          ...key(e.key as string),
          ...key((e.value as D.DataCacheElement).name),
          ...memory((e.value as D.DataCacheElement).item),
        );
      }
    }
    return row;
  }
  const once = new UInitOnce(),
    logs: number[] = [],
    rows: number[][] = [];
  let calls = 0;
  const callbacks = Array.from(
    { length: 10 },
    /** Supplies real original cleanup extension inputs, not a provider replacement. @param _unused - Unused. @param id - Callback ID. @returns Actual callback. */ (
      _unused,
      id,
    ) =>
      /** Actual original cleanup callback input. @returns Native test return value, ignored by original dispatch. */ () => {
        logs.push(id);
        return id % 2 === 0;
      },
  );
  for (const item of ops) {
    const a = item.args,
      p = narrow(item.path ?? []),
      q = narrow(item.other ?? []),
      status: [number] = [a[1] ?? 0];
    let row: number[] = [];
    if (item.op === "S") {
      D.udata_setAppData(
        (a[2] as number) & 2 ? null : p,
        (a[0] as number) < 0 ? null : (packages[a[0] as number] as DataHeader),
        (a[2] as number) & 1 ? null : status,
      );
      row = [status[0]];
    }
    if (item.op === "K") {
      const input = new UDataMemory();
      UDataMemory_init(input);
      if ((a[0] as number) >= 0) {
        UDataMemory_setData(input, packages[a[0] as number] as DataHeader);
        if (!a[3]) udata_checkCommonData(input, [0]);
      }
      input.length = a[2] as number;
      row = [...memory(D.udata_cacheDataItem(p, input, status)), status[0]];
    }
    if (item.op === "F") {
      row = [...memory(D.udata_findCachedData(p, status)), status[0]];
    }
    if (item.op === "C") row = [Number(ucln_lib_cleanup())];
    if (item.op === "D") row = [Number(D.udata_cleanup())];
    if (item.op === "B") {
      const cb = (a[2] as number) < 0 ? null : (callbacks[a[2] as number] as () => boolean);
      if (a[0] === 0) ucln_registerCleanup(a[1] as ECleanupLibraryType, cb);
      else ucln_common_registerCleanup(a[1] as ECleanupCommonType, cb);
    }
    if (item.op === "L") ucln_cleanupOne(a[0] as ECleanupLibraryType);
    if (item.op === "H") {
      const x = (a[0] as number) & 1 ? null : p,
        y = (a[0] as number) & 4 ? x : (a[0] as number) & 2 ? null : q;
      row = [H.uhash_hashChars(x), H.uhash_hashChars(y), Number(H.uhash_compareChars(x, y))];
    }
    if (item.op === "U") {
      const before = U.gCache;
      const value = U.UnifiedCache.getInstance(status);
      row = [status[0], Number(value === null), before === null ? -1 : Number(value === before)];
    }
    if (item.op === "O") {
      const before = Number(once.isReset()),
        priorState = once["fState"],
        priorError = once["fErrCode"],
        s: [number] = [a[1] as number];
      let inner = -1,
        innerError = -1,
        result = -1;
      if (a[0] === 2) once.reset();
      else if (a[0] === 3) result = Number(umtx_initImplPreInit(once));
      else if (a[0] === 4) umtx_initImplPostInit(once);
      else if (a[0] === 1)
        umtx_initOnce(
          once,
          /** Actual original plain initializer input. @returns Nothing. */ () => {
            ++calls;
            inner = once["fState"];
            innerError = once["fErrCode"];
          },
        );
      else
        umtx_initOnce(
          once,
          /** Actual original status initializer input. @param error - Source status. @returns Nothing. */ (
            error,
          ) => {
            ++calls;
            inner = once["fState"];
            innerError = once["fErrCode"];
            error[0] = a[2] as number;
          },
          s,
        );
      row = [
        before,
        priorState,
        priorError,
        calls,
        inner,
        innerError,
        result,
        s[0],
        Number(once.isReset()),
        once["fState"],
        once["fErrCode"],
      ];
    }
    row.push(...cache(), logs.length, ...logs);
    rows.push(row);
  }
  ucln_lib_cleanup();
  return rows;
}
