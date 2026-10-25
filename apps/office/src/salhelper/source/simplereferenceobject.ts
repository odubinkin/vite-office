/** @fileoverview Original salhelper SimpleReferenceObject count/static-flag and virtual destructor dispatch over the actual OSL interlocked owner. C++ allocation operators and physical DLL/ABI allocation remain unrepresented. */
import { osl_atomic_increment, osl_atomic_decrement } from "../../sal/inc/osl/interlck";
/** Original intrusive native reference-count base,with exactly the addressed signed32 count. */
export class SimpleReferenceObject {
  protected readonly m_nCount = new Int32Array(1);
  /** Original acquire skips staticized/overflow-static objects and uses the real OSL operation. @returns Nothing. */
  acquire(): void {
    if (!((this.m_nCount[0] as number) & 0x80000000)) osl_atomic_increment(this.m_nCount);
  }
  /** Original release destroys through the actual derived virtual destructor only at zero. @returns Nothing. */
  release(): void {
    if (!((this.m_nCount[0] as number) & 0x80000000) && osl_atomic_decrement(this.m_nCount) === 0)
      this.destroy();
  }
  /** Original protected staticize operation deliberately disables future reference updates. @returns Nothing. */
  protected staticize(): void {
    this.m_nCount[0] = (this.m_nCount[0] as number) | 0x80000000;
  }
  /** Original virtual destructor/assertion;this method erases delete-this syntax,not another lifetime engine. Derived destructors call it after their own members. @returns Nothing. */
  protected destroy(): void {
    if (this.m_nCount[0] !== 0)
      throw new Error("SimpleReferenceObject count-zero destructor assertion");
  }
}
