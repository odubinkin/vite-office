/** @fileoverview Real Calc model/view/history operations at the browser input boundary. */
import { ScInputMode } from "../../inc/global";
import { expect, it, vi } from "vitest";
import { CalcViewController } from "./calc-view-controller";
import { ScDocShell } from "../../source/ui/docshell/docsh";
import { ScDocument } from "../../inc/document";
import { ScAddress, MAXCOL, MAXROW } from "../../inc/address";
import {
  captureCell,
  applyCell,
  parseCellInput,
  cellInputText,
  cellPresentation,
} from "../editor/cell-input";
import { FormulaGrammar } from "../../../formula/inc/grammar";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
it("edits canonical scalars and formulas with real dependency updates and token-valued Undo/Redo", /** No browser workbook or substitute evaluator participates. @returns Nothing. */ () => {
  const c = new CalcViewController(),
    doc = c.shell.GetDocument(),
    listener = vi.fn(),
    detach = c.Subscribe(listener);
  expect(c.GetSnapshot()).toBe(0);
  expect(c.Address()).toBe("A1");
  expect(c.Input()).toBe("");
  expect(c.Undo()).toBe(false);
  expect(c.Redo()).toBe(false);
  expect(c.CanUndo()).toBe(false);
  expect(c.CanRedo()).toBe(false);
  expect(c.EnterString("2")).toBe(true);
  expect(doc.GetValue(new ScAddress())).toBe(2);
  expect(c.Input()).toBe("2");
  expect(c.shell.IsModified()).toBe(true);
  expect(c.EnterString("2")).toBe(true);
  expect(c.shell.GetUndoManager().GetUndoActionCount()).toBe(1);
  c.Select(1, 0);
  expect(c.EnterString("=A1*3")).toBe(true);
  expect(doc.GetValue(c.Position())).toBe(6);
  c.Select(0, 0);
  c.EnterString("5");
  expect(doc.GetValue(new ScAddress(1, 0, 0))).toBe(15);
  expect(c.Undo()).toBe(true);
  expect(doc.GetValue(new ScAddress(1, 0, 0))).toBe(6);
  expect(c.CanRedo()).toBe(true);
  expect(c.Redo()).toBe(true);
  expect(doc.GetValue(new ScAddress(1, 0, 0))).toBe(15);
  c.StartInput(ScInputMode.SC_INPUT_TABLE, "discard");
  expect(c.CanUndo()).toBe(false);
  expect(c.CanRedo()).toBe(false);
  c.Cancel();
  expect(c.Input()).toBe("5");
  for (const value of ["=1/0", "=1+", "=1e999", "= "]) {
    c.Select(2, 0);
    expect(c.EnterString(value)).toBe(true);
    expect(c.Input()).not.toBe("");
    const saved = doc.GetFormulaCell(c.Position())?.GetCode().GetCodeError();
    c.EnterString("replacement");
    c.Undo();
    expect(doc.GetFormulaCell(c.Position())?.GetCode().GetCodeError()).toBe(saved);
    c.Redo();
    expect(c.Input()).toBe("replacement");
  }
  expect(c.EnterString("'123")).toBe(true);
  expect(c.Input()).toBe("'123");
  expect(cellPresentation(doc, c.Position())).toEqual({ text: "123", alignment: "left" });
  c.EnterString("");
  expect(c.Input()).toBe("");
  c.StartInput(ScInputMode.SC_INPUT_TOP);
  c.ChangeInput("words");
  expect(c.Input()).toBe("words");
  expect(c.Commit()).toBe(true);
  c.EnterString("+A1");
  expect(doc.GetValue(c.Position())).toBe(5);
  c.EnterString("-2");
  expect(c.Input()).toBe("-2");
  c.EnterString("plain");
  expect(c.Input()).toBe("plain");
  c.EnterString("'");
  expect(c.Input()).toBe("''");
  c.EnterString("'=");
  expect(c.Input()).toBe("=");
  expect(listener).toHaveBeenCalled();
  detach();
  c.Close();
  c.Close();
  expect(/** Closed shells reject writes. @returns Accepted. */ () => c.EnterString("1")).toThrow(
    /Closed/,
  );
});
it("preserves failed input,cursor marks,sheets and physical/logical viewport independence", /** Exercises source guards and actual shared sheet history. @returns Nothing. */ () => {
  const c = new CalcViewController(),
    doc = c.shell.GetDocument();
  c.Select(-1, -1);
  expect(c.Address()).toBe("A1");
  c.Select(MAXCOL + 2, MAXROW + 2);
  expect(c.Address()).toBe("XFD1048576");
  c.Select(3, 3);
  c.Select(1, 1, true);
  expect(c.viewData.GetMarkData().IsCellMarked(2, 2)).toBe(true);
  for (const kind of ["all", "column", "row"] as const) {
    c.Header(kind, 2);
    expect(c.viewData.GetMarkData().IsMarked()).toBe(true);
  }
  c.ChangeAddress("$AA$12");
  expect(c.GoToAddress()).toBe(true);
  expect(c.Address()).toBe("AA12");
  c.ChangeAddress("bad");
  expect(c.GoToAddress()).toBe(false);
  c.ChangeAddress("");
  expect(c.GoToAddress()).toBe(false);
  c.StartInput(ScInputMode.SC_INPUT_TABLE, "a\nb");
  expect(c.Commit()).toBe(false);
  const pos = c.Address();
  expect(c.Select(0, 0)).toBe(false);
  c.Header("all", 0);
  c.SelectTab(0);
  c.InsertSheet();
  expect(c.Address()).toBe(pos);
  expect(doc.GetTableCount()).toBe(1);
  c.Cancel();
  c.StartInput(ScInputMode.SC_INPUT_TABLE, "=SUM(A1)");
  expect(c.Commit()).toBe(false);
  c.Cancel();
  const refused = vi.spyOn(doc, "InsertTab").mockReturnValueOnce(false);
  c.InsertSheet();
  expect(doc.GetTableCount()).toBe(1);
  expect(c.shell.GetUndoManager().GetUndoActionCount()).toBe(0);
  refused.mockRestore();
  c.InsertSheet();
  expect(doc.GetTableCount()).toBe(2);
  expect(c.viewData.GetTabNumber()).toBe(1);
  expect(c.shell.GetUndoManager().GetUndoAction()?.GetComment()).toBe("Insert Sheet");
  c.EnterString("9");
  expect(c.shell.GetUndoManager().GetUndoAction()?.GetComment()).toBe("Input");
  c.Undo();
  c.Undo();
  expect(doc.GetTableCount()).toBe(1);
  c.Redo();
  expect(doc.GetTableCount()).toBe(2);
  c.Redo();
  c.SelectTab(0, true);
  expect(c.viewData.GetMarkData().GetSelectCount()).toBe(2);
  c.SelectTab(99);
  expect(c.viewData.GetTabNumber()).toBe(0);
  c.Scroll(0, 0, 960, 400);
  expect(c.viewport.firstRow).toBe(0);
  c.Scroll(1000, 999600, 960, 400);
  expect(c.viewport.firstRow + c.viewport.rows).toBeGreaterThan(MAXROW);
  c.Scroll(-100, -100, 0, 0);
  expect(c.viewport.firstColumn).toBe(0);
  c.Scroll(1e10, 1e10, 960, 400);
  expect(c.viewport.firstColumn).toBe(MAXCOL);
  expect(c.viewport.firstRow).toBe(MAXROW);
  c.Close();
});
it("keeps bounded cell input/display semantics and shell save-position ownership", /** Covers real stored formula/string/error alternatives and literal apostrophes. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Existing"));
  const shell = new ScDocShell(doc),
    pos = new ScAddress();
  expect(shell.GetDocument()).toBe(doc);
  expect(shell.Undo()).toBe(false);
  expect(shell.Redo()).toBe(false);
  shell.SetDocumentModified();
  expect(shell.IsModified()).toBe(true);
  for (const [input, kind] of [
    ["", "empty"],
    ["1,234.5", "number"],
    ["-A1", "formula"],
    ["=1", "formula"],
    ["=", "text"],
    ["a", "text"],
  ] as const)
    expect(parseCellInput(input).kind).toBe(kind);
  for (const [input, display] of [
    ["'12", "12"],
    ["'text", "text"],
    ["=1/0", "#DIV/0!"],
    ["=1+", "Err:520"],
  ] as const) {
    applyCell(doc, pos, parseCellInput(input));
    expect(cellPresentation(doc, pos).text).toBe(display);
  }
  applyCell(doc, pos, { kind: "text", value: "text" });
  doc.SetFormula(new ScAddress(1, 0, 0), unicode("=A1"), FormulaGrammar.Grammar.GRAM_NATIVE);
  expect(cellPresentation(doc, new ScAddress(1, 0, 0))).toEqual({
    text: "text",
    alignment: "left",
  });
  applyCell(doc, pos, { kind: "number", value: 12 });
  expect(cellInputText(doc, pos)).toBe("12");
  expect(cellPresentation(doc, pos).text).toBe("12");
  applyCell(doc, pos, { kind: "empty" });
  expect(cellPresentation(doc, pos).text).toBe("");
  expect(captureCell(doc, pos).kind).toBe("empty");
  shell.Close();
  const clean = new CalcViewController();
  clean.EnterString("1");
  clean.Undo();
  expect(clean.shell.IsModified()).toBe(false);
  clean.Close();
});
