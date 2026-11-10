/** @fileoverview Original numbering stylesheet postprocessing from StyleSheetTable.cxx, operating on the actual StyleSheetTable owner. */
import { StyleSheetTable, StyleType } from "./StyleSheetTable";
import { Exception } from "../../../../cppu/inc/com/sun/star/uno/Exception";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { unicode } from "../../core/unocore/unocrsrhelper";
import type { SwXStyle } from "../../core/unocore/unostyle";
/** Copies one source scalar/string Any through the existing native property setter. @param style - Actual style. @param name - Native name. @param value - Owned argument. @returns Nothing. */
function set(style: SwXStyle, name: string, value: Any): void {
  const key = unicode(name);
  try {
    style.setPropertyValue(key, value);
  } finally {
    key.dispose();
    value.dispose();
  }
}
/** Original postprocessing assigns resolved list names (including empty ID0 cancellation) and validates first-use level ownership. @param this - Actual table. @returns Nothing. */
export function ApplyNumberingStyleNameToParaStyles(this: StyleSheetTable): void {
  try {
    const mapper = this["m_rDMapper"];
    if (!mapper) return;
    const key = unicode("ParagraphStyles"),
      family = mapper.GetTextDocument().getStyleFamilies().getByName(key);
    key.dispose();
    for (const entry of this["m_aStyleSheetEntries"]) {
      if (
        entry.m_nStyleTypeCode !== StyleType.Paragraph ||
        entry.m_pProperties.props().GetListId() <= -1
      )
        continue;
      const styleKey = unicode(StyleSheetTable.ConvertStyleName(entry.m_sStyleName)[0]);
      if (!family.hasByName(styleKey)) {
        styleKey.dispose();
        break;
      }
      const style = family.getStyleByName(styleKey);
      styleKey.dispose();
      try {
        const id = entry.m_pProperties.props().GetListId(),
          name = mapper.GetListStyleName(id);
        try {
          if (!name.isEmpty() || id === 0)
            set(style, "NumberingStyleName", new Any([name.pData], "OUString"));
        } finally {
          name.dispose();
        }
        mapper.ValidateListLevel(entry.m_sStyleIdentifierD);
      } finally {
        style.dispose();
      }
    }
  } catch (error) {
    if (!(error instanceof Exception)) throw error;
    error.dispose();
  }
}
/** Original chapter assignment recovery touches immediate inherited styles and only absent outline metadata. @param this - Actual table. @returns Nothing. */
export function ReApplyInheritedOutlineLevelFromChapterNumbering(this: StyleSheetTable): void {
  try {
    const mapper = this["m_rDMapper"];
    if (!mapper) return;
    const key = unicode("ParagraphStyles"),
      family = mapper.GetTextDocument().getStyleFamilies().getByName(key);
    key.dispose();
    for (const entry of this["m_aStyleSheetEntries"]) {
      if (entry.m_nStyleTypeCode !== StyleType.Paragraph || entry.m_sBaseStyleIdentifier === "")
        continue;
      const parent = this.FindStyleSheetByISTD(entry.m_sBaseStyleIdentifier);
      if (!parent?.m_bAssignedAsChapterNumbering) continue;
      const styleKey = unicode(entry.m_sConvertedStyleName);
      if (!family.hasByName(styleKey)) {
        styleKey.dispose();
        continue;
      }
      const style = family.getStyleByName(styleKey);
      styleKey.dispose();
      try {
        const id = (entry.m_pProperties.props().GetListId() << 16) >> 16,
          parentName = mapper.GetListStyleName(parent.m_pProperties.props().GetListId());
        try {
          if (id === -1 && !parentName.isEmpty())
            set(style, "NumberingStyleName", new Any([parentName.pData], "OUString"));
        } finally {
          parentName.dispose();
        }
        if (entry.m_pProperties.GetOutlineLevel() !== -1) continue;
        const outline = parent.m_pProperties.GetOutlineLevel();
        if (outline < 0 || outline >= 9)
          throw new Error("assert(outline >= WW_OUTLINE_MIN && outline < WW_OUTLINE_MAX)");
        set(style, "OutlineLevel", new Any([outline + 1], "sal_Int16"));
      } finally {
        style.dispose();
      }
    }
  } catch (error) {
    if (!(error instanceof Exception)) throw error;
    error.dispose();
  }
}
