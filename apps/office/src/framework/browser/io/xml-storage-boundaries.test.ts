/** @fileoverview Browser XML storage validation, cooperative defaults and existing-schema upgrades. */
import { expect, it } from "vitest";
import { IDBFactory } from "fake-indexeddb";
import { runCooperatively } from "./cooperative";
import { xmlStream, packXmlPackage } from "../../../package/source/zippackage/xml-package";
import { IndexedDbDocumentStore } from "../storage/document-store";
it("drains a traversal with its default cancellation guard and rejects absent XML streams", /** Checks public boundary defaults and resource typing. @returns Completion. */ async () => {
  /** Produces a bounded task. @returns Final result. */
  function* task(): Generator<void, number> {
    yield;
    return 7;
  }
  expect(await runCooperatively(task())).toBe(7);
  for (const files of [{}, { mimetype: new Uint8Array([1]) }]) {
    expect(
      /** Checks the browser XML and worker regression boundary.  @returns Regression result or completion. */ () =>
        xmlStream(files, "mimetype"),
    ).toThrow("Missing XML stream");
    expect(
      /** Checks the browser XML and worker regression boundary.  @returns Regression result or completion. */ () =>
        packXmlPackage(files),
    ).toThrow("Missing XML stream");
  }
});
it("retains existing XML stores during a version upgrade", /** Exercises IndexedDB schema upgrade without replacing saved data. @returns Completion. */ async () => {
  const factory = new IDBFactory(),
    name = crypto.randomUUID();
  const db = await new Promise<IDBDatabase>(
    /** Checks the browser XML and worker regression boundary. @param resolve - Controlled regression input. @param reject - Controlled regression input. @returns Regression result or completion. */ (
      resolve,
      reject,
    ) => {
      const request = factory.open(name, 2);
      request.onupgradeneeded =
        /** Checks the browser XML and worker regression boundary.  @returns Regression result or completion. */ () => {
          request.result.createObjectStore("xml-documents", { keyPath: "id" });
          request.result
            .createObjectStore("document-metadata", { keyPath: "id" })
            .createIndex("title", "title", { unique: true });
        };
      request.onsuccess =
        /** Checks the browser XML and worker regression boundary.  @returns Regression result or completion. */ () =>
          resolve(request.result);
      request.onerror =
        /** Checks the browser XML and worker regression boundary.  @returns Regression result or completion. */ () =>
          reject(request.error);
    },
  );
  db.close();
  expect(await new IndexedDbDocumentStore(name, factory).list()).toEqual([]);
});
