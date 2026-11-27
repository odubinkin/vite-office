/** @fileoverview Native testDataValidityODS rules and cells across the Calc worker and ODS. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import type { SfxUInt32Item } from "../../../../svl/source/items/intitem";
import {
  decodeCalcDocument,
  encodeCalcDocument,
} from "../../../browser/filter/xml/calc-document-codec";
import { ScAddress } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import { ATTR_VALIDDATA } from "../../../inc/scitems";
import { ScConditionMode } from "../../core/data/conditio.entry";
import {
  ScValidErrorStyle,
  ScValidationMode,
  TableValidationVisibility,
} from "../../core/data/validat";
import { readOdsDocument, writeOdsDocument } from "./xmlwrap";

it("retains the LibreOffice dataValidity.ods rules and all of their cells through a Worker and ODS", /** Ports testDataValidityODS and exercises the export boundary. @returns Completion. */ async () => {
  const original = await readOdsDocument(
    new Uint8Array(
      readFileSync("../../vendor/libreoffice-reference/sc/qa/unit/data/ods/dataValidity.ods"),
    ),
  );
  let transferred: ScDocument | undefined, reopened: ScDocument | undefined;
  try {
    transferred = decodeCalcDocument(structuredClone(encodeCalcDocument(original)));
    reopened = await readOdsDocument(await writeOdsDocument(transferred));
    const rules = [
      [
        0,
        6,
        2,
        2,
        6,
        ScValidationMode.Decimal,
        ScConditionMode.Greater,
        ["3.14"],
        ScValidErrorStyle.Warning,
        "Too small",
        "The number you are trying to enter is not greater than 3.14! Are you sure you want to enter it anyway?",
      ],
      [
        1,
        3,
        3,
        6,
        7,
        ScValidationMode.Whole,
        ScConditionMode.Between,
        ["1", "10"],
        ScValidErrorStyle.Stop,
        "Error sheet 2",
        "Must be a whole number between 1 and 10.",
      ],
      [
        2,
        2,
        2,
        2,
        6,
        ScValidationMode.Custom,
        ScConditionMode.Direct,
        ["ISTEXT([.C3])"],
        ScValidErrorStyle.Stop,
        "Error sheet 3",
        "Must not be a numerical value.",
      ],
    ] as const;
    for (const document of [original, transferred, reopened]) {
      for (const [
        tab,
        baseRow,
        firstRow,
        lastCol,
        lastRow,
        mode,
        comparison,
        operands,
        alert,
        title,
        message,
      ] of rules) {
        const key = tab + 1;
        const rule = document.GetValidationEntry(key);
        assert(rule);
        const address = new ScAddress(2, baseRow, tab);
        expect(rule.GetSrcPos().GetVars()).toEqual(address.GetVars());
        expect(rule.GetDataMode()).toBe(mode);
        expect(rule.GetOperation()).toBe(comparison);
        expect(rule.GetExpressionCount()).toBe(operands.length);
        for (const [index, operand] of operands.entries())
          expect(rule.GetExpression(address, index, FormulaGrammar.Grammar.GRAM_ODFF)).toBe(
            operand,
          );
        expect(rule.GetErrMsg()).toEqual([true, title, message, alert]);
        expect(rule.GetInput()).toEqual([false, "", ""]);
        expect(rule.IsIgnoreBlank()).toBe(true);
        expect(rule.GetListType()).toBe(TableValidationVisibility.Unsorted);
        for (let row = firstRow; row <= lastRow; row++) {
          for (let col = 2; col <= lastCol; col++) {
            const pattern = document.GetPattern(new ScAddress(col, row, tab));
            expect(
              (pattern?.GetItem(ATTR_VALIDDATA) as SfxUInt32Item | undefined)?.GetValue(),
            ).toBe(key);
          }
        }
      }
      for (const [col, row, tab, value] of [
        [2, 2, 0, 3.141],
        [2, 3, 0, 999],
        [2, 3, 1, 4],
        [3, 3, 1, 10],
        [2, 4, 1, 3],
        [2, 7, 1, 5],
        [3, 7, 1, 5],
        [4, 7, 1, 5],
        [5, 7, 1, 5],
        [6, 7, 1, 5],
      ] as const)
        expect(document.GetValue(new ScAddress(col, row, tab))).toBe(value);
      for (const [row, tab, value] of [
        [1, 0, "Enter a number greater than 3.14"],
        [2, 1, "Enter a whole number between 1 and 10"],
        [1, 2, "Enter text not a numeric value."],
        [2, 2, "AAAA"],
        [3, 2, "AAA12"],
      ] as const) {
        const cell = document.GetRefCellValue(new ScAddress(2, row, tab)).getSharedString();
        expect(cell ? text(cell.getString()) : null).toBe(value);
      }
      const predicate = document.GetValidationEntry(3);
      assert(predicate);
      const stringCell = new ScAddress(2, 2, 2);
      const emptyCell = new ScAddress(2, 5, 2);
      expect(predicate.IsCellValid(document.GetRefCellValue(stringCell), stringCell)).toBe(true);
      expect(predicate.IsCellValid(document.GetRefCellValue(emptyCell), emptyCell)).toBe(false);
    }
  } finally {
    reopened?.Dispose();
    transferred?.Dispose();
    original.Dispose();
  }
});
