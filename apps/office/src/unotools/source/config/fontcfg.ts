/** @fileoverview Source-backed default-font and MS substitution field bindings over the shipped VCL DefaultFonts resource. No fake configuration provider, LanguageTag class or output device. */
import substitutions from "./data/font-substitutions-ms.json" with { type: "json" };
import resources from "./data/default-fonts.json" with { type: "json" };
import { convertToBcp47 } from "../../../i18nlangtag/source/languagetag/languagetag.conversion";
import { DefaultFontType } from "../../inc/fontdefs";
import {
  getFallbackStrings,
  decomposeCanonicalLanguageTag,
} from "../../../i18nlangtag/source/languagetag/languagetag";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
const defaultFonts: Readonly<Record<string, string>> = resources.en;
const configuration: Readonly<Record<string, Readonly<Record<string, string>>>> = resources;
/** Converts a logical shared value without its trailing terminator. @param value - Shared Unicode value. @returns UTF16 text. */
function text(value: OUStringConstReference): string {
  let result = "";
  for (let i = 0; i < value.getLength(); i++)
    result += String.fromCharCode(value.getStr()[i] as number);
  return result;
}
/** Original configured lookup order using the already prepared native Locale representation of a LanguageTag. ISO fields must already be canonical; qlt carries the canonical full tag. Browser/system locale parsing is a separate responsibility. @param locale - Original shared Locale value. @param type - Default-font role. @returns Independent actual OUString containing candidates, empty for an unknown role. */
export function getConfiguredDefaultFont(
  locale: LocaleConstReference,
  type: DefaultFontType,
): OUString {
  const language = text(locale.Language),
    country = text(locale.Country),
    variant = text(locale.Variant);
  const key = DefaultFontType[type] ?? "";
  const tagValue = convertToBcp47(locale);
  let tag: string;
  try {
    tag = text(tagValue);
  } finally {
    tagValue.dispose();
  }
  let result = configuration[tag]?.[key] ?? "";
  if (!result) {
    if (language !== "qlt") {
      if (country) result = configuration[language]?.[key] ?? "";
    } else {
      for (const fallback of getFallbackStrings(decomposeCanonicalLanguageTag(variant))) {
        result = configuration[fallback]?.[key] ?? "";
        if (result) break;
      }
    }
  }
  if (!result) result = defaultFonts[key] ?? "";
  const units = new Uint16Array(result.length);
  for (let i = 0; i < result.length; i++) units[i] = result.charCodeAt(i);
  return new OUString(units, units.length);
}

/** Consumed original FontNameAttr fields; substitution weight/width/type are not admitted by this export-side configuration binding. */
export interface FontNameAttr {
  readonly Name: string;
  readonly MSSubstitutions: readonly string[];
}
/** Native substitution owner with its original fixed en language and lazy per-locale load. Shipped VCL configuration replaces component-provider access; no fake UNO configuration service is created. */
export class FontSubstConfiguration {
  private static instance: FontSubstConfiguration | undefined;
  private readonly m_aSubst = new Map<string, FontNameAttr[] | undefined>();
  /** Original construction enumerates configuration locale keys. @returns Configuration. */
  constructor() {
    for (const locale of Object.keys(substitutions)) this.m_aSubst.set(locale, undefined);
  }
  /** Original singleton accessor. @returns Actual configuration owner. */
  static get(): FontSubstConfiguration {
    return (this.instance ??= new FontSubstConfiguration());
  }
  /** Native vector filling skips empty semicolon tokens without trimming. @param value - Configured value. @returns Substitution vector. */
  private fillSubstVector(value: string): string[] {
    return value
      ? value
          .split(";")
          .filter(
            /** Original empty-token omission. @param token - Candidate. @returns Whether nonempty. */ (
              token,
            ) => token.length !== 0,
          )
      : [];
  }
  /** Native read-once locale lookup and strict Unicode sort. @param locale - Original BCP47 key. @returns Nothing. */
  private readLocaleSubst(locale: "en"): void {
    if (this.m_aSubst.get(locale) !== undefined) return;
    const attributes: FontNameAttr[] = [];
    this.m_aSubst.set(locale, attributes);
    const values: Readonly<Record<string, Readonly<Record<string, string>>>> = substitutions;
    for (const [Name, value] of Object.entries(values[locale] as Readonly<Record<string, string>>))
      attributes.push({ Name, MSSubstitutions: this.fillSubstVector(value) });
    attributes.sort(
      /** Native StrictStringSort uses Unicode comparison. @param left - Left record. @param right - Right record. @returns Ordering. */ (
        left,
        right,
      ) => Number(left.Name > right.Name) - Number(left.Name < right.Name),
    );
  }
  /** Original lower_bound followed by the asymmetric prefix/length checks. The prevalidated shipped en resource binds the provider lookup; missing-provider and unknown-locale paths are not admitted. Fixed en is the native constructor language; dynamic configuration and other FontNameAttr fields remain separate responsibilities. @param fontName - Native Unicode search value. @returns Borrowed record or null. */
  getSubstInfo(fontName: string): FontNameAttr | null {
    if (!fontName) return null;
    const search = fontName.replace(
      /[A-Z]/g,
      /** Original ASCII lower only. @param character - ASCII uppercase. @returns Lowercase. */ (
        character,
      ) => character.toLowerCase(),
    );
    for (const locale of ["en"] as const) {
      this.readLocaleSubst(locale);
      const attributes = this.m_aSubst.get(locale) as FontNameAttr[];
      let first = 0,
        count = attributes.length;
      while (count > 0) {
        const step = Math.trunc(count / 2),
          index = first + step;
        if ((attributes[index] as FontNameAttr).Name < search) {
          first = index + 1;
          count -= step + 1;
        } else count = step;
      }
      const found = attributes[first];
      if (found && found.Name.length <= search.length && search.startsWith(found.Name))
        return found;
    }
    return null;
  }
}
