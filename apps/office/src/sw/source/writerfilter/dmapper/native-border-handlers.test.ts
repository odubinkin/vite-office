/** @fileoverview Native Word/OOXML border conversions, independent table/cell state, theme transformations and actual generated UNO interop sequences. */
import { afterEach, expect, it } from "vitest";
import { BorderHandler } from "./BorderHandler";
import { TDefTableHandler } from "./TDefTableHandler";
import { MakeBorderLine } from "./ConversionHelper";
import { TablePropertyMap, PropertyMap } from "./PropertyMap";
import { PropertyIds as P } from "./PropertyIds";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import {
  OOXMLPropertySet,
  OOXMLProperty,
  OOXMLPropertyType as Kind,
  OOXMLValue as V,
} from "../ooxml/OOXMLPropertySet";
import {
  SvxBorderLine,
  ConvertBorderStyleFromWord,
  ConvertBorderWidthToWord,
  ConvertBorderWidthFromWord,
  SvxBorderLineStyle as Style,
} from "../../../../editeng/source/items/borderline";
import {
  BorderLine2,
  cppu_detail_getUnoType_BorderLine2,
} from "../../../../offapi/com/sun/star/table/BorderLine2";
import {
  ThemeColorType as Theme,
  ThemeColorUsage as Usage,
} from "../../../../docmodel/inc/theme/ThemeColorType";
import { TransformationType } from "../../../../docmodel/inc/color/Transformation";
import { Color, ColorTransparency, COL_AUTO } from "../../../../tools/inc/color";
import { ConvertColorOU } from "../../../../filter/source/msfilter/util";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { Sequence } from "../../../../cppu/inc/com/sun/star/uno/Sequence";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue,
} from "../../../../udkapi/com/sun/star/beans/PropertyValue";
import { unicode, text } from "../../core/unocore/unocrsrhelper";
import { readNumberingProperty } from "../../core/unocore/unosett-properties";

const Values = Sequence.specialize<PropertyValue>(cppu_detail_getUnoType_PropertyValue, 48),
  copies: PropertyValue[] = [];
afterEach(
  /** Releases owned generated sequence member copies. @returns Nothing. */ () => {
    for (const value of copies) release(value);
    copies.length = 0;
  },
);
/** Native generated member destruction. @param property - Owned value. @returns Nothing. */
function release(property: PropertyValue): void {
  property.Name.dispose();
  property.Value.dispose();
}
/** Reads a native compound element as an actual generated value. @param values - Original sequence. @param index - Position. @returns Owned value copy. */
function at(values: Sequence<PropertyValue>, index: number): PropertyValue {
  const result = readNumberingProperty(values, index);
  copies.push(result);
  return result;
}
/** Reads a native sequence Any. @param property - Original property. @returns Owned sequence. */
function seq(property: PropertyValue): InstanceType<typeof Values> {
  const values = new Values();
  expect(
    property.Value.extract(values.getAddress(), ["Sequence", cppu_detail_getUnoType_PropertyValue]),
  ).toBe(true);
  return values;
}
/** Reads a native Unicode Any. @param property - Original property. @returns Host UTF16 for assertions. */
function str(property: PropertyValue): string {
  const value = new OUString();
  try {
    expect(property.Value.extract(value, "OUString")).toBe(true);
    return text(value);
  } finally {
    value.dispose();
  }
}
/** Builds actual ordered native attributes. @param entries - Resource/value pairs. @returns Property reference. */
function attrs(...entries: readonly (readonly [number, number])[]): OOXMLPropertySet {
  const result = new OOXMLPropertySet();
  for (const [id, value] of entries) result.add(id, V.createInteger(value), Kind.ATTRIBUTE);
  return result;
}
/** Constructs a real native modifier, preserving null-property distinction. @param id - Original ID. @param properties - Actual set or null. @returns Native property. */
function modifier(id: number, properties: OOXMLPropertySet | null): OOXMLProperty {
  return new OOXMLProperty(id, properties ? V.createPropertySet(properties) : new V(), Kind.SPRM);
}
/** Extracts actual typed BorderLine2 from a property owner. @param properties - Native map. @param id - Border ID. @returns Result or undefined. */
function border(properties: PropertyMap, id: P): BorderLine2 | undefined {
  const property = properties.getProperty(id);
  if (!property) return undefined;
  const result = new BorderLine2();
  try {
    expect(property[1].extract(result, cppu_detail_getUnoType_BorderLine2)).toBe(true);
    return result;
  } finally {
    property[1].dispose();
  }
}

