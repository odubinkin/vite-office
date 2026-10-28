/** @fileoverview Original ICU78.3 SharedObject logical hard/soft ownership and UnifiedCache notification. Native deletion is an explicit release hook; JS execution is synchronous within one realm and does not simulate native atomics. */
/** Original cache notification boundary used only by SharedObject. */
export abstract class UnifiedCacheBase {
  /** Original zero-hard-reference callback. @returns Nothing. */
  abstract handleUnreferencedObject(): void;
}
/** Original reference-counted owner. Copies begin with zero references. */
export class SharedObject {
  protected softRefCount = 0;
  private hardRefCount = 0;
  private cachePtr: UnifiedCacheBase | null = null;
  /** Original addRef does not notify the cache on increment. @returns Nothing. */
  addRef(): void {
    ++this.hardRefCount;
  }
  /** Original removeRef notifies the cache only on transition to zero. @returns Nothing. */
  removeRef(): void {
    const cache = this.cachePtr;
    if (--this.hardRefCount === 0) {
      if (cache !== null) cache.handleUnreferencedObject();
      else this.dispose();
    }
  }
  /** Original hard-reference count. @returns Count. */
  getRefCount(): number {
    return this.hardRefCount;
  }
  /** Original cache-only hard-reference predicate. @returns Whether no client owns this value. */
  noHardReferences(): boolean {
    return this.getRefCount() === 0;
  }
  /** Original cache-only hard-reference predicate. @returns Whether a client owns this value. */
  hasHardReferences(): boolean {
    return this.getRefCount() !== 0;
  }
  /** Original standalone zero-count deletion. @returns Nothing. */
  deleteIfZeroRefCount(): void {
    if (this.cachePtr === null && this.getRefCount() === 0) this.dispose();
  }
  /** Native virtual destructor projection, without fabrication of allocator failures. @returns Nothing. */
  dispose(): void {}
  /** Original pointer copy releases the destination before retaining the source. @param source - Borrowed source/null. @param dest - Mutable destination. @returns Nothing. */
  static copyPtr<T extends SharedObject>(source: T | null, dest: [T | null]): void {
    if (source !== dest[0]) {
      if (dest[0] !== null) dest[0].removeRef();
      dest[0] = source;
      if (source !== null) source.addRef();
    }
  }
  /** Original pointer clear, including post-release null assignment. @param ptr - Mutable owner. @returns Nothing. */
  static clearPtr<T extends SharedObject>(ptr: [T | null]): void {
    if (ptr[0] !== null) {
      ptr[0].removeRef();
      ptr[0] = null;
    }
  }
}
