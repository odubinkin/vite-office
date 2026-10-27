/** @fileoverview Native width/height, cell margin and latent style receivers over real resource values and generated UNO property sequences. */
import { afterEach, expect, it } from "vitest";
import { MeasureHandler } from "./MeasureHandler";
import { CellMarginHandler } from "./CellMarginHandler";
import { LatentStyleHandler } from "./LatentStyleHandler";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { SizeType } from "../../../../offapi/com/sun/star/text/SizeType";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue,
} from "../../../../udkapi/com/sun/star/beans/PropertyValue";
import { Sequence } from "../../../../cppu/inc/com/sun/star/uno/Sequence";
import {
  OOXMLProperty,
  OOXMLPropertySet,
  OOXMLPropertyType as Kind,
  OOXMLValue as V,
} from "../ooxml/OOXMLPropertySet";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { unicode, text } from "../../core/unocore/unocrsrhelper";

import { readNumberingProperty } from "../../core/unocore/unosett-properties";

const copies: PropertyValue[] = [];
afterEach(
  /** Releases copied generated sequence elements after each case. @returns Nothing. */ () => {
    for (const value of copies) release(value);
    copies.length = 0;
  },
);
/** Reads an owned generated struct from the actual native compound address. @param values - Sequence. @param index - Position. @returns Copied property. */
function at(values: Sequence<PropertyValue>, index: number): PropertyValue {
  const result = readNumberingProperty(values, index);
  copies.push(result);
  return result;
}

const Values = Sequence.specialize<PropertyValue>(cppu_detail_getUnoType_PropertyValue, 48);
/** Constructs the original string alternative with real Unicode ownership. @param value - UTF16 text. @returns Copied resource value. */
function string(value: string): V {
  const source = unicode(value);
  try {
    return V.createString(source);
  } finally {
    source.dispose();
  }
}
/** Reads an actual string Any. @param value - Generated property. @returns UTF16 text. */
function stringAny(value: PropertyValue): string {
  const result = new OUString();
  try {
    expect(value.Value.extract(result, "OUString")).toBe(true);
    return text(result);
  } finally {
    result.dispose();
  }
}
/** Borrows the actual sequence using its C++ specialization. @param value - Sequence-containing property. @returns Owned native sequence. */
function sequence(value: PropertyValue): InstanceType<typeof Values> {
  const result = new Values();
  expect(
    value.Value.extract(result.getAddress(), ["Sequence", cppu_detail_getUnoType_PropertyValue]),
  ).toBe(true);
  return result;
}
/** Releases caller-owned generated compound members. @param value - Owned property. @returns Nothing. */
function release(value: PropertyValue): void {
  value.Name.dispose();
  value.Value.dispose();
}
/** Makes a real nested width property reference; omitted width is distinct from zero. @param width - Optional raw width. @param type - Optional native unit. @returns Actual property set. */
function width(width?: number, type?: number): OOXMLPropertySet {
  const result = new OOXMLPropertySet();
  if (width !== undefined) result.add(N.LN_CT_TblWidth_w, V.createInteger(width), Kind.ATTRIBUTE);
  if (type !== undefined) result.add(N.LN_CT_TblWidth_type, V.createInteger(type), Kind.ATTRIBUTE);
  return result;
}
/** Delivers an actual nested margin modifier. @param handler - Receiver. @param id - Edge ID. @param properties - Optional nested properties. @returns Nothing. */
function margin(handler: CellMarginHandler, id: number, properties: OOXMLPropertySet | null): void {
  handler.sprm(
    new OOXMLProperty(id, properties ? V.createPropertySet(properties) : new V(), Kind.SPRM),
  );
}

