/** @fileoverview Search dialog option bits from include/svl/srchdefs.hxx. */

/** Native search controls advertised through SID_SEARCH_OPTIONS. */
export enum SearchOptionFlags {
  NONE = 0x0000,
  SEARCH = 0x0001,
  SEARCHALL = 0x0002,
  REPLACE = 0x0004,
  REPLACE_ALL = 0x0008,
  WHOLE_WORDS = 0x0010,
  BACKWARDS = 0x0020,
  REG_EXP = 0x0040,
  EXACT = 0x0080,
  SELECTION = 0x0100,
  FAMILIES = 0x0200,
  FORMAT = 0x0400,
  SIMILARITY = 0x0800,
  WILDCARD = 0x1000,
  ALL = 0x1fff,
}
