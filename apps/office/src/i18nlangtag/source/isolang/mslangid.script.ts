/** @fileoverview Native static language script classification and configured fallback resolution consumed by Calc defaults; on-the-fly LanguageTag registration remains unsupported. */
import { getRealLanguage } from "./mslangid";
import { LANGUAGE_NONE, LANGUAGE_SYSTEM, LanguageType, primary } from "../../inc/lang";
/** Native css::i18n::ScriptType scalar values. */
export const ScriptType = { WEAK: 0, LATIN: 1, ASIAN: 2, COMPLEX: 3 } as const;
const complexLanguages = new Set([
  0x0c50, // LANGUAGE_MONGOLIAN_MONGOLIAN_MONGOLIA
  0x0850, // LANGUAGE_MONGOLIAN_MONGOLIAN_CHINA
  0x7c50, // LANGUAGE_MONGOLIAN_MONGOLIAN_LSO
  0x1226, // LANGUAGE_USER_KURDISH_IRAN
  0x0e26, // LANGUAGE_OBSOLETE_USER_KURDISH_IRAQ
  0x0492, // LANGUAGE_KURDISH_ARABIC_IRAQ
  0x7c92, // LANGUAGE_KURDISH_ARABIC_LSO
  0x8492, // LANGUAGE_USER_KURDISH_SOUTHERN_IRAN
  0x8092, // LANGUAGE_USER_KURDISH_SOUTHERN_IRAQ
  0x0668, // LANGUAGE_USER_KYRGYZ_CHINA
  0x800e, // LANGUAGE_USER_HUNGARIAN_ROVAS
  0x069a, // LANGUAGE_USER_MANCHU
  0x069b, // LANGUAGE_USER_XIBE
  0x803e, // LANGUAGE_USER_MALAY_ARABIC_MALAYSIA
  0x843e, // LANGUAGE_USER_MALAY_ARABIC_BRUNEI
  0x06b1, // LANGUAGE_USER_ROHINGYA_HANIFI
  0x0a67, // LANGUAGE_USER_PALI_THAI
]);
const westernLanguages = new Set([
  0x0450, // LANGUAGE_MONGOLIAN_CYRILLIC_MONGOLIA
  0x7850, // LANGUAGE_MONGOLIAN_CYRILLIC_LSO
  0x0a26, // LANGUAGE_USER_KURDISH_SYRIA
  0x0626, // LANGUAGE_USER_KURDISH_TURKEY
]);
const asianPrimaries = new Set([
  0x0004, // LANGUAGE_CHINESE
  0x008e, // LANGUAGE_YUE_CHINESE_HONGKONG
  0x0011, // LANGUAGE_JAPANESE
  0x0012, // LANGUAGE_KOREAN
]);
const complexPrimaries = new Set([
  0x005e, // LANGUAGE_AMHARIC_ETHIOPIA
  0x0001, // LANGUAGE_ARABIC_SAUDI_ARABIA
  0x004d, // LANGUAGE_ASSAMESE
  0x0045, // LANGUAGE_BENGALI
  0x0055, // LANGUAGE_BURMESE
  0x0065, // LANGUAGE_DHIVEHI
  0x0029, // LANGUAGE_FARSI
  0x0047, // LANGUAGE_GUJARATI
  0x000d, // LANGUAGE_HEBREW
  0x0039, // LANGUAGE_HINDI
  0x004b, // LANGUAGE_KANNADA
  0x0060, // LANGUAGE_KASHMIRI
  0x0053, // LANGUAGE_KHMER
  0x0057, // LANGUAGE_KONKANI
  0x0054, // LANGUAGE_LAO
  0x004c, // LANGUAGE_MALAYALAM
  0x0058, // LANGUAGE_MANIPURI
  0x004e, // LANGUAGE_MARATHI
  0x0061, // LANGUAGE_NEPALI
  0x0048, // LANGUAGE_ODIA
  0x0046, // LANGUAGE_PUNJABI
  0x004f, // LANGUAGE_SANSKRIT
  0x0059, // LANGUAGE_SINDHI
  0x005b, // LANGUAGE_SINHALESE_SRI_LANKA
  0x005a, // LANGUAGE_SYRIAC
  0x0049, // LANGUAGE_TAMIL
  0x004a, // LANGUAGE_TELUGU
  0x001e, // LANGUAGE_THAI
  0x0051, // LANGUAGE_TIBETAN
  0x0073, // LANGUAGE_TIGRIGNA_ETHIOPIA
  0x0080, // LANGUAGE_UIGHUR_CHINA
  0x0020, // LANGUAGE_URDU_INDIA
  0x0243, // LANGUAGE_USER_BODO_INDIA
  0x0244, // LANGUAGE_USER_DOGRI_INDIA
  0x0257, // LANGUAGE_USER_LIMBU
  0x0245, // LANGUAGE_USER_MAITHILI_INDIA
  0x0286, // LANGUAGE_USER_NKO
  0x02b0, // LANGUAGE_USER_SARAIKI
  0x003d, // LANGUAGE_YIDDISH
]);

/** Classifies static language identities in original exception/primary order. The native single-entry cache is an omitted optimization. @param language - Native ID. @returns Native script type. */
export function getScriptType(language: number): number {
  language = LanguageType(language);
  if (complexLanguages.has(language)) return ScriptType.COMPLEX;
  if (westernLanguages.has(language)) return ScriptType.LATIN;
  const p = primary(language);
  if (asianPrimaries.has(p)) return ScriptType.ASIAN;
  if (complexPrimaries.has(p)) return ScriptType.COMPLEX;
  const sub = language >>> 10;
  if (p >= 0x03e0 && p <= 0x03fe && sub >= 1 && sub <= 0x3e)
    throw new Error("On-the-fly LanguageTag script registration is not implemented");
  return ScriptType.LATIN;
}
const fallbacks = [LANGUAGE_SYSTEM, LANGUAGE_SYSTEM, LANGUAGE_SYSTEM, LANGUAGE_SYSTEM];
/** Original western fallback assignment. @param language - Native ID. @returns Nothing. */
export function setConfiguredWesternFallback(language: number): void {
  fallbacks[ScriptType.LATIN] = LanguageType(language);
}
/** Original Asian fallback assignment. @param language - Native ID. @returns Nothing. */
export function setConfiguredAsianFallback(language: number): void {
  fallbacks[ScriptType.ASIAN] = LanguageType(language);
}
/** Original complex fallback assignment. @param language - Native ID. @returns Nothing. */
export function setConfiguredComplexFallback(language: number): void {
  fallbacks[ScriptType.COMPLEX] = LanguageType(language);
}
/** Resolves configured/system language using source script defaults (US English, Simplified Chinese, Hindi). @param language - Native configured ID. @param script - Native script. @returns Resolved ID. */
export function resolveSystemLanguageByScriptType(language: number, script: number): number {
  language = LanguageType(language);
  if (language === LANGUAGE_NONE) return language;
  language = getRealLanguage(language);
  if (script !== ScriptType.WEAK && getScriptType(language) !== script) {
    const target =
      script === ScriptType.ASIAN
        ? ScriptType.ASIAN
        : script === ScriptType.COMPLEX
          ? ScriptType.COMPLEX
          : ScriptType.LATIN;
    const configured = fallbacks[target] as number;
    return configured === LANGUAGE_SYSTEM
      ? target === ScriptType.ASIAN
        ? 0x0804
        : target === ScriptType.COMPLEX
          ? 0x0439
          : 0x0409
      : configured;
  }
  return language;
}
