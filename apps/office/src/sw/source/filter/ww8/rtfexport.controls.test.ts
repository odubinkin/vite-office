/** @fileoverview Source RTF border and numbering control contracts at the serialized document boundary. */
import { assert, expect, it } from "vitest";
import { SvxNumType } from "../../../../editeng/inc/svxenum";
import { SvxBorderLine } from "../../../../editeng/source/items/borderline";
import { SvxUnderlineItem } from "../../../../editeng/source/items/textitem";
import { SvxBoxItemLine } from "../../../../editeng/source/items/frmitems";
import * as NumberingType from "../../../../offapi/com/sun/star/style/NumberingType";
import { BorderLineStyle } from "../../../../offapi/com/sun/star/table/BorderLineStyle";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { Color } from "../../../../tools/inc/color";
import { FontLineStyle } from "../../../../tools/inc/fontenum";
import { RES_CHRATR_UNDERLINE } from "../../../inc/hintids";
import { createWriterTextColorItem } from "../../core/attr/swatrset";
import { createWriterDocument } from "../../core/doc/doc";
import { applyWriterParagraphList } from "../../core/doc/list";
import { SwNumFormat } from "../../core/doc/number";
import { SwTableNode } from "../../core/docnode/node";
import { RtfDocumentImpl } from "../../writerfilter/rtftok/rtfdocumentimpl";
import { createWriterTextFragment } from "../basflt/writer-transfer";
import { projectWriterTextRuns } from "../../core/txtnode/ndtxt";
import { RtfExport } from "./rtfexport";

it("indexes named-style colors and escapes soft lines, tabs and end bookmarks", /** Checks actual style collection and paragraph output rather than the exporter's private helpers. @returns Nothing. */ () => {
  const document = createWriterDocument();
  try {
    const paragraph = document.paragraphs[0];
    assert(paragraph);
    const style = document.GetTextFormatColl("heading-2");
    style.SetFormatAttr(createWriterTextColorItem("#123456"));
    const underline = new SvxUnderlineItem(FontLineStyle.LINESTYLE_SINGLE, RES_CHRATR_UNDERLINE);
    underline.SetColor(new Color(0x654321));
    style.SetFormatAttr(underline);
    paragraph.ChgFormatColl(style);
    paragraph.SetText("A\nB\tC");
    document.GetIDocumentMarkAccess().MakeMark(paragraph, paragraph.Len(), "End");
    const rtf = new TextDecoder().decode(RtfExport.WriteDocument(document));
    expect(rtf).toContain("\\red18\\green52\\blue86;");
    expect(rtf).toContain("\\red101\\green67\\blue33;");
    expect(rtf).toContain("A\\line B\\tab C");
    expect(rtf).toContain("{\\*\\bkmkstart End}{\\*\\bkmkend End}");
  } finally {
    document.Dispose();
  }
});

it("keeps NONE and unknown native border styles empty before selecting an RTF line control", /** Checks the native width implementation invariant used by the nonempty border serializer. @returns Nothing. */ () => {
  for (const style of [BorderLineStyle.NONE, 99 as BorderLineStyle]) {
    expect(new SvxBorderLine(new Color(0x123456), 60, style).isEmpty()).toBe(true);
  }
});

it("sorts native soft boundaries and stops splitting at a self-following page style", /** Checks source mark order independently of the paragraph's stored text. @returns Nothing. */ () => {
  const document = createWriterDocument();
  try {
    const paragraph = document.paragraphs[0];
    assert(paragraph);
    paragraph.SetText("AlphaBetaGamma");
    document.GetIDocumentMarkAccess().AddSoftPageBreak(paragraph, 9);
    document.GetIDocumentMarkAccess().AddSoftPageBreak(paragraph, 5);
    const follow = document.MakePageDesc("Follow", document.GetPageDesc());
    document.ChgPageDesc({ ...follow.GetValue(), width: 15000 }, "Follow");
    follow.SetFollow(follow);
    document.GetPageDesc().SetFollow(follow);
    const imported = new RtfDocumentImpl().ResolveBytes(RtfExport.WriteDocument(document));
    try {
      expect(
        imported.paragraphs.map(
          /** Reads actual paragraph text. @param node - Native node. @returns Text. */ (node) =>
            node.GetText(),
        ),
      ).toEqual(["Alpha", "BetaGamma"]);
    } finally {
      imported.Dispose();
    }
  } finally {
    document.Dispose();
  }
});

