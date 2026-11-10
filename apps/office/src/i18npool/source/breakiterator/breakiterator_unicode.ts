/** @fileoverview Original LibreOffice Unicode dictionary rule selection and word-boundary queries. */
import type { ICULanguageBreakFactory } from "../../../external/icu/source/common/brkeng";
import { RuleBasedBreakIterator } from "../../../external/icu/source/common/rbbi";
import { text as localeString } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { decomposeCanonicalLanguageTag } from "../../../i18nlangtag/source/languagetag/languagetag";
import type { Boundary } from "../../../offapi/com/sun/star/i18n/Boundary";
import type { LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
import { getLocaleDataBreakIteratorRules } from "../localedata/localedata";
import { loadDictionaryWordRule, type DictionaryWordRule } from "./breakiterator_unicode.rules";

/** Native Unicode service shared by the locale-specific dictionary-word paths. */
export class BreakIterator_Unicode {
  private readonly cache = new Map<string, { iterator: RuleBasedBreakIterator; text: string }>();
  private lastLocale = "";
  private lastKey = "";
  private lastRule: DictionaryWordRule = "dict_word";

  /** Binds actual native word dictionaries. @param factory - Prepared ICU language factory. @returns Service. */
  constructor(private readonly factory: ICULanguageBreakFactory) {}

  /** Applies the original ICU word boundary, direction and DONE handling. @param text - Native UTF16 text. @param position - Original offset. @param locale - Native locale. @param direction - Forward or backward. @returns Native word range. */
  getWordBoundary(
    text: string,
    position: number,
    locale: LocaleConstReference,
    direction: boolean,
  ): Boundary {
    const iterator = this.loadICUBreakIterator(text, locale);
    let startPos: number, endPos: number;
    if (iterator.isBoundary(position)) {
      startPos = endPos = position;
      if ((direction || position === 0) && position < text.length)
        endPos = iterator.following(position);
      else startPos = iterator.preceding(position);
    } else if (position <= 0) {
      startPos = 0;
      endPos = text.length ? iterator.following(0) : 0;
    } else if (position >= text.length) {
      startPos = iterator.preceding(text.length);
      endPos = text.length;
    } else {
      startPos = iterator.preceding(position);
      endPos = iterator.following(position);
    }
    if (startPos === -1) startPos = endPos;
    else if (endPos === -1) endPos = startPos;
    return { startPos, endPos };
  }

  /** Looks up explicit, language-specific and original default word rules in order. @param text - Native text. @param locale - Native requested locale. @returns Cached original rule iterator. */
  private loadICUBreakIterator(text: string, locale: LocaleConstReference): RuleBasedBreakIterator {
    const language = localeString(locale.Language),
      country = localeString(locale.Country),
      variant = localeString(locale.Variant),
      localeKey = `${language};${country};${variant}`;
    if (localeKey !== this.lastLocale) {
      const override = getLocaleDataBreakIteratorRules(locale)[1];
      if (override) {
        if (
          override !== "dict_word" &&
          override !== "dict_word_hu" &&
          override !== "dict_word_prepostdash"
        )
          throw new Error(`Unexpected native dictionary word rule: ${override}`);
        this.lastRule = override;
        this.lastKey = `${localeKey};dict_word;1`;
      } else {
        const actualLanguage =
          language === "qlt" ? decomposeCanonicalLanguageTag(variant).language : language;
        const localized = actualLanguage === "hu";
        this.lastRule = localized ? "dict_word_hu" : "dict_word";
        this.lastKey = localized ? "hu;dict_word" : ";dict_word";
      }
      this.lastLocale = localeKey;
    }
    let entry = this.cache.get(this.lastKey);
    if (entry === undefined) {
      entry = {
        iterator: new RuleBasedBreakIterator(
          loadDictionaryWordRule(this.lastRule),
          text,
          this.factory,
        ),
        text,
      };
      this.cache.set(this.lastKey, entry);
    } else if (entry.text !== text) {
      entry.iterator.setText(text);
      entry.text = text;
    }
    return entry.iterator;
  }
}
