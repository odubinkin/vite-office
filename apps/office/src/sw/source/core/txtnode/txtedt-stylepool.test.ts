/** @fileoverview Checks native selective reset pool reconstruction, shared remaining styles, adjacent merge and undo retained handles. */
import { afterEach, describe, expect, it, vi } from "vitest";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";
import { SvxPostureItem, SvxWeightItem } from "../../../../editeng/source/items/textitem";
import { SwAutoStyleFamily } from "../../../inc/istyleaccess";
import { SwDoc } from "../doc/doc";
import { SwpHints } from "./ndhints";
import { SwFormatAutoFormat, SwTextAttrEnd } from "./txatbase";
import { MakeTextAttr } from "./thints";
import type { SwFormatINetFormat } from "./fmtatr2";
import { resetParagraphTextAttributes } from "./txtedt";

afterEach(
  /** Restores observed real owner methods. @returns Nothing. */ () => vi.restoreAllMocks(),
);
/** Requires actual ownership. @param value - Optional owner. @returns Present owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing reset pool owner");
  return value;
}
/** Builds concrete items used by actual reset. @param doc - Owner. @param weight - Removed item. @returns Real style set. */
function input(doc: SwDoc, weight = 8): SfxItemSet {
  const set = new SfxItemSet(doc.GetAttrPool(), [[1, 49]]);
  set.Put(new SvxPostureItem(2, 11));
  set.Put(new SvxWeightItem(weight, 15));
  return set;
}
/** Reads the automatic handle of a registered hint. @param hint - Real range. @returns Shared style. */
function handle(hint: SwTextAttrEnd<SwFormatINetFormat | SwFormatAutoFormat>): SfxItemSet {
  return (hint.format as SwFormatAutoFormat).GetStyleHandle();
}

