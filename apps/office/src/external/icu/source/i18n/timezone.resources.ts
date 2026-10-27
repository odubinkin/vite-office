/** @fileoverview Consumed source timezone.cpp resource lookup and ZoneMeta-facing borrowed-ID helpers. Free functions project native file-local/protected static entrypoints without a concrete/base-class import cycle. */
import { UnicodeString } from "../common/unistr";
import { UErrorCode as E, U_FAILURE } from "../common/unicode/utypes";
import * as R from "../common/uresbund";

/** Original binary search, including unchanged status on an ordinary miss. @param array - Names resource. @param id - UTF16 ID. @param status - ICU status. @returns Index or minus one. */
export function findInStringArray(
  array: R.UResourceBundle | null,
  id: UnicodeString,
  status: [number],
): number {
  let start = 0,
    limit = R.ures_getSize(array),
    lastMid = 0x7fffffff;
  if (U_FAILURE(status[0]) || limit < 1) return -1;
  for (;;) {
    const mid = Math.trunc((start + limit) / 2);
    if (lastMid === mid) break;
    lastMid = mid;
    const length: [number] = [0],
      text = R.ures_getStringByIndex(array, mid, length, status);
    if (U_FAILURE(status[0])) break;
    const result = id.compare(new UnicodeString(text, length[0]));
    if (result === 0) return mid;
    if (result < 0) limit = mid;
    else start = mid;
  }
  return -1;
}
/** Original named zone lookup, preserving reuse/failure ordering. @param top - zoneinfo64 root. @param id - ID. @param old - Optional reused result. @param status - Status. @returns Zone or null on failure. */
export function getZoneByName(
  top: R.UResourceBundle | null,
  id: UnicodeString,
  old: R.UResourceBundle | null,
  status: [number],
): R.UResourceBundle | null {
  let tmp = R.ures_getByKey(top, "Names", null, status);
  const index = findInStringArray(tmp, id, status);
  if (index === -1 && !U_FAILURE(status[0])) status[0] = E.U_MISSING_RESOURCE_ERROR;
  else {
    tmp = R.ures_getByKey(top, "Zones", tmp, status);
    old = R.ures_getByIndex(tmp, index, old, status);
  }
  R.ures_close(tmp);
  return U_FAILURE(status[0]) ? null : old;
}
/** Original resource open and exactly one integer-link dereference. @param id - Requested ID. @param res - Reused zone result. @param status - Status. @returns Root handle even when the requested ID is missing. */
export function openOlsonResource(
  id: UnicodeString,
  res: R.UResourceBundle,
  status: [number],
): R.UResourceBundle | null {
  const top = R.ures_openDirect(null, "zoneinfo64", status);
  getZoneByName(top, id, res, status);
  if (R.ures_getType(res) === R.UResType.URES_INT) {
    const deref = R.ures_getInt(res, status),
      zones = R.ures_getByKey(top, "Zones", null, status);
    R.ures_getByIndex(zones, deref, res, status);
    R.ures_close(zones);
  }
  return top;
}
/** Source TimeZone::loadRule for invariant rule IDs from the pinned resource (native buffer/overflow preconditions retained). @param top - Root. @param id - Rule ID. @param old - Reused result. @param status - Status. @returns Rule resource. */
export function loadRule(
  top: R.UResourceBundle | null,
  id: UnicodeString,
  old: R.UResourceBundle | null,
  status: [number],
): R.UResourceBundle | null {
  const text = (id.getBuffer() ?? "").slice(0, 63),
    key = text.split("\0", 1)[0] as string;
  const rules = R.ures_getByKey(top, "Rules", old, status);
  return R.ures_getByKey(rules, key, rules, status);
}
/** Original protected TimeZone borrowed-ID lookup. @param id - ID. @returns Pinned ID or null. */
export function findID(id: UnicodeString): string | null {
  const status: [number] = [0],
    root = R.ures_openDirect(null, "zoneinfo64", status),
    names = R.ures_getByKey(root, "Names", null, status),
    index = findInStringArray(names, id, status),
    result = R.ures_getStringByIndex(names, index, null, status);
  R.ures_close(names);
  R.ures_close(root);
  return U_FAILURE(status[0]) ? null : result;
}
/** Original single Olson-link dereference used by ZoneMeta. @param id - ID. @returns Pinned target name or null. */
export function dereferOlsonLink(id: UnicodeString): string | null {
  const status: [number] = [0],
    root = R.ures_openDirect(null, "zoneinfo64", status),
    names = R.ures_getByKey(root, "Names", null, status),
    index = findInStringArray(names, id, status);
  let result = R.ures_getStringByIndex(names, index, null, status);
  R.ures_getByKey(root, "Zones", root, status);
  R.ures_getByIndex(root, index, root, status);
  if (!U_FAILURE(status[0]) && R.ures_getType(root) === R.UResType.URES_INT) {
    const deref = R.ures_getInt(root, status),
      value = R.ures_getStringByIndex(names, deref, null, status);
    if (!U_FAILURE(status[0])) result = value;
  }
  R.ures_close(names);
  R.ures_close(root);
  return result;
}
