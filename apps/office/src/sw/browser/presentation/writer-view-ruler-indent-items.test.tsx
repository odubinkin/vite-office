/** @fileoverview Checks paragraph ruler item metadata, direct inheritance and real Writer history. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  SvxFirstLineIndentItem,
  SvxRightMarginItem,
  SvxTextLeftMarginItem,
  SvxULSpaceItem,
} from "../../../editeng/source/items/frmitems";
import { SvxTabAdjust, SvxTabStop, SvxTabStopItem } from "../../../editeng/source/items/paraitem";
import { SwPosition } from "../../source/core/crsr/pam";
import type { SwTextNode } from "../../source/core/txtnode/ndtxt";
import {
  RES_MARGIN_FIRSTLINE,
  RES_MARGIN_RIGHT,
  RES_MARGIN_TEXTLEFT,
  RES_PARATR_TABSTOP,
  RES_UL_SPACE,
} from "../../inc/hintids";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";
import { WriterViewStore } from "./writer-view-projection";

const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
const stores: WriterViewStore[] = [];
afterEach(
  /** Releases presentation subscriptions before model owners. @returns Nothing. */ () => {
    cleanup();
    for (const store of stores.splice(0)) store.Close();
    for (const session of sessions.splice(0)) session.Close();
  },
);

/** Creates direct or fully inherited paragraph items in an actual Writer session. @param automatic - Effective first-line mode. @param inherited - Put attributes in the style only. @returns Model and immutable projection owners. */
function fixture(automatic = true, inherited = false) {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const shell = session.view.GetWrtShell();
  shell.Insert("RulerIndentItemsProof");
  if (!automatic && !inherited) shell.GetActiveParagraph().SetParagraphFirstLineIndent(367);
  const items = [
    new SvxFirstLineIndentItem(367, RES_MARGIN_FIRSTLINE, automatic),
    new SvxTextLeftMarginItem(487, RES_MARGIN_TEXTLEFT),
    new SvxRightMarginItem(6503, RES_MARGIN_RIGHT),
    new SvxULSpaceItem(120, 60, RES_UL_SPACE),
    SvxTabStopItem.FromStops(
      RES_PARATR_TABSTOP,
      [new SvxTabStop(1700, SvxTabAdjust.Right, ",", "_")],
      7,
    ),
  ];
  if (inherited)
    for (const item of items) session.docShell.GetDoc().GetDfltTextFormatColl().SetFormatAttr(item);
  else shell.SetParagraphItems(items);
  const store = new WriterViewStore(session.view);
  stores.push(store);
  return { session, shell, store };
}

/** Reads complete effective and node-direct attribute state. @param node - Canonical paragraph. @returns Primitive values and direct ownership. */
function state(node: SwTextNode) {
  const which = [
    RES_MARGIN_FIRSTLINE,
    RES_MARGIN_TEXTLEFT,
    RES_MARGIN_RIGHT,
    RES_UL_SPACE,
    RES_PARATR_TABSTOP,
  ];
  return {
    effective: which.map(
      /** Reads effective values without losing item flags. @param id - Attribute identity. @returns Complete value. */
      (id) => node.GetAttr(id).QueryValue(),
    ),
    direct: which.map(
      /** Distinguishes direct items from inherited defaults. @param id - Attribute identity. @returns Direct value or absence. */
      (id) => node.GetpSwAttrSet()?.GetItemIfSet(id, false)?.QueryValue() ?? null,
    ),
    defaultTabDistance: (node.GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem).GetDefaultDistance(),
    text: node.GetText(),
  };
}

