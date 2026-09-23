/** @fileoverview Verifies atomic ODT browser records and retired JSON isolation. */

import { IDBFactory } from "fake-indexeddb";
import { describe, expect, it } from "vitest";

import { IndexedDbWriterOdtStore, type BrowserWriterDocument } from "./writer-odt-store";

/** IndexedDB callback that a focused failure fixture forces to reject. */
type Fault =
  | "open"
  | "list-request"
  | "list-abort"
  | "load-request"
  | "load-abort"
  | "title-request"
  | "write-error"
  | "write-abort";

/** Injects a failing IndexedDB event at one browser API boundary. @param fault - Event to fail. @returns Faulting factory. */
function failingFactory(fault: Fault): IDBFactory {
  const failure = new DOMException("Simulated IndexedDB failure", "UnknownError");
  const request =
    /** Runs the focused test callback. @param event - Input for this operation. @param result - Input for this operation. @returns Operation result. */ (
      event: "error" | "success",
      result?: unknown,
    ) => {
      const item: {
        error: DOMException | null;
        result: unknown;
        onerror?: () => void;
        onsuccess?: () => void;
      } = {
        error: event === "error" ? failure : null,
        result,
      };
      queueMicrotask(
        /** Runs the focused test callback. @returns Operation result. */ () =>
          event === "error" ? item.onerror?.() : item.onsuccess?.(),
      );
      return item;
    };
  const database = {
    close: /** Runs the focused test callback. @returns Operation result. */ () => undefined,
    transaction: /** Runs the focused test callback. @returns Operation result. */ () => {
      const transaction: {
        error: DOMException | null;
        onabort?: () => void;
        oncomplete?: () => void;
        onerror?: () => void;
        objectStore: () => unknown;
      } = {
        error: fault === "write-abort" ? null : failure,
        objectStore: /** Runs the focused test callback. @returns Operation result. */ () => ({
          getAll: /** Runs the focused test callback. @returns Operation result. */ () =>
            request(fault === "list-request" ? "error" : "success", []),
          get: /** Runs the focused test callback. @returns Operation result. */ () =>
            request(fault === "load-request" ? "error" : "success", undefined),
          index: /** Runs the focused test callback. @returns Operation result. */ () => ({
            get: /** Runs the focused test callback. @returns Operation result. */ () =>
              request(fault === "title-request" ? "error" : "success"),
          }),
          put: /** Runs the focused test callback. @returns Operation result. */ () => undefined,
        }),
      };
      if (fault === "list-abort" || fault === "load-abort" || fault === "write-abort")
        queueMicrotask(
          /** Runs the focused test callback. @returns Operation result. */ () =>
            transaction.onabort?.(),
        );
      if (fault === "write-error")
        queueMicrotask(
          /** Runs the focused test callback. @returns Operation result. */ () =>
            transaction.onerror?.(),
        );
      return transaction;
    },
  };
  return {
    open: /** Runs the focused test callback. @returns Operation result. */ () => {
      const opened: {
        error: DOMException | null;
        result: typeof database;
        onerror?: () => void;
        onsuccess?: () => void;
      } = { error: fault === "open" ? failure : null, result: database };
      queueMicrotask(
        /** Runs the focused test callback. @returns Operation result. */ () =>
          fault === "open" ? opened.onerror?.() : opened.onsuccess?.(),
      );
      return opened;
    },
  } as unknown as IDBFactory;
}

/** Builds one immutable browser record. @param id - Document ID. @param title - Display title. @param version - Content version. @returns Stored record. */
function record(id: string, title: string, version = 1): BrowserWriterDocument {
  return { bytes: new Uint8Array([80, 75, version]), id, title, version };
}

/** Opens an IndexedDB database at a specified version. @param factory - Isolated database factory. @param name - Database name. @param version - Requested version. @returns Open database. */
function openDatabase(factory: IDBFactory, name: string, version: number): Promise<IDBDatabase> {
  return new Promise(
    /** Resolves database open events. @param resolve - Success completion. @param reject - Failure completion. @returns Nothing. */
    (resolve, reject) => {
      const request = factory.open(name, version);
      request.onupgradeneeded =
        /** Creates the retired store for compatibility checks. @returns Nothing. */ () => {
          if (!request.result.objectStoreNames.contains("document-snapshots"))
            request.result.createObjectStore("document-snapshots", { keyPath: "id" });
        };
      request.onsuccess = /** Returns the open database. @returns Nothing. */ () =>
        resolve(request.result);
      request.onerror = /** Rejects a failed open. @returns Nothing. */ () => reject(request.error);
    },
  );
}

