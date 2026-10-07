/** @fileoverview Verifies represented native line/box/info contracts with independent numeric expectations. */
import { expect, it } from "vitest";
import { SvxBorderLine, SvxBorderLineStyle, roundBorderMetric } from "./borderline";
import {
  SvxBoxItem,
  SvxBoxItemLine,
  SvxBoxInfoItem,
  SvxBoxInfoItemLine,
  SvxBoxInfoItemValidFlags,
} from "./frmitems";
import { SvxSizeItem } from "./frmitems";

it("preserves native distance minima and drawing-width members with absent lines", /** Checks source-defined member fallbacks and ignored invalid inner directions. @returns Nothing. */ () => {
  const box = new SvxBoxItem(113),
    info = new SvxBoxInfoItem(10023),
    line = new SvxBorderLine(0x112233, 20);
  box.SetAllDistances(9);
  box.SetDistance(8, 2);
  expect(box.GetSmallestDistance()).toBe(8);
  expect(box.QueryValue(99)).toEqual(SvxBoxItem.SvxLineToLine(undefined));
  expect(box.PutValue(1, 14)).toBe(true);
  expect(box.HasBorder()).toBe(false);
  box.SetLine(line, 0);
  expect(box.PutValue(30, 15)).toBe(true);
  expect(box.GetTop()?.GetWidth()).toBe(30);
  info.SetLine(line, 2 as SvxBoxInfoItemLine);
  expect(info.GetHori()).toBeUndefined();
  expect(info.GetVert()).toBeUndefined();
});

it("retains native partial updates and rejects malformed box and info UNO sequences", /** Checks sequence admission, native default fields and invalid edges. @returns Nothing. */ () => {
  const box = new SvxBoxItem(113),
    info = new SvxBoxInfoItem(10023),
    line = new SvxBorderLine(0x112233, 20);
  const uno = SvxBoxItem.SvxLineToLine(line);
  expect(box.PutValue({ ...uno, Color: "bad" }, 1)).toBe(false);
  expect(
    box.PutValue({ Color: 0x112233, InnerLineWidth: 0, OuterLineWidth: 20, LineDistance: 0 }, 1),
  ).toBe(true);
  expect(box.GetLeft()?.GetWidth()).toBe(20);
  expect(box.PutValue([uno, null, uno, uno, 0, 0, 0, 0, 0])).toBe(false);
  expect(box.GetLeft()?.GetWidth()).toBe(20);
  expect(box.PutValue([uno, uno, uno, uno, "bad", 0, 0, 0, 0])).toBe(false);
  expect(box.PutValue([uno, uno, uno, uno, 127, 127, 127, 127, 127], 0x80)).toBe(true);
  expect(box.GetDistance(0)).toBe(72);
  expect(box.PutValue(null, 6)).toBe(false);
  const before = box.Clone();
  box.SetLine(line, -1 as SvxBoxItemLine);
  box.SetLine(line, 0.5 as SvxBoxItemLine);
  box.SetDistance(999, 4 as SvxBoxItemLine);
  box.SetDistance(999, 0.5 as SvxBoxItemLine);
  expect(box.GetDistance(4 as SvxBoxItemLine)).toBe(0);
  expect(box.equals(before)).toBe(true);
  const missingLine = box.Clone();
  missingLine.SetLine(undefined, 0);
  expect(box.equals(missingLine)).toBe(false);
  expect(missingLine.equals(box)).toBe(false);
  expect(box.CalcLineSpace(4 as SvxBoxItemLine, true)).toBe(0);
  expect(box.equals(new SvxBoxItem(113))).toBe(false);
  expect(new SvxBoxItem(113).equals(box)).toBe(false);
  const empty = new SvxBoxItem(113);
  empty.SetDistance(7, 2);
  expect(empty.GetSmallestDistance()).toBe(7);
  expect(info.IsDist()).toBe(false);
  expect(info.IsMinDist()).toBe(false);
  info.SetDist(true);
  info.SetMinDist(true);
  expect(info.IsDist()).toBe(true);
  expect(info.IsMinDist()).toBe(true);
  expect(info.PutValue(null)).toBe(true);
  expect(info.PutValue([null, uno, 0, 127, 0])).toBe(false);
  expect(info.PutValue([uno, uno, "bad", 127, 0])).toBe(false);
  expect(info.PutValue([uno, uno, 0, "bad", 0])).toBe(false);
  expect(info.PutValue([uno, uno, 7, 127, 127], 0x80)).toBe(true);
  expect(info.GetDefDist()).toBe(72);
  expect(info.QueryValue(0x80)).toEqual([
    SvxBoxItem.SvxLineToLine(info.GetHori(), true),
    SvxBoxItem.SvxLineToLine(info.GetVert(), true),
    7,
    127,
    127,
  ]);
  expect(info.PutValue(uno, 2)).toBe(true);
  expect(info.PutValue(SvxBoxItem.SvxLineToLine(undefined), 1)).toBe(true);
  expect(info.GetHori()?.GetWidth()).toBe(11);
  const missingInner = info.Clone();
  missingInner.SetLine(undefined, 0);
  expect(info.equals(missingInner)).toBe(false);
  expect(missingInner.equals(info)).toBe(false);
  expect(info.PutValue(null, 0x2e)).toBe(true);
  expect(info.QueryValue(0x2e)).toBe(7);
  expect(new SvxBoxInfoItem(10023).equals(info)).toBe(false);
});

