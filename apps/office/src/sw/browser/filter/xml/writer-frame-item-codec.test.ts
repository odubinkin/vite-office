/** @fileoverview Complete native frame-size/LR-space fields survive shared item transport without rounding relative measures or replaying proportional setters. */
import { expect, it } from "vitest";
import {
  encodeFrameSize,
  decodeFrameSize,
  encodeWriterFrameItem,
  decodeWriterFrameItem,
} from "./writer-frame-item-codec";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { SvxLRSpaceItem, SvxIndentValue } from "../../../../editeng/inc/lrspitem";
import { MeasureUnit } from "../../../../offapi/com/sun/star/util/MeasureUnit";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { RES_FRM_SIZE, RES_LR_SPACE } from "../../../inc/hintids";
import { SfxItemPool } from "../../../../svl/source/items/itempool";
import { encodeSfxPoolItem, decodeSfxPoolItem } from "./item-codec";

it("retains original complete frame size and native absence and rejects malformed boundary records", /** Uses actual native items and unchanged complete field codec. @returns Nothing. */ () => {
  expect(encodeFrameSize(undefined)).toBeUndefined();
  const item = new SwFormatFrameSize(SwFrameSize.Minimum, 12345, 6789);
  item.SetWidthSizeType(SwFrameSize.Variable);
  item.SetWidthPercent(55);
  item.SetHeightPercent(66);
  item.SetWidthPercentRelation(2);
  item.SetHeightPercentRelation(3);
  const encoded = encodeFrameSize(item);
  expect(decodeFrameSize(encoded as NonNullable<typeof encoded>).equals(item)).toBe(true);
  expect(decodeWriterFrameItem(encodeSfxPoolItem(item))?.equals(item)).toBe(true);
  for (const value of [
    null,
    1,
    {},
    { ...encoded, width: "1" },
    { ...encoded, heightType: 99 },
    { ...encoded, widthType: 99 },
  ])
    expect(
      /** Rejects invalid frame state. @returns Never. */ () => decodeFrameSize(value as never),
    ).toThrow();
  expect(encodeWriterFrameItem(new SfxBoolItem(1, true))).toBeNull();
  expect(decodeWriterFrameItem({ which: 1, value: true })).toBeNull();
});

it("retains all native LR measures, relative units, proportions, gutters and sticky flags exactly", /** Includes the native65535 scale state that UNO's scale setter rejects. @returns Nothing. */ () => {
  const item = new SvxLRSpaceItem(RES_LR_SPACE);
  item.SetTextFirstLineOffset(new SvxIndentValue(-2.125, MeasureUnit.FONT_EM), 73);
  item.SetLeft(new SvxIndentValue(3.375, MeasureUnit.FONT_CJK_ADVANCE), 87);
  item.SetRight(new SvxIndentValue(5.125, MeasureUnit.FONT_EM), 0);
  // Native struct admission retains unsigned65535 through signed16 scale fields.
  const scale = new SvxLRSpaceItem(RES_LR_SPACE);
  expect(
    scale.PutValue(
      {
        Left: 0,
        TextLeft: 0,
        Right: 0,
        FirstLine: 0,
        ScaleLeft: -1,
        ScaleRight: -1,
        ScaleFirstLine: -1,
        AutoFirstLine: true,
      },
      0,
    ),
  ).toBe(true);
  for (const source of [item, scale]) {
    source.SetGutterMargin(-42);
    source.SetRightGutterMargin(65536);
    source.SetAutoFirst(true);
    source.SetExplicitZeroMarginValLeft(true);
    source.SetExplicitZeroMarginValRight(false);
    const snapshot = encodeSfxPoolItem(source);
    for (const value of [structuredClone(snapshot), JSON.parse(JSON.stringify(snapshot))]) {
      const restored = decodeSfxPoolItem(new SfxItemPool(), value);
      expect(restored).toBeInstanceOf(SvxLRSpaceItem);
      expect(restored.equals(source)).toBe(true);
    }
  }
});

it("rejects malformed LR native field carriers at the browser boundary", /** Validates fixed tuple width, measures, scales, gutters and flags. @returns Nothing. */ () => {
  const snapshot = encodeWriterFrameItem(new SvxLRSpaceItem(RES_LR_SPACE));
  if (!snapshot || !Array.isArray(snapshot.value)) throw new Error("Missing native LR snapshot");
  const valid = snapshot.value;
  const changed =
    /** Changes one serialized field while keeping every other native field intact. @param index - Field. @param value - Candidate value. @returns Record. */ (
      index: number,
      value: unknown,
    ) => {
      const result = [...valid];
      result[index] = value as never;
      return result;
    };
  for (const value of [
    null,
    [],
    changed(0, null),
    changed(0, []),
    changed(0, ["x", 0]),
    changed(0, [Number.POSITIVE_INFINITY, 0]),
    changed(0, [1, "x"]),
    changed(0, [1, 0.5]),
    changed(0, [1, -32769]),
    changed(0, [1, 32768]),
    changed(3, "x"),
    changed(3, 0.5),
    changed(3, -1),
    changed(3, 65536),
    changed(6, "x"),
    changed(6, 0.5),
    changed(6, Number.MAX_SAFE_INTEGER + 1),
    changed(8, 1),
  ])
    expect(
      /** Rejects one corrupt native field. @returns Never. */ () =>
        decodeWriterFrameItem({ which: RES_LR_SPACE, value: value as never }),
    ).toThrow();
  expect(
    /** Frame identity selects its own complete validation. @returns Never. */ () =>
      decodeWriterFrameItem({ which: RES_FRM_SIZE, value: valid }),
  ).toThrow();
});
