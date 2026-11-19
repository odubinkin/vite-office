/** @fileoverview Stylesheet resource entries and application through actual Writer UNO style families. */
import { SwUnoPropertyMap } from "../../core/unocore/unomap";
import {
  RES_CHRATR_CJK_FONT,
  RES_CHRATR_CTL_FONT,
  RES_CHRATR_FONT,
  RES_CHRATR_GRABBAG,
  RES_PARATR_TABSTOP,
} from "../../../inc/hintids";
import { SfxGrabBagItem } from "../../../../svl/inc/grabbagitem";
import { putItem, stringAny } from "../../core/unocore/unocrsrhelper";
import { Exception } from "../../../../cppu/inc/com/sun/star/uno/Exception";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { SwXStyle, SwXStyleFamily } from "../../core/unocore/unostyle";
import type { Properties, Reference, Sprm, Table, Value, Id } from "../inc/dmapper/resourcemodel";
import { resolveReturnedReference } from "../inc/dmapper/resourcemodel";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import type { DomainMapper } from "./DomainMapper";
import { ContextType } from "./DomainMapper_Impl";
import { StyleSheetEntry, StyleType } from "./StyleSheetTable";
import { TblStylePrHandler } from "./TblStylePrHandler";

const styleTypes = new Map<number, StyleType>([
  [N.LN_Value_ST_StyleType_paragraph, StyleType.Paragraph],
  [N.LN_Value_ST_StyleType_character, StyleType.Character],
  [N.LN_Value_ST_StyleType_table, StyleType.Table],
  [N.LN_Value_ST_StyleType_numbering, StyleType.List],
]);

/** Borrows and converts a resource string. @param value - Source value. @returns Host UTF16. */
function styleString(value: Value): string {
  const native = value.getString();
  try {
    return text(native);
  } finally {
    native.dispose();
  }
}

/** Native stylesheet table consumes attributes and nested paragraph/run property resources. */
export class StyleSheetTableImport implements Table, Properties {
  private readonly entries: StyleSheetEntry[] = [];
  private current: StyleSheetEntry | null = null;

  /** Binds the actual mapper, native table and output model. @param mapper - Destination mapper. @returns Stylesheet receiver. */
  constructor(private readonly mapper: DomainMapper) {}

  /** Resolves one source style entry before recording its Word ID. @param _position - Source entry index. @param properties - Actual style resource. @returns Nothing. */
  entry(_position: number, properties: Reference<Properties>): void {
    const entry = new StyleSheetEntry();
    const impl = this.mapper.impl;
    const styles = impl.GetStyleSheetTable();
    this.current = entry;
    styles.SetCurrentEntry(entry);
    impl.PushStyleProperties(entry.m_pProperties);
    try {
      properties.resolve(this);
    } catch (error) {
      entry.dispose();
      throw error;
    } finally {
      impl.PopProperties(ContextType.CONTEXT_STYLESHEET);
      styles.SetCurrentEntry(null);
      this.current = null;
    }
    if (!entry.m_sStyleName || !entry.m_sStyleIdentifierD) {
      entry.dispose();
      return;
    }
    styles.AppendEntry(entry);
    this.entries.push(entry);
    if (entry.m_bIsDefaultStyle && entry.m_nStyleTypeCode === StyleType.Paragraph)
      styles.SetDefaultParaStyleName(entry.m_sStyleIdentifierD);
  }

  /** Reads original identity, kind and default attributes. @param id - Native resource ID. @param value - Typed value. @returns Nothing. */
  attribute(id: Id, value: Value): void {
    if (!this.current) return;
    switch (id) {
      case N.LN_CT_Style_styleId:
        this.current.m_sStyleIdentifierD = styleString(value);
        break;
      case N.LN_CT_Style_type:
        this.current.m_nStyleTypeCode = styleTypes.get(value.getInt()) ?? StyleType.Unknown;
        break;
      case N.LN_CT_Style_default:
        this.current.m_bIsDefaultStyle = value.getInt() !== 0;
        break;
    }
  }

  /** Resolves style names, inheritance and represented native text properties. @param modifier - Resource modifier. @returns Nothing. */
  sprm(modifier: Sprm): void {
    if (!this.current) return;
    const id = modifier.getId();
    if (id === N.LN_CT_DocDefaults_pPrDefault) {
      this.applyParagraphDefaults(modifier);
      return;
    }
    if (id === N.LN_CT_DocDefaults_rPrDefault) {
      this.applyCharacterDefaults(modifier);
      return;
    }
    if (id === N.LN_CT_Style_tblPr) {
      resolveReturnedReference(
        modifier.getProps(),
        new TblStylePrHandler(this.current.m_pProperties),
      );
      return;
    }
    if (id === N.LN_CT_Style_pPr || id === N.LN_CT_Style_rPr) {
      resolveReturnedReference(modifier.getProps(), this.mapper);
      return;
    }
    const value = modifier.getValue();
    if (!value) return;
    if (id === N.LN_CT_Style_name) this.current.m_sStyleName = styleString(value);
    else if (id === N.LN_CT_Style_basedOn) this.current.m_sBaseStyleIdentifier = styleString(value);
    else if (id === N.LN_CT_Style_next) this.current.m_sNextStyleIdentifier = styleString(value);
    else if (id === N.LN_CT_Style_link) this.current.m_sLinkStyleIdentifier = styleString(value);
  }

