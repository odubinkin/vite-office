/** @fileoverview Transports complete native Writer frame-size values across browser storage boundaries. */
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { SwFormatRowSplit } from "../../../inc/fmtrowsplt";
import type {
  SwTable,
  SwTableFormat,
  SwTableLineFormatValue,
} from "../../../source/core/table/swtable";
import type { SwFrameFormat } from "../../../source/core/layout/atrfrm";
import { SwFormatHoriOrient } from "../../../inc/fmtornt";
import {
  RES_FRM_SIZE,
  RES_HORI_ORIENT,
  RES_UL_SPACE,
  RES_LAYOUT_SPLIT,
  RES_COLLAPSING_BORDERS,
} from "../../../inc/hintids";
import type { SfxPoolItemSnapshot } from "../../../../svl/source/items/poolitem";
import { encodeSfxPoolItem } from "./item-codec";
/** Direct native spacing presence, independently versioned from older geometry records. */
export interface WriterTableSpacingRecord {
  readonly upperLower?: SfxPoolItemSnapshot | undefined;
}
/** Direct native flow/border presence, independent of older geometry and spacing records. */
export interface WriterTableFlowRecord {
  readonly layoutSplit?: SfxPoolItemSnapshot | undefined;
  readonly collapsingBorders?: SfxPoolItemSnapshot | undefined;
}
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
/** Complete original horizontal item carried across process/storage boundaries. */
export interface WriterHoriOrientRecord {
  readonly position: number;
  readonly orientation: number;
  readonly relation: number;
  readonly toggle: boolean;
}
/** Presence of this record distinguishes native direct absence from old scalar ingress. */
export interface WriterTableGeometryRecord {
  readonly frameSize?: WriterFrameSizeRecord | undefined;
  readonly horiOrient?: WriterHoriOrientRecord | undefined;
}
/** Current complete native geometry with prior scalar fields accepted only at ingestion. */
export type WriterTableFormatRecord = SwTableFormat & {
  readonly nativeGeometry?: WriterTableGeometryRecord | undefined;
  readonly nativeSpacing?: WriterTableSpacingRecord | undefined;
  readonly nativeFlow?: WriterTableFlowRecord | undefined;
};

/** Encodes original direct size/orientation without duplicate scalar geometry. @param table - Original native table. @returns Primitive boundary record. */
export function encodeTableFormat(table: SwTable): WriterTableFormatRecord {
  const format = { ...table.GetFormat() };
  delete format.width;
  delete format.horiOrient;
  delete format.align;
  delete format.marginTop;
  delete format.marginBottom;
  delete format.layoutSplit;
  delete format.borderModel;
  const set = table.GetFrameFormat().GetAttrSet(),
    size = set.GetItemIfSet(RES_FRM_SIZE, false) as SwFormatFrameSize | undefined,
    orient = set.GetItemIfSet(RES_HORI_ORIENT, false) as SwFormatHoriOrient | undefined,
    spacing = set.GetItemIfSet(RES_UL_SPACE, false),
    split = set.GetItemIfSet(RES_LAYOUT_SPLIT, false),
    borders = set.GetItemIfSet(RES_COLLAPSING_BORDERS, false);
  return {
    ...format,
    nativeFlow: {
      layoutSplit: split === undefined ? undefined : encodeSfxPoolItem(split),
      collapsingBorders: borders === undefined ? undefined : encodeSfxPoolItem(borders),
    },
    nativeSpacing: {
      upperLower: spacing === undefined ? undefined : encodeSfxPoolItem(spacing),
    },
    nativeGeometry: {
      frameSize: encodeFrameSize(size),
      horiOrient:
        orient === undefined
          ? undefined
          : {
              position: orient.GetPos(),
              orientation: orient.GetHoriOrient(),
              relation: orient.GetRelationOrient(),
              toggle: orient.IsPosToggle(),
            },
    },
  };
}

/** Restores original direct table booleans after validating both items, retaining legacy marker absence. @param format - Native frame owner. @param flow - Current native record or older absent marker. @returns Nothing. */
export function restoreTableFlow(
  format: SwFrameFormat,
  flow: WriterTableFlowRecord | undefined,
): void {
  if (flow === undefined) return;
  if (flow === null || typeof flow !== "object" || Array.isArray(flow))
    throw new Error("Stored Writer native table flow is invalid.");
  const split = decodeTableBoolItem(format, flow.layoutSplit, RES_LAYOUT_SPLIT),
    borders = decodeTableBoolItem(format, flow.collapsingBorders, RES_COLLAPSING_BORDERS);
  format.ResetFormatAttr(RES_LAYOUT_SPLIT);
  format.ResetFormatAttr(RES_COLLAPSING_BORDERS);
  if (split !== undefined) format.SetFormatAttr(split);
  if (borders !== undefined) format.SetFormatAttr(borders);
}

