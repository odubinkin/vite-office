/** @fileoverview Literal native DOCX effects and East Asian collected-run attributes through actual items, exporter and serializer owners. */
import { expect, it } from "vitest";
import { DocxExport } from "./docxexport";
import type { DocxAttributeOutput } from "./docxattributeoutput";
import { SwDoc } from "../../core/doc/doc";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { XmlFilterBase } from "../../../../oox/source/core/xmlfilterbase";
import { ZipStorage, ZipFragmentStream } from "../../../../oox/source/helper/zipstorage";
import { FastSerializerHelper } from "../../../../sax/inc/fshelper";
import { FastTokenHandler } from "../../../../oox/source/core/fasttokenhandler";
import { SvxCaseMapItem } from "../../../../editeng/inc/cmapitem";
import { SvxCaseMap } from "../../../../editeng/inc/svxenum";
import { SvxContourItem } from "../../../../editeng/inc/contouritem";
import { SvxShadowedItem } from "../../../../editeng/inc/shdditem";
import { SvxCharReliefItem } from "../../../../editeng/inc/charreliefitem";
import { SvxEmphasisMarkItem } from "../../../../editeng/inc/emphasismarkitem";
import { SvxCharScaleWidthItem } from "../../../../editeng/inc/charscaleitem";
import { SvxCharRotateItem } from "../../../../editeng/inc/charrotateitem";
import { SvxTwoLinesItem } from "../../../../editeng/inc/twolinesitem";
import { SvxBlinkItem } from "../../../../editeng/inc/blinkitem";
import { SfxBoolItem } from "../../../../svl/inc/eitem";
import { FontRelief } from "../../../../vcl/inc/fntstyle";
import { FontEmphasisMark as M } from "../../../../tools/inc/fontenum";

/** Emits through real DOCX and shared XML owners without replacing native services. @param write - Actual output calls. @returns Serialized fragment. */
function emit(write: (output: DocxAttributeOutput) => void): string {
  const doc = new SwDoc(),
    position = new SwPosition(doc.nodes.GetEndOfContent()),
    range = new SwPaM(position),
    exporter = new DocxExport(new XmlFilterBase(new ZipStorage()), doc, range, range, false, false),
    stream = new ZipFragmentStream("word/document.xml", "application/xml"),
    serializer = new FastSerializerHelper(stream, false, new FastTokenHandler()),
    output = exporter.DocxAttrOutput();
  try {
    output.SetSerializer(serializer);
    write(output);
    serializer.endDocument();
    return new TextDecoder().decode(stream.getBytes());
  } finally {
    exporter.dispose();
    range.Dispose();
    position.Dispose();
    doc.Dispose();
  }
}

it.each([
  [SvxCaseMap.SmallCaps, "<w:smallCaps/>"],
  [SvxCaseMap.Uppercase, "<w:caps/>"],
  [SvxCaseMap.NotMapped, '<w:smallCaps w:val="false"/><w:caps w:val="false"/>'],
  [SvxCaseMap.Lowercase, '<w:smallCaps w:val="false"/><w:caps w:val="false"/>'],
  [SvxCaseMap.Capitalize, '<w:smallCaps w:val="false"/><w:caps w:val="false"/>'],
] as const)(
  "keeps native caps mapping for case mode %s",
  /** Unknown Word modes clear flags without rewriting text. @param mode - Native mode. @param expected - Literal XML. @returns Nothing. */ (
    mode,
    expected,
  ) => {
    expect(
      emit(
        /** Emits the actual case item. @param output - Native owner. @returns Nothing. */ (
          output,
        ) => output.CharCaseMap(new SvxCaseMapItem(mode, 0)),
      ),
    ).toBe(expected);
  },
);

it.each([false, true])(
  "emits native explicit effect switches for %s",
  /** Pins false spelling and the intentional bidi no-op. @param enabled - Actual bool. @returns Nothing. */ (
    enabled,
  ) => {
    expect(
      emit(
        /** Emits independent real bool items. @param output - Native owner. @returns Nothing. */ (
          output,
        ) => {
          output.CharContour(new SvxContourItem(enabled, 0));
          output.CharShadow(new SvxShadowedItem(enabled, 0));
          output.CharAnimatedText(new SvxBlinkItem(enabled, 0));
          output.CharBidiRTL(new SfxBoolItem(0, enabled));
        },
      ),
    ).toBe(
      enabled
        ? '<w:outline/><w:shadow/><w:effect w:val="blinkBackground"/>'
        : '<w:outline w:val="false"/><w:shadow w:val="false"/><w:effect w:val="none"/>',
    );
  },
);

it.each([
  [FontRelief.Embossed, "<w:emboss/>"],
  [FontRelief.Engraved, "<w:imprint/>"],
  [FontRelief.NONE, '<w:emboss w:val="false"/><w:imprint w:val="false"/>'],
] as const)(
  "emits native relief %s",
  /** Retains original fallback clearing both effects. @param relief - Native mode. @param expected - XML. @returns Nothing. */ (
    relief,
    expected,
  ) => {
    expect(
      emit(
        /** Emits the actual enum item. @param output - Native owner. @returns Nothing. */ (
          output,
        ) => output.CharRelief(new SvxCharReliefItem(relief, 0)),
      ),
    ).toBe(expected);
  },
);

