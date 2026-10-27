/** @fileoverview Source-contract checks for native solid-fill values, defaults and brush conversion. */
import { expect, it } from "vitest";
import { SfxItemSet } from "../../../svl/source/items/itemset";
import { SfxItemPool } from "../../../svl/source/items/itempool";
import {
  MID_COLOR_THEME_INDEX,
  MID_COLOR_LUM_MOD,
  MID_COLOR_LUM_OFF,
} from "../../../editeng/inc/memberids";
import { Transformation, TransformationType } from "../../../docmodel/inc/color/Transformation";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { typelib_TypeClass as C } from "../../../cppu/inc/typelib/typeclass";
import { Color } from "../../../tools/inc/color";
import { SvxBrushItem } from "../../../editeng/inc/brushitem";
import { ComplexColor } from "../../../docmodel/inc/color/ComplexColor";
import { ThemeColorType } from "../../../docmodel/inc/theme/ThemeColorType";
import { FillStyle } from "../../../offapi/com/sun/star/drawing/FillStyle";
import { NameOrIndex } from "../../inc/xit";
import { XColorItem } from "../../inc/xcolit";
import { XFillColorItem } from "../../inc/xflclit";
import { XFillStyleItem } from "../../inc/xfillit0";
import { XFillTransparenceItem } from "../../inc/xfltrit";
import { XFillUseSlideBackgroundItem } from "../../inc/xfilluseslidebackgrounditem";
import {
  XATTR_FILL_FIRST,
  XATTR_FILL_LAST,
  XATTR_FILLSTYLE,
  XATTR_FILLCOLOR,
  XATTR_FILLTRANSPARENCE,
} from "../../inc/xdef";
import {
  SID_ATTR_FILL_USE_SLIDE_BACKGROUND,
  SID_ATTR_FILL_STYLE,
  SID_ATTR_FILL_COLOR,
  SID_ATTR_FILL_TRANSPARENCE,
} from "../../inc/svxids";
import { SdrItemPool, SdrAngleItem } from "../svdraw/svdattr";
import { setSvxBrushItemAsFillAttributesToTargetSet } from "./unobrushitemhelper";

it("retains native palette copy/name/index and color detachment contracts", /** Exercises the actual inherited string and drawing-color owners. @returns Nothing. */ () => {
  const empty = new NameOrIndex();
  expect([empty.Which(), empty.GetName(), empty.GetPalIndex(), empty.isNameOrIndex()]).toEqual([
    0,
    "",
    -1,
    false,
  ]);
  expect(empty.Clone().isNameOrIndex()).toBe(true);
  const item = new XColorItem(1015, 7, new Color(0x123456));
  item.SetName("Named");
  expect(item.IsIndex()).toBe(true);
  expect(item.GetPalIndex()).toBe(7);
  item.setComplexColor(ComplexColor.Theme(ThemeColorType.Accent2));
  const copy = item.Clone();
  item.SetColorValue(new Color(0xabcdef));
  expect([item.GetName(), item.GetPalIndex(), item.GetColorValue().toUInt32()]).toEqual([
    "Named",
    -1,
    0xabcdef,
  ]);
  expect(copy.GetPalIndex()).toBe(7);
  expect(item.getComplexColor().getThemeColorType()).toBe(ThemeColorType.Accent2);
  expect(item.equals(copy)).toBe(false);
  expect(new XFillColorItem().Which()).toBe(0);
  expect(XFillColorItem.CreateDefault().Which()).toBe(0);
  expect(new XFillColorItem("", new Color()).Which()).toBe(1015);
});
it("preserves source typed enum and unsigned16 Any behavior", /** Checks full enum values, original Basic fallback and legacy transparency narrowing. @returns Nothing. */ () => {
  const style = new XFillStyleItem(),
    output = new Any(),
    integer = new Any([123456], "sal_Int32"),
    wrong = new Any(true);
  const transparency = new XFillTransparenceItem(73),
    overflow = new Any([65537], "sal_Int32");
  try {
    expect(style.GetValue()).toBe(FillStyle.SOLID);
    expect(style.QueryValue(output)).toBe(true);
    expect(output.pType?.eTypeClass).toBe(C.ENUM);
    expect(style.PutValue(integer, 0)).toBe(true);
    expect(style.GetValue()).toBe(123456);
    expect(style.Clone().GetValue()).toBe(123456);
    expect(style.PutValue(wrong, 0)).toBe(false);
    expect(style.GetValue()).toBe(123456);
    expect(transparency.QueryValue(output)).toBe(true);
    expect(output.pType?.eTypeClass).toBe(C.UNSIGNED_SHORT);
    expect(transparency.PutValue(overflow, 0)).toBe(true);
    expect(transparency.GetValue()).toBe(1);
    expect(transparency.PutValue(wrong, 0)).toBe(false);
    expect(transparency.GetValue()).toBe(1);
  } finally {
    output.dispose();
    integer.dispose();
    wrong.dispose();
    overflow.dispose();
  }
});
it("retains native secondary-pool defaults, slot bindings and the existing angle owner", /** Checks actual pool chaining and derived copy ownership. @returns Nothing. */ () => {
  const master = new SfxItemPool(),
    drawing = new SdrItemPool(master);
  expect(master.GetSecondaryPool()).toBe(drawing);
  expect(drawing.GetMasterPool()).toBe(master);
  expect((master.GetPoolDefaultItem(XATTR_FILLSTYLE) as XFillStyleItem).GetValue()).toBe(
    FillStyle.SOLID,
  );
  expect(
    (master.GetPoolDefaultItem(XATTR_FILLCOLOR) as XFillColorItem).GetColorValue().toUInt32(),
  ).toBe(0x729fcf);
  expect(
    (master.GetPoolDefaultItem(XATTR_FILLTRANSPARENCE) as XFillTransparenceItem).GetValue(),
  ).toBe(0);
  expect(master.GetWhichIDFromSlotID(SID_ATTR_FILL_STYLE)).toBe(XATTR_FILLSTYLE);
  expect(master.GetWhichIDFromSlotID(SID_ATTR_FILL_COLOR)).toBe(XATTR_FILLCOLOR);
  expect(master.GetWhichIDFromSlotID(SID_ATTR_FILL_TRANSPARENCE)).toBe(XATTR_FILLTRANSPARENCE);
  expect(master.GetWhichIDFromSlotID(SID_ATTR_FILL_USE_SLIDE_BACKGROUND)).toBe(XATTR_FILL_LAST);
  const copy = drawing.Clone();
  expect(copy).not.toBe(drawing);
  expect(copy.GetMasterPool()).toBe(copy);
  expect(
    copy.GetPoolDefaultItem(XATTR_FILLCOLOR).equals(drawing.GetPoolDefaultItem(XATTR_FILLCOLOR)),
  ).toBe(true);
  expect(new SdrAngleItem(1200, -36100).Clone().GetValue()).toBe(-36100);
});
it.each([
  [0, FillStyle.NONE, -1],
  [1, FillStyle.SOLID, 100],
  [2, FillStyle.SOLID, 100],
  [127, FillStyle.SOLID, 50],
  [128, FillStyle.SOLID, 50],
  [253, FillStyle.SOLID, 1],
  [254, FillStyle.SOLID, 0],
  [255, FillStyle.SOLID, 0],
] as const)(
  "converts native brush alpha %s without clearing the inclusive last fill item",
  /** Checks source color/opacity fields, final-color side effects and the preserved exclusive clear bound. @param alpha - Brush alpha. @param style - Source fill style. @param opacity - Source transparency or absent sentinel. @returns Nothing. */ (
    alpha,
    style,
    opacity,
  ) => {
    const pool = new SdrItemPool(),
      set = new SfxItemSet(pool, [[XATTR_FILL_FIRST, XATTR_FILL_LAST]]),
      color = new Color(0x123456);
    color.SetAlpha(alpha);
    const brush = new SvxBrushItem(color, 115);
    set.Put(new XFillUseSlideBackgroundItem(true));
    set.Put(new XFillTransparenceItem(77));
    setSvxBrushItemAsFillAttributesToTargetSet(brush, set);
    expect((set.Get(XATTR_FILLSTYLE) as XFillStyleItem).GetValue()).toBe(style);
    const fill = set.Get(XATTR_FILLCOLOR) as XFillColorItem;
    expect(fill.GetColorValue().toUInt32()).toBe(0x123456);
    expect((set.Get(XATTR_FILL_LAST) as XFillUseSlideBackgroundItem).GetValue()).toBe(true);
    if (opacity < 0) {
      expect(set.GetItemIfSet(XATTR_FILLTRANSPARENCE, false)).toBeUndefined();
      expect(fill.getComplexColor().equals(new ComplexColor())).toBe(true);
    } else {
      expect((set.Get(XATTR_FILLTRANSPARENCE) as XFillTransparenceItem).GetValue()).toBe(opacity);
      expect(fill.getComplexColor().getFinalColor().equals(color)).toBe(true);
    }
  },
);

