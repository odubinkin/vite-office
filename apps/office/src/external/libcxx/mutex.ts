/** @fileoverview Browser C ABI binding of actual pinned SDK std::mutex and consumed single-mutex std::scoped_lock. No JavaScript lock registry, successful lock provider or substitute OSL object. Native thread/system_error/OOM/invalid-lifetime profiles remain unqualified. */
import { getRuntime } from "../emscripten/runtime";
/** Borrows the actual initialized linked libc++ exports. @returns Actual runtime. */
function api() {
  const runtime = getRuntime();
  if (!runtime) throw new Error("Emscripten runtime must be initialized before std::mutex");
  return runtime;
}
/** Original noncopyable std::mutex with actual C++ construction/destruction. */
export class Mutex {
  private readonly pointer = api()._office_std_mutex_create();
  /** Original native destructor. Post-destruction calls are outside the source lifetime domain. @returns Nothing. */
  dispose(): void {
    api()._office_std_mutex_destroy(this.pointer);
  }
  /** Original native lock. @returns Nothing. */
  lock(): void {
    api()._office_std_mutex_lock(this.pointer);
  }
  /** Original native unlock. @returns Nothing. */
  unlock(): void {
    api()._office_std_mutex_unlock(this.pointer);
  }
}
/** Original consumed scoped_lock<mutex> body; other variadic/adopt-lock overloads are unbound. */
export class ScopedLock {
  /** Original borrowing constructor locks the actual native mutex. @param mutex - Existing mutex. @returns Guard. */
  constructor(private readonly mutex: Mutex) {
    mutex.lock();
  }
  /** Original destructor unlocks without owning or destroying its target. @returns Nothing. */
  dispose(): void {
    this.mutex.unlock();
  }
}

/** Original consumed unique_lock<mutex> locking constructor/destructor; default/defer/adopt/move/release overloads remain unbound. */
export class UniqueLock {
  /** Original constructor owns the lock after the actual mutex lock returns. @param mutex - Borrowed original mutex. @returns Guard. */
  constructor(private readonly mutex: Mutex) {
    mutex.lock();
  }
  /** Original owning destructor unlocks the borrowed actual mutex. @returns Nothing. */
  dispose(): void {
    this.mutex.unlock();
  }
}
