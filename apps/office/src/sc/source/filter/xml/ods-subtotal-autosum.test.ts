/** @fileoverview Original filtered portions of Calc's testAutoSum ODS scenario. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { CalcViewController } from "../../../browser/controller/calc-view-controller";
import {
  decodeCalcDocument,
  type CalcDocumentRecord,
} from "../../../browser/filter/xml/calc-document-codec";
import { processOdsWorkerRequest } from "../../../browser/filter/xml/ods-worker-runtime";
import { ScAddress, ScRange } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import { ScDocShell } from "../../ui/docshell/docsh";
import { readOdsDocument, writeOdsDocument } from "./xmlwrap";

const subtotalCases = [
  { cell: new ScAddress(2, 48, 0), selection: undefined, source: "C38:C48", value: 20 },
  {
    cell: new ScAddress(2, 100, 0),
    selection: new ScRange(2, 91, 0, 2, 100, 0),
    source: "C92:C100",
    value: 19,
  },
  {
    cell: new ScAddress(2, 150, 0),
    selection: new ScRange(2, 141, 0, 2, 148, 0),
    source: "C142:C149",
    value: 19,
  },
] as const;

/** The address and expected native evaluation of one original case. */
type SubtotalCase = (typeof subtotalCases)[number];

/** Compares the native AutoSum subtotal result and stored formula. @param document - Workbook under test. @param scenario - Original scenario. @returns Nothing. */
function verifySubtotal(document: ScDocument, { cell, source, value }: SubtotalCase): void {
  const formula = document.GetFormulaCell(cell);
  assert(formula);
  expect(document.GetValue(cell)).toBe(value);
  expect(formula.IsSubTotal()).toBe(true);
  const expression = formula.GetFormula(document.GetGrammar());
  try {
    expect(text(expression)).toBe(`=SUBTOTAL(9;${source})`);
  } finally {
    expression.dispose();
  }
}

it("ports the native filtered subtotal cases from autosum.ods", /** Exercises original ODS filters and marked or inferred source ranges through the actual view and Worker. @returns Completion. */ async () => {
  const archive = await DocumentArchive.open(
    new Uint8Array(
      readFileSync("../../vendor/libreoffice-reference/sc/qa/unit/uicalc/data/autosum.ods"),
    ),
  );
  const content = await archive.readTextEntry("content.xml");
  const document = await readOdsDocument({
    format: "xml",
    files: {
      mimetype: await archive.readTextEntry("mimetype"),
      "META-INF/manifest.xml": await archive.readTextEntry("META-INF/manifest.xml"),
      "styles.xml": await archive.readTextEntry("styles.xml"),
      // Keep the unrelated trigonometric cells' original cached values.
      "content.xml": content.replace(/ table:formula="[^"]*\b(?:SIN|TAN)\([^"]*"/gu, ""),
    },
  });
  const controller = new CalcViewController(new ScDocShell(document));
  try {
    for (const scenario of subtotalCases) {
      const { cell, selection } = scenario;
      const view = controller.viewData;
      const mark = view.GetMarkData();
      mark.ResetMark();
      view.SetCurX((selection?.aStart ?? cell).Col());
      view.SetCurY((selection?.aStart ?? cell).Row());
      if (selection) mark.SetMarkArea(selection);
      expect(controller.CanAutoSum()).toBe(true);
      if (controller.AutoSum() !== undefined) expect(controller.Commit()).toBe(true);
      verifySubtotal(document, scenario);
    }
    const bytes = await writeOdsDocument(document);
    const transfer = (await processOdsWorkerRequest({
      id: 1,
      operation: "import",
      input: bytes.slice().buffer,
      options: {},
    })) as CalcDocumentRecord;
    const reopened = decodeCalcDocument(transfer);
    try {
      for (const scenario of subtotalCases) verifySubtotal(reopened, scenario);
    } finally {
      reopened.Dispose();
    }
  } finally {
    controller.Close();
  }
});
