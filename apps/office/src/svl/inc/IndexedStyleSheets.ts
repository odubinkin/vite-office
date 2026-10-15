/** @fileoverview Original IndexedStyleSheets public boundary and erased virtual callback protocols; one implementation owner resides in svl/source/items. */
import type { SfxStyleSheetNameReference } from "./style";
export { IndexedStyleSheets, SearchBehavior } from "../source/items/IndexedStyleSheets";
/** Original caller-supplied style predicate. */
export interface StyleSheetPredicate {
  /** Original virtual condition. @param styleSheet - Borrowed style. @returns Match. */
  Check(styleSheet: SfxStyleSheetNameReference): boolean;
}
/** Original observable Clear cleanup strategy; it does not control the JavaScript allocator. */
export interface StyleSheetDisposer {
  /** Original per-style callback before its vector slot is cleared. @param styleSheet - Actual style. @returns Nothing. */
  Dispose(styleSheet: SfxStyleSheetNameReference): void;
}
/** Original caller-supplied per-style operation. */
export interface StyleSheetCallback {
  /** Original virtual callback. @param styleSheet - Borrowed style. @returns Nothing. */
  DoIt(styleSheet: SfxStyleSheetNameReference): void;
}
