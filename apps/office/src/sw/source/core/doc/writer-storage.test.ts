/** @fileoverview Verifies Writer snapshot save and load orchestration over an injected browser storage contract. */

import { describe, expect, it } from "vitest";

import { createDocument } from "../../../../sfx2/source/doc/docfac";
import type { DocumentSnapshot, DocumentStorageAdapter } from "../../../../sfx2/source/doc/docfile";
import {
  createWriterDocument,
  insertWriterText,
  serializeWriterDocument,
  type WriterDocument,
} from "./writer";
import { setWriterParagraphListKind } from "../../uibase/shells/txtnum";
import {
  createWriterSnapshot,
  loadWriterDocument,
  restoreWriterSnapshot,
  saveWriterDocument,
  type WriterSnapshotState,
} from "./writer-storage";

/** Creates a serializable Writer fixture with a dirty text body. @returns Immutable Writer document fixture. */
function createWriterFixture(): WriterDocument {
  return insertWriterText(
    createWriterDocument(
      createDocument({ id: "writer-store", suiteId: "writer", title: "Writer" }),
      "p-1",
    ),
    "p-1",
    0,
    "Saved text",
  );
}

/** Creates an in-memory implementation of the generic storage boundary. @param initialSnapshot - Optional initial stored snapshot. @returns Mutable test adapter. */
function createAdapter(
  initialSnapshot?: DocumentSnapshot<WriterSnapshotState>,
): DocumentStorageAdapter<WriterSnapshotState> {
  let snapshot = initialSnapshot;
  return {
    /** Reads the snapshot only when its identifier matches. @param id - Queried ID. @returns Matching snapshot or undefined. */
    load: async function load(
      id: string,
    ): Promise<DocumentSnapshot<WriterSnapshotState> | undefined> {
      return snapshot?.id === id ? snapshot : undefined;
    },
    /** Retains a snapshot for the next test read. @param nextSnapshot - Snapshot to retain. @returns Fulfilled write promise. */
    save: async function save(nextSnapshot: DocumentSnapshot<WriterSnapshotState>): Promise<void> {
      snapshot = nextSnapshot;
    },
  };
}

describe("Writer storage orchestration" /** Groups Writer snapshot behavior. @returns Nothing; Vitest registers cases. */, function defineWriterStorageTests(): void {
  it("saves a Writer snapshot and loads its document or an explicit missing outcome" /** Verifies identity, content generation, state round trip, and missing behavior. @returns Nothing; assertions validate outcomes. */, async function savesAndLoads(): Promise<void> {
    const adapter = createAdapter();
    const writerDocument = createWriterFixture();
    const saved = await saveWriterDocument(adapter, writerDocument);
    expect(saved.snapshot).toMatchObject({
      id: "writer-store",
      version: 1,
      state: { writerDocument: { swModelVersion: 3 } },
    });
    expect(saved.writerDocument.document).toMatchObject({
      contentGeneration: 1,
      isModified: false,
      savedGeneration: 1,
    });
    const loaded = await loadWriterDocument(adapter, "writer-store");
    expect(loaded.status).toBe("found");
    if (loaded.status === "found") {
      expect(serializeWriterDocument(loaded.writerDocument)).toEqual(
        serializeWriterDocument(saved.writerDocument),
      );
      expect(loaded.writerDocument.document.isModified).toBe(false);
    }
    await expect(loadWriterDocument(adapter, "missing")).resolves.toEqual({
      id: "missing",
      status: "missing",
    });
  });

  it("does not acknowledge a failed primary save" /** Verifies savedGeneration advances only after adapter success. @returns A promise resolved after failure identity and lifecycle are asserted. */, async function preservesFailedSaveState(): Promise<void> {
    const writerDocument = createWriterFixture();
    const failure = new Error("write failed");
    const adapter: DocumentStorageAdapter<WriterSnapshotState> = {
      /** Returns no existing snapshot. @returns A promise resolving without a snapshot. */
      load: async function load(): Promise<undefined> {
        return undefined;
      },
      /** Simulates a rejected primary-medium write. @returns A promise that rejects with the fixture failure. */
      save: async function save(): Promise<void> {
        throw failure;
      },
    };

    await expect(saveWriterDocument(adapter, writerDocument)).rejects.toBe(failure);
    expect(writerDocument.document).toMatchObject({ isModified: true, savedGeneration: null });
  });

  it("restores recovery payloads without acknowledging the primary medium" /** Verifies recovery and primary lifecycle checkpoints remain independent. @returns Nothing; assertions inspect restored metadata. */, function restoresRecoverySnapshot(): void {
    const writerDocument = createWriterFixture();
    const snapshot = createWriterSnapshot(writerDocument);
    const recovered = restoreWriterSnapshot(snapshot, "recovery");

    expect(recovered.document).toMatchObject({
      contentGeneration: 1,
      isModified: true,
      recoveryGeneration: 1,
      savedGeneration: null,
    });
    expect(
      /** Restores a mismatched storage identity. @returns Invalid graph that never returns. */ () =>
        restoreWriterSnapshot({ ...snapshot, id: "other" }, "recovery"),
    ).toThrow("identity");
    expect(
      /** Restores a mismatched storage generation. @returns Invalid graph that never returns. */ () =>
        restoreWriterSnapshot({ ...snapshot, version: 2 }, "recovery"),
    ).toThrow("generation");
  });

  it("round-trips canonical list state" /** Verifies storage retains executable list state in the current schema. @returns A promise resolved after the snapshot is asserted. */, async function storesLists(): Promise<void> {
    const adapter = createAdapter();
    const listedWriter = setWriterParagraphListKind(createWriterFixture(), "p-1", "numbered");
    await saveWriterDocument(adapter, listedWriter);
    await expect(loadWriterDocument(adapter, "writer-store")).resolves.toMatchObject({
      status: "found",
      writerDocument: { paragraphs: [{ list: { kind: "numbered", level: 0 } }] },
    });
  });
});
