/** @fileoverview ICU78.3 direct resource read contract for pinned zoneinfo64/keyTypeData. JSON projects immutable mapped resource storage and resolved alias boundaries; locale fallback, dynamic alias resolution, native allocation/lifetime and arbitrary packages remain unported. */
import zoneinfo64 from "../data/misc/zoneinfo64.json";
import keyTypeData from "../data/misc/keyTypeData.json";
import { UErrorCode as E, U_FAILURE } from "./unicode/utypes";

export const UResType = {
  URES_NONE: -1,
  URES_STRING: 0,
  URES_BINARY: 1,
  URES_TABLE: 2,
  URES_INT: 7,
  URES_ARRAY: 8,
  URES_INT_VECTOR: 14,
} as const;
/** Immutable decoded public resource types, exported by the native APIs from the pinned data file. */
export type Resource =
  | { readonly type: 0; readonly value: string }
  | { readonly type: 1 | 14; readonly storage: number; readonly value: readonly number[] }
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
/** Native nullable UErrorCode pointer. */
type Status = [number] | null;
const mappedBuffers = new Map<number, readonly number[]>();
/** Original reusable bundle handle; storage and keys borrow the immutable mapped resource. */
export class UResourceBundle {
  fIndex = -1;
  /** Projects native result initialization; a default stack bundle has no resource. @param resource - Borrowed storage. @param key - Borrowed table key. @returns Handle. */
  constructor(
    public resource: Resource | null = null,
    public key: string | null = null,
  ) {}
}
/** Original direct-open consumed package/name overload, without locale fallback. @param packageName - Default ICU package. @param name - Pinned resource. @param status - Nullable sticky status. @returns Handle or null. */
export function ures_openDirect(
  packageName: null,
  name: "zoneinfo64" | "keyTypeData",
  status: Status,
): UResourceBundle | null {
  void packageName;
  if (status === null || U_FAILURE(status[0])) return null;
  return new UResourceBundle(
    (name === "zoneinfo64" ? zoneinfo64.resource : keyTypeData.resource) as Resource,
  );
}
/** Original scalar/table/array public size. @param bundle - Handle or null. @returns Size; scalar resources always have size one. */
export function ures_getSize(bundle: UResourceBundle | null): number {
  const resource = bundle?.resource;
  if (!resource) return 0;
  return resource.type === 2
    ? resource.keys.length
    : resource.type === 8
      ? resource.value.length
      : 1;
}
/** Original public type query. @param bundle - Handle. @returns Type or NONE. */
export function ures_getType(bundle: UResourceBundle | null): number {
  return bundle?.resource?.type ?? UResType.URES_NONE;
}
/** Original table key query. @param bundle - Handle. @returns Key or null. */
export function ures_getKey(bundle: UResourceBundle | null): string | null {
  return bundle?.key ?? null;
}
/** Original reusable result initialization; source storage is captured before overwriting the handle. @param resource - Borrowed storage. @param key - Table key. @param fillIn - Reused handle. @returns Handle. */
function result(
  resource: Resource | null,
  key: string | null,
  fillIn: UResourceBundle | null,
): UResourceBundle {
  if (fillIn === null) return new UResourceBundle(resource, key);
  fillIn.resource = resource;
  fillIn.key = key;
  fillIn.fIndex = -1;
  return fillIn;
}
/** Original direct table lookup and unchanged fillIn on failure. @param bundle - Source. @param key - Key. @param fillIn - Result owner. @param status - Nullable sticky status. @returns Reused/new handle or original fillIn on failure. */
export function ures_getByKey(
  bundle: UResourceBundle | null,
  key: string,
  fillIn: UResourceBundle | null,
  status: Status,
): UResourceBundle | null {
  if (status === null || U_FAILURE(status[0])) return fillIn;
  if (bundle === null) {
    status[0] = E.U_ILLEGAL_ARGUMENT_ERROR;
    return fillIn;
  }
  const resource = bundle.resource;
  if (resource?.type !== 2) status[0] = E.U_RESOURCE_TYPE_MISMATCH;
  else if (!Object.hasOwn(resource.value, key)) status[0] = E.U_MISSING_RESOURCE_ERROR;
  else return result(resource.value[key] as Resource, key, fillIn);
  return fillIn;
}
/** Original indexed lookup; indexing any scalar at zero copies its bundle. @param bundle - Source. @param index - Native int32 index. @param fillIn - Result owner. @param status - Nullable sticky status. @returns Result or original fillIn on failure. */
export function ures_getByIndex(
  bundle: UResourceBundle | null,
  index: number,
  fillIn: UResourceBundle | null,
  status: Status,
): UResourceBundle | null {
  if (status === null || U_FAILURE(status[0])) return fillIn;
  if (bundle === null) {
    status[0] = E.U_ILLEGAL_ARGUMENT_ERROR;
    return fillIn;
  }
  index |= 0;
  if (index < 0 || index >= ures_getSize(bundle)) {
    status[0] = E.U_MISSING_RESOURCE_ERROR;
    return fillIn;
  }
  const resource = bundle.resource as Resource;
  if (resource.type === 2) {
    const key = resource.keys[index] as string;
    return result(resource.value[key] as Resource, key, fillIn);
  }
  if (resource.type === 8) return result(resource.value[index] as Resource, null, fillIn);
  return ures_copyResb(fillIn, bundle, status);
}
/** Original typed scalar getter guard. @param bundle - Handle. @param status - Sticky status. @returns Whether source may be read. */
function readable(bundle: UResourceBundle | null, status: Status): boolean {
  if (status === null || U_FAILURE(status[0])) return false;
  if (bundle === null) {
    status[0] = E.U_ILLEGAL_ARGUMENT_ERROR;
    return false;
  }
  return true;
}
/** Original signed integer getter; failed output is int32 minus one. @param bundle - Handle. @param status - Status. @returns Integer or minus one. */
export function ures_getInt(bundle: UResourceBundle | null, status: Status): number {
  if (!readable(bundle, status)) return -1;
  if (bundle?.resource?.type === 7) return bundle.resource.value;
  (status as [number])[0] = E.U_RESOURCE_TYPE_MISMATCH;
  return -1;
}
/** Original typed buffer/string getter with low-level mismatch length reset; null handles and incoming failures leave length untouched. @param bundle - Handle. @param type - Expected public type. @param length - Optional length output. @param status - Status. @returns Borrowed scalar buffer or string. */
function buffer(
  bundle: UResourceBundle | null,
  type: 0 | 1 | 14,
  length: [number] | null,
  status: Status,
): string | readonly number[] | null {
  if (!readable(bundle, status)) return null;
  const resource = bundle?.resource;
  if (resource?.type !== type) {
    if (length !== null) length[0] = 0;
    (status as [number])[0] = E.U_RESOURCE_TYPE_MISMATCH;
    return null;
  }
  let value = resource.value as string | readonly number[];
  if (resource.type === 1 || resource.type === 14) {
    const mapped = mappedBuffers.get(resource.storage);
    if (mapped !== undefined) value = mapped;
    else mappedBuffers.set(resource.storage, resource.value);
  }
  if (length !== null) length[0] = value.length;
  return value;
}
/** Original string getter. @param bundle - Handle. @param length - Length output. @param status - Status. @returns Borrowed string or null. */
export function ures_getString(
  bundle: UResourceBundle | null,
  length: [number] | null,
  status: Status,
): string | null {
  return buffer(bundle, 0, length, status) as string | null;
}
/** Original binary getter. @param bundle - Handle. @param length - Length output. @param status - Status. @returns Borrowed bytes or null. */
export function ures_getBinary(
  bundle: UResourceBundle | null,
  length: [number] | null,
  status: Status,
): readonly number[] | null {
  return buffer(bundle, 1, length, status) as readonly number[] | null;
}
/** Original int-vector getter. @param bundle - Handle. @param length - Length output. @param status - Status. @returns Borrowed vector or null. */
export function ures_getIntVector(
  bundle: UResourceBundle | null,
  length: [number] | null,
  status: Status,
): readonly number[] | null {
  return buffer(bundle, 14, length, status) as readonly number[] | null;
}
/** Original keyed string lookup retains length on missing keys or non-alias child type mismatch; aliases delegate to the scalar getter. @param bundle - Handle. @param key - Key. @param length - Length output. @param status - Status. @returns Borrowed string or null. */
export function ures_getStringByKey(
  bundle: UResourceBundle | null,
  key: string,
  length: [number] | null,
  status: Status,
): string | null {
  const child = ures_getByKey(bundle, key, null, status);
  if (child === null) return null;
  const parent = bundle?.resource;
  if (parent?.type === 2 && parent.aliasIndices.includes(parent.keys.indexOf(key)))
    return ures_getString(child, length, status);
  if (child.resource?.type !== 0) {
    if (status !== null) status[0] = E.U_RESOURCE_TYPE_MISMATCH;
    return null;
  }
  return ures_getString(child, length, status);
}
/** Original indexed string lookup: nonstring table/array children return null and length zero without setting an error; nonstring scalar bundles set a mismatch and retain length. @param bundle - Handle. @param index - Index. @param length - Length output. @param status - Status. @returns Borrowed string or null. */
export function ures_getStringByIndex(
  bundle: UResourceBundle | null,
  index: number,
  length: [number] | null,
  status: Status,
): string | null {
  const child = ures_getByIndex(bundle, index, null, status);
  if (child === null) return null;
  const parent = bundle?.resource;
  if ((parent?.type === 2 || parent?.type === 8) && parent.aliasIndices.includes(index | 0))
    return ures_getString(child, length, status);
  if (child.resource?.type !== 0) {
    if (bundle?.resource?.type === 2 || bundle?.resource?.type === 8) {
      if (length !== null) length[0] = 0;
    } else if (status !== null) status[0] = E.U_RESOURCE_TYPE_MISMATCH;
    return null;
  }
  return ures_getString(child, length, status);
}

