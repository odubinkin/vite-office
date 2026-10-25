/** @fileoverview Verifies original native text-frame clients, reconciliation, invalidation and explicit release. */
import { SwClient, SwIterator } from "../../../inc/calbck";

import { afterEach, expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwTextFrame, createSwTextFrameInputs, makeSwTextFrame } from "../text/txtfrm";
import { SwContentFrame } from "./ssfrm";
import { SwFrame, SwFrameType } from "./wsfrm";
import { createSwPageFrames, SwRootFrame } from "./newfrm";
import { createDefaultWriterPageDescriptor } from "../../../../test/writer-page-descriptor";
import { SwLineNumberInfo } from "../../../inc/lineinfo";
import type { SwTextNode } from "../txtnode/ndtxt";
import { SvxULSpaceItem } from "../../../../editeng/source/items/frmitems";
import { RES_UL_SPACE } from "../../../inc/hintids";
const owners: SwDoc[] = [],
  roots: SwRootFrame[] = [];
const page = {
  ...createDefaultWriterPageDescriptor("en-GB").GetValue(),
  height: 1000,
  topMargin: 100,
  bottomMargin: 100,
};
const info = new SwLineNumberInfo().QueryValue();
/** Enumerates real original-node clients without substituting their registration. @param node - Native owner. @returns Registered text frames. */
function frames(node: SwTextNode): SwTextFrame[] {
  const result: SwTextFrame[] = [];
  writerClients0: for (const listener of new SwIterator(SwClient, node)) {
    if (listener instanceof SwTextFrame) result.push(listener);
    continue writerClients0;
  }
  return result;
}
/** Creates an initialized native document and original text. @returns Actual document and body node. */
function fixture() {
  const doc = new SwDoc();
  owners.push(doc);
  const node = doc.paragraphs[0];
  if (node === undefined) throw Error("Missing native body");
  node.SetText("abcdef");
  return { doc, node };
}
afterEach(
  /** Releases actual clients before their owning model. @returns Nothing. */ () => {
    for (const root of roots.splice(0)) root.DestroyImpl();
    for (const doc of owners.splice(0)) {
      for (const node of doc.nodes.entries())
        writerClients1: for (const listener of new SwIterator(SwClient, node)) {
          if (listener instanceof SwFrame) SwFrame.DestroyFrame(listener);
          continue writerClients1;
        }
      doc.Dispose();
    }
  },
);
it.each([false, true])(
  "body/cell master and follow register the original node cell=%s",
  /** Checks the native class chain and type against original graph identity. @param cell - Cell context. @returns Nothing. */ (
    cell,
  ) => {
    const f = fixture(),
      table = f.doc.nodes.MakeTableNode("Owner");
    const node = cell
      ? f.doc.nodes.AppendTableRow(table, 1).GetTabBoxes()[0]?.GetParagraphs()[0]
      : f.node;
    if (node === undefined) throw Error("Missing native text");
    node.SetText("abcdef");
    const master = new SwTextFrame(node, "device", 0, 3, 0, [{ start: 0, end: 3, height: 300 }]);
    const follow = new SwTextFrame(node, "device", 3, 6, 0, [{ start: 3, end: 6, height: 300 }]);
    master.SetFollow(follow);
    expect(master).toBeInstanceOf(SwContentFrame);
    expect(master).toBeInstanceOf(SwFrame);
    expect(master.GetRegisteredIn()).toBe(node);
    expect(follow.GetTextNodeFirst()).toBe(node);
    expect(master.GetType()).toBe(SwFrameType.Txt);
    expect(master.IsTextFrame()).toBe(true);
    expect(master.IsTabFrame()).toBe(false);
    expect(frames(node)).toEqual([master, follow]);
    SwFrame.DestroyFrame(master);
    expect(master.IsInDtor()).toBe(true);
    expect(master.GetRegisteredIn()).toBeUndefined();
    expect(frames(node)).toEqual([follow]);
    SwFrame.DestroyFrame(follow);
    expect(frames(node)).toEqual([]);
  },
);
it("retains mutable original pagination clients for native attribute invalidation", /** Checks actual owner broadcast rather than detached geometry copies. @returns Nothing. */ () => {
  const f = fixture();
  const input = createSwTextFrameInputs(f.doc, [
    { id: "body", lines: [{ start: 0, end: 6, height: 300 }] },
  ])[0];
  if (input === undefined) throw Error("Missing input");
  expect(input.node).toBe(f.node);
  const frame = makeSwTextFrame(input, 0, 0, 0);
  expect(Object.isFrozen(frame)).toBe(false);
  expect(frame.GetTextNodeFirst()).toBe(f.node);
  frame.setFrameAreaPositionValid(true);
  frame.setFrameAreaSizeValid(true);
  frame.setFramePrintAreaValid(true);
  f.node.SetAttr(new SvxULSpaceItem(120, 240, RES_UL_SPACE));
  expect(frame.isFrameAreaPositionValid()).toBe(true);
  expect(frame.isFrameAreaSizeValid()).toBe(false);
  expect(frame.isFramePrintAreaValid()).toBe(false);
});
it("replaces cursor clients and rejects stale or foreign text geometry", /** Checks explicit cursor ownership and source guards. @returns Nothing. */ () => {
  const f = fixture(),
    other = fixture(),
    root = new SwRootFrame(/** Resolves current owner. @returns Native model. */ () => f.doc);
  roots.push(root);
  const lines = [{ start: 0, end: 6, height: 300 }];
  root.SetCursorTextFrames(f.node, [{ lines: lines, start: 0, end: 6 }]);
  const first = root.GetCursorTextFrame(f.node);
  expect(first?.GetTextNodeFirst()).toBe(f.node);
  root.SetCursorTextFrames(f.node, [{ lines: lines, start: 0, end: 6 }]);
  const second = root.GetCursorTextFrame(f.node);
  expect(second).not.toBe(first);
  expect(first?.IsInDtor()).toBe(true);
  expect(frames(f.node)).toEqual([second]);
  f.node.SetText("changed");
  expect(root.GetCursorTextFrame(f.node)).toBeUndefined();
  root.SetCursorTextFrames(other.node, [{ lines: lines, start: 0, end: 6 }]);
  expect(root.GetCursorTextFrame(other.node)).toBeUndefined();
  root.DestroyImpl();
  expect(frames(f.node)).toEqual([]);
  expect(frames(other.node)).toEqual([]);
  root.DestroyImpl();
});
it("reuses original frames without retaining candidates and destroys reflowed fragments", /** Checks actual client counts through cache reuse, changed geometry and empty pagination. @returns Nothing. */ () => {
  const f = fixture(),
    root = new SwRootFrame(/** Resolves original model. @returns Native document. */ () => f.doc);
  roots.push(root);
  const measurements = [
    {
      id: "same",
      lines: [
        { start: 0, end: 3, height: 500 },
        { start: 3, end: 6, height: 500 },
      ],
    },
  ];
  const first = root.Format(measurements, page, undefined, info);
  expect(first.pages).toHaveLength(2);
  expect(frames(f.node)).toHaveLength(2);
  root.Invalidate();
  const reused = root.Format(measurements, page, undefined, info);
  expect(reused.pages[0]?.textFrames[0]).toBe(first.pages[0]?.textFrames[0]);
  expect(frames(f.node)).toHaveLength(2);
  const changed = root.Format(
    [{ id: "same", lines: [{ start: 0, end: 6, height: 300 }] }],
    page,
    undefined,
    info,
    1,
  );
  expect(changed.pages).toHaveLength(1);
  expect(frames(f.node)).toEqual([changed.pages[0]?.textFrames[0]]);
  expect(first.pages[0]?.textFrames[0]?.IsInDtor()).toBe(true);
  expect(first.pages[1]?.textFrames[0]?.IsInDtor()).toBe(true);
  root.Format([], page, undefined, info, 2);
  expect(frames(f.node)).toEqual([]);
});
it("releases old-document page and cursor clients even for the same device identity", /** Checks document-shell replacement cannot reuse native foreign owners. @returns Nothing. */ () => {
  const f = fixture(),
    replacement = fixture();
  let current = f.doc;
  const root = new SwRootFrame(
    /** Resolves replacement model. @returns Native document. */ () => current,
  );
  roots.push(root);
  const measurement = [{ id: "same", lines: [{ start: 0, end: 6, height: 300 }] }];
  const first = root.Format(measurement, page, undefined, info);
  root.SetCursorTextFrames(f.node, [
    { lines: [{ start: 0, end: 6, height: 300 }], start: 0, end: 6 },
  ]);
  current = replacement.doc;
  const next = root.Format(measurement, page, undefined, info);
  expect(next.pages[0]?.textFrames[0]?.GetTextNodeFirst()).toBe(replacement.node);
  expect(next.pages[0]?.textFrames[0]).not.toBe(first.pages[0]?.textFrames[0]);
  expect(frames(f.node)).toEqual([]);
  root.DestroyImpl();
  expect(frames(replacement.node)).toEqual([]);
});
it("releases partially created original frames after failed follow descriptor resolution", /** Checks error ownership without native-source execution or mocked constructors. @returns Nothing. */ () => {
  const f = fixture(),
    input = createSwTextFrameInputs(f.doc, [
      {
        id: "body",
        lines: [
          { start: 0, end: 3, height: 500 },
          { start: 3, end: 6, height: 500 },
        ],
      },
    ]);
  expect(
    /** Formats a partial graph that must release its native clients on failure. @returns Partial pagination attempt. */ () =>
      createSwPageFrames(input, {
        initialName: page.name,
        descriptors: [{ value: page, followName: "Missing" }],
      }),
  ).toThrow("Writer layout follow page descriptor is missing.");
  expect(frames(f.node)).toEqual([]);
});
