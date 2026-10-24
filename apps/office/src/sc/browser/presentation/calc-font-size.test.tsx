/** @fileoverview Font-size vertical slice through the actual shared Writer widget, Calc Sfx owner, real pattern store, history and ODS. */
import type { ScTable } from "../../inc/table";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";
import { ScAddress, ScRange } from "../../inc/address";
import { ScInputMode, InsertDeleteFlags } from "../../inc/global";
import { SvxWeightItem } from "../../../editeng/inc/wghtitem";
import { FontWeight } from "../../../tools/inc/fontenum";
import { SvxFontHeightItem } from "../../../editeng/inc/fhgtitem";
import { ScPatternAttr } from "../../inc/patattr";
import { ScDocument } from "../../inc/document";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { readOdsDocument, writeOdsDocument } from "../../source/filter/xml/xmlwrap";
/** Reads effective native height. @param doc - Document. @param col - Column. @param row - Row. @param tab - Sheet. @param which - Script identity. @returns Twips. */
function height(doc: ScDocument, col: number, row: number, tab = 0, which = 101): number {
  return (
    (doc.GetPattern(new ScAddress(col, row, tab)) as ScPatternAttr).GetItem(
      which,
    ) as SvxFontHeightItem
  ).GetHeight();
}
it("binds the real shared font widget,mixed state,paint and native repeated-operation history", /** No secondary format model or direct UI state assignment participates. @returns Nothing. */ () => {
  const s = createCalcSession(),
    c = s.controller,
    d = s.frame.GetDispatcher(),
    doc = c.shell.GetDocument();
  render(
    <CalcWorkbench
      controller={c}
      frame={s.frame}
      fileWorkflows={s.fileWorkflows}
      sheetWorkflows={s.sheetWorkflows}
    />,
  );
  const select = screen.getByRole("combobox", { name: "Font Size" });
  expect(select).toBeEnabled();
  expect(select).toHaveValue("10 pt");
  expect(d.QueryDispatch(".uno:FontHeight")?.slot.slotId).toBe(10015);
  fireEvent.change(select, { target: { value: "18" } });
  fireEvent.keyDown(select, { key: "Tab" });
  expect(height(doc, 0, 0)).toBe(360);
  expect(screen.getByRole("gridcell", { name: "A1" })).toHaveStyle({ fontSize: "18pt" });
  for (const which of [101, 112, 117]) expect(height(doc, 0, 0, 0, which)).toBe(360);
  const count = c.shell.GetUndoManager().GetUndoActionCount(),
    generation = c.shell.GetContentGeneration();
  act(
    /** Native attribute operations report success and record history even when stored attributes are unchanged. @returns Nothing. */ () => {
      expect(c.SetFontSize(18)).toBe(true);
    },
  );
  expect(c.shell.GetUndoManager().GetUndoActionCount()).toBe(count + 1);
  expect(c.shell.GetContentGeneration()).toBe(generation + 1);
  act(
    /** Extends the actual range to a cell with a different font height. @returns Nothing. */ () => {
      c.Select(1, 0, true);
    },
  );
  expect(select).toHaveValue("");
  expect(d.QueryState(".uno:FontHeight").mixed).toBe(true);
  fireEvent.change(select, { target: { value: "24" } });
  fireEvent.keyDown(select, { key: "Tab" });
  expect(height(doc, 0, 0)).toBe(480);
  expect(height(doc, 1, 0)).toBe(480);
  expect(select).toHaveValue("24");
  act(
    /** Restores the previous mixed attribute selection. @returns Nothing. */ () => {
      c.Undo();
    },
  );
  expect(height(doc, 0, 0)).toBe(360);
  expect(height(doc, 1, 0)).toBe(200);
  expect(c.viewData.GetMarkData().GetMarkArea()).toEqual(new ScRange(0, 0, 0, 1, 0, 0));
  expect(select).toHaveValue("");
  act(
    /** Reapplies the original uniform height delta. @returns Nothing. */ () => {
      c.Redo();
    },
  );
  expect(height(doc, 1, 0)).toBe(480);
  expect(select).toHaveValue("24 pt");
  expect(c.shell.GetUndoManager().GetUndoAction()?.GetComment()).toBe("Attributes");
  expect(doc.GetPool()).toBe(doc.getCellAttributeHelper().GetPool());
  s.Close();
});
it("formats selected sheets,full rows and columns efficiently and round-trips styled empty ranges", /** Verifies actual default-column inheritance and primary document package bytes. @returns Completion. */ async () => {
  const s = createCalcSession(),
    c = s.controller,
    doc = c.shell.GetDocument();
  c.InsertSheet();
  c.SelectAllTables();
  c.Select(2, 7);
  c.MarkRows();
  expect(c.SetFontSize(14)).toBe(true);
  for (const tab of [0, 1]) {
    expect((doc.FetchTable(tab) as ScTable).GetAllocatedColumnsCount()).toBe(1);
    expect(height(doc, doc.MaxCol(), 7, tab)).toBe(280);
    expect(height(doc, 0, 6, tab)).toBe(200);
  }
  doc.SetValue(new ScAddress(4, 7, 1), 9);
  expect(height(doc, 4, 7, 1)).toBe(280);
  expect(c.shell.GetDocument().GetValue(new ScAddress(4, 7, 1))).toBe(9);
  c.Undo();
  for (const tab of [0, 1]) expect(height(doc, doc.MaxCol(), 7, tab)).toBe(200);
  expect(c.viewData.GetTabNumber()).toBe(1);
  expect([...c.viewData.GetMarkData().GetSelectedTabs()]).toEqual([0, 1]);
  c.Redo();
  c.Select(2, 3);
  c.MarkColumns();
  c.SetFontSize(20);
  expect(height(doc, 2, doc.MaxRow(), 0)).toBe(400);
  expect(height(doc, 3, doc.MaxRow(), 0)).toBe(200);
  const loaded = await readOdsDocument(writeOdsDocument(doc));
  expect(height(loaded, 2, doc.MaxRow(), 1)).toBe(400);
  expect(height(loaded, doc.MaxCol(), 7, 0)).toBe(280);
  expect(loaded.GetValue(new ScAddress(4, 7, 1))).toBe(9);
  expect(loaded.GetCellType(new ScAddress(2, 1000, 1))).toBe(0);
  loaded.DisposeAttributes();
  s.Close();
});
it("validates command arguments,commits drafts before attributes and rejects invalid input atomically", /** Uses actual input/parser failure boundaries. @returns Nothing. */ () => {
  const s = createCalcSession(),
    c = s.controller,
    d = s.frame.GetDispatcher(),
    doc = c.shell.GetDocument();
  for (const value of [0, -1, NaN, Infinity, 0.01, 0x100000000])
    expect(
      /** Rejects an invalid browser height before input mutation. @returns Never. */ () =>
        c.SetFontSize(value),
    ).toThrow(/twips/);
  expect(d.Execute(".uno:FontHeight")).toMatchObject({ status: "executed", value: false });
  for (const args of [{}, null, { fontSizePt: "18" }])
    expect(
      /** Rejects malformed structured Sfx arguments. @returns Never. */ () =>
        d.Execute(".uno:FontHeight", args),
    ).toThrow(/numeric fontSizePt/);
  c.StartInput(ScInputMode.SC_INPUT_TABLE, "hello");
  expect(c.SetFontSize(12)).toBe(true);
  expect(c.Input()).toBe("hello");
  c.StartInput(ScInputMode.SC_INPUT_TOP, "=UNPORTED(A1)");
  const count = c.shell.GetUndoManager().GetUndoActionCount();
  expect(c.SetFontSize(18)).toBe(false);
  expect(height(doc, 0, 0)).toBe(240);
  expect(c.shell.GetUndoManager().GetUndoActionCount()).toBe(count);
  c.Cancel();
  c.Select(3, 3);
  c.Select(1, 1, true);
  expect(c.SetFontSize(16)).toBe(true);
  expect(height(doc, 1, 1)).toBe(320);
  expect(height(doc, 3, 3)).toBe(320);
  s.Close();
});
it("retains non-height item deltas and copies real simple attributes across documents without content", /** Covers valid,invalid and unsupported native owner branches. @returns Nothing. */ () => {
  const source = new ScDocument(),
    dest = new ScDocument();
  for (const doc of [source, dest]) {
    doc.InsertTab(0, unicode("A"));
    doc.InsertTab(1, unicode("B"));
  }
  const delta = new ScPatternAttr(source.getCellAttributeHelper());
  delta.ItemSetPut(new SvxWeightItem(FontWeight.WEIGHT_BOLD, 102));
  source.ApplyPatternAreaTab(0, 0, 1, 2, 0, delta);
  delta.ItemSetClearItem(102);
  delta.ItemSetPut(new SvxFontHeightItem(333, 100, 101));
  expect(source.ApplyPatternAreaTab(1, 2, 0, 0, 0, delta)).toBe(true);
  expect(source.ApplyPatternAreaTab(-1, 0, 0, 0, 0, delta)).toBe(false);
  expect(source.ApplyPatternAreaTab(0, 0, 0, 0, 5, delta)).toBe(false);
  source.CopyToDocument(new ScRange(0, 0, 0, 2, 3, 2), InsertDeleteFlags.ATTRIB, false, dest);
  expect(height(dest, 1, 2)).toBe(333);
  expect((dest.GetPattern(new ScAddress(1, 2, 0)) as ScPatternAttr).GetItem(102)).toEqual(
    (source.GetPattern(new ScAddress(1, 2, 0)) as ScPatternAttr).GetItem(102),
  );
  expect(height(dest, 2, 3)).toBe(200);
  expect(dest.GetPattern(new ScAddress(-1, 0, 0))).toBeNull();
  expect(dest.GetPattern(new ScAddress(0, 0, 9))).toBeNull();
  expect(
    /** Rejects unsupported partial attribute copy flags. @returns Never. */ () =>
      source.CopyToDocument(new ScRange(), InsertDeleteFlags.HARDATTR, false, dest),
  ).toThrow(/attribute document/);
  const unchanged = height(dest, 0, 0);
  delta.ItemSetPut(new SvxFontHeightItem(500, 100, 101));
  source.ApplyPatternAreaTab(0, 0, 0, 0, 0, delta);
  source.CopyToDocument(new ScRange(), InsertDeleteFlags.ATTRIB, true, dest);
  expect(height(dest, 0, 0)).toBe(unchanged);
  const table = source.FetchTable(0) as ScTable;
  expect(table.GetDefaultColumnData().ApplyPatternArea(-1, 0, delta)).toBe(false);
  expect(table.GetDefaultColumnData().ApplyPatternArea(0, source.MaxRow() + 1, delta)).toBe(false);
  delta.Dispose();
  source.DisposeAttributes();
  dest.DisposeAttributes();
});

