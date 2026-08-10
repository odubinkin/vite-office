/** @fileoverview Verifies immutable worker request sequencing, cancellation, stale results, and invalid identifier rejection. */

import { describe, expect, it } from "vitest";
import {
  cancelWorkerRequest,
  classifyWorkerResult,
  createWorkerClientState,
  issueWorkerRequest,
} from "./worker-protocol";

describe("worker protocol" /** Groups pure worker protocol transition tests. @returns Nothing; Vitest registers cases. */, function defineWorkerProtocolTests(): void {
  it("issues monotonic requests and accepts only the latest active result" /** Verifies request sequencing and stale classification. @returns Nothing; assertions validate state. */, function sequencesRequests(): void {
    const initial = createWorkerClientState();
    const first = issueWorkerRequest(initial, { text: "one" });
    const second = issueWorkerRequest(first.state, { text: "two" });
    expect(first).toMatchObject({ request: { id: 1, protocol: 1 }, state: { latestId: 1 } });
    expect(second).toMatchObject({ request: { id: 2, protocol: 1 }, state: { latestId: 2 } });
    expect(
      classifyWorkerResult(second.state, { id: 1, payload: { text: "one" }, protocol: 1 }),
    ).toBe("stale");
    expect(
      classifyWorkerResult(second.state, { id: 2, payload: { text: "two" }, protocol: 1 }),
    ).toBe("accepted");
    expect(initial).toEqual({ cancelled: [], latestId: 0 });
  });
  it("cancels issued requests immutably and rejects invalid identifiers" /** Verifies cancellation and every validation branch. @returns Nothing; assertions validate outcomes. */, function cancelsRequests(): void {
    const issued = issueWorkerRequest(createWorkerClientState(), "work");
    const cancelled = cancelWorkerRequest(issued.state, 1);
    expect(cancelled).toMatchObject({
      cancellation: { id: 1, protocol: 1, type: "cancel" },
      state: { cancelled: [1] },
    });
    expect(classifyWorkerResult(cancelled.state, { id: 1, payload: "work", protocol: 1 })).toBe(
      "cancelled",
    );
    expect(cancelWorkerRequest(cancelled.state, 1).state).toEqual(cancelled.state);
    expect(
      /** Rejects zero. @returns Invalid cancellation result. */ function cancelsZero() {
        return cancelWorkerRequest(issued.state, 0);
      },
    ).toThrowError();
    expect(
      /** Rejects fractional id. @returns Invalid cancellation result. */ function cancelsFraction() {
        return cancelWorkerRequest(issued.state, 0.5);
      },
    ).toThrowError();
    expect(
      /** Rejects unissued id. @returns Invalid cancellation result. */ function cancelsFuture() {
        return cancelWorkerRequest(issued.state, 2);
      },
    ).toThrowError();
  });
});
