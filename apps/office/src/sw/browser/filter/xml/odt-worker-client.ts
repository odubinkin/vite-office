/**
 * @fileoverview Adapts the versioned ODT protocol to a reusable browser Dedicated Worker with
 * transferables, stale-result rejection, cancellation, timeout, and deterministic termination.
 */

import {
  cancelWorkerRequest,
  classifyWorkerResult,
  createWorkerClientState,
  issueWorkerRequest,
  WORKER_PROTOCOL_VERSION,
  type WorkerClientState,
  type WorkerFailure,
  type WorkerProgress,
  type WorkerResult,
} from "../../../../framework/source/services/worker-protocol";
import {
  OdtFilterError,
  type OdtFilterOperationOptions,
  type OdtFilterDocument,
  type OdtCancellationSignal,
  type OdtFilterProgressStage,
  type OdtFilterService,
} from "../../../source/filter/xml/odt-filter-service";
import type { OdtWorkerRequestPayload, OdtWorkerResultPayload } from "./odt-worker-runtime";

/** Default wall-clock ceiling for one browser ODT operation. */
export const ODT_WORKER_TIMEOUT_MS = 30_000;

/** Structural Worker surface used by the client and test doubles. */
export interface OdtWorkerTransport {
  onerror: Worker["onerror"];
  onmessage: Worker["onmessage"];
  onmessageerror: Worker["onmessageerror"];
  /** Sends one message with optional transfer of ownership. */
  postMessage(message: unknown, transfer?: Transferable[]): void;
  /** Terminates work immediately. */
  terminate(): void;
}

/** Factory used to recreate a worker after cancellation or timeout. */
export type OdtWorkerFactory = () => OdtWorkerTransport;

/** Active request completion and cleanup state. */
interface PendingRequest {
  readonly id: number;
  readonly onProgress?: (stage: OdtFilterProgressStage) => void;
  readonly reject: (reason: OdtFilterError) => void;
  readonly resolve: (value: OdtWorkerResultPayload) => void;
  readonly signal?: OdtCancellationSignal;
  readonly abortListener?: () => void;
  readonly timeout: ReturnType<typeof setTimeout>;
}

/** ODT filter service backed by a restartable Dedicated Worker. */
export class OdtWorkerClient implements OdtFilterService {
  private active: PendingRequest | undefined;
  private closed = false;
  private state: WorkerClientState = createWorkerClientState();
  private worker: OdtWorkerTransport | undefined;

  /** Creates a worker-backed service. @param factory - Fresh worker factory. @param timeoutMs - Positive operation timeout. @returns Nothing. */
  public constructor(
    private readonly factory: OdtWorkerFactory,
    private readonly timeoutMs = ODT_WORKER_TIMEOUT_MS,
  ) {
    if (!Number.isFinite(timeoutMs) || timeoutMs <= 0)
      throw new Error("ODT worker timeout must be positive.");
  }

  /** Cancels and physically terminates current work so synchronous XML cannot outlive cancellation. @returns Nothing. */
  public Cancel(): void {
    this.CancelActive("cancelled", "ODT operation was cancelled.");
  }

  /** Cancels work and permanently terminates the worker. @returns Nothing. */
  public Close(): void {
    if (this.closed) return;
    this.closed = true;
    this.CancelActive("cancelled", "ODT filter service was closed.");
    this.TerminateWorker();
  }

  /** Exports one structured-clone filter document. @param document - Current Writer transfer. @param options - Cancellation/progress controls. @returns Transferable ODT bytes. */
  public async Export(
    document: OdtFilterDocument,
    options: OdtFilterOperationOptions = {},
  ): Promise<Uint8Array> {
    const result = await this.Run({ document, operation: "export" }, [], options);
    if (result.operation !== "export")
      throw new OdtFilterError("protocol", "ODT worker returned the wrong result kind.");
    return new Uint8Array(result.bytes);
  }

  /** Imports transferred package bytes. @param bytes - Complete ODT bytes copied before transfer. @param metadata - Fallback document metadata. @param options - Cancellation/progress/resource controls. @returns Neutral candidate snapshot. */
  public async Import(
    bytes: Uint8Array,
    metadata: Readonly<{ title: string; locale?: string }>,
    options: OdtFilterOperationOptions = {},
  ): Promise<OdtFilterDocument> {
    const buffer = bytes.slice().buffer;
    const result = await this.Run(
      {
        bytes: buffer,
        metadata,
        operation: "import",
        ...(options.zipLimits === undefined ? {} : { zipLimits: options.zipLimits }),
      },
      [buffer],
      options,
    );
    if (result.operation !== "import")
      throw new OdtFilterError("protocol", "ODT worker returned the wrong result kind.");
    return result.document;
  }

