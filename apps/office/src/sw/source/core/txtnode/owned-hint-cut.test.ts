/** @fileoverview Verifies native cut hint identity and consumable container ownership independently of node snapshots. */
import { describe, expect, it } from "vitest";
import { SvxWeightItem } from "../../../../editeng/source/items/textitem";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SwDoc } from "../doc/doc";
import { SwpHints } from "./ndhints";
import { SwTextAttrEnd, SwFormatAutoFormat } from "./txatbase";
import { SwFormatINetFormat } from "./fmtatr2";
const masks = [0, 1, 2, 3, 4, 5, 6, 7];
/** Literal source, moved and remaining ranges for one cut relationship. */
interface Boundary {
  readonly source: readonly [number, number];
  readonly moved?: readonly [number, number];
  readonly remaining?: readonly [number, number];
  readonly transfer?: boolean;
}
const cases: readonly Boundary[] = [
  { source: [4, 6], moved: [1, 3], transfer: true },
  { source: [3, 6], moved: [0, 3], transfer: true },
  { source: [3, 7], moved: [0, 4] },
  { source: [4, 9], moved: [1, 4], remaining: [3, 5] },
  { source: [1, 5], moved: [0, 2], remaining: [1, 3] },
  { source: [1, 9], moved: [0, 4], remaining: [1, 5] },
  { source: [0, 2], remaining: [0, 2] },
  { source: [8, 10], remaining: [4, 6] },
];
/** Builds caller-owned hint input, then copies it into the real container. @param doc - Owner. @param start - Inclusive offset. @param end - Exclusive offset. @param mask - Independent flags. @returns Actual container. */
function fixture(doc: SwDoc, start: number, end: number, mask: number): SwpHints {
  const set = new SfxItemSet(doc.GetAttrPool(), [[1, 49]]);
  set.Put(new SvxWeightItem(8, 15));
  const attrs = [
    new SwTextAttrEnd(new SwFormatAutoFormat(set), start, end),
    new SwTextAttrEnd(
      new SwFormatINetFormat({
        url: "https://example.test/owned",
        name: "Owned",
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
  return new SwpHints(doc.GetAttrPool(), attrs);
}
/** Checks independent flag state. @param hints - Container. @param mask - Expected mask. @param fresh - Native constructor defaults. @returns Nothing. */
function flags(hints: SwpHints, mask: number, fresh = false): void {
  for (const attr of hints.entries())
    expect(attr).toMatchObject({
      dontExpand: fresh && attr.Which() === 54 ? true : Boolean(mask & 1),
      dontExpandStart: fresh && attr.Which() === 54 ? true : Boolean(mask & 2),
      dontMoveAttr: Boolean(mask & 4),
    });
}

describe("owned cut containers", /** Registers actual transfer and copy ownership cases. @returns Nothing. */ () => {
  for (const boundary of cases)
    it.each(masks)(
      "owns boundary " + boundary.source.join("..") + " for mask %s",
      /** Checks independent literal identity/range/flag expectations. @param mask - Source flags. @returns Nothing. */ (
        mask,
      ) => {
        const doc = new SwDoc(),
          source = fixture(doc, ...boundary.source, mask),
          snapshot = source.clone(),
          original = [...source.entries()];
        const fragment = source.Cut(3, 7);
        expect(snapshot.Get(0)).not.toBe(original[0]);
        expect(snapshot.Get(0).format).not.toBe(original[0]?.format);
        expect(snapshot.Get(0)).toMatchObject({
          start: boundary.source[0],
          end: boundary.source[1],
        });
        flags(snapshot, mask);
        if (boundary.remaining === undefined) expect(source.Count()).toBe(0);
        else {
          expect(source.Count()).toBe(2);
          for (let i = 0; i < 2; i++) {
            expect(source.Get(i)).toBe(original[i]);
            expect(source.Get(i)).toMatchObject({
              start: boundary.remaining[0],
              end: boundary.remaining[1],
            });
          }
          flags(source, mask);
        }
        if (boundary.moved === undefined) expect(fragment.Count()).toBe(0);
        else {
          expect(fragment.Count()).toBe(2);
          for (let i = 0; i < 2; i++) {
            expect(fragment.Get(i)).toMatchObject({
              start: boundary.moved[0],
              end: boundary.moved[1],
            });
            if (boundary.transfer) {
              expect(fragment.Get(i)).toBe(original[i]);
              expect(fragment.Get(i).format).toBe(original[i]?.format);
            } else {
              expect(fragment.Get(i)).not.toBe(original[i]);
              expect(fragment.Get(i).format).not.toBe(original[i]?.format);
            }
            expect(fragment.Get(i).format.QueryValue()).toEqual(
              snapshot.Get(i).format.QueryValue(),
            );
          }
          flags(fragment, boundary.transfer ? mask : 0, !boundary.transfer);
          expect((fragment.Get(1).format as SwFormatAutoFormat).GetStyleHandle()).toBe(
            (snapshot.Get(1).format as SwFormatAutoFormat).GetStyleHandle(),
          );
          const actual = [...fragment.entries()],
            kept = fragment.clone();
          const target = new SwpHints(doc.GetAttrPool()).replaceRange(6, 2, 2, fragment, 4, true);
          expect(fragment.Count()).toBe(0);
          for (let i = 0; i < 2; i++) {
            expect(target.Get(i)).toBe(actual[i]);
            expect(target.Get(i)).toMatchObject({
              start: boundary.moved[0] + 2,
              end: boundary.moved[1] + 2,
            });
          }
          expect(kept.Get(0)).toMatchObject({ start: boundary.moved[0], end: boundary.moved[1] });
          flags(kept, boundary.transfer ? mask : 0, !boundary.transfer);
          expect(kept.Get(0)).not.toBe(target.Get(0));
        }
      },
    );
  it.each(masks)(
    "keeps cut previews independent at exact and interior boundaries for mask %s",
    /** Checks boundary reconstruction without consuming source ownership. @param mask - Source flags. @returns Nothing. */ (
      mask,
    ) => {
      const doc = new SwDoc();
      for (const [start, end, expectedMask] of [
        [3, 7, 0],
        [4, 6, mask],
      ] as const) {
        const source = fixture(doc, start, end, mask),
          original = source.Get(1),
          preview = source.sliceForCut(3, 7);
        expect(source.Count()).toBe(2);
        expect(source.Get(1)).toBe(original);
        expect(original).toMatchObject({ start, end });
        flags(source, mask);
        flags(preview, expectedMask, end === 7);
        expect(preview.Get(1)).toMatchObject({ start: start - 3, end: end - 3 });
        expect(preview.Get(1)).not.toBe(original);
        expect(preview.Get(1).format).not.toBe(original.format);
        expect((preview.Get(1).format as SwFormatAutoFormat).GetStyleHandle()).toBe(
          (original.format as SwFormatAutoFormat).GetStyleHandle(),
        );
      }
    },
  );
  it("keeps zero cuts and default insertion snapshots independent", /** Checks no-op cut and default copy ownership. @returns Nothing. */ () => {
    const doc = new SwDoc(),
      source = fixture(doc, 1, 4, 7),
      first = source.Get(0);
    expect(source.Cut(2, 2).Count()).toBe(0);
    expect(source.Get(0)).toBe(first);
    expect(first).toMatchObject({ start: 1, end: 4 });
    const target = new SwpHints(doc.GetAttrPool()).replaceRange(6, 1, 2, source, 4);
    expect(source.Count()).toBe(2);
    expect(target.Get(0)).not.toBe(first);
    expect(target.Get(0)).toMatchObject({ start: 2, end: 5 });
    expect(first).toMatchObject({ start: 1, end: 4 });
    flags(source, 7);
    expect(new SwpHints(doc.GetAttrPool()).Cut(0, 0).Count()).toBe(0);
  });
  it.each([
    [0.5, 4],
    [-1, 4],
    [4, 3],
    [1, 4.5],
  ])(
    "rejects invalid owned cut %s..%s before mutation",
    /** Checks shared offset guard with owned source state. @param start - Candidate start. @param end - Candidate end. @returns Nothing. */ (
      start,
      end,
    ) => {
      const source = fixture(new SwDoc(), 1, 9, 7),
        original = source.Get(0);
      expect(
        /** Attempts invalid cut. @returns No fragment. */ () => source.Cut(start, end),
      ).toThrow("hint slice is invalid");
      expect(source.Get(0)).toBe(original);
      expect(original).toMatchObject({ start: 1, end: 9 });
    },
  );
  it("rejects foreign consumable transfer before touching either container", /** Checks destination-pool transfer precondition. @returns Nothing. */ () => {
    const source = fixture(new SwDoc(), 1, 4, 7),
      doc = new SwDoc(),
      target = fixture(doc, 0, 1, 3),
      a = source.Get(0),
      b = target.Get(0);
    expect(
      /** Attempts foreign ownership transfer. @returns No combined hints. */ () =>
        target.replaceRange(6, 2, 2, source, 4, true),
    ).toThrow("same document pool");
    expect(source.Get(0)).toBe(a);
    expect(target.Get(0)).toBe(b);
    expect(a).toMatchObject({ start: 1, end: 4 });
    expect(b).toMatchObject({ start: 0, end: 1 });
  });
  it("normalizes retained source portions without replacing the surviving object", /** Checks normalization after cutting a gap. @returns Nothing. */ () => {
    const doc = new SwDoc(),
      source = fixture(doc, 0, 3, 7),
      head = source.Get(0),
      tail = head.clone();
    tail.start = 7;
    tail.SetEnd(10);
    source.replace([head, tail]);
    const actualHead = source.Get(0),
      actualTail = source.Get(1);
    expect(source.Cut(3, 7).Count()).toBe(0);
    expect(source.Count()).toBe(2);
    expect(source.Get(0)).toBe(actualHead);
    expect(source.Get(0)).toMatchObject({ start: 0, end: 3 });
    expect(actualTail).toMatchObject({ start: 3, end: 6 });
  });
});
