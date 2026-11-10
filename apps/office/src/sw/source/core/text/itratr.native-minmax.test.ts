/** @fileoverview Writer import-time min/max font binding and anchored frame width inputs on actual model owners. */
import { implementations } from "../../../../desktop/browser/app/uno-components";
import { InitApplicationServiceManager } from "../../../../desktop/source/app/appinit";
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
import { SvxScriptHintItem } from "../../../../editeng/source/items/textitem.modes";
import { ScriptHintType } from "../../../../i18nutil/inc/scriptchangescanner";
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
  CH_TXT_ATR_FIELDEND,
  CH_TXT_ATR_FIELDSEP,
  CH_TXT_ATR_FIELDSTART,
  CH_TXT_ATR_FORMELEMENT,
  RES_CHRATR_CJK_FONT,
  RES_CHRATR_CJK_FONTSIZE,
  RES_CHRATR_CJK_POSTURE,
  RES_CHRATR_CJK_WEIGHT,
  RES_CHRATR_ESCAPEMENT,
  RES_CHRATR_SCRIPT_HINT,
  RES_MARGIN_FIRSTLINE,
  RES_MARGIN_RIGHT,
  RES_MARGIN_TEXTLEFT,
} from "../../../inc/hintids";
import { SwNodeRange } from "../../../inc/ndindex";
import type { SwTable } from "../table/swtable";
import { SwHTMLTableLayout } from "../doc/htmltbl";
import { SwHTMLTableLayoutColumn } from "../doc/htmltbl.column";
import { SwHTMLTableLayoutCell, SwHTMLTableLayoutCnts } from "../doc/htmltbl.values";
import { SvxAdjust } from "../../../../editeng/inc/svxenum";
import { SwDoc } from "../doc/doc";
import { SwPosition } from "../crsr/pam";
import { SwFormatAutoFormat, SwTextAttrEnd } from "../txtnode/txatbase";
import { CreateSwMeasurementFont, MeasureSwTextWidth } from "../txtnode/swfont";
import { GetMinMaxNodeMetrics } from "./itratr.minmax";
import { SwAttrIter } from "./itratr";
import { SwScriptInfo } from "./porlay";

InitApplicationServiceManager(implementations);

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

/** Creates a real document with a controllable physical-width boundary. @returns Document and measured ranges. */
function measurementFixture() {
  const measured: { text: string; height: number }[] = [];
  const doc = new SwDoc({
    defaultFontDevice: {
      /** Lets the document choose its ordinary default font family. @returns Absent device override. */
      getDefaultFont: () => undefined,
      /** Records glyph ranges while supplying a stable width to the core calculation. @param font - Selected subfont. @param text - Original UTF-16 text. @param start - First code unit. @param length - Range length. @returns Width in twips. */
      measureTextWidth: (font, text, start, length) => {
        measured.push({ text: text.slice(start, start + length), height: font.heightTwips });
        return 30 * length;
      },
    },
  });
  documents.push(doc);
  return { doc, measured };
}

/** Reads the exact substring passed to the physical device. @param entry - Measured run. @returns Original substring. */
function measuredText(entry: { text: string }): string {
  return entry.text;
}

it("accumulates real word segments, hard blanks, hard hyphens and the widest row", /** Uses native controls, dictionary boundaries and the original twenty-twip addition. @returns Nothing. */ () => {
  const { doc, measured } = measurementFixture();
  const node = doc.paragraphs[0];
  assert(node);
  node.SetText("aa\u00a0bb\u2011c\taaaa\nx\u00ady");
  expect(node.GetMinMaxSize(node.GetIndex())).toEqual({
    minimum: 230,
    maximum: 350,
    absoluteMinimum: 230,
  });
  expect(measured.map(measuredText).join("")).toBe("aa\u00a0bb\u2011caaaaxy");
  node.SetText("\u00a0\u2011");
  expect(node.GetMinMaxSize(0)).toEqual({ minimum: 60, maximum: 60, absoluteMinimum: 60 });
});

