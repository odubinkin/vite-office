/** @fileoverview Original ICU78.3 bundle path allocation, stack initialization, copy/close and default-package open ownership from uresbund.cpp. Byte arrays preserve logical inline/heap path identity and counted metadata; physical free/OOM/ABI remain uncertified. */
import { UResourceBundle, ures_initStackObject } from "./uresimp";
import { entryClose, entryIncrease, entryOpen, entryOpenDirect } from "./uresbund.entries";
import { resCString, res_countArrayItems } from "./uresdata.path";
import { ulocimp_getBaseName } from "./uloc.normalize";
import { locale_get_default } from "./locid.default";
import { UResOpenType } from "./uresbund.fallback";
import { UErrorCode as E, U_FAILURE } from "./unicode/utypes";
/** Original strcpy over source-valid narrow storage. @param dest - Destination. @param offset - Offset. @param text - C input. @returns Nothing. */
function strcpy(dest: Uint8Array, offset: number, text: string): void {
  text = resCString(text);
  for (let i = 0; i < text.length; ++i) dest[offset + i] = text.charCodeAt(i);
  dest[offset + text.length] = 0;
}
/** Original append records lenToAdd but copies the complete C string and does not guard incoming status. @param bundle - Owner. @param toAdd - Borrowed storage. @param lenToAdd - Counted increment. @param status - Status. @returns Nothing. */
export function ures_appendResPath(
  bundle: UResourceBundle,
  toAdd: string | Uint8Array,
  lenToAdd: number,
  status: [number],
): void {
  void status;
  const originalLength = bundle.fResPathLen;
  if (bundle.fResPath === null) {
    bundle.fResPath = bundle.fResBuf;
    bundle.fResPath[0] = 0;
    bundle.fResPathLen = 0;
  }
  bundle.fResPathLen += lenToAdd;
  if (64 <= bundle.fResPathLen + 1) {
    const previous = bundle.fResPath;
    bundle.fResPath = new Uint8Array(bundle.fResPathLen + 1);
    if (previous === bundle.fResBuf) strcpy(bundle.fResPath, 0, resCString(previous));
    else bundle.fResPath.set(previous.subarray(0, bundle.fResPath.length));
  }
  strcpy(bundle.fResPath, originalLength, resCString(toAdd));
}
/** Original releases path storage but leaves inline bytes intact. @param bundle - Owner. @returns Nothing. */
export function ures_freeResPath(bundle: UResourceBundle): void {
  bundle.fResPath = null;
  bundle.fResPathLen = 0;
}
/** Original close does not clear entry/version metadata. Freed-object accesses remain outside the valid lifetime. @param bundle - Owner/null. @param freeBundleObj - Physical-free flag. @returns Nothing. */
export function ures_closeBundle(bundle: UResourceBundle | null, freeBundleObj: boolean): void {
  void freeBundleObj;
  if (bundle !== null) {
    if (bundle.fData !== null) entryClose(bundle.fData);
    ures_freeResPath(bundle);
  }
}
/** Original public close. @param bundle - Owner/null. @returns Nothing. */
export function ures_close(bundle: UResourceBundle | null): void {
  ures_closeBundle(bundle, true);
}
/** Original shallow metadata copy, independent path storage and additional entry reference. @param target - Fill-in/null. @param original - Source/null. @param status - Sticky status. @returns Destination/prior fill-in. */
export function ures_copyResb(
  target: UResourceBundle | null,
  original: UResourceBundle | null,
  status: [number],
): UResourceBundle | null {
  if (U_FAILURE(status[0]) || target === original) return target;
  if (original !== null) {
    const stack = target === null ? false : target.isStackObject;
    if (target === null) target = new UResourceBundle();
    else ures_closeBundle(target, false);
    target.fData = original.fData;
    target.fValidLocaleDataEntry = original.fValidLocaleDataEntry;
    target.fHasFallback = original.fHasFallback;
    target.fIsTopLevel = original.fIsTopLevel;
    target.fIndex = original.fIndex;
    target.fSize = original.fSize;
    target.fKey = original.fKey;
    target.fRes = original.fRes;
    target.fVersion = original.fVersion;
    target.fResBuf.set(original.fResBuf);
    target.fResPath = null;
    target.fResPathLen = 0;
    if (original.fResPath !== null)
      ures_appendResPath(target, original.fResPath, original.fResPathLen, status);
    target.isStackObject = stack;
    if (target.fData !== null) entryIncrease(target.fData);
  }
  return target;
}
/** Original source open mode and canonicalization before entry dispatch. @param bundle - Fill-in/null. @param path - Default package. @param localeID - C name/null default. @param openType - Native mode. @param status - Status. @returns Owner/null. */
export function ures_openWithType(
  bundle: UResourceBundle | null,
  path: null,
  localeID: string | null,
  openType: UResOpenType,
  status: [number],
): UResourceBundle | null {
  if (U_FAILURE(status[0])) return null;
  let entry;
  if (openType !== UResOpenType.URES_OPEN_DIRECT) {
    if (localeID === null) localeID = locale_get_default();
    let canonical = "";
    ulocimp_getBaseName(
      resCString(localeID),
      {
        /** Actual CharString sink accumulation. @param bytes - Narrow span. @returns Nothing. */
        Append(bytes: string): void {
          canonical += bytes;
        },
      },
      status,
    );
    if (U_FAILURE(status[0])) {
      status[0] = E.U_ILLEGAL_ARGUMENT_ERROR;
      return null;
    }
    entry = entryOpen(path, canonical, openType, status);
  } else entry = entryOpenDirect(path, localeID, status);
  if (U_FAILURE(status[0])) return null;
  if (entry === null) {
    status[0] = E.U_MISSING_RESOURCE_ERROR;
    return null;
  }
  const stack = bundle === null ? false : bundle.isStackObject;
  if (bundle === null) bundle = new UResourceBundle();
  else ures_closeBundle(bundle, false);
  ures_initStackObject(bundle);
  bundle.isStackObject = stack;
  bundle.fValidLocaleDataEntry = bundle.fData = entry;
  bundle.fHasFallback = openType !== UResOpenType.URES_OPEN_DIRECT && !entry.fData.noFallback;
  bundle.fIsTopLevel = true;
  bundle.fRes = entry.fData.rootRes;
  bundle.fSize = res_countArrayItems(bundle.fRes);
  bundle.fIndex = -1;
  return bundle;
}
/** Original default/parent/root open. @param path - Default package. @param localeID - Locale/default. @param status - Status. @returns Owner/null. */
export function ures_open(
  path: null,
  localeID: string | null,
  status: [number],
): UResourceBundle | null {
  return ures_openWithType(
    null,
    path,
    localeID,
    UResOpenType.URES_OPEN_LOCALE_DEFAULT_ROOT,
    status,
  );
}
/** Original parent/root open without the default-locale step. @param path - Default package. @param localeID - Locale/default. @param status - Status. @returns Owner/null. */
export function ures_openNoDefault(
  path: null,
  localeID: string | null,
  status: [number],
): UResourceBundle | null {
  return ures_openWithType(null, path, localeID, UResOpenType.URES_OPEN_LOCALE_ROOT, status);
}
/** Original unnormalized direct open still builds the source alias/parent entry state. @param path - Default package. @param localeID - Filename/default. @param status - Status. @returns Owner/null. */
export function ures_openDirect(
  path: null,
  localeID: string | null,
  status: [number],
): UResourceBundle | null {
  return ures_openWithType(null, path, localeID, UResOpenType.URES_OPEN_DIRECT, status);
}
/** Original reusable open ignores the return value and preserves fill-in on entry-open failure. @param bundle - Fill-in. @param path - Default package. @param localeID - Locale/default. @param status - Status. @returns Nothing. */
export function ures_openFillIn(
  bundle: UResourceBundle | null,
  path: null,
  localeID: string | null,
  status: [number],
): void {
  if (!U_FAILURE(status[0]) && bundle === null) {
    status[0] = E.U_ILLEGAL_ARGUMENT_ERROR;
    return;
  }
  ures_openWithType(bundle, path, localeID, UResOpenType.URES_OPEN_LOCALE_DEFAULT_ROOT, status);
}
