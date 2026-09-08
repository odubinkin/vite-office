/**
 * @fileoverview Declares the bounded Writer WhichIds used by the TypeScript core, matching pinned `sw/inc/hintids.hxx` numeric identities.
 */

/** First Writer character-format WhichId. */
export const RES_CHRATR_BEGIN = 1 as const;

/** Western font posture, `RES_CHRATR_BEGIN + 10`. */
export const RES_CHRATR_POSTURE = 11 as const;

/** Character underline, `RES_CHRATR_BEGIN + 13`. */
export const RES_CHRATR_UNDERLINE = 14 as const;

/** Western font weight, `RES_CHRATR_BEGIN + 14`. */
export const RES_CHRATR_WEIGHT = 15 as const;

/** CJK font posture, `RES_CHRATR_BEGIN + 24`. */
export const RES_CHRATR_CJK_POSTURE = 25 as const;

/** CJK font weight, `RES_CHRATR_BEGIN + 25`. */
export const RES_CHRATR_CJK_WEIGHT = 26 as const;

/** Complex-text font posture, `RES_CHRATR_BEGIN + 29`. */
export const RES_CHRATR_CTL_POSTURE = 30 as const;

/** Complex-text font weight, `RES_CHRATR_BEGIN + 30`. */
export const RES_CHRATR_CTL_WEIGHT = 31 as const;

/** First WhichId after Writer character-format items. */
export const RES_CHRATR_END = 49 as const;

/** Ranged text auto-format attribute, `RES_TXTATR_WITHEND_BEGIN + 4`. */
export const RES_TXTATR_AUTOFMT = 53 as const;

/** Paragraph adjustment item, `RES_PARATR_BEGIN + 1`. */
export const RES_PARATR_ADJUST = 65 as const;

/** Paragraph numbering-rule name, `RES_PARATR_BEGIN + 9`. */
export const RES_PARATR_NUMRULE = 73 as const;

/** Paragraph list identity, first item after regular paragraph attributes. */
export const RES_PARATR_LIST_ID = 83 as const;

/** Paragraph list level. */
export const RES_PARATR_LIST_LEVEL = 84 as const;

/** WhichIds supported by the current Writer text-node auto-attribute set. */
export const WRITER_TEXT_NODE_WHICH_RANGES = [
  [RES_CHRATR_POSTURE, RES_CHRATR_POSTURE],
  [RES_CHRATR_UNDERLINE, RES_CHRATR_WEIGHT],
  [RES_CHRATR_CJK_POSTURE, RES_CHRATR_CJK_WEIGHT],
  [RES_CHRATR_CTL_POSTURE, RES_CHRATR_CTL_WEIGHT],
  [RES_PARATR_ADJUST, RES_PARATR_ADJUST],
  [RES_PARATR_NUMRULE, RES_PARATR_NUMRULE],
  [RES_PARATR_LIST_ID, RES_PARATR_LIST_LEVEL],
] as const;

/** WhichIds supported by the current Writer paragraph-style attribute set. */
export const WRITER_TEXT_FORMAT_COLL_WHICH_RANGES = [
  [RES_CHRATR_POSTURE, RES_CHRATR_POSTURE],
  [RES_CHRATR_UNDERLINE, RES_CHRATR_WEIGHT],
  [RES_CHRATR_CJK_POSTURE, RES_CHRATR_CJK_WEIGHT],
  [RES_CHRATR_CTL_POSTURE, RES_CHRATR_CTL_WEIGHT],
  [RES_PARATR_ADJUST, RES_PARATR_ADJUST],
  [RES_PARATR_NUMRULE, RES_PARATR_NUMRULE],
  [RES_PARATR_LIST_LEVEL, RES_PARATR_LIST_LEVEL],
] as const;

/** WhichIds stored inside the bounded SwFormatAutoFormat item set. */
export const WRITER_CHARACTER_WHICH_RANGES = [
  [RES_CHRATR_POSTURE, RES_CHRATR_POSTURE],
  [RES_CHRATR_UNDERLINE, RES_CHRATR_WEIGHT],
  [RES_CHRATR_CJK_POSTURE, RES_CHRATR_CJK_WEIGHT],
  [RES_CHRATR_CTL_POSTURE, RES_CHRATR_CTL_WEIGHT],
] as const;
