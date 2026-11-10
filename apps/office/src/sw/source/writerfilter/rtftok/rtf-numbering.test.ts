/** @fileoverview Native RTF numeric lists: original format table, defaults, UTF16 positions, geometry and Worker ownership. */
import { afterEach, assert, expect, it } from "vitest";
import { RtfDocumentImpl } from "./rtfdocumentimpl";
import type { SwDoc } from "../../core/doc/doc";
import * as T from "../../../../offapi/com/sun/star/style/NumberingType";
import { SvxAdjust } from "../../../../editeng/inc/svxenum";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { getNumberFormat } from "./rtfdispatchvalue.numbering";
import { ConvertNumberingType, ConvertCustomNumberFormat } from "../dmapper/ConversionHelper";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
const docs: SwDoc[] = [];
afterEach(
  /** Releases actual owners. @returns Nothing. */ () => {
    for (const doc of docs.splice(0)) doc.Dispose();
  },
);
/** Imports a literal multi-level native numbering table. @param levels - Original level groups. @param body - Optional paragraph stream. @returns Real document. */
function read(levels: string, body = String.raw`\ls4\ilvl0 Body\par`) {
  const input =
    String.raw`{\rtf1{\*\listtable{\list` +
    levels +
    String.raw`\listid7}}{\*\listoverridetable{\listoverride\listid7\listoverridecount0\ls4}}` +
    body +
    "}";
  const doc = new RtfDocumentImpl().ResolveBytes(new TextEncoder().encode(input));
  docs.push(doc);
  return doc;
}
/** Wraps one complete level group. @param controls - Literal controls. @returns Group. */
function level(controls: string) {
  return String.raw`{\listlevel` + controls + "}";
}
/** Borrows real rules attached to body. @param doc - Owner. @returns Native rule. */
function rule(doc: SwDoc) {
  const result = doc.paragraphs[0]?.GetNumRule();
  assert(result);
  return result;
}

