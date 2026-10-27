/** @fileoverview Native RTF table, list and inline attribute round trips. */
import { expect, it } from "vitest";
import { SvxAdjustItem } from "../../../../editeng/inc/adjustitem";
import {
  DFLT_ESC_AUTO_SUPER,
  DFLT_ESC_PROP,
  DFLT_ESC_SUPER,
} from "../../../../editeng/inc/escapementitem";
import { SvxFirstLineIndentItem, SvxIndentValue } from "../../../../editeng/inc/lrspitem";
import { SvxAdjust, SvxNumType } from "../../../../editeng/inc/svxenum";
import { SvxBorderLine } from "../../../../editeng/source/items/borderline";
import { SvxBoxItemLine } from "../../../../editeng/source/items/frmitems";
import * as NumberingType from "../../../../offapi/com/sun/star/style/NumberingType";
import { BorderLineStyle } from "../../../../offapi/com/sun/star/table/BorderLineStyle";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { VertOrientation } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { Color } from "../../../../tools/inc/color";
import { FontStrikeout } from "../../../../tools/inc/fontenum";
import { SwFrameSize } from "../../../inc/fmtfsize";
import { SwFormatRowSplit } from "../../../inc/fmtrowsplt";
import { RES_MARGIN_FIRSTLINE, RES_PARATR_ADJUST } from "../../../inc/hintids";
import { createWriterDocument } from "../../core/doc/doc";
import { applyWriterParagraphList } from "../../core/doc/list";
import { SwNumFormat } from "../../core/doc/number";
import { SwTableNode } from "../../core/docnode/node";
import { SwpHints } from "../../core/txtnode/ndhints";
import { projectWriterTextRuns } from "../../core/txtnode/ndtxt";
import { RtfDocumentImpl } from "../../writerfilter/rtftok/rtfdocumentimpl";
import { RtfTokenizer } from "../../writerfilter/rtftok/rtftokenizer";
import { createWriterTextFragment } from "../basflt/writer-transfer";
import { RtfExport } from "./rtfexport";

