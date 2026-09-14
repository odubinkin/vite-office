/**
 * @fileoverview Implements the browser application AutoRecovery owner corresponding to
 * LibreOffice `framework/source/services/autorecovery.cxx` over injected document and storage contracts.
 */

import {
  recoverDocument,
  type RecoverableDocument,
  type RecoverySavePort,
} from "../../../svl/source/misc/recovery";
import { saveStorageRecord, type SerializableValue } from "../../../svl/source/misc/storage";

/** Identifies why the application service requested a recovery pass. */
export type AutoRecoverySaveReason = "interval" | "manual" | "pagehide" | "visibility-change";

/** Result of one generation-aware document recovery write. */
export type AutoRecoverySaveResult =
  | { readonly generation: number; readonly id: string; readonly status: "saved" }
  | { readonly generation: number; readonly id: string; readonly status: "unchanged" }
  | { readonly generation: number; readonly id: string; readonly status: "locked" }
  | {
      readonly error: unknown;
      readonly generation: number;
      readonly id: string;
      readonly status: "failed";
    };

/** Result of attempting to restore a registered document from durable recovery history. */
export type AutoRecoveryRestoreResult =
  | { readonly generation: number; readonly id: string; readonly status: "restored" }
  | { readonly id: string; readonly status: "missing" }
  | {
      readonly id: string;
      readonly rejectedGenerations: readonly number[];
      readonly status: "damaged";
    };

/** Metadata used by a recovery-choice UI without exposing payload contents. */
export interface AutoRecoveryCandidate {
  /** Stable document identity. */
  readonly id: string;
  /** Newest durable recovery generation. */
  readonly latestGeneration: number;
  /** Number of retained generations available for failure-safe fallback. */
  readonly retainedGenerations: number;
}

/** Injected browser lifecycle and timer boundary. */
export interface AutoRecoveryEnvironment {
  /** Cancels a timer previously returned by setInterval. @param handle - Timer handle. @returns Nothing. */
  readonly clearInterval: (handle: unknown) => void;
  /** Reports whether a visibility-change event moved the page out of view. @returns True for hidden pages. */
  readonly isHidden: () => boolean;
  /** Registers a pagehide listener. @param listener - Recovery trigger. @returns Cleanup function. */
  readonly onPageHide: (listener: () => void) => () => void;
  /** Registers a visibility-change listener. @param listener - Recovery trigger. @returns Cleanup function. */
  readonly onVisibilityChange: (listener: () => void) => () => void;
  /** Starts a repeating timer. @param listener - Recovery trigger. @param intervalMs - Positive interval. @returns Opaque timer handle. */
  readonly setInterval: (listener: () => void, intervalMs: number) => unknown;
}

/** Configuration for one application-scoped recovery service. */
export interface AutoRecoveryOptions {
  /** Optional browser lifecycle boundary; omit for deterministic manual operation. */
  readonly environment?: AutoRecoveryEnvironment;
  /** Periodic autosave interval in milliseconds. */
  readonly intervalMs?: number;
  /** Cross-context lease lifetime in milliseconds. */
  readonly leaseDurationMs?: number;
  /** Stable tab or application-process identity. */
  readonly ownerId: string;
  /** Clock used for lease expiration. */
  readonly now?: () => number;
}

/** Default browser-adapted autosave interval. */
export const DEFAULT_AUTORECOVERY_INTERVAL_MS = 60_000;

/** Default cross-context lease lifetime. */
export const DEFAULT_AUTORECOVERY_LEASE_MS = 30_000;

/** Application service coordinating recovery for every registered document. */
export class AutoRecovery<State extends SerializableValue> {
  private readonly documents = new Set<RecoverableDocument<State>>();
  private readonly queues = new Map<string, Promise<AutoRecoverySaveResult>>();
  private readonly cleanupListeners: Array<() => void> = [];
  private timerHandle: unknown;

  /** Creates an inactive recovery service over an injected durable adapter. @param storage - Recovery-specific versioned storage. @param options - Scheduling and ownership configuration. @returns Nothing. */
  public constructor(
    private readonly storage: RecoverySavePort<State>,
    private readonly options: AutoRecoveryOptions,
  ) {
    if (options.ownerId.trim().length === 0)
      throw new Error("AutoRecovery owner id must not be blank.");
    if ((options.intervalMs ?? DEFAULT_AUTORECOVERY_INTERVAL_MS) <= 0)
      throw new Error("AutoRecovery interval must be positive.");
    if ((options.leaseDurationMs ?? DEFAULT_AUTORECOVERY_LEASE_MS) <= 0)
      throw new Error("AutoRecovery lease duration must be positive.");
  }