it("ends the RTF hyperlink field before the following plain run", /** Checks the native hint range across the exporter and reader. @returns Nothing. */ () => {
  const document = createWriterDocument();
  try {
    const paragraph = document.paragraphs[0];
    assert(paragraph);
    const attributes = { bold: false, italic: false, underline: false };
    const fragment = createWriterTextFragment(paragraph, [
      { text: "linked", attributes, hyperlink: { url: "https://example.test" } },
      { text: "plain", attributes },
    ]);
    paragraph.SetText(fragment.text);
    paragraph.SetTextHints(fragment.hints);
    const imported = new RtfDocumentImpl().ResolveBytes(RtfExport.WriteDocument(document));
    try {
      const restored = imported.paragraphs[0];
      assert(restored);
      const runs = projectWriterTextRuns(restored);
      expect(runs[0]?.hyperlink?.url).toBe("https://example.test");
      expect(runs.at(-1)?.hyperlink).toBeUndefined();
      expect(restored.GetText()).toBe("linkedplain");
    } finally {
      imported.Dispose();
    }
  } finally {
    document.Dispose();
  }
});

it.each([
  [SvxNumType.SVX_NUM_ROMAN_LOWER, 2],
  [SvxNumType.SVX_NUM_CHARS_UPPER_LETTER, 3],
  [SvxNumType.SVX_NUM_CHARS_UPPER_LETTER_N, 3],
  [SvxNumType.SVX_NUM_CHARS_LOWER_LETTER, 4],
  [SvxNumType.SVX_NUM_CHARS_LOWER_LETTER_N, 4],
  [SvxNumType.SVX_NUM_FULL_WIDTH_ARABIC, 14],
  [SvxNumType.SVX_NUM_CIRCLE_NUMBER, 18],
  [SvxNumType.SVX_NUM_NUMBER_LOWER_ZH, 35],
  [SvxNumType.SVX_NUM_NUMBER_UPPER_ZH, 38],
  [SvxNumType.SVX_NUM_NUMBER_UPPER_ZH_TW, 34],
  [SvxNumType.SVX_NUM_TIAN_GAN_ZH, 30],
  [SvxNumType.SVX_NUM_DI_ZI_ZH, 31],
  [SvxNumType.SVX_NUM_NUMBER_TRADITIONAL_JA, 16],
  [SvxNumType.SVX_NUM_AIU_FULLWIDTH_JA, 20],
  [SvxNumType.SVX_NUM_AIU_HALFWIDTH_JA, 12],
  [SvxNumType.SVX_NUM_IROHA_FULLWIDTH_JA, 21],
  [SvxNumType.SVX_NUM_IROHA_HALFWIDTH_JA, 13],
  [SvxNumType.SVX_NUM_HANGUL_CIRCLED_SYLLABLE_KO, 24],
  [SvxNumType.SVX_NUM_HANGUL_JAMO_KO, 25],
  [SvxNumType.SVX_NUM_HANGUL_CIRCLED_JAMO_KO, 25],
  [SvxNumType.SVX_NUM_NUMBER_HANGUL_KO, 42],
  [NumberingType.NUMBER_DIGITAL2_KO as SvxNumType, 44],
  [NumberingType.NUMBER_LEGAL_KO as SvxNumType, 43],
  [SvxNumType.SVX_NUM_CHAR_SPECIAL, 23],
  [SvxNumType.SVX_NUM_BITMAP, 23],
  [SvxNumType.SVX_NUM_NUMBER_NONE, 255],
  [SvxNumType.SVX_NUM_ARABIC_ZERO, 22],
] as const)(
  "writes native numbering type %i as RTF levelnfc%i",
  /** Checks external RTF numbering identities. @param type - Native type. @param nfc - RTF identity. @returns Nothing. */ (
    type,
    nfc,
  ) => {
    const document = createWriterDocument();
    try {
      const paragraph = document.paragraphs[0];
      assert(paragraph);
      paragraph.SetText("Item");
      applyWriterParagraphList(paragraph, { kind: "numbered", level: 0, listId: "ControlTypes" });
      const rule = paragraph.GetNumRule();
      assert(rule);
      const format = new SwNumFormat(rule.Get(0));
      format.SetNumberingType(type);
      rule.Set(0, format);
      document.GetDocumentListsManager().InvalidateAllLists();
      const bytes = RtfExport.WriteDocument(document);
      expect(new TextDecoder().decode(bytes)).toContain(`\\levelnfc${nfc}\\levelstartat1`);
      const imported = new RtfDocumentImpl().ResolveBytes(bytes);
      try {
        const canonical = new Map<SvxNumType, SvxNumType>([
          [SvxNumType.SVX_NUM_CHARS_UPPER_LETTER_N, SvxNumType.SVX_NUM_CHARS_UPPER_LETTER],
          [SvxNumType.SVX_NUM_CHARS_LOWER_LETTER_N, SvxNumType.SVX_NUM_CHARS_LOWER_LETTER],
          [SvxNumType.SVX_NUM_HANGUL_CIRCLED_SYLLABLE_KO, SvxNumType.SVX_NUM_HANGUL_SYLLABLE_KO],
          [SvxNumType.SVX_NUM_HANGUL_CIRCLED_JAMO_KO, SvxNumType.SVX_NUM_HANGUL_JAMO_KO],
          [SvxNumType.SVX_NUM_BITMAP, SvxNumType.SVX_NUM_CHAR_SPECIAL],
        ]);
        expect(imported.paragraphs[0]?.GetNumRule()?.Get(0).GetNumberingType()).toBe(
          canonical.get(type) ?? type,
        );
      } finally {
        imported.Dispose();
      }
    } finally {
      document.Dispose();
    }
  },
);

