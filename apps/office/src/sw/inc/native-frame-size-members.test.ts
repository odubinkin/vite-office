/** @fileoverview Source-derived Writer derived size contracts;shared geometry and Any owners are real. */
import { expect, it } from "vitest";
import { SwFormatFrameSize, SwFrameSize } from "./fmtfsize";
import { Size } from "../../tools/inc/gen";
import { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import {
  Size as UnoSize,
  cppu_detail_getUnoType_Size as sizeType,
} from "../../offapi/com/sun/star/awt/Size";
import * as M from "./unomid";
/** Actual typed input Any. @param value - Payload. @param type - Type. @returns Native value. */ function scalar(
  value: number | boolean,
  type: "sal_Int16" | "sal_Int32" | "bool",
): Any {
  const a = new Any();
  if (type === "bool") a.insert([value as boolean], type);
  else a.insert([value as number], type);
  return a;
}
/** Reads an original scalar query. @param item - Actual item. @param member - Native member. @param type - Actual type. @returns Scalar. */ function query(
  item: SwFormatFrameSize,
  member: number,
  type: "sal_Int16" | "sal_Int32" | "bool",
): number | boolean {
  const out = new Any();
  expect(item.QueryValue(out, member)).toBe(true);
  if (type === "bool") {
    const v: [boolean] = [false];
    expect(out.extract(v, type)).toBe(true);
    return v[0];
  }
  const v: [number] = [0];
  expect(out.extract(v, type)).toBe(true);
  return v[0];
}
it("keeps native Writer copying,scalar field widths and nonmetric overrides", /** Derivation must not accidentally inherit base scaling. @returns Nothing. */ () => {
  const item = new SwFormatFrameSize(SwFrameSize.Minimum, 72, 144);
  item.SetWhich(91);
  item.SetWidthPercent(257);
  item.SetHeightPercent(258);
  item.SetWidthPercentRelation(65535);
  item.SetHeightPercentRelation(65534);
  const copy = item.Clone();
  expect(copy.Which()).toBe(91);
  expect(copy.equals(item)).toBe(true);
  expect([
    copy.GetWidthPercent(),
    copy.GetHeightPercent(),
    copy.GetWidthPercentRelation(),
    copy.GetHeightPercentRelation(),
  ]).toEqual([1, 2, -1, -2]);
  expect(copy.HasMetrics()).toBe(false);
  copy.ScaleMetrics(2);
  expect(copy.equals(item)).toBe(true);
  const borrow = copy.GetSize();
  copy.SetSize(new Size(80, 160));
  expect([borrow.Width(), borrow.Height()]).toEqual([80, 160]);
});
it("always converts query dimensions,clamps only queried HEIGHT and ignores unknown queries", /** Native SIZE and HEIGHT differ. @returns Nothing. */ () => {
  const item = new SwFormatFrameSize(SwFrameSize.Variable, 1, 0),
    out = new Any(),
    size = new UnoSize();
  expect(item.QueryValue(out)).toBe(true);
  expect(out.extract(size, sizeType)).toBe(true);
  expect([size.Width, size.Height]).toEqual([2, 0]);
  expect(query(item, M.MID_FRMSIZE_WIDTH, "sal_Int32")).toBe(2);
  expect(query(item, M.MID_FRMSIZE_WIDTH | 128, "sal_Int32")).toBe(2);
  expect(query(item, M.MID_FRMSIZE_HEIGHT, "sal_Int32")).toBe(41);
  item.SetHeight(72);
  expect(query(item, M.MID_FRMSIZE_HEIGHT, "sal_Int32")).toBe(127);
  expect(item.QueryValue(out, 99)).toBe(true);
  expect(out.extract(size, sizeType)).toBe(true);
  expect(size.Height).toBe(0);
  item.SetHeightPercent(255);
  item.SetWidthPercent(255);
  expect(query(item, M.MID_FRMSIZE_REL_HEIGHT, "sal_Int16")).toBe(0);
  expect(query(item, M.MID_FRMSIZE_REL_WIDTH, "sal_Int16")).toBe(0);
  expect(query(item, M.MID_FRMSIZE_IS_SYNC_HEIGHT_TO_WIDTH, "bool")).toBe(true);
  expect(query(item, M.MID_FRMSIZE_IS_SYNC_WIDTH_TO_HEIGHT, "bool")).toBe(true);
  item.SetHeightPercent(45);
  item.SetWidthPercent(67);
  item.SetHeightPercentRelation(-1);
  item.SetWidthPercentRelation(2);
  expect(query(item, M.MID_FRMSIZE_REL_HEIGHT, "sal_Int16")).toBe(45);
  expect(query(item, M.MID_FRMSIZE_REL_WIDTH, "sal_Int16")).toBe(67);
  expect(query(item, M.MID_FRMSIZE_REL_HEIGHT_RELATION, "sal_Int16")).toBe(-1);
  expect(query(item, M.MID_FRMSIZE_REL_WIDTH_RELATION, "sal_Int16")).toBe(2);
  expect(query(item, M.MID_FRMSIZE_SIZE_TYPE, "sal_Int16")).toBe(0);
  expect(query(item, M.MID_FRMSIZE_WIDTH_TYPE, "sal_Int16")).toBe(1);
  expect(query(item, M.MID_FRMSIZE_IS_AUTO_HEIGHT, "bool")).toBe(true);
  item.SetHeightSizeType(SwFrameSize.Fixed);
  expect(query(item, M.MID_FRMSIZE_IS_AUTO_HEIGHT, "bool")).toBe(false);
});
it("puts original Writer geometry,percentage,relations,sync and type members with source failure destinations", /** Failed short extraction can intentionally reset a field to zero. @returns Nothing. */ () => {
  const item = new SwFormatFrameSize(),
    value = new Any();
  value.insert(new UnoSize(127, -254), sizeType);
  expect(item.PutValue(value, 0)).toBe(true);
  expect([item.GetWidth(), item.GetHeight()]).toEqual([127, -254]);
  expect(item.PutValue(value, 128)).toBe(true);
  expect([item.GetWidth(), item.GetHeight()]).toEqual([72, -144]);
  expect(item.PutValue(new Any(), 0)).toBe(false);
  for (const member of [M.MID_FRMSIZE_WIDTH, M.MID_FRMSIZE_HEIGHT]) {
    expect(item.PutValue(scalar(127, "sal_Int32"), member | 128)).toBe(true);
    expect(item.PutValue(scalar(0, "sal_Int32"), member)).toBe(true);
    expect(item.PutValue(new Any(), member)).toBe(false);
  }
  expect([item.GetWidth(), item.GetHeight()]).toEqual([23, 23]);
  for (const member of [M.MID_FRMSIZE_REL_WIDTH, M.MID_FRMSIZE_REL_HEIGHT]) {
    expect(item.PutValue(scalar(254, "sal_Int16"), member)).toBe(true);
    for (const n of [-1, 255]) expect(item.PutValue(scalar(n, "sal_Int16"), member)).toBe(false);
    expect(item.PutValue(new Any(), member)).toBe(true);
  }
  expect([item.GetWidthPercent(), item.GetHeightPercent()]).toEqual([0, 0]);
  for (const member of [M.MID_FRMSIZE_REL_WIDTH_RELATION, M.MID_FRMSIZE_REL_HEIGHT_RELATION]) {
    expect(item.PutValue(scalar(3, "sal_Int16"), member)).toBe(true);
    expect(item.PutValue(new Any(), member)).toBe(true);
  }
  expect([item.GetWidthPercentRelation(), item.GetHeightPercentRelation()]).toEqual([0, 0]);
  for (const member of [
    M.MID_FRMSIZE_IS_SYNC_HEIGHT_TO_WIDTH,
    M.MID_FRMSIZE_IS_SYNC_WIDTH_TO_HEIGHT,
  ]) {
    expect(item.PutValue(scalar(false, "bool"), member)).toBe(true);
    expect(item.PutValue(scalar(true, "bool"), member)).toBe(true);
    expect(item.PutValue(scalar(false, "bool"), member)).toBe(true);
    expect(
      /** Invalid native bool input. @returns Native failure. */ () =>
        item.PutValue(new Any(), member),
    ).toThrow("precondition");
  }
  for (const member of [M.MID_FRMSIZE_SIZE_TYPE, M.MID_FRMSIZE_WIDTH_TYPE]) {
    expect(item.PutValue(scalar(2, "sal_Int16"), member)).toBe(true);
    for (const n of [-1, 3]) expect(item.PutValue(scalar(n, "sal_Int16"), member)).toBe(false);
    expect(item.PutValue(new Any(), member)).toBe(false);
  }
  expect(item.PutValue(scalar(true, "bool"), M.MID_FRMSIZE_IS_AUTO_HEIGHT)).toBe(true);
  expect(item.GetHeightSizeType()).toBe(SwFrameSize.Variable);
  expect(item.PutValue(scalar(false, "bool"), M.MID_FRMSIZE_IS_AUTO_HEIGHT)).toBe(true);
  expect(item.GetHeightSizeType()).toBe(SwFrameSize.Fixed);
  expect(
    /** Invalid native bool input. @returns Native failure. */ () =>
      item.PutValue(new Any(), M.MID_FRMSIZE_IS_AUTO_HEIGHT),
  ).toThrow("precondition");
  expect(item.PutValue(value, 99)).toBe(false);
});