it("retains all original Word style mappings and native fallback styles", /** Full original Word style domain plus unsupported picture styles. @returns Nothing. */ () => {
  const expected = [
    Style.NONE,
    Style.SOLID,
    Style.SOLID,
    Style.DOUBLE,
    Style.NONE,
    Style.SOLID,
    Style.DOTTED,
    Style.DASHED,
    Style.DASH_DOT,
    Style.DASH_DOT_DOT,
    Style.DOUBLE,
    Style.THINTHICK_SMALLGAP,
    Style.THICKTHIN_SMALLGAP,
    Style.THICKTHIN_SMALLGAP,
    Style.THINTHICK_MEDIUMGAP,
    Style.THICKTHIN_MEDIUMGAP,
    Style.THICKTHIN_MEDIUMGAP,
    Style.THINTHICK_LARGEGAP,
    Style.THICKTHIN_LARGEGAP,
    Style.THICKTHIN_LARGEGAP,
    Style.SOLID,
    Style.DOUBLE,
    Style.FINE_DASHED,
    Style.DOUBLE,
    Style.EMBOSSED,
    Style.ENGRAVED,
    Style.OUTSET,
    Style.INSET,
  ];
  for (let index = 0; index < expected.length; ++index)
    expect(ConvertBorderStyleFromWord(index)).toBe(expected[index]);
  for (const value of [-1, 28, 64, 255]) expect(ConvertBorderStyleFromWord(value)).toBe(Style.NONE);
});

it("converts every native OOXML border token through Word while preserving inherited result fields", /** Literal expected native style families retain unsupported artwork as NONE. @returns Nothing. */ () => {
  const expected: Record<string, number> = {
    single: Style.SOLID,
    thick: Style.SOLID,
    double: Style.DOUBLE,
    dotted: Style.DOTTED,
    dashed: Style.DASHED,
    dotDash: Style.DASH_DOT,
    dotDotDash: Style.DASH_DOT_DOT,
    triple: Style.DOUBLE,
    thinThickSmallGap: Style.THINTHICK_SMALLGAP,
    thickThinSmallGap: Style.THICKTHIN_SMALLGAP,
    thinThickThinSmallGap: Style.THICKTHIN_SMALLGAP,
    thinThickMediumGap: Style.THINTHICK_MEDIUMGAP,
    thickThinMediumGap: Style.THICKTHIN_MEDIUMGAP,
    thinThickThinMediumGap: Style.THICKTHIN_MEDIUMGAP,
    thinThickLargeGap: Style.THINTHICK_LARGEGAP,
    thickThinLargeGap: Style.THICKTHIN_LARGEGAP,
    thinThickThinLargeGap: Style.THICKTHIN_LARGEGAP,
    wave: Style.SOLID,
    doubleWave: Style.DOUBLE,
    dashSmallGap: Style.FINE_DASHED,
    dashDotStroked: Style.DOUBLE,
    threeDEmboss: Style.EMBOSSED,
    threeDEngrave: Style.ENGRAVED,
    outset: Style.OUTSET,
    inset: Style.INSET,
  };
  let count = 0;
  for (const [name, id] of Object.entries(N))
    if (name.startsWith("LN_Value_ST_Border_")) {
      const suffix = name.slice("LN_Value_ST_Border_".length),
        value = new BorderLine2(0, 7, 8, 9, 0, 0);
      MakeBorderLine(15, id, 0x123456, value, true);
      expect(value.LineStyle).toBe(expected[suffix] ?? Style.NONE);
      expect(value.Color).toBe(0x123456);
      expect([value.InnerLineWidth, value.OuterLineWidth, value.LineDistance]).toEqual([7, 8, 9]);
      expect(value.LineWidth).toBeGreaterThanOrEqual(0);
      if (value.LineStyle === Style.NONE) expect(value.LineWidth).toBe(0);
      count++;
    }
  expect(count).toBe(191);
  const value = new BorderLine2();
  MakeBorderLine(15, -1, 0, value, true);
  expect(value.LineStyle).toBe(Style.NONE);
  MakeBorderLine(0, N.LN_Value_ST_Border_single, 0, value, true);
  expect(value.LineWidth).toBe(26);
  MakeBorderLine(15, N.LN_Value_ST_Border_thick, 0, value, true);
  expect(value.LineWidth).toBe(53);
  MakeBorderLine(32768, N.LN_Value_ST_Border_single, 0, value, true);
  expect(value.LineWidth).toBe(0);
});

