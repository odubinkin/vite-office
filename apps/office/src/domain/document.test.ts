/**
 * @fileoverview Verifies deterministic document identity validation, lifecycle transitions, immutability, and serializability.
 */

import { describe, expect, it } from "vitest";

import { closeDocument, createDocument, markDocumentDirty, markDocumentSaved } from "./document";

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
      id: "doc-1",
      lifecycle: "new",
      revision: 0,
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

  it("transitions open documents deterministically and rejects dirty/save transitions after close" /**
   * Verifies transitions are immutable, idempotent where appropriate, and do not silently reopen documents.
   *
   * @returns Nothing; assertions validate every lifecycle branch.
   */, function transitionsDocuments(): void {
    const created = createFixture();
    const dirty = markDocumentDirty(created);
    const saved = markDocumentSaved(dirty);
    const closed = closeDocument(saved);
    expect(dirty).toMatchObject({ lifecycle: "dirty", revision: 1 });
    expect(markDocumentDirty(dirty)).toBe(dirty);
    expect(saved).toMatchObject({ lifecycle: "saved", revision: 2 });
    expect(markDocumentSaved(saved)).toBe(saved);
    expect(closed).toMatchObject({ lifecycle: "closed", revision: 3 });
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
    expect(created).toMatchObject({ lifecycle: "new", revision: 0 });
  });
});
