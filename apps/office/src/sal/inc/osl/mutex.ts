/** @fileoverview Consumed original osl/mutex.hxx owner and Guard<T> over actual native OSL functions. Other guard templates remain unported; no JavaScript synchronization or simulated pthread owner. */
import {
  osl_createMutex,
  osl_destroyMutex,
  osl_acquireMutex,
  osl_tryToAcquireMutex,
  osl_releaseMutex,
  type oslMutex,
} from "../../osl/unx/mutex";
import { osl_getGlobalMutex } from "../../osl/all/mutexshared";
import { getRuntime } from "../../../external/emscripten/runtime";
/** Original noncopyable owning mutex. The opaque C allocation belongs to the actual native library; ordinary JS byte buffers remain GC-managed. */
export class Mutex {
  private mutex: oslMutex;
  private static global: Mutex | undefined;
  /** Original borrowed function-static mutex facade; never creates a second native owner. @returns Same global mutex facade. */
  static getGlobalMutex(): Mutex {
    if (!Mutex.global) {
      const address = osl_getGlobalMutex(),
        result = Object.create(Mutex.prototype) as Mutex;
      result.mutex = (getRuntime() as NonNullable<ReturnType<typeof getRuntime>>).getValue(
        address,
        "*",
      );
      Mutex.global = result;
    }
    return Mutex.global;
  }
  /** Original create. @returns Native owner. */
  constructor() {
    this.mutex = osl_createMutex();
  }
  /** Original destructor; invalid use after native object destruction remains unqualified. @returns Nothing. */
  dispose(): void {
    osl_destroyMutex(this.mutex);
    this.mutex = 0;
  }
  /** Original acquire. @returns Native status. */
  acquire(): boolean {
    return osl_acquireMutex(this.mutex);
  }
  /** Original try-lock. @returns Native status. */
  tryToAcquire(): boolean {
    return osl_tryToAcquireMutex(this.mutex);
  }
  /** Original release. @returns Native status. */
  release(): boolean {
    return osl_releaseMutex(this.mutex);
  }
}
/** Original template parameter contract, including interfaces with void acquire/release. */
interface GuardTarget {
  /** Original acquisition requirement. @returns Native status or ignored interface result. */
  acquire(): unknown;
  /** Original release requirement. @returns Native status or ignored interface result. */
  release(): unknown;
}
/** Original Guard<T> scoped acquisition/release; no copied lifetime or lock registry. */
export class Guard<T extends GuardTarget> {
  /** Original pointer/ref constructor. @param target - Actual native guard target. @returns Guard. */
  constructor(protected readonly target: T | null) {
    if (target === null) throw new Error("assert(pT != NULL)");
    target.acquire();
  }
  /** Original destructor ignores release status. @returns Nothing. */
  dispose(): void {
    (this.target as T).release();
  }
}
/** Original typedef. */
export const MutexGuard = Guard<Mutex>;