describe("pooled selective automatic hint reconstruction", /** Groups actual reset owners. @returns Nothing. */ () => {
  it.each([0, 1, 2, 3, 4, 5, 6, 7])(
    "reuses remaining pooled style and restores original retained undo handle for flags %s",
    /** Checks immutable original, native two access calls and fresh defaults. @param mask - Original flags. @returns Nothing. */ (
      mask,
    ) => {
      const doc = new SwDoc(),
        node = required(doc.paragraphs[0]),
        set = input(doc);
      node.SetText("abcdefgh");
      const hint = MakeTextAttr(doc, set, 2, 6);
      hint.dontExpand = (mask & 1) !== 0;
      hint.dontExpandStart = (mask & 2) !== 0;
      hint.dontMoveAttr = (mask & 4) !== 0;
      node.SetTextHints(new SwpHints(doc.GetAttrPool(), [hint]));
      const original = required(node.GetpSwpHints()).Get(0),
        originalHandle = handle(original);
      const undo = doc.GetUndoManager().GetUndoNodes(),
        retainedId = undo.RetainText(node.CaptureTextFragment(0, 8));
      const remaining = set.Clone();
      remaining.ClearItem(15);
      const expected = doc
        .GetIStyleAccess()
        .getAutomaticStyle(remaining, SwAutoStyleFamily.AUTO_STYLE_CHAR);
      const access = vi.spyOn(doc.GetIStyleAccess(), "getAutomaticStyle"),
        notify = vi.spyOn(doc, "NotifyModelChange"),
        reset = new SfxItemSet(doc.GetAttrPool(), [[1, 49]]);
      reset.Put(new SvxWeightItem(5, 15));
      resetParagraphTextAttributes(node, false, reset);
      const rebuilt = required(node.GetpSwpHints()).Get(0);
      expect(handle(rebuilt)).toBe(expected);
      expect(handle(rebuilt)).not.toBe(originalHandle);
      expect(rebuilt).toMatchObject({
        start: 2,
        end: 6,
        dontExpand: false,
        dontExpandStart: false,
        dontMoveAttr: false,
      });
      expect(access).toHaveBeenCalledTimes(2);
      expect(notify).toHaveBeenCalledTimes(1);
      expect(originalHandle.Count()).toBe(2);
      expect(originalHandle.Get(15).QueryValue()).toBe(8);
      const retained = undo.GetText(retainedId).hints;
      expect(handle(retained.Get(0))).toBe(originalHandle);
      node.SetTextHints(retained);
      expect(handle(required(node.GetpSwpHints()).Get(0))).toBe(originalHandle);
      expect(required(node.GetpSwpHints()).Get(0)).toMatchObject({
        dontExpand: hint.dontExpand,
        dontExpandStart: hint.dontExpandStart,
        dontMoveAttr: hint.dontMoveAttr,
      });
      access.mockClear();
      resetParagraphTextAttributes(node, false, reset);
      expect(handle(required(node.GetpSwpHints()).Get(0))).toBe(expected);
      expect(access).toHaveBeenCalledTimes(2);
      undo.Release(retainedId);
    },
  );
  it("merges adjacent distinct styles after removal produces one shared remaining handle", /** Checks the actual value removal and range normalization consumer. @returns Nothing. */ () => {
    const doc = new SwDoc(),
      node = required(doc.paragraphs[0]);
    node.SetText("abcdefgh");
    const a = MakeTextAttr(doc, input(doc, 8), 0, 4),
      b = MakeTextAttr(doc, input(doc, 5), 4, 8);
    expect(handle(a)).not.toBe(handle(b));
    node.SetTextHints(new SwpHints(doc.GetAttrPool(), [a, b]));
    expect(required(node.GetpSwpHints()).Count()).toBe(2);
    const reset = new SfxItemSet(doc.GetAttrPool(), [[1, 49]]);
    reset.Put(new SvxWeightItem(0, 15));
    resetParagraphTextAttributes(node, false, reset);
    const hints = required(node.GetpSwpHints());
    expect(hints.Count()).toBe(1);
    expect(hints.Get(0)).toMatchObject({ start: 0, end: 8 });
    expect(handle(hints.Get(0)).Count()).toBe(1);
    expect(handle(hints.Get(0)).Get(11).QueryValue()).toBe(2);
    expect(handle(a).Get(15).QueryValue()).toBe(8);
    expect(handle(b).Get(15).QueryValue()).toBe(5);
  });
  it.each(["noCommon", "empty", "whole", "exact"])(
    "avoids pool insertion for %s decisions",
    /** Checks existing reset ordering and empty/no-op branches. @param kind - Native decision. @returns Nothing. */ (
      kind,
    ) => {
      const doc = new SwDoc(),
        node = required(doc.paragraphs[0]);
      node.SetText("abcdefgh");
      node.SetTextHints(new SwpHints(doc.GetAttrPool(), [MakeTextAttr(doc, input(doc), 2, 6)]));
      const owned = node.GetpSwpHints(),
        reset = new SfxItemSet(doc.GetAttrPool(), [[1, 54]]);
      if (kind === "whole") reset.Put(new SwFormatAutoFormat(input(doc)));
      else if (kind === "noCommon") reset.Put(new SfxInt16Item(14, 1));
      else {
        reset.Put(new SvxWeightItem(5, 15));
        reset.Put(new SvxPostureItem(0, 11));
      }
      const access = vi.spyOn(doc.GetIStyleAccess(), "getAutomaticStyle"),
        notify = vi.spyOn(doc, "NotifyModelChange");
      resetParagraphTextAttributes(node, kind === "exact", reset);
      expect(access).not.toHaveBeenCalled();
      if (kind === "noCommon" || kind === "exact") {
        expect(node.GetpSwpHints()).toBe(owned);
        expect(notify).not.toHaveBeenCalled();
      } else {
        expect(node.GetpSwpHints()).toBeUndefined();
        expect(notify).toHaveBeenCalledTimes(1);
      }
    },
  );
});
