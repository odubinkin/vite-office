/** @fileoverview Native scheduler.cxx Task lifecycle,priority queues and nested dispatch. Browser host timer/clock/input replace SAL platform services. Native process-event pumping,thread mutexes,debug logging and Emscripten thread transfer are not bound. */
import { TaskPriority, PRIO_COUNT } from "../../inc/task";
import { ImplSchedulerData } from "../../inc/schedulerimpl";
import { ImplGetSVData, type ImplSchedulerContext } from "../../inc/svdata";
import type { SchedulerPlatform } from "../../inc/scheduler";

let platform: SchedulerPlatform | null = null;
/** Binds the actual platform once per VCL realm,as native initialization installs its SAL instance. Rebinding the identical owner is harmless;replacing ownership is rejected. @param value - Real platform contract. @returns Nothing. */
export function bindSchedulerPlatform(value: SchedulerPlatform): void {
  if (platform !== null && platform !== value)
    throw Error("VCL scheduler platform ownership cannot be replaced");
  platform = value;
}
/** Requires actual native-platform initialization instead of returning fake clocks,input state or timer services. @returns Bound platform. */
function getPlatform(): SchedulerPlatform {
  if (platform === null) throw Error("VCL scheduler platform is not initialized");
  return platform;
}
/** Native monotonic-clock operation through the explicit platform boundary. @returns Native ticks. */
function getSystemTicks(): bigint {
  return getPlatform().getSystemTicks();
}
/** Platform input query for native clients such as chart TimerHdl;non-continuous input is the browser projection of its keyboard admission guard. @param includeContinuous - Include pointer movement. @returns Pending host input. */
export function isSchedulerInputPending(includeContinuous = true): boolean {
  return getPlatform().hasPendingInput(includeContinuous);
}

/** Native uint64 addition/subtraction at absolute timer deadlines. @param value - Arithmetic result. @returns Unsigned64 value. */
function uint64(value: bigint): bigint {
  return BigInt.asUintN(64, value);
}

/** Original AppendSchedulerData preserves FIFO order within the current task priority. @param context - Actual queues. @param record - Actual live record. @returns Nothing. */
function AppendSchedulerData(context: ImplSchedulerContext, record: ImplSchedulerData): void {
  const task = record.mpTask as Task;
  record.mePriority = task.GetPriority();
  record.mpNext = null;
  const last = context.mpLastSchedulerData[record.mePriority];
  if (!last) context.mpFirstSchedulerData[record.mePriority] = record;
  else last.mpNext = record;
  context.mpLastSchedulerData[record.mePriority] = record;
}

/** Original singly-linked removal does not destroy a record moved onto the invocation stack. @param context - Queues. @param previous - Predecessor. @param record - Removed record. @param priority - Actual queue index. @returns Successor. */
function DropSchedulerData(
  context: ImplSchedulerContext,
  previous: ImplSchedulerData | null,
  record: ImplSchedulerData,
  priority: number,
): ImplSchedulerData | null {
  const next = record.mpNext;
  if (previous) previous.mpNext = next;
  else context.mpFirstSchedulerData[priority] = next;
  if (context.mpLastSchedulerData[priority] === record)
    context.mpLastSchedulerData[priority] = previous;
  return next;
}

/** Original abstract VCL task retains actual scheduler-record ownership and source default flags. */
export abstract class Task {
  private mpSchedulerData: ImplSchedulerData | null = null;
  private readonly mpDebugName: string;
  private mePriority = TaskPriority.DEFAULT;
  private mbActive = false;
  private mbStatic = false;

