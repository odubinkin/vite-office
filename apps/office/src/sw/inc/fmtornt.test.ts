/** @fileoverview Verifies literal native orientation defaults, full value ownership and UNO member conversion. */
import { expect, it } from "vitest";
import { SwFormatVertOrient } from "./fmtornt";
import { SwFormatFrameSize } from "./fmtfsize";
import { VertOrientation as V } from "../../offapi/com/sun/star/text/VertOrientation";
import { RelOrientation as R } from "../../offapi/com/sun/star/text/RelOrientation";
it("owns complete native defaults and isolated values", /** Checks native literals and all equality fields. @returns Nothing. */ () => {
  expect([
    V.NONE,
    V.TOP,
    V.CENTER,
    V.BOTTOM,
    V.CHAR_TOP,
    V.CHAR_CENTER,
    V.CHAR_BOTTOM,
    V.LINE_TOP,
    V.LINE_CENTER,
    V.LINE_BOTTOM,
  ]).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  expect([
    R.FRAME,
    R.PRINT_AREA,
    R.CHAR,
    R.PAGE_LEFT,
    R.PAGE_RIGHT,
    R.FRAME_LEFT,
    R.FRAME_RIGHT,
    R.PAGE_FRAME,
    R.PAGE_PRINT_AREA,
    R.TEXT_LINE,
    R.PAGE_PRINT_AREA_BOTTOM,
    R.PAGE_PRINT_AREA_TOP,
  ]).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  const item = new SwFormatVertOrient();
  expect(item.Which()).toBe(109);
  expect([item.GetPos(), item.GetVertOrient(), item.GetRelationOrient()]).toEqual([0, 0, 1]);
  const copy = item.Clone();
  expect(copy).not.toBe(item);
  expect(copy.equals(item)).toBe(true);
  expect(copy.equals(new SwFormatFrameSize())).toBe(false);
  copy.SetPos(720);
  expect(copy.equals(item)).toBe(false);
  copy.SetPos(0);
  copy.SetVertOrient(V.CENTER);
  expect(copy.equals(item)).toBe(false);
  copy.SetVertOrient(V.NONE);
  copy.SetRelationOrient(R.PAGE_FRAME);
  expect(copy.equals(item)).toBe(false);
  expect([item.GetPos(), item.GetVertOrient(), item.GetRelationOrient()]).toEqual([0, 0, 1]);
});
it("queries native members and updates with native extraction defaults and conversion flags", /** Checks independent literal conversion values and unsupported members. @returns Nothing. */ () => {
  const item = new SwFormatVertOrient(720, V.BOTTOM, R.PAGE_FRAME);
  expect(item.QueryValue()).toBe(3);
  expect(item.QueryValue(0x80)).toBe(3);
  expect(item.QueryValue(1)).toBe(7);
  expect(item.QueryValue(2)).toBe(1270);
  expect(item.QueryValue(0x82)).toBe(1270);
  expect(item.QueryValue(3)).toBeUndefined();
  expect(item.PutValue(50, 3)).toBe(false);
  expect(item.PutValue(2, 0)).toBe(true);
  expect(item.GetVertOrient()).toBe(2);
  expect(item.PutValue("bad", 0)).toBe(true);
  expect(item.GetVertOrient()).toBe(0);
  expect(item.PutValue(9, 1)).toBe(true);
  expect(item.GetRelationOrient()).toBe(9);
  expect(item.PutValue(null, 1)).toBe(true);
  expect(item.GetRelationOrient()).toBe(0);
  expect(item.PutValue(2540, 0x82)).toBe(true);
  expect(item.GetPos()).toBe(1440);
  expect(item.PutValue(-720, 2)).toBe(true);
  expect(item.GetPos()).toBe(-720);
  expect(item.PutValue(undefined, 2)).toBe(true);
  expect(item.GetPos()).toBe(0);
});

it("native integer extraction and symmetric negative position conversion retain signed field contracts", /** Checks native short/long extraction, conversion ties and invalid member results. @returns Nothing. */ () => {
  const item = new SwFormatVertOrient(-36, 2, 7);
  expect(item.QueryValue(2)).toBe(-64);
  item.SetPos(36);
  expect(item.QueryValue(0x82)).toBe(64);
  expect(item.QueryValue()).toBe(2);
  expect(item.QueryValue(1)).toBe(7);
  expect(item.QueryValue(8)).toBeUndefined();
  expect(item.PutValue(65535, 0)).toBe(true);
  expect(item.GetVertOrient()).toBe(-1);
  expect(item.PutValue(-1, 0)).toBe(true);
  expect(item.GetVertOrient()).toBe(0);
  expect(item.PutValue(65536, 0)).toBe(true);
  expect(item.GetVertOrient()).toBe(0);
  expect(item.PutValue(3, 0)).toBe(true);
  expect(item.GetVertOrient()).toBe(3);
  expect(item.PutValue(3.5, 0)).toBe(true);
  expect(item.GetVertOrient()).toBe(0);
  expect(item.PutValue("bad", 1)).toBe(true);
  expect(item.GetRelationOrient()).toBe(0);
  expect(item.PutValue(-32768, 1)).toBe(true);
  expect(item.GetRelationOrient()).toBe(-32768);
  expect(item.PutValue(-32769, 1)).toBe(true);
  expect(item.GetRelationOrient()).toBe(0);
  expect(item.PutValue(32768, 1)).toBe(true);
  expect(item.GetRelationOrient()).toBe(0);
  expect(item.PutValue(-1270, 0x82)).toBe(true);
  expect(item.GetPos()).toBe(-720);
  expect(item.PutValue(1270, 0x82)).toBe(true);
  expect(item.GetPos()).toBe(720);
  expect(item.PutValue(2147483648, 2)).toBe(true);
  expect(item.GetPos()).toBe(0);
  expect(item.PutValue(-2147483649, 2)).toBe(true);
  expect(item.GetPos()).toBe(0);
  expect(item.PutValue(-2147483648, 2)).toBe(true);
  expect(item.GetPos()).toBe(-2147483648);
  expect(item.PutValue(1, 3)).toBe(false);
});
