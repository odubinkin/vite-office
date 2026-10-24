/** @fileoverview Native VCL scheduling through actual Task/Timer/Idle owners and the actual browser platform timer. Fake host time controls delivery without replacing kernel queues. */
import { assert, beforeEach, afterEach, expect, it, vi } from "vitest";

/** Actual source-owned APIs for each fresh process-static realm. */
type Native = typeof import("../../inc/task") &
  typeof import("../../inc/timer") &
  typeof import("../../inc/idle") &
  typeof import("../../inc/scheduler") &
  typeof import("../../inc/svdata") &
  typeof import("../../browser/sal-timer");
let n: Native;

beforeEach(
  /** Loads a fresh actual static realm and positive native ticks,without adding a production reset API. @returns Initialization. */ async () => {
    vi.resetModules();
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance", "Date"] });
    vi.advanceTimersByTime(1000);
    const modules = await Promise.all([
      import("../../inc/task"),
      import("../../inc/timer"),
      import("../../inc/idle"),
      import("../../inc/scheduler"),
      import("../../inc/svdata"),
      import("../../browser/sal-timer"),
    ]);
    n = Object.assign({}, ...modules) as Native;
    n.bindSchedulerPlatform(n.browserSchedulerPlatform);
  },
);
afterEach(
  /** Shuts down the actual native realm before releasing controlled host APIs. @returns Nothing. */ () => {
    n.Scheduler.ImplDeInitScheduler();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  },
);

/** Concrete native Task client,like upstream's virtual timer-test tasks;all queue/lifecycle behavior remains inherited. @param callback - Native Invoke body. @param source - Name or actual copied task. @returns Actual Task subclass. */
function readyTask(callback: () => void, source: string | InstanceType<Native["Task"]> = "ready") {
  /** Concrete native virtual Task client;queue and lifecycle operations remain inherited. */
  class ReadyTask extends n.Task {
    /** Actual native ready policy. @returns Immediate. */
    protected UpdateMinPeriod(): bigint {
      return n.Scheduler.ImmediateTimeoutMs;
    }
    /** Actual task work. @returns Nothing. */
    Invoke(): void {
      callback();
    }
  }
  return new ReadyTask(source);
}

it("requires real platform initialization and retains the bound platform owner", /** Admission checks do not silently substitute a timer or input service. @returns Completion. */ async () => {
  n.bindSchedulerPlatform(n.browserSchedulerPlatform);
  expect(
    /** Different ownership is rejected even when both descriptors reference actual browser functions. @returns Nothing. */ () =>
      n.bindSchedulerPlatform({ ...n.browserSchedulerPlatform }),
  ).toThrow("ownership cannot be replaced");
  vi.resetModules();
  const unbound = await import("../../inc/scheduler");
  expect(
    /** Native work cannot start before platform initialization. @returns Nothing. */ () =>
      unbound.Scheduler.Wakeup(),
  ).toThrow("platform is not initialized");
  unbound.bindSchedulerPlatform(n.browserSchedulerPlatform);
  unbound.Scheduler.Wakeup();
  vi.advanceTimersByTime(0);
  unbound.Scheduler.ImplDeInitScheduler();
});

it("retains native static identity,defaults,callback pointer overloads and public constants", /** Uses actual constructors and callback owners. @returns Nothing. */ () => {
  const data = n.ImplGetSVData(),
    timer = new n.Timer("native timer"),
    idle = new n.Idle("native idle"),
    task = readyTask(/** No work until scheduled. @returns Nothing. */ () => {});
  expect(n.ImplGetSVData()).toBe(data);
  expect(n.PRIO_COUNT).toBe(10);
  expect(n.EDIT_UPDATEDATA_TIMEOUT).toBe(350);
  expect(n.getSystemTicks()).toBe(1000n);
  expect(n.isSchedulerInputPending()).toBe(false);
  expect(n.isSchedulerInputPending(false)).toBe(false);
  expect([timer.IsActive(), timer.IsStatic(), task.DecideTransferredExecution()]).toEqual([
    false,
    false,
    false,
  ]);
  expect(timer.GetDebugName()).toBe("native timer");
  expect(timer.GetTimeout()).toBe(0n);
  expect(timer.GetPriority()).toBe(n.TaskPriority.DEFAULT);
  expect(idle.GetPriority()).toBe(n.TaskPriority.DEFAULT_IDLE);
  timer.Invoke();
  const values: (InstanceType<Native["Timer"]> | null)[] = [];
  timer.SetInvokeHandler(
    /** Observes native pointer/null identity. @param value - Callback pointer. @returns Nothing. */ (
      value,
    ) => {
      values.push(value);
    },
  );
  timer.Invoke();
  timer.Invoke(null);
  timer.Invoke(idle);
  timer.ClearInvokeHandler();
  timer.Invoke();
  expect(values).toEqual([timer, null, idle]);
  expect(n.Scheduler.GetDeterministicMode()).toBe(false);
  n.Scheduler.CallbackTaskScheduling();
  expect(n.Scheduler.GetMostUrgentTaskPriority()).toBe(-1);
  timer.Dispose();
  idle.Dispose();
  task.Dispose();
});

