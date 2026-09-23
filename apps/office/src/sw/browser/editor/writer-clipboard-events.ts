/** @fileoverview Parses native clipboard data before the browser edit window enters Writer. */
import { parseWriterClipboardPaste, type WriterClipboardPaste } from "../filter/html/swhtml";
import type { WriterTransferDocument } from "../../source/uibase/dochdl/swdtflvr";

/** Translates native DataTransfer MIME values into the bounded Writer HTML import. @param data - Native transfer reader. @param document - Detached-element owner used by the HTML filter. @returns Parsed bounded paste or undefined for an empty transfer. */
export function readBrowserWriterClipboardPaste(
  data: Pick<DataTransfer, "getData">,
  document: Document,
): WriterClipboardPaste | undefined {
  return parseWriterClipboardPaste(data.getData("text/html"), data.getData("text/plain"), document);
}

/** Removes browser parser provenance before a transfer enters the Writer shell. @param paste - Browser import record. @returns Writer-owned transfer document. */
export function createWriterTransferDocument(paste: WriterClipboardPaste): WriterTransferDocument {
  return { isBlock: paste.isBlock, paragraphs: paste.paragraphs };
}
