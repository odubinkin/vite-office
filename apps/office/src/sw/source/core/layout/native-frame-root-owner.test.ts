/** @fileoverview Checks original native root registration, constructor root pointers and derived-format lifetime. */
import { SwClient, SwIterator } from "../../../inc/calbck";

import { afterEach, expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwFrame, SwFrameType, SwLayoutFrame } from "./wsfrm";
import { SwFrameFormat } from "./atrfrm";
import { SwRootFrame, createSwPageFrames } from "./newfrm";
import { SwTextFrame, createSwTextFrameInputs } from "../text/txtfrm";
import { createDefaultWriterPageDescriptor } from "../../../../test/writer-page-descriptor";
import { SwLineNumberInfo } from "../../../inc/lineinfo";
const docs: SwDoc[] = [],
  roots: SwRootFrame[] = [];
const page = {
    ...createDefaultWriterPageDescriptor("en-GB").GetValue(),
    height: 1000,
    topMargin: 100,
    bottomMargin: 100,
  },
  info = new SwLineNumberInfo().QueryValue();
/** Exposes the native protected layout constructor with original format/sibling inputs only. */
class Layout extends SwLayoutFrame {
  /** Creates an actual native layout client. @param format - Original frame format. @param sibling - Original frame supplying its root. @returns Nothing. */
  public constructor(format: SwFrameFormat, sibling?: SwFrame) {
    super(format, sibling);
  }
}
/** Initializes an actual native model. @returns Original document. */
function document(): SwDoc {
  const doc = new SwDoc();
  docs.push(doc);
  doc.paragraphs[0]?.SetText("abcdef");
  return doc;
}
afterEach(
  /** Releases registered original frames before model owners. @returns Nothing. */ () => {
    for (const root of roots.splice(0)) SwFrame.DestroyFrame(root);
    for (const doc of docs.splice(0)) {
      for (const node of doc.nodes.entries())
        writerClients0: for (const client of new SwIterator(SwClient, node)) {
          if (client instanceof SwFrame) SwFrame.DestroyFrame(client);
          continue writerClients0;
        }
      doc.Dispose();
    }
  },
);
it("native Root is a registered layout frame with its own original derived format and self root", /** Checks class, native defaults and independent original views. @returns Nothing. */ () => {
  const doc = document(),
    first = new SwRootFrame(/** Resolves actual model. @returns Document. */ () => doc),
    second = new SwRootFrame(/** Resolves the same original model. @returns Document. */ () => doc);
  roots.push(first, second);
  const format = first.GetFormat(),
    other = second.GetFormat(),
    parent = doc.GetDfltFrameFormat();
  expect(first).toBeInstanceOf(SwFrame);
  expect(first).toBeInstanceOf(SwLayoutFrame);
  expect(first.GetType()).toBe(SwFrameType.Root);
  expect(first.getRootFrame()).toBe(first);
  expect(second.getRootFrame()).toBe(second);
  expect(first.GetRegisteredIn()).toBe(format);
  expect(format).toBeInstanceOf(SwFrameFormat);
  expect(format.GetName()).toBe("Root");
  expect(format.GetDoc()).toBe(doc);
  expect(format.DerivedFrom()).toBe(parent);
  expect(format).not.toBe(parent);
  expect(other).not.toBe(format);
  expect(other.DerivedFrom()).toBe(parent);
  expect(format.IsAuto()).toBe(true);
  expect(first.GetUpper()).toBeUndefined();
  expect(first.GetNext()).toBeUndefined();
  expect(first.GetPrev()).toBeUndefined();
  expect(first.Lower()).toBeUndefined();
  expect(first.IsInDtor()).toBe(false);
  SwFrame.DestroyFrame(first);
  expect(first.IsInDtor()).toBe(true);
  expect(first.GetRegisteredIn()).toBeUndefined();
  expect(format.IsDisposed()).toBe(true);
  expect(parent.IsDisposed()).toBe(false);
  expect(second.GetRegisteredIn()).toBe(other);
  expect(other.IsDisposed()).toBe(false);
  first.DestroyImpl();
  expect(parent.IsDisposed()).toBe(false);
});
it("native constructor copies the actual sibling root through layout and original text clients", /** Checks represented C++ sibling ownership without cloned frames. @returns Nothing. */ () => {
  const doc = document(),
    root = new SwRootFrame(/** Resolves native model. @returns Document. */ () => doc);
  roots.push(root);
  const node = doc.paragraphs[0];
  if (node === undefined) throw Error("Missing original text");
  const detached = new SwTextFrame(node, "detached", 0, 6, 0, [{ start: 0, end: 6, height: 100 }]),
    layout = new Layout(doc.GetDfltFrameFormat(), root),
    text = new SwTextFrame(node, "native", 0, 6, 0, [{ start: 0, end: 6, height: 100 }], layout),
    next = new SwTextFrame(node, "follow", 3, 6, 0, [{ start: 3, end: 6, height: 100 }], text);
  expect(detached.getRootFrame()).toBeUndefined();
  expect(layout.getRootFrame()).toBe(root);
  expect(text.getRootFrame()).toBe(root);
  expect(next.getRootFrame()).toBe(root);
  expect(text.GetRegisteredIn()).toBe(node);
  expect(next.GetTextNodeFirst()).toBe(node);
  text.SetFollow(next);
  expect(text.GetFollow()).toBe(next);
  expect(next.GetPrecede()).toBe(text);
  SwFrame.DestroyFrame(layout);
});
it("production pagination and cursor frames retain the original root through reuse and close", /** Checks actual root formatting and original node identity. @returns Nothing. */ () => {
  const doc = document(),
    root = new SwRootFrame(/** Resolves original model. @returns Document. */ () => doc);
  roots.push(root);
  const node = doc.paragraphs[0];
  if (node === undefined) throw Error("Missing original text");
  const measurements = [
      {
        id: "body",
        lines: [
          { start: 0, end: 3, height: 500 },
          { start: 3, end: 6, height: 500 },
        ],
      },
    ],
    first = root.Format(measurements, page, undefined, info),
    master = first.pages[0]?.textFrames[0],
    follow = first.pages[1]?.textFrames[0];
  expect(master?.getRootFrame()).toBe(root);
  expect(follow?.getRootFrame()).toBe(root);
  expect(master?.GetFollow()).toBe(follow);
  expect(follow?.GetTextNodeFirst()).toBe(node);
  root.Invalidate();
  const reused = root.Format(measurements, page, undefined, info);
  expect(reused.pages[0]?.textFrames[0]).toBe(master);
  expect(master?.getRootFrame()).toBe(root);
  root.SetCursorTextFrames(node, [
    { lines: [{ start: 3, end: 6, height: 100 }], start: 3, end: 6 },
  ]);
  const measured = root.GetCursorTextFrame(node);
  expect(measured?.getRootFrame()).toBe(root);
  expect(measured?.GetRegisteredIn()).toBe(node);
  root.DestroyImpl();
  expect(master?.IsInDtor()).toBe(true);
  expect(follow?.IsInDtor()).toBe(true);
  expect(measured?.IsInDtor()).toBe(true);
});
it.each([false, true])(
  "document replacement rebinds original root format before device update=%s",
  /** Checks both current production document replacement entry points. @param cursorFirst - Whether cursor measurement precedes formatting. @returns Nothing. */ (
    cursorFirst,
  ) => {
    const before = document(),
      after = document();
    let current = before;
    const root = new SwRootFrame(
      /** Resolves the existing document-shell replacement boundary. @returns Current native document. */ () =>
        current,
    );
    roots.push(root);
    const oldFormat = root.GetFormat(),
      measurements = [{ id: "body", lines: [{ start: 0, end: 6, height: 100 }] }],
      previous = root.Format(measurements, page, undefined, info).pages[0]?.textFrames[0],
      node = after.paragraphs[0];
    if (node === undefined) throw Error("Missing replacement node");
    current = after;
    if (cursorFirst) {
      const measured = measurements[0];
      if (measured === undefined) throw Error("Missing authored device measurement");
      root.SetCursorTextFrames(node, [{ lines: measured.lines, start: 0, end: 6 }]);
    }
    const next = root.Format(measurements, page, undefined, info).pages[0]?.textFrames[0];
    expect(oldFormat.IsDisposed()).toBe(true);
    expect(before.GetDfltFrameFormat().IsDisposed()).toBe(false);
    expect(root.GetFormat().GetDoc()).toBe(after);
    expect(root.GetFormat().DerivedFrom()).toBe(after.GetDfltFrameFormat());
    expect(root.GetRegisteredIn()).toBe(root.GetFormat());
    expect(next?.getRootFrame()).toBe(root);
    expect(next?.GetTextNodeFirst()).toBe(node);
    expect(next).not.toBe(previous);
    expect(previous?.IsInDtor()).toBe(true);
  },
);
it("partial pagination failure releases original root-bearing clients", /** Checks native registration after a failed original follow descriptor. @returns Nothing. */ () => {
  const doc = document(),
    root = new SwRootFrame(/** Resolves native model. @returns Document. */ () => doc);
  roots.push(root);
  const node = doc.paragraphs[0];
  if (node === undefined) throw Error("Missing original text");
  const input = createSwTextFrameInputs(doc, [
    {
      id: "body",
      lines: [
        { start: 0, end: 3, height: 500 },
        { start: 3, end: 6, height: 500 },
      ],
    },
  ]);
  expect(
    /** Attempts original partial pagination. @returns Pagination attempt. */ () =>
      createSwPageFrames(
        input,
        { initialName: page.name, descriptors: [{ value: page, followName: "Missing" }] },
        undefined,
        [],
        root,
      ),
  ).toThrow("Writer layout follow page descriptor is missing.");
  const clients: SwFrame[] = [];
  writerClients1: for (const client of new SwIterator(SwClient, node)) {
    if (client instanceof SwFrame) clients.push(client);
    continue writerClients1;
  }
  expect(clients).toEqual([]);
  expect(root.GetFormat().IsDisposed()).toBe(false);
});
