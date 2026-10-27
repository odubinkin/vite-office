/** @fileoverview Native-witnessed public resource alias, locale identity, path-buffer and close/copy regressions over the actual pinned raw package. */
import { afterEach, expect, it } from "vitest";
import * as R from "./uresbund";
import { ures_flushCache, type UResourceDataEntry } from "./uresbund.entries";
import { init_resb_result } from "./uresbund.alias";
import { ures_appendResPath } from "./uresbund.lifecycle";
import { resCString } from "./uresdata.path";
import { getTableItemByKeyPath } from "./uresbund.path";
import { ResourceDataValue } from "./uresdata";
import { UErrorCode as E } from "./unicode/utypes";
const owners: R.UResourceBundle[] = [];
/** Retains each actual test-owned handle once for balanced source close boundaries. @param value - Result. @returns Nonnull owner. */
function own(value: R.UResourceBundle | null): R.UResourceBundle {
  expect(value).not.toBeNull();
  const bundle = value as R.UResourceBundle;
  if (!owners.includes(bundle)) owners.push(bundle);
  return bundle;
}
afterEach(
  /** Releases actual acquired references before cache flush. @returns Nothing. */ () => {
    while (owners.length !== 0) R.ures_close(owners.pop() as R.UResourceBundle);
    ures_flushCache();
  },
);
it("resolves the actual cross-bundle timezone alias and keeps valid versus actual locale identities", /** Raw keyTypeData aliases stay unresolved until public result initialization. @returns Nothing. */ () => {
  const status: [number] = [0],
    root = own(R.ures_openDirect(null, "keyTypeData", status)),
    table = own(R.ures_getByKey(root, "typeMap", null, status)),
    zone = own(R.ures_getByKey(table, "timezone", null, status));
  expect(R.ures_getLocaleByType(zone, 0, status)).toBe("timezoneTypes");
  expect(R.ures_getLocaleByType(zone, 1, status)).toBe("keyTypeData");
  expect(resCString(zone.fResPath)).toBe("typeMap/timezone/");
  expect(zone.fHasFallback).toBe(false);
  expect(zone.fIsTopLevel).toBe(false);
  expect(R.ures_getType(zone)).toBe(2);
  expect(status[0]).toBe(0);
});
it("follows LOCALE aliases through the valid locale instead of exposing raw alias text", /** Original root AmPmMarkers aliases AmPmMarkersAbbr. @returns Nothing. */ () => {
  const status: [number] = [0],
    root = own(R.ures_openDirect(null, "root", status)),
    result = own(R.ures_getByKeyWithFallback(root, "calendar/gregorian/AmPmMarkers", null, status));
  expect(result.fRes).toBe(getTableItemByKeyPath(root.fRes, "calendar/gregorian/AmPmMarkersAbbr"));
  expect(resCString(result.fResPath)).toBe("calendar/gregorian/AmPmMarkersAbbr/");
  expect(R.ures_getKey(result)).toBe("AmPmMarkersAbbr");
  expect(status[0]).toBe(0);
});
it("reuses the actual inline path pointer while initializing a child into its container", /** Pointer equality is preserved through same-handle lookups. @returns Nothing. */ () => {
  const status: [number] = [0],
    root = own(R.ures_openDirect(null, "root", status)),
    fill = own(new R.UResourceBundle());
  R.ures_getByKey(root, "calendar", fill, status);
  const pointer = fill.fResPath,
    count = fill.fData?.fCountExisting;
  expect(R.ures_getByKey(fill, "gregorian", fill, status)).toBe(fill);
  expect(fill.fResPath).toBe(pointer);
  expect(pointer).toBe(fill.fResBuf);
  expect(resCString(fill.fResPath)).toBe("calendar/gregorian/");
  expect(fill.fResPathLen).toBe(19);
  expect(fill.fData?.fCountExisting).toBe(count);
  expect(status[0]).toBe(0);
});
it("uses the original 63-byte heap threshold and independent path ownership during copy", /** Native append/copy storage and retained entry counts. @returns Nothing. */ () => {
  const status: [number] = [0],
    root = own(R.ures_openDirect(null, "root", status)),
    fill = own(R.ures_copyResb(null, root, status));
  ures_appendResPath(fill, "x".repeat(62), 62, status);
  expect(fill.fResPath).toBe(fill.fResBuf);
  ures_appendResPath(fill, "y", 1, status);
  expect(fill.fResPath).not.toBe(fill.fResBuf);
  expect(fill.fResPath?.length).toBe(64);
  const count = fill.fData?.fCountExisting,
    copy = own(R.ures_copyResb(null, fill, status));
  expect(copy.fResPath).not.toBe(fill.fResPath);
  expect(copy.fResPath).not.toBe(copy.fResBuf);
  expect(resCString(copy.fResPath)).toBe("x".repeat(62) + "y");
  expect(copy.fResPathLen).toBe(63);
  expect(copy.fData).toBe(fill.fData);
  expect(copy.fData?.fCountExisting).toBe((count as number) + 1);
});
it("preserves the source alias-depth failure and old fill-in without replacing its entry", /** Original depth guard precedes alias dispatch. @returns Nothing. */ () => {
  const status: [number] = [0],
    root = own(R.ures_openDirect(null, "root", status)),
    fill = own(R.ures_copyResb(null, root, status)),
    raw = getTableItemByKeyPath(root.fRes, "calendar/gregorian/AmPmMarkers"),
    count = root.fData?.fCountExisting;
  expect(
    init_resb_result(
      root.fData as UResourceDataEntry,
      raw,
      "AmPmMarkers",
      -1,
      root.fValidLocaleDataEntry,
      null,
      256,
      fill,
      status,
    ),
  ).toBe(fill);
  expect(status[0]).toBe(E.U_TOO_MANY_ALIASES_ERROR);
  expect(fill.fRes).toBe(root.fRes);
  expect(root.fData?.fCountExisting).toBe(count);
});
it("retains entry metadata on stack close while releasing exactly one entry reference", /** Source close does not memset fields or become idempotent. @returns Nothing. */ () => {
  const status: [number] = [0],
    root = own(R.ures_openDirect(null, "root", status)),
    stack = new R.UResourceBundle();
  R.ures_getByKey(root, "calendar", stack, status);
  const entry = stack.fData,
    count = entry?.fCountExisting,
    resource = stack.fRes;
  R.ures_close(stack);
  expect(stack.fData).toBe(entry);
  expect(stack.fRes).toBe(resource);
  expect(stack.fResPath).toBeNull();
  expect(stack.fResPathLen).toBe(0);
  expect(entry?.fCountExisting).toBe((count as number) - 1);
});
it("initializes stack size/cursor as zero and retains an existing fill-in when open receives a failure", /** Actual zero-token stack state differs from an allocated open result. @returns Nothing. */ () => {
  const stack = own(new R.UResourceBundle()),
    status: [number] = [0];
  expect([R.ures_getType(stack), R.ures_getSize(stack), stack.fIndex]).toEqual([0, 0, 0]);
  R.ures_openFillIn(stack, null, "root", status);
  const data = stack.fData;
  status[0] = 1;
  R.ures_openFillIn(stack, null, "en", status);
  expect(stack.fData).toBe(data);
  expect(stack.isStackObject).toBe(true);
  expect(status[0]).toBe(1);
});

