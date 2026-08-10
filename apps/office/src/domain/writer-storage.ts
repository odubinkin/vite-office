/**
 * @fileoverview Defines Writer-specific snapshot orchestration over the generic browser storage contract without selecting an IndexedDB implementation or React UI.
 */

import {
  loadSnapshot,
  saveSnapshot,
  type DocumentStorageAdapter,
  type SerializableValue,
} from "./storage";
import type { WriterDocument } from "./writer";

/** Describes the JSON snapshot shape persisted by the bounded Writer workbench. */
export type WriterSnapshotState = {
  readonly [key: string]: SerializableValue;
  /** Writer document copied into the browser-local snapshot. */
  readonly writerDocument: SerializableValue;
};

/**
 * Saves one Writer workbench document using its document identity and revision as snapshot metadata.
 *
 * @param adapter - Generic browser storage boundary invoked without mutation.
 * @param writerDocument - Immutable Writer document persisted as JSON-compatible state.
 * @returns A saved result whose snapshot contains the Writer document.
 * @throws {Error} When the storage adapter rejects the save operation.
 */
export async function saveWriterDocument(
  adapter: DocumentStorageAdapter<WriterSnapshotState>,
  writerDocument: WriterDocument,
) {
  return saveSnapshot(adapter, {
    id: writerDocument.document.id,
    state: { writerDocument: writerDocument as unknown as SerializableValue },
    version: writerDocument.document.revision,
  });
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
  return result.status === "missing"
    ? result
    : {
        status: "found",
        writerDocument: result.snapshot.state.writerDocument as unknown as WriterDocument,
      };
}