it("preserves legacy palette lookup and automatic-border black with native color text", /** Includes full sixteen-color index domain, unsigned guard and ordinary packed colors. @returns Nothing. */ () => {
  const palette = [
      0, 0, 0x0000ff, 0x00ffff, 0x00ff00, 0xff00ff, 0xff0000, 0xffff00, 0xffffff, 0x000080,
      0x008080, 0x008000, 0x800080, 0x800000, 0x808000, 0x808080, 0xc0c0c0,
    ],
    line = new BorderLine2();
  for (let index = 0; index < palette.length; index++) {
    MakeBorderLine(15, N.LN_Value_ST_Border_single, index, line, false);
    expect(line.Color).toBe(palette[index]);
  }
  MakeBorderLine(15, N.LN_Value_ST_Border_single, COL_AUTO.toInt32(), line, true);
  expect(line.Color).toBe(0);
  MakeBorderLine(15, N.LN_Value_ST_Border_single, 0x123456, line, false);
  expect(line.Color).toBe(0x123456);
  for (const [color, expected] of [
    [COL_AUTO, "auto"],
    [new Color(0x12abef), "12ABEF"],
    [new Color(ColorTransparency, 0x8012abef, "ColorTransparencyTag"), "12ABEF"],
  ] as const) {
    const value = ConvertColorOU(color);
    expect(text(value)).toBe(expected);
    value.dispose();
  }
});

