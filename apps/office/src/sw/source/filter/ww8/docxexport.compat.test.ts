/** @fileoverview Original DOCX compatibility settings through Writer UNO, Worker and export. */
import { readFileSync } from "node:fs";
import { expect, it, vi } from "vitest";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { SequenceAsHashMap } from "../../../../comphelper/source/misc/sequenceashashmap";
import { OoxmlVersion } from "../../../../oox/inc/core/filterbase";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../../../package/source/zippackage/document-archive";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { createWriterDocument, type SwDoc } from "../../core/doc/doc";
import { unicode } from "../../core/unocore/unocrsrhelper";
import { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import {
  ReadCompatSettings,
  SetCompatSettings,
  wordCompatibilityUri,
} from "../../writerfilter/dmapper/SettingsTable.compat";
import { importOOXML } from "../../writerfilter/filter/WriterFilter";
import { readOdtDocument } from "../xml/swxml";
import { writeOdtDocument } from "../xml/wrtxml";
import { DocxExport } from "./docxexport";

// These fixtures unpack and reopen native document packages under coverage.
vi.setConfig({ testTimeout: 120_000 });

const fixture =
  "../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/TextEffects_StylisticSets_CntxtAlts.docx";
const expected = [
  { name: "compatibilityMode", uri: wordCompatibilityUri, val: "15" },
  { name: "overrideTableStyleFontSizeAndJustification", uri: wordCompatibilityUri, val: "1" },
  { name: "enableOpenTypeFeatures", uri: wordCompatibilityUri, val: "1" },
  { name: "doNotFlipMirrorIndents", uri: wordCompatibilityUri, val: "1" },
  { name: "differentiateMultirowTableHeaders", uri: wordCompatibilityUri, val: "1" },
];

/** Reads actual document interoperability data. @param document - Writer model. @returns Ordered Word properties. */
function compat(document: SwDoc) {
  return ReadCompatSettings(document.interopGrabBag.GetGrabBag().get("CompatSettings"));
}

/** Reads the generated settings part. @param document - Active model. @param version - Optional export filter standard. @returns XML. */
async function settingsXml(document: SwDoc, version?: OoxmlVersion): Promise<string> {
  const archive = await DocumentArchive.open(await DocxExport.WriteDocument(document, version));
  return archive.readTextEntry("word/settings.xml");
}

/** Reuses the source DOCX and replaces only its compatibility XML. @param compatibility - Source compat children. @returns Complete package. */
async function inputWithCompat(compatibility: string): Promise<Uint8Array> {
  const input = await DocumentArchive.open(new Uint8Array(readFileSync(fixture)));
  const output = new DocumentArchiveWriter();
  for (const part of input.getEntryNames()) {
    if (part === "word/settings.xml") {
      const source = await input.readTextEntry(part);
      output.putNextEntry(
        part,
        new TextEncoder().encode(
          source.replace(
            /<w:compat>[\s\S]*?<\/w:compat>/u,
            `<w:compat>${compatibility}</w:compat>`,
          ),
        ),
      );
    } else output.putNextEntry(part, await input.readEntry(part));
  }
  return output.finish();
}

it("ports the original five compatibility settings on the unchanged typography fixture", /** Matches LibreOffice Test_CompatSettingsForW14 before and after the Worker. @returns Completion. */ async () => {
  const document = await importOOXML(new Uint8Array(readFileSync(fixture)), {});
  let worker: SwDoc | undefined;
  let reopened: SwDoc | undefined;
  try {
    expect(compat(document)).toEqual(expected);
    worker = decodeWriterDocument(structuredClone(encodeWriterDocument(document)));
    expect(compat(worker)).toEqual(expected);
    const bytes = await DocxExport.WriteDocument(worker);
    const archive = await DocumentArchive.open(bytes);
    const xml = await archive.readTextEntry("word/settings.xml");
    expect(xml.match(/<w:compatSetting\b[^>]*\/>/gu)).toEqual(
      expected.map(
        /** Spells each original setting in native serializer order. @param row - Source property. @returns Expected XML node. */
        ({ name, uri, val }) => `<w:compatSetting w:name="${name}" w:uri="${uri}" w:val="${val}"/>`,
      ),
    );
    reopened = await importOOXML(bytes, {});
    expect(compat(reopened)).toEqual(expected);
  } finally {
    reopened?.Dispose();
    worker?.Dispose();
    document.Dispose();
  }
});

it("uses the greatest recognized mode, preserves original slot reuse, and honors both export caps", /** Exercises source rules for repeated modes, omitted row attributes and explicit noLeading. @returns Completion. */ async () => {
  const input = await inputWithCompat(
    `<w:noLeading/><w:doNotExpandShiftReturn/><w:doNotUseHTMLParagraphAutoSpacing/><w:compatSetting w:name="compatibilityMode" w:uri="${wordCompatibilityUri}" w:val="11"/><w:compatSetting w:val="14"/><w:compatSetting w:val="15"/><w:compatSetting w:val="11"/><w:compatSetting w:uri="urn:other" w:val="20"/>`,
  );
  const document = await importOOXML(input, {});
  let odt: SwDoc | undefined;
  try {
    expect(compat(document)).toEqual([
      { ...expected[0], val: "11" },
      { ...expected[0], val: "14" },
      expected[0],
      { ...expected[0], val: "11" },
      { ...expected[0], uri: "urn:other", val: "20" },
    ]);
    expect(document.GetDocumentSettingManager().get("ADD_EXT_LEADING")).toBe(false);
    expect(document.GetDocumentSettingManager().get("DO_NOT_JUSTIFY_LINES_WITH_MANUAL_BREAK")).toBe(
      true,
    );
    expect(document.GetDocumentSettingManager().get("PARA_SPACE_MAX")).toBe(true);
    const normal = await settingsXml(document);
    expect(normal).toContain(
      "<w:noLeading/><w:doNotExpandShiftReturn/><w:doNotUseHTMLParagraphAutoSpacing/>",
    );
    expect(normal.match(/<w:compatSetting\b[^>]*w:val="14"\/>/gu)).toHaveLength(5);
    expect(normal).toContain('w:name="compatibilityMode" w:uri="urn:other" w:val="14"');
    const legacy = await settingsXml(document, OoxmlVersion.ECMA_376_1ST_EDITION);
    expect(legacy.match(/<w:compatSetting\b[^>]*w:val="12"\/>/gu)).toHaveLength(5);
    const odtBytes = await writeOdtDocument(document, { title: "Compatibility" });
    odt = (await readOdtDocument(odtBytes, { title: "Compatibility" })).document;
    for (const id of [
      "ADD_EXT_LEADING",
      "DO_NOT_JUSTIFY_LINES_WITH_MANUAL_BREAK",
      "PARA_SPACE_MAX",
    ] as const)
      expect(odt.GetDocumentSettingManager().get(id)).toBe(
        document.GetDocumentSettingManager().get(id),
      );
    expect(compat(odt)).toBeUndefined();
  } finally {
    odt?.Dispose();
    document.Dispose();
  }
});

it("distinguishes the original imported default from fresh and unsupported modes", /** Covers default mode 12 after import, mode 15 for a new document and a forwarded unknown row. @returns Completion. */ async () => {
  const document = await importOOXML(await inputWithCompat("<w:compatSetting/>"), {});
  const fresh = createWriterDocument();
  const model = new SwXTextDocument(fresh);
  const name = unicode("InteropGrabBag");
  const invalid = new Any(true);
  const unrelated = unicode("UnrelatedInteropData");
  const bag = new SequenceAsHashMap();
  try {
    expect(compat(document)).toEqual([{}, { ...expected[0], val: "12" }]);
    expect(await settingsXml(document)).toContain('w:name="" w:uri="" w:val=""');
    expect(await settingsXml(fresh)).toContain(
      'w:name="compatibilityMode" w:uri="' + wordCompatibilityUri + '" w:val="15"',
    );
    expect(await settingsXml(fresh)).toContain('w:name="allowHyphenationAtTrackBottom"');
    SetCompatSettings(model, [{ name: "compatibilityMode", uri: wordCompatibilityUri }]);
    expect(await settingsXml(fresh)).toContain(
      'w:name="compatibilityMode" w:uri="' + wordCompatibilityUri + '" w:val="15"',
    );
    bag.operatorIndex(unrelated).assign(invalid);
    const root = bag.getAsConstAny(true);
    try {
      model.setPropertyValue(name, root);
    } finally {
      root.dispose();
    }
    SetCompatSettings(model, [{ name: "compatibilityMode", uri: wordCompatibilityUri, val: "25" }]);
    model.setPropertyValue(name, invalid);
    const preserved: [boolean] = [false];
    expect(
      fresh.interopGrabBag.GetGrabBag().get("UnrelatedInteropData")?.extract(preserved, "bool"),
    ).toBe(true);
    expect(preserved[0]).toBe(true);
    expect(compat(fresh)?.[0]?.val).toBe("25");
    expect(await settingsXml(fresh)).toContain(
      'w:name="compatibilityMode" w:uri="' + wordCompatibilityUri + '" w:val="15"',
    );
    SetCompatSettings(model, [{ name: "source", uri: "urn:other" }]);
    const missingMode = await settingsXml(fresh);
    expect(missingMode).toContain('w:name="source" w:uri="urn:other" w:val=""');
    expect(missingMode).toContain(
      'w:name="compatibilityMode" w:uri="' + wordCompatibilityUri + '" w:val="15"',
    );
    const graph = encodeWriterDocument(fresh);
    for (const value of [false, [0], [{ name: 1 }], [{ unexpected: "value" }]])
      expect(
        /** Rejects unsupported Worker data before model adoption. @returns Never. */ () =>
          decodeWriterDocument({ ...graph, compatSettings: value }),
      ).toThrow("Stored Writer compat settings are invalid.");
  } finally {
    bag.clear();
    unrelated.dispose();
    invalid.dispose();
    name.dispose();
    model.dispose();
    fresh.Dispose();
    document.Dispose();
  }
});
