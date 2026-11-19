/** @fileoverview Original threadpool.cxx task/tag/FIFO/no-worker waiting and shutdown paths over the genuine native std::mutex. ThreadWorker launch, condition-variable pending waits and shared optimal pool remain unported; ThreadPool(0) is an original explicit constructor profile, never a replacement default for ZIP parallel compression. */
import { Mutex, ScopedLock, UniqueLock } from "../../../external/libcxx/mutex";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
const taskTag = Symbol("ThreadTask::mpTag"),
  exec = Symbol("ThreadTask::exec");
/** Original tag implementation with source signed task count and native mutex. Actual waiting with outstanding tasks still requires the missing native condition-variable binding. */
export class ThreadTaskTag {
  private readonly maMutex = new Mutex();
  private mnTasksWorking = 0;
  /** Original member destruction; callers bind final shared-owner destruction after all tasks release this object. Native shared_ptr ABI/atomic counts remain unqualified. @returns Nothing. */
  dispose(): void {
    this.maMutex.dispose();
  }
  /** Original guarded pending-task predicate. @returns True exactly at zero. */
  isDone(): boolean {
    const guard = new ScopedLock(this.maMutex);
    try {
      return this.mnTasksWorking === 0;
    } finally {
      guard.dispose();
    }
  }
  /** Original counter increment; source debug sanity assertion is not a new release-mode guard. @returns Nothing. */
  onTaskPushed(): void {
    const guard = new ScopedLock(this.maMutex);
    try {
      this.mnTasksWorking = (this.mnTasksWorking + 1) | 0;
    } finally {
      guard.dispose();
    }
  }
  /** Original counter decrement and zero notification point. The no-worker caller is already synchronous, without another waiting thread to notify. @returns Nothing. */
  onTaskWorkerDone(): void {
    const guard = new ScopedLock(this.maMutex);
    try {
      this.mnTasksWorking = (this.mnTasksWorking - 1) | 0;
    } finally {
      guard.dispose();
    }
  }
  /** Original immediate return when no task remains; pending condition-variable waits are an explicit prerequisite boundary. @returns Nothing. */
  waitUntilDone(): void {
    const guard = new UniqueLock(this.maMutex);
    try {
      if (this.mnTasksWorking > 0)
        throw new Error("ThreadTaskTag condition-variable waiting is not implemented");
    } finally {
      guard.dispose();
    }
  }
}
/** Original abstract task. The module-private symbols lower the ThreadPool friend access rather than exporting a replacement task runner. */
export abstract class ThreadTask {
  readonly [taskTag]: ThreadTaskTag;
  /** Original acquired shared tag expressed as a retained VM object. @param tag - Actual source tag. @returns Task owner. */
  constructor(tag: ThreadTaskTag) {
    this[taskTag] = tag;
  }
  /** Original virtual destructor binding. Derived tasks release their actual owned members here. @returns Nothing. */
  dispose(): void {
    /* Original base virtual destructor has an empty body. */
  }
  /** Original worker operation. @returns Nothing. */
  protected abstract doWork(): void;
  /** Original exec catches all work exceptions; no failed task is rethrown through the pool. Actual UNO values are destroyed after logging scope. @returns Nothing. */
  [exec](): void {
    try {
      this.doWork();
    } catch (error) {
      if (error instanceof Exception) error.dispose();
    }
  }
}
/** Original no-worker pool implementation. Positive worker counts retain their source construction state, but launch is unavailable rather than silently executing inline. */
export class ThreadPool {
  private readonly maMutex = new Mutex();
  private mbTerminate = true;
  private readonly mnMaxWorkers: number;
  private readonly mnBusyWorkers = 0;
  private readonly maTasks: ThreadTask[] = [];
  /** Original construction does not launch threads or execute queued tasks. @param workers - Original wasm32 size_t worker limit. @returns Pool. */
  constructor(workers: number) {
    this.mnMaxWorkers = workers >>> 0;
  }
  /** Original destructor asserts shutdown in debug and destroys remaining members. No implicit shutdown is inserted. @returns Nothing. */
  dispose(): void {
    for (const task of this.maTasks) task.dispose();
    this.maTasks.length = 0;
    this.maMutex.dispose();
  }
  /** Original fresh shared task tag. Native shared_ptr machine-level identity remains unqualified. @returns Actual tag. */
  static createThreadTaskTag(): ThreadTaskTag {
    return new ThreadTaskTag();
  }
  /** Original tag query. @param tag - Actual tag. @returns Source completion result. */
  static isTaskTagDone(tag: ThreadTaskTag): boolean {
    return tag.isDone();
  }
  /** Original configured maximum, including zero for the explicit no-worker constructor. @returns Source worker limit. */
  getWorkerCount(): number {
    return this.mnMaxWorkers | 0;
  }
  /** Original unguarded predicate, consumed under source pool locks by joining. @returns Source idle state. */
  isIdle(): boolean {
    return this.maTasks.length === 0 && this.mnBusyWorkers === 0;
  }
  /** Original state transition, worker-launch selection and front insertion. Task ownership transfers only after the real launch prerequisite is satisfied. @param task - Consumed actual task. @returns Nothing. */
  pushTask(task: ThreadTask): void {
    const guard = new ScopedLock(this.maMutex);
    try {
      this.mbTerminate = false;
      if (this.mnMaxWorkers > 0)
        throw new Error("ThreadPool ThreadWorker launch is not implemented");
      task[taskTag].onTaskPushed();
      this.maTasks.unshift(task);
    } finally {
      guard.dispose();
    }
  }
  /** Original no-worker back removal: insertion at front plus removal at back is FIFO. Pool lock must already be held. @param wait - Original pending-wait selection. @returns Owned task or null. */
  private popWorkLocked(wait: boolean): ThreadTask | null {
    if (this.maTasks.length) return this.maTasks.pop() as ThreadTask;
    if (!wait || this.mbTerminate) return null;
    throw new Error("ThreadPool task condition-variable waiting is not implemented");
  }
  /** Original explicit no-worker waiting executes queue entries until the selected tag finishes, including earlier entries from other tags. Emscripten source default bJoin=false is retained. @param tag - Actual waited tag. @param join - Source optional join flag. @returns Nothing. */
  waitUntilDone(tag: ThreadTaskTag, join = false): void {
    const guard = new UniqueLock(this.maMutex);
    try {
      while (!tag.isDone()) {
        const task = this.popWorkLocked(false);
        if (!task) break;
        const currentTag = task[taskTag];
        try {
          task[exec]();
          currentTag.onTaskWorkerDone();
        } finally {
          task.dispose();
        }
      }
    } finally {
      guard.dispose();
    }
    tag.waitUntilDone();
    if (join) this.joinThreadsIfIdle();
  }
  /** Original join refuses to discard unrelated queued tasks. Successful no-worker shutdown runs under the existing lock. @returns True only if initially idle. */
  joinThreadsIfIdle(): boolean {
    const guard = new UniqueLock(this.maMutex);
    try {
      if (this.isIdle()) {
        this.shutdownLocked();
        return true;
      }
      return false;
    } finally {
      guard.dispose();
    }
  }
  /** Original explicit shutdown drains all no-worker tasks regardless of tag. @returns Nothing. */
  shutdown(): void {
    const guard = new UniqueLock(this.maMutex);
    try {
      this.shutdownLocked();
    } finally {
      guard.dispose();
    }
  }
  /** Original no-worker shutdown loop retains the last unique task until branch exit, then sets termination. No native thread/condition-variable shutdown is claimed. @returns Nothing. */
  private shutdownLocked(): void {
    let previous: ThreadTask | null = null;
    try {
      for (;;) {
        const next = this.popWorkLocked(false);
        previous?.dispose();
        previous = next;
        if (!previous) break;
        const tag = previous[taskTag];
        previous[exec]();
        tag.onTaskWorkerDone();
      }
    } finally {
      previous?.dispose();
    }
    this.mbTerminate = true;
    // The original worker-vector swap/join has no elements in this constructor profile.
  }
}