it("uses native RGB, theme and last-match luminance Any paths without resetting unrelated state", /** Exercises real Any selectors and original replacement ordering. @returns Nothing. */ () => {
  const item = new XFillColorItem(3, new Color(0x123456)),
    output = new Any(),
    input = new Any([0x654321], "sal_Int32"),
    value: [number] = [0];
  item.getComplexColor().addTransformation(new Transformation(TransformationType.LumMod, 2500));
  item.getComplexColor().addTransformation(new Transformation(TransformationType.LumMod, 7500));
  item.getComplexColor().addTransformation(new Transformation(TransformationType.LumOff, 1200));
  try {
    expect(item.PutValue(input, 0)).toBe(true);
    expect(item.GetPalIndex()).toBe(-1);
    expect(item.QueryValue(output, 128)).toBe(true);
    expect(output.extract(value, "sal_Int32")).toBe(true);
    expect(value[0]).toBe(0x654321);
    expect(item.QueryValue(output, MID_COLOR_LUM_MOD)).toBe(true);
    expect(output.extract(value, "sal_Int16")).toBe(true);
    expect(value[0]).toBe(7500);
    input.insert([6000], "sal_Int16");
    expect(item.PutValue(input, MID_COLOR_LUM_MOD | 128)).toBe(true);
    expect(
      item
        .getComplexColor()
        .getTransformations()
        .map(
          /** Reads owned native transforms. @param t - Transformation. @returns Source pair. */ (
            t,
          ) => [t.meType, t.mnValue],
        ),
    ).toEqual([
      [TransformationType.LumOff, 1200],
      [TransformationType.LumMod, 6000],
    ]);
    expect(item.QueryValue(output, MID_COLOR_LUM_OFF)).toBe(true);
    output.extract(value, "sal_Int16");
    expect(value[0]).toBe(1200);
    input.insert([ThemeColorType.Accent4], "sal_Int16");
    expect(item.PutValue(input, MID_COLOR_THEME_INDEX)).toBe(true);
    expect(item.QueryValue(output, MID_COLOR_THEME_INDEX)).toBe(true);
    output.extract(value, "sal_Int16");
    expect(value[0]).toBe(ThemeColorType.Accent4);
    expect(item.GetColorValue().toUInt32()).toBe(0x654321);
    input.insert([1], "sal_Int32");
    expect(item.PutValue(input, MID_COLOR_LUM_MOD)).toBe(false);
  } finally {
    input.dispose();
    output.dispose();
  }
});
