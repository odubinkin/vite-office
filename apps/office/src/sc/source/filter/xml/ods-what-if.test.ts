/** @fileoverview Original LibreOffice consolidation fixtures and native scenario ODS transfer. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import {
  DEFAULT_ARCHIVE_LIMITS,
  DocumentArchive,
} from "../../../../package/source/zippackage/document-archive";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import {
  decodeCalcDocument,
  encodeCalcDocument,
} from "../../../browser/filter/xml/calc-document-codec";
import type { ScDocument } from "../../../inc/document";
import { ScScenarioFlags, ScSubTotalFunc } from "../../../inc/global";
import { readOdsDocument, writeOdsDocument, writeOdsXml } from "./xmlwrap";

const fixtures = "../../vendor/libreoffice-reference/sc/qa/unit/data/ods";

/** Verifies native state at each document boundary. @param original - Package input. @param check - Expected model state. @returns Exported content stream. */
async function roundTrip(
  original: Parameters<typeof readOdsDocument>[0],
  check: (document: ScDocument) => void,
): Promise<string> {
  const document = await readOdsDocument(original);
  let worker: ScDocument | undefined;
  let reopened: ScDocument | undefined;
  try {
    check(document);
    worker = decodeCalcDocument(structuredClone(encodeCalcDocument(document)));
    check(worker);
    const output = await writeOdsDocument(worker);
    reopened = await readOdsDocument(output);
    check(reopened);
    const { files } = await writeOdsXml(reopened);
    const content = files["content.xml"];
    assert(typeof content === "string");
    return content;
  } finally {
    reopened?.Dispose();
    worker?.Dispose();
    document.Dispose();
  }
}

it("imports the original tdf149752 linked product consolidation", /** Ports the original Calc import-crash acceptance and verifies saved data. @returns Completion. */ async () => {
  const input = new Uint8Array(readFileSync(`${fixtures}/tdf149752.ods`));
  const archive = await DocumentArchive.open(input);
  const content = await archive.readTextEntry("content.xml");
  // Preserve cached cell values and the original consolidation descriptor.
  const xml = await roundTrip(
    {
      format: "xml",
      files: {
        mimetype: await archive.readTextEntry("mimetype"),
        "content.xml": content.replace(/ table:formula="[^"]*"/gu, ""),
        "styles.xml": await archive.readTextEntry("styles.xml"),
        "META-INF/manifest.xml": await archive.readTextEntry("META-INF/manifest.xml"),
      },
    },
    (document) => {
      const settings = document.GetConsolidateDlgData();
      assert(settings);
      expect(settings.eFunction).toBe(ScSubTotalFunc.PROD);
      expect([
        settings.nCol,
        settings.nRow,
        settings.bByCol,
        settings.bByRow,
        settings.bReferenceData,
      ]).toEqual([1, 0, true, false, true]);
      expect(settings.pDataAreas).toMatchObject([
        { nColStart: 1, nColEnd: 1, nRowStart: 0, nRowEnd: 999 },
      ]);
    },
  );
  expect(xml).toContain('table:use-label="column" table:link-to-source-data="true"');
});

it("imports the original tdf136551 quoted consolidation ranges", /** Ports the original no-crash test for the large quoted source list. @returns Completion. */ async () => {
  const input = new Uint8Array(readFileSync(`${fixtures}/tdf136551.ods`));
  const archive = await DocumentArchive.open(input, {
    ...DEFAULT_ARCHIVE_LIMITS,
    maxExpansionRatio: 1000,
  });
  const original = await archive.readTextEntry("content.xml");
  const start = original.indexOf("<table:consolidation ");
  const end = original.indexOf("/>", start);
  assert(start >= 0 && end >= start);
  const consolidation = original.slice(start, end + 2);
  const content = `<office:document-content xmlns:office="${ODF_NAMESPACES.office}" xmlns:table="${ODF_NAMESPACES.table}" office:version="1.3"><office:body><office:spreadsheet><table:table table:name="ADMIN Board Reports 2019_20"/><table:table table:name="ADMIN Recon"/>${consolidation}</office:spreadsheet></office:body></office:document-content>`;
  const document = await readOdsDocument({
    format: "xml",
    files: {
      mimetype: await archive.readTextEntry("mimetype"),
      "content.xml": content,
      "META-INF/manifest.xml": await archive.readTextEntry("META-INF/manifest.xml"),
    },
  });
  try {
    expect(document.GetTableCount()).toBe(2);
    expect(document.GetConsolidateDlgData()).toBeUndefined();
  } finally {
    document.Dispose();
  }
});

it("preserves original per-sheet scenario flags and marked ranges", /** Verifies canonical pattern flags through package and Worker transfer. @returns Completion. */ async () => {
  const xml = `<office:document-content xmlns:office="${ODF_NAMESPACES.office}" xmlns:table="${ODF_NAMESPACES.table}" office:version="1.3"><office:body><office:spreadsheet><table:table table:name="Base"/><table:table table:name="Alternate"><table:scenario table:scenario-ranges="Base.B2:Base.C4" table:copy-back="false" table:copy-formulas="false" table:is-active="true" table:comment="Variant"/></table:table></office:spreadsheet></office:body></office:document-content>`;
  const saved = await roundTrip(
    {
      format: "xml",
      files: {
        mimetype: "application/vnd.oasis.opendocument.spreadsheet",
        "content.xml": xml,
        "META-INF/manifest.xml":
          '<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.3"><manifest:file-entry manifest:full-path="/" manifest:media-type="application/vnd.oasis.opendocument.spreadsheet"/><manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/></manifest:manifest>',
      },
    },
    (document) => {
      expect(document.FetchTable(0)?.IsScenario()).toBe(false);
      const table = document.FetchTable(1);
      assert(table);
      expect(table.IsScenario()).toBe(true);
      expect(table.IsActiveScenario()).toBe(true);
      const { flags, color, comment } = table.GetScenarioData();
      expect(flags).toBe(
        ScScenarioFlags.ShowFrame | ScScenarioFlags.Attrib | ScScenarioFlags.Value,
      );
      expect(color.toUInt32()).toBe(0);
      expect(comment).toBe("Variant");
      expect([...table.GetScenarioRanges()].map((range) => range.GetVars())).toEqual([
        [1, 1, 1, 2, 3, 1],
      ]);
    },
  );
  expect(saved).toContain('table:scenario-ranges="Alternate.B2:Alternate.C4"');
});
