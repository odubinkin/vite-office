/**
 * @fileoverview Provides browser-owned Writer commands that do not mutate the document model.
 */

import type { Dispatch, SetStateAction } from "react";

import type { WriterDocument } from "../../core/doc/writer";
import { copyRichText } from "../../../../vcl/browser/browser-clipboard";
import { downloadPlainText } from "../../../../vcl/browser/browser-download";
import { createWriterClipboardSelection } from "../dochdl/swdtflvr";

/** Describes the document session and status outlet used by browser-owned Writer commands. */
export interface WriterBrowserCommandOptions {
  /** Immutable current Writer document used to serialize a plain-text download. */
  readonly writerDocument: WriterDocument;
  /** React status setter used to surface deterministic browser command feedback. */
  readonly setStorageStatus: Dispatch<SetStateAction<string>>;
}

/** Describes commands that delegate an operation to a browser capability. */
export interface WriterBrowserCommands {
  /** Starts a plain-text browser download for the current Writer document. */
  readonly handleWriterDownload: () => void;
  /** Copies the native document selection through the browser clipboard. */
  readonly handleWriterCopy: () => Promise<void>;
}

/**
 * Creates Writer commands that delegate downloads and copying to browser APIs.
 *
 * @param options - Current document and status feedback outlet owned by the Writer workbench.
 * @param options.writerDocument - Immutable document whose ordered paragraphs form the download.
 * @param options.setStorageStatus - Status setter used to expose browser command feedback.
 * @returns Browser commands suitable for the Writer menus and standard toolbar.
 */
export function useWriterBrowserCommands({
  writerDocument,
  setStorageStatus,
}: WriterBrowserCommandOptions): WriterBrowserCommands {
  /**
   * Downloads the ordered Writer paragraph body as a UTF-8 plain-text file.
   *
   * @returns Nothing; browser download ownership begins after dispatch.
   */
  function handleWriterDownload(): void {
    try {
      downloadPlainText(
        writerDocument.paragraphs
          .map(
            /**
             * Extracts one paragraph body in document order for plain-text serialization.
             *
             * @param paragraph - Immutable paragraph whose text is serialized unchanged.
             * @returns The paragraph plain-text body.
             */
            function extractParagraphText(paragraph): string {
              return paragraph.text;
            },
          )
          .join("\n"),
        `${writerDocument.document.title}.txt`,
      );
      setStorageStatus("Plain-text download started.");
    } catch {
      setStorageStatus("Could not start plain-text download.");
    }
  }

  /**
   * Copies the current native Writer selection without changing the document model.
   *
   * @returns A promise resolved after copy feedback is recorded.
   */
  async function handleWriterCopy(): Promise<void> {
    const selection = createWriterClipboardSelection(globalThis.getSelection());
    if (selection === undefined) {
      setStorageStatus("Select text to copy.");
      return;
    }
    try {
      await copyRichText(selection);
      setStorageStatus("Copied selection.");
    } catch {
      setStorageStatus("Could not copy selection.");
    }
  }

  return { handleWriterCopy, handleWriterDownload };
}
