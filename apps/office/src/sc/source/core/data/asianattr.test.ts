/** @fileoverview Actual Calc defaults for Asian text and writing direction over shared pool owners. */
import { expect, it } from "vitest";
import {
  ATTR_SCRIPTSPACE as S,
  ATTR_HANGPUNCTUATION as H,
  ATTR_FORBIDDEN_RULES as F,
  ATTR_WRITINGDIR as D,
} from "../../../inc/scitems";
import { SvxScriptSpaceItem } from "../../../../editeng/inc/scriptspaceitem";
import { SvxHangingPunctuationItem } from "../../../../editeng/inc/hngpnctitem";
import { SvxForbiddenRuleItem } from "../../../../editeng/inc/forbiddenruleitem";
import { SvxFrameDirectionItem } from "../../../../editeng/inc/frmdiritem";
import { SvxFrameDirection } from "../../../../editeng/inc/frmdir";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxItemPool } from "../../../../svl/source/items/itempool";
it("retains false Asian defaults and Environment direction through real pooled copies", /** Does not fabricate a document or DocPool. @returns Nothing. */ () => {
  expect([S, H, F, D]).toEqual([126, 127, 128, 138]);
  const set = new SfxItemSet(new SfxItemPool(), [
    [S, F],
    [D, D],
  ]);
  for (const item of [
    new SvxScriptSpaceItem(false, S),
    new SvxHangingPunctuationItem(false, H),
    new SvxForbiddenRuleItem(false, F),
  ]) {
    set.Put(item);
    item.SetValue(true);
    expect((set.Get(item.Which()) as SvxScriptSpaceItem).GetValue()).toBe(false);
  }
  const direction = new SvxFrameDirectionItem(SvxFrameDirection.Environment, D);
  set.Put(direction);
  direction.SetValue(SvxFrameDirection.Vertical_RL_TB);
  expect((set.Get(D) as SvxFrameDirectionItem).QueryValue()).toBe(4);
});
