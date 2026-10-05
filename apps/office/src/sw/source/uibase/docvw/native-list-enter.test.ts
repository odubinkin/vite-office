/** @fileoverview Verifies native Enter list termination and numbering deletion history without upstream access. */
import { afterEach, describe, expect, it, vi } from "vitest";
import { createWriterDocument } from "../../core/doc/doc";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { SwDocShell } from "../app/docsh";
import { SwWrtShell } from "../wrtsh/wrtsh1";
import { SwEditWin } from "./edtwin";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { SwUndoDelNum } from "../../core/undo/unnum";
import { SwNumRuleType } from "../../core/doc/number";
import { SwTextFormatColl } from "../../core/doc/fmtcol";
import { SwNumRuleItem } from "../../core/para/paratr";
import { SvxNumType } from "../../../../editeng/inc/svxenum";
import {
  RES_PARATR_NUMRULE,
  RES_PARATR_LIST_ID,
  RES_PARATR_LIST_LEVEL,
  RES_PARATR_LIST_ISRESTART,
  RES_PARATR_LIST_RESTARTVALUE,
  RES_PARATR_LIST_ISCOUNTED,
} from "../../../inc/hintids";
const documents: ReturnType<typeof createWriterDocument>[] = [];
afterEach(
  /** Releases native owners. @returns Nothing. */ () => {
    for (const d of documents.splice(0)) d.Dispose();
  },
);
/** Creates actual body and two cell paragraphs with persistent edit-window ownership. @returns Native fixture. */
function fixture() {
  const doc = createWriterDocument();
  documents.push(doc);
  const body = doc.paragraphs[0];
  if (body === undefined) throw new Error("Missing body");
  const table = doc.nodes.MakeTableNode("Table1", {}, body);
  table.AddColumnWidth(3000);
  table.AddColumnWidth(3000);
  const boxes = doc.nodes.AppendTableRow(table, 2).GetTabBoxes();
  const first = boxes[0]?.GetParagraphs()[0],
    second = boxes[1]?.GetParagraphs()[0];
  if (first === undefined || second === undefined) throw new Error("Missing cells");
  const docShell = new SwDocShell(
      doc,
      createDocument({ id: "list-enter", suiteId: "writer", title: "Enter" }),
    ),
    shell = new SwWrtShell(docShell),
    invalidate = vi.fn(),
    win = new SwEditWin(shell, invalidate);
  return { doc, body, first, second, boxes, docShell, shell, win, invalidate };
}
describe("native list Enter", /** Registers actual-node behavior. @returns Nothing. */ () => {
  it.each(["bullet", "numbered"] as const)(
    "ends an empty nested %s cell without inserting a node",
    /** Checks numbering removal,history and independent formatting. @param kind - List family. @returns Nothing. */ (
      kind,
    ) => {
      const f = fixture();
      f.shell.FocusNode(f.first);
      f.shell.SetParagraphListKind(kind);
      f.first.SetAttrListLevel(6);
      f.first.SetListRestart(true);
      f.first.SetAttrListRestartValue(7);
      f.first.SetCountedInList(false);
      f.first.SetParagraphTextLeftMargin(420);
      const rule = f.first.GetNumRule(),
        id = f.first.GetListId(),
        count = f.doc.nodes.entries().length;
      f.docShell.GetUndoManager().Clear();
      expect(f.win.InsertParagraph()).toBe(true);
      expect(f.doc.nodes.entries()).toHaveLength(count);
      expect(f.boxes[0]?.GetParagraphs()).toEqual([f.first]);
      expect(f.first.GetNumRule()).toBeUndefined();
      expect(f.first.GetAttrListLevel()).toBe(0);
      expect(f.first.GetListId()).toBe("");
      expect(f.first.IsListRestart()).toBe(false);
      expect(f.first.IsCountedInList()).toBe(true);
      for (const which of [
        RES_PARATR_NUMRULE,
        RES_PARATR_LIST_ID,
        RES_PARATR_LIST_LEVEL,
        RES_PARATR_LIST_ISRESTART,
        RES_PARATR_LIST_RESTARTVALUE,
        RES_PARATR_LIST_ISCOUNTED,
      ])
        expect(f.first.GetpSwAttrSet()?.GetItemIfSet(which, false)).toBeUndefined();
      expect(f.first.GetParagraphTextLeftMargin()).toBe(420);
      expect(f.second.GetNumRule()).toBeUndefined();
      const manager = f.docShell.GetUndoManager();
      expect(manager.GetUndoActionCount()).toBe(1);
      expect(manager.GetUndoAction()).toBeInstanceOf(SwUndoDelNum);
      expect(manager.GetUndoAction()?.GetComment()).toBe("Delete numbering");
      expect(manager.GetUndoAction()?.GetPayloadSize()).toBe(11);
      expect(f.shell.GetCursor().GetPoint().GetNode()).toBe(f.first);
      expect(f.shell.GetCursor().GetPoint().GetContentIndex()).toBe(0);
      f.first.SetParagraphTextLeftMargin(500);
      expect(f.win.Undo()).toBe(true);
      expect(f.first.GetNumRule()).toBe(rule);
      expect(f.first.GetListId()).toBe(id);
      expect(f.first.GetAttrListLevel()).toBe(6);
      expect(f.first.IsCountedInList()).toBe(false);
      expect(f.first.GetAttrListRestartValue()).toBe(7);
      expect(f.first.GetParagraphTextLeftMargin()).toBe(500);
      expect(f.win.Redo()).toBe(true);
      expect(f.first.GetNumRule()).toBeUndefined();
      expect(f.doc.nodes.entries()).toHaveLength(count);
      expect(f.win.InsertText("After")).toBe(true);
      expect(f.first.GetText()).toBe("After");
      expect(f.first.GetListKind()).toBe("none");
      expect(f.invalidate).toHaveBeenCalled();
    },
  );
  it("ends the empty body list and lets the next Enter create an ordinary paragraph", /** Checks body transition and next default split. @returns Nothing. */ () => {
    const f = fixture();
    f.shell.FocusNode(f.body);
    f.shell.SetParagraphListKind("numbered");
    f.docShell.GetUndoManager().Clear();
    expect(f.win.InsertParagraph()).toBe(true);
    expect(f.doc.paragraphs).toEqual([f.body]);
    expect(f.body.GetNumRule()).toBeUndefined();
    expect(f.win.InsertParagraph()).toBe(true);
    expect(f.doc.paragraphs).toHaveLength(2);
    expect(
      f.doc.paragraphs.every(
        /** Checks ordinary descendants. @param n - Text node. @returns Whether ordinary. */ (n) =>
          n.GetNumRule() === undefined,
      ),
    ).toBe(true);
  });
  it("uses rule existence when the level has no visible numbering format", /** Checks native rule contract rather than projected list kind. @returns Nothing. */ () => {
    const f = fixture();
    f.shell.FocusNode(f.first);
    f.shell.SetParagraphListKind("numbered");
    const rule = f.first.GetNumRule();
    if (rule === undefined) throw new Error("Missing rule");
    const format = rule.Get(0).clone();
    format.SetNumberingType(SvxNumType.SVX_NUM_NUMBER_NONE);
    rule.Set(0, format);
    expect(rule.Get(0).GetNumberingType()).toBe(SvxNumType.SVX_NUM_NUMBER_NONE);
    const count = f.doc.nodes.entries().length;
    expect(f.win.InsertParagraph()).toBe(true);
    expect(f.first.GetNumRule()).toBeUndefined();
    expect(f.doc.nodes.entries()).toHaveLength(count);
  });
  it("keeps outline-rule Enter on the shell split path", /** Checks the exact outline exception. @returns Nothing. */ () => {
    const f = fixture();
    f.shell.FocusNode(f.first);
    f.shell.SetParagraphListKind("numbered");
    f.first.GetNumRule()?.SetRuleType(SwNumRuleType.OUTLINE_RULE);
    const count = f.doc.nodes.entries().length;
    expect(f.win.InsertParagraph()).toBe(true);
    expect(f.doc.nodes.entries()).toHaveLength(count + 1);
    expect(f.boxes[0]?.GetParagraphs()).toHaveLength(2);
    expect(f.first.GetNumRule()?.IsOutlineRule()).toBe(true);
  });
  it("splits a nonempty list and leaves direct shell split unconditional", /** Checks a content item and the native lower-level API. @returns Nothing. */ () => {
    const f = fixture();
    f.first.SetText("Item");
    f.shell.FocusNode(f.first);
    f.shell.SetParagraphListKind("bullet");
    expect(f.win.InsertParagraph()).toBe(true);
    expect(f.boxes[0]?.GetParagraphs()).toHaveLength(2);
    expect(f.first.GetText()).toBe("Item");
    expect(f.shell.GetActiveParagraph().GetNumRule()).toBe(f.first.GetNumRule());
    expect(f.win.SplitNode()).toBe(true);
    expect(f.boxes[0]?.GetParagraphs()).toHaveLength(3);
    expect(f.second.GetText()).toBe("");
  });
  it("replaces a selection with a split instead of terminating numbering", /** Checks selected text and a zero-length marked selection. @returns Nothing. */ () => {
    const f = fixture();
    f.first.SetText("Item");
    f.shell.FocusNode(f.first);
    f.shell.SetParagraphListKind("numbered");
    let point = new SwPosition(f.first, 4),
      mark = new SwPosition(f.first, 0);
    f.shell.SetPaM(point, mark);
    point.Dispose();
    mark.Dispose();
    expect(f.win.InsertParagraph()).toBe(true);
    expect(f.boxes[0]?.GetParagraphs()).toHaveLength(2);
    expect(f.first.GetText()).toBe("");
    expect(f.first.GetNumRule()).toBeDefined();
    const active = f.shell.GetActiveParagraph();
    point = new SwPosition(active, 0);
    mark = new SwPosition(active, 0);
    f.shell.SetPaM(point, mark);
    point.Dispose();
    mark.Dispose();
    expect(f.win.InsertParagraph()).toBe(true);
    expect(f.boxes[0]?.GetParagraphs()).toHaveLength(3);
  });
  it("removes numbering from an inclusive reversed native range through one history action", /** Checks body,structural nodes,cells and mark reconstruction. @returns Nothing. */ () => {
    const f = fixture();
    for (const n of [f.body, f.first, f.second]) {
      f.shell.FocusNode(n);
      f.shell.SetParagraphListKind("numbered");
    }
    const point = new SwPosition(f.body, 0),
      mark = new SwPosition(f.second, 0);
    f.shell.SetPaM(point, mark);
    point.Dispose();
    mark.Dispose();
    f.docShell.GetUndoManager().Clear();
    expect(f.shell.DelNumRules()).toBe(true);
    for (const n of [f.body, f.first, f.second]) expect(n.GetNumRule()).toBeUndefined();
    expect(f.docShell.GetUndoManager().GetUndoActionCount()).toBe(1);
    expect(f.win.Undo()).toBe(true);
    for (const n of [f.body, f.first, f.second]) expect(n.GetNumRule()).toBeDefined();
    expect(f.win.Redo()).toBe(true);
    for (const n of [f.body, f.first, f.second]) expect(n.GetNumRule()).toBeUndefined();
    expect(f.shell.GetCursor().GetMark().GetNode()).toBe(f.second);
  });
  it("overrides inherited numbering with an empty rule and restores inheritance on Undo", /** Checks the native inherited-style branch. @returns Nothing. */ () => {
    const f = fixture();
    const rule = f.doc.EnsureNumRule("Inherited", "numbered"),
      style = new SwTextFormatColl(f.doc.GetAttrPool(), "custom", "Custom");
    style.SetFormatAttr(new SwNumRuleItem(rule.GetName()));
    f.first.ChgFormatColl(style);
    f.shell.FocusNode(f.first);
    f.docShell.GetUndoManager().Clear();
    expect(f.win.InsertParagraph()).toBe(true);
    expect(f.first.GetNumRule()).toBeUndefined();
    expect(
      (
        f.first.GetpSwAttrSet()?.GetItemIfSet(RES_PARATR_NUMRULE, false) as SwNumRuleItem
      ).GetValue(),
    ).toBe("");
    expect(f.win.Undo()).toBe(true);
    expect(f.first.GetNumRule()).toBe(rule);
    expect(f.first.GetpSwAttrSet()?.GetItemIfSet(RES_PARATR_NUMRULE, false)).toBeUndefined();
    expect(f.win.Redo()).toBe(true);
    expect(f.first.GetNumRule()).toBeUndefined();
  });
  it("retains native assigned-outline count semantics and handles no-rule and foreign ranges", /** Checks document removal guards and paragraph-style handling. @returns Nothing. */ () => {
    const f = fixture();
    f.shell.FocusNode(f.first);
    expect(f.shell.DelNumRules()).toBe(false);
    const p = new SwPosition(f.first, 0),
      range = new SwPaM(p);
    expect(f.doc.DelNumRules(range)).toBe(false);
    range.Dispose();
    p.Dispose();
    const foreign = createWriterDocument();
    documents.push(foreign);
    const node = foreign.paragraphs[0];
    if (node === undefined) throw new Error("Missing foreign node");
    const q = new SwPosition(node, 0),
      other = new SwPaM(q);
    expect(
      /** Calls the foreign document boundary. @returns Whether changed. */ () =>
        f.doc.DelNumRules(other),
    ).toThrow("another node array");
    other.Dispose();
    q.Dispose();
    f.shell.SetParagraphListKind("numbered");
    f.first.GetTextFormatColl().AssignToListLevelOfOutlineStyle(0);
    expect(f.shell.DelNumRules()).toBe(true);
    expect(f.first.IsCountedInList()).toBe(false);
    expect(f.first.GetAttrOutlineLevel()).toBeGreaterThan(0);
  });
  it("deletes only numbered nodes when the marked range starts in ordinary body text", /** Checks a plain point and a numbered cell mark without body mutations. @returns Nothing. */ () => {
    const f = fixture();
    f.body.SetText("Ordinary");
    f.shell.FocusNode(f.first);
    f.shell.SetParagraphListKind("bullet");
    const point = new SwPosition(f.body, 0),
      mark = new SwPosition(f.first, 0);
    f.shell.SetPaM(point, mark);
    point.Dispose();
    mark.Dispose();
    f.docShell.GetUndoManager().Clear();
    expect(f.shell.DelNumRules()).toBe(true);
    expect(f.first.GetNumRule()).toBeUndefined();
    expect(f.body.GetText()).toBe("Ordinary");
    expect(f.body.GetpSwAttrSet()).toBeUndefined();
    expect(f.win.Undo()).toBe(true);
    expect(f.first.GetListKind()).toBe("bullet");
    expect(f.body.GetpSwAttrSet()).toBeUndefined();
    expect(f.win.Redo()).toBe(true);
    expect(f.first.GetNumRule()).toBeUndefined();
  });
});
