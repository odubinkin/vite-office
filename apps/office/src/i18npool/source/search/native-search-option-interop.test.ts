/** @fileoverview Actual legacy/new UNO TextSearch entrypoint contracts through the existing backend and typed wrapper. */
import { offsets, searchResult } from "../../../test/search-result-values";
import { expect, it, vi } from "vitest";
import { TextSearch } from "./textsearch";
import { SearchOptions } from "../../../offapi/com/sun/star/util/SearchOptions";
import { SearchOptions2 as WireOptions } from "../../../offapi/com/sun/star/util/SearchOptions2";
import { SearchAlgorithms as Legacy } from "../../../offapi/com/sun/star/util/SearchAlgorithms";
import { SearchOptions2 as TypedOptions } from "../../../i18nutil/inc/searchopt";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { TransliterationFlags } from "../../../i18nutil/inc/transliteration";
import { NORM_WORD_ONLY } from "../../../offapi/com/sun/star/util/SearchFlags";
/** Actual UTF16 owner. @param value - Source text. @returns Native string. */
function string(value: string): OUString {
  const units = new Uint16Array(value.length);
  for (let i = 0; i < value.length; ++i) units[i] = value.charCodeAt(i);
  return new OUString(units, units.length);
}
it("legacy setOptions delegates actual upgraded fields with zero escape and independent ownership", /** Observes the public source setOptions2 boundary while still executing the actual engine. @returns Nothing. */ () => {
  const engine = new TextSearch(),
    spy = vi.spyOn(engine, "setOptions2"),
    legacy = new SearchOptions(
      Legacy.ABSOLUTE,
      NORM_WORD_ONLY,
      string("cat"),
      string("dog"),
      new Locale(),
      2,
      3,
      4,
      TransliterationFlags.IGNORE_CASE,
    );
  engine.setOptions(legacy);
  expect(spy).toHaveBeenCalledOnce();
  const arg = spy.mock.calls[0]?.[0];
  expect(arg).toBeInstanceOf(WireOptions);
  expect([
    arg?.AlgorithmType2,
    arg?.WildcardEscapeCharacter,
    arg?.changedChars,
    arg?.deletedChars,
    arg?.insertedChars,
  ]).toEqual([1, 0, 2, 3, 4]);
  legacy.searchString = string("missing");
  expect(engine.searchForward(string("x CAT y"), 0, 7)).toEqual(searchResult(1, [2], [5]));
  expect(engine.searchBackward(string("x CAT y"), 7, 0)).toEqual(searchResult(1, [5], [2]));
  spy.mockRestore();
});
it.each([-1, 3, 999])(
  "legacy unknown algorithm %i retains native literal fallback",
  /** Unknown old identities upgrade to ABSOLUTE=1, not to the typed constructor's zero sentinel. @param algorithm - Old enum value. @returns Nothing. */ (
    algorithm,
  ) => {
    const engine = new TextSearch(),
      legacy = new SearchOptions();
    legacy.algorithmType = algorithm as Legacy;
    legacy.searchString = string("a.b");
    engine.setOptions(legacy);
    expect(offsets(engine.searchForward(string("xa.by"), 0, 5).startOffset)).toEqual([1]);
    expect(engine.searchForward(string("xaXby"), 0, 5).subRegExpressions).toBe(0);
  },
);
it("newer setOptions2 uses AlgorithmType2 while legacy setOptions reads only the inherited algorithm", /** A derived UNO struct is also a valid base argument; neither API may silently merge the two identities. @returns Nothing. */ () => {
  const options = new WireOptions(
      Legacy.ABSOLUTE,
      0,
      string("a?b"),
      string(""),
      new Locale(),
      0,
      0,
      0,
      0,
      4,
      126,
    ),
    engine = new TextSearch();
  engine.setOptions2(options);
  expect(engine.searchForward(string("aXb"), 0, 3).subRegExpressions).toBe(1);
  expect(offsets(engine.searchBackward(string("aXb"), 3, 0).startOffset)).toEqual([3]);
  engine.setOptions(options);
  expect(engine.searchForward(string("aXb"), 0, 3).subRegExpressions).toBe(0);
  expect(engine.searchForward(string("a?b"), 0, 3).subRegExpressions).toBe(1);
  options.algorithmType = Legacy.REGEXP;
  options.AlgorithmType2 = 1;
  engine.setOptions2(options);
  expect(engine.searchForward(string("a?b"), 0, 3).subRegExpressions).toBe(1);
});
it.each([Legacy.REGEXP, Legacy.APPROXIMATE])(
  "legacy mode %i keeps unsupported algorithms explicit and prior state intact",
  /** No fake regex/similarity conversion or silent literal downgrade is allowed for known old modes. @param algorithm - Original legacy mode. @returns Nothing. */ (
    algorithm,
  ) => {
    const engine = new TextSearch(),
      good = new SearchOptions();
    good.searchString = string("keep");
    engine.setOptions(good);
    const unsupported = new SearchOptions();
    unsupported.algorithmType = algorithm;
    unsupported.searchString = string("new");
    expect(
      /** Attempts an actually unported native engine. @returns Nothing. */ () =>
        engine.setOptions(unsupported),
    ).toThrow("algorithm is not implemented");
    expect(engine.searchForward(string("keep"), 0, 4).subRegExpressions).toBe(1);
  },
);
it("uses actual typed-to-wire conversion without losing wildcard escape or supplementary offsets", /** The option item bridge must reach the real matcher, retaining copy independence and directional conventions. @returns Nothing. */ () => {
  const typed = new TypedOptions(
      0,
      string("~🌴?"),
      string("replacement"),
      new Locale(),
      2,
      2,
      2,
      0,
      4,
      126,
    ),
    wire = typed.toUnoSearchOptions2(),
    engine = new TextSearch();
  engine.setOptions2(wire);
  typed.searchString.clear();
  wire.searchString.clear();
  expect(engine.searchForward(string("x🌴ay"), 0, 5)).toEqual(searchResult(1, [1], [4]));
  expect(engine.searchBackward(string("x🌴ay"), 5, 0)).toEqual(searchResult(1, [4], [1]));
});
