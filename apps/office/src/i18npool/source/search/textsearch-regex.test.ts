/** @fileoverview Prepared ICU regex options, directional source offsets and native bridge integration. */
import { createNativeRegexMatcher, hasNativeRegexProbe } from "../../../test/icu-regex-probe";
import { expect, it, vi } from "vitest";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { SearchOptions2 } from "../../../i18nutil/inc/searchopt";
import { TransliterationFlags } from "../../../i18nutil/inc/transliteration";
import { ALL_IGNORE_CASE } from "../../../offapi/com/sun/star/util/SearchFlags";
import { ABSOLUTE, REGEXP } from "../../../offapi/com/sun/star/util/SearchAlgorithms2";
import { offsets } from "../../../test/search-result-values";
import { TextSearch, type RegexMatcherFactory } from "./textsearch";

/** Binds a JavaScript string to the native UTF-16 value. @param value - Text. @returns Native string. */
function unicode(value: string): OUString {
  const units = new Uint16Array(value.length);
  for (let i = 0; i < units.length; i++) units[i] = value.charCodeAt(i);
  return new OUString(units, units.length);
}

/** Creates the real search options with a UTF-16 pattern. @param pattern - Search pattern. @param flags - Transliteration settings. @returns Native options. */
function options(pattern: string, flags = 0): SearchOptions2 {
  const value = new SearchOptions2();
  value.AlgorithmType2 = REGEXP;
  value.searchString = unicode(pattern);
  value.transliterateFlags = flags;
  return value;
}

it("keeps regex control syntax intact and gives case sensitivity to the ICU factory", /** Checks option ownership and matcher disposal independently of the deployed ICU binary. @returns Nothing. */ () => {
  const release = vi.fn();
  const create = vi.fn<RegexMatcherFactory>().mockReturnValue({
    search: vi.fn().mockReturnValue(new Int32Array()),
    dispose: release,
  });
  const engine = new TextSearch(options("\\p{Lu}", TransliterationFlags.IGNORE_CASE), create);
  expect(create).toHaveBeenCalledWith(Uint16Array.of(92, 112, 123, 76, 117, 125), true);
  const next = options("Ａ", TransliterationFlags.IGNORE_WIDTH);
  next.searchFlag = ALL_IGNORE_CASE;
  engine.setOptions2(next);
  expect(create).toHaveBeenLastCalledWith(Uint16Array.of(65), true);
  expect(release).toHaveBeenCalledOnce();
  const literal = options("a.b");
  literal.AlgorithmType2 = ABSOLUTE;
  engine.setOptions2(literal);
  expect(release).toHaveBeenCalledTimes(2);
  expect(offsets(engine.searchForward(unicode("xa.by"), 0, 5).startOffset)).toEqual([1]);
  engine.dispose();
  expect(release).toHaveBeenCalledTimes(2);
});

it("uses the retained complex key only when regex has no simple flags", /** Preserves the native selection of sSrchStr2 without a secondary match pass. @returns Nothing. */ () => {
  const flag = TransliterationFlags.ignoreBaFa_ja_JP;
  const create = vi.fn<RegexMatcherFactory>();
  const engine = new TextSearch(options("生", flag), create);
  expect(create).toHaveBeenLastCalledWith(new Uint16Array(), false);
  expect(engine.searchForward(unicode("生"), 0, 1).subRegExpressions).toBe(0);
  const literal = options("ハ", flag);
  literal.AlgorithmType2 = ABSOLUTE;
  engine.setOptions2(literal);
  engine.setOptions2(options("新", flag));
  expect(create).toHaveBeenLastCalledWith(Uint16Array.of(0x30cf), false);
  engine.setOptions2(options("新", flag | TransliterationFlags.IGNORE_CASE));
  expect(create).toHaveBeenLastCalledWith(Uint16Array.of(0x65b0), true);

  const plain = options("missing");
  plain.AlgorithmType2 = ABSOLUTE;
  engine.setOptions2(plain);
  expect(engine.searchForward(unicode("xファ"), 0, 3).subRegExpressions).toBe(1);
  engine.setOptions2(options("新", TransliterationFlags.ignoreSeZe_ja_JP));
  engine.setOptions2(plain);
  expect(engine.searchForward(unicode("xファ"), 0, 3).subRegExpressions).toBe(0);
});

it.skipIf(!hasNativeRegexProbe)(
  "maps actual ICU capture results after width folding, including supplementary context",
  /** Exercises the real shared options, transliteration and ICU boundary. @returns Nothing. */ () => {
    const engine = new TextSearch(
      options("(?<=😀)(Ａ)(z)?(?=Ｙ)", TransliterationFlags.IGNORE_WIDTH),
      createNativeRegexMatcher,
    );
    const text = unicode("q😀ＡＹz");
    const forward = engine.searchForward(text, 3, 4);
    expect(offsets(forward.startOffset)).toEqual([3, 3, -1]);
    expect(offsets(forward.endOffset)).toEqual([4, 4, -1]);
    expect(engine.searchBackward(text, 4, 3).subRegExpressions).toBe(0);
    const backward = engine.searchBackward(text, 6, 0);
    expect(offsets(backward.startOffset)).toEqual([4, 4, -1]);
    expect(offsets(backward.endOffset)).toEqual([3, 3, -1]);
    engine.dispose();
  },
);

it.skipIf(!hasNativeRegexProbe)(
  "preserves punctuation and original case until the actual ICU search",
  /** Checks case flags, quotes and invalid-pattern replacement with the native bridge. @returns Nothing. */ () => {
    const engine = new TextSearch(options("(A)'"), createNativeRegexMatcher);
    expect(engine.searchForward(unicode("A’"), 0, 2).subRegExpressions).toBe(0);
    expect(engine.searchForward(unicode("a'"), 0, 2).subRegExpressions).toBe(0);
    engine.setOptions2(options("(A)'", TransliterationFlags.IGNORE_CASE));
    expect(offsets(engine.searchForward(unicode("a'"), 0, 2).endOffset)).toEqual([2, 1]);
    engine.setOptions2(options("("));
    expect(engine.searchForward(unicode("("), 0, 1).subRegExpressions).toBe(0);
    engine.dispose();
  },
);
