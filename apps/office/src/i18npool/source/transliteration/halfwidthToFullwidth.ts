/** @fileoverview Original directional width modules and their exact decomposition/composition contracts. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import {
  widthfolding,
  WIDTHFOLDING_DONT_USE_COMBINED_VU,
} from "../../../i18nutil/inc/widthfolding";
import { transliteration_OneToOne } from "./transliteration_OneToOne";
/** Original HALFWIDTH_FULLWIDTH concrete module. */
export class halfwidthToFullwidth extends transliteration_OneToOne {
  /** Original width table and names. @returns Module. */
  constructor() {
    super();
    this.func = null;
    this.table = widthfolding.gethalf2fullTable();
    this.transliterationName = "halfwidthToFullwidth";
    this.implementationName = "com.sun.star.i18n.Transliteration.HALFWIDTH_FULLWIDTH";
  }
  /** Original two-stage string transformation. @param input - Native string. @param start - UTF16 start. @param count - Unit count. @param offset - Optional output. @returns Owned result. */
  public override transliterateImpl(
    input: OUStringConstReference,
    start: number,
    count: number,
    offset: Sequence<[number]> | null,
  ): OUString {
    const mapped = super.transliterateImpl(input, start, count, null);
    try {
      return widthfolding.compose_ja_voiced_sound_marks(mapped, 0, mapped.getLength(), offset);
    } finally {
      mapped.dispose();
    }
  }
}
/** Original HALFWIDTHKATAKANA_FULLWIDTHKATAKANA concrete module. */
export class HALFWIDTHKATAKANA_FULLWIDTHKATAKANA extends transliteration_OneToOne {
  /** Original width table and names. @returns Module. */
  constructor() {
    super();
    this.func = null;
    this.table = widthfolding.gethalfKana2fullKanaTable();
    this.transliterationName = "halfwidthKatakanaToFullwidthKatakana";
    this.implementationName =
      "com.sun.star.i18n.Transliteration.HALFWIDTHKATAKANA_FULLWIDTHKATAKANA";
  }
  /** Original two-stage string transformation. @param input - Native string. @param start - UTF16 start. @param count - Unit count. @param offset - Optional output. @returns Owned result. */
  public override transliterateImpl(
    input: OUStringConstReference,
    start: number,
    count: number,
    offset: Sequence<[number]> | null,
  ): OUString {
    const mapped = super.transliterateImpl(input, start, count, null);
    try {
      return widthfolding.compose_ja_voiced_sound_marks(mapped, 0, mapped.getLength(), offset);
    } finally {
      mapped.dispose();
    }
  }
}
/** Original HALFWIDTH_FULLWIDTH_LIKE_JIS concrete module. */
export class HALFWIDTH_FULLWIDTH_LIKE_JIS extends transliteration_OneToOne {
  /** Original width table and names. @returns Module. */
  constructor() {
    super();
    this.func = null;
    this.table = widthfolding.gethalf2fullTableForJIS();
    this.transliterationName = "halfwidthToFullwidthLikeJIS";
    this.implementationName = "com.sun.star.i18n.Transliteration.HALFWIDTH_FULLWIDTH_LIKE_JIS";
  }
  /** Original two-stage string transformation. @param input - Native string. @param start - UTF16 start. @param count - Unit count. @param offset - Optional output. @returns Owned result. */
  public override transliterateImpl(
    input: OUStringConstReference,
    start: number,
    count: number,
    offset: Sequence<[number]> | null,
  ): OUString {
    const mapped = super.transliterateImpl(input, start, count, null);
    try {
      return widthfolding.compose_ja_voiced_sound_marks(
        mapped,
        0,
        mapped.getLength(),
        offset,
        WIDTHFOLDING_DONT_USE_COMBINED_VU,
      );
    } finally {
      mapped.dispose();
    }
  }
}