it("round trips table rows and cell paragraph order", /** Checks native RTF row and cell controls against table owners. @returns Nothing. */ () => {
  const source = createWriterDocument();
  const first = source.paragraphs[0];
  if (first === undefined) throw new Error("Missing body paragraph.");
  first.SetText("Before");
  const table = source.nodes.MakeTableNode("Grid", {}, first);
  const row = source.nodes.AppendTableRow(table, 2);
  const rowSize = row.GetFrameSize();
  rowSize.SetHeight(720);
  rowSize.SetHeightSizeType(SwFrameSize.Fixed);
  row.GetFrameFormat().SetFormatAttr(rowSize);
  row.GetFrameFormat().SetFormatAttr(new SwFormatRowSplit(false));
  row.GetTabBoxes()[0]?.GetParagraphs()[0]?.SetText("One");
  const firstBox = row.GetTabBoxes()[0];
  if (firstBox === undefined) throw new Error("Missing table cell.");
  const firstSize = firstBox.GetFrameSize();
  firstSize.SetWidth(1800);
  firstBox.SetFrameSize(firstSize);
  const firstVertical = firstBox.GetVertOrient();
  firstVertical.SetVertOrient(VertOrientation.CENTER);
  firstBox.ClaimFrameFormat().SetFormatAttr(firstVertical);
  const firstBorders = firstBox.GetBox();
  firstBorders.SetLine(
    new SvxBorderLine(new Color(255, 0, 0), 30, BorderLineStyle.SOLID),
    SvxBoxItemLine.TOP,
  );
  firstBorders.SetDistance(120, SvxBoxItemLine.TOP);
  firstBorders.SetDistance(80, SvxBoxItemLine.LEFT);
  firstBox.ClaimFrameFormat().SetFormatAttr(firstBorders);
  source.nodes.AppendTableCellParagraph(firstBox).SetText("More");
  const secondBox = row.GetTabBoxes()[1];
  if (secondBox === undefined) throw new Error("Missing second table cell.");
  const secondSize = secondBox.GetFrameSize();
  secondSize.SetWidth(3000);
  secondBox.SetFrameSize(secondSize);
  const secondVertical = secondBox.GetVertOrient();
  secondVertical.SetVertOrient(VertOrientation.BOTTOM);
  secondBox.ClaimFrameFormat().SetFormatAttr(secondVertical);
  secondBox.GetParagraphs()[0]?.SetText("Two");
  const frame = table.GetFrameFormat();
  const orientation = frame.GetHoriOrient().Clone();
  orientation.SetHoriOrient(HoriOrientation.NONE);
  frame.SetFormatAttr(orientation);
  const margins = frame.GetLRSpace().Clone();
  margins.SetLeft(SvxIndentValue.twips(360));
  frame.SetFormatAttr(margins);
  const tablePadding = frame.GetBox().Clone();
  tablePadding.SetDistance(40, SvxBoxItemLine.TOP);
  tablePadding.SetDistance(60, SvxBoxItemLine.RIGHT);
  frame.SetFormatAttr(tablePadding);
  source.nodes.MakeTextNode("After");
  let imported;
  try {
    const bytes = new RtfExport().ExportDocument(source);
    expect(new TextDecoder().decode(bytes)).toContain(
      "\\trowd\\trql\\trleft360\\ltrrow\\trrh-720\\trkeep",
    );
    expect(new TextDecoder().decode(bytes)).toContain("\\clbrdrt\\brdrs\\brdrw30\\brdrcf6");
    expect(new TextDecoder().decode(bytes)).toContain("\\clpadfl3\\clpadl120\\clpadft3\\clpadt80");
    expect(new TextDecoder().decode(bytes)).toContain("\\trpaddft3\\trpaddt40");
    expect(new TextDecoder().decode(bytes)).toContain("\\trql\\trleft360");
    expect(new TextDecoder().decode(bytes)).toContain(
      "\\clvertalc\\cellx2160\\clvertalb\\cellx5160",
    );
    imported = new RtfDocumentImpl().Resolve(new RtfTokenizer(bytes).Tokenize());
    expect(
      imported.paragraphs.map(
        /** Checks round trips table rows and cell paragraph order. @param node - Node. @returns Test completion or assertion result. */ (
          node,
        ) => node.GetText(),
      ),
    ).toEqual(["Before", "After"]);
    const restored = imported.GetNodes().getBodyContent()[1];
    expect(restored).toBeInstanceOf(SwTableNode);
    if (restored instanceof SwTableNode) {
      expect(restored.GetTable().GetTabLines()[0]?.GetFrameSize().GetHeight()).toBe(720);
      expect(restored.GetTable().GetTabLines()[0]?.GetFrameSize().GetHeightSizeType()).toBe(
        SwFrameSize.Fixed,
      );
      expect(restored.GetTable().GetTabLines()[0]?.GetRowSplit().GetValue()).toBe(false);
      expect(restored.GetTable().GetHoriOrient()).toBe(HoriOrientation.NONE);
      expect(restored.GetTable().GetFrameFormat().GetLRSpace().ResolveLeft()).toBe(360);
      expect(restored.GetTable().GetFrameFormat().GetBox().GetDistance(SvxBoxItemLine.TOP)).toBe(
        40,
      );
      expect(restored.GetTable().GetFrameFormat().GetFrameSize().GetWidth()).toBe(4800);
      expect(
        restored
          .GetTable()
          .GetTabLines()[0]
          ?.GetTabBoxes()
          .map(
            /** Checks round trips table rows and cell paragraph order. @param box - Box. @returns Test completion or assertion result. */ (
              box,
            ) =>
              box
                .GetParagraphs()
                .map(
                  /** Reads each restored native paragraph. @param node - Text node. @returns Canonical text. */ (
                    node,
                  ) => node.GetText(),
                ),
          ),
      ).toEqual([["One", "More"], ["Two"]]);
      expect(
        restored
          .GetTable()
          .GetTabLines()[0]
          ?.GetTabBoxes()
          .map(
            /** Checks round trips table rows and cell paragraph order. @param box - Box. @returns Test completion or assertion result. */ (
              box,
            ) => box.GetFrameSize().GetWidth(),
          ),
      ).toEqual([1800, 3000]);
      expect(
        restored
          .GetTable()
          .GetTabLines()[0]
          ?.GetTabBoxes()
          .map(
            /** Checks round trips table rows and cell paragraph order. @param box - Box. @returns Test completion or assertion result. */ (
              box,
            ) => box.GetVertOrient().GetVertOrient(),
          ),
      ).toEqual([VertOrientation.CENTER, VertOrientation.BOTTOM]);
      const restoredTop = restored.GetTable().GetTabLines()[0]?.GetTabBoxes()[0]?.GetBox().GetTop();
      expect(restoredTop?.GetWidth()).toBe(30);
      expect(restoredTop?.GetBorderLineStyle()).toBe(BorderLineStyle.SOLID);
      expect(restoredTop?.GetColor().GetRed()).toBe(255);
      expect(
        restored
          .GetTable()
          .GetTabLines()[0]
          ?.GetTabBoxes()[0]
          ?.GetBox()
          .GetDistance(SvxBoxItemLine.TOP),
      ).toBe(120);
      expect(
        restored
          .GetTable()
          .GetTabLines()[0]
          ?.GetTabBoxes()[0]
          ?.GetBox()
          .GetDistance(SvxBoxItemLine.LEFT),
      ).toBe(80);
      expect(
        restored
          .GetTable()
          .GetTabLines()[0]
          ?.GetTabBoxes()[1]
          ?.GetBox()
          .GetDistance(SvxBoxItemLine.TOP),
      ).toBe(40);
      expect(
        restored
          .GetTable()
          .GetTabLines()[0]
          ?.GetTabBoxes()[1]
          ?.GetBox()
          .GetDistance(SvxBoxItemLine.RIGHT),
      ).toBe(60);
    }
  } finally {
    imported?.Dispose();
    source.Dispose();
  }
});

