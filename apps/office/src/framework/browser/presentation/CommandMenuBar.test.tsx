/** @fileoverview Verifies generic menubar defaults independently of Writer resources. */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { BrowserCommandControllerItem, BrowserCommandSource } from "./command-surface";
import { CommandMenuBar } from "./CommandMenuBar";

/** Creates a test controller-item factory around deterministic state. @param queryState - State reader. @returns Controller-item factory. */
function createControllerItem(
  queryState: () => ReturnType<BrowserCommandControllerItem["GetState"]>,
): BrowserCommandSource["CreateControllerItem"] {
  return /** Creates one inert test controller item. @returns Controller item. */ () => {
    const state = queryState();
    return {
      Dispose: /** Releases no test resources. @returns Nothing. */ () => undefined,
      GetState: /** Returns the stable fixture snapshot. @returns Command state. */ () => state,
      Subscribe: /** Registers no invalidation in a static fixture. @returns Cleanup. */ () =>
        /** Cleans up no test resources. @returns Nothing. */ () =>
          undefined,
    };
  };
}

/** Renders owned command and submenu placements for viewport interaction checks. @returns Mounted menubar. */
function renderGeometryMenu(): ReturnType<typeof render> {
  const commandSource: BrowserCommandSource = {
    CreateControllerItem: createControllerItem(
      /** Supplies a reachable command. @returns Enabled state. */ () => ({ enabled: true }),
    ),
    Execute: vi.fn(
      /** Returns the owned dispatch result. @param commandId - Command identity. @returns Dispatch result. */ (
        commandId,
      ) => ({ commandId, status: "executed" as const, value: undefined }),
    ),
    QueryCommand: vi.fn(
      /** Resolves the owned fixture command. @param id - Command identity. @returns Descriptor. */ (
        id,
      ) => ({
        id,
        label: "Apply",
        execute: /** Performs no fixture mutation. @returns Nothing. */ () => undefined,
      }),
    ),
  };
  return render(
    <CommandMenuBar
      ariaLabel="Geometry menus"
      commandSource={commandSource}
      getCommandResource={
        /** Supplies the owned label. @returns Resource. */ () => ({
          label: "Apply",
          semantics: "action",
          shortcuts: [],
        })
      }
      idPrefix="geometry"
      menus={[
        {
          id: "format",
          label: "Format",
          items: [
            {
              kind: "submenu",
              id: "numbering",
              label: "Numbering",
              items: [{ kind: "command", commandId: "apply" }],
            },
          ],
        },
      ]}
      resolveArguments={/** Supplies no fixture arguments. @returns Undefined. */ () => undefined}
    />,
  );
}

