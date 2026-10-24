/** @fileoverview Pins consumed native TabControl key ownership and direction decisions. */
import { expect, it } from "vitest";
import { tabControlDirection } from "./tabctrl";
it("matches source shortcut branches and leaves page/control keys unconsumed", /** Native Shift+PageDown is deliberately unhandled. @returns Nothing. */ () => {
  for (const [key, mod, shift, focus, result] of [
    ["Tab", true, false, false, 1],
    ["Tab", true, true, false, -1],
    ["PageUp", true, false, false, -1],
    ["PageUp", true, true, false, -1],
    ["PageDown", true, false, false, 1],
    ["PageDown", true, true, false, undefined],
    ["Enter", true, false, false, undefined],
    ["Enter", true, true, false, undefined],
    ["Enter", false, false, true, undefined],
    ["Tab", false, false, true, undefined],
    ["ArrowLeft", false, false, true, -1],
    ["ArrowRight", false, false, true, 1],
    ["ArrowLeft", false, false, false, undefined],
    ["ArrowRight", false, false, false, undefined],
    ["PageDown", false, false, false, undefined],
  ] as const)
    expect(tabControlDirection(key, mod, shift, focus)).toBe(result);
});
