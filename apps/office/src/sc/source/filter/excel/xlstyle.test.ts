/** @fileoverview Original XclFontData scalar conversions, copy/reset and XML font emission against actual source value owners. */
import { expect, it } from "vitest";
import { XclFontData } from "../inc/xlstyle";
import { XclExpXmlStream, XclXmlUtils } from "../inc/xestream";
import {
  FontFamily as F,
  FontItalic as I,
  FontWeight as W,
  FontLineStyle as L,
  FontStrikeout as S,
} from "../../../../tools/inc/fontenum";
import { FontSlant } from "../../../../offapi/com/sun/star/awt/FontSlant";
import {
  RTL_TEXTENCODING_APPLE_ROMAN,
  RTL_TEXTENCODING_MS_1252,
} from "../../../../sal/inc/rtl/textenc";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { Color, COL_AUTO } from "../../../../tools/inc/color";
import { ThemeColorType } from "../../../../docmodel/inc/theme/ThemeColorType";
import {
  Transformation,
  TransformationType as T,
} from "../../../../docmodel/inc/color/Transformation";
import { SvxEscapement } from "../../../../editeng/inc/svxenum";
import { ZipStorage } from "../../../../oox/source/helper/zipstorage";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
/** Native owned name assignment. @param font - Actual owner. @param name - Source name. @returns Nothing. */
function name(font: XclFontData, name: string) {
  const value = unicode(name);
  try {
    font.maName.assign(value);
  } finally {
    value.dispose();
  }
}
/** Serializes actual font data to an original output part and independently extracts the XML. @param font - Actual data. @param element - Original name element. @returns XML. */
async function xml(font: XclFontData, element = "name") {
  const owner = new XclExpXmlStream(new ZipStorage(), false, false),
    output = owner.openFragmentStreamWithSerializer("xl/styles.xml", "application/xml");
  output.startElement(
    token("fonts"),
    token("xmlns"),
    "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
  );
  output.startElement(token("font"));
  expect(XclXmlUtils.WriteFontData(output, font, token(element))).toBe(output);
  output.endElement(token("font"));
  output.endElement(token("fonts"));
  output.endDocument();
  const archive = await DocumentArchive.open(await owner.commitStorage());
  return archive.readTextEntry("xl/styles.xml");
}

it("retains native defaults, value copy, style-insensitive equality and Clear complex-color state", /** No default font or theme provider is fabricated. @returns Nothing. */ () => {
  const font = new XclFontData(),
    fresh = new XclFontData();
  try {
    expect(font.mnFamily).toBe(2);
    expect(font.mnHeight).toBe(0);
    expect(font.maComplexColor.getFinalColor().equals(COL_AUTO)).toBe(true);
    name(font, "Arial");
    font.SetScHeight(240);
    font.mbItalic = true;
    const copy = new XclFontData(font),
      style = unicode("metadata");
    try {
      copy.maStyle.assign(style);
      expect(copy.equals(font)).toBe(true);
      name(copy, "Other");
      expect(copy.equals(font)).toBe(false);
      expect(font.maName.getLength()).toBe(5);
      copy.maComplexColor.addTransformation(new Transformation(T.LumMod, 5000));
      copy.Clear();
      expect(copy.maComplexColor.getTransformations()).toHaveLength(1);
      expect(copy.equals(fresh)).toBe(false);
    } finally {
      copy.Dispose();
      style.dispose();
    }
    font.Clear();
    expect(font.equals(fresh)).toBe(true);
  } finally {
    font.Dispose();
    fresh.Dispose();
  }
});

