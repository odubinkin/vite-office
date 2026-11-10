/** @fileoverview Original SwPaM Move/default Chars, GoInNode and paragraph strategies over actual registered nodes, Unicode content indices and table sections. */
import { assert, expect, it, vi } from "vitest";
import { SwDoc } from "../doc/doc";
import {
  SwPaM,
  SwPosition,
  GoInNode,
  GoPrevPara,
  GoNextPara,
  GoCurrPara,
  fnMoveForward,
  fnMoveBackward,
  fnParaStart,
  fnParaEnd,
} from "./pam";
import { SwInsertTableFlags } from "../../../inc/itabenum";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
/** Actual body nodes and point/mark owners. @param text - Native body strings. @param nodeIndex - Actual initial node. @param offset - UTF16 content offset. @returns Owned real fixture. */
function fixture(text: readonly string[], nodeIndex = 0, offset = 0) {
  const doc = new SwDoc(),
    first = doc.paragraphs[0];
  assert(first);
  first.SetText(text[0] ?? "");
  for (const value of text.slice(1)) doc.nodes.MakeTextNode(value);
  const node = doc.paragraphs[nodeIndex];
  assert(node);
  const point = new SwPosition(node, offset),
    pam = new SwPaM(point);
  point.Dispose();
  pam.SetMark();
  return {
    doc,
    pam,
    node,
    /** Releases actual positions before the model. @returns Nothing. */ close() {
      pam.Dispose();
      doc.Dispose();
    },
  };
}
it.each([
  ["A\u0301", [1, 0]],
  ["\ud83d\ude00X", [2, 0]],
  ["\ude00X", [1, 0]],
  ["A\0B", [2, 1, 0]],
] as const)(
  "moves backward by original non-SKIPCELL code points in %s",
  /** Native Chars intentionally separates combining marks. @param text - Actual text. @param offsets - Original UTF16 results. @returns Nothing. */ (
    text,
    offsets,
  ) => {
    const x = fixture([text], 0, text.length),
      mark = x.pam.GetMark();
    for (const offset of offsets) {
      x.pam.SetInFrontOfLabel_(true);
      expect(x.pam.Move(fnMoveBackward)).toBe(true);
      expect(x.pam.GetPoint().GetContentIndex()).toBe(offset);
      expect(x.pam.GetMark()).toBe(mark);
      expect(mark.GetContentIndex()).toBe(text.length);
      expect(x.pam.IsInFrontOfLabel()).toBe(false);
    }
    x.pam.SetInFrontOfLabel_(true);
    expect(x.pam.Move(fnMoveBackward)).toBe(false);
    expect(x.pam.IsInFrontOfLabel()).toBe(false);
    x.close();
  },
);
it("goes to the previous content end rather than GoPreviousPos's zero offset", /** Explicit GoInNode moves even from the middle of the current paragraph. @returns Nothing. */ () => {
  const x = fixture(["previous", "current"], 1, 3),
    mark = x.pam.GetMark();
  expect(x.pam.Move(fnMoveBackward, GoInNode)).toBe(true);
  expect(x.pam.GetPoint().GetNode()).toBe(x.doc.paragraphs[0]);
  expect(x.pam.GetPoint().GetContentIndex()).toBe(8);
  expect(mark.GetNode()).toBe(x.node);
  expect(mark.GetContentIndex()).toBe(3);
  x.close();
});
it("moves from the actual post-table paragraph into its final cell and across real cell sections", /** Required by the original HTML first-table context after document insertion. @returns Nothing. */ () => {
  const x = fixture([""]),
    table = x.doc.InsertTable(
      { mnInsMode: SwInsertTableFlags.All, mnRowsToRepeat: 1 },
      x.pam.GetPoint(),
      1,
      2,
      HoriOrientation.FULL,
    );
  assert(table);
  const [left, right] = table.GetTabLines()[0]?.GetTabBoxes() ?? [],
    a = left?.GetParagraphs()[0],
    b = right?.GetParagraphs()[0];
  assert(a && b);
  a.SetText("left");
  b.SetText("right");
  expect(x.pam.Move(fnMoveBackward)).toBe(true);
  expect(x.pam.GetPoint().GetNode()).toBe(b);
  expect(x.pam.GetPoint().GetContentIndex()).toBe(5);
  x.pam.GetPoint().SetContent(0);
  expect(x.pam.Move(fnMoveBackward)).toBe(true);
  expect(x.pam.GetPoint().GetNode()).toBe(a);
  expect(x.pam.GetPoint().GetContentIndex()).toBe(4);
  x.pam.GetPoint().SetContent(0);
  expect(x.pam.Move(fnMoveBackward)).toBe(false);
  expect(x.pam.GetPoint().GetNode()).toBe(a);
  x.pam.GetPoint().Assign(x.node, 0);
  x.doc.nodes.DeleteTable(table.GetTableNode());
  x.close();
});
it.each([false, true])(
  "releases the actual transient node index after success or failure: %s",
  /** Observes original registration/unlink calls without retaining or reading a disposed index. @param success - Whether a next node exists. @returns Nothing. */ (
    success,
  ) => {
    const x = fixture(success ? ["", "next"] : [""]),
      registered = vi.spyOn(x.node, "RegisterNodeIndex"),
      target = success ? x.doc.paragraphs[1] : x.node;
    assert(target);
    const removed = vi.spyOn(target, "DeRegisterNodeIndex");
    expect(x.pam.Move(fnMoveForward, GoInNode)).toBe(success);
    const reference = registered.mock.calls[0]?.[0];
    assert(reference);
    expect(removed).toHaveBeenCalledWith(reference);
    registered.mockRestore();
    removed.mockRestore();
    x.close();
  },
);
it.each([
  [GoPrevPara, fnParaStart, 0, 0],
  [GoPrevPara, fnParaEnd, 0, 3],
  [GoNextPara, fnParaStart, 2, 0],
  [GoNextPara, fnParaEnd, 2, 5],
] as const)(
  "uses the original paragraph movement/edge pair %s",
  /** Direction and edge aliases are independent original inputs. @param strategy - Original function. @param edge - Original alias. @param nodeIndex - Expected body node. @param offset - Expected original edge. @returns Nothing. */ (
    strategy,
    edge,
    nodeIndex,
    offset,
  ) => {
    const x = fixture(["one", "two", "three"], 1, 1),
      mark = x.pam.GetMark();
    expect(fnParaStart).toBe(fnMoveForward);
    expect(fnParaEnd).toBe(fnMoveBackward);
    expect(x.pam.Move(edge, strategy)).toBe(true);
    expect(x.pam.GetPoint().GetNode()).toBe(x.doc.paragraphs[nodeIndex]);
    expect(x.pam.GetPoint().GetContentIndex()).toBe(offset);
    expect(mark.GetNode()).toBe(x.node);
    expect(mark.GetContentIndex()).toBe(1);
    x.close();
  },
);
it.each([fnParaStart, fnParaEnd])(
  "moves to the current edge, then crosses only at that same edge",
  /** Native GoCurrPara intentionally crosses to previous start or next end when already at the edge. @param edge - Original alias. @returns Nothing. */ (
    edge,
  ) => {
    const x = fixture(["one", "two", "three"], 1, 1),
      start = edge === fnParaStart;
    expect(x.pam.Move(edge, GoCurrPara)).toBe(true);
    expect(x.pam.GetPoint().GetNode()).toBe(x.node);
    expect(x.pam.GetPoint().GetContentIndex()).toBe(start ? 0 : 3);
    expect(x.pam.Move(edge, GoCurrPara)).toBe(true);
    expect(x.pam.GetPoint().GetNode()).toBe(x.doc.paragraphs[start ? 0 : 2]);
    expect(x.pam.GetPoint().GetContentIndex()).toBe(start ? 0 : 5);
    expect(x.pam.Move(edge, GoCurrPara)).toBe(false);
    x.close();
  },
);
it("does not treat an empty current paragraph as a completed edge move", /** Source equality guard immediately follows the selected adjacent paragraph. @returns Nothing. */ () => {
  const x = fixture(["before", "", "after"], 1, 0);
  expect(x.pam.Move(fnParaEnd, GoCurrPara)).toBe(true);
  expect(x.pam.GetPoint().GetNode()).toBe(x.doc.paragraphs[2]);
  expect(x.pam.GetPoint().GetContentIndex()).toBe(5);
  x.close();
});
it("dispatches a structural point through checked node movement without inventing a content owner", /** Original GoNd returns false for structural nodes, then GoInNode selects real content. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  node.SetText("body");
  const end = doc.nodes.GetEndOfContent(),
    point = new SwPosition(end),
    pam = new SwPaM(point);
  point.Dispose();
  pam.SetMark();
  expect(end.GetTextNode()).toBeNull();
  expect(node.GetTextNode()).toBe(node);
  expect(pam.Move(fnMoveForward)).toBe(false);
  expect(pam.Move(fnMoveBackward)).toBe(true);
  expect(pam.GetPoint().GetNode()).toBe(node);
  expect(pam.GetPoint().GetContentIndex()).toBe(4);
  expect(pam.GetMark().GetNode()).toBe(end);
  pam.Dispose();
  doc.Dispose();
});
