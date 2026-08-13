/**
 * @fileoverview Defines browser-independent typed command registration, shortcut lookup, and explicit dispatch outcomes at the LibreOffice `framework/source/dispatch/dispatchprovider.cxx` ownership boundary.
 */

/** Describes one immutable executable command with a context-specific handler. */
export interface CommandDefinition<Context, Result = unknown> {
  /** Stable non-blank command identifier selected by the owning domain. */
  readonly id: string;
  /** Non-blank human-readable label for future accessible command surfaces. */
  readonly label: string;
  /** Optional platform-neutral shortcut normalized during registry creation. */
  readonly shortcut?: string;
  /** Optional predicate evaluated at dispatch time without mutating context. */
  readonly isEnabled?: (context: Context) => boolean;
  /** Handler that returns a command-owned result after availability succeeds. */
  readonly execute: (context: Context) => Result;
}

/** Describes an immutable ordered registry of commands sharing one context type. */
export interface CommandRegistry<Context> {
  /** Copied ordered command definitions with canonical shortcut strings. */
  readonly commands: readonly CommandDefinition<Context>[];
}

/** Describes the successful execution of a registered command. */
export interface ExecutedCommandResult<Result> {
  /** Stable command identifier whose handler ran. */
  readonly commandId: string;
  /** Caller-owned value returned by the selected handler. */
  readonly value: Result;
  /** Discriminant proving a handler ran. */
  readonly status: "executed";
}

/** Describes a dispatch request without a registered command. */
export interface MissingCommandResult {
  /** Caller-supplied identifier that was not registered. */
  readonly commandId: string;
  /** Discriminant proving no handler ran. */
  readonly status: "missing";
}

/** Describes a registered command rejected by its availability predicate. */
export interface DisabledCommandResult {
  /** Stable command identifier whose handler did not run. */
  readonly commandId: string;
  /** Discriminant proving the command was disabled. */
  readonly status: "disabled";
}

/** Represents every deterministic result from attempting a command dispatch. */
export type CommandDispatchResult<Result> =
  DisabledCommandResult | ExecutedCommandResult<Result> | MissingCommandResult;

/** Maps accepted shortcut modifier aliases to their canonical display labels. */
const modifierAliases = new Map<string, string>([
  ["alt", "Alt"],
  ["cmd", "Meta"],
  ["command", "Meta"],
  ["control", "Ctrl"],
  ["ctrl", "Ctrl"],
  ["meta", "Meta"],
  ["option", "Alt"],
  ["shift", "Shift"],
]);

/** Establishes the deterministic display order for canonical shortcut modifiers. */
const modifierOrder = ["Ctrl", "Alt", "Shift", "Meta"] as const;

/**
 * Creates an immutable registry after validating unique IDs and normalized shortcuts.
 *
 * @param commands - Caller-owned definitions copied without mutation.
 * @returns Ordered registry with normalized shortcut strings.
 * @throws {Error} When an identity or label is blank, or an ID or shortcut collides.
 */
export function createCommandRegistry<Context>(
  commands: readonly CommandDefinition<Context>[],
): CommandRegistry<Context> {
  const ids = new Set<string>();
  const shortcuts = new Set<string>();
  return {
    commands: commands.map(
      /**
       * Validates and copies one command into the registry result.
       *
       * @param command - Caller-owned definition inspected without mutation.
       * @returns Copied command with a canonical shortcut when configured.
       * @throws {Error} When identity, label, or shortcut collides with an earlier command.
       */
      function copyCommand(command): CommandDefinition<Context> {
        assertNonBlank(command.id, "Command id");
        assertNonBlank(command.label, "Command label");
        if (ids.has(command.id)) throw new Error(`Duplicate command id: ${command.id}`);
        ids.add(command.id);
        const shortcut =
          command.shortcut === undefined ? undefined : normalizeCommandShortcut(command.shortcut);
        if (shortcut !== undefined && shortcuts.has(shortcut))
          throw new Error(`Duplicate command shortcut: ${shortcut}`);
        if (shortcut !== undefined) shortcuts.add(shortcut);
        return shortcut === undefined ? { ...command } : { ...command, shortcut };
      },
    ),
  };
}

/**
 * Looks up a registered command by exact stable identifier.
 *
 * @param registry - Immutable registry to inspect without mutation.
 * @param commandId - Exact command identity supplied by the caller.
 * @returns Matching command or undefined when no identity is registered.
 */
