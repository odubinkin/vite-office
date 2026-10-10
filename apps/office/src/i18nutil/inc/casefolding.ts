/** @fileoverview Original casefolding.hxx flags and initialized mapping value layouts used by the locale-aware scalar layer. */

/** Original mapping flags; comments in upstream swap the first two descriptions, while the numeric contracts are retained. */
export enum MappingType {
  NONE = 0x00,
  LowerToUpper = 0x01,
  UpperToLower = 0x02,
  ToUpper = 0x04,
  ToLower = 0x08,
  ToTitle = 0x10,
  SimpleFolding = 0x20,
  FullFolding = 0x40,
  // Original OR of all seven mapping bits, expressed as the compiled constant.
  CasedLetterMask = 0x7f,
  NotValue = 0x80,
}

/** Original fixed UTF16 mapping capacity. */
export const NMAPPINGMAX = 3;

/** Original table value; the type flag determines whether value is a unit or an extras address. */
export interface Value {
  readonly type: number;
  readonly value: number;
}

/** Original initialized mapping fields; the three-unit array preserves zeros beyond nmap. */
export interface Mapping {
  type: number;
  nmap: number;
  map: Uint16Array;
}
