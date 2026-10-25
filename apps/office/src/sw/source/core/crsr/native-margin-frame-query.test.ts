/** @fileoverview Verifies native margin selection through original content-node clients without requiring the browser measurement registry. */
import { afterEach, expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwCursor } from "./swcrsr";
import { SwPosition } from "./pam";
import { SwRootFrame } from "../layout/newfrm";
import { SwTextFrame } from "../text/txtfrm";
import { SwTextCursor } from "../text/itrtxt";
import { createDefaultWriterPageDescriptor } from "../../../../test/writer-page-descriptor";
import { SwLineNumberInfo } from "../../../inc/lineinfo";
const docs: SwDoc[] = [],
  roots: SwRootFrame[] = [],
  cursors: SwCursor[] = [],
  frames: SwTextFrame[] = [];
/** Creates original native owners with no browser measurement publication. @returns Actual native fixture. */
function fixture() {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  docs.push(doc);
  if (node === undefined) throw Error("Missing source");
  node.SetText("abc   def   ");
  const root = new SwRootFrame(
      /** Borrows the original document. @returns Native owner. */ () => doc,
    ),
    point = new SwPosition(node, 1);
  roots.push(root);
  const cursor = new SwCursor(point);
  point.Dispose();
  cursors.push(cursor);
  return { doc, node, root, cursor };
}
/** Registers a native frame with literal independent line geometry. @param f - Original fixture. @returns Original client. */
function register(f: ReturnType<typeof fixture>) {
  const frame = new SwTextFrame(
    f.node,
    "native",
    0,
    12,
    0,
    [
      { start: 0, end: 6, height: 240 },
      { start: 6, end: 12, height: 240 },
    ],
    f.root,
  );
  frames.push(frame);
  return frame;
}
afterEach(
  /** Releases original cursors, clients, roots and documents. @returns Nothing. */ () => {
    for (const cursor of cursors.splice(0)) cursor.Dispose();
    for (const frame of frames.splice(0)) if (!frame.IsInDtor()) frame.DestroyImpl();
    for (const root of roots.splice(0)) root.DestroyImpl();
    for (const doc of docs.splice(0)) doc.Dispose();
    SwTextCursor.SetRightMargin(false);
  },
);
it("unpublished original native frames admit real margin movement and retain point and mark", /** Checks direct client queries independent of the UI registry. @returns Nothing. */ () => {
  const f = fixture(),
    frame = register(f),
    point = f.cursor.GetPoint();
  f.cursor.SetMark();
  f.cursor.GetMark().Assign(f.node, 10);
  expect(f.root.GetCursorTextFrame(f.node)).toBeUndefined();
  expect(f.node.getLayoutFrame(f.root, point)).toBe(frame);
  expect(f.cursor.LeftRightMargin(f.root, false)).toBe(true);
  expect(point.GetContentIndex()).toBe(3);
  expect(f.cursor.GetPoint()).toBe(point);
  expect(f.cursor.GetMark().GetContentIndex()).toBe(10);
  expect(f.cursor.LeftRightMargin(f.root, true)).toBe(true);
  expect(point.GetContentIndex()).toBe(0);
  expect(f.root.GetCursorTextFrame(f.node)).toBeUndefined();
  expect(frame.IsInDtor()).toBe(false);
});
it("native client query determines the frame even when a different frame was published", /** Proves the device ownership registry cannot select the movement frame. @returns Nothing. */ () => {
  const f = fixture(),
    original = register(f);
  f.root.SetCursorTextFrames(f.node, [
    { start: 0, end: 12, lines: [{ start: 0, end: 12, height: 240 }] },
  ]);
  expect(f.root.GetCursorTextFrame(f.node)).not.toBe(original);
  f.cursor.GetPoint().Assign(f.node, 7);
  expect(f.cursor.LeftRightMargin(f.root, true)).toBe(true);
  expect(f.cursor.GetPoint().GetContentIndex()).toBe(6);
  expect(f.node.getLayoutFrame(f.root, f.cursor.GetPoint())).toBe(original);
});
it("actual formatted follows resolve original positions without any measured lease", /** Checks native root/page formatting and source frame-boundary affinity. @returns Nothing. */ () => {
  const f = fixture(),
    page = {
      ...createDefaultWriterPageDescriptor("en-GB").GetValue(),
      height: 700,
      topMargin: 0,
      bottomMargin: 0,
    };
  const snapshot = f.root.Format(
    [
      {
        id: "body",
        lines: [
          { start: 0, end: 6, height: 500 },
          { start: 6, end: 12, height: 500 },
        ],
      },
    ],
    page,
    undefined,
    new SwLineNumberInfo().QueryValue(),
  );
  const master = snapshot.pages[0]?.textFrames[0],
    follow = snapshot.pages[1]?.textFrames[0];
  f.cursor.GetPoint().Assign(f.node, 7);
  expect(f.node.getLayoutFrame(f.root, f.cursor.GetPoint())).toBe(follow);
  expect(f.cursor.LeftRightMargin(f.root, true)).toBe(true);
  expect(f.cursor.GetPoint().GetContentIndex()).toBe(6);
  f.cursor.GetPoint().Assign(f.node, 1);
  expect(f.cursor.LeftRightMargin(f.root, false, true)).toBe(true);
  expect(f.cursor.GetPoint().GetContentIndex()).toBe(6);
  expect(master?.GetFollow()).toBe(follow);
  expect(follow?.FindMaster()).toBe(master);
  expect(f.root.GetCursorTextFrame(f.node)).toBeUndefined();
});
it("margin probes use original mapped positions and dispose temporary PaMs without moving the cursor", /** Checks literal API/interactive/end/zero/left native comparisons. @returns Nothing. */ () => {
  const f = fixture();
  register(f);
  for (const [offset, left, api, expected] of [
    [0, true, false, true],
    [1, true, false, false],
    [3, false, false, true],
    [4, false, false, false],
    [6, false, true, true],
    [0, false, true, false],
    [6, true, false, true],
    [7, true, false, false],
  ] as const) {
    f.cursor.GetPoint().Assign(f.node, offset);
    SwTextCursor.SetRightMargin(false);
    const point = f.cursor.GetPoint();
    expect(f.cursor.IsAtLeftRightMargin(f.root, left, api)).toBe(expected);
    expect(f.cursor.GetPoint()).toBe(point);
    expect(point.GetContentIndex()).toBe(offset);
  }
});
it("unregistered or foreign-root content cannot be selected by native margin queries", /** Checks actual registration and original document/root admission. @returns Nothing. */ () => {
  const f = fixture();
  expect(f.cursor.LeftRightMargin(f.root, true)).toBe(false);
  expect(f.cursor.IsAtLeftRightMargin(f.root, false)).toBe(false);
  register(f);
  const second = new SwRootFrame(
    /** Borrows the same model with an independent root. @returns Native document. */ () => f.doc,
  );
  roots.push(second);
  expect(f.cursor.LeftRightMargin(second, true)).toBe(false);
  expect(f.cursor.IsAtLeftRightMargin(second, true)).toBe(false);
  const foreign = fixture();
  expect(f.cursor.LeftRightMargin(foreign.root, true)).toBe(false);
  expect(f.cursor.IsAtLeftRightMargin(foreign.root, false)).toBe(false);
});
it("temporary device freshness rejects obsolete text but never supplies a frame", /** Preserves the existing stale-device protection until native Calc invalidation is ported. @returns Nothing. */ () => {
  const f = fixture();
  f.root.SetCursorTextFrames(f.node, [
    { start: 0, end: 12, lines: [{ start: 0, end: 12, height: 240 }] },
  ]);
  const original = f.node.getLayoutFrame(f.root, f.cursor.GetPoint());
  f.node.SetText("different text");
  expect(f.node.getLayoutFrame(f.root, f.cursor.GetPoint())).toBe(original);
  expect(f.cursor.LeftRightMargin(f.root, true)).toBe(false);
  expect(f.cursor.IsAtLeftRightMargin(f.root, false)).toBe(false);
  f.root.SetCursorTextFrames(f.node, [{ start: 0, end: 14, lines: [] }]);
  expect(f.root.IsCursorTextGeometryCurrent(f.node)).toBe(true);
  expect(f.cursor.LeftRightMargin(f.root, true)).toBe(false);
  expect(f.cursor.IsAtLeftRightMargin(f.root, true)).toBe(false);
});

