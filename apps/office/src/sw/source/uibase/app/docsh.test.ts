/** @fileoverview Verifies target Writer document-shell ownership, notifications, and persistence. */

import { describe, expect, it } from "vitest";

import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import type { DocumentSnapshot, SfxMediumInput } from "../../../../sfx2/source/doc/docfile";
import { createWriterDocument } from "../../core/doc/writer";
import { createWriterSnapshot, type WriterSnapshotState } from "../../core/doc/writer-storage";
import type { OdtFilterService } from "../../filter/xml/odt-filter-service";
import { SwWrtShell } from "../wrtsh/wrtsh";
import { SwDocShell } from "./docsh";

/** Creates deterministic shell-owned document metadata. @param title - Visible title. @param id - Stable identity. @returns Lifecycle state. */
function metadata(title = "Shell document", id = "shell-document") {
  return createDocument({ id, suiteId: "writer", title });
}

/** Creates one model/object-shell pair and optionally edits it through SwWrtShell. @param text - Optional body text. @param title - Visible title. @param id - Stable identity. @returns Live shell fixture. */
function fixture(text = "", title = "Shell document", id = "shell-document") {
  const document = createWriterDocument("p-1");
  const shell = new SwDocShell(document, metadata(title, id));
  const writerShell = new SwWrtShell(shell);
  if (text.length > 0) writerShell.InsertText("p-1", text, text.length, "insertText");
  return { document, shell, writerShell };
}

