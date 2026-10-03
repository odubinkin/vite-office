/** @fileoverview Verifies that one popup consumes each nested keyboard event once. */
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { BrowserCommandSource } from "./command-surface";
import { CommandMenuBar, type MenuCommandResource } from "./CommandMenuBar";

/** Renders app-owned commands with distinct labels and a disabled sibling. @param semantics - Command presentation kind. @returns Mounted fixture and dispatch spy. */
function renderOwnedMenu(semantics: MenuCommandResource["semantics"] = "action") {
  const arguments_ = { selection: "owned-selection" };
  const execute = vi.fn(
    /** Records dispatch without mutating fixture state. @param commandId - Command identity. @returns Dispatch result. */ (
      commandId: string,
    ) => ({ commandId, status: "executed" as const, value: undefined }),
  );
  const source: BrowserCommandSource = {
    CreateControllerItem:
      /** Creates a stable app-owned bindings snapshot. @param id - Command identity. @returns Controller item. */ (
        id,
      ) => {
        const state = { enabled: id !== "disabled", checked: false };
        return {
          Dispose: /** Releases no fixture resources. @returns Nothing. */ () => undefined,
          GetState: /** Returns the stable snapshot. @returns State. */ () => state,
          Subscribe: /** Registers no fixture invalidation. @returns Cleanup. */ () =>
            /** Releases no subscription. @returns Nothing. */ () =>
              undefined,
        };
      },
    Execute: execute,
    QueryCommand:
      /** Resolves one owned command. @param id - Command identity. @returns Descriptor. */ (
        id,
      ) => ({
        id,
        label: id,
        execute: /** Performs no fixture action. @returns Nothing. */ () => undefined,
      }),
  };
  const mounted = render(
    <CommandMenuBar
      ariaLabel="Owned menus"
      commandSource={source}
      getCommandResource={
        /** Supplies distinct owned labels. @param id - Command identity. @returns Menu resource. */ (
          id,
        ) => ({
          label: id === "beta" ? "Beta" : id === "bravo" ? "Bravo" : id,
          semantics,
          shortcuts: [],
        })
      }
      idPrefix="owned"
      menus={[
        {
          id: "format",
          label: "Format",
          items: [
            { kind: "command", commandId: "root" },
            {
              id: "nested",
              kind: "submenu",
              label: "Nested",
              items: [
                { kind: "command", commandId: "beta" },
                { kind: "command", commandId: "disabled" },
                { kind: "command", commandId: "bravo" },
              ],
            },
          ],
        },
      ]}
      resolveArguments={
        /** Supplies the exact owned payload. @returns Dispatch arguments. */ () => arguments_
      }
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Format" }));
  return { ...mounted, execute, arguments_ };
}

/** Opens the existing nested popup by keyboard. @returns Nothing. */
function openNestedMenu(): void {
  const trigger = screen.getByRole("menuitem", { name: "Nested" });
  trigger.focus();
  fireEvent.keyDown(trigger, { key: "ArrowRight" });
}

describe("popup keyboard ownership", /** Groups event ownership regressions. @returns Nothing. */ function defineOwnershipTests(): void {
  for (const semantics of ["action", "check", "radio"] as const) {
    for (const key of ["Enter", " "]) {
      it(`executes a nested ${semantics} once with ${JSON.stringify(key)}`, /** Verifies one dispatch with the exact command and arguments. @returns Nothing. */ function activatesNestedOnce(): void {
        const fixture = renderOwnedMenu(semantics);
        openNestedMenu();
        const role =
          semantics === "action"
            ? "menuitem"
            : semantics === "check"
              ? "menuitemcheckbox"
              : "menuitemradio";
        const command = screen.getByRole(role, { name: "Beta" });
        command.focus();
        fireEvent.keyDown(command, { key });
        expect(fixture.execute).toHaveBeenCalledTimes(1);
        expect(fixture.execute).toHaveBeenCalledWith("beta", fixture.arguments_);
        expect(screen.queryAllByRole("menu")).toHaveLength(0);
      });
    }
  }

  it("keeps top-level and pointer activation single", /** Verifies ancestor-owned keyboard and direct click controls. @returns Nothing. */ function retainsDirectActivation(): void {
    const fixture = renderOwnedMenu();
    fireEvent.keyDown(screen.getByRole("menuitem", { name: "root" }), { key: "Enter" });
    expect(fixture.execute).toHaveBeenCalledTimes(1);
    expect(fixture.execute).toHaveBeenLastCalledWith("root", fixture.arguments_);
    fireEvent.click(screen.getByRole("button", { name: "Format" }));
    openNestedMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: "Beta" }));
    expect(fixture.execute).toHaveBeenCalledTimes(2);
    expect(fixture.execute).toHaveBeenLastCalledWith("beta", fixture.arguments_);
  });

  it("skips disabled siblings and advances one item per arrow", /** Verifies nested traversal and disabled activation. @returns Nothing. */ function advancesNestedOnce(): void {
    const fixture = renderOwnedMenu();
    openNestedMenu();
    const beta = screen.getByRole("menuitem", { name: "Beta" });
    beta.focus();
    fireEvent.keyDown(beta, { key: "ArrowDown" });
    expect(screen.getByRole("menuitem", { name: "Bravo" })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole("menuitem", { name: "disabled" }), { key: "Enter" });
    expect(fixture.execute).not.toHaveBeenCalled();
  });

  it("appends each nested typeahead key once", /** Verifies that bubbling does not duplicate the prefix. @returns Nothing. */ function consumesNestedPrefixOnce(): void {
    vi.useFakeTimers();
    const fixture = renderOwnedMenu();
    try {
      openNestedMenu();
      const beta = screen.getByRole("menuitem", { name: "Beta" });
      beta.focus();
      fireEvent.keyDown(beta, { key: "b" });
      expect(beta).toHaveFocus();
      fireEvent.keyDown(beta, { key: "r" });
      expect(screen.getByRole("menuitem", { name: "Bravo" })).toHaveFocus();
      expect(fixture.execute).not.toHaveBeenCalled();
    } finally {
      fixture.unmount();
      vi.useRealTimers();
    }
  });
});
