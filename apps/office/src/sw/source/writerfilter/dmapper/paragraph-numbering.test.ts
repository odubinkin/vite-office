/** @fileoverview Verifies original paragraph numbering geometry, native typed lookups and once-per-list restart on actual mapper owners. */
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
import { ParagraphPropertyMap, type PropertyMap } from "./PropertyMap";
import { stringAny, unicode } from "../../core/unocore/unocrsrhelper";
import { lcl_GetPropertyFromParaStyleSheetNoNum } from "./DomainMapper_Impl.paragraph-numbering";
import { RTFReferenceProperties } from "../rtftok/rtfreferenceproperties";
import { RTFSprms } from "../rtftok/rtfsprm";
import { RTFValue } from "../rtftok/rtfvalue";
import { SwXNumberingRules, SwXChapterNumbering } from "../../core/unocore/unosett";
/** Inserts a native property with its original field type. @param map - Actual map. @param id - Native property. @param value - Owned native value. @returns Nothing. */
function set(map: PropertyMap, id: P, value: Any): void {
  try {
    map.Insert(id, value);
  } finally {
    value.dispose();
  }
}
/** Reads and releases one actual signed numeric property. @param map - Source map. @param id - Native property. @returns Numeric value or undefined. */
function number(map: PropertyMap, id: P): number | undefined {
  const value = map.getProperty(id),
    result: [number] = [0];
  if (!value) return undefined;
  try {
    expect(value[1].extract(result, "sal_Int32")).toBe(true);
    return result[0];
  } finally {
    value[1].dispose();
  }
}
/** Owns real source definitions and native document services. @returns Fixture. */
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
    /** Adds original style metadata and its actual paragraph-style counterpart. @param name - Source name. @param id - List ID. @param parent - Source parent. @returns Actual imported entry. */
    entry(name: string, id = 4, parent?: StyleSheetEntry) {
      const entry = new StyleSheetEntry();
      entry.m_sStyleName = entry.m_sStyleIdentifierD = entry.m_sConvertedStyleName = name;
      entry.m_nStyleTypeCode = StyleType.Paragraph;
      entry.m_sBaseStyleIdentifier = parent?.m_sStyleIdentifierD ?? "";
      entry.m_pProperties.props().SetListId(id);
      entry.m_pProperties.SetListLevel(id < 0 ? -1 : 2);
      table.AppendEntry(entry);
      doc.MakeTextFormatColl(
        name,
        parent ? doc.FindTextFormatCollByName(parent.m_sStyleName) : doc.GetDfltTextFormatColl(),
      );
      return entry;
    },
    /** Adds native definitions with known MM100 geometry in every active level. @param id - Concrete ID. @returns Concrete definition. */
    list(id = 4) {
      const abstract = new AbstractListDef(),
        list = new ListDef();
      for (let i = 0; i < 3; i++) {
        abstract.AddLevel(i);
        const level = abstract.GetLevel(i);
        level?.SetValue(N.LN_CT_NumFmt_val, N.LN_Value_ST_NumberFormat_decimal);
        if (level) {
          set(level, P.PROP_INDENT_AT, new Any([2540], "sal_Int32"));
          set(level, P.PROP_FIRST_LINE_INDENT, new Any([-635], "sal_Int32"));
        }
      }
      list.SetId(id);
      list.SetAbstractDefinition(abstract);
      lists["m_aAbstractLists"].push(abstract);
      lists["m_aLists"].push(list);
      return list;
    },
    /** Creates a native paragraph context with its real source style name. @param name - Source style. @returns Active property map. */
    context(name: string) {
      mapper.startParagraphGroup();
      const context = mapper.impl.GetTopContext();
      if (!(context instanceof ParagraphPropertyMap)) throw new Error("Missing paragraph context");
      set(context, P.PROP_PARA_STYLE_NAME, stringAny(name));
      return context;
    },
    /** Dispatches original numId resource into the active native context. @param id - Source list. @returns Nothing. */
    direct(id: number) {
      const attrs = new RTFSprms(),
        sprms = new RTFSprms();
      sprms.set(N.LN_CT_NumPr_numId, new RTFValue(id));
      const reference = new RTFReferenceProperties(attrs, sprms);
      try {
        mapper.props(reference);
      } finally {
        reference.dispose();
        attrs.dispose();
        sprms.dispose();
      }
    },
    /** Releases all actual owners, including active contexts. @returns Nothing. */
    dispose() {
      mapper.dispose();
      model.dispose();
      doc.Dispose();
    },
  };
}
it("preserves direct paragraph geometry ahead of style and numbering geometry", /** Source Insert with overwrite=false retains supplied paragraph margins. @returns Nothing. */ () => {
  const f = fixture();
  try {
    const entry = f.entry("Styled");
    f.list();
    for (const [id, value] of [
      [P.PROP_PARA_FIRST_LINE_INDENT, 127],
      [P.PROP_PARA_LEFT_MARGIN, 254],
      [P.PROP_PARA_RIGHT_MARGIN, 635],
    ] as const)
      set(entry.m_pProperties, id, new Any([value], "sal_Int32"));
    f.lists.CreateNumberingRules();
    const context = f.context("Styled");
    set(context, P.PROP_PARA_LEFT_MARGIN, new Any([999], "sal_Int32"));
    const state = f.mapper.impl.PrepareParagraphNumbering(context);
    expect(state.viaStyle).toBe(true);
    expect(state.viaRule).toBe(false);
    expect(number(context, P.PROP_PARA_FIRST_LINE_INDENT)).toBe(127);
    expect(number(context, P.PROP_PARA_LEFT_MARGIN)).toBe(999);
    expect(number(context, P.PROP_PARA_RIGHT_MARGIN)).toBe(635);
  } finally {
    f.dispose();
  }
});
it("copies parent geometry when the list ID comes from the parent style", /** Source inherited-ID flag permits the original one-parent left/first fallback. @returns Nothing. */ () => {
  const f = fixture();
  try {
    const parent = f.entry("Parent"),
      child = f.entry("Child", -1, parent);
    f.list();
    for (const [id, value] of [
      [P.PROP_PARA_FIRST_LINE_INDENT, 127],
      [P.PROP_PARA_LEFT_MARGIN, 254],
    ] as const)
      set(parent.m_pProperties, id, new Any([value], "sal_Int32"));
    f.lists.CreateNumberingRules();
    const context = f.context(child.m_sStyleName),
      state = f.mapper.impl.PrepareParagraphNumbering(context);
    expect(state.listId).toBe(4);
    expect(state.viaStyle).toBe(true);
    expect(number(context, P.PROP_PARA_FIRST_LINE_INDENT)).toBe(127);
    expect(number(context, P.PROP_PARA_LEFT_MARGIN)).toBe(254);
  } finally {
    f.dispose();
  }
});
it("uses numbering offsets when an explicit child list ID prevents parent left/first fallback but parent right margin exists", /** Right-parent access is unconditional while left/first-parent access depends on inherited ListId. @returns Nothing. */ () => {
  const f = fixture();
  try {
    const parent = f.entry("Parent", -1),
      child = f.entry("Child", 4, parent);
    f.list();
    set(parent.m_pProperties, P.PROP_PARA_RIGHT_MARGIN, new Any([635], "sal_Int32"));
    set(parent.m_pProperties, P.PROP_PARA_LEFT_MARGIN, new Any([127], "sal_Int32"));
    f.lists.CreateNumberingRules();
    const context = f.context(child.m_sStyleName);
    f.mapper.impl.PrepareParagraphNumbering(context);
    expect(number(context, P.PROP_PARA_LEFT_MARGIN)).toBe(2540);
    expect(number(context, P.PROP_PARA_FIRST_LINE_INDENT)).toBe(-635);
    expect(number(context, P.PROP_PARA_RIGHT_MARGIN)).toBe(635);
  } finally {
    f.dispose();
  }
});
it("retains the source nonzero ListId test in the no-numbering style lookup", /** Minus1 denotes absent list metadata but converts to true and therefore rejects the first found margin. @returns Nothing. */ () => {
  const f = fixture();
  try {
    const entry = f.entry("No list", -1);
    set(entry.m_pProperties, P.PROP_PARA_LEFT_MARGIN, new Any([254], "sal_Int32"));
    let value = lcl_GetPropertyFromParaStyleSheetNoNum(P.PROP_PARA_LEFT_MARGIN, entry, f.table);
    try {
      expect(value.hasValue()).toBe(false);
    } finally {
      value.dispose();
    }
    entry.m_pProperties.props().SetListId(0);
    value = lcl_GetPropertyFromParaStyleSheetNoNum(P.PROP_PARA_LEFT_MARGIN, entry, f.table);
    const numeric: [number] = [0];
    try {
      expect(value.extract(numeric, "sal_Int32")).toBe(true);
      expect(numeric[0]).toBe(254);
    } finally {
      value.dispose();
    }
  } finally {
    f.dispose();
  }
});
it("reads current named numbering rules and handles invalid indices through native UNO exceptions", /** The getter must not use a stale retained import copy. @returns Nothing. */ () => {
  const f = fixture();
  try {
    f.entry("Styled");
    f.list();
    f.lists.CreateNumberingRules();
    expect(f.mapper.impl.getNumberingProperty(4, 2, "IndentAt")).toBe(2540);
    const rule = f.doc.FindNumRulePtr("WWNum4");
    if (!rule) throw new Error("Missing native rule");
    const format = rule.Get(2).clone();
    format.SetIndentAt(999);
    rule.Set(2, format);
    format.Dispose();
    expect(f.mapper.impl.getNumberingProperty(4, 2, "IndentAt")).toBe(1762);
    expect(f.mapper.impl.getNumberingProperty(4, -1, "IndentAt")).toBe(2540);
    expect(f.mapper.impl.getNumberingProperty(4, 10, "IndentAt")).toBe(0);
    expect(f.mapper.impl.getNumberingProperty(-1, 0, "IndentAt")).toBe(0);
    const legacy = rule.Get(0).clone();
    legacy.SetPositionAndSpaceMode("label-width-and-position");
    rule.Set(0, legacy);
    legacy.Dispose();
    expect(f.mapper.impl.getNumberingProperty(4, 0, "IndentAt")).toBe(0);
  } finally {
    f.dispose();
  }
});
it("applies native startOverride once per concrete list on actual finished paragraphs", /** Two actual XParagraphAppend operations retain shared map ownership and do not restart the second paragraph. @returns Nothing. */ () => {
  const f = fixture();
  try {
    f.entry("Styled");
    const list = f.list();
    list.AddLevel(2);
    list.GetLevel(2)?.SetValue(N.LN_CT_NumLvl_startOverride, 9);
    f.lists.CreateNumberingRules();
    for (let i = 0; i < 2; i++) {
      const context = f.context("Styled");
      f.direct(4);
      f.mapper.impl.finishParagraph(context);
      f.mapper.endParagraphGroup();
    }
    expect(f.doc.paragraphs[0]?.IsListRestart()).toBe(true);
    expect(f.doc.paragraphs[0]?.GetAttrListRestartValue()).toBe(9);
    expect(f.doc.paragraphs[1]?.IsListRestart()).toBe(false);
  } finally {
    f.dispose();
  }
});
it("keeps named-property getter distinctions for absent ListFormat and false LevelIsLegal", /** Native named getter returns void for absent ListFormat and a typed false legal flag. @returns Nothing. */ () => {
  const f = fixture(),
    service = new SwXNumberingRules(f.doc.GetOutlineNumRule());
  try {
    for (const [name, present] of [
      ["ListFormat", false],
      ["LevelIsLegal", true],
    ] as const) {
      const key = unicode(name),
        value = service.getPropertyByIndex(0, key);
      try {
        expect(value.hasValue()).toBe(present);
        if (present) {
          const legal: [boolean] = [true];
          expect(value.extract(legal, "bool")).toBe(true);
          expect(legal[0]).toBe(false);
        }
      } finally {
        value.dispose();
        key.dispose();
      }
    }
  } finally {
    service.release();
    f.dispose();
  }
});

