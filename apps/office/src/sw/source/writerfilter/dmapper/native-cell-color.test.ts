/** @fileoverview Native shading outputs, full lexical/brush/pattern cases, actual generated interop sequences and UNO complex-color component ownership. */
import { expect, it } from "vitest";
import { CellColorHandler, OutputFormat } from "./CellColorHandler";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { PropertyIds as P } from "./PropertyIds";
import { TablePropertyMap } from "./PropertyMap";
import {
  OOXMLPropertySet,
  OOXMLProperty,
  OOXMLPropertyType as Kind,
  OOXMLValue as V,
} from "../ooxml/OOXMLPropertySet";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { Reference } from "../../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence } from "../../../../cppu/inc/com/sun/star/uno/Sequence";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue,
} from "../../../../udkapi/com/sun/star/beans/PropertyValue";
import { ShadingPattern as S } from "../../../../offapi/com/sun/star/drawing/ShadingPattern";
import {
  FillStyle,
  cppu_detail_getUnoType_FillStyle,
} from "../../../../offapi/com/sun/star/drawing/FillStyle";
import { XComplexColor } from "../../../../offapi/com/sun/star/util/XComplexColor";
import type { XTheme } from "../../../../offapi/com/sun/star/util/XTheme";
import {
  getFromXComplexColor,
  UnoComplexColor,
} from "../../../../docmodel/inc/uno/UnoComplexColor";
import { ColorType } from "../../../../docmodel/inc/color/ComplexColor";
import { ThemeColorType as Theme } from "../../../../docmodel/inc/theme/ThemeColorType";
import { TransformationType as T } from "../../../../docmodel/inc/color/Transformation";
import { WeakReferenceHelper } from "../../../../cppuhelper/inc/weakref";
import { unicode, text } from "../../core/unocore/unocrsrhelper";
import { readNumberingProperty } from "../../core/unocore/unosett-properties";

