/** @fileoverview Implements the bounded SfxListener contract from pinned `svl/source/notify/lstner.cxx`. */

import { SfxBroadcaster, type SfxHint, type SfxListenerTarget } from "./broadcast";

/** Typed M:N listener that owns its reciprocal broadcaster registrations. */
export abstract class SfxListener<Hint extends SfxHint> implements SfxListenerTarget<Hint> {
  private readonly broadcasters = new Set<SfxBroadcaster<Hint>>();

  /** Starts listening to one broadcaster. @param broadcaster - Source to attach. @returns Whether newly attached. */
  public StartListening(broadcaster: SfxBroadcaster<Hint>): boolean {
    if (this.broadcasters.has(broadcaster)) return false;
    broadcaster.AddListener(this);
    this.broadcasters.add(broadcaster);
    return true;
  }

  /** Ends one reciprocal registration. @param broadcaster - Source to detach. @returns Nothing. */
  public EndListening(broadcaster: SfxBroadcaster<Hint>): void {
    if (!this.broadcasters.delete(broadcaster)) return;
    broadcaster.RemoveListener(this);
  }

  /** Ends every current registration. @returns Nothing. */
  public EndListeningAll(): void {
    for (const broadcaster of [...this.broadcasters]) this.EndListening(broadcaster);
  }

  /** Detaches a broadcaster that already cleared its listener collection. @param broadcaster - Dying source. @returns Nothing. */
  public BroadcasterDying(broadcaster: SfxBroadcaster<Hint>): void {
    this.broadcasters.delete(broadcaster);
  }

  /** Reports whether any source remains registered. @returns True when listening. */
  public HasBroadcaster(): boolean {
    return this.broadcasters.size > 0;
  }

  /** Receives one typed hint. @param broadcaster - Emitting source. @param hint - Typed hint. @returns Nothing. */
  public abstract Notify(broadcaster: SfxBroadcaster<Hint>, hint: Hint): void;
}
