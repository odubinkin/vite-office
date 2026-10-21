/** @fileoverview Complete generated locale catalogs,shared field regression,native fallback and actual Sequence string ownership. */
import { expect, it } from "vitest";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { rtl_uString_assign } from "../../../sal/inc/rtl/ustring.h";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { Sequence, asNonConstRange } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { TransliterationModulesNew } from "../../../offapi/com/sun/star/i18n/TransliterationModulesNew";
import {
  getLocaleTransliterations,
  getLocaleDecimalSeparator,
  getLocaleMeasurementSystem,
  getLocaleDecimalSeparatorAlternate,
  getLocaleThousandSeparator,
} from "./localedata";
import catalogs from "./data/transliterations.json";
import decimals from "./data/decimal-separators.json";
import measurements from "./data/measurement-systems.json";
import numeric from "./data/numeric-separators.json";
import source from "../transliteration/native-context-source-witnesses.json";
const Strings = Sequence.specialize<ReturnType<OUString["getDataAddress"]>>("OUString", 8);
/** Constructs real shared text. @param text - UTF16 text. @returns Owner. */
function u(text: string): OUString {
  const units = new Uint16Array(text.length);
  for (let i = 0; i < text.length; i++) units[i] = text.charCodeAt(i);
  return new OUString(units, units.length);
}
/** Constructs actual Locale while releasing temporary caller values. @param language - Language. @param country - Country. @param variant - Variant. @returns Locale. */
function locale(language: string, country = "", variant = ""): Locale {
  const l = u(language),
    c = u(country),
    v = u(variant);
  try {
    return new Locale(l, c, v);
  } finally {
    v.dispose();
    c.dispose();
    l.dispose();
  }
}
/** Reads only borrowed actual string units. @param value - Native value. @returns Text. */
function text(value: Pick<OUString, "getStr" | "getLength">): string {
  let out = "";
  for (let i = 0; i < value.getLength(); i++)
    out += String.fromCharCode(value.getStr()[i] as number);
  return out;
}
/** Observes and releases an owned Sequence. @param value - Owner. @returns Ordered names. */
function names(value: Sequence<ReturnType<OUString["getDataAddress"]>>): string[] {
  const out: string[] = [];
  try {
    for (let i = 0; i < value.getLength(); i++)
      out.push(text(OUString.unacquired(value.operatorIndex(i))));
    return out;
  } finally {
    value.dispose();
  }
}
it("retains the full IDL module enum,zero sentinel,reserved holes and generated size marker", /** Verifies source-defined context,locale or actual value contracts. @returns Assertion completion or source observation. */ () => {
  const rows = Object.entries(TransliterationModulesNew).filter(
    /** Verifies source-defined context,locale or actual value contracts. @param entry - Original source input. @returns Assertion completion or source observation. */ ([
      name,
      value,
    ]) => name !== "MAKE_FIXED_SIZE" && typeof value === "number",
  );
  expect(rows).toEqual(source.enumRows);
  expect(TransliterationModulesNew.MAKE_FIXED_SIZE).toBe(2147483647);
  expect(TransliterationModulesNew.END_OF_MODULE).toBe(0);
  expect(TransliterationModulesNew[57]).toBeUndefined();
  expect(TransliterationModulesNew[58]).toBeUndefined();
});
it("retains every locale's exact catalog order while preserving all existing locale fields", /** Verifies source-defined context,locale or actual value contracts. @returns Assertion completion or source observation. */ () => {
  expect(Object.keys(catalogs)).toHaveLength(284);
  expect(
    Object.keys(decimals).filter(
      /** Selects exact native registered locale names. @param name - Source locale. @returns Membership. */ (
        name,
      ) => !(name in catalogs),
    ),
  ).toEqual(["ti_ET"]);
  expect(Object.keys(catalogs)).toEqual(
    Object.keys(decimals).filter(
      /** Selects exact native registered locale names. @param name - Source locale. @returns Membership. */ (
        name,
      ) => name !== "ti_ET",
    ),
  );
  for (const name of Object.keys(catalogs) as (keyof typeof catalogs)[]) {
    const parts = name.split("_"),
      value =
        parts.length > 2
          ? locale("qlt", "", name.replaceAll("_", "-"))
          : locale(parts[0] as string, parts[1] ?? "");
    try {
      expect(names(getLocaleTransliterations(value))).toEqual(catalogs[name]);
      expect(getLocaleDecimalSeparator(value)).toBe(decimals[name]);
      expect(getLocaleMeasurementSystem(value)).toBe(measurements[name]);
      expect(getLocaleDecimalSeparatorAlternate(value)).toBe(numeric[name].alternate);
      expect(getLocaleThousandSeparator(value)).toBe(numeric[name].thousand);
    } finally {
      value.dispose();
    }
  }
});
it("uses the same real locale fallback for ordered catalog resources", /** Verifies source-defined context,locale or actual value contracts. @returns Assertion completion or source observation. */ () => {
  for (const [language, country, variant, key] of [
    ["ja", "", "", "ja_JP"],
    ["ja", "ZZ", "", "ja_JP"],
    ["qlt", "", "ja-JP-x-private", "ja_JP"],
    ["qlt", "", "x-private", "en_US"],
    ["zz", "ZZ", "", "en_US"],
    ["tlh", "", "", "en_US"],
    ["qlt", "", "zz-ZZ-x-private", "en_US"],
    ["kmr", "", "", "kmr_Latn_TR"],
    ["de", "ZZ", "", "de_DE"],
    ["qlt", "", "de-DE-x-private", "de_DE"],
  ] as const) {
    const value = locale(language, country, variant);
    try {
      expect(names(getLocaleTransliterations(value))).toEqual(catalogs[key]);
    } finally {
      value.dispose();
    }
  }
  const value = locale("kmr");
  try {
    expect(getLocaleDecimalSeparator(value)).toBe(decimals.kmr_Latn_TR);
  } finally {
    value.dispose();
  }
});
it("returns owned Sequence values and keeps source catalogs and shared copies independent", /** Verifies source-defined context,locale or actual value contracts. @returns Assertion completion or source observation. */ () => {
  const value = locale("en", "US"),
    first = getLocaleTransliterations(value),
    copy = new Strings(first),
    replacement = u("caller replacement");
  try {
    rtl_uString_assign(asNonConstRange(first).operatorIndex(0, 8), replacement.pData);
    expect(text(OUString.unacquired(copy.operatorIndex(0)))).toBe(catalogs.en_US[0]);
    expect(names(getLocaleTransliterations(value))).toEqual(catalogs.en_US);
    expect(text(OUString.unacquired(first.operatorIndex(0)))).toBe("caller replacement");
  } finally {
    replacement.dispose();
    copy.dispose();
    first.dispose();
    value.dispose();
  }
});

it("preserves existing ti_ET numeric resources while respecting the native catalog registration boundary", /** Existing fields remain while the new field follows aLibTable and native fallback. @returns Assertion completion. */ () => {
  const value = locale("ti", "ET");
  try {
    expect(getLocaleDecimalSeparator(value)).toBe(decimals.ti_ET);
    expect(getLocaleMeasurementSystem(value)).toBe(measurements.ti_ET);
    expect(getLocaleDecimalSeparatorAlternate(value)).toBe(numeric.ti_ET.alternate);
    expect(getLocaleThousandSeparator(value)).toBe(numeric.ti_ET.thousand);
    expect(names(getLocaleTransliterations(value))).toEqual(catalogs.en_US);
  } finally {
    value.dispose();
  }
});