const Values = Sequence.specialize<PropertyValue>(cppu_detail_getUnoType_PropertyValue, 48);
/** Native source switch witnesses: nil intentionally uses the character CLEAR fallback. */
const cases = [
  [N.LN_Value_ST_Shd_clear, "clear", 0, S.CLEAR],
  [N.LN_Value_ST_Shd_solid, "solid", 1000, S.SOLID],
  [N.LN_Value_ST_Shd_pct5, "pct5", 50, S.PCT5],
  [N.LN_Value_ST_Shd_pct10, "pct10", 100, S.PCT10],
  [N.LN_Value_ST_Shd_pct20, "pct20", 200, S.PCT20],
  [N.LN_Value_ST_Shd_pct25, "pct25", 250, S.PCT25],
  [N.LN_Value_ST_Shd_pct30, "pct30", 300, S.PCT30],
  [N.LN_Value_ST_Shd_pct40, "pct40", 400, S.PCT40],
  [N.LN_Value_ST_Shd_pct50, "pct50", 500, S.PCT50],
  [N.LN_Value_ST_Shd_pct60, "pct60", 600, S.PCT60],
  [N.LN_Value_ST_Shd_pct70, "pct70", 700, S.PCT70],
  [N.LN_Value_ST_Shd_pct75, "pct75", 750, S.PCT75],
  [N.LN_Value_ST_Shd_pct80, "pct80", 800, S.PCT80],
  [N.LN_Value_ST_Shd_pct90, "pct90", 900, S.PCT90],
  [N.LN_Value_ST_Shd_horzStripe, "horzStripe", 333, S.HORZ_STRIPE],
  [N.LN_Value_ST_Shd_vertStripe, "vertStripe", 333, S.VERT_STRIPE],
  [N.LN_Value_ST_Shd_reverseDiagStripe, "reverseDiagStripe", 333, S.REVERSE_DIAG_STRIPE],
  [N.LN_Value_ST_Shd_diagStripe, "diagStripe", 333, S.DIAG_STRIPE],
  [N.LN_Value_ST_Shd_horzCross, "horzCross", 333, S.HORZ_CROSS],
  [N.LN_Value_ST_Shd_diagCross, "diagCross", 333, S.DIAG_CROSS],
  [N.LN_Value_ST_Shd_thinHorzStripe, "thinHorzStripe", 333, S.THIN_HORZ_STRIPE],
  [N.LN_Value_ST_Shd_thinVertStripe, "thinVertStripe", 333, S.THIN_VERT_STRIPE],
  [
    N.LN_Value_ST_Shd_thinReverseDiagStripe,
    "thinReverseDiagStripe",
    333,
    S.THIN_REVERSE_DIAG_STRIPE,
  ],
  [N.LN_Value_ST_Shd_thinDiagStripe, "thinDiagStripe", 333, S.THIN_DIAG_STRIPE],
  [N.LN_Value_ST_Shd_thinHorzCross, "thinHorzCross", 333, S.THIN_HORZ_CROSS],
  [N.LN_Value_ST_Shd_thinDiagCross, "thinDiagCross", 333, S.THIN_DIAG_CROSS],
  [N.LN_Value_ST_Shd_pct12, "pct12", 125, S.PCT12],
  [N.LN_Value_ST_Shd_pct15, "pct15", 150, S.PCT15],
  [N.LN_Value_ST_Shd_pct35, "pct35", 350, S.PCT35],
  [N.LN_Value_ST_Shd_pct37, "pct37", 375, S.PCT37],
  [N.LN_Value_ST_Shd_pct45, "pct45", 450, S.PCT45],
  [N.LN_Value_ST_Shd_pct55, "pct55", 550, S.PCT55],
  [N.LN_Value_ST_Shd_pct62, "pct62", 625, S.PCT62],
  [N.LN_Value_ST_Shd_pct65, "pct65", 650, S.PCT65],
  [N.LN_Value_ST_Shd_pct85, "pct85", 850, S.PCT85],
  [N.LN_Value_ST_Shd_pct87, "pct87", 875, S.PCT87],
  [N.LN_Value_ST_Shd_pct95, "pct95", 950, S.PCT95],
  [N.LN_Value_ST_Shd_nil, "nil", 0, S.CLEAR],
] as const;
/** Delivers actual original attribute resources. @param handler - Actual owner. @param entries - Original ID/int pairs. @returns Nothing. */
function attrs(
  handler: CellColorHandler,
  ...entries: readonly (readonly [number, number])[]
): void {
  const set = new OOXMLPropertySet();
  for (const [id, value] of entries) set.add(id, V.createInteger(value), Kind.ATTRIBUTE);
  set.resolve(handler);
}
/** Acquires an actual map property Any. @param map - Actual map. @param id - Required property. @returns Owned copy. */
function property(map: TablePropertyMap, id: P): Any {
  const result = map.getProperty(id);
  if (!result) throw new Error("Missing native property " + id);
  return result[1];
}
/** Extracts an original long or explicitly declared FillStyle enum. @param map - Actual map. @param id - Native property. @returns Scalar. */
function scalar(map: TablePropertyMap, id: P): number {
  const any = property(map, id),
    out: [number] = [0];
  try {
    expect(
      any.extract(out, id === P.PROP_FILL_STYLE ? cppu_detail_getUnoType_FillStyle : "sal_Int32"),
    ).toBe(true);
    return out[0];
  } finally {
    any.dispose();
  }
}
/** Extracts a real component Reference from its actual Any. @param map - Map owner. @param id - Complex-color property. @returns Acquired Reference. */
function component(map: TablePropertyMap, id: P): Reference<XComplexColor> {
  const any = property(map, id),
    out: [XComplexColor | null] = [null];
  try {
    expect(any.extract(out, XComplexColor.static_type)).toBe(true);
    return new Reference(out[0]);
  } finally {
    any.dispose();
    if (out[0]) out[0].release();
  }
}
/** Reads a real non-clearing generated interop sequence. @param handler - Actual owner. @returns Ordered copied string pairs. */
function bag(handler: CellColorHandler): readonly (readonly [string, string])[] {
  const property = handler.getInteropGrabBag(),
    values = new Values(),
    result: [string, string][] = [];
  try {
    expect(
      property.Value.extract(values.getAddress(), [
        "Sequence",
        cppu_detail_getUnoType_PropertyValue,
      ]),
    ).toBe(true);
    for (let i = 0; i < values.getLength(); ++i) {
      const item = readNumberingProperty(values, i),
        value = unicode("");
      try {
        expect(item.Value.extract(value, "OUString")).toBe(true);
        result.push([text(item.Name), text(value)]);
      } finally {
        value.dispose();
        item.Name.dispose();
        item.Value.dispose();
      }
    }
    return result;
  } finally {
    values.dispose();
    property.Name.dispose();
    property.Value.dispose();
  }
}

