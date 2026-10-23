/** @fileoverview Declares consumed paragraph slots from native editids.hrc. */
/** Native paragraph upper/lower spacing slot, SID_SVX_START +42. */
export const SID_ATTR_PARA_ULSPACE = 10042 as const;
/** Native combined paragraph indent slot, SID_SVX_START +43. */
export const SID_ATTR_PARA_LRSPACE = 10043 as const;

/** Native paragraph line-spacing slot, SID_SVX_START +33. */
export const SID_ATTR_PARA_LINESPACE = 10033 as const;

/** Native tab-stop item and page context slots, SID_SVX_START +2..5. */
export const SID_ATTR_TABSTOP = 10002 as const;
export const SID_ATTR_TABSTOP_DEFAULTS = 10003 as const;
export const SID_ATTR_TABSTOP_POS = 10004 as const;
export const SID_ATTR_TABSTOP_OFFSET = 10005 as const;
/** Original combined LR item used by native paragraph tab pages, distinct from the sidebar slot. */
export const SID_ATTR_LRSPACE = 10048 as const;
