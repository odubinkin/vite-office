/** @fileoverview Native list-level character context, actual ListLabel styles, numbering UNO assignment and Worker/RTF label transport. */
import { afterEach, assert, expect, it } from "vitest";
import { RtfDocumentImpl } from "./rtfdocumentimpl";
import { RtfExport } from "../../filter/ww8/rtfexport";
import { Font } from "../../../../vcl/source/font/font";
import { SwNumFormat } from "../../core/doc/number";
import { PropertyValue } from "../../../../udkapi/com/sun/star/beans/PropertyValue";
import { FontPitch } from "../../../../tools/inc/fontenum";
import { RTL_TEXTENCODING_SYMBOL } from "../../../../sal/inc/rtl/textenc";
import { SwDoc } from "../../core/doc/doc";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import { SvxCrossedOutItem } from "../../../../editeng/inc/crossedoutitem";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SvxWeightItem } from "../../../../editeng/inc/wghtitem";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { FontWeight, FontStrikeout } from "../../../../tools/inc/fontenum";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import { SwXNumberingRules } from "../../core/unocore/unosett";
import {
  numberingToSequence,
  numberingSequenceType,
  NumberingPropertySequence,
  readNumberingProperty,
} from "../../core/unocore/unosett-properties";
import { DomainMapper } from "../dmapper/DomainMapper";
import { SourceDocumentType } from "../inc/dmapper/DomainMapperFactory";
import { ListLevel, ResolveListLevelCharacters } from "../dmapper/NumberingManager";
import { RTFSprms } from "./rtfsprm";
import { RTFValue } from "./rtfvalue";
import { RTFReferenceProperties } from "./rtfreferenceproperties";
import { stringValue as rtfStringValue } from "./rtfdocumentimpl.character";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { PropertyIds as P } from "../dmapper/PropertyIds";
import { text, unicode } from "../../core/unocore/unocrsrhelper";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import * as H from "../../../inc/hintids";
const docs: SwDoc[] = [];
afterEach(
  /** Destroys actual document graphs. @returns Nothing. */ () => {
    for (const doc of docs.splice(0)) doc.Dispose();
  },
);
/** Imports a valid source list table and concrete override into real Writer rules. @param level - Literal list-level controls. @param header - Extra stylesheet. @param extra - Additional levels. @returns Document. */
function read(level: string, header = "", extra = ""): SwDoc {
  const rtf =
    String.raw`{\rtf1\deff0{\fonttbl{\f0 TextFont;}{\f1 LabelFont;}{\f2 AsianLabel;}{\f3 ComplexLabel;}}` +
    header +
    String.raw`{\*\listtable{\list{\listlevel` +
    level +
    "}" +
    extra +
    String.raw`\listid7}}{\*\listoverridetable{\listoverride\listid7\listoverridecount0\ls4}}\pard\ls4\ilvl0 Body\par Again\par}`;
  const doc = new RtfDocumentImpl().ResolveBytes(new TextEncoder().encode(rtf));
  docs.push(doc);
  return doc;
}
/** Borrows the actual registered native label style, not a flattened font projection. @param doc - Actual document. @param level - Rule level. @returns Actual style. */
function label(doc: SwDoc, level = 0) {
  const rule = doc.paragraphs[0]?.GetNumRule();
  assert(rule);
  const style = rule.Get(level).GetCharFormat();
  assert(style);
  return style;
}
it("imports script-dependent label fonts, size and weight without changing body formatting", /** ListsManager's borrowed map receives native table sprms; CharFontName is separate for a symbol. @returns Nothing. */ () => {
  const doc = read(
      String.raw`\levelnfc23\levelstartat1\loch\f1\dbch\af2\rtlch\af3\b\i\fs36\strike\kerning24{\leveltext\'01\u8226?;}{\levelnumbers;}`,
    ),
    style = label(doc),
    set = style.GetAttrSet();
  expect(style.GetName()).toBe("ListLabel 1");
  expect(set.GetItemIfSet(H.RES_CHRATR_FONT, false)).toBeUndefined();
  for (const [which, name] of [
    [H.RES_CHRATR_CJK_FONT, "AsianLabel"],
    [H.RES_CHRATR_CTL_FONT, "ComplexLabel"],
  ] as const) {
    const item = set.Get(which);
    assert(item instanceof SvxFontItem);
    expect(item.GetFamilyName()).toBe(name);
  }
  const weight = set.Get(H.RES_CHRATR_CTL_WEIGHT),
    size = set.Get(H.RES_CHRATR_CTL_FONTSIZE);
  assert(weight instanceof SvxWeightItem);
  assert(size instanceof SvxFontHeightItem);
  expect(weight.GetWeight()).toBe(FontWeight.WEIGHT_BOLD);
  expect(size.GetHeight()).toBe(360);
  expect((set.Get(H.RES_CHRATR_CROSSEDOUT) as SvxCrossedOutItem).GetStrikeout()).toBe(
    FontStrikeout.STRIKEOUT_SINGLE,
  );
  expect((set.Get(H.RES_CHRATR_AUTOKERN) as SfxBoolItem).GetValue()).toBe(true);
  expect(doc.paragraphs[0]?.GetNumRule()?.Get(0).GetBulletFont()?.GetFamilyName()).toBe(
    "LabelFont",
  );
  const node = doc.paragraphs[0];
  assert(node);
  const body = new SfxItemSet(doc.GetAttrPool(), H.WRITER_CHARACTER_WHICH_RANGES);
  try {
    node.GetParaAttr(body, 0, node.Len());
    expect((body.Get(H.RES_CHRATR_WEIGHT) as SvxWeightItem).GetWeight()).toBe(
      FontWeight.WEIGHT_NORMAL,
    );
    expect((body.Get(H.RES_CHRATR_FONT) as SvxFontItem).GetFamilyName()).toBe("TextFont");
  } finally {
    body.Dispose();
  }
  expect(doc.paragraphs[1]?.GetNumRule()?.Get(0).GetCharFormat()).toBe(style);
});
it("retains the Western name for multi-character level text", /** IgnoreForCharStyle uses original UTF16 length rather than numbering kind. @returns Nothing. */ () => {
  const doc = read(String.raw`\levelnfc0\f1\b\fs28{\leveltext\'02ab;}{\levelnumbers;}`),
    style = label(doc);
  const font = style.GetAttrSet().GetItemIfSet(H.RES_CHRATR_FONT, false);
  assert(font instanceof SvxFontItem);
  expect(font.GetFamilyName()).toBe("LabelFont");
  expect((style.GetAttrSet().Get(H.RES_CHRATR_WEIGHT) as SvxWeightItem).GetWeight()).toBe(
    FontWeight.WEIGHT_BOLD,
  );
});
it("allocates after native signed suffix prefixes and creates styles for unused levels", /** The source allocator scans once and every abstract level gets a distinct always-created style. @returns Nothing. */ () => {
  const doc = read(
    String.raw`\levelnfc0{\leveltext\'01a;}{\levelnumbers;}`,
    String.raw`{\stylesheet{\*\cs9 ListLabel 7tail;}}`,
    String.raw`{\listlevel\levelnfc0{\leveltext\'01b;}{\levelnumbers;}}`,
  );
  expect(label(doc).GetName()).toBe("ListLabel 8");
  expect(doc.FindCharFormatByName("ListLabel 9")).toBeDefined();
});
it("preserves native label owner identity through Worker and exports its font", /** Transport must retain actual numbering-to-style links for font collection and attribute output. @returns Nothing. */ () => {
  const doc = read(String.raw`\levelnfc23\f1\b\fs28{\leveltext\'01\u8226?;}{\levelnumbers;}`),
    worker = decodeWriterDocument(structuredClone(encodeWriterDocument(doc)));
  docs.push(worker);
  const style = label(worker);
  expect(style).toBe(worker.FindCharFormatByName("ListLabel 1"));
  expect((style.GetAttrSet().Get(H.RES_CHRATR_WEIGHT) as SvxWeightItem).GetWeight()).toBe(
    FontWeight.WEIGHT_BOLD,
  );
  const bytes = RtfExport.WriteDocument(worker);
  expect(new TextDecoder().decode(bytes)).toContain("LabelFont");
  const reopened = new RtfDocumentImpl().ResolveBytes(bytes);
  docs.push(reopened);
  expect(reopened.paragraphs[0]?.GetNumRule()?.Get(0).GetBulletFont()?.GetFamilyName()).toBe(
    "LabelFont",
  );
});
it("uses native style-property cache and always-create independently", /** Real descriptors attach through the actual document style family. @returns Nothing. */ () => {
  const doc = new SwDoc();
  docs.push(doc);
  const model = new SwXTextDocument(doc),
    mapper = new DomainMapper(model, SourceDocumentType.RTF),
    table = mapper.impl.GetStyleSheetTable();
  const first = table.getOrCreateCharStyle([], true),
    second = table.getOrCreateCharStyle([], false),
    third = table.getOrCreateCharStyle([], true);
  try {
    expect(text(first)).toBe("ListLabel 1");
    expect(text(second)).toBe("ListLabel 1");
    expect(text(third)).toBe("ListLabel 2");
    expect(doc.FindCharFormatByName(text(third))).toBeDefined();
  } finally {
    first.dispose();
    second.dispose();
    third.dispose();
    mapper.dispose();
    model.dispose();
  }
});
it("filters only native geometry and single-symbol Western names", /** Script font exclusions use actual PropertyMap owners and typed values. @returns Nothing. */ () => {
  const level = new ListLevel(),
    font = unicode("Western"),
    name = new Any([font.pData], "OUString"),
    adjust = new Any([0], "sal_Int16");
  try {
    level.Insert(P.PROP_CHAR_FONT_NAME, name);
    level.Insert(P.PROP_CHAR_FONT_NAME_ASIAN, name);
    level.Insert(P.PROP_ADJUST, adjust);
    level.SetBulletChar("x");
    const values = level.GetCharStyleProperties();
    try {
      expect(
        values.map(
          /** Native names only. @param value - Property. @returns Name. */ (value) =>
            text(value.Name),
        ),
      ).toEqual(["CharFontNameAsian"]);
    } finally {
      for (const value of values) {
        value.Name.dispose();
        value.Value.dispose();
      }
    }
  } finally {
    adjust.dispose();
    name.dispose();
    font.dispose();
    level.dispose();
  }
});
it("sets and clears actual numbering character style through typed property sequences", /** Native CharStyleName is published even when empty and resolves to the real document owner. @returns Nothing. */ () => {
  const doc = new SwDoc();
  docs.push(doc);
  const style = doc.MakeCharFormat("Actual Label", undefined),
    service = new SwXNumberingRules(doc);
  for (const name of ["Actual Label", ""]) {
    const sequence = numberingToSequence({ kind: "numbered", suffix: ".", charStyleName: name }),
      value = new Any(sequence.getAddress(), numberingSequenceType);
    try {
      service.replaceByIndex(0, value);
      expect(service.GetNumRule().Get(0).GetCharFormat()).toBe(name ? style : undefined);
    } finally {
      value.dispose();
      sequence.dispose();
    }
    const returned = service.getByIndex(0),
      values = new NumberingPropertySequence();
    try {
      expect(returned.extract(values.getAddress(), numberingSequenceType)).toBe(true);
      let found = false;
      for (let i = 0; i < values.getLength(); ++i) {
        const property = readNumberingProperty(values, i);
        try {
          if (text(property.Name) === "CharStyleName") {
            const string = unicode("");
            try {
              expect(property.Value.extract(string, "OUString")).toBe(true);
              expect(text(string)).toBe(name);
              found = true;
            } finally {
              string.dispose();
            }
          }
        } finally {
          property.Name.dispose();
          property.Value.dispose();
        }
      }
      expect(found).toBe(true);
    } finally {
      returned.dispose();
      values.dispose();
    }
  }
  service.release();
});

