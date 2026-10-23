/** @fileoverview Original unicode::formatPercent locale overrides over native JS Intl.NumberFormat. Actual prepared LanguageTag language/locale-ID fields are borrowed; no native LanguageTag or ICU service is fabricated. */
/** Original percent formatter divides the supplied percentage by100 before formatting, with source Spanish/Slovenian and German spacing overrides. Native JS supplies the ICU formatting operation. @param value - Percentage value, not a ratio. @param language - Actual language field. @param localeId - Actual prepared locale identifier. @returns Original formatted percentage. */
export function formatPercent(value: number, language: string, localeId: string): string {
  let formatted: string;
  try {
    formatted = new Intl.NumberFormat(language === "es" || language === "sl" ? "fr-FR" : localeId, {
      style: "percent",
    }).format(value / 100);
  } catch {
    return String(value) + "%";
  }
  return language === "de" ? formatted.replaceAll("\u00a0", "\u202f") : formatted;
}
