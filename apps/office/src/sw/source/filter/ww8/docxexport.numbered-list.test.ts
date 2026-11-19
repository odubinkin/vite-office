/** @fileoverview Nested DOCX table conversion through native Writer nodes and filters. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../../../package/source/zippackage/document-archive";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import type { SwDoc } from "../../core/doc/doc";
import { readOdtDocument } from "../xml/swxml";
import { writeOdtDocument } from "../xml/wrtxml";
import { SwTableNode } from "../../core/docnode/node";
import { importOOXML } from "../../writerfilter/filter/WriterFilter";
import { DocxExport } from "./docxexport";
import { SvxBoxItemLine } from "../../../../editeng/source/items/frmitems";
import { OoxmlVersion } from "../../../../oox/inc/core/filterbase";

const upstream = "../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/";

/** Reads one original LibreOffice fixture. @param name - Relative filename. @returns Package bytes. */
function fixture(name: string): Uint8Array {
  return new Uint8Array(readFileSync(upstream + name));
}

/** Changes the body of a pinned DOCX fixture while retaining all related parts. @param name - Fixture name. @param update - Body XML edit. @returns Complete DOCX test package. */
async function updateFixtureBody(
  name: string,
  update: (xml: string) => string,
): Promise<Uint8Array> {
  const source = await DocumentArchive.open(fixture(name));
  const output = new DocumentArchiveWriter();
  for (const part of source.getEntryNames()) {
    if (part !== "word/document.xml") output.putNextEntry(part, await source.readEntry(part));
    else {
      const xml = await source.readTextEntry(part);
      output.putNextEntry(part, new TextEncoder().encode(update(xml)));
    }
  }
  return output.finish();
}

it("retains three tables in the original tdf131260 fixture", /** Ports the original table count assertion before and after export. @returns Completion. */ async () => {
  const doc = await importOOXML(fixture("tdf131260.docx"), {});
  let reopened: typeof doc | undefined;
  try {
    const bytes = await DocxExport.WriteDocument(doc);
    reopened = await importOOXML(bytes, {});
    for (const copy of [doc, reopened]) {
      expect(
        copy
          .GetNodes()
          .entries()
          .filter(
            /** Counts real native table nodes, including those in cells. @param node - Document node. @returns Whether the node owns a table. */
            (node) => node instanceof SwTableNode,
          ),
      ).toHaveLength(3);
    }
  } finally {
    reopened?.Dispose();
    doc.Dispose();
  }
});

it("exports both tables in the original tdf131203 fixture without a column grid", /** Ports the upstream divide-by-zero regression. @returns Completion. */ async () => {
  const doc = await importOOXML(fixture("tdf131203.docx"), {});
  try {
    const exported = await DocumentArchive.open(await DocxExport.WriteDocument(doc));
    expect((await exported.readTextEntry("word/document.xml")).match(/<w:tbl>/gu)).toHaveLength(2);
  } finally {
    doc.Dispose();
  }
});

it("exports centered and right-aligned tables in both Word dialects", /** Checks represented alignment names and suppression of indentation. @returns Completion. */ async () => {
  const original = await updateFixtureBody(
    "NumberedList.docx",
    /** Places two tables with source qualification and fixed widths. @returns Main document XML. */
    () => {
      /** Defines one table with a positive indent that its alignment supersedes. @param alignment - Word alignment. @returns Table XML. */
      function table(alignment: "center" | "right"): string {
        return (
          '<w:tbl><w:tblPr><w:tblW w:w="2880" w:type="dxa"/><w:jc w:val="' +
          alignment +
          '"/><w:tblInd w:w="180" w:type="dxa"/></w:tblPr><w:tblGrid><w:gridCol w:w="2880"/>' +
          "</w:tblGrid><w:tr><w:tc><w:p/></w:tc></w:tr></w:tbl>"
        );
      }
      return (
        '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' +
        table("center") +
        "<w:p/>" +
        table("right") +
        "<w:p/><w:sectPr/></w:body></w:document>"
      );
    },
  );
  const doc = await importOOXML(original, {});
  try {
    const iso = await DocumentArchive.open(await DocxExport.WriteDocument(doc));
    const legacy = await DocumentArchive.open(
      await DocxExport.WriteDocument(doc, OoxmlVersion.ECMA_376_1ST_EDITION),
    );
    const isoXml = await iso.readTextEntry("word/document.xml");
    expect(isoXml).toContain('<w:jc w:val="center"/><w:tblInd w:w="0" w:type="dxa"/>');
    expect(isoXml).toContain('<w:jc w:val="end"/><w:tblInd w:w="0" w:type="dxa"/>');
    expect(await legacy.readTextEntry("word/document.xml")).toContain(
      '<w:jc w:val="right"/><w:tblInd w:w="0" w:type="dxa"/>',
    );
  } finally {
    doc.Dispose();
  }
});

