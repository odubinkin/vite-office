/**
 * @fileoverview Defines browser-independent typed command registration, shortcut lookup, and explicit dispatch outcomes at the LibreOffice `framework/source/dispatch/dispatchprovider.cxx` ownership boundary.
 */

import { SfxBindings } from "../../../sfx2/source/control/bindings";
import { SfxRequest } from "../../../sfx2/source/control/request";
import {
  SfxBoolItem,
  SfxInt16Item,
  SfxStringItem,
  SfxUnoAnyItem,
  SfxPoolItem,
} from "../../../svl/source/items/poolitem";

/** Identifies the shell layer that owns one command handler. */
export type CommandTarget = "application" | "frame" | "shell" | "view";

/** Declares whether a command participates in document undo recording. */
export type CommandUndoPolicy = "none" | "record";

/** Represents the UI state returned by the shell that currently resolves a command. */
export interface CommandState<Value = unknown> {
  /** Whether dispatch may execute the command in the current shell context. */
  readonly enabled: boolean;
  /** Error retained from the most recent asynchronous execution, when one failed. */
  readonly error?: string;
  /** Whether an asynchronous execution of this command is still active. */
  readonly pending?: boolean;
  /** Optional boolean toggle state used by menus and toolbars. */
  readonly checked?: boolean;
  /** Whether a toggle covers a selection with both applied and unapplied values. */
  readonly mixed?: boolean;
  /** Optional typed state value used by selectors such as paragraph style. */
  readonly value?: Value;
}

/** Presentation-neutral metadata shared by menus, toolbars, and accelerators. */
export interface CommandPresentation {
  /** Optional runtime argument contract used at presentation adapter boundaries. */
  readonly argumentSchema?: Readonly<{ readonly description: string }>;
  /** Stable message-catalog identity; the current browser shell may resolve it to label. */
  readonly labelKey: string;
  /** UI resources that place this command without owning its behavior. */
  readonly placements: readonly string[];
  /** Stable value represented by a radio command in selector presentations. */
  readonly selectionValue?: string;
  /** Check/radio behavior expected from every presentation surface. */
  readonly semantics: "action" | "check" | "radio";
  /** Shape exposed by command state queries. */
  readonly stateType: "boolean" | "none" | "value";
}

/** Describes one immutable executable command with a context-specific handler. */
export interface CommandDefinition<Context, Result = unknown, Arguments = unknown> {
  /** Parity capability that owns the implemented command behavior. */
  readonly capabilityId?: `CAP-${string}`;
  /** Optional debug label separate from the reader-facing command label. */
  readonly debugLabel?: string;
  /** Stable non-blank command identifier selected by the owning domain. */
  readonly id: string;
  /** Numeric slot identity generated from the pinned HRC/SDI declaration. */
  readonly slotId?: number;
  /** State dependencies invalidated after relevant document or view changes. */
  readonly invalidates?: readonly string[];
  /** Non-blank human-readable label for future accessible command surfaces. */
  readonly label: string;
  /** Shared presentation contract; legacy non-UI registries may omit it. */
  readonly presentation?: CommandPresentation;
  /** Optional platform-neutral shortcut normalized during registry creation. */
  readonly shortcut?: string;
  /** Optional additional shortcuts that resolve to this same command identity. */
  readonly shortcuts?: readonly string[];
  /** Shell layer that owns command execution and state. */
  readonly target?: CommandTarget;
  /** Undo recording contract for the command. */
  readonly undoPolicy?: CommandUndoPolicy;
  /** Optional predicate evaluated at dispatch time without mutating context. */
  readonly isEnabled?: (context: Context) => boolean;
  /** Optional checked-state predicate evaluated through the resolving shell. */
  readonly isChecked?: (context: Context) => boolean;
  /** Optional mixed-state predicate evaluated through the resolving shell. */
  readonly isMixed?: (context: Context) => boolean;
  /** Optional state selector evaluated through the resolving shell. */
  readonly getStateValue?: (context: Context) => unknown;
  /** Handler that returns a command-owned result after availability succeeds. */
  readonly execute: (context: Context, arguments_: Arguments) => Result;
}

