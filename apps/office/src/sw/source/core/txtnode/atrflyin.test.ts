/** @fileoverview Native inline fly format links, point offsets and item-pool defaults. */
import { assert, expect, it, vi } from "vitest";
import { RndStdIds } from "../../../../svx/inc/swframetypes";
import { SwFormatFlyCnt } from "../../../inc/fmtflcnt";
import { CH_TXTATR_BREAKWORD, RES_TXTATR_AUTOFMT, RES_TXTATR_FLYCNT } from "../../../inc/hintids";
import { SwTextFlyCnt } from "../../../inc/txtflcnt";
import { SwInsertFlags } from "../../../inc/IDocumentContentOperations";
import { SetAttrMode } from "../../../inc/swtypes";
import { SwPaM, SwPosition } from "../crsr/pam";
import { SwAttrIter } from "../text/itratr";
import { Graphic } from "../../../../vcl/source/gdi/graph";
import { Size } from "../../../../tools/inc/gen";
import type { SwTextNode } from "./ndtxt";
import { SwDoc } from "../doc/doc";
import { SwFormatCharFormat } from "./fmtatr2";
import { SwTextCharFormat } from "./txtatr2";
import {
  compareHints,
  compareHintsByEnd,
  compareHintsByWhichAndStart,
  hintPositionBound,
  hintWhichStartBound,
} from "./ndhints-range";
import { SwFormatAutoFormat } from "./txatbase";

it("registers the original empty, non-shareable inline fly item in Writer's pool", /** Exercises the real default package and ensures a cloned item borrows no text hint. @returns Nothing. */ () => {
  const document = new SwDoc();
  try {
    const item = document.GetAttrPool().GetUserOrPoolDefaultItem(RES_TXTATR_FLYCNT);
    assert(item instanceof SwFormatFlyCnt);
    expect(item.Which()).toBe(RES_TXTATR_FLYCNT);
    expect(item.isShareable()).toBe(false);
    expect(item.GetFrameFormat()).toBeNull();
    expect(item.GetTextFlyCnt()).toBeNull();
    const copied = item.Clone();
    try {
      expect(copied).not.toBe(item);
      expect(copied.isShareable()).toBe(false);
      expect(copied.GetFrameFormat()).toBeNull();
      expect(copied.GetTextFlyCnt()).toBeNull();
      expect(item.equals(copied)).toBe(false);
    } finally {
      copied.Dispose();
    }
  } finally {
    document.Dispose();
  }
});

it("binds an as-character format to the current UTF-16 dummy position", /** Checks point identity, native frame anchor and the Clone/SetFlyFormat contract. @returns Nothing. */ () => {
  const document = new SwDoc();
  const foreign = new SwDoc();
  const frame = document.MakeFlyFrameFormat("Inline picture", undefined);
  const secondFrame = document.MakeFlyFrameFormat("Another picture", undefined);
  const item = new SwFormatFlyCnt(frame);
  const unrelated = new SwFormatAutoFormat(RES_TXTATR_AUTOFMT);
  const hint = new SwTextFlyCnt(item, 3);
  const clone = item.Clone();
  const foreignItem = new SwFormatFlyCnt(secondFrame);
  try {
    const node = document.paragraphs[0];
    const otherNode = foreign.paragraphs[0];
    assert(node && otherNode);
    node.SetText("a😀" + CH_TXTATR_BREAKWORD + " tail");
    expect(hint.Which()).toBe(RES_TXTATR_FLYCNT);
    expect(hint.GetEnd()).toBeUndefined();
    expect(hint.GetAnyEnd()).toBe(3);
    expect(hint.HasDummyChar()).toBe(true);
    expect(hint.HasContent()).toBe(false);
    expect(item.GetTextFlyCnt()).toBe(hint);
    expect(item.GetFrameFormat()).toBe(frame);
    expect(clone.GetFrameFormat()).toBe(frame);
    expect(clone.GetTextFlyCnt()).toBeNull();
    expect(item.equals(clone)).toBe(false);
    expect(item.equals(unrelated)).toBe(false);
    const second = new SwTextFlyCnt(clone, 3);
    expect(item.equals(clone)).toBe(true);
    second.SetStart(4);
    expect(item.equals(clone)).toBe(false);
    second.SetStart(3);
    new SwTextFlyCnt(foreignItem, 3);
    expect(item.equals(foreignItem)).toBe(false);
    hint.SetAnchor(node);
    expect(frame.GetAnchor().GetAnchorId()).toBe(RndStdIds.FLY_AS_CHAR);
    expect(frame.GetAnchor().GetAnchorNode()).toBe(node);
    expect(frame.GetAnchor().GetAnchorContentOffset()).toBe(3);
    expect(node.GetText().charAt(frame.GetAnchor().GetAnchorContentOffset())).toBe(
      CH_TXTATR_BREAKWORD,
    );
    expect(
      /** Rejects an isolated destination graph without copying the source frame. @returns Nothing. */ () =>
        hint.SetAnchor(otherNode),
    ).toThrow("Writer fly anchor requires a format in the destination document.");
    item.SetFlyFormat();
    expect(item.GetFrameFormat()).toBeNull();
    expect(item.GetTextFlyCnt()).toBe(hint);
    expect(
      /** A logically removed format cannot receive a new anchor. @returns Nothing. */ () =>
        hint.SetAnchor(node),
    ).toThrow("Writer fly anchor requires a format in the destination document.");
  } finally {
    foreignItem.Dispose();
    clone.Dispose();
    unrelated.Dispose();
    item.Dispose();
    foreign.Dispose();
    document.Dispose();
  }
});

