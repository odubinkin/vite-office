/** @fileoverview Actual native frame-array clipping and own-versus-neighbor conflict order for the represented unmerged cells. */
import { expect, it } from "vitest";
import { Array as FrameArray } from "./framelinkarray";
import { Style } from "./framelink";
import { SvxBorderLine, SvxBorderLineStyle } from "../../../editeng/source/items/borderline";
import { Color } from "../../../tools/inc/color";
/** Creates actual native frame style. @param width - Twips. @param color - Native RGB. @returns Owned style. */
function style(width: number, color = 0): Style {
  return new Style(new SvxBorderLine(new Color(color), width, SvxBorderLineStyle.SOLID));
}
it("selects real neighbor edges by native precedence and retains own color on equal-width conflicts", /** Actual independent edge values. @returns Nothing. */ () => {
  const a = new FrameArray();
  a.Initialize(3, 3);
  a.SetCellStyleLeft(1, 1, style(20, 0xff0000));
  a.SetCellStyleRight(0, 1, style(40, 0x0000ff));
  expect(a.GetCellStyleLeft(1, 1).GetWidth()).toBe(40);
  a.SetCellStyleLeft(1, 1, style(40, 0xff0000));
  expect(a.GetCellStyleLeft(1, 1).GetColorPrim().toUInt32()).toBe(0xff0000);
  expect(a.GetCellStyleRight(0, 1).GetColorPrim().toUInt32()).toBe(0x0000ff);
  a.SetCellStyleTop(1, 1, style(20, 0x112233));
  a.SetCellStyleBottom(1, 0, style(30));
  expect(a.GetCellStyleTop(1, 1).GetWidth()).toBe(30);
  a.SetCellStyleBottom(1, 1, style(20));
  a.SetCellStyleTop(1, 2, style(50));
  expect(a.GetCellStyleBottom(1, 1).GetWidth()).toBe(50);
});
it("preserves clipping-border own edges and original outside-neighbor queries without leaking excluded styles", /** Actual clip special cases. @returns Nothing. */ () => {
  const a = new FrameArray();
  a.Initialize(3, 3);
  a.SetCellStyleLeft(1, 1, style(10));
  a.SetCellStyleRight(1, 1, style(20));
  a.SetCellStyleTop(1, 1, style(30));
  a.SetCellStyleBottom(1, 1, style(40));
  a.SetCellStyleRight(0, 1, style(100));
  a.SetClipRange(1, 1, 1, 1);
  expect(a.GetCellStyleLeft(1, 1).GetWidth()).toBe(10);
  expect(a.GetCellStyleRight(0, 1).GetWidth()).toBe(10);
  expect(a.GetCellStyleRight(1, 1).GetWidth()).toBe(20);
  expect(a.GetCellStyleLeft(2, 1).GetWidth()).toBe(20);
  expect(a.GetCellStyleTop(1, 1).GetWidth()).toBe(30);
  expect(a.GetCellStyleBottom(1, 0).GetWidth()).toBe(30);
  expect(a.GetCellStyleTop(1, 2).GetWidth()).toBe(40);
  expect(a.GetCellStyleBottom(1, 1).GetWidth()).toBe(40);
  expect(a.GetCellStyleLeft(1, 0).GetWidth()).toBe(0);
  expect(a.GetCellStyleRight(3, 1).GetWidth()).toBe(0);
  expect(a.GetCellStyleTop(0, 1).GetWidth()).toBe(0);
  expect(a.GetCellStyleBottom(1, 3).GetWidth()).toBe(0);
  a.Initialize(1, 1);
  expect(a.GetCellStyleLeft(0, 0).GetWidth()).toBe(0);
});
it("retains empty fallbacks for out-of-array writes and all clipped axes", /** retains empty fallbacks for out-of-array writes and all clipped axes. @returns Observed test result. */ () => {
  const a = new FrameArray();
  a.Initialize(2, 2);
  a.SetCellStyleLeft(4, 4, style(60));
  expect(a.GetCellStyleRight(1, 0).GetWidth()).toBe(0);
  a.SetClipRange(1, 1, 1, 1);
  expect(a.GetCellStyleLeft(0, 1).GetWidth()).toBe(0);
  expect(a.GetCellStyleRight(1, 0).GetWidth()).toBe(0);
  expect(a.GetCellStyleTop(1, 0).GetWidth()).toBe(0);
  expect(a.GetCellStyleBottom(0, 1).GetWidth()).toBe(0);
});
