/** @fileoverview Adapts native clipboard events to model selections and Writer command ports. */

import { createWriterClipboardSelection } from "../../source/uibase/dochdl/swdtflvr";
import type { WriterCursorSelection } from "../../source/uibase/wrtsh/wrtsh";

/** Clipboard event surface used without React event ownership. */
export interface BrowserWriterClipboardEvent {
  readonly clipboardData: DataTransfer;
  readonly preventDefault: () => void;
}

/** Injected selection and command operations for native clipboard events. */
export interface BrowserWriterClipboardPort {
  readonly cut: (selection: WriterCursorSelection) => void;
  readonly getSelection: () => Selection | null;
  readonly mapSelection: (selection: Selection | null) => WriterCursorSelection | undefined;
  readonly paste: (selection: WriterCursorSelection, data: DataTransfer) => void;
}

/** Owns browser clipboard mechanics while leaving Writer mutation to commands. */
export class BrowserWriterClipboardEvents {
  /** Creates an adapter over injected browser/model ports. @param port - Clipboard boundary. @returns Nothing. */
  public constructor(private readonly port: BrowserWriterClipboardPort) {}

  /** Writes the bounded Writer transfer payload. @param event - Native clipboard event. @returns Whether default serialization was replaced. */
  public Copy(event: BrowserWriterClipboardEvent): boolean {
    const payload = createWriterClipboardSelection(this.port.getSelection());
    if (payload === undefined) return false;
    event.preventDefault();
    event.clipboardData.setData("text/plain", payload.plainText);
    event.clipboardData.setData("text/html", payload.html);
    return true;
  }

  /** Writes and deletes any canonical non-collapsed Writer selection. @param event - Native clipboard event. @returns Whether Cut was routed. */
  public Cut(event: BrowserWriterClipboardEvent): boolean {
    const nativeSelection = this.port.getSelection();
    const selection = this.port.mapSelection(nativeSelection);
    const payload = createWriterClipboardSelection(nativeSelection);
    if (selection?.mark === undefined || payload === undefined) return false;
    event.preventDefault();
    event.clipboardData.setData("text/plain", payload.plainText);
    event.clipboardData.setData("text/html", payload.html);
    this.port.cut(selection);
    return true;
  }

  /** Routes native Paste at the canonical caret or range. @param event - Native clipboard event. @returns Whether Paste was routed. */
  public Paste(event: BrowserWriterClipboardEvent): boolean {
    const selection = this.port.mapSelection(this.port.getSelection());
    if (selection === undefined) return false;
    event.preventDefault();
    this.port.paste(selection, event.clipboardData);
    return true;
  }
}
