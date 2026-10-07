/** @fileoverview Verifies independent native size items without reference checkout access. */
import { expect, it } from "vitest";
import { SvxSizeItem } from "../../editeng/source/items/frmitems";
import { SwFormatFrameSize, SwFrameSize } from "./fmtfsize";
import { RES_FRM_SIZE } from "./hintids";
it("native base size owns both dimensions, identity, copy and default query", /** Checks base item value semantics. @returns Nothing. */ () => {
  const input = { width: 72, height: 144 },
    item = new SvxSizeItem(90, input),
    defaultItem = new SvxSizeItem(91);
  input.width = 900;
  expect(item.GetSize()).toEqual({ width: 72, height: 144 });
  expect(defaultItem.GetSize()).toEqual({ width: 0, height: 0 });
  const exposed = item.GetSize();
  Reflect.set(exposed, "height", 800);
  expect(item.GetHeight()).toBe(144);
  const clone = item.Clone();
  expect(item.equals(clone)).toBe(true);
  clone.SetWidth(73);
  expect(item.equals(clone)).toBe(false);
  clone.SetWidth(72);
  clone.SetHeight(145);
  expect(item.equals(clone)).toBe(false);
  expect(item.equals(defaultItem)).toBe(false);
  expect(item.QueryValue()).toEqual({ Width: 72, Height: 144 });
  item.SetSize({ width: 90, height: 100 });
  expect(item.GetWidth()).toBe(90);
  expect(item.GetHeight()).toBe(100);
});
it("native frame size retains all eight defaults, fields and complete clone equality", /** Checks exact native enum and item defaults. @returns Nothing. */ () => {
  const item = new SwFormatFrameSize();
  expect([SwFrameSize.Variable, SwFrameSize.Fixed, SwFrameSize.Minimum]).toEqual([0, 1, 2]);
  expect(item.Which()).toBe(RES_FRM_SIZE);
  expect(RES_FRM_SIZE).toBe(90);
  expect(SwFormatFrameSize.SYNCED).toBe(255);
  expect([
    item.GetWidth(),
    item.GetHeight(),
    item.GetWidthSizeType(),
    item.GetHeightSizeType(),
    item.GetWidthPercent(),
    item.GetWidthPercentRelation(),
    item.GetHeightPercent(),
    item.GetHeightPercentRelation(),
  ]).toEqual([0, 0, 1, 0, 0, 0, 0, 0]);
  item.SetWidth(72);
  item.SetHeight(144);
  item.SetHeightSizeType(SwFrameSize.Minimum);
  item.SetWidthSizeType(SwFrameSize.Variable);
  item.SetWidthPercent(60);
  item.SetHeightPercent(255);
  item.SetWidthPercentRelation(3);
  item.SetHeightPercentRelation(4);
  expect(item.QueryValue()).toEqual({ Width: 127, Height: 254 });
  const copy = item.Clone();
  expect(item.equals(copy)).toBe(true);
  expect([
    copy.GetWidthPercent(),
    copy.GetWidthPercentRelation(),
    copy.GetHeightPercent(),
    copy.GetHeightPercentRelation(),
  ]).toEqual([60, 3, 255, 4]);
  const changes: ((value: SwFormatFrameSize) => void)[] = [
    /** Changes dimension. @param value - Candidate. @returns Nothing. */ (value) =>
      value.SetWidth(73),
    /** Changes dimension. @param value - Candidate. @returns Nothing. */ (value) =>
      value.SetHeight(145),
    /** Changes height mode. @param value - Candidate. @returns Nothing. */ (value) =>
      value.SetHeightSizeType(SwFrameSize.Fixed),
    /** Changes width mode. @param value - Candidate. @returns Nothing. */ (value) =>
      value.SetWidthSizeType(SwFrameSize.Fixed),
    /** Changes percentage. @param value - Candidate. @returns Nothing. */ (value) =>
      value.SetWidthPercent(61),
    /** Changes relation. @param value - Candidate. @returns Nothing. */ (value) =>
      value.SetWidthPercentRelation(5),
    /** Changes percentage. @param value - Candidate. @returns Nothing. */ (value) =>
      value.SetHeightPercent(50),
    /** Changes relation. @param value - Candidate. @returns Nothing. */ (value) =>
      value.SetHeightPercentRelation(6),
  ];
  for (const change of changes) {
    const candidate = item.Clone();
    change(candidate);
    expect(item.equals(candidate)).toBe(false);
  }
  expect(item.equals(new SvxSizeItem(90, { width: 72, height: 144 }))).toBe(false);
  expect(item.equals(copy)).toBe(true);
});
