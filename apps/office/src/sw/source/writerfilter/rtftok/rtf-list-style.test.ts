/** @fileoverview Native RTF pStyle resolution, stylesheet numbering metadata, source AddParaProperties index behavior and chapter suitability weights. */
import { afterEach, assert, expect, it, vi } from "vitest";
import { RtfDocumentImpl } from "./rtfdocumentimpl";
import { SwDoc } from "../../core/doc/doc";
import { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import { DomainMapper } from "../dmapper/DomainMapper";
import { SourceDocumentType } from "../inc/dmapper/DomainMapperFactory";
import { StyleSheetEntry, StyleType } from "../dmapper/StyleSheetTable";
import {
  AbstractListDef,
  ListDef,
  ListLevel,
  ResolveListLevelCharacters,
} from "../dmapper/NumberingManager";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { PropertyIds as P } from "../dmapper/PropertyIds";
import { RTFReferenceProperties } from "./rtfreferenceproperties";
import { RTFSprms } from "./rtfsprm";
import { stringValue } from "./rtfdocumentimpl.character";
import { text, unicode } from "../../core/unocore/unocrsrhelper";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
const docs: SwDoc[] = [];
afterEach(
  /** Releases actual native graphs and test spies. @returns Nothing. */ () => {
    vi.restoreAllMocks();
    for (const doc of docs.splice(0)) doc.Dispose();
  },
);
/** Parses literal source through actual native containers. @param input - Literal RTF. @returns Document. */
function read(input: string) {
  const doc = new RtfDocumentImpl().ResolveBytes(new TextEncoder().encode(input));
  docs.push(doc);
  return doc;
}
/** Creates a native entry with typed paragraph margins and source identity. @param name - Original identifier. @returns Native entry. */
function entry(name = "Custom") {
  const style = new StyleSheetEntry();
  style.m_sStyleIdentifierD = name;
  style.m_sStyleName = name;
  style.m_nStyleTypeCode = StyleType.Paragraph;
  for (const [id, amount] of [
    [P.PROP_PARA_FIRST_LINE_INDENT, 127],
    [P.PROP_PARA_LEFT_MARGIN, 254],
  ] as const) {
    const value = new Any([amount], "sal_Int32");
    try {
      style.m_pProperties.Insert(id, value);
    } finally {
      value.dispose();
    }
  }
  return style;
}
/** Projects a returned typed vector and releases its owned values. @param level - Actual native level. @param defaults - Original default selector. @returns Independent native property tuples. */
function properties(level: ListLevel, defaults: boolean) {
  const values = level.GetProperties(defaults);
  try {
    return values.map(
      /** Decodes the numeric cases under test only. @param property - Native property. @returns Typed name/value. */ (
        property,
      ) => {
        const value: [number] = [0];
        expect(property.Value.extract(value, "sal_Int32")).toBe(true);
        return [text(property.Name), value[0]] as const;
      },
    );
  } finally {
    for (const value of values) {
      value.Name.dispose();
      value.Value.dispose();
    }
  }
}
it("resolves pStyle through the actual stylesheet and retains an existing style when resolution fails", /** SetParaStyle ignores null; there is no name-only placeholder. @returns Nothing. */ () => {
  const doc = new SwDoc();
  docs.push(doc);
  const model = new SwXTextDocument(doc),
    mapper = new DomainMapper(model, SourceDocumentType.RTF),
    style = entry(),
    level = new ListLevel(),
    empty = new RTFSprms(),
    modifiers = new RTFSprms();
  mapper.impl.GetStyleSheetTable().AppendEntry(style);
  try {
    for (const name of ["Custom", "Unknown"]) {
      modifiers.set(N.LN_CT_Lvl_pStyle, stringValue(name));
      const reference = new RTFReferenceProperties(empty, modifiers);
      try {
        ResolveListLevelCharacters(mapper, level, reference);
        expect(level.GetParaStyle()).toBe(style);
      } finally {
        reference.dispose();
      }
    }
    level.SetParaStyle(null);
    expect(level.GetParaStyle()).toBe(style);
  } finally {
    level.dispose();
    empty.dispose();
    modifiers.dispose();
    mapper.dispose();
    model.dispose();
  }
});
it("preserves native index-to-bool omission when both geometry properties are absent", /** Native find returns minus1, converted to true, so no paragraph geometry is added. @returns Nothing. */ () => {
  const style = entry(),
    level = new ListLevel();
  level.SetParaStyle(style);
  try {
    expect(properties(level, false)).toEqual([]);
  } finally {
    level.dispose();
    style.dispose();
  }
});
it("retains the duplicate geometry property when the original property's index is zero", /** The source false condition at index0 appends another value from paragraph style instead of preserving only the explicit level value. @returns Nothing. */ () => {
  for (const [id, name, expected] of [
    [P.PROP_FIRST_LINE_INDENT, "FirstLineIndent", 127],
    [P.PROP_INDENT_AT, "IndentAt", 254],
  ] as const) {
    const style = entry(),
      level = new ListLevel(),
      value = new Any([99], "sal_Int32");
    try {
      level.SetParaStyle(style);
      level.Insert(id, value);
      expect(properties(level, false)).toEqual([
        [name, 99],
        [name, expected],
      ]);
    } finally {
      value.dispose();
      level.dispose();
      style.dispose();
    }
  }
});
it("keeps ordinary abstract default geometry ahead of paragraph-style geometry", /** Existing nonzero property positions both convert to true, preserving original zero defaults. @returns Nothing. */ () => {
  const style = entry(),
    level = new ListLevel();
  level.SetParaStyle(style);
  try {
    const values = properties(level, true);
    expect(
      values.filter(
        /** Actual geometry names. @param value - Tuple. @returns Geometry membership. */ (value) =>
          value[0] === "FirstLineIndent" || value[0] === "IndentAt",
      ),
    ).toEqual([
      ["IndentAt", 0],
      ["FirstLineIndent", 0],
    ]);
  } finally {
    level.dispose();
    style.dispose();
  }
});
it.each([
  [1, "Heading One", 9],
  [1, "Custom", 8],
  [4, "Heading One", 2],
  [4, "Custom", 1],
  [4, "heading 1", 1],
  [1, "heading 1", 8],
] as const)(
  "keeps native chapter weight for id%i and %s",
  /** Original ID and case-sensitive Heading bonuses are cumulative. @param id - Concrete ID. @param name - Style identifier. @param expected - Weight. @returns Nothing. */ (
    id,
    name,
    expected,
  ) => {
    const abstract = new AbstractListDef(),
      concrete = new ListDef(),
      style = entry(name);
    abstract.AddLevel(0);
    const level = abstract.GetLevel(0);
    assert(level);
    style.m_pProperties.SetOutlineLevel(0);
    level.SetParaStyle(style);
    level.SetValue(N.LN_CT_NumFmt_val, N.LN_Value_ST_NumberFormat_decimal);
    concrete.SetId(id);
    concrete.SetAbstractDefinition(abstract);
    try {
      expect(concrete.GetChapterNumberingWeight()).toBe(expected);
      style.m_pProperties.SetListLevel(1);
      expect(concrete.GetChapterNumberingWeight()).toBe(0);
      style.m_pProperties.SetListLevel(-1);
      style.m_pProperties.SetOutlineLevel(9);
      expect(concrete.GetChapterNumberingWeight()).toBe(0);
    } finally {
      concrete.dispose();
      abstract.dispose();
      style.dispose();
    }
  },
);
it("treats missing and explicitly none numbering as no chapter weight", /** Weight conversion uses NUMBER_NONE as its caller fallback rather than the numeric writer's ARABIC fallback. @returns Nothing. */ () => {
  const abstract = new AbstractListDef(),
    concrete = new ListDef(),
    style = entry("Heading 1");
  abstract.AddLevel(0);
  const level = abstract.GetLevel(0);
  assert(level);
  level.SetParaStyle(style);
  style.m_pProperties.SetOutlineLevel(0);
  concrete.SetId(1);
  concrete.SetAbstractDefinition(abstract);
  try {
    expect(concrete.GetChapterNumberingWeight()).toBe(0);
    level.SetValue(N.LN_CT_NumFmt_val, N.LN_Value_ST_NumberFormat_none);
    expect(concrete.GetChapterNumberingWeight()).toBe(0);
  } finally {
    concrete.dispose();
    abstract.dispose();
    style.dispose();
  }
});
it("connects RTF S inside LISTLEVEL to source outline/list metadata and actual paragraph styles", /** The native callback receives the real imported entry, and Worker transports the resulting outline item. This low-weight list does not select chapter numbering. @returns Nothing. */ () => {
  const bind = vi.spyOn(ListLevel.prototype, "SetParaStyle"),
    source = String.raw`{\rtf1{\stylesheet{\s12\outlinelevel2\ls4\ilvl2 Custom Head;}}{\*\listtable{\list{\listlevel\levelnfc0}{\listlevel\levelnfc0}{\listlevel\levelnfc0\s12{\leveltext\'02\'02.;}{\levelnumbers\'01;}}\listid7}}{\*\listoverridetable{\listoverride\listid7\ls4}}\s12\ls4\ilvl2 Heading\par}`;
  const doc = read(source),
    node = doc.paragraphs[0];
  assert(node);
  expect(bind).toHaveBeenCalledWith(
    expect.objectContaining({ m_sStyleIdentifierD: "Custom Head" }),
  );
  expect(node.GetTextFormatColl().GetAttrOutlineLevel()).toBe(3);
  expect(node.GetNumRule()?.GetName()).toBe("WWNum4");
  const worker = decodeWriterDocument(structuredClone(encodeWriterDocument(doc)));
  docs.push(worker);
  expect(worker.paragraphs[0]?.GetTextFormatColl().GetAttrOutlineLevel()).toBe(3);
});
it("uses native signed stylesheet indentation without replaying clamped legacy values", /** Native style pPr is the sole owner for migrated margins; absent basedOn still removes explicit zero geometry. @returns Nothing. */ () => {
  const doc = read(
      String.raw`{\rtf1{\stylesheet{\s4\li-720\ri-360\fi-180 Margin;}{\s5\li0\ri0\fi0 Zero;}}\s4 A\par\s5 B\par}`,
    ),
    model = new SwXTextDocument(doc),
    key = unicode("ParagraphStyles"),
    family = model.getStyleFamilies().getByName(key);
  key.dispose();
  const name = unicode("Margin"),
    style = family.getByName(name);
  name.dispose();
  try {
    for (const [property, expected] of [
      ["ParaLeftMargin", -1270],
      ["ParaRightMargin", -635],
      ["ParaFirstLineIndent", -318],
    ] as const) {
      const key = unicode(property),
        value = style.getPropertyValue(key),
        numeric: [number] = [0];
      try {
        expect(value.extract(numeric, "sal_Int32")).toBe(true);
        expect(numeric[0]).toBe(expected);
      } finally {
        value.dispose();
        key.dispose();
      }
    }
  } finally {
    style.dispose();
    model.dispose();
  }
});

it("retains source list and outline fields on the actual active stylesheet map", /** Numbering style metadata stays separate from the output property's one-based outline conversion. @returns Nothing. */ () => {
  const doc = new SwDoc();
  docs.push(doc);
  const model = new SwXTextDocument(doc),
    mapper = new DomainMapper(model, SourceDocumentType.RTF),
    style = entry(),
    empty = new RTFSprms(),
    numbers = new RTFSprms(),
    modifiers = new RTFSprms();
  numbers.set(N.LN_CT_NumPr_ilvl, new RTFValue(2));
  numbers.set(N.LN_CT_NumPr_numId, new RTFValue(4));
  modifiers.set(N.LN_CT_PPrBase_outlineLvl, new RTFValue(2));
  modifiers.set(N.LN_CT_PPrBase_numPr, new RTFValue(empty, numbers));
  const reference = new RTFReferenceProperties(empty, modifiers);
  mapper.impl.SetStyleSheetImport(true);
  mapper.impl.PushStyleProperties(style.m_pProperties);
  try {
    mapper.props(reference);
    expect(style.m_pProperties.GetOutlineLevel()).toBe(2);
    expect(style.m_pProperties.GetListLevel()).toBe(2);
    expect(style.m_pProperties.props().GetListId()).toBe(4);
    const level = style.m_pProperties.getProperty(P.PROP_NUMBERING_LEVEL);
    assert(level);
    try {
      const value: [number] = [0];
      expect(level[1].extract(value, "sal_Int16")).toBe(true);
      expect(value[0]).toBe(2);
    } finally {
      level[1].dispose();
    }
  } finally {
    mapper.impl.PopProperties(ContextType.CONTEXT_STYLESHEET);
    reference.dispose();
    modifiers.dispose();
    numbers.dispose();
    empty.dispose();
    mapper.dispose();
    model.dispose();
    style.dispose();
  }
});
import { RTFValue } from "./rtfvalue";
import { ContextType } from "../dmapper/DomainMapper_Impl";

it.each([
  [-1, 0],
  [0, 1],
  [8, 9],
  [9, 0],
  [10, 0],
] as const)(
  "maps Word outline %i into actual native style outline %i",
  /** Invalid values are ignored; the explicit Word body value9 maps to native zero. @param input - Original RTF value. @param expected - Native outline level. @returns Nothing. */ (
    input,
    expected,
  ) => {
    const doc = read(
      "{\\rtf1{\\stylesheet{\\s4\\outlinelevel" + input + " Custom;}}\\s4 Text\\par}",
    );
    expect(doc.paragraphs[0]?.GetTextFormatColl().GetAttrOutlineLevel()).toBe(expected);
  },
);
