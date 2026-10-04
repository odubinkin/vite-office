/** @fileoverview Checks ruler tracking against owned Writer model and undo history. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";

const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases DOM tracking before Writer ownership. @returns Nothing. */ () => {
    cleanup();
    vi.restoreAllMocks();
    for (const session of sessions.splice(0)) session.Close();
  },
);

/** Creates an actual Writer view with a retained paragraph. @returns Owned frame fixture. */
function mountWriter() {
  const session = createWriterDocumentSession();
  sessions.push(session);
  session.view.GetWrtShell().Insert("RulerTrackingProof");
  const rendered = render(
    <WriterWorkbench
      fileDialogs={session.fileDialogs}
      isActive
      services={session.services}
      view={session.view}
    />,
  );
  return { session, ...rendered, handle: screen.getByRole("button", { name: "Left page margin" }) };
}

describe("Writer ruler tracking", /** Groups accepted and cancelled model transitions. @returns Nothing. */ () => {
  it("cancels Escape without model or undo effects and ignores the late pointer release", /** Checks source cancellation suppresses application changes. @returns Nothing. */ function cancelsWriterDrag() {
    const { session, handle } = mountWriter();
    const state = session.docShell.GetDocumentState();
    const shell = session.view.GetWrtShell();
    const history = session.docShell.GetUndoManager().GetUndoActionCount();
    const apply = vi.spyOn(shell, "AdjustPageMargin");
    const execute = vi.spyOn(session.view.GetViewFrame().GetDispatcher(), "Execute");
    fireEvent.pointerDown(handle, { button: 0, pointerId: 7, clientX: 100 });
    fireEvent.pointerMove(window, { pointerId: 7, clientX: 120 });
    expect(document.querySelector('[data-ruler-guide="x"]')).not.toBeNull();
    expect(fireEvent.keyDown(window, { key: "Escape", ctrlKey: true })).toBe(false);
    expect(document.querySelector('[data-ruler-guide="x"]')).toBeNull();
    fireEvent.pointerUp(window, { pointerId: 7, clientX: 120 });
    expect(apply).not.toHaveBeenCalled();
    expect(execute).not.toHaveBeenCalled();
    expect(session.docShell.GetDocumentState().contentGeneration).toBe(state.contentGeneration);
    expect(session.docShell.GetUndoManager().GetUndoActionCount()).toBe(history);
    expect(screen.getByLabelText("Writer document body")).toHaveTextContent("RulerTrackingProof");
  });

  it("removes tracking when its ruler is hidden and never applies a stale release", /** Checks removed DOM cannot mutate the surviving Writer document. @returns Nothing. */ function removesWriterDrag() {
    const { session, handle } = mountWriter();
    const generation = session.docShell.GetDocumentState().contentGeneration;
    const apply = vi.spyOn(session.view.GetWrtShell(), "AdjustPageMargin");
    fireEvent.pointerDown(handle, { button: 0, pointerId: 7, clientX: 100 });
    fireEvent.pointerMove(window, { pointerId: 7, clientX: 120 });
    act(
      /** Hides the existing ruler through view ownership. @returns Nothing. */ () =>
        session.view.ToggleHorizontalRuler(),
    );
    expect(screen.queryByRole("button", { name: "Left page margin" })).toBeNull();
    fireEvent.pointerUp(window, { pointerId: 7, clientX: 120 });
    expect(apply).not.toHaveBeenCalled();
    expect(session.docShell.GetDocumentState().contentGeneration).toBe(generation);
    expect(document.querySelector('[data-ruler-guide="x"]')).toBeNull();
  });

  it("owns document shortcuts until Enter accepts one margin change with working Undo", /** Checks real frame priority and a single history transition. @returns Nothing. */ function acceptsWriterDrag() {
    const { session, handle } = mountWriter();
    const shell = session.view.GetWrtShell();
    const original = shell.GetDoc().GetPageDesc().GetValue();
    const history = session.docShell.GetUndoManager().GetUndoActionCount();
    const generation = session.docShell.GetDocumentState().contentGeneration;
    const dispatcher = session.view.GetViewFrame().GetDispatcher();
    const lookup = vi.spyOn(dispatcher, "FindCommandByShortcut");
    const execute = vi.spyOn(dispatcher, "Execute");
    const apply = vi.spyOn(shell, "AdjustPageMargin");
    fireEvent.pointerDown(handle, { button: 0, pointerId: 7, clientX: 100 });
    fireEvent.pointerMove(window, { pointerId: 7, clientX: 120 });
    for (const key of ["b", "z", "a", "Tab", "F6"])
      expect(fireEvent.keyDown(handle, { key, ctrlKey: true })).toBe(false);
    expect(lookup).not.toHaveBeenCalled();
    expect(execute).not.toHaveBeenCalled();
    expect(session.docShell.GetDocumentState().contentGeneration).toBe(generation);
    expect(fireEvent.keyDown(handle, { key: "Enter", altKey: true })).toBe(false);
    expect(apply).toHaveBeenCalledExactlyOnceWith("left", 283);
    expect(shell.GetDoc().GetPageDesc().GetValue().leftMargin).toBe(original.leftMargin + 283);
    expect(session.docShell.GetUndoManager().GetUndoActionCount()).toBe(history + 1);
    fireEvent.pointerUp(window, { pointerId: 7, clientX: 180 });
    expect(apply).toHaveBeenCalledOnce();
    act(
      /** Restores the accepted page descriptor through existing shell Undo. @returns Nothing. */ () => {
        expect(shell.Undo()).toBe(true);
      },
    );
    expect(shell.GetDoc().GetPageDesc().GetValue()).toEqual(original);
    expect(screen.getByLabelText("Writer document body")).toHaveTextContent("RulerTrackingProof");
  });

  it("keeps new tab creation transient until acceptance and uses one real undo transition", /** Checks insertion cancellation and accepted Writer state. @returns Nothing. */ function tracksNewWriterTab() {
    const { session } = mountWriter();
    const shell = session.view.GetWrtShell();
    const apply = vi.spyOn(shell, "AddRulerTabStop");
    const history = session.docShell.GetUndoManager().GetUndoActionCount();
    const generation = session.docShell.GetDocumentState().contentGeneration;
    const surface = screen.getByRole("toolbar", { name: "Writer horizontal ruler" })
      .firstElementChild as HTMLElement;
    fireEvent.pointerDown(surface, { button: 0, pointerId: 7, clientX: 240 });
    expect(document.querySelector("[data-ruler-new-tab]")).not.toBeNull();
    expect(document.querySelector('[data-ruler-guide="x"]')).not.toBeNull();
    fireEvent.keyDown(window, { key: "Escape" });
    fireEvent.pointerUp(window, { pointerId: 7, clientX: 240 });
    fireEvent.click(surface, { clientX: 240 });
    expect(apply).not.toHaveBeenCalled();
    expect(session.docShell.GetDocumentState().contentGeneration).toBe(generation);
    expect(session.docShell.GetUndoManager().GetUndoActionCount()).toBe(history);
    expect(screen.queryByRole("button", { name: "Tab stop 1" })).toBeNull();
    fireEvent.pointerDown(surface, { button: 0, pointerId: 8, clientX: 240 });
    fireEvent.keyDown(window, { key: "Enter" });
    fireEvent.pointerUp(window, { pointerId: 8, clientX: 280 });
    expect(apply).toHaveBeenCalledExactlyOnceWith(1800);
    expect(screen.getByRole("button", { name: "Tab stop 1" })).toBeVisible();
    expect(session.docShell.GetUndoManager().GetUndoActionCount()).toBe(history + 1);
    act(
      /** Restores accepted tab state through shell Undo. @returns Nothing. */ () => {
        expect(shell.Undo()).toBe(true);
      },
    );
    expect(screen.queryByRole("button", { name: "Tab stop 1" })).toBeNull();
  });
});
