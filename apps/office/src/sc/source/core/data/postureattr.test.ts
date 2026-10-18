/** @fileoverview Actual Calc3script posture defaults using the common native item owner. */
import { expect, it } from "vitest";
import {
  ATTR_FONT_POSTURE as L,
  ATTR_CJK_FONT_POSTURE as C,
  ATTR_CTL_FONT_POSTURE as T,
} from "../../../inc/scitems";
import { SvxPostureItem } from "../../../../editeng/inc/postitem";
import { FontItalic as I } from "../../../../tools/inc/fontenum";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxItemPool } from "../../../../svl/source/items/itempool";
it("retains NONE Latin CJK CTL defaults103114119through actual itemset copies", /** No fake DocPool/document or locale provider. @returns Nothing. */ () => {
  expect([L, C, T]).toEqual([103, 114, 119]);
  const set = new SfxItemSet(new SfxItemPool(), [
    [L, L],
    [C, C],
    [T, T],
  ]);
  for (const which of [L, C, T]) {
    const item = new SvxPostureItem(I.ITALIC_NONE, which);
    set.Put(item);
    item.SetBoolValue(true);
    expect((set.Get(which) as SvxPostureItem).GetPosture()).toBe(I.ITALIC_NONE);
  }
});
