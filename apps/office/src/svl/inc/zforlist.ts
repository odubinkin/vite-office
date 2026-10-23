/** @fileoverview Original zforlist.hxx number-format type discriminator;formatter services remain separate owners. */
export const SvNumFormatType = {
  ALL: 0,
  DEFINED: 1,
  DATE: 2,
  TIME: 4,
  CURRENCY: 8,
  NUMBER: 16,
  SCIENTIFIC: 32,
  FRACTION: 64,
  PERCENT: 128,
  TEXT: 256,
  DATETIME: 6,
  LOGICAL: 1024,
  UNDEFINED: 2048,
  EMPTY: 4096,
  DURATION: 8196,
} as const;
/** Native typed flags can combine the declared format categories. */
export type SvNumFormatType = number;

/** Original number-format key block size per country/language. */
export const SV_COUNTRY_LANGUAGE_OFFSET = 10000;
