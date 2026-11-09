/** @fileoverview Source-backed RTF floating row position, actual fly conversion and Worker ownership. */
import { assert, expect, it } from "vitest";
import { XATTR_FILLTRANSPARENCE } from "../../../../svx/inc/xdef";
import { SvxBoxItemLine } from "../../../../editeng/source/items/frmitems";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { RelOrientation } from "../../../../offapi/com/sun/star/text/RelOrientation";
import { VertOrientation } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { RndStdIds } from "../../../../svx/inc/swframetypes";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import type { SwDoc } from "../../core/doc/doc";
import { SwTableNode } from "../../core/docnode/node";
import { RtfExport } from "../../filter/ww8/rtfexport";
import { readOdtDocument } from "../../filter/xml/swxml";
import { writeOdtDocument } from "../../filter/xml/wrtxml";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import { RtfDocumentImpl } from "./rtfdocumentimpl";

/** Reads original RTF through the native tokenizer and mapper. @param source - Actual RTF body. @returns Connected Writer document. */
function read(source: string): SwDoc {
  return new RtfDocumentImpl().ResolveBytes(new TextEncoder().encode(`{\\rtf1${source}}`));
}

it("moves positioned RTF table nodes into a native splittable fly and preserves them in Worker transfer", /** Checks owner, original anchor, typed geometry, margins, overlap and bookmark retention. @returns Nothing. */ () => {
  const source = read(
    String.raw` Before\par\trowd\tpvpg\tphmrg\tposx120\tposy240\tdfrmtxtLeft45\tdfrmtxtRight60\tdfrmtxtTop75\tdfrmtxtBottom90\tabsnoovrlp1` +
      String.raw`\cellx1800\intbl{\*\bkmkstart Cell}{\*\bkmkend Cell}Inside\cell\row\pard After\par`,
  );
  const worker = decodeWriterDocument(structuredClone(encodeWriterDocument(source)));
  try {
    for (const document of [source, worker]) {
      expect(document.GetTables()).toEqual([]);
      const [fly] = [...document.GetSpzFrameFormats()];
      const section = fly?.GetContent().GetContentIdx()?.GetNode();
      assert(fly && section?.IsStartNode());
      expect(fly.GetFlySplit().GetValue()).toBe(true);
      expect(fly.GetFollowTextFlow().GetValue()).toBe(false);
      expect(fly.GetWrapInfluenceOnObjPos().GetAllowOverlap()).toBe(false);
      expect(fly.GetHoriOrient().GetHoriOrient()).toBe(HoriOrientation.NONE);
      expect(fly.GetHoriOrient().GetRelationOrient()).toBe(RelOrientation.PAGE_PRINT_AREA);
      expect(fly.GetHoriOrient().GetPos()).toBe(120);
      expect(fly.GetVertOrient().GetVertOrient()).toBe(VertOrientation.NONE);
      expect(fly.GetVertOrient().GetRelationOrient()).toBe(RelOrientation.PAGE_FRAME);
      expect(fly.GetVertOrient().GetPos()).toBe(240);
      expect(fly.GetFrameSize().GetWidth()).toBe(1800);
      expect(fly.GetBox().GetLine(SvxBoxItemLine.LEFT)).toBeUndefined();
      expect(fly.GetAttrSet().Get(XATTR_FILLTRANSPARENCE).QueryValue()).toBe(100);
      expect(fly.GetLRSpace().ResolveLeft()).toBe(45);
      expect(fly.GetLRSpace().ResolveRight()).toBe(60);
      expect(fly.GetULSpace().GetUpper()).toBe(75);
      expect(fly.GetULSpace().GetLower()).toBe(90);
      expect(fly.GetAnchor().GetAnchorId()).toBe(RndStdIds.FLY_AT_PARA);
      expect(fly.GetAnchor().GetAnchorNode()?.GetTextNode()?.GetText()).toBe("After");
      const content = document.nodes.GetSectionContent(section);
      expect(content).toHaveLength(1);
      const table = content[0];
      assert(table instanceof SwTableNode);
      expect(table.GetFlyFormat()).toBe(fly);
      const cell = table.GetTable().GetTabLines()[0]?.GetTabBoxes()[0]?.GetParagraphs()[0];
      expect(cell?.GetText()).toBe("Inside");
      expect(document.GetIDocumentMarkAccess().GetBookmarks()[0]?.GetMarkPos().GetNode()).toBe(
        cell,
      );
    }
  } finally {
    worker.Dispose();
    source.Dispose();
  }
});

