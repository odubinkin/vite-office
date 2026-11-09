/** @fileoverview Writer import-time min/max font binding and anchored frame width inputs on actual model owners. */
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { afterEach, assert, expect, it } from "vitest";
import * as ScriptType from "../../../../offapi/com/sun/star/i18n/ScriptType";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { RelOrientation } from "../../../../offapi/com/sun/star/text/RelOrientation";
import { WrapTextMode } from "../../../../offapi/com/sun/star/text/WrapTextMode";
import { RndStdIds } from "../../../../svx/inc/swframetypes";
import { FontFamily, FontItalic, FontPitch, FontWeight } from "../../../../tools/inc/fontenum";
import { RTL_TEXTENCODING_UTF8 } from "../../../../sal/inc/rtl/textenc";
import {
  SvxFontHeightItem,
  SvxFontItem,
  SvxPostureItem,
  SvxWeightItem,
} from "../../../../editeng/source/items/textitem";
import { SvxEscapementItem } from "../../../../editeng/inc/escapementitem";
import {
  SvxFirstLineIndentItem,
  SvxIndentValue,
  SvxRightMarginItem,
  SvxTextLeftMarginItem,
} from "../../../../editeng/inc/lrspitem";
import { SwFormatAnchor } from "../../../inc/fmtanchr";
import { SwFormatContent } from "../../../inc/fmtcntnt";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { SwFormatHoriOrient } from "../../../inc/fmtornt";
import { SwFormatSurround } from "../../../inc/fmtsrnd";
import { SwStartNodeType } from "../../../inc/ndtyp";
import {
  RES_CHRATR_CJK_FONT,
  RES_CHRATR_CJK_FONTSIZE,
  RES_CHRATR_CJK_POSTURE,
  RES_CHRATR_CJK_WEIGHT,
  RES_CHRATR_ESCAPEMENT,
  RES_MARGIN_FIRSTLINE,
  RES_MARGIN_RIGHT,
  RES_MARGIN_TEXTLEFT,
} from "../../../inc/hintids";
import { SwNodeRange } from "../../../inc/ndindex";
import type { SwTable } from "../table/swtable";
import { SwHTMLTableLayout } from "../doc/htmltbl";
import { SwDoc } from "../doc/doc";
import { SwPosition } from "../crsr/pam";
import { SwFormatAutoFormat, SwTextAttrEnd } from "../txtnode/txatbase";
import { CreateSwMeasurementFont, MeasureSwTextWidth } from "../txtnode/swfont";
import { GetMinMaxNodeMetrics } from "./itratr.minmax";
import { SwAttrIter } from "./itratr";

const documents: SwDoc[] = [];
afterEach(
  /** Releases native formats and node-index owners. @returns Nothing. */ () => {
    for (const document of documents.splice(0)) document.Dispose();
  },
);

/** Creates a genuine Writer paragraph with ordinary margin items. @returns Native document and paragraph. */
function fixture() {
  const document = new SwDoc();
  documents.push(document);
  const node = document.paragraphs[0];
  assert(node);
  node.SetText("a漢字z");
  node.SetAttr(new SvxTextLeftMarginItem(SvxIndentValue.twips(240), RES_MARGIN_TEXTLEFT));
  node.SetAttr(new SvxFirstLineIndentItem(SvxIndentValue.twips(100), RES_MARGIN_FIRSTLINE));
  node.SetAttr(new SvxRightMarginItem(SvxIndentValue.twips(70), RES_MARGIN_RIGHT));
  return { document, node };
}

/** Creates an actual registered Writer fly with a real section and borrowed anchor. @param value - Document/paragraph owners. @param width - Native frame width. @param orientation - Native horizontal orientation. @param relation - Native relation. @param wrap - Native surrounding mode. @returns Actual format. */
function fly(
  value: ReturnType<typeof fixture>,
  width: number,
  orientation = HoriOrientation.NONE,
  relation = RelOrientation.FRAME,
  wrap = WrapTextMode.PARALLEL,
) {
  const { document, node } = value,
    nodes = document.GetNodes(),
    start = nodes.MakeTextSection(
      nodes.GetEndOfAutotext(),
      SwStartNodeType.SwFlyStartNode,
      document.GetDfltTextFormatColl(),
    ),
    format = document.MakeFlyFrameFormat(
      document.GetUniqueFrameName(),
      document.GetDfltFrameFormat(),
    ),
    content = new SwFormatContent(start),
    anchor = new SwFormatAnchor(RndStdIds.FLY_AT_PARA),
    position = new SwPosition(node);
  try {
    anchor.SetAnchor(position);
    format.SetFormatAttr(content);
    format.SetFormatAttr(anchor);
    format.SetFormatAttr(new SwFormatFrameSize(SwFrameSize.Variable, width, 23));
    format.SetFormatAttr(new SwFormatHoriOrient(0, orientation, relation));
    format.SetFormatAttr(new SwFormatSurround(wrap));
  } finally {
    position.Dispose();
    anchor.Dispose();
    content.Dispose();
  }
  return format;
}

