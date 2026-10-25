/** @fileoverview Checks original registered content-node lookup, layout identity and master/follow position routing. */
import { afterEach, expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import type { SwContentNode } from "../docnode/node";
import { SwClient } from "../../../inc/calbck";
import { SwPosition } from "../crsr/pam";
import { SwTextFrame } from "../text/txtfrm";
import { SwTextCursor } from "../text/itrtxt";
import { SwRootFrame } from "./newfrm";
import { SwFrame, SwFrameType } from "./wsfrm";
import { GetFrameOfModify } from "./frmtool";
import { SwLineNumberInfo } from "../../../inc/lineinfo";
import { createDefaultWriterPageDescriptor } from "../../../../test/writer-page-descriptor";
/** Exposes construction of the original base frame for native type-mask admission checks. */
class OriginalFrame extends SwFrame {
  /** Registers the real base client without replacing native behavior. @param node - Original content owner. @param root - Original layout. @returns Nothing. */
  public constructor(node: SwContentNode, root: SwRootFrame) {
    super(node, root);
  }
}
const docs: SwDoc[] = [],
  roots: SwRootFrame[] = [],
  frames: SwFrame[] = [],
  clients: SwClient[] = [];
afterEach(
  /** Releases original clients before their native model owners. @returns Nothing. */ () => {
    for (const frame of frames.splice(0)) SwFrame.DestroyFrame(frame);
    for (const client of clients.splice(0)) client.Dispose();
    for (const root of roots.splice(0)) root.DestroyImpl();
    for (const doc of docs.splice(0)) doc.Dispose();
    SwTextCursor.SetRightMargin(false);
  },
);
/** Creates body or cell content without device or model adapters. @param cell - Native cell context. @returns Original model and layout. */
function fixture(cell = false) {
  const doc = new SwDoc();
  docs.push(doc);
  const node = cell
    ? doc.nodes
        .AppendTableRow(doc.nodes.MakeTableNode("Query"), 1)
        .GetTabBoxes()[0]
        ?.GetParagraphs()[0]
    : doc.paragraphs[0];
  if (node === undefined) throw Error("Missing original content");
  node.SetText("abcdef");
  const root = new SwRootFrame(
    /** Borrows the original document. @returns Native document. */ () => doc,
  );
  roots.push(root);
  return { doc, node, root };
}
/** Registers an original native fragment on the supplied source node and root. @param owners - Original owners. @param start - Native start. @param end - Native end. @param root - Original layout. @returns Actual registered fragment. */
function fragment(
  owners: ReturnType<typeof fixture>,
  start: number,
  end: number,
  root = owners.root,
) {
  const frame = new SwTextFrame(
    owners.node,
    "device",
    start,
    end,
    0,
    [{ start, end, height: 300 }],
    root,
  );
  frames.push(frame);
  return frame;
}
it.each([false, true])(
  "body/cell lookup borrows the actual first matching master cell=%s",
  /** Checks original owner identity and both optional query arguments. @param cell - Native cell context. @returns Nothing. */ (
    cell,
  ) => {
    const f = fixture(cell);
    expect(f.node.getLayoutFrame()).toBeUndefined();
    const client = new SwClient();
    clients.push(client);
    client.RegisterToModify(f.node);
    const otherType = new OriginalFrame(f.node, f.root);
    frames.push(otherType);
    const earlier = fragment(f, 0, 6),
      later = fragment(f, 0, 6);
    // Native SwModify::Add inserts after the anchor; later qualifying clients precede earlier ones.
    expect(f.node.getLayoutFrame()).toBe(later);
    expect(f.node.getLayoutFrame(f.root)).toBe(later);
    expect(GetFrameOfModify(f.root, f.node, SwFrameType.None)).toBeUndefined();
    expect(earlier.GetRegisteredIn()).toBe(f.node);
    SwFrame.DestroyFrame(later);
    expect(f.node.getLayoutFrame(f.root)).toBe(earlier);
    expect(later.GetRegisteredIn()).toBeUndefined();
    SwFrame.DestroyFrame(earlier);
    expect(f.node.getLayoutFrame()).toBeUndefined();
  },
);
it("root filter uses actual same-document roots and admits an absent root filter", /** Checks native root identity without document aliases. @returns Nothing. */ () => {
  const f = fixture(),
    other = new SwRootFrame(
      /** Borrows the same original document. @returns Native document. */ () => f.doc,
    );
  roots.push(other);
  const first = fragment(f, 0, 6, other),
    second = fragment(f, 0, 6);
  expect(f.node.getLayoutFrame()).toBe(first);
  expect(f.node.getLayoutFrame(other)).toBe(first);
  expect(f.node.getLayoutFrame(f.root)).toBe(second);
  const foreign = fixture();
  expect(f.node.getLayoutFrame(foreign.root)).toBeUndefined();
  expect(foreign.node.getLayoutFrame(f.root)).toBeUndefined();
});
it("follow registered before its master is excluded from first-match admission", /** Checks a real reversed registration order and position routing. @returns Nothing. */ () => {
  const f = fixture(),
    follow = fragment(f, 3, 6),
    master = fragment(f, 0, 3);
  master.SetFollow(follow);
  expect(f.node.getLayoutFrame(f.root)).toBe(master);
  const position = new SwPosition(f.node, 4);
  try {
    expect(f.node.getLayoutFrame(f.root, position)).toBe(follow);
    expect(GetFrameOfModify(undefined, f.node, SwFrameType.Txt, position)).toBe(follow);
    expect(position.GetNode()).toBe(f.node);
    expect(position.GetContentIndex()).toBe(4);
  } finally {
    position.Dispose();
  }
});
it.each<[number, boolean, number]>([
  [0, false, 0],
  [2, false, 0],
  [3, false, 3],
  [3, true, 0],
  [4, true, 3],
  [6, false, 3],
])(
  "original position offset=%s right-affinity=%s borrows frame start=%s",
  /** Checks literal source ties over actual native links. @param offset - Original model index. @param affinity - Native boundary ambiguity. @param expected - Literal original frame start. @returns Nothing. */ (
    offset,
    affinity,
    expected,
  ) => {
    const f = fixture(),
      master = fragment(f, 0, 3),
      follow = fragment(f, 3, 6);
    master.SetFollow(follow);
    SwTextCursor.SetRightMargin(affinity);
    const position = new SwPosition(f.node, offset);
    try {
      const selected = f.node.getLayoutFrame(f.root, position) as SwTextFrame | undefined;
      expect(selected).toBe(expected === 0 ? master : follow);
      expect(selected?.GetOffset()).toBe(expected);
      expect(selected?.GetRegisteredIn()).toBe(f.node);
      expect(position.GetContentIndex()).toBe(offset);
      expect(SwTextCursor.IsRightMargin()).toBe(affinity);
    } finally {
      position.Dispose();
    }
  },
);
it("a non-text qualifying frame ignores model-position routing", /** Checks the source type-mask branch on a real root client. @returns Nothing. */ () => {
  const f = fixture(),
    position = new SwPosition(f.node, 3);
  try {
    expect(GetFrameOfModify(undefined, f.root.GetFormat(), SwFrameType.Root, position)).toBe(
      f.root,
    );
    expect(GetFrameOfModify(undefined, f.root.GetFormat(), SwFrameType.Root)).toBe(f.root);
    expect(
      GetFrameOfModify(f.root, f.root.GetFormat(), SwFrameType.Root | SwFrameType.Txt, position),
    ).toBe(f.root);
    expect(GetFrameOfModify(f.root, f.node, SwFrameType.Txt, position)).toBeUndefined();
  } finally {
    position.Dispose();
  }
});
it("native pagination publishes queryable original owners and retained follows without cursor measurement publication", /** Checks actual formatter consumers and lookup stability through reflow and close. @returns Nothing. */ () => {
  const f = fixture(),
    page = {
      ...createDefaultWriterPageDescriptor("en-GB").GetValue(),
      height: 1000,
      topMargin: 100,
      bottomMargin: 100,
    },
    info = new SwLineNumberInfo().QueryValue(),
    measurements = [
      {
        id: "body",
        lines: [
          { start: 0, end: 3, height: 500 },
          { start: 3, end: 6, height: 500 },
        ],
      },
    ];
  const first = f.root.Format(measurements, page, undefined, info),
    master = first.pages[0]?.textFrames[0],
    follow = first.pages[1]?.textFrames[0];
  expect(f.node.getLayoutFrame(f.root)).toBe(master);
  const position = new SwPosition(f.node, 4);
  try {
    expect(f.node.getLayoutFrame(f.root, position)).toBe(follow);
    f.root.Invalidate();
    const retained = f.root.Format(measurements, page, undefined, info);
    expect(retained.pages[0]?.textFrames[0]).toBe(master);
    expect(f.node.getLayoutFrame(f.root, position)).toBe(follow);
    const next = f.root.Format(
      [{ id: "body", lines: [{ start: 0, end: 6, height: 300 }] }],
      page,
      undefined,
      info,
      1,
    );
    expect(f.node.getLayoutFrame(f.root, position)).toBe(next.pages[0]?.textFrames[0]);
    expect(master?.IsInDtor()).toBe(true);
    expect(follow?.IsInDtor()).toBe(true);
    f.root.DestroyImpl();
    expect(f.node.getLayoutFrame(f.root, position)).toBeUndefined();
  } finally {
    position.Dispose();
  }
});
