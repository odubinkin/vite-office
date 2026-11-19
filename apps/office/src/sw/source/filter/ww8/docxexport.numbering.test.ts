/** @fileoverview Native Writer lists through DOCX import, package export and reopen. */
import { readFileSync } from "node:fs";
import { assert, expect, it, vi } from "vitest";
import { SvxAdjust, SvxNumType } from "../../../../editeng/inc/svxenum";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { SwDoc } from "../../core/doc/doc";
import { applyWriterParagraphList } from "../../core/doc/list";
import { SwNumFormat } from "../../core/doc/number";
import { importOOXML } from "../../writerfilter/filter/WriterFilter";
import { readOdtDocument } from "../xml/swxml";
import { writeOdtDocument } from "../xml/wrtxml";
import { DocxExport } from "./docxexport";

// These fixtures unpack and reopen native document packages under coverage.
vi.setConfig({ testTimeout: 120_000 });

it("preserves the direct list over the inherited style in numbering1.docx", /** Exercises the upstream testNumbering1 input and actual body and numbering part references. @returns Completion. */ async () => {
  const fixture = readFileSync(
    "../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/numbering1.docx",
  );
  const original = await importOOXML(new Uint8Array(fixture), {});
  let reopened: SwDoc | undefined, primary: SwDoc | undefined;
  try {
    const output = await DocxExport.WriteDocument(original);
    const archive = await DocumentArchive.open(output);
    const documentXml = await archive.readTextEntry("word/document.xml");
    const relationships = await archive.readTextEntry("word/_rels/document.xml.rels");
    const numberingXml = await archive.readTextEntry("word/numbering.xml");
    expect(relationships).toContain('Target="numbering.xml"');
    expect(numberingXml).toContain('<w:numFmt w:val="decimal"/>');
    expect(documentXml.match(/<w:numPr>/g)).toHaveLength(7);
    reopened = await importOOXML(output, {});
    const metadata = { title: "Numbering" };
    const odt = await writeOdtDocument(original, metadata);
    const odtStyles = await (await DocumentArchive.open(odt)).readTextEntry("styles.xml");
    expect(odtStyles).toContain('style:num-format="a" style:num-letter-sync="true"');
    primary = (await readOdtDocument(odt, metadata)).document;
    for (const doc of [original, reopened, primary]) {
      const first = doc.paragraphs[0];
      assert(first);
      expect(first.GetText()).toBe("Text1.");
      expect(first.GetNumRule()?.Get(0).GetNumberingType()).toBe(SvxNumType.SVX_NUM_ARABIC);
      expect(
        doc.paragraphs.map(
          /** Reads level from the native list tree. @param paragraph - Actual text node. @returns List level. */
          (paragraph) => paragraph.GetActualListLevel(),
        ),
      ).toEqual([0, 1, 1, 0, 1, 1, 2]);
    }
  } finally {
    primary?.Dispose();
    reopened?.Dispose();
    original.Dispose();
  }
});

it("preserves native restart gaps and bullet labels through the written numbering relationships", /** Exercises scoped restarts, level geometry and font registration on the active Writer graph. @returns Completion. */ async () => {
  const original = new SwDoc();
  let reopened: SwDoc | undefined;
  try {
    const first = original.paragraphs[0];
    assert(first);
    first.SetText("Start");
    applyWriterParagraphList(first, { kind: "numbered", ruleName: "Numbers" });
    const second = original.nodes.MakeTextNode("Restart");
    applyWriterParagraphList(second, {
      kind: "numbered",
      ruleName: "Numbers",
      level: 2,
      restart: true,
      startValue: 7,
    });
    const third = original.nodes.MakeTextNode("Bullet");
    applyWriterParagraphList(third, { kind: "bullet", ruleName: "Bullets" });
    const output = await DocxExport.WriteDocument(original);
    const archive = await DocumentArchive.open(output);
    const numbering = await archive.readTextEntry("word/numbering.xml");
    expect(numbering).toContain('<w:lvlOverride w:ilvl="0"><w:startOverride w:val="1"/>');
    expect(numbering).toContain('<w:lvlOverride w:ilvl="1"><w:startOverride w:val="1"/>');
    expect(numbering).toContain('<w:lvlOverride w:ilvl="2"><w:startOverride w:val="7"/>');
    expect(numbering).toContain('<w:numFmt w:val="bullet"/>');
    expect(numbering).toContain("<w:rFonts");
    reopened = await importOOXML(output, {});
    expect(reopened.paragraphs[1]?.GetActualListLevel()).toBe(2);
    expect(reopened.paragraphs[1]?.IsListRestart()).toBe(true);
    expect(reopened.paragraphs[1]?.GetActualListStartValue()).toBe(7);
    expect(reopened.paragraphs[2]?.GetListKind()).toBe("bullet");
  } finally {
    reopened?.Dispose();
    original.Dispose();
  }
});

