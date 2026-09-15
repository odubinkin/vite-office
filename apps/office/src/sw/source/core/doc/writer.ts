/**
 * @fileoverview Exposes the browser Writer façade over the LibreOffice-shaped SwDoc document model.
 */

import { SwDoc, type SwDocSnapshot } from "./doc";
import {
  isWriterParagraphAlignment,
  SwTextNode,
  WRITER_PARAGRAPH_ALIGNMENTS,
  type WriterCharacterAttributes,
  type WriterCharacterFormat,
  type WriterParagraphAlignment,
  type WriterTextRun,
} from "../txtnode/ndtxt";
import {
  isWriterParagraphStyle,
  WRITER_PARAGRAPH_STYLES,
  type WriterParagraphStyle,
} from "./fmtcol";

export { SwDoc } from "./doc";
export { SwNodes } from "../docnode/nodes";
export { SwContentNode, SwEndNode, SwNode, SwStartNode } from "../docnode/node";
export { SwNodeIndex, SwPaM, SwPosition } from "../crsr/pam";
export { SwTextAttr, RES_TXTATR_AUTOFMT } from "../txtnode/txatbase";
export { SwFormatINetFormat } from "../txtnode/fmtinfmt";
export type { WriterHyperlink } from "../txtnode/fmtinfmt";
export { SwpHints } from "../txtnode/ndhints";
export { SwAttrPool, SwAttrSet } from "../attr/swatrset";
export { SwFormat } from "../attr/format";
export { SwFormatColl, SwTextFormatColl } from "./fmtcol";
export { isWriterParagraphListKind, WRITER_PARAGRAPH_LIST_KINDS } from "./list";
export type { WriterParagraphList, WriterParagraphListKind } from "./list";
export { getWriterParagraphListMarker } from "./number";
export type { WriterNumberingParagraph } from "./number";
export {
  isWriterParagraphAlignment,
  isWriterParagraphStyle,
  WRITER_PARAGRAPH_ALIGNMENTS,
  WRITER_PARAGRAPH_STYLES,
};
export type {
  WriterCharacterAttributes,
  WriterCharacterFormat,
  WriterParagraphAlignment,
  WriterParagraphStyle,
  WriterTextRun,
};

/** Canonical Writer document type; SwDoc owns all model content. */
export type WriterDocument = SwDoc;

/** Read-only browser projection backed directly by a canonical SwTextNode. */
export type WriterParagraph = SwTextNode;

/** Creates a model-only Writer SwDoc with fixed sections and one empty body text node. @param paragraphId - Initial text-node identity. @returns New Writer document graph. */
export function createWriterDocument(paragraphId: string): WriterDocument {
  if (paragraphId.trim().length === 0) throw new Error("Paragraph id must not be blank.");
  return new SwDoc(paragraphId);
}

/** Restores the current canonical SwDoc snapshot schema. @param candidate - Runtime or persisted Writer state. @returns Canonical document graph. */
export function normalizeWriterParagraphFormatting(candidate: unknown): WriterDocument {
  if (candidate instanceof SwDoc) return candidate;
  if (!isRecord(candidate)) throw new Error("Stored Writer document is invalid.");
  if (
    candidate.swModelVersion === 5 &&
    Array.isArray(candidate.numRules) &&
    Array.isArray(candidate.textFormatCollections) &&
    Array.isArray(candidate.textNodes)
  )
    return SwDoc.fromSnapshot(candidate as unknown as SwDocSnapshot);
  throw new Error("Stored Writer document schema is unsupported.");
}

/** Serializes the canonical document graph without ownership cycles. @param writerDocument - Canonical document graph. @returns Versioned Writer snapshot. */
export function serializeWriterDocument(writerDocument: WriterDocument): SwDocSnapshot {
  return writerDocument.toSnapshot();
}

/** Checks whether an unknown value is a non-array record. @param value - Unknown runtime value. @returns True for non-array records. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
