/** @fileoverview Central browser locale selection and catalog-backed presentation strings. */

import {
  interpolateMessage,
  normalizeLocale,
  resolveMessage,
  type LocaleCatalogs,
} from "../../source/services/messages";

/** Locale service shared by every browser presentation surface. */
export class BrowserLocalizationService {
  public readonly locale: string;

  /** Creates a service with deterministic upstream-resource fallback. @param locale - Selected browser locale. @param catalogs - Optional translated catalogs. @param defaultLocale - Pinned resource locale. @returns Initialized service. */
  public constructor(
    locale: string,
    private readonly catalogs: LocaleCatalogs = {},
    private readonly defaultLocale = "en-US",
  ) {
    this.locale = normalizeLocale(locale);
  }

  /** Resolves a catalog entry, falling back to the pinned generated resource label. @param messageId - Stable message identity. @param fallback - Pinned resource text. @param values - Optional interpolation values. @returns Localized text. */
  public GetText(
    messageId: string,
    fallback: string,
    values: Readonly<Record<string, string | number>> = {},
  ): string {
    const resolved = resolveMessage(this.catalogs, this.locale, this.defaultLocale, messageId);
    return interpolateMessage(resolved === messageId ? fallback : resolved, values);
  }
}

/** Creates the one application locale service from the browser language preference. @param catalogs - Optional translated catalogs. @returns Browser localization service. */
export function createBrowserLocalizationService(
  catalogs: LocaleCatalogs = {},
): BrowserLocalizationService {
  return new BrowserLocalizationService(globalThis.navigator?.language ?? "en-US", catalogs);
}
