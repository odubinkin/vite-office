/** @fileoverview Checks raw tab-item identity through immutable ruler projection and Writer undo. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SvxTabAdjust, SvxTabStop, SvxTabStopItem } from "../../../editeng/source/items/paraitem";
import { RES_PARATR_TABSTOP } from "../../inc/hintids";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";
import { WriterViewStore } from "./writer-view-projection";

const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases DOM subscriptions before model owners. @returns Nothing. */ () => {
    cleanup();
    vi.restoreAllMocks();
    for (const session of sessions.splice(0)) session.Close();
  },
);

/** Builds mixed default/explicit tab items in their native sorted order. @param collision - Whether the destination already has an explicit tab. @returns Actual Writer owner. */
function fixture(collision = false) {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const shell = session.view.GetWrtShell();
  shell.Insert("RulerTabIdentityProof");
  shell.SetParagraphItem(
    SvxTabStopItem.FromStops(
      RES_PARATR_TABSTOP,
      [
        new SvxTabStop(500, SvxTabAdjust.Default, ";", "~"),
        new SvxTabStop(900, SvxTabAdjust.Right, ",", "_"),
        ...(collision
          ? [new SvxTabStop(1191, SvxTabAdjust.Center, ":", ".")]
          : [
              new SvxTabStop(1200, SvxTabAdjust.Default, "|", "-"),
              new SvxTabStop(1500, SvxTabAdjust.Decimal, ".", "="),
              new SvxTabStop(1800, SvxTabAdjust.Default, "?", "+"),
            ]),
      ],
      720,
    ),
  );
  return { session, shell };
}

/** Reads every raw item field without filtering defaults. @param shell - Actual editing shell. @returns Primitive item value. */
function itemValue(shell: ReturnType<typeof fixture>["shell"]) {
  return (shell.GetActiveParagraph().GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem).QueryValue();
}

/** Mounts the actual Writer command and DOM projection. @param session - Session owner. @returns Nothing. */
function mount(session: ReturnType<typeof createWriterDocumentSession>) {
  render(
    <WriterWorkbench
      fileDialogs={session.fileDialogs}
      isActive
      services={session.services}
      view={session.view}
    />,
  );
}

/** Delivers one accepted tab gesture using current DOM ownership. @param label - Visible marker label. @param distance - Selected-axis distance. @returns Nothing. */
function drag(label: string, distance: number) {
  const handle = screen.getByRole("button", { name: label });
  fireEvent.pointerDown(handle, { button: 0, pointerId: 7, clientX: 100 });
  fireEvent.pointerMove(window, { pointerId: 7, clientX: 100 + distance });
  fireEvent.pointerUp(window, { pointerId: 7, clientX: 100 + distance });
}

