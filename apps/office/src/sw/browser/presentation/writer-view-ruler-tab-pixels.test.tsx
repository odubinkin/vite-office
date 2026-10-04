/** @fileoverview Checks native integer tab anchors without rounding logical Writer items. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SvxTextLeftMarginItem } from "../../../editeng/source/items/frmitems";
import { SvxTabAdjust, SvxTabStop, SvxTabStopItem } from "../../../editeng/source/items/paraitem";
import { RES_MARGIN_TEXTLEFT, RES_PARATR_TABSTOP } from "../../inc/hintids";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterRulers } from "./WriterRulers";
import { WriterWorkbench } from "./writer-view";
import { WriterViewStore } from "./writer-view-projection";

const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
const stores: WriterViewStore[] = [];
afterEach(
  /** Releases DOM tracking before Writer owners. @returns Nothing. */ () => {
    cleanup();
    for (const store of stores.splice(0)) store.Close();
    for (const session of sessions.splice(0)) session.Close();
    vi.restoreAllMocks();
  },
);

/** Creates real logical items with a hidden default and one explicit typed stop. @param position - Signed twip offset. @param adjustment - Tab type. @param left - Text indent. @param relative - Origin setting. @returns Editing and projection owners. */
function fixture(position: number, adjustment = SvxTabAdjust.Right, left = 0, relative = true) {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const shell = session.view.GetWrtShell();
  shell.Insert("RulerTabPixelsProof");
  shell.SetParagraphItem(
    SvxTabStopItem.FromStops(
      RES_PARATR_TABSTOP,
      [
        new SvxTabStop(360, SvxTabAdjust.Default, ";", "~"),
        new SvxTabStop(position, adjustment, ",", "_"),
      ],
      720,
    ),
  );
  shell.SetParagraphItem(new SvxTextLeftMarginItem(left, RES_MARGIN_TEXTLEFT));
  session.docShell.GetDoc().GetDocumentSettingManager().set("TABS_RELATIVE_TO_INDENT", relative);
  const store = new WriterViewStore(session.view);
  stores.push(store);
  return { session, shell, store };
}

/** Reads all stored tab fields, including hidden defaults. @param shell - Editing owner. @returns Item value. */
function value(shell: ReturnType<typeof fixture>["shell"]) {
  return (shell.GetActiveParagraph().GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem).QueryValue();
}

/** Mounts actual immutable projected data without laying out extreme logical offsets. @param owner - Real Writer fixture. @returns Ruler DOM. */
function mount(owner: ReturnType<typeof fixture>) {
  const snapshot = owner.store.GetSnapshot();
  return render(
    <WriterRulers
      horizontalVisible
      page={snapshot.pageDescriptor}
      paragraph={snapshot.activeParagraph}
      onPageChange={vi.fn()}
      onParagraphIndentChange={vi.fn()}
    />,
  );
}

