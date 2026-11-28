/** @fileoverview Original workbook and sheet ODS protection digest roundtrips. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import {
  decodeCalcDocument,
  encodeCalcDocument,
} from "../../../browser/filter/xml/calc-document-codec";
import { ScDocument } from "../../../inc/document";
import { ScDocProtectionOption } from "../../../inc/tabprotection";
import { ScXMLImport } from "./xmlimprt";
import { readOdsDocument, writeOdsDocument } from "./xmlwrap";

const fixturePassword = "1012345678901234567890123456789012345678901234567890";
const sha1 = "http://www.w3.org/2000/09/xmldsig#sha1";
const sha256 = "http://www.w3.org/2000/09/xmldsig#sha256";
const excel = "http://docs.oasis-open.org/office/ns/table/legacy-hash-excel";

it.each([
  ["testProtectionKeyODS_UTF16LErtlSHA1", 1, "vbnhxyBKtPHCA1wB21zG1Oha8ZA=", sha1],
  ["testProtectionKeyODS_UTF8SHA1", 2, "nLHas0RIwepGDaH4c2hpyIUvIS8=", sha1],
  [
    "testProtectionKeyODS_UTF8SHA256ODF12",
    3,
    "1tnJohagR2T0yF/v69hLPuumSTsj32CumW97nkKGuSQ=",
    sha256,
  ],
  ["testProtectionKeyODS_UTF8SHA256W3C", 4, "1tnJohagR2T0yF/v69hLPuumSTsj32CumW97nkKGuSQ=", sha256],
  ["testProtectionKeyODS_XL_SHA1", 5, "OX3WkEe79fv1PE+FUmfOLdwVoqI=", excel],
] as const)(
  "%s retains the workbook and sheet verifier",
  /** Verifies a pinned workbook protection digest and algorithm through ODF import. @param _name - Fixture case title. @param fixture - Pinned flat ODF fixture name. @param digest - Expected protection digest. @param algorithm - Expected digest algorithm. @returns Test completion. */ async (
    _name,
    fixture,
    digest,
    algorithm,
  ) => {
    const flat = readFileSync(
      `../../vendor/libreoffice-reference/sc/qa/unit/data/fods/protection-key${fixture}.fods`,
      "utf8",
    );
    const document = new ScDocument();
    let transferred: ScDocument | undefined;
    let reopened: ScDocument | undefined;
    try {
      new ScXMLImport(document).importContent(
        flat.replace(/(<\/?office:document)(?=[ >])/gu, "$1-content"),
      );
      transferred = decodeCalcDocument(structuredClone(encodeCalcDocument(document)));
      const bytes = await writeOdsDocument(transferred);
      const content = await (await DocumentArchive.open(bytes)).readTextEntry("content.xml");
      const xml = new DOMParser().parseFromString(content, "application/xml");
      const workbook = xml.getElementsByTagNameNS(ODF_NAMESPACES.office, "spreadsheet")[0];
      const sheet = xml.getElementsByTagNameNS(ODF_NAMESPACES.table, "table")[0];
      assert(workbook && sheet);
      expect(workbook.getAttributeNS(ODF_NAMESPACES.table, "structure-protected")).toBe("true");
      expect(sheet.getAttributeNS(ODF_NAMESPACES.table, "protected")).toBe("true");
      for (const owner of [workbook, sheet]) {
        expect(owner.getAttributeNS(ODF_NAMESPACES.table, "protection-key")).toBe(digest);
        expect(owner.getAttributeNS(ODF_NAMESPACES.table, "protection-key-digest-algorithm")).toBe(
          algorithm,
        );
        expect(
          owner.getAttributeNS(ODF_NAMESPACES.loext, "protection-key-digest-algorithm-2"),
        ).toBe(algorithm === excel ? sha1 : null);
      }
      reopened = await readOdsDocument(bytes);
      for (const model of [document, transferred, reopened]) {
        const docProtection = model.GetDocProtection();
        const tabProtection = model.GetTabProtection(0);
        assert(docProtection && tabProtection);
        expect(model.IsDocProtected()).toBe(true);
        expect(docProtection.isOptionEnabled(ScDocProtectionOption.STRUCTURE)).toBe(true);
        expect(await docProtection.verifyPassword(fixturePassword)).toBe(true);
        expect(await tabProtection.verifyPassword(fixturePassword)).toBe(true);
      }
    } finally {
      document.Dispose();
      transferred?.Dispose();
      reopened?.Dispose();
    }
  },
);
