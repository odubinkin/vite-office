/** @fileoverview Native DOCX escapement, shading/highlight and script/hidden properties through actual Writer item sets and serializers. */
import { expect, it } from "vitest";
import { DocxExport } from "./docxexport";
import type { DocxAttributeOutput } from "./docxattributeoutput";
import { SwDoc } from "../../core/doc/doc";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { XmlFilterBase } from "../../../../oox/source/core/xmlfilterbase";
import { ZipStorage, ZipFragmentStream } from "../../../../oox/source/helper/zipstorage";
import { FastSerializerHelper } from "../../../../sax/inc/fshelper";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SvxEscapementItem } from "../../../../editeng/inc/escapementitem";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { SvxBrushItem } from "../../../../editeng/source/items/frmitems.brush";
import { SvxCharHiddenItem } from "../../../../editeng/inc/charhiddenitem";
import { SvxScriptHintItem } from "../../../../editeng/inc/scripthintitem";
import { SvxOpticalSizingItem } from "../../../../editeng/inc/opticalsizingitem";
import { SvxFontVariationsItem } from "../../../../editeng/inc/fontvariationsitem";
import { ScriptHintType as S } from "../../../../i18nutil/inc/scriptchangescanner";
import { ShadingPattern } from "../../../../offapi/com/sun/star/drawing/ShadingPattern";
import { Color, COL_AUTO } from "../../../../tools/inc/color";
import * as W from "../../../inc/hintids";
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

