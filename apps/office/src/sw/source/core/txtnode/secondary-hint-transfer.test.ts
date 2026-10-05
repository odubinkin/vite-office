/** @fileoverview Checks secondary-map actual-object ownership across real cut/transfer, snapshots and undo without upstream access. */
import { afterEach, describe, expect, it, vi } from "vitest";
import { SvxWeightItem } from "../../../../editeng/source/items/textitem";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SwDoc } from "../doc/doc";
import { SwpHints } from "./ndhints";
import { SwTextAttrEnd, SwFormatAutoFormat } from "./txatbase";
import { SwFormatINetFormat } from "./fmtatr2";
import { ReplaceUndoRange } from "../undo/undobj";
afterEach(/** Releases owner spies. @returns Nothing. */ () => vi.restoreAllMocks());
/** Requires an actual graph object. @param value - Optional object. @returns Existing object. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing secondary-map owner");
  return value;
}
/** Builds independent supported families with distinct source/destination values. @param doc - Owner. @param start - Start. @param end - End. @param mask - Flags. @param destination - Distinct destination format. @returns Caller-owned container. */
function hints(
  doc: SwDoc,
  start: number,
  end: number,
  mask: number,
  destination = false,
): SwpHints {
  const set = new SfxItemSet(doc.GetAttrPool(), [[1, 49]]);
  set.Put(new SvxWeightItem(destination ? 5 : 8, 15));
  const attrs = [
    new SwTextAttrEnd(new SwFormatAutoFormat(set), start, end),
    new SwTextAttrEnd(
      new SwFormatINetFormat({
        url: destination ? "https://example.test/destination" : "https://example.test/source",
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
/** Checks all maps contain the same actual owner-bound objects. @param container - Actual owner. @returns Nothing. */
function owners(container: SwpHints): void {
  const actual = new Set(container.entries()),
    byEnd = new Set<SwTextAttrEnd<SwFormatAutoFormat | SwFormatINetFormat>>(),
    byWhich = new Set<SwTextAttrEnd<SwFormatAutoFormat | SwFormatINetFormat>>();
  for (let i = 0; i < container.Count(); i++) {
    byEnd.add(container.GetSortedByEnd(i));
    byWhich.add(container.GetSortedByWhichAndStart(i));
  }
  expect(byEnd).toEqual(actual);
  expect(byWhich).toEqual(actual);
  for (const hint of actual) expect(hint.m_pHints).toBe(container);
}
describe("secondary hint map transfer", /** Registers actual graph and ownership checks. @returns Nothing. */ () => {
  for (const kind of ["interior", "partial", "exact"] as const)
    it.each([0, 1, 2, 3, 4, 5, 6, 7])(
      "keeps three owned maps across " + kind + " move, flags=%s",
      /** Checks literal map order and independent snapshots/undo. @param mask - Flags. @returns Nothing. */ (
        mask,
      ) => {
        const doc = new SwDoc(),
          source = required(doc.paragraphs[0]),
          target = doc.GetNodes().MakeTextNode();
        source.SetText("abcdefghijklmnop");
        target.SetText("XYZW");
        const start = kind === "interior" ? 4 : kind === "partial" ? 1 : 3,
          end = kind === "interior" ? 6 : kind === "partial" ? 9 : 7;
        source.SetTextHints(hints(doc, start, end, mask));
        target.SetTextHints(hints(doc, 0, 4, 0, true));
        const sourceOwner = required(source.GetpSwpHints()),
          original = [...sourceOwner.entries()],
          snapshot = source.CaptureTextFragment(0, 16),
          undo = doc.GetUndoManager().GetUndoNodes(),
          id = undo.RetainText(snapshot);
        owners(sourceOwner);
        owners(snapshot.hints);
        const packet = source.CutTextFragment(3, 7),
          moved = [...packet.hints.entries()];
        owners(sourceOwner);
        owners(packet.hints);
        if (kind === "interior") {
          expect(sourceOwner.Count()).toBe(0);
          expect(packet.hints.GetSortedByEnd(0)).toBe(original[1]);
          expect(packet.hints.GetSortedByWhichAndStart(1)).toBe(original[0]);
        } else {
          for (const hint of moved) expect(original).not.toContain(hint);
          expect(sourceOwner.Count()).toBe(2);
          if (kind === "exact") {
            for (const hint of original) expect(hint).toMatchObject({ start: 3, end: 3 });
            expect(sourceOwner.entries()).toEqual(original);
          }
        }
        expect(packet.hints.GetLastPosSortedByEnd(kind === "interior" ? 2 : 3)).toBe(-1);
        const packetStarts = vi.spyOn(packet.hints, "StartPosChanged"),
          packetEnds = vi.spyOn(packet.hints, "EndPosChanged");
        target.ReplaceRange(2, 2, packet, true);
        expect(packet.hints.Count()).toBe(0);
        expect(packet.hints.GetLastPosSortedByEnd(20)).toBe(-1);
        expect(packet.hints.GetFirstPosSortedByWhichAndStart(53)).toBe(9007199254740991);
        expect(packetStarts).not.toHaveBeenCalled();
        expect(packetEnds).not.toHaveBeenCalled();
        const result = required(target.GetpSwpHints());
        owners(result);
        expect(result.Count()).toBe(6);
        expect(target.GetText()).toBe("XYdefgZW");
        const byEnd = Array.from(
          { length: 6 },
          /** Reads end order. @param _value - Placeholder. @param index - Index. @returns Actual attribute. */ (
            _value,
            index,
          ) => result.GetSortedByEnd(index),
        );
        const byWhich = Array.from(
          { length: 6 },
          /** Reads Which order. @param _value - Placeholder. @param index - Index. @returns Actual attribute. */ (
            _value,
            index,
          ) => result.GetSortedByWhichAndStart(index),
        );
        expect(
          byEnd.map(
            /** Reads literal family. @param attr - Attribute. @returns Family. */ (attr) =>
              attr.Which(),
          ),
        ).toEqual([53, 54, 53, 54, 53, 54]);
        expect(
          byWhich.map(
            /** Reads literal family. @param attr - Attribute. @returns Family. */ (attr) =>
              attr.Which(),
          ),
        ).toEqual([53, 53, 53, 54, 54, 54]);
        const middleStart = kind === "interior" ? 3 : 2,
          middleEnd = kind === "interior" ? 5 : 6;
        expect(
          byEnd.map(
            /** Reads actual coordinates. @param attr - Attribute. @returns Range. */ (attr) => [
              attr.start,
              attr.end,
            ],
          ),
        ).toEqual([
          [0, 2],
          [0, 2],
          [middleStart, middleEnd],
          [middleStart, middleEnd],
          [6, 8],
          [6, 8],
        ]);
        expect(byEnd[2]).toBe(moved[1]);
        expect(byEnd[3]).toBe(moved[0]);
        expect(byWhich[1]).toBe(moved[1]);
        expect(byWhich[4]).toBe(moved[0]);
        expect(result.GetLastPosSortedByEnd(middleEnd)).toBe(3);
        expect(result.GetFirstPosSortedByWhichAndStart(54)).toBe(3);
        const destinationStarts = vi.spyOn(result, "StartPosChanged");
        required(moved[0]).SetStart(middleStart);
        result.SortIfNeedBe();
        expect(destinationStarts).toHaveBeenCalledTimes(1);
        expect(packetStarts).not.toHaveBeenCalled();
        owners(result);
        const history = undo.GetText(id);
        owners(history.hints);
        for (let i = 0; i < 2; i++) {
          expect(history.hints.GetSortedByEnd(i)).not.toBe(result.GetSortedByEnd(i + 2));
          expect(snapshot.hints.GetSortedByWhichAndStart(i)).toMatchObject({
            start,
            end,
            dontExpand: Boolean(mask & 1),
            dontExpandStart: Boolean(mask & 2),
            dontMoveAttr: Boolean(mask & 4),
          });
        }
        ReplaceUndoRange(doc, source, 0, source.Len(), history);
        owners(required(source.GetpSwpHints()));
        expect(source.GetText()).toBe("abcdefghijklmnop");
        expect(required(source.GetpSwpHints()).GetSortedByEnd(0)).not.toBe(moved[1]);
        owners(result);
        undo.Release(id);
      },
    );
  it("removes a merged object from every actual map", /** Checks normalization preserves only the surviving owned identity. @returns Nothing. */ () => {
    const doc = new SwDoc(),
      set = new SfxItemSet(doc.GetAttrPool(), [[1, 49]]);
    set.Put(new SvxWeightItem(8, 15));
    const format = new SwFormatAutoFormat(set),
      owner = new SwpHints(doc.GetAttrPool(), [
        new SwTextAttrEnd(format, 0, 2),
        new SwTextAttrEnd(format.Clone(), 4, 6),
      ]),
      first = owner.Get(0),
      removed = owner.Get(1);
    owner.Cut(2, 4);
    owners(owner);
    expect(owner.Count()).toBe(1);
    expect(owner.GetSortedByEnd(0)).toBe(first);
    expect(owner.GetSortedByWhichAndStart(0)).toBe(first);
    expect(first).toMatchObject({ start: 0, end: 4 });
    expect(removed.m_pHints).toBeUndefined();
    expect(owner.GetLastPosSortedByEnd(4)).toBe(0);
  });
  it("keeps foreign-copy secondary maps and handles in the destination pool", /** Checks conversion does not share attribute identities or owner maps. @returns Nothing. */ () => {
    const a = new SwDoc(),
      b = new SwDoc(),
      original = hints(a, 1, 3, 7),
      copy = original.CopyTo(b.GetAttrPool());
    owners(original);
    owners(copy);
    expect(copy.GetSortedByEnd(0)).not.toBe(original.GetSortedByEnd(0));
    expect(
      required(
        copy.GetSortedByWhichAndStart(0).format instanceof SwFormatAutoFormat
          ? (copy.GetSortedByWhichAndStart(0).format as SwFormatAutoFormat)
          : undefined,
      )
        .GetStyleHandle()
        .GetPool(),
    ).toBe(b.GetAttrPool());
    expect(copy.GetSortedByWhichAndStart(1).dontExpand).toBe(true);
    const originalStarts = vi.spyOn(original, "StartPosChanged");
    copy.GetSortedByWhichAndStart(0).SetStart(0);
    copy.SortIfNeedBe();
    expect(originalStarts).not.toHaveBeenCalled();
    expect(original.GetSortedByWhichAndStart(0).start).toBe(1);
  });
  it("preserves foreign packet maps when actual adoption is rejected", /** Checks pre-mutation pool guard with indexed maps populated. @returns Nothing. */ () => {
    const a = new SwDoc(),
      b = new SwDoc(),
      source = required(a.paragraphs[0]),
      target = required(b.paragraphs[0]);
    source.SetText("abcdef");
    source.SetTextHints(hints(a, 2, 3, 0));
    target.SetText("XY");
    const packet = source.CutTextFragment(1, 4),
      first = packet.hints.GetSortedByEnd(0);
    expect(
      /** Attempts unsupported foreign-owned adoption. @returns Nothing. */ () =>
        target.ReplaceRange(1, 1, packet, true),
    ).toThrow("same document pool");
    owners(packet.hints);
    expect(packet.hints.GetSortedByEnd(0)).toBe(first);
    expect(target.GetText()).toBe("XY");
  });
});
