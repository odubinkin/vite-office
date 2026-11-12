/** @fileoverview Actual global/document calculation-value ownership and native ucalc.cxx::testFuncParam string coercion cases through real compiled formula cells. */
import { expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScDocumentImport } from "../../../inc/documentimport";
import { ScCalcConfig } from "../../../inc/calcconfig";
import { ScInterpreter } from "../inc/interpre";
import { ScAddress } from "../../../inc/address";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";

it("copies the real global settings once into each document and preserves stable owned values", /** Global assignments affect subsequent construction; existing document values remain independent. @returns Nothing. */ () => {
  const saved = new ScCalcConfig(ScInterpreter.GetGlobalConfig()),
    settings = new ScCalcConfig(saved),
    device = unicode("native device");
  const documents: ScDocument[] = [];
  try {
    settings.meStringConversion = ScCalcConfig.StringConversion.ZERO;
    settings.maOpenCLDevice.assign(device);
    ScInterpreter.SetGlobalConfig(settings);
    const doc = new ScDocument();
    documents.push(doc);
    const borrowed = doc.GetCalcConfig();
    expect(borrowed).not.toBe(settings);
    expect(borrowed.equals(settings)).toBe(true);
    settings.SetStringRefSyntax(FormulaGrammar.AddressConvention.CONV_XL_A1);
    settings.meStringConversion = ScCalcConfig.StringConversion.ILLEGAL;
    expect(borrowed.meStringConversion).toBe(ScCalcConfig.StringConversion.ZERO);
    doc.SetCalcConfig(settings);
    expect(doc.GetCalcConfig()).toBe(borrowed);
    expect(borrowed.equals(settings)).toBe(true);
    settings.maOpenCLDevice.clear();
    expect(text(borrowed.maOpenCLDevice)).toBe("native device");
    ScInterpreter.SetGlobalConfig(saved);
    const second = new ScDocument();
    documents.push(second);
    expect(second.GetCalcConfig().equals(saved)).toBe(true);
  } finally {
    ScInterpreter.SetGlobalConfig(saved);
    for (const doc of documents) doc.Dispose();
    device.dispose();
    settings.dispose();
    saved.dispose();
  }
});
const policies = [
  [ScCalcConfig.StringConversion.LOCALE, true, [3, 3, 7, null, 7.4]],
  [ScCalcConfig.StringConversion.LOCALE, false, [null, null, 7, null, 7.4]],
  [ScCalcConfig.StringConversion.UNAMBIGUOUS, true, [3, 3, 7, null, null]],
  [ScCalcConfig.StringConversion.UNAMBIGUOUS, false, [null, null, 7, null, null]],
  [ScCalcConfig.StringConversion.ZERO, true, [3, 3, 3, 3, 3]],
  [ScCalcConfig.StringConversion.ILLEGAL, false, [null, null, null, null, null]],
] as const;
it.each(policies)(
  "ports ucalc testFuncParam conversion policy %s empty=%s",
  /** Original five formula strings and six policy combinations use actual compiler, import stores and interpreter results. @param policy - Conversion mode. @param empty - Empty-string flag. @param results - Native expected values or VALUE errors. @returns Nothing. */ (
    policy,
    empty,
    results,
  ) => {
    const doc = new ScDocument(),
      importer = new ScDocumentImport(doc),
      config = new ScCalcConfig(),
      name = unicode("Sheet1");
    try {
      importer.appendSheet(name);
      config.meStringConversion = policy;
      config.mbEmptyStringAsZero = empty;
      doc.SetCalcConfig(config);
      for (const [row, value] of ["", " ", " 4 ", " x ", "4.4"].entries()) {
        const source = unicode(`="${value}"+3`),
          pos = new ScAddress(0, row, 0);
        try {
          importer.setFormulaCell(pos, source, FormulaGrammar.Grammar.GRAM_NATIVE_UI);
        } finally {
          source.dispose();
        }
        if (results[row] === null) expect(doc.GetErrCode(pos)).toBe(FormulaError.NoValue);
        else expect(doc.GetValue(pos)).toBeCloseTo(results[row] as number, 12);
      }
    } finally {
      name.dispose();
      config.dispose();
      doc.Dispose();
    }
  },
);
it("coerces referenced string and cached-string formula cells through document policy", /** Real stored cells are read by compiled arithmetic rather than a replacement evaluator. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    importer = new ScDocumentImport(doc),
    name = unicode("Sheet1"),
    input = unicode("4"),
    source = unicode("=A1+3"),
    stringFormula = unicode('="4"');
  try {
    importer.appendSheet(name);
    importer.setStringCell(new ScAddress(), input);
    importer.setFormulaCell(new ScAddress(1, 0, 0), source, FormulaGrammar.Grammar.GRAM_NATIVE_UI);
    expect(doc.GetValue(new ScAddress(1, 0, 0))).toBe(7);
    importer.setFormulaCell(new ScAddress(), stringFormula, FormulaGrammar.Grammar.GRAM_NATIVE_UI);
    importer.setFormulaCell(new ScAddress(1, 1, 0), source, FormulaGrammar.Grammar.GRAM_NATIVE_UI);
    expect(doc.GetValue(new ScAddress(1, 1, 0))).toBe(7);
  } finally {
    for (const value of [name, input, source, stringFormula]) value.dispose();
    doc.Dispose();
  }
});
