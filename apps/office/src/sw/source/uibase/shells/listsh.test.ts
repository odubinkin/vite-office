/** @fileoverview Verifies immutable Promote and Demote list-level transitions at the Writer `listsh.cxx` boundary. */

import { describe, expect, it } from "vitest";

import { createDocument } from "../../../../sfx2/source/doc/document";
import {
  appendWriterParagraph,
  createWriterDocument,
  type WriterDocument,
} from "../../core/doc/writer";
import { WRITER_MAX_LIST_LEVEL } from "../../core/doc/list";
import { changeWriterParagraphListLevel } from "./listsh";

/** Creates a Writer fixture with one nested numbered paragraph and one ordinary sibling. @returns Immutable Writer fixture. */
function createListLevelFixture(): WriterDocument {
  const writer = appendWriterParagraph(
    createWriterDocument(
      createDocument({ id: "writer-list-level", suiteId: "writer", title: "Writer" }),
      "p-1",
    ),
    "p-2",
  );
  const paragraph = writer.paragraphs[0];
  if (paragraph === undefined)
    throw new Error("List-level fixture requires its initial paragraph.");
  return {
    ...writer,
    paragraphs: [
      { ...paragraph, list: { kind: "numbered", level: 1 } },
      ...writer.paragraphs.slice(1),
    ],
  };
}

describe("Writer list shell" /** Groups bounded Writer Promote and Demote command tests. @returns Nothing; Vitest registers the enclosed cases. */, function defineWriterListShellTests(): void {
  it("promotes and demotes only an active list paragraph without changing its presentation kind" /** Verifies list-level commands are immutable, dirtying, and history-ready. @returns Nothing; command result assertions execute. */, function changesWriterListLevel(): void {
    const writer = createListLevelFixture();
    const demoted = changeWriterParagraphListLevel(writer, "p-1", "demote");
    const promoted = changeWriterParagraphListLevel(demoted, "p-1", "promote");
    expect(demoted.document.lifecycle).toBe("dirty");
    expect(demoted.paragraphs[0]?.list).toEqual({ kind: "numbered", level: 2 });
    expect(demoted.paragraphs[1]).toBe(writer.paragraphs[1]);
    expect(promoted.paragraphs[0]?.list).toEqual({ kind: "numbered", level: 1 });
  });

  it("keeps non-list and bounded commands as no-ops while rejecting invalid requests" /** Verifies commands cannot create a list or exceed the bounded nesting contract. @returns Nothing; no-op and error paths are asserted. */, function guardsWriterListLevel(): void {
    const writer = createListLevelFixture();
    const root = {
      ...writer,
      paragraphs: [
        {
          ...(writer.paragraphs[0] as NonNullable<(typeof writer.paragraphs)[number]>),
          list: { kind: "bullet" as const, level: 0 },
        },
      ],
    };
    const deepest = {
      ...writer,
      paragraphs: [
        {
          ...(writer.paragraphs[0] as NonNullable<(typeof writer.paragraphs)[number]>),
          list: { kind: "bullet" as const, level: WRITER_MAX_LIST_LEVEL },
        },
      ],
    };
    const ordinary = {
      ...writer,
      paragraphs: [
        {
          ...(writer.paragraphs[0] as NonNullable<(typeof writer.paragraphs)[number]>),
          list: { kind: "none" as const, level: 0 },
        },
      ],
    };
    expect(changeWriterParagraphListLevel(root, "p-1", "promote")).toBe(root);
    expect(changeWriterParagraphListLevel(deepest, "p-1", "demote")).toBe(deepest);
    expect(changeWriterParagraphListLevel(ordinary, "p-1", "demote")).toBe(ordinary);
    expect(
      /** Executes the missing-paragraph level-command rejection. @returns Invalid list-level command result that always throws. */
      function changesMissingParagraphLevel(): WriterDocument {
        return changeWriterParagraphListLevel(writer, "missing", "demote");
      },
    ).toThrowError();
    expect(
      /** Executes the unsupported level-command rejection. @returns Invalid list-level command result that always throws. */
      function changesUnsupportedListLevel(): WriterDocument {
        return changeWriterParagraphListLevel(writer, "p-1", "restart" as "demote");
      },
    ).toThrowError();
  });
});