it("orders priority queues and FIFO while a priority change waits for the next Start", /** Restarts preserve record identity instead of duplicating queue entries. @returns Nothing. */ () => {
  const events: string[] = [],
    low = readyTask(/** Low work. @returns Nothing. */ () => events.push("low"), "low"),
    first = readyTask(
      /** First default work. @returns Nothing. */ () => events.push("first"),
      "first",
    ),
    second = readyTask(
      /** Second default work. @returns Nothing. */ () => events.push("second"),
      "second",
    );
  low.SetPriority(n.TaskPriority.REPAINT);
  low.Start();
  const record = n.ImplGetSVData().maSchedCtx.mpFirstSchedulerData[n.TaskPriority.REPAINT];
  assert(record);
  expect(record.mpTask?.GetDebugName()).toBe("low");
  low.Start();
  expect(n.ImplGetSVData().maSchedCtx.mpFirstSchedulerData[n.TaskPriority.REPAINT]).toBe(record);
  low.SetPriority(n.TaskPriority.HIGHEST);
  first.Start();
  second.Start();
  expect(n.Scheduler.GetMostUrgentTaskPriority()).toBe(n.TaskPriority.DEFAULT);
  vi.advanceTimersByTime(10);
  expect(events).toEqual(["first", "second", "low"]);
  expect(low.IsActive()).toBe(false);
  for (const task of [low, first, second]) task.Dispose();
});

it("replaces stale-priority records and cleans stopped/deleted head,middle and tail records", /** Actual native records retain null task pointers until the queue walks them. @returns Nothing. */ () => {
  const events: string[] = [],
    head = new n.Timer("head"),
    future = new n.Timer("future"),
    middle = new n.Timer("middle"),
    tail = new n.Timer("tail"),
    moved = readyTask(
      /** Moved task work. @returns Nothing. */ () => events.push("moved"),
      "moved",
    );
  head.Start(false);
  const deleted = n.ImplGetSVData().maSchedCtx.mpFirstSchedulerData[n.TaskPriority.DEFAULT];
  assert(deleted);
  head.Dispose();
  expect(deleted.mpTask).toBeNull();
  future.SetTimeout(100n);
  future.SetInvokeHandler(/** Native future work. @returns Nothing. */ () => events.push("future"));
  future.Start(false);
  middle.Start(false);
  middle.Stop();
  tail.Start(false);
  tail.Stop();
  moved.SetPriority(n.TaskPriority.REPAINT);
  moved.Start(false);
  moved.SetPriority(n.TaskPriority.HIGHEST);
  moved.Start(false);
  expect(n.Scheduler.GetMostUrgentTaskPriority()).toBe(-1);
  n.Scheduler.Wakeup();
  expect(n.Scheduler.GetMostUrgentTaskPriority()).toBe(n.TaskPriority.HIGHEST);
  vi.advanceTimersByTime(0);
  expect(events).toEqual(["moved"]);
  vi.advanceTimersByTime(99);
  expect(events).toEqual(["moved"]);
  vi.advanceTimersByTime(1);
  expect(events).toEqual(["moved", "future"]);
  for (const timer of [future, middle, tail, moved]) timer.Dispose();
});

