/**
 * @fileoverview Implements a browser-native IndexedDB adapter for versioned JSON document snapshots without backend, autosave, or file-picker policy.
 */

import type {
  DocumentSnapshot,
  DocumentStorageAdapter,
  SerializableValue,
} from "../../sfx2/source/doc/storage";

/* eslint-disable jsdoc/require-jsdoc -- V8 ignore annotations must sit immediately before native event-handler expressions; detailed JSDoc remains enforced by check-jsdoc.mjs. */

/** Stable schema version for the first browser document snapshot store. */
const schemaVersion = 1;

/** Stable object-store name used only for complete document snapshots. */
const snapshotStoreName = "document-snapshots";

/**
 * Defines the narrow browser factory surface needed by this adapter.
 *
 * Accepting this structural type keeps production bound to the native browser
 * API while allowing deterministic test factories without adding a runtime
 * persistence dependency to the Vite application bundle.
 */
export interface IndexedDbFactory {
  /**
   * Opens a named database at an optional schema version.
   *
   * @param name - Browser-local database name passed to IndexedDB unchanged.
   * @param version - Positive schema version controlling upgrades.
   * @returns Request whose events resolve, reject, or upgrade the database open operation.
   * @throws {Error} When the browser refuses to start the open operation synchronously.
   */
  open(name: string, version?: number): IDBOpenDBRequest;
}

/**
 * Persists complete snapshots in one browser-local IndexedDB database.
 *
 * Each save uses the snapshot identifier as the object-store key, so an
 * accepted save deterministically replaces an earlier value with that same
 * identifier. The class has no cache and closes each database connection after
 * its transaction, allowing future recovery and migration policies to remain
 * separate features.
 */
export class IndexedDbDocumentStorageAdapter<
  State extends SerializableValue,
> implements DocumentStorageAdapter<State> {
  /**
   * Creates an adapter bound to one caller-chosen browser-local database.
   *
   * @param databaseName - Exact IndexedDB database name; callers own naming and deletion policy.
   * @param indexedDb - Native IndexedDB factory or a browser-compatible injected test factory.
   * @returns A ready adapter instance without opening the database eagerly.
   */
  constructor(
    private readonly databaseName: string,
    private readonly indexedDb: IndexedDbFactory = globalThis.indexedDB,
  ) {}

  /**
   * Reads one complete snapshot from the stable object store.
   *
   * @param id - Exact snapshot identifier queried without normalization or mutation.
   * @returns A structured-cloned snapshot, or undefined when no matching key exists.
   * @throws {Error} When IndexedDB cannot open or read the database; its original rejection propagates.
   */
  async load(id: string): Promise<DocumentSnapshot<State> | undefined> {
    const database = await openSnapshotDatabase(this.indexedDb, this.databaseName);
    try {
      return await readSnapshot<State>(database, id);
    } finally {
      database.close();
    }
  }

  /**
   * Writes one complete validated snapshot under its identifier.
   *
   * IndexedDB structured-clones the supplied value; this adapter does not
   * mutate it or retain an in-memory reference after the write finishes.
   *
   * @param snapshot - Validated JSON-compatible snapshot to store without mutation.
   * @returns A promise fulfilled after the read-write transaction commits.
   * @throws {Error} When IndexedDB cannot open or commit the write; its original rejection propagates.
   */
  async save(snapshot: DocumentSnapshot<State>): Promise<void> {
    const database = await openSnapshotDatabase(this.indexedDb, this.databaseName);
    try {
      await writeSnapshot(database, snapshot);
    } finally {
      database.close();
    }
  }
}

/**
 * Opens the stable schema and creates its store during the first version-one upgrade.
 *
 * @param indexedDb - Browser IndexedDB factory used without mutation.
 * @param databaseName - Exact browser-local database name to open.
 * @returns Open database with the version-one snapshot object store available.
 * @throws {Error} When the browser emits an open failure or the factory throws synchronously.
 */
function openSnapshotDatabase(
  indexedDb: IndexedDbFactory,
  databaseName: string,
): Promise<IDBDatabase> {
  return new Promise(
    /**
     * Registers database request handlers and settles the open promise.
     * @param resolve - Promise resolver receiving the open database.
     * @param reject - Promise rejecter receiving browser operation errors.
     * @returns Nothing; request events settle the outer promise.
     */
    function requestSnapshotDatabase(resolve, reject): void {
      const request = indexedDb.open(databaseName, schemaVersion);
      /**
       * Rejects the open operation with the browser-provided request error.
       * @returns Nothing; rejects the outer promise.
       */
      /* v8 ignore next -- platform request-error events are covered by browser integration, not the deterministic shim. */
      request.onerror = function rejectOpen(): void {
        reject(request.error);
      };
      /**
       * Creates the version-one snapshot store during the initial upgrade.
       * @returns Nothing; changes only the upgrade transaction schema.
       */
      request.onupgradeneeded = function createSnapshotStore(): void {
        request.result.createObjectStore(snapshotStoreName, { keyPath: "id" });
      };
      /**
       * Resolves the open operation with its live database connection.
       * @returns Nothing; resolves the outer promise.
       */
      request.onsuccess = function resolveOpen(): void {
        resolve(request.result);
      };
    },
  );
}

