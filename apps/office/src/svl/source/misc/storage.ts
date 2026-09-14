/**
 * @fileoverview Defines neutral serializable versioned-record storage used by application services and browser adapters without depending on a document shell.
 */

/** Represents a JSON-compatible value that can cross a persistence or worker boundary. */
export type SerializableValue =
  | boolean
  | null
  | number
  | readonly SerializableValue[]
  | string
  | { readonly [key: string]: SerializableValue };

/** Describes one immutable versioned record owned by a storage caller. */
export interface VersionedStorageRecord<State extends SerializableValue> {
  /** Non-blank stable storage identity; whitespace is not a valid identifier. */
  readonly id: string;
  /** JSON-compatible state retained by reference without deep mutation. */
  readonly state: State;
  /** Non-negative generation used for deterministic persistence decisions. */
  readonly version: number;
}

/** Defines the read side of versioned storage independently from save capability. */
export interface VersionedStorageOpenPort<State extends SerializableValue> {
  /** Loads the latest record for an exact identity. @param id - Stable identity passed through unchanged. @returns Stored record or undefined. */
  load(id: string): Promise<VersionedStorageRecord<State> | undefined>;
}

/** Defines the write side of versioned storage independently from open capability. */
export interface VersionedStorageSavePort<State extends SerializableValue> {
  /** Persists one complete record. @param record - Validated record retained without mutation. @returns A promise fulfilled after persistence completes. */
  save(record: VersionedStorageRecord<State>): Promise<void>;
}

/** Defines a store that supports both independently injectable open and save ports. */
export interface VersionedStorageAdapter<State extends SerializableValue>
  extends VersionedStorageOpenPort<State>, VersionedStorageSavePort<State> {}

/** One selected external document returned by a platform-neutral open port. */
export interface OpenedDocument {
  /** Exact source bytes. */
  readonly bytes: Uint8Array;
  /** User-visible source name. */
  readonly name: string;
  /** Opaque platform reference retained only as medium source identity. */
  readonly reference: object;
}

/** Shell-neutral port for selecting and reading one external document. */
export interface DocumentOpenPort {
  /** Opens one caller-filtered document or returns undefined after cancellation. @param accept - Supported media selector. @returns Selected source. */
  open(accept: string): Promise<OpenedDocument | undefined>;
}

/** One external representation offered to a platform export adapter. */
export interface DocumentExportRequest {
  /** Exact binary or textual payload. */
  readonly data: Uint8Array | string;
  /** Platform-visible media type. */
  readonly mediaType: string;
  /** Suggested destination name. */
  readonly name: string;
}

/** Shell-neutral port for exporting one representation without adopting it as primary. */
export interface DocumentExportPort {
  /** Starts one platform export. @param request - Complete export payload. @returns Nothing; completion confirmation is intentionally unavailable. */
  export(request: DocumentExportRequest): void;
}

/** Describes a successful record lookup. */
export interface FoundStorageRecord<State extends SerializableValue> {
  /** Record supplied by the adapter without mutation or cloning. */
  readonly record: VersionedStorageRecord<State>;
  /** Discriminator proving that the lookup found a stored value. */
  readonly status: "found";
}

/** Describes a record lookup whose identity has no stored value. */
export interface MissingStorageRecord {
  /** Original identity passed through without trimming or normalization. */
  readonly id: string;
  /** Discriminator proving that no value was returned by the adapter. */
  readonly status: "missing";
}

/** Represents every deterministic versioned-record lookup outcome. */
export type LoadStorageRecordResult<State extends SerializableValue> =
  FoundStorageRecord<State> | MissingStorageRecord;

/** Describes a successful versioned-record save. */
export interface SavedStorageRecord<State extends SerializableValue> {
  /** Fresh frozen top-level container passed to the adapter. */
  readonly record: VersionedStorageRecord<State>;
  /** Discriminator proving that the adapter fulfilled its write promise. */
  readonly status: "saved";
}

/**
 * Loads a versioned record through an injected storage adapter.
 *
 * @param adapter - Neutral storage boundary invoked exactly once.
 * @param id - Stable identity passed to the adapter unchanged.
 * @returns A found record or an explicit missing result.
 * @throws {Error} When adapter.load rejects; the original rejection propagates unchanged.
 */
export async function loadStorageRecord<State extends SerializableValue>(
  adapter: VersionedStorageOpenPort<State>,
  id: string,
): Promise<LoadStorageRecordResult<State>> {
  const record = await adapter.load(id);
  return record === undefined ? { id, status: "missing" } : { record, status: "found" };
}

/**
 * Validates and saves a versioned record through an injected adapter.
 *
 * @param adapter - Neutral storage boundary invoked exactly once after validation.
 * @param record - Caller-owned versioned record inspected without mutation.
 * @returns A saved result containing the frozen top-level record supplied to the adapter.
 * @throws {Error} When id is blank, version is not a non-negative integer, or adapter.save rejects.
 */
export async function saveStorageRecord<State extends SerializableValue>(
  adapter: VersionedStorageSavePort<State>,
  record: VersionedStorageRecord<State>,
): Promise<SavedStorageRecord<State>> {
  assertStorageRecord(record);
  const recordForAdapter = Object.freeze({ ...record });
  await adapter.save(recordForAdapter);
  return { record: recordForAdapter, status: "saved" };
}

/** Validates one versioned-record identity and generation. @param record - Candidate record. @returns Nothing for valid input. @throws {Error} When identity or version is invalid. */
function assertStorageRecord<State extends SerializableValue>(
  record: VersionedStorageRecord<State>,
): void {
  if (record.id.trim().length === 0 || !Number.isInteger(record.version) || record.version < 0)
    throw new Error("Snapshot id and version are invalid.");
}
