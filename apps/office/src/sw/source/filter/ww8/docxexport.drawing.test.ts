/** @fileoverview WordprocessingDrawing floating raster import in the actual Writer header and Worker model. */
import { readFileSync } from "node:fs";
import { assert, expect, it, vi } from "vitest";
import { RelOrientation } from "../../../../offapi/com/sun/star/text/RelOrientation";
import { WrapTextMode } from "../../../../offapi/com/sun/star/text/WrapTextMode";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { VertOrientation } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SwFormatSurround } from "../../../inc/fmtsrnd";
import { SwFormatAnchor } from "../../../inc/fmtanchr";
import { SwFormatHoriOrient, SwFormatVertOrient } from "../../../inc/fmtornt";
import { aFrameFormatSetRange } from "../../core/bastyp/init";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { RndStdIds } from "../../../../svx/inc/swframetypes";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../../../package/source/zippackage/document-archive";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { readOdtDocument } from "../xml/swxml";
import { writeOdtDocument, writeOdtXml } from "../xml/wrtxml";
import { DocxExport } from "./docxexport";
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
  expect(format.GetLRSpace().ResolveLeft()).toBe(0);
  expect(format.GetLRSpace().ResolveRight()).toBe(0);
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
    expect(format.GetLRSpace().ResolveLeft()).toBe(181);
    expect(format.GetLRSpace().ResolveRight()).toBe(181);
  } finally {
    doc.Dispose();
  }
});

it("writes the floating PNG to a part owned by its real DOCX story", /** Checks the Worker, ZIP bytes, part-local image relationship and exact reopened picture. @returns Completion. */ async () => {
  const input = await headerPicture();
  const imported = await importOOXML(input.bytes, {});
  let worker: SwDoc | undefined;
  let reopened: SwDoc | undefined;
  try {
    worker = decodeWriterDocument(structuredClone(encodeWriterDocument(imported)));
    const exported = await DocxExport.WriteDocument(worker);
    const archive = await DocumentArchive.open(exported);
    const header = await archive.readTextEntry("word/header1.xml");
    const rels = await archive.readTextEntry("word/_rels/header1.xml.rels");
    expect(header).toContain('<wp:extent cx="635000" cy="317500"/>');
    expect(header).toContain(
      '<wp:positionH relativeFrom="column"><wp:posOffset>-127000</wp:posOffset>',
    );
    expect(header).toContain(
      '<wp:positionV relativeFrom="paragraph"><wp:posOffset>190500</wp:posOffset>',
    );
    expect(header).toContain("<wp:wrapNone/>");
    expect(header).toContain('<a:blip r:embed="rId1"/>');
    expect(rels).toContain('Target="media/image1.png"');
    expect(await archive.readEntry("word/media/image1.png")).toEqual(input.image);
    expect(await archive.readTextEntry("word/document.xml")).not.toContain("<w:drawing>");
    const contentTypes = await archive.readTextEntry("[Content_Types].xml");
    expect(contentTypes).toContain('ContentType="image/png"');
    reopened = await importOOXML(exported, {});
    expectHeaderGraphic(reopened, input.image);
  } finally {
    reopened?.Dispose();
    worker?.Dispose();
    imported.Dispose();
  }
});

