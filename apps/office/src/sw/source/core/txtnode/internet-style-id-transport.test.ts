/** @fileoverview Verifies native internet style-ID ownership in real node copies,history and structured-clone Worker16 graphs. */
import { describe, expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import type { SwTextNode } from "./ndtxt";
import { SwFormatINetFormat } from "./fmtatr2";
import { SwTextINetFormat } from "./txtatr2";
import { SwpHints } from "./ndhints";
import { SwPoolFormatId } from "../../../inc/poolfmt";
import { ReplaceUndoRange } from "../undo/undobj";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import {
  createOdtWriterTransfer,
  restoreOdtWriterTransfer,
} from "../../../browser/filter/xml/odt-transfer";

/** Requires an existing owned value. @param value - Optional value. @returns Value. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing internet style-ID owner");
  return value;
}
/** Reads the concrete internet range from actual secondary maps. @param node - Owned text node. @returns Actual range. */
function actual(node: SwTextNode): SwTextINetFormat {
  const hints = required(node.GetpSwpHints()),
    attr = hints.Get(0) as SwTextINetFormat;
  expect(attr).toBeInstanceOf(SwTextINetFormat);
  expect(hints.GetSortedByEnd(0)).toBe(attr);
  expect(hints.GetSortedByWhichAndStart(0)).toBe(attr);
  expect(attr.GetTextNode()).toBe(node);
  expect(attr.format.GetTextINetFormat()).toBe(attr);
  return attr;
}
/** Creates an actual node with independent native IDs and names. @param normal - Normal identity. @param visited - Visited identity. @returns Document and actual node. */
function linked(normal: number, visited: number): { doc: SwDoc; node: SwTextNode } {
  const doc = new SwDoc(),
    node = required(doc.paragraphs[0]);
  node.SetText("abcdef");
  const item = new SwFormatINetFormat("url", "target");
  item.SetName("name");
  item.SetINetFormatAndId("normal", normal as SwPoolFormatId);
  item.SetVisitedFormatAndId("visited", visited as SwPoolFormatId);
  node.SetTextHints(new SwpHints(doc.GetAttrPool(), [new SwTextINetFormat(item, 1, 5)]));
  return { doc, node };
}
/** Asserts native literals and owned backlinks. @param node - Actual node. @param normal - Expected normal ID. @param visited - Expected visited ID. @returns Actual internet item. */
function check(node: SwTextNode, normal: number, visited: number): SwFormatINetFormat {
  const item = actual(node).format;
  expect(item.GetINetFormatId()).toBe(normal);
  expect(item.GetVisitedFormatId()).toBe(visited);
  expect(item.GetHyperlink()).toEqual({
    url: "url",
    targetFrame: "target",
    name: "name",
    styleName: "normal",
    visitedStyleName: "visited",
  });
  return item;
}

describe("native internet identities through real graph owners", /** Registers real copy/history/Worker boundaries. @returns Nothing. */ function transportCases(): void {
  it.each([
    [0, 0],
    [1030, 1031],
    [65535, 0],
    [65000, 65535],
  ] as const)(
    "preserves actual normal %s and visited %s through Worker16",
    /** Checks graph records,structured clone,actual binding and caller independence. @param normal - Normal identity. @param visited - Visited identity. @returns Nothing. */ function graphRoundTrip(
      normal,
      visited,
    ): void {
      const { doc, node } = linked(normal, visited),
        original = check(node, normal, visited);
      const record = encodeWriterDocument(doc),
        hint = required(record.textNodes[0]?.hints[0]);
      expect(record.swModelVersion).toBe(16);
      if (hint.kind !== "hyperlink") throw new Error("Missing actual internet graph record");
      expect(hint.hyperlink.inetFormatId ?? 0).toBe(normal);
      expect(hint.hyperlink.visitedFormatId ?? 0).toBe(visited);
      const transfer = createOdtWriterTransfer(doc);
      expect(transfer.transferVersion).toBe(5);
      const worker = restoreOdtWriterTransfer(structuredClone(transfer));
      const direct = decodeWriterDocument(structuredClone(record));
      for (const restored of [worker, direct]) {
        const target = required(restored.paragraphs[0]),
          copied = check(target, normal, visited);
        expect(target.GetText()).toBe("abcdef");
        expect([actual(target).start, actual(target).end]).toEqual([1, 5]);
        expect(copied).not.toBe(original);
        expect(copied.equals(original)).toBe(true);
        expect(encodeWriterDocument(restored)).toEqual(record);
        copied.SetINetFormatAndId("changed", SwPoolFormatId.ZERO);
        check(node, normal, visited);
      }
      const stripped = structuredClone(record),
        legacy = required(stripped.textNodes[0]?.hints[0]);
      if (legacy.kind !== "hyperlink") throw new Error("Missing legacy internet record");
      const value = legacy.hyperlink as { inetFormatId?: number; visitedFormatId?: number };
      delete value.inetFormatId;
      delete value.visitedFormatId;
      check(required(decodeWriterDocument(stripped).paragraphs[0]), 0, 0);
    },
  );
  it("retains native values through same/foreign copies and actual retained undo text", /** Verifies existing core copies remain authoritative alongside repaired serialization. @returns Nothing. */ function nativeCopies(): void {
    const { doc, node } = linked(65000, 65535),
      original = check(node, 65000, 65535);
    for (const target of [doc, new SwDoc()]) {
      const copy = node.CloneTo(target.GetNodes());
      expect(check(copy, 65000, 65535).equals(original)).toBe(true);
      expect(actual(copy)).not.toBe(actual(node));
      expect(actual(copy).format).not.toBe(original);
    }
    const fragment = node.CaptureTextFragment(0, node.Len()),
      history = doc.GetUndoManager().GetUndoNodes(),
      id = history.RetainText(fragment);
    const retained = history.GetText(id).hints.Get(0) as SwTextINetFormat;
    expect(retained.GetpTextNode()).toBeUndefined();
    expect(retained.format.GetINetFormatId()).toBe(65000);
    expect(retained.format.GetVisitedFormatId()).toBe(65535);
    original.SetINetFormatAndId("later", SwPoolFormatId.ZERO);
    node.SetText("changed");
    ReplaceUndoRange(doc, node, 0, node.Len(), history.GetText(id));
    expect(node.GetText()).toBe("abcdef");
    check(node, 65000, 65535);
    check(
      required(
        restoreOdtWriterTransfer(structuredClone(createOdtWriterTransfer(doc))).paragraphs[0],
      ),
      65000,
      65535,
    );
    history.Release(id);
  });
  it.each(["inetFormatId", "visitedFormatId"] as const)(
    "rejects invalid %s in the real Worker graph",
    /** Checks validation at the actual graph decoder,not only the helper. @param field - Corrupted native identity. @returns Nothing. */ function invalidGraph(
      field,
    ): void {
      const { doc } = linked(1030, 1031),
        record = structuredClone(encodeWriterDocument(doc)),
        hint = required(record.textNodes[0]?.hints[0]);
      if (hint.kind !== "hyperlink") throw new Error("Missing invalid internet record");
      (hint.hyperlink as unknown as Record<string, unknown>)[field] = 65536;
      expect(decodeWriterDocument.bind(undefined, record)).toThrow("snapshot is invalid");
      expect(
        restoreOdtWriterTransfer.bind(undefined, { transferVersion: 5, graph: record }),
      ).toThrow("snapshot is invalid");
    },
  );
});
