/** @fileoverview RTF writer round trips through the represented native reader and Writer hints. */
import { expect, it } from "vitest";
import { SvxAdjustItem } from "../../../../editeng/inc/adjustitem";
import { SvxAdjust } from "../../../../editeng/inc/svxenum";
import { SvxTabAdjust, SvxTabStop, SvxTabStopItem } from "../../../../editeng/inc/tstpitem";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { SvxUnderlineItem } from "../../../../editeng/source/items/textitem";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";
import { Color } from "../../../../tools/inc/color";
import { FontLineStyle } from "../../../../tools/inc/fontenum";
import {
  RES_BREAK,
  RES_CHRATR_UNDERLINE,
  RES_KEEP,
  RES_PARATR_ADJUST,
  RES_PARATR_SPLIT,
  RES_PARATR_TABSTOP,
  RES_PARATR_WIDOWS,
  RES_UL_SPACE,
} from "../../../inc/hintids";
import { createWriterHighlightItem, createWriterTextColorItem } from "../../core/attr/swatrset";
import { createWriterDocument } from "../../core/doc/doc";
import { SwpHints } from "../../core/txtnode/ndhints";
import { projectWriterTextRuns } from "../../core/txtnode/ndtxt";
import { RtfDocumentImpl } from "../../writerfilter/rtftok/rtfdocumentimpl";
import { RtfTokenizer } from "../../writerfilter/rtftok/rtftokenizer";
import { createWriterTextFragment } from "../basflt/writer-transfer";
import { RtfAttributeOutput } from "./rtfattributeoutput";
import { RtfExport } from "./rtfexport";

it("writes source highlight palette indices independent of document color indices", /** Checks writes source highlight palette indices independent of document color indices. @returns Test completion or assertion result. */ () => {
  const output = new RtfAttributeOutput(
    /** Checks writes source highlight palette indices independent of document color indices. @returns Test completion or assertion result. */ () =>
      0,
    /** Checks writes source highlight palette indices independent of document color indices. @returns Test completion or assertion result. */ () =>
      23,
    createRtfExport(),
  );
  const plain = { bold: false, italic: false, underline: false };
  expect(output.WriteCharacter({ ...plain, highlight: "#6666ff" })).toContain("\\highlight2");
  expect(output.WriteCharacter({ ...plain, highlight: "#ffcc00" })).toContain("\\highlight7");
  expect(output.WriteCharacter({ ...plain, highlight: "rgba(102, 102, 255, 0.5)" })).toContain(
    "\\highlight2",
  );
  expect(output.WriteCharacter({ ...plain, highlight: "transparent", color: "auto" })).toBe(
    "\\cf0\\highlight0",
  );
});

it("quantizes a native highlight through the fixed RTF palette on export and import", /** Checks quantizes a native highlight through the fixed RTF palette on export and import. @returns Test completion or assertion result. */ () => {
  const source = createWriterDocument();
  const paragraph = source.paragraphs[0];
  if (paragraph === undefined) throw new Error("Missing paragraph.");
  const attributes = { bold: false, italic: false, underline: false, highlight: "#6666ff" };
  paragraph.SetText("highlight");
  const hints = new SwpHints(source.GetAttrPool());
  hints.setTextRuns([{ text: "highlight", attributes }], paragraph.GetSwAttrSet());
  paragraph.SetTextHints(hints);
  let imported;
  try {
    const bytes = RtfExport.WriteDocument(source);
    expect(new TextDecoder().decode(bytes)).toContain("\\highlight2");
    imported = new RtfDocumentImpl().Resolve(new RtfTokenizer(bytes).Tokenize());
    expect(projectWriterTextRuns(imported.paragraphs[0]).at(0)?.attributes.highlight).toBe(
      "#0000ff",
    );
  } finally {
    imported?.Dispose();
    source.Dispose();
  }
});

