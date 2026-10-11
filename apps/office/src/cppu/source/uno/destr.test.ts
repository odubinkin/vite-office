/** @fileoverview Replays complete original UNO destruction, addressed initialized storage and exact callbacks/ownership through actual shared owners. */
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { expect, it, vi } from "vitest";
import fixture from "./native-destr-cases.json";
import { typelib_TypeClass as C } from "../../inc/typelib/typeclass";
import type {
  typelib_TypeDescription as D,
  typelib_TypeDescriptionReference as R,
  typelib_CompoundTypeDescription as P,
} from "../../inc/typelib/typedescription";
import type { uno_Any } from "../../inc/uno/any2";
import type { rtl_uString } from "../../../sal/inc/rtl/ustring.h";

/** Loads fresh original process state and complete native observations. @param mode - Original process mode. @returns Actual public owners and stream writers. */
async function context(mode: keyof typeof fixture.captures) {
  vi.resetModules();
  const f = await import("../../inc/typelib/typedescription"),
    constr = await import("./constr"),
    internal = await import("../typelib/typelib"),
    destr = await import("./destr"),
    any = await import("./any"),
    sequence = await import("./sequence"),
    strings = await import("../../../sal/inc/rtl/ustring.h"),
    globals = await import("./data"),
    atomic = await import("../../../sal/inc/osl/interlck"),
    { OUString } = await import("../../../sal/inc/rtl/ustring"),
    { StringConcat } = await import("../../../sal/inc/rtl/stringconcat");
  const expected = gunzipSync(Buffer.from(fixture.captures[mode].gzipBase64, "base64")),
    data = new Int32Array(expected.length / 4);
  let cursor = 0;
  /** Records original initialized signed32 observations. @param row - Complete row. @returns Nothing. */
  function emit(...row: (number | boolean)[]): void {
    for (const value of row) data[cursor++] = Number(value);
  }
  /** Records null identity, reference count, length and every name unit including zero. @param p - Original string. @returns Nothing. */
  function text(p: rtl_uString | null): void {
    emit(p === null);
    if (p !== null) {
      emit(p.refCount, p.length);
      for (let i = 0; i <= p.length; i++) emit(p.buffer[i] as number);
    }
  }
  /** Records every initialized common description field. @param d - Original description. @returns Nothing. */
  function desc(d: D | null): void {
    emit(d === null);
    if (d === null) return;
    emit(
      d.nRefCount,
      d.nStaticRefCount,
      d.eTypeClass,
      d.pSelf === d,
      d.bComplete,
      d.nSize,
      d.nAlignment,
      d.pWeakRef === null,
      d.pUniqueIdentifier === null,
      d.pReserved === null,
      d.bOnDemand,
    );
    text(d.pTypeName);
  }
  /** Records complete reference fields and its existing initialized common description. @param r - Original reference. @returns Nothing. */
  function ref(r: R | null): void {
    emit(r === null);
    if (r !== null) {
      emit(r.nRefCount, r.nStaticRefCount, r.eTypeClass, r.pType !== null);
      text(r.pTypeName);
      if (r.pType !== null) desc(r.pType);
    }
  }
  /** Constructs the actual original terminated ASCII caller bytes. @param value - Original ASCII text. @returns Exact input bytes. */
  function ascii(value: string): Uint8Array {
    return Uint8Array.from(Buffer.from(value + "\0", "ascii"));
  }
  /** Creates an actual owned original ASCII caller string. @param value - Original text. @returns Actual shared string owner. */
  function name(value: string): InstanceType<typeof OUString> {
    return OUString.createFromAscii(ascii(value));
  }
  /** Compares every captured byte, initialized observation and stream digest. @returns Nothing. */
  function finish(): void {
    expect(cursor).toBe(data.length);
    const original = new Int32Array(expected.buffer, expected.byteOffset, expected.length / 4),
      actual = Buffer.from(data.buffer);
    const different = data.findIndex(
      /** Locates the first differing complete observation. @param value - Portable value. @param i - Original index. @returns Difference predicate. */
      (value, i) => value !== original[i],
    );
    expect(
      different,
      `first different observation ${different}: actual ${data[different]}, original ${original[different]}`,
    ).toBe(-1);
    expect(actual.equals(expected)).toBe(true);
    expect(createHash("sha256").update(actual).digest("hex")).toBe(fixture.captures[mode].digest);
  }
  return {
    f,
    constr,
    internal,
    destr,
    any,
    sequence,
    strings,
    globals,
    atomic,
    OUString,
    StringConcat,
    emit,
    text,
    ref,
    desc,
    ascii,
    name,
    finish,
  };
}

