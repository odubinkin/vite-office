/** @fileoverview RTF document import through native Writer paragraph and text hint owners. */
import { expect, it } from "vitest";
import { SwTableNode } from "../../core/docnode/node";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { VertOrientation } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { BorderLineStyle } from "../../../../offapi/com/sun/star/table/BorderLineStyle";
import { SwFrameSize } from "../../../inc/fmtfsize";
import { projectWriterTextRuns } from "../../core/txtnode/ndtxt";
import { FontStrikeout } from "../../../../tools/inc/fontenum";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { SvxTabAdjust, SvxTabStopItem } from "../../../../editeng/inc/tstpitem";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";
import {
  RES_UL_SPACE,
  RES_KEEP,
  RES_PARATR_SPLIT,
  RES_PARATR_WIDOWS,
  RES_PARATR_TABSTOP,
  RES_BREAK,
} from "../../../inc/hintids";
import { DFLT_ESC_PROP, DFLT_ESC_SUPER } from "../../../../editeng/inc/escapementitem";
import { RtfDocumentImpl } from "./rtfdocumentimpl";
import { RtfTokenizer } from "./rtftokenizer";
import { RtfExport } from "../../filter/ww8/rtfexport";

/** Imports one RTF fixture. @param input - RTF source. @returns Writer document. */
function read(input: string) {
  return new RtfDocumentImpl().Resolve(
    new RtfTokenizer(new TextEncoder().encode(input)).Tokenize(),
  );
}

it("imports paragraph spacing and keep controls into native item owners", () => {
  const document = read(
    "{\\rtf1\\ansi\\sb180\\sa300\\contextualspace\\keepn\\keep\\nowidctlpar First\\par\\pard\\widctlpar Second}",
  );
  try {
    const first = document.paragraphs[0];
    const second = document.paragraphs[1];
    expect((first?.GetAttr(RES_UL_SPACE) as SvxULSpaceItem).GetUpper()).toBe(180);
    expect((first?.GetAttr(RES_UL_SPACE) as SvxULSpaceItem).GetLower()).toBe(300);
    expect((first?.GetAttr(RES_UL_SPACE) as SvxULSpaceItem).GetContext()).toBe(true);
    expect((first?.GetAttr(RES_KEEP) as SfxBoolItem).GetValue()).toBe(true);
    expect((first?.GetAttr(RES_PARATR_SPLIT) as SfxBoolItem).GetValue()).toBe(false);
    expect((first?.GetAttr(RES_PARATR_WIDOWS) as SfxInt16Item).GetValue()).toBe(0);
    expect((second?.GetAttr(RES_PARATR_WIDOWS) as SfxInt16Item).GetValue()).toBe(2);
    expect((second?.GetAttr(RES_UL_SPACE) as SvxULSpaceItem).GetUpper()).toBe(0);
  } finally {
    document.Dispose();
  }
});

it("imports RTF absolute tab positions and source leader mapping into native stops", () => {
  const document = read(
    "{\\rtf1\\ansi\\tldot\\tqr\\tx720\\tlth\\tqc\\tx1440 First\\par\\pard\\tqdec\\tx2160 Second}",
  );
  try {
    expect(document.GetDocumentSettingManager().get("TABS_RELATIVE_TO_INDENT")).toBe(false);
    const first = document.paragraphs[0]?.GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem;
    expect(first.Count()).toBe(2);
    expect([first.At(0).GetTabPos(), first.At(0).GetAdjustment(), first.At(0).GetFill()]).toEqual([
      720,
      SvxTabAdjust.Right,
      ".",
    ]);
    expect([first.At(1).GetTabPos(), first.At(1).GetAdjustment(), first.At(1).GetFill()]).toEqual([
      1440,
      SvxTabAdjust.Center,
      "_",
    ]);
    const second = document.paragraphs[1]?.GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem;
    expect(second.Count()).toBe(1);
    expect(second.At(0).GetTabPos()).toBe(2160);
    expect(second.At(0).GetAdjustment()).toBe(SvxTabAdjust.Decimal);
  } finally {
    document.Dispose();
  }
});

