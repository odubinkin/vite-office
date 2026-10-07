/** @fileoverview Verifies native split attribute history and fresh redo state without upstream access. */
import { expect, it, vi } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwPosition } from "../crsr/pam";
import { SwUndoSplitNode } from "./unspnd";
import { SwHistory } from "./rolbck";
import { createWriterCollapsedCursorState, type SwUndoRedoContext } from "./undobj";
import { SwFormatAutoFormat, createWriterCharacterItemSet } from "../txtnode/txatbase";
import { SwFormatINetFormat } from "../txtnode/fmtatr2";
import { SwTextINetFormat } from "../txtnode/txtatr2";
import { SetAttrMode } from "../../../inc/swtypes";
import { SwDocShell } from "../../uibase/app/docsh";

import { SwEditWin } from "../../uibase/docvw/edtwin";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { SwView } from "../../uibase/uiview/view";

/** Requires an actual owner. @param value - Optional native owner. @returns Actual owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing split history owner");
  return value;
}
/** Creates real graph and shell owners. @param family - Ranged native family. @param mask - Original expansion flags. @param ignored - Original format-ignore flags. @param text - Original text. @returns Native owners. */
function fixture(family = 54, mask = 0, ignored = 0, text = "abcdefgh") {
  const doc = new SwDoc(),
    node = required(doc.paragraphs[0]);
  node.SetText(text);
  const value =
    family === 54
      ? new SwFormatINetFormat("native-url", "target")
      : new SwFormatAutoFormat(
          createWriterCharacterItemSet(doc.GetAttrPool(), {
            bold: true,
            italic: false,
            underline: false,
          }),
        );
  if (value instanceof SwFormatINetFormat) value.SetName("original-name");
  const hint = node.InsertItem(value, 2, 6, SetAttrMode.NOTXTATRCHR | SetAttrMode.NOHINTADJUST);
  hint.SetLockExpandFlag(false);
  hint.dontExpand = Boolean(mask & 1);
  hint.dontExpandStart = Boolean(mask & 2);
  hint.dontMoveAttr = Boolean(mask & 4);
  hint.SetLockExpandFlag(mask !== 0);
  hint.SetFormatIgnoreStart(Boolean(ignored & 1));
  hint.SetFormatIgnoreEnd(Boolean(ignored & 2));
  const shell = new SwView(
    new SwDocShell(
      doc,
      createDocument({ id: "native-split-history", suiteId: "writer", title: "Split history" }),
    ),
  ).GetWrtShell();
  return { doc, node, hint, value, shell };
}
/** Sets a real native point without portable coordinates. @param owner - Native owners. @param offset - Point offset. @returns Nothing. */
function point(owner: ReturnType<typeof fixture>, offset: number) {
  const position = new SwPosition(owner.node, offset);
  try {
    owner.shell.SetPaM(position);
  } finally {
    position.Dispose();
  }
}
/** Verifies original ranges with native reconstruction flags and item ownership. @param owner - Original graph and items. @param ignored - Retained format-ignore bits. @returns Nothing. */
function original(owner: ReturnType<typeof fixture>, ignored: number) {
  expect(owner.doc.paragraphs).toEqual([owner.node]);
  expect(owner.node.GetText()).toBe("abcdefgh");
  const map = required(owner.node.GetpSwpHints()),
    hint = map.Get(0);
  expect(map.Count()).toBe(1);
  expect([hint.GetStart(), hint.GetAnyEnd()]).toEqual([2, 6]);
  expect(hint).not.toBe(owner.hint);
  expect(hint.format).not.toBe(owner.hint.format);
  expect(hint.m_pHints).toBe(map);
  expect(map.GetSortedByEnd(0)).toBe(hint);
  expect(map.GetSortedByWhichAndStart(0)).toBe(hint);
  const internet = hint instanceof SwTextINetFormat;
  expect([
    hint.DontExpand(),
    hint.IsDontExpandStartAttr(),
    hint.IsDontMoveAttr(),
    hint.IsLockExpandFlag(),
  ]).toEqual([internet, internet, false, internet]);
  expect([hint.IsFormatIgnoreStart(), hint.IsFormatIgnoreEnd()]).toEqual([
    Boolean(ignored & 1),
    Boolean(ignored & 2),
  ]);
  if (hint instanceof SwTextINetFormat) {
    expect(hint.GetTextNode()).toBe(owner.node);
    expect(hint.format.GetTextINetFormat()).toBe(hint);
    expect(hint.format.GetHyperlink()).toEqual({
      url: "native-url",
      targetFrame: "target",
      name: "original-name",
      styleName: "Internet Link",
      visitedStyleName: "Visited Internet Link",
    });
  } else {
    expect(hint.format).toBeInstanceOf(SwFormatAutoFormat);
    expect((hint.format as SwFormatAutoFormat).GetStyleHandle()).toBe(
      (owner.value as SwFormatAutoFormat).GetStyleHandle(),
    );
  }
}
const cases = [54, 55].flatMap(
  /** Combines native families with boundaries and independent flag contracts. @param family - Family. @returns Native cases. */
  (family) =>
    [0, 4, 8].flatMap(
      /** Combines a split boundary with original flags. @param offset - Boundary. @returns Native cases. */
      (offset) =>
        [0, 7].flatMap(
          /** Retains independent format-ignore variants. @param mask - Flags. @returns Native cases. */
          (mask) =>
            [0, 3].map(
              /** Records literal independent source inputs. @param ignored - Ignore flags. @returns Case. */
              (ignored) => [family, offset, mask, ignored] as const,
            ),
        ),
    ),
);
it.each(cases)(
  "native split history restores original ranges and constructor flags %i/%i/%i/%i",
  /** Checks native CopyAttr, forward rollback and rearm through real shell history. @param family - Family. @param offset - Split boundary. @param mask - Original flags. @param ignored - Format-ignore bits. @returns Nothing. */
  (family, offset, mask, ignored) => {
    const owner = fixture(family, mask, ignored),
      map = owner.node.GetpSwpHints(),
      copy = vi.spyOn(SwHistory.prototype, "CopyAttr"),
      rollback = vi.spyOn(SwHistory.prototype, "TmpRollback"),
      rearm = vi.spyOn(SwHistory.prototype, "SetTmpEnd");
    try {
      point(owner, offset);
      expect(owner.shell.SplitNode()).toBe(true);
      const suffix = owner.shell.GetActiveParagraph(),
        action = required(owner.doc.GetUndoManager().GetUndoAction()),
        history = required(copy.mock.contexts[0]) as SwHistory;
      expect(action).toBeInstanceOf(SwUndoSplitNode);
      expect(copy).toHaveBeenCalledExactlyOnceWith(map, owner.node.GetIndex(), 0, 8, false);
      expect(history.Count()).toBe(1);
      expect(action.GetPayloadSize()).toBe(5);
      for (let cycle = 0; cycle < 3; cycle += 1) {
        expect([owner.node.GetText(), suffix.GetText()]).toEqual([
          "abcdefgh".slice(0, offset),
          "abcdefgh".slice(offset),
        ]);
        expect(owner.shell.Undo()).toBe(true);
        original(owner, ignored);
        expect(history.GetTmpEnd()).toBe(0);
        expect(rollback).toHaveBeenLastCalledWith(owner.doc, 0, false);
        expect(owner.shell.Redo()).toBe(true);
        expect(owner.shell.GetActiveParagraph()).toBe(suffix);
        expect(history.GetTmpEnd()).toBe(1);
        expect(rearm).toHaveBeenLastCalledWith(1);
      }
    } finally {
      copy.mockRestore();
      rollback.mockRestore();
      rearm.mockRestore();
    }
  },
);
it("native split history drops absent and excluded zero-end attribute histories", /** Checks native conditional allocation and Count zero discard. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = required(doc.paragraphs[0]);
  node.SetText("abcd");
  const state = createWriterCollapsedCursorState(node, 4, node.GetCharacterItemsAt(4)),
    noHints = new SwUndoSplitNode(node, 4, state, state);
  expect(noHints.GetPayloadSize()).toBe(1);
  node.InsertItem(
    new SwFormatAutoFormat(
      createWriterCharacterItemSet(doc.GetAttrPool(), {
        bold: true,
        italic: false,
        underline: false,
      }),
    ),
    4,
    4,
    SetAttrMode.NOHINTADJUST,
  );
  const copy = vi.spyOn(SwHistory.prototype, "CopyAttr"),
    rollback = vi.spyOn(SwHistory.prototype, "TmpRollback"),
    context: SwUndoRedoContext = {
      GetDoc: /** Returns the actual graph. @returns Graph. */ () => doc,
      RestoreCursor: /** Ignores display projection. @returns Nothing. */ () => undefined,
    };
  try {
    const zero = new SwUndoSplitNode(node, 4, state, state);
    expect((required(copy.mock.contexts[0]) as SwHistory).Count()).toBe(0);
    expect(zero.GetPayloadSize()).toBe(1);
    zero.RedoWithContext(context);
    zero.UndoWithContext(context);
    expect(rollback).not.toHaveBeenCalled();
  } finally {
    copy.mockRestore();
    rollback.mockRestore();
  }
});
it("native split history retains original metadata independently and refreshes native redo state", /** Checks a native constructor snapshot and retained paragraph state without fragment equality. @returns Nothing. */ () => {
  const owner = fixture(),
    state = createWriterCollapsedCursorState(owner.node, 4, owner.node.GetCharacterItemsAt(4)),
    action = new SwUndoSplitNode(owner.node, 4, state, state),
    context: SwUndoRedoContext = {
      GetDoc: /** Returns graph. @returns Graph. */ () => owner.doc,
      RestoreCursor: /** Ignores display state. @returns Nothing. */ () => undefined,
    };
  (owner.hint.format as SwFormatINetFormat).SetName("later-original-mutation");
  action.RedoWithContext(context);
  const suffix = required(owner.doc.paragraphs[1]);
  for (let cycle = 0; cycle < 3; cycle += 1) {
    action.UndoWithContext(context);
    original(owner, 0);
    action.RedoWithContext(context);
    const hint = required(suffix.GetpSwpHints()).Get(0);
    expect((hint.format as SwFormatINetFormat).GetHyperlink().name).toBe("original-name");
    expect(hint.m_pHints).toBe(suffix.GetpSwpHints());
    expect((hint as SwTextINetFormat).GetTextNode()).toBe(suffix);
    expect((hint.format as SwFormatINetFormat).GetTextINetFormat()).toBe(hint);
  }
});
it("native split history restores full-span AUTO after promotion and retains unchanged items on redo", /** Checks original full range restoration after source native hint movement. @returns Nothing. */ () => {
  const owner = fixture(55);
  owner.node.ClearSwpHintsArr(true);
  const hint = owner.node.InsertItem(
    new SwFormatAutoFormat(
      createWriterCharacterItemSet(owner.doc.GetAttrPool(), {
        bold: true,
        italic: true,
        underline: false,
      }),
    ),
    0,
    8,
    SetAttrMode.NOHINTADJUST,
  );
  hint.SetFormatIgnoreStart(true);
  point(owner, 4);
  owner.shell.SplitNode();
  const suffix = owner.shell.GetActiveParagraph();
  expect(owner.node.GetpSwpHints()).toBeUndefined();
  expect(suffix.GetpSwpHints()).toBeUndefined();
  for (let cycle = 0; cycle < 3; cycle += 1) {
    expect(owner.shell.Undo()).toBe(true);
    const restored = required(owner.node.GetpSwpHints()).Get(0);
    expect([restored.start, restored.end, restored.IsFormatIgnoreStart()]).toEqual([0, 8, true]);
    expect(restored).not.toBe(hint);
    expect(owner.shell.Redo()).toBe(true);
    for (const paragraph of [owner.node, suffix]) {
      const retained = required(paragraph.GetpSwpHints());
      expect(retained.Count()).toBe(1);
      expect([retained.Get(0).start, retained.Get(0).end]).toEqual([0, paragraph.Len()]);
      expect(retained.Get(0).format).toBeInstanceOf(SwFormatAutoFormat);
    }
  }
});
it("native split history payload scales with attributes and releases on destruction", /** Checks represented native stored entries independently of text length. @returns Nothing. */ () => {
  const small = fixture(55),
    large = fixture(55, 0, 0, "abcdefgh" + "x".repeat(4000));
  for (const owner of [small, large]) {
    const state = createWriterCollapsedCursorState(
        owner.node,
        4,
        owner.node.GetCharacterItemsAt(4),
      ),
      action = new SwUndoSplitNode(owner.node, 4, state, state);
    expect(action.GetPayloadSize()).toBe(5);
    action.Dispose();
    expect(action.GetPayloadSize()).toBe(1);
  }
  const state = createWriterCollapsedCursorState(small.node, 4, small.node.GetCharacterItemsAt(4));
  small.node.InsertItem(new SwFormatINetFormat("other", ""), 0, 2, SetAttrMode.NOHINTADJUST);
  const two = new SwUndoSplitNode(small.node, 4, state, state);
  expect(two.GetPayloadSize()).toBe(9);
});
it("native table cell Enter restores original ranged history and leaves adjacent cells intact", /** Checks native input/history with actual table section ownership. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    body = required(doc.paragraphs[0]),
    table = doc.nodes.MakeTableNode("SplitTable", {}, body);
  table.AddColumnWidth(3000);
  table.AddColumnWidth(3000);
  const row = doc.nodes.AppendTableRow(table, 2),
    box = required(row.GetTabBoxes()[0]),
    neighbor = required(required(row.GetTabBoxes()[1]).GetParagraphs()[0]),
    node = required(box.GetParagraphs()[0]);
  node.SetText("abcdefgh");
  neighbor.SetText("neighbor");
  node.InsertItem(new SwFormatINetFormat("cell-url", ""), 2, 6, SetAttrMode.NOHINTADJUST);
  const shell = new SwView(
      new SwDocShell(
        doc,
        createDocument({ id: "split-cell", suiteId: "writer", title: "Cell history" }),
      ),
    ).GetWrtShell(),
    edit = new SwEditWin(
      shell.GetView(),
      /** Ignores rendering invalidation. @returns Nothing. */ () => undefined,
    );
  expect(edit.SetSelection({ point: { nodeIndex: node.GetIndex(), contentIndex: 4 } })).toBe(true);
  expect(edit.SplitNode()).toBe(true);
  for (let cycle = 0; cycle < 3; cycle += 1) {
    expect(box.GetParagraphs()).toHaveLength(2);
    expect(shell.Undo()).toBe(true);
    expect(box.GetParagraphs()).toEqual([node]);
    const hint = required(node.GetpSwpHints()).Get(0) as SwTextINetFormat;
    expect([hint.start, hint.end]).toEqual([2, 6]);
    expect(hint.GetTextNode()).toBe(node);
    expect(neighbor.GetText()).toBe("neighbor");
    expect(shell.Redo()).toBe(true);
    expect(neighbor.GetText()).toBe("neighbor");
    expect(doc.paragraphs).toEqual([body]);
  }
});