it("omits the numbering fragment for a plain document", /** Leaves unnumbered exports without an unused relationship. @returns Completion. */ async () => {
  const document = new SwDoc();
  try {
    const archive = await DocumentArchive.open(await DocxExport.WriteDocument(document));
    expect(archive.getEntryNames()).not.toContain("word/numbering.xml");
  } finally {
    document.Dispose();
  }
});

it("writes list geometry overrides and preserves the pinned gap cursor", /** Checks actual list definitions with a changed format and two restart levels. @returns Completion. */ async () => {
  const doc = new SwDoc();
  try {
    const first = doc.paragraphs[0];
    assert(first);
    applyWriterParagraphList(first, { kind: "numbered", ruleName: "Base", listId: "Shared" });
    const second = doc.nodes.MakeTextNode("First changed level");
    applyWriterParagraphList(second, {
      kind: "numbered",
      ruleName: "Changed",
      listId: "Shared",
      level: 1,
      restart: true,
      startValue: 4,
    });
    const third = doc.nodes.MakeTextNode("Second changed level");
    applyWriterParagraphList(third, {
      kind: "numbered",
      ruleName: "Changed",
      listId: "Shared",
      level: 2,
      restart: true,
      startValue: 7,
    });
    const rule = second.GetNumRule();
    assert(rule);
    const firstLevel = new SwNumFormat(rule.Get(0));
    const secondLevel = new SwNumFormat(rule.Get(1));
    try {
      firstLevel.SetStart(0);
      firstLevel.SetNumAdjust(SvxAdjust.Center);
      secondLevel.SetNumberingType(SvxNumType.SVX_NUM_ARABIC_ZERO3);
      secondLevel.SetNumAdjust(SvxAdjust.Right);
      secondLevel.SetIsLegal(true);
      secondLevel.SetLabelFollowedBy("space");
      secondLevel.SetFirstLineIndent(180);
      rule.Set(0, firstLevel);
      rule.Set(1, secondLevel);
    } finally {
      firstLevel.Dispose();
      secondLevel.Dispose();
    }
    const zip = await DocumentArchive.open(await DocxExport.WriteDocument(doc));
    const xml = await zip.readTextEntry("word/numbering.xml");
    expect(xml).toContain('<w:lvlJc w:val="center"/>');
    expect(xml).toContain('<w:lvlJc w:val="right"/>');
    expect(xml).toContain('<w:suff w:val="space"/>');
    expect(xml).toContain('w:firstLine="180"');
    expect(xml).toContain("<w:isLgl/>");
    expect(xml).toContain(
      '<mc:Choice Requires="w14"><w:numFmt w:val="custom" w:format="001, 002, 003, ..."/>',
    );
    expect(xml).toContain('<w:lvlOverride w:ilvl="1"><w:startOverride w:val="4"/>');
    expect(xml).toContain('<w:lvlOverride w:ilvl="1"><w:startOverride w:val="1"/>');
    expect(xml).toContain('<w:lvlOverride w:ilvl="2"><w:startOverride w:val="7"/>');
  } finally {
    doc.Dispose();
  }
});
