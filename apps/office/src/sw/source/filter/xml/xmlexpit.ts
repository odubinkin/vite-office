/** @fileoverview Writer filter attribute-item export boundary corresponding to xmlexpit.cxx. Browser presentation shorthand retains its existing adapter behavior without moving native item ownership into shared xmloff. */
import type { SvxShadowItem } from "../../../../editeng/source/items/frmitems.shadow";
import { SvxShadowLocation } from "../../../../editeng/inc/svxenum";
import {
  cppu_detail_getUnoType_ShadowFormat as shadowType,
  ShadowFormat,
} from "../../../../offapi/com/sun/star/table/ShadowFormat";
import { XMLShadowPropHdl } from "../../../../xmloff/source/style/shadwhdl";
import type { SwFrameFormat } from "../../core/layout/atrfrm";
import { SvxTabAdjust, type SvxTabStopItem } from "../../../../editeng/inc/tstpitem";
import type { SvxLineSpacingItem } from "../../../../editeng/inc/lspcitem";
import type { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { projectWriterLineSpacing } from "../../core/text/itrform2";
import type { OdfParagraphProperties, OdfTabStop } from "../../../../xmloff/source/text/txtparae";
import { SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import { BitmapMode } from "../../../../offapi/com/sun/star/drawing/BitmapMode";
import { FillStyle } from "../../../../offapi/com/sun/star/drawing/FillStyle";
import {
  XATTR_FILLBITMAP,
  XATTR_FILLCOLOR,
  XATTR_FILLSTYLE,
  XATTR_FILLTRANSPARENCE,
} from "../../../../svx/inc/xdef";
import {
  bitmapGeometryWhich,
  bitmapSizeToMm100,
  getBitmapMode,
  isBitmapSize,
  type XFillBitmapItem,
} from "../../../../svx/inc/xbtmpit";
import {
  exportBitmapGeometry,
  exportLegacyBitmapPosition,
  type OdfBitmapGeometry,
} from "../../../../xmloff/source/style/PageMasterStyleMap";
import type { createBitmapGeometryItem, XFillBmpPosItem } from "../../../../svx/inc/xbtmpit";
import type { XFillStyleItem } from "../../../../svx/inc/xfillit0";
import type { XFillColorItem } from "../../../../svx/inc/xflclit";
import type { XFillTransparenceItem } from "../../../../svx/inc/xfltrit";
import type { SvXMLGraphicHelper } from "../../../../xmloff/source/core/xmlgrhlp";
import { encodeStyleName } from "../../../../xmloff/source/core/xmluconv";
import { exportImageStyle } from "../../../../xmloff/source/style/ImageStyle";
import { exportFillProperties } from "../../../../xmloff/source/draw/fill-properties";
import { escapeXml } from "../../../../xmloff/source/text/txtparae";
import type { SvxBorderLine } from "../../../../editeng/source/items/borderline";
import type { SvxBrushItem } from "../../../../editeng/source/items/frmitems.brush";
import type { SvxFrameDirectionItem } from "../../../../editeng/inc/frmdiritem";
import type { OdfTableVisualProperties } from "../../../../xmloff/source/table/XMLTableImport";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import {
  RES_BACKGROUND,
  RES_FRAMEDIR,
  RES_BOX,
  RES_SHADOW,
  RES_TEXTGRID,
} from "../../../inc/hintids";
import { SwTextGrid } from "../../../inc/tgrditem";
import { Converter } from "../../../../sax/source/tools/converter";
import { exportWritingDirection } from "../../../../xmloff/source/style/prhdlfac";
import { writerColorValue, type SwAttrSet } from "../../core/attr/swatrset";
import {
  XMLBorderHdl,
  XMLBorderWidthHdl,
  borderStyleToken,
  type OdfBoxProperties,
} from "../../../../xmloff/source/style/bordrhdl";

/** Exports the original direct brush color and writing direction for table styles. @param items - Actual frame item set. @returns Filter-only visual properties. */
export function exportFrameVisualProperties(items: SwAttrSet): OdfTableVisualProperties {
  const brush = items.GetItemIfSet(RES_BACKGROUND, false) as SvxBrushItem | undefined,
    direction = items.GetItemIfSet(RES_FRAMEDIR, false) as SvxFrameDirectionItem | undefined;
  const color = brush?.GetColor();
  const background =
    color === undefined
      ? undefined
      : color.IsTransparent()
        ? "transparent"
        : writerColorValue(color);
  if (direction === undefined) return { background };
  const any = new Any();
  try {
    const mode: [number] = [0];
    const writingMode =
      direction.QueryValue(any) && any.extract(mode, "sal_Int16") ? mode[0] : undefined;
    return { background, writingMode };
  } finally {
    any.dispose();
  }
}

/** Exports the represented writing direction and native page grid properties. @param master - Actual master frame. @returns Layout attributes. */
export function exportPageWritingAndGrid(master: SwFrameFormat): string {
  const mode = exportFrameVisualProperties(master.GetAttrSet()).writingMode;
  let attributes =
    mode === undefined ? "" : ` style:writing-mode="${exportWritingDirection(mode)}"`;
  if (!master.GetAttrSet().GetItemIfSet(RES_TEXTGRID, false)) return attributes;
  const grid = master.GetTextGrid();
  const color: [string] = [""];
  Converter.convertColor(color, grid.GetColor().toInt32());
  const type = grid.GetGridType();
  attributes += ` style:layout-grid-color="${color[0]}" style:layout-grid-lines="${grid.GetLines()}" style:layout-grid-base-height="${Converter.convertMeasureToXML(grid.GetBaseHeight(), "twip")}" style:layout-grid-ruby-height="${Converter.convertMeasureToXML(grid.GetRubyHeight(), "twip")}" style:layout-grid-mode="${type === SwTextGrid.LinesOnly ? "line" : type === SwTextGrid.LinesAndChars ? "both" : "none"}" style:layout-grid-ruby-below="${grid.IsRubyTextBelow()}" style:layout-grid-print="${grid.IsPrintGrid()}" style:layout-grid-display="${grid.IsDisplayGrid()}"`;
  if (!grid.IsSquaredMode())
    attributes += ` style:layout-grid-base-width="${Converter.convertMeasureToXML(grid.GetBaseWidth(), "twip")}" style:layout-grid-snap-to="${grid.IsSnapToChars()}"`;
  return attributes;
}

/** Named drawing image definitions shared by the exported page and story formats. */
export class XMLPageBackgroundExport {
  private readonly images = new Map<string, string>();

  /** Binds the current styles stream to the original package graphic helper. @param graphics - Optional graphic sink. @returns Export helper. */
  constructor(private readonly graphics?: SvXMLGraphicHelper) {}

  /** Collects a named bitmap and reserves its XML image definition. @param bitmap - Native bitmap item. @returns Package path and public name when embedded. */
  registerBitmap(bitmap: XFillBitmapItem): { name: string; href: string } | undefined {
    const graphic = bitmap.GetGraphic();
    if (!this.graphics || !graphic) return undefined;
    const href = this.graphics.saveGraphic({
      bytes: graphic.GetNativeData(),
      mediaType: graphic.mediaType,
    });
    const baseName = bitmap.GetName() || "Bitmap";
    let name = baseName;
    for (let suffix = 1; this.images.has(name) && this.images.get(name) !== href; ++suffix)
      name = `${baseName} ${suffix}`;
    this.images.set(name, href);
    return { name, href };
  }

  /** Writes declarations collected by the page-layout writers. @returns Named drawing styles. */
  exportStyles(): string {
    let result = "";
    for (const [name, href] of this.images) result += exportImageStyle(name, href);
    return result;
  }

  /** Formats both current DrawingLayer properties and the original compatibility brush. @param frame - Actual page or story frame. @returns Layout attributes and children. */
  exportBackground(frame: SwFrameFormat): { attributes: string; children: string } {
    const items = frame.GetAttrSet();
    const style = (
      items.GetItemIfSet(XATTR_FILLSTYLE, false) as XFillStyleItem | undefined
    )?.GetValue();
    if (style === undefined) return { attributes: "", children: "" };
    const color = items.GetItemIfSet(XATTR_FILLCOLOR, false) as XFillColorItem | undefined;
    const transparency = (
      items.GetItemIfSet(XATTR_FILLTRANSPARENCE, false) as XFillTransparenceItem | undefined
    )?.GetValue();
    const rgb = color && !color.IsIndex() ? color.GetColorValue().toInt32() : undefined;
    const attributes = exportFillProperties({
      fillStyle: style,
      ...(rgb !== undefined && style === FillStyle.SOLID ? { fillColor: rgb } : {}),
      ...(transparency === undefined ? {} : { fillTransparency: transparency }),
    });
    if (style === FillStyle.NONE) attributes.push('fo:background-color="transparent"');
    else if (rgb !== undefined) {
      const value: [string] = [""];
      Converter.convertColor(value, rgb);
      attributes.push(`fo:background-color="${value[0]}"`);
      if (style === FillStyle.SOLID && transparency !== undefined)
        attributes.push(`style:background-transparency="${transparency}%"`);
    }
    const geometry: Record<string, number | boolean> = {};
    for (const [key, which] of Object.entries(bitmapGeometryWhich)) {
      const item = items.GetItemIfSet(which, false);
      if (item === undefined) continue;
      const value = (item as ReturnType<typeof createBitmapGeometryItem>).GetValue();
      geometry[key] =
        typeof value === "number" && isBitmapSize(which) ? bitmapSizeToMm100(value) : value;
    }
    attributes.push(...exportBitmapGeometry(geometry as OdfBitmapGeometry));
    const bitmap = items.GetItemIfSet(XATTR_FILLBITMAP, false) as XFillBitmapItem | undefined;
    let children = "";
    const image = style === FillStyle.BITMAP && bitmap ? this.registerBitmap(bitmap) : undefined;
    if (image) {
      const { name, href } = image;
      const mode = getBitmapMode(items);
      const repeat =
        mode === BitmapMode.STRETCH
          ? "stretch"
          : mode === BitmapMode.NO_REPEAT
            ? "no-repeat"
            : "repeat";
      attributes.push(
        `draw:fill-image-name="${encodeStyleName(name)}"`,
        `style:repeat="${repeat}"`,
      );
      const point = (items.Get(bitmapGeometryWhich.point) as XFillBmpPosItem).GetValue();
      const position =
        mode === BitmapMode.NO_REPEAT
          ? ` style:position="${exportLegacyBitmapPosition(point)}"`
          : "";
      const legacyMode = mode === BitmapMode.REPEAT ? "" : ` style:repeat="${repeat}"`;
      const opacity = transparency === undefined ? "" : ` draw:opacity="${100 - transparency}%"`;
      children = `<style:background-image xlink:href="${escapeXml(href)}" xlink:type="simple" xlink:actuate="onLoad"${position}${legacyMode}${opacity}/>`;
    }
    return { attributes: attributes.length ? ` ${attributes.join(" ")}` : "", children };
  }
}

/** Formats native twip values for the existing presentation shorthand control. @param line - Native line. @returns Presentation input. */
export function exportBorderShorthand(line: SvxBorderLine | undefined): string {
  if (line === undefined || line.isEmpty()) return "none";
  return `${line.GetWidth() / 20}pt ${borderStyleToken(line.GetBorderLineStyle())} #${(line.GetColor().toUInt32() & 0xffffff).toString(16).padStart(6, "0")}`;
}

/** Exports all four native edges without collapsing authored independent values. @param item - Native item. @returns Filter-only properties. */
export function exportBoxProperties(item: SvxBoxItem | undefined): OdfBoxProperties {
  if (item === undefined) return {};
  const result: Record<string, number | string | undefined> = {},
    border = new XMLBorderHdl(),
    compound = new XMLBorderWidthHdl();
  for (const [edge, suffix] of ["Top", "Bottom", "Left", "Right"].entries()) {
    const value = SvxBoxItem.SvxLineToLine(item.GetLine(edge), true);
    result[`padding${suffix}`] = item.GetDistance(edge, true);
    result[`border${suffix}`] = border.exportXML(value);
    result[`borderLineWidth${suffix}`] = compound.exportXML(value);
  }
  return result;
}

/** Writes the original ODF page layout box, shadow and gutter properties. @param master - Actual page frame. @param formatLength - Twips to ODF length converter. @returns XML attributes. */
export function exportPageLayoutBox(
  master: SwFrameFormat,
  formatLength: (value: number) => string,
): string {
  const items = master.GetAttrSet();
  const box = exportBoxProperties(items.GetItemIfSet(RES_BOX, false) as SvxBoxItem | undefined);
  const attributes: string[] = [];
  for (const side of ["Top", "Bottom", "Left", "Right"] as const) {
    const suffix = side.toLowerCase();
    const padding = box[`padding${side}`];
    const border = box[`border${side}`];
    const lineWidth = box[`borderLineWidth${side}`];
    if (padding !== undefined) attributes.push(`fo:padding-${suffix}="${formatLength(padding)}"`);
    if (border !== undefined) attributes.push(`fo:border-${suffix}="${border}"`);
    if (lineWidth !== undefined)
      attributes.push(`style:border-line-width-${suffix}="${lineWidth}"`);
  }
  const shadow = items.GetItemIfSet(RES_SHADOW, false) as SvxShadowItem | undefined;
  if (shadow && shadow.GetLocation() !== SvxShadowLocation.NONE) {
    const value = new Any();
    try {
      const format = new ShadowFormat();
      if (shadow.QueryValue(value, 0x80) && value.extract(format, shadowType))
        attributes.push(`style:shadow="${new XMLShadowPropHdl().exportXML(format)}"`);
    } finally {
      value.dispose();
    }
  }
  const gutter = master.GetLRSpace().GetGutterMargin();
  if (gutter)
    attributes.push(`loext:margin-gutter="${Converter.convertMeasureToXML(gutter, "twip")}"`);
  return attributes.length ? ` ${attributes.join(" ")}` : "";
}

/** Projects original direct tab attributes into the shared ODF parcel. @param item - Native tab item. @returns Ordered stops. */
export function exportParagraphTabStops(item: SvxTabStopItem): OdfTabStop[] {
  const stops: OdfTabStop[] = [];
  for (let index = 0; index < item.Count(); index++) {
    const stop = item.At(index);
    const adjustment = stop.GetAdjustment();
    stops.push({
      position: stop.GetTabPos(),
      alignment:
        adjustment === SvxTabAdjust.Right
          ? "right"
          : adjustment === SvxTabAdjust.Center
            ? "center"
            : adjustment === SvxTabAdjust.Decimal
              ? "char"
              : adjustment === SvxTabAdjust.Default
                ? "default"
                : "left",
      decimal: stop.GetDecimal(),
      fill: stop.GetFill(),
    });
  }
  return stops;
}

/** Projects vertical paragraph spacing shared by body and annotation paragraphs. @param spacing - Native upper/lower spacing item. @returns ODF spacing properties. */
export function exportParagraphVerticalMargins(spacing: SvxULSpaceItem): OdfParagraphProperties {
  return {
    upperSpacing: spacing.GetUpper(),
    lowerSpacing: spacing.GetLower(),
    contextualSpacing: spacing.GetContext(),
  };
}

/** Projects the native line spacing mode and its independent value. @param item - Native line spacing item. @returns ODF property for the active mode. */
export function exportParagraphLineSpacing(item: SvxLineSpacingItem): OdfParagraphProperties {
  const { mode, value } = projectWriterLineSpacing(item);
  switch (mode) {
    case "proportional":
      return { lineHeightPercent: value };
    case "fixed":
      return { lineHeightTwips: value };
    case "minimum":
      return { lineHeightAtLeastTwips: value };
    case "leading":
      return { lineSpacingTwips: value };
  }
}