/** Describes an immutable ordered registry of commands sharing one context type. */
export interface CommandRegistry<Context> {
  /** Copied ordered command definitions with canonical shortcut strings. */
  readonly commands: readonly CommandDefinition<Context>[];
}

/** Binds typed registry context behind the non-generic shell-stack contract. */
export interface SfxShell {
  /** Stable registered command identities in descriptor order. */
  readonly commandIds: readonly string[];
  /** Resolves a command against this shell, or returns undefined so lower shells may answer. */
  readonly ResolveCommand: (commandId: string) => ResolvedShellCommand | undefined;
}

/** Represents one command already bound to the shell context that owns it. */
export interface ResolvedShellCommand {
  /** Immutable registered descriptor used for diagnostics and shortcut lookup. */
  readonly command: CommandDefinition<unknown, unknown, unknown>;
  /** Executes through the owning shell context. */
  readonly execute: (arguments_?: unknown) => CommandDispatchResult<unknown>;
  /** Queries enabled, checked, and value state through the owning shell context. */
  readonly getState: () => CommandState;
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
        if (
          (command.id.startsWith(".uno:") || command.id.startsWith("vnd.vite-office.browser:")) &&
          (!Number.isInteger(command.slotId) || (command.slotId ?? 0) <= 0)
        )
          throw new Error(`Command slot id is invalid: ${command.id}`);
        assertNonBlank(command.label, "Command label");
        if (command.presentation !== undefined) {
          assertNonBlank(command.presentation.labelKey, "Command label key");
          if (
            command.presentation.semantics === "check" &&
            command.presentation.stateType !== "boolean"
          )
            throw new Error("Check commands require boolean state.");
          if (
            command.presentation.semantics === "radio" &&
            command.presentation.stateType === "none"
          )
            throw new Error("Radio commands require boolean or value state.");
          for (const placement of command.presentation.placements)
            assertNonBlank(placement, "Command placement");
          if (command.presentation.argumentSchema !== undefined)
            assertNonBlank(
              command.presentation.argumentSchema.description,
              "Command argument schema description",
            );
        }
        if (ids.has(command.id)) throw new Error(`Duplicate command id: ${command.id}`);
        ids.add(command.id);
        const normalizedShortcuts = [
          ...(command.shortcut === undefined ? [] : [command.shortcut]),
          ...(command.shortcuts ?? []),
        ].map(normalizeCommandShortcut);
        for (const shortcut of normalizedShortcuts) {
          if (shortcuts.has(shortcut)) throw new Error(`Duplicate command shortcut: ${shortcut}`);
          shortcuts.add(shortcut);
        }
        const [shortcut, ...additionalShortcuts] = normalizedShortcuts;
        return {
          ...command,
          ...(shortcut === undefined ? {} : { shortcut }),
          ...(additionalShortcuts.length === 0 ? {} : { shortcuts: additionalShortcuts }),
        };
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
      return (
        command.shortcut === normalizedShortcut ||
        (command.shortcuts?.includes(normalizedShortcut) ?? false)
      );
    },
  );
}

/**
 * Dispatches a registered command and returns explicit missing, disabled, or executed state.
 *
 * @param registry - Immutable registry providing a command handler.
 * @param commandId - Exact command identity selected for dispatch.
 * @param context - Caller-owned context forwarded unchanged to predicates and handlers.
 * @param arguments_ - Optional command arguments forwarded unchanged to the handler.
 * @returns Deterministic command outcome; missing and disabled paths never invoke a handler.
 */
export function dispatchCommand<Context>(
  registry: CommandRegistry<Context>,
  commandId: string,
  context: Context,
  arguments_?: unknown,
): CommandDispatchResult<unknown> {
  const command = findCommandById(registry, commandId);
  if (command === undefined) return { commandId, status: "missing" };
  if (command.isEnabled !== undefined && !command.isEnabled(context))
    return { commandId: command.id, status: "disabled" };
  return {
    commandId: command.id,
    status: "executed",
    value: command.execute(context, arguments_),
  };
}

