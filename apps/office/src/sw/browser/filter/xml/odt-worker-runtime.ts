/**
 * @fileoverview Executes bounded Writer ODT filter requests inside a Dedicated Worker and returns
 * only neutral filter documents or transferable byte buffers to the document-shell client.
 */

import {
  WORKER_PROTOCOL_VERSION,
  type WorkerCancellation,
  type WorkerFailure,
  type WorkerProgress,
  type WorkerRequest,
  type WorkerResult,
} from "../../../../framework/browser/workers/worker-protocol";
import type { ZipFileLimits } from "../../../../package/source/zipapi/ZipFile";
import {
  createInlineOdtFilterService,
  normalizeOdtFilterError,
  type OdtFilterErrorCategory,
  type OdtFilterProgressStage,
  type OdtFilterService,
} from "../../../source/filter/xml/odt-filter-service";
import {
  createOdtWorkerDocument,
  restoreOdtWorkerDocument,
  type OdtWorkerDocument,
} from "./odt-transfer";

/** Import request transferred into the worker. */
export interface OdtWorkerImportRequest {
  readonly bytes: ArrayBuffer;
  readonly metadata: Readonly<{ title: string; locale?: string }>;
  readonly operation: "import";
  readonly zipLimits?: ZipFileLimits;
}

/** Export request carrying a structured-clone Writer snapshot. */
export interface OdtWorkerExportRequest {
  readonly document: OdtWorkerDocument;
  readonly operation: "export";
}

/** Supported worker request payloads. */
export type OdtWorkerRequestPayload = OdtWorkerExportRequest | OdtWorkerImportRequest;

/** Neutral import result validated again by SwDocShell. */
export interface OdtWorkerImportResult {
  readonly document: OdtWorkerDocument;
  readonly operation: "import";
}

/** Transferable export result. */
export interface OdtWorkerExportResult {
  readonly bytes: ArrayBuffer;
  readonly operation: "export";
}

/** Supported worker result payloads. */
export type OdtWorkerResultPayload = OdtWorkerExportResult | OdtWorkerImportResult;

/** Minimal Dedicated Worker surface used by the runtime. */
export interface OdtWorkerRuntimeScope {
  /** Posts one structured-clone message and optional ownership transfers. */
  postMessage(message: unknown, transfer?: Transferable[]): void;
}

/** Worker-side request coordinator with cooperative per-request cancellation. */
export class OdtWorkerRuntime {
  private readonly active = new Map<number, OdtFilterService>();

  /** Creates one runtime over a Dedicated Worker scope. @param scope - Worker global adapter. @returns Nothing. */
  public constructor(private readonly scope: OdtWorkerRuntimeScope) {}

  /** Accepts one request or cancellation message. @param message - Untrusted structured-clone input. @returns Nothing; completion is posted asynchronously. */
  public HandleMessage(message: unknown): void {
    if (isCancellation(message)) {
      this.active.get(message.id)?.Cancel();
      return;
    }
    if (!isRequest(message)) {
      this.PostError(readMessageId(message), "protocol", "ODT worker message is invalid.");
      return;
    }
    void this.Process(message);
  }

  /** Executes one validated request. @param request - Versioned import/export request. @returns Completion after terminal response. */
  private async Process(request: WorkerRequest<OdtWorkerRequestPayload>): Promise<void> {
    const service = createInlineOdtFilterService();
    this.active.set(request.id, service);
    try {
      if (request.payload.operation === "import") {
        const document = await service.Import(
          new Uint8Array(request.payload.bytes),
          request.payload.metadata,
          {
            onProgress: this.PostProgress.bind(this, request.id),
            ...(request.payload.zipLimits === undefined
              ? {}
              : { zipLimits: request.payload.zipLimits }),
          },
        );
        this.PostResult(request.id, {
          document: createOdtWorkerDocument(document),
          operation: "import",
        });
      } else {
        const bytes = await service.Export(restoreOdtWorkerDocument(request.payload.document), {
          onProgress: this.PostProgress.bind(this, request.id),
        });
        const buffer = exactArrayBuffer(bytes);
        this.PostResult(request.id, { bytes: buffer, operation: "export" }, [buffer]);
      }
    } catch (error) {
      const failure = normalizeOdtFilterError(error);
      this.PostError(request.id, failure.category, failure.message);
    } finally {
      service.Close();
      this.active.delete(request.id);
    }
  }

  /** Posts one progress stage. @param id - Request identity. @param stage - Filter stage. @returns Nothing. */
  private PostProgress(id: number, stage: OdtFilterProgressStage): void {
    const message: WorkerProgress<OdtFilterProgressStage> = {
      id,
      protocol: WORKER_PROTOCOL_VERSION,
      stage,
      type: "progress",
    };
    this.scope.postMessage(message);
  }

  /** Posts one successful result. @param id - Request identity. @param payload - Neutral result. @param transfer - Optional ownership transfers. @returns Nothing. */
  private PostResult(
    id: number,
    payload: OdtWorkerResultPayload,
    transfer: Transferable[] = [],
  ): void {
    const message: WorkerResult<OdtWorkerResultPayload> = {
      id,
      payload,
      protocol: WORKER_PROTOCOL_VERSION,
      type: "result",
    };
    this.scope.postMessage(message, transfer);
  }

  /** Posts one structured failure. @param id - Request identity or zero for unreadable input. @param category - Stable category. @param message - Diagnostic text. @returns Nothing. */
  private PostError(id: number, category: OdtFilterErrorCategory, message: string): void {
    const failure: WorkerFailure = {
      error: { category, message },
      id,
      protocol: WORKER_PROTOCOL_VERSION,
      type: "error",
    };
    this.scope.postMessage(failure);
  }
}

/** Validates a cancellation message. @param value - Untrusted input. @returns Whether it matches protocol v1. */
function isCancellation(value: unknown): value is WorkerCancellation {
  return (
    isRecord(value) &&
    value.type === "cancel" &&
    value.protocol === WORKER_PROTOCOL_VERSION &&
    isRequestId(value.id)
  );
}

/** Validates a request envelope and operation-specific payload. @param value - Untrusted input. @returns Whether it is executable. */
function isRequest(value: unknown): value is WorkerRequest<OdtWorkerRequestPayload> {
  if (
    !isRecord(value) ||
    value.type !== "request" ||
    value.protocol !== WORKER_PROTOCOL_VERSION ||
    !isRequestId(value.id) ||
    !isRecord(value.payload)
  )
    return false;
  return value.payload.operation === "import"
    ? value.payload.bytes instanceof ArrayBuffer && isRecord(value.payload.metadata)
    : value.payload.operation === "export" && isRecord(value.payload.document);
}

/** Extracts a safe request identity for protocol diagnostics. @param value - Untrusted message. @returns Positive id or zero. */
function readMessageId(value: unknown): number {
  return isRecord(value) && isRequestId(value.id) ? value.id : 0;
}

/** Checks a positive integral request ID. @param value - Candidate ID. @returns Whether valid. */
function isRequestId(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) > 0;
}

/** Checks an object-like structured-clone value. @param value - Candidate. @returns Whether it is a record. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Copies a typed-array view into an exact transferable buffer. @param bytes - Result bytes. @returns Exact buffer. */
function exactArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}
