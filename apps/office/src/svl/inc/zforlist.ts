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

/** Consumed original NfIndexTableOffset values;remaining built-in families retain their separate unported generation responsibilities. */
export const NfIndexTableOffset = {
  NF_NUMBER_STANDARD: 0,
  NF_CURRENCY_START: 12,
  NF_CURRENCY_1000INT: 12,
  NF_CURRENCY_1000DEC2: 13,
  NF_CURRENCY_1000INT_RED: 14,
  NF_CURRENCY_1000DEC2_RED: 15,
  NF_CURRENCY_1000DEC2_CCC: 16,
  NF_CURRENCY_1000DEC2_DASHED: 17,
  NF_CURRENCY_END: 17,
  NF_BOOLEAN: 48,
  NF_TEXT: 49,
  NF_INDEX_TABLE_RESERVED_START: 51,
  NF_INDEX_TABLE_ENTRIES: 62,
} as const;

/** Original builtin entry limit per locale block. */
export const SV_MAX_COUNT_STANDARD_FORMATS = 100;
/** Original missing-entry unsigned32 sentinel. */
export const NUMBERFORMAT_ENTRY_NOT_FOUND = 0xffffffff;

/** Original date-format evaluation order;date parsing remains a separate responsibility. */
export const NfEvalDateFormat = {
  International: 0,
  Format: 1,
  InternationalThenFormat: 2,
  FormatThenInternational: 3,
} as const;

/** Original IsNumberFormat input flags from zforlist.hxx. */
export const SvNumInputOptions = {
  NONE: 0,
  LAX_TIME: 1,
} as const;
