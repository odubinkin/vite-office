/** @fileoverview Native SfxBroadcaster slot graph from pinned svl/source/notify/SfxBroadcaster.cxx. */
import { SfxHint, SfxHintId } from "../../inc/hint";
import type { SfxListener } from "./lstner";

/** Erased TypeScript constructor constraint for native multiple-inheritance role binding. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- TypeScript mixin constructor constraints require an arbitrary argument list; this alias emits no runtime code.
export type SfxNotificationBase = abstract new (...args: any[]) => object;

/** Applies the original SfxBroadcaster fields and algorithms to a native base subobject on the same JS identity. @param Base - Actual primary base. @returns Native role base constructor. */
export function withSfxBroadcaster<TBase extends SfxNotificationBase>(Base: TBase) {
  /** Original native role fields and algorithms, shared by standalone and multiple-inheritance owners. */
  abstract class SfxBroadcasterBase extends Base {
    private readonly m_Listeners: (SfxListener | null)[] = [];
    private readonly m_RemovedPositions: number[] = [];
    /** Original copy-constructor initialization, reused by the root class and native multiple-inheritance owners. @param source - Copy source. @returns Nothing. */
    protected CopyBroadcasterFrom(source?: SfxBroadcaster): void {
      if (source !== undefined)
        for (let i = 0; i < source.m_Listeners.length; ++i)
          source.m_Listeners[i]?.StartListening(this);
    }
    /** Native friend-only operation, public for TypeScript cross-class access; duplicates are controlled by SfxListener. @param listener - Exact listener. @returns Nothing. */
    public AddListener(listener: SfxListener): void {
      if (this.m_RemovedPositions.length === 0) this.m_Listeners.push(listener);
      else {
        const position = this.m_RemovedPositions.pop() as number;
        this.m_Listeners[position] = listener;
      }
    }
    /** Removes one native slot, retaining its position for active delivery loops. Registered membership is a native precondition. @param listener - Registered listener. @returns Nothing. */
    public RemoveListener(listener: SfxListener): void {
      let position = -1;
      if (this.m_RemovedPositions.length !== 0) {
        const i = this.m_RemovedPositions[this.m_RemovedPositions.length - 1] as number;
        if (i < this.m_Listeners.length - 2 && this.m_Listeners[i + 1] === listener)
          position = i + 1;
        else if (i > 0 && this.m_Listeners[i - 1] === listener) position = i - 1;
      }
      if (position === -1) position = this.m_Listeners.indexOf(listener);
      if (position < 0) throw new Error("SfxBroadcaster requires a registered listener");
      this.m_Listeners[position] = null;
      this.m_RemovedPositions.push(position);
    }
    /** Visits live slots, including appended slots, until requested to stop. @param visitor - Native predicate. @returns Nothing. */
    public ForAllListeners(visitor: (listener: SfxListener) => boolean): void {
      for (let i = 0; i < this.m_Listeners.length; ++i) {
        const listener = this.m_Listeners[i];
        if (listener && visitor(listener)) break;
      }
    }
    /** Reports original live-slot count. @returns Count. */
    public GetListenerCount(): number {
      return this.m_Listeners.length - this.m_RemovedPositions.length;
    }
    /** Reports native membership. @returns Whether nonempty. */
    public HasListeners(): boolean {
      return this.GetListenerCount() !== 0;
    }
    /** Native dynamic-type query. @returns False in the base class. */
    public IsSfxStyleSheet(): boolean {
      return false;
    }
    /** Delivers over the initial slot count while observing live removals/reuse. @param hint - Original hint. @returns Nothing. */
    public Broadcast(hint: SfxHint): void {
      const size = this.m_Listeners.length;
      for (let i = 0; i < size; ++i) this.m_Listeners[i]?.Notify(this, hint);
    }
    /** Forwards with the original source and a live loop bound. @param source - Original source. @param hint - Original hint. @returns Nothing. */
    protected Forward(source: SfxBroadcaster, hint: SfxHint): void {
      for (let i = 0; i < this.m_Listeners.length; ++i) this.m_Listeners[i]?.Notify(source, hint);
    }
    /** Explicit native destructor boundary: Dying precedes reciprocal detachment. Call once, then discard the object. @returns Nothing. */
    public Dispose(): void {
      this.Broadcast(new SfxHint(SfxHintId.Dying));
      for (let i = 0; i < this.m_Listeners.length; ++i)
        this.m_Listeners[i]?.RemoveBroadcaster_Impl(this);
    }
  }
  return SfxBroadcasterBase;
}

/** Original standalone SfxBroadcaster class; the shared role implementation also supports native multiple inheritance. */
export class SfxBroadcaster extends withSfxBroadcaster(Object) {
  /** Original default/copy constructor. @param source - Optional copy. @returns Native owner. */
  public constructor(source?: SfxBroadcaster) {
    super();
    this.CopyBroadcasterFrom(source);
  }
}
