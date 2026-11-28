/** @fileoverview Original Calc content-change ODS fixture and change-info privacy behavior. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { packXmlPackage } from "../../../../package/source/zippackage/xml-package";
import {
  createManifestProperty,
  createManifestXml,
} from "../../../../package/source/manifest/ManifestWriter";
import type { XmlPackage } from "../../../../svl/source/misc/storage";
import {
  captureSecurityOptions,
  EOption,
  IsOptionSet,
  SetOption,
} from "../../../../unotools/source/config/securityoptions";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import {
  decodeCalcDocument,
  encodeCalcDocument,
} from "../../../browser/filter/xml/calc-document-codec";
import { processOdsWorkerRequest } from "../../../browser/filter/xml/ods-worker-runtime";
import type { ScDocument } from "../../../inc/document";
import { ScAddress } from "../../../inc/address";
import { GetString as getEditString } from "../../core/tool/editutil";
import { ODS_MIMETYPE, readOdsDocument, writeOdsDocument } from "./xmlwrap";

it("testChangesAuthorDate retains actual previous cells and anonymizes author and date on export", async () => {
  const fixture = readFileSync(
    "../../vendor/libreoffice-reference/sc/qa/unit/data/ods/change-tracking.ods",
  );
  const document = await readOdsDocument(new Uint8Array(fixture));
  let reopened: ScDocument | undefined;
  const remove = EOption.DocWarnRemovePersonalInfo;
  const keep = EOption.DocWarnKeepRedlineInfo;
  const oldRemove = IsOptionSet(remove);
  const oldKeep = IsOptionSet(keep);
  try {
    SetOption(remove, false);
    SetOption(keep, false);
    const track = document.GetChangeTrack();
    const first = track?.GetAction(1);
    const second = track?.GetAction(2);
    assert(track && first && second);
    expect(track.GetActionMax()).toBe(2);
    expect(first.GetBigRange().GetVars()).toEqual([1n, 0n, 0n, 1n, 0n, 0n]);
    expect(first.GetOldCell().isEmpty()).toBe(true);
    const previous = second.GetOldCell().getSharedString();
    assert(previous);
    expect(text(previous.getString())).toBe("cell1");
    expect(first.GetDateTimeUTC().GetNanoSec()).toBe(889238537);

    const clear = await DocumentArchive.open(await writeOdsDocument(document));
    const clearXml = new DOMParser().parseFromString(
      await clear.readTextEntry("content.xml"),
      "application/xml",
    );
    expect(clearXml.getElementsByTagNameNS(ODF_NAMESPACES.dc, "creator")[0]?.textContent).toBe(
      first.GetUser(),
    );
    expect(clearXml.getElementsByTagNameNS(ODF_NAMESPACES.dc, "date")[0]?.textContent).toBe(
      "2024-06-20T08:12:59.889238537",
    );

    SetOption(remove, true);
    track.SetProtection(new Uint8Array([1, 2, 3, 4]));
    const output = (await processOdsWorkerRequest({
      id: 1,
      operation: "export-xml",
      document: structuredClone(encodeCalcDocument(document)),
      securityOptions: captureSecurityOptions(),
    })) as XmlPackage;
    const xml = new DOMParser().parseFromString(
      output.files["content.xml"] as string,
      "application/xml",
    );
    expect(xml.getElementsByTagNameNS(ODF_NAMESPACES.dc, "creator")[0]?.textContent).toBe(
      "Author1",
    );
    expect(xml.getElementsByTagNameNS(ODF_NAMESPACES.dc, "date")[0]?.textContent).toBe(
      "1970-01-01T12:00:00",
    );
    reopened = await readOdsDocument(output);
    expect(reopened.GetChangeTrack()?.GetProtection()).toEqual(new Uint8Array([1, 2, 3, 4]));
  } finally {
    SetOption(remove, oldRemove);
    SetOption(keep, oldKeep);
    document.Dispose();
    reopened?.Dispose();
  }
});

it("roundtrips historical formulas and formatted text with their original action links", async () => {
  const ns = `xmlns:office="${ODF_NAMESPACES.office}" xmlns:table="${ODF_NAMESPACES.table}" xmlns:text="${ODF_NAMESPACES.text}" xmlns:of="${ODF_NAMESPACES.of}" xmlns:style="${ODF_NAMESPACES.style}" xmlns:fo="${ODF_NAMESPACES.fo}"`;
  const manifest = createManifestXml([
    [createManifestProperty("FullPath", "/"), createManifestProperty("MediaType", ODS_MIMETYPE)],
    [
      createManifestProperty("FullPath", "content.xml"),
      createManifestProperty("MediaType", "text/xml"),
    ],
  ]);
  const first =
    '<table:cell-content-change table:id="ct1"><table:cell-address table:column="0" table:row="0" table:table="0"/><table:previous><table:change-track-table-cell table:cell-address="Sheet1.A1" table:formula="of:=[.A2]+2" office:value-type="float" office:value="15"/></table:previous></table:cell-content-change>';
  const second =
    '<table:cell-content-change table:id="ct2"><table:cell-address table:column="0" table:row="0" table:table="0"/><table:previous table:id="ct1"><table:change-track-table-cell office:value-type="string"><text:p>A<text:s text:c="5"/><text:span text:style-name="T1">B</text:span></text:p><text:p>C</text:p></table:change-track-table-cell></table:previous></table:cell-content-change>';
  const bytes = await packXmlPackage({
    mimetype: ODS_MIMETYPE,
    "META-INF/manifest.xml": manifest,
    "content.xml": `<office:document-content ${ns}><office:automatic-styles><style:style style:family="text" style:name="T1"><style:text-properties fo:font-weight="bold"/></style:style></office:automatic-styles><office:body><office:spreadsheet><table:tracked-changes>${first}${second}</table:tracked-changes><table:table table:name="Sheet1"><table:table-row><table:table-cell office:value-type="float" office:value="9"/></table:table-row><table:table-row><table:table-cell office:value-type="float" office:value="4"/></table:table-row></table:table></office:spreadsheet></office:body></office:document-content>`,
  });
  const documents = [await readOdsDocument(bytes)];
  try {
    const source = documents[0];
    assert(source);
    expect(source.GetChangeTrack()?.GetAction(1)?.GetOldCell().getFormula()?.GetValue()).toBe(6);
    const worker = decodeCalcDocument(structuredClone(encodeCalcDocument(source)));
    documents.push(worker);
    expect(worker.GetChangeTrack()?.GetAction(1)?.GetOldCell().getFormula()?.GetDirty()).toBe(
      false,
    );
    const saved = await writeOdsDocument(worker);
    const exported = await (await DocumentArchive.open(saved)).readTextEntry("content.xml");
    expect(exported).toMatch(
      /<table:change-track-table-cell[^>]+table:formula="of:=\[\.A2\]\+2"[^>]+office:value="6"/,
    );
    expect(exported).toMatch(
      /<text:p>A<text:s\/><text:span text:style-name="[^"]+">B<\/text:span><\/text:p><text:p>C<\/text:p>/,
    );
    expect(exported).toContain('fo:font-weight="bold"');
    documents.push(await readOdsDocument(saved));
    for (const document of documents) {
      const track = document.GetChangeTrack();
      const before = track?.GetAction(1);
      const after = track?.GetAction(2);
      assert(before && after);
      const formula = before.GetOldCell().getFormula();
      const edit = after.GetOldCell().getEditText();
      assert(formula && edit);
      expect(formula.IsInChangeTrack()).toBe(true);
      expect(formula.GetValue()).toBe(6);
      expect(after.GetPrevContent()).toBe(before);
      expect(before.GetNewCell().getEditText()).toBeTruthy();
      const value = getEditString(edit, document);
      try {
        expect(text(value)).toBe("A B\nC");
      } finally {
        value.dispose();
      }
      expect(document.GetValue(new ScAddress(0, 0, 0))).toBe(9);
    }
  } finally {
    for (const document of documents) document.Dispose();
  }
});