it("excludes ordinary bullet properties from the chapter service while ordinary getters retain native empty font names", /** The native bChapterNum branch suppresses bullet fields even when the selected numbering type is CHAR_SPECIAL. @returns Nothing. */ () => {
  const f = fixture(),
    chapter = new SwXChapterNumbering(f.doc),
    ordinary = new SwXNumberingRules(f.doc.GetOutlineNumRule());
  try {
    const format = f.doc.GetOutlineNumRule().Get(0).clone();
    format.SetNumberingType(SvxNumType.SVX_NUM_CHAR_SPECIAL);
    format.SetBulletChar(0x25cf);
    f.doc.GetOutlineNumRule().Set(0, format);
    format.Dispose();
    expect(chapter.GetPropertiesByIndex(0).bulletChar).toBeUndefined();
    const key = unicode("BulletChar");
    try {
      let rejected = false;
      try {
        const value = chapter.getPropertyByIndex(0, key);
        value.dispose();
      } catch (error) {
        if (!(error instanceof UnknownPropertyException)) throw error;
        rejected = true;
        error.dispose();
      }
      expect(rejected).toBe(true);
    } finally {
      key.dispose();
    }
    const name = unicode("BulletFontName"),
      value = ordinary.getPropertyByIndex(0, name),
      result = new OUString();
    try {
      expect(value.extract(result, "OUString")).toBe(true);
      expect(result.isEmpty()).toBe(true);
    } finally {
      result.dispose();
      value.dispose();
      name.dispose();
    }
  } finally {
    chapter.release();
    ordinary.release();
    f.dispose();
  }
});
import { SvxNumType } from "../../core/doc/number";
import { UnknownPropertyException } from "../../../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import { OUString } from "../../../../sal/inc/rtl/ustring";
