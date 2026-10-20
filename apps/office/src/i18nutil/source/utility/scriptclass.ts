/** @fileoverview Original compatibility-block-first GetScriptClass over pinned ICU78.3 properties,without host Unicode classification. */
import { UBlockCode as B, UProperty } from "../../../external/icu/source/common/unicode/uchar";
import { u_getIntPropertyValue } from "../../../external/icu/source/common/uprops";
import { ublock_getCode } from "../../../external/icu/source/common/uchar";
import type { UScriptCode } from "../../../external/icu/source/common/unicode/uscript";
import * as S from "../../../offapi/com/sun/star/i18n/ScriptType";
import { unicode } from "./unicode";
/** Original ordered legacy block ranges. */
const scriptList = [
  [B.UBLOCK_NO_BLOCK, B.UBLOCK_NO_BLOCK, S.WEAK],
  [B.UBLOCK_BASIC_LATIN, B.UBLOCK_SPACING_MODIFIER_LETTERS, S.LATIN],
  [B.UBLOCK_GREEK, B.UBLOCK_ARMENIAN, S.LATIN],
  [B.UBLOCK_HEBREW, B.UBLOCK_MYANMAR, S.COMPLEX],
  [B.UBLOCK_GEORGIAN, B.UBLOCK_GEORGIAN, S.LATIN],
  [B.UBLOCK_HANGUL_JAMO, B.UBLOCK_HANGUL_JAMO, S.ASIAN],
  [B.UBLOCK_ETHIOPIC, B.UBLOCK_ETHIOPIC, S.COMPLEX],
  [B.UBLOCK_CHEROKEE, B.UBLOCK_RUNIC, S.LATIN],
  [B.UBLOCK_KHMER, B.UBLOCK_MONGOLIAN, S.COMPLEX],
  [B.UBLOCK_LATIN_EXTENDED_ADDITIONAL, B.UBLOCK_GREEK_EXTENDED, S.LATIN],
  [B.UBLOCK_NUMBER_FORMS, B.UBLOCK_NUMBER_FORMS, S.WEAK],
  [B.UBLOCK_CJK_RADICALS_SUPPLEMENT, B.UBLOCK_HANGUL_SYLLABLES, S.ASIAN],
  [B.UBLOCK_CJK_COMPATIBILITY_IDEOGRAPHS, B.UBLOCK_CJK_COMPATIBILITY_IDEOGRAPHS, S.ASIAN],
  [B.UBLOCK_ARABIC_PRESENTATION_FORMS_A, B.UBLOCK_ARABIC_PRESENTATION_FORMS_A, S.COMPLEX],
  [B.UBLOCK_CJK_COMPATIBILITY_FORMS, B.UBLOCK_CJK_COMPATIBILITY_FORMS, S.ASIAN],
  [B.UBLOCK_ARABIC_PRESENTATION_FORMS_B, B.UBLOCK_ARABIC_PRESENTATION_FORMS_B, S.COMPLEX],
  [B.UBLOCK_HALFWIDTH_AND_FULLWIDTH_FORMS, B.UBLOCK_HALFWIDTH_AND_FULLWIDTH_FORMS, S.ASIAN],
  [
    B.UBLOCK_CJK_UNIFIED_IDEOGRAPHS_EXTENSION_B,
    B.UBLOCK_CJK_COMPATIBILITY_IDEOGRAPHS_SUPPLEMENT,
    S.ASIAN,
  ],
  [B.UBLOCK_CJK_STROKES, B.UBLOCK_CJK_STROKES, S.ASIAN],
  [B.UBLOCK_LATIN_EXTENDED_C, B.UBLOCK_LATIN_EXTENDED_D, S.LATIN],
] as const;
/** Original compatibility lookup always sets its output,including the false branch. @param currentChar - Native unsigned32 scalar. @param result - Script destination. @returns Whether legacy override applies. */
export function getCompatibilityScriptClassByBlock(currentChar: number, result: [number]): boolean {
  currentChar >>>= 0;
  if (currentChar === 1 || currentChar === 2 || currentChar === 0x20 || currentChar === 0xa0)
    result[0] = S.WEAK;
  else if (
    currentChar === 0x2ca ||
    currentChar === 0x2cb ||
    currentChar === 0x2c7 ||
    currentChar === 0x2d9
  )
    result[0] = S.WEAK;
  else if (currentChar === 0xb2 || currentChar === 0xb3 || currentChar === 0xb9) result[0] = S.WEAK;
  else if (currentChar >= 0x2c80 && currentChar <= 0x2ce3) result[0] = S.LATIN;
  else {
    const block = ublock_getCode(currentChar | 0);
    let i = 0;
    while (i < scriptList.length) {
      if (block <= (scriptList[i] as (typeof scriptList)[number])[1]) break;
      ++i;
    }
    if (i < scriptList.length && block >= (scriptList[i] as (typeof scriptList)[number])[0])
      result[0] = (scriptList[i] as (typeof scriptList)[number])[2];
    else {
      result[0] = S.WEAK;
      return false;
    }
  }
  return true;
}
/** Original script class with legacy overrides before UAX24 properties. @param currentChar - Unsigned32 scalar. @returns Native editing class. */
export function GetScriptClass(currentChar: number): number {
  const result: [number] = [S.WEAK];
  if (!getCompatibilityScriptClassByBlock(currentChar, result))
    result[0] = unicode.getScriptClassFromUScriptCode(
      u_getIntPropertyValue(currentChar | 0, UProperty.UCHAR_SCRIPT) as UScriptCode,
    );
  return result[0];
}
