/** @fileoverview Exercises stylesheet admission and fallback with native property sets and UNO styles. */
import { expect, it } from "vitest";
import { createWriterDocument } from "../../core/doc/doc";
import { text, unicode } from "../../core/unocore/unocrsrhelper";
import { SwXStyleFamily } from "../../core/unocore/unostyle";
import { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import { SourceDocumentType } from "../inc/dmapper/DomainMapperFactory";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import {
  OOXMLProperty,
  OOXMLPropertySet,
  OOXMLPropertyType as Kind,
  OOXMLValue as V,
} from "../ooxml/OOXMLPropertySet";
import { DomainMapper } from "./DomainMapper";
import { StyleType } from "./StyleSheetTable";
import { StyleSheetTableImport } from "./StyleSheetTable.import";

/** Creates the actual string alternative used by the generated style resources. @param value - Source text. @returns Resource value. */
function stringValue(value: string): V {
  const native = unicode(value);
  try {
    return V.createString(native);
  } finally {
    native.dispose();
  }
}

/** Builds the style identity and optional base without changing the native resource order. @param id - Source style ID. @param type - Generated type token. @param base - Optional base ID. @returns Property set. */
function style(id: string, type: number, base?: string): OOXMLPropertySet {
  const properties = new OOXMLPropertySet();
  properties.add(N.LN_CT_Style_type, V.createInteger(type), Kind.ATTRIBUTE);
  properties.add(N.LN_CT_Style_styleId, stringValue(id), Kind.ATTRIBUTE);
  properties.add(N.LN_CT_Style_name, stringValue(id), Kind.SPRM);
  if (base) properties.add(N.LN_CT_Style_basedOn, stringValue(base), Kind.SPRM);
  return properties;
}

it("keeps unknown style identities without creating UNO styles or applying table overrides to paragraphs", /** Delivers the original nullable modifiers and verifies admission in both style owners. @returns Nothing. */ () => {
  const model = new SwXTextDocument(createWriterDocument());
  const mapper = new DomainMapper(model, SourceDocumentType.OOXML);
  try {
    const receiver = new StyleSheetTableImport(mapper);
    receiver.attribute(N.LN_CT_Style_styleId, stringValue("OutsideEntry"));
    const missingBase = new OOXMLProperty(N.LN_CT_Style_basedOn, new V(), Kind.SPRM);
    receiver.sprm(missingBase);

    const paragraph = style("RetainedParagraph", N.LN_Value_ST_StyleType_paragraph);
    paragraph.add(N.LN_CT_Style_basedOn, new V(), Kind.SPRM);
    const tableOverride = new OOXMLPropertySet();
    tableOverride.add(
      N.LN_CT_TblStyleOverrideType,
      V.createInteger(N.LN_Value_ST_TblStyleOverrideType_firstRow),
      Kind.ATTRIBUTE,
    );
    paragraph.add(N.LN_CT_Style_tblStylePr, V.createPropertySet(tableOverride), Kind.SPRM);
    receiver.entry(0, style("UnknownStyleKind", 0));
    receiver.entry(1, paragraph);
    receiver.ApplyStyleSheets();

    const table = mapper.impl.GetStyleSheetTable();
    expect(table.FindStyleSheetByISTD("OutsideEntry")).toBeNull();
    expect(table.FindStyleSheetByISTD("UnknownStyleKind")?.m_nStyleTypeCode).toBe(
      StyleType.Unknown,
    );
    expect(table.FindStyleSheetByISTD("RetainedParagraph")?.m_sBaseStyleIdentifier).toBe("");
    const family = new SwXStyleFamily(model.GetDoc(), "ParagraphStyles");
    const unknownName = unicode("UnknownStyleKind"),
      paragraphName = unicode("RetainedParagraph");
    try {
      expect(family.hasByName(unknownName)).toBe(false);
      expect(family.hasByName(paragraphName)).toBe(true);
    } finally {
      paragraphName.dispose();
      unknownName.dispose();
    }
  } finally {
    mapper.dispose();
    model.dispose();
  }
});

it("retains the first valid UNO parent when a later source entry would create a cycle", /** Applies both source styles through the original style family. @returns Nothing. */ () => {
  const model = new SwXTextDocument(createWriterDocument());
  const mapper = new DomainMapper(model, SourceDocumentType.OOXML);
  try {
    const receiver = new StyleSheetTableImport(mapper);
    receiver.entry(0, style("CycleAlpha", N.LN_Value_ST_StyleType_paragraph, "CycleBeta"));
    receiver.entry(1, style("CycleBeta", N.LN_Value_ST_StyleType_paragraph, "CycleAlpha"));
    receiver.ApplyStyleSheets();

    const family = new SwXStyleFamily(model.GetDoc(), "ParagraphStyles");
    for (const [name, expected] of [
      ["CycleAlpha", "CycleBeta"],
      ["CycleBeta", "Standard"],
    ]) {
      const nativeName = unicode(name);
      const acquired = family.getStyleByName(nativeName);
      const parent = acquired.getParentStyle();
      try {
        expect(text(parent)).toBe(expected);
      } finally {
        parent.dispose();
        acquired.dispose();
        nativeName.dispose();
      }
    }
  } finally {
    mapper.dispose();
    model.dispose();
  }
});
