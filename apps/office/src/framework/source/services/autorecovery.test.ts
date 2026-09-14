/** @fileoverview Verifies application-owned generation-aware AutoRecovery, failure fallback, scheduling, and cross-context leases. */

import { describe, expect, it } from "vitest";

import type { RecoverableDocument, RecoverySavePort } from "../../../svl/source/misc/recovery";
import type { VersionedStorageRecord } from "../../../svl/source/misc/storage";
import { AutoRecovery, type AutoRecoveryEnvironment } from "./autorecovery";

/** Serializable recovery fixture state. */
type FixtureState = { readonly text: string };

/** Deterministic recovery-capable document double. */
class RecoveryDocumentDouble implements RecoverableDocument<FixtureState> {
  /** Current content generation. */
  contentGeneration = 1;
  /** Whether recovery should consider this document. */
  isModified = true;
  /** Last acknowledged recovery generation. */
  recoveryGeneration: number | null = null;
  /** Failed generations recorded by the shell callback. */
  readonly failures: number[] = [];
  /** Started generations recorded by the shell callback. */
  readonly starts: number[] = [];
  /** Restored generations accepted by this document. */
  readonly restores: number[] = [];

  /** Creates the fixture document. @param id - Stable recovery identity. @returns Nothing. */
  constructor(private readonly id: string) {}

  /** Acknowledges one committed generation. @param generation - Saved generation. @returns Nothing. */
  AcknowledgeRecoverySave(generation: number): void {
    this.recoveryGeneration = generation;
  }

  /** Captures current content. @returns Complete fixture snapshot. */
  CreateRecoverySnapshot(): VersionedStorageRecord<FixtureState> {
    return {
      id: this.id,
      state: { text: `generation-${this.contentGeneration}` },
      version: this.contentGeneration,
    };
  }

  /** Returns stable identity. @returns Document identity. */
  GetRecoveryIdentity(): string {
    return this.id;
  }

  /** Returns current lifecycle state. @returns Recovery decision fields. */
  GetRecoveryState() {
    return {
      contentGeneration: this.contentGeneration,
      isModified: this.isModified,
      recoveryGeneration: this.recoveryGeneration,
    };
  }

  /** Records a failed write. @param generation - Failed generation. @param error - Storage error. @returns Nothing. */
  RecoverySaveFailed(generation: number, error: unknown): void {
    void error;
    this.failures.push(generation);
  }

  /** Records a started write. @param generation - Started generation. @returns Nothing. */
  RecoverySaveStarted(generation: number): void {
    this.starts.push(generation);
  }

  /** Accepts intact payloads and rejects corrupt fixtures before mutation. @param snapshot - Candidate recovery snapshot. @returns Nothing. */
  RestoreRecoverySnapshot(snapshot: VersionedStorageRecord<FixtureState>): void {
    if (snapshot.state.text === "corrupt") throw new Error("corrupt recovery payload");
    this.restores.push(snapshot.version);
    this.contentGeneration = snapshot.version;
    this.recoveryGeneration = snapshot.version;
  }
}

/** Recovery document double whose payload violates the capture contract. */
class MismatchedRecoveryDocumentDouble extends RecoveryDocumentDouble {
  /** Creates a snapshot for another identity. @returns Invalid recovery payload. */
  override CreateRecoverySnapshot(): VersionedStorageRecord<FixtureState> {
    return { id: "other-document", state: { text: "mismatch" }, version: 1 };
  }
}

/** Recovery document double whose payload generation differs from captured state. */
class MismatchedGenerationDocumentDouble extends RecoveryDocumentDouble {
  /** Creates a snapshot for the next generation. @returns Invalid recovery payload. */
  override CreateRecoverySnapshot(): VersionedStorageRecord<FixtureState> {
    return { id: this.GetRecoveryIdentity(), state: { text: "mismatch" }, version: 2 };
  }
}

