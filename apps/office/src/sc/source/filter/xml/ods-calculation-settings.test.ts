/** @fileoverview Native ODS calculation defaults, option serialization and Worker transport. */
import { assert, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { createBrowserRegexMatcher } from "../../../../i18npool/browser/regex-matcher";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import {
  encodeCalcDocument,
  decodeCalcDocument,
} from "../../../browser/filter/xml/calc-document-codec";
import { processOdsWorkerRequest } from "../../../browser/filter/xml/ods-worker-runtime";
import { ScAddress } from "../../../inc/address";
import { ScDocument } from "../../../inc/document";
import { DetectSearchType } from "../../core/tool/queryentry";
import { SearchParam } from "../../../../unotools/inc/textsearch";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { ScXMLImport } from "./xmlimprt";
import { readOdsDocument, writeOdsDocument } from "./xmlwrap";

const tableContent = `<table:table table:name="Data"><table:table-row><table:table-cell office:value-type="string" office:string-value="abc"/><table:table-cell table:formula="of:=COUNTIF([.A1:.A3];&quot;a.*&quot;)"/><table:table-cell table:formula="of:=MATCH(&quot;ab[d]&quot;;[.A1:.A3];0)"/><table:table-cell table:formula="of:=VLOOKUP(&quot;ab[d]&quot;;[.A1:.A3];1;0)"/></table:table-row><table:table-row><table:table-cell office:value-type="string" office:string-value="abd"/></table:table-row><table:table-row><table:table-cell office:value-type="string" office:string-value="a.*"/></table:table-row></table:table>`;

/** Opens independent ODF content and parses actual formula references. @param settings - Authored settings XML. @returns Owned document. */
function load(settings = ""): ScDocument {
  const document = new ScDocument(undefined, createBrowserRegexMatcher);
  const namespaces = ODF_NAMESPACES;
  new ScXMLImport(document).importContent(
    `<office:document-content xmlns:office="${namespaces.office}" xmlns:table="${namespaces.table}" xmlns:text="${namespaces.text}" xmlns:of="${namespaces.of}"><office:body><office:spreadsheet>${settings}${tableContent}</office:spreadsheet></office:body></office:document-content>`,
  );
  return document;
}

it("applies the historical ODF regex default even when the settings element is absent", /** Verifies the source default and its suppression at export. @returns Completion. */ async () => {
  const fresh = new ScDocument();
  const absent = load();
  const empty = load("<table:calculation-settings/>");
  try {
    expect(fresh.GetDocOptions().IsFormulaWildcardsEnabled()).toBe(true);
    for (const document of [absent, empty]) {
      const options = document.GetDocOptions();
      expect(options.IsFormulaRegexEnabled()).toBe(true);
      expect(options.IsFormulaWildcardsEnabled()).toBe(false);
      expect(options.GetIterCount()).toBe(100);
      expect(options.GetIterEps()).toBe(0.001);
      expect(DetectSearchType("a.*", options)).toBe(SearchParam.SearchType.Regexp);
      const xml = await (
        await DocumentArchive.open(await writeOdsDocument(document))
      ).readTextEntry("content.xml");
      expect(xml).not.toContain("<table:calculation-settings");
    }
  } finally {
    fresh.Dispose();
    absent.Dispose();
    empty.Dispose();
  }
});

it("applies the imported ODS search mode to formula criteria after Worker restore", /** Recalculates native COUNTIF, MATCH and VLOOKUP against the ODF regular-expression setting. @returns Completion. */ async () => {
  const source = load();
  let restored: ScDocument | undefined;
  let reopened: ScDocument | undefined;
  try {
    const bytes = await writeOdsDocument(source);
    const record = await processOdsWorkerRequest({
      id: 1,
      operation: "import",
      input: bytes.buffer as ArrayBuffer,
      options: {},
    });
    assert("sheets" in record);
    restored = decodeCalcDocument(structuredClone(record));
    reopened = await readOdsDocument(await writeOdsDocument(restored), {
      regexMatcherFactory: createBrowserRegexMatcher,
    });
    for (const document of [source, restored, reopened]) {
      expect(document.GetDocOptions().IsFormulaRegexEnabled()).toBe(true);
      document.CalcAll();
      expect(document.GetFormulaCell(new ScAddress(1, 0, 0))?.GetValue()).toBe(3);
      expect(document.GetFormulaCell(new ScAddress(2, 0, 0))?.GetValue()).toBe(2);
      const lookup = document.GetFormulaCell(new ScAddress(3, 0, 0));
      assert(lookup);
      expect(text(lookup.GetString().getString())).toBe("abd");
    }
  } finally {
    reopened?.Dispose();
    restored?.Dispose();
    source.Dispose();
  }
});

it("round-trips ODS calculation properties and applies wildcard precedence before formulas", /** Checks native settings, formatter propagation, Worker transport and package serialization. @returns Completion. */ async () => {
  const document = load(
    '<table:calculation-settings table:use-wildcards="true" table:use-regular-expressions="false" table:case-sensitive="false" table:search-criteria-must-apply-to-whole-cell="false" table:automatic-find-labels="false" table:precision-as-shown="true" table:null-year="1950"><table:null-date table:date-value="1904-01-01"/><table:iteration table:status="enable" table:steps="37" table:maximum-difference="0.0002"/></table:calculation-settings>',
  );
  const record = structuredClone(encodeCalcDocument(document));
  const transferred = decodeCalcDocument(record);
  const bytes = await writeOdsDocument(transferred);
  const reopened = await readOdsDocument(bytes);
  try {
    for (const copy of [document, transferred, reopened]) {
      const options = copy.GetDocOptions();
      expect(options.IsFormulaWildcardsEnabled()).toBe(true);
      expect(options.IsFormulaRegexEnabled()).toBe(false);
      expect(options.IsIgnoreCase()).toBe(true);
      expect(options.IsMatchWholeCell()).toBe(false);
      expect(options.IsLookUpColRowNames()).toBe(false);
      expect(options.IsCalcAsShown()).toBe(true);
      expect(options.GetYear2000()).toBe(1950);
      expect(options.IsIter()).toBe(true);
      expect(options.GetIterCount()).toBe(37);
      expect(options.GetIterEps()).toBe(0.0002);
      expect(copy.GetFormatTable().GetNullDate().GetDate()).toBe(19040101);
      expect(copy.GetFormatTable().ExpandTwoDigitYear(49)).toBe(2049);
      const formula = copy.GetFormulaCell(new ScAddress(1, 0, 0));
      assert(formula);
      formula.SetDirty();
      expect(formula.GetValue()).toBe(1);
    }
    const xml = await (await DocumentArchive.open(bytes)).readTextEntry("content.xml");
    expect(xml).toContain('table:use-regular-expressions="false" table:use-wildcards="true"');
    expect(xml).toContain('<table:null-date table:date-value="1904-01-01"/>');
    expect(xml).toContain(
      '<table:iteration table:status="enable" table:steps="37" table:maximum-difference="0.0002"/>',
    );
    const { calculationSettings, ...legacy } = record;
    assert(calculationSettings);
    const old = decodeCalcDocument(legacy);
    try {
      expect(old.GetFormatTable().GetNullDate().GetDate()).toBe(19040101);
      expect(old.GetDocOptions().IsIgnoreCase()).toBe(true);
      expect(old.GetDocOptions().GetIterCount()).toBe(100);
    } finally {
      old.Dispose();
    }
    expect(
      /** Rejects malformed native iteration fields at the Worker boundary. @returns Decode attempt. */ () =>
        decodeCalcDocument({
          ...record,
          calculationSettings: { ...calculationSettings, iterationCount: 65536 },
        }),
    ).toThrow("Calc worker calculation settings are invalid");
  } finally {
    document.Dispose();
    transferred.Dispose();
    reopened.Dispose();
  }
});

it("uses source narrowing for the year and iteration count even with iteration disabled", /** Checks source numeric behavior and the independent disabled iteration attributes. @returns Completion. */ async () => {
  const document = load(
    '<table:calculation-settings table:null-year="-1" table:use-regular-expressions="false"><table:iteration table:steps="65537tail" table:maximum-difference="0.0004tail"/></table:calculation-settings>',
  );
  try {
    const options = document.GetDocOptions();
    expect(options.GetYear2000()).toBe(65535);
    expect(options.IsIter()).toBe(false);
    expect(options.GetIterCount()).toBe(1);
    expect(options.GetIterEps()).toBe(0.0004);
    expect(options.IsFormulaWildcardsEnabled()).toBe(false);
    expect(options.IsFormulaRegexEnabled()).toBe(false);
    const xml = await (
      await DocumentArchive.open(await writeOdsDocument(document))
    ).readTextEntry("content.xml");
    expect(xml).toContain('table:null-year="65535"');
    expect(xml).toContain('<table:iteration table:steps="1" table:maximum-difference="0.0004"/>');
  } finally {
    document.Dispose();
  }
});

it("retains the enabled iteration setting from the original Calc tdf79998 ODS", /** Opens the upstream fixture through the complete package path. @returns Completion. */ async () => {
  const document = await readOdsDocument(
    new Uint8Array(
      readFileSync("../../vendor/libreoffice-reference/sc/qa/unit/data/ods/tdf79998.ods"),
    ),
  );
  try {
    expect(document.GetDocOptions().IsIter()).toBe(true);
    expect(document.GetDocOptions().GetIterCount()).toBe(100);
    expect(document.GetDocOptions().GetIterEps()).toBe(0.001);
  } finally {
    document.Dispose();
  }
});