it("uses the native table frame and page widths for fixed and relative RTF cell boundaries", /** Checks uses the native table frame and page widths for fixed and relative RTF cell boundaries. @returns Test completion or assertion result. */ () => {
  const document = createWriterDocument();
  const table = document.nodes.MakeTableNode("Uneven", {}, document.paragraphs[0]);
  const row = document.nodes.AppendTableRow(table, 2);
  const frameSize = table.GetFrameFormat().GetFrameSize().Clone();
  frameSize.SetWidth(6000);
  table.GetFrameFormat().SetFormatAttr(frameSize);
  for (const [index, width] of [1800, 3000].entries()) {
    const box = row.GetTabBoxes()[index];
    if (box === undefined) throw new Error("Missing table cell.");
    const size = box.GetFrameSize();
    size.SetWidth(width);
    box.SetFrameSize(size);
  }
  try {
    const relative = new TextDecoder().decode(new RtfExport().ExportDocument(document));
    expect(relative).toMatch(/\\cellx2592\\cellx6912/);
    const orientation = table.GetFrameFormat().GetHoriOrient().Clone();
    orientation.SetHoriOrient(HoriOrientation.LEFT);
    table.GetFrameFormat().SetFormatAttr(orientation);
    const fixed = new TextDecoder().decode(new RtfExport().ExportDocument(document));
    expect(fixed).toMatch(/\\cellx1800\\cellx4800/);
  } finally {
    document.Dispose();
  }
});

it("writes both physical and logical RTF paragraph indents", /** Checks writes both physical and logical RTF paragraph indents. @returns Test completion or assertion result. */ () => {
  const document = createWriterDocument();
  const paragraph = document.paragraphs[0];
  if (paragraph === undefined) throw new Error("Missing paragraph.");
  paragraph.SetText("Indented");
  paragraph.SetParagraphTextLeftMargin(180);
  paragraph.SetParagraphRightMargin(300);
  try {
    const output = new TextDecoder().decode(new RtfExport().ExportDocument(document));
    expect(output).toContain("\\li180\\lin180\\ri300\\rin300");
  } finally {
    document.Dispose();
  }
});

