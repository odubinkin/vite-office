/** @fileoverview WordprocessingDrawing floating raster import in the actual Writer header and Worker model. */
import { readFileSync } from "node:fs";
import { assert, expect, it, vi } from "vitest";
import { RelOrientation } from "../../../../offapi/com/sun/star/text/RelOrientation";
import { WrapTextMode } from "../../../../offapi/com/sun/star/text/WrapTextMode";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { VertOrientation } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { RndStdIds } from "../../../../svx/inc/swframetypes";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../../../package/source/zippackage/document-archive";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { importOOXML } from "../../writerfilter/filter/WriterFilter";
import { horizontalPosition, verticalPosition } from "../../writerfilter/dmapper/GraphicHelpers";
import type { SwDoc } from "../../core/doc/doc";

vi.setConfig({ testTimeout: 120_000 });

/** Adapts the upstream header layout fixture to a plain anchor instead of its enclosing shape. @param simple - Use page-relative simple coordinates. @returns DOCX and its unmodified embedded PNG. */
async function headerPicture(simple = false) {
  const source = new Uint8Array(
    readFileSync(
      "../../vendor/libreoffice-reference/sw/qa/extras/layout/data/testHeaderImageAlignment.docx",
    ),
  );
  const archive = await DocumentArchive.open(source);
  const writer = new DocumentArchiveWriter();
  const word = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
  const rel = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
  const drawing = "http://schemas.openxmlformats.org/drawingml/2006";
  const replacements: Readonly<Record<string, string>> = {
    "word/document.xml": `<w:document xmlns:w="${word}" xmlns:r="${rel}"><w:body><w:p><w:r><w:t>Body</w:t></w:r></w:p><w:sectPr><w:headerReference w:type="default" r:id="rId1"/></w:sectPr></w:body></w:document>`,
    "word/_rels/document.xml.rels": `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${rel}/header" Target="header1.xml"/></Relationships>`,
    "word/header1.xml": `<w:hdr xmlns:w="${word}" xmlns:r="${rel}" xmlns:wp="${drawing}/wordprocessingDrawing" xmlns:a="${drawing}/main" xmlns:pic="${drawing}/picture"><w:p><w:r><w:t>Header</w:t></w:r><w:r><w:drawing><wp:anchor simplePos="${simple ? 1 : 0}" behindDoc="1"><wp:simplePos x="127000" y="190500"/><wp:positionH relativeFrom="column"><wp:posOffset>-127000</wp:posOffset></wp:positionH><wp:positionV relativeFrom="paragraph"><wp:posOffset>190500</wp:posOffset></wp:positionV><wp:extent cx="635000" cy="317500"/>${simple ? "<wp:wrapTopAndBottom/>" : "<wp:wrapNone/>"}<wp:docPr id="1" name="Fixture"/><a:graphic><a:graphicData uri="${drawing}/picture"><pic:pic><pic:blipFill><a:blip r:embed="rId1"/></pic:blipFill></pic:pic></a:graphicData></a:graphic></wp:anchor></w:drawing></w:r></w:p></w:hdr>`,
  };
  const encoder = new TextEncoder();
  for (const part of archive.getEntryNames()) {
    const replacement = replacements[part];
    writer.putNextEntry(
      part,
      replacement === undefined ? await archive.readEntry(part) : encoder.encode(replacement),
    );
  }
  return { bytes: await writer.finish(), image: await archive.readEntry("word/media/image1.png") };
}

