/**
 * @fileoverview Ports the bounded shell-stack resolution and request execution responsibilities
 * from pinned LibreOffice `sfx2/source/control/dispatch.cxx`.
 */

import { deriveParameterizedSlotState, type SfxSlotState } from "./bindings";
import type { CommandPresentation, SfxSlot } from "./msg";
import {
  createRequestArguments,
  createRequestReturnItem,
  parseCommandUrlArguments,
  SfxRequest,
} from "./request";
import type { ResolvedShellCommand, SfxShell } from "./shell";

/** Presentation-facing alias for slot state. */
export type CommandState<Value = unknown> = SfxSlotState<Value>;
/** Structural slot metadata exposed to browser presenters. */
export type CommandDefinition<Context = unknown, Result = unknown, Arguments = unknown> = {
  readonly capabilityId?: `CAP-${string}` | undefined;
  readonly id: string;
  readonly label: string;
  readonly presentation?: CommandPresentation | undefined;
  readonly shortcut?: string | undefined;
  readonly shortcuts?: readonly string[] | undefined;
  readonly slotId?: number | undefined;
  readonly __types?: readonly [Context, Result, Arguments];
};
export type { ResolvedShellCommand, SfxShell } from "./shell";

/** Browser-presentable failure retained by the browser dispatcher extension. */
export interface CommandFailure {
  readonly code?: string;
  readonly commandId: string;
  readonly error: string;
}

/** Successful slot execution result. */
export interface ExecutedCommandResult<Result> {
  readonly commandId: string;
  readonly status: "executed";
  readonly value: Result;
}

/** Missing slot execution result. */
export interface MissingCommandResult {
  readonly commandId: string;
  readonly status: "missing";
}

/** Disabled slot execution result. */
export interface DisabledCommandResult {
  readonly commandId: string;
  readonly status: "disabled";
}

/** Complete deterministic dispatcher outcome. */
export type CommandDispatchResult<Result> =
  DisabledCommandResult | ExecutedCommandResult<Result> | MissingCommandResult;

/** Resolves slots from a last-pushed-first SfxShell stack and executes SfxRequest objects. */
export class SfxDispatcher {
  private readonly listeners = new Set<() => void>();
  private readonly shells: SfxShell[] = [];
  private version = 0;

  /** Pushes one shell to the top of the stack. @param shell - Active shell. @returns Nothing. */
  public Push(shell: SfxShell): void {
    if (this.shells.includes(shell)) throw new Error("SfxShell is already active.");
    this.shells.push(shell);
    this.Invalidate("shell-stack");
  }

  /** Removes one exact active shell identity. @param shell - Active shell. @returns Nothing. */
  public Pop(shell: SfxShell): void {
    const index = this.shells.lastIndexOf(shell);
    if (index < 0) return;
    this.shells.splice(index, 1);
    this.Invalidate("shell-stack");
  }

  /** Returns a shell counted from the top of the stack. @param index - Zero-based stack level. @returns Active shell. */
  public GetShell(index: number): SfxShell | undefined {
    return this.shells[this.shells.length - index - 1];
  }

  /** Resolves a command URL through the highest active shell. @param commandUrl - Canonical command URL. @returns Resolved command. */
  public QueryDispatch(commandUrl: string): ResolvedShellCommand | undefined {
    const baseCommandUrl = commandUrl.split("?", 1)[0] as string;
    const slot = this.GetSlots().find(
      /** Matches an exact or parameterized base URL. @param candidate - Active slot. @returns Whether matching. */
      (candidate) => candidate.commandUrl === commandUrl || candidate.commandUrl === baseCommandUrl,
    );
    return slot === undefined ? undefined : this.QuerySlot(slot.slotId);
  }

  /** Resolves a numeric slot through the highest active shell. @param slotId - Numeric slot. @returns Resolved command. */
  public QuerySlot(slotId: number): ResolvedShellCommand | undefined {
    for (let index = 0; index < this.shells.length; index += 1) {
      const command = this.GetShell(index)?.ResolveSlot(slotId);
      if (command !== undefined) return command;
    }
    return undefined;
  }

