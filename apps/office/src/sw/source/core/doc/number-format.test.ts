/** @fileoverview Verifies native format/type/font ownership against unchanged pinned C++ bodies and optional Worker transfer. */
import { expect, it } from "vitest";
import native from "./number-format-native.json";
import {
  SvxNumberFormat,
  SvxNumberType,
  type ConstSvxNumberFormat,
} from "../../../../editeng/source/items/numitem";
import { Font } from "../../../../vcl/source/font/font";
import {
  SwNumFormat,
  SwNumRule,
  SvxNumType,
  createWriterNumFormat,
  getWriterNumFormatBullet,
} from "./number";
import { SwXNumberingRules } from "../unocore/unosett";
import { createWriterDocument } from "./doc";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
/** Projects the implemented native primitive format fields. @param format - Native value. @returns State. */
function state(format: ConstSvxNumberFormat) {
  const p = format.GetPositionProperties();
  return [
    format.GetNumberingType(),
    format.IsShowSymbol(),
    format.GetBulletChar(),
    format.GetBulletFont() !== undefined,
    format.GetBulletFont()?.GetFamilyName() ?? "",
    format.GetStart(),
    format.GetIncludeUpperLevels(),
    p.absLSpace,
    p.firstLineOffset,
    p.charTextDistance,
    p.firstLineIndent,
    p.indentAt,
    p.listTabPosition,
    ["listtab", "nothing", "space"].indexOf(p.labelFollowedBy),
    ["label-width-and-position", "label-alignment"].indexOf(p.positionAndSpaceMode),
    format.GetPrefix(),
    format.GetSuffix(),
    format.HasListFormat(),
  ];
}
it("matches native standalone defaults and unsigned glyph copies", /** Compares both native constructors and scalar narrowing without browser command defaults. @returns Nothing. */ () => {
  for (const [index, type] of [4, 5, 6, 8].entries()) {
    const format = new SvxNumberFormat(type);
    expect(state(format)).toEqual(native.values.defaults[index]);
    expect(state(new SvxNumberFormat(format))).toEqual(native.values.defaults[index]);
  }
  const format = new SwNumFormat();
  expect(state(format)).toEqual(native.values.defaults[4]);
  expect(state(new SvxNumberFormat())).toEqual(native.values.defaults[0]);
  expect(format.GetRegisteredIn()).toBeUndefined();
  expect(format).toBeInstanceOf(SvxNumberType);
  expect(format).toBeInstanceOf(SvxNumberFormat);
  expect(new SvxNumberType().GetNumberingType()).toBe(SvxNumType.SVX_NUM_ARABIC);
  for (const [index, glyph] of [0, 1, 61589, 128578, 4294967295, -1].entries()) {
    format.SetBulletChar(glyph);
    expect(state(format.clone())).toEqual(native.values.glyphs[index]);
  }
  expect(getWriterNumFormatBullet(undefined)).toBeUndefined();
  expect(
    /** Rejects an opaque non-Unicode glyph at the explicit projection boundary. @returns Glyph. */ () =>
      getWriterNumFormatBullet(format),
  ).toThrow(RangeError);
  expect(
    /** Rejects multiple code points in browser assembly. @returns Format. */ () =>
      createWriterNumFormat("numbered", "ab"),
  ).toThrow("one Unicode code point");
});
it("matches native optional font copies and value equality", /** Compares absent/present-empty and input-copy ownership through unchanged native Font/format bodies. @returns Nothing. */ () => {
  const font = new Font(),
    unchanged = new Font(font),
    format = new SvxNumberFormat();
  format.SetBulletFont(font);
  expect(state(format)).toEqual(native.values.fonts[0]);
  font.SetFamilyName("changed");
  expect(state(format)).toEqual(native.values.fonts[1]);
  expect(unchanged.GetFamilyName()).toBe("");
  unchanged.SetFamilyName("");
  expect(unchanged.Equals(new Font())).toBe(true);
  expect(unchanged.Equals(font)).toBe(false);
  font.SetFamilyName("OpenSymbol");
  format.SetBulletFont(font);
  const copy = new SvxNumberFormat(format);
  font.SetFamilyName("changed-again");
  expect(state(copy)).toEqual(native.values.fonts[2]);
  expect(copy.Equals(format)).toBe(true);
  copy.SetBulletFont(undefined);
  expect(state(copy)).toEqual(native.values.fonts[3]);
  expect(copy.Equals(format)).toBe(false);
  for (const [change, expected] of native.values.equality.entries()) {
    const a = new SwNumFormat(),
      b = a.clone();
    if (change === 1) b.SetShowSymbol(false);
    if (change === 2) b.SetNumberingType(SvxNumType.SVX_NUM_NUMBER_NONE);
    if (change === 3) b.SetBulletChar(128578);
    if (change === 4) b.SetBulletFont(unchanged);
    if (change === 5) b.SetBulletFont(font);
    expect(a.Equals(b)).toBe(expected);
    expect(b.Equals(a)).toBe(expected);
    expect(b.clone().Equals(b)).toBe(true);
  }
});
it("matches native NumberType formatting visibility legal coercion and signed32 input", /** Compares 144 source-generated traces for all currently implemented numbering families. @returns Nothing. */ () => {
  for (const [type, show, legal, input, expected, isText] of native.strings) {
    const original = new SvxNumberType(type as SvxNumType);
    original.SetShowSymbol(show as boolean);
    const copied = new SvxNumberType(original);
    copied.SetNumberingType(type as SvxNumType);
    expect(copied.GetNumStr(input as number, "en-US", legal as boolean)).toBe(expected);
    expect(copied.IsTextFormat()).toBe(isText);
    expect(copied.IsShowSymbol()).toBe(show);
  }
  expect(new SvxNumberType().GetNumStr(7)).toBe("7");
});
it("preserves native marker ownership through Worker v16 and legacy records", /** Verifies present-empty/absent fonts, opaque uint32 markers, hidden state, migration and malformed ownership metadata. @returns Nothing. */ () => {
  const document = createWriterDocument(),
    rule = new SwNumRule("native", "label-alignment");
  for (let level = 0; level < 4; level++) {
    const format = new SwNumFormat();
    format.SetBulletChar([0, 61589, 128578, 4294967295][level] as number);
    format.SetShowSymbol(false);
    if (level === 1) format.SetBulletFont(new Font());
    if (level === 2) {
      const font = new Font();
      font.SetFamilyName("OpenSymbol");
      format.SetBulletFont(font);
    }
    rule.Set(level, format);
  }
  document.AddNumRule(rule);
  const record = encodeWriterDocument(document),
    restored = decodeWriterDocument(record).GetNumRuleTable()[0] as SwNumRule;
  for (let level = 0; level < 4; level++)
    expect(state(restored.Get(level))).toEqual(state(rule.Get(level)));
  const legacy = structuredClone(record);
  for (const format of legacy.numRules[0]?.formats ?? []) {
    delete (format as { bulletGlyph?: number }).bulletGlyph;
    delete (format as { bulletFontPresent?: boolean }).bulletFontPresent;
    delete (format as { showSymbol?: boolean }).showSymbol;
  }
  const migrated = decodeWriterDocument(legacy).GetNumRuleTable()[0] as SwNumRule;
  expect(migrated.Get(1).GetBulletFont()).toBeUndefined();
  expect(migrated.Get(2).GetBulletFont()?.GetFamilyName()).toBe("OpenSymbol");
  expect(migrated.Get(0).IsShowSymbol()).toBe(true);
  for (const mutation of [
    { bulletFontPresent: 1 },
    { showSymbol: 1 },
    { bulletGlyph: -1 },
    { bulletGlyph: 0.5 },
    { bulletGlyph: 4294967296 },
  ]) {
    const malformed = structuredClone(record);
    Object.assign(malformed.numRules[0]?.formats[0] as object, mutation);
    expect(
      /** Rejects malformed native marker metadata. @returns Document. */ () =>
        decodeWriterDocument(malformed),
    ).toThrow("marker ownership");
  }
});

it("retains copied font presence and visibility when UNO changes supported properties", /** Checks the real native copy-then-update boundary for absent, present-empty and named font values. @returns Nothing. */ () => {
  for (const family of [undefined, "", "OpenSymbol"]) {
    const rule = new SwNumRule("copy properties", "label-alignment");
    const format = new SwNumFormat();
    format.SetShowSymbol(false);
    if (family !== undefined) {
      const font = new Font();
      font.SetFamilyName(family);
      format.SetBulletFont(font);
    }
    rule.Set(0, format);
    const before = rule.Get(0);
    new SwXNumberingRules(rule).replaceByIndex(0, { kind: "numbered", suffix: ")", indentAt: 127 });
    expect(rule.Get(0).IsShowSymbol()).toBe(false);
    expect(rule.Get(0).GetBulletFont() !== undefined).toBe(family !== undefined);
    expect(rule.Get(0).GetBulletFont()?.GetFamilyName()).toBe(family);
    expect(rule.Get(0).GetIndentAt()).toBe(72);
    expect(rule.Get(0).GetSuffix()).toBe(")");
    expect(before.GetSuffix()).toBe("");
    expect(before.IsShowSymbol()).toBe(false);
    expect(rule.Get(0)).not.toBe(before);
  }
});
