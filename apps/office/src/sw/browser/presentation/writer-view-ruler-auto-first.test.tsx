/** @fileoverview Checks effective automatic first-line ruler visibility and actual Writer history. */
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
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
  /** Releases browser owners before closing the canonical session. @returns Nothing. */ () => {
    cleanup();
    for (const store of stores.splice(0)) store.Close();
    for (const session of sessions.splice(0)) session.Close();
    vi.restoreAllMocks();
  },
);

/** Creates an effective direct or inherited automatic indent in a real document. @param auto - Automatic mode. @param value - Precise first-line offset. @param inherited - Store the first-line item in the paragraph style. @returns Model and projection owners. */
function fixture(auto = false, value = 367, inherited = false) {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const shell = session.view.GetWrtShell();
  shell.Insert("RulerAutoFirstProof");
  shell.SetParagraphItems([
    new SvxTextLeftMarginItem(487, RES_MARGIN_TEXTLEFT),
    new SvxRightMarginItem(6503, RES_MARGIN_RIGHT),
    SvxTabStopItem.FromStops(
      RES_PARATR_TABSTOP,
      [new SvxTabStop(1700, SvxTabAdjust.Right, ",", "_")],
      7,
    ),
  ]);
  const item = new SvxFirstLineIndentItem(value, RES_MARGIN_FIRSTLINE, auto);
  if (inherited) session.docShell.GetDoc().GetDfltTextFormatColl().SetFormatAttr(item);
  else shell.SetParagraphItems([item]);
  const store = new WriterViewStore(session.view);
  stores.push(store);
  return { session, shell, store };
}

/** Reads precise indent, spacing and tab attributes. @param shell - Editing owner. @returns Stored primitive values. */
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

/** Opens the existing paragraph request and toggles its automatic checkbox. @returns Nothing. */
function toggleDialog() {
  fireEvent.click(screen.getByRole("button", { name: "Format" }));
  fireEvent.click(screen.getByRole("menuitem", { name: /Paragraph/ }));
  fireEvent.click(screen.getByLabelText("Automatic first-line indent"));
}