it("keeps constructor defaults and distinct Form Paragraph Character output contracts", /** Checks source defaults and real complex-color Any type/lifetime. @returns Nothing. */ () => {
  expect(CellColorHandler.Form).toBe(OutputFormat.Form);
  expect(CellColorHandler.Paragraph).toBe(OutputFormat.Paragraph);
  expect(CellColorHandler.Character).toBe(OutputFormat.Character);
  const handler = new CellColorHandler();
  expect(handler.isInteropGrabBagEnabled()).toBe(false);
  expect(handler.getComplexColor().getType()).toBe(ColorType.Unused);
  expect(handler.getFillComplexColor().getType()).toBe(ColorType.Unused);
  let map = handler.getProperties();
  expect(map.GetPropertyIds()).toEqual([]);
  map.dispose();
  handler.setOutputFormat(OutputFormat.Character);
  map = handler.getProperties();
  expect(map.GetPropertyIds()).toEqual([P.PROP_CHAR_SHADING_VALUE]);
  expect(scalar(map, P.PROP_CHAR_SHADING_VALUE)).toBe(S.CLEAR);
  map.dispose();
  handler.setOutputFormat(OutputFormat.Paragraph);
  map = handler.getProperties();
  expect(map.GetPropertyIds()).toEqual(
    [P.PROP_FILL_COLOR, P.PROP_FILL_COMPLEX_COLOR].sort(
      /** Native numeric map order. @param a - First ID. @param b - Second ID. @returns Order. */ (
        a,
        b,
      ) => a - b,
    ),
  );
  expect(scalar(map, P.PROP_FILL_COLOR)).toBe(-1);
  const reference = component(map, P.PROP_FILL_COMPLEX_COLOR),
    weak = new WeakReferenceHelper(reference),
    theme = new Reference<XTheme>();
  expect((reference.get() as UnoComplexColor).getType()).toBe(ColorType.Unused);
  expect((reference.get() as UnoComplexColor).resolveColor(theme)).toBe(0);
  reference.dispose();
  const live = weak.get();
  expect(live.is()).toBe(true);
  live.dispose();
  map.dispose();
  const dead = weak.get();
  expect(dead.is()).toBe(false);
  dead.dispose();
  weak.dispose();
  theme.dispose();
  handler.dispose();
});