it("reuses one encoded asset across separately owned body and header relationships", /** Checks a character-boundary run, line-relative sign and unique drawing IDs across stories. @returns Completion. */ async () => {
  const input = await headerPicture();
  const doc = await importOOXML(input.bytes, {});
  let reopened: SwDoc | undefined;
  const attributes = new SfxItemSet(doc.GetAttrPool(), aFrameFormatSetRange);
  const anchor = new SwFormatAnchor(RndStdIds.FLY_AT_CHAR);
  try {
    const header = doc.GetSpzFrameFormats().GetFormat(0);
    const node = doc.paragraphs[0];
    const content = header.GetContent().GetContentIdx()?.GetNode();
    assert(node && content);
    const graphic = doc
      .GetNodes()
      .at(content.GetIndex() + 1)
      .GetGrfNode()
      ?.GetGraphic();
    assert(graphic);
    attributes.Put(anchor);
    attributes.Put(header.GetFrameSize());
    attributes.Put(header.GetSurround());
    attributes.Put(new SwFormatVertOrient(-300, VertOrientation.NONE, RelOrientation.TEXT_LINE));
    const position = new SwPosition(node, 2);
    const cursor = new SwPaM(position);
    try {
      doc.GetDocumentContentOperationsManager().InsertGraphic(cursor, graphic, attributes);
    } finally {
      cursor.Dispose();
      position.Dispose();
    }

    const exported = await DocxExport.WriteDocument(doc);
    const archive = await DocumentArchive.open(exported);
    const main = await archive.readTextEntry("word/document.xml");
    const story = await archive.readTextEntry("word/header1.xml");
    expect(main).toMatch(/>Bo<\/w:t><\/w:r><w:r><w:drawing>.*?<\/w:drawing><\/w:r><w:r><w:t>dy</su);
    expect(main).toContain('<wp:positionV relativeFrom="line"><wp:posOffset>190500</wp:posOffset>');
    expect(main.match(/<wp:docPr id="(\d+)"/u)?.[1]).not.toBe(
      story.match(/<wp:docPr id="(\d+)"/u)?.[1],
    );
    expect(await archive.readTextEntry("word/_rels/document.xml.rels")).toContain(
      'Target="media/image1.png"',
    );
    expect(await archive.readTextEntry("word/_rels/header1.xml.rels")).toContain(
      'Target="media/image1.png"',
    );
    expect(
      archive.getEntryNames().filter(
        /** Checks the native media part count. @param path - ZIP entry. @returns Whether a media part. */
        (path) => path.startsWith("word/media/"),
      ),
    ).toEqual(["word/media/image1.png"]);
    reopened = await importOOXML(exported, {});
    const body = [...reopened.GetSpzFrameFormats()].find(
      /** Selects the real body anchor after reimport. @param frame - Floating picture. @returns Whether it belongs to the body. */
      (frame) => frame.GetAnchor().GetAnchorNode() === reopened?.paragraphs[0],
    );
    expect(body?.GetAnchor().GetAnchorContentOffset()).toBe(2);
    expect(body?.GetVertOrient().GetPos()).toBe(-300);
    const snapshot = writeOdtXml(doc, { title: "Two picture anchors" });
    const pictureFiles = Object.keys(snapshot.files).filter(
      /** Selects the packaged raster payloads. @param path - Package stream. @returns Whether a picture. */
      (path) => path.startsWith("Pictures/"),
    );
    expect(pictureFiles).toHaveLength(1);
    expect(snapshot.files["styles.xml"]).toContain("<draw:image ");
    expect(snapshot.files["content.xml"]).toContain("<draw:image ");
    const local = (await readOdtDocument(snapshot, { title: "Two picture anchors" })).document;
    try {
      const localBody = [...local.GetSpzFrameFormats()].find(
        /** Selects the local body owner after the XML snapshot reopens. @param frame - Restored native frame. @returns Whether anchored in body. */
        (frame) => frame.GetAnchor().GetAnchorNode() === local.paragraphs[0],
      );
      expect(localBody?.GetAnchor().GetAnchorContentOffset()).toBe(2);
      expect(localBody?.GetVertOrient().GetPos()).toBe(-300);
      expect([...local.GetSpzFrameFormats()]).toHaveLength(2);
    } finally {
      local.Dispose();
    }
  } finally {
    anchor.Dispose();
    attributes.Dispose();
    reopened?.Dispose();
    doc.Dispose();
  }
});

