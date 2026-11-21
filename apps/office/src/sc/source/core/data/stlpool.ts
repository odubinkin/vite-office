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
import { ATTR_PAGE_FOOTERRIGHT, ATTR_PAGE_HEADERRIGHT } from "../../../inc/scitems";
import { ScEditEngineDefaulter } from "../tool/editutil";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";

const standard = scStyleNameResourcesEnglish.STR_STYLENAME_STANDARD;

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
