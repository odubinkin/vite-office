/** @fileoverview Native ScStyleSheetPool source binding and cell-style factory. */
import { SfxStyleSheetPool } from "../../../../svl/source/items/style-sheet";
import type { SfxStyleSheetBase } from "../../../../svl/source/items/style-model";
import type { SfxItemPool } from "../../../../svl/source/items/itempool";
import { SfxStyleFamily, SfxStyleSearchBits } from "../../../../svl/inc/style-values";
import { type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import type { ScDocument } from "../../../inc/document";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { scStyleNameResourcesEnglish } from "../../../inc/globstr";
import { ScStyleSheet } from "./stlsheet";
import { ESelection } from "../../../../editeng/inc/ESelection";
import { EE_FEATURE_FIELD } from "../../../../editeng/inc/eeitem";
import { SvxFieldItem, SvxPageField, SvxTableField } from "../../../../editeng/inc/flditem";
import { ScPageHFItem } from "../../../inc/attrib";
import { SvxBrushItem } from "../../../../editeng/inc/brushitem";
import { SvxColorItem } from "../../../../editeng/inc/colritem";
import { SvxWeightItem } from "../../../../editeng/inc/wghtitem";
import { FontItalic, FontLineStyle, FontWeight } from "../../../../tools/inc/fontenum";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { SvxPostureItem } from "../../../../editeng/inc/postitem";
import { SvxUnderlineItem } from "../../../../editeng/source/items/textitem";
import { SvxBoxItem, SvxBoxItemLine } from "../../../../editeng/source/items/frmitems";
import { SvxBorderLine, SvxBorderLineWidth } from "../../../../editeng/source/items/borderline";
import { Color } from "../../../../tools/inc/color";
import {
  ATTR_BACKGROUND,
  ATTR_BORDER,
  ATTR_CJK_FONT_HEIGHT,
  ATTR_CJK_FONT_POSTURE,
  ATTR_CTL_FONT_HEIGHT,
  ATTR_CTL_FONT_POSTURE,
  ATTR_FONT_COLOR,
  ATTR_FONT_HEIGHT,
  ATTR_FONT_POSTURE,
  ATTR_FONT_UNDERLINE,
  ATTR_FONT_WEIGHT,
  ATTR_CJK_FONT_WEIGHT,
  ATTR_CTL_FONT_WEIGHT,
  ATTR_PAGE_FOOTERRIGHT,
  ATTR_PAGE_HEADERRIGHT,
} from "../../../inc/scitems";
import { ScEditEngineDefaulter } from "../tool/editutil";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";

const standard = scStyleNameResourcesEnglish.STR_STYLENAME_STANDARD;

/** Direct attributes in the bundled default styles. Unspecified attributes inherit from the parent. */
interface StandardCellStyle {
  readonly parent: string;
  readonly background?: number;
  readonly foreground?: number;
  readonly height?: number;
  readonly posture?: FontItalic;
  readonly bold?: boolean;
  readonly underline?: boolean;
  readonly border?: number;
}

/** Source styles and their parent order from sc/res/xml/styles.xml. Heights are in twips. */
const standardCellStyles = new Map<string, StandardCellStyle>([
  ["Heading", { parent: standard, height: 480, posture: FontItalic.ITALIC_NONE, bold: true }],
  ["Heading 1", { parent: "Heading", height: 360 }],
  ["Heading 2", { parent: "Heading", height: 240 }],
  ["Text", { parent: standard }],
  ["Note", { parent: "Text", background: 0xffffcc, foreground: 0x333333, border: 0x808080 }],
  ["Footnote", { parent: "Text", foreground: 0x808080, posture: FontItalic.ITALIC_NORMAL }],
  ["Hyperlink", { parent: "Text", foreground: 0x0000ee, underline: true }],
  ["Status", { parent: standard }],
  ["Good", { parent: "Status", background: 0xccffcc, foreground: 0x006600 }],
  ["Neutral", { parent: "Status", background: 0xffffcc, foreground: 0x996600 }],
  ["Bad", { parent: "Status", background: 0xffcccc, foreground: 0xcc0000 }],
  ["Warning", { parent: "Status", foreground: 0xcc0000 }],
  ["Error", { parent: "Status", background: 0xcc0000, foreground: 0xffffff, bold: true }],
  ["Accent", { parent: standard, bold: true }],
  ["Accent 1", { parent: "Accent", background: 0x000000, foreground: 0xffffff }],
  ["Accent 2", { parent: "Accent", background: 0x808080, foreground: 0xffffff }],
  ["Accent 3", { parent: "Accent", background: 0xdddddd }],
  ["Result", { parent: standard, bold: true, posture: FontItalic.ITALIC_NORMAL, underline: true }],
]);

/** Actual shared style-pool base with the native Calc document pointer. */
export class ScStyleSheetPool extends SfxStyleSheetPool {
  /** Creates the actual native pool without populating standard styles. @param pool - Owned document item pool. @param pDoc - Source document. @returns Pool. */
  constructor(
    pool: SfxItemPool,
    private pDoc: ScDocument | null,
  ) {
    super(pool);
  }
  /** Rebinds the native source pointer, including observable source destruction. @param document - Source or null. @returns Nothing. */
  SetDocument(document: ScDocument | null): void {
    this.pDoc = document;
  }
  /** Borrows the native source pointer. @returns Source or null. */
  GetDocument(): ScDocument | null {
    return this.pDoc;
  }
  /** Reads the original Standard cell style and creates its native shell when requested. @param create - Whether to create the built-in owner. @returns Cell style or null. */
  GetDefaultStyle(create = false): SfxStyleSheetBase | null {
    const name = unicode(standard);
    try {
      const style = this.Find(name, SfxStyleFamily.Para);
      return !style && create
        ? this.Make(name, SfxStyleFamily.Para, SfxStyleSearchBits.ScStandard)
        : style;
    } finally {
      name.dispose();
    }
  }

  /** Looks up a native page style and can create its independent item owner. @param name - Style name. @param create - Create when absent. @returns Native page style or null. */
  GetPageStyle(name: string, create = false): SfxStyleSheetBase | null {
    const key = unicode(name);
    try {
      const existing = this.Find(key, SfxStyleFamily.Page);
      if (existing || !create) return existing;
      const isStandard = name === standard;
      const style = this.Make(
        key,
        SfxStyleFamily.Page,
        isStandard ? SfxStyleSearchBits.ScStandard : SfxStyleSearchBits.UserDefined,
      );
      if (isStandard && this.pDoc) this.CreateStandardPageContent(style.GetItemSet(), this.pDoc);
      return style;
    } finally {
      key.dispose();
    }
  }

  /** Sets the Standard page style's original sheet field and Page number footer. @param items - Standard page style. @param document - Owning workbook. @returns Nothing. */
  private CreateStandardPageContent(items: SfxItemSet, document: ScDocument): void {
    const editor = new ScEditEngineDefaulter(document.GetEditEnginePool());
    editor.SetUpdateLayout(false);
    editor.EnableUndo(false);
    const empty = editor.CreateTextObject();
    const blank = unicode("");
    const page = unicode("Page ");
    try {
      for (const [which, prefix, field] of [
        [ATTR_PAGE_HEADERRIGHT, blank, new SvxTableField()],
        [ATTR_PAGE_FOOTERRIGHT, page, new SvxPageField()],
      ] as const) {
        editor.SetTextCurrentDefaults(prefix);
        const impl = editor.getImpl();
        const position = impl.CreateNormalizedSel(ESelection.AtEnd()).Min();
        impl.GetEditDoc().InsertFeature(position, new SvxFieldItem(field, EE_FEATURE_FIELD, true));
        impl.UpdateFields();
        const center = editor.CreateTextObject();
        const item = new ScPageHFItem(which);
        try {
          if (empty && center) {
            item.SetLeftArea(empty);
            item.SetCenterArea(center);
            item.SetRightArea(empty);
            items.Put(item);
          }
        } finally {
          item.dispose();
          center?.dispose();
        }
      }
    } finally {
      empty?.dispose();
      blank.dispose();
      page.dispose();
      editor.Dispose();
    }
  }

  /** Reads source stock styles used by the Styles controls and conditional formats. @returns Original style names. */
  GetStandardCellStyleNames(): Iterable<string> {
    return standardCellStyles.keys();
  }

  /** Populates the workbook's built-in cell style hierarchy, retaining named styles already installed by a filter. @returns Nothing. */
  LoadStandardCellStyles(): void {
    const style = this.GetDefaultStyle(true);
    const pattern = this.pDoc?.getCellAttributeHelper().getDefaultCellAttribute();
    if (style && pattern && !pattern.GetStyleName()) pattern.SetStyleSheet(style, false);
    for (const name of this.GetStandardCellStyleNames()) this.EnsureStandardCellStyle(name);
  }

  /** Materializes an original stock style and its ancestors if needed. @param name - Source style name. @returns Actual style or null. */
  EnsureStandardCellStyle(name: string): SfxStyleSheetBase | null {
    if (name === standard) return this.GetDefaultStyle(true);
    const value = unicode(name);
    try {
      const existing = this.Find(value, SfxStyleFamily.Para);
      const definition = standardCellStyles.get(name);
      if (existing || !definition) return existing;
      const { parent, background, foreground, bold, height, posture, underline, border } =
        definition;
      const ancestor = this.EnsureStandardCellStyle(parent);
      const style = this.Make(value, SfxStyleFamily.Para, SfxStyleSearchBits.ScStandard);
      if (ancestor) style.SetParent(ancestor.GetName());
      const items = style.GetItemSet();
      if (background !== undefined)
        items.Put(new SvxBrushItem(new Color(background), ATTR_BACKGROUND));
      if (foreground !== undefined)
        items.Put(new SvxColorItem(new Color(foreground), ATTR_FONT_COLOR));
      if (bold) {
        for (const which of [ATTR_FONT_WEIGHT, ATTR_CJK_FONT_WEIGHT, ATTR_CTL_FONT_WEIGHT])
          items.Put(new SvxWeightItem(FontWeight.WEIGHT_BOLD, which));
      }
      if (height !== undefined)
        for (const which of [ATTR_FONT_HEIGHT, ATTR_CJK_FONT_HEIGHT, ATTR_CTL_FONT_HEIGHT])
          items.Put(new SvxFontHeightItem(height, 100, which));
      if (posture !== undefined)
        for (const which of [ATTR_FONT_POSTURE, ATTR_CJK_FONT_POSTURE, ATTR_CTL_FONT_POSTURE])
          items.Put(new SvxPostureItem(posture, which));
      if (underline)
        items.Put(new SvxUnderlineItem(FontLineStyle.LINESTYLE_SINGLE, ATTR_FONT_UNDERLINE));
      if (border !== undefined) {
        const box = new SvxBoxItem(ATTR_BORDER);
        const line = new SvxBorderLine(new Color(border), SvxBorderLineWidth.Thin);
        for (const side of [
          SvxBoxItemLine.TOP,
          SvxBoxItemLine.BOTTOM,
          SvxBoxItemLine.LEFT,
          SvxBoxItemLine.RIGHT,
        ])
          box.SetLine(line, side);
        items.Put(box);
      }
      return style;
    } finally {
      value.dispose();
    }
  }

  /** Populates the native Standard style and binds the implicit cell pattern. @param items - Imported style attributes. @returns Nothing. */
  SetDefaultCellStyle(items: SfxItemSet): void {
    const style = this.GetDefaultStyle(true);
    if (!style) throw new Error("Calc Standard style is missing.");
    style.GetItemSet().PutSet(items, false);
    this.pDoc?.getCellAttributeHelper().getDefaultCellAttribute().SetStyleSheet(style, false);
  }

  /** Creates native cell styles and supplies their default parent. @param args - Original factory arguments. @returns Calc style. */
  protected override Create(
    ...args:
      | [source: SfxStyleSheetBase]
      | [
          name: OUStringConstReference,
          family: SfxStyleFamily,
          mask: SfxStyleSearchBits,
          parent: OUStringConstReference | undefined,
        ]
  ): SfxStyleSheetBase {
    if (args.length === 1) {
      if (!(args[0] instanceof ScStyleSheet)) throw new Error("Invalid Calc style class.");
      return new ScStyleSheet(args[0]);
    }
    const [name, family, mask, parent] = args;
    if (family !== SfxStyleFamily.Para && family !== SfxStyleFamily.Page)
      throw new Error("ScStyleSheetPool::Create: native Calc style family is not ported");
    const style = new ScStyleSheet(name, this, family, mask, parent);
    const defaultStyle =
      family === SfxStyleFamily.Page || text(name) === standard ? null : this.GetDefaultStyle(true);
    if (defaultStyle) style.SetParent(defaultStyle.GetName());
    return style;
  }
}
