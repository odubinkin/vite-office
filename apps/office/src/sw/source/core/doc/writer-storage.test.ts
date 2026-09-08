/** @fileoverview Verifies Writer snapshot save and load orchestration over an injected browser storage contract. */

import { describe, expect, it } from "vitest";

import { createDocument } from "../../../../sfx2/source/doc/docfac";
import type {
  DocumentSnapshot,
  DocumentStorageAdapter,
  SerializableValue,
} from "../../../../sfx2/source/doc/docfile";
import {
  createWriterDocument,
  insertWriterText,
  serializeWriterDocument,
  type WriterDocument,
} from "./writer";
import { setWriterParagraphListKind } from "../../uibase/shells/txtnum";
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
  it("saves a Writer snapshot and loads its document or an explicit missing outcome" /** Verifies identity, revision, state round trip, and missing behavior. @returns Nothing; assertions validate outcomes. */, async function savesAndLoads(): Promise<void> {
    const adapter = createAdapter();
    const writerDocument = createWriterFixture();
    const saved = await saveWriterDocument(adapter, writerDocument);
    expect(saved.snapshot).toMatchObject({
      id: "writer-store",
      version: 1,
      state: { writerDocument: { swModelVersion: 2 } },
    });
    const loaded = await loadWriterDocument(adapter, "writer-store");
    expect(loaded.status).toBe("found");
    if (loaded.status === "found")
      expect(serializeWriterDocument(loaded.writerDocument)).toEqual(
        serializeWriterDocument(writerDocument),
      );
    await expect(loadWriterDocument(adapter, "missing")).resolves.toEqual({
      id: "missing",
      status: "missing",
    });
  });

  it("restores left alignment for a snapshot written before paragraph alignment existed" /**
   * Verifies browser-local documents from the previous Writer body shape remain editable after the model evolves.
   *
   * @returns A promise resolved after the normalized loaded document is asserted.
   */, async function migratesLegacyAlignment(): Promise<void> {
    const writerDocument = createWriterFixture();
    const adapter = createAdapter({
      id: "writer-store",
      state: {
        writerDocument: {
          document: writerDocument.document as unknown as SerializableValue,
          paragraphs: [{ id: "p-1", text: "Saved text" }],
        },
      },
      version: 1,
    });

    await expect(loadWriterDocument(adapter, "writer-store")).resolves.toMatchObject({
      status: "found",
      writerDocument: {
        paragraphs: [{ alignment: "left", id: "p-1", style: "default", text: "Saved text" }],
      },
    });
  });

  it("round-trips list state and defaults a legacy list-less snapshot" /** Verifies storage retains executable lists while evolving prior browser-local bodies. @returns A promise resolved after both snapshot outcomes are asserted. */, async function storesAndMigratesLists(): Promise<void> {
    const adapter = createAdapter();
    const listedWriter = setWriterParagraphListKind(createWriterFixture(), "p-1", "numbered");
    await saveWriterDocument(adapter, listedWriter);
    await expect(loadWriterDocument(adapter, "writer-store")).resolves.toMatchObject({
      status: "found",
      writerDocument: { paragraphs: [{ list: { kind: "numbered", level: 0 } }] },
    });
    const legacyAdapter = createAdapter({
      id: "writer-store",
      state: {
        writerDocument: {
          document: listedWriter.document as unknown as SerializableValue,
          paragraphs: [{ alignment: "left", id: "p-1", style: "default", text: "Saved text" }],
        },
      },
      version: 1,
    });
    await expect(loadWriterDocument(legacyAdapter, "writer-store")).resolves.toMatchObject({
      status: "found",
      writerDocument: { paragraphs: [{ list: { kind: "none", level: 0 } }] },
    });
  });
});
