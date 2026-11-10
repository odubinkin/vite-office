/** @fileoverview Native RTF shape text, anchor offsets, and independent table append contexts. */
import { existsSync, readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { SvxFrameDirection } from "../../../../editeng/inc/frmdir";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { XATTR_FILLCOLOR } from "../../../../svx/inc/xdef";
import type { XFillColorItem } from "../../../../svx/inc/xflclit";
import { SvxBoxItem, SvxBoxItemLine } from "../../../../editeng/source/items/frmitems";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { RelOrientation } from "../../../../offapi/com/sun/star/text/RelOrientation";
import { VertOrientation } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { WrapTextMode } from "../../../../offapi/com/sun/star/text/WrapTextMode";
import { RndStdIds } from "../../../../svx/inc/swframetypes";
import type { SwDoc } from "../../core/doc/doc";
import { SwTableNode } from "../../core/docnode/node";
import { SwFrameSize } from "../../../inc/fmtfsize";
import { RES_BOX, RES_BREAK } from "../../../inc/hintids";
import type { SfxInt16Item } from "../../../../svl/inc/intitem";
import { RtfExport } from "../../filter/ww8/rtfexport";
import { readOdtDocument } from "../../filter/xml/swxml";
import { writeOdtDocument } from "../../filter/xml/wrtxml";
import { RtfDocumentImpl } from "./rtfdocumentimpl";

/** Reads the actual RTF stream. @param source - Full RTF source. @returns Native Writer model. */
function read(source: string): SwDoc {
  return new RtfDocumentImpl().ResolveBytes(new TextEncoder().encode(source));
}

it("attaches an ordinary RTF shape to the source character position and round trips its text and table", /** Verifies native shape content, ODT persistence and subsequent RTF read/write. @returns Completion. */ async () => {
  const document = read(
    String.raw`{\rtf1 Before{\shp{\*\shpinst\shpleft-120\shptop240\shpright1080\shpbottom840\shpwr2\shpwrk3\shpbypage` +
      String.raw`{\sp{\sn shapeType}{\sv 202}}{\sp{\sn posh}{\sv 3}}{\sp{\sn posv}{\sv 1}}{\sp{\sn pctHoriz}{\sv 400}}{\sp{\sn sizerelh}{\sv 0}}` +
      String.raw`{\sp{\sn pctVert}{\sv 750}}{\sp{\sn sizerelv}{\sv 1}}{\sp{\sn txflTextFlow}{\sv 2}}{\sp{\sn fLine}{\sv 0}}{\sp{\sn dxWrapDistLeft}{\sv 25400}}{\sp{\sn dxTextLeft}{\sv 635}}` +
      String.raw`{\shptxt\pard First\par\trowd\tposx120\cellx800\pard\intbl{\*\bkmkstart InBox}{\*\bkmkend InBox}Cell\cell\row\pard Last\par}\par}}` +
      String.raw`After\par}`,
  );
  let reopened: SwDoc | undefined, restored: SwDoc | undefined, worker: SwDoc | undefined;
  try {
    const frame = document.GetSpzFrameFormats().GetFormat(0);
    expect(frame.GetAnchor().GetAnchorId()).toBe(RndStdIds.FLY_AT_CHAR);
    expect(frame.GetAnchor().GetAnchorContentOffset()).toBe(6);
    expect(frame.GetAnchor().GetAnchorNode()?.GetTextNode()?.GetText()).toBe("BeforeAfter");
    expect(frame.GetHoriOrient().GetHoriOrient()).toBe(HoriOrientation.RIGHT);
    expect(frame.GetHoriOrient().GetPos()).toBe(-120);
    expect(frame.GetVertOrient().GetVertOrient()).toBe(VertOrientation.TOP);
    expect(frame.GetVertOrient().GetRelationOrient()).toBe(RelOrientation.PAGE_FRAME);
    expect(frame.GetSurround().GetSurround()).toBe(WrapTextMode.PARALLEL);
    expect(frame.GetLRSpace().ResolveLeft()).toBe(40);
    expect(frame.GetBox().GetDistance(SvxBoxItemLine.LEFT)).toBe(144);
    expect(frame.GetBox().GetLine(SvxBoxItemLine.LEFT)).toBeUndefined();
    worker = decodeWriterDocument(structuredClone(encodeWriterDocument(document)));
    const metadata = { title: "Shape text" };
    reopened = (await readOdtDocument(writeOdtDocument(document, metadata), metadata)).document;
    const rtf = RtfExport.WriteDocument(reopened);
    const output = new TextDecoder().decode(rtf);
    expect(output).toContain(String.raw`{\sp{\sn shapeType}{\sv 202}}`);
    expect(output).toContain(String.raw`{\sp{\sn pctHoriz}{\sv 400}}{\sp{\sn sizerelh}{\sv 0}}`);
    expect(output).toContain(String.raw`{\sp{\sn pctVert}{\sv 750}}{\sp{\sn sizerelv}{\sv 1}}`);
    expect(output).toContain(String.raw`{\sp{\sn txflTextFlow}{\sv 2}}`);
    expect(output).not.toContain(String.raw`\tposx120`);
    restored = new RtfDocumentImpl().ResolveBytes(rtf);
    for (const result of [document, reopened, restored, worker]) {
      expect(result.GetTables()).toHaveLength(0);
      expect(result.GetSpzFrameFormats().size()).toBe(1);
      const box = result.GetSpzFrameFormats().GetFormat(0);
      expect(box.GetFrameDir().GetValue()).toBe(SvxFrameDirection.Vertical_LR_BT);
      expect(box.GetFrameSize().GetHeightPercentRelation()).toBe(RelOrientation.PAGE_FRAME);
      const section = box.GetContent().GetContentIdx()?.GetNode();
      assert(section?.IsStartNode());
      const [first, table, last] = result.nodes.GetSectionContent(section);
      assert(table instanceof SwTableNode);
      expect(first?.GetTextNode()?.GetText()).toBe("First");
      expect(last?.GetTextNode()?.GetText()).toBe("Last");
      const cell = table.GetTable().GetTabLines()[0]?.GetTabBoxes()[0]?.GetParagraphs()[0];
      expect(cell?.GetText()).toBe("Cell");
      expect(result.GetIDocumentMarkAccess().GetBookmarks()[0]?.GetMarkPos().GetNode()).toBe(cell);
      expect(box.GetAnchor().GetAnchorContentOffset()).toBe(6);
    }
  } finally {
    restored?.Dispose();
    reopened?.Dispose();
    worker?.Dispose();
    document.Dispose();
  }
});

it("keeps an ordinary text frame inside the current table cell and resumes the enclosing row", /** Exercises a nested append context and the late OfficeArt properties used by Word. @returns Nothing. */ () => {
  const document = read(
    String.raw`{\rtf1\trowd\cellx900\cellx1800\pard\intbl Left{\shp{\*\shpinst\shpright420\shpbottom600` +
      String.raw`{\shptxt\pard\plain Box}{\sp{\sn fFitShapeToText}{\sv 1}}{\sp{\sn posh}{\sv 2}}}}Tail\cell Right\cell\row\pard Body}`,
  );
  let reopened: SwDoc | undefined;
  try {
    const [left, right] = document.GetTables()[0]?.GetTabLines()[0]?.GetTabBoxes() ?? [];
    const owner = left?.GetParagraphs()[0];
    const frame = document.GetSpzFrameFormats().GetFormat(0);
    expect(owner?.GetText()).toBe("LeftTail");
    expect(right?.GetParagraphs()[0]?.GetText()).toBe("Right");
    expect(frame.GetAnchor().GetAnchorNode()?.GetTextNode()).toBe(owner);
    expect(frame.GetAnchor().GetAnchorContentOffset()).toBe(4);
    expect(frame.GetHoriOrient().GetHoriOrient()).toBe(HoriOrientation.CENTER);
    expect(frame.GetFrameSize().GetHeightSizeType()).toBe(SwFrameSize.Minimum);
    reopened = new RtfDocumentImpl().ResolveBytes(RtfExport.WriteDocument(document));
    expect(reopened.GetSpzFrameFormats().GetFormat(0).GetFrameSize().GetHeightSizeType()).toBe(
      SwFrameSize.Fixed,
    );
    const start = frame.GetContent().GetContentIdx()?.GetNode();
    assert(start?.IsStartNode());
    expect(document.nodes.GetSectionContent(start)[0]?.GetTextNode()?.GetText()).toBe("Box");
  } finally {
    reopened?.Dispose();
    document.Dispose();
  }
});

const fixtureDirectory = "../../vendor/libreoffice-reference/sw/qa/extras/rtfexport/data/";
it.skipIf(!existsSync(fixtureDirectory))(
  "reads and reopens the pinned LibreOffice textframe-table fixture",
  /** Mirrors testTextFrameTable's structural assertions over real frame content. @returns Nothing. */
  () => {
    const source = new RtfDocumentImpl().ResolveBytes(
      readFileSync(fixtureDirectory + "textframe-table.rtf"),
    );
    let restored: SwDoc | undefined;
    try {
      restored = new RtfDocumentImpl().ResolveBytes(RtfExport.WriteDocument(source));
      for (const doc of [source, restored]) {
        const frame = doc.GetSpzFrameFormats().GetFormat(0);
        const start = frame.GetContent().GetContentIdx()?.GetNode();
        assert(start?.IsStartNode());
        const [first, table, last] = doc.nodes.GetSectionContent(start);
        assert(table instanceof SwTableNode);
        expect(first?.GetTextNode()?.GetText()).toBe("First para.");
        expect(last?.GetTextNode()?.GetText()).toBe("Last para.");
        const [left, right] = table.GetTable().GetTabLines()[0]?.GetTabBoxes() ?? [];
        expect(left?.GetParagraphs()[0]?.GetText()).toBe("A");
        expect(right?.GetParagraphs()[0]?.GetText()).toBe("B");
      }
    } finally {
      restored?.Dispose();
      source.Dispose();
    }
  },
);

it.skipIf(!existsSync(fixtureDirectory))(
  "reads the pinned text-frame fixture's native solid fill and four borders",
  /** Verifies the represented attributes from LibreOffice testTextFrameBorders through save and reopen. @returns Nothing. */
  () => {
    const source = new RtfDocumentImpl().ResolveBytes(
      readFileSync(fixtureDirectory + "textframe-borders.rtf"),
    );
    let restored: SwDoc | undefined;
    try {
      restored = new RtfDocumentImpl().ResolveBytes(RtfExport.WriteDocument(source));
      for (const doc of [source, restored]) {
        const frame = doc.GetSpzFrameFormats().GetFormat(0);
        const color = frame.GetAttrSet().Get(XATTR_FILLCOLOR) as XFillColorItem;
        expect(color.GetColorValue().toUInt32()).toBe(0xd99594);
        for (const edge of [
          SvxBoxItemLine.TOP,
          SvxBoxItemLine.BOTTOM,
          SvxBoxItemLine.LEFT,
          SvxBoxItemLine.RIGHT,
        ]) {
          const line = frame.GetBox().GetLine(edge);
          expect(line?.GetColor().toUInt32()).toBe(0xc0504d);
          expect(line?.GetWidth()).toBe(20);
        }
      }
    } finally {
      restored?.Dispose();
      source.Dispose();
    }
  },
);

it("converts contiguous legacy RTF frame paragraphs into one native fly and keeps their marks", /** Exercises ABSW, ABSH, anchor, wrap, position and native node movement. @returns Nothing. */ () => {
  const source = read(
    String.raw`{\rtf1 Before\par\pard\absw1800\absh-600\phcol\pvpg\posx250\posy299\wraparound\dfrmtxtx70\dfrmtxty30` +
      String.raw`First{\*\bkmkstart Inside}{\*\bkmkend Inside}\par Second\par\pard After\par}`,
  );
  let reopened: SwDoc | undefined;
  try {
    expect(
      source.paragraphs.map(
        /** Reads remaining body paragraphs. @param node - Native owner. @returns Text. */
        (node) => node.GetText(),
      ),
    ).toEqual(["Before", "After"]);
    expect(source.GetSpzFrameFormats().size()).toBe(1);
    const frame = source.GetSpzFrameFormats().GetFormat(0);
    expect(frame.GetAnchor().GetAnchorId()).toBe(RndStdIds.FLY_AT_PARA);
    expect(frame.GetAnchor().GetAnchorNode()).toBe(source.paragraphs[1]);
    expect(frame.GetFrameSize().GetWidth()).toBe(1800);
    expect(frame.GetFrameSize().GetHeight()).toBe(600);
    expect(frame.GetFrameSize().GetHeightSizeType()).toBe(SwFrameSize.Fixed);
    expect(frame.GetHoriOrient().GetPos()).toBe(250);
    expect(frame.GetVertOrient().GetPos()).toBe(300);
    expect(frame.GetVertOrient().GetRelationOrient()).toBe(RelOrientation.PAGE_FRAME);
    expect(frame.GetSurround().GetSurround()).toBe(WrapTextMode.PARALLEL);
    expect(frame.GetLRSpace().ResolveLeft()).toBe(70);
    expect(frame.GetULSpace().GetUpper()).toBe(30);
    reopened = new RtfDocumentImpl().ResolveBytes(RtfExport.WriteDocument(source));
    for (const doc of [source, reopened]) {
      const start = doc.GetSpzFrameFormats().GetFormat(0).GetContent().GetContentIdx()?.GetNode();
      assert(start?.IsStartNode());
      const [first, second] = doc.nodes.GetSectionContent(start);
      expect(first?.GetTextNode()?.GetText()).toBe("First");
      expect(second?.GetTextNode()?.GetText()).toBe("Second");
      const mark = doc.GetIDocumentMarkAccess().GetBookmarks()[0];
      expect(mark?.GetMarkPos().GetNode()).toBe(first);
      expect(mark?.GetMarkPos().GetContentIndex()).toBe(5);
    }
  } finally {
    reopened?.Dispose();
    source.Dispose();
  }
});

it("keeps legacy frame defaults and in-cell numeric sizing from creating a text fly", /** Mirrors the original frame-trigger exclusions and table guard. @returns Nothing. */ () => {
  const doc = read(
    String.raw`{\rtf1\pard\dxfrtext120\dfrmtxtx60\dfrmtxty80\wrapdefault\posxl\phcol\posyil\pvmrg Body\par` +
      String.raw`\trowd\cellx1800\pard\intbl\absw1400\absh600\posx200\posy100 Cell\cell\row\pard Tail}`,
  );
  try {
    expect(doc.GetSpzFrameFormats().size()).toBe(0);
    expect(doc.paragraphs[0]?.GetText()).toBe("Body");
    expect(
      doc.GetTables()[0]?.GetTabLines()[0]?.GetTabBoxes()[0]?.GetParagraphs()[0]?.GetText(),
    ).toBe("Cell");
  } finally {
    doc.Dispose();
  }
});

it.skipIf(!existsSync(fixtureDirectory))(
  "keeps the pinned page-break-in-frame case on the original body paragraph",
  /** Runs the actual LibreOffice regression fixture through the frame and section parser. @returns Nothing. */
  () => {
    const doc = new RtfDocumentImpl().ResolveBytes(
      readFileSync(fixtureDirectory + "tdf158586_pageBreak0.rtf"),
    );
    try {
      expect(doc.GetSpzFrameFormats().size()).toBe(1);
      expect(doc.paragraphs).toHaveLength(1);
      expect(doc.paragraphs[0]?.GetText()).toBe("First page");
      expect(doc.GetSpzFrameFormats().GetFormat(0).GetAnchor().GetAnchorNode()).toBe(
        doc.paragraphs[0],
      );
    } finally {
      doc.Dispose();
    }
  },
);

it("moves legacy frame borders while keeping paragraph distances and an explicit page break outside", /** Checks the original two-PAR guard and border conversion. @returns Nothing. */ () => {
  const doc = read(
    String.raw`{\rtf1 Before\par\pard\absw1200\pagebb\brdrt\brdrs\brdrw15\brsp80 Inside\par\pard Tail}`,
  );
  try {
    const frame = doc.GetSpzFrameFormats().GetFormat(0);
    const start = frame.GetContent().GetContentIdx()?.GetNode();
    assert(start?.IsStartNode());
    const content = doc.nodes.GetSectionContent(start)[0]?.GetTextNode();
    assert(content);
    expect(content.GetText()).toBe("Inside");
    expect((content.GetAttr(RES_BOX) as SvxBoxItem).GetLine(SvxBoxItemLine.TOP)).toBeUndefined();
    expect((content.GetAttr(RES_BOX) as SvxBoxItem).GetDistance(SvxBoxItemLine.TOP)).toBe(80);
    expect(frame.GetBox().GetLine(SvxBoxItemLine.TOP)?.GetWidth()).toBe(15);
    expect(frame.GetBox().GetDistance(SvxBoxItemLine.TOP)).toBe(0);
    expect(frame.GetFrameSize().GetWidth()).toBe(1200);
    expect(
      doc.paragraphs.map(
        /** Reads body text outside the fly. @param node - Actual paragraph. @returns Native text. */
        (node) => node.GetText(),
      ),
    ).toEqual(["Before", "", "", "Tail"]);
    expect((doc.paragraphs[2]?.GetAttr(RES_BREAK) as SfxInt16Item).GetValue()).toBe(4);
    expect((content.GetAttr(RES_BREAK) as SfxInt16Item).GetValue()).toBe(0);
  } finally {
    doc.Dispose();
  }
});

it.skipIf(!existsSync(fixtureDirectory))(
  "restores packed legacy fly orientation from the pinned group destination",
  /** Tests the native FLYMAINCNT closure and PAGE_FRAME relations from fdo30983. @returns Nothing. */
  () => {
    const doc = new RtfDocumentImpl().ResolveBytes(readFileSync(fixtureDirectory + "fdo30983.rtf"));
    try {
      const frame = doc.GetSpzFrameFormats().GetFormat(0);
      expect(frame.GetHoriOrient().GetRelationOrient()).toBe(RelOrientation.PAGE_FRAME);
      expect(frame.GetVertOrient().GetRelationOrient()).toBe(RelOrientation.PAGE_FRAME);
    } finally {
      doc.Dispose();
    }
  },
);

it("keeps a legacy paragraph frame inside the surrounding shape text scope", /** Verifies nested ownership through native RTF export. @returns Nothing. */ () => {
  const doc = read(
    String.raw`{\rtf1 Before{\shp{\*\shpinst\shpright1700\shpbottom800{\sp{\sn shapeType}{\sv 202}}` +
      String.raw`{\shptxt\pard Outer\par\pard\absw800 Inner\par\pard Anchor\par}}}After}`,
  );
  let reopened: SwDoc | undefined;
  try {
    reopened = new RtfDocumentImpl().ResolveBytes(RtfExport.WriteDocument(doc));
    for (const result of [doc, reopened]) {
      expect(result.GetSpzFrameFormats().size()).toBe(2);
      const outer = result.GetSpzFrameFormats().GetFormat(0);
      const inner = result.GetSpzFrameFormats().GetFormat(1);
      const start = outer.GetContent().GetContentIdx()?.GetNode();
      assert(start?.IsStartNode());
      const [first, anchor] = result.nodes.GetSectionContent(start);
      expect(first?.GetTextNode()?.GetText()).toBe("Outer");
      expect(anchor?.GetTextNode()?.GetText()).toBe("Anchor");
      expect(inner.GetAnchor().GetAnchorNode()).toBe(anchor);
      const innerStart = inner.GetContent().GetContentIdx()?.GetNode();
      assert(innerStart?.IsStartNode());
      expect(result.nodes.GetSectionContent(innerStart)[0]?.GetTextNode()?.GetText()).toBe("Inner");
      expect(result.paragraphs[0]?.GetText()).toBe("BeforeAfter");
    }
  } finally {
    reopened?.Dispose();
    doc.Dispose();
  }
});
