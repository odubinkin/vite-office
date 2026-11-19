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
import { getPageBodyGeometry } from "../../core/layout/pagedesc";
import { HdFtDistanceGlue } from "./writerwordglue";
import { SwFrameSize, SwFormatFrameSize } from "../../../inc/fmtfsize";
import { SwFormatFooter, SwFormatHeader } from "../../../inc/fmthdft";
import { SwHeaderAndFooterEatSpacingItem } from "../../../inc/hfspacingitem";
import { SwXPageStyle } from "../../core/unocore/unostyle";
import { scalar, unicode } from "../../core/unocore/unocrsrhelper";
import { SwDoc } from "../../core/doc/doc";
import { SwPosition } from "../../core/crsr/pam";
import { SwTableNode } from "../../core/docnode/node";
import { SwXHeadFootText, SwXText } from "../../core/unocore/unotext";
import { RndStdIds } from "../../../../svx/inc/swframetypes";
import { PropertyState } from "../../../../udkapi/com/sun/star/beans/PropertyState";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import type { SwFrameFormat } from "../../core/layout/atrfrm";
import { FieldContext } from "../../writerfilter/dmapper/FieldContext";
import { StreamState } from "../../writerfilter/dmapper/DomainMapper_Impl.stream";
import { DomainMapper } from "../../writerfilter/dmapper/DomainMapper";
import { SdtHelper } from "../../writerfilter/dmapper/SdtHelper";
import { PropertyMap } from "../../writerfilter/dmapper/PropertyMap";
import { PropertyIds } from "../../writerfilter/dmapper/PropertyIds";
import { NS_ooxml } from "../../writerfilter/inc/ooxml/resourceids";
import {
  OOXMLProperty,
  OOXMLPropertyType,
  OOXMLValue,
} from "../../writerfilter/ooxml/OOXMLPropertySet";
import { SourceDocumentType } from "../../writerfilter/inc/dmapper/DomainMapperFactory";
import { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import { importOOXML } from "../../writerfilter/filter/WriterFilter";
import { importWriterXml } from "../xml/xmlimp";
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

it("keeps a deferred building-block end until there is a paragraph context", /** Exercises source paragraph interoperability after a boundary without a paragraph. @returns Nothing. */ () => {
  const sdt = new SdtHelper();
  const first = new PropertyMap();
  const next = new PropertyMap();
  try {
    sdt.attribute(NS_ooxml.LN_CT_SdtBlock_sdtContent);
    sdt.sprm(
      new OOXMLProperty(NS_ooxml.LN_CT_SdtPr_docPartObj, new OOXMLValue(), OOXMLPropertyType.SPRM),
    );
    sdt.FinishParagraph(first);
    sdt.attribute(NS_ooxml.LN_CT_SdtBlock_sdtEndContent);
    sdt.FinishParagraph(null);
    sdt.FinishParagraph(next);
    expect(first.isSet(PropertyIds.PROP_SDTPR)).toBe(true);
    expect(first.isSet(PropertyIds.PROP_PARA_SDT_END_BEFORE)).toBe(false);
    expect(next.isSet(PropertyIds.PROP_SDTPR)).toBe(false);
    const end = next.getProperty(PropertyIds.PROP_PARA_SDT_END_BEFORE)?.[1];
    try {
      assert(end);
      const value: [boolean] = [false];
      expect(end.extract(value, "bool")).toBe(true);
      expect(value[0]).toBe(true);
    } finally {
      end?.dispose();
    }
  } finally {
    first.dispose();
    next.dispose();
  }
});

it("round-trips building blocks around their original paragraphs", /** Tests multiple paragraphs, deferred closing and native lexical defaults. @returns Completion. */ async () => {
  const main =
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' +
    '<w:sdt><w:sdtPr><w:alias w:val="Example"/><w:tag w:val="Block"/><w:id w:val="42"/><w:lock w:val="sdtLocked"/>' +
    '<w:docPartList><w:docPartGallery w:val="Custom"/><w:docPartCategory w:val="Samples"/><w:docPartUnique w:val="0"/></w:docPartList></w:sdtPr>' +
    "<w:sdtContent><w:p><w:r><w:t>First block</w:t></w:r></w:p><w:p><w:r><w:t>Still in block</w:t></w:r></w:p></w:sdtContent></w:sdt>" +
    "<w:p><w:r><w:t>Outside</w:t></w:r></w:p>" +
    '<w:sdt><w:sdtPr><w:id w:val="0"/><w:docPartObj/></w:sdtPr><w:sdtContent><w:p><w:r><w:t>Last block</w:t></w:r></w:p></w:sdtContent></w:sdt>' +
    "</w:body></w:document>";
  const doc = await importOOXML(await numberedListWith({ "word/document.xml": main }), {});
  let worker: SwDoc | undefined;
  let reopened: SwDoc | undefined;
  try {
    worker = decodeWriterDocument(structuredClone(encodeWriterDocument(doc)));
    const exported = await DocxExport.WriteDocument(worker);
    const archive = await DocumentArchive.open(exported);
    const xml = await archive.readTextEntry("word/document.xml");
    const [first, last] = [...xml.matchAll(/<w:sdt>.*?<\/w:sdt>/gsu)].map(
      /** Extracts one complete content control. @param match - XML fragment match. @returns Serialized block. */
      (match) => match[0],
    );
    assert(first);
    assert(last);
    expect(first).toContain(
      '<w:alias w:val="Example"/><w:tag w:val="Block"/><w:id w:val="42"/><w:lock w:val="sdtLocked"/>',
    );
    expect(first).toContain(
      '<w:docPartList><w:docPartGallery w:val="Custom"/><w:docPartCategory w:val="Samples"/><w:docPartUnique w:val="true"/></w:docPartList>',
    );
    expect(first).toContain("First block");
    expect(first).toContain("Still in block");
    expect(first).not.toContain("Outside");
    expect(last).toContain("<w:sdtPr><w:docPartObj");
    expect(last).toContain("Last block");
    expect(last).not.toContain("Outside");
    reopened = await importOOXML(exported, {});
    expect(
      reopened.paragraphs
        .map(
          /** Reads actual Writer paragraph text in order. @param paragraph - Writer text node. @returns Paragraph text. */
          (paragraph) => paragraph.GetText(),
        )
        .filter(Boolean),
    ).toEqual(["First block", "Still in block", "Outside", "Last block"]);
  } finally {
    reopened?.Dispose();
    worker?.Dispose();
    doc.Dispose();
  }
});
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

/** Removes the VML picture for the pinned geometry test, preserving the original body, relationships and section properties. @param file - Original sample name. @returns Geometry fixture. */
async function geometryFixture(file: string): Promise<Uint8Array> {
  const source = await DocumentArchive.open(fixture("extras/ooxmlexport/data/" + file));
  const output = new DocumentArchiveWriter();
  for (const name of source.getEntryNames()) {
    if (/^word\/(?:header|footer)\d+\.xml$/u.test(name)) {
      const original = await source.readTextEntry(name);
      const projected = original.replace(/<w:pict\b[^>]*>[\s\S]*?<\/w:pict>/gu, "");
      output.putNextEntry(name, new TextEncoder().encode(projected));
    } else output.putNextEntry(name, await source.readEntry(name));
  }
  return output.finish();
}

/** Reads the original typed UNO property from the ordinary page style. @param doc - Actual document. @param key - Native page-style property. @param kind - Expected scalar type. @returns Value. */
function geometryProperty(
  doc: SwDoc,
  key: string,
  kind: "bool" | "sal_Int32",
): number | boolean | string {
  const name = unicode(key);
  const value = new SwXPageStyle(doc, doc.GetPageDesc()).getPropertyValue(name);
  try {
    return scalar(value, kind);
  } finally {
    value.dispose();
    name.dispose();
  }
}

it("ports testHeaderBorder with the pinned header-relative section geometry", /** Checks the original margin and offset through DOCX, Worker and primary ODT. @returns Completion. */ async () => {
  const doc = await importOOXML(fixture("extras/ooxmlexport/data/header-border.docx"), {});
  let worker: SwDoc | undefined;
  let stored: SwDoc | undefined;
  let reopened: SwDoc | undefined;
  try {
    const metadata = { title: "Header border" };
    worker = decodeWriterDocument(structuredClone(encodeWriterDocument(doc)));
    const docx = await DocumentArchive.open(await DocxExport.WriteDocument(worker));
    expect(await docx.readTextEntry("word/footer1.xml")).toMatch(
      /<w:sdt><w:sdtPr>[\s\S]*?<w:docPartObj><w:docPartGallery w:val="Page Numbers \(Bottom of Page\)"\/><w:docPartUnique w:val="true"\/><\/w:docPartObj>[\s\S]*?<w:sdtContent>/u,
    );
    const odt = await writeOdtDocument(worker, metadata);
    const styles = await (await DocumentArchive.open(odt)).readTextEntry("styles.xml");
    expect(styles).toMatch(
      /<style:header-style><style:header-footer-properties fo:min-height="[^"]+" fo:margin-bottom="[^"]+" style:dynamic-spacing="true"\/>/u,
    );
    stored = (await readOdtDocument(odt, metadata)).document;
    for (const copy of [doc, worker, stored]) {
      const page = copy.GetPageDesc();
      const master = page.GetMaster();
      expect(master.GetULSpace().GetUpper()).toBe(480);
      expect(geometryProperty(copy, "HeaderHeight", "sal_Int32")).toBe(318);
      expect(geometryProperty(copy, "HeaderIsDynamicHeight", "bool")).toBe(true);
      expect(geometryProperty(copy, "HeaderDynamicSpacing", "bool")).toBe(true);
      expect(geometryProperty(copy, "HeaderBodyDistance", "sal_Int32")).toBe(219);
      expect(getPageBodyGeometry(page).topMargin).toBe(900);
    }
    const bytes = await DocxExport.WriteDocument(stored);
    const xml = await (await DocumentArchive.open(bytes)).readTextEntry("word/document.xml");
    expect(xml).toMatch(/<w:pgMar[^>]*w:top="900"[^>]*w:header="720"/u);
    expect(xml).toMatch(/<w:pgBorders[^>]*w:offsetFrom="page"><w:top[^>]*w:space="24"/u);
    reopened = await importOOXML(bytes, {});
    expect(getPageBodyGeometry(reopened.GetPageDesc()).topMargin).toBe(900);
  } finally {
    reopened?.Dispose();
    stored?.Dispose();
    worker?.Dispose();
    doc.Dispose();
  }
});

it("ports testFooterMarginLost with a first-page footer and minimum story height", /** Checks the original first-page footer and the 1mm lower bound. @returns Completion. */ async () => {
  const doc = await importOOXML(await geometryFixture("footer-margin-lost.docx"), {});
  try {
    const page = doc.GetPageDesc();
    expect(page.IsFirstShared()).toBe(false);
    expect(page.GetFirstMaster().GetFooter().GetFooterFormat()?.GetFrameSize().GetHeight()).toBe(
      57,
    );
    expect(geometryProperty(doc, "FooterBodyDistance", "sal_Int32")).toBe(0);
    expect(geometryProperty(doc, "FooterIsDynamicHeight", "bool")).toBe(true);
    const archive = await DocumentArchive.open(await DocxExport.WriteDocument(doc));
    const xml = await archive.readTextEntry("word/document.xml");
    expect(xml).toMatch(/<w:pgMar[^>]*w:footer="709"/u);
  } finally {
    doc.Dispose();
  }
});

it("uses the original fixed and headless variable story height paths", /** Verifies native comparison, page-story metadata and signed fixed dimensions. @returns Nothing. */ () => {
  const doc = new SwDoc();
  try {
    const first = doc.GetPageDesc().GetMaster();
    const second = doc.MakePageDesc("Story margins").GetMaster();
    const firstSpacing = first.GetULSpace();
    const plain = new HdFtDistanceGlue(first);
    expect(plain.HasHeader()).toBe(false);
    expect(plain.HasFooter()).toBe(false);
    expect(plain.m_DyaTop).toBe(firstSpacing.GetUpper());

    first.SetFormatAttr(new SwFormatHeader(true));
    first.SetFormatAttr(new SwFormatFooter(true));
    const header = first.GetHeader().GetHeaderFormat();
    const footer = first.GetFooter().GetFooterFormat();
    assert(header && footer);
    header.SetFormatAttr(new SwFormatFrameSize(SwFrameSize.Fixed, 0, 500));
    footer.SetFormatAttr(new SwFormatFrameSize(SwFrameSize.Variable));
    const ul = footer.GetULSpace().Clone();
    ul.SetUpper(123);
    ul.SetLower(70);
    footer.SetFormatAttr(ul);
    const distances = new HdFtDistanceGlue(first);
    expect(distances.HasHeader()).toBe(true);
    expect(distances.HasFooter()).toBe(true);
    expect(distances.m_DyaTop - distances.m_DyaHdrTop).toBe(500);
    expect(distances.m_DyaBottom - distances.m_DyaHdrBottom).toBe(344);
    expect(geometryProperty(doc, "HeaderIsDynamicHeight", "bool")).toBe(false);
    expect(geometryProperty(doc, "HeaderDynamicSpacing", "bool")).toBe(false);
    expect(plain.StrictEqualTopBottom(distances)).toBe(true);

    footer.SetFormatAttr(new SwFormatFrameSize(SwFrameSize.Variable, 0, 615));
    footer.SetFormatAttr(new SwHeaderAndFooterEatSpacingItem(undefined, true));
    second.SetFormatAttr(first.GetHeader());
    second.SetFormatAttr(first.GetFooter());
    const equal = new HdFtDistanceGlue(second);
    expect(equal.StrictEqualTopBottom(new HdFtDistanceGlue(first))).toBe(true);
    expect(equal.m_DyaBottom - equal.m_DyaHdrBottom).toBe(615);
    header.SetFormatAttr(new SwFormatFrameSize(SwFrameSize.Minimum, 0, 450));
    expect(equal.StrictEqualTopBottom(new HdFtDistanceGlue(first))).toBe(false);
  } finally {
    doc.Dispose();
  }
});

it("restores fixed ODF story dimensions and keeps inactive page-style properties void", /** Exercises the shared ODF map on actual native story items. @returns Completion. */ async () => {
  const doc = new SwDoc();
  let reopened: SwDoc | undefined;
  const key = unicode("HeaderHeight");
  const style = new SwXPageStyle(doc, doc.GetPageDesc());
  try {
    expect(style.getPropertyState(key)).toBe(PropertyState.AMBIGUOUS_VALUE);
    const inactive = style.getPropertyValue(key);
    try {
      expect(inactive.hasValue()).toBe(false);
    } finally {
      inactive.dispose();
    }
    const master = doc.GetPageDesc().GetMaster();
    master.SetFormatAttr(new SwFormatHeader(true));
    master.SetFormatAttr(new SwFormatFooter(true));
    const header = master.GetHeader().GetHeaderFormat();
    const footer = master.GetFooter().GetFooterFormat();
    assert(header && footer);
    header.SetFormatAttr(new SwFormatFrameSize(SwFrameSize.Fixed, 0, 320));
    expect(style.getPropertyState(key)).toBe(PropertyState.DIRECT_VALUE);
    footer.SetFormatAttr(new SwFormatFrameSize(SwFrameSize.Minimum, 0, 270));
    header.SetFormatAttr(new SwHeaderAndFooterEatSpacingItem(undefined, false));
    const zip = await DocumentArchive.open(await writeOdtDocument(doc, { title: "ODF story" }));
    const styles = (await zip.readTextEntry("styles.xml"))
      .replace("<style:header-style>", "<style:header-style><style:graphic-properties/>")
      .replace('style:dynamic-spacing="false"', 'style:dynamic-spacing="false" fo:margin="3pt"')
      .replace(
        "<style:footer-style><style:header-footer-properties",
        '<style:footer-style><style:header-footer-properties fo:margin-top="bad"',
      );
    reopened = importWriterXml(styles, undefined, { title: "ODF story" }).document;
    const restored = reopened.GetPageDesc().GetMaster();
    expect(restored.GetHeader().GetHeaderFormat()?.GetFrameSize().GetHeight()).toBe(320);
    expect(restored.GetHeader().GetHeaderFormat()?.GetULSpace().GetLower()).toBe(60);
    expect(geometryProperty(reopened, "HeaderIsDynamicHeight", "bool")).toBe(false);
    expect(geometryProperty(reopened, "HeaderDynamicSpacing", "bool")).toBe(false);
    expect(geometryProperty(reopened, "FooterIsDynamicHeight", "bool")).toBe(true);
    expect(restored.GetFooter().GetFooterFormat()?.GetFrameSize().GetHeight()).toBe(270);
    const restoredStyle = new SwXPageStyle(reopened, reopened.GetPageDesc());
    const spacing = unicode("HeaderBodyDistance");
    try {
      expect(restoredStyle.getPropertyState(spacing)).toBe(PropertyState.DIRECT_VALUE);
      restoredStyle.setPropertyToDefault(spacing);
      expect(geometryProperty(reopened, "HeaderBodyDistance", "sal_Int32")).toBe(106);
    } finally {
      spacing.dispose();
    }
  } finally {
    key.dispose();
    reopened?.Dispose();
    doc.Dispose();
  }
});
