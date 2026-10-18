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