it("orders an inline point in the original start, end and Which maps", /** Uses a real point hint and character style spans at shared boundaries. @returns Nothing. */ () => {
  const document = new SwDoc();
  const style = document.GetDfltCharFormat();
  const point = new SwTextFlyCnt(new SwFormatFlyCnt(null), 4);
  const span = new SwTextCharFormat(new SwFormatCharFormat(style), 4, 9);
  const ending = new SwTextCharFormat(new SwFormatCharFormat(style), 0, 4);
  try {
    const hints = [point, span, ending];
    expect([...hints].sort(compareHints)).toEqual([ending, span, point]);
    const byEnd = [...hints].sort(compareHintsByEnd);
    expect(byEnd).toEqual([point, ending, span]);
    expect(hintPositionBound(byEnd, 4, false, true)).toBe(0);
    expect(hintPositionBound(byEnd, 4, true, true)).toBe(2);
    const byWhich = [...hints].sort(compareHintsByWhichAndStart);
    expect(byWhich).toEqual([ending, span, point]);
    expect(hintWhichStartBound(byWhich, [RES_TXTATR_FLYCNT, 4], false)).toBe(2);
    expect(hintWhichStartBound(byWhich, [RES_TXTATR_FLYCNT, 4], true)).toBe(3);
  } finally {
    point.GetAttr().Dispose();
    span.GetAttr().Dispose();
    ending.GetAttr().Dispose();
    document.Dispose();
  }
});

/** Creates a real embedded graphic section and detached point. @param node - Paragraph used by the graphic owner. @param offset - Offset of the point. @returns Detached hint and its owned format and section. */
function createInlineGraphic(node: SwTextNode, offset: number) {
  const position = new SwPosition(node, offset);
  const range = new SwPaM(position);
  try {
    const gif = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");
    const graphic = new Graphic(gif, "image/gif", new Size(120, 120));
    const format = node
      .GetDoc()
      .GetDocumentContentOperationsManager()
      .InsertGraphic(range, graphic);
    const section = format.GetContent().GetContentIdx()?.GetNode();
    assert(section?.IsStartNode());
    const hint = new SwTextFlyCnt(new SwFormatFlyCnt(format), offset);
    return { format, hint, section };
  } finally {
    range.Dispose();
    position.Dispose();
  }
}

/** Checks the source dummy, all native indexes and the live format anchor at one offset. @param node - Actual current text node. @param hint - Original fly hint. @param offset - Expected marker position. @returns Nothing. */
function expectInlineGraphic(node: SwTextNode, hint: SwTextFlyCnt, offset: number): void {
  const hints = node.GetpSwpHints();
  assert(hints);
  expect(hint.GetStart()).toBe(offset);
  expect(node.GetText().charAt(offset)).toBe(CH_TXTATR_BREAKWORD);
  expect(hints.GetTextAttrForCharAt(offset)).toBe(hint);
  expect(hints.Get(hints.GetIndexOf(hint))).toBe(hint);
  const which = hints.GetFirstPosSortedByWhichAndStart(RES_TXTATR_FLYCNT);
  expect(hints.GetSortedByWhichAndStart(which)).toBe(hint);
  const byEnd = hints.GetLastPosSortedByEnd(offset);
  expect(
    Array.from(
      { length: byEnd + 1 },
      /** Reads a native end-map slot. @param _value - Placeholder. @param index - Native index. @returns Indexed object. */ (
        _value,
        index,
      ) => hints.GetSortedByEnd(index),
    ),
  ).toContain(hint);
  const anchor = hint.GetAttr().GetFrameFormat()?.GetAnchor();
  expect(anchor?.GetAnchorNode()).toBe(node);
  expect(anchor?.GetAnchorId()).toBe(RndStdIds.FLY_AS_CHAR);
  expect(anchor?.GetAnchorContentOffset()).toBe(offset);
}