describe("CommandMenuBar", /** Groups generic menubar behavior. @returns Nothing. */ function defineCommandMenuBarTests(): void {
  it("keeps menu interaction usable when a popup lookup has no mounted result", /** Checks failed DOM focus lookup for both root and nested popups. @returns Nothing. */ () => {
    const mounted = renderGeometryMenu();
    const root = screen.getByRole("menubar", { name: "Geometry menus" });
    const query = vi.spyOn(root, "querySelector").mockReturnValue(null);
    try {
      fireEvent.click(screen.getByRole("button", { name: "Format" }));
      const trigger = screen.getByRole("menuitem", { name: "Numbering" });
      fireEvent.keyDown(trigger, { key: "ArrowRight" });
      expect(screen.getByRole("menu", { name: "Numbering menu" })).toBeVisible();
      expect(query).toHaveBeenCalledWith("#geometry-format-menu");
      expect(query).toHaveBeenCalledWith('[data-submenu="numbering"]');
    } finally {
      query.mockRestore();
      mounted.unmount();
    }
  });
  it("keeps a long menu below or above its trigger and updates without document scrolling", /** Verifies viewport resizing and ancestor scroll placement. @returns Nothing. */ function tracksMenuGeometry(): void {
    vi.stubGlobal("innerWidth", 390);
    vi.stubGlobal("innerHeight", 340);
    let anchor = new DOMRect(320, 40, 70, 30);
    const measure = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(/** Returns owned trigger geometry. @returns Rectangle. */ () => anchor);
    vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(500);
    vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(224);
    const removeWindow = vi.spyOn(window, "removeEventListener");
    const removeDocument = vi.spyOn(document, "removeEventListener");
    const mounted = renderGeometryMenu();
    try {
      fireEvent.click(screen.getByRole("button", { name: "Format" }));
      const menu = screen.getByRole("menu", { name: "Format menu" });
      expect(menu).toHaveStyle({
        left: "158px",
        top: "74px",
        maxHeight: "258px",
        maxWidth: "374px",
      });
      expect(menu).toHaveClass("fixed", "overflow-auto", "overscroll-contain");
      anchor = new DOMRect(320, 190, 70, 30);
      fireEvent.scroll(document);
      expect(menu).toHaveStyle({ top: "8px", maxHeight: "178px" });
      vi.stubGlobal("innerHeight", 600);
      fireEvent.resize(window);
      expect(menu).toHaveStyle({ top: "224px", maxHeight: "368px" });
      mounted.unmount();
      expect(removeWindow).toHaveBeenCalledWith("resize", expect.any(Function));
      expect(removeDocument).toHaveBeenCalledWith("scroll", expect.any(Function), true);
      measure.mockClear();
      fireEvent.resize(window);
      fireEvent.scroll(document);
      expect(measure).not.toHaveBeenCalled();
    } finally {
      mounted.unmount();
      vi.restoreAllMocks();
      vi.unstubAllGlobals();
    }
  });

  it("flips and clamps a submenu without losing keyboard focus or command dismissal", /** Verifies nested viewport placement and retained menu interactions. @returns Nothing. */ function tracksSubmenuGeometry(): void {
    vi.stubGlobal("innerWidth", 390);
    vi.stubGlobal("innerHeight", 340);
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
      /** Returns owned trigger positions near the viewport edge. @param this - Measured trigger. @returns Rectangle. */ function measureAnchor(
        this: HTMLElement,
      ): DOMRect {
        return this.textContent === "Format"
          ? new DOMRect(320, 40, 70, 30)
          : new DOMRect(250, 300, 100, 30);
      },
    );
    vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(500);
    vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(224);
    const mounted = renderGeometryMenu();
    try {
      fireEvent.click(screen.getByRole("button", { name: "Format" }));
      const trigger = screen.getByRole("menuitem", { name: "Numbering" });
      fireEvent.keyDown(trigger, { key: "ArrowRight" });
      const submenu = screen.getByRole("menu", { name: "Numbering menu" });
      expect(submenu).toHaveStyle({ left: "22px", top: "8px", maxHeight: "324px" });
      expect(screen.getByRole("menuitem", { name: "Apply" })).toHaveFocus();
      vi.stubGlobal("innerWidth", 900);
      vi.stubGlobal("innerHeight", 700);
      fireEvent.resize(window);
      expect(submenu).toHaveStyle({ left: "354px", top: "190px", maxHeight: "684px" });
      fireEvent.keyDown(screen.getByRole("menuitem", { name: "Apply" }), { key: "Escape" });
      expect(trigger).toHaveFocus();
      expect(screen.queryByRole("menu", { name: "Numbering menu" })).not.toBeInTheDocument();
      fireEvent.keyDown(trigger, { key: "ArrowRight" });
      fireEvent.click(screen.getByRole("menuitem", { name: "Apply" }));
      expect(screen.queryByRole("menu", { name: "Format menu" })).not.toBeInTheDocument();
    } finally {
      mounted.unmount();
      vi.restoreAllMocks();
      vi.unstubAllGlobals();
    }
  });

  it("uses placement labels when no localization adapter is supplied", /** Verifies the generated-label default. @returns Nothing. */ function usesFallbackLabel(): void {
    const commandSource: BrowserCommandSource = {
      CreateControllerItem: createControllerItem(
        /** Returns deterministic disabled state. @returns Disabled state. */ () => ({
          enabled: false,
        }),
      ),
      Execute: vi.fn(
        /** Returns a deterministic dispatch result. @param commandId - Dispatched identity. @returns Executed result. */ (
          commandId,
        ) => ({
          commandId,
          status: "executed" as const,
          value: undefined,
        }),
      ),
      QueryCommand: vi.fn(
        /** Resolves no commands for an empty test menu. @returns Undefined. */ () => undefined,
      ),
    };
    render(
      <CommandMenuBar
        ariaLabel="Test menu bar"
        commandSource={commandSource}
        getCommandResource={
          /** Returns an unused deterministic resource. @returns Command resource. */ () => ({
            label: "Unused",
            semantics: "action",
            shortcuts: [],
          })
        }
        idPrefix="test"
        menus={[{ id: "file", items: [], label: "File" }]}
        resolveArguments={/** Resolves no arguments. @returns Undefined. */ () => undefined}
      />,
    );
    expect(screen.getByRole("button", { name: "File" })).toBeVisible();
  });

  it("switches open top-level menus on hover", /** Verifies hover switching does not open a closed menubar. @returns Nothing. */ function switchesOpenMenusOnHover(): void {
    const commandSource: BrowserCommandSource = {
      CreateControllerItem: createControllerItem(
        /** Returns deterministic disabled state. @returns Disabled state. */ () => ({
          enabled: false,
        }),
      ),
      Execute: vi.fn(
        /** Returns a deterministic dispatch result. @param commandId - Dispatched identity. @returns Executed result. */ (
          commandId,
        ) => ({
          commandId,
          status: "executed" as const,
          value: undefined,
        }),
      ),
      QueryCommand: vi.fn(
        /** Resolves no commands for empty test menus. @returns Undefined. */ () => undefined,
      ),
    };
    render(
      <CommandMenuBar
        ariaLabel="Test menu bar"
        commandSource={commandSource}
        getCommandResource={
          /** Returns an unused deterministic resource. @returns Command resource. */ () => ({
            label: "Unused",
            semantics: "action",
            shortcuts: [],
          })
        }
        idPrefix="test"
        menus={[
          { id: "file", items: [], label: "File" },
          { id: "edit", items: [], label: "Edit" },
        ]}
        resolveArguments={/** Resolves no arguments. @returns Undefined. */ () => undefined}
      />,
    );
    const file = screen.getByRole("button", { name: "File" });
    const edit = screen.getByRole("button", { name: "Edit" });
    fireEvent.mouseEnter(edit);
    expect(screen.queryByRole("menu", { name: "Edit menu" })).not.toBeInTheDocument();
    fireEvent.click(file);
    fireEvent.mouseEnter(file);
    expect(screen.getByRole("menu", { name: "File menu" })).toBeVisible();
    fireEvent.mouseEnter(edit);
    expect(screen.getByRole("menu", { name: "Edit menu" })).toBeVisible();
    expect(screen.queryByRole("menu", { name: "File menu" })).not.toBeInTheDocument();
  });

  it("renders checkmarks for checked menu commands", /** Verifies the checkmark gutter follows command state. @returns Nothing. */ function rendersCheckmarks(): void {
    const commandId = "view-sidebar";
    let isChecked = true;
    const commandSource: BrowserCommandSource = {
      CreateControllerItem: createControllerItem(
        /** Returns current check state. @returns Enabled checked state. */ () => ({
          checked: isChecked,
          enabled: true,
        }),
      ),
      Execute: vi.fn(
        /** Returns a deterministic dispatch result. @param dispatchedCommandId - Dispatched identity. @returns Executed result. */ (
          dispatchedCommandId,
        ) => {
          isChecked = false;
          return {
            commandId: dispatchedCommandId,
            status: "executed" as const,
            value: undefined,
          };
        },
      ),
      QueryCommand: vi.fn(
        /** Resolves the checkable test command. @param queriedCommandId - Candidate identity. @returns Command descriptor or undefined. */ (
          queriedCommandId,
        ) =>
          queriedCommandId === commandId
            ? {
                execute: /** Implements the inert descriptor. @returns Undefined. */ () =>
                  undefined,
                id: commandId,
                label: "Sidebar",
              }
            : undefined,
      ),
    };
    render(
      <CommandMenuBar
        ariaLabel="Test menu bar"
        commandSource={commandSource}
        getCommandResource={
          /** Returns the checkable test resource. @returns Command resource. */ () => ({
            label: "Sidebar",
            semantics: "check",
            shortcuts: [],
          })
        }
        idPrefix="test"
        menus={[{ id: "view", items: [{ commandId, kind: "command" }], label: "View" }]}
        resolveArguments={/** Resolves no arguments. @returns Undefined. */ () => undefined}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "View" }));
    const menuItem = screen.getByRole("menuitemcheckbox", { name: "Sidebar" });
    expect(menuItem).toHaveAttribute("aria-checked", "true");
    expect(menuItem.querySelector("[data-menu-checkmark]")).toHaveTextContent("✓");
    expect(menuItem.querySelector("[data-menu-checkmark]")).not.toHaveClass("text-indigo-700");
    fireEvent.click(menuItem);
    fireEvent.click(screen.getByRole("button", { name: "View" }));
    const uncheckedMenuItem = screen.getByRole("menuitemcheckbox", { name: "Sidebar" });
    expect(uncheckedMenuItem).toHaveAttribute("aria-checked", "false");
    expect(uncheckedMenuItem.querySelector("[data-menu-checkmark]")).toHaveTextContent("");
  });
});
