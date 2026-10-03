/** @fileoverview Verifies native document fallback for a menubar activated without a popup. */
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { BrowserCommandSource } from "./command-surface";
import { CommandMenuBar } from "./CommandMenuBar";
import { Desktop } from "../app/desktop";
import { createOfficeModuleDescriptors } from "../app/modulemanager";
import { createWriterModuleFactory } from "../../../sw/browser/composition/writer-module";

/** Mounts one frame's owned document and menu. @param id - Frame identity. @param fallback - Whether the frame supplies document focus. @returns Frame controls. */
function mountDocumentMenu(id = "first", fallback = true) {
  const state = { enabled: true };
  const execute = vi.fn(
    /** Returns an owned dispatch result. @param commandId - Identity. @returns Result. */ (
      commandId: string,
    ) => ({ commandId, status: "executed" as const, value: undefined }),
  );
  const source: BrowserCommandSource = {
    CreateControllerItem: /** Supplies a stable enabled controller. @returns Controller. */ () => ({
      Dispose: /** Releases no fixture resources. @returns Nothing. */ () => undefined,
      GetState: /** Reads enabled state. @returns State. */ () => state,
      Subscribe: /** Installs no fixture subscription. @returns Cleanup. */ () =>
        /** Releases no subscription. @returns Nothing. */ () =>
          undefined,
    }),
    Execute: execute,
    QueryCommand: /** Resolves an owned descriptor. @param id - Identity. @returns Descriptor. */ (
      id,
    ) => ({
      id,
      label: id,
      execute: /** Mutates no fixture data. @returns Nothing. */ () => undefined,
    }),
  };
  const focusDocument = vi.fn(
    /** Focuses only this frame's client. @returns Nothing. */ () =>
      screen.getByRole("textbox", { name: `${id} document` }).focus(),
  );
  render(
    <section aria-label={`${id} frame`}>
      <input aria-label={`${id} document`} />
      <input aria-label={`${id} toolbar`} />
      <CommandMenuBar
        {...(fallback ? { focusDocument } : {})}
        ariaLabel={`${id} menus`}
        commandSource={source}
        getCommandResource={
          /** Supplies an owned command. @returns Resource. */ () => ({
            label: "Alpha",
            semantics: "action",
            shortcuts: [],
          })
        }
        idPrefix={id}
        menus={[{ id: "edit", label: "Edit", items: [{ kind: "command", commandId: "Alpha" }] }]}
        resolveArguments={/** Supplies no arguments. @returns Undefined. */ () => undefined}
      />
    </section>,
  );
  const frame = screen.getByRole("region", { name: `${id} frame` });
  return {
    document: within(frame).getByRole("textbox", { name: `${id} document` }),
    toolbar: within(frame).getByRole("textbox", { name: `${id} toolbar` }),
    trigger: within(frame).getByRole("button", { name: "Edit" }),
    focusDocument,
    execute,
  };
}

