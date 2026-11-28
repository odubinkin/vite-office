/** @fileoverview Original PlaceholderType short constants from pinned IDL. */
export const PlaceholderType = {
  TEXT: 0,
  TABLE: 1,
  TEXTFRAME: 2,
  GRAPHIC: 3,
  OBJECT: 4,
} as const;

/** Published placeholder kinds. */
export type PlaceholderType = (typeof PlaceholderType)[keyof typeof PlaceholderType];
