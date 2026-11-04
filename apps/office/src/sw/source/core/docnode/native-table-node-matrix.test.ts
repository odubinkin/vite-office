/** @fileoverview Original SwNodes::InsertTable matrix, row-collection transitions and seven selective source attributes use actual native sections and document styles. */
import { assert, expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwNodes } from "./nodes";
import { SwTableBoxStartNode } from "./node";
import { SwTextNode } from "../txtnode/ndtxt";
import { SwStartNodeType as K } from "../../../inc/ndtyp";
import { SwPosition } from "../crsr/pam";
import { SwInsertTableFlags } from "../../../inc/itabenum";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import { SvxAdjustItem } from "../../../../editeng/inc/adjustitem";
import { SvxAdjust } from "../../../../editeng/inc/svxenum";
import { SfxItemState } from "../../../../svl/source/items/itemset";
import * as H from "../../../inc/hintids";
/** Requires an actual owner without a substitute graph. @param value - Actual optional owner. @returns Original owner. */
function present<T>(value: T | undefined | null): T {
  assert(value !== undefined && value !== null);
  return value;
}
it.each([
  [0, 2, true, [false]],
  [1, 0, true, [true]],
  [3, 0, true, [true, false, false]],
  [3, 2, true, [true, true, false]],
  [3, 5, true, [true, true, true]],
  [2, 2, false, [false, false]],
] as const)(
  "constructs native matrix rows%s repeat%s header%s",
  /** Native row zero selects body while nonzero matrices begin with the supplied headline even at repeat zero. @param rows - Original row count. @param repeat - Repeat count. @param useHead - Optional headline owner. @param headers - Expected actual collection choices. @returns Nothing. */ (
    rows,
    repeat,
    useHead,
    headers,
  ) => {
    const doc = new SwDoc(),
      where = present(doc.paragraphs[0]),
      body = doc.MakeTextFormatColl("Matrix body"),
      head = doc.MakeTextFormatColl("Matrix head"),
      before = doc.nodes.Count(),
      node = present(
        SwNodes.InsertTable(where, 2, body, rows, repeat, useHead ? head : null, null),
      );
    expect(doc.nodes.Count()).toBe(before + 2 + headers.length * 6);
    expect(node.StartOfSectionNode()).toBe(where.StartOfSectionNode());
    expect(node.GetTable().GetTabLines()).toHaveLength(0);
    for (let row = 0; row < headers.length; row++)
      for (let col = 0; col < 2; col++) {
        const start = doc.nodes.at(node.GetIndex() + 1 + (row * 2 + col) * 3),
          text = doc.nodes.at(start.GetIndex() + 1),
          end = doc.nodes.at(start.GetIndex() + 2);
        assert(start instanceof SwTableBoxStartNode && text instanceof SwTextNode);
        expect(start.StartOfSectionNode()).toBe(node);
        expect(start.EndOfSectionNode()).toBe(end);
        expect(text.StartOfSectionNode()).toBe(start);
        expect(text.GetTextFormatColl()).toBe(headers[row] ? head : body);
      }
    doc.Dispose();
  },
);
it("returns null for zero boxes without allocating a table or touching the node array", /** Native zero-box guard precedes the remaining construction. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    where = present(doc.paragraphs[0]),
    before = doc.nodes.entries().slice();
  expect(SwNodes.InsertTable(where, 0, doc.GetDfltTextFormatColl(), 2, 1, null, null)).toBeNull();
  expect(doc.nodes.entries()).toEqual(before);
  doc.Dispose();
});
it.each([false, true])(
  "constructs matrix inside the actual surrounding section nestedCell=%s",
  /** Caption/extra and cell section owners must not be replaced with the body start. @param nested - Whether the actual boundary is in a cell. @returns Nothing. */ (
    nested,
  ) => {
    const doc = new SwDoc();
    const outer = nested
      ? present(
          doc.nodes.AppendTableRow(doc.nodes.MakeTableNode("Outer"), 1).GetTabBoxes()[0],
        ).GetSttNd()
      : doc.nodes.MakeTextSection(
          doc.nodes.GetEndOfExtras(),
          K.SwNormalStartNode,
          doc.GetDfltTextFormatColl(),
        );
    const where = doc.nodes.at(outer.GetIndex() + 1),
      node = present(SwNodes.InsertTable(where, 1, doc.GetDfltTextFormatColl(), 1, 0, null, null));
    expect(node.StartOfSectionNode()).toBe(outer);
    expect(node.EndOfSectionIndex() + 1).toBe(where.GetIndex());
    expect(outer.EndOfSectionIndex()).toBeGreaterThan(where.GetIndex());
    doc.Dispose();
  },
);
/** Source-propagated identities, deliberately excluding other character/paragraph attributes. */
const propagated = [
  H.RES_PARATR_ADJUST,
  H.RES_CHRATR_FONT,
  H.RES_CHRATR_FONTSIZE,
  H.RES_CHRATR_CJK_FONT,
  H.RES_CHRATR_CJK_FONTSIZE,
  H.RES_CHRATR_CTL_FONT,
  H.RES_CHRATR_CTL_FONTSIZE,
];
it.each(propagated)(
  "copies explicit source attribute%s only when the selected collection has no effective SET value",
  /** Both direct and inherited collection attributes override the source paragraph. @param which - Original propagated identity. @returns Nothing. */ (
    which,
  ) => {
    const doc = new SwDoc(),
      where = present(doc.paragraphs[0]),
      source = where.GetSwAttrSet().Get(which).Clone();
    assert(source);
    if (source instanceof SvxFontItem) source.SetFamilyName("Source family");
    else if (source instanceof SvxFontHeightItem) source.SetHeight(777);
    else {
      assert(source instanceof SvxAdjustItem);
      source.SetAdjust(SvxAdjust.Right);
    }
    where.SetAttr(source);
    source.Dispose();
    const body = doc.MakeTextFormatColl("Unset body"),
      headParent = doc.MakeTextFormatColl("Set head parent"),
      head = doc.MakeTextFormatColl("Inherited head", headParent),
      authored = doc.GetAttrPool().GetUserOrPoolDefaultItem(which).Clone();
    assert(authored);
    headParent.SetFormatAttr(authored);
    authored.Dispose();
    const node = present(SwNodes.InsertTable(where, 1, body, 2, 1, head, where.GetSwAttrSet())),
      first = doc.nodes.at(node.GetIndex() + 2),
      second = doc.nodes.at(node.GetIndex() + 5);
    assert(first instanceof SwTextNode && second instanceof SwTextNode);
    expect(first.GetpSwAttrSet()?.GetItemIfSet(which, false)).toBeUndefined();
    expect(first.GetAttr(which).equals(headParent.GetAttrSet().Get(which))).toBe(true);
    expect(second.GetpSwAttrSet()?.GetItemState(which, false)).toBe(SfxItemState.SET);
    expect(second.GetAttr(which).equals(where.GetAttr(which))).toBe(true);
    doc.Dispose();
  },
);
it("copies no pool defaults and no source items outside the seven native identities", /** A background source item is not part of the original propagation array. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    where = present(doc.paragraphs[0]),
    background = doc.GetAttrPool().GetUserOrPoolDefaultItem(H.RES_BACKGROUND).Clone();
  assert(background);
  where.SetAttr(background);
  background.Dispose();
  const body = doc.MakeTextFormatColl("Empty body"),
    node = present(SwNodes.InsertTable(where, 1, body, 1, 0, null, where.GetSwAttrSet())),
    text = doc.nodes.at(node.GetIndex() + 2);
  assert(text instanceof SwTextNode);
  expect(text.GetpSwAttrSet()).toBeUndefined();
  doc.Dispose();
});
it("preserves heading style adjustment over shell source adjustment while composing the actual document graph", /** The document command consumes the native node matrix rather than overwriting its selected style afterward. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    where = present(doc.paragraphs[0]),
    head = doc.GetTextFormatColl("table-heading"),
    value = new SvxAdjustItem(SvxAdjust.Center, H.RES_PARATR_ADJUST);
  head.SetFormatAttr(value);
  value.Dispose();
  const right = new SvxAdjustItem(SvxAdjust.Right, H.RES_PARATR_ADJUST);
  where.SetAttr(right);
  right.Dispose();
  const p = new SwPosition(where),
    table = present(
      doc.InsertTable(
        { mnInsMode: SwInsertTableFlags.Headline, mnRowsToRepeat: 1 },
        p,
        2,
        1,
        HoriOrientation.FULL,
        null,
        null,
        true,
      ),
    ),
    text = present(present(present(table.GetTabLines()[0]).GetTabBoxes()[0]).GetParagraphs()[0]);
  expect((text.GetAttr(H.RES_PARATR_ADJUST) as SvxAdjustItem).GetAdjust()).toBe(SvxAdjust.Center);
  expect(text.GetpSwAttrSet()?.GetItemIfSet(H.RES_PARATR_ADJUST, false)).toBeUndefined();
  p.Dispose();
  doc.Dispose();
});
