/**
 * @fileoverview Defines pure, JSON-serializable document identity and lifecycle transitions at the LibreOffice `sfx2/source/doc/docfac.cxx` ownership boundary.
 */

import type { SuiteId } from "../../../framework/source/services/suites";

/** Identifies the permitted lifecycle states for a locally held browser document. */
export type DocumentLifecycle = "closed" | "dirty" | "new" | "saved";

/** Describes one immutable, serializable document header and lifecycle state. */
export interface OfficeDocument {
  /** Stable caller-provided document identity; generation and persistence remain separate platform concerns. */
  readonly id: string;
  /** Current lifecycle state, independent of any React component or browser capability. */
  readonly lifecycle: DocumentLifecycle;
  /** Monotonic local revision incremented only when a state-changing transition succeeds. */
  readonly revision: number;
  /** Office suite that owns the eventual document body model. */
  readonly suiteId: SuiteId;
  /** Human-readable document title retained as serializable metadata. */
  readonly title: string;
}

/** Describes immutable input required to create a browser document header. */
export interface CreateDocumentInput {
  /** Stable non-empty document identity supplied by a caller or future identity service. */
  readonly id: string;
  /** Suite that owns the document body model. */
  readonly suiteId: SuiteId;
  /** Non-empty human-readable title for the document. */
  readonly title: string;
}

/**
 * Creates a new immutable document header with its initial unsaved lifecycle state.
 *
 * @param input - Complete caller-owned identity, suite, and title metadata.
 * @returns A JSON-serializable new document at revision zero.
 * @throws {Error} When id or title is blank after trimming.
 */
export function createDocument(input: CreateDocumentInput): OfficeDocument {
  assertNonBlank(input.id, "Document id");
  assertNonBlank(input.title, "Document title");
  return {
    id: input.id,
    lifecycle: "new",
    revision: 0,
    suiteId: input.suiteId,
    title: input.title,
  };
}

/**
 * Marks an open document dirty after a future body-editing operation has changed its serializable content.
 *
 * @param document - Immutable prior document state that is not mutated.
 * @returns A new dirty document with an incremented revision, or the same dirty document when no state changes.
 * @throws {Error} When the document is closed.
 */
export function markDocumentDirty(document: OfficeDocument): OfficeDocument {
  assertOpen(document);
  return document.lifecycle === "dirty"
    ? document
    : { ...document, lifecycle: "dirty", revision: document.revision + 1 };
}

/**
 * Marks an open document saved after a future persistence adapter completes successfully.
 *
 * @param document - Immutable prior document state that is not mutated.
 * @returns A new saved document with an incremented revision, or the same saved document when no state changes.
 * @throws {Error} When the document is closed.
 */
export function markDocumentSaved(document: OfficeDocument): OfficeDocument {
  assertOpen(document);
  return document.lifecycle === "saved"
    ? document
    : { ...document, lifecycle: "saved", revision: document.revision + 1 };
}

/**
 * Closes an open document without performing persistence; save prompting belongs to a future workbench policy.
 *
 * @param document - Immutable prior document state that is not mutated.
 * @returns A new closed document with an incremented revision, or the same closed document when no state changes.
 */
export function closeDocument(document: OfficeDocument): OfficeDocument {
  return document.lifecycle === "closed"
    ? document
    : { ...document, lifecycle: "closed", revision: document.revision + 1 };
}

/**
 * Rejects blank identity or title metadata before it enters a serializable document contract.
 *
 * @param value - Candidate string value to validate without mutation.
 * @param label - Human-readable field label included in a deterministic error.
 * @returns Nothing; invalid input throws an Error.
 * @throws {Error} When value contains no non-whitespace character.
 */
function assertNonBlank(value: string, label: string): void {
  if (value.trim().length === 0) throw new Error(`${label} must not be blank.`);
}

/**
 * Rejects transitions that require an open document when lifecycle state is closed.
 *
 * @param document - Immutable document state whose lifecycle is inspected.
 * @returns Nothing; closed state throws an Error.
 * @throws {Error} When document.lifecycle is closed.
 */
function assertOpen(document: OfficeDocument): void {
  if (document.lifecycle === "closed") throw new Error("Closed documents cannot transition.");
}
