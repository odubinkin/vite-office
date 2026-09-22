/**
 * @fileoverview Verifies deterministic command registration, shortcut lookup, dispatch outcomes, validation, and input preservation.
 */

import { describe, expect, it } from "vitest";
import { SfxRequest } from "./request";
import { SfxBoolItem, SfxInt16Item, SfxStringItem } from "../../../svl/source/items/poolitem";

import {
  SfxDispatcher,
  createCommandShell,
  createCommandRegistry,
  dispatchCommand,
  findCommandById,
  findCommandByShortcut,
  normalizeCommandShortcut,
  type CommandDefinition,
  type SfxShell,
} from "./dispatch";
import { SfxViewFrame } from "../view/viewfrm";

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
      shortcuts: ["Meta+G"],
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
    expect(registry.commands[0]?.shortcuts).toEqual(["Meta+G"]);
    expect(registry.commands[1]?.shortcut).toBe("Meta+S");
    expect(commands[0]?.shortcut).toBe(" shift + ctrl + g ");
    expect(normalizeCommandShortcut("option + Enter")).toBe("Alt+ENTER");
    expect(findCommandById(registry, "shared.greet")?.label).toBe("Greet");
    expect(findCommandById(registry, "missing")).toBeUndefined();
    expect(findCommandByShortcut(registry, "ctrl+shift+g")?.id).toBe("shared.greet");
    expect(findCommandByShortcut(registry, "cmd+g")?.id).toBe("shared.greet");
    expect(findCommandByShortcut(registry, "Alt+X")).toBeUndefined();
  });

  it("resolves command execution and state from the top of an Sfx shell stack" /** Verifies last-pushed priority, state queries, shortcut aliases, invalidation, frame ownership, and stack cleanup. @returns Nothing. */, function resolvesShellStack(): void {
    const dispatcher = new SfxDispatcher();
    const lowerContext = { enabled: true, name: "Lower" };
    const upperContext = { enabled: false, name: "Upper" };
    const lower = createCommandShell(lowerContext, createCommandRegistry(createCommands()));
    const upper = createCommandShell(
      upperContext,
      createCommandRegistry([
        {
          execute: greet,
          /** Reads the command owner's name. @param context - Active command context. @returns Context name. */
          getStateValue: (context): string => context.name,
          id: "shared.greet",
          /** Reports the deterministic toggle state. @returns True. */
          isChecked: (): boolean => true,
          label: "Upper greet",
          shortcut: "Alt+G",
        },
      ]),
    );
    const invalidations: number[] = [];
    const unsubscribe = dispatcher.Subscribe(
      /** Captures one dispatcher version after invalidation. @returns New capture length. */ () =>
        invalidations.push(dispatcher.GetVersion()),
    );
    dispatcher.Push(lower);
    dispatcher.Push(upper);
    expect(dispatcher.GetShell(0)).toBe(upper);
    expect(dispatcher.GetShell(1)).toBe(lower);
    expect(dispatcher.GetShell(2)).toBeUndefined();
    expect(dispatcher.Execute("shared.greet")).toMatchObject({
      status: "executed",
      value: "Hello Upper",
    });
    expect(dispatcher.QueryState("shared.greet")).toEqual({
      checked: true,
      enabled: true,
      value: "Upper",
    });
    expect(dispatcher.QueryState("missing")).toEqual({ enabled: false });
    expect(dispatcher.FindCommandByShortcut("alt+g")?.command.label).toBe("Upper greet");
    expect(
      dispatcher.GetCommands().map(
        /** Projects one command identity. @param command - Active command descriptor. @returns Stable ID. */
        (command) => command.id,
      ),
    ).toEqual(["shared.greet", "shared.save"]);
    expect(
      /** Attempts duplicate shell activation. @returns Nothing before the expected exception. */ () =>
        dispatcher.Push(upper),
    ).toThrow("SfxShell is already active.");
    expect(
      /** Attempts dependency-free invalidation. @returns Nothing before the expected exception. */ () =>
        dispatcher.Invalidate(),
    ).toThrow("Invalidation requires a dependency.");
    dispatcher.Pop(upper);
    expect(dispatcher.Execute("shared.greet")).toMatchObject({ value: "Hello Lower" });
    dispatcher.Pop(upper);
    unsubscribe();
    dispatcher.Invalidate("document");
    expect(invalidations).toEqual([1, 2, 3]);

    const frame = new SfxViewFrame<string>();
    frame.SetActiveView("first", [lower]);
    expect(frame.GetActiveView()).toBe("first");
    expect(frame.GetDispatcher().GetShell(0)).toBe(lower);
    frame.SetActiveView("second", [upper]);
    expect(frame.GetActiveView()).toBe("second");
    expect(frame.GetDispatcher().GetShell(0)).toBe(upper);
    frame.CloseView();
    expect(frame.GetActiveView()).toBeUndefined();
  });

  it("executes SfxRequest item arguments and records bounded return items" /** Verifies slot matching, sync and async completion, primitive return items, and rejection state. @returns Completion after asynchronous requests settle. */, async function executesRequests(): Promise<void> {
    const dispatcher = new SfxDispatcher();
    const requestArguments: unknown[] = [];
    const shell = createCommandShell(
      {},
      createCommandRegistry([
        {
          /** Captures request arguments and returns a boolean result. @param _context - Test context. @param arguments_ - Request arguments. @returns True. */
          execute: (_context, arguments_: unknown): boolean => {
            requestArguments.push(arguments_);
            return true;
          },
          id: ".uno:BooleanResult",
          label: "Boolean result",
          slotId: 101,
        },
        {
          /** Returns a string command result. @returns Result text. */
          execute: (): string => "done",
          id: ".uno:StringResult",
          label: "String result",
          slotId: 102,
        },
        {
          /** Returns a numeric command result. @returns Result number. */
          execute: (): number => 12,
          id: ".uno:NumberResult",
          label: "Number result",
          slotId: 103,
        },
        {
          /** Returns an unsupported complex result. @returns Complex result. */
          execute: (): Readonly<{ ok: boolean }> => ({ ok: true }),
          id: ".uno:ComplexResult",
          label: "Complex result",
          slotId: 104,
        },
        {
          /** Resolves an asynchronous command result. @returns Boolean promise. */
          execute: async (): Promise<boolean> => true,
          id: ".uno:AsyncResult",
          label: "Async result",
          slotId: 105,
        },
        {
          /** Rejects an asynchronous command result. @returns Rejected promise. */
          execute: async (): Promise<void> =>
            Promise.reject(Object.assign(new Error("request failed"), { code: "request-failed" })),
          id: ".uno:RejectedResult",
          label: "Rejected result",
          slotId: 106,
        },
      ]),
    );
    dispatcher.Push(shell);
    const argument = new SfxStringItem(201, "argument");
    const boolRequest = new SfxRequest(101, [argument]);
    expect(dispatcher.ExecuteRequest(boolRequest).status).toBe("executed");
    expect(dispatcher.QuerySlot(101)?.command.id).toBe(".uno:BooleanResult");
    expect(dispatcher.QuerySlotState(101)).toEqual({ enabled: true });
    expect(dispatcher.QuerySlotState(999)).toEqual({ enabled: false });
    expect(
      /** Sends a mismatched request directly to one resolved shell slot. @returns Nothing before the expected exception. */ () =>
        dispatcher.QuerySlot(101)?.execute(new SfxRequest(102)),
    ).toThrow("SfxRequest slot does not match command");
    expect(requestArguments).toEqual([[argument]]);
    expect(boolRequest.GetReturnValue()).toEqual(new SfxBoolItem(101, true));
    dispatcher.Execute(".uno:BooleanResult", [argument]);
    dispatcher.Execute(".uno:BooleanResult", true);
    dispatcher.Execute(".uno:BooleanResult", "argument");
    dispatcher.Execute(".uno:BooleanResult", 7);
    dispatcher.Execute(".uno:BooleanResult", { Name: "Argument" });
    expect(
      requestArguments
        .slice(1)
        .map(
          /** Reads the first converted argument value. @param items - Request item array. @returns First value. */ (
            items,
          ) => (items as SfxStringItem[])[0]?.QueryValue(),
        ),
    ).toEqual(["argument", true, "argument", 7, { Name: "Argument" }]);
    const stringRequest = new SfxRequest(102);
    dispatcher.ExecuteRequest(stringRequest);
    expect(stringRequest.GetReturnValue()).toEqual(new SfxStringItem(102, "done"));
    const numberRequest = new SfxRequest(103);
    dispatcher.ExecuteRequest(numberRequest);
    expect(numberRequest.GetReturnValue()).toEqual(new SfxInt16Item(103, 12));
    const complexRequest = new SfxRequest(104);
    dispatcher.ExecuteRequest(complexRequest);
    expect(complexRequest.IsDone()).toBe(true);
    expect(complexRequest.GetReturnValue()).toBeUndefined();
    const asyncRequest = new SfxRequest(105);
    const asyncResult = dispatcher.ExecuteRequest(asyncRequest);
    expect(asyncRequest.IsDone()).toBe(false);
    await expect(
      asyncResult.status === "executed" ? asyncResult.value : Promise.reject(new Error("missing")),
    ).resolves.toBe(true);
    expect(asyncRequest.GetReturnValue()).toEqual(new SfxBoolItem(105, true));
    const rejectedRequest = new SfxRequest(106);
    const rejectedResult = dispatcher.ExecuteRequest(rejectedRequest);
    await expect(
      rejectedResult.status === "executed"
        ? rejectedResult.value
        : Promise.reject(new Error("missing")),
    ).resolves.toBeUndefined();
    expect(rejectedRequest.IsDone()).toBe(true);
    expect(dispatcher.QueryState(".uno:RejectedResult").error).toBe("request failed");
    expect(dispatcher.GetLastCommandError()).toEqual({
      code: "request-failed",
      commandId: ".uno:RejectedResult",
      error: "request failed",
    });
    dispatcher.ExecuteRequest(new SfxRequest(101));
    expect(dispatcher.GetLastCommandError()).toBeUndefined();
    expect(dispatcher.ExecuteRequest(new SfxRequest(999))).toEqual({
      commandId: "slot:999",
      status: "missing",
    });
    expect(dispatcher.Execute(".uno:BooleanResult?ignored").status).toBe("executed");
    const sparseShell: SfxShell = {
      /** Deliberately exposes an unresolved slot to verify defensive enumeration. */
      slotIds: [999],
      /** Resolves no command. @returns Undefined. */
      ResolveSlot: () => undefined,
    };
    dispatcher.Push(sparseShell);
    expect(dispatcher.GetCommands()).toHaveLength(6);
    dispatcher.Pop(sparseShell);
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
      /** Attempts check-command registration without boolean state. @returns Invalid registry result; creation throws. */ () =>
        createCommandRegistry([
          {
            execute:
              /** Returns nothing for invalid registration fixtures. @returns Nothing. */ (): void =>
                undefined,
            id: "invalid.check",
            label: "Invalid check",
            presentation: {
              labelKey: "commands.invalid.check",
              placements: [],
              semantics: "check",
              stateType: "none",
            },
          },
        ]),
    ).toThrow("Check commands require boolean state.");
    expect(
      /** Registers a UNO command without a numeric slot. @returns Invalid registry. */ () =>
        createCommandRegistry([
          {
            /** Returns nothing for the invalid fixture. @returns Nothing. */
            execute: (): void => undefined,
            id: ".uno:MissingSlot",
            label: "Missing slot",
          },
        ]),
    ).toThrow("Command slot id is invalid");
    expect(
      /** Registers a browser command without a numeric slot. @returns Invalid registry. */ () =>
        createCommandRegistry([
          {
            /** Returns nothing for the invalid fixture. @returns Nothing. */
            execute: (): void => undefined,
            id: "vnd.vite-office.browser:MissingSlot",
            label: "Missing browser slot",
          },
        ]),
    ).toThrow("Command slot id is invalid");
    expect(
      /** Registers two command URLs for one slot instead of one request-driven handler. @returns Invalid registry. */ () =>
        createCommandRegistry([
          {
            /** Returns nothing for the first duplicate-slot fixture. @returns Nothing. */
            execute: (): void => undefined,
            id: ".uno:First",
            label: "First",
            slotId: 500,
          },
          {
            /** Returns nothing for the second duplicate-slot fixture. @returns Nothing. */
            execute: (): void => undefined,
            id: ".uno:Second",
            label: "Second",
            slotId: 500,
          },
        ]),
    ).toThrow("Duplicate command slot id");
    expect(
      /** Registers malformed command arguments. @returns Invalid registry. */ () =>
        createCommandRegistry([
          {
            /** Returns nothing for the invalid fixture. @returns Nothing. */
            execute: (): void => undefined,
            id: "invalid.arguments",
            label: "Invalid arguments",
            presentation: {
              argumentSchema: { description: " " },
              labelKey: "commands.invalid.arguments",
              placements: [],
              semantics: "action",
              stateType: "none",
            },
          },
        ]),
    ).toThrow("Command argument schema description must not be blank");
    expect(
      /** Attempts radio-command registration without radio state. @returns Invalid registry result; creation throws. */ () =>
        createCommandRegistry([
          {
            execute:
              /** Returns nothing for invalid registration fixtures. @returns Nothing. */ (): void =>
                undefined,
            id: "invalid.radio",
            label: "Invalid radio",
            presentation: {
              labelKey: "commands.invalid.radio",
              placements: [],
              semantics: "radio",
              stateType: "none",
            },
          },
        ]),
    ).toThrow("Radio commands require boolean or value state.");
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

  it("publishes pending and error state for asynchronous commands" /** Verifies pending and normalized error state for asynchronous execution. @returns Promise resolved after both rejection shapes are observed. */, async function tracksAsyncState(): Promise<void> {
    const dispatcher = new SfxDispatcher();
    const shell = createCommandShell(
      {},
      createCommandRegistry([
        {
          execute:
            /** Rejects after one microtask to expose pending state. @returns Rejected command promise. */ async (): Promise<void> => {
              await Promise.resolve();
              throw new Error("Denied");
            },
          id: "shared.async",
          label: "Async",
          presentation: {
            labelKey: "commands.shared.async",
            placements: ["toolbar/standard"],
            semantics: "action",
            stateType: "none",
          },
        },
        {
          execute:
            /** Rejects with a non-Error value to verify normalization. @returns Rejected command promise. */ async (): Promise<void> =>
              Promise.reject("String denied"),
          id: "shared.async-string",
          label: "Async string",
        },
      ]),
    );
    dispatcher.Push(shell);
    const result = dispatcher.Execute("shared.async");
    expect(dispatcher.QueryState("shared.async")).toMatchObject({ enabled: true, pending: true });
    if (result.status !== "executed") throw new Error("Async command must execute.");
    await result.value;
    expect(dispatcher.QueryState("shared.async")).toEqual({ enabled: true, error: "Denied" });
    const stringResult = dispatcher.Execute("shared.async-string");
    if (stringResult.status !== "executed") throw new Error("Async string command must execute.");
    await stringResult.value;
    expect(dispatcher.QueryState("shared.async-string")).toEqual({
      enabled: true,
      error: "String denied",
    });
  });
});
