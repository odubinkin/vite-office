/** @fileoverview Consumed exception_ptr empty/copy/assignment/identity/rethrow/lifetime contracts over actual typed UNO exceptions and the existing JavaScript exception ABI. Physical native exception addresses/atomic counts and nonobject JS throws remain unqualified. */
import { afterEach, beforeAll, expect, it } from "vitest";
import { initializeRuntime } from "../../external/emscripten/runtime";
import { initializeExceptionAbi } from "./exception-abi";
import { ExceptionPtr } from "../../external/libcxx/exception";
import { IllegalArgumentException } from "../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { RuntimeException } from "../../cppu/inc/com/sun/star/uno/RuntimeException";
import { Exception } from "../../cppu/inc/com/sun/star/uno/Exception";
import { Reference } from "../../cppu/inc/com/sun/star/uno/Reference";
import { OUString } from "../../sal/inc/rtl/ustring";
import { ActiveDataSink } from "../../ucbhelper/source/client/activedatasink";
import { WeakReferenceHelper } from "../inc/weakref";
import { own, u, read, releaseDomScope } from "../../test/native-dom";
beforeAll(
  /** Actual realm library/exception ABI bootstrap. @returns Completion. */ async () => {
    await initializeRuntime();
    initializeExceptionAbi();
  },
);
afterEach(releaseDomScope);
/** Genuine weak context observation without keeping a strong result alive. @param weak - Actual weak owner. @returns Source liveness. */
function alive(weak: WeakReferenceHelper): boolean {
  const value = weak.get();
  try {
    return value.is();
  } finally {
    value.dispose();
  }
}
/** Executes original rethrow/catch, inspecting real generated fields outside any task catch-all. @param pointer - Actual retained pointer. @returns Actual recaptured pointer. */
function recapture(pointer: ExceptionPtr): ExceptionPtr {
  try {
    pointer.rethrow();
  } catch (error) {
    if (!(error instanceof IllegalArgumentException)) throw error;
    try {
      expect(read(new OUString(error.Message))).toBe("retained 字😀");
      expect(error.ArgumentPosition).toBe(7);
      return own(ExceptionPtr.capture(error));
    } finally {
      error.dispose();
    }
  }
}
it("retains the original empty/copy/equality and guarded self-assignment values", /** Empty pointer operations create no generated exception or fake payload. @returns Nothing. */ () => {
  const empty = own(new ExceptionPtr()),
    copy = own(new ExceptionPtr(empty));
  expect(empty.is()).toBe(false);
  expect(copy.equals(empty)).toBe(true);
  expect(empty.assign(empty)).toBe(empty);
  expect(empty.assign(copy).is()).toBe(false);
  expect(
    /** Empty native rethrow is outside the supported domain. @returns Never. */ () =>
      empty.rethrow(),
  ).toThrow("nonempty exception_ptr");
});
it("retains actual UNO context until the final pointer releases its genuine Any", /** Native pointer copies share one retained exception value and do not manufacture a replacement component. @returns Nothing. */ () => {
  const context = own(new Reference(new ActiveDataSink())),
    weak = own(new WeakReferenceHelper(context));
  let pointer: ExceptionPtr;
  try {
    throw new IllegalArgumentException(u("retained 字😀"), context, 7);
  } catch (error) {
    if (!(error instanceof IllegalArgumentException)) throw error;
    try {
      pointer = own(ExceptionPtr.capture(error));
      const again = own(ExceptionPtr.capture(error));
      expect(again.equals(pointer)).toBe(true);
      again.dispose();
    } finally {
      error.dispose();
    }
  }
  const copy = own(new ExceptionPtr(pointer));
  context.clear();
  expect(alive(weak)).toBe(true);
  pointer.assign(own(new ExceptionPtr()));
  expect(pointer.is()).toBe(false);
  expect(alive(weak)).toBe(true);
  const recaught = recapture(copy);
  expect(recaught.equals(copy)).toBe(true);
  copy.dispose();
  expect(alive(weak)).toBe(true);
  recaught.dispose();
  expect(alive(weak)).toBe(false);
});
it("replaces retained UNO exceptions through source acquire-before-release assignment", /** Actual weak component lifetimes distinguish the two retained values. @returns Nothing. */ () => {
  const first = own(new Reference(new ActiveDataSink())),
    second = own(new Reference(new ActiveDataSink())),
    a = own(new WeakReferenceHelper(first)),
    b = own(new WeakReferenceHelper(second));
  const x = new RuntimeException(u("a"), first),
    y = new RuntimeException(u("b"), second),
    p = own(ExceptionPtr.capture(x)),
    q = own(ExceptionPtr.capture(y));
  x.dispose();
  y.dispose();
  first.clear();
  second.clear();
  expect(alive(a)).toBe(true);
  expect(alive(b)).toBe(true);
  p.assign(q);
  expect(p.equals(q)).toBe(true);
  expect(alive(a)).toBe(false);
  q.dispose();
  expect(alive(b)).toBe(true);
  p.dispose();
  expect(alive(b)).toBe(false);
});
it("retains ordinary host exception identity across copying, rethrow and later capture", /** VM-owned host Error is the actual ABI value, not a generated UNO substitute. @returns Nothing. */ () => {
  const error = new Error("native task failure"),
    p = own(ExceptionPtr.capture(error)),
    q = own(new ExceptionPtr(p));
  expect(p.equals(q)).toBe(true);
  try {
    q.rethrow();
  } catch (caught) {
    expect(caught).toBe(error);
    const again = own(ExceptionPtr.capture(caught));
    expect(again.equals(p)).toBe(true);
  }
  p.dispose();
  q.dispose();
  const next = own(ExceptionPtr.capture(error));
  expect(next.is()).toBe(true);
});
it("supports retained host callable objects without altering their thrown value", /** Actual JavaScript object category admitted by WeakMap, without a fake UNO exception. @returns Nothing. */ () => {
  const error = /** Actual host thrown function value. @returns Nothing. */ () => {},
    pointer = own(ExceptionPtr.capture(error));
  try {
    pointer.rethrow();
  } catch (caught) {
    expect(caught).toBe(error);
  }
});
it.each([null, undefined, 1, "failure"])(
  "keeps nonobject JavaScript throw ABI unqualified:%s",
  /** No guessed exception-pointer identity is assigned to primitives. @param value - Unsupported ABI domain. @returns Nothing. */ (
    value,
  ) => {
    expect(
      /** Actual capture prerequisite boundary. @returns Pointer. */ () =>
        ExceptionPtr.capture(value),
    ).toThrow("nonobject JavaScript exception ABI");
  },
);
it("preserves generated exception class and Context on a direct rethrow", /** Current actual exception ABI handles dynamic class linkage. @returns Nothing. */ () => {
  const context = own(new Reference(new ActiveDataSink())),
    error = new RuntimeException(u("same"), context),
    pointer = own(ExceptionPtr.capture(error));
  error.dispose();
  let caught = false;
  try {
    pointer.rethrow();
  } catch (value) {
    if (!(value instanceof Exception)) throw value;
    try {
      caught = true;
      expect(value).toBeInstanceOf(RuntimeException);
      expect(value.Context.get()).toBe(context.get());
      expect(read(new OUString(value.Message))).toBe("same");
    } finally {
      value.dispose();
    }
  }
  expect(caught).toBe(true);
});
