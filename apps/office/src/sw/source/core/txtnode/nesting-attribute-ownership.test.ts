/** @fileoverview Checks concrete native internet attributes through real factories, text updates, copies, cuts and retained undo. */
import { describe, expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwpHints } from "./ndhints";
import { SwFormatINetFormat } from "./fmtatr2";
import { SwTextINetFormat } from "./txtatr2";
import { MakeTextAttr } from "./thints";
import { ReplaceUndoRange } from "../undo/undobj";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";

/** Requires an actual graph object. @param value - Optional object. @returns Existing object. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing nesting owner");
  return value;
}
/** Checks actual concrete identity, defaults and item backlink. @param attr - Actual ranged attribute. @returns Concrete internet attribute. */
function native(attr: unknown): SwTextINetFormat {
  expect(attr).toBeInstanceOf(SwTextINetFormat);
  const link = attr as SwTextINetFormat;
  expect([
    link.DontExpand(),
    link.IsLockExpandFlag(),
    link.IsDontExpandStartAttr(),
    link.IsNesting(),
    link.IsCharFormatAttr(),
    link.IsDontMoveAttr(),
  ]).toEqual([true, true, true, true, true, false]);
  expect(link.format.GetTextINetFormat()).toBe(link);
  return link;
}
describe("native nesting attribute ownership", /** Registers independent real-owner boundary cases. @returns Nothing. */ () => {
  it.each([false, true])(
    "reconstructs concrete internet copies with foreign=%s",
    /** Checks native fresh defaults against explicitly unlocked snapshot state. @param foreign - Separate destination. @returns Nothing. */ (
      foreign,
    ) => {
      const doc = new SwDoc(),
        destination = foreign ? new SwDoc() : doc,
        item = new SwFormatINetFormat({ url: "owned", name: "Original" }),
        link = native(MakeTextAttr(doc, item, 2, 6));
      expect(item.GetTextINetFormat()).toBeUndefined();
      link.SetDontExpand(false);
      expect(link.DontExpand()).toBe(true);
      link.SetLockExpandFlag(false);
      link.SetDontExpand(false);
      link.SetDontExpandStartAttr(false);
      link.SetPriorityAttr(true);
      link.SetFormatIgnoreStart(true);
      link.SetFormatIgnoreEnd(true);
      const source = new SwpHints(doc.GetAttrPool(), [link]),
        original = source.Get(0),
        snapshot = source.clone().Get(0);
      expect(original).toBeInstanceOf(SwTextINetFormat);
      expect(snapshot).toBeInstanceOf(SwTextINetFormat);
      expect([
        snapshot.DontExpand(),
        snapshot.IsLockExpandFlag(),
        snapshot.IsDontExpandStartAttr(),
        snapshot.IsPriorityAttr(),
        snapshot.IsFormatIgnoreStart(),
        snapshot.IsFormatIgnoreEnd(),
      ]).toEqual([false, false, false, true, true, true]);
      expect((snapshot.format as SwFormatINetFormat).GetTextINetFormat()).toBe(snapshot);
      const copy = native(source.CopyTo(destination.GetAttrPool()).Get(0)),
        factory = native(MakeTextAttr(destination, original.format, 2, 6));
      for (const fresh of [copy, factory]) {
        expect([
          fresh.IsPriorityAttr(),
          fresh.IsFormatIgnoreStart(),
          fresh.IsFormatIgnoreEnd(),
        ]).toEqual([false, false, false]);
        expect(fresh.format.QueryValue()).toBe(item.QueryValue());
        expect(fresh.format).not.toBe(original.format);
      }
      expect(snapshot.m_pHints).not.toBe(source);
      snapshot.SetEnd(5);
      expect(original.GetEnd()).toBe(6);
    },
  );
  it.each([
    { offset: 0, start: 2, end: 6 },
    { offset: 1, start: 2, end: 6 },
    { offset: 2, start: 1, end: 6 },
    { offset: 4, start: 1, end: 6 },
    { offset: 5, start: 1, end: 5 },
    { offset: 6, start: 1, end: 5 },
  ])(
    "retains locked native internet boundaries at $offset",
    /** Checks default InsertText native coordinate and map identity. @param boundary - Independent literal coordinates. @returns Nothing. */ (
      boundary,
    ) => {
      const doc = new SwDoc(),
        node = required(doc.paragraphs[0]);
      node.SetText("abcdef");
      node.SetHyperlink(1, 5, { url: "boundary" });
      const hints = required(node.GetpSwpHints()),
        original = native(hints.Get(0)),
        item = original.format,
        snapshot = node.CaptureTextFragment(0, 6);
      node.InsertText("X", boundary.offset);
      expect(node.GetpSwpHints()).toBe(hints);
      expect(hints.Get(0)).toBe(original);
      expect(hints.GetSortedByEnd(0)).toBe(original);
      expect(hints.GetSortedByWhichAndStart(0)).toBe(original);
      expect(original.format).toBe(item);
      native(original);
      expect([original.start, original.end]).toEqual([boundary.start, boundary.end]);
      expect([snapshot.hints.Get(0).start, snapshot.hints.Get(0).end]).toEqual([1, 5]);
    },
  );
  it.each([0, 2, 4])(
    "does not expand a concrete link inserted at paragraph start, length=%s",
    /** Checks nesting start and locked end defaults. @param length - Original link length. @returns Nothing. */ (
      length,
    ) => {
      const doc = new SwDoc(),
        node = required(doc.paragraphs[0]);
      node.SetText("abcd");
      if (length === 0) {
        node.InsertText("link", 0, undefined, { url: "inserted" });
        native(required(node.GetpSwpHints()).Get(0));
        node.InsertText("X", 4);
        expect(required(node.GetpSwpHints()).Get(0).end).toBe(4);
      } else {
        node.SetHyperlink(0, length, { url: "start" });
        node.InsertText("X", 0);
        const link = native(required(node.GetpSwpHints()).Get(0));
        expect([link.start, link.end]).toEqual([1, length + 1]);
      }
    },
  );
  it.each(["interior", "partial", "exact"] as const)(
    "preserves concrete identity/backlinks through %s cut, transfer and undo",
    /** Checks transfer versus fresh construction with retained history. @param kind - Cut relation. @returns Nothing. */ (
      kind,
    ) => {
      const doc = new SwDoc(),
        source = required(doc.paragraphs[0]),
        target = doc.GetNodes().MakeTextNode(),
        start = kind === "partial" ? 1 : kind === "interior" ? 4 : 3,
        end = kind === "partial" ? 9 : kind === "interior" ? 6 : 7;
      source.SetText("abcdefghij");
      target.SetText("XY");
      source.SetHyperlink(start, end, { url: "cut", name: "Metadata" });
      const original = native(required(source.GetpSwpHints()).Get(0)),
        snapshot = source.CaptureTextFragment(0, 10),
        history = doc.GetUndoManager().GetUndoNodes(),
        id = history.RetainText(snapshot);
      const packet = source.CutTextFragment(3, 7),
        moved = native(packet.hints.Get(0));
      if (kind === "interior") expect(moved).toBe(original);
      else expect(moved).not.toBe(original);
      expect(moved.format.GetHyperlink()).toEqual({ url: "cut", name: "Metadata" });
      target.ReplaceRange(1, 1, packet, true);
      expect(packet.hints.Count()).toBe(0);
      expect(native(required(target.GetpSwpHints()).Get(0))).toBe(moved);
      expect(moved.m_pHints).toBe(target.GetpSwpHints());
      expect(target.GetText()).toBe("XdefgY");
      const retained = history.GetText(id);
      native(retained.hints.Get(0));
      ReplaceUndoRange(doc, source, 0, source.Len(), retained);
      const restored = native(required(source.GetpSwpHints()).Get(0));
      expect(restored).not.toBe(moved);
      expect([restored.start, restored.end]).toEqual([start, end]);
      expect(source.GetText()).toBe("abcdefghij");
      history.Release(id);
    },
  );
  it("uses concrete attributes in node copies, run ingestion and graph round trips", /** Checks existing model/filter construction paths. @returns Nothing. */ () => {
    const doc = new SwDoc(),
      node = required(doc.paragraphs[0]);
    node.SetText("abcd");
    node.SetHyperlink(0, 4, { url: "graph" });
    native(required(node.GetpSwpHints()).Get(0));
    native(required(node.CloneTo(new SwDoc().GetNodes()).GetpSwpHints()).Get(0));
    const hints = new SwpHints(doc.GetAttrPool());
    hints.setTextRuns(
      [
        {
          text: "abcd",
          attributes: { bold: false, italic: false, underline: false },
          hyperlink: { url: "runs" },
        },
      ],
      node.GetSwAttrSet(),
    );
    native(hints.Get(0));
    const decoded = decodeWriterDocument(encodeWriterDocument(doc));
    const restored = native(required(required(decoded.paragraphs[0]).GetpSwpHints()).Get(0));
    expect(restored.format.GetHyperlink()).toEqual({ url: "graph" });
    expect([restored.start, restored.end]).toEqual([0, 4]);
  });
});
