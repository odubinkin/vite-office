/**
 * @fileoverview Implements bounded SfxObjectShell lifecycle ownership from pinned
 * `include/sfx2/objsh.hxx` and `sfx2/source/doc/objmisc.cxx`.
 */

import { acquireSfxMedium, type SfxMedium, type SfxMediumInputOrInstance } from "./docfile";

/** Identifies the permitted lifecycle states for a locally held browser document. */
export type DocumentLifecycle = "closed" | "dirty" | "new" | "saved";

/** Identifies the application module that owns a document body without coupling sfx2 to framework discovery. */
export type DocumentModuleId = string;

/** Describes one immutable, serializable document header and lifecycle state. */
export interface OfficeDocument {
  /** Monotonic generation advanced by every successful domain-content mutation. */
  readonly contentGeneration: number;
  /** Stable caller-provided document identity; generation and persistence remain separate platform concerns. */
  readonly id: string;
  /** Whether the current content differs from the last confirmed primary-medium state. */
  readonly isModified: boolean;
  /** Current lifecycle state, independent of any React component or browser capability. */
  readonly lifecycle: DocumentLifecycle;
  /** Content generation most recently persisted as a recovery snapshot, or null before recovery. */
  readonly recoveryGeneration: number | null;
  /** Content generation corresponding to the last confirmed primary-medium save, or null before save. */
  readonly savedGeneration: number | null;
  /** Office suite that owns the eventual document body model. */
  readonly suiteId: DocumentModuleId;
  /** Human-readable document title retained as serializable metadata. */
  readonly title: string;
}

/** Describes immutable input required to create a browser document header. */
export interface CreateDocumentInput {
  /** Stable non-empty document identity supplied by a caller or future identity service. */
  readonly id: string;
  /** Suite that owns the document body model. */
  readonly suiteId: DocumentModuleId;
  /** Non-empty human-readable title for the document. */
  readonly title: string;
}

/** Framework document shell owning identity, lifecycle generations, and the current medium. */
export class SfxObjectShell {
  protected documentState: OfficeDocument;
  protected medium: SfxMedium;

  /** Creates an object shell from explicit lifecycle and medium inputs. @param document - Lifecycle state. @param medium - Current medium. @returns Nothing. */
  public constructor(document: OfficeDocument, medium: SfxMediumInputOrInstance) {
    assertDocumentState(document);
    this.documentState = Object.freeze({ ...document });
    this.medium = acquireSfxMedium(medium);
  }

  /** Returns immutable lifecycle state owned by this shell. @returns Current state. */
  public GetDocumentState(): OfficeDocument {
    return this.documentState;
  }

  /** Returns the stable current medium; lifecycle state remains owned separately by this shell. @returns Medium descriptor. */
  public GetMedium(): SfxMedium {
    return this.medium;
  }

  /** Rejects commands and persistence after shell closure. @returns Nothing for an open shell. */
  public EnsureOpen(): void {
    if (this.documentState.lifecycle === "closed")
      throw new Error("Closed document shells cannot execute commands or persistence.");
  }

  /** Replaces shell-owned lifecycle and medium atomically. @param document - New lifecycle. @param medium - New medium. @returns Nothing. */
  protected ReplaceObjectState(document: OfficeDocument, medium: SfxMediumInputOrInstance): void {
    assertDocumentState(document);
    const previousMedium = this.medium;
    this.documentState = Object.freeze({ ...document });
    this.medium = acquireSfxMedium(medium);
    if (previousMedium !== this.medium) previousMedium.Close();
  }

  /** Stores a lifecycle transition owned by this framework shell. @param document - New state. @returns Whether state identity changed. */
  protected SetDocumentState(document: OfficeDocument): boolean {
    assertDocumentState(document);
    if (isSameDocumentState(document, this.documentState)) return false;
    this.documentState = Object.freeze({ ...document });
    return true;
  }

  /** Mirrors SfxObjectShell::SetModified and advances the browser content generation only for model changes. @param modified - Next modified flag. @param contentChanged - Whether content generation advances. @returns Whether state changed. */
  protected SetModified(modified = true, contentChanged = false): boolean {
    this.EnsureOpen();
    const nextGeneration = contentChanged
      ? this.documentState.contentGeneration + 1
      : this.documentState.contentGeneration;
    const lifecycle: DocumentLifecycle = modified
      ? "dirty"
      : this.documentState.savedGeneration === null
        ? "new"
        : "saved";
    return this.SetDocumentState({
      ...this.documentState,
      contentGeneration: nextGeneration,
      isModified: modified,
      lifecycle,
    });
  }

