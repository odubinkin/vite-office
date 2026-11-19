/** @fileoverview Original comphelper/refcountedmutex.hxx and sharedmutex.cxx RefCountedMutex member/base lifetime. Actual OSL native owner and existing SimpleReferenceObject are reused. */
import { SimpleReferenceObject } from "../../salhelper/source/simplereferenceobject";
import { Mutex } from "../../sal/inc/osl/mutex";
/** Original intrusive owner of one OSL mutex. */
export class RefCountedMutex extends SimpleReferenceObject {
  private readonly m_aMutex = new Mutex();
  /** Original mutable member borrow, not an independent mutex or provider. @returns Actual member. */
  GetMutex(): Mutex {
    return this.m_aMutex;
  }
  /** Original derived destructor then member destruction then base. @returns Nothing. */
  protected override destroy(): void {
    this.m_aMutex.dispose();
    super.destroy();
  }
}
