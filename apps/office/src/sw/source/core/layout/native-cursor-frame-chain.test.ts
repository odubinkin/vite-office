/** @fileoverview Checks original root-owned measured cursor chains and native continuation margins. */
import { afterEach, expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwRootFrame } from "./newfrm";
import { SwTextFrame } from "../text/txtfrm";
import { SwPaM, SwPosition } from "../crsr/pam";
import { SwTextCursor } from "../text/itrtxt";
import { SwLineNumberInfo } from "../../../inc/lineinfo";
import { createDefaultWriterPageDescriptor } from "../../../../test/writer-page-descriptor";
const docs: SwDoc[] = [],
  roots: SwRootFrame[] = [];
afterEach(
  /** Releases original registered frames before their documents. @returns Nothing. */ () => {
    for (const root of roots.splice(0)) root.DestroyImpl();
    for (const doc of docs.splice(0)) doc.Dispose();
    SwTextCursor.SetRightMargin(false);
  },
);
/** Builds actual original body or cell owners with one actual device chain. @param cell - Native cell context. @returns Actual graph and device fragments. */
function fixture(cell: boolean) {
  const doc = new SwDoc();
  docs.push(doc);
  const node = cell
    ? doc.nodes
        .AppendTableRow(doc.nodes.MakeTableNode("Chains"), 1)
        .GetTabBoxes()[0]
        ?.GetParagraphs()[0]
    : doc.paragraphs[0];
  if (node === undefined) throw Error("Missing original text");
  node.SetText("abc   def   ghi   ");
  const root = new SwRootFrame(
    /** Returns the original document. @returns Native document. */ () => doc,
  );
  roots.push(root);
  const fragments = [0, 6, 12].map(
    /** Supplies literal actual device fragment geometry. @param start - Native UTF16 start. @returns Device fragment. */ (
      start,
    ) => ({ start, end: start + 6, lines: [{ start, end: start + 6, height: 300 }] }),
  );
  return { doc, node, root, fragments };
}
it.each([false, true])(
  "original measured master and follows own every client cell=%s",
  /** Checks actual reciprocal links, lifetime and native model positions. @param cell - Native cell context. @returns Nothing. */ (
    cell,
  ) => {
    const f = fixture(cell);
    f.root.SetCursorTextFrames(f.node, f.fragments);
    const master = f.root.GetCursorTextFrame(f.node),
      follow = master?.GetFollow(),
      last = follow?.GetFollow();
    expect(master).toBeInstanceOf(SwTextFrame);
    expect(master?.IsFollow()).toBe(false);
    expect(follow?.FindMaster()).toBe(master);
    expect(last?.FindMaster()).toBe(follow);
    expect((last as SwTextFrame | undefined)?.GetOffset()).toBe(12);
    expect(last?.GetFollow()).toBeUndefined();
    for (const frame of [master, follow, last]) {
      expect(frame?.GetRegisteredIn()).toBe(f.node);
      expect(frame?.getRootFrame()).toBe(f.root);
    }
    f.root.SetCursorTextFrames(f.node, [f.fragments[0] as (typeof f.fragments)[number]]);
    for (const frame of [master, follow, last]) {
      expect(frame?.IsInDtor()).toBe(true);
      expect(frame?.GetRegisteredIn()).toBeUndefined();
    }
    const replacement = f.root.GetCursorTextFrame(f.node);
    expect(replacement?.HasFollow()).toBe(false);
    f.root.SetCursorTextFrames(f.node, []);
    expect(f.root.GetCursorTextFrame(f.node)).toBeUndefined();
    expect(replacement?.IsInDtor()).toBe(true);
    f.root.SetCursorTextFrames(f.node, f.fragments);
    const final = f.root.GetCursorTextFrame(f.node),
      finalFollow = final?.GetFollow(),
      finalLast = finalFollow?.GetFollow();
    f.root.DestroyImpl();
    for (const frame of [final, finalFollow, finalLast]) expect(frame?.IsInDtor()).toBe(true);
  },
);
it.each<[boolean, boolean, number, number]>([
  [true, false, 1, 3],
  [true, true, 1, 6],
  [false, false, 1, 6],
  [true, false, 7, 9],
  [true, false, 13, 18],
])(
  "native continuation chain=%s API=%s offset=%s ends=%s",
  /** Checks source literal trim rules against real links, including partial standalone masters. @param chain - Publish real follows. @param api - Native API spaces. @param offset - Actual point. @param expected - Literal native end. @returns Nothing. */ (
    chain,
    api,
    offset,
    expected,
  ) => {
    const f = fixture(false);
    f.root.SetCursorTextFrames(
      f.node,
      chain ? f.fragments : [f.fragments[0] as (typeof f.fragments)[number]],
    );
    const frame = f.root.GetCursorTextFrame(f.node);
    if (frame === undefined) throw Error("Missing original frame");
    const position = new SwPosition(f.node, offset),
      pam = new SwPaM(position);
    position.Dispose();
    try {
      expect(frame.RightMargin(pam, api)).toBe(true);
      expect(pam.GetPoint().GetNode()).toBe(f.node);
      expect(pam.GetPoint().GetContentIndex()).toBe(expected);
    } finally {
      pam.Dispose();
    }
  },
);
it("document replacement releases every original old chain member", /** Checks actual root owner switch and guarded geometry without a replacement model copy. @returns Nothing. */ () => {
  const f = fixture(false),
    next = fixture(false);
  let current = f.doc;
  const root = new SwRootFrame(
    /** Resolves current actual document. @returns Native document. */ () => current,
  );
  roots.push(root);
  root.SetCursorTextFrames(f.node, f.fragments);
  const master = root.GetCursorTextFrame(f.node),
    follow = master?.GetFollow(),
    last = follow?.GetFollow();
  current = next.doc;
  expect(root.GetCursorTextFrame(f.node)).toBeUndefined();
  root.Format(
    [],
    createDefaultWriterPageDescriptor("en-GB").GetValue(),
    undefined,
    new SwLineNumberInfo().QueryValue(),
  );
  for (const frame of [master, follow, last]) expect(frame?.IsInDtor()).toBe(true);
});