it.each([
  [0, 58, '<w:vertAlign w:val="baseline"/><w:position w:val="0"/><w:sz w:val="24"/>'],
  [33, 58, '<w:vertAlign w:val="superscript"/>'],
  [-8, 58, '<w:vertAlign w:val="subscript"/>'],
  [14000, 58, '<w:vertAlign w:val="superscript"/>'],
  [-14000, 58, '<w:vertAlign w:val="subscript"/>'],
  [14000, 80, '<w:position w:val="4"/><w:sz w:val="19"/>'],
  [-14000, 80, '<w:position w:val="-1"/><w:sz w:val="19"/>'],
  [17, 80, '<w:position w:val="4"/><w:sz w:val="19"/>'],
  [17, 100, '<w:position w:val="4"/>'],
  [-400, 80, '<w:position w:val="-96"/><w:sz w:val="19"/>'],
  [33, 0, '<w:vertAlign w:val="superscript"/>'],
  [-8, 255, '<w:vertAlign w:val="subscript"/>'],
  [17, 0, '<w:position w:val="4"/><w:sz w:val="0"/>'],
  [17, 255, '<w:position w:val="4"/><w:sz w:val="61"/>'],
] as const)(
  "preserves source escapement %s proportional height %s",
  /** Uses actual font-height lookup and typed escapement values. @param escape - Original signed16 value. @param proportion - Original unsigned8 value. @param expected - Source XML. @returns Nothing. */ (
    escape,
    proportion,
    expected,
  ) => {
    expect(
      emit(
        /** Emits against a genuine current item set. @param output - Actual output. @param document - Actual document. @returns Nothing. */ (
          output,
          document,
        ) => {
          const set = new SfxItemSet(document.GetAttrPool(), W.WRITER_CHARACTER_WHICH_RANGES),
            item = new SvxEscapementItem(escape, proportion, W.RES_CHRATR_ESCAPEMENT);
          try {
            set.Put(new SvxFontHeightItem(240, 100, W.RES_CHRATR_FONTSIZE));
            output.GetExport().m_pISet = set;
            output.CharEscapement(item);
            output.WriteCollectedRunProperties();
          } finally {
            output.GetExport().m_pISet = undefined;
            item.Dispose();
            set.Dispose();
          }
        },
      ),
    ).toBe(expected);
  },
);
it.each([
  ["character", -400, '<w:vertAlign w:val="subscript"/>'],
  ["paragraph", -400, '<w:position w:val="-96"/><w:sz w:val="19"/>'],
  ["paragraph", 17, '<w:vertAlign w:val="superscript"/>'],
  ["missing", -400, '<w:vertAlign w:val="subscript"/>'],
] as const)(
  "retains style simplification for %s offset %s",
  /** Uses actual native public style context and actual format identity. @param kind - Style context. @param escape - Original offset. @param expected - XML. @returns Nothing. */ (
    kind,
    escape,
    expected,
  ) => {
    expect(
      emit(
        /** Emits with genuine style and item owners. @param output - Actual output. @param document - Actual document. @returns Nothing. */ (
          output,
          document,
        ) => {
          const owner = output.GetExport(),
            set = new SfxItemSet(document.GetAttrPool(), W.WRITER_CHARACTER_WHICH_RANGES),
            item = new SvxEscapementItem(escape, 80, W.RES_CHRATR_ESCAPEMENT);
          try {
            set.Put(new SvxFontHeightItem(240, 100, W.RES_CHRATR_FONTSIZE));
            owner.m_pISet = set;
            owner.m_bStyDef = true;
            owner.m_pCurrentStyle =
              kind === "character"
                ? document.MakeCharFormat("Character", undefined)
                : kind === "paragraph"
                  ? document.MakeTextFormatColl("Paragraph", document.GetDfltTextFormatColl())
                  : undefined;
            output.CharEscapement(item);
            output.WriteCollectedRunProperties();
          } finally {
            owner.m_bStyDef = false;
            owner.m_pCurrentStyle = undefined;
            owner.m_pISet = undefined;
            item.Dispose();
            set.Dispose();
          }
        },
      ),
    ).toBe(expected);
  },
);
it("rounds negative halves away from zero and retains a collected zero font size", /** Pins C++ round versus JS Math.round and optional has-value semantics. @returns Nothing. */ () => {
  expect(
    emit(
      /** Emits the actual float/optional edge cases. @param output - Actual output. @param document - Actual document. @returns Nothing. */ (
        output,
        document,
      ) => {
        const owner = output.GetExport(),
          set = new SfxItemSet(document.GetAttrPool(), W.WRITER_CHARACTER_WHICH_RANGES),
          manual = new SvxEscapementItem(-2, 100, W.RES_CHRATR_ESCAPEMENT),
          baseline = new SvxEscapementItem(0, 100, W.RES_CHRATR_ESCAPEMENT),
          zero = new SvxFontHeightItem(0, 100, W.RES_CHRATR_FONTSIZE);
        try {
          set.Put(new SvxFontHeightItem(250, 100, W.RES_CHRATR_FONTSIZE));
          owner.m_pISet = set;
          output.CharEscapement(manual);
          output.CharFontSize(zero);
          output.CharEscapement(baseline);
          output.WriteCollectedRunProperties();
        } finally {
          owner.m_pISet = undefined;
          zero.Dispose();
          baseline.Dispose();
          manual.Dispose();
          set.Dispose();
        }
      },
    ),
  ).toBe(
    '<w:position w:val="-1"/><w:vertAlign w:val="baseline"/><w:position w:val="0"/><w:sz w:val="0"/>',
  );
});
it("uses the source early return for standard scripts without manufacturing a missing item context", /** Manual positioning requires the real current set. @returns Nothing. */ () => {
  expect(
    emit(
      /** Writes native standard script. @param output - Actual output. @returns Nothing. */ (
        output,
      ) => output.CharEscapement(new SvxEscapementItem(33, 58, W.RES_CHRATR_ESCAPEMENT)),
    ),
  ).toBe('<w:vertAlign w:val="superscript"/>');
  expect(
    /** Rejects the currently unbound character iterator path. @returns Fragment. */ () =>
      emit(
        /** Calls manual positioning without an admitted item context. @param output - Actual output. @returns Nothing. */ (
          output,
        ) => output.CharEscapement(new SvxEscapementItem(17, 80, W.RES_CHRATR_ESCAPEMENT)),
      ),
  ).toThrow("requires an actual item set");
});
it("preserves source pct15 fixed shading and ordinary resolved-color output", /** Does not convert character shading into highlight. @returns Nothing. */ () => {
  const brush = new SvxBrushItem(new Color(0x123456), W.RES_CHRATR_BACKGROUND);
  try {
    const shade = new Any([ShadingPattern.PCT15], "sal_Int32");
    try {
      expect(brush.PutValue(shade, MID_SHADING_VALUE)).toBe(true);
    } finally {
      shade.dispose();
    }
    expect(
      emit(
        /** Emits original shading compatibility attributes. @param output - Actual output. @returns Nothing. */ (
          output,
        ) => output.CharBackground(brush),
      ),
    ).toBe('<w:shd w:val="pct15" w:color="auto" w:fill="FFFFFF"/>');
    const clear = new Any([ShadingPattern.CLEAR], "sal_Int32");
    try {
      expect(brush.PutValue(clear, MID_SHADING_VALUE)).toBe(true);
    } finally {
      clear.dispose();
    }
    expect(
      emit(
        /** Emits actual resolved brush color. @param output - Actual output. @returns Nothing. */ (
          output,
        ) => output.CharBackground(brush),
      ),
    ).toBe('<w:shd w:fill="123456" w:val="clear"/>');
  } finally {
    brush.Dispose();
  }
});
it.each([
  [0, "none"],
  [1, "black"],
  [2, "blue"],
  [3, "cyan"],
  [4, "green"],
  [5, "magenta"],
  [6, "red"],
  [7, "yellow"],
  [8, "white"],
  [9, "darkBlue"],
  [10, "darkCyan"],
  [11, "darkGreen"],
  [12, "darkMagenta"],
  [13, "darkRed"],
  [14, "darkYellow"],
  [15, "darkGray"],
  [16, "lightGray"],
] as const)(
  "preserves native highlight token %s",
  /** Native palette values are observed through the real owner. @param index - Native index. @param expected - Native name. @returns Nothing. */ (
    index,
    expected,
  ) => {
    expect(
      emit(
        /** Checks the actual source mapping. @param output - Actual owner. @returns Nothing. */ (
          output,
        ) => {
          expect(output.TransHighlightColor(index)).toBe(expected);
          expect(output.TransHighlightColor(17)).toBe("");
          expect(output.TransHighlightColor(256)).toBe("none");
        },
      ),
    ).toBe("");
  },
);
it("emits actual Word palette/nearest-color/automatic highlights", /** Uses the genuine shared TransColToIco utility. @returns Nothing. */ () => {
  expect(
    emit(
      /** Emits three real brushes. @param output - Actual output. @returns Nothing. */ (
        output,
      ) => {
        for (const color of [new Color(0xff0000), new Color(0x6666ff), COL_AUTO]) {
          const brush = new SvxBrushItem(color, W.RES_CHRATR_HIGHLIGHT);
          try {
            output.CharHighlight(brush);
          } finally {
            brush.Dispose();
          }
        }
      },
    ),
  ).toBe('<w:highlight w:val="red"/><w:highlight w:val="blue"/><w:highlight w:val="none"/>');
});
it.each([
  [S.Asian, '<w:rFonts w:hint="eastAsia"/>'],
  [S.Complex, '<w:rFonts w:hint="cs"/>'],
  [S.Automatic, ""],
  [S.Latin, ""],
  [S.Ignore, ""],
] as const)(
  "collects actual script hint %s",
  /** Non-emitting modes keep the original untouched collection. @param mode - Actual enum. @param expected - XML. @returns Nothing. */ (
    mode,
    expected,
  ) => {
    expect(
      emit(
        /** Emits then detaches actual attributes. @param output - Actual output. @returns Nothing. */ (
          output,
        ) => {
          output.CharScriptHint(new SvxScriptHintItem(mode, W.RES_CHRATR_SCRIPT_HINT));
          output.CharScriptHint(new SvxScriptHintItem(S.Automatic, W.RES_CHRATR_SCRIPT_HINT));
          output.WriteCollectedRunProperties();
          output.WriteCollectedRunProperties();
        },
      ),
    ).toBe(expected);
  },
);
it.each([false, true])(
  "emits native hidden switch %s and preserves no-op optical/axis settings",
  /** Positive inline-heading paragraph orchestration remains unbound, without injecting private state. @param hidden - Actual bool. @returns Nothing. */ (
    hidden,
  ) => {
    expect(
      emit(
        /** Emits genuine pooled values. @param output - Actual output. @returns Nothing. */ (
          output,
        ) => {
          output.CharHidden(new SvxCharHiddenItem(hidden, W.RES_CHRATR_HIDDEN));
          output.CharOpticalSizing(new SvxOpticalSizingItem(true, W.RES_CHRATR_OPTICAL_SIZING));
          output.CharFontVariations(new SvxFontVariationsItem(W.RES_CHRATR_FONT_VARIATIONS));
        },
      ),
    ).toBe(hidden ? "<w:vanish/>" : '<w:vanish w:val="false"/>');
  },
);

