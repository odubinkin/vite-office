/**
 * @fileoverview Implements bounded SfxObjectShell lifecycle ownership from pinned
 * `include/sfx2/objsh.hxx` and `sfx2/source/doc/objmisc.cxx`.
 */

import {
  createSfxMediumDescriptor,
  type SfxMediumDescriptor,
  type SfxMediumDescriptorInput,
  type SfxMediumInput,
} from "./docfile";

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
  protected medium: SfxMediumDescriptor;

  /** Creates an object shell from explicit lifecycle and medium inputs. @param document - Lifecycle state. @param medium - Current medium. @returns Nothing. */
  public constructor(document: OfficeDocument, medium: SfxMediumInput) {
    this.documentState = { ...document };
    this.medium = createSfxMediumDescriptor(medium);
  }

  /** Returns immutable lifecycle state owned by this shell. @returns Current state. */
  public GetDocumentState(): OfficeDocument {
    return this.documentState;
  }

  /** Returns the stable current medium; lifecycle state remains owned separately by this shell. @returns Medium descriptor. */
  public GetMedium(): SfxMediumDescriptor {
    return this.medium;
  }

  /** Rejects commands and persistence after shell closure. @returns Nothing for an open shell. */
  public EnsureOpen(): void {
    if (this.documentState.lifecycle === "closed")
      throw new Error("Closed document shells cannot execute commands or persistence.");
  }

  /** Replaces shell-owned lifecycle and medium atomically. @param document - New lifecycle. @param medium - New medium. @returns Nothing. */
  protected ReplaceObjectState(document: OfficeDocument, medium: SfxMediumDescriptorInput): void {
    this.documentState = { ...document };
    this.medium = createSfxMediumDescriptor(medium);
  }

  /** Stores a lifecycle transition owned by this framework shell. @param document - New state. @returns Whether state identity changed. */
  protected SetDocumentState(document: OfficeDocument): boolean {
    if (document === this.documentState) return false;
    this.documentState = document;
    return true;
  }

  /** Marks this shell closed without mutating its underlying document model. @returns Whether closure changed state. */
  protected CloseObjectShell(): boolean {
    const next = closeDocument(this.documentState);
    return this.SetDocumentState(next);
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
  return {
    contentGeneration: 0,
    id: input.id,
    isModified: false,
    lifecycle: "new",
    recoveryGeneration: null,
    savedGeneration: null,
    suiteId: input.suiteId,
    title: input.title,
  };
}

/**
 * Marks an open document dirty after a future body-editing operation has changed its serializable content.
 *
 * @param document - Immutable prior document state that is not mutated.
 * @returns A new dirty document with an incremented content generation.
 * @throws {Error} When the document is closed.
 */
export function markDocumentDirty(document: OfficeDocument): OfficeDocument {
  assertOpen(document);
  return {
    ...document,
    contentGeneration: document.contentGeneration + 1,
    isModified: true,
    lifecycle: "dirty",
  };
}

/**
 * Marks an open document saved after a future persistence adapter completes successfully.
 *
 * @param document - Immutable prior document state that is not mutated.
 * @param generation - Generation whose primary-medium write completed successfully.
 * @returns State acknowledging exactly the persisted generation without changing content generation.
 * @throws {Error} When the document is closed.
 */
export function markDocumentSaved(
  document: OfficeDocument,
  generation = document.contentGeneration,
): OfficeDocument {
  assertOpen(document);
  assertAcknowledgedGeneration(document, generation, "Saved generation");
  const isModified = generation !== document.contentGeneration;
  if (
    document.savedGeneration === generation &&
    document.isModified === isModified &&
    document.lifecycle === (isModified ? "dirty" : "saved")
  )
    return document;
  return {
    ...document,
    isModified,
    lifecycle: isModified ? "dirty" : "saved",
    savedGeneration: generation,
  };
}

/**
 * Acknowledges a successfully persisted recovery snapshot independently of the primary medium.
 *
 * @param document - Immutable prior document state that is not mutated.
 * @param generation - Content generation written to recovery storage.
 * @returns State with updated recovery generation and unchanged modified/save semantics.
 */
export function markDocumentRecoverySaved(
  document: OfficeDocument,
  generation = document.contentGeneration,
): OfficeDocument {
  assertOpen(document);
  assertAcknowledgedGeneration(document, generation, "Recovery generation");
  return document.recoveryGeneration === generation
    ? document
    : { ...document, recoveryGeneration: generation };
}

/**
 * Marks whether a historical entry is the current primary save position without changing content.
 *
 * LibreOffice keeps this concern in `SwUndoManager::m_UndoSaveMark`; the browser snapshot history
 * stores the equivalent bit on each entry so a moved save mark remains deterministic.
 *
 * @param document - Open historical document metadata.
 * @param isSavePosition - Whether this entry is the current primary save position.
 * @returns Metadata with matching modified and lifecycle state but unchanged generations.
 */
export function markDocumentHistorySavePosition(
  document: OfficeDocument,
  isSavePosition: boolean,
): OfficeDocument {
  assertOpen(document);
  const isModified = !isSavePosition;
  const lifecycle = isSavePosition ? "saved" : "dirty";
  return document.isModified === isModified && document.lifecycle === lifecycle
    ? document
    : { ...document, isModified, lifecycle };
}

/**
 * Applies a history navigation as a fresh content mutation while retaining current save/recovery checkpoints.
 *
 * @param current - Current lifecycle state before Undo or Redo.
 * @param restored - Historical content state selected by Undo or Redo.
 * @returns Restored lifecycle metadata with a new monotonic content generation.
 */
export function markDocumentHistoryRestored(
  current: OfficeDocument,
  restored: OfficeDocument,
): OfficeDocument {
  assertOpen(current);
  assertOpen(restored);
  if (current.id !== restored.id) throw new Error("History document identity must remain stable.");
  const contentGeneration = current.contentGeneration + 1;
  return {
    ...restored,
    contentGeneration,
    isModified: restored.isModified,
    lifecycle: restored.isModified ? "dirty" : "saved",
    recoveryGeneration: current.recoveryGeneration,
    savedGeneration: current.savedGeneration,
  };
}

/**
 * Closes an open document without performing persistence; save prompting belongs to a future workbench policy.
 *
 * @param document - Immutable prior document state that is not mutated.
 * @returns A new closed document without changing content or persistence generations.
 */
export function closeDocument(document: OfficeDocument): OfficeDocument {
  return document.lifecycle === "closed" ? document : { ...document, lifecycle: "closed" };
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
function assertOpen(document: OfficeDocument): void {
  if (document.lifecycle === "closed") throw new Error("Closed documents cannot transition.");
}
