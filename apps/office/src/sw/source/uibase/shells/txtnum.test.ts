/** @fileoverview Verifies Writer default-list shell command transitions at the `txtnum.cxx`-derived boundary. */

import { describe, expect, it } from "vitest";

import { createDocument } from "../../../../sfx2/source/doc/docfac";
import {
  appendWriterParagraph,
  createWriterDocument,
  type WriterDocument,
} from "../../core/doc/writer";
import { setWriterParagraphListKind } from "./txtnum";

/** Creates a two-paragraph Writer fixture with future list metadata on the second paragraph. @returns Immutable Writer document. */
function createFixture(): WriterDocument {
  const document = appendWriterParagraph(
    createWriterDocument(
      createDocument({ id: "writer-lists", suiteId: "writer", title: "Writer" }),
      "p-1",
    ),
    "p-2",
  );
  const firstParagraph = document.paragraphs[0];
  const secondParagraph = document.paragraphs[1];
  if (firstParagraph === undefined || secondParagraph === undefined)
    throw new Error("Writer list fixture must contain two paragraphs.");
  return {
    ...document,
    paragraphs: [
      firstParagraph,
      { ...secondParagraph, list: { kind: "none", level: 1, styleId: "List 1" } },
    ],
  };
}

describe("Writer numbering shell" /** Groups `.uno:DefaultBullet`, `.uno:DefaultNumbering`, and `.uno:RemoveBullets` transitions. @returns Nothing; Vitest registers enclosed cases. */, function defineWriterNumberingShellTests(): void {
  it("changes only the selected list kind, preserves list metadata, and rejects invalid targets" /** Verifies the first list command layer is immutable and history-ready. @returns Nothing; assertions cover successful, no-op, and rejected shell paths. */, function transitionsLists(): void {
    const writer = createFixture();
    const bullet = setWriterParagraphListKind(writer, "p-2", "bullet");
    const numbered = setWriterParagraphListKind(bullet, "p-2", "numbered");
    const removed = setWriterParagraphListKind(numbered, "p-2", "none");
    expect(bullet.document).toMatchObject({ lifecycle: "dirty" });
    expect(bullet.paragraphs[0]).toBe(writer.paragraphs[0]);
    expect(bullet.paragraphs[1]?.list).toEqual({ kind: "bullet", level: 1, styleId: "List 1" });
    expect(numbered.paragraphs[1]?.list.kind).toBe("numbered");
    expect(removed.paragraphs[1]?.list.kind).toBe("none");
    expect(setWriterParagraphListKind(removed, "p-2", "none")).toBe(removed);
    expect(
      /** Executes the missing-paragraph command rejection. @returns Invalid list command result that always throws. */
      function listsMissingParagraph(): WriterDocument {
        return setWriterParagraphListKind(writer, "missing", "bullet");
      },
    ).toThrowError();
    expect(
      /** Executes the unsupported-list-kind command rejection. @returns Invalid list command result that always throws. */
      function listsUnsupportedKind(): WriterDocument {
        return setWriterParagraphListKind(writer, "p-1", "outline" as "bullet");
      },
    ).toThrowError();
  });
});
