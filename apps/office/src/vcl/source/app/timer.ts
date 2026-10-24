/** @fileoverview Original timer.cxx Timer/AutoTimer lifecycle and callback semantics over the actual native Task owner. */
import { Task, TaskPriority } from "../../inc/task";
import { Scheduler } from "../../inc/scheduler";
import type { ImplSchedulerData } from "../../inc/schedulerimpl";

/** Native Link<Timer*,void> browser callback value. */
type TimerHandler = ((timer: Timer | null) => void) | null;

/** Actual native timer;the second constructor parameter binds the native protected auto/name overload. */
export class Timer extends Task {
  private maInvokeHandler: TimerHandler = null;
  private mnTimeout = Scheduler.ImmediateTimeoutMs;
  private readonly mbAuto: boolean;

  /** Original normal,copy and protected-auto constructors. Timer copy deliberately does not copy Task activity or custom priority. @param source - Name or copied Timer. @param auto - Protected native auto flag. @returns Timer. */
  constructor(source: string | Timer, auto = false) {
    super(typeof source === "string" ? source : source.GetDebugName());
    this.mbAuto = typeof source === "string" ? auto : source.mbAuto;
    this.SetPriority(TaskPriority.DEFAULT);
    if (typeof source !== "string") {
      this.maInvokeHandler = source.maInvokeHandler;
      this.mnTimeout = source.mnTimeout;
    }
  }
  /** Original only single-shot timers invoke Task deletion flags. @returns Nothing. */
  protected override SetDeletionFlags(): void {
    if (!this.mbAuto) super.SetDeletionFlags();
  }
  /** Original deadline is the queue record's update time plus timeout. @param now - Native ticks. @returns Remaining time or immediate. */
  protected override UpdateMinPeriod(now: bigint): bigint {
    const wakeup = BigInt.asUintN(
      64,
      (this.GetSchedulerData() as ImplSchedulerData).mnUpdateTime + this.mnTimeout,
    );
    return wakeup <= now ? Scheduler.ImmediateTimeoutMs : wakeup - now;
  }
  /** Original no-argument and explicit pointer/null callback overloads. @param timer - Original default this. @returns Nothing. */
  override Invoke(timer: Timer | null = this): void {
    this.maInvokeHandler?.(timer);
  }
  /** Original callback assignment. @param handler - Link value. @returns Nothing. */
  SetInvokeHandler(handler: TimerHandler): void {
    this.maInvokeHandler = handler;
  }
  /** Original resets the callback Link. @returns Nothing. */
  ClearInvokeHandler(): void {
    this.SetInvokeHandler(null);
  }
  /** Original unsigned64 timeout and active platform-timer renewal;does not replace the record timestamp. @param milliseconds - New timeout. @returns Nothing. */
  SetTimeout(milliseconds: bigint): void {
    this.mnTimeout = BigInt.asUintN(64, milliseconds);
    if (this.IsActive()) Task.StartTimer(this.mnTimeout);
  }
  /** Original timeout query. @returns Native delay. */
  GetTimeout(): bigint {
    return this.mnTimeout;
  }
  /** Original queues first,then wakes at the configured timeout. @param startTimer - Original default true. @returns Nothing. */
  override Start(startTimer = true): void {
    super.Start(false);
    if (startTimer) Task.StartTimer(this.mnTimeout);
  }
  /** Original Task assignment precedes handler and timeout copies;the recipient's const auto flag is retained. @param source - Actual Timer. @returns Recipient. */
  override assign(source: Timer): this {
    super.assign(source);
    this.maInvokeHandler = source.maInvokeHandler;
    this.mnTimeout = source.mnTimeout;
    return this;
  }
}

/** Original automatically repeating Timer. */
export class AutoTimer extends Timer {
  /** Original protected auto constructor binding. @param name - Debug name. @returns Timer. */
  constructor(name: string) {
    super(name, true);
  }
}
