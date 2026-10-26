/** @fileoverview Original ICU78.3 uresbund.cpp table-only key-path lookup and horizontal-inheritance createPath. Counted CharString storage is projected by a narrow string plus explicit lengths; native allocation/OOM remains uncertified. */
import type { Resource } from "./uresbund";
import { resCString, res_getTableItemByKey } from "./uresdata.path";
import { U_FAILURE } from "./unicode/utypes";
/** Original table-only path lookup; unlike res_findResource it never parses array indexes and rejects unconsumed suffixes. @param table - Raw starting resource. @param key - C path. @returns Raw resource/bogus. */
export function getTableItemByKeyPath(table: Resource | null, key: string): Resource | null {
  let resource = table;
  const path = resCString(key);
  let pathPart = 0;
  while (
    pathPart < path.length &&
    resource !== null &&
    (resource.type === 2 || resource.type === 8)
  ) {
    const separator = path.indexOf("/", pathPart),
      end = separator < 0 ? path.length : separator,
      part: [string | null] = [path.slice(pathPart, end)];
    resource = res_getTableItemByKey(resource, part);
    pathPart = separator < 0 ? path.length : separator + 1;
  }
  return pathPart < path.length ? null : resource;
}
/** Original counted path reconstruction after horizontal inheritance, including clear-before-sticky-error behavior and segment traversal through embedded NUL. @param origResPath - Original counted storage. @param origResPathLen - Original length. @param resPath - Current counted storage. @param resPathLen - Current length. @param inKey - C suffix. @param path - CharString output. @param status - Sticky status. @returns Nothing. */
export function createPath(
  origResPath: string | null,
  origResPathLen: number,
  resPath: string | null,
  resPathLen: number,
  inKey: string,
  path: [string],
  status: [number],
): void {
  path[0] = "";
  let key = resCString(inKey);
  if (resPathLen > 0) {
    if (!U_FAILURE(status[0])) path[0] += (resPath as string).slice(0, resPathLen);
    if (!U_FAILURE(status[0])) {
      let resPathPtr = 0,
        origResPathPtr = 0;
      while (origResPathPtr < origResPathLen && resPathPtr < resPathLen) {
        while (origResPathPtr < origResPathLen && (origResPath as string)[origResPathPtr] !== "/")
          ++origResPathPtr;
        if (origResPathPtr < origResPathLen && (origResPath as string)[origResPathPtr] === "/")
          ++origResPathPtr;
        while (resPathPtr < resPathLen && (resPath as string)[resPathPtr] !== "/") ++resPathPtr;
        if (resPathPtr < resPathLen && (resPath as string)[resPathPtr] === "/") ++resPathPtr;
      }
      let keyPtr = 0;
      while (resPathPtr < resPathLen && keyPtr < key.length) {
        while (resPathPtr < resPathLen && (resPath as string)[resPathPtr] !== "/") ++resPathPtr;
        if (resPathPtr < resPathLen && (resPath as string)[resPathPtr] === "/") ++resPathPtr;
        while (keyPtr < key.length && key[keyPtr] !== "/") ++keyPtr;
        if (key[keyPtr] === "/") ++keyPtr;
      }
      key = key.slice(keyPtr);
    }
    if (!U_FAILURE(status[0])) path[0] += key;
  } else if (!U_FAILURE(status[0])) path[0] += key;
}
