/** @fileoverview Ports the bounded SfxControllerItem subscription owner from pinned `sfx2/source/control/ctrlitem.cxx`. */

import type { SfxBindings, SfxSlotState } from "./bindings";

/** Compares the complete bounded slot snapshot before publishing a control update. @param left - Cached state. @param right - Queried state. @returns Whether visible state is unchanged. */
function equalSlotState(left: SfxSlotState, right: SfxSlotState): boolean {
  return (
    left.enabled === right.enabled &&
    left.checked === right.checked &&
    left.error === right.error &&
    left.mixed === right.mixed &&
    left.pending === right.pending &&
    Object.is(left.value, right.value)
  );
}

/** One slot-specific bindings client corresponding to LibreOffice's SfxControllerItem. */
export class SfxControllerItem<Value = unknown> {
  private readonly listeners = new Set<() => void>();
  private state: SfxSlotState<Value>;
  private readonly unsubscribeBindings: () => void;

  /** Creates one bindings-backed controller item. @param commandUrl - Bound slot URL. @param bindings - Owning frame bindings. @returns Nothing. */
  public constructor(
    private readonly commandUrl: string,
    private readonly bindings: SfxBindings,
  ) {
    this.state = bindings.QueryState(commandUrl) as SfxSlotState<Value>;
    this.unsubscribeBindings = bindings.Subscribe(
      /** Refreshes the bound slot after dispatcher invalidation. @returns Nothing. */ () => {
        const state = this.bindings.QueryState(this.commandUrl) as SfxSlotState<Value>;
        if (equalSlotState(this.state, state)) return;
        this.state = state;
        for (const listener of this.listeners) listener();
      },
    );
  }

  public readonly GetState =
    /** Returns the stable current slot snapshot. @returns Bound slot state. */ (): SfxSlotState<Value> =>
      this.state;

  public readonly Subscribe =
    /** Subscribes one control to this slot only. @param listener - Control listener. @returns Cleanup. */ (
      listener: () => void,
    ): (() => void) => {
      this.listeners.add(listener);
      return /** Removes the control listener. @returns Whether it existed. */ () =>
        this.listeners.delete(listener);
    };

  /** Releases the single bindings subscription and all presentation listeners. @returns Nothing. */
  public Dispose(): void {
    this.unsubscribeBindings();
    this.listeners.clear();
  }
}
