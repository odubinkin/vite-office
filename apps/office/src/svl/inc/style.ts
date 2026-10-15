/** @fileoverview Canonical style.hxx public value/type/class boundary; source-owned declarations stay separate from eager JS class exports so every native implementation can initialize independently. */
export { SfxStyleFamily, SfxStyleSearchBits } from "./style-values";
export type {
  SfxStyleSheetNameReference,
  SfxStyleSheetSearchReference,
  SfxStyleSheetBasePoolIndexReference,
} from "./style-values";

export {
  SfxStyleSheetBase,
  SfxStyleSheetBasePool,
  SfxStyleSheetHint,
  SfxStyleSheetModifiedHint,
  SfxStyleSheetPoolHint,
} from "../source/items/style-model";
export { SfxStyleSheetIterator } from "../source/items/style";
export { SfxStyleSheet, SfxStyleSheetPool } from "../source/items/style-sheet";