it("writes mirrored alignment and the native zero-offset correction for a top-and-bottom picture", /** Checks Word-specific placement and explicit unsupported wrapping handling. @returns Completion. */ async () => {
  const doc = await importOOXML((await headerPicture(true)).bytes, {});
  try {
    const format = doc.GetSpzFrameFormats().GetFormat(0);
    format.SetFormatAttr(
      new SwFormatHoriOrient(0, HoriOrientation.LEFT, RelOrientation.PAGE_FRAME, true),
    );
    format.SetFormatAttr(new SwFormatVertOrient(0, VertOrientation.TOP, RelOrientation.FRAME));
    const first = await DocumentArchive.open(await DocxExport.WriteDocument(doc));
    const header = await first.readTextEntry("word/header1.xml");
    expect(header).toContain('<wp:positionH relativeFrom="page"><wp:align>inside</wp:align>');
    expect(header).toContain(
      '<wp:positionV relativeFrom="paragraph"><wp:posOffset>635</wp:posOffset>',
    );
    expect(header).toContain("<wp:wrapTopAndBottom/>");

    format.SetFormatAttr(
      new SwFormatHoriOrient(0, HoriOrientation.RIGHT, RelOrientation.PAGE_FRAME, true),
    );
    format.SetFormatAttr(
      new SwFormatVertOrient(-10, VertOrientation.BOTTOM, RelOrientation.TEXT_LINE),
    );
    const second = await DocumentArchive.open(await DocxExport.WriteDocument(doc));
    const mirrored = await second.readTextEntry("word/header1.xml");
    expect(mirrored).toContain('<wp:positionH relativeFrom="page"><wp:align>outside</wp:align>');
    expect(mirrored).toContain('<wp:positionV relativeFrom="line"><wp:align>top</wp:align>');
    const surround = new SwFormatSurround(WrapTextMode.PARALLEL);
    surround.SetContour(true);
    format.SetFormatAttr(surround);
    surround.Dispose();
    await expect(DocxExport.WriteDocument(doc)).rejects.toThrow(
      "Writer cannot export this DOCX picture wrapping contour.",
    );
  } finally {
    doc.Dispose();
  }
});

it("retains the header picture in the local ODT and across a subsequent DOCX export", /** Covers browser XML snapshots, actual ODT packages and a final DOCX round trip. @returns Completion. */ async () => {
  const input = await headerPicture();
  const doc = await importOOXML(input.bytes, {});
  const metadata = { title: "Embedded picture" };
  const imported: SwDoc[] = [];
  try {
    const snapshot = writeOdtXml(doc, metadata);
    const odt = await writeOdtDocument(doc, metadata);
    const archive = await DocumentArchive.open(odt);
    const styles = await archive.readTextEntry("styles.xml");
    const picture = styles.match(/<draw:image xlink:href="([^"]+)"/u)?.[1];
    assert(picture);
    expect(picture).toMatch(/^Pictures\/.*\.png$/u);
    expect(styles).toContain('style:run-through="background"');
    expect(styles).toContain('draw:mime-type="image/png"');
    expect(await archive.readTextEntry("content.xml")).not.toContain("<draw:image");
    expect(await archive.readTextEntry("META-INF/manifest.xml")).toContain(
      `manifest:full-path="${picture}"`,
    );
    expect(await archive.readEntry(picture)).toEqual(input.image);
    for (const source of [structuredClone(snapshot), odt]) {
      const copy = (await readOdtDocument(source, metadata)).document;
      imported.push(copy);
      expectHeaderGraphic(copy, input.image);
    }
    const restored = imported[0];
    assert(restored);
    const docx = await importOOXML(await DocxExport.WriteDocument(restored), {});
    imported.push(docx);
    expectHeaderGraphic(docx, input.image);
  } finally {
    for (const copy of imported) copy.Dispose();
    doc.Dispose();
  }
});

