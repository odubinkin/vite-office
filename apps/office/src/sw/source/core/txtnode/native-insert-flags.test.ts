/** @fileoverview Checks native insertion flags using literal, source-independent AUTO/INET boundary expectations. */
import { describe, expect, it, vi } from "vitest";
import { SwInsertFlags } from "../../../inc/IDocumentContentOperations";
import { SwPoolFormatId } from "../../../inc/poolfmt";
import { SwDoc } from "../doc/doc";
import { SwPaM, SwPosition } from "../crsr/pam";
import { SwpHints } from "./ndhints";
import { SwTextINetFormat } from "./txtatr2";
import { SwFormatINetFormat } from "./fmtatr2";
import { SwFormatAutoFormat, SwTextAttrEnd, createWriterCharacterItemSet } from "./txatbase";

/** Requires an actual owner. @param value - Optional owner. @returns Existing owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing insertion-mode owner");
  return value;
}
/** Creates independent flags on a native attribute. @param doc - Pool owner. @param family - Which. @param mask - Three flags. @param locked - Expansion lock. @param start - Start. @param end - End. @returns Detached attribute. */
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
/** Creates a real node and retained owners. @param family - Which. @param mask - Flags. @param locked - Lock. @param ignore - Node state. @param start - Range start. @param end - Range end. @returns Actual owners. */
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
/** Checks literal coordinates and retained actual native values. @param owner - Actual owners. @param mask - Expected flags. @param locked - Lock. @param ignore - Restored node state. @param range - Literal coordinates. @returns Nothing. */
function owned(
  owner: ReturnType<typeof fixture>,
  mask: number,
  locked: boolean,
  ignore: boolean,
  range: readonly number[],
): void {
  expect(owner.node.GetpSwpHints() === owner.map).toBe(true);
  expect(owner.map.Count()).toBe(1);
  expect(owner.map.Get(0) === owner.hint).toBe(true);
  expect(owner.map.GetSortedByEnd(0) === owner.hint).toBe(true);
  expect(owner.map.GetSortedByWhichAndStart(0) === owner.hint).toBe(true);
  expect(owner.hint.m_pHints === owner.map).toBe(true);
  expect(owner.hint.format === owner.item).toBe(true);
  expect(owner.node.IsIgnoreDontExpand()).toBe(ignore);
  expect([owner.hint.start, owner.hint.end]).toEqual(range);
  expect([
    owner.hint.dontExpand,
    owner.hint.dontExpandStart,
    owner.hint.dontMoveAttr,
    owner.hint.IsLockExpandFlag(),
  ]).toEqual([Boolean(mask & 1), Boolean(mask & 2), Boolean(mask & 4), locked]);
  if (owner.hint instanceof SwTextINetFormat) {
    expect(owner.hint.GetTextNode() === owner.node).toBe(true);
    expect(owner.hint.format.GetTextINetFormat() === owner.hint).toBe(true);
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
    expect(owner.item.GetStyleHandle().GetPool() === owner.doc.GetAttrPool()).toBe(true);
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
  ["paragraph", 0, 6, 0, -1, 8],
  ["empty", 2, 2, 2, -1, -1],
  ["empty-paragraph", 0, 0, 0, -1, -1],
] as const;
const endExpand = [8, 8, 6, 6, 8, 8, 6, 6] as const;
const endDontExpand = [6, 6, 6, 6, 8, 8, 6, 6] as const;
const emptyExpand = [
  [4, 4],
  [2, 4],
  [2, 2],
  [2, 2],
  [4, 4],
  [2, 4],
  [2, 2],
  [2, 2],
] as const;
const emptyDontExpand = [
  [2, 2],
  [2, 2],
  [2, 2],
  [2, 2],
  [4, 4],
  [2, 4],
  [2, 2],
  [2, 2],
] as const;
const prefixMayExpand = [true, true, false, false, true, true, false, false] as const;
describe("native insertion mode contract", /** Registers literal native mode,owner,manager and adapter checks. @returns Nothing. */ function cases(): void {
  it("uses the pinned flag values and combinations", /** Checks literal enum values independent of production conditions. @returns Nothing. */ function enumCase(): void {
    expect([
      SwInsertFlags.DEFAULT,
      SwInsertFlags.EMPTYEXPAND,
      SwInsertFlags.NOHINTEXPAND,
      SwInsertFlags.FORCEHINTEXPAND,
    ]).toEqual([0, 1, 2, 4]);
    expect(SwInsertFlags.EMPTYEXPAND | SwInsertFlags.FORCEHINTEXPAND).toBe(5);
    expect(
      SwInsertFlags.EMPTYEXPAND | SwInsertFlags.NOHINTEXPAND | SwInsertFlags.FORCEHINTEXPAND,
    ).toBe(7);
  });
  for (const family of [53, 54])
    for (const locked of [false, true])
      for (const ignore of [false, true])
        for (const mode of [0, 1, 2, 3, 4, 5, 6, 7])
          for (const [name, start, end, offset, outStart, outEnd] of boundaries)
            it.each([0, 1, 2, 3, 4, 5, 6, 7])(
              "boundary family=" +
                family +
                " lock=" +
                locked +
                " oldIgnore=" +
                ignore +
                " mode=" +
                mode +
                " " +
                name +
                " mask=%s",
              /** Checks literal ranges,flags and identity for all supported mode combinations. @param mask - Hint flags. @returns Nothing. */ function boundaryCase(
                mask,
              ): void {
                const owner = fixture(family, mask, locked, ignore, start, end);
                let expected: readonly number[] = [outStart, outEnd];
                if (name === "end")
                  expected = [2, required((mask & 1 ? endDontExpand : endExpand)[mode])];
                if (name === "paragraph")
                  expected = [required(prefixMayExpand[mode]) && !(mask & 2) ? 0 : 2, 8];
                if (name === "empty" || name === "empty-paragraph") {
                  const literal = required((mask & 1 ? emptyDontExpand : emptyExpand)[mode]),
                    delta = start - 2;
                  expected = [literal[0] + delta, literal[1] + delta];
                }
                const finalMask =
                  name === "end" && !ignore && !locked && mode < 4 ? mask & ~1 : mask;
                expect(owner.node.InsertText("XY", offset, mode)).toBe("XY");
                owned(owner, finalMask, locked, ignore, expected);
                expect(owner.node.GetText()).toBe(
                  "abcdefgh".slice(0, offset) + "XY" + "abcdefgh".slice(offset),
                );
                expect([owner.caller.start, owner.caller.end]).toEqual([start, end]);
              },
            );
  it.each([false, true])(
    "restores old Ignore before NOHINT postphase oldIgnore=%s",
    /** Observes actual node state inside coordinate and end-restoration writes. @param ignore - Old state. @returns Nothing. */ function phaseCase(
      ignore,
    ): void {
      const owner = fixture(54, 1, true, ignore, 2, 6),
        states: boolean[] = [],
        setEnd = owner.hint.SetEnd.bind(owner.hint),
        setter = vi.spyOn(owner.node, "SetIgnoreDontExpand");
      vi.spyOn(owner.hint, "SetEnd").mockImplementation(
        /** Captures owner state before delegating the actual end update. @param end - New end. @returns Nothing. */ function observeEnd(
          end,
        ): void {
          states.push(owner.node.IsIgnoreDontExpand());
          setEnd(end);
        },
      );
      owner.node.InsertText("XY", 6, SwInsertFlags.FORCEHINTEXPAND | SwInsertFlags.NOHINTEXPAND);
      expect(states).toEqual([true, ignore]);
      expect(setter.mock.calls).toEqual([[true], [ignore]]);
      owned(owner, 1, true, ignore, [2, 6]);
    },
  );
  it.each([false, true])(
    "restores old Ignore on a failed coordinate update oldIgnore=%s",
    /** Checks the temporary mode state is never retained after a thrown update. @param ignore - Old state. @returns Nothing. */ function failedUpdateCase(
      ignore,
    ): void {
      const owner = fixture(54, 1, true, ignore, 2, 6);
      vi.spyOn(owner.map, "Update").mockImplementation(
        /** Fails inside the native temporary FORCE interval. @returns Never. */ function failedUpdate(): never {
          expect(owner.node.IsIgnoreDontExpand()).toBe(true);
          throw new Error("coordinate failure");
        },
      );
      expect(owner.node.InsertText.bind(owner.node, "XY", 6, 4)).toThrow("coordinate failure");
      expect(owner.node.GetText()).toBe("abcdefgh");
      owned(owner, 1, true, ignore, [2, 6]);
    },
  );
  it.each([0, 1, 2, 3, 4, 5, 6, 7])(
    "adjusts detached empty points without a node mode=%s",
    /** Checks portable zero-coordinate insertion does not infer a document-node state. @param mode - Native mode. @returns Nothing. */ function detachedCase(
      mode,
    ): void {
      const doc = new SwDoc(),
        node = required(doc.paragraphs[0]),
        hint = attribute(doc, 54, 1, true, 2, 2),
        map = new SwpHints(doc.GetAttrPool(), [hint]);
      node.SetIgnoreDontExpand(true);
      expect(map.insertText(8, 2, 2, undefined, node.GetSwAttrSet(), undefined, mode) === map).toBe(
        true,
      );
      const actual = map.Get(0);
      expect([actual.start, actual.end]).toEqual(required(emptyDontExpand[mode]));
      expect(actual instanceof SwTextINetFormat && actual.GetpTextNode()).toBeUndefined();
      expect(node.IsIgnoreDontExpand()).toBe(true);
      expect(node.GetpSwpHints()).toBeUndefined();
    },
  );
  it("distinguishes node DEFAULT and manager EMPTYEXPAND defaults", /** Checks native owner-specific defaults with identical zero fixtures. @returns Nothing. */ function defaultsCase(): void {
    const direct = fixture(54, 0, false, false, 2, 2),
      manager = fixture(54, 0, false, false, 2, 2);
    direct.node.InsertText("XY", 2);
    owned(direct, 0, false, false, [4, 4]);
    const point = new SwPosition(manager.node, 2);
    expect(manager.doc.GetDocumentContentOperationsManager().InsertString(point, "XY")).toBe(true);
    owned(manager, 0, false, false, [2, 4]);
    expect(point.GetContentIndex()).toBe(4);
  });
  it.each([0, 1, 2, 3, 4, 5, 6, 7])(
    "forwards manager mode=%s at the point without replacing the mark",
    /** Checks explicit mode propagation through real PaM indexes. @param mode - Native mode. @returns Nothing. */ function managerCase(
      mode,
    ): void {
      const owner = fixture(54, 0, false, true, 2, 2),
        point = new SwPosition(owner.node, 2),
        cursor = new SwPaM(point, new SwPosition(owner.node, 6));
      expect(owner.doc.GetDocumentContentOperationsManager().InsertString(cursor, "XY", mode)).toBe(
        true,
      );
      owned(owner, 0, false, true, required(emptyExpand[mode]));
      expect(owner.node.GetText()).toBe("abXYcdefgh");
      expect(cursor.GetPoint().GetContentIndex()).toBe(4);
      expect(cursor.GetMark().GetContentIndex()).toBe(8);
    },
  );
  it("keeps explicit items in fourth and hyperlinks in fifth positions", /** Checks the portable adapters retain values under the native third-mode signature. @returns Nothing. */ function adaptersCase(): void {
    const owner = fixture(54, 0, false, false, 2, 2),
      items = createWriterCharacterItemSet(owner.doc.GetAttrPool(), {
        bold: true,
        italic: false,
        underline: false,
      });
    owner.node.InsertText("XY", 2, SwInsertFlags.EMPTYEXPAND, items);
    expect(owner.node.GetTextAttrAt(3, 54) === owner.hint).toBe(true);
    expect([owner.hint.start, owner.hint.end]).toEqual([2, 4]);
    expect(owner.node.GetCharacterItemsAt(3).Get(15).QueryValue()).toBe(8);
    const plain = required(new SwDoc().paragraphs[0]);
    plain.InsertText("link", 0, SwInsertFlags.DEFAULT, undefined, { url: "explicit" });
    expect(plain.getHyperlinkAt(2)?.url).toBe("explicit");
    plain.InsertText("X", 4, SwInsertFlags.DEFAULT);
    expect(plain.GetText()).toBe("linkX");
  });
  it.each([0, 1, 2, 3, 4, 5, 6, 7])(
    "handles plain empty and UTF16 text mode=%s",
    /** Checks empty return and mode state preservation with literal UTF16 text. @param mode - Mode. @returns Nothing. */ function plainCase(
      mode,
    ): void {
      const doc = new SwDoc(),
        node = required(doc.paragraphs[0]);
      node.SetIgnoreDontExpand(true);
      const setter = vi.spyOn(node, "SetIgnoreDontExpand");
      expect(node.InsertText("", 0, mode)).toBe("");
      expect(setter).not.toHaveBeenCalled();
      expect(node.GetpSwpHints()).toBeUndefined();
      expect(node.InsertText("😀XY", 0, mode)).toBe("😀XY");
      expect(node.Len()).toBe(4);
      expect(node.IsIgnoreDontExpand()).toBe(true);
      expect(node.GetpSwpHints()).toBeUndefined();
      expect(
        doc.GetDocumentContentOperationsManager().InsertString(new SwPosition(node, 4), "", mode),
      ).toBe(false);
      expect(node.InsertText.bind(node, "X", 5, mode)).toThrow("outside");
      expect(node.IsIgnoreDontExpand()).toBe(true);
    },
  );
});
