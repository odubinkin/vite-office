/** @fileoverview Actual Calc default strikeout/emphasis values through shared itemset copies. */
import { expect, it } from "vitest";
import { ATTR_FONT_CROSSEDOUT as C, ATTR_FONT_EMPHASISMARK as E } from "../../../inc/scitems";
import { SvxCrossedOutItem } from "../../../../editeng/inc/crossedoutitem";
import { SvxEmphasisMarkItem } from "../../../../editeng/inc/emphasismarkitem";
import { FontStrikeout as S, FontEmphasisMark as M } from "../../../../tools/inc/fontenum";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxItemPool } from "../../../../svl/source/items/itempool";
it("retains Calc NONE defaults106and121through actual shared itemset clones", /** No substitute document/DocPool. @returns Nothing. */ () => {
  expect([C, E]).toEqual([106, 121]);
  const set = new SfxItemSet(new SfxItemPool(), [
      [C, C],
      [E, E],
    ]),
    cross = new SvxCrossedOutItem(S.STRIKEOUT_NONE, C),
    emphasis = new SvxEmphasisMarkItem(M.NONE, E);
  set.Put(cross);
  set.Put(emphasis);
  cross.SetBoolValue(true);
  emphasis.SetValue(M.Dot | M.PosBelow);
  expect((set.Get(C) as SvxCrossedOutItem).GetStrikeout()).toBe(S.STRIKEOUT_NONE);
  expect((set.Get(E) as SvxEmphasisMarkItem).GetEmphasisMark()).toBe(M.NONE);
});