describe("menubar document fallback", /** Groups frame-client focus contracts. @returns Nothing. */ function documentFallbackCases(): void {
  it("routes the actual Writer menu to its editing host and accepts input", /** Checks real view-client reference and editing boundary. @returns Nothing. */ function routesWriterClient(): void {
    globalThis.history.replaceState(null, "", "/writer");
    render(<Desktop modules={createOfficeModuleDescriptors([createWriterModuleFactory()])} />);
    const trigger = screen.getByRole("button", { name: "View" });
    act(
      /** Enters the menubar without a saved owner. @returns Nothing. */ () => {
        (document.activeElement as HTMLElement).blur();
        trigger.focus();
      },
    );
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    fireEvent.keyDown(trigger, { key: "Escape" });
    const editor = screen.getByLabelText("Writer document body");
    expect(editor).toHaveFocus();
    const paragraph = screen.getByRole("textbox", { name: "Writer document text" });
    const range = document.createRange();
    range.selectNodeContents(paragraph);
    range.collapse(true);
    const selection = window.getSelection() as Selection;
    selection.removeAllRanges();
    selection.addRange(range);
    fireEvent(
      editor,
      new InputEvent("beforeinput", {
        bubbles: true,
        cancelable: true,
        data: "OwnedFallbackProof",
        inputType: "insertText",
      }),
    );
    expect(editor).toHaveTextContent("OwnedFallbackProof");
  });

  it("focuses the document on unopened Escape when no owner was saved", /** Checks native default-to-document. @returns Nothing. */ function defaultsToDocument(): void {
    const fixture = mountDocumentMenu();
    fixture.trigger.focus();
    fireEvent.keyDown(fixture.trigger, { key: "Escape" });
    expect(fixture.document).toHaveFocus();
    expect(fixture.focusDocument).toHaveBeenCalledExactlyOnceWith();
    expect(fixture.execute).not.toHaveBeenCalled();
  });

  it("prefers a live saved toolbar owner over the document", /** Checks saved-owner precedence. @returns Nothing. */ function restoresLiveOwner(): void {
    const fixture = mountDocumentMenu();
    fixture.toolbar.focus();
    fixture.trigger.focus();
    fireEvent.keyDown(fixture.trigger, { key: "Escape" });
    expect(fixture.toolbar).toHaveFocus();
    expect(fixture.focusDocument).not.toHaveBeenCalled();
  });

  it("defaults to the document when the saved owner is disconnected", /** Checks disposed-owner fallback. @returns Nothing. */ function defaultsAfterDisposal(): void {
    const fixture = mountDocumentMenu();
    fixture.toolbar.focus();
    fixture.trigger.focus();
    const parent = fixture.toolbar.parentElement as HTMLElement;
    fixture.toolbar.remove();
    try {
      fireEvent.keyDown(fixture.trigger, { key: "Escape" });
      expect(fixture.document).toHaveFocus();
      expect(fixture.focusDocument).toHaveBeenCalledExactlyOnceWith();
    } finally {
      parent.append(fixture.toolbar);
    }
  });

  it("keeps an unopened detached menu focused when no frame client is supplied", /** Checks optional browser frame ownership. @returns Nothing. */ function keepsDetachedMenu(): void {
    const fixture = mountDocumentMenu("first", false);
    fixture.trigger.focus();
    fireEvent.keyDown(fixture.trigger, { key: "Escape" });
    expect(fixture.trigger).toHaveFocus();
  });

  it("does not default to the document through popup cancellation", /** Checks PopupClosed disables document fallback. @returns Nothing. */ function preservesPopupClose(): void {
    const fixture = mountDocumentMenu();
    fixture.trigger.focus();
    fireEvent.keyDown(fixture.trigger, { key: "ArrowDown" });
    fireEvent.keyDown(screen.getByRole("menuitem", { name: "Alpha" }), { key: "Escape" });
    expect(fixture.focusDocument).not.toHaveBeenCalled();
    expect(fixture.trigger).toHaveFocus();
  });

  it("does not default through Escape on a trigger with an open popup", /** Checks the popup cleanup branch stays distinct. @returns Nothing. */ function preservesOpenTriggerClose(): void {
    const fixture = mountDocumentMenu();
    fixture.trigger.focus();
    fireEvent.keyDown(fixture.trigger, { key: "ArrowDown" });
    fixture.trigger.focus();
    fireEvent.keyDown(fixture.trigger, { key: "Escape" });
    expect(fixture.focusDocument).not.toHaveBeenCalled();
  });

  it("does not override an external focus transfer", /** Checks LoseFocus consumes without default restoration. @returns Nothing. */ function preservesTransferredFocus(): void {
    const fixture = mountDocumentMenu();
    fixture.trigger.focus();
    act(/** Transfers focus to the toolbar. @returns Nothing. */ () => fixture.toolbar.focus());
    expect(fixture.toolbar).toHaveFocus();
    expect(fixture.focusDocument).not.toHaveBeenCalled();
  });

  it("routes fallback to the active menu's own frame client", /** Checks independent mounted frames. @returns Nothing. */ function routesOwnFrame(): void {
    const first = mountDocumentMenu();
    const second = mountDocumentMenu("second");
    second.trigger.focus();
    fireEvent.keyDown(second.trigger, { key: "Escape" });
    expect(second.document).toHaveFocus();
    expect(first.focusDocument).not.toHaveBeenCalled();
    expect(second.focusDocument).toHaveBeenCalledExactlyOnceWith();
  });
});