it("applies the RTF default tab distance through the native document item pool", () => {
  const explicit = read("{\\rtf1\\ansi\\deftab900 Text}");
  const implicit = read("{\\rtf1\\ansi Text}");
  try {
    expect(
      (explicit.GetAttrPool().GetUserOrPoolDefaultItem(RES_PARATR_TABSTOP) as SvxTabStopItem)
        .At(0)
        .GetTabPos(),
    ).toBe(900);
    expect(
      (implicit.GetAttrPool().GetUserOrPoolDefaultItem(RES_PARATR_TABSTOP) as SvxTabStopItem)
        .At(0)
        .GetTabPos(),
    ).toBe(720);
  } finally {
    explicit.Dispose();
    implicit.Dispose();
  }
});

it("uses upstream flag presence for keep, spacing and page-before controls", () => {
  const document = read(
    "{\\rtf1\\ansi\\pagebb0 Ignored\\par\\pard\\contextualspace0\\keepn0\\keep0\\widctlpar0\\pagebb0 Kept}",
  );
  try {
    const first = document.paragraphs[0];
    const second = document.paragraphs[1];
    expect((first?.GetAttr(RES_BREAK) as SfxInt16Item).GetValue()).toBe(0);
    expect((second?.GetAttr(RES_BREAK) as SfxInt16Item).GetValue()).toBe(4);
    expect((second?.GetAttr(RES_KEEP) as SfxBoolItem).GetValue()).toBe(true);
    expect((second?.GetAttr(RES_PARATR_SPLIT) as SfxBoolItem).GetValue()).toBe(false);
    expect((second?.GetAttr(RES_PARATR_WIDOWS) as SfxInt16Item).GetValue()).toBe(2);
    expect((second?.GetAttr(RES_UL_SPACE) as SvxULSpaceItem).GetContext()).toBe(true);
  } finally {
    document.Dispose();
  }
});

it("keeps a table before the first body paragraph", /** Checks physical body order when RTF starts with a table. @returns Nothing. */ () => {
  const document = read("{\\rtf1\\ansi\\trowd\\cellx1440\\intbl Cell\\cell\\row\\pard After}");
  try {
    expect(document.GetNodes().getBodyContent()[0]).toBeInstanceOf(SwTableNode);
    expect(document.paragraphs.map((paragraph) => paragraph.GetText())).toEqual(["After"]);
  } finally {
    document.Dispose();
  }
});

it("imports cellx boundaries as independent native cell widths", () => {
  const document = read(
    "{\\rtf1\\ansi\\trowd\\cellx1200\\cellx3900\\intbl Left\\cell\\intbl Right\\cell\\row}",
  );
  try {
    const block = document.GetNodes().getBodyContent()[0];
    expect(block).toBeInstanceOf(SwTableNode);
    if (block instanceof SwTableNode) {
      expect(block.GetTable().GetFrameFormat().GetFrameSize().GetWidth()).toBe(3900);
      expect(
        block
          .GetTable()
          .GetTabLines()[0]
          ?.GetTabBoxes()
          .map((box) => box.GetFrameSize().GetWidth()),
      ).toEqual([1200, 2700]);
    }
  } finally {
    document.Dispose();
  }
});

it.each([
  ["trqc", HoriOrientation.CENTER],
  ["trqr", HoriOrientation.RIGHT],
] as const)("imports RTF table alignment %s", (control, expected) => {
  const document = read(`{\\rtf1\\ansi\\trowd\\${control}\\cellx1500\\intbl Cell\\cell\\row}`);
  try {
    const block = document.GetNodes().getBodyContent()[0];
    expect(block).toBeInstanceOf(SwTableNode);
    if (block instanceof SwTableNode) expect(block.GetTable().GetHoriOrient()).toBe(expected);
  } finally {
    document.Dispose();
  }
});