it("uses UTF16 symbol length for supplementary and empty level text", /** Native character-style font suppression is independent of numbering type and Unicode scalar count. @returns Nothing. */ () => {
  for (const [value, retained] of [
    [String.raw`\'00`, false],
    [String.raw`\'01x`, false],
    [String.raw`\'02\u-10179?\u-8903?`, true],
  ] as const) {
    const doc = read(
      String.raw`\levelnfc23\f1{\leveltext` + value + String.raw`;}{\levelnumbers;}`,
    );
    expect(label(doc).GetAttrSet().GetItemIfSet(H.RES_CHRATR_FONT, false) !== undefined).toBe(
      retained,
    );
  }
});

it("preserves raw geometry, optional list pattern and complete font on a partial native label patch", /** Source clones the format and sets supplied properties only; DTO replay must not round or reset unrelated values. @returns Nothing. */ () => {
  const doc = new SwDoc();
  docs.push(doc);
  doc.MakeCharFormat("Patch Label", undefined);
  const service = new SwXNumberingRules(doc),
    format = new SwNumFormat(service.GetNumRule().Get(0)),
    font = new Font();
  font.SetFamilyName("Retained Native");
  font.SetPitch(FontPitch.PITCH_FIXED);
  font.SetWeight(FontWeight.WEIGHT_BOLD);
  font.SetCharSet(RTL_TEXTENCODING_SYMBOL);
  format.SetBulletFont(font);
  format.SetPositionAndSpaceMode("label-width-and-position");
  format.SetAbsLSpace(17);
  format.SetFirstLineOffset(-13);
  format.SetListFormat("X%1%Y");
  service.GetNumRule().Set(0, format);
  format.Dispose();
  const key = unicode("CharStyleName"),
    name = unicode("Patch Label"),
    scalar = new Any([name.pData], "OUString"),
    property = new PropertyValue(key, 0, scalar, 0),
    sequence = new NumberingPropertySequence(new Map([[0, property]]), 1),
    value = new Any(sequence.getAddress(), numberingSequenceType);
  try {
    service.replaceByIndex(0, value);
    const updated = service.GetNumRule().Get(0);
    expect(updated.GetAbsLSpace()).toBe(17);
    expect(updated.GetFirstLineOffset()).toBe(-13);
    expect(updated.GetListFormat()).toBe("X%1%Y");
    const retained = updated.GetBulletFont();
    assert(retained);
    expect(retained.GetFamilyName()).toBe("Retained Native");
    expect(retained.GetPitch()).toBe(FontPitch.PITCH_FIXED);
    expect(retained.GetWeight()).toBe(FontWeight.WEIGHT_BOLD);
    expect(retained.GetCharSet()).toBe(RTL_TEXTENCODING_SYMBOL);
    expect(updated.GetCharFormat()).toBe(doc.FindCharFormatByName("Patch Label"));
  } finally {
    value.dispose();
    sequence.dispose();
    property.Name.dispose();
    property.Value.dispose();
    scalar.dispose();
    name.dispose();
    key.dispose();
    service.release();
  }
});