  /** Imports default paragraph tabs through the same property context as named styles. @param modifier - Paragraph default resource. @returns Nothing. */
  private applyParagraphDefaults(modifier: Sprm): void {
    const impl = this.mapper.impl;
    const properties = impl.GetStyleSheetTable().GetDefaultParaProps();
    impl.SetDocDefaultsImport(true);
    impl.PushStyleProperties(properties);
    try {
      resolveReturnedReference(modifier.getProps(), this.mapper);
    } finally {
      impl.PopProperties(ContextType.CONTEXT_STYLESHEET);
      impl.SetDocDefaultsImport(false);
    }
    const doc = this.mapper.model.GetDoc();
    for (const property of properties.GetPropertyValues()) {
      const entry = SwUnoPropertyMap.get(text(property.Name));
      if (entry?.which !== RES_PARATR_TABSTOP) continue;
      const item = putItem(doc.GetDefault(entry.which), entry, property.Value);
      try {
        doc.SetDefault(item);
      } finally {
        item.Dispose();
      }
    }
  }

  /** Resolves the original run defaults and applies the represented interoperability property to the document pool. @param modifier - Default run resource. @returns Nothing. */
  private applyCharacterDefaults(modifier: Sprm): void {
    const impl = this.mapper.impl;
    const properties = impl.GetStyleSheetTable().GetDefaultCharProps();
    impl.SetDocDefaultsImport(true);
    impl.PushStyleProperties(properties);
    try {
      resolveReturnedReference(modifier.getProps(), this.mapper);
    } finally {
      impl.PopProperties(ContextType.CONTEXT_STYLESHEET);
      impl.SetDocDefaultsImport(false);
    }
    const doc = this.mapper.model.GetDoc();
    for (const property of properties.GetPropertyValues()) {
      const entry = SwUnoPropertyMap.get(text(property.Name));
      if (!entry) continue;
      const which = entry.which;
      if (which === RES_CHRATR_GRABBAG) {
        const item = new SfxGrabBagItem(which);
        if (item.PutValue(property.Value)) doc.SetDefault(item);
      } else if (
        which === RES_CHRATR_FONT ||
        which === RES_CHRATR_CJK_FONT ||
        which === RES_CHRATR_CTL_FONT
      ) {
        doc.SetDefault(putItem(doc.GetDefault(which), entry, property.Value));
      }
    }
  }

  /** Creates or reuses actual styles and applies their property vectors in source order. @returns Nothing. */
  ApplyStyleSheets(): void {
    const document = this.mapper.model.GetDoc();
    for (const entry of this.entries) {
      const type = entry.m_nStyleTypeCode;
      if (type !== StyleType.Paragraph && type !== StyleType.Character) continue;
      const familyName = type === StyleType.Paragraph ? "ParagraphStyles" : "CharacterStyles";
      const family = new SwXStyleFamily(document, familyName);
      const name = unicode(entry.m_sConvertedStyleName);
      try {
        const existing = family.hasByName(name);
        const style = existing ? family.getStyleByName(name) : new SwXStyle(document, familyName);
        try {
          if (!existing) family.insertStyleByName(name, style);
          for (const property of entry.m_pProperties.GetPropertyValues()) {
            try {
              style.setPropertyValueIgnoreUnknown(property.Name, property.Value);
            } catch (error) {
              if (!(error instanceof Exception)) throw error;
              error.dispose();
            }
          }
        } finally {
          style.dispose();
        }
      } finally {
        name.dispose();
      }
    }
    for (const entry of this.entries) {
      const type = entry.m_nStyleTypeCode;
      if (type !== StyleType.Paragraph && type !== StyleType.Character) continue;
      const table = this.mapper.impl.GetStyleSheetTable();
      const parent = table.FindStyleSheetByISTD(entry.m_sBaseStyleIdentifier);
      const next = table.FindStyleSheetByISTD(entry.m_sNextStyleIdentifier);
      const hasParent = parent !== null && parent !== entry && parent.m_nStyleTypeCode === type;
      const hasNext =
        type === StyleType.Paragraph && next?.m_nStyleTypeCode === StyleType.Paragraph;
      if (!hasParent && !hasNext) continue;
      const family = new SwXStyleFamily(
        document,
        type === StyleType.Paragraph ? "ParagraphStyles" : "CharacterStyles",
      );
      const name = unicode(entry.m_sConvertedStyleName);
      try {
        const style = family.getStyleByName(name);
        try {
          if (hasParent) {
            const parentName = unicode(parent.m_sConvertedStyleName);
            try {
              style.setParentStyle(parentName);
            } finally {
              parentName.dispose();
            }
          }
          if (hasNext) {
            const followName = unicode("FollowStyle");
            const value = stringAny(next.m_sConvertedStyleName);
            try {
              style.setPropertyValue(followName, value);
            } finally {
              value.dispose();
              followName.dispose();
            }
          }
        } catch (error) {
          if (!(error instanceof Exception)) throw error;
          error.dispose();
        } finally {
          style.dispose();
        }
      } finally {
        name.dispose();
      }
    }
  }
}
