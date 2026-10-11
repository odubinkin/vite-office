/** @fileoverview Verifies native format history registration, old/reset partition and scoped node deltas without upstream. */
import { expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwTextNode } from "../txtnode/ndtxt";
import {
  SwHistory,
  SwRegHistory,
  SwHistorySetAttrSet,
  SwHistorySetFormat,
  SwHistoryResetFormat,
  HISTORY_HINT,
} from "./rolbck";
import {
  SvxIndentValue,
  SvxFirstLineIndentItem,
  SvxTextLeftMarginItem,
  SvxLRSpaceItem,
} from "../../../../editeng/inc/lrspitem";
import { SwAttrSet } from "../attr/swatrset";
import { SwModify } from "../../../inc/calbck";
import { AttrSetChangeHint, SwAttrSetChg } from "../../../inc/hints";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";
import {
  RES_MARGIN_TEXTLEFT,
  RES_MARGIN_FIRSTLINE,
  RES_LR_SPACE,
  RES_BOXATR_FORMULA,
  RES_BOXATR_VALUE,
  WRITER_TEXT_NODE_WHICH_RANGES,
} from "../../../inc/hintids";
/** Builds an initialized native left item. @param value - Stored TWIP. @returns Owned item. */
function left(value: number): SvxTextLeftMarginItem {
  return new SvxTextLeftMarginItem(SvxIndentValue.twips(value), RES_MARGIN_TEXTLEFT);
}
/** Builds a native old-delta set. @param doc - Owning pool. @returns Native initialized delta. */
function delta(doc: SwDoc): SwAttrSet {
  return new SwAttrSet(doc.GetAttrPool(), WRITER_TEXT_NODE_WHICH_RANGES);
}
it.each([false, true])(
  "native registered single old item direct%s restores old state or reset",
  /** Captures initialized delta notifications on the original node itself. @param direct - Initial direct state. @returns Nothing. */ (
    direct,
  ) => {
    const doc = new SwDoc(),
      node = doc.paragraphs[0] as SwTextNode,
      history = new SwHistory();
    try {
      if (direct) node.SetAttr(left(300));
      const reg = new SwRegHistory(node, node, history);
      node.SetAttr(left(720));
      reg.Dispose();
      expect(reg.GetRegisteredIn()).toBeUndefined();
      expect(node.HasWriterListeners()).toBe(false);
      expect(history.Count()).toBe(1);
      expect(history.at(0).Which()).toBe(
        direct ? HISTORY_HINT.HSTRY_SETFMTHNT : HISTORY_HINT.HSTRY_RESETFMTHNT,
      );
      expect(history.TmpRollback(doc, 0)).toBe(true);
      expect(node.GetParagraphTextLeftMargin()).toBe(direct ? 300 : 0);
      expect(node.GetpSwAttrSet()?.GetItemIfSet(RES_MARGIN_TEXTLEFT, false) !== undefined).toBe(
        direct,
      );
      expect(history.TmpRollback(doc, 0)).toBe(false);
      history.SetTmpEnd(history.Count());
      node.SetAttr(left(900));
      expect(history.TmpRollback(doc, 0)).toBe(true);
      expect(node.GetParagraphTextLeftMargin()).toBe(direct ? 300 : 0);
      node.SetAttr(left(1000));
      expect(history.Count()).toBe(1);
    } finally {
      doc.Dispose();
    }
  },
);
it.each([false, true])(
  "native multi old/reset partition temporary%s retains direct attributes and inherited first line",
  /** Mutates a real native ItemSet under one registered scope. @param tmp - Temporary policy. @returns Nothing. */ (
    tmp,
  ) => {
    const doc = new SwDoc(),
      node = doc.paragraphs[0] as SwTextNode,
      history = new SwHistory(),
      items = new SfxItemSet(doc.GetAttrPool(), WRITER_TEXT_NODE_WHICH_RANGES);
    try {
      node.SetAttr(left(300));
      const reg = new SwRegHistory(node, node, history);
      items.Put(left(720));
      items.Put(new SvxFirstLineIndentItem(SvxIndentValue.twips(-360), RES_MARGIN_FIRSTLINE));
      node.SetAttr(items);
      reg.Dispose();
      expect(history.Count()).toBe(1);
      expect(history.at(0).Which()).toBe(HISTORY_HINT.HSTRY_SETATTRSET);
      expect(tmp ? history.TmpRollback(doc, 0) : history.Rollback(doc)).toBe(true);
      expect(node.GetParagraphTextLeftMargin()).toBe(300);
      expect(node.GetpSwAttrSet()?.GetItemIfSet(RES_MARGIN_FIRSTLINE, false)).toBeUndefined();
      expect(doc.GetUndoManager().DoesUndo()).toBe(true);
    } finally {
      doc.Dispose();
    }
  },
);
it.each(["ordinary", "no-history", "no-new", "same", "no-old", "empty"] as const)(
  "native registration ignores source guard%s",
  /** Exercises original hint admission against initialized native deltas. @param kind - Native hint guard. @returns Nothing. */ (
    kind,
  ) => {
    const doc = new SwDoc(),
      node = doc.paragraphs[0] as SwTextNode,
      history = new SwHistory(),
      set = delta(doc),
      old = new SwAttrSetChg(set, set),
      reg = new SwRegHistory(node, node, kind === "no-history" ? undefined : history);
    try {
      if (kind !== "empty") set.Put(left(300));
      if (kind === "ordinary") node.CallSwClientNotify({ kind: "cursor-selection-changed" });
      else
        node.CallSwClientNotify(
          new AttrSetChangeHint(
            kind === "no-old" ? undefined : old,
            kind === "no-new" ? undefined : kind === "same" ? old : new SwAttrSetChg(set, set),
          ),
        );
      expect(history.Count()).toBe(0);
    } finally {
      reg.Dispose();
      doc.Dispose();
    }
  },
);
it("retains no direct WhichIds for absent or generic sources and replays registered format owners", /** Checks optional source lifetime and source-native registered format history. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0] as SwTextNode,
    history = new SwHistory(),
    generic = new SwModify(),
    absent = new SwRegHistory(undefined, node, history),
    reg = new SwRegHistory(generic, node, history),
    style = node.GetTextFormatColl();
  try {
    expect(absent.GetRegisteredIn()).toBeUndefined();
    expect(reg.GetRegisteredIn()).toBe(generic);
    const old = delta(doc),
      current = delta(doc);
    old.Put(left(0));
    current.Put(left(300));
    generic.CallSwClientNotify(
      new AttrSetChangeHint(new SwAttrSetChg(old, old), new SwAttrSetChg(current, current)),
    );
    expect(history.at(0).Which()).toBe(HISTORY_HINT.HSTRY_RESETFMTHNT);
    style.SetFormatAttr(left(300));
    const registered = new SwRegHistory(style, node, history);
    style.SetFormatAttr(left(720));
    registered.Dispose();
    expect(history.at(1).Which()).toBe(HISTORY_HINT.HSTRY_SETFMTHNT);
  } finally {
    absent.Dispose();
    reg.Dispose();
    generic.DisposeModify();
    doc.Dispose();
  }
});
it("uses source table frame restoration and only the first multi reset identity", /** Checks initialized original table frame history rather than text-only fallback. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("HistoryTable"),
    format = table.GetFrameFormat(),
    item = new SvxLRSpaceItem(RES_LR_SPACE),
    set = new SfxItemSet(doc.GetAttrPool(), [[RES_LR_SPACE, RES_LR_SPACE]]);
  try {
    item.SetTextLeft(SvxIndentValue.twips(300));
    format.SetFormatAttr(item);
    const old = new SwHistorySetFormat(item, table.GetTableNode().GetIndex());
    item.SetTextLeft(SvxIndentValue.twips(720));
    format.SetFormatAttr(item);
    old.SetInDoc(doc, true);
    expect(format.GetLRSpace().ResolveTextLeft()).toBe(300);
    new SwHistoryResetFormat(item, table.GetTableNode().GetIndex()).SetInDoc(doc, false);
    expect(format.GetAttrSet().GetItemIfSet(RES_LR_SPACE, false)).toBeUndefined();
    set.Put(item);
    const restore = new SwHistorySetAttrSet(
      set,
      table.GetTableNode().GetIndex(),
      new Set([RES_LR_SPACE]),
    );
    restore.SetInDoc(doc, true);
    expect(format.GetLRSpace().ResolveTextLeft()).toBe(720);
    const reset = new SwHistorySetAttrSet(set, table.GetTableNode().GetIndex(), new Set());
    reset.SetInDoc(doc, false);
    expect(format.GetAttrSet().GetItemIfSet(RES_LR_SPACE, false)).toBeUndefined();
    doc.GetUndoManager().DoUndo(false);
    restore.SetInDoc(doc, false);
    expect(doc.GetUndoManager().DoesUndo()).toBe(false);
    new SwHistorySetAttrSet(
      new SfxItemSet(doc.GetAttrPool(), [[RES_LR_SPACE, RES_LR_SPACE]]),
      table.GetTableNode().GetIndex(),
      new Set(),
    ).SetInDoc(doc, true);
  } finally {
    doc.Dispose();
  }
});
it("native multi-history skips retained numeric values and rejects unimplemented formula name conversion", /** Checks explicit original exceptional item responsibilities. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0] as SwTextNode,
    set = new SfxItemSet(doc.GetAttrPool(), [[RES_BOXATR_FORMULA, RES_BOXATR_VALUE]]);
  try {
    set.Put(new SfxInt16Item(RES_BOXATR_VALUE, 42));
    const history = new SwHistorySetAttrSet(set, node.GetIndex(), new Set([RES_BOXATR_VALUE]));
    history.SetInDoc(doc, true);
    expect(node.GetpSwAttrSet()?.GetItemIfSet(RES_BOXATR_VALUE, false)).toBeUndefined();
    set.Put(new SfxInt16Item(RES_BOXATR_FORMULA, 1));
    expect(
      /** Attempts the explicitly unimplemented original exceptional conversion. @returns Native history. */ () =>
        new SwHistorySetAttrSet(
          set,
          node.GetIndex(),
          new Set([RES_BOXATR_FORMULA, RES_BOXATR_VALUE]),
        ),
    ).toThrow("Writer history formula external-name conversion is not implemented.");
  } finally {
    doc.Dispose();
  }
});
it("native content-node deltas include complete old/new items before the existing model observer", /** Checks real insertion, clearing and current-owner borrowed deltas. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0] as SwTextNode,
    history = new SwHistory(),
    reg = new SwRegHistory(node, node, history);
  try {
    node.SetAttr(left(300));
    expect(history.Count()).toBe(1);
    node.ResetAttr(RES_MARGIN_TEXTLEFT);
    expect(history.Count()).toBe(2);
    node.SetAttr(left(720));
    node.ResetAttr([RES_MARGIN_TEXTLEFT]);
    node.SetAttr(left(900));
    expect(node.ResetAllAttr()).toBe(1);
    expect(history.Count()).toBe(6);
  } finally {
    reg.Dispose();
    doc.Dispose();
  }
});
