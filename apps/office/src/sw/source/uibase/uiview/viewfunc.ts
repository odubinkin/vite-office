/** @fileoverview Provides pure Writer workbench document and paragraph identity helpers. */

import type { SwDoc as WriterDocument, SwDocOptions } from "../../core/doc/doc";
import { SwDocShell } from "../app/docsh";
import type { SwTextNode as WriterParagraph } from "../../core/txtnode/ndtxt";

/** Creates the initial empty Writer document used by the browser session. @param options - Locale, device, and initial-node options. @returns New canonical SwDoc. */
export function createWriterWorkbenchDocument(options: SwDocOptions = {}): WriterDocument {
  return SwDocShell.CreateNewDocument(options);
}

/** Resolves a connected focused paragraph or the non-empty body's first node. @param writerDocument - Current Writer graph. @param preferredParagraph - Preferred node reference. @returns Existing preferred or first paragraph. */
export function getActiveWriterParagraph(
  writerDocument: WriterDocument,
  preferredParagraph: WriterParagraph | undefined,
): WriterParagraph {
  return (
    (preferredParagraph !== undefined && writerDocument.paragraphs.includes(preferredParagraph)
      ? preferredParagraph
      : undefined) ?? (writerDocument.paragraphs[0] as WriterParagraph)
  );
}
