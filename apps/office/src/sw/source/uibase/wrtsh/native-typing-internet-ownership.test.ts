/** @fileoverview Checks native owned text insertion through real Writer typing,undo and Worker without upstream execution. */
import { SwInsertFlags } from "../../../inc/IDocumentContentOperations";
import { describe, expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwDocShell } from "../app/docsh";
import { SwWrtShell } from "./wrtsh1";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { setTestCursor } from "../../../../test/wrtsh-test-helpers";
import { SwpHints } from "../../core/txtnode/ndhints";
import { SwTextINetFormat } from "../../core/txtnode/txtatr2";
import { SwFormatINetFormat } from "../../core/txtnode/fmtatr2";
import { SwPoolFormatId } from "../../../inc/poolfmt";
import {
  createWriterCharacterItemSet,
  SwFormatAutoFormat,
  SwTextAttrEnd,
} from "../../core/txtnode/txatbase";
import { projectWriterTextRuns } from "../../core/txtnode/ndtxt";
import { SwUndoInsert } from "../../core/undo/unins";
import {
  createOdtWriterTransfer,
  restoreOdtWriterTransfer,
} from "../../../browser/filter/xml/odt-transfer";

/** Requires an actual owner. @param value - Optional owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing typed internet owner");
  return value;
}
/** Creates a real linked shell with native fields and independent flags. @param start - Link start. @param mask - Native flag mask. @param normal - Normal identity. @param visited - Visited identity. @param mutable - Whether this case needs explicitly unlocked flags. @returns Actual document,node,map,item,attribute and shell. */
function fixture(start = 2, mask = 0, normal = 65000, visited = 65535, mutable = false) {
  const doc = new SwDoc(),
    node = required(doc.paragraphs[0]);
  node.SetText("abcdefgh");
  const value = new SwFormatINetFormat("url", "target");
  value.SetName("name");
  value.SetINetFormatAndId("normal", normal as SwPoolFormatId);
  value.SetVisitedFormatAndId("visited", visited as SwPoolFormatId);
  const input = new SwTextINetFormat(value, start, 6);
  // Concrete nesting attributes start locked;unlock only cases that need DontExpand mutation.
  if (mutable) input.SetLockExpandFlag(false);
  input.dontExpand = (mask & 1) !== 0;
  input.dontExpandStart = (mask & 2) !== 0;
  input.dontMoveAttr = (mask & 4) !== 0;
  node.SetTextHints(new SwpHints(doc.GetAttrPool(), [input]));
  const map = required(node.GetpSwpHints()),
    attr = map.Get(0) as SwTextINetFormat,
    item = attr.format;
  const docShell = new SwDocShell(
    doc,
    createDocument({ id: "typing", suiteId: "writer", title: "Typing" }),
  );
  return { doc, node, map, attr, item, docShell, shell: new SwWrtShell(docShell) };
}
/** Creates explicit pending bold items. @param doc - Pool owner. @returns Caller-owned items. */
function bold(doc: SwDoc) {
  return createWriterCharacterItemSet(doc.GetAttrPool(), {
    bold: true,
    italic: false,
    underline: false,
  });
}
/** Asserts the actual canonical internet owner and all seven fields. @param owner - Original owners. @param normal - Expected normal ID. @param visited - Expected visited ID. @returns Nothing. */
function check(owner: ReturnType<typeof fixture>, normal = 65000, visited = 65535): void {
  expect(owner.node.GetpSwpHints()).toBe(owner.map);
  expect(
    owner.map
      .entries()
      .filter(
        /** Selects actual internet attributes. @param hint - Owned attribute. @returns Whether internet. */ (
          hint,
        ) => hint.Which() === 54,
      ),
  ).toEqual([owner.attr]);
  expect(owner.attr.format).toBe(owner.item);
  expect(owner.attr.GetTextNode()).toBe(owner.node);
  expect(owner.item.GetTextINetFormat()).toBe(owner.attr);
  expect(owner.item.GetHyperlink()).toEqual({
    url: "url",
    targetFrame: "target",
    name: "name",
    styleName: "normal",
    visitedStyleName: "visited",
  });
  expect([owner.item.GetINetFormatId(), owner.item.GetVisitedFormatId()]).toEqual([
    normal,
    visited,
  ]);
}