it("retains every original border/theme lexeme and theme-role alias", /** Source-defined IDs map independently of property defaults or a color scheme. @returns Nothing. */ () => {
  for (const [name, id] of Object.entries(N))
    if (name.startsWith("LN_Value_ST_Border_")) {
      const value = TDefTableHandler.getBorderTypeString(id);
      expect(text(value)).toBe(name.slice("LN_Value_ST_Border_".length));
      value.dispose();
    }
  for (const [name, id] of Object.entries(N))
    if (name.startsWith("LN_Value_St_ThemeColor_")) {
      const value = TDefTableHandler.getThemeColorTypeString(id);
      expect(text(value)).toBe(name.slice("LN_Value_St_ThemeColor_".length));
      value.dispose();
    }
  const unknown = TDefTableHandler.getBorderTypeString(-1),
    unknownTheme = TDefTableHandler.getThemeColorTypeString(-1);
  expect(text(unknown)).toBe("");
  expect(text(unknownTheme)).toBe("");
  unknown.dispose();
  unknownTheme.dispose();
  const aliases = [
    N.LN_Value_St_ThemeColor_dark1,
    N.LN_Value_St_ThemeColor_light1,
    N.LN_Value_St_ThemeColor_dark2,
    N.LN_Value_St_ThemeColor_light2,
    N.LN_Value_St_ThemeColor_accent1,
    N.LN_Value_St_ThemeColor_accent2,
    N.LN_Value_St_ThemeColor_accent3,
    N.LN_Value_St_ThemeColor_accent4,
    N.LN_Value_St_ThemeColor_accent5,
    N.LN_Value_St_ThemeColor_accent6,
    N.LN_Value_St_ThemeColor_hyperlink,
    N.LN_Value_St_ThemeColor_followedHyperlink,
  ];
  for (let index = 0; index < aliases.length; index++)
    expect(TDefTableHandler.getThemeColorTypeIndex(aliases[index] as number)).toBe(index);
  for (const [id, type, usage] of [
    [N.LN_Value_St_ThemeColor_background1, Theme.Light1, Usage.Background],
    [N.LN_Value_St_ThemeColor_background2, Theme.Light2, Usage.Background],
    [N.LN_Value_St_ThemeColor_text1, Theme.Dark1, Usage.Text],
    [N.LN_Value_St_ThemeColor_text2, Theme.Dark2, Usage.Text],
    [N.LN_Value_St_ThemeColor_none, Theme.Unknown, Usage.Unknown],
    [-1, Theme.Unknown, Usage.Unknown],
  ] as const) {
    expect(TDefTableHandler.getThemeColorTypeIndex(id)).toBe(type);
    expect(TDefTableHandler.getThemeColorUsage(id)).toBe(usage);
  }
});

it("keeps table-border sparse slots, current-state carryover, zero-property modifiers and fixed LTR aliases", /** Native tables overwrite duplicate edges and materialize known null-reference edges. @returns Nothing. */ () => {
  const handler = new BorderHandler(true),
    empty = handler.getProperties();
  expect(empty.GetPropertyIds()).toEqual([]);
  empty.dispose();
  expect([
    handler.getLineDistance(),
    handler.getLineType(),
    handler.getShadow(),
    handler.getBorderLine().LineStyle,
  ]).toEqual([0, 0, false, Style.NONE]);
  handler.attribute(N.LN_CT_Border_val, V.createInteger(N.LN_Value_ST_Border_single));
  handler.attribute(N.LN_CT_Border_sz, V.createInteger(8));
  handler.attribute(N.LN_CT_Border_color, V.createInteger(0x123456));
  handler.sprm(modifier(N.LN_CT_TblBorders_top, new OOXMLPropertySet()));
  handler.sprm(modifier(N.LN_CT_TblBorders_bottom, null));
  for (const id of [
    N.LN_CT_TblBorders_start,
    N.LN_CT_TblBorders_left,
    N.LN_CT_TblBorders_end,
    N.LN_CT_TblBorders_right,
    N.LN_CT_TblBorders_insideH,
    N.LN_CT_TblBorders_insideV,
  ])
    handler.sprm(modifier(id, attrs([N.LN_CT_Border_sz, 16])));
  handler.sprm(modifier(1, attrs([N.LN_CT_Border_val, N.LN_Value_ST_Border_none])));
  const properties = handler.getProperties();
  expect(properties.GetPropertyIds()).toHaveLength(6);
  expect(border(properties, P.PROP_TOP_BORDER)?.LineWidth).toBe(35);
  expect(border(properties, P.PROP_BOTTOM_BORDER)?.LineWidth).toBe(35);
  expect(border(properties, P.PROP_LEFT_BORDER)?.LineWidth).toBe(71);
  expect(border(properties, P.PROP_RIGHT_BORDER)?.Color).toBe(0x123456);
  handler.attribute(N.LN_CT_Border_space, V.createInteger(5));
  handler.attribute(N.LN_CT_Border_shadow, V.createBoolean(true));
  expect(handler.getLineDistance()).toBe(176);
  expect(handler.getShadow()).toBe(true);
  handler.attribute(N.LN_CT_Border_shadow, V.createBoolean(false));
  expect(handler.getShadow()).toBe(false);
  handler.attribute(0, V.createInteger(9));
  handler.dispose();
  properties.dispose();
  const legacy = new BorderHandler(false);
  legacy.sprm(modifier(N.LN_CT_TblBorders_top, null));
  const omitted = legacy.getProperties();
  expect(omitted.GetPropertyIds()).toEqual([]);
  omitted.dispose();
  legacy.dispose();
});

