/** @fileoverview Verifies native marked-list owners and depth notification order without invoking upstream. */
import { afterEach, expect, it, vi } from "vitest";
import { SwDoc } from "./doc";
import { applyWriterParagraphList, WRITER_MAX_LIST_LEVEL } from "./list";
import { subscribeToSwModify } from "../../../inc/calbck";
import { SwDocShell } from "../../uibase/app/docsh";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { createWriterNumRule } from "./DocumentListsManager";
const docs: SwDoc[] = [];
afterEach(
  /** Releases native fixtures. @returns Nothing. */ () => {
    vi.restoreAllMocks();
    for (const doc of docs.splice(0)) doc.Dispose();
  },
);
/** Creates actual list members at separate native depths plus an unrelated list. @returns Existing native owners. */
function fixture() {
  const doc = new SwDoc();
  docs.push(doc);
  const nodes = [0, 1, 0, 2].map(
    /** Creates one real text-owned numbering record. @param level - Native depth. @param index - Document order. @returns Text member. */ (
      level,
      index,
    ) => {
      const node = doc.GetNodes().MakeTextNode(`Item${index}`);
      applyWriterParagraphList(node, {
        kind: "bullet",
        level,
        ruleName: "Marked rule",
        listId: "marked",
      });
      return node;
    },
  );
  const foreign = doc.GetNodes().MakeTextNode("Foreign");
  applyWriterParagraphList(foreign, {
    kind: "numbered",
    level: 0,
    ruleName: "Foreign rule",
    listId: "foreign",
  });
  const list = doc.GetDocumentListsManager().GetListByName("marked");
  if (list === undefined) throw Error("Missing native list");
  const events: { nodeIndex: number; marked: boolean }[] = [];
  const stop = subscribeToSwModify(
    doc.GetDocumentStateManager(),
    /** Observes real native notifications and their current owner state. @param _source - Native publisher. @param hint - Native hint. @returns Nothing. */ (
      _source,
      hint,
    ) => {
      if (hint.kind === "numbering-changed" && hint.nodeIndex !== undefined) {
        const node = nodes.find(
          /** Resolves the existing notified member. @param member - Original node. @returns Whether matched. */ (
            member,
          ) => member.GetIndex() === hint.nodeIndex,
        );
        if (node !== undefined)
          events.push({ nodeIndex: node.GetIndex(), marked: node.HasMarkedLabel() });
      }
    },
  );
  doc.GetUndoManager().Clear();
  return { doc, nodes, foreign, list, events, stop };
}
it("native MAXLEVEL sentinel and plain membership never fabricate marked labels", /** Checks defaults and missing owner delegation. @returns Nothing. */ () => {
  const f = fixture();
  expect(f.list.IsListLevelMarked(WRITER_MAX_LIST_LEVEL + 1)).toBe(true);
  expect(
    f.nodes.map(
      /** Reads each actual label. @param node - Member. @returns Native state. */ (node) =>
        node.HasMarkedLabel(),
    ),
  ).toEqual([false, false, false, false]);
  expect(f.doc.paragraphs[0]?.HasMarkedLabel()).toBe(false);
  f.doc.MarkListLevel("missing", 0, true);
  expect(f.events).toEqual([]);
  expect(f.doc.GetDocumentListsManager().GetListByName("missing")).toBeUndefined();
  f.doc.MarkListLevel("marked", 0, false);
  f.doc.MarkListLevel("marked", 10, true);
  expect(f.events).toEqual([]);
  expect(f.foreign.HasMarkedLabel()).toBe(false);
  f.stop();
});
it("native switch and clear preserve former-before-update and new-after-update notifications", /** Checks exact source callback ordering with actual members and vectors. @returns Nothing. */ () => {
  const f = fixture(),
    vectors = f.nodes.map(
      /** Captures native counters by value. @param node - Member. @returns Vector. */ (node) =>
        node.GetNumberVector(),
    );
  const [first, child, last] = f.nodes;
  if (first === undefined || child === undefined || last === undefined)
    throw Error("Missing members");
  f.doc.MarkListLevel("marked", 0, true);
  expect(f.events).toEqual([
    { nodeIndex: first.GetIndex(), marked: true },
    { nodeIndex: last.GetIndex(), marked: true },
  ]);
  f.events.length = 0;
  f.doc.MarkListLevel("marked", 0, true);
  expect(f.events).toEqual([]);
  f.doc.MarkListLevel("marked", 1, true);
  expect(f.events).toEqual([
    { nodeIndex: first.GetIndex(), marked: true },
    { nodeIndex: last.GetIndex(), marked: true },
    { nodeIndex: child.GetIndex(), marked: true },
  ]);
  expect(first.HasMarkedLabel()).toBe(false);
  expect(child.HasMarkedLabel()).toBe(true);
  f.events.length = 0;
  f.doc.MarkListLevel("marked", 9, false);
  expect(f.events).toEqual([{ nodeIndex: child.GetIndex(), marked: true }]);
  expect(child.HasMarkedLabel()).toBe(false);
  f.events.length = 0;
  f.doc.MarkListLevel("marked", 1, false);
  expect(f.events).toEqual([]);
  expect(
    f.nodes.map(
      /** Reads current native vectors. @param node - Member. @returns Vector. */ (node) =>
        node.GetNumberVector(),
    ),
  ).toEqual(vectors);
  expect(f.foreign.HasMarkedLabel()).toBe(false);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  f.stop();
});
it("native depth notifications use the root even when called on a descendant and traverse skipped phantom levels", /** Checks actual hierarchy without flat list scans. @returns Nothing. */ () => {
  const f = fixture(),
    first = f.nodes[0],
    deep = f.nodes[3];
  if (first === undefined || deep === undefined) throw Error("Missing members");
  const item = deep.GetNum();
  if (item === undefined) throw Error("Missing owned number record");
  f.doc.MarkListLevel("marked", 2, true);
  expect(deep.HasMarkedLabel()).toBe(true);
  f.events.length = 0;
  item.NotifyNodesOnListLevel(0);
  expect(
    f.events.map(
      /** Reads notified identities. @param event - Actual event. @returns Native index. */ (
        event,
      ) => event.nodeIndex,
    ),
  ).toEqual([first.GetIndex(), f.nodes[2]?.GetIndex()]);
  f.events.length = 0;
  item.NotifyNodesOnListLevel(2);
  expect(f.events).toEqual([{ nodeIndex: deep.GetIndex(), marked: true }]);
  f.events.length = 0;
  item.NotifyNodesOnListLevel(-1);
  item.NotifyNodesOnListLevel(99);
  expect(f.events).toEqual([]);
  f.stop();
});
it("native marking retains unbounded state and uses its specific depth notifications during reading", /** Checks source absence of generic notification-policy gates and clamps. @returns Nothing. */ () => {
  const f = fixture(),
    first = f.nodes[0];
  if (first === undefined) throw Error("Missing member");
  f.doc.SetInReading(true);
  f.doc.MarkListLevel("marked", 0, true);
  expect(f.events).toHaveLength(2);
  expect(first.HasMarkedLabel()).toBe(true);
  f.events.length = 0;
  f.doc.MarkListLevel("marked", -1, true);
  expect(f.events).toHaveLength(2);
  expect(f.list.IsListLevelMarked(-1)).toBe(true);
  expect(first.HasMarkedLabel()).toBe(false);
  f.events.length = 0;
  f.doc.MarkListLevel("marked", 99, true);
  expect(f.events).toEqual([]);
  expect(f.list.IsListLevelMarked(99)).toBe(true);
  f.doc.MarkListLevel("marked", 0, false);
  expect(f.list.IsListLevelMarked(10)).toBe(true);
  f.doc.SetInReading(false);
  f.stop();
});
it("native HasMarkedLabel reads existing membership and tolerates a missing list owner", /** Checks stale lookup and removal without changing document list ownership. @returns Nothing. */ () => {
  const f = fixture(),
    first = f.nodes[0];
  if (first === undefined) throw Error("Missing member");
  f.doc.MarkListLevel("marked", 0, true);
  expect(first.HasMarkedLabel()).toBe(true);
  const lookup = vi
    .spyOn(f.doc.GetDocumentListsManager(), "GetListByName")
    .mockReturnValue(undefined);
  expect(first.HasMarkedLabel()).toBe(false);
  lookup.mockRestore();
  expect(first.HasMarkedLabel()).toBe(true);
  first.RemoveFromList();
  expect(first.HasMarkedLabel()).toBe(false);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  f.stop();
});

