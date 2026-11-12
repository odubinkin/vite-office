/** @fileoverview Defines native Writer table-property WhichIds from pinned sw/inc/cmdid.h and SID_SW_START20000. */
/** Borrowed SwTableRep item, FN_FORMAT +99. */
export const FN_TABLE_REP = 20499 as const;
/** Native box vertical alignment, FN_FORMAT +188. */
export const FN_TABLE_SET_VERT_ALIGN = 20588 as const;
/** Changed table name, FN_PARAM +44. */
export const FN_PARAM_TABLE_NAME = 21144 as const;
/** Changed repeated headline count, FN_PARAM +50. */
export const FN_PARAM_TABLE_HEADLINE = 21150 as const;
/** Original FN_VIEW20200 plus53,SfxUInt16Item. */
export const FN_HSCROLL_METRIC = 20253 as const;
/** Original FN_VIEW20200 plus54,SfxUInt16Item. */
export const FN_VSCROLL_METRIC = 20254 as const;

/** Native table sidebar row height slot. */
export const SID_ATTR_TABLE_ROW_HEIGHT = 20593 as const;
/** Native table sidebar column width slot. */
export const SID_ATTR_TABLE_COLUMN_WIDTH = 21794 as const;
/** Native table sidebar alignment slot. */
export const SID_ATTR_TABLE_ALIGNMENT = 21760 as const;
/** Native table sidebar left spacing slot. */
export const SID_ATTR_TABLE_LEFT_SPACE = 21761 as const;
/** Native table sidebar right spacing slot. */
export const SID_ATTR_TABLE_RIGHT_SPACE = 21762 as const;

/** Native FN_FORMAT +11, explicit SfxBoolItem request. */
export const FN_SET_SUPER_SCRIPT = 20411 as const;
/** Native FN_FORMAT +12, explicit SfxBoolItem request. */
export const FN_SET_SUB_SCRIPT = 20412 as const;

/** Native ListAutoFormat UNO dispatch, FN_EXTRA2(22200) +11; not a pooled Which. */
export const FN_UNO_PARA_NUM_AUTO_FORMAT = 22211 as const;

/** Original cursor paragraph-style dispatch, FN_EXTRA2 +9. */
export const FN_UNO_PARA_STYLE = 22209;
/** Original numbering start dispatch, FN_EXTRA2 +13. */
export const FN_UNO_NUM_START_VALUE = 22213;
/** Original numbering level dispatch, FN_EXTRA2 +14. */
export const FN_UNO_NUM_LEVEL = 22214;
/** Original numbering rules dispatch, FN_EXTRA2 +15. */
export const FN_UNO_NUM_RULES = 22215;
/** Original follow-style dispatch, FN_EXTRA2 +59. */
export const FN_UNO_FOLLOW_STYLE = 22259;
/** Original numbered-paragraph flag dispatch, FN_EXTRA2 +69. */
export const FN_UNO_IS_NUMBER = 22269;
/** Original list identity dispatch, FN_EXTRA2 +107. */
export const FN_UNO_LIST_ID = 22307;
/** Original numbering restart dispatch, FN_FORMAT2 +138. */
export const FN_NUMBER_NEWSTART = 21738;
