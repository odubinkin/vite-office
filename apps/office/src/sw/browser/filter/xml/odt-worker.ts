/** @fileoverview Installs the Writer ODT filter runtime in the Vite-emitted Dedicated Worker. */
/* v8 ignore file -- Dedicated Worker bootstrapping is exercised through the runtime boundary. */

import { OdtWorkerRuntime, type OdtWorkerRuntimeScope } from "./odt-worker-runtime";

/** Worker global surface needed for message registration. */
interface OdtWorkerGlobalScope extends OdtWorkerRuntimeScope {
  /** Registers the worker request handler. */
  addEventListener(type: "message", listener: (event: MessageEvent<unknown>) => void): void;
}

const workerScope = globalThis as unknown as OdtWorkerGlobalScope;
const runtime = new OdtWorkerRuntime(workerScope);
workerScope.addEventListener(
  "message",
  /** Forwards one structured-clone message into the filter runtime. @param event - Worker message. @returns Nothing. */
  (event) => runtime.HandleMessage(event.data),
);
