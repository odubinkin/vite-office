/** @fileoverview Immutable Writer text-node attribute vocabulary and native fragment types. */
import { SwpHints } from "./ndhints";

/** Names the bounded direct character attributes currently supported by the browser Writer. */
export const WRITER_CHARACTER_FORMATS = ["bold", "italic", "underline"] as const;

/** Identifies one supported direct Writer character attribute. */
export type WriterCharacterFormat = (typeof WRITER_CHARACTER_FORMATS)[number];

/** Native Writer text payload retained by model mutations and undo. */
export interface SwTextFragment {
  readonly text: string;
  readonly hints: SwpHints;
}

/** Enumerates the bounded paragraph alignments represented by RES_PARATR_ADJUST. */
export const WRITER_PARAGRAPH_ALIGNMENTS = ["left", "center", "right", "justify"] as const;

/** Identifies one supported horizontal paragraph alignment. */
export type WriterParagraphAlignment = (typeof WRITER_PARAGRAPH_ALIGNMENTS)[number];

/** Checks a paragraph adjustment item read from storage or UI. @param value - Unknown runtime value. @returns True for a supported alignment. */
export function isWriterParagraphAlignment(value: unknown): value is WriterParagraphAlignment {
  return WRITER_PARAGRAPH_ALIGNMENTS.includes(value as WriterParagraphAlignment);
}