  /** Original normal/copy constructors. Copy construction invokes the base Start,as C++ construction does. @param source - Debug name or native copy source. @returns Task. */
  constructor(source: string | Task) {
    if (typeof source === "string") this.mpDebugName = source;
    else {
      this.mpDebugName = source.mpDebugName;
      this.mePriority = source.mePriority;
      if (source.IsActive()) Task.prototype.Start.call(this);
    }
  }
  /** Original platform wakeup forwarding. @param milliseconds - Native delay. @returns Nothing. */
  protected static StartTimer(milliseconds: bigint): void {
    Scheduler["ImplStartTimer"](milliseconds, false, getSystemTicks());
  }
  /** Borrows the native queue record. @returns Current record or null. */
  protected GetSchedulerData(): ImplSchedulerData | null {
    return this.mpSchedulerData;
  }
  /** Original one-shot default clears activity before Invoke. @returns Nothing. */
  protected SetDeletionFlags(): void {
    this.mbActive = false;
  }
  /** Original readiness contract. @param now - Native ticks. @returns Delay or native infinity. */
  protected abstract UpdateMinPeriod(now: bigint): bigint;
  /** Original task callback. @returns Nothing. */
  abstract Invoke(): void;
  /** Native default has no transferred execution. @returns False. */
  DecideTransferredExecution(): boolean {
    return false;
  }
  /** Original queue admission,restart timestamp and priority-change record replacement. @param startTimer - Original default true. @returns Nothing. */
  Start(startTimer = true): void {
    const context = ImplGetSVData().maSchedCtx;
    if (!context.mbActive) return;
    if (this.mpSchedulerData && this.mpSchedulerData.mePriority !== this.mePriority) {
      this.mpSchedulerData.mpTask = null;
      this.mpSchedulerData = null;
    }
    this.mbActive = true;
    if (!this.mpSchedulerData) {
      this.mpSchedulerData = new ImplSchedulerData(this);
      AppendSchedulerData(context, this.mpSchedulerData);
    }
    this.mpSchedulerData.mnUpdateTime = getSystemTicks();
    if (startTimer) Task.StartTimer(0n);
  }
  /** Original Stop leaves record reclamation to the scheduler walk. @returns Nothing. */
  Stop(): void {
    this.mbActive = false;
  }
  /** Original changing priority does not itself move an already queued record. @param priority - New priority. @returns Nothing. */
  SetPriority(priority: TaskPriority): void {
    this.mePriority = priority;
  }
  /** Original priority borrow. @returns Priority. */
  GetPriority(): TaskPriority {
    return this.mePriority;
  }
  /** Original debug-name borrow. @returns Name. */
  GetDebugName(): string {
    return this.mpDebugName;
  }
  /** Original activity query. @returns Active. */
  IsActive(): boolean {
    return this.mbActive;
  }
  /** Original static-lifetime admission. @returns Nothing. */
  SetStatic(): void {
    this.mbStatic = true;
  }
  /** Original static-lifetime query. @returns Static. */
  IsStatic(): boolean {
    return this.mbStatic;
  }
  /** Original assignment retains debug/static identity and copies priority/activity through Stop/Start. @param source - Actual source. @returns Recipient. */
  assign(source: Task): this {
    if (source === this) return this;
    if (this.IsActive()) this.Stop();
    this.mbActive = false;
    this.mePriority = source.mePriority;
    if (source.IsActive()) this.Start();
    return this;
  }
  /** Original destructor clears the record's task pointer,including a record currently on the invocation stack. @returns Nothing. */
  Dispose(): void {
    if (!this.IsStatic() && this.mpSchedulerData) this.mpSchedulerData.mpTask = null;
  }
}

let deterministicMode = false;

/** Original native scheduling owner. Thread/OS pumping APIs are intentionally not exposed as successful browser stubs. */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- Preserve the original non-instantiable static Scheduler owner from scheduler.hxx.
export abstract class Scheduler {
  static readonly ImmediateTimeoutMs = 0n;
  static readonly InfiniteTimeoutMs = 0xffffffffffffffffn;

  /** Original idle lock within this realm;native cross-thread condition waits are not applicable to isolated JS realms. */
  static readonly IdlesLockGuard = class IdlesLockGuard {
    /** Increments the actual native context counter. @returns Guard. */
    constructor() {
      ++ImplGetSVData().maSchedCtx.mnIdlesLockCount;
    }
    /** Releases the original idle lock. @returns Nothing. */
    Dispose(): void {
      --ImplGetSVData().maSchedCtx.mnIdlesLockCount;
    }
  };