it.each([
  [0, 90, 0, 0],
  [1, 90, 0, 0],
  [2, 90, 0, 0],
  [3, 30, 30, 30],
  [4, 60, 15, 15],
  [5, 45, 23, 23],
  [6, 30, 15, 45],
  [7, 15, 60, 15],
  [8, 23, 45, 23],
  [9, 15, 30, 45],
  [10, 23, 23, 45],
  [11, 23, 23, 45],
  [12, 15, 30, 30],
  [13, 30, 15, 30],
  [14, 90, 0, 0],
  [15, 10, 10, 70],
  [16, 90, 0, 0],
  [17, 90, 0, 0],
  [32767, 0, 0, 0],
  [18, 0, 0, 0],
])(
  "computes native width components style=%s",
  /** Checks literal source rates and rounding. @param style - Native style. @param outer - Outer width. @param inner - Inner width. @param gap - Gap. @returns Nothing. */ (
    style,
    outer,
    inner,
    gap,
  ) => {
    const line = new SvxBorderLine(0x112233, 90, style);
    expect([line.GetOutWidth(), line.GetInWidth(), line.GetDistance()]).toEqual([
      outer,
      inner,
      gap,
    ]);
    expect(line.GetScaledWidth()).toBe(outer + inner + gap);
    expect(line.GetColor()).toBe(0x112233);
    expect(line.GetWidth()).toBe(90);
    expect(line.GetBorderLineStyle()).toBe(style);
  },
);
it("owns native line state, replaces metric scale and preserves custom doubles", /** Checks deep copying, native equality and primitive transport. @returns Nothing. */ () => {
  const empty = new SvxBorderLine();
  expect(empty.isEmpty()).toBe(true);
  const line = new SvxBorderLine(0x112233, 90, SvxBorderLineStyle.THINTHICK_SMALLGAP);
  expect(line.isDouble()).toBe(true);
  line.SetMirrorWidths();
  line.SetMirrorWidths();
  expect([line.GetOutWidth(), line.GetInWidth()]).toEqual([15, 60]);
  line.ScaleMetrics(2);
  line.ScaleMetrics(0.5);
  expect([line.GetOutWidth(), line.GetInWidth(), line.GetDistance()]).toEqual([8, 30, 8]);
  const copy = line.Clone();
  expect(copy).not.toBe(line);
  expect(copy.toJSON()).toEqual(line.toJSON());
  copy.ScaleMetrics(1);
  expect(copy.equals(line)).toBe(true);
  copy.SetColor(0xffffff);
  expect(copy.equals(line)).toBe(false);
  copy.SetColor(line.GetColor());
  copy.SetWidth(91);
  expect(copy.equals(line)).toBe(false);
  copy.SetWidth(90);
  copy.SetBorderLineStyle(0);
  expect(copy.equals(line)).toBe(false);
  expect(line.equals(new SvxBorderLine(0x112233, 90, 4))).toBe(false);
  const custom = new SvxBorderLine();
  custom.GuessLinesWidths(3, 7, 13, 19);
  expect(custom.GetWidth()).toBe(39);
  expect([custom.GetOutWidth(), custom.GetInWidth(), custom.GetDistance()]).toEqual([7, 13, 19]);
  custom.ScaleMetrics(2);
  custom.SetMirrorWidths();
  expect(SvxBorderLine.FromRecord(structuredClone(custom.toJSON())).toJSON()).toEqual(
    custom.toJSON(),
  );
  for (const [style, outer, inner, gap, expectedStyle, width] of [
    [32767, 20, 0, 0, 0, 20],
    [32767, 20, 20, 20, 3, 60],
    [3, 30, 15, 15, 4, 60],
    [0, 0, 20, 0, 0, 20],
    [3, 0, 0, 0, 3, 0],
    [13, 0, 20, 0, 13, 0],
  ]) {
    const guessed = new SvxBorderLine();
    guessed.GuessLinesWidths(style as number, outer as number, inner as number, gap as number);
    expect([guessed.GetBorderLineStyle(), guessed.GetWidth()]).toEqual([expectedStyle, width]);
  }
  expect(roundBorderMetric(-1, 0.5)).toBe(-1);
  expect(roundBorderMetric(1, 0.5)).toBe(1);
  expect(new SvxBorderLine(0, 65535).GetScaledWidth()).toBe(65535);
});
it("keeps four owned lines and signed distances with native negative-read and overflow policy", /** Checks independent public item contracts. @returns Nothing. */ () => {
  expect([
    SvxBoxItemLine.TOP,
    SvxBoxItemLine.BOTTOM,
    SvxBoxItemLine.LEFT,
    SvxBoxItemLine.RIGHT,
  ]).toEqual([0, 1, 2, 3]);
  const item = new SvxBoxItem(113),
    line = new SvxBorderLine(0x112233, 20);
  expect(item.QueryValue()).toEqual([
    ...Array.from(
      { length: 4 },
      /** Creates an independent absent UNO line. @returns Literal payload. */ () => ({
        Color: 0,
        InnerLineWidth: 0,
        OuterLineWidth: 0,
        LineDistance: 0,
        LineStyle: 32767,
        LineWidth: 0,
      }),
    ),
    0,
    0,
    0,
    0,
    0,
  ]);
  expect(item.HasBorder()).toBe(false);
  expect(item.HasMetrics()).toBe(true);
  for (const edge of [0, 1, 2, 3]) {
    item.SetLine(line, edge);
    item.SetDistance(10 + edge, edge);
  }
  line.SetWidth(999);
  expect([
    item.GetTop()?.GetWidth(),
    item.GetBottom()?.GetWidth(),
    item.GetLeft()?.GetWidth(),
    item.GetRight()?.GetWidth(),
  ]).toEqual([20, 20, 20, 20]);
  const copy = item.Clone();
  expect(copy.equals(item)).toBe(true);
  copy.GetTop()?.SetColor(0xffffff);
  expect(copy.equals(item)).toBe(false);
  expect(copy.GetTop()).not.toBe(item.GetTop());
  expect(item.equals(new SvxBoxItem(114))).toBe(false);
  expect(item.equals(new SvxSizeItem(113))).toBe(false);
  copy.SetLine(item.GetTop(), 0);
  copy.SetDistance(99, 1);
  expect(copy.equals(item)).toBe(false);
  copy.SetDistance(11, 1);
  copy.SetRemoveAdjCellBorder(true);
  expect(copy.equals(item)).toBe(false);
  expect(copy.GetRemoveAdjCellBorder()).toBe(true);
  expect(copy.Clone().GetRemoveAdjCellBorder()).toBe(true);
  item.SetDistance(-30, 0);
  expect(item.GetDistance(0)).toBe(0);
  expect(item.GetDistance(0, true)).toBe(-30);
  expect(item.CalcLineWidth(0)).toBe(20);
  expect(item.CalcLineSpace(0)).toBe(0);
  expect(item.CalcLineSpace(0, false, true)).toBe(-10);
  item.SetLine(undefined, 0);
  expect(item.CalcLineSpace(0)).toBe(0);
  expect(item.CalcLineSpace(0, true, true)).toBe(-30);
  item.ScaleMetrics(0.5);
  expect(item.GetDistance(0, true)).toBe(-15);
  expect(item.GetDistance(1)).toBe(6);
  expect(item.GetBottom()?.GetScaledWidth()).toBe(10);
  item.SetAllDistances(0);
  item.SetDistance(12, 2);
  expect(item.GetSmallestDistance()).toBe(12);
  item.SetDistance(-1, 1);
  expect(item.GetSmallestDistance()).toBe(12);
  item.SetAllDistances(-1);
  expect(item.GetSmallestDistance()).toBe(65535);
  item.SetAllDistances(32768);
  expect(item.GetDistance(3, true)).toBe(-32768);
  const paddingOnly = new SvxBoxItem(113);
  paddingOnly.SetAllDistances(20);
  expect(paddingOnly.HasBorder()).toBe(false);
  expect(paddingOnly.HasBorder(true)).toBe(true);
  expect(paddingOnly.CalcLineSpace(2, true)).toBe(20);
  item.SetLine(new SvxBorderLine(0, 32767), 3);
  item.SetDistance(1, 3);
  expect(item.CalcLineSpace(3, false, true)).toBe(-32768);
});
it("roundtrips native UNO member ordering and both measurement units", /** Checks literal independent member IDs and malformed payload admission. @returns Nothing. */ () => {
  const item = new SvxBoxItem(113);
  for (const [member, edge] of [
    [1, 2],
    [2, 3],
    [3, 0],
    [4, 1],
    [10, 2],
    [11, 3],
    [12, 0],
    [13, 1],
  ] as const) {
    expect(
      item.PutValue(
        {
          Color: 0x123456,
          InnerLineWidth: 0,
          OuterLineWidth: 0,
          LineDistance: 0,
          LineStyle: 0,
          LineWidth: 20,
        },
        member,
      ),
    ).toBe(true);
    expect(item.GetLine(edge)?.GetWidth()).toBe(20);
    expect(item.QueryValue(member)).toMatchObject({ Color: 0x123456, LineWidth: 20, LineStyle: 0 });
    expect(item.QueryValue(member | 0x80)).toMatchObject({ LineWidth: 35, OuterLineWidth: 35 });
    expect(item.PutValue(null, member)).toBe(false);
  }
  for (const [member, edge] of [
    [6, 2],
    [7, 3],
    [8, 0],
    [9, 1],
  ] as const) {
    expect(item.PutValue(35, member | 0x80)).toBe(true);
    expect(item.GetDistance(edge)).toBe(20);
    expect(item.QueryValue(member | 0x80)).toBe(35);
    expect(item.PutValue("invalid", member)).toBe(false);
  }
  expect(item.PutValue(72, 5)).toBe(true);
  expect(item.QueryValue(5 | 0x80)).toBe(127);
  expect(item.PutValue(1, 14)).toBe(true);
  expect(item.GetTop()?.GetBorderLineStyle()).toBe(0);
  expect(item.PutValue(2, 14)).toBe(true);
  expect(item.GetTop()?.GetBorderLineStyle()).toBe(2);
  expect(item.PutValue(0, 14)).toBe(true);
  expect(item.GetTop()?.isEmpty()).toBe(true);
  expect(item.QueryValue(14)).toBeUndefined();
  expect(item.QueryValue(15)).toBeUndefined();
  expect(item.PutValue(35, 15 | 0x80)).toBe(true);
  expect(item.GetTop()?.GetWidth()).toBe(20);
  item.PutValue(1, 14);
  const restored = new SvxBoxItem(113);
  expect(restored.PutValue(item.QueryValue())).toBe(true);
  expect(restored.equals(item)).toBe(true);
  expect(restored.PutValue(item.QueryValue(0x80), 0x80)).toBe(true);
  expect(restored.equals(item)).toBe(true);
  expect(restored.PutValue([])).toBe(false);
  expect(restored.PutValue(null)).toBe(false);
  expect(restored.PutValue(1, 99)).toBe(false);
});
it("keeps native info validity127, independent directions, flags, metrics and owned lines", /** Checks complete source-defined info defaults and mutation. @returns Nothing. */ () => {
  const info = new SvxBoxInfoItem(10023),
    line = new SvxBorderLine(0x112233, 20);
  expect(info.QueryValue()).toEqual([
    SvxBoxItem.SvxLineToLine(undefined),
    SvxBoxItem.SvxLineToLine(undefined),
    0,
    127,
    0,
  ]);
  expect(info.IsValid(SvxBoxInfoItemValidFlags.DISABLE)).toBe(false);
  info.EnableHor(true);
  expect(info.IsHor()).toBe(true);
  expect(info.IsTable()).toBe(false);
  info.EnableVer(true);
  expect(info.IsVer()).toBe(true);
  expect(info.IsTable()).toBe(true);
  info.SetDist(true);
  info.SetMinDist(true);
  info.SetDefDist(72);
  info.SetLine(line, 0);
  info.SetLine(line, 1);
  line.SetColor(0xffffff);
  expect(info.GetHori()?.GetColor()).toBe(0x112233);
  expect(info.GetVert()?.GetColor()).toBe(0x112233);
  expect(info.GetLine(0)).toBe(info.GetHori());
  expect(info.QueryValue(0x2e)).toBe(7);
  expect(info.QueryValue(0x29 | 0x80)).toBe(127);
  expect(info.QueryValue(1 | 0x80)).toMatchObject({ LineWidth: 35 });
  expect(info.QueryValue(2)).toMatchObject({ LineWidth: 20 });
  const clone = info.Clone();
  expect(clone.equals(info)).toBe(true);
  expect(clone.GetHori()).not.toBe(info.GetHori());
  clone.SetValid(SvxBoxInfoItemValidFlags.TOP, false);
  expect(clone.equals(info)).toBe(false);
  expect(clone.QueryValue(4)).toBe(126);
  clone.ResetFlags();
  expect(clone.equals(info)).toBe(true);
  clone.ScaleMetrics(0.5);
  expect(clone.GetDefDist()).toBe(36);
  expect(clone.GetVert()?.GetScaledWidth()).toBe(10);
  expect(clone.HasMetrics()).toBe(true);
  const restored = new SvxBoxInfoItem(10023);
  expect(restored.PutValue(info.QueryValue())).toBe(true);
  expect(restored.equals(info)).toBe(true);
  expect(restored.PutValue(info.QueryValue(0x80), 0x80)).toBe(true);
  expect(restored.equals(info)).toBe(true);
  expect(restored.PutValue(0, 0x2e)).toBe(true);
  expect(restored.IsTable()).toBe(false);
  expect(restored.PutValue(255, 4)).toBe(true);
  expect(restored.IsValid(SvxBoxInfoItemValidFlags.DISABLE)).toBe(true);
  expect(restored.PutValue(65536, 0x29)).toBe(true);
  expect(restored.GetDefDist()).toBe(0);
  expect(restored.PutValue(-1, 0x29)).toBe(true);
  expect(restored.GetDefDist()).toBe(0);
  expect(restored.PutValue(null, 1)).toBe(false);
  expect(restored.PutValue(0, 99)).toBe(false);
  expect(restored.QueryValue(99)).toBeUndefined();
});

it("returns native zero drawing width for an absent line", /** Checks the default box drawing metric independently of distance minima. @returns Nothing. */ () => {
  const box = new SvxBoxItem(113);
  box.SetAllDistances(42);
  expect(box.CalcLineWidth(0)).toBe(0);
  expect(box.CalcLineSpace(0)).toBe(0);
  expect(box.CalcLineSpace(0, true)).toBe(42);
});
