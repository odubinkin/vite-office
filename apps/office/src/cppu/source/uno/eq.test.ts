/** @fileoverview Complete original eq.hxx/native data-query observations through actual shared CPPu/SAL owners; caller inputs and FFI callbacks reuse the existing native-value helpers. */
import { it } from "vitest";
import fixture from "./native-equality-cases.json";
import { createUnoNativeInputs } from "../../../test/uno-native-values";
import { typelib_TypeClass as C } from "../../inc/typelib/typeclass";
import type {
  typelib_TypeDescription as D,
  typelib_TypeDescriptionReference as R,
  typelib_CompoundTypeDescription as P,
} from "../../inc/typelib/typedescription";
import type { uno_Sequence } from "../../inc/uno/sequence2";
import type { uno_Any } from "../../inc/uno/any2";
import type { uno_QueryInterfaceFunc as Q, uno_ReleaseFunc as Release } from "../../inc/uno/data";
import type { uno_DispatchMethod } from "../../inc/uno/dispatcher";
/** Source logical byte addresses reuse actual common allocation. */
type Elements = Pick<ReadonlyMap<number, unknown>, "get">;
/** Actual equality engine plus the unchanged common type/value/callback observers. @param mode - Complete native mode. @returns Actual library and caller operations. */
async function caller(mode: keyof typeof fixture.captures) {
  const x = await createUnoNativeInputs(fixture.captures[mode], true),
    eq = await import("./eq"),
    seq = await import("./eq-sequence"),
    numeric = await import("./eq-numeric");
  let seenMethod: D | null = null;
  /** Caller interface acquires its supplied root; this implements only the authored FFI witness. @param p - Witness. @param r - Actual demanded type. @returns Caller root. */
  function query(p: unknown, r: R): unknown {
    const w = p as ReturnType<typeof witness>;
    x.emit(4, w.id, r.eTypeClass, w.mode);
    if (w.root) {
      x.acquire(w.root);
      return w.root;
    }
    return null;
  }
  /** Creates the same binary callback record with caller-owned root and mode. @param id - Source label. @param root - Supplied root. @returns Caller FFI record. */
  function witness(id: number, root: ReturnType<typeof x.witness> | null) {
    const w = Object.assign(x.witness(id), { root, mode: 0 });
    w.count = 1000;
    const dispatch: uno_DispatchMethod =
      /** Real caller dispatcher observes only arguments and constructs actual original Any values, never a library substitute. @param p - Witness. @param member - Borrowed actual method. @param output - Return Any. @param args - Original type-reference argument. @param exception - In/out exception. @returns Nothing. */ (
        p,
        member,
        output,
        args,
        exception,
      ): void => {
        const q = p as unknown as typeof w,
          returned = output as uno_Any;
        x.emit(5, q.id, member.eTypeClass, exception[0] !== null, (args[0] as [R])[0].eTypeClass);
        x.emit(seenMethod === member);
        seenMethod = member as D;
        x.desc(member as D);
        if (q.mode === 3) {
          const held = x.name("dispatch"),
            src = x.sample(x.exc.pWeakRef as R, held.pData, q, 1);
          x.any.uno_type_any_construct(
            exception[0] as uno_Any,
            src,
            x.exc.pWeakRef as R,
            x.acquire,
          );
          x.globals.uno_type_destructData(src, x.exc.pWeakRef as R, x.release);
          held.dispose();
          return;
        }
        exception[0] = null;
        if (q.mode === 0)
          x.any.uno_type_any_construct(returned, [q.root], x.type(C.INTERFACE), x.acquire);
        else if (q.mode === 1) x.any.uno_type_any_construct(returned, null, x.type(C.VOID), null);
        else {
          const held = x.name("other");
          x.any.uno_type_any_construct(returned, [held.pData], x.type(C.STRING), null);
          held.dispose();
        }
      };
    Object.defineProperty(w, "pDispatcher", { value: dispatch, writable: true });
    return w;
  }
  /** Native internal/reference/full-description comparison forms. @param api - Source API. @param a - First value. @param ar - First reference. @param ad - First description. @param b - Second value. @param br - Second reference. @param bd - Second description. @param q - Callback. @param rel - Callback. @returns Original comparison. */
  function compare(
    api: number,
    a: unknown,
    ar: R,
    ad: D,
    b: unknown,
    br: R,
    bd: D,
    q: Q | null,
    rel: Release | null,
  ): boolean {
    return api === 0
      ? eq._equalData(a, ar, null, b, br, q, rel)
      : api === 1
        ? x.globals.uno_type_equalData(a, ar, b, br, q, rel)
        : x.globals.uno_equalData(a, ad, b, bd, q, rel);
  }
  /** Acquires the actual description like the original caller. @param r - Reference. @returns Acquired original description. */
  function description(r: R): D {
    const slot: [D | null] = [null];
    x.f.typelib_typedescriptionreference_getDescription(slot, r);
    return slot[0] as D;
  }
  return { ...x, eq, seq, numeric, query, witness, compare, description };
}
const seeds = [
  0n,
  1n,
  2n,
  127n,
  128n,
  255n,
  32767n,
  32768n,
  65535n,
  0x7fffffffn,
  0xffffffffn,
  0xffffffffffffffffn,
  0x8000000000000000n,
  0x7fffffffffffffffn,
  0x20000000000001n,
  0x4000004000000001n,
  0x4000004000000000n,
  0x4000004000000002n,
  0x400000c000000000n,
  0xbfffff4000000000n,
  0x4000014000000000n,
];
/** Creates only original initialized caller operands, preserving their explicit fixed-width C assignments and native JS primitives. @param c - Actual native class. @param k - Input seed. @param cast - Same original integer64-to-binary32 adaptation proven by the native input cast witness. @returns Caller typed operand. */
function operand(c: C, k: number, cast: (value: number | bigint) => number): [number | bigint] {
  const n = k < 21 ? (seeds[k] as bigint) : 0n;
  switch (c) {
    case C.BYTE:
      return [Number(BigInt.asIntN(8, n))];
    case C.SHORT:
      return [Number(BigInt.asIntN(16, n))];
    case C.UNSIGNED_SHORT:
      return [Number(BigInt.asUintN(16, n))];
    case C.LONG:
      return [Number(BigInt.asIntN(32, n))];
    case C.UNSIGNED_LONG:
      return [Number(BigInt.asUintN(32, n))];
    case C.HYPER:
      return [BigInt.asIntN(64, n)];
    case C.UNSIGNED_HYPER:
      return [n];
    case C.FLOAT:
    case C.DOUBLE: {
      const v =
        k === 21
          ? NaN
          : k === 22
            ? 0.5
            : k === 23
              ? -0.5
              : k === 24
                ? -0
                : k === 25
                  ? Infinity
                  : Number(BigInt.asIntN(64, n));
      return [c === C.FLOAT ? (k < 21 ? cast(BigInt.asIntN(64, n)) : Math.fround(v)) : v];
    }
    default:
      throw Error("Caller numeric type");
  }
}
it("matches complete original numeric typed pairs and comparison cast ordering", /** Replays all defined numeric comparisons and every typed operand bit observation. @returns Complete replay. */ async () => {
  const x = await caller("numeric");
  for (let ac = 3; ac <= 11; ac++)
    for (let bc = 3; bc <= 11; bc++) {
      const ar = x.type(ac),
        br = x.type(bc),
        ad = x.description(ar),
        bd = x.description(br);
      for (let ak = 0; ak < 26; ak++)
        for (let bk = 0; bk < 26; bk++) {
          const a = operand(ac, ak, x.numeric.toFloat),
            b = operand(bc, bk, x.numeric.toFloat);
          if (ac === 9 && (bc === 10 || bc === 11) && (b[0] as number) >= 2 ** 64) continue;
          if (bc === 9 && (ac === 10 || ac === 11) && (a[0] as number) >= 2 ** 64) continue;
          x.emit(ac, bc, ak, bk);
          x.value(a, ar);
          x.value(b, br);
          for (let api = 0; api < 3; api++)
            x.emit(x.compare(api, a, ar, ad, b, br, bd, null, null));
        }
      x.f.typelib_typedescription_release(bd);
      x.f.typelib_typedescription_release(ad);
    }
  x.dispose();
  x.finish();
}, 120000);
it("matches complete original generic scalar Any compound type and ownership matrix", /** Compares every initialized value and ordered interface query/release event. @returns Complete replay. */ async () => {
  const x = await caller("scalars"),
    root = x.witness(91, null),
    a = x.witness(41, root),
    b = x.witness(42, root);
  for (let ac = 0; ac <= 22; ac++) {
    if ([16, 18, 21].includes(ac)) continue;
    const ar = x.get(ac),
      ad = x.description(ar);
    for (let bc = 0; bc <= 22; bc++) {
      if ([16, 18, 21].includes(bc)) continue;
      const br = x.get(bc),
        bd = x.description(br);
      for (let v = 0; v < 3; v++) {
        const ah = x.name("Aa"),
          bh = x.name(v === 2 ? "Bb" : "Aa"),
          av = x.sample(ar, ah.pData, a, v),
          bv = x.sample(br, bh.pData, b, v);
        x.emit(ac, bc, v);
        for (let api = 0; api < 3; api++)
          x.emit(x.compare(api, av, ar, ad, bv, br, bd, x.query, x.release));
        x.value(av, ar);
        x.value(bv, br);
        x.ref(ar);
        x.ref(br);
        x.text(ah.pData);
        x.text(bh.pData);
        x.emit(a.count, b.count, root.count);
        x.globals.uno_type_destructData(bv, br, x.release);
        x.globals.uno_type_destructData(av, ar, x.release);
        bh.dispose();
        ah.dispose();
      }
      x.f.typelib_typedescription_release(bd);
    }
    x.f.typelib_typedescription_release(ad);
  }
  x.dispose();
  x.finish();
}, 120000);
it("matches complete original sequence equality reverse traversal and short circuits", /** Replays all supported native element classes and initialized compound/sequence ownership. @returns Complete replay. */ async () => {
  const x = await caller("sequences"),
    root = x.witness(91, null),
    a = x.witness(41, root),
    b = x.witness(42, root);
  for (let c = 1; c <= 22; c++) {
    if ([16, 18, 21].includes(c)) continue;
    const r = x.get(c),
      d = x.description(r),
      sd = x.sequence(r);
    for (const n of [0, 1, 3])
      for (let variant = 0; variant < 5; variant++) {
        const ah = x.name("Aa"),
          bh = x.name(variant === 4 && c !== 17 ? "Bb" : "Aa"),
          av = x.copy.allocSeq(d.nSize, n) as uno_Sequence,
          bv = x.copy.allocSeq(d.nSize, variant === 3 ? n + 1 : n) as uno_Sequence;
        for (let i = 0; i < av.nElements; i++) {
          const p = (av.elements as Elements).get(i * d.nSize);
          x.globals.uno_type_constructData(p, r);
          if (variant) x.fill(p, r, ah.pData, a, 1);
        }
        for (let i = 0; i < bv.nElements; i++) {
          const p = (bv.elements as Elements).get(i * d.nSize);
          x.globals.uno_type_constructData(p, r);
          if (variant === 1 || variant === 4) x.fill(p, r, bh.pData, b, variant === 4 ? 2 : 1);
          if (variant === 2 && c === 11) (p as [number])[0] = 1;
          if (variant === 4 && c === 17) {
            const compound = d as unknown as P;
            (
              (p as Elements).get(
                (compound.pMemberOffsets as Int32Array)[compound.nMembers - 1] as number,
              ) as [number]
            )[0] = 17;
          }
        }
        x.emit(
          c,
          n,
          variant,
          x.seq._equalSequence(av, av, r, x.query, x.release),
          x.seq._equalSequence(av, bv, r, x.query, x.release),
          x.globals.equalSequence(av, bv, r, x.query, x.release),
        );
        for (let api = 0; api < 3; api++)
          x.emit(
            x.compare(
              api,
              [av],
              sd.pWeakRef as R,
              sd,
              [bv],
              sd.pWeakRef as R,
              sd,
              x.query,
              x.release,
            ),
          );
        x.value([av], sd.pWeakRef as R);
        x.value([bv], sd.pWeakRef as R);
        x.emit(a.count, b.count, root.count);
        x.globals.destructSequence(bv, sd.pWeakRef as R, sd, x.release);
        x.globals.destructSequence(av, sd.pWeakRef as R, sd, x.release);
        x.text(ah.pData);
        x.text(bh.pData);
        bh.dispose();
        ah.dispose();
      }
    x.f.typelib_typedescription_release(sd);
    x.f.typelib_typedescription_release(d);
  }
  x.dispose();
  x.finish();
}, 120000);
it("matches original binary query return exception and interface identity callback histories", /** Actual caller dispatchers exercise original retained method lookup and all ownership branches. @returns Complete replay. */ async () => {
  const x = await caller("interfaces"),
    root = x.witness(91, null),
    other = x.witness(92, null),
    a = x.witness(41, root),
    b = x.witness(42, root);
  for (let mode = 0; mode < 4; mode++) {
    a.mode = mode;
    const p = x.globals.binuno_queryInterface(a, x.type(C.INTERFACE));
    x.emit(mode, p === null);
    if (p !== null) {
      x.value([p], x.type(C.INTERFACE));
      x.release(p);
    }
    x.emit(a.count, root.count, other.count);
  }
  a.mode = 0;
  for (let cb = 0; cb < 2; cb++)
    for (let rel = 0; rel < 2; rel++)
      for (let kind = 0; kind < 6; kind++) {
        a.root = kind === 3 ? null : root;
        b.root = kind === 4 ? null : kind === 5 ? other : root;
        const pa = kind === 1 ? null : a,
          pb = kind === 0 ? pa : kind === 2 ? null : b;
        x.emit(
          cb,
          rel,
          kind,
          x.eq._equalObject(pa, pb, cb ? x.query : null, rel ? x.release : null),
          a.count,
          b.count,
          root.count,
          other.count,
        );
      }
  x.dispose();
  x.finish();
});
it("matches original initialized unsupported metadata and nested Any diagnostic observations", /** No unsupported arbitrary pointer/producer parity is inferred from bounded diagnostic inputs. @returns Complete replay. */ async () => {
  const x = await caller("diagnostics");
  for (const c of [0, 16]) {
    const slot: [D | null] = [null];
    let r: R;
    if (c) {
      const name = x.name("equality.Typedef");
      x.internal.typelib_typedescription_newEmpty(slot, C.TYPEDEF, name.pData);
      name.dispose();
      r = slot[0] as unknown as R;
    } else r = x.type(C.VOID);
    const a = x.copy.allocSeq(1, 1) as uno_Sequence,
      b = x.copy.allocSeq(1, 1) as uno_Sequence;
    ((a.elements as Elements).get(0) as [number])[0] = 17;
    ((b.elements as Elements).get(0) as [number])[0] = 17;
    x.emit(c, x.seq._equalSequence(a, b, r, null, null));
    if (c) x.emit(x.eq._equalData([17], r, null, [17], r, null, null));
    if (slot[0]) x.f.typelib_typedescription_release(slot[0]);
  }
  const inner: uno_Any = { pType: x.type(C.LONG), pData: [17], pReserved: [17] },
    outer: uno_Any = { pType: x.type(C.ANY), pData: inner, pReserved: [17] },
    at = x.type(C.ANY),
    lt = x.type(C.LONG);
  x.emit(
    x.eq._equalData(outer, at, null, [17], lt, null, null),
    x.eq._equalData([17], lt, null, outer, at, null, null),
  );
  x.dispose();
  x.finish();
});
