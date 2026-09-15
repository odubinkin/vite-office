/** @fileoverview Neutral Writer HTML-transfer records shared by the filter and browser DOM adapter. */

import type { WriterTextRun } from "../../core/txtnode/ndtxt";

/** One safe paragraph imported from a transfer document. */
export interface WriterClipboardPasteParagraph {
  readonly listKind: "bullet" | "none" | "numbered";
  readonly listLevel: number;
  readonly runs: readonly WriterTextRun[];
}

/** Bounded Writer text imported from rich or plain clipboard formats. */
export interface WriterClipboardPaste {
  readonly isBlock: boolean;
  readonly paragraphs: readonly WriterClipboardPasteParagraph[];
  readonly source: "html" | "plain-text";
}
