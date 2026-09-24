/**
 * @fileoverview Ports the bounded SfxRequest execution record from pinned
 * `sfx2/source/control/request.cxx`.
 */

import { SfxBoolItem } from "../../../svl/source/items/cenumitm";
import { SfxInt16Item } from "../../../svl/source/items/intitem";
import { SfxPoolItem } from "../../../svl/source/items/poolitem";
import { SfxStringItem } from "../../../svl/source/items/stritem";
import { SfxUnoAnyItem } from "../view/frame";

/** One slot invocation with item arguments, completion state, and an optional return item. */
export class SfxRequest {
  private done = false;
  private returnValue: SfxPoolItem | undefined;

  /** Creates one request. Browser-only payloads are deliberately not part of this upstream-shaped record. @param slot - Numeric Sfx slot ID. @param arguments_ - Argument items. @returns Nothing. */
  public constructor(
    private readonly slot: number,
    private readonly arguments_: readonly SfxPoolItem[] = [],
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

/** Converts a bounded primitive result to its Sfx return item. @param slot - Slot ID. @param value - Result. @returns Return item. */
export function createRequestReturnItem(slot: number, value: unknown): SfxPoolItem | undefined {
  if (typeof value === "boolean") return new SfxBoolItem(slot, value);
  if (typeof value === "string") return new SfxStringItem(slot, value);
  if (typeof value === "number" && Number.isInteger(value) && value >= -32_768 && value <= 32_767)
    return new SfxInt16Item(slot, value);
  return undefined;
}

/** Converts a presentation-bound value to immutable Sfx request items. @param slot - Slot ID. @param value - Payload. @returns Request items. */
export function createRequestArguments(slot: number, value: unknown): readonly SfxPoolItem[] {
  if (value === undefined) return [];
  if (
    Array.isArray(value) &&
    value.every(
      /** Detects a prebuilt pooled item. @param item - Candidate. @returns Whether pooled. */ (
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

/** Parses typed UNO URL parameters for the request boundary. @param commandUrl - Command URL. @returns Parsed fields. */
export function parseCommandUrlArguments(
  commandUrl: string,
): Readonly<Record<string, string>> | undefined {
  const query = commandUrl.indexOf("?");
  if (query < 0) return undefined;
  const arguments_: Record<string, string> = {};
  for (const field of commandUrl.slice(query + 1).split("&")) {
    const separator = field.indexOf("=");
    if (separator < 0) continue;
    const key = field.slice(0, separator).split(":", 1)[0] as string;
    arguments_[key] = decodeURIComponent(field.slice(separator + 1));
  }
  return arguments_;
}
