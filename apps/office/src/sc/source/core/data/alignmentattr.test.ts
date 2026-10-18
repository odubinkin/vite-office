/** @fileoverview Five actual Calc alignment identities and native DocPool values over shared item owners, without a substitute DocPool. */
import { expect, it } from "vitest";
import {
  ATTR_HOR_JUSTIFY as H,
  ATTR_HOR_JUSTIFY_METHOD as HM,
  ATTR_VER_JUSTIFY as V,
  ATTR_VER_JUSTIFY_METHOD as VM,
  ATTR_ROTATE_MODE as R,
} from "../../../inc/scitems";
import {
  SvxHorJustifyItem,
  SvxVerJustifyItem,
  SvxJustifyMethodItem,
} from "../../../../editeng/inc/justifyitem";
import {
  SvxCellHorJustify,
  SvxCellVerJustify,
  SvxCellJustifyMethod,
} from "../../../../editeng/inc/svxenum";
import { SvxRotateMode, SvxRotateModeItem } from "../../../../svx/inc/rotmodit";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxItemPool } from "../../../../svl/source/items/itempool";
it("retains native explicit Standard/Auto and Bottom defaults through real pooled copies", /** These are actual items used by DocPool, not a fabricated document implementation. @returns Nothing. */ () => {
  expect([H, HM, V, VM, R]).toEqual([129, 130, 132, 133, 136]);
  const values = [
    new SvxHorJustifyItem(SvxCellHorJustify.Standard, H),
    new SvxJustifyMethodItem(SvxCellJustifyMethod.Auto, HM),
    new SvxVerJustifyItem(SvxCellVerJustify.Standard, V),
    new SvxJustifyMethodItem(SvxCellJustifyMethod.Auto, VM),
    new SvxRotateModeItem(SvxRotateMode.SVX_ROTATE_MODE_BOTTOM, R),
  ];
  const set = new SfxItemSet(new SfxItemPool(), [
    [129, 130],
    [132, 133],
    [136, 136],
  ]);
  for (const item of values) {
    set.Put(item);
    expect(set.Get(item.Which())).not.toBe(item);
    expect(set.Get(item.Which()).equals(item)).toBe(true);
  }
  expect(
    values.map(
      /** Original values. @param item - Actual item. @returns Value. */ (item) => item.GetValue(),
    ),
  ).toEqual([0, 0, 0, 0, 3]);
  expect(set.Get(R)).toBeInstanceOf(SvxRotateModeItem);
});
