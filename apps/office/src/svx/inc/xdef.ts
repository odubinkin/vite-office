/** @fileoverview Consumed native toolbox default colors from include/svx/xdef.hxx. */
import { Color } from "../../tools/inc/color";
/** Original dark red2 font-button default. */
export const COL_DEFAULT_FONT = Object.freeze(new Color(0xc9211e));
/** Original yellow background/highlight button default. */
export const COL_DEFAULT_HIGHLIGHT = Object.freeze(new Color(0xffff00));

/** Original Blue frame-line toolbox default,independent of the Calc view default line. */
export const COL_DEFAULT_FRAMELINE = Object.freeze(new Color(0x2a6099));

/** Original first drawing-layer WhichId. */
export const XATTR_START = 1000 as const;
/** Original inclusive final drawing-layer WhichId, XATTR_TEXT_LAST. */
export const XATTR_END = 1047 as const;

/** Original inclusive DrawingLayer fill range. */
export const XATTR_FILL_FIRST = 1014 as const;
/** Original fill-style identity. */
export const XATTR_FILLSTYLE = 1014 as const;
/** Original fill-color identity. */
export const XATTR_FILLCOLOR = 1015 as const;
/** Original solid-fill transparency identity. */
export const XATTR_FILLTRANSPARENCE = 1019 as const;
/** Original inclusive last fill identity, including slide-background policy. */
export const XATTR_FILL_LAST = 1034 as const;
/** Original default drawing fill, independent of Writer's NONE override. */
export const COL_DEFAULT_SHAPE_FILLING = Object.freeze(new Color(0x729fcf));

/** Original slide-background flag at the inclusive fill-range end. */
export const XATTR_FILLUSESLIDEBACKGROUND = 1034 as const;