it("preserves native/API family mismatch, Mac fallback and actual Windows charset conversion", /** Source inconsistent family encodings are deliberately retained. @returns Nothing. */ () => {
  const font = new XclFontData();
  try {
    for (const [family, stored] of [
      [F.FAMILY_DONTKNOW, 0],
      [F.FAMILY_DECORATIVE, 5],
      [F.FAMILY_MODERN, 3],
      [F.FAMILY_ROMAN, 1],
      [F.FAMILY_SCRIPT, 4],
      [F.FAMILY_SWISS, 2],
      [F.FAMILY_SYSTEM, 2],
    ] as const) {
      font.SetScFamily(family);
      expect(font.mnFamily).toBe(stored);
    }
    for (const [stored, family] of [
      [1, F.FAMILY_ROMAN],
      [2, F.FAMILY_SWISS],
      [3, F.FAMILY_MODERN],
      [4, F.FAMILY_SCRIPT],
      [5, F.FAMILY_DECORATIVE],
    ] as const) {
      font.mnFamily = stored | 0x10;
      expect(font.GetScFamily(RTL_TEXTENCODING_MS_1252)).toBe(family);
    }
    font.SetScFamily(F.FAMILY_ROMAN);
    expect(font.GetApiFamily()).toBe(1);
    font.SetApiFamily(3);
    expect(font.mnFamily).toBe(3);
    expect(font.GetScFamily(RTL_TEXTENCODING_MS_1252)).toBe(F.FAMILY_MODERN);
    font.SetApiFamily(99);
    expect(font.GetApiFamily()).toBe(0);
    name(font, "gEnEvA");
    expect(font.GetScFamily(RTL_TEXTENCODING_APPLE_ROMAN)).toBe(F.FAMILY_SWISS);
    expect(font.GetScFamily(RTL_TEXTENCODING_MS_1252)).toBe(F.FAMILY_DONTKNOW);
    name(font, "Chicago");
    expect(font.GetScFamily(RTL_TEXTENCODING_APPLE_ROMAN)).toBe(F.FAMILY_SWISS);
    name(font, "Other");
    expect(font.GetScFamily(RTL_TEXTENCODING_APPLE_ROMAN)).toBe(F.FAMILY_DONTKNOW);
    font.SetFontEncoding(RTL_TEXTENCODING_MS_1252);
    expect(font.GetFontEncoding()).toBe(RTL_TEXTENCODING_MS_1252);
    expect(font.GetApiFontEncoding()).toBe(RTL_TEXTENCODING_MS_1252);
    font.SetScFamily(F.FontFamily_FORCE_EQUAL_SIZE);
    expect(font.mnFamily).toBe(0);
  } finally {
    font.Dispose();
  }
});

it("preserves native weight thresholds and lossy posture/underline/escapement/strikeout conversion", /** Actual declared enums and UNO weight conversion are used. @returns Nothing. */ () => {
  const font = new XclFontData();
  try {
    for (const [native, value] of [
      [W.WEIGHT_DONTKNOW, 0],
      [W.WEIGHT_THIN, 100],
      [W.WEIGHT_ULTRALIGHT, 200],
      [W.WEIGHT_LIGHT, 300],
      [W.WEIGHT_SEMILIGHT, 350],
      [W.WEIGHT_NORMAL, 400],
      [W.WEIGHT_MEDIUM, 500],
      [W.WEIGHT_SEMIBOLD, 600],
      [W.WEIGHT_BOLD, 700],
      [W.WEIGHT_ULTRABOLD, 800],
      [W.WEIGHT_BLACK, 900],
    ] as const) {
      font.SetScWeight(native);
      expect(font.mnWeight).toBe(value);
      expect(font.GetScWeight()).toBe(native);
    }
    font.SetScWeight(W.FontWeight_FORCE_EQUAL_SIZE);
    expect(font.mnWeight).toBe(400);
    font.SetApiWeight(150);
    expect(font.GetApiWeight()).toBe(150);
    for (const posture of [I.ITALIC_NONE, I.ITALIC_OBLIQUE, I.ITALIC_NORMAL, I.ITALIC_DONTKNOW]) {
      font.SetScPosture(posture);
      expect(font.GetScPosture()).toBe(
        posture === I.ITALIC_OBLIQUE || posture === I.ITALIC_NORMAL
          ? I.ITALIC_NORMAL
          : I.ITALIC_NONE,
      );
    }
    for (const posture of [
      FontSlant.NONE,
      FontSlant.OBLIQUE,
      FontSlant.ITALIC,
      FontSlant.REVERSE_OBLIQUE,
      FontSlant.REVERSE_ITALIC,
    ]) {
      font.SetApiPosture(posture);
      expect(font.GetApiPosture()).toBe(
        posture === FontSlant.NONE ? FontSlant.NONE : FontSlant.ITALIC,
      );
    }
    for (const [input, result] of [
      [L.LINESTYLE_NONE, 0],
      [L.LINESTYLE_DONTKNOW, 0],
      [L.LINESTYLE_DOUBLE, 2],
      [L.LINESTYLE_DOUBLEWAVE, 2],
      [L.LINESTYLE_DOTTED, 1],
    ] as const) {
      font.SetScUnderline(input);
      expect(font.mnUnderline).toBe(result);
      font.SetApiUnderline(input);
      expect(font.GetApiUnderline()).toBe(result);
    }
    for (const [input, result] of [
      [0, 0x0],
      [33, 1],
      [-33, 2],
    ] as const) {
      font.SetScEscapement(input);
      expect(font.mnEscapem).toBe(result);
      font.SetApiEscapement(input);
      expect(font.GetApiEscapement()).toBe(input);
      expect(font.GetScEscapement()).toBe(
        result === 1
          ? SvxEscapement.Superscript
          : result === 2
            ? SvxEscapement.Subscript
            : SvxEscapement.Off,
      );
    }
    for (const strike of [
      S.STRIKEOUT_NONE,
      S.STRIKEOUT_DONTKNOW,
      S.STRIKEOUT_SINGLE,
      S.STRIKEOUT_DOUBLE,
      S.STRIKEOUT_BOLD,
      S.STRIKEOUT_SLASH,
      S.STRIKEOUT_X,
    ]) {
      font.SetScStrikeout(strike);
      expect(font.GetScStrikeout()).toBe(
        strike === S.STRIKEOUT_NONE || strike === S.STRIKEOUT_DONTKNOW
          ? S.STRIKEOUT_NONE
          : S.STRIKEOUT_SINGLE,
      );
      font.SetApiStrikeout(strike);
      expect(font.GetApiStrikeout()).toBe(font.mbStrikeout ? 1 : 0);
    }
    font.SetScHeight(-1);
    expect(font.mnHeight).toBe(65535);
    font.SetScHeight(40000);
    expect(font.mnHeight).toBe(32767);
    font.SetApiHeight(12.25);
    expect(font.mnHeight).toBe(245);
    expect(font.GetApiHeight()).toBe(12.25);
  } finally {
    font.Dispose();
  }
});

