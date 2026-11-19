/** @fileoverview Native Word sections through the Writer graph and both package filters. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { SvxFrameDirection } from "../../../../editeng/inc/frmdir";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../../../package/source/zippackage/document-archive";
import { RES_PAGEDESC } from "../../../inc/hintids";
import { SwFormatPageDesc } from "../../core/attr/fmtpdsc";
import { SwDoc } from "../../core/doc/doc";
import { UseOnPage } from "../../core/layout/pagedesc";
import { importOOXML } from "../../writerfilter/filter/WriterFilter";
import { readOdtDocument } from "../xml/swxml";
import { writeOdtDocument } from "../xml/wrtxml";
import { DocxExport } from "./docxexport";

/** Opens the exported body using the shared package reader. @param doc - Writer document. @returns Main part XML. */
async function documentXml(doc: SwDoc): Promise<string> {
  return (await DocumentArchive.open(await DocxExport.WriteDocument(doc))).readTextEntry(
    "word/document.xml",
  );
}

it("binds section geometry and restart to the next native paragraph across DOCX and ODT", /** Exercises paragraph and terminal section placement. @returns Completion. */ async () => {
  const doc = new SwDoc();
  let imported: SwDoc | undefined, saved: SwDoc | undefined;
  try {
    const first = doc.paragraphs[0];
    assert(first);
    first.SetText("Portrait");
    const standard = doc.GetPageDesc();
    standard.SetValue({ ...standard.GetValue(), width: 12000, height: 16000, leftMargin: 900 });
    const second = doc.nodes.MakeTextNode("Landscape");
    const wide = doc.MakePageDesc("Wide");
    const geometry = { width: 15000, height: 10000, landscape: true, leftMargin: 1700 };
    wide.SetValue({ ...wide.GetValue(), ...geometry });
    second.SetAttr(new SwFormatPageDesc(wide.GetName(), 7));

    const xml = await documentXml(doc);
    expect(xml).toContain(
      '<w:pPr><w:pStyle w:val="Normal"/><w:rPr></w:rPr><w:sectPr><w:type w:val="nextPage"/>',
    );
    expect(xml).toContain('<w:pgSz w:w="12000" w:h="16000"/>');
    expect(xml).toContain('<w:pgMar w:left="900"');
    expect(xml).toContain('</w:p><w:sectPr><w:type w:val="nextPage"/>');
    expect(xml).toContain('<w:pgSz w:orient="landscape" w:w="15000" w:h="10000"/>');
    expect(xml).toContain('<w:pgNumType w:start="7" w:fmt="decimal"/>');

    imported = await importOOXML(await DocxExport.WriteDocument(doc), {});
    expect(
      imported.paragraphs.map(
        /** Reads each native paragraph in body order. @param paragraph - Body paragraph. @returns Text. */ (
          paragraph,
        ) => paragraph.GetText(),
      ),
    ).toEqual(["Portrait", "Landscape"]);
    expect(imported.GetPageDesc().GetValue()).toMatchObject({
      width: 12000,
      height: 16000,
      leftMargin: 900,
    });
    const assignment = imported.paragraphs[1]?.GetpSwAttrSet()?.GetItemIfSet(RES_PAGEDESC, false);
    assert(assignment instanceof SwFormatPageDesc);
    expect(assignment.GetNumOffset()).toBe(7);
    // PaperInfo::sloppyFitPageDimension snaps the imported height to the nearby standard size.
    expect(imported.FindPageDesc(assignment.GetPageDescName())?.GetValue()).toMatchObject({
      ...geometry,
      height: 9978,
    });
    const metadata = { title: "Page sections" };
    saved = (await readOdtDocument(await writeOdtDocument(imported, metadata), metadata)).document;
    expect(await documentXml(saved)).toContain('<w:pgNumType w:start="7" w:fmt="decimal"/>');
  } finally {
    saved?.Dispose();
    imported?.Dispose();
    doc.Dispose();
  }
});

