/**
 * @fileoverview Worker transfer codec for the bounded SfxPoolItem graph.
 * Core items expose values and equality only; JSON type discrimination lives here.
 */
import { encodeFillItem, decodeFillItem } from "../../../../svx/browser/fill-item-codec";
import {
  encodeComplexColor,
  decodeComplexColor,
} from "../../../../docmodel/browser/complex-color-codec";
import { Color, ColorTransparency } from "../../../../tools/inc/color";
import { SwFormatPageDesc } from "../../../source/core/attr/fmtpdsc";
import { encodeWriterFrameItem, decodeWriterFrameItem } from "./writer-frame-item-codec";
import { SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import { encodeNativeBoxItem, decodeNativeBoxItem } from "./writer-box-item-codec";
import { encodePageDesc, decodePageDesc } from "./page-desc-codec";
import { SvxColorItem } from "../../../../editeng/inc/colritem";
import { ComplexColor } from "../../../../docmodel/inc/color/ComplexColor";
import { SvxBrushItem } from "../../../../editeng/source/items/frmitems.brush";
import { COL_TRANSPARENT } from "../../../../tools/inc/color";
import { ShadingPattern } from "../../../../offapi/com/sun/star/drawing/ShadingPattern";
import { SvxEscapementItem } from "../../../../editeng/inc/escapementitem";

import {
  encodeTextLineItem,
  decodeTextLineItem,
} from "../../../../editeng/browser/text-line-item-codec";
import { SvxUnderlineItem } from "../../../../editeng/source/items/textitem";
import { SvxAdjustItem } from "../../../../editeng/inc/adjustitem";
import { MID_SHADING_VALUE, MID_EXPAND_SINGLE } from "../../../../editeng/inc/memberids";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { Any2Bool } from "../../../../svl/inc/poolitem";
import { SvxTabStopItem } from "../../../../editeng/inc/tstpitem";
import { SvxLineSpacingItem } from "../../../../editeng/inc/lspcitem";

import type { SfxItemPool } from "../../../../svl/source/items/itempool";
import { SwAutoStyleFamily } from "../../../inc/istyleaccess";
import { releaseStyleHandle } from "../../../../svl/source/items/stylepool";
import { SwAttrPool } from "../../../source/core/attr/swatrset";
import { SwFormatAutoFormat } from "../../../source/core/txtnode/txatbase";
import { SwFormatCharFormat } from "../../../source/core/txtnode/fmtatr2";
import {
  encodeCharacterStyleReference,
  decodeCharacterStyleReference,
} from "./writer-character-style-codec";
import {
  RES_TXTATR_AUTOFMT,
  RES_PARATR_LIST_AUTOFMT,
  RES_TXTATR_CHARFMT,
  WRITER_CHARACTER_WHICH_RANGES,
} from "../../../inc/hintids";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxUnoAnyItem } from "../../../../sfx2/source/view/frame";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import {
  SvxRightMarginItem,
  SvxFirstLineIndentItem,
  SvxTextLeftMarginItem,
} from "../../../../editeng/inc/lrspitem";
import { MeasureUnit } from "../../../../offapi/com/sun/star/util/MeasureUnit";
import { type SfxPoolItem, type SfxPoolItemSnapshot } from "../../../../svl/source/items/poolitem";
import { SwFormatINetFormat, type WriterHyperlink } from "../../../source/core/txtnode/fmtatr2";
import { RES_TXTATR_INETFMT } from "../../../inc/hintids";
import { SwPoolFormatId } from "../../../inc/poolfmt";
/** Browser-owned internet value record; omitted native IDs retain the existing ZERO contract. */
export interface WriterInternetFormatRecord extends WriterHyperlink {
  readonly inetFormatId?: number;
  readonly visitedFormatId?: number;
}

/** Encodes native internet strings and independent style identities without retaining an item backlink. @param item - Native internet item. @returns Cloneable value record. */
export function encodeSwFormatINetFormatRecord(
  item: SwFormatINetFormat,
): WriterInternetFormatRecord {
  const normal = item.GetINetFormatId(),
    visited = item.GetVisitedFormatId();
  return {
    ...item.GetHyperlink(),
    ...(normal === SwPoolFormatId.ZERO ? {} : { inetFormatId: normal }),
    ...(visited === SwPoolFormatId.ZERO ? {} : { visitedFormatId: visited }),
  };
}

