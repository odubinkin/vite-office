/** @fileoverview Ports the bounded SfxBindings state/invalidation boundary from pinned `sfx2/source/control/bindings.cxx`. */

/** State shape published by the dispatcher to bindings clients. */
export interface SfxSlotState<Value = unknown> {
  readonly enabled: boolean;
  readonly checked?: boolean;
  readonly error?: string;
  readonly mixed?: boolean;
  readonly pending?: boolean;
  readonly value?: Value;
}

/** Minimal dispatcher surface required by SfxBindings. */
export interface SfxBindingsDispatcher {
  readonly GetVersion: () => number;
  readonly Invalidate: (...dependencies: readonly string[]) => void;
  readonly QueryState: (commandUrl: string) => SfxSlotState;
  readonly Subscribe: (listener: () => void) => () => void;
}

/** Applies parameterized command state without teaching the dispatcher UI URL semantics. @param _commandUrl - Requested URL. @param state - Base state. @param parameters - Parsed parameters. @returns Derived state. */
export function deriveParameterizedSlotState(
  _commandUrl: string,
  state: SfxSlotState,
  parameters: Readonly<Record<string, string>> | undefined,
): SfxSlotState {
  if (parameters?.Style === undefined || typeof state.value !== "string") return state;
  const style = parameters.Style === "Default Paragraph Style" ? "default" : parameters.Style;
  return {
    ...state,
    checked: state.value === style.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-"),
  };
}

/** Central state cache/invalidation facade owned by an Sfx frame. */
export class SfxBindings {
  /** Creates bindings for one dispatcher. @param dispatcher - Frame dispatcher. @returns Nothing. */
  public constructor(private readonly dispatcher: SfxBindingsDispatcher) {}

  /** Queries current slot state through the active shell stack. @param commandUrl - Canonical command URL. @returns Slot state. */
  public QueryState(commandUrl: string): SfxSlotState {
    return this.dispatcher.QueryState(commandUrl);
  }

  /** Invalidates dependent states. @param dependencies - Changed state domains. @returns Nothing. */
  public Invalidate(...dependencies: readonly string[]): void {
    this.dispatcher.Invalidate(...dependencies);
  }

  /** Returns the dispatcher invalidation generation. @returns Monotonic generation. */
  public GetVersion(): number {
    return this.dispatcher.GetVersion();
  }

  /** Subscribes to invalidation. @param listener - State listener. @returns Unsubscribe callback. */
  public Subscribe(listener: () => void): () => void {
    return this.dispatcher.Subscribe(listener);
  }
}
