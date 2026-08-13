/**
 * @fileoverview Verifies deterministic command registration, shortcut lookup, dispatch outcomes, validation, and input preservation.
 */

import { describe, expect, it } from "vitest";

import {
  createCommandRegistry,
  dispatchCommand,
  findCommandById,
  findCommandByShortcut,
  normalizeCommandShortcut,
  type CommandDefinition,
} from "./dispatchprovider";

/** Describes immutable context supplied to representative command handlers. */
interface CommandContext {
  /** Whether the save command is available. */
  readonly enabled: boolean;
  /** Name included in deterministic handler output. */
  readonly name: string;
}

/**
 * Returns deterministic greeting output for the provided context.
 *
 * @param context - Immutable command context supplied by dispatch.
 * @returns Greeting text containing context.name.
 */
function greet(context: CommandContext): string {
  return `Hello ${context.name}`;
}

/**
 * Returns deterministic save output for the provided context.
 *
 * @param context - Immutable command context supplied by dispatch.
 * @returns Save text containing context.name.
 */
function save(context: CommandContext): string {
  return `Saved ${context.name}`;
}

/**
 * Reads the availability flag without mutating the command context.
 *
 * @param context - Immutable command context supplied by dispatch.
 * @returns True only when the save command is enabled.
 */
function isSaveEnabled(context: CommandContext): boolean {
  return context.enabled;
}

/**
 * Creates representative enabled and gated command definitions.
 *
 * @returns Caller-owned ordered command definitions.
 */
function createCommands(): readonly CommandDefinition<CommandContext>[] {
  return [
    {
      execute: greet,
      id: "shared.greet",
      label: "Greet",
      shortcut: " shift + ctrl + g ",
    },
    {
      execute: save,
      id: "shared.save",
      isEnabled: isSaveEnabled,
      label: "Save",
      shortcut: "Cmd+S",
    },
  ];
}

describe("command registry" /**
 * Groups pure registry, lookup, dispatch, and validation behavior.
 *
 * @returns Nothing; Vitest registers enclosed cases.
 */, function defineCommandTests(): void {
  it("copies commands, normalizes shortcuts, and looks up present or absent values" /**
   * Verifies deterministic order, caller-input preservation, shortcut aliases, and lookup outcomes.
   *
   * @returns Nothing; assertions validate registry behavior.
   */, function registersAndFindsCommands(): void {
    const commands = createCommands();
    const registry = createCommandRegistry(commands);
    expect(registry.commands).toHaveLength(2);
    expect(registry.commands[0]).not.toBe(commands[0]);
    expect(registry.commands[0]?.shortcut).toBe("Ctrl+Shift+G");
    expect(registry.commands[1]?.shortcut).toBe("Meta+S");
    expect(commands[0]?.shortcut).toBe(" shift + ctrl + g ");
    expect(normalizeCommandShortcut("option + Enter")).toBe("Alt+ENTER");
    expect(findCommandById(registry, "shared.greet")?.label).toBe("Greet");
    expect(findCommandById(registry, "missing")).toBeUndefined();
    expect(findCommandByShortcut(registry, "ctrl+shift+g")?.id).toBe("shared.greet");
    expect(findCommandByShortcut(registry, "Alt+X")).toBeUndefined();
  });

  it("returns explicit dispatch outcomes and rejects invalid registry input" /**
   * Verifies executed, disabled, missing, blank, duplicate, and malformed-shortcut paths.
   *
   * @returns Nothing; assertions validate every public error and outcome class.
   */, function dispatchesAndRejectsCommands(): void {
    const registry = createCommandRegistry(createCommands());
    expect(dispatchCommand(registry, "shared.greet", { enabled: false, name: "Ada" })).toEqual({
      commandId: "shared.greet",
      status: "executed",
      value: "Hello Ada",
    });
    expect(dispatchCommand(registry, "shared.save", { enabled: false, name: "Ada" })).toEqual({
      commandId: "shared.save",
      status: "disabled",
    });
    expect(dispatchCommand(registry, "missing", { enabled: true, name: "Ada" })).toEqual({
      commandId: "missing",
      status: "missing",
    });
    expect(
      /**
       * Attempts blank command registration.
       *
       * @returns Invalid registry result; creation throws.
       */ function blankId(): unknown {
        return createCommandRegistry([
          {
            execute:
              /** Returns nothing for invalid registration fixtures. @returns Nothing. */ function empty(): void {},
            id: " ",
            label: "Blank",
          },
        ]);
      },
    ).toThrowError();
    expect(
      /**
       * Attempts duplicate command identity registration.
       *
       * @returns Invalid registry result; creation throws.
       */ function duplicateId(): unknown {
        return createCommandRegistry([
          {
            execute:
              /** Returns nothing for invalid registration fixtures. @returns Nothing. */ function one(): void {},
            id: "same",
            label: "One",
          },
          {
            execute:
              /** Returns nothing for invalid registration fixtures. @returns Nothing. */ function two(): void {},
            id: "same",
            label: "Two",
          },
        ]);
      },
    ).toThrowError();
    expect(
      /**
       * Attempts normalized shortcut collision registration.
       *
       * @returns Invalid registry result; creation throws.
       */ function duplicateShortcut(): unknown {
        return createCommandRegistry([
          {
            execute:
              /** Returns nothing for invalid registration fixtures. @returns Nothing. */ function one(): void {},
            id: "one",
            label: "One",
            shortcut: "Ctrl+K",
          },
          {
            execute:
              /** Returns nothing for invalid registration fixtures. @returns Nothing. */ function two(): void {},
            id: "two",
            label: "Two",
            shortcut: "control + k",
          },
        ]);
      },
    ).toThrowError();
    expect(
      /**
       * Attempts malformed shortcut normalization variants.
       *
       * @returns Invalid shortcut result; normalization throws.
       */ function malformedShortcut(): string {
        return normalizeCommandShortcut("Ctrl+Ctrl+K");
      },
    ).toThrowError();
    expect(
      /**
       * Attempts a shortcut without a primary key.
       *
       * @returns Invalid shortcut result; normalization throws.
       */ function modifierOnlyShortcut(): string {
        return normalizeCommandShortcut("Ctrl+Shift");
      },
    ).toThrowError();
    expect(
      /**
       * Attempts a shortcut with an empty segment.
       *
       * @returns Invalid shortcut result; normalization throws.
       */ function emptyShortcutPart(): string {
        return normalizeCommandShortcut("Ctrl++K");
      },
    ).toThrowError();
  });
});
