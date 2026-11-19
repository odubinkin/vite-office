/** @fileoverview Genuine OSL recursive mutex/native runtime/RefCountedMutex and original ZipEntry value contracts, prerequisites for native ZipFile directory/LOC parsing. No simulated lock registry, fake mutex or JS allocation/free emulator. */
import { afterEach, expect, it } from "vitest";
import { own, releaseDomScope, u, read } from "../../../test/native-dom";
import { initializeRuntime, getRuntime } from "../../../external/emscripten/runtime";
import { initializeExceptionAbi } from "../../../cppuhelper/browser/exception-abi";
import {
  osl_createMutex,
  osl_destroyMutex,
  osl_acquireMutex,
  osl_tryToAcquireMutex,
  osl_releaseMutex,
} from "../../../sal/osl/unx/mutex";
import { Mutex, MutexGuard } from "../../../sal/inc/osl/mutex";
import { RefCountedMutex } from "../../../comphelper/inc/refcountedmutex";
import { Reference } from "../../../sal/inc/rtl/ref";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { ZipEntry } from "../../inc/ZipEntry";
afterEach(releaseDomScope);
it("boots actual OSL C entry points and preserves real native null/recursive status", /** Current build uses actual Emscripten non-pthread libc stubs; these are not a JS mutex implementation or a multithreaded guarantee. @returns Completion. */ async () => {
  expect(getRuntime()).toBeUndefined();
  expect(osl_createMutex).toThrow(
    "Emscripten runtime must be initialized before OSL mutex operations",
  );
  await initializeExceptionAbi();
  await initializeRuntime();
  expect(osl_acquireMutex(0)).toBe(false);
  expect(osl_tryToAcquireMutex(0)).toBe(false);
  expect(osl_releaseMutex(0)).toBe(false);
  osl_destroyMutex(0);
  const handle = osl_createMutex();
  expect(handle).toBeGreaterThan(0);
  try {
    expect(osl_acquireMutex(handle)).toBe(true);
    expect(osl_tryToAcquireMutex(handle)).toBe(true);
    expect(osl_releaseMutex(handle)).toBe(true);
    expect(osl_releaseMutex(handle)).toBe(true);
  } finally {
    osl_destroyMutex(handle);
  }
});
it("uses actual native Mutex and source guard acquire/release contracts", /** Scope disposal invokes the real C unlock before native destruction. Source null-pointer assertion is only the JS compiler assertion profile, not a native-abort differential. @returns Nothing. */ () => {
  const mutex = new Mutex();
  try {
    expect(mutex.acquire()).toBe(true);
    expect(mutex.tryToAcquire()).toBe(true);
    expect(mutex.release()).toBe(true);
    expect(mutex.release()).toBe(true);
    const outer = new MutexGuard(mutex);
    try {
      const inner = new MutexGuard(mutex);
      inner.dispose();
    } finally {
      outer.dispose();
    }
    expect(
      /** Original null pointer overload precondition. @returns Guard if unexpectedly accepted. */ () =>
        new MutexGuard(null),
    ).toThrow("assert(pT != NULL)");
  } finally {
    mutex.dispose();
  }
});
it("retains genuine shared mutex identity and native member lifetime under original intrusive refs", /** Actual SimpleReferenceObject and rtl::Reference own the same native member; no second lock or lifetime controller. @returns Nothing. */ () => {
  const first = new Reference(new RefCountedMutex()),
    second = new Reference(first);
  try {
    expect(second.get()).toBe(first.get());
    const mutex = first.operatorStar().GetMutex();
    expect(second.operatorStar().GetMutex()).toBe(mutex);
    const guard = new MutexGuard(mutex);
    guard.dispose();
    first.dispose();
    expect(second.operatorStar().GetMutex().tryToAcquire()).toBe(true);
    expect(second.operatorStar().GetMutex().release()).toBe(true);
  } finally {
    first.dispose();
    second.dispose();
  }
});
it("retains original ZipEntry native string/default/copy member semantics without zeroing unspecified integers", /** Only initialized source scalar values are observed; native uninitialized scalar/physical ABI domains are not qualified by JS undefined. @returns Nothing. */ () => {
  const original = own(new ZipEntry());
  expect(read(new OUString(original.sPath))).toBe("");
  original.nVersion = 20;
  original.nFlag = 0x800;
  original.nMethod = 8;
  original.nTime = 0x12345678;
  original.nCrc = -1;
  original.nCompressedSize = 7n;
  original.nSize = 12n;
  original.nOffset = -30n;
  original.nPathLen = 7;
  original.nExtraLen = 0;
  original.sPath.assign(u("a/字.xml"));
  const copied = own(new ZipEntry(original));
  expect(copied.sPath).not.toBe(original.sPath);
  expect(copied.sPath.equals(original.sPath)).toBe(true);
  expect([
    copied.nVersion,
    copied.nFlag,
    copied.nMethod,
    copied.nTime,
    copied.nCrc,
    copied.nPathLen,
    copied.nExtraLen,
  ]).toEqual([20, 0x800, 8, 0x12345678, -1, 7, 0]);
  expect([copied.nCompressedSize, copied.nSize, copied.nOffset]).toEqual([7n, 12n, -30n]);
  original.sPath.assign(u("other.xml"));
  expect(copied.sPath.equals(u("a/字.xml"))).toBe(true);
});

it("ports original osl_Mutex acquire_002 single-thread recursive status assertions", /** Exact original two acquires, try-acquire, one release and success assertions; no invented thread or lock contention. Native pthread-busy/allocator behavior is outside this non-pthread profile. @returns Nothing. */ () => {
  const mutex = new Mutex();
  try {
    const first = mutex.acquire(),
      second = mutex.acquire(),
      tried = mutex.tryToAcquire();
    mutex.release();
    expect(first).toBe(true);
    expect(second).toBe(true);
    expect(tried).toBe(true);
  } finally {
    mutex.dispose();
  }
});
