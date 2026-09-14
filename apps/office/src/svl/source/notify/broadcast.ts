/** @fileoverview Implements the bounded SfxBroadcaster contract from pinned `svl/source/notify/SfxBroadcaster.cxx`. */

/** Minimum typed notification payload accepted by the bounded broadcaster. */
export interface SfxHint {
  /** Stable notification discriminator. */
  readonly kind: string;
}

/** Listener surface used without coupling SfxBroadcaster to one concrete listener class. */
export interface SfxListenerTarget<Hint extends SfxHint> {
  /** Receives one synchronous broadcaster notification. */
  Notify(broadcaster: SfxBroadcaster<Hint>, hint: Hint): void;
  /** Detaches the dying broadcaster without attempting a reciprocal removal. */
  BroadcasterDying(broadcaster: SfxBroadcaster<Hint>): void;
}

/** Synchronous M:N typed broadcaster with safe iteration and explicit destruction. */
export class SfxBroadcaster<Hint extends SfxHint> {
  private disposed = false;
  private readonly listeners = new Set<SfxListenerTarget<Hint>>();

  /** Registers a listener once. @param listener - Listener to attach. @returns Whether it was newly attached. */
  public AddListener(listener: SfxListenerTarget<Hint>): boolean {
    if (this.disposed) throw new Error("Cannot listen to a disposed SfxBroadcaster.");
    const size = this.listeners.size;
    this.listeners.add(listener);
    return this.listeners.size !== size;
  }

  /** Removes one listener. @param listener - Exact listener identity. @returns Whether it was attached. */
  public RemoveListener(listener: SfxListenerTarget<Hint>): boolean {
    return this.listeners.delete(listener);
  }

  /** Reports whether live listeners are attached. @returns True for a non-empty broadcaster. */
  public HasListeners(): boolean {
    return this.listeners.size > 0;
  }

  /** Delivers one typed hint to a stable snapshot of current listeners. @param hint - Notification payload. @returns Nothing. */
  public Broadcast(hint: Hint): void {
    if (this.disposed) return;
    for (const listener of [...this.listeners]) {
      if (this.listeners.has(listener)) listener.Notify(this, hint);
    }
  }

  /** Announces destruction and detaches all reciprocal listener registrations. @returns Nothing. */
  public PrepareForDestruction(): void {
    if (this.disposed) return;
    this.disposed = true;
    const listeners = [...this.listeners];
    this.listeners.clear();
    for (const listener of listeners) listener.BroadcasterDying(this);
  }

  /** Reports whether destruction has begun. @returns True after PrepareForDestruction. */
  public IsDisposed(): boolean {
    return this.disposed;
  }
}
