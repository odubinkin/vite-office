/** @fileoverview Additional native document regression cases. */
/** @fileoverview RTF document import through native Writer paragraph and text hint owners. */
import { expect, it } from "vitest";

import { SvxAdjustItem } from "../../../../editeng/inc/adjustitem";

import { DFLT_ESC_PROP, DFLT_ESC_SUPER } from "../../../../editeng/inc/escapementitem";

import { SvxLineSpacingItem } from "../../../../editeng/inc/lspcitem";

import { SvxAdjust, SvxLineSpaceRule } from "../../../../editeng/inc/svxenum";

import { SvxTabAdjust, SvxTabStopItem } from "../../../../editeng/inc/tstpitem";

import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";

import { BorderLineStyle } from "../../../../offapi/com/sun/star/table/BorderLineStyle";

import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";

import { VertOrientation } from "../../../../offapi/com/sun/star/text/VertOrientation";

import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";

import { SfxInt16Item } from "../../../../svl/source/items/intitem";

import { FontStrikeout } from "../../../../tools/inc/fontenum";

import { SwFrameSize } from "../../../inc/fmtfsize";

import {
  RES_BREAK,
  RES_KEEP,
  RES_MARGIN_FIRSTLINE,
  RES_MARGIN_RIGHT,
  RES_MARGIN_TEXTLEFT,
  RES_PAGEDESC,
  RES_PARATR_ADJUST,
  RES_PARATR_LINESPACING,
  RES_PARATR_SPLIT,
  RES_PARATR_TABSTOP,
  RES_PARATR_WIDOWS,
  RES_UL_SPACE,
} from "../../../inc/hintids";

import { SwTableNode } from "../../core/docnode/node";

import { projectWriterTextRuns } from "../../core/txtnode/ndtxt";

import { RtfExport } from "../../filter/ww8/rtfexport";

import { RtfDocumentImpl } from "./rtfdocumentimpl";

import { RtfTokenizer } from "./rtftokenizer";

/** Imports one RTF fixture. @param input - RTF source. @returns Writer document. */
function read(input: string) {
  return new RtfDocumentImpl().ResolveBytes(new TextEncoder().encode(input));
}

it("retains the source ISCII null-context boundary instead of manufacturing a decoder context", /** Verifies retains the source ISCII null-context boundary instead of manufacturing a decoder context. @returns Nothing. */ () => {
  // WRITER181: native null-object access is undefined; TypeError is this port's callback binding, not a C++ execution certificate.
  expect(
    /** Verifies retains the source ISCII null-context boundary instead of manufacturing a decoder context. @returns Callback result. */ () =>
      read(String.raw`{\rtf1\ansi\ansicpg57002\'a1\'e9}`),
  ).toThrow(TypeError);
});

it.each([
  [51949, String.raw`\'a1\'a1\'81\'41`, "\u3000\uF181A"],
  [10003, String.raw`\'81\'41`, "\uAC02"],
  [51936, String.raw`\'a1\'a1\'81\'40`, "\u3000\uFFFD"],
  [10001, String.raw`\'85\'40`, "\u2460"],
  [10008, String.raw`\'a1\'a1`, "\u3000"],
  [10002, String.raw`\'a1\'40`, "\u3000"],
  [51932, String.raw`\'8e\'a1\'a1\'a1\'8f\'a2\'af`, "\uFF61\u3000\u02D8"],
])(
  "uses pinned SAL EUC and Apple DBCS aggregates for code page %i",
  /** Checks uses pinned SAL EUC and Apple DBCS aggregates for code page %i. @param codepage - Codepage. @param bytes - Bytes. @param expected - Expected. @returns Test completion or assertion result. */ (
    codepage,
    bytes,
    expected,
  ) => {
    const document = read(String.raw`{\rtf1\ansi\ansicpg${codepage}${bytes}}`);
    try {
      expect(document.paragraphs[0]?.GetText()).toBe(expected);
    } finally {
      document.Dispose();
    }
  },
);

