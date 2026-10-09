/** @fileoverview Calc coordinate types from pinned sc/inc/types.hxx; native storage widths are enforced at address assignment boundaries. */

/** Native signed 32-bit row coordinate. */
export type SCROW = number;
/** Native signed 16-bit column coordinate. */
export type SCCOL = number;
/** Native signed 16-bit sheet coordinate. */
export type SCTAB = number;
/** Native signed 32-bit coordinate capable of holding either rows or columns. */
export type SCCOLROW = number;
