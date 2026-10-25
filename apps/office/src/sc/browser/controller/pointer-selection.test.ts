/** @fileoverview Actual native mark/function-set integration for mouse cell and axis selection. */
import { expect, it } from "vitest";
import { CalcViewController } from "./calc-view-controller";
import { ScAddress } from "../../inc/address";
/** Executes a completed physical pointer gesture over actual native selection state. @param c - Actual controller. @param start - Start cell. @param end - End cell. @param shift - Extend modifier. @param ctrl - Add/subtract modifier. @param kind - Pointer surface. @returns Nothing. */
function gesture(
  c: CalcViewController,
  start: ScAddress,
  end = start,
  shift = false,
  ctrl = false,
  kind: "cell" | "column" | "row" = "cell",
): void {
  expect(c.StartPointer(start, shift, ctrl, kind)).toBe(true);
  c.MovePointer(end);
  c.EndPointer();
}
it("retains the cell anchor through backward/forward dragging and Shift extension", /** Native block endpoints are independent of the active cell. @returns Nothing. */ () => {
  const c = new CalcViewController(),
    mark = c.viewData.GetMarkData();
  gesture(c, new ScAddress(3, 4, 0), new ScAddress(1, 1, 0));
  expect(c.Position().GetVars()).toEqual([3, 4, 0]);
  expect(mark.GetMarkArea().aStart.GetVars()).toEqual([1, 1, 0]);
  expect(mark.GetMarkArea().aEnd.GetVars()).toEqual([3, 4, 0]);
  gesture(c, new ScAddress(5, 6, 0), undefined, true);
  expect(mark.GetMarkArea().aStart.GetVars()).toEqual([3, 4, 0]);
  expect(mark.GetMarkArea().aEnd.GetVars()).toEqual([5, 6, 0]);
  gesture(c, new ScAddress(0, 0, 0));
  expect(c.Position().GetVars()).toEqual([0, 0, 0]);
  expect(mark.IsMarked()).toBe(false);
  expect(mark.IsMultiMarked()).toBe(false);
  c.Close();
});
it("adds disjoint Ctrl blocks and subtracts previously selected cells", /** Negative blocks commit to the real ScMultiSel owner at pointer release. @returns Nothing. */ () => {
  const c = new CalcViewController(),
    mark = c.viewData.GetMarkData();
  gesture(c, new ScAddress(), new ScAddress(2, 2, 0));
  gesture(c, new ScAddress(4, 4, 0), new ScAddress(5, 5, 0), false, true);
  expect(mark.IsCellMarked(0, 0)).toBe(true);
  expect(mark.IsCellMarked(5, 5)).toBe(true);
  expect(mark.IsCellMarked(3, 3)).toBe(false);
  gesture(c, new ScAddress(1, 1, 0), undefined, false, true);
  expect(mark.IsCellMarked(1, 1)).toBe(false);
  expect(mark.IsCellMarked(0, 0)).toBe(true);
  expect(mark.IsCellMarked(5, 5)).toBe(true);
  c.Close();
});
it("selects full column/row bands and preserves additive and negative axis gestures", /** Native header function set owns the full-axis anchor and cursor endpoint. @returns Nothing. */ () => {
  const c = new CalcViewController(),
    mark = c.viewData.GetMarkData();
  gesture(c, new ScAddress(1, 0, 0), new ScAddress(3, 0, 0), false, false, "column");
  expect(mark.IsColumnMarked(1)).toBe(true);
  expect(mark.IsColumnMarked(3)).toBe(true);
  expect(mark.IsColumnMarked(0)).toBe(false);
  expect(c.Position().Col()).toBe(3);
  gesture(c, new ScAddress(5, 0, 0), undefined, true, false, "column");
  expect(mark.IsColumnMarked(1)).toBe(true);
  expect(mark.IsColumnMarked(5)).toBe(true);
  gesture(c, new ScAddress(2, 0, 0), undefined, false, true, "column");
  expect(mark.IsColumnMarked(2)).toBe(false);
  expect(mark.IsColumnMarked(1)).toBe(true);
  expect(mark.IsColumnMarked(5)).toBe(true);
  gesture(c, new ScAddress(0, 3, 0), new ScAddress(0, 1, 0), false, false, "row");
  expect(mark.IsRowMarked(1)).toBe(true);
  expect(mark.IsRowMarked(3)).toBe(true);
  expect(mark.IsColumnMarked(1)).toBe(false);
  c.Close();
});
it("extends additive blocks with Ctrl+Shift without destroying their anchors", /** Native multiple selection retains the previous island while extending the current one. @returns Nothing. */ () => {
  const c = new CalcViewController(),
    mark = c.viewData.GetMarkData();
  gesture(c, new ScAddress(), new ScAddress(1, 1, 0));
  gesture(c, new ScAddress(3, 3, 0), new ScAddress(4, 4, 0), false, true);
  gesture(c, new ScAddress(6, 6, 0), undefined, true, true);
  expect(mark.IsCellMarked(0, 0)).toBe(true);
  expect(mark.IsCellMarked(3, 3)).toBe(true);
  expect(mark.IsCellMarked(6, 6)).toBe(true);
  expect(mark.IsCellMarked(2, 2)).toBe(false);
  gesture(c, new ScAddress(1, 0, 0), undefined, false, false, "column");
  gesture(c, new ScAddress(4, 0, 0), undefined, false, true, "column");
  gesture(c, new ScAddress(6, 0, 0), undefined, true, true, "column");
  expect(mark.IsColumnMarked(1)).toBe(true);
  expect(mark.IsColumnMarked(4)).toBe(true);
  expect(mark.IsColumnMarked(6)).toBe(true);
  expect(mark.IsColumnMarked(2)).toBe(false);
  c.Close();
});
