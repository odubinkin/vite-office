/** @fileoverview Checks native direct-item conversion and join history with literal owners,without upstream execution. */
import { describe, expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwTextNode } from "./ndtxt";
import { SwFormatAutoFormat } from "./txatbase";
import { SwFormatINetFormat } from "./fmtatr2";
import { SwTextINetFormat } from "./txtatr2";
import { ConvertTextNodeItemsToHints, MakeTextAttr } from "./thints";
import { SetAttrMode } from "../../../inc/swtypes";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxUInt16Item } from "../../../../svl/source/items/intitem";
import {
  FontWeight,
  SvxWeightItem,
  FontItalic,
  SvxPostureItem,
} from "../../../../editeng/source/items/textitem";
import { SwTextFormatColl } from "../doc/fmtcol";
import {
  SwHistory,
  SwHistorySetFormat,
  SwHistoryChangeFormatColl,
  HISTORY_HINT,
} from "../undo/rolbck";
import { SwDocShell } from "../../uibase/app/docsh";
import { SwWrtShell } from "../../uibase/wrtsh/wrtsh1";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { setTestCursor } from "../../../../test/wrtsh-test-helpers";

/** Requires an actual graph owner. @param value - Optional owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing conversion owner");
  return value;
}
/** Creates two actual adjacent text nodes. @param text - Leading text. @returns Graph and nodes. */
function fixture(text = "abcd") {
  const doc = new SwDoc(),
    first = required(doc.paragraphs[0]),
    second = doc.nodes.MakeTextNode("efgh");
  first.SetText(text);
  return { doc, first, second };
}
/** Creates a literal direct character set. @param doc - Pool owner. @param weight - Weight value. @param which - Script WhichId. @returns Item set. */
function weightSet(doc: SwDoc, weight: FontWeight, which = 15) {
  const set = new SfxItemSet(doc.GetAttrPool(), [[1, 48]]);
  set.Put(new SvxWeightItem(weight, which));
  return set;
}
/** Inserts one actual AUTO portion. @param node - Actual owner. @param start - Inclusive start. @param end - Exclusive end. @param weight - Literal weight. @returns Owned hint. */
function auto(node: SwTextNode, start: number, end: number, weight = FontWeight.BOLD) {
  return node.InsertItem(
    new SwFormatAutoFormat(weightSet(node.GetDoc(), weight)),
    start,
    end,
    SetAttrMode.NOTXTATRCHR | SetAttrMode.NOHINTADJUST,
  );
}
/** Reads direct item values only. @param node - Actual node. @param which - WhichId. @returns Optional value. */
function direct(node: SwTextNode, which = 15) {
  return node.GetpSwAttrSet()?.GetItemIfSet(which, false)?.QueryValue();
}
/** Reads actual AUTO span values in owner order. @param node - Actual node. @param which - WhichId. @returns Literal span tuples. */
function spans(node: SwTextNode, which = 15) {
  return (node.GetpSwpHints()?.entries() ?? [])
    .filter(
      /** Selects AUTO attributes. @param hint - Actual hint. @returns AUTO membership. */
      (hint) => hint.format instanceof SwFormatAutoFormat,
    )
    .map(
      /** Reads span and concrete item. @param hint - Actual AUTO. @returns Tuple. */
      (hint) => [
        hint.start,
        hint.end,
        (hint.format as SwFormatAutoFormat)
          .GetStyleHandle()
          .GetItemIfSet(which, false)
          ?.QueryValue(),
      ],
    );
}

