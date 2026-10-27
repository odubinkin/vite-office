/** @fileoverview Original ICU78.3 default-package public resource APIs. Actual bundle/entry owners perform alias substitution, path and locale inheritance, copy/close and iterator state; immutable decoded resources project mapped storage. Native physical ABI/OOM and external packages remain uncertified. */
import { UResourceBundle } from "./uresimp";
import type { UResourceDataEntry } from "./uresbund.entries";
import { ures_close, ures_copyResb } from "./uresbund.lifecycle";
import { init_resb_resultFromContainer } from "./uresbund.alias";
import { getFallbackData, ures_getByKeyWithFallback } from "./uresbund.lookup";
import { res_getBuffer, type ResourceDataValue } from "./uresdata";
import { res_getTableItemByKey, res_getTableItemByIndex, res_getArrayItem } from "./uresdata.path";
import { UErrorCode as E, U_FAILURE } from "./unicode/utypes";
export { UResourceBundle, ures_initStackObject } from "./uresimp";
export {
  ures_open,
  ures_openNoDefault,
  ures_openDirect,
  ures_openFillIn,
  ures_close,
  ures_copyResb,
} from "./uresbund.lifecycle";
export { ures_getByKeyWithFallback } from "./uresbund.lookup";
export const UResType = {
  URES_NONE: -1,
  URES_STRING: 0,
  URES_BINARY: 1,
  URES_TABLE: 2,
  URES_ALIAS: 3,
  URES_INT: 7,
  URES_ARRAY: 8,
  URES_INT_VECTOR: 14,
} as const;
/** Immutable decoded public resource types, exported by the native APIs from the pinned data file. */
export type Resource =
  | { readonly type: 0 | 3; readonly value: string }
  | { readonly type: 1 | 14; readonly storage: number | string; readonly value: readonly number[] }
  | {
      readonly type: 2;
      readonly keys: readonly string[];
      readonly aliasIndices: readonly number[];
      readonly value: Readonly<Record<string, Resource>>;
    }
  | { readonly type: 7; readonly value: number }
  | {
      readonly type: 8;
      readonly aliasIndices: readonly number[];
      readonly value: readonly Resource[];
    };
