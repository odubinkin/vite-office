/** @fileoverview Verifies deterministic recovery loading, autosave outcomes, immutable adapter calls, and unaltered storage failures. */

import { describe, expect, it } from "vitest";
import {
  autosaveDocument,
  recoverDocument,
  type RecoveryState,
  type RecoverySavePort,
} from "./recovery";
import type { VersionedStorageAdapter, VersionedStorageRecord } from "./storage";

/** Describes JSON-compatible state used by recovery fixtures. */
type FixtureState = { readonly text: string };

/** Provides a deterministic storage double that records immutable calls. */
class StorageDouble implements VersionedStorageAdapter<FixtureState> {
  /** Stored snapshot returned by load. */
  stored: VersionedStorageRecord<FixtureState> | undefined;
  /** Calls received by save. */
  readonly saves: VersionedStorageRecord<FixtureState>[] = [];
  /** Optional failure propagated from either operation. */
  failure: Error | undefined;
  /** Loads the configured snapshot. @param id - Ignored identity recorded by the caller. @returns Configured snapshot. @throws {Error} Configured storage failure. */
  async load(id: string): Promise<VersionedStorageRecord<FixtureState> | undefined> {
    void id;
    if (this.failure) throw this.failure;
    return this.stored;
  }
  /** Saves a snapshot without mutation. @param snapshot - Snapshot retained for assertions. @returns Nothing after recording. @throws {Error} Configured storage failure. */
  async save(snapshot: VersionedStorageRecord<FixtureState>): Promise<void> {
    if (this.failure) throw this.failure;
    this.saves.push(snapshot);
  }
}

/** Creates a valid snapshot fixture. @param version - Revision assigned to the fixture. @returns Serializable snapshot. */
function snapshot(version: number): VersionedStorageRecord<FixtureState> {
  return { id: "document-1", state: { text: `v${version}` }, version };
}

describe("autosave recovery" /** Groups recovery contract cases. @returns Nothing; Vitest registers cases. */, function defineRecoveryTests(): void {
  it("loads found and missing recovery states" /** Verifies explicit recovery states. @returns Nothing; assertions validate results. */, async function loadsRecovery(): Promise<void> {
    const adapter = new StorageDouble();
    adapter.stored = snapshot(1);
    await expect(recoverDocument(adapter, "document-1")).resolves.toEqual({
      id: "document-1",
      recoveryGeneration: 1,
      snapshot: snapshot(1),
    });
    adapter.stored = undefined;
    await expect(recoverDocument(adapter, "missing")).resolves.toEqual({
      id: "missing",
      recoveryGeneration: null,
      snapshot: undefined,
    });
  });
  it("selects the newest valid retained recovery generation" /** Verifies history-aware adapters ignore invalid rows and avoid the single-record fallback. @returns Completion after recovery lookup. */, async function loadsRecoveryHistory(): Promise<void> {
    const adapter: RecoverySavePort<FixtureState> = {
      /** Supplies an unused fallback record. @returns Old recovery record. */
      load: async () => snapshot(1),
      /** Supplies invalid and valid retained generations. @returns Newest-first fixture history. */
      loadGenerations: async () => [
        { id: "other", state: { text: "invalid identity" }, version: 3 },
        { id: "document-1", state: { text: "fractional" }, version: 1.5 },
        { id: "document-1", state: { text: "negative" }, version: -1 },
        snapshot(2),
      ],
      /** Accepts an unused fixture save. @returns Fulfilled completion. */
      save: async () => undefined,
    };
    await expect(recoverDocument(adapter, "document-1")).resolves.toEqual({
      id: "document-1",
      recoveryGeneration: 2,
      snapshot: snapshot(2),
    });
  });
  it("saves each changed generation and preserves unchanged recovery identity" /** Verifies idempotent and save outcomes. @returns Nothing; assertions validate calls. */, async function autosaves(): Promise<void> {
    const adapter = new StorageDouble();
    const prior: RecoveryState<FixtureState> = {
      id: "document-1",
      recoveryGeneration: 1,
      snapshot: snapshot(1),
    };
    await expect(autosaveDocument(adapter, prior, snapshot(1))).resolves.toEqual({
      recovery: prior,
      status: "unchanged",
    });
    const result = await autosaveDocument(adapter, prior, snapshot(2));
    expect(result).toMatchObject({ status: "saved", recovery: { snapshot: snapshot(2) } });
    const second = await autosaveDocument(adapter, result.recovery, snapshot(3));
    expect(second).toMatchObject({
      status: "saved",
      recovery: { recoveryGeneration: 3, snapshot: snapshot(3) },
    });
    expect(
      adapter.saves.map(
        /** Selects the generation written by one recovery save. @param saved - Persisted snapshot. @returns Persisted content generation. */
        function selectSavedGeneration(saved): number {
          return saved.version;
        },
      ),
    ).toEqual([2, 3]);
    expect(adapter.saves[0]).not.toBe(snapshot(2));
    expect(prior).toEqual({
      id: "document-1",
      recoveryGeneration: 1,
      snapshot: snapshot(1),
    });
  });
  it("propagates storage failures unchanged" /** Verifies recovery callers retain native failure identity. @returns Nothing; assertions validate rejection identity. */, async function propagatesFailures(): Promise<void> {
    const adapter = new StorageDouble();
    const failure = new Error("offline");
    adapter.failure = failure;
    await expect(recoverDocument(adapter, "document-1")).rejects.toBe(failure);
    await expect(
      autosaveDocument(
        adapter,
        { id: "document-1", recoveryGeneration: null, snapshot: undefined },
        snapshot(1),
      ),
    ).rejects.toBe(failure);
  });
});
