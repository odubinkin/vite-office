/** @fileoverview Implements the bounded document-state manager from pinned LibreOffice `sw/source/core/doc/DocumentStateManager.cxx`. */

import { SwModify } from "../../../inc/calbck";
import type { SwAtomicModelHint } from "../../../inc/hints";

/** Owns Writer model revision and the model notification transaction boundary. */
export class DocumentStateManager extends SwModify {
  private modelRevision = 0;

  /** Returns the monotonic revision consumed by presentation projections. @returns Current revision. */
  public GetModelRevision(): number {
    return this.modelRevision;
  }

  /** Publishes one model delta and advances the revision. @param hint - Canonical model hint. @returns Nothing. */
  public NotifyModelChange(hint: SwAtomicModelHint): void {
    this.modelRevision += 1;
    this.CallSwClientNotify(hint);
  }

  /** Runs one semantic Writer operation as a single notification transaction. @param mutation - Model mutation. @returns Mutation result. */
  public RunModelTransaction<Result>(mutation: () => Result): Result {
    return this.RunNotificationTransaction(mutation);
  }

  /** Publishes destruction and detaches all listeners. @returns Nothing. */
  public Dispose(): void {
    this.CallSwClientNotify({ kind: "document-disposed" });
    this.DisposeModify();
  }
}
