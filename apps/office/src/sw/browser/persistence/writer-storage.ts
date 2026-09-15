/** @fileoverview Browser persistence orchestration for Writer model and shell state. */

import {
  loadSnapshot,
  saveSnapshot,
  type DocumentSnapshot,
  type PrimarySavePort,
  type SavedSnapshotResult,
  type SerializableValue,
  type StoredDocumentOpenPort,
} from "../../../sfx2/source/doc/docfile";
import {
  markDocumentRecoverySaved,
  markDocumentSaved,
  type OfficeDocument,
} from "../../../sfx2/source/doc/objsh";
import type { SwDoc } from "../../source/core/doc/doc";
import { decodeWriterDocument, encodeWriterDocument } from "./writer-document-codec";

/** Current persisted Writer workbench shape. Old schemas are intentionally rejected. */
export type WriterSnapshotState = {
  readonly [key: string]: SerializableValue;
  readonly documentState: SerializableValue;
  readonly schemaVersion: 5;
  readonly writerModel: SerializableValue;
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
  return Object.freeze({
    id: documentState.id,
    state: {
      documentState: { ...documentState } as unknown as SerializableValue,
      schemaVersion: 5 as const,
      writerModel: encodeWriterDocument(document) as unknown as SerializableValue,
    },
    version: documentState.contentGeneration,
  });
}

/** Restores only the current schema. @param snapshot - Stored payload. @param purpose - Save class. @returns Restored graph. */
export function restoreWriterSnapshot(
  snapshot: DocumentSnapshot<WriterSnapshotState>,
  purpose: "primary" | "recovery",
): RestoredWriterSnapshot {
  if (snapshot.state.schemaVersion !== 5)
    throw new Error(
      "Stored Writer snapshot schema is unsupported; open an ODT file or discard the browser copy.",
    );
  const document = decodeWriterDocument(snapshot.state.writerModel);
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