it("exports the first native page, caps Word dimensions and preserves right-to-left writing", /** Exercises the first and last section being the same native style. @returns Completion. */ async () => {
  const doc = new SwDoc();
  let imported: SwDoc | undefined;
  try {
    const first = doc.paragraphs[0];
    assert(first);
    const page = doc.MakePageDesc("Right to left");
    page.SetValue({ ...page.GetValue(), width: 68000, height: 70000 });
    const direction = page.GetMaster().GetFrameDir().Clone();
    direction.SetValue(SvxFrameDirection.Horizontal_RL_TB);
    page.GetMaster().SetFormatAttr(direction);
    first.SetText("يمين");
    first.SetAttr(new SwFormatPageDesc(page.GetName(), 0));
    const xml = await documentXml(doc);
    expect(xml.match(/<w:sectPr>/g)).toHaveLength(1);
    expect(xml).toContain('<w:pgSz w:w="65500" w:h="65500"/>');
    expect(xml).toContain('<w:pgNumType w:start="0" w:fmt="decimal"/>');
    expect(xml).toContain('<w:textDirection w:val="lrTb"/><w:bidi/>');
    imported = await importOOXML(await DocxExport.WriteDocument(doc), {});
    expect(imported.GetPageDesc().GetMaster().GetFrameDir().GetValue()).toBe(
      SvxFrameDirection.Horizontal_RL_TB,
    );
  } finally {
    imported?.Dispose();
    doc.Dispose();
  }
});

it("round trips landscape paper and margins from a pinned LibreOffice document", /** Imports concrete paper and margin data from Word. @returns Completion. */ async () => {
  const bytes = readFileSync(
    "../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/tdf138345_charStyleHighlight.docx",
  );
  const imported = await importOOXML(new Uint8Array(bytes), {});
  try {
    const geometry = imported.GetPageDesc().GetValue();
    expect(geometry).toMatchObject({ landscape: true, leftMargin: 1134, rightMargin: 1134 });
    const xml = await documentXml(imported);
    expect(xml).toContain(
      `<w:pgSz w:orient="landscape" w:w="${geometry.width}" w:h="${geometry.height}"/>`,
    );
  } finally {
    imported.Dispose();
  }
});

it("exports table-owned page styles and places a following section break outside the table", /** Exercises a parity style and the structural paragraph required by Word. @returns Completion. */ async () => {
  const doc = new SwDoc();
  try {
    const next = doc.paragraphs[0];
    assert(next);
    next.SetText("Next page");
    const table = doc.nodes.MakeTableNodeBefore(next, "First block", {});
    doc.nodes.AppendTableRow(table, 1);
    const even = doc.MakePageDesc("Even");
    even.SetUseOn(UseOnPage.Left);
    table.GetFrameFormat().SetFormatAttr(new SwFormatPageDesc(even.GetName(), 4));
    next.SetAttr(new SwFormatPageDesc(doc.GetPageDesc().GetName()));
    const xml = await documentXml(doc);
    expect(xml).toContain('</w:tbl><w:p><w:pPr><w:sectPr><w:type w:val="evenPage"/>');
    expect(xml).toContain('<w:pgNumType w:start="4" w:fmt="decimal"/>');
    expect(xml).toContain('</w:p><w:sectPr><w:type w:val="nextPage"/>');
  } finally {
    doc.Dispose();
  }
});

it.each([
  ["tdf86926_A3.docx", { width: 16838, height: 23811, landscape: false }],
  ["tdf96750_landscapeFollow.docx", { landscape: true }],
] as const)(
  "keeps the native Standard paper geometry from the page-size element in %s",
  /** Replays the original geometry assertions independently of pending shape and linked-settings imports. @param fixture - Original Word file. @param expected - Native page geometry. @returns Completion. */ async (
    fixture,
    expected,
  ) => {
    const bytes = readFileSync(
      `../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/${fixture}`,
    );
    const source = await DocumentArchive.open(new Uint8Array(bytes));
    const sourceXml = await source.readTextEntry("word/document.xml");
    const paper = sourceXml.match(/<w:pgSz\b[^>]*\/>/)?.[0];
    assert(paper);
    const reduced = new DocumentArchiveWriter();
    for (const part of ["[Content_Types].xml", "_rels/.rels"])
      reduced.putNextEntry(part, await source.readEntry(part));
    reduced.putNextEntry(
      "word/document.xml",
      new TextEncoder().encode(
        `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p/><w:sectPr>${paper}</w:sectPr></w:body></w:document>`,
      ),
    );
    const opened = await importOOXML(await reduced.finish(), {});
    let reloaded: SwDoc | undefined;
    try {
      expect(opened.GetPageDesc().GetValue()).toMatchObject(expected);
      reloaded = await importOOXML(await DocxExport.WriteDocument(opened), {});
      expect(reloaded.GetPageDesc().GetValue()).toMatchObject(expected);
    } finally {
      reloaded?.Dispose();
      opened.Dispose();
    }
  },
);
