/** @fileoverview Checks native body-text cross deletion/survivor/history/force contracts from literal fixtures without upstream invocation. */
import { describe, expect, it, vi } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { sw_GetJoinFlags, sw_JoinText } from "../../core/doc/docedt";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { SwUndoDelete } from "../../core/undo/undel";
import { SwDocShell } from "../app/docsh";
import { SwWrtShell } from "./wrtsh1";
import { SwTextNode } from "../../core/txtnode/ndtxt";
import { SwFormatAutoFormat, createWriterCharacterItemSet } from "../../core/txtnode/txatbase";
import { SwFormatINetFormat } from "../../core/txtnode/fmtatr2";
import { SwTextINetFormat } from "../../core/txtnode/txtatr2";
import { SwFormatPageDesc } from "../../core/attr/fmtpdsc";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";
import { FontWeight, SvxWeightItem } from "../../../../editeng/source/items/textitem";
import { SfxListUndoAction } from "../../../../svl/source/undo/undo";
import { SetAttrMode } from "../../../inc/swtypes";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { setTestSelection, getTestSelection } from "../../../../test/wrtsh-test-helpers";
import { type SwUndoRedoContext, createWriterCollapsedCursorState } from "../../core/undo/undobj";

/** Requires an actual owner. @param value - Optional owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing cross deletion owner");
  return value;
}
/** Creates actual graph/history/ranged owners. @param middleCount - Fully selected middle nodes. @param family - Native ranged family. @returns Graph,nodes,hints,shell. */
function fixture(middleCount = 0, family = 54) {
  const doc = new SwDoc(),
    first = required(doc.paragraphs[0]);
  first.SetText("abcd");
  const middle: SwTextNode[] = [];
  for (let index = 0; index < middleCount; index++)
    middle.push(doc.nodes.MakeTextNode("middle" + index));
  const last = doc.nodes.MakeTextNode("efgh");
  first.SetAttr(new SvxWeightItem(FontWeight.NORMAL, 15));
  last.SetAttr(new SvxWeightItem(FontWeight.BOLD, 15));
  first.SetParagraphAlignment("center");
  last.SetParagraphAlignment("right");
  last.ChgFormatColl(doc.GetTextFormatColl("text-body"));
  const items = createWriterCharacterItemSet(doc.GetAttrPool(), {
    bold: true,
    italic: false,
    underline: false,
  });
  const originals = [first, last].map(
    /** Creates an actual native ranged item. @param node - Boundary owner. @returns Original hint. */ (
      node,
    ) => {
      const value =
        family === 54 ? new SwFormatINetFormat("url", "target") : new SwFormatAutoFormat(items);
      if (value instanceof SwFormatINetFormat) value.SetName("original");
      const hint = node.InsertItem(value, 1, 3, SetAttrMode.NOTXTATRCHR | SetAttrMode.NOHINTADJUST);
      hint.SetLockExpandFlag(false);
      hint.dontExpand = false;
      hint.dontExpandStart = false;
      hint.dontMoveAttr = true;
      hint.SetFormatIgnoreStart(true);
      hint.SetFormatIgnoreEnd(true);
      return hint;
    },
  );
  const shell = new SwWrtShell(
    new SwDocShell(
      doc,
      createDocument({ id: "cross-native", suiteId: "writer", title: "Cross native" }),
    ),
  );
  return { doc, first, last, middle, originals, shell };
}
/** Installs literal directional endpoints. @param owner - Actual fixture. @param start - First offset. @param end - Last offset. @param reverse - Moving point at first node. @returns Nothing. */
function select(owner: ReturnType<typeof fixture>, start: number, end: number, reverse: boolean) {
  const a = { paragraphId: "p-1", offset: start },
    b = { paragraphId: "p-" + (owner.middle.length + 2), offset: end };
  expect(setTestSelection(owner.shell, { point: reverse ? a : b, mark: reverse ? b : a })).toBe(
    true,
  );
}
/** Checks fresh native history at each original boundary. @param owner - Actual fixture. @param family - Ranged family. @returns Nothing. */
function restored(owner: ReturnType<typeof fixture>, family: number) {
  for (let index = 0; index < 2; index++) {
    const node = index === 0 ? owner.first : owner.last,
      original = required(owner.originals[index]),
      map = required(node.GetpSwpHints()),
      hint = map.Get(0);
    expect(map.Count()).toBe(1);
    expect(hint).not.toBe(original);
    expect(hint.format).not.toBe(original.format);
    expect([hint.start, hint.end, hint.Which()]).toEqual([1, 3, family]);
    expect([
      hint.dontExpand,
      hint.dontExpandStart,
      hint.dontMoveAttr,
      hint.IsLockExpandFlag(),
    ]).toEqual([family === 54, family === 54, false, family === 54]);
    expect([hint.IsFormatIgnoreStart(), hint.IsFormatIgnoreEnd()]).toEqual([true, true]);
    expect(hint.m_pHints).toBe(map);
    expect(map.GetSortedByEnd(0)).toBe(hint);
    expect(map.GetSortedByWhichAndStart(0)).toBe(hint);
    if (hint instanceof SwTextINetFormat) {
      expect(hint.GetTextNode()).toBe(node);
      expect(hint.format.GetTextINetFormat()).toBe(hint);
      expect(hint.format.GetHyperlink()).toEqual({
        url: "url",
        targetFrame: "target",
        name: "original",
        styleName: "Internet Link",
        visitedStyleName: "Visited Internet Link",
      });
    } else
      expect((hint.format as SwFormatAutoFormat).GetStyleHandle()).toBe(
        (original.format as SwFormatAutoFormat).GetStyleHandle(),
      );
  }
}
/** Executes one actual shell input. @param shell - Owner. @param operation - Input path. @returns Whether changed. */
function input(shell: SwWrtShell, operation: string) {
  if (operation === "delete") return shell.DeleteSelection();
  if (operation === "composition") {
    shell.StartComposition();
    shell.UpdateComposition("XY");
    return shell.EndComposition();
  }
  return operation === "Insert" ? shell.Insert("XY") : shell.Replace("XY");
}

