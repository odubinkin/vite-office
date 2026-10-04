/** @fileoverview Checks fresh ruler tab insertion through Writer items, immutable projection, DOM and undo. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SvxTabAdjust, SvxTabStop, SvxTabStopItem } from "../../../editeng/source/items/paraitem";
import { RES_PARATR_TABSTOP } from "../../inc/hintids";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";
import { WriterViewStore } from "./writer-view-projection";

const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases subscribers before their model owners. @returns Nothing. */ () => {
    cleanup();
    vi.restoreAllMocks();
    for (const session of sessions.splice(0)) session.Close();
  },
);

/** Owns a real Writer session with the supplied stored tab item. @param stops - Raw tab stops. @returns Session and editing shell. */
function fixture(stops: readonly SvxTabStop[]) {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const shell = session.view.GetWrtShell();
  shell.Insert("RulerTabInsertionProof");
  shell.SetParagraphItem(SvxTabStopItem.FromStops(RES_PARATR_TABSTOP, stops, 720));
  return { session, shell };
}

/** Reads all raw fields, including hidden default stops. @param shell - Editing owner. @returns Primitive item. */
function itemValue(shell: ReturnType<typeof fixture>["shell"]) {
  return (shell.GetActiveParagraph().GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem).QueryValue();
}

describe("Writer fresh ruler tab insertion", /** Groups item replacement and browser command ownership. @returns Nothing. */ () => {
  for (const adjustment of [
    SvxTabAdjust.Default,
    SvxTabAdjust.Right,
    SvxTabAdjust.Center,
    SvxTabAdjust.Decimal,
  ])
    it(`replaces an occupied ${adjustment} position with a fresh Left tab`, /** Checks new metadata wins and one undo restores the complete old item. @returns Nothing. */ function replacesOccupiedTab() {
      const { session, shell } = fixture([
        new SvxTabStop(500, SvxTabAdjust.Default, ";", "~"),
        new SvxTabStop(1134, adjustment, ",", "_"),
        new SvxTabStop(1500, SvxTabAdjust.Decimal, ".", "="),
      ]);
      const before = itemValue(shell);
      const history = session.docShell.GetUndoManager().GetUndoActionCount();
      expect(shell.AddRulerTabStop(1134)).toBe(true);
      const after = {
        ...before,
        stops: [
          before.stops[0],
          { position: 1134, adjustment: SvxTabAdjust.Left, decimal: "\0", fill: " " },
          before.stops[2],
        ],
      };
      expect(itemValue(shell)).toEqual(after);
      expect(session.docShell.GetUndoManager().GetUndoActionCount()).toBe(history + 1);
      expect(shell.Undo()).toBe(true);
      expect(itemValue(shell)).toEqual(before);
      expect(shell.Redo()).toBe(true);
      expect(itemValue(shell)).toEqual(after);
    });

  it("preserves legacy positions and unrelated metadata when inserting a valid new stop", /** Checks selected input validation does not revalidate the stored item. @returns Nothing. */ function preservesStoredStops() {
    const { shell } = fixture([
      new SvxTabStop(-360, SvxTabAdjust.Right, ";", "_"),
      new SvxTabStop(0, SvxTabAdjust.Default, ":", "~"),
      new SvxTabStop(40000, SvxTabAdjust.Decimal, ",", "."),
    ]);
    const before = itemValue(shell);
    expect(shell.AddRulerTabStop(1200)).toBe(true);
    expect(itemValue(shell)).toEqual({
      ...before,
      stops: [
        before.stops[0],
        before.stops[1],
        { position: 1200, adjustment: SvxTabAdjust.Left, decimal: "\0", fill: " " },
        before.stops[2],
      ],
    });
    expect(shell.AddRulerTabStop(32767)).toBe(true);
    expect(itemValue(shell).stops[3]).toEqual({
      position: 32767,
      adjustment: SvxTabAdjust.Left,
      decimal: "\0",
      fill: " ",
    });
    expect(itemValue(shell).stops[4]).toEqual(before.stops[2]);
  });

  it("rejects unsupported new positions and treats an identical Left tab as no change", /** Checks invalid input and equal-item history suppression. @returns Nothing. */ function rejectsOrKeepsEqualTab() {
    const { session, shell } = fixture([new SvxTabStop(1200)]);
    const before = itemValue(shell);
    const generation = session.docShell.GetContentGeneration();
    const history = session.docShell.GetUndoManager().GetUndoActionCount();
    for (const position of [NaN, Infinity, -Infinity, 1.5, 0, -1, 32768, 1200])
      expect(shell.AddRulerTabStop(position)).toBe(false);
    expect(itemValue(shell)).toEqual(before);
    expect(session.docShell.GetContentGeneration()).toBe(generation);
    expect(session.docShell.GetUndoManager().GetUndoActionCount()).toBe(history);
  });

  it("keeps the general paragraph list-edit contract distinct from fresh insertion", /** Checks position-list edits still retain matching metadata. @returns Nothing. */ function retainsListEditMetadata() {
    const { shell } = fixture([new SvxTabStop(1200, SvxTabAdjust.Decimal, ",", "_")]);
    const before = itemValue(shell);
    expect(shell.SetTabStopPositions([1200, 1800])).toBe(true);
    expect(itemValue(shell).stops[0]).toEqual(before.stops[0]);
    expect(itemValue(shell).defaultDistance).toBe(720);
    expect(shell.AddRulerTabStop(1200)).toBe(true);
    expect(itemValue(shell).stops[0]).toEqual({
      position: 1200,
      adjustment: SvxTabAdjust.Left,
      decimal: "\0",
      fill: " ",
    });
  });

  it("accepts a hidden-default replacement through the actual DOM and immutable projection", /** Checks preview, cancellation, accepted insertion and undo through real owners. @returns Nothing. */ function acceptsDefaultReplacement() {
    const { session, shell } = fixture([new SvxTabStop(1134, SvxTabAdjust.Default, ",", "_")]);
    const before = itemValue(shell);
    const history = session.docShell.GetUndoManager().GetUndoActionCount();
    const store = new WriterViewStore(session.view);
    try {
      const retained = store.GetSnapshot().activeParagraph;
      expect(retained.rulerTabStops).toBeUndefined();
      render(
        <WriterWorkbench
          fileDialogs={session.fileDialogs}
          isActive
          services={session.services}
          view={session.view}
        />,
      );
      const surface = screen.getByRole("toolbar", { name: "Writer horizontal ruler" })
        .firstElementChild as HTMLElement;
      fireEvent.pointerDown(surface, { button: 0, pointerId: 7, clientX: 195.6 });
      expect(itemValue(shell)).toEqual(before);
      fireEvent.keyDown(window, { key: "Escape" });
      fireEvent.pointerUp(window, { pointerId: 7, clientX: 195.6 });
      expect(itemValue(shell)).toEqual(before);
      expect(session.docShell.GetUndoManager().GetUndoActionCount()).toBe(history);
      fireEvent.pointerDown(surface, { button: 0, pointerId: 7, clientX: 195.6 });
      fireEvent.keyDown(window, { key: "Enter" });
      fireEvent.pointerUp(window, { pointerId: 7, clientX: 195.6 });
      expect(itemValue(shell)).toEqual({
        defaultDistance: 720,
        stops: [{ position: 1134, adjustment: SvxTabAdjust.Left, decimal: "\0", fill: " " }],
      });
      const next = store.GetSnapshot().activeParagraph;
      expect(next.rulerTabStops).toEqual([
        { index: 0, positionPt: 56.7, adjustment: SvxTabAdjust.Left },
      ]);
      expect(Object.isFrozen(next.rulerTabStops)).toBe(true);
      expect(Object.isFrozen(next.rulerTabStops?.[0])).toBe(true);
      expect(retained.rulerTabStops).toBeUndefined();
      expect(screen.getByRole("button", { name: "Tab stop 1" })).toBeVisible();
      expect(session.docShell.GetUndoManager().GetUndoActionCount()).toBe(history + 1);
      act(
        /** Restores the hidden default through the actual editing owner. @returns Nothing. */ () => {
          expect(shell.Undo()).toBe(true);
        },
      );
      expect(itemValue(shell)).toEqual(before);
      expect(screen.queryByRole("button", { name: "Tab stop 1" })).toBeNull();
      act(
        /** Reapplies the fresh explicit tab. @returns Nothing. */ () => {
          expect(shell.Redo()).toBe(true);
        },
      );
      expect(screen.getByRole("button", { name: "Tab stop 1" })).toBeVisible();
      expect(screen.getByLabelText("Writer document body")).toHaveTextContent(
        "RulerTabInsertionProof",
      );
    } finally {
      store.Close();
    }
  });
});
