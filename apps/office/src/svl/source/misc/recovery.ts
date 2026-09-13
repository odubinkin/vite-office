/** @fileoverview Defines deterministic browser autosave recovery orchestration over injected serializable document storage without timers or UI policy. */

import {
  loadSnapshot,
  saveSnapshot,
  type DocumentSnapshot,
  type DocumentStorageAdapter,
  type SerializableValue,
} from "../../../sfx2/source/doc/docfile";

/** Describes the durable recovery state for one caller-chosen document identity. */
export interface RecoveryState<State extends SerializableValue> {
  /** Exact storage identity retained without normalization. */
  readonly id: string;
  /** Content generation of the last successful recovery write, or null before recovery exists. */
  readonly recoveryGeneration: number | null;
  /** Last successfully saved snapshot, or undefined before any recovery data exists. */
  readonly snapshot: DocumentSnapshot<State> | undefined;
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
  adapter: DocumentStorageAdapter<State>,
  id: string,
): Promise<RecoveryState<State>> {
  const result = await loadSnapshot(adapter, id);
  return result.status === "found"
    ? { id, recoveryGeneration: result.snapshot.version, snapshot: result.snapshot }
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
  adapter: DocumentStorageAdapter<State>,
  recovery: RecoveryState<State>,
  snapshot: DocumentSnapshot<State>,
): Promise<AutosaveResult<State>> {
  if (recovery.id === snapshot.id && recovery.recoveryGeneration === snapshot.version)
    return { recovery, status: "unchanged" };
  const saved = await saveSnapshot(adapter, snapshot);
  return {
    recovery: {
      id: snapshot.id,
      recoveryGeneration: saved.snapshot.version,
      snapshot: saved.snapshot,
    },
    status: "saved",
  };
}
