/** @fileoverview Source ColumnSet ordering and actual sheet/column listening traversal. */
import { expect, it } from "vitest";
import { ColumnSet } from "../../../inc/columnset";
import { ScDocument } from "../../../inc/document";
import { ScDocumentImport } from "../../../inc/documentimport";
import { ScAddress } from "../../../inc/address";
import { StartListeningContext } from "../../../inc/listenercontext";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";

it("replaces output with sorted unique source columns, including unchecked coordinates", /** Checks native set output ownership and sorted membership. @returns Nothing. */ () => {
  const set = new ColumnSet(),
    output = [99];
  expect(set.empty()).toBe(true);
  for (const col of [5, -1, 2, 5]) set.set(3, col);
  set.getColumns(3, output);
  expect(output).toEqual([-1, 2, 5]);
  expect(set.hasTab(3)).toBe(true);
  expect(set.empty()).toBe(false);
  set.getColumns(4, output);
  expect(output).toEqual([]);
});

it("starts only selected allocated columns, then the no-range document call starts every sheet", /** Checks actual imported formula listeners across selected columns and sheets. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    importer = new ScDocumentImport(doc);
  for (let tab = 0; tab < 2; tab++) {
    doc.InsertTab(tab, unicode(`Sheet${tab + 1}`));
    for (const col of [1, 2]) {
      const formula = unicode("=A1");
      try {
        importer.setFormulaCell(
          new ScAddress(col, 0, tab),
          formula,
          FormulaGrammar.Grammar.GRAM_NATIVE,
        );
      } finally {
        formula.dispose();
      }
    }
  }
  const selected = new ColumnSet(),
    context = new StartListeningContext(doc);
  selected.set(0, 1);
  selected.set(0, -1);
  selected.set(0, 1000);
  context.setColumnSet(selected);
  expect(context.getColumnSet()).toBe(selected);
  doc.FetchTable(0)?.StartListeners(context, true);
  doc.FetchTable(1)?.StartListeners(context, true);
  expect(doc.GetBroadcaster(new ScAddress())?.GetAllListeners()).toEqual([
    doc.GetFormulaCell(new ScAddress(1, 0, 0)),
  ]);
  expect(doc.GetBroadcaster(new ScAddress(0, 0, 1))).toBeNull();
  doc.StartAllListeners();
  for (let tab = 0; tab < 2; tab++) {
    const listeners = doc.GetBroadcaster(new ScAddress(0, 0, tab))?.GetAllListeners();
    expect(listeners).toHaveLength(2);
    expect(listeners).toContain(doc.GetFormulaCell(new ScAddress(1, 0, tab)));
    expect(listeners).toContain(doc.GetFormulaCell(new ScAddress(2, 0, tab)));
  }
});
