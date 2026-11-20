/** @fileoverview XLSX differential style serialization from Calc cell-style item sets. */
import type { SvxBrushItem } from "../../../../editeng/inc/brushitem";
import type { SvxColorItem } from "../../../../editeng/inc/colritem";
import type { SvxContourItem } from "../../../../editeng/inc/contouritem";
import type { SvxCrossedOutItem } from "../../../../editeng/inc/crossedoutitem";
import type { SvxFontItem } from "../../../../editeng/inc/fontitem";
import type { SvxShadowedItem } from "../../../../editeng/inc/shdditem";
import type { SvxUnderlineItem } from "../../../../editeng/inc/udlnitem";
import type {
  SvxFontHeightItem,
  SvxPostureItem,
  SvxWeightItem,
} from "../../../../editeng/source/items/textitem";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import { rtl_getBestWindowsCharsetFromTextEncoding } from "../../../../sal/textenc/tencinfo";
import type { FastSerializerHelper } from "../../../../sax/inc/fshelper";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxStyleFamily } from "../../../../svl/inc/style-values";
import { Color } from "../../../../tools/inc/color";
import {
  FontItalic,
  FontLineStyle,
  FontStrikeout,
  FontWeight,
} from "../../../../tools/inc/fontenum";
import type { ScDocument } from "../../../inc/document";
import * as Which from "../../../inc/scitems";
import { XclXmlUtils } from "./xestream";

/** Collects the native referenced differential cell styles in first-use order. */
export class XclExpDxfs {
  private readonly ids = new Map<string, number>();
  private readonly styles: SfxItemSet[] = [];

  /** Borrows the workbook's style pool. @param document - Actual workbook. @returns Differential style buffer. */
  constructor(private readonly document: ScDocument) {}

  /** Maps a used cell style to its exported DXF index. @param name - Native style name. @returns Index or absence. */
  GetDxfId(name: string): string | null {
    if (!name) return null;
    const previous = this.ids.get(name);
    if (previous !== undefined) return String(previous);
    const key = unicode(name);
    try {
      const items = this.document.GetStyleSheetPool()?.Find(key, SfxStyleFamily.Para)?.GetItemSet();
      if (!items) return null;
      const index = this.styles.length;
      this.styles.push(items);
      this.ids.set(name, index);
      return String(index);
    } finally {
      key.dispose();
    }
  }

  /** Writes the original indexed DXF group. @param output - Stylesheet serializer. @returns Nothing. */
  SaveXml(output: FastSerializerHelper): void {
    if (this.styles.length === 0) return;
    output.startElement(token("dxfs"), token("count"), String(this.styles.length));
    for (const items of this.styles) {
      output.startElement(token("dxf"));
      this.SaveFont(output, items);
      const fill = items.GetItemIfSet(Which.ATTR_BACKGROUND, false) as SvxBrushItem | undefined;
      if (fill) {
        output.startElement(token("fill"));
        output.startElement(token("patternFill"));
        output.singleElement(
          token("bgColor"),
          token("rgb"),
          XclXmlUtils.ToOString(fill.GetColor()),
        );
        output.endElement(token("patternFill"));
        output.endElement(token("fill"));
      }
      output.endElement(token("dxf"));
    }
    output.endElement(token("dxfs"));
  }

  /** Writes only the explicit DXF font properties. @param output - Active style serializer. @param items - Actual native style items. @returns Nothing. */
  private SaveFont(output: FastSerializerHelper, items: SfxItemSet): void {
    const weight = items.GetItemIfSet(Which.ATTR_FONT_WEIGHT, false) as SvxWeightItem | undefined;
    const posture = items.GetItemIfSet(Which.ATTR_FONT_POSTURE, false) as
      SvxPostureItem | undefined;
    const strike = items.GetItemIfSet(Which.ATTR_FONT_CROSSEDOUT, false) as
      SvxCrossedOutItem | undefined;
    const outline = items.GetItemIfSet(Which.ATTR_FONT_CONTOUR, false) as
      SvxContourItem | undefined;
    const shadow = items.GetItemIfSet(Which.ATTR_FONT_SHADOWED, false) as
      SvxShadowedItem | undefined;
    const under = items.GetItemIfSet(Which.ATTR_FONT_UNDERLINE, false) as
      SvxUnderlineItem | undefined;
    const height = items.GetItemIfSet(Which.ATTR_FONT_HEIGHT, false) as
      SvxFontHeightItem | undefined;
    const color = items.GetItemIfSet(Which.ATTR_FONT_COLOR, false) as SvxColorItem | undefined;
    const font = items.GetItemIfSet(Which.ATTR_FONT, false) as SvxFontItem | undefined;
    if (
      !weight &&
      !posture &&
      !strike &&
      !outline &&
      !shadow &&
      !under &&
      !height &&
      !color &&
      !font
    )
      return;
    output.startElement(token("font"));
    const val = token("val");
    if (weight)
      output.singleElement(token("b"), val, String(weight.GetValue() > FontWeight.WEIGHT_NORMAL));
    if (posture)
      output.singleElement(token("i"), val, String(posture.GetValue() !== FontItalic.ITALIC_NONE));
    if (strike)
      output.singleElement(
        token("strike"),
        val,
        String(strike.GetValue() !== FontStrikeout.STRIKEOUT_NONE),
      );
    if (outline) output.singleElement(token("outline"), val, String(outline.GetValue()));
    if (shadow) output.singleElement(token("shadow"), val, String(shadow.GetValue()));
    if (under) {
      const line = under.GetLineStyle();
      output.singleElement(
        token("u"),
        val,
        line === FontLineStyle.LINESTYLE_NONE
          ? "none"
          : line === FontLineStyle.LINESTYLE_DOUBLE
            ? "double"
            : "single",
      );
    }
    if (height) output.singleElement(token("sz"), val, String(height.GetHeight() / 20));
    if (color)
      output.singleElement(
        token("color"),
        token("rgb"),
        XclXmlUtils.ToOString(new Color(color.GetValue().toUInt32())),
      );
    if (font) {
      output.singleElement(token("name"), val, font.GetFamilyName());
      output.singleElement(
        token("charset"),
        val,
        String(rtl_getBestWindowsCharsetFromTextEncoding(font.GetCharSet())),
      );
    }
    output.endElement(token("font"));
  }
}
