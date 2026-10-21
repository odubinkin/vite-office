/** @fileoverview Literal source contracts for SwTextNode::ReplaceText, distinct from fragment insertion/deletion. */
import { expect, it, vi } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwPosition } from "../crsr/pam";
import { SwContentIndexUpdateMode } from "../bastyp/index";
import type { SwTextNode } from "./ndtxt";

/** Authors a real node with one actual native attribute. @returns Original owners. */
function fixture() {
  const doc = new SwDoc(),
    node = doc.paragraphs[0] as SwTextNode;
  node.SetText("abcdef");
  node.ToggleTextRangeFormat(1, 4, "bold");
  const hint = node.GetpSwpHints()?.Get(0);
  if (hint === undefined) throw Error("Missing native attribute");
  hint.SetDontExpand(true);
  return { doc, node, hint };
}
it.each([
  ["XYZ", "aXYZef", 4, 5, 1, 4],
  ["Q", "aQef", 2, 3, 1, 2],
  ["LONGER", "aLONGERef", 7, 8, 1, 7],
  ["", "aef", 1, 2, 1, 1],
] as const)(
  "native replacement %j retains source hint/index contracts",
  /** Checks raw text, live index advancement, original attribute identity and ignore flags. @param replacement - New string. @param text - Expected text. @param point - Supplied start's new offset. @param anchor - Neighbor offset. @param start - Native hint start. @param end - Native hint end. @returns Nothing. */ (
    replacement,
    text,
    point,
    anchor,
    start,
    end,
  ) => {
    const { node, hint } = fixture(),
      position = new SwPosition(node, 1),
      other = new SwPosition(node, 5, "anchor");
    try {
      node.ReplaceText(position, 3, replacement);
      expect(node.GetText()).toBe(text);
      expect(position.GetContentIndex()).toBe(point);
      expect(other.GetContentIndex()).toBe(anchor);
      expect(node.GetpSwpHints()?.Get(0)).toBe(hint);
      expect([
        hint.GetStart(),
        hint.GetAnyEnd(),
        hint.DontExpand(),
        node.IsIgnoreDontExpand(),
      ]).toEqual([start, end, true, false]);
    } finally {
      position.Dispose();
      other.Dispose();
    }
  },
);
it("updates only the native differential boundary and keeps equal-length interior attributes", /** Demonstrates why a preformatted-fragment replacement is a different operation. @returns Nothing. */ () => {
  const { node } = fixture();
  node.ToggleTextRangeFormat(2, 3, "italic");
  const hints = node
    .GetpSwpHints()
    ?.entries()
    .map(
      /** Captures actual coordinate pairs. @param hint - Attribute. @returns Coordinates. */ (
        hint,
      ) => [hint.GetStart(), hint.GetAnyEnd()],
    );
  const position = new SwPosition(node, 1),
    update = vi.spyOn(node, "UpdateContentIndices");
  try {
    node.ReplaceText(position.nContent, 3, "XYZ");
    expect(update).not.toHaveBeenCalled();
    expect(
      node
        .GetpSwpHints()
        ?.entries()
        .map(
          /** Reads actual unchanged coordinates. @param hint - Attribute. @returns Coordinates. */ (
            hint,
          ) => [hint.GetStart(), hint.GetAnyEnd()],
        ),
    ).toEqual(hints);
    node.ReplaceText(position, 1, "123");
    expect(update).toHaveBeenLastCalledWith(5, 2, SwContentIndexUpdateMode.Replace);
    expect(position.GetContentIndex()).toBe(7);
  } finally {
    update.mockRestore();
    position.Dispose();
  }
});
it("preserves caller ignore state, capacity truncation and empty replacement no-op", /** Uses the native capacity query as an explicit source branch fixture without allocating a multi-gigabyte node. @returns Nothing. */ () => {
  const { node } = fixture(),
    position = new SwPosition(node, 1);
  node.SetIgnoreDontExpand(true);
  const capacity = vi.spyOn(node, "GetSpaceLeft").mockReturnValue(0),
    notify = vi.spyOn(node.GetDoc(), "NotifyModelChange");
  try {
    node.ReplaceText(position, 3, "123456");
    expect(node.GetText()).toBe("a123ef");
    expect(node.IsIgnoreDontExpand()).toBe(true);
    notify.mockClear();
    position.SetContent(1);
    node.ReplaceText(position, 0, "");
    expect(notify).not.toHaveBeenCalled();
    capacity.mockRestore();
    expect(node.GetSpaceLeft()).toBe(0x7ffffffd - node.Len());
    const foreign = new SwPosition(new SwDoc().paragraphs[0] as SwTextNode);
    try {
      expect(
        /** Rejects foreign index ownership before mutation. @returns Nothing. */ () =>
          node.ReplaceText(foreign, 0, "x"),
      ).toThrow("own node");
    } finally {
      foreign.Dispose();
    }
    position.SetContent(node.Len());
    expect(
      /** Retains native ReplaceText's inside-node precondition. @returns Nothing. */ () =>
        node.ReplaceText(position, 0, "x"),
    ).toThrow("inside");
  } finally {
    capacity.mockRestore();
    notify.mockRestore();
    position.Dispose();
  }
});
