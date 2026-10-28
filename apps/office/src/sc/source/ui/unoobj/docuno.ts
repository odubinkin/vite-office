/** @fileoverview Original ScModelObj shell/document getters, actual native observer registration and represented Dying notification. Full UNO/property/rendering/base-model event services remain unported; not a complete spreadsheet component. */
import { SfxBaseModel } from "../../../../sfx2/source/doc/sfxbasemodel";
import { SfxHint, SfxHintId } from "../../../../svl/inc/hint";
import type { SfxBroadcaster } from "../../../../svl/source/notify/SfxBroadcaster";
import type { ScDocShell } from "../docshell/docsh";
import type { ScDocument } from "../../../inc/document";
/** Original model owns separate base-model shell and Calc shell references; Dying clears the latter. */
export class ScModelObj extends SfxBaseModel {
  /** Original represented constructor registers on the document's actual UNO broadcaster in addition to the base shell registration. @param pDocShell - Actual shell, optionally null for options-only construction. @returns Model. */
  constructor(private pDocShell: ScDocShell | null) {
    super(pDocShell);
    if (pDocShell !== null) pDocShell.GetDocument().AddUnoObject(this);
  }
  /** Original nullable access through the shell, not a captured or copied document. @returns Actual current document. */
  GetDocument(): ScDocument | null {
    return this.pDocShell?.GetDocument() ?? null;
  }
  /** Original nullable Calc shell identity. @returns Borrowed shell. */
  GetEmbeddedObject(): ScDocShell | null {
    return this.pDocShell;
  }
  /** Original represented Dying pointer invalidation and unconditional base dispatch. Formatter aggregation, render caches and calculate-event branches remain unported. @param broadcaster - Native source. @param hint - Actual hint. @returns Nothing. */
  override Notify(broadcaster: SfxBroadcaster, hint: SfxHint): void {
    if (hint.GetId() === SfxHintId.Dying) this.pDocShell = null;
    if (hint.GetId() === SfxHintId.DataChanged)
      throw new Error(
        "ScModelObj render-cache and calculate-event notification services are not implemented",
      );
    super.Notify(broadcaster, hint);
  }
  /** Explicit native destructor binding removes document registration before destroying the model base. Aggregation/printing owners remain unported. @returns Nothing. */
  override Dispose(): void {
    if (this.pDocShell !== null) this.pDocShell.GetDocument().RemoveUnoObject(this);
    super.Dispose();
  }
}