  /** Issues one latest-only request. @param payload - Operation payload. @param transfer - Ownership transfers. @param options - Cancellation/progress controls. @returns Terminal worker payload. */
  private Run(
    payload: OdtWorkerRequestPayload,
    transfer: Transferable[],
    options: OdtFilterOperationOptions,
  ): Promise<OdtWorkerResultPayload> {
    if (this.closed)
      return Promise.reject(new OdtFilterError("internal", "ODT filter service is closed."));
    if (options.signal?.aborted === true)
      return Promise.reject(new OdtFilterError("cancelled", "ODT operation was cancelled."));
    this.CancelActive("stale", "ODT operation was superseded by a newer request.");
    const issued = issueWorkerRequest(this.state, payload);
    this.state = issued.state;
    return new Promise<OdtWorkerResultPayload>(
      /** Registers and posts one pending request. @param resolve - Terminal success callback. @param reject - Terminal failure callback. @returns Nothing. */ (
        resolve,
        reject,
      ) => {
        const abortListener =
          options.signal === undefined
            ? undefined
            : /** Cancels after an AbortSignal transition. @returns Nothing. */ () => this.Cancel();
        const timeout = setTimeout(
          /** Terminates an operation that exceeded its wall-clock budget. @returns Nothing. */ () =>
            this.CancelActive("timeout", "ODT worker operation timed out."),
          this.timeoutMs,
        );
        this.active = {
          ...(abortListener === undefined ? {} : { abortListener }),
          id: issued.request.id,
          ...(options.onProgress === undefined ? {} : { onProgress: options.onProgress }),
          reject,
          resolve,
          ...(options.signal === undefined ? {} : { signal: options.signal }),
          timeout,
        };
        options.signal?.addEventListener("abort", abortListener as () => void, { once: true });
        try {
          this.GetWorker().postMessage(issued.request, transfer);
        } catch (error) {
          this.CancelActive(
            "internal",
            error instanceof Error ? error.message : "Could not post ODT worker request.",
          );
        }
      },
    );
  }

  /** Creates and wires a worker lazily. @returns Active worker. */
  private GetWorker(): OdtWorkerTransport {
    if (this.worker !== undefined) return this.worker;
    const worker = this.factory();
    worker.onmessage = this.HandleMessage;
    worker.onerror = this.HandleWorkerError;
    worker.onmessageerror = this.HandleMessageError;
    this.worker = worker;
    return worker;
  }

  private readonly HandleMessage =
    /** Handles progress and terminal protocol messages. @param event - Worker message event. @returns Nothing. */ (
      event: MessageEvent<unknown>,
    ): void => {
      const message = event.data;
      if (!isWorkerMessage(message)) {
        this.CancelActive("protocol", "ODT worker response is invalid.");
        return;
      }
      if (message.protocol !== WORKER_PROTOCOL_VERSION) {
        this.CancelActive("protocol", "ODT worker protocol version is unsupported.");
        return;
      }
      if (classifyWorkerResult(this.state, message) !== "accepted") return;
      if (message.type === "progress") {
        this.active?.onProgress?.(message.stage);
        return;
      }
      const active = this.DetachActive(message.id);
      if (active === undefined) return;
      if (message.type === "error")
        active.reject(new OdtFilterError(message.error.category, message.error.message));
      else active.resolve(message.payload);
    };

  private readonly HandleWorkerError =
    /** Handles an uncaught worker failure. @param event - Error event. @returns Nothing. */ (
      event: ErrorEvent,
    ): void => {
      this.CancelActive("internal", event.message || "ODT worker failed.");
    };

  private readonly HandleMessageError =
    /** Handles a structured-clone receive failure. @returns Nothing. */ (): void => {
      this.CancelActive("protocol", "ODT worker response could not be cloned.");
    };

  /** Cancels the active request, sends its protocol cancellation, and restarts the worker. @param category - Rejection category. @param message - Rejection detail. @returns Nothing. */
  private CancelActive(
    category: "cancelled" | "internal" | "protocol" | "stale" | "timeout",
    message: string,
  ): void {
    const active = this.active;
    if (active === undefined) return;
    const cancelled = cancelWorkerRequest(this.state, active.id);
    this.state = cancelled.state;
    try {
      this.worker?.postMessage(cancelled.cancellation);
    } catch {
      // The terminal rejection below remains authoritative when the transport already failed.
    }
    this.DetachActive(active.id)?.reject(new OdtFilterError(category, message));
    this.TerminateWorker();
  }

  /** Removes timers/listeners for one exact active request. @param id - Request identity. @returns Detached request or undefined. */
  private DetachActive(id: number): PendingRequest | undefined {
    /* v8 ignore next -- callers detach only a message or cancellation already matched to active.id. */
    if (this.active?.id !== id) return undefined;
    const active = this.active;
    this.active = undefined;
    clearTimeout(active.timeout);
    if (active.abortListener !== undefined)
      active.signal?.removeEventListener("abort", active.abortListener);
    return active;
  }

  /** Terminates and disconnects the current worker. @returns Nothing. */
  private TerminateWorker(): void {
    if (this.worker === undefined) return;
    this.worker.onmessage = null;
    this.worker.onerror = null;
    this.worker.onmessageerror = null;
    this.worker.terminate();
    this.worker = undefined;
  }
}

/** Creates the production Dedicated Worker filter. @returns Worker-backed ODT service. */
export function createBrowserOdtFilterService(): OdtFilterService {
  return new OdtWorkerClient(
    /** Creates one Vite-emitted module worker. @returns Dedicated Worker transport. */ () =>
      new Worker(new URL("./odt-worker.ts", import.meta.url), {
        name: "writer-odt-filter",
        type: "module",
      }),
  );
}

/** Checks the envelope fields needed before terminal narrowing. @param value - Untrusted response. @returns Whether it is a supported response shape. */
function isWorkerMessage(
  value: unknown,
): value is
  WorkerFailure | WorkerProgress<OdtFilterProgressStage> | WorkerResult<OdtWorkerResultPayload> {
  if (typeof value !== "object" || value === null) return false;
  const message = value as Partial<
    WorkerFailure | WorkerProgress<OdtFilterProgressStage> | WorkerResult<OdtWorkerResultPayload>
  >;
  return (
    Number.isInteger(message.id) &&
    (message.type === "progress" || message.type === "error" || message.type === "result")
  );
}