it("exports native alpha colors through RTF RGB channels and highlight palette", /** Checks exports native alpha colors through RTF RGB channels and highlight palette. @returns Test completion or assertion result. */ () => {
  const source = createWriterDocument();
  const paragraph = source.paragraphs[0];
  if (paragraph === undefined) throw new Error("Missing paragraph.");
  paragraph.SetText("alpha");
  paragraph.SetAttr(createWriterTextColorItem(0x80123456));
  paragraph.SetAttr(createWriterHighlightItem(0x806666ff));
  let imported;
  try {
    const bytes = RtfExport.WriteDocument(source);
    const rtf = new TextDecoder().decode(bytes);
    expect(rtf).toContain("\\red18\\green52\\blue86;");
    expect(rtf).toContain("\\highlight2");
    imported = new RtfDocumentImpl().Resolve(new RtfTokenizer(bytes).Tokenize());
    expect(projectWriterTextRuns(imported.paragraphs[0]).at(0)?.attributes).toMatchObject({
      color: "#123456",
      highlight: "#0000ff",
    });
  } finally {
    imported?.Dispose();
    source.Dispose();
  }
});

it("writes native underline line styles with the pinned RTF controls", /** Checks source control mapping and round-trip item state. @returns Nothing. */ () => {
  const cases: readonly [FontLineStyle, string][] = [
    [FontLineStyle.LINESTYLE_SINGLE, "ul"],
    [FontLineStyle.LINESTYLE_DOUBLE, "uldb"],
    [FontLineStyle.LINESTYLE_DOTTED, "uld"],
    [FontLineStyle.LINESTYLE_DASH, "uldash"],
    [FontLineStyle.LINESTYLE_DASHDOT, "uldashd"],
    [FontLineStyle.LINESTYLE_DASHDOTDOT, "uldashdd"],
    [FontLineStyle.LINESTYLE_BOLD, "ulth"],
    [FontLineStyle.LINESTYLE_WAVE, "ulwave"],
    [FontLineStyle.LINESTYLE_BOLDDOTTED, "ulthd"],
    [FontLineStyle.LINESTYLE_BOLDDASH, "ulthdash"],
    [FontLineStyle.LINESTYLE_LONGDASH, "ulldash"],
    [FontLineStyle.LINESTYLE_BOLDLONGDASH, "ulthldash"],
    [FontLineStyle.LINESTYLE_BOLDDASHDOT, "ulthdashd"],
    [FontLineStyle.LINESTYLE_BOLDDASHDOTDOT, "ulthdashdd"],
    [FontLineStyle.LINESTYLE_BOLDWAVE, "ulhwave"],
    [FontLineStyle.LINESTYLE_DOUBLEWAVE, "ululdbwave"],
  ];
  for (const [style, control] of cases) {
    const document = createWriterDocument();
    try {
      const paragraph = document.paragraphs[0];
      if (paragraph === undefined) throw new Error("Missing paragraph.");
      const fragment = createWriterTextFragment(paragraph, [
        {
          text: "underlined",
          attributes: { bold: false, italic: false, underline: true, underlineStyle: style },
        },
      ]);
      paragraph.SetText(fragment.text);
      paragraph.SetTextHints(fragment.hints);
      const rtf = new TextDecoder().decode(RtfExport.WriteDocument(document));
      expect(rtf).toContain(
        ["ul", "uldb", "uld", "ulnone"].includes(control)
          ? `\\ulc0\\${control} `
          : `\\${control}\\ulc0 `,
      );
      const imported = new RtfDocumentImpl().ResolveBytes(new TextEncoder().encode(rtf));
      try {
        const importedParagraph = imported.paragraphs[0];
        if (importedParagraph === undefined) throw new Error("Missing imported paragraph.");
        expect(
          projectWriterTextRuns(importedParagraph)[0]?.attributes.underlineStyle ??
            FontLineStyle.LINESTYLE_SINGLE,
        ).toBe(style);
      } finally {
        imported.Dispose();
      }
    } finally {
      document.Dispose();
    }
  }
});

