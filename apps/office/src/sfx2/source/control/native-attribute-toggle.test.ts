/** @fileoverview Source SfxBindings toggle-item preparation using genuine bool,enum and sentinel states. */
import { expect, it } from "vitest";
import { createAttributeToggleItem } from "./bindings";
import { SfxItemPool } from "../../../svl/inc/itempool";
import { SfxItemSet } from "../../../svl/inc/itemset";
import { SfxBoolItem } from "../../../svl/source/items/cenumitm";
import { SfxStringItem } from "../../../svl/source/items/stritem";
import { SvxOverlineItem } from "../../../editeng/source/items/textitem";
import { SvxHorJustifyItem } from "../../../editeng/inc/justifyitem";
import { SvxCellHorJustify } from "../../../editeng/inc/svxenum";
import { FontLineStyle as F } from "../../../tools/inc/fontenum";
import { Color } from "../../../tools/inc/color";

it("retains source bool and enum toggle/default/factory decisions without changing the queried set", /** Native state families use actual item owners and slot factories. @returns Nothing. */ () => {
  const pool = new SfxItemPool();
  pool.RegisterDefaultItem(new SfxBoolItem(1, false));
  pool.RegisterDefaultItem(new SvxOverlineItem(F.LINESTYLE_NONE, 2));
  pool.RegisterDefaultItem(new SfxStringItem(3, "value"));
  pool.RegisterDefaultItem(new SvxHorJustifyItem(SvxCellHorJustify.Standard, 4));
  const set = new SfxItemSet(pool, [
    [1, 4],
    [6000, 6000],
  ]);
  for (const old of [false, true]) {
    set.Put(new SfxBoolItem(1, old));
    expect(
      (
        createAttributeToggleItem(
          set,
          1,
          /** Native bool factory. @returns Item. */ () => new SfxBoolItem(0),
        ) as SfxBoolItem
      ).GetValue(),
    ).toBe(!old);
    expect((set.Get(1) as SfxBoolItem).GetValue()).toBe(old);
  }
  const line = new SvxOverlineItem(F.LINESTYLE_DOUBLE, 2);
  line.SetColor(new Color(0x123456));
  set.Put(line);
  const result = createAttributeToggleItem(
    set,
    2,
    SvxOverlineItem.CreateDefault,
  ) as SvxOverlineItem;
  expect(result.GetLineStyle()).toBe(F.LINESTYLE_NONE);
  expect(result.GetColor().toUInt32()).toBe(0x123456);
  expect((set.Get(2) as SvxOverlineItem).GetLineStyle()).toBe(F.LINESTYLE_DOUBLE);
  set.ClearItem(2);
  expect(
    (
      createAttributeToggleItem(set, 2, SvxOverlineItem.CreateDefault) as SvxOverlineItem
    ).GetLineStyle(),
  ).toBe(F.LINESTYLE_SINGLE);
  for (const which of [1, 2, 3, 4]) set.InvalidateItem(which);
  expect(
    (
      createAttributeToggleItem(
        set,
        1,
        /** Native bool factory. @returns Item. */ () => new SfxBoolItem(0),
      ) as SfxBoolItem
    ).GetValue(),
  ).toBe(true);
  const mixed = createAttributeToggleItem(set, 2, SvxOverlineItem.CreateDefault) as SvxOverlineItem;
  expect(mixed.Which()).toBe(2);
  expect(mixed.GetLineStyle()).toBe(F.LINESTYLE_SINGLE);
  expect(
    createAttributeToggleItem(
      set,
      3,
      /** Non-toggleable native factory. @returns Item. */ () => new SfxStringItem(0, "factory"),
    ),
  ).toBeUndefined();
  expect(
    createAttributeToggleItem(
      set,
      4,
      /** Enum without a bool interface. @returns Item. */ () =>
        new SvxHorJustifyItem(SvxCellHorJustify.Standard, 0),
    ),
  ).toBeUndefined();
  set.ClearItem();
  expect(createAttributeToggleItem(set, 3, SvxOverlineItem.CreateDefault)).toBeUndefined();
  expect(createAttributeToggleItem(set, 4, SvxOverlineItem.CreateDefault)).toBeUndefined();
  expect(createAttributeToggleItem(set, 6000, SvxOverlineItem.CreateDefault)).toBeUndefined();
  expect(createAttributeToggleItem(set, 99, SvxOverlineItem.CreateDefault)).toBeUndefined();
  set.DisableItem(2);
  expect(createAttributeToggleItem(set, 2, SvxOverlineItem.CreateDefault)).toBeUndefined();
});