it("opens the unchanged tdf134114 pictures and preserves their overlap policy through ODT and DOCX", /** Ports the original AllowOverlap assertion over the Writer frame graph and both file formats. @returns Completion. */ async () => {
  const bytes = new Uint8Array(
    readFileSync(
      "../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/tdf134114_allowOverlap.docx",
    ),
  );
  const opened: SwDoc[] = [];
  try {
    const document = await importOOXML(bytes, {});
    opened.push(document);
    const local = (
      await readOdtDocument(await writeOdtDocument(document, { title: "Allow overlap" }), {
        title: "Allow overlap",
      })
    ).document;
    opened.push(local);
    const docx = await DocxExport.WriteDocument(local);
    const archive = await DocumentArchive.open(docx);
    const xml = await archive.readTextEntry("word/document.xml");
    expect(xml.match(/<wp:wrapSquare wrapText="bothSides"\/>/gu)).toHaveLength(2);
    expect(xml.match(/allowOverlap="[01]"/gu)).toEqual(['allowOverlap="1"', 'allowOverlap="0"']);
    opened.push(await importOOXML(docx, {}));
    for (const source of opened) {
      const [marginPicture, columnPicture] = [...source.GetSpzFrameFormats()];
      assert(marginPicture && columnPicture);
      expect(marginPicture.GetWrapInfluenceOnObjPos().GetAllowOverlap()).toBe(true);
      expect(columnPicture.GetWrapInfluenceOnObjPos().GetAllowOverlap()).toBe(false);
      expect(marginPicture.GetSurround().GetSurround()).toBe(WrapTextMode.PARALLEL);
      expect(columnPicture.GetSurround().GetSurround()).toBe(WrapTextMode.PARALLEL);
      expect(marginPicture.GetLRSpace().ResolveLeft()).toBe(0);
      expect(columnPicture.GetLRSpace().ResolveLeft()).toBe(180);
      expect(columnPicture.GetLRSpace().ResolveRight()).toBe(180);
    }
  } finally {
    for (const document of opened) document.Dispose();
  }
});

it.each([
  ["left", WrapTextMode.LEFT],
  ["right", WrapTextMode.RIGHT],
  ["largest", WrapTextMode.DYNAMIC],
])(
  "preserves a square picture wrapping on %s",
  /** Writes the original geometry and checks the source wrap mode across the Worker and primary ODT. @param side - DrawingML side. @param expected - Native mode. @returns Completion. */ async (
    side,
    expected,
  ) => {
    const { bytes } = await headerPicture();
    const square = await rewriteHeader(
      bytes,
      /** Replaces the prior through mode with a side and explicit distances. @param header - Source header. @returns Modified XML. */
      (header) =>
        header
          .replace("<wp:wrapNone/>", '<wp:wrapSquare wrapText="' + side + '"/>')
          .replace(' behindDoc="1"', ' distL="114300" distR="63500" distT="31750" distB="12700"'),
    );
    const documents: SwDoc[] = [];
    try {
      const doc = await importOOXML(square, {});
      documents.push(doc);
      const worker = decodeWriterDocument(structuredClone(encodeWriterDocument(doc)));
      documents.push(worker);
      const primary = (
        await readOdtDocument(await writeOdtDocument(worker, { title: "Picture" }), {
          title: "Picture",
        })
      ).document;
      documents.push(primary);
      const docx = await DocxExport.WriteDocument(primary);
      const output = await DocumentArchive.open(docx);
      const header = await output.readTextEntry("word/header1.xml");
      expect(header).toContain('<wp:wrapSquare wrapText="' + side + '"/>');
      expect(header).toContain('distT="31750" distB="12700" distL="114300" distR="63500"');
      documents.push(await importOOXML(docx, {}));
      for (const model of documents) {
        const [frame] = [...model.GetSpzFrameFormats()];
        assert(frame);
        expect(frame.GetSurround().GetSurround()).toBe(expected);
        expect(frame.GetLRSpace().ResolveLeft()).toBe(180);
        expect(frame.GetLRSpace().ResolveRight()).toBe(100);
        expect(frame.GetULSpace().GetUpper()).toBe(50);
        expect(frame.GetULSpace().GetLower()).toBe(20);
      }
    } finally {
      for (const document of documents) document.Dispose();
    }
  },
);

