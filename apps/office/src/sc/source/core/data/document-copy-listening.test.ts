/** @fileoverview Native copied-range listener completion and scoped deferred broadcaster destruction over actual stores. */
import { expect, it } from "vitest";
import { ScDocument, ScDocumentMode } from "../../../inc/document";
import { ScAddress, ScRange } from "../../../inc/address";
import { ScTable } from "../../../inc/table";
import { ScFormulaCell } from "../../../inc/formulacell";
import { NoListening } from "../../../inc/types";
import { DelayDeletingBroadcasters } from "../../../inc/scopetools";
import { CheckElem, SetElementsToEmpty1 } from "../../../inc/mtvfunctions";
import { numeric_block, element_type_empty } from "../../../inc/mtvelements";
import { SvtListener } from "../../../../svl/source/notify/listener";
import type { SfxHint } from "../../../../svl/inc/hint";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
const grammar = FormulaGrammar.Grammar.GRAM_NATIVE;
/** Allocates the ordinary native owner. @returns Document. */
function document(): ScDocument {
  const doc = new ScDocument();
  const name = unicode("Data");
  doc.InsertTab(0, name);
  name.dispose();
  return doc;
}

it("keeps nested delay state and removes separate unobserved runs while preserving reattached listeners", /** Actual Svt registrations and managed broadcaster stores witness scope completion. @returns Nothing. */ () => {
  const doc = document(),
    column = (doc.FetchTable(0) as ScTable).CreateColumnIfNotExists(0),
    listeners = Array.from(
      { length: 6 },
      /** Allocates an actual native listener. @returns Listener. */ () =>
        new SvtListener<SfxHint>(),
    );
  try {
    listeners.forEach(
      /** Registers actual adjacent broadcaster elements. @param listener - Owner. @param row - Native row. @returns Nothing. */ (
        listener,
        row,
      ) => column.StartListening(listener, row),
    );
    const before = column.GetBroadcaster(2),
      outer = new DelayDeletingBroadcasters(doc),
      inner = new DelayDeletingBroadcasters(doc);
    expect(doc.IsDelayedDeletingBroadcasters()).toBe(true);
    for (const row of [0, 2, 3, 5])
      column.EndListening(listeners[row] as SvtListener<SfxHint>, row);
    expect(column.GetBroadcaster(0)).not.toBeNull();
    column.StartListening(listeners[2] as SvtListener<SfxHint>, 2);
    expect(column.GetBroadcaster(2)).toBe(before);
    inner.Dispose();
    expect(doc.IsDelayedDeletingBroadcasters()).toBe(true);
    expect(column.GetBroadcaster(3)).not.toBeNull();
    outer.Dispose();
    expect(doc.IsDelayedDeletingBroadcasters()).toBe(false);
    for (const row of [0, 3, 5]) expect(column.GetBroadcaster(row)).toBeNull();
    for (const row of [1, 2, 4]) expect(column.GetBroadcaster(row)?.HasListeners()).toBe(true);
    column.DeleteEmptyBroadcasters();
    column.EndListening(listeners[1] as SvtListener<SfxHint>, 1);
    expect(column.GetBroadcaster(1)).toBeNull();
    doc.EnableDelayDeletingBroadcasters(false);
  } finally {
    for (const listener of listeners) listener.Dispose();
    doc.Dispose();
  }
});
it("flushes sparse Undo sheets and keeps a pending broadcaster when it becomes observed again", /** Uses original InitUndo null slots rather than a fabricated tab list. @returns Nothing. */ () => {
  const source = document(),
    undo = new ScDocument(ScDocumentMode.SCDOCMODE_UNDO),
    listener = new SvtListener<SfxHint>();
  try {
    undo.InitUndo(source, 2, 2);
    const column = (undo.FetchTable(2) as ScTable).CreateColumnIfNotExists(0);
    column.StartListening(listener, 4);
    const original = column.GetBroadcaster(4),
      delay = new DelayDeletingBroadcasters(undo);
    column.EndListening(listener, 4);
    column.StartListening(listener, 4);
    delay.Dispose();
    expect(column.GetBroadcaster(4)).toBe(original);
    expect(listener.HasBroadcaster()).toBe(true);
    undo.EnableDelayDeletingBroadcasters(true);
    column.EndListening(listener, 4);
    undo.EnableDelayDeletingBroadcasters(false);
    expect(column.GetBroadcaster(4)).toBeNull();
    expect(undo.FetchTable(0)).toBeNull();
  } finally {
    listener.Dispose();
    undo.Dispose();
    source.Dispose();
  }
});
it("retains native typed CheckElem offsets and mutable deletion continuation across mixed blocks", /** Actual numeric store blocks exercise prefix,gap,tail and no-match alternatives. @returns Nothing. */ () => {
  const doc = document(),
    column = (doc.FetchTable(0) as ScTable).CreateColumnIfNotExists(0),
    store = column.GetCellStore();
  try {
    for (let row = 2; row <= 6; ++row) column.SetValue(row, row);
    const position = store.cposition(2).first,
      visited: number[] = [],
      found = CheckElem(
        numeric_block,
        store,
        position,
        1,
        3,
        /** Checks the original absolute row and borrowed numeric value. @param row - Native row. @param value - Actual scalar. @returns Match. */ (
          row,
          value,
        ) => {
          visited.push(row);
          return value === 4;
        },
      );
    expect(found[1]).toBe(2);
    expect(visited).toEqual([3, 4]);
    SetElementsToEmpty1(
      numeric_block,
      store,
      /** Selects separated real numeric runs. @param _row - Native row. @param value - Actual scalar. @returns Remove. */ (
        _row,
        value,
      ) => value % 2 === 0,
    );
    for (const row of [2, 4, 6]) expect(store.get_type(row)).toBe(element_type_empty);
    expect(column.GetValue(3)).toBe(3);
    expect(column.GetValue(5)).toBe(5);
    SetElementsToEmpty1(
      numeric_block,
      store,
      /** Leaves all represented elements intact. @returns False. */ () => false,
    );
    expect(column.GetValue(5)).toBe(5);
  } finally {
    doc.Dispose();
  }
});
it("starts real copied-formula dependencies only after no-listening is lifted and retains missing-sheet guards", /** Uses already compiled formula owners and native range completion. @returns Nothing. */ () => {
  const doc = document(),
    position = new ScAddress(1, 0, 0),
    column = (doc.FetchTable(0) as ScTable).CreateColumnIfNotExists(1),
    input = unicode("=A1+1"),
    formula = new ScFormulaCell(doc, position, input, grammar);
  input.dispose();
  try {
    doc.SetValue(new ScAddress(), 4);
    column.SetFormulaCell(0, formula, NoListening);
    expect(doc.GetBroadcaster(new ScAddress())).toBeNull();
    doc.SetNoListening(true);
    const range = new ScRange(1, 0, 0, 1, 0, 2);
    doc.StartAllListeners(range);
    expect(doc.GetBroadcaster(new ScAddress())).toBeNull();
    doc.SetNoListening(false);
    doc.StartAllListeners(range);
    expect(doc.GetValue(position)).toBe(5);
    doc.SetValue(new ScAddress(), 10);
    expect(doc.GetValue(position)).toBe(11);
  } finally {
    doc.Dispose();
  }
});
it.each([ScDocumentMode.SCDOCMODE_CLIP, ScDocumentMode.SCDOCMODE_UNDO])(
  "keeps native temporary-document listener completion disabled in mode%s",
  /** Native temporary owners retain compiled code without live registrations. @param mode - Actual document mode. @returns Nothing. */ (
    mode,
  ) => {
    const source = document(),
      doc = new ScDocument(mode),
      name = unicode("Temporary"),
      input = unicode("=A1+1");
    doc.SharePooledResources(source);
    doc.InsertTab(0, name);
    name.dispose();
    try {
      const column = (doc.FetchTable(0) as ScTable).CreateColumnIfNotExists(1),
        formula = new ScFormulaCell(doc, new ScAddress(1, 0, 0), input, grammar);
      column.SetFormulaCell(0, formula, NoListening);
      doc.StartAllListeners(new ScRange(1, 0, 0, 1, 0, 0));
      expect(doc.GetBroadcaster(new ScAddress())).toBeNull();
    } finally {
      input.dispose();
      doc.Dispose();
      source.Dispose();
    }
  },
);
