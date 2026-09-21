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
  /** Deletes the current selection or forward grapheme. */
  readonly deleteForward: () => boolean;
  /** Deletes the current selection or preceding grapheme. */
  readonly deleteLeft: () => boolean;
  /** Deletes only the current Writer selection. */
  readonly deleteSelection: () => boolean;
  /** Inserts ordinary text through Writer typing semantics. */
  readonly insert: (text: string) => boolean;
  /** Replaces the current selection without typing-group semantics. */
  readonly replace: (text: string) => boolean;
  /** Reapplies one Writer undo action. */
  readonly redo: () => boolean;
  /** Applies the active paragraph's list kind. */
  readonly setListKind: (kind: "bullet" | "numbered") => boolean;
  /** Inserts a paragraph break at the Writer cursor. */
  readonly splitNode: () => boolean;
  /** Synchronizes the current browser selection into the canonical Writer cursor. */
  readonly synchronizeSelection: () => boolean;
  /** Toggles one Writer character attribute. */
  readonly toggleCharacterFormat: (format: "bold" | "italic" | "underline") => boolean;
  /** Reverts one Writer undo action. */
  readonly undo: () => boolean;
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
    const { data, inputType } = intent;
    switch (inputType) {
      case "insertText":
        if (data !== null && data.length > 0) this.port.insert(data);
        return "handled";
      case "insertReplacementText":
        if (data !== null && data.length > 0) this.port.replace(data);
        return "handled";
      case "insertLineBreak":
      case "insertParagraph":
        this.port.splitNode();
        return "handled";
      case "deleteContentBackward":
        this.port.deleteLeft();
        return "handled";
      case "deleteContentForward":
        this.port.deleteForward();
        return "handled";
      case "deleteByCut":
      case "deleteByDrag":
      case "deleteContent":
        this.port.deleteSelection();
        return "handled";
      case "formatBold":
        this.port.toggleCharacterFormat("bold");
        return "handled";
      case "formatItalic":
        this.port.toggleCharacterFormat("italic");
        return "handled";
      case "formatUnderline":
        this.port.toggleCharacterFormat("underline");
        return "handled";
      case "insertOrderedList":
        this.port.setListKind("numbered");
        return "handled";
      case "insertUnorderedList":
        this.port.setListKind("bullet");
        return "handled";
      case "insertFromComposition":
      case "insertFromDrop":
      case "insertFromPaste":
        return "handled";
      case "historyUndo":
        this.port.undo();
        return "handled";
      case "historyRedo":
        this.port.redo();
        return "handled";
      default:
        return "unsupported";
    }
  }
}