describe("Writer automatic first-line ruler visibility", /** Groups effective item projection and dialog transactions. @returns Nothing. */ () => {
  for (const auto of [false, true])
    for (const value of [0, 367, -367])
      it(`projects automatic ${auto} with precise offset ${value}`, /** Checks source visibility independent of signed offset and rendering ownership. @returns Nothing. */ function projectsAutomaticIndent() {
        const owner = fixture(auto, value);
        const before = values(owner.shell);
        const history = owner.session.docShell.GetUndoManager().GetUndoActionCount();
        const generation = owner.session.docShell.GetContentGeneration();
        const snapshot = owner.store.GetSnapshot();
        const move = vi.fn();
        render(
          <WriterRulers
            horizontalVisible
            page={snapshot.pageDescriptor}
            paragraph={snapshot.activeParagraph}
            onPageChange={vi.fn()}
            onParagraphIndentChange={move}
          />,
        );
        expect(snapshot.activeParagraph.computedStyle.autoFirstLineIndent).toBe(auto);
        expect(snapshot.activeParagraph.computedStyle.firstLineIndentPt).toBe(value / 20);
        expect(Object.isFrozen(snapshot.activeParagraph)).toBe(true);
        expect(Object.isFrozen(snapshot.activeParagraph.computedStyle)).toBe(true);
        const first = screen.queryByRole("button", { name: "First line indent" });
        if (auto) {
          expect(first).toBeNull();
          expect(document.querySelector('[aria-label="First line indent"]')).toBeNull();
        } else expect(first).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Paragraph left indent" }).style.left).toBe(
          "152px",
        );
        expect(screen.getByRole("button", { name: "Paragraph right indent" }).style.left).toBe(
          "262px",
        );
        expect(move).not.toHaveBeenCalled();
        expect(values(owner.shell)).toEqual(before);
        expect(owner.session.docShell.GetUndoManager().GetUndoActionCount()).toBe(history);
        expect(owner.session.docShell.GetContentGeneration()).toBe(generation);
      });

  it("inherits automatic mode and restores it after a direct override Undo", /** Checks effective style lookup and retained immutable snapshots. @returns Nothing. */ function inheritsAutomaticIndent() {
    const owner = fixture(true, -367, true);
    const before = values(owner.shell);
    const retained = owner.store.GetSnapshot().activeParagraph;
    render(<WriterWorkbench isActive view={owner.session.view} />);
    expect(screen.queryByRole("button", { name: "First line indent" })).toBeNull();
    expect(retained.computedStyle.autoFirstLineIndent).toBe(true);
    act(
      /** Applies a manual direct item above the inherited style. @returns Nothing. */ () => {
        owner.shell.SetParagraphItems([new SvxFirstLineIndentItem(-367, RES_MARGIN_FIRSTLINE)]);
      },
    );
    expect(screen.getByRole("button", { name: "First line indent" })).toBeInTheDocument();
    expect(owner.store.GetSnapshot().activeParagraph.computedStyle.autoFirstLineIndent).toBe(false);
    expect(retained.computedStyle.autoFirstLineIndent).toBe(true);
    expect(retained.computedStyle.firstLineIndentPt).toBe(-18.35);
    act(
      /** Restores automatic inherited visibility and exact values. @returns Nothing. */ () => {
        expect(owner.shell.Undo()).toBe(true);
      },
    );
    expect(screen.queryByRole("button", { name: "First line indent" })).toBeNull();
    expect(values(owner.shell)).toEqual(before);
    act(
      /** Restores the manual direct override. @returns Nothing. */ () => {
        expect(owner.shell.Redo()).toBe(true);
      },
    );
    expect(screen.getByRole("button", { name: "First line indent" })).toBeInTheDocument();
  });

  it("keeps old detached DTOs manual when the new flag is omitted", /** Checks absent primitive compatibility without changing the live snapshot. @returns Nothing. */ function admitsDetachedManualIndent() {
    const owner = fixture();
    const snapshot = owner.store.GetSnapshot();
    const computedStyle = { ...snapshot.activeParagraph.computedStyle };
    delete computedStyle.autoFirstLineIndent;
    render(
      <WriterRulers
        horizontalVisible
        page={snapshot.pageDescriptor}
        paragraph={{ ...snapshot.activeParagraph, computedStyle }}
        onPageChange={vi.fn()}
        onParagraphIndentChange={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "First line indent" }).style.left).toBe("177px");
    expect(snapshot.activeParagraph.computedStyle.autoFirstLineIndent).toBe(false);
  });

  it("cancels automatic changes and reprojects accepted mode through one Undo and Redo", /** Checks the actual paragraph dialog owns mode mutation and history. @returns Completion. */ async function togglesAutomaticIndent() {
    const owner = fixture(true);
    const before = values(owner.shell);
    const history = owner.session.docShell.GetUndoManager().GetUndoActionCount();
    const retained = owner.store.GetSnapshot().activeParagraph;
    render(<WriterWorkbench isActive view={owner.session.view} />);
    expect(screen.queryByRole("button", { name: "First line indent" })).toBeNull();
    toggleDialog();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(
      /** Waits for cancellation to release its request. @returns Nothing. */ () =>
        expect(screen.queryByRole("dialog", { name: "Paragraph" })).toBeNull(),
    );
    expect(values(owner.shell)).toEqual(before);
    expect(owner.session.docShell.GetUndoManager().GetUndoActionCount()).toBe(history);
    expect(screen.queryByRole("button", { name: "First line indent" })).toBeNull();
    toggleDialog();
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    await waitFor(
      /** Waits for the accepted item to restore its marker. @returns Nothing. */ () =>
        expect(screen.getByRole("button", { name: "First line indent" }).style.left).toBe("177px"),
    );
    expect(values(owner.shell)).toEqual({ ...before, firstLine: 367 });
    expect(owner.session.docShell.GetUndoManager().GetUndoActionCount()).toBe(history + 1);
    expect(owner.store.GetSnapshot().activeParagraph.computedStyle.autoFirstLineIndent).toBe(false);
    expect(retained.computedStyle.autoFirstLineIndent).toBe(true);
    expect(retained.computedStyle.firstLineIndentPt).toBe(18.35);
    act(
      /** Restores automatic mode with the exact original tuple. @returns Nothing. */ () => {
        expect(owner.shell.Undo()).toBe(true);
      },
    );
    expect(values(owner.shell)).toEqual(before);
    expect(screen.queryByRole("button", { name: "First line indent" })).toBeNull();
    act(
      /** Reprojects manual mode and retains precise attributes. @returns Nothing. */ () => {
        expect(owner.shell.Redo()).toBe(true);
      },
    );
    expect(values(owner.shell)).toEqual({ ...before, firstLine: 367 });
    expect(screen.getByRole("button", { name: "First line indent" }).style.left).toBe("177px");
  });
});
