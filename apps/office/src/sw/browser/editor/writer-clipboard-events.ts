/** @fileoverview Parses native clipboard data before the browser edit window enters Writer. */
import type { SwTextNode } from "../../source/core/txtnode/ndtxt";
import { createWriterTextFragment } from "../../source/core/txtnode/text-run-projection";
import type { WriterPasteDocument } from "../../source/uibase/wrtsh/wrtsh-paste";
import { parseWriterClipboardPaste, type WriterClipboardPaste } from "../filter/html/swhtml";

/** Translates native DataTransfer MIME values into the bounded Writer HTML import. @param data - Native transfer reader. @param document - Detached-element owner used by the HTML filter. @returns Parsed bounded paste or undefined for an empty transfer. */
export function readBrowserWriterClipboardPaste(
  data: Pick<DataTransfer, "getData">,
  document: Document,
): WriterClipboardPaste | undefined {
  return parseWriterClipboardPaste(data.getData("text/html"), data.getData("text/plain"), document);
}

/** Converts a parsed browser transfer to document-pool-owned Writer fragments. @param paragraph - Target Writer paragraph supplying the item pool. @param paste - Parsed browser transfer. @returns Native Writer paste document. */
export function createBrowserWriterPaste(
  paragraph: SwTextNode,
  paste: WriterClipboardPaste,
): WriterPasteDocument {
  return {
    isBlock: paste.isBlock,
    paragraphs: paste.paragraphs.map(
      /** Converts one transfer paragraph through the target document pool. @param item - Parsed transfer paragraph. @returns Native paragraph. */ (
        item,
      ) => ({
        fragment: createWriterTextFragment(paragraph, item.runs),
        listKind: item.listKind,
        listLevel: item.listLevel,
      }),
    ),
  };
}
