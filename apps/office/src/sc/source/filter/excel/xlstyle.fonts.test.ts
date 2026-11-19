/** @fileoverview Original font-extraction overloads and configured MS substitutions against genuine VCL/SVX/ComplexColor owners. */
import { expect, it } from "vitest";
import { Font } from "../../../../vcl/source/font/font";
import { SvxFont } from "../../../../editeng/inc/svxfont";
import { Size } from "../../../../tools/inc/gen";
import {
  FontFamily as F,
  FontWeight as W,
  FontItalic as I,
  FontLineStyle as L,
  FontStrikeout as S,
} from "../../../../tools/inc/fontenum";
import {
  RTL_TEXTENCODING_MS_1251,
  RTL_TEXTENCODING_MS_1252,
} from "../../../../sal/inc/rtl/textenc";
import { ComplexColor } from "../../../../docmodel/inc/color/ComplexColor";
import { Color } from "../../../../tools/inc/color";
import { ThemeColorType } from "../../../../docmodel/inc/theme/ThemeColorType";
import {
  Transformation,
  TransformationType as T,
} from "../../../../docmodel/inc/color/Transformation";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { XclFontData } from "../inc/xlstyle";
import { XclTools } from "./xltools";
import { XclXmlUtils, XclExpXmlStream } from "../inc/xestream";
import { ZipStorage } from "../../../../oox/source/helper/zipstorage";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";

it.each([
  ["Liberation Sans", "Arial"],
  ["Liberation Sans;Arial", "Liberation Sans;Arial"],
  ["OpenSymbol", "OpenSymbol"],
  ["StarSymbol", "StarSymbol"],
  ["Unknown字😀", "Unknown字😀"],
  ["", ""],
])(
  "retains original configured font-name policy for %s",
  /** Uses the actual shipped FontSubstConfiguration, not a replacement service. @param source - Family list. @param expected - Original MS substitution/fallback. @returns Nothing. */ (
    source,
    expected,
  ) => {
    const input = unicode(source),
      result = XclTools.GetXclFontName(input);
    try {
      expect(text(result)).toBe(expected);
      expect(result).not.toBe(input);
      result.clear();
      expect(text(input)).toBe(source);
    } finally {
      result.dispose();
      input.dispose();
    }
  },
);

it("extracts original VCL properties and copies actual complex color independently", /** Source stored getters, rather than configuration-enriched getters, remain authoritative. @returns Nothing. */ () => {
  const font = new Font(),
    color = new ComplexColor();
  font.SetFamilyName("Liberation Sans");
  font.SetStyleName("not copied");
  font.SetFontSize(new Size(7, 260));
  font.SetWeight(W.WEIGHT_SEMIBOLD);
  font.SetFamily(F.FAMILY_SWISS);
  font.SetCharSet(RTL_TEXTENCODING_MS_1251);
  font.SetUnderline(L.LINESTYLE_DOUBLEWAVE);
  font.SetItalic(I.ITALIC_OBLIQUE);
  font.SetStrikeout(S.STRIKEOUT_DOUBLE);
  font.SetOutline(true);
  font.SetShadow(true);
  font.SetColor(new Color(0, 0, 255));
  color.setColor(new Color(255, 0, 0));
  color.setThemeColor(ThemeColorType.Accent2);
  color.addTransformation(new Transformation(T.LumOff, 2000));
  const data = new XclFontData(font, color);
  try {
    expect(text(data.maName)).toBe("Arial");
    expect(data.maStyle.isEmpty()).toBe(true);
    expect([
      data.mnHeight,
      data.mnWeight,
      data.mnFamily,
      data.mnCharSet,
      data.mnUnderline,
      data.mnEscapem,
    ]).toEqual([260, 600, 2, 204, 2, 0]);
    expect([data.mbItalic, data.mbStrikeout, data.mbOutline, data.mbShadow]).toEqual([
      true,
      true,
      true,
      true,
    ]);
    expect(data.maComplexColor.equals(color)).toBe(true);
    expect(data.maComplexColor).not.toBe(color);
    color.setTransformations([]);
    color.setColor(new Color(0, 255, 0));
    font.SetFamilyName("Changed");
    expect(text(data.maName)).toBe("Arial");
    expect(data.maComplexColor.getTransformations()).toHaveLength(1);
    expect(data.maComplexColor.getFinalColor().GetRed()).toBe(255);
  } finally {
    data.Dispose();
  }
});