import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { MID_SHADING_VALUE } from "../../../../editeng/inc/memberids";

it.each([
  [14000, 13, 42],
  [-14000, -3, -10],
] as const)(
  "preserves tdf127316 automatic escapement output %s",
  /** Replays source numeric witnesses at the genuine export boundary; full ODT/DOCX reload/layout is still pending. @param escape - Original automatic marker. @param position - Native half-point offset. @param percent - Original reloaded-percent assertion. @returns Nothing. */ (
    escape,
    position,
    percent,
  ) => {
    expect(
      emit(
        /** Emits actual24pt/65percent source values. @param output - Native output. @param document - Actual document. @returns Nothing. */ (
          output,
          document,
        ) => {
          const set = new SfxItemSet(document.GetAttrPool(), W.WRITER_CHARACTER_WHICH_RANGES),
            item = new SvxEscapementItem(escape, 65, W.RES_CHRATR_ESCAPEMENT);
          try {
            set.Put(new SvxFontHeightItem(480, 100, W.RES_CHRATR_FONTSIZE));
            output.GetExport().m_pISet = set;
            output.CharEscapement(item);
            output.WriteCollectedRunProperties();
          } finally {
            output.GetExport().m_pISet = undefined;
            item.Dispose();
            set.Dispose();
          }
        },
      ),
    ).toBe(`<w:position w:val="${position}"/><w:sz w:val="31"/>`);
    expect(Math.abs((position * 100) / 31 - percent)).toBeLessThanOrEqual(1);
  },
);