describe("Writer ruler tab item identity", /** Groups raw indices, collisions and immutable snapshots. @returns Nothing. */ () => {
  it("moves the displayed tab rather than the preceding default and retains all other fields", /** Checks the actual compact-marker/raw-item boundary. @returns Nothing. */ function movesRawTab() {
    const { session, shell } = fixture();
    const before = itemValue(shell);
    const history = session.docShell.GetUndoManager().GetUndoActionCount();
    const move = vi.spyOn(shell, "MoveRulerTabStop");
    mount(session);
    expect(screen.getAllByRole("button", { name: /^Tab stop \d+$/ })).toHaveLength(2);
    drag("Tab stop 1", 20);
    expect(move).toHaveBeenCalledExactlyOnceWith(1, 291);
    expect(itemValue(shell)).toEqual({
      ...before,
      stops: before.stops.map(
        /** Changes only the selected model stop. @param stop - Before value. @param index - Raw item index. @returns Expected stop. */
        (stop, index) => (index === 1 ? { ...stop, position: 1191 } : stop),
      ),
    });
    expect(session.docShell.GetUndoManager().GetUndoActionCount()).toBe(history + 1);
    act(
      /** Restores the exact pre-gesture item. @returns Nothing. */ () => {
        expect(shell.Undo()).toBe(true);
      },
    );
    expect(itemValue(shell)).toEqual(before);
    act(
      /** Reapplies the accepted model transition. @returns Nothing. */ () => {
        expect(shell.Redo()).toBe(true);
      },
    );
    expect(
      (shell.GetActiveParagraph().GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem).At(1).GetTabPos(),
    ).toBe(1191);
    expect(screen.getByLabelText("Writer document body")).toHaveTextContent(
      "RulerTabIdentityProof",
    );
  });

  it("reprojects raw indices after crossing defaults and another explicit tab", /** Checks subsequent gestures address the reordered item. @returns Nothing. */ function reordersTabIndices() {
    const { session, shell } = fixture();
    const before = itemValue(shell);
    const move = vi.spyOn(shell, "MoveRulerTabStop");
    mount(session);
    drag("Tab stop 1", 80);
    expect(move).toHaveBeenLastCalledWith(1, 1198);
    const afterFirst = itemValue(shell);
    expect(
      afterFirst.stops.map(
        /** Reads the new sorted item positions. @param stop - Primitive stop. @returns Position. */
        (stop) => stop.position,
      ),
    ).toEqual([500, 1200, 1500, 1800, 2098]);
    drag("Tab stop 1", 20);
    expect(move).toHaveBeenLastCalledWith(2, 314);
    expect(
      itemValue(shell).stops.map(
        /** Reads the second accepted ordering. @param stop - Primitive stop. @returns Position. */
        (stop) => stop.position,
      ),
    ).toEqual([500, 1200, 1800, 1814, 2098]);
    act(
      /** Navigates both independent accepted gestures. @returns Nothing. */ () => {
        expect(shell.Undo()).toBe(true);
      },
    );
    expect(itemValue(shell)).toEqual(afterFirst);
    act(
      /** Restores the original item. @returns Nothing. */ () => {
        expect(shell.Undo()).toBe(true);
      },
    );
    expect(itemValue(shell)).toEqual(before);
  });

  it("replaces a colliding position with the selected tab's complete metadata", /** Checks native remove-then-insert responsibility in the existing shell. @returns Nothing. */ function replacesCollision() {
    const { session, shell } = fixture(true);
    const before = itemValue(shell);
    const history = session.docShell.GetUndoManager().GetUndoActionCount();
    act(
      /** Applies the existing raw-index shell contract. @returns Nothing. */ () => {
        expect(shell.MoveRulerTabStop(1, 291)).toBe(true);
      },
    );
    expect(itemValue(shell)).toEqual({
      defaultDistance: 720,
      stops: [before.stops[0], { ...before.stops[1], position: 1191 }],
    });
    expect(session.docShell.GetUndoManager().GetUndoActionCount()).toBe(history + 1);
    act(
      /** Restores both distinct stops and their original metadata. @returns Nothing. */ () => {
        expect(shell.Undo()).toBe(true);
      },
    );
    expect(itemValue(shell)).toEqual(before);
  });

  it("freezes index-position pairs and leaves retained projections unchanged", /** Checks immutable paired identity without mutable item references. @returns Nothing. */ function projectsTabIdentity() {
    const { session, shell } = fixture();
    const store = new WriterViewStore(session.view);
    try {
      const first = store.GetSnapshot().activeParagraph;
      expect(first.rulerTabStops).toEqual([
        { index: 1, positionPt: 45 },
        { index: 3, positionPt: 75 },
      ]);
      expect(first.computedStyle.tabStopsPt).toEqual([45, 75]);
      expect(Object.isFrozen(first.rulerTabStops)).toBe(true);
      expect(Object.isFrozen(first.rulerTabStops?.[0])).toBe(true);
      shell.MoveRulerTabStop(1, 1198);
      const next = store.GetSnapshot().activeParagraph;
      expect(next.rulerTabStops).toEqual([
        { index: 2, positionPt: 75 },
        { index: 4, positionPt: 104.9 },
      ]);
      expect(first.rulerTabStops).toEqual([
        { index: 1, positionPt: 45 },
        { index: 3, positionPt: 75 },
      ]);
      shell.SetTabStopPositions([]);
      expect(store.GetSnapshot().activeParagraph.rulerTabStops).toBeUndefined();
    } finally {
      store.Close();
    }
  });

  it("cancels a mixed-item tab gesture without touching defaults or history", /** Checks identity preservation through cancellation and late release. @returns Nothing. */ function cancelsMixedTab() {
    const { session, shell } = fixture();
    const before = itemValue(shell);
    const history = session.docShell.GetUndoManager().GetUndoActionCount();
    mount(session);
    const handle = screen.getByRole("button", { name: "Tab stop 2" });
    fireEvent.pointerDown(handle, { button: 0, pointerId: 7, clientX: 100 });
    fireEvent.pointerMove(window, { pointerId: 7, clientX: 120 });
    fireEvent.keyDown(window, { key: "Escape" });
    fireEvent.pointerUp(window, { pointerId: 7, clientX: 120 });
    expect(itemValue(shell)).toEqual(before);
    expect(session.docShell.GetUndoManager().GetUndoActionCount()).toBe(history);
  });
});