it("native list repaint preserves shell content generation while genuine edits and mixed transactions advance it", /** Checks the real shell subscriber across view invalidation and serialization changes. @returns Nothing. */ () => {
  const f = fixture(),
    first = f.nodes[0];
  if (first === undefined) throw Error("Missing member");
  const shell = new SwDocShell(
    f.doc,
    createDocument({ id: "marked-shell", suiteId: "writer", title: "Marked" }),
  );
  docs.splice(docs.indexOf(f.doc), 1);
  const hints: string[] = [];
  const stop = shell.Subscribe(
    /** Records actual shell deliveries. @param hint - Republished notification. @returns Nothing. */ (
      hint,
    ) => {
      hints.push(hint.kind);
      if (hint.kind === "model-transaction")
        for (const nested of hint.hints) hints.push(nested.kind);
    },
  );
  try {
    const generation = shell.GetContentGeneration();
    f.doc.MarkListLevel("marked", 0, true);
    f.doc.MarkListLevel("marked", 1, true);
    f.doc.MarkListLevel("marked", 9, false);
    f.doc.RunModelTransaction(
      /** Batches native repaint and cursor invalidation without editing content. @returns Nothing. */ () => {
        first.GetNum()?.NotifyNodesOnListLevel(0);
        f.doc.NotifyModelChange({ kind: "cursor-selection-changed" });
      },
    );
    expect(f.events.length).toBeGreaterThan(0);
    expect(hints).toContain("numbering-changed");
    expect(hints).toContain("model-transaction");
    expect(shell.IsModified()).toBe(false);
    expect(shell.GetContentGeneration()).toBe(generation);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    first.InsertText("edited", 0);
    expect(shell.IsModified()).toBe(true);
    let previous = shell.GetContentGeneration();
    first.SetParagraphTextLeftMargin(360);
    expect(shell.GetContentGeneration()).toBeGreaterThan(previous);
    previous = shell.GetContentGeneration();
    f.doc.MakeTextFormatColl("New marked style");
    expect(shell.GetContentGeneration()).toBeGreaterThan(previous);
    previous = shell.GetContentGeneration();
    const inserted = f.doc.GetNodes().MakeTextNode("New paragraph");
    expect(shell.GetContentGeneration()).toBeGreaterThan(previous);
    previous = shell.GetContentGeneration();
    f.doc.GetNodes().removeTextNode(inserted);
    expect(shell.GetContentGeneration()).toBeGreaterThan(previous);
    previous = shell.GetContentGeneration();
    f.doc.AddNumRule(createWriterNumRule("New serialized rule"));
    expect(shell.GetContentGeneration()).toBeGreaterThan(previous);
    previous = shell.GetContentGeneration();
    const lineInfo = f.doc.GetLineNumberInfo();
    lineInfo.SetPaintLineNumbers(true);
    f.doc.SetLineNumberInfo(lineInfo);
    expect(shell.GetContentGeneration()).toBeGreaterThan(previous);
    previous = shell.GetContentGeneration();
    f.doc.RunModelTransaction(
      /** Preserves the unqualified numbering mutation contract in a mixed batch. @returns Nothing. */ () => {
        first.NumRuleChgd();
        f.doc.NotifyModelChange({ kind: "numbering-changed" });
      },
    );
    expect(shell.GetContentGeneration()).toBe(previous + 1);
  } finally {
    stop();
    f.stop();
    shell.Close();
  }
});
