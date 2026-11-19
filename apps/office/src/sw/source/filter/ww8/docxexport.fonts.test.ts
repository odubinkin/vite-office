/** @fileoverview Real Writer export context, font metadata fragment routing and committed OOXML ZIP relationships. No text-graph traversal or whole-DOCX readiness is inferred from this part test. */
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { readOwnedXml } from "../../../../test/oox-input";
import { assert, expect, it } from "vitest";
import { DocxExport } from "./docxexport";
import { MSWordExportFormat } from "./wrtww8";
import { SwDoc } from "../../core/doc/doc";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { FragmentHandler } from "../../../../oox/source/core/fragmenthandler";
import { XmlFilterBase } from "../../../../oox/source/core/xmlfilterbase";
import { ZipStorage } from "../../../../oox/source/helper/zipstorage";
import { getRelationship, Relationship } from "../../../../oox/source/token/relationship";
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import { FontFamily as F, FontPitch as P, FontWeight } from "../../../../tools/inc/fontenum";
import { SvxWeightItem } from "../../../../editeng/source/items/textitem";
import {
  RES_BREAK,
  RES_CHRATR_WEIGHT,
  RES_FRAMEDIR,
  RES_KEEP,
  RES_MARGIN_FIRSTLINE,
  RES_MARGIN_RIGHT,
  RES_MARGIN_TEXTLEFT,
  RES_PARATR_ADJUST,
  RES_PARATR_LINESPACING,
  RES_PARATR_SPLIT,
  RES_PARATR_WIDOWS,
  RES_UL_SPACE,
} from "../../../inc/hintids";
import { SvxAdjustItem } from "../../../../editeng/source/items/paraitem.adjust";
import {
  SvxFormatSplitItem,
  SvxWidowsItem,
} from "../../../../editeng/source/items/paraitem.controls";
import { SvxAdjust, SvxBreak, SvxLineSpaceRule } from "../../../../editeng/inc/svxenum";
import { SvxLineSpacingItem } from "../../../../editeng/inc/lspcitem";
import { SvxFrameDirection } from "../../../../editeng/inc/frmdir";
import { SvxFrameDirectionItem } from "../../../../editeng/inc/frmdiritem";
import {
  SvxFirstLineIndentItem,
  SvxIndentValue,
  SvxRightMarginItem,
  SvxTextLeftMarginItem,
} from "../../../../editeng/inc/lrspitem";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { SfxBoolItem } from "../../../../svl/inc/eitem";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";
import { SwFrameSize } from "../../../inc/fmtfsize";
import { VertOrientation } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { wwFont } from "./wrtw8sty";
import { importOOXML } from "../../writerfilter/filter/WriterFilter";
import { SwTableNode } from "../../core/docnode/node";
/** Actual graph/filter/exporter setup with genuine retained range owners. @param docm - Native macro flag. @param template - Native template flag. @returns Actual owners. */
function setup(docm = false, template = false) {
  const doc = new SwDoc(),
    point = new SwPosition(doc.GetNodes().GetEndOfContent()),
    range = new SwPaM(point),
    filter = new XmlFilterBase(new ZipStorage());
  return {
    doc,
    point,
    range,
    filter,
    exporter: new DocxExport(filter, doc, range, range, docm, template),
  };
}
/** Close native document owner and release consumed ranges. @param owners - Actual owners. @returns Committed ZIP bytes. */
async function finish(owners: ReturnType<typeof setup>): Promise<Uint8Array> {
  owners.exporter.dispose();
  owners.range.Dispose();
  owners.point.Dispose();
  owners.doc.Dispose();
  return await owners.filter.commitStorage();
}
/** Read an actual committed ZIP fragment. @param storage - Reopened storage. @param path - Part. @returns Decoded XML. */
async function xml(storage: ZipStorage, path: string): Promise<string> {
  const bytes = await storage.openInputStream(path);
  expect(bytes.is()).toBe(true);
  return readOwnedXml(bytes) as string;
}
it("connects actual exporter, shared font registration, collected rFonts and fontTable routing", /** Native part contract is tested through real ZIP commit/reopen. @returns Completion. */ async () => {
  const o = setup(),
    a = o.exporter.DocxAttrOutput(),
    serializer = a.GetSerializer(),
    w = token("w");
  expect(a.GetExport()).toBe(o.exporter);
  expect(o.exporter.GetExportFormat()).toBe(MSWordExportFormat.DOCX);
  expect(o.exporter.GetFilter()).toBe(o.filter);
  expect(o.exporter.AttrOutput()).toBe(a);
  const baseline = o.doc.GetNodes().entries().slice();
  const namespaces = o.exporter.MainXmlNamespaces();
  try {
    serializer.startElementNS(w, token("document"), namespaces);
  } finally {
    namespaces.dispose();
  }
  serializer.startElementNS(w, token("body"));
  a.StartRun(null, 0);
  a.StartRunProperties();
  a.CharFontCJK(new SvxFontItem(0));
  const first = new SvxFontItem(
      F.FAMILY_SWISS,
      "Liberation Sans;Fallback",
      "",
      P.PITCH_VARIABLE,
      1,
      7,
    ),
    second = new SvxFontItem(F.FAMILY_ROMAN, "Different", "", P.PITCH_FIXED, 10, 7);
  expect(o.exporter.GetId(first)).toBe(0);
  a.CharFont(first);
  a.CharFont(second);
  a.CharFont(new SvxFontItem(7));
  a.EndRunProperties();
  a.RawText("Ω", 76);
  a.EndRun(null, 0, 1);
  serializer.endElementNS(w, token("body"));
  serializer.endElementNS(w, token("document"));
  o.exporter.WriteFonts();
  expect(a.GetSerializer()).toBe(serializer);
  expect(o.doc.GetNodes().entries()).toEqual(baseline);
  const committed = await finish(o),
    storage = await ZipStorage.open(committed),
    main = await xml(storage, "word/document.xml"),
    fonts = await xml(storage, "word/fontTable.xml"),
    rels = await xml(storage, "word/_rels/document.xml.rels"),
    types = await (await DocumentArchive.open(committed)).readTextEntry("[Content_Types].xml");
  const reader = new XmlFilterBase(storage);
  expect(await reader.importFragment(new FragmentHandler(reader, "word/document.xml"))).toBe(true);
  expect(await reader.importFragment(new FragmentHandler(reader, "word/fontTable.xml"))).toBe(true);
  expect(
    (await reader.importRelations("word/document.xml")).getFragmentPathFromFirstType(
      getRelationship(Relationship.FONTTABLE),
    ),
  ).toBe("word/fontTable.xml");
  expect(main).toContain(
    '<w:rFonts w:eastAsia="" w:ascii="Liberation Sans;Fallback" w:hAnsi="Liberation Sans;Fallback"/>',
  );
  expect(main).toContain("<w:t>Ω</w:t>");
  expect(main).not.toContain("Different");
  expect(fonts).toContain(
    '<w:font w:name="Liberation Sans"><w:altName w:val="Arial"/><w:charset w:val="00"/><w:family w:val="swiss"/><w:pitch w:val="variable"/></w:font>',
  );
  expect(fonts).toContain(
    '<w:font w:name="Different"><w:charset w:val="02"/><w:family w:val="roman"/><w:pitch w:val="fixed"/></w:font>',
  );
  expect(fonts.match(/<w:font /g)).toHaveLength(2);
  expect(fonts.indexOf('w:name="Liberation Sans"')).toBeLessThan(
    fonts.indexOf('w:name="Different"'),
  );
  expect(rels).toContain(getRelationship(Relationship.FONTTABLE));
  expect(rels).toContain('Target="fontTable.xml"');
  expect(await xml(storage, "_rels/.rels")).toContain(getRelationship(Relationship.OFFICEDOCUMENT));
  expect(types).toContain(
    "application/vnd.openxmlformats-officedocument.wordprocessingml.fontTable+xml",
  );
});

