/** @fileoverview Native preset table contracts for Writer and Calc including validity, diagonals and last-used ownership. */
import { expect, it, vi } from "vitest";
import { DispatchBorderItem, SvxFrameToolBoxControl } from "./tbcontrl";
import {
  SvxBoxItem,
  SvxBoxInfoItem,
  SvxBoxInfoItemValidFlags as V,
} from "../../../editeng/source/items/frmitems";
import { SvxLineItem } from "../../../editeng/inc/lineitem";
it("dispatches every source frame preset with independent outer/inner validity", /** dispatches every source frame preset with independent outer/inner validity. @returns Observed test result. */ () => {
  const flags = [63, 1, 2, 3, 4, 8, 12, 15, 28, 31, 47, 63];
  for (let id = 1; id <= 15; id++) {
    const dispatch = vi.fn();
    DispatchBorderItem(dispatch, id, false, 0);
    if (id >= 13) {
      expect(
        dispatch.mock.calls.map(
          /** Checks the native boundary contract against actual owners. @param c - Actual test input. @returns Observed test result. */ (
            c,
          ) => c[0],
        ),
      ).toEqual(
        id === 13
          ? [".uno:BorderTLBR"]
          : id === 14
            ? [".uno:BorderBLTR"]
            : [".uno:BorderTLBR", ".uno:BorderBLTR"],
      );
      for (const c of dispatch.mock.calls)
        expect((c[1][0] as SvxLineItem).GetLine()?.GetWidth()).toBe(1);
    } else {
      const [outer, inner] = dispatch.mock.lastCall?.[1] as [SvxBoxItem, SvxBoxInfoItem];
      expect(outer.Which()).toBe(10024);
      for (const [flag, bit] of [
        [V.LEFT, 1],
        [V.RIGHT, 2],
        [V.TOP, 4],
        [V.BOTTOM, 8],
        [V.HORI, 16],
        [V.VERT, 32],
      ])
        expect(inner.IsValid(required(flag))).toBe(((flags[id - 1] ?? 0) & required(bit)) !== 0);
    }
  }
  const d = vi.fn();
  DispatchBorderItem(d, 99, true, 0);
  expect((d.mock.lastCall?.[1][1] as SvxBoxInfoItem).IsValid(V.TOP)).toBe(false);
  const controller = new SvxFrameToolBoxControl(d),
    open = vi.fn();
  controller.execute(open);
  expect(open).toHaveBeenCalledOnce();
  controller.SetLastUsedBorderItem(9, false);
  controller.execute(open);
  expect((d.mock.lastCall?.[1][1] as SvxBoxInfoItem).GetHori()?.GetWidth()).toBe(15);
});

/** Requires an actual test fixture owner and fails at its missing boundary. @param value - Actual fixture value. @returns Present fixture. */
function required<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error("Missing actual fixture owner");
  return value;
}
