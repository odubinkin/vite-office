/** @fileoverview Verifies immutable Promote and Demote list-level transitions at the Writer `listsh.cxx` boundary. */

import { describe, expect, it } from "vitest";

import { createDocument } from "../../../../sfx2/source/doc/docfac";
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
  paragraph.SetParagraphList({ kind: "numbered", level: 1 });
  return writer;
}

describe("Writer list shell" /** Groups bounded Writer Promote and Demote command tests. @returns Nothing; Vitest registers the enclosed cases. */, function defineWriterListShellTests(): void {
  it("promotes and demotes only an active list paragraph without changing its presentation kind" /** Verifies list-level commands are immutable, dirtying, and history-ready. @returns Nothing; command result assertions execute. */, function changesWriterListLevel(): void {
    const writer = createListLevelFixture();
    const demoted = changeWriterParagraphListLevel(writer, "p-1", "demote");
    const promoted = changeWriterParagraphListLevel(demoted, "p-1", "promote");
    expect(demoted.document.lifecycle).toBe("dirty");
    expect(demoted.paragraphs[0]?.list).toEqual({ kind: "numbered", level: 2 });
    expect(demoted.paragraphs[1]).toMatchObject({ id: "p-2" });
    expect(promoted.paragraphs[0]?.list).toEqual({ kind: "numbered", level: 1 });
  });

  it("keeps non-list and bounded commands as no-ops while rejecting invalid requests" /** Verifies commands cannot create a list or exceed the bounded nesting contract. @returns Nothing; no-op and error paths are asserted. */, function guardsWriterListLevel(): void {
    const writer = createListLevelFixture();
    const root = withList(writer, "bullet", 0);
    const deepest = withList(writer, "bullet", WRITER_MAX_LIST_LEVEL);
    const ordinary = withList(writer, "none", 0);
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

/** Clones a list fixture and changes its first SwTextNode list items. @param writer - Source SwDoc. @param kind - List kind. @param level - List level. @returns Independent fixture. */
function withList(
  writer: WriterDocument,
  kind: "bullet" | "none" | "numbered",
  level: number,
): WriterDocument {
  const clone = writer.clone();
  const paragraph = clone.paragraphs[0];
  if (paragraph === undefined) throw new Error("List fixture requires one paragraph.");
  paragraph.SetParagraphList({ kind, level });
  return clone;
}