it("preserves measure defaults, absolute-unit conversion, percentage rejection and limited signed conversion", /** Uses the exact original native unit identities. @returns Nothing. */ () => {
  const handler = new MeasureHandler();
  expect([
    handler.getValue(),
    handler.getUnit(),
    handler.getMeasureValue(),
    handler.GetRowHeightSizeType(),
  ]).toEqual([0, -1, 0, SizeType.MIN]);
  handler.attribute(N.LN_CT_TblWidth_w, V.createInteger(1440));
  expect(handler.getMeasureValue()).toBe(0);
  for (const [unit, expected] of [
    [3, 2540],
    [N.LN_Value_ST_TblWidth_dxa, 2540],
    [N.LN_Value_ST_TblWidth_pct, 0],
    [N.LN_Value_ST_TblWidth_auto, 0],
    [N.LN_Value_ST_TblWidth_nil, 0],
    [0, 0],
  ] as const) {
    handler.attribute(N.LN_CT_TblWidth_type, V.createInteger(unit));
    expect(handler.getUnit()).toBe(unit);
    expect(handler.getValue()).toBe(1440);
    expect(handler.getMeasureValue()).toBe(expected);
  }
  handler.attribute(N.LN_CT_TblWidth_type, V.createInteger(N.LN_Value_ST_TblWidth_dxa));
  for (const [value, expected] of [
    [0, 0],
    [-1440, -2540],
    [32768, 0],
  ] as const) {
    handler.attribute(N.LN_CT_TblWidth_w, V.createInteger(value));
    expect(handler.getMeasureValue()).toBe(expected);
  }
  handler.attribute(0, V.createInteger(42));
  handler.sprm(new OOXMLProperty(1, new V(), Kind.SPRM));
  handler.dispose();
});

it("uses native terminated signed32 height parsing and does not reset exact height on subsequent rules", /** Width and row-height values are different native alternatives. @returns Nothing. */ () => {
  const handler = new MeasureHandler();
  handler.attribute(N.LN_CT_Height_hRule, string("atLeast"));
  expect(handler.GetRowHeightSizeType()).toBe(SizeType.MIN);
  handler.attribute(N.LN_CT_Height_hRule, string("exact"));
  expect(handler.GetRowHeightSizeType()).toBe(SizeType.FIX);
  handler.attribute(N.LN_CT_Height_hRule, string("auto"));
  expect(handler.GetRowHeightSizeType()).toBe(SizeType.FIX);
  for (const [value, expected] of [
    ["1440", 1440],
    [" -1440tail", -1440],
    ["12\0ignored", 12],
    ["2147483647", 2147483647],
    ["-2147483648", -2147483648],
    ["2147483648", 0],
    ["-2147483649", 0],
    ["invalid", 0],
  ] as const) {
    handler.attribute(N.LN_CT_Height_val, string(value));
    expect(handler.getValue()).toBe(expected);
    expect(handler.getUnit()).toBe(N.LN_Value_ST_TblWidth_dxa);
  }
  handler.dispose();
});

it("copies native measure interop sequences with ordered duplicates and void unknown units", /** Disabled capture retains existing bag entries; caller results survive destruction. @returns Nothing. */ () => {
  const handler = new MeasureHandler(),
    name = unicode("幅😀"),
    empty = unicode("");
  handler.enableInteropGrabBag(name);
  name.dispose();
  for (const unit of [
    N.LN_Value_ST_TblWidth_nil,
    N.LN_Value_ST_TblWidth_pct,
    N.LN_Value_ST_TblWidth_dxa,
    N.LN_Value_ST_TblWidth_auto,
    -1,
  ])
    handler.attribute(N.LN_CT_TblWidth_type, V.createInteger(unit));
  handler.attribute(N.LN_CT_TblWidth_w, V.createInteger(22));
  handler.attribute(N.LN_CT_TblWidth_w, V.createInteger(-5));
  const bag = handler.getInteropGrabBag(),
    values = sequence(bag);
  expect(text(bag.Name)).toBe("幅😀");
  expect(values.getLength()).toBe(7);
  expect(
    [0, 1, 2, 3].map(
      /** Reads known native unit strings. @param index - Position. @returns String. */ (index) =>
        stringAny(at(values, index)),
    ),
  ).toEqual(["nil", "pct", "dxa", "auto"]);
  expect(at(values, 4).Value.hasValue()).toBe(false);
  expect(at(values, 5).Value.get("sal_Int32")).toBe(22);
  expect(at(values, 6).Value.get("sal_Int32")).toBe(-5);
  handler.enableInteropGrabBag(empty);
  empty.dispose();
  handler.attribute(N.LN_CT_TblWidth_w, V.createInteger(99));
  handler.attribute(N.LN_CT_TblWidth_type, V.createInteger(3));
  const disabled = handler.getInteropGrabBag(),
    retained = sequence(disabled);
  expect(text(disabled.Name)).toBe("");
  expect(retained.getLength()).toBe(7);
  handler.dispose();
  expect(stringAny(at(values, 2))).toBe("dxa");
  values.dispose();
  retained.dispose();
  release(bag);
  release(disabled);
});