it("defers platform wakeup when requested and preserves deadline guards and one-shot completion", /** An early manual scheduler callback re-arms rather than firing a future timer. @returns Nothing. */ () => {
  const timer = new n.Timer("deferred");
  let count = 0;
  timer.SetTimeout(50n);
  timer.SetInvokeHandler(/** Actual timeout. @returns Nothing. */ () => ++count);
  timer.Start(false);
  expect(n.Scheduler.GetMostUrgentTaskPriority()).toBe(-1);
  n.Scheduler.Wakeup();
  expect(n.Scheduler.GetMostUrgentTaskPriority()).toBe(-1);
  vi.advanceTimersByTime(10);
  expect(count).toBe(0);
  timer.Start();
  n.Scheduler.CallbackTaskScheduling();
  expect(n.Scheduler.GetMostUrgentTaskPriority()).toBe(-1);
  vi.advanceTimersByTime(49);
  expect(count).toBe(0);
  vi.advanceTimersByTime(1);
  expect(count).toBe(1);
  expect(timer.IsActive()).toBe(false);
  vi.advanceTimersByTime(100);
  expect(count).toBe(1);
  timer.Dispose();
});

it("retains the original queue timestamp on active SetTimeout and avoids extending an earlier host wakeup", /** Source SetTimeout renews platform scheduling without Task.Start's timestamp reset. @returns Nothing. */ () => {
  const timer = new n.Timer("changed timeout"),
    events: bigint[] = [];
  timer.SetTimeout(100n);
  timer.SetInvokeHandler(
    /** Records the native monotonic deadline. @returns Nothing. */ () =>
      events.push(n.getSystemTicks()),
  );
  timer.Start();
  vi.advanceTimersByTime(10);
  timer.SetTimeout(20n);
  n.Scheduler.Wakeup();
  vi.advanceTimersByTime(9);
  expect(events).toEqual([]);
  vi.advanceTimersByTime(1);
  expect(events).toEqual([1020n]);
  timer.SetTimeout(20n);
  timer.Start();
  vi.advanceTimersByTime(5);
  timer.SetTimeout(30n);
  vi.advanceTimersByTime(24);
  expect(events).toEqual([1020n]);
  vi.advanceTimersByTime(1);
  expect(events).toEqual([1020n, 1050n]);
  timer.Dispose();
});

it("copies Task activity/priority but Timer copies only handler,timeout,auto and name", /** Genuine native overload differences remain observable. @returns Nothing. */ () => {
  let count = 0;
  const source = readyTask(/** Actual source work. @returns Nothing. */ () => ++count, "source");
  source.SetPriority(n.TaskPriority.HIGHEST);
  const inactiveCopy = readyTask(
    /** Inactive copied work. @returns Nothing. */ () => ++count,
    source,
  );
  expect(inactiveCopy.IsActive()).toBe(false);
  source.Start();
  const copy = readyTask(/** Active copied work. @returns Nothing. */ () => ++count, source),
    target = readyTask(/** Assigned work. @returns Nothing. */ () => ++count, "recipient");
  expect(copy.GetPriority()).toBe(n.TaskPriority.HIGHEST);
  expect(copy.IsActive()).toBe(true);
  target.Start();
  expect(target.assign(source)).toBe(target);
  expect(target.assign(target)).toBe(target);
  expect(target.GetDebugName()).toBe("recipient");
  target.assign(inactiveCopy);
  expect(target.IsActive()).toBe(false);
  vi.advanceTimersByTime(5);
  expect(count).toBe(2);
  const timer = new n.Timer("timer copy source"),
    pointers: (InstanceType<Native["Timer"]> | null)[] = [];
  timer.SetTimeout(20n);
  timer.SetPriority(n.TaskPriority.REPAINT);
  timer.SetInvokeHandler(
    /** Native handler copied by value. @param pointer - Recipient pointer. @returns Nothing. */ (
      pointer,
    ) => pointers.push(pointer),
  );
  timer.Start();
  const timerCopy = new n.Timer(timer),
    assigned = new n.Timer("timer recipient");
  expect(timerCopy.IsActive()).toBe(false);
  expect(timerCopy.GetPriority()).toBe(n.TaskPriority.DEFAULT);
  expect(timerCopy.GetTimeout()).toBe(20n);
  timerCopy.Invoke();
  assigned.assign(timer);
  assigned.assign(assigned);
  expect(assigned.IsActive()).toBe(true);
  expect(assigned.GetDebugName()).toBe("timer recipient");
  vi.advanceTimersByTime(25);
  expect(pointers).toEqual([timerCopy, timer, assigned]);
  for (const task of [source, inactiveCopy, copy, target, timer, timerCopy, assigned])
    task.Dispose();
});

