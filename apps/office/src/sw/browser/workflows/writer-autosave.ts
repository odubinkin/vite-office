/** @fileoverview Writer domain callbacks for the shared browser autosave scheduler;preserves all existing timing defaults. */
import type { SwDocShell } from "../../source/uibase/app/docsh";
import type { WriterOdtStore } from "../storage/writer-odt-store";
import { autosaveWriter, hasWriterContent } from "./writer-odt-io";
import { BrowserAutosaveController } from "../../../framework/browser/workflows/document-autosave";
export {
  BROWSER_AUTOSAVE_INTERVAL_MS as WRITER_AUTOSAVE_INTERVAL_MS,
  BROWSER_AUTOSAVE_IDLE_MS as WRITER_AUTOSAVE_IDLE_MS,
  BROWSER_AUTOSAVE_MAX_WAIT_MS as WRITER_AUTOSAVE_MAX_WAIT_MS,
} from "../../../framework/browser/workflows/document-autosave";
/** Writer content and medium ownership stay with its document shell. */
export class WriterAutosaveController extends BrowserAutosaveController {
  /** Connects Writer persistence to the common scheduler. @param docShell - Source shell. @param store - Primary ODT store. @param target - Browser input target. @param now - Clock. @returns Controller. */
  constructor(
    docShell: SwDocShell,
    store: WriterOdtStore,
    target: Pick<Document, "addEventListener" | "removeEventListener"> = globalThis.document,
    now: () => number = Date.now,
  ) {
    super(
      {
        Subscribe:
          /** Subscribes actual Writer changes. @param listener - Invalidation. @returns Cleanup. */ (
            listener,
          ) => docShell.Subscribe(listener),
        NeedsSave: /** Reads Writer dirty/content state. @returns Needs write. */ () =>
          docShell.IsModified() && hasWriterContent(docShell.GetDoc()),
        Save: /** Writes canonical ODT. @returns Write result. */ () =>
          autosaveWriter(docShell, store),
        OnError: /** Publishes Writer medium failure. @param error - Failure. @returns Nothing. */ (
          error,
        ) =>
          docShell.SetMediumOperation(
            "save",
            "failed",
            docShell.GetDocumentState().contentGeneration,
            error instanceof Error ? error.message : String(error),
          ),
      },
      target,
      now,
    );
  }
}