it.each(cases)(
  "retains native %s lexical %s brush %s and character pattern %s",
  /** Exercises full native mapping through actual resource callbacks, integer blend and ordered capture. @param id - Native token. @param lexical - Original spelling. @param weight - Native per1000 weight. @param pattern - Original drawing constant. @returns Nothing. */ (
    id,
    lexical,
    weight,
    pattern,
  ) => {
    const handler = new CellColorHandler(),
      name = unicode("shd");
    handler.enableInteropGrabBag(name);
    name.dispose();
    attrs(handler, [N.LN_CT_Shd_fill, 0xffffff], [N.LN_CT_Shd_color, 0], [N.LN_CT_Shd_val, id]);
    handler.setOutputFormat(OutputFormat.Character);
    const map = handler.getProperties(),
      channel = Math.trunc((255 * (1000 - weight)) / 1000),
      expected = (channel << 16) + (channel << 8) + channel;
    expect(scalar(map, P.PROP_CHAR_SHADING_VALUE)).toBe(pattern);
    expect(scalar(map, P.PROP_CHAR_BACK_COLOR)).toBe(expected);
    expect(map.isSet(P.PROP_CHAR_BACKGROUND_COMPLEX_COLOR)).toBe(false);
    expect(bag(handler)).toEqual([
      ["fill", "FFFFFF"],
      ["color", "000000"],
      ["val", lexical],
      ["originalColor", expected.toString(16).padStart(6, "0").toUpperCase()],
    ]);
    expect(bag(handler)).toHaveLength(4);
    map.dispose();
    handler.dispose();
  },
);

it("preserves automatic foreground/fill conversion, specified-fill state and the sticky explicit-fill flag", /** Checks native auto white/black and explicit-to-auto carryover. @returns Nothing. */ () => {
  const handler = new CellColorHandler();
  attrs(handler, [N.LN_CT_Shd_val, N.LN_Value_ST_Shd_clear], [N.LN_CT_Shd_fill, -1]);
  let map = handler.getProperties();
  expect(scalar(map, P.PROP_BACK_COLOR)).toBe(-1);
  map.dispose();
  handler.setOutputFormat(OutputFormat.Paragraph);
  map = handler.getProperties();
  expect(scalar(map, P.PROP_FILL_STYLE)).toBe(FillStyle.NONE);
  expect(scalar(map, P.PROP_FILL_COLOR)).toBe(-1);
  map.dispose();
  attrs(handler, [N.LN_CT_Shd_val, N.LN_Value_ST_Shd_solid], [N.LN_CT_Shd_color, -1]);
  map = handler.getProperties();
  expect(scalar(map, P.PROP_FILL_STYLE)).toBe(FillStyle.SOLID);
  expect(scalar(map, P.PROP_FILL_COLOR)).toBe(0);
  map.dispose();
  attrs(
    handler,
    [N.LN_CT_Shd_val, N.LN_Value_ST_Shd_clear],
    [N.LN_CT_Shd_fill, 0x123456],
    [N.LN_CT_Shd_fill, -1],
  );
  map = handler.getProperties();
  expect(scalar(map, P.PROP_FILL_STYLE)).toBe(FillStyle.SOLID);
  expect(scalar(map, P.PROP_FILL_COLOR)).toBe(0xffffff);
  map.dispose();
  handler.dispose();
});

it("retains paragraph nil falling through to character background properties", /** Preserves the original output branch even when the selected mode is Paragraph. @returns Nothing. */ () => {
  const handler = new CellColorHandler();
  handler.setOutputFormat(OutputFormat.Paragraph);
  attrs(handler, [N.LN_CT_Shd_fill, 0xabcdef], [N.LN_CT_Shd_val, N.LN_Value_ST_Shd_nil]);
  const map = handler.getProperties();
  expect(map.GetPropertyIds()).toEqual([P.PROP_CHAR_BACK_COLOR]);
  expect(scalar(map, P.PROP_CHAR_BACK_COLOR)).toBe(0xabcdef);
  map.dispose();
  handler.dispose();
});

