/** @fileoverview Verifies initialized native range margin history and source-defined redo without upstream access. */
import { expect, it } from "vitest";
import { SwNumFormat } from "../doc/number";
import { SwDoc } from "../doc/doc";
import { SwPaM, SwPosition } from "../crsr/pam";
import { SwTextNode } from "../txtnode/ndtxt";
import {
  SvxIndentValue,
  SvxFirstLineIndentItem,
  SvxTextLeftMarginItem,
} from "../../../../editeng/inc/lrspitem";
import { MeasureUnit as U } from "../../../../offapi/com/sun/star/util/MeasureUnit";
import { SvxTabStop, SvxTabStopItem } from "../../../../editeng/source/items/paraitem";
import {
  RES_MARGIN_FIRSTLINE,
  RES_MARGIN_TEXTLEFT,
  RES_PARATR_TABSTOP,
} from "../../../inc/hintids";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SwUndoMoveLeftMargin } from "./unattr";
import { SwHistory, SwHistoryResetFormat, SwHistorySetFormat, HISTORY_HINT } from "./rolbck";
import { moveLeftMargin } from "../doc/docfmt";
/** Borrows actual document default tabs and replaces their initialized distance. @param doc - Native owner. @param value - Distance, or absent for fallback. @returns Nothing. */
function tabs(doc: SwDoc, value?: number): void {
  const item = doc.GetAttrPool().GetUserOrPoolDefaultItem(RES_PARATR_TABSTOP) as SvxTabStopItem;
  item.Remove(0, item.Count());
  if (value !== undefined) item.Insert(new SvxTabStop(value));
}
/** Requires the native recorded margin action. @param doc - Actual owner. @returns Native history. */
function action(doc: SwDoc): SwUndoMoveLeftMargin {
  const a = doc.GetUndoManager().GetUndoAction();
  if (!(a instanceof SwUndoMoveLeftMargin)) throw new Error("Missing native margin range history");
  return a;
}
it.each([U.TWIP, U.FONT_EM, U.FONT_CJK_ADVANCE, U.MM_100TH])(
  "native direct unit%s retains owned old state and reexecutes current tabs",
  /** Checks real typed item authoring and repeated native undo/redo. @param unit - Native measure unit. @returns Nothing. */ (
    unit,
  ) => {
    const session = createWriterDocumentSession(),
      doc = session.docShell.GetDoc(),
      shell = session.view.GetWrtShell(),
      node = shell.GetActiveParagraph();
    try {
      node.SetText("Margin");
      const before = new SvxTextLeftMarginItem(new SvxIndentValue(2.5, unit), RES_MARGIN_TEXTLEFT),
        first = new SvxFirstLineIndentItem(
          new SvxIndentValue(-1.25, U.FONT_EM),
          RES_MARGIN_FIRSTLINE,
        );
      before.PutValue(32768, 6);
      first.SetTextFirstLineOffset(first.GetTextFirstLineOffset(), 200);
      first.SetAutoFirst(true);
      node.SetAttr(before);
      node.SetAttr(first);
      const oldLeft = before.Clone(),
        oldFirst = first.Clone(),
        cursor = shell.getShellCursor(),
        indices = [...doc.nodes.entries()];
      tabs(doc, 720);
      doc.GetUndoManager().Clear();
      expect(shell.MoveLeftMargin(true, false)).toBe(true);
      expect(node.GetParagraphTextLeftMargin()).toBe(unit === U.TWIP ? 723 : 720);
      expect((node.GetAttr(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem).equals(oldFirst)).toBe(
        true,
      );
      expect(action(doc).GetHistory().Count()).toBe(1);
      before.SetTextLeft(SvxIndentValue.twips(9000));
      first.ScaleMetrics(100);
      for (let cycle = 0; cycle < 3; cycle++) {
        expect(shell.Undo()).toBe(true);
        expect((node.GetAttr(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem).equals(oldLeft)).toBe(
          true,
        );
        expect(
          (node.GetAttr(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem).equals(oldFirst),
        ).toBe(true);
        tabs(doc, 240);
        expect(shell.Redo()).toBe(true);
        expect(node.GetParagraphTextLeftMargin()).toBe(unit === U.TWIP ? 243 : 240);
        expect((node.GetAttr(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem).GetPropLeft()).toBe(
          100,
        );
        expect(shell.getShellCursor()).toBe(cursor);
        expect(doc.nodes.entries()).toEqual(indices);
        expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
        expect(node.HasWriterListeners()).toBe(false);
      }
    } finally {
      session.Close();
    }
  },
);
it("restores inherited directness and resolves current style after temporary rollback", /** Checks reset history against an original inherited item. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell(),
    node = shell.GetActiveParagraph(),
    style = node.GetTextFormatColl();
  try {
    style.SetFormatAttr(new SvxTextLeftMarginItem(SvxIndentValue.twips(300), RES_MARGIN_TEXTLEFT));
    style.SetFormatAttr(
      new SvxFirstLineIndentItem(SvxIndentValue.twips(-150), RES_MARGIN_FIRSTLINE),
    );
    tabs(doc, 720);
    doc.GetUndoManager().Clear();
    expect(shell.MoveLeftMargin(true, false)).toBe(true);
    const a = action(doc),
      history = a.GetHistory();
    expect(a.GetPayloadSize()).toBe(2);
    expect(history.at(0).Which()).toBe(HISTORY_HINT.HSTRY_RESETFMTHNT);
    expect(history.at(1).Which()).toBe(HISTORY_HINT.HSTRY_RESETFMTHNT);
    expect(node.GetParagraphTextLeftMargin()).toBe(1020);
    expect(shell.Undo()).toBe(true);
    expect(node.GetpSwAttrSet()).toBeUndefined();
    style.SetFormatAttr(new SvxTextLeftMarginItem(SvxIndentValue.twips(500), RES_MARGIN_TEXTLEFT));
    style.SetFormatAttr(
      new SvxFirstLineIndentItem(SvxIndentValue.twips(-50), RES_MARGIN_FIRSTLINE),
    );
    expect(node.GetParagraphTextLeftMargin()).toBe(500);
    expect(shell.Redo()).toBe(true);
    expect(node.GetParagraphTextLeftMargin()).toBe(1220);
    expect(node.GetParagraphFirstLineIndent()).toBe(-50);
    expect(history.GetTmpEnd()).toBe(2);
    expect(shell.Undo()).toBe(true);
    expect(node.GetpSwAttrSet()).toBeUndefined();
  } finally {
    session.Close();
  }
});
it.each([
  [300, true, true, 720],
  [300, false, true, 0],
  [300, false, false, -420],
  [-300, true, true, 720],
  [-300, false, true, 0],
  [-300, false, false, -300],
  [720, true, true, 1440],
  [0, false, false, 0],
] as const)(
  "native document margin%s right%s modulus%s =>%s",
  /** Applies source arithmetic directly, including commands independent of the edit-shell guard. @param before - Initialized measure. @param right - Direction. @param modulus - Snapping. @param expected - Literal source result. @returns Nothing. */ (
    before,
    right,
    modulus,
    expected,
  ) => {
    const doc = new SwDoc(),
      node = doc.paragraphs[0] as SwTextNode,
      point = new SwPosition(node, 0),
      range = new SwPaM(point);
    try {
      node.SetAttr(new SvxTextLeftMarginItem(SvxIndentValue.twips(before), RES_MARGIN_TEXTLEFT));
      tabs(doc, 720);
      doc.MoveLeftMargin(range, right, modulus);
      expect(node.GetParagraphTextLeftMargin()).toBe(expected);
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    } finally {
      range.Dispose();
      point.Dispose();
      doc.Dispose();
    }
  },
);
it("records one inclusive range over actual body/cell nodes and skips structural sentinels", /** Checks original current graph indices, cells and selection ownership. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell(),
    body = shell.GetActiveParagraph(),
    table = doc.nodes.MakeTableNode("MarginTable");
  table.AddColumnWidth(4000);
  const cell = doc.nodes
      .AppendTableRow(table, 1)
      .GetTabBoxes()[0]
      ?.GetParagraphs()[0] as SwTextNode,
    outside = doc.nodes.MakeTextNode("Outside"),
    point = new SwPosition(cell, 0),
    mark = new SwPosition(body, 0),
    range = new SwPaM(point, mark);
  try {
    tabs(doc, 720);
    doc.GetUndoManager().Clear();
    shell.SetPaM(point, mark);
    doc.MoveLeftMargin(range, true, true, shell.CaptureCursorState());
    expect(body.GetParagraphTextLeftMargin()).toBe(720);
    expect(cell.GetParagraphTextLeftMargin()).toBe(720);
    expect(outside.GetParagraphTextLeftMargin()).toBe(0);
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    expect(action(doc).GetHistory().Count()).toBe(4);
    const replacement = new SwTextNode(
      cell.GetNodes(),
      cell.StartOfSectionNode(),
      cell.GetTextFormatColl(),
      "Replacement",
    );
    replacement.SetAttr(cell.GetSwAttrSet());
    doc.nodes.replaceTextNode(cell, replacement);
    expect(shell.Undo()).toBe(true);
    expect(body.GetpSwAttrSet()).toBeUndefined();
    expect(replacement.GetpSwAttrSet()).toBeUndefined();
    expect(cell.GetParagraphTextLeftMargin()).toBe(720);
    expect(shell.Redo()).toBe(true);
    expect(replacement.GetParagraphTextLeftMargin()).toBe(720);
    expect(body.HasWriterListeners()).toBe(false);
    expect(replacement.HasWriterListeners()).toBe(false);
  } finally {
    range.Dispose();
    point.Dispose();
    mark.Dispose();
    session.Close();
  }
});
it("uses empty default fallback without undo recording and repeats on the actual repeat range", /** Checks source initial, redo and repeat entrypoints. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    first = doc.paragraphs[0] as SwTextNode,
    second = doc.nodes.MakeTextNode("Second"),
    point = new SwPosition(first, 0),
    range = new SwPaM(point),
    repeatPoint = new SwPosition(second, 0),
    repeatRange = new SwPaM(repeatPoint);
  try {
    tabs(doc);
    const a = new SwUndoMoveLeftMargin(range, true, true);
    expect(a.GetPayloadSize()).toBe(0);
    doc.GetUndoManager().DoUndo(false);
    moveLeftMargin(doc, range, true, true, a.GetHistory());
    expect(first.GetParagraphTextLeftMargin()).toBe(1134);
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    expect(a.GetPayloadSize()).toBe(2);
    const restored: number[] = [];
    const nativeContext = {
      GetDoc: /** Borrows the initialized document. @returns Native graph. */ () => doc,
      RestoreCursor:
        /** Captures the native restored offset. @param state - Original cursor adjunct. @returns Nothing. */ (
          state: import("./undobj").SwUndoCursorState,
        ) => {
          restored.push(state.point.offset);
        },
    };
    a.UndoWithContext(nativeContext);
    expect(first.GetpSwAttrSet()).toBeUndefined();
    expect(restored).toEqual([0]);
    tabs(doc, 240);
    a.RedoWithContext(nativeContext);
    expect(first.GetParagraphTextLeftMargin()).toBe(240);
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    doc.GetUndoManager().DoUndo(true);
    a.RepeatImpl({
      GetDoc: nativeContext.GetDoc,
      GetRepeatPaM: /** Borrows actual selected range. @returns Native range. */ () => repeatRange,
    });
    expect(second.GetParagraphTextLeftMargin()).toBe(240);
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  } finally {
    range.Dispose();
    point.Dispose();
    repeatRange.Dispose();
    repeatPoint.Dispose();
    doc.Dispose();
  }
});
it("retains original owned snapshots and reset WhichIds through destructive and temporary history", /** Checks native record ownership independently of action adapters. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0] as SwTextNode,
    item = new SvxTextLeftMarginItem(new SvxIndentValue(1.25, U.FONT_EM), RES_MARGIN_TEXTLEFT),
    history = new SwHistory();
  item.PutValue(32768, 6);
  const old = item.Clone();
  history.AddHint(new SwHistorySetFormat(item, node.GetIndex()));
  history.AddHint(
    new SwHistoryResetFormat(new SvxFirstLineIndentItem(RES_MARGIN_FIRSTLINE), node.GetIndex()),
  );
  item.ScaleMetrics(100);
  node.SetAttr(new SvxFirstLineIndentItem(SvxIndentValue.twips(720), RES_MARGIN_FIRSTLINE));
  try {
    expect(history.TmpRollback(doc, 0)).toBe(true);
    expect((node.GetAttr(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem).equals(old)).toBe(true);
    expect(node.GetpSwAttrSet()?.GetItemIfSet(RES_MARGIN_FIRSTLINE, false)).toBeUndefined();
    history.SetTmpEnd(history.Count());
    expect(history.Rollback(doc)).toBe(true);
    expect(history.Count()).toBe(0);
  } finally {
    doc.Dispose();
  }
});
it.each([
  [false, false],
  [true, false],
  [false, true],
  [true, true],
] as const)(
  "native list merge direct-left%s direct-first%s applies independent original flags",
  /** Authors original numbered item geometry and independent direct overrides. @param directLeft - Existing left item. @param directFirst - Existing first item. @returns Nothing. */ (
    directLeft,
    directFirst,
  ) => {
    const session = createWriterDocumentSession(),
      doc = session.docShell.GetDoc(),
      shell = session.view.GetWrtShell(),
      node = shell.GetActiveParagraph();
    try {
      shell.SetParagraphListKind("bullet");
      const rule = node.GetNumRule();
      if (rule === undefined) throw new Error("Missing native list rule");
      const format = new SwNumFormat(rule.Get(0));
      if (format === undefined) throw new Error("Missing native list geometry");
      format.SetPositionAndSpaceMode("label-alignment");
      format.SetIndentAt(2000);
      format.SetFirstLineIndent(-300);
      rule.Set(0, format);
      const authored = rule.Get(0);
      node.ResetAttr([RES_MARGIN_TEXTLEFT, RES_MARGIN_FIRSTLINE]);
      if (directLeft)
        node.SetAttr(new SvxTextLeftMarginItem(SvxIndentValue.twips(333), RES_MARGIN_TEXTLEFT));
      if (directFirst)
        node.SetAttr(new SvxFirstLineIndentItem(SvxIndentValue.twips(-123), RES_MARGIN_FIRSTLINE));
      tabs(doc, 720);
      doc.GetUndoManager().Clear();
      const point = new SwPosition(node, 0),
        range = new SwPaM(point);
      try {
        doc.MoveLeftMargin(range, true, false, shell.CaptureCursorState());
      } finally {
        range.Dispose();
        point.Dispose();
      }
      expect(node.GetParagraphTextLeftMargin()).toBe((directLeft ? 333 : 2000) + 720);
      expect(node.GetParagraphFirstLineIndent()).toBe(directFirst ? -123 : -300);
      expect(shell.Undo()).toBe(true);
      expect(node.GetpSwAttrSet()?.GetItemIfSet(RES_MARGIN_TEXTLEFT, false) !== undefined).toBe(
        directLeft,
      );
      expect(node.GetpSwAttrSet()?.GetItemIfSet(RES_MARGIN_FIRSTLINE, false) !== undefined).toBe(
        directFirst,
      );
      expect(node.GetNumRule()?.Get(0)).toBe(authored);
    } finally {
      session.Close();
    }
  },
);
it("leaves legacy list geometry outside the alignment-only merge", /** Checks source mode guard with actual numbering state. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell(),
    node = shell.GetActiveParagraph();
  try {
    shell.SetParagraphListKind("bullet");
    const rule = node.GetNumRule();
    if (rule === undefined) throw new Error("Missing native list rule");
    const format = new SwNumFormat(rule.Get(0));
    if (format === undefined) throw new Error("Missing native list geometry");
    format.SetPositionAndSpaceMode("label-width-and-position");
    format.SetIndentAt(2000);
    format.SetFirstLineIndent(-300);
    rule.Set(0, format);
    node.ResetAttr([RES_MARGIN_TEXTLEFT, RES_MARGIN_FIRSTLINE]);
    tabs(doc, 720);
    doc.GetUndoManager().Clear();
    const point = new SwPosition(node, 0),
      range = new SwPaM(point);
    try {
      doc.MoveLeftMargin(range, true, false);
    } finally {
      range.Dispose();
      point.Dispose();
    }
    expect(node.GetParagraphTextLeftMargin()).toBe(720);
    expect(
      (node.GetAttr(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem).ResolveTextFirstLineOffset(),
    ).toBe(0);
  } finally {
    session.Close();
  }
});