it("retains table interop without clearing and returns real independent theme transformations", /** Interop raw strings and converted theme data retain different contracts. @returns Nothing. */ () => {
  const handler = new BorderHandler(true),
    name = unicode("tblBorders");
  expect(handler.getComplexColor().isUsed()).toBe(false);
  handler.enableInteropGrabBag(name);
  name.dispose();
  const properties = attrs(
    [N.LN_CT_Border_sz, 1],
    [N.LN_CT_Border_val, N.LN_Value_ST_Border_single],
    [N.LN_CT_Border_color, 0xabcdef],
    [N.LN_CT_Border_space, 3],
    [N.LN_CT_Border_frame, 15],
    [N.LN_CT_Border_themeTint, 128],
    [N.LN_CT_Border_themeShade, 127],
    [N.LN_CT_Border_themeColor, N.LN_Value_St_ThemeColor_accent1],
  );
  handler.sprm(modifier(N.LN_CT_TblBorders_top, properties));
  handler.sprm(modifier(N.LN_CT_TblBorders_bottom, new OOXMLPropertySet()));
  const bag = handler.getInteropGrabBag(),
    values = seq(bag),
    top = at(values, 0),
    fields = seq(top);
  expect(text(bag.Name)).toBe("tblBorders");
  expect(text(top.Name)).toBe("top");
  expect(fields.getLength()).toBe(8);
  expect(
    Array.from(
      { length: 8 },
      /** Reads actual raw field strings. @param unused - Unused initializer. @param index - Position. @returns Name/text pair. */ (
        unused,
        index,
      ) => {
        void unused;
        const value = at(fields, index);
        return [text(value.Name), str(value)];
      },
    ),
  ).toEqual([
    ["sz", "1"],
    ["val", "single"],
    ["color", "ABCDEF"],
    ["space", "3"],
    ["frame", "f"],
    ["themeTint", "80"],
    ["themeShade", "7f"],
    ["themeColor", "accent1"],
  ]);
  const color = handler.getComplexColor();
  expect(color.getThemeColorType()).toBe(Theme.Accent1);
  expect(
    color
      .getTransformations()
      .map(
        /** Reads original typed transformations. @param value - Value. @returns Type/value. */ (
          value,
        ) => [value.meType, value.mnValue],
      ),
  ).toEqual([
    [TransformationType.Tint, 4980],
    [TransformationType.Shade, 5019],
  ]);
  const override = unicode("override"),
    overridden = handler.getInteropGrabBag(override),
    empty = unicode(""),
    fallback = handler.getInteropGrabBag(empty),
    repeated = seq(fallback);
  expect(text(overridden.Name)).toBe("override");
  expect(text(fallback.Name)).toBe("tblBorders");
  expect(repeated.getLength()).toBe(2);
  override.dispose();
  empty.dispose();
  handler.attribute(N.LN_CT_Border_themeTint, V.createInteger(0));
  handler.attribute(N.LN_CT_Border_themeShade, V.createInteger(0));
  expect(handler.getComplexColor().getTransformations()).toEqual([]);
  expect(color.getTransformations()).toHaveLength(2);
  handler.dispose();
  fields.dispose();
  values.dispose();
  repeated.dispose();
  release(bag);
  release(overridden);
  release(fallback);
});

