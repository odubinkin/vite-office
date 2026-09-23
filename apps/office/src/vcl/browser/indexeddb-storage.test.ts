/** @fileoverview Validates IndexedDB transaction failures at the browser adapter boundary. */

import { describe, expect, it, vi } from "vitest";

import { IndexedDbDocumentStorageAdapter, type IndexedDbFactory } from "./indexeddb-storage";

/** Runs the failingFactory test helper. @param event - Test input. @returns Test callback result. */ function failingFactory(
  event: "open" | "request" | "transaction" | "abort" | "existing",
) {
  const error = new Error(`${event} failed`);
  const close = vi.fn();
  const get = {
    error,
    onerror: null as null | (() => void),
    onsuccess: null as null | (() => void),
  };
  const transaction = {
    error,
    onabort: null as null | (() => void),
    oncomplete: null as null | (() => void),
    onerror: null as null | (() => void),
    objectStore: /** Runs the test callback. @returns Test callback result. */ () => ({
      get: /** Runs the test callback. @returns Test callback result. */ () => get,
      put: /** Runs the test callback. @returns Test callback result. */ () => undefined,
    }),
  };
  const db = {
    close,
    objectStoreNames: {
      contains: /** Runs the test callback. @returns Test callback result. */ () => true,
    },
    transaction: /** Runs the test callback. @returns Test callback result. */ () => {
      queueMicrotask(
        /** Runs the test callback. @returns Test callback result. */ () => {
          if (event === "request") get.onerror?.();
          if (event === "transaction") transaction.onerror?.();
          if (event === "abort") transaction.onabort?.();
          if (event === "existing") transaction.oncomplete?.();
        },
      );
      return transaction;
    },
  };
  const request = {
    error,
    onerror: null as null | (() => void),
    onsuccess: null as null | (() => void),
    onupgradeneeded: null as null | (() => void),
    result: db,
  };
  const factory = {
    open: /** Runs the test callback. @returns Test callback result. */ () => {
      queueMicrotask(
        /** Runs the test callback. @returns Test callback result. */ () => {
          if (event === "open") request.onerror?.();
          else {
            if (event === "existing") request.onupgradeneeded?.();
            request.onsuccess?.();
          }
        },
      );
      return request;
    },
  } as unknown as IndexedDbFactory;
  return { close, error, factory };
}

describe("IndexedDbDocumentStorageAdapter", /** Groups IndexedDbDocumentStorageAdapter. @returns Test callback result. */ () => {
  it("propagates open and read transaction failures while closing opened databases", /** Checks propagates open and read transaction failures while closing opened databases. @returns Test callback result. */ async () => {
    for (const event of ["open", "request", "transaction", "abort"] as const) {
      const { close, error, factory } = failingFactory(event);
      const storage = new IndexedDbDocumentStorageAdapter("test", factory);
      await expect(storage.load("doc")).rejects.toBe(error);
      expect(close).toHaveBeenCalledTimes(event === "open" ? 0 : 1);
    }
  });

  it("propagates failed and aborted write transactions", /** Checks propagates failed and aborted write transactions. @returns Test callback result. */ async () => {
    for (const event of ["transaction", "abort"] as const) {
      const { close, error, factory } = failingFactory(event);
      const storage = new IndexedDbDocumentStorageAdapter("test", factory);
      await expect(storage.save({ id: "doc", state: "text", version: 1 })).rejects.toBe(error);
      expect(close).toHaveBeenCalledOnce();
    }
  });

  it("opens an upgraded database without recreating its existing snapshot store", /** Checks opens an upgraded database without recreating its existing snapshot store. @returns Test callback result. */ async () => {
    const { close, factory } = failingFactory("existing");
    const storage = new IndexedDbDocumentStorageAdapter("test", factory);
    await expect(storage.load("doc")).resolves.toBeUndefined();
    expect(close).toHaveBeenCalledOnce();
  });
});
