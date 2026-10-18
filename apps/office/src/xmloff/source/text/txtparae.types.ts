/** @fileoverview Existing browser ODF character-property handoff, shared by text export/import and actual Writer font values; native txtparae.cxx responsibility, no UNO property-set provider or binary struct. */
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
  readonly bold: boolean;
  readonly italic: boolean;
  readonly underline: boolean;
}

/** Resolves a complete font declaration to its document-local ODF name. */
export type FontFaceNameResolver = (
  familyName: string,
  generic?: string,
  styleName?: string,
  pitch?: FontPitch,
  charSet?: rtl_TextEncoding,
) => string;
