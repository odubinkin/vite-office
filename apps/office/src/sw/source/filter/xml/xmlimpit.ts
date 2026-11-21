/** @fileoverview Writer filter item-mapping boundary corresponding to xmlimpit.cxx. Existing browser-shaped border properties are mapped here; shared xmloff handlers own published UNO values only. Full native item mapper/Any pipeline remains unported. */
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { SvxShadowItem } from "../../../../editeng/source/items/frmitems.shadow";
import { cppu_detail_getUnoType_ShadowFormat as shadowType } from "../../../../offapi/com/sun/star/table/ShadowFormat";
import type { SwPageDesc } from "../../core/layout/pagedesc";
import type { OdfPageLayout } from "../../../../xmloff/source/style/xmlstyle";
import { SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import { SvxBrushItem } from "../../../../editeng/source/items/frmitems.brush";
import { MID_BACK_COLOR_TRANSPARENCY } from "../../../../editeng/inc/memberids";
import { COL_TRANSPARENT, Color } from "../../../../tools/inc/color";
import {
  setGraphicBrushFill,
  setSvxBrushItemAsFillAttributesToTargetSet,
} from "../../../../svx/source/unodraw/unobrushitemhelper";
import type { XMLTextFrameStyle } from "../../../../xmloff/source/text/XMLTextFrameContext";
import { SvxFrameDirectionItem } from "../../../../editeng/inc/frmdiritem";
import { SvxFrameDirection } from "../../../../editeng/inc/frmdir";
import type { OdfTableVisualProperties } from "../../../../xmloff/source/table/XMLTableImport";
import { RES_BACKGROUND, RES_FRAMEDIR, RES_BOX, RES_SHADOW } from "../../../inc/hintids";
import { writerColorFromPrimitive } from "../../core/attr/swatrset";
import type { SwFrameFormat } from "../../core/layout/atrfrm";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { XATTR_FILL_FIRST, XATTR_FILL_LAST } from "../../../../svx/inc/xdef";
import { XFillStyleItem } from "../../../../svx/inc/xfillit0";
import { XFillColorItem } from "../../../../svx/inc/xflclit";
import { XFillTransparenceItem } from "../../../../svx/inc/xfltrit";
import {
  bitmapGeometryWhich,
  bitmapSizeToTwips,
  createBitmapGeometryItem,
  isBitmapSize,
  setBitmapMode,
  type XFillBitmapItem,
} from "../../../../svx/inc/xbtmpit";
import { BitmapMode } from "../../../../offapi/com/sun/star/drawing/BitmapMode";
import { RectanglePoint } from "../../../../offapi/com/sun/star/drawing/RectanglePoint";
import { FillStyle } from "../../../../offapi/com/sun/star/drawing/FillStyle";
import type { OdfPageBackground } from "../../../../xmloff/source/style/PageMasterStyleMap";
import type { OdfBitmapGeometry } from "../../../../xmloff/source/draw/fill-properties";
import {
  XMLBorderHdl,
  XMLBorderWidthHdl,
  type OdfBoxProperties,
} from "../../../../xmloff/source/style/bordrhdl";

/** Imports the original background and writing-mode members into the actual table frame item set. @param format - Native format. @param value - Source table-style values. @returns Nothing. */
export function importFrameVisualProperties(
  format: SwFrameFormat,
  value: OdfTableVisualProperties,
): void {
  if (value.background !== undefined) {
    const item = (format.GetAttrSet().Get(RES_BACKGROUND) as SvxBrushItem).Clone();
    try {
      if (value.background === "transparent") item.GetColor().SetAlpha(0);
      else item.SetColor(writerColorFromPrimitive(value.background, "transparent"));
      format.SetFormatAttr(item);
    } finally {
      item.Dispose();
    }
  }
  if (value.writingMode !== undefined) {
    const item = new SvxFrameDirectionItem(SvxFrameDirection.Environment, RES_FRAMEDIR);
    try {
      if (item.PutValue(value.writingMode)) format.SetFormatAttr(item);
    } finally {
      item.Dispose();
    }
  }
}

/** Applies page and story fill items after the shared ODF image names have been resolved. @param frame - Actual frame. @param source - Authored properties. @param named - Referenced DrawingLayer bitmap. @param legacy - Resolved legacy bitmap. @returns Nothing. */
export function importPageBackground(
  frame: SwFrameFormat,
  source: OdfPageBackground,
  named: XFillBitmapItem | undefined,
  legacy: XFillBitmapItem | undefined,
): void {
  const fillStyle =
    source.fillStyle ??
    (legacy
      ? FillStyle.BITMAP
      : source.backgroundColor === undefined
        ? undefined
        : source.backgroundColor === "transparent"
          ? FillStyle.NONE
          : FillStyle.SOLID);
  const color =
    source.fillColor ??
    (typeof source.backgroundColor === "number" ? source.backgroundColor : undefined);
  const transparency =
    source.fillTransparency ??
    (legacy ? source.image?.transparency : source.backgroundTransparency);
  const target = new SfxItemSet(frame.GetAttrSet().GetPool(), [
    [XATTR_FILL_FIRST, XATTR_FILL_LAST],
  ]);
  try {
    if (fillStyle !== undefined) target.Put(new XFillStyleItem(fillStyle));
    if (color !== undefined)
      target.Put(new XFillColorItem("", writerColorFromPrimitive(color, "transparent")));
    if (transparency !== undefined) target.Put(new XFillTransparenceItem(transparency));
    if (fillStyle === FillStyle.BITMAP) {
      const image = named ?? legacy;
      if (image) target.Put(image);
      const placement = legacy ? source.image : undefined;
      const legacyMode =
        placement &&
        (source.bitmapMode === undefined ||
          placement.mode !== BitmapMode.NO_REPEAT ||
          placement.point === RectanglePoint.MIDDLE_MIDDLE)
          ? placement.mode
          : undefined;
      const mode = legacyMode ?? source.bitmapMode;
      if (mode !== undefined) setBitmapMode(target, mode);
      if (placement && source.bitmapMode === undefined)
        target.Put(
          createBitmapGeometryItem(
            bitmapGeometryWhich.point,
            placement.point ?? RectanglePoint.LEFT_TOP,
          ),
        );
    }
    putBitmapGeometry(target, source.bitmapGeometry);
    if (target.Count()) frame.SetFormatAttrSet(target);
  } finally {
    target.Dispose();
  }
}

/** Applies DrawingLayer geometry to the native Writer item set. @param set - Destination. @param geometry - Authored geometric deltas. @returns Nothing. */
function putBitmapGeometry(set: SfxItemSet, geometry: OdfBitmapGeometry | undefined): void {
  if (!geometry) return;
  for (const key of Object.keys(bitmapGeometryWhich) as (keyof typeof bitmapGeometryWhich)[]) {
    const value = geometry[key];
    if (value === undefined) continue;
    const which = bitmapGeometryWhich[key];
    const item = createBitmapGeometryItem(
      which,
      typeof value === "number" && isBitmapSize(which) ? bitmapSizeToTwips(value) : value,
    );
    try {
      set.Put(item);
    } finally {
      item.Dispose();
    }
  }
}

/** The represented FillBaseProperties members select DrawingLayer over the legacy brush. @param style - Effective frame style. @returns Whether a modern member is present. */
export function hasDrawingFrameFill(style: XMLTextFrameStyle): boolean {
  return (
    style.fillStyle !== undefined ||
    style.fillColor !== undefined ||
    style.fillTransparency !== undefined ||
    style.bitmapName !== undefined ||
    style.bitmapGeometry !== undefined ||
    style.bitmapMode !== undefined ||
    style.fillOpacityName !== undefined
  );
}

/** Constructs the original non-graphic brush from color and transparency members. @param set - Destination. @param color - Authored color. @param transparency - Legacy transparency percent. @param preserveBrushAlpha - Retain the default brush alpha on RGB-only writes. @returns Nothing. */
function putFrameColorBrush(
  set: SfxItemSet,
  color: number | "transparent" | undefined,
  transparency: number | undefined,
  preserveBrushAlpha = false,
): void {
  const rgb = typeof color === "number" ? new Color(color) : new Color(COL_TRANSPARENT);
  if (preserveBrushAlpha) rgb.SetAlpha(COL_TRANSPARENT.GetAlpha());
  const brush = new SvxBrushItem(rgb, RES_BACKGROUND);
  try {
    if (transparency !== undefined && color !== "transparent") {
      const value = new Any();
      try {
        value.insert([transparency], "sal_Int32");
        brush.PutValue(value, MID_BACK_COLOR_TRANSPARENCY);
      } finally {
        value.dispose();
      }
    }
    setSvxBrushItemAsFillAttributesToTargetSet(brush, set);
  } finally {
    brush.Dispose();
  }
}

/** Fills a Writer frame descriptor from either its modern DrawingLayer members or the legacy background. @param set - Native frame items. @param style - Effective style. @param bitmap - Resolved bitmap for the active branch. @returns Nothing. */
export function putFrameFillProperties(
  set: SfxItemSet,
  style: XMLTextFrameStyle,
  bitmap: XFillBitmapItem | undefined,
): void {
  const image = style.backgroundImage;
  if (!hasDrawingFrameFill(style)) {
    if (image && bitmap)
      setGraphicBrushFill(set, bitmap, image.mode, image.point, image.transparency);
    else if (style.backgroundColor !== undefined || style.backgroundTransparency !== undefined)
      putFrameColorBrush(set, style.backgroundColor, style.backgroundTransparency);
    return;
  }

  const legacyAlpha =
    style.fillOpacityName === undefined && style.fillStyle !== FillStyle.BITMAP
      ? style.backgroundTransparency
      : undefined;
  const solid = style.fillStyle === FillStyle.SOLID;
  const oldColor =
    solid && style.fillColor === undefined && typeof style.backgroundColor === "number"
      ? style.backgroundColor
      : undefined;
  const solidAlpha = solid && style.fillTransparency === undefined ? legacyAlpha : undefined;
  if (oldColor !== undefined || solidAlpha !== undefined)
    putFrameColorBrush(set, style.fillColor ?? oldColor, solidAlpha, oldColor !== undefined);
  else {
    if (style.fillStyle !== undefined) set.Put(new XFillStyleItem(style.fillStyle as FillStyle));
    if (style.fillColor !== undefined) set.Put(new XFillColorItem("", new Color(style.fillColor)));
  }
  const transparency = style.fillTransparency ?? (solid ? undefined : legacyAlpha);
  if (transparency !== undefined) set.Put(new XFillTransparenceItem(transparency));
  if (bitmap && style.fillStyle === FillStyle.BITMAP) set.Put(bitmap);
  if (style.bitmapMode !== undefined) setBitmapMode(set, style.bitmapMode);
  putBitmapGeometry(set, style.bitmapGeometry);
}

/** Converts four independent filter properties to an owned item. @param value - ODF properties or presentation shorthand. @param which - Destination native identity. @param strict - Whether the existing cell profile rejects invalid XML. @returns Native item or absent for an empty declaration. */
export function importBoxProperties(
  value: OdfBoxProperties,
  which: number,
  strict = true,
): SvxBoxItem | undefined {
  if (
    !Object.keys(value).some(
      /** Finds a represented property. @param key - Property name. @returns Whether supplied. */
      (key) =>
        (key.startsWith("border") || key.startsWith("padding")) &&
        value[key as keyof OdfBoxProperties] !== undefined,
    )
  )
    return undefined;
  const item = new SvxBoxItem(which),
    border = new XMLBorderHdl(),
    compound = new XMLBorderWidthHdl();
  for (const [edge, suffix] of ["Top", "Bottom", "Left", "Right"].entries()) {
    const distance = value[`padding${suffix}` as keyof OdfBoxProperties] ?? value.padding;
    if (typeof distance === "number") item.SetDistance(distance, edge);
    const text = value[`border${suffix}` as keyof OdfBoxProperties] ?? value.border;
    const widthText =
      value[`borderLineWidth${suffix}` as keyof OdfBoxProperties] ?? value.borderLineWidth;
    const target = { value: SvxBoxItem.SvxLineToLine(undefined, true) };
    if (typeof text === "string") {
      if (!border.importXML(text, target)) {
        if (strict) throw new Error(`Unsupported ODF cell border: ${text}`);
        if (
          text === value.border ||
          value.border === undefined ||
          !border.importXML(value.border, target)
        )
          continue;
      }
      if (typeof widthText === "string" && !compound.importXML(widthText, target)) {
        if (strict) throw new Error(`Unsupported ODF border widths: ${widthText}`);
        if (widthText !== value.borderLineWidth && value.borderLineWidth !== undefined)
          compound.importXML(value.borderLineWidth, target);
      }
      // Native member order is top/bottom/left/right = 3/4/1/2.
      item.PutValue(target.value, ([3, 4, 1, 2][edge] as number) | 0x80);
    }
  }
  return item;
}

/** Applies original page layout box and shadow to the four native page formats. @param page - Destination descriptor. @param layout - Parsed page layout. @returns Nothing. */
export function importPageLayoutBox(page: SwPageDesc, layout: OdfPageLayout): void {
  const box = layout.box && importBoxProperties(layout.box, RES_BOX, false);
  const shadow = layout.shadow && new SvxShadowItem(RES_SHADOW);
  try {
    if (shadow && layout.shadow) {
      const value = new Any(layout.shadow, shadowType);
      try {
        shadow.PutValue(value, 0x80);
      } finally {
        value.dispose();
      }
    }
    for (const frame of [
      page.GetMaster(),
      page.GetLeft(),
      page.GetFirstMaster(),
      page.GetFirstLeft(),
    ]) {
      if (box) frame.SetFormatAttr(box);
      if (shadow) frame.SetFormatAttr(shadow);
    }
  } finally {
    box?.Dispose();
    shadow?.Dispose();
  }
}