describe("Writer paragraph ruler item history", /** Groups typed-item transitions and browser gestures. @returns Nothing. */ () => {
  for (const automatic of [false, true])
    for (const inherited of [false, true])
      for (const item of [
        { edge: "left", index: 1, next: 801, delta: 314 },
        { edge: "firstLine", index: 0, next: 646, delta: 279 },
        { edge: "right", index: 2, next: 6195, delta: 308 },
      ] as const)
        it(`preserves ${item.edge} items automatic=${automatic} inherited=${inherited}`, /** Checks precise attributes, no-op ownership and one reversible transaction. @returns Nothing. */ function preservesRulerItems() {
          const owner = fixture(automatic, inherited);
          const node = owner.shell.GetActiveParagraph();
          const before = state(node);
          const history = owner.session.docShell.GetUndoManager().GetUndoActionCount();
          const generation = owner.session.docShell.GetContentGeneration();
          const retained = owner.store.GetSnapshot().activeParagraph;
          render(<WriterWorkbench isActive view={owner.session.view} />);
          expect(owner.shell.AdjustParagraphRulerIndent(item.edge, 0)).toBe(false);
          expect(state(node)).toEqual(before);
          expect(owner.session.docShell.GetUndoManager().GetUndoActionCount()).toBe(history);
          act(
            /** Applies one selected logical margin change through typed items. @returns Nothing. */ () => {
              expect(owner.shell.AdjustParagraphRulerIndent(item.edge, item.delta)).toBe(true);
            },
          );
          const after = state(node);
          const value = item.index === 0 && automatic ? [item.next, 1] : item.next;
          const effective = [...before.effective];
          effective[item.index] = value;
          const direct = [...before.direct];
          direct[item.index] = value;
          expect(after).toEqual({ ...before, effective, direct });
          expect(owner.session.docShell.GetUndoManager().GetUndoActionCount()).toBe(history + 1);
          expect(owner.session.docShell.GetContentGeneration()).toBe(generation + 1);
          expect(owner.store.GetSnapshot().activeParagraph.computedStyle.autoFirstLineIndent).toBe(
            automatic,
          );
          expect(retained.computedStyle.autoFirstLineIndent).toBe(automatic);
          expect(retained.computedStyle.firstLineIndentPt).toBe(18.35);
          expect(retained.textLeftMargin).toBe(487);
          expect(Object.isFrozen(retained.computedStyle)).toBe(true);
          expect(screen.queryByRole("button", { name: "First line indent" }) === null).toBe(
            automatic,
          );
          act(
            /** Restores all values and original direct/inherited state. @returns Nothing. */ () => {
              expect(owner.shell.Undo()).toBe(true);
            },
          );
          expect(state(node)).toEqual(before);
          expect(screen.queryByRole("button", { name: "First line indent" }) === null).toBe(
            automatic,
          );
          act(
            /** Restores the accepted typed item and automatic flag. @returns Nothing. */ () => {
              expect(owner.shell.Redo()).toBe(true);
            },
          );
          expect(state(node)).toEqual(after);
          expect(screen.queryByRole("button", { name: "First line indent" }) === null).toBe(
            automatic,
          );
        });

  it("sets all three margins and restores a fully inherited node in one Undo", /** Checks grouped item history replaces the removed numeric-only action. @returns Nothing. */ function setsCompleteIndentItems() {
    const owner = fixture(true, true);
    const node = owner.shell.GetActiveParagraph();
    const before = state(node);
    expect(node.GetpSwAttrSet()).toBeUndefined();
    const history = owner.session.docShell.GetUndoManager().GetUndoActionCount();
    expect(owner.shell.SetParagraphRulerIndents({ firstLine: -367, left: 700, right: 5000 })).toBe(
      true,
    );
    expect(state(node).effective.slice(0, 3)).toEqual([[-367, 1], 700, 5000]);
    expect(state(node).direct.slice(0, 3)).toEqual([[-367, 1], 700, 5000]);
    expect(state(node).effective.slice(3)).toEqual(before.effective.slice(3));
    const after = state(node);
    expect(owner.session.docShell.GetUndoManager().GetUndoActionCount()).toBe(history + 1);
    expect(owner.shell.Undo()).toBe(true);
    expect(state(node)).toEqual(before);
    expect(node.GetpSwAttrSet()).toBeUndefined();
    expect(owner.shell.Redo()).toBe(true);
    expect(state(node)).toEqual(after);
  });

  it("applies existing range ownership without changing an unselected paragraph", /** Checks selected node item state and cursor history rather than an active-node-only shortcut. @returns Nothing. */ function appliesSelectedIndentItems() {
    const owner = fixture(true, true);
    owner.shell.SplitNode();
    owner.shell.Insert("Second");
    owner.shell.SplitNode();
    owner.shell.Insert("Third");
    const [first, second, third] = owner.session.docShell.GetDoc().paragraphs;
    if (!first || !second || !third) throw new Error("Three-paragraph fixture is missing");
    third.SetAttr(new SvxFirstLineIndentItem(-120, RES_MARGIN_FIRSTLINE));
    owner.shell.SetPaM(new SwPosition(second, 1), new SwPosition(first, 1));
    const before = [first, second, third].map(state);
    const history = owner.session.docShell.GetUndoManager().GetUndoActionCount();
    expect(owner.shell.SetParagraphRulerIndents({ firstLine: 500, left: 700, right: 5000 })).toBe(
      true,
    );
    for (const node of [first, second])
      expect(state(node).effective.slice(0, 3)).toEqual([[500, 1], 700, 5000]);
    expect(state(third)).toEqual(before[2]);
    expect(owner.session.docShell.GetUndoManager().GetUndoActionCount()).toBe(history + 1);
    const after = [first, second, third].map(state);
    expect(owner.shell.SetParagraphRulerIndents({ firstLine: 500, left: 700, right: 5000 })).toBe(
      false,
    );
    expect(owner.shell.Undo()).toBe(true);
    expect([first, second, third].map(state)).toEqual(before);
    expect(owner.shell.GetCursor().GetPoint().GetNode()).toBe(second);
    expect(owner.shell.GetCursor().GetMark().GetNode()).toBe(first);
    expect(owner.shell.Redo()).toBe(true);
    expect([first, second, third].map(state)).toEqual(after);
  });

  it("retains automatic mode through no-motion, cancelled and accepted real ruler gestures", /** Checks browser admission and one history transition keep the hidden first-line state. @returns Nothing. */ function tracksAutomaticIndent() {
    const owner = fixture();
    const node = owner.shell.GetActiveParagraph();
    const before = state(node);
    const history = owner.session.docShell.GetUndoManager().GetUndoActionCount();
    render(<WriterWorkbench isActive view={owner.session.view} />);
    const handle = screen.getByRole("button", { name: "Paragraph left indent" });
    fireEvent.pointerDown(handle, { button: 0, pointerId: 7, clientX: 100 });
    fireEvent.keyDown(window, { key: "Enter" });
    fireEvent.pointerUp(window, { pointerId: 7, clientX: 100 });
    expect(state(node)).toEqual(before);
    fireEvent.pointerDown(handle, { button: 0, pointerId: 7, clientX: 100 });
    fireEvent.pointerMove(window, { pointerId: 7, clientX: 120 });
    fireEvent.keyDown(window, { key: "Escape" });
    fireEvent.pointerUp(window, { pointerId: 7, clientX: 120 });
    expect(state(node)).toEqual(before);
    expect(owner.session.docShell.GetUndoManager().GetUndoActionCount()).toBe(history);
    fireEvent.pointerDown(handle, { button: 0, pointerId: 7, clientX: 100 });
    fireEvent.pointerMove(window, { pointerId: 7, clientX: 120 });
    fireEvent.pointerUp(window, { pointerId: 7, clientX: 120 });
    expect(state(node).effective.slice(0, 3)).toEqual([[367, 1], 801, 6503]);
    expect(screen.queryByRole("button", { name: "First line indent" })).toBeNull();
    expect(owner.session.docShell.GetUndoManager().GetUndoActionCount()).toBe(history + 1);
    act(
      /** Restores complete automatic item state. @returns Nothing. */ () => {
        expect(owner.shell.Undo()).toBe(true);
      },
    );
    expect(state(node)).toEqual(before);
    act(
      /** Restores the accepted margin while keeping automatic mode. @returns Nothing. */ () => {
        expect(owner.shell.Redo()).toBe(true);
      },
    );
    expect(state(node).effective.slice(0, 3)).toEqual([[367, 1], 801, 6503]);
    expect(screen.queryByRole("button", { name: "First line indent" })).toBeNull();
  });
});