  /** Original earlier-deadline/forced platform timer scheduling through the bound native plugin contract. @param milliseconds - Native delay. @param force - Force reset. @param now - Native ticks. @returns Nothing. */
  private static ImplStartTimer(milliseconds: bigint, force: boolean, now: bigint): void {
    const context = ImplGetSVData().maSchedCtx;
    if (!context.mbActive) return;
    if (!context.mpSalTimer) {
      context.mnTimerStart = 0n;
      context.mnTimerPeriod = Scheduler.InfiniteTimeoutMs;
      context.mpSalTimer = getPlatform().createSalTimer();
      context.mpSalTimer.SetCallback(Scheduler.CallbackTaskScheduling);
    }
    const proposed = uint64(now + milliseconds),
      current =
        context.mnTimerPeriod === Scheduler.InfiniteTimeoutMs
          ? Scheduler.InfiniteTimeoutMs
          : uint64(context.mnTimerStart + context.mnTimerPeriod);
    if (force || proposed < current || (milliseconds === 0n && context.mnTimerPeriod !== 0n)) {
      context.mnTimerStart = now;
      context.mnTimerPeriod = milliseconds;
      context.mpSalTimer.Start(milliseconds);
    }
  }
  /** Original infinity stops the platform timer;other periods use native deadline selection. @param context - Actual state. @param period - Computed delay. @param force - Force reset. @param now - Native ticks. @returns Nothing. */
  private static UpdateSystemTimer(
    context: ImplSchedulerContext,
    period: bigint,
    force: boolean,
    now: bigint,
  ): void {
    if (period === Scheduler.InfiniteTimeoutMs) {
      context.mpSalTimer?.Stop();
      context.mnTimerPeriod = period;
    } else Scheduler.ImplStartTimer(period, force, now);
  }
  /** Original deterministic scheduling switch. @param deterministic - New mode. @returns Nothing. */
  static SetDeterministicMode(deterministic: boolean): void {
    deterministicMode = deterministic;
  }
  /** Original deterministic scheduling query. @returns Mode. */
  static GetDeterministicMode(): boolean {
    return deterministicMode;
  }
  /** Original wakeup does not synchronously execute tasks. @returns Nothing. */
  static Wakeup(): void {
    Scheduler.ImplStartTimer(0n, false, getSystemTicks());
  }
  /** Original non-mutating readiness query retains its platform-deadline guard. @returns Priority or minus one. */
  static GetMostUrgentTaskPriority(): number {
    const context = ImplGetSVData().maSchedCtx;
    if (!context.mbActive || context.mnTimerPeriod === Scheduler.InfiniteTimeoutMs) return -1;
    const now = getSystemTicks();
    if (now < uint64(context.mnTimerStart + context.mnTimerPeriod - 1n)) return -1;
    for (let priority = 0; priority < PRIO_COUNT; ++priority)
      for (let record = context.mpFirstSchedulerData[priority]; record; record = record.mpNext) {
        const task = record.mpTask;
        if (
          task &&
          task.IsActive() &&
          task["UpdateMinPeriod"](now) === Scheduler.ImmediateTimeoutMs
        )
          return priority;
      }
    return -1;
  }
  /** Original one-task dispatch,queue cleanup,priority/FIFO selection and nested invocation accounting. Uncaught task exceptions stop this realm's scheduler and escape;the browser cannot invoke native process abort. @returns Nothing. */
  static CallbackTaskScheduling(): void {
    const context = ImplGetSVData().maSchedCtx;
    if (!context.mbActive || context.mnTimerPeriod === Scheduler.InfiniteTimeoutMs) return;
    const now = getSystemTicks(),
      deadline = uint64(context.mnTimerStart + context.mnTimerPeriod);
    if (now < uint64(deadline - 1n)) {
      Scheduler.UpdateSystemTimer(context, deadline - now, true, now);
      return;
    }
    let minimum = Scheduler.InfiniteTimeoutMs,
      selected: ImplSchedulerData | null = null,
      selectedPrevious: ImplSchedulerData | null = null,
      selectedPriority = 0;
    for (let priority = 0; priority < PRIO_COUNT; ++priority) {
      let previous: ImplSchedulerData | null = null,
        record = context.mpFirstSchedulerData[priority] ?? null;
      while (record) {
        const task = record.mpTask;
        if (!task || !task.IsActive()) {
          const next = DropSchedulerData(context, previous, record, priority);
          if (task) task["mpSchedulerData"] = null;
          // Native delete releases these links;the non-owning stack-top identity must not retain a dead Task in JS.
          record.mpTask = null;
          record.mpNext = null;
          record = next;
          continue;
        }
        const ready = task["UpdateMinPeriod"](now);
        if (ready === Scheduler.ImmediateTimeoutMs) {
          if (!selected) {
            selected = record;
            selectedPrevious = previous;
            selectedPriority = priority;
          } else {
            minimum = Scheduler.ImmediateTimeoutMs;
            break;
          }
        } else if (minimum > ready) minimum = ready;
        previous = record;
        record = record.mpNext;
      }
      if (minimum === Scheduler.ImmediateTimeoutMs) break;
    }
    Scheduler.UpdateSystemTimer(context, minimum, true, now);
    if (!selected) return;
    const task = selected.mpTask as Task;
    selected.mbInScheduler = true;
    DropSchedulerData(context, selectedPrevious, selected, selectedPriority);
    selected.mpNext = context.mpSchedulerStack;
    context.mpSchedulerStack = selected;
    context.mpSchedulerStackTop = selected;
    const lowerIdle = selected.mePriority >= TaskPriority.HIGH_IDLE,
      delay = lowerIdle && (context.mnIdlesLockCount > 0 || getPlatform().hasPendingInput());
    try {
      if (!delay) {
        task["SetDeletionFlags"]();
        task.Invoke();
      }
    } catch (error) {
      context.mbActive = false;
      context.mpSalTimer?.Stop();
      throw error;
    }
    selected.mbInScheduler = false;
    context.mpSchedulerStack = selected.mpNext;
    const alive = selected.mpTask !== null && selected.mpTask.IsActive();
    if (!alive) {
      if (selected.mpTask) selected.mpTask["mpSchedulerData"] = null;
      selected.mpTask = null;
      selected.mpNext = null;
    } else AppendSchedulerData(context, selected);
    if (context.mpSchedulerStackTop !== selected)
      Scheduler.UpdateSystemTimer(context, Scheduler.ImmediateTimeoutMs, true, getSystemTicks());
    else if (alive) {
      selected.mnUpdateTime = now;
      const ready = (selected.mpTask as Task)["UpdateMinPeriod"](now);
      if (minimum > ready) minimum = ready;
      Scheduler.UpdateSystemTimer(context, minimum, false, now);
    }
  }
  /** Original release-profile shutdown stops the platform timer,detaches queued owners and clears all priority lists. Native debug-only logging/draining and application teardown are not bound. @returns Nothing. */
  static ImplDeInitScheduler(): void {
    const context = ImplGetSVData().maSchedCtx;
    context.mbActive = false;
    context.mpSalTimer?.Stop();
    context.mpSalTimer?.Dispose();
    context.mpSalTimer = null;
    for (let priority = 0; priority < PRIO_COUNT; ++priority) {
      let record = context.mpFirstSchedulerData[priority] ?? null;
      while (record) {
        const task = record.mpTask;
        if (task) {
          if (task.IsActive()) task["mbActive"] = false;
          task["mpSchedulerData"] = null;
          task.SetStatic();
        }
        const next = record.mpNext;
        record.mpTask = null;
        record.mpNext = null;
        record = next;
      }
      context.mpFirstSchedulerData[priority] = null;
      context.mpLastSchedulerData[priority] = null;
    }
    context.mnTimerPeriod = Scheduler.InfiniteTimeoutMs;
  }
}
