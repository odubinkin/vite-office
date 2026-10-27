/** @fileoverview Verifies repeated native range formatting does not retain temporary item-set owners. */
import { assert, expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SvxWeightItem } from "../../../../editeng/source/items/textitem";
import { FontWeight } from "../../../../tools/inc/fontenum";
import { RES_CHRATR_WEIGHT, WRITER_TEXT_NODE_WHICH_RANGES } from "../../../inc/hintids";
import { SetAttrMode } from "../../../inc/swtypes";
import { SetTextNodeAttributes } from "./thints-setattr";
it("keeps pooled item reference counts stable when the same range formatting is reapplied", /** Verifies temporary-owner destruction independent of cached persistent style owners. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  node.SetText("abcd");
  const set = new SfxItemSet(doc.GetAttrPool(), WRITER_TEXT_NODE_WHICH_RANGES);
  set.Put(new SvxWeightItem(FontWeight.WEIGHT_BOLD, RES_CHRATR_WEIGHT));
  const item = set.GetItemIfSet(RES_CHRATR_WEIGHT, false);
  assert(item);
  try {
    SetTextNodeAttributes(node, set, 1, 3, SetAttrMode.DEFAULT);
    const baseline = item.GetRefCount();
    for (let i = 0; i < 4; i++) SetTextNodeAttributes(node, set, 1, 3, SetAttrMode.DEFAULT);
    expect(item.GetRefCount()).toBe(baseline);
  } finally {
    set.Dispose();
    doc.Dispose();
  }
});
