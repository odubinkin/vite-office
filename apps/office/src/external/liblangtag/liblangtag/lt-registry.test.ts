/** @fileoverview Complete pinned registered-key lookup and functional field regressions. */
import { expect, it } from "vitest";
import data from "../data/language-subtag-registry.json";
import { lookupRegistry, type RegistryKind } from "./lt-registry";

it("replays native check-lang registered lookup preconditions", /** Only lookup assertions from upstream lt_lang_compare QA; comparison behavior is not implemented here. @returns Nothing. */ () => {
  expect(lookupRegistry("language", "ja")).not.toBeNull();
  expect(lookupRegistry("language", "zh")).not.toBeNull();
  expect(lookupRegistry("language", "*")).not.toBeNull();
  expect(lookupRegistry("language", "")).toBeNull();
});

it("looks up every ordered registry record with exact case-insensitive C-string keys", /** Full data/source equivalence is independently checked against the original raw registry. @returns Nothing. */ () => {
  for (const kind of Object.keys(data) as RegistryKind[])
    for (const row of data[kind]) {
      const entry = lookupRegistry(kind, row.tag);
      expect(entry).toEqual(row);
      expect(lookupRegistry(kind, row.tag.toUpperCase() + "\0ignored")).toBe(entry);
      expect(Object.isFrozen(entry)).toBe(true);
      expect(Object.isFrozen(entry?.prefixes)).toBe(true);
    }
});

it("preserves seven registry families, native wildcard/empty entries and absent lookup", /** Missing keys never fall back to the explicitly registered wildcard. @returns Nothing. */ () => {
  expect(
    Object.fromEntries(
      Object.entries(data).map(
        /** Counts all native DB values, including expanded ranges and explicit sentinels. @param row - Data family. @returns Count pair. */
        ([kind, rows]) => [kind, rows.length],
      ),
    ),
  ).toEqual({
    language: 8796,
    extlang: 260,
    script: 276,
    region: 345,
    variant: 141,
    grandfathered: 26,
    redundant: 67,
  });
  for (const kind of Object.keys(data) as RegistryKind[]) {
    for (const unknown of ["__proto__", "constructor", "unregistered", "Ä", "EN-", "zzzzzzzz"])
      expect(lookupRegistry(kind, unknown)).toBeNull();
    expect(lookupRegistry(kind, "*")?.tag ?? null).toBe(
      ["grandfathered", "redundant"].includes(kind) ? null : "*",
    );
    expect(lookupRegistry(kind, "")?.tag ?? null).toBe(
      ["language", "grandfathered", "redundant"].includes(kind) ? null : "",
    );
  }
});

it("retains source preferred tags, scripts, macro languages, prefixes and range endpoints", /** Independent functional literals pin parser-relevant values. @returns Nothing. */ () => {
  expect(lookupRegistry("language", "iw")?.preferredTag).toBe("he");
  expect(lookupRegistry("language", "de")?.suppressScript).toBe("Latn");
  expect(lookupRegistry("language", "cmn")?.macroLanguage).toBe("zh");
  expect(lookupRegistry("language", "zh")?.scope).toBe("macrolanguage");
  expect(lookupRegistry("extlang", "cmn")?.prefixes).toEqual(["zh"]);
  expect(lookupRegistry("variant", "1901")?.prefixes).toEqual(["de"]);
  expect(lookupRegistry("variant", "biske")?.prefixes).toEqual(["sl-rozaj"]);
  expect(lookupRegistry("grandfathered", "i-klingon")?.preferredTag).toBe("tlh");
  expect(lookupRegistry("grandfathered", "i-default")?.preferredTag).toBeNull();
  expect(lookupRegistry("redundant", "zh-cmn")?.preferredTag).toBe("cmn");
  for (const tag of ["qaa", "qaz", "qba", "qtz"])
    expect(lookupRegistry("language", tag)?.tag).toBe(tag);
  expect(lookupRegistry("language", "qua")?.tag).toBe("qua");
  expect(lookupRegistry("script", "Qaaa")?.tag).toBe("Qaaa");
  expect(lookupRegistry("script", "Qabx")?.tag).toBe("Qabx");
  expect(lookupRegistry("region", "QM")?.tag).toBe("QM");
  expect(lookupRegistry("region", "QZ")?.tag).toBe("QZ");
  expect(lookupRegistry("region", "XA")?.tag).toBe("XA");
  expect(lookupRegistry("region", "XZ")?.tag).toBe("XZ");
});
