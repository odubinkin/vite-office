/** @fileoverview Verifies deterministic recovery loading, autosave outcomes, immutable adapter calls, and unaltered storage failures. */

import { describe, expect, it } from "vitest";
import { autosaveDocument, recoverDocument, type RecoveryState } from "./recovery";
import type { DocumentSnapshot, DocumentStorageAdapter } from "../../../sfx2/source/doc/storage";

/** Describes JSON-compatible state used by recovery fixtures. */
type FixtureState = { readonly text: string };

/** Provides a deterministic storage double that records immutable calls. */
class StorageDouble implements DocumentStorageAdapter<FixtureState> {
  /** Stored snapshot returned by load. */
  stored: DocumentSnapshot<FixtureState> | undefined;
  /** Calls received by save. */
  readonly saves: DocumentSnapshot<FixtureState>[] = [];
  /** Optional failure propagated from either operation. */
  failure: Error | undefined;
  /** Loads the configured snapshot. @param id - Ignored identity recorded by the caller. @returns Configured snapshot. @throws {Error} Configured storage failure. */
  async load(id: string): Promise<DocumentSnapshot<FixtureState> | undefined> {
    void id;
    if (this.failure) throw this.failure;
    return this.stored;
  }
  /** Saves a snapshot without mutation. @param snapshot - Snapshot retained for assertions. @returns Nothing after recording. @throws {Error} Configured storage failure. */
  async save(snapshot: DocumentSnapshot<FixtureState>): Promise<void> {
    if (this.failure) throw this.failure;
    this.saves.push(snapshot);
  }
}

/** Creates a valid snapshot fixture. @param version - Revision assigned to the fixture. @returns Serializable snapshot. */
function snapshot(version: number): DocumentSnapshot<FixtureState> {
  return { id: "document-1", state: { text: `v${version}` }, version };
}

describe("autosave recovery" /** Groups recovery contract cases. @returns Nothing; Vitest registers cases. */, function defineRecoveryTests(): void {
  it("loads found and missing recovery states" /** Verifies explicit recovery states. @returns Nothing; assertions validate results. */, async function loadsRecovery(): Promise<void> {
    const adapter = new StorageDouble();
    adapter.stored = snapshot(1);
    await expect(recoverDocument(adapter, "document-1")).resolves.toEqual({
      id: "document-1",
      snapshot: snapshot(1),
    });
    adapter.stored = undefined;
    await expect(recoverDocument(adapter, "missing")).resolves.toEqual({
      id: "missing",
      snapshot: undefined,
    });
  });
  it("saves changed revisions and preserves unchanged recovery identity" /** Verifies idempotent and save outcomes. @returns Nothing; assertions validate calls. */, async function autosaves(): Promise<void> {
    const adapter = new StorageDouble();
    const prior: RecoveryState<FixtureState> = { id: "document-1", snapshot: snapshot(1) };
    await expect(autosaveDocument(adapter, prior, snapshot(1))).resolves.toEqual({
      recovery: prior,
      status: "unchanged",
    });
    const result = await autosaveDocument(adapter, prior, snapshot(2));
    expect(result).toMatchObject({ status: "saved", recovery: { snapshot: snapshot(2) } });
    expect(adapter.saves[0]).not.toBe(snapshot(2));
    expect(prior).toEqual({ id: "document-1", snapshot: snapshot(1) });
  });
  it("propagates storage failures unchanged" /** Verifies recovery callers retain native failure identity. @returns Nothing; assertions validate rejection identity. */, async function propagatesFailures(): Promise<void> {
    const adapter = new StorageDouble();
    const failure = new Error("offline");
    adapter.failure = failure;
    await expect(recoverDocument(adapter, "document-1")).rejects.toBe(failure);
    await expect(
      autosaveDocument(adapter, { id: "document-1", snapshot: undefined }, snapshot(1)),
    ).rejects.toBe(failure);
  });
});