/** In-memory recovery history and lease adapter. */
class RecoveryStorageDouble implements RecoverySavePort<FixtureState> {
  /** Newest-first durable histories. */
  readonly histories = new Map<string, VersionedStorageRecord<FixtureState>[]>();
  /** Current context leases. */
  readonly leases = new Map<string, { expiresAt: number; ownerId: string }>();
  /** Optional save failure. */
  saveFailure: Error | undefined;
  /** Optional promise delaying writes for concurrency tests. */
  saveGate: Promise<void> | undefined;

  /** Loads newest record. @param id - Document identity. @returns Latest snapshot. */
  async load(id: string): Promise<VersionedStorageRecord<FixtureState> | undefined> {
    return this.histories.get(id)?.[0];
  }

  /** Retains one complete generation. @param record - Recovery snapshot. @returns Completion after optional gate. */
  async save(record: VersionedStorageRecord<FixtureState>): Promise<void> {
    if (this.saveFailure !== undefined) throw this.saveFailure;
    await this.saveGate;
    const current = this.histories.get(record.id) ?? [];
    this.histories.set(
      record.id,
      [
        record,
        ...current.filter(
          /** Removes a same-generation predecessor. @param candidate - Existing record. @returns Whether its generation differs. */
          (candidate) => candidate.version !== record.version,
        ),
      ].sort(
        /** Orders newer records first. @param left - First record. @param right - Second record. @returns Descending generation difference. */
        (left, right) => right.version - left.version,
      ),
    );
  }

  /** Loads complete newest-first history. @param id - Document identity. @returns Retained generations. */
  async loadGenerations(id: string): Promise<readonly VersionedStorageRecord<FixtureState>[]> {
    return this.histories.get(id) ?? [];
  }

  /** Deletes complete history. @param id - Document identity. @returns Fulfilled completion. */
  async deleteGenerations(id: string): Promise<void> {
    this.histories.delete(id);
  }

  /** Acquires one available lease. @param id - Document identity. @param ownerId - Context identity. @param expiresAt - Requested expiry. @param now - Current time. @returns Whether acquired. */
  async acquireLease(
    id: string,
    ownerId: string,
    expiresAt: number,
    now: number,
  ): Promise<boolean> {
    const current = this.leases.get(id);
    if (current !== undefined && current.ownerId !== ownerId && current.expiresAt > now)
      return false;
    this.leases.set(id, { expiresAt, ownerId });
    return true;
  }

  /** Releases an owned lease. @param id - Document identity. @param ownerId - Context identity. @returns Fulfilled completion. */
  async releaseLease(id: string, ownerId: string): Promise<void> {
    if (this.leases.get(id)?.ownerId === ownerId) this.leases.delete(id);
  }
}

/** Creates an externally resolvable promise. @returns Gate promise and resolver. */
function createGate(): { readonly promise: Promise<void>; readonly resolve: () => void } {
  let resolvePromise: (() => void) | undefined;
  const promise = new Promise<void>(
    /** Captures the gate resolver. @param resolve - Promise resolver. @returns Nothing. */
    (resolve) => {
      resolvePromise = resolve;
    },
  );
  return {
    promise,
    resolve: /** Releases the gate. @returns Nothing. */ () => resolvePromise?.(),
  };
}

