/**
 * @fileoverview Defines the bounded browser document-medium persistence contract at the LibreOffice `sfx2/source/doc/docfile.cxx` ownership boundary without selecting a browser persistence API.
 */

/**
 * Represents a JSON-compatible value that can be serialized without custom codecs.
 *
 * Document state crossing this boundary must only contain values expressible in
 * JSON. Browser-specific handles, functions, symbols, cyclic data, and class
 * instances belong behind a later platform adapter rather than in a snapshot.
 */
export type SerializableValue =
  | boolean
  | null
  | number
  | readonly SerializableValue[]
  | string
  | { readonly [key: string]: SerializableValue };

/** Describes one immutable versioned snapshot owned by a document-storage caller. */
export interface DocumentSnapshot<State extends SerializableValue> {
  /** Non-blank stable storage identity; whitespace is not a valid identifier. */
  readonly id: string;
  /** Non-negative integer revision used for deterministic conflict handling in a future adapter. */
  readonly version: number;
  /** JSON-compatible document state retained by reference without deep mutation. */
  readonly state: State;
}

/**
 * Defines injected asynchronous persistence operations without coupling domain
 * logic to IndexedDB, OPFS, download APIs, or a backend.
 */
export interface DocumentStorageAdapter<State extends SerializableValue> {
  /**
   * Loads the latest snapshot identified by id.
   *
   * @param id - Stable storage identity to inspect without normalizing or mutating.
   * @returns The immutable snapshot when it exists, otherwise undefined.
   * @throws {Error} When the underlying browser adapter cannot complete its read.
   */
  load(id: string): Promise<DocumentSnapshot<State> | undefined>;

  /**
   * Persists one top-level frozen snapshot container.
   *
   * The adapter must not mutate the supplied container or its caller-owned
   * state. The orchestrator supplies a fresh container while retaining the
   * state reference, so deep cloning policy remains explicit for future codecs.
   *
   * @param snapshot - Validated snapshot container to persist without mutation.
   * @returns A promise fulfilled once the write completes.
   * @throws {Error} When the underlying browser adapter cannot complete its write.
   */
  save(snapshot: DocumentSnapshot<State>): Promise<void>;
}

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
  const snapshot = await adapter.load(id);
  return snapshot === undefined ? { id, status: "missing" } : { snapshot, status: "found" };
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
  assertSnapshot(snapshot);
  const snapshotForAdapter = Object.freeze({ ...snapshot });
  await adapter.save(snapshotForAdapter);
  return { snapshot: snapshotForAdapter, status: "saved" };
}

/**
 * Validates the deterministic identity and version invariants required before saving.
 *
 * @param snapshot - Caller-owned snapshot inspected without mutation.
 * @returns Nothing; a valid snapshot allows persistence to continue.
 * @throws {Error} When id is blank or version is not a non-negative integer.
 */
function assertSnapshot<State extends SerializableValue>(snapshot: DocumentSnapshot<State>): void {
  if (
    snapshot.id.trim().length === 0 ||
    !Number.isInteger(snapshot.version) ||
    snapshot.version < 0
  )
    throw new Error("Snapshot id and version are invalid.");
}
