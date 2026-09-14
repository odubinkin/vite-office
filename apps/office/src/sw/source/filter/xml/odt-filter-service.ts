/**
 * @fileoverview Defines the neutral asynchronous ODT filter service used by SwDocShell and by
 * the Dedicated Worker adapter while retaining package/xmloff/sw ownership inside the filter.
 */

import type { WorkerErrorCategory } from "../../../../framework/source/services/worker-protocol";
import type { ZipFileLimits } from "../../../../package/source/zipapi/ZipFile";
import type { OfficeDocument } from "../../../../sfx2/source/doc/docfac";
import type { DocumentSnapshot } from "../../../../sfx2/source/doc/docfile";
import {
  createWriterSnapshot,
  restoreWriterSnapshot,
  type WriterSnapshotState,
} from "../../core/doc/writer-storage";
import { readOdtDocument, type OdtImportProgressStage } from "./swxml";
import { writeOdtDocument, type OdtExportProgressStage } from "./wrtxml";

/** Progress stages qualified by import/export direction. */
export type OdtFilterProgressStage =
  `import:${OdtImportProgressStage}` | `export:${OdtExportProgressStage}`;

/** Per-operation controls that cross no document ownership boundary. */
export interface OdtFilterOperationOptions {
  /** Optional cancellation signal observed by clients and inline execution. */
  readonly signal?: AbortSignal;
  /** Optional progress receiver. */
  readonly onProgress?: (stage: OdtFilterProgressStage) => void;
  /** Optional stricter ZIP input limits used by tests or callers. */
  readonly zipLimits?: ZipFileLimits;
}

/** Asynchronous filter contract returning structured-clone values only. */
export interface OdtFilterService {
  /** Cancels the current request without closing the reusable service. @returns Nothing. */
  Cancel(): void;
  /** Releases worker/runtime resources and rejects pending work. @returns Nothing. */
  Close(): void;
  /** Exports one validated Writer snapshot. @param snapshot - Immutable document snapshot. @param options - Cancellation/progress controls. @returns Complete STORE-only ODT bytes. */
  Export(
    snapshot: DocumentSnapshot<WriterSnapshotState>,
    options?: OdtFilterOperationOptions,
  ): Promise<Uint8Array>;
  /** Imports one ODT into a neutral validated snapshot. @param bytes - Complete package bytes. @param metadata - Fallback identity/title. @param options - Cancellation/progress/resource controls. @returns Candidate snapshot for main-thread validation. */
  Import(
    bytes: Uint8Array,
    metadata: OfficeDocument,
    options?: OdtFilterOperationOptions,
  ): Promise<DocumentSnapshot<WriterSnapshotState>>;
}

/** Typed operation error reconstructed from worker-safe details. */
export class OdtFilterError extends Error {
  /** Creates one typed filter failure. @param category - Stable machine category. @param message - Human-readable detail. @returns Nothing. */
  public constructor(
    public readonly category: WorkerErrorCategory,
    message: string,
  ) {
    super(message);
    this.name = "OdtFilterError";
  }
}

/** In-process filter used by focused tests and non-browser document-shell consumers. */
export class InlineOdtFilterService implements OdtFilterService {
  private cancelled = false;
  private closed = false;

  /** Marks the current cooperative operation cancelled. @returns Nothing. */
  public Cancel(): void {
    this.cancelled = true;
  }

  /** Permanently closes this inline service. @returns Nothing. */
  public Close(): void {
    this.cancelled = true;
    this.closed = true;
  }

  /** Exports through the existing Writer XML/package filter. @param snapshot - Validated Writer snapshot. @param options - Cooperative controls. @returns ODT bytes. */
  public async Export(
    snapshot: DocumentSnapshot<WriterSnapshotState>,
    options: OdtFilterOperationOptions = {},
  ): Promise<Uint8Array> {
    this.Begin(options.signal);
    try {
      const document = restoreWriterSnapshot(snapshot, "primary");
      return writeOdtDocument(document, {
        isCancelled:
          /** Reads the current cooperative cancellation flag. @returns Whether export must stop. */ () =>
            this.IsCancelled(options.signal),
        onProgress:
          /** Qualifies one export progress stage. @param stage - Writer export stage. @returns Nothing. */ (
            stage,
          ) => options.onProgress?.(`export:${stage}`),
      });
    } catch (error) {
      throw normalizeOdtFilterError(error);
    }
  }

  /** Imports through the existing package/XML filter and serializes the candidate graph. @param bytes - Complete package. @param metadata - Fallback metadata. @param options - Cooperative controls. @returns Candidate snapshot. */
  public async Import(
    bytes: Uint8Array,
    metadata: OfficeDocument,
    options: OdtFilterOperationOptions = {},
  ): Promise<DocumentSnapshot<WriterSnapshotState>> {
    this.Begin(options.signal);
    try {
      const document = await readOdtDocument(bytes, metadata, options.zipLimits, {
        isCancelled:
          /** Reads the current cooperative cancellation flag. @returns Whether import must stop. */ () =>
            this.IsCancelled(options.signal),
        onProgress:
          /** Qualifies one import progress stage. @param stage - Writer import stage. @returns Nothing. */ (
            stage,
          ) => options.onProgress?.(`import:${stage}`),
      });
      return createWriterSnapshot(document);
    } catch (error) {
      throw normalizeOdtFilterError(error);
    }
  }

  /** Starts one operation after checking permanent/AbortSignal state. @param signal - Optional caller cancellation. @returns Nothing. */
  private Begin(signal?: AbortSignal): void {
    if (this.closed) throw new OdtFilterError("internal", "ODT filter service is closed.");
    this.cancelled = false;
    if (signal?.aborted === true)
      throw new OdtFilterError("cancelled", "ODT operation was cancelled.");
  }

  /** Reads cooperative cancellation state. @param signal - Optional caller cancellation. @returns Whether work must stop. */
  private IsCancelled(signal?: AbortSignal): boolean {
    return this.cancelled || signal?.aborted === true;
  }
}

/** Creates the deterministic inline adapter. @returns Fresh asynchronous ODT filter. */
export function createInlineOdtFilterService(): OdtFilterService {
  return new InlineOdtFilterService();
}

/** Maps existing explicit filter errors into stable transport categories. @param error - Unknown failure. @returns Typed ODT failure. */
export function normalizeOdtFilterError(error: unknown): OdtFilterError {
  if (error instanceof OdtFilterError) return error;
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();
  const category: WorkerErrorCategory = lower.includes("cancel")
    ? "cancelled"
    : lower.includes("limit") || lower.includes("exceeds")
      ? "resource"
      : lower.includes("unsupported")
        ? "unsupported"
        : "format";
  return new OdtFilterError(category, message);
}