describe("AutoRecovery" /** Groups application recovery service behavior. @returns Nothing. */, function defineAutoRecoveryTests(): void {
  it("validates service options and registered identities" /** Verifies invalid configuration, blank identities, duplicates, and unknown lookups fail deterministically. @returns Completion after rejection checks. */, async function validatesConfiguration(): Promise<void> {
    const storage = new RecoveryStorageDouble();
    expect(
      /** Creates a blank-owner service. @returns Invalid service that never returns. */ () =>
        new AutoRecovery(storage, { ownerId: " " }),
    ).toThrow("owner id");
    expect(
      /** Creates a zero-interval service. @returns Invalid service that never returns. */ () =>
        new AutoRecovery(storage, { intervalMs: 0, ownerId: "tab" }),
    ).toThrow("interval");
    expect(
      /** Creates a zero-lease service. @returns Invalid service that never returns. */ () =>
        new AutoRecovery(storage, { leaseDurationMs: 0, ownerId: "tab" }),
    ).toThrow("lease duration");

    const recovery = new AutoRecovery(storage, { ownerId: "tab" });
    expect(recovery.Start()).toBe(false);
    recovery.Stop();
    expect(
      /** Registers a blank document identity. @returns Invalid registration that never returns. */ () =>
        recovery.RegisterDocument(new RecoveryDocumentDouble(" ")),
    ).toThrow("document id");
    recovery.RegisterDocument(new RecoveryDocumentDouble("document"));
    expect(
      /** Registers a duplicate document identity. @returns Invalid registration that never returns. */ () =>
        recovery.RegisterDocument(new RecoveryDocumentDouble("document")),
    ).toThrow("already registered");
    await expect(recovery.GetCandidate("missing")).rejects.toThrow("not registered");
  });

  it("saves every changed generation and never acknowledges a failed write" /** Verifies generation decisions and failure callbacks. @returns Completion after saves. */, async function savesGenerations(): Promise<void> {
    const storage = new RecoveryStorageDouble();
    const document = new RecoveryDocumentDouble("document-1");
    const recovery = new AutoRecovery(storage, {
      now: /** Returns deterministic fixture time. @returns Current time. */ () => 100,
      ownerId: "tab-1",
    });
    recovery.RegisterDocument(document);

    await expect(recovery.SaveDocument("document-1")).resolves.toEqual({
      generation: 1,
      id: "document-1",
      status: "saved",
    });
    document.contentGeneration = 2;
    await recovery.SaveDocument("document-1");
    expect(
      storage.histories.get("document-1")?.map(
        /** Projects one stored generation. @param record - Stored snapshot. @returns Generation number. */
        (record) => record.version,
      ),
    ).toEqual([2, 1]);
    expect(document.recoveryGeneration).toBe(2);
    await expect(recovery.SaveDocument("document-1")).resolves.toMatchObject({
      generation: 2,
      status: "unchanged",
    });
    document.isModified = false;
    document.contentGeneration = 3;
    await expect(recovery.SaveDocument("document-1")).resolves.toMatchObject({
      generation: 3,
      status: "unchanged",
    });
    document.isModified = true;

    document.contentGeneration = 4;
    const failure = new Error("quota");
    storage.saveFailure = failure;
    await expect(recovery.SaveDocument("document-1")).resolves.toMatchObject({
      error: failure,
      generation: 4,
      status: "failed",
    });
    expect(document.recoveryGeneration).toBe(2);
    expect(document.failures).toEqual([4]);
  });

  it("reports lease and payload capture failures without acknowledgement" /** Verifies pre-write failures use the document failure callback and preserve recovery generation. @returns Completion after failure outcomes. */, async function reportsPreWriteFailures(): Promise<void> {
    const leaseStorage = new RecoveryStorageDouble();
    leaseStorage.acquireLease =
      /** Rejects lease acquisition. @returns A promise rejected with the fixture failure. */ async () => {
        throw new Error("lease unavailable");
      };
    const leaseDocument = new RecoveryDocumentDouble("lease-document");
    const leaseRecovery = new AutoRecovery(leaseStorage, { ownerId: "tab" });
    leaseRecovery.RegisterDocument(leaseDocument);
    await expect(leaseRecovery.SaveDocument("lease-document")).resolves.toMatchObject({
      generation: 1,
      status: "failed",
    });
    expect(leaseDocument.failures).toEqual([1]);
    expect(leaseDocument.recoveryGeneration).toBeNull();

    const payloadStorage = new RecoveryStorageDouble();
    const payloadDocument = new MismatchedRecoveryDocumentDouble("payload-document");
    const payloadRecovery = new AutoRecovery(payloadStorage, { ownerId: "tab" });
    payloadRecovery.RegisterDocument(payloadDocument);
    await expect(payloadRecovery.SaveDocument("payload-document")).resolves.toMatchObject({
      generation: 1,
      status: "failed",
    });
    expect(payloadDocument.failures).toEqual([1]);
    expect(payloadStorage.histories.size).toBe(0);

    const generationStorage = new RecoveryStorageDouble();
    const generationDocument = new MismatchedGenerationDocumentDouble("generation-document");
    const generationRecovery = new AutoRecovery(generationStorage, { ownerId: "tab" });
    generationRecovery.RegisterDocument(generationDocument);
    await expect(generationRecovery.SaveDocument("generation-document")).resolves.toMatchObject({
      generation: 1,
      status: "failed",
    });
    expect(generationDocument.failures).toEqual([1]);
  });

  it("supports a single-record recovery adapter without lease extensions" /** Verifies optional history and lease operations have deterministic fallbacks. @returns Completion after save and candidate reads. */, async function supportsMinimalAdapter(): Promise<void> {
    let stored: VersionedStorageRecord<FixtureState> | undefined;
    const storage: RecoverySavePort<FixtureState> = {
      /** Loads the mutable fixture record. @returns Stored snapshot or undefined. */
      load: async () => stored,
      /** Retains one record. @param record - Saved recovery snapshot. @returns Fulfilled completion. */
      save: async (record) => {
        stored = record;
      },
    };
    const document = new RecoveryDocumentDouble("minimal-document");
    const recovery = new AutoRecovery(storage, { ownerId: "tab" });
    recovery.RegisterDocument(document);
    await expect(recovery.GetCandidate("minimal-document")).resolves.toBeUndefined();
    await expect(recovery.SaveDocument("minimal-document")).resolves.toMatchObject({
      status: "saved",
    });
    await expect(recovery.GetCandidate("minimal-document")).resolves.toEqual({
      id: "minimal-document",
      latestGeneration: 1,
      retainedGenerations: 1,
    });
  });

  it("serializes overlapping triggers and prevents another context from overwriting a live lease" /** Verifies in-context queues and cross-context exclusion. @returns Completion after releasing the write gate. */, async function coordinatesWriters(): Promise<void> {
    const storage = new RecoveryStorageDouble();
    const firstDocument = new RecoveryDocumentDouble("shared-document");
    const secondDocument = new RecoveryDocumentDouble("shared-document");
    const first = new AutoRecovery(storage, {
      now: /** Returns deterministic fixture time. @returns Current time. */ () => 100,
      ownerId: "tab-1",
    });
    const second = new AutoRecovery(storage, {
      now: /** Returns deterministic fixture time. @returns Current time. */ () => 100,
      ownerId: "tab-2",
    });
    first.RegisterDocument(firstDocument);
    second.RegisterDocument(secondDocument);
    const gate = createGate();
    storage.saveGate = gate.promise;

    const firstWrite = first.SaveDocument("shared-document");
    await Promise.resolve();
    await Promise.resolve();
    await expect(second.SaveDocument("shared-document")).resolves.toMatchObject({
      status: "locked",
    });
    firstDocument.contentGeneration = 2;
    const queuedWrite = first.SaveDocument("shared-document");
    gate.resolve();
    await expect(firstWrite).resolves.toMatchObject({ generation: 1, status: "saved" });
    await expect(queuedWrite).resolves.toMatchObject({ generation: 2, status: "saved" });
    expect(
      storage.histories.get("shared-document")?.map(
        /** Projects one stored generation. @param record - Stored snapshot. @returns Generation number. */
        (record) => record.version,
      ),
    ).toEqual([2, 1]);
  });

  it("falls back from a damaged latest payload and exposes recovery-choice metadata" /** Verifies crash reload selects the latest intact retained generation. @returns Completion after restore and cleanup. */, async function restoresIntactGeneration(): Promise<void> {
    const storage = new RecoveryStorageDouble();
    storage.histories.set("document-2", [
      { id: "document-2", state: { text: "corrupt" }, version: 3 },
      { id: "document-2", state: { text: "intact" }, version: 2 },
    ]);
    const document = new RecoveryDocumentDouble("document-2");
    const recovery = new AutoRecovery(storage, { ownerId: "tab-1" });
    recovery.RegisterDocument(document);

    await expect(recovery.GetCandidate("document-2")).resolves.toEqual({
      id: "document-2",
      latestGeneration: 3,
      retainedGenerations: 2,
    });
    await expect(recovery.RestoreDocument("document-2")).resolves.toEqual({
      generation: 2,
      id: "document-2",
      status: "restored",
    });
    expect(document.restores).toEqual([2]);
    await recovery.DiscardDocument("document-2");
    await expect(recovery.GetCandidate("document-2")).resolves.toBeUndefined();
    await expect(recovery.RestoreDocument("document-2")).resolves.toEqual({
      id: "document-2",
      status: "missing",
    });

    const damaged = new RecoveryDocumentDouble("damaged-document");
    recovery.RegisterDocument(damaged);
    storage.histories.set("damaged-document", [
      { id: "damaged-document", state: { text: "corrupt" }, version: 2 },
      { id: "damaged-document", state: { text: "corrupt" }, version: 1 },
    ]);
    await expect(recovery.RestoreDocument("damaged-document")).resolves.toEqual({
      id: "damaged-document",
      rejectedGenerations: [2, 1],
      status: "damaged",
    });
  });

  it("owns interval, hidden-page, and pagehide scheduling" /** Verifies browser lifecycle orchestration belongs to the application service. @returns Completion after scheduled writes settle. */, async function schedulesRecovery(): Promise<void> {
    const callbacks: { interval?: () => void; pagehide?: () => void; visibility?: () => void } = {};
    let hidden = false;
    let clearCount = 0;
    const environment: AutoRecoveryEnvironment = {
      clearInterval: /** Records timer cleanup. @returns Nothing. */ () => {
        clearCount += 1;
      },
      isHidden: /** Returns fixture visibility. @returns Whether hidden. */ () => hidden,
      onPageHide:
        /** Captures pagehide listener. @param listener - Scheduled callback. @returns Cleanup. */
        (listener) => {
          callbacks.pagehide = listener;
          return /** Removes the fixture pagehide listener. @returns Nothing. */ () => undefined;
        },
      onVisibilityChange:
        /** Captures visibility listener. @param listener - Scheduled callback. @returns Cleanup. */
        (listener) => {
          callbacks.visibility = listener;
          return /** Removes the fixture visibility listener. @returns Nothing. */ () => undefined;
        },
      setInterval:
        /** Captures interval listener. @param listener - Scheduled callback. @returns Timer handle. */
        (listener) => {
          callbacks.interval = listener;
          return 7;
        },
    };
    const storage = new RecoveryStorageDouble();
    const document = new RecoveryDocumentDouble("scheduled-document");
    const recovery = new AutoRecovery(storage, {
      environment,
      intervalMs: 10,
      ownerId: "tab-1",
    });
    recovery.RegisterDocument(document);
    expect(recovery.Start()).toBe(true);
    expect(recovery.Start()).toBe(false);
    callbacks.visibility?.();
    expect(storage.histories.size).toBe(0);
    hidden = true;
    callbacks.visibility?.();
    await recovery.SaveDocument("scheduled-document");
    expect(document.recoveryGeneration).toBe(1);
    callbacks.interval?.();
    callbacks.pagehide?.();
    recovery.Stop();
    expect(clearCount).toBe(1);
  });
});
