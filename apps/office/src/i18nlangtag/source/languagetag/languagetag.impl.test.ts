/** @fileoverview Actual private LanguageTagImpl copy/cache/field behavior and original ISO fallback branches. */
import { expect, it } from "vitest";
import { LanguageTagImpl } from "./languagetag.impl";
import { createValueState, ScriptType } from "./languagetag.state";
import { Decision as D } from "./languagetag.conversion";
import { text, unicode } from "../isolang/isolang.tables";
import { getIsoFallbackStrings } from "./languagetag.iso-fallback";
import { LanguageTag } from "../../inc/languagetag";

/** Uses the real string-constructor field defaults for a private implementation value. @param value - Native string input. @returns Actual implementation. */
function fromString(value: string): LanguageTagImpl {
  const state = createValueState();
  state.maBcp47.assign(unicode(value));
  state.mnLangID = 1023;
  state.mbSystemLocale = !value;
  state.mbInitializedBcp47 = !!value;
  return new LanguageTagImpl(state);
}

it("keeps native empty qualified fields on failed parsing and independent script cache initialization", /** Real incomplete Locale values are not replaced with a successful language service. @returns Nothing. */ () => {
  const state = createValueState();
  state.maLocale.Language.assign(unicode("qlt"));
  state.mnLangID = 1023;
  state.mbSystemLocale = false;
  state.mbInitializedLocale = true;
  const value = new LanguageTagImpl(state);
  expect(text(value.getLanguageFromLangtag())).toBe("");
  expect(text(value.getScriptFromLangtag())).toBe("");
  expect(text(value.getRegionFromLangtag())).toBe("");
  expect(text(value.getVariantsFromLangtag())).toBe("");
  expect(value.hasScript()).toBe(false);
  const scripted = fromString("sr-Latn-RS");
  expect(scripted.hasScript()).toBe(true);
  const variants = fromString("de-1901-x-test");
  expect(text(variants.getVariantsFromLangtag())).toBe("1901");
  const numericRegion = fromString("es-419-x-test");
  expect(text(numericRegion.getCountry())).toBe("");
  expect(text(numericRegion.getRegion())).toBe("419");
});

it("preserves source system conversion wrappers and native case normalization", /** Uses the actual configured scalar and normal field values. @returns Nothing. */ () => {
  const state = createValueState(),
    system = new LanguageTagImpl(state);
  system.convertLocaleToLang(false);
  expect(system.mbInitializedLangID).toBe(true);
  system.convertBcp47ToLang();
  expect(system.mbInitializedLangID).toBe(true);
  const fromBcp = fromString("de-DE");
  fromBcp.convertBcp47ToLang();
  expect(fromBcp.mnLangID).toBe(1031);
  const mixed = fromString("DE-de");
  expect(mixed.canonicalize()).toBe(true);
  expect(text(mixed.getBcp47())).toBe("de-DE");
});

it("copies actual parsed fields independently and retains shared immutable registry values", /** Native copy duplicates tag caches/container values while preserving normal source metadata and decisions. @returns Nothing. */ () => {
  const original = fromString("en-Latn-US-x-task197");
  expect(original.canonicalize()).toBe(true);
  expect(text(original.getBcp47())).toBe("en-US-x-task197");
  original.getLanguage();
  original.getScript();
  original.getCountry();
  original.getVariants();
  original.setScriptType(ScriptType.WESTERN);
  const copy = new LanguageTagImpl(original);
  expect(copy.mpImplLangtag).not.toBe(original.mpImplLangtag);
  expect(copy.mpImplLangtag?.language).toBe(original.mpImplLangtag?.language);
  expect(copy.mpImplLangtag?.variants).not.toBe(original.mpImplLangtag?.variants);
  expect(text(copy.getLanguage())).toBe("en");
  expect(text(copy.getCountry())).toBe("US");
  expect(copy.getScriptType()).toBe(ScriptType.WESTERN);
  expect(copy.isValidBcp47()).toBe(true);
  expect(copy.assign(copy)).toBe(copy);
  copy.maCachedCountry.clear();
  expect(text(original.getCountry())).toBe("US");
  const other = fromString("de-DE");
  copy.assign(other);
  expect(copy.mpImplLangtag).toBeNull();
  expect(text(copy.maBcp47)).toBe("de-DE");
});

