/** @fileoverview Verifies the Dedicated Worker ODT client protocol and lifecycle. */

import { describe, expect, it, vi } from "vitest";

import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { createWriterDocument } from "../../core/doc/doc";
import { createWriterModuleFactory } from "../../../browser/composition/writer-module";
import {
  createBrowserOdtFilterService,
  OdtWorkerClient,
  type OdtWorkerTransport,
} from "./odt-worker-client";
import { createOdtFilterDocument } from "./odt-filter-service";

/** Deterministic Worker transport test double. */
class FakeWorker implements OdtWorkerTransport {
  public onerror: Worker["onerror"] = null;
  public onmessage: Worker["onmessage"] = null;
  public onmessageerror: Worker["onmessageerror"] = null;
  public readonly posted: { message: unknown; transfer: Transferable[] }[] = [];
  public terminated = false;
  public throwOnPost: unknown;

  /** Captures a client message. @param message - Protocol message. @param transfer - Transfer list. @returns Nothing. */
  public postMessage(message: unknown, transfer: Transferable[] = []): void {
    if (this.throwOnPost !== undefined) throw this.throwOnPost;
    this.posted.push({ message, transfer });
  }

  /** Records termination. @returns Nothing. */
  public terminate(): void {
    this.terminated = true;
  }

  /** Emits one worker response. @param data - Response data. @returns Nothing. */
  public emit(data: unknown): void {
    this.onmessage?.call(this as unknown as Worker, new MessageEvent("message", { data }));
  }

  /** Emits an uncaught worker error. @param message - Diagnostic. @returns Nothing. */
  public fail(message: string): void {
    this.onerror?.call(this as unknown as AbstractWorker, new ErrorEvent("error", { message }));
  }

  /** Emits a clone receive error. @returns Nothing. */
  public failClone(): void {
    this.onmessageerror?.call(this as unknown as Worker, new MessageEvent("messageerror"));
  }
}

/** Creates deterministic metadata. @returns Writer metadata. */
function metadata() {
  return createDocument({ id: "worker-client", suiteId: "writer", title: "Client" });
}

/** Creates one filter-only document transfer for transport tests. @returns Current Writer transfer. */
function snapshot() {
  return createOdtFilterDocument(createWriterDocument("p-1"), metadata().title);
}

/** Reads the last posted request identity. @param worker - Fake transport. @returns Request ID. */
function postedId(worker: FakeWorker): number {
  return (worker.posted.at(-1)?.message as { id: number }).id;
}

