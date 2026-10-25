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
