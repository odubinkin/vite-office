/** @fileoverview Checks native border outer flags follow physical frame links, independent of model row order. */
import { afterEach, expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwTabFrame, SwRowFrame, SwCellFrame } from "./tabfrm";
import { SwTabFramePainter } from "./paintfrm";

const releases: (() => void)[] = [];
afterEach(
  /** Releases original caller frames before their document. @returns Nothing. */ () => {
    for (const release of releases.splice(0)) release();
  },
);
/** Creates three original rows and their actual linked layout. @returns Original owners. */
function fixture() {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Physical border edges");
  for (let index = 0; index < 3; index++) doc.nodes.AppendTableRow(table, 2);
  const frame = new SwTabFrame(table),
    rows: SwRowFrame[] = [];
  for (let row = frame.Lower(); row; row = row.GetNext()) rows.push(row as SwRowFrame);
  releases.push(
    /** Ends caller ownership after all border assertions. @returns Nothing. */ () => {
      frame.DestroyImpl();
      doc.Dispose();
    },
  );
  return { table, frame, rows };
}
/** Captures independent original line flags. @param frame - Actual table frame. @returns Family, key, interval and outer flag tuples. */
function lines(frame: SwTabFrame) {
  const result: (number | boolean)[][] = [];
  new SwTabFramePainter(frame).PaintLines(
    /** Borrows one independent native line. @param line - Interval. @param horizontal - Line family. @returns Nothing. */
    (line, horizontal) =>
      result.push([horizontal, line.mnKey, line.mnStartPos, line.mnEndPos, line.mbOuter]),
  );
  return result;
}
it("native painter marks the first and last physical rows of a middle-row fragment as outer", /** Checks source Lower identity and absent Next rather than model indexes. @returns Nothing. */ () => {
  const f = fixture();
  for (const index of [0, 2]) {
    const row = f.rows[index] as SwRowFrame;
    row.RemoveFromLayout();
    row.DestroyImpl();
  }
  expect(f.table.GetTabLines()).toHaveLength(3);
  expect(f.frame.Lower()).toBe(f.rows[1]);
  expect(lines(f.frame)).toEqual([
    [false, 0, 1, 2, true],
    [false, 1, 1, 2, false],
    [false, 2, 1, 2, true],
    [true, 1, 0, 1, true],
    [true, 1, 1, 2, true],
    [true, 2, 0, 1, true],
    [true, 2, 1, 2, true],
  ]);
});
it("native painter reads outer flags from reordered actual row links", /** Checks actual physical row ownership while preserving model-index grid coordinates. @returns Nothing. */ () => {
  const f = fixture(),
    last = f.rows[2] as SwRowFrame;
  last.RemoveFromLayout();
  last.InsertBehind(f.frame, undefined);
  const horizontal = lines(f.frame).filter(
    /** Selects actual horizontal edges. @param line - Tuple. @returns Family predicate. */
    (line) => line[0] === true,
  );
  expect(horizontal).toEqual([
    [true, 2, 0, 1, true],
    [true, 2, 1, 2, true],
    [true, 3, 0, 1, false],
    [true, 3, 1, 2, false],
    [true, 0, 0, 1, false],
    [true, 0, 1, 2, false],
    [true, 1, 0, 1, false],
    [true, 1, 1, 2, false],
  ]);
  expect(f.frame.Lower()).toBe(last);
  expect(last.GetNext()).toBe(f.rows[0]);
});
it("native painter preserves outer flags for a complete actual hierarchy", /** Checks first/last and interior native edges without reconstructing owners. @returns Nothing. */ () => {
  const f = fixture(),
    painted = lines(f.frame);
  expect(
    painted.filter(
      /** Selects all physical outer edges. @param line - Tuple. @returns Outer predicate. */
      (line) => line[4] === true,
    ),
  ).toHaveLength(10);
  expect(painted).toContainEqual([true, 1, 0, 1, false]);
  expect(painted).toContainEqual([true, 2, 1, 2, false]);
});
it("native painter treats the remaining actual cell as both row outer sides", /** Checks original Lower/Next edges after an omitted first model cell. @returns Nothing. */ () => {
  const f = fixture(),
    row = f.rows[0] as SwRowFrame,
    first = row.Lower() as SwCellFrame;
  first.RemoveFromLayout();
  first.DestroyImpl();
  expect(row.GetTabLine().GetTabBoxes()).toHaveLength(2);
  expect(lines(f.frame)).toContainEqual([false, 0, 0, 1, true]);
  expect(lines(f.frame)).toContainEqual([false, 1, 0, 1, true]);
});
it("native painter emits no edges for an empty physical table chain", /** Checks no model rows are reconstructed during paint. @returns Nothing. */ () => {
  const f = fixture();
  for (const row of f.rows) {
    row.RemoveFromLayout();
    row.DestroyImpl();
  }
  expect(f.table.GetTabLines()).toHaveLength(3);
  expect(lines(f.frame)).toEqual([]);
});
