/**
 * @fileoverview Implements bounded SfxObjectShell lifecycle ownership from pinned
 * `include/sfx2/objsh.hxx` and `sfx2/source/doc/objmisc.cxx`.
 */

import { acquireSfxMedium, type SfxMedium, type SfxMediumInputOrInstance } from "./docfile";

/** Identifies the externally observable lifecycle of a locally held document shell. */
export type DocumentLifecycle = "closed" | "dirty" | "new" | "saved";

/** Identifies the application module that owns a document body. */
export type DocumentModuleId = string;

/**
 * Serializable projection of SfxObjectShell state for browser and worker boundaries.
 *
 * The projection is not the lifecycle owner: SfxObjectShell stores and mutates the
 * individual fields, matching upstream object-shell ownership.
 */
export interface SfxObjectShellState {
  readonly contentGeneration: number;
  readonly id: string;
  readonly isModified: boolean;
  readonly lifecycle: DocumentLifecycle;
  readonly suiteId: DocumentModuleId;
  readonly title: string;
}

/** Describes input required to initialize an object shell. */
export interface CreateDocumentInput {
  readonly id: string;
  readonly suiteId: DocumentModuleId;
  readonly title: string;
}

/** Framework document shell owning identity, title, modified state, and the primary medium. */
export class SfxObjectShell {
  private closed = false;
  private contentGeneration: number;
  private hasSavePosition: boolean;
  private id: string;
  private modified: boolean;
  protected medium: SfxMedium;
  private moduleId: DocumentModuleId;
  private title: string;

  /** Creates an object shell from an initial state projection and medium. @param state - Initial shell state. @param medium - Current medium. @returns Nothing. */
  public constructor(state: SfxObjectShellState, medium: SfxMediumInputOrInstance) {
    assertObjectShellState(state);
    if (state.lifecycle === "closed") throw new Error("Cannot construct a closed document shell.");
    this.contentGeneration = state.contentGeneration;
    this.hasSavePosition = state.lifecycle === "saved";
    this.id = state.id;
    this.modified = state.isModified;
    this.moduleId = state.suiteId;
    this.title = state.title;
    this.medium = acquireSfxMedium(medium);
  }

  /** Returns a fresh immutable boundary projection of shell-owned lifecycle fields. @returns Current shell state. */
  public GetDocumentState(): SfxObjectShellState {
    return Object.freeze({
      contentGeneration: this.contentGeneration,
      id: this.id,
      isModified: this.modified,
      lifecycle: this.GetLifecycle(),
      suiteId: this.moduleId,
      title: this.title,
    });
  }

  /** Returns the stable document identity. @returns Shell identity. */
  public GetDocumentId(): string {
    return this.id;
  }

  /** Returns the current title owned by this shell. @returns Document title. */
  public GetTitle(): string {
    return this.title;
  }

  /** Returns whether model or title state differs from the current save position. @returns Modified state. */
  public IsModified(): boolean {
    return this.modified;
  }

  /** Returns the browser race-prevention generation. @returns Current generation. */
  public GetContentGeneration(): number {
    return this.contentGeneration;
  }

  /** Returns the stable current medium. @returns Medium descriptor. */
  public GetMedium(): SfxMedium {
    return this.medium;
  }

  /** Rejects commands and persistence after shell closure. @returns Nothing for an open shell. */
  public EnsureOpen(): void {
    if (this.closed)
      throw new Error("Closed document shells cannot execute commands or persistence.");
  }

  /** Validates replacement state and acquires its medium before model replacement. @param state - New shell state. @param medium - New medium. @returns Prepared replacement. */
  protected PrepareObjectStateReplacement(
    state: SfxObjectShellState,
    medium: SfxMediumInputOrInstance,
  ): Readonly<{ medium: SfxMedium; state: SfxObjectShellState }> {
    assertObjectShellState(state);
    if (state.lifecycle === "closed") throw new Error("Cannot install a closed document state.");
    return Object.freeze({ medium: acquireSfxMedium(medium), state: Object.freeze({ ...state }) });
  }

  /** Commits a prepared replacement and closes the displaced medium. @param replacement - Prepared state and medium. @returns Nothing. */
  protected CommitObjectStateReplacement(
    replacement: Readonly<{ medium: SfxMedium; state: SfxObjectShellState }>,
  ): void {
    const previousMedium = this.medium;
    this.InstallObjectShellState(replacement.state);
    this.medium = replacement.medium;
    if (previousMedium !== this.medium) previousMedium.Close();
  }

  /** Replaces shell-owned lifecycle and medium atomically. @param state - New state. @param medium - New medium. @returns Nothing. */
  protected ReplaceObjectState(state: SfxObjectShellState, medium: SfxMediumInputOrInstance): void {
    this.CommitObjectStateReplacement(this.PrepareObjectStateReplacement(state, medium));
  }