describe("native paragraph character conversion", /** Registers five-pair and real span contracts. @returns Nothing. */ () => {
  it("coalesces converted direct weight across adjacent pooled italic spans", /** Checks a real conversion boundary whose existing spans carry another property. @returns Nothing. */ () => {
    const { doc, first } = fixture();
    const italic = new SfxItemSet(doc.GetAttrPool(), [[1, 48]]);
    italic.Put(new SvxPostureItem(FontItalic.NORMAL, 11));
    const a = MakeTextAttr(doc, italic, 0, 2),
      b = MakeTextAttr(doc, italic, 2, 4);
    first.GetOrCreateSwpHints().Insert(a);
    first.GetOrCreateSwpHints().Insert(b);
    first.SetAttr(new SvxWeightItem(FontWeight.BOLD, 15));
    first.FormatToTextAttr(first);
    expect(spans(first)).toEqual([[0, 4, FontWeight.BOLD]]);
    expect(spans(first, 11)).toEqual([[0, 4, FontItalic.NORMAL]]);
    const map = required(first.GetpSwpHints()),
      merged = map.Get(0);
    expect(map.Count()).toBe(1);
    expect(merged).not.toBe(a);
    expect(merged).not.toBe(b);
    expect(merged.m_pHints).toBe(map);
    expect(map.GetSortedByEnd(0)).toBe(merged);
    expect(map.GetSortedByWhichAndStart(0)).toBe(merged);
    expect([a.m_pHints, b.m_pHints, direct(first)]).toEqual([undefined, undefined, undefined]);
  });
  for (const which of [15, 26, 31])
    for (const length of [0, 4])
      it.each(["absent", "source", "main", "equal", "different"])(
        `five pairs which=${which} length=${length} %s`,
        /** Verifies direct SET-only combinations. @param pair - Literal pair case. @returns Nothing. */ (
          pair,
        ) => {
          const { doc, first, second } = fixture(length === 0 ? "" : "abcd");
          second.SetText(length === 0 ? "" : "efgh");
          if (pair === "source" || pair === "equal" || pair === "different")
            second.SetAttr(new SvxWeightItem(FontWeight.BOLD, which));
          if (pair === "main" || pair === "equal" || pair === "different")
            first.SetAttr(
              new SvxWeightItem(pair === "different" ? FontWeight.NORMAL : FontWeight.BOLD, which),
            );
          first.SetAttr(new SfxUInt16Item(80, 0));
          second.SetAttr(new SfxUInt16Item(80, 0));
          second.FormatToTextAttr(first);
          expect(direct(second, which)).toBeUndefined();
          expect(direct(first, which)).toBe(
            pair === "equal"
              ? FontWeight.BOLD
              : pair === "different"
                ? FontWeight.NORMAL
                : undefined,
          );
          expect(spans(second, which)).toEqual(
            length && (pair === "source" || pair === "different") ? [[0, 4, FontWeight.BOLD]] : [],
          );
          expect(spans(first, which)).toEqual(
            length && pair === "main" ? [[0, 4, FontWeight.BOLD]] : [],
          );
          expect(direct(first, 80)).toBe(0);
          expect(direct(second, 80)).toBe(0);
          expect(first.GetpSwpHints() === undefined).toBe(!(length && pair === "main"));
          expect(second.GetpSwpHints()).toBeDefined();
          expect(doc.paragraphs).toEqual([first, second]);
        },
      );
  it.each([0, 4])(
    "self conversion length=%s preserves inherited values",
    /** Distinguishes inherited collection items from direct SET items. @param length - Text extent. @returns Nothing. */ (
      length,
    ) => {
      const { doc, first } = fixture(length ? "abcd" : "");
      const style = doc.GetTextFormatColl("text-body");
      style.SetFormatAttr(new SvxPostureItem(FontItalic.NORMAL, 11));
      first.ChgFormatColl(style);
      first.SetAttr(new SvxWeightItem(FontWeight.BOLD, 15));
      first.FormatToTextAttr(first);
      expect(direct(first)).toBeUndefined();
      expect(spans(first)).toEqual(length ? [[0, 4, FontWeight.BOLD]] : []);
      expect(spans(first, 11)).toEqual(length ? [[0, 4, undefined]] : []);
      expect(first.GetTextFormatColl()).toBe(style);
      first.FormatToTextAttr(first);
      expect(spans(first)).toEqual(length ? [[0, 4, FontWeight.BOLD]] : []);
    },
  );
  it("fills gaps while ranged items override converted direct items and INET ownership survives", /** Checks native span collection without BuildPortions. @returns Nothing. */ () => {
    const { doc, first } = fixture("abcdefgh");
    const old = auto(first, 2, 6, FontWeight.NORMAL);
    const inet = first.InsertItem(
      new SwFormatINetFormat("url", "target"),
      1,
      7,
      SetAttrMode.NOTXTATRCHR | SetAttrMode.NOHINTADJUST,
    );
    const items = weightSet(doc, FontWeight.BOLD);
    items.Put(new SvxPostureItem(FontItalic.NORMAL, 11));
    first.SetAttr(items);
    first.FormatToTextAttr(first);
    expect(spans(first)).toEqual([
      [0, 2, FontWeight.BOLD],
      [2, 6, FontWeight.NORMAL],
      [6, 8, FontWeight.BOLD],
    ]);
    expect(spans(first, 11)).toEqual([
      [0, 2, FontItalic.NORMAL],
      [2, 6, FontItalic.NORMAL],
      [6, 8, FontItalic.NORMAL],
    ]);
    expect(old.m_pHints).toBeUndefined();
    const map = required(first.GetpSwpHints());
    expect(map.entries()).toContain(inet);
    expect(inet.m_pHints).toBe(map);
    expect((inet as SwTextINetFormat).GetTextNode()).toBe(first);
    expect((inet.format as SwFormatINetFormat).GetTextINetFormat()).toBe(inet);
    expect(direct(first)).toBeUndefined();
    expect(direct(first, 11)).toBeUndefined();
  });
  it("preserves an existing covering AUTO owner when every converted Which is already present", /** Exercises native RemovePresentAttrs no-replacement branch. @returns Nothing. */ () => {
    const { first } = fixture();
    const old = auto(first, 0, 4, FontWeight.NORMAL);
    old.SetFormatIgnoreStart(true);
    old.SetFormatIgnoreEnd(true);
    first.SetAttr(new SvxWeightItem(FontWeight.BOLD, 15));
    first.FormatToTextAttr(first);
    expect(required(first.GetpSwpHints()).Get(0)).toBe(old);
    expect(spans(first)).toEqual([[0, 4, FontWeight.NORMAL]]);
    expect([old.IsFormatIgnoreStart(), old.IsFormatIgnoreEnd()]).toEqual([false, false]);
  });
  it("merges equal adjacent AUTO portions,skips zero and INET,normalizes nonzero flags", /** Verifies actual owner retention and all sorted maps. @returns Nothing. */ () => {
    const { first } = fixture("abcdef");
    const a = auto(first, 0, 2),
      b = first.InsertItem(a.format, 2, 4, SetAttrMode.NOTXTATRCHR | SetAttrMode.NOHINTADJUST),
      zero = auto(first, 2, 2),
      c = auto(first, 4, 6, FontWeight.NORMAL);
    const inet = first.InsertItem(
      new SwFormatINetFormat("url"),
      1,
      5,
      SetAttrMode.NOTXTATRCHR | SetAttrMode.NOHINTADJUST,
    );
    for (const hint of [a, b, zero, c]) {
      hint.SetFormatIgnoreStart(true);
      hint.SetFormatIgnoreEnd(true);
    }
    const map = required(first.GetpSwpHints());
    expect(map.MergePortions(first)).toBe(true);
    expect(spans(first)).toEqual([
      [0, 4, FontWeight.BOLD],
      [2, 2, FontWeight.BOLD],
      [4, 6, FontWeight.NORMAL],
    ]);
    expect(map.entries()).toContain(a);
    expect(map.entries()).not.toContain(b);
    expect(b.m_pHints).toBeUndefined();
    expect(map.entries()).toContain(inet);
    expect([
      a.IsFormatIgnoreStart(),
      a.IsFormatIgnoreEnd(),
      c.IsFormatIgnoreStart(),
      c.IsFormatIgnoreEnd(),
    ]).toEqual([false, false, false, false]);
    expect([zero.IsFormatIgnoreStart(), zero.IsFormatIgnoreEnd()]).toEqual([true, true]);
    expect(map.GetSortedByEnd(map.entries().length - 1)).toBe(c);
    expect(map.MergePortions(first)).toBe(false);
  });
  it("keeps gapped equal portions and ignores an empty conversion set", /** Protects no-op map allocation and nonadjacent portions. @returns Nothing. */ () => {
    const { doc, first, second } = fixture();
    ConvertTextNodeItemsToHints(second, new SfxItemSet(doc.GetAttrPool(), [[1, 48]]));
    expect(second.GetpSwpHints()).toBeUndefined();
    auto(first, 0, 1);
    auto(first, 3, 4);
    expect(required(first.GetpSwpHints()).MergePortions(first)).toBe(false);
    expect(spans(first)).toEqual([
      [0, 1, FontWeight.BOLD],
      [3, 4, FontWeight.BOLD],
    ]);
  });
});