/** Restores the supported native internet fields at a browser boundary. @param candidate - Untrusted cloneable record. @returns Detached native item. */
export function decodeSwFormatINetFormatRecord(candidate: unknown): SwFormatINetFormat {
  if (typeof candidate !== "object" || candidate === null || Array.isArray(candidate))
    throw new Error("SwFormatINetFormat snapshot is invalid.");
  const value = candidate as Record<string, unknown>;
  if (typeof value.url !== "string") throw new Error("SwFormatINetFormat snapshot is invalid.");
  const normal = decodeInternetStyleId(value.inetFormatId),
    visited = decodeInternetStyleId(value.visitedFormatId);
  const item = new SwFormatINetFormat(
    value.url,
    typeof value.targetFrame === "string" ? value.targetFrame : "",
  );
  item.SetName(typeof value.name === "string" ? value.name : "");
  item.SetINetFormatAndId(typeof value.styleName === "string" ? value.styleName : "", normal);
  item.SetVisitedFormatAndId(
    typeof value.visitedStyleName === "string" ? value.visitedStyleName : "",
    visited,
  );
  return item;
}

/** Validates a provided native unsigned16 identity while retaining omitted ZERO values. @param candidate - Optional persisted ID. @returns Native pool identity. */
function decodeInternetStyleId(candidate: unknown): SwPoolFormatId {
  if (candidate === undefined) return SwPoolFormatId.ZERO;
  if (
    typeof candidate !== "number" ||
    !Number.isInteger(candidate) ||
    candidate < 0 ||
    candidate > 65535
  )
    throw new Error("SwFormatINetFormat snapshot is invalid.");
  return candidate as SwPoolFormatId;
}

/** Browser snapshot of the explicit native tab fields, distinct from UNO transport. */
export type TabStopItemSnapshot = Omit<SfxPoolItemSnapshot, "value"> & {
  readonly value: {
    readonly defaultDistance: number;
    readonly stops: readonly {
      readonly position: number;
      readonly adjustment: number;
      readonly decimal: string;
      readonly fill: string;
    }[];
  };
};
/** Native paragraph state carried by the existing Writer snapshot boundary. */
export type AdjustItemValue = {
  readonly adjust: number;
  readonly lastLine: number;
  readonly expandSingle: boolean;
  readonly paragraphComposer: boolean;
  readonly wordSpacing: number;
  readonly wordSpacingMinimum: number;
  readonly wordSpacingMaximum: number;
  readonly letterSpacingMinimum: number;
  readonly letterSpacingMaximum: number;
  readonly scaleWidthMinimum: number;
  readonly scaleWidthMaximum: number;
};
/** Concrete adjustment browser record. */
export type AdjustItemSnapshot = Omit<SfxPoolItemSnapshot, "value"> & {
  readonly value: AdjustItemValue;
};
/** Encodes all reachable native adjustment fields outside core. @param item - Native item. @returns Typed browser record. */
export function encodeSfxPoolItem(item: SvxAdjustItem): AdjustItemSnapshot;
/** Encodes concrete tab values at the browser boundary. @param item - Tab item. @returns Typed browser record. */
export function encodeSfxPoolItem(item: SvxTabStopItem): TabStopItemSnapshot;
/** Encodes any supported pooled item at the browser boundary. @param item - Core item. @returns Browser record. */
export function encodeSfxPoolItem(item: SfxPoolItem): SfxPoolItemSnapshot;