it("uses actual script hints and native subfont changes across the same word", /** Applies a ranged character hint and checks the native script boundary and widths. @returns Nothing. */ () => {
  const { doc, measured } = measurementFixture();
  const node = doc.paragraphs[0];
  assert(node);
  node.SetText("a漢z");
  node.SetAttr(new SvxFontHeightItem(280, 100, RES_CHRATR_CJK_FONTSIZE));
  const set = new SfxItemSet(doc.GetAttrPool(), [[RES_CHRATR_SCRIPT_HINT, RES_CHRATR_SCRIPT_HINT]]);
  set.Put(new SvxScriptHintItem(ScriptHintType.Ignore, RES_CHRATR_SCRIPT_HINT));
  assert(node.InsertHint(new SwTextAttrEnd(new SwFormatAutoFormat(set), 1, 2)));
  const scripts = new SwScriptInfo();
  scripts.InitScriptInfo(node);
  expect(scripts.ScriptType(1)).toBe(ScriptType.LATIN);
  expect(scripts.NextScriptChg(0)).toBe(3);
  expect(node.GetMinMaxSize(0).maximum).toBe(110);
  expect(
    measured.map(
      /** Reads the selected subfont height. @param entry - Measured run. @returns Height in twips. */ (
        entry,
      ) => entry.height,
    ),
  ).toEqual([240, 240, 240]);
});

it("measures no field control marker and adds no margin for blank-only text", /** Exercises source GetNextAttr field delimiters and paragraph padding admission. @returns Nothing. */ () => {
  const { doc, measured } = measurementFixture();
  const node = doc.paragraphs[0];
  assert(node);
  node.SetText(
    ` ${CH_TXT_ATR_FIELDSTART}${CH_TXT_ATR_FIELDSEP} ${CH_TXT_ATR_FIELDEND}${CH_TXT_ATR_FORMELEMENT}`,
  );
  expect(node.GetMinMaxSize(0)).toEqual({ minimum: 0, maximum: 60, absoluteMinimum: 0 });
  expect(measured.map(measuredText)).toEqual([" ", " "]);
});

/** Builds a one-row layout on actual table boxes using their section pointers. @param table - Native table. @param count - Columns. @param width - Fixed table width. @returns Native layout with its column options initialized. */
function measuredLayout(table: SwTable, count: number, width = 0) {
  const layout = new SwHTMLTableLayout(
    table,
    1,
    count,
    false,
    false,
    width,
    false,
    0,
    0,
    0,
    SvxAdjust.Left,
    0,
    0,
    0,
    0,
    0,
  );
  for (let column = 0; column < count; ++column)
    layout.SetColumn(new SwHTMLTableLayoutColumn(0, false, false), column);
  table.SetHTMLTableLayout(layout);
  return layout;
}

it("measures a shared span only once and recalculates actual cell text on the next pass", /** Verifies source content pass references and minimum-column skip in the live grid. @returns Nothing. */ () => {
  const { doc, measured } = measurementFixture();
  const nodes = doc.GetNodes();
  const table = nodes.MakeTableNode("Span");
  const box = nodes.AppendTableRow(table, 1).GetTabBoxes()[0];
  assert(box);
  const start = box.GetSttNd();
  assert(start);
  const text = nodes.at(start.GetIndex() + 1).GetTextNode();
  assert(text);
  text.SetText("aa bb");
  const layout = measuredLayout(table, 2);
  const contents = new SwHTMLTableLayoutCnts(null, null, false, null);
  contents.SetTableBox(box);
  layout.SetCell(new SwHTMLTableLayoutCell(contents, 1, 2, 0, false, false), 0, 0);
  layout.SetCell(new SwHTMLTableLayoutCell(contents, 1, 1, 0, false, false), 0, 1);
  layout.AutoLayoutPass1();
  expect([layout.GetMin(), layout.GetMax()]).toEqual([80, 170]);
  expect(contents.IsPass1Done(1)).toBe(true);
  expect(measured.map(measuredText).join("")).toBe("aa bb");
  text.SetText("aaaaa");
  layout.AutoLayoutPass1();
  expect([layout.GetMin(), layout.GetMax()]).toEqual([170, 170]);
  expect(contents.IsPass1Done(2)).toBe(true);
});

it("compares new content against the wrapped native pass reference", /** Repeats WRITER381 on the real layout and then performs the first noncolliding pass. @returns Nothing. */ () => {
  const { doc } = measurementFixture();
  const nodes = doc.GetNodes();
  const table = nodes.MakeTableNode("Pass reference");
  const start = nodes.AppendTableRow(table, 1).GetTabBoxes()[0]?.GetSttNd();
  assert(start);
  const text = nodes.at(start.GetIndex() + 1).GetTextNode();
  assert(text);
  const layout = measuredLayout(table, 1);
  const cell = new SwHTMLTableLayoutCell(null, 1, 1, 0, false, false);
  layout.SetCell(cell, 0, 0);
  for (let pass = 0; pass < 255; ++pass) layout.AutoLayoutPass1();
  text.SetText("abc");
  cell.SetContents(new SwHTMLTableLayoutCnts(start, null, false, null));
  layout.AutoLayoutPass1();
  expect([layout.GetMin(), layout.GetMax()]).toEqual([0, 0]);
  layout.AutoLayoutPass1();
  expect([layout.GetMin(), layout.GetMax()]).toEqual([110, 110]);
});