it("round trips native word-only underline through RTF ulw", /** Checks the source word-line item across RTF export and import. @returns Nothing. */ () => {
  const document = createWriterDocument();
  try {
    const paragraph = document.paragraphs[0];
    if (paragraph === undefined) throw new Error("Missing paragraph.");
    const fragment = createWriterTextFragment(paragraph, [
      {
        text: "word only",
        attributes: {
          bold: false,
          italic: false,
          underline: true,
          underlineStyle: FontLineStyle.LINESTYLE_SINGLE,
          underlineWordMode: true,
        },
      },
    ]);
    expect(fragment.hints.Count()).toBeGreaterThan(0);
    expect(
      fragment.hints.toTextRuns(fragment.text, paragraph.GetSwAttrSet())[0]?.attributes
        .underlineWordMode,
    ).toBe(true);
    paragraph.SetText(fragment.text);
    paragraph.SetTextHints(fragment.hints);
    expect(projectWriterTextRuns(paragraph)[0]?.attributes.underlineWordMode).toBe(true);
    const rtf = new TextDecoder().decode(RtfExport.WriteDocument(document));
    expect(rtf).toContain("\\ulc0\\ulw ");
    const imported = new RtfDocumentImpl().ResolveBytes(new TextEncoder().encode(rtf));
    try {
      const importedParagraph = imported.paragraphs[0];
      if (importedParagraph === undefined) throw new Error("Missing imported paragraph.");
      expect(projectWriterTextRuns(importedParagraph)[0]?.attributes.underlineWordMode).toBe(true);
    } finally {
      imported.Dispose();
    }
  } finally {
    document.Dispose();
  }
});

it("round trips an explicit native underline color through the RTF color table", /** Checks the source ulc index and independent line color. @returns Nothing. */ () => {
  const document = createWriterDocument();
  try {
    const paragraph = document.paragraphs[0];
    if (paragraph === undefined) throw new Error("Missing paragraph.");
    const fragment = createWriterTextFragment(paragraph, [
      {
        text: "colored",
        attributes: {
          bold: false,
          italic: false,
          underline: true,
          underlineStyle: FontLineStyle.LINESTYLE_DOUBLE,
          underlineColor: "#332211",
        },
      },
    ]);
    paragraph.SetText(fragment.text);
    paragraph.SetTextHints(fragment.hints);
    const rtf = new TextDecoder().decode(RtfExport.WriteDocument(document));
    expect(rtf).toContain("\\red51\\green34\\blue17;");
    expect(rtf).toContain("{\\colortbl;\\red0\\green0\\blue0;\\red0\\green0\\blue255;");
    expect(rtf).toContain("\\ulc17\\uldb colored");
    const imported = new RtfDocumentImpl().ResolveBytes(new TextEncoder().encode(rtf));
    try {
      const importedParagraph = imported.paragraphs[0];
      if (importedParagraph === undefined) throw new Error("Missing imported paragraph.");
      expect(projectWriterTextRuns(importedParagraph)[0]?.attributes).toMatchObject({
        underlineStyle: FontLineStyle.LINESTYLE_DOUBLE,
        underlineColor: "#332211",
      });
    } finally {
      imported.Dispose();
    }
  } finally {
    document.Dispose();
  }
});

it("exports a colored paragraph underline item without a browser run override", /** Checks the ODT/core item route into the same RTF color-table writer. @returns Nothing. */ () => {
  const document = createWriterDocument();
  try {
    const paragraph = document.paragraphs[0];
    if (paragraph === undefined) throw new Error("Missing paragraph.");
    paragraph.SetText("Native");
    const underline = new SvxUnderlineItem(FontLineStyle.LINESTYLE_WAVE, RES_CHRATR_UNDERLINE);
    underline.SetColor(new Color(0x123456));
    paragraph.SetAttr(underline);
    const rtf = new TextDecoder().decode(RtfExport.WriteDocument(document));
    expect(rtf).toContain("\\ulwave\\ulc17 Native");
    expect(rtf).toContain("\\red18\\green52\\blue86;");
  } finally {
    document.Dispose();
  }
});

