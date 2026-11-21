/** @fileoverview Native language-list admission and editable LanguageTag resolution for SvxLanguageBox. */
import { LANGUAGE_NONE, LANGUAGE_SYSTEM, LANGUAGE_DONTKNOW } from "../../../i18nlangtag/inc/lang";
import { LanguageTag } from "../../../i18nlangtag/inc/languagetag";
import {
  getReplacementForObsoleteLanguage,
  isLegacy,
} from "../../../i18nlangtag/source/isolang/mslangid";
import {
  getScriptType,
  resolveSystemLanguageByScriptType,
} from "../../../i18nlangtag/source/isolang/mslangid.script";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { getLanguageName, languageEntries } from "../../../svtools/source/misc/langtab";

const specialLanguages = [LANGUAGE_NONE, 0xffef, 0xfff0, LANGUAGE_SYSTEM] as const;

/** Resolves a fixed language resource or the native tag of a dynamically registered language. @param language - Native LanguageType. @returns The source resource or tag. */
export function describeLanguage(language: number): string {
  const known = getLanguageName(language);
  if (known !== undefined) return known;
  const tag = new LanguageTag(language);
  try {
    return text(tag.getBcp47(false));
  } finally {
    tag.dispose();
  }
}

/** Enumerates available native language IDs for the selected script. @param script - Native i18n script type. @returns Special choices and eligible source entries. */
export function getLanguageChoices(
  script: number,
): readonly Readonly<{ id: number; name: string }>[] {
  const result = specialLanguages.map(
    /** Projects the special entries before the source table. @param id - Language ID. @returns Display row. */
    (id) => ({
      id,
      name:
        id === LANGUAGE_SYSTEM
          ? `${describeLanguage(id)} - ${describeLanguage(resolveSystemLanguageByScriptType(id, script))}`
          : describeLanguage(id),
    }),
  );
  const seen = new Set<number>(specialLanguages);
  for (const [candidate] of languageEntries) {
    if (
      candidate === LANGUAGE_DONTKNOW ||
      candidate === 0x0666 ||
      candidate >>> 10 === 0 ||
      candidate >= 0xffe0 ||
      isLegacy(candidate) ||
      getScriptType(candidate) !== script
    )
      continue;
    const id = getReplacementForObsoleteLanguage(candidate);
    if (seen.has(id)) continue;
    seen.add(id);
    result.push({ id, name: describeLanguage(id) });
  }
  return result;
}

/** Resolves a valid typed language through the actual native registry. @param value - Typed BCP47 tag. @returns Native language ID if the tag is valid and representable. */
export function resolveEditedLanguage(value: string): number | undefined {
  if (value.trim() === "") return undefined;
  const tag = new LanguageTag(value.trim());
  try {
    if (!tag.isValidBcp47()) return undefined;
    const id = tag.getLanguageType();
    return id === LANGUAGE_DONTKNOW ? undefined : getReplacementForObsoleteLanguage(id);
  } finally {
    tag.dispose();
  }
}

/** Sorts ordinary language rows in their native language groups. @param choices - Localized rows without special entries. @param locale - Current UI locale. @returns Ordered rows with each generic language before its variants. */
export function sortLanguageChoices(
  choices: readonly Readonly<{ id: number; name: string }>[],
  locale: string,
): readonly Readonly<{ id: number; name: string }>[] {
  /** Retains the generic-language flag for comparison within each group. */
  type Row = Readonly<{ id: number; name: string; generic: boolean }>;
  const groups = new Map<string, Row[]>();
  for (const choice of choices) {
    const tag = new LanguageTag(choice.id);
    const nativeLanguage = tag.getLanguage();
    const country = tag.getCountry();
    try {
      const language = text(nativeLanguage);
      const generic = tag.isIsoLocale() && country.getLength() === 0;
      const group = groups.get(language) ?? [];
      group.push({ ...choice, generic });
      groups.set(language, group);
    } finally {
      nativeLanguage.dispose();
      country.dispose();
      tag.dispose();
    }
  }
  const collator = new Intl.Collator(locale, { numeric: true });
  const names = new Intl.DisplayNames(locale, { type: "language" });
  return [...groups]
    .map(
      /** Pairs each language group with the browser's localized language name. @param entry - Language ID and variants. @returns Sortable group. */
      ([language, rows]) => {
        let localized = language;
        try {
          localized = names.of(language) ?? language;
        } catch (error) {
          if (!(error instanceof RangeError)) throw error;
        }
        return { key: localized + "_" + language, rows };
      },
    )
    .sort(
      /** Orders the groups using the localized generic names. @param a - First group. @param b - Second group. @returns Ordering. */
      (a, b) => collator.compare(a.key, b.key),
    )
    .flatMap(
      /** Orders the variants inside a single language. @param group - Language group. @returns Sorted rows. */
      ({ rows }) =>
        rows.sort(
          /** Places source generic language rows first. @param a - First row. @param b - Second row. @returns Ordering. */
          (a, b) => Number(b.generic) - Number(a.generic) || collator.compare(a.name, b.name),
        ),
    );
}
