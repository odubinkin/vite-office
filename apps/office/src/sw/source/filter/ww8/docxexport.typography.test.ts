/** @fileoverview Original Writer stylistic-set and contextual-alternates DOCX acceptance. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../../../package/source/zippackage/document-archive";
import { SfxGrabBagItem } from "../../../../svl/inc/grabbagitem";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { RES_CHRATR_GRABBAG } from "../../../inc/hintids";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import type { SwDoc } from "../../core/doc/doc";
import { GetPropertyValue } from "../../core/unocore/unocrsrhelper";
import { readTextEffect } from "../../writerfilter/dmapper/TextEffectsHandler";
import { importOOXML } from "../../writerfilter/filter/WriterFilter";
import { readOdtDocument } from "../xml/swxml";
import { writeOdtDocument } from "../xml/wrtxml";
import { DocxExport } from "./docxexport";

const fixture =
  "../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/TextEffects_StylisticSets_CntxtAlts.docx";

/** Reads a native UNO character interoperability property in the text. @param doc - Writer model. @param paragraph - Paragraph index. @param offset - Character index. @param name - Effect name. @returns Native typographic attributes. */
function readRunEffect(doc: SwDoc, paragraph: number, offset: number, name: string) {
  const node = doc.paragraphs[paragraph];
  assert(node);
  const start = new SwPosition(node, offset);
  const end = new SwPosition(node, offset + 1);
  const range = new SwPaM(start, end);
  const value = GetPropertyValue(range, "CharInteropGrabBag");
  const bag = new SfxGrabBagItem(RES_CHRATR_GRABBAG);
  try {
    expect(bag.PutValue(value)).toBe(true);
    const effect = bag.GetGrabBag().get(name);
    return effect && readTextEffect(name, effect);
  } finally {
    bag.Dispose();
    value.dispose();
    range.Dispose();
    end.Dispose();
    start.Dispose();
  }
}

it("preserves the unchanged upstream stylistic sets and contextual alternates through DOCX", /** Ports Test_TextEffects_StylisticSets_CntxtAlts and Test_McIgnorable. @returns Completion. */ async () => {
  const document = await importOOXML(new Uint8Array(readFileSync(fixture)), {});
  let worker: SwDoc | undefined;
  let reopened: SwDoc | undefined;
  let odt: SwDoc | undefined;
  try {
    worker = decodeWriterDocument(structuredClone(encodeWriterDocument(document)));
    const bytes = await DocxExport.WriteDocument(worker);
    const archive = await DocumentArchive.open(bytes);
    const xml = await archive.readTextEntry("word/document.xml");
    expect(xml).toContain('mc:Ignorable="w14 wp14 w15"');
    expect(await archive.readTextEntry("word/styles.xml")).toContain('mc:Ignorable="w14"');
    expect(xml).toContain(
      '<w14:stylisticSets><w14:styleSet w14:id="4"/></w14:stylisticSets></w:rPr><w:t>StylisticSets1</w:t>',
    );
    expect(xml).toContain(
      '<w14:stylisticSets><w14:styleSet w14:id="2"/></w14:stylisticSets></w:rPr><w:t>StylisticSets2</w:t>',
    );
    expect(xml).toContain("<w14:cntxtAlts><w14:cntxtAlts/></w14:cntxtAlts>");
    reopened = await importOOXML(bytes, {});
    for (const doc of [document, worker, reopened]) {
      expect(readRunEffect(doc, 0, 0, "CharStylisticSetsTextEffect")).toEqual([
        "stylisticSets",
        [["styleSet", [["id", 4]]]],
      ]);
      expect(
        readRunEffect(doc, 0, "StylisticSets1 ".length, "CharStylisticSetsTextEffect"),
      ).toEqual(["stylisticSets", [["styleSet", [["id", 2]]]]]);
      expect(readRunEffect(doc, 1, 0, "CharCntxtAltsTextEffect")).toEqual([
        "cntxtAlts",
        [["cntxtAlts", []]],
      ]);
    }
    odt = (
      await readOdtDocument(await writeOdtDocument(worker, { title: "Typography" }), {
        title: "Typography",
      })
    ).document;
    expect(odt.paragraphs[0]?.GetText()).toBe("StylisticSets1 StylisticSets2");
    expect(odt.paragraphs[1]?.GetText()).toBe("ContextualAlternatives");
  } finally {
    odt?.Dispose();
    reopened?.Dispose();
    worker?.Dispose();
    document.Dispose();
  }
});

it("keeps numeric style IDs and all original toggle spellings in ordered style-set children", /** Exercises typed nested attributes and the scalar contextual-alternate asymmetry. @returns Completion. */ async () => {
  const archive = await DocumentArchive.open(new Uint8Array(readFileSync(fixture)));
  const writer = new DocumentArchiveWriter();
  for (const part of archive.getEntryNames()) {
    if (part === "word/document.xml") {
      const xml = (await archive.readTextEntry(part))
        .replace(
          '<w14:styleSet w14:id="4"/>',
          '<w14:styleSet w14:val="0" w14:id="4"/><w14:styleSet w14:id="18" w14:val="false"/><w14:styleSet w14:id="2" w14:val="1"/><w14:styleSet w14:id="8" w14:val="true"/><w14:styleSet/>',
        )
        .replace("<w14:cntxtAlts/>", '<w14:cntxtAlts w14:val="0"/>');
      writer.putNextEntry(part, new TextEncoder().encode(xml));
    } else writer.putNextEntry(part, await archive.readEntry(part));
  }
  const doc = await importOOXML(await writer.finish(), {});
  try {
    const saved = await DocumentArchive.open(await DocxExport.WriteDocument(doc));
    const xml = await saved.readTextEntry("word/document.xml");
    expect(xml).toContain(
      '<w14:styleSet w14:id="4" w14:val="0"/><w14:styleSet w14:id="18" w14:val="false"/><w14:styleSet w14:id="2" w14:val="1"/><w14:styleSet w14:id="8" w14:val="true"/><w14:styleSet/>',
    );
    expect(xml).toContain("<w14:cntxtAlts><w14:cntxtAlts/></w14:cntxtAlts>");
  } finally {
    doc.Dispose();
  }
});
