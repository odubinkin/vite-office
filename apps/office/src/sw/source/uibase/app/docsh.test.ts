/** @fileoverview Verifies Writer document-shell ownership around new, ODT load, and ODT save. */

import { describe, expect, it } from "vitest";

import { createDocument } from "../../../../sfx2/source/doc/docfac";
import type { DocumentSnapshot } from "../../../../sfx2/source/doc/docfile";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import { createWriterSnapshot, type WriterSnapshotState } from "../../core/doc/writer-storage";
import { createWriterDocument, type WriterDocument } from "../../core/doc/writer";
import type { OdtFilterService } from "../../filter/xml/odt-filter-service";
import { SwWrtShell } from "../wrtsh/wrtsh";
import { SwDocShell } from "./docsh";

/** Creates deterministic Writer metadata. @param title - Visible title. @param id - Stable identity. @returns New document header. */
function metadata(title = "Shell document", id = "shell-document") {
  return createDocument({ id, suiteId: "writer", title });
}

/** Builds edited test content through the same SwWrtShell and undo path used by production. @param document - Empty canonical document. @param paragraphId - Initial text-node identity. @param text - Complete next text. @returns The same mutated document. */
function editFixture(document: WriterDocument, paragraphId: string, text: string): WriterDocument {
  new SwWrtShell(new SwDocShell(document)).InsertText(paragraphId, text, text.length, "insertText");
  return document;
}

