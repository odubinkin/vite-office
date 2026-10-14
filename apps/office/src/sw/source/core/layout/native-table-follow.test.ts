/** @fileoverview Verifies original native table flow links, follow constructor, format-client master lookup and split reactions. */
import { afterEach, expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwRootFrame } from "./newfrm";
import { SwTabFrame, SwRowFrame } from "./tabfrm";
import { SwFormatLayoutSplit } from "../../../inc/fmtlsplt";
import type { SwModify } from "../../../inc/calbck";
const frames: SwTabFrame[] = [],
  roots: SwRootFrame[] = [];
afterEach(
  /** Ends explicit native frame owners before roots. @returns Nothing. */ () => {
    for (const f of frames.splice(0).reverse()) f.DestroyImpl();
    for (const r of roots.splice(0)) r.DestroyImpl();
  },
);
/** Allocates original native document/table/root and its actual master. @returns Native owners. */
function fixture() {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Flow table");
  table.AddColumnWidth(3000);
  const row = doc.nodes.AppendTableRow(table, 1),
    root = new SwRootFrame(/** Reads original native document. @returns Document. */ () => doc),
    master = new SwTabFrame(table, root);
  roots.push(root);
  frames.push(master);
  return { doc, table, row, root, master };
}
/** Allocates an original native follow through its source constructor. @param master - Original preceding native table. @returns Original inserted follow. */
function follow(master: SwTabFrame) {
  const frame = new SwTabFrame(master);
  frames.push(frame);
  return frame;
}
/** Reads actual registered native clients. @param owner - Original format owner. @returns Original client objects. */
function clients(owner: SwModify): unknown[] {
  const out: unknown[] = [];
  owner.ForAllListeners(
    /** Reads original client. @param c - Native client. @returns Continue. */ (c) => {
      out.push(c);
      return false;
    },
  );
  return out;
}
it("native table flow links begin absent without a stored follow flag", /** Checks original component defaults on an actual master. @returns Nothing. */ () => {
  const f = fixture();
  expect(f.master.IsFollow()).toBe(false);
  expect(f.master.HasFollow()).toBe(false);
  expect(f.master.GetFollow()).toBeUndefined();
  expect(f.master.GetPrecede()).toBeUndefined();
  expect(f.master.FindMaster()).toBeUndefined();
  expect(f.master.FindMaster(true)).toBeUndefined();
});
it("native follow constructor borrows table format and root without copying lower clients", /** Checks source copy constructor identity and zero lower allocation. @returns Nothing. */ () => {
  const f = fixture(),
    before = clients(f.row.GetFrameFormat()),
    next = follow(f.master);
  expect(next.GetTable()).toBe(f.table);
  expect(next.GetFormat()).toBe(f.master.GetFormat());
  expect(next.getRootFrame()).toBe(f.root);
  expect(next.Lower()).toBeUndefined();
  expect(next.mouseGeometry).toBeUndefined();
  expect(clients(f.row.GetFrameFormat())).toEqual(before);
  expect(f.master.GetFollow()).toBe(next);
  expect(next.GetPrecede()).toBe(f.master);
  expect(next.IsFollow()).toBe(true);
  expect(next.FindMaster()).toBe(f.master);
  expect(next.FindMaster(true)).toBe(f.master);
  expect(next.HasFollow()).toBe(false);
});
it("native follow constructor inserts before an existing original follow chain", /** Checks source SetFollow order and actual immediate/first master distinction. @returns Nothing. */ () => {
  const f = fixture(),
    old = follow(f.master),
    last = follow(old),
    inserted = follow(f.master);
  expect(f.master.GetFollow()).toBe(inserted);
  expect(inserted.GetFollow()).toBe(old);
  expect(old.GetFollow()).toBe(last);
  expect(old.GetPrecede()).toBe(inserted);
  expect(last.FindMaster()).toBe(old);
  expect(last.FindMaster(true)).toBe(f.master);
  expect(inserted.FindMaster()).toBe(f.master);
  expect(
    clients(f.row.GetFrameFormat()).filter(
      /** Reads actual original row clients. @param c - Native client. @returns Whether row frame. */ (
        c,
      ) => c instanceof SwRowFrame,
    ),
  ).toHaveLength(1);
});
it("native registered master search distinguishes independent rooted chains over the same table", /** Checks original format-client search rather than model or root shortcuts. @returns Nothing. */ () => {
  const f = fixture(),
    otherRoot = new SwRootFrame(/** Reads original shared model. @returns Document. */ () => f.doc),
    other = new SwTabFrame(f.table, otherRoot);
  roots.push(otherRoot);
  frames.push(other);
  const a = follow(f.master),
    b = follow(other),
    tail = follow(b);
  expect(a.FindMaster(true)).toBe(f.master);
  expect(tail.FindMaster()).toBe(b);
  expect(tail.FindMaster(true)).toBe(other);
  expect(other.FindMaster()).toBeUndefined();
});
it("native table follow replacement and rechaining retain reciprocal original ownership", /** Checks existing native flow SetFollow semantics without cloning state. @returns Nothing. */ () => {
  const f = fixture(),
    a = follow(f.master),
    b = follow(a);
  f.master.SetFollow(b);
  expect(f.master.GetFollow()).toBe(b);
  expect(b.GetPrecede()).toBe(f.master);
  expect(a.GetPrecede()).toBeUndefined();
  expect(a.GetFollow()).toBeUndefined();
  expect(a.FindMaster()).toBeUndefined();
  expect(a.FindMaster(true)).toBeUndefined();
  f.master.SetFollow(b);
  expect(b.FindMaster()).toBe(f.master);
  f.master.SetFollow(undefined);
  expect(b.IsFollow()).toBe(false);
  expect(f.master.HasFollow()).toBe(false);
});
it.each([0, 1, 2])(
  "native table destruction detaches original neighbors without stitching index=%s",
  /** Checks source flow destructor over first/middle/last actual original objects. @param index - Destroyed native object position. @returns Nothing. */ (
    index,
  ) => {
    const f = fixture(),
      a = follow(f.master),
      b = follow(a),
      chain = [f.master, a, b],
      target = chain[index] as SwTabFrame;
    target.DestroyImpl();
    expect(target.GetRegisteredIn()).toBeUndefined();
    expect(target.GetFollow()).toBeUndefined();
    expect(target.GetPrecede()).toBeUndefined();
    if (index === 0) {
      expect(a.IsFollow()).toBe(false);
      expect(a.GetFollow()).toBe(b);
    } else if (index === 1) {
      expect(f.master.HasFollow()).toBe(false);
      expect(b.IsFollow()).toBe(false);
    } else {
      expect(a.HasFollow()).toBe(false);
      expect(a.FindMaster()).toBe(f.master);
    }
    target.DestroyImpl();
  },
);
it("native layout split notifications invalidate only the original master position", /** Checks original typed model notification reaches master and follow with source IsFollow gate. @returns Nothing. */ () => {
  const f = fixture(),
    next = follow(f.master);
  f.master.setFrameAreaPositionValid(true);
  next.setFrameAreaPositionValid(true);
  f.table.GetFrameFormat().SetFormatAttr(new SwFormatLayoutSplit(false));
  expect(f.master.isFrameAreaPositionValid()).toBe(false);
  expect(next.isFrameAreaPositionValid()).toBe(true);
  expect(f.master.IsLayoutSplitAllowed()).toBe(false);
  expect(next.IsLayoutSplitAllowed()).toBe(false);
  expect(next.FindMaster()).toBe(f.master);
});
it("native follow links do not copy original browser device geometry", /** Checks device rectangles remain caller-owned independently of source copy construction. @returns Nothing. */ () => {
  const f = fixture();
  f.master.mouseGeometry = { rect: { left: 0, right: 200, top: 0, bottom: 100 }, cells: [] };
  const next = follow(f.master);
  expect(next.mouseGeometry).toBeUndefined();
  expect(f.master.mouseGeometry.rect.right).toBe(200);
});
