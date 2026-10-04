/** @fileoverview Checks typed tab glyphs and their anchored ownership through the actual Writer projection. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SvxTabAdjust, SvxTabStop, SvxTabStopItem } from "../../../editeng/source/items/paraitem";
import { RES_PARATR_TABSTOP } from "../../inc/hintids";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";
import { WriterViewStore } from "./writer-view-projection";

const cases = [
  {
    adjustment: SvxTabAdjust.Left,
    index: 1,
    position: 720,
    delta: 300,
    offset: 0,
    width: 7,
    rectangles: [
      [0, -1, 7, 2],
      [0, -5, 2, 6],
    ],
  },
  {
    adjustment: SvxTabAdjust.Right,
    index: 2,
    position: 1200,
    delta: 274,
    offset: -8,
    width: 9,
    rectangles: [
      [-6, -1, 7, 2],
      [-1, -5, 2, 6],
    ],
  },
  {
    adjustment: SvxTabAdjust.Center,
    index: 3,
    position: 1800,
    delta: 298,
    offset: -3,
    width: 8,
    rectangles: [
      [-3, -1, 8, 2],
      [0, -5, 2, 6],
    ],
  },
  {
    adjustment: SvxTabAdjust.Decimal,
    index: 4,
    position: 2400,
    delta: 321,
    offset: -3,
    width: 8,
    rectangles: [
      [-3, -1, 8, 2],
      [0, -5, 2, 6],
      [3, -4, 2, 2],
    ],
  },
] as const;
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases DOM listeners before their Writer owners. @returns Nothing. */ () => {
    cleanup();
    vi.restoreAllMocks();
    for (const session of sessions.splice(0)) session.Close();
  },
);

/** Mounts all four explicit types after a hidden default in a real Writer session. @returns Editing owners and immutable projection store. */
function fixture() {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const shell = session.view.GetWrtShell();
  shell.Insert("RulerTabGlyphProof");
  shell.SetParagraphItem(
    SvxTabStopItem.FromStops(
      RES_PARATR_TABSTOP,
      [
        new SvxTabStop(360, SvxTabAdjust.Default, ";", "~"),
        ...cases.map(
          /** Builds each distinct explicit fixture. @param item - Typed case. @returns Model tab. */ (
            item,
          ) => new SvxTabStop(item.position, item.adjustment, ",", "_"),
        ),
      ],
      720,
    ),
  );
  const store = new WriterViewStore(session.view);
  render(
    <WriterWorkbench
      fileDialogs={session.fileDialogs}
      isActive
      services={session.services}
      view={session.view}
    />,
  );
  return { session, shell, store };
}

/** Reads SVG rectangle coordinates without inspecting implementation constants. @param owner - Marker or preview. @returns Ordered primitive rectangles. */
function rectangles(owner: Element) {
  return [...owner.querySelectorAll("svg rect")].map(
    /** Reads one rendered rectangle. @param rect - SVG rectangle. @returns Inclusive-source bounds projected as SVG dimensions. */ (
      rect,
    ) =>
      ["x", "y", "width", "height"].map(
        /** Converts one SVG attribute. @param name - Attribute. @returns Numeric value. */ (
          name,
        ) => Number(rect.getAttribute(name)),
      ),
  );
}

/** Reads every stored model field, including hidden stops. @param shell - Writer editing owner. @returns Primitive item. */
function itemValue(shell: ReturnType<typeof fixture>["shell"]) {
  return (shell.GetActiveParagraph().GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem).QueryValue();
}