it("keeps the NumberedList nested table in the first cell", /** Checks native section ownership and DOCX table output for the pinned body. @returns Completion. */ async () => {
  const doc = await importOOXML(fixture("NumberedList.docx"), {});
  let worker: SwDoc | undefined;
  let stored: SwDoc | undefined;
  let reopened: SwDoc | undefined;
  try {
    const first = doc.GetTables()[0]?.GetTabLines()[0]?.GetTabBoxes()[0];
    expect(
      first?.GetContentNodes().filter(
        /** Selects actual nested table blocks. @param node - Direct cell block. @returns Whether nested table. */
        (node) => node instanceof SwTableNode,
      ),
    ).toHaveLength(1);
    const bytes = await DocxExport.WriteDocument(doc);
    const archive = await DocumentArchive.open(bytes);
    const xml = await archive.readTextEntry("word/document.xml");
    expect(xml.match(/<w:tbl>/gu)).toHaveLength(2);
    expect(xml).toMatch(/<w:tblGrid><w:gridCol w:w="3841"\/><w:gridCol w:w="4050"\/>/u);
    expect(xml.match(/<w:tblInd w:w="360" w:type="dxa"\/>/gu)).toHaveLength(2);
    expect(
      xml.match(
        /<w:pStyle w:val="NumberedList1"\/><w:numPr><w:ilvl w:val="0"\/><w:numId w:val="0"\/><\/w:numPr>/gu,
      ),
    ).toHaveLength(2);
    expect(xml).toContain("<w:footerReference");
    expect(await archive.readTextEntry("word/footer1.xml")).toMatch(/<w:t[^>]*>1<\/w:t>/);
    reopened = await importOOXML(bytes, {});
    worker = decodeWriterDocument(structuredClone(encodeWriterDocument(doc)));
    const metadata = { title: "NumberedList" };
    stored = (await readOdtDocument(await writeOdtDocument(worker, metadata), metadata)).document;
    for (const copy of [worker, stored, reopened]) {
      const exported = await DocumentArchive.open(await DocxExport.WriteDocument(copy));
      const document = await exported.readTextEntry("word/document.xml");
      expect(document.match(/<w:tblInd w:w="360" w:type="dxa"\/>/gu)).toHaveLength(2);
      expect(document).toMatch(/<w:tblGrid><w:gridCol w:w="3841"\/><w:gridCol w:w="4050"\/>/u);
    }
  } finally {
    reopened?.Dispose();
    stored?.Dispose();
    worker?.Dispose();
    doc.Dispose();
  }
});