  /** Registers one document shell under its stable recovery identity. @param document - Recovery-capable shell. @returns Cleanup that unregisters this exact shell. */
  public RegisterDocument(document: RecoverableDocument<State>): () => void {
    const id = document.GetRecoveryIdentity();
    if (id.trim().length === 0) throw new Error("Recovery document id must not be blank.");
    if (
      [...this.documents].some(
        /** Compares one registered shell identity. @param candidate - Registered shell. @returns Whether the identity is already present. */
        (candidate) => candidate.GetRecoveryIdentity() === id,
      )
    )
      throw new Error(`Recovery document ${id} is already registered.`);
    this.documents.add(document);
    return /** Unregisters the captured document only while it is still current. @returns Nothing. */ () => {
      this.documents.delete(document);
    };
  }

  /** Starts interval, pagehide, and visibility-change scheduling once. @returns Whether scheduling started. */
  public Start(): boolean {
    const environment = this.options.environment;
    if (environment === undefined || this.timerHandle !== undefined) return false;
    this.timerHandle = environment.setInterval(
      /** Starts a periodic recovery pass without blocking the browser timer. @returns Nothing. */ () => {
        void this.SaveAll("interval");
      },
      this.options.intervalMs ?? DEFAULT_AUTORECOVERY_INTERVAL_MS,
    );
    this.cleanupListeners.push(
      environment.onVisibilityChange(
        /** Saves only when the page becomes hidden. @returns Nothing. */ () => {
          if (environment.isHidden()) void this.SaveAll("visibility-change");
        },
      ),
      environment.onPageHide(
        /** Starts a final best-effort recovery pass. @returns Nothing. */ () => {
          void this.SaveAll("pagehide");
        },
      ),
    );
    return true;
  }

  /** Stops scheduling while leaving registered documents and durable data intact. @returns Nothing. */
  public Stop(): void {
    if (this.timerHandle !== undefined && this.options.environment !== undefined)
      this.options.environment.clearInterval(this.timerHandle);
    this.timerHandle = undefined;
    for (const cleanup of this.cleanupListeners.splice(0)) cleanup();
  }

  /** Saves all currently modified registered documents independently. @param reason - Trigger retained for application-level tracing. @returns One outcome per registered document. */
  public async SaveAll(
    reason: AutoRecoverySaveReason = "manual",
  ): Promise<readonly AutoRecoverySaveResult[]> {
    void reason;
    return Promise.all(
      [...this.documents].map(
        /** Queues one document recovery write. @param document - Registered shell. @returns Recovery outcome. */
        (document) => this.SaveDocument(document.GetRecoveryIdentity()),
      ),
    );
  }

  /** Queues one document write so overlapping triggers re-check the latest generation in order. @param id - Registered document identity. @returns Terminal recovery outcome. */
  public SaveDocument(id: string): Promise<AutoRecoverySaveResult> {
    const previous = this.queues.get(id) ?? Promise.resolve(undefined);
    const queued = previous.then(
      /** Runs after the prior attempt regardless of its result representation. @returns Current generation outcome. */
      () => this.SaveDocumentNow(id),
    );
    this.queues.set(id, queued);
    const cleanup =
      /** Removes only the latest settled queue entry. @returns Nothing. */ (): void => {
        if (this.queues.get(id) === queued) this.queues.delete(id);
      };
    void queued.then(cleanup, cleanup);
    return queued;
  }

  /** Returns recovery-choice metadata for one registered identity. @param id - Registered document identity. @returns Candidate metadata or undefined. */
  public async GetCandidate(id: string): Promise<AutoRecoveryCandidate | undefined> {
    this.RequireDocument(id);
    const generations = await this.LoadGenerations(id);
    const latest = generations[0];
    return latest === undefined
      ? undefined
      : { id, latestGeneration: latest.version, retainedGenerations: generations.length };
  }

