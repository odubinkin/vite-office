/** @fileoverview Checks native old-attribute history and actual delete undo without reading or invoking upstream. */
import { describe, expect, it, vi } from "vitest";
import { SetAttrMode } from "../../../inc/swtypes";
import { SwPoolFormatId } from "../../../inc/poolfmt";
import { SwDoc } from "../doc/doc";
import { SwHistory, SwHistorySetText, HISTORY_HINT } from "./rolbck";
import { SwUndoDelete } from "./undel";
import { SwFormatINetFormat } from "../txtnode/fmtatr2";
import { SwTextINetFormat } from "../txtnode/txtatr2";
import { SwFormatAutoFormat, createWriterCharacterItemSet } from "../txtnode/txatbase";
import { SwDocShell } from "../../uibase/app/docsh";
import { SwWrtShell } from "../../uibase/wrtsh/wrtsh1";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import {
  setTestCursor,
  setTestSelection,
  handleTestInput,
} from "../../../../test/wrtsh-test-helpers";

/** Requires an actual owner. @param value - Optional value. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing delete-history owner");
  return value;
}
/** Creates native owners directly without portable fragment reconstruction. @param family - Native Which. @param mask - Expansion flags. @param ignored - Format-ignore flags. @param locked - Original expansion lock. @returns Actual graph,item,hint and shell. */
function fixture(family = 54, mask = 0, ignored = 0, locked = false) {
  const doc = new SwDoc(),
    node = required(doc.paragraphs[0]);
  node.SetText("abcdefgh");
  let value: SwFormatAutoFormat | SwFormatINetFormat;
  if (family === 54) {
    value = new SwFormatINetFormat("url", "target");
    value.SetName("name");
    value.SetINetFormatAndId("normal", 65000 as SwPoolFormatId);
    value.SetVisitedFormatAndId("visited", 65535 as SwPoolFormatId);
  } else
    value = new SwFormatAutoFormat(
      createWriterCharacterItemSet(doc.GetAttrPool(), {
        bold: true,
        italic: false,
        underline: false,
      }),
    );
  const attr = node.InsertItem(value, 2, 6, SetAttrMode.NOTXTATRCHR | SetAttrMode.NOHINTADJUST);
  attr.SetLockExpandFlag(false);
  attr.dontExpand = Boolean(mask & 1);
  attr.dontExpandStart = Boolean(mask & 2);
  attr.dontMoveAttr = Boolean(mask & 4);
  attr.SetLockExpandFlag(locked);
  attr.SetFormatIgnoreStart(Boolean(ignored & 1));
  attr.SetFormatIgnoreEnd(Boolean(ignored & 2));
  const map = required(node.GetpSwpHints()),
    item = attr.format;
  const docShell = new SwDocShell(
    doc,
    createDocument({ id: "delete-history", suiteId: "writer", title: "Native history" }),
  );
  return { doc, node, map, attr, item, docShell, shell: new SwWrtShell(docShell) };
}
/** Checks reconstructed native defaults,range,metadata and all three actual maps. @param owner - Original graph. @param ignored - Retained format-ignore flags. @returns Fresh restored hint. */
function restored(owner: ReturnType<typeof fixture>, ignored: number) {
  const map = required(owner.node.GetpSwpHints()),
    hint = map.Get(0);
  expect(map.Count()).toBe(1);
  expect(hint).not.toBe(owner.attr);
  expect(hint.format).not.toBe(owner.item);
  expect(map.GetSortedByEnd(0)).toBe(hint);
  expect(map.GetSortedByWhichAndStart(0)).toBe(hint);
  expect(hint.m_pHints).toBe(map);
  expect([hint.start, hint.end]).toEqual([2, 6]);
  expect([
    hint.dontExpand,
    hint.dontExpandStart,
    hint.dontMoveAttr,
    hint.IsLockExpandFlag(),
  ]).toEqual([hint.Which() === 54, hint.Which() === 54, false, hint.Which() === 54]);
  expect([hint.IsFormatIgnoreStart(), hint.IsFormatIgnoreEnd()]).toEqual([
    Boolean(ignored & 1),
    Boolean(ignored & 2),
  ]);
  if (hint instanceof SwTextINetFormat) {
    expect(hint.GetTextNode()).toBe(owner.node);
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
  } else {
    expect(hint.format).toBeInstanceOf(SwFormatAutoFormat);
    expect((hint.format as SwFormatAutoFormat).GetStyleHandle()).toBe(
      (owner.item as SwFormatAutoFormat).GetStyleHandle(),
    );
  }
  return hint;
}
const undoMode = SetAttrMode.NOTXTATRCHR | SetAttrMode.NOHINTADJUST;
const removals = [
  [0, 1],
  [0, 8],
  [2, 4],
  [2, 6],
  [1, 7],
  [3, 5],
  [6, 8],
] as const;
describe("native delete attribute history", /** Registers history and actual shell boundaries. @returns Nothing. */ function cases(): void {
  for (const family of [53, 54])
    for (const locked of [false, true])
      for (const ignored of [0, 1, 2, 3])
        for (const [start, end] of removals)
          it.each([0, 1, 2, 3, 4, 5, 6, 7])(
            "delete family=" +
              family +
              " lock=" +
              locked +
              " ignore=" +
              ignored +
              " range=" +
              start +
              ".." +
              end +
              " mask=%s",
            /** Checks whole original-node attribute history,not clipped deleted fragments. @param mask - Original expansion flags. @returns Nothing. */ function deleteCase(
              mask,
            ): void {
              const owner = fixture(family, mask, ignored, locked);
              setTestSelection(owner.shell, {
                mark: { paragraphId: "p-1", offset: start },
                point: { paragraphId: "p-1", offset: end },
              });
              expect(handleTestInput(owner.shell, "deleteContentBackward", null)).toBe(true);
              expect(owner.node.GetText()).toBe("abcdefgh".slice(0, start) + "abcdefgh".slice(end));
              expect(owner.docShell.GetUndoManager().GetUndoNodes().Count()).toBe(0);
              const call = vi.spyOn(owner.node, "InsertText");
              expect(owner.shell.Undo()).toBe(true);
              expect(owner.node.GetText()).toBe("abcdefgh");
              restored(owner, ignored);
              expect(owner.attr.m_pHints).toBeUndefined();
              expect(call.mock.calls[0]?.[2]).toBe(2);
              expect(owner.shell.GetCursor().HasMark()).toBe(true);
              expect(owner.shell.GetCursor().GetPoint().GetContentIndex()).toBe(end);
              expect(owner.shell.GetCursor().GetMark().GetContentIndex()).toBe(start);
              expect(owner.shell.Redo()).toBe(true);
              expect(owner.node.GetText()).toBe("abcdefgh".slice(0, start) + "abcdefgh".slice(end));
              expect(owner.shell.Undo()).toBe(true);
              restored(owner, ignored);
              expect(
                call.mock.calls.map(
                  /** Reads stored native insertion modes. @param args - Actual call. @returns Mode. */ (
                    args,
                  ) => args[2],
                ),
              ).toEqual([2, 2]);
              call.mockRestore();
            },
          );
  it.each([
    [0, 1, 2, 6, false],
    [0, 2, 2, 6, false],
    [2, 6, 2, 6, true],
    [6, 8, 2, 6, false],
    [0, 8, 2, 2, true],
    [0, 8, 8, 8, false],
    [4, 6, 4, 4, true],
    [4, 6, 6, 6, false],
    [2, 2, 0, 8, true],
    [2, 2, 2, 2, false],
    [1, 2, 7, 8, false],
  ] as const)(
    "copies native overlap %s..%s against %s..%s",
    /** Checks literal half-open boundaries including native zero-range overlap behavior. @param start - Copy start. @param end - Copy end. @param attrStart - Hint start. @param attrEnd - Hint end. @param copied - Literal native result. @returns Nothing. */ function overlapCase(
      start,
      end,
      attrStart,
      attrEnd,
      copied,
    ): void {
      for (const family of [53, 54]) {
        const owner = fixture(family),
          history = new SwHistory();
        owner.attr.SetStart(attrStart);
        owner.attr.SetEnd(attrEnd);
        history.CopyAttr(owner.map, owner.node.GetIndex(), start, end, true);
        expect(history.Count()).toBe(copied ? 1 : 0);
        expect(history.GetTmpEnd()).toBe(copied ? 1 : 0);
      }
    },
  );
  it("retains cloned internet values and coordinates but restores constructor flags", /** Checks independent native payload ownership. @returns Nothing. */ function cloneCase(): void {
    const owner = fixture(54, 7, 3, false),
      history = new SwHistory(),
      original = owner.item as SwFormatINetFormat;
    history.AddTextAttr(owner.attr, owner.node.GetIndex(), false);
    expect(history.at(0)).toBeInstanceOf(SwHistorySetText);
    expect(history.at(0).Which()).toBe(2);
    expect(history.at(0).GetDescription()).toBe("");
    original.SetName("changed");
    original.SetINetFormatAndId("changed style", 1030 as SwPoolFormatId);
    owner.attr.SetStart(1);
    owner.attr.SetEnd(7);
    owner.node.ClearSwpHintsArr(true);
    expect(owner.map.Count()).toBe(0);
    expect(owner.attr.m_pHints).toBeUndefined();
    const call = vi.spyOn(owner.node, "InsertItem");
    expect(history.TmpRollback(owner.doc, 0, false)).toBe(true);
    restored(owner, 3);
    expect(call.mock.calls[0]?.[3]).toBe(12);
    expect(history.Count()).toBe(1);
    expect(history.GetTmpEnd()).toBe(0);
    call.mockRestore();
  });
  it("keeps an automatic shared handle rather than deep-cloning its items", /** Checks native item clone versus handle identity. @returns Nothing. */ function automaticCase(): void {
    const owner = fixture(53, 7, 2),
      history = new SwHistory();
    history.CopyAttr(owner.map, owner.node.GetIndex(), 0, 8, false);
    owner.node.ClearSwpHintsArr(false);
    expect(history.Rollback(owner.doc)).toBe(true);
    restored(owner, 2);
    expect(history.Count()).toBe(0);
    expect(history.GetTmpEnd()).toBe(0);
    expect(history.Rollback(owner.doc)).toBe(false);
  });
  it.each([true, false])(
    "tracks native partial temporary rollback order reverse=%s",
    /** Checks active end differences and retained entries across cycles. @param reverse - Explicit native ordering. @returns Nothing. */ function temporaryCase(
      reverse,
    ): void {
      const owner = fixture(),
        history = new SwHistory();
      owner.node.ClearSwpHintsArr(true);
      for (const start of [0, 2, 4]) {
        const hint = owner.node.InsertItem(
          new SwFormatINetFormat("url" + start, ""),
          start,
          start + 1,
          undoMode,
        );
        history.AddTextAttr(hint, owner.node.GetIndex(), false);
      }
      owner.node.ClearSwpHintsArr(true);
      const call = vi.spyOn(owner.node, "InsertItem");
      expect(history.TmpRollback(owner.doc, 1, reverse)).toBe(true);
      expect(
        call.mock.calls.map(
          /** Reads restored starts. @param args - Actual call. @returns Start. */ (args) =>
            args[1],
        ),
      ).toEqual(reverse ? [4, 2] : [2, 4]);
      expect(history.Count()).toBe(3);
      expect(history.GetTmpEnd()).toBe(1);
      expect(history.TmpRollback(owner.doc, 1)).toBe(false);
      expect(history.TmpRollback(owner.doc, 0)).toBe(true);
      expect(history.GetTmpEnd()).toBe(0);
      expect(history.TmpRollback(owner.doc, 0)).toBe(false);
      owner.node.ClearSwpHintsArr(true);
      expect(history.SetTmpEnd(3)).toBe(0);
      call.mockClear();
      expect(history.TmpRollback(owner.doc, 0)).toBe(true);
      expect(
        call.mock.calls.map(
          /** Reads default reverse order. @param args - Actual call. @returns Start. */ (args) =>
            args[1],
        ),
      ).toEqual([4, 2, 0]);
      expect(history.SetTmpEnd(1)).toBe(0);
      expect(history.GetTmpEnd()).toBe(1);
      call.mockRestore();
    },
  );
  it("rolls back a suffix in reverse and releases exactly that suffix", /** Checks destructive rollback ignores temporary boundary. @returns Nothing. */ function rollbackCase(): void {
    const owner = fixture(),
      history = new SwHistory();
    owner.node.ClearSwpHintsArr(true);
    for (const start of [0, 2, 4]) {
      const hint = owner.node.InsertItem(
        new SwFormatINetFormat("url" + start, ""),
        start,
        start + 1,
        undoMode,
      );
      history.AddTextAttr(hint, owner.node.GetIndex(), false);
    }
    owner.node.ClearSwpHintsArr(true);
    history.SetTmpEnd(0);
    const call = vi.spyOn(owner.node, "InsertItem");
    expect(history.Rollback(owner.doc, 1)).toBe(true);
    expect(
      call.mock.calls.map(
        /** Reads reverse suffix order. @param args - Call. @returns Start. */ (args) => args[1],
      ),
    ).toEqual([4, 2]);
    expect(history.Count()).toBe(1);
    expect(history.GetTmpEnd()).toBe(1);
    expect(history.Rollback(owner.doc, 1)).toBe(true);
    expect(history.Count()).toBe(1);
    owner.node.ClearSwpHintsArr(true);
    expect(history.Rollback(owner.doc)).toBe(true);
    expect(history.Count()).toBe(0);
    call.mockRestore();
  });
  it("restores adjacent automatic portions without merging either ignore boundary", /** Checks NOHINTADJUST preserves separate actual attributes. @returns Nothing. */ function portionsCase(): void {
    const owner = fixture(53),
      history = new SwHistory(),
      item = owner.item;
    owner.node.ClearSwpHintsArr(true);
    const left = owner.node.InsertItem(item, 0, 2, undoMode),
      right = owner.node.InsertItem(item, 2, 4, undoMode);
    left.SetFormatIgnoreEnd(true);
    right.SetFormatIgnoreStart(true);
    history.CopyAttr(owner.node.GetpSwpHints(), owner.node.GetIndex(), 0, 8, true);
    owner.node.ClearSwpHintsArr(true);
    history.TmpRollback(owner.doc, 0, false);
    const map = required(owner.node.GetpSwpHints());
    expect(map.Count()).toBe(2);
    expect(map.Get(0).IsFormatIgnoreEnd()).toBe(true);
    expect(map.Get(1).IsFormatIgnoreStart()).toBe(true);
    expect([map.Get(0).start, map.Get(0).end, map.Get(1).start, map.Get(1).end]).toEqual([
      0, 2, 2, 4,
    ]);
  });
  it.each(["deleteContentBackward", "deleteContentForward"] as const)(
    "keeps original whole history through grouped %s",
    /** Checks actual grouping retains original continuous internet range. @param operation - Native direction. @returns Nothing. */ function groupedCase(
      operation,
    ): void {
      const owner = fixture(54, 7, 3);
      setTestCursor(owner.shell, "p-1", operation === "deleteContentBackward" ? 5 : 3);
      handleTestInput(owner.shell, operation, null);
      handleTestInput(owner.shell, operation, null);
      expect(owner.docShell.GetUndoManager().GetUndoActionCount()).toBe(1);
      expect(owner.node.GetText()).toBe("abcfgh");
      expect(owner.shell.Undo()).toBe(true);
      expect(owner.node.GetText()).toBe("abcdefgh");
      restored(owner, 3);
      expect(owner.shell.Redo()).toBe(true);
      expect(owner.node.GetText()).toBe("abcfgh");
      expect(owner.shell.Undo()).toBe(true);
      restored(owner, 3);
    },
  );
  it("retains interior zero history but excludes zero at the native copy end", /** Checks zero lifetime follows CopyAttr rather than broad snapshots. @returns Nothing. */ function zeroCase(): void {
    const owner = fixture(),
      atEnd = owner.node.InsertItem(new SwFormatINetFormat("end", ""), 8, 8, undoMode);
    owner.attr.SetStart(2);
    owner.attr.SetEnd(2);
    setTestSelection(owner.shell, {
      mark: { paragraphId: "p-1", offset: 1 },
      point: { paragraphId: "p-1", offset: 4 },
    });
    handleTestInput(owner.shell, "deleteContentBackward", null);
    expect(owner.shell.Undo()).toBe(true);
    const map = required(owner.node.GetpSwpHints());
    expect(map.Count()).toBe(1);
    expect([map.Get(0).start, map.Get(0).end]).toEqual([2, 2]);
    expect(atEnd.m_pHints).toBeUndefined();
    expect(owner.node.getHyperlinkAt(3)).toBeUndefined();
  });
  it("reports unimplemented variants and skips non-text target nodes explicitly", /** Checks bounded contracts without certifying missing history families or BuildPortions. @returns Nothing. */ function boundsCase(): void {
    const owner = fixture(),
      history = new SwHistory();
    history.CopyAttr(undefined, owner.node.GetIndex(), 0, 8, true);
    expect(history.Count()).toBe(0);
    expect(history.TmpRollback(owner.doc, 0)).toBe(false);
    expect(
      /** Reads an absent entry. @returns Entry that never exists. */ () => history.at(0),
    ).toThrow("Missing Writer history");
    expect(
      /** Requests an unimplemented history variant. @returns Nothing. */ () =>
        history.AddTextAttr(owner.attr, owner.node.GetIndex(), true),
    ).toThrow("not implemented");
    expect(
      /** Requests ordinary InsertItem without portions port. @returns Attribute that is not implemented. */ () =>
        owner.node.InsertItem(owner.item, 2, 4),
    ).toThrow("NOHINTADJUST");
    expect(
      /** Rejects character items at the native text-item boundary. @returns Nothing. */ () =>
        owner.node.InsertItem(owner.node.GetAttr(15), 2, 4, undoMode),
    ).toThrow("text-attribute item");
    expect(
      /** Attempts duplicate native ownership. @returns Nothing. */ () =>
        owner.map.Insert(owner.attr),
    ).toThrow("already owned");
    const entry = new SwHistorySetText(owner.attr, 0);
    entry.SetInDoc(owner.doc, true);
    expect(owner.map.Get(0)).toBe(owner.attr);
    const empty = required(new SwDoc().paragraphs[0]);
    empty.ClearSwpHintsArr(false);
    expect(empty.GetpSwpHints()).toBeUndefined();
  });
  it("owns only deleted text and history and releases them on action disposal", /** Checks bounded payload and native same-node text ownership. @returns Nothing. */ function disposeCase(): void {
    const owner = fixture(),
      before = owner.shell.CaptureCursorState();
    const action = new SwUndoDelete(owner.node, 3, "de", "delete", undefined, before, before);
    expect(action.GetPayloadSize()).toBe(6);
    expect(owner.docShell.GetUndoManager().GetUndoNodes().Count()).toBe(0);
    action.Dispose();
    expect(action.GetPayloadSize()).toBe(0);
    owner.docShell.GetUndoManager().Clear();
    expect(owner.node.GetText()).toBe("abcdefgh");
  });
  it("uses native discriminants and insertion flag values", /** Checks literal header contracts independent of production branches. @returns Nothing. */ function valuesCase(): void {
    expect([
      HISTORY_HINT.HSTRY_SETFMTHNT,
      HISTORY_HINT.HSTRY_SETTXTHNT,
      HISTORY_HINT.HSTRY_TEXTFIELDMARK,
    ]).toEqual([0, 2, 16]);
    expect([
      SetAttrMode.DEFAULT,
      SetAttrMode.DONTEXPAND,
      SetAttrMode.DONTREPLACE,
      SetAttrMode.NOTXTATRCHR,
      SetAttrMode.NOHINTADJUST,
      SetAttrMode.NOFORMATATTR,
      SetAttrMode.APICALL,
      SetAttrMode.FORCEHINTEXPAND,
      SetAttrMode.IS_COPY,
      SetAttrMode.NOHINTEXPAND,
      SetAttrMode.NO_CURSOR_CHANGE,
      SetAttrMode.REMOVE_ALL_ATTR,
    ]).toEqual([0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024]);
  });
});
