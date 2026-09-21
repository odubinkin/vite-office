/**
 * @fileoverview Defines the neutral asynchronous ODT filter service used by SwDocShell and by
 * the Dedicated Worker adapter while retaining package/xmloff/sw ownership inside the filter.
 */

import type { WorkerErrorCategory } from "../../../../framework/source/services/worker-protocol";
import type { ZipFileLimits } from "../../../../package/source/zipapi/ZipFile";
import type { SwDoc } from "../../core/doc/doc";
import {
  createOdtWriterTransfer,
  restoreOdtWriterTransfer,
  type OdtWriterTransferRecord,
} from "./odt-transfer";
import { readOdtDocument, type OdtImportProgressStage } from "./swxml";
import { writeOdtDocument, type OdtExportProgressStage } from "./wrtxml";

/** Progress stages qualified by import/export direction. */
export type OdtFilterProgressStage =
  `import:${OdtImportProgressStage}` | `export:${OdtExportProgressStage}`;

/** Platform-neutral cancellation subset implemented by AbortSignal at the browser boundary. */
export interface OdtCancellationSignal {
  readonly aborted: boolean;
  addEventListener(
    type: "abort",
    listener: () => void,
    options?: { readonly once?: boolean },
  ): void;
  removeEventListener(type: "abort", listener: () => void): void;
}

/** Per-operation controls that cross no document ownership boundary. */
export interface OdtFilterOperationOptions {
  /** Optional cancellation signal observed by clients and inline execution. */
  readonly signal?: OdtCancellationSignal;
  /** Optional progress receiver. */
  readonly onProgress?: (stage: OdtFilterProgressStage) => void;
  /** Optional stricter ZIP input limits used by tests or callers. */
  readonly zipLimits?: ZipFileLimits;
}

/** Structured-clone boundary used only to cross the browser Worker port. */
export interface OdtFilterDocument {
  readonly document: OdtWriterTransferRecord;
  readonly metadata: Readonly<{ title: string }>;
}

/** Captures the canonical graph for the Worker adaptation without shell lifecycle state. @param document - Canonical Writer graph. @param title - Shell-owned title copied as filter metadata. @returns Cloneable filter input. */
export function createOdtFilterDocument(document: SwDoc, title: string): OdtFilterDocument {
  return { document: createOdtWriterTransfer(document), metadata: { title } };
}

/** Restores a Worker transfer into a canonical graph and filter metadata. @param input - Cloneable filter value. @returns Decoded graph and title. */
export function restoreOdtFilterDocument(input: OdtFilterDocument): {
  readonly document: SwDoc;
  readonly title: string;
} {
  if (!isRecord(input) || !isRecord(input.metadata) || typeof input.metadata.title !== "string")
    throw new Error("ODT filter document metadata is invalid.");
  return { document: restoreOdtWriterTransfer(input.document), title: input.metadata.title };
}

/** Asynchronous filter contract returning structured-clone values only. */
export interface OdtFilterService {
  /** Cancels the current request without closing the reusable service. @returns Nothing. */
  Cancel(): void;
  /** Releases worker/runtime resources and rejects pending work. @returns Nothing. */
  Close(): void;
  /** Exports one validated Writer transfer. @param input - Canonical graph transfer without lifecycle DTOs. @param options - Cancellation/progress controls. @returns Complete STORE-only ODT bytes. */
  Export(input: OdtFilterDocument, options?: OdtFilterOperationOptions): Promise<Uint8Array>;
  /** Imports one ODT into a neutral validated transfer. @param bytes - Complete package bytes. @param metadata - Fallback filter metadata. @param options - Cancellation/progress/resource controls. @returns Candidate graph transfer for main-thread validation. */
  Import(
    bytes: Uint8Array,
    metadata: Readonly<{ title: string }>,
    options?: OdtFilterOperationOptions,
  ): Promise<OdtFilterDocument>;
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

  /** Exports through the existing Writer XML/package filter. @param input - Validated filter transfer. @param options - Cooperative controls. @returns ODT bytes. */
  public async Export(
    input: OdtFilterDocument,
    options: OdtFilterOperationOptions = {},
  ): Promise<Uint8Array> {
    this.Begin(options.signal);
    try {
      const restored = restoreOdtFilterDocument(input);
      return writeOdtDocument(
        restored.document,
        { title: restored.title },
        {
          isCancelled:
            /** Reads the current cooperative cancellation flag. @returns Whether export must stop. */ () =>
              this.IsCancelled(options.signal),
          onProgress:
            /** Qualifies one export progress stage. @param stage - Writer export stage. @returns Nothing. */ (
              stage,
            ) => options.onProgress?.(`export:${stage}`),
        },
      );
    } catch (error) {
      throw normalizeOdtFilterError(error);
    }
  }

  /** Imports through the existing package/XML filter and serializes the candidate graph. @param bytes - Complete package. @param metadata - Fallback metadata. @param options - Cooperative controls. @returns Candidate filter transfer. */
  public async Import(
    bytes: Uint8Array,
    metadata: Readonly<{ title: string }>,
    options: OdtFilterOperationOptions = {},
  ): Promise<OdtFilterDocument> {
    this.Begin(options.signal);
    try {
      const imported = await readOdtDocument(bytes, metadata, options.zipLimits, {
        isCancelled:
          /** Reads the current cooperative cancellation flag. @returns Whether import must stop. */ () =>
            this.IsCancelled(options.signal),
        onProgress:
          /** Qualifies one import progress stage. @param stage - Writer import stage. @returns Nothing. */ (
            stage,
          ) => options.onProgress?.(`import:${stage}`),
      });
      return createOdtFilterDocument(imported.document, imported.title);
    } catch (error) {
      throw normalizeOdtFilterError(error);
    }
  }

  /** Starts one operation after checking permanent/AbortSignal state. @param signal - Optional caller cancellation. @returns Nothing. */
  private Begin(signal?: OdtCancellationSignal): void {
    if (this.closed) throw new OdtFilterError("internal", "ODT filter service is closed.");
    this.cancelled = false;
    if (signal?.aborted === true)
      throw new OdtFilterError("cancelled", "ODT operation was cancelled.");
  }

  /** Reads cooperative cancellation state. @param signal - Optional caller cancellation. @returns Whether work must stop. */
  private IsCancelled(signal?: OdtCancellationSignal): boolean {
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

/** Checks for a structured-clone object. @param value - Candidate. @returns Whether object-like. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