it("round trips native distributed-last-line paragraph alignment through qd", /** Checks round trips native distributed-last-line paragraph alignment through qd. @returns Test completion or assertion result. */ () => {
  const document = createWriterDocument();
  const paragraph = document.paragraphs[0];
  if (paragraph === undefined) throw new Error("Missing paragraph.");
  paragraph.SetText("Distributed");
  const adjust = new SvxAdjustItem(SvxAdjust.Block, RES_PARATR_ADJUST);
  adjust.SetLastBlock(SvxAdjust.Block);
  paragraph.SetAttr(adjust);
  let restored;
  try {
    const bytes = new RtfExport().ExportDocument(document);
    expect(new TextDecoder().decode(bytes)).toContain("\\qd");
    restored = new RtfDocumentImpl().Resolve(new RtfTokenizer(bytes).Tokenize());
    const result = restored.paragraphs[0]?.GetAttr(RES_PARATR_ADJUST) as SvxAdjustItem | undefined;
    expect(result?.GetAdjust()).toBe(SvxAdjust.Block);
    expect(result?.GetLastBlock()).toBe(SvxAdjust.Block);
  } finally {
    restored?.Dispose();
    document.Dispose();
  }
});

it("retains numbered list identity and levels through RTF list tables", /** Checks source-backed list and override controls. @returns Nothing. */ () => {
  const source = createWriterDocument();
  const first = source.paragraphs[0];
  if (first === undefined) throw new Error("Missing paragraph.");
  first.SetText("One");
  const second = source.nodes.MakeTextNode("Two");
  applyWriterParagraphList(first, { kind: "numbered", level: 0 });
  applyWriterParagraphList(second, { kind: "numbered", level: 1 });
  let imported;
  try {
    const bytes = new RtfExport().ExportDocument(source);
    expect(new TextDecoder().decode(bytes)).toContain("{\\listtext\\pard\\plain ");
    imported = new RtfDocumentImpl().Resolve(new RtfTokenizer(bytes).Tokenize());
    expect(
      imported.paragraphs.map(
        /** Checks retains numbered list identity and levels through RTF list tables. @param node - Node. @returns Test completion or assertion result. */ (
          node,
        ) => [node.GetText(), node.GetListKind(), node.GetAttrListLevel()],
      ),
    ).toEqual([
      ["One", "numbered", 0],
      ["Two", "numbered", 1],
    ]);
    expect(imported.paragraphs[0]?.GetListId()).toBe(imported.paragraphs[1]?.GetListId());
  } finally {
    imported?.Dispose();
    source.Dispose();
  }
});

it("omits RTF list controls for a native uncounted paragraph", /** Checks omits RTF list controls for a native uncounted paragraph. @returns Test completion or assertion result. */ () => {
  const source = createWriterDocument();
  const first = source.paragraphs[0];
  if (first === undefined) throw new Error("Missing paragraph.");
  first.SetText("Counted");
  const uncounted = source.nodes.MakeTextNode("Uncounted");
  applyWriterParagraphList(first, { kind: "numbered", level: 0, listId: "Numbers" });
  applyWriterParagraphList(uncounted, { kind: "numbered", level: 0, listId: "Numbers" });
  uncounted.SetCountedInList(false);
  let imported;
  try {
    const bytes = new RtfExport().ExportDocument(source);
    const body = new TextDecoder().decode(bytes).split("\\par\n");
    expect(body[0]).toContain("\\listtext");
    expect(body[1]).not.toContain("\\listtext");
    expect(body[1]).not.toContain("\\ls");
    imported = new RtfDocumentImpl().Resolve(new RtfTokenizer(bytes).Tokenize());
    expect(
      imported.paragraphs.map(
        /** Checks omits RTF list controls for a native uncounted paragraph. @param node - Node. @returns Test completion or assertion result. */ (
          node,
        ) => node.GetText(),
      ),
    ).toEqual(["Counted", "Uncounted"]);
    expect(imported.paragraphs[1]?.GetNumRule()).toBeUndefined();
  } finally {
    imported?.Dispose();
    source.Dispose();
  }
});

