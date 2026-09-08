/**
 * @fileoverview Declares the bounded Writer WhichIds used by the TypeScript core, matching pinned `sw/inc/hintids.hxx` numeric identities.
 */

/** Ranged text auto-format attribute, `RES_TXTATR_WITHEND_BEGIN + 4`. */
export const RES_TXTATR_AUTOFMT = 51 as const;

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
  [RES_PARATR_ADJUST, RES_PARATR_ADJUST],
  [RES_PARATR_NUMRULE, RES_PARATR_NUMRULE],
  [RES_PARATR_LIST_ID, RES_PARATR_LIST_LEVEL],
] as const;

/** WhichIds supported by the current Writer paragraph-style attribute set. */
export const WRITER_TEXT_FORMAT_COLL_WHICH_RANGES = [
  [RES_PARATR_ADJUST, RES_PARATR_ADJUST],
  [RES_PARATR_NUMRULE, RES_PARATR_NUMRULE],
  [RES_PARATR_LIST_LEVEL, RES_PARATR_LIST_LEVEL],
] as const;