/** Creates an upstream-shaped shell whose registered commands remain bound to one context. @param context - Long-lived command owner. @param registry - Immutable command registry for that owner. @returns Shell suitable for an SfxDispatcher stack. */
export function createCommandShell<Context>(
  context: Context,
  registry: CommandRegistry<Context>,
): SfxShell {
  return {
    commandIds: registry.commands.map(
      /** Projects one stable command identity for shell-stack enumeration. @param command - Registered command. @returns Command ID. */
      function getCommandId(command): string {
        return command.id;
      },
    ),
    /** Resolves one registry command against the retained context. @param commandId - Stable command ID. @returns Bound command or undefined. */
    ResolveCommand: function resolveCommand(commandId): ResolvedShellCommand | undefined {
      const command = findCommandById(registry, commandId);
      if (command === undefined) return undefined;
      return {
        command: command as CommandDefinition<unknown, unknown, unknown>,
        /** Executes with retained shell context. @param arguments_ - Caller command arguments. @returns Dispatch result. */
        execute: function executeResolvedCommand(arguments_): CommandDispatchResult<unknown> {
          return dispatchCommand(registry, commandId, context, arguments_);
        },
        /** Queries state with retained shell context. @returns Current command state. */
        getState: function getResolvedCommandState(): CommandState {
          return {
            enabled: command.isEnabled?.(context) ?? true,
            ...(command.isChecked === undefined ? {} : { checked: command.isChecked(context) }),
            ...(command.isMixed === undefined ? {} : { mixed: command.isMixed(context) }),
            ...(command.getStateValue === undefined
              ? {}
              : { value: command.getStateValue(context) }),
          };
        },
      };
    },
  };
}

/**
 * Resolves slot-like commands from the top of a last-pushed-first shell stack.
 *
 * This follows the pinned SfxDispatcher contract where GetShell(0) is the last
 * pushed shell and command lookup stops at the first shell providing the slot.
 */
export class SfxDispatcher {
  private readonly asyncStates = new Map<string, Readonly<{ error?: string; pending: boolean }>>();
  private lastCommandError: Readonly<{ commandId: string; error: string }> | undefined;
  private readonly listeners = new Set<() => void>();
  private readonly shells: SfxShell[] = [];
  private version = 0;

  /** Pushes one shell to the top of the dispatch stack. @param shell - Context shell becoming highest priority. @returns Nothing. */
  public Push(shell: SfxShell): void {
    if (this.shells.includes(shell)) throw new Error("SfxShell is already active.");
    this.shells.push(shell);
    this.Invalidate("shell-stack");
  }

  /** Removes one active shell from the stack. @param shell - Exact shell identity to remove. @returns Nothing. */
  public Pop(shell: SfxShell): void {
    const index = this.shells.lastIndexOf(shell);
    if (index < 0) return;
    this.shells.splice(index, 1);
    this.Invalidate("shell-stack");
  }

  /** Returns a shell counted from the top, where zero is the last pushed shell. @param index - Zero-based stack level. @returns Active shell or undefined. */
  public GetShell(index: number): SfxShell | undefined {
    return this.shells[this.shells.length - index - 1];
  }

  /** Finds the highest-priority shell command for one stable ID. @param commandId - Command identity to resolve. @returns Bound command or undefined. */
  public QueryDispatch(commandId: string): ResolvedShellCommand | undefined {
    for (let index = 0; index < this.shells.length; index += 1) {
      const command = this.GetShell(index)?.ResolveCommand(commandId);
      if (command !== undefined) return command;
    }
    return undefined;
  }

  /** Executes the command resolved from the active shell stack. @param commandId - Stable slot-like identity. @param arguments_ - Typed caller arguments forwarded unchanged. @returns Explicit dispatch outcome. */
  public Execute(commandId: string, arguments_?: unknown): CommandDispatchResult<unknown> {
    const command = this.QueryDispatch(commandId);
    if (command === undefined) return { commandId, status: "missing" };
    const slot = command.command.slotId ?? 1;
    const request = new SfxRequest(slot, createRequestArguments(slot, arguments_));
    return this.ExecuteRequest(commandId, request);
  }

