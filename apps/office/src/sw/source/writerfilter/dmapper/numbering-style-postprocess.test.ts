/** @fileoverview Verifies native list-style postprocessing on actual mapper, style and list owners. */
import { expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import { DomainMapper } from "./DomainMapper";
import { SourceDocumentType } from "../inc/dmapper/DomainMapperFactory";
import { StyleSheetEntry, StyleType } from "./StyleSheetTable";
import { AbstractListDef, ListDef } from "./NumberingManager";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { PropertyIds as P } from "./PropertyIds";
import { ParagraphPropertyMap } from "./PropertyMap";
/** Populates actual owned entries, styles and list definitions without replacing their mapper contracts. @returns Owners and fixture constructors. */
function fixture() {
  const doc = new SwDoc(),
    model = new SwXTextDocument(doc),
    mapper = new DomainMapper(model, SourceDocumentType.RTF),
    table = mapper.impl.GetStyleSheetTable(),
    lists = mapper.impl.GetListTable();
  return {
    doc,
    model,
    mapper,
    table,
    lists,
    /** Creates a real source style and corresponding native paragraph collection. @param name - Original name. @param id - Source list ID. @returns Source entry. */
    entry(name: string, id: number) {
      const entry = new StyleSheetEntry();
      entry.m_sStyleIdentifierD = name;
      entry.m_sStyleName = name;
      entry.m_sConvertedStyleName = name;
      entry.m_nStyleTypeCode = StyleType.Paragraph;
      entry.m_pProperties.props().SetListId(id);
      entry.m_pProperties.SetListLevel(0);
      const value = new Any([0], "sal_Int16");
      try {
        entry.m_pProperties.Insert(P.PROP_NUMBERING_LEVEL, value);
      } finally {
        value.dispose();
      }
      table.AppendEntry(entry);
      doc.MakeTextFormatColl(name, doc.GetDfltTextFormatColl());
      return entry;
    },
    /** Installs owned original definitions into their retained native table. @param id - Concrete ID. @returns Abstract level owner. */
    list(id: number) {
      const abstract = new AbstractListDef(),
        concrete = new ListDef();
      abstract.AddLevel(0);
      abstract.GetLevel(0)?.SetValue(N.LN_CT_NumFmt_val, N.LN_Value_ST_NumberFormat_decimal);
      concrete.SetId(id);
      concrete.SetAbstractDefinition(abstract);
      lists["m_aAbstractLists"].push(abstract);
      lists["m_aLists"].push(concrete);
      return abstract;
    },
    /** Releases actual import/model/document owners. @returns Nothing. */
    dispose() {
      mapper.dispose();
      model.dispose();
      doc.Dispose();
    },
  };
}
it("preserves first claimant and native metadata/property-vector disagreement for a second claimant", /** Validates original WW_OUTLINE_MAX metadata without rewriting PROP_NUMBERING_LEVEL. @returns Nothing. */ () => {
  const f = fixture();
  try {
    const first = f.entry("First", 4),
      second = f.entry("Second", 4),
      abstract = f.list(4);
    f.lists.CreateNumberingRules();
    expect(abstract.GetLevel(0)?.GetParaStyle()).toBe(first);
    expect(first.m_pProperties.GetListLevel()).toBe(0);
    expect(second.m_pProperties.GetListLevel()).toBe(9);
    second.m_pProperties.SetListLevel(256);
    f.mapper.impl.ValidateListLevel("Second");
    expect(second.m_pProperties.GetListLevel()).toBe(9);
    const value = second.m_pProperties.getProperty(P.PROP_NUMBERING_LEVEL),
      number: [number] = [-1];
    try {
      expect(value?.[1].extract(number, "sal_Int16")).toBe(true);
      expect(number[0]).toBe(0);
    } finally {
      value?.[1].dispose();
    }
    const paragraph = new ParagraphPropertyMap(),
      direct = new Any([7], "sal_Int16");
    try {
      paragraph.Insert(P.PROP_NUMBERING_LEVEL, direct);
      expect(f.mapper.impl.GetListLevel(second, paragraph)).toBe(7);
      expect(f.mapper.impl.GetListLevel(second)).toBe(9);
    } finally {
      direct.dispose();
      paragraph.dispose();
    }
  } finally {
    f.dispose();
  }
});
it("reapplies absent child numbering and outline properties after destructive chapter assignment", /** Unlike the RTF default numId0 producer, absent source metadata minus1 admits parent numbering restoration. @returns Nothing. */ () => {
  const f = fixture();
  try {
    const parent = f.entry("Parent", 1),
      child = f.entry("Child", -1),
      abstract = f.list(1);
    parent.m_pProperties.SetOutlineLevel(0);
    child.m_pProperties.SetListLevel(-1);
    child.m_sBaseStyleIdentifier = "Parent";
    const parentStyle = f.doc.FindTextFormatCollByName("Parent"),
      childStyle = f.doc.FindTextFormatCollByName("Child");
    childStyle?.SetDerivedFrom(parentStyle);
    abstract.GetLevel(0)?.SetParaStyle(parent);
    f.lists.CreateNumberingRules();
    expect(parent.m_bAssignedAsChapterNumbering).toBe(true);
    expect(parentStyle?.IsAssignedToListLevelOfOutlineStyle()).toBe(true);
    expect(childStyle?.GetAttrOutlineLevel()).toBe(1);
    expect(childStyle?.GetNumRule().GetValue()).toBe("Outline");
  } finally {
    f.dispose();
  }
});

it.each([
  [4, 3, 5, 3],
  [4, 9, 1, 3],
] as const)(
  "preserves native first candidate id%i with %i levels before id%i with %i levels",
  /** Equal weights keep the first candidate; weight18 stops scanning even before a later weight27 candidate. @param firstId - First list. @param firstCount - First levels. @param secondId - Later list. @param secondCount - Later levels. @returns Nothing. */ (
    firstId,
    firstCount,
    secondId,
    secondCount,
  ) => {
    const f = fixture();
    try {
      for (const [id, count] of [
        [firstId, firstCount],
        [secondId, secondCount],
      ]) {
        const abstract = f.list(id as number);
        for (let level = 0; level < (count as number); level++) {
          abstract.AddLevel(level);
          const style = f.entry(`Heading ${id} Level ${level}`, id as number);
          style.m_pProperties.SetListLevel(level);
          style.m_pProperties.SetOutlineLevel(level);
          const native = abstract.GetLevel(level);
          native?.SetValue(N.LN_CT_NumFmt_val, N.LN_Value_ST_NumberFormat_decimal);
          native?.SetParaStyle(style);
        }
      }
      f.lists.CreateNumberingRules();
      expect(f.lists.GetList(firstId)?.GetStyleName()).toBe("Outline");
      expect(f.lists.GetList(secondId)?.GetStyleName()).toBe(`WWNum${secondId}`);
    } finally {
      f.dispose();
    }
  },
);
it("retains signed16 candidate ID narrowing before full-width list comparison", /** A suitable high ID becomes4 during selection and therefore does not match its own full ID at creation. @returns Nothing. */ () => {
  const f = fixture();
  try {
    const abstract = f.list(65540);
    for (let level = 0; level < 3; level++) {
      abstract.AddLevel(level);
      const style = f.entry(`Heading Overflow ${level}`, 65540);
      style.m_pProperties.SetListLevel(level);
      style.m_pProperties.SetOutlineLevel(level);
      abstract.GetLevel(level)?.SetValue(N.LN_CT_NumFmt_val, N.LN_Value_ST_NumberFormat_decimal);
      abstract.GetLevel(level)?.SetParaStyle(style);
    }
    f.lists.CreateNumberingRules();
    expect(f.lists.GetList(65540)?.GetChapterNumberingWeight()).toBe(6);
    expect(f.lists.GetList(65540)?.GetStyleName()).toBe("WWNum65540");
  } finally {
    f.dispose();
  }
});
