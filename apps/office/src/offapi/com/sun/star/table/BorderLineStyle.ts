/** @fileoverview Declares the native numeric border styles from BorderLineStyle.idl. */
export enum BorderLineStyle {
  NONE = 32767,
  SOLID = 0,
  DOTTED = 1,
  DASHED = 2,
  DOUBLE = 3,
  THINTHICK_SMALLGAP = 4,
  THINTHICK_MEDIUMGAP = 5,
  THINTHICK_LARGEGAP = 6,
  THICKTHIN_SMALLGAP = 7,
  THICKTHIN_MEDIUMGAP = 8,
  THICKTHIN_LARGEGAP = 9,
  EMBOSSED = 10,
  ENGRAVED = 11,
  OUTSET = 12,
  INSET = 13,
  FINE_DASHED = 14,
  DOUBLE_THIN = 15,
  DASH_DOT = 16,
  DASH_DOT_DOT = 17,
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values -- Native maximum aliases the final style.
  BORDER_LINE_STYLE_MAX = 17,
}
