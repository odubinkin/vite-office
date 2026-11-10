/** @fileoverview Native UnoCursorPointer/UnoCursorHint from unocrsr.hxx. Concrete std::shared_ptr/weak_ptr value carriers preserve cursor strong/weak ownership in TypeScript without embedding ownership counts into the actual native cursor. */
import { SfxListener } from "../../svl/source/notify/lstner";
import { SfxBroadcaster } from "../../svl/source/notify/SfxBroadcaster";
import { SfxHint, SfxHintId } from "../../svl/inc/hint";
import type { SwUnoCursor } from "../source/core/unocore/unocrsr";
export { SwUnoCursor, SwUnoTableCursor } from "../source/core/unocore/unocrsr";
/** Concrete erased standard-library control block retains the actual native cursor only while its strong count is positive. Weak holders keep the block, not the cursor, alive. No document/selection state is copied here. */
interface CursorControlBlock {
  value: SwUnoCursor | undefined;
  strong: number;
}
/** Concrete shared_ptr<SwUnoCursor> value binding. Standard aliasing/custom-deleter/atomic/ABI families are not claimed; current native callers need default construction, value copy, assignment, reset, get and weak lock. */
export class UnoCursorSharedPtr {
  private block: CursorControlBlock | undefined;
  /** Original empty/adopt/value-copy construction. @param value - Actual created cursor or copied shared pointer. @returns Shared ownership value. */
  constructor(value?: SwUnoCursor | UnoCursorSharedPtr) {
    if (value instanceof UnoCursorSharedPtr) {
      this.block = value.block;
      if (this.block) ++this.block.strong;
    } else if (value) this.block = { value, strong: 1 };
  }
  /** Concrete friend boundary used only by weak_ptr::lock. @param block - Actual live control block. @returns Independent owning shared value. */
  static FromControlBlock(block: CursorControlBlock | undefined): UnoCursorSharedPtr {
    const result = new UnoCursorSharedPtr();
    if (block && block.strong) {
      result.block = block;
      ++block.strong;
    }
    return result;
  }
  /** Concrete std weak-pointer friendship exposes only this ownership block, not another cursor/provider. @returns Borrowed native control block. */
  GetControlBlock(): CursorControlBlock | undefined {
    return this.block;
  }
  /** Original raw pointer borrow does not acquire ownership. @returns Actual cursor or null binding. */
  get(): SwUnoCursor | undefined {
    return this.block?.value;
  }
  /** Original shared use count. @returns Strong owner count. */
  use_count(): number {
    return this.block?.strong ?? 0;
  }
  /** Original copy assignment acquires the new owner before releasing the old one. @param source - Actual shared value. @returns This value. */
  assign(source: UnoCursorSharedPtr): this {
    if (this.block === source.block) return this;
    const previous = this.block;
    this.block = source.block;
    if (this.block) ++this.block.strong;
    UnoCursorSharedPtr.Release(previous);
    return this;
  }
  /** Original reset publishes empty ownership before invoking the last-owner destructor. @returns Nothing. */
  reset(): void {
    const previous = this.block;
    this.block = undefined;
    UnoCursorSharedPtr.Release(previous);
  }
  /** Original default-deleter strong-release boundary. @param block - Previous actual block. @returns Nothing. */
  private static Release(block: CursorControlBlock | undefined): void {
    if (block && --block.strong === 0) {
      const value = block.value;
      block.value = undefined;
      value?.Dispose();
    }
  }
}
/** Concrete weak_ptr<SwUnoCursor> never owns the cursor; lock acquires one genuine temporary shared value. */
export class UnoCursorWeakPtr {
  private readonly block: CursorControlBlock | undefined;
  /** Original weak construction from a shared value. @param source - Actual shared owner. @returns Weak value. */
  constructor(source: UnoCursorSharedPtr) {
    this.block = source.GetControlBlock();
  }
  /** Original expiration is strong-count expiration, independent of JavaScript raw-object reachability. @returns Whether expired. */
  expired(): boolean {
    return !this.block || this.block.strong === 0;
  }
  /** Original weak lock returns either a temporary strong owner or an empty shared value. @returns Owned shared value. */
  lock(): UnoCursorSharedPtr {
    return UnoCursorSharedPtr.FromControlBlock(this.block);
  }
}
/** Original no-payload native notification. */
export class UnoCursorHint extends SfxHint {
  /** Binds the original shared SfxHintId. @returns Hint. */
  constructor() {
    super(SfxHintId.SwUnoCursorHint);
  }
}
/** Native sw::UnoCursorPointer keeps the original SfxListener role and shared value ownership on one identity. */
export class UnoCursorPointer extends SfxListener {
  private readonly m_pCursor = new UnoCursorSharedPtr();
  /** Original default/shared/copy construction starts only the actual cursor notifier. @param source - Original shared value or copied pointer. @returns Pointer owner. */
  constructor(source?: UnoCursorSharedPtr | UnoCursorPointer) {
    super();
    if (source)
      this.m_pCursor.assign(source instanceof UnoCursorPointer ? source.m_pCursor : source);
    const cursor = this.get();
    if (cursor) this.StartListening(cursor.m_aNotifier);
  }
  /** Original raw pointer access is guarded by the shared owner. @returns Actual cursor or null binding. */
  get(): SwUnoCursor | undefined {
    return this.m_pCursor.get();
  }
  /** Original copy assignment ends old subscription before starting the new one. @param other - Native pointer source. @returns This pointer. */
  assign(other: UnoCursorPointer): this {
    const current = this.get();
    if (current) this.EndListening(current.m_aNotifier);
    const next = other.get();
    if (next) this.StartListening(next.m_aNotifier);
    this.m_pCursor.assign(other.m_pCursor);
    return this;
  }
  /** Original reset deliberately starts the new subscription before ending the old one. @param source - Native shared replacement or null binding. @returns Nothing. */
  reset(source?: UnoCursorSharedPtr): void {
    const next = source?.get();
    if (next) this.StartListening(next.m_aNotifier);
    const current = this.get();
    if (current) this.EndListening(current.m_aNotifier);
    if (source) this.m_pCursor.assign(source);
    else this.m_pCursor.reset();
  }
  /** Original hint path drops ownership only when no broadcaster registrations remain. @param source - Real broadcaster. @param hint - Real native hint. @returns Nothing. */
  override Notify(source: SfxBroadcaster, hint: SfxHint): void {
    if (this.get() && hint.GetId() === SfxHintId.SwUnoCursorHint) this.EndListening(source);
    if (!this.GetBroadcasterCount()) this.m_pCursor.reset();
  }
  /** Original derived destructor releases the shared member before the listener base. @returns Nothing. */
  override Dispose(): void {
    const current = this.get();
    if (current) this.EndListening(current.m_aNotifier);
    this.m_pCursor.reset();
    super.Dispose();
  }
}