it("owns an inline graphic while formatting, shifting and erasing its paragraph", /** Checks the real native graphic section, point indices, and character iterator. @returns Nothing. */ () => {
  const doc = new SwDoc();
  try {
    const node = doc.paragraphs[0];
    assert(node);
    node.SetText("abcdef");
    node.ToggleTextRangeFormat(0, 6, "bold");
    const { format, hint, section } = createInlineGraphic(node, 2);
    const content = doc
      .GetNodes()
      .at(section.GetIndex() + 1)
      .GetGrfNode();
    expect(content?.GetGraphic().mediaType).toBe("image/gif");
    expect(node.InsertHint(hint)).toBe(true);
    expect(node.GetText()).toBe("ab" + CH_TXTATR_BREAKWORD + "cdef");
    expectInlineGraphic(node, hint, 2);
    const attr = new SwAttrIter(node);
    attr.Seek(0);
    expect(attr.GetNextAttr()).toBe(2);
    attr.Seek(2);
    attr.Seek(5);
    node.InsertText("X", 2);
    expectInlineGraphic(node, hint, 3);
    node.InsertText("Y", 4);
    expectInlineGraphic(node, hint, 3);
    node.InsertText("!", 0);
    expectInlineGraphic(node, hint, 4);
    node.EraseText(0, 2);
    expectInlineGraphic(node, hint, 2);
    node.ToggleTextRangeFormat(0, 3, "italic");
    expectInlineGraphic(node, hint, 2);
    node.ClearSwpHintsArr(true);
    expect(node.GetpSwpHints()?.Count()).toBe(1);
    expectInlineGraphic(node, hint, 2);
    node.EraseText(2, 1);
    expect(node.GetText()).toBe("bXYcdef");
    expect(node.GetpSwpHints()).toBeUndefined();
    expect([...doc.GetSpzFrameFormats()]).not.toContain(format);
    expect(doc.GetNodes().indexOfOrUndefined(section)).toBeUndefined();
  } finally {
    doc.Dispose();
  }
});

it("moves the same inline hint and graphic when splitting, joining, and cutting a paragraph", /** Uses actual registered native paragraphs and cut fragments. @returns Nothing. */ () => {
  const doc = new SwDoc();
  try {
    const first = doc.paragraphs[0];
    assert(first);
    first.SetText("abcd");
    const { format, hint, section } = createInlineGraphic(first, 2);
    expect(first.InsertHint(hint)).toBe(true);
    const position = new SwPosition(first, 2);
    try {
      const trailing = doc.GetDocumentContentOperationsManager().SplitNode(position);
      expect(first.GetText()).toBe("ab");
      expect(trailing.GetText()).toBe(CH_TXTATR_BREAKWORD + "cd");
      expectInlineGraphic(trailing, hint, 0);
      expect(first.JoinNext()).toBe(first);
      expect(first.GetText()).toBe("ab" + CH_TXTATR_BREAKWORD + "cd");
      expectInlineGraphic(first, hint, 2);

      doc.GetDocumentContentOperationsManager().AppendTextNode(position);
      const second = position.GetNode().GetTextNode();
      assert(second);
      second.SetText("EF");
      const fragment = first.CutTextFragment(1, 3);
      try {
        expect(fragment.hints.GetTextAttrForCharAt(1)).toBe(hint);
        expect(first.GetText()).toBe("acd");
        second.ReplaceRange(1, 1, fragment, true);
        expect(second.GetText()).toBe("Eb" + CH_TXTATR_BREAKWORD + "F");
        expect(fragment.hints.Count()).toBe(0);
        expectInlineGraphic(second, hint, 2);
        expect(format.GetContent().GetContentIdx()?.GetNode()).toBe(section);
      } finally {
        fragment.hints.Dispose();
      }
    } finally {
      position.Dispose();
    }
  } finally {
    doc.Dispose();
  }
});

