/** @fileoverview Verifies native same-node selected insertion sequence using literal expectations without upstream execution. */
import { describe, expect, it, vi } from "vitest";
import { SetAttrMode } from "../../../inc/swtypes";
import { SwDoc } from "../../core/doc/doc";
import { projectWriterTextRuns } from "../../core/txtnode/ndtxt";
import { SwFormatINetFormat } from "../../core/txtnode/fmtatr2";
import { SwTextINetFormat } from "../../core/txtnode/txtatr2";
import { SwFormatAutoFormat, createWriterCharacterItemSet } from "../../core/txtnode/txatbase";
import { SwDocShell } from "../app/docsh";
import { SwWrtShell } from "./wrtsh1";
import { SfxListUndoAction } from "../../../../svl/source/undo/undo";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import {
  setTestSelection,
  getTestSelection,
  setTestCursor,
} from "../../../../test/wrtsh-test-helpers";

/** Requires an actual owner. @param value - Optional owner. @returns Existing value. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing selected insertion owner");
  return value;
}
/** Creates actual native hint and shell owners. @param family - Which family. @param mask - Expansion flags. @param locked - Expansion lock. @param ignore - Node state. @returns Graph and original owners. */
function fixture(family = 54, mask = 0, locked = false, ignore = false) {
  const doc = new SwDoc(),
    node = required(doc.paragraphs[0]);
  node.SetText("abcdefgh");
  const value =
    family === 54
      ? new SwFormatINetFormat("url", "target")
      : new SwFormatAutoFormat(
          createWriterCharacterItemSet(doc.GetAttrPool(), {
            bold: true,
            italic: false,
            underline: false,
          }),
        );
  if (value instanceof SwFormatINetFormat) value.SetName("name");
  const attr = node.InsertItem(value, 2, 6, SetAttrMode.NOTXTATRCHR | SetAttrMode.NOHINTADJUST);
  attr.SetLockExpandFlag(false);
  attr.dontExpand = Boolean(mask & 1);
  attr.dontExpandStart = Boolean(mask & 2);
  attr.dontMoveAttr = Boolean(mask & 4);
  attr.SetLockExpandFlag(locked);
  attr.SetFormatIgnoreStart(true);
  attr.SetFormatIgnoreEnd(true);
  node.SetIgnoreDontExpand(ignore);
  const item = attr.format,
    map = required(node.GetpSwpHints());
  const docShell = new SwDocShell(
    doc,
    createDocument({ id: "selected-mode", suiteId: "writer", title: "Native selected input" }),
  );
  return { doc, node, attr, item, map, docShell, shell: new SwWrtShell(docShell) };
}
/** Commits one real input path. @param shell - Actual shell. @param operation - Input path. @returns Whether inserted. */
function input(shell: SwWrtShell, operation: string) {
  if (operation === "composition") {
    shell.StartComposition();
    shell.UpdateComposition("XY");
    return shell.EndComposition();
  }
  return operation === "Insert" ? shell.Insert("XY") : shell.Replace("XY");
}
/** Checks rebuilt history ownership and native constructor defaults. @param owner - Actual graph. @returns Restored hint. */
function restored(owner: ReturnType<typeof fixture>) {
  const map = required(owner.node.GetpSwpHints());
  expect(map.Count()).toBe(1);
  const attr = map.Get(0);
  expect([attr.start, attr.end]).toEqual([2, 6]);
  expect(attr).not.toBe(owner.attr);
  expect(attr.format).not.toBe(owner.item);
  expect([
    attr.dontExpand,
    attr.dontExpandStart,
    attr.dontMoveAttr,
    attr.IsLockExpandFlag(),
  ]).toEqual([attr.Which() === 54, attr.Which() === 54, false, attr.Which() === 54]);
  expect([attr.IsFormatIgnoreStart(), attr.IsFormatIgnoreEnd()]).toEqual([true, true]);
  expect(attr.m_pHints).toBe(map);
  expect(map.GetSortedByEnd(0)).toBe(attr);
  expect(map.GetSortedByWhichAndStart(0)).toBe(attr);
  if (attr instanceof SwTextINetFormat) {
    expect(attr.GetTextNode()).toBe(owner.node);
    expect(attr.format.GetTextINetFormat()).toBe(attr);
    expect(attr.format.GetHyperlink()).toMatchObject({
      url: "url",
      targetFrame: "target",
      name: "name",
    });
  } else
    expect((attr.format as SwFormatAutoFormat).GetStyleHandle()).toBe(
      (owner.item as SwFormatAutoFormat).GetStyleHandle(),
    );
  return attr;
}
const ranges = [
  [0, 1, 3, 7],
  [1, 2, 3, 7],
  [2, 4, 4, 6],
  [3, 5, 2, 6],
  [4, 6, 2, 6],
  [6, 8, 2, 8],
  [2, 6, 2, 4],
  [1, 7, -1, -1],
  [0, 8, -1, -1],
] as const;
describe("native same-node selected insertion", /** Registers independent shell contracts. @returns Nothing. */ function cases(): void {
  for (const operation of ["Insert", "Replace", "composition"])
    for (const reverse of [false, true])
      for (const family of [53, 54])
        for (const [start, end, outStart, outEnd] of ranges)
          it.each([0, 1, 2, 3, 4, 5, 6, 7])(
            operation +
              " reverse=" +
              reverse +
              " family=" +
              family +
              " selection=" +
              start +
              ".." +
              end +
              " mask=%s",
            /** Checks native delete-plus-mode5,history and literal ranges. @param mask - Original flags. @returns Nothing. */ function selectedCase(
              mask,
            ): void {
              const owner = fixture(family, mask, Boolean(mask & 1), Boolean(mask & 2));
              const selection = {
                mark: { paragraphId: "p-1", offset: reverse ? end : start },
                point: { paragraphId: "p-1", offset: reverse ? start : end },
              };
              setTestSelection(owner.shell, selection);
              const insert = vi.spyOn(owner.node, "InsertText"),
                erase = vi.spyOn(owner.node, "EraseText"),
                manager = owner.docShell.GetUndoManager();
              const notices: unknown[] = [];
              const unsubscribe = owner.shell.Subscribe(
                /** Records aggregate notification. @param hint - Shell hint. @returns Nothing. */ (
                  hint,
                ) => {
                  notices.push(hint);
                },
              );
              expect(input(owner.shell, operation)).toBe(true);
              expect(owner.node.GetText()).toBe(
                "abcdefgh".slice(0, start) + "XY" + "abcdefgh".slice(end),
              );
              expect(
                insert.mock.calls.map(
                  /** Gets literal mode. @param args - Actual call. @returns Mode. */ (args) =>
                    args[2],
                ),
              ).toEqual([5]);
              expect(erase.mock.calls[0]?.slice(0, 2)).toEqual([start, end - start]);
              expect(notices).toHaveLength(1);
              expect(notices[0]).toMatchObject({ kind: "model-transaction" });
              expect(manager.GetListActionDepth()).toBe(0);
              expect(manager.GetUndoActionCount()).toBe(1);
              expect(manager.GetUndoAction()).toBeInstanceOf(SfxListUndoAction);
              expect((manager.GetUndoAction() as SfxListUndoAction<unknown>).GetActionCount()).toBe(
                2,
              );
              expect(manager.GetUndoAction()?.GetComment()).toBe("Replace");
              expect(manager.GetUndoNodes().Count()).toBe(0);
              expect(getTestSelection(owner.shell)).toEqual({
                point: { paragraphId: "p-1", offset: start + 2 },
              });
              if (outStart >= 0) {
                if (
                  family === 53 &&
                  (start === 3 ||
                    start === 4 ||
                    start === 6 ||
                    (start === 2 && end === 6 && !reverse))
                ) {
                  expect(owner.attr.m_pHints).toBeUndefined();
                  const map = required(owner.node.GetpSwpHints());
                  for (const hint of map.entries()) expect(hint.m_pHints).toBe(map);
                  const bold = projectWriterTextRuns(owner.node).flatMap(
                    /** Expands effective item portions into literal character states. @param run - Real projected portion. @returns Per-character bold flags. */ (
                      run,
                    ) =>
                      Array.from(
                        run.text,
                        /** Copies one effective item value. @returns Bold state. */ () =>
                          run.attributes.bold,
                      ),
                  );
                  const pendingBold = start === 6 ? reverse : true;
                  const expected = [false, false, true, true, true, true, false, false];
                  expected.splice(start, end - start, pendingBold, pendingBold);
                  expect(bold).toEqual(expected);
                } else expect(owner.attr.m_pHints).toBe(owner.node.GetpSwpHints());
                expect([owner.attr.start, owner.attr.end]).toEqual([outStart, outEnd]);
                expect(owner.attr.format).toBe(owner.item);
              } else expect(owner.attr.m_pHints).toBeUndefined();
              expect(owner.node.IsIgnoreDontExpand()).toBe(Boolean(mask & 2));
              expect(owner.shell.Undo()).toBe(true);
              expect(owner.node.GetText()).toBe("abcdefgh");
              expect(getTestSelection(owner.shell)).toEqual(selection);
              const undoHint = restored(owner);
              expect(owner.shell.Redo()).toBe(true);
              expect(owner.node.GetText()).toBe(
                "abcdefgh".slice(0, start) + "XY" + "abcdefgh".slice(end),
              );
              expect(
                insert.mock.calls.map(
                  /** Gets actual history modes. @param args - Call. @returns Mode. */ (args) =>
                    args[2],
                ),
              ).toEqual([5, 2, 5]);
              if (outStart >= 0) expect([undoHint.start, undoHint.end]).toEqual([outStart, outEnd]);
              else expect(undoHint.m_pHints).toBeUndefined();
              expect(owner.shell.Undo()).toBe(true);
              restored(owner);
              expect(manager.GetUndoNodes().Count()).toBe(0);
              unsubscribe();
              insert.mockRestore();
              erase.mockRestore();
            },
          );
  for (const operation of ["Insert", "Replace", "composition"])
    it(
      operation + " treats an empty marked range as mode1 with one list child",
      /** Checks unsuccessful deletion mode and closure. @returns Nothing. */ function emptyCase(): void {
        const owner = fixture();
        setTestSelection(owner.shell, {
          mark: { paragraphId: "p-1", offset: 4 },
          point: { paragraphId: "p-1", offset: 4 },
        });
        const call = vi.spyOn(owner.node, "InsertText");
        expect(input(owner.shell, operation)).toBe(true);
        expect(call.mock.calls[0]?.[2]).toBe(1);
        expect(
          (
            owner.docShell.GetUndoManager().GetUndoAction() as SfxListUndoAction<unknown>
          ).GetActionCount(),
        ).toBe(1);
        expect(owner.shell.Undo()).toBe(true);
        expect(owner.node.GetText()).toBe("abcdefgh");
        call.mockRestore();
      },
    );
  it("keeps preceding and following typing outside the replacement list", /** Checks top-level boundaries and redo truncation. @returns Nothing. */ function surroundingCase(): void {
    const owner = fixture();
    setTestCursor(owner.shell, "p-1", 8);
    owner.shell.Insert("a");
    setTestSelection(owner.shell, {
      mark: { paragraphId: "p-1", offset: 4 },
      point: { paragraphId: "p-1", offset: 6 },
    });
    owner.shell.Insert("XY");
    owner.shell.Insert("b");
    const manager = owner.docShell.GetUndoManager();
    expect(manager.GetUndoActionCount()).toBe(3);
    owner.shell.Undo();
    expect(owner.node.GetText()).toBe("abcdXYgha");
    owner.shell.Undo();
    expect(owner.node.GetText()).toBe("abcdefgha");
    owner.shell.Undo();
    expect(owner.node.GetText()).toBe("abcdefgh");
    owner.shell.Redo();
    owner.shell.Redo();
    owner.shell.Redo();
    expect(owner.node.GetText()).toBe("abcdXYbgha");
    owner.shell.Undo();
    owner.shell.Undo();
    owner.shell.Replace("Q");
    expect(manager.GetRedoActionCount()).toBe(0);
    expect(manager.GetUndoNodes().Count()).toBe(0);
  });
  it("nests the replacement list and disposes history at zero capacity", /** Checks existing compound and bounded history ownership. @returns Nothing. */ function retentionCase(): void {
    const owner = fixture();
    const manager = owner.docShell.GetUndoManager();
    manager.StartUndo("Outer");
    setTestSelection(owner.shell, {
      mark: { paragraphId: "p-1", offset: 4 },
      point: { paragraphId: "p-1", offset: 6 },
    });
    owner.shell.Insert("XY");
    expect(manager.GetListActionDepth()).toBe(1);
    expect(manager.EndUndo()).toBe(1);
    expect(owner.shell.Undo()).toBe(true);
    expect(owner.node.GetText()).toBe("abcdefgh");
    restored(owner);
    manager.SetMaxUndoActionCount(0);
    owner.shell.Replace("Q");
    expect(manager.GetListActionDepth()).toBe(0);
    expect(manager.GetUndoActionCount()).toBe(0);
    expect(manager.GetUndoNodes().Count()).toBe(0);
  });
});
