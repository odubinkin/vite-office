/**
 * @fileoverview Exposes the browser Writer façade over the LibreOffice-shaped SwDoc document model.
 */

import type { OfficeDocument } from "../../../../sfx2/source/doc/docfac";
import { SwDoc, type SwDocSnapshot } from "./doc";
import {
  isWriterParagraphAlignment,
  normalizeWriterTextRuns,
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
import { createSwpHintsFromSnapshot } from "../txtnode/ndhints";
import { createDefaultWriterParagraphList, normalizeWriterParagraphList } from "./list";

export { SwDoc } from "./doc";
export { SwNodes } from "../docnode/nodes";
export {
  SwContentNode,
  SwEndNode,
  SwNode,
  SwStartNode,
  moveWriterParagraph,
  removeWriterParagraph,
} from "../docnode/node";
export { SwNodeIndex, SwPaM, SwPosition } from "../crsr/pam";
export { SwTextAttr, RES_TXTATR_AUTOFMT } from "../txtnode/txatbase";
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

/** Identifies a one-position movement direction in an ordered Writer body. */
export type WriterParagraphMoveDirection = "up" | "down";

/** Creates a Writer SwDoc with LibreOffice's fixed sections and one empty body text node. @param document - Browser lifecycle metadata. @param paragraphId - Initial text-node identity. @returns New Writer document graph. */
export function createWriterDocument(
  document: OfficeDocument,
  paragraphId: string,
): WriterDocument {
  if (paragraphId.trim().length === 0) throw new Error("Paragraph id must not be blank.");
  return new SwDoc(document, paragraphId);
}

/** Appends an empty body SwTextNode before the content end sentinel. @param writerDocument - Prior document graph. @param paragraphId - New node identity. @returns Changed cloned graph. */
export function appendWriterParagraph(
  writerDocument: WriterDocument,
  paragraphId: string,
): WriterDocument {
  assertParagraphIdAvailable(writerDocument, paragraphId);
  const next = writerDocument.clone();
  next.nodes.MakeTextNode(paragraphId);
  next.SetModified();
  return next;
}

/** Splits one SwTextNode and its range hints at a UTF-16 content offset. @param writerDocument - Prior document graph. @param paragraphId - Split node identity. @param offset - UTF-16 split offset. @param nextParagraphId - Trailing node identity. @returns Changed cloned graph. */
export function splitWriterParagraph(
  writerDocument: WriterDocument,
  paragraphId: string,
  offset: number,
  nextParagraphId: string,
): WriterDocument {
  const source = getWriterTextNode(writerDocument, paragraphId);
  assertContentOffset(source, offset, "Split offset is outside the paragraph.");
  assertParagraphIdAvailable(writerDocument, nextParagraphId);
  const next = writerDocument.clone();
  const clonedSource = getWriterTextNode(next, paragraphId);
  const trailing = clonedSource.SplitContent(offset, nextParagraphId);
  next.nodes.insertTextNodeAfter(clonedSource, trailing);
  next.SetModified();
  return next;
}

/** Joins one non-first SwTextNode into its preceding body text node. @param writerDocument - Prior document graph. @param paragraphId - Joined node identity. @returns Changed cloned graph. */
export function mergeWriterParagraphWithPrevious(
  writerDocument: WriterDocument,
  paragraphId: string,
): WriterDocument {
  const source = getWriterTextNode(writerDocument, paragraphId);
  const index = writerDocument.paragraphs.indexOf(source);
  if (index === 0) throw new Error("First Writer paragraph has no preceding paragraph.");
  const next = writerDocument.clone();
  const clonedSource = getWriterTextNode(next, paragraphId);
  const clonedIndex = next.paragraphs.indexOf(clonedSource);
  const preceding = next.paragraphs[clonedIndex - 1] as SwTextNode;
  preceding.AppendTextNode(clonedSource);
  next.nodes.removeTextNode(clonedSource);
  next.SetModified();
  return next;
}

/** Inserts text using direct attributes inherited at a SwTextNode content position. @param writerDocument - Prior document graph. @param paragraphId - Target node identity. @param offset - UTF-16 insertion offset. @param text - Inserted text. @returns Original graph for empty text, otherwise a changed clone. */
export function insertWriterText(
  writerDocument: WriterDocument,
  paragraphId: string,
  offset: number,
  text: string,
): WriterDocument {
  const source = getWriterTextNode(writerDocument, paragraphId);
  assertContentOffset(source, offset, "Insertion offset is outside the paragraph.");
  if (text.length === 0) return writerDocument;
  const next = writerDocument.clone();
  getWriterTextNode(next, paragraphId).InsertText(text, offset);
  next.SetModified();
  return next;
}

/** Inserts text with an explicit auto-format item set at one SwTextNode position. @param writerDocument - Prior document graph. @param paragraphId - Target node identity. @param offset - UTF-16 insertion offset. @param text - Inserted text. @param attributes - Direct attributes for inserted text. @returns Original graph for empty text, otherwise a changed clone. */
export function insertWriterTextWithAttributes(
  writerDocument: WriterDocument,
  paragraphId: string,
  offset: number,
  text: string,
  attributes: WriterCharacterAttributes,
): WriterDocument {
  const source = getWriterTextNode(writerDocument, paragraphId);
  assertContentOffset(source, offset, "Insertion offset is outside the paragraph.");
  if (text.length === 0) return writerDocument;
  const next = writerDocument.clone();
  getWriterTextNode(next, paragraphId).InsertText(text, offset, attributes);
  next.SetModified();
  return next;
}

/** Replaces complete node text and clears its direct-format hints. @param writerDocument - Prior document graph. @param paragraphId - Target node identity. @param text - Replacement text. @returns Original graph for equal text, otherwise a changed clone. */
export function replaceWriterParagraph(
  writerDocument: WriterDocument,
  paragraphId: string,
  text: string,
): WriterDocument {
  const source = getWriterTextNode(writerDocument, paragraphId);
  if (source.text === text) return writerDocument;
  const next = writerDocument.clone();
  getWriterTextNode(next, paragraphId).SetText(text);
  next.SetModified();
  return next;
}

/** Changes RES_PARATR_ADJUST for one body SwTextNode. @param writerDocument - Prior document graph. @param paragraphId - Target node identity. @param alignment - New alignment item. @returns Original graph for equal alignment, otherwise a changed clone. */
export function setWriterParagraphAlignment(
  writerDocument: WriterDocument,
  paragraphId: string,
  alignment: WriterParagraphAlignment,
): WriterDocument {
  const source = getWriterTextNode(writerDocument, paragraphId);
  if (!isWriterParagraphAlignment(alignment))
    throw new Error(`Unsupported Writer paragraph alignment: ${alignment}`);
  if (source.alignment === alignment) return writerDocument;
  const next = writerDocument.clone();
  getWriterTextNode(next, paragraphId).SetParagraphAlignment(alignment);
  next.SetModified();
  return next;
}

/** Changes one SwTextNode text format collection. @param writerDocument - Prior document graph. @param paragraphId - Target node identity. @param style - New format collection identity. @returns Original graph for equal style, otherwise a changed clone. */
export function setWriterParagraphStyle(
  writerDocument: WriterDocument,
  paragraphId: string,
  style: WriterParagraphStyle,
): WriterDocument {
  const source = getWriterTextNode(writerDocument, paragraphId);
  if (!isWriterParagraphStyle(style))
    throw new Error(`Unsupported Writer paragraph style: ${style}`);
  if (source.style === style) return writerDocument;
  const next = writerDocument.clone();
  getWriterTextNode(next, paragraphId).ChgFormatColl(next.GetTextFormatColl(style));
  next.SetModified();
  return next;
}

/** Toggles one character item over a same-node range stored as RES_TXTATR_AUTOFMT hints. @param writerDocument - Prior document graph. @param paragraphId - Target node identity. @param start - Inclusive format start. @param end - Exclusive format end. @param format - Toggled direct property. @returns Original graph for an empty range, otherwise a changed clone. */
export function toggleWriterParagraphCharacterFormat(
  writerDocument: WriterDocument,
  paragraphId: string,
  start: number,
  end: number,
  format: WriterCharacterFormat,
): WriterDocument {
  const source = getWriterTextNode(writerDocument, paragraphId);
  if (start === end) return writerDocument;
  assertContentRange(source, start, end);
  const next = writerDocument.clone();
  getWriterTextNode(next, paragraphId).ToggleTextRangeFormat(start, end, format);
  next.SetModified();
  return next;
}

/** Converts current or legacy persisted Writer data to the canonical SwDoc graph. @param candidate - Runtime or persisted Writer state. @returns Canonical document graph. */
export function normalizeWriterParagraphFormatting(candidate: unknown): WriterDocument {
  if (candidate instanceof SwDoc) return candidate;
  if (!isRecord(candidate)) throw new Error("Stored Writer document is invalid.");
  if (
    candidate.swModelVersion === 2 &&
    Array.isArray(candidate.numRules) &&
    Array.isArray(candidate.textFormatCollections) &&
    Array.isArray(candidate.textNodes)
  )
    return SwDoc.fromSnapshot(candidate as unknown as SwDocSnapshot);
  if (candidate.swModelVersion === 1 && Array.isArray(candidate.textNodes))
    return restoreVersionOneWriterDocument(candidate);
  return restoreLegacyWriterDocument(candidate);
}

/** Serializes the canonical document graph without ownership cycles. @param writerDocument - Canonical document graph. @returns Versioned Writer snapshot. */
export function serializeWriterDocument(writerDocument: WriterDocument): SwDocSnapshot {
  return writerDocument.toSnapshot();
}

/** Returns one canonical body text node or throws the established paragraph error. @param writerDocument - Canonical document graph. @param paragraphId - Requested node identity. @returns Matching text node. */
function getWriterTextNode(writerDocument: WriterDocument, paragraphId: string): SwTextNode {
  const node = writerDocument.nodes.findTextNode(paragraphId);
  if (node === undefined) throw new Error(`Unknown paragraph: ${paragraphId}`);
  return node;
}

/** Validates a new stable body node identity. @param writerDocument - Canonical document graph. @param paragraphId - Candidate identity. @returns Nothing. */
function assertParagraphIdAvailable(writerDocument: WriterDocument, paragraphId: string): void {
  if (paragraphId.trim().length === 0) throw new Error("Paragraph id must not be blank.");
  if (writerDocument.nodes.findTextNode(paragraphId) !== undefined)
    throw new Error(`Duplicate paragraph: ${paragraphId}`);
}

/** Validates one content offset with a caller-compatible error. @param node - Target text node. @param offset - Candidate UTF-16 offset. @param message - Error text. @returns Nothing. */
function assertContentOffset(node: SwTextNode, offset: number, message: string): void {
  if (!Number.isInteger(offset) || offset < 0 || offset > node.Len()) throw new Error(message);
}

/** Validates one same-node selection range. @param node - Target text node. @param start - Inclusive range start. @param end - Exclusive range end. @returns Nothing. */
function assertContentRange(node: SwTextNode, start: number, end: number): void {
  if (
    !Number.isInteger(start) ||
    !Number.isInteger(end) ||
    start < 0 ||
    end < start ||
    end > node.Len()
  )
    throw new Error("Writer character-format range is outside the paragraph.");
}

/** Restores the previous paragraph-array snapshot schema into SwTextNode records. @param candidate - Legacy document record. @returns Canonical document graph. */
function restoreLegacyWriterDocument(candidate: Record<string, unknown>): WriterDocument {
  if (!isRecord(candidate.document) || !Array.isArray(candidate.paragraphs))
    throw new Error("Stored Writer document is invalid.");
  const paragraphs = candidate.paragraphs;
  if (paragraphs.length === 0) throw new Error("Stored Writer document has no paragraphs.");
  const document = new SwDoc(candidate.document as unknown as OfficeDocument);
  paragraphs.forEach(
    /** Restores one legacy paragraph as a canonical text node and auto-format hints. @param value - Legacy paragraph record. @param index - Body order. @returns Nothing. */
    function restoreParagraph(value, index): void {
      if (!isRecord(value)) throw new Error("Stored Writer paragraph is invalid.");
      const id =
        typeof value.id === "string" && value.id.trim().length > 0
          ? value.id
          : `paragraph-${index + 1}`;
      const text = typeof value.text === "string" ? value.text : "";
      const node = document.nodes.MakeTextNode(id, text);
      node.SetParagraphAlignment(
        isWriterParagraphAlignment(value.alignment) ? value.alignment : "left",
      );
      node.ChgFormatColl(
        document.GetTextFormatColl(isWriterParagraphStyle(value.style) ? value.style : "default"),
      );
      node.SetParagraphList(
        normalizeWriterParagraphList(value.list ?? createDefaultWriterParagraphList()),
      );
      const runs = normalizeWriterTextRuns(value.runs);
      if (runs.length > 0) node.ReplaceRange(0, node.Len(), runs);
    },
  );
  return document;
}

/** Restores the prior version-one SwDoc snapshot into item-backed text nodes. @param candidate - Version-one model record. @returns Canonical document graph. */
function restoreVersionOneWriterDocument(candidate: Record<string, unknown>): WriterDocument {
  if (!isRecord(candidate.document) || !Array.isArray(candidate.textNodes))
    throw new Error("Stored Writer document is invalid.");
  if (candidate.textNodes.length === 0)
    throw new Error("Stored Writer document has no paragraphs.");
  const document = new SwDoc(candidate.document as unknown as OfficeDocument);
  candidate.textNodes.forEach(
    /** Restores one version-one text node and converts direct fields to Writer items. @param value - Persisted text-node record. @returns Nothing. */
    function restoreTextNode(value): void {
      if (
        !isRecord(value) ||
        typeof value.id !== "string" ||
        value.id.trim().length === 0 ||
        typeof value.text !== "string"
      )
        throw new Error("Stored Writer text node is invalid.");
      const node = document.nodes.MakeTextNode(value.id, value.text);
      node.SetParagraphAlignment(
        isWriterParagraphAlignment(value.alignment) ? value.alignment : "left",
      );
      node.ChgFormatColl(
        document.GetTextFormatColl(isWriterParagraphStyle(value.style) ? value.style : "default"),
      );
      node.SetParagraphList(
        normalizeWriterParagraphList(value.list ?? createDefaultWriterParagraphList()),
      );
      const hints = createSwpHintsFromSnapshot(Array.isArray(value.hints) ? value.hints : []);
      const runs = hints.toTextRuns(value.text);
      if (runs.length > 0) node.ReplaceRange(0, node.Len(), runs);
    },
  );
  return document;
}

/** Checks whether an unknown value is a non-array record. @param value - Unknown runtime value. @returns True for non-array records. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