it("writes original font XML order, accounting underline loss and actual ARGB", /** Independent ZIP XML is checked, not a successful whole-workbook export. @returns Completion. */ async () => {
  const font = new XclFontData();
  name(font, "Arial");
  try {
    font.SetScHeight(245);
    font.mnWeight = 401;
    font.mbItalic = font.mbStrikeout = font.mbOutline = font.mbShadow = true;
    font.mnUnderline = 0x21;
    font.mnEscapem = 1;
    font.mnCharSet = 204;
    font.maComplexColor.setColor(new Color(255, 0, 0));
    const output = await xml(font, "rFont");
    expect(output).toContain(
      '<b val="true"/><i val="true"/><strike val="true"/><outline val="true"/><shadow val="true"/><u val="single"/><vertAlign val="superscript"/><sz val="12.25"/><color rgb="FFFF0000"/><rFont val="Arial"/><family val="2"/><charset val="204"/>',
    );
    font.mnUnderline = 0x22;
    font.mnEscapem = 2;
    expect(await xml(font)).toContain('<u val="double"/><vertAlign val="subscript"/>');
  } finally {
    font.Dispose();
  }
});

it("retains original theme permutation, last-transform tint and zero tint/automatic-color omission", /** Uses actual ComplexColor transforms; no computed-color provider is replaced. @returns Completion. */ async () => {
  const font = new XclFontData();
  name(font, "Arial");
  try {
    expect(await xml(font)).not.toContain("<color");
    font.maComplexColor.setThemeColor(ThemeColorType.Dark1);
    expect(await xml(font)).toContain('<color theme="1"/>');
    font.maComplexColor.addTransformation(new Transformation(T.LumMod, 5000));
    expect(await xml(font)).toContain('tint="-0.5"');
    font.maComplexColor.addTransformation(new Transformation(T.LumOff, 2000));
    expect(await xml(font)).toContain('tint="0.2"');
    font.maComplexColor.addTransformation(new Transformation(T.LumOff, 4000));
    expect(await xml(font)).toContain('tint="0.4"');
  } finally {
    font.Dispose();
  }
});

it("truncates names at31 UTF16 units and backs up to a complete semicolon alternative", /** Source truncation does not normalize or repair surrogate boundaries. @returns Completion. */ async () => {
  const font = new XclFontData();
  try {
    for (const [input, expected] of [
      ["Short", "Short"],
      ["x".repeat(32), "x".repeat(31)],
      ["Arial;" + "x".repeat(40), "Arial"],
      ["x".repeat(31) + ";Long", "x".repeat(31)],
    ]) {
      name(font, input as string);
      expect(await xml(font)).toContain('name val="' + expected + '"');
    }
  } finally {
    font.Dispose();
  }
});