it("raises a fixed nested table to its absolute width and preserves paragraph NOBR", /** Verifies the independent paragraph and table maxima on linked original content. @returns Nothing. */ () => {
  const { doc } = measurementFixture();
  const nodes = doc.GetNodes();
  const parent = nodes.MakeTableNode("Parent");
  const child = nodes.MakeTableNode("Child");
  const parentStart = nodes.AppendTableRow(parent, 1).GetTabBoxes()[0]?.GetSttNd();
  const childStart = nodes.AppendTableRow(child, 1).GetTabBoxes()[0]?.GetSttNd();
  assert(parentStart && childStart);
  const parentText = nodes.at(parentStart.GetIndex() + 1).GetTextNode();
  const childText = nodes.at(childStart.GetIndex() + 1).GetTextNode();
  assert(parentText && childText);
  parentText.SetText("aaaa bbbb");
  childText.SetText("aaa");
  const layout = measuredLayout(parent, 1);
  const nested = measuredLayout(child, 1, 220);
  nested.SetCell(
    new SwHTMLTableLayoutCell(
      new SwHTMLTableLayoutCnts(childStart, null, false, null),
      1,
      1,
      0,
      false,
      false,
    ),
    0,
    0,
  );
  const tail = new SwHTMLTableLayoutCnts(null, nested, false, null);
  const head = new SwHTMLTableLayoutCnts(parentStart, null, true, tail);
  layout.SetCell(new SwHTMLTableLayoutCell(head, 1, 1, 0, false, false), 0, 0);
  layout.AutoLayoutPass1();
  expect([layout.GetMin(), layout.GetMax()]).toEqual([290, 290]);
  expect(tail.IsPass1Done(1)).toBe(true);
  expect([nested.GetMin(), nested.GetMax()]).toEqual([110, 110]);
  parentText.SetText("bb");
  layout.AutoLayoutPass1();
  expect([layout.GetMin(), layout.GetMax()]).toEqual([220, 220]);
});

it("walks a nested table node without remeasuring its boxes and follows a user style to PRE", /** Actual cell text, subtable sections and native style inheritance feed independent widths. @returns Nothing. */ () => {
  const { doc, measured } = measurementFixture();
  const nodes = doc.GetNodes();
  const parent = nodes.MakeTableNode("Parent");
  const parentStart = nodes.AppendTableRow(parent, 1).GetTabBoxes()[0]?.GetSttNd();
  assert(parentStart);
  const child = nodes.MakeTableNodeBefore(parentStart.EndOfSectionNode(), "Child", {});
  const childStart = nodes.AppendTableRow(child, 1).GetTabBoxes()[0]?.GetSttNd();
  assert(childStart);
  const text = nodes.at(parentStart.GetIndex() + 1).GetTextNode();
  const nestedText = nodes.at(childStart.GetIndex() + 1).GetTextNode();
  assert(text && nestedText);
  const pre = doc.GetTextFormatColl("preformatted-text");
  text.ChgFormatColl(doc.MakeTextFormatColl("Inherited PRE", pre));
  text.SetText("ab cd");
  nestedText.SetText("abc");
  const layout = measuredLayout(parent, 1);
  const nested = measuredLayout(child, 1, 75);
  nested.SetCell(
    new SwHTMLTableLayoutCell(
      new SwHTMLTableLayoutCnts(childStart, null, false, null),
      1,
      1,
      0,
      false,
      false,
    ),
    0,
    0,
  );
  layout.SetCell(
    new SwHTMLTableLayoutCell(
      new SwHTMLTableLayoutCnts(parentStart, null, false, null),
      1,
      1,
      0,
      false,
      false,
    ),
    0,
    0,
  );
  layout.AutoLayoutPass1();
  expect([layout.GetMin(), layout.GetMax()]).toEqual([170, 170]);
  expect(measured.map(measuredText).join("")).toBe("ab cdabc");
});
