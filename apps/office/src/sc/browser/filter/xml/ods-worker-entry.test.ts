/** @fileoverview Dedicated Worker entry dispatch returns terminal envelopes and transfers only binary output. */
import { afterEach, expect, it, vi } from "vitest";
import { processOdsWorkerRequest } from "./ods-worker-runtime";
vi.mock(
  "./ods-worker-runtime",
  /** Checks the browser XML and worker regression boundary.  @returns Regression result or completion. */ () => ({
    processOdsWorkerRequest: vi.fn(),
  }),
);
afterEach(
  /** Checks the browser XML and worker regression boundary.  @returns Regression result or completion. */ () => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  },
);
it("posts XML, transferable bytes and normalized failures with the original request identity", /** Exercises the real worker entry with controlled filter outcomes. @returns Completion. */ async () => {
  const post = vi.fn();
  vi.stubGlobal("postMessage", post);
  vi.stubGlobal("onmessage", null);
  await import("../../../../calc-ods-worker");
  const handler = globalThis.onmessage as (event: MessageEvent) => Promise<void>;
  const results = [{ format: "xml", files: {} }, new ArrayBuffer(2)];
  for (const result of results) {
    vi.mocked(processOdsWorkerRequest).mockResolvedValueOnce(result as never);
    await handler(new MessageEvent("message", { data: { id: 7 } }));
    expect(post).toHaveBeenLastCalledWith(
      { id: 7, result },
      result instanceof ArrayBuffer ? [result] : [],
    );
  }
  for (const error of [new Error("invalid"), "failure"]) {
    vi.mocked(processOdsWorkerRequest).mockRejectedValueOnce(error);
    await handler(new MessageEvent("message", { data: { id: 8 } }));
    expect(post).toHaveBeenLastCalledWith({
      id: 8,
      error: error instanceof Error ? error.message : error,
    });
  }
});
it("retains an early request until platform initialization completes", /** Tests the real transport gate independently of filter execution. @returns Async completion. */ async () => {
  const { bindOdsWorker } = await import("./ods-worker"),
    post = vi.fn();
  vi.stubGlobal("postMessage", post);
  vi.stubGlobal("onmessage", null);
  vi.mocked(processOdsWorkerRequest).mockClear();
  let finish: (() => void) | undefined;
  const ready = new Promise<void>(
    /** Controlled platform completion. @param resolve - Completion. @returns Nothing. */ (
      resolve,
    ) => {
      finish = resolve;
    },
  );
  bindOdsWorker(ready);
  const handler = globalThis.onmessage as (event: MessageEvent) => Promise<void>;
  vi.mocked(processOdsWorkerRequest).mockResolvedValueOnce({ format: "xml", files: {} });
  const pending = handler(new MessageEvent("message", { data: { id: 9 } }));
  await Promise.resolve();
  expect(processOdsWorkerRequest).not.toHaveBeenCalled();
  expect(post).not.toHaveBeenCalled();
  finish?.();
  await pending;
  expect(processOdsWorkerRequest).toHaveBeenCalledOnce();
  expect(post).toHaveBeenCalledWith({ id: 9, result: { format: "xml", files: {} } }, []);
});
it("returns a terminal request error if native platform initialization fails", /** No filter executes before a failed prerequisite. @returns Async completion. */ async () => {
  const { bindOdsWorker } = await import("./ods-worker"),
    post = vi.fn();
  vi.stubGlobal("postMessage", post);
  vi.stubGlobal("onmessage", null);
  vi.mocked(processOdsWorkerRequest).mockClear();
  const ready = Promise.reject(new Error("native initialization failed"));
  bindOdsWorker(ready);
  await Promise.resolve();
  await (globalThis.onmessage as (event: MessageEvent) => Promise<void>)(
    new MessageEvent("message", { data: { id: 10 } }),
  );
  expect(processOdsWorkerRequest).not.toHaveBeenCalled();
  expect(post).toHaveBeenCalledWith({ id: 10, error: "native initialization failed" });
});
