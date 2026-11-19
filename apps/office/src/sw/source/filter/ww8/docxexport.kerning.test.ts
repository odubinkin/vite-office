/** @fileoverview Source DOCX and ODF character spacing and simple-field footer results. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../../../package/source/zippackage/document-archive";
import { SvxKerningItem } from "../../../../editeng/inc/kernitem";
import { RES_CHRATR_KERNING, WRITER_CHARACTER_WHICH_RANGES } from "../../../inc/hintids";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SwDoc } from "../../core/doc/doc";
import { projectWriterTextRuns } from "../../core/txtnode/ndtxt";
import { importOOXML } from "../../writerfilter/filter/WriterFilter";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { DocxExport } from "./docxexport";
import { readOdtDocument } from "../xml/swxml";
import { writeOdtDocument } from "../xml/wrtxml";

it("retains spacing in named styles and opens a locked simple field in its footer", /** Exercises original OOXML attributes, Writer style owners and primary ODT persistence. @returns Completion. */ async () => {
  const source = await DocumentArchive.open(
    new Uint8Array(
      readFileSync(
        "../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/NumberedList.docx",
      ),
    ),
  );
  const packageWriter = new DocumentArchiveWriter();
  const styles = await source.readTextEntry("word/styles.xml");
  const main = await source.readTextEntry("word/document.xml");
  const replacements = new Map([
    [
      "word/document.xml",
      main
        .replace("</w:sectPr>", "<w:titlePg/></w:sectPr>")
        .replace("</w:tblPr>", '<w:tblOverlap w:val="never"/></w:tblPr>'),
    ],
    [
      "word/styles.xml",
      styles
        .replace(
          /(<w:style\b[^>]*w:styleId="Heading1"[^>]*>[\s\S]*?<w:rPr>)/u,
          '$1<w:spacing w:val="5"/>',
        )
        .replace(
          /(<w:style\b[^>]*w:styleId="Emphasis"[^>]*>[\s\S]*?<w:rPr>)/u,
          '$1<w:spacing w:val="10"/>',
        ),
    ],
    [
      "word/footer1.xml",
      '<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:fldSimple w:instr=" PAGE " w:fldLock="true"><w:r><w:t>2</w:t></w:r></w:fldSimple></w:p></w:ftr>',
    ],
  ]);
  const encoder = new TextEncoder();
  for (const name of source.getEntryNames()) {
    const xml = replacements.get(name);
    packageWriter.putNextEntry(
      name,
      xml === undefined ? await source.readEntry(name) : encoder.encode(xml),
    );
  }
  const doc = await importOOXML(await packageWriter.finish(), {});
  let stored: SwDoc | undefined;
  let reopened: SwDoc | undefined;
  try {
    const metadata = { title: "Character spacing and simple fields" };
    const odt = await writeOdtDocument(doc, metadata);
    const odtArchive = await DocumentArchive.open(odt);
    expect(await odtArchive.readTextEntry("styles.xml")).toMatch(
      /fo:letter-spacing="0\.0(?:09|18)cm"/,
    );
    stored = (await readOdtDocument(odt, metadata)).document;
    const docx = await DocxExport.WriteDocument(stored);
    const wordArchive = await DocumentArchive.open(docx);
    expect(await wordArchive.readTextEntry("word/styles.xml")).toContain('<w:spacing w:val="10"/>');
    reopened = await importOOXML(docx, {});
    for (const candidate of [doc, stored, reopened]) {
      const page = candidate.GetPageDesc();
      expect(page.IsFirstShared()).toBe(false);
      for (const [variant, expected] of [
        [page.GetMaster(), "2"],
        [page.GetFirstMaster(), ""],
      ] as const) {
        const start = variant
          .GetFooter()
          .GetFooterFormat()
          ?.GetContent()
          .GetContentIdx()
          ?.GetNode();
        assert(start?.IsStartNode());
        expect(start.GetNodes().GetSectionContent(start)[0]?.GetTextNode()?.GetText().trim()).toBe(
          expected,
        );
      }
      const heading = candidate
        .GetTextFormatColl("heading-1")
        .GetAttrSet()
        .GetItemIfSet(RES_CHRATR_KERNING, false);
      const emphasis = candidate
        .FindCharFormatByName("Emphasis")
        ?.GetAttrSet()
        .GetItemIfSet(RES_CHRATR_KERNING, false);
      assert(heading instanceof SvxKerningItem && emphasis instanceof SvxKerningItem);
      expect(heading.GetValue()).toBe(5);
      expect(emphasis.GetValue()).toBe(10);
    }
  } finally {
    reopened?.Dispose();
    stored?.Dispose();
    doc.Dispose();
  }
});

it("carries a negative spacing value through direct runs, Worker transfer and Word output", /** Checks the native item and the UI's run projection after restoration. @returns Completion. */ async () => {
  const doc = new SwDoc();
  const node = doc.paragraphs[0];
  assert(node);
  const item = new SvxKerningItem(-20, RES_CHRATR_KERNING);
  const set = new SfxItemSet(doc.GetAttrPool(), WRITER_CHARACTER_WHICH_RANGES);
  node.SetText("A B");
  const metadata = { title: "Character spacing" };
  let worker: SwDoc | undefined;
  let stored: SwDoc | undefined;
  let reopened: SwDoc | undefined;
  try {
    set.Put(item);
    node.SetAttr(set, 0, 1);
    worker = decodeWriterDocument(structuredClone(encodeWriterDocument(doc)));
    expect(projectWriterTextRuns(node)[0]?.attributes.kerningTwips).toBe(-20);
    expect(projectWriterTextRuns(worker.paragraphs[0])[0]?.attributes.kerningTwips).toBe(-20);
    const odt = await writeOdtDocument(worker, metadata);
    expect(await (await DocumentArchive.open(odt)).readTextEntry("content.xml")).toContain(
      'fo:letter-spacing="-0.035cm"',
    );
    stored = (await readOdtDocument(odt, metadata)).document;
    expect(projectWriterTextRuns(stored.paragraphs[0])[0]?.attributes.kerningTwips).toBe(-20);
    const docx = await DocxExport.WriteDocument(stored);
    expect(await (await DocumentArchive.open(docx)).readTextEntry("word/document.xml")).toContain(
      '<w:spacing w:val="-20"/>',
    );
    reopened = await importOOXML(docx, {});
    for (const candidate of [doc, worker, stored, reopened]) {
      const runs = projectWriterTextRuns(candidate.paragraphs[0]);
      expect(runs[0]?.text).toBe("A");
      expect(runs[0]?.attributes.kerningTwips).toBe(-20);
      expect(runs[1]?.text).toBe(" B");
    }
  } finally {
    set.Dispose();
    item.Dispose();
    reopened?.Dispose();
    stored?.Dispose();
    worker?.Dispose();
    doc.Dispose();
  }
});
