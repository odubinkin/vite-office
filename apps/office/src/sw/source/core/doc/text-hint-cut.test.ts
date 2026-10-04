/** @fileoverview Checks literal native CutImpl flag boundaries through actual Writer cross-node moves and independent snapshot owners. */
import { describe, expect, it } from "vitest";
import { SvxWeightItem } from "../../../../editeng/source/items/textitem";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SwDoc } from "./doc";
import { SwPaM, SwPosition } from "../crsr/pam";
import { SwpHints } from "../txtnode/ndhints";
import { SwFormatAutoFormat, SwTextAttr } from "../txtnode/txatbase";
import { SwFormatINetFormat } from "../txtnode/fmtatr2";
import { CopyUndoFragment, ReplaceUndoRange } from "../undo/undobj";

/** Literal attribute range from the native cut boundary matrix. */
type Span = readonly [number, number];
/** Independent expected source and destination state for one boundary relation. */
interface CutCase {
  readonly label: string;
  readonly hint: Span;
  readonly moved?: Span;
  readonly remaining?: Span;
  readonly retained?: boolean;
}
const cases: readonly CutCase[] = [
  { label: "starts before, ends inside", hint: [1, 5], moved: [1, 3], remaining: [1, 3] },
  { label: "starts before, ends at cut end", hint: [1, 7], moved: [1, 5], remaining: [1, 3] },
  { label: "covers entire cut", hint: [1, 9], moved: [1, 5], remaining: [1, 5] },
  { label: "starts inside, ends after", hint: [4, 9], moved: [2, 5], remaining: [3, 5] },
  { label: "starts at cut start, ends after", hint: [3, 9], moved: [1, 5], remaining: [3, 5] },
  { label: "strictly interior", hint: [4, 6], moved: [2, 4], retained: true },
  { label: "starts at cut start, ends before", hint: [3, 6], moved: [1, 4], retained: true },
  { label: "starts inside, ends at cut end", hint: [4, 7], moved: [2, 5] },
  { label: "matches both cut boundaries", hint: [3, 7], moved: [1, 5] },
  { label: "strictly before cut", hint: [0, 2], remaining: [0, 2] },
  { label: "touches cut start", hint: [1, 3], remaining: [1, 3] },
  { label: "starts at cut end", hint: [7, 9], remaining: [3, 5] },
  { label: "strictly after cut", hint: [8, 10], remaining: [4, 6] },
];
const masks = [0, 1, 2, 3, 4, 5, 6, 7];

/** Requires a real owner. @param value - Optional owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing cut owner");
  return value;
}
/** Builds the two concrete attribute families. @param doc - Owner. @param span - Attribute range. @param mask - Flag combination. @returns Source container. */
function hints(doc: SwDoc, span: Span, mask: number): SwpHints {
  const set = new SfxItemSet(doc.GetAttrPool(), [[1, 49]]);
  set.Put(new SvxWeightItem(8, 15));
  const attrs = [
    new SwTextAttr(new SwFormatAutoFormat(set), ...span),
    new SwTextAttr(
      new SwFormatINetFormat({
        url: "https://example.test/cut",
        name: "Cut",
        targetFrame: "_blank",
      }),
      ...span,
    ),
  ];
  for (const attr of attrs) {
    attr.dontExpand = Boolean(mask & 1);
    attr.dontExpandStart = Boolean(mask & 2);
    attr.dontMoveAttr = Boolean(mask & 4);
  }
  return new SwpHints(doc.GetAttrPool(), attrs);
}
/** Checks a native attribute family pair. @param value - Optional container. @param span - Expected range, or absence. @param mask - Expected flags. @returns Nothing. */
function expectHints(value: SwpHints | undefined, span: Span | undefined, mask: number): void {
  if (span === undefined) {
    expect(value?.Count() ?? 0).toBe(0);
    return;
  }
  const container = required(value);
  expect(container.Count()).toBe(2);
  for (const attr of container.entries())
    expect(attr).toMatchObject({
      start: span[0],
      end: span[1],
      dontExpand: Boolean(mask & 1),
      dontExpandStart: Boolean(mask & 2),
      dontMoveAttr: Boolean(mask & 4),
    });
  expect(container.Get(0).Which()).toBe(53);
  expect(container.Get(1).Which()).toBe(54);
}

