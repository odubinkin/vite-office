/** @fileoverview Original ICU78.3 root-key fallback and nested/horizontal-inheritance resource lookup. Uses the actual bundle/entry/result owners and original distinct path helpers; no locale or path heuristic replaces upstream traversal. */
import type { Resource } from "./uresbund";
import { UResourceBundle } from "./uresimp";
import type { UResourceDataEntry } from "./uresbund.entries";
import { init_resb_resultFromContainer } from "./uresbund.alias";
import { ures_close, ures_freeResPath, ures_appendResPath } from "./uresbund.lifecycle";
import { getTableItemByKeyPath, createPath } from "./uresbund.path";
import {
  resCString,
  resPointer,
  res_findResource,
  res_getTableItemByKey,
  type ResPointer,
} from "./uresdata.path";
import { locale_get_default } from "./locid.default";
import { UErrorCode as E, U_FAILURE } from "./unicode/utypes";
/** Original counted path span, distinct from strlen-based source operations. @param path - Storage/null. @param length - Readable count. @returns Counted text/null. */
function countedPath(path: Uint8Array | null, length: number): string | null {
  if (path === null) return null;
  let text = "";
  for (let i = 0; i < length; ++i) text += String.fromCharCode(path[i] as number);
  return text;
}
/** Original top-level key fallback searches roots, with warnings only after visiting multiple real entries. @param bundle - Actual bundle. @param key - In/out key. @param resource - Raw output. @param status - Status. @returns Actual entry/null. */
export function getFallbackData(
  bundle: UResourceBundle,
  key: [string | null],
  resource: [Resource | null],
  status: [number],
): UResourceDataEntry | null {
  let data = bundle.fData,
    i = 0;
  resource[0] = null;
  if (data === null) {
    status[0] = E.U_MISSING_RESOURCE_ERROR;
    return null;
  }
  if (data.fBogus === 0) {
    resource[0] = res_getTableItemByKey(data.fData.rootRes, key);
    ++i;
  }
  if (bundle.fHasFallback) {
    while (resource[0] === null && data.fParent !== null) {
      data = data.fParent;
      if (data.fBogus === 0) {
        ++i;
        resource[0] = res_getTableItemByKey(data.fData.rootRes, key);
      }
    }
  }
  if (resource[0] === null) {
    status[0] = E.U_MISSING_RESOURCE_ERROR;
    return null;
  }
  if (i > 1)
    status[0] =
      data.fName === locale_get_default() || data.fName === "root"
        ? E.U_USING_DEFAULT_WARNING
        : E.U_USING_FALLBACK_WARNING;
  return data;
}
/** Original nested fallback including extra root alias traversal and horizontal inheritance path reconstruction. @param bundle - Source/null. @param inKey - C path. @param fillIn - Result/null. @param status - Nullable status. @returns Result/prior fill-in. */
export function ures_getByKeyWithFallback(
  bundle: UResourceBundle | null,
  inKey: string,
  fillIn: UResourceBundle | null,
  status: [number] | null,
): UResourceBundle | null {
  if (status === null || U_FAILURE(status[0])) return fillIn;
  if (bundle === null) {
    status[0] = E.U_ILLEGAL_ARGUMENT_ERROR;
    return fillIn;
  }
  let helper: UResourceBundle | null = null;
  if (bundle.fRes?.type === 2) {
    const origPath = bundle.fResPath,
      origLen = bundle.fResPathLen;
    let resource = getTableItemByKeyPath(bundle.fRes, inKey);
    const key: [string | null] = [inKey];
    let didRootOnce = false;
    if (resource === null) {
      let data = bundle.fData as UResourceDataEntry,
        resPath = bundle.fResPath,
        len = bundle.fResPathLen;
      const path: [string] = [""];
      while (resource === null && (data.fParent !== null || !didRootOnce)) {
        if (data.fParent !== null) data = data.fParent;
        else didRootOnce = true;
        let rootRes: Resource | null = data.fData.rootRes;
        if (data.fBogus === 0) {
          createPath(
            countedPath(origPath, origLen),
            origLen,
            countedPath(resPath, len),
            len,
            inKey,
            path,
            status,
          );
          if (U_FAILURE(status[0])) {
            ures_close(helper);
            return fillIn;
          }
          const myPath: [ResPointer] = [resPointer(path[0])];
          key[0] = inKey;
          do {
            resource = res_findResource(rootRes, myPath, key);
            if (resource?.type === 3 && resCString(myPath[0]) !== "") {
              helper = init_resb_resultFromContainer(
                data,
                resource,
                null,
                -1,
                bundle,
                helper,
                status,
              );
              if (helper !== null) {
                data = helper.fData as UResourceDataEntry;
                rootRes = helper.fRes;
                resPath = helper.fResPath;
                len = helper.fResPathLen;
              } else break;
            } else if (resource === null) break;
          } while (resCString(myPath[0]) !== "");
        }
      }
      if (resource !== null) {
        status[0] =
          data.fName === locale_get_default() || data.fName === "root"
            ? E.U_USING_DEFAULT_WARNING
            : E.U_USING_FALLBACK_WARNING;
        fillIn = init_resb_resultFromContainer(data, resource, key[0], -1, bundle, fillIn, status);
        const result = fillIn as UResourceBundle;
        if (resPath !== null)
          createPath(
            countedPath(origPath, origLen),
            origLen,
            countedPath(resPath, len),
            len,
            inKey,
            path,
            status,
          );
        else {
          const current = result.fResPath === null ? null : resCString(result.fResPath),
            sep = current === null ? -1 : current.indexOf("/");
          if (current !== null && sep >= 0 && sep + 1 < current.length)
            createPath(
              countedPath(origPath, origLen),
              origLen,
              current,
              current.length,
              inKey,
              path,
              status,
            );
          else createPath(countedPath(origPath, origLen), origLen, "", 0, inKey, path, status);
        }
        ures_freeResPath(result);
        ures_appendResPath(result, path[0], path[0].length, status);
        if ((result.fResPath as Uint8Array)[result.fResPathLen - 1] !== 47)
          ures_appendResPath(result, "/", 1, status);
      } else status[0] = E.U_MISSING_RESOURCE_ERROR;
    } else
      fillIn = init_resb_resultFromContainer(
        bundle.fData as UResourceDataEntry,
        resource,
        key[0],
        -1,
        bundle,
        fillIn,
        status,
      );
  } else status[0] = E.U_RESOURCE_TYPE_MISMATCH;
  ures_close(helper);
  return fillIn;
}
