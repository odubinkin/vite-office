/** @fileoverview Native DOCX color, underline and script-language scenarios through actual Writer and XML owners. Source QA fragments do not certify full fixture import/reopen. */
import { expect, it } from "vitest";
import { DocxExport } from "./docxexport";
import type { DocxAttributeOutput } from "./docxattributeoutput";
import * as W from "../../../inc/hintids";
import { SwDoc } from "../../core/doc/doc";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { XmlFilterBase } from "../../../../oox/source/core/xmlfilterbase";
import { ZipStorage, ZipFragmentStream } from "../../../../oox/source/helper/zipstorage";
import { FastSerializerHelper } from "../../../../sax/inc/fshelper";
import { SvxColorItem } from "../../../../editeng/inc/colritem";
import { SvxUnderlineItem } from "../../../../editeng/inc/udlnitem";
import { SvxLanguageItem } from "../../../../editeng/inc/langitem";
import { LanguageType } from "../../../../i18nlangtag/inc/lang";
import { FontLineStyle as F } from "../../../../tools/inc/fontenum";
import { Color, COL_AUTO } from "../../../../tools/inc/color";
import { ComplexColor } from "../../../../docmodel/inc/color/ComplexColor";
import {
  Transformation,
  TransformationType as T,
} from "../../../../docmodel/inc/color/Transformation";
import {
  ThemeColorType as C,
  ThemeColorUsage as U,
} from "../../../../docmodel/inc/theme/ThemeColorType";
/** Emits through real DOCX and shared XML owners without replacing native services. @param write - Actual output calls. @returns Serialized fragment. */
function emit(write: (output: DocxAttributeOutput, document: SwDoc) => void): string {
  const doc = new SwDoc(),
    position = new SwPosition(doc.nodes.GetEndOfContent()),
    range = new SwPaM(position),
    exporter = new DocxExport(new XmlFilterBase(new ZipStorage()), doc, range, range, false, false),
    stream = new ZipFragmentStream("word/document.xml", "application/xml"),
    serializer = new FastSerializerHelper(stream, false),
    output = exporter.DocxAttrOutput();
  try {
    output.SetSerializer(serializer);
    write(output, doc);
    serializer.endDocument();
    return new TextDecoder().decode(stream.getBytes());
  } finally {
    exporter.dispose();
    range.Dispose();
    position.Dispose();
    doc.Dispose();
  }
}

/** Creates a real complex-color value. @param type - Theme index. @param usage - Native role. @param transformations - Original transformations. @returns Actual owned value. */
function complex(
  type: C,
  usage = U.Unknown,
  transformations: readonly Transformation[] = [],
): ComplexColor {
  const value = new ComplexColor();
  value.setThemeColor(type);
  value.setThemeColorUsage(usage);
  value.setTransformations(transformations);
  return value;
}

it.each([
  [F.LINESTYLE_NONE, "none"],
  [F.LINESTYLE_SINGLE, "single"],
  [F.LINESTYLE_DOUBLE, "double"],
  [F.LINESTYLE_DOTTED, "dotted"],
  [F.LINESTYLE_DONTKNOW, "none"],
  [F.LINESTYLE_DASH, "dash"],
  [F.LINESTYLE_LONGDASH, "dashLongHeavy"],
  [F.LINESTYLE_DASHDOT, "dotDash"],
  [F.LINESTYLE_DASHDOTDOT, "dotDotDash"],
  [F.LINESTYLE_SMALLWAVE, "none"],
  [F.LINESTYLE_WAVE, "wave"],
  [F.LINESTYLE_DOUBLEWAVE, "wavyDouble"],
  [F.LINESTYLE_BOLD, "thick"],
  [F.LINESTYLE_BOLDDOTTED, "dottedHeavy"],
  [F.LINESTYLE_BOLDDASH, "dashedHeavy"],
  [F.LINESTYLE_BOLDLONGDASH, "dashLongHeavy"],
  [F.LINESTYLE_BOLDDASHDOT, "dashDotHeavy"],
  [F.LINESTYLE_BOLDDASHDOTDOT, "dashDotDotHeavy"],
  [F.LINESTYLE_BOLDWAVE, "wavyHeavy"],
] as const)(
  "preserves native underline mapping %s",
  /** Checks actual pooled styles. @param style - Original style. @param text - Word value. @returns Nothing. */ (
    style,
    text,
  ) => {
    expect(
      emit(
        /** Emits the actual item. @param output - Native output. @returns Nothing. */ (output) =>
          output.CharUnderline(new SvxUnderlineItem(style, W.RES_CHRATR_UNDERLINE)),
      ),
    ).toBe(`<w:u w:val="${text}"/>`);
  },
);

