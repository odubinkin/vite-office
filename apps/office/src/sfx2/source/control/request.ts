/**
 * @fileoverview Ports the bounded SfxRequest execution record from pinned
 * `sfx2/source/control/request.cxx`.
 */

import type { SfxPoolItem } from "../../../svl/source/items/poolitem";

/** One slot invocation with item arguments, completion state, and an optional return item. */
export class SfxRequest {
  private done = false;
  private returnValue: SfxPoolItem | undefined;

  /** Creates one request. @param slot - Numeric Sfx slot ID. @param arguments_ - Argument items. @param browserPayload - Narrow browser adapter payload. @returns Nothing. */
  public constructor(
    private readonly slot: number,
    private readonly arguments_: readonly SfxPoolItem[] = [],
    private readonly browserPayload?: unknown,
  ) {
    if (!Number.isInteger(slot) || slot <= 0) throw new Error("SfxRequest slot is invalid.");
  }

  /** Returns the requested slot. @returns Numeric slot ID. */
  public GetSlot(): number {
    return this.slot;
  }

  /** Returns immutable argument items. @returns Request arguments. */
  public GetArgs(): readonly SfxPoolItem[] {
    return this.arguments_;
  }

  /** Returns the browser-bound payload kept outside the upstream item contract. @returns Adapter payload. */
  public GetBrowserPayload(): unknown {
    return this.browserPayload;
  }

  /** Completes the request with an optional return item. @param returnValue - Slot return item. @returns Nothing. */
  public Done(returnValue?: SfxPoolItem): void {
    this.returnValue = returnValue;
    this.done = true;
  }

  /** Reports whether execution completed. @returns Completion state. */
  public IsDone(): boolean {
    return this.done;
  }

  /** Returns the item supplied to Done. @returns Return item when present. */
  public GetReturnValue(): SfxPoolItem | undefined {
    return this.returnValue;
  }
}