it("round trips the original floating row controls through ODT storage and RTF export", /** Checks file bytes, positioning policy and table content after reopening. @returns Completion. */ async () => {
  const source = read(
    String.raw`Before\par\trowd\tpvpara\tphcol\tposxr\tposyb\tdfrmtxtLeft80\tdfrmtxtTop100\tabsnoovrlp\cellx2400\intbl Inside\cell\row\pard After`,
  );
  const metadata = { title: "Floating RTF" };
  let odt: SwDoc | undefined, rtf: SwDoc | undefined;
  try {
    const odtBytes = writeOdtDocument(source, metadata);
    const xml = await new ZipFile(odtBytes).readTextEntry("content.xml");
    expect(xml).toContain('loext:may-break-between-pages="true"');
    expect(xml).toContain('loext:allow-overlap="false"');
    expect(xml).toContain('draw:opacity="0%"');
    expect(xml).toContain('fo:border-left="none"');
    odt = (await readOdtDocument(odtBytes, metadata)).document;
    const savedFly = odt.GetSpzFrameFormats().GetFormat(0);
    expect(savedFly.GetBox().GetLine(SvxBoxItemLine.LEFT)).toBeUndefined();
    expect(savedFly.GetAttrSet().Get(XATTR_FILLTRANSPARENCE).QueryValue()).toBe(100);
    const bytes = RtfExport.WriteDocument(odt);
    const output = new TextDecoder().decode(bytes);
    expect(output).toContain(String.raw`\tpvpara\tphcol\tposxr\tposyb`);
    expect(output).toContain(
      String.raw`\tdfrmtxtTop100\tdfrmtxtBottom0\tdfrmtxtLeft80\tdfrmtxtRight0\tabsnoovrlp1`,
    );
    expect(output.indexOf("Inside")).toBeLessThan(output.lastIndexOf("After"));
    rtf = new RtfDocumentImpl().ResolveBytes(bytes);
    const fly = rtf.GetSpzFrameFormats().GetFormat(0);
    expect(fly.GetFlySplit().GetValue()).toBe(true);
    expect(fly.GetHoriOrient().GetHoriOrient()).toBe(HoriOrientation.RIGHT);
    expect(fly.GetVertOrient().GetVertOrient()).toBe(VertOrientation.BOTTOM);
    expect(fly.GetWrapInfluenceOnObjPos().GetAllowOverlap()).toBe(false);
    expect(fly.GetAnchor().GetAnchorNode()?.GetTextNode()?.GetText()).toBe("After");
    const start = fly.GetContent().GetContentIdx()?.GetNode();
    assert(start?.IsStartNode());
    const [table] = rtf.nodes.GetSectionContent(start);
    assert(table instanceof SwTableNode);
    expect(table.GetTable().GetTabLines()[0]?.GetTabBoxes()[0]?.GetParagraphs()[0]?.GetText()).toBe(
      "Inside",
    );
  } finally {
    rtf?.Dispose();
    odt?.Dispose();
    source.Dispose();
  }
});

it("splits RTF rows when native positions differ and uses the last equivalent row's margins", /** Checks the original TablePositionHandler comparison and unpositioned transition. @returns Nothing. */ () => {
  const doc = read(
    String.raw`\trowd\tposx100\tdfrmtxtLeft30\cellx1000\intbl a\cell\row` +
      String.raw`\trowd\tposx100\tdfrmtxtLeft40\cellx1000\intbl b\cell\row` +
      String.raw`\trowd\tposx200\cellx1000\intbl c\cell\row` +
      String.raw`\trowd\cellx1000\intbl d\cell\row\pard Tail`,
  );
  try {
    expect(doc.GetTables()).toHaveLength(1);
    expect(
      doc.GetTables()[0]?.GetTabLines()[0]?.GetTabBoxes()[0]?.GetParagraphs()[0]?.GetText(),
    ).toBe("d");
    const [first, second] = [...doc.GetSpzFrameFormats()];
    expect(doc.GetSpzFrameFormats().size()).toBe(2);
    expect(first?.GetHoriOrient().GetPos()).toBe(100);
    expect(first?.GetLRSpace().ResolveLeft()).toBe(40);
    expect(second?.GetHoriOrient().GetPos()).toBe(200);
    const start = first?.GetContent().GetContentIdx()?.GetNode();
    assert(start?.IsStartNode());
    const [table] = doc.nodes.GetSectionContent(start);
    assert(table instanceof SwTableNode);
    expect(table.GetTable().GetTabLines()).toHaveLength(2);
  } finally {
    doc.Dispose();
  }
});

it("retains the source asymmetry for exported left and top position words", /** These registered flags leave the imported position specs unset. @returns Nothing. */ () => {
  const doc = read(
    String.raw`\trowd\tphcol\tpvpara\tposxl\tposyt\cellx1000\intbl One\cell\row\pard Tail`,
  );
  try {
    const fly = doc.GetSpzFrameFormats().GetFormat(0);
    expect(fly.GetHoriOrient().GetHoriOrient()).toBe(HoriOrientation.NONE);
    expect(fly.GetVertOrient().GetVertOrient()).toBe(VertOrientation.NONE);
  } finally {
    doc.Dispose();
  }
});

it("subtracts the original floating-table padding and half the cell border once each", /** Verifies the native horizontal shift before adjusted content margins. @returns Nothing. */ () => {
  const doc = read(
    String.raw`\trowd\tphmrg\tpvmrg\tposx300\trgaph20\clbrdrl\brdrs\brdrw100\cellx1500\intbl Cell\cell\row\pard Tail`,
  );
  try {
    const fly = doc.GetSpzFrameFormats().GetFormat(0);
    expect(fly.GetHoriOrient().GetPos()).toBe(230);
  } finally {
    doc.Dispose();
  }
});
