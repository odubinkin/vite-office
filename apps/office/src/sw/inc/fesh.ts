/** @fileoverview Declares native table mouse classification from Writer fesh.hxx. */
/** Source table pointer kinds; vertical and RTL owners are declared but not represented by this view. */
export enum SwTab {
  COL_NONE,
  COL_HORI,
  COL_VERT,
  ROW_HORI,
  ROW_VERT,
  SEL_HORI,
  SEL_HORI_RTL,
  ROWSEL_HORI,
  ROWSEL_HORI_RTL,
  COLSEL_HORI,
  SEL_VERT,
  ROWSEL_VERT,
  COLSEL_VERT,
}
/** Physical device point supplied by the platform window. */
export interface SwTableMousePoint {
  readonly x: number;
  readonly y: number;
}