it("preserves fdo56679 independent underline color and omits partially transparent underline colors", /** Pins the source color predicate, rather than treating any nonzero alpha as opaque. @returns Nothing. */ () => {
  const underline = new SvxUnderlineItem(F.LINESTYLE_SINGLE, W.RES_CHRATR_UNDERLINE),
    color = new Color(0xff0000);
  try {
    underline.SetColor(color);
    expect(
      emit(
        /** Writes the real underline. @param output - Native output. @returns Nothing. */ (
          output,
        ) => output.CharUnderline(underline),
      ),
    ).toBe('<w:u w:val="single" w:color="FF0000"/>');
    color.SetAlpha(254);
    underline.SetColor(color);
    expect(
      emit(
        /** Writes the actual partially transparent underline. @param output - Native output. @returns Nothing. */ (
          output,
        ) => output.CharUnderline(underline),
      ),
    ).toBe('<w:u w:val="single"/>');
  } finally {
    underline.Dispose();
  }
});

it.each([
  [C.Dark1, U.Unknown, "dark1"],
  [C.Light1, U.Unknown, "light1"],
  [C.Dark2, U.Unknown, "dark2"],
  [C.Light2, U.Unknown, "light2"],
  [C.Accent1, U.Unknown, "accent1"],
  [C.Accent6, U.Unknown, "accent6"],
  [C.Hyperlink, U.Unknown, "hyperlink"],
  [C.FollowedHyperlink, U.Unknown, "followedHyperlink"],
  [C.Dark1, U.Text, "text1"],
  [C.Dark2, U.Text, "text2"],
  [C.Accent1, U.Text, "accent1"],
  [C.Light1, U.Background, "background1"],
  [C.Light2, U.Background, "background2"],
  [C.Accent1, U.Background, "accent1"],
] as const)(
  "exports theme %s usage %s",
  /** Covers actual theme and role overrides. @param type - Theme. @param usage - Role. @param text - Source token. @returns Nothing. */ (
    type,
    usage,
    text,
  ) => {
    const underline = new SvxUnderlineItem(F.LINESTYLE_SINGLE, 0);
    try {
      underline.SetColor(new Color(0x123456));
      underline.setComplexColor(complex(type, usage));
      expect(
        emit(
          /** Emits the theme-bearing item. @param output - Native output. @returns Nothing. */ (
            output,
          ) => output.CharUnderline(underline),
        ),
      ).toBe(`<w:u w:val="single" w:color="123456" w:themeColor="${text}"/>`);
    } finally {
      underline.Dispose();
    }
  },
);

it.each([
  [[new Transformation(T.Tint, 5000)], ' w:themeTint="80"'],
  [[new Transformation(T.Shade, 2500)], ' w:themeShade="bf"'],
  [[new Transformation(T.Tint, 10000), new Transformation(T.Shade, 5000)], ' w:themeTint="0"'],
  [[new Transformation(T.LumMod, 7500)], ' w:themeShade="bf"'],
  [[new Transformation(T.LumMod, 7500), new Transformation(T.LumOff, 5000)], ' w:themeTint="80"'],
  [[new Transformation(T.LumOff, -1)], ""],
  [[new Transformation(T.Tint, 1000), new Transformation(T.Tint, 5000)], ' w:themeTint="80"'],
] as const)(
  "preserves last-transform selection and luminance priority %#",
  /** Uses actual transformation values. @param transforms - Actual inputs. @param expected - Attribute suffix. @returns Nothing. */ (
    transforms,
    expected,
  ) => {
    const underline = new SvxUnderlineItem(F.LINESTYLE_SINGLE, 0);
    try {
      underline.SetColor(new Color(0));
      underline.setComplexColor(complex(C.Accent1, U.Unknown, transforms));
      expect(
        emit(
          /** Serializes actual theme attributes. @param output - Native output. @returns Nothing. */ (
            output,
          ) => output.CharUnderline(underline),
        ),
      ).toBe(`<w:u w:val="single" w:color="000000" w:themeColor="accent1"${expected}/>`);
    } finally {
      underline.Dispose();
    }
  },
);

