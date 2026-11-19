/** @fileoverview Real compiled SDK std::mutex bootstrap/native construction and borrowed scoped_lock, with no injected exports or physical thread-race claim. */
import { it, expect } from "vitest";
import { initializeRuntime, getRuntime } from "../emscripten/runtime";
import { Mutex, ScopedLock, UniqueLock } from "./mutex";
it("requires the real realm runtime then calls its actual libc++ mutex and scoped-lock bodies", /** Cold bootstrap is observed without resetting or patching runtime state. @returns Completion. */ async () => {
  expect(getRuntime()).toBeUndefined();
  expect(/** Actual uninitialized ABI call. @returns Never. */ () => new Mutex()).toThrow(
    "Emscripten runtime must be initialized before std::mutex",
  );
  const runtime = await initializeRuntime();
  expect(runtime._office_std_mutex_create).toBeTypeOf("function");
  const mutex = new Mutex();
  try {
    mutex.lock();
    mutex.unlock();
    const guard = new ScopedLock(mutex);
    try {
      expect(getRuntime()).toBe(runtime);
    } finally {
      guard.dispose();
    }
    const unique = new UniqueLock(mutex);
    unique.dispose();
    mutex.lock();
    mutex.unlock();
  } finally {
    mutex.dispose();
  }
});
