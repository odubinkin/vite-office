/** @fileoverview Real document input/history semantics after native modified-flag gating. */
import { expect, it } from "vitest";
import { CalcViewController } from "./calc-view-controller";
import { ScInputMode } from "../../inc/global";
import { ScAddress } from "../../inc/address";
it("does not rewrite cells or create history when existing text or formula is only inspected", /** F2,TOP focus and caret mode toggles preserve real generation and action owners. @returns Nothing. */ () => {
  const c = new CalcViewController();
  for (const value of ["42", "word", "=1+2", "= ", "=1/0"]) {
    c.EnterString(value);
    const generation = c.shell.GetContentGeneration(),
      actions = c.shell.GetUndoManager().GetUndoActionCount(),
      formula = c.shell.GetDocument().GetFormulaCell(c.Position()),
      text = c.Input();
    c.SetInputMode();
    c.SetInputMode();
    c.StartInput(ScInputMode.SC_INPUT_TOP);
    expect(c.Commit()).toBe(true);
    expect(c.shell.GetContentGeneration()).toBe(generation);
    expect(c.shell.GetUndoManager().GetUndoActionCount()).toBe(actions);
    expect(c.shell.GetDocument().GetFormulaCell(c.Position())).toBe(formula);
    expect(c.Input()).toBe(text);
    expect(c.inputHandler.IsModified()).toBe(false);
  }
  c.Close();
});
it("records an actual repeated or reverted edit even when its final value is unchanged", /** Native input modification does not perform semantic-value or JSON comparison. @returns Nothing. */ () => {
  const c = new CalcViewController();
  c.EnterString("42");
  const generation = c.shell.GetContentGeneration();
  c.EnterString("42");
  expect(c.shell.GetUndoManager().GetUndoActionCount()).toBe(2);
  expect(c.shell.GetContentGeneration()).toBeGreaterThan(generation);
  c.StartInput(ScInputMode.SC_INPUT_TABLE);
  c.ChangeInput("43");
  c.ChangeInput("42");
  c.SetInputMode();
  expect(c.inputHandler.IsModified()).toBe(true);
  c.Commit();
  expect(c.shell.GetUndoManager().GetUndoActionCount()).toBe(3);
  c.Undo();
  expect(c.shell.GetDocument().GetValue(new ScAddress())).toBe(42);
  c.Redo();
  expect(c.shell.GetDocument().GetValue(new ScAddress())).toBe(42);
  c.Close();
});
it("keeps rejected input modified and clears modification on cancellation and fresh input", /** Failed parsing cannot consume the source modification flag. @returns Nothing. */ () => {
  const c = new CalcViewController();
  c.StartInput(ScInputMode.SC_INPUT_TYPE, "=UNPORTED(A1)");
  expect(c.Commit()).toBe(false);
  expect(c.inputHandler.IsModified()).toBe(true);
  c.SetInputMode();
  expect(c.inputHandler.IsModified()).toBe(true);
  c.Cancel();
  expect(c.inputHandler.IsModified()).toBe(false);
  c.SetInputMode();
  expect(c.Commit()).toBe(true);
  expect(c.shell.GetUndoManager().GetUndoActionCount()).toBe(0);
  c.StartInput(ScInputMode.SC_INPUT_TYPE, "");
  c.Commit();
  expect(c.shell.GetUndoManager().GetUndoActionCount()).toBe(1);
  expect(c.inputHandler.IsModified()).toBe(false);
  c.Close();
});