/** Verifies the source anchor, geometry and owned PNG in the actual document. @param doc - Actual Writer model. @param image - Expected native picture bytes. @returns Nothing. */
function expectHeaderGraphic(doc: SwDoc, image: Uint8Array): void {
  const header = doc.GetPageDesc().GetMaster().GetHeader().GetHeaderFormat();
  const start = header?.GetContent().GetContentIdx()?.GetNode();
  assert(start?.IsStartNode());
  const [paragraph] = doc.GetNodes().GetSectionContent(start);
  expect(paragraph?.GetTextNode()?.GetText()).toBe("Header");
  const [format] = [...doc.GetSpzFrameFormats()];
  assert(format);
  expect(format.GetAnchor().GetAnchorNode()).toBe(paragraph);
  expect(format.GetAnchor().GetAnchorId()).toBe(RndStdIds.FLY_AT_CHAR);
  expect(format.GetAnchor().GetAnchorContentOffset()).toBe(6);
  expect(format.GetHoriOrient().GetRelationOrient()).toBe(RelOrientation.FRAME);
  expect(format.GetHoriOrient().GetPos()).toBe(-200);
  expect(format.GetVertOrient().GetRelationOrient()).toBe(RelOrientation.FRAME);
  expect(format.GetVertOrient().GetPos()).toBe(300);
  expect(format.GetFrameSize().GetWidth()).toBe(1000);
  expect(format.GetFrameSize().GetHeight()).toBe(500);
  expect(format.GetSurround().GetSurround()).toBe(WrapTextMode.THROUGH);
  expect(format.GetOpaque().GetValue()).toBe(false);
  const fly = format.GetContent().GetContentIdx()?.GetNode();
  assert(fly);
  const graphic = doc
    .GetNodes()
    .at(fly.GetIndex() + 1)
    .GetGrfNode()
    ?.GetGraphic();
  expect(graphic?.mediaType).toBe("image/png");
  expect(graphic?.GetNativeData()).toEqual(image);
}

it("keeps a floating picture bound to its real header paragraph through the Worker graph", /** Tests a header and a picture using the same ID in distinct relationship parts. @returns Completion. */ async () => {
  const input = await headerPicture();
  const doc = await importOOXML(input.bytes, {});
  let worker: SwDoc | undefined;
  try {
    expectHeaderGraphic(doc, input.image);
    worker = decodeWriterDocument(structuredClone(encodeWriterDocument(doc)));
    expectHeaderGraphic(worker, input.image);
  } finally {
    worker?.Dispose();
    doc.Dispose();
  }
});

it("preserves source defaults and asymmetric line and margin alignment", /** Checks the original position resource conversions. @returns Nothing. */ () => {
  const horizontal = horizontalPosition({
    relativeFrom: "insideMargin",
    offset: 0,
    align: "right",
  });
  expect(horizontal.GetHoriOrient()).toBe(HoriOrientation.RIGHT);
  expect(horizontal.GetRelationOrient()).toBe(RelOrientation.PAGE_FRAME);
  expect(horizontal.IsPosToggle()).toBe(true);
  expect(horizontalPosition({ relativeFrom: "", offset: 0, align: "" }).GetHoriOrient()).toBe(
    HoriOrientation.NONE,
  );
  expect(verticalPosition({ relativeFrom: "line", offset: 0, align: "top" }).GetVertOrient()).toBe(
    VertOrientation.BOTTOM,
  );
  expect(
    verticalPosition({ relativeFrom: "line", offset: 0, align: "bottom" }).GetVertOrient(),
  ).toBe(VertOrientation.TOP);
  expect(
    verticalPosition({ relativeFrom: "line", offset: 0, align: "center" }).GetVertOrient(),
  ).toBe(VertOrientation.CENTER);
  expect(
    verticalPosition({ relativeFrom: "bottomMargin", offset: 0, align: "inside" }).GetVertOrient(),
  ).toBe(VertOrientation.TOP);
  expect(
    verticalPosition({ relativeFrom: "bottomMargin", offset: 0, align: "outside" }).GetVertOrient(),
  ).toBe(VertOrientation.BOTTOM);
  expect(
    verticalPosition({ relativeFrom: "bottomMargin", offset: 0, align: "" }).GetVertOrient(),
  ).toBe(VertOrientation.NONE);
  expect(verticalPosition({ relativeFrom: "", offset: 0, align: "" }).GetRelationOrient()).toBe(
    RelOrientation.FRAME,
  );
});

it("gives the anchor's simple position priority over relative axis values", /** Checks source page-relative placement and top-and-bottom wrap. @returns Completion. */ async () => {
  const doc = await importOOXML((await headerPicture(true)).bytes, {});
  try {
    const format = doc.GetSpzFrameFormats().GetFormat(0);
    expect(format.GetHoriOrient().GetRelationOrient()).toBe(RelOrientation.PAGE_FRAME);
    expect(format.GetHoriOrient().GetPos()).toBe(200);
    expect(format.GetVertOrient().GetRelationOrient()).toBe(RelOrientation.PAGE_FRAME);
    expect(format.GetVertOrient().GetPos()).toBe(300);
    expect(format.GetSurround().GetSurround()).toBe(WrapTextMode.NONE);
  } finally {
    doc.Dispose();
  }
});
