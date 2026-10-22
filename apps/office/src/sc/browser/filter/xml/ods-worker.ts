/** @fileoverview Vite Dedicated Worker entry for Calc native document filtering. */
import { processOdsWorkerRequest, type OdsWorkerRequest } from "./ods-worker-runtime";
const scope = globalThis as unknown as {
  onmessage: (event: MessageEvent<OdsWorkerRequest>) => void;
  postMessage(value: unknown, transfer?: Transferable[]): void;
};
scope.onmessage =
  /** Dispatches one Calc worker filter request and returns its terminal result. @param input1 - Operation input. @returns Operation result. */ async ({
    data,
  }) => {
    try {
      const result = await processOdsWorkerRequest(data);
      scope.postMessage({ id: data.id, result }, result instanceof ArrayBuffer ? [result] : []);
    } catch (error) {
      scope.postMessage({
        id: data.id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };
