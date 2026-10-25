/** @fileoverview Bounded native-value ODF character handoff for text export/import; independent UNO script scalars,underline properties and original font metadata are preserved. No browser boolean formatting model or substitute UNO provider. */
import type { FontSlant } from "../../../offapi/com/sun/star/awt/FontSlant";
import type { FontPitch } from "../../../tools/inc/fontenum";
import type { rtl_TextEncoding } from "../../../sal/inc/rtl/textenc";
/** Direct character properties supported by the bounded text exporter. */
export interface OdfCharacterProperties {
  readonly color?: string;
  readonly fontFamily?: string;
  readonly fontFamilyGeneric?: string;
  readonly fontStyleName?: string;
  readonly fontPitch?: FontPitch;
  readonly fontCharSet?: rtl_TextEncoding;
  readonly fontFamilyAsian?: string;
  readonly fontStyleNameAsian?: string;
  readonly fontPitchAsian?: FontPitch;
  readonly fontCharSetAsian?: rtl_TextEncoding;
  readonly fontFamilyGenericAsian?: string;
  readonly fontFamilyComplex?: string;
  readonly fontStyleNameComplex?: string;
  readonly fontPitchComplex?: FontPitch;
  readonly fontCharSetComplex?: rtl_TextEncoding;
  readonly fontFamilyGenericComplex?: string;
  /** Absolute font height in twips. */
  readonly fontSizeTwips?: number;
  readonly highlight?: string;
  /** Native UNO CharWeight values, independently represented for each script. */
  readonly fontWeight?: number;
  readonly fontWeightAsian?: number;
  readonly fontWeightComplex?: number;
  readonly fontPosture?: FontSlant;
  readonly fontPostureAsian?: FontSlant;
  readonly fontPostureComplex?: FontSlant;
  readonly fontSizeTwipsAsian?: number;
  readonly fontSizeTwipsComplex?: number;
  /** Native UNO CharUnderline and its independent color properties. */
  /** Native UNO CharStrikeout, merged from the four original ODF properties. */
  readonly strikeout?: number;
  /** Native CharEscapement and CharEscapementHeight. */
  readonly escapement?: number;
  readonly escapementHeight?: number;
  readonly underlineStyle?: number;
  readonly underlineColor?: number;
  readonly underlineHasColor?: boolean;
  /** Original shared line-decoration mode and automatic kerning bool properties. */
  readonly wordMode?: boolean;
  readonly autoKerning?: boolean;
}

/** Resolves a complete font declaration to its document-local ODF name. */
export type FontFaceNameResolver = (
  familyName: string,
  generic?: string,
  styleName?: string,
  pitch?: FontPitch,
  charSet?: rtl_TextEncoding,
) => string;
