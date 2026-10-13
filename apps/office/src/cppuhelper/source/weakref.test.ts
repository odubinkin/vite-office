/** @fileoverview Complete original weak reference callback/pointer/list/type ownership streams replay through actual shared listener/helper/template owners and pure concrete native virtual callers. */
import { it, expect } from "vitest";
import fixture from "./native-weakref-cases.json";
import { createUnoNativeContext } from "../../test/uno-native-values";
import type { XInterface } from "../../cppu/inc/com/sun/star/uno/XInterface";
import type { XWeak } from "../../cppu/inc/com/sun/star/uno/XWeak";
import type { XAdapter } from "../../cppu/inc/com/sun/star/uno/XAdapter";
import type { XReference } from "../../cppu/inc/com/sun/star/uno/XReference";
import type { Type } from "../../cppu/inc/com/sun/star/uno/Type";
import type { Reference } from "../../cppu/inc/com/sun/star/uno/Reference";
import type { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import { TypeClass } from "../../udkapi/com/sun/star/uno/TypeClass";
/** Fresh genuine caller process, with no alternate library type/default/interface provider. @param mode - Whole original mode. @returns Actual runtime and original concrete virtual caller observations. */
async function context(mode: keyof typeof fixture.captures) {
  const z = await createUnoNativeContext(fixture.captures[mode]),
    { Reference } = await import("../../cppu/inc/com/sun/star/uno/Reference"),
    { Any } = await import("../../cppu/inc/com/sun/star/uno/Any"),
    { RuntimeException } = await import("../../cppu/inc/com/sun/star/uno/RuntimeException"),
    weak = await import("../../cppu/inc/com/sun/star/uno/XWeak"),
    adapter = await import("../../cppu/inc/com/sun/star/uno/XAdapter"),
    listener = await import("../../cppu/inc/com/sun/star/uno/XReference"),
    { UnoType } = await import("../../cppu/inc/unotype"),
    { reservedDataAddress } = await import("../../cppu/source/uno/copy"),
    helper = await import("../inc/queryinterface"),
    { WeakReferenceHelper: H, WeakReference } = await import("../inc/weakref");
  const ids = new Map<unknown, number>();
  let nextListener = 100;
  /** Every actual caller pointer, labelled independently of physical addresses. @param p - Borrowed pointer. @returns Nothing. */
  function pointer(p: unknown): void {
    z.emit(p === null);
    if (p !== null) z.emit(ids.get(p) as number);
  }
  /** Actual native caller's chosen exception, without a library error provider. @param n - Source mode. @returns Nothing. */
  function fail(n: number): void {
    if (n === 1) throw new RuntimeException();
    if (n === 2) throw new Error("caller");
  }
  /** Concrete caller adapter; actual library listener objects and Reference owners supply all internal lifecycle behavior. */
  class Adapter implements XAdapter {
    count = 10000;
    failAdd = 0;
    failRemove = 0;
    failGet = 0;
    live = true;
    retain = true;
    reenter = false;
    target!: Hard;
    refs: Reference[] = [];
    /** Original caller label. @param id - Label. @returns Caller. */
    constructor(readonly id: number) {
      ids.set(this, id);
    }
    /** Actual caller acquisition. @returns Nothing. */
    acquire(): void {
      z.emit(1, this.id, ++this.count);
    }
    /** Actual caller release. @returns Nothing. */
    release(): void {
      z.emit(2, this.id, --this.count);
    }
    /** Actual caller query through the original cppuhelper body. @param t - Demanded type. @returns Acquired Any. */
    queryInterface(t: Type): Any {
      z.emit(51, this.id);
      z.ref(t.getTypeLibType());
      return helper.queryInterface(t, [
        [adapter.XAdapter.static_type, this],
        [
          /** Original concrete caller root getter. @returns Actual borrowed root Type. */ () =>
            UnoType.get("XInterface"),
          this,
        ],
      ]);
    }
    /** Exact source callback result. @returns Real acquired root Reference. */
    queryAdapted(): Reference {
      z.emit(35, this.id, this.live);
      fail(this.failGet);
      return this.live ? new Reference(this.target) : new Reference();
    }
    /** Original caller registration and optional controlled failure. @param r - Actual library listener. @returns Nothing. */
    addReference(r: Reference): void {
      ids.set(r.get(), nextListener++);
      z.emit(31, this.id, ids.get(r.get()) as number, this.refs.length, this.retain);
      fail(this.failAdd);
      if (this.retain) this.refs.push(new Reference(r));
      z.emit(32, this.id, this.refs.length);
    }
    /** Original caller removal, including actual listener reentrancy. @param r - Actual library listener. @returns Nothing. */
    removeReference(r: Reference): void {
      z.emit(33, this.id, ids.get(r.get()) as number, this.refs.length, this.reenter);
      fail(this.failRemove);
      if (this.reenter) (r.get() as XReference).dispose();
      const index = this.refs.findIndex(
        /** Original caller raw pointer comparison. @param v - Actual borrowed Reference. @returns Pointer identity. */ (
          v,
        ) => v.get() === r.get(),
      );
      if (index >= 0) {
        const removed = this.refs.splice(index, 1)[0] as Reference;
        removed.dispose();
      }
      z.emit(34, this.id, this.refs.length);
    }
    /** Original native vector destruction of remaining actual Reference members. @returns Nothing. */
    clearReferences(): void {
      for (const r of this.refs) r.dispose();
      this.refs = [];
    }
  }
  /** Concrete authored source hard object, not the library OWeakObject owner. */
  class Hard implements XWeak {
    count = 10000;
    failQuery = 0;
    failAdapter = 0;
    supports = true;
    nullAdapter = false;
    /** Original caller constructor. @param id - Label. @param adapter_ - Concrete caller adapter. @returns Caller. */
    constructor(
      readonly id: number,
      readonly adapter_: Adapter,
    ) {
      ids.set(this, id);
      adapter_.target = this;
    }
    /** Actual caller acquire. @returns Nothing. */
    acquire(): void {
      z.emit(1, this.id, ++this.count);
    }
    /** Actual caller release. @returns Nothing. */
    release(): void {
      z.emit(2, this.id, --this.count);
    }
    /** Actual caller query and selected failure. @param t - Actual demanded type. @returns Real Any. */
    queryInterface(t: Type): Any {
      z.emit(50, this.id, this.supports);
      z.ref(t.getTypeLibType());
      fail(this.failQuery);
      return this.supports
        ? helper.queryInterface(t, [
            [weak.XWeak.static_type, this],
            [
              /** Original concrete caller root getter. @returns Actual borrowed root Type. */ () =>
                UnoType.get("XInterface"),
              this,
            ],
          ])
        : helper.queryInterface(t, [
            [
              /** Original concrete caller root getter. @returns Actual borrowed root Type. */ () =>
                UnoType.get("XInterface"),
              this,
            ],
          ]);
    }
    /** Actual caller owned adapter result. @returns Real Reference. */
    queryAdapter(): Reference {
      z.emit(30, this.id, this.nullAdapter);
      fail(this.failAdapter);
      return this.nullAdapter ? new Reference() : new Reference(this.adapter_);
    }
  }
  const a = new Adapter(20),
    b = new Adapter(21),
    x = new Hard(10, a),
    y = new Hard(11, b);
  /** Whole caller counts and listener arrays, with no selected subset. @returns Nothing. */
  function state(): void {
    z.emit(60, x.count, y.count, a.count, b.count, a.refs.length, b.refs.length);
    for (const r of a.refs) pointer(r.get());
    for (const r of b.refs) pointer(r.get());
  }
  /** Borrowed hard Reference observation. @param r - Actual root/typed Reference. @returns Nothing. */
  function hard(r: Reference): void {
    pointer(r.get());
    z.emit(r.is());
  }
  /** Original prvalue get observation and end-of-expression destruction. @param w - Actual library helper. @returns Nothing. */
  function get(w: InstanceType<typeof H>): void {
    const r = w.get();
    try {
      hard(r);
    } finally {
      r.dispose();
    }
  }
  /** Original selected conversion observation and end-of-expression destruction. @param w - Actual helper/template. @returns Nothing. */
  function convert(w: InstanceType<typeof H>): void {
    const r = w.operatorReference();
    try {
      hard(r);
    } finally {
      r.dispose();
    }
  }
  /** Every original initialized returned Any pointer/storage/type field. @param v - Actual returned Any. @returns Nothing. */
  function any(v: Any): void {
    z.ref(v.pType);
    z.emit(v.hasValue(), v.getValueTypeClass(), v.pData === v, v.pData === reservedDataAddress(v));
    if (v.getValueTypeClass() === TypeClass.INTERFACE) pointer(v.pReserved);
  }
  /** Original caller catch and actual exception destruction. @param tag - Operation label. @param body - Original expression. @returns Nothing. */
  function attempt(tag: number, body: () => void): void {
    z.emit(70, tag);
    try {
      body();
      z.emit(90, 0);
    } catch (error) {
      if (error instanceof RuntimeException) {
        z.emit(91, 1);
        error.dispose();
      } else {
        z.emit(91, 2);
        expect(error).toBeInstanceOf(Error);
      }
    }
  }
  /** Genuine native derived helper uses its protected owned pointer only to test the original listener destructor body, without replacing a library function. */
  class Exposed extends H {
    /** Original diagnostic pointer release; no ordinary producer certification. @returns Nothing. */
    drop(): void {
      const p = this.m_pImpl;
      this.m_pImpl = null;
      (p as NonNullable<typeof p>).release();
    }
  }
  return {
    ...z,
    Reference,
    Any,
    H,
    WeakReference,
    weak,
    adapter,
    listener,
    UnoType,
    a,
    b,
    x,
    y,
    state,
    hard,
    get,
    convert,
    any,
    attempt,
    Exposed,
  };
}
for (const mode of ["lifecycle", "overloads", "nulls", "errors", "destructor"] as const) {
  it(`matches complete original weak reference ${mode} stream`, /** Exact original whole mode and cleanup, no subset/hash summary. @returns Whole native parity. */ async () => {
    const c = await context(mode),
      { a, x, y, H, Reference, state, get, convert, any, attempt } = c;
    if (mode === "lifecycle") {
      const r = new Reference(x),
        q = new Reference(y),
        empty = new H(),
        zero = new H(empty),
        w = new H(r);
      state();
      get(w);
      const copy = new H(w),
        moved = H.move(copy);
      state();
      get(copy);
      c.emit(w.operatorEqual(moved), w.operatorEqual(empty));
      moved.assign(moved);
      moved.moveAssign(moved);
      state();
      get(moved);
      const other = new H(q);
      c.emit(w.operatorEqual(other));
      convert(w);
      for (let k = 0; k < 3; k++) {
        const t =
            k === 0
              ? c.listener.XReference.static_type()
              : k === 1
                ? c.UnoType.get("XInterface")
                : c.adapter.XAdapter.static_type(),
          v = (a.refs[0]?.get() as XInterface).queryInterface(t);
        any(v);
        v.dispose();
      }
      a.live = false;
      get(w);
      const dead = new H(w);
      state();
      a.live = true;
      empty.assign(w);
      state();
      a.reenter = true;
      w.clear();
      a.reenter = false;
      state();
      empty.assign(zero);
      other.clear();
      dead.clear();
      for (const h of [dead, other, moved, copy, w, zero, empty]) h.dispose();
      q.dispose();
      r.dispose();
      state();
    } else if (mode === "overloads") {
      const r = new Reference(x),
        weak = new Reference(x),
        adapter = new Reference(a),
        nil = new Reference();
      const Root = c.WeakReference.specialize("XInterface"),
        Weak = c.WeakReference.specialize(c.adapter.cppu_detail_getUnoType),
        Adapter = c.WeakReference.specialize(c.adapter.cppu_detail_getUnoType);
      expect(c.WeakReference.specialize("XInterface")).toBe(Root);
      const fast = new H(weak, c.weak.XWeak),
        root = new H(r),
        none = new H(),
        wr = new Root(r),
        defaultRoot = new Root(),
        ww = new Weak(adapter),
        defaultWeak = new Weak(),
        wa = new Adapter(adapter),
        nullAdapter = new Adapter(nil);
      state();
      get(wr);
      convert(wr);
      convert(ww);
      convert(wa);
      defaultRoot.assign(r);
      defaultWeak.assign(weak, c.weak.XWeak);
      wa.assign(weak, c.weak.XWeak);
      state();
      convert(wa);
      ww.assign(weak, c.weak.XWeak);
      const copied = new Weak(ww),
        moved = Weak.move(copied);
      moved.assign(ww);
      defaultWeak.moveAssign(moved);
      ww.assign(ww);
      state();
      fast.assign(weak, c.weak.XWeak);
      root.assign(r);
      none.assign(fast);
      none.moveAssign(fast);
      none.moveAssign(none);
      wa.assign(adapter);
      wa.assign(nil);
      defaultRoot.clear();
      defaultWeak.clear();
      ww.clear();
      wr.clear();
      wa.clear();
      root.clear();
      for (const h of [
        moved,
        copied,
        nullAdapter,
        wa,
        defaultWeak,
        ww,
        defaultRoot,
        wr,
        none,
        root,
        fast,
      ])
        h.dispose();
      nil.dispose();
      adapter.dispose();
      weak.dispose();
      r.dispose();
      state();
    } else if (mode === "nulls") {
      const r = new Reference(x),
        nil = new Reference(),
        weakNil = new Reference(),
        empty = new H(nil),
        fastNil = new H(weakNil, c.weak.XWeak);
      x.supports = false;
      const unsupported = new H(r);
      get(unsupported);
      unsupported.assign(r);
      x.supports = true;
      x.nullAdapter = true;
      const noAdapter = new H(r);
      get(noAdapter);
      noAdapter.assign(empty);
      empty.assign(weakNil, c.weak.XWeak);
      state();
      x.nullAdapter = false;
      for (const h of [noAdapter, unsupported, fastNil, empty]) h.dispose();
      weakNil.dispose();
      nil.dispose();
      r.dispose();
      state();
    } else if (mode === "errors") {
      const r = new Reference(x),
        weak = new Reference(x);
      for (let k = 1; k <= 2; k++) {
        x.failQuery = k;
        attempt(
          10 + k,
          /** Original controlled caller expression and scoped cleanup. @returns Nothing. */ () => {
            const w = new H(r);
            try {
              get(w);
            } finally {
              w.dispose();
            }
          },
        );
        x.failQuery = 0;
        x.failAdapter = k;
        attempt(
          20 + k,
          /** Original controlled caller expression and scoped cleanup. @returns Nothing. */ () => {
            const w = new H(r);
            try {
              get(w);
            } finally {
              w.dispose();
            }
          },
        );
        attempt(
          30 + k,
          /** Original controlled caller expression and scoped cleanup. @returns Nothing. */ () => {
            const w = new H(weak, c.weak.XWeak);
            w.dispose();
          },
        );
        x.failAdapter = 0;
        a.failAdd = k;
        attempt(
          40 + k,
          /** Original controlled caller expression and scoped cleanup. @returns Nothing. */ () => {
            const w = new H(r);
            try {
              get(w);
            } finally {
              w.dispose();
            }
          },
        );
        attempt(
          50 + k,
          /** Original controlled caller expression and scoped cleanup. @returns Nothing. */ () => {
            const w = new H(weak, c.weak.XWeak);
            w.dispose();
          },
        );
        a.failAdd = 0;
        state();
      }
      const w = new H(r);
      for (let k = 1; k <= 2; k++) {
        a.failGet = k;
        attempt(
          60 + k,
          /** Original controlled caller expression and scoped cleanup. @returns Nothing. */ () =>
            get(w),
        );
        attempt(
          70 + k,
          /** Original controlled caller expression and scoped cleanup. @returns Nothing. */ () => {
            const copy = new H(w);
            try {
              get(copy);
            } finally {
              copy.dispose();
            }
          },
        );
        a.failGet = 0;
      }
      for (let k = 1; k <= 2; k++) {
        a.failRemove = k;
        attempt(
          80 + k,
          /** Original controlled caller expression and scoped cleanup. @returns Nothing. */ () =>
            w.clear(),
        );
        a.failRemove = 0;
        w.clear();
        a.clearReferences();
        w.assign(r);
      }
      for (let k = 1; k <= 2; k++) {
        x.failQuery = k;
        attempt(
          90 + k,
          /** Original controlled caller expression and scoped cleanup. @returns Nothing. */ () => {
            w.assign(r);
          },
        );
        x.failQuery = 0;
        w.assign(r);
        x.failAdapter = k;
        attempt(
          100 + k,
          /** Original controlled caller expression and scoped cleanup. @returns Nothing. */ () => {
            w.assign(weak, c.weak.XWeak);
          },
        );
        x.failAdapter = 0;
        w.assign(r);
      }
      state();
      w.dispose();
      weak.dispose();
      r.dispose();
      a.clearReferences();
      state();
    } else {
      const r = new Reference(x);
      a.retain = false;
      const w = new c.Exposed(r);
      w.drop();
      state();
      w.dispose();
      const second = new c.Exposed(r);
      a.failRemove = 1;
      second.drop();
      a.failRemove = 0;
      state();
      second.dispose();
      a.retain = true;
      r.dispose();
      state();
    }
    c.ref(c.weak.XWeak.static_type().getTypeLibType());
    c.ref(c.adapter.XAdapter.static_type().getTypeLibType());
    c.ref(c.listener.XReference.static_type().getTypeLibType());
    c.finish();
  });
}

it("preserves the original internal XWeak template compiler rejection", /** Actual complete original compiler witness and erased compiler binding; no runtime body or missing overload is fabricated. @returns Original binding rejection. */ async () => {
  const { WeakReference } = await import("../inc/weakref"),
    { cppu_detail_getUnoType } = await import("../../cppu/inc/com/sun/star/uno/XWeak");
  expect(fixture.compilerRestriction.exitCode).toBe(1);
  expect(fixture.compilerRestriction.signal).toBeNull();
  expect(fixture.compilerRestriction.stderr).toContain(
    "multiple overloads of 'operator=' instantiate to the same signature",
  );
  expect(
    /** Original compiler binding restriction. @returns Declared specialization if accepted. */ () =>
      WeakReference.specialize(cppu_detail_getUnoType),
  ).toThrow(TypeError("Original internal WeakReference<XWeak> has duplicate operator= overloads"));
});
