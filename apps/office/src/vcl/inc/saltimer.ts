/** @fileoverview Original SalTimer plugin boundary from vcl/inc/saltimer.hxx;the empty virtual destructor is represented by explicit Dispose. */

/** Original SALTIMERPROC is a nullable no-argument callback at the platform timer boundary. */
export type SALTIMERPROC = (() => void) | null;

/** Actual abstract system timer contract;VCL Task/Timer/Idle scheduling belongs above this platform boundary. */
export abstract class SalTimer {
  private m_pProc: SALTIMERPROC = null;

  /** Platform-specific timer start/restart. @param milliseconds - Native unsigned64 delay. @returns Nothing. */
  abstract Start(milliseconds: bigint): void;
  /** Platform-specific timer cancellation. @returns Nothing. */
  abstract Stop(): void;
  /** Original callback assignment replaces the current function,including null. @param callback - SALTIMERPROC. @returns Nothing. */
  SetCallback(callback: SALTIMERPROC): void {
    this.m_pProc = callback;
  }
  /** Original callback dispatch observes the current callback at delivery time. @returns Nothing. */
  CallCallback(): void {
    if (this.m_pProc) this.m_pProc();
  }
  /** Original virtual destructor is empty in salvtables.cxx. @returns Nothing. */
  Dispose(): void {}
}