it("imports hex CR/LF and a control word after Unicode fallback as separate paragraphs", /** Checks imports hex CR/LF and a control word after Unicode fallback as separate paragraphs. @returns Test completion or assertion result. */ () => {
  const document = read(String.raw`{\rtf1\ansi A\'0d\'0aB\u233\par?C}`);
  try {
    expect(
      document.paragraphs.map(
        /** Checks imports hex CR/LF and a control word after Unicode fallback as separate paragraphs. @param node - Node. @returns Test completion or assertion result. */ (
          node,
        ) => node.GetText(),
      ),
    ).toEqual(["A", "", "Bé", "C"]);
  } finally {
    document.Dispose();
  }
});

it("imports paragraph spacing and keep controls into native item owners", /** Checks imports paragraph spacing and keep controls into native item owners. @returns Test completion or assertion result. */ () => {
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

it("imports RTF absolute tab positions and source leader mapping into native stops", /** Checks imports RTF absolute tab positions and source leader mapping into native stops. @returns Test completion or assertion result. */ () => {
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

it("applies the RTF default tab distance through the native document item pool", /** Checks applies the RTF default tab distance through the native document item pool. @returns Test completion or assertion result. */ () => {
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

it("uses upstream flag presence for keep, spacing and page-before controls", /** Checks uses upstream flag presence for keep, spacing and page-before controls. @returns Test completion or assertion result. */ () => {
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

it("imports RTF line rules into named style and direct paragraph items", /** Checks imports RTF line rules into named style and direct paragraph items. @returns Test completion or assertion result. */ () => {
  const document = read(
    "{\\rtf1\\ansi{\\stylesheet{\\s1\\sl360\\slmult1 Named;}}\\pard\\s1 Styled\\par\\pard\\sl-420\\slmult0 Fixed}",
  );
  try {
    const styled = document.paragraphs[0];
    const fixed = document.paragraphs[1];
    const inherited = styled?.GetAttr(RES_PARATR_LINESPACING) as SvxLineSpacingItem;
    expect(styled?.GetParagraphStyle()).toBe("named");
    expect(inherited.GetLineSpaceRule()).toBe(SvxLineSpaceRule.Auto);
    expect(inherited.GetPropLineSpace()).toBe(150);
    const direct = fixed?.GetAttr(RES_PARATR_LINESPACING) as SvxLineSpacingItem;
    expect(direct.GetLineSpaceRule()).toBe(SvxLineSpaceRule.Fix);
    expect(direct.GetLineHeight()).toBe(420);
  } finally {
    document.Dispose();
  }
});

it("imports RTF global paper and first-section geometry through the document page descriptor", /** Checks imports RTF global paper and first-section geometry through the document page descriptor. @returns Test completion or assertion result. */ () => {
  const document = read(
    String.raw`{\rtf1\ansi\paperw12000\paperh16000\margl1000\margr1100\margt1200\margb1300\sectd\pgwsxn12500\pghsxn16500\marglsxn1400\lndscpsxn Page}`,
  );
  try {
    expect(document.GetPageDesc().GetValue()).toMatchObject({
      width: 12500,
      height: 16500,
      leftMargin: 1400,
      rightMargin: 1100,
      topMargin: 1200,
      bottomMargin: 1300,
      landscape: true,
    });
  } finally {
    document.Dispose();
  }
});

it.each(["page", "column"])(
  "imports a one-column RTF \\%s as the next paragraph page break",
  /** Checks imports a one-column RTF \%s as the next paragraph page break. @param control - Control. @returns Test completion or assertion result. */ (
    control,
  ) => {
    const document = read(`{\\rtf1\\ansi First\\${control}\\pard Second}`);
    try {
      expect(
        document.paragraphs.map(
          /** Checks imports a one-column RTF \%s as the next paragraph page break. @param paragraph - Paragraph. @returns Test completion or assertion result. */ (
            paragraph,
          ) => paragraph.GetText(),
        ),
      ).toEqual(["First", "Second"]);
      expect((document.paragraphs[1]?.GetAttr(RES_BREAK) as SfxInt16Item).GetValue()).toBe(4);
      expect((document.paragraphs[0]?.GetAttr(RES_BREAK) as SfxInt16Item).GetValue()).toBe(0);
    } finally {
      document.Dispose();
    }
  },
);

it("ignores an RTF page symbol inside a table cell", /** Checks ignores an RTF page symbol inside a table cell. @returns Test completion or assertion result. */ () => {
  const document = read(
    String.raw`{\rtf1\ansi\trowd\cellx1440\intbl Before\page After\cell\row\pard End}`,
  );
  try {
    const table = document.GetNodes().getBodyContent()[0];
    expect(table).toBeInstanceOf(SwTableNode);
    if (!(table instanceof SwTableNode)) return;
    expect(table.GetTable().GetTabLines()[0]?.GetTabBoxes()[0]?.GetParagraphs()[0]?.GetText()).toBe(
      "BeforeAfter",
    );
    expect((document.paragraphs[0]?.GetAttr(RES_BREAK) as SfxInt16Item).GetValue()).toBe(0);
  } finally {
    document.Dispose();
  }
});

it("assigns an RTF page symbol before a table to the table frame", /** Checks assigns an RTF page symbol before a table to the table frame. @returns Test completion or assertion result. */ () => {
  const document = read(
    String.raw`{\rtf1\ansi Before\par\page\trowd\cellx1440\intbl Cell\cell\row}`,
  );
  try {
    const table = document
      .GetNodes()
      .getBodyContent()
      .find(
        /** Checks assigns an RTF page symbol before a table to the table frame. @param block - Block. @returns Test completion or assertion result. */ (
          block,
        ) => block instanceof SwTableNode,
      );
    expect(table).toBeInstanceOf(SwTableNode);
    expect(
      (table?.GetTable().GetFrameFormat().GetAttrSet().Get(RES_BREAK) as SfxInt16Item).GetValue(),
    ).toBe(4);
  } finally {
    document.Dispose();
  }
});

it("flushes a table before applying a following RTF page symbol", /** Checks flushes a table before applying a following RTF page symbol. @returns Test completion or assertion result. */ () => {
  const document = read(
    String.raw`{\rtf1\ansi\trowd\cellx1440\intbl Cell\cell\row\page\pard After}`,
  );
  try {
    const table = document.GetNodes().getBodyContent()[0];
    expect(table).toBeInstanceOf(SwTableNode);
    expect(
      document.paragraphs.map(
        /** Checks flushes a table before applying a following RTF page symbol. @param paragraph - Paragraph. @returns Test completion or assertion result. */ (
          paragraph,
        ) => paragraph.GetText(),
      ),
    ).toEqual(["After"]);
    expect((document.paragraphs[0]?.GetAttr(RES_BREAK) as SfxInt16Item).GetValue()).toBe(4);
  } finally {
    document.Dispose();
  }
});

it("retains consecutive RTF page symbols as separate page breaks", /** Checks retains consecutive RTF page symbols as separate page breaks. @returns Test completion or assertion result. */ () => {
  const document = read(String.raw`{\rtf1\ansi First\page\page Second}`);
  try {
    expect(
      document.paragraphs.map(
        /** Checks retains consecutive RTF page symbols as separate page breaks. @param paragraph - Paragraph. @returns Test completion or assertion result. */ (
          paragraph,
        ) => paragraph.GetText(),
      ),
    ).toEqual(["First", "", "Second"]);
    expect((document.paragraphs[1]?.GetAttr(RES_BREAK) as SfxInt16Item).GetValue()).toBe(4);
    expect((document.paragraphs[2]?.GetAttr(RES_BREAK) as SfxInt16Item).GetValue()).toBe(4);
  } finally {
    document.Dispose();
  }
});

it("materializes a later RTF page section on its first paragraph", /** Checks materializes a later RTF page section on its first paragraph. @returns Test completion or assertion result. */ () => {
  const document = read(
    String.raw`{\rtf1\ansi\paperw12000\paperh16000 First\par\sect\sectd\pgwsxn14000\marglsxn900\pgnstarts7\pgnrestart\sbkpage Second\par Third}`,
  );
  try {
    expect(
      document.paragraphs.map(
        /** Checks materializes a later RTF page section on its first paragraph. @param paragraph - Paragraph. @returns Test completion or assertion result. */ (
          paragraph,
        ) => paragraph.GetText(),
      ),
    ).toEqual(["First", "Second", "Third"]);
    const sectionPage = document.FindPageDesc("Converted1");
    expect(sectionPage?.GetValue()).toMatchObject({ width: 14000, height: 16000, leftMargin: 900 });
    expect(document.paragraphs[1]?.GetSwAttrSet().Get(RES_PAGEDESC)).toMatchObject({
      name: "Converted1",
      numOffset: 1,
    });
    expect(
      document.paragraphs[2]?.GetpSwAttrSet()?.GetItemIfSet(RES_PAGEDESC, false),
    ).toBeUndefined();
  } finally {
    document.Dispose();
  }
});

it("materializes a later RTF page section before its first table", /** Checks materializes a later RTF page section before its first table. @returns Test completion or assertion result. */ () => {
  const document = read(
    String.raw`{\rtf1\ansi First\par\sect\sectd\pgwsxn13000\sbkpage\trowd\cellx1440\intbl Cell\cell\row\pard After}`,
  );
  try {
    const table = document
      .GetNodes()
      .getBodyContent()
      .find(
        /** Checks materializes a later RTF page section before its first table. @param block - Block. @returns Test completion or assertion result. */ (
          block,
        ) => block instanceof SwTableNode,
      );
    expect(table).toBeInstanceOf(SwTableNode);
    expect(table?.GetTable().GetFrameFormat().GetAttrSet().Get(RES_PAGEDESC)).toMatchObject({
      name: "Converted1",
    });
    expect(document.FindPageDesc("Converted1")?.GetValue().width).toBe(13000);
  } finally {
    document.Dispose();
  }
});

it("resets each RTF section to global physical defaults and ends a pending paragraph", /** Checks resets each RTF section to global physical defaults and ends a pending paragraph. @returns Test completion or assertion result. */ () => {
  const document = read(
    String.raw`{\rtf1\ansi\paperw12000\paperh16000\margl1000 First\sect\sectd\pgwsxn14000 Second\sect\sectd Third}`,
  );
  try {
    expect(
      document.paragraphs.map(
        /** Checks resets each RTF section to global physical defaults and ends a pending paragraph. @param paragraph - Paragraph. @returns Test completion or assertion result. */ (
          paragraph,
        ) => paragraph.GetText(),
      ),
    ).toEqual(["First", "Second", "Third"]);
    expect(document.GetPageDesc().GetValue()).toMatchObject({ width: 12000, leftMargin: 1000 });
    expect(document.FindPageDesc("Converted1")?.GetValue()).toMatchObject({
      width: 14000,
      leftMargin: 1000,
    });
    expect(document.FindPageDesc("Converted2")?.GetValue()).toMatchObject({
      width: 12000,
      leftMargin: 1000,
    });
  } finally {
    document.Dispose();
  }
});

it("keeps a table before the first body paragraph", /** Checks physical body order when RTF starts with a table. @returns Nothing. */ () => {
  const document = read("{\\rtf1\\ansi\\trowd\\cellx1440\\intbl Cell\\cell\\row\\pard After}");
  try {
    expect(document.GetNodes().getBodyContent()[0]).toBeInstanceOf(SwTableNode);
    expect(
      document.paragraphs.map(
        /** Checks keeps a table before the first body paragraph. @param paragraph - Paragraph. @returns Test completion or assertion result. */ (
          paragraph,
        ) => paragraph.GetText(),
      ),
    ).toEqual(["After"]);
  } finally {
    document.Dispose();
  }
});

it("imports cellx boundaries as independent native cell widths", /** Checks imports cellx boundaries as independent native cell widths. @returns Test completion or assertion result. */ () => {
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
          .map(
            /** Checks imports cellx boundaries as independent native cell widths. @param box - Box. @returns Test completion or assertion result. */ (
              box,
            ) => box.GetFrameSize().GetWidth(),
          ),
      ).toEqual([1200, 2700]);
    }
  } finally {
    document.Dispose();
  }
});

it.each([
  [2, 2],
  [11, 0],
] as const)(
  "imports %i consecutive RTF header rows with the source limit",
  /** Checks imports %i consecutive RTF header rows with the source limit. @param headers - Headers. @param expected - Expected. @returns Test completion or assertion result. */ (
    headers,
    expected,
  ) => {
    const row =
      /** Checks imports %i consecutive RTF header rows with the source limit. @param index - Index. @returns Test completion or assertion result. */ (
        index: number,
      ) => `\\trowd${index < headers ? "\\trhdr" : ""}\\cellx1200\\intbl Row ${index}\\cell\\row`;
    const source = `{\\rtf1\\ansi${Array.from({ length: headers + 1 }, /** Checks imports %i consecutive RTF header rows with the source limit. @param _ - Unused callback argument. @param index - Index. @returns Test completion or assertion result. */ (_, index) => row(index)).join("")}}`;
    const document = read(source);
    try {
      const block = document.GetNodes().getBodyContent()[0];
      expect(block).toBeInstanceOf(SwTableNode);
      if (block instanceof SwTableNode) {
        expect(block.GetTable().GetTabLines()).toHaveLength(headers + 1);
        expect(block.GetTable().GetRowsToRepeat()).toBe(expected);
      }
    } finally {
      document.Dispose();
    }
  },
);

it("stops the repeating-header prefix at the first ordinary row", /** Checks stops the repeating-header prefix at the first ordinary row. @returns Test completion or assertion result. */ () => {
  const document = read(
    "{\\rtf1\\ansi\\trowd\\trhdr\\cellx1200\\intbl One\\cell\\row\\trowd\\cellx1200\\intbl Two\\cell\\row\\trowd\\trhdr\\cellx1200\\intbl Three\\cell\\row}",
  );
  try {
    const block = document.GetNodes().getBodyContent()[0];
    expect(block).toBeInstanceOf(SwTableNode);
    if (block instanceof SwTableNode) expect(block.GetTable().GetRowsToRepeat()).toBe(1);
  } finally {
    document.Dispose();
  }
});

it.each([
  ["trqc", HoriOrientation.CENTER],
  ["trqr", HoriOrientation.RIGHT],
] as const)(
  "imports RTF table alignment %s",
  /** Checks imports RTF table alignment %s. @param control - Control. @param expected - Expected. @returns Test completion or assertion result. */ (
    control,
    expected,
  ) => {
    const document = read(`{\\rtf1\\ansi\\trowd\\${control}\\cellx1500\\intbl Cell\\cell\\row}`);
    try {
      const block = document.GetNodes().getBodyContent()[0];
      expect(block).toBeInstanceOf(SwTableNode);
      if (block instanceof SwTableNode) expect(block.GetTable().GetHoriOrient()).toBe(expected);
    } finally {
      document.Dispose();
    }
  },
);

it("imports at-least row height without changing the default split state", /** Checks imports at-least row height without changing the default split state. @returns Test completion or assertion result. */ () => {
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

it("maps per-cell RTF vertical alignment before each cellx boundary", /** Checks maps per-cell RTF vertical alignment before each cellx boundary. @returns Test completion or assertion result. */ () => {
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
          .map(
            /** Checks maps per-cell RTF vertical alignment before each cellx boundary. @param box - Box. @returns Test completion or assertion result. */ (
              box,
            ) => box.GetVertOrient().GetVertOrient(),
          ),
      ).toEqual([VertOrientation.TOP, VertOrientation.BOTTOM]);
  } finally {
    document.Dispose();
  }
});

it("imports cell border style, width and color from the RTF color table", /** Checks imports cell border style, width and color from the RTF color table. @returns Test completion or assertion result. */ () => {
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
    expect(
      document.paragraphs.map(
        /** Checks imports group-scoped bold and paragraph alignment into native nodes. @param paragraph - Paragraph. @returns Test completion or assertion result. */ (
          paragraph,
        ) => paragraph.GetText(),
      ),
    ).toEqual(["Plain Bold plain", "Next"]);
    expect(
      document.paragraphs.map(
        /** Checks imports group-scoped bold and paragraph alignment into native nodes. @param paragraph - Paragraph. @returns Test completion or assertion result. */ (
          paragraph,
        ) => paragraph.GetParagraphAlignment(),
      ),
    ).toEqual(["center", "left"]);
    expect(
      projectWriterTextRuns(document.paragraphs[0])?.map(
        /** Checks imports group-scoped bold and paragraph alignment into native nodes. @param run - Run. @returns Test completion or assertion result. */ (
          run,
        ) => [run.text, run.attributes.bold],
      ),
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

it("maps stylesheet paragraph controls to available Writer styles", /** Checks maps stylesheet paragraph controls to available Writer styles. @returns Test completion or assertion result. */ () => {
  const document = read(
    "{\\rtf1{\\stylesheet{\\s0 Default Paragraph Style;}{\\s1 Heading 3;}}\\pard\\s1 Heading\\par\\pard\\s0 Body}",
  );
  try {
    expect(
      document.paragraphs.map(
        /** Checks maps stylesheet paragraph controls to available Writer styles. @param node - Node. @returns Test completion or assertion result. */ (
          node,
        ) => node.GetParagraphStyle(),
      ),
    ).toEqual(["heading-3", "default"]);
  } finally {
    document.Dispose();
  }
});

it("creates a document-owned collection for an external RTF paragraph style", /** Checks creates a document-owned collection for an external RTF paragraph style. @returns Test completion or assertion result. */ () => {
  const document = read(
    "{\\rtf1{\\stylesheet{\\s42\\b\\fs28\\qc\\li180 Custom Note;}}\\pard\\s42\\b\\fs28 Styled}",
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
      new RtfTokenizer(RtfExport.WriteDocument(document)).Tokenize(),
    );
    expect(reopened.paragraphs[0]?.GetParagraphStyle()).toBe("custom-note");
    expect(reopened.paragraphs[0]?.GetParagraphAlignment()).toBe("center");
    expect(projectWriterTextRuns(reopened.paragraphs[0])[0]?.attributes.bold).toBe(true);
  } finally {
    reopened?.Dispose();
    document.Dispose();
  }
});

it("preserves source unresolved forward stylesheet parent and follow names", /** Source names are captured immediately without deferred numeric-index fixup (WRITER206). @returns Test completion or assertion result. */ () => {
  const document = read(
    "{\\rtf1{\\stylesheet{\\s2\\sbasedon5\\snext7 Child;}{\\s7 Follow;}{\\s5\\b Parent;}}\\pard\\s2\\b Styled}",
  );
  try {
    const child = document.FindTextFormatCollByName("Child");
    expect(child?.DerivedFrom()).toBe(document.GetDfltTextFormatColl());
    expect(child?.GetNextTextFormatColl()).toBe(child);
    expect(document.paragraphs[0]?.GetTextFormatColl()).toBe(child);
    expect(projectWriterTextRuns(document.paragraphs[0])[0]?.attributes.bold).toBe(true);
  } finally {
    document.Dispose();
  }
});

it("imports source builtin aliases while keeping reserved and case-distinct user styles independent", /** Checks imports source builtin aliases while keeping reserved and case-distinct user styles independent. @returns Test completion or assertion result. */ () => {
  const document = read(
    "{\\rtf1{\\stylesheet{\\s1 BodyText;}{\\s2 Footnote Text;}{\\s3 Standard;}{\\s4\\sbasedon3 Text body;}{\\s5 TEXT BODY;}}\\pard\\s1 Body\\par\\pard\\s2 Note\\par\\pard\\s4 User\\par\\pard\\s5 Case}",
  );
  try {
    expect(document.paragraphs[0]?.GetTextFormatColl()).toBe(
      document.GetTextFormatColl("text-body"),
    );
    expect(document.paragraphs[1]?.GetTextFormatColl()).toBe(
      document.GetTextFormatColl("footnote"),
    );
    const user = document.paragraphs[2]?.GetTextFormatColl();
    expect(user?.GetName()).toBe("Text body (WW)");
    expect(user?.DerivedFrom()?.GetName()).toBe("Standard (WW)");
    expect(document.paragraphs[3]?.GetTextFormatColl().GetName()).toBe("TEXT BODY");
    expect(document.paragraphs[3]?.GetTextFormatColl()).not.toBe(
      document.GetTextFormatColl("text-body"),
    );
  } finally {
    document.Dispose();
  }
});

it("ignores zero stylesheet indents only when based-on is absent", /** Checks ignores zero stylesheet indents only when based-on is absent. @returns Test completion or assertion result. */ () => {
  const document = read(
    "{\\rtf1{\\stylesheet{\\s2\\li0\\ri0\\fi0 Root;}{\\s3\\sbasedon0\\li0\\ri0\\fi0 Derived;}}\\s2 Root\\par\\pard\\s3 Derived}",
  );
  try {
    const root = document.FindTextFormatCollByName("Root");
    const derived = document.FindTextFormatCollByName("Derived");
    for (const which of [RES_MARGIN_TEXTLEFT, RES_MARGIN_RIGHT, RES_MARGIN_FIRSTLINE]) {
      expect(root?.GetAttrSet().GetItemIfSet(which, false)).toBeUndefined();
      expect(derived?.GetAttrSet().GetItemIfSet(which, false)).toBeDefined();
    }
  } finally {
    document.Dispose();
  }
});

it("maps logical RTF indents and resets inherited first-line indent on direct li", /** Checks maps logical RTF indents and resets inherited first-line indent on direct li. @returns Test completion or assertion result. */ () => {
  const document = read(
    "{\\rtf1{\\stylesheet{\\s42\\fi240 Indented;}}\\pard\\s42\\li180\\lin200\\rin300 Reset\\par\\pard\\s42\\fi360\\li180 Keep}",
  );
  try {
    expect(document.paragraphs[0]?.GetParagraphTextLeftMargin()).toBe(200);
    expect(document.paragraphs[0]?.GetParagraphRightMargin()).toBe(300);
    expect(document.paragraphs[0]?.GetParagraphFirstLineIndent()).toBe(0);
    expect(document.paragraphs[1]?.GetParagraphFirstLineIndent()).toBe(360);
  } finally {
    document.Dispose();
  }
});

it("keeps qd distributed-last-line alignment in styles and direct overrides", /** Checks keeps qd distributed-last-line alignment in styles and direct overrides. @returns Test completion or assertion result. */ () => {
  const document = read(
    "{\\rtf1{\\stylesheet{\\s42\\qd Distributed;}}\\pard\\s42 Styled\\par\\pard\\s42\\qj Direct}",
  );
  try {
    const inherited = document.paragraphs[0]?.GetAttr(RES_PARATR_ADJUST) as
      SvxAdjustItem | undefined;
    const direct = document.paragraphs[1]?.GetAttr(RES_PARATR_ADJUST) as SvxAdjustItem | undefined;
    expect(inherited?.GetAdjust()).toBe(SvxAdjust.Block);
    expect(inherited?.GetLastBlock()).toBe(SvxAdjust.Block);
    expect(direct?.GetAdjust()).toBe(SvxAdjust.Block);
    expect(direct?.GetLastBlock()).toBe(SvxAdjust.Left);
  } finally {
    document.Dispose();
  }
});

it("retains style definitions while native missing run-property defaults override their appearance", /** Checks inherits RTF style characters until an explicit run control overrides them. @returns Test completion or assertion result. */ () => {
  const document = read("{\\rtf1{\\stylesheet{\\s3\\b Strong Note;}}\\pard\\s3 Yes {\\b0 No} Yes}");
  try {
    expect(
      projectWriterTextRuns(document.paragraphs[0]).map(
        /** Checks inherits RTF style characters until an explicit run control overrides them. @param run - Run. @returns Test completion or assertion result. */ (
          run,
        ) => [run.text, run.attributes.bold],
      ),
    ).toEqual([["Yes No Yes", false]]);
  } finally {
    document.Dispose();
  }
});

it("keeps distinct RTF style indexes when names normalize to the same identity", /** Checks keeps distinct RTF style indexes when names normalize to the same identity. @returns Test completion or assertion result. */ () => {
  const document = read(
    "{\\rtf1{\\stylesheet{\\s1 First-Note;}{\\s2 First Note;}}\\s1 One\\par\\s2 Two}",
  );
  try {
    expect(
      document.paragraphs.map(
        /** Checks keeps distinct RTF style indexes when names normalize to the same identity. @param node - Node. @returns Test completion or assertion result. */ (
          node,
        ) => node.GetParagraphStyle(),
      ),
    ).toEqual(["first-note", "first-note:2:1"]);
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
    expect(
      runs.find(
        /** Checks imports first-line indentation, strikeout, superscript and hyperlink field results. @param run - Run. @returns Test completion or assertion result. */ (
          run,
        ) => run.text === "crossed",
      )?.attributes.strikeout,
    ).toBe(FontStrikeout.STRIKEOUT_SINGLE);
    expect(
      runs.find(
        /** Checks imports first-line indentation, strikeout, superscript and hyperlink field results. @param run - Run. @returns Test completion or assertion result. */ (
          run,
        ) => run.text === "raised",
      )?.attributes.escapement,
    ).toEqual({
      offset: DFLT_ESC_SUPER,
      height: DFLT_ESC_PROP,
    });
    expect(
      runs.find(
        /** Checks https://example.test. @param run - Run. @returns Test completion or assertion result. */ (
          run,
        ) => run.text === "linked",
      )?.hyperlink?.url,
    ).toBe("https://example.test");
  } finally {
    document.Dispose();
  }
});

it("retains visible non-link field results without assigning a hyperlink", /** Checks unrelated fields stay plain at the represented field boundary. @returns Nothing. */ () => {
  const document = read("{\\rtf1\\ansi Before {\\field{\\*\\fldinst PAGE}{\\fldrslt 3}} after}");
  try {
    expect(document.paragraphs[0]?.GetText()).toBe("Before 3 after");
    expect(
      projectWriterTextRuns(document.paragraphs[0]).every(
        /** Checks retains visible non-link field results without assigning a hyperlink. @param run - Run. @returns Test completion or assertion result. */ (
          run,
        ) => run.hyperlink === undefined,
      ),
    ).toBe(true);
  } finally {
    document.Dispose();
  }
});

it("imports source HYPERLINK URL, target, name and fragment field switches", /** Checks imports source HYPERLINK URL, target, name and fragment field switches. @returns Test completion or assertion result. */ () => {
  const document = read(
    String.raw`{\rtf1\ansi{\field{\*\fldinst HYPERLINK "https://example.test/a\\\\b" \\t "New Window"}{\fldrslt first}} {\field{\*\fldinst HYPERLINK "" \\l "chapter"}{\fldrslt second}} {\field{\*\fldinst HYPERLINK "https://example.test" \\o "Link Name"}{\fldrslt third}}}`,
  );
  try {
    const runs = projectWriterTextRuns(document.paragraphs[0]);
    expect(
      runs.find(
        /** Checks imports source HYPERLINK URL, target, name and fragment field switches. @param run - Run. @returns Test completion or assertion result. */ (
          run,
        ) => run.text === "first",
      )?.hyperlink,
    ).toEqual({
      url: "https://example.test/a\\b",
      targetFrame: "New Window",
    });
    expect(
      runs.find(
        /** Checks #chapter. @param run - Run. @returns Test completion or assertion result. */ (
          run,
        ) => run.text === "second",
      )?.hyperlink?.url,
    ).toBe("#chapter");
    expect(
      runs.find(
        /** Checks imports source HYPERLINK URL, target, name and fragment field switches. @param run - Run. @returns Test completion or assertion result. */ (
          run,
        ) => run.text === "third",
      )?.hyperlink,
    ).toEqual({
      url: "https://example.test",
      name: "Link Name",
    });
  } finally {
    document.Dispose();
  }
});
