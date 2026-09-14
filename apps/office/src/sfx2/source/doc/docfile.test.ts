/**
 * @fileoverview Verifies JSON-compatible snapshot loading, immutable save boundaries, deterministic validation, and unaltered adapter failures.
 */

import { describe, expect, it } from "vitest";

import {
  createSfxMediumDescriptor,
  loadSnapshot,
  saveSnapshot,
  updateSfxMediumOperation,
  type DocumentSnapshot,
  type PrimarySavePort,
  type StoredDocumentOpenPort,
} from "./docfile";

/** Describes the JSON-compatible document body used by storage contract fixtures. */
type StorageFixtureState = { readonly text: string };

/**
 * Provides a deterministic in-memory adapter which records calls for contract assertions.
 *
 * This test double deliberately preserves objects it receives so the tests can
 * prove the domain boundary supplies a fresh frozen container instead of the
 * caller-owned snapshot object.
 */
class RecordingStorageAdapter
  implements PrimarySavePort<StorageFixtureState>, StoredDocumentOpenPort<StorageFixtureState>
{
  /** Stored snapshots keyed by their exact identifier. */
  readonly snapshots = new Map<string, DocumentSnapshot<StorageFixtureState>>();

  /** Snapshots supplied to save in chronological call order. */
  readonly savedSnapshots: DocumentSnapshot<StorageFixtureState>[] = [];

  /** Optional error propagated by the next load operation. */
  loadFailure: Error | undefined;

  /** Optional error propagated by the next save operation. */
  saveFailure: Error | undefined;

  /**
   * Reads a fixture snapshot by its exact identifier.
   *
   * @param id - Exact identifier used as the in-memory map key without mutation.
   * @returns Matching fixture snapshot or undefined for a missing key.
   * @throws {Error} When loadFailure is configured for this test double.
   */
  async load(id: string): Promise<DocumentSnapshot<StorageFixtureState> | undefined> {
    if (this.loadFailure !== undefined) throw this.loadFailure;
    return this.snapshots.get(id);
  }

  /**
   * Records a fixture snapshot supplied by the storage contract.
   *
   * @param snapshot - Frozen top-level snapshot container retained without mutation.
   * @returns A fulfilled promise after retaining the fixture call.
   * @throws {Error} When saveFailure is configured for this test double.
   */
  async save(snapshot: DocumentSnapshot<StorageFixtureState>): Promise<void> {
    if (this.saveFailure !== undefined) throw this.saveFailure;
    this.savedSnapshots.push(snapshot);
  }
}

/**
 * Creates a valid JSON-compatible snapshot fixture.
 *
 * @param id - Stable identifier assigned to the fixture without normalization.
 * @param version - Non-negative integer version assigned to the fixture.
 * @returns Caller-owned mutable-at-runtime fixture object for immutability assertions.
 */
function createSnapshot(id = "document-1", version = 0): DocumentSnapshot<StorageFixtureState> {
  return { id, state: { text: "Hello" }, version };
}

