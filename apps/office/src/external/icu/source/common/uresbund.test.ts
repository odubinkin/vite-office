/** @fileoverview Pinned direct-resource ownership, sticky statuses and distinct source string-error paths. */
import { expect, it } from "vitest";
import * as R from "./uresbund";
import { UErrorCode as E } from "./unicode/utypes";

it("reads pinned native keys, reuses handles and keeps failed fillIn untouched", /** Exercises actual mapped resource lookup rather than a synthetic resource peer. @returns Nothing. */ () => {
  const s: [number] = [0],
    root = R.ures_openDirect(null, "zoneinfo64", s),
    reusable = new R.UResourceBundle(),
    names = R.ures_getByKey(root, "Names", null, s),
    len: [number] = [77];
  expect(R.ures_getType(root)).toBe(R.UResType.URES_TABLE);
  expect(R.ures_getStringByIndex(names, 0, len, s)).toBe("ACT");
  expect(len[0]).toBe(3);
  expect(R.ures_getByKey(root, "Names", reusable, s)).toBe(reusable);
  expect(reusable.resource).toBe(names?.resource);
  expect(R.ures_getByIndex(reusable, 0, reusable, s)).toBe(reusable);
  expect(R.ures_getString(reusable, len, s)).toBe("ACT");
  const prior = reusable.resource;
  expect(R.ures_getByKey(root, "missing", reusable, s)).toBe(reusable);
  expect(s[0]).toBe(E.U_MISSING_RESOURCE_ERROR);
  expect(reusable.resource).toBe(prior);
  expect(R.ures_getByKey(root, "Names", reusable, s)).toBe(reusable);
  expect(reusable.resource).toBe(prior);
  s[0] = 0;
  expect(R.ures_getByIndex(names, R.ures_getSize(names), reusable, s)).toBe(reusable);
  expect(s[0]).toBe(E.U_MISSING_RESOURCE_ERROR);
  expect(reusable.resource).toBe(prior);
});
it("preserves the three different string mismatch contracts", /** Retains CALC-312 null-with-success rather than synthesizing an error. @returns Nothing. */ () => {
  const s: [number] = [0],
    root = R.ures_openDirect(null, "zoneinfo64", s),
    len: [number] = [77];
  expect(R.ures_getStringByIndex(root, 0, len, s)).toBeNull();
  expect(s[0]).toBe(0);
  expect(len[0]).toBe(0);
  len[0] = 77;
  expect(R.ures_getStringByKey(root, "Names", len, s)).toBeNull();
  expect(s[0]).toBe(E.U_RESOURCE_TYPE_MISMATCH);
  expect(len[0]).toBe(77);
  s[0] = 0;
  const names = R.ures_getByKey(root, "Names", null, s);
  expect(R.ures_getString(names, len, s)).toBeNull();
  expect(s[0]).toBe(E.U_RESOURCE_TYPE_MISMATCH);
  expect(len[0]).toBe(0);
  s[0] = 1;
  len[0] = 77;
  expect(R.ures_getString(names, len, s)).toBeNull();
  expect(s[0]).toBe(1);
  expect(len[0]).toBe(77);
  s[0] = 0;
  expect(R.ures_getString(null, len, s)).toBeNull();
  expect(s[0]).toBe(E.U_ILLEGAL_ARGUMENT_ERROR);
  expect(len[0]).toBe(77);
  s[0] = 0;
  const keys = R.ures_openDirect(null, "keyTypeData", s),
    iana = R.ures_getByKey(keys, "ianaMap", null, s);
  expect(R.ures_getStringByIndex(iana, 0, len, s)).toBeNull();
  expect(s[0]).toBe(E.U_RESOURCE_TYPE_MISMATCH);
  expect(len[0]).toBe(0);
  s[0] = 0;
  len[0] = 77;
  expect(R.ures_getStringByKey(iana, "timezone", len, s)).toBeNull();
  expect(s[0]).toBe(E.U_RESOURCE_TYPE_MISMATCH);
  expect(len[0]).toBe(0);
});
it("borrows shared native vector storage and treats vectors as one resource", /** Checks source pointer sharing and scalar resource size instead of vector length. @returns Nothing. */ () => {
  const s: [number] = [-128],
    root = R.ures_openDirect(null, "zoneinfo64", s),
    rules = R.ures_getByKey(root, "Rules", null, s),
    first = R.ures_getByIndex(rules, 0, null, s),
    len: [number] = [77],
    vector = R.ures_getIntVector(first, len, s);
  expect(s[0]).toBe(-128);
  expect(len[0]).toBe(11);
  expect(R.ures_getSize(first)).toBe(1);
  const byKey = R.ures_getByKey(rules, R.ures_getKey(first) as string, null, s);
  expect(R.ures_getIntVector(byKey, len, s)).toBe(vector);
  expect(R.ures_getInt(first, s)).toBe(-1);
  expect(s[0]).toBe(E.U_RESOURCE_TYPE_MISMATCH);
  s[0] = 0;
  len[0] = 77;
  expect(R.ures_getStringByIndex(first, 0, len, s)).toBeNull();
  expect(s[0]).toBe(E.U_RESOURCE_TYPE_MISMATCH);
  expect(len[0]).toBe(77);
  expect(R.ures_getType(null)).toBe(R.UResType.URES_NONE);
  expect(R.ures_getSize(null)).toBe(0);
  expect(R.ures_getKey(null)).toBeNull();
});