describe.each([0, 1, 2, 3, 4, 5, 6, 7])(
  "owned text insertion flags %s",
  /** Registers native boundary literals. @param mask - Flag mask. @returns Nothing. */ function flagCases(
    mask,
  ): void {
    it.each([
      ["before", 2, 0, 4, 8],
      ["start", 2, 2, 4, 8],
      ["inside", 2, 3, 2, 8],
      ["end", 2, 6, 2, -1],
      ["after", 2, 8, 2, 6],
      ["paragraph start", 0, 0, -1, 8],
    ] as const)(
      "preserves actual internet ownership at %s",
      /** Checks both node explicit items and real collapsed input against literal Update eligibility. @param label - Boundary name. @param start - Initial start. @param offset - Insert point. @param expectedStart - Literal start or flag-dependent marker. @param expectedEnd - Literal end or flag-dependent marker. @returns Nothing. */ function boundaryCase(
        label,
        start,
        offset,
        expectedStart,
        expectedEnd,
      ): void {
        for (const direct of [true, false]) {
          const owner = fixture(start, mask, 65000, 65535, (mask & 1) === 0 || label === "end"),
            items = bold(owner.doc);
          if (direct) owner.node.InsertText("XY", offset, SwInsertFlags.DEFAULT, items);
          else {
            setTestCursor(owner.shell, "p-1", offset);
            owner.shell.SetPendingCharacterItems(items);
            expect(owner.shell.Insert("XY")).toBe(true);
          }
          check(owner);
          expect(owner.node.GetText()).toBe(
            "abcdefgh".slice(0, offset) + "XY" + "abcdefgh".slice(offset),
          );
          expect([owner.attr.start, owner.attr.end]).toEqual([
            expectedStart === -1 ? ((mask & 2) !== 0 ? 2 : 0) : expectedStart,
            expectedEnd === -1 ? ((mask & 1) !== 0 ? 6 : 8) : expectedEnd,
          ]);
          expect(owner.attr.dontExpand).toBe(label === "end" ? false : (mask & 1) !== 0);
          expect(owner.attr.dontExpandStart).toBe((mask & 2) !== 0);
          expect(owner.attr.dontMoveAttr).toBe((mask & 4) !== 0);
          const fragment = owner.node.CaptureTextFragment(offset, offset + 2);
          expect(
            fragment.hints.toTextRuns(fragment.text, owner.node.GetSwAttrSet())[0]?.attributes.bold,
          ).toBe(true);
        }
      },
    );
  },
);

