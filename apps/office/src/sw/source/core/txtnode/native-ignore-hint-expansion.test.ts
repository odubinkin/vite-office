/** @fileoverview Checks node-owned ignore expansion and DEFAULT insertion using literal source-independent ranges. */
import { describe, expect, it, vi } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwTableNode, SwTableBoxStartNode } from "../docnode/node";
import { SwpHints } from "./ndhints";
import { SwFormatAutoFormat, SwTextAttrEnd, createWriterCharacterItemSet } from "./txatbase";
import { SwFormatINetFormat } from "./fmtatr2";
import { SwTextINetFormat } from "./txtatr2";
import { SwPoolFormatId } from "../../../inc/poolfmt";
import { AdjustInsertTextHints } from "./ndtxt-hint-update";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import {
  createOdtWriterTransfer,
  restoreOdtWriterTransfer,
} from "../../../browser/filter/xml/odt-transfer";

/** Requires an actual owner. @param value - Optional owner. @returns Existing owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing ignore-expansion owner");
  return value;
}
/** Creates an independently flagged actual hint. @param doc - Pool owner. @param family - Which. @param mask - Three flags. @param locked - Expansion lock. @param start - Start. @param end - End. @returns Detached hint. */
function attribute(
  doc: SwDoc,
  family: number,
  mask: number,
  locked: boolean,
  start: number,
  end: number,
) {
  let hint: SwTextAttrEnd<SwFormatAutoFormat | SwFormatINetFormat>;
  if (family === 54) {
    const item = new SwFormatINetFormat("url", "target");
    item.SetName("name");
    item.SetINetFormatAndId("normal", 65000 as SwPoolFormatId);
    item.SetVisitedFormatAndId("visited", 65535 as SwPoolFormatId);
    hint = new SwTextINetFormat(item, start, end);
  } else
    hint = new SwTextAttrEnd(
      new SwFormatAutoFormat(
        createWriterCharacterItemSet(doc.GetAttrPool(), {
          bold: true,
          italic: false,
          underline: false,
        }),
      ),
      start,
      end,
    );
  hint.SetLockExpandFlag(false);
  hint.dontExpand = Boolean(mask & 1);
  hint.dontExpandStart = Boolean(mask & 2);
  hint.dontMoveAttr = Boolean(mask & 4);
  hint.SetLockExpandFlag(locked);
  return hint;
}
/** Binds independent caller attributes to a real node. @param family - Which. @param mask - Flags. @param locked - Lock. @param ignore - Node state. @param start - Start. @param end - End. @returns Actual owners. */
function fixture(
  family: number,
  mask: number,
  locked: boolean,
  ignore: boolean,
  start: number,
  end: number,
) {
  const doc = new SwDoc(),
    node = required(doc.paragraphs[0]);
  node.SetText("abcdefgh");
  const caller = attribute(doc, family, mask, locked, start, end);
  node.SetTextHints(new SwpHints(doc.GetAttrPool(), [caller]));
  node.SetIgnoreDontExpand(ignore);
  const map = required(node.GetpSwpHints()),
    hint = map.Get(0),
    item = hint.format;
  return { doc, node, caller, map, hint, item };
}
/** Checks identity, backlinks, flags and all retained native values. @param owner - Actual owners. @param mask - Expected flags. @param locked - Expected lock. @param ignore - Node state. @param range - Expected coordinates. @returns Nothing. */
function owned(
  owner: ReturnType<typeof fixture>,
  mask: number,
  locked: boolean,
  ignore: boolean,
  range: readonly number[],
): void {
  expect(owner.node.GetpSwpHints()).toBe(owner.map);
  expect(owner.node.IsIgnoreDontExpand()).toBe(ignore);
  expect(owner.map.Count()).toBe(1);
  expect(owner.map.Get(0)).toBe(owner.hint);
  expect(owner.map.GetSortedByEnd(0)).toBe(owner.hint);
  expect(owner.map.GetSortedByWhichAndStart(0)).toBe(owner.hint);
  expect(owner.hint.m_pHints).toBe(owner.map);
  expect(owner.hint.format).toBe(owner.item);
  expect([owner.hint.start, owner.hint.end]).toEqual(range);
  expect([
    owner.hint.dontExpand,
    owner.hint.dontExpandStart,
    owner.hint.dontMoveAttr,
    owner.hint.IsLockExpandFlag(),
  ]).toEqual([Boolean(mask & 1), Boolean(mask & 2), Boolean(mask & 4), locked]);
  if (owner.hint instanceof SwTextINetFormat) {
    expect(owner.hint.GetTextNode()).toBe(owner.node);
    expect(owner.hint.format.GetTextINetFormat()).toBe(owner.hint);
    expect(owner.hint.format.GetHyperlink()).toEqual({
      url: "url",
      targetFrame: "target",
      name: "name",
      styleName: "normal",
      visitedStyleName: "visited",
    });
    expect([owner.hint.format.GetINetFormatId(), owner.hint.format.GetVisitedFormatId()]).toEqual([
      65000, 65535,
    ]);
  } else if (owner.item instanceof SwFormatAutoFormat) {
    expect(owner.item.GetStyleHandle().GetPool()).toBe(owner.doc.GetAttrPool());
    expect(owner.item.GetStyleHandle().Count()).toBe(3);
    for (const which of [15, 26, 31])
      expect(owner.item.GetStyleHandle().Get(which).QueryValue()).toBe(8);
  }
}
const boundaries = [
  ["before", 2, 6, 1, 4, 8],
  ["start", 2, 6, 2, 4, 8],
  ["interior", 2, 6, 4, 2, 8],
  ["end", 2, 6, 6, 2, -1],
  ["after", 2, 6, 7, 2, 6],
  ["paragraph", 0, 6, 0, 2, 8],
  ["empty", 2, 2, 2, 4, 4],
  ["empty-paragraph", 0, 0, 0, 2, 2],
] as const;
describe("native node ignore expansion", /** Registers independent node and coordinate/insertion contracts. @returns Nothing. */ function cases(): void {
  for (const family of [53, 54])
    for (const locked of [false, true])
      for (const ignore of [false, true])
        for (const [name, start, end, offset, outStart, outEnd] of boundaries)
          it.each([0, 1, 2, 3, 4, 5, 6, 7])(
            "coordinates versus DEFAULT " +
              family +
              " lock=" +
              locked +
              " ignore=" +
              ignore +
              " " +
              name +
              " mask=%s",
            /** Checks literal boundary results on separate actual owners. @param mask - Flag mask. @returns Nothing. */ function boundaryCase(
              mask,
            ): void {
              const generic = fixture(family, mask, locked, ignore, start, end),
                inserted = fixture(family, mask, locked, ignore, start, end);
              const finalMask = name === "end" && !ignore && !locked ? mask & ~1 : mask;
              const updateEnd = outEnd < 0 ? (ignore || !(mask & 1) ? 8 : 6) : outEnd;
              let insertStart: number = outStart,
                insertEnd: number = updateEnd;
              if ((name === "empty" || name === "empty-paragraph") && mask & 1)
                insertStart = insertEnd = start;
              if (name === "end" && finalMask & 1) insertEnd = 6;
              if (name === "paragraph" && !(mask & 2)) insertStart = 0;
              expect(generic.map.Update(8, offset, 2)).toBe(generic.map);
              owned(generic, finalMask, locked, ignore, [outStart, updateEnd]);
              expect(generic.node.GetText()).toBe("abcdefgh");
              inserted.node.InsertText("XY", offset);
              owned(inserted, finalMask, locked, ignore, [insertStart, insertEnd]);
              expect(inserted.node.GetText()).toBe(
                "abcdefgh".slice(0, offset) + "XY" + "abcdefgh".slice(offset),
              );
              expect([
                generic.caller.start,
                generic.caller.end,
                inserted.caller.start,
                inserted.caller.end,
              ]).toEqual([start, end, start, end]);
            },
          );
  for (const family of [53, 54])
    for (const ignore of [false, true])
      it.each([0, 1, 2, 3, 4, 5, 6, 7])(
        "negative coordinates family=" + family + " ignore=" + ignore + " mask=%s",
        /** Checks negative updates disregard positive ignore state. @param mask - Flags. @returns Nothing. */ function negativeCase(
          mask,
        ): void {
          const owner = fixture(family, mask, true, ignore, 2, 6);
          owner.map.Update(8, 2, 2, true);
          owned(owner, mask, true, ignore, [2, 4]);
          owner.map.Update(8, 0, 0);
          owned(owner, mask, true, ignore, [2, 4]);
        },
      );
  it("initializes every base node kind and assigns silently with owner locality", /** Checks inherited native storage and lack of notifications. @returns Nothing. */ function nodesCase(): void {
    const doc = new SwDoc(),
      nodes = doc.GetNodes(),
      section = required(doc.paragraphs[0]).StartOfSectionNode(),
      table = new SwTableNode(nodes, section),
      box = new SwTableBoxStartNode(nodes, table);
    const all = [...nodes.entries(), table, box],
      notify = vi.spyOn(doc, "NotifyModelChange");
    for (const node of all) {
      expect(node.IsIgnoreDontExpand()).toBe(false);
      expect(node.SetIgnoreDontExpand(true)).toBeUndefined();
      expect(node.IsIgnoreDontExpand()).toBe(true);
      node.SetIgnoreDontExpand(false);
      expect(node.IsIgnoreDontExpand()).toBe(false);
    }
    required(doc.paragraphs[0]).SetIgnoreDontExpand(true);
    expect(table.IsIgnoreDontExpand()).toBe(false);
    expect(new SwDoc().paragraphs[0]?.IsIgnoreDontExpand()).toBe(false);
    expect(notify).not.toHaveBeenCalled();
  });
  it("uses only the bound node and defaults detached maps to false", /** Checks ignore locality and no collector under native bypass. @returns Nothing. */ function localityCase(): void {
    const doc = new SwDoc(),
      node = required(doc.paragraphs[0]);
    node.SetText("abcdefgh");
    node.SetIgnoreDontExpand(true);
    const caller = attribute(doc, 54, 1, true, 2, 6),
      detached = new SwpHints(doc.GetAttrPool(), [caller]);
    detached.Update(8, 6, 2);
    expect([detached.Get(0).start, detached.Get(0).end]).toEqual([2, 6]);
    node.SetTextHints(
      new SwpHints(doc.GetAttrPool(), [caller, attribute(doc, 53, 0, false, 2, 6)]),
    );
    const map = required(node.GetpSwpHints()),
      internet = map.Get(0),
      automatic = map.Get(1);
    map.Update(8, 6, 2);
    expect(map.Count()).toBe(2);
    expect([internet.end, automatic.end]).toEqual([8, 8]);
    expect(internet.dontExpand).toBe(true);
    node.SetIgnoreDontExpand(false);
    map.Update(8, 8, 2);
    expect([internet.end, automatic.end]).toEqual([8, 10]);
    expect(map.Count()).toBe(2);
    expect(map.Get(0) === automatic).toBe(true);
    expect(map.Get(1) === internet).toBe(true);
  });
  it("returns the actual postphase array and processes updated collectors", /** Checks end-equal continuation and paragraph restoration without cloning. @returns Nothing. */ function postphaseCase(): void {
    const doc = new SwDoc(),
      ordinary = attribute(doc, 53, 0, false, 2, 2),
      locked = attribute(doc, 54, 1, true, 2, 2),
      prefix = attribute(doc, 53, 0, false, 2, 8),
      hints = [ordinary, locked, prefix];
    expect(AdjustInsertTextHints(hints, 0, 2)).toBe(hints);
    expect(hints).toEqual([ordinary, locked, prefix]);
    expect([
      [ordinary.start, ordinary.end],
      [locked.start, locked.end],
      [prefix.start, prefix.end],
    ]).toEqual([
      [2, 2],
      [0, 0],
      [0, 8],
    ]);
  });
  it.each([53, 54])(
    "constructs fresh false nodes through clones graph16 Worker5 family=%s",
    /** Checks Ignore is transient node state and native values survive reconstruction. @param family - Which. @returns Nothing. */ function transportCase(
      family,
    ): void {
      const owner = fixture(family, 7, true, true, 2, 6),
        record = encodeWriterDocument(owner.doc),
        transfer = createOdtWriterTransfer(owner.doc);
      expect(record.swModelVersion).toBe(16);
      expect(transfer.transferVersion).toBe(5);
      for (const copy of [
        owner.node.CloneTo(owner.doc.GetNodes()),
        owner.node.CloneTo(new SwDoc().GetNodes()),
        required(decodeWriterDocument(structuredClone(record)).paragraphs[0]),
        required(restoreOdtWriterTransfer(structuredClone(transfer)).paragraphs[0]),
      ]) {
        const map = required(copy.GetpSwpHints()),
          hint = map.Get(0);
        expect(copy.IsIgnoreDontExpand()).toBe(false);
        expect(hint).not.toBe(owner.hint);
        expect([hint.start, hint.end]).toEqual([2, 6]);
        expect(hint.m_pHints).toBe(map);
        if (hint instanceof SwTextINetFormat) {
          expect(hint.GetTextNode()).toBe(copy);
          expect(hint.format.GetTextINetFormat()).toBe(hint);
          expect(hint.format.equals(owner.item)).toBe(true);
        } else if (hint.format instanceof SwFormatAutoFormat) {
          expect(hint.format.GetStyleHandle().GetPool()).toBe(copy.GetDoc().GetAttrPool());
          expect(hint.format.GetStyleHandle().Count()).toBe(3);
          for (const which of [15, 26, 31])
            expect(hint.format.GetStyleHandle().Get(which).QueryValue()).toBe(8);
        }
      }
      owned(owner, 7, true, true, [2, 6]);
    },
  );
});
