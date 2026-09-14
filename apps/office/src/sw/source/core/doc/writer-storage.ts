/**
 * @fileoverview Defines Writer-specific snapshot orchestration over the generic browser storage contract without selecting an IndexedDB implementation or React UI.
 */

import {
  loadSnapshot,
  saveSnapshot,
  type DocumentSnapshot,
  type DocumentStorageAdapter,
  type SavedSnapshotResult,
  type SerializableValue,
} from "../../../../sfx2/source/doc/docfile";
import {
  markDocumentRecoverySaved,
  markDocumentSaved,
  type OfficeDocument,
} from "../../../../sfx2/source/doc/objsh";
import {
  normalizeWriterParagraphFormatting,
  serializeWriterDocument,
  type WriterDocument,
} from "./writer";

/** Describes the JSON snapshot shape persisted by the bounded Writer workbench. */
export type WriterSnapshotState = {
  readonly [key: string]: SerializableValue;
  /** Shell-owned identity and lifecycle state. */
  readonly documentState: SerializableValue;
  /** Target transport schema discriminator. */
  readonly schemaVersion: 1;
  /** Model-only Writer graph. */
  readonly writerModel: SerializableValue;
};

/** Validated target snapshot split into shell and model ownership. */
export interface RestoredWriterSnapshot {
  readonly document: WriterDocument;
  readonly documentState: OfficeDocument;
}

/** Creates the complete generation-addressed payload used by primary and recovery persistence. @param writerDocument - Canonical Writer document inspected without mutation. @param documentState - Shell-owned lifecycle state. @returns Immutable snapshot container. */
export function createWriterSnapshot(
  writerDocument: WriterDocument,
  documentState: OfficeDocument,
): DocumentSnapshot<WriterSnapshotState> {
  return Object.freeze({
    id: documentState.id,
    state: {
      documentState: { ...documentState } as unknown as SerializableValue,
      schemaVersion: 1 as const,
      writerModel: serializeWriterDocument(writerDocument) as unknown as SerializableValue,
    },
    version: documentState.contentGeneration,
  });
}

/** Restores and validates a complete Writer snapshot for primary open or recovery. @param snapshot - Persisted snapshot inspected without mutation. @param purpose - Whether the snapshot is a confirmed primary copy or a recovery copy. @returns Candidate Writer graph ready for atomic shell replacement. */
export function restoreWriterSnapshot(
  snapshot: DocumentSnapshot<WriterSnapshotState>,
  purpose: "primary" | "recovery",
): RestoredWriterSnapshot {
  if (snapshot.state.schemaVersion !== 1)
    throw new Error("Stored Writer snapshot schema is unsupported.");
  const writerDocument = normalizeWriterParagraphFormatting(
    snapshot.state.writerModel as unknown as WriterDocument,
  );
  const rawState = snapshot.state.documentState;
  if (!isOfficeDocument(rawState)) throw new Error("Stored Writer lifecycle state is invalid.");
  if (rawState.id !== snapshot.id)
    throw new Error("Writer snapshot identity does not match its stored record.");
  if (rawState.contentGeneration !== snapshot.version)
    throw new Error("Writer snapshot generation does not match its stored record.");
  const documentState =
    purpose === "primary"
      ? markDocumentSaved(rawState, snapshot.version)
      : markDocumentRecoverySaved(rawState, snapshot.version);
  return { document: writerDocument, documentState };
}

/**
 * Saves one Writer workbench document using its stable identity and content generation.
 *
 * @param adapter - Generic browser storage boundary invoked without mutation.
 * @param writerDocument - Writer document snapshotted synchronously before the adapter is awaited.
 * @param documentState - Shell-owned lifecycle state captured with the model.
 * @returns Storage evidence identifying the exact snapshot accepted by the adapter.
 * @throws {Error} When the storage adapter rejects the save operation.
 */
export async function saveWriterDocument(
  adapter: DocumentStorageAdapter<WriterSnapshotState>,
  writerDocument: WriterDocument,
  documentState: OfficeDocument,
): Promise<SavedSnapshotResult<WriterSnapshotState>> {
  return saveSnapshot(adapter, createWriterSnapshot(writerDocument, documentState));
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
  | ({ readonly status: "found" } & RestoredWriterSnapshot)
> {
  const result = await loadSnapshot(adapter, id);
  if (result.status === "missing") return result;
  return { status: "found", ...restoreWriterSnapshot(result.snapshot, "primary") };
}

/** Validates the target shell-owned lifecycle record without accepting retired shapes. @param value - Stored candidate. @returns Whether target fields are valid. */
function isOfficeDocument(value: SerializableValue): value is SerializableValue & OfficeDocument {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const record = value as Record<string, SerializableValue>;
  return (
    Number.isInteger(record.contentGeneration) &&
    typeof record.id === "string" &&
    typeof record.isModified === "boolean" &&
    (record.lifecycle === "closed" ||
      record.lifecycle === "dirty" ||
      record.lifecycle === "new" ||
      record.lifecycle === "saved") &&
    (record.recoveryGeneration === null || Number.isInteger(record.recoveryGeneration)) &&
    (record.savedGeneration === null || Number.isInteger(record.savedGeneration)) &&
    typeof record.suiteId === "string" &&
    typeof record.title === "string"
  );
}