it("retains source UTF8 level-text normalization and single-digit placeholder replacement", /** The original property receiver processes actual resource containers, preserving its percent10 result rather than correcting the regex. @returns Nothing. */ () => {
  const doc = new SwDoc();
  docs.push(doc);
  const model = new SwXTextDocument(doc),
    mapper = new DomainMapper(model, SourceDocumentType.RTF);
  try {
    for (const [input, expected] of [
      ["\u00ad%1", "-%1%"],
      ["A中🔹", "A中🔹"],
      ["%10", "%1%0"],
    ]) {
      const level = new ListLevel(),
        attributes = new RTFSprms(),
        modifiers = new RTFSprms(),
        empty = new RTFSprms();
      attributes.set(N.LN_CT_LevelText_val, rtfStringValue(input as string));
      modifiers.set(N.LN_CT_Lvl_lvlText, new RTFValue(attributes));
      const reference = new RTFReferenceProperties(empty, modifiers);
      try {
        ResolveListLevelCharacters(mapper, level, reference);
        expect(level.GetBulletChar()).toBe(expected);
      } finally {
        reference.dispose();
        empty.dispose();
        modifiers.dispose();
        attributes.dispose();
        level.dispose();
      }
    }
  } finally {
    mapper.dispose();
    model.dispose();
  }
});

