/** @fileoverview Literal native SwTableFUNC separator and signed-difference boundary contracts. */
import { afterEach, expect, it, vi } from "vitest";
import { SwInsertTableFlags } from "../../../inc/itabenum";
import { SwTableFUNC } from "./tablemgr";
import { SwTabCols } from "../../core/bastyp/tabcol";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";

const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Restores geometry probes before disposing native owners. @returns Nothing. */
  () => {
    vi.restoreAllMocks();
    for (const session of sessions.splice(0)) session.Close();
  },
);
/** Supplies literal geometry at the real shell boundary. @param positions - Separator positions. @param hidden - Hidden flags. @param position - Raw current column. @returns Actual manager and captured native output. */
function fixture(
  positions: readonly number[] = [1100, 3100],
  hidden: readonly boolean[] = [],
  position = 0,
) {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const shell = session.view.GetWrtShell(),
    geometry = new SwTabCols();
  geometry.SetLeft(100);
  geometry.SetRight(6100);
  geometry.SetRightMax(7000);
  positions.forEach(
    /** Adds independent native input separators. @param value - Position. @param index - Entry. @returns Nothing. */
    (value, index) => geometry.Insert(value, hidden[index] ?? false, index),
  );
  // IsCursorInTable alone gates InitTabCols; retain the real native table context.
  const table = shell.InsertTable({ mnInsMode: SwInsertTableFlags.All, mnRowsToRepeat: 1 }, 1, 3);
  if (!table) throw new Error("Missing manager table context");
  vi.spyOn(shell, "GetTabCols").mockImplementation(
    /** Publishes the literal independent geometry. @param output - Carrier. @returns Whether available. */
    (output) => {
      output.Assign(geometry);
      return true;
    },
  );
  vi.spyOn(shell, "GetCurTabColNum").mockReturnValue(position);
  const setter = vi.spyOn(shell, "SetTabCols").mockImplementation(
    /** Captures native output independently of the tested arithmetic. @param value - Accepted geometry. @returns Whether applied. */
    (value) => {
      geometry.Assign(value);
      return true;
    },
  );
  const manager = new SwTableFUNC(shell);
  manager.InitTabCols();
  return { shell, manager, geometry, setter };
}
it("retains hidden intervals and maps raw current columns before changing the visible separator" /** Checks exact hidden mapping/current-row admission. @returns Nothing. */, () => {
  const f = fixture([1100, 3100], [true, false], 2);
  expect(f.manager.GetColCount()).toBe(1);
  expect(f.manager.GetCurColNum()).toBe(1);
  expect([f.manager.GetColWidth(0), f.manager.GetColWidth(1)]).toEqual([3000, 3000]);
  expect(f.manager.SetColWidth(0, 3200)).toBe(true);
  expect(f.setter).toHaveBeenCalledWith(expect.any(SwTabCols), true);
  expect([f.geometry.GetEntry(0).nPos, f.geometry.GetEntry(1).nPos]).toEqual([1100, 3300]);
});
it.each([
  [2100, 1100, 3200],
  [5000, 1077, 6077],
  [1999, 1100, 3099],
])(
  "moves middle separators with native right-neighbor borrowing width=%i",
  /** Checks literal neighbor arithmetic. @param width - Width. @param first - Expected first. @param second - Expected second. @returns Nothing. */
  (width, first, second) => {
    const f = fixture();
    f.manager.SetColWidth(1, width);
    expect([f.geometry.GetEntry(0).nPos, f.geometry.GetEntry(1).nPos]).toEqual([first, second]);
    expect(f.setter).toHaveBeenCalledWith(expect.any(SwTabCols), false);
  },
);
it("preserves single-column GetRight convention and right-maximum cap" /** Checks source nonzero-left asymmetry without correcting it. @returns Nothing. */, () => {
  const f = fixture([]);
  expect(f.manager.GetColWidth(0)).toBe(6100);
  expect(f.manager.SetColWidth(0, 9000)).toBe(true);
  expect(f.geometry.GetRight()).toBe(7000);
  f.manager.SetColWidth(0, 6000);
  expect(f.geometry.GetRight()).toBe(6000);
});
it("retains signed-int wrapping and leaves absent table initialization empty" /** Checks native difference conversion and no-table default. @returns Nothing. */, () => {
  const f = fixture();
  f.manager.SetColWidth(0, 1000 + 4294967296 + 100);
  expect(f.geometry.GetEntry(0).nPos).toBe(1200);
  const session = createWriterDocumentSession();
  sessions.push(session);
  const manager = new SwTableFUNC(session.view.GetWrtShell());
  manager.InitTabCols();
  expect(manager.GetColCount()).toBe(0);
  expect(manager.GetColWidth(0)).toBe(0);
  expect(manager.GetCurColNum()).toBe(0);
  expect(manager.SetColWidth(0, 500)).toBe(false);
});

it("captures format admission at construction rather than retargeting when a table is inserted" /** Checks native constructor lifetime independently of later cursor movement. @returns Nothing. */, () => {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const shell = session.view.GetWrtShell(),
    before = new SwTableFUNC(shell);
  expect(
    shell.InsertTable({ mnInsMode: SwInsertTableFlags.All, mnRowsToRepeat: 1 }, 1, 2),
  ).toBeDefined();
  before.InitTabCols();
  expect(before.GetColCount()).toBe(0);
  const after = new SwTableFUNC(shell);
  after.InitTabCols();
  expect(after.GetColCount()).toBe(1);
});
