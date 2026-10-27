/** @fileoverview Original raw resource path regressions witnessed against unchanged ICU78.3 C++, including pointer/byte mutations and table-only versus array-index dispatch. */
import { expect, it } from "vitest";
import { ResourceData, res_load } from "./uresdata.package";
import {
  resPointer,
  resCString,
  res_findResource,
  type ResPointer,
  res_getTableItemByIndex,
} from "./uresdata.path";
import { getTableItemByKeyPath, createPath } from "./uresbund.path";
import { ures_openDirect, ures_close, ures_getByKey, ures_getStringByKey } from "./uresbund";
/** Actual raw root, without public alias/fallback dispatch. @returns Root node. */
function root() {
  const data = new ResourceData();
  res_load(data, null, "root", [0]);
  return data.rootRes;
}
it("retains an alias's unconsumed suffix and overwrites only visited separators", /** Original intermediate alias continuation. @returns Nothing. */ () => {
  const path: [ResPointer] = [resPointer("calendar/gregorian/AmPmMarkers/0/tail")],
    key: [string | null] = ["incoming"];
  const r = res_findResource(root(), path, key);
  expect(r?.type).toBe(3);
  expect(key[0]).toBe("AmPmMarkers");
  expect(resCString(path[0])).toBe("0/tail");
  expect(
    [...path[0].bytes].filter(
      /** Counts only source-overwritten separators plus the terminator. @param c - Byte. @returns NUL. */ (
        c,
      ) => c === 0,
    ),
  ).toHaveLength(4);
});
it("keeps original long64-to-int32 array-index wrapping, saturation and end-pointer rules", /** Native strtol plus source int32 assignment, not a decimal grammar approximation. @returns Nothing. */ () => {
  const array = getTableItemByKeyPath(root(), "calendar/gregorian/AmPmMarkersAbbr");
  expect(array?.type).toBe(8);
  const first = res_findResource(array, [resPointer("0")], [null]);
  for (const q of ["-0", " 0", "+0", "4294967296", "-4294967296", "-9223372036854775809"])
    expect(res_findResource(array, [resPointer(q)], [null])).toBe(first);
  for (const q of ["1x", "0 ", "9223372036854775808", "2147483648", "-1"])
    expect(res_findResource(array, [resPointer(q)], [null])).toBeNull();
  expect(getTableItemByKeyPath(array, "0")).toBeNull();
  expect(getTableItemByKeyPath(array, "")).toBe(array);
});
it("preserves outputs on an empty path, initial scalar and leading separator", /** Original early-return pointer/key contracts. @returns Nothing. */ () => {
  const r = root(),
    key: [string | null] = ["incoming"],
    empty = resPointer("\0ignored"),
    path: [ResPointer] = [empty];
  expect(res_findResource(r, path, key)).toBe(r);
  expect(path[0]).toBe(empty);
  expect(key[0]).toBe("incoming");
  for (const resource of [r, { type: 0 as const, value: "scalar" }]) {
    const leading = resPointer("/calendar");
    path[0] = leading;
    expect(res_findResource(resource, path, key)).toBeNull();
    expect(path[0]).toBe(leading);
    expect(key[0]).toBe("incoming");
    expect(resCString(path[0])).toBe("/calendar");
  }
});
it("retains the missing table key and advanced caller path on failure", /** Native mutation before raw lookup failure. @returns Nothing. */ () => {
  const path: [ResPointer] = [resPointer("calendar/missing/after")],
    key: [string | null] = [null];
  expect(res_findResource(root(), path, key)).toBeNull();
  expect(key[0]).toBe("missing");
  expect(resCString(path[0])).toBe("after");
  expect(path[0].offset).toBe(17);
});
it("rebuilds counted inheritance paths by segments and clears output before sticky failure", /** Original counted buffers may include NUL before a slash. @returns Nothing. */ () => {
  const out: [string] = ["old"],
    status: [number] = [0];
  createPath("calendar/", 9, "calendar/gregorian/", 19, "gregorian/monthNames/wide", out, status);
  expect(out[0]).toBe("calendar/gregorian/monthNames/wide");
  createPath("", 0, "a\0/b/", 5, "k/l/m", out, status);
  expect(out[0]).toBe("a\0/b/m");
  status[0] = 1;
  createPath("a/", 2, "b/", 2, "k", out, status);
  expect(out[0]).toBe("");
  expect(status[0]).toBe(1);
});
it("shares original C-key primitives with public direct reads and retains failed index outputs", /** Existing readers consume the same canonical raw key lookup. @returns Nothing. */ () => {
  const r = root(),
    key: [string | null] = ["incoming"],
    status: [number] = [0];
  expect(res_getTableItemByIndex(r, -1, key)).toBeNull();
  expect(key[0]).toBe("incoming");
  const bundle = ures_openDirect(null, "root", status),
    a = ures_getByKey(bundle, "calendar", null, status),
    b = ures_getByKey(bundle, "calendar\0ignored", null, status);
  expect(b?.resource).toBe(a?.resource);
  expect(b?.key).toBe("calendar");
  expect(status[0]).toBe(0);
  const scalar = getTableItemByKeyPath(r, "Version");
  expect(scalar?.type).toBe(0);
  expect(ures_getStringByKey(bundle, "Version\0ignored", [0], status)).toBe(scalar?.value);
  ures_close(a);
  ures_close(b);
  ures_close(bundle);
});