/** Encodes one pooled item without adding persistence methods to the model class. @param item - Core item. @returns JSON record. */
export function encodeSfxPoolItem(item: SfxPoolItem): SfxPoolItemSnapshot {
  if (item instanceof SwFormatAutoFormat) {
    const handle = item.GetStyleHandle();
    return {
      which: item.Which(),
      value: {
        kind: "writer-auto-format",
        ...(handle
          ? {
              items: encodeSfxItemSet(handle).map(
                /** Plain records belong to the browser transfer boundary. @param item - Native encoded item. @returns Recursive cloneable record. */ (
                  item,
                ) => ({ which: item.which, value: item.value }),
              ),
            }
          : {}),
      },
    };
  }
  if (item instanceof SwFormatCharFormat) {
    const style = item.GetCharFormat();
    const index = style ? encodeCharacterStyleReference(style.GetDoc(), style) : undefined;
    return {
      which: item.Which(),
      value: { kind: "writer-char-format", ...(index === undefined ? {} : { index }) },
    };
  }
  if (item instanceof SvxBoxItem) {
    const native = encodeNativeBoxItem(item);
    // SfxPoolItem values deliberately exclude null; absent native edges are
    // omitted here while the independent table-box record keeps its old shape.
    const lines: Record<string, Exclude<(typeof native.lines)[number], null>> = {};
    for (const [edge, line] of native.lines.entries())
      if (line !== null) lines[String(edge)] = line;
    const value = { kind: "svx-box", ...native, lines };
    if (!isSfxPoolItemValue(value)) throw new Error("SvxBoxItem is not persistence-safe.");
    return { which: item.Which(), value };
  }
  const fill = encodeFillItem(item);
  if (fill !== null) return fill;
  const frame = encodeWriterFrameItem(item);
  if (frame !== null) return frame;
  if (item instanceof SwFormatPageDesc) return encodePageDesc(item);
  if (item instanceof SfxUnoAnyItem)
    throw new Error("SfxUnoAnyItem is a request argument and cannot be persisted.");
  if (item instanceof SvxColorItem) {
    const complex = item.getComplexColor(),
      empty = new ComplexColor();
    // Source equality omits usage/final fields;checking it alone could lose native state.
    if (
      !complex.equals(empty) ||
      complex.getThemeColorUsage() !== empty.getThemeColorUsage() ||
      !complex.getFinalColor().equals(empty.getFinalColor())
    )
      return {
        which: item.Which(),
        value: {
          kind: "svx-color",
          color: item.GetValue().toUInt32(),
          complex: encodeComplexColor(complex),
        },
      };
    return { which: item.Which(), value: item.GetValue().toUInt32() };
  }
  if (item instanceof SvxBrushItem) {
    const complex = item.getComplexColor(),
      empty = new ComplexColor();
    empty.setFinalColor(item.GetColor());
    if (!item.GetFiltColor().equals(COL_TRANSPARENT))
      throw new Error("Writer graphic filter color transfer is not implemented.");
    if (
      !complex.equals(empty) ||
      complex.getThemeColorUsage() !== empty.getThemeColorUsage() ||
      item.GetShadingValue() !== ShadingPattern.CLEAR ||
      item.getGraphicTransparency() !== 0
    )
      return {
        which: item.Which(),
        value: {
          kind: "svx-brush",
          color: item.GetColor().toUInt32(),
          complex: encodeComplexColor(complex),
          shading: item.GetShadingValue(),
          graphicTransparency: item.getGraphicTransparency(),
        },
      };
    return { which: item.Which(), value: item.GetColor().toUInt32() };
  }
  if (item instanceof SvxUnderlineItem) return encodeTextLineItem(item);
  if (item instanceof SvxEscapementItem)
    return {
      which: item.Which(),
      value: { offset: item.GetEsc(), height: item.GetProportionalHeight() },
    };

  const value =
    item instanceof SvxAdjustItem
      ? encodeAdjustment(item)
      : item instanceof SvxTabStopItem
        ? {
            defaultDistance: item.GetDefaultDistance(),
            stops: Array.from(
              { length: item.Count() },
              /** Encodes the native scalar fields only at this browser boundary. @param unused - Empty array slot. @param index - Native index. @returns Cloneable record. */
              (unused, index) => {
                void unused;
                const stop = item.At(index);
                return {
                  position: stop.GetTabPos(),
                  adjustment: stop.GetAdjustment(),
                  decimal: stop.GetDecimal(),
                  fill: stop.GetFill(),
                };
              },
            ),
          }
        : item instanceof SvxLineSpacingItem
          ? {
              nInterLineSpace: item.GetInterLineSpace(),
              nLineHeight: item.GetLineHeight(),
              nPropLineSpace: item.GetPropLineSpace(),
              eLineSpaceRule: item.GetLineSpaceRule(),
              eInterLineSpaceRule: item.GetInterLineSpaceRule(),
            }
          : item instanceof SvxULSpaceItem
            ? encodeULSpaceValue(item)
            : item instanceof SvxTextLeftMarginItem
              ? encodeLegacyTextLeftMarginValue(item)
              : item instanceof SvxRightMarginItem
                ? encodeLegacyRightMarginValue(item)
                : item instanceof SvxFirstLineIndentItem
                  ? encodeLegacyFirstLineValue(item)
                  : item instanceof SwFormatINetFormat
                    ? JSON.stringify(encodeSwFormatINetFormatRecord(item))
                    : item.QueryValue();
  if (!isSfxPoolItemValue(value)) throw new Error("SfxPoolItem is not persistence-safe.");
  return {
    value,
    which: item.Which(),
  };
}

