/** @fileoverview Original lowercase classifier range/locale/context contracts over real transliteration mappings. */
import { expect, it } from "vitest";
import { toLower } from "./cclass_unicode";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";

it.each([
  ["en", "Iİ", "iİ"],
  ["tr", "Iİ", "ıi"],
  ["az", "Iİ", "ıi"],
  ["el", "ΟΣ", "ος"],
  ["el", "ΟΣΑ", "οσα"],
  ["lt", "I\u0301", "i\u0301"],
  ["en", "ẞ𐐀", "ß𐐨"],
  ["en", "A\0Z", "a\0z"],
])(
  "uses original lowercase mappings for %s/%s",
  /** Preserves source conditionals and actual shared string ownership. @param language - Native Locale language. @param input - Source input. @param expected - Source mapping result. @returns Nothing. */ (
    language,
    input,
    expected,
  ) => {
    const locale = new Locale(),
      source = unicode(input),
      lang = unicode(language);
    locale.Language.assign(lang);
    lang.dispose();
    const output = toLower(source, 0, source.getLength(), locale);
    try {
      expect(text(output)).toBe(expected);
      expect(text(source)).toBe(input);
    } finally {
      output.dispose();
      source.dispose();
      locale.dispose();
    }
  },
);

it("clamps ranges but retains source next-unit context and split-surrogate results", /** Distinguishes native mapping bounds from lowercasing a sliced JS string. @returns Nothing. */ () => {
  const locale = new Locale(),
    source = unicode("ΟΣΑ"),
    pair = unicode("𐐀");
  const cases = [
    [source, 0, 2, "οσ"],
    [source, 1, 1, "σ"],
    [source, 2, 20, "α"],
    [source, 3, 1, ""],
    [pair, 0, 1, "\ud801"],
    [pair, 1, 1, "\udc00"],
  ] as const;
  try {
    for (const [input, start, count, expected] of cases) {
      const result = toLower(input, start, count, locale);
      try {
        expect(text(result)).toBe(expected);
      } finally {
        result.dispose();
      }
    }
  } finally {
    source.dispose();
    pair.dispose();
    locale.dispose();
  }
});
