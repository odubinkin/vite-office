/** @fileoverview Normalizes browser editing intent before it crosses into Writer shell code. */

/** Browser-neutral edit intent derived from one cancelable `beforeinput` event. */
export interface BrowserWriterEditIntent {
  /** Optional inserted text. */
  readonly data: string | null;
  /** Input Events operation identifier. */
  readonly inputType: string;
}

/** Result of routing one browser edit intent. */
export type BrowserWriterEditDisposition = "handled" | "native-composition" | "unsupported";

/** Model-facing operations consumed by the browser controller. */
export interface BrowserWriterEditPort {
  /** Executes a supported input operation against the canonical Writer selection. */
  readonly executeIntent: (inputType: string, data: string | null) => boolean;
  /** Synchronizes the current browser selection into the canonical Writer cursor. */
  readonly synchronizeSelection: () => boolean;
}

/**
 * Browser counterpart of the bounded `SwEditWin::Command`/`KeyInput` intent boundary.
 *
 * It knows Input Events vocabulary but owns no document mutation: every accepted operation is
 * executed by the injected Writer shell port.
 */
export class BrowserWriterEditController {
  /** Creates a controller over replaceable model and diagnostic ports. @param port - Inward Writer boundary. @returns Nothing. */
  public constructor(private readonly port: BrowserWriterEditPort) {}

  /** Routes one normalized pre-mutation intent. @param intent - Browser-neutral edit request. @returns Routing disposition. */
  public HandleIntent(intent: BrowserWriterEditIntent): BrowserWriterEditDisposition {
    if (
      intent.inputType === "insertCompositionText" ||
      intent.inputType === "deleteCompositionText"
    )
      return "native-composition";
    if (!this.port.synchronizeSelection()) return "unsupported";
    return this.port.executeIntent(intent.inputType, intent.data) ? "handled" : "unsupported";
  }
}