it("keeps original const family/weight getters unresolved instead of inventing inferred metadata", /** Alias lookup does not mutate the actual source font or invoke its MaybeAskConfig methods. @returns Nothing. */ () => {
  const font = new Font(),
    color = new ComplexColor();
  font.SetFamilyName("Liberation Sans");
  font.SetFamily(F.FAMILY_DONTKNOW);
  font.SetWeight(W.WEIGHT_DONTKNOW);
  const data = new XclFontData(font, color);
  try {
    expect(text(data.maName)).toBe("Arial");
    expect(data.mnFamily).toBe(0);
    expect(data.mnWeight).toBe(0);
    expect(font.GetFamilyType()).toBe(F.FAMILY_DONTKNOW);
    expect(font.GetWeight()).toBe(W.WEIGHT_DONTKNOW);
  } finally {
    data.Dispose();
  }
});

it("preserves SVX and explicit VCL constructor overload selection and refill reset order", /** No scalar DTO or fake font provider bypasses the real derived owner. @returns Nothing. */ () => {
  const font = new SvxFont(),
    color = new ComplexColor();
  font.SetFamilyName("Arial");
  font.SetEscapement(-27);
  font.SetFontSize(new Size(0, 40000));
  const derived = new XclFontData(font, color),
    base = new XclFontData(font, color, true),
    target = new XclFontData();
  try {
    expect(derived.mnEscapem).toBe(2);
    expect(base.mnEscapem).toBe(0);
    expect(derived.mnHeight).toBe(32767);
    target.maComplexColor.addTransformation(new Transformation(T.LumMod, 5000));
    const metadata = unicode("old metadata");
    try {
      target.maStyle.assign(metadata);
    } finally {
      metadata.dispose();
    }
    target.FillFromVclFont(font, color);
    expect(target.maStyle.isEmpty()).toBe(true);
    expect(target.maComplexColor.getTransformations()).toHaveLength(0);
    expect(target.mnEscapem).toBe(0);
    font.SetEscapement(33);
    target.FillFromSvxFont(font, color);
    expect(target.mnEscapem).toBe(1);
    font.SetEscapement(0);
    target.FillFromSvxFont(font, color);
    expect(target.mnEscapem).toBe(0);
    expect(text(target.maName)).toBe("Arial");
  } finally {
    derived.Dispose();
    base.Dispose();
    target.Dispose();
  }
});

it("emits actual extracted kernel font properties through original OOXML property output", /** Independent ZIP reopening qualifies the extraction/emission chain, not a completed workbook export. @returns Completion. */ async () => {
  const font = new SvxFont(),
    color = new ComplexColor();
  font.SetFamilyName("Liberation Sans");
  font.SetFontSize(new Size(0, 245));
  font.SetWeight(W.WEIGHT_BOLD);
  font.SetEscapement(33);
  font.SetUnderline(L.LINESTYLE_SINGLE);
  font.SetCharSet(RTL_TEXTENCODING_MS_1252);
  color.setColor(new Color(255, 0, 0));
  const data = new XclFontData(font, color),
    owner = new XclExpXmlStream(new ZipStorage(), false, false),
    output = owner.openFragmentStreamWithSerializer("xl/sharedStrings.xml", "application/xml");
  try {
    output.startElement(
      token("sst"),
      token("xmlns"),
      "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    );
    output.startElement(token("si"));
    output.startElement(token("r"));
    output.startElement(token("rPr"));
    XclXmlUtils.WriteFontData(output, data, token("rFont"));
    output.endElement(token("rPr"));
    output.startElement(token("t"));
    output.writeEscaped("extracted");
    output.endElement(token("t"));
    output.endElement(token("r"));
    output.endElement(token("si"));
    output.endElement(token("sst"));
    output.endDocument();
    const archive = await DocumentArchive.open(await owner.commitStorage()),
      xml = await archive.readTextEntry("xl/sharedStrings.xml");
    expect(xml).toContain(
      '<b val="true"/><u val="single"/><vertAlign val="superscript"/><sz val="12.25"/><color rgb="FFFF0000"/><rFont val="Arial"/>',
    );
  } finally {
    data.Dispose();
  }
});
