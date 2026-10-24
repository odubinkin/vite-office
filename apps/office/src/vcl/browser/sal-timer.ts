/** @fileoverview Browser/Worker SalTimer platform binding. Native VCL scheduler logic remains above this boundary,as with the upstream Qt single-shot system timer. */
import { SalTimer } from "../inc/saltimer";
import type { SchedulerPlatform } from "../inc/scheduler";

/** DOM timers accept a signed32 delay;longer native deadlines are delivered early for the VCL scheduler's existing deadline check/rearm. */
const MAX_BROWSER_TIMER_DELAY = 0x7fffffff;

/** Monotonic millisecond clock at the browser platform boundary for native tools::Time::GetSystemTicks comparisons. @returns Unsigned64 ticks. */
export function getSystemTicks(): bigint {
  return BigInt.asUintN(64, BigInt(Math.floor(globalThis.performance.now())));
}

/** Queries actual host queued input where exposed. Browser rendering and unsupported host input queues remain controlled by the host event loop;no synthetic pending-event service is installed. @param includeContinuous - Include continuous pointer input. @returns Host pending input. */
export function hasPendingInput(includeContinuous = true): boolean {
  const scheduling = (
    globalThis.navigator as
      | (Navigator & {
          scheduling?: { isInputPending(options: { includeContinuous: boolean }): boolean };
        })
      | undefined
  )?.scheduling;
  return scheduling?.isInputPending({ includeContinuous }) ?? false;
}

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

/** Actual browser platform supplied explicitly to native scheduler initialization;the kernel never imports this adapter. */
export const browserSchedulerPlatform: SchedulerPlatform = {
  /** Allocates the actual host event owner. @returns Native platform timer. */
  createSalTimer: () => new BrowserSalTimer(),
  getSystemTicks,
  hasPendingInput,
};
