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

/** Original text-line member MID_TEXTLINED. */
export const MID_TEXTLINED = 0;
/** Original text-line member MID_TL_STYLE. */
export const MID_TL_STYLE = 1;
/** Original text-line member MID_TL_COLOR. */
export const MID_TL_COLOR = 2;
/** Original text-line member MID_TL_HASCOLOR. */
export const MID_TL_HASCOLOR = 3;
/** Original text-line member MID_TL_COMPLEX_COLOR. */
export const MID_TL_COMPLEX_COLOR = 4;

/** Original language numeric API member. */
export const MID_LANG_INT = 0;
/** Original language Locale API member. */
export const MID_LANG_LOCALE = 1;

/** Original brush member MID_BACK_COLOR. */
export const MID_BACK_COLOR = 0;

/** Original brush member MID_GRAPHIC_POSITION. */
export const MID_GRAPHIC_POSITION = 1;

/** Original brush member MID_GRAPHIC. */
export const MID_GRAPHIC = 2;

/** Original brush member MID_GRAPHIC_TRANSPARENT. */
export const MID_GRAPHIC_TRANSPARENT = 3;

/** Original brush member MID_GRAPHIC_URL. */
export const MID_GRAPHIC_URL = 4;

/** Original brush member MID_GRAPHIC_FILTER. */
export const MID_GRAPHIC_FILTER = 5;

/** Original brush member MID_GRAPHIC_REPEAT. */
export const MID_GRAPHIC_REPEAT = 6;

/** Original brush member MID_GRAPHIC_TRANSPARENCY. */
export const MID_GRAPHIC_TRANSPARENCY = 7;

/** Original brush member MID_BACK_COLOR_R_G_B. */
export const MID_BACK_COLOR_R_G_B = 8;

/** Original brush member MID_BACK_COLOR_TRANSPARENCY. */
export const MID_BACK_COLOR_TRANSPARENCY = 9;

/** Original brush member MID_SHADING_VALUE. */
export const MID_SHADING_VALUE = 10;

/** Original brush member MID_BACKGROUND_COMPLEX_COLOR. */
export const MID_BACKGROUND_COMPLEX_COLOR = 11;

/** Original text baseline displacement selector. */
export const MID_ESC = 0;
/** Original relative-height selector. */
export const MID_ESC_HEIGHT = 1;
/** Original automatic baseline displacement selector. */
export const MID_AUTO_ESC = 2;

/** Original script-hint value selector. */
export const MID_SCRIPTHINT = 0;

/** Original ruby text selector. */
export const MID_RUBY_TEXT = 0;
/** Original ruby adjustment selector. */
export const MID_RUBY_ADJUST = 1;
/** Original legacy ruby character-style selector, not handled by SvxRubyItem. */
export const MID_RUBY_CHARSTYLE = 2;
/** Original legacy ruby-above selector, not handled by SvxRubyItem. */
export const MID_RUBY_ABOVE = 3;
/** Original ruby position selector. */
export const MID_RUBY_POSITION = 4;

/** Original line-spacing mode member. */
export const MID_LINESPACE = 59;

/** Original tab sequence member. */
export const MID_TABSTOPS = 0;
/** Original first-tab position member. */
export const MID_STD_TAB = 1;
/** Original independent default-distance member. */
export const MID_TABSTOP_DEFAULT_DISTANCE = 2;

/** Original paragraph adjustment selector. */
export const MID_PARA_ADJUST = 0;
/** Original paragraph adjustment selector. */
export const MID_LAST_LINE_ADJUST = 1;
/** Original paragraph adjustment selector. */
export const MID_EXPAND_SINGLE = 2;
/** Original paragraph adjustment selector. */
export const MID_WORD_SPACING = 3;
/** Original paragraph adjustment selector. */
export const MID_WORD_SPACING_MIN = 4;
/** Original paragraph adjustment selector. */
export const MID_WORD_SPACING_MAX = 5;
/** Original paragraph adjustment selector. */
export const MID_LETTER_SPACING_MIN = 6;
/** Original paragraph adjustment selector. */
export const MID_LETTER_SPACING_MAX = 7;
/** Original paragraph adjustment selector. */
export const MID_SCALE_WIDTH_MIN = 8;
/** Original paragraph adjustment selector. */
export const MID_SCALE_WIDTH_MAX = 9;
/** Original paragraph adjustment selector. */
export const MID_PARAGRAPH_COMPOSER = 10;

/** Original drawing-color theme palette index member. */
export const MID_COLOR_THEME_INDEX = 4;
/** Original drawing-color luminance modulation member. */
export const MID_COLOR_LUM_MOD = 6;
/** Original drawing-color luminance offset member. */
export const MID_COLOR_LUM_OFF = 7;
/** Original drawing-color complex interface member; actual provider is a separate service. */
export const MID_COMPLEX_COLOR = 8;