it("imports at-least row height without changing the default split state", () => {
  const document = read("{\\rtf1\\ansi\\trowd\\trrh480\\cellx1500\\intbl Cell\\cell\\row}");
  try {
    const block = document.GetNodes().getBodyContent()[0];
    expect(block).toBeInstanceOf(SwTableNode);
    if (block instanceof SwTableNode) {
      const row = block.GetTable().GetTabLines()[0];
      expect(row?.GetFrameSize().GetHeight()).toBe(480);
      expect(row?.GetFrameSize().GetHeightSizeType()).toBe(SwFrameSize.Minimum);
      expect(row?.GetRowSplit().GetValue()).toBe(true);
    }
  } finally {
    document.Dispose();
  }
});

it("maps per-cell RTF vertical alignment before each cellx boundary", () => {
  const document = read(
    "{\\rtf1\\ansi\\trowd\\clvertalt\\cellx1200\\clvertalb\\cellx2600\\intbl Top\\cell\\intbl Bottom\\cell\\row}",
  );
  try {
    const block = document.GetNodes().getBodyContent()[0];
    expect(block).toBeInstanceOf(SwTableNode);
    if (block instanceof SwTableNode)
      expect(
        block
          .GetTable()
          .GetTabLines()[0]
          ?.GetTabBoxes()
          .map((box) => box.GetVertOrient().GetVertOrient()),
      ).toEqual([VertOrientation.TOP, VertOrientation.BOTTOM]);
  } finally {
    document.Dispose();
  }
});

it("imports cell border style, width and color from the RTF color table", () => {
  const document = read(
    "{\\rtf1\\ansi{\\colortbl;\\red0\\green128\\blue255;}\\trowd\\clbrdrl\\brdrdot\\brdrw20\\brdrcf1\\cellx1200\\intbl Cell\\cell\\row}",
  );
  try {
    const block = document.GetNodes().getBodyContent()[0];
    expect(block).toBeInstanceOf(SwTableNode);
    if (block instanceof SwTableNode) {
      const left = block.GetTable().GetTabLines()[0]?.GetTabBoxes()[0]?.GetBox().GetLeft();
      expect(left?.GetBorderLineStyle()).toBe(BorderLineStyle.DOTTED);
      expect(left?.GetWidth()).toBe(20);
      expect([
        left?.GetColor().GetRed(),
        left?.GetColor().GetGreen(),
        left?.GetColor().GetBlue(),
      ]).toEqual([0, 128, 255]);
    }
  } finally {
    document.Dispose();
  }
});

it("imports group-scoped bold and paragraph alignment into native nodes", /** Checks actual text hints and paragraph items. @returns Nothing. */ () => {
  const document = read("{\\rtf1\\ansi\\qc Plain {\\b Bold} plain\\par\\ql Next}");
  try {
    expect(document.paragraphs.map((paragraph) => paragraph.GetText())).toEqual([
      "Plain Bold plain",
      "Next",
    ]);
    expect(document.paragraphs.map((paragraph) => paragraph.GetParagraphAlignment())).toEqual([
      "center",
      "left",
    ]);
    expect(
      projectWriterTextRuns(document.paragraphs[0])?.map((run) => [run.text, run.attributes.bold]),
    ).toEqual([
      ["Plain ", false],
      ["Bold", true],
      [" plain", false],
    ]);
  } finally {
    document.Dispose();
  }
});

it("resolves font and color tables into native character hints", /** Checks RTF table ownership. @returns Nothing. */ () => {
  const document = read(
    "{\\rtf1{\\fonttbl{\\f0 Arial;}}{\\colortbl;\\red255\\green0\\blue0;}\\f0\\cf1\\fs28 Red}",
  );
  try {
    const run = projectWriterTextRuns(document.paragraphs[0])?.[0];
    expect(run?.text).toBe("Red");
    expect(run?.attributes).toMatchObject({
      color: "#ff0000",
      fontFamily: "Arial",
      fontSizeTwips: 280,
    });
  } finally {
    document.Dispose();
  }
});

it("maps stylesheet paragraph controls to available Writer styles", () => {
  const document = read(
    "{\\rtf1{\\stylesheet{\\s0 Default Paragraph Style;}{\\s1 Heading 3;}}\\pard\\s1 Heading\\par\\pard\\s0 Body}",
  );
  try {
    expect(document.paragraphs.map((node) => node.GetParagraphStyle())).toEqual([
      "heading-3",
      "default",
    ]);
  } finally {
    document.Dispose();
  }
});

