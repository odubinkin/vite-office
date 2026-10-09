/** @fileoverview Ports SvtListener reciprocal registrations from pinned `svl/source/notify/listener.cxx`. */
import type { SfxHint } from "./SfxBroadcaster";
import type { SvtBroadcaster } from "./broadcast";

let nextListenerIdentity = 0;

/** Native SfxHintId::Dying payload at the explicit browser destruction boundary. */
export interface SvtDyingHint {
  readonly kind: "dying";
}

/** Native QueryBase identifier; derived queries own their result fields. */
export class SvtQueryBase {
  /** Stores the native unsigned16 query identity. @param id - Query discriminator. @returns Nothing. */
  public constructor(private readonly id: number) {}
  /** Returns the query identity. @returns Unsigned16 identifier. */
  public getId(): number {
    return this.id & 0xffff;
  }
}

/** M:N listener. Stable allocation identity represents native pointer ordering in the browser. */
export class SvtListener<Hint extends SfxHint = SfxHint> {
  public readonly allocationIdentity = ++nextListenerIdentity;
  private readonly broadcasters: Set<SvtBroadcaster<Hint>>;

  /** Copies the native declaration's registration set without adding reciprocal registrations. Prefer CopyAllBroadcasters for live registration copies. @param source - Optional native copy source. @returns Nothing. */
  public constructor(source?: SvtListener<Hint>) {
    this.broadcasters = new Set(source?.broadcasters);
  }
  /** Registers at an original source once. @param broadcaster - Original notifier. @returns Whether newly registered. */
  public StartListening(broadcaster: SvtBroadcaster<Hint>): boolean {
    if (this.broadcasters.has(broadcaster)) return false;
    this.broadcasters.add(broadcaster);
    broadcaster.Add(this);
    return true;
  }
  /** Ends one reciprocal registration. @param broadcaster - Original notifier. @returns Nothing. */
  public EndListening(broadcaster: SvtBroadcaster<Hint>): void {
    if (!this.broadcasters.delete(broadcaster)) return;
    broadcaster.Remove(this);
  }
  /** Forgets a dying broadcaster without calling back into it. @param broadcaster - Dying original. @returns Nothing. */
  public BroadcasterDying(broadcaster: SvtBroadcaster<Hint>): void {
    this.broadcasters.delete(broadcaster);
  }
  /** Ends all original registrations in stable source allocation order. @returns Nothing. */
  public EndListeningAll(): void {
    const sources = [...this.broadcasters].sort(
      /** Represents native broadcaster pointer order. @param a - First source. @param b - Second source. @returns Ordering. */
      (a, b) => a.allocationIdentity - b.allocationIdentity,
    );
    for (const source of sources) source.Remove(this);
    this.broadcasters.clear();
  }
  /** Replaces all registrations with reciprocal registrations at the source's broadcasters. Self-copy clears them, as upstream does. @param source - Original listener. @returns Nothing. */
  public CopyAllBroadcasters(source: SvtListener<Hint>): void {
    this.EndListeningAll();
    for (const broadcaster of source.broadcasters) this.broadcasters.add(broadcaster);
    for (const broadcaster of this.broadcasters) broadcaster.Add(this);
  }
  /** Reads whether original registrations remain. @returns Whether listening. */
  public HasBroadcaster(): boolean {
    return this.broadcasters.size !== 0;
  }
  /** Receives the original hint without a broadcaster argument. @param hint - Original hint. @returns Nothing. */
  public Notify(hint: Hint | SvtDyingHint): void {
    void hint;
  }
  /** Default native query hook. @param query - Original query. @returns Nothing. */
  public Query(query: SvtQueryBase): void {
    void query;
  }
  /** Represents the native destructor in the explicit browser lifecycle. @returns Nothing. */
  public Dispose(): void {
    this.EndListeningAll();
  }
}
