/** @fileoverview Independent ordinary ODS metadata and full-sheet empty repeats through the actual native import path. */
import { expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScAddress } from "../../../inc/address";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ScXMLImport } from "./xmlimprt";
import { readOdsDocument, writeOdsDocument } from "./xmlwrap";

/** Independent ODF source uses inches, an unused date style, empty forms and full-sheet styled ranges. @param forms - Form container content. @returns XML. */
function source(forms = ""): string {
  return `<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:number="urn:oasis:names:tc:opendocument:xmlns:datastyle:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0">
  <office:automatic-styles>
    <number:date-style style:name="N37"><number:day number:style="long"/><number:text>/</number:text><number:month number:style="long"/><number:text>/</number:text><number:year/></number:date-style>
    <style:style style:name="co1" style:family="table-column"><style:table-column-properties style:column-width="0.889in"/></style:style>
    <style:style style:name="ro1" style:family="table-row"><style:table-row-properties style:row-height="0.178in" style:use-optimal-row-height="false"/></style:style>
    <style:style style:name="ce1" style:family="table-cell"><style:text-properties fo:font-size="10pt" fo:font-weight="bold"/></style:style>
  </office:automatic-styles><office:body><office:spreadsheet><table:table table:name="Sheet1">
  <office:forms>${forms}</office:forms>
  <table:table-column table:style-name="co1" table:number-columns-repeated="1024"/>
  <table:table-row table:style-name="ro1"><table:table-cell office:value-type="float" office:value="0"/><table:table-cell table:style-name="ce1" office:value-type="string"><text:p>First Name</text:p></table:table-cell><table:table-cell office:value-type="string"><text:p>15/10/2017</text:p></table:table-cell><table:table-cell table:style-name="ce1" table:number-columns-repeated="1021"/></table:table-row>
  <table:table-row table:style-name="ro1" table:number-rows-repeated="1048575"><table:table-cell table:style-name="ce1" table:number-columns-repeated="1024"/></table:table-row>
  </table:table></office:spreadsheet></office:body></office:document-content>`;
}

it("opens ordinary metadata and preserves scalars and compressed full-sheet formatting through ODS reload", /** Checks real model values and geometry rather than stripping XML before import. @returns Completion. */ async () => {
  const doc = new ScDocument(),
    diagnostics: unknown[] = [];
  new ScXMLImport(doc, {
    onDiagnostic:
      /** Retains actual unsupported-metadata diagnostics. @param value - Import diagnostic. @returns New diagnostic count. */ (
        value,
      ) => diagnostics.push(value),
  }).importContent(source());
  expect(doc.GetTableCount()).toBe(1);
  expect(doc.GetValue(new ScAddress(0, 0, 0))).toBe(0);
  expect(text(doc.GetSharedString(new ScAddress(1, 0, 0)).getString())).toBe("First Name");
  expect(text(doc.GetSharedString(new ScAddress(2, 0, 0)).getString())).toBe("15/10/2017");
  expect(doc.GetColWidth(0, 0)).toBe(1280);
  expect(doc.GetColWidth(1023, 0)).toBe(1280);
  expect(doc.GetRowHeight(1048575, 0, false)).toBe(256);
  expect(doc.GetCellType(new ScAddress(1023, 1048575, 0))).toBe(0);
  expect(JSON.stringify(diagnostics)).toContain("automatic style declaration: date-style");
  const copy = await readOdsDocument(writeOdsDocument(doc));
  expect(text(copy.GetSharedString(new ScAddress(1, 0, 0)).getString())).toBe("First Name");
  expect(copy.GetRowHeight(1048575, 0, false)).toBe(256);
});

it("rejects actual unported form content and unknown sheet semantics rather than losing them", /** Empty metadata containers must not admit controls or unrelated sheet objects. @returns Nothing. */ () => {
  for (const xml of [
    source("<office:unknown/>"),
    source("<table:table-row/>"),
    source()
      .replace("<office:forms>", "<table:forms>")
      .replace("</office:forms>", "</table:forms>"),
    source()
      .replace("<office:forms>", "<office:unknown>")
      .replace("</office:forms>", "</office:unknown>"),
  ])
    expect(
      /** Reads each unsupported semantic subtree through the real importer. @returns Nothing. */ () =>
        new ScXMLImport(new ScDocument()).importContent(xml),
    ).toThrow(/not implemented/);
});