it("sets borrowed value context through the original caller-owned temporary and preserves it on failure", /** Empty path updates the value without overwriting the temporary bundle. @returns Nothing. */ () => {
  const status: [number] = [0],
    root = own(R.ures_openDirect(null, "keyTypeData", status)),
    temp = own(new R.UResourceBundle()),
    value = new ResourceDataValue();
  R.ures_getValueWithFallback(root, "typeMap/timezone", temp, value, status);
  expect(value.getData()).toBe(temp.fData?.fData);
  expect(value.getValidLocaleDataEntry()).toBe(root.fData);
  expect(value.getType()).toBe(2);
  const raw = value.getResource(),
    data = value.getData();
  status[0] = 1;
  R.ures_getValueWithFallback(root, "missing", temp, value, status);
  expect(value.getResource()).toBe(raw);
  expect(value.getData()).toBe(data);
  status[0] = 0;
  R.ures_getValueWithFallback(root, "", temp, value, status);
  expect(value.getResource()).toBe(root.fRes);
  expect(value.getData()).toBe(root.fData?.fData);
  expect(temp.fRes).toBe(raw);
  R.ures_getValueWithFallback(root, null, temp, value, status);
  expect(status[0]).toBe(E.U_ILLEGAL_ARGUMENT_ERROR);
  expect(value.getResource()).toBe(root.fRes);
});