it("selects the physical script font and size from active native range items", /** Genuine hint iteration supplies script-specific and shared escapement attributes. @returns Nothing. */ () => {
  const { document, node } = fixture();
  node.SetAttr(
    new SvxFontItem(
      FontFamily.FAMILY_ROMAN,
      "Selected CJK",
      "Regular",
      FontPitch.PITCH_FIXED,
      RTL_TEXTENCODING_UTF8,
      RES_CHRATR_CJK_FONT,
    ),
  );
  node.SetAttr(new SvxFontHeightItem(280, 100, RES_CHRATR_CJK_FONTSIZE));
  const set = new SfxItemSet(document.GetAttrPool(), [[1, 200]]);
  set.Put(new SvxWeightItem(FontWeight.WEIGHT_BOLD, RES_CHRATR_CJK_WEIGHT));
  set.Put(new SvxPostureItem(FontItalic.ITALIC_OBLIQUE, RES_CHRATR_CJK_POSTURE));
  set.Put(new SvxEscapementItem(30, 64, RES_CHRATR_ESCAPEMENT));
  assert(node.InsertHint(new SwTextAttrEnd(new SwFormatAutoFormat(set), 1, 3)));
  const iterator = new SwAttrIter(node);
  iterator.Seek(1);
  const selected = CreateSwMeasurementFont(iterator.GetAttrHandler(), ScriptType.ASIAN);
  expect(selected.familyName).toBe("Selected CJK");
  expect(selected.styleName).toBe("Regular");
  expect(selected.family).toBe(FontFamily.FAMILY_ROMAN);
  expect(selected.pitch).toBe(FontPitch.PITCH_FIXED);
  expect(selected.charset).toBe(RTL_TEXTENCODING_UTF8);
  expect(selected.weight).toBe(FontWeight.WEIGHT_BOLD);
  expect(selected.italic).toBe(FontItalic.ITALIC_OBLIQUE);
  expect(selected.heightTwips).toBe(179);
  iterator.Seek(3);
  const after = CreateSwMeasurementFont(iterator.GetAttrHandler(), ScriptType.ASIAN);
  expect(after.heightTwips).toBe(280);
  expect(after.weight).not.toBe(FontWeight.WEIGHT_BOLD);
});

it("requires an actual physical output device for nonempty shaped widths", /** The import metric never substitutes a per-character estimate. @returns Nothing. */ () => {
  const { document, node } = fixture();
  const iterator = new SwAttrIter(node);
  expect(
    /** Calls the real attribute-to-device binding. @returns Native width. */ () =>
      MeasureSwTextWidth(
        document.GetDefaultFontDevice(),
        iterator.GetAttrHandler(),
        ScriptType.LATIN,
        node.GetText(),
        0,
        1,
      ),
  ).toThrow("actual output device");
});

it("uses the first-line offset when no numbering rule supplies it", /** Original native output replaces the paragraph text-left metric on the ordinary path. @returns Nothing. */ () => {
  const { node } = fixture();
  expect(GetMinMaxNodeMetrics(node, 0)).toEqual({ minimum: 0, maximum: 0, margin: 170 });
  node.SetAttr(new SvxFirstLineIndentItem(SvxIndentValue.twips(-20), RES_MARGIN_FIRSTLINE));
  expect(GetMinMaxNodeMetrics(node, 0)).toEqual({ minimum: 0, maximum: 20, margin: 50 });
});

it("uses through-wrap fly width for minimum only and scans the actual node anchor", /** A parallel fly contributes to maximum; a through fly contributes only to minimum. @returns Nothing. */ () => {
  const value = fixture();
  fly(value, 500);
  fly(value, 800, HoriOrientation.CENTER, RelOrientation.FRAME, WrapTextMode.THROUGH);
  expect(GetMinMaxNodeMetrics(value.node, value.node.GetIndex())).toEqual({
    minimum: 800,
    maximum: 500,
    margin: 170,
  });
  expect(GetMinMaxNodeMetrics(value.node, 0)).toEqual({ minimum: 0, maximum: 0, margin: 170 });
});

it("keeps the different left and right clamps for non-frame relative placement", /** Two actual left and one right fly reproduce the original order and clamp rules. @returns Nothing. */ () => {
  const value = fixture();
  fly(value, 150, HoriOrientation.LEFT, RelOrientation.PRINT_AREA);
  fly(value, 80, HoriOrientation.LEFT, RelOrientation.PRINT_AREA);
  fly(value, 180, HoriOrientation.RIGHT, RelOrientation.PRINT_AREA);
  expect(GetMinMaxNodeMetrics(value.node, value.node.GetIndex())).toEqual({
    minimum: 250,
    maximum: 260,
    margin: 170,
  });
});

/** Uses the native layout's existing phase-one metric fields for the anchored-table contract. */
class MeasuredTableLayout extends SwHTMLTableLayout {
  /** Binds real layout to a real table with already measured metrics. @param table - Native table. @returns Native layout. */
  constructor(table: SwTable) {
    super(table, 1, 1, false, false, 0, false, 0, 0, 0, SvxAdjust.Left, 0, 0, 0, 0, 0);
    this.m_nMin = 230;
    this.m_nMax = 740;
  }
}
import { SvxAdjust } from "../../../../editeng/inc/svxenum";

it.each([true, false])(
  "reads the attached native layout when the fly table is at the beginning: %s",
  /** The first and last nested-table paths use actual start/end node identities. @param first - Whether the table is the first fly content. @returns Nothing. */ (
    first,
  ) => {
    const value = fixture(),
      { document, node } = value,
      nodes = document.GetNodes(),
      format = fly(value, 800);
    const lead = first ? undefined : nodes.MakeTextNode("Before the table"),
      table = nodes.MakeTableNode("Contained"),
      range = new SwNodeRange(lead ?? table.GetTableNode(), nodes.GetEndOfContent());
    nodes.AppendTableRow(table, 1);
    nodes.SectionDown(range, SwStartNodeType.SwFlyStartNode);
    const section = range.aStart.GetNode();
    range.Dispose();
    assert(section.IsStartNode());
    const content = new SwFormatContent(section);
    try {
      format.SetFormatAttr(content);
    } finally {
      content.Dispose();
    }
    table.SetHTMLTableLayout(new MeasuredTableLayout(table));
    expect(GetMinMaxNodeMetrics(node, node.GetIndex())).toEqual({
      minimum: 230,
      maximum: 740,
      margin: 170,
    });
  },
);
