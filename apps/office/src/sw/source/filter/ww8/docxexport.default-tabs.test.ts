/** @fileoverview Native default tab distance through Writer's document pool, DOCX, ODT and the Worker transfer. */
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { SvxTabAdjust, type SvxTabStopItem } from "../../../../editeng/inc/tstpitem";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { RES_PARATR_TABSTOP } from "../../../inc/hintids";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { createWriterDocument, type SwDoc } from "../../core/doc/doc";
import { unicode } from "../../core/unocore/unocrsrhelper";
import { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import { importOOXML } from "../../writerfilter/filter/WriterFilter";
import { readOdtDocument } from "../xml/swxml";
import { writeOdtDocument } from "../xml/wrtxml";
import { DocxExport } from "./docxexport";

const upstream = "../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/";

/** Reads the standard tab through the original UNO property and checks the underlying item. @param document - Writer model. @param twips - Canonical distance. @param mm100 - UNO distance. @returns Nothing. */
function expectDefaultTab(document: SwDoc, twips: number, mm100: number): void {
  const name = unicode("TabStopDistance");
  const value = new SwXTextDocument(document).createTextDefaults().getPropertyValue(name);
  try {
    const output: [number] = [0];
    expect(value.extract(output, "sal_Int32")).toBe(true);
    expect(output[0]).toBe(mm100);
    const item = document.GetDefault(RES_PARATR_TABSTOP) as SvxTabStopItem;
    expect(item.Count()).toBe(1);
    expect(item.At(0).GetAdjustment()).toBe(SvxTabAdjust.Default);
    expect(item.At(0).GetTabPos()).toBe(twips);
  } finally {
    value.dispose();
    name.dispose();
  }
}

it("retains the original 840-twip DOCX setting in the document and both file formats", /** Uses the unchanged upstream fdo80902 fixture and an actual structured clone. @returns Completion. */ async () => {
  const source = await importOOXML(new Uint8Array(readFileSync(upstream + "fdo80902.docx")), {});
  let worker: SwDoc | undefined;
  let reopened: SwDoc | undefined;
  let odt: SwDoc | undefined;
  try {
    expectDefaultTab(source, 840, 1482);
    worker = decodeWriterDocument(structuredClone(encodeWriterDocument(source)));
    expectDefaultTab(worker, 840, 1482);
    const docx = await DocxExport.WriteDocument(worker);
    const archive = await DocumentArchive.open(docx);
    expect(await archive.readTextEntry("word/settings.xml")).toContain(
      '<w:defaultTabStop w:val="840"/>',
    );
    reopened = await importOOXML(docx, {});
    expectDefaultTab(reopened, 840, 1482);

    const odtBytes = await writeOdtDocument(worker, { title: "Tab stops" });
    const odf = await DocumentArchive.open(odtBytes);
    expect(await odf.readTextEntry("styles.xml")).toContain('style:tab-stop-distance="1.4817cm"');
    odt = (await readOdtDocument(odtBytes, { title: "Tab stops" })).document;
    expectDefaultTab(odt, 840, 1482);
  } finally {
    odt?.Dispose();
    reopened?.Dispose();
    worker?.Dispose();
    source.Dispose();
  }
});

it("ports the empty ODT default-tab assertion without creating an explicit Normal style tab", /** Checks defaultTabStopNotInStyles against the unchanged upstream empty package. @returns Completion. */ async () => {
  const source = (
    await readOdtDocument(new Uint8Array(readFileSync(upstream + "empty.odt")), { title: "Empty" })
  ).document;
  let reopened: SwDoc | undefined;
  try {
    expectDefaultTab(source, 720, 1270);
    const docx = await DocxExport.WriteDocument(source);
    const archive = await DocumentArchive.open(docx);
    expect(await archive.readTextEntry("word/styles.xml")).not.toContain("<w:tabs");
    expect(await archive.readTextEntry("word/settings.xml")).toContain(
      '<w:defaultTabStop w:val="720"/>',
    );
    reopened = await importOOXML(docx, {});
    const paragraph = reopened.paragraphs[0]?.GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem;
    expect(paragraph.Count()).toBe(1);
    expect(paragraph.At(0).GetAdjustment()).toBe(SvxTabAdjust.Default);
  } finally {
    reopened?.Dispose();
    source.Dispose();
  }
});

it("keeps the source behavior for a rejected tab value and guards invalid transfer items", /** Uses a real default pool and the runtime document codec. @returns Nothing. */ () => {
  const source = createWriterDocument();
  const name = unicode("TabStopDistance");
  const unknown = unicode("Unknown");
  const invalid = new Any([0], "sal_Int32");
  try {
    const defaults = new SwXTextDocument(source).createTextDefaults();
    expectDefaultTab(source, 1134, 2000);
    defaults.setPropertyValue(name, invalid);
    expectDefaultTab(source, 1134, 2000);
    expect(
      /** Requests a property absent from the native schema. @returns Owned value. */
      () => defaults.getPropertyValue(unknown),
    ).toThrow();
    expect(
      /** Rejects a transfer entry using an unrelated WhichId. @returns Writer model. */
      () =>
        decodeWriterDocument({
          ...encodeWriterDocument(source),
          tabStopDefault: { which: 0, value: 720 },
        }),
    ).toThrow(/tab stop default/u);
  } finally {
    invalid.dispose();
    unknown.dispose();
    name.dispose();
    source.Dispose();
  }
});
