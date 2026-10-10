/** @fileoverview Verifies native margin/history ownership and initialized uncommon source boundaries without upstream. */
import { expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwTextNode } from "../txtnode/ndtxt";
import { SwPaM, SwPosition } from "../crsr/pam";
import { SwUndoMoveLeftMargin } from "./unattr";
import { SwHistoryResetFormat, SwHistorySetAttrSet, SwHistorySetFormat } from "./rolbck";
import {
  SvxTextLeftMarginItem,
  SvxLRSpaceItem,
  SvxIndentValue,
} from "../../../../editeng/inc/lrspitem";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { RES_MARGIN_TEXTLEFT, RES_LR_SPACE, RES_UL_SPACE } from "../../../inc/hintids";
import { SwList } from "../doc/list";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { getMoveLeftMarginItems } from "../doc/docfmt";
import type { SwUndoCursorState } from "./undobj";
it("rejects a foreign document before any history rollback or range modification", /** Checks original document ownership on native initial history and redo. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    foreign = new SwDoc(),
    node = doc.paragraphs[0] as SwTextNode,
    other = foreign.paragraphs[0] as SwTextNode,
    point = new SwPosition(node, 0),
    range = new SwPaM(point);
  try {
    node.SetText("Original");
    node.SetAttr(new SvxTextLeftMarginItem(SvxIndentValue.twips(300), RES_MARGIN_TEXTLEFT));
    doc.MoveLeftMargin(range, true, false);
    other.SetAttr(new SvxTextLeftMarginItem(SvxIndentValue.twips(900), RES_MARGIN_TEXTLEFT));
    const before = other.GetSwAttrSet().CloneAsValue(),
      a = doc.GetUndoManager().GetUndoAction();
    if (!(a instanceof SwUndoMoveLeftMargin)) throw new Error("Missing native margin action");
    const context = {
      GetDoc: /** Supplies the actual foreign graph. @returns Native graph. */ () => foreign,
      RestoreCursor: /** Must never restore a foreign cursor. @returns Nothing. */ () => {
        throw new Error("Unexpected foreign cursor mutation");
      },
    };
    expect(
      /** Attempts foreign native Undo. @returns Nothing. */ () => a.UndoWithContext(context),
    ).toThrow("another document");
    expect(
      /** Attempts foreign native Redo. @returns Nothing. */ () => a.RedoWithContext(context),
    ).toThrow("another document");
    expect(other.GetSwAttrSet().Equals(before, true)).toBe(true);
    expect(a.GetHistory().GetTmpEnd()).toBe(a.GetHistory().Count());
    expect(node.GetParagraphTextLeftMargin()).toBe(1434);
  } finally {
    range.Dispose();
    point.Dispose();
    doc.Dispose();
    foreign.Dispose();
  }
});
it("restores actual marked native ranges without browser cursor adjunct", /** Checks original numeric point/mark reconstruction through core context. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    first = doc.paragraphs[0] as SwTextNode,
    second = doc.nodes.MakeTextNode("Second");
  first.SetText("First");
  const point = new SwPosition(second, 3),
    rangePoint = new SwPosition(first, 1),
    range = new SwPaM(point, rangePoint),
    restored: SwUndoCursorState[] = [];
  const context = {
    GetDoc: /** Borrows original graph. @returns Native graph. */ () => doc,
    RestoreCursor:
      /** Captures actual point/mark. @param state - Native restored state. @returns Nothing. */ (
        state: SwUndoCursorState,
      ) => {
        restored.push(state);
      },
  };
  try {
    doc.MoveLeftMargin(range, true, true);
    expect(doc.GetUndoManager().Undo(context)).toBe(true);
    expect(restored[0]?.point).toEqual({ node: second, offset: 3 });
    expect(restored[0]?.mark).toEqual({ node: first, offset: 1 });
    expect(first.GetpSwAttrSet()).toBeUndefined();
    expect(second.GetpSwAttrSet()).toBeUndefined();
    expect(doc.GetUndoManager().Redo(context)).toBe(true);
    expect(first.GetParagraphTextLeftMargin()).toBe(1134);
    expect(second.GetParagraphTextLeftMargin()).toBe(1134);
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  } finally {
    range.Dispose();
    point.Dispose();
    rangePoint.Dispose();
    doc.Dispose();
  }
});
it("preserves original paragraph items for an actually detached and rebound native list record", /** Checks the source negative list-level guard during the native detach/rebind phase. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell(),
    node = shell.GetActiveParagraph();
  try {
    shell.SetParagraphListKind("bullet");
    const record = node.GetNum(),
      rule = node.GetNumRule(),
      list = doc.GetDocumentListsManager().GetListByName(node.GetListId());
    if (record === undefined || rule === undefined || list === undefined)
      throw new Error("Missing native record ownership");
    SwList.RemoveListItem(record, doc);
    record.ChangeNumRule(rule);
    expect(node.GetNum()).toBe(record);
    expect(record.GetParent()).toBeUndefined();
    expect(node.GetActualListLevel()).toBe(-1);
    expect(node.AreListLevelIndentsApplicable()).not.toBe(0);
    const original = node.GetAttr(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem,
      items = getMoveLeftMarginItems(node);
    expect(items.left.equals(original)).toBe(true);
    expect(items.left).not.toBe(original);
    list.InsertListItem(record, node.GetAttrListLevel(), doc);
  } finally {
    session.Close();
  }
});
it("ignores structural node slots for native format history", /** Checks source content/table dispatch on real start/end nodes. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    item = new SvxTextLeftMarginItem(SvxIndentValue.twips(300), RES_MARGIN_TEXTLEFT),
    root = doc
      .GetNodes()
      .entries()
      .find(
        /** Selects the original root start. @param node - Native entry. @returns Whether structural root. */ (
          node,
        ) => node.IsStartNode(),
      );
  if (root === undefined) throw new Error("Missing native root");
  const set = new SfxItemSet(doc.GetAttrPool(), [[RES_MARGIN_TEXTLEFT, RES_MARGIN_TEXTLEFT]]);
  set.Put(item);
  try {
    new SwHistoryResetFormat(item, root.GetIndex()).SetInDoc(doc, true);
    new SwHistorySetFormat(item, root.GetIndex()).SetInDoc(doc, false);
    new SwHistorySetAttrSet(set, root.GetIndex(), new Set()).SetInDoc(doc, true);
    expect(doc.GetUndoManager().DoesUndo()).toBe(true);
  } finally {
    doc.Dispose();
  }
});
it("preserves the pinned table multi-reset first-only result with two initialized WhichIds", /** Checks literal source behavior recorded as WRITER-004 rather than normalizing it. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("TwoResetTable"),
    format = table.GetFrameFormat(),
    left = new SvxLRSpaceItem(RES_LR_SPACE),
    spacing = new SvxULSpaceItem(RES_UL_SPACE),
    old = new SfxItemSet(doc.GetAttrPool(), [[RES_LR_SPACE, RES_UL_SPACE]]);
  try {
    left.SetTextLeft(SvxIndentValue.twips(300));
    spacing.SetUpper(120);
    format.SetFormatAttr(left);
    format.SetFormatAttr(spacing);
    old.Put(left);
    old.Put(spacing);
    new SwHistorySetAttrSet(old, table.GetTableNode().GetIndex(), new Set()).SetInDoc(doc, true);
    expect(format.GetAttrSet().GetItemIfSet(RES_LR_SPACE, false)).toBeUndefined();
    expect(format.GetAttrSet().GetItemIfSet(RES_UL_SPACE, false)).toBeInstanceOf(SvxULSpaceItem);
    expect(
      (format.GetAttrSet().GetItemIfSet(RES_UL_SPACE, false) as SvxULSpaceItem).GetUpper(),
    ).toBe(120);
  } finally {
    doc.Dispose();
  }
});
