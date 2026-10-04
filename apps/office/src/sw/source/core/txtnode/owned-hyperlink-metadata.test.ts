/** @fileoverview Verifies owned hyperlink values through actual node/copy/cut/history boundaries without upstream access. */
import { describe, expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwpHints } from "./ndhints";
import { SwTextAttr } from "./txatbase";
import { SwFormatINetFormat } from "./fmtatr2";
import { ReplaceUndoRange } from "../undo/undobj";
/** Requires an actual graph object. @param value - Optional graph object. @returns Existing graph object. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing hyperlink metadata owner");
  return value;
}
/** Creates independent literal source values. @returns Mutable metadata. */
function metadata() {
  return {
    url: "https://example.test/original",
    name: "Original name",
    targetFrame: "_blank",
    styleName: "Original style",
    visitedStyleName: "Original visited style",
  };
}
/** Constructs a flagged item and mutates its caller before any clone/graph ingestion. @param start - Start. @param end - End. @param mask - Flags. @returns Original detached attribute. */
function input(start: number, end: number, mask: number): SwTextAttr<SwFormatINetFormat> {
  const caller = metadata(),
    attr = new SwTextAttr(new SwFormatINetFormat(caller), start, end);
  attr.dontExpand = Boolean(mask & 1);
  attr.dontExpandStart = Boolean(mask & 2);
  attr.dontMoveAttr = Boolean(mask & 4);
  caller.url = "";
  caller.name = "Changed caller name";
  caller.targetFrame = "_self";
  caller.styleName = "Changed style";
  caller.visitedStyleName = "Changed visited style";
  expect(caller.url).toBe("");
  expect(attr.format.GetHyperlink()).toEqual(metadata());
  expect(attr.format.Clone().GetHyperlink()).toEqual(metadata());
  return attr;
}
/** Checks the three maps share one owned object with stable literal metadata. @param hints - Owner. @returns Actual hyperlink attribute. */
function owned(hints: SwpHints): SwTextAttr<SwFormatINetFormat> {
  expect(hints.Count()).toBe(1);
  const hint = hints.Get(0) as SwTextAttr<SwFormatINetFormat>;
  expect(hint.Which()).toBe(54);
  expect(hint.m_pHints).toBe(hints);
  expect(hints.GetSortedByEnd(0)).toBe(hint);
  expect(hints.GetSortedByWhichAndStart(0)).toBe(hint);
  expect(hint.format.GetHyperlink()).toEqual(metadata());
  expect(hint.format.GetValue()).toBe("https://example.test/original");
  expect(JSON.parse(hint.format.QueryValue())).toEqual(metadata());
  expect(hint.format.isShareable()).toBe(false);
  return hint;
}
describe("graph-owned hyperlink metadata", /** Registers actual object boundary matrices. @returns Nothing. */ () => {
  for (const foreign of [false, true])
    it.each([0, 1, 2, 3, 4, 5, 6, 7])(
      "copies old metadata after caller mutation, foreign=" + foreign + " flags=%s",
      /** Checks native construction and independent snapshot/history fields. @param mask - Flags. @returns Nothing. */ (
        mask,
      ) => {
        const doc = new SwDoc(),
          destination = foreign ? new SwDoc() : doc,
          node = required(doc.paragraphs[0]),
          callerAttr = input(1, 5, mask);
        node.SetText("abcdefgh");
        node.SetTextHints(new SwpHints(doc.GetAttrPool(), [callerAttr]));
        const original = owned(required(node.GetpSwpHints()));
        expect(original).not.toBe(callerAttr);
        expect(callerAttr.m_pHints).toBeUndefined();
        expect(original).toMatchObject({
          start: 1,
          end: 5,
          dontExpand: Boolean(mask & 1),
          dontExpandStart: Boolean(mask & 2),
          dontMoveAttr: Boolean(mask & 4),
        });
        expect(node.getHyperlinkAt(2)).toEqual(metadata());
        const snapshot = node.CaptureTextFragment(0, 8),
          snapshotAttr = owned(snapshot.hints),
          copied = snapshot.hints.CopyTo(destination.GetAttrPool()),
          copyAttr = owned(copied);
        expect(snapshotAttr).not.toBe(original);
        expect(copyAttr).not.toBe(snapshotAttr);
        expect(copyAttr.format).not.toBe(snapshotAttr.format);
        expect(copyAttr).toMatchObject({
          start: 1,
          end: 5,
          dontExpand: false,
          dontExpandStart: false,
          dontMoveAttr: false,
        });
        const projected = copyAttr.format.GetHyperlink() as { url: string; name?: string };
        projected.url = "https://example.test/projected";
        delete projected.name;
        owned(copied);
        owned(snapshot.hints);
        owned(required(node.GetpSwpHints()));
        const history = doc.GetUndoManager().GetUndoNodes(),
          id = history.RetainText(snapshot),
          retained = history.GetText(id);
        owned(retained.hints);
        expect(owned(retained.hints)).not.toBe(snapshotAttr);
        node.SetText("changed");
        ReplaceUndoRange(doc, node, 0, node.Len(), retained);
        expect(node.GetText()).toBe("abcdefgh");
        expect(owned(required(node.GetpSwpHints()))).toMatchObject({
          start: 1,
          end: 5,
          dontExpand: Boolean(mask & 1),
          dontExpandStart: Boolean(mask & 2),
          dontMoveAttr: Boolean(mask & 4),
        });
        history.Release(id);
      },
    );
  for (const kind of ["interior", "partial", "exact"] as const)
    it.each([0, 1, 2, 3, 4, 5, 6, 7])(
      "keeps caller-independent metadata across " + kind + " owned move, flags=%s",
      /** Checks actual cut/consumption and retained source history. @param mask - Flags. @returns Nothing. */ (
        mask,
      ) => {
        const doc = new SwDoc(),
          source = required(doc.paragraphs[0]),
          target = doc.GetNodes().MakeTextNode(),
          start = kind === "interior" ? 4 : kind === "partial" ? 1 : 3,
          end = kind === "interior" ? 6 : kind === "partial" ? 9 : 7;
        source.SetText("abcdefghij");
        target.SetText("XY");
        source.SetTextHints(new SwpHints(doc.GetAttrPool(), [input(start, end, mask)]));
        const original = owned(required(source.GetpSwpHints())),
          snapshot = source.CaptureTextFragment(0, 10),
          undo = doc.GetUndoManager().GetUndoNodes(),
          id = undo.RetainText(snapshot);
        const packet = source.CutTextFragment(3, 7),
          moved = owned(packet.hints),
          movedStart = kind === "interior" ? 1 : 0,
          movedEnd = kind === "interior" ? 3 : 4;
        expect(moved).toMatchObject({
          start: movedStart,
          end: movedEnd,
          dontExpand: kind === "interior" && Boolean(mask & 1),
          dontExpandStart: kind === "interior" && Boolean(mask & 2),
          dontMoveAttr: kind === "interior" && Boolean(mask & 4),
        });
        if (kind === "interior") expect(moved).toBe(original);
        else expect(moved).not.toBe(original);
        target.ReplaceRange(1, 1, packet, true);
        expect(packet.hints.Count()).toBe(0);
        const targetAttr = owned(required(target.GetpSwpHints()));
        expect(targetAttr).toBe(moved);
        expect(targetAttr).toMatchObject({ start: movedStart + 1, end: movedEnd + 1 });
        expect(target.GetText()).toBe("XdefgY");
        const projected = targetAttr.format.GetHyperlink() as { url: string; targetFrame?: string };
        projected.url = "https://example.test/later";
        delete projected.targetFrame;
        owned(required(target.GetpSwpHints()));
        const retained = undo.GetText(id);
        owned(retained.hints);
        expect(owned(snapshot.hints)).toMatchObject({
          start,
          end,
          dontExpand: Boolean(mask & 1),
          dontExpandStart: Boolean(mask & 2),
          dontMoveAttr: Boolean(mask & 4),
        });
        ReplaceUndoRange(doc, source, 0, source.Len(), retained);
        expect(source.GetText()).toBe("abcdefghij");
        const restored = owned(required(source.GetpSwpHints()));
        expect(restored).not.toBe(targetAttr);
        expect(restored.format).not.toBe(targetAttr.format);
        expect(restored).toMatchObject({ start, end });
        owned(required(target.GetpSwpHints()));
        undo.Release(id);
      },
    );
});
