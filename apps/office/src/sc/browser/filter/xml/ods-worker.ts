/** @fileoverview Vite Dedicated Worker entry for Calc native document filtering. */
import { processOdsWorkerRequest, type OdsWorkerRequest } from "./ods-worker-runtime";
/** Installs transport immediately; requests wait for realm-local platform initialization. @param ready - Platform prerequisite, shared across requests. @returns Nothing. */
export function bindOdsWorker(ready: Promise<unknown> = Promise.resolve()): void {
  const initialized = ready.then(
    /** Records completed platform initialization. @returns Readiness result. */ () => ({
      ok: true as const,
    }),
    /** Retains initialization failure for every request, including requests arriving later. @param error - Original failure. @returns Failed readiness result. */ (
      error: unknown,
    ) => ({ ok: false as const, error }),
  );
  const scope = globalThis as unknown as {
    onmessage: (event: MessageEvent<OdsWorkerRequest>) => void;
    postMessage(value: unknown, transfer?: Transferable[]): void;
  };
  scope.onmessage =
    /** Dispatches one Calc worker filter request and returns its terminal result. @param input1 - Operation input. @returns Operation result. */ async ({
      data,
    }) => {
      try {
        const state = await initialized;
        if (!state.ok) throw state.error;
        const result = await processOdsWorkerRequest(data);
        scope.postMessage({ id: data.id, result }, result instanceof ArrayBuffer ? [result] : []);
      } catch (error) {
        scope.postMessage({
          id: data.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    };
}
