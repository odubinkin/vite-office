/** @fileoverview Observes browser Promise operations outside the upstream-shaped Sfx dispatcher. */

import {
  SfxDispatcher,
  isPromiseLike,
  type CommandDispatchResult,
  type CommandFailure,
} from "../../../sfx2/source/control/dispatch";
import { createRequestReturnItem, type SfxRequest } from "../../../sfx2/source/control/request";
import type { SfxSlotState } from "../../../sfx2/source/control/bindings";

/** Browser frame dispatcher that decorates core slot execution with Promise state and errors. */
export class BrowserSfxDispatcher extends SfxDispatcher {
  private readonly asyncStates = new Map<
    string,
    Readonly<{ error?: string; generation: number; pending: boolean }>
  >();
  private executionGeneration = 0;
  private lastCommandError: Readonly<CommandFailure> | undefined;
  private latestExecutionGeneration = 0;

  /** Executes and observes an asynchronous browser request result. @param request - Slot request. @returns Dispatch result. */
  public override ExecuteRequest(request: SfxRequest): CommandDispatchResult<unknown> {
    const result = super.ExecuteRequest(request);
    if (result.status !== "executed" || !isPromiseLike(result.value)) return result;
    const commandId = result.commandId;
    const generation = ++this.executionGeneration;
    this.latestExecutionGeneration = generation;
    this.lastCommandError = undefined;
    this.asyncStates.set(commandId, { generation, pending: true });
    this.Invalidate("command-async");
    const tracked = Promise.resolve(result.value).then(
      /** Completes a fulfilled browser request. @param value - Fulfilled value. @returns Original value. */
      (value) => {
        request.Done(createRequestReturnItem(request.GetSlot(), value));
        if (this.asyncStates.get(commandId)?.generation === generation)
          this.asyncStates.delete(commandId);
        this.Invalidate("command-async");
        return value;
      },
      /** Records a rejected browser request. @param error - Rejection. @returns Undefined. */
      (error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        if (this.asyncStates.get(commandId)?.generation === generation)
          this.asyncStates.set(commandId, { error: message, generation, pending: false });
        request.Done();
        if (this.latestExecutionGeneration === generation)
          this.lastCommandError = {
            commandId,
            ...getErrorCode(error),
            error: message,
          };
        this.Invalidate("command-async");
        return undefined;
      },
    );
    return { ...result, value: tracked };
  }

  /** Decorates core slot state with browser operation state. @param commandUrl - Command URL. @returns Decorated state. */
  public override QueryState(commandUrl: string): SfxSlotState {
    const state = super.QueryState(commandUrl);
    const asyncState = this.asyncStates.get(commandUrl.split("?", 1)[0] as string);
    return {
      ...state,
      ...(asyncState?.error === undefined ? {} : { error: asyncState.error }),
      ...(asyncState?.pending === true ? { pending: true } : {}),
    };
  }

  /** Returns the latest browser operation failure. @returns Latest failure. */
  public override GetLastCommandError(): Readonly<CommandFailure> | undefined {
    return this.lastCommandError;
  }
}

/** Reads a stable non-blank code from a rejected browser operation. @param error - Rejection. @returns Optional code. */
function getErrorCode(error: unknown): Readonly<{ code?: string }> {
  if (typeof error !== "object" || error === null || !("code" in error)) return {};
  const code = error.code;
  return typeof code === "string" && code.trim().length > 0 ? { code } : {};
}