it("round trips text, Unicode, alignment and direct character runs", /** Checks native graph values after writer and tokenizer. @returns Nothing. */ () => {
  const source = createWriterDocument();
  const paragraph = source.paragraphs[0];
  if (paragraph === undefined) throw new Error("Missing paragraph.");
  const fragment = createWriterTextFragment(paragraph, [
    { text: "Plain ", attributes: { bold: false, italic: false, underline: false } },
    {
      text: "Ж",
      attributes: {
        bold: true,
        italic: false,
        underline: false,
        fontFamily: "Arial",
        color: "#ff0000",
      },
    },
  ]);
  paragraph.SetText(fragment.text);
  paragraph.SetTextHints(fragment.hints);
  paragraph.SetParagraphAlignment("center");
  let imported;
  try {
    const bytes = RtfExport.WriteDocument(source);
    imported = new RtfDocumentImpl().Resolve(new RtfTokenizer(bytes).Tokenize());
    expect(imported.paragraphs[0]?.GetText()).toBe("Plain Ж");
    expect(imported.paragraphs[0]?.GetParagraphAlignment()).toBe("center");
    expect(projectWriterTextRuns(imported.paragraphs[0])?.at(-1)?.attributes).toMatchObject({
      bold: true,
      color: "#ff0000",
      fontFamily: "Arial",
    });
  } finally {
    imported?.Dispose();
    source.Dispose();
  }
});

it("keeps the source RTF table-header export omission for represented repeat rows", /** Checks keeps the source RTF table-header export omission for represented repeat rows. @returns Test completion or assertion result. */ () => {
  const document = createWriterDocument();
  try {
    const first = document.paragraphs[0];
    if (first === undefined) throw new Error("Missing paragraph.");
    const table = document.nodes.InsertTable(first, "Header Table", {});
    for (let index = 0; index < 2; index++) {
      const line = document.nodes.AppendTableRow(table, 1);
      line.GetTabBoxes()[0]?.GetParagraphs()[0]?.SetText(`Row ${index}`);
    }
    table.SetRowsToRepeat(1);
    const rtf = new TextDecoder().decode(RtfExport.WriteDocument(document));
    expect(rtf).toContain("\\trowd");
    expect(rtf).not.toContain("\\trhdr");
  } finally {
    document.Dispose();
  }
});

it("round trips represented paragraph styles through the RTF stylesheet", /** Checks round trips represented paragraph styles through the RTF stylesheet. @returns Test completion or assertion result. */ () => {
  const source = createWriterDocument();
  const heading = source.paragraphs[0];
  if (heading === undefined) throw new Error("Missing paragraph.");
  heading.SetText("Heading");
  heading.ChgFormatColl(source.GetTextFormatColl("heading-2"));
  const quote = source.nodes.MakeTextNode("Quote");
  quote.ChgFormatColl(source.GetTextFormatColl("quotations"));
  let imported;
  try {
    const bytes = RtfExport.WriteDocument(source);
    const encoded = new TextDecoder().decode(bytes);
    expect(encoded).toContain("\\stylesheet");
    expect(encoded).toMatch(/\{\\s2[^}]*\\b[^}]*heading 2;/u);
    imported = new RtfDocumentImpl().Resolve(new RtfTokenizer(bytes).Tokenize());
    expect(
      imported.paragraphs.map(
        /** Checks round trips represented paragraph styles through the RTF stylesheet. @param node - Node. @returns Test completion or assertion result. */ (
          node,
        ) => node.GetParagraphStyle(),
      ),
    ).toEqual(["heading-2", "quotations"]);
  } finally {
    imported?.Dispose();
    source.Dispose();
  }
});

