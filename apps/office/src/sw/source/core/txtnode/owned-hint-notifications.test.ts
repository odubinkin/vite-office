/** @fileoverview Checks real node cut/transfer owner notification, independent history and temporary fragment ownership. */
import { afterEach, describe, expect, it, vi } from "vitest";
import { SvxWeightItem } from "../../../../editeng/source/items/textitem";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SwDoc } from "../doc/doc";
import { SwpHints } from "./ndhints";
import { SwTextAttrEnd, SwFormatAutoFormat } from "./txatbase";
import { SwFormatINetFormat } from "./fmtatr2";
import { ReplaceUndoRange } from "../undo/undobj";
afterEach(/** Restores actual owner spies. @returns Nothing. */ () => vi.restoreAllMocks());
/** Requires a real owner. @param value - Optional owner. @returns Actual owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing hint notification owner");
  return value;
}
/** Builds both supported families with independent flags. @param doc - Owner. @param start - Start. @param end - End. @param mask - Flags. @returns Caller-owned container. */
function hints(doc: SwDoc, start: number, end: number, mask: number): SwpHints {
  const set = new SfxItemSet(doc.GetAttrPool(), [[1, 49]]);
  set.Put(new SvxWeightItem(8, 15));
  const attrs = [
    new SwTextAttrEnd(new SwFormatAutoFormat(set), start, end),
    new SwTextAttrEnd(new SwFormatINetFormat({ url: "https://example.test/owner" }), start, end),
  ];
  for (const attr of attrs) {
    attr.dontExpand = Boolean(mask & 1);
    attr.dontExpandStart = Boolean(mask & 2);
    attr.dontMoveAttr = Boolean(mask & 4);
  }
  return new SwpHints(doc.GetAttrPool(), attrs);
}
/** Verifies actual object backlinks for a container. @param container - Actual owner. @returns Nothing. */
function owners(container: SwpHints): void {
  for (const hint of container.entries()) expect(hint.m_pHints).toBe(container);
}
describe("owned hint notification transfer", /** Registers literal node and packet ownership cases. @returns Nothing. */ () => {
  for (const kind of ["interior", "partial", "exact"] as const)
    it.each([0, 1, 2, 3, 4, 5, 6, 7])(
      "hands off " + kind + " owners for flag mask %s",
      /** Checks cut ownership before rebasing and consumed destination ownership. @param mask - Independent flags. @returns Nothing. */ (
        mask,
      ) => {
        const doc = new SwDoc(),
          source = required(doc.paragraphs[0]),
          target = doc.GetNodes().MakeTextNode();
        source.SetText("abcdefghij");
        target.SetText("XY");
        const start = kind === "interior" ? 4 : kind === "partial" ? 1 : 3,
          end = kind === "interior" ? 6 : kind === "partial" ? 9 : 7;
        source.SetTextHints(hints(doc, start, end, mask));
        const sourceOwner = required(source.GetpSwpHints()),
          actual = [...sourceOwner.entries()],
          snapshot = source.CaptureTextFragment(0, 10),
          undo = doc.GetUndoManager().GetUndoNodes(),
          id = undo.RetainText(snapshot);
        owners(sourceOwner);
        owners(snapshot.hints);
        const sourceStarts = vi.spyOn(sourceOwner, "StartPosChanged"),
          sourceEnds = vi.spyOn(sourceOwner, "EndPosChanged");
        const packet = source.CutTextFragment(3, 7),
          moved = [...packet.hints.entries()];
        owners(packet.hints);
        if (kind === "interior") {
          expect(sourceStarts).not.toHaveBeenCalled();
          expect(sourceEnds).not.toHaveBeenCalled();
          expect(sourceOwner.Count()).toBe(0);
          for (let i = 0; i < 2; i++) expect(moved[i]).toBe(actual[i]);
        } else {
          for (let i = 0; i < 2; i++) {
            expect(moved[i]).not.toBe(actual[i]);
            expect(actual[i]?.m_pHints).toBe(sourceOwner);
            if (kind === "exact") expect(actual[i]).toMatchObject({ start: 3, end: 3 });
          }
          expect(sourceEnds).toHaveBeenCalledTimes(2);
        }
        const packetStarts = vi.spyOn(packet.hints, "StartPosChanged"),
          packetEnds = vi.spyOn(packet.hints, "EndPosChanged");
        const beforeStarts = sourceStarts.mock.calls.length,
          beforeEnds = sourceEnds.mock.calls.length;
        for (const hint of moved) hint.SetStart(hint.GetStart());
        expect(packetStarts).toHaveBeenCalledTimes(2);
        expect(sourceStarts).toHaveBeenCalledTimes(beforeStarts);
        expect(sourceEnds).toHaveBeenCalledTimes(beforeEnds);
        packetStarts.mockClear();
        target.ReplaceRange(1, 1, packet, true);
        expect(packet.hints.Count()).toBe(0);
        expect(packetStarts).not.toHaveBeenCalled();
        expect(packetEnds).not.toHaveBeenCalled();
        const targetOwner = required(target.GetpSwpHints());
        owners(targetOwner);
        for (let i = 0; i < 2; i++) {
          expect(targetOwner.Get(i)).toBe(moved[i]);
          expect(targetOwner.Get(i).m_pHints).toBe(targetOwner);
          expect(snapshot.hints.Get(i).m_pHints).toBe(snapshot.hints);
          expect(snapshot.hints.Get(i)).toMatchObject({
            start,
            end,
            dontExpand: Boolean(mask & 1),
            dontExpandStart: Boolean(mask & 2),
            dontMoveAttr: Boolean(mask & 4),
          });
        }
        expect(target.GetText()).toBe("XdefgY");
        const destinationStarts = vi.spyOn(targetOwner, "StartPosChanged");
        targetOwner.Get(0).SetStart(targetOwner.Get(0).GetStart());
        expect(destinationStarts).toHaveBeenCalledTimes(1);
        expect(packetStarts).not.toHaveBeenCalled();
        const history = undo.GetText(id);
        owners(history.hints);
        expect(history.hints.Get(0)).not.toBe(targetOwner.Get(0));
        ReplaceUndoRange(doc, source, 0, source.Len(), history);
        const restored = required(source.GetpSwpHints());
        owners(restored);
        expect(source.GetText()).toBe("abcdefghij");
        expect(restored.Get(0)).not.toBe(targetOwner.Get(0));
        expect(restored.Get(0).m_pHints).toBe(restored);
        expect(targetOwner.Get(0).m_pHints).toBe(targetOwner);
        undo.Release(id);
      },
    );
  it("adopts consumed prefix and trailing owners beside a transferred packet", /** Checks all destination pieces own their actual attributes after temporary clipping. @returns Nothing. */ () => {
    const doc = new SwDoc(),
      source = required(doc.paragraphs[0]),
      target = doc.GetNodes().MakeTextNode();
    source.SetText("abcdef");
    source.SetTextHints(hints(doc, 2, 3, 7));
    target.SetText("WXYZ");
    target.SetTextHints(hints(doc, 0, 4, 3));
    const history = target.CaptureTextFragment(0, 4),
      original = required(target.GetpSwpHints()),
      packet = source.CutTextFragment(1, 4),
      incoming = [...packet.hints.entries()];
    target.ReplaceRange(2, 2, packet, true);
    const result = required(target.GetpSwpHints());
    owners(result);
    owners(original);
    owners(history.hints);
    expect(packet.hints.Count()).toBe(0);
    expect(target.GetText()).toBe("WXbcdYZ");
    for (const hint of incoming) {
      expect(result.entries()).toContain(hint);
      expect(hint.m_pHints).toBe(result);
    }
    expect(history.hints.Get(0)).toMatchObject({ start: 0, end: 4 });
    expect(history.hints.Get(0).m_pHints).toBe(history.hints);
  });
  it("keeps foreign packet owners untouched on rejected adoption", /** Checks pre-mutation pool guard and detached snapshots. @returns Nothing. */ () => {
    const a = new SwDoc(),
      b = new SwDoc(),
      source = required(a.paragraphs[0]),
      target = required(b.paragraphs[0]);
    source.SetText("abcdef");
    source.SetTextHints(hints(a, 2, 3, 7));
    target.SetText("XY");
    const packet = source.CutTextFragment(1, 4),
      owned = packet.hints.Get(0);
    expect(
      /** Attempts foreign owned insertion. @returns Nothing. */ () =>
        target.ReplaceRange(1, 1, packet, true),
    ).toThrow("same document pool");
    expect(packet.hints.Get(0)).toBe(owned);
    owners(packet.hints);
    expect(target.GetText()).toBe("XY");
  });
  it("retains independent owners for zero cuts, plain cuts and copied insertion", /** Checks no-op snapshots and ordinary non-consumable replacement. @returns Nothing. */ () => {
    const doc = new SwDoc(),
      source = required(doc.paragraphs[0]),
      target = doc.GetNodes().MakeTextNode();
    source.SetText("abcdef");
    source.SetTextHints(hints(doc, 1, 4, 7));
    target.SetText("XY");
    const original = required(source.GetpSwpHints()),
      zero = source.CutTextFragment(2, 2);
    expect(zero.hints.Count()).toBe(0);
    owners(original);
    const packet = source.CaptureTextFragment(0, 6);
    target.ReplaceRange(1, 1, packet);
    owners(packet.hints);
    owners(required(target.GetpSwpHints()));
    expect(required(target.GetpSwpHints()).Get(0)).not.toBe(packet.hints.Get(0));
    const plain = doc.GetNodes().MakeTextNode();
    plain.SetText("plain");
    expect(plain.CutTextFragment(1, 3).hints.Count()).toBe(0);
    expect(plain.GetText()).toBe("pin");
  });
});
