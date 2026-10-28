/** @fileoverview Declares consumed character and paragraph slots from native editids.hrc. */
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

/** Native character font slot from editids.hrc. */
export const SID_ATTR_CHAR_FONT = 10007 as const;

/** Native character posture slot from editids.hrc. */
export const SID_ATTR_CHAR_POSTURE = 10008 as const;

/** Native character weight slot from editids.hrc. */
export const SID_ATTR_CHAR_WEIGHT = 10009 as const;

/** Native word-only decoration slot, SID_SVX_START +11. */
export const SID_ATTR_CHAR_WORDLINEMODE = 10011 as const;
/** Native automatic kerning slot, SID_SVX_START +67. */
export const SID_ATTR_CHAR_AUTOKERN = 10067 as const;

/** Native character strikeout slot from editids.hrc. */
export const SID_ATTR_CHAR_STRIKEOUT = 10013 as const;

/** Native character underline slot from editids.hrc. */
export const SID_ATTR_CHAR_UNDERLINE = 10014 as const;

/** Native character fontheight slot from editids.hrc. */
export const SID_ATTR_CHAR_FONTHEIGHT = 10015 as const;

/** Native character cjk font slot from editids.hrc. */
export const SID_ATTR_CHAR_CJK_FONT = 10887 as const;

/** Native character cjk fontheight slot from editids.hrc. */
export const SID_ATTR_CHAR_CJK_FONTHEIGHT = 10888 as const;

/** Native character cjk posture slot from editids.hrc. */
export const SID_ATTR_CHAR_CJK_POSTURE = 10890 as const;

/** Native character cjk weight slot from editids.hrc. */
export const SID_ATTR_CHAR_CJK_WEIGHT = 10891 as const;

/** Native character ctl font slot from editids.hrc. */
export const SID_ATTR_CHAR_CTL_FONT = 10892 as const;

/** Native character ctl fontheight slot from editids.hrc. */
export const SID_ATTR_CHAR_CTL_FONTHEIGHT = 10893 as const;

/** Native character ctl posture slot from editids.hrc. */
export const SID_ATTR_CHAR_CTL_POSTURE = 10895 as const;

/** Native character ctl weight slot from editids.hrc. */
export const SID_ATTR_CHAR_CTL_WEIGHT = 10896 as const;
/** Original shared font decoration slots from editids.hrc. */
export const SID_ATTR_CHAR_SHADOWED = 10010 as const;
export const SID_ATTR_CHAR_CONTOUR = 10012 as const;
export const SID_ATTR_CHAR_EMPHASISMARK = 10899 as const;
export const SID_ATTR_CHAR_RELIEF = 10920 as const;
export const SID_ATTR_CHAR_OVERLINE = 11568 as const;

/** Native character color slot from editids.hrc. */
export const SID_ATTR_CHAR_COLOR = 10017 as const;

/** Native language slots from editids.hrc, SID_SVX_START +20/+889/+894. */
export const SID_ATTR_CHAR_LANGUAGE = 10020 as const;
export const SID_ATTR_CHAR_CJK_LANGUAGE = 10889 as const;
export const SID_ATTR_CHAR_CTL_LANGUAGE = 10894 as const;

/** Original SID_ATTR_CHAR_CASEMAP. */
export const SID_ATTR_CHAR_CASEMAP = 10019 as const;
/** Original SID_ATTR_PARA_ADJUST. */
export const SID_ATTR_PARA_ADJUST = 10027 as const;
/** Original SID_ATTR_ULSPACE, distinct from the paragraph-dialog slot. */
export const SID_ATTR_ULSPACE = 10049 as const;
/** Original SID_ATTR_FRAMEDIRECTION. */
export const SID_ATTR_FRAMEDIRECTION = 10944 as const;