describe("SwDocShell", /** Registers document-shell tests. @returns Nothing. */ () => {
  it("owns lifecycle outside the model and atomically opens ODT", /** Verifies model/state separation and ODT replacement. @returns Completion after assertions. */ async () => {
    const active = fixture("ODT body");
    expect(active.document).not.toHaveProperty("document");
    expect(active.shell.GetDocumentState()).toMatchObject({
      contentGeneration: 1,
      id: "shell-document",
      isModified: true,
    });
    const bytes = await active.shell.SerializeOdt();
    expect(new ZipFile(bytes).getEntryNames()).toContain("content.xml");

    const fresh = active.shell.InitNew(metadata("New document", "new-document"), "new-p-1");
    expect(fresh.paragraphs).toMatchObject([{ id: "new-p-1", text: "" }]);
    const loaded = await active.shell.Load(bytes, metadata("Fallback", "opened-document"));
    expect(active.shell.GetDoc()).toBe(loaded);
    expect(active.shell.GetDocumentState()).toMatchObject({
      id: "opened-document",
      lifecycle: "saved",
      title: "Shell document",
    });
    expect(loaded.paragraphs[0]?.text).toBe("ODT body");
  });

  it("retains the active graph when ODT loading fails", /** Verifies candidate-first replacement. @returns Completion after assertions. */ async () => {
    const active = fixture();
    await expect(
      active.shell.Load(new Uint8Array([1, 2, 3]), metadata("Broken")),
    ).rejects.toThrow();
    expect(active.shell.GetDoc()).toBe(active.document);
  });

  it("rejects an import superseded by document replacement", /** Verifies stale request rejection. @returns Completion after assertions. */ async () => {
    let resolveImport: ((snapshot: DocumentSnapshot<WriterSnapshotState>) => void) | undefined;
    const filter: OdtFilterService = {
      Cancel: /** Cancels the fake request. @returns Nothing. */ () => undefined,
      Close: /** Closes the fake filter. @returns Nothing. */ () => undefined,
      Export: /** Returns unused bytes. @returns Empty bytes. */ async () => new Uint8Array(),
      Import: /** Defers one candidate snapshot. @returns Pending snapshot. */ () =>
        new Promise(
          /** Captures the resolver. @param resolve - Snapshot resolver. @returns Nothing. */ (
            resolve,
          ) => (resolveImport = resolve),
        ),
    };
    const document = createWriterDocument("p-1");
    const shell = new SwDocShell(document, metadata(), undefined, filter);
    const opening = shell.Open(new Uint8Array([1]), metadata("Incoming"));
    const replacement = shell.InitNew(metadata("Replacement"), "replacement-p-1");
    const candidateState = metadata("Candidate", "candidate");
    resolveImport?.(createWriterSnapshot(createWriterDocument("candidate-p-1"), candidateState));
    await expect(opening).rejects.toMatchObject({ category: "stale" });
    expect(shell.GetDoc()).toBe(replacement);
  });

  it("separates primary save, export, download, and recovery state", /** Verifies independent persistence channels. @returns Completion after assertions. */ async () => {
    const active = fixture("dirty");
    const generation = active.shell.GetDocumentState().contentGeneration;
    await expect(
      active.shell.Save(
        /** Returns unused save evidence. @returns Evidence. */ async () => ({ generation }),
      ),
    ).rejects.toThrow("Save As");
    await active.shell.SaveAs(
      { indexedDbKey: "primary-key", kind: "browser-local", name: "Primary" },
      /** Confirms primary persistence. @returns Evidence. */ async () => ({ generation }),
    );
    expect(active.shell.GetDocumentState()).toMatchObject({
      isModified: false,
      savedGeneration: generation,
    });
    const stableMedium = active.shell.GetMedium();

    active.writerShell.InsertText("p-1", "dirty!", 6, "insertText");
    expect(active.shell.GetMedium()).toBe(stableMedium);
    const changedGeneration = active.shell.GetDocumentState().contentGeneration;
    await active.shell.Export(
      { downloadTarget: "copy.odt", kind: "download", name: "copy.odt" },
      /** Completes export. @returns Nothing. */ () => undefined,
    );
    active.shell.Download(
      { downloadTarget: "copy.odt", kind: "download", name: "copy.odt" },
      /** Starts download. @returns Nothing. */ () => undefined,
    );
    expect(active.shell.GetMedium()).toMatchObject({
      destination: { key: "primary-key", kind: "indexeddb" },
      kind: "browser-local",
      lastOperation: { operation: "download", state: "unconfirmed" },
    });
    expect(active.shell.GetDocumentState().isModified).toBe(true);
    active.shell.AcknowledgeRecoverySave(changedGeneration);
    expect(active.shell.GetDocumentState()).toMatchObject({
      recoveryGeneration: changedGeneration,
      savedGeneration: generation,
    });
  });

  it("keeps a concurrent edit dirty after an older save completes", /** Verifies generation-aware acknowledgement. @returns Completion after assertions. */ async () => {
    const active = fixture();
    active.writerShell.InsertText("p-1", "saved", 5, "insertText");
    const savedGeneration = active.shell.GetDocumentState().contentGeneration;
    let completeWrite: (() => void) | undefined;
    const completed = new Promise<void>(
      /** Captures durable-write completion. @param resolve - Completion callback. @returns Nothing. */ (
        resolve,
      ) => (completeWrite = resolve),
    );
    const saving = active.shell.SaveAs(
      { indexedDbKey: "primary", kind: "browser-local", name: "primary" },
      /** Waits for durable completion. @returns Captured evidence. */ async () => {
        await completed;
        return { generation: savedGeneration };
      },
    );
    active.writerShell.InsertText("p-1", "saved later", 11, "insertText");
    completeWrite?.();
    await saving;
    expect(active.shell.GetDocumentState()).toMatchObject({
      contentGeneration: 2,
      isModified: true,
      savedGeneration: savedGeneration,
    });
  });

  it("rejects invalid save destinations and records failed persistence paths", /** Covers failure state, stale evidence, replacement races, and modified construction. @returns Completion after assertions. */ async () => {
    const dirtyState = {
      ...metadata("Dirty", "dirty"),
      contentGeneration: 1,
      isModified: true,
      lifecycle: "dirty" as const,
    };
    const initiallyDirty = new SwDocShell(createWriterDocument("dirty-p-1"), dirtyState);
    expect(initiallyDirty.GetUndoManager().IsAtSavePosition()).toBe(false);

    const active = fixture("dirty");
    const invalidMedia: SfxMediumInput[] = [
      {
        kind: "odt-source",
        name: "read-only",
        source: { kind: "file", reference: {} },
      },
      { downloadTarget: "unconfirmed.odt", kind: "download", name: "unconfirmed.odt" },
      { kind: "untitled", name: "not-writable" },
    ];
    for (const medium of invalidMedia)
      await expect(
        active.shell.SaveAs(
          medium,
          /** Returns unreachable evidence. @returns Evidence. */ async () => ({ generation: 1 }),
        ),
      ).rejects.toThrow("confirmed writable medium");

    await expect(
      active.shell.Export(
        { downloadTarget: "failed.odt", kind: "download", name: "failed.odt" },
        /** Rejects export with a non-Error platform value. @returns Rejected completion. */ async () =>
          Promise.reject("export failed"),
      ),
    ).rejects.toBe("export failed");
    expect(active.shell.GetMedium().lastOperation).toMatchObject({
      message: "export failed",
      operation: "export",
      state: "failed",
    });
    const mediumBeforeRecoveryFailure = active.shell.GetMedium();
    active.shell.RecoverySaveStarted(1);
    active.shell.RecoverySaveFailed(1, "quota");
    expect(active.shell.GetMedium()).toBe(mediumBeforeRecoveryFailure);
    expect(
      /** Reports a recovery callback for content that does not exist. @returns Invalid callback. */ () =>
        active.shell.RecoverySaveStarted(2),
    ).toThrow("existing document content");

    const stateBeforePrimaryFailure = active.shell.GetDocumentState();
    const mediumBeforePrimaryFailure = active.shell.GetMedium();
    const storageFailure = new Error("primary storage failed");
    await expect(
      active.shell.SaveAs(
        { indexedDbKey: "primary", kind: "browser-local", name: "primary" },
        /** Propagates a durable storage rejection. @returns Rejected completion. */ async () =>
          Promise.reject(storageFailure),
      ),
    ).rejects.toBe(storageFailure);
    expect(active.shell.GetDocumentState()).toBe(stateBeforePrimaryFailure);
    expect(active.shell.GetMedium()).toBe(mediumBeforePrimaryFailure);

    await expect(
      active.shell.SaveAs(
        { indexedDbKey: "primary", kind: "browser-local", name: "primary" },
        /** Returns mismatched evidence. @returns Invalid evidence. */ async () => ({
          generation: 2,
        }),
      ),
    ).rejects.toThrow("does not match");
    expect(active.shell.GetDocumentState()).toBe(stateBeforePrimaryFailure);
    expect(active.shell.GetMedium()).toBe(mediumBeforePrimaryFailure);

    const racing = fixture("racing", "Racing", "racing");
    let completeWrite: (() => void) | undefined;
    const completed = new Promise<void>(
      /** Captures durable-write completion. @param resolve - Completion callback. @returns Nothing. */ (
        resolve,
      ) => (completeWrite = resolve),
    );
    const saving = racing.shell.SaveAs(
      { indexedDbKey: "primary", kind: "browser-local", name: "primary" },
      /** Waits while the active model is replaced. @returns Evidence for the retired model. */ async () => {
        await completed;
        return { generation: 1 };
      },
    );
    racing.shell.InitNew(metadata("Replacement", "replacement"), "replacement-p-1");
    const replacementMedium = racing.shell.GetMedium();
    completeWrite?.();
    await expect(saving).rejects.toThrow("no longer active");
    expect(racing.shell.GetMedium()).toBe(replacementMedium);
    racing.shell.Close();
    racing.shell.Close();
  });

  it("propagates one typed transaction and rejects work after close", /** Verifies typed aggregation and terminal guards. @returns Nothing. */ () => {
    const active = fixture();
    const hints: string[] = [];
    active.shell.Subscribe(
      /** Captures a shell hint. @param hint - Typed hint. @returns New array length. */ (hint) =>
        hints.push(hint.kind),
    );
    active.document.CallSwClientNotify({ kind: "document-disposed" });
    expect(active.shell.GetDocumentState().contentGeneration).toBe(0);
    hints.length = 0;
    active.writerShell.InsertText("p-1", "A", 1, "insertText");
    expect(hints).toEqual(["model-transaction"]);
    expect(active.writerShell.Undo()).toBe(true);
    expect(active.shell.GetDocumentState()).toMatchObject({ contentGeneration: 2 });
    active.writerShell.Close();
    active.shell.Close();
    expect(active.shell.GetDocumentState().lifecycle).toBe("closed");
    expect(
      /** Creates recovery after close. @returns Invalid result. */ () =>
        active.shell.CreateRecoverySnapshot(),
    ).toThrow("Closed document shells");
    expect(
      /** Replaces after close. @returns Invalid result. */ () =>
        active.shell.InitNew(metadata("Other", "other"), "other-p-1"),
    ).toThrow("Closed document shells");
    expect(
      /** Executes a command after close. @returns Invalid result. */ () =>
        active.writerShell.InsertText("p-1", "late", 4, "insertText"),
    ).toThrow("Closed document shells");
  });
});