it("retains margin defaults, all original table/cell edge aliases, zero validity and last-write direction", /** Actual typed sets resolve into the native receiver. @returns Nothing. */ () => {
  const handler = new CellMarginHandler();
  expect([
    handler.m_nLeftMargin,
    handler.m_nRightMargin,
    handler.m_nTopMargin,
    handler.m_nBottomMargin,
  ]).toEqual([0, 0, 0, 0]);
  expect([
    handler.m_bLeftMarginValid,
    handler.m_bRightMarginValid,
    handler.m_bTopMarginValid,
    handler.m_bBottomMarginValid,
  ]).toEqual([false, false, false, false]);
  for (const ids of [
    [N.LN_CT_TblCellMar_top, N.LN_CT_TcMar_top],
    [N.LN_CT_TblCellMar_bottom, N.LN_CT_TcMar_bottom],
    [N.LN_CT_TblCellMar_start, N.LN_CT_TcMar_start],
    [N.LN_CT_TblCellMar_left, N.LN_CT_TcMar_left],
    [N.LN_CT_TblCellMar_end, N.LN_CT_TcMar_end],
    [N.LN_CT_TblCellMar_right, N.LN_CT_TcMar_right],
  ])
    for (const id of ids) margin(handler, id, width(1440, N.LN_Value_ST_TblWidth_dxa));
  expect([
    handler.m_nLeftMargin,
    handler.m_nRightMargin,
    handler.m_nTopMargin,
    handler.m_nBottomMargin,
  ]).toEqual([2540, 2540, 2540, 2540]);
  expect([
    handler.m_bLeftMarginValid,
    handler.m_bRightMarginValid,
    handler.m_bTopMarginValid,
    handler.m_bBottomMarginValid,
  ]).toEqual([true, true, true, true]);
  margin(handler, N.LN_CT_TcMar_start, width(720));
  margin(handler, N.LN_CT_TcMar_left, width(0));
  expect(handler.m_nLeftMargin).toBe(0);
  expect(handler.m_bLeftMarginValid).toBe(true);
  margin(handler, N.LN_CT_TcMar_end, width(-20));
  expect(handler.m_nRightMargin).toBe(0);
  margin(handler, N.LN_CT_TcMar_top, width(32768));
  expect(handler.m_nTopMargin).toBe(0);
  handler.attribute(0, V.createInteger(42));
  margin(handler, N.LN_CT_TcMar_top, null);
  margin(handler, 1, width(20));
  handler.dispose();
});