  /** Executes a caller-owned SfxRequest and records its return item. @param commandId - Canonical command URL. @param request - Slot request and item arguments. @returns Explicit dispatch outcome. */
  public ExecuteRequest(commandId: string, request: SfxRequest): CommandDispatchResult<unknown> {
    const command = this.QueryDispatch(commandId);
    if (command === undefined) return { commandId, status: "missing" };
    if (command.command.slotId !== undefined && request.GetSlot() !== command.command.slotId)
      throw new Error(`SfxRequest slot does not match command: ${commandId}`);
    this.lastCommandError = undefined;
    const result = command.execute(request.GetArgs());
    if (result.status === "executed" && !isPromiseLike(result.value))
      request.Done(createRequestReturnItem(request.GetSlot(), result.value));
    if (result.status !== "executed" || !isPromiseLike(result.value)) return result;
    this.asyncStates.set(commandId, { pending: true });
    this.Invalidate("command-async");
    const tracked = Promise.resolve(result.value).then(
      /** Clears pending state after fulfillment. @param value - Fulfilled command value. @returns Original command value. */
      (value) => {
        this.asyncStates.delete(commandId);
        request.Done(createRequestReturnItem(request.GetSlot(), value));
        this.Invalidate("command-async");
        return value;
      },
      /** Publishes a normalized asynchronous failure. @param error - Rejected command value. @returns Undefined after recording the failure. */
      (error: unknown) => {
        const message = getErrorMessage(error);
        this.asyncStates.set(commandId, { error: message, pending: false });
        this.lastCommandError = { commandId, error: message };
        request.Done();
        this.Invalidate("command-async");
        return undefined;
      },
    );
    return { ...result, value: tracked };
  }

  /** Returns the most recent asynchronous command failure, independent of Writer presentation. @returns Command identity and normalized error. */
  public GetLastCommandError(): Readonly<{ commandId: string; error: string }> | undefined {
    return this.lastCommandError;
  }

  /** Queries the active shell state for one command. @param commandId - Stable slot-like identity. @returns Disabled state when no shell provides the command. */
  public QueryState(commandId: string): CommandState {
    const state = this.QueryDispatch(commandId)?.getState();
    if (state === undefined) return { enabled: false };
    const asyncState = this.asyncStates.get(commandId);
    return {
      ...state,
      enabled: state.enabled,
      ...(asyncState?.error === undefined ? {} : { error: asyncState.error }),
      ...(asyncState?.pending === true ? { pending: true } : {}),
    };
  }

  /** Returns every active command once, honoring top-shell shadowing. @returns Commands in shell-priority and registration order. */
  public GetCommands(): readonly CommandDefinition<unknown, unknown, unknown>[] {
    const commands: CommandDefinition<unknown, unknown, unknown>[] = [];
    const ids = new Set<string>();
    for (let shellIndex = 0; shellIndex < this.shells.length; shellIndex += 1) {
      const shell = this.GetShell(shellIndex) as SfxShell;
      for (const commandId of shell.commandIds) {
        if (ids.has(commandId)) continue;
        const command = shell.ResolveCommand(commandId)?.command;
        if (command !== undefined) {
          ids.add(commandId);
          commands.push(command);
        }
      }
    }
    return commands;
  }

  /** Finds one command by normalized shortcut across active shells. @param shortcut - Browser-adapted shortcut. @returns Highest-priority matching command. */
  public FindCommandByShortcut(shortcut: string): ResolvedShellCommand | undefined {
    const normalized = normalizeCommandShortcut(shortcut);
    for (const command of this.GetCommands()) {
      if (command.shortcut === normalized || command.shortcuts?.includes(normalized))
        return this.QueryDispatch(command.id);
    }
    return undefined;
  }

