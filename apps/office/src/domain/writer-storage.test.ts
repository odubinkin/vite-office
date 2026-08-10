/** @fileoverview Verifies Writer snapshot save and load orchestration over an injected browser storage contract. */

import { describe, expect, it } from "vitest";

import { createDocument } from "./document";
import type { DocumentSnapshot, DocumentStorageAdapter } from "./storage";
import { createWriterDocument, insertWriterText, type WriterDocument } from "./writer";
import { loadWriterDocument, saveWriterDocument, type WriterSnapshotState } from "./writer-storage";

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

/** Creates an in-memory implementation of the generic storage boundary. @returns Mutable test adapter. */
function createAdapter(): DocumentStorageAdapter<WriterSnapshotState> {
  let snapshot: DocumentSnapshot<WriterSnapshotState> | undefined;
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
  it("saves a Writer snapshot and loads its document or an explicit missing outcome" /** Verifies identity, revision, state round trip, and missing behavior. @returns Nothing; assertions validate outcomes. */, async function savesAndLoads(): Promise<void> {
    const adapter = createAdapter();
    const writerDocument = createWriterFixture();
    const saved = await saveWriterDocument(adapter, writerDocument);
    expect(saved.snapshot).toMatchObject({
      id: "writer-store",
      version: 1,
      state: { writerDocument },
    });
    await expect(loadWriterDocument(adapter, "writer-store")).resolves.toEqual({
      status: "found",
      writerDocument,
    });
    await expect(loadWriterDocument(adapter, "missing")).resolves.toEqual({
      id: "missing",
      status: "missing",
    });
  });
});
