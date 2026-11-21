/** @fileoverview SearchOptions flags and commit semantics from unotools/source/config/searchopt.cxx. */
import { TransliterationFlags as T } from "../../../i18nutil/inc/transliteration";

/** Native config properties in flag order. */
export const searchOptionNames = [
  "IsWholeWordsOnly",
  "IsBackwards",
  "IsUseRegularExpression",
  "IsSearchForStyles",
  "IsSimilaritySearch",
  "IsUseAsianOptions",
  "IsMatchCase",
  "Japanese/IsMatchFullHalfWidthForms",
  "Japanese/IsMatchHiraganaKatakana",
  "Japanese/IsMatchContractions",
  "Japanese/IsMatchMinusDashCho-on",
  "Japanese/IsMatchRepeatCharMarks",
  "Japanese/IsMatchVariantFormKanji",
  "Japanese/IsMatchOldKanaForms",
  "Japanese/IsMatch_DiZi_DuZu",
  "Japanese/IsMatch_BaVa_HaFa",
  "Japanese/IsMatch_TsiThiChi_DhiZi",
  "Japanese/IsMatch_HyuIyu_ByuVyu",
  "Japanese/IsMatch_SeShe_ZeJe",
  "Japanese/IsMatch_IaIya",
  "Japanese/IsMatch_KiKu",
  "Japanese/IsIgnorePunctuation",
  "Japanese/IsIgnoreWhitespace",
  "Japanese/IsIgnoreProlongedSoundMark",
  "Japanese/IsIgnoreMiddleDot",
  "IsNotes",
  "IsIgnoreDiacritics_CTL",
  "IsIgnoreKashida_CTL",
  "IsSearchFormatted",
  "IsUseWildcard",
] as const;

/** Native property name in the SearchOptions config subtree. */
export type SearchOptionName = (typeof searchOptionNames)[number];

/** Typed values accepted by the SearchOptions configuration owner. */
export type SearchOptionProperties = Partial<Record<SearchOptionName, boolean>>;

/** ConfigItem property boundary used by the browser persistence adapter. */
export interface SearchOptionsConfiguration {
  readonly GetProperties: () => SearchOptionProperties;
  readonly PutProperties: (properties: SearchOptionProperties) => boolean;
}

const algorithms = ["IsUseRegularExpression", "IsSimilaritySearch", "IsUseWildcard"] as const;
const japaneseFlags = [
  T.IGNORE_WIDTH,
  T.IGNORE_KANA,
  T.ignoreSize_ja_JP,
  T.ignoreMinusSign_ja_JP,
  T.ignoreIterationMark_ja_JP,
  T.ignoreTraditionalKanji_ja_JP,
  T.ignoreTraditionalKana_ja_JP,
  T.ignoreZiZu_ja_JP,
  T.ignoreBaFa_ja_JP,
  T.ignoreTiJi_ja_JP,
  T.ignoreHyuByu_ja_JP,
  T.ignoreSeZe_ja_JP,
  T.ignoreIandEfollowedByYa_ja_JP,
  T.ignoreKiKuFollowedBySa_ja_JP,
  T.ignoreSeparator_ja_JP,
  T.ignoreSpace_ja_JP,
  T.ignoreProlongedSoundMark_ja_JP,
  T.ignoreMiddleDot_ja_JP,
] as const;

/** Native search option value, loaded from the shipped schema and the available user overrides. */
export class SvtSearchOptions {
  // Common.xcs supplies these values after the native ConfigItem loads the schema.
  private flags = 0x09ffff80;
  private modified = false;

  /** Loads the source flags in property order. @param configuration - User configuration boundary. @returns Options. */
  public constructor(private readonly configuration?: SearchOptionsConfiguration) {
    const values = configuration?.GetProperties();
    for (const name of searchOptionNames) {
      const value = values?.[name];
      if (typeof value === "boolean") this.Update(name, value);
    }
    this.modified = false;
  }

  /** Reads a source flag by its property name. @param name - Native property name. @returns Property value. */
  public GetFlag(name: SearchOptionName): boolean {
    return Boolean(this.flags & (1 << searchOptionNames.indexOf(name)));
  }

  /** Changes a property and preserves the native mutual exclusion of the three search algorithms. @param name - Native property name. @param value - New flag. @returns Nothing. */
  public SetFlag(name: SearchOptionName, value: boolean): void {
    if (
      value &&
      algorithms.some(
        /** Finds the original algorithm switches. @param algorithm - Candidate. @returns Whether this is an algorithm. */
        (algorithm) => algorithm === name,
      )
    )
      for (const algorithm of algorithms) if (algorithm !== name) this.Update(algorithm, false);
    this.Update(name, value);
  }

  /** Updates the stored flag without applying algorithm selection rules during load. @param name - Native property name. @param value - New flag. @returns Nothing. */
  private Update(name: SearchOptionName, value: boolean): void {
    const mask = 1 << searchOptionNames.indexOf(name);
    const flags = value ? this.flags | mask : this.flags & ~mask;
    if (flags === this.flags) return;
    this.flags = flags;
    this.modified = true;
  }

  /** Saves the native property group and clears its dirty state only after a successful write. @returns Nothing. */
  public Commit(): void {
    if (!this.modified || this.configuration === undefined) return;
    const values: SearchOptionProperties = {};
    for (const name of searchOptionNames) values[name] = this.GetFlag(name);
    if (this.configuration.PutProperties(values)) this.modified = false;
  }

  /** Reads the configured Japanese transformations independently of the Asian master switch. @returns Japanese transformation flags. */
  public GetJapaneseTransliterationFlags(): number {
    let result = 0;
    for (const [index, flag] of japaneseFlags.entries()) {
      const name = searchOptionNames[index + 7];
      if (name !== undefined && this.GetFlag(name)) result |= flag;
    }
    return result;
  }

  /** Computes the original option mask including basic and CTL flags. @returns Transliteration mask. */
  public GetTransliterationFlags(): number {
    return (
      this.GetJapaneseTransliterationFlags() |
      (this.GetFlag("IsMatchCase") ? 0 : T.IGNORE_CASE) |
      (this.GetFlag("IsIgnoreDiacritics_CTL") ? T.IGNORE_DIACRITICS_CTL : 0) |
      (this.GetFlag("IsIgnoreKashida_CTL") ? T.IGNORE_KASHIDA_CTL : 0)
    );
  }
}
