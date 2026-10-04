/** @fileoverview Checks rounded paragraph ruler coordinates preserve precise Writer items and history. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  SvxFirstLineIndentItem,
  SvxRightMarginItem,
  SvxTextLeftMarginItem,
} from "../../../editeng/source/items/frmitems";
import { SvxTabAdjust, SvxTabStop, SvxTabStopItem } from "../../../editeng/source/items/paraitem";
import {
  RES_MARGIN_FIRSTLINE,
  RES_MARGIN_RIGHT,
  RES_MARGIN_TEXTLEFT,
  RES_PARATR_TABSTOP,
  RES_UL_SPACE,
} from "../../inc/hintids";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterRulers } from "./WriterRulers";
import { WriterWorkbench } from "./writer-view";
import { WriterViewStore } from "./writer-view-projection";

const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
const stores: WriterViewStore[] = [];
afterEach(
  /** Releases retained DOM tracking before model owners. @returns Nothing. */ () => {
    cleanup();
    for (const store of stores.splice(0)) store.Close();
    for (const session of sessions.splice(0)) session.Close();
    vi.restoreAllMocks();
  },
);

/** Builds actual logical paragraph attributes before creating the immutable store. @param left - Signed text margin. @param firstLine - Signed first-line offset. @param right - Signed right margin. @returns Writer owners. */
function fixture(left = 487, firstLine = 367, right = 6503) {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const shell = session.view.GetWrtShell();
  shell.Insert("RulerIndentPixelsProof");
  shell.SetParagraphItems([
    new SvxTextLeftMarginItem(left, RES_MARGIN_TEXTLEFT),
    new SvxFirstLineIndentItem(firstLine, RES_MARGIN_FIRSTLINE),
    new SvxRightMarginItem(right, RES_MARGIN_RIGHT),
    SvxTabStopItem.FromStops(
      RES_PARATR_TABSTOP,
      [new SvxTabStop(1700, SvxTabAdjust.Right, ",", "_")],
      7,
    ),
  ]);
  const store = new WriterViewStore(session.view);
  stores.push(store);
  return { session, shell, store };
}

/** Reads complete stored indent, spacing and tab values. @param shell - Editing owner. @returns Primitive fields. */
function values(shell: ReturnType<typeof fixture>["shell"]) {
  const node = shell.GetActiveParagraph();
  return {
    left: node.GetAttr(RES_MARGIN_TEXTLEFT).QueryValue(),
    firstLine: node.GetAttr(RES_MARGIN_FIRSTLINE).QueryValue(),
    right: node.GetAttr(RES_MARGIN_RIGHT).QueryValue(),
    spacing: node.GetAttr(RES_UL_SPACE).QueryValue(),
    tabs: node.GetAttr(RES_PARATR_TABSTOP).QueryValue(),
  };
}

/** Reads the three displayed anchors without reimplementing rounding. @returns CSS pixel anchors. */
function anchors() {
  return ["Paragraph left indent", "First line indent", "Paragraph right indent"].map(
    /** Reads one actual marker coordinate. @param name - Accessible marker name. @returns Inline CSS coordinate. */
    (name) => screen.getByRole("button", { name }).style.left,
  );
}

