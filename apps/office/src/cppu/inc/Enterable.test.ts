/** @fileoverview Whole original Enterable context/callee/cursor/reason forwarding and throw streams over actual shared owners, using native JS iterators for valid logical arguments. */
import { describe, expect, it } from "vitest";
import fixture from "./native-enterable-cases.json";
import { createUnoNativeContext } from "../../test/uno-native-values";
import type { OUString } from "../../sal/inc/rtl/ustring";
import type { uno_EnvCallee } from "./uno/environment";
/** Creates a fresh initialized caller with all real source owners. @param mode - Complete original process mode. @returns Real wrappers and caller observers. */
async function context(mode: keyof typeof fixture.captures) {
  const x = await createUnoNativeContext(fixture.captures[mode]),
    api = await import("./Enterable");
  let expectedReason: OUString | null = null,
    expectedCursor: Iterator<unknown> | null = null;
  /** Actual caller-owned callee consumes the same three valid argument values. @param p - Borrowed advancing cursor. @returns Nothing. */
  const callee: uno_EnvCallee =
    /** Consumes three actual caller arguments. @param p - Borrowed advancing cursor. @returns Nothing. */ (
      p,
    ) => {
      const a = p.next().value as number,
        b = p.next().value as number,
        r = p.next().value as OUString;
      x.emit(30, a, b * 100, r === expectedReason, p === expectedCursor || expectedCursor === null);
    };
  /** Original pure caller-derived virtual bodies, with no library/env/string/default provider. */
  class Caller extends api.Enterable {
    /** Original initialized observer count. */ count = 0;
    /** Caller-controlled virtual validity. */ valid = false;
    /** Caller-controlled non-UNO throw path. */ fail = false;
    /** Records entry and original exception propagation. @returns Nothing. */ override v_enter(): void {
      x.emit(1, ++this.count);
      if (this.fail) throw 42;
    }
    /** Records leave. @returns Nothing. */ override v_leave(): void {
      x.emit(2, ++this.count);
    }
    /** Records forwarding and post-callee argument advancement. @param f - Actual callee. @param p - Borrowed cursor. @returns Nothing. */ override v_callInto_v(
      f: uno_EnvCallee,
      p: Iterator<unknown>,
    ): void {
      x.emit(20, ++this.count, f === callee, p === expectedCursor || expectedCursor === null);
      f(p);
      if (this.fail) throw 42;
      x.emit(21, p.next().value as number);
    }
    /** Records call-out with the same valid argument cursor. @param f - Actual callee. @param p - Borrowed cursor. @returns Nothing. */ override v_callOut_v(
      f: uno_EnvCallee,
      p: Iterator<unknown>,
    ): void {
      x.emit(22, ++this.count, f === callee, p === expectedCursor || expectedCursor === null);
      f(p);
      if (this.fail) throw 42;
      x.emit(23, p.next().value as number);
    }
    /** Mutates the actual borrowed reason field with native temporary lifetime ordering. @param p - Actual mutable string object/view. @returns Caller validity. */ override v_isValid(
      p: OUString,
    ): boolean {
      x.emit(40, ++this.count, p === expectedReason, this.valid);
      x.text(p.pData);
      const value = x.name(this.valid ? "valid" : "invalid");
      p.assign(value);
      x.text(p.pData);
      value.dispose();
      return this.valid;
    }
  }
  return {
    ...x,
    api,
    Caller,
    callee,
    /** Selects original pointer identity observer. @param value - Actual caller object/view. @returns Nothing. */ reason(
      value: OUString,
    ) {
      expectedReason = value;
    },
    /** Selects the original borrowed cursor identity. @param value - Actual cursor or unspecified variadic address. @returns Nothing. */ cursor(
      value: Iterator<unknown> | null,
    ) {
      expectedCursor = value;
    },
  };
}
describe("original Enterable", /** Groups complete original caller modes. @returns Nothing. */ () => {
  it("matches complete original context and mixed argument cursor stream", /** Replays every source entry/leave/direct/variadic/C callback path. @returns Complete proof. */ async () => {
    const x = await context("calls"),
      e = new x.Caller();
    x.emit(
      e.m_enter === x.api.Enterable_call_enter,
      e.m_leave === x.api.Enterable_call_leave,
      e.m_callInto_v === x.api.Enterable_call_callInto_v,
      e.m_callOut_v === x.api.Enterable_call_callOut_v,
      e.m_isValid === x.api.Enterable_call_isValid,
    );
    e.enter();
    e.leave();
    e.m_enter(e);
    e.m_leave(e);
    const reason = x.name("argument");
    x.reason(reason);
    e.callInto(x.callee, 13, -1.75, reason, 31);
    e.callOut(x.callee, -7, 2.5, reason, 32);
    for (let kind = 0; kind < 4; kind++) {
      const p = [50 + kind, -0.25, reason, 40 + kind][Symbol.iterator]();
      x.cursor(p);
      if (kind === 0) e.callInto_v(x.callee, p);
      else if (kind === 1) e.callOut_v(x.callee, p);
      else if (kind === 2) e.m_callInto_v(e, x.callee, p);
      else e.m_callOut_v(e, x.callee, p);
      x.cursor(null);
    }
    x.emit(90, e.count);
    reason.dispose();
    e.dispose();
    x.finish();
  });
  it("matches complete original mutable reason object and field address stream", /** Replays owned and raw-field alias/mutation without extra acquisition. @returns Complete proof. */ async () => {
    const x = await context("reasons"),
      e = new x.Caller();
    for (const v of [0, 1])
      for (const k of [0, 1, 2]) {
        x.emit(10, v, k);
        const reason = x.name("before"),
          old = reason.pData;
        x.strings.rtl_uString_acquire(old);
        x.reason(reason);
        e.valid = Boolean(v);
        const address = reason.getDataAddress();
        expect(reason.getDataAddress()).toBe(address);
        expect(x.OUString.unacquired(address)).toBe(reason);
        const result =
          k === 0
            ? e.isValid(reason)
            : k === 1
              ? e.m_isValid(e, address)
              : x.api.Enterable_call_isValid(e, address);
        x.emit(11, result);
        x.text(reason.pData);
        x.text(old);
        expect(address[0]).toBe(reason.pData);
        x.strings.rtl_uString_release(old);
        reason.dispose();
      }
    const raw: [import("../../sal/inc/rtl/ustring.h").rtl_uString | null] = [null];
    x.strings.rtl_uString_newFromAscii(raw, Uint8Array.from([...Buffer.from("raw before"), 0]));
    const view = x.OUString.unacquired(raw) as OUString;
    x.reason(view);
    e.valid = true;
    x.emit(12, e.m_isValid(e, raw));
    x.text(raw[0]);
    expect(view.pData).toBe(raw[0]);
    x.strings.rtl_uString_release(raw[0] as import("../../sal/inc/rtl/ustring.h").rtl_uString);
    x.emit(90, e.count);
    e.dispose();
    x.finish();
  });
  it("matches complete original callback throw propagation stream", /** Replays original thrown values with no added cursor cleanup/normalization. @returns Complete proof. */ async () => {
    const x = await context("throwing"),
      e = new x.Caller();
    e.fail = true;
    try {
      e.enter();
      x.emit(-1);
    } catch (value) {
      x.emit(60, value as number);
    }
    const reason = x.name("argument");
    x.reason(reason);
    try {
      e.callInto(x.callee, 1, -0.5, reason, 31);
      x.emit(-1);
    } catch (value) {
      x.emit(60, value as number);
    }
    try {
      e.callOut(x.callee, 2, 0.5, reason, 32);
      x.emit(-1);
    } catch (value) {
      x.emit(60, value as number);
    }
    x.emit(90, e.count);
    reason.dispose();
    e.dispose();
    x.finish();
  });
});