it("resets cell raw parameters per child and retains the first border per side", /** Null children do not append a cell border; duplicates keep native vector source order. @returns Nothing. */ () => {
  const handler = new TDefTableHandler(),
    empty = new TablePropertyMap();
  handler.fillCellProperties(empty);
  expect(empty.GetPropertyIds()).toEqual([]);
  empty.dispose();
  const first = attrs(
    [N.LN_CT_Border_val, N.LN_Value_ST_Border_single],
    [N.LN_CT_Border_sz, 8],
    [N.LN_CT_Border_color, 0x123456],
  );
  handler.sprm(modifier(N.LN_CT_TcBorders_top, first));
  handler.sprm(
    modifier(N.LN_CT_TcBorders_top, attrs([N.LN_CT_Border_val, N.LN_Value_ST_Border_thick])),
  );
  handler.sprm(
    modifier(N.LN_CT_TcBorders_bottom, attrs([N.LN_CT_Border_val, N.LN_Value_ST_Border_single])),
  );
  for (const id of [
    N.LN_CT_TcBorders_start,
    N.LN_CT_TcBorders_left,
    N.LN_CT_TcBorders_end,
    N.LN_CT_TcBorders_right,
    N.LN_CT_TcBorders_insideH,
    N.LN_CT_TcBorders_insideV,
  ])
    handler.sprm(modifier(id, first));
  handler.sprm(modifier(N.LN_CT_TcBorders_top, null));
  handler.sprm(modifier(1, first));
  handler.attribute(0, V.createInteger(1));
  const properties = new TablePropertyMap();
  handler.fillCellProperties(properties);
  expect(properties.GetPropertyIds()).toHaveLength(6);
  expect(border(properties, P.PROP_TOP_BORDER)?.LineWidth).toBe(35);
  expect(border(properties, P.PROP_TOP_BORDER)?.Color).toBe(0x123456);
  expect(border(properties, P.PROP_BOTTOM_BORDER)?.LineWidth).toBe(26);
  expect(border(properties, P.PROP_BOTTOM_BORDER)?.Color).toBe(0);
  handler.dispose();
  properties.dispose();
});

it("keeps cell diagonal interop and clears the cell grab bag after each getter", /** Original theme construction has no map insertion and does not repair that omission. @returns Nothing. */ () => {
  const handler = new TDefTableHandler(),
    name = unicode("tcBorders");
  handler.enableInteropGrabBag(name);
  name.dispose();
  const properties = attrs(
    [N.LN_CT_Border_sz, 8],
    [N.LN_CT_Border_val, N.LN_Value_ST_Border_single],
    [N.LN_CT_Border_color, 0xabcdef],
    [N.LN_CT_Border_space, 3],
    [N.LN_CT_Border_shadow, 1],
    [N.LN_CT_Border_frame, 1],
    [N.LN_CT_Border_themeTint, 128],
    [N.LN_CT_Border_themeShade, 127],
    [N.LN_CT_Border_themeColor, N.LN_Value_St_ThemeColor_accent1],
  );
  const ids = [
    N.LN_CT_TcBorders_top,
    N.LN_CT_TcBorders_start,
    N.LN_CT_TcBorders_left,
    N.LN_CT_TcBorders_bottom,
    N.LN_CT_TcBorders_end,
    N.LN_CT_TcBorders_right,
    N.LN_CT_TcBorders_insideH,
    N.LN_CT_TcBorders_insideV,
    N.LN_CT_TcBorders_tl2br,
    N.LN_CT_TcBorders_tr2bl,
  ];
  for (const id of ids) handler.sprm(modifier(id, properties));
  const bag = handler.getInteropGrabBag(),
    values = seq(bag);
  expect(values.getLength()).toBe(10);
  expect(
    ids.map(
      /** Reads original stored edge names. @param id - Unused source ID. @param index - Position. @returns Name. */ (
        id,
        index,
      ) => {
        void id;
        return text(at(values, index).Name);
      },
    ),
  ).toEqual([
    "top",
    "start",
    "left",
    "bottom",
    "end",
    "right",
    "insideH",
    "insideV",
    "tl2br",
    "tr2bl",
  ]);
  const first = seq(at(values, 0));
  expect(first.getLength()).toBe(5);
  expect(str(at(first, 4))).toBe("accent1");
  first.dispose();
  const map = new TablePropertyMap();
  handler.fillCellProperties(map);
  expect(map.GetPropertyIds()).toHaveLength(6);
  handler.attribute(N.LN_CT_Border_themeTint, V.createInteger(0));
  handler.attribute(N.LN_CT_Border_themeShade, V.createInteger(0));
  handler.fillCellProperties(map);
  const cleared = handler.getInteropGrabBag(),
    empty = seq(cleared);
  expect(empty.getLength()).toBe(0);
  const explicit = unicode("explicit");
  handler.attribute(N.LN_CT_Border_space, V.createInteger(4));
  const override = handler.getInteropGrabBag(explicit);
  expect(text(override.Name)).toBe("explicit");
  explicit.dispose();
  const blank = unicode("");
  const fallback = handler.getInteropGrabBag(blank);
  expect(text(fallback.Name)).toBe("tcBorders");
  blank.dispose();
  handler.dispose();
  values.dispose();
  empty.dispose();
  map.dispose();
  release(bag);
  release(cleared);
  release(override);
  release(fallback);
});