describe("native cross-node selected deletion", /** Registers literal structural/history/input contracts. @returns Nothing. */ () => {
  for (const middleCount of [0, 1, 3])
    for (const family of [53, 54])
      for (const start of [0, 1, 2, 4])
        for (const end of [0, 1, 2, 4])
          for (const reverse of [false, true])
            it.each(["delete", "Insert", "Replace", "composition"])(
              `middle=${middleCount} family=${family} range=${start}..${end} reverse=${reverse} %s`,
              /** Checks one native raw boundary deletion and source-chosen survivor. @param operation - Actual input path. @returns Nothing. */ (
                operation,
              ) => {
                const owner = fixture(middleCount, family),
                  { doc, first, last, middle, shell } = owner,
                  originalNodes = [first, ...middle, last];
                const styles = [first.GetTextFormatColl(), last.GetTextFormatColl()];
                const manager = doc.GetUndoManager(),
                  insert = vi.spyOn(doc.GetDocumentContentOperationsManager(), "InsertString");
                select(owner, start, end, reverse);
                const joinPrev = start === 0 && end < 4,
                  survivor = joinPrev ? last : first;
                const insertText =
                  operation === "delete" ? undefined : vi.spyOn(survivor, "InsertText");
                expect(input(shell, operation)).toBe(true);
                const expected =
                  "abcd".slice(0, start) + (operation === "delete" ? "" : "XY") + "efgh".slice(end);
                expect(doc.paragraphs).toEqual([survivor]);
                expect(survivor.GetText()).toBe(expected);
                expect(shell.GetCursor().GetPoint().GetNode()).toBe(survivor);
                expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(
                  start + (operation === "delete" ? 0 : 2),
                );
                expect(shell.GetCursor().HasMark()).toBe(false);
                expect(manager.GetUndoActionCount()).toBe(1);
                expect(manager.GetUndoNodes().Count()).toBe(middleCount + 1);
                const action = manager.GetUndoAction();
                if (operation === "delete") {
                  expect(action).toBeInstanceOf(SwUndoDelete);
                  expect(insert).not.toHaveBeenCalled();
                } else {
                  expect(action).toBeInstanceOf(SfxListUndoAction);
                  expect((action as SfxListUndoAction<SwUndoRedoContext>).GetActionCount()).toBe(2);
                  expect(insertText?.mock.calls[0]?.[2]).toBe(5);
                }
                expect(action?.GetPayloadSize()).toBeGreaterThanOrEqual(8 - start + end);
                for (let cycle = 0; cycle < 2; cycle++) {
                  expect(shell.Undo()).toBe(true);
                  expect(doc.paragraphs).toEqual(originalNodes);
                  expect(
                    originalNodes.map(
                      /** Reads actual text. @param node - Actual owner. @returns Native text. */ (
                        node,
                      ) => node.GetText(),
                    ),
                  ).toEqual([
                    "abcd",
                    ...middle.map(
                      /** Reads original literal middle texts. @param _node - Owner. @param i - Middle ordinal. @returns Expected text. */ (
                        _node,
                        i,
                      ) => "middle" + i,
                    ),
                    "efgh",
                  ]);
                  expect([first.GetParagraphAlignment(), last.GetParagraphAlignment()]).toEqual([
                    "center",
                    "right",
                  ]);
                  expect([first.GetTextFormatColl(), last.GetTextFormatColl()]).toEqual(styles);
                  expect([
                    first.GetpSwAttrSet()?.GetItemIfSet(15, false)?.QueryValue(),
                    last.GetpSwAttrSet()?.GetItemIfSet(15, false)?.QueryValue(),
                  ]).toEqual([FontWeight.NORMAL, FontWeight.BOLD]);
                  const a = { paragraphId: "p-1", offset: start },
                    b = { paragraphId: "p-" + (middleCount + 2), offset: end };
                  expect(getTestSelection(shell)).toEqual({
                    point: joinPrev ? a : b,
                    mark: joinPrev ? b : a,
                  });
                  restored(owner, family);
                  expect(shell.Redo()).toBe(true);
                  expect(doc.paragraphs).toEqual([survivor]);
                  expect(survivor.GetText()).toBe(expected);
                  if (operation !== "delete") expect(insertText?.mock.calls.at(-1)?.[2]).toBe(5);
                }
                expect(shell.Undo()).toBe(true);
                manager.Clear();
                expect(manager.GetUndoNodes().Count()).toBe(0);
              },
            );
  it.each([0, 1])(
    "release cross-node retained content with capacity=%s",
    /** Checks disposal while keeping actual deletion and surviving node correct. @param capacity - History capacity. @returns Nothing. */ (
      capacity,
    ) => {
      const owner = fixture(3),
        manager = owner.doc.GetUndoManager();
      manager.SetMaxUndoActionCount(capacity);
      select(owner, 0, 2, true);
      expect(owner.shell.Insert("XY")).toBe(true);
      expect(owner.doc.paragraphs).toEqual([owner.last]);
      expect(owner.last.GetText()).toBe("XYgh");
      manager.SetMaxUndoActionCount(0);
      expect(manager.GetUndoNodes().Count()).toBe(0);
      expect(owner.shell.Undo()).toBe(false);
    },
  );
  it("keeps untouched neighbors and middle hint owners across Undo/Redo and nested Replace", /** Checks non-boundary graph retention and list nesting. @returns Nothing. */ () => {
    const owner = fixture(1),
      { doc, first, last, middle, shell } = owner,
      before = doc.nodes.MakeTextNode("before"),
      after = doc.nodes.MakeTextNode("after");
    doc.nodes.moveTextNode(before, -1);
    doc.nodes.moveTextNode(before, -1);
    doc.nodes.moveTextNode(before, -1);
    const mid = required(middle[0]);
    mid.SetHyperlink(1, 5, { url: "middle" });
    const owned = required(mid.GetpSwpHints()).Get(0);
    const manager = doc.GetUndoManager();
    manager.StartUndo("outer");
    expect(
      setTestSelection(shell, {
        point: { paragraphId: "p2", offset: 0 },
        mark: { paragraphId: "p4", offset: 2 },
      }),
    ).toBe(true);
    expect(shell.Replace("XY")).toBe(true);
    expect(manager.GetListActionDepth()).toBe(1);
    manager.EndUndo();
    expect(doc.paragraphs).toEqual([before, last, after]);
    expect(last.GetText()).toBe("XYgh");
    expect(shell.Undo()).toBe(true);
    expect(doc.paragraphs).toEqual([before, first, mid, last, after]);
    expect(required(mid.GetpSwpHints()).Get(0)).toBe(owned);
    expect((owned as SwTextINetFormat).GetTextNode()).toBe(mid);
    expect(shell.Redo()).toBe(true);
    expect(doc.paragraphs).toEqual([before, last, after]);
    expect([before.GetText(), after.GetText()]).toEqual(["before", "after"]);
  });
});