it("restores exactly the selected sheet when other sheets are outside the font operation", /** Exercises native marks filtering during attribute undo copying. @returns Nothing. */ () => {
  const s = createCalcSession(),
    c = s.controller,
    doc = c.shell.GetDocument();
  c.InsertSheet();
  expect(c.SetFontSize(12)).toBe(true);
  expect(height(doc, 0, 0, 0)).toBe(200);
  expect(height(doc, 0, 0, 1)).toBe(240);
  c.Undo();
  expect(height(doc, 0, 0, 1)).toBe(200);
  s.Close();
});

it("rejects out-of-range shared numeric requests before native pattern mutation", /** The actual font-height item owns scalar admission independently from the positive-only direct controller API. @returns Nothing. */ () => {
  const session = createCalcSession(),
    dispatcher = session.frame.GetDispatcher(),
    doc = session.controller.shell.GetDocument();
  try {
    const count = session.controller.shell.GetUndoManager().GetUndoActionCount();
    expect(dispatcher.Execute(".uno:FontHeight", { fontSizePt: 10001 })).toMatchObject({
      value: false,
    });
    expect(dispatcher.Execute(".uno:FontHeight", { fontSizePt: Number.NaN })).toMatchObject({
      value: false,
    });
    expect(session.controller.shell.GetUndoManager().GetUndoActionCount()).toBe(count);
    expect(height(doc, 0, 0)).toBe(200);
  } finally {
    session.Close();
  }
});
