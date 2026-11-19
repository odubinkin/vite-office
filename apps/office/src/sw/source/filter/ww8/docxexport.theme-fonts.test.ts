/** @fileoverview Native DOCX font scheme, theme languages, run fonts and document defaults. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import type { SvxFontItem } from "../../../../editeng/inc/fontitem";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../../../package/source/zippackage/document-archive";
import { RES_CHRATR_FONT, RES_CHRATR_CJK_FONT, RES_CHRATR_CTL_FONT } from "../../../inc/hintids";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { effectiveItem, SetPropertyValue, stringAny } from "../../core/unocore/unocrsrhelper";
import type { SwDoc } from "../../core/doc/doc";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { importOOXML } from "../../writerfilter/filter/WriterFilter";
import { readOdtDocument } from "../xml/swxml";
import { writeOdtDocument } from "../xml/wrtxml";
import { DocxExport } from "./docxexport";

const fixturePath =
  "../../vendor/libreoffice-reference/sw/qa/core/theme/data/ThemeColorInHeading.docx";

/** Reads the actual first run script-family items. @param doc - Writer document. @returns Effective font names. */
function runFonts(doc: SwDoc): string[] {
  const node = doc.paragraphs[0];
  assert(node);
  return [RES_CHRATR_FONT, RES_CHRATR_CJK_FONT, RES_CHRATR_CTL_FONT].map(
    /** Reads the native script-family item. @param which - Writer WhichId. @returns Family. */
    (which) => (effectiveItem(node, 0, which) as SvxFontItem).GetFamilyName(),
  );
}

it("retains the complete pinned font scheme when DOCX is reopened", /** Ports the source Writer font scheme QA. @returns Completion. */ async () => {
  const source = await importOOXML(new Uint8Array(readFileSync(fixturePath)), {});
  let reopened: SwDoc | undefined;
  try {
    reopened = await importOOXML(await DocxExport.WriteDocument(source), {});
    for (const doc of [source, reopened]) {
      const scheme = doc.theme?.fontScheme;
      assert(scheme);
      expect(scheme.majorFont.get("latin")?.typeface).toBe("Noto Sans");
      expect(scheme.minorFont.get("latin")?.typeface).toBe("Calibri");
      expect(scheme.majorSupplemental).toHaveLength(47);
      expect(scheme.minorSupplemental).toHaveLength(47);
      expect(scheme.majorSupplemental).toContainEqual({ script: "Thai", typeface: "Angsana New" });
      expect(scheme.minorSupplemental).toContainEqual({ script: "Thai", typeface: "Cordia New" });
    }
  } finally {
    reopened?.Dispose();
    source.Dispose();
  }
});

it("resolves Strict themed fonts and retains references until a concrete family changes", /** Exercises settings, native defaults, Worker transfer and a direct edit. @returns Completion. */ async () => {
  const fixture = await DocumentArchive.open(new Uint8Array(readFileSync(fixturePath)));
  const writer = new DocumentArchiveWriter();
  const ns = 'xmlns:w="http://purl.oclc.org/ooxml/wordprocessingml/main"';
  const parts = new Map([
    [
      "word/settings.xml",
      `<w:settings ${ns}><w:themeFontLang w:bidi="th-TH" w:eastAsia="ja-JP" w:val="en-US"/></w:settings>`,
    ],
    [
      "word/styles.xml",
      `<w:styles ${ns}><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:asciiTheme="minorAscii"/></w:rPr></w:rPrDefault></w:docDefaults></w:styles>`,
    ],
    [
      "word/document.xml",
      `<w:document ${ns}><w:body><w:p><w:r><w:rPr><w:rFonts w:asciiTheme="majorAscii" w:ascii="Literal fallback" w:hAnsiTheme="minorHAnsi" w:eastAsiaTheme="minorEastAsia" w:cstheme="majorBidi"/></w:rPr><w:t>ABC 日本 ไทย</w:t></w:r></w:p></w:body></w:document>`,
    ],
  ]);
  for (const part of fixture.getEntryNames()) {
    const xml = parts.get(part);
    writer.putNextEntry(
      part,
      xml === undefined ? await fixture.readEntry(part) : new TextEncoder().encode(xml),
    );
  }
  const source = await importOOXML(await writer.finish(), {});
  let copy: SwDoc | undefined;
  let persisted: SwDoc | undefined;
  let reopened: SwDoc | undefined;
  try {
    expect(runFonts(source)).toEqual(["Noto Sans", "游明朝", "Angsana New"]);
    copy = decodeWriterDocument(structuredClone(encodeWriterDocument(source)));
    expect(runFonts(copy)).toEqual(runFonts(source));
    expect((copy.GetDefault(RES_CHRATR_FONT) as SvxFontItem).GetFamilyName()).toBe("Calibri");
    const bytes = await DocxExport.WriteDocument(copy);
    const archive = await DocumentArchive.open(bytes);
    const body = await archive.readTextEntry("word/document.xml");
    for (const expected of [
      'w:asciiTheme="majorAscii"',
      'w:hAnsiTheme="minorHAnsi"',
      'w:eastAsiaTheme="minorEastAsia"',
      'w:cstheme="majorBidi"',
    ])
      expect(body).toContain(expected);
    expect(await archive.readTextEntry("word/styles.xml")).toContain('w:asciiTheme="minorAscii"');
    expect(await archive.readTextEntry("word/settings.xml")).toContain(
      'w:eastAsia="ja-JP" w:bidi="th-TH"',
    );
    reopened = await importOOXML(bytes, {});
    expect(runFonts(reopened)).toEqual(runFonts(source));
    const odtBytes = await writeOdtDocument(source, { title: "Theme fonts" });
    const odt = await DocumentArchive.open(odtBytes);
    expect(await odt.readTextEntry("styles.xml")).toMatch(
      /<style:default-style style:family="paragraph"><style:text-properties[^>]+style:font-name="Calibri"/u,
    );
    persisted = (await readOdtDocument(odtBytes, { title: "Theme fonts" })).document;
    expect(runFonts(persisted)).toEqual(runFonts(source));

    const node = copy.paragraphs[0];
    assert(node);
    const first = new SwPosition(node, 0);
    const last = new SwPosition(node, 1);
    const range = new SwPaM(first, last);
    const font = stringAny("Liberation Serif");
    try {
      SetPropertyValue(range, "CharFontName", font);
    } finally {
      font.dispose();
      range.Dispose();
      first.Dispose();
      last.Dispose();
    }
    const changed = await DocumentArchive.open(await DocxExport.WriteDocument(copy));
    const updated = await changed.readTextEntry("word/document.xml");
    const editedRun =
      /<w:r><w:rPr>([\s\S]*?)<\/w:rPr><w:t>A<\/w:t><\/w:r>/u.exec(updated)?.[1] ?? "";
    expect(editedRun).toContain('w:ascii="Liberation Serif"');
    expect(editedRun).not.toContain('w:asciiTheme="majorAscii"');
    expect(editedRun).not.toContain('w:hAnsiTheme="minorHAnsi"');
    expect(editedRun).toContain('w:eastAsiaTheme="minorEastAsia"');
  } finally {
    reopened?.Dispose();
    copy?.Dispose();
    persisted?.Dispose();
    source.Dispose();
  }
});
