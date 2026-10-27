/** @fileoverview Native RTF current encoding and MSWord snippet to SAL byte emission. */
import { assert, expect, it } from "vitest";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import { FontFamily, FontPitch } from "../../../../tools/inc/fontenum";
import * as E from "../../../../sal/inc/rtl/textenc";
import { applyWriterParagraphList } from "../../core/doc/list";
import { SwNumFormat } from "../../core/doc/number";
import { wwFont, wwFontHelper } from "./wrtw8sty";
import { RES_CHRATR_CJK_FONT, RES_CHRATR_FONT } from "../../../inc/hintids";
import { createWriterDocument } from "../../core/doc/doc";
import { RtfExport } from "./rtfexport";
import { RtfAttributeOutput } from "./rtfattributeoutput";
import { SwWW8AttrIter } from "./wrtw8nds";

it("uses original font charset state only for non-associated font controls", /** Verifies uses original font charset state only for non-associated font controls. @returns Nothing. */ () => {
  const exporter = new RtfExport();
  const output = new RtfAttributeOutput(
    /** Verifies uses original font charset state only for non-associated font controls. @returns Callback result. */ () =>
      7,
    /** Verifies uses original font charset state only for non-associated font controls. @returns Callback result. */ () =>
      0,
    exporter,
  );
  const font = new SvxFontItem(
    FontFamily.FAMILY_ROMAN,
    "漢",
    "",
    FontPitch.PITCH_VARIABLE,
    E.RTL_TEXTENCODING_MS_932,
    RES_CHRATR_FONT,
  );
  expect(exporter.GetDefaultEncoding()).toBe(E.RTL_TEXTENCODING_MS_1252);
  expect(output.OutputCharFontAssoc(font, true)).toBe("\\af7");
  expect(exporter.GetCurrentEncoding()).toBe(E.RTL_TEXTENCODING_MS_1252);
  expect(output.OutputCharFontAssoc(font, false)).toBe("\\f7");
  expect(exporter.GetCurrentEncoding()).toBe(E.RTL_TEXTENCODING_MS_932);
  expect(output.RunText("漢", E.RTL_TEXTENCODING_UTF8, "Ignored")).toBe(
    "\\uc2 \\u28450\\'8a\\'bf\\uc1 ",
  );
  expect(output.RawText("é", E.RTL_TEXTENCODING_MS_1252)).toBe("\\u233\\'e9");
  const unknown = new SvxFontItem(
    FontFamily.FAMILY_DONTKNOW,
    "😀",
    "",
    FontPitch.PITCH_DONTKNOW,
    E.RTL_TEXTENCODING_DONTKNOW,
    RES_CHRATR_FONT,
  );
  output.OutputCharFontAssoc(unknown, false);
  expect(exporter.GetCurrentEncoding()).toBe(exporter.GetDefaultEncoding());
});
it("retains native snippet replacements on the original UTF16 slice", /** Verifies retains native snippet replacements on the original UTF16 slice. @returns Nothing. */ () => {
  const owner = new SwWW8AttrIter();
  expect(owner.GetSnippet("xA\nB\u2011C\u00adD\u0001\u0000y", 1, 9)).toBe(
    "A\vB\u001eC\u001fD\u0000",
  );
  expect(owner.GetSnippet("A\n", 0, 0)).toBe("");
});
it("exports represented text through native snippet and byte fallback emission", /** Verifies exports represented text through native snippet and byte fallback emission. @returns Nothing. */ () => {
  const document = createWriterDocument();
  try {
    const node = document.paragraphs[0];
    assert(node);
    node.SetText("é\nA\u2011B\u00adC\u00a0😀");
    const text = new TextDecoder().decode(new RtfExport().ExportDocument(document));
    expect(text).toContain("\\u233\\'e9\\line A\\_B\\-C\\~\\uc0 \\u-10179\\uc1 \\u-8704\\'3f");
  } finally {
    document.Dispose();
  }
});

it("writes complete native font groups with legacy names, alternate names and encoding reset", /** Verifies writes complete native font groups with legacy names, alternate names and encoding reset. @returns Nothing. */ () => {
  const exporter = new RtfExport();
  const fonts = new wwFontHelper();
  const output = new RtfAttributeOutput(
    /** Verifies writes complete native font groups with legacy names, alternate names and encoding reset. @param font - font value. @returns Callback result. */ (
      font,
    ) => fonts.GetId(font),
    /** Verifies writes complete native font groups with legacy names, alternate names and encoding reset. @returns Callback result. */ () =>
      0,
    exporter,
  );
  const font = new wwFont(
    "Café;Alternate",
    FontPitch.PITCH_VARIABLE,
    FontFamily.FAMILY_ROMAN,
    E.RTL_TEXTENCODING_MS_1252,
  );
  fonts.GetId(font);
  fonts.WriteFontTable(output);
  expect(new TextDecoder().decode(exporter.Strm().GetData())).toBe(
    "{\\f0\\froman\\fprq2\\fcharset0 Caf\\'e9{\\*\\falt Alternate};}",
  );
  expect(exporter.GetCurrentEncoding()).toBe(exporter.GetDefaultEncoding());
});
it("preserves distinct native FFN identities for equal family names in the real export table", /** Verifies preserves distinct native FFN identities for equal family names in the real export table. @returns Nothing. */ () => {
  const document = createWriterDocument();
  try {
    const node = document.paragraphs[0];
    assert(node);
    node.SetText("A");
    node.SetAttr(
      new SvxFontItem(
        FontFamily.FAMILY_ROMAN,
        "Same Native",
        "",
        FontPitch.PITCH_FIXED,
        E.RTL_TEXTENCODING_MS_1252,
        RES_CHRATR_FONT,
      ),
    );
    node.SetAttr(
      new SvxFontItem(
        FontFamily.FAMILY_SWISS,
        "Same Native",
        "",
        FontPitch.PITCH_VARIABLE,
        E.RTL_TEXTENCODING_MS_932,
        RES_CHRATR_CJK_FONT,
      ),
    );
    const text = new TextDecoder().decode(new RtfExport().ExportDocument(document));
    expect(text).toContain("{\\f0\\froman\\fprq1\\fcharset0 Same Native;}");
    expect(text).toContain("{\\f1\\fswiss\\fprq2\\fcharset128 Same Native;}");
  } finally {
    document.Dispose();
  }
});

it("retains original numbering-level first-code-unit emission for non-BMP and zero bullets", /** Verifies retains original numbering-level first-code-unit emission for non-BMP and zero bullets. @returns Nothing. */ () => {
  for (const [bullet, control] of [
    [0x1f600, "\\u-10179 ?"],
    [0, "\\u0 ?"],
  ] as const) {
    const document = createWriterDocument();
    try {
      const node = document.paragraphs[0];
      assert(node);
      applyWriterParagraphList(node, { kind: "bullet", level: 0, listId: "Native Bullets" });
      const rule = node.GetNumRule();
      assert(rule);
      const format = new SwNumFormat(rule.Get(0));
      format.SetBulletChar(bullet);
      rule.Set(0, format);
      const text = new TextDecoder().decode(new RtfExport().ExportDocument(document));
      expect(text).toContain("{\\leveltext \\'01" + control + ";}");
    } finally {
      document.Dispose();
    }
  }
});