it("collects all three languages with native MS traditional-Spanish spelling and detaches between runs", /** Uses shared LanguageTag conversion and real serializer marks. @returns Nothing. */ () => {
  expect(
    emit(
      /** Writes two actual runs. @param output - Native output. @returns Nothing. */ (output) => {
        output.StartRun(null, 0);
        output.StartRunProperties();
        output.CharLanguage(new SvxLanguageItem(LanguageType(1034), W.RES_CHRATR_LANGUAGE));
        output.CharLanguage(new SvxLanguageItem(LanguageType(1041), W.RES_CHRATR_CJK_LANGUAGE));
        output.CharLanguage(new SvxLanguageItem(LanguageType(1025), W.RES_CHRATR_CTL_LANGUAGE));
        output.CharLanguage(new SvxLanguageItem(LanguageType(1031), 0));
        output.EndRunProperties();
        output.EndRun(null, 0, 0);
        output.StartRun(null, 0);
        output.StartRunProperties();
        output.EndRunProperties();
        output.EndRun(null, 0, 0);
      },
    ),
  ).toBe(
    '<w:r><w:rPr><w:lang w:val="es-ES_tradnl" w:eastAsia="ja-JP" w:bidi="ar-SA"/></w:rPr></w:r><w:r><w:rPr></w:rPr></w:r>',
  );
});

it("keeps tdf149200 plain theme color free of a redundant textFill, flushes once and resets the next run", /** Replays the relevant upstream XML assertion through actual owners; complete fixture/model QA remains pending. @returns Nothing. */ () => {
  const item = new SvxColorItem(new Color(0), complex(C.Dark1), W.RES_CHRATR_COLOR);
  try {
    expect(
      emit(
        /** Emits actual collected properties. @param output - Native output. @returns Nothing. */ (
          output,
        ) => {
          output.StartRun(null, 0);
          output.StartRunProperties();
          output.CharColor(item);
          output.CharColor(item);
          output.EndRunProperties();
          output.EndRun(null, 0, 0);
          output.StartRun(null, 0);
          output.StartRunProperties();
          output.EndRunProperties();
          output.EndRun(null, 0, 0);
        },
      ),
    ).toBe(
      '<w:r><w:rPr><w:color w:themeColor="dark1" w:val="000000"/></w:rPr></w:r><w:r><w:rPr></w:rPr></w:r>',
    );
  } finally {
    item.Dispose();
  }
});

it.each([
  [C.Unknown, U.Unknown, "srgbClr", "123456"],
  [C.Light2, U.Unknown, "schemeClr", "lt2"],
  [C.Dark1, U.Text, "schemeClr", "tx1"],
  [C.Light2, U.Background, "schemeClr", "bg2"],
] as const)(
  "keeps source alpha and tdf166325 scheme spelling %s/%s",
  /** Pins original transparency-to-alpha value without reversing source semantics. @param theme - Actual theme. @param usage - Actual usage. @param kind - Color element. @param value - XML value. @returns Nothing. */ (
    theme,
    usage,
    kind,
    value,
  ) => {
    const color = new Color(0x123456);
    color.SetAlpha(64);
    const item = new SvxColorItem(color, complex(theme, usage), W.RES_CHRATR_COLOR);
    try {
      expect(
        emit(
          /** Emits actual source color. @param output - Native output. @returns Nothing. */ (
            output,
          ) => {
            output.CharColor(item);
            output.WriteCollectedRunProperties();
          },
        ),
      ).toContain(`<w14:${kind} w14:val="${value}"><w14:alpha w14:val="75000"/></w14:${kind}>`);
    } finally {
      item.Dispose();
    }
  },
);

it("retains source solid-fill transform order, ignores unmapped transforms and suppresses automatic textFill", /** Uses authored public values without private-state injection. @returns Nothing. */ () => {
  const transforms = [
      new Transformation(T.LumMod, 7500),
      new Transformation(T.Sat, 2000),
      new Transformation(T.Red, 1000),
    ],
    item = new SvxColorItem(new Color(0x112233), complex(C.Accent2, U.Unknown, transforms), 0);
  try {
    expect(
      emit(
        /** Writes all source transformations. @param output - Native output. @returns Nothing. */ (
          output,
        ) => {
          output.CharColor(item);
          output.WriteCollectedRunProperties();
          output.WriteCollectedRunProperties();
        },
      ),
    ).toBe(
      '<w:color w:themeColor="accent2" w:themeShade="bf" w:val="112233"/><w14:textFill><w14:solidFill><w14:schemeClr w14:val="accent2"><w14:lumMod w14:val="7500000"/><w14:sat w14:val="2000000"/></w14:schemeClr></w14:solidFill></w14:textFill>',
    );
  } finally {
    item.Dispose();
  }
  const automatic = new SvxColorItem(COL_AUTO, 0);
  try {
    expect(
      emit(
        /** Emits source automatic color. @param output - Native output. @returns Nothing. */ (
          output,
        ) => {
          output.CharColor(automatic);
          output.WriteCollectedRunProperties();
        },
      ),
    ).toBe('<w:color w:val="auto"/>');
  } finally {
    automatic.Dispose();
  }
});
