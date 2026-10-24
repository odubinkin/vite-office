/** @fileoverview Original intrusive VCL scheduler record from schedulerimpl.hxx. References use actual Task identity under JavaScript GC. */
import { TaskPriority, type Task } from "./task";

/** Original queue/stack record;priority and update time are assigned by the actual scheduler. */
export class ImplSchedulerData {
  mpNext: ImplSchedulerData | null = null;
  mpTask: Task | null;
  mnUpdateTime = 0n;
  mePriority = TaskPriority.DEFAULT;
  mbInScheduler = false;
  /** Adapts aggregate allocation with the native task pointer. @param task - Actual owner. @returns Record. */
  constructor(task: Task) {
    this.mpTask = task;
  }
}
