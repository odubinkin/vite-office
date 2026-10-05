/** @fileoverview Checks shell Insert2 policy and stored undo modes with literal native expectations, without upstream execution. */
import { SwInsertFlags } from "../../../inc/IDocumentContentOperations";
import { describe, expect, it, vi } from "vitest";
import { SwPoolFormatId } from "../../../inc/poolfmt";
import { SwDoc } from "../../core/doc/doc";
import { SwpHints } from "../../core/txtnode/ndhints";
import { SwTextINetFormat } from "../../core/txtnode/txtatr2";
import { SwFormatINetFormat } from "../../core/txtnode/fmtatr2";
import { createWriterCharacterItemSet } from "../../core/txtnode/txatbase";
import { SwUndoInsert } from "../../core/undo/unins";
import { createWriterInsertTextAction } from "../../core/edit/editsh";
import { SwDocShell } from "../app/docsh";
import { SwWrtShell } from "./wrtsh1";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { setTestCursor } from "../../../../test/wrtsh-test-helpers";

/** Requires a real owner. @param value - Optional value. @returns Existing owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing shell mode owner");
  return value;
}
/** Creates independent actual internet owners. @param start - Start. @param end - End. @param mask - Hint flags. @param locked - Expansion lock. @param ignore - Old node state. @returns Real graph, hint, item and shell. */
function fixture(start = 2, end = 6, mask = 0, locked = false, ignore = false) {
  const doc = new SwDoc(),
    node = required(doc.paragraphs[0]);
  node.SetText("abcdefgh");
  const value = new SwFormatINetFormat("url", "target");
  value.SetName("name");
  value.SetINetFormatAndId("normal", 65000 as SwPoolFormatId);
  value.SetVisitedFormatAndId("visited", 65535 as SwPoolFormatId);
  const input = new SwTextINetFormat(value, start, end);
  input.SetLockExpandFlag(false);
  input.dontExpand = Boolean(mask & 1);
  input.dontExpandStart = Boolean(mask & 2);
  input.dontMoveAttr = Boolean(mask & 4);
  input.SetLockExpandFlag(locked);
  node.SetTextHints(new SwpHints(doc.GetAttrPool(), [input]));
  node.SetIgnoreDontExpand(ignore);
  const map = required(node.GetpSwpHints()),
    attr = map.Get(0) as SwTextINetFormat,
    item = attr.format;
  const docShell = new SwDocShell(
    doc,
    createDocument({ id: "shell-mode", suiteId: "writer", title: "Insertion modes" }),
  );
  const shell = new SwWrtShell(docShell);
  return { doc, node, map, attr, item, shell, docShell };
}
/** Checks actual ownership and metadata rather than a reconstructed DTO. @param owner - Original graph. @param range - Expected coordinates. @param mask - Expected flags. @param locked - Original lock. @param ignore - Restored old state. @returns Nothing. */
function owned(
  owner: ReturnType<typeof fixture>,
  range: readonly number[],
  mask: number,
  locked: boolean,
  ignore: boolean,
): void {
  expect(owner.node.GetpSwpHints()).toBe(owner.map);
  expect(owner.map.entries()).toContain(owner.attr);
  expect(owner.attr.m_pHints).toBe(owner.map);
  expect(owner.attr.format).toBe(owner.item);
  expect(owner.attr.GetTextNode()).toBe(owner.node);
  expect(owner.item.GetTextINetFormat()).toBe(owner.attr);
  expect([owner.attr.start, owner.attr.end]).toEqual(range);
  expect([
    owner.attr.dontExpand,
    owner.attr.dontExpandStart,
    owner.attr.dontMoveAttr,
    owner.attr.IsLockExpandFlag(),
  ]).toEqual([Boolean(mask & 1), Boolean(mask & 2), Boolean(mask & 4), locked]);
  expect(owner.node.IsIgnoreDontExpand()).toBe(ignore);
  expect(owner.item.GetHyperlink()).toEqual({
    url: "url",
    targetFrame: "target",
    name: "name",
    styleName: "normal",
    visitedStyleName: "visited",
  });
  expect([owner.item.GetINetFormatId(), owner.item.GetVisitedFormatId()]).toEqual([65000, 65535]);
}
/** Creates an independent pending bold item set. @param owner - Pool graph. @returns Caller-owned items. */
function items(owner: ReturnType<typeof fixture>) {
  return createWriterCharacterItemSet(owner.doc.GetAttrPool(), {
    bold: true,
    italic: false,
    underline: false,
  });
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
const expandedEnd = [8, 8, 6, 6, 8, 8, 6, 6] as const;
const stoppedEnd = [6, 6, 6, 6, 8, 8, 6, 6] as const;
const emptyExpanded = [
  [4, 4],
  [2, 4],
  [2, 2],
  [2, 2],
  [4, 4],
  [2, 4],
  [2, 2],
  [2, 2],
] as const;
const erasedEmptyMasks = [0xaa, 0xaa, 0xff, 0xff, 0, 0, 0xff, 0xff] as const;
const emptyStopped = [
  [2, 2],
  [2, 2],
  [2, 2],
  [2, 2],
  [4, 4],
  [2, 4],
  [2, 2],
  [2, 2],
] as const;

describe("native shell insertion modes", /** Registers shell and history contracts. @returns Nothing. */ function cases(): void {
  for (const operation of ["Insert", "Replace", "composition"] as const)
    for (const locked of [false, true])
      for (const ignore of [false, true])
        for (const [name, start, end, offset, outStart, outEnd] of boundaries)
          it.each([0, 1, 2, 3, 4, 5, 6, 7])(
            operation + " lock=" + locked + " oldIgnore=" + ignore + " " + name + " mask=%s",
            /** Checks normal EMPTYEXPAND on all implemented collapsed input paths. @param mask - Native hint flags. @returns Nothing. */ function shellCase(
              mask,
            ): void {
              const owner = fixture(start, end, mask, locked, ignore);
              setTestCursor(owner.shell, "p-1", offset);
              const call = vi.spyOn(owner.node, "InsertText");
              let range: readonly number[] = [outStart, outEnd];
              if (name === "end") range = [2, mask & 1 ? 6 : 8];
              if (name === "paragraph") range = [mask & 2 ? 2 : 0, 8];
              if (name === "empty" || name === "empty-paragraph")
                range = mask & 1 ? [start, start] : [start, start + 2];
              if (operation === "composition") {
                owner.shell.StartComposition();
                owner.shell.UpdateComposition("XY");
                expect(owner.shell.EndComposition()).toBe(true);
              } else expect(owner.shell[operation]("XY")).toBe(true);
              expect(
                call.mock.calls.map(
                  /** Extracts actual insertion mode. @param args - Native call. @returns Mode. */ (
                    args,
                  ) => args[2],
                ),
              ).toEqual([1]);
              const finalMask = name === "end" && !locked && !ignore ? mask & ~1 : mask;
              owned(owner, range, finalMask, locked, ignore);
              expect(owner.node.GetText()).toBe(
                "abcdefgh".slice(0, offset) + "XY" + "abcdefgh".slice(offset),
              );
              expect(owner.shell.GetCursor().GetPoint().GetContentIndex()).toBe(offset + 2);
              expect(owner.docShell.GetUndoManager().GetUndoActionCount()).toBe(1);
              call.mockRestore();
            },
          );
  for (const locked of [false, true])
    for (const ignore of [false, true])
      for (const [name, start, end, offset, outStart, outEnd] of boundaries)
        it.each([0, 1, 2, 3, 4, 5, 6, 7])(
          "forced factory lock=" + locked + " oldIgnore=" + ignore + " " + name + " mask=%s",
          /** Checks FORCE|EMPTY literal expansion and restoration of old node state. @param mask - Flags. @returns Nothing. */ function forcedCase(
            mask,
          ): void {
            const owner = fixture(start, end, mask, locked, ignore),
              pending = items(owner),
              before = owner.shell.CaptureCursorState();
            const action = createWriterInsertTextAction(
              owner.node,
              offset,
              "XY",
              pending,
              undefined,
              before,
              before,
              true,
            );
            const call = vi.spyOn(owner.node, "InsertText");
            action.RedoWithContext({
              GetDoc: /** Returns actual graph. @returns Document. */ () => owner.doc,
              RestoreCursor: /** Does not replace the fixture cursor. @returns Nothing. */ () =>
                undefined,
            });
            let range: readonly number[] = [outStart, outEnd];
            if (name === "end") range = [2, 8];
            if (name === "paragraph") range = [mask & 2 ? 2 : 0, 8];
            if (name === "empty" || name === "empty-paragraph") range = [start, start + 2];
            owned(owner, range, mask, locked, ignore);
            expect(call.mock.calls[0]?.[2]).toBe(5);
            call.mockRestore();
          },
        );
  for (const locked of [false, true])
    for (const ignore of [false, true])
      for (const empty of [false, true])
        for (const mode of [0, 1, 2, 3, 4, 5, 6, 7])
          it.each([0, 1, 2, 3, 4, 5, 6, 7])(
            "stored mode=" +
              mode +
              " empty=" +
              empty +
              " lock=" +
              locked +
              " oldIgnore=" +
              ignore +
              " mask=%s",
            /** Checks first execution, erasure and replay retain the stored mode and native flag consumption. @param mask - Initial flags. @returns Nothing. */ function undoCase(
              mask,
            ): void {
              const owner = fixture(2, empty ? 2 : 6, mask, locked, ignore),
                offset = empty ? 2 : 6,
                pending = items(owner),
                before = owner.shell.CaptureCursorState();
              const action = new SwUndoInsert(
                owner.node,
                offset,
                owner.node.CreateTextFragmentFromText("XY", pending),
                undefined,
                before,
                before,
                mode,
                pending,
              );
              const context = {
                GetDoc: /** Returns graph. @returns Document. */ () => owner.doc,
                RestoreCursor: /** Keeps direct cursor ownership. @returns Nothing. */ () =>
                  undefined,
              };
              const call = vi.spyOn(owner.node, "InsertText");
              action.RedoWithContext(context);
              const firstRange = empty
                ? required((mask & 1 ? emptyStopped : emptyExpanded)[mode])
                : [2, required((mask & 1 ? stoppedEnd : expandedEnd)[mode])];
              const finalMask = !empty && !locked && !ignore && mode < 4 ? mask & ~1 : mask;
              owned(owner, firstRange, finalMask, locked, ignore);
              action.UndoWithContext(context);
              const removed = empty && (required(erasedEmptyMasks[mode]) & (1 << mask)) !== 0;
              if (removed) {
                expect(owner.map.entries()).not.toContain(owner.attr);
                expect(owner.attr.m_pHints).toBeUndefined();
                expect(owner.attr.GetpTextNode()).toBeUndefined();
                expect(owner.node.IsIgnoreDontExpand()).toBe(ignore);
              } else owned(owner, [2, empty ? 2 : 6], finalMask, locked, ignore);
              expect(owner.node.GetText()).toBe("abcdefgh");
              action.RedoWithContext(context);
              const redoRange = empty
                ? firstRange
                : [2, required((finalMask & 1 ? stoppedEnd : expandedEnd)[mode])];
              if (removed) {
                expect(owner.map.entries()).not.toContain(owner.attr);
                expect(owner.attr.m_pHints).toBeUndefined();
                expect(owner.attr.GetpTextNode()).toBeUndefined();
                expect(owner.node.getHyperlinkAt(offset + 1)).toBeUndefined();
                expect(owner.node.IsIgnoreDontExpand()).toBe(ignore);
              } else owned(owner, redoRange, finalMask, locked, ignore);
              expect(
                call.mock.calls.map(
                  /** Reads captured modes. @param args - Actual call. @returns Mode. */ (args) =>
                    args[2],
                ),
              ).toEqual([mode, mode]);
              expect(owner.node.GetText()).toBe(
                "abcdefgh".slice(0, offset) + "XY" + "abcdefgh".slice(offset),
              );
              call.mockRestore();
            },
          );
  it.each([0, 1, 2, 3, 4, 5, 6, 7])(
    "rejects only the current forced candidate mode=%s",
    /** Checks manager-direction grouping barrier without flag equality. @param mode - New candidate flags. @returns Nothing. */ function groupingBarrierCase(
      mode,
    ): void {
      const owner = fixture(),
        pending = items(owner),
        before = owner.shell.CaptureCursorState();
      const first = new SwUndoInsert(
        owner.node,
        3,
        owner.node.CreateTextFragmentFromText("X", pending),
        "word",
        before,
        before,
        SwInsertFlags.FORCEHINTEXPAND | SwInsertFlags.EMPTYEXPAND,
        pending,
      );
      const next = new SwUndoInsert(
        owner.node,
        4,
        owner.node.CreateTextFragmentFromText("Y", pending),
        "word",
        before,
        before,
        mode,
        pending,
      );
      expect(first.Merge(next)).toBe(mode < 4);
    },
  );
  it("groups ordinary input after forced input and redoes with the first mode", /** Checks actual manager direction and retained flags after merged payload. @returns Nothing. */ function groupedHistoryCase(): void {
    const owner = fixture(),
      pending = items(owner),
      before = owner.shell.CaptureCursorState(),
      context = {
        GetDoc: /** Returns document. @returns Graph. */ () => owner.doc,
        RestoreCursor: /** Keeps fixture cursor. @returns Nothing. */ () => undefined,
      };
    const first = createWriterInsertTextAction(
      owner.node,
      3,
      "X",
      pending,
      "word",
      before,
      before,
      true,
    );
    const next = createWriterInsertTextAction(owner.node, 4, "Y", pending, "word", before, before);
    expect(owner.docShell.ApplyUndoAction(first, context, true)).toBe(true);
    expect(owner.docShell.ApplyUndoAction(next, context, true)).toBe(true);
    expect(owner.docShell.GetUndoManager().GetUndoActionCount()).toBe(1);
    first.UndoWithContext(context);
    owned(owner, [2, 6], 0, false, false);
    const call = vi.spyOn(owner.node, "InsertText");
    first.RedoWithContext(context);
    expect(call.mock.calls[0]?.[2]).toBe(5);
    expect(call.mock.calls[0]?.[0]).toBe("XY");
    owned(owner, [2, 8], 0, false, false);
    call.mockRestore();
  });
  it("clones pending items and keeps normal factory defaults on redo", /** Checks caller mutation cannot alter retained payload and stored default. @returns Nothing. */ function pendingCase(): void {
    const owner = fixture(),
      pending = items(owner),
      before = owner.shell.CaptureCursorState(),
      context = {
        GetDoc: /** Returns actual graph. @returns Document. */ () => owner.doc,
        RestoreCursor: /** Keeps direct cursor. @returns Nothing. */ () => undefined,
      };
    const action = createWriterInsertTextAction(
      owner.node,
      3,
      "XY",
      pending,
      undefined,
      before,
      before,
    );
    pending.ClearItem();
    const call = vi.spyOn(owner.node, "InsertText");
    action.RedoWithContext(context);
    expect(
      owner.node.CaptureTextFragment(3, 5).hints.toTextRuns("XY", owner.node.GetSwAttrSet())[0]
        ?.attributes.bold,
    ).toBe(true);
    action.UndoWithContext(context);
    action.RedoWithContext(context);
    expect(
      call.mock.calls.map(
        /** Reads modes. @param args - Captured call. @returns Native mode. */ (args) => args[2],
      ),
    ).toEqual([1, 1]);
    owned(owner, [2, 8], 0, false, false);
    call.mockRestore();
  });
  it("keeps empty shell input inert and collapsed replacements separate", /** Checks no empty action and existing grouping control. @returns Nothing. */ function inertCase(): void {
    const owner = fixture();
    setTestCursor(owner.shell, "p-1", 3);
    expect(owner.shell.Insert("")).toBe(false);
    expect(owner.shell.Replace("")).toBe(false);
    owner.shell.StartComposition();
    expect(owner.shell.EndComposition()).toBe(false);
    expect(owner.docShell.GetUndoManager().GetUndoActionCount()).toBe(0);
    owner.shell.Insert("X");
    owner.shell.Replace("Y");
    expect(owner.docShell.GetUndoManager().GetUndoActionCount()).toBe(2);
    expect(owner.shell.Undo()).toBe(true);
    expect(owner.shell.Undo()).toBe(true);
    owned(owner, [2, 6], 0, false, false);
  });
});
