/** @fileoverview Literal native metric tables and independent rational arithmetic for all original scalar helper branches. */
import { expect, it } from "vitest";
import { MapUnit as M, MapToO3tlLength as map } from "../../../tools/inc/mapunit";
import { FieldUnit as F, FieldToO3tlLength as field } from "../../../tools/inc/fldunit";
import { Length as L } from "../../../o3tl/inc/unit_conversion";
import {
  CalcToUnit,
  CalcToPoint,
  ItemToControl,
  ControlToItem,
  MapToFieldUnit,
} from "../../inc/unitconv";
/** Literal original map-unit to length and coarse-field order, including all nonlength entries. */
const maps = [0, 1, 2, 3, 10, 11, 12, 13, 8, 7, 17, -1, -1, -1, -1] as const;
/** Literal original field-unit to length order. */
const fields = [
  -1, 2, 3, 4, 5, 7, 8, 9, 13, 14, 15, -1, -1, 0, 18, 19, 17, -1, -1, -1, -1, -1,
] as const;
/** Independent micrometre ratios in map-unit order; 7200input removes every map denominator. */
const mapMicrometres = [
  [10, 1],
  [100, 1],
  [1000, 1],
  [10000, 1],
  [127, 5],
  [254, 1],
  [2540, 1],
  [25400, 1],
  [3175, 9],
  [635, 36],
  [3175, 12],
] as const;
/** Independent micrometre ratios indexed by field unit. */
const fieldMicrometres = [
  [F.MM, 1000, 1],
  [F.CM, 10000, 1],
  [F.M, 1000000, 1],
  [F.KM, 1000000000, 1],
  [F.TWIP, 635, 36],
  [F.POINT, 3175, 9],
  [F.PICA, 12700, 3],
  [F.INCH, 25400, 1],
  [F.FOOT, 304800, 1],
  [F.MILE, 1609344000, 1],
  [F.MM_100TH, 10, 1],
  [F.CHAR, 133350, 36],
  [F.LINE, 16510, 3],
  [F.PIXEL, 3175, 12],
] as const;
it("retains original enum numeric values and all mappings with pixel defaults and overrides", /** Includes original alias and unsupported initialized enum values. @returns Nothing. */ () => {
  expect([
    M.Map100thMM,
    M.Map10thMM,
    M.MapMM,
    M.MapCM,
    M.Map1000thInch,
    M.Map100thInch,
    M.Map10thInch,
    M.MapInch,
    M.MapPoint,
    M.MapTwip,
    M.MapPixel,
    M.MapSysFont,
    M.MapAppFont,
    M.MapRelative,
    M.LAST,
    M.LASTENUMDUMMY,
  ]).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 13, 14]);
  expect([
    F.NONE,
    F.MM,
    F.CM,
    F.M,
    F.KM,
    F.TWIP,
    F.POINT,
    F.PICA,
    F.INCH,
    F.FOOT,
    F.MILE,
    F.CUSTOM,
    F.PERCENT,
    F.MM_100TH,
    F.CHAR,
    F.LINE,
    F.PIXEL,
    F.DEGREE,
    F.SECOND,
    F.MILLISECOND,
    F.FONT_EM,
    F.FONT_CJK_ADVANCE,
  ]).toEqual(
    Array.from(
      { length: 22 },
      /** Independent enum index. @param _unused - Unused array slot. @param i - Native numeric index. @returns Literal value or conversion. */ (
        _unused,
        i,
      ) => i,
    ),
  );
  for (const [i, expected] of maps.entries()) expect(map(i as M)).toBe(expected);
  for (const [i, expected] of fields.entries()) expect(field(i as F)).toBe(expected);
  expect(map(255 as M)).toBe(L.invalid);
  expect(field(65535 as F)).toBe(L.invalid);
  expect(map(M.MapPixel, L.twip)).toBe(L.twip);
  expect(field(F.PIXEL, L.mm100)).toBe(L.mm100);
  expect(map(M.MapMM, L.invalid)).toBe(L.mm);
  expect(field(F.MM, L.invalid)).toBe(L.mm);
});
it("uses literal independent integer ratios across all valid map/field pairs and signed halfway rounding", /** Rational expectations do not call production conversion tables. @returns Nothing. */ () => {
  for (const [mi, [mn, md]] of mapMicrometres.entries())
    for (const [fi, fn, fd] of fieldMicrometres)
      for (const sign of [-1n, 1n]) {
        const numerator = 7200n * BigInt(mn) * BigInt(fd),
          denominator = BigInt(md) * BigInt(fn);
        const expected = sign * ((numerator + denominator / 2n) / denominator);
        expect(ItemToControl(sign * 7200n, mi as M, fi)).toBe(expected);
        expect(ControlToItem(sign * 7200n, fi, mi as M)).toBe(expected);
      }
  expect(ItemToControl(10n, M.MapTwip, F.POINT)).toBe(1n);
  expect(ItemToControl(-10n, M.MapTwip, F.POINT)).toBe(-1n);
  expect(ItemToControl(0n, M.MapTwip, F.POINT)).toBe(0n);
  for (const input of [M.MapSysFont, M.MapAppFont, M.MapRelative, M.LASTENUMDUMMY])
    expect(ItemToControl(200n, input, F.POINT)).toBe(0n);
  for (const input of [
    F.NONE,
    F.CUSTOM,
    F.PERCENT,
    F.DEGREE,
    F.SECOND,
    F.MILLISECOND,
    F.FONT_EM,
    F.FONT_CJK_ADVANCE,
  ])
    expect(ItemToControl(200n, M.MapTwip, input)).toBe(0n);
  expect(ControlToItem(200n, F.POINT, M.MapTwip)).toBe(10n);
  expect(ControlToItem(10n, F.POINT, M.MapTwip)).toBe(1n);
});
it("preserves float32 arguments and native round away from zero rather than JS negative half rounding", /** Every valid map family and unsupported native default is covered. @returns Nothing. */ () => {
  expect(
    Array.from(
      { length: 11 },
      /** Independent enum index. @param _unused - Unused array slot. @param i - Native numeric index. @returns Literal value or conversion. */ (
        _unused,
        i,
      ) => CalcToUnit(72, i as M),
    ),
  ).toEqual([2540n, 254n, 25n, 3n, 1000n, 100n, 10n, 1n, 72n, 1440n, 96n]);
  expect(CalcToUnit(0.5, M.MapPoint)).toBe(1n);
  expect(CalcToUnit(-0.5, M.MapPoint)).toBe(-1n);
  expect(CalcToUnit(0.49999999, M.MapPoint)).toBe(1n);
  expect(CalcToUnit(-0.49999999, M.MapPoint)).toBe(-1n);
  expect(CalcToUnit(0.4999999, M.MapPoint)).toBe(0n);
  expect(CalcToUnit(0, M.MapPoint)).toBe(0n);
  expect(CalcToUnit(72, M.MapRelative)).toBe(0n);
});
it("preserves original map-to-field grouping, factor and unsupported-unit defaults", /** Covers5helper exports through original header owner. @returns Nothing. */ () => {
  expect(
    Array.from(
      { length: 15 },
      /** Independent enum index. @param _unused - Unused array slot. @param i - Native numeric index. @returns Literal value or conversion. */ (
        _unused,
        i,
      ) => MapToFieldUnit(i as M),
    ),
  ).toEqual([
    F.MM,
    F.MM,
    F.MM,
    F.CM,
    F.INCH,
    F.INCH,
    F.INCH,
    F.INCH,
    F.POINT,
    F.TWIP,
    F.NONE,
    F.NONE,
    F.NONE,
    F.NONE,
    F.NONE,
  ]);
  expect(
    Array.from(
      { length: 11 },
      /** Independent enum index. @param _unused - Unused array slot. @param i - Native numeric index. @returns Literal value or conversion. */ (
        _unused,
        i,
      ) => CalcToPoint(7200n, i as M, 1),
    ),
  ).toEqual([204n, 2041n, 20409n, 204094n, 518n, 5184n, 51840n, 518400n, 7200n, 360n, 5400n]);
  expect(CalcToPoint(-10n, M.MapTwip, 1)).toBe(-1n);
  expect(CalcToPoint(200n, M.MapTwip, 2)).toBe(20n);
  expect(CalcToPoint(200n, M.MapTwip, 65537)).toBe(10n);
  expect(CalcToPoint(200n, M.MapTwip, 0)).toBe(0n);
  expect(CalcToPoint(200n, M.MapRelative, 1)).toBe(0n);
});
