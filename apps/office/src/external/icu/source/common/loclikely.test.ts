/** @fileoverview Regression cases for original ICU78.3 likely-subtag data/owners and public wrappers; exhaustive native comparison supplies independent reference evidence. */
import { expect, it } from "vitest";
import { Locale } from "./locid";
import { LikelySubtags } from "./loclikelysubtags";
import { LSR } from "./lsr";
import { UniqueCharStrings } from "./uniquecharstr";
import { ResourceDataValue } from "./uresdata";
import {
  ures_openDirect,
  ures_getByKey,
  ures_getBinary,
  type UResourceBundle,
  type Resource,
} from "./uresbund";
import {
  uloc_addLikelySubtags,
  uloc_minimizeSubtags,
  ulocimp_getRegionForSupplementalData,
} from "./loclikely";

it("uses original data and retains explicit LSR flags and pseudo-locale ownership", /** Tests source data dispatch. @returns Nothing. */ () => {
  const status: [number] = [0],
    likely = LikelySubtags.getSingleton(status) as LikelySubtags;
  const ru = likely.makeMaximizedLsrFrom(new Locale("ru"), true, status);
  expect([ru.language, ru.script, ru.region, ru.flags]).toEqual(["ru", "Cyrl", "RU", 4]);
  const pseudo = likely.makeMaximizedLsrFrom(new Locale("en_XA"), false, status);
  expect([
    pseudo.language,
    pseudo.script,
    pseudo.region,
    pseudo.flags,
    pseudo.owned !== null,
  ]).toEqual(["'en", "'", "XA", 7, true]);
  const alias = likely.makeMaximizedLsrFrom(new Locale("iw"), true, status);
  expect([alias.language, alias.script, alias.region]).toEqual(["he", "Hebr", "IL"]);
  expect(status[0]).toBe(0);
});
it("routes Locale minimization through the original source preference ordering", /** Tests actual Locale mutation and independent status guards. @returns Nothing. */ () => {
  const region = new Locale("zh_Hant_TW"),
    script = new Locale(region),
    s: [number] = [0];
  region.minimizeSubtags(s);
  const service = LikelySubtags.getSingleton(s) as LikelySubtags;
  const minimized = service.minimizeSubtags(
    script.getLanguage(),
    script.getScript(),
    script.getCountry(),
    true,
    s,
  );
  expect([minimized.language, minimized.script, minimized.region]).toEqual(["zh", "Hant", ""]);
  expect(region.getName()).toBe("zh_TW");
  expect(script.getName()).toBe("zh_Hant_TW");
  region.addLikelySubtags(s);
  expect(region.getName()).toBe("zh_Hant_TW");
  s[0] = 1;
  region.minimizeSubtags(s);
  expect(region.getName()).toBe("zh_Hant_TW");
});
it("preserves exact-fit termination warning and counted required lengths in C wrappers", /** Tests actual borrowed output buffers. @returns Nothing. */ () => {
  const buffer = new Uint8Array(16).fill(77),
    s: [number] = [0];
  expect(uloc_addLikelySubtags("ru", buffer, 10, s)).toBe(10);
  expect(s[0]).toBe(-124);
  expect([...buffer.slice(0, 11)]).toEqual([114, 117, 95, 67, 121, 114, 108, 95, 82, 85, 77]);
  s[0] = 0;
  expect(uloc_minimizeSubtags("zh_Hant_TW", buffer, 16, s)).toBe(5);
  expect([...buffer.slice(0, 6)]).toEqual([122, 104, 95, 84, 87, 0]);
});
it("preserves original rg/country/sd/inference precedence and keyword errors", /** Tests supplemental-region dispatch and the original keyword boundary. @returns Nothing. */ () => {
  for (const [id, infer, expected] of [
    ["en_US@rg=gbzzzz", true, "GB"],
    ["en_US@sd=gbeng", true, "US"],
    ["en@sd=gbeng", true, "GB"],
    ["en@sd=gbeng", false, ""],
    ["en@rg=419zzz", true, "US"],
    ["en@rg=GB+", true, "GB"],
  ] as const) {
    const status: [number] = [0];
    expect(ulocimp_getRegionForSupplementalData(id, infer, status)).toBe(expected);
    expect(status[0]).toBe(0);
  }
  const s: [number] = [0];
  expect(ulocimp_getRegionForSupplementalData(null, true, s)).toBe("");
  expect(s[0]).toBe(1);
  s[0] = 0;
  expect(ulocimp_getRegionForSupplementalData("en@rg=GB!", true, s)).toBe("");
  expect(s[0]).toBe(1);
});
it("preserves the source region-as-script lookup in compareLikely (CALC-333)", /** Tests the unchanged native result for traditional Chinese. @returns Nothing. */ () => {
  const likely = LikelySubtags.getSingleton([0]) as LikelySubtags;
  const info = likely.compareLikely(
    new LSR("zh", "Hant", "TW", 4),
    new LSR("zh", "Hant", "CN", 7),
    -1,
  );
  expect(info).toBe(4754);
  expect(info & 1).toBe(0);
});
it("retains moved-from region/index/flags and original hash cache", /** Tests logical owned storage lifetime while the moved owner remains live. @returns Nothing. */ () => {
  const s: [number] = [0],
    original = new LSR("en", "Latn", "US", 7, s);
  original.setHashCode();
  const hash = original.hashCode,
    moved = LSR.move(original);
  expect([
    original.language,
    original.script,
    original.region,
    original.regionIndex,
    original.flags,
    original.owned,
    original.hashCode,
  ]).toEqual(["", "", "US", LSR.indexForRegion("US"), 7, null, 0]);
  expect(moved.hashCode).toBe(hash);
  moved.flags = 0;
  moved.setHashCode();
  expect(moved.hashCode).toBe(hash);
  expect(LSR.indexForRegion("us")).toBe(0);
  expect(LSR.indexForRegion("000")).toBe(1);
});
it("keeps original pool offsets, duplicate elimination, freeze and partial failure bookkeeping", /** Tests the actual stable string owner. @returns Nothing. */ () => {
  const s: [number] = [0],
    pool = new UniqueCharStrings(s);
  expect(pool.add("en", s)).toBe(1);
  expect(pool.addByValue("en", s)).toBe(1);
  expect(pool.add("ru", s)).toBe(4);
  expect(pool.get(1)).toBeNull();
  expect(pool.add("é", s)).toBe(7);
  expect(s[0]).toBe(26);
  s[0] = 0;
  pool.freeze();
  expect(pool.get(1)).toBe("en");
  expect(pool.get(4)).toBe("ru");
  expect(pool.add("fr", s)).toBe(-1);
  expect(s[0]).toBe(30);
  expect(pool.orphanCharStrings()).toBe("\0en\0ru\0\0");
});
it("shares ResourceDataValue storage with direct bundles and retains outputs after failed view lookup", /** Tests original mutable resource holders over immutable mapped nodes. @returns Nothing. */ () => {
  const s: [number] = [0],
    root = ures_openDirect(null, "langInfo", s),
    likely = ures_getByKey(root, "likely", null, s) as UResourceBundle,
    value = new ResourceDataValue();
  value.setResource(likely.resource as Resource);
  const table = value.getTable(s);
  expect(table.findValue("trie", value)).toBe(true);
  const length: [number] = [0],
    bytes = value.getBinary(length, s),
    bundle = ures_getByKey(likely, "trie", null, s);
  expect(bytes).toBe(ures_getBinary(bundle, null, s));
  const before = value.getResource(),
    key: [string | null] = ["sentinel"];
  expect(table.getKeyAndValue(-1, key, value)).toBe(false);
  expect(key[0]).toBe("sentinel");
  expect(value.getResource()).toBe(before);
  expect(table.findValue("absent", value)).toBe(false);
  expect(value.getResource()).toBe(before);
  const empty = value.getArray(s);
  expect(s[0]).toBe(17);
  expect(empty.getSize()).toBe(0);
  expect(empty.getValue(0, value)).toBe(false);
});
