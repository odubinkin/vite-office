/** @fileoverview Original resource-cache/filename-fallback regressions backed by the unchanged native uresbund.cpp witness and complete raw package export. */
import { afterEach, expect, it } from "vitest";
import {
  entryOpen,
  entryOpenDirect,
  entryClose,
  entryIncrease,
  init_entry,
  loadParentsExceptRoot,
  ures_flushCache,
  UResourceDataEntry,
} from "./uresbund.entries";
import { getParentLocaleID, mayHaveParent, getDefaultScript } from "./uresbund.fallback";
import { ResourceData, res_load, res_unload } from "./uresdata.package";
import { ResourceDataValue } from "./uresdata";
import { locale_get_default, locale_set_default_internal } from "./locid.default";
afterEach(
  /** All ordinary cases release their handles before the original cache flush. @returns Nothing. */ () => {
    ures_flushCache();
  },
);
it("keeps script-aware missing-file search separate from existing bundle inheritance", /** Tests original requested-script and open-mode branches. @returns Nothing. */ () => {
  expect(getDefaultScript("zh\0ignored", "TW")).toBe("Hans");
  expect(getDefaultScript("zh", "TW")).toBe("Hant");
  const name: [string] = ["en_Latn_US"];
  expect(getParentLocaleID(name, name[0], 0)).toBe(true);
  expect(name[0]).toBe("en_US");
  name[0] = "en_US";
  expect(getParentLocaleID(name, "en_Cyrl_US", 0)).toBe(true);
  expect(name[0]).toBe("en_Cyrl");
  expect(getParentLocaleID(name, name[0], 0)).toBe(false);
  expect(name[0]).toBe("en_Cyrl");
  expect(getParentLocaleID(name, name[0], 1)).toBe(true);
  expect(name[0]).toBe("en");
  expect(mayHaveParent("b")).toBe(true);
  expect(mayHaveParent("n")).toBe(true);
  expect(mayHaveParent("")).toBe(false);
});
it("loads actual explicit parents with pool references and releases the full cached line", /** Tests source entry ownership and reference counting. @returns Nothing. */ () => {
  const status: [number] = [0],
    entry = entryOpen(null, "en_GB", 0, status) as UResourceDataEntry;
  const names: string[] = [];
  for (let p: UResourceDataEntry | null = entry; p !== null; p = p.fParent) {
    names.push(p.fName);
    expect(p.fCountExisting).toBe(1);
  }
  expect(names).toEqual(["en_GB", "en_001", "en", "root"]);
  expect(status[0]).toBe(0);
  entryIncrease(entry);
  expect(entry.fCountExisting).toBe(2);
  entryClose(entry);
  entryClose(entry);
  expect(entry.fCountExisting).toBe(0);
  expect(ures_flushCache()).toBe(5);
});
it("preserves the source default-locale prefix classification", /** Tests actual bundle selection rather than just its warning status. @returns Nothing. */ () => {
  const previous = locale_get_default();
  locale_set_default_internal("en_US", [0]);
  try {
    const a: [number] = [0],
      b: [number] = [0],
      prefix = entryOpen(null, "e", 0, a) as UResourceDataEntry,
      unknown = entryOpen(null, "zz", 0, b) as UResourceDataEntry;
    expect([prefix.fName, a[0]]).toEqual(["root", -127]);
    expect([unknown.fName, b[0]]).toEqual(["en_US", -127]);
    entryClose(prefix);
    entryClose(unknown);
  } finally {
    locale_set_default_internal(previous, [0]);
  }
});
it("retains raw aliases where the old public resource projection had resolved them", /** Tests original raw ResourceDataValue alias boundaries. @returns Nothing. */ () => {
  const data = new ResourceData(),
    status: [number] = [0],
    value = new ResourceDataValue();
  res_load(data, null, "keyTypeData", status);
  value.setResource(data.rootRes);
  expect(value.getTable(status).findValue("typeMap", value)).toBe(true);
  expect(value.getTable(status).findValue("timezone", value)).toBe(true);
  expect(value.getType()).toBe(3);
  const length: [number] = [77];
  expect(value.getAliasString(length, status)).toBe("/ICUDATA/timezoneTypes/typeMap/timezone");
  expect(length[0]).toBe(39);
  status[0] = 1;
  length[0] = 77;
  expect(value.getAliasString(length, status)).toBeNull();
  expect(length[0]).toBe(77);
  res_unload(data);
  expect(data.data).toBeNull();
  expect(data.noFallback).toBe(true);
  res_load(data, null, "", status);
  expect(status[0]).toBe(1);
  expect(data.rootRes.type).toBe(0);
  expect(data.noFallback).toBe(false);
});
it("preserves original self-parent alias construction without entering its nonterminating outer walk", /** The witness restores only its test-owned intermediate pointer before release. @returns Nothing. */ () => {
  const status: [number] = [0],
    root = entryOpenDirect(null, "root", status);
  entryClose(root);
  ures_flushCache();
  const entry = init_entry("no_NO", null, status) as UResourceDataEntry,
    current: [UResourceDataEntry] = [entry],
    name: [string] = ["no"];
  expect(loadParentsExceptRoot(current, name, 157, status)).toBe(true);
  try {
    expect(current[0].fParent).toBe(current[0]);
    expect(current[0].fCountExisting).toBe(3);
  } finally {
    entry.fParent = null;
    entryClose(entry);
    entryClose(entry);
  }
});
it("uses original uint32 counter assignment and wrap", /** Valid stack-like entry storage isolates arithmetic from resource lifetime. @returns Nothing. */ () => {
  const entry = new UResourceDataEntry();
  entryClose(entry);
  expect(entry.fCountExisting).toBe(0xffffffff);
  entryIncrease(entry);
  expect(entry.fCountExisting).toBe(0);
});
