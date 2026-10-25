/** @fileoverview Checks original native text-frame master/follow ownership, destruction and position affinity. */
import { SwClient, SwIterator } from "../../../inc/calbck";

import { afterEach, expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwFrame } from "./wsfrm";
import { SwFlowFrame } from "./flowfrm";
import { SwTextFrame } from "../text/txtfrm";
import { SwTextCursor } from "../text/itrtxt";
import { SwPosition } from "../crsr/pam";
import { SwRootFrame } from "./newfrm";
import { createDefaultWriterPageDescriptor } from "../../../../test/writer-page-descriptor";
import { SwLineNumberInfo } from "../../../inc/lineinfo";
const docs: SwDoc[] = [],
  roots: SwRootFrame[] = [];
const page = {
  ...createDefaultWriterPageDescriptor("en-GB").GetValue(),
  height: 1000,
  topMargin: 100,
  bottomMargin: 100,
};
/** Creates three real source frames over one initialized original text node. @returns Native owners. */
function fixture() {
  const doc = new SwDoc();
  docs.push(doc);
  const node = doc.paragraphs[0];
  if (node === undefined) throw Error("Missing original text");
  node.SetText("abcdefghi");
  const master = new SwTextFrame(node, "native", 0, 3, 0, [{ start: 0, end: 3, height: 500 }]);
  const follow = new SwTextFrame(node, "native", 3, 6, 0, [{ start: 3, end: 6, height: 500 }]);
  const last = new SwTextFrame(node, "native", 6, 9, 0, [{ start: 6, end: 9, height: 500 }]);
  return { doc, node, master, follow, last };
}
afterEach(
  /** Releases original chains and positions before model ownership. @returns Nothing. */ () => {
    for (const root of roots.splice(0)) root.DestroyImpl();
    for (const doc of docs.splice(0)) {
      for (const node of doc.nodes.entries())
        writerClients0: for (const listener of new SwIterator(SwClient, node)) {
          if (listener instanceof SwFrame) SwFrame.DestroyFrame(listener);
          continue writerClients0;
        }
      doc.Dispose();
    }
    SwTextCursor.SetRightMargin(false);
  },
);
it("native links initially absent and retain the original frame", /** Checks null defaults and original ownership rather than a stored follow flag. @returns Nothing. */ () => {
  const f = fixture(),
    flow = new SwFlowFrame(f.master);
  expect(flow.m_rThis).toBe(f.master);
  expect(flow.GetFollow()).toBeUndefined();
  expect(flow.GetPrecede()).toBeUndefined();
  expect(flow.HasFollow()).toBe(false);
  expect(flow.IsFollow()).toBe(false);
  expect(f.master.GetFollow()).toBeUndefined();
  expect(f.master.GetPrecede()).toBeUndefined();
  expect(f.master.HasFollow()).toBe(false);
  expect(f.master.IsFollow()).toBe(false);
  expect(f.follow.IsFollow()).toBe(false);
  f.master.SetFollow(f.follow);
  f.follow.SetFollow(f.last);
  expect(f.master.GetFollow()).toBe(f.follow);
  expect(f.follow.GetPrecede()).toBe(f.master);
  expect(f.follow.GetFollow()).toBe(f.last);
  expect(f.last.GetPrecede()).toBe(f.follow);
  expect(f.master.IsFollow()).toBe(false);
  expect(f.follow.IsFollow()).toBe(true);
  expect(f.last.IsFollow()).toBe(true);
  expect(f.master.HasFollow()).toBe(true);
  expect(f.last.HasFollow()).toBe(false);
  expect(f.follow.GetTextNodeFirst()).toBe(f.node);
  expect(f.last.GetRegisteredIn()).toBe(f.node);
});
it("native SetFollow detaches replaced and re-chained predecessors in original order", /** Checks actual reciprocal links without copying frame identity. @returns Nothing. */ () => {
  const f = fixture();
  f.master.SetFollow(f.follow);
  f.follow.SetFollow(f.last);
  f.master.SetFollow(f.last);
  expect(f.master.GetFollow()).toBe(f.last);
  expect(f.last.GetPrecede()).toBe(f.master);
  expect(f.follow.GetPrecede()).toBeUndefined();
  expect(f.follow.GetFollow()).toBeUndefined();
  f.master.SetFollow(f.last);
  expect(f.last.GetPrecede()).toBe(f.master);
  f.master.SetFollow(undefined);
  expect(f.last.IsFollow()).toBe(false);
  expect(f.master.HasFollow()).toBe(false);
});
it.each([0, 1, 2])(
  "native destruction detaches neighbors without stitching index=%s",
  /** Checks source first/middle/last destruction and original remaining owners. @param index - Destroyed position. @returns Nothing. */ (
    index,
  ) => {
    const f = fixture();
    f.master.SetFollow(f.follow);
    f.follow.SetFollow(f.last);
    const frames = [f.master, f.follow, f.last],
      target = frames[index];
    if (target === undefined) throw Error("Missing original target");
    SwFrame.DestroyFrame(target);
    expect(target.GetRegisteredIn()).toBeUndefined();
    expect(target.IsInDtor()).toBe(true);
    if (index === 0) {
      expect(f.follow.GetPrecede()).toBeUndefined();
      expect(f.follow.GetFollow()).toBe(f.last);
      expect(f.last.GetPrecede()).toBe(f.follow);
    }
    if (index === 1) {
      expect(f.master.GetFollow()).toBeUndefined();
      expect(f.last.GetPrecede()).toBeUndefined();
    }
    if (index === 2) {
      expect(f.follow.GetFollow()).toBeUndefined();
      expect(f.follow.GetPrecede()).toBe(f.master);
    }
  },
);
it.each<[number, boolean, number]>([
  [0, false, 0],
  [2, false, 0],
  [3, false, 1],
  [3, true, 0],
  [4, true, 1],
  [6, false, 2],
  [6, true, 1],
  [8, true, 2],
  [9, false, 2],
])(
  "native boundary offset=%s rightAffinity=%s owns literal frame=%s",
  /** Checks independent source boundary expectations. @param offset - Native text offset. @param right - Existing right-margin affinity. @param expected - Literal frame index. @returns Nothing. */ (
    offset,
    right,
    expected,
  ) => {
    const f = fixture();
    f.master.SetFollow(f.follow);
    f.follow.SetFollow(f.last);
    const position = new SwPosition(f.node, offset);
    try {
      SwTextCursor.SetRightMargin(right);
      const actual = f.master.GetFrameAtPos(position);
      expect(actual).toBe([f.master, f.follow, f.last][expected]);
      expect(actual.GetTextNodeFirst()).toBe(f.node);
      expect(f.follow.GetOffset()).toBe(3);
      expect(f.last.GetOffset()).toBe(6);
    } finally {
      position.Dispose();
    }
  },
);
it("pagination reconciliation preserves original chains without candidate or discarded members", /** Checks actual shared native identities through reuse, mixed reuse and reflow. @returns Nothing. */ () => {
  const f = fixture(),
    tail = f.doc.nodes.MakeTextNode("tail"),
    root = new SwRootFrame(/** Resolves original model. @returns Native document. */ () => f.doc);
  roots.push(root);
  const firstLines = [
      { start: 0, end: 3, height: 500 },
      { start: 3, end: 6, height: 500 },
      { start: 6, end: 9, height: 500 },
    ],
    measurements = [
      { id: "body", lines: firstLines },
      { id: "tail", lines: [{ start: 0, end: 4, height: 100 }] },
    ],
    info = new SwLineNumberInfo().QueryValue();
  const first = root.Format(measurements, page, undefined, info),
    frames = first.pages
      .flatMap(
        /** Reads original body fragments. @param physical - Actual page. @returns Original fragments. */ (
          physical,
        ) => physical.textFrames,
      )
      .filter(
        /** Filters original body ownership. @param frame - Native text frame. @returns Whether original body. */ (
          frame,
        ) => frame.GetTextNodeFirst() === f.node,
      );
  expect(frames).toHaveLength(3);
  expect(frames[0]?.GetFollow()).toBe(frames[1]);
  expect(frames[1]?.GetFollow()).toBe(frames[2]);
  expect(frames[2]?.GetPrecede()).toBe(frames[1]);
  root.Invalidate();
  const reused = root.Format(measurements, page, undefined, info);
  expect(reused.pages[0]?.textFrames[0]).toBe(frames[0]);
  const mixed = root.Format(
    [
      { id: "body", lines: firstLines },
      { id: "tail", lines: [{ start: 0, end: 4, height: 120 }] },
    ],
    page,
    undefined,
    info,
    1,
  );
  expect(mixed.pages[0]?.textFrames[0]).toBe(frames[0]);
  expect(frames[0]?.GetFollow()).toBe(frames[1]);
  expect(frames[1]?.GetFollow()).toBe(frames[2]);
  expect(frames[2]?.GetFollow()).toBeUndefined();
  const tailFrame = mixed.pages
    .flatMap(
      /** Reads original tail fragments. @param physical - Actual page. @returns Native text frames. */ (
        physical,
      ) => physical.textFrames,
    )
    .find(
      /** Finds original tail. @param frame - Native client. @returns Whether same native node. */ (
        frame,
      ) => frame.GetTextNodeFirst() === tail,
    );
  expect(tailFrame?.IsFollow()).toBe(false);
  const compact = root.Format(
    [
      { id: "body", lines: [{ start: 0, end: 9, height: 300 }] },
      { id: "tail", lines: [{ start: 0, end: 4, height: 120 }] },
    ],
    page,
    undefined,
    info,
    2,
  );
  expect(compact.pages).toHaveLength(1);
  expect(compact.pages[0]?.textFrames[0]?.HasFollow()).toBe(false);
  expect(frames[0]?.IsInDtor()).toBe(true);
  expect(frames[1]?.IsInDtor()).toBe(true);
  expect(frames[2]?.IsInDtor()).toBe(true);
  root.DestroyImpl();
  expect(tailFrame?.IsInDtor()).toBe(true);
});