describe("native direct format and collection history", /** Registers native history entry contracts. @returns Nothing. */ () => {
  it.each([true, false])(
    "SetFormat temporary=%s clones and releases only destructive history",
    /** Checks independent pooled item history. @param tmp - Temporary policy. @returns Nothing. */ (
      tmp,
    ) => {
      const { first, doc } = fixture();
      const value = new SvxWeightItem(FontWeight.BOLD, 15),
        entry = new SwHistorySetFormat(value, first.GetIndex());
      expect(entry.Which()).toBe(HISTORY_HINT.HSTRY_SETFMTHNT);
      expect(entry.GetDescription()).toBe("");
      const clone = Object.getOwnPropertyDescriptor(entry, "m_pAttr")?.value;
      expect(clone).not.toBe(value);
      entry.SetInDoc(doc, tmp);
      expect(direct(first)).toBe(FontWeight.BOLD);
      expect(Object.getOwnPropertyDescriptor(entry, "m_pAttr")?.value).toBe(
        tmp ? clone : undefined,
      );
      if (tmp) {
        first.ResetAllAttr();
        entry.SetInDoc(doc, false);
        expect(direct(first)).toBe(FontWeight.BOLD);
      }
    },
  );
  it("does not apply direct format to a structural sentinel", /** Checks actual noncontent node branch. @returns Nothing. */ () => {
    const { doc } = fixture();
    const entry = new SwHistorySetFormat(new SvxWeightItem(FontWeight.BOLD, 15), 0);
    entry.SetInDoc(doc, false);
    expect(Object.getOwnPropertyDescriptor(entry, "m_pAttr")?.value).toBeUndefined();
  });
  it.each(["live", "dead", "type", "sentinel"])(
    "collection history %s preserves pointer and node category",
    /** Checks native live collection identity. @param kind - Owner condition. @returns Nothing. */ (
      kind,
    ) => {
      const { doc, first } = fixture();
      const original = doc.GetTextFormatColl("text-body"),
        other = doc.GetTextFormatColl("heading-1");
      const coll =
        kind === "dead"
          ? new SwTextFormatColl(doc.GetAttrPool(), "dead", original.GetName())
          : original;
      first.ChgFormatColl(other);
      const entry = new SwHistoryChangeFormatColl(
        coll,
        kind === "sentinel" ? 0 : first.GetIndex(),
        kind === "type" ? "start" : "text",
      );
      expect(entry.Which()).toBe(HISTORY_HINT.HSTRY_CHGFMTCOLL);
      entry.SetInDoc(doc, true);
      expect(first.GetTextFormatColl()).toBe(kind === "live" ? original : other);
      entry.SetInDoc(doc, false);
      expect(first.GetTextFormatColl()).toBe(kind === "live" ? original : other);
    },
  );
  it("copies explicit format items and collection into forward temporary history", /** Checks count,order,partial rollback and repeated restoration. @returns Nothing. */ () => {
    const { doc, first } = fixture();
    const items = weightSet(doc, FontWeight.BOLD);
    items.Put(new SvxPostureItem(FontItalic.NORMAL, 11));
    const history = new SwHistory(),
      original = first.GetTextFormatColl();
    history.CopyFormatAttr(new SfxItemSet(doc.GetAttrPool(), [[1, 48]]), first.GetIndex());
    expect(history.Count()).toBe(0);
    history.CopyFormatAttr(items, first.GetIndex());
    history.AddColl(original, first.GetIndex(), "text");
    expect(history.Count()).toBe(3);
    expect(history.at(0)).toBeInstanceOf(SwHistorySetFormat);
    expect(history.at(2)).toBeInstanceOf(SwHistoryChangeFormatColl);
    first.ChgFormatColl(doc.GetTextFormatColl("heading-1"));
    expect(history.TmpRollback(doc, 1, false)).toBe(true);
    expect(direct(first)).toBe(FontWeight.BOLD);
    expect(direct(first, 11)).toBeUndefined();
    expect(first.GetTextFormatColl()).toBe(original);
    history.SetTmpEnd(history.Count());
    first.ResetAllAttr();
    expect(history.TmpRollback(doc, 0, false)).toBe(true);
    expect(direct(first, 11)).toBe(FontItalic.NORMAL);
    history.SetTmpEnd(history.Count());
    expect(history.Rollback(doc)).toBe(true);
    expect(history.Count()).toBe(0);
  });
});

