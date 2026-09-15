/** @fileoverview Verifies generic resource-driven toolbar projection. */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { BrowserCommandSource } from "./command-surface";
import { CommandButton, CommandToolbarItems, type CommandIcon } from "./CommandToolbar";

const definition = {
  execute: /** Implements the inert descriptor. @returns Undefined. */ () => undefined,
  id: ".uno:Known",
  label: "Known",
} as const;

/** Creates a deterministic Sfx-shaped command source. @returns Mock command source. */
function createCommandSource(): BrowserCommandSource {
  return {
    Execute: vi.fn(
      /** Returns deterministic dispatch. @param commandId - Command identity. @returns Executed result. */ (
        commandId,
      ) => ({
        commandId,
        status: "executed" as const,
        value: undefined,
      }),
    ),
    QueryCommand: vi.fn(
      /** Resolves only the known descriptor. @param commandId - Command identity. @returns Descriptor or undefined. */ (
        commandId,
      ) => (commandId === definition.id ? definition : undefined),
    ),
    QueryState: vi.fn(
      /** Returns active deterministic state. @returns Checked enabled state. */ () => ({
        checked: true,
        enabled: true,
      }),
    ),
  };
}

/** Minimal icon used to cover framework-owned icon projection. @returns Icon element. */
const TestIcon: CommandIcon =
  /** Renders the test icon. @param props - Icon attributes. @returns SVG icon. */ (props) => (
    <svg data-testid="command-icon" {...props} />
  );

describe("CommandToolbar", /** Groups generic toolbar behavior. @returns Nothing. */ function defineCommandToolbarTests(): void {
  it("omits unresolved commands and dispatches a resolved label button", /** Verifies resolution and dispatch. @returns Nothing. */ function dispatchesResolvedButton(): void {
    const commandSource = createCommandSource();
    const { rerender } = render(
      <CommandButton
        commandId=".uno:Missing"
        commandSource={commandSource}
        getCommandResource={
          /** Returns missing resource metadata. @returns Command resource. */ () => ({
            label: "Missing",
            semantics: "action",
          })
        }
        resolveArguments={/** Resolves no arguments. @returns Undefined. */ () => undefined}
      />,
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();

    rerender(
      <CommandButton
        commandId={definition.id}
        commandSource={commandSource}
        getCommandResource={
          /** Returns checked resource metadata. @returns Command resource. */ () => ({
            label: "Known",
            semantics: "check",
          })
        }
        resolveArguments={
          /** Resolves deterministic toolbar arguments. @returns Dispatch arguments. */ () => ({
            source: "toolbar",
          })
        }
      />,
    );
    const button = screen.getByRole("button", { name: "Known" });
    expect(button).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(button);
    expect(commandSource.Execute).toHaveBeenCalledWith(definition.id, { source: "toolbar" });
  });

  it("renders separators, icons, content, and delegated select placements", /** Verifies all generic placement projections. @returns Nothing. */ function rendersToolbarPlacements(): void {
    const commandSource = createCommandSource();
    const { rerender } = render(
      <CommandToolbarItems
        commandSource={commandSource}
        getButtonContent={
          /** Returns deterministic text content. @returns Button content. */ () => "Content"
        }
        getCommandResource={
          /** Returns action resource metadata. @returns Command resource. */ () => ({
            label: "Known",
            semantics: "action",
          })
        }
        icons={new Map([[definition.id, TestIcon]])}
        items={[
          { kind: "separator" },
          { commandId: definition.id, kind: "command" },
          { kind: "font-select" },
        ]}
        renderSpecialItem={
          /** Renders one delegated selector. @param _item - Special placement. @param index - Resource index. @returns Selector marker. */ (
            _item,
            index,
          ) => <span key={index}>Special {index}</span>
        }
        resolveArguments={/** Resolves no arguments. @returns Undefined. */ () => undefined}
      />,
    );
    expect(screen.getByText("Content")).toBeVisible();
    expect(screen.queryByTestId("command-icon")).not.toBeInTheDocument();
    expect(screen.getByText("Special 2")).toBeVisible();

    rerender(
      <CommandToolbarItems
        commandSource={commandSource}
        getCommandResource={
          /** Returns action resource metadata. @returns Command resource. */ () => ({
            label: "Known",
            semantics: "action",
          })
        }
        icons={new Map([[definition.id, TestIcon]])}
        items={[{ commandId: definition.id, kind: "command" }, { kind: "command-select" }]}
        resolveArguments={/** Resolves no arguments. @returns Undefined. */ () => undefined}
      />,
    );
    expect(screen.getByTestId("command-icon")).toBeInTheDocument();
    expect(screen.queryByText("Special 1")).not.toBeInTheDocument();
  });
});
