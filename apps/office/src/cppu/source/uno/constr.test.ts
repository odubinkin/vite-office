/** @fileoverview Replays complete original cppu::detail live borrowed Type cell casts and exact ownership through actual shared owners. */
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { expect, it, vi } from "vitest";
import fixture from "./native-constr-cases.json";
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
    strings = await import("../../../sal/inc/rtl/ustring.h"),
    globals = await import("./data"),
    atomic = await import("../../../sal/inc/osl/interlck"),
    { OUString } = await import("../../../sal/inc/rtl/ustring");
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
    strings,
    globals,
    atomic,
    OUString,
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
    { f, constr, globals: g, atomic, emit, ref, text } = x;
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
  /** Caller-selected release of default-owned members only; this does not call or implement unported destructors. @param p - Initialized storage. @param r - Original type. @returns Nothing. */
  function cleanup(p: unknown, r: R): void {
    const v = (p as [unknown])[0];
    switch (r.eTypeClass) {
      case C.STRING:
        x.strings.rtl_uString_release(v as rtl_uString);
        break;
      case C.TYPE:
        f.typelib_typedescriptionreference_release(v as R);
        break;
      case C.ANY:
        f.typelib_typedescriptionreference_release((p as uno_Any).pType as R);
        break;
      case C.SEQUENCE:
        atomic.osl_atomic_decrement(g.emptySequenceCountAddress());
        break;
      default:
        break;
    }
  }
  /** Invokes each actual inline/source/C default boundary. @param mode - Original call form. @param p - Caller storage. @param r - Type reference. @param d - Full description. @returns Nothing. */
  function construct(mode: number, p: unknown, r: R, d: D): void {
    if (mode === 0) constr._defaultConstructData(p, r, null);
    else if (mode === 1) constr._defaultConstructData(p, r, d);
    else if (mode === 2) g.uno_type_constructData(p, r);
    else g.uno_constructData(p, d);
  }
  return { ...x, storage, observe, cleanup, construct };
}
it("matches every original fundamental default through inline and C boundaries", /** Replays all original initialized values/counts/default pointers without a binary public-data ABI. @returns Completion. */ async () => {
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
      x.cleanup(p, r);
      ref(r);
    }
    f.typelib_typedescription_release(d);
  }
  x.finish();
});
it("matches original enum and derived nested exception/empty compound defaults", /** Uses actual factories/descriptions and existing source-offset field addresses; selected cleanup releases source defaults only. @returns Completion. */ async () => {
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
      } else x.cleanup(p.get(offset), r);
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
      if (d !== e) fields(p as Map<number, unknown>, d as unknown as P, 2);
      ref(d.pWeakRef);
      desc(d);
    }
  x.finish();
  for (const d of [baseOnly, empty, subExc, exc, nested, derived, base, seq, e])
    f.typelib_typedescription_release(d);
});