/** Replays source default operations and initialized scalar/field addressing. @param mode - Complete original process mode. @returns Actual owner callbacks and input storage functions. */
async function defaults(mode: keyof typeof fixture.captures) {
  const x = await context(mode),
    { constr, globals: g, emit, ref, text } = x;
  const marker = { value: 17 };
  /** Creates initialized caller storage; it supplies no type factory, field default or runtime algorithm. @param r - Actual type. @returns Original logical caller address. */
  function storage(r: R): unknown {
    return r.eTypeClass === C.ANY ? { pType: null, pData: marker, pReserved: marker } : [marker];
  }
  /** Observes only source-initialized values and selected pointer identities. @param p - Caller storage. @param r - Real type. @returns Nothing. */
  function observe(p: unknown, r: R): void {
    const v = (p as [unknown])[0];
    switch (r.eTypeClass) {
      case C.VOID:
        emit(v === marker);
        break;
      case C.CHAR:
      case C.BYTE:
      case C.SHORT:
      case C.UNSIGNED_SHORT:
      case C.LONG:
      case C.UNSIGNED_LONG:
      case C.ENUM:
        emit(v as number);
        break;
      case C.BOOLEAN:
        expect(typeof v).toBe("boolean");
        emit(v as boolean);
        break;
      case C.HYPER:
      case C.UNSIGNED_HYPER: {
        const bytes = new ArrayBuffer(8);
        new DataView(bytes).setBigInt64(0, v as bigint, true);
        const words = new Int32Array(bytes);
        emit(words[0] as number, words[1] as number);
        break;
      }
      case C.FLOAT:
      case C.DOUBLE: {
        const bytes = new ArrayBuffer(r.eTypeClass === C.FLOAT ? 4 : 8),
          view = new DataView(bytes);
        if (r.eTypeClass === C.FLOAT) view.setFloat32(0, v as number, true);
        else view.setFloat64(0, v as number, true);
        for (const word of new Int32Array(bytes)) emit(word);
        break;
      }
      case C.STRING:
        text(v as rtl_uString);
        break;
      case C.TYPE:
        ref(v as R);
        break;
      case C.ANY: {
        const a = p as uno_Any;
        emit(a.pData === a, a.pReserved === marker, a.pType === g.g_pVoidType[0]);
        ref(a.pType);
        break;
      }
      case C.SEQUENCE: {
        const seq = v as typeof g.g_emptySeq;
        emit(seq === g.g_emptySeq, seq.nRefCount, seq.nElements, seq.elements[0] as number);
        break;
      }
      case C.INTERFACE:
        emit(v === null);
        break;
      default:
        throw new Error("Unexpected original observation class");
    }
  }
  /** Invokes each actual inline/source/C default boundary. @param mode - Original call form. @param p - Caller storage. @param r - Type reference. @param d - Full description. @returns Nothing. */
  function construct(mode: number, p: unknown, r: R, d: D): void {
    if (mode === 0) constr._defaultConstructData(p, r, null);
    else if (mode === 1) constr._defaultConstructData(p, r, d);
    else if (mode === 2) g.uno_type_constructData(p, r);
    else g.uno_constructData(p, d);
  }
  /** Invokes the four actual original destruction boundaries. @param m - Original call form. @param p - Initialized storage. @param r - Real type. @param d - Borrowed description. @param release - Caller callback. @returns Nothing. */
  function destroy(
    m: number,
    p: unknown,
    r: R,
    d: D,
    release: ((p: unknown) => void) | null,
  ): void {
    if (m === 0) x.destr._destructData(p, r, null, release);
    else if (m === 1) x.destr._destructData(p, r, d, release);
    else if (m === 2) g.uno_type_destructData(p, r, release);
    else g.uno_destructData(p, d, release);
  }
  return { ...x, storage, observe, construct, destroy };
}
it("matches every original fundamental destruction through inline and C boundaries", /** Replays all original initialized values/counts/default pointers without a binary public-data ABI. @returns Completion. */ async () => {
  const x = await defaults("scalars"),
    { f, emit, ref } = x;
  for (let c = 0; c <= 22; c++) {
    if (c > 14 && c !== 22) continue;
    const r = f.typelib_static_type_getByTypeClass(c as C)[0] as R,
      slot: [D | null] = [null];
    f.typelib_typedescriptionreference_getDescription(slot, r);
    const d = slot[0] as D;
    for (let m = 0; m < 4; m++) {
      const p = x.storage(r);
      emit(c, m);
      ref(r);
      x.construct(m, p, r, d);
      x.observe(p, r);
      ref(r);
      x.destroy(m, p, r, d, null);
      ref(r);
    }
    f.typelib_typedescription_release(d);
  }
  x.finish();
});
it("matches original enum and derived nested exception/empty compound destruction", /** Uses actual factories/descriptions and existing source-offset field addresses; selected cleanup releases source defaults only. @returns Completion. */ async () => {
  const x = await defaults("records"),
    { f, emit, ref, desc, name } = x;
  const en = name("default.Enum"),
    low = name("Low"),
    high = name("High"),
    slot: [D | null] = [null];
  f.typelib_typedescription_newEnum(
    slot,
    en.pData,
    -23,
    2,
    [low.pData, high.pData],
    new Int32Array([-23, 19]),
  );
  f.typelib_typedescription_register(slot);
  const e = slot[0] as D;
  high.dispose();
  low.dispose();
  en.dispose();
  const sn = name("[]byte");
  const seqSlot: [D | null] = [null];
  f.typelib_typedescription_new(
    seqSlot,
    C.SEQUENCE,
    sn.pData,
    f.typelib_static_type_getByTypeClass(C.BYTE)[0],
    0,
    null,
  );
  f.typelib_typedescription_register(seqSlot);
  const seq = seqSlot[0] as D;
  sn.dispose();
  /** Constructs a genuine C factory description, with original owned name inputs only. @param label - Type name. @param cls - Source class. @param base - Actual optional base. @param types - Original borrowed members. @returns Real registered description. */
  function compound(label: string, cls: C, base: D | null, types: R[]): D {
    const n = name(label),
      names = types.map(
        /** Creates an original initialized member name. @param unused - Member pointer. @param i - Original member index. @returns Actual string owner. */ (
          _unused,
          i,
        ) => name("m" + i),
      ),
      members = types.map(
        /** Constructs the original member-init input from real type/name owners. @param r - Type reference. @param i - Original index. @returns Caller member record. */ (
          r,
          i,
        ) => ({
          eTypeClass: r.eTypeClass,
          pTypeName: r.pTypeName,
          pMemberName: (names[i] as typeof n).pData,
        }),
      ),
      out: [D | null] = [null];
    f.typelib_typedescription_new(out, cls, n.pData, base?.pWeakRef ?? null, types.length, members);
    f.typelib_typedescription_register(out);
    for (const m of names) m.dispose();
    n.dispose();
    return out[0] as D;
  }
  /** Actual borrowed static type cell. @param c - Class. @returns Original reference. */
  function type(c: C): R {
    return f.typelib_static_type_getByTypeClass(c)[0] as R;
  }
  const base = compound("default.Base", C.STRUCT, null, [
      type(C.STRING),
      type(C.TYPE),
      type(C.ANY),
    ]),
    derived = compound("default.Derived", C.STRUCT, base, [seq.pWeakRef as R, e.pWeakRef as R]),
    nested = compound("default.Nested", C.STRUCT, null, [
      derived.pWeakRef as R,
      type(C.INTERFACE),
      type(C.BOOLEAN),
    ]),
    exc = compound("default.Exception", C.EXCEPTION, null, [type(C.STRING), type(C.INTERFACE)]),
    subExc = compound("default.DerivedException", C.EXCEPTION, exc, [type(C.ANY), type(C.LONG)]),
    empty = compound("default.Empty", C.STRUCT, null, []),
    baseOnly = compound("default.BaseOnly", C.STRUCT, base, []);
  /** Follows actual source field addresses for prepare/observe/caller cleanup, never implements runtime defaults. @param p - Caller compound storage. @param d - Real compound. @param action - Observation phase. @returns Nothing. */
  function fields(p: Map<number, unknown>, d: P, action: number): void {
    if (d.pBaseTypeDescription) fields(p, d.pBaseTypeDescription, action);
    for (let i = d.nMembers; i--;) {
      const offset = (d.pMemberOffsets as Int32Array)[i] as number,
        r = (d.ppTypeRefs as R[])[i] as R;
      if (r.eTypeClass === C.STRUCT || r.eTypeClass === C.EXCEPTION) {
        const sub: [D | null] = [null];
        f.typelib_typedescriptionreference_getDescription(sub, r);
        if (action === 0) p.set(offset, new Map());
        if (action === 1) {
          emit(i, offset, r.eTypeClass);
          ref(r);
        }
        fields(p.get(offset) as Map<number, unknown>, sub[0] as unknown as P, action);
        f.typelib_typedescription_release(sub[0] as D);
      } else if (action === 0) p.set(offset, x.storage(r));
      else if (action === 1) {
        emit(i, offset, r.eTypeClass);
        x.observe(p.get(offset), r);
      } else throw new Error("Unexpected caller phase");
    }
  }
  for (const d of [e, base, derived, nested, exc, subExc, empty, baseOnly])
    for (let m = 0; m < 4; m++) {
      const p = d === e ? x.storage(d.pWeakRef as R) : new Map<number, unknown>();
      if (d !== e) fields(p as Map<number, unknown>, d as unknown as P, 0);
      emit(m);
      ref(d.pWeakRef);
      desc(d);
      x.construct(m, p, d.pWeakRef as R, d);
      if (d === e) x.observe(p, d.pWeakRef as R);
      else fields(p as Map<number, unknown>, d as unknown as P, 1);
      ref(d.pWeakRef);
      desc(d);
      x.destroy(m, p, d.pWeakRef as R, d, null);
      ref(d.pWeakRef);
      desc(d);
    }
  x.finish();
  for (const d of [baseOnly, empty, subExc, exc, nested, derived, base, seq, e])
    f.typelib_typedescription_release(d);
});
/** Actual caller type factories and release-callback witnesses; no generated provider or runtime destructor substitute. @param mode - Native process. @returns Real owners and prepared factory operations. */
async function values(mode: keyof typeof fixture.captures) {
  const x = await context(mode),
    { f, name, emit } = x;
  /** Resolves the actual borrowed original static pointer. @param c - Type class. @returns Reference. */
  function type(c: C): R {
    return f.typelib_static_type_getByTypeClass(c)[0] as R;
  }
  /** Builds an original registered enum with real string owners. @returns Description. */
  function makeEnum(): D {
    const n = name("default.Enum"),
      low = name("Low"),
      high = name("High"),
      slot: [D | null] = [null];
    f.typelib_typedescription_newEnum(
      slot,
      n.pData,
      -23,
      2,
      [low.pData, high.pData],
      new Int32Array([-23, 19]),
    );
    f.typelib_typedescription_register(slot);
    high.dispose();
    low.dispose();
    n.dispose();
    return slot[0] as D;
  }
  /** Original sequence description factory. @param c - Element class. @returns Description. */
  function makeSequence(c: C): D {
    const r = type(c),
      suffix = new x.OUString(r.pTypeName as rtl_uString),
      n = new x.OUString(new x.StringConcat(x.OUString.Concat(x.ascii("[]")), suffix)),
      slot: [D | null] = [null];
    f.typelib_typedescription_new(slot, C.SEQUENCE, n.pData, r, 0, null);
    f.typelib_typedescription_register(slot);
    n.dispose();
    suffix.dispose();
    return slot[0] as D;
  }
  /** Original actual compound factory with caller-owned member inputs. @param label - Name. @param cls - Type class. @param base - Real base. @param types - Real member references. @returns Description. */
  function compound(label: string, cls: C, base: D | null, types: R[]): D {
    const n = name(label),
      names = types.map(
        /** Allocates an actual member name. @param unused - Reference. @param i - Index. @returns Owner. */ (
          _unused,
          i,
        ) => name("m" + i),
      ),
      members = types.map(
        /** Prepares original member-init inputs. @param r - Reference. @param i - Index. @returns Init record. */ (
          r,
          i,
        ) => ({
          eTypeClass: r.eTypeClass,
          pTypeName: r.pTypeName,
          pMemberName: (names[i] as typeof n).pData,
        }),
      ),
      slot: [D | null] = [null];
    f.typelib_typedescription_new(
      slot,
      cls,
      n.pData,
      base?.pWeakRef ?? null,
      types.length,
      members,
    );
    f.typelib_typedescription_register(slot);
    for (const m of names) m.dispose();
    n.dispose();
    return slot[0] as D;
  }
  /** Uses the real internal newEmpty normal-build diagnostic branch and its actual common-prefix reference view; no typedef producer is claimed. @returns Owned reference. */
  function typeDef(): R {
    const n = name("destroy.Typedef"),
      out: [D | null] = [null];
    x.internal.typelib_typedescription_newEmpty(out, C.TYPEDEF, n.pData);
    n.dispose();
    return x.internal.referenceViewOf(out[0] as D);
  }
  /** Allocates only initialized caller addresses from actual member metadata, then calls the real default constructor. @param d - Real compound. @returns Addressed storage. */
  function prepare(d: P): Map<number, unknown> {
    const result = new Map<number, unknown>();
    /** Populates real native field addresses before construction; this supplies storage, never defaults. @param target - Storage. @param p - Description. @returns Nothing. */
    function fields(target: Map<number, unknown>, p: P): void {
      if (p.pBaseTypeDescription) fields(target, p.pBaseTypeDescription);
      for (let i = 0; i < p.nMembers; i++) {
        const r = (p.ppTypeRefs as R[])[i] as R,
          offset = (p.pMemberOffsets as Int32Array)[i] as number;
        if (r.eTypeClass === C.STRUCT || r.eTypeClass === C.EXCEPTION) {
          const sub: [D | null] = [null];
          f.typelib_typedescriptionreference_getDescription(sub, r);
          const nested = new Map<number, unknown>();
          fields(nested, sub[0] as unknown as P);
          f.typelib_typedescription_release(sub[0] as D);
          target.set(offset, nested);
        } else
          target.set(
            offset,
            r.eTypeClass === C.ANY ? { pType: null, pData: null, pReserved: null } : [null],
          );
      }
    }
    fields(result, d);
    x.globals.uno_constructData(result, d.aBase);
    return result;
  }
  /** Initializes an actual caller-supplied FFI release witness. @param id - Native witness ID. @returns Interface callback record. */
  function witness(id: number) {
    const w = { acquire: null, release: null, pDispatcher: null, id, count: 10 } as {
      acquire: ((p: unknown) => void) | null;
      release: ((p: unknown) => void) | null;
      pDispatcher: null;
      id: number;
      count: number;
    };
    /** Original caller acquisition callback. @param p - Witness pointer. @returns Nothing. */
    w.acquire = (p: unknown): void => {
      ++(p as typeof w).count;
    };
    /** Original caller release callback observes order and count. @param p - Witness pointer. @returns Nothing. */
    w.release = (p: unknown): void => {
      const v = p as typeof w;
      emit(v.id, --v.count);
    };
    return w;
  }
  /** Original external release callback delegates to caller witness only. @param p - Witness pointer. @returns Nothing. */
  function release(p: unknown): void {
    (p as ReturnType<typeof witness>).release?.(p);
  }
  return { ...x, type, makeEnum, makeSequence, compound, typeDef, prepare, witness, release };
}
it("matches original Any destruction and clear for every class and callback branch", /** Replays initialized C Any records and real nested/compound ownership; no construction algorithm is supplied. @returns Completion. */ async () => {
  const x = await values("any"),
    { f, type, emit, ref, text } = x,
    e = x.makeEnum(),
    seq = x.makeSequence(C.BYTE),
    compound = x.compound("destroy.AnyStruct", C.STRUCT, null, [type(C.STRING), type(C.INTERFACE)]),
    exception = x.compound("destroy.AnyException", C.EXCEPTION, null, [
      type(C.STRING),
      type(C.INTERFACE),
    ]),
    td = x.typeDef();
  x.destr._destructData([17], td, null, null);
  for (let c = 0; c <= 22; c++) {
    if ((c > 19 && c !== 20 && c !== 22) || c === 18) continue;
    const r =
      c === 15
        ? (e.pWeakRef as R)
        : c === 17
          ? (compound.pWeakRef as R)
          : c === 19
            ? (exception.pWeakRef as R)
            : c === 16
              ? td
              : c === 20
                ? (seq.pWeakRef as R)
                : type(c as C);
    for (let m = 0; m < 3; m++)
      for (let cb = 0; cb < 2; cb++)
        for (let nonnull = 0; nonnull < 2; nonnull++) {
          const hold = x.name("held"),
            held = type(C.BYTE),
            w = x.witness(73),
            a: uno_Any = { pType: r, pData: [null], pReserved: null };
          f.typelib_typedescriptionreference_acquire(r);
          switch (c) {
            case 12:
              a.pReserved = hold.pData;
              x.strings.rtl_uString_acquire(hold.pData);
              break;
            case 13:
              a.pReserved = held;
              f.typelib_typedescriptionreference_acquire(held);
              break;
            case 14: {
              const n: uno_Any = { pType: type(C.STRING), pData: [null], pReserved: hold.pData };
              f.typelib_typedescriptionreference_acquire(n.pType as R);
              x.strings.rtl_uString_acquire(hold.pData);
              a.pData = n;
              break;
            }
            case 17:
            case 19: {
              const d = c === 17 ? compound : exception,
                p = x.prepare(d as unknown as P);
              if (nonnull)
                (
                  p.get(((d as unknown as P).pMemberOffsets as Int32Array)[1] as number) as [
                    unknown,
                  ]
                )[0] = w;
              a.pData = p;
              break;
            }
            case 20:
              a.pReserved = x.globals.g_emptySeq;
              x.atomic.osl_atomic_increment(x.globals.emptySequenceCountAddress());
              break;
            case 22:
              a.pReserved = nonnull ? w : null;
              break;
            default:
              break;
          }
          const oldData = a.pData,
            oldReserved = a.pReserved;
          emit(c, m, cb, nonnull);
          ref(r);
          text(hold.pData);
          ref(held);
          if (m === 0) x.destr._destructAny(a, cb ? x.release : null);
          else if (m === 1) x.any.uno_any_destruct(a, cb ? x.release : null);
          else x.any.uno_any_clear(a, cb ? x.release : null);
          ref(r);
          text(hold.pData);
          ref(held);
          emit(
            w.count,
            a.pData === a,
            a.pData === oldData,
            a.pReserved === oldReserved,
            a.pType === (m === 2 ? x.globals.g_pVoidType[0] : r),
          );
          if (m === 2) {
            ref(a.pType);
            x.any.uno_any_destruct(a, null);
          }
          hold.dispose();
        }
  }
  x.finish();
  f.typelib_typedescriptionreference_release(td);
  for (const d of [exception, compound, seq, e]) f.typelib_typedescription_release(d);
});
it("matches every original element class, empty/subranges and exact release ordering", /** Actual element addresses use real source byte strides and initialized caller records. @returns Completion. */ async () => {
  const x = await values("elements"),
    { f, type, emit, ref, text } = x,
    e = x.makeEnum(),
    seq = x.makeSequence(C.BYTE),
    base = x.compound("destroy.ElementBase", C.STRUCT, null, [
      type(C.INTERFACE),
      type(C.INTERFACE),
    ]),
    derived = x.compound("destroy.ElementDerived", C.STRUCT, base, [
      type(C.INTERFACE),
      type(C.INTERFACE),
    ]),
    exception = x.compound("destroy.ElementException", C.EXCEPTION, null, [
      type(C.INTERFACE),
      type(C.STRING),
    ]),
    td = x.typeDef();
  for (let c = 0; c <= 22; c++) {
    if ((c > 19 && c !== 20 && c !== 22) || c === 18) continue;
    const r =
        c === 15
          ? (e.pWeakRef as R)
          : c === 17
            ? (derived.pWeakRef as R)
            : c === 19
              ? (exception.pWeakRef as R)
              : c === 16
                ? td
                : c === 20
                  ? (seq.pWeakRef as R)
                  : type(c as C),
      slot: [D | null] = [null];
    if (c !== 16) f.typelib_typedescriptionreference_getDescription(slot, r);
    const d = slot[0] as D,
      size = c === 16 ? 0 : d.nSize;
    for (let cb = 0; cb < 2; cb++)
      for (let empty = 0; empty < 2; empty++) {
        const p = new Map<number, unknown>(),
          held = x.name("element"),
          w = [] as ReturnType<typeof x.witness>[];
        for (let i = 0; i < 5; i++) {
          const wi = x.witness(i);
          w.push(wi);
          const offset = size * i;
          switch (c) {
            case 12:
              p.set(offset, [held.pData]);
              x.strings.rtl_uString_acquire(held.pData);
              break;
            case 13:
              p.set(offset, [type(C.BYTE)]);
              f.typelib_typedescriptionreference_acquire(type(C.BYTE));
              break;
            case 14: {
              const a: uno_Any = {
                pType: type(C.INTERFACE),
                pData: [null],
                pReserved: i === 2 ? null : wi,
              };
              p.set(offset, a);
              f.typelib_typedescriptionreference_acquire(a.pType as R);
              break;
            }
            case 17: {
              const v = x.prepare(d as unknown as P),
                pd = d as unknown as P,
                pb = pd.pBaseTypeDescription as P;
              for (let j = 0; j < 2; j++) {
                (v.get((pb.pMemberOffsets as Int32Array)[j] as number) as [unknown])[0] = wi;
                (v.get((pd.pMemberOffsets as Int32Array)[j] as number) as [unknown])[0] = wi;
              }
              p.set(offset, v);
              break;
            }
            case 19: {
              const v = x.prepare(d as unknown as P);
              (
                v.get(((d as unknown as P).pMemberOffsets as Int32Array)[0] as number) as [unknown]
              )[0] = wi;
              p.set(offset, v);
              break;
            }
            case 20:
              p.set(offset, [x.globals.g_emptySeq]);
              x.atomic.osl_atomic_increment(x.globals.emptySequenceCountAddress());
              break;
            case 22:
              p.set(offset, [i === 2 ? null : wi]);
              break;
            default:
              break;
          }
        }
        emit(c, cb, empty);
        ref(r);
        text(held.pData);
        ref(type(C.BYTE));
        const result = x.destr.idestructElements(
          p,
          r,
          empty ? 3 : 1,
          empty ? 3 : 4,
          cb ? x.release : null,
        );
        emit(result);
        ref(r);
        text(held.pData);
        ref(type(C.BYTE));
        for (const a of w) emit(a.id, a.count);
        if (empty) x.destr.idestructElements(p, r, 0, 5, cb ? x.release : null);
        else {
          x.destr.idestructElements(p, r, 0, 1, cb ? x.release : null);
          x.destr.idestructElements(p, r, 4, 5, cb ? x.release : null);
        }
        held.dispose();
      }
    if (d) f.typelib_typedescription_release(d);
  }
  x.finish();
  f.typelib_typedescriptionreference_release(td);
  for (const d of [exception, derived, base, seq, e]) f.typelib_typedescription_release(d);
});
it("matches original sequence held-count, zero-count and provided/temporary description paths", /** Real addressed element storage and count fields replay native destruction boundaries. @returns Completion. */ async () => {
  const x = await values("sequences"),
    { f, emit, ref, text } = x;
  for (const c of [C.BYTE, C.STRING, C.INTERFACE]) {
    const d = x.makeSequence(c);
    for (const count of [0, 3])
      for (let mode = 0; mode < 4; mode++) {
        const size = c === C.BYTE ? 1 : 8,
          storage = new Map<number, unknown>(),
          s = { nRefCount: 2, nElements: count, elements: storage },
          held = x.name("sequence");
        for (let i = 0; i < count; i++) {
          const w = x.witness(i);
          if (c === C.STRING) {
            storage.set(size * i, [held.pData]);
            x.strings.rtl_uString_acquire(held.pData);
          } else if (c === C.INTERFACE) storage.set(size * i, [i === 1 ? null : w]);
          else storage.set(size * i, [i]);
        }
        emit(c, count, mode, s.nRefCount);
        ref(d.pWeakRef);
        text(held.pData);
        x.destr.idestructSequence(s, d.pWeakRef as R, mode === 1 ? d : null, null);
        emit(s.nRefCount);
        text(held.pData);
        if (mode === 2) {
          s.nRefCount = 0;
          x.destr.idestroySequence(s, d.pWeakRef as R, d, x.release);
        } else if (mode === 3) {
          s.nRefCount = 0;
          x.sequence.uno_type_sequence_destroy(s, d.pWeakRef as R, x.release);
        } else x.globals.destructSequence(s, d.pWeakRef as R, mode === 1 ? d : null, x.release);
        text(held.pData);
        ref(d.pWeakRef);
        held.dispose();
      }
    f.typelib_typedescription_release(d);
  }
  x.finish();
});
it("retains the two original fatal zero-count destruction invariants", /** Native binaries abort for both violations; browser assertion boundary throws without destructive repair. @returns Completion. */ async () => {
  const x = await context("sequences"),
    r = x.f.typelib_static_type_getByTypeClass(C.VOID)[0] as R;
  expect(fixture.assertions["assert-null"].signal).toBe("SIGABRT");
  expect(fixture.assertions["assert-count"].signal).toBe("SIGABRT");
  expect(
    /** Invokes the exact original failing invariant without storage repair. @returns Nothing. */
    () =>
      x.destr.idestroySequence(
        null as unknown as import("../../inc/uno/sequence2").uno_Sequence,
        r,
        null,
        null,
      ),
  ).toThrow("assert(pSeq != nullptr)");
  expect(
    /** Invokes the exact original failing invariant without storage repair. @returns Nothing. */
    () =>
      x.destr.idestroySequence(
        { nRefCount: 1, nElements: 0, elements: new Int8Array(0) },
        r,
        null,
        null,
      ),
  ).toThrow("assert(pSeq->nRefCount == 0)");
});
