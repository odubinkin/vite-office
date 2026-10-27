/** @fileoverview Source-backed default-font and MS substitution field bindings over the shipped VCL DefaultFonts resource. No fake configuration provider, LanguageTag class or output device. */
import substitutions from "./data/font-substitutions.json" with { type: "json" };
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

import { ImplFontAttrs, type FontNameAttr } from "../../inc/fontcfg";
import { FontWeight, FontWidth } from "../../../tools/inc/fontenum";
import mapData from "./data/font-name-map.json";
export type { FontNameAttr } from "../../inc/fontcfg";
/** Actual shipped font field map, standing at the existing configuration-provider boundary. */
type FontConfigurationFields = Readonly<Record<string, string>>;

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
    const values: Readonly<Record<string, Readonly<Record<string, FontConfigurationFields>>>> =
      substitutions;
    for (const [Name, value] of Object.entries(
      values[locale] as Readonly<Record<string, FontConfigurationFields>>,
    ))
      attributes.push({
        Name,
        Substitutions: this.fillSubstVector(value.SubstFonts ?? ""),
        MSSubstitutions: this.fillSubstVector(value.SubstFontsMS ?? ""),
        Weight: FontSubstConfiguration.getSubstWeight(value, "FontWeight"),
        Width: FontSubstConfiguration.getSubstWidth(value, "FontWidth"),
        Type: FontSubstConfiguration.getSubstType(value, "FontType"),
      });
    attributes.sort(
      /** Native StrictStringSort uses Unicode comparison. @param left - Left record. @param right - Right record. @returns Ordering. */ (
        left,
        right,
      ) => Number(left.Name > right.Name) - Number(left.Name < right.Name),
    );
  }
  /** Original reverse enum-name search with unknown fallback and ASCII-only case folding. @param font - Shipped source field map. @param field - Original property name. @returns Weight. */
  private static getSubstWeight(font: FontConfigurationFields, field: string): FontWeight {
    const value = (font[field] ?? "").replace(/[A-Z]/g, (character) => character.toLowerCase());
    for (let index = mapData.weightNames.length - 1; index >= 0 && value; --index) {
      const [name, weight] = mapData.weightNames[index] as [string, number];
      if (value === name) return weight;
    }
    return FontWeight.WEIGHT_DONTKNOW;
  }
  /** Original reverse width-name search and unknown fallback. @param font - Shipped source field map. @param field - Original property name. @returns Width. */
  private static getSubstWidth(font: FontConfigurationFields, field: string): FontWidth {
    const value = (font[field] ?? "").replace(/[A-Z]/g, (character) => character.toLowerCase());
    for (let index = mapData.widthNames.length - 1; index >= 0 && value; --index) {
      const [name, width] = mapData.widthNames[index] as [string, number];
      if (value === name) return width;
    }
    return FontWidth.WIDTH_DONTKNOW;
  }
  /** Original comma tokens are matched without trimming; unknown attributes do not set a bit. @param font - Shipped source field map. @param field - Original property name. @returns Unsigned32 mask. */
  private static getSubstType(font: FontConfigurationFields, field: string): ImplFontAttrs {
    let result = 0;
    for (const token of (font[field] ?? "").split(",")) {
      const key = token.replace(/[A-Z]/g, (character) => character.toLowerCase());
      const index = mapData.typeNames.indexOf(key);
      if (index !== -1) result = (result | (1 << index)) >>> 0;
    }
    return result;
  }
  /** Original ordered vendor stripping and first weight/width/type heuristics. Reference slots retain source inout semantics and defaults; the discarded final digit-removal buffer is preserved. @param original - Prepared search name. @param shortName - Output short name. @param familyName - Output family name. @param weight - Inout weight. @param width - Inout width. @param type - Output unsigned32 flags. @returns Nothing. */
  static getMapName(
    original: string,
    shortName: [string],
    familyName: [string],
    weight: [FontWeight],
    width: [FontWidth],
    type: [ImplFontAttrs],
  ): void {
    shortName[0] = original;
    for (const leading of mapData.leading) {
      if (leading === null) break;
      if (shortName[0].startsWith(leading)) {
        shortName[0] = shortName[0].slice(leading.length);
        break;
      }
    }
    // Source Baekmuk handling follows the ASCII loop only when no leading entry matched.
    if (
      shortName[0] === original &&
      original.charCodeAt(0) === 0xbc31 &&
      original.charCodeAt(1) === 0xbc35
    )
      shortName[0] = original.slice(original.charCodeAt(2) === 32 ? 3 : 2);
    for (const trailing of mapData.trailing) {
      if (trailing === null) break;
      if (trailing.length < shortName[0].length && shortName[0].endsWith(trailing)) {
        shortName[0] = shortName[0].slice(0, -trailing.length);
        break;
      }
    }
    for (let index = 0; mapData.exceptions[index] !== null; ++index) {
      const suffix = mapData.exceptions[index] as string;
      if (suffix.length < shortName[0].length && shortName[0].endsWith(suffix)) {
        let excepted = false;
        while (mapData.exceptions[++index] !== null) {
          const exception = mapData.exceptions[index] as string;
          if (exception.length < shortName[0].length && shortName[0].endsWith(exception))
            excepted = true;
        }
        if (!excepted) shortName[0] = shortName[0].slice(0, -suffix.length);
        break;
      }
      while (mapData.exceptions[++index] !== null) {
        /* Original exception group skip. */
      }
    }
    familyName[0] = shortName[0];
    for (const [needle, value] of mapData.weight as [string, FontWeight][]) {
      const position = familyName[0].indexOf(needle);
      if (position < 0) continue;
      familyName[0] =
        familyName[0].slice(0, position) + familyName[0].slice(position + needle.length);
      if (weight[0] === FontWeight.WEIGHT_DONTKNOW || weight[0] === FontWeight.WEIGHT_NORMAL)
        weight[0] = value;
      break;
    }
    for (const [needle, value] of mapData.width as [string, FontWidth][]) {
      const position = familyName[0].indexOf(needle);
      if (position < 0) continue;
      familyName[0] =
        familyName[0].slice(0, position) + familyName[0].slice(position + needle.length);
      if (width[0] === FontWidth.WIDTH_DONTKNOW || width[0] === FontWidth.WIDTH_NORMAL)
        width[0] = value;
      break;
    }
    type[0] = ImplFontAttrs.None;
    for (const [needle, value] of mapData.type as [string, ImplFontAttrs][]) {
      const position = familyName[0].indexOf(needle);
      if (position < 0) continue;
      familyName[0] =
        familyName[0].slice(0, position) + familyName[0].slice(position + needle.length);
      type[0] = (type[0] | value) >>> 0;
    }
    // Source removes digits from a local OUStringBuffer but never assigns it back to rFamilyName (WRITER189).
  }
  /** Original lower_bound followed by the asymmetric prefix/length checks. The prevalidated shipped en resource binds the provider lookup; missing-provider and unknown-locale paths are not admitted. Fixed en is the native constructor language; dynamic configuration remains a separate responsibility. @param fontName - Native Unicode search value. @returns Borrowed record or null. */
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
