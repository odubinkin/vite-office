/**
 * @fileoverview Ports the bounded SfxRequest execution record from pinned
 * `sfx2/source/control/request.cxx`.
 */

import { SfxCallMode } from "./bindings";
import { SfxBoolItem } from "../../../svl/source/items/cenumitm";
import { SfxInt16Item } from "../../../svl/source/items/intitem";
import { SfxPoolItem } from "../../../svl/source/items/poolitem";
import { SfxStringItem } from "../../../svl/source/items/stritem";
import { SfxUnoAnyItem } from "../view/frame";

/** One slot invocation with item arguments, completion state, and an optional return item. */
export class SfxRequest {
  private done = false;
  private ignored = false;
  private arguments_: readonly SfxPoolItem[];
  private modifier = 0;
  private returnValue: SfxPoolItem | undefined;

  /** Creates one request. Browser-only payloads are deliberately not part of this upstream-shaped record. @param slot - Numeric Sfx slot ID. @param arguments_ - Argument items. @param callMode - Native execution flags. @returns Nothing. */
  public constructor(
    private readonly slot: number,
    arguments_: readonly SfxPoolItem[] = [],
    private readonly callMode: SfxCallMode = SfxCallMode.SYNCHRON,
  ) {
    this.arguments_ = arguments_;
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

  /** Sets native caller-owned key metadata independently of argument items. @param modifier - Unsigned native key mask. @returns Nothing. */
  public SetModifier(modifier: number): void {
    this.modifier = modifier;
  }

  /** Returns native key metadata, initially zero. @returns Unsigned key mask. */
  public GetModifier(): number {
    return this.modifier;
  }

  /** Original AppendItem puts an independent concrete value,replacing an existing WhichId. The current browser argument vector represents the source SfxAllItemSet transport. @param item - Actual native item. @returns Nothing. */
  public AppendItem(item: SfxPoolItem): void {
    const items = [...this.arguments_],
      index = items.findIndex(
        /** Finds the source WhichId replacement. @param candidate - Existing native item. @returns Same identity. */ (
          candidate,
        ) => candidate.Which() === item.Which(),
      ),
      copy = item.Clone() as SfxPoolItem;
    if (index < 0) items.push(copy);
    else items[index] = copy;
    this.arguments_ = items;
  }
  /** Original RemoveItem clears only the supplied WhichId. @param which - Native identity. @returns Nothing. */
  public RemoveItem(which: number): void {
    this.arguments_ = this.arguments_.filter(
      /** Keeps other source identities. @param item - Existing item. @returns Keep. */ (item) =>
        item.Which() !== which,
    );
  }
  /** Original SetReturnValue owns an independent concrete value without completing the request;full native pool/recording services remain outside this browser bridge. @param value - Actual return item. @returns Nothing. */
  public SetReturnValue(value: SfxPoolItem): void {
    this.returnValue = value.Clone() as SfxPoolItem;
  }
  /** Returns original execution flags for an asynchronous request copy. @returns Native call mode. */
  public GetCallMode(): SfxCallMode {
    return this.callMode;
  }

  /** Original API call-mode bit query,independent of arguments. @returns Whether called by API. */
  public IsAPI(): boolean {
    return Boolean(this.callMode & SfxCallMode.API);
  }
  /** Original boolean Done overload completes the request and optionally releases arguments;return assignment is separate. @param release - Clear argument transport after completion. @returns Nothing. */
  public Done(release = false): void {
    this.done = true;
    if (release) this.arguments_ = [];
  }

  /** Original Ignore suppresses recording/completion for requests continued through an asynchronous copy. @returns Nothing. */
  public Ignore(): void {
    this.ignored = true;
  }
  /** Reports whether the original request was ignored. @returns Ignore flag. */
  public IsIgnored(): boolean {
    return this.ignored;
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