it.each(
  [
    T.ARABIC,
    T.ROMAN_UPPER,
    T.ROMAN_LOWER,
    T.CHARS_UPPER_LETTER_N,
    T.CHARS_LOWER_LETTER_N,
    T.TEXT_NUMBER,
    T.TEXT_CARDINAL,
    T.TEXT_ORDINAL,
    T.NUMBER_NONE,
    T.NUMBER_NONE,
    T.NUMBER_LOWER_ZH,
    T.NUMBER_LOWER_ZH,
    T.AIU_HALFWIDTH_JA,
    T.IROHA_HALFWIDTH_JA,
    T.FULLWIDTH_ARABIC,
    T.ARABIC,
    T.NUMBER_TRADITIONAL_JA,
    T.ARABIC,
    T.CIRCLE_NUMBER,
    T.FULLWIDTH_ARABIC,
    T.AIU_FULLWIDTH_JA,
    T.IROHA_FULLWIDTH_JA,
    T.ARABIC_ZERO,
    T.CHAR_SPECIAL,
    T.HANGUL_SYLLABLE_KO,
    T.HANGUL_JAMO_KO,
    T.ARABIC,
    T.ARABIC,
    T.CIRCLE_NUMBER,
    T.CIRCLE_NUMBER,
    T.TIAN_GAN_ZH,
    T.DI_ZI_ZH,
    T.ARABIC,
    T.NUMBER_LOWER_ZH,
    T.NUMBER_UPPER_ZH_TW,
    T.NUMBER_LOWER_ZH,
    T.ARABIC,
    T.NUMBER_LOWER_ZH,
    T.NUMBER_UPPER_ZH,
    T.NUMBER_LOWER_ZH,
    T.ARABIC,
    T.NUMBER_DIGITAL_KO,
    T.NUMBER_HANGUL_KO,
    T.NUMBER_LEGAL_KO,
    T.NUMBER_DIGITAL2_KO,
    T.NUMBER_HEBREW,
    T.CHARS_ARABIC,
    T.CHARS_HEBREW,
    T.CHARS_ARABIC_ABJAD,
  ].map(
    /** Binds original RTF index to independent native expectation. @param expected - Numbering type. @param index - RTF code. @returns Fixture. */ (
      expected,
      index,
    ) => [index, expected] as const,
  ),
)(
  "imports original RTF numbering format %i as native type %i",
  /** Full table passes through real mapper, typed setter, rule and Worker. @param code - RTF value. @param expected - Native type. @returns Nothing. */ (
    code,
    expected,
  ) => {
    const doc = read(level(`\\levelnfc${code}{\\leveltext\\'01x;}{\\levelnumbers;}`));
    expect(rule(doc).Get(0).GetNumberingType()).toBe(expected);
    expect(rule(doc).GetName()).toBe("WWNum4");
    expect(rule(doc).IsAutoRule()).toBe(false);
    const restored = decodeWriterDocument(structuredClone(encodeWriterDocument(doc)));
    docs.push(restored);
    expect(rule(restored).Get(0).GetNumberingType()).toBe(expected);
  },
);
it.each([-1, 49, 255, 9999])(
  "keeps unknown RTF code %i as native none",
  /** Original out-of-range fallback is none, not decimal. @param code - Invalid format. @returns Nothing. */ (
    code,
  ) => {
    expect(getNumberFormat(code)).toBe(N.LN_Value_ST_NumberFormat_none);
    expect(
      rule(read(level(`\\levelnfc${code}`)))
        .Get(0)
        .GetNumberingType(),
    ).toBe(T.NUMBER_NONE);
  },
);
it("retains caller defaults and the three original custom formats", /** Native OOXML conversion is shared with list-level materialization. @returns Nothing. */ () => {
  expect(ConvertNumberingType(-1)).toBe(T.ARABIC);
  expect(ConvertNumberingType(-1, T.NUMBER_NONE)).toBe(T.NUMBER_NONE);
  expect(ConvertCustomNumberFormat("001, 002, 003, ...")).toBe(T.ARABIC_ZERO3);
  expect(ConvertCustomNumberFormat("0001, 0002, 0003, ...")).toBe(T.ARABIC_ZERO4);
  expect(ConvertCustomNumberFormat("00001, 00002, 00003, ...")).toBe(T.ARABIC_ZERO5);
  expect(ConvertCustomNumberFormat("00")).toBe(-1);
});
it("uses zero start and Word geometry defaults rather than Writer automatic-rule defaults", /** All properties are set once before paragraphs attach. @returns Nothing. */ () => {
  const native = rule(
    read(level(String.raw`\levelnfc0{\leveltext\'02\'00.;}{\levelnumbers\'01;}`)),
  ).Get(0);
  expect(native.GetStart()).toBe(0);
  expect(native.GetIndentAt()).toBe(0);
  expect(native.GetFirstLineIndent()).toBe(0);
  expect(native.GetListtabPos()).toBe(0);
  expect(native.GetPositionAndSpaceMode()).toBe("label-alignment");
  expect(native.GetListFormat()).toBe("%1%.");
});
it.each([-1, -32768, 0, 1, 32767, 32768, 65535, 65536])(
  "preserves native signed start %i then unsigned16 setter",
  /** Negative source starts request the zero default; nonnegative starts narrow through sal_Int16 and SetStart. @param start - Original start. @returns Nothing. */ (
    start,
  ) => {
    const value = rule(read(level(`\\levelnfc0\\levelstartat${start}`)))
      .Get(0)
      .GetStart();
    expect(value).toBe(start < 0 ? 0 : start & 65535);
  },
);
it("materializes level alignment, tabs, hanging geometry, follow and legal-zero presence through Worker", /** The legal flag is true whenever its sprm is present, including explicit zero. @returns Nothing. */ () => {
  const doc = read(
    level(
      String.raw`\levelnfc1\leveljc2\levelfollow1\levellegal0\li721\fi-361\tx1081{\leveltext\'02\'00);}{\levelnumbers\'01;}`,
    ),
  );
  const restored = decodeWriterDocument(structuredClone(encodeWriterDocument(doc)));
  docs.push(restored);
  for (const owner of [doc, restored]) {
    const value = rule(owner).Get(0);
    expect(value.GetNumAdjust()).toBe(SvxAdjust.Right);
    expect(value.GetIsLegal()).toBe(true);
    expect(value.GetIndentAt()).toBe(721);
    expect(value.GetFirstLineIndent()).toBe(-361);
    expect(value.GetListtabPos()).toBe(1081);
    expect(value.GetLabelFollowedBy()).toBe("space");
    expect(value.GetListFormat()).toBe("%1%)");
  }
});
it("counts level positions in UTF16 and numbers an omitted parent prefix correctly", /** Original level index participates in the LEVELNUMBERS replacement equation. @returns Nothing. */ () => {
  const doc = read(
    level(String.raw`\levelnfc0{\leveltext\'02\'00.;}{\levelnumbers\'01;}`) +
      level(String.raw`\levelnfc0{\leveltext\'02\'01.;}{\levelnumbers\'01;}`),
    String.raw`\ls4\ilvl1 Nested\par`,
  );
  expect(rule(doc).Get(0).GetListFormat()).toBe("%1%.");
  expect(rule(doc).Get(1).GetListFormat()).toBe("%2%.");
});
it("distinguishes a Unicode semicolon invalidating levelnumbers from its ASCII terminator", /** Invalid validity also excludes later list indentation; ordinary semicolons never enter the position array. @returns Nothing. */ () => {
  const invalid = rule(
    read(level(String.raw`\levelnfc0{\leveltext\'02\'00.;}{\levelnumbers\u59?}\li720\fi-360`)),
  ).Get(0);
  expect(invalid.GetListFormat()).toBe("");
  expect(invalid.GetIndentAt()).toBe(0);
  expect(invalid.GetFirstLineIndent()).toBe(0);
  const valid = rule(
    read(level(String.raw`\levelnfc0{\leveltext\'02\'00.;}{\levelnumbers\'01;}\li720\fi-360`)),
  ).Get(0);
  expect(valid.GetListFormat()).toBe("%1%.");
  expect(valid.GetIndentAt()).toBe(720);
  expect(valid.GetFirstLineIndent()).toBe(-360);
});
it("preserves negative Unicode positions and truncates supplementary bullet to the source UTF16 unit", /** Native signed U parameters are not converted to unsigned position indices; ListLevel copies a single code unit for bullets. @returns Nothing. */ () => {
  const value = rule(
    read(level(String.raw`\levelnfc23{\leveltext\'02\u-10179?\u-8903?;}{\levelnumbers\u-1?;}`)),
  ).Get(0);
  expect(value.GetBulletChar()).toBe(0xd83d);
  expect(value.GetListFormat()).toBe("🔹");
});
it("rejects malformed Worker scalar additions before installing the native rule", /** Boundary validation must not admit wrong enum or boolean shapes. @returns Nothing. */ () => {
  const doc = read(level(String.raw`\levelnfc1`));
  for (const patch of [{ numAdjust: 8 }, { nativeNumberingType: 65536 }, { isLegal: 0 }]) {
    const record = structuredClone(encodeWriterDocument(doc));
    Object.assign(record.numRules[0]?.formats[0] ?? {}, patch);
    expect(
      /** Decodes malformed external graph. @returns No document. */ () =>
        decodeWriterDocument(record),
    ).toThrow("numbering level scalar state");
  }
});

it("retains original ordinary-run terminators and hex fallback positions", /** Original resolveChars uses the rewound terminator for ordinary runs and still appends a skipped hex char in LEVELNUMBERS. @returns Nothing. */ () => {
  const literal = rule(
    read(level(String.raw`\levelnfc0{\leveltext\'02\'00.;}{\levelnumbers` + "\u0001;" + "}")),
  ).Get(0);
  expect(literal.GetListFormat()).toBe("\0.");
  const hex = rule(
    read(level(String.raw`\levelnfc0{\leveltext\'02\'00.;}{\levelnumbers\'01;}`)),
  ).Get(0);
  expect(hex.GetListFormat()).toBe("%1%.");
  const fallback = rule(
    read(level(String.raw`\levelnfc0{\leveltext\'02\'00.;}{\levelnumbers\u1\'01;}`)),
  ).Get(0);
  expect(fallback.GetListFormat()).toBe("%0%.");
});