it("retains native backward parent and unresolved forward follow links through reserved slots", /** Source follow names are captured before the later style is declared (WRITER206). @returns Test completion or assertion result. */ () => {
  const source = createWriterDocument();
  source
    .GetDfltTextFormatColl()
    .SetFormatAttr(new SvxAdjustItem(SvxAdjust.Center, RES_PARATR_ADJUST));
  const parent = source.MakeTextFormatColl("Parent", source.GetDfltTextFormatColl());
  const child = source.MakeTextFormatColl("Child", parent);
  const follow = source.MakeTextFormatColl("Follow", source.GetDfltTextFormatColl());
  child.SetNextTextFormatColl(follow);
  source.paragraphs[0]?.ChgFormatColl(child);
  let restored;
  try {
    const encoded = new TextDecoder().decode(RtfExport.WriteDocument(source));
    expect(encoded).toMatch(/\{\\s0\\snext0\\qc[^}]* Normal;/u);
    expect(encoded).toMatch(/\{\\s16\\sbasedon15\\snext17[^}]* Child;/u);
    expect(encoded).toMatch(/\{\\s17\\sbasedon0\\snext17[^}]* Follow;/u);
    restored = new RtfDocumentImpl().Resolve(
      new RtfTokenizer(new TextEncoder().encode(encoded)).Tokenize(),
    );
    const restoredChild = restored.FindTextFormatCollByName("Child");
    expect(restoredChild?.DerivedFrom()?.GetName()).toBe("Parent");
    expect(restoredChild?.GetNextTextFormatColl()).toBe(restoredChild);
    expect(restored.paragraphs[0]?.GetTextFormatColl()).toBe(restoredChild);
    expect(
      (
        restored.GetDfltTextFormatColl().GetAttrSet().Get(RES_PARATR_ADJUST) as SvxAdjustItem
      ).GetAdjust(),
    ).toBe(SvxAdjust.Center);
  } finally {
    restored?.Dispose();
    source.Dispose();
  }
});

it("preserves Word builtin style names and gives them priority over custom name collisions", /** Checks preserves Word builtin style names and gives them priority over custom name collisions. @returns Test completion or assertion result. */ () => {
  const source = createWriterDocument();
  const custom = source.MakeTextFormatColl("Body Text", source.GetDfltTextFormatColl());
  const builtin = source.GetTextFormatColl("text-body");
  source.MakeTextFormatColl("Alias (WW)", source.GetDfltTextFormatColl());
  source.paragraphs[0]?.ChgFormatColl(custom);
  source.nodes.MakeTextNode("Builtin").ChgFormatColl(builtin);
  let restored;
  try {
    const bytes = RtfExport.WriteDocument(source);
    const encoded = new TextDecoder().decode(bytes);
    expect(encoded).toContain(" Body Text1;");
    expect(encoded).toContain(" Body Text;");
    expect(encoded).toContain(" Alias;");
    restored = new RtfDocumentImpl().Resolve(new RtfTokenizer(bytes).Tokenize());
    expect(restored.paragraphs[0]?.GetTextFormatColl().GetName()).toBe("Body Text1");
    expect(restored.paragraphs[1]?.GetTextFormatColl()).toBe(
      restored.GetTextFormatColl("text-body"),
    );
  } finally {
    restored?.Dispose();
    source.Dispose();
  }
});

