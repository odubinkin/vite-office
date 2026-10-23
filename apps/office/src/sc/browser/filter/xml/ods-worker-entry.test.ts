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
  await import("./ods-worker");
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
