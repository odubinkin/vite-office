/** @fileoverview Original differential styles applied to native conditional cell styles. */
import type { SaxesAttributeNS, SaxesTagNS } from "saxes";
import type { FragmentContext } from "../../../../oox/source/core/fragmenthandler";
import { SvxBrushItem } from "../../../../editeng/inc/brushitem";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { SfxStyleFamily, SfxStyleSearchBits } from "../../../../svl/inc/style-values";
import type { ScDocument } from "../../../inc/document";
import * as Which from "../../../inc/scitems";
import { Font } from "./stylesbuffer";
import { type ExcelGraphicHelper, XlsColor } from "./stylesbuffer.color";
import { attribute, isSpreadsheetTag } from "./workbookfragment";

const fontProperties = new Map([
  ["name", Which.ATTR_FONT],
  ["rFont", Which.ATTR_FONT],
  ["family", Which.ATTR_FONT],
  ["charset", Which.ATTR_FONT],
  ["sz", Which.ATTR_FONT_HEIGHT],
  ["b", Which.ATTR_FONT_WEIGHT],
  ["i", Which.ATTR_FONT_POSTURE],
  ["u", Which.ATTR_FONT_UNDERLINE],
  ["strike", Which.ATTR_FONT_CROSSEDOUT],
  ["color", Which.ATTR_FONT_COLOR],
  ["outline", Which.ATTR_FONT_CONTOUR],
  ["shadow", Which.ATTR_FONT_SHADOWED],
]);

/** The original dxf font and solid fill subset, with only explicit properties set. */
export class Dxf implements FragmentContext {
  private readonly stack: string[] = [];
  private readonly font: Font;
  private readonly explicit = new Set<number>();
  private background: XlsColor | undefined;
  private foreground: XlsColor | undefined;
  private solid = false;
  private styleName = "";

  /** Binds the workbook's palette and theme resolver. @param colors - Source colors. @returns Differential style. */
  constructor(private readonly colors: ExcelGraphicHelper) {
    this.font = new Font(colors);
  }
  /** Routes original dxf children. @param tag - Child XML token. @returns Active context, or no context. */
  createFastChildContext(tag: SaxesTagNS): Dxf | null {
    if (!isSpreadsheetTag(tag)) return null;
    const parent = this.stack.at(-1);
    if (parent === "dxf" && (tag.local === "font" || tag.local === "fill")) return this;
    if (parent === "font" && fontProperties.has(tag.local)) return this;
    if (parent === "fill" && tag.local === "patternFill") return this;
    if (parent === "patternFill" && (tag.local === "bgColor" || tag.local === "fgColor"))
      return this;
    return null;
  }
  /** Reads the represented differential fields, retaining their presence. @param tag - Source element. @param attributes - Source attributes. @returns Nothing. */
  startFastElement(tag: SaxesTagNS, attributes: readonly SaxesAttributeNS[]): void {
    const parent = this.stack.at(-1);
    this.stack.push(tag.local);
    if (parent === "font") {
      const property = fontProperties.get(tag.local);
      if (property !== undefined) this.explicit.add(property);
      if (tag.local === "color") this.font.setColor(XlsColor.importColor(attributes));
      else this.font.importAttribs(tag.local, attribute(attributes, "val"));
    } else if (tag.local === "patternFill")
      this.solid = attribute(attributes, "patternType") === "solid";
    else if (tag.local === "bgColor") this.background = XlsColor.importColor(attributes);
    else if (tag.local === "fgColor") this.foreground = XlsColor.importColor(attributes);
  }
  /** Completes the original dxf child. @returns Nothing. */
  endFastElement(): void {
    this.stack.pop();
  }
  /** Ignores formatting-only whitespace. @returns Nothing. */
  characters(): void {}

  /** Creates the original ConditionalStyle_n style lazily at the workbook boundary. @param document - Native workbook. @param index - Zero-based dxf index. @returns Native style name. */
  CreateStyle(document: ScDocument, index: number): string {
    if (this.styleName) return this.styleName;
    const pool = document.GetStyleSheetPool();
    if (!pool) return "";
    const name = unicode("ConditionalStyle_" + (index + 1));
    try {
      const style =
        pool.Find(name, SfxStyleFamily.Para) ??
        pool.Make(name, SfxStyleFamily.Para, SfxStyleSearchBits.UserDefined);
      const target = style.GetItemSet();
      target.ClearItem();
      target.SetParent(undefined);
      for (const item of this.font.createItems()) {
        if (this.explicit.has(item.Which())) target.Put(item, true);
        else item.Dispose();
      }
      const fill = this.solid ? (this.foreground ?? this.background) : this.background;
      if (fill)
        target.Put(
          new SvxBrushItem(
            fill.getColor(this.colors),
            fill.createComplexColor(),
            Which.ATTR_BACKGROUND,
          ),
          true,
        );
      this.styleName = text(style.GetName());
      return this.styleName;
    } finally {
      name.dispose();
    }
  }
}