export function findCommandById<Context>(
  registry: CommandRegistry<Context>,
  commandId: string,
): CommandDefinition<Context> | undefined {
  return registry.commands.find(
    /**
     * Tests one command identity against the requested identifier.
     *
     * @param command - Immutable registered command to inspect.
     * @returns True only for the command owning commandId.
     */
    function hasCommandId(command): boolean {
      return command.id === commandId;
    },
  );
}

/**
 * Looks up a registered command through the same shortcut normalization used at registration.
 *
 * @param registry - Immutable registry to inspect without mutation.
 * @param shortcut - Human-entered shortcut with one non-modifier key.
 * @returns Matching command or undefined when no command owns the shortcut.
 * @throws {Error} When shortcut is malformed.
 */
export function findCommandByShortcut<Context>(
  registry: CommandRegistry<Context>,
  shortcut: string,
): CommandDefinition<Context> | undefined {
  const normalizedShortcut = normalizeCommandShortcut(shortcut);
  return registry.commands.find(
    /**
     * Tests one normalized registered shortcut against the requested shortcut.
     *
     * @param command - Immutable registered command to inspect.
     * @returns True only for the command owning normalizedShortcut.
     */
    function hasShortcut(command): boolean {
      return command.shortcut === normalizedShortcut;
    },
  );
}

/**
 * Dispatches a registered command and returns explicit missing, disabled, or executed state.
 *
 * @param registry - Immutable registry providing a command handler.
 * @param commandId - Exact command identity selected for dispatch.
 * @param context - Caller-owned context forwarded unchanged to predicates and handlers.
 * @returns Deterministic command outcome; missing and disabled paths never invoke a handler.
 */
export function dispatchCommand<Context>(
  registry: CommandRegistry<Context>,
  commandId: string,
  context: Context,
): CommandDispatchResult<unknown> {
  const command = findCommandById(registry, commandId);
  if (command === undefined) return { commandId, status: "missing" };
  if (command.isEnabled !== undefined && !command.isEnabled(context))
    return { commandId: command.id, status: "disabled" };
  return { commandId: command.id, status: "executed", value: command.execute(context) };
}

/**
 * Converts one human-entered shortcut into deterministic modifier ordering and key casing.
 *
 * @param shortcut - Plus-separated modifiers and exactly one primary non-modifier key.
 * @returns Canonical shortcut such as Ctrl+Shift+K.
 * @throws {Error} When any segment is blank, a modifier repeats, or primary key count is not one.
 */
export function normalizeCommandShortcut(shortcut: string): string {
  const parts = shortcut.split("+").map(
    /**
     * Removes insignificant whitespace from one shortcut segment.
     *
     * @param part - Raw plus-separated shortcut segment.
     * @returns Trimmed segment retaining its source characters.
     */
    function trimPart(part): string {
      return part.trim();
    },
  );
  if (
    parts.some(
      /**
       * Detects an empty shortcut segment.
       *
       * @param part - Trimmed segment to inspect.
       * @returns True only for an empty segment.
       */
      function isEmpty(part): boolean {
        return part.length === 0;
      },
    )
  )
    throw new Error("Command shortcut must not contain empty parts.");
  const modifiers = new Set<string>();
  const keys: string[] = [];
  for (const part of parts) {
    const modifier = modifierAliases.get(part.toLowerCase());
    if (modifier === undefined) keys.push(part.toUpperCase());
    else if (modifiers.has(modifier))
      throw new Error(`Command shortcut repeats modifier: ${modifier}`);
    else modifiers.add(modifier);
  }
  if (keys.length !== 1)
    throw new Error("Command shortcut must contain exactly one non-modifier key.");
  return [
    ...modifierOrder.filter(
      /**
       * Preserves only modifiers present in the input shortcut.
       *
       * @param modifier - Canonical modifier in stable display order.
       * @returns True only when modifier occurred in the input.
       */
      function isPresent(modifier): boolean {
        return modifiers.has(modifier);
      },
    ),
    keys[0],
  ].join("+");
}

/**
 * Rejects blank command identities and labels before public registry creation.
 *
 * @param value - Candidate text inspected without mutation.
 * @param label - Field name included in a deterministic error message.
 * @returns Nothing; invalid input throws.
 * @throws {Error} When value contains only whitespace.
 */
function assertNonBlank(value: string, label: string): void {
  if (value.trim().length === 0) throw new Error(`${label} must not be blank.`);
}
