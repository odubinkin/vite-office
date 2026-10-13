/** @fileoverview Complete original assign.hxx/data assignment observations through actual shared owners; diagnostic inputs and undefined native pointer expression are explicitly bounded. */
import { it } from "vitest";
import fixture from "./native-assignment-cases.json";
import { createUnoNativeQueryInputs } from "../../../test/uno-native-query-values";
import { typelib_TypeClass as C } from "../../inc/typelib/typeclass";
import type {
  typelib_TypeDescription as D,
  typelib_TypeDescriptionReference as R,
  typelib_CompoundTypeDescription as P,
  typelib_InterfaceTypeDescription as I,
} from "../../inc/typelib/typedescription";
import type {
  uno_AcquireFunc as Acquire,
  uno_ReleaseFunc as Release,
  uno_QueryInterfaceFunc as Query,
} from "../../inc/uno/data";
import type { uno_DispatchMethod } from "../../inc/uno/dispatcher";
import type { uno_Any } from "../../inc/uno/any2";
import type { uno_Sequence } from "../../inc/uno/sequence2";
/** Actual assignment owners and the existing identical pure caller observers. @param mode - Original mode. @returns Actual operations. */
async function caller(mode: keyof typeof fixture.captures) {
  const x = await createUnoNativeQueryInputs(fixture.captures[mode]),
    assign = await import("./assign"),
    sequenceApi = await import("./sequence");
  /** Invokes all original internal/reference/description forms. @param api - Original form. @param a - Destination. @param ar - Destination reference. @param ad - Borrowed description. @param b - Source. @param br - Source reference. @param bd - Borrowed description. @param q - Query. @param ac - Acquire. @param re - Release. @returns Original success. */
  function apply(
    api: number,
    a: unknown,
    ar: R,
    ad: D,
    b: unknown,
    br: R,
    bd: D,
    q: Query | null,
    ac: Acquire | null,
    re: Release | null,
  ): boolean {
    return api === 0
      ? assign._assignData(a, ar, null, b, br, null, q, ac, re)
      : api === 1
        ? assign._assignData(a, ar, ad, b, br, bd, q, ac, re)
        : api === 2
          ? x.globals.uno_type_assignData(a, ar, b, br, q, ac, re)
          : x.globals.uno_assignData(a, ad, b, bd, q, ac, re);
  }
  /** Acquires the actual factory description. @param r - Type. @returns Acquired description. */
  function description(r: R): D {
    const d: [D | null] = [null];
    x.f.typelib_typedescriptionreference_getDescription(d, r);
    return d[0] as D;
  }
  /** Observes the full demanded reference before unchanged query caller. @param p - Caller object. @param r - Demanded type. @returns Acquired query result. */
  function query(p: unknown, r: R): unknown {
    x.ref(r);
    return x.query(p, r);
  }
  /** Creates a real original single-base interface type. @param label - Caller name. @param base - Actual base. @returns Registered description. */
  function iface(label: string, base: R): D {
    const n = x.name(label),
      out: [I | null] = [null];
    x.f.typelib_typedescription_newMIInterface(out, n.pData, 0, 0, 0, 0, 0, 1, [base], 0, null);
    const d: [D | null] = [out[0]?.aBase as D];
    x.f.typelib_typedescription_register(d);
    n.dispose();
    return d[0] as D;
  }
  /** Extends the identical FFI witness with the demanded reference observation. @param id - Label. @param root - Query result. @returns Caller witness. */
  function witness(id: number, root: ReturnType<typeof x.witness> | null) {
    const w = x.witness(id, root),
      original = w.pDispatcher as unknown as uno_DispatchMethod;
    const dispatch: uno_DispatchMethod =
      /** Observes the actual caller argument before identical dispatcher. @param p - Witness. @param d - Actual member. @param out - Output. @param args - Arguments. @param exc - Exception. @returns Nothing. */ (
        p,
        d,
        out,
        args,
        exc,
      ): void => {
        x.ref(((args as unknown[])[0] as [R])[0]);
        original(p, d, out, args, exc);
      };
    Object.defineProperty(w, "pDispatcher", { value: dispatch, writable: true });
    return w;
  }
  return { ...x, assign, sequenceApi, apply, description, query, iface, witness };
}
const seeds = [
  0n,
  127n,
  128n,
  65535n,
  0xffffffffn,
  0xffffffffffffffffn,
  0x8000000000000000n,
  0x7fffffffffffffffn,
];
/** Repeats only the initialized caller's fixed-width assignments. @param c - Original class. @param n - Integer input. @param k - Floating variant. @returns Initialized address. */
function operand(c: C, n: bigint, k: number): [number | bigint] {
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
      return [BigInt.asUintN(64, n)];
    case C.FLOAT:
    case C.DOUBLE: {
      const v =
        k === 8
          ? NaN
          : k === 9
            ? -0.5
            : k === 10
              ? 0.5
              : k === 11
                ? -0
                : k === 12
                  ? Infinity
                  : Number(BigInt.asIntN(32, n));
      return [c === C.FLOAT ? Math.fround(v) : v];
    }
    default:
      throw Error("Caller numeric class");
  }
}
it("matches all original defined numeric assignment switches and typed values", /** Replays every supported numeric destination/source and API without inferred widening policy. @returns Complete replay. */ async () => {
  const x = await caller("numeric");
  for (let ac = 3; ac <= 11; ac++)
    for (let bc = 3; bc <= 11; bc++) {
      const ar = x.type(ac),
        br = x.type(bc),
        ad = x.description(ar),
        bd = x.description(br);
      for (let k = 0; k < 13; k++)
        for (let api = 0; api < 4; api++) {
          const a = operand(ac, 17n, 0),
            b = operand(bc, k < 8 ? (seeds[k] as bigint) : 0n, k);
          x.emit(ac, bc, k, api);
          x.value(a, ar);
          x.value(b, br);
          x.emit(x.apply(api, a, ar, ad, b, br, bd, null, null, null));
          x.value(a, ar);
          x.value(b, br);
        }
      x.f.typelib_typedescription_release(bd);
      x.f.typelib_typedescription_release(ad);
    }
  x.dispose();
  x.finish();
}, 120000);
it("matches original generic assignment compatibility Any flattening and default ownership", /** Replays complete scalar/Any/compound/sequence histories and every callback. @returns Complete replay. */ async () => {
  const x = await caller("matrix"),
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
      for (let v = 0; v < 3; v++)
        for (let api = 0; api < 4; api++) {
          const ah = x.name("Aa"),
            bh = x.name(v === 2 ? "Bb" : "Aa"),
            av = x.sample(ar, ah.pData, a, 1),
            bv = x.sample(br, bh.pData, b, v);
          x.emit(ac, bc, v, api);
          x.emit(x.globals.uno_type_isAssignableFromData(ar, bv, br, x.query, x.release));
          x.emit(x.apply(api, av, ar, ad, bv, br, bd, x.query, x.acquire, x.release));
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
    for (let api = 0; api < 4; api++) {
      const h = x.name("Aa"),
        av = x.sample(ar, h.pData, a, 1);
      x.emit(ac, api, x.apply(api, av, ar, ad, null, ar, ad, x.query, x.acquire, x.release));
      x.value(av, ar);
      x.text(h.pData);
      x.globals.uno_type_destructData(av, ar, x.release);
      h.dispose();
    }
    x.f.typelib_typedescription_release(ad);
  }
  x.dispose();
  x.finish();
}, 120000);
it("matches original compound base assignment self-address and shared empty sequence ordering", /** Replays real compound factory and sequence outputs through actual storage owners. @returns Complete replay. */ async () => {
  const x = await caller("compounds"),
    other = x.compound("assign.Other", C.STRUCT, null, [x.type(C.LONG)]),
    a = x.witness(41, null),
    b = x.witness(42, null),
    types = [x.base, x.record, x.exc, other];
  for (let ac = 0; ac < 4; ac++)
    for (let bc = 0; bc < 4; bc++)
      for (let api = 0; api < 4; api++) {
        const ad = types[ac] as D,
          bd = types[bc] as D,
          ar = ad.pWeakRef as R,
          br = bd.pWeakRef as R,
          ah = x.name("Aa"),
          bh = x.name("Bb"),
          av = x.sample(ar, ah.pData, a, 1),
          bv = x.sample(br, bh.pData, b, 2);
        x.emit(ac, bc, api, x.apply(api, av, ar, ad, bv, br, bd, null, x.acquire, x.release));
        x.value(av, ar);
        x.value(bv, br);
        x.ref(ar);
        x.ref(br);
        x.emit(a.count, b.count);
        x.globals.uno_type_destructData(bv, br, x.release);
        x.globals.uno_type_destructData(av, ar, x.release);
        bh.dispose();
        ah.dispose();
      }
  for (let c = 0; c <= 22; c++) {
    if ([16, 18, 21].includes(c)) continue;
    const r = x.get(c),
      d = x.description(r),
      h = x.name("Aa"),
      p = x.sample(r, h.pData, a, 1);
    x.emit(
      c,
      x.assign._assignData(p, r, d, p, r, d, null, x.acquire, x.release),
      x.assign._assignData(
        p,
        r,
        d,
        p,
        x.type(c === C.TYPE ? C.STRING : C.TYPE),
        null,
        null,
        x.acquire,
        x.release,
      ),
    );
    x.value(p, r);
    x.globals.uno_type_destructData(p, r, x.release);
    h.dispose();
    x.f.typelib_typedescription_release(d);
  }
  const sd = x.sequence(x.type(C.BOOLEAN)),
    av: [uno_Sequence | null] = [null],
    bv: [uno_Sequence | null] = [null];
  x.sequenceApi.uno_type_sequence_construct(av, x.seq.pWeakRef as R, null, 0, null);
  x.sequenceApi.uno_type_sequence_construct(bv, sd.pWeakRef as R, null, 0, null);
  x.emit(
    av[0] === bv[0],
    x.globals.uno_type_assignData(av, x.seq.pWeakRef as R, bv, sd.pWeakRef as R, null, null, null),
    x.globals.uno_type_assignData(
      av,
      x.seq.pWeakRef as R,
      bv,
      x.seq.pWeakRef as R,
      null,
      null,
      null,
    ),
  );
  x.value(av, x.seq.pWeakRef as R);
  x.value(bv, sd.pWeakRef as R);
  x.globals.destructSequence(bv[0] as uno_Sequence, sd.pWeakRef as R, sd, null);
  x.globals.destructSequence(av[0] as uno_Sequence, x.seq.pWeakRef as R, x.seq, null);
  x.f.typelib_typedescription_release(sd);
  x.f.typelib_typedescription_release(other);
  x.dispose();
  x.finish();
}, 120000);
/** Replays defined interface histories or the explicitly bounded normal-only native null-base expression. @param unsafe - Original expression scope. @returns Complete replay. */
async function interfaces(unsafe: boolean): Promise<void> {
  const x = await caller(unsafe ? "interface-chain" : "interfaces"),
    root = x.description(x.type(C.INTERFACE)),
    i = x.iface("assign.I", root.pWeakRef as R),
    j = x.iface("assign.J", root.pWeakRef as R),
    descs = [root, i, j],
    identity = x.witness(91, null),
    a = x.witness(41, identity),
    b = x.witness(42, identity);
  identity.count = a.count = b.count = 10000;
  for (let ac = 0; ac < 3; ac++)
    for (let bc = 0; bc < 3; bc++)
      for (let cb = 0; cb < 2; cb++)
        for (let mode = 0; mode < 3; mode++)
          for (let api = 0; api < 4; api++) {
            const undefinedExpression =
              (api === 1 || api === 3) && ac !== bc && ac !== 0 && mode !== 0;
            if (undefinedExpression !== unsafe) continue;
            const ad = descs[ac] as D,
              bd = descs[bc] as D,
              ar = ad.pWeakRef as R,
              br = bd.pWeakRef as R,
              av: [unknown] = [a],
              bv: [unknown] = [mode === 0 ? null : b];
            b.root = mode === 2 ? null : identity;
            x.emit(ac, bc, cb, mode, api);
            x.emit(
              x.apply(
                api,
                av,
                ar,
                ad,
                bv,
                br,
                bd,
                cb ? x.query : null,
                cb ? x.acquire : null,
                cb ? x.release : null,
              ),
            );
            x.value(av, ar);
            x.value(bv, br);
            x.ref(ar);
            x.ref(br);
            x.emit(a.count, b.count, identity.count);
            if (!unsafe) {
              x.emit(
                x.globals.uno_type_isAssignableFromData(
                  ar,
                  bv,
                  br,
                  cb ? x.query : null,
                  cb ? x.release : null,
                ),
                x.globals.uno_type_isAssignableFromData(
                  ar,
                  null,
                  br,
                  cb ? x.query : null,
                  cb ? x.release : null,
                ),
              );
              bv[0] = null;
              x.emit(
                x.globals.uno_type_isAssignableFromData(
                  ar,
                  bv,
                  br,
                  cb ? x.query : null,
                  cb ? x.release : null,
                ),
              );
            }
          }
  if (!unsafe) {
    x.emit(x.assign._queryInterface(null, i.pWeakRef as R, x.query) === null);
    for (let mode = 0; mode < 4; mode++) {
      b.mode = mode;
      b.root = identity;
      const av: [unknown] = [a],
        bv: [unknown] = [b];
      x.emit(
        mode,
        x.globals.uno_type_assignData(av, i.pWeakRef as R, bv, j.pWeakRef as R, null, null, null),
      );
      x.value(av, i.pWeakRef as R);
      x.value(bv, j.pWeakRef as R);
      x.emit(a.count, b.count, identity.count);
    }
  }
  x.f.typelib_typedescription_release(j);
  x.f.typelib_typedescription_release(i);
  x.f.typelib_typedescription_release(root);
  x.dispose();
  x.finish();
}
it("matches complete defined interface assignment query fallback and value compatibility", /** Replays actual registered type chains and caller/default callbacks. @returns Complete replay. */ async () => {
  await interfaces(false);
}, 120000);
it("preserves bounded normal interface-chain observation and records original sanitizer status", /** Compares only the named normal build capture; undefined native expression has no sanitizer parity claim. @returns Bounded replay. */ async () => {
  await interfaces(true);
}, 120000);
it("matches initialized unsupported compound diagnostics and original Any flattened alias shortcut", /** Uses only initialized caller diagnostic metadata and genuine factories, never a substituted provider. @returns Complete replay. */ async () => {
  const x = await caller("diagnostics"),
    n = x.name("assign.Typedef"),
    r: [D | null] = [null];
  x.internal.typelib_typedescription_newEmpty(r, C.TYPEDEF, n.pData);
  n.dispose();
  const ref = x.internal.referenceViewOf(r[0] as D),
    a = new Map<number, unknown>([
      [0, [17]],
      [4, [19]],
    ]),
    b = new Map<number, unknown>([
      [0, [31]],
      [4, [37]],
    ]),
    empty = { pBaseTypeDescription: null, nMembers: 0 } as P,
    bad = {
      pBaseTypeDescription: empty,
      nMembers: 1,
      pMemberOffsets: new Int32Array([4]),
      ppTypeRefs: [ref],
    } as P,
    head = { pBaseTypeDescription: bad, nMembers: 0 } as P;
  x.emit(x.assign._assignStruct(a, b, bad, null, null, null));
  bad.pBaseTypeDescription = null;
  x.emit(
    x.assign._assignStruct(a, b, head, null, null, null),
    x.assign._assignStruct(a, b, bad, null, null, null),
    x.assign._assignData(a, ref, null, b, ref, null, null, null, null),
    (a.get(0) as [number])[0],
    (a.get(4) as [number])[0],
    (b.get(0) as [number])[0],
    (b.get(4) as [number])[0],
  );
  const alias = {} as uno_Any;
  x.any.uno_type_any_construct(alias, [0xd800], x.type(C.CHAR), null);
  x.emit(
    x.globals.uno_type_assignData(
      alias.pData,
      x.type(C.SHORT),
      alias,
      x.type(C.ANY),
      null,
      null,
      null,
    ),
  );
  x.anyValue(alias);
  x.any.uno_any_destruct(alias, null);
  x.f.typelib_typedescriptionreference_release(ref);
  x.dispose();
  x.finish();
});
