/** @fileoverview Verifies literal native IsMoveLeftMargin admission on initialized owners without upstream. */
import { expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwPaM, SwPosition } from "../crsr/pam";
import type { SwTextNode } from "../txtnode/ndtxt";
import {
  SvxIndentValue,
  SvxLRSpaceItem,
  SvxTextLeftMarginItem,
} from "../../../../editeng/inc/lrspitem";
import { SvxTabStopItem, SvxTabStop } from "../../../../editeng/inc/tstpitem";
import { RES_LR_SPACE, RES_MARGIN_TEXTLEFT, RES_PARATR_TABSTOP } from "../../../inc/hintids";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { isMoveLeftMargin } from "./edattr";
/** Authors the actual pool default. @param doc - Native owner. @param distance - Native signed32 tab. @returns Nothing. */
function tabs(doc: SwDoc, distance: number): void {
  const item = doc.GetAttrPool().GetUserOrPoolDefaultItem(RES_PARATR_TABSTOP) as SvxTabStopItem;
  item.Remove(0, item.Count());
  item.Insert(new SvxTabStop(distance));
}
/** Creates an independent native range. @param node - Original owner. @returns Disposable PaM. */
function range(node: SwTextNode): SwPaM {
  const point = new SwPosition(node, 0),
    result = new SwPaM(point);
  point.Dispose();
  return result;
}
it.each([
  [-300, 720, true, 567, true],
  [-300, 720, false, 567, false],
  [300, 720, true, 1003, false],
  [300, 720, true, 1004, true],
  [300, 720, false, 1303, false],
  [300, 720, false, 1304, true],
  [-720, 720, true, 567, true],
  [-721, 720, true, 567, true],
] as const)(
  "uses original LR add-before-snap strict width %s/%s/%s/%s/%s",
  /** Checks source literals with independently authored typed margins. @param left - Native legacy LR. @param distance - Signed32 tab. @param modulus - Source snapping. @param width - Current page frame accommodation. @param enabled - Literal admission. @returns Nothing. */ (
    left,
    distance,
    modulus,
    width,
    enabled,
  ) => {
    const doc = new SwDoc(),
      node = doc.paragraphs[0] as SwTextNode,
      cursor = range(node),
      legacy = new SvxLRSpaceItem(RES_LR_SPACE);
    try {
      tabs(doc, distance);
      doc
        .GetPageDesc()
        .SetValue({ ...doc.GetPageDesc().GetValue(), width, leftMargin: 0, rightMargin: 0 });
      legacy.SetTextLeft(SvxIndentValue.twips(left));
      expect(node.SetAttr(legacy)).toBe(true);
      node.SetAttr(new SvxTextLeftMarginItem(SvxIndentValue.twips(30000), RES_MARGIN_TEXTLEFT));
      const before = node.GetSwAttrSet().CloneAsValue(),
        index = cursor.GetPoint().GetNodeIndex();
      expect(isMoveLeftMargin(doc, cursor, true, modulus)).toBe(enabled);
      expect(isMoveLeftMargin(doc, cursor, false, modulus)).toBe(true);
      expect(node.GetSwAttrSet().Equals(before, true)).toBe(true);
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(0);
      expect(cursor.GetPoint().GetNodeIndex()).toBe(index);
      expect(node.GetParagraphTextLeftMargin()).toBe(30000);
    } finally {
      cursor.Dispose();
      doc.Dispose();
    }
  },
);
it.each([
  [0, false, false],
  [65536, false, false],
  [65537, true, true],
  [131073, true, true],
  [-65536, false, false],
  [-1, false, true],
  [65535, false, true],
  [720, true, true],
] as const)(
  "narrows guard-only default tabs %s/%s/%s",
  /** Checks unsigned16 conversion separately from raw document mutation. @param distance - Signed32 pool value. @param increase - Literal increase admission. @param decrease - Literal decrease admission. @returns Nothing. */ (
    distance,
    increase,
    decrease,
  ) => {
    const doc = new SwDoc(),
      cursor = range(doc.paragraphs[0] as SwTextNode);
    try {
      tabs(doc, distance);
      expect(isMoveLeftMargin(doc, cursor, true)).toBe(increase);
      expect(isMoveLeftMargin(doc, cursor, false)).toBe(decrease);
    } finally {
      cursor.Dispose();
      doc.Dispose();
    }
  },
);
it("retains inherited legacy LR ownership independently of separate typed and list items", /** Checks ordinary native inherited getter without synthetic LR conversion. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell(),
    node = shell.GetActiveParagraph(),
    style = node.GetTextFormatColl(),
    inherited = new SvxLRSpaceItem(RES_LR_SPACE),
    direct = new SvxLRSpaceItem(RES_LR_SPACE);
  try {
    tabs(doc, 720);
    doc
      .GetPageDesc()
      .SetValue({ ...doc.GetPageDesc().GetValue(), width: 1004, leftMargin: 0, rightMargin: 0 });
    inherited.SetTextLeft(SvxIndentValue.twips(720));
    expect(style.SetFormatAttr(inherited)).toBe(true);
    node.SetAttr(new SvxTextLeftMarginItem(SvxIndentValue.twips(30000), RES_MARGIN_TEXTLEFT));
    expect(shell.IsMoveLeftMargin(true)).toBe(false);
    direct.SetTextLeft(SvxIndentValue.twips(-300));
    expect(node.SetAttr(direct)).toBe(true);
    expect(shell.IsMoveLeftMargin(true)).toBe(true);
    expect(shell.SetParagraphListKind("bullet")).toBe(true);
    expect(shell.IsMoveLeftMargin(true)).toBe(true);
    expect(shell.CanChangeParagraphIndent(false)).toBe(false);
    node.ResetAttr(RES_LR_SPACE);
    expect(node.GetAttr(RES_LR_SPACE)).toBe(style.GetAttrSet().Get(RES_LR_SPACE));
    expect(shell.IsMoveLeftMargin(true)).toBe(false);
  } finally {
    session.Close();
  }
});
it("visits every ring member and native cell node while ignoring structural slots", /** Checks original indexed graph traversal rather than body-only filtering. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    body = doc.paragraphs[0] as SwTextNode,
    table = doc.nodes.MakeTableNode("AdmissionTable", {}, body),
    boxes = doc.nodes.AppendTableRow(table, 2).GetTabBoxes(),
    cell = boxes[0]?.GetParagraphs()[0],
    peer = boxes[1]?.GetParagraphs()[0],
    cursor = range(body);
  if (cell === undefined || peer === undefined) throw Error("Missing native cell");
  const point = new SwPosition(cell, 0),
    other = new SwPaM(point, undefined, cursor),
    legacy = new SvxLRSpaceItem(RES_LR_SPACE);
  point.Dispose();
  try {
    tabs(doc, 720);
    legacy.SetTextLeft(SvxIndentValue.twips(30000));
    expect(cell.SetAttr(legacy)).toBe(true);
    expect(isMoveLeftMargin(doc, cursor, true)).toBe(false);
    expect(isMoveLeftMargin(doc, cursor, false)).toBe(true);
    cell.ResetAttr(RES_LR_SPACE);
    expect(isMoveLeftMargin(doc, cursor, true)).toBe(true);
    other.Dispose();
    const end = new SwPosition(peer, 0),
      span = new SwPaM(cursor.GetPoint(), end);
    end.Dispose();
    try {
      expect(peer.SetAttr(legacy)).toBe(true);
      expect(isMoveLeftMargin(doc, span, true)).toBe(false);
    } finally {
      span.Dispose();
    }
  } finally {
    other.Dispose();
    cursor.Dispose();
    doc.Dispose();
  }
});
it("admits a native structural-only span and fallback but rejects the narrowed zero default", /** Checks initialized original no-text/empty-tab branches. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    root = doc
      .GetNodes()
      .entries()
      .find(
        /** Finds original root. @param node - Native entry. @returns Whether root. */ (node) =>
          node.IsStartNode(),
      );
  if (root === undefined) throw Error("Missing root");
  const point = new SwPosition(root, 0),
    cursor = new SwPaM(point),
    item = doc.GetAttrPool().GetUserOrPoolDefaultItem(RES_PARATR_TABSTOP) as SvxTabStopItem;
  try {
    item.Remove(0, item.Count());
    expect(isMoveLeftMargin(doc, cursor, true)).toBe(true);
    expect(isMoveLeftMargin(doc, cursor, false)).toBe(true);
    item.Insert(new SvxTabStop(0));
    expect(isMoveLeftMargin(doc, cursor, false)).toBe(false);
  } finally {
    cursor.Dispose();
    point.Dispose();
    doc.Dispose();
  }
});
it("keeps document mutation signed32 while its source guard uses unsigned16", /** Checks the literal65537 source mismatch without normalizing either contract. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0] as SwTextNode,
    cursor = range(node);
  try {
    tabs(doc, 65537);
    expect(isMoveLeftMargin(doc, cursor, true, false)).toBe(true);
    doc.MoveLeftMargin(cursor, true, false);
    expect(node.GetParagraphTextLeftMargin()).toBe(65537);
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  } finally {
    cursor.Dispose();
    doc.Dispose();
  }
});
