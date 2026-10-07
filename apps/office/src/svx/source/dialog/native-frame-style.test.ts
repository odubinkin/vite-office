/** @fileoverview Verifies source frame Style ordering and owned integer native components. */
import { expect, it } from "vitest";
import {
  SvxBorderLine,
  SvxBorderLineStyle as Line,
} from "../../../editeng/source/items/borderline";
import { GetWordTableCellBorderWeight, Style } from "./framelink";
/** Creates a fixed-component native line fixture. @param p - Primary width. @param d - Gap. @param s - Secondary width. @param color - Original color. @returns Native line. */
function components(p: number, d: number, s: number, color = 0x123456): SvxBorderLine {
  const line = SvxBorderLine.FromRecord({
    color,
    width: p + d + s,
    style: Line.DOUBLE,
    scale: 1,
    mirror: false,
    useLeftTop: false,
    implementation: [0, p, s, d],
  });
  if (p !== 0 && s !== 0 && d === 0) line.ScaleMetrics(0.1);
  return line;
}
it("native frame defaults and clones retain component ownership and source normalization", /** Checks normalization without CSS or source file access. @returns Nothing. */ () => {
  const empty = new Style();
  expect([
    empty.Prim(),
    empty.Dist(),
    empty.Secn(),
    empty.GetWidth(),
    empty.GetColorPrim(),
    empty.Type(),
  ]).toEqual([0, 0, 0, 0, 0, Line.SOLID]);
  const cases = [
    [20, 10, 0, [20, 0, 0]],
    [0, 10, 30, [30, 10, 0]],
    [20, 0, 30, [2, 3, 0]],
    [20, 10, 30, [20, 10, 30]],
    [33333, 33333, 33333, [32767, 0, 32767]],
    [65000, 1, 40000, [45267, 0, 20268]],
  ] as const;
  for (const [p, d, s, expected] of cases) {
    const line = components(p, d, s),
      before = line.toJSON(),
      style = new Style(line);
    expect([style.Prim(), style.Dist(), style.Secn()]).toEqual(expected);
    const copy = style.Clone();
    copy.MirrorSelf();
    expect(copy.GetWidth()).toBe(style.GetWidth());
    expect(copy.Prim()).toBe(style.Secn() ? style.Secn() : style.Prim());
    expect(style.GetColorPrim()).toBe(0x123456);
    expect(line.toJSON()).toEqual(before);
    line.SetColor(0xffffff);
    expect(copy.GetColorPrim()).toBe(0x123456);
  }
});
it("native integer frame priority differs from browser dashed and color tie rules", /** Checks all source priority clauses and two-way comparisons. @returns Nothing. */ () => {
  const thin = new Style(new SvxBorderLine(1, 10)),
    thick = new Style(new SvxBorderLine(2, 20));
  expect(thin.lessThan(thick)).toBe(true);
  expect(thick.lessThan(thin)).toBe(false);
  const single = new Style(new SvxBorderLine(1, 60)),
    double = new Style(components(20, 20, 20));
  expect(single.lessThan(double)).toBe(true);
  expect(double.lessThan(single)).toBe(false);
  const wideGap = new Style(components(15, 30, 15)),
    narrowGap = new Style(components(25, 10, 25));
  expect(wideGap.lessThan(narrowGap)).toBe(true);
  expect(narrowGap.lessThan(wideGap)).toBe(false);
  for (const width of [1, 20]) {
    const solid = new Style(new SvxBorderLine(1, width)),
      dashed = new Style(new SvxBorderLine(2, width, Line.DASHED));
    expect(dashed.lessThan(solid)).toBe(width === 1);
    expect(solid.lessThan(dashed)).toBe(false);
  }
  const colorTie = new Style(new SvxBorderLine(0xffffff, 10));
  expect(thin.lessThan(colorTie)).toBe(false);
  expect(colorTie.lessThan(thin)).toBe(false);
  expect(double.lessThan(double.Clone())).toBe(false);
});
it("native Word frame weight preserves every represented style number and the outset25 source value", /** Checks the source weight contract independently of unrepresented Word frame layout. @returns Nothing. */ () => {
  const numbers = [1, 0, 0, 3, 11, 14, 17, 12, 15, 18, 24, 25, 25, 27, 22, 3, 8, 9];
  for (const [type, number] of numbers.entries()) {
    const style = new Style(new SvxBorderLine(0, 90, type));
    expect(GetWordTableCellBorderWeight(style)).toBe(
      type === 1 || type === 2 ? 1 : number * style.GetWidth(),
    );
  }
  expect(GetWordTableCellBorderWeight(new Style(new SvxBorderLine(0, 100, Line.NONE)))).toBe(0);
  expect(GetWordTableCellBorderWeight(new Style(new SvxBorderLine(0, 100, 18 as Line)))).toBe(0);
  const solid = new Style(new SvxBorderLine(0, 5)),
    dashed = new Style(new SvxBorderLine(0, 100, Line.DASHED));
  solid.SetWordTableCell(true);
  dashed.SetWordTableCell(true);
  expect(dashed.lessThan(solid)).toBe(true);
  expect(solid.lessThan(dashed)).toBe(false);
  const equal = solid.Clone();
  expect(equal.lessThan(solid)).toBe(false);
  equal.SetWordTableCell(false);
  expect(equal.lessThan(solid)).toBe(false);
});