it("retains the pinned RTF original-rule reference on a restarted paragraph", /** Checks retains the pinned RTF original-rule reference on a restarted paragraph. @returns Test completion or assertion result. */ () => {
  const source = createWriterDocument();
  const first = source.paragraphs[0];
  if (first === undefined) throw new Error("Missing paragraph.");
  first.SetText("First");
  const restarted = source.nodes.MakeTextNode("Restarted");
  applyWriterParagraphList(first, { kind: "numbered", level: 0, listId: "Numbers" });
  applyWriterParagraphList(restarted, { kind: "numbered", level: 0, listId: "Numbers" });
  restarted.SetListRestart(true);
  restarted.SetAttrListRestartValue(9);
  let imported;
  try {
    const bytes = new RtfExport().ExportDocument(source);
    const body = new TextDecoder().decode(bytes).split("\\par\n");
    expect(body[1]).toContain("\\ls1");
    expect(body[1]).toContain("\\listtext");
    imported = new RtfDocumentImpl().Resolve(new RtfTokenizer(bytes).Tokenize());
    expect(imported.paragraphs[1]?.IsListRestart()).toBe(false);
    expect(imported.paragraphs[1]?.GetNumRule()?.Get(0).GetStart()).toBe(1);
  } finally {
    imported?.Dispose();
    source.Dispose();
  }
});

it("retains represented level starts and bullet glyphs in RTF list definitions", /** Checks retains represented level starts and bullet glyphs in RTF list definitions. @returns Test completion or assertion result. */ () => {
  const source = createWriterDocument();
  const first = source.paragraphs[0];
  if (first === undefined) throw new Error("Missing paragraph.");
  first.SetText("First");
  applyWriterParagraphList(first, { kind: "bullet", level: 0, listId: "Bullets" });
  const nested = source.nodes.MakeTextNode("Nested");
  applyWriterParagraphList(nested, { kind: "bullet", level: 1, listId: "Bullets" });
  const rule = nested.GetNumRule();
  if (rule === undefined) throw new Error("Missing rule.");
  const format = new SwNumFormat(rule.Get(1));
  format.SetBulletChar(0x25aa);
  format.SetStart(7);
  rule.Set(1, format);
  source.GetDocumentListsManager().InvalidateAllLists();
  let imported;
  try {
    const bytes = new RtfExport().ExportDocument(source);
    const encoded = new TextDecoder().decode(bytes);
    expect(encoded).toContain("\\levelstartat7");
    expect(encoded).toContain("\\u9642 ?");
    expect(encoded).toContain("\\u9642\\'3f");
    imported = new RtfDocumentImpl().Resolve(new RtfTokenizer(bytes).Tokenize());
    expect(imported.paragraphs[1]?.GetNumRule()?.Get(1).GetStart()).toBe(7);
    expect(imported.paragraphs[1]?.GetNumRule()?.Get(1).GetBulletChar()).toBe(0x25aa);
  } finally {
    imported?.Dispose();
    source.Dispose();
  }
});

it.each([
  [SvxNumType.SVX_NUM_ROMAN_UPPER, 1],
  [SvxNumType.SVX_NUM_HANGUL_SYLLABLE_KO, 24],
  [NumberingType.NUMBER_DIGITAL_KO as SvxNumType, 41],
] as const)(
  "retains a numbered rule starting above one with type %i",
  /** Checks retains a numbered rule starting above one with type %i. @param numberingType - Numbering Type. @param nfc - Nfc. @returns Test completion or assertion result. */ (
    numberingType,
    nfc,
  ) => {
    const source = createWriterDocument();
    const first = source.paragraphs[0];
    if (first === undefined) throw new Error("Missing paragraph.");
    first.SetText("Seven");
    applyWriterParagraphList(first, { kind: "numbered", level: 0, listId: "Numbers" });
    const rule = first.GetNumRule();
    if (rule === undefined) throw new Error("Missing rule.");
    const format = new SwNumFormat(rule.Get(0));
    format.SetStart(7);
    format.SetNumberingType(numberingType);
    rule.Set(0, format);
    source.GetDocumentListsManager().InvalidateAllLists();
    let imported;
    try {
      const bytes = new RtfExport().ExportDocument(source);
      expect(new TextDecoder().decode(bytes)).toContain(`\\levelnfc${nfc}\\levelstartat7`);
      imported = new RtfDocumentImpl().Resolve(new RtfTokenizer(bytes).Tokenize());
      expect(imported.paragraphs[0]?.GetNumRule()?.Get(0).GetStart()).toBe(7);
      expect(imported.paragraphs[0]?.GetNumRule()?.Get(0).GetNumberingType()).toBe(numberingType);
      expect(imported.paragraphs[0]?.GetListItemNumber()).toBe(7);
    } finally {
      imported?.Dispose();
      source.Dispose();
    }
  },
);