it("converts actual numeric fields through both original private wrappers", /** Checks ID-to-BCP47 and Locale-to-BCP47 responsibilities on the same borrowed Unicode owner. @returns Nothing. */ () => {
  const state = createValueState();
  state.mnLangID = 1031;
  state.mbSystemLocale = false;
  state.mbInitializedLangID = true;
  const value = new LanguageTagImpl(state),
    borrowed = value.maBcp47;
  value.convertLangToBcp47();
  expect(value.getBcp47()).toBe(borrowed);
  expect(text(borrowed)).toBe("de-DE");
  value.maLocale.Country.assign(unicode("AT"));
  value.convertLocaleToBcp47();
  expect(text(borrowed)).toBe("de-AT");
});

it("retains actual failed-parse field queries and lazy ISO decisions", /** Invalid input does not acquire a successful parser or fabricated fields. @returns Nothing. */ () => {
  const value = fromString("en--US");
  expect(value.isValidBcp47()).toBe(false);
  expect(text(value.getLanguageFromLangtag())).toBe("en");
  expect(text(value.getScriptFromLangtag())).toBe("");
  expect(text(value.getRegion())).toBe("");
  expect(text(value.getVariantsFromLangtag())).toBe("");
  expect(value.isIsoLocale()).toBe(true);
  expect(value.isIsoODF()).toBe(true);
  expect(value.meIsValid).toBe(D.DECISION_NO);
});

it("replays source C-locale remapping and non-ISO script/variant attributes", /** Uses real legacy lookup and actual parsed Unicode outputs needed by font attributes. @returns Nothing. */ () => {
  const value = new LanguageTag("C", true);
  expect(text(value.getBcp47())).toBe("en-US");
  for (const [input, expected] of [
    ["sr-Latn-RS", ["sr", "Latn", "RS"]],
    ["ca-ES-valencia", ["ca", "", "ES"]],
    ["x-private", ["", "", ""]],
  ] as const) {
    const tag = new LanguageTag(input),
      language = unicode("old"),
      script = unicode("old"),
      country = unicode("old");
    tag.getIsoLanguageScriptCountry(language, script, country);
    expect([text(language), text(script), text(country)]).toEqual(expected);
    tag.assign(tag);
    const assigned = new LanguageTag().assign(tag);
    tag.reset("de-DE");
    expect(text(assigned.getBcp47())).toBe(input);
  }
  expect(text(new LanguageTag(1034).getBcp47MS())).toBe("es-ES_tradnl");
  expect(text(new LanguageTag("de-DE").getBcp47MS())).toBe("de-DE");
});

// Literal complete native ISO branch outputs,including legacy branches remapped by the enclosing owner.
for (const [language, country, expected] of [
  ["zh", "HK", ["zh-HK", "zh-TW", "zh"]],
  ["zh", "MO", ["zh-MO", "zh-TW", "zh"]],
  ["zh", "SG", ["zh-SG", "zh-CN", "zh"]],
  ["zh", "CN", ["zh-CN", "zh"]],
  ["sh", "RS", ["sh-RS", "sr-Latn-RS", "sr-Latn", "sh", "sr-RS", "sr"]],
  ["ca", "XV", ["ca-XV", "ca-ES-valencia", "ca-XV", "ca-valencia", "ca-ES", "ca"]],
  ["ku", "TR", ["ku-TR", "kmr-Latn-TR", "kmr-TR", "kmr-Latn", "kmr", "ku"]],
  ["ku", "SY", ["ku-SY", "kmr-Latn-SY", "kmr-SY", "kmr-Latn", "kmr", "ku"]],
  ["ku", "IQ", ["ku-IQ", "ckb-IQ", "ckb"]],
  ["ku", "IR", ["ku-IR", "ckb-IR", "ckb"]],
  ["ku", "DE", ["ku-DE"]],
  ["kmr", "TR", ["kmr-TR", "ku-Latn-TR", "ku-TR", "kmr", "ku"]],
  ["kmr", "SY", ["kmr-SY", "ku-Latn-SY", "ku-SY", "kmr", "ku"]],
  ["kmr", "DE", ["kmr-DE", "kmr"]],
  ["ckb", "IQ", ["ckb-IQ", "ku-Arab-IQ", "ku-IQ", "ckb"]],
  ["ckb", "IR", ["ckb-IR", "ku-Arab-IR", "ku-IR", "ckb"]],
  ["ckb", "DE", ["ckb-DE", "ckb"]],
  ["sh", "", ["sh", "sr-Latn", "sr"]],
  ["pli", "", ["pli", "pi-Latn", "pi"]],
  ["de", "", ["de"]],
] as const)
  it(`preserves native ISO fallback order ${language}/${country}`, /** Tests the complete extracted source ISO responsibility using its consumed fields. @returns Nothing. */ () => {
    expect(getIsoFallbackStrings(language, country, true)).toEqual(expected);
    expect(getIsoFallbackStrings(language, country, false)).toEqual(expected.slice(1));
  });
