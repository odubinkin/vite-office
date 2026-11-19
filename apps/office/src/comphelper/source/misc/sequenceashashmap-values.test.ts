/** @fileoverview Original bool and Unicode getUnpackedValueOrDefault instantiations over real Any extraction and owned RTL values. */
import { expect, it } from "vitest";
import { SequenceAsHashMap } from "./sequenceashashmap";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
it("keeps explicit false and true separate from missing/wrong-type defaults", /** Source extraction is attempted into an initialized bool without inserting missing keys. @returns Nothing. */ () => {
  const map = new SequenceAsHashMap(),
    key = unicode("flag"),
    wrong = unicode("false");
  try {
    expect(map.getUnpackedValueOrDefault(key, true, "bool")).toBe(true);
    expect(map.empty()).toBe(true);
    map.operatorIndex(key).insert([false], "bool");
    expect(map.getUnpackedValueOrDefault(key, true, "bool")).toBe(false);
    map.operatorIndex(key).insert([true], "bool");
    expect(map.getUnpackedValueOrDefault(key, false, "bool")).toBe(true);
    map.operatorIndex(key).insert(wrong.getDataAddress(), "OUString");
    expect(map.getUnpackedValueOrDefault(key, true, "bool")).toBe(true);
    expect(map.getUnpackedValueOrDefault(key, false, "bool")).toBe(false);
  } finally {
    map.dispose();
    key.dispose();
    wrong.dispose();
  }
});
it("returns independent string values for success, missing and failed extraction", /** Embedded zero and supplementary Unicode remain counted native values. @returns Nothing. */ () => {
  const map = new SequenceAsHashMap(),
    key = unicode("url"),
    fallback = unicode("fallback\0字😀"),
    source = unicode("stored\0😀");
  try {
    const missing = map.getUnpackedValueOrDefault(key, fallback, "OUString");
    expect(missing).not.toBe(fallback);
    expect(missing.equals(fallback)).toBe(true);
    missing.clear();
    expect(text(fallback)).toBe("fallback\0字😀");
    missing.dispose();
    map.operatorIndex(key).insert(source.getDataAddress(), "OUString");
    const value = map.getUnpackedValueOrDefault(key, fallback, "OUString");
    map.operatorIndex(key).insert([5], "sal_Int32");
    expect(value.equals(source)).toBe(true);
    value.dispose();
    const wrong = map.getUnpackedValueOrDefault(key, fallback, "OUString");
    expect(wrong.equals(fallback)).toBe(true);
    expect(wrong).not.toBe(fallback);
    wrong.dispose();
  } finally {
    map.dispose();
    key.dispose();
    fallback.dispose();
    source.dispose();
  }
});
