/** @fileoverview Checks original native unmerged positions, reciprocal frame master lookup and actual margin adjacency without upstream execution. */
import { afterEach, expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwPaM, SwPosition } from "../crsr/pam";
import { SwTextFrame, type SwTextLine } from "./txtfrm";
import { SwTextCursor } from "./itrtxt";
import { SwTextSizeInfo } from "./inftxt";
import { GetAdjFrameAtPos } from "./frmcrsr";
import type { SwFlowFrame } from "../layout/flowfrm";
const frames: SwTextFrame[] = [];
/** Exposes only the actual protected native component for explicit corrupt-link defensive probes; no methods are replaced. */
class OriginalTextFrame extends SwTextFrame {
  /** Reads the actual original native flow component. @returns Original component. */
  public GetNativeFlow(): SwFlowFrame {
    return this.flow;
  }
}
/** Constructs initialized original frame owners and native device lines. @returns Actual owners. */
function fixture() {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  if (node === undefined) throw Error("Missing source");
  node.SetText("abc   defghi");
  const make =
    /** Creates one original frame over the original node. @param start - Fragment start. @param end - Fragment end. @param lines - Original device lines. @returns Native frame. */ (
      start: number,
      end: number,
      lines: readonly SwTextLine[] = [{ start, end, height: 100 }],
    ) => {
      const frame = new OriginalTextFrame(node, "native", start, end, 0, lines);
      frames.push(frame);
      return frame;
    };
  const master = make(0, 6),
    follow = make(6, 9),
    last = make(9, 12);
  master.SetFollow(follow);
  follow.SetFollow(last);
  return { doc, node, master, follow, last, make };
}
afterEach(
  /** Releases actual clients and static affinity. @returns Nothing. */ () => {
    for (const frame of frames.splice(0)) frame.DestroyImpl();
    SwTextCursor.SetRightMargin(false);
  },
);
it("native unmerged mappings preserve original text index and registered node identity", /** Checks actual mapping and source unmerged foreign-node argument behavior. @returns Nothing. */ () => {
  const f = fixture(),
    other = new SwDoc().paragraphs[0];
  if (other === undefined) throw Error("Missing other original");
  expect(f.follow.GetText()).toBe("abc   defghi");
  expect(f.follow.MapViewToModel(8)).toEqual([f.node, 8]);
  expect(f.follow.MapModelToView(f.node, 8)).toBe(8);
  expect(f.follow.MapModelToView(other, 2)).toBe(2);
  expect(f.node.HasAnyContentIndex()).toBe(false);
  const mapped = f.follow.MapViewToModelPos(8);
  expect(mapped.GetNode()).toBe(f.node);
  expect(mapped.GetContentIndex()).toBe(8);
  expect(f.follow.MapModelToViewPos(mapped)).toBe(8);
  expect(f.node.HasAnyContentIndex()).toBe(true);
  mapped.Dispose();
  expect(f.node.HasAnyContentIndex()).toBe(false);
  const info = new SwTextSizeInfo(f.follow);
  f.node.SetText("ABC   defghi");
  expect(f.follow.GetText()).toBe("ABC   defghi");
  expect(info.GetText()).toBe("ABC   defghi");
  expect(info.GetChar(0)).toBe("A");
  expect(
    /** Checks rejected out-of-node mapped position. @returns Invalid native position. */ () =>
      f.follow.MapViewToModelPos(13),
  ).toThrow("outside its node");
  expect(f.node.HasAnyContentIndex()).toBe(false);
});
it("native FindMaster follows reciprocal original predecessors and detects broken native links", /** Checks source fallback guards using original-state corruption only. @returns Nothing. */ () => {
  const f = fixture();
  expect(f.master.FindMaster()).toBeUndefined();
  expect(f.follow.FindMaster()).toBe(f.master);
  expect(f.last.FindMaster()).toBe(f.follow);
  Reflect.set(f.master.GetNativeFlow(), "m_pFollow", undefined);
  expect(f.follow.GetPrecede()).toBe(f.master);
  expect(f.follow.FindMaster()).toBeUndefined();
  Reflect.set(f.master.GetNativeFlow(), "m_pFollow", f.last.GetNativeFlow());
  expect(f.follow.FindMaster()).toBeUndefined();
  Reflect.set(f.master.GetNativeFlow(), "m_pFollow", f.follow.GetNativeFlow());
  expect(f.follow.FindMaster()).toBe(f.master);
});
it.each([
  { offset: 0, right: false, target: "master" },
  { offset: 2, right: true, target: "master" },
  { offset: 6, right: false, target: "follow" },
  { offset: 6, right: true, target: "master" },
  { offset: 8, right: false, target: "follow" },
  { offset: 9, right: false, target: "last" },
  { offset: 9, right: true, target: "follow" },
  { offset: 12, right: false, target: "last" },
] as const)(
  "native adjacent frame at $offset affinity=$right selects $target",
  /** Checks literal original frame identity for source position ties. @param example - Native case. @returns Nothing. */ (
    example,
  ) => {
    const f = fixture(),
      position = new SwPosition(f.node, example.offset);
    try {
      SwTextCursor.SetRightMargin(example.right);
      expect(GetAdjFrameAtPos(f.master, position, example.right)).toBe(f[example.target]);
    } finally {
      position.Dispose();
    }
    expect(f.node.HasAnyContentIndex()).toBe(false);
  },
);
it("native right-margin adjacency walks original zero-length follows back to its master", /** Checks direct follow start and source original-position equality. @returns Nothing. */ () => {
  const f = fixture(),
    empty = f.make(6, 6),
    position = new SwPosition(f.node, 6);
  f.master.SetFollow(empty);
  empty.SetFollow(f.follow);
  try {
    SwTextCursor.SetRightMargin(true);
    expect(GetAdjFrameAtPos(f.follow, position, true)).toBe(f.master);
    SwTextCursor.SetRightMargin(false);
    expect(GetAdjFrameAtPos(f.follow, position, false)).toBe(f.follow);
  } finally {
    position.Dispose();
  }
  expect(f.node.HasAnyContentIndex()).toBe(false);
});
it("native lost-master fallback retains the original follow without leaking temporary positions", /** Checks source lost-link fallback on actual original objects. @returns Nothing. */ () => {
  const f = fixture(),
    position = new SwPosition(f.node, 6);
  Reflect.set(f.master.GetNativeFlow(), "m_pFollow", undefined);
  try {
    SwTextCursor.SetRightMargin(true);
    expect(GetAdjFrameAtPos(f.follow, position, true)).toBe(f.follow);
  } finally {
    position.Dispose();
  }
  expect(f.node.HasAnyContentIndex()).toBe(false);
});
it("native adjacency compares original model owners rather than equal foreign indices", /** Checks source model-position equality against an actual other owner. @returns Nothing. */ () => {
  const f = fixture(),
    other = new SwDoc().paragraphs[0];
  if (other === undefined) throw Error("Missing other");
  other.SetText("abcdefghi");
  const position = new SwPosition(other, 6);
  try {
    SwTextCursor.SetRightMargin(true);
    expect(GetAdjFrameAtPos(f.follow, position, true)).toBe(f.follow);
  } finally {
    position.Dispose();
  }
  expect(f.node.HasAnyContentIndex()).toBe(false);
  expect(other.HasAnyContentIndex()).toBe(false);
});
it("native actual margin operations choose original follows and release every mapped position", /** Checks literal soft spaces, API end and direct follow Home over native PaM. @returns Nothing. */ () => {
  const f = fixture(),
    point = new SwPosition(f.node, 8),
    pam = new SwPaM(point);
  point.Dispose();
  try {
    expect(f.master.LeftMargin(pam)).toBe(true);
    expect(pam.GetPoint().GetContentIndex()).toBe(6);
    expect(pam.GetPoint().GetNode()).toBe(f.node);
    pam.GetPoint().Assign(f.node, 2);
    expect(f.master.RightMargin(pam)).toBe(true);
    expect(pam.GetPoint().GetContentIndex()).toBe(3);
    pam.GetPoint().Assign(f.node, 2);
    expect(f.master.RightMargin(pam, true)).toBe(true);
    expect(pam.GetPoint().GetContentIndex()).toBe(6);
    SwTextCursor.SetRightMargin(true);
    expect(f.follow.LeftMargin(pam)).toBe(true);
    expect(pam.GetPoint().GetContentIndex()).toBe(0);
  } finally {
    pam.Dispose();
  }
  expect(f.node.HasAnyContentIndex()).toBe(false);
});
it("native selected follow without formatted paragraph retains caller rejection", /** Checks missing target paragraph instead of the initially supplied master. @returns Nothing. */ () => {
  const f = fixture(),
    unformatted = f.make(6, 12, []);
  f.master.SetFollow(unformatted);
  const point = new SwPosition(f.node, 8),
    pam = new SwPaM(point);
  point.Dispose();
  try {
    expect(f.master.LeftMargin(pam)).toBe(false);
    expect(pam.GetPoint().GetContentIndex()).toBe(8);
  } finally {
    pam.Dispose();
  }
  expect(f.node.HasAnyContentIndex()).toBe(false);
});