it("round trips native paragraph spacing, keep, split and widow controls", /** Checks round trips native paragraph spacing, keep, split and widow controls. @returns Test completion or assertion result. */ () => {
  const source = createWriterDocument();
  const paragraph = source.paragraphs[0];
  if (paragraph === undefined) throw new Error("Missing paragraph.");
  paragraph.SetText("Together");
  paragraph.SetAttr(new SvxULSpaceItem(120, 240, RES_UL_SPACE, true));
  paragraph.SetAttr(new SfxBoolItem(RES_KEEP, true));
  paragraph.SetAttr(new SfxBoolItem(RES_PARATR_SPLIT, false));
  paragraph.SetAttr(new SfxInt16Item(RES_PARATR_WIDOWS, 0));
  let imported;
  try {
    const bytes = RtfExport.WriteDocument(source);
    const encoded = new TextDecoder().decode(bytes);
    expect(encoded).toContain("\\sb120\\sa240\\contextualspace");
    expect(encoded).toContain("\\keep\\nowidctlpar");
    expect(encoded).toContain("\\keepn");
    imported = new RtfDocumentImpl().Resolve(new RtfTokenizer(bytes).Tokenize());
    const result = imported.paragraphs[0];
    expect((result?.GetAttr(RES_UL_SPACE) as SvxULSpaceItem).GetUpper()).toBe(120);
    expect((result?.GetAttr(RES_UL_SPACE) as SvxULSpaceItem).GetLower()).toBe(240);
    expect((result?.GetAttr(RES_UL_SPACE) as SvxULSpaceItem).GetContext()).toBe(true);
    expect((result?.GetAttr(RES_KEEP) as SfxBoolItem).GetValue()).toBe(true);
    expect((result?.GetAttr(RES_PARATR_SPLIT) as SfxBoolItem).GetValue()).toBe(false);
    expect((result?.GetAttr(RES_PARATR_WIDOWS) as SfxInt16Item).GetValue()).toBe(0);
  } finally {
    imported?.Dispose();
    source.Dispose();
  }
});

it("retains native spacing and keep properties on a named RTF paragraph style", /** Checks retains native spacing and keep properties on a named RTF paragraph style. @returns Test completion or assertion result. */ () => {
  const source = createWriterDocument();
  const style = source.GetTextFormatColl("heading-2");
  style.SetFormatAttr(new SvxULSpaceItem(80, 160, RES_UL_SPACE, true));
  style.SetFormatAttr(new SfxBoolItem(RES_KEEP, true));
  const paragraph = source.paragraphs[0];
  if (paragraph === undefined) throw new Error("Missing paragraph.");
  paragraph.SetText("Styled");
  paragraph.ChgFormatColl(style);
  let imported;
  try {
    const bytes = RtfExport.WriteDocument(source);
    imported = new RtfDocumentImpl().Resolve(new RtfTokenizer(bytes).Tokenize());
    const result = imported.paragraphs[0];
    expect(result?.GetParagraphStyle()).toBe("heading-2");
    expect((result?.GetAttr(RES_UL_SPACE) as SvxULSpaceItem).GetUpper()).toBe(80);
    expect((result?.GetAttr(RES_UL_SPACE) as SvxULSpaceItem).GetLower()).toBe(160);
    expect((result?.GetAttr(RES_UL_SPACE) as SvxULSpaceItem).GetContext()).toBe(true);
    expect((result?.GetAttr(RES_KEEP) as SfxBoolItem).GetValue()).toBe(true);
  } finally {
    imported?.Dispose();
    source.Dispose();
  }
});

