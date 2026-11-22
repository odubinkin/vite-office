/** @fileoverview Bounded native-value ODF character handoff for text export/import; independent UNO script scalars,underline properties and original font metadata are preserved. No browser boolean formatting model or substitute UNO provider. */
import type { OdfAsianTypography } from "./txtprhdl";
import type { OdfParagraphJustification } from "../style/adjushdl";
import type { OdfParagraphHyphenation } from "./txtprmap";
import type { OdfFillProperties } from "../draw/fill-properties";
import type { LanguageType } from "../../../i18nlangtag/inc/lang";
import type { FontSlant } from "../../../offapi/com/sun/star/awt/FontSlant";
import type { FontPitch } from "../../../tools/inc/fontenum";
import type { rtl_TextEncoding } from "../../../sal/inc/rtl/textenc";
import type { OdfBoxProperties } from "../style/bordrhdl";
import type { OdfThemeColor } from "./XMLComplexColorContext";
/** Direct character properties supported by the bounded text exporter. */
export interface OdfCharacterProperties {
  readonly characterBox?: OdfBoxProperties;
  readonly color?: string;
  readonly textTransparency?: number;
  readonly themeColor?: OdfThemeColor;
  readonly language?: LanguageType;
  readonly languageAsian?: LanguageType;
  readonly languageComplex?: LanguageType;
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
  /** Native UNO CharEmphasis short. */
  readonly emphasis?: number;
  /** Original UNO CharCaseMap short, shared by both ODF attributes. */
  readonly caseMap?: number;
  /** Original UNO font paint properties. */
  readonly outline?: boolean;
  readonly shadow?: boolean;
  readonly relief?: number;
  /** Native CharEscapement and CharEscapementHeight. */
  readonly escapement?: number;
  readonly escapementHeight?: number;
  /** Native character rotation is carried in tenths of a degree. */
  readonly rotation?: number;
  readonly rotationFitToLine?: boolean;
  readonly scaleWidth?: number;
  readonly underlineStyle?: number;
  readonly underlineColor?: number;
  readonly underlineHasColor?: boolean;
  readonly overlineStyle?: number;
  readonly overlineColor?: number;
  readonly overlineHasColor?: boolean;
  /** Original shared line-decoration mode and automatic kerning bool properties. */
  readonly wordMode?: boolean;
  readonly autoKerning?: boolean;
  readonly noHyphenation?: boolean;
  readonly opticalSizing?: boolean;
  /** Original signed UNO CharKerning in hundredths of a millimetre. */
  readonly kerning?: number;
}

/** Resolves a complete font declaration to its document-local ODF name. */
export type FontFaceNameResolver = (
  familyName: string,
  generic?: string,
  styleName?: string,
  pitch?: FontPitch,
  charSet?: rtl_TextEncoding,
) => string;

/** Direct paragraph properties represented by the bounded Writer model. */
export interface OdfTabStop {
  readonly position: number;
  readonly alignment: "left" | "right" | "center" | "char" | "default";
  readonly decimal: string;
  readonly fill: string;
}

/** Direct paragraph properties represented by the bounded Writer model. */
export interface OdfParagraphProperties extends OdfBoxProperties, OdfFillProperties {
  readonly joinBorder?: boolean;
  readonly countLineNumbers?: boolean;
  readonly lineNumberStartValue?: number;
  readonly contextualSpacing?: boolean;
  readonly firstLineIndent?: number;
  readonly autoTextIndent?: boolean;
  readonly pageStyleName?: string;
  readonly pageNumber?: number | "auto";
  readonly lineHeightPercent?: number;
  readonly lineHeightTwips?: number;
  readonly lineHeightAtLeastTwips?: number;
  readonly lineSpacingTwips?: number;
  readonly fontIndependentLineSpacing?: boolean;
  readonly keepWithNext?: boolean;
  readonly registerModeActive?: boolean;
  readonly hyphenation?: OdfParagraphHyphenation;
  readonly justification?: OdfParagraphJustification;
  readonly keepTogether?: boolean;
  readonly widows?: number;
  readonly verticalAlign?: number;
  readonly writingMode?: number;
  readonly writingModeAutomatic?: boolean;
  readonly snapToGrid?: boolean;
  readonly asianTypography?: OdfAsianTypography;
  readonly orphans?: number;
  readonly breakBefore?: "auto" | "page";
  readonly breakAfter?: "auto" | "page";
  readonly lowerSpacing?: number;
  readonly rightMargin?: number;
  readonly tabStopDetails?: readonly OdfTabStop[];
  readonly upperSpacing?: number;
}