it("preserves stale raw margin metadata while resetting only the converted temporary between edges", /** Source behavior accepts non-dxa units and keeps original raw fields for empty children. @returns Nothing. */ () => {
  const handler = new CellMarginHandler(),
    name = unicode("tblCellMar");
  handler.enableInteropGrabBag(name);
  name.dispose();
  for (const unit of [
    N.LN_Value_ST_TblWidth_nil,
    N.LN_Value_ST_TblWidth_pct,
    N.LN_Value_ST_TblWidth_dxa,
    N.LN_Value_ST_TblWidth_auto,
    0,
  ])
    margin(handler, N.LN_CT_TcMar_left, width(1440, unit));
  expect(handler.m_nLeftMargin).toBe(2540);
  margin(handler, N.LN_CT_TcMar_top, new OOXMLPropertySet());
  expect(handler.m_nTopMargin).toBe(0);
  margin(handler, N.LN_CT_TcMar_start, width(1));
  margin(handler, N.LN_CT_TcMar_bottom, width(2));
  margin(handler, N.LN_CT_TcMar_end, width(3));
  margin(handler, N.LN_CT_TcMar_right, width(4));
  const bag = handler.getInteropGrabBag(),
    values = sequence(bag);
  expect(text(bag.Name)).toBe("tblCellMar");
  expect(values.getLength()).toBe(10);
  for (let index = 0; index < 5; index++) {
    const edge = at(values, index),
      pair = sequence(edge);
    expect(text(edge.Name)).toBe("left");
    expect(at(pair, 0).Value.get("sal_Int32")).toBe(1440);
    expect(stringAny(at(pair, 1))).toBe(["nil", "pct", "dxa", "auto", ""][index]);
    pair.dispose();
  }
  const top = sequence(at(values, 5));
  expect(at(top, 0).Value.get("sal_Int32")).toBe(1440);
  expect(stringAny(at(top, 1))).toBe("");
  top.dispose();
  expect(
    [5, 6, 7, 8, 9].map(
      /** Retains source edge spelling. @param index - Entry position. @returns Name. */ (index) =>
        text(at(values, index).Name),
    ),
  ).toEqual(["top", "start", "bottom", "end", "right"]);
  const empty = unicode("");
  handler.enableInteropGrabBag(empty);
  empty.dispose();
  margin(handler, N.LN_CT_TcMar_top, width(99));
  const disabled = handler.getInteropGrabBag(),
    retained = sequence(disabled);
  expect(retained.getLength()).toBe(10);
  handler.dispose();
  expect(values.getLength()).toBe(10);
  retained.dispose();
  values.dispose();
  release(bag);
  release(disabled);
});

it("stores all latent style attributes in original order with duplicates and exact string projection", /** Numeric values are not silently formatted into strings by the receiver. @returns Nothing. */ () => {
  const handler = new LatentStyleHandler(),
    fields = [
      N.LN_CT_LsdException_name,
      N.LN_CT_LsdException_locked,
      N.LN_CT_LsdException_uiPriority,
      N.LN_CT_LsdException_semiHidden,
      N.LN_CT_LsdException_unhideWhenUsed,
      N.LN_CT_LsdException_qFormat,
    ];
  expect(handler.getAttributes()).toEqual([]);
  for (const id of fields) handler.attribute(id, string("Σ😀"));
  handler.attribute(N.LN_CT_LsdException_name, string("duplicate"));
  handler.attribute(N.LN_CT_LsdException_locked, V.createBoolean(true));
  handler.attribute(0, string("ignored"));
  handler.sprm(new OOXMLProperty(1, new V(), Kind.SPRM));
  const values = handler.getAttributes();
  expect(
    values.map(
      /** Reads stored native names. @param value - Property. @returns Name. */ (value) =>
        text(value.Name),
    ),
  ).toEqual([
    "name",
    "locked",
    "uiPriority",
    "semiHidden",
    "unhideWhenUsed",
    "qFormat",
    "name",
    "locked",
  ]);
  expect(values.map(stringAny)).toEqual([
    "Σ😀",
    "Σ😀",
    "Σ😀",
    "Σ😀",
    "Σ😀",
    "Σ😀",
    "duplicate",
    "",
  ]);
  handler.dispose();
  expect(handler.getAttributes()).toEqual([]);
});
