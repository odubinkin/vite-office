/** @fileoverview Ports SvtBroadcaster snapshot dispatch and lifetime from pinned `svl/source/notify/broadcast.cxx`. */
import type { SfxHint } from "./SfxBroadcaster";
import type { SvtListener, SvtDyingHint } from "./listener";

let nextBroadcasterIdentity = 0;
/** Browser representation of a native pointer with its deleted tag. */
interface ListenerSlot<Hint extends SfxHint> {
  readonly listener: SvtListener<Hint>;
  readonly deleted: boolean;
}

/** Separate native observer channel; listeners retain their own reciprocal registrations. */
export class SvtBroadcaster<Hint extends SfxHint = SfxHint> {
  public readonly allocationIdentity = ++nextBroadcasterIdentity;
  private listeners: ListenerSlot<Hint>[] = [];
  private destructedListeners: SvtListener<Hint>[] = [];
  private emptySlots = 0;
  private firstUnsorted = 0;
  private aboutToDie = false;
  private disposing = false;
  private destructedNormalized = true;
  private disposed = false;

  /** Copies the source's listeners through their original reciprocal registration method. @param source - Optional native copy source. @returns Nothing. */
  public constructor(source?: SvtBroadcaster<Hint>) {
    if (source !== undefined)
      for (const listener of source.GetAllListeners()) listener.StartListening(this);
  }
  /** Represents native pointer-tag ordering without machine addresses. @param slot - Tagged listener. @returns Stable order key. */
  private PointerKey(slot: ListenerSlot<Hint>): number {
    return slot.listener.allocationIdentity * 2 + Number(slot.deleted);
  }
  /** Compacts tombstones and normalizes original pointer order. Native packed storage and partial-sort performance are not represented. @returns Nothing. */
  private Normalize(): void {
    if (this.emptySlots !== 0) {
      this.listeners = this.listeners.filter(
        /** Drops pointer tombstones without touching original listeners. @param slot - Tagged pointer. @returns Whether live. */
        (slot) => !slot.deleted,
      );
      this.emptySlots = 0;
    }
    if (this.firstUnsorted !== this.listeners.length) {
      this.listeners.sort(
        /** Orders original allocation identities. @param a - First slot. @param b - Second slot. @returns Ordering. */
        (a, b) => this.PointerKey(a) - this.PointerKey(b),
      );
      this.firstUnsorted = this.listeners.length;
    }
    if (!this.destructedNormalized) {
      this.destructedListeners.sort(
        /** Orders removed identities during destruction. @param a - First listener. @param b - Second listener. @returns Ordering. */
        (a, b) => a.allocationIdentity - b.allocationIdentity,
      );
      this.destructedNormalized = true;
    }
  }
  /** Finds the native lower-bound pointer position. @param listener - Original listener. @returns Slot position. */
  private LowerBound(listener: SvtListener<Hint>): number {
    let first = 0,
      last = this.listeners.length;
    const key = listener.allocationIdentity * 2;
    while (first < last) {
      const middle = Math.floor((first + last) / 2);
      if (this.PointerKey(this.listeners[middle] as ListenerSlot<Hint>) < key) first = middle + 1;
      else last = middle;
    }
    return first;
  }
  /** Reciprocal friend operation; called by SvtListener only. Native release guards reject additions after prepare/disposal. @param listener - Original listener. @returns Nothing. */
  public Add(listener: SvtListener<Hint>): void {
    if (this.disposing || this.aboutToDie) return;
    const sorted = this.firstUnsorted === this.listeners.length - this.emptySlots;
    const slot = { listener, deleted: false };
    if (
      this.listeners.length === 0 ||
      (sorted &&
        this.PointerKey(this.listeners[this.listeners.length - 1] as ListenerSlot<Hint>) <=
          this.PointerKey(slot))
    ) {
      this.firstUnsorted++;
      this.listeners.push(slot);
      return;
    }
    if (this.emptySlots !== 0 && sorted) {
      const position = this.LowerBound(listener);
      if (this.listeners[position]?.deleted) {
        this.listeners[position] = slot;
        this.firstUnsorted++;
        this.emptySlots--;
        return;
      }
    }
    this.listeners.push(slot);
  }
  /** Reciprocal friend operation with native tombstone and prepare/destructor rules. @param listener - Original listener. @returns Nothing. */
  public Remove(listener: SvtListener<Hint>): void {
    if (this.disposing) return;
    if (this.aboutToDie) {
      const last = this.destructedListeners[this.destructedListeners.length - 1];
      if (last !== undefined && last.allocationIdentity > listener.allocationIdentity)
        this.destructedNormalized = false;
      this.destructedListeners.push(listener);
      return;
    }
    const realSize = this.listeners.length - this.emptySlots;
    if (
      this.firstUnsorted !== realSize ||
      (this.listeners.length > 1024 && this.listeners.length / realSize > 16)
    )
      this.Normalize();
    const position = this.LowerBound(listener),
      slot = this.listeners[position];
    if (slot !== undefined && slot.listener === listener && !slot.deleted) {
      this.listeners[position] = { listener, deleted: true };
      this.emptySlots++;
      this.firstUnsorted--;
    }
    if (!this.HasListeners()) this.ListenersGone();
  }
  /** Delivers the original hint over a normalized membership snapshot. Ordinary removals do not erase this snapshot. @param hint - Original native hint. @returns Nothing. */
  public Broadcast(hint: Hint | SvtDyingHint): void {
    if (this.disposed) return;
    this.Normalize();
    const snapshot = this.listeners.slice();
    let destructed = 0;
    for (const slot of snapshot) {
      while (
        destructed < this.destructedListeners.length &&
        (this.destructedListeners[destructed] as SvtListener<Hint>).allocationIdentity <
          slot.listener.allocationIdentity
      )
        destructed++;
      if (this.destructedListeners[destructed] !== slot.listener) slot.listener.Notify(hint);
    }
  }
  /** Reads the normalized original listener collection. Native mutable vector access is outside this bounded API. @returns Original listener references. */
  public GetAllListeners(): readonly SvtListener<Hint>[] {
    this.Normalize();
    return this.listeners.map(
      /** Reads an original listener from its pointer slot. @param slot - Native slot representation. @returns Original listener. */
      (slot) => slot.listener,
    );
  }
  /** Reads live membership, excluding ordinary removal tombstones. @returns Whether nonempty. */
  public HasListeners(): boolean {
    return this.listeners.length - this.emptySlots > 0;
  }
  /** Announces destruction without dispatching or detaching; listeners removed afterwards are skipped by the destructor. @returns Nothing. */
  public PrepareForDestruction(): void {
    this.aboutToDie = true;
  }
  /** Native virtual empty-membership hook. @returns Nothing. */
  protected ListenersGone(): void {}
  /** Represents the native destructor, including Dying before reciprocal detachment. @returns Nothing. */
  public Dispose(): void {
    if (this.disposed) return;
    this.disposing = true;
    this.Broadcast({ kind: "dying" });
    this.Normalize();
    let destructed = 0;
    for (const slot of this.listeners) {
      while (
        destructed < this.destructedListeners.length &&
        (this.destructedListeners[destructed] as SvtListener<Hint>).allocationIdentity <
          slot.listener.allocationIdentity
      )
        destructed++;
      if (this.destructedListeners[destructed] !== slot.listener)
        slot.listener.BroadcasterDying(this);
    }
    this.listeners = [];
    this.destructedListeners = [];
    this.emptySlots = 0;
    this.firstUnsorted = 0;
    this.disposed = true;
  }
}