/** Source nullable public status pointer where checked by the original function. */
type Status = [number] | null;
/** Original stored bundle size. @param bundle - Owner/null. @returns Count. */
export function ures_getSize(bundle: UResourceBundle | null): number {
  return bundle?.fSize ?? 0;
}
/** Original public raw type. @param bundle - Owner/null. @returns Type/NONE. */
export function ures_getType(bundle: UResourceBundle | null): number {
  return bundle?.fRes?.type ?? -1;
}
/** Original key pointer. @param bundle - Owner/null. @returns Key/null. */
export function ures_getKey(bundle: UResourceBundle | null): string | null {
  return bundle?.fKey ?? null;
}
/** Original actual filename query. @param bundle - Owner/null. @returns Name/null. */
export function ures_getName(bundle: UResourceBundle | null): string | null {
  return bundle === null ? null : (bundle.fData as UResourceDataEntry).fName;
}
/** Original valid/actual locale distinction; requested-locale enum is rejected by source. @param bundle - Owner/null. @param type - ACTUAL0/VALID1. @param status - Status. @returns Filename/null. */
export function ures_getLocaleByType(
  bundle: UResourceBundle | null,
  type: number,
  status: Status,
): string | null {
  if (status === null || U_FAILURE(status[0])) return null;
  if (bundle === null) {
    status[0] = E.U_ILLEGAL_ARGUMENT_ERROR;
    return null;
  }
  if (type === 0) return (bundle.fData as UResourceDataEntry).fName;
  if (type === 1) return (bundle.fValidLocaleDataEntry as UResourceDataEntry).fName;
  status[0] = E.U_ILLEGAL_ARGUMENT_ERROR;
  return null;
}
/** Original nullable bundle/status guard. @param bundle - Owner/null. @param status - Status. @returns Readable. */
function readable(bundle: UResourceBundle | null, status: Status): boolean {
  if (status === null || U_FAILURE(status[0])) return false;
  if (bundle === null) {
    status[0] = E.U_ILLEGAL_ARGUMENT_ERROR;
    return false;
  }
  return true;
}
/** Original integer read. @param bundle - Owner/null. @param status - Status. @returns Signed int/-1. */
export function ures_getInt(bundle: UResourceBundle | null, status: Status): number {
  if (!readable(bundle, status)) return -1;
  if (bundle?.fRes?.type === 7) return bundle.fRes.value;
  (status as [number])[0] = E.U_RESOURCE_TYPE_MISMATCH;
  return -1;
}
/** Original public typed status boundary over raw mapped storage. @param bundle - Owner/null. @param type - Expected type. @param length - Output. @param status - Status. @returns Storage/null. */
function buffer(
  bundle: UResourceBundle | null,
  type: 0 | 1 | 14,
  length: [number] | null,
  status: Status,
): string | readonly number[] | null {
  if (!readable(bundle, status)) return null;
  const value = res_getBuffer((bundle as UResourceBundle).fRes, type, length);
  if (value === null) (status as [number])[0] = E.U_RESOURCE_TYPE_MISMATCH;
  return value;
}
/** Original string read. @param bundle - Owner/null. @param length - Output. @param status - Status. @returns Storage/null. */
export function ures_getString(
  bundle: UResourceBundle | null,
  length: [number] | null,
  status: Status,
): string | null {
  return buffer(bundle, 0, length, status) as string | null;
}
/** Original binary read. @param bundle - Owner/null. @param length - Output. @param status - Status. @returns Storage/null. */
export function ures_getBinary(
  bundle: UResourceBundle | null,
  length: [number] | null,
  status: Status,
): readonly number[] | null {
  return buffer(bundle, 1, length, status) as readonly number[] | null;
}
/** Original vector read. @param bundle - Owner/null. @param length - Output. @param status - Status. @returns Storage/null. */
export function ures_getIntVector(
  bundle: UResourceBundle | null,
  length: [number] | null,
  status: Status,
): readonly number[] | null {
  return buffer(bundle, 14, length, status) as readonly number[] | null;
}
/** Original key lookup, root fallback only when enabled and dynamic alias result initialization. @param bundle - Owner/null. @param inKey - C key. @param fillIn - Result. @param status - Status. @returns Result/prior fill-in. */
export function ures_getByKey(
  bundle: UResourceBundle | null,
  inKey: string,
  fillIn: UResourceBundle | null,
  status: Status,
): UResourceBundle | null {
  if (!readable(bundle, status)) return fillIn;
  const source = bundle as UResourceBundle,
    s = status as [number],
    key: [string | null] = [inKey];
  if (source.fRes?.type !== 2) {
    s[0] = E.U_RESOURCE_TYPE_MISMATCH;
    return fillIn;
  }
  const resource = res_getTableItemByKey(source.fRes, key);
  if (resource !== null)
    return init_resb_resultFromContainer(
      source.fData as UResourceDataEntry,
      resource,
      key[0],
      -1,
      source,
      fillIn,
      s,
    );
  key[0] = inKey;
  if (source.fHasFallback) {
    const res: [Resource | null] = [null],
      data = getFallbackData(source, key, res, s);
    if (!U_FAILURE(s[0]))
      return init_resb_resultFromContainer(
        data as UResourceDataEntry,
        res[0],
        key[0],
        -1,
        source,
        fillIn,
        s,
      );
  }
  s[0] = E.U_MISSING_RESOURCE_ERROR;
  return fillIn;
}
/** Original indexed child initialization or scalar bundle copy. @param bundle - Owner/null. @param index - int32. @param fillIn - Result. @param status - Status. @returns Result/prior fill-in. */
export function ures_getByIndex(
  bundle: UResourceBundle | null,
  index: number,
  fillIn: UResourceBundle | null,
  status: Status,
): UResourceBundle | null {
  if (!readable(bundle, status)) return fillIn;
  const source = bundle as UResourceBundle,
    s = status as [number];
  index |= 0;
  if (index < 0 || index >= source.fSize) {
    s[0] = E.U_MISSING_RESOURCE_ERROR;
    return fillIn;
  }
  const r = source.fRes,
    key: [string | null] = [null];
  if (r?.type === 2 || r?.type === 8)
    return init_resb_resultFromContainer(
      source.fData as UResourceDataEntry,
      r.type === 2 ? res_getTableItemByIndex(r, index, key) : res_getArrayItem(r, index),
      key[0],
      index,
      source,
      fillIn,
      s,
    );
  if (r?.type === 0 || r?.type === 1 || r?.type === 7 || r?.type === 14)
    return ures_copyResb(fillIn, source, s);
  return fillIn;
}
/** Original string-by-key fast path, with a closed temporary owner only for alias resolution. @param bundle - Owner/null. @param inKey - Key. @param length - Output. @param status - Status. @returns Storage/null. */
export function ures_getStringByKey(
  bundle: UResourceBundle | null,
  inKey: string,
  length: [number] | null,
  status: Status,
): string | null {
  if (!readable(bundle, status)) return null;
  const source = bundle as UResourceBundle,
    s = status as [number],
    key: [string | null] = [inKey];
  if (source.fRes?.type !== 2) {
    s[0] = E.U_RESOURCE_TYPE_MISMATCH;
    return null;
  }
  let resource = res_getTableItemByKey(source.fRes, key);
  if (resource === null) {
    key[0] = inKey;
    if (!source.fHasFallback) {
      s[0] = E.U_MISSING_RESOURCE_ERROR;
      return null;
    }
    const res: [Resource | null] = [null];
    getFallbackData(source, key, res, s);
    resource = res[0];
    if (U_FAILURE(s[0])) {
      s[0] = E.U_MISSING_RESOURCE_ERROR;
      return null;
    }
  }
  if (resource?.type === 0) return res_getBuffer(resource, 0, length) as string | null;
  if (resource?.type === 3) {
    const temp = ures_getByKey(source, inKey, null, s),
      result = ures_getString(temp, length, s);
    ures_close(temp);
    return result;
  }
  s[0] = E.U_RESOURCE_TYPE_MISMATCH;
  return null;
}
/** Original indexed string helper leaves ordinary nonstring child status unchanged. @param bundle - Owner. @param r - Raw child. @param index - Index. @param length - Output. @param status - Status. @returns String/null. */
function stringWithAlias(
  bundle: UResourceBundle,
  r: Resource | null,
  index: number,
  length: [number] | null,
  status: [number],
): string | null {
  if (r?.type === 3) {
    const temp = ures_getByIndex(bundle, index, null, status),
      value = ures_getString(temp, length, status);
    ures_close(temp);
    return value;
  }
  return res_getBuffer(r, 0, length) as string | null;
}
/** Original indexed string dispatch with distinct scalar/child mismatch behavior. @param bundle - Owner/null. @param index - int32. @param length - Output. @param status - Status. @returns Storage/null. */
export function ures_getStringByIndex(
  bundle: UResourceBundle | null,
  index: number,
  length: [number] | null,
  status: Status,
): string | null {
  if (!readable(bundle, status)) return null;
  const source = bundle as UResourceBundle,
    s = status as [number];
  index |= 0;
  if (index < 0 || index >= source.fSize) {
    s[0] = E.U_MISSING_RESOURCE_ERROR;
    return null;
  }
  const r = source.fRes;
  if (r?.type === 0) return res_getBuffer(r, 0, length) as string | null;
  if (r?.type === 2 || r?.type === 8)
    return stringWithAlias(
      source,
      r.type === 2 ? res_getTableItemByIndex(r, index, [null]) : res_getArrayItem(r, index),
      index,
      length,
      s,
    );
  if (r?.type === 3) return stringWithAlias(source, r, index, length, s);
  s[0] =
    r?.type === 1 || r?.type === 7 || r?.type === 14
      ? E.U_RESOURCE_TYPE_MISMATCH
      : E.U_INTERNAL_PROGRAM_ERROR;
  return null;
}
/** Original iterator reset. @param bundle - Owner/null. @returns Nothing. */
export function ures_resetIterator(bundle: UResourceBundle | null): void {
  if (bundle !== null) bundle.fIndex = -1;
}
/** Original stored cursor/size test. @param bundle - Owner/null. @returns Remaining. */
export function ures_hasNext(bundle: UResourceBundle | null): boolean {
  return bundle !== null && bundle.fIndex < bundle.fSize - 1;
}
/** Original increments source cursor before child initialization or scalar copy. @param bundle - Owner/null. @param fillIn - Result. @param status - Status. @returns Result/prior fill-in. */
export function ures_getNextResource(
  bundle: UResourceBundle | null,
  fillIn: UResourceBundle | null,
  status: Status,
): UResourceBundle | null {
  if (!readable(bundle, status)) return fillIn;
  const source = bundle as UResourceBundle,
    s = status as [number];
  if (source.fIndex === source.fSize - 1) {
    s[0] = E.U_INDEX_OUTOFBOUNDS_ERROR;
    return fillIn;
  }
  ++source.fIndex;
  const r = source.fRes,
    key: [string | null] = [null];
  if (r?.type === 0 || r?.type === 1 || r?.type === 7 || r?.type === 14)
    return ures_copyResb(fillIn, source, s);
  if (r?.type === 2 || r?.type === 8)
    return init_resb_resultFromContainer(
      source.fData as UResourceDataEntry,
      r.type === 2
        ? res_getTableItemByIndex(r, source.fIndex, key)
        : res_getArrayItem(r, source.fIndex),
      key[0],
      source.fIndex,
      source,
      fillIn,
      s,
    );
  return fillIn;
}
/** Original fallback string wrapper closes stack storage and handles the three-empty-set inheritance marker. @param bundle - Owner/null. @param key - Path. @param length - Output. @param status - Nonnull status. @returns Storage/null. */
export function ures_getStringByKeyWithFallback(
  bundle: UResourceBundle | null,
  key: string,
  length: [number] | null,
  status: [number],
): string | null {
  const stack = new UResourceBundle(),
    n: [number] = [0];
  ures_getByKeyWithFallback(bundle, key, stack, status);
  let value = ures_getString(stack, n, status);
  ures_close(stack);
  if (U_FAILURE(status[0])) return null;
  if (n[0] === 3 && value === "∅∅∅") {
    value = null;
    n[0] = 0;
    status[0] = E.U_MISSING_RESOURCE_ERROR;
  }
  if (length !== null) length[0] = n[0];
  return value;
}

/** Original internal borrowed ResourceDataValue setup, using the caller's persistent temporary bundle for alias/path context. @param bundle - Original source. @param path - C path/null. @param tempFillIn - Caller-owned temporary. @param value - Actual holder. @param status - Sticky status. @returns Nothing. */
export function ures_getValueWithFallback(
  bundle: UResourceBundle | null,
  path: string | null,
  tempFillIn: UResourceBundle,
  value: ResourceDataValue,
  status: [number],
): void {
  if (U_FAILURE(status[0])) return;
  if (path === null) {
    status[0] = E.U_ILLEGAL_ARGUMENT_ERROR;
    return;
  }
  const rb =
    path === "" || path[0] === "\0"
      ? bundle
      : ures_getByKeyWithFallback(bundle, path, tempFillIn, status);
  if (U_FAILURE(status[0])) return;
  const result = rb as UResourceBundle;
  value.setData((result.fData as UResourceDataEntry).fData);
  value.setValidLocaleDataEntry(result.fValidLocaleDataEntry);
  value.setResource(result.fRes as Resource);
}