it("retains native border-width export/import families and thin-line minima", /** Original conversion helpers are reused without changing their existing width rules. @returns Nothing. */ () => {
  const cases: readonly (readonly [number, number, number])[] = [
    [Style.SOLID, 60, 60],
    [Style.DOTTED, 60, 60],
    [Style.DASHED, 60, 60],
    [Style.FINE_DASHED, 60, 60],
    [Style.DASH_DOT, 60, 60],
    [Style.DASH_DOT_DOT, 60, 60],
    [Style.DOUBLE, 20, 180],
    [Style.DOUBLE_THIN, 20, 0],
    [Style.THINTHICK_MEDIUMGAP, 30, 120],
    [Style.THICKTHIN_MEDIUMGAP, 30, 120],
    [Style.EMBOSSED, 30, 120],
    [Style.ENGRAVED, 30, 120],
    [Style.THINTHICK_SMALLGAP, 30, 90],
    [Style.THICKTHIN_SMALLGAP, 30, 90],
    [Style.THINTHICK_LARGEGAP, 15, 105],
    [Style.THICKTHIN_LARGEGAP, 15, 105],
    [Style.OUTSET, 22.5, 135],
    [Style.INSET, 22.5, 135],
    [Style.NONE, 0, 0],
    [-1, 0, 0],
  ];
  for (const [style, toWord, fromWord] of cases) {
    expect(ConvertBorderWidthToWord(style as Style, 60)).toBe(toWord);
    expect(ConvertBorderWidthFromWord(style as Style, 60)).toBe(fromWord);
    expect(ConvertBorderWidthToWord(style as Style, 0)).toBe(0);
  }
  for (const style of [
    Style.DOUBLE,
    Style.DOUBLE_THIN,
    Style.THINTHICK_MEDIUMGAP,
    Style.THICKTHIN_MEDIUMGAP,
    Style.EMBOSSED,
    Style.ENGRAVED,
    Style.THINTHICK_SMALLGAP,
    Style.THICKTHIN_SMALLGAP,
    Style.THINTHICK_LARGEGAP,
    Style.THICKTHIN_LARGEGAP,
    Style.OUTSET,
    Style.INSET,
  ])
    expect(ConvertBorderWidthToWord(style, 1)).toBe(1);
  expect(ConvertBorderWidthFromWord(Style.SOLID, 0, 5)).toBe(15);
  expect(ConvertBorderWidthFromWord(Style.SOLID, -1, 5)).toBe(1);
  expect(ConvertBorderWidthFromWord(Style.FINE_DASHED, -1)).toBe(-1);
  const single = new SvxBorderLine();
  single.GuessLinesWidths(Style.NONE, 20);
  expect(single.GetBorderLineStyle()).toBe(Style.SOLID);
  expect(single.GetWidth()).toBe(20);
});
