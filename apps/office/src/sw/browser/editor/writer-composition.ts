/** @fileoverview Isolates browser IME staging from the canonical Writer document graph. */

/** Model-facing extended-text-input operations derived from LibreOffice's SwEditWin boundary. */
export interface BrowserWriterCompositionPort {
  /** Commits or cancels the staged composition as one Writer undo unit. */
  readonly end: () => boolean;
  /** Starts an extended-text-input unit at the canonical selection. */
  readonly start: () => void;
  /** Synchronizes the browser selection before composition begins. */
  readonly synchronizeSelection: () => boolean;
  /** Replaces transient composition data without mutating SwDoc. */
  readonly update: (text: string) => void;
}

/** Owns transient IME state and suppression of the trailing browser input echo. */
export class BrowserWriterCompositionAdapter {
  private suppressNextCommittedInput = false;

  /** Creates an adapter over a replaceable Writer shell port. @param port - Extended-text-input operations. @returns Nothing. */
  public constructor(private readonly port: BrowserWriterCompositionPort) {}

  /** Starts native composition after capturing the canonical Writer selection. @returns Nothing. */
  public Start(): void {
    this.port.synchronizeSelection();
    this.suppressNextCommittedInput = false;
    this.port.start();
  }

  /** Retains the latest complete native composition payload. @param text - Temporary IME text. @returns Nothing. */
  public Update(text: string): void {
    this.port.update(text);
  }

  /** Commits or cancels the composition and schedules suppression of its DOM echo. @param text - Final IME text. @returns Whether SwDoc changed. */
  public End(text: string): boolean {
    this.suppressNextCommittedInput = true;
    this.port.update(text);
    return this.port.end();
  }

  /** Suppresses the cancelable trailing `insertFromComposition` event after shell commit. @param inputType - Native operation identifier. @returns Whether the event belongs to the completed composition. */
  public ConsumeBeforeInput(inputType: string): boolean {
    if (inputType !== "insertFromComposition" || !this.suppressNextCommittedInput) return false;
    this.suppressNextCommittedInput = false;
    return true;
  }
}