describe("SwDocShell" /** Groups the bounded document-shell lifecycle. @returns Nothing. */, () => {
  it("initializes, saves, and atomically loads Writer documents" /** Verifies document ownership and ODT delegation. @returns A fulfilled assertion promise. */, async () => {
    const source = editFixture(createWriterDocument(metadata(), "p-1"), "p-1", "ODT body");
    const shell = new SwDocShell(source);
    expect(shell.GetDoc()).toBe(source);
    expect(shell.GetMedium()).toMatchObject({
      destinationKind: "none",
      documentId: "shell-document",
      kind: "untitled",
      name: "Shell document",
      origin: "new",
      readOnly: false,
      sourceKind: "none",
    });
    const bytes = await shell.SerializeOdt();
    expect(new ZipFile(bytes).getEntryNames()).toContain("content.xml");

    const empty = shell.InitNew(metadata("New document", "new-document"), "new-p-1");
    expect(empty.paragraphs).toHaveLength(1);
    expect(empty.paragraphs[0]?.text).toBe("");
    const loaded = await shell.Load(bytes, metadata("Fallback", "opened-document"));
    expect(shell.GetDoc()).toBe(loaded);
    expect(loaded.document).toMatchObject({
      id: "opened-document",
      lifecycle: "saved",
      title: "Shell document",
    });
    expect(loaded.paragraphs[0]?.text).toBe("ODT body");
    expect(shell.GetMedium()).toMatchObject({
      destinationKind: "none",
      documentId: "opened-document",
      filterId: "writer8",
      kind: "file",
      mediaType: SwDocShell.ODT_MEDIA_TYPE,
      name: "Fallback",
      origin: "external",
      readOnly: true,
      sourceKind: "file",
    });
  });

  it("retains the active document when ODT loading fails" /** Verifies candidate-first atomic replacement. @returns A fulfilled assertion promise. */, async () => {
    const active = createWriterDocument(metadata(), "p-1");
    const shell = new SwDocShell(active);
    await expect(shell.Load(new Uint8Array([1, 2, 3]), metadata("Broken"))).rejects.toThrow();
    expect(shell.GetDoc()).toBe(active);
  });

  it("rejects an import result superseded by document replacement" /** Verifies the main-thread request generation guard. @returns Completion after stale rejection. */, async () => {
    let resolveImport: ((snapshot: DocumentSnapshot<WriterSnapshotState>) => void) | undefined;
    const filter: OdtFilterService = {
      /** Marks the fake request cancelled without resolving it. @returns Nothing. */
      Cancel: () => undefined,
      /** Closes the fake service. @returns Nothing. */
      Close: () => undefined,
      /** Provides unused deterministic export bytes. @returns Empty bytes. */
      Export: async () => new Uint8Array(),
      /** Defers the candidate snapshot. @returns Pending snapshot. */
      Import: () =>
        new Promise(
          /** Captures the import resolver. @param resolve - Promise resolver. @returns Nothing. */ (
            resolve,
          ) => {
            resolveImport = resolve;
          },
        ),
    };
    const active = createWriterDocument(metadata(), "p-1");
    const shell = new SwDocShell(active, undefined, filter);
    const opening = shell.Open(new Uint8Array([1]), metadata("Incoming"));
    const replacement = shell.InitNew(metadata("Replacement"), "replacement-p-1");
    resolveImport?.(
      createWriterSnapshot(createWriterDocument(metadata("Candidate"), "candidate-p-1")),
    );
    await expect(opening).rejects.toMatchObject({ category: "stale" });
    expect(shell.GetDoc()).toBe(replacement);
  });

  it("separates Save, Save As, Export, Download, and recovery acknowledgement" /** Verifies LibreOffice-like primary-medium adoption and non-primary store semantics. @returns Completion after asynchronous medium operations. */, async function separatesMediumOperations(): Promise<void> {
    const dirty = editFixture(createWriterDocument(metadata(), "p-1"), "p-1", "dirty");
    const shell = new SwDocShell(dirty);
    const initialGeneration = dirty.document.contentGeneration;
    await expect(
      shell.Save(
        /** Represents an unreachable untitled-medium write. @returns Unused evidence. */ async () => ({
          generation: 0,
        }),
      ),
    ).rejects.toThrow("Save As");
    await expect(
      shell.SaveAs(
        { kind: "file", name: "download-only.odt" },
        /** Represents an unreachable download-only Save As. @returns Unused evidence. */ async () => ({
          generation: 0,
        }),
      ),
    ).rejects.toThrow("confirmed writable");

    const primaryWrites: number[] = [];
    await shell.SaveAs(
      { indexedDbKey: "primary-key", kind: "browser-local", name: "Primary" },
      /** Records a confirmed browser-local write. @param document - Persisted Writer graph. @param medium - Candidate primary medium. @returns Fulfilled completion. */
      async (document, medium) => {
        primaryWrites.push(document.document.contentGeneration);
        expect(medium.indexedDbKey).toBe("primary-key");
        return { generation: document.document.contentGeneration };
      },
    );
    expect(primaryWrites).toEqual([initialGeneration]);
    expect(shell.GetDoc().document).toMatchObject({
      isModified: false,
      recoveryGeneration: null,
      savedGeneration: initialGeneration,
    });
    expect(shell.GetMedium()).toMatchObject({
      indexedDbKey: "primary-key",
      kind: "browser-local",
      lastOperation: { operation: "save-as", state: "succeeded" },
    });

    const writerShell = new SwWrtShell(shell);
    writerShell.InsertText("p-1", "!", 5, "insertText");
    const changedGeneration = shell.GetDoc().document.contentGeneration;
    const failure = new Error("quota exceeded");
    await expect(
      shell.Save(
        /** Rejects a primary write. @returns A promise rejected with the fixture failure. */ async () => {
          throw failure;
        },
      ),
    ).rejects.toBe(failure);
    expect(shell.GetDoc().document).toMatchObject({
      contentGeneration: changedGeneration,
      isModified: true,
      savedGeneration: initialGeneration,
    });
    expect(shell.GetMedium().lastOperation).toMatchObject({
      generation: changedGeneration,
      operation: "save",
      state: "failed",
    });

    await shell.Export(
      {
        destinationKind: "download",
        kind: "file",
        name: "copy.odt",
        readOnly: true,
        sourceKind: "none",
      },
      /** Represents a completed export copy. @returns Nothing. */ () => undefined,
    );
    expect(shell.GetMedium()).toMatchObject({
      indexedDbKey: "primary-key",
      kind: "browser-local",
      lastOperation: { operation: "export", state: "succeeded" },
    });
    expect(shell.GetDoc().document.isModified).toBe(true);
    await expect(
      shell.Export(
        { destinationKind: "download", kind: "file", name: "failed.odt" },
        /** Rejects an export copy. @returns A promise rejected with the fixture failure. */ async () => {
          throw failure;
        },
      ),
    ).rejects.toBe(failure);
    expect(shell.GetMedium()).toMatchObject({
      indexedDbKey: "primary-key",
      kind: "browser-local",
      lastOperation: { operation: "export", state: "failed" },
    });

    shell.Download(
      {
        destinationKind: "download",
        downloadTarget: "copy.odt",
        kind: "file",
        name: "copy.odt",
        readOnly: true,
        sourceKind: "none",
      },
      /** Represents a successful click dispatch with unknown transfer completion. @returns Nothing. */ () =>
        undefined,
    );
    expect(shell.GetMedium()).toMatchObject({
      indexedDbKey: "primary-key",
      kind: "browser-local",
      lastOperation: { operation: "download", state: "unconfirmed" },
    });
    expect(shell.GetDoc().document.savedGeneration).toBe(initialGeneration);

    shell.RecoverySaveStarted(changedGeneration);
    shell.RecoverySaveFailed(changedGeneration, failure);
    expect(shell.GetDoc().document.recoveryGeneration).toBeNull();
    shell.AcknowledgeRecoverySave(changedGeneration);
    expect(shell.GetDoc().document).toMatchObject({
      isModified: true,
      recoveryGeneration: changedGeneration,
      savedGeneration: initialGeneration,
    });
    expect(shell.AcknowledgeRecoverySave(changedGeneration)).toBe(false);
  });

  it("acknowledges the exact generation and undo boundary captured before an asynchronous save" /** Verifies a concurrent edit stays dirty and Undo can return to the confirmed primary-medium state. @returns Completion after the deferred write resolves. */, async function preservesConcurrentMutation(): Promise<void> {
    const document = createWriterDocument(metadata(), "p-1");
    const shell = new SwDocShell(document, {
      indexedDbKey: "shell-document",
      kind: "browser-local",
      name: "Shell document",
    });
    const writerShell = new SwWrtShell(shell);
    writerShell.InsertText("p-1", "saved", 5, "insertText");
    const savedGeneration = document.document.contentGeneration;
    let completeWrite: (() => void) | undefined;
    const writeCompleted = new Promise<void>(
      /** Retains the completion callback for the simulated durable write. @param resolve - Promise resolver. @returns Nothing. */ (
        resolve,
      ) => {
        completeWrite = resolve;
      },
    );
    const saving = shell.Save(
      /** Captures storage evidence before waiting for the simulated commit. @param current - Live document passed to the adapter. @returns Evidence for the committed snapshot. */ async (
        current,
      ) => {
        const evidence = { generation: current.document.contentGeneration };
        await writeCompleted;
        return evidence;
      },
    );

    writerShell.InsertText("p-1", "saved later", 11, "insertText");
    completeWrite?.();
    await saving;

    expect(shell.GetDoc()).toBe(document);
    expect(document.document).toMatchObject({
      contentGeneration: 2,
      isModified: true,
      recoveryGeneration: null,
      savedGeneration,
    });
    expect(writerShell.Undo()).toBe(true);
    expect(document.paragraphs[0]?.text).toBe("saved");
    expect(document.document).toMatchObject({ isModified: false, savedGeneration });
  });

  it("rejects mismatched or stale primary-save evidence without acknowledging the active document" /** Verifies delayed adapter results cannot move a save mark onto the wrong generation or replacement graph. @returns Completion after both invalid saves reject. */, async function rejectsInvalidSaveEvidence(): Promise<void> {
    const document = createWriterDocument(metadata(), "p-1");
    const shell = new SwDocShell(document, {
      indexedDbKey: "shell-document",
      kind: "browser-local",
      name: "Shell document",
    });
    const writerShell = new SwWrtShell(shell);
    writerShell.InsertText("p-1", "dirty", 5, "insertText");
    await expect(
      shell.Save(
        /** Returns evidence for a generation other than the requested snapshot. @returns Invalid evidence. */ async () => ({
          generation: 0,
        }),
      ),
    ).rejects.toThrow("does not match");
    expect(document.document).toMatchObject({ isModified: true, savedGeneration: null });

    let completeWrite: (() => void) | undefined;
    const writeCompleted = new Promise<void>(
      /** Retains completion of the stale-document write. @param resolve - Promise resolver. @returns Nothing. */ (
        resolve,
      ) => {
        completeWrite = resolve;
      },
    );
    const saving = shell.Save(
      /** Defers evidence for the document that was active at save start. @param current - Original graph. @returns Original generation evidence. */ async (
        current,
      ) => {
        const evidence = { generation: current.document.contentGeneration };
        await writeCompleted;
        return evidence;
      },
    );
    const replacement = shell.InitNew(metadata("Replacement", "replacement"), "replacement-p-1");
    completeWrite?.();
    await expect(saving).rejects.toThrow("no longer active");
    expect(shell.GetDoc()).toBe(replacement);
    expect(replacement.document.savedGeneration).toBeNull();
  });

  it("coordinates history and document invalidation for one persistent shell" /** Verifies mutation ownership, no-op transitions, history replacement, subscription cleanup, and medium replacement. @returns A fulfilled assertion promise. */, async function coordinatesPersistentHistory(): Promise<void> {
    const initial = createWriterDocument(metadata(), "p-1");
    const shell = new SwDocShell(initial, { kind: "browser-local", name: "shell-document" });
    const writerShell = new SwWrtShell(shell);
    let invalidations = 0;
    const unsubscribe = shell.Subscribe(
      /** Counts one document-shell invalidation. @returns Nothing. */ () => {
        invalidations += 1;
      },
    );
    expect(writerShell.InsertText("p-1", "A", 1, "insertText")).toBe(true);
    expect(shell.GetDoc()).toBe(initial);
    expect(shell.GetUndoManager().GetUndoActionCount()).toBe(1);
    expect(writerShell.Undo()).toBe(true);
    expect(shell.GetDoc().paragraphs[0]?.text).toBe("");
    expect(writerShell.Undo()).toBe(false);
    expect(invalidations).toBe(2);
    await shell.SaveAs(
      { kind: "browser-local", name: "shell-document" },
      /** Confirms the generation accepted by the test primary medium. @param savedDocument - Captured live Writer graph. @returns Matching storage evidence. */ async (
        savedDocument,
      ) => ({ generation: savedDocument.document.contentGeneration }),
    );
    expect(shell.GetDoc().document.isModified).toBe(false);
    expect(invalidations).toBe(4);
    unsubscribe();
    shell.InitNew(metadata("Replacement", "replacement"), "replacement-p-1");
    expect(invalidations).toBe(4);
    shell.Close();
  });

  it("clears the save position for dirty replacement documents" /** Verifies constructor and replacement history start away from a primary-medium save boundary. @returns Nothing. */, function replacesWithDirtyDocuments(): void {
    const dirty = editFixture(createWriterDocument(metadata(), "p-1"), "p-1", "dirty");
    const shell = new SwDocShell(dirty);
    expect(shell.GetUndoManager().IsAtSavePosition()).toBe(false);
    const replacement = editFixture(
      createWriterDocument(metadata("Replacement", "replacement"), "replacement-p-1"),
      "replacement-p-1",
      "changed",
    );
    shell.ReplaceDocument(replacement, { kind: "browser-local", name: "replacement" });
    expect(shell.GetUndoManager().IsAtSavePosition()).toBe(false);
  });
});
