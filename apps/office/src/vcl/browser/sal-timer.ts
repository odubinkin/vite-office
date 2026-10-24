/** @fileoverview Browser/Worker SalTimer platform binding. Native VCL scheduler logic remains above this boundary,as with the upstream Qt single-shot system timer. */
import { SalTimer } from "../inc/saltimer";

/** DOM timers accept a signed32 delay;longer native deadlines are delivered early for the VCL scheduler's existing deadline check/rearm. */
const MAX_BROWSER_TIMER_DELAY = 0x7fffffff;

/** One actual host timer per native system-timer instance;no task queue or chart service is implemented here. */
export class BrowserSalTimer extends SalTimer {
  private timer: ReturnType<typeof globalThis.setTimeout> | null = null;

  /** Replaces a pending host timer. Unsigned64 conversion matches the native argument width;the host delay cap avoids JavaScript's overflow-to-immediate behavior. @param milliseconds - Native unsigned64 delay. @returns Nothing. */
  override Start(milliseconds: bigint): void {
    this.Stop();
    const delay = Math.min(Number(BigInt.asUintN(64, milliseconds)), MAX_BROWSER_TIMER_DELAY);
    this.timer = globalThis.setTimeout(
      /** A callback can restart or destroy this timer;clear the old handle before entering native code. @returns Nothing. */
      () => {
        this.timer = null;
        this.CallCallback();
      },
      delay,
    );
  }
  /** Cancels the actual pending host timer and releases its handle. @returns Nothing. */
  override Stop(): void {
    if (this.timer !== null) {
      globalThis.clearTimeout(this.timer);
      this.timer = null;
    }
  }
  /** Releases the platform event before the native base destructor. @returns Nothing. */
  override Dispose(): void {
    this.Stop();
    super.Dispose();
  }
}
