/** @fileoverview Verifies native Backspace count,numbering and indent ordering over actual body and cell nodes. */
import { afterEach, describe, expect, it } from "vitest";
import { createWriterDocument } from "../../core/doc/doc";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { SwDocShell } from "../app/docsh";
import { SwWrtShell } from "../wrtsh/wrtsh1";
import { SwEditWin } from "./edtwin";
import { SwPosition } from "../../core/crsr/pam";
import { SwUndoNumOrNoNum, SwUndoDelNum } from "../../core/undo/unnum";
import { SwTextFormatColl } from "../../core/doc/fmtcol";
import { SwNumRuleItem } from "../../core/para/paratr";
import { SwNumRuleType, SvxNumType } from "../../core/doc/number";
import { SvxFirstLineIndentItem } from "../../../../editeng/source/items/frmitems";
import { RES_MARGIN_FIRSTLINE } from "../../../inc/hintids";
import { SwView } from "../uiview/view";
const documents: ReturnType<typeof createWriterDocument>[] = [];
afterEach(
  /** Releases native document owners. @returns Nothing. */ () => {
    for (const d of documents.splice(0)) d.Dispose();
  },
);
/** Creates native cell sections after a body node. @returns Actual owners. */
function fixture() {
  const doc = createWriterDocument();
  documents.push(doc);
  const body = doc.paragraphs[0];
  if (body === undefined) throw new Error("Missing body");
  body.SetText("Body");
  const table = doc.nodes.MakeTableNode("Table1", {}, body);
  table.AddColumnWidth(3000);
  table.AddColumnWidth(3000);
  const boxes = doc.nodes.AppendTableRow(table, 2).GetTabBoxes(),
    first = boxes[0]?.GetParagraphs()[0],
    second = boxes[1]?.GetParagraphs()[0];
  if (first === undefined || second === undefined) throw new Error("Missing cells");
  const docShell = new SwDocShell(
      doc,
      createDocument({ id: "backspace", suiteId: "writer", title: "Backspace" }),
    ),
    shell = new SwView(docShell).GetWrtShell(),
    win = new SwEditWin(shell.GetView());
  return { doc, body, first, second, boxes, table, docShell, shell, win };
}
/** Places a native collapsed cursor at a content offset. @param shell - Persistent editing shell. @param node - Actual node. @param offset - Content offset. @returns Nothing. */
function caret(shell: SwWrtShell, node: ReturnType<typeof fixture>["first"], offset = 0) {
  const p = new SwPosition(node, offset);
  shell.SetPaM(p);
  p.Dispose();
}
describe("native list Backspace", /** Registers native editing contracts. @returns Nothing. */ () => {
  it.each(["bullet", "numbered"] as const)(
    "hides and restores a nested %s marker through boolean-only history",
    /** Checks count delta and retained list metadata. @param kind - Native marker family. @returns Nothing. */ (
      kind,
    ) => {
      const f = fixture();
      f.first.SetText("Item");
      f.shell.FocusNode(f.first);
      f.shell.SetParagraphListKind(kind);
      f.first.SetAttrListLevel(4);
      f.first.SetListRestart(true);
      f.first.SetAttrListRestartValue(7);
      caret(f.shell, f.first);
      f.docShell.GetUndoManager().Clear();
      const rule = f.first.GetNumRule(),
        id = f.first.GetListId(),
        count = f.doc.nodes.entries().length;
      expect(f.win.DeleteLeft()).toBe(true);
      expect(f.first.IsCountedInList()).toBe(false);
      expect(f.first.GetText()).toBe("Item");
      expect(f.first.GetNumRule()).toBe(rule);
      expect(f.first.GetListId()).toBe(id);
      expect(f.first.GetActualListLevel()).toBe(4);
      expect(f.doc.nodes.entries()).toHaveLength(count);
      const undo = f.docShell.GetUndoManager().GetUndoAction();
      expect(undo).toBeInstanceOf(SwUndoNumOrNoNum);
      expect(undo?.GetComment()).toBe("Number On/Off");
      expect(undo?.GetPayloadSize()).toBe(3);
      f.first.SetAttrListRestartValue(3);
      expect(f.win.Undo()).toBe(true);
      expect(f.first.IsCountedInList()).toBe(true);
      expect(f.first.GetAttrListRestartValue()).toBe(3);
      expect(f.win.Redo()).toBe(true);
      expect(f.first.IsCountedInList()).toBe(false);
      expect(f.win.DeleteLeft(true)).toBe(true);
      expect(f.first.IsCountedInList()).toBe(true);
      expect(f.first.GetAttrListRestartValue()).toBe(3);
      expect(f.win.Undo()).toBe(true);
      expect(f.first.IsCountedInList()).toBe(false);
      expect(f.win.Redo()).toBe(true);
      expect(f.first.IsCountedInList()).toBe(true);
      expect(f.second.GetText()).toBe("");
    },
  );
  it("hides then removes an empty ordinary list on two Backspaces without splitting", /** Checks uncounted empty termination and native deletion history. @returns Nothing. */ () => {
    const f = fixture();
    f.shell.FocusNode(f.first);
    f.shell.SetParagraphListKind("numbered");
    caret(f.shell, f.first);
    f.docShell.GetUndoManager().Clear();
    const rule = f.first.GetNumRule(),
      count = f.doc.nodes.entries().length;
    expect(f.win.DeleteLeft()).toBe(true);
    expect(f.first.IsCountedInList()).toBe(false);
    expect(f.first.GetNumRule()).toBe(rule);
    expect(f.win.DeleteLeft()).toBe(true);
    expect(f.first.GetNumRule()).toBeUndefined();
    expect(f.doc.nodes.entries()).toHaveLength(count);
    expect(f.docShell.GetUndoManager().GetUndoAction()).toBeInstanceOf(SwUndoDelNum);
    expect(f.win.Undo()).toBe(true);
    expect(f.first.GetNumRule()).toBe(rule);
    expect(f.first.IsCountedInList()).toBe(false);
    expect(f.win.Undo()).toBe(true);
    expect(f.first.IsCountedInList()).toBe(true);
    expect(f.win.Redo()).toBe(true);
    expect(f.win.Redo()).toBe(true);
    expect(f.first.GetNumRule()).toBeUndefined();
  });
  it.each([
    [200, 600, 600],
    [-200, 600, 400],
    [0, 600, 0],
  ] as const)(
    "removes native firstline %s and left %s before body deletion",
    /** Checks exact indentation ordering and one reversible paragraph action. @param offset - Firstline twips. @param left - Left margin. @param expected - Resulting left margin. @returns Nothing. */ (
      offset,
      left,
      expected,
    ) => {
      const f = fixture();
      f.body.SetText("Keep");
      f.body.SetParagraphFirstLineIndent(offset);
      f.body.SetParagraphTextLeftMargin(left);
      caret(f.shell, f.body);
      f.docShell.GetUndoManager().Clear();
      expect(f.win.DeleteLeft()).toBe(true);
      expect(f.body.GetParagraphFirstLineIndent()).toBe(0);
      expect(f.body.GetParagraphTextLeftMargin()).toBe(expected);
      expect(f.body.GetText()).toBe("Keep");
      expect(f.docShell.GetUndoManager().GetUndoActionCount()).toBe(1);
      expect(f.win.Undo()).toBe(true);
      expect(f.body.GetParagraphFirstLineIndent()).toBe(offset);
      expect(f.body.GetParagraphTextLeftMargin()).toBe(left);
      expect(f.win.Redo()).toBe(true);
      expect(f.body.GetParagraphTextLeftMargin()).toBe(expected);
    },
  );
  it("removes an uncounted cell indent before attempting a merge and preserves automatic-first mode", /** Checks count/indent ordering and raw item flags. @returns Nothing. */ () => {
    const f = fixture();
    f.first.SetText("Keep");
    f.shell.FocusNode(f.first);
    f.shell.SetParagraphListKind("bullet");
    f.first.SetCountedInList(false);
    f.first.SetAttr(new SvxFirstLineIndentItem(200, RES_MARGIN_FIRSTLINE, true));
    f.first.SetParagraphTextLeftMargin(600);
    caret(f.shell, f.first);
    expect(f.win.DeleteLeft()).toBe(true);
    expect(
      (
        f.first.GetAttr(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem
      ).ResolveTextFirstLineOffset(),
    ).toBe(0);
    expect((f.first.GetAttr(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem).IsAutoFirst()).toBe(
      true,
    );
    expect(f.first.GetParagraphTextLeftMargin()).toBe(600);
    expect(f.first.IsCountedInList()).toBe(false);
    expect(f.boxes[0]?.GetParagraphs()).toHaveLength(1);
    expect(f.win.DeleteLeft(true)).toBe(true);
    expect(f.first.IsCountedInList()).toBe(true);
    expect(f.first.GetParagraphTextLeftMargin()).toBe(600);
  });
  it("merges a nonempty uncounted cell paragraph within its own section", /** Checks final native DelLeft fallback after the count transition. @returns Nothing. */ () => {
    const f = fixture();
    f.first.SetText("A");
    f.shell.FocusNode(f.first);
    f.shell.SetParagraphListKind("numbered");
    f.shell.SplitNode();
    const tail = f.shell.GetActiveParagraph();
    f.shell.Insert("B");
    caret(f.shell, tail);
    expect(f.win.DeleteLeft()).toBe(true);
    expect(tail.IsCountedInList()).toBe(false);
    expect(f.win.DeleteLeft()).toBe(true);
    expect(f.boxes[0]?.GetParagraphs()).toEqual([f.first]);
    expect(f.first.GetText()).toBe("AB");
    expect(f.second.GetText()).toBe("");
    expect(f.win.Undo()).toBe(true);
    expect(f.boxes[0]?.GetParagraphs()).toHaveLength(2);
  });
  it("deletes selected or middle text without changing list counting", /** Checks native shell guard and text fallback. @returns Nothing. */ () => {
    const f = fixture();
    f.first.SetText("abcd");
    f.shell.FocusNode(f.first);
    f.shell.SetParagraphListKind("numbered");
    caret(f.shell, f.first, 2);
    expect(f.shell.NumOrNoNum(false)).toBe(false);
    expect(f.win.DeleteLeft()).toBe(true);
    expect(f.first.GetText()).toBe("acd");
    expect(f.first.IsCountedInList()).toBe(true);
    const point = new SwPosition(f.first, 2),
      mark = new SwPosition(f.first, 0);
    f.shell.SetPaM(point, mark);
    point.Dispose();
    mark.Dispose();
    expect(f.shell.NumOrNoNum(false)).toBe(false);
    expect(f.win.DeleteLeft(true)).toBe(true);
    expect(f.first.GetText()).toBe("d");
    expect(f.first.IsCountedInList()).toBe(true);
  });
  it("keeps an empty uncounted outline rule and restores it with ShiftBackspace", /** Checks the native empty-list outline exception. @returns Nothing. */ () => {
    const f = fixture();
    f.shell.FocusNode(f.first);
    f.shell.SetParagraphListKind("numbered");
    const rule = f.first.GetNumRule();
    if (rule === undefined) throw new Error("Missing rule");
    rule.SetRuleType(SwNumRuleType.OUTLINE_RULE);
    caret(f.shell, f.first);
    expect(f.win.DeleteLeft()).toBe(true);
    expect(f.first.IsCountedInList()).toBe(false);
    expect(f.win.DeleteLeft()).toBe(false);
    expect(f.first.GetNumRule()).toBe(rule);
    expect(f.win.DeleteLeft(true)).toBe(true);
    expect(f.first.IsCountedInList()).toBe(true);
  });
  it("uses native numbering capabilities and handles document noops and ownership", /** Checks literal NONE,no-rule,structural and foreign contracts. @returns Nothing. */ () => {
    const f = fixture();
    caret(f.shell, f.first);
    expect(f.shell.NumOrNoNum(false)).toBe(false);
    expect(f.doc.NumOrNoNum(f.first)).toBe(false);
    expect(f.doc.NumOrNoNum(f.table.GetTableNode())).toBe(false);
    expect(f.win.DeleteLeft()).toBe(false);
    const other = createWriterDocument();
    documents.push(other);
    const foreign = other.paragraphs[0];
    if (foreign === undefined) throw new Error("Missing foreign");
    expect(
      /** Calls the foreign native boundary. @returns Whether changed. */ () =>
        f.doc.NumOrNoNum(foreign),
    ).toThrow("another node array");
    f.shell.SetParagraphListKind("numbered");
    const rule = f.first.GetNumRule();
    if (rule === undefined) throw new Error("Missing rule");
    expect(f.shell.NumOrNoNum()).toBe(false);
    expect(f.doc.NumOrNoNum(f.first)).toBe(false);
    expect(f.doc.NumOrNoNum(f.first, true)).toBe(true);
    expect(f.doc.NumOrNoNum(f.first)).toBe(true);
    const format = rule.Get(0).clone();
    format.SetNumberingType(SvxNumType.SVX_NUM_NUMBER_NONE);
    rule.Set(0, format);
    expect(rule.Get(0).GetNumberingType()).toBe(SvxNumType.SVX_NUM_NUMBER_NONE);
    expect(f.first.HasNumber()).toBe(true);
    expect(f.doc.NumOrNoNum(f.first, true)).toBe(true);
    expect(f.first.IsCountedInList()).toBe(false);
    expect(f.shell.NumOrNoNum(false)).toBe(true);
    expect(f.first.GetNumRule()).toBeUndefined();
    expect(f.win.DeleteLeft()).toBe(false);
  });
  it("runs direct document removal of an already uncounted list and keeps inherited parent-rule fallback safe", /** Checks document fallback and native direct-rule guard. @returns Nothing. */ () => {
    const f = fixture();
    f.shell.FocusNode(f.first);
    f.shell.SetParagraphListKind("bullet");
    f.first.SetCountedInList(false);
    expect(f.doc.NumOrNoNum(f.first, true)).toBe(true);
    expect(f.first.GetNumRule()).toBeUndefined();
    const rule = f.doc.EnsureNumRule("Parent", "numbered"),
      parent = new SwTextFormatColl(f.doc.GetAttrPool(), "parent", "Parent"),
      child = new SwTextFormatColl(f.doc.GetAttrPool(), "child", "Child", parent);
    parent.SetFormatAttr(new SwNumRuleItem(rule.GetName()));
    f.first.ChgFormatColl(child);
    f.first.SetCountedInList(false);
    caret(f.shell, f.first);
    expect(f.first.GetNumRule()).toBe(rule);
    expect(f.first.GetNumRule(false)).toBeUndefined();
    expect(f.doc.NumOrNoNum(f.first, true)).toBe(false);
    expect(f.shell.NumOrNoNum(false)).toBe(false);
  });
});
