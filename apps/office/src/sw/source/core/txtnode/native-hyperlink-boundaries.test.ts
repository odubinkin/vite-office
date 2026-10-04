/** @fileoverview Checks native adjacent INET separation through actual maps, edits, copies and retained history without upstream. */
import { describe, expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwpHints } from "./ndhints";
import { SwTextAttrEnd } from "./txatbase";
import { SwFormatINetFormat } from "./fmtatr2";
import { ReplaceUndoRange } from "../undo/undobj";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
/** Requires an actual object. @param value - Optional object. @returns Existing value. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing owned native hyperlink");
  return value;
}
/** Builds equal or distinct independently flagged ranges. @param doc - Owner. @param different - Distinct second value. @param mask - Flags. @param gap - Gap between links. @returns Native hint pair. */
function pair(doc: SwDoc, different: boolean, mask: number, gap = 0): SwpHints {
  const first = new SwTextAttrEnd(new SwFormatINetFormat({ url: "first", name: "One" }), 0, 2),
    second = new SwTextAttrEnd(
      new SwFormatINetFormat({ url: different ? "second" : "first", name: "One" }),
      2 + gap,
      4 + gap,
    );
  for (const hint of [first, second]) {
    hint.dontExpand = Boolean(mask & 1);
    hint.dontExpandStart = Boolean(mask & 2);
    hint.dontMoveAttr = Boolean(mask & 4);
  }
  return new SwpHints(doc.GetAttrPool(), [second, first]);
}
/** Checks the actual maps and independent objects. @param hints - Pair owner. @param expected - Literal coordinates. @returns Nothing. */
function ranges(hints: SwpHints, expected: readonly (readonly [number, number])[]): void {
  expect(hints.Count()).toBe(2);
  expect(hints.Get(0)).not.toBe(hints.Get(1));
  expect(hints.Get(0).format).not.toBe(hints.Get(1).format);
  for (let i = 0; i < 2; i++) {
    const hint = hints.Get(i);
    expect([hint.start, hint.end]).toEqual(expected[i]);
    expect(hint.m_pHints).toBe(hints);
    expect(hints.GetSortedByEnd(i)).toBe(hint);
    expect(hints.GetSortedByWhichAndStart(i)).toBe(hint);
  }
}
describe("native adjacent hyperlink ranges", /** Registers explicit boundary matrices. @returns Nothing. */ () => {
  for (const different of [false, true])
    it.each([0, 1, 2, 3, 4, 5, 6, 7])(
      "preserves separate links with different=" + different + " flags=%s",
      /** Checks native value equality never merges INET, while copy/history ownership remains independent. @param mask - Flags. @returns Nothing. */ (
        mask,
      ) => {
        const doc = new SwDoc(),
          hints = pair(doc, different, mask),
          node = required(doc.paragraphs[0]);
        ranges(hints, [
          [0, 2],
          [2, 4],
        ]);
        node.SetText("abcd");
        node.SetTextHints(hints);
        const actual = required(node.GetpSwpHints()),
          first = actual.Get(0),
          second = actual.Get(1),
          snapshot = node.CaptureTextFragment(0, 4);
        ranges(actual, [
          [0, 2],
          [2, 4],
        ]);
        expect(first).not.toBe(hints.Get(0));
        const clone = actual.clone(),
          copy = actual.CopyTo(new SwDoc().GetAttrPool());
        for (const independent of [clone, copy, snapshot.hints]) {
          ranges(independent, [
            [0, 2],
            [2, 4],
          ]);
          expect(independent.Get(0)).not.toBe(first);
          expect(independent.Get(1)).not.toBe(second);
        }
        expect(copy.Get(0).dontExpand).toBe(true);
        expect(clone.Get(0).dontExpand).toBe(Boolean(mask & 1));
        node.InsertText("XY", 2);
        ranges(actual, [
          [0, mask & 1 ? 2 : 4],
          [4, 6],
        ]);
        expect(required(node.GetpSwpHints())).toBe(actual);
        expect(actual.Get(0)).toBe(first);
        expect(actual.Get(1)).toBe(second);
        expect(first.dontExpand).toBe(false);
        expect(second.dontExpand).toBe(Boolean(mask & 1));
        expect(node.GetText()).toBe("abXYcd");
        node.EraseText(2, 2);
        ranges(actual, [
          [0, 2],
          [2, 4],
        ]);
        const history = doc.GetUndoManager().GetUndoNodes(),
          id = history.RetainText(snapshot);
        node.SetText("plain");
        ReplaceUndoRange(doc, node, 0, node.Len(), history.GetText(id));
        ranges(required(node.GetpSwpHints()), [
          [0, 2],
          [2, 4],
        ]);
        expect(node.getHyperlinkAt(4)?.url).toBe(different ? "second" : "first");
        const decoded = decodeWriterDocument(encodeWriterDocument(doc));
        const decodedHints = required(required(decoded.paragraphs[0]).GetpSwpHints());
        ranges(decodedHints, [
          [0, 2],
          [2, 4],
        ]);
        history.Release(id);
      },
    );
  for (const different of [false, true])
    it.each([0, 1, 2, 3, 4, 5, 6, 7])(
      "keeps distinct links after removing a gap, different=" + different + " flags=%s",
      /** Checks pure erasure and destructive cut preserve distinct actual attributes. @param mask - Flags. @returns Nothing. */ (
        mask,
      ) => {
        const doc = new SwDoc(),
          node = required(doc.paragraphs[0]);
        node.SetText("abXYcd");
        node.SetTextHints(pair(doc, different, mask, 2));
        const actual = required(node.GetpSwpHints()),
          first = actual.Get(0),
          second = actual.Get(1);
        node.EraseText(2, 2);
        ranges(actual, [
          [0, 2],
          [2, 4],
        ]);
        expect(actual.Get(0)).toBe(first);
        expect(actual.Get(1)).toBe(second);
        expect(first.dontExpand).toBe(Boolean(mask & 1));
        const packet = node.CutTextFragment(0, 4),
          target = doc.GetNodes().MakeTextNode();
        ranges(packet.hints, [
          [0, 2],
          [2, 4],
        ]);
        target.ReplaceRange(0, 0, packet, true);
        expect(packet.hints.Count()).toBe(0);
        ranges(required(target.GetpSwpHints()), [
          [0, 2],
          [2, 4],
        ]);
        expect(target.GetText()).toBe("abcd");
      },
    );
});
