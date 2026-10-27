/** @fileoverview Original ICU78.3 uresbund.cpp default-package entry cache, alias-file loading, distinct requested-file search and existing-parent inheritance. U_USE_USRDATA is0 in the pinned source build. Raw resources/flags come from the complete native package; native mutex/OOM/raw allocation/layout and external packages remain uncertified. */
/* eslint-disable no-useless-assignment -- Preserve the original entryOpen initialization and assertion/finish bookkeeping. */
import { type ResourceData, res_load, res_unload } from "./uresdata.package";
import { UResourceDataEntry } from "./uresimp";
export { UResourceDataEntry } from "./uresimp";
import type { Resource } from "./uresbund";
import { locale_get_default } from "./locid.default";
import { u_UCharsToChars } from "./uinvchar";
import { UErrorCode as E, U_FAILURE } from "./unicode/utypes";
import { chopLocale, getParentLocaleID, mayHaveParent, UResOpenType } from "./uresbund.fallback";
let cache: Map<string, UResourceDataEntry> | null = null;
/** Source C prefix. @param text - Narrow storage. @returns Prefix. */
function cstring(text: string): string {
  const i = text.indexOf("\0");
  return i < 0 ? text : text.slice(0, i);
}
/** Source u_UCharsToChars including native terminating NUL; only logical C name is subsequently consumed. @param text - Counted UTF16 storage. @returns Narrow C prefix. */
function invariantName(text: string): string {
  const bytes = new Uint8Array(text.length + 1);
  u_UCharsToChars(text + "\0", bytes, bytes.length);
  let name = "";
  for (const b of bytes) {
    if (b === 0) break;
    name += String.fromCharCode(b);
  }
  return name;
}
/** Source raw res_getResource lookup used only for entry metadata. @param data - Owner. @param key - Literal key. @returns Raw node/null. */
function metadata(data: ResourceData, key: string): Resource | null {
  const root = data.rootRes;
  return root.type === 2 && Object.hasOwn(root.value, key) ? (root.value[key] as Resource) : null;
}
/** Original cache init-once logical owner. @param status - Sticky status. @returns Nothing. */
function initCache(status: [number]): void {
  if (!U_FAILURE(status[0]) && cache === null) cache = new Map();
}
/** Original raw entry open and %%ALIAS dereference; parent chains are deliberately not loaded here. Requires the original initialized-cache precondition. @param localeID - C filename/null default. @param path - Default package. @param status - Status. @returns Referenced final alias target/null. */
export function init_entry(
  localeID: string | null,
  path: null,
  status: [number],
): UResourceDataEntry | null {
  if (U_FAILURE(status[0])) return null;
  const name =
    localeID === null
      ? locale_get_default()
      : cstring(localeID) === ""
        ? "root"
        : cstring(localeID);
  const entries = cache as Map<string, UResourceDataEntry>;
  let r = entries.get(name);
  if (r === undefined) {
    r = new UResourceDataEntry();
    r.fName = name;
    res_load(r.fData, path, name, status);
    if (U_FAILURE(status[0])) {
      if (status[0] === E.U_MEMORY_ALLOCATION_ERROR) return null;
      status[0] = E.U_USING_FALLBACK_WARNING;
      r.fBogus = E.U_USING_FALLBACK_WARNING;
    } else {
      if (r.fData.usesPoolBundle) {
        r.fPool = getPoolEntry(path, status);
        if (U_FAILURE(status[0])) r.fBogus = status[0];
      }
      if (!U_FAILURE(status[0])) {
        const alias = metadata(r.fData, "%%ALIAS");
        if (alias?.type === 0 && alias.value.length > 0)
          r.fAlias = init_entry(invariantName(alias.value), path, status);
      }
    }
    const old = entries.get(name);
    if (old === undefined) entries.set(name, r);
    else {
      free_entry(r);
      r = old;
    }
  }
  while (r.fAlias !== null) r = r.fAlias;
  ++r.fCountExisting;
  if (r.fBogus !== 0 && !U_FAILURE(status[0])) status[0] = r.fBogus;
  return r;
}
/** Original pool entry validation; pool checksum/address binding was validated during native raw export. @param path - Default package. @param status - Status. @returns Referenced pool/null. */
function getPoolEntry(path: null, status: [number]): UResourceDataEntry | null {
  const pool = init_entry("pool", path, status);
  if (!U_FAILURE(status[0]) && (pool === null || pool.fBogus !== 0 || !pool.fData.isPoolBundle))
    status[0] = E.U_INVALID_FORMAT_ERROR;
  return pool;
}
/** Original missing-file search. Successful files return their chopped inheritance name; missing files use getParentLocaleID and ignore cached parent lines. @param path - Default package. @param name - Mutable C filename. @param defaultLocale - Default name. @param openType - Source mode. @param isRoot - Output. @param foundParent - Output. @param isDefault - Output prefix test. @param status - Status. @returns Referenced real entry/null. */
export function findFirstExisting(
  path: null,
  name: [string],
  defaultLocale: string,
  openType: UResOpenType,
  isRoot: [boolean],
  foundParent: [boolean],
  isDefault: [boolean],
  status: [number],
): UResourceDataEntry | null {
  let r: UResourceDataEntry | null = null,
    hasRealData = false;
  foundParent[0] = true;
  name[0] = cstring(name[0]);
  defaultLocale = cstring(defaultLocale);
  const origName = name[0];
  while (foundParent[0] && !hasRealData) {
    r = init_entry(name[0], path, status);
    if (U_FAILURE(status[0])) return null;
    isDefault[0] = defaultLocale.startsWith(name[0]);
    hasRealData = (r as UResourceDataEntry).fBogus === 0;
    if (!hasRealData) {
      --(r as UResourceDataEntry).fCountExisting;
      r = null;
      status[0] = E.U_USING_FALLBACK_WARNING;
    } else name[0] = (r as UResourceDataEntry).fName;
    isRoot[0] = name[0] === "root";
    foundParent[0] = !hasRealData ? getParentLocaleID(name, origName, openType) : chopLocale(name);
    if (foundParent[0] && name[0] === "") name[0] = "und";
  }
  return r;
}
/** Original existing-entry parent inheritance: explicit %%Parent, %%ParentIsRoot, noFallback, then simple chopLocale. @param current - Mutable last entry reference. @param name - Mutable parent filename. @param nameCapacity - Native filename capacity. @param status - Status. @returns Success. */
export function loadParentsExceptRoot(
  current: [UResourceDataEntry],
  name: [string],
  nameCapacity: number,
  status: [number],
): boolean {
  if (U_FAILURE(status[0])) return false;
  let checkParent = true;
  while (
    checkParent &&
    current[0].fParent === null &&
    !current[0].fData.noFallback &&
    metadata(current[0].fData, "%%ParentIsRoot") === null
  ) {
    const parent = metadata(current[0].fData, "%%Parent");
    if (parent?.type === 0 && parent.value.length > 0 && parent.value.length < nameCapacity) {
      name[0] = invariantName(parent.value);
      if (name[0] === "root") return true;
    }
    const parentStatus: [number] = [0],
      next = init_entry(name[0], current[0].fPath, parentStatus);
    if (U_FAILURE(parentStatus[0])) {
      status[0] = parentStatus[0];
      return false;
    }
    current[0].fParent = next;
    current[0] = next as UResourceDataEntry;
    checkParent = chopLocale(name) || mayHaveParent(name[0]);
  }
  return true;
}
/** Original root append. @param current - Last entry. @param status - Status. @returns Success. */
function insertRootBundle(current: [UResourceDataEntry], status: [number]): boolean {
  if (U_FAILURE(status[0])) return false;
  const local: [number] = [0],
    next = init_entry("root", current[0].fPath, local);
  if (U_FAILURE(local[0])) {
    status[0] = local[0];
    return false;
  }
  current[0].fParent = next;
  current[0] = next as UResourceDataEntry;
  return true;
}
/** Original fallback entry open. Caller supplies the original already-canonicalized locale from ures_openWithType. Native temporary filename truncates to156 bytes. @param path - Default package. @param localeID - C base name. @param openType - Non-direct source mode. @param status - Status. @returns Entry/null. */
export function entryOpen(
  path: null,
  localeID: string,
  openType: UResOpenType.URES_OPEN_LOCALE_DEFAULT_ROOT | UResOpenType.URES_OPEN_LOCALE_ROOT,
  status: [number],
): UResourceDataEntry | null {
  const intStatus: [number] = [0];
  let r: UResourceDataEntry | null = null;
  let t1: UResourceDataEntry | null = null;
  const isDefault: [boolean] = [false],
    isRoot: [boolean] = [false],
    hasChopped: [boolean] = [true];
  let hasRealData = false;
  initCache(status);
  if (U_FAILURE(status[0])) return null;
  const name: [string] = [cstring(localeID).slice(0, 156)],
    defaultLocale = locale_get_default();
  r = findFirstExisting(
    path,
    name,
    defaultLocale,
    openType,
    isRoot,
    hasChopped,
    isDefault,
    intStatus,
  );
  if (intStatus[0] === E.U_MEMORY_ALLOCATION_ERROR) {
    status[0] = intStatus[0];
    return null;
  }
  if (r !== null) {
    t1 = r;
    hasRealData = true;
    if ((hasChopped[0] || mayHaveParent(name[0])) && !isRoot[0]) {
      const current: [UResourceDataEntry] = [t1];
      if (!loadParentsExceptRoot(current, name, 157, status)) return null;
      t1 = current[0];
    }
  }
  if (
    r === null &&
    openType === UResOpenType.URES_OPEN_LOCALE_DEFAULT_ROOT &&
    !isDefault[0] &&
    !isRoot[0]
  ) {
    name[0] = defaultLocale;
    r = findFirstExisting(
      path,
      name,
      defaultLocale,
      openType,
      isRoot,
      hasChopped,
      isDefault,
      intStatus,
    );
    if (intStatus[0] === E.U_MEMORY_ALLOCATION_ERROR) {
      status[0] = intStatus[0];
      return null;
    }
    intStatus[0] = E.U_USING_DEFAULT_WARNING;
    if (r !== null) {
      t1 = r;
      hasRealData = true;
      isDefault[0] = true;
      if ((hasChopped[0] || mayHaveParent(name[0])) && !isRoot[0]) {
        const current: [UResourceDataEntry] = [t1];
        if (!loadParentsExceptRoot(current, name, 157, status)) return null;
        t1 = current[0];
      }
    }
  }
  if (r === null) {
    name[0] = "root";
    r = findFirstExisting(
      path,
      name,
      defaultLocale,
      openType,
      isRoot,
      hasChopped,
      isDefault,
      intStatus,
    );
    if (intStatus[0] === E.U_MEMORY_ALLOCATION_ERROR) {
      status[0] = intStatus[0];
      return null;
    }
    if (r !== null) {
      t1 = r;
      intStatus[0] = E.U_USING_DEFAULT_WARNING;
      hasRealData = true;
    } else {
      status[0] = E.U_MISSING_RESOURCE_ERROR;
      return null;
    }
  } else if (
    !isRoot[0] &&
    (t1 as UResourceDataEntry).fName !== "root" &&
    (t1 as UResourceDataEntry).fParent === null &&
    !r.fData.noFallback
  ) {
    const current: [UResourceDataEntry] = [t1 as UResourceDataEntry];
    if (!insertRootBundle(current, status)) return null;
    t1 = current[0];
    if (!hasRealData) r.fBogus = E.U_USING_DEFAULT_WARNING;
  }
  while (r !== null && !isRoot[0] && (t1 as UResourceDataEntry).fParent !== null) {
    ++((t1 as UResourceDataEntry).fParent as UResourceDataEntry).fCountExisting;
    t1 = (t1 as UResourceDataEntry).fParent;
  }
  if (!U_FAILURE(status[0])) {
    if (intStatus[0] !== 0) status[0] = intStatus[0];
    return r;
  }
  return null;
}
/** Original exact-name open, which still attaches an inheritance chain unless noFallback is set. @param path - Default package. @param localeID - Exact C filename/null. @param status - Status. @returns Entry/null. */
export function entryOpenDirect(
  path: null,
  localeID: string | null,
  status: [number],
): UResourceDataEntry | null {
  initCache(status);
  if (U_FAILURE(status[0])) return null;
  localeID = localeID === null ? locale_get_default() : cstring(localeID);
  if (localeID === "") localeID = "root";
  let r = init_entry(localeID, path, status);
  if (!U_FAILURE(status[0])) {
    if ((r as UResourceDataEntry).fBogus !== 0) {
      --(r as UResourceDataEntry).fCountExisting;
      r = null;
    }
  } else r = null;
  const current: [UResourceDataEntry] = [r as UResourceDataEntry];
  if (
    r !== null &&
    localeID !== "root" &&
    r.fParent === null &&
    !r.fData.noFallback &&
    localeID.length < 157
  ) {
    const name: [string] = [localeID];
    if (
      !chopLocale(name) ||
      name[0] === "root" ||
      loadParentsExceptRoot(current, name, 157, status)
    ) {
      if (current[0].fName !== "root" && current[0].fParent === null)
        insertRootBundle(current, status);
    }
    if (U_FAILURE(status[0])) r = null;
  }
  if (r !== null) {
    while (current[0].fParent !== null) {
      ++current[0].fParent.fCountExisting;
      current[0] = current[0].fParent;
    }
  }
  return r;
}
/** Original count increase across an already-established parent line. @param entry - Entry. @returns Nothing. */
export function entryIncrease(entry: UResourceDataEntry): void {
  ++entry.fCountExisting;
  while (entry.fParent !== null) {
    entry = entry.fParent;
    ++entry.fCountExisting;
  }
}
/** Original reference release leaves cached entries/parents present. @param entry - Entry/null. @returns Nothing. */
export function entryClose(entry: UResourceDataEntry | null): void {
  while (entry !== null) {
    --entry.fCountExisting;
    entry = entry.fParent;
  }
}
/** Original entry disposal releases its pool and final alias target references, not its parent line. @param entry - Unreferenced owner. @returns Nothing. */
function free_entry(entry: UResourceDataEntry): void {
  res_unload(entry.fData);
  if (entry.fPool !== null) --entry.fPool.fCountExisting;
  let alias = entry.fAlias;
  if (alias !== null) {
    while (alias.fAlias !== null) alias = alias.fAlias;
    --alias.fCountExisting;
  }
}
/** Original repeat-until-stable deletion of zero-reference entries, including pool/alias dependents. @returns Deleted count. */
export function ures_flushCache(): number {
  let count = 0,
    deleted: boolean;
  if (cache === null) return 0;
  do {
    deleted = false;
    for (const [key, entry] of cache) {
      if (entry.fCountExisting === 0) {
        ++count;
        deleted = true;
        cache.delete(key);
        free_entry(entry);
      }
    }
  } while (deleted);
  return count;
}
