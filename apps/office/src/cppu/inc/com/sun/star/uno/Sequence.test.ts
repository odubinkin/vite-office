/** @fileoverview Complete original public Sequence streams through actual shared owners and pure C++ source/layout inputs, plus separately proven native assertion/guard diagnostics. */
import { expect, it } from "vitest";
import fixture from "./native-public-sequence-cases.json";
import { createPublicSequenceInputs } from "../../../../../../test/uno-sequence-cpp-values";
import type { Sequence } from "./Sequence";
import type { Type } from "./Type";
import type { UnoNativeCppWitness as W } from "../../../../../../test/uno-native-cpp-values";
import type { typelib_TypeDescriptionReference as R } from "../../../../typelib/typedescription";
import { typelib_TypeClass as C } from "../../../../typelib/typeclass";
import type { uno_Sequence } from "../../../../uno/sequence2";
/** Original typed const reads, never COW or new type acquisition. @param x - Actual context. @param s - Public source. @param stride - Native sizeof(E). @returns Nothing. */
function peek(
  x: Awaited<ReturnType<typeof createPublicSequenceInputs>>,
  s: Sequence,
  stride: number,
): void {
  const end = s.end();
  x.emit(
    s.getLength(),
    s.hasElements(),
    s.size(),
    s.getConstArray() === (s.get() as uno_Sequence).elements,
    s.begin() === s.getConstArray(),
    end[1] / stride,
    (s.get() as uno_Sequence).nRefCount,
  );
}
/** Complete original initialized sequence and every const element reference, metadata and virtual counts. @param x - Actual context. @param s - Real public owner. @param id - Native declared E. @param w - Caller. @param root - Caller root. @returns Nothing. */
function state(
  x: Awaited<ReturnType<typeof createPublicSequenceInputs>>,
  s: Sequence,
  id: number,
  w: W,
  root: W,
): void {
  peek(x, s, x.sizes[id] as number);
  const arg = x.args[id] as import("../../../../unotype").UnoTypeArgument,
    r = x.unotype.getTypeFavourUnsigned(["Sequence", arg]).getTypeLibType() as R;
  x.value([s.get()], r);
  x.ref(r);
  const er = x.unotype.getTypeFavourUnsigned(arg).getTypeLibType() as R;
  x.ref(er);
  for (let i = 0; i < s.getLength(); i++) {
    const element = s.operatorIndex(i);
    x.value(er.eTypeClass === C.TYPE ? [(element as Type).getTypeLibType()] : element, er);
  }
  x.emit(w.count, root.count);
}
it("matches full original public Sequence lifecycle COW arrays and move-as-copy contracts", /** Replays actual typed inputs, old aliases, initialization, COW/write/equality, swap/realloc/range and reverse owner destruction. @returns Whole original parity. */ async () => {
  const x = await createPublicSequenceInputs(fixture.captures.lifecycle),
    w = x.witness(41),
    root = x.witness(91);
  w.root = root;
  root.root = root;
  for (let id = 0; id < x.args.length; id++) {
    x.emit(id);
    const src = [x.input(id), x.input(id), x.input(id)];
    for (let i = 0; i < 3; i++) x.fill(src[i] as ReturnType<typeof x.input>, id, i, w);
    const arg = x.args[id] as import("../../../../unotype").UnoTypeArgument,
      er = x.unotype.getTypeFavourUnsigned(arg).getTypeLibType() as R,
      stride = x.sizes[id] as number,
      S = x.Sequence.specialize(arg, stride);
    x.emit(stride);
    const a = new S(),
      b = new S(2),
      c = new S(x.array(src, stride), 3),
      d = new S(c),
      e = new S(d);
    x.atomic.osl_atomic_increment(x.sequenceAPI.sequenceCountAddress(c.get() as uno_Sequence));
    const f = new S(c.get(), x.SAL_NO_ACQUIRE_ARGUMENT);
    const init = src.map(
        /** Actual initializer_list value-copy construction. @param value - Original E. @returns Actual copied E. */ (
          value,
        ) => x.clone(value, id),
      ),
      g = new S(x.array(init, stride), 3);
    for (let i = 2; i >= 0; i--) init[i]?.owner?.dispose();
    const z = new S(id % 2 ? null : x.array(src, stride), 0);
    x.emit(c.get() === d.get(), c.get() === e.get(), c.get() === f.get(), c.get() === g.get());
    for (const s of [a, b, c, d, e, f, g, z]) state(x, s, id, w, root);
    x.emit(
      c.operatorEquals(d),
      c.operatorEquals(g),
      c.operatorNotEquals(g),
      c.operatorEquals(b),
      c.operatorNotEquals(b),
    );
    const old = c.get(),
      p = c.getArray();
    x.emit(old === c.get(), p === c.getConstArray());
    x.emit(
      x.globals.uno_type_assignData(
        (p as import("./Sequence").SequenceElements).get(0),
        er,
        (src[2] as ReturnType<typeof x.input>).address,
        er,
        x.genfunc.cpp_queryInterface,
        x.genfunc.cpp_acquire,
        x.genfunc.cpp_release,
      ),
    );
    state(x, c, id, w, root);
    state(x, d, id, w, root);
    x.emit(c.operatorEquals(d), c.operatorNotEquals(d));
    a.assign(d);
    x.emit(a.get() === d.get());
    state(x, a, id, w, root);
    a.assign(a);
    state(x, a, id, w, root);
    a.moveAssign(b);
    state(x, a, id, w, root);
    state(x, b, id, w, root);
    a.moveAssign(a);
    state(x, a, id, w, root);
    a.swap(c);
    state(x, a, id, w, root);
    state(x, c, id, w, root);
    a.swap(a);
    state(x, a, id, w, root);
    for (const size of [3, 1, 0, 2, 2, 0]) {
      a.realloc(size);
      state(x, a, id, w, root);
    }
    const before = a.get(),
      empty = x.asNonConstRange(a);
    x.emit(empty.begin() === null, empty.end()[0] === null, a.get() === before);
    const range = x.asNonConstRange(d);
    x.emit(range.begin() === d.getArray(), range.end()[1] / stride);
    for (let i = 0; i < d.getLength(); i++) x.value(range.operatorIndex(i, stride), er);
    state(x, d, id, w, root);
    for (const s of [z, g, f, e, d, c, b, a]) s.dispose();
    x.ref(er);
    x.emit(w.count, root.count);
    for (const item of src) x.value(item.address, er);
    for (let i = 2; i >= 0; i--) src[i]?.owner?.dispose();
  }
  x.emit(w.count, root.count);
  x.finish();
});
it("matches original copied/adopted cold pointer ownership without eager type initialization", /** Fresh public template specialization only initializes a type on the last destructor. @returns Whole original parity. */ async () => {
  const x = await createPublicSequenceInputs(fixture.captures.cold),
    er = x.type(C.LONG),
    sd = x.sequence(er),
    raw: [import("../../../../uno/sequence2").uno_Sequence | null] = [null],
    S = x.Sequence.specialize("sal_Int32", 4);
  x.sequenceAPI.uno_type_sequence_construct(raw, sd.pWeakRef as R, null, 2, x.genfunc.cpp_acquire);
  x.ref(sd.pWeakRef);
  // Original placement-constructed null adoption is observed only with get(); its dereferencing destructor is deliberately not called.
  const nil = new S(null, x.SAL_NO_ACQUIRE_ARGUMENT);
  x.emit(nil.get() === null);
  x.ref(sd.pWeakRef);
  const a = new S(
    raw[0] as import("../../../../uno/sequence2").uno_Sequence,
    x.SAL_NO_ACQUIRE_ARGUMENT,
  );
  peek(x, a, 4);
  x.ref(sd.pWeakRef);
  const b = new S(a);
  peek(x, a, 4);
  peek(x, b, 4);
  x.ref(sd.pWeakRef);
  b.dispose();
  peek(x, a, 4);
  x.ref(sd.pWeakRef);
  a.dispose();
  x.ref(sd.pWeakRef);
  x.f.typelib_typedescription_release(sd);
  x.finish();
});
it("matches original public bad_alloc boundary and initialized header-only allocation guards", /** Huge absent tails are never read; diagnostic headers establish no ordinary producer. @returns Whole original parity. */ async () => {
  const x = await createPublicSequenceInputs(fixture.captures.guards),
    w = x.witness(41),
    root = x.witness(91),
    S = x.Sequence.specialize("sal_Int64", 8);
  for (let api = 0; api < 2; api++) {
    x.emit(api);
    try {
      const s = api
        ? new S(
            {
              get: /** Guard exits before reading caller elements. @returns Initialized caller marker. */ () => [
                17n,
              ],
            },
            0x7fffffff,
          )
        : new S(0x7fffffff);
      s.dispose();
      x.emit(0);
    } catch (error) {
      expect(error).toBeInstanceOf(RangeError);
      expect((error as Error).message).toBe("std::bad_alloc");
      x.emit(1);
    }
    x.ref(x.unotype.getTypeFavourUnsigned(["Sequence", "sal_Int64"]).getTypeLibType());
  }
  const s = new S(2);
  try {
    s.realloc(0x7fffffff);
    x.emit(0);
  } catch (error) {
    expect(error).toBeInstanceOf(RangeError);
    x.emit(1);
  }
  state(x, s, 6, w, root);
  s.dispose();
  const header = { nRefCount: 2, nElements: 0x7fffffff, elements: new Int8Array([17]) },
    h = new S(header, x.SAL_NO_ACQUIRE_ARGUMENT);
  try {
    h.getArray();
    x.emit(0);
  } catch (error) {
    expect(error).toBeInstanceOf(RangeError);
    x.emit(1);
  }
  x.emit(h.get() === header, header.nRefCount, header.nElements, header.elements[0] as number);
  x.ref(x.unotype.getTypeFavourUnsigned(["Sequence", "sal_Int64"]).getTypeLibType());
  h.dispose();
  x.emit(header.nRefCount, header.nElements, header.elements[0] as number);
  x.finish();
});
it("preserves actual original index/range/size assertion rejection boundaries", /** Genuine original process aborts are separate from accepted stream parity and browser native Error adaptation. @returns Rejection checks. */ async () => {
  const x = await createPublicSequenceInputs(fixture.captures.cold),
    S = x.Sequence.specialize("sal_Int32", 4);
  for (const mode of [
    "index-under",
    "index-over",
    "range-under",
    "range-over",
    "size-negative",
  ] as const) {
    const proof = fixture.rejections[mode];
    expect(proof.normalSignal).toBe("SIGABRT");
    expect(proof.sanitizedSignal).toBe("SIGABRT");
    expect(proof.stderr).toContain("Assertion failed:");
    if (mode === "size-negative") {
      const s = new S(
        { nRefCount: 2, nElements: -1, elements: new Int8Array([17]) },
        x.SAL_NO_ACQUIRE_ARGUMENT,
      );
      expect(
        /** Same original rejected size producer. @returns Never valid. */ () => s.size(),
      ).toThrow("Sequence size assertion");
      s.dispose();
    } else {
      const s = new S(2),
        index = mode.endsWith("under") ? -1 : 2;
      if (mode.startsWith("index"))
        expect(
          /** Original const index assertion. @returns Never valid. */ () => s.operatorIndex(index),
        ).toThrow("Sequence index assertion");
      else {
        const range = x.asNonConstRange(s);
        expect(
          /** Original mutable pair index assertion. @returns Never valid. */ () =>
            range.operatorIndex(index, 4),
        ).toThrow("Sequence range index assertion");
      }
      s.dispose();
    }
  }
});
