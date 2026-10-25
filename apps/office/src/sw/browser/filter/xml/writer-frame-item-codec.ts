/** @fileoverview Browser transport for complete shared native frame-size and LR-space items; table/page owners share these exact encoders. */
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { SvxLRSpaceItem, SvxIndentValue } from "../../../../editeng/inc/lrspitem";
import { RES_FRM_SIZE, RES_LR_SPACE } from "../../../inc/hintids";
import type { SfxPoolItem, SfxPoolItemSnapshot } from "../../../../svl/source/items/poolitem";
/** Primitive complete frame item for process and storage boundaries. */
export interface WriterFrameSizeRecord {
  readonly width: number;
  readonly height: number;
  readonly widthType: SwFrameSize;
  readonly heightType: SwFrameSize;
  readonly widthPercent: number;
  readonly heightPercent: number;
  readonly widthPercentRelation: number;
  readonly heightPercentRelation: number;
}
/** Encodes all public native frame-size fields. @param frameSize - Optional native item. @returns Complete primitive record or no authored item. */
export function encodeFrameSize(
  frameSize: SwFormatFrameSize | undefined,
): WriterFrameSizeRecord | undefined {
  return frameSize === undefined
    ? undefined
    : {
        width: frameSize.GetWidth(),
        height: frameSize.GetHeight(),
        widthType: frameSize.GetWidthSizeType(),
        heightType: frameSize.GetHeightSizeType(),
        widthPercent: frameSize.GetWidthPercent(),
        heightPercent: frameSize.GetHeightPercent(),
        widthPercentRelation: frameSize.GetWidthPercentRelation(),
        heightPercentRelation: frameSize.GetHeightPercentRelation(),
      };
}

/** Restores a complete native frame-size item. @param frameSize - Untrusted primitive record. @returns Independent native item. */
export function decodeFrameSize(frameSize: WriterFrameSizeRecord): SwFormatFrameSize {
  if (
    frameSize === null ||
    typeof frameSize !== "object" ||
    [
      frameSize.width,
      frameSize.height,
      frameSize.widthType,
      frameSize.heightType,
      frameSize.widthPercent,
      frameSize.heightPercent,
      frameSize.widthPercentRelation,
      frameSize.heightPercentRelation,
    ].some(
      /** Rejects non-numeric native fields at an untrusted graph boundary. @param field - Serialized value. @returns Whether invalid. */ (
        field,
      ) => typeof field !== "number" || !Number.isFinite(field),
    ) ||
    ![0, 1, 2].includes(frameSize.widthType) ||
    ![0, 1, 2].includes(frameSize.heightType)
  )
    throw new Error("Stored Writer frame size is invalid.");
  const item = new SwFormatFrameSize(frameSize.heightType, frameSize.width, frameSize.height);
  item.SetWidthSizeType(frameSize.widthType);
  item.SetWidthPercent(frameSize.widthPercent);
  item.SetHeightPercent(frameSize.heightPercent);
  item.SetWidthPercentRelation(frameSize.widthPercentRelation);
  item.SetHeightPercentRelation(frameSize.heightPercentRelation);
  return item;
}

/** Encodes complete concrete frame items; unrelated native items retain their existing codecs. @param item - Actual item. @returns Snapshot or null. */
export function encodeWriterFrameItem(item: SfxPoolItem): SfxPoolItemSnapshot | null {
  if (item instanceof SwFormatFrameSize)
    return { which: item.Which(), value: { ...(encodeFrameSize(item) as WriterFrameSizeRecord) } };
  if (!(item instanceof SvxLRSpaceItem)) return null;
  const measure =
    /** Copies both original measure fields without resolving relative units or rounding doubles. @param value - Measure. @returns Pair. */ (
      value: ReturnType<SvxLRSpaceItem["GetLeft"]>,
    ) => [value.m_dValue, value.m_nUnit];
  return {
    which: item.Which(),
    value: [
      measure(item.GetLeft()),
      measure(item.GetRight()),
      measure(item.GetTextFirstLineOffset()),
      item.GetPropLeft(),
      item.GetPropRight(),
      item.GetPropTextFirstLineOffset(),
      item.GetGutterMargin(),
      item.GetRightGutterMargin(),
      item.IsAutoFirst(),
      item.IsExplicitZeroMarginValLeft(),
      item.IsExplicitZeroMarginValRight(),
    ],
  };
}
/** Restores native frame values with exact original measures and percentage fields, including otherwise rejected65535 scale metadata. @param snapshot - Untrusted record. @returns Actual item or null. */
export function decodeWriterFrameItem(snapshot: SfxPoolItemSnapshot): SfxPoolItem | null {
  if (snapshot.which === RES_FRM_SIZE)
    return decodeFrameSize(snapshot.value as unknown as WriterFrameSizeRecord);
  if (snapshot.which !== RES_LR_SPACE) return null;
  const value = snapshot.value;
  if (!Array.isArray(value) || value.length !== 11)
    throw new Error("Stored Writer LR frame item is invalid.");
  for (const index of [0, 1, 2]) {
    const pair: unknown = value[index];
    if (
      !Array.isArray(pair) ||
      pair.length !== 2 ||
      typeof pair[0] !== "number" ||
      !Number.isFinite(pair[0]) ||
      typeof pair[1] !== "number" ||
      !Number.isInteger(pair[1]) ||
      pair[1] < -32768 ||
      pair[1] > 32767
    )
      throw new Error("Stored Writer LR measure is invalid.");
  }
  for (const index of [3, 4, 5])
    if (
      typeof value[index] !== "number" ||
      !Number.isInteger(value[index]) ||
      value[index] < 0 ||
      value[index] > 65535
    )
      throw new Error("Stored Writer LR scale is invalid.");
  for (const index of [6, 7])
    if (typeof value[index] !== "number" || !Number.isSafeInteger(value[index]))
      throw new Error("Stored Writer LR gutter is invalid.");
  for (const index of [8, 9, 10])
    if (typeof value[index] !== "boolean") throw new Error("Stored Writer LR flag is invalid.");
  const item = new SvxLRSpaceItem(snapshot.which),
    measure =
      /** Constructs the real original measure. @param pair - Validated fields. @returns Measure. */ (
        pair: readonly number[],
      ) => new SvxIndentValue(pair[0] as number, pair[1] as number);
  item.SetTextFirstLineOffset(measure(value[2] as number[]));
  item.SetLeft(measure(value[0] as number[]));
  item.SetRight(measure(value[1] as number[]));
  // Constant-key writes bind native copy-constructor scalar fields at the host
  // serialization boundary. Calling UNO scale setters would reject65535 and
  // re-running proportional setters would change stored doubles.
  item["propLeft"] = value[3] as number;
  item["propRight"] = value[4] as number;
  item.SetPropTextFirstLineOffset(value[5] as number);
  item.SetGutterMargin(value[6] as number);
  item.SetRightGutterMargin(value[7] as number);
  item.SetAutoFirst(value[8] as boolean);
  item.SetExplicitZeroMarginValLeft(value[9] as boolean);
  item.SetExplicitZeroMarginValRight(value[10] as boolean);
  return item;
}
