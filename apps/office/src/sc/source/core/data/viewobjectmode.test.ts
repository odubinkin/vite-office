/** @fileoverview Checks real Calc page output defaults and copy/mutation contracts over the shared enum item. */
import { expect, it } from "vitest";
import { ScViewObjectModeItem } from "../../../inc/attrib";
import { ScVObjMode } from "../../../inc/global";
import { ATTR_PAGE_CHARTS, ATTR_PAGE_OBJECTS, ATTR_PAGE_DRAWINGS } from "../../../inc/scitems";
import { SfxEnumItem } from "../../../../svl/inc/eitem";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
it("retains original chart, object and drawing defaults and independent copy-based Clone", /** Checks three actual DocPool identities and native defined enum values only. @returns Nothing. */ () => {
  expect([ATTR_PAGE_CHARTS, ATTR_PAGE_OBJECTS, ATTR_PAGE_DRAWINGS]).toEqual([170, 171, 172]);
  expect([ScVObjMode.VOBJ_MODE_SHOW, ScVObjMode.VOBJ_MODE_HIDE]).toEqual([0, 1]);
  for (const which of [ATTR_PAGE_CHARTS, ATTR_PAGE_OBJECTS, ATTR_PAGE_DRAWINGS]) {
    const item = new ScViewObjectModeItem(which);
    expect(item instanceof SfxEnumItem).toBe(true);
    expect(item.GetValue()).toBe(ScVObjMode.VOBJ_MODE_SHOW);
    expect(item.Which()).toBe(which);
    const hide = new ScViewObjectModeItem(which, ScVObjMode.VOBJ_MODE_HIDE);
    expect(item.equals(hide)).toBe(false);
    item.SetValue(ScVObjMode.VOBJ_MODE_HIDE);
    expect(item.equals(hide)).toBe(true);
    item.SetWhich(999);
    const copy = new ScViewObjectModeItem(item);
    const clone = item.Clone();
    expect([copy.Which(), clone.Which()]).toEqual([999, 999]);
    item.SetValue(ScVObjMode.VOBJ_MODE_SHOW);
    expect(clone.GetValue()).toBe(ScVObjMode.VOBJ_MODE_HIDE);
    expect(copy.GetValue()).toBe(ScVObjMode.VOBJ_MODE_HIDE);
    const input = new Any([65536], "sal_Int32");
    expect(copy.PutValue(input, 0)).toBe(true);
    expect(copy.GetValue()).toBe(ScVObjMode.VOBJ_MODE_SHOW);
    input.dispose();
    expect(copy.PutValue(1, 255)).toBe(true);
    expect(copy.GetValue()).toBe(ScVObjMode.VOBJ_MODE_HIDE);
  }
});
