/** @fileoverview Native OnDemandCharClass matching and alternating replacement. */
import { expect, it } from "vitest";
import { unicode, text } from "../../i18nlangtag/source/isolang/isolang.tables";
import { Locale } from "../../udkapi/com/sun/star/lang/Locale";
import { OnDemandCharClass } from "./ondemand";

/** Creates one fully owned locale for the two-slot source cache. @param language - Language. @param country - Country. @returns Locale. */
function locale(language: string, country: string): Locale {
  return new Locale(unicode(language), unicode(country), unicode(""));
}

it("reuses either matching classifier and replaces the opposite slot on a third locale", () => {
  const en = locale("en", "US"),
    de = locale("de", "DE"),
    tr = locale("tr", "TR"),
    cache = new OnDemandCharClass(),
    input = unicode("i");
  try {
    cache.changeLocale(en);
    const first = cache.get();
    cache.changeLocale(de);
    const second = cache.get();
    expect(second).not.toBe(first);
    cache.changeLocale(en);
    expect(cache.get()).toBe(first);
    cache.changeLocale(tr);
    const replacement = cache.get();
    expect(replacement).not.toBe(second);
    const upper = replacement.uppercase(input);
    expect(text(upper)).toBe("İ");
    upper.dispose();
    cache.changeLocale(en);
    expect(cache.get()).toBe(first);
  } finally {
    input.dispose();
    cache.dispose();
    tr.dispose();
    de.dispose();
    en.dispose();
  }
});
