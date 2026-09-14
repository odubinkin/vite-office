/**
 * @fileoverview Defines Writer-specific snapshot orchestration over the generic browser storage contract without selecting an IndexedDB implementation or React UI.
 */

import {
  loadSnapshot,
  saveSnapshot,
  type DocumentSnapshot,
  type DocumentStorageAdapter,
  type SerializableValue,
} from "../../../../sfx2/source/doc/docfile";
import { markDocumentRecoverySaved, markDocumentSaved } from "../../../../sfx2/source/doc/docfac";
import {
  normalizeWriterParagraphFormatting,
  serializeWriterDocument,
  type WriterDocument,
} from "./writer";

/** Describes the JSON snapshot shape persisted by the bounded Writer workbench. */
export type WriterSnapshotState = {
  readonly [key: string]: SerializableValue;
  /** Writer document copied into the browser-local snapshot. */
  readonly writerDocument: SerializableValue;
};

/** Creates the complete generation-addressed payload used by primary and recovery persistence. @param writerDocument - Canonical Writer document inspected without mutation. @returns Immutable snapshot container. */
export function createWriterSnapshot(
  writerDocument: WriterDocument,
): DocumentSnapshot<WriterSnapshotState> {
  return Object.freeze({
    id: writerDocument.document.id,
    state: {
      writerDocument: serializeWriterDocument(writerDocument) as unknown as SerializableValue,
    },
    version: writerDocument.document.contentGeneration,
  });
}

/** Restores and validates a complete Writer snapshot for primary open or recovery. @param snapshot - Persisted snapshot inspected without mutation. @param purpose - Whether the snapshot is a confirmed primary copy or a recovery copy. @returns Candidate Writer graph ready for atomic shell replacement. */
export function restoreWriterSnapshot(
  snapshot: DocumentSnapshot<WriterSnapshotState>,
  purpose: "primary" | "recovery",
): WriterDocument {
  const writerDocument = normalizeWriterParagraphFormatting(
    snapshot.state.writerDocument as unknown as WriterDocument,
  );
  if (writerDocument.document.id !== snapshot.id)
    throw new Error("Writer snapshot identity does not match its stored record.");
  if (writerDocument.document.contentGeneration !== snapshot.version)
    throw new Error("Writer snapshot generation does not match its stored record.");
  writerDocument.document =
    purpose === "primary"
      ? markDocumentSaved(writerDocument.document, snapshot.version)
      : markDocumentRecoverySaved(writerDocument.document, snapshot.version);
  return writerDocument;
}

/**
 * Saves one Writer workbench document using its stable identity and content generation.
 *
 * @param adapter - Generic browser storage boundary invoked without mutation.
 * @param writerDocument - Immutable Writer document persisted as JSON-compatible state.
 * @returns A saved result whose snapshot contains the Writer document.
 * @throws {Error} When the storage adapter rejects the save operation.
 */
export async function saveWriterDocument(
  adapter: DocumentStorageAdapter<WriterSnapshotState>,
  writerDocument: WriterDocument,
): Promise<
  Readonly<{
    snapshot: Awaited<ReturnType<typeof saveSnapshot<WriterSnapshotState>>>["snapshot"];
    status: "saved";
    writerDocument: WriterDocument;
  }>
> {
  const saved = await saveSnapshot(adapter, createWriterSnapshot(writerDocument));
  const acknowledged = writerDocument.clone();
  acknowledged.document = markDocumentSaved(acknowledged.document, saved.snapshot.version);
  return { ...saved, writerDocument: acknowledged };
}

/**
 * Loads one Writer workbench document by its stable identity.
 *
 * @param adapter - Generic browser storage boundary invoked without mutation.
 * @param id - Exact Writer document identity supplied to storage unchanged.
 * @returns Found Writer document or an explicit missing outcome retaining id.
 * @throws {Error} When the storage adapter rejects the load operation.
 */
export async function loadWriterDocument(
  adapter: DocumentStorageAdapter<WriterSnapshotState>,
  id: string,
): Promise<
  | { readonly id: string; readonly status: "missing" }
  | { readonly status: "found"; readonly writerDocument: WriterDocument }
> {
  const result = await loadSnapshot(adapter, id);
  if (result.status === "missing") return result;
  const writerDocument = restoreWriterSnapshot(result.snapshot, "primary");
  return { status: "found", writerDocument };
}
