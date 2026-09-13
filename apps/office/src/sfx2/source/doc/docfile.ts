/**
 * @fileoverview Defines the bounded browser document-medium persistence contract at the LibreOffice `sfx2/source/doc/docfile.cxx` ownership boundary without selecting a browser persistence API.
 */

import {
  loadStorageRecord,
  saveStorageRecord,
  type LoadStorageRecordResult,
  type SavedStorageRecord,
  type SerializableValue,
  type VersionedStorageAdapter,
  type VersionedStorageRecord,
} from "../../../svl/source/misc/storage";

export type { SerializableValue } from "../../../svl/source/misc/storage";

/** Identifies the browser-adapted medium currently associated with a document shell. */
export type SfxMediumKind = "browser-local" | "file" | "untitled";

/**
 * Describes the persistent document medium without coupling Sfx2 to File, IndexedDB,
 * download, or another browser API.
 */
export interface SfxMediumDescriptor {
  /** Browser-adapted medium family used by lifecycle commands. */
  readonly kind: SfxMediumKind;
  /** MIME type selected by the owning document filter, when applicable. */
  readonly mediaType?: string;
  /** Stable user-facing or storage-facing medium name. */
  readonly name: string;
}

/** Describes one immutable versioned snapshot owned by a document-storage caller. */
export type DocumentSnapshot<State extends SerializableValue> = VersionedStorageRecord<State>;

/**
 * Defines injected asynchronous persistence operations without coupling domain
 * logic to IndexedDB, OPFS, download APIs, or a backend.
 */
export type DocumentStorageAdapter<State extends SerializableValue> =
  VersionedStorageAdapter<State>;

/** Describes a successful snapshot lookup. */
export interface FoundSnapshotResult<State extends SerializableValue> {
  /** Discriminator proving that snapshot contains a stored value. */
  readonly status: "found";
  /** Snapshot supplied by the adapter without mutation or cloning. */
  readonly snapshot: DocumentSnapshot<State>;
}

/** Describes a snapshot lookup whose identifier has no stored value. */
export interface MissingSnapshotResult {
  /** Discriminator proving that no value was returned by the adapter. */
  readonly status: "missing";
  /** Original identifier passed through without trimming or normalization. */
  readonly id: string;
}

/** Represents the exhaustive deterministic result of a snapshot lookup. */
export type LoadSnapshotResult<State extends SerializableValue> =
  FoundSnapshotResult<State> | MissingSnapshotResult;

/** Describes a successful snapshot save. */
export interface SavedSnapshotResult<State extends SerializableValue> {
  /** Discriminator proving that the adapter fulfilled its write promise. */
  readonly status: "saved";
  /** Fresh frozen top-level container passed to the adapter and retained by the result. */
  readonly snapshot: DocumentSnapshot<State>;
}

/**
 * Loads a snapshot through an injected adapter without applying browser-specific policy.
 *
 * @param adapter - Storage boundary invoked exactly once and never mutated.
 * @param id - Stable snapshot identifier passed to the adapter without normalization.
 * @returns A found snapshot or an explicit missing result preserving id exactly.
 * @throws {Error} When adapter.load rejects; the original rejection propagates unchanged.
 */
export async function loadSnapshot<State extends SerializableValue>(
  adapter: DocumentStorageAdapter<State>,
  id: string,
): Promise<LoadSnapshotResult<State>> {
  const result: LoadStorageRecordResult<State> = await loadStorageRecord(adapter, id);
  return result.status === "missing" ? result : { snapshot: result.record, status: result.status };
}

/**
 * Validates and saves a snapshot through an injected adapter with a fresh frozen container.
 *
 * @param adapter - Storage boundary invoked exactly once after validation and never mutated.
 * @param snapshot - Caller-owned versioned snapshot inspected without mutation.
 * @returns A saved result containing the immutable top-level container supplied to adapter.save.
 * @throws {Error} When id is blank, version is not an integer, version is negative, or adapter.save rejects.
 */
export async function saveSnapshot<State extends SerializableValue>(
  adapter: DocumentStorageAdapter<State>,
  snapshot: DocumentSnapshot<State>,
): Promise<SavedSnapshotResult<State>> {
  const saved: SavedStorageRecord<State> = await saveStorageRecord(adapter, snapshot);
  return { snapshot: saved.record, status: saved.status };
}