it("unpublished formatter caches reject text changed after the current layout snapshot", /** Checks the interval before device reformatting without creating a browser cursor lease. @returns Nothing. */ () => {
  const f = fixture(),
    page = createDefaultWriterPageDescriptor("en-GB").GetValue();
  f.root.Format(
    [{ id: "body", lines: [{ start: 0, end: 12, height: 240 }] }],
    page,
    undefined,
    new SwLineNumberInfo().QueryValue(),
  );
  const original = f.node.getLayoutFrame(f.root, f.cursor.GetPoint());
  expect(original).toBeDefined();
  expect(f.root.GetCursorTextFrame(f.node)).toBeUndefined();
  f.node.SetText("different text");
  expect(f.node.getLayoutFrame(f.root, f.cursor.GetPoint())).toBe(original);
  expect(f.cursor.LeftRightMargin(f.root, true)).toBe(false);
  expect(f.cursor.IsAtLeftRightMargin(f.root, false)).toBe(false);
  f.root.Format(
    [{ id: "body", lines: [{ start: 0, end: 14, height: 240 }] }],
    page,
    undefined,
    new SwLineNumberInfo().QueryValue(),
  );
  expect(f.cursor.LeftRightMargin(f.root, false, true)).toBe(true);
  expect(f.cursor.GetPoint().GetContentIndex()).toBe(14);
});
