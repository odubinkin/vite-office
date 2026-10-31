/** @fileoverview Original SwHTMLParser::CreateBrushItem class/ID/inline precedence and represented color-brush construction from htmltab.cxx. */
import type { SwHTMLParser } from "./swhtml";
import { SwCSS1Parser } from "./htmlcss1";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SvxCSS1PropertyInfo } from "./svxcss1.types";
import { SvxBrushItem } from "../../../../editeng/source/items/frmitems.brush";
import type { Color } from "../../../../tools/inc/color";
import { RES_BACKGROUND } from "../../../inc/hintids";
/** Original fixed-background set and source precedence. Graphic-link brushes require the unrepresented native graphic owner. @param parser - Actual importer. @param color - Legacy color. @param imageURL - Legacy image URL. @param style - Inline CSS. @param id - Source ID. @param className - Source class. @returns Actual new brush or null. */
export function CreateBrushItem(
  parser: SwHTMLParser,
  color: Color | null,
  imageURL: string,
  style: string,
  id: string,
  className: string,
): SvxBrushItem | null {
  if (style || id || className) {
    const items = new SfxItemSet(parser.m_xDoc.GetAttrPool(), [[RES_BACKGROUND, RES_BACKGROUND]]);
    try {
      const info = new SvxCSS1PropertyInfo();
      if (className) {
        const [name] = SwCSS1Parser.GetScriptFromClass(className);
        const entry = parser.m_pCSS1Parser.GetClass(name);
        if (entry) items.PutSet(entry.GetItemSet());
      }
      if (id) {
        const entry = parser.m_pCSS1Parser.GetId(id);
        if (entry) items.PutSet(entry.GetItemSet());
      }
      parser.m_pCSS1Parser.ParseStyleOption(style, items, info);
      const item = items.GetItemIfSet(RES_BACKGROUND, false);
      if (item instanceof SvxBrushItem) return new SvxBrushItem(item);
    } finally {
      items.Dispose();
    }
  }
  if (imageURL) throw new Error("HTML background image requires native graphic-link brush support");
  if (!color) return null;
  const brush = new SvxBrushItem(RES_BACKGROUND);
  brush.SetColor(color);
  return brush;
}
