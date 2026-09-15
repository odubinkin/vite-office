/** @fileoverview Verifies generic menubar defaults independently of Writer resources. */

import { render, screen } from "@testing-library/react";
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
});
