/** @fileoverview Native imported stylesheet identity, defaults and DomainMapper inheritance contracts without substituting pooled Writer style values. */
import { expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { StyleSheetTable as Table, StyleSheetEntry as Entry, StyleType } from "./StyleSheetTable";
import { DomainMapper } from "./DomainMapper";
import { ContextType as C } from "./DomainMapper_Impl";
import { PropertyIds as P } from "./PropertyIds";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { stringAny } from "../../core/unocore/unocrsrhelper";
import { createWriterDocument } from "../../core/doc/doc";
import { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import { OOXMLProperty, OOXMLPropertyType, OOXMLValue as V } from "../ooxml/OOXMLPropertySet";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import {
  FontSlant,
  cppu_detail_getUnoType_FontSlant as slantType,
} from "../../../../offapi/com/sun/star/awt/FontSlant";

/** Creates original entry fields before native completion admission. @param id - Word ID. @param name - Word UI name. @param parent - Base ID. @returns Entry. */
function entry(id: string, name: string, parent = ""): Entry {
  const e = new Entry();
  e.m_sStyleIdentifierD = id;
  e.m_sStyleName = name;
  e.m_sBaseStyleIdentifier = parent;
  return e;
}
/** Extracts and destroys an owned native scalar. @param value - Owned Any. @returns Number or undefined. */
function scalar(value: Any): number | undefined {
  try {
    const n: [number] = [0];
    return value.extract(n, "double") ? n[0] : undefined;
  } finally {
    value.dispose();
  }
}

const nativeStyles =
  "../../vendor/libreoffice-reference/sw/source/writerfilter/dmapper/StyleSheetTable.cxx";
it.skipIf(!existsSync(nativeStyles))(
  "matches every original built-in style name against the pinned conversion table",
  /** Validates the full copied data contract against source, including empty and reserved names. @returns Nothing. */ () => {
    const source = readFileSync(nativeStyles, "utf8");
    const start = source.indexOf("static const std::map< OUString, OUString> StyleNameMap"),
      end = source.indexOf("\n    };", start);
    const pairs = [...source.slice(start, end).matchAll(/\{ "([^"]*)", "([^"]*)" \}/g)];
    expect(pairs).toHaveLength(439);
    const names = new Map<string, string>();
    for (const pair of pairs)
      if (!names.has(pair[1] as string)) names.set(pair[1] as string, pair[2] as string);
    const reserved = new Set(names.values());
    for (const [name, converted] of names) {
      const expected =
        converted !== ""
          ? converted
          : reserved.has(name) || name.endsWith(" (WW)")
            ? name + " (WW)"
            : name;
      expect(Table.ConvertStyleName(name), name).toEqual([expected, true]);
    }
  },
);

it("preserves native constructor defaults, exact built-in names and reserved-name collisions", /** Verifies original conversion table branches and entry defaults. @returns Nothing. */ () => {
  const table = new Table(),
    e = new Entry();
  expect(e.m_nStyleTypeCode).toBe(StyleType.Unknown);
  expect(e.m_bIsDefaultStyle).toBe(false);
  for (const id of [P.PROP_CHAR_HEIGHT, P.PROP_CHAR_HEIGHT_ASIAN, P.PROP_CHAR_HEIGHT_COMPLEX])
    expect(scalar(table.GetDefaultCharProps().getProperty(id)?.[1] as Any)).toBe(10);
  expect(Table.ConvertStyleName("Normal")).toEqual(["Standard", true]);
  expect(Table.ConvertStyleName("normal")).toEqual(["normal", false]);
  expect(Table.ConvertStyleName("heading 1")).toEqual(["Heading 1", true]);
  expect(Table.ConvertStyleName("Index 4")).toEqual(["Index 4", true]);
  expect(Table.ConvertStyleName("Standard")).toEqual(["Standard (WW)", false]);
  expect(Table.ConvertStyleName("own (WW)")).toEqual(["own (WW) (WW)", false]);
  expect(table.FindDefaultParaStyle()).toBeNull();
  table.AppendEntry(e);
  table.dispose();
});

it("preserves first duplicate ID, ordered converted-name lookup and native current/default identities", /** Checks original maps independently of model pool styles. @returns Nothing. */ () => {
  const table = new Table(),
    first = entry("id", "Normal"),
    duplicate = entry("id", "other"),
    same = entry("same", "Normal");
  table.AppendEntry(first);
  table.AppendEntry(duplicate);
  table.AppendEntry(same);
  expect(table.FindStyleSheetByISTD("id")).toBe(first);
  expect(table.FindStyleSheetByConvertedStyleName("Standard")).toBe(first);
  expect(table.FindStyleSheetByConvertedStyleName("missing")).toBeNull();
  expect(table.ConvertStyleNameExt("id")).toBe("Standard");
  first.m_sConvertedStyleName = "";
  expect(table.ConvertStyleNameExt("id")).toBe("Standard");
  expect(table.ConvertStyleNameExt("missing")).toBe("missing");
  table.SetDefaultParaStyleName("same");
  expect(table.FindDefaultParaStyle()).toBe(same);
  expect(table.GetCurrentEntry()).toBeNull();
  table.SetCurrentEntry(same);
  expect(table.GetCurrentEntry()).toBe(same);
  table.SetCurrentEntry(null);
  const n = new Any([1], "sal_Int32"),
    second = new Any([2], "sal_Int32");
  table.SetDefaultParaProps(P.PROP_PARA_TOP_MARGIN, n);
  table.SetDefaultParaProps(P.PROP_PARA_TOP_MARGIN, second);
  n.dispose();
  second.dispose();
  expect(scalar(table.GetDefaultParaProps().getProperty(P.PROP_PARA_TOP_MARGIN)?.[1] as Any)).toBe(
    1,
  );
  expect(table.GetDefaultParaProps().isDocDefault(P.PROP_PARA_TOP_MARGIN)).toBe(true);
  table.dispose();
});

it("follows native parent/style/paragraph-default/character-default precedence and direct-self guard", /** Uses actual native typed property maps and original output flag. @returns Nothing. */ () => {
  const model = new SwXTextDocument(createWriterDocument()),
    mapper = new DomainMapper(model, SourceDocumentType.OOXML),
    impl = mapper.impl,
    table = impl.GetStyleSheetTable();
  const parent = entry("base", "Normal"),
    child = entry("child", "child", "base"),
    self = entry("self", "self", "self");
  for (const e of [parent, child, self]) table.AppendEntry(e);
  const one = new Any([1], "sal_Int32"),
    two = new Any([2], "sal_Int32");
  parent.m_pProperties.Insert(P.PROP_CHAR_COLOR, one);
  child.m_pProperties.Insert(P.PROP_CHAR_HEIGHT, two, false, undefined, true);
  table.SetDefaultParaProps(P.PROP_CHAR_HEIGHT, one);
  table.SetDefaultParaProps(P.PROP_PARA_TOP_MARGIN, one);
  const flag: [boolean] = [false];
  expect(scalar(impl.GetPropertyFromStyleSheet(P.PROP_CHAR_COLOR, child, true, true, flag))).toBe(
    1,
  );
  expect(flag[0]).toBe(false);
  expect(scalar(impl.GetPropertyFromStyleSheet(P.PROP_CHAR_HEIGHT, child, true, true, flag))).toBe(
    2,
  );
  expect(flag[0]).toBe(true);
  expect(scalar(impl.GetPropertyFromStyleSheet(P.PROP_CHAR_HEIGHT, null, true, true, flag))).toBe(
    1,
  );
  expect(flag[0]).toBe(true);
  expect(scalar(impl.GetPropertyFromStyleSheet(P.PROP_CHAR_HEIGHT, null, true, false, flag))).toBe(
    10,
  );
  expect(
    scalar(impl.GetPropertyFromStyleSheet(P.PROP_PARA_TOP_MARGIN, self, true, true, flag)),
  ).toBe(1);
  expect(
    scalar(impl.GetPropertyFromStyleSheet(P.PROP_CHAR_COLOR, self, true, true, flag)),
  ).toBeUndefined();
  expect(flag[0]).toBe(false);
  expect(
    scalar(impl.GetPropertyFromStyleSheet(P.PROP_CHAR_HEIGHT, null, false, true)),
  ).toBeUndefined();
  expect(scalar(impl.GetPropertyFromStyleSheet(P.PROP_CHAR_HEIGHT, null, true, false))).toBe(10);
  expect(
    scalar(impl.GetPropertyFromStyleSheet(P.PROP_PARA_BOTTOM_MARGIN, null, true, true)),
  ).toBeUndefined();
  expect(scalar(impl.GetPropertyFromStyleSheet(P.PROP_PARA_TOP_MARGIN, null, true, true))).toBe(1);
  expect(impl.GetCurrentParaStyleName()).toBe("Standard");
  impl.SetStyleSheetImport(true);
  expect(impl.GetCurrentParaStyleName()).toBe("");
  expect(impl.GetDefaultParaStyleName()).toBe("Standard");
  table.SetDefaultParaStyleName("child");
  expect(impl.GetDefaultParaStyleName()).toBe("child");
  table.SetCurrentEntry(child);
  expect(scalar(impl.GetPropertyFromParaStyleSheet(P.PROP_CHAR_COLOR))).toBe(1);
  impl.SetStyleSheetImport(false);
  expect(impl.GetDefaultParaStyleName()).toBe("child");
  table.SetDefaultParaStyleName("base");
  expect(impl.GetDefaultParaStyleName()).toBe("child");
  impl.SetCurrentParaStyleName("child");
  expect(scalar(impl.GetPropertyFromParaStyleSheet(P.PROP_CHAR_COLOR))).toBe(1);
  const context = impl.PushProperties(C.CONTEXT_PARAGRAPH),
    name = stringAny("Standard");
  context.Insert(P.PROP_PARA_STYLE_NAME, name);
  name.dispose();
  expect(impl.GetCurrentParaStyleName()).toBe("Standard");
  expect(scalar(impl.GetPropertyFromParaStyleSheet(P.PROP_CHAR_COLOR))).toBe(1);
  context.Insert(P.PROP_PARA_STYLE_NAME, one);
  expect(impl.GetCurrentParaStyleName()).toBe("child");
  one.dispose();
  two.dispose();
  mapper.dispose();
  model.dispose();
});

it("inverts 129 against imported style properties and DocDefaults rather than Writer pool defaults or prior direct runs", /** Verifies float/short/enum/absent native branches. @returns Nothing. */ () => {
  const model = new SwXTextDocument(createWriterDocument()),
    mapper = new DomainMapper(model, SourceDocumentType.OOXML),
    table = mapper.impl.GetStyleSheetTable(),
    style = entry("Normal", "Normal");
  table.AppendEntry(style);
  mapper.startParagraphGroup();
  mapper.startCharacterGroup();
  for (const [token, property, value, expected] of [
    [N.LN_EG_RPrBase_b, P.PROP_CHAR_WEIGHT, new Any([150], "float"), 100],
    [N.LN_EG_RPrBase_bCs, P.PROP_CHAR_WEIGHT_COMPLEX, new Any([100], "float"), 150],
    [N.LN_EG_RPrBase_i, P.PROP_CHAR_POSTURE, new Any([FontSlant.ITALIC], slantType), 0],
    [N.LN_EG_RPrBase_iCs, P.PROP_CHAR_POSTURE_COMPLEX, new Any([FontSlant.NONE], slantType), 2],
    // Native generated enum sentinel narrows to negative signed16; source keeps129 after its diagnostic branch.
    [N.LN_EG_RPrBase_i, P.PROP_CHAR_POSTURE, new Any([FontSlant.MAKE_FIXED_SIZE], slantType), 2],
    [N.LN_EG_RPrBase_strike, P.PROP_CHAR_STRIKEOUT, new Any([1], "sal_Int16"), 0],
    [N.LN_EG_RPrBase_dstrike, P.PROP_CHAR_STRIKEOUT, new Any([0], "sal_Int16"), 2],
  ] as const) {
    style.m_pProperties.Insert(property, value);
    value.dispose();
    mapper.sprm(new OOXMLProperty(token, V.createInteger(129), OOXMLPropertyType.SPRM));
    const current = (
        mapper.impl.GetTopContext() as import("./PropertyMap").PropertyMap
      ).getProperty(property)?.[1] as Any,
      out: [number] = [0];
    try {
      if (!current.extract(out, "double")) {
        const e: [FontSlant] = [FontSlant.NONE];
        current.extract(e, slantType);
        out[0] = e[0];
      }
      expect(out[0]).toBe(expected);
    } finally {
      current.dispose();
    }
  }
  style.m_pProperties.Erase(P.PROP_CHAR_WEIGHT);
  mapper.sprm(new OOXMLProperty(N.LN_EG_RPrBase_b, V.createInteger(129), OOXMLPropertyType.SPRM));
  expect(
    scalar(
      (mapper.impl.GetTopContext() as import("./PropertyMap").PropertyMap).getProperty(
        P.PROP_CHAR_WEIGHT,
      )?.[1] as Any,
    ),
  ).toBe(150);
  mapper.dispose();
  model.dispose();
});

/** @fileoverview Checks pinned Word style aliases, reserved Writer names and suffix ownership. */

it.each([
  ["Normal", "Standard", true],
  ["BodyText", "Text body", true],
  ["BodyTextIndent", "Text body indent", true],
  ["Footnote Text", "Footnote", true],
  ["Endnote Text", "Endnote", true],
  ["Annotation Text", "Marginalia", true],
  ["Standard", "Standard (WW)", false],
  ["Text body", "Text body (WW)", false],
  ["Custom (WW)", "Custom (WW) (WW)", false],
  ["Normal Table", "Normal Table (WW)", true],
  ["Normal (Web)", "Normal (Web)", true],
  ["body text", "body text", false],
  ["", " (WW)", true],
] as const)(
  "converts %s with the source builtin and reserved-name rules",
  /** Checks the name pair and recognition flag together. @param name - Input Word name. @param converted - Source Writer name. @param recognized - Source builtin recognition. @returns Nothing. */ (
    name,
    converted,
    recognized,
  ) => {
    expect(Table.ConvertStyleName(name)).toEqual([converted, recognized]);
  },
);

it("preserves native sorted property duplicates and independent Sequence return lifetimes", /** Actual PropertyValue, OUString, Any and Sequence owners retain their copied content after source values and vector are destroyed. @returns Nothing. */ () => {
  const sorted = new PropValVector();
  for (const [name, number] of [
    ["Z", 1],
    ["A", 2],
    ["A", 3],
    ["M", 4],
  ] as const) {
    const key = unicode(name),
      value = new Any([number], "sal_Int32");
    const property = new PropertyValue();
    try {
      property.Name = key;
      property.Value = value;
      sorted.Insert(property);
    } finally {
      property.Value.dispose();
      property.Name.dispose();
      key.dispose();
      value.dispose();
    }
  }
  const names = sorted.getNames(),
    values = sorted.getValues();
  sorted.dispose();
  try {
    const actual: unknown[] = [];
    for (let index = 0; index < names.getLength(); ++index) {
      const name = OUString.unacquired(
        (names.getConstArray() as SequenceElements).get(index * 8) as rtl_uStringSlot,
      );
      const value = new Any((values.getConstArray() as SequenceElements).get(index * 24) as Any);
      const n: [number] = [0];
      try {
        expect(value.extract(n, "sal_Int32")).toBe(true);
        actual.push([text(name), n[0]]);
      } finally {
        value.dispose();
      }
    }
    expect(actual).toEqual([
      ["A", 2],
      ["A", 3],
      ["M", 4],
      ["Z", 1],
    ]);
  } finally {
    names.dispose();
    values.dispose();
  }
});
import { PropValVector } from "./StyleSheetTable";
import { unicode, text } from "../../core/unocore/unocrsrhelper";
import { PropertyValue } from "../../../../udkapi/com/sun/star/beans/PropertyValue";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import type { SequenceElements } from "../../../../cppu/inc/com/sun/star/uno/Sequence";

import type { rtl_uStringSlot } from "../../../../sal/inc/rtl/ustring.h";

import { SourceDocumentType } from "../inc/dmapper/DomainMapperFactory";
