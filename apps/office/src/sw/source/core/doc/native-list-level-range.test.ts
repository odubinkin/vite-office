/** @fileoverview Verifies native SwNodes list-level ranges and signed-delta undo without upstream access. */
import { afterEach, describe, expect, it, vi } from "vitest";
import { createWriterDocument } from "./doc";
import { SwDocShell } from "../../uibase/app/docsh";
import { SwWrtShell } from "../../uibase/wrtsh/wrtsh1";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { SwPaM, SwPosition } from "../crsr/pam";
import type { SwTextNode } from "../txtnode/ndtxt";
import { SwUndoNumUpDown } from "../undo/unnum";
import { canChangeWriterParagraphListLevel } from "../edit/ednumber";

const documents: ReturnType<typeof createWriterDocument>[] = [];
afterEach(
  /** Releases native owners. @returns Nothing. */ () => {
    vi.restoreAllMocks();
    for (const doc of documents.splice(0)) doc.Dispose();
  },
);
/** Builds body, two real cell sections and an outside paragraph. @returns Native owners. */
function fixture() {
  const doc = createWriterDocument();
  documents.push(doc);
  const body = doc.paragraphs[0];
  if (body === undefined) throw new Error("Missing body");
  body.SetText("Body");
  const table = doc.nodes.MakeTableNode("Table1", {}, body);
  table.AddColumnWidth(3000);
  table.AddColumnWidth(3000);
  const row = doc.nodes.AppendTableRow(table, 2),
    first = row.GetTabBoxes()[0]?.GetParagraphs()[0],
    second = row.GetTabBoxes()[1]?.GetParagraphs()[0];
  if (first === undefined || second === undefined) throw new Error("Missing cells");
  first.SetText("First");
  second.SetText("Second");
  const outside = doc.nodes.MakeTextNode("Outside");
  const docShell = new SwDocShell(
      doc,
      createDocument({ id: "native-level", suiteId: "writer", title: "Level" }),
    ),
    shell = new SwWrtShell(docShell);
  for (const node of [first, second, outside]) {
    shell.FocusNode(node);
    shell.SetParagraphListKind("numbered");
  }
  docShell.GetUndoManager().Clear();
  shell.FocusNode(first);
  return { doc, body, first, second, outside, docShell, shell };
}
/** Assigns actual native selection coordinates. @param shell - Persistent shell. @param point - Moving node. @param mark - Optional fixed node. @returns Nothing. */
function select(shell: SwWrtShell, point: SwTextNode, mark?: SwTextNode) {
  const moving = new SwPosition(point, 1),
    anchor = mark === undefined ? undefined : new SwPosition(mark, 0);
  try {
    shell.SetPaM(moving, anchor);
  } finally {
    moving.Dispose();
    anchor?.Dispose();
  }
}
describe("native list-level node ranges", /** Registers actual range contracts. @returns Nothing. */ () => {
  it.each([false, true])(
    "changes both real cell nodes atomically with reversed=%s",
    /** Checks inclusive cells separated by structural nodes. @param reversed - Direction. @returns Nothing. */ (
      reversed,
    ) => {
      const owner = fixture();
      owner.first.SetAttrListLevel(2);
      owner.second.SetAttrListLevel(4);
      select(
        owner.shell,
        reversed ? owner.first : owner.second,
        reversed ? owner.second : owner.first,
      );
      const ids = [owner.first.GetListId(), owner.second.GetListId()];
      expect(owner.doc.paragraphs).not.toContain(owner.first);
      expect(canChangeWriterParagraphListLevel(owner.shell, "demote")).toBe(true);
      expect(owner.shell.ChangeParagraphIndent(true)).toBe(true);
      expect([owner.first.GetAttrListLevel(), owner.second.GetAttrListLevel()]).toEqual([3, 5]);
      expect(owner.outside.GetAttrListLevel()).toBe(0);
      expect(owner.body.GetListKind()).toBe("none");
      expect([owner.first.GetListId(), owner.second.GetListId()]).toEqual(ids);
      expect(owner.docShell.GetUndoManager().GetUndoActionCount()).toBe(1);
      const action = owner.docShell.GetUndoManager().GetUndoAction();
      expect(action).toBeInstanceOf(SwUndoNumUpDown);
      expect(action?.GetPayloadSize()).toBe(5);
      expect(action?.GetComment()).toBe("Demote list level");
      expect(owner.shell.Undo()).toBe(true);
      expect([owner.first.GetAttrListLevel(), owner.second.GetAttrListLevel()]).toEqual([2, 4]);
      expect(owner.shell.GetCursor().GetPoint().GetNode()).toBe(
        reversed ? owner.first : owner.second,
      );
      expect(owner.shell.GetCursor().GetMark().GetNode()).toBe(
        reversed ? owner.second : owner.first,
      );
      expect(owner.shell.Redo()).toBe(true);
      expect([owner.first.GetAttrListLevel(), owner.second.GetAttrListLevel()]).toEqual([3, 5]);
      expect(owner.shell.ChangeParagraphListLevel("promote")).toBe(true);
      expect(owner.docShell.GetUndoManager().GetUndoAction()?.GetComment()).toBe(
        "Promote list level",
      );
      expect([owner.first.GetAttrListLevel(), owner.second.GetAttrListLevel()]).toEqual([2, 4]);
    },
  );
  it.each([
    { down: true, boundary: 9 },
    { down: false, boundary: 0 },
  ])(
    "validates every selected node before mutation at boundary=$boundary",
    /** Checks no partial update,history or notification. @param input - Native limit. @param input.down - Direction. @param input.boundary - Limiting level. @returns Nothing. */ ({
      down,
      boundary,
    }) => {
      const owner = fixture();
      owner.first.SetAttrListLevel(2);
      owner.second.SetAttrListLevel(boundary);
      select(owner.shell, owner.second, owner.first);
      const revision = owner.doc.GetDocumentStateManager().GetModelRevision();
      expect(owner.doc.CanNumUpDown(owner.shell.GetCursor(), down)).toBe(false);
      expect(owner.shell.NumUpDown(down)).toBe(false);
      expect(owner.doc.NumUpDown(owner.shell.GetCursor(), down)).toBe(false);
      expect([owner.first.GetAttrListLevel(), owner.second.GetAttrListLevel()]).toEqual([
        2,
        boundary,
      ]);
      expect(owner.doc.GetDocumentStateManager().GetModelRevision()).toBe(revision);
      expect(owner.docShell.GetUndoManager().GetUndoActionCount()).toBe(0);
    },
  );
  it("changes a collapsed cell and reverses only its level without old metadata snapshots", /** Checks delta history preserves later unrelated native metadata. @returns Nothing. */ () => {
    const owner = fixture();
    owner.first.SetListRestart(true);
    owner.first.SetAttrListRestartValue(7);
    owner.first.SetCountedInList(false);
    select(owner.shell, owner.first);
    const rule = owner.first.GetNumRule(),
      id = owner.first.GetListId(),
      capture = vi.spyOn(owner.first, "CaptureListItems");
    expect(owner.shell.NumUpDown(true)).toBe(true);
    expect(owner.first.GetAttrListLevel()).toBe(1);
    owner.first.SetAttrListRestartValue(3);
    expect(owner.shell.Undo()).toBe(true);
    expect(owner.first.GetAttrListLevel()).toBe(0);
    expect(owner.first.GetAttrListRestartValue()).toBe(3);
    expect(owner.first.IsListRestart()).toBe(true);
    expect(owner.first.IsCountedInList()).toBe(false);
    expect(owner.shell.Redo()).toBe(true);
    expect(owner.first.GetAttrListLevel()).toBe(1);
    expect(owner.first.GetAttrListRestartValue()).toBe(3);
    expect(owner.first.GetNumRule()).toBe(rule);
    expect(owner.first.GetListId()).toBe(id);
    expect(capture).not.toHaveBeenCalled();
    expect(owner.shell.GetCursor().HasMark()).toBe(false);
    expect(owner.shell.GetCursor().GetPoint().GetContentIndex()).toBe(1);
    expect(owner.second.GetAttrListLevel()).toBe(0);
  });
  it("includes selected body and cell owners across structural gaps and zero end offsets", /** Checks native paragraph operations retain an inclusive end node. @returns Nothing. */ () => {
    const owner = fixture();
    owner.shell.FocusNode(owner.body);
    owner.shell.SetParagraphListKind("bullet");
    const point = new SwPosition(owner.second, 0),
      mark = new SwPosition(owner.body, 2),
      range = new SwPaM(point, mark);
    try {
      expect(owner.doc.NumUpDown(range, true)).toBe(true);
      expect([
        owner.body.GetAttrListLevel(),
        owner.first.GetAttrListLevel(),
        owner.second.GetAttrListLevel(),
      ]).toEqual([1, 1, 1]);
      expect(owner.outside.GetAttrListLevel()).toBe(0);
    } finally {
      range.Dispose();
      point.Dispose();
      mark.Dispose();
    }
  });
  it("rejects foreign node arrays and reports no transition for ordinary unlisted text", /** Checks actual range ownership and no empty synthetic history. @returns Nothing. */ () => {
    const owner = fixture();
    owner.shell.FocusNode(owner.body);
    expect(owner.doc.CanNumUpDown(owner.shell.GetCursor(), true)).toBe(false);
    expect(owner.doc.NumUpDown(owner.shell.GetCursor(), true)).toBe(false);
    const foreign = createWriterDocument();
    documents.push(foreign);
    const node = foreign.paragraphs[0];
    if (node === undefined) throw new Error("Missing foreign node");
    const pos = new SwPosition(node, 0),
      range = new SwPaM(pos);
    try {
      expect(
        /** Supplies an invalid foreign native range. @returns Native query result. */ () =>
          owner.doc.CanNumUpDown(range, true),
      ).toThrow("another node array");
    } finally {
      range.Dispose();
      pos.Dispose();
    }
    expect(
      /** Supplies an unsupported operation identity. @returns Shell result. */ () =>
        owner.shell.ChangeParagraphListLevel("invalid" as "demote"),
    ).toThrow("Unsupported Writer list-level command");
  });
});