/** Validates native identity/value before the registered factory can coerce legacy input. @param format - Native frame owner. @param snapshot - Optional direct item. @param which - Original identity. @returns Registered item or direct absence. */
function decodeTableBoolItem(
  format: SwFrameFormat,
  snapshot: SfxPoolItemSnapshot | undefined,
  which: number,
) {
  if (snapshot === undefined) return undefined;
  if (
    snapshot === null ||
    typeof snapshot !== "object" ||
    Array.isArray(snapshot) ||
    snapshot.which !== which ||
    typeof snapshot.value !== "boolean"
  )
    throw new Error("Stored Writer native table flow item is invalid.");
  return format.GetAttrSet().GetPool().CreateItem(snapshot);
}

/** Restores original direct UL item through the existing registered pool, validating before native mutation. @param format - Original frame owner. @param spacing - Current native record or prior marker absence. @returns Nothing. */
export function restoreTableSpacing(
  format: SwFrameFormat,
  spacing: WriterTableSpacingRecord | undefined,
): void {
  if (spacing === undefined) return;
  if (spacing === null || typeof spacing !== "object" || Array.isArray(spacing))
    throw new Error("Stored Writer native table spacing is invalid.");
  const snapshot = spacing.upperLower;
  if (
    snapshot !== undefined &&
    (snapshot === null ||
      typeof snapshot !== "object" ||
      Array.isArray(snapshot) ||
      snapshot.which !== RES_UL_SPACE)
  )
    throw new Error("Stored Writer native table spacing item is invalid.");
  const item =
    snapshot === undefined ? undefined : format.GetAttrSet().GetPool().CreateItem(snapshot);
  format.ResetFormatAttr(RES_UL_SPACE);
  if (item !== undefined) format.SetFormatAttr(item);
}

/** Restores original typed geometry while retaining the legacy-only constructor path. @param format - Original frame owner. @param geometry - Current native geometry or absent legacy record. @returns Nothing. */
export function restoreTableGeometry(
  format: SwFrameFormat,
  geometry: WriterTableGeometryRecord | undefined,
): void {
  if (geometry === undefined) return;
  if (geometry === null || typeof geometry !== "object" || Array.isArray(geometry))
    throw new Error("Stored Writer native table geometry is invalid.");
  const size = geometry.frameSize === undefined ? undefined : decodeFrameSize(geometry.frameSize),
    orient = decodeHoriOrient(geometry.horiOrient);
  format.ResetFormatAttr(RES_FRM_SIZE);
  format.ResetFormatAttr(RES_HORI_ORIENT);
  if (size !== undefined) format.SetFormatAttr(size);
  if (orient !== undefined) format.SetFormatAttr(orient);
}

/** Validates all four original horizontal item fields before allocating the native item. @param value - Optional primitive record. @returns Complete detached native item or direct absence. */
function decodeHoriOrient(
  value: WriterHoriOrientRecord | undefined,
): SwFormatHoriOrient | undefined {
  if (value === undefined) return undefined;
  if (
    value === null ||
    typeof value !== "object" ||
    [value.position, value.orientation, value.relation].some(
      /** Rejects nonnumeric native fields at the graph boundary. @param field - Candidate. @returns Whether invalid. */
      (field) => typeof field !== "number" || !Number.isFinite(field),
    ) ||
    !Number.isSafeInteger(value.position) ||
    !Number.isInteger(value.orientation) ||
    value.orientation < -32768 ||
    value.orientation > 32767 ||
    !Number.isInteger(value.relation) ||
    value.relation < -32768 ||
    value.relation > 32767 ||
    typeof value.toggle !== "boolean"
  )
    throw new Error("Stored Writer horizontal orientation is invalid.");
  return new SwFormatHoriOrient(value.position, value.orientation, value.relation, value.toggle);
}

/** Row boundary record, including prior v16 minimum-height ingress. */
export type WriterRowFormatRecord = Omit<SwTableLineFormatValue, "frameSize" | "rowSplit"> & {
  readonly frameSize?: WriterFrameSizeRecord | undefined;
  readonly minHeight?: number | undefined;
  readonly rowSplit?: boolean | undefined;
  /** Prior primitive inverse row flag, accepted only at snapshot ingestion. */
  readonly keepTogether?: boolean | undefined;
};
/** Encodes public native values without transferring a class prototype. @param value - Original row format. @returns Primitive row record. */
export function encodeRowFormat(value: SwTableLineFormatValue): WriterRowFormatRecord {
  const { frameSize, rowSplit, ...format } = value;
  return {
    ...format,
    rowSplit: rowSplit?.GetValue(),
    frameSize: encodeFrameSize(frameSize),
  };
}
/** Restores the complete native item at the existing graph boundary. @param value - Primitive row record. @returns Native row format. */
export function decodeRowFormat(value: WriterRowFormatRecord): SwTableLineFormatValue {
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
