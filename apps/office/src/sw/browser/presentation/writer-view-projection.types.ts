/** @fileoverview Immutable browser style values projected from Writer paragraph items. */
/** Browser-ready values projected from effective Writer paragraph items. */
export interface WriterParagraphComputedStyle {
  /** Effective automatic first-line mode; omitted detached DTOs retain the manual default. */
  readonly autoFirstLineIndent?: boolean;
  readonly autoKerning?: boolean;
  readonly autoHyphenation?: boolean;
  readonly hyphenationLimits?: string;
  readonly logicalAlignment?: "start" | "end" | undefined;
  readonly lastLineAlignment?: "start" | "center" | "justify" | undefined;
  readonly opticalSizing?: boolean;
  readonly color?: string;
  readonly contextualSpacing?: boolean;
  readonly firstLineIndentPt: number;
  readonly fontFamily?: string;
  /** Layout offset distinct from the authored item; omitted detached DTOs retain their raw value. */
  readonly resolvedFirstLineIndentPt?: number;
  readonly fontFamilyGeneric?: string;
  readonly fontStyle: "italic" | "normal";
  readonly fontSizePt: number;
  readonly fontWeight: 400 | 700;
  readonly highlight?: string;
  readonly backgroundColor?: string;
  readonly lineHeight: number;
  readonly lineSpacingMode?: "proportional" | "fixed" | "minimum" | "leading";
  readonly lineSpacingValue?: number;
  readonly tabStopPositionPt?: number | undefined;
  readonly tabStopsPt?: readonly number[] | undefined;
  readonly keepWithNext?: boolean;
  readonly countLineNumbers?: boolean;
  readonly lowerSpacingPt: number;
  readonly rightMarginPt: number;
  readonly upperSpacingPt: number;
}