it("round trips native decoration, hyperlink and first-line paragraph items", /** Checks source RTF controls through writer and mapper. @returns Nothing. */ () => {
  const source = createWriterDocument();
  const node = source.paragraphs[0];
  if (node === undefined) throw new Error("Missing paragraph.");
  const plain = { bold: false, italic: false, underline: false };
  const runs = [
    { text: "Start ", attributes: plain },
    { text: "struck", attributes: { ...plain, strikeout: FontStrikeout.STRIKEOUT_DOUBLE } },
    {
      text: " raised ",
      attributes: { ...plain, escapement: { offset: DFLT_ESC_SUPER, height: DFLT_ESC_PROP } },
    },
    {
      text: "lift ",
      attributes: { ...plain, fontSizeTwips: 400, escapement: { offset: 25, height: 70 } },
    },
    {
      text: "auto ",
      attributes: { ...plain, escapement: { offset: DFLT_ESC_AUTO_SUPER, height: 71 } },
    },
    { text: "link", attributes: plain, hyperlink: { url: "https://example.test" } },
  ];
  node.SetText(
    runs
      .map(
        /** Checks round trips native decoration, hyperlink and first-line paragraph items. @param run - Run. @returns Test completion or assertion result. */ (
          run,
        ) => run.text,
      )
      .join(""),
  );
  const hints = new SwpHints(source.GetAttrPool());
  hints.setTextRuns(runs, node.GetSwAttrSet());
  node.SetTextHints(hints);
  node.SetParagraphFirstLineIndent(-180);
  let imported;
  try {
    const bytes = new RtfExport().ExportDocument(source);
    imported = new RtfDocumentImpl().Resolve(new RtfTokenizer(bytes).Tokenize());
    const restored = imported.paragraphs[0];
    expect(restored?.GetParagraphFirstLineIndent()).toBe(-180);
    expect(restored?.GetText()).toBe("Start struck raised lift auto link");
    const projected = projectWriterTextRuns(restored);
    expect(
      projected.find(
        /** Checks round trips native decoration, hyperlink and first-line paragraph items. @param run - Run. @returns Test completion or assertion result. */ (
          run,
        ) => run.text === "struck",
      )?.attributes.strikeout,
    ).toBe(FontStrikeout.STRIKEOUT_DOUBLE);
    expect(
      projected.find(
        /** Checks round trips native decoration, hyperlink and first-line paragraph items. @param run - Run. @returns Test completion or assertion result. */ (
          run,
        ) => run.text === " raised ",
      )?.attributes.escapement,
    ).toEqual({
      offset: DFLT_ESC_SUPER,
      height: DFLT_ESC_PROP,
    });
    expect(
      projected.find(
        /** Checks round trips native decoration, hyperlink and first-line paragraph items. @param run - Run. @returns Test completion or assertion result. */ (
          run,
        ) => run.text === "lift ",
      )?.attributes.escapement,
    ).toEqual({
      offset: 25,
      height: 70,
    });
    expect(
      projected.find(
        /** Checks round trips native decoration, hyperlink and first-line paragraph items. @param run - Run. @returns Test completion or assertion result. */ (
          run,
        ) => run.text === "auto ",
      )?.attributes.escapement,
    ).toEqual({
      offset: DFLT_ESC_AUTO_SUPER,
      height: 71,
    });
    expect(
      projected.find(
        /** Checks https://example.test. @param run - Run. @returns Test completion or assertion result. */ (
          run,
        ) => run.text === "link",
      )?.hyperlink?.url,
    ).toBe("https://example.test");
  } finally {
    imported?.Dispose();
    source.Dispose();
  }
});