describe("Writer explicit tab pixel conversion", /** Groups complete-origin rounding and logical transaction boundaries. @returns Nothing. */ () => {
  for (const item of [
    { adjustment: SvxTabAdjust.Left, offset: 0, width: 7 },
    { adjustment: SvxTabAdjust.Right, offset: -8, width: 9 },
    { adjustment: SvxTabAdjust.Center, offset: -3, width: 8 },
    { adjustment: SvxTabAdjust.Decimal, offset: -3, width: 8 },
  ])
    it(`anchors type ${item.adjustment} at an integer pixel`, /** Checks glyph and hit box share one rounded complete-origin anchor. @returns Nothing. */ function roundsTypedAnchor() {
      const owner = fixture(1700, item.adjustment);
      const before = value(owner.shell);
      const generation = owner.session.docShell.GetContentGeneration();
      const history = owner.session.docShell.GetUndoManager().GetUndoActionCount();
      const retained = owner.store.GetSnapshot().activeParagraph.rulerTabStops;
      mount(owner);
      const handle = screen.getByRole("button", { name: "Tab stop 1" });
      expect(handle).toHaveStyle({
        left: "233px",
        transform: `translateX(${item.offset}px)`,
        width: `${item.width}px`,
      });
      expect(handle.querySelector("svg")).toHaveStyle({ left: `${-item.offset - 6}px` });
      expect(retained).toEqual([{ index: 1, positionPt: 85, adjustment: item.adjustment }]);
      expect(Object.isFrozen(retained)).toBe(true);
      expect(Object.isFrozen(retained?.[0])).toBe(true);
      expect(value(owner.shell)).toEqual(before);
      expect(owner.session.docShell.GetContentGeneration()).toBe(generation);
      expect(owner.session.docShell.GetUndoManager().GetUndoActionCount()).toBe(history);
    });

  for (const item of [
    { position: 7, left: 7, relative: true, pixel: 121 },
    { position: 7, left: 7, relative: false, pixel: 120 },
    { position: 1700, left: -3510, relative: true, pixel: -1 },
    { position: 1700, left: -3520, relative: true, pixel: -1 },
    { position: 1700, left: -3500, relative: true, pixel: 0 },
    { position: -1700, left: 0, relative: true, pixel: 7 },
    { position: 2147483647, left: 0, relative: true, pixel: 143165696 },
    { position: -2147483648, left: 0, relative: true, pixel: -143165457 },
  ])
    it(`projects signed position/indent/origin ${item.position}/${item.left}/${item.relative}`, /** Checks literal native integer results without rounding item or separate summands. @returns Nothing. */ function roundsCompleteOrigin() {
      const owner = fixture(item.position, SvxTabAdjust.Right, item.left, item.relative);
      const before = value(owner.shell);
      mount(owner);
      expect(screen.getByRole("button", { name: "Tab stop 1" })).toHaveStyle({
        left: `${item.pixel}px`,
      });
      expect(owner.store.GetSnapshot().activeParagraph.rulerTabStops?.[0]?.positionPt).toBe(
        item.position / 20,
      );
      expect(value(owner.shell)).toEqual(before);
    });

  it("retains logical precision through no-motion, cancellation and accepted raw-index movement", /** Checks actual Writer history stays logical while display reprojection uses integer anchors. @returns Nothing. */ function movesRoundedAnchor() {
    const owner = fixture(1700);
    const before = value(owner.shell);
    const history = owner.session.docShell.GetUndoManager().GetUndoActionCount();
    const retained = owner.store.GetSnapshot().activeParagraph.rulerTabStops;
    render(
      <WriterWorkbench
        fileDialogs={owner.session.fileDialogs}
        isActive
        services={owner.session.services}
        view={owner.session.view}
      />,
    );
    const handle = screen.getByRole("button", { name: "Tab stop 1" });
    const move = vi.spyOn(owner.shell, "MoveRulerTabStop");
    fireEvent.pointerDown(handle, { button: 0, pointerId: 7, clientX: 100 });
    fireEvent.keyDown(window, { key: "Enter" });
    fireEvent.pointerUp(window, { pointerId: 7, clientX: 100 });
    expect(move).toHaveBeenLastCalledWith(1, 0);
    expect(value(owner.shell)).toEqual(before);
    expect(owner.session.docShell.GetUndoManager().GetUndoActionCount()).toBe(history);
    fireEvent.pointerDown(handle, { button: 0, pointerId: 7, clientX: 100 });
    fireEvent.pointerMove(window, { pointerId: 7, clientX: 120 });
    fireEvent.keyDown(window, { key: "Escape" });
    fireEvent.pointerUp(window, { pointerId: 7, clientX: 120 });
    expect(move).toHaveBeenCalledTimes(1);
    expect(handle).toHaveStyle({ left: "233px" });
    expect(value(owner.shell)).toEqual(before);
    fireEvent.pointerDown(handle, { button: 0, pointerId: 7, clientX: 100 });
    fireEvent.pointerMove(window, { pointerId: 7, clientX: 120 });
    expect(value(owner.shell)).toEqual(before);
    fireEvent.pointerUp(window, { pointerId: 7, clientX: 120 });
    expect(move).toHaveBeenLastCalledWith(1, 289);
    expect(value(owner.shell)).toEqual({
      ...before,
      stops: [before.stops[0], { ...before.stops[1], position: 1989 }],
    });
    expect(screen.getByRole("button", { name: "Tab stop 1" })).toHaveStyle({ left: "253px" });
    expect(owner.store.GetSnapshot().activeParagraph.rulerTabStops?.[0]?.positionPt).toBe(99.45);
    expect(retained).toEqual([{ index: 1, positionPt: 85, adjustment: SvxTabAdjust.Right }]);
    expect(owner.session.docShell.GetUndoManager().GetUndoActionCount()).toBe(history + 1);
    act(
      /** Restores complete logical item metadata. @returns Nothing. */ () => {
        expect(owner.shell.Undo()).toBe(true);
      },
    );
    expect(value(owner.shell)).toEqual(before);
    expect(screen.getByRole("button", { name: "Tab stop 1" })).toHaveStyle({ left: "233px" });
    act(
      /** Reprojects the accepted logical item. @returns Nothing. */ () => {
        expect(owner.shell.Redo()).toBe(true);
      },
    );
    expect(screen.getByRole("button", { name: "Tab stop 1" })).toHaveStyle({ left: "253px" });
  });
});
