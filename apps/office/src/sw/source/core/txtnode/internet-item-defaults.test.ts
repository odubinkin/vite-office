/** @fileoverview Verifies literal native empty/default/copy internet item strings against actual node, map and history owners. */
import { describe, expect, it } from "vitest";
import { SwFormatINetFormat, normalizeWriterHyperlink, type WriterHyperlink } from "./fmtatr2";
import { SwTextINetFormat } from "./txtatr2";
import { SwpHints } from "./ndhints";
import { SwDoc } from "../doc/doc";
import { ReplaceUndoRange } from "../undo/undobj";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";

/** Requires a real test owner. @param value - Optional owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing internet default owner");
  return value;
}
/** Reads native strings in a fixed independent order. @param item - Concrete item. @returns Literal value tuple. */
function strings(item: SwFormatINetFormat): string[] {
  return [
    item.GetValue(),
    item.GetTargetFrame(),
    item.GetINetFormat(),
    item.GetVisitedFormat(),
    item.GetName(),
  ];
}
describe("native internet item empty strings", /** Registers native value and actual model boundaries. @returns Nothing. */ function defaultCases(): void {
  it("creates zero type-info/default items with detached copy construction", /** Checks native empty strings,not the styled document-pool constructor. @returns Nothing. */ function defaultItem(): void {
    const empty = new SwFormatINetFormat(),
      factory = SwFormatINetFormat.CreateDefault();
    for (const item of [empty, factory, new SwFormatINetFormat(empty), empty.Clone()]) {
      expect(strings(item)).toEqual(["", "", "", "", ""]);
      expect(item.Which()).toBe(54);
      expect(item.isShareable()).toBe(false);
      expect(item.GetTextINetFormat()).toBeUndefined();
      expect(item.GetHyperlink()).toEqual({ url: "" });
      expect(item.QueryValue()).toBe('{"url":""}');
      expect(item.equals(empty)).toBe(true);
    }
    expect(
      empty.equals(
        new SwFormatINetFormat({
          url: "",
          name: "",
          targetFrame: "",
          styleName: "",
          visitedStyleName: "",
        }),
      ),
    ).toBe(true);
    expect(normalizeWriterHyperlink(empty.GetHyperlink())).toBeUndefined();
  });
  it.each([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])(
    "owns omitted and explicit empty strings identically for mask %s",
    /** Checks all native optional empty combinations independently. @param mask - Explicit empty field bits. @returns Nothing. */ function emptyCombinations(
      mask,
    ): void {
      const value: WriterHyperlink = {
        url: "url",
        ...(mask & 1 ? { name: "" } : {}),
        ...(mask & 2 ? { targetFrame: "" } : {}),
        ...(mask & 4 ? { styleName: "" } : {}),
        ...(mask & 8 ? { visitedStyleName: "" } : {}),
      };
      const item = new SwFormatINetFormat(value),
        absent = new SwFormatINetFormat({ url: "url" });
      expect(strings(item)).toEqual(["url", "", "", "", ""]);
      expect(item.equals(absent)).toBe(true);
      expect(absent.equals(item)).toBe(true);
      expect(strings(item.Clone())).toEqual(["url", "", "", "", ""]);
      expect(item.GetHyperlink()).toEqual({ url: "url" });
      expect(item.QueryValue()).toBe('{"url":"url"}');
    },
  );
  it.each(["url", "name", "targetFrame", "styleName", "visitedStyleName"] as const)(
    "distinguishes a nonempty %s and retains copied values",
    /** Checks every native equality field separately. @param field - Changed native string. @returns Nothing. */ function unequalField(
      field,
    ): void {
      const input = {
        url: "url",
        name: "name",
        targetFrame: "target",
        styleName: "normal",
        visitedStyleName: "visited",
      };
      const item = new SwFormatINetFormat(input),
        copy = new SwFormatINetFormat(item),
        different = new SwFormatINetFormat({ ...input, [field]: "other" });
      expect(strings(copy)).toEqual(["url", "target", "normal", "visited", "name"]);
      expect(item.equals(copy)).toBe(true);
      expect(item.equals(different)).toBe(false);
      expect(different.equals(item)).toBe(false);
      input[field] = "later";
      expect(strings(item)).toEqual(["url", "target", "normal", "visited", "name"]);
      expect(strings(copy)).toEqual(["url", "target", "normal", "visited", "name"]);
    },
  );
  it("copies strings without backlink and changes the native name independently", /** Checks direct copy versus concrete attribute ownership. @returns Nothing. */ function nameOwnership(): void {
    const item = new SwFormatINetFormat({ url: "url", name: "name" }),
      attr = new SwTextINetFormat(item, 1, 4),
      copy = item.Clone();
    expect(item.GetTextINetFormat()).toBe(attr);
    expect(copy.GetTextINetFormat()).toBeUndefined();
    item.SetName("changed");
    expect(item.GetName()).toBe("changed");
    expect(item.GetTextINetFormat()).toBe(attr);
    expect(copy.GetName()).toBe("name");
    expect(copy.equals(item)).toBe(false);
    const next = new SwFormatINetFormat(item);
    expect(next.GetName()).toBe("changed");
    expect(next.GetTextINetFormat()).toBeUndefined();
    item.SetName("");
    expect(item.GetHyperlink()).toEqual({ url: "url" });
    expect(item.equals(new SwFormatINetFormat({ url: "url" }))).toBe(true);
  });
  it("prunes empty active links while retaining valid native empty metadata in node history and copies", /** Checks actual range/history/graph boundaries and unchanged blank-link normalization. @returns Nothing. */ function graphValues(): void {
    const doc = new SwDoc(),
      node = required(doc.paragraphs[0]);
    node.SetText("abcd");
    const blank = new SwTextINetFormat(new SwFormatINetFormat(), 0, 4),
      empty = new SwpHints(doc.GetAttrPool(), [blank]);
    expect(empty.Count()).toBe(0);
    node.SetTextHints(empty);
    expect(node.GetpSwpHints()).toBeUndefined();
    const caller = { url: "valid", name: "", targetFrame: "", styleName: "", visitedStyleName: "" };
    const input = new SwTextINetFormat(new SwFormatINetFormat(caller), 0, 4);
    node.SetTextHints(new SwpHints(doc.GetAttrPool(), [input]));
    const attr = required(node.GetpSwpHints()).Get(0) as SwTextINetFormat;
    expect(attr.GetTextNode()).toBe(node);
    expect(strings(attr.format)).toEqual(["valid", "", "", "", ""]);
    caller.url = "";
    caller.name = "later";
    expect(node.getHyperlinkAt(2)).toEqual({ url: "valid" });
    const snapshot = node.CaptureTextFragment(0, 4),
      history = doc.GetUndoManager().GetUndoNodes(),
      id = history.RetainText(snapshot);
    attr.format.SetName("live");
    expect(node.getHyperlinkAt(2)).toEqual({ url: "valid", name: "live" });
    expect((history.GetText(id).hints.Get(0).format as SwFormatINetFormat).GetName()).toBe("");
    node.SetText("changed");
    ReplaceUndoRange(doc, node, 0, node.Len(), history.GetText(id));
    expect(node.GetText()).toBe("abcd");
    expect(node.getHyperlinkAt(2)).toEqual({ url: "valid" });
    const target = new SwDoc(),
      copy = node.CloneTo(target.GetNodes()),
      copied = required(copy.GetpSwpHints()).Get(0) as SwTextINetFormat;
    expect(copied.GetTextNode()).toBe(copy);
    expect(strings(copied.format)).toEqual(["valid", "", "", "", ""]);
    const decoded = decodeWriterDocument(encodeWriterDocument(doc)),
      restored = required(decoded.paragraphs[0]);
    expect(restored.getHyperlinkAt(2)).toEqual({ url: "valid" });
    expect(strings((required(restored.GetpSwpHints()).Get(0) as SwTextINetFormat).format)).toEqual([
      "valid",
      "",
      "",
      "",
      "",
    ]);
    history.Release(id);
  });
});
