/** @fileoverview Publishes the represented LR font-unit UNO member identities from include/editeng/memberids.h. */
/** First-line indent double/unit pair. */
export const MID_FIRST_LINE_UNIT_INDENT = 13;
/** Right-margin double/unit pair. */
export const MID_R_UNIT_MARGIN = 14;
/** Text-left-margin double/unit pair. */
export const MID_L_UNIT_MARGIN = 15;

/** First-line absolute indent. */
export const MID_FIRST_LINE_INDENT = 8;
/** First-line proportional indent. */
export const MID_FIRST_LINE_REL_INDENT = 9;
/** Automatic first-line calculation. */
export const MID_FIRST_AUTO = 10;

/** Paragraph absolute text-left margin. */
export const MID_TXT_LMARGIN = 11;
/** Paragraph proportional left margin. */
export const MID_L_REL_MARGIN = 6;

/** Original cell alignment member. */
export const MID_HORJUST_HORJUST = 0;
/** Original paragraph alignment member, also used by the vertical item. */
export const MID_HORJUST_ADJUST = 1;

/** Original font relief member. */
export const MID_RELIEF = 0;

/** Original strikeout bool member. */
export const MID_CROSSED_OUT = 0;
/** Original strikeout enum member. */
export const MID_CROSS_OUT = 1;
/** Original emphasis member. */
export const MID_EMPHASIS = 0;

/** Original italic boolean member. */
export const MID_ITALIC = 0;
/** Original posture enum member. */
export const MID_POSTURE = 1;

/** Original bold bool member. */
export const MID_BOLD = 0;
/** Original weight float member. */
export const MID_WEIGHT = 1;

/** Original font-height float member. */
export const MID_FONTHEIGHT = 1;
/** Original font-height property member. */
export const MID_FONTHEIGHT_PROP = 2;
/** Original font-height difference member. */
export const MID_FONTHEIGHT_DIFF = 3;

/** Original shadow location member. */
export const MID_LOCATION = 0x3c;
/** Original shadow transparency flag member. */
export const MID_TRANSPARENT = 0x4b;
/** Original shadow background color member. */
export const MID_BG_COLOR = 0x22;
/** Original shadow transparency percent member. */
export const MID_SHADOW_TRANSPARENCE = 1;

/** Original line foreground color member. */
export const MID_FG_COLOR = 0x2c;
/** Original line outer-width member. */
export const MID_OUTER_WIDTH = 0x41;
/** Original line inner-width member. */
export const MID_INNER_WIDTH = 0x35;
/** Original line gap member. */
export const MID_DISTANCE = 0x29;
/** Original style member overlaps CONVERT_TWIPS; stripping preserves the native unreachable case. */
export const MID_LINE_STYLE = 0x90;