/** Narrows values supported by the browser/filter persistence record. @param value - Candidate item value. @returns Whether JSON-safe. */
function isSfxPoolItemValue(value: unknown): value is SfxPoolItemSnapshot["value"] {
  return (
    typeof value === "boolean" ||
    (typeof value === "number" && Number.isFinite(value)) ||
    typeof value === "string" ||
    (Array.isArray(value) && value.every(isSfxPoolItemValue)) ||
    (typeof value === "object" &&
      value !== null &&
      Object.getPrototypeOf(value) === Object.prototype &&
      Object.values(value).every(isSfxPoolItemValue))
  );
}

/** Encodes direct deltas in ascending WhichId order. @param set - Core item set. @returns JSON records. */
export function encodeSfxItemSet(set: SfxItemSet): readonly SfxPoolItemSnapshot[] {
  return set.entries().map(encodeSfxPoolItem);
}

/** Restores one item via the document pool's registered concrete factory. @param pool - Destination pool. @param snapshot - Current-schema record. @returns Core item. */
export function decodeSfxPoolItem(pool: SfxItemPool, snapshot: SfxPoolItemSnapshot): SfxPoolItem {
  if (snapshot.which === RES_TXTATR_AUTOFMT || snapshot.which === RES_PARATR_LIST_AUTOFMT) {
    const value = snapshot.value;
    if (
      typeof value !== "object" ||
      value === null ||
      Array.isArray(value) ||
      !("kind" in value) ||
      value.kind !== "writer-auto-format"
    )
      throw new Error("Writer automatic format snapshot is invalid.");
    const item = new SwFormatAutoFormat(snapshot.which);
    if ("items" in value) {
      if (!Array.isArray(value.items)) throw new Error("Writer automatic style items are invalid.");
      const set = new SfxItemSet(pool, [
        ...WRITER_CHARACTER_WHICH_RANGES,
        [RES_TXTATR_CHARFMT, RES_TXTATR_CHARFMT],
      ]);
      try {
        decodeSfxItemSet(set, value.items as readonly SfxPoolItemSnapshot[]);
        if (pool instanceof SwAttrPool) {
          const handle = pool
            .GetDoc()
            .GetIStyleAccess()
            .getAutomaticStyle(set, SwAutoStyleFamily.AUTO_STYLE_CHAR);
          try {
            item.SetStyleHandle(handle);
          } finally {
            releaseStyleHandle(handle);
            set.Dispose();
          }
        } else item.SetStyleHandle(set);
        return item;
      } catch (error) {
        set.Dispose();
        item.Dispose();
        throw error;
      }
    }
    return item;
  }
  if (snapshot.which === RES_TXTATR_CHARFMT) {
    const value = snapshot.value;
    if (
      typeof value !== "object" ||
      value === null ||
      Array.isArray(value) ||
      !("kind" in value) ||
      value.kind !== "writer-char-format"
    )
      throw new Error("Writer character format snapshot is invalid.");
    if (!("index" in value)) return new SwFormatCharFormat();
    if (!(pool instanceof SwAttrPool) || typeof value.index !== "number")
      throw new Error("Writer character style owner is invalid.");
    return new SwFormatCharFormat(decodeCharacterStyleReference(pool.GetDoc(), value.index));
  }
  const box = snapshot.value;
  if (
    typeof box === "object" &&
    box !== null &&
    !Array.isArray(box) &&
    "kind" in box &&
    box.kind === "svx-box"
  ) {
    if (
      !("which" in box) ||
      box.which !== snapshot.which ||
      !(pool.GetPoolDefaultItem(snapshot.which) instanceof SvxBoxItem)
    )
      throw new Error("Native box Which is invalid.");
    const lines = "lines" in box ? box.lines : undefined;
    if (
      typeof lines !== "object" ||
      lines === null ||
      Array.isArray(lines) ||
      Object.getPrototypeOf(lines) !== Object.prototype ||
      Object.entries(lines).some(
        /** Rejects non-native edges and malformed present values. @param entry - Wire edge/value. @returns Whether invalid. */
        ([edge, line]) =>
          !/^[0-3]$/.test(edge) || typeof line !== "object" || line === null || Array.isArray(line),
      )
    )
      throw new Error("Native box edges are invalid.");
    const edges = lines as Record<string, unknown>;
    return decodeNativeBoxItem({
      ...box,
      lines: [0, 1, 2, 3].map(
        /** Restores only the fixed native optional-pointer slots. @param edge - Side. @returns Native line record or absent marker. */
        (edge) => (Object.hasOwn(edges, String(edge)) ? edges[String(edge)] : null),
      ),
    });
  }
  const fill = decodeFillItem(snapshot);
  if (fill !== null) return fill;
  const color = decodeNativeColorItem(pool, snapshot);
  if (color !== null) return color;
  const frame = decodeWriterFrameItem(snapshot);
  if (frame !== null) return frame;
  return (
    decodePageDesc(snapshot) ?? decodeTextLineItem(pool, snapshot) ?? pool.CreateItem(snapshot)
  );
}