describe("native join flags and body-text kernel", /** Registers direct core and unsupported graph guards. @returns Nothing. */ () => {
  it.each([false, true])(
    "exchanges actual endpoint objects once,reverse=%s",
    /** Verifies pointer identity and normalized native direction. @param reverse - Original direction. @returns Nothing. */ (
      reverse,
    ) => {
      const owner = fixture(),
        { first, last } = owner,
        a = new SwPosition(first, 0),
        b = new SwPosition(last, 2),
        range = new SwPaM(reverse ? a : b, reverse ? b : a);
      const point = range.GetPoint(),
        mark = range.GetMark();
      const flags = sw_GetJoinFlags(range);
      expect(flags).toEqual({ joinText: true, joinPrev: true });
      expect(range.GetPoint()).toBe(reverse ? point : mark);
      expect(range.GetMark()).toBe(reverse ? mark : point);
      expect(sw_GetJoinFlags(range)).toEqual(flags);
      expect(range.GetPoint()).toBe(reverse ? point : mark);
      range.Dispose();
      a.Dispose();
      b.Dispose();
    },
  );
  it("does not exchange a collapsed PaM and delegates same-node deletion", /** Checks native no-join and empty selection return. @returns Nothing. */ () => {
    const { doc, first } = fixture(),
      position = new SwPosition(first, 2),
      range = new SwPaM(position),
      manager = doc.GetDocumentContentOperationsManager();
    const point = range.GetPoint();
    range.Exchange();
    expect(range.GetPoint()).toBe(point);
    expect(sw_GetJoinFlags(range)).toEqual({ joinText: false, joinPrev: false });
    expect(manager.DeleteAndJoin(range)).toBe(false);
    range.SetMark();
    expect(manager.DeleteAndJoin(range)).toBe(false);
    range.GetMark().Assign(first, 0);
    expect(manager.DeleteAndJoin(range)).toBe(true);
    expect(first.GetText()).toBe("cd");
    range.Dispose();
    position.Dispose();
  });
  it.each(["start", "end"])(
    "rejects unimplemented nontext %s flags before mutation",
    /** Checks actual native node-index assignments at structural sentinels. @param side - Unsupported endpoint. @returns Nothing. */ (
      side,
    ) => {
      const { doc, first, last } = fixture(),
        a = new SwPosition(first, 0),
        b = new SwPosition(last, 0),
        range = new SwPaM(a, b);
      if (side === "start")
        range.GetPoint().nNode.Assign(doc.nodes.GetEndOfContent().StartOfSectionNode());
      else range.GetMark().nNode.Assign(doc.nodes.GetEndOfContent());
      expect(sw_GetJoinFlags(range)).toEqual({ joinText: false, joinPrev: false });
      expect([first.GetText(), last.GetText()]).toEqual(["abcd", "efgh"]);
      if (side === "start") expect(sw_JoinText(range, true)).toBe(false);
      range.Dispose();
      a.Dispose();
      b.Dispose();
    },
  );
  it("returns false when the next actual node is a section end", /** Checks native CanJoinNext nontext boundary. @returns Nothing. */ () => {
    const { last } = fixture(),
      position = new SwPosition(last, 0),
      range = new SwPaM(position);
    expect(sw_JoinText(range, false)).toBe(false);
    range.Dispose();
    position.Dispose();
  });
  it.each(["absent", "character", "breaks"])(
    "JoinPrev transfers direct break/page descriptor policy %s",
    /** Verifies source SET-only copy,clearing target values and Undo restoration. @param kind - Leading direct item case. @returns Nothing. */ (
      kind,
    ) => {
      const { doc, first, last } = fixture();
      first.ResetAllAttr();
      if (kind === "character") first.SetAttr(new SvxWeightItem(FontWeight.NORMAL, 15));
      if (kind === "breaks") {
        first.SetAttr(new SwFormatPageDesc("first-page", 3));
        first.SetAttr(new SfxInt16Item(101, 1));
      }
      last.SetAttr(new SwFormatPageDesc("last-page", 9));
      last.SetAttr(new SfxInt16Item(101, 2));
      const a = new SwPosition(first, 0),
        b = new SwPosition(last, 2),
        range = new SwPaM(a, b);
      expect(doc.GetDocumentContentOperationsManager().DeleteAndJoin(range)).toBe(true);
      expect(doc.paragraphs).toEqual([last]);
      expect(last.GetText()).toBe("gh");
      expect(last.GetpSwAttrSet()?.GetItemIfSet(100, false)?.QueryValue()).toEqual(
        kind === "breaks" ? ["first-page", 3] : undefined,
      );
      expect(last.GetpSwAttrSet()?.GetItemIfSet(101, false)?.QueryValue()).toBe(
        kind === "breaks" ? 1 : undefined,
      );
      range.Dispose();
      a.Dispose();
      b.Dispose();
    },
  );
  it("rejects a section-spanning kernel and history constructor without partial deletion", /** Protects existing table/section nodes from unsupported body-text deletion. @returns Nothing. */ () => {
    const { doc, first, last } = fixture();
    doc.nodes.MakeTableNode("table", {}, first);
    const a = new SwPosition(first, 1),
      b = new SwPosition(last, 2),
      range = new SwPaM(a, b),
      cursor = createWriterCollapsedCursorState(
        first,
        1,
        createWriterCharacterItemSet(doc.GetAttrPool(), {
          bold: false,
          italic: false,
          underline: false,
        }),
      );
    expect(
      /** Attempts an unsupported structural selection. @returns Whether deleted. */ () =>
        doc.GetDocumentContentOperationsManager().DeleteAndJoin(range),
    ).toThrow("text nodes in one section");
    expect(
      /** Attempts an unsupported history selection. @returns Delete action. */ () =>
        new SwUndoDelete(first, 1, "bcd", "delete", undefined, cursor, cursor, range),
    ).toThrow("text nodes in one section");
    expect([first.GetText(), last.GetText()]).toEqual(["abcd", "efgh"]);
    expect(doc.GetUndoManager().GetUndoNodes().Count()).toBe(0);
    range.Dispose();
    a.Dispose();
    b.Dispose();
  });
  it("rejects using the cross-selection constructor adapter for a single node", /** Checks explicit adapter profile before retaining content. @returns Nothing. */ () => {
    const { doc, first } = fixture(),
      a = new SwPosition(first, 0),
      b = new SwPosition(first, 2),
      range = new SwPaM(a, b),
      cursor = createWriterCollapsedCursorState(
        first,
        0,
        createWriterCharacterItemSet(doc.GetAttrPool(), {
          bold: false,
          italic: false,
          underline: false,
        }),
      );
    expect(
      /** Attempts an unsupported history selection. @returns Delete action. */ () =>
        new SwUndoDelete(first, 0, "ab", "delete", undefined, cursor, cursor, range),
    ).toThrow("text nodes in one section");
    range.Dispose();
    a.Dispose();
    b.Dispose();
  });
});
