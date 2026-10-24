/** @fileoverview Original idle.cxx immediate readiness and deterministic default/lowest scheduling policy. */
import { Timer } from "../../inc/timer";
import { Task, TaskPriority } from "../../inc/task";
import { Scheduler } from "../../inc/scheduler";

/** Native immediate task;the second constructor parameter binds the original protected auto overload. */
export class Idle extends Timer {
  /** Original default idle priority. @param name - Debug name. @param auto - Protected native auto flag. @returns Idle. */
  constructor(name: string, auto = false) {
    super(name, auto);
    this.SetPriority(TaskPriority.DEFAULT_IDLE);
  }
  /** Original queues without waking,then applies deterministic default/lowest infinity policy. @param startTimer - Original default true. @returns Nothing. */
  override Start(startTimer = true): void {
    Task.prototype.Start.call(this, false);
    let period = Scheduler.ImmediateTimeoutMs;
    if (Scheduler.GetDeterministicMode())
      switch (this.GetPriority()) {
        case TaskPriority.DEFAULT_IDLE:
        case TaskPriority.LOWEST:
          period = Scheduler.InfiniteTimeoutMs;
          break;
        default:
          break;
      }
    if (startTimer) Task.StartTimer(period);
  }
  /** Original idle readiness ignores time and timeout. @returns Immediate. */
  protected override UpdateMinPeriod(): bigint {
    return Scheduler.ImmediateTimeoutMs;
  }
}

/** Native automatically repeating Idle. */
export class AutoIdle extends Idle {
  /** Original protected auto constructor binding. @param name - Debug name. @returns Idle. */
  constructor(name: string) {
    super(name, true);
  }
}
