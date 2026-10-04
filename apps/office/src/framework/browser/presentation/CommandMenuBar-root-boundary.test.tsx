/** @fileoverview Checks common native root arrows and boundary navigation with owned menus. */
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CommandMenuBar } from "./CommandMenuBar";
import type { BrowserCommandSource } from "./command-surface";

/** Mounts three stable owned root menus. @returns Menu controls. */
function mountRoots() {
  const execute = vi.fn(
    /** Returns an owned dispatch result. @param commandId - Command identity. @returns Result. */ (
      commandId: string,
    ) => ({ commandId, status: "executed" as const, value: undefined }),
  );
  const source: BrowserCommandSource = {
    CreateControllerItem:
      /** Supplies owned command state. @param commandId - Command identity. @returns Controller. */ (
        commandId,
      ) => {
        const state = { enabled: commandId !== "Disabled" };
        return {
          Dispose: /** Releases no resources. @returns Nothing. */ () => undefined,
          GetState: /** Reads fixed availability. @returns State. */ () => state,
          Subscribe: /** Installs no subscription. @returns Cleanup. */ () =>
            /** Releases no resources. @returns Nothing. */ () =>
              undefined,
        };
      },
    Execute: execute,
    QueryCommand:
      /** Resolves owned metadata. @param commandId - Command identity. @returns Descriptor. */ (
        commandId,
      ) => ({
        id: commandId,
        label: commandId,
        execute: /** Does nothing. @returns Nothing. */ () => undefined,
      }),
  };
  const tree =
    /** Reprojects identical menu identities with fresh resource objects. @returns Menu fixture. */ () => (
      <>
        <button>Document owner</button>
        <CommandMenuBar
          ariaLabel="Root menus"
          commandSource={source}
          getCommandResource={
            /** Supplies owned resources. @param commandId - Command identity. @returns Resource. */ (
              commandId,
            ) => ({ label: commandId, semantics: "action", shortcuts: [] })
          }
          idPrefix="boundary"
          isInputEnabled
          menus={[
            {
              id: "first",
              label: "First",
              items: [
                { kind: "command", commandId: "Disabled" },
                { kind: "command", commandId: "Alpha" },
                { kind: "command", commandId: "AlphaNext" },
              ],
            },
            {
              id: "middle",
              label: "Middle",
              items: [
                { kind: "command", commandId: "Beta" },
                {
                  kind: "submenu",
                  id: "branch",
                  label: "Branch",
                  items: [{ kind: "command", commandId: "Nested" }],
                },
              ],
            },
            {
              id: "last",
              label: "Last",
              items: [
                { kind: "command", commandId: "Omega" },
                { kind: "command", commandId: "OmegaNext" },
              ],
            },
          ]}
          resolveArguments={/** Supplies no arguments. @returns Undefined. */ () => undefined}
        />
      </>
    );
  const result = render(tree());
  return {
    owner: screen.getByRole("button", { name: "Document owner" }),
    first: screen.getByRole("button", { name: "First" }),
    middle: screen.getByRole("button", { name: "Middle" }),
    last: screen.getByRole("button", { name: "Last" }),
    execute,
    rerender: /** Keeps menu identities stable on resource reprojection. @returns Nothing. */ () =>
      result.rerender(tree()),
  };
}

describe("menubar root boundary navigation", /** Groups existing root navigation contracts. @returns Nothing. */ () => {
  for (const key of ["Home", "End"] as const) {
    it(`${key} selects its boundary without opening an inactive popup`, /** Checks no-popup activation stays unopened. @returns Nothing. */ function navigatesUnopenedBoundary(): void {
      const fixture = mountRoots();
      fixture.owner.focus();
      fixture.middle.focus();
      fireEvent.keyDown(fixture.middle, { key });
      expect(key === "Home" ? fixture.first : fixture.last).toHaveFocus();
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      fireEvent.keyDown(document.activeElement as HTMLElement, { key: "Escape" });
      expect(fixture.owner).toHaveFocus();
      expect(fixture.execute).not.toHaveBeenCalled();
    });

    for (const child of [false, true]) {
      it(`${key} moves an active ${child ? "child" : "root"} popup to its boundary`, /** Checks native root selection also replaces its active popup. @returns Nothing. */ function switchesBoundaryPopup(): void {
        const fixture = mountRoots();
        fixture.owner.focus();
        fireEvent.click(fixture.middle);
        if (child)
          fireEvent.keyDown(screen.getByRole("menuitem", { name: "Branch" }), {
            key: "ArrowRight",
          });
        fixture.middle.focus();
        fireEvent.keyDown(fixture.middle, { key });
        expect(screen.getAllByRole("menu")).toHaveLength(1);
        expect(screen.queryByRole("menuitem", { name: "Beta" })).not.toBeInTheDocument();
        expect(screen.queryByRole("menuitem", { name: "Nested" })).not.toBeInTheDocument();
        expect(
          screen.getByRole("menuitem", { name: key === "Home" ? "Alpha" : "Omega" }),
        ).toHaveFocus();
        expect(key === "Home" ? fixture.first : fixture.last).toHaveAttribute(
          "aria-expanded",
          "true",
        );
        expect(fixture.middle).toHaveAttribute("aria-expanded", "false");
        fireEvent.keyDown(document.activeElement as HTMLElement, { key: "Escape" });
        expect(fixture.owner).toHaveFocus();
        expect(fixture.execute).not.toHaveBeenCalled();
      });
    }

    it(`${key} reuses its active boundary popup and later selection`, /** Checks native same-popup reuse is not a new preselection request. @returns Nothing. */ function reusesBoundaryPopup(): void {
      const fixture = mountRoots();
      const boundary = key === "Home" ? fixture.first : fixture.last;
      fireEvent.click(boundary);
      const popup = screen.getByRole("menu");
      const later = screen.getByRole("menuitem", {
        name: key === "Home" ? "AlphaNext" : "OmegaNext",
      });
      later.focus();
      boundary.focus();
      fireEvent.keyDown(boundary, { key });
      expect(screen.getByRole("menu")).toBe(popup);
      expect(boundary).toHaveFocus();
      later.focus();
      fixture.rerender();
      expect(later).toHaveFocus();
      expect(fixture.execute).not.toHaveBeenCalled();
    });
  }

  for (const key of ["ArrowLeft", "ArrowRight"] as const) {
    it(`${key} retains boundary wrap and active-popup preselection`, /** Checks arrow behavior shares the repaired path. @returns Nothing. */ function preservesArrowPopup(): void {
      const fixture = mountRoots();
      fixture.owner.focus();
      const start = key === "ArrowLeft" ? fixture.first : fixture.last;
      fireEvent.click(start);
      start.focus();
      fireEvent.keyDown(start, { key });
      expect(
        screen.getByRole("menuitem", { name: key === "ArrowLeft" ? "Omega" : "Alpha" }),
      ).toHaveFocus();
      expect(screen.getAllByRole("menu")).toHaveLength(1);
      expect(fixture.execute).not.toHaveBeenCalled();
    });
  }

  it("boundary navigation does not dispatch or interfere with the menu-key cycle", /** Checks logical activation is kept across boundary movement. @returns Nothing. */ function retainsActivationCycle(): void {
    const fixture = mountRoots();
    fixture.owner.focus();
    fixture.middle.focus();
    fireEvent.keyDown(fixture.middle, { key: "End" });
    act(
      /** Sends the existing menu key. @returns Nothing. */ () => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "F10", cancelable: true }));
      },
    );
    expect(fixture.owner).toHaveFocus();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(fixture.execute).not.toHaveBeenCalled();
  });
});