/** Original bundle copy retains the source iterator cursor; self-copy and null source are no-ops. Native path storage/refcount/allocator ownership is not simulated. @param fillIn - Reusable/new owner. @param original - Copied source/null. @param status - Sticky status. @returns Result owner. */
export function ures_copyResb(
  fillIn: UResourceBundle | null,
  original: UResourceBundle | null,
  status: [number],
): UResourceBundle | null {
  if (U_FAILURE(status[0]) || fillIn === original) return fillIn;
  if (original !== null) {
    const index = original.fIndex;
    fillIn = result(original.resource, original.key, fillIn);
    fillIn.fIndex = index;
  }
  return fillIn;
}
/** Original iterator reset ignores null. @param bundle - Actual owner. @returns Nothing. */
export function ures_resetIterator(bundle: UResourceBundle | null): void {
  if (bundle !== null) bundle.fIndex = -1;
}
/** Original strict cursor/size query. @param bundle - Actual owner/null. @returns Remaining resource. */
export function ures_hasNext(bundle: UResourceBundle | null): boolean {
  return bundle !== null && bundle.fIndex < ures_getSize(bundle) - 1;
}
/** Original getNextResource increments the actual source cursor before dispatch and retains fillIn on failure. Scalar copies preserve the incremented cursor; child initialization resets its cursor. @param bundle - Iterated owner/null. @param fillIn - Reusable child/null. @param status - Nullable sticky status. @returns Child or prior fillIn. */
export function ures_getNextResource(
  bundle: UResourceBundle | null,
  fillIn: UResourceBundle | null,
  status: Status,
): UResourceBundle | null {
  if (status === null || U_FAILURE(status[0])) return fillIn;
  if (bundle === null) {
    status[0] = E.U_ILLEGAL_ARGUMENT_ERROR;
    return fillIn;
  }
  if (bundle.fIndex === ures_getSize(bundle) - 1) {
    status[0] = E.U_INDEX_OUTOFBOUNDS_ERROR;
    return fillIn;
  }
  ++bundle.fIndex;
  const resource = bundle.resource;
  if (resource === null) return fillIn;
  if (resource.type === 0 || resource.type === 1 || resource.type === 7 || resource.type === 14)
    return ures_copyResb(fillIn, bundle, status);
  return ures_getByIndex(bundle, bundle.fIndex, fillIn, status);
}
