/** @fileoverview Verifies saved external focus and native close-before-command ordering with owned fixtures. */
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { BrowserCommandSource } from "./command-surface";
import { CommandMenuBar } from "./CommandMenuBar";

/** Mounts owned menus and external focus owners. @param focusDialog - Whether execution focuses a new owner. @returns Fixture controls. */
function mountSavedFocusMenu(focusDialog = false) {
  const state = { enabled: true };
  const observedFocus: Array<Element | null> = [];
  const observedMenus: Array<Element | null> = [];
  const execute = vi.fn(
    /** Records focus before a command takes ownership. @param commandId - Command identity. @returns Dispatch result. */ (
      commandId: string,
    ) => {
      observedFocus.push(document.activeElement);
      observedMenus.push(document.querySelector('[role="menu"]'));
      if (focusDialog) screen.getByRole("textbox", { name: "Command dialog" }).focus();
      return { commandId, status: "executed" as const, value: undefined };
    },
  );
  const source: BrowserCommandSource = {
    CreateControllerItem: /** Creates stable enabled state. @returns Controller. */ () => ({
      Dispose: /** Releases no resources. @returns Nothing. */ () => undefined,
      GetState: /** Reads a stable snapshot. @returns State. */ () => state,
      Subscribe: /** Subscribes to no fixture events. @returns Cleanup. */ () =>
        /** Releases no subscriptions. @returns Nothing. */ () =>
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
  render(
    <>
      <input aria-label="First document" />
      <input aria-label="Second document" />
      <input aria-label="Command dialog" />
      <CommandMenuBar
        ariaLabel="Saved focus menus"
        commandSource={source}
        getCommandResource={
          /** Supplies an owned resource. @param id - Identity. @returns Resource. */ (id) => ({
            label: id,
            semantics: "action",
            shortcuts: [],
          })
        }
        idPrefix="saved-focus"
        menus={[
          {
            id: "first",
            label: "First",
            items: [
              { kind: "command", commandId: "Alpha" },
              {
                kind: "submenu",
                id: "nested",
                label: "Nested",
                items: [{ kind: "command", commandId: "Child" }],
              },
            ],
          },
          {
            id: "second",
            label: "Second",
            items: [{ kind: "command", commandId: "Delta" }],
          },
        ]}
        resolveArguments={/** Supplies no arguments. @returns Undefined. */ () => undefined}
      />
    </>,
  );
  return {
    owner: screen.getByRole("textbox", { name: "First document" }),
    other: screen.getByRole("textbox", { name: "Second document" }),
    dialog: screen.getByRole("textbox", { name: "Command dialog" }),
    trigger: screen.getByRole("button", { name: "First" }),
    execute,
    observedFocus,
    observedMenus,
  };
}

describe("saved menu focus", /** Groups focus ownership and dispatch ordering. @returns Nothing. */ function defineSavedFocusTests(): void {
  for (const external of [false, true]) {
    it(`dismisses an unopened menubar ${external ? "with" : "without"} a saved owner`, /** Checks Escape before popup creation and the existing no-owner fallback. @returns Nothing. */ function dismissesUnopenedMenubar(): void {
      const fixture = mountSavedFocusMenu();
      if (external) fixture.owner.focus();
      fixture.trigger.focus();
      fireEvent.keyDown(fixture.trigger, { key: "Escape" });
      expect(external ? fixture.owner : fixture.trigger).toHaveFocus();
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      expect(fixture.execute).not.toHaveBeenCalled();
    });
  }

  for (const keyboard of [false, true]) {
    it(`returns ${keyboard ? "keyboard" : "pointer"} root dismissal to the saved document`, /** Checks one external saved owner. @returns Nothing. */ function restoresSavedOwner(): void {
      const fixture = mountSavedFocusMenu();
      fixture.owner.focus();
      if (keyboard) {
        fixture.trigger.focus();
        fireEvent.keyDown(fixture.trigger, { key: "ArrowDown" });
      } else fireEvent.click(fixture.trigger);
      fireEvent.keyDown(document.activeElement as HTMLElement, { key: "Escape" });
      expect(fixture.owner).toHaveFocus();
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      expect(fixture.execute).not.toHaveBeenCalled();
    });
  }

  it("captures external focus before the browser focuses a pointer trigger", /** Checks actual pointer event ordering. @returns Nothing. */ function capturesPointerEntry(): void {
    const fixture = mountSavedFocusMenu();
    fixture.owner.focus();
    fireEvent.pointerDown(fixture.trigger);
    fixture.trigger.focus();
    fireEvent.click(fixture.trigger);
    fireEvent.keyDown(screen.getByRole("menu", { name: "First menu" }), { key: "Escape" });
    expect(fixture.owner).toHaveFocus();
  });

  for (const key of ["Escape", "Enter"]) {
    it(`restores an unselected root on ${key} without executing`, /** Checks root cancellation semantics. @returns Nothing. */ function dismissesUnselectedRoot(): void {
      const fixture = mountSavedFocusMenu();
      fixture.owner.focus();
      fireEvent.click(fixture.trigger);
      fireEvent.keyDown(screen.getByRole("menu", { name: "First menu" }), { key });
      expect(fixture.owner).toHaveFocus();
      expect(fixture.execute).not.toHaveBeenCalled();
    });
  }

  for (const kind of ["pointer", "keyboard", "nested"] as const) {
    it(`restores external focus before a ${kind} command executes once`, /** Checks native StopExecute-before-select ordering. @returns Nothing. */ function restoresBeforeDispatch(): void {
      const fixture = mountSavedFocusMenu();
      fixture.owner.focus();
      fireEvent.click(fixture.trigger);
      const nested = kind === "nested";
      if (nested)
        fireEvent.keyDown(screen.getByRole("menuitem", { name: "Nested" }), {
          key: "ArrowRight",
        });
      const item = screen.getByRole("menuitem", { name: nested ? "Child" : "Alpha" });
      item.focus();
      if (kind === "pointer") fireEvent.click(item);
      else fireEvent.keyDown(item, { key: "Enter" });
      expect(fixture.execute).toHaveBeenCalledExactlyOnceWith(
        nested ? "Child" : "Alpha",
        undefined,
      );
      expect(fixture.observedFocus).toEqual([fixture.owner]);
      expect(fixture.observedMenus).toEqual([null]);
      expect(fixture.owner).toHaveFocus();
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  }

  it("lets a dispatched command retain its new dialog focus", /** Checks restoration occurs before command ownership changes. @returns Nothing. */ function preservesCommandFocus(): void {
    const fixture = mountSavedFocusMenu(true);
    fixture.owner.focus();
    fireEvent.click(fixture.trigger);
    fireEvent.click(screen.getByRole("menuitem", { name: "Alpha" }));
    expect(fixture.observedFocus).toEqual([fixture.owner]);
    expect(fixture.observedMenus).toEqual([null]);
    expect(fixture.dialog).toHaveFocus();
  });

  it("saves once across neighboring roots and child-only dismissal", /** Checks original ownership outlives popup changes. @returns Nothing. */ function preservesCycleOwner(): void {
    const fixture = mountSavedFocusMenu();
    fixture.owner.focus();
    fireEvent.click(fixture.trigger);
    fireEvent.mouseEnter(screen.getByRole("button", { name: "Second" }));
    fireEvent.keyDown(screen.getByRole("menu", { name: "Second menu" }), {
      key: "ArrowLeft",
    });
    const nested = screen.getByRole("menuitem", { name: "Nested" });
    fireEvent.keyDown(nested, { key: "ArrowRight" });
    fireEvent.keyDown(screen.getByRole("menuitem", { name: "Child" }), { key: "Escape" });
    expect(nested).toHaveFocus();
    fireEvent.keyDown(nested, { key: "Escape" });
    expect(fixture.owner).toHaveFocus();
  });

  for (const keyboard of [false, true]) {
    it(`returns a ${keyboard ? "keyboard" : "pointer"} toggle to its saved owner`, /** Checks root trigger closing. @returns Nothing. */ function restoresOnToggle(): void {
      const fixture = mountSavedFocusMenu();
      fixture.owner.focus();
      fireEvent.click(fixture.trigger);
      if (keyboard) fireEvent.keyDown(fixture.trigger, { key: "Enter" });
      else fireEvent.click(fixture.trigger);
      expect(fixture.owner).toHaveFocus();
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  }

  it("restores before outside pointer default focus and keeps its new owner", /** Checks browser pointer transfer ordering. @returns Nothing. */ function transfersPointerFocus(): void {
    const fixture = mountSavedFocusMenu();
    fixture.owner.focus();
    fireEvent.click(fixture.trigger);
    fireEvent.pointerDown(fixture.other);
    expect(fixture.owner).toHaveFocus();
    act(/** Transfers focus outside the menu. @returns Nothing. */ () => fixture.other.focus());
    expect(fixture.other).toHaveFocus();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("dismisses on external focus transfer and starts a fresh saved cycle", /** Checks native focus-loss cancellation without restoration. @returns Nothing. */ function consumesTransferredCycle(): void {
    const fixture = mountSavedFocusMenu();
    fixture.owner.focus();
    fireEvent.click(fixture.trigger);
    act(
      /** Transfers focus outside the active popup. @returns Nothing. */ () =>
        fixture.other.focus(),
    );
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    fireEvent.pointerDown(fixture.other);
    expect(fixture.other).toHaveFocus();
    fireEvent.click(fixture.trigger);
    fireEvent.keyDown(screen.getByRole("menu", { name: "First menu" }), { key: "Escape" });
    expect(fixture.other).toHaveFocus();
  });

  it("skips a detached saved owner and uses the existing no-owner adapter fallback", /** Checks disposed target safety without claiming native document fallback. @returns Nothing. */ function skipsDetachedOwner(): void {
    const fixture = mountSavedFocusMenu();
    fixture.owner.focus();
    fireEvent.click(fixture.trigger);
    const parent = fixture.owner.parentElement as HTMLElement;
    fixture.owner.remove();
    const focus = vi.spyOn(fixture.owner, "focus");
    try {
      fireEvent.keyDown(screen.getByRole("menu", { name: "First menu" }), { key: "Escape" });
      expect(focus).not.toHaveBeenCalled();
      expect(fixture.trigger).toHaveFocus();
    } finally {
      parent.append(fixture.owner);
    }
  });

  it("does not retain an external owner after leaving an unopened menubar", /** Checks focus entry cleanup before a new cycle. @returns Nothing. */ function clearsUnopenedCycle(): void {
    const fixture = mountSavedFocusMenu();
    fixture.owner.focus();
    fixture.trigger.focus();
    fixture.other.focus();
    fixture.trigger.focus();
    fireEvent.keyDown(fixture.trigger, { key: "ArrowDown" });
    fireEvent.keyDown(screen.getByRole("menuitem", { name: "Alpha" }), { key: "Escape" });
    expect(fixture.other).toHaveFocus();
  });
});
