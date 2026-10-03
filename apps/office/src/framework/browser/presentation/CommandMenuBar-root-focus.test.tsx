/** @fileoverview Verifies root popup focus and opening origin with owned command fixtures. */
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { BrowserCommandSource } from "./command-surface";
import { CommandMenuBar, type CommandMenuPlacement } from "./CommandMenuBar";

/** Mounts two menus without external resources. @returns Fixture and dispatch spy. */
function mountMenus() {
  const state = { enabled: true };
  const execute = vi.fn(
    /** Records owned execution. @param commandId - Identity. @returns Dispatch result. */ (
      commandId: string,
    ) => ({ commandId, status: "executed" as const, value: undefined }),
  );
  const source: BrowserCommandSource = {
    CreateControllerItem: /** Creates a stable enabled item. @returns Controller. */ () => ({
      Dispose: /** Releases no resources. @returns Nothing. */ () => undefined,
      GetState: /** Reads the stable snapshot. @returns State. */ () => state,
      Subscribe: /** Registers no changes. @returns Cleanup. */ () =>
        /** Releases no subscription. @returns Nothing. */ () =>
          undefined,
    }),
    Execute: execute,
    QueryCommand: /** Resolves an owned descriptor. @param id - Identity. @returns Descriptor. */ (
      id,
    ) => ({
      id,
      label: id,
      execute: /** Mutates no fixture state. @returns Nothing. */ () => undefined,
    }),
  };
  const menus: readonly CommandMenuPlacement[] = [
    {
      id: "format",
      label: "Format",
      items: [
        { kind: "command", commandId: "Alpha" },
        {
          kind: "submenu",
          id: "nested",
          label: "Nested",
          items: [{ kind: "command", commandId: "Child" }],
        },
        { kind: "command", commandId: "Omega" },
      ],
    },
    {
      id: "edit",
      label: "Edit",
      items: [{ kind: "command", commandId: "Delta" }],
    },
  ];
  /** Builds a render with a supplied resource identity. @param placements - Owned menus. @returns Menubar. */
  function surface(placements: readonly CommandMenuPlacement[]): React.JSX.Element {
    return (
      <CommandMenuBar
        ariaLabel="Root focus menus"
        commandSource={source}
        getCommandResource={
          /** Supplies the owned label. @param id - Identity. @returns Resource. */ (id) => ({
            label: id,
            semantics: "action",
            shortcuts: [],
          })
        }
        idPrefix="root-focus"
        menus={placements}
        resolveArguments={/** Supplies no arguments. @returns Undefined. */ () => undefined}
      />
    );
  }
  const mounted = render(surface(menus));
  return {
    execute,
    refresh: /** Changes placement identity without changing content. @returns Nothing. */ () =>
      mounted.rerender(surface([...menus])),
    trigger: screen.getByRole("button", { name: "Format" }),
  };
}

