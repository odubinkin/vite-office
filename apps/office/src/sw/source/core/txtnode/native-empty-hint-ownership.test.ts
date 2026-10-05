/** @fileoverview Checks native empty AUTO/INET ownership with literal erasure and default-insertion cases, without upstream execution. */
import { describe, expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwpHints } from "./ndhints";
import { SwFormatAutoFormat, SwTextAttrEnd, createWriterCharacterItemSet } from "./txatbase";
import { SwFormatINetFormat } from "./fmtatr2";
import { SwTextINetFormat } from "./txtatr2";
import { SwPoolFormatId } from "../../../inc/poolfmt";
import { projectWriterTextRuns } from "./ndtxt";
import { GetTextAttrMode } from "../../../inc/swtypes";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import {
  createOdtWriterTransfer,
  restoreOdtWriterTransfer,
} from "../../../browser/filter/xml/odt-transfer";
import { SwDocShell } from "../../uibase/app/docsh";
import { SwWrtShell } from "../../uibase/wrtsh/wrtsh1";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { setTestCursor } from "../../../../test/wrtsh-test-helpers";

/** Requires a real owner. @param value - Optional value. @returns Existing value. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing empty-hint owner");
  return value;
}
/** Builds meaningful attributes with explicitly unlocked independent flags. @param doc - Pool owner. @param family - Native Which. @param mask - Flag bits. @param start - Range start. @param end - Range end. @returns Detached attribute. */
function attribute(doc: SwDoc, family: number, mask: number, start: number, end: number) {
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
  return hint;
}
/** Constructs an actual node and retains its owned objects. @param family - Native Which. @param mask - Flags. @param start - Range start. @param end - Range end. @returns Actual owners and detached caller. */
function fixture(family: number, mask: number, start: number, end: number) {
  const doc = new SwDoc(),
    node = required(doc.paragraphs[0]);
  node.SetText("abcdefgh");
  const caller = attribute(doc, family, mask, start, end);
  node.SetTextHints(new SwpHints(doc.GetAttrPool(), [caller]));
  const map = required(node.GetpSwpHints()),
    hint = map.Get(0),
    item = hint.format;
  return { doc, node, caller, map, hint, item };
}
/** Checks actual ownership, flags and native values. @param owner - Original owners. @param mask - Original flags. @param start - Expected start. @param end - Expected end. @returns Nothing. */
function owned(owner: ReturnType<typeof fixture>, mask: number, start: number, end: number): void {
  expect(owner.node.GetpSwpHints()).toBe(owner.map);
  expect(owner.map.CanBeDeleted()).toBe(false);
  expect(owner.map.Count()).toBe(1);
  expect(owner.map.Get(0)).toBe(owner.hint);
  expect(owner.map.GetSortedByEnd(0)).toBe(owner.hint);
  expect(owner.map.GetSortedByWhichAndStart(0)).toBe(owner.hint);
  expect(owner.hint.m_pHints).toBe(owner.map);
  expect(owner.hint.format).toBe(owner.item);
  expect([owner.hint.start, owner.hint.end]).toEqual([start, end]);
  expect([owner.hint.dontExpand, owner.hint.dontExpandStart, owner.hint.dontMoveAttr]).toEqual([
    Boolean(mask & 1),
    Boolean(mask & 2),
    Boolean(mask & 4),
  ]);
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
  }
}
/** Checks no active or visible formatting is inferred from a zero range. @param owner - Actual zero owners. @returns Nothing. */
function inactive(owner: ReturnType<typeof fixture>): void {
  for (const mode of [GetTextAttrMode.Default, GetTextAttrMode.Expand, GetTextAttrMode.Parent])
    expect(owner.node.GetTextAttrAt(owner.hint.start, owner.hint.Which(), mode)).toBeUndefined();
  expect(owner.node.getHyperlinkAt(owner.hint.start)).toBeUndefined();
  for (const run of projectWriterTextRuns(owner.node)) {
    expect(run.hyperlink).toBeUndefined();
    expect(run.attributes.bold).toBe(false);
  }
}
const deletions = [
  [0, 6, 0, 0],
  [2, 6, 2, 2],
  [2, 7, -1, -1],
  [1, 7, -1, -1],
  [0, 5, 0, 1],
  [3, 6, 2, 3],
  [0, 8, -1, -1],
] as const;
describe("native empty ranged ownership", /** Registers independent literals and actual transport/history boundaries. @returns Nothing. */ function cases(): void {
  for (const family of [53, 54])
    for (const [start, end, outStart, outEnd] of deletions)
      it.each([0, 1, 2, 3, 4, 5, 6, 7])(
        "erases " + family + " at " + start + ".." + end + " flags=%s",
        /** Checks pre-GC versus exact-end zero retention. @param mask - Flags. @returns Nothing. */ function eraseCase(
          mask,
        ): void {
          const owner = fixture(family, mask, 2, 6),
            snapshot = owner.map.clone();
          owner.node.EraseText(start, end - start);
          expect(owner.node.GetText()).toBe("abcdefgh".slice(0, start) + "abcdefgh".slice(end));
          expect([snapshot.Get(0).start, snapshot.Get(0).end]).toEqual([2, 6]);
          expect(snapshot.Get(0)).not.toBe(owner.hint);
          expect([owner.caller.start, owner.caller.end]).toEqual([2, 6]);
          if (outStart < 0) {
            expect(owner.node.GetpSwpHints()).toBeUndefined();
            expect(owner.map.CanBeDeleted()).toBe(true);
            expect(owner.hint.m_pHints).toBeUndefined();
            if (owner.hint instanceof SwTextINetFormat)
              expect(owner.hint.GetpTextNode()).toBeUndefined();
          } else {
            owned(owner, mask, outStart, outEnd);
            if (outStart === outEnd) inactive(owner);
          }
        },
      );
  for (const family of [53, 54])
    for (const [point, offset, out] of [
      [2, 0, 4],
      [2, 2, -1],
      [2, 4, 2],
      [0, 0, -1],
    ] as const)
      it.each([0, 1, 2, 3, 4, 5, 6, 7])(
        "inserts beside empty " + family + " point=" + point + " offset=" + offset + " flags=%s",
        /** Checks native default empty end-equal branch before prefix expansion. @param mask - Flags. @returns Nothing. */ function insertCase(
          mask,
        ): void {
          const owner = fixture(family, mask, point, point),
            expected = out === -1 ? (mask & 1 ? point : point + 2) : out;
          owner.node.InsertText("XY", offset);
          owned(owner, mask, expected, expected);
          inactive(owner);
          expect(owner.node.GetText()).toBe(
            "abcdefgh".slice(0, offset) + "XY" + "abcdefgh".slice(offset),
          );
        },
      );
  it.each([53, 54])(
    "separates generic negative Update from native EraseText family=%s",
    /** Checks pre-GC is performed only by erasure. @param family - Native Which. @returns Nothing. */ function genericCase(
      family,
    ): void {
      const generic = fixture(family, 7, 2, 6),
        erased = fixture(family, 7, 2, 6);
      generic.map.Update(8, 2, 5, true);
      owned(generic, 7, 2, 2);
      erased.node.EraseText(2, 5);
      expect(erased.map.CanBeDeleted()).toBe(true);
    },
  );
  it.each([53, 54])(
    "retains zero-count ownership and releases only empty maps family=%s",
    /** Checks no-op release, bounds and literal zero text. @param family - Native Which. @returns Nothing. */ function noOpCase(
      family,
    ): void {
      const owner = fixture(family, 7, 2, 2);
      owner.node.EraseText(2, 0);
      owned(owner, 7, 2, 2);
      owner.map.EraseText(8, 2, 0);
      owned(owner, 7, 2, 2);
      expect(owner.map.EraseText.bind(owner.map, 8, 2, -1)).toThrow("outside");
      expect(owner.map.EraseText.bind(owner.map, 8, 2, 0.5)).toThrow("outside");
      expect(owner.map.EraseText.bind(owner.map, 8, 7, 2)).toThrow("outside");
      expect(owner.node.EraseText.bind(owner.node, 9, 0)).toThrow("outside");
      const empty = required(new SwDoc().paragraphs[0]),
        map = empty.GetOrCreateSwpHints();
      expect(map.CanBeDeleted()).toBe(true);
      empty.EraseText(0, 0);
      expect(empty.GetpSwpHints()).toBeUndefined();
      const zero = fixture(family, 0, 0, 8);
      zero.node.EraseText(0, 8);
      owned(zero, 0, 0, 0);
      inactive(zero);
      zero.node.InsertText("XY", 0);
      owned(zero, 0, 2, 2);
      inactive(zero);
    },
  );
  it.each([53, 54])(
    "retains empty hints beside positive ranges without hiding overlap family=%s",
    /** Checks native zero merging exclusion and positive overlap rejection. @param family - Native Which. @returns Nothing. */ function normalizationCase(
      family,
    ): void {
      const doc = new SwDoc(),
        pool = doc.GetAttrPool();
      const head = attribute(doc, family, 0, 0, 2),
        zero = head.clone(),
        tail = head.clone();
      zero.SetStart(2);
      zero.SetEnd(2);
      tail.SetStart(2);
      tail.SetEnd(4);
      const hints = new SwpHints(
        pool,
        family === 53
          ? [head, zero, tail]
          : [
              attribute(doc, family, 0, 0, 2),
              attribute(doc, family, 0, 2, 2),
              attribute(doc, family, 0, 2, 4),
            ],
      );
      expect(
        hints
          .entries()
          .map(
            /** Reads literal coordinates. @param hint - Attribute. @returns Range. */ (hint) => [
              hint.start,
              hint.end,
            ],
          ),
      ).toEqual(
        family === 53
          ? [
              [0, 4],
              [2, 2],
            ]
          : [
              [0, 2],
              [2, 4],
              [2, 2],
            ],
      );
      expect(
        /** Constructs forbidden positive overlap around a zero point. @returns Invalid map. */ () =>
          new SwpHints(pool, [
            attribute(doc, family, 0, 0, 4),
            attribute(doc, family, 0, 2, 2),
            attribute(doc, family, 0, 3, 6),
          ]),
      ).toThrow("Overlapping");
      const second =
        family === 53
          ? new SwTextAttrEnd(
              new SwFormatAutoFormat(
                createWriterCharacterItemSet(pool, { bold: false, italic: true, underline: false }),
              ),
              6,
              8,
            )
          : attribute(doc, family, 0, 6, 8);
      const erase = new SwpHints(pool, [attribute(doc, family, 0, 2, 6), second]);
      erase.EraseText(8, 2, 4);
      expect(
        erase
          .entries()
          .map(
            /** Reads actual coordinates. @param hint - Attribute. @returns Range. */ (hint) => [
              hint.start,
              hint.end,
            ],
          ),
      ).toEqual([
        [2, 4],
        [2, 2],
      ]);
    },
  );
  it("keeps native locked internet defaults for an empty point", /** Checks nesting lock prevents expansion flag resets. @returns Nothing. */ function lockedCase(): void {
    const owner = fixture(54, 7, 0, 0);
    owner.hint.SetLockExpandFlag(true);
    owner.node.InsertText("XY", 0);
    owned(owner, 7, 0, 0);
    expect(owner.hint.IsLockExpandFlag()).toBe(true);
    inactive(owner);
  });
  it.each([53, 54])(
    "retains zero ranges through owned clones,copies,graph16 and Worker5 family=%s",
    /** Checks transport does not discard canonical zero ranges. @param family - Native Which. @returns Nothing. */ function transportCase(
      family,
    ): void {
      const owner = fixture(family, 7, 2, 6);
      owner.node.EraseText(2, 4);
      const record = encodeWriterDocument(owner.doc),
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
        expect(map.CanBeDeleted()).toBe(false);
        expect(hint).not.toBe(owner.hint);
        expect([hint.start, hint.end]).toEqual([2, 2]);
        if (hint.format instanceof SwFormatAutoFormat) {
          expect(hint.format.GetStyleHandle().GetPool()).toBe(copy.GetDoc().GetAttrPool());
          expect(hint.format.GetStyleHandle().Count()).toBe(3);
          for (const which of [15, 26, 31])
            expect(hint.format.GetStyleHandle().Get(which).QueryValue()).toBe(8);
        } else expect(hint.format.equals(owner.item)).toBe(true);
        expect(hint.m_pHints).toBe(map);
        expect([hint.dontExpand, hint.dontExpandStart, hint.dontMoveAttr]).toEqual(
          family === 54 ? [true, true, false] : [false, false, false],
        );
        if (hint instanceof SwTextINetFormat) {
          expect(hint.GetTextNode()).toBe(copy);
          expect(hint.format.GetTextINetFormat()).toBe(hint);
          expect(hint.format.GetHyperlink()).toEqual({
            url: "url",
            targetFrame: "target",
            name: "name",
            styleName: "normal",
            visitedStyleName: "visited",
          });
          expect([hint.format.GetINetFormatId(), hint.format.GetVisitedFormatId()]).toEqual([
            65000, 65535,
          ]);
        }
      }
    },
  );
  it("retains the same empty internet item through actual typing undo and redo", /** Checks EMPTYEXPAND shell input and native history erasure. @returns Nothing. */ function historyCase(): void {
    const owner = fixture(54, 0, 2, 6),
      shell = new SwWrtShell(
        new SwDocShell(
          owner.doc,
          createDocument({ id: "zero", suiteId: "writer", title: "Empty hints" }),
        ),
      );
    owner.node.EraseText(2, 4);
    setTestCursor(shell, "p-1", 2);
    expect(shell.Insert("XY")).toBe(true);
    owned(owner, 0, 2, 4);
    expect(shell.Undo()).toBe(true);
    owned(owner, 0, 2, 2);
    expect(shell.Redo()).toBe(true);
    owned(owner, 0, 2, 4);
    expect(owner.node.getHyperlinkAt(3)).toEqual({
      url: "url",
      targetFrame: "target",
      name: "name",
      styleName: "normal",
      visitedStyleName: "visited",
    });
    expect(owner.node.GetTextAttrAt(3, 54)).toBe(owner.hint);
  });
});
