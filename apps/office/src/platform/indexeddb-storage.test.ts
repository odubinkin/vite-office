/**
 * @fileoverview Verifies native-shaped IndexedDB snapshot persistence, initial schema creation, exact replacement behavior, and unchanged open failures.
 */

import { IDBFactory } from "fake-indexeddb";
import { describe, expect, it } from "vitest";

import type { DocumentSnapshot } from "../domain/storage";
import { IndexedDbDocumentStorageAdapter, type IndexedDbFactory } from "./indexeddb-storage";

/** Describes the JSON-compatible snapshot body used by the IndexedDB fixtures. */
type IndexedDbFixtureState = { readonly body: string };

/** Monotonically increasing suffix that keeps test databases isolated without deletion races. */
let databaseSequence = 0;

/**
 * Creates a valid complete snapshot fixture.
 *
 * @param id - Exact object-store key retained without normalization.
 * @param version - Non-negative integer revision for replacement assertions.
 * @param body - JSON-compatible text body retained in the snapshot state.
 * @returns Caller-owned snapshot fixture suitable for IndexedDB structured cloning.
 */
function createSnapshot(
  id = "document-1",
  version = 0,
  body = "First body",
): DocumentSnapshot<IndexedDbFixtureState> {
  return { id, state: { body }, version };
}

/**
 * Creates an isolated adapter using a fresh native-shaped in-memory IndexedDB factory.
 *
 * @returns Adapter and factory sharing one unique test database name.
 */
function createAdapter(): {
  readonly adapter: IndexedDbDocumentStorageAdapter<IndexedDbFixtureState>;
  readonly databaseName: string;
  readonly indexedDb: IDBFactory;
} {
  databaseSequence += 1;
  const indexedDb = new IDBFactory();
  const databaseName = `vite-office-indexeddb-${databaseSequence}`;
  return {
    adapter: new IndexedDbDocumentStorageAdapter(databaseName, indexedDb),
    databaseName,
    indexedDb,
  };
}

/**
 * Opens a database through the test factory so its initial schema can be inspected.
 *
 * @param indexedDb - In-memory factory that owns the requested database.
 * @param databaseName - Exact database name to open at its current version.
 * @returns Open test database, which callers must close after inspection.
 */
function inspectDatabase(indexedDb: IDBFactory, databaseName: string): Promise<IDBDatabase> {
  return new Promise(
    /**
     * Registers inspection request handlers.
     * @param resolve - Promise resolver receiving the opened inspection database.
     * @param reject - Promise rejecter receiving browser operation errors.
     * @returns Nothing; request events settle the outer promise.
     */
    function openForInspection(resolve, reject): void {
      const request = indexedDb.open(databaseName);
      /** Rejects schema inspection with its browser request error.
       * @returns Nothing; rejects the outer promise.
       */
      request.onerror = function rejectInspection(): void {
        reject(request.error);
      };
      /** Resolves schema inspection with its opened database.
       * @returns Nothing; resolves the outer promise.
       */
      request.onsuccess = function resolveInspection(): void {
        resolve(request.result);
      };
    },
  );
}

/**
 * Creates a factory that rejects adapter opens with one caller-provided error object.
 *
 * @param failure - Exact failure to throw synchronously from the browser-factory boundary.
 * @returns Minimal factory whose open method always throws failure unchanged.
 */
function createFailingFactory(failure: Error): IndexedDbFactory {
  return {
    /**
     * Throws the configured failure before an IndexedDB request can be created.
     *
     * @returns Nothing; this test-only factory always throws.
     * @throws {Error} The configured failure object without translation.
     */
    open: function failOpen(): IDBOpenDBRequest {
      throw failure;
    },
  };
}

describe("IndexedDbDocumentStorageAdapter" /**
 * Groups browser-compatible IndexedDB persistence contract tests.
 *
 * @returns Nothing; Vitest registers enclosed cases.
 */, function defineIndexedDbAdapterTests(): void {
  it("creates the version-one snapshot store and returns undefined for a missing key" /**
   * Verifies initial upgrade behavior produces a readable deterministic empty database.
   *
   * @returns Nothing; assertions validate the schema and missing read behavior.
   */, async function createsInitialSchema(): Promise<void> {
    const { adapter, databaseName, indexedDb } = createAdapter();

    await expect(adapter.load("missing")).resolves.toBeUndefined();
    const database = await inspectDatabase(indexedDb, databaseName);

    expect(database.version).toBe(1);
    expect(database.objectStoreNames.contains("document-snapshots")).toBe(true);
    database.close();
  });

  it("structured-clones saved snapshots and deterministically replaces an existing identifier" /**
   * Verifies writes do not retain caller objects and the latest same-key value is returned.
   *
   * @returns Nothing; assertions validate immutable round trips and replacement semantics.
   */, async function savesAndReplacesSnapshots(): Promise<void> {
    const { adapter } = createAdapter();
    const initial = createSnapshot("document-2", 0, "Before");
    const replacement = createSnapshot("document-2", 1, "After");

    await adapter.save(initial);
    await adapter.save(replacement);
    const loaded = await adapter.load("document-2");

    expect(loaded).toEqual(replacement);
    expect(loaded).not.toBe(replacement);
    expect(loaded?.state).not.toBe(replacement.state);
    expect(initial).toEqual(createSnapshot("document-2", 0, "Before"));
  });

  it("propagates browser factory failures unchanged for both reads and writes" /**
   * Verifies future recovery layers can classify native failures without adapter translation.
   *
   * @returns Nothing; assertions validate rejection object identity for each operation.
   */, async function propagatesOpenFailures(): Promise<void> {
    const failure = new Error("IndexedDB unavailable");
    const adapter = new IndexedDbDocumentStorageAdapter<IndexedDbFixtureState>(
      "unavailable",
      createFailingFactory(failure),
    );

    await expect(adapter.load("document-3")).rejects.toBe(failure);
    await expect(adapter.save(createSnapshot("document-3"))).rejects.toBe(failure);
  });

  it("rejects a native structured-clone write failure without leaving a partial snapshot" /**
   * Verifies request and aborted transaction errors remain observable from native IndexedDB.
   *
   * @returns Nothing; assertions validate a failed write and the resulting missing key.
   */, async function propagatesWriteTransactionFailures(): Promise<void> {
    const { adapter } = createAdapter();
    const invalidSnapshot = {
      id: "document-4",
      state: Symbol("not-json"),
      version: 0,
    } as unknown as DocumentSnapshot<IndexedDbFixtureState>;

    await expect(adapter.save(invalidSnapshot)).rejects.toBeInstanceOf(Error);
    await expect(adapter.load("document-4")).resolves.toBeUndefined();
  });
});
