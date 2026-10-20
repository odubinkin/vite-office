/** @fileoverview Source contracts for real collapsed-bookmark replacement history and partition ownership. Expanded/typed mark histories are not represented. */
import { expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwDocShell } from "../../uibase/app/docsh";
import { SwWrtShell } from "../../uibase/wrtsh/wrtsh1";
import { SwPaM, SwPosition } from "../crsr/pam";
import { SwUndoSaveContent, DelContentType } from "./undobj";
import { SwHistory, SwHistoryBookmark, SwHistoryHint, HISTORY_HINT } from "./rolbck";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import type { SwTextNode } from "../txtnode/ndtxt";
/** Constructs actual document/history/shell owners. @param text - Initial text. @returns Real owners. */
function fixture(text = "abcdef") {
  const doc = new SwDoc(),
    node = doc.paragraphs[0] as SwTextNode;
  node.SetText(text);
  const docShell = new SwDocShell(
      doc,
      createDocument({ id: "bookmark-replace", suiteId: "writer", title: "Bookmark replace" }),
    ),
    shell = new SwWrtShell(docShell);
  return { doc, node, docShell, shell };
}
/** Actual marked range. @param node - Text owner. @param start - Inclusive start. @param end - Exclusive end. @returns Owned range. */
function range(node: SwTextNode, start: number, end: number): SwPaM {
  const first = new SwPosition(node, start),
    last = new SwPosition(node, end);
  try {
    return new SwPaM(first, last);
  } finally {
    first.Dispose();
    last.Dispose();
  }
}
/** Reads source-coordinate mark positions without retaining stale mark objects. @param doc - Real document. @returns Name/offset pairs in manager order. */
function marks(doc: SwDoc): readonly (readonly [string, number])[] {
  return doc
    .GetIDocumentMarkAccess()
    .GetBookmarks()
    .map(
      /** Reads actual names/indices. @param mark - Current owner. @returns Source pair. */ (
        mark,
      ) => [mark.GetName(), mark.GetMarkPos().GetContentIndex()] as const,
    );
}
it.each([
  [1, 4, "XYZ", "aXYZef", 4, 5],
  [1, 3, "12345", "a12345def", 6, 8],
  [1, 4, "x", "axef", 2, 3],
  [1, 4, "", "aef", 1, 2],
  [1, 4, "bcd", "abcdef", 4, 5],
] as const)(
  "retains native bookmark boundary and repeated hint rollback %i/%i/%j",
  /** Original mark prefix is destructively rolled back while original hints are moved away and back each cycle. @param start - Native start. @param end - Native end. @param inserted - Literal replacement. @param text - Expected text. @param afterEnd - End bookmark after replacement. @param afterTail - Tail bookmark after replacement. @returns Nothing. */ (
    start,
    end,
    inserted,
    text,
    afterEnd,
    afterTail,
  ) => {
    const f = fixture(),
      access = f.doc.GetIDocumentMarkAccess();
    f.node.ToggleTextRangeFormat(0, 6, "bold");
    for (const [name, pos] of [
      ["before", 0],
      ["start", start],
      ["inside", start + 1],
      ["end", end],
      ["tail", 5],
    ] as const)
      access.MakeMark(f.node, pos, name);
    const original = marks(f.doc),
      selection = range(f.node, start, end);
    try {
      expect(
        f.doc.GetDocumentContentOperationsManager().ReplaceRange(selection, inserted, false),
      ).toBe(true);
      expect(f.node.GetText()).toBe(text);
      expect(marks(f.doc)).toEqual([
        ["before", 0],
        ["end", afterEnd],
        ["tail", afterTail],
      ]);
      for (let cycle = 0; cycle < 3; ++cycle) {
        expect(f.shell.Undo()).toBe(true);
        expect(f.node.GetText()).toBe("abcdef");
        expect(marks(f.doc)).toEqual(original);
        expect(
          f.node
            .GetpSwpHints()
            ?.entries()
            .map(
              /** Reads reconstructed whole attributes. @param hint - Current hint. @returns Bounds. */ (
                hint,
              ) => [hint.GetStart(), hint.GetAnyEnd()],
            ),
        ).toEqual([[0, 6]]);
        expect(f.shell.Redo()).toBe(true);
        expect(f.node.GetText()).toBe(text);
        expect(marks(f.doc)).toEqual([
          ["before", 0],
          ["end", afterEnd],
          ["tail", afterTail],
        ]);
      }
    } finally {
      selection.Dispose();
      f.shell.Close();
      f.docShell.Close();
    }
  },
);
it.each([true, false])(
  "retains source recording-dependent collapsed bookmark deletion undo=%s",
  /** DelContentIndex is a replacement-undo constructor side effect; the no-recording string operation does not call it. @param enabled - Native recording state. @returns Nothing. */ (
    enabled,
  ) => {
    const f = fixture("abc"),
      access = f.doc.GetIDocumentMarkAccess(),
      selection = range(f.node, 0, 2);
    access.MakeMark(f.node, 0, "start");
    access.MakeMark(f.node, 1, "inside");
    access.MakeMark(f.node, 2, "end");
    f.doc.GetUndoManager().DoUndo(enabled);
    try {
      expect(f.doc.GetDocumentContentOperationsManager().ReplaceRange(selection, "xy", false)).toBe(
        true,
      );
      expect(marks(f.doc)).toEqual(
        enabled
          ? [["end", 2]]
          : [
              ["start", 0],
              ["inside", 1],
              ["end", 2],
            ],
      );
      expect(f.doc.GetUndoManager().DoesUndo()).toBe(enabled);
    } finally {
      selection.Dispose();
      f.shell.Close();
      f.docShell.Close();
    }
  },
);
it("uses the Replace bookmark exception inside a node and ordinary insertion at paragraph end", /** Native ReplaceText and InsertString branches have distinct boundary movement. @returns Nothing. */ () => {
  const f = fixture("abc"),
    access = f.doc.GetIDocumentMarkAccess();
  f.doc.GetUndoManager().DoUndo(false);
  access.MakeMark(f.node, 1, "interior");
  const fragmentPosition = new SwPosition(f.node, 1);
  try {
    f.doc
      .GetDocumentContentOperationsManager()
      .InsertTextFragment(fragmentPosition, f.node.CaptureTextFragment(0, 1));
  } finally {
    fragmentPosition.Dispose();
  }
  expect(access.FindMark("interior")?.GetMarkPos().GetContentIndex()).toBe(1);
  f.node.InsertText("x", 1);
  expect(access.FindMark("interior")?.GetMarkPos().GetContentIndex()).toBe(1);
  const selected = range(f.node, 1, 1);
  try {
    f.doc.GetDocumentContentOperationsManager().ReplaceRange(selected, "yy", false);
    expect(access.FindMark("interior")?.GetMarkPos().GetContentIndex()).toBe(3);
    const end = f.node.Len(),
      atEnd = range(f.node, end, end);
    access.MakeMark(f.node, end, "end");
    try {
      f.doc.GetDocumentContentOperationsManager().ReplaceRange(atEnd, "z", false);
      expect(access.FindMark("end")?.GetMarkPos().GetContentIndex()).toBe(end);
    } finally {
      atEnd.Dispose();
    }
  } finally {
    selected.Dispose();
    f.shell.Close();
    f.docShell.Close();
  }
});
/** Exposes the native protected content-index operation through a test-only owner. */
class SaveContent extends SwUndoSaveContent {
  /** Runs original flags and exposes its actual history. @param selection - Native range. @param flags - Native flags. @returns Actual history or absent. */
  public collect(selection: SwPaM, flags: DelContentType): SwHistory | undefined {
    this.DelContentIndex(selection.GetMark(), selection.GetPoint(), flags);
    return this.m_pHistory;
  }
}
it("honors Bkm and CheckNoCntnt node-only source predicates", /** Checks original flag identities and ranges against the actual manager. @returns Nothing. */ () => {
  const f = fixture("first"),
    last = f.doc.nodes.MakeTextNode("last"),
    access = f.doc.GetIDocumentMarkAccess();
  access.MakeMark(f.node, 0, "first");
  access.MakeMark(last, 0, "last");
  const start = new SwPosition(f.node, 4),
    end = new SwPosition(last, 0),
    selected = new SwPaM(start, end);
  start.Dispose();
  end.Dispose();
  try {
    const saved = new SaveContent();
    expect(saved.collect(selected, DelContentType.Ftn)).toBeUndefined();
    expect(marks(f.doc)).toHaveLength(2);
    const history = saved.collect(selected, DelContentType.Bkm | DelContentType.CheckNoCntnt);
    expect(history?.Count()).toBe(1);
    expect(marks(f.doc)).toEqual([["last", 0]]);
    history?.Rollback(f.doc);
    expect(marks(f.doc)).toEqual([
      ["first", 0],
      ["last", 0],
    ]);
  } finally {
    selected.Dispose();
    f.shell.Close();
    f.docShell.Close();
  }
});
it("recreates saved names at current numeric node slots and replaces same-name survivors", /** Retained object/position identities cannot stand in for native numeric payload. @returns Nothing. */ () => {
  const f = fixture(),
    access = f.doc.GetIDocumentMarkAccess(),
    mark = access.MakeMark(f.node, 2, "saved"),
    record = new SwHistoryBookmark(mark, true, false);
  expect(record.IsEqualBookmark(mark)).toBe(true);
  access.DeleteMark("saved");
  const current = f.node.CloneTo(f.doc.GetNodes());
  f.doc.GetNodes().replaceTextNode(f.node, current);
  access.MakeMark(current, 4, "saved");
  try {
    record.SetInDoc(f.doc, false);
    const restored = access.FindMark("saved");
    expect(restored?.GetMarkPos().GetNode()).toBe(current);
    expect(restored?.GetMarkPos().GetContentIndex()).toBe(2);
    expect(f.doc.GetUndoManager().DoesUndo()).toBe(true);
    expect(
      /** Expanded mark payload has no represented manager owner. @returns History entry. */ () =>
        new SwHistoryBookmark(restored as NonNullable<typeof restored>, true, true),
    ).toThrow("expanded bookmark");
  } finally {
    f.shell.Close();
    f.docShell.Close();
  }
});
/** Source history identity used only to observe move order and native temporary counters. */
class Entry extends SwHistoryHint {
  /** Creates an existing native discriminant record. @param label - Distinct test identity. @returns Entry. */ public constructor(
    public readonly label: string,
  ) {
    super(HISTORY_HINT.HSTRY_RESETFMTHNT);
  }
  /** No document change is needed to consume an entry. @param doc - Actual graph. @param tmp - Native temporary policy. @returns Nothing. */ public override SetInDoc(
    doc: SwDoc,
    tmp: boolean,
  ): void {
    void doc;
    void tmp;
  }
}
it("moves original history entries without resetting either temporary-end counter", /** A nonempty Move has the same counter preservation as its empty-source early return. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    destination = new SwHistory(),
    source = new SwHistory(),
    left = new Entry("left"),
    right = new Entry("right"),
    first = new Entry("first"),
    second = new Entry("second"),
    third = new Entry("third");
  destination.AddHint(left);
  destination.AddHint(right);
  source.AddHint(first);
  source.AddHint(second);
  source.AddHint(third);
  destination.TmpRollback(doc, 1);
  source.TmpRollback(doc, 2);
  destination.Move(1, source, 1);
  expect([destination.at(0), destination.at(1), destination.at(2), destination.at(3)]).toEqual([
    left,
    second,
    third,
    right,
  ]);
  expect([
    destination.Count(),
    destination.GetTmpEnd(),
    source.Count(),
    source.GetTmpEnd(),
  ]).toEqual([4, 3, 1, 0]);
  destination.Move(0, source, source.Count());
  expect([
    destination.Count(),
    destination.GetTmpEnd(),
    source.Count(),
    source.GetTmpEnd(),
  ]).toEqual([4, 3, 1, 0]);
});
it("recollects the current mark identity and coordinate on redo", /** A saved snapshot of the original prefix cannot restore a subsequently changed mark graph correctly. @returns Nothing. */ () => {
  const f = fixture(),
    access = f.doc.GetIDocumentMarkAccess(),
    selected = range(f.node, 1, 4);
  access.MakeMark(f.node, 1, "original");
  try {
    f.doc.GetDocumentContentOperationsManager().ReplaceRange(selected, "XYZ", false);
    expect(access.GetBookmarks()).toHaveLength(0);
    expect(f.shell.Undo()).toBe(true);
    access.RenameMark("original", "current");
    access.DeleteMark("current");
    access.MakeMark(f.node, 2, "current");
    expect(f.shell.Redo()).toBe(true);
    expect(access.GetBookmarks()).toHaveLength(0);
    expect(f.shell.Undo()).toBe(true);
    expect(marks(f.doc)).toEqual([["current", 2]]);
  } finally {
    selected.Dispose();
    f.shell.Close();
    f.docShell.Close();
  }
});
it("uses the surviving current position when primary position was not saved", /** Bookmark SetInDoc recreates the mark under an undo guard without changing the caller's recording state. @returns Nothing. */ () => {
  const f = fixture(),
    access = f.doc.GetIDocumentMarkAccess(),
    original = access.MakeMark(f.node, 1, "current"),
    entry = new SwHistoryBookmark(original, false, false);
  access.DeleteMark("current");
  const survivor = access.MakeMark(f.node, 3, "current");
  f.doc.GetUndoManager().DoUndo(false);
  try {
    entry.SetInDoc(f.doc, true);
    expect(access.FindMark("current")).not.toBe(survivor);
    expect(marks(f.doc)).toEqual([["current", 3]]);
    expect(f.doc.GetUndoManager().DoesUndo()).toBe(false);
  } finally {
    f.shell.Close();
    f.docShell.Close();
  }
});
it("keeps the complete-text construction adapter outside native Replace boundary updates", /** Rebuilding explicit text preserves its existing mark-before boundary policy rather than borrowing native replacement semantics. @returns Nothing. */ () => {
  const f = fixture("abc"),
    access = f.doc.GetIDocumentMarkAccess();
  access.MakeMark(f.node, 3, "end");
  try {
    f.node.SetText("abcdef");
    expect(access.FindMark("end")?.GetMarkPos().GetContentIndex()).toBe(3);
  } finally {
    f.shell.Close();
    f.docShell.Close();
  }
});
