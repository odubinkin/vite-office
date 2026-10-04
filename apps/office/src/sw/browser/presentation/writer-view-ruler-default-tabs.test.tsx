/** @fileoverview Checks Writer tab-state preparation and noninteractive native default grids through owned model/DOM inputs. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SvxTextLeftMarginItem, SvxRightMarginItem } from "../../../editeng/source/items/frmitems";
import { SvxTabAdjust, SvxTabStop, SvxTabStopItem } from "../../../editeng/source/items/paraitem";
import { RES_MARGIN_TEXTLEFT, RES_MARGIN_RIGHT, RES_PARATR_TABSTOP } from "../../inc/hintids";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterRulers } from "./WriterRulers";
import { WriterWorkbench } from "./writer-view";
import { WriterViewStore } from "./writer-view-projection";

const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
const stores: WriterViewStore[] = [];
afterEach(
  /** Releases subscribers and restores owned default-read instrumentation. @returns Nothing. */ () => {
    cleanup();
    for (const store of stores.splice(0)) store.Close();
    for (const session of sessions.splice(0)) session.Close();
    vi.restoreAllMocks();
  },
);

/** Native-domain fixture inputs, independent of upstream files. */
interface Options {
  readonly stops?: readonly SvxTabStop[];
  readonly distance?: number;
  readonly left?: number;
  readonly right?: number;
  readonly relative?: boolean;
  readonly documentDefaults?: readonly SvxTabStop[];
}

/** Builds a real editing owner and frozen projection with supplied item/settings boundaries. @param options - Owned model inputs. @returns Writer fixture. */
function fixture(options: Options = {}) {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const shell = session.view.GetWrtShell();
  const document = session.docShell.GetDoc();
  shell.Insert("DefaultRulerProof");
  if (options.stops !== undefined)
    shell.SetParagraphItem(
      SvxTabStopItem.FromStops(RES_PARATR_TABSTOP, options.stops, options.distance ?? 0),
    );
  shell.SetParagraphItem(new SvxTextLeftMarginItem(options.left ?? 0, RES_MARGIN_TEXTLEFT));
  shell.SetParagraphItem(new SvxRightMarginItem(options.right ?? 0, RES_MARGIN_RIGHT));
  document.GetDocumentSettingManager().set("TABS_RELATIVE_TO_INDENT", options.relative ?? true);
  if (options.documentDefaults !== undefined) {
    const pool = document.GetAttrPool();
    const original = pool.GetUserOrPoolDefaultItem.bind(pool);
    const tabs = SvxTabStopItem.FromStops(RES_PARATR_TABSTOP, options.documentDefaults);
    vi.spyOn(pool, "GetUserOrPoolDefaultItem").mockImplementation(
      /** Supplies only the owned document-default boundary. @param which - Requested item. @returns Existing non-tab default or fixture tabs. */ (
        which,
      ) => (which === RES_PARATR_TABSTOP ? tabs : original(which)),
    );
  }
  const store = new WriterViewStore(session.view);
  stores.push(store);
  return { session, shell, store };
}

/** Mounts the actual ruler from the actual frozen model snapshot. @param owner - Writer fixture. @returns DOM and add callback. */
function mount(owner: ReturnType<typeof fixture>) {
  const snapshot = owner.store.GetSnapshot();
  const add = vi.fn(
    /** Executes the existing accepted insertion command. @param position - Relative twip offset. @returns Whether changed. */ (
      position: number,
    ) => owner.shell.AddRulerTabStop(position),
  );
  const rendered = render(
    <WriterRulers
      horizontalVisible
      onPageChange={vi.fn()}
      onParagraphIndentChange={vi.fn()}
      onTabStopAdd={add}
      page={snapshot.pageDescriptor}
      paragraph={snapshot.activeParagraph}
    />,
  );
  return { ...rendered, add };
}

/** Reads the displayed logical grid without recomputing the algorithm. @param container - Rendered ruler. @returns Ordered offsets. */
function positions(container: HTMLElement) {
  return [...container.querySelectorAll("[data-ruler-default-tab]")].map(
    /** Reads one marker's logical identity. @param marker - Default glyph owner. @returns Twip offset. */ (
      marker,
    ) => Number(marker.getAttribute("data-ruler-default-tab")),
  );
}

/** Reads the complete underlying stored item. @param shell - Editing owner. @returns Primitive fields. */
function itemValue(shell: ReturnType<typeof fixture>["shell"]) {
  return (shell.GetActiveParagraph().GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem).QueryValue();
}