describe("root popup opening", /** Groups opening and reuse contracts. @returns Nothing. */ function defineRootFocusTests(): void {
  it("gives a pointer popup focus without selecting or executing an item", /** Checks the initial pointer request. @returns Nothing. */ function focusesPointerPopup(): void {
    const fixture = mountMenus();
    fixture.trigger.focus();
    fireEvent.click(fixture.trigger);
    expect(screen.getByRole("menu", { name: "Format menu" })).toHaveFocus();
    expect(screen.getByRole("menuitem", { name: "Alpha" })).not.toHaveFocus();
    expect(fixture.execute).not.toHaveBeenCalled();
  });

  it("transfers pointer focus to a neighboring root without preselection", /** Checks pointer switching. @returns Nothing. */ function switchesPointerPopup(): void {
    mountMenus();
    fireEvent.click(screen.getByRole("button", { name: "Format" }));
    fireEvent.mouseEnter(screen.getByRole("button", { name: "Edit" }));
    expect(screen.getByRole("menu", { name: "Edit menu" })).toHaveFocus();
    expect(screen.getByRole("menuitem", { name: "Delta" })).not.toHaveFocus();
    expect(screen.queryByRole("menu", { name: "Format menu" })).not.toBeInTheDocument();
  });

  for (const [key, label] of [
    ["ArrowDown", "Alpha"],
    ["ArrowUp", "Omega"],
    ["Home", "Alpha"],
    ["End", "Omega"],
  ] as const) {
    it(`navigates an unselected root with ${key}`, /** Checks popup boundary input after pointer opening. @returns Nothing. */ function movesFromUnselectedRoot(): void {
      const fixture = mountMenus();
      fireEvent.click(fixture.trigger);
      const popup = screen.getByRole("menu", { name: "Format menu" });
      fireEvent.keyDown(popup, { key });
      expect(screen.getByRole("menuitem", { name: label })).toHaveFocus();
      expect(fixture.execute).not.toHaveBeenCalled();
    });
  }

  for (const key of ["ArrowDown", "ArrowUp", "Enter", " "]) {
    it(`preselects the first root command on ${JSON.stringify(key)} and executes it once`, /** Checks keyboard opening and subsequent command dispatch. @returns Nothing. */ function opensFromKeyboard(): void {
      const fixture = mountMenus();
      fixture.trigger.focus();
      fireEvent.keyDown(fixture.trigger, { key });
      const first = screen.getByRole("menuitem", { name: "Alpha" });
      expect(first).toHaveFocus();
      expect(fixture.execute).not.toHaveBeenCalled();
      fireEvent.keyDown(first, { key: "Enter" });
      expect(fixture.execute).toHaveBeenCalledExactlyOnceWith("Alpha", undefined);
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  }

  for (const key of ["ArrowDown", "ArrowUp"]) {
    it(`preserves a selected child on a repeated active root ${key}`, /** Checks the native active-popup guard. @returns Nothing. */ function reusesActivePopup(): void {
      const fixture = mountMenus();
      fireEvent.keyDown(fixture.trigger, { key: "ArrowDown" });
      fireEvent.keyDown(screen.getByRole("menuitem", { name: "Nested" }), {
        key: "ArrowRight",
      });
      const child = screen.getByRole("menuitem", { name: "Child" });
      expect(child).toHaveFocus();
      fireEvent.keyDown(fixture.trigger, { key });
      expect(child).toHaveFocus();
      fixture.refresh();
      expect(child).toHaveFocus();
      expect(fixture.execute).not.toHaveBeenCalled();
    });
  }

  for (const keyboard of [false, true]) {
    it(`consumes the ${keyboard ? "keyboard" : "pointer"} request before resource rerender`, /** Checks one-shot initial focus. @returns Nothing. */ function preservesUserFocus(): void {
      const fixture = mountMenus();
      if (keyboard) fireEvent.keyDown(fixture.trigger, { key: "ArrowDown" });
      else fireEvent.click(fixture.trigger);
      const last = screen.getByRole("menuitem", { name: "Omega" });
      last.focus();
      fixture.refresh();
      expect(last).toHaveFocus();
    });
  }

  it("resets opening origin after keyboard dismissal and pointer toggle", /** Checks reopening and consumed request cleanup. @returns Nothing. */ function resetsOpeningOrigin(): void {
    const fixture = mountMenus();
    fireEvent.keyDown(fixture.trigger, { key: "ArrowDown" });
    fireEvent.keyDown(screen.getByRole("menuitem", { name: "Alpha" }), { key: "Escape" });
    expect(fixture.trigger).toHaveFocus();
    fireEvent.click(fixture.trigger);
    expect(screen.getByRole("menu", { name: "Format menu" })).toHaveFocus();
    fireEvent.click(fixture.trigger);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    fixture.refresh();
    fireEvent.keyDown(fixture.trigger, { key: "ArrowUp" });
    expect(screen.getByRole("menuitem", { name: "Alpha" })).toHaveFocus();
  });

  for (const key of ["Enter", " "]) {
    it(`closes the active popup from its trigger with ${JSON.stringify(key)}`, /** Checks keyboard toggling without execution. @returns Nothing. */ function togglesKeyboardPopup(): void {
      const fixture = mountMenus();
      fireEvent.keyDown(fixture.trigger, { key: "ArrowDown" });
      fireEvent.keyDown(fixture.trigger, { key });
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      expect(fixture.trigger).toHaveFocus();
      expect(fixture.execute).not.toHaveBeenCalled();
    });
  }
});
