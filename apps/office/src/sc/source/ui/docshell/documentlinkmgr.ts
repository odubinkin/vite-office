/** @fileoverview Lazy client link manager owned by the Calc document. */
import { LinkManager } from "../../../../sfx2/source/appl/linkmgr2";

/** Owns the document's native Sfx2 link collection. */
export class DocumentLinkManager {
  private mpLinkManager: LinkManager | undefined;

  /** Opens or borrows the original link manager. @returns Registered link owner. */
  getLinkManager(): LinkManager {
    return (this.mpLinkManager ??= new LinkManager());
  }

  /** Borrows the owner without allocating it during export. @returns Existing manager, if requested. */
  getExistingLinkManager(): LinkManager | undefined {
    return this.mpLinkManager;
  }

  /** Releases registered links when the owning document closes. */
  Dispose(): void {
    this.mpLinkManager?.Dispose();
    this.mpLinkManager = undefined;
  }
}
