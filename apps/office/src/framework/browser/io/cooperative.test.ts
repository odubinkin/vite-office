/** @fileoverview Verifies graph transfer yields to browser tasks and unwinds cancelled work. */
import { expect, it, vi } from "vitest";
import { runCooperatively } from "./cooperative";
it("yields macrotasks and unwinds partial graph work on cancellation", /** Observes cancellation between bounded graph work slices.  @returns Operation result. */ async () => {
  let cancelled = false,
    ticks = 0,
    disposed = false;
  const time = vi
    .spyOn(performance, "now")
    .mockImplementation(
      /** Observes cancellation between bounded graph work slices.  @returns Operation result. */ () =>
        ticks++ * 3,
    );
  const timer = setTimeout(
    /** Observes cancellation between bounded graph work slices.  @returns Operation result. */ () => {
      cancelled = true;
    },
    0,
  );
  /** Produces cancellable partial work. @returns Completion after iterations. */
  function* work(): Generator<void, number> {
    try {
      for (let i = 0; i < 100; i++) yield;
      return 100;
    } finally {
      disposed = true;
    }
  }
  try {
    await expect(
      runCooperatively(
        work(),
        /** Observes cancellation between bounded graph work slices.  @returns Operation result. */ () =>
          cancelled,
      ),
    ).rejects.toThrow(/cancelled|stale/);
    expect(disposed).toBe(true);
  } finally {
    clearTimeout(timer);
    time.mockRestore();
  }
});
