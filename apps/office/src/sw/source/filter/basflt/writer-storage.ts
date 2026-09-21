/** @fileoverview Browser persistence orchestration for Writer model and shell state. */

import {
  loadSnapshot,
  saveSnapshot,
  type DocumentSnapshot,
  type PrimarySavePort,
  type SavedSnapshotResult,
  type SerializableValue,
  type StoredDocumentOpenPort,
} from "../../../../sfx2/source/doc/docfile";
import type { OfficeDocument } from "../../../../sfx2/source/doc/objsh";
import type { SwDoc } from "../../core/doc/doc";
import { decodeWriterStorageDocument, encodeWriterStorageDocument } from "./writer-storage-codec";

/** Stable identifier for the browser persistence codec, distinct from the Writer model version. */
export const WRITER_STORAGE_CODEC = "vite-office.writer-browser-storage";

/** Pinned upstream tag whose contracts define the serialized model. */
export const WRITER_STORAGE_BASELINE_TAG = "libreoffice-26.8.0.2";

/** Pinned upstream commit whose contracts define the serialized model. */
export const WRITER_STORAGE_BASELINE_COMMIT = "9bc445578031fecf56086729d8e4940c77e14d65";

/** Current persisted Writer workbench shape. Old schemas are intentionally rejected. */
export type WriterSnapshotState = {
  readonly [key: string]: SerializableValue;
  readonly baselineCommit: typeof WRITER_STORAGE_BASELINE_COMMIT;
  readonly baselineTag: typeof WRITER_STORAGE_BASELINE_TAG;
  readonly codec: typeof WRITER_STORAGE_CODEC;
  readonly documentState: SerializableValue;
  readonly modelVersion: 12;
  readonly schemaVersion: 10;
  readonly storageModel: SerializableValue;
};

/** Validated stored state split into shell and model ownership. */
export interface RestoredWriterSnapshot {
  readonly document: SwDoc;
  readonly documentState: OfficeDocument;
}

/** Captures a generation-addressed Writer payload. @param document - Canonical model. @param documentState - Shell state. @returns Immutable snapshot. */
export function createWriterSnapshot(
  document: SwDoc,
  documentState: OfficeDocument,
): DocumentSnapshot<WriterSnapshotState> {
  const state: WriterSnapshotState = {
    baselineCommit: WRITER_STORAGE_BASELINE_COMMIT,
    baselineTag: WRITER_STORAGE_BASELINE_TAG,
    codec: WRITER_STORAGE_CODEC,
    documentState: { ...documentState } as unknown as SerializableValue,
    modelVersion: 12,
    schemaVersion: 10,
    storageModel: encodeWriterStorageDocument(document) as unknown as SerializableValue,
  };
  return Object.freeze({
    id: documentState.id,
    state,
    version: documentState.contentGeneration,
  });
}

/** Restores only the current schema. @param snapshot - Stored payload. @param purpose - Save class. @returns Restored graph. */
export function restoreWriterSnapshot(
  snapshot: DocumentSnapshot<WriterSnapshotState>,
  purpose: "primary" | "recovery",
): RestoredWriterSnapshot {
  if (
    snapshot.state.schemaVersion !== 10 ||
    snapshot.state.codec !== WRITER_STORAGE_CODEC ||
    snapshot.state.modelVersion !== 12 ||
    snapshot.state.baselineTag !== WRITER_STORAGE_BASELINE_TAG ||
    snapshot.state.baselineCommit !== WRITER_STORAGE_BASELINE_COMMIT
  )
    throw new Error(
      "Stored Writer snapshot schema is unsupported; open an ODT file or discard the browser copy.",
    );
  const document = decodeWriterStorageDocument(snapshot.state.storageModel);
  const rawState = snapshot.state.documentState;
  if (!isOfficeDocument(rawState)) throw new Error("Stored Writer lifecycle state is invalid.");
  const restoredState = rawState as unknown as OfficeDocument;
  if (restoredState.lifecycle === "closed")
    throw new Error("Closed documents cannot be restored into an active shell.");
  if (restoredState.id !== snapshot.id)
    throw new Error("Writer snapshot identity does not match its stored record.");
  if (restoredState.contentGeneration !== snapshot.version)
    throw new Error("Writer snapshot generation does not match its stored record.");
  const documentState: OfficeDocument = Object.freeze(
    purpose === "primary"
      ? {
          ...restoredState,
          isModified: false,
          lifecycle: "saved",
          savedGeneration: snapshot.version,
        }
      : {
          ...restoredState,
          isModified: true,
          lifecycle: "dirty",
          recoveryGeneration: snapshot.version,
        },
  );
  return { document, documentState };
}

/** Saves one Writer snapshot through a confirmed browser port. @param adapter - Persistence port. @param document - Model. @param documentState - Shell state. @returns Save evidence. */
export function saveWriterDocument(
  adapter: PrimarySavePort<WriterSnapshotState>,
  document: SwDoc,
  documentState: OfficeDocument,
): Promise<SavedSnapshotResult<WriterSnapshotState>> {
  return saveSnapshot(adapter, createWriterSnapshot(document, documentState));
}

/** Loads one Writer snapshot by shell identity. @param adapter - Open port. @param id - Document identity. @returns Missing or restored result. */
export async function loadWriterDocument(
  adapter: StoredDocumentOpenPort<WriterSnapshotState>,
  id: string,
): Promise<
  | { readonly id: string; readonly status: "missing" }
  | ({ readonly status: "found" } & RestoredWriterSnapshot)
> {
  const result = await loadSnapshot(adapter, id);
  return result.status === "missing"
    ? result
    : { status: "found", ...restoreWriterSnapshot(result.snapshot, "primary") };
}

/** Validates the current shell lifecycle record. @param value - Stored candidate. @returns Whether valid. */
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
