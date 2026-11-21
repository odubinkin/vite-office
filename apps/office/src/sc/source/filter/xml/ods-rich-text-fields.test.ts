/** @fileoverview Pinned Calc edit-field regressions through actual ODS and Worker transfer. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import {
  SvxDateField,
  SvxFileField,
  SvxTableField,
  SvxURLField,
} from "../../../../editeng/inc/flditem";
import * as FieldType from "../../../../offapi/com/sun/star/text/textfield/Type";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import {
  decodeCalcDocument,
  encodeCalcDocument,
} from "../../../browser/filter/xml/calc-document-codec";
import { ScAddress } from "../../../inc/address";
import { ScDocument } from "../../../inc/document";
import { ScXMLImport } from "./xmlimprt";
import { readOdsDocument, writeOdsDocument } from "./xmlwrap";
import { processOdsWorkerRequest } from "../../../browser/filter/xml/ods-worker-runtime";
import type { CalcDocumentRecord } from "../../../browser/filter/xml/calc-document-codec";

const fixtureRoot = "../../vendor/libreoffice-reference/sc/qa/unit/data/ods";

/** Reads the original URL feature from the native cell editor. @param document - Workbook. @param address - Source cell. @returns Borrowed field. */
function urlField(document: ScDocument, address: ScAddress): SvxURLField {
  const field = document.GetRefCellValue(address).getEditText()?.GetFieldData(0, 0, FieldType.URL);
  assert(field instanceof SvxURLField);
  return field;
}

it("ports testHyperlinkTargetFrameODS with the pinned hyperlink_frame package", /** Checks the native target property and exported XML. @returns Completion. */ async () => {
  const source = await readOdsDocument(
    new Uint8Array(readFileSync(`${fixtureRoot}/hyperlink_frame.ods`)),
  );
  const address = new ScAddress(2, 5, 0);
  let reopened: ScDocument | undefined;
  try {
    expect(text(urlField(source, address).GetTargetFrame())).toBe("_blank");
    const bytes = await writeOdsDocument(source);
    const content = await (await DocumentArchive.open(bytes)).readTextEntry("content.xml");
    const dom = new DOMParser().parseFromString(content, "application/xml");
    const anchor = dom.getElementsByTagNameNS(ODF_NAMESPACES.text, "a")[0];
    expect(anchor?.getAttributeNS(ODF_NAMESPACES.office, "target-frame-name")).toBe("_blank");
    expect(anchor?.getAttributeNS(ODF_NAMESPACES.xlink, "href")).toBe(
      "http://www.libreoffice.org/",
    );
    reopened = await readOdsDocument(bytes);
    expect(text(urlField(reopened, address).GetTargetFrame())).toBe("_blank");
  } finally {
    reopened?.Dispose();
    source.Dispose();
  }
});