it.each([
  [BorderLineStyle.DOTTED, "brdrdot"],
  [BorderLineStyle.DASHED, "brdrdash"],
  [BorderLineStyle.DOUBLE, "brdrdb"],
  [BorderLineStyle.DOUBLE_THIN, "brdrdb"],
  [BorderLineStyle.THINTHICK_SMALLGAP, "brdrtnthsg"],
  [BorderLineStyle.THINTHICK_MEDIUMGAP, "brdrtnthmg"],
  [BorderLineStyle.THINTHICK_LARGEGAP, "brdrtnthlg"],
  [BorderLineStyle.THICKTHIN_SMALLGAP, "brdrthtnsg"],
  [BorderLineStyle.THICKTHIN_MEDIUMGAP, "brdrthtnmg"],
  [BorderLineStyle.THICKTHIN_LARGEGAP, "brdrthtnlg"],
  [BorderLineStyle.EMBOSSED, "brdremboss"],
  [BorderLineStyle.ENGRAVED, "brdrengrave"],
  [BorderLineStyle.OUTSET, "brdroutset"],
  [BorderLineStyle.INSET, "brdrinset"],
  [BorderLineStyle.FINE_DASHED, "brdrdashsm"],
  [BorderLineStyle.DASH_DOT, "brdrdashd"],
  [BorderLineStyle.DASH_DOT_DOT, "brdrdashdd"],
] as const)(
  "writes native cell border style %i as %s",
  /** Checks source OutTBLBorderLine mapping with an actual table box. @param style - Native line. @param control - RTF border control. @returns Nothing. */ (
    style,
    control,
  ) => {
    const document = createWriterDocument();
    try {
      const paragraph = document.paragraphs[0];
      assert(paragraph);
      const table = document.nodes.MakeTableNode("Borders", {}, paragraph);
      const row = document.nodes.AppendTableRow(table, 1);
      const box = row.GetTabBoxes()[0];
      assert(box);
      const border = box.GetBox();
      border.SetLine(new SvxBorderLine(new Color(0x123456), 60, style), SvxBoxItemLine.TOP);
      box.ClaimFrameFormat().SetFormatAttr(border);
      const bytes = RtfExport.WriteDocument(document);
      expect(new TextDecoder().decode(bytes)).toContain(`\\clbrdrt\\${control}\\brdrw`);
      const imported = new RtfDocumentImpl().ResolveBytes(bytes);
      try {
        const restored = imported
          .GetNodes()
          .getBodyContent()
          .find(
            /** Finds the actual restored table. @param block - Body node. @returns Whether a table. */ (
              block,
            ) => block instanceof SwTableNode,
          );
        assert(restored instanceof SwTableNode);
        expect(
          restored
            .GetTable()
            .GetTabLines()[0]
            ?.GetTabBoxes()[0]
            ?.GetBox()
            .GetTop()
            ?.GetBorderLineStyle(),
        ).toBe(style === BorderLineStyle.DOUBLE_THIN ? BorderLineStyle.DOUBLE : style);
      } finally {
        imported.Dispose();
      }
    } finally {
      document.Dispose();
    }
  },
);

it.each([
  [HoriOrientation.CENTER, "trqc"],
  [HoriOrientation.RIGHT, "trqr"],
] as const)(
  "writes table alignment %i as %s",
  /** Checks serialized row alignment controls. @param alignment - Native orientation. @param control - RTF row control. @returns Nothing. */ (
    alignment,
    control,
  ) => {
    const document = createWriterDocument();
    try {
      const paragraph = document.paragraphs[0];
      assert(paragraph);
      const table = document.nodes.MakeTableNode("Aligned", {}, paragraph);
      document.nodes.AppendTableRow(table, 1);
      const orientation = table.GetFrameFormat().GetHoriOrient().Clone();
      orientation.SetHoriOrient(alignment);
      table.GetFrameFormat().SetFormatAttr(orientation);
      expect(new TextDecoder().decode(RtfExport.WriteDocument(document))).toContain(`\\${control}`);
    } finally {
      document.Dispose();
    }
  },
);
