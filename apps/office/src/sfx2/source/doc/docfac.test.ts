/**
 * @fileoverview Verifies deterministic document-factory identity validation, lifecycle transitions, immutability, and serializability.
 */

import { describe, expect, it } from "vitest";

import {
  closeDocument,
  createDocument,
  markDocumentDirty,
  markDocumentHistoryRestored,
  markDocumentHistorySavePosition,
  markDocumentRecoverySaved,
  markDocumentSaved,
} from "./docfac";

/**
 * Creates a valid Writer document fixture for lifecycle tests.
 *
 * @returns New immutable Writer document fixture.
 */
function createFixture() {
  return createDocument({ id: "doc-1", suiteId: "writer", title: "Untitled Writer Document" });
}

describe("document lifecycle" /**
 * Groups pure serializable document lifecycle contract tests.
 *
 * @returns Nothing; Vitest registers enclosed cases.
 */, function defineDocumentLifecycleTests(): void {
  it("creates a serializable new document and rejects blank identity metadata" /**
   * Verifies creation retains caller metadata without introducing non-serializable runtime objects.
   *
   * @returns Nothing; assertions validate document creation behavior.
   */, function createsDocuments(): void {
    const document = createFixture();
    expect(document).toEqual({
      contentGeneration: 0,
      id: "doc-1",
      isModified: false,
      lifecycle: "new",
      recoveryGeneration: null,
      savedGeneration: null,
      suiteId: "writer",
      title: "Untitled Writer Document",
    });
    expect(JSON.parse(JSON.stringify(document))).toEqual(document);
    expect(
      /**
       * Attempts document creation with blank identity metadata.
       *
       * @returns Invalid document creation result that never returns.
       */
      function createsBlankId() {
        return createDocument({ ...document, id: " " });
      },
    ).toThrowError();
    expect(
      /**
       * Attempts document creation with a blank title.
       *
       * @returns Invalid document creation result that never returns.
       */
      function createsBlankTitle() {
        return createDocument({ ...document, title: " " });
      },
    ).toThrowError();
  });

  it("advances every dirty mutation and acknowledges primary and recovery saves independently" /**
   * Verifies content, primary-save, and recovery generations remain independent and immutable.
   *
   * @returns Nothing; assertions validate every lifecycle branch.
   */, function transitionsDocuments(): void {
    const created = createFixture();
    const dirty = markDocumentDirty(created);
    const dirtier = markDocumentDirty(dirty);
    const recovered = markDocumentRecoverySaved(dirtier);
    const staleSave = markDocumentSaved(recovered, dirty.contentGeneration);
    const saved = markDocumentSaved(staleSave);
    const closed = closeDocument(saved);
    expect(dirty).toMatchObject({ contentGeneration: 1, isModified: true, lifecycle: "dirty" });
    expect(dirtier).toMatchObject({ contentGeneration: 2, isModified: true, lifecycle: "dirty" });
    expect(recovered).toMatchObject({ contentGeneration: 2, recoveryGeneration: 2 });
    expect(staleSave).toMatchObject({
      contentGeneration: 2,
      isModified: true,
      lifecycle: "dirty",
      savedGeneration: 1,
    });
    expect(markDocumentSaved(staleSave, 1)).toBe(staleSave);
    expect(saved).toMatchObject({
      contentGeneration: 2,
      isModified: false,
      lifecycle: "saved",
      recoveryGeneration: 2,
      savedGeneration: 2,
    });
    expect(markDocumentSaved(saved)).toBe(saved);
    expect(markDocumentSaved({ ...saved, lifecycle: "dirty" })).toMatchObject({
      isModified: false,
      lifecycle: "saved",
      savedGeneration: 2,
    });
    expect(markDocumentSaved({ ...saved, isModified: true, lifecycle: "dirty" })).toMatchObject({
      isModified: false,
      lifecycle: "saved",
      savedGeneration: 2,
    });
    expect(markDocumentRecoverySaved(recovered)).toBe(recovered);
    expect(markDocumentHistorySavePosition(saved, true)).toBe(saved);
    expect(markDocumentHistorySavePosition(saved, false)).toMatchObject({
      isModified: true,
      lifecycle: "dirty",
    });
    expect(closed).toMatchObject({ contentGeneration: 2, lifecycle: "closed" });
    expect(closeDocument(closed)).toBe(closed);
    expect(
      /**
       * Attempts an invalid dirty transition after close.
       *
       * @returns Invalid transition result that never returns.
       */
      function dirtiesClosedDocument() {
        return markDocumentDirty(closed);
      },
    ).toThrowError();
    expect(
      /**
       * Attempts an invalid saved transition after close.
       *
       * @returns Invalid transition result that never returns.
       */
      function savesClosedDocument() {
        return markDocumentSaved(closed);
      },
    ).toThrowError();
    expect(created).toMatchObject({ contentGeneration: 0, lifecycle: "new" });
  });

  it("treats undo and redo restorations as new generations while preserving saved-state meaning" /**
   * Verifies restored content may be clean or dirty without rewinding the monotonic mutation counter.
   *
   * @returns Nothing; assertions cover clean and dirty history targets.
   */, function restoresHistoryGenerations(): void {
    const created = createFixture();
    const firstEdit = markDocumentDirty(created);
    const saved = markDocumentSaved(firstEdit);
    const secondEdit = markDocumentDirty(saved);
    const undo = markDocumentHistoryRestored(secondEdit, saved);
    const redo = markDocumentHistoryRestored(undo, secondEdit);

    expect(undo).toMatchObject({
      contentGeneration: 3,
      isModified: false,
      lifecycle: "saved",
      savedGeneration: 1,
    });
    expect(redo).toMatchObject({
      contentGeneration: 4,
      isModified: true,
      lifecycle: "dirty",
      savedGeneration: 1,
    });
  });

  it("rejects nonexistent persistence generations and cross-document history" /**
   * Verifies acknowledgements cannot invent content and history cannot replace stable identity.
   *
   * @returns Nothing; each invalid boundary throws deterministically.
   */, function rejectsInvalidGenerationsAndHistory(): void {
    const created = createFixture();
    const dirty = markDocumentDirty(created);
    for (const generation of [-1, 0.5, 2]) {
      expect(
        /** Attempts to acknowledge a generation outside the existing integral range. @returns Invalid transition that never returns. */
        function savesInvalidGeneration() {
          return markDocumentSaved(dirty, generation);
        },
      ).toThrowError("Saved generation must identify existing document content.");
    }
    expect(
      /** Attempts to restore history from a different stable identity. @returns Invalid transition that never returns. */
      function restoresOtherDocument() {
        return markDocumentHistoryRestored(
          dirty,
          createDocument({ id: "doc-2", suiteId: "writer", title: "Other" }),
        );
      },
    ).toThrowError("History document identity must remain stable.");
    expect(
      /** Attempts recovery acknowledgement after document close. @returns Invalid transition that never returns. */
      function recoversClosedDocument() {
        return markDocumentRecoverySaved(closeDocument(dirty));
      },
    ).toThrowError("Closed documents cannot transition.");
    expect(
      /** Attempts to move a save mark on a closed history entry. @returns Invalid transition that never returns. */
      function marksClosedHistoryPosition() {
        return markDocumentHistorySavePosition(closeDocument(dirty), true);
      },
    ).toThrowError("Closed documents cannot transition.");
  });
});
