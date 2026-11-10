/** @fileoverview Transports complete native Writer frame-size values across browser storage boundaries. */
import {
  encodeFrameSize,
  decodeFrameSize,
  type WriterFrameSizeRecord,
} from "./writer-frame-item-codec";
export {
  encodeFrameSize,
  decodeFrameSize,
  type WriterFrameSizeRecord,
} from "./writer-frame-item-codec";
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
  RES_FRAMEDIR,
  RES_BACKGROUND,
} from "../../../inc/hintids";
import type { SfxPoolItemSnapshot } from "../../../../svl/source/items/poolitem";
import { decodeSfxPoolItem, encodeSfxPoolItem } from "./item-codec";
/** Direct native spacing presence, independently versioned from older geometry records. */
export interface WriterTableSpacingRecord {
  readonly upperLower?: SfxPoolItemSnapshot | undefined;
}
/** Direct native flow, border and direction presence, independent of older geometry and spacing records. */
export interface WriterTableFlowRecord {
  readonly layoutSplit?: SfxPoolItemSnapshot | undefined;
  readonly collapsingBorders?: SfxPoolItemSnapshot | undefined;
  readonly frameDirection?: SfxPoolItemSnapshot | undefined;
  readonly background?: SfxPoolItemSnapshot | undefined;
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
      frameDirection: encodeFrameDirection(table.GetFrameFormat()),
      background: encodeFrameBackground(table.GetFrameFormat()),
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

/** Restores direct table flow items after validating the complete record, retaining legacy marker absence. @param format - Native frame owner. @param flow - Current native record or older absent marker. @returns Nothing. */
export function restoreTableFlow(
  format: SwFrameFormat,
  flow: WriterTableFlowRecord | undefined,
): void {
  if (flow === undefined) return;
  if (flow === null || typeof flow !== "object" || Array.isArray(flow))
    throw new Error("Stored Writer native table flow is invalid.");
  const split = decodeTableBoolItem(format, flow.layoutSplit, RES_LAYOUT_SPLIT),
    borders = decodeTableBoolItem(format, flow.collapsingBorders, RES_COLLAPSING_BORDERS),
    direction = decodeFrameDirection(format, flow.frameDirection);
  format.ResetFormatAttr(RES_LAYOUT_SPLIT);
  format.ResetFormatAttr(RES_COLLAPSING_BORDERS);
  format.ResetFormatAttr(RES_FRAMEDIR);
  if (split !== undefined) format.SetFormatAttr(split);
  if (borders !== undefined) format.SetFormatAttr(borders);
  if (direction !== undefined) format.SetFormatAttr(direction);
  restoreFrameBackground(format, flow.background);
}

/** Encodes a directly set native frame brush. @param format - Native frame owner. @returns Full brush snapshot or absence. */
export function encodeFrameBackground(format: SwFrameFormat): SfxPoolItemSnapshot | undefined {
  const item = format.GetAttrSet().GetItemIfSet(RES_BACKGROUND, false);
  return item === undefined ? undefined : encodeSfxPoolItem(item);
}

/** Restores the native brush using the existing packed-color item codec. @param format - Native frame owner. @param snapshot - Optional direct brush. @returns Nothing. */
export function restoreFrameBackground(
  format: SwFrameFormat,
  snapshot: SfxPoolItemSnapshot | undefined,
): void {
  if (snapshot === undefined) return;
  if (
    snapshot === null ||
    typeof snapshot !== "object" ||
    Array.isArray(snapshot) ||
    snapshot.which !== RES_BACKGROUND
  )
    throw new Error("Stored Writer native frame background is invalid.");
  const item = decodeSfxPoolItem(format.GetAttrSet().GetPool(), snapshot);
  try {
    format.SetFormatAttr(item);
  } finally {
    item.Dispose();
  }
}

/** Serializes the actual direct direction item of a table or cell. @param format - Native format. @returns Existing pool snapshot or absent. */
export function encodeFrameDirection(format: SwFrameFormat): SfxPoolItemSnapshot | undefined {
  const item = format.GetAttrSet().GetItemIfSet(RES_FRAMEDIR, false);
  return item === undefined ? undefined : encodeSfxPoolItem(item);
}

/** Decodes the typed item via the actual registered pool factory. @param format - Native format. @param snapshot - Candidate record. @returns Typed original item or absent. */
export function decodeFrameDirection(
  format: SwFrameFormat,
  snapshot: SfxPoolItemSnapshot | undefined,
) {
  if (snapshot === undefined) return undefined;
  if (
    snapshot === null ||
    typeof snapshot !== "object" ||
    Array.isArray(snapshot) ||
    snapshot.which !== RES_FRAMEDIR
  )
    throw new Error("Stored Writer native frame direction is invalid.");
  return format.GetAttrSet().GetPool().CreateItem(snapshot);
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
