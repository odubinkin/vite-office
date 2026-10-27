/** @fileoverview Source-backed floating-table positioning uses actual resource Values, intrusive handler lifetime, SequenceAsHashMap and generated UNO property fields; invalid-anchor relation payloads are deliberately not inspected or certified. */
import { expect, it } from "vitest";
import { TablePositionHandler } from "./TablePositionHandler";
import { OOXMLProperty, OOXMLPropertyType as Kind, OOXMLValue } from "../ooxml/OOXMLPropertySet";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { unicode } from "../../core/unocore/unocrsrhelper";
import { SequenceAsHashMap } from "../../../../comphelper/source/misc/sequenceashashmap";
import {
  BorderLine2,
  cppu_detail_getUnoType_BorderLine2 as borderType,
} from "../../../../offapi/com/sun/star/table/BorderLine2";
import { HoriOrientation as H } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { VertOrientation as V } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { RelOrientation as R } from "../../../../offapi/com/sun/star/text/RelOrientation";
import { SvRef } from "../../../../tools/inc/ref";
import type { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
/** Original caller resource alternative and lifetime. @param handler - Actual receiver. @param id - Native resource. @param value - String or signed integer. @returns Nothing. */
function attribute(handler: TablePositionHandler, id: number, value: string | number): void {
  if (typeof value === "number") handler.attribute(id, OOXMLValue.createInteger(value));
  else {
    const name = unicode(value);
    try {
      handler.attribute(id, OOXMLValue.createString(name));
    } finally {
      name.dispose();
    }
  }
}
/** Maps an actual result sequence through the original typed reset overload. @param handler - Actual handler. @returns Owned map. */
function result(handler: TablePositionHandler): SequenceAsHashMap {
  const sequence = handler.getTablePosition();
  try {
    return new SequenceAsHashMap(sequence, "PropertyValue");
  } finally {
    sequence.dispose();
  }
}
/** Reads an acquired property copy. @param map - Actual map. @param name - Source name. @returns Owned Any. */
function property(map: SequenceAsHashMap, name: string): Any {
  const key = unicode(name);
  try {
    return map.getValue(key);
  } finally {
    key.dispose();
  }
}
/** Reads an original declared scalar, never a native indeterminate relation. @param map - Actual output. @param name - Source name. @param type - Declared width. @returns Number. */
function scalar(
  map: SequenceAsHashMap,
  name: string,
  type: "sal_Int16" | "sal_Int32" = "sal_Int32",
): number {
  const value = property(map, name),
    output: [number] = [0];
  try {
    expect(value.extract(output, type)).toBe(true);
    return output[0];
  } finally {
    value.dispose();
  }
}

it("keeps native margin/text anchor defaults, no orientation, empty borders and omitted overlap", /** Checks defined source defaults and actual typed BorderLine2 output. @returns Nothing. */ () => {
  const owner = new SvRef(new TablePositionHandler()),
    handler = owner.operatorArrow(),
    map = result(handler);
  expect(map.size()).toBe(19);
  expect(scalar(map, "HoriOrient", "sal_Int16")).toBe(H.NONE);
  expect(scalar(map, "VertOrient", "sal_Int16")).toBe(V.NONE);
  expect(scalar(map, "HoriOrientRelation", "sal_Int16")).toBe(R.FRAME);
  expect(scalar(map, "VertOrientRelation", "sal_Int16")).toBe(R.PAGE_PRINT_AREA);
  for (const name of [
    "LeftBorderDistance",
    "RightBorderDistance",
    "TopBorderDistance",
    "BottomBorderDistance",
    "LeftMargin",
    "RightMargin",
    "TopMargin",
    "BottomMargin",
    "HoriOrientPosition",
    "VertOrientPosition",
  ])
    expect(scalar(map, name)).toBe(0);
  expect(scalar(map, "FillTransparence")).toBe(100);
  const overlap = property(map, "AllowOverlap");
  expect(overlap.hasValue()).toBe(false);
  overlap.dispose();
  for (const name of ["TopBorder", "BottomBorder", "LeftBorder", "RightBorder"]) {
    const value = property(map, name),
      border = new BorderLine2();
    try {
      expect(value.extract(border, borderType)).toBe(true);
      expect(border.equals(new BorderLine2())).toBe(true);
    } finally {
      value.dispose();
    }
  }
  map.dispose();
  owner.dispose();
});

it.each([
  ["center", H.CENTER],
  ["inside", H.INSIDE],
  ["left", H.LEFT],
  ["outside", H.OUTSIDE],
  ["right", H.RIGHT],
  ["other", H.NONE],
] as const)(
  "retains horizontal spec %s",
  /** Original recognized choices and unknown-spec NONE. @param spec - Source string. @param expected - Source constant. @returns Nothing. */ (
    spec,
    expected,
  ) => {
    const handler = new TablePositionHandler();
    attribute(handler, N.LN_CT_TblPPr_tblpXSpec, spec);
    const map = result(handler);
    expect(scalar(map, "HoriOrient", "sal_Int16")).toBe(expected);
    map.dispose();
    handler.dispose();
  },
);
it.each([
  ["bottom", V.BOTTOM],
  ["center", V.CENTER],
  ["top", V.TOP],
  ["inside", V.NONE],
] as const)(
  "retains vertical spec %s",
  /** Preserves native unmapped vertical choices. @param spec - Source string. @param expected - Source constant. @returns Nothing. */ (
    spec,
    expected,
  ) => {
    const handler = new TablePositionHandler();
    attribute(handler, N.LN_CT_TblPPr_tblpYSpec, spec);
    const map = result(handler);
    expect(scalar(map, "VertOrient", "sal_Int16")).toBe(expected);
    map.dispose();
    handler.dispose();
  },
);
it.each([
  ["margin", R.PAGE_PRINT_AREA],
  ["page", R.PAGE_FRAME],
  ["text", R.FRAME],
] as const)(
  "keeps both source anchor relations for %s",
  /** All initialized source relation branches use declared short values. @param anchor - Source string. @param expected - Source relation. @returns Nothing. */ (
    anchor,
    expected,
  ) => {
    const handler = new TablePositionHandler();
    attribute(handler, N.LN_CT_TblPPr_horzAnchor, anchor);
    attribute(handler, N.LN_CT_TblPPr_vertAnchor, anchor);
    const map = result(handler);
    expect(scalar(map, "HoriOrientRelation", "sal_Int16")).toBe(expected);
    expect(scalar(map, "VertOrientRelation", "sal_Int16")).toBe(expected);
    map.dispose();
    handler.dispose();
  },
);

it("retains signed twip conversion, positive limiting, overlap omission and independent output ownership", /** Applies actual integer resource callbacks and then destroys the handler before reading retained output. @returns Nothing. */ () => {
  const owner = new SvRef(new TablePositionHandler()),
    alias = new SvRef(owner),
    handler = owner.operatorArrow();
  expect(handler.GetRefCount()).toBe(2);
  attribute(handler, N.LN_CT_TblPPr_leftFromText, 1440);
  attribute(handler, N.LN_CT_TblPPr_rightFromText, -1440);
  attribute(handler, N.LN_CT_TblPPr_topFromText, 32768);
  attribute(handler, N.LN_CT_TblPPr_bottomFromText, 72);
  attribute(handler, N.LN_CT_TblPPr_tblpX, 720);
  attribute(handler, N.LN_CT_TblPPr_tblpY, -720);
  handler.setTableOverlap(N.LN_Value_ST_TblOverlap_never);
  const values = handler.getTablePosition();
  owner.clear();
  expect(alias.operatorArrow().GetRefCount()).toBe(1);
  alias.clear();
  const map = new SequenceAsHashMap(values, "PropertyValue");
  values.dispose();
  expect(scalar(map, "LeftMargin")).toBe(2540);
  expect(scalar(map, "RightMargin")).toBe(-2540);
  expect(scalar(map, "TopMargin")).toBe(0);
  expect(scalar(map, "BottomMargin")).toBe(127);
  expect(scalar(map, "HoriOrientPosition")).toBe(1270);
  expect(scalar(map, "VertOrientPosition")).toBe(-1270);
  const overlap = property(map, "AllowOverlap"),
    allow: [boolean] = [true];
  expect(overlap.extract(allow, "bool")).toBe(true);
  expect(allow[0]).toBe(false);
  overlap.dispose();
  map.dispose();
  owner.dispose();
  alias.dispose();
  const fresh = new TablePositionHandler();
  fresh.setTableOverlap(N.LN_Value_ST_TblOverlap_overlap);
  const omitted = result(fresh),
    noOverlap = property(omitted, "AllowOverlap");
  expect(noOverlap.hasValue()).toBe(false);
  noOverlap.dispose();
  omitted.dispose();
  fresh.dispose();
});

it("compares only original six position fields and ignores margins, overlap and unknown input", /** Exercises native equality short circuit in declaration order through public callbacks. @returns Nothing. */ () => {
  const a = new TablePositionHandler(),
    b = new TablePositionHandler();
  expect(a.operatorEquals(b)).toBe(true);
  for (const [id, value] of [
    [N.LN_CT_TblPPr_vertAnchor, "page"],
    [N.LN_CT_TblPPr_tblpYSpec, "top"],
    [N.LN_CT_TblPPr_horzAnchor, "page"],
    [N.LN_CT_TblPPr_tblpXSpec, "right"],
    [N.LN_CT_TblPPr_tblpY, 12],
    [N.LN_CT_TblPPr_tblpX, 34],
  ] as const) {
    attribute(a, id, value);
    expect(a.operatorEquals(b)).toBe(false);
    attribute(b, id, value);
    expect(a.operatorEquals(b)).toBe(true);
  }
  attribute(a, N.LN_CT_TblPPr_leftFromText, 1440);
  a.setTableOverlap(N.LN_Value_ST_TblOverlap_never);
  expect(a.operatorEquals(b)).toBe(true);
  attribute(a, N.LN_inTbl, 42);
  const sprm = new OOXMLProperty(N.LN_inTbl, OOXMLValue.createInteger(1), Kind.SPRM);
  a.sprm(sprm);
  expect(a.operatorEquals(b)).toBe(true);
  const first = result(a),
    second = result(b);
  expect(scalar(first, "LeftMargin")).toBe(2540);
  expect(scalar(second, "LeftMargin")).toBe(0);
  first.dispose();
  second.dispose();
  a.dispose();
  b.dispose();
});

it("leaves invalid-anchor relation slots indeterminate instead of supplying a repair default", /** Diagnostic host branch observation only: native invalid-input relation bytes are indeterminate and are never inspected, asserted or certified by this test. @returns Nothing. */ () => {
  const handler = new TablePositionHandler();
  attribute(handler, N.LN_CT_TblPPr_horzAnchor, "invalid");
  attribute(handler, N.LN_CT_TblPPr_vertAnchor, "invalid");
  const sequence = handler.getTablePosition(),
    map = new SequenceAsHashMap(sequence, "PropertyValue");
  // Only independent initialized properties are observed. No native invalid relation value/ABI claim.
  expect(scalar(map, "FillTransparence")).toBe(100);
  expect(scalar(map, "HoriOrientPosition")).toBe(0);
  map.dispose();
  sequence.dispose();
  handler.dispose();
});
