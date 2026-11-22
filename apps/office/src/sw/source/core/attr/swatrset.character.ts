/** @fileoverview Concrete Writer item-pool factories for character formatting used by the browser Worker graph. */
import { SvxNoHyphenItem } from "../../../../editeng/inc/nhypitem";
import { SvxOpticalSizingItem } from "../../../../editeng/inc/opticalsizingitem";
import { SvxEmphasisMarkItem } from "../../../../editeng/inc/emphasismarkitem";
import { SvxCaseMapItem } from "../../../../editeng/source/items/textitem.modes";
import {
  SvxBlinkItem,
  SvxCharRotateItem,
  SvxTwoLinesItem,
} from "../../../../editeng/source/items/textitem.layout";
import { SvxCharScaleWidthItem } from "../../../../editeng/source/items/textitem.spacing";
import { SvxBrushItem } from "../../../../editeng/source/items/frmitems.brush";
import {
  SvxCharReliefItem,
  SvxContourItem,
  SvxOverlineItem,
  SvxShadowedItem,
} from "../../../../editeng/source/items/textitem";
import { SvxCharHiddenItem } from "../../../../editeng/source/items/charhiddenitem";
import type { SfxPoolItemFactory } from "../../../../svl/source/items/itempool";
import * as Which from "../../../inc/hintids";
import { writerColorFromPrimitive } from "./swatrset.paragraph";

/** Restores signed tenths of a degree and the independent fit flag. @param value - Worker value. @returns Concrete rotation item. */
function restoreRotation(value: unknown): SvxCharRotateItem {
  if (
    typeof value !== "object" ||
    value === null ||
    !("angle" in value) ||
    typeof value.angle !== "number" ||
    !Number.isInteger(value.angle) ||
    value.angle < -32768 ||
    value.angle > 32767 ||
    !("fitToLine" in value) ||
    typeof value.fitToLine !== "boolean"
  )
    throw new Error("Invalid Writer character rotation.");
  return new SvxCharRotateItem(value.angle, value.fitToLine, Which.RES_CHRATR_ROTATE);
}

/** Restores the three independent fields of the native two-line item. @param value - Stored item payload. @returns Concrete item. */
function restoreTwoLines(value: unknown): SvxTwoLinesItem {
  if (
    typeof value !== "object" ||
    value === null ||
    !("enabled" in value) ||
    typeof value.enabled !== "boolean" ||
    !("start" in value) ||
    typeof value.start !== "number" ||
    !Number.isInteger(value.start) ||
    value.start < 0 ||
    value.start > 0xffff ||
    !("end" in value) ||
    typeof value.end !== "number" ||
    !Number.isInteger(value.end) ||
    value.end < 0 ||
    value.end > 0xffff
  )
    throw new Error("Invalid Writer double-lined character item.");
  return new SvxTwoLinesItem(value.enabled, value.start, value.end, Which.RES_CHRATR_TWO_LINES);
}

/** Selects a concrete character item factory for a represented native WhichId. @param which - Pool identity. @returns Factory when the Worker transports that item. */
export function writerCharacterItemFactory(which: number): SfxPoolItemFactory | undefined {
  switch (which) {
    case Which.RES_CHRATR_BACKGROUND:
      return /** Restores the native character background. @param value - Stored value. @returns Brush. */ (
        value,
      ) => new SvxBrushItem(writerColorFromPrimitive(value, "transparent"), which);
    case Which.RES_CHRATR_CASEMAP:
      return /** Restores the native case map. @param value - Stored value. @returns Case item. */ (
        value,
      ) => new SvxCaseMapItem(Number(value), which);
    case Which.RES_CHRATR_BLINK:
      return (value) => new SvxBlinkItem(Boolean(value), which);
    case Which.RES_CHRATR_HIDDEN:
      return (value) => new SvxCharHiddenItem(Boolean(value), which);
    case Which.RES_CHRATR_CONTOUR:
      return /** Restores the native outline. @param value - Stored value. @returns Contour item. */ (
        value,
      ) => new SvxContourItem(Boolean(value), which);
    case Which.RES_CHRATR_SHADOWED:
      return /** Restores the native shadow. @param value - Stored value. @returns Shadow item. */ (
        value,
      ) => new SvxShadowedItem(Boolean(value), which);
    case Which.RES_CHRATR_EMPHASIS_MARK:
      return /** Restores native emphasis flags. @param value - Stored unsigned short. @returns Emphasis item. */ (
        value,
      ) => {
        if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 0xffff)
          throw new Error("Invalid Writer emphasis mark.");
        return new SvxEmphasisMarkItem(value, which);
      };
    case Which.RES_CHRATR_RELIEF:
      return /** Restores the native relief. @param value - Stored value. @returns Relief item. */ (
        value,
      ) => new SvxCharReliefItem(Number(value), which);
    case Which.RES_CHRATR_NOHYPHEN:
      return /** Restores the native hyphenation exclusion flag. @param value - Stored boolean. @returns Hyphenation item. */ (
        value,
      ) => {
        if (typeof value !== "boolean") throw new Error("Invalid Writer character hyphenation.");
        return new SvxNoHyphenItem(value, which);
      };
    case Which.RES_CHRATR_OPTICAL_SIZING:
      return /** Restores the native optical sizing flag. @param value - Stored boolean. @returns Optical sizing item. */ (
        value,
      ) => {
        if (typeof value !== "boolean") throw new Error("Invalid Writer character optical sizing.");
        return new SvxOpticalSizingItem(value, which);
      };
    case Which.RES_CHRATR_SCALEW:
      return /** Restores the native character scale. @param value - Stored value. @returns Scale item. */ (
        value,
      ) => new SvxCharScaleWidthItem(Number(value), which);
    case Which.RES_CHRATR_OVERLINE:
      return /** Restores the native line style. @param value - Stored value. @returns Overline item. */ (
        value,
      ) => new SvxOverlineItem(Number(value), which);
    case Which.RES_CHRATR_TWO_LINES:
      return restoreTwoLines;
    case Which.RES_CHRATR_ROTATE:
      return restoreRotation;
    default:
      return undefined;
  }
}
