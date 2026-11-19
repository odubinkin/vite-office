/** @fileoverview Native inline fly format links, point offsets and item-pool defaults. */
import { assert, expect, it } from "vitest";
import { RndStdIds } from "../../../../svx/inc/swframetypes";
import { SwFormatFlyCnt } from "../../../inc/fmtflcnt";
import { CH_TXTATR_BREAKWORD, RES_TXTATR_AUTOFMT, RES_TXTATR_FLYCNT } from "../../../inc/hintids";
import { SwTextFlyCnt } from "../../../inc/txtflcnt";
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
