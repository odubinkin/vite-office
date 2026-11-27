/** @fileoverview Native ODF formula namespace, legacy storage grammar and modern export. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { FastAttributeList } from "../../../../xmloff/source/core/xmlimp";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
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

it("opens the original ODF 1.0 formulas in tdf37341 and rewrites them as OpenFormula", /** Uses the upstream GoalSeek input and verifies the formula chain at the ODS boundaries. @returns Completion. */ async () => {
  const source = await readOdsDocument(
    new Uint8Array(
      readFileSync("../../vendor/libreoffice-reference/sc/qa/unit/data/ods/tdf37341.ods"),
    ),
  );
  let transferred: ScDocument | undefined, reopened: ScDocument | undefined;
  try {
    expect(source.GetStorageGrammar()).toBe(FormulaGrammar.Grammar.GRAM_PODF);
    transferred = decodeCalcDocument(structuredClone(encodeCalcDocument(source)));
    expect(transferred.GetStorageGrammar()).toBe(FormulaGrammar.Grammar.GRAM_PODF);
    const bytes = await writeOdsDocument(transferred);
    const archive = await DocumentArchive.open(bytes);
    const xml = await archive.readTextEntry("content.xml");
    expect(xml).toContain('office:version="1.3"');
    expect(xml).toContain('table:formula="of:=SUM([.C7:.C367])"');
    reopened = await readOdsDocument(bytes);
    expect(reopened.GetStorageGrammar()).toBe(FormulaGrammar.Grammar.GRAM_ODFF);
    for (const document of [source, transferred, reopened]) {
      const formula = document.GetFormulaCell(new ScAddress(5, 110, 0));
      assert(formula);
      const expression = formula.GetFormula(FormulaGrammar.Grammar.GRAM_ODFF);
      try {
        expect(text(expression)).toBe("=[.B111]-[.D111]");
      } finally {
        expression.dispose();
      }
      expect(document.GetValue(new ScAddress(5, 6, 0))).toBeCloseTo(991287.52, 2);
    }
  } finally {
    reopened?.Dispose();
    transferred?.Dispose();
    source.Dispose();
  }
});

it("uses the native version default with explicit per-formula namespace overrides", /** Covers ordinary and matrix formulas, names and the unknown-prefix fallback. @returns Nothing. */ () => {
  const ns = ODF_NAMESPACES;
  for (const [version, grammar] of [
    ["", FormulaGrammar.Grammar.GRAM_PODF],
    [' office:version="1.1"', FormulaGrammar.Grammar.GRAM_PODF],
    [' office:version="1.2.3"', FormulaGrammar.Grammar.GRAM_ODFF],
  ] as const) {
    const document = new ScDocument();
    try {
      const importer = new ScXMLImport(document);
      importer.importContent(
        `<office:document-content xmlns:office="${ns.office}" xmlns:table="${ns.table}" xmlns:legacy="${ns.oooc}" xmlns:current="${ns.of}"${version}><office:body><office:spreadsheet>
         <table:table table:name="Data"><table:table-row>
         <table:table-cell office:value-type="float" office:value="4"/>
         <table:table-cell table:formula="legacy:=MINIFS([.A1:.A1];[.A1:.A1];4)"/>
         <table:table-cell table:formula="current:=NamedValue+1"/>
         <table:table-cell table:formula="=[.A1]*2" table:number-matrix-columns-spanned="1" table:number-matrix-rows-spanned="1" office:value-type="float" office:value="8"/>
         <table:table-cell table:formula="=SUM(NamedRange)"/>
         </table:table-row></table:table><table:named-expressions>
         <table:named-expression table:name="NamedValue" table:expression="[.$A$1]*3" table:base-cell-address="$Data.$A$1"/>
         <table:named-range table:name="NamedRange" table:cell-range-address="$Data.$A$1" table:base-cell-address="$Data.$A$1"/>
         </table:named-expressions></office:spreadsheet></office:body></office:document-content>`,
      );
      expect(document.GetStorageGrammar()).toBe(grammar);
      document.CalcAll();
      expect(document.GetValue(new ScAddress(1, 0, 0))).toBe(4);
      expect(document.GetValue(new ScAddress(2, 0, 0))).toBe(13);
      expect(document.GetValue(new ScAddress(3, 0, 0))).toBe(8);
      expect(document.GetValue(new ScAddress(4, 0, 0))).toBe(4);
      expect(
        importer.ExtractFormulaNamespaceGrammar("unknown:=1", new FastAttributeList([])),
      ).toEqual({
        source: "unknown:=1",
        grammar,
      });
    } finally {
      document.Dispose();
    }
  }
});
