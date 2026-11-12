/** @fileoverview Original IndexedStyleSheets public boundary and erased virtual callback protocols; one implementation owner resides in svl/source/items. */
import type { Reference } from "../../cppu/inc/com/sun/star/uno/Reference";
import type { SfxStyleSheetNameReference } from "./style";
export { IndexedStyleSheets, SearchBehavior } from "../source/items/IndexedStyleSheets";
/** Original caller-supplied style predicate. */
export interface StyleSheetPredicate {
  /** Original virtual condition. @param styleSheet - Borrowed style. @returns Match. */
  Check(styleSheet: SfxStyleSheetNameReference): boolean;
}
/** Original observable Clear cleanup strategy; its by-value argument owns a strong reference. */
export interface StyleSheetDisposer {
  /** Original per-style callback before its vector slot is cleared. @param styleSheet - Actual style. @returns Nothing. */
  Dispose(styleSheet: Reference<SfxStyleSheetNameReference>): void;
}
/** Original caller-supplied per-style operation. */
export interface StyleSheetCallback {
  /** Original virtual callback. @param styleSheet - Borrowed style. @returns Nothing. */
  DoIt(styleSheet: SfxStyleSheetNameReference): void;
}