describe("native cross-node cut hint boundaries", /** Registers concrete source and target ownership cases. @returns Nothing. */ () => {
  for (const c of cases)
    it.each(masks)(
      c.label + " with mask %s",
      /** Checks literal ranges and flags through actual MoveRange. @param mask - Independent source flags. @returns Nothing. */ (
        mask,
      ) => {
        const doc = new SwDoc(),
          source = required(doc.paragraphs[0]),
          target = doc.GetNodes().MakeTextNode();
        source.SetText("abcdefghij");
        target.SetText("XYZ");
        const original = hints(doc, c.hint, mask);
        source.SetTextHints(original);
        const retained = CopyUndoFragment(source.CaptureTextFragment(0, 10));
        const sourceHandle = (original.Get(0).format as SwFormatAutoFormat).GetStyleHandle();
        const destination = doc
          .GetDocumentContentOperationsManager()
          .MoveRange(
            new SwPaM(new SwPosition(source, 7), new SwPosition(source, 3)),
            new SwPosition(target, 1),
          );
        expect(source.GetText()).toBe("abchij");
        expect(target.GetText()).toBe("XdefgYZ");
        expect(destination.GetNode()).toBe(target);
        expect(destination.GetContentIndex()).toBe(5);
        expectHints(target.GetpSwpHints(), c.moved, c.retained ? mask : 0);
        expectHints(source.GetpSwpHints(), c.remaining, mask);
        expectHints(original, c.hint, mask);
        expectHints(retained.hints, c.hint, mask);
        for (const node of [source, target]) {
          const owned = node.GetpSwpHints();
          if (owned !== undefined) {
            expect((owned.Get(0).format as SwFormatAutoFormat).GetStyleHandle()).toBe(sourceHandle);
            expect((owned.Get(0).format as SwFormatAutoFormat).GetStyleHandle().GetPool()).toBe(
              doc.GetAttrPool(),
            );
            expect(owned.Get(1).format.QueryValue()).toBe(original.Get(1).format.QueryValue());
          }
        }
        ReplaceUndoRange(doc, source, 0, source.Len(), retained);
        expect(source.GetText()).toBe("abcdefghij");
        expectHints(source.GetpSwpHints(), c.hint, mask);
        expect(
          (required(source.GetpSwpHints()).Get(0).format as SwFormatAutoFormat).GetStyleHandle(),
        ).toBe(sourceHandle);
      },
    );
  it.each(masks)(
    "distinguishes cut slices from retained undo snapshots for mask %s",
    /** Checks the range owner without invoking a browser DTO. @param mask - Source flags. @returns Nothing. */ (
      mask,
    ) => {
      const doc = new SwDoc(),
        original = hints(doc, [1, 9], mask);
      const snapshot = original.slice(3, 7),
        cut = original.sliceForCut(3, 7);
      expectHints(snapshot, [0, 4], mask);
      expectHints(cut, [0, 4], 0);
      const undo = doc.GetUndoManager().GetUndoNodes(),
        id = undo.RetainText({ text: "defg", hints: snapshot });
      expectHints(undo.GetText(id).hints, [0, 4], mask);
      expectHints(original, [1, 9], mask);
      expect((cut.Get(0).format as SwFormatAutoFormat).GetStyleHandle()).toBe(
        (original.Get(0).format as SwFormatAutoFormat).GetStyleHandle(),
      );
      undo.Release(id);
    },
  );
  it.each([
    [0.5, 4],
    [-1, 4],
    [4, 3],
    [1, 4.5],
  ])(
    "rejects invalid cut slice %s..%s without mutating source",
    /** Checks shared bounded offset validation. @param start - Invalid start or end pair. @param end - Candidate end. @returns Nothing. */ (
      start,
      end,
    ) => {
      const original = hints(new SwDoc(), [1, 9], 7);
      expect(
        /** Attempts invalid cut slicing. @returns No fragment. */ () =>
          original.sliceForCut(start, end),
      ).toThrow("hint slice is invalid");
      expectHints(original, [1, 9], 7);
    },
  );
  it("keeps empty cuts empty and moves plain text without allocating hints", /** Checks empty and absent containers. @returns Nothing. */ () => {
    const doc = new SwDoc(),
      source = required(doc.paragraphs[0]),
      target = doc.GetNodes().MakeTextNode();
    expect(hints(doc, [1, 9], 7).sliceForCut(3, 3).Count()).toBe(0);
    expect(new SwpHints(doc.GetAttrPool()).sliceForCut(0, 0).Count()).toBe(0);
    source.SetText("abcdefghij");
    target.SetText("XYZ");
    doc
      .GetDocumentContentOperationsManager()
      .MoveRange(
        new SwPaM(new SwPosition(source, 7), new SwPosition(source, 3)),
        new SwPosition(target, 1),
      );
    expect(source.GetText()).toBe("abchij");
    expect(target.GetText()).toBe("XdefgYZ");
    expect(source.GetpSwpHints()).toBeUndefined();
    expect(target.GetpSwpHints()).toBeUndefined();
  });
  it.each(masks)(
    "preserves the existing same-node adapter and snapshots for mask %s",
    /** Checks adapter stability without claiming native CutImpl same-node support. @param mask - Source flags. @returns Nothing. */ (
      mask,
    ) => {
      const doc = new SwDoc(),
        node = required(doc.paragraphs[0]);
      node.SetText("abcdefghij");
      const original = hints(doc, [3, 7], mask);
      node.SetTextHints(original);
      doc
        .GetDocumentContentOperationsManager()
        .MoveRange(
          new SwPaM(new SwPosition(node, 7), new SwPosition(node, 3)),
          new SwPosition(node, 10),
        );
      expect(node.GetText()).toBe("abchijdefg");
      expectHints(node.GetpSwpHints(), [6, 10], mask);
      expectHints(original, [3, 7], mask);
    },
  );
});
