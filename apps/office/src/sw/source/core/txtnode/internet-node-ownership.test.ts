/** @fileoverview Checks literal internet node backlinks across actual maps, snapshots, copies and transfers. */
import { describe, expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwTextNode } from "./ndtxt";
import { SwpHints } from "./ndhints";
import { SwFormatINetFormat } from "./fmtatr2";
import { SwTextINetFormat } from "./txtatr2";
import { MakeTextAttr } from "./thints";
import { ReplaceTextNodeHints } from "./ndtxt-hints";

/** Requires an existing test object. @param value - Optional value. @returns Existing value. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing internet owner");
  return value;
}
/** Reads a concrete actual link. @param hints - Actual map. @returns Internet attribute. */
function link(hints: SwpHints): SwTextINetFormat {
  const attr = hints.Get(0);
  expect(attr).toBeInstanceOf(SwTextINetFormat);
  return attr as SwTextINetFormat;
}
/** Builds a linked node. @param doc - Document. @returns Existing node. */
function node(doc: SwDoc): SwTextNode {
  const value = required(doc.paragraphs[0]);
  value.SetText("abcdefghij");
  value.SetHyperlink(3, 6, { url: "node", name: "owned" });
  return value;
}
/** Checks node APIs and map/item identities. @param attr - Actual link. @param owner - Expected node. @param hints - Actual container. @returns Nothing. */
function owned(attr: SwTextINetFormat, owner: SwTextNode, hints: SwpHints): void {
  expect(attr.GetpTextNode()).toBe(owner);
  expect(attr.GetTextNode()).toBe(owner);
  expect(attr.m_pHints).toBe(hints);
  expect(hints.Get(0)).toBe(attr);
  expect(hints.GetSortedByEnd(0)).toBe(attr);
  expect(hints.GetSortedByWhichAndStart(0)).toBe(attr);
  expect(attr.format.GetTextINetFormat()).toBe(attr);
}
describe("internet text node ownership", /** Registers actual node ownership boundaries. @returns Nothing. */ function ownershipCases(): void {
  it("starts detached and follows the native explicit node setter", /** Checks native detached defaults and explicit rebinding. @returns Nothing. */ function nativeContract(): void {
    const doc = new SwDoc(),
      a = node(doc),
      b = doc.GetNodes().MakeTextNode();
    const attr = new SwTextINetFormat(new SwFormatINetFormat({ url: "detached" }), 1, 4);
    expect(attr.GetpTextNode()).toBeUndefined();
    expect(
      /** Attempts access to an unbound attribute. @returns No node. */ function unboundRead(): SwTextNode {
        return attr.GetTextNode();
      },
    ).toThrow("no text node");
    attr.ChgTextNode(a);
    expect(attr.GetTextNode()).toBe(a);
    attr.ChgTextNode(b);
    expect(attr.GetTextNode()).toBe(b);
    attr.ChgTextNode(undefined);
    expect(attr.GetpTextNode()).toBeUndefined();
    const made = MakeTextAttr(doc, attr.format, 1, 4) as SwTextINetFormat;
    expect(made.GetpTextNode()).toBeUndefined();
    expect(made.format.GetTextINetFormat()).toBe(made);
  });
  it("binds replacements and detaches retained old maps and caller input", /** Checks independent replacement and old map detachment. @returns Nothing. */ function replaceMap(): void {
    const doc = new SwDoc(),
      a = node(doc),
      old = required(a.GetpSwpHints()),
      original = link(old);
    const input = old.clone(),
      detached = link(input);
    original.SetPriorityAttr(true);
    a.SetTextHints(old);
    const current = required(a.GetpSwpHints()),
      fresh = link(current);
    owned(fresh, a, current);
    expect(fresh).not.toBe(original);
    expect(fresh.format).not.toBe(original.format);
    expect(fresh.IsPriorityAttr()).toBe(true);
    expect(original.GetpTextNode()).toBeUndefined();
    expect(original.m_pHints).toBe(old);
    expect(old.Get(0)).toBe(original);
    expect(detached.GetpTextNode()).toBeUndefined();
    expect(detached.m_pHints).toBe(input);
    current.replace(input.entries());
    expect(fresh.GetpTextNode()).toBeUndefined();
    expect(fresh.m_pHints).toBeUndefined();
    owned(link(current), a, current);
  });
  it.each([false, true])(
    "copies into destination nodes with foreign=%s",
    /** Checks same and foreign destination ownership. @param foreign - Whether destination is another document. @returns Nothing. */ function copyNode(
      foreign,
    ): void {
      const doc = new SwDoc(),
        a = node(doc),
        original = link(required(a.GetpSwpHints()));
      original.SetPriorityAttr(true);
      const target = foreign ? new SwDoc() : doc;
      const copied = a.CloneTo(target.GetNodes()),
        map = required(copied.GetpSwpHints()),
        attr = link(map);
      owned(attr, copied, map);
      expect(attr).not.toBe(original);
      expect(attr.format).not.toBe(original.format);
      expect(attr.IsPriorityAttr()).toBe(false);
      expect(attr.format.GetHyperlink()).toEqual({ url: "node", name: "owned" });
      owned(original, a, required(a.GetpSwpHints()));
      expect(
        link(required(a.GetpSwpHints()).CopyTo(target.GetAttrPool())).GetpTextNode(),
      ).toBeUndefined();
    },
  );
  it("keeps snapshots, slices and retained text detached", /** Checks detached snapshots and retained text. @returns Nothing. */ function detachedCopies(): void {
    const doc = new SwDoc(),
      a = node(doc),
      map = required(a.GetpSwpHints()),
      actual = link(map);
    const snapshot = a.CaptureTextFragment(0, 10),
      history = doc.GetUndoManager().GetUndoNodes(),
      id = history.RetainText(snapshot);
    const copies = [
      map.clone(),
      map.slice(2, 8),
      map.sliceForCut(2, 8),
      map.shifted(2),
      history.GetText(id).hints,
    ];
    for (const copy of copies) {
      const attr = link(copy);
      expect(attr.GetpTextNode()).toBeUndefined();
      expect(attr).not.toBe(actual);
      expect(attr.m_pHints).toBe(copy);
      expect(attr.format).not.toBe(actual.format);
    }
    history.Release(id);
    owned(actual, a, map);
  });
  it.each([
    { start: 3, end: 6, transfer: true, remaining: false },
    { start: 1, end: 9, transfer: false, remaining: true },
    { start: 3, end: 7, transfer: false, remaining: false },
  ])(
    "detaches and rebinds cut $start..$end with actual transfer=$transfer",
    /** Checks literal owned cut and destination links. @param boundary - Literal cut relation. @returns Nothing. */ function cutToNode(
      boundary,
    ): void {
      const doc = new SwDoc(),
        a = node(doc),
        b = doc.GetNodes().MakeTextNode();
      a.SetHyperlink(0, 10, undefined);
      a.SetHyperlink(boundary.start, boundary.end, { url: "move" });
      b.SetText("XY");
      const old = required(a.GetpSwpHints()),
        original = link(old),
        item = original.format;
      const fragment = a.CutTextFragment(3, 7),
        moved = link(fragment.hints);
      expect(moved.GetpTextNode()).toBeUndefined();
      expect(moved === original).toBe(boundary.transfer);
      if (boundary.remaining) owned(original, a, required(a.GetpSwpHints()));
      else expect(original.GetpTextNode()).toBeUndefined();
      b.ReplaceRange(1, 1, fragment, true);
      expect(fragment.hints.Count()).toBe(0);
      owned(moved, b, required(b.GetpSwpHints()));
      if (boundary.transfer) expect(moved.format).toBe(item);
      expect(a.GetText()).toBe("abchij");
      expect(b.GetText()).toBe("XdefgY");
    },
  );
  it("preserves owners when foreign adoption or invalid ranges fail", /** Checks rejected adoption and range atomicity. @returns Nothing. */ function invalidBinding(): void {
    const doc = new SwDoc(),
      a = node(doc),
      old = required(a.GetpSwpHints()),
      original = link(old);
    const other = new SwDoc(),
      b = node(other),
      foreign = required(b.GetpSwpHints()),
      foreignAttr = link(foreign);
    expect(
      /** Attempts foreign map adoption. @returns No adopted map. */ function adoptForeign():
        SwpHints | undefined {
        return ReplaceTextNodeHints(a, old, foreign);
      },
    ).toThrow("owning document pool");
    owned(original, a, old);
    owned(foreignAttr, b, foreign);
    const bad = new SwpHints(doc.GetAttrPool(), [
      new SwTextINetFormat(new SwFormatINetFormat({ url: "bad" }), 0, 11),
    ]);
    expect(
      /** Attempts invalid range ingestion. @returns Nothing. */ function invalidRange(): void {
        a.SetTextHints(bad);
      },
    ).toThrow("outside the text node");
    owned(original, a, old);
    expect(link(bad).GetpTextNode()).toBeUndefined();
    expect(ReplaceTextNodeHints(a, old, old)).toBe(old);
    const empty = doc.GetNodes().MakeTextNode().GetOrCreateSwpHints();
    expect(empty.Count()).toBe(0);
  });
});
