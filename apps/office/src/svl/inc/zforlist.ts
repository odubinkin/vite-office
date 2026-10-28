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

/** Original complete NfIndexTableOffset values and aliases,distinct from indexTable runtime format keys. */
export const NfIndexTableOffset = {
  NF_NUMERIC_START: 0,
  NF_NUMBER_START: 0,
  NF_NUMBER_STANDARD: 0,
  NF_NUMBER_INT: 1,
  NF_NUMBER_DEC2: 2,
  NF_NUMBER_1000INT: 3,
  NF_NUMBER_1000DEC2: 4,
  NF_NUMBER_SYSTEM: 5,
  NF_NUMBER_END: 5,
  NF_SCIENTIFIC_START: 6,
  NF_SCIENTIFIC_000E000: 6,
  NF_SCIENTIFIC_000E00: 7,
  NF_SCIENTIFIC_END: 7,
  NF_PERCENT_START: 8,
  NF_PERCENT_INT: 8,
  NF_PERCENT_DEC2: 9,
  NF_PERCENT_END: 9,
  NF_FRACTION_START: 10,
  NF_FRACTION_1D: 10,
  NF_FRACTION_2D: 11,
  NF_FRACTION_END: 11,
  NF_NUMERIC_END: 11,
  NF_CURRENCY_START: 12,
  NF_CURRENCY_1000INT: 12,
  NF_CURRENCY_1000DEC2: 13,
  NF_CURRENCY_1000INT_RED: 14,
  NF_CURRENCY_1000DEC2_RED: 15,
  NF_CURRENCY_1000DEC2_CCC: 16,
  NF_CURRENCY_1000DEC2_DASHED: 17,
  NF_CURRENCY_END: 17,
  NF_DATE_START: 18,
  NF_DATE_SYSTEM_SHORT: 18,
  NF_DATE_SYSTEM_LONG: 19,
  NF_DATE_SYS_DDMMYY: 20,
  NF_DATE_SYS_DDMMYYYY: 21,
  NF_DATE_SYS_DMMMYY: 22,
  NF_DATE_SYS_DMMMYYYY: 23,
  NF_DATE_DIN_DMMMYYYY: 24,
  NF_DATE_SYS_DMMMMYYYY: 25,
  NF_DATE_DIN_DMMMMYYYY: 26,
  NF_DATE_SYS_NNDMMMYY: 27,
  NF_DATE_DEF_NNDDMMMYY: 28,
  NF_DATE_SYS_NNDMMMMYYYY: 29,
  NF_DATE_SYS_NNNNDMMMMYYYY: 30,
  NF_DATE_DIN_MMDD: 31,
  NF_DATE_DIN_YYMMDD: 32,
  NF_DATE_DIN_YYYYMMDD: 33,
  NF_DATE_ISO_YYYYMMDD: 33,
  NF_DATE_SYS_MMYY: 34,
  NF_DATE_SYS_DDMMM: 35,
  NF_DATE_MMMM: 36,
  NF_DATE_QQJJ: 37,
  NF_DATE_WW: 38,
  NF_DATE_END: 38,
  NF_TIME_START: 39,
  NF_TIME_HHMM: 39,
  NF_TIME_HHMMSS: 40,
  NF_TIME_HHMMAMPM: 41,
  NF_TIME_HHMMSSAMPM: 42,
  NF_TIME_HH_MMSS: 43,
  NF_TIME_MMSS00: 44,
  NF_TIME_HH_MMSS00: 45,
  NF_TIME_END: 45,
  NF_DATETIME_START: 46,
  NF_DATETIME_SYSTEM_SHORT_HHMM: 46,
  NF_DATETIME_SYS_DDMMYYYY_HHMMSS: 47,
  NF_DATETIME_END: 47,
  NF_BOOLEAN: 48,
  NF_TEXT: 49,
  NF_INDEX_TABLE_LOCALE_DATA_DEFAULTS: 50,
  NF_DATETIME_SYS_DDMMYYYY_HHMM: 50,
  NF_INDEX_TABLE_RESERVED_START: 51,
  NF_FRACTION_3D: 51,
  NF_FRACTION_2: 52,
  NF_FRACTION_4: 53,
  NF_FRACTION_8: 54,
  NF_FRACTION_16: 55,
  NF_FRACTION_10: 56,
  NF_FRACTION_100: 57,
  NF_DATETIME_ISO_YYYYMMDD_HHMMSS: 58,
  NF_DATETIME_ISO_YYYYMMDD_HHMMSS000: 59,
  NF_DATETIME_ISO_YYYYMMDDTHHMMSS: 60,
  NF_DATETIME_ISO_YYYYMMDDTHHMMSS000: 61,
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

/** Original zforlist.hxx fixed token capacity. */
export const NF_MAX_FORMAT_SYMBOLS = 100;
