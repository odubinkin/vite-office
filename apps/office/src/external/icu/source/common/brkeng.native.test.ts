/** @fileoverview Replays actual ICU break factory choices through the linked brkitr package. */
import { expect, it } from "vitest";
import { observeMatcher } from "../../../../../../../scripts/icu-dictionary-observe";
import { loadDictionaryMatcherFor } from "./brkeng";
import native from "./brkeng.native-observations.json" with { type: "json" };
import { U_ICUDATA_BRKITR } from "./ubrkimpl";
import { udata_cleanup } from "./udata";
import { ures_close, ures_getStringByKeyWithFallback, ures_openDirect } from "./uresbund";

it("uses the original script-selected dictionary and reopens it after data cleanup", /** The native factory provides successful and missing dictionary results. @returns Nothing. */ () => {
  try {
    for (const c of native.factory) {
      expect(observeMatcher(loadDictionaryMatcherFor(c.script), c), JSON.stringify(c)).toEqual(
        c.expected,
      );
    }
    udata_cleanup();
    const c = native.factory[0];
    if (c === undefined) throw new Error("Missing native factory observation");
    expect(observeMatcher(loadDictionaryMatcherFor(c.script), c)).toEqual(c.expected);
  } finally {
    udata_cleanup();
  }
});

it("keeps named and default root entries separate in the cache", /** Opens both packages at the same locale and follows a nested resource path. @returns Nothing. */ () => {
  const defaultRoot = ures_openDirect(null, "root", [0]);
  const breakRoot = ures_openDirect(U_ICUDATA_BRKITR, "root", [0]);
  const reopened = ures_openDirect(U_ICUDATA_BRKITR, "root", [0]);
  try {
    expect(defaultRoot?.fData?.fPath).toBeNull();
    expect(breakRoot?.fData?.fPath).toBe(U_ICUDATA_BRKITR);
    expect(breakRoot?.fData).not.toBe(defaultRoot?.fData);
    expect(reopened?.fData).toBe(breakRoot?.fData);
    const namedStatus: [number] = [0];
    expect(ures_getStringByKeyWithFallback(breakRoot, "dictionaries/Thai", null, namedStatus)).toBe(
      "thaidict.dict",
    );
    expect(namedStatus[0]).toBe(0);
    const defaultStatus: [number] = [0];
    expect(
      ures_getStringByKeyWithFallback(defaultRoot, "dictionaries/Thai", null, defaultStatus),
    ).toBeNull();
    expect(defaultStatus[0]).toBeGreaterThan(0);
  } finally {
    ures_close(reopened);
    ures_close(breakRoot);
    ures_close(defaultRoot);
  }
});
