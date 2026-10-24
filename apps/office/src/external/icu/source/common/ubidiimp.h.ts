/** @fileoverview Consumed ICU78.3 default-resolver direction constants and value records; native allocation,ownership,reordering options and inverse modes are not emulated. */
// Copyright Unicode, Inc. and others. Unicode License V3: https://www.unicode.org/license.txt
export const L = 0,
  R = 1,
  EN = 2,
  ES = 3,
  ET = 4,
  AN = 5,
  CS = 6,
  B = 7,
  S = 8,
  WS = 9,
  ON = 10,
  LRE = 11,
  LRO = 12,
  AL = 13,
  RLE = 14,
  RLO = 15,
  PDF = 16,
  NSM = 17,
  BN = 18,
  FSI = 19,
  LRI = 20,
  RLI = 21,
  PDI = 22,
  ENL = 23,
  ENR = 24;
export const UBIDI_LEVEL_OVERRIDE = 0x80,
  UBIDI_MAX_EXPLICIT_LEVEL = 125,
  ISOLATE = 0x100;
/** Original directional-property bit. @param prop - Direction value. @returns Flags bit. */
export function DIRPROP_FLAG(prop: number): number {
  return 1 << prop;
}
export const DIRPROP_FLAG_MULTI_RUNS = 1 << 31;
export const MASK_LTR =
  (1 << L) | (1 << EN) | (1 << ENL) | (1 << ENR) | (1 << AN) | (1 << LRE) | (1 << LRO) | (1 << LRI);
export const MASK_RTL = (1 << R) | (1 << AL) | (1 << RLE) | (1 << RLO) | (1 << RLI);
export const MASK_EXPLICIT = (1 << LRE) | (1 << LRO) | (1 << RLE) | (1 << RLO) | (1 << PDF);
export const MASK_ISO = (1 << LRI) | (1 << RLI) | (1 << FSI) | (1 << PDI);
export const MASK_BN_EXPLICIT = (1 << BN) | MASK_EXPLICIT;
export const MASK_B_S = (1 << B) | (1 << S);
export const MASK_WS = MASK_B_S | (1 << WS) | MASK_BN_EXPLICIT | MASK_ISO;
export const MASK_POSSIBLE_N = (1 << ON) | (1 << CS) | (1 << ES) | (1 << ET) | MASK_WS;
export const MASK_EMBEDDING = (1 << NSM) | MASK_POSSIBLE_N;
/** Actual consumed resolver state; arrays retain source UTF16 indexing. */
export interface BidiState {
  readonly text: string;
  readonly paraLevel: 0 | 1;
  readonly dirProps: number[];
  readonly levels: number[];
  readonly paras: { limit: number; level: number }[];
  flags: number;
  isolateCount: number;
  readonly isolates: { stateImp: number; state: number; start1: number; startON: number }[];
}
