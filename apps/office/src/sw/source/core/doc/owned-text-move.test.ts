/** @fileoverview Checks physical hint/item transfer through real cross-node moves and independent undo fragment owners. */
import { describe, expect, it } from "vitest";
import { SvxWeightItem } from "../../../../editeng/source/items/textitem";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SwDoc } from "./doc";
import { SwPaM, SwPosition } from "../crsr/pam";
import { SwpHints } from "../txtnode/ndhints";
import { SwTextNode } from "../txtnode/ndtxt";
import { SwTextAttrEnd, SwFormatAutoFormat } from "../txtnode/txatbase";
import { SwFormatINetFormat } from "../txtnode/fmtatr2";
import { ReplaceUndoRange } from "../undo/undobj";
const masks = [0, 1, 2, 3, 4, 5, 6, 7];
/** Requires an actual model owner. @param value - Optional owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing owned move owner");
  return value;
}
/** Creates a real paragraph with the two supported owned hint families. @param start - Inclusive hint offset. @param end - Exclusive hint offset. @param mask - Flag combination. @returns Actual graph owners. */
function fixture(start: number, end: number, mask: number) {
  const doc = new SwDoc(),
    source = required(doc.paragraphs[0]),
    target = doc.GetNodes().MakeTextNode();
  source.SetText("abcdefghij");
  target.SetText("XY");
  const set = new SfxItemSet(doc.GetAttrPool(), [[1, 49]]);
  set.Put(new SvxWeightItem(8, 15));
  const attrs = [
    new SwTextAttrEnd(new SwFormatAutoFormat(set), start, end),
    new SwTextAttrEnd(
      new SwFormatINetFormat({
        url: "https://example.test/actual-owned",
        name: "Transfer",
        targetFrame: "_blank",
      }),
      start,
      end,
    ),
  ];
  for (const attr of attrs) {
    attr.dontExpand = Boolean(mask & 1);
    attr.dontExpandStart = Boolean(mask & 2);
    attr.dontMoveAttr = Boolean(mask & 4);
  }
  source.SetTextHints(new SwpHints(doc.GetAttrPool(), attrs));
  return { doc, source, target };
}
/** Reads actual owned hint objects. @param node - Real node. @returns Independent array of owned references. */
function owned(node: SwTextNode) {
  return [...required(node.GetpSwpHints()).entries()];
}
/** Checks range and independent flags for the two supported families. @param node - Actual node. @param start - Inclusive offset. @param end - Exclusive offset. @param mask - Flag combination. @param fresh - Native constructor defaults. @returns Nothing. */
function expectHints(
  node: SwTextNode,
  start: number,
  end: number,
  mask: number,
  fresh = false,
): void {
  const attrs = owned(node);
  expect(attrs).toHaveLength(2);
  for (const attr of attrs)
    expect(attr).toMatchObject({
      start,
      end,
      dontExpand: fresh && attr.Which() === 54 ? true : Boolean(mask & 1),
      dontExpandStart: fresh && attr.Which() === 54 ? true : Boolean(mask & 2),
      dontMoveAttr: Boolean(mask & 4),
    });
}

