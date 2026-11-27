/** @fileoverview Original Calc external area source definitions in the ODS and Worker filters. */
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { SvBaseLinkObjectType, SfxLinkUpdateMode } from "../../../../sfx2/source/appl/lnkbase2";
import {
  decodeCalcDocument,
  type CalcDocumentRecord,
} from "../../../browser/filter/xml/calc-document-codec";
import { processOdsWorkerRequest } from "../../../browser/filter/xml/ods-worker-runtime";
import { ScAddress } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import { ScAreaLink } from "../../ui/docshell/arealink";
import { readOdsDocument, writeOdsDocument, writeOdsXml } from "./xmlwrap";

const baseUrl = "file:///fixtures/main/tdf124829.ods";
const sourceUrl = "file:///fixtures/bug-link-to-external-data-better.ods";

/** Verifies the two original independent external ranges and worksheet values. @param document - Imported Calc model. */
function expectAreaLinks(document: ScDocument): void {
  expect(document.GetTableCount()).toBe(6);
  const links = document.GetLinkManager().GetLinks();
  expect(links).toHaveLength(2);
  for (const [index, link] of links.entries()) {
    expect(link).toBeInstanceOf(ScAreaLink);
    if (!(link instanceof ScAreaLink)) throw new Error("Expected an external data range.");
    const tab = index + 4;
    const source = index === 0 ? "CSVlinked" : "CSVdirect";
    expect(link.GetDestArea().GetVars()).toEqual([0, 0, tab, 3, 10, tab]);
    expect(link.GetFile()).toBe(sourceUrl);
    expect(link.GetFilter()).toBe("calc8");
    expect(link.GetOptions()).toBe("");
    expect(link.GetSource()).toBe(source);
    expect(link.GetRefreshDelaySeconds()).toBe(1);
    expect(link.GetObjType()).toBe(SvBaseLinkObjectType.ClientFile);
    expect(link.GetUpdateMode()).toBe(SfxLinkUpdateMode.ONCALL);
    expect(link.GetLinkSourceName()).toBe(`${sourceUrl}\uffff${source}\uffffcalc8`);
    expect(document.IsLinked(tab)).toBe(false);
    expect(text(document.GetSharedString(new ScAddress(0, 0, tab)).getString())).toBe("First Name");
  }
}

it("keeps both external data ranges in the original tdf124829 workbook", /** Ports the native workbook admission and six-sheet assertion across ODS and the Worker. @returns Completion. */ async () => {
  const bytes = new Uint8Array(
    readFileSync("../../vendor/libreoffice-reference/sc/qa/uitest/data/tdf124829.ods"),
  );
  // The fixture's out-of-slice formulas are independent of the linked areas.
  // Use its cache while keeping the original sheet and area definitions.
  const fixture = await DocumentArchive.open(bytes);
  const content = await fixture.readTextEntry("content.xml");
  const transfer = (await processOdsWorkerRequest({
    id: 1,
    operation: "import",
    input: {
      format: "xml",
      files: {
        mimetype: await fixture.readTextEntry("mimetype"),
        "content.xml": content.replace(/ table:formula="[^"]*"/gu, ""),
        "styles.xml": await fixture.readTextEntry("styles.xml"),
        "META-INF/manifest.xml": await fixture.readTextEntry("META-INF/manifest.xml"),
      },
    },
    options: { baseUrl },
  })) as CalcDocumentRecord;
  const document = decodeCalcDocument(structuredClone(transfer));
  try {
    expectAreaLinks(document);
    const packages = await writeOdsXml(document);
    const xml = packages.files["content.xml"];
    expect(xml).toContain(
      `table:name="CSVlinked" xlink:type="simple" xlink:href="${sourceUrl}" table:filter-name="calc8" table:last-column-spanned="4" table:last-row-spanned="11" table:refresh-delay="PT00H00M01S"`,
    );
    const reopened = await readOdsDocument(await writeOdsDocument(document));
    try {
      expectAreaLinks(reopened);
    } finally {
      reopened.Dispose();
    }
  } finally {
    document.Dispose();
  }
});
