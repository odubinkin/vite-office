/** @fileoverview Checks real document-owned automatic character handles, copying, hint normalization and snapshot decoding. */
import { describe, expect, it } from "vitest";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";
import { SvxWeightItem } from "../../../../editeng/source/items/textitem";
import { SwAutoStyleFamily } from "../../../inc/istyleaccess";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { SwpHints } from "../txtnode/ndhints";
import { SwFormatAutoFormat, SwTextAttrEnd, createSwFormatAutoFormat } from "../txtnode/txatbase";
import { SwDoc } from "./doc";

/** Builds a direct character input. @param doc - Real owner. @returns Concrete input set. */
function input(doc: SwDoc): SfxItemSet {
  const set = new SfxItemSet(doc.GetAttrPool(), [[1, 15]]);
  set.Put(new SvxWeightItem(8, 15));
  return set;
}
/** Returns a present value without hiding missing real ownership. @param value - Optional owner. @returns Present owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing automatic style owner");
  return value;
}

describe("document-owned automatic character handles", /** Groups actual model consumers. @returns Nothing. */ () => {
  it("retains one manager per document and separates equal styles between documents", /** Checks document-owned pools, not a global cache. @returns Nothing. */ () => {
    const a = new SwDoc(),
      b = new SwDoc(),
      access = a.GetIStyleAccess();
    expect(a.GetIStyleAccess()).toBe(access);
    expect(b.GetIStyleAccess()).not.toBe(access);
    const set = input(a),
      handle = access.getAutomaticStyle(set, SwAutoStyleFamily.AUTO_STYLE_CHAR);
    expect(access.getAutomaticStyle(set.Clone(), SwAutoStyleFamily.AUTO_STYLE_CHAR)).toBe(handle);
    expect(handle).not.toBe(set);
    expect(
      b.GetIStyleAccess().getAutomaticStyle(input(b), SwAutoStyleFamily.AUTO_STYLE_CHAR),
    ).not.toBe(handle);
    set.ClearItem();
    expect(handle.Count()).toBe(1);
  });
  it("copies an independent non-shareable attribute while retaining and assigning the exact handle", /** Checks raw handle identity separately from content equality. @returns Nothing. */ () => {
    const doc = new SwDoc(),
      set = input(doc),
      a = new SwFormatAutoFormat(set),
      b = a.Clone();
    expect(a.GetStyleHandle()).toBe(set);
    expect(b).not.toBe(a);
    expect(b.GetStyleHandle()).toBe(set);
    expect(a.isShareable()).toBe(false);
    expect(b.isShareable()).toBe(false);
    expect(a.equals(b)).toBe(true);
    const other = set.Clone(),
      c = new SwFormatAutoFormat(other);
    expect(set.Equals(other, true)).toBe(true);
    expect(a.equals(c)).toBe(false);
    expect(a.equals(new SfxInt16Item(53, 0))).toBe(false);
    b.SetStyleHandle(other);
    expect(b.GetStyleHandle()).toBe(other);
    expect(a.equals(b)).toBe(false);
    expect(c.equals(b)).toBe(true);
    expect(a.GetStyleHandle()).toBe(set);
  });
  it.each([false, true])(
    "interns ordinary factory values with bold=%s and preserves cloned ranges",
    /** Checks actual factory and ranged hints. @param bold - Visible property. @returns Nothing. */ (
      bold,
    ) => {
      const doc = new SwDoc(),
        pool = doc.GetAttrPool(),
        attributes = { bold, italic: false, underline: true };
      const a = createSwFormatAutoFormat(pool, attributes),
        b = createSwFormatAutoFormat(pool, attributes);
      expect(a).not.toBe(b);
      expect(a.GetStyleHandle()).toBe(b.GetStyleHandle());
      const hint = new SwTextAttrEnd(a, 0, 2);
      hint.dontExpand = true;
      const hints = new SwpHints(pool, [hint, new SwTextAttrEnd(b, 2, 4)]);
      expect(hints.Count()).toBe(1);
      expect(hints.Get(0)).toMatchObject({ start: 0, end: 4, dontExpand: true });
      expect((hints.clone().Get(0).format as SwFormatAutoFormat).GetStyleHandle()).toBe(
        a.GetStyleHandle(),
      );
      expect((hints.slice(1, 3).Get(0).format as SwFormatAutoFormat).GetStyleHandle()).toBe(
        a.GetStyleHandle(),
      );
      const node = required(doc.paragraphs[0]);
      node.SetText("abcd");
      node.SetTextHints(hints);
      const undoNodes = doc.GetUndoManager().GetUndoNodes();
      const retainedId = undoNodes.RetainText(node.CaptureTextFragment(0, 4));
      const retained = required(undoNodes.GetText(retainedId).hints);
      expect((retained.Get(0).format as SwFormatAutoFormat).GetStyleHandle()).toBe(
        a.GetStyleHandle(),
      );
      node.SetTextHints(new SwpHints(pool));
      expect(retained.Count()).toBe(1);
      node.SetTextHints(retained);
      undoNodes.Release(retainedId);
      expect(
        (required(node.GetpSwpHints()).Get(0).format as SwFormatAutoFormat).GetStyleHandle(),
      ).toBe(a.GetStyleHandle());
      expect(hints.toTextRuns("abcd", doc.GetDfltTextFormatColl().GetAttrSet())).toEqual([
        { text: "abcd", attributes },
      ]);
      const changed = createSwFormatAutoFormat(pool, { ...attributes, italic: true });
      expect(changed.GetStyleHandle()).not.toBe(a.GetStyleHandle());
    },
  );
  it("reuses handles across decoded paragraphs while keeping the persisted browser item records", /** Checks real codec import ownership and an adjacent merge after decoding. @returns Nothing. */ () => {
    const original = new SwDoc(),
      pool = original.GetAttrPool(),
      a = required(original.paragraphs[0]),
      b = original.nodes.MakeTextNode();
    const attributes = { bold: true, italic: false, underline: false };
    for (const node of [a, b]) {
      node.SetText("abcd");
      node.SetTextHints(
        new SwpHints(pool, [new SwTextAttrEnd(createSwFormatAutoFormat(pool, attributes), 0, 4)]),
      );
    }
    const record = encodeWriterDocument(original),
      restored = decodeWriterDocument(record);
    const left = required(required(restored.paragraphs[0]).GetpSwpHints()).Get(0)
      .format as SwFormatAutoFormat;
    const right = required(required(restored.paragraphs[1]).GetpSwpHints()).Get(0)
      .format as SwFormatAutoFormat;
    expect(left.GetStyleHandle()).toBe(right.GetStyleHandle());
    expect(left.GetStyleHandle()).not.toBe(
      (required(a.GetpSwpHints()).Get(0).format as SwFormatAutoFormat).GetStyleHandle(),
    );
    expect(left.GetStyleHandle().GetPool()).toBe(restored.GetAttrPool());
    expect(left.QueryValue()).toEqual([
      { which: 15, value: 8 },
      { which: 26, value: 8 },
      { which: 31, value: 8 },
    ]);
    expect(encodeWriterDocument(restored)).toEqual(record);
    const factory = createSwFormatAutoFormat(restored.GetAttrPool(), attributes);
    expect(factory.GetStyleHandle()).toBe(left.GetStyleHandle());
    expect(
      new SwpHints(restored.GetAttrPool(), [
        new SwTextAttrEnd(left, 0, 2),
        new SwTextAttrEnd(factory, 2, 4),
      ]).Count(),
    ).toBe(1);
  });
});
