/** @fileoverview Original Calc content-change ODS fixture and change-info privacy behavior. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import type { XmlPackage } from "../../../../svl/source/misc/storage";
import {
  captureSecurityOptions,
  EOption,
  IsOptionSet,
  SetOption,
} from "../../../../unotools/source/config/securityoptions";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import { encodeCalcDocument } from "../../../browser/filter/xml/calc-document-codec";
import { processOdsWorkerRequest } from "../../../browser/filter/xml/ods-worker-runtime";
import type { ScDocument } from "../../../inc/document";
import { readOdsDocument, writeOdsDocument } from "./xmlwrap";

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
