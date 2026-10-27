/** @fileoverview Native style undo capture retains scalar old values and repeated notification ownership. */
import { assert, expect, it } from "vitest";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { LegacyModifyHint } from "../../../inc/calbck";
import { RES_CHRATR_FONTSIZE } from "../../../inc/hintids";
import { createWriterDocument } from "../doc/doc";
import { SwUndoFormatAttr, SwUndoFormatAttrHelper } from "./unattr";
import type { SwUndoRedoContext } from "./undobj";

it("swaps scalar format history and admits an already-transferred empty action", /** Checks actual format change notifications across undo and redo without retaining node indices. @returns Nothing. */ () => {
  const doc = createWriterDocument();
  try {
    const format = doc.MakeTextFormatColl("History", doc.GetDfltTextFormatColl());
    const old = new SvxFontHeightItem(240, 100, RES_CHRATR_FONTSIZE);
    const action = new SwUndoFormatAttr(old, format);
    const context: SwUndoRedoContext = {
      GetDoc: /** Returns the original graph. @returns Document. */ () => doc,
      RestoreCursor: /** Style changes have no text cursor delta. @returns Nothing. */ () => {},
    };
    format.SetFormatAttr(new SvxFontHeightItem(360, 100, RES_CHRATR_FONTSIZE));
    action.UndoWithContext(context);
    expect((format.GetAttrSet().Get(RES_CHRATR_FONTSIZE) as SvxFontHeightItem).GetHeight()).toBe(
      240,
    );
    action.RedoWithContext(context);
    expect((format.GetAttrSet().Get(RES_CHRATR_FONTSIZE) as SvxFontHeightItem).GetHeight()).toBe(
      360,
    );
    action.m_oOldSet = undefined;
    action.UndoWithContext(context);
    expect((format.GetAttrSet().Get(RES_CHRATR_FONTSIZE) as SvxFontHeightItem).GetHeight()).toBe(
      360,
    );
  } finally {
    doc.Dispose();
  }
});

it("overwrites an already-captured old item on subsequent attribute-set notifications", /** Checks native PutAttr accumulation through the actual format notifier. @returns Nothing. */ () => {
  const doc = createWriterDocument();
  const format = doc.MakeTextFormatColl("Capture", doc.GetDfltTextFormatColl());
  const helper = new SwUndoFormatAttrHelper(format);
  try {
    expect(helper.GetUndo()).toBeUndefined();
    format.SetFormatAttr(new SvxFontHeightItem(300, 100, RES_CHRATR_FONTSIZE));
    const first = helper.GetUndo();
    assert(first);
    format.SetFormatAttr(new SvxFontHeightItem(360, 100, RES_CHRATR_FONTSIZE));
    expect(helper.GetUndo()).toBe(first);
    expect((first.m_oOldSet?.Get(RES_CHRATR_FONTSIZE) as SvxFontHeightItem).GetHeight()).toBe(300);
  } finally {
    helper.Dispose();
    doc.Dispose();
  }
});

it("captures complete legacy item notifications and ignores missing old or new items", /** Checks original legacy hint admission without substituting the notification channel. @returns Nothing. */ () => {
  const doc = createWriterDocument();
  const format = doc.MakeTextFormatColl("Legacy", doc.GetDfltTextFormatColl());
  const helper = new SwUndoFormatAttrHelper(format);
  const old = new SvxFontHeightItem(240, 100, RES_CHRATR_FONTSIZE);
  const next = new SvxFontHeightItem(300, 100, RES_CHRATR_FONTSIZE);
  try {
    format.CallSwClientNotify(new LegacyModifyHint(undefined, next));
    format.CallSwClientNotify(new LegacyModifyHint(old, undefined));
    expect(helper.GetUndo()).toBeUndefined();
    format.CallSwClientNotify(new LegacyModifyHint(old, next));
    const action = helper.GetUndo();
    assert(action);
    expect((action.m_oOldSet?.Get(RES_CHRATR_FONTSIZE) as SvxFontHeightItem).GetHeight()).toBe(240);
    format.CallSwClientNotify(new LegacyModifyHint(next, old));
    expect(helper.GetUndo()).toBe(action);
    expect((action.m_oOldSet?.Get(RES_CHRATR_FONTSIZE) as SvxFontHeightItem).GetHeight()).toBe(300);
  } finally {
    helper.Dispose();
    doc.Dispose();
  }
});

it("moves captured undo ownership only through ReleaseUndo", () => {
  const doc = createWriterDocument();
  const format = doc.MakeTextFormatColl("Transfer", doc.GetDfltTextFormatColl());
  const helper = new SwUndoFormatAttrHelper(format);
  try {
    format.SetFormatAttr(new SvxFontHeightItem(300, 100, RES_CHRATR_FONTSIZE));
    const borrowed = helper.GetUndo();
    assert(borrowed);
    const owned = helper.ReleaseUndo();
    expect(owned).toBe(borrowed);
    expect(helper.GetUndo()).toBeUndefined();
    expect(helper.ReleaseUndo()).toBeUndefined();
    helper.Dispose();
    expect(owned?.m_oOldSet?.Count()).toBe(1);
    owned?.Dispose();
    expect(owned?.m_oOldSet).toBeUndefined();
  } finally {
    helper.Dispose();
    doc.Dispose();
  }
});
