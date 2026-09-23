/**
 * @fileoverview Defines browser document open and export ports without depending on a document shell.
 */

/** One selected external document returned by a platform-neutral open port. */
export interface OpenedDocument {
  /** Exact source bytes. */
  readonly bytes: Uint8Array;
  /** User-visible source name. */
  readonly name: string;
  /** Opaque platform reference retained only as medium source identity. */
  readonly reference: object;
}

/** Shell-neutral port for selecting and reading one external document. */
export interface DocumentOpenPort {
  /** Opens one caller-filtered document or returns undefined after cancellation. @param accept - Supported media selector. @returns Selected source. */
  open(accept: string): Promise<OpenedDocument | undefined>;
}

/** One external representation offered to a platform export adapter. */
export interface DocumentExportRequest {
  /** Exact binary or textual payload. */
  readonly data: Uint8Array | string;
  /** Platform-visible media type. */
  readonly mediaType: string;
  /** Suggested destination name. */
  readonly name: string;
}

/** Shell-neutral port for exporting one representation without adopting it as primary. */
export interface DocumentExportPort {
  /** Starts one platform export. @param request - Complete export payload. @returns Nothing; completion confirmation is intentionally unavailable. */
  export(request: DocumentExportRequest): void;
}
