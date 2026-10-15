/** @fileoverview Original style-family declaration from style.hxx; style-sheet model classes remain separate owners. */
/** Original style-family flags and All sentinel. */
export enum SfxStyleFamily {
  None = 0x00,
  Char = 0x01,
  Para = 0x02,
  Frame = 0x04,
  Page = 0x08,
  Pseudo = 0x10,
  Table = 0x20,
  Cell = 0x40,
  All = 0x7fff,
}

import type { OUStringConstReference } from "../../sal/inc/rtl/ustring";
/** Erased borrowed SfxStyleSheetBase name/family operations consumed by IndexedStyleSheets. This neither constructs nor substitutes a stylesheet/pool owner. */
export interface SfxStyleSheetNameReference {
  /** Original stable const name view. @returns Name. */
  GetName(): OUStringConstReference;
  /** Original style family. @returns Family. */
  GetFamily(): SfxStyleFamily;
}