it("round trips native paragraph spacing, alignment, indentation and pagination controls", /** Checks the ordered DOCX paragraph properties and reopened Writer items. @returns Completion. */ async () => {
  const doc = new SwDoc();
  try {
    const node = doc.paragraphs[0];
    assert(node);
    node.SetText("Paragraph properties");
    node.SetAttr(new SvxAdjustItem(SvxAdjust.Center, RES_PARATR_ADJUST));
    node.SetAttr(new SvxFormatSplitItem(false, RES_PARATR_SPLIT));
    node.SetAttr(new SvxWidowsItem(2, RES_PARATR_WIDOWS));
    node.SetAttr(new SfxBoolItem(RES_KEEP, true));
    node.SetAttr(new SfxInt16Item(RES_BREAK, SvxBreak.PageBefore));
    node.SetAttr(new SvxULSpaceItem(120, 240, RES_UL_SPACE, true));
    const lineSpacing = new SvxLineSpacingItem(360, RES_PARATR_LINESPACING);
    lineSpacing.SetLineSpaceRule(SvxLineSpaceRule.Fix);
    node.SetAttr(lineSpacing);
    node.SetAttr(new SvxTextLeftMarginItem(SvxIndentValue.twips(360), RES_MARGIN_TEXTLEFT));
    node.SetAttr(new SvxRightMarginItem(SvxIndentValue.twips(180), RES_MARGIN_RIGHT));
    node.SetAttr(new SvxFirstLineIndentItem(SvxIndentValue.twips(-120), RES_MARGIN_FIRSTLINE));
    const bytes = await DocxExport.WriteDocument(doc);
    const fragment = await xml(await ZipStorage.open(bytes), "word/document.xml");
    expect(fragment).toContain(
      '<w:pPr><w:pStyle w:val="Normal"/><w:keepNext w:val="true"/><w:keepLines/><w:pageBreakBefore/><w:widowControl/><w:spacing w:before="120" w:after="240" w:lineRule="exact" w:line="360"/><w:ind w:left="360" w:right="180" w:hanging="120"/><w:contextualSpacing/><w:jc w:val="center"/><w:rPr></w:rPr></w:pPr>',
    );
    const reopened = await importOOXML(bytes, {});
    try {
      const imported = reopened.paragraphs[0];
      assert(imported);
      expect(imported.GetText()).toBe("Paragraph properties");
      expect((imported.GetAttr(RES_PARATR_ADJUST) as SvxAdjustItem).GetAdjust()).toBe(
        SvxAdjust.Center,
      );
      expect((imported.GetAttr(RES_PARATR_SPLIT) as SvxFormatSplitItem).GetValue()).toBe(false);
      expect((imported.GetAttr(RES_KEEP) as SfxBoolItem).GetValue()).toBe(true);
      expect((imported.GetAttr(RES_BREAK) as SfxInt16Item).GetValue()).toBe(SvxBreak.PageBefore);
      expect((imported.GetAttr(RES_PARATR_WIDOWS) as SvxWidowsItem).GetValue()).toBe(2);
      const spacing = imported.GetAttr(RES_UL_SPACE) as SvxULSpaceItem;
      const line = imported.GetAttr(RES_PARATR_LINESPACING) as SvxLineSpacingItem;
      expect(line.GetLineSpaceRule()).toBe(SvxLineSpaceRule.Fix);
      expect(line.GetLineHeight()).toBe(360);
      expect([spacing.GetUpper(), spacing.GetLower(), spacing.GetContext()]).toEqual([
        120,
        240,
        true,
      ]);
      expect(
        (imported.GetAttr(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem).ResolveTextLeft(),
      ).toBe(360);
      expect((imported.GetAttr(RES_MARGIN_RIGHT) as SvxRightMarginItem).ResolveRight()).toBe(180);
      expect(
        (
          imported.GetAttr(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem
        ).ResolveTextFirstLineOffset(),
      ).toBe(-120);
    } finally {
      reopened.Dispose();
    }
  } finally {
    doc.Dispose();
  }
});

it("writes Word paragraph direction, distribution and proportional line rules", /** Uses original graph items for logical and physical alignment. @returns Completion. */ async () => {
  const doc = new SwDoc();
  try {
    const rtl = doc.paragraphs[0];
    assert(rtl);
    rtl.SetText("العربية");
    rtl.SetAttr(new SvxFrameDirectionItem(SvxFrameDirection.Horizontal_RL_TB, RES_FRAMEDIR));
    rtl.SetAttr(new SvxAdjustItem(SvxAdjust.Left, RES_PARATR_ADJUST));
    const ltr = doc.nodes.MakeTextNode("Left to right");
    ltr.SetAttr(new SvxFrameDirectionItem(SvxFrameDirection.Horizontal_LR_TB, RES_FRAMEDIR));
    ltr.SetAttr(new SvxAdjustItem(SvxAdjust.ParaEnd, RES_PARATR_ADJUST));
    const start = doc.nodes.MakeTextNode("Logical start");
    start.SetAttr(new SvxAdjustItem(SvxAdjust.ParaStart, RES_PARATR_ADJUST));
    const proportional = new SvxLineSpacingItem(240, RES_PARATR_LINESPACING);
    proportional.SetPropLineSpace(150);
    start.SetAttr(proportional);
    start.SetAttr(new SvxFirstLineIndentItem(SvxIndentValue.twips(160), RES_MARGIN_FIRSTLINE));
    const justified = doc.nodes.MakeTextNode("Justified");
    justified.SetAttr(new SvxAdjustItem(SvxAdjust.Block, RES_PARATR_ADJUST));
    const distributed = doc.nodes.MakeTextNode("Distributed");
    const adjust = new SvxAdjustItem(SvxAdjust.Block, RES_PARATR_ADJUST);
    adjust.SetLastBlock(SvxAdjust.Block);
    distributed.SetAttr(adjust);
    const fragment = await xml(
      await ZipStorage.open(await DocxExport.WriteDocument(doc)),
      "word/document.xml",
    );
    expect(fragment).toContain('<w:bidi w:val="1"/><w:jc w:val="right"/>');
    expect(fragment).toContain('<w:bidi w:val="0"/><w:jc w:val="right"/>');
    expect(fragment).toContain(
      '<w:spacing w:lineRule="auto" w:line="360"/><w:ind w:firstLine="160"/><w:jc w:val="left"/>',
    );
    expect(fragment).toContain('<w:jc w:val="both"/>');
    expect(fragment).toContain('<w:jc w:val="distribute"/>');
  } finally {
    doc.Dispose();
  }
});

it("round trips native table geometry, a fixed-height row and a vertical cell span", /** Verifies original DOCX column and merge markers through export and actual table reconstruction. @returns Completion. */ async () => {
  const doc = new SwDoc();
  try {
    const table = doc.nodes.MakeTableNode("Grid", {}, doc.paragraphs[0]);
    const widths = [1920, 2880];
    for (const span of [3, -2, -1]) {
      const row = doc.nodes.AppendTableRow(table, widths.length);
      for (const [index, box] of row.GetTabBoxes().entries()) {
        const size = box.GetFrameSize();
        try {
          size.SetWidth(widths[index] as number);
          box.SetFrameSize(size);
        } finally {
          size.Dispose();
        }
      }
      row.GetTabBoxes()[0]?.setRowSpan(span);
      if (span === 3) {
        const format = row.GetFrameFormat();
        const size = format.GetFrameSize().Clone();
        try {
          size.SetHeight(720);
          size.SetHeightSizeType(SwFrameSize.Fixed);
          format.SetFormatAttr(size);
        } finally {
          size.Dispose();
        }
      }
    }
    const joined = doc.nodes.AppendTableRow(table, 1).GetTabBoxes()[0];
    assert(joined);
    const frame = joined.GetFrameSize();
    const alignment = joined.GetVertOrient();
    try {
      frame.SetWidth(4800);
      joined.SetFrameSize(frame);
      alignment.SetVertOrient(VertOrientation.CENTER);
      joined.ClaimFrameFormat().SetFormatAttr(alignment);
    } finally {
      alignment.Dispose();
      frame.Dispose();
    }
    const bytes = await DocxExport.WriteDocument(doc);
    const documentXml = await (
      await DocumentArchive.open(bytes)
    ).readTextEntry("word/document.xml");
    expect(documentXml).toContain('<w:vMerge w:val="restart"/>');
    expect(documentXml.match(/<w:vMerge w:val="continue"\/>/g)).toHaveLength(2);
    expect(documentXml).toContain('<w:trHeight w:val="720" w:hRule="exact"/>');
    expect(documentXml).toContain('<w:gridSpan w:val="2"/><w:vAlign w:val="center"/>');
    const reopened = await importOOXML(bytes, {});
    try {
      const node = reopened.GetNodes().getBodyContent()[1];
      assert(node instanceof SwTableNode);
      const rows = node.GetTable().GetTabLines();
      expect(
        rows.map(
          /** Reads the native signed row span. @param row - Actual row. @returns Span. */ (row) =>
            row.GetTabBoxes()[0]?.getRowSpan(),
        ),
      ).toEqual([3, -2, -1, 1]);
      const firstRow = rows[0];
      expect(firstRow?.GetTabBoxes()[0]?.GetFrameFormat().GetFrameSize().GetWidth()).toBe(1920);
      expect(firstRow?.GetTabBoxes()[1]?.GetFrameFormat().GetFrameSize().GetWidth()).toBe(2880);
      expect(firstRow?.GetFrameFormat().GetFrameSize().GetHeight()).toBe(720);
      expect(firstRow?.GetFrameFormat().GetFrameSize().GetHeightSizeType()).toBe(SwFrameSize.Fixed);
      const joined = rows[3]?.GetTabBoxes()[0];
      expect(rows[3]?.GetTabBoxes()).toHaveLength(1);
      expect(joined?.GetFrameFormat().GetFrameSize().GetWidth()).toBe(4800);
      expect(joined?.GetFrameFormat().GetVertOrient().GetVertOrient()).toBe(VertOrientation.CENTER);
    } finally {
      reopened.Dispose();
    }
  } finally {
    doc.Dispose();
  }
});
it("retains the earlier merge group for a disjoint continuation at the same left edge", /** Pins the source's malformed input path through the actual table part. @returns Completion. */ async () => {
  const source = new SwDoc();
  try {
    const table = source.nodes.MakeTableNode("Separated", {}, source.paragraphs[0]);
    for (const span of [2, 1, -1])
      source.nodes.AppendTableRow(table, 1).GetTabBoxes()[0]?.setRowSpan(span);
    const reopened = await importOOXML(await DocxExport.WriteDocument(source), {});
    try {
      const table = reopened.GetNodes().getBodyContent()[1];
      assert(table instanceof SwTableNode);
      expect(
        table
          .GetTable()
          .GetTabLines()
          .map(
            /** Reads the represented native span. @param row - Actual table row. @returns Span. */ (
              row,
            ) => row.GetTabBoxes()[0]?.getRowSpan(),
          ),
      ).toEqual([2, 1, -1]);
    } finally {
      reopened.Dispose();
    }
  } finally {
    source.Dispose();
  }
});

it("emits all native font family/pitch/charset metadata and omits empty registered names", /** Full metadata switches retain source output values. @returns Completion. */ async () => {
  const o = setup();
  for (const [index, family] of [
    F.FAMILY_DONTKNOW,
    F.FAMILY_DECORATIVE,
    F.FAMILY_MODERN,
    F.FAMILY_SCRIPT,
  ].entries())
    o.exporter.GetId(new wwFont("font" + index, P.PITCH_DONTKNOW, family, 34));
  o.exporter.GetId(new wwFont("", P.PITCH_DONTKNOW, F.FAMILY_DONTKNOW, 0));
  o.exporter.WriteFonts();
  const fonts = await xml(await ZipStorage.open(await finish(o)), "word/fontTable.xml");
  for (const family of ["auto", "decorative", "modern", "script"])
    expect(fonts).toContain(`<w:family w:val="${family}"/>`);
  expect(fonts).toContain('<w:pitch w:val="default"/>');
  expect(fonts).not.toContain('w:name=""');
});
it("retains all four native document media-type branches and missing namespace/relationship fallbacks", /** Native constants are used without a private export token catalog. @returns Completion. */ async () => {
  for (const [docm, template, type] of [
    [
      false,
      false,
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml",
    ],
    [
      false,
      true,
      "application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml",
    ],
    [true, false, "application/vnd.ms-word.document.macroEnabled.main+xml"],
    [true, true, "application/vnd.ms-word.template.macroEnabledTemplate.main+xml"],
  ] as const) {
    const o = setup(docm, template);
    expect(
      await (await DocumentArchive.open(await finish(o))).readTextEntry("[Content_Types].xml"),
    ).toContain(type);
  }
  const emptyNamespace = new XmlFilterBase(new ZipStorage()).getNamespaceURL(-1);
  try {
    expect(emptyNamespace.isEmpty()).toBe(true);
  } finally {
    emptyNamespace.dispose();
  }
  expect(getRelationship(Relationship.NUM_ENTRIES)).toBe("");
  for (let value = 0; value < Relationship.NUM_ENTRIES; ++value)
    expect(getRelationship(value)).toMatch(/^http:\/\/schemas\./);
});

it("exports live Writer body, range formatting and table cells through the document part", /** Verifies package relationships and the actual body XML without projecting to UI content. @returns Completion. */ async () => {
  const doc = new SwDoc();
  try {
    const first = doc.paragraphs[0];
    assert(first);
    first.SetText("  α😀\tBold\n");
    const start = new SwPosition(first, 6);
    const end = new SwPosition(first, 10);
    const range = new SwPaM(start, end);
    try {
      doc.InsertPoolItem(range, new SvxWeightItem(FontWeight.WEIGHT_BOLD, RES_CHRATR_WEIGHT));
    } finally {
      range.Dispose();
      end.Dispose();
      start.Dispose();
    }
    const table = doc.nodes.MakeTableNode("Grid", {}, first);
    const row = doc.nodes.AppendTableRow(table, 2);
    row.GetTabBoxes()[0]?.GetParagraphs()[0]?.SetText("Left & right");
    row.GetTabBoxes()[1]?.GetParagraphs()[0]?.SetText("Second");
    const bytes = await DocxExport.WriteDocument(doc);
    const storage = await ZipStorage.open(bytes);
    const filter = new XmlFilterBase(storage);
    const mainPath = await filter.getFragmentPathFromFirstTypeFromOfficeDoc("officeDocument");
    expect(mainPath).toBe("word/document.xml");
    expect(await filter.importFragment(new FragmentHandler(filter, mainPath))).toBe(true);
    const main = await xml(storage, mainPath);
    expect(main).toContain('<w:t xml:space="preserve">  α😀</w:t><w:tab/>');
    expect(main).toContain("<w:b/>");
    expect(main).toContain("<w:t>Bold</w:t>");
    expect(main).toContain("<w:br/>");
    expect(main).toContain("<w:tbl><w:tblGrid>");
    expect(main).toContain("<w:t>Left &amp; right</w:t>");
    expect(main).toContain("<w:t>Second</w:t>");
    expect(doc.paragraphs[0]?.GetText()).toBe("  α😀\tBold\n");
    const reopened = await importOOXML(bytes, {});
    try {
      const table = reopened.GetNodes().getBodyContent()[1];
      assert(table instanceof SwTableNode);
      const cells = table.GetTable().GetTabLines()[0]?.GetTabBoxes();
      expect(cells).toHaveLength(2);
      expect(cells?.[0]?.GetParagraphs()[0]?.GetText()).toBe("Left & right");
      expect(cells?.[1]?.GetParagraphs()[0]?.GetText()).toBe("Second");
    } finally {
      reopened.Dispose();
    }
  } finally {
    doc.Dispose();
  }
});
