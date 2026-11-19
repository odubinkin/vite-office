/** @fileoverview Source DOCX paragraph controls emitted by the actual exporter, native items and production ZIP output. */
import { assert, expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { XmlFilterBase } from "../../../../oox/source/core/xmlfilterbase";
import { ZipStorage } from "../../../../oox/source/helper/zipstorage";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import { SfxBoolItem } from "../../../../svl/inc/eitem";
import { SfxUInt16Item } from "../../../../svl/source/items/intitem";
import { SvxAdjustItem } from "../../../../editeng/source/items/paraitem.adjust";
import { SvxAdjust } from "../../../../editeng/inc/svxenum";
import { SvxFrameDirection } from "../../../../editeng/inc/frmdir";
import { SvxFrameDirectionItem } from "../../../../editeng/inc/frmdiritem";
import { RES_FRAMEDIR, RES_PARATR_ADJUST } from "../../../inc/hintids";
import {
  SvxFormatSplitItem,
  SvxWidowsItem,
  SvxParaGridItem,
  SvxParaVertAlignItem,
} from "../../../../editeng/source/items/paraitem.controls";
import { DocxExport } from "./docxexport";
/** Real export context with actual document/range lifetime. @returns Owners. */
function setup() {
  const doc = new SwDoc(),
    position = new SwPosition(doc.GetNodes().GetEndOfContent()),
    range = new SwPaM(position),
    filter = new XmlFilterBase(new ZipStorage()),
    exporter = new DocxExport(filter, doc, range, range, false, false);
  return {
    doc,
    position,
    range,
    filter,
    exporter,
    output: exporter.DocxAttrOutput(),
    closed: false,
  };
}
/** Source member release. @param owners - Actual export context. @returns Nothing. */
function dispose(owners: ReturnType<typeof setup>) {
  if (!owners.closed) {
    owners.exporter.dispose();
    owners.closed = true;
  }
  owners.range.Dispose();
  owners.position.Dispose();
  owners.doc.Dispose();
}

it.each([
  [SvxAdjust.Left, 100, 100, "right"],
  [SvxAdjust.Block, 133, 133, "lowKashida"],
  [SvxAdjust.Block, 200, 200, "mediumKashida"],
  [SvxAdjust.Block, 300, 300, "highKashida"],
  [SvxAdjust.Block, 90, 110, "both"],
] as const)(
  "writes native RTL paragraph alignment %s %d %d as %s before the mark",
  /** Exercises the directional mapping and unequal spacing fallback using an actual DOCX package. @param align - Paragraph alignment. @param minimum - Minimum word spacing percentage. @param maximum - Maximum word spacing percentage. @param word - Expected WordprocessingML token. @returns Completion. */ async (
    align,
    minimum,
    maximum,
    word,
  ) => {
    const document = new SwDoc();
    try {
      const node = document.paragraphs[0];
      assert(node);
      node.SetText("العربية");
      const adjustment = new SvxAdjustItem(align, RES_PARATR_ADJUST);
      adjustment.SetPropWordSpacingMinimum(minimum);
      adjustment.SetPropWordSpacingMaximum(maximum);
      node.SetAttr(adjustment);
      node.SetAttr(new SvxFrameDirectionItem(SvxFrameDirection.Horizontal_RL_TB, RES_FRAMEDIR));
      const bytes = await DocxExport.WriteDocument(document);
      const xml = await (await DocumentArchive.open(bytes)).readTextEntry("word/document.xml");
      expect(xml).toContain(`<w:bidi w:val="1"/><w:jc w:val="${word}"/><w:rPr></w:rPr>`);
    } finally {
      document.Dispose();
    }
  },
);
it("writes every source paragraph boolean spelling and normalizes nonzero widow counts", /** Empty versus explicit-false elements are observable OOXML contracts. @returns Completion. */ async () => {
  const owners = setup(),
    a = owners.output,
    serializer = a.GetSerializer(),
    namespaces = owners.exporter.MainXmlNamespaces();
  try {
    serializer.startElementNS(token("w"), token("document"), namespaces);
    serializer.startElementNS(token("w"), token("body"));
    serializer.startElementNS(token("w"), token("p"));
    serializer.startElementNS(token("w"), token("pPr"));
    for (const value of [false, true]) {
      const split = new SvxFormatSplitItem(value, 1),
        widow = new SvxWidowsItem(value ? 255 : 0, 2),
        grid = new SvxParaGridItem(value, 3),
        flag = new SfxBoolItem(4, value);
      try {
        a.ParaSplit(split);
        a.ParaWidows(widow);
        a.ParaSnapToGrid(grid);
        a.ParaScriptSpace(flag);
        a.ParaHangingPunctuation(flag);
        a.ParaForbiddenRules(flag);
        a.PageBreakBefore(value);
      } finally {
        flag.Dispose();
        grid.Dispose();
        widow.Dispose();
        split.Dispose();
      }
    }
    serializer.endElementNS(token("w"), token("pPr"));
    serializer.endElementNS(token("w"), token("p"));
    serializer.endElementNS(token("w"), token("body"));
    serializer.endElementNS(token("w"), token("document"));
    owners.exporter.dispose();
    owners.closed = true;
    const archive = await DocumentArchive.open(await owners.filter.commitStorage()),
      xml = await archive.readTextEntry("word/document.xml");
    expect(xml).toContain(
      '<w:pPr><w:keepLines/><w:widowControl w:val="false"/><w:snapToGrid w:val="false"/><w:autoSpaceDE w:val="false"/><w:overflowPunct w:val="false"/><w:kinsoku w:val="false"/><w:pageBreakBefore w:val="false"/><w:keepLines w:val="false"/><w:widowControl/><w:snapToGrid w:val="true"/><w:autoSpaceDE w:val="true"/><w:overflowPunct w:val="true"/><w:kinsoku w:val="true"/><w:pageBreakBefore/></w:pPr>',
    );
  } finally {
    namespaces.dispose();
    dispose(owners);
  }
});
it("preserves the source outline clamp and unsupported vertical-alignment no-output domain", /** Native ushort constructors and source enum mappings, without a direction or version provider. @returns Completion. */ async () => {
  const owners = setup(),
    a = owners.output,
    serializer = a.GetSerializer();
  try {
    serializer.startElementNS(token("w"), token("pPr"));
    for (const value of [0, 1, 2, 3, 4, 5, 65535]) {
      const item = new SvxParaVertAlignItem(value, 1);
      try {
        a.ParaVerticalAlign(item);
      } finally {
        item.Dispose();
      }
    }
    for (const value of [0, 1, 9, 10, 65535]) {
      const item = new SfxUInt16Item(2, value);
      try {
        a.ParaOutlineLevel(item);
      } finally {
        item.Dispose();
      }
    }
    serializer.endElementNS(token("w"), token("pPr"));
    owners.exporter.dispose();
    owners.closed = true;
    const archive = await DocumentArchive.open(await owners.filter.commitStorage()),
      xml = await archive.readTextEntry("word/document.xml");
    expect(xml).toContain(
      '<w:pPr><w:textAlignment w:val="auto"/><w:textAlignment w:val="baseline"/><w:textAlignment w:val="top"/><w:textAlignment w:val="center"/><w:textAlignment w:val="bottom"/><w:outlineLvl w:val="9"/><w:outlineLvl w:val="0"/><w:outlineLvl w:val="8"/><w:outlineLvl w:val="8"/><w:outlineLvl w:val="8"/></w:pPr>',
    );
  } finally {
    dispose(owners);
  }
});