it("preserves the direct zero indent, percentage width and cell margin overrides", /** Uses original Word table resources, the real page geometry owner and both export dialects. @returns Completion. */ async () => {
  const original = await updateFixtureBody(
    "NumberedList.docx",
    /** Builds a literal Word geometry variant with the original style relationship. @returns Main document XML. */
    () =>
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:tbl>' +
      '<w:tblPr><w:tblStyle w:val="TablewithHeaderinList1"/><w:tblW w:w="2500" w:type="pct"/><w:tblInd w:w="0" w:type="dxa"/><w:tblCellMar><w:left w:w="80" w:type="dxa"/></w:tblCellMar></w:tblPr>' +
      '<w:tblGrid><w:gridCol w:w="1440"/><w:gridCol w:w="1440"/></w:tblGrid><w:tr>' +
      '<w:tc><w:tcPr><w:tcMar><w:left w:w="120" w:type="dxa"/></w:tcMar></w:tcPr><w:p><w:r><w:t>First</w:t></w:r></w:p></w:tc>' +
      "<w:tc><w:p><w:r><w:t>Second</w:t></w:r></w:p></w:tc></w:tr></w:tbl><w:p/><w:sectPr/></w:body></w:document>",
  );
  const doc = await importOOXML(original, {});
  let reopened: SwDoc | undefined;
  try {
    const bytes = await DocxExport.WriteDocument(doc);
    const archive = await DocumentArchive.open(bytes);
    const xml = await archive.readTextEntry("word/document.xml");
    expect(xml).toContain('<w:tblW w:w="2500" w:type="pct"/>');
    expect(xml).toContain('<w:tblInd w:w="0" w:type="dxa"/>');
    expect(xml).toContain('<w:tcMar><w:start w:w="80" w:type="dxa"/></w:tcMar>');
    const legacy = await DocumentArchive.open(
      await DocxExport.WriteDocument(doc, OoxmlVersion.ECMA_376_1ST_EDITION),
    );
    expect(await legacy.readTextEntry("word/document.xml")).toContain(
      '<w:tcMar><w:left w:w="80" w:type="dxa"/></w:tcMar>',
    );
    reopened = await importOOXML(bytes, {});
    for (const candidate of [doc, reopened]) {
      const table = candidate.GetTables()[0];
      assert(table);
      expect(table.GetFrameFormat().GetFrameSize().GetWidthPercent()).toBe(50);
      expect(table.GetFrameFormat().GetLRSpace().ResolveLeft()).toBe(-120);
      expect(
        table
          .GetTabLines()[0]
          ?.GetTabBoxes()
          .map(
            /** Reads each formatted cell's actual distance. @param box - Native table cell. @returns Left distance in twips. */
            (box) => box.GetFrameFormat().GetBox().GetDistance(SvxBoxItemLine.LEFT),
          ),
      ).toEqual([120, 80]);
    }
  } finally {
    reopened?.Dispose();
    doc.Dispose();
  }
});

it("preserves a nested table as the first cell block through Worker and primary ODT", /** Verifies positional ownership with the paragraphs preceding the nested table removed. @returns Completion. */ async () => {
  const bytes = await updateFixtureBody(
    "tdf131260.docx",
    /** Starts the first cell with an indented nested table. @param xml - Original body. @returns Body with the first cell reordered and a negative inner indent. */
    (xml) =>
      xml.replace(
        /(<w:tc><w:tcPr><w:tcW\b[^>]*\/><\/w:tcPr>)(?:<w:p\b[^>]*\/>)+(<w:tbl><w:tblPr><w:tblStyle w:val="TableGrid"\/>)/u,
        '$1$2<w:tblInd w:w="-120" w:type="dxa"/>',
      ),
  );
  const doc = await importOOXML(bytes, {});
  let worker: SwDoc | undefined;
  let stored: SwDoc | undefined;
  let reopened: SwDoc | undefined;
  try {
    const firstBlock = doc.GetTables()[0]?.GetTabLines()[0]?.GetTabBoxes()[0]?.GetContentNodes()[0];
    assert(firstBlock instanceof SwTableNode);
    expect(firstBlock.GetTable().GetFrameFormat().GetLRSpace().ResolveLeft()).toBe(0);
    worker = decodeWriterDocument(structuredClone(encodeWriterDocument(doc)));
    const metadata = { title: "Nested tables" };
    stored = (await readOdtDocument(await writeOdtDocument(worker, metadata), metadata)).document;
    reopened = await importOOXML(await DocxExport.WriteDocument(stored), {});
    for (const current of [doc, worker, stored, reopened]) {
      const outer = current.GetTables()[0];
      const box = outer?.GetTabLines()[0]?.GetTabBoxes()[0];
      const nested = box?.GetContentNodes()[0];
      expect(nested).toBeInstanceOf(SwTableNode);
      expect(nested?.StartOfSectionNode()).toBe(box?.GetStartNode());
    }
  } finally {
    reopened?.Dispose();
    stored?.Dispose();
    worker?.Dispose();
    doc.Dispose();
  }
});
