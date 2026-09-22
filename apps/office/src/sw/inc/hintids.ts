/**
 * @fileoverview Declares the bounded Writer WhichIds used by the TypeScript core, matching pinned `sw/inc/hintids.hxx` numeric identities.
 */

/** First Writer character-format WhichId. */
export const RES_CHRATR_BEGIN = 1 as const;

/** Automatic or explicit character color, `RES_CHRATR_BEGIN + 2`. */
export const RES_CHRATR_COLOR = 3 as const;

/** Western font family, `RES_CHRATR_BEGIN + 6`. */
export const RES_CHRATR_FONT = 7 as const;

/** Western font height in twips, `RES_CHRATR_BEGIN + 7`. */
export const RES_CHRATR_FONTSIZE = 8 as const;

/** Western font posture, `RES_CHRATR_BEGIN + 10`. */
export const RES_CHRATR_POSTURE = 11 as const;

/** Character underline, `RES_CHRATR_BEGIN + 13`. */
export const RES_CHRATR_UNDERLINE = 14 as const;

/** Western font weight, `RES_CHRATR_BEGIN + 14`. */
export const RES_CHRATR_WEIGHT = 15 as const;

/** CJK font posture, `RES_CHRATR_BEGIN + 24`. */
export const RES_CHRATR_CJK_POSTURE = 25 as const;

/** CJK font family, `RES_CHRATR_BEGIN + 21`. */
export const RES_CHRATR_CJK_FONT = 22 as const;

/** CJK font height in twips, `RES_CHRATR_BEGIN + 22`. */
export const RES_CHRATR_CJK_FONTSIZE = 23 as const;

/** CJK font weight, `RES_CHRATR_BEGIN + 25`. */
export const RES_CHRATR_CJK_WEIGHT = 26 as const;

/** Complex-text font posture, `RES_CHRATR_BEGIN + 29`. */
export const RES_CHRATR_CTL_POSTURE = 30 as const;

/** Complex-text font family, `RES_CHRATR_BEGIN + 26`. */
export const RES_CHRATR_CTL_FONT = 27 as const;

/** Complex-text font height in twips, `RES_CHRATR_BEGIN + 27`. */
export const RES_CHRATR_CTL_FONTSIZE = 28 as const;

/** Complex-text font weight, `RES_CHRATR_BEGIN + 30`. */
export const RES_CHRATR_CTL_WEIGHT = 31 as const;

/** Character highlight/background, `RES_CHRATR_BEGIN + 41`. */
export const RES_CHRATR_HIGHLIGHT = 42 as const;

/** First WhichId after Writer character-format items. */
export const RES_CHRATR_END = 49 as const;

/** Ranged text auto-format attribute, `RES_TXTATR_WITHEND_BEGIN + 4`. */
export const RES_TXTATR_AUTOFMT = 53 as const;

/** Ranged internet-format attribute, `RES_TXTATR_WITHEND_BEGIN + 5`. */
export const RES_TXTATR_INETFMT = 54 as const;

/** Paragraph adjustment item, `RES_PARATR_BEGIN + 1`. */
export const RES_PARATR_ADJUST = 65 as const;

/** Paragraph tab-stop collection, `RES_PARATR_BEGIN + 5`. */
export const RES_PARATR_TABSTOP = 69 as const;

/** Proportional paragraph line spacing, `RES_PARATR_BEGIN`. */
export const RES_PARATR_LINESPACING = 64 as const;

/** Paragraph numbering-rule name, `RES_PARATR_BEGIN + 9`. */
export const RES_PARATR_NUMRULE = 73 as const;

/** Paragraph list identity, first item after regular paragraph attributes. */
export const RES_PARATR_LIST_ID = 83 as const;

/** Paragraph list level. */
export const RES_PARATR_LIST_LEVEL = 84 as const;

/** Paragraph list restart flag. */
export const RES_PARATR_LIST_ISRESTART = 85 as const;

/** Paragraph explicit list restart value. */
export const RES_PARATR_LIST_RESTARTVALUE = 86 as const;

/** Paragraph counted-in-list flag. */
export const RES_PARATR_LIST_ISCOUNTED = 87 as const;

/** Direct paragraph text-left margin, matching `RES_MARGIN_TEXTLEFT`. */
export const RES_MARGIN_TEXTLEFT = 93 as const;

/** First-line paragraph indent, matching `RES_MARGIN_FIRSTLINE`. */
export const RES_MARGIN_FIRSTLINE = 92 as const;

/** Right paragraph margin, matching `RES_MARGIN_RIGHT`. */
export const RES_MARGIN_RIGHT = 94 as const;

/** Upper/lower paragraph spacing, matching `RES_UL_SPACE`. */
export const RES_UL_SPACE = 99 as const;

/** Keep paragraph with the following paragraph, matching `RES_KEEP`. */
export const RES_KEEP = 117 as const;

/** Paragraph line-number participation, matching `RES_LINENUMBER`. */
export const RES_LINENUMBER = 123 as const;