/** Restores direct deltas into an existing set. @param set - Destination set. @param snapshots - Current-schema records. @returns Nothing. */
export function decodeSfxItemSet(set: SfxItemSet, snapshots: readonly SfxPoolItemSnapshot[]): void {
  for (const snapshot of snapshots) set.Put(decodeSfxPoolItem(set.GetPool(), snapshot));
}

/** Decodes the Writer hyperlink item at the browser persistence boundary. @param snapshot - Stored item. @returns Hyperlink item. */
export function decodeSwFormatINetFormat(snapshot: SfxPoolItemSnapshot): SwFormatINetFormat {
  if (snapshot.which !== RES_TXTATR_INETFMT || typeof snapshot.value !== "string")
    throw new Error("SwFormatINetFormat snapshot is invalid.");
  let parsed: unknown;
  try {
    parsed = JSON.parse(snapshot.value);
  } catch {
    throw new Error("SwFormatINetFormat snapshot is invalid.");
  }
  return decodeSwFormatINetFormatRecord(parsed);
}

/** Writes native UL fields only at the browser tuple boundary; old default-proportion payloads stay compatible. @param item - Original native item. @returns Complete primitive spacing value. */
function encodeULSpaceValue(item: SvxULSpaceItem): readonly number[] {
  const upper = item.GetUpper(),
    lower = item.GetLower(),
    context = item.GetContext();
  if (item.GetPropUpper() !== 100 || item.GetPropLower() !== 100)
    return [upper, lower, context ? 1 : 0, item.GetPropUpper(), item.GetPropLower()];
  return context ? [upper, lower, 1] : [upper, lower];
}

/** Preserves the existing scalar wire domain without silently flattening new native units/proportions. @param item - Original native item. @returns Existing integer TWIP scalar. */
function encodeLegacyRightMarginValue(item: SvxRightMarginItem): number {
  const value = item.GetRight();
  if (
    value.m_nUnit !== MeasureUnit.TWIP ||
    item.GetPropRight() !== 100 ||
    !Number.isInteger(value.m_dValue)
  )
    throw new Error("SvxRightMarginItem is not persistence-safe.");
  return value.m_dValue;
}