describe("ODT worker client" /** Groups client transport behavior. @returns Nothing. */, () => {
  it("transfers import/export bytes and forwards accepted progress" /** Verifies successful request/response mapping. @returns Completion after results. */, async () => {
    const worker = new FakeWorker();
    const client = new OdtWorkerClient(
      /** Supplies the deterministic transport. @returns Fake worker. */ () => worker,
    );
    const source = new Uint8Array([1, 2, 3]);
    const progress: string[] = [];
    const importedSnapshot = snapshot();
    const importing = client.Import(source, metadata(), {
      onProgress:
        /** Records one accepted worker stage. @param stage - Qualified stage. @returns New array length. */ (
          stage,
        ) => progress.push(stage),
    });
    const importId = postedId(worker);
    const postedImport = worker.posted[0];
    expect(postedImport?.message).toMatchObject({
      id: importId,
      payload: { operation: "import" },
      protocol: 1,
      type: "request",
    });
    expect(postedImport?.transfer).toHaveLength(1);
    expect(source).toEqual(new Uint8Array([1, 2, 3]));
    worker.emit({ id: importId, protocol: 1, stage: "import:package", type: "progress" });
    worker.emit({
      id: importId,
      payload: { document: importedSnapshot, operation: "import" },
      protocol: 1,
      type: "result",
    });
    await expect(importing).resolves.toEqual(importedSnapshot);
    expect(progress).toEqual(["import:package"]);

    const exporting = client.Export(importedSnapshot);
    const exportId = postedId(worker);
    const buffer = new Uint8Array([0x50, 0x4b]).buffer;
    worker.emit({
      id: exportId,
      payload: { bytes: buffer, operation: "export" },
      protocol: 1,
      type: "result",
    });
    await expect(exporting).resolves.toEqual(new Uint8Array([0x50, 0x4b]));
    worker.emit({
      id: exportId,
      payload: { bytes: buffer, operation: "export" },
      protocol: 1,
      type: "result",
    });
    client.Close();
    client.Close();
    expect(worker.terminated).toBe(true);
    await expect(client.Export(importedSnapshot)).rejects.toMatchObject({ category: "internal" });
  });

  it("rejects stale, cancelled, timed-out, and wrong-kind results" /** Verifies latest-only and stop behavior. @returns Completion after assertions. */, async () => {
    vi.useFakeTimers();
    try {
      const workers: FakeWorker[] = [];
      const client = new OdtWorkerClient(
        /** Creates a fresh transport after termination. @returns New fake worker. */ () => {
          const worker = new FakeWorker();
          workers.push(worker);
          return worker;
        },
        50,
      );
      const first = client.Import(new Uint8Array([1]), metadata());
      const oldWorker = workers[0] as FakeWorker;
      const oldHandler = oldWorker.onmessage;
      const second = client.Export(snapshot());
      await expect(first).rejects.toMatchObject({ category: "stale" });
      expect(oldWorker.terminated).toBe(true);
      oldHandler?.call(
        oldWorker as unknown as Worker,
        new MessageEvent("message", {
          data: {
            id: 1,
            payload: { document: {}, operation: "import" },
            protocol: 1,
            type: "result",
          },
        }),
      );
      const currentWorker = workers[1] as FakeWorker;
      const secondId = postedId(currentWorker);
      currentWorker.emit({
        id: secondId,
        payload: { document: {}, operation: "import" },
        protocol: 1,
        type: "result",
      });
      await expect(second).rejects.toMatchObject({ category: "protocol" });

      const wrongImport = client.Import(new Uint8Array([1]), metadata(), {
        zipLimits: {
          maxArchiveBytes: 1024,
          maxExpansionRatio: 10,
          maxEntries: 10,
          maxEntryBytes: 1024,
          maxTotalBytes: 1024,
        },
      });
      const wrongImportWorker = workers.at(-1) as FakeWorker;
      wrongImportWorker.emit({
        id: postedId(wrongImportWorker),
        payload: { bytes: new ArrayBuffer(0), operation: "export" },
        protocol: 1,
        type: "result",
      });
      await expect(wrongImport).rejects.toMatchObject({ category: "protocol" });

      const abort = new AbortController();
      abort.abort();
      await expect(
        client.Import(new Uint8Array([1]), metadata(), { signal: abort.signal }),
      ).rejects.toMatchObject({ category: "cancelled" });
      const activeAbort = new AbortController();
      const cancelled = client.Import(new Uint8Array([1]), metadata(), {
        signal: activeAbort.signal,
      });
      activeAbort.abort();
      await expect(cancelled).rejects.toMatchObject({ category: "cancelled" });

      const timedOut = client.Export(snapshot());
      const timedOutAssertion = expect(timedOut).rejects.toMatchObject({ category: "timeout" });
      await vi.advanceTimersByTimeAsync(51);
      await timedOutAssertion;
      client.Close();
    } finally {
      vi.useRealTimers();
    }
  });

  it("normalizes worker protocol and transport failures" /** Covers every terminal transport failure path. @returns Completion after assertions. */, async () => {
    const cases: readonly (
      | { emit: (worker: FakeWorker, id: number) => void; category: string }
      | { configure: (worker: FakeWorker) => void; category: string }
    )[] = [
      {
        category: "protocol",
        emit: /** Emits a non-envelope response. @param worker - Active transport. @returns Nothing. */ (
          worker,
        ) => worker.emit("invalid"),
      },
      {
        category: "protocol",
        emit: /** Emits an incompatible protocol version. @param worker - Active transport. @param id - Request ID. @returns Nothing. */ (
          worker,
          id,
        ) => worker.emit({ id, protocol: 2, stage: "import:package", type: "progress" }),
      },
      {
        category: "internal",
        emit: /** Emits an uncaught Worker error. @param worker - Active transport. @returns Nothing. */ (
          worker,
        ) => worker.fail("worker crashed"),
      },
      {
        category: "protocol",
        emit: /** Emits a structured-clone receive failure. @param worker - Active transport. @returns Nothing. */ (
          worker,
        ) => worker.failClone(),
      },
      {
        category: "internal",
        configure:
          /** Makes request posting fail synchronously. @param worker - Active transport. @returns Assigned flag. */ (
            worker,
          ) => (worker.throwOnPost = new Error("post failed")),
      },
      {
        category: "internal",
        configure:
          /** Makes request posting throw a non-Error value. @param worker - Active transport. @returns Assigned value. */ (
            worker,
          ) => (worker.throwOnPost = "post failed"),
      },
    ];
    for (const testCase of cases) {
      const worker = new FakeWorker();
      if ("configure" in testCase) testCase.configure(worker);
      const client = new OdtWorkerClient(
        /** Supplies the case transport. @returns Fake worker. */ () => worker,
      );
      const pending = client.Import(new Uint8Array([1]), metadata());
      if ("emit" in testCase)
        testCase.emit(worker, worker.posted.length === 0 ? 1 : postedId(worker));
      await expect(pending).rejects.toMatchObject({ category: testCase.category });
      client.Close();
    }

    const worker = new FakeWorker();
    const client = new OdtWorkerClient(
      /** Supplies the error-result transport. @returns Fake worker. */ () => worker,
    );
    const failed = client.Import(new Uint8Array([1]), metadata());
    worker.emit({
      error: { category: "resource", message: "too large" },
      id: postedId(worker),
      protocol: 1,
      type: "error",
    });
    await expect(failed).rejects.toMatchObject({ category: "resource", message: "too large" });
    const blankWorkerError = client.Import(new Uint8Array([1]), metadata());
    worker.fail("");
    await expect(blankWorkerError).rejects.toMatchObject({
      category: "internal",
      message: "ODT worker failed.",
    });
    expect(
      /** Creates a client with an invalid timeout. @returns Invalid client. */ () =>
        new OdtWorkerClient(
          /** Supplies a transport that should never start. @returns Fake worker. */ () => worker,
          0,
        ),
    ).toThrow("timeout");
  });

  it("constructs the production module Worker through the browser composition branch" /** Verifies the Vite Worker factory without executing the worker bootstrap in jsdom. @returns Completion after cancellation. */, async () => {
    const workers: FakeWorker[] = [];
    const urls: string[] = [];
    /** Browser-compatible Worker constructor test double. */
    class BrowserWorkerStub extends FakeWorker {
      /** Captures Vite Worker construction. @param url - Emitted worker URL. @param options - Worker options. @returns Nothing. */
      public constructor(url: URL, options?: WorkerOptions) {
        super();
        urls.push(url.toString());
        expect(options).toMatchObject({ name: "writer-odt-filter", type: "module" });
        workers.push(this);
      }
    }
    vi.stubGlobal("Worker", BrowserWorkerStub);
    try {
      const service = createBrowserOdtFilterService();
      const pending = service.Import(new Uint8Array([1]), metadata());
      expect(urls[0]).toContain("odt-worker.ts");
      service.Cancel();
      await expect(pending).rejects.toMatchObject({ category: "cancelled" });
      createWriterModuleFactory();
      expect(workers).toHaveLength(1);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