  /** Creates and executes an SfxRequest for a command URL. @param commandUrl - Canonical command URL. @param arguments_ - Optional request payload. @returns Dispatch result. */
  public Execute(commandUrl: string, arguments_?: unknown): CommandDispatchResult<unknown> {
    const command = this.QueryDispatch(commandUrl);
    if (command === undefined) return { commandId: commandUrl, status: "missing" };
    const requestArguments =
      arguments_ === undefined ? parseCommandUrlArguments(commandUrl) : arguments_;
    return this.ExecuteRequest(
      new SfxRequest(
        command.slot.slotId,
        createRequestArguments(command.slot.slotId, requestArguments),
      ),
    );
  }

  /** Executes one caller-owned request through its resolving shell. @param request - Slot request. @returns Dispatch result. */
  public ExecuteRequest(request: SfxRequest): CommandDispatchResult<unknown> {
    const command = this.QuerySlot(request.GetSlot());
    if (command === undefined) return { commandId: `slot:${request.GetSlot()}`, status: "missing" };
    const result = command.execute(request);
    if (result.status === "executed" && !isPromiseLike(result.value))
      request.Done(createRequestReturnItem(request.GetSlot(), result.value));
    return result;
  }

  /** Queries command state through the same active slot used for execution. @param commandUrl - Canonical command URL. @returns Slot state. */
  public QueryState(commandUrl: string): SfxSlotState {
    const state = this.QueryDispatch(commandUrl)?.getState();
    if (state === undefined) return { enabled: false };
    return deriveParameterizedSlotState(commandUrl, state, parseCommandUrlArguments(commandUrl));
  }

  /** Queries one numeric slot state. @param slotId - Numeric slot. @returns Slot state. */
  public QuerySlotState(slotId: number): SfxSlotState {
    const command = this.QuerySlot(slotId);
    return command === undefined ? { enabled: false } : this.QueryState(command.slot.commandUrl);
  }

  /** Returns active slots once, honoring top-shell shadowing. @returns Active slots. */
  public GetSlots(): readonly SfxSlot<unknown>[] {
    const slots: SfxSlot<unknown>[] = [];
    const ids = new Set<number>();
    for (let shellIndex = 0; shellIndex < this.shells.length; shellIndex += 1) {
      const shell = this.GetShell(shellIndex) as SfxShell;
      for (const slot of shell.GetInterface().GetSlots()) {
        if (ids.has(slot.slotId)) continue;
        ids.add(slot.slotId);
        slots.push(slot);
      }
    }
    return slots;
  }

  /** Compatibility projection for presentation adapters migrating to GetSlots. @returns Active slots. */
  public GetCommands(): readonly SfxSlot<unknown>[] {
    return this.GetSlots();
  }

  /** Browser adapters use generated accelerator metadata without owning dispatch behavior. @param shortcut - Canonical accelerator. @returns Resolved command. */
  public FindCommandByShortcut(shortcut: string): ResolvedShellCommand | undefined {
    const slot = this.GetSlots().find(
      /** Matches generated accelerator metadata. @param candidate - Active slot. @returns Whether matching. */
      (candidate) => candidate.shortcuts.includes(shortcut),
    );
    return slot === undefined ? undefined : this.QuerySlot(slot.slotId);
  }

  /** Publishes command-state invalidation. @param dependencies - Changed domains. @returns Nothing. */
  public Invalidate(...dependencies: readonly string[]): void {
    if (dependencies.length === 0) throw new Error("Invalidation requires a dependency.");
    this.version += 1;
    for (const listener of this.listeners) listener();
  }

  /** Returns the current invalidation generation. @returns Generation. */
  public GetVersion(): number {
    return this.version;
  }

  /** Subscribes to dispatcher invalidation. @param listener - Invalidation listener. @returns Unsubscribe callback. */
  public Subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return /** Removes the listener. @returns Whether it existed. */ () =>
      this.listeners.delete(listener);
  }

  /** Core dispatch has no browser operation history; browser dispatchers override this method. @returns No core failure. */
  public GetLastCommandError(): Readonly<CommandFailure> | undefined {
    return undefined;
  }
}

/** Detects Promise-like browser results without requiring a native Promise instance. @param value - Candidate. @returns Whether Promise-like. */
export function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return (
    (typeof value === "object" || typeof value === "function") &&
    value !== null &&
    "then" in value &&
    typeof (value as { readonly then?: unknown }).then === "function"
  );
}
