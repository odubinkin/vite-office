/** @fileoverview Complete native inline Calc coordinate/geometry conversions and actual published UNO scalar value/type transport. */
import { assert, expect, it } from "vitest";
import { ScUnoConversion as C } from "../../../inc/convuno";
import { ScAddress, ScRange } from "../../../inc/address";
import {
  CellAddress,
  cppu_detail_getUnoType_CellAddress as addressType,
} from "../../../../offapi/com/sun/star/table/CellAddress";
import {
  CellRangeAddress,
  cppu_detail_getUnoType_CellRangeAddress as rangeType,
} from "../../../../offapi/com/sun/star/table/CellRangeAddress";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence, type SequenceElements } from "../../../../cppu/inc/com/sun/star/uno/Sequence";

it("owns the original CellAddress scalar fields, copies, assignment, widths and equality", /** All generated constructor forms and field lvalues use original IDL order. @returns Nothing. */ () => {
  const value = new CellAddress(),
    all = new CellAddress(0x8001, 0x80000001, 0xffffffff),
    copied = new CellAddress(all);
  expect([value.Sheet, value.Column, value.Row]).toEqual([0, 0, 0]);
  expect([all.Sheet, all.Column, all.Row]).toEqual([-32767, -2147483647, -1]);
  expect(copied.equals(all)).toBe(true);
  expect(copied.notEquals(all)).toBe(false);
  const sheet = value.get(0),
    column = value.get(4),
    row = value.get(8);
  expect(value.assign(all)).toBe(value);
  expect([value.get(0), value.get(4), value.get(8)]).toEqual([sheet, column, row]);
  expect(value.get(0)).toBe(sheet);
  expect(value.get(4)).toBe(column);
  expect(value.get(8)).toBe(row);
  for (const field of ["Sheet", "Column", "Row"] as const) {
    const other = new CellAddress(all);
    other[field] += 1;
    expect(other.equals(all)).toBe(false);
    expect(other.notEquals(all)).toBe(true);
  }
});
it("owns all original CellRangeAddress fields and normal generated copy/equality contracts", /** Tests every unequal member with original signed widths. @returns Nothing. */ () => {
  const value = new CellRangeAddress(),
    all = new CellRangeAddress(65535, 1, 2, 0x80000000, 0xffffffff),
    copy = new CellRangeAddress(all);
  expect([value.Sheet, value.StartColumn, value.StartRow, value.EndColumn, value.EndRow]).toEqual([
    0, 0, 0, 0, 0,
  ]);
  expect([all.Sheet, all.StartColumn, all.StartRow, all.EndColumn, all.EndRow]).toEqual([
    -1, 1, 2, -2147483648, -1,
  ]);
  expect(value.assign(all)).toBe(value);
  expect(value.equals(all)).toBe(true);
  expect(copy.notEquals(all)).toBe(false);
  for (const field of ["Sheet", "StartColumn", "StartRow", "EndColumn", "EndRow"] as const) {
    const other = new CellRangeAddress(all);
    other[field] += 1;
    expect(other.equals(all)).toBe(false);
    expect(other.notEquals(all)).toBe(true);
  }
});
it("round-trips both published compound types through actual Any and Sequence storage", /** No host-array or fabricated struct provider replaces generated UNO values. @returns Nothing. */ () => {
  expect(addressType()).toBe(addressType());
  expect(rangeType()).toBe(rangeType());
  const address = new CellAddress(5, 7, -3),
    range = new CellRangeAddress(2, 9, 8, 6, 5),
    addressAny = new Any(address, addressType),
    rangeAny = new Any(range, rangeType),
    addressOut = new CellAddress(),
    rangeOut = new CellRangeAddress();
  const Addresses = Sequence.specialize<SequenceElements>(addressType, 12),
    sequence = new Addresses(1);
  try {
    address.Row = 100;
    range.EndRow = 100;
    expect(addressAny.extract(addressOut, addressType)).toBe(true);
    expect(rangeAny.extract(rangeOut, rangeType)).toBe(true);
    expect([addressOut.Sheet, addressOut.Column, addressOut.Row]).toEqual([5, 7, -3]);
    expect([
      rangeOut.Sheet,
      rangeOut.StartColumn,
      rangeOut.StartRow,
      rangeOut.EndColumn,
      rangeOut.EndRow,
    ]).toEqual([2, 9, 8, 6, 5]);
    C.FillApiAddress(sequence.operatorIndex(0), new ScAddress(4, 6, -1));
    const native = new ScAddress();
    C.FillScAddress(native, sequence.operatorIndex(0));
    expect(native.GetVars()).toEqual([4, 6, -1]);
    assert(addressType().getTypeLibType()?.pType !== null);
    expect(addressType().getTypeLibType()?.pType?.nSize).toBe(12);
    expect(rangeType().getTypeLibType()?.pType?.nSize).toBe(20);
  } finally {
    sequence.dispose();
    addressAny.dispose();
    rangeAny.dispose();
  }
});
it("keeps unchecked signed narrowing and source endpoint order in both directions", /** Core coordinates and published API coordinates have deliberately different widths. @returns Nothing. */ () => {
  const api = new CellAddress(65535, 65537, 0x80000001),
    native = new ScAddress(),
    output = new CellAddress();
  C.FillScAddress(native, api);
  expect(native.GetVars()).toEqual([1, -2147483647, -1]);
  C.FillApiAddress(output, native);
  expect([output.Sheet, output.Column, output.Row]).toEqual([-1, 1, -2147483647]);
  const apiRange = new CellRangeAddress(-2, 65539, 9, 65537, 7),
    nativeRange = new ScRange(),
    outRange = new CellRangeAddress();
  C.FillScRange(nativeRange, apiRange);
  expect(nativeRange.GetVars()).toEqual([3, 9, -2, 1, 7, -2]);
  nativeRange.aEnd.SetTab(4);
  C.FillApiRange(outRange, nativeRange);
  expect([
    outRange.Sheet,
    outRange.StartColumn,
    outRange.StartRow,
    outRange.EndColumn,
    outRange.EndRow,
  ]).toEqual([-2, 3, 9, 1, 7]);
});
it.each([
  [0, 1, 1, 2, 2, true, true],
  [0, 2, 2, 3, 3, true, false],
  [0, 3, 1, 4, 2, false, false],
  [0, 1, 3, 2, 4, false, false],
  [1, 1, 1, 2, 2, false, false],
  [0, 0, 1, 2, 2, true, false],
  [0, 1, 0, 2, 2, true, false],
  [0, 1, 1, 2, 3, true, false],
] as const)(
  "compares inclusive stored range geometry %s/%s/%s/%s/%s",
  /** No normalization or document-bound lookup is inserted. @param sheet - Other sheet. @param left - Left edge. @param top - Top edge. @param right - Right edge. @param bottom - Bottom edge. @param intersection - Expected overlap. @param containment - Expected containment. @returns Nothing. */ (
    sheet,
    left,
    top,
    right,
    bottom,
    intersection,
    containment,
  ) => {
    const outer = new CellRangeAddress(0, 1, 1, 2, 2),
      inner = new CellRangeAddress(sheet, left, top, right, bottom);
    expect(C.Intersects(outer, inner)).toBe(intersection);
    expect(C.Contains(outer, inner)).toBe(containment);
  },
);