it("exports source-escaped hyperlink URLs and target frames through native RTF fields", /** Checks exports source-escaped hyperlink URLs and target frames through native RTF fields. @returns Test completion or assertion result. */ () => {
  const source = createWriterDocument();
  const node = source.paragraphs[0];
  if (node === undefined) throw new Error("Missing paragraph.");
  const url = "https://example.test/a\\b";
  const runs = [
    {
      text: "link",
      attributes: { bold: false, italic: false, underline: false },
      hyperlink: { url, targetFrame: "New Window", name: "Omitted by source exporter" },
    },
  ];
  const fragment = createWriterTextFragment(node, runs);
  node.SetText(fragment.text);
  node.SetTextHints(fragment.hints);
  let imported;
  try {
    const bytes = new RtfExport().ExportDocument(source);
    const rtf = new TextDecoder().decode(bytes);
    expect(rtf).toContain(String.raw`HYPERLINK "https://example.test/a\\\\b" \\t "New Window"`);
    expect(rtf).not.toContain(String.raw`\\o "Omitted by source exporter"`);
    imported = new RtfDocumentImpl().Resolve(new RtfTokenizer(bytes).Tokenize());
    expect(projectWriterTextRuns(imported.paragraphs[0])[0]?.hyperlink).toEqual({
      url,
      targetFrame: "New Window",
    });
  } finally {
    imported?.Dispose();
    source.Dispose();
  }
});

it("keeps one native RTF hyperlink field across differently formatted text runs", /** Checks keeps one native RTF hyperlink field across differently formatted text runs. @returns Test completion or assertion result. */ () => {
  const source = createWriterDocument();
  const node = source.paragraphs[0];
  if (node === undefined) throw new Error("Missing paragraph.");
  const hyperlink = { url: "https://example.test", targetFrame: "_blank" };
  const fragment = createWriterTextFragment(node, [
    { text: "plain ", hyperlink, attributes: { bold: false, italic: false, underline: false } },
    { text: "bold", hyperlink, attributes: { bold: true, italic: false, underline: false } },
  ]);
  node.SetText(fragment.text);
  node.SetTextHints(fragment.hints);
  let imported;
  try {
    const bytes = new RtfExport().ExportDocument(source);
    expect(new TextDecoder().decode(bytes).match(/\\field\b/gu)).toHaveLength(1);
    imported = new RtfDocumentImpl().Resolve(new RtfTokenizer(bytes).Tokenize());
    const runs = projectWriterTextRuns(imported.paragraphs[0]);
    expect(
      runs.map(
        /** Checks keeps one native RTF hyperlink field across differently formatted text runs. @param run - Run. @returns Test completion or assertion result. */ (
          run,
        ) => [run.text, run.hyperlink, run.attributes.bold],
      ),
    ).toEqual([
      ["plain ", hyperlink, false],
      ["bold", hyperlink, true],
    ]);
  } finally {
    imported?.Dispose();
    source.Dispose();
  }
});

it("retains upstream default-height escapement suppression", /** Checks the source branch that emits only conventional super/sub positions at height 58. @returns Nothing. */ () => {
  const source = createWriterDocument();
  const node = source.paragraphs[0];
  if (node === undefined) throw new Error("Missing paragraph.");
  const runs = [
    {
      text: "custom",
      attributes: {
        bold: false,
        italic: false,
        underline: false,
        escapement: { offset: 25, height: DFLT_ESC_PROP },
      },
    },
  ];
  node.SetText("custom");
  const hints = new SwpHints(source.GetAttrPool());
  hints.setTextRuns(runs, node.GetSwAttrSet());
  node.SetTextHints(hints);
  try {
    const rtf = new TextDecoder().decode(new RtfExport().ExportDocument(source));
    expect(rtf).not.toContain("\\up");
    expect(rtf).not.toContain("\\super");
  } finally {
    source.Dispose();
  }
});

it("exports the authored first-line item without layout short narrowing", /** Checks source FormatFirstLineIndent reads the item value. @returns Nothing. */ () => {
  const source = createWriterDocument();
  const node = source.paragraphs[0];
  if (node === undefined) throw new Error("Missing paragraph.");
  node.SetText("Wide");
  node.SetParagraphFirstLineIndent(40000);
  let imported;
  try {
    const bytes = new RtfExport().ExportDocument(source);
    expect(new TextDecoder().decode(bytes)).toContain("\\fi40000");
    imported = new RtfDocumentImpl().Resolve(new RtfTokenizer(bytes).Tokenize());
    expect(
      (
        imported.paragraphs[0]?.GetAttr(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem
      ).ResolveTextFirstLineOffset(),
    ).toBe(40000);
  } finally {
    imported?.Dispose();
    source.Dispose();
  }
});
