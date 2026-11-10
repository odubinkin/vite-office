/** @fileoverview Native current-view/current-layout ownership queries from DocumentLayoutManager.cxx. Wider layouter, anchored-object and chain-editing responsibilities are not represented here. */
import type { SwDoc } from "./doc";
import type { SwViewShell } from "../view/viewsh";
import type { SwRootFrame } from "../layout/newfrm";
/** Actual document layout manager owns the source current-view pointer, not a separate list of cursor positions. */
export class DocumentLayoutManager {
  private mpCurrentView: SwViewShell | undefined;
  /** Original document owner binding and initially null current view. @param m_rDoc - Actual document. @returns Native manager. */
  constructor(readonly m_rDoc: SwDoc) {}
  /** Original borrowed view query. @returns Actual current view or no view. */
  GetCurrentViewShell(): SwViewShell | undefined {
    return this.mpCurrentView;
  }
  /** Original direct view-pointer assignment. @param view - Actual view or null binding. @returns Nothing. */
  SetCurrentViewShell(view: SwViewShell | undefined): void {
    this.mpCurrentView = view;
  }
  /** Original layout query delegates to the actual current view. @returns Actual layout or no layout. */
  GetCurrentLayout(): SwRootFrame | undefined {
    return this.mpCurrentView?.GetLayout();
  }
  /** Original source predicate: a current view implies a layout. @returns Whether a view exists. */
  HasLayout(): boolean {
    return this.mpCurrentView !== undefined;
  }
}
