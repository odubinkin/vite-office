/** @fileoverview Verifies target-only Writer snapshot orchestration over generic storage. */

import { describe, expect, it } from "vitest";

import { createDocument } from "../../../../sfx2/source/doc/objsh";
import type {
  DocumentSnapshot,
  PrimarySavePort,
  StoredDocumentOpenPort,
} from "../../../../sfx2/source/doc/docfile";
import { SwDocShell } from "../../uibase/app/docsh";
import { SwWrtShell } from "../../uibase/wrtsh/wrtsh";
import { createWriterDocument, type SwDoc as WriterDocument } from "./doc";
import {
  createWriterSnapshot,
  loadWriterDocument,
  restoreWriterSnapshot,
  saveWriterDocument,
  type WriterSnapshotState,
} from "../../filter/basflt/writer-storage";

/** Live target-schema storage fixture. */
interface WriterFixture {
  readonly document: WriterDocument;
  readonly shell: SwDocShell;
}

/** Creates one dirty model through the public shell/undo path. @returns Live fixture. */
function createWriterFixture(): WriterFixture {
  const document = createWriterDocument("p-1");
  const state = createDocument({ id: "writer-store", suiteId: "writer", title: "Writer" });
  const shell = new SwDocShell(document, state);
  new SwWrtShell(shell).Insert("Saved text");
  return { document, shell };
}

/** Creates an in-memory generic storage adapter. @param initialSnapshot - Optional initial state. @returns Test adapter. */
function createAdapter(
  initialSnapshot?: DocumentSnapshot<WriterSnapshotState>,
): PrimarySavePort<WriterSnapshotState> & StoredDocumentOpenPort<WriterSnapshotState> {
  let snapshot = initialSnapshot;
  return {
    load: /** Loads one matching snapshot. @param id - Requested identity. @returns Stored snapshot. */ async (
      id,
    ) => (snapshot?.id === id ? snapshot : undefined),
    save: /** Retains one snapshot. @param nextSnapshot - New snapshot. @returns Completion. */ async (
      nextSnapshot,
    ) => {
      snapshot = nextSnapshot;
    },
  };
}

