/** @fileoverview Verifies SfxMedium identity and browser storage boundaries. */

import { describe, expect, it } from "vitest";

import {
  acquireSfxMedium,
  loadSnapshot,
  saveSnapshot,
  SfxMedium,
  type DocumentSnapshot,
  type PrimarySavePort,
  type StoredDocumentOpenPort,
} from "./docfile";

/** Serializable state used by the storage boundary fixture. */
type StorageFixtureState = { readonly text: string };

/** In-memory load/save port recording the snapshots passed across the boundary. */
class RecordingStorageAdapter
  implements PrimarySavePort<StorageFixtureState>, StoredDocumentOpenPort<StorageFixtureState>
{
  readonly snapshots = new Map<string, DocumentSnapshot<StorageFixtureState>>();
  readonly savedSnapshots: DocumentSnapshot<StorageFixtureState>[] = [];
  loadFailure: Error | undefined;
  saveFailure: Error | undefined;

  /** Loads a recorded snapshot. @param id - Document identity. @returns Stored snapshot, if present. */
  async load(id: string): Promise<DocumentSnapshot<StorageFixtureState> | undefined> {
    if (this.loadFailure !== undefined) throw this.loadFailure;
    return this.snapshots.get(id);
  }

  /** Records a saved snapshot. @param snapshot - Immutable snapshot. @returns Completion. */
  async save(snapshot: DocumentSnapshot<StorageFixtureState>): Promise<void> {
    if (this.saveFailure !== undefined) throw this.saveFailure;
    this.savedSnapshots.push(snapshot);
  }
}

/** Creates a storage fixture. @param id - Document identity. @param version - Generation. @returns Snapshot. */
function createSnapshot(id = "document-1", version = 0): DocumentSnapshot<StorageFixtureState> {
  return { id, state: { text: "Hello" }, version };
}

describe("SfxMedium", /** Registers medium tests. @returns Nothing. */ function defineMediumTests(): void {
  it("retains identity while operation state changes", /** Verifies retained identity. @returns Nothing. */ function retainsIdentity(): void {
    const sourceReference = { id: "blob" };
    const medium = new SfxMedium({
      indexedDbKey: "local-key",
      kind: "browser-local",
      name: "Local document",
      source: { kind: "blob", reference: sourceReference },
    });
    medium.SetOperation("save", "pending", 2);
    expect(medium).toMatchObject({
      capabilities: { canConfirmWrite: true, canLock: true, canRead: true, canWrite: true },
      destination: { key: "local-key", kind: "indexeddb" },
      lastOperation: { generation: 2, operation: "save", state: "pending" },
      origin: "external",
      source: { kind: "blob", reference: sourceReference },
    });
    expect(acquireSfxMedium(medium)).toBe(medium);
    medium.SetOperation("save", "succeeded", 2);
    expect(medium.GetLastOperation().state).toBe("succeeded");
    medium.Close();
    expect(medium.IsOpen()).toBe(false);
    expect(
      /** Mutates a closed medium. @returns Nothing; throws. */ () =>
        medium.SetOperation("save", "pending", 3),
    ).toThrow("Closed media");
  });

  it("constructs explicit routes and rejects malformed inputs", /** Verifies route validation. @returns Nothing. */ function validatesRoutes(): void {
    expect(new SfxMedium({ kind: "untitled", name: "Document" })).toMatchObject({
      destination: { kind: "none" },
      origin: "new",
      readOnly: false,
      source: { kind: "none" },
    });
    expect(
      new SfxMedium({ indexedDbKey: "recovery", kind: "recovery", name: "Recovered" }),
    ).toMatchObject({ origin: "recovered", readOnly: true });
    expect(
      new SfxMedium({
        indexedDbKey: "local",
        kind: "browser-local",
        name: "Recovered local",
        source: { key: "recovery", kind: "indexeddb", store: "recovery" },
      }).origin,
    ).toBe("recovered");
    expect(
      new SfxMedium({
        indexedDbKey: "local",
        kind: "browser-local",
        name: "Primary local",
        source: { key: "primary", kind: "indexeddb", store: "primary" },
      }).origin,
    ).toBe("browser-local");
    expect(
      /** Constructs a blank medium. @returns Invalid medium; throws. */ () =>
        new SfxMedium({ kind: "untitled", name: " " }),
    ).toThrow("blank");
    expect(
      /** Constructs a local medium without a key. @returns Invalid medium; throws. */ () =>
        new SfxMedium({ kind: "browser-local", name: "Local" } as never),
    ).toThrow("required");
    expect(
      /** Constructs a download without a target. @returns Invalid medium; throws. */ () =>
        new SfxMedium({ kind: "download", name: "Download" } as never),
    ).toThrow("Download target is required");
    for (const source of [
      undefined,
      { kind: "none" },
      { kind: "file", reference: 1 },
      { kind: "blob", reference: null },
    ])
      expect(
        /** Constructs an ODT medium with an invalid source. @returns Invalid medium; throws. */ () =>
          new SfxMedium({ kind: "odt-source", name: "Source", source } as never),
      ).toThrow("opaque Blob or File reference");
  });
});

describe("document storage contract", /** Registers storage tests. @returns Nothing. */ function defineStorageTests(): void {
  it("loads explicit found and missing results", /** Verifies load results. @returns Completion. */ async function loadsSnapshots(): Promise<void> {
    const adapter = new RecordingStorageAdapter();
    const stored = createSnapshot(" document-1 ", 4);
    adapter.snapshots.set(stored.id, stored);
    await expect(loadSnapshot(adapter, stored.id)).resolves.toEqual({
      snapshot: stored,
      status: "found",
    });
    await expect(loadSnapshot(adapter, "missing")).resolves.toEqual({
      id: "missing",
      status: "missing",
    });
  });

  it("saves a fresh frozen container", /** Verifies save identity. @returns Completion. */ async function savesSnapshots(): Promise<void> {
    const adapter = new RecordingStorageAdapter();
    const snapshot = createSnapshot("document-2", 6);
    const result = await saveSnapshot(adapter, snapshot);
    const supplied = adapter.savedSnapshots[0];
    expect(result).toEqual({ snapshot: supplied, status: "saved" });
    expect(supplied).not.toBe(snapshot);
    expect(supplied?.state).toBe(snapshot.state);
    expect(Object.isFrozen(supplied)).toBe(true);
  });

  it("validates snapshots and preserves adapter failures", /** Verifies storage validation. @returns Completion. */ async function validatesStorage(): Promise<void> {
    const adapter = new RecordingStorageAdapter();
    await expect(saveSnapshot(adapter, createSnapshot(" ", 0))).rejects.toThrowError();
    await expect(saveSnapshot(adapter, createSnapshot("document", 0.5))).rejects.toThrowError();
    const failure = new Error("load failed");
    adapter.loadFailure = failure;
    await expect(loadSnapshot(adapter, "document")).rejects.toBe(failure);
  });
});