/** Updates the represented header XML and preserves its original package parts. @param bytes - Source DOCX. @param change - Header substitution. @returns Modified document. */
async function rewriteHeader(
  bytes: Uint8Array,
  change: (header: string) => string,
): Promise<Uint8Array> {
  const archive = await DocumentArchive.open(bytes);
  const output = new DocumentArchiveWriter();
  for (const path of archive.getEntryNames()) {
    const value =
      path === "word/header1.xml"
        ? new TextEncoder().encode(change(await archive.readTextEntry(path)))
        : await archive.readEntry(path);
    output.putNextEntry(path, value);
  }
  return output.finish();
}

it.each([
  [
    "column",
    "left",
    "paragraph",
    "top",
    RelOrientation.PRINT_AREA,
    HoriOrientation.LEFT,
    false,
    [0, 100, 50, 20],
  ],
  [
    "page",
    "right",
    "margin",
    "bottom",
    RelOrientation.PAGE_FRAME,
    HoriOrientation.RIGHT,
    false,
    [180, 0, 50, 0],
  ],
  [
    "margin",
    "inside",
    "page",
    "top",
    RelOrientation.PAGE_PRINT_AREA,
    HoriOrientation.LEFT,
    true,
    [0, 0, 0, 20],
  ],
  [
    "page",
    "outside",
    "page",
    "bottom",
    RelOrientation.PAGE_FRAME,
    HoriOrientation.RIGHT,
    true,
    [0, 0, 50, 0],
  ],
  [
    "character",
    "left",
    "paragraph",
    "top",
    RelOrientation.CHAR,
    HoriOrientation.LEFT,
    false,
    [180, 100, 50, 20],
  ],
  [
    "rightMargin",
    "left",
    "paragraph",
    "top",
    RelOrientation.PAGE_RIGHT,
    HoriOrientation.LEFT,
    false,
    [180, 100, 50, 20],
  ],
  [
    "leftMargin",
    "right",
    "paragraph",
    "top",
    RelOrientation.PAGE_LEFT,
    HoriOrientation.RIGHT,
    false,
    [180, 100, 50, 20],
  ],
] as const)(
  "applies the source spacing for %s-relative %s placement",
  /** Tests Writer's one-sided gap and mirrored margin rules. @param hRelation - Source horizontal reference. @param hAlign - Source horizontal alignment. @param vRelation - Source vertical reference. @param vAlign - Source vertical alignment. @param relation - Native horizontal reference. @param align - Native horizontal orientation. @param toggle - Mirrored position flag. @param distances - Native left, right, top and bottom twips. @returns Completion. */ async (
    hRelation,
    hAlign,
    vRelation,
    vAlign,
    relation,
    align,
    toggle,
    distances,
  ) => {
    const { bytes } = await headerPicture();
    const square = await rewriteHeader(
      bytes,
      /** Writes a square picture with lexical distances before the native alignment adjustments. @param header - Source header. @returns Modified XML. */
      (header) =>
        header
          .replace(
            /<wp:positionH.*?<\/wp:positionH>/u,
            `<wp:positionH relativeFrom="${hRelation}"><wp:align>${hAlign}</wp:align></wp:positionH>`,
          )
          .replace(
            /<wp:positionV.*?<\/wp:positionV>/u,
            `<wp:positionV relativeFrom="${vRelation}"><wp:align>${vAlign}</wp:align></wp:positionV>`,
          )
          .replace("<wp:wrapNone/>", '<wp:wrapSquare wrapText="bothSides"/>')
          .replace(' behindDoc="1"', ' distL="114300" distR="63500" distT="31750" distB="12700"'),
    );
    const doc = await importOOXML(square, {});
    try {
      const frame = doc.GetSpzFrameFormats().GetFormat(0);
      const horizontal = frame.GetHoriOrient();
      expect(horizontal.GetRelationOrient()).toBe(relation);
      expect(horizontal.GetHoriOrient()).toBe(align);
      expect(horizontal.IsPosToggle()).toBe(toggle);
      expect([
        frame.GetLRSpace().ResolveLeft(),
        frame.GetLRSpace().ResolveRight(),
        frame.GetULSpace().GetUpper(),
        frame.GetULSpace().GetLower(),
      ]).toEqual(distances);
    } finally {
      doc.Dispose();
    }
  },
);