it("repeats AutoTimer/AutoIdle and preserves the recipient's auto policy across assignment", /** Real callbacks stop their own tasks after multiple dispatches. @returns Nothing. */ () => {
  const timer = new n.AutoTimer("auto"),
    idle = new n.AutoIdle("auto idle"),
    peer = new n.Timer("same-deadline peer"),
    events: string[] = [];
  timer.SetTimeout(5n);
  timer.SetInvokeHandler(
    /** Native repeated timer. @returns Nothing. */ () => {
      events.push("timer");
      if (
        events.filter(
          /** Counts actual timer calls. @param value - Event. @returns Match. */ (value) =>
            value === "timer",
        ).length === 2
      )
        timer.Stop();
    },
  );
  idle.SetInvokeHandler(
    /** Native repeated idle. @returns Nothing. */ () => {
      events.push("idle");
      if (
        events.filter(
          /** Counts actual idle calls. @param value - Event. @returns Match. */ (value) =>
            value === "idle",
        ).length === 2
      )
        idle.Stop();
    },
  );
  timer.Start();
  peer.SetTimeout(5n);
  peer.SetInvokeHandler(
    /** A due peer keeps the next native dispatch immediate. @returns Nothing. */ () =>
      events.push("peer"),
  );
  peer.Start();
  idle.Start();
  vi.advanceTimersByTime(20);
  expect(
    events.filter(
      /** Timer observations. @param value - Event. @returns Match. */ (value) => value === "timer",
    ),
  ).toHaveLength(2);
  expect(
    events.filter(
      /** Idle observations. @param value - Event. @returns Match. */ (value) => value === "idle",
    ),
  ).toHaveLength(2);
  const single = new n.Timer("single"),
    assigned = new n.AutoTimer("auto recipient");
  let repeats = 0;
  single.SetTimeout(2n);
  single.SetInvokeHandler(
    /** Recipient retains its own const auto policy. @param value - Actual callback timer. @returns Nothing. */ (
      value,
    ) => {
      if (value === assigned && ++repeats === 2) assigned.Stop();
    },
  );
  assigned.assign(single);
  assigned.Start();
  vi.advanceTimersByTime(10);
  expect(repeats).toBe(2);
  expect(
    events.filter(
      /** Peer observations. @param value - Event. @returns Match. */ (value) => value === "peer",
    ),
  ).toHaveLength(1);
  for (const task of [timer, idle, peer, single, assigned]) task.Dispose();
});

it("applies deterministic default/lowest policy while higher-priority wakeups can run queued idles", /** Native deterministic policy changes the initial wakeup,not readiness of an already queued idle. @returns Nothing. */ () => {
  const events: string[] = [],
    ordinary = new n.Idle("ordinary"),
    lowest = new n.Idle("lowest"),
    repaint = new n.Idle("repaint");
  ordinary.SetInvokeHandler(/** Ordinary idle. @returns Nothing. */ () => events.push("ordinary"));
  lowest.SetPriority(n.TaskPriority.LOWEST);
  lowest.SetInvokeHandler(/** Lowest idle. @returns Nothing. */ () => events.push("lowest"));
  repaint.SetPriority(n.TaskPriority.REPAINT);
  repaint.SetInvokeHandler(/** Repaint idle. @returns Nothing. */ () => events.push("repaint"));
  n.Scheduler.SetDeterministicMode(true);
  ordinary.Start();
  lowest.Start(false);
  n.Scheduler.CallbackTaskScheduling();
  expect(events).toEqual([]);
  expect(n.Scheduler.GetMostUrgentTaskPriority()).toBe(-1);
  repaint.Start();
  vi.advanceTimersByTime(5);
  expect(events).toEqual(["repaint", "ordinary", "lowest"]);
  n.Scheduler.SetDeterministicMode(false);
  for (const task of [ordinary, lowest, repaint]) task.Dispose();
});

