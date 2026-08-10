/** @fileoverview Defines pure browser locale normalization, message catalog fallback, and placeholder interpolation without UI or translation-corpus coupling. */

/** Describes immutable messages indexed by stable application message identifiers. */
export type MessageCatalog = Readonly<Record<string, string>>;
/** Describes immutable catalogs indexed by canonical locale tags. */
export type LocaleCatalogs = Readonly<Record<string, MessageCatalog>>;
/**
 * Normalizes a BCP 47 locale tag to its canonical browser representation.
 * @param locale - Candidate locale tag without mutation.
 * @returns Canonical locale tag.
 * @throws {RangeError} When locale is not a valid BCP 47 language tag.
 */
export function normalizeLocale(locale: string): string {
  return new Intl.Locale(locale).toString();
}
/**
 * Resolves one message through exact locale, language-only, then default catalog fallback.
 * @param catalogs - Immutable locale catalogs inspected without mutation.
 * @param locale - Candidate locale normalized before lookup.
 * @param defaultLocale - Required final fallback locale normalized before lookup.
 * @param messageId - Stable message identifier returned unchanged when absent.
 * @returns Resolved template or messageId when every catalog lacks it.
 */
export function resolveMessage(
  catalogs: LocaleCatalogs,
  locale: string,
  defaultLocale: string,
  messageId: string,
): string {
  const normalizedLocale = normalizeLocale(locale);
  const normalizedDefault = normalizeLocale(defaultLocale);
  const language = new Intl.Locale(normalizedLocale).language;
  return (
    catalogs[normalizedLocale]?.[messageId] ??
    catalogs[language]?.[messageId] ??
    catalogs[normalizedDefault]?.[messageId] ??
    messageId
  );
}
/**
 * Replaces every `{name}` placeholder whose key occurs in values.
 * @param template - Resolved message template inspected without mutation.
 * @param values - Immutable replacement values converted with String.
 * @returns Interpolated message, preserving unknown placeholders literally.
 */
export function interpolateMessage(
  template: string,
  values: Readonly<Record<string, string | number>>,
): string {
  return template.replace(
    /\{([A-Za-z][A-Za-z0-9_]*)\}/gu,
    /**
     * Replaces one known placeholder while retaining unknown template syntax.
     * @param whole - Complete matched placeholder retained when no value exists.
     * @param name - Placeholder key queried in values without mutation.
     * @returns Replacement text or the original placeholder.
     */
    function replacePlaceholder(whole, name): string {
      return values[name] === undefined ? whole : String(values[name]);
    },
  );
}