/** WhichIds supported by the current Writer text-node auto-attribute set. */
export const WRITER_TEXT_NODE_WHICH_RANGES = [
  [RES_CHRATR_COLOR, RES_CHRATR_COLOR],
  [RES_CHRATR_FONT, RES_CHRATR_FONT],
  [RES_CHRATR_FONTSIZE, RES_CHRATR_FONTSIZE],
  [RES_CHRATR_POSTURE, RES_CHRATR_POSTURE],
  [RES_CHRATR_UNDERLINE, RES_CHRATR_WEIGHT],
  [RES_CHRATR_CJK_FONT, RES_CHRATR_CJK_FONT],
  [RES_CHRATR_CJK_FONTSIZE, RES_CHRATR_CJK_FONTSIZE],
  [RES_CHRATR_CJK_POSTURE, RES_CHRATR_CJK_WEIGHT],
  [RES_CHRATR_CTL_FONT, RES_CHRATR_CTL_FONT],
  [RES_CHRATR_CTL_FONTSIZE, RES_CHRATR_CTL_FONTSIZE],
  [RES_CHRATR_CTL_POSTURE, RES_CHRATR_CTL_WEIGHT],
  [RES_CHRATR_HIGHLIGHT, RES_CHRATR_HIGHLIGHT],
  [RES_PARATR_LINESPACING, RES_PARATR_ADJUST],
  [RES_PARATR_TABSTOP, RES_PARATR_TABSTOP],
  [RES_PARATR_NUMRULE, RES_PARATR_NUMRULE],
  [RES_PARATR_LIST_ID, RES_PARATR_LIST_ISCOUNTED],
  [RES_MARGIN_FIRSTLINE, RES_MARGIN_RIGHT],
  [RES_UL_SPACE, RES_UL_SPACE],
  [RES_KEEP, RES_KEEP],
  [RES_LINENUMBER, RES_LINENUMBER],
] as const;

/** WhichIds supported by the current Writer paragraph-style attribute set. */
export const WRITER_TEXT_FORMAT_COLL_WHICH_RANGES = [
  [RES_CHRATR_COLOR, RES_CHRATR_COLOR],
  [RES_CHRATR_FONT, RES_CHRATR_FONT],
  [RES_CHRATR_FONTSIZE, RES_CHRATR_FONTSIZE],
  [RES_CHRATR_POSTURE, RES_CHRATR_POSTURE],
  [RES_CHRATR_UNDERLINE, RES_CHRATR_WEIGHT],
  [RES_CHRATR_CJK_FONT, RES_CHRATR_CJK_FONT],
  [RES_CHRATR_CJK_FONTSIZE, RES_CHRATR_CJK_FONTSIZE],
  [RES_CHRATR_CJK_POSTURE, RES_CHRATR_CJK_WEIGHT],
  [RES_CHRATR_CTL_FONT, RES_CHRATR_CTL_FONT],
  [RES_CHRATR_CTL_FONTSIZE, RES_CHRATR_CTL_FONTSIZE],
  [RES_CHRATR_CTL_POSTURE, RES_CHRATR_CTL_WEIGHT],
  [RES_CHRATR_HIGHLIGHT, RES_CHRATR_HIGHLIGHT],
  [RES_PARATR_LINESPACING, RES_PARATR_ADJUST],
  [RES_PARATR_TABSTOP, RES_PARATR_TABSTOP],
  [RES_PARATR_NUMRULE, RES_PARATR_NUMRULE],
  [RES_PARATR_LIST_LEVEL, RES_PARATR_LIST_LEVEL],
  [RES_MARGIN_FIRSTLINE, RES_MARGIN_RIGHT],
  [RES_UL_SPACE, RES_UL_SPACE],
  [RES_KEEP, RES_KEEP],
  [RES_LINENUMBER, RES_LINENUMBER],
] as const;

/** WhichIds stored inside the bounded SwFormatAutoFormat item set. */
export const WRITER_CHARACTER_WHICH_RANGES = [
  [RES_CHRATR_COLOR, RES_CHRATR_COLOR],
  [RES_CHRATR_FONT, RES_CHRATR_FONT],
  [RES_CHRATR_FONTSIZE, RES_CHRATR_FONTSIZE],
  [RES_CHRATR_POSTURE, RES_CHRATR_POSTURE],
  [RES_CHRATR_UNDERLINE, RES_CHRATR_WEIGHT],
  [RES_CHRATR_CJK_FONT, RES_CHRATR_CJK_FONT],
  [RES_CHRATR_CJK_FONTSIZE, RES_CHRATR_CJK_FONTSIZE],
  [RES_CHRATR_CJK_POSTURE, RES_CHRATR_CJK_WEIGHT],
  [RES_CHRATR_CTL_FONT, RES_CHRATR_CTL_FONT],
  [RES_CHRATR_CTL_FONTSIZE, RES_CHRATR_CTL_FONTSIZE],
  [RES_CHRATR_CTL_POSTURE, RES_CHRATR_CTL_WEIGHT],
  [RES_CHRATR_HIGHLIGHT, RES_CHRATR_HIGHLIGHT],
] as const;
