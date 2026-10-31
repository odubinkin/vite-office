/** @fileoverview Native SwViewShell intrusive view ring and current-view teardown from viewsh.hxx/vnew.cxx. The pre-existing portable SwModify notification primary base is retained on the same cursor-shell identity; no extra cursor registry or surrogate view is allocated. */
import { SwModify } from "../../../inc/calbck";
import { withRing } from "../../../inc/ring";
import type { SwDoc } from "../doc/doc";
import type { SwRootFrame } from "../layout/newfrm";
/** Native multiple-inheritance primary-base binding; no independent ring object is allocated. */
const ViewRing = withRing(SwModify);
/** Original view-ring facet on the actual current cursor-shell owner. Wider native window/output/paint/print ownership is not claimed. */
export abstract class SwViewShell extends ViewRing<SwViewShell> {
  private boundDocument: SwDoc | undefined;
  /** Actual represented shell document query. @returns Native document. */
  public abstract GetDoc(): SwDoc;
  /** Actual represented layout query. @returns Native layout. */
  public abstract GetLayout(): SwRootFrame;
  /** Joins the document's actual view ring after shell construction. Explicit rebind supports the existing persistent browser shell across New/Open; native desktop shells keep their document identity for life. @param doc - Actual current document. @returns Nothing. */
  protected BindViewDocument(doc: SwDoc): void {
    if (this.boundDocument === doc) return;
    this.ReleaseViewDocument();
    this.boundDocument = doc;
    const access = doc.getIDocumentLayoutAccess(),
      current = access.GetCurrentViewShell();
    this.MoveTo(current);
    if (!current) access.SetCurrentViewShell(this);
  }
  /** Original source teardown chooses the first other live ring member when removing the current view, then the native Ring destructor unlinks this identity. @returns Nothing. */
  protected ReleaseViewDocument(): void {
    const access = this.boundDocument?.getIDocumentLayoutAccess();
    if (access?.GetCurrentViewShell() === this) {
      access.SetCurrentViewShell(undefined);
      for (const shell of this.GetRingContainer())
        if (shell !== this) {
          access.SetCurrentViewShell(shell);
          break;
        }
    }
    this.MoveTo();
    this.boundDocument = undefined;
  }
}