describe("real owned text moves", /** Registers node and document operation ownership cases. @returns Nothing. */ () => {
  for (const kind of ["interior", "split", "exact"] as const)
    it.each(masks)(
      "moves " + kind + " hints with mask %s",
      /** Checks physical identity versus native reconstruction through actual manager. @param mask - Source flags. @returns Nothing. */ (
        mask,
      ) => {
        const f =
          kind === "interior"
            ? fixture(4, 6, mask)
            : kind === "split"
              ? fixture(1, 9, mask)
              : fixture(3, 7, mask);
        const actual = owned(f.source),
          sourceContainer = required(f.source.GetpSwpHints()),
          history = f.source.CaptureTextFragment(0, 10),
          targetHistory = f.target.CaptureTextFragment(0, 2);
        const sourceHandle = (required(actual[1]).format as SwFormatAutoFormat).GetStyleHandle();
        const left = new SwPosition(f.source, 1),
          inside = new SwPosition(f.source, 4),
          right = new SwPosition(f.source, 9);
        const position = f.doc
          .GetDocumentContentOperationsManager()
          .MoveRange(
            new SwPaM(new SwPosition(f.source, 7), new SwPosition(f.source, 3)),
            new SwPosition(f.target, 1),
          );
        expect(position.GetNode()).toBe(f.target);
        expect(position.GetContentIndex()).toBe(5);
        expect(f.source.GetText()).toBe("abchij");
        expect(f.target.GetText()).toBe("XdefgY");
        expect(left.GetContentIndex()).toBe(1);
        expect(inside.GetContentIndex()).toBe(3);
        expect(right.GetContentIndex()).toBe(5);
        const transferred = owned(f.target);
        if (kind === "interior") {
          expectHints(f.target, 2, 4, mask);
          expect(f.source.GetpSwpHints()).toBeUndefined();
          expect(sourceContainer.Count()).toBe(0);
          for (let i = 0; i < 2; i++) {
            expect(transferred[i]).toBe(actual[i]);
            expect(transferred[i]?.format).toBe(actual[i]?.format);
          }
        } else {
          expectHints(f.target, 1, 5, 0, true);
          for (let i = 0; i < 2; i++) {
            expect(transferred[i]).not.toBe(actual[i]);
            expect(transferred[i]?.format).not.toBe(actual[i]?.format);
          }
          if (kind === "split") {
            expect(f.source.GetpSwpHints()).toBe(sourceContainer);
            expectHints(f.source, 1, 5, mask);
            for (let i = 0; i < 2; i++) expect(owned(f.source)[i]).toBe(actual[i]);
          } else expect(f.source.GetpSwpHints()).toBeUndefined();
        }
        expect((required(transferred[1]).format as SwFormatAutoFormat).GetStyleHandle()).toBe(
          sourceHandle,
        );
        expect(
          (required(transferred[1]).format as SwFormatAutoFormat).GetStyleHandle().GetPool(),
        ).toBe(f.doc.GetAttrPool());
        expect(history.text).toBe("abcdefghij");
        expect(history.hints.Get(0)).toMatchObject({
          start: kind === "interior" ? 4 : kind === "split" ? 1 : 3,
          end: kind === "interior" ? 6 : kind === "split" ? 9 : 7,
        });
        expect(history.hints.Get(0)).not.toBe(actual[0]);
        expect(history.hints.Get(0).format).not.toBe(actual[0]?.format);
        expect(targetHistory.text).toBe("XY");
        expect(targetHistory.hints.Count()).toBe(0);
        ReplaceUndoRange(f.doc, f.source, 0, f.source.Len(), history);
        expect(f.source.GetText()).toBe("abcdefghij");
        expect(owned(f.source)[0]).not.toBe(transferred[0]);
        expect((required(owned(f.source)[1]).format as SwFormatAutoFormat).GetStyleHandle()).toBe(
          sourceHandle,
        );
        expect(f.target.GetText()).toBe("XdefgY");
      },
    );
  it.each(masks)(
    "keeps the same moved objects through repeated transfers for mask %s",
    /** Checks ownership across multiple live destinations and retained undo nodes. @param mask - Source flags. @returns Nothing. */ (
      mask,
    ) => {
      const f = fixture(4, 6, mask),
        actual = owned(f.source),
        undo = f.doc.GetUndoManager().GetUndoNodes(),
        id = undo.RetainText(f.source.CaptureTextFragment(0, 10));
      f.doc
        .GetDocumentContentOperationsManager()
        .MoveRange(
          new SwPaM(new SwPosition(f.source, 7), new SwPosition(f.source, 3)),
          new SwPosition(f.target, 1),
        );
      const third = f.doc.GetNodes().MakeTextNode();
      third.SetText("Z");
      f.doc
        .GetDocumentContentOperationsManager()
        .MoveRange(
          new SwPaM(new SwPosition(f.target, 5), new SwPosition(f.target, 1)),
          new SwPosition(third, 0),
        );
      expect(f.target.GetText()).toBe("XY");
      expect(f.target.GetpSwpHints()).toBeUndefined();
      expect(third.GetText()).toBe("defgZ");
      expectHints(third, 1, 3, mask);
      for (let i = 0; i < 2; i++) expect(owned(third)[i]).toBe(actual[i]);
      expect(undo.GetText(id).hints.Get(0)).toMatchObject({
        start: 4,
        end: 6,
        dontExpand: Boolean(mask & 1),
        dontExpandStart: Boolean(mask & 2),
        dontMoveAttr: Boolean(mask & 4),
      });
      expect(undo.GetText(id).hints.Get(0)).not.toBe(actual[0]);
      undo.Release(id);
    },
  );
  it("consumes a real cut packet only through explicit ownership insertion", /** Checks node-level packet handoff separately from manager orchestration. @returns Nothing. */ () => {
    const f = fixture(4, 6, 7),
      actual = owned(f.source),
      fragment = f.source.CutTextFragment(3, 7),
      snapshot = { text: fragment.text, hints: fragment.hints.clone() };
    expect(fragment.text).toBe("defg");
    expect(fragment.hints.Get(0)).toBe(actual[0]);
    f.target.ReplaceRange(1, 1, fragment, true);
    expect(fragment.hints.Count()).toBe(0);
    expect(owned(f.target)[0]).toBe(actual[0]);
    expect(snapshot.hints.Get(0)).toMatchObject({
      start: 1,
      end: 3,
      dontExpand: true,
      dontExpandStart: true,
      dontMoveAttr: true,
    });
    expect(snapshot.hints.Get(0)).not.toBe(actual[0]);
  });
  it("rejects a foreign owned packet before changing destination text or consuming it", /** Checks destination ownership precondition at actual node boundary. @returns Nothing. */ () => {
    const f = fixture(4, 6, 7),
      foreign = new SwDoc(),
      node = required(foreign.paragraphs[0]),
      fragment = f.source.CutTextFragment(3, 7),
      actual = fragment.hints.Get(0);
    node.SetText("XYZ");
    expect(
      /** Attempts foreign insertion. @returns No mutation. */ () =>
        node.ReplaceRange(1, 1, fragment, true),
    ).toThrow("same document pool");
    expect(node.GetText()).toBe("XYZ");
    expect(node.GetpSwpHints()).toBeUndefined();
    expect(fragment.hints.Count()).toBe(2);
    expect(fragment.hints.Get(0)).toBe(actual);
    expect(actual).toMatchObject({ start: 1, end: 3 });
  });
  it("keeps zero cuts and plain cuts bounded without allocating stored hints", /** Checks text-only and empty ranges. @returns Nothing. */ () => {
    const f = fixture(4, 6, 7),
      actual = owned(f.source),
      container = f.source.GetpSwpHints();
    expect(f.source.CutTextFragment(3, 3).text).toBe("");
    expect(f.source.GetpSwpHints()).toBe(container);
    expect(owned(f.source)[0]).toBe(actual[0]);
    const plain = new SwDoc(),
      node = required(plain.paragraphs[0]);
    node.SetText("abcdefghij");
    const fragment = node.CutTextFragment(3, 7);
    expect(fragment.text).toBe("defg");
    expect(fragment.hints.Count()).toBe(0);
    expect(node.GetText()).toBe("abchij");
    expect(node.GetpSwpHints()).toBeUndefined();
    expect(node.CutTextFragment(0, 0).hints.Count()).toBe(0);
  });
  it.each([
    [0.5, 7],
    [-1, 7],
    [7, 3],
    [3, 11],
  ])(
    "rejects invalid actual cut %s..%s before mutation",
    /** Checks text bounds independently of hint bounds. @param start - Candidate start. @param end - Candidate end. @returns Nothing. */ (
      start,
      end,
    ) => {
      const f = fixture(4, 6, 7),
        actual = owned(f.source),
        container = f.source.GetpSwpHints();
      expect(
        /** Attempts invalid node cut. @returns No fragment. */ () =>
          f.source.CutTextFragment(start, end),
      ).toThrow("outside the text node");
      expect(f.source.GetText()).toBe("abcdefghij");
      expect(f.source.GetpSwpHints()).toBe(container);
      expect(owned(f.source)[0]).toBe(actual[0]);
    },
  );
});