describe("IndexedDbWriterOdtStore", /** Registers IndexedDB ODT behavior tests. @returns Nothing. */ () => {
  it("saves, loads, copies, and atomically renames ODT records", /** Checks browser document identity and title rules. @returns Completion. */ async () => {
    const store = new IndexedDbWriterOdtStore("odt-records", new IDBFactory());
    expect(await store.list()).toEqual([]);
    expect(await store.load("missing")).toBeUndefined();
    await store.save(record("one", "Original"));
    expect(await store.load("one")).toMatchObject({ id: "one", title: "Original", version: 1 });
    expect(Array.from((await store.load("one"))?.bytes ?? [])).toEqual([80, 75, 1]);
    await store.save(record("one", "Original", 2));
    await store.saveAs(record("two", "Second"));
    expect(await store.list()).toHaveLength(2);
    await store.rename(record("one", "Renamed", 3), "Original");
    expect((await store.load("one"))?.title).toBe("Renamed");
    expect(
      (await store.list()).map(
        /** Selects a stored title. @param document - Stored record. @returns Title. */
        (document) => document.title,
      ),
    ).not.toContain("Original");
    expect((await store.load("two"))?.title).toBe("Second");
  });

  it("rejects blank, duplicate, and stale rename operations without overwriting", /** Checks collision safety. @returns Completion. */ async () => {
    const store = new IndexedDbWriterOdtStore("odt-collisions", new IDBFactory());
    await expect(store.save(record("one", " "))).rejects.toThrow("Document name is required.");
    await store.save(record("one", "First"));
    await store.saveAs(record("two", "Second"));
    await expect(store.save(record("three", "First"))).rejects.toThrow(/already exists/);
    await expect(store.saveAs(record("one", "First"))).rejects.toThrow(/already exists/);
    await expect(store.rename(record("one", "Second"), "First")).rejects.toThrow(/already exists/);
    await expect(store.rename(record("one", "Third"), "Wrong old name")).rejects.toThrow(
      /another tab/,
    );
    await expect(store.rename(record("missing", "Third"), "First")).rejects.toThrow(/another tab/);
    expect((await store.load("one"))?.title).toBe("First");
    expect((await store.load("two"))?.title).toBe("Second");
  });

  it("does not read or delete retired JSON records", /** Checks that no migration runs. @returns Completion. */ async () => {
    const factory = new IDBFactory();
    const database = await openDatabase(factory, "retired-json", 1);
    await new Promise<void>(
      /** Writes one retired record. @param resolve - Transaction completion. @param reject - Transaction failure. @returns Nothing. */
      (resolve, reject) => {
        const transaction = database.transaction("document-snapshots", "readwrite");
        transaction
          .objectStore("document-snapshots")
          .put({ id: "old", state: { codec: "writer.browser-snapshot" } });
        transaction.oncomplete = /** Marks the legacy write complete. @returns Nothing. */ () =>
          resolve();
        transaction.onerror = /** Reports legacy write failure. @returns Nothing. */ () =>
          reject(transaction.error);
      },
    );
    database.close();
    const store = new IndexedDbWriterOdtStore("retired-json", factory);
    expect(await store.list()).toEqual([]);
    const reopened = await openDatabase(factory, "retired-json", 2);
    const old = await new Promise<unknown>(
      /** Reads the untouched old record. @param resolve - Read completion. @param reject - Read failure. @returns Nothing. */
      (resolve, reject) => {
        const request = reopened
          .transaction("document-snapshots", "readonly")
          .objectStore("document-snapshots")
          .get("old");
        request.onsuccess = /** Returns the legacy record. @returns Nothing. */ () =>
          resolve(request.result);
        request.onerror = /** Reports read failure. @returns Nothing. */ () =>
          reject(request.error);
      },
    );
    expect(old).toMatchObject({ id: "old" });
    reopened.close();
  });

  it("keeps an existing ODT object store when opening the current database version", /** Checks upgrade idempotence. @returns Completion. */ async () => {
    const factory = new IDBFactory();
    const name = "existing-odt-store";
    const database = await new Promise<IDBDatabase>(
      /** Runs the focused test callback. @param resolve - Input for this operation. @param reject - Input for this operation. @returns Operation result. */ (
        resolve,
        reject,
      ) => {
        const request = factory.open(name, 1);
        request.onupgradeneeded =
          /** Runs the focused test callback. @returns Operation result. */ () => {
            const documents = request.result.createObjectStore("documents", { keyPath: "id" });
            documents.createIndex("title", "title", { unique: true });
          };
        request.onsuccess = /** Runs the focused test callback. @returns Operation result. */ () =>
          resolve(request.result);
        request.onerror = /** Runs the focused test callback. @returns Operation result. */ () =>
          reject(request.error);
      },
    );
    database.close();
    const store = new IndexedDbWriterOdtStore(name, factory);
    await store.save(record("retained", "Retained"));
    expect((await store.load("retained"))?.title).toBe("Retained");
  });

  it("propagates open, read, and write failures", /** Checks persistence errors reach the caller. @returns Completion. */ async () => {
    await expect(
      new IndexedDbWriterOdtStore("failed-open", failingFactory("open")).list(),
    ).rejects.toThrow("Simulated IndexedDB failure");
    for (const fault of ["list-request", "list-abort"] as const)
      await expect(
        new IndexedDbWriterOdtStore(`failed-${fault}`, failingFactory(fault)).list(),
      ).rejects.toThrow("Simulated IndexedDB failure");
    for (const fault of ["load-request", "load-abort"] as const)
      await expect(
        new IndexedDbWriterOdtStore(`failed-${fault}`, failingFactory(fault)).load("id"),
      ).rejects.toThrow("Simulated IndexedDB failure");
    for (const fault of ["title-request", "write-error"] as const)
      await expect(
        new IndexedDbWriterOdtStore(`failed-${fault}`, failingFactory(fault)).save(
          record("id", "Title"),
        ),
      ).rejects.toThrow("Simulated IndexedDB failure");
    await expect(
      new IndexedDbWriterOdtStore("failed-abort", failingFactory("write-abort")).save(
        record("id", "Title"),
      ),
    ).rejects.toThrow("Storage write failed.");
  });
});
