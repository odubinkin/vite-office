/** @fileoverview Checks original body formatter/client and paragraph-cache ownership through browser line publication without duplicate native frames. */
import { SwClient, SwIterator } from "../../../inc/calbck";

import { afterEach, expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwRootFrame } from "./newfrm";
import { SwFrame } from "./wsfrm";
import { SwTextFrame, createSwParaPortion } from "../text/txtfrm";
import { SwParaPortion } from "../text/porlay";
import { SwLineNumberInfo } from "../../../inc/lineinfo";
import { createDefaultWriterPageDescriptor } from "../../../../test/writer-page-descriptor";
import type { SwTextNode } from "../txtnode/ndtxt";
const docs: SwDoc[] = [],
  roots: SwRootFrame[] = [],
  extra: SwTextFrame[] = [];
/** Reads actual registered clients, without a second projected frame index. @param node - Original content owner. @returns Original clients. */
function clients(node: SwTextNode): SwTextFrame[] {
  const result: SwTextFrame[] = [];
  writerClients0: for (const client of new SwIterator(SwClient, node)) {
    if (client instanceof SwTextFrame) result.push(client);
    continue writerClients0;
  }
  return result;
}
/** Creates real model/layout owners and literal two-page device inputs. @returns Actual native fixture. */
function fixture() {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  docs.push(doc);
  if (node === undefined) throw Error("Missing body");
  node.SetText("abc   def   ");
  const root = new SwRootFrame(
    /** Borrows the actual document. @returns Original model. */ () => doc,
  );
  roots.push(root);
  const page = {
      ...createDefaultWriterPageDescriptor("en-GB").GetValue(),
      height: 700,
      topMargin: 0,
      bottomMargin: 0,
    },
    info = new SwLineNumberInfo().QueryValue(),
    measurements = [
      {
        id: "body",
        lines: [
          { start: 0, end: 6, height: 500 },
          { start: 6, end: 12, height: 500 },
        ],
      },
    ],
    fragments = [
      {
        start: 0,
        end: 6,
        lines: [
          { start: 0, end: 3, height: 150 },
          { start: 3, end: 6, height: 250 },
        ],
      },
      { start: 6, end: 12, lines: [{ start: 6, end: 12, height: 400 }] },
    ];
  return { doc, node, root, page, info, measurements, fragments };
}
afterEach(
  /** Releases original client ownership before model lifetime ends. @returns Nothing. */ () => {
    for (const frame of extra.splice(0)) if (!frame.IsInDtor()) SwFrame.DestroyFrame(frame);
    for (const root of roots.splice(0)) root.DestroyImpl();
    for (const doc of docs.splice(0)) doc.Dispose();
  },
);
it("SetPara returns original old ownership and undefined clears the native cache", /** Reproduces original txtcache.cxx move semantics on a real registered frame. @returns Nothing. */ () => {
  const f = fixture(),
    frame = new SwTextFrame(f.node, "body", 0, 12, 0, []),
    para = new SwParaPortion();
  extra.push(frame);
  para.SetLen(12);
  expect(frame.GetPara()).toBeUndefined();
  expect(frame.SetPara(para)).toBeUndefined();
  expect(frame.GetPara()).toBe(para);
  const replacement = createSwParaPortion(f.fragments[0]?.lines ?? []);
  expect(frame.SetPara(replacement)).toBe(para);
  expect(frame.GetPara()).toBe(replacement);
  expect(replacement?.GetLen()).toBe(3);
  expect(replacement?.GetRealHeight()).toBe(150);
  expect(replacement?.GetNext()?.GetLen()).toBe(3);
  expect(replacement?.GetNext()?.GetRealHeight()).toBe(250);
  expect(replacement?.GetParLen()).toBe(6);
  expect(frame.SetPara(undefined)).toBe(replacement);
  expect(frame.SetPara(undefined)).toBeUndefined();
  expect(para.GetLen()).toBe(12);
  expect(createSwParaPortion([])).toBeUndefined();
});
it("body publication updates actual formatter caches and preserves node/root/follow/ID identity", /** Proves that the native node query and mounted cursor borrow the same original graph. @returns Nothing. */ () => {
  const f = fixture(),
    snapshot = f.root.Format(f.measurements, f.page, undefined, f.info),
    master = snapshot.pages[0]?.textFrames[0],
    follow = snapshot.pages[1]?.textFrames[0],
    oldPara = master?.GetPara(),
    ids = clients(f.node).map(
      /** Reads actual native IDs. @param frame - Original client. @returns ID. */ (frame) =>
        frame.GetFrameId(),
    );
  expect(clients(f.node)).toEqual([master, follow]);
  f.root.SetCursorTextFrames(f.node, f.fragments);
  expect(f.root.GetCursorTextFrame(f.node)).toBe(master);
  expect(f.node.getLayoutFrame(f.root)).toBe(master);
  expect(clients(f.node)).toEqual([master, follow]);
  expect(
    clients(f.node).map(
      /** Reads actual native IDs. @param frame - Original client. @returns ID. */ (frame) =>
        frame.GetFrameId(),
    ),
  ).toEqual(ids);
  expect(master?.GetPara()).not.toBe(oldPara);
  expect(master?.GetPara()?.GetLen()).toBe(3);
  expect(master?.GetPara()?.GetNext()?.GetLen()).toBe(3);
  expect(master?.GetFollow()).toBe(follow);
  expect(follow?.FindMaster()).toBe(master);
  f.root.SetCursorTextFrames(f.node, f.fragments);
  expect(clients(f.node)).toEqual([master, follow]);
  expect(master?.IsInDtor()).toBe(false);
  expect(follow?.IsInDtor()).toBe(false);
  expect(master?.getRootFrame()).toBe(f.root);
  f.root.SetCursorTextFrames(f.node, [f.fragments[1] as (typeof f.fragments)[number]]);
  expect(f.root.GetCursorTextFrame(f.node)).toBe(follow);
  expect(follow?.FindMaster()).toBe(master);
  expect(master?.GetFollow()).toBe(follow);
});
it("stale or empty mounted body spans register no duplicate client and retain formatter owners", /** Checks admission against real current source spans. @returns Nothing. */ () => {
  const f = fixture(),
    pages = f.root.Format(f.measurements, f.page, undefined, f.info).pages,
    original = clients(f.node);
  f.root.SetCursorTextFrames(f.node, f.fragments);
  f.root.SetCursorTextFrames(f.node, [
    { start: 2, end: 6, lines: [{ start: 2, end: 6, height: 500 }] },
  ]);
  expect(f.root.GetCursorTextFrame(f.node)).toBeUndefined();
  expect(clients(f.node)).toEqual(original);
  f.root.SetCursorTextFrames(f.node, []);
  expect(f.root.GetCursorTextFrame(f.node)).toBeUndefined();
  expect(pages[0]?.textFrames[0]?.IsInDtor()).toBe(false);
  expect(clients(f.node)).toEqual(original);
  f.root.SetCursorTextFrames(f.node, [{ start: 0, end: 6, lines: [] }]);
  expect(f.root.GetCursorTextFrame(f.node)).toBe(original[0]);
  expect(original[0]?.GetPara()).toBeUndefined();
  f.root.SetCursorTextFrames(f.node, f.fragments);
  expect(original[0]?.GetPara()?.GetParLen()).toBe(6);
});
it("body formatting releases formerly standalone cursor clients before any next key publication", /** Checks the original ownership transition rather than waiting for another cursor event. @returns Nothing. */ () => {
  const f = fixture();
  f.root.SetCursorTextFrames(f.node, [
    { start: 0, end: 12, lines: [{ start: 0, end: 12, height: 500 }] },
  ]);
  const old = f.root.GetCursorTextFrame(f.node);
  expect(clients(f.node)).toEqual([old]);
  const snapshot = f.root.Format(f.measurements, f.page, undefined, f.info);
  expect(old?.IsInDtor()).toBe(true);
  expect(f.root.GetCursorTextFrame(f.node)).toBeUndefined();
  expect(clients(f.node)).toEqual(
    snapshot.pages
      .flatMap(
        /** Reads original fragments. @param page - Actual page. @returns Clients. */ (page) =>
          page.textFrames,
      )
      .reverse(),
  );
  f.root.SetCursorTextFrames(f.node, f.fragments);
  expect(f.root.GetCursorTextFrame(f.node)).toBe(snapshot.pages[0]?.textFrames[0]);
  expect(clients(f.node)).toHaveLength(2);
});
it("native reflow clears obsolete leases and retained formatting leaves original cursor clients alive", /** Checks both source cache retention and actual frame replacement. @returns Nothing. */ () => {
  const f = fixture(),
    first = f.root.Format(f.measurements, f.page, undefined, f.info);
  f.root.SetCursorTextFrames(f.node, f.fragments);
  const master = f.root.GetCursorTextFrame(f.node);
  f.root.Invalidate();
  const retained = f.root.Format(f.measurements, f.page, undefined, f.info);
  expect(retained.pages[0]?.textFrames[0]).toBe(master);
  expect(f.root.GetCursorTextFrame(f.node)).toBe(master);
  const next = f.root.Format(
    [{ id: "body", lines: [{ start: 0, end: 12, height: 400 }] }],
    f.page,
    undefined,
    f.info,
    1,
  );
  expect(master?.IsInDtor()).toBe(true);
  expect(first.pages[1]?.textFrames[0]?.IsInDtor()).toBe(true);
  expect(f.root.GetCursorTextFrame(f.node)).toBeUndefined();
  f.root.SetCursorTextFrames(f.node, [
    { start: 0, end: 12, lines: [{ start: 0, end: 12, height: 400 }] },
  ]);
  expect(f.root.GetCursorTextFrame(f.node)).toBe(next.pages[0]?.textFrames[0]);
  expect(clients(f.node)).toHaveLength(1);
});
it("a destroyed borrowed native client cannot remain a cursor target or be destroyed twice on close", /** Checks the actual deletion guard on a published original body frame. @returns Nothing. */ () => {
  const f = fixture(),
    original = f.root.Format(f.measurements, f.page, undefined, f.info).pages[0]?.textFrames[0];
  f.root.SetCursorTextFrames(f.node, f.fragments);
  if (original === undefined) throw Error("Missing actual master");
  SwFrame.DestroyFrame(original);
  expect(f.root.GetCursorTextFrame(f.node)).toBeUndefined();
  f.root.SetCursorTextFrames(f.node, [f.fragments[1] as (typeof f.fragments)[number]]);
  expect(clients(f.node)).toHaveLength(1);
  f.root.DestroyImpl();
  expect(clients(f.node)).toEqual([]);
});

it("equal source spans keep distinct original native frame caches", /** Checks original occurrence ownership when separate actual frames have equal model ranges; this does not certify full native field formatting. @returns Nothing. */ () => {
  const f = fixture();
  f.node.SetText("");
  const lines = [
    { start: 0, end: 0, height: 500 },
    { start: 0, end: 0, height: 500 },
  ];
  const snapshot = f.root.Format([{ id: "body", lines }], f.page, undefined, f.info);
  const master = snapshot.pages[0]?.textFrames[0],
    follow = snapshot.pages[1]?.textFrames[0];
  expect(master).not.toBe(follow);
  expect(master?.GetFollow()).toBe(follow);
  f.root.SetCursorTextFrames(f.node, [
    { start: 0, end: 0, lines: [{ start: 0, end: 0, height: 150 }] },
    { start: 0, end: 0, lines: [{ start: 0, end: 0, height: 250 }] },
  ]);
  expect(master?.GetPara()?.GetRealHeight()).toBe(150);
  expect(follow?.GetPara()?.GetRealHeight()).toBe(250);
  expect(clients(f.node)).toEqual([master, follow]);
  expect(follow?.FindMaster()).toBe(master);
});