it("exports native relative tab stops as Word absolute positions with alignment and leaders", /** Checks exports native relative tab stops as Word absolute positions with alignment and leaders. @returns Test completion or assertion result. */ () => {
  const source = createWriterDocument();
  const paragraph = source.paragraphs[0];
  if (paragraph === undefined) throw new Error("Missing paragraph.");
  paragraph.SetText("Tabs");
  paragraph.SetParagraphTextLeftMargin(360);
  const tabs = new SvxTabStopItem(0, 0, SvxTabAdjust.Default, RES_PARATR_TABSTOP);
  tabs.Insert(new SvxTabStop(720, SvxTabAdjust.Right, "\0", "."));
  tabs.Insert(new SvxTabStop(1440, SvxTabAdjust.Decimal, "\0", "_"));
  paragraph.SetAttr(tabs);
  let imported;
  try {
    const bytes = RtfExport.WriteDocument(source);
    const encoded = new TextDecoder().decode(bytes);
    expect(encoded).toContain("\\deftab1134");
    expect(encoded).toContain("\\tldot\\tqr\\tx1080\\tlul\\tqdec\\tx1800");
    imported = new RtfDocumentImpl().Resolve(new RtfTokenizer(bytes).Tokenize());
    expect(imported.GetDocumentSettingManager().get("TABS_RELATIVE_TO_INDENT")).toBe(false);
    const result = imported.paragraphs[0]?.GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem;
    expect(result.Count()).toBe(2);
    expect(result.At(0).GetTabPos()).toBe(1080);
    expect(result.At(0).GetAdjustment()).toBe(SvxTabAdjust.Right);
    expect(result.At(0).GetFill()).toBe(".");
    expect(result.At(1).GetTabPos()).toBe(1800);
    expect(result.At(1).GetAdjustment()).toBe(SvxTabAdjust.Decimal);
    expect(result.At(1).GetFill()).toBe("_");
  } finally {
    imported?.Dispose();
    source.Dispose();
  }
});

it("retains explicit native tab stops in an RTF named paragraph style", /** Checks retains explicit native tab stops in an RTF named paragraph style. @returns Test completion or assertion result. */ () => {
  const source = createWriterDocument();
  const style = source.GetTextFormatColl("heading-2");
  const tabs = new SvxTabStopItem(0, 0, SvxTabAdjust.Default, RES_PARATR_TABSTOP);
  tabs.Insert(new SvxTabStop(900, SvxTabAdjust.Center, "\0", "."));
  style.SetFormatAttr(tabs);
  const paragraph = source.paragraphs[0];
  if (paragraph === undefined) throw new Error("Missing paragraph.");
  paragraph.SetText("Styled tabs");
  paragraph.ChgFormatColl(style);
  let imported;
  try {
    const bytes = RtfExport.WriteDocument(source);
    expect(new TextDecoder().decode(bytes)).toMatch(/\\s\d+[^}]*\\tldot\\tqc\\tx900/u);
    imported = new RtfDocumentImpl().Resolve(new RtfTokenizer(bytes).Tokenize());
    const result = imported.paragraphs[0]?.GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem;
    expect(result.Count()).toBe(1);
    expect(result.At(0).GetTabPos()).toBe(900);
    expect(result.At(0).GetAdjustment()).toBe(SvxTabAdjust.Center);
    expect(result.At(0).GetFill()).toBe(".");
  } finally {
    imported?.Dispose();
    source.Dispose();
  }
});

it("emits native page-before break controls and preserves the source first-run import rule", /** Checks emits native page-before break controls and preserves the source first-run import rule. @returns Test completion or assertion result. */ () => {
  const source = createWriterDocument();
  const first = source.paragraphs[0];
  if (first === undefined) throw new Error("Missing first paragraph.");
  first.SetText("First");
  first.SetAttr(new SfxInt16Item(RES_BREAK, 4));
  const second = source.nodes.MakeTextNode("Second");
  second.SetAttr(new SfxInt16Item(RES_BREAK, 4));
  let imported;
  try {
    const bytes = RtfExport.WriteDocument(source);
    expect(new TextDecoder().decode(bytes).match(/\\pagebb/gu)).toHaveLength(2);
    imported = new RtfDocumentImpl().Resolve(new RtfTokenizer(bytes).Tokenize());
    expect((imported.paragraphs[0]?.GetAttr(RES_BREAK) as SfxInt16Item).GetValue()).toBe(0);
    expect((imported.paragraphs[1]?.GetAttr(RES_BREAK) as SfxInt16Item).GetValue()).toBe(4);
  } finally {
    imported?.Dispose();
    source.Dispose();
  }
});

import { createRtfExport } from "../../../../test/writer-rtf-export";
