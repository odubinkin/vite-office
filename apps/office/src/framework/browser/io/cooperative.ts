/** @fileoverview Bounded main-thread graph transfer work; yielding must allow browser tasks and paint, not only microtasks. */
/** Drains native graph traversal in small time slices. @param work - Incremental traversal. @param isCancelled - Staleness/cancellation guard. @returns Completed value. */
export async function runCooperatively<T>(
  work: Generator<void, T>,
  isCancelled: () => boolean = /** Schedules the next graph work slice as a browser task.  @returns Operation result. */ () =>
    false,
): Promise<T> {
  try {
    for (;;) {
      const deadline = performance.now() + 5;
      for (;;) {
        if (isCancelled()) throw new Error("Document operation was cancelled or became stale.");
        const step = work.next();
        if (step.done) return step.value;
        if (performance.now() >= deadline) break;
      }
      await new Promise<void>(
        /** Schedules the next graph work slice as a browser task. @param resolve - resolve. @returns Operation result. */ (
          resolve,
        ) => setTimeout(resolve, 0),
      );
    }
  } finally {
    work.return(undefined as T);
  }
}
/** Drains the same traversal in a worker or deterministic inline adapter. @param work - Native graph traversal. @returns Completed value. */
export function runSynchronously<T>(work: Generator<void, T>): T {
  for (;;) {
    const step = work.next();
    if (step.done) return step.value;
  }
}
