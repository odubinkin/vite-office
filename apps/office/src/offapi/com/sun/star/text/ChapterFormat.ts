/** @fileoverview Original ChapterFormat short constants from pinned IDL. */
export const ChapterFormat = {
  NAME: 0,
  NUMBER: 1,
  NAME_NUMBER: 2,
  NO_PREFIX_SUFFIX: 3,
  DIGIT: 4,
} as const;

/** Published sal_Int16 values accepted by the Chapter service. */
export type ChapterFormat = (typeof ChapterFormat)[keyof typeof ChapterFormat];