describe("Writer default ruler tab composition", /** Groups normalization, native grid arithmetic and real transaction checks. @returns Nothing. */ () => {
  it("ignores stored Default positions and draws the document grid without hit targets or mutation", /** Checks Writer preparation plus DPI1 Default rectangles and immutable settings. @returns Nothing. */ function drawsDefaultGrid() {
    const owner = fixture({ stops: [new SvxTabStop(500, SvxTabAdjust.Default, ";", "~")] });
    const before = itemValue(owner.shell);
    const history = owner.session.docShell.GetUndoManager().GetUndoActionCount();
    const generation = owner.session.docShell.GetContentGeneration();
    const { container } = mount(owner);
    expect(positions(container)).toEqual([1134, 2268, 3402, 4536, 5670, 6804, 7938]);
    expect(
      [...container.querySelectorAll<HTMLElement>("[data-ruler-default-tab]")].map(
        /** Reads rounded native positions. @param marker - Default owner. @returns Pixel coordinate. */ (
          marker,
        ) => marker.style.left,
      ),
    ).toEqual(["196px", "271px", "347px", "422px", "498px", "574px", "649px"]);
    const marker = container.querySelector("[data-ruler-default-tab]") as HTMLElement;
    expect(marker).toHaveAttribute("aria-hidden", "true");
    expect(marker).toHaveClass("pointer-events-none");
    expect(marker).not.toHaveAttribute("role");
    expect(marker).not.toHaveAttribute("tabindex");
    expect(
      [...marker.querySelectorAll("rect")].map(
        /** Reads normative Default shape dimensions. @param rect - Rendered rectangle. @returns Primitive coordinates. */ (
          rect,
        ) =>
          ["x", "y", "width", "height"].map(
            /** Reads one coordinate. @param name - SVG attribute. @returns Numeric value. */ (
              name,
            ) => Number(rect.getAttribute(name)),
          ),
      ),
    ).toEqual([
      [-2, 0, 5, 1],
      [0, -3, 1, 4],
    ]);
    expect(screen.queryByRole("button", { name: /^Tab stop/ })).toBeNull();
    const settings = owner.store.GetSnapshot().activeParagraph.rulerTabSettings;
    expect(settings).toEqual({ defaultDistance: 1134, relativeToIndent: true });
    expect(Object.isFrozen(settings)).toBe(true);
    expect(itemValue(owner.shell)).toEqual(before);
    expect(owner.session.docShell.GetContentGeneration()).toBe(generation);
    expect(owner.session.docShell.GetUndoManager().GetUndoActionCount()).toBe(history);
  });

  for (const item of [
    { defaults: [], expected: 1134, count: 7 },
    { defaults: [new SvxTabStop(900, SvxTabAdjust.Default)], expected: 900, count: 9 },
    { defaults: [new SvxTabStop(0, SvxTabAdjust.Default)], expected: 1, count: 0 },
  ])
    it(`resolves document default distance ${item.expected}`, /** Checks first-stop, empty fallback and zero-to-one normalization. @returns Nothing. */ function resolvesDefaultDistance() {
      const owner = fixture({ stops: [], documentDefaults: item.defaults });
      const { container } = mount(owner);
      expect(owner.store.GetSnapshot().activeParagraph.rulerTabSettings?.defaultDistance).toBe(
        item.expected,
      );
      expect(positions(container)).toHaveLength(item.count);
    });

  it("strips zero and Default only from ruler inputs while an item spacing override wins", /** Checks raw identity and general paragraph/model fields remain authoritative. @returns Nothing. */ function normalizesRulerInput() {
    const owner = fixture({
      stops: [
        new SvxTabStop(0),
        new SvxTabStop(500, SvxTabAdjust.Default),
        new SvxTabStop(1200, SvxTabAdjust.Right, ",", "_"),
        new SvxTabStop(1800, SvxTabAdjust.Default),
      ],
      distance: 1200,
    });
    const before = itemValue(owner.shell);
    const paragraph = owner.store.GetSnapshot().activeParagraph;
    expect(paragraph.rulerTabStops).toEqual([
      { index: 2, positionPt: 60, adjustment: SvxTabAdjust.Right },
    ]);
    expect(paragraph.computedStyle.tabStopsPt).toEqual([0, 60]);
    const { container } = mount(owner);
    expect(positions(container)).toEqual([2400, 3600, 4800, 6000, 7200, 8400]);
    expect(screen.getAllByRole("button", { name: /^Tab stop/ })).toHaveLength(1);
    expect(itemValue(owner.shell)).toEqual(before);
  });

  it("uses the native preallocated buffer as well as grid phase after a nonmultiple stop", /** Checks native underfill is not replaced by a simpler fill-until-bound loop. @returns Nothing. */ function phasesDefaultGrid() {
    const owner = fixture({ stops: [new SvxTabStop(1700)], distance: 600 });
    expect(positions(mount(owner).container)).toEqual([
      1800, 2400, 3000, 3600, 4200, 4800, 5400, 6000, 6600, 7200, 7800,
    ]);
  });

  it("excludes a generated position at the paragraph right boundary", /** Checks the strict native rounded-pixel stop condition. @returns Nothing. */ function boundsDefaultGrid() {
    const owner = fixture({ stops: [], distance: 1200, right: 3840 });
    expect(positions(mount(owner).container)).toEqual([1200, 2400, 3600]);
  });

  for (const relative of [true, false])
    it(`shares origin setting ${relative} between defaults, explicit markers and accepted insertion`, /** Checks the existing document flag controls all three paths. @returns Nothing. */ function appliesTabOrigin() {
      const owner = fixture({ stops: [new SvxTabStop(1200)], distance: 600, left: 600, relative });
      const { container, add } = mount(owner);
      const handle = screen.getByRole("button", { name: "Tab stop 1" });
      expect(handle).toHaveStyle({ left: relative ? "240px" : "200px" });
      expect((container.querySelector("[data-ruler-default-tab]") as HTMLElement).style.left).toBe(
        relative ? "280px" : "240px",
      );
      const surface = screen.getByRole("toolbar", { name: "Writer horizontal ruler" })
        .firstElementChild as HTMLElement;
      fireEvent.pointerDown(surface, { button: 0, pointerId: 7, clientX: 300 });
      expect(add).not.toHaveBeenCalled();
      fireEvent.keyDown(window, { key: "Enter" });
      fireEvent.pointerUp(window, { pointerId: 7, clientX: 300 });
      expect(add).toHaveBeenCalledExactlyOnceWith(relative ? 2100 : 2700);
    });

  for (const item of [
    { stops: [new SvxTabStop(9000)], distance: 600, left: 0 },
    { stops: [new SvxTabStop(15000)], distance: 600, left: -15000 },
    { stops: [], distance: 7, left: 0 },
    { stops: [], distance: 15, left: -974400 },
    { stops: [], distance: -12000, left: 0 },
  ])
    it(`keeps native empty buffer for last/distance/left ${item.stops.at(-1)?.GetTabPos() ?? 0}/${item.distance}/${item.left}`, /** Checks overflow, subpixel distance, 16-bit wrap and signed spacing without arbitrary caps. @returns Nothing. */ function emptiesDefaultBuffer() {
      expect(positions(mount(fixture(item)).container)).toEqual([]);
    });

  it("uses signed native rounding and remainder with a negative last explicit stop", /** Checks legacy signed input survives and does not shift the logical grid. @returns Nothing. */ function handlesSignedGrid() {
    const owner = fixture({ stops: [new SvxTabStop(-1200, SvxTabAdjust.Right)], distance: 600 });
    const { container } = mount(owner);
    expect(positions(container)).toEqual([
      -600, 0, 600, 1200, 1800, 2400, 3000, 3600, 4200, 4800, 5400, 6000, 6600, 7200, 7800, 8400,
    ]);
    expect((container.querySelector("[data-ruler-default-tab]") as HTMLElement).style.left).toBe(
      "80px",
    );
  });

  it("recomposes defaults only after accepted insertion and restores them through one undo", /** Checks actual Writer preview/cancel/accept/history ownership. @returns Nothing. */ function tracksDefaultReplacement() {
    const owner = fixture();
    const before = itemValue(owner.shell);
    const history = owner.session.docShell.GetUndoManager().GetUndoActionCount();
    const rendered = render(
      <WriterWorkbench
        fileDialogs={owner.session.fileDialogs}
        isActive
        services={owner.session.services}
        view={owner.session.view}
      />,
    );
    const initial = positions(rendered.container);
    const surface = screen.getByRole("toolbar", { name: "Writer horizontal ruler" })
      .firstElementChild as HTMLElement;
    fireEvent.pointerDown(surface, { button: 0, pointerId: 7, clientX: 196 });
    fireEvent.keyDown(window, { key: "Escape" });
    fireEvent.pointerUp(window, { pointerId: 7, clientX: 196 });
    expect(itemValue(owner.shell)).toEqual(before);
    expect(positions(rendered.container)).toEqual(initial);
    expect(owner.session.docShell.GetUndoManager().GetUndoActionCount()).toBe(history);
    fireEvent.pointerDown(surface, { button: 0, pointerId: 7, clientX: 196 });
    fireEvent.keyDown(window, { key: "Enter" });
    fireEvent.pointerUp(window, { pointerId: 7, clientX: 196 });
    expect(positions(rendered.container)).toEqual([2268, 3402, 4536, 5670, 6804, 7938]);
    expect(screen.getByRole("button", { name: "Tab stop 1" })).toHaveStyle({ left: "196px" });
    expect(owner.session.docShell.GetUndoManager().GetUndoActionCount()).toBe(history + 1);
    act(
      /** Restores the whole original item and default grid. @returns Nothing. */ () => {
        expect(owner.shell.Undo()).toBe(true);
      },
    );
    expect(itemValue(owner.shell)).toEqual(before);
    expect(positions(rendered.container)).toEqual(initial);
    act(
      /** Reprojects the accepted explicit tab and remaining defaults. @returns Nothing. */ () => {
        expect(owner.shell.Redo()).toBe(true);
      },
    );
    expect(positions(rendered.container)).toEqual([2268, 3402, 4536, 5670, 6804, 7938]);
  });
});
