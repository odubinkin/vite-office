/** @fileoverview Ports the bounded SfxBindings state/invalidation boundary from pinned `sfx2/source/control/bindings.cxx`. */

/** Original bindings.hxx request call-mode flags. */
export enum SfxCallMode {
  SLOT = 0x00,
  SYNCHRON = 0x01,
  ASYNCHRON = 0x02,
  RECORD = 0x04,
  API = 0x08,
}

import { SfxItemSet, SfxItemState } from "../../../svl/inc/itemset";
import { SfxItemPool } from "../../../svl/source/items/itempool";
import type { SfxPoolItem } from "../../../svl/source/items/poolitem";
import { SfxBoolItem, SfxEnumItemInterface } from "../../../svl/source/items/cenumitm";
/** Consumed Execute_Impl toggle-item preparation over the original state set and slot factory. Request routing remains with the owning browser shell. @param state - Actual attribute state. @param which - Mapped native identity. @param createItem - Original concrete slot factory. @returns Prepared item or no executable toggle item. */
export function createAttributeToggleItem(
  state: SfxItemSet,
  which: number,
  createItem: () => SfxPoolItem,
): SfxPoolItem | undefined {
  const status = state.GetItemState(which, true);
  if (status === SfxItemState.DISABLED) return undefined;
  let item: SfxPoolItem;
  if (
    status === SfxItemState.SET ||
    (status === SfxItemState.DEFAULT && SfxItemPool.IsWhich(which))
  )
    item = state.Get(which);
  else if (status === SfxItemState.INVALID) {
    item = createItem();
    item.SetWhich(which);
    if (item instanceof SfxBoolItem) {
      item.SetValue(true);
      return item;
    }
    if (item instanceof SfxEnumItemInterface && item.HasBoolValue()) {
      item.SetBoolValue(true);
      return item;
    }
    return undefined;
  } else return undefined;
  if (item instanceof SfxBoolItem) {
    const next = item.Clone() as SfxBoolItem;
    next.SetValue(!item.GetValue());
    return next;
  }
  if (item instanceof SfxEnumItemInterface && item.HasBoolValue()) {
    const next = item.Clone() as SfxEnumItemInterface;
    next.SetBoolValue(!item.GetBoolValue());
    return next;
  }
  return undefined;
}

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
