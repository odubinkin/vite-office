/** @fileoverview Original ImplSchedulerContext and the scheduler-owned slice of ImplSVData. Other native application/window/device services are not exposed. */
import { PRIO_COUNT } from "./task";
import type { ImplSchedulerData } from "./schedulerimpl";
import type { SalTimer } from "./saltimer";

/** Actual per-realm native scheduler state,including priority lists and nested invocation stack. Browser realms do not share the native mutex. */
export class ImplSchedulerContext {
  mpFirstSchedulerData: (ImplSchedulerData | null)[] = Array(PRIO_COUNT).fill(null);
  mpLastSchedulerData: (ImplSchedulerData | null)[] = Array(PRIO_COUNT).fill(null);
  mpSchedulerStack: ImplSchedulerData | null = null;
  mpSchedulerStackTop: ImplSchedulerData | null = null;
  mpSalTimer: SalTimer | null = null;
  mnTimerStart = 0n;
  mnTimerPeriod = 0xffffffffffffffffn;
  mbActive = true;
  mnIdlesLockCount = 0;
}

/** Actual static-data owner for the consumed scheduler context. */
export class ImplSVData {
  readonly maSchedCtx = new ImplSchedulerContext();
}

export { ImplGetSVData } from "../source/app/svdata";