describe("native paragraph join preparation and history", /** Registers actual shell join undo/redo. @returns Nothing. */ () => {
  it.each(["source", "main", "equal", "different", "absent"])(
    "nonempty boundary %s with fresh hint history",
    /** Checks character conversion and repeated restoration. @param pair - Direct pair. @returns Nothing. */ (
      pair,
    ) => {
      const { doc, first, second } = fixture();
      if (pair === "source" || pair === "equal" || pair === "different")
        second.SetAttr(new SvxWeightItem(FontWeight.BOLD, 15));
      if (pair === "main" || pair === "equal" || pair === "different")
        first.SetAttr(
          new SvxWeightItem(pair === "different" ? FontWeight.NORMAL : FontWeight.BOLD, 15),
        );
      const firstValue = direct(first),
        secondValue = direct(second);
      const firstStyle = doc.GetTextFormatColl("text-body"),
        secondStyle = doc.GetTextFormatColl("heading-1");
      first.ChgFormatColl(firstStyle);
      second.ChgFormatColl(secondStyle);
      const hint = second.InsertItem(
        new SwFormatINetFormat("url", "target"),
        1,
        3,
        SetAttrMode.NOTXTATRCHR | SetAttrMode.NOHINTADJUST,
      );
      hint.SetLockExpandFlag(false);
      hint.dontMoveAttr = true;
      hint.dontExpand = false;
      hint.SetFormatIgnoreStart(true);
      const shell = new SwWrtShell(
        new SwDocShell(
          doc,
          createDocument({ id: "join-native", suiteId: "writer", title: "Join" }),
        ),
      );
      expect(setTestCursor(shell, "p2", 0)).toBe(true);
      expect(shell.DelLeft()).toBe(true);
      expect(doc.paragraphs).toEqual([first]);
      expect(first.GetText()).toBe("abcdefgh");
      expect(direct(first)).toBe(
        pair === "equal" ? FontWeight.BOLD : pair === "different" ? FontWeight.NORMAL : undefined,
      );
      expect(spans(first)).toEqual(
        pair === "source" || pair === "different"
          ? [[4, 8, FontWeight.BOLD]]
          : pair === "main"
            ? [[0, 4, FontWeight.BOLD]]
            : [],
      );
      for (let cycle = 0; cycle < 2; cycle++) {
        expect(shell.Undo()).toBe(true);
        expect(doc.paragraphs).toEqual([first, second]);
        expect([first.GetText(), second.GetText()]).toEqual(["abcd", "efgh"]);
        expect([direct(first), direct(second)]).toEqual([firstValue, secondValue]);
        expect([first.GetTextFormatColl(), second.GetTextFormatColl()]).toEqual([
          firstStyle,
          secondStyle,
        ]);
        const restored = required(second.GetpSwpHints()).Get(0);
        expect(restored).not.toBe(hint);
        expect(restored.format).not.toBe(hint.format);
        expect([restored.start, restored.end]).toEqual([1, 3]);
        expect([
          restored.dontExpand,
          restored.dontExpandStart,
          restored.dontMoveAttr,
          restored.IsLockExpandFlag(),
          restored.IsFormatIgnoreStart(),
        ]).toEqual([true, true, false, true, true]);
        expect((restored as SwTextINetFormat).GetTextNode()).toBe(second);
        expect(shell.Redo()).toBe(true);
        expect(first.GetText()).toBe("abcdefgh");
      }
      expect(shell.Undo()).toBe(true);
    },
  );
  it.each([true, false])(
    "empty leading clears character items and copies direct-only trailing values=%s",
    /** Protects empty-leading policy and paragraph properties. @param hasDirect - Trailing direct character. @returns Nothing. */ (
      hasDirect,
    ) => {
      const { doc, first, second } = fixture("");
      first.SetAttr(new SvxWeightItem(FontWeight.BOLD, 15));
      first.SetAttr(new SfxUInt16Item(80, 0));
      if (hasDirect) second.SetAttr(new SvxPostureItem(FontItalic.NORMAL, 11));
      second.ChgFormatColl(doc.GetTextFormatColl("heading-1"));
      doc.GetTextFormatColl("heading-1").SetFormatAttr(new SvxWeightItem(FontWeight.BOLD, 15));
      const original = first.GetTextFormatColl();
      expect(doc.GetDocumentContentOperationsManager().JoinTextNodes(first, second)).toBe(0);
      expect(first.GetText()).toBe("efgh");
      expect(direct(first)).toBeUndefined();
      expect(direct(first, 11)).toBe(hasDirect ? FontItalic.NORMAL : undefined);
      expect(direct(first, 80)).toBe(0);
      expect(first.GetTextFormatColl()).toBe(original);
      expect(spans(first)).toEqual([]);
    },
  );
});
