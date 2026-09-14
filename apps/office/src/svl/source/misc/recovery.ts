/** @fileoverview Defines deterministic browser autosave recovery orchestration over injected serializable document storage without timers or UI policy. */

import {
  loadStorageRecord,
  saveStorageRecord,
  type SerializableValue,
  type VersionedStorageAdapter,
  type VersionedStorageRecord,
} from "./storage";

/** Storage operations required by framework AutoRecovery beyond one replaceable record. */
export interface RecoveryStorageAdapter<
  State extends SerializableValue,
> extends VersionedStorageAdapter<State> {
  /** Attempts to acquire a short-lived cross-context lease. @param id - Document identity. @param ownerId - Current context identity. @param expiresAt - Absolute lease expiry in milliseconds. @param now - Current absolute time used to recognize an expired owner. @returns Whether the lease was acquired. */
  acquireLease?(id: string, ownerId: string, expiresAt: number, now: number): Promise<boolean>;
  /** Deletes every recovery generation for one document. @param id - Document identity. @returns Completion after deletion. */
  deleteGenerations?(id: string): Promise<void>;
  /** Loads valid stored generations in newest-first order. @param id - Document identity. @returns Complete retained history. */
  loadGenerations?(id: string): Promise<readonly VersionedStorageRecord<State>[]>;
  /** Releases a lease only when owned by the current context. @param id - Document identity. @param ownerId - Current context identity. @returns Completion after release. */
  releaseLease?(id: string, ownerId: string): Promise<void>;
}

/** Recovery-facing document contract implemented by document shells without framework ownership. */
export interface RecoverableDocument<State extends SerializableValue> {
  /** Acknowledges a completed recovery write. @param generation - Persisted content generation. @returns Nothing. */
  AcknowledgeRecoverySave(generation: number): void;
  /** Creates a complete immutable recovery payload. @returns Current generation snapshot. */
  CreateRecoverySnapshot(): VersionedStorageRecord<State>;
  /** Returns the stable recovery identity. @returns Document identity. */
  GetRecoveryIdentity(): string;
  /** Returns current lifecycle state used by autosave decisions. @returns Generation and modified state. */
  GetRecoveryState(): Readonly<{
    contentGeneration: number;
    isModified: boolean;
    recoveryGeneration: number | null;
  }>;
  /** Records a failed recovery write without acknowledging its generation. @param generation - Attempted generation. @param error - Original storage failure. @returns Nothing. */
  RecoverySaveFailed(generation: number, error: unknown): void;
  /** Records a started recovery write for operation feedback. @param generation - Attempted generation. @returns Nothing. */
  RecoverySaveStarted(generation: number): void;
  /** Atomically restores one candidate snapshot. @param snapshot - Candidate recovery payload. @returns Nothing after replacement; invalid payloads throw before mutation. */
  RestoreRecoverySnapshot(snapshot: VersionedStorageRecord<State>): void;
}

/** Describes the durable recovery state for one caller-chosen document identity. */
export interface RecoveryState<State extends SerializableValue> {
  /** Exact storage identity retained without normalization. */
  readonly id: string;
  /** Content generation of the last successful recovery write, or null before recovery exists. */
  readonly recoveryGeneration: number | null;
  /** Last successfully saved snapshot, or undefined before any recovery data exists. */
  readonly snapshot: VersionedStorageRecord<State> | undefined;
}

/** Represents one deterministic autosave operation outcome. */
export type AutosaveResult<State extends SerializableValue> =
  | { readonly status: "saved"; readonly recovery: RecoveryState<State> }
  | { readonly status: "unchanged"; readonly recovery: RecoveryState<State> };

/**
 * Loads the last known recovery snapshot for an exact document identity.
 *
 * @param adapter - Storage boundary invoked once without mutation.
 * @param id - Exact document identity passed through to storage unchanged.
 * @returns Recovery state with the persisted snapshot or an explicit empty state.
 * @throws {Error} When the storage load rejects without translation.
 */
export async function recoverDocument<State extends SerializableValue>(
  adapter: RecoveryStorageAdapter<State>,
  id: string,
): Promise<RecoveryState<State>> {
  const generations = await adapter.loadGenerations?.(id);
  const newest = generations?.find(
    /** Selects the newest structurally valid record for this identity. @param record - Candidate stored record. @returns Whether identity and generation are valid. */
    function isValidGeneration(record): boolean {
      return record.id === id && Number.isInteger(record.version) && record.version >= 0;
    },
  );
  const result =
    newest === undefined
      ? await loadStorageRecord(adapter, id)
      : ({ record: newest, status: "found" } as const);
  return result.status === "found"
    ? { id, recoveryGeneration: result.record.version, snapshot: result.record }
    : { id, recoveryGeneration: null, snapshot: undefined };
}

/**
 * Saves a changed snapshot or reports unchanged when its version equals recovered state.
 *
 * Callers own all scheduling, debounce, retry, and user-notification policy.
 *
 * @param adapter - Storage boundary invoked at most once without mutation.
 * @param recovery - Prior recovery state inspected without mutation.
 * @param snapshot - Candidate serializable snapshot inspected without mutation.
 * @returns Saved recovery state or unchanged prior recovery state.
 * @throws {Error} When snapshot validation or storage save rejects without translation.
 */
export async function autosaveDocument<State extends SerializableValue>(
  adapter: RecoveryStorageAdapter<State>,
  recovery: RecoveryState<State>,
  snapshot: VersionedStorageRecord<State>,
): Promise<AutosaveResult<State>> {
  if (recovery.id === snapshot.id && recovery.recoveryGeneration === snapshot.version)
    return { recovery, status: "unchanged" };
  const saved = await saveStorageRecord(adapter, snapshot);
  return {
    recovery: {
      id: snapshot.id,
      recoveryGeneration: saved.record.version,
      snapshot: saved.record,
    },
    status: "saved",
  };
}
