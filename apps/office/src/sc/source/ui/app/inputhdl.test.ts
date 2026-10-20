/** @fileoverview Native input-mode values,predicates and F2 transitions from pinned inputhdl. */
import { expect, it } from "vitest";
import { ScInputMode } from "../../../inc/global";
import { ScInputHandler } from "../inc/inputhdl";
it("preserves native NONE TYPE TABLE TOP values and predicates", /** Covers the complete bounded mode domain. @returns Nothing. */ () => {
  const input = new ScInputHandler();
  expect(input.GetMode()).toBe(ScInputMode.SC_INPUT_NONE);
  for (const [mode, active, edit, top] of [
    [ScInputMode.SC_INPUT_NONE, false, false, false],
    [ScInputMode.SC_INPUT_TYPE, true, false, false],
    [ScInputMode.SC_INPUT_TABLE, true, true, false],
    [ScInputMode.SC_INPUT_TOP, true, true, true],
  ] as const) {
    input.SetMode(mode);
    expect([input.IsInputMode(), input.IsEditMode(), input.IsTopMode()]).toEqual([
      active,
      edit,
      top,
    ]);
    input.StartOrToggleEditMode();
    expect(input.GetMode()).toBe(
      mode === ScInputMode.SC_INPUT_TABLE ? ScInputMode.SC_INPUT_TYPE : ScInputMode.SC_INPUT_TABLE,
    );
  }
  expect([
    ScInputMode.SC_INPUT_NONE,
    ScInputMode.SC_INPUT_TYPE,
    ScInputMode.SC_INPUT_TABLE,
    ScInputMode.SC_INPUT_TOP,
  ]).toEqual([0, 1, 2, 3]);
});

it("keeps native modification independent of caret mode and resets only at input lifecycle boundaries", /** SetModified is sticky across all native modes until accepted or cancelled input. @returns Nothing. */ () => {
  const input = new ScInputHandler();
  expect(input.IsModified()).toBe(false);
  input.SetModified();
  for (const mode of [
    ScInputMode.SC_INPUT_TABLE,
    ScInputMode.SC_INPUT_TYPE,
    ScInputMode.SC_INPUT_TOP,
    ScInputMode.SC_INPUT_NONE,
  ]) {
    input.SetMode(mode);
    input.StartOrToggleEditMode();
    expect(input.IsModified()).toBe(true);
  }
  input.ResetModified();
  expect(input.IsModified()).toBe(false);
});

it("retains native StartsLikeFormula context for existing content versus new typing", /** Formula-mode admission uses original first-character rules and lifecycle resets. @returns Nothing. */ () => {
  const input = new ScInputHandler();
  expect(input.IsFormulaMode()).toBe(false);
  for (const [value, expected] of [
    ["", false],
    ["1", false],
    ["=", true],
    ["+1", true],
    ["-1", true],
    [" word", false],
  ] as const) {
    input.UpdateInputState(value, false);
    expect(input.IsFormulaMode()).toBe(expected);
  }
  input.UpdateInputState("-2", true);
  expect(input.IsFormulaMode()).toBe(false);
  input.UpdateInputState("+A1");
  expect(input.IsFormulaMode()).toBe(false);
  input.UpdateInputState("=A1");
  expect(input.IsFormulaMode()).toBe(true);
  input.StartOrToggleEditMode();
  expect(input.IsFormulaMode()).toBe(true);
  input.SetModified();
  input.ResetInputState();
  expect(input.IsFormulaMode()).toBe(false);
  expect(input.IsModified()).toBe(false);
  input.UpdateInputState("-2");
  expect(input.IsFormulaMode()).toBe(true);
});
