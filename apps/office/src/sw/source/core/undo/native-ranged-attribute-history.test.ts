/** @fileoverview Source contracts for recorded hint splits, merges, exact resets and native history receiver lifetime. */
import { assert, expect, it } from "vitest";
import { SwCharFormat } from "../../../inc/charfmt";
import { SwDoc } from "../doc/doc";
import {
  SwRegHistory,
  SwHistory,
  SwHistoryResetText,
  SwHistorySetText,
  HISTORY_HINT,
} from "./rolbck";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SvxColorItem } from "../../../../editeng/inc/colritem";
import { Color } from "../../../../tools/inc/color";
import {
  RES_CHRATR_COLOR,
  WRITER_CHARACTER_WHICH_RANGES,
  RES_TXTATR_AUTOFMT,
  RES_TXTATR_CHARFMT,
} from "../../../inc/hintids";
import { MakeTextAttr } from "../txtnode/thints";
import { SwFormatCharFormat } from "../txtnode/fmtatr2";
import { SetAttrMode } from "../../../inc/swtypes";
/** Builds a real automatic-format item through the original pool/style owner. @param doc - Actual document. @param color - Native RGB. @returns Native item set. */
function colorSet(doc: SwDoc, color: number): SfxItemSet {
  const set = new SfxItemSet(doc.GetAttrPool(), WRITER_CHARACTER_WHICH_RANGES);
  set.Put(new SvxColorItem(new Color(color), RES_CHRATR_COLOR));
  return set;
}
it("records original split/new/merged portions and restores them through native temporary rollback", /** Exercises the actual native insertion and history graph without text replacement. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  node.SetText("abcdef");
  const original = MakeTextAttr(doc, colorSet(doc, 0x112233), 0, 6);
  const owned = node.InsertItem(original.GetAttr(), 0, 6, SetAttrMode.NOHINTADJUST);
  assert(owned);
  owned.SetFormatIgnoreStart(true);
  const before = node.GetOrCreateSwpHints().clone(),
    history = new SwHistory(),
    recorder = new SwRegHistory(node, node, history);
  node.GetOrCreateSwpHints().Register(recorder);
  try {
    node.InsertItem(MakeTextAttr(doc, colorSet(doc, 0xabcdef), 2, 4).GetAttr(), 2, 4);
    const hints = node.GetpSwpHints();
    assert(hints);
    expect(
      hints
        .entries()
        .map(
          /** Reads actual owned ranges. @param hint - Attribute. @returns Range. */ (hint) => [
            hint.start,
            hint.end,
          ],
        ),
    ).toEqual([
      [0, 2],
      [2, 4],
      [4, 6],
    ]);
    expect(history.Count()).toBeGreaterThan(3);
    expect(history.at(0).Which()).toBe(HISTORY_HINT.HSTRY_SETTXTHNT);
    expect(
      Array.from(
        { length: history.Count() },
        /** Reads recorded source kinds. @param unused - Empty slot. @param index - Actual entry. @returns Kind. */ (
          unused,
          index,
        ) => {
          void unused;
          return history.at(index).Which();
        },
      ),
    ).toContain(HISTORY_HINT.HSTRY_RESETTXTHNT);
    hints.DeRegister();
    expect(hints.GetHistory()).toBeUndefined();
    expect(history.TmpRollback(doc, 0)).toBe(true);
    expect(node.GetOrCreateSwpHints().equals(before)).toBe(true);
    expect(node.GetOrCreateSwpHints().Get(0).IsFormatIgnoreStart()).toBe(true);
    expect(history.GetTmpEnd()).toBe(0);
    history.SetTmpEnd(history.Count());
    expect(history.GetTmpEnd()).toBe(history.Count());
  } finally {
    node.GetpSwpHints()?.DeRegister();
    recorder.Dispose();
    doc.Dispose();
  }
});
it("records and rolls back a merge without losing the original separate attribute owners", /** Verifies old and reset entries surround endpoint changes and deletion. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  node.SetText("abcdef");
  const item = MakeTextAttr(doc, colorSet(doc, 0x112233), 0, 3).GetAttr();
  node.InsertItem(item, 0, 3, SetAttrMode.NOHINTADJUST);
  node.InsertItem(item, 3, 6, SetAttrMode.NOHINTADJUST);
  const before = node
      .GetOrCreateSwpHints()
      .entries()
      .map(
        /** Retains raw separate source portions; portable container snapshots normalize adjacent equal values. @param hint - Original attribute. @returns Independent raw owner. */
        (hint) => hint.clone(),
      ),
    history = new SwHistory(),
    recorder = new SwRegHistory(node, node, history),
    hints = node.GetOrCreateSwpHints();
  hints.Register(recorder);
  try {
    expect(hints.MergePortions(node)).toBe(true);
    expect(hints.Count()).toBe(1);
    expect(history.Count()).toBe(3);
    expect(history.at(2)).toBeInstanceOf(SwHistoryResetText);
    hints.DeRegister();
    history.Rollback(doc);
    const restored = node.GetOrCreateSwpHints().entries();
    expect(
      restored.map(
        /** Reads exact restored endpoints. @param hint - Attribute. @returns Range. */ (hint) => [
          hint.start,
          hint.end,
        ],
      ),
    ).toEqual([
      [0, 3],
      [3, 6],
    ]);
    for (const [index, hint] of restored.entries()) {
      const prior = before[index];
      assert(prior);
      expect(hint.format.equals(prior.format)).toBe(true);
    }
  } finally {
    node.GetpSwpHints()?.DeRegister();
    recorder.Dispose();
    doc.Dispose();
  }
});
it("retains original exact-reset forward-loop behavior for same-span character styles", /** Source DeleteAttributes increments its index after deletion and explicitly does not respect sort number. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  node.SetText("abc");
  for (const name of ["A", "B", "C"])
    node.InsertItem(
      new SwFormatCharFormat(doc.MakeCharFormat(name, doc.GetDfltCharFormat())),
      0,
      3,
      SetAttrMode.NOHINTADJUST,
    );
  try {
    const hints = node.GetOrCreateSwpHints(),
      middle = hints.Get(1);
    node.DeleteAttributes(RES_TXTATR_CHARFMT, 0, 3);
    expect(node.GetpSwpHints()?.entries()).toEqual([middle]);
    new SwHistoryResetText(RES_TXTATR_CHARFMT, 0, 3, node.GetIndex()).SetInDoc(doc, false);
    expect(node.GetpSwpHints()).toBeUndefined();
    node.DeleteAttributes(RES_TXTATR_AUTOFMT, 0, 3);
  } finally {
    doc.Dispose();
  }
});

it("rejects restoration of an unregistered character owner and snapshots reset coordinates by value", /** Matches native character-table lifetime and reset payload contracts. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  node.SetText("abc");
  const orphan = new SwCharFormat(doc.GetAttrPool(), "Unregistered"),
    attr = MakeTextAttr(doc, new SwFormatCharFormat(orphan), 0, 3);
  try {
    const entry = new SwHistorySetText(attr, node.GetIndex());
    entry.SetInDoc(doc, false);
    expect(node.GetpSwpHints()).toBeUndefined();
    const actual = node.InsertItem(
      new SwFormatCharFormat(doc.MakeCharFormat("Owned", doc.GetDfltCharFormat())),
      0,
      3,
      SetAttrMode.NOHINTADJUST,
    );
    assert(actual);
    const history = new SwHistory();
    history.AddTextAttr(actual, node.GetIndex(), true);
    expect((history.at(0) as SwHistoryResetText).GetWhich()).toBe(RES_TXTATR_CHARFMT);
    actual.SetStart(1);
    history.Rollback(doc);
    expect(node.GetpSwpHints()?.entries()).toEqual([actual]);
  } finally {
    orphan.DisposeModify();
    doc.Dispose();
  }
});
