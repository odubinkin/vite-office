/** @fileoverview Stylesheet resource entries and application through actual Writer UNO style families. */
import { SwUnoPropertyMap } from "../../core/unocore/unomap";
import { RES_PARATR_TABSTOP } from "../../../inc/hintids";
import { putItem, stringAny } from "../../core/unocore/unocrsrhelper";
import { Exception } from "../../../../cppu/inc/com/sun/star/uno/Exception";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { SwXStyle, SwXStyleFamily } from "../../core/unocore/unostyle";
import type { Properties, Reference, Sprm, Table, Value, Id } from "../inc/dmapper/resourcemodel";
import { resolveReturnedReference } from "../inc/dmapper/resourcemodel";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import type { DomainMapper } from "./DomainMapper";
import type { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import { ContextType } from "./DomainMapper_Impl";
import { getPropertyName, PropertyIds as P } from "./PropertyIds";
import { PropertyMap } from "./PropertyMap";
import { StyleSheetEntry, StyleType, TableStyleSheetEntry } from "./StyleSheetTable";
import { TblStylePrHandler, TblStyleType } from "./TblStylePrHandler";
import { namedProperty, SetDocumentInteropProperties } from "./SettingsTable.compat";

const styleTypes = new Map<number, StyleType>([
  [N.LN_Value_ST_StyleType_paragraph, StyleType.Paragraph],
  [N.LN_Value_ST_StyleType_character, StyleType.Character],
  [N.LN_Value_ST_StyleType_table, StyleType.Table],
  [N.LN_Value_ST_StyleType_numbering, StyleType.List],
]);

/** Initializes the original DomainMapper fallback for DOCX without font settings. @param model - Destination document. @returns Nothing. */
export function InitOOXMLFontDefaults(model: SwXTextDocument): void {
  const defaults = model.createTextDefaults();
  const font = stringAny("Calibri");
  const height = new Any([11], "double");
  try {
    defaults.setPropertyValue(getPropertyName(P.PROP_CHAR_FONT_NAME), font);
    defaults.setPropertyValue(getPropertyName(P.PROP_CHAR_HEIGHT), height);
  } catch (error) {
    if (!(error instanceof Exception)) throw error;
    error.dispose();
  } finally {
    height.dispose();
    font.dispose();
  }
}

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
    this.current = new StyleSheetEntry();
    const impl = this.mapper.impl;
    const styles = impl.GetStyleSheetTable();
    styles.SetCurrentEntry(this.current);
    impl.PushStyleProperties(this.current.m_pProperties);
    let entry: StyleSheetEntry;
    try {
      properties.resolve(this);
      entry = this.current;
    } catch (error) {
      this.current.dispose();
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
        this.appendTableStyleProperty("styleId", stringAny(this.current.m_sStyleIdentifierD));
        break;
      case N.LN_CT_Style_type: {
        const type = styleTypes.get(value.getInt()) ?? StyleType.Unknown;
        if (type === StyleType.Table) {
          const original = this.current;
          const impl = this.mapper.impl;
          this.current = new TableStyleSheetEntry(original);
          impl.PopProperties(ContextType.CONTEXT_STYLESHEET);
          impl.PushStyleProperties(this.current.m_pProperties);
          impl.GetStyleSheetTable().SetCurrentEntry(this.current);
          original.dispose();
        } else this.current.m_nStyleTypeCode = type;
        break;
      }
      case N.LN_CT_Style_default:
        this.current.m_bIsDefaultStyle = value.getInt() !== 0;
        this.appendTableStyleProperty("default", new Any([this.current.m_bIsDefaultStyle], "bool"));
        break;
      case N.LN_CT_Style_customStyle:
        this.appendTableStyleProperty("customStyle", new Any([value.getInt() !== 0], "bool"));
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
    if (id === N.LN_CT_Style_tblPr || id === N.LN_CT_Style_tblStylePr) {
      this.resolveTableStyleProperties(this.current, modifier);
      return;
    }
    if (id === N.LN_CT_Style_pPr || id === N.LN_CT_Style_rPr) {
      resolveReturnedReference(modifier.getProps(), this.mapper);
      return;
    }
    const value = modifier.getValue();
    if (!value) return;
    if (id === N.LN_CT_Style_name) {
      this.current.m_sStyleName = styleString(value);
      this.appendTableStyleProperty("name", stringAny(this.current.m_sStyleName));
    } else if (id === N.LN_CT_Style_basedOn) {
      this.current.m_sBaseStyleIdentifier = styleString(value);
      this.appendTableStyleProperty("basedOn", stringAny(this.current.m_sBaseStyleIdentifier));
    } else if (id === N.LN_CT_Style_uiPriority) {
      this.appendTableStyleProperty("uiPriority", stringAny(String(value.getInt())));
    } else if (id === N.LN_CT_Style_rsid) {
      this.appendTableStyleProperty(
        "rsid",
        stringAny((value.getInt() >>> 0).toString(16).padStart(8, "0")),
      );
    } else if (id === N.LN_CT_Style_semiHidden)
      this.appendTableStyleProperty("semiHidden", new Any());
    else if (id === N.LN_CT_Style_unhideWhenUsed)
      this.appendTableStyleProperty("unhideWhenUsed", new Any());
    else if (id === N.LN_CT_Style_qFormat)
      this.appendTableStyleProperty("qFormat", new Any([value.getInt()], "sal_Int32"));
    else if (id === N.LN_CT_Style_next) this.current.m_sNextStyleIdentifier = styleString(value);
    else if (id === N.LN_CT_Style_link) this.current.m_sLinkStyleIdentifier = styleString(value);
  }

  /** Appends a native table stylesheet property. @param name - Native field name. @param value - Owned value. @returns Nothing. */
  private appendTableStyleProperty(name: string, value: Any): void {
    try {
      if (!(this.current instanceof TableStyleSheetEntry)) return;
      const property = namedProperty(name, value);
      try {
        this.current.AppendInteropGrabBag(property);
      } finally {
        property.dispose();
      }
    } finally {
      value.dispose();
    }
  }

  /** Resolves the style map before assigning it to the base or conditional entry. @param entry - Active style. @param modifier - Table style resource. @returns Nothing. */
  private resolveTableStyleProperties(entry: StyleSheetEntry, modifier: Sprm): void {
    const properties = new PropertyMap();
    let retained = false;
    const handler = new TblStylePrHandler(properties);
    try {
      resolveReturnedReference(modifier.getProps(), handler);
      const type = handler.getType();
      if (type === TblStyleType.Unknown) entry.m_pProperties.InsertProps(properties);
      else if (entry instanceof TableStyleSheetEntry) {
        entry.AddTblStylePr(type, properties);
        retained = true;
      }
      if (entry instanceof TableStyleSheetEntry) {
        const conditional = modifier.getId() === N.LN_CT_Style_tblStylePr;
        if (conditional) handler.appendInteropGrabBag("type", stringAny(handler.getTypeString()));
        const property = handler.getInteropGrabBag(conditional ? "tblStylePr" : "tblPr");
        try {
          entry.AppendInteropGrabBag(property);
        } finally {
          property.dispose();
        }
      }
    } finally {
      handler.dispose();
      if (!retained) properties.dispose();
    }
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

  /** Resolves the original run defaults and applies them through the native UNO text defaults. @param modifier - Default run resource. @returns Nothing. */
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
    const defaults = this.mapper.model.createTextDefaults();
    try {
      if (this.mapper.IsOOXMLImport()) {
        const font = stringAny("Times New Roman");
        try {
          defaults.setPropertyValue(getPropertyName(P.PROP_CHAR_FONT_NAME), font);
        } finally {
          font.dispose();
        }
      }
      for (const property of properties.GetPropertyValues()) {
        try {
          defaults.setPropertyValue(property.Name, property.Value);
        } catch (error) {
          if (!(error instanceof Exception)) throw error;
          error.dispose();
        }
      }
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      error.dispose();
    }
  }

  /** Creates or reuses actual styles and applies their property vectors in source order. @returns Nothing. */
  ApplyStyleSheets(): void {
    const document = this.mapper.model.GetDoc();
    const tableStyles = this.entries
      .filter(
        /** Selects the actual Word table style entries. @param entry - Imported style. @returns Whether table style. */ (
          entry,
        ) => entry instanceof TableStyleSheetEntry,
      )
      .map(
        /** Copies one named entry as its native interoperability bag. @param entry - Table style. @returns Owned style record. */ (
          entry,
        ) => entry.GetInteropGrabBag(),
      );
    try {
      if (tableStyles.length)
        SetDocumentInteropProperties(this.mapper.model, "tableStyles", tableStyles);
    } finally {
      for (const entry of tableStyles) entry.dispose();
    }
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
