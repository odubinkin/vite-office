/** @fileoverview Actual original explicit ThreadPool(0) task/tag queue runs genuine native package stream save/reopen in main and DOM-free Worker. Shared optimal/native worker threads are not substituted or qualified. */
import {
  ThreadPool,
  ThreadTask,
  type ThreadTaskTag,
} from "../../apps/office/src/comphelper/inc/threadpool";
import { probeNativePackageSave } from "./native-package-save-probe";
/** Concrete probe task uses the original abstract task extension point and genuine package operation. It is not a production parallel ZIP task. */
class PackageSaveTask extends ThreadTask {
  /** Retains actual tag and caller's observations. @param tag - Original tag. @param results - Observations. @returns Task. */
  constructor(
    tag: ThreadTaskTag,
    private readonly results: boolean[],
  ) {
    super(tag);
  }
  /** Actual package creation/save/reopen, without an assertion swallowed by source exec. @returns Nothing. */
  protected override doWork(): void {
    this.results.push(probeNativePackageSave());
  }
}
/** Checks source no-worker task completion using actual package work. @returns Complete observation. */
export function probeNativeNoWorkerThreadPool(): boolean {
  const pool = new ThreadPool(0),
    tag = ThreadPool.createThreadTaskTag(),
    results: boolean[] = [];
  try {
    pool.pushTask(new PackageSaveTask(tag, results));
    pool.pushTask(new PackageSaveTask(tag, results));
    if (ThreadPool.isTaskTagDone(tag)) return false;
    pool.waitUntilDone(tag, true);
    return (
      pool.getWorkerCount() === 0 &&
      pool.isIdle() &&
      ThreadPool.isTaskTagDone(tag) &&
      results.length === 2 &&
      results[0] === true &&
      results[1] === true
    );
  } finally {
    pool.dispose();
    tag.dispose();
  }
}