  /** Publishes centralized command-state invalidation. @param dependencies - Changed state dependency labels. @returns Nothing. */
  public Invalidate(...dependencies: readonly string[]): void {
    if (dependencies.length === 0) throw new Error("Invalidation requires a dependency.");
    this.version += 1;
    for (const listener of this.listeners) listener();
  }

  /** Returns the monotonic dispatcher invalidation version. @returns Current version. */
  public GetVersion(): number {
    return this.version;
  }

  /** Subscribes to command-state invalidation. @param listener - Callback invoked after invalidation. @returns Cleanup removing the listener. */
  public Subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return /** Removes the registered invalidation listener. @returns Whether the listener was present. */ () =>
      this.listeners.delete(listener);
  }
}

/** Detects asynchronous command results without requiring a native Promise instance. @param value - Candidate command result. @returns Whether the value implements PromiseLike. */
function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return (
    (typeof value === "object" || typeof value === "function") &&
    value !== null &&
    "then" in value &&
    typeof (value as { readonly then?: unknown }).then === "function"
  );
}

/** Normalizes an asynchronous command failure for presentation state. @param error - Rejected value. @returns Displayable failure message. */
function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** Owns the active view and its dispatcher, matching the minimal browser frame responsibility. */
export class OfficeFrame<View> {
  private activeView: View | undefined;
  private readonly bindings: SfxBindings;
  private readonly dispatcher = new SfxDispatcher();

  /** Creates an empty frame and its bindings. @returns Nothing. */
  public constructor() {
    this.bindings = new SfxBindings(this.dispatcher);
  }

  /** Activates one view and replaces the frame's shell stack. @param view - Active suite view. @param shells - Bottom-to-top shell order. @returns Nothing. */
  public SetActiveView(view: View, shells: readonly SfxShell[]): void {
    this.CloseView();
    this.activeView = view;
    for (const shell of shells) this.dispatcher.Push(shell);
  }

  /** Returns the frame-owned dispatcher. @returns Active dispatcher. */
  public GetDispatcher(): SfxDispatcher {
    return this.dispatcher;
  }

  /** Returns frame-owned command-state bindings. @returns Active bindings. */
  public GetBindings(): SfxBindings {
    return this.bindings;
  }

  /** Returns the active view, when one is installed. @returns Current view or undefined. */
  public GetActiveView(): View | undefined {
    return this.activeView;
  }

  /** Removes every active shell and clears the view reference. @returns Nothing. */
  public CloseView(): void {
    while (this.dispatcher.GetShell(0) !== undefined)
      this.dispatcher.Pop(this.dispatcher.GetShell(0) as SfxShell);
    this.activeView = undefined;
  }
}

/** Converts the bounded primitive command result subset to an Sfx return item. @param slot - Executed slot. @param value - Handler result. @returns Matching item or undefined for void/complex results. */
function createRequestReturnItem(slot: number, value: unknown): SfxPoolItem | undefined {
  if (typeof value === "boolean") return new SfxBoolItem(slot, value);
  if (typeof value === "string") return new SfxStringItem(slot, value);
  if (typeof value === "number" && Number.isInteger(value) && value >= -32_768 && value <= 32_767)
    return new SfxInt16Item(slot, value);
  return undefined;
}

/** Converts presentation-bound values into Sfx request items before shell execution. @param slot - Executed slot. @param value - Optional presentation argument. @returns Immutable item arguments. */
function createRequestArguments(slot: number, value: unknown): readonly SfxPoolItem[] {
  if (value === undefined) return [];
  if (
    Array.isArray(value) &&
    value.every(
      /** Checks one prebuilt request argument. @param item - Candidate value. @returns Whether it is pooled. */ (
        item,
      ) => item instanceof SfxPoolItem,
    )
  )
    return value as readonly SfxPoolItem[];
  if (typeof value === "boolean") return [new SfxBoolItem(slot, value)];
  if (typeof value === "string") return [new SfxStringItem(slot, value)];
  if (typeof value === "number" && Number.isInteger(value) && value >= -32_768 && value <= 32_767)
    return [new SfxInt16Item(slot, value)];
  return [new SfxUnoAnyItem(slot, value)];
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
