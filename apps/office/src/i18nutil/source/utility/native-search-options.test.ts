/** @fileoverview Original IDL/typed search value and command/member contracts, independent of search execution. */
import { expect, it } from "vitest";
import {
  SearchOptions2 as TypedOptions,
  downgradeSearchAlgorithms2,
  upgradeSearchAlgorithms,
} from "../../inc/searchopt";
import { SearchOptions as LegacyOptions } from "../../../offapi/com/sun/star/util/SearchOptions";
import { SearchOptions2 as WireOptions } from "../../../offapi/com/sun/star/util/SearchOptions2";
import { SearchAlgorithms as Legacy } from "../../../offapi/com/sun/star/util/SearchAlgorithms";
import { SvxSearchCmd, SvxSearchCellType, SvxSearchApp } from "../../../svl/inc/srchitem";
import * as members from "../../../svl/inc/memberid";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
/** Creates a UTF16 value including embedded zero/isolated surrogates without scalar rewriting. @param value - Input text. @returns Actual string. */
function string(value: string): OUString {
  const units = new Uint16Array(value.length);
  for (let i = 0; i < value.length; ++i) units[i] = value.charCodeAt(i);
  return new OUString(units, units.length);
}
/** Reads a logical shared string without its terminator or a spread argument limit. @param value - Native string. @returns Original UTF16 text. */
function text(value: OUStringConstReference): string {
  let out = "";
  for (let i = 0; i < value.getLength(); ++i)
    out += String.fromCharCode(value.getStr()[i] as number);
  return out;
}
/** Reads common native fields in the original IDL order after the old algorithm field. @param value - Native value family. @returns Complete shared-field state. */
function fields(value: TypedOptions | LegacyOptions): readonly unknown[] {
  return [
    value.searchFlag,
    text(value.searchString),
    text(value.replaceString),
    [text(value.Locale.Language), text(value.Locale.Country), text(value.Locale.Variant)],
    value.changedChars,
    value.deletedChars,
    value.insertedChars,
    value.transliterateFlags,
  ];
}
it("retains distinct old/new/typed zero defaults", /** Upgrading an old default yields ABSOLUTE=1; constructing the typed/new struct still yields AlgorithmType2=0. @returns Nothing. */ () => {
  const old = new LegacyOptions(),
    wire = new WireOptions(),
    typed = new TypedOptions();
  expect(old.algorithmType).toBe(0);
  expect([wire.algorithmType, wire.AlgorithmType2, wire.WildcardEscapeCharacter]).toEqual([
    0, 0, 0,
  ]);
  expect([typed.AlgorithmType2, typed.WildcardEscapeCharacter]).toEqual([0, 0]);
  for (const value of [old, wire, typed])
    expect(fields(value)).toEqual([0, "", "", ["", "", ""], 0, 0, 0, 0]);
  expect(upgradeSearchAlgorithms(old.algorithmType)).toBe(1);
  expect("algorithmType" in typed).toBe(false);
});
it.each([
  [0, 1],
  [1, 2],
  [2, 3],
  [-1, 1],
  [3, 1],
  [32767, 1],
] as const)(
  "retains original legacy upgrade %i -> %i",
  /** Literal source switch cases, including its default branch. @param input - Old identity. @param expected - New identity. @returns Nothing. */ (
    input,
    expected,
  ) => {
    expect(upgradeSearchAlgorithms(input as Legacy)).toBe(expected);
  },
);
it.each([
  [0, 0],
  [1, 0],
  [2, 1],
  [3, 2],
  [4, 0],
  [-1, 0],
  [32767, 0],
] as const)(
  "retains original new algorithm downgrade %i -> %i",
  /** Wildcard is downgraded to literal, not regex, while newer identity remains available separately. @param input - New identity. @param expected - Old identity. @returns Nothing. */ (
    input,
    expected,
  ) => {
    expect(downgradeSearchAlgorithms2(input)).toBe(expected);
  },
);
it("constructs full legacy/new/typed values in their distinct original field orders", /** All fields receive independent values with no language canonicalization or swapped short/long counts. @returns Nothing. */ () => {
  const search = string("a\0🌴\ud800"),
    replacement = string("z\udc00"),
    locale = new Locale(string("EN-us"), string("Raw"), string("Vendor"));
  const old = new LegacyOptions(Legacy.REGEXP, 0x1020304, search, replacement, locale, 3, 5, 7, 9);
  const wire = new WireOptions(
    Legacy.REGEXP,
    0x1020304,
    search,
    replacement,
    locale,
    3,
    5,
    7,
    9,
    4,
    0x1f334,
  );
  const typed = new TypedOptions(0x1020304, search, replacement, locale, 3, 5, 7, 9, 4, 0x1f334);
  const expected = [0x1020304, "a\0🌴\ud800", "z\udc00", ["EN-us", "Raw", "Vendor"], 3, 5, 7, 9];
  for (const value of [old, wire, typed]) {
    expect(fields(value)).toEqual(expected);
    expect(value.searchString).not.toBe(search);
    expect(value.Locale).not.toBe(locale);
  }
  expect([wire.algorithmType, wire.AlgorithmType2, wire.WildcardEscapeCharacter]).toEqual([
    1, 4, 0x1f334,
  ]);
  expect([typed.AlgorithmType2, typed.WildcardEscapeCharacter]).toEqual([4, 0x1f334]);
  search.assign(string("changed"));
  replacement.clear();
  locale.Language.assign(string("different"));
  for (const value of [old, wire, typed]) expect(fields(value)).toEqual(expected);
});
it("copies base fields as base and complete newer fields as newer", /** Passing a newer struct to legacy copy construction cannot silently propagate the extension into the legacy type. @returns Nothing. */ () => {
  const wire = new WireOptions(
      Legacy.APPROXIMATE,
      -3,
      string("key"),
      string("value"),
      new Locale(),
      11,
      12,
      13,
      14,
      4,
      126,
    ),
    base = new LegacyOptions(wire),
    copy = new WireOptions(wire);
  expect(fields(base)).toEqual(fields(wire));
  expect("AlgorithmType2" in base).toBe(false);
  expect([copy.algorithmType, copy.AlgorithmType2, copy.WildcardEscapeCharacter]).toEqual([
    2, 4, 126,
  ]);
  wire.searchString = string("mutated");
  wire.Locale.Country = string("raw");
  expect(text(base.searchString)).toBe("key");
  expect(text(copy.searchString)).toBe("key");
  expect(text(copy.Locale.Country)).toBe("");
});
it.each([0, 1, 2, 3, 4, -7, 32767])(
  "assigns and exports the preferred newer algorithm unchanged: %i",
  /** Native operator= does not read the obsolete algorithm; toUno downgrades only its legacy field. @param algorithm - New identity. @returns Nothing. */ (
    algorithm,
  ) => {
    const wire = new WireOptions(
        Legacy.REGEXP,
        -12,
        string("search"),
        string("replace"),
        new Locale(string("qlt"), string(""), string("RAW_tag")),
        5,
        6,
        7,
        -2147483648,
        algorithm,
        92,
      ),
      typed = new TypedOptions();
    const ownedSearch = typed.searchString,
      ownedLocale = typed.Locale;
    expect(typed.assign(wire)).toBe(typed);
    expect(typed.searchString).toBe(ownedSearch);
    expect(typed.Locale).toBe(ownedLocale);
    expect(typed.AlgorithmType2).toBe(algorithm);
    const out = typed.toUnoSearchOptions2();
    expect(out.algorithmType).toBe(downgradeSearchAlgorithms2(algorithm));
    expect(out.AlgorithmType2).toBe(algorithm);
    expect(out.WildcardEscapeCharacter).toBe(92);
    expect(fields(out)).toEqual(fields(typed));
    expect(out.searchString).not.toBe(typed.searchString);
    expect(out.Locale).not.toBe(typed.Locale);
    typed.assign(typed);
    expect(fields(typed)).toEqual(fields(out));
    wire.searchString.clear();
    typed.Locale.Variant = string("changed");
    expect(text(out.searchString)).toBe("search");
    expect(text(out.Locale.Variant)).toBe("RAW_tag");
  },
);
it("keeps borrowed field owners stable across public value assignments and typed copy construction", /** Replacing field values must copy rather than alias the caller or relocate the field owner. @returns Nothing. */ () => {
  const typed = new TypedOptions(),
    search = typed.searchString,
    locale = typed.Locale;
  typed.searchString = string("key");
  typed.Locale = new Locale(string("tr"), string("TR"), string(""));
  const copy = new TypedOptions(typed);
  expect(typed.searchString).toBe(search);
  expect(typed.Locale).toBe(locale);
  typed.searchString.clear();
  typed.Locale.Language.clear();
  expect(text(copy.searchString)).toBe("key");
  expect(text(copy.Locale.Language)).toBe("tr");
});
it("retains shared command/application/cell and search member identities", /** Fixed native ABI values, not derived from the runtime declarations under test. @returns Nothing. */ () => {
  expect([
    SvxSearchCmd.FIND,
    SvxSearchCmd.FIND_ALL,
    SvxSearchCmd.REPLACE,
    SvxSearchCmd.REPLACE_ALL,
  ]).toEqual([0, 1, 2, 3]);
  expect([SvxSearchApp.WRITER, SvxSearchApp.CALC, SvxSearchApp.DRAW]).toEqual([0, 1, 2]);
  expect([SvxSearchCellType.FORMULA, SvxSearchCellType.VALUE, SvxSearchCellType.NOTE]).toEqual([
    0, 1, 2,
  ]);
  expect(
    Object.fromEntries(
      Object.entries(members).filter(
        /** Selects the original search members only. @param pair - Exported identity. @returns Whether search-owned. */ ([
          name,
        ]) => name.startsWith("MID_SEARCH_"),
      ),
    ),
  ).toEqual({
    MID_SEARCH_STYLEFAMILY: 1,
    MID_SEARCH_CELLTYPE: 2,
    MID_SEARCH_ROWDIRECTION: 3,
    MID_SEARCH_ALLTABLES: 4,
    MID_SEARCH_SEARCHFILTERED: 5,
    MID_SEARCH_BACKWARD: 6,
    MID_SEARCH_PATTERN: 7,
    MID_SEARCH_CONTENT: 8,
    MID_SEARCH_ASIANOPTIONS: 9,
    MID_SEARCH_ALGORITHMTYPE: 10,
    MID_SEARCH_FLAGS: 11,
    MID_SEARCH_SEARCHSTRING: 12,
    MID_SEARCH_REPLACESTRING: 13,
    MID_SEARCH_LOCALE: 14,
    MID_SEARCH_CHANGEDCHARS: 15,
    MID_SEARCH_DELETEDCHARS: 16,
    MID_SEARCH_INSERTEDCHARS: 17,
    MID_SEARCH_TRANSLITERATEFLAGS: 18,
    MID_SEARCH_COMMAND: 19,
    MID_SEARCH_STARTPOINTX: 20,
    MID_SEARCH_STARTPOINTY: 21,
    MID_SEARCH_SEARCHFORMATTED: 22,
    MID_SEARCH_ALGORITHMTYPE2: 23,
  });
});
