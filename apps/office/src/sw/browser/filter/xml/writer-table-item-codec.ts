/** @fileoverview Transports complete native Writer frame-size values across browser storage boundaries. */
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { SwFormatRowSplit } from "../../../inc/fmtrowsplt";
import type { SwTableLineFormat } from "../../../source/core/table/swtable";
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
/** Row boundary record, including prior v16 minimum-height ingress. */
export type WriterRowFormatRecord = Omit<SwTableLineFormat, "frameSize" | "rowSplit"> & {
  readonly frameSize?: WriterFrameSizeRecord | undefined;
  readonly minHeight?: number | undefined;
  readonly rowSplit?: boolean | undefined;
  /** Prior primitive inverse row flag, accepted only at snapshot ingestion. */
  readonly keepTogether?: boolean | undefined;
};
/** Encodes public native values without transferring a class prototype. @param value - Original row format. @returns Primitive row record. */
export function encodeRowFormat(value: SwTableLineFormat): WriterRowFormatRecord {
  const { frameSize, rowSplit, ...format } = value;
  return {
    ...format,
    rowSplit: rowSplit?.GetValue(),
    frameSize: encodeFrameSize(frameSize),
  };
}
/** Restores the complete native item at the existing graph boundary. @param value - Primitive row record. @returns Native row format. */
export function decodeRowFormat(value: WriterRowFormatRecord): SwTableLineFormat {
  const { frameSize, minHeight, rowSplit, keepTogether, ...format } = value;
  if (
    (rowSplit !== undefined && typeof rowSplit !== "boolean") ||
    (keepTogether !== undefined && typeof keepTogether !== "boolean")
  )
    throw new Error("Stored Writer row split is invalid.");
  const split = rowSplit ?? (keepTogether === undefined ? undefined : !keepTogether);
  const native = {
    ...format,
    rowSplit: split === undefined ? undefined : new SwFormatRowSplit(split),
  };
  if (frameSize === undefined)
    return {
      ...native,
      frameSize:
        minHeight === undefined
          ? undefined
          : new SwFormatFrameSize(SwFrameSize.Minimum, 0, minHeight),
    };
  return { ...native, frameSize: decodeFrameSize(frameSize) };
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