/** Preserves existing integer/automatic records without flattening native units or proportions. @param item - Original native item. @returns Legacy scalar or automatic tuple. */
function encodeLegacyFirstLineValue(item: SvxFirstLineIndentItem): number | readonly [number, 1] {
  const value = item.GetTextFirstLineOffset();
  if (
    value.m_nUnit !== MeasureUnit.TWIP ||
    item.GetPropTextFirstLineOffset() !== 100 ||
    !Number.isInteger(value.m_dValue)
  )
    throw new Error("SvxFirstLineIndentItem is not persistence-safe.");
  return item.IsAutoFirst() ? [value.m_dValue, 1] : value.m_dValue;
}

/** Preserves existing scalar wire values without flattening native text-left unit or percentage state. @param item - Original native paragraph item. @returns Integer TWIP scalar. */
function encodeLegacyTextLeftMarginValue(item: SvxTextLeftMarginItem): number {
  const value = item.GetTextLeft();
  if (
    value.m_nUnit !== MeasureUnit.TWIP ||
    item.GetPropLeft() !== 100 ||
    !Number.isInteger(value.m_dValue)
  )
    throw new Error("SvxTextLeftMarginItem is not persistence-safe.");
  return value.m_dValue;
}

/** Projects full native state without losing a single-word flag hidden by the primary mode. @param item - Actual native item. @returns Browser value. */
function encodeAdjustment(item: SvxAdjustItem): AdjustItemValue {
  const single = new Any();
  item.QueryValue(single, MID_EXPAND_SINGLE);
  const expandSingle = Any2Bool(single);
  single.dispose();
  return {
    adjust: item.GetAdjust(),
    lastLine: item.GetLastBlock(),
    expandSingle,
    paragraphComposer: item.GetParagraphComposer(),
    wordSpacing: item.GetPropWordSpacing(),
    wordSpacingMinimum: item.GetPropWordSpacingMinimum(),
    wordSpacingMaximum: item.GetPropWordSpacingMaximum(),
    letterSpacingMinimum: item.GetPropLetterSpacingMinimum(),
    letterSpacingMaximum: item.GetPropLetterSpacingMaximum(),
    scaleWidthMinimum: item.GetPropScaleWidthMinimum(),
    scaleWidthMaximum: item.GetPropScaleWidthMaximum(),
  };
}

/** Restores full native color/brush values while retaining the existing scalar records. @param pool - Actual destination pool. @param snapshot - Untrusted record. @returns Actual item or null for other records. */
function decodeNativeColorItem(
  pool: SfxItemPool,
  snapshot: SfxPoolItemSnapshot,
): SfxPoolItem | null {
  if (
    snapshot.value === null ||
    typeof snapshot.value !== "object" ||
    Array.isArray(snapshot.value)
  )
    return null;
  const value = snapshot.value as Record<string, unknown>;
  if (value.kind !== "svx-color" && value.kind !== "svx-brush") return null;
  if (
    typeof value.color !== "number" ||
    !Number.isInteger(value.color) ||
    value.color < 0 ||
    value.color > 0xffffffff
  )
    throw new Error("Native color record is invalid.");
  const color = new Color(ColorTransparency, value.color, "ColorTransparencyTag"),
    complex = decodeComplexColor(value.complex),
    original = pool.GetPoolDefaultItem(snapshot.which);
  if (value.kind === "svx-color") {
    if (!(original instanceof SvxColorItem)) throw new Error("Native color Which is invalid.");
    return new SvxColorItem(color, complex, snapshot.which);
  }
  if (
    !(original instanceof SvxBrushItem) ||
    typeof value.shading !== "number" ||
    !Number.isInteger(value.shading) ||
    value.shading < -2147483648 ||
    value.shading > 2147483647 ||
    typeof value.graphicTransparency !== "number" ||
    !Number.isInteger(value.graphicTransparency) ||
    value.graphicTransparency < -128 ||
    value.graphicTransparency > 127
  )
    throw new Error("Native brush record is invalid.");
  const item = new SvxBrushItem(color, complex, snapshot.which);
  const shading = new Any([value.shading], "sal_Int32");
  try {
    item.PutValue(shading, MID_SHADING_VALUE);
  } finally {
    shading.dispose();
  }
  item.setGraphicTransparency(value.graphicTransparency);
  return item;
}