  /** Completes a confirmed primary-medium save without replacing shell identity. @param generation - Confirmed generation. @returns Whether state changed. */
  protected SaveCompleted(generation = this.documentState.contentGeneration): boolean {
    this.EnsureOpen();
    assertAcknowledgedGeneration(this.documentState, generation, "Saved generation");
    const isModified = generation !== this.documentState.contentGeneration;
    return this.SetDocumentState({
      ...this.documentState,
      isModified,
      lifecycle: isModified ? "dirty" : "saved",
      savedGeneration: generation,
    });
  }

  /** Acknowledges the browser recovery extension independently of primary save completion. @param generation - Recovered generation. @returns Whether state changed. */
  protected RecoverySaveCompleted(generation = this.documentState.contentGeneration): boolean {
    this.EnsureOpen();
    assertAcknowledgedGeneration(this.documentState, generation, "Recovery generation");
    return this.SetDocumentState({ ...this.documentState, recoveryGeneration: generation });
  }

  /** Reconciles modified state with the document undo manager save position. @param isSavePosition - Whether history matches the save mark. @returns Whether state changed. */
  protected SetHistorySavePosition(isSavePosition: boolean): boolean {
    return this.SetModified(!isSavePosition, false);
  }

  /** Marks this shell closed without mutating its underlying document model. @returns Whether closure changed state. */
  protected CloseObjectShell(): boolean {
    if (this.documentState.lifecycle === "closed") return false;
    this.documentState = Object.freeze({ ...this.documentState, lifecycle: "closed" });
    this.medium.Close();
    return true;
  }
}

/**
 * Creates a new immutable document header with its initial unsaved lifecycle state.
 *
 * @param input - Complete caller-owned identity, suite, and title metadata.
 * @returns A JSON-serializable unsaved document at content generation zero.
 * @throws {Error} When id or title is blank after trimming.
 */
export function createDocument(input: CreateDocumentInput): OfficeDocument {
  assertNonBlank(input.id, "Document id");
  assertNonBlank(input.suiteId, "Document module id");
  assertNonBlank(input.title, "Document title");
  return Object.freeze({
    contentGeneration: 0,
    id: input.id,
    isModified: false,
    lifecycle: "new",
    recoveryGeneration: null,
    savedGeneration: null,
    suiteId: input.suiteId,
    title: input.title,
  });
}

/**
 * Validates a generation acknowledged by primary or recovery persistence.
 *
 * @param document - Current document whose existing generation bounds the acknowledgement.
 * @param generation - Candidate integral generation to acknowledge.
 * @param label - Human-readable persistence kind for deterministic errors.
 * @returns Nothing after successful validation.
 */
function assertAcknowledgedGeneration(
  document: OfficeDocument,
  generation: number,
  label: string,
): void {
  if (!Number.isInteger(generation) || generation < 0 || generation > document.contentGeneration)
    throw new Error(`${label} must identify existing document content.`);
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
function assertDocumentState(document: OfficeDocument): void {
  assertNonBlank(document.id, "Document id");
  assertNonBlank(document.suiteId, "Document module id");
  assertNonBlank(document.title, "Document title");
  if (!Number.isInteger(document.contentGeneration) || document.contentGeneration < 0)
    throw new Error("Content generation must be a non-negative integer.");
  for (const generation of [document.savedGeneration, document.recoveryGeneration])
    if (
      generation !== null &&
      (!Number.isInteger(generation) || generation < 0 || generation > document.contentGeneration)
    )
      throw new Error("Persistence generations must identify existing document content.");
}

/** Compares value state while preserving the shell as its sole mutation owner. @param left - First state. @param right - Second state. @returns Whether equal. */
function isSameDocumentState(left: OfficeDocument, right: OfficeDocument): boolean {
  return (
    left.contentGeneration === right.contentGeneration &&
    left.id === right.id &&
    left.isModified === right.isModified &&
    left.lifecycle === right.lifecycle &&
    left.recoveryGeneration === right.recoveryGeneration &&
    left.savedGeneration === right.savedGeneration &&
    left.suiteId === right.suiteId &&
    left.title === right.title
  );
}