it("creates a document-owned collection for an external RTF paragraph style", () => {
  const document = read(
    "{\\rtf1{\\stylesheet{\\s42\\b\\fs28\\qc\\li180 Custom Note;}}\\pard\\s42 Styled}",
  );
  let reopened;
  try {
    const paragraph = document.paragraphs[0];
    expect(paragraph?.GetParagraphStyle()).toBe("custom-note");
    expect(paragraph?.GetTextFormatColl().GetName()).toBe("Custom Note");
    expect(paragraph?.GetParagraphAlignment()).toBe("center");
    expect(paragraph?.GetParagraphTextLeftMargin()).toBe(180);
    expect(projectWriterTextRuns(paragraph)[0]?.attributes).toMatchObject({
      bold: true,
      fontSizeTwips: 280,
    });
    reopened = new RtfDocumentImpl().Resolve(
      new RtfTokenizer(new RtfExport().ExportDocument(document)).Tokenize(),
    );
    expect(reopened.paragraphs[0]?.GetParagraphStyle()).toBe("custom-note");
    expect(reopened.paragraphs[0]?.GetParagraphAlignment()).toBe("center");
    expect(projectWriterTextRuns(reopened.paragraphs[0])[0]?.attributes.bold).toBe(true);
  } finally {
    reopened?.Dispose();
    document.Dispose();
  }
});

it("inherits RTF style characters until an explicit run control overrides them", () => {
  const document = read("{\\rtf1{\\stylesheet{\\s3\\b Strong Note;}}\\pard\\s3 Yes {\\b0 No} Yes}");
  try {
    expect(
      projectWriterTextRuns(document.paragraphs[0]).map((run) => [run.text, run.attributes.bold]),
    ).toEqual([
      ["Yes ", true],
      ["No", false],
      [" Yes", true],
    ]);
  } finally {
    document.Dispose();
  }
});

it("keeps distinct RTF style indexes when names normalize to the same identity", () => {
  const document = read(
    "{\\rtf1{\\stylesheet{\\s1 First-Note;}{\\s2 First Note;}}\\s1 One\\par\\s2 Two}",
  );
  try {
    expect(document.paragraphs.map((node) => node.GetParagraphStyle())).toEqual([
      "first-note",
      "first-note:2:1",
    ]);
  } finally {
    document.Dispose();
  }
});

it("imports first-line indentation, strikeout, superscript and hyperlink field results", /** Checks represented RTF dispatch and native owners. @returns Nothing. */ () => {
  const document = read(
    '{\\rtf1\\ansi\\fi-120 Base {\\strike crossed} {\\super raised} {\\field{\\*\\fldinst HYPERLINK "https://example.test"}{\\fldrslt linked}}}',
  );
  try {
    const node = document.paragraphs[0];
    expect(node?.GetParagraphFirstLineIndent()).toBe(-120);
    const runs = projectWriterTextRuns(node);
    expect(runs.find((run) => run.text === "crossed")?.attributes.strikeout).toBe(
      FontStrikeout.STRIKEOUT_SINGLE,
    );
    expect(runs.find((run) => run.text === "raised")?.attributes.escapement).toEqual({
      offset: DFLT_ESC_SUPER,
      height: DFLT_ESC_PROP,
    });
    expect(runs.find((run) => run.text === "linked")?.hyperlink?.url).toBe("https://example.test");
  } finally {
    document.Dispose();
  }
});

it("retains visible non-link field results without assigning a hyperlink", /** Checks unrelated fields stay plain at the represented field boundary. @returns Nothing. */ () => {
  const document = read("{\\rtf1\\ansi Before {\\field{\\*\\fldinst PAGE}{\\fldrslt 3}} after}");
  try {
    expect(document.paragraphs[0]?.GetText()).toBe("Before 3 after");
    expect(
      projectWriterTextRuns(document.paragraphs[0]).every((run) => run.hyperlink === undefined),
    ).toBe(true);
  } finally {
    document.Dispose();
  }
});
