/** @fileoverview Verifies upstream-derived SwContentIndex correction across Writer text and node mutations. */

import { describe, expect, it } from "vitest";

import { SwDoc } from "../doc/doc";
import { SwPaM, SwPosition } from "../crsr/pam";
import type { SwTextNode } from "../txtnode/ndtxt";
import { SwContentIndex, SwContentIndexUpdateMode } from "./contentindex";

/** Creates a three-paragraph Writer model with deterministic text. @returns Writer fixture. */
function createIndexFixture(): SwDoc {
  const document = new SwDoc("p-1");
  (document.paragraphs[0] as SwTextNode).InsertText("abcdef", 0);
  document.nodes.MakeTextNode("p-2", "middle");
  document.nodes.MakeTextNode("p-3", "last");
  return document;
}

describe("SwContentIndex" /** Groups registered-position correction tests. @returns Nothing. */, function defineContentIndexTests(): void {
  it("validates registry operations and explicit index lifetime" /** Covers bounded update inputs, duplicate registration, affinity, and disposal. @returns Nothing. */, function validatesRegistryOperations(): void {
    const document = createIndexFixture();
    const node = document.paragraphs[0] as SwTextNode;
    const index = new SwContentIndex(node);
    expect(node.HasAnyContentIndex()).toBe(true);
    expect(index.GetContentNode()).toBe(node);
    node.RegisterContentIndex(index);
    index.SetAffinity("before");
    node.UpdateContentIndices(0, 1);
    expect(index.GetIndex()).toBe(0);
    node.UpdateContentIndices(0, 0, SwContentIndexUpdateMode.Delete);
    node.MoveAllContentIndicesTo(node);
    for (const [position, length] of [
      [-1, 1],
      [0.5, 1],
      [0, -1],
      [0, 0.5],
    ] as const)
      expect(
        /** Applies one invalid registry update. @returns Invalid result. */ () =>
          node.UpdateContentIndices(position, length),
      ).toThrow("non-negative integer");
    expect(
      /** Assigns a negative position. @returns Invalid result. */ () => index.Assign(node, -1),
    ).toThrow("outside its node");
    expect(
      /** Assigns a fractional position. @returns Invalid result. */ () => index.Assign(node, 0.5),
    ).toThrow("outside its node");
    node.UnregisterContentIndex(index);
    node.UnregisterContentIndex(index);
    expect(node.HasAnyContentIndex()).toBe(false);
    index.Dispose();
    expect(
      /** Reads a disposed index node. @returns Invalid result. */ () => index.GetContentNode(),
    ).toThrow("disposed");
  });

  it("updates live owner kinds at insertion and deletion boundaries" /** Covers upstream Default and Negative update modes plus deterministic affinity. @returns Nothing. */, function updatesTextBoundaries(): void {
    const document = createIndexFixture();
    const node = document.paragraphs[0] as SwTextNode;
    const before = new SwPosition(node, 2, "anchor", "before");
    const cursor = new SwPosition(node, 2, "cursor", "after");
    const mark = new SwPosition(node, 3, "mark");
    const redline = new SwPosition(node, 6, "redline");
    expect(before.nContent.GetOwnerKind()).toBe("anchor");
    expect(redline.nContent.GetOwnerKind()).toBe("redline");

    node.InsertText("XY", 2);
    expect(before.GetContentIndex()).toBe(2);
    expect(cursor.GetContentIndex()).toBe(4);
    expect(mark.GetContentIndex()).toBe(5);
    expect(redline.GetContentIndex()).toBe(8);

    node.EraseText(1, 4);
    expect(before.GetContentIndex()).toBe(1);
    expect(cursor.GetContentIndex()).toBe(1);
    expect(mark.GetContentIndex()).toBe(1);
    expect(redline.GetContentIndex()).toBe(4);
  });

  it("preserves point and mark direction while correcting a live PaM" /** Ensures shell-specific cursor restoration is unnecessary for ordinary erasure. @returns Nothing. */, function preservesSelectionDirection(): void {
    const document = createIndexFixture();
    const node = document.paragraphs[0] as SwTextNode;
    const backward = new SwPaM(new SwPosition(node, 1), new SwPosition(node, 5));
    const point = backward.GetPoint();
    const mark = backward.GetMark();

    node.EraseText(2, 2);

    expect(backward.GetPoint()).toBe(point);
    expect(backward.GetMark()).toBe(mark);
    expect(backward.GetPoint().GetContentIndex()).toBe(1);
    expect(backward.GetMark().GetContentIndex()).toBe(3);
    expect(backward.Start()).toBe(point);
    expect(backward.End()).toBe(mark);
  });

  it("keeps a position registered in its original node after an invalid assignment" /** Verifies node and content identity change atomically. @returns Nothing. */, function rejectsInvalidAssignmentAtomically(): void {
    const document = createIndexFixture();
    const first = document.paragraphs[0] as SwTextNode;
    const second = document.paragraphs[1] as SwTextNode;
    const position = new SwPosition(first, 2, "anchor");

    expect(
      /** Attempts an out-of-range cross-node assignment. @returns Invalid result. */ () =>
        position.Assign(second, second.Len() + 1),
    ).toThrow("outside its node");
    expect(position.GetNode()).toBe(first);
    expect(position.GetContentIndex()).toBe(2);
  });

  it("uses LibreOffice's length-difference correction for replacement" /** Covers short, equal, and long ReplaceText updates without collapsing unaffected positions. @returns Nothing. */, function updatesReplacementDifference(): void {
    const document = createIndexFixture();
    const node = document.paragraphs[0] as SwTextNode;
    const inside = new SwPosition(node, 2, "mark");
    const boundary = new SwPosition(node, 4, "cursor");
    const after = new SwPosition(node, 5, "redline");

    node.ReplaceRange(1, 4, [{ attributes: {}, text: "XY" }]);
    expect(inside.GetContentIndex()).toBe(2);
    expect(boundary.GetContentIndex()).toBe(3);
    expect(after.GetContentIndex()).toBe(4);

    node.ReplaceRange(1, 2, [{ attributes: {}, text: "123" }]);
    expect(inside.GetContentIndex()).toBe(4);
    expect(boundary.GetContentIndex()).toBe(5);
    expect(after.GetContentIndex()).toBe(6);
  });

  it("moves registered indices across split, merge, replacement, and removal" /** Covers node transfer and deterministic fallback correction. @returns Nothing. */, function transfersBetweenNodes(): void {
    const document = createIndexFixture();
    const first = document.paragraphs[0] as SwTextNode;
    const splitBefore = new SwPosition(first, 3, "anchor", "before");
    const splitAfter = new SwPosition(first, 3, "cursor", "after");
    const suffix = new SwPosition(first, 5, "redline");
    const trailing = first.SplitContent(3, "p-split");
    document.nodes.insertTextNodeAfter(first, trailing);

    expect(splitBefore.GetNode()).toBe(first);
    expect(splitBefore.GetContentIndex()).toBe(3);
    expect(splitAfter.GetNode()).toBe(trailing);
    expect(splitAfter.GetContentIndex()).toBe(0);
    expect(suffix.GetNode()).toBe(trailing);
    expect(suffix.GetContentIndex()).toBe(2);

    first.AppendTextNode(trailing);
    document.nodes.removeTextNode(trailing);
    expect(splitAfter.GetNode()).toBe(first);
    expect(splitAfter.GetContentIndex()).toBe(3);
    expect(suffix.GetContentIndex()).toBe(5);

    const middle = document.nodes.findTextNode("p-2") as SwTextNode;
    const middlePosition = new SwPosition(middle, 4, "mark");
    document.nodes.removeTextNode(middle);
    expect(middlePosition.GetNode()).toBe(document.nodes.findTextNode("p-3"));
    expect(middlePosition.GetContentIndex()).toBe(0);

    const last = document.nodes.findTextNode("p-3") as SwTextNode;
    const lastPosition = new SwPosition(last, 2, "anchor");
    document.nodes.removeTextNode(last);
    expect(lastPosition.GetNode()).toBe(first);
    expect(lastPosition.GetContentIndex()).toBe(first.Len());
  });
});