  /** Restores the newest intact generation, falling back when a newer payload is invalid. @param id - Registered document identity. @returns Explicit recovery result. */
  public async RestoreDocument(id: string): Promise<AutoRecoveryRestoreResult> {
    const document = this.RequireDocument(id);
    const generations = await this.LoadGenerations(id);
    if (generations.length === 0) return { id, status: "missing" };
    const rejectedGenerations: number[] = [];
    for (const snapshot of generations) {
      try {
        document.RestoreRecoverySnapshot(snapshot);
        return { generation: snapshot.version, id, status: "restored" };
      } catch {
        rejectedGenerations.push(snapshot.version);
      }
    }
    return { id, rejectedGenerations, status: "damaged" };
  }

  /** Deletes durable recovery history for one document when supported by the adapter. @param id - Registered document identity. @returns Completion after cleanup. */
  public async DiscardDocument(id: string): Promise<void> {
    this.RequireDocument(id);
    await this.storage.deleteGenerations?.(id);
  }

  /** Executes one lease-protected recovery write. @param id - Registered document identity. @returns Terminal recovery outcome. */
  private async SaveDocumentNow(id: string): Promise<AutoRecoverySaveResult> {
    const document = this.RequireDocument(id);
    const state = document.GetRecoveryState();
    if (!state.isModified || state.recoveryGeneration === state.contentGeneration)
      return { generation: state.contentGeneration, id, status: "unchanged" };
    const generation = state.contentGeneration;
    let leaseAcquired: boolean;
    try {
      leaseAcquired = await this.AcquireLease(id);
    } catch (error) {
      document.RecoverySaveFailed(generation, error);
      return { error, generation, id, status: "failed" };
    }
    if (!leaseAcquired) return { generation, id, status: "locked" };
    document.RecoverySaveStarted(generation);
    try {
      const snapshot = document.CreateRecoverySnapshot();
      if (snapshot.id !== id || snapshot.version !== generation)
        throw new Error("Recovery payload changed identity or generation during capture.");
      await saveStorageRecord(this.storage, snapshot);
      document.AcknowledgeRecoverySave(generation);
      return { generation, id, status: "saved" };
    } catch (error) {
      document.RecoverySaveFailed(generation, error);
      return { error, generation, id, status: "failed" };
    } finally {
      await this.ReleaseLease(id);
    }
  }

  /** Loads newest-first recovery history with a one-record adapter fallback. @param id - Document identity. @returns Ordered candidate snapshots. */
  private async LoadGenerations(id: string) {
    const generations = await this.storage.loadGenerations?.(id);
    if (generations !== undefined)
      return [...generations]
        .filter(
          /** Retains structurally valid matching records. @param record - Candidate snapshot. @returns Whether it belongs to this identity. */
          (record) => record.id === id && Number.isInteger(record.version) && record.version >= 0,
        )
        .sort(
          /** Orders newer generations first. @param left - First record. @param right - Second record. @returns Descending generation difference. */
          (left, right) => right.version - left.version,
        );
    const recovered = await recoverDocument(this.storage, id);
    return recovered.snapshot === undefined ? [] : [recovered.snapshot];
  }

  /** Acquires an optional cross-context lease. @param id - Document identity. @returns Whether writing may proceed. */
  private async AcquireLease(id: string): Promise<boolean> {
    if (this.storage.acquireLease === undefined) return true;
    const now = (this.options.now ?? Date.now)();
    return this.storage.acquireLease(
      id,
      this.options.ownerId,
      now + (this.options.leaseDurationMs ?? DEFAULT_AUTORECOVERY_LEASE_MS),
      now,
    );
  }

  /** Releases an optional lease without changing a completed persistence result. @param id - Document identity. @returns Completion after best-effort release. */
  private async ReleaseLease(id: string): Promise<void> {
    try {
      await this.storage.releaseLease?.(id, this.options.ownerId);
    } catch {
      // The lease expires independently; a release failure must not undo a committed snapshot.
    }
  }

  /** Resolves a registered shell or rejects unknown identities. @param id - Document identity. @returns Registered document. */
  private RequireDocument(id: string): RecoverableDocument<State> {
    const document = [...this.documents].find(
      /** Selects the shell currently exposing the requested identity. @param candidate - Registered shell. @returns Whether identities match. */
      (candidate) => candidate.GetRecoveryIdentity() === id,
    );
    if (document === undefined) throw new Error(`Recovery document ${id} is not registered.`);
    return document;
  }
}