it("applies numbering format and suffix in the original property sequence order", /** Native SetSuffix invalidates ListFormat, so replaying a fixed-order object changes the result. @returns Nothing. */ () => {
  const doc = new SwDoc();
  docs.push(doc);
  const service = new SwXNumberingRules(doc);
  for (const formatLast of [false, true]) {
    const properties: PropertyValue[] = [];
    for (const [keyText, valueText] of formatLast
      ? [
          ["Suffix", "!"],
          ["ListFormat", "X%1%Y"],
        ]
      : [
          ["ListFormat", "X%1%Y"],
          ["Suffix", "!"],
        ]) {
      const key = unicode(keyText as string),
        textValue = unicode(valueText as string),
        value = new Any([textValue.pData], "OUString");
      try {
        properties.push(new PropertyValue(key, 0, value, 0));
      } finally {
        key.dispose();
        textValue.dispose();
        value.dispose();
      }
    }
    const sequence = new NumberingPropertySequence(
        {
          get: /** Native generated element addresses. @param offset - Logical address. @returns Actual generated property. */ (
            offset: number,
          ) => properties[offset / 48],
        },
        properties.length,
      ),
      value = new Any(sequence.getAddress(), numberingSequenceType);
    try {
      service.replaceByIndex(0, value);
      const result = service.GetNumRule().Get(0);
      expect(result.HasListFormat()).toBe(formatLast);
      expect(result.GetSuffix()).toBe(formatLast ? "Y" : "!");
    } finally {
      value.dispose();
      sequence.dispose();
      for (const property of properties) {
        property.Name.dispose();
        property.Value.dispose();
      }
    }
  }
  service.release();
});
