/** @fileoverview Native SwNodeRange constructors, unnormalized endpoints, registered member copies/assignment and destruction over the actual Writer node array. */
import { assert, expect, it, vi } from "vitest";
import { SwNodeRange, SwNodeIndex } from "./ndindex";
import { SwNodeIndex as OriginalIndex } from "../source/core/crsr/pam";
import { SwDoc } from "../source/core/doc/doc";
/** Creates real body nodes with distinct identities. @returns Native owners. */
function fixture() {
  const doc = new SwDoc(),
    a = doc.paragraphs[0];
  assert(a);
  a.SetText("a");
  const b = doc.GetNodes().MakeTextNode("b"),
    c = doc.GetNodes().MakeTextNode("c");
  return { doc, a, b, c, nodes: doc.GetNodes() };
}
it("reexports the one actual native index class", /** The header owner adds no substitute index implementation. @returns Nothing. */ () => {
  expect(SwNodeIndex).toBe(OriginalIndex);
});
it("node-pair constructor owns distinct member indices and retains reversed endpoints", /** The original value does not sort the range. @returns Nothing. */ () => {
  const x = fixture(),
    range = new SwNodeRange(x.c, x.a);
  try {
    expect(range.aStart.GetNode()).toBe(x.c);
    expect(range.aEnd.GetNode()).toBe(x.a);
    expect(range.aStart).not.toBe(range.aEnd);
  } finally {
    range.Dispose();
    x.doc.Dispose();
  }
});
it("index-pair constructor copies values instead of retaining input indices", /** Later input reassignment cannot change the range members. @returns Nothing. */ () => {
  const x = fixture(),
    start = new SwNodeIndex(x.a),
    end = new SwNodeIndex(x.c),
    range = new SwNodeRange(start, end);
  try {
    expect(range.aStart).not.toBe(start);
    expect(range.aEnd).not.toBe(end);
    start.Assign(x.b);
    end.Assign(x.a);
    expect(range.aStart.GetNode()).toBe(x.a);
    expect(range.aEnd.GetNode()).toBe(x.c);
  } finally {
    range.Dispose();
    end.Dispose();
    start.Dispose();
    x.doc.Dispose();
  }
});
it("implicit copy owns two fresh indices at the same actual nodes", /** Source member reassignment does not move the copied value. @returns Nothing. */ () => {
  const x = fixture(),
    source = new SwNodeRange(x.a, x.c),
    copy = new SwNodeRange(source);
  try {
    expect(copy.aStart).not.toBe(source.aStart);
    expect(copy.aEnd).not.toBe(source.aEnd);
    source.aStart.Assign(x.b);
    source.aEnd.Assign(x.b);
    expect(copy.aStart.GetNode()).toBe(x.a);
    expect(copy.aEnd.GetNode()).toBe(x.c);
  } finally {
    copy.Dispose();
    source.Dispose();
    x.doc.Dispose();
  }
});
it("array constructor retains original absolute positions and end-default zero", /** The end-default is the actual node-array root, not the content end. @returns Nothing. */ () => {
  const x = fixture(),
    range = new SwNodeRange(x.nodes, x.b.GetIndex()),
    explicit = new SwNodeRange(x.nodes, x.a.GetIndex(), x.c.GetIndex());
  try {
    expect(range.aStart.GetNode()).toBe(x.b);
    expect(range.aEnd.GetNode()).toBe(x.nodes.at(0));
    expect(explicit.aStart.GetNode()).toBe(x.a);
    expect(explicit.aEnd.GetNode()).toBe(x.c);
  } finally {
    explicit.Dispose();
    range.Dispose();
    x.doc.Dispose();
  }
});
it("relative node overload preserves signed offsets and source default end offset", /** The actual source fly-creation form can address the node preceding a fixed sentinel. @returns Nothing. */ () => {
  const x = fixture(),
    range = new SwNodeRange(x.b, -1, x.c),
    shifted = new SwNodeRange(x.a, 1, x.c, -1);
  try {
    expect(range.aStart.GetNode()).toBe(x.a);
    expect(range.aEnd.GetNode()).toBe(x.c);
    expect(shifted.aStart.GetNode()).toBe(x.b);
    expect(shifted.aEnd.GetNode()).toBe(x.b);
  } finally {
    shifted.Dispose();
    range.Dispose();
    x.doc.Dispose();
  }
});
it("relative index overload copies each original base before applying signed offsets", /** Inputs remain borrowed and unchanged. @returns Nothing. */ () => {
  const x = fixture(),
    first = new SwNodeIndex(x.b),
    last = new SwNodeIndex(x.c),
    range = new SwNodeRange(first, -1, last, -1),
    defaults = new SwNodeRange(first, 0, last);
  try {
    expect(range.aStart.GetNode()).toBe(x.a);
    expect(range.aEnd.GetNode()).toBe(x.b);
    expect(defaults.aStart.GetNode()).toBe(x.b);
    expect(defaults.aEnd.GetNode()).toBe(x.c);
    expect(first.GetNode()).toBe(x.b);
    expect(last.GetNode()).toBe(x.c);
  } finally {
    defaults.Dispose();
    range.Dispose();
    last.Dispose();
    first.Dispose();
    x.doc.Dispose();
  }
});
it("member assignment retains existing target index identities including self assignment", /** Original implicit assignment is index-value assignment rather than member replacement. @returns Nothing. */ () => {
  const x = fixture(),
    target = new SwNodeRange(x.c, x.a),
    source = new SwNodeRange(x.a, x.b),
    start = target.aStart,
    end = target.aEnd;
  try {
    expect(target.Assign(source)).toBe(target);
    expect(target.aStart).toBe(start);
    expect(target.aEnd).toBe(end);
    expect(start.GetNode()).toBe(x.a);
    expect(end.GetNode()).toBe(x.b);
    target.Assign(target);
    expect(target.aStart).toBe(start);
    expect(target.aEnd).toBe(end);
  } finally {
    source.Dispose();
    target.Dispose();
    x.doc.Dispose();
  }
});
it("native node insertion changes offsets while retained endpoint identities remain stable", /** Range members are actual node indices, not offset snapshots. @returns Nothing. */ () => {
  const x = fixture(),
    range = new SwNodeRange(x.a, x.c),
    before = range.aEnd.GetIndex();
  try {
    x.nodes.MakeTextNode(x.c, x.doc.GetDfltTextFormatColl());
    expect(range.aEnd.GetNode()).toBe(x.c);
    expect(range.aEnd.GetIndex()).toBe(before + 1);
    expect(range.aStart.GetNode()).toBe(x.a);
  } finally {
    range.Dispose();
    x.doc.Dispose();
  }
});
it("native removal corrects a member index to the actual first surviving node", /** Original DelNodes consumes the same registered index as its input. @returns Nothing. */ () => {
  const x = fixture(),
    range = new SwNodeRange(x.a, x.c);
  try {
    x.nodes.DelNodes(range.aStart);
    expect(range.aStart.GetNode()).toBe(x.b);
    expect(range.aEnd.GetNode()).toBe(x.c);
  } finally {
    range.Dispose();
    x.doc.Dispose();
  }
});
it("member destruction unlinks end then start without destroying nodes", /** Call-through index destructor spies observe the original reverse declaration order. @returns Nothing. */ () => {
  const x = fixture(),
    range = new SwNodeRange(x.a, x.c),
    start = vi.spyOn(range.aStart, "Dispose"),
    end = vi.spyOn(range.aEnd, "Dispose"),
    count = x.nodes.Count();
  range.Dispose();
  expect(start).toHaveBeenCalledTimes(1);
  expect(end).toHaveBeenCalledTimes(1);
  expect(end.mock.invocationCallOrder[0]).toBeLessThan(start.mock.invocationCallOrder[0] as number);
  expect(x.nodes.Count()).toBe(count);
  start.mockRestore();
  end.mockRestore();
  x.doc.Dispose();
});
