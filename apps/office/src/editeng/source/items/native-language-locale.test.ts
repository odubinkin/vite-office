/** @fileoverview Native SvxLanguageItem Locale member, generated Locale type and unresolved-system conversions. */
import { expect, it } from "vitest";
import { SvxLanguageItem } from "../../inc/langitem";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import {
  Locale,
  cppu_detail_getUnoType_Locale as localeType,
} from "../../../udkapi/com/sun/star/lang/Locale";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { LanguageTag } from "../../../i18nlangtag/inc/languagetag";
import { MID_LANG_LOCALE } from "../../inc/memberids";
/** Independent Locale from actual Unicode field values. @param language - Language. @param country - Country. @param variant - Variant. @returns Native value. */
function locale(language: string, country = "", variant = ""): Locale {
  const l = unicode(language),
    c = unicode(country),
    v = unicode(variant);
  try {
    return new Locale(l, c, v);
  } finally {
    v.dispose();
    c.dispose();
    l.dispose();
  }
}
/** Reads the native three-string fields for assertions. @param value - Actual value. @returns Host strings. */
function fields(value: Locale): string[] {
  return [text(value.Language), text(value.Country), text(value.Variant)];
}
it("copies real Locale strings through the normal typed Any compound binding", /** The Any owns copied string cells, not a reference to the mutable source object. @returns Nothing. */ () => {
  const source = locale("de", "DE"),
    value = new Any(source, localeType),
    copy = new Any(value),
    out = new Locale();
  try {
    source.Language.assign(unicode("fr"));
    expect(copy.extract(out, localeType)).toBe(true);
    expect(fields(out)).toEqual(["de", "DE", ""]);
    expect(value.operatorEquals(copy)).toBe(true);
    const metadata = localeType();
    expect(metadata.getTypeClass()).toBe(17);
  } finally {
    out.dispose();
    copy.dispose();
    value.dispose();
    source.dispose();
  }
});
it.each([
  [0, ["", "", ""]],
  [0x407, ["de", "DE", ""]],
  [0x411, ["ja", "JP", ""]],
] as const)(
  "queries native unresolved Locale for ID %s",
  /** Source QueryValue converts numeric IDs with resolveSystem=false. @param id - Language ID. @param expected - Source triplet. @returns Nothing. */ (
    id,
    expected,
  ) => {
    const item = new SvxLanguageItem(id, 10),
      value = new Any(),
      out = new Locale();
    try {
      expect(item.QueryValue(value, MID_LANG_LOCALE | 0x80)).toBe(true);
      expect(value.extract(out, localeType)).toBe(true);
      expect(fields(out)).toEqual(expected);
    } finally {
      out.dispose();
      value.dispose();
      item.Dispose();
    }
  },
);
it("puts an empty Locale as unresolved SYSTEM and rejects wrong typed input unchanged", /** Locale member extraction is distinct from its integer member. @returns Nothing. */ () => {
  const item = new SvxLanguageItem(0x407, 10),
    empty = new Locale(),
    value = new Any(empty, localeType),
    wrong = new Any([1036], "sal_Int32");
  try {
    expect(item.PutValue(wrong, MID_LANG_LOCALE)).toBe(false);
    expect(item.GetLanguage()).toBe(0x407);
    expect(item.PutValue(value, MID_LANG_LOCALE)).toBe(true);
    expect(item.GetLanguage()).toBe(0);
  } finally {
    wrong.dispose();
    value.dispose();
    empty.dispose();
    item.Dispose();
  }
});
it("uses the real qlt LanguageTag conversion for a script-bearing Locale", /** No invented direct country-to-ID table or browser Intl conversion is used. @returns Nothing. */ () => {
  const value = locale("qlt", "RS", "sr-Latn-RS"),
    any = new Any(value, localeType),
    item = new SvxLanguageItem(0, 10);
  try {
    expect(item.PutValue(any, MID_LANG_LOCALE)).toBe(true);
    expect(item.GetLanguage()).toBe(LanguageTag.convertToLanguageType(value, false));
    expect(item.GetLanguage()).toBe(0x241a);
  } finally {
    item.Dispose();
    any.dispose();
    value.dispose();
  }
});
