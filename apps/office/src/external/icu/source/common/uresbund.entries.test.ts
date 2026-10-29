/** @fileoverview Original resource-cache/filename-fallback regressions backed by the unchanged native uresbund.cpp witness and complete raw package export. */
import { afterEach, expect, it } from "vitest";
import {
  entryOpen,
  entryOpenDirect,
  findFirstExisting,
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

it("uses actual default and NUL-terminated filenames without changing entry identity", /** Original null/default and C-prefix arguments share the same mapped cache entries. @returns Nothing. */ () => {
  const prior = locale_get_default();
  locale_set_default_internal("en_US", [0]);
  try {
    const status: [number] = [0],
      ready = entryOpenDirect(null, "root", status);
    entryClose(ready);
    const first = init_entry(null, null, status),
      second = entryOpenDirect(null, "en_US\0ignored", status);
    try {
      expect(status[0]).toBeLessThanOrEqual(0);
      expect(first?.fName).toBe("en_US");
      expect(second).toBe(first);
    } finally {
      entryClose(first);
      entryClose(second);
    }
  } finally {
    locale_set_default_internal(prior, [0]);
  }
});
it("stops original filename search on incoming failure and preserves its output sentinels", /** Uses the existing helper contract and real scalar reference slots, without a fabricated resource entry. @returns Nothing. */ () => {
  const name: [string] = ["en_US"],
    parent: [boolean] = [false],
    root: [boolean] = [true],
    isDefault: [boolean] = [true],
    status: [number] = [1];
  expect(findFirstExisting(null, name, "en_US", 0, root, parent, isDefault, status)).toBeNull();
  expect(name[0]).toBe("en_US");
  expect([parent[0], root[0], isDefault[0], status[0]]).toEqual([true, true, true, 1]);
});

it("reuses an already inherited parent without appending another root", /** Opens real parent/child cache entries and releases both complete reference lines. @returns Nothing. */ () => {
  const status: [number] = [0],
    parent = entryOpenDirect(null, "en", status);
  expect(parent?.fParent?.fName).toBe("root");
  const child = entryOpenDirect(null, "en_US", status);
  try {
    expect(status[0]).toBeLessThanOrEqual(0);
    expect(child?.fParent).toBe(parent);
    expect(child?.fParent?.fParent?.fName).toBe("root");
    expect(child?.fParent?.fParent?.fParent).toBeNull();
  } finally {
    entryClose(child);
    entryClose(parent);
  }
});
it("falls back through actual missing and root default locales with the source warning", /** Unknown default names and the valid root locale do not manufacture package entries. @returns Nothing. */ () => {
  const prior = locale_get_default();
  try {
    for (const name of ["zz", ""]) {
      locale_set_default_internal(name, [0]);
      const status: [number] = [0],
        entry = entryOpen(null, "qz_ZZ", 0, status);
      try {
        expect(entry?.fName).toBe("root");
        expect(status[0]).toBe(-127);
      } finally {
        entryClose(entry);
      }
    }
  } finally {
    locale_set_default_internal(prior, [0]);
  }
});
