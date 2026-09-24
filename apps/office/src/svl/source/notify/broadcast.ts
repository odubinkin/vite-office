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

/** Synchronous M:N typed broadcaster with upstream slot reuse and explicit destruction. */
export class SfxBroadcaster<Hint extends SfxHint> {
  private disposed = false;
  private readonly listeners: (SfxListenerTarget<Hint> | undefined)[] = [];
  private readonly removedPositions: number[] = [];

  /** Registers a listener once. @param listener - Listener to attach. @returns Whether it was newly attached. */
  public AddListener(listener: SfxListenerTarget<Hint>): boolean {
    if (this.disposed) throw new Error("Cannot listen to a disposed SfxBroadcaster.");
    if (this.listeners.includes(listener)) return false;
    const position = this.removedPositions.pop();
    if (position === undefined) this.listeners.push(listener);
    else this.listeners[position] = listener;
    return true;
  }

  /** Removes one listener. @param listener - Exact listener identity. @returns Whether it was attached. */
  public RemoveListener(listener: SfxListenerTarget<Hint>): boolean {
    const position = this.listeners.indexOf(listener);
    if (position < 0) return false;
    this.listeners[position] = undefined;
    this.removedPositions.push(position);
    return true;
  }

  /** Reports whether live listeners are attached. @returns True for a non-empty broadcaster. */
  public HasListeners(): boolean {
    return this.listeners.length > this.removedPositions.length;
  }

  /** Delivers one typed hint over the pinned initial slot count, observing reuse of future vacant slots. @param hint - Notification payload. @returns Nothing. */
  public Broadcast(hint: Hint): void {
    if (this.disposed) return;
    const count = this.listeners.length;
    for (let index = 0; index < count; index += 1) this.listeners[index]?.Notify(this, hint);
  }

  /** Announces destruction and detaches all reciprocal listener registrations. @returns Nothing. */
  public PrepareForDestruction(): void {
    if (this.disposed) return;
    this.disposed = true;
    const listeners = [...this.listeners];
    this.listeners.length = 0;
    this.removedPositions.length = 0;
    for (const listener of listeners) listener?.BroadcasterDying(this);
  }

  /** Reports whether destruction has begun. @returns True after PrepareForDestruction. */
  public IsDisposed(): boolean {
    return this.disposed;
  }
}