it("keeps independent theme colors, signed16 transforms and actual themed character component ownership", /** Verifies source tint-before-shade order and uninitialized final color without a theme resolver substitute. @returns Nothing. */ () => {
  const handler = new CellColorHandler(),
    name = unicode("theme");
  handler.enableInteropGrabBag(name);
  name.dispose();
  attrs(
    handler,
    [N.LN_CT_Shd_themeColor, N.LN_Value_St_ThemeColor_accent1],
    [N.LN_CT_Shd_themeTint, 128],
    [N.LN_CT_Shd_themeShade, 64],
    [N.LN_CT_Shd_themeFill, N.LN_Value_St_ThemeColor_accent3],
    [N.LN_CT_Shd_themeFillTint, 1],
    [N.LN_CT_Shd_themeFillShade, 255],
    [N.LN_CT_Shd_fill, 0xaabbcc],
  );
  const foreground = handler.getComplexColor(),
    fill = handler.getFillComplexColor();
  expect(foreground.getThemeColorType()).toBe(Theme.Accent1);
  expect(
    foreground
      .getTransformations()
      .map(
        /** Reads actual transformation values. @param t - Value. @returns Type/value pair. */ (
          t,
        ) => [t.meType, t.mnValue],
      ),
  ).toEqual([
    [T.Tint, 4980],
    [T.Shade, 7490],
  ]);
  expect(fill.getThemeColorType()).toBe(Theme.Accent3);
  expect(
    fill
      .getTransformations()
      .map(
        /** Reads actual transformation values. @param t - Value. @returns Type/value pair. */ (
          t,
        ) => [t.meType, t.mnValue],
      ),
  ).toEqual([
    [T.Tint, 9960],
    [T.Shade, 0],
  ]);
  handler.setOutputFormat(OutputFormat.Character);
  const map = handler.getProperties(),
    reference = component(map, P.PROP_CHAR_BACKGROUND_COMPLEX_COLOR),
    copy = getFromXComplexColor(reference);
  expect(copy.equals(fill)).toBe(true);
  expect(copy.getFinalColor().toInt32()).toBe(0);
  expect(scalar(map, P.PROP_CHAR_BACK_COLOR)).toBe(0xaabbcc);
  expect(bag(handler).slice(0, 6)).toEqual([
    ["themeColor", "accent1"],
    ["themeTint", "80"],
    ["themeShade", "40"],
    ["themeFill", "accent3"],
    ["themeFillTint", "1"],
    ["themeFillShade", "ff"],
  ]);
  reference.dispose();
  map.dispose();
  handler.disableInteropGrabBag();
  expect(handler.isInteropGrabBagEnabled()).toBe(false);
  expect(bag(handler)).toEqual([]);
  attrs(
    handler,
    [N.LN_CT_Shd_themeTint, 0],
    [N.LN_CT_Shd_themeShade, -1],
    [N.LN_CT_Shd_themeFillTint, 0],
    [N.LN_CT_Shd_themeFillShade, -1],
  );
  expect(handler.getComplexColor().getTransformations()).toEqual([]);
  expect(handler.getFillComplexColor().getTransformations()).toEqual([]);
  handler.dispose();
});

it("preserves unknown pattern capture and ignores unhandled attributes and modifiers", /** Checks original switch defaults and inert nested callbacks without normalizing resource values. @returns Nothing. */ () => {
  const handler = new CellColorHandler(),
    name = unicode("old");
  handler.enableInteropGrabBag(name);
  name.dispose();
  attrs(handler, [N.LN_CT_Shd_val, 0], [987654, 123]);
  handler.sprm(new OOXMLProperty(987654, V.createInteger(9), Kind.SPRM));
  handler.setOutputFormat(OutputFormat.Character);
  let map = handler.getProperties();
  expect(scalar(map, P.PROP_CHAR_SHADING_VALUE)).toBe(S.CLEAR);
  map.dispose();
  const rename = unicode("new");
  handler.enableInteropGrabBag(rename);
  rename.dispose();
  expect(bag(handler)).toEqual([
    ["val", ""],
    ["originalColor", "auto"],
  ]);
  handler.disableInteropGrabBag();
  attrs(handler, [N.LN_CT_Shd_fill, 0x112233]);
  map = handler.getProperties();
  expect(scalar(map, P.PROP_CHAR_BACK_COLOR)).toBe(0x112233);
  map.dispose();
  expect(bag(handler)).toEqual([]);
  handler.dispose();
});
