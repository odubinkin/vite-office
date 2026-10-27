/** @fileoverview Original ICU78.3 init_resb_result/getAliasTargetAsResourceBundle. Resolves the pinned package's LOCALE/ICUDATA aliases through actual entries and mutable paths, retaining source fallback/path/recursion rules. Other packages, allocator failures and physically invalid pointer lifetimes remain uncertified. */
/* eslint-disable no-useless-assignment -- Preserve original alias-parser initial pointer state and branch assignments. */
import type { Resource } from "./uresbund";
import { UResourceBundle } from "./uresimp";
import { UResourceDataEntry, entryClose, entryIncrease } from "./uresbund.entries";
import {
  ures_openDirect,
  ures_close,
  ures_freeResPath,
  ures_appendResPath,
} from "./uresbund.lifecycle";
import {
  resPointer,
  resCString,
  res_findResource,
  res_getArrayItem,
  res_getTableItemByIndex,
  res_countArrayItems,
  type ResPointer,
} from "./uresdata.path";
import { uprv_isInvariantUString } from "./uinvchar";
import { UErrorCode as E, U_FAILURE } from "./unicode/utypes";
/** Original recursive result initializer over actual entry owners and pointer-identical container paths. @param dataEntry - Actual data. @param r - Raw node/bogus. @param key - Canonical key/null. @param idx - Index/-1. @param valid - Valid locale. @param containerPath - Borrowed path/null. @param depth - Recursion depth. @param bundle - Fill-in/null. @param status - Nullable status. @returns Result/prior fill-in/null. */
export function init_resb_result(
  dataEntry: UResourceDataEntry,
  r: Resource | null,
  key: string | null,
  idx: number,
  valid: UResourceDataEntry | null,
  containerPath: Uint8Array | null,
  depth: number,
  bundle: UResourceBundle | null,
  status: [number] | null,
): UResourceBundle | null {
  if (status === null || U_FAILURE(status[0])) return bundle;
  if (valid === null) {
    status[0] = E.U_ILLEGAL_ARGUMENT_ERROR;
    return null;
  }
  if (r?.type === 3) {
    if (depth >= 256) {
      status[0] = E.U_TOO_MANY_ALIASES_ERROR;
      return bundle;
    }
    return getAliasTargetAsResourceBundle(r, key, idx, valid, containerPath, depth, bundle, status);
  }
  if (bundle === null) {
    bundle = new UResourceBundle();
    bundle.isStackObject = false;
  } else {
    if (bundle.fData !== null) entryClose(bundle.fData);
    if (containerPath !== bundle.fResPath) ures_freeResPath(bundle);
  }
  bundle.fData = dataEntry;
  entryIncrease(dataEntry);
  bundle.fHasFallback = bundle.fIsTopLevel = false;
  bundle.fIndex = -1;
  bundle.fKey = key;
  bundle.fValidLocaleDataEntry = valid;
  if (containerPath !== bundle.fResPath)
    ures_appendResPath(
      bundle,
      containerPath as Uint8Array,
      resCString(containerPath).length,
      status,
    );
  if (key !== null) {
    ures_appendResPath(bundle, key, resCString(key).length, status);
    if ((bundle.fResPath as Uint8Array)[bundle.fResPathLen - 1] !== 47)
      ures_appendResPath(bundle, "/", 1, status);
  } else if (idx >= 0) {
    const text = String(idx);
    ures_appendResPath(bundle, text, text.length, status);
    if ((bundle.fResPath as Uint8Array)[bundle.fResPathLen - 1] !== 47)
      ures_appendResPath(bundle, "/", 1, status);
  }
  bundle.fResBuf.fill(0, bundle.fResBuf === bundle.fResPath ? bundle.fResPathLen : 0);
  bundle.fVersion = null;
  bundle.fRes = r;
  bundle.fSize = res_countArrayItems(r);
  return bundle;
}
/** Original simpler overload captures container metadata before a self-fill mutation. @param data - Actual entry. @param r - Raw resource. @param key - Key. @param idx - Index. @param container - Original handle. @param fillIn - Result. @param status - Status. @returns Result. */
export function init_resb_resultFromContainer(
  data: UResourceDataEntry,
  r: Resource | null,
  key: string | null,
  idx: number,
  container: UResourceBundle,
  fillIn: UResourceBundle | null,
  status: [number] | null,
): UResourceBundle | null {
  return init_resb_result(
    data,
    r,
    key,
    idx,
    container.fValidLocaleDataEntry,
    container.fResPath,
    0,
    fillIn,
    status,
  );
}
/** Original alias parser/recursive lookup; named external-package branches are outside the immutable default-package payload domain. @param alias - Raw alias. @param key - Key. @param idx - Index. @param valid - Valid locale. @param containerPath - Borrowed container path. @param depth - Native depth. @param bundle - Result. @param status - Status. @returns Result/prior fill-in/null. */
export function getAliasTargetAsResourceBundle(
  alias: Extract<Resource, { type: 0 | 3 }>,
  key: string | null,
  idx: number,
  valid: UResourceDataEntry,
  containerPath: Uint8Array | null,
  depth: number,
  bundle: UResourceBundle | null,
  status: [number],
): UResourceBundle | null {
  if (U_FAILURE(status[0])) return bundle;
  if (alias.value.length <= 0) {
    status[0] = E.U_ILLEGAL_ARGUMENT_ERROR;
    return bundle;
  }
  if (!uprv_isInvariantUString(alias.value, alias.value.length)) {
    status[0] = E.U_INVARIANT_CONVERSION_ERROR;
    return null;
  }
  const text = resCString(alias.value);
  let path: string | null = null,
    locale: string | null = null,
    keyPath: string | null = null;
  if (text[0] === "/") {
    const sep = text.indexOf("/", 1);
    path = sep < 0 ? text.slice(1) : text.slice(1, sep);
    const rest = sep < 0 ? null : text.slice(sep + 1);
    if (path === "LOCALE") {
      keyPath = rest;
      path = locale = null;
    } else {
      if (path === "ICUDATA") path = null;
      if (rest === null) locale = "";
      else {
        const end = rest.indexOf("/");
        locale = end < 0 ? rest : rest.slice(0, end);
        keyPath = end < 0 ? null : rest.slice(end + 1);
      }
    }
  } else {
    const sep = text.indexOf("/");
    locale = sep < 0 ? text : text.slice(0, sep);
    keyPath = sep < 0 ? null : text.slice(sep + 1);
    path = valid.fPath;
  }
  let mainRes: UResourceBundle | null = null,
    data: UResourceDataEntry;
  if (locale === null) data = valid;
  else {
    const local: [number] = [0];
    mainRes = ures_openDirect(path as null, locale, local);
    if (U_FAILURE(local[0])) {
      status[0] = local[0];
      return bundle;
    }
    data = (mainRes as UResourceBundle).fData as UResourceDataEntry;
  }
  try {
    const temp: [string | null] = [null];
    let r: Resource | null;
    if (keyPath === null) {
      r = data.fData.rootRes;
      if (containerPath !== null)
        r = res_findResource(r, [resPointer(resCString(containerPath))], temp);
      if (key !== null) r = res_findResource(r, [resPointer(key)], temp);
      else if (idx !== -1)
        r = r?.type === 2 ? res_getTableItemByIndex(r, idx, [null]) : res_getArrayItem(r, idx);
      if (r !== null)
        bundle = init_resb_result(data, r, temp[0], -1, valid, null, depth + 1, bundle, status);
      else status[0] = E.U_MISSING_RESOURCE_ERROR;
    } else {
      const myPath: [ResPointer] = [resPointer(keyPath)];
      containerPath = null;
      for (;;) {
        r = data.fData.rootRes;
        while (resCString(myPath[0]) !== "" && !U_FAILURE(status[0])) {
          r = res_findResource(r, myPath, temp);
          if (r === null) break;
          bundle = init_resb_result(
            data,
            r,
            temp[0],
            -1,
            valid,
            containerPath,
            depth + 1,
            bundle,
            status,
          );
          if (U_FAILURE(status[0])) break;
          const result = bundle as UResourceBundle;
          if (temp[0] === null || resCString(keyPath) !== resCString(temp[0])) {
            ures_freeResPath(result);
            ures_appendResPath(result, keyPath, resCString(keyPath).length, status);
            if ((result.fResPath as Uint8Array)[result.fResPathLen - 1] !== 47)
              ures_appendResPath(result, "/", 1, status);
            if (U_FAILURE(status[0])) break;
          }
          r = result.fRes;
          data = result.fData as UResourceDataEntry;
          containerPath = result.fResPath;
        }
        if (U_FAILURE(status[0]) || r !== null) break;
        data = data.fParent as UResourceDataEntry;
        if (data === null) {
          status[0] = E.U_MISSING_RESOURCE_ERROR;
          break;
        }
        myPath[0] = resPointer(keyPath);
      }
    }
    return bundle;
  } finally {
    if (mainRes !== bundle) ures_close(mainRes);
  }
}
