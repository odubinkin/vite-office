/** @fileoverview Original scheduler.hxx public boundary;native queue algorithms live in scheduler.cxx's corresponding module. */
import type { SalTimer } from "./saltimer";

/** Browser platform injection at the native SAL/monotonic-clock/input boundary. It provides no task queues or chart state. */
export interface SchedulerPlatform {
  /** Allocates the real platform timer,as SalInstance::CreateSalTimer does. @returns Platform timer. */
  createSalTimer(): SalTimer;
  /** Reads native monotonic millisecond ticks. @returns Unsigned64 time. */
  getSystemTicks(): bigint;
  /** Queries platform input admission for lower-priority idles. @returns Pending input. */
  hasPendingInput(): boolean;
}

export { Scheduler, bindSchedulerPlatform } from "../source/app/scheduler";
