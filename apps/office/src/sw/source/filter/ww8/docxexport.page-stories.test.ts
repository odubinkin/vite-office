/** @fileoverview Native DOCX header/footer text sections and Writer local persistence. */
import { readFileSync } from "node:fs";
import { assert, expect, it, vi } from "vitest";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../../../package/source/zippackage/document-archive";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { SwDoc } from "../../core/doc/doc";
import { SwPosition } from "../../core/crsr/pam";
import { SwTableNode } from "../../core/docnode/node";
import { SwXHeadFootText, SwXText } from "../../core/unocore/unotext";
import { RndStdIds } from "../../../../svx/inc/swframetypes";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import type { SwFrameFormat } from "../../core/layout/atrfrm";
import { FieldContext } from "../../writerfilter/dmapper/FieldContext";
import { StreamState } from "../../writerfilter/dmapper/DomainMapper_Impl.stream";
import { DomainMapper } from "../../writerfilter/dmapper/DomainMapper";
import { SourceDocumentType } from "../../writerfilter/inc/dmapper/DomainMapperFactory";
import { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import { importOOXML } from "../../writerfilter/filter/WriterFilter";
import { readOdtDocument } from "../xml/swxml";
import { writeOdtDocument } from "../xml/wrtxml";
import { DocxExport } from "./docxexport";

const corpus = "../../vendor/libreoffice-reference/sw/qa/";
/** Reads the original fixture without rebuilding its relationship parts. @param path - Relative native fixture. @returns OOXML archive. */
function fixture(path: string): Uint8Array {
  return new Uint8Array(readFileSync(corpus + path));
}
/** Reuses original Word relationships with a targeted replacement of main or footer XML. @param replacements - Replaced package entries. @returns DOCX bytes. */
async function numberedListWith(
  replacements: Readonly<Record<string, string>>,
): Promise<Uint8Array> {
  const zip = await DocumentArchive.open(fixture("extras/ooxmlexport/data/NumberedList.docx"));
  const archive = new DocumentArchiveWriter();
  for (const name of zip.getEntryNames()) {
    const replacement = replacements[name];
    archive.putNextEntry(
      name,
      replacement === undefined ? await zip.readEntry(name) : new TextEncoder().encode(replacement),
    );
  }
  return archive.finish();
}
const footerTable =
  '<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:tbl><w:tblGrid><w:gridCol w:w="2400"/></w:tblGrid><w:tr><w:tc><w:p><w:r><w:t>Cell</w:t></w:r></w:p></w:tc></w:tr></w:tbl><w:p><w:r><w:t>Footer</w:t></w:r></w:p></w:ftr>';
/** Returns the direct content of the actual bound frame. @param frame - Native header/footer. @returns Actual content. */
function content(frame: SwFrameFormat | null) {
  const start = frame?.GetContent().GetContentIdx()?.GetNode();
  assert(start?.IsStartNode());
  return start.GetNodes().GetSectionContent(start);
}
/** Reads the first native text block of the expected story. @param frame - Native page story. @returns Paragraph text. */
function firstText(frame: SwFrameFormat | null): string | undefined {
  return content(frame)[0]?.GetTextNode()?.GetText();
}

it("opens unmodified NumberedList with its actual footer and keeps it through Writer storage", /** Verifies the original cached field result without mixing the footer into the body. @returns Completion. */ async () => {
  const doc = await importOOXML(fixture("extras/ooxmlexport/data/NumberedList.docx"), {});
  let worker: SwDoc | undefined;
  let stored: SwDoc | undefined;
  try {
    worker = decodeWriterDocument(structuredClone(encodeWriterDocument(doc)));
    const metadata = { title: "NumberedList" };
    stored = (await readOdtDocument(await writeOdtDocument(worker, metadata), metadata)).document;
    for (const copy of [doc, worker, stored]) {
      const page = copy.GetPageDesc();
      expect(firstText(page.GetMaster().GetFooter().GetFooterFormat())).toBe("1");
      expect(copy.GetTables()).toHaveLength(1);
      expect(copy.paragraphs[0]?.StartOfSectionNode()).toBe(
        copy.nodes.GetEndOfContent().StartOfSectionNode(),
      );
    }
  } finally {
    stored?.Dispose();
    worker?.Dispose();
    doc.Dispose();
  }
});

it("opens the pinned Word fixture with all six page variants", /** Ports the native SimpleFirstLeftRight OOXML assertions. @returns Completion. */ async () => {
  const doc = await importOOXML(fixture("core/header_footer/data/SimpleFirstLeftRight.docx"), {});
  let reopened: SwDoc | undefined;
  try {
    const exported = await DocxExport.WriteDocument(doc);
    const packageXml = await DocumentArchive.open(exported);
    const main = await packageXml.readTextEntry("word/document.xml");
    expect(main).toContain("<w:titlePg/>");
    expect(await packageXml.readTextEntry("word/settings.xml")).toContain("<w:evenAndOddHeaders/>");
    const relations = await packageXml.readTextEntry("word/_rels/document.xml.rels");
    const types = await packageXml.readTextEntry("[Content_Types].xml");
    for (const story of ["header", "footer"]) {
      for (const [index, variant] of ["even", "default", "first"].entries()) {
        const reference = main.match(
          new RegExp(`<w:${story}Reference w:type="${variant}" r:id="(rId\\d+)"/>`),
        );
        const leaf = `${story}${index + 1}.xml`;
        assert(reference);
        expect(relations).toContain(
          `Id="${reference[1]}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/${story}" Target="${leaf}"`,
        );
        expect(types).toContain(`PartName="/word/${leaf}"`);
      }
    }
    reopened = await importOOXML(exported, {});
    for (const document of [doc, reopened]) {
      const page = document.GetPageDesc();
      expect(page.IsFirstShared()).toBe(false);
      expect(page.IsHeaderShared()).toBe(false);
      expect(page.IsFooterShared()).toBe(false);
      expect(firstText(page.GetMaster().GetHeader().GetHeaderFormat())).toBe("RIGHT HEADER");
      expect(firstText(page.GetLeft().GetHeader().GetHeaderFormat())).toBe("LEFT HEADER");
      expect(firstText(page.GetFirstMaster().GetHeader().GetHeaderFormat())).toBe("FIRST HEADER");
      expect(firstText(page.GetMaster().GetFooter().GetFooterFormat())).toBe("RIGHT FOOTER");
      expect(firstText(page.GetLeft().GetFooter().GetFooterFormat())).toBe("LEFT FOOTER");
      expect(firstText(page.GetFirstMaster().GetFooter().GetFooterFormat())).toBe("FIRST FOOTER");
    }
  } finally {
    reopened?.Dispose();
    doc.Dispose();
  }
});

it("converts a real footer document stream table inside its text section", /** Exercises the same native cell endpoints as the body table importer. @returns Completion. */ async () => {
  const doc = await importOOXML(await numberedListWith({ "word/footer1.xml": footerTable }), {});
  try {
    const blocks = content(doc.GetPageDesc().GetMaster().GetFooter().GetFooterFormat());
    const table = blocks[0];
    assert(table instanceof SwTableNode);
    expect(table.GetTable().GetTabLines()[0]?.GetTabBoxes()[0]?.GetParagraphs()[0]?.GetText()).toBe(
      "Cell",
    );
    expect(doc.GetTables()).toHaveLength(1);
    const exported = await DocxExport.WriteDocument(doc);
    const parts = await DocumentArchive.open(exported);
    expect(await parts.readTextEntry("word/footer1.xml")).toContain("<w:tbl>");
    const reopened = await importOOXML(exported, {});
    try {
      const footer = content(reopened.GetPageDesc().GetMaster().GetFooter().GetFooterFormat());
      expect(footer[0]).toBeInstanceOf(SwTableNode);
      expect(reopened.GetTables()).toHaveLength(1);
    } finally {
      reopened.Dispose();
    }
  } finally {
    doc.Dispose();
  }
});

it("copies linked footer tables into independent native section and parity styles", /** Tests the original linked-section behavior with the first footer block itself being a table. @returns Completion. */ async () => {
  const main =
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>' +
    '<w:p><w:pPr><w:sectPr><w:footerReference w:type="default" r:id="rId9"/></w:sectPr></w:pPr><w:r><w:t>First</w:t></w:r></w:p>' +
    '<w:p><w:r><w:t>Second</w:t></w:r></w:p><w:sectPr><w:type w:val="evenPage"/></w:sectPr></w:body></w:document>';
  const doc = await importOOXML(
    await numberedListWith({ "word/document.xml": main, "word/footer1.xml": footerTable }),
    {},
  );
  try {
    const frames = Array.from(
      { length: doc.GetPageDescCnt() },
      /** Borrows each written frame. @param _unused - Array slot. @param index - Page descriptor index. @returns Footer frame. */
      (_unused, index) => doc.GetPageDesc(index).GetMaster().GetFooter().GetFooterFormat(),
    );
    expect(frames).toHaveLength(3);
    expect(new Set(frames).size).toBe(3);
    const tables = frames.map(
      /** Reads native footer paragraphs and table. @param frame - Footer frame. @returns Table node. */
      (frame) => {
        const [table, paragraph] = content(frame);
        assert(table instanceof SwTableNode);
        expect(paragraph?.GetTextNode()?.GetText()).toBe("Footer");
        return table.GetTable();
      },
    );
    for (const table of tables)
      expect(table.GetTabLines()[0]?.GetTabBoxes()[0]?.GetParagraphs()[0]?.GetText()).toBe("Cell");
    tables[0]?.GetTabLines()[0]?.GetTabBoxes()[0]?.GetParagraphs()[0]?.SetText("Edited");
    expect(tables[1]?.GetTabLines()[0]?.GetTabBoxes()[0]?.GetParagraphs()[0]?.GetText()).toBe(
      "Cell",
    );
    expect(tables[2]?.GetTabLines()[0]?.GetTabBoxes()[0]?.GetParagraphs()[0]?.GetText()).toBe(
      "Cell",
    );
  } finally {
    doc.Dispose();
  }
});

it("reopens the pinned Word linked-to-previous fixture and retains each variant in all three sections", /** Ports testHFLinkToPrev's native text assertions before and after round-trip. @returns Completion. */ async () => {
  const doc = await importOOXML(
    fixture("core/header_footer/data/headerfooter-link-to-prev.docx"),
    {},
  );
  let reopened: SwDoc | undefined;
  try {
    reopened = await importOOXML(await DocxExport.WriteDocument(doc), {});
    for (const copy of [doc, reopened]) {
      expect(copy.GetPageDescCnt()).toBe(3);
      for (const index of [0, 1, 2]) {
        const page = copy.GetPageDesc(index);
        const suffix = index === 0 ? "section 1 only" : "sections 2 and 3 only";
        expect(firstText(page.GetMaster().GetHeader().GetHeaderFormat())).toBe(
          "Odd page header for all sections",
        );
        expect(firstText(page.GetLeft().GetHeader().GetHeaderFormat())).toBe(
          "Even page header for " + suffix,
        );
        expect(firstText(page.GetFirstMaster().GetHeader().GetHeaderFormat())).toBe(
          "First page header for all sections",
        );
        expect(firstText(page.GetMaster().GetFooter().GetFooterFormat())).toBe(
          "Odd page footer for " + suffix,
        );
        expect(firstText(page.GetLeft().GetFooter().GetFooterFormat())).toBe(
          "Even page footer for all sections",
        );
        expect(firstText(page.GetFirstMaster().GetFooter().GetFooterFormat())).toBe(
          "First page footer for " + suffix,
        );
      }
    }
  } finally {
    reopened?.Dispose();
    doc.Dispose();
  }
});

it("preserves even and first story selection across the original alternate parity styles", /** Verifies the model-facing footer text from LibreOffice's tdf135216 import case. @returns Completion. */ async () => {
  const doc = await importOOXML(
    fixture("core/header_footer/data/tdf135216_evenOddFooter.docx"),
    {},
  );
  try {
    const pages = Array.from(
      { length: doc.GetPageDescCnt() },
      /** Borrows one owned page descriptor. @param _unused - Array slot. @param index - Descriptor index. @returns Actual descriptor. */
      (_unused, index) => doc.GetPageDesc(index),
    );
    for (const page of pages) {
      expect(firstText(page.GetLeft().GetFooter().GetFooterFormat())).toBe("even page");
      if (!page.IsFirstShared())
        expect(firstText(page.GetFirstMaster().GetFooter().GetFooterFormat())).toBe(
          "odd page - first footer",
        );
    }
    expect(
      pages.some(
        /** Checks that the actual first-page variant was materialized. @param page - Owned variant. @returns Whether first page differs. */
        (page) => !page.IsFirstShared(),
      ),
    ).toBe(true);
    const output = await DocumentArchive.open(await DocxExport.WriteDocument(doc));
    expect(await output.readTextEntry("word/settings.xml")).toContain("<w:evenAndOddHeaders/>");
  } finally {
    doc.Dispose();
  }
});

it.each(["even", "first"] as const)(
  "creates empty separate footer variants when only the %s footer has a relationship",
  /** Verifies enabled page variants whose original relationship is absent. @param variant - Defined Word variant. @returns Completion. */ async (
    variant,
  ) => {
    const main =
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>' +
      `<w:p><w:r><w:t>Body</w:t></w:r></w:p><w:sectPr><w:footerReference w:type="${variant}" r:id="rId9"/><w:titlePg/></w:sectPr></w:body></w:document>`;
    const settings =
      '<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:evenAndOddHeaders/></w:settings>';
    const doc = await importOOXML(
      await numberedListWith({
        "word/document.xml": main,
        "word/settings.xml": settings,
      }),
      {},
    );
    try {
      const page = doc.GetPageDesc();
      expect(page.IsFirstShared()).toBe(false);
      expect(firstText(page.GetMaster().GetFooter().GetFooterFormat())).toBe("");
      expect(firstText(page.GetLeft().GetFooter().GetFooterFormat())).toBe(
        variant === "even" ? "1" : "",
      );
      expect(firstText(page.GetFirstMaster().GetFooter().GetFooterFormat())).toBe(
        variant === "first" ? "1" : "",
      );
    } finally {
      doc.Dispose();
    }
  },
);

it("releases outstanding story field, bookmark and property owners when the stream ends", /** Exercises native resource release for incomplete substream input. @returns Nothing. */ () => {
  const doc = new SwDoc();
  const node = doc.paragraphs[0];
  assert(node);
  const owner = new SwXText(doc);
  const state = new StreamState(owner);
  const mark = new SwPosition(node);
  const field = new FieldContext(new SwPosition(node));
  const deferred = new Any(true);
  const disposeDeferred = vi.spyOn(deferred, "dispose");
  try {
    state.fields.push(field);
    state.bookmarks.set("1", { name: "open", position: mark });
    state.deferredCharacterProperties.set(1, deferred);
    state.dispose();
    expect(field.start.nContent.GetContentNode()).toBeUndefined();
    expect(mark.nContent.GetContentNode()).toBeUndefined();
    expect(disposeDeferred).toHaveBeenCalledOnce();
    expect(
      /** The real native section copy prevents recursive self-insertion. @returns Nothing. */
      () => owner.copyText(owner),
    ).toThrow("distinct text sections");
  } finally {
    owner.dispose();
    doc.Dispose();
  }
});

it("copies a table-only source cell and keeps the destination's terminal paragraph", /** Verifies a real nested table at the CopyNodes boundary. @returns Nothing. */ () => {
  const doc = new SwDoc();
  const nodes = doc.GetNodes();
  const nested = nodes.MakeTableNode("Nested");
  nodes.AppendTableRow(nested, 1).GetTabBoxes()[0]?.GetParagraphs()[0]?.SetText("Nested cell");
  const outer = nodes.TextToTable([[[nested.GetTableNode()]]], "Outer");
  const source = new SwXText(doc);
  const frame = doc.getIDocumentLayoutAccess().MakeLayoutFormat(RndStdIds.FOOTER);
  const target = SwXHeadFootText.CreateXHeadFootText(frame);
  try {
    expect(outer.GetTabLines()[0]?.GetTabBoxes()[0]?.GetContentNodes()).toEqual([
      nested.GetTableNode(),
    ]);
    target.copyText(source);
    const copied = content(frame).find(
      /** Selects the copied outer table in the actual destination. @param node - Page story block. @returns Whether it is a table. */
      (node) => node instanceof SwTableNode,
    );
    assert(copied instanceof SwTableNode);
    const cell = copied.GetTable().GetTabLines()[0]?.GetTabBoxes()[0];
    assert(cell);
    const [inner, paragraph] = cell.GetContentNodes();
    assert(inner instanceof SwTableNode);
    expect(inner.GetTable().GetTabLines()[0]?.GetTabBoxes()[0]?.GetParagraphs()[0]?.GetText()).toBe(
      "Nested cell",
    );
    expect(paragraph?.GetTextNode()?.GetText()).toBe("");
  } finally {
    source.dispose();
    target.dispose();
    doc.Dispose();
  }
});

it("keeps page story flags untouched during insertion into an existing document", /** Verifies the native NewDoc ownership guard. @returns Nothing. */ () => {
  const doc = new SwDoc();
  const mapper = new DomainMapper(new SwXTextDocument(doc), SourceDocumentType.OOXML, true);
  try {
    doc.GetPageDesc().ChgFirstShare(false);
    doc.GetPageDesc().ChgFooterShare(false);
    mapper.startSectionGroup();
    mapper.endSectionGroup();
    expect(doc.GetPageDesc().IsFirstShared()).toBe(false);
    expect(doc.GetPageDesc().IsFooterShared()).toBe(false);
  } finally {
    mapper.dispose();
    doc.Dispose();
  }
});
