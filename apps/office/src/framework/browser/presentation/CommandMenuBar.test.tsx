/** @fileoverview Verifies generic menubar defaults independently of Writer resources. */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { BrowserCommandSource } from "./command-surface";
import { CommandMenuBar } from "./CommandMenuBar";

describe("CommandMenuBar", /** Groups generic menubar behavior. @returns Nothing. */ function defineCommandMenuBarTests(): void {
  it("uses placement labels when no localization adapter is supplied", /** Verifies the generated-label default. @returns Nothing. */ function usesFallbackLabel(): void {
    const commandSource: BrowserCommandSource = {
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
      QueryState: vi.fn(
        /** Returns deterministic disabled state. @returns Disabled command state. */ () => ({
          enabled: false,
        }),
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
      QueryState: vi.fn(
        /** Returns deterministic disabled state. @returns Disabled command state. */ () => ({
          enabled: false,
        }),
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
      QueryState: vi.fn(
        /** Returns an enabled command state. @returns Current command state. */ () => ({
          checked: isChecked,
          enabled: true,
        }),
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
