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

/** Original application/search flags from include/svl/style.hxx, including equal-valued Calc/Writer bits. */
export enum SfxStyleSearchBits {
  ScStandard = 0x0001,
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values -- Native Calc ScStandard and Writer SwText intentionally share bit 0x0001.
  SwText = 0x0001,
  SwChapter = 0x0002,
  SwList = 0x0004,
  SwIndex = 0x0008,
  SwExtra = 0x0010,
  SwHtml = 0x0020,
  SwCondColl = 0x0040,
  Auto = 0x0000,
  Favourite = 0x0100,
  Hidden = 0x0200,
  ReadOnly = 0x2000,
  Used = 0x4000,
  UserDefined = 0x8000,
  AllVisible = 0xe07f,
  All = 0xe27f,
}

import type { IndexedStyleSheets } from "./IndexedStyleSheets";
/** Erased borrowed native style operations consumed by SfxStyleSheetIterator. This neither constructs nor replaces SfxStyleSheetBase. */
export interface SfxStyleSheetSearchReference extends SfxStyleSheetNameReference {
  /** Original style mask. @returns Flags. */
  GetMask(): SfxStyleSearchBits;
  /** Original virtual usage query. @returns Whether used. */
  IsUsed(): boolean;
  /** Original virtual visibility query. @returns Whether hidden. */
  IsHidden(): boolean;
}
/** Erased borrowed native pool index operation, accessed by the original friend iterator. No substitute pool owner or service is constructed. */
export interface SfxStyleSheetBasePoolIndexReference {
  /** Original protected pool index view. @returns Actual indexed collection. */
  GetIndexedStyleSheets(): IndexedStyleSheets;
}

export {
  SfxStyleSheetBase,
  SfxStyleSheetBasePool,
  SfxStyleSheetHint,
  SfxStyleSheetModifiedHint,
  SfxStyleSheetPoolHint,
} from "../source/items/style-model";
export { SfxStyleSheetIterator } from "../source/items/style";
