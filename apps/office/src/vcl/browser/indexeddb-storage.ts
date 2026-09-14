/**
 * @fileoverview Implements a browser-native IndexedDB adapter for versioned JSON document snapshots without backend, autosave, or file-picker policy.
 */

import type {
  SerializableValue,
  VersionedStorageAdapter,
  VersionedStorageRecord,
} from "../../svl/source/misc/storage";
import type { RecoveryStorageAdapter } from "../../svl/source/misc/recovery";

/* eslint-disable jsdoc/require-jsdoc -- V8 ignore annotations must sit immediately before native event-handler expressions; detailed JSDoc remains enforced by check-jsdoc.mjs. */

/** Stable schema version for the first browser document snapshot store. */
const schemaVersion = 1;

/** Stable object-store name used only for complete document snapshots. */
const snapshotStoreName = "document-snapshots";

/** Stable schema version for the recovery history and lease database. */
const recoverySchemaVersion = 1;

/** Complete recovery generations keyed by document identity and generation. */
const recoveryGenerationStoreName = "recovery-generations";

/** Cross-tab document leases keyed by stable document identity. */
const recoveryLeaseStoreName = "recovery-leases";

/** Index selecting every retained generation for one document. */
const recoveryDocumentIndexName = "document-id";

/** Default number of complete generations retained for failure-safe restore. */
export const DEFAULT_RECOVERY_GENERATION_LIMIT = 3;

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
> implements VersionedStorageAdapter<State> {
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
  async load(id: string): Promise<VersionedStorageRecord<State> | undefined> {
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
  async save(snapshot: VersionedStorageRecord<State>): Promise<void> {
    const database = await openSnapshotDatabase(this.indexedDb, this.databaseName);
    try {
      await writeSnapshot(database, snapshot);
    } finally {
      database.close();
    }
  }
}

/** IndexedDB row retaining one complete generation under a compound string key. */
interface RecoveryGenerationRow<State extends SerializableValue> {
  /** Stable document identity indexed for history reads. */
  readonly documentId: string;
  /** Collision-free key combining identity and generation. */
  readonly key: string;
  /** Complete recovery record. */
  readonly record: VersionedStorageRecord<State>;
  /** Content generation duplicated for deterministic cleanup ordering. */
  readonly version: number;
}

/** IndexedDB row coordinating one document between browser contexts. */
interface RecoveryLeaseRow {
  /** Stable document identity used as the primary key. */
  readonly id: string;
  /** Absolute expiry after which another context may acquire the lease. */
  readonly expiresAt: number;
  /** Context that currently owns the lease. */
  readonly ownerId: string;
}

/** Durable recovery-history adapter with bounded generations and cross-tab leases. */
export class IndexedDbRecoveryStorageAdapter<
  State extends SerializableValue,
> implements RecoveryStorageAdapter<State> {
  /** Creates a recovery-only database adapter. @param databaseName - Recovery database name. @param indexedDb - Native or test IndexedDB factory. @param generationLimit - Positive retained history bound. @returns Nothing. */
  public constructor(
    private readonly databaseName: string,
    private readonly indexedDb: IndexedDbFactory = globalThis.indexedDB,
    private readonly generationLimit = DEFAULT_RECOVERY_GENERATION_LIMIT,
  ) {
    if (!Number.isInteger(generationLimit) || generationLimit <= 0)
      throw new Error("Recovery generation limit must be a positive integer.");
  }

  /** Loads the newest retained recovery record. @param id - Document identity. @returns Newest record or undefined. */
  public async load(id: string): Promise<VersionedStorageRecord<State> | undefined> {
    return (await this.loadGenerations(id))[0];
  }

  /** Saves and prunes one complete generation in a single IndexedDB transaction. @param record - Complete validated recovery record. @returns Completion after transaction commit. */
  public async save(record: VersionedStorageRecord<State>): Promise<void> {
    const database = await openRecoveryDatabase(this.indexedDb, this.databaseName);
    try {
      await writeRecoveryGeneration(database, record, this.generationLimit);
    } finally {
      database.close();
    }
  }

  /** Loads all retained generations newest first. @param id - Document identity. @returns Structured-cloned recovery history. */
  public async loadGenerations(id: string): Promise<readonly VersionedStorageRecord<State>[]> {
    const database = await openRecoveryDatabase(this.indexedDb, this.databaseName);
    try {
      return await readRecoveryGenerations<State>(database, id);
    } finally {
      database.close();
    }
  }

  /** Deletes all retained generations for one document. @param id - Document identity. @returns Completion after commit. */
  public async deleteGenerations(id: string): Promise<void> {
    const database = await openRecoveryDatabase(this.indexedDb, this.databaseName);
    try {
      await deleteRecoveryGenerations(database, id);
    } finally {
      database.close();
    }
  }

  /** Acquires an expired, unowned, or already-owned lease transactionally. @param id - Document identity. @param ownerId - Context identity. @param expiresAt - New absolute expiry. @param now - Current absolute time. @returns Whether this context owns the committed lease. */
  public async acquireLease(
    id: string,
    ownerId: string,
    expiresAt: number,
    now: number,
  ): Promise<boolean> {
    const database = await openRecoveryDatabase(this.indexedDb, this.databaseName);
    try {
      return await updateRecoveryLease(database, { expiresAt, id, ownerId }, now);
    } finally {
      database.close();
    }
  }

  /** Releases a lease only for its owning context. @param id - Document identity. @param ownerId - Context identity. @returns Completion after commit. */
  public async releaseLease(id: string, ownerId: string): Promise<void> {
    const database = await openRecoveryDatabase(this.indexedDb, this.databaseName);
    try {
      await deleteRecoveryLease(database, id, ownerId);
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
): Promise<VersionedStorageRecord<State> | undefined> {
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
        resolve(request.result as VersionedStorageRecord<State> | undefined);
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
  snapshot: VersionedStorageRecord<State>,
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

/** Opens the recovery-only schema containing generation history and leases. @param indexedDb - Browser factory. @param databaseName - Recovery database name. @returns Open database. */
function openRecoveryDatabase(
  indexedDb: IndexedDbFactory,
  databaseName: string,
): Promise<IDBDatabase> {
  return new Promise(
    /** Registers recovery schema request handlers. @param resolve - Database resolver. @param reject - Browser error rejecter. @returns Nothing. */
    function requestRecoveryDatabase(resolve, reject): void {
      const request = indexedDb.open(databaseName, recoverySchemaVersion);
      /** Rejects a recovery database open failure. @returns Nothing. */
      /* v8 ignore next -- native open failures are covered through injected factory tests. */
      request.onerror = function rejectOpen(): void {
        reject(request.error);
      };
      /** Creates recovery generation and lease stores on first open. @returns Nothing. */
      request.onupgradeneeded = function createRecoveryStores(): void {
        const database = request.result;
        const generations = database.createObjectStore(recoveryGenerationStoreName, {
          keyPath: "key",
        });
        generations.createIndex(recoveryDocumentIndexName, "documentId", { unique: false });
        database.createObjectStore(recoveryLeaseStoreName, { keyPath: "id" });
      };
      /** Resolves a successful recovery database open. @returns Nothing. */
      request.onsuccess = function resolveOpen(): void {
        resolve(request.result);
      };
    },
  );
}

/** Writes one generation and prunes older rows atomically. @param database - Recovery database. @param record - Complete generation. @param generationLimit - Retained generation bound. @returns Completion after commit. */
function writeRecoveryGeneration<State extends SerializableValue>(
  database: IDBDatabase,
  record: VersionedStorageRecord<State>,
  generationLimit: number,
): Promise<void> {
  return new Promise(
    /** Runs one read-modify-write transaction. @param resolve - Commit resolver. @param reject - Transaction rejecter. @returns Nothing. */
    function writeGenerationTransaction(resolve, reject): void {
      const transaction = database.transaction(recoveryGenerationStoreName, "readwrite");
      const store = transaction.objectStore(recoveryGenerationStoreName);
      const request = store.index(recoveryDocumentIndexName).getAll(record.id);
      /** Rejects a failed recovery-history read. @returns Nothing. */
      /* v8 ignore next -- native request errors are covered by transaction failure integration. */
      request.onerror = function rejectRead(): void {
        reject(request.error);
      };
      /** Replaces the generation and schedules stale-row cleanup. @returns Nothing. */
      request.onsuccess = function replaceAndPrune(): void {
        const rows = (request.result as RecoveryGenerationRow<State>[]).filter(
          /** Removes a same-generation predecessor before replacement. @param row - Existing row. @returns Whether it has another generation. */
          (row) => row.version !== record.version,
        );
        const nextRow: RecoveryGenerationRow<State> = {
          documentId: record.id,
          key: createRecoveryGenerationKey(record.id, record.version),
          record,
          version: record.version,
        };
        store.put(nextRow);
        const retained = [...rows, nextRow].sort(
          /** Orders newest recovery rows first. @param left - First row. @param right - Second row. @returns Descending version difference. */
          (left, right) => right.version - left.version,
        );
        for (const stale of retained.slice(generationLimit)) store.delete(stale.key);
      };
      /** Rejects a failed recovery write transaction. @returns Nothing. */
      /* v8 ignore next -- native transaction errors are covered by browser integration. */
      transaction.onerror = function rejectTransaction(): void {
        reject(transaction.error);
      };
      /** Rejects an aborted recovery write transaction. @returns Nothing. */
      /* v8 ignore next -- native transaction aborts are covered by browser integration. */
      transaction.onabort = function rejectAbort(): void {
        reject(transaction.error);
      };
      /** Resolves after the recovery write commits. @returns Nothing. */
      transaction.oncomplete = function resolveWrite(): void {
        resolve();
      };
    },
  );
}

/** Reads valid matching recovery rows newest first. @param database - Recovery database. @param id - Document identity. @returns Ordered complete records. */
function readRecoveryGenerations<State extends SerializableValue>(
  database: IDBDatabase,
  id: string,
): Promise<readonly VersionedStorageRecord<State>[]> {
  return new Promise(
    /** Runs one readonly history query. @param resolve - History resolver. @param reject - Transaction rejecter. @returns Nothing. */
    function readGenerationsTransaction(resolve, reject): void {
      const transaction = database.transaction(recoveryGenerationStoreName, "readonly");
      const request = transaction
        .objectStore(recoveryGenerationStoreName)
        .index(recoveryDocumentIndexName)
        .getAll(id);
      /** Rejects a failed recovery-history query. @returns Nothing. */
      /* v8 ignore next -- native request errors are covered by browser integration. */
      request.onerror = function rejectRead(): void {
        reject(request.error);
      };
      /** Rejects a failed recovery read transaction. @returns Nothing. */
      /* v8 ignore next -- native transaction errors are covered by browser integration. */
      transaction.onerror = function rejectTransaction(): void {
        reject(transaction.error);
      };
      /** Rejects an aborted recovery read transaction. @returns Nothing. */
      /* v8 ignore next -- native transaction aborts are covered by browser integration. */
      transaction.onabort = function rejectAbort(): void {
        reject(transaction.error);
      };
      /** Resolves ordered valid recovery history. @returns Nothing. */
      transaction.oncomplete = function resolveHistory(): void {
        resolve(
          (request.result as RecoveryGenerationRow<State>[])
            .filter(
              /** Rejects structurally inconsistent rows. @param row - Candidate row. @returns Whether identity and version agree. */
              (row) =>
                row.documentId === id &&
                row.record.id === id &&
                row.record.version === row.version &&
                Number.isInteger(row.version) &&
                row.version >= 0,
            )
            .sort(
              /** Orders newest rows first. @param left - First row. @param right - Second row. @returns Descending version difference. */
              (left, right) => right.version - left.version,
            )
            .map(
              /** Projects one IndexedDB envelope to its complete record. @param row - Valid row. @returns Stored record. */
              (row) => row.record,
            ),
        );
      };
    },
  );
}

/** Deletes all history rows selected by one document index key. @param database - Recovery database. @param id - Document identity. @returns Completion after commit. */
function deleteRecoveryGenerations(database: IDBDatabase, id: string): Promise<void> {
  return new Promise(
    /** Runs one indexed deletion transaction. @param resolve - Commit resolver. @param reject - Transaction rejecter. @returns Nothing. */
    function deleteGenerationsTransaction(resolve, reject): void {
      const transaction = database.transaction(recoveryGenerationStoreName, "readwrite");
      const store = transaction.objectStore(recoveryGenerationStoreName);
      const request = store.index(recoveryDocumentIndexName).getAll(id);
      /** Rejects a failed history selection. @returns Nothing. */
      /* v8 ignore next -- native request errors are covered by browser integration. */
      request.onerror = function rejectRead(): void {
        reject(request.error);
      };
      /** Schedules deletion of every selected history row. @returns Nothing. */
      request.onsuccess = function deleteRows(): void {
        for (const row of request.result as RecoveryGenerationRow<SerializableValue>[])
          store.delete(row.key);
      };
      /** Rejects a failed history deletion transaction. @returns Nothing. */
      /* v8 ignore next -- native transaction errors are covered by browser integration. */
      transaction.onerror = function rejectTransaction(): void {
        reject(transaction.error);
      };
      /** Rejects an aborted history deletion transaction. @returns Nothing. */
      /* v8 ignore next -- native transaction aborts are covered by browser integration. */
      transaction.onabort = function rejectAbort(): void {
        reject(transaction.error);
      };
      /** Resolves after history deletion commits. @returns Nothing. */
      transaction.oncomplete = function resolveDelete(): void {
        resolve();
      };
    },
  );
}

/** Acquires or renews one lease within a read-write transaction. @param database - Recovery database. @param lease - Requested lease. @param now - Current absolute time. @returns Whether the request became owner. */
function updateRecoveryLease(
  database: IDBDatabase,
  lease: RecoveryLeaseRow,
  now: number,
): Promise<boolean> {
  return new Promise(
    /** Runs one compare-and-replace lease transaction. @param resolve - Ownership resolver. @param reject - Transaction rejecter. @returns Nothing. */
    function updateLeaseTransaction(resolve, reject): void {
      const transaction = database.transaction(recoveryLeaseStoreName, "readwrite");
      const store = transaction.objectStore(recoveryLeaseStoreName);
      const request = store.get(lease.id);
      let acquired = false;
      /** Rejects a failed lease read. @returns Nothing. */
      /* v8 ignore next -- native request errors are covered by browser integration. */
      request.onerror = function rejectRead(): void {
        reject(request.error);
      };
      /** Compares and conditionally replaces the current lease. @returns Nothing. */
      request.onsuccess = function compareLease(): void {
        const current = request.result as RecoveryLeaseRow | undefined;
        if (
          current === undefined ||
          current.ownerId === lease.ownerId ||
          current.expiresAt <= now
        ) {
          acquired = true;
          store.put(lease);
        }
      };
      /** Rejects a failed lease transaction. @returns Nothing. */
      /* v8 ignore next -- native transaction errors are covered by browser integration. */
      transaction.onerror = function rejectTransaction(): void {
        reject(transaction.error);
      };
      /** Rejects an aborted lease transaction. @returns Nothing. */
      /* v8 ignore next -- native transaction aborts are covered by browser integration. */
      transaction.onabort = function rejectAbort(): void {
        reject(transaction.error);
      };
      /** Resolves committed lease ownership. @returns Nothing. */
      transaction.oncomplete = function resolveLease(): void {
        resolve(acquired);
      };
    },
  );
}

/** Deletes one lease only when the current context owns it. @param database - Recovery database. @param id - Document identity. @param ownerId - Context identity. @returns Completion after commit. */
function deleteRecoveryLease(database: IDBDatabase, id: string, ownerId: string): Promise<void> {
  return new Promise(
    /** Runs one ownership-checked lease deletion. @param resolve - Commit resolver. @param reject - Transaction rejecter. @returns Nothing. */
    function deleteLeaseTransaction(resolve, reject): void {
      const transaction = database.transaction(recoveryLeaseStoreName, "readwrite");
      const store = transaction.objectStore(recoveryLeaseStoreName);
      const request = store.get(id);
      /** Rejects a failed owned-lease read. @returns Nothing. */
      /* v8 ignore next -- native request errors are covered by browser integration. */
      request.onerror = function rejectRead(): void {
        reject(request.error);
      };
      /** Deletes the lease when owner identity matches. @returns Nothing. */
      request.onsuccess = function removeOwnedLease(): void {
        const current = request.result as RecoveryLeaseRow | undefined;
        if (current?.ownerId === ownerId) store.delete(id);
      };
      /** Rejects a failed lease deletion transaction. @returns Nothing. */
      /* v8 ignore next -- native transaction errors are covered by browser integration. */
      transaction.onerror = function rejectTransaction(): void {
        reject(transaction.error);
      };
      /** Rejects an aborted lease deletion transaction. @returns Nothing. */
      /* v8 ignore next -- native transaction aborts are covered by browser integration. */
      transaction.onabort = function rejectAbort(): void {
        reject(transaction.error);
      };
      /** Resolves after lease deletion commits. @returns Nothing. */
      transaction.oncomplete = function resolveDelete(): void {
        resolve();
      };
    },
  );
}

/** Creates a collision-free recovery row key. @param id - Document identity. @param version - Content generation. @returns Stable compound key. */
function createRecoveryGenerationKey(id: string, version: number): string {
  return JSON.stringify([id, version]);
}