it("delays native idles under nested guards and actual platform input admission", /** Host capability simulation is confined to the browser adapter;kernel owners and queue state are genuine. @returns Nothing. */ () => {
  const idle = new n.Idle("locked"),
    first = new n.Scheduler.IdlesLockGuard(),
    second = new n.Scheduler.IdlesLockGuard();
  let count = 0;
  idle.SetInvokeHandler(/** Actual idle work. @returns Nothing. */ () => ++count);
  idle.Start();
  n.Scheduler.CallbackTaskScheduling();
  expect(count).toBe(0);
  first.Dispose();
  n.Scheduler.CallbackTaskScheduling();
  expect(count).toBe(0);
  second.Dispose();
  const options: object[] = [];
  vi.stubGlobal("navigator", {
    scheduling: {
      /** Simulates only host pending-input information. @param value - Actual adapter flags. @returns Pending. */
      isInputPending(value: object): boolean {
        options.push(value);
        return true;
      },
    },
  });
  n.Scheduler.CallbackTaskScheduling();
  expect(count).toBe(0);
  expect(options).toEqual([{ includeContinuous: true }]);
  vi.stubGlobal("navigator", undefined);
  vi.advanceTimersByTime(0);
  expect(count).toBe(1);
  idle.Dispose();
});

it("retains nested dispatch accounting and real callback-side deletion/priority restart", /** A nested callback must not corrupt the queue or overwrite the scheduler stack. @returns Nothing. */ () => {
  const events: string[] = [],
    first = readyTask(
      /** Invokes the actual scheduler recursively. @returns Nothing. */ () => {
        events.push("first:start");
        n.Scheduler.CallbackTaskScheduling();
        events.push("first:end");
      },
    ),
    second = readyTask(/** Nested task. @returns Nothing. */ () => events.push("second"));
  first.Start();
  second.Start();
  vi.advanceTimersByTime(5);
  expect(events).toEqual(["first:start", "second", "first:end"]);
  const deleting = new n.AutoTimer("delete during callback"),
    moving = new n.AutoIdle("move during callback");
  deleting.SetInvokeHandler(
    /** Destruction clears the actual on-stack task pointer. @returns Nothing. */ () =>
      deleting.Dispose(),
  );
  let calls = 0;
  moving.SetInvokeHandler(
    /** A priority restart replaces the on-stack record without deleting the replacement. @returns Nothing. */ () => {
      if (++calls === 1) {
        moving.SetPriority(n.TaskPriority.HIGHEST);
        moving.Start();
      } else moving.Stop();
    },
  );
  deleting.Start();
  moving.Start();
  vi.advanceTimersByTime(5);
  expect(calls).toBe(2);
  expect(n.Scheduler.GetMostUrgentTaskPriority()).toBe(-1);
  for (const task of [first, second, moving]) task.Dispose();
});

it("detaches queued static owners on shutdown and refuses later wakeup/admission", /** Native deinit reclaims records for both stopped and live tasks. @returns Nothing. */ () => {
  const timer = new n.Timer("live"),
    stopped = new n.Timer("stopped"),
    deleted = new n.Timer("deleted");
  timer.SetTimeout(20n);
  timer.Start();
  stopped.Start(false);
  stopped.Stop();
  deleted.Start(false);
  deleted.Dispose();
  n.Scheduler.ImplDeInitScheduler();
  expect(timer.IsActive()).toBe(false);
  expect(timer.IsStatic()).toBe(true);
  expect(stopped.IsStatic()).toBe(true);
  timer.Dispose();
  stopped.Dispose();
  timer.Start();
  n.Scheduler.Wakeup();
  n.Scheduler.CallbackTaskScheduling();
  expect(n.Scheduler.GetMostUrgentTaskPriority()).toBe(-1);
  expect(vi.getTimerCount()).toBe(0);
});

it("stops this browser realm's scheduler when a native task throws", /** Browser fatal binding prevents further queue execution instead of swallowing task errors. @returns Nothing. */ () => {
  const error = Error("native task failure"),
    task = readyTask(
      /** Actual failing task. @returns Never. */ () => {
        throw error;
      },
    );
  task.Start();
  expect(
    /** Dispatches the real task. @returns Nothing. */ () => n.Scheduler.CallbackTaskScheduling(),
  ).toThrow(error);
  expect(n.ImplGetSVData().maSchedCtx.mbActive).toBe(false);
  n.Scheduler.Wakeup();
  expect(n.Scheduler.GetMostUrgentTaskPriority()).toBe(-1);
  expect(vi.getTimerCount()).toBe(0);
});
