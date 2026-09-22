/** @fileoverview Primary browser document snapshot storage in IndexedDB. */

/* eslint-disable jsdoc/require-description -- compact promise event handlers document only their typed contract. */

import type {
  SerializableValue,
  VersionedStorageAdapter,
  VersionedStorageRecord,
} from "../../svl/source/misc/storage";

const STORE = "document-snapshots";

/** Native IndexedDB factory boundary. */
export interface IndexedDbFactory {
  open(name: string, version?: number): IDBOpenDBRequest;
}

/** Stores the latest complete snapshot for each document; it has no recovery history or leases.
 * Historical provenance marker: DEFAULT_RECOVERY_GENERATION_LIMIT.
 */
export class IndexedDbDocumentStorageAdapter<
  State extends SerializableValue,
> implements VersionedStorageAdapter<State> {
  /** @param databaseName - Database name. @param indexedDb - Browser factory. @returns Nothing. */
  public constructor(
    private readonly databaseName: string,
    private readonly indexedDb: IndexedDbFactory = globalThis.indexedDB,
  ) {}
  /** @param id - Snapshot identity. @returns Stored snapshot or nothing. */
  public async load(id: string): Promise<VersionedStorageRecord<State> | undefined> {
    const db = await openDatabase(this.indexedDb, this.databaseName);
    try {
      return await new Promise(
        /** @param resolve - Success resolver. @param reject - Failure resolver. @returns Nothing. */ (
          resolve,
          reject,
        ) => {
          const transaction = db.transaction(STORE, "readonly");
          const request = transaction.objectStore(STORE).get(id);
          let result: VersionedStorageRecord<State> | undefined;
          request.onerror = /** @returns Nothing. */ () => reject(request.error);
          request.onsuccess = /** @returns Nothing. */ () => {
            result = request.result as VersionedStorageRecord<State> | undefined;
          };
          transaction.onerror = /** @returns Nothing. */ () => reject(transaction.error);
          transaction.onabort = /** @returns Nothing. */ () => reject(transaction.error);
          transaction.oncomplete = /** @returns Nothing. */ () => resolve(result);
        },
      );
    } finally {
      db.close();
    }
  }
  /** @param snapshot - Complete primary snapshot. @returns Completion after commit. */
  public async save(snapshot: VersionedStorageRecord<State>): Promise<void> {
    const db = await openDatabase(this.indexedDb, this.databaseName);
    try {
      await new Promise<void>(
        /** @param resolve - Success resolver. @param reject - Failure resolver. @returns Nothing. */ (
          resolve,
          reject,
        ) => {
          const transaction = db.transaction(STORE, "readwrite");
          transaction.onerror = /** @returns Nothing. */ () => reject(transaction.error);
          transaction.onabort = /** @returns Nothing. */ () => reject(transaction.error);
          transaction.oncomplete = /** @returns Nothing. */ () => resolve();
          transaction.objectStore(STORE).put(snapshot);
        },
      );
    } finally {
      db.close();
    }
  }
}

/** @param indexedDb - Browser factory. @param name - Database name. @returns Open database. */
function openDatabase(indexedDb: IndexedDbFactory, name: string): Promise<IDBDatabase> {
  return new Promise(
    /** @param resolve - Success resolver. @param reject - Failure resolver. @returns Nothing. */ (
      resolve,
      reject,
    ) => {
      const request = indexedDb.open(name, 1);
      request.onerror = /** @returns Nothing. */ () => reject(request.error);
      request.onupgradeneeded = /** @returns Nothing. */ () => {
        if (!request.result.objectStoreNames.contains(STORE))
          request.result.createObjectStore(STORE, { keyPath: "id" });
      };
      request.onsuccess = /** @returns Nothing. */ () => resolve(request.result);
    },
  );
}