describe("document storage contract" /**
 * Groups browser-independent storage boundary tests.
 *
 * @returns Nothing; Vitest registers enclosed cases.
 */, function defineStorageTests(): void {
  it("constructs explicit stable SfxMedium variants without lifecycle duplication" /**
   * Verifies source, destination, capabilities, stable identity, and operation state remain explicit.
   *
   * @returns Nothing; assertions validate immutable medium state.
   */, function createsMediumDescriptor(): void {
    const untitled = createSfxMediumDescriptor({ kind: "untitled", name: "Medium document" });
    expect(untitled).toMatchObject({
      capabilities: { canConfirmWrite: false, canRead: false, canWrite: false },
      destination: { kind: "none" },
      displayName: "Medium document",
      lastOperation: { operation: "none", state: "idle" },
      origin: "new",
      readOnly: false,
      source: { kind: "none" },
    });
    expect(Object.isFrozen(untitled)).toBe(true);
    expect(Object.isFrozen(untitled.capabilities)).toBe(true);

    const sourceReference = { id: "blob" };
    const local = createSfxMediumDescriptor({
      indexedDbKey: "local-key",
      kind: "browser-local",
      name: "Local document",
      source: { kind: "blob", reference: sourceReference },
    });
    const saving = updateSfxMediumOperation(local, "save", "pending", 2);
    expect(saving).toMatchObject({
      capabilities: { canConfirmWrite: true, canLock: true, canRead: true, canWrite: true },
      destination: { key: "local-key", kind: "indexeddb" },
      lastOperation: { generation: 2, operation: "save", state: "pending" },
      origin: "external",
      source: { kind: "blob", reference: sourceReference },
    });
    expect(updateSfxMediumOperation(local, "none", "idle").lastOperation).toEqual({
      operation: "none",
      state: "idle",
    });
    expect(createSfxMediumDescriptor(local)).toBe(local);
    expect(local).not.toHaveProperty("contentGeneration");
    expect(local).not.toHaveProperty("savedGeneration");
    expect(local).not.toHaveProperty("recoveryGeneration");
    expect(local).not.toHaveProperty("lastOperationStatus");
    expect(
      createSfxMediumDescriptor({
        indexedDbKey: "recovery-key",
        kind: "recovery",
        name: "Recovered document",
      }),
    ).toMatchObject({
      destination: { kind: "none" },
      origin: "recovered",
      readOnly: true,
      source: { key: "recovery-key", kind: "indexeddb", store: "recovery" },
    });
    expect(
      createSfxMediumDescriptor({
        indexedDbKey: "primary-after-recovery",
        kind: "browser-local",
        name: "Recovered then saved",
        source: { key: "recovery-key", kind: "indexeddb", store: "recovery" },
      }).origin,
    ).toBe("recovered");
    expect(
      createSfxMediumDescriptor({
        indexedDbKey: "existing-primary",
        kind: "browser-local",
        name: "Existing primary",
      }).origin,
    ).toBe("browser-local");
    expect(
      /** Constructs a blank-named medium. @returns Invalid descriptor that never returns. */ () =>
        createSfxMediumDescriptor({ kind: "untitled", name: " " }),
    ).toThrow("blank");
    expect(
      /** Constructs a runtime-invalid browser-local input. @returns Invalid descriptor that never returns. */ () =>
        createSfxMediumDescriptor({ kind: "browser-local", name: "Local" } as never),
    ).toThrow("required");
    expect(
      /** Constructs a runtime-invalid ODT input. @returns Invalid descriptor that never returns. */ () =>
        createSfxMediumDescriptor({ kind: "odt-source", name: "File" } as never),
    ).toThrow("opaque");
    expect(
      /** Constructs a runtime-invalid download input. @returns Invalid descriptor that never returns. */ () =>
        createSfxMediumDescriptor({ kind: "download", name: "File" } as never),
    ).toThrow("required");
  });

  it("returns explicit found and missing states without changing lookup identities" /**
   * Verifies lookup success and absence remain distinguishable deterministic states.
   *
   * @returns Nothing; assertions validate returned discriminators and identity preservation.
   */, async function loadsSnapshots(): Promise<void> {
    const adapter = new RecordingStorageAdapter();
    const storedSnapshot = createSnapshot(" document-1 ", 4);
    adapter.snapshots.set(storedSnapshot.id, storedSnapshot);

    await expect(loadSnapshot(adapter, storedSnapshot.id)).resolves.toEqual({
      snapshot: storedSnapshot,
      status: "found",
    });
    await expect(loadSnapshot(adapter, "missing")).resolves.toEqual({
      id: "missing",
      status: "missing",
    });
  });

  it("saves a fresh frozen snapshot container without mutating caller-owned data" /**
   * Verifies adapters do not receive the caller container and save results expose the exact supplied copy.
   *
   * @returns Nothing; assertions validate top-level immutability and state reference ownership.
   */, async function savesImmutableContainer(): Promise<void> {
    const adapter = new RecordingStorageAdapter();
    const snapshot = createSnapshot("document-2", 6);

    const result = await saveSnapshot(adapter, snapshot);
    const suppliedSnapshot = adapter.savedSnapshots[0];

    expect(result).toEqual({ snapshot: suppliedSnapshot, status: "saved" });
    expect(suppliedSnapshot).toEqual(snapshot);
    expect(suppliedSnapshot).not.toBe(snapshot);
    expect(suppliedSnapshot?.state).toBe(snapshot.state);
    expect(Object.isFrozen(suppliedSnapshot)).toBe(true);
    expect(snapshot).toEqual(createSnapshot("document-2", 6));
  });

  it("rejects blank, fractional, and negative snapshot versions before invoking the adapter" /**
   * Verifies every deterministic validation branch blocks persistence without partial calls.
   *
   * @returns Nothing; assertions validate rejected promises and an empty call log.
   */, async function rejectsInvalidSnapshots(): Promise<void> {
    const adapter = new RecordingStorageAdapter();

    await expect(saveSnapshot(adapter, createSnapshot(" ", 0))).rejects.toThrowError();
    await expect(saveSnapshot(adapter, createSnapshot("document-3", 0.5))).rejects.toThrowError();
    await expect(saveSnapshot(adapter, createSnapshot("document-4", -1))).rejects.toThrowError();
    expect(adapter.savedSnapshots).toEqual([]);
  });

  it("propagates load and save adapter failures without translating them" /**
   * Verifies browser adapter errors remain observable to future recovery and UI policy layers.
   *
   * @returns Nothing; assertions validate object-identity-preserving promise rejections.
   */, async function propagatesAdapterFailures(): Promise<void> {
    const loadAdapter = new RecordingStorageAdapter();
    const loadFailure = new Error("load failed");
    loadAdapter.loadFailure = loadFailure;
    const saveAdapter = new RecordingStorageAdapter();
    const saveFailure = new Error("save failed");
    saveAdapter.saveFailure = saveFailure;

    await expect(loadSnapshot(loadAdapter, "document-5")).rejects.toBe(loadFailure);
    await expect(saveSnapshot(saveAdapter, createSnapshot("document-5", 1))).rejects.toBe(
      saveFailure,
    );
  });
});
