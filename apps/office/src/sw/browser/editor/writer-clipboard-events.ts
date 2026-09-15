/** @fileoverview Adapts native clipboard events to model selections and Writer command ports. */

import type { WriterClipboardSelection } from "../../source/uibase/dochdl/swdtflvr";
import {
  parseWriterClipboardPaste,
  type WriterClipboardPaste,
} from "../../source/filter/html/swhtml";

/** Translates native DataTransfer MIME values into the bounded Writer HTML import. @param data - Native transfer reader. @param document - Detached-element owner used by the HTML filter. @returns Parsed bounded paste or undefined for an empty transfer. */
export function readBrowserWriterClipboardPaste(
  data: Pick<DataTransfer, "getData">,
  document: Document,
): WriterClipboardPaste | undefined {
  return parseWriterClipboardPaste(data.getData("text/html"), data.getData("text/plain"), document);
}

/** Clipboard event surface used without React event ownership. */
export interface BrowserWriterClipboardEvent {
  readonly clipboardData: DataTransfer;
  readonly preventDefault: () => void;
}

/** Injected selection and command operations for native clipboard events. */
export interface BrowserWriterClipboardPort {
  readonly createSelection: () => WriterClipboardSelection | undefined;
  readonly cut: () => void;
  readonly paste: (data: DataTransfer) => void;
  readonly synchronizeSelection: () => boolean;
}

/** Owns browser clipboard mechanics while leaving Writer mutation to commands. */
export class BrowserWriterClipboardEvents {
  /** Creates an adapter over injected browser/model ports. @param port - Clipboard boundary. @returns Nothing. */
  public constructor(private readonly port: BrowserWriterClipboardPort) {}

  /** Writes the bounded Writer transfer payload. @param event - Native clipboard event. @returns Whether default serialization was replaced. */
  public Copy(event: BrowserWriterClipboardEvent): boolean {
    if (!this.port.synchronizeSelection()) return false;
    const payload = this.port.createSelection();
    if (payload === undefined) return false;
    event.preventDefault();
    event.clipboardData.setData("text/plain", payload.plainText);
    event.clipboardData.setData("text/html", payload.html);
    return true;
  }

  /** Seeds one native drag payload from the Writer model without canceling drag startup. @param data - Native drag transfer. @returns Whether model data was written. */
  public DragStart(data: DataTransfer): boolean {
    if (!this.port.synchronizeSelection()) return false;
    const payload = this.port.createSelection();
    if (payload === undefined) return false;
    data.setData("text/plain", payload.plainText);
    data.setData("text/html", payload.html);
    return true;
  }

  /** Writes and deletes any canonical non-collapsed Writer selection. @param event - Native clipboard event. @returns Whether Cut was routed. */
  public Cut(event: BrowserWriterClipboardEvent): boolean {
    if (!this.port.synchronizeSelection()) return false;
    const payload = this.port.createSelection();
    if (payload === undefined) return false;
    event.preventDefault();
    event.clipboardData.setData("text/plain", payload.plainText);
    event.clipboardData.setData("text/html", payload.html);
    this.port.cut();
    return true;
  }

  /** Routes native Paste at the canonical caret or range. @param event - Native clipboard event. @returns Whether Paste was routed. */
  public Paste(event: BrowserWriterClipboardEvent): boolean {
    if (!this.port.synchronizeSelection()) return false;
    event.preventDefault();
    this.port.paste(event.clipboardData);
    return true;
  }

  /** Routes a native drop transfer through the same Writer paste boundary. @param data - Native drag payload. @param preventDefault - Cancels browser DOM insertion. @returns Whether Drop was routed. */
  public Drop(data: DataTransfer, preventDefault: () => void): boolean {
    if (!this.port.synchronizeSelection()) return false;
    preventDefault();
    this.port.paste(data);
    return true;
  }
}
