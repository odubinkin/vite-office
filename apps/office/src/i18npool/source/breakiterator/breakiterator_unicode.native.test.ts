/** @fileoverview Original LibreOffice Unicode word-method and ICU stock locale differential replay. */
import { expect, it } from "vitest";
import { createWordInstance } from "../../../external/icu/source/common/brkiter";
import { Locale as IcuLocale } from "../../../external/icu/source/common/locid";
import {
  u_isalnum,
  u_isUWhiteSpace,
  u_isWhitespace,
} from "../../../external/icu/source/common/unicode/uchar";
import { ULocDataLocaleType as L } from "../../../external/icu/source/common/unicode/uloc";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { ANYWORD_IGNOREWHITESPACES } from "../../../offapi/com/sun/star/i18n/WordType";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { getBreakIteratorRules } from "../localedata/localedata";
import { BreakIterator_Unicode } from "./breakiterator_unicode";
import patched from "./breakiterator_unicode.libreoffice-patched-observations.json" with { type: "json" };
import native from "./breakiterator_unicode.native-observations.json" with { type: "json" };

/** Builds an original owned Locale triplet. @param language - Language field. @param country - Country field. @param variant - Optional original variant. @returns Locale owner. */
function localeFor(language: string, country: string, variant = ""): Locale {
  const lang = unicode(language);
  const region = unicode(country);
  const alternative = unicode(variant);
  try {
    return new Locale(lang, region, alternative);
  } finally {
    lang.dispose();
    region.dispose();
    alternative.dispose();
  }
}

it("matches original ICU whitespace and alphanumeric data for every code point", /** Combines all three original predicates into the native digest. @returns Nothing. */ () => {
  let hash = 2166136261;
  for (let c = 0; c <= 0x10ffff; ++c) {
    const flags =
      Number(u_isUWhiteSpace(c)) | (Number(u_isWhitespace(c)) << 1) | (Number(u_isalnum(c)) << 2);
    hash = Math.imul(hash ^ flags, 16777619) >>> 0;
  }
  expect(hash).toBe(native.props);
});

it("matches original stock ICU word rule locales", /** Exercises the actual brkitr boundary resource and rule owner. @returns Nothing. */ () => {
  for (const c of native.cases) {
    if (c.rule !== "-") continue;
    const status: [number] = [0];
    const iterator = createWordInstance(new IcuLocale(c.name), status);
    if (iterator === null) throw new Error("Missing stock ICU rule " + c.name + ": " + status[0]);
    try {
      expect(
        [
          status[0],
          iterator.getLocaleID(L.ULOC_ACTUAL_LOCALE, status),
          iterator.getLocaleID(L.ULOC_VALID_LOCALE, status),
          iterator.getLocaleID(L.ULOC_REQUESTED_LOCALE, status),
        ],
        c.name,
      ).toEqual(c.locale);
    } finally {
      iterator.dispose();
    }
  }
});

it("matches the original LibreOffice Unicode word methods", /** Uses real text owners across all word modes and locale rule fallbacks. @returns Nothing. */ () => {
  const iterator = new BreakIterator_Unicode();
  for (const [index, patchedCase] of patched.cases.entries()) {
    // ANY_WORD uses stock ICU; explicit LibreOffice rules use its patched Khmer engine.
    const c = patchedCase.rule === "-" ? native.cases[index] : patchedCase;
    if (c === undefined) throw new Error("Missing stock ICU observation");
    const locale = localeFor(c.language, c.country, c.variant);
    const value = unicode(c.value);
    try {
      const actual: number[] = [];
      for (const [op, position, direction] of c.operations) {
        const pos = position as number;
        const boundary =
          op === "N"
            ? iterator.nextWord(value, pos, locale, c.wordType)
            : op === "P"
              ? iterator.previousWord(value, pos, locale, c.wordType)
              : iterator.getWordBoundary(value, pos, locale, c.wordType, direction !== 0);
        actual.push(boundary.startPos, boundary.endPos);
      }
      expect(actual, `${c.name}/${c.rule}/${c.value}`).toEqual(c.expected);
    } finally {
      value.dispose();
      locale.dispose();
    }
  }
});

/** Reads an owned locale sequence through the real borrowed string slots. @param locale - Requested locale. @returns Actual rule names. */
function localeRules(locale: Locale): string[] {
  const rules = getBreakIteratorRules(locale);
  try {
    const result = [];
    for (let i = 0; i < rules.getLength(); ++i)
      result.push(text(OUString.unacquired(rules.operatorIndex(i))));
    return result;
  } finally {
    rules.dispose();
  }
}

it("rebinds a shared rule iterator when its counted string changes", /** Retains both borrowed text and original realm-wide rule cache semantics. @returns Nothing. */ () => {
  const en = localeFor("en", "US");
  const de = localeFor("de", "AT");
  const ja = localeFor("ja", "JP");
  const left = unicode("first tail");
  const right = unicode("X right");
  const first = new BreakIterator_Unicode();
  const second = new BreakIterator_Unicode();
  try {
    expect(localeRules(de)[1]).toBe("dict_word_prepostdash");
    expect(localeRules(ja)[4]).toBe("line_cj");
    expect(localeRules(en)).toEqual(["", "", "", "", ""]);
    expect(first.getWordBoundary(left, 0, en, ANYWORD_IGNOREWHITESPACES, true)).toEqual({
      startPos: 0,
      endPos: 5,
    });
    expect(second.getWordBoundary(right, 0, en, ANYWORD_IGNOREWHITESPACES, true)).toEqual({
      startPos: 0,
      endPos: 1,
    });
    expect(first.getWordBoundary(left, 0, en, ANYWORD_IGNOREWHITESPACES, true)).toEqual({
      startPos: 0,
      endPos: 5,
    });
  } finally {
    left.dispose();
    right.dispose();
    en.dispose();
    de.dispose();
    ja.dispose();
  }
});