/**
 * Reads a snapshot and waits for its readonly transaction to finish.
 *
 * @param database - Open database used only for this operation.
 * @param id - Exact object-store key to retrieve without mutation.
 * @returns Structured-cloned snapshot or undefined for a missing key.
 * @throws {Error} When the request or transaction errors or aborts.
 */
function readSnapshot<State extends SerializableValue>(
  database: IDBDatabase,
  id: string,
): Promise<DocumentSnapshot<State> | undefined> {
  return new Promise(
    /**
     * Registers a readonly request and settles after its transaction.
     * @param resolve - Promise resolver receiving the queried snapshot.
     * @param reject - Promise rejecter receiving browser operation errors.
     * @returns Nothing; transaction events settle the outer promise.
     */
    function readInTransaction(resolve, reject): void {
      const transaction = database.transaction(snapshotStoreName, "readonly");
      const request = transaction.objectStore(snapshotStoreName).get(id);
      /** Rejects the read with the browser-provided request error.
       * @returns Nothing; rejects the outer promise.
       */
      /* v8 ignore next -- platform request-error events are covered by browser integration, not the deterministic shim. */
      request.onerror = function rejectRead(): void {
        reject(request.error);
      };
      /** Rejects the read with the browser-provided transaction error.
       * @returns Nothing; rejects the outer promise.
       */
      /* v8 ignore next -- platform transaction-error events are covered by browser integration, not the deterministic shim. */
      transaction.onerror = function rejectReadTransaction(): void {
        reject(transaction.error);
      };
      /** Rejects the read when its transaction aborts.
       * @returns Nothing; rejects the outer promise.
       */
      /* v8 ignore next -- platform abort events are covered by browser integration, not the deterministic shim. */
      transaction.onabort = function rejectAbortedRead(): void {
        reject(transaction.error);
      };
      /** Resolves the read after its transaction completes.
       * @returns Nothing; resolves the outer promise.
       */
      transaction.oncomplete = function resolveRead(): void {
        resolve(request.result as DocumentSnapshot<State> | undefined);
      };
    },
  );
}

/**
 * Writes a snapshot and waits for its read-write transaction to commit.
 *
 * @param database - Open database used only for this operation.
 * @param snapshot - JSON-compatible snapshot supplied to IndexedDB without mutation.
 * @returns A promise fulfilled after the browser commits the snapshot replacement.
 * @throws {Error} When the request or transaction errors or aborts.
 */
function writeSnapshot<State extends SerializableValue>(
  database: IDBDatabase,
  snapshot: DocumentSnapshot<State>,
): Promise<void> {
  return new Promise(
    /**
     * Registers a read-write request and settles after its transaction.
     * @param resolve - Promise resolver fulfilled after a committed write.
     * @param reject - Promise rejecter receiving browser operation errors.
     * @returns Nothing; transaction events settle the outer promise.
     */
    function writeInTransaction(resolve, reject): void {
      const transaction = database.transaction(snapshotStoreName, "readwrite");
      const request = transaction.objectStore(snapshotStoreName).put(snapshot);
      /** Rejects the write with the browser-provided request error.
       * @returns Nothing; rejects the outer promise.
       */
      /* v8 ignore next -- platform request-error events are covered by browser integration, not the deterministic shim. */
      request.onerror = function rejectWrite(): void {
        reject(request.error);
      };
      /** Rejects the write with the browser-provided transaction error.
       * @returns Nothing; rejects the outer promise.
       */
      /* v8 ignore next -- platform transaction-error events are covered by browser integration, not the deterministic shim. */
      transaction.onerror = function rejectWriteTransaction(): void {
        reject(transaction.error);
      };
      /** Rejects the write when its transaction aborts.
       * @returns Nothing; rejects the outer promise.
       */
      /* v8 ignore next -- platform abort events are covered by browser integration, not the deterministic shim. */
      transaction.onabort = function rejectAbortedWrite(): void {
        reject(transaction.error);
      };
      /** Resolves the write after its transaction commits.
       * @returns Nothing; resolves the outer promise.
       */
      transaction.oncomplete = function resolveWrite(): void {
        resolve();
      };
    },
  );
}
