/** @fileoverview Transliteration cascade for the represented case, width, Japanese and CTL modules, with native bounded offset composition. */
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { TransliterationFlags } from "../../../i18nutil/inc/transliteration";
import type { LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { ignoreDiacritics_CTL } from "./ignoreDiacritics_CTL";
import { ignoreKashida_CTL } from "./ignoreKashida_CTL";
import { ignoreWidth } from "./ignoreWidth";
import { transliterateCaseFolding } from "./transliteration_caseignore";

import type { transliteration_Ignore } from "./transliteration_Ignore";
import { ignoreKana } from "./ignoreKana";
import { ignoreTraditionalKanji_ja_JP } from "./ignoreTraditionalKanji_ja_JP";
import { ignoreTraditionalKana_ja_JP } from "./ignoreTraditionalKana_ja_JP";
import { ignoreMinusSign_ja_JP } from "./ignoreMinusSign_ja_JP";
import { ignoreIterationMark_ja_JP } from "./ignoreIterationMark_ja_JP";
import { ignoreSeparator_ja_JP } from "./ignoreSeparator_ja_JP";
import { ignoreSize_ja_JP } from "./ignoreSize_ja_JP";
import { ignoreMiddleDot_ja_JP } from "./ignoreMiddleDot_ja_JP";
import { ignoreSpace_ja_JP } from "./ignoreSpace_ja_JP";
import { ignoreZiZu_ja_JP } from "./ignoreZiZu_ja_JP";
import { ignoreBaFa_ja_JP } from "./ignoreBaFa_ja_JP";
import { ignoreTiJi_ja_JP } from "./ignoreTiJi_ja_JP";
import { ignoreHyuByu_ja_JP } from "./ignoreHyuByu_ja_JP";
import { ignoreSeZe_ja_JP } from "./ignoreSeZe_ja_JP";
import { ignoreIandEfollowedByYa_ja_JP } from "./ignoreIandEfollowedByYa_ja_JP";
import { ignoreKiKuFollowedBySa_ja_JP } from "./ignoreKiKuFollowedBySa_ja_JP";
import { ignoreProlongedSoundMark_ja_JP } from "./ignoreProlongedSoundMark_ja_JP";

// TMlist order, followed by the two TransliterationModulesExtra entries.
const modulesInLoadOrder: readonly (readonly [number, new () => transliteration_Ignore])[] = [
  [TransliterationFlags.IGNORE_WIDTH, ignoreWidth],
  [TransliterationFlags.IGNORE_KANA, ignoreKana],
  [TransliterationFlags.ignoreTraditionalKanji_ja_JP, ignoreTraditionalKanji_ja_JP],
  [TransliterationFlags.ignoreTraditionalKana_ja_JP, ignoreTraditionalKana_ja_JP],
  [TransliterationFlags.ignoreMinusSign_ja_JP, ignoreMinusSign_ja_JP],
  [TransliterationFlags.ignoreIterationMark_ja_JP, ignoreIterationMark_ja_JP],
  [TransliterationFlags.ignoreSeparator_ja_JP, ignoreSeparator_ja_JP],
  [TransliterationFlags.ignoreSize_ja_JP, ignoreSize_ja_JP],
  [TransliterationFlags.ignoreMiddleDot_ja_JP, ignoreMiddleDot_ja_JP],
  [TransliterationFlags.ignoreSpace_ja_JP, ignoreSpace_ja_JP],
  [TransliterationFlags.ignoreZiZu_ja_JP, ignoreZiZu_ja_JP],
  [TransliterationFlags.ignoreBaFa_ja_JP, ignoreBaFa_ja_JP],
  [TransliterationFlags.ignoreTiJi_ja_JP, ignoreTiJi_ja_JP],
  [TransliterationFlags.ignoreHyuByu_ja_JP, ignoreHyuByu_ja_JP],
  [TransliterationFlags.ignoreSeZe_ja_JP, ignoreSeZe_ja_JP],
  [TransliterationFlags.ignoreIandEfollowedByYa_ja_JP, ignoreIandEfollowedByYa_ja_JP],
  [TransliterationFlags.ignoreKiKuFollowedBySa_ja_JP, ignoreKiKuFollowedBySa_ja_JP],
  [TransliterationFlags.ignoreProlongedSoundMark_ja_JP, ignoreProlongedSoundMark_ja_JP],
  [TransliterationFlags.IGNORE_DIACRITICS_CTL, ignoreDiacritics_CTL],
  [TransliterationFlags.IGNORE_KASHIDA_CTL, ignoreKashida_CTL],
];

/** Supported simple and complex native ignore flags. */
export const supportedTransliteration = modulesInLoadOrder.reduce(
  /** Combines registered ignore bits. @param mask - Accumulated bits. @param entry - Module flag and constructor. @returns Supported mask. */ (
    mask,
    [flag],
  ) => mask | flag,
  TransliterationFlags.IGNORE_CASE as number,
);

const TransliterationOffsets = Sequence.specialize<[number]>("sal_Int32", 4);

/** Applies the represented cascade in TransliterationImpl::loadModule order. @param text - Untransformed input. @param start - Original start. @param count - Original UTF-16 length. @param flags - Represented native transliteration flags. @param locale - Search locale. @param withOffsets - Whether to keep the original positions. @returns Transformed value and optional offset map. */
export function transliterate(
  text: OUStringConstReference,
  start: number,
  count: number,
  flags: number,
  locale: LocaleConstReference,
  withOffsets: boolean,
): { text: OUString; offsets?: readonly number[] } {
  const caseFold = (flags & TransliterationFlags.IGNORE_CASE) !== 0;
  if (flags === TransliterationFlags.IGNORE_CASE)
    return transliterateCaseFolding(text, start, count, locale);

  // The native cascade transliterates a bounded copy before composing its maps.
  let value = new OUString(text.getStr().subarray(start, start + count), count);
  let offsets: readonly number[] | undefined;
  const modules: transliteration_Ignore[] = [];
  for (const [flag, Module] of modulesInLoadOrder)
    if ((flags & flag) !== 0) modules.push(new Module());
  try {
    if (caseFold) {
      const folded = transliterateCaseFolding(value, 0, value.getLength(), locale);
      value.dispose();
      value = folded.text;
      offsets = folded.offsets;
    }
    for (const module of modules) {
      const from = withOffsets ? new TransliterationOffsets() : null;
      try {
        const result =
          from === null
            ? module.transliterateString2String(value, 0, value.getLength())
            : module.transliterate(value, 0, value.getLength(), from);
        value.dispose();
        value = result;
        if (from !== null) {
          const composed: number[] = [];
          for (let index = 0; index < from.getLength(); index++) {
            const position = from.operatorIndex(index)[0];
            composed.push(offsets === undefined ? position : (offsets[position] as number));
          }
          offsets = composed;
        }
      } finally {
        from?.dispose();
      }
    }
    return offsets === undefined || !withOffsets
      ? { text: value }
      : {
          text: value,
          offsets: offsets.map(
            /** Rebases the cascade position. @param offset - Offset in the bounded copy. @returns Original coordinate. */ (
              offset,
            ) => offset + start,
          ),
        };
  } catch (error) {
    value.dispose();
    throw error;
  } finally {
    for (const module of modules) module.dispose();
  }
}