describe("native typed internet item ownership", /** Registers real history and transport contracts. @returns Nothing. */ function integrationCases(): void {
  it.each([
    [0, 0],
    [1030, 1031],
    [65535, 65000],
    [65000, 65535],
  ] as const)(
    "retains identities %s/%s through typing,undo,redo and Worker5",
    /** Checks actual owners and independent transport values. @param normal - Native normal ID. @param visited - Native visited ID. @returns Nothing. */ function historyCase(
      normal,
      visited,
    ): void {
      const owner = fixture(2, 7, normal, visited);
      setTestCursor(owner.shell, "p-1", 3);
      owner.shell.SetPendingCharacterItems(bold(owner.doc));
      owner.shell.Insert("XY");
      check(owner, normal, visited);
      expect(owner.attr.end).toBe(8);
      expect(owner.shell.Undo()).toBe(true);
      check(owner, normal, visited);
      expect(owner.node.GetText()).toBe("abcdefgh");
      expect(owner.attr.end).toBe(6);
      expect(owner.shell.Redo()).toBe(true);
      check(owner, normal, visited);
      expect(owner.node.GetText()).toBe("abcXYdefgh");
      const restored = restoreOdtWriterTransfer(
        structuredClone(createOdtWriterTransfer(owner.doc)),
      );
      const node = required(restored.paragraphs[0]),
        attr = node.GetTextAttrAt(3, 54) as SwTextINetFormat;
      expect(attr).not.toBe(owner.attr);
      expect(attr.format.GetHyperlink()).toEqual(owner.item.GetHyperlink());
      expect([attr.format.GetINetFormatId(), attr.format.GetVisitedFormatId()]).toEqual([
        normal,
        visited,
      ]);
      expect(attr.GetTextNode()).toBe(node);
    },
  );
  it("groups adjacent typing without fragment replacement of the existing internet item", /** Checks text-oriented grouped redo and bounded payload. @returns Nothing. */ function groupingCase(): void {
    const owner = fixture();
    setTestCursor(owner.shell, "p-1", 3);
    owner.shell.SetPendingCharacterItems(bold(owner.doc));
    owner.shell.Insert("X");
    owner.shell.Insert("Y");
    check(owner);
    expect(owner.docShell.GetUndoManager().GetUndoActionCount()).toBe(1);
    expect(owner.shell.Undo()).toBe(true);
    check(owner);
    expect(owner.attr.end).toBe(6);
    expect(owner.shell.Redo()).toBe(true);
    check(owner);
    expect(owner.node.GetText()).toBe("abcXYdefgh");
  });
  it("inherits live native internet values on redo rather than replaying stale DTO fields", /** Checks native InsertText direction after an owned item changes while undone. @returns Nothing. */ function liveItemCase(): void {
    const owner = fixture();
    setTestCursor(owner.shell, "p-1", 3);
    owner.shell.Insert("X");
    owner.shell.Undo();
    owner.item.SetName("new name");
    owner.item.SetINetFormatAndId("new style", 1030 as SwPoolFormatId);
    owner.shell.Redo();
    expect(owner.attr.format).toBe(owner.item);
    expect(owner.item.GetName()).toBe("new name");
    expect(owner.item.GetINetFormat()).toBe("new style");
    expect(owner.item.GetINetFormatId()).toBe(1030);
    const fragment = owner.node.CaptureTextFragment(3, 4),
      inet = fragment.hints
        .entries()
        .find(
          /** Finds the retained native internet item. @param hint - Snapshot attribute. @returns Whether internet. */ (
            hint,
          ) => hint.Which() === 54,
        );
    expect((inet?.format as SwFormatINetFormat).GetINetFormatId()).toBe(1030);
  });
  it("replaces only intersecting automatic portions and keeps unrelated automatic objects", /** Checks overlay clipping,shifting and owned internet preservation. @returns Nothing. */ function overlayCase(): void {
    const owner = fixture(),
      automatic = new SwFormatAutoFormat(bold(owner.doc));
    owner.node.SetTextHints(
      new SwpHints(owner.doc.GetAttrPool(), [
        owner.attr,
        new SwTextAttrEnd(automatic, 0, 1),
        new SwTextAttrEnd(automatic, 7, 8),
      ]),
    );
    const map = required(owner.node.GetpSwpHints());
    const first = map
        .entries()
        .find(
          /** Finds the prefix automatic object. @param hint - Owned hint. @returns Whether prefix. */ (
            hint,
          ) => hint.Which() === 53 && hint.start === 0,
        ),
      last = map
        .entries()
        .find(
          /** Finds the suffix automatic object. @param hint - Owned hint. @returns Whether suffix. */ (
            hint,
          ) => hint.Which() === 53 && hint.start === 7,
        );
    owner.node.InsertText(
      "XY",
      4,
      SwInsertFlags.DEFAULT,
      createWriterCharacterItemSet(owner.doc.GetAttrPool(), {
        bold: false,
        italic: true,
        underline: false,
      }),
    );
    expect(map.entries()).toContain(first);
    expect(map.entries()).toContain(last);
    expect([last?.start, last?.end]).toEqual([9, 10]);
    expect(
      projectWriterTextRuns(owner.node).find(
        /** Finds the inserted segment. @param run - Projected run. @returns Whether inserted. */ (
          run,
        ) => run.text === "XY",
      )?.attributes.italic,
    ).toBe(true);
  });
  it("splits automatic portions while retaining the continuous native internet range", /** Checks before/after direct formatting around an inserted override. @returns Nothing. */ function splitAutomaticCase(): void {
    const owner = fixture();
    owner.node.SetTextHints(
      new SwpHints(owner.doc.GetAttrPool(), [
        owner.attr,
        new SwTextAttrEnd(new SwFormatAutoFormat(bold(owner.doc)), 0, 8),
      ]),
    );
    const inet = owner.node.GetTextAttrAt(3, 54);
    owner.node.InsertText(
      "XY",
      3,
      SwInsertFlags.DEFAULT,
      createWriterCharacterItemSet(owner.doc.GetAttrPool(), {
        bold: false,
        italic: true,
        underline: false,
      }),
    );
    expect(owner.node.GetTextAttrAt(3, 54)).toBe(inet);
    const runs = owner.node.CaptureTextFragment(2, 7);
    expect(
      runs.hints
        .toTextRuns(runs.text, owner.node.GetSwAttrSet())
        .map(
          /** Reads direct formatting around insertion. @param run - Run. @returns Text and format literals. */ (
            run,
          ) => [run.text, run.attributes.bold, run.attributes.italic],
        ),
    ).toEqual([
      ["c", true, false],
      ["XY", false, true],
      ["de", true, false],
    ]);
  });
  it("retains native link ownership through collapsed composition commit", /** Checks the existing IME commit path shares native typing. @returns Nothing. */ function compositionCase(): void {
    const owner = fixture();
    setTestCursor(owner.shell, "p-1", 3);
    owner.shell.StartComposition();
    owner.shell.UpdateComposition("界");
    owner.shell.EndComposition();
    check(owner);
    expect(owner.node.GetText()).toBe("abc界defgh");
    expect(owner.shell.Undo()).toBe(true);
    check(owner);
  });
  it("keeps a zero-length explicit item update inert", /** Checks the source-owned map no-op boundary. @returns Nothing. */ function zeroCase(): void {
    const owner = fixture();
    expect(
      owner.map.insertText(
        8,
        3,
        0,
        { bold: true, italic: false, underline: false },
        owner.node.GetSwAttrSet(),
      ),
    ).toBe(owner.map);
    check(owner);
    expect(owner.attr.end).toBe(6);
  });
  it("retains caller-independent pending items in native text undo", /** Checks the typed action owns a cloned item set. @returns Nothing. */ function pendingItemsCase(): void {
    const owner = fixture(),
      items = bold(owner.doc),
      before = owner.shell.CaptureCursorState();
    const action = new SwUndoInsert(
      owner.node,
      3,
      owner.node.CreateTextFragmentFromText("X", items),
      "word",
      before,
      before,
      items,
    );
    items.ClearItem();
    action.RedoWithContext({
      GetDoc: /** Returns the actual owning graph. @returns Document. */ () => owner.doc,
      RestoreCursor:
        /** Leaves cursor ownership to this direct action test. @returns Nothing. */ () =>
          undefined,
    });
    check(owner);
    expect(
      owner.node.CaptureTextFragment(3, 4).hints.toTextRuns("X", owner.node.GetSwAttrSet())[0]
        ?.attributes.bold,
    ).toBe(true);
  });
  it.each([true, false])(
    "does not group native text and explicit fragment modes %s",
    /** Checks both adapter directions with otherwise equal native fragments. @param firstTyped - First action mode. @returns Nothing. */ function modeCase(
      firstTyped,
    ): void {
      const owner = fixture(),
        items = bold(owner.doc),
        fragment = owner.node.CreateTextFragmentFromText("X", items),
        before = owner.shell.CaptureCursorState();
      const first = new SwUndoInsert(
          owner.node,
          0,
          fragment,
          "word",
          before,
          before,
          firstTyped ? items : undefined,
        ),
        next = new SwUndoInsert(
          owner.node,
          1,
          fragment,
          "word",
          before,
          before,
          firstTyped ? undefined : items,
        );
      expect(first.Merge(next)).toBe(false);
    },
  );
});