it.each([
  [M.Dot | M.PosAbove, "dot"],
  [M.Accent | M.PosAbove, "comma"],
  [M.Circle | M.PosAbove, "circle"],
  [M.Dot | M.PosBelow, "underDot"],
  [M.NONE, "none"],
  [M.Disc | M.PosAbove, "none"],
  [M.Dot | M.PosAbove | M.PosBelow, "none"],
] as const)(
  "matches complete emphasis flag combination %s",
  /** Does not normalize unsupported combinations. @param mark - Native flags. @param expected - Literal Word token. @returns Nothing. */ (
    mark,
    expected,
  ) => {
    expect(
      emit(
        /** Emits the actual emphasis item. @param output - Native owner. @returns Nothing. */ (
          output,
        ) => output.CharEmphasisMark(new SvxEmphasisMarkItem(mark, 0)),
      ),
    ).toBe(`<w:em w:val="${expected}"/>`);
  },
);

it.each([
  [0, 1],
  [1, 1],
  [100, 100],
  [600, 600],
  [601, 600],
  [32767, 600],
  [32768, 1],
  [65535, 1],
] as const)(
  "narrows unsigned width %s before native signed16 clamping",
  /** Pins source template narrowing rather than widening the clamp domain. @param width - Original unsigned storage. @param expected - Native clamp. @returns Nothing. */ (
    width,
    expected,
  ) => {
    expect(
      emit(
        /** Emits the actual width item. @param output - Native owner. @returns Nothing. */ (
          output,
        ) => output.CharScaleWidth(new SvxCharScaleWidthItem(width, 0)),
      ),
    ).toBe(`<w:w w:val="${expected}"/>`);
  },
);

it.each([
  [0, false, ""],
  [0, true, ""],
  [900, false, '<w:eastAsianLayout w:vert="true"/>'],
  [2700, true, '<w:eastAsianLayout w:vert="true" w:vertCompress="true"/>'],
  [450, false, '<w:eastAsianLayout w:vert="true"/>'],
] as const)(
  "collects rotation %s and fit %s",
  /** Native nonzero test does not filter unsupported stored angles. @param angle - Stored tenths. @param fit - Native fit flag. @param expected - XML. @returns Nothing. */ (
    angle,
    fit,
    expected,
  ) => {
    expect(
      emit(
        /** Flushes actual collected attributes twice to prove detachment. @param output - Native owner. @returns Nothing. */ (
          output,
        ) => {
          output.CharRotate(new SvxCharRotateItem(angle, fit, 0));
          output.WriteCollectedRunProperties();
          output.WriteCollectedRunProperties();
        },
      ),
    ).toBe(expected);
  },
);

it.each([
  [0, 0, ""],
  [123, 93, "curly"],
  [91, 125, "curly"],
  [60, 41, "angle"],
  [40, 62, "angle"],
  [91, 41, "square"],
  [40, 93, "square"],
  [40, 41, "round"],
  [0, 41, "round"],
  [40, 0, "round"],
] as const)(
  "collects bracket pair %s/%s with native priority",
  /** Pins either-end matches and curly-before-angle-before-square precedence. @param start - First unit. @param end - Final unit. @param bracket - Native name. @returns Nothing. */ (
    start,
    end,
    bracket,
  ) => {
    expect(
      emit(
        /** Flushes the actual two-line item. @param output - Native owner. @returns Nothing. */ (
          output,
        ) => {
          output.CharTwoLines(new SvxTwoLinesItem(true, start, end, 0));
          output.WriteCollectedRunProperties();
        },
      ),
    ).toBe(
      `<w:eastAsianLayout w:combine="true"${bracket ? ` w:combineBrackets="${bracket}"` : ""}/>`,
    );
  },
);

it("merges rotation and two-line flags, retains disabled-call state, sorts run properties and resets the next run", /** Uses the actual run marks and collected-property detachment lifecycle. @returns Nothing. */ () => {
  expect(
    emit(
      /** Emits two full runs through real owners. @param output - Native owner. @returns Nothing. */ (
        output,
      ) => {
        output.StartRun(null, 0);
        output.StartRunProperties();
        output.CharTwoLines(new SvxTwoLinesItem(true, 123, 125, 0));
        output.CharRotate(new SvxCharRotateItem(900, true, 0));
        output.CharTwoLines(new SvxTwoLinesItem(false, 91, 93, 0));
        output.CharRotate(new SvxCharRotateItem(0, false, 0));
        output.CharShadow(new SvxShadowedItem(true, 0));
        output.CharCaseMap(new SvxCaseMapItem(SvxCaseMap.Uppercase, 0));
        output.EndRunProperties();
        output.EndRun(null, 0, 0);
        output.StartRun(null, 0);
        output.StartRunProperties();
        output.CharTwoLines(new SvxTwoLinesItem(false, 123, 125, 0));
        output.EndRunProperties();
        output.EndRun(null, 0, 0);
      },
    ),
  ).toBe(
    '<w:r><w:rPr><w:caps/><w:shadow/><w:eastAsianLayout w:combine="true" w:combineBrackets="curly" w:vert="true" w:vertCompress="true"/></w:rPr></w:r><w:r><w:rPr></w:rPr></w:r>',
  );
});
