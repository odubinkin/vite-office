/** @fileoverview Preserves shared native Font metadata in real numbering values and Writer Worker transport. */
import { expect, it } from "vitest";
import { Font } from "../../../../vcl/source/font/font";
import { FontFamily, FontPitch } from "../../../../tools/inc/fontenum";
import { RTL_TEXTENCODING_SYMBOL } from "../../../../sal/inc/rtl/textenc";
import { SwNumFormat, SwNumRule } from "../../../source/core/doc/number";
import { createWriterDocument } from "../../../source/core/doc/doc";
import { encodeWriterDocument, decodeWriterDocument } from "./writer-document-codec";

it("preserves all represented metadata through numbering copies and Worker records", /** Verifies source alias mutation, value comparison, structured cloning and legacy defaults. @returns Nothing. */ () => {
  const font = new Font();
  font.SetFamilyName("OpenSymbol");
  font.SetStyleName("Symbol Regular");
  font.SetFamily(FontFamily.FAMILY_DECORATIVE);
  font.SetPitch(FontPitch.PITCH_FIXED);
  font.SetCharSet(RTL_TEXTENCODING_SYMBOL);
  const format = new SwNumFormat();
  format.SetBulletFont(font);
  const copy = new SwNumFormat(format);
  font.SetStyleName("changed");
  expect(copy.GetBulletFont()?.GetStyleName()).toBe("Symbol Regular");
  expect(copy.Equals(format)).toBe(true);
  format.SetBulletFont(font);
  expect(copy.Equals(format)).toBe(false);
  const document = createWriterDocument(),
    rule = new SwNumRule("metadata", "label-alignment");
  rule.Set(0, copy);
  rule.Set(1, new SwNumFormat());
  document.AddNumRule(rule);
  const record = structuredClone(encodeWriterDocument(document));
  expect(record.numRules[0]?.formats[0]?.bulletFontMetadata).toEqual({
    styleName: "Symbol Regular",
    family: FontFamily.FAMILY_DECORATIVE,
    pitch: FontPitch.PITCH_FIXED,
    charSet: RTL_TEXTENCODING_SYMBOL,
  });
  const restored = decodeWriterDocument(record).GetNumRuleTable()[0] as SwNumRule;
  expect(
    restored
      .Get(0)
      .GetBulletFont()
      ?.Equals(copy.GetBulletFont() as Font),
  ).toBe(true);
  expect(restored.Get(1).GetBulletFont()).toBeUndefined();
  const legacy = structuredClone(record);
  delete (legacy.numRules[0]?.formats[0] as { bulletFontMetadata?: unknown }).bulletFontMetadata;
  const oldFont = decodeWriterDocument(legacy).GetNumRuleTable()[0]?.Get(0).GetBulletFont();
  expect(oldFont?.GetFamilyName()).toBe("OpenSymbol");
  expect([
    oldFont?.GetStyleName(),
    oldFont?.GetFamilyType(),
    oldFont?.GetPitch(),
    oldFont?.GetCharSet(),
  ]).toEqual(["", 0, 0, 0]);
  for (const metadata of [
    null,
    "bad",
    {},
    { styleName: 1, family: 1, pitch: 1, charSet: 10 },
    { styleName: "", family: 1.5, pitch: 1, charSet: 10 },
    { styleName: "", family: 1, pitch: 2147483648, charSet: 10 },
    { styleName: "", family: 1, pitch: 1, charSet: -1 },
    { styleName: "", family: 1, pitch: 1, charSet: 65536 },
  ]) {
    const malformed = structuredClone(record);
    Object.assign(malformed.numRules[0]?.formats[0] as object, { bulletFontMetadata: metadata });
    expect(
      /** Decodes malformed metadata. @returns Document. */ () => decodeWriterDocument(malformed),
    ).toThrow("font metadata");
  }
  const absent = structuredClone(record);
  Object.assign(absent.numRules[0]?.formats[0] as object, { bulletFontPresent: false });
  expect(
    /** Rejects metadata without an owned font. @returns Document. */ () =>
      decodeWriterDocument(absent),
  ).toThrow("font metadata");
});
