/** @fileoverview Original ICU78.3 res_findResource and source resource table/array path primitives. Uint8Array+offset projects mutable narrow pointers. Original strtol long64-to-int32 conversion is retained on the pinned native target; invalid readable ranges/overlap and other ABIs remain uncertified. */
import { uprv_strtol } from "./cstring";
import type { Resource } from "./uresbund";
/** Native borrowed char pointer, including its actual mutable storage. */
export interface ResPointer {
  readonly bytes: Uint8Array;
  readonly offset: number;
}
/** Narrow C storage projection for public string arguments. @param text - Narrow text. @returns Terminated mutable storage. */
export function resPointer(text: string): ResPointer {
  const bytes = new Uint8Array(text.length + 1);
  for (let i = 0; i < text.length; ++i) bytes[i] = text.charCodeAt(i);
  return { bytes, offset: 0 };
}
/** Original C string at a source-valid pointer; null is only used for optional metadata. @param pointer - Pointer/null. @returns C span/empty. */
export function resCString(pointer: ResPointer | Uint8Array | string | null): string {
  if (pointer === null) return "";
  if (typeof pointer === "string") {
    const n = pointer.indexOf("\0");
    return n < 0 ? pointer : pointer.slice(0, n);
  }
  const bytes = pointer instanceof Uint8Array ? pointer : pointer.bytes,
    offset = pointer instanceof Uint8Array ? 0 : pointer.offset;
  let s = "";
  for (let i = offset; i < bytes.length && bytes[i] !== 0; ++i)
    s += String.fromCharCode(bytes[i] as number);
  return s;
}
/** Native public resource item count. @param r - Raw resource/bogus. @returns Count. */
export function res_countArrayItems(r: Resource | null): number {
  return r === null ? 0 : r.type === 2 ? r.keys.length : r.type === 8 ? r.value.length : 1;
}
/** Original keyed table access, with canonical key on a match. @param table - Raw node. @param key - C key in/out. @returns Raw child/bogus. */
export function res_getTableItemByKey(
  table: Resource | null,
  key: [string | null],
): Resource | null {
  if (key[0] === null || table?.type !== 2) return null;
  const text = resCString(key[0]);
  let start = 0,
    limit = table.keys.length;
  while (start < limit) {
    const mid = Math.trunc((start + limit) / 2),
      tableKey = table.keys[mid] as string;
    if (text < tableKey) limit = mid;
    else if (text > tableKey) start = mid + 1;
    else {
      key[0] = tableKey;
      return table.value[tableKey] as Resource;
    }
  }
  return null;
}
/** Original indexed table access. @param table - Raw node. @param index - Signed32 index. @param key - Output key. @returns Child/bogus. */
export function res_getTableItemByIndex(
  table: Resource | null,
  index: number,
  key: [string | null] | null,
): Resource | null {
  index |= 0;
  if (table?.type !== 2 || index < 0 || index >= table.keys.length) return null;
  const found = table.keys[index] as string;
  if (key !== null) key[0] = found;
  return table.value[found] as Resource;
}
/** Original indexed array access. @param array - Raw node. @param index - Signed32 index. @returns Child/bogus. */
export function res_getArrayItem(array: Resource | null, index: number): Resource | null {
  index |= 0;
  return array?.type === 8 && index >= 0 && index < array.value.length
    ? (array.value[index] as Resource)
    : null;
}
/** Original strtol decimal, including C whitespace/sign, long64 saturation, end pointer and assigned int32 wrapping. @param text - C span. @returns Native assigned value and consumed byte offset. */
function arrayIndex(text: string): readonly [number, number] {
  const end: [number] = [0];
  const value = uprv_strtol(text, end, 10);
  return [Number(BigInt.asIntN(32, value)), end[0]];
}
/** Original path walk mutates separators, updates the caller pointer even on many failures, stops at scalar/alias nodes and retains key for empty initial paths. @param resource - Starting node. @param path - Mutable pointer reference. @param key - Key output/incoming for unchanged cases. @returns Found node/bogus. */
export function res_findResource(
  resource: Resource | null,
  path: [ResPointer],
  key: [string | null],
): Resource | null {
  let pathP = path[0],
    nextSepP: ResPointer | null = path[0],
    t1 = resource;
  if (resCString(pathP).length === 0) return resource;
  if (t1?.type !== 2 && t1?.type !== 8) return null;
  while (
    nextSepP !== null &&
    resCString(pathP) !== "" &&
    t1 !== null &&
    (t1.type === 2 || t1.type === 8)
  ) {
    const text = resCString(pathP),
      sep = text.indexOf("/");
    if (sep >= 0) {
      if (sep === 0) return null;
      nextSepP = { bytes: pathP.bytes, offset: pathP.offset + sep };
      nextSepP.bytes[nextSepP.offset] = 0;
      path[0] = { bytes: pathP.bytes, offset: nextSepP.offset + 1 };
    } else {
      nextSepP = null;
      path[0] = { bytes: pathP.bytes, offset: pathP.offset + text.length };
    }
    if (t1.type === 2) {
      key[0] = resCString(pathP);
      t1 = res_getTableItemByKey(t1, key);
    } else {
      const part = resCString(pathP),
        [index, end] = arrayIndex(part);
      t1 = index >= 0 && end === part.length ? res_getArrayItem(t1, index) : null;
      key[0] = null;
    }
    pathP = path[0];
  }
  return t1;
}