describe("Writer typed ruler tab markers", /** Groups drawing, projection and accepted gesture checks. @returns Nothing. */ () => {
  for (const item of cases)
    it(`draws and moves adjustment ${item.adjustment} around its stored anchor`, /** Checks native rectangle shapes and raw item ownership through one undo transaction. @returns Nothing. */ function drawsTypedTab() {
      const { session, shell, store } = fixture();
      try {
        const before = itemValue(shell);
        const history = session.docShell.GetUndoManager().GetUndoActionCount();
        const retained = store.GetSnapshot().activeParagraph;
        expect(retained.rulerTabStops?.[item.index - 1]).toEqual({
          index: item.index,
          positionPt: item.position / 20,
          adjustment: item.adjustment,
        });
        expect(Object.isFrozen(retained.rulerTabStops)).toBe(true);
        expect(Object.isFrozen(retained.rulerTabStops?.[item.index - 1])).toBe(true);
        expect(screen.getAllByRole("button", { name: /^Tab stop \d+$/ })).toHaveLength(4);
        const handle = screen.getByRole("button", { name: `Tab stop ${item.index}` });
        expect(rectangles(handle)).toEqual(item.rectangles);
        expect(handle).toHaveStyle({
          left: `${(1800 + item.position) / 15}px`,
          transform: `translateX(${item.offset}px)`,
          width: `${item.width}px`,
        });
        expect(handle.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
        expect(handle.querySelector("svg")).toHaveAttribute("shape-rendering", "crispEdges");
        expect(handle.querySelector("svg")).toHaveStyle({ left: `${-item.offset - 6}px` });
        const move = vi.spyOn(shell, "MoveRulerTabStop");
        fireEvent.pointerDown(handle, { button: 0, pointerId: 7, clientX: 100 });
        fireEvent.pointerMove(window, { pointerId: 7, clientX: 120 });
        expect(itemValue(shell)).toEqual(before);
        expect(rectangles(handle)).toEqual(item.rectangles);
        fireEvent.pointerUp(window, { pointerId: 7, clientX: 120 });
        expect(move).toHaveBeenCalledExactlyOnceWith(item.index, item.delta);
        expect(itemValue(shell)).toEqual({
          ...before,
          stops: before.stops.map(
            /** Changes only the selected stored tab position. @param stop - Previous primitive stop. @param index - Raw index. @returns Expected item field. */ (
              stop,
              index,
            ) => (index === item.index ? { ...stop, position: stop.position + item.delta } : stop),
          ),
        });
        expect(session.docShell.GetUndoManager().GetUndoActionCount()).toBe(history + 1);
        expect(retained.rulerTabStops?.[item.index - 1]).toEqual({
          index: item.index,
          positionPt: item.position / 20,
          adjustment: item.adjustment,
        });
        expect(rectangles(screen.getByRole("button", { name: `Tab stop ${item.index}` }))).toEqual(
          item.rectangles,
        );
        act(
          /** Restores the whole original item. @returns Nothing. */ () => {
            expect(shell.Undo()).toBe(true);
          },
        );
        expect(itemValue(shell)).toEqual(before);
        act(
          /** Reapplies the typed marker transition. @returns Nothing. */ () => {
            expect(shell.Redo()).toBe(true);
          },
        );
        expect(rectangles(screen.getByRole("button", { name: `Tab stop ${item.index}` }))).toEqual(
          item.rectangles,
        );
      } finally {
        store.Close();
      }
    });

  it("shares the fresh Left glyph between cancelled preview and accepted replacement", /** Checks a Right collision changes display only after acceptance and retained DTOs stay immutable. @returns Nothing. */ function previewsFreshLeft() {
    const { session, shell, store } = fixture();
    try {
      const retained = store.GetSnapshot().activeParagraph;
      const before = itemValue(shell);
      const history = session.docShell.GetUndoManager().GetUndoActionCount();
      const surface = screen.getByRole("toolbar", { name: "Writer horizontal ruler" })
        .firstElementChild as HTMLElement;
      const right = screen.getByRole("button", { name: "Tab stop 2" });
      expect(rectangles(right)).toEqual(cases[1].rectangles);
      fireEvent.pointerDown(surface, { button: 0, pointerId: 7, clientX: 200 });
      const preview = document.querySelector('[data-ruler-new-tab="true"]') as HTMLElement;
      expect(rectangles(preview)).toEqual(cases[0].rectangles);
      expect(preview).toHaveStyle({ left: "200px" });
      expect(itemValue(shell)).toEqual(before);
      fireEvent.keyDown(window, { key: "Escape" });
      fireEvent.pointerUp(window, { pointerId: 7, clientX: 200 });
      expect(document.querySelector('[data-ruler-new-tab="true"]')).toBeNull();
      expect(rectangles(right)).toEqual(cases[1].rectangles);
      expect(session.docShell.GetUndoManager().GetUndoActionCount()).toBe(history);
      fireEvent.pointerDown(surface, { button: 0, pointerId: 7, clientX: 200 });
      fireEvent.keyDown(window, { key: "Enter" });
      fireEvent.pointerUp(window, { pointerId: 7, clientX: 200 });
      const accepted = screen.getByRole("button", { name: "Tab stop 2" });
      expect(rectangles(accepted)).toEqual(cases[0].rectangles);
      expect(accepted).toHaveStyle({ left: "200px", transform: "translateX(0px)", width: "7px" });
      expect(store.GetSnapshot().activeParagraph.rulerTabStops?.[1]?.adjustment).toBe(
        SvxTabAdjust.Left,
      );
      expect(retained.rulerTabStops?.[1]?.adjustment).toBe(SvxTabAdjust.Right);
      expect(session.docShell.GetUndoManager().GetUndoActionCount()).toBe(history + 1);
      act(
        /** Restores the Right glyph and its exact original metadata. @returns Nothing. */ () => {
          expect(shell.Undo()).toBe(true);
        },
      );
      expect(itemValue(shell)).toEqual(before);
      expect(rectangles(screen.getByRole("button", { name: "Tab stop 2" }))).toEqual(
        cases[1].rectangles,
      );
      act(
        /** Reprojects the fresh Left type on redo. @returns Nothing. */ () => {
          expect(shell.Redo()).toBe(true);
        },
      );
      expect(rectangles(screen.getByRole("button", { name: "Tab stop 2" }))).toEqual(
        cases[0].rectangles,
      );
    } finally {
      store.Close();
    }
  });
});
