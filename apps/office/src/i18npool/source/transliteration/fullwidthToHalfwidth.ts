/** @fileoverview Original directional width modules and their exact decomposition/composition contracts. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { widthfolding } from "../../../i18nutil/inc/widthfolding";
import { transliteration_OneToOne } from "./transliteration_OneToOne";
import { MultipleCharsOutputException } from "../../../offapi/com/sun/star/i18n/MultipleCharsOutputException";
/** Original FULLWIDTH_HALFWIDTH concrete module. */
export class fullwidthToHalfwidth extends transliteration_OneToOne {
  /** Original width table and names. @returns Module. */
  constructor() {
    super();
    this.func = null;
    this.table = widthfolding.getfull2halfTable();
    this.transliterationName = "fullwidthToHalfwidth";
    this.implementationName = "com.sun.star.i18n.Transliteration.FULLWIDTH_HALFWIDTH";
  }
  /** Original two-stage string transformation. @param input - Native string. @param start - UTF16 start. @param count - Unit count. @param offset - Optional output. @returns Owned result. */
  public override transliterateImpl(
    input: OUStringConstReference,
    start: number,
    count: number,
    offset: Sequence<[number]> | null,
  ): OUString {
    const mapped = widthfolding.decompose_ja_voiced_sound_marks(input, start, count, offset);
    try {
      return super.transliterateImpl(mapped, 0, mapped.getLength(), null);
    } finally {
      mapped.dispose();
    }
  }
  /** Original scalar exception guard,including the literalFFFF collision. @param unit - Native Unicode unit. @returns Mapped unit. */
  public override transliterateChar2Char(unit: number): number {
    const mapped = widthfolding.decompose_ja_voiced_sound_marksChar2Char(unit);
    if (mapped === 0xffff) throw new MultipleCharsOutputException();
    return super.transliterateChar2Char(unit);
  }
}
/** Original FULLWIDTHKATAKANA_HALFWIDTHKATAKANA concrete module. */
export class FULLWIDTHKATAKANA_HALFWIDTHKATAKANA extends transliteration_OneToOne {
  /** Original width table and names. @returns Module. */
  constructor() {
    super();
    this.func = null;
    this.table = widthfolding.getfullKana2halfKanaTable();
    this.transliterationName = "fullwidthKatakanaToHalfwidthKatakana";
    this.implementationName =
      "com.sun.star.i18n.Transliteration.FULLWIDTHKATAKANA_HALFWIDTHKATAKANA";
  }
  /** Original two-stage string transformation. @param input - Native string. @param start - UTF16 start. @param count - Unit count. @param offset - Optional output. @returns Owned result. */
  public override transliterateImpl(
    input: OUStringConstReference,
    start: number,
    count: number,
    offset: Sequence<[number]> | null,
  ): OUString {
    const mapped = widthfolding.decompose_ja_voiced_sound_marks(input, start, count, offset);
    try {
      return super.transliterateImpl(mapped, 0, mapped.getLength(), null);
    } finally {
      mapped.dispose();
    }
  }
  /** Original scalar exception guard,including the literalFFFF collision. @param unit - Native Unicode unit. @returns Mapped unit. */
  public override transliterateChar2Char(unit: number): number {
    const mapped = widthfolding.decompose_ja_voiced_sound_marksChar2Char(unit);
    if (mapped === 0xffff) throw new MultipleCharsOutputException();
    return super.transliterateChar2Char(unit);
  }
}
/** Original FULLWIDTH_HALFWIDTH_LIKE_ASC concrete module. */
export class FULLWIDTH_HALFWIDTH_LIKE_ASC extends transliteration_OneToOne {
  /** Original width table and names. @returns Module. */
  constructor() {
    super();
    this.func = null;
    this.table = widthfolding.getfull2halfTableForASC();
    this.transliterationName = "fullwidthToHalfwidthLikeASC";
    this.implementationName = "com.sun.star.i18n.Transliteration.FULLWIDTH_HALFWIDTH_LIKE_ASC";
  }
  /** Original two-stage string transformation. @param input - Native string. @param start - UTF16 start. @param count - Unit count. @param offset - Optional output. @returns Owned result. */
  public override transliterateImpl(
    input: OUStringConstReference,
    start: number,
    count: number,
    offset: Sequence<[number]> | null,
  ): OUString {
    const mapped = widthfolding.decompose_ja_voiced_sound_marks(input, start, count, offset);
    try {
      return super.transliterateImpl(mapped, 0, mapped.getLength(), null);
    } finally {
      mapped.dispose();
    }
  }
  /** Original scalar exception guard,including the literalFFFF collision. @param unit - Native Unicode unit. @returns Mapped unit. */
  public override transliterateChar2Char(unit: number): number {
    const mapped = widthfolding.decompose_ja_voiced_sound_marksChar2Char(unit);
    if (mapped === 0xffff) throw new MultipleCharsOutputException();
    return super.transliterateChar2Char(unit);
  }
}
