/** @fileoverview Shared browser binding for the configured/matched-family branch of native GetDefaultFont. Full physical substitution and Font attributes remain separate responsibilities. */
import {
  DefaultFontType,
  GetNextFontToken,
  GetEnglishSearchFontName,
} from "../../unotools/inc/fontdefs";
import { getConfiguredDefaultFont } from "../../unotools/source/config/fontcfg";
import { OUString, type OUStringConstReference } from "../../sal/inc/rtl/ustring";
import { Locale, type LocaleConstReference } from "../../udkapi/com/sun/star/lang/Locale";

import { decodeBrowserFontFamily } from "./font-family";

/** Generic role/locale boundary shared by Calc and Writer browser composition. */
export interface BrowserDefaultFontDevice {
  readonly getDefaultFont: (
    type: DefaultFontType,
    locale: LocaleConstReference,
  ) => string | undefined;
  readonly prepareDefaultFont: (
    type: DefaultFontType,
    locale: LocaleConstReference,
  ) => Promise<string | undefined>;
}
/** Actual registered browser family, grouped by original normalized search name. */
interface RegisteredFamily {
  readonly name: string;
  readonly faces: FontFace[];
}
/** Creates an actual Unicode value from logical UTF16 text. @param value - Text. @returns Value. */
function unicode(value: string): OUString {
  const units = new Uint16Array(value.length);
  for (let i = 0; i < value.length; i++) units[i] = value.charCodeAt(i);
  return new OUString(units, units.length);
}
/** Reads logical native text. @param value - Value. @returns Text. */
function text(value: OUStringConstReference): string {
  return String.fromCharCode(...value.getStr().subarray(0, value.getLength()));
}
/** Binds an already canonical browser BCP47 value to the genuine qlt Locale representation; performs no replacement LanguageTag canonicalization. @param tag - Canonical browser tag. @returns Original Locale value. */
export function createDefaultFontLocale(tag: string): Locale {
  const language = unicode("qlt"),
    country = new OUString(),
    variant = unicode(tag);
  const locale = new Locale(language, country, variant);
  language.dispose();
  country.dispose();
  variant.dispose();
  return locale;
}
/** Uses the real shared native normalization operation. @param units - Logical view. @returns Search key. */
function searchName(units: Uint16Array): string {
  const value = GetEnglishSearchFontName(units),
    result = text(value);
  value.dispose();
  return result;
}
/** Collects actual registered non-error faces; never treats CSS fallback checks as installed-font enumeration. @param fontSet - Real browser set. @returns Ephemeral family groups. */
function registeredFamilies(fontSet: FontFaceSet | undefined): Map<string, RegisteredFamily> {
  const families = new Map<string, RegisteredFamily>();
  fontSet?.forEach(
    /** Groups one browser face. @param face - Real face. @returns Nothing. */ (face) => {
      if (face.status === "error") return;
      const name = decodeBrowserFontFamily(face.family),
        value = unicode(name);
      const key = searchName(value.getStr().subarray(0, value.getLength()));
      value.dispose();
      if (!key) return;
      const previous = families.get(key);
      if (previous) previous.faces.push(face);
      else families.set(key, { name, faces: [face] });
    },
  );
  return families;
}
/** Preserves original candidate token order and normalized lookup keys. @param type - Role. @param locale - Prepared original locale. @returns Search keys. */
function candidateNames(type: DefaultFontType, locale: LocaleConstReference): string[] {
  const value = getConfiguredDefaultFont(locale, type),
    index = { value: 0 },
    result: string[] = [];
  const view = value.getStr().subarray(0, value.getLength());
  do {
    result.push(searchName(GetNextFontToken(view, index)));
  } while (index.value !== -1);
  value.dispose();
  return result;
}
/** Creates a generic configured-font device binding. Missing physical best-match/substitution is explicitly represented by absence, not a guessed installed font. @param document - Host font collection. @returns Shared device binding. */
export function createBrowserDefaultFontDevice(document: Document): BrowserDefaultFontDevice {
  return {
    /** Finds the first configured family with a successfully loaded face. @param type - Native role. @param locale - Prepared locale. @returns Family or absence. */
    getDefaultFont(type, locale) {
      const families = registeredFamilies(document.fonts);
      for (const name of candidateNames(type, locale)) {
        const family = families.get(name);
        if (
          family?.faces.some(
            /** Checks actual load state. @param face - Browser face. @returns Availability. */ (
              face,
            ) => face.status === "loaded",
          )
        )
          return family.name;
      }
      return undefined;
    },
    /** Loads registered candidate families before synchronous document construction. @param type - Native role. @param locale - Prepared locale. @returns First successfully loaded configured family or absence. */
    async prepareDefaultFont(type, locale) {
      const families = registeredFamilies(document.fonts);
      for (const name of candidateNames(type, locale)) {
        const family = families.get(name);
        if (!family) continue;
        const loaded = await Promise.all(
          family.faces.map(
            /** Loads one actual registered face; resource failure permits the next candidate. @param face - Browser face. @returns Successful load. */ async (
              face,
            ) => {
              try {
                await face.load();
                return face.status === "loaded";
              } catch {
                return false;
              }
            },
          ),
        );
        if (
          loaded.some(
            /** Selects loaded faces. @param value - Load result. @returns Same flag. */ (value) =>
              value,
          )
        )
          return family.name;
      }
      return undefined;
    },
  };
}
