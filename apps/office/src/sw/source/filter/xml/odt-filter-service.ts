/**
 * @fileoverview Defines the canonical asynchronous ODT filter service used by SwDocShell and by
 * remote execution adapters while retaining package/xmloff/sw ownership inside the filter.
 */

import type { ZipFileLimits } from "../../../../package/source/zipapi/ZipFile";
import { SwDoc } from "../../core/doc/doc";
import type { DefaultFontDevice } from "../../core/doc/default-font";
import type { OdfXmlDiagnostic } from "../../../../xmloff/source/core/xmlimp";
import { readOdtDocument, type OdtImportProgressStage } from "./swxml";
import { writeOdtDocument, type OdtExportProgressStage } from "./wrtxml";

/** Progress stages qualified by import/export direction. */
export type OdtFilterProgressStage =
  `import:${OdtImportProgressStage}` | `export:${OdtExportProgressStage}`;

/** Stable filter failure categories independent of any execution or transport adapter. */
export type OdtFilterErrorCategory =
  | "cancelled"
  | "format"
  | "internal"
  | "protocol"
  | "resource"
  | "stale"
  | "timeout"
  | "unsupported";

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
  /** Output device retained when constructing an imported graph on this side of the Worker boundary. */
  readonly defaultFontDevice?: DefaultFontDevice;
}

/** Canonical document boundary accepted by inline and remote filter adapters. */
export interface OdtFilterDocument {
  readonly document: SwDoc;
  readonly title: string;
}

/** Captures the canonical graph for filter adaptation without shell lifecycle state. @param document - Canonical Writer graph. @param title - Shell-owned title copied as filter metadata. @returns Filter input. */
export function createOdtFilterDocument(document: SwDoc, title: string): OdtFilterDocument {
  return { document, title };
}

/** Validates a canonical filter result before shell adoption. @param input - Filter result. @returns Document and title. */
export function restoreOdtFilterDocument(input: OdtFilterDocument): {
  readonly document: SwDoc;
  readonly title: string;
} {
  if (!isRecord(input) || !(input.document instanceof SwDoc) || typeof input.title !== "string")
    throw new Error("ODT filter document metadata is invalid.");
  return {
    document: input.document,
    title: input.title,
  };
}

/** Asynchronous filter contract over the canonical Writer graph. */
export interface OdtFilterService {
  /** Cancels the current request without closing the reusable service. @returns Nothing. */
  Cancel(): void;
  /** Releases worker/runtime resources and rejects pending work. @returns Nothing. */
  Close(): void;
  /** Exports one Writer graph. @param input - Canonical graph without lifecycle state. @param options - Cancellation/progress controls. @returns Complete STORE-only ODT bytes. */
  Export(input: OdtFilterDocument, options?: OdtFilterOperationOptions): Promise<Uint8Array>;
  /** Imports one ODT into a Writer graph. @param bytes - Complete package bytes. @param metadata - Fallback filter metadata. @param options - Cancellation/progress/resource controls. @returns Candidate graph for shell adoption. */
  Import(
    bytes: Uint8Array,
    metadata: Readonly<{ title: string; locale?: string }>,
    options?: OdtFilterOperationOptions,
  ): Promise<OdtFilterDocument>;
}

/** Typed operation error reconstructed from worker-safe details. */
export class OdtFilterError extends Error {
  /** Creates one typed filter failure. @param category - Stable machine category. @param message - Human-readable detail. @returns Nothing. */
  public constructor(
    public readonly category: OdtFilterErrorCategory,
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

  /** Exports through the existing Writer XML/package filter. @param input - Canonical document. @param options - Cooperative controls. @returns ODT bytes. */
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

  /** Imports through the existing package/XML filter. @param bytes - Complete package. @param metadata - Fallback metadata. @param options - Cooperative controls. @returns Candidate graph. */
  public async Import(
    bytes: Uint8Array,
    metadata: Readonly<{ title: string; locale?: string }>,
    options: OdtFilterOperationOptions = {},
  ): Promise<OdtFilterDocument> {
    this.Begin(options.signal);
    try {
      let ignoredDeclarations = 0;
      const diagnosticGroups = new Set<string>();
      const imported = await readOdtDocument(bytes, metadata, options.zipLimits, {
        ...(options.defaultFontDevice === undefined
          ? {}
          : { defaultFontDevice: options.defaultFontDevice }),
        isCancelled:
          /** Reads the current cooperative cancellation flag. @returns Whether import must stop. */ () =>
            this.IsCancelled(options.signal),
        onProgress:
          /** Qualifies one import progress stage. @param stage - Writer import stage. @returns Nothing. */ (
            stage,
          ) => options.onProgress?.(`import:${stage}`),
        onDiagnostic:
          /** Counts unsupported SAX declarations without retaining values or content. @param diagnostic - Structural import event. @returns Nothing. */ (
            diagnostic: OdfXmlDiagnostic,
          ): void => {
            ignoredDeclarations += 1;
            diagnosticGroups.add(
              `${diagnostic.stream}\u0000${diagnostic.path}\u0000${diagnostic.kind}\u0000${diagnostic.name}`,
            );
          },
      });
      if (ignoredDeclarations > 0)
        console.warn(
          `ODT import ignored ${ignoredDeclarations} unsupported XML declarations in ${diagnosticGroups.size} distinct contexts; see the Writer ODT compatibility contract.`,
        );
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
  const category: OdtFilterErrorCategory = lower.includes("cancel")
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