describe("Writer storage orchestration", /** Registers storage tests. @returns Nothing. */ () => {
  it("saves and loads the split shell/model target schema", /** Verifies current-schema persistence. @returns Completion after assertions. */ async () => {
    const adapter = createAdapter();
    const fixture = createWriterFixture();
    const state = fixture.shell.GetDocumentState();
    const saved = await saveWriterDocument(adapter, fixture.document, state);
    expect(saved.snapshot).toMatchObject({
      id: "writer-store",
      state: {
        baselineCommit: "9bc445578031fecf56086729d8e4940c77e14d65",
        baselineTag: "libreoffice-26.8.0.2",
        codec: "vite-office.writer-browser-storage",
        documentState: { contentGeneration: 1, id: "writer-store", isModified: true },
        modelVersion: 10,
        schemaVersion: 8,
        writerModel: { swModelVersion: 11 },
      },
      version: 1,
    });
    expect(fixture.document).not.toHaveProperty("document");
    const loaded = await loadWriterDocument(adapter, "writer-store");
    expect(loaded.status).toBe("found");
    if (loaded.status === "found") {
      expect(loaded.document.paragraphs).toMatchObject([{ text: "Saved text" }]);
      expect(loaded.documentState).toMatchObject({ isModified: false, savedGeneration: 1 });
    }
    await expect(loadWriterDocument(adapter, "missing")).resolves.toEqual({
      id: "missing",
      status: "missing",
    });
  });

  it("does not acknowledge a failed primary save", /** Verifies failed-write behavior. @returns Completion after assertions. */ async () => {
    const fixture = createWriterFixture();
    const failure = new Error("write failed");
    const adapter: PrimarySavePort<WriterSnapshotState> = {
      save: /** Rejects the write. @returns Rejected completion. */ async () => {
        throw failure;
      },
    };
    await expect(
      saveWriterDocument(adapter, fixture.document, fixture.shell.GetDocumentState()),
    ).rejects.toBe(failure);
    expect(fixture.shell.GetDocumentState()).toMatchObject({
      isModified: true,
      savedGeneration: null,
    });
  });

  it("restores recovery state without acknowledging the primary medium", /** Verifies recovery ownership. @returns Nothing. */ () => {
    const fixture = createWriterFixture();
    const snapshot = createWriterSnapshot(fixture.document, fixture.shell.GetDocumentState());
    const recovered = restoreWriterSnapshot(snapshot, "recovery");
    expect(recovered.documentState).toMatchObject({
      isModified: true,
      recoveryGeneration: 1,
      savedGeneration: null,
    });
    expect(
      /** Restores a mismatched identity. @returns Invalid result. */ () =>
        restoreWriterSnapshot({ ...snapshot, id: "other" }, "recovery"),
    ).toThrow("identity");
    expect(
      /** Restores a mismatched generation. @returns Invalid result. */ () =>
        restoreWriterSnapshot({ ...snapshot, version: 2 }, "recovery"),
    ).toThrow("generation");
  });

  it("rejects every retired snapshot root instead of adapting it", /** Verifies strict schema rejection. @returns Nothing. */ () => {
    const fixture = createWriterFixture();
    const current = createWriterSnapshot(fixture.document, fixture.shell.GetDocumentState());
    const oldState = {
      document: fixture.shell.GetDocumentState(),
      swModelVersion: 3,
      textNodes: [],
    } as unknown as WriterSnapshotState;
    expect(
      /** Restores a retired combined root. @returns Invalid result. */ () =>
        restoreWriterSnapshot({ ...current, state: oldState }, "primary"),
    ).toThrow("schema is unsupported");
    const wrongSchema = {
      ...current,
      state: { ...current.state, schemaVersion: 7 as 8 },
    };
    expect(
      /** Restores an unknown schema version. @returns Invalid result. */ () =>
        restoreWriterSnapshot(wrongSchema, "primary"),
    ).toThrow("schema is unsupported");
    const retiredEnvelopes = [
      { ...current.state, codec: "writer.snapshot.v1" },
      { ...current.state, modelVersion: 9 },
      { ...current.state, baselineTag: "libreoffice-25.2.0.0" },
      { ...current.state, baselineCommit: "wrong-id-schema" },
    ];
    for (const state of retiredEnvelopes)
      expect(
        /** Rejects one non-current storage identity without migration. @returns Invalid result. */ () =>
          restoreWriterSnapshot({ ...current, state: state as WriterSnapshotState }, "primary"),
      ).toThrow("schema is unsupported");
  });

  it("rejects malformed target lifecycle records" /** Exercises target-schema runtime validation without legacy fallbacks. @returns Nothing. */, function rejectsMalformedLifecycle(): void {
    const fixture = createWriterFixture();
    const current = createWriterSnapshot(fixture.document, fixture.shell.GetDocumentState());
    const state = current.state.documentState as unknown as Record<string, unknown>;
    const invalidStates: unknown[] = [
      null,
      [],
      "invalid",
      { ...state, contentGeneration: 0.5 },
      { ...state, id: 7 },
      { ...state, isModified: "yes" },
      { ...state, lifecycle: "retired" },
      { ...state, recoveryGeneration: "none" },
      { ...state, savedGeneration: "none" },
      { ...state, suiteId: 7 },
      { ...state, title: 7 },
    ];
    for (const documentState of invalidStates)
      expect(
        /** Restores one malformed target record. @returns Invalid result. */ () =>
          restoreWriterSnapshot(
            {
              ...current,
              state: {
                ...current.state,
                documentState: documentState as WriterSnapshotState["documentState"],
              },
            },
            "primary",
          ),
      ).toThrow("lifecycle state is invalid");

    for (const lifecycle of ["new", "saved"] as const) {
      const restored = restoreWriterSnapshot(
        {
          ...current,
          state: {
            ...current.state,
            documentState: {
              ...state,
              lifecycle,
              recoveryGeneration: 0,
              savedGeneration: 0,
            } as WriterSnapshotState["documentState"],
          },
        },
        "primary",
      );
      expect(restored.documentState.lifecycle).toBe("saved");
    }
    expect(
      /** Reaches lifecycle transition validation after accepting the closed discriminator. @returns Invalid result. */ () =>
        restoreWriterSnapshot(
          {
            ...current,
            state: {
              ...current.state,
              documentState: {
                ...state,
                lifecycle: "closed",
              } as WriterSnapshotState["documentState"],
            },
          },
          "primary",
        ),
    ).toThrow("Closed documents");
  });

  it("round-trips current list state", /** Verifies current list persistence. @returns Completion after assertions. */ async () => {
    const adapter = createAdapter();
    const fixture = createWriterFixture();
    new SwWrtShell(fixture.shell).SetParagraphListKind("numbered");
    await saveWriterDocument(adapter, fixture.document, fixture.shell.GetDocumentState());
    await expect(loadWriterDocument(adapter, "writer-store")).resolves.toMatchObject({
      document: { paragraphs: [{ list: { kind: "numbered", level: 0 } }] },
      status: "found",
    });
  });
});