describe("Writer paragraph indent pixel conversion", /** Groups source-domain projection and actual transactions. @returns Nothing. */ () => {
  for (const item of [
    { left: 487, first: 367, right: 6503, pixels: [152, 177, 262] },
    { left: 7, first: 7, right: 7, pixels: [120, 121, 696] },
    { left: -1810, first: -10, right: 10450, pixels: [-1, -1, -1] },
    { left: -1800, first: 0, right: 10440, pixels: [0, 0, 0] },
    { left: -1810, first: 20, right: -10, pixels: [-1, 1, 697] },
    {
      left: 2147483647,
      first: -2147483648,
      right: 2147483647,
      pixels: [143165696, 120, -143164880],
    },
    {
      left: -2147483648,
      first: 2147483647,
      right: -2147483648,
      pixels: [-143165457, 120, 143166273],
    },
  ])
    it(`rounds complete indent tuple ${item.left}/${item.first}/${item.right}`, /** Checks literal native signed coordinates without mutating underlying logical values. @returns Nothing. */ function roundsIndentTuple() {
      const owner = fixture(item.left, item.first, item.right);
      const before = values(owner.shell);
      const history = owner.session.docShell.GetUndoManager().GetUndoActionCount();
      const generation = owner.session.docShell.GetContentGeneration();
      const snapshot = owner.store.GetSnapshot();
      render(
        <WriterRulers
          horizontalVisible
          page={snapshot.pageDescriptor}
          paragraph={snapshot.activeParagraph}
          onPageChange={vi.fn()}
          onParagraphIndentChange={vi.fn()}
        />,
      );
      expect(anchors()).toEqual(
        item.pixels.map(
          /** Converts literal expectations to CSS. @param pixel - Expected integer. @returns CSS position. */ (
            pixel,
          ) => `${pixel}px`,
        ),
      );
      expect(snapshot.activeParagraph.textLeftMargin).toBe(item.left);
      expect(snapshot.activeParagraph.computedStyle.firstLineIndentPt).toBe(item.first / 20);
      expect(snapshot.activeParagraph.computedStyle.rightMarginPt).toBe(item.right / 20);
      expect(Object.isFrozen(snapshot.activeParagraph)).toBe(true);
      expect(Object.isFrozen(snapshot.activeParagraph.computedStyle)).toBe(true);
      expect(values(owner.shell)).toEqual(before);
      expect(owner.session.docShell.GetUndoManager().GetUndoActionCount()).toBe(history);
      expect(owner.session.docShell.GetContentGeneration()).toBe(generation);
    });

  for (const item of [
    {
      edge: "left",
      name: "Paragraph left indent",
      delta: 314,
      field: "left",
      value: 801,
      pixels: [173, 198, 262],
    },
    {
      edge: "firstLine",
      name: "First line indent",
      delta: 279,
      field: "firstLine",
      value: 646,
      pixels: [152, 196, 262],
    },
    {
      edge: "right",
      name: "Paragraph right indent",
      delta: 308,
      field: "right",
      value: 6195,
      pixels: [152, 177, 283],
    },
  ] as const)
    it(`tracks ${item.edge} from the native pixel anchor`, /** Checks actual accepted tuple transition and one Undo while no-motion/cancel preserve precision. @returns Nothing. */ function movesIndentAnchor() {
      const owner = fixture();
      const before = values(owner.shell);
      const history = owner.session.docShell.GetUndoManager().GetUndoActionCount();
      const retained = owner.store.GetSnapshot().activeParagraph;
      render(
        <WriterWorkbench
          fileDialogs={owner.session.fileDialogs}
          isActive
          services={owner.session.services}
          view={owner.session.view}
        />,
      );
      const handle = screen.getByRole("button", { name: item.name });
      const move = vi.spyOn(owner.shell, "AdjustParagraphRulerIndent");
      fireEvent.pointerDown(handle, { button: 0, pointerId: 7, clientX: 100 });
      fireEvent.keyDown(window, { key: "Enter" });
      fireEvent.pointerUp(window, { pointerId: 7, clientX: 100 });
      expect(move).toHaveBeenLastCalledWith(item.edge, 0);
      expect(values(owner.shell)).toEqual(before);
      expect(owner.session.docShell.GetUndoManager().GetUndoActionCount()).toBe(history);
      fireEvent.pointerDown(handle, { button: 0, pointerId: 7, clientX: 100 });
      fireEvent.pointerMove(window, { pointerId: 7, clientX: 120 });
      fireEvent.keyDown(window, { key: "Escape" });
      fireEvent.pointerUp(window, { pointerId: 7, clientX: 120 });
      expect(move).toHaveBeenCalledTimes(1);
      expect(values(owner.shell)).toEqual(before);
      expect(anchors()).toEqual(["152px", "177px", "262px"]);
      fireEvent.pointerDown(handle, { button: 0, pointerId: 7, clientX: 100 });
      fireEvent.pointerMove(window, { pointerId: 7, clientX: 120 });
      expect(values(owner.shell)).toEqual(before);
      fireEvent.pointerUp(window, { pointerId: 7, clientX: 120 });
      expect(move).toHaveBeenLastCalledWith(item.edge, item.delta);
      expect(values(owner.shell)).toEqual({ ...before, [item.field]: item.value });
      expect(anchors()).toEqual(
        item.pixels.map(
          /** Converts literal accepted anchors. @param pixel - Expected integer. @returns CSS position. */ (
            pixel,
          ) => `${pixel}px`,
        ),
      );
      expect(retained.textLeftMargin).toBe(487);
      expect(retained.computedStyle.firstLineIndentPt).toBe(18.35);
      expect(retained.computedStyle.rightMarginPt).toBe(325.15);
      expect(owner.session.docShell.GetUndoManager().GetUndoActionCount()).toBe(history + 1);
      act(
        /** Restores precise full tuple and unrelated attributes. @returns Nothing. */ () => {
          expect(owner.shell.Undo()).toBe(true);
        },
      );
      expect(values(owner.shell)).toEqual(before);
      expect(anchors()).toEqual(["152px", "177px", "262px"]);
      act(
        /** Reprojects the accepted precise tuple. @returns Nothing. */ () => {
          expect(owner.shell.Redo()).toBe(true);
        },
      );
      expect(values(owner.shell)).toEqual({ ...before, [item.field]: item.value });
      expect(anchors()).toEqual(
        item.pixels.map(
          /** Converts literal redo anchors. @param pixel - Expected integer. @returns CSS position. */ (
            pixel,
          ) => `${pixel}px`,
        ),
      );
    });
});