it("attaches an inline hint only to an unclaimed existing marker in NOTXTATRCHR mode", /** Exercises validation, reuse of the marker and rejection of an already-owned hint. @returns Nothing. */ () => {
  const doc = new SwDoc();
  try {
    const node = doc.paragraphs[0];
    assert(node);
    node.SetText("abc");
    const { hint } = createInlineGraphic(node, 1);
    expect(
      /** Tries an absent marker. @returns Whether inserted. */ () =>
        node.InsertHint(hint, SetAttrMode.NOTXTATRCHR),
    ).toThrow("unclaimed dummy character");
    node.InsertText(CH_TXTATR_BREAKWORD, 1);
    expect(node.InsertHint(hint, SetAttrMode.NOTXTATRCHR)).toBe(true);
    expectInlineGraphic(node, hint, 1);
    const duplicate = createInlineGraphic(node, 1).hint;
    try {
      expect(
        /** Tries an already claimed marker. @returns Whether inserted. */ () =>
          node.InsertHint(duplicate, SetAttrMode.NOTXTATRCHR),
      ).toThrow("unclaimed dummy character");
      expect(
        /** Tries to reinsert an already owned hint. @returns Whether inserted. */ () =>
          node.InsertHint(hint),
      ).toThrow("requires a detached point");
    } finally {
      duplicate.GetAttr().Dispose();
    }
  } finally {
    doc.Dispose();
  }
});

it.each([
  [SetAttrMode.DEFAULT, SwInsertFlags.EMPTYEXPAND],
  [SetAttrMode.FORCEHINTEXPAND, SwInsertFlags.FORCEHINTEXPAND | SwInsertFlags.EMPTYEXPAND],
  [SetAttrMode.FORCEHINTEXPAND | SetAttrMode.NOHINTEXPAND, SwInsertFlags.NOHINTEXPAND],
])(
  "translates native point insertion mode %s",
  /** Observes the original InsertText flags without replacing the actual insertion. @param mode - Hint insertion mode. @param flags - Expected native text insertion flags. @returns Nothing. */ (
    mode,
    flags,
  ) => {
    const doc = new SwDoc();
    try {
      const node = doc.paragraphs[0];
      assert(node);
      const { hint } = createInlineGraphic(node, 0);
      const insert = vi.spyOn(node, "InsertText");
      expect(node.InsertHint(hint, mode)).toBe(true);
      expect(insert).toHaveBeenCalledExactlyOnceWith(CH_TXTATR_BREAKWORD, 0, flags);
      expectInlineGraphic(node, hint, 0);
    } finally {
      doc.Dispose();
    }
  },
);

it("destroys a rejected fly format when the text node is full", /** Exercises the source capacity report while keeping the real frame and its graphic section. @returns Nothing. */ () => {
  const doc = new SwDoc();
  try {
    const node = doc.paragraphs[0];
    assert(node);
    const { format, hint, section } = createInlineGraphic(node, 0);
    vi.spyOn(node, "GetSpaceLeft").mockReturnValueOnce(0);
    expect(node.InsertHint(hint)).toBe(false);
    expect(node.GetText()).toBe("");
    expect(node.GetpSwpHints()).toBeUndefined();
    expect([...doc.GetSpzFrameFormats()]).not.toContain(format);
    expect(doc.GetNodes().indexOfOrUndefined(section)).toBeUndefined();
  } finally {
    doc.Dispose();
  }
});

it("drops only the replaced point and keeps the following fly anchored", /** Exercises range replacement with three native spans around two live point hints. @returns Nothing. */ () => {
  const doc = new SwDoc();
  try {
    const node = doc.paragraphs[0];
    assert(node);
    node.SetText("abcd");
    const removed = createInlineGraphic(node, 1);
    expect(node.InsertHint(removed.hint)).toBe(true);
    const remaining = createInlineGraphic(node, 3);
    expect(node.InsertHint(remaining.hint)).toBe(true);
    const fragment = node.CaptureTextFragment(0, 1);
    try {
      node.ReplaceRange(1, 2, { text: "XY", hints: fragment.hints });
      expect(node.GetText()).toBe("aXYb" + CH_TXTATR_BREAKWORD + "cd");
      expectInlineGraphic(node, remaining.hint, 4);
      expect([...doc.GetSpzFrameFormats()]).toEqual([remaining.format]);
      expect(doc.GetNodes().indexOfOrUndefined(removed.section)).toBeUndefined();
    } finally {
      fragment.hints.Dispose();
    }
  } finally {
    doc.Dispose();
  }
});