  /** Mirrors SfxObjectShell::SetModified and advances only the browser race generation for model changes. @param modified - Next flag. @param contentChanged - Whether content generation advances. @returns Whether state changed. */
  protected SetModified(modified = true, contentChanged = false): boolean {
    this.EnsureOpen();
    const previousModified = this.modified;
    const previousGeneration = this.contentGeneration;
    this.modified = modified;
    if (contentChanged) this.contentGeneration += 1;
    return previousModified !== this.modified || previousGeneration !== this.contentGeneration;
  }

  /** Updates the shell-owned title and modified state. @param title - Validated title. @returns Whether title changed. */
  protected SetTitle(title: string): boolean {
    this.EnsureOpen();
    assertNonBlank(title, "Document title");
    if (title === this.title) return false;
    this.title = title;
    this.modified = true;
    this.contentGeneration += 1;
    return true;
  }

  /** Changes the browser primary identity after a confirmed Save As without replacing the model. */
  /**
   * Handles the Writer browser operation.
   * @param id - Input value.
   * @param title - Input value.
   * @param medium - Input value.
   * @returns Operation result.
   */ protected AdoptPrimaryIdentity(id: string, title: string, medium: SfxMedium): void {
    this.EnsureOpen();
    assertNonBlank(id, "Document id");
    assertNonBlank(title, "Document title");
    const previous = this.medium;
    this.id = id;
    this.title = title;
    this.medium = medium;
    if (previous !== medium) previous.Close();
  }

  /** Completes a confirmed primary-medium save at a captured generation. @param generation - Confirmed generation. @returns Whether state changed. */
  protected SaveCompleted(generation = this.contentGeneration): boolean {
    this.EnsureOpen();
    assertAcknowledgedGeneration(this.contentGeneration, generation, "Saved generation");
    const previousModified = this.modified;
    const previousSavePosition = this.hasSavePosition;
    this.hasSavePosition = true;
    this.modified = generation !== this.contentGeneration;
    return previousModified !== this.modified || previousSavePosition !== this.hasSavePosition;
  }

  /** Reconciles modified state with the document undo manager save position. @param isSavePosition - Whether history matches the save mark. @returns Whether state changed. */
  protected SetHistorySavePosition(isSavePosition: boolean): boolean {
    if (isSavePosition) this.hasSavePosition = true;
    return this.SetModified(!isSavePosition, false);
  }

  /** Marks this shell and its medium closed. @returns Whether closure changed state. */
  protected CloseObjectShell(): boolean {
    if (this.closed) return false;
    this.closed = true;
    this.medium.Close();
    return true;
  }

  /** Installs a complete boundary projection into independently owned shell fields. @param state - Validated state. @returns Nothing. */
  private InstallObjectShellState(state: SfxObjectShellState): void {
    this.closed = state.lifecycle === "closed";
    this.contentGeneration = state.contentGeneration;
    this.hasSavePosition = state.lifecycle === "saved";
    this.id = state.id;
    this.modified = state.isModified;
    this.moduleId = state.suiteId;
    this.title = state.title;
  }

  /** Derives the public lifecycle from owned flags and save-position state. @returns Current lifecycle. */
  private GetLifecycle(): DocumentLifecycle {
    if (this.closed) return "closed";
    if (this.modified) return "dirty";
    return this.hasSavePosition ? "saved" : "new";
  }
}

/** Creates an initial state projection for a new object shell. @param input - Identity metadata. @returns Unsaved shell state. */
export function createDocument(input: CreateDocumentInput): SfxObjectShellState {
  assertNonBlank(input.id, "Document id");
  assertNonBlank(input.suiteId, "Document module id");
  assertNonBlank(input.title, "Document title");
  return Object.freeze({
    contentGeneration: 0,
    id: input.id,
    isModified: false,
    lifecycle: "new",
    suiteId: input.suiteId,
    title: input.title,
  });
}

/** Validates a persistence callback generation. @param current - Current content generation. @param generation - Candidate generation. @param label - Error label. @returns Nothing. */
function assertAcknowledgedGeneration(current: number, generation: number, label: string): void {
  if (!Number.isInteger(generation) || generation < 0 || generation > current)
    throw new Error(`${label} must identify existing document content.`);
}

/** Rejects blank metadata. @param value - Candidate value. @param label - Error label. @returns Nothing. */
function assertNonBlank(value: string, label: string): void {
  if (value.trim().length === 0) throw new Error(`${label} must not be blank.`);
}

/** Validates a shell-state boundary projection. @param state - Candidate state. @returns Nothing. */
function assertObjectShellState(state: SfxObjectShellState): void {
  assertNonBlank(state.id, "Document id");
  assertNonBlank(state.suiteId, "Document module id");
  assertNonBlank(state.title, "Document title");
  if (!Number.isInteger(state.contentGeneration) || state.contentGeneration < 0)
    throw new Error("Content generation must be a non-negative integer.");
  if (state.lifecycle === "dirty" && !state.isModified)
    throw new Error("Dirty lifecycle requires modified state.");
  if (state.lifecycle !== "dirty" && state.isModified)
    throw new Error("Modified state requires dirty lifecycle.");
}