it("keeps an encoded hash path segment separate from the sheet fragment", /** Replays external_hyperlink.ods through the document URI and ODS paths. @returns Completion. */ async () => {
  const input = new Uint8Array(readFileSync(`${fixtureRoot}/external_hyperlink.ods`));
  const record = await processOdsWorkerRequest({
    id: 1,
    operation: "import",
    input: input.buffer,
    options: { baseUrl: "file:///home/test/documents/external_hyperlink.ods" },
  });
  const source = decodeCalcDocument(record as CalcDocumentRecord);
  let reopened: ScDocument | undefined;
  try {
    const url = text(urlField(source, new ScAddress()).GetURL());
    expect(url).toMatch(/\/%23folder\/test\.ods#Sheet2\.B10$/u);
    reopened = await readOdsDocument(await writeOdsDocument(source));
    expect(text(urlField(reopened, new ScAddress()).GetURL())).toBe(url);
  } finally {
    reopened?.Dispose();
    source.Dispose();
  }
});

it("preserves styled URL and dynamic EditEngine fields through Worker and ODS", /** Checks independently authored field markup and native field identity. @returns Completion. */ async () => {
  const source = new ScDocument();
  let worker: ScDocument | undefined;
  let reopened: ScDocument | undefined;
  try {
    new ScXMLImport(source).importContent(`
      <office:document-content xmlns:office="${ODF_NAMESPACES.office}" xmlns:table="${ODF_NAMESPACES.table}" xmlns:text="${ODF_NAMESPACES.text}" xmlns:style="${ODF_NAMESPACES.style}" xmlns:fo="${ODF_NAMESPACES.fo}" xmlns:xlink="${ODF_NAMESPACES.xlink}">
        <office:automatic-styles><style:style style:name="Bold" style:family="text"><style:text-properties fo:font-weight="bold"/></style:style></office:automatic-styles>
        <office:body><office:spreadsheet><table:table table:name="Fields"><table:table-row>
          <table:table-cell><text:p><text:bookmark text:name="ignored"/>before<text:span text:style-name="Bold"><text:a xlink:href="https://example.test/" office:target-frame-name="_blank">link</text:a></text:span><text:s/><text:sheet-name>stale</text:sheet-name><text:s/><text:title>stale</text:title><text:s/><text:date text:date-value="2000-01-01">stale</text:date></text:p></table:table-cell>
          <table:table-cell office:value-type="string" office:string-value="override"><text:p><text:a xlink:href="#Fields.A1">ignored</text:a></text:p></table:table-cell>
        </table:table-row></table:table></office:spreadsheet></office:body>
      </office:document-content>`);
    worker = decodeCalcDocument(encodeCalcDocument(source));
    const bytes = await writeOdsDocument(worker);
    const content = await (await DocumentArchive.open(bytes)).readTextEntry("content.xml");
    expect(content).toMatch(
      /<text:span text:style-name="T\d+"><text:a [^>]*>link<\/text:a><\/text:span>/u,
    );
    expect(content).toContain("<text:sheet-name>Fields</text:sheet-name>");
    expect(content).toMatch(
      /<text:date style:data-style-name="N2" text:date-value="\d{4}-\d{2}-\d{2}">/u,
    );
    reopened = await readOdsDocument(bytes);
    for (const document of [source, worker, reopened]) {
      const address = new ScAddress();
      const edit = document.GetRefCellValue(address).getEditText();
      expect(text(urlField(document, address).GetRepresentation())).toBe("link");
      expect(edit?.GetFieldData(0, 0, FieldType.TABLE)).toBeInstanceOf(SvxTableField);
      expect(edit?.GetFieldData(0, 0, FieldType.DOCINFO_TITLE)).toBeInstanceOf(SvxFileField);
      expect(edit?.GetFieldData(0, 0, FieldType.DATE)).toBeInstanceOf(SvxDateField);
      expect(document.GetRefCellValue(new ScAddress(1, 0, 0)).getEditText()).toBeFalsy();
    }
  } finally {
    reopened?.Dispose();
    worker?.Dispose();
    source.Dispose();
  }
});

it("writes multiline formula results as separate cached text paragraphs", /** Checks source paragraph terminators and the string-value attribute on reopen. @returns Completion. */ async () => {
  const source = new ScDocument();
  let reopened: ScDocument | undefined;
  try {
    new ScXMLImport(source).importContent(`
      <office:document-content xmlns:office="${ODF_NAMESPACES.office}" xmlns:table="${ODF_NAMESPACES.table}" xmlns:of="${ODF_NAMESPACES.of}">
        <office:body><office:spreadsheet><table:table table:name="Lines"><table:table-row>
          <table:table-cell office:value-type="string" office:string-value="a&#10;&#10;b"/>
          <table:table-cell table:formula="of:=[.A1]"/>
        </table:table-row></table:table></office:spreadsheet></office:body>
      </office:document-content>`);
    const bytes = await writeOdsDocument(source);
    const content = await (await DocumentArchive.open(bytes)).readTextEntry("content.xml");
    const dom = new DOMParser().parseFromString(content, "application/xml");
    const cell = dom.getElementsByTagNameNS(ODF_NAMESPACES.table, "table-cell")[1];
    const paragraphs = [...(cell?.getElementsByTagNameNS(ODF_NAMESPACES.text, "p") ?? [])];
    expect(
      paragraphs.map(
        /** Reads a cached formula paragraph. @param paragraph - Exported element. @returns Text. */
        (paragraph) => paragraph.textContent,
      ),
    ).toEqual(["a", "", "b"]);
    expect(cell?.getAttributeNS(ODF_NAMESPACES.office, "string-value")).toBe("a\n\nb");
    reopened = await readOdsDocument(bytes);
    const formula = reopened.GetRefCellValue(new ScAddress(1, 0, 0)).getFormula();
    assert(formula);
    expect(text(formula.GetString().getString())).toBe("a\n\nb");
  } finally {
    reopened?.Dispose();
    source.Dispose();
  }
});
