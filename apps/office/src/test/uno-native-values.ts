/** @fileoverview Replays complete original normal LP64 copy/default/convert ownership and addressed native observations through actual shared owners. */
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { expect, vi } from "vitest";
import { typelib_TypeClass as C } from "../cppu/inc/typelib/typeclass";
import type {
  typelib_TypeDescription as D,
  typelib_TypeDescriptionReference as R,
  typelib_CompoundTypeDescription as P,
} from "../cppu/inc/typelib/typedescription";
import type { uno_Any } from "../cppu/inc/uno/any2";
import type { rtl_uString } from "../sal/inc/rtl/ustring.h";

/** Complete unchanged native observation stream for one caller mode. */
export interface UnoNativeCapture {
  /** Gzip-compressed signed32 observations. */
  gzipBase64: string;
  /** Whole uncompressed SHA256 digest. */
  digest: string;
}
/** Loads fresh original process state and complete native observations. @param capture - Complete original process observations. @returns Actual public owners and stream writers. */
async function context(capture: UnoNativeCapture) {
  vi.resetModules();
  const f = await import("../cppu/inc/typelib/typedescription"),
    constr = await import("../cppu/source/uno/constr"),
    internal = await import("../cppu/source/typelib/typelib"),
    destr = await import("../cppu/source/uno/destr"),
    copy = await import("../cppu/source/uno/copy"),
    any = await import("../cppu/source/uno/any"),
    sequence = await import("../cppu/source/uno/sequence"),
    strings = await import("../sal/inc/rtl/ustring.h"),
    globals = await import("../cppu/source/uno/data"),
    atomic = await import("../sal/inc/osl/interlck"),
    { OUString } = await import("../sal/inc/rtl/ustring"),
    { StringConcat } = await import("../sal/inc/rtl/stringconcat");
  const expected = gunzipSync(Buffer.from(capture.gzipBase64, "base64")),
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
    expect(createHash("sha256").update(actual).digest("hex")).toBe(capture.digest);
  }
  return {
    f,
    constr,
    internal,
    destr,
    copy,
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

/** Prepares actual C factories, initialized caller values and FFI witnesses. @param capture - Complete original observations. @param booleanBytes - Opt-in original SAL_Bool byte observations; normal data-copy callers still require logical boolean normalization. @returns Actual owners and native observation operations. */
export async function createUnoNativeInputs(capture: UnoNativeCapture, booleanBytes = false) {
  const x = await context(capture),
    { f, name, emit } = x;
  /** Resolves the original static cell without another type owner. @param c - Type class. @returns Reference. */
  function type(c: C): R {
    return f.typelib_static_type_getByTypeClass(c)[0] as R;
  }
  /** Real registered compound factory with caller-owned names. @param label - Name. @param cls - Class. @param base - Base. @param refs - Members. @returns Description. */
  function compound(label: string, cls: C, base: D | null, refs: R[]): D {
    const n = name(label),
      names = refs.map(
        /** Original member input owner. @param unused - Reference. @param i - Index. @returns Owner. */ (
          _unused,
          i,
        ) => name("m" + i),
      ),
      members = refs.map(
        /** Original member-init record. @param r - Type. @param i - Index. @returns Input. */ (
          r,
          i,
        ) => ({
          eTypeClass: r.eTypeClass,
          pTypeName: r.pTypeName,
          pMemberName: (names[i] as typeof n).pData,
        }),
      ),
      out: [D | null] = [null];
    f.typelib_typedescription_new(out, cls, n.pData, base?.pWeakRef ?? null, refs.length, members);
    f.typelib_typedescription_register(out);
    for (const m of names) m.dispose();
    n.dispose();
    return out[0] as D;
  }
  /** Real sequence factory and original lazy Unicode name expression. @param r - Element. @returns Description. */
  function sequence(r: R): D {
    const suffix = new x.OUString(r.pTypeName as rtl_uString),
      n = new x.OUString(new x.StringConcat(x.OUString.Concat(x.ascii("[]")), suffix)),
      out: [D | null] = [null];
    f.typelib_typedescription_new(out, C.SEQUENCE, n.pData, r, 0, null);
    f.typelib_typedescription_register(out);
    n.dispose();
    suffix.dispose();
    return out[0] as D;
  }
  const n = name("copy.Enum"),
    a = name("Low"),
    b = name("High"),
    out: [D | null] = [null];
  f.typelib_typedescription_newEnum(
    out,
    n.pData,
    -23,
    2,
    [a.pData, b.pData],
    new Int32Array([-23, 19]),
  );
  f.typelib_typedescription_register(out);
  const en = out[0] as D;
  b.dispose();
  a.dispose();
  n.dispose();
  const base = compound("copy.Base", C.STRUCT, null, [
      type(C.STRING),
      type(C.TYPE),
      type(C.INTERFACE),
    ]),
    record = compound("copy.Record", C.STRUCT, base, [
      type(C.ANY),
      type(C.INTERFACE),
      en.pWeakRef as R,
    ]),
    exc = compound("copy.Exception", C.EXCEPTION, null, [type(C.STRING), type(C.INTERFACE)]),
    seq = sequence(type(C.INTERFACE)),
    outer = sequence(seq.pWeakRef as R);
  /** Actual type table from original factories. @param c - Class. @returns Reference. */
  function get(c: C): R {
    return c === C.ENUM
      ? (en.pWeakRef as R)
      : c === C.STRUCT
        ? (record.pWeakRef as R)
        : c === C.EXCEPTION
          ? (exc.pWeakRef as R)
          : c === C.SEQUENCE
            ? (seq.pWeakRef as R)
            : type(c);
  }
  /** Caller witness callbacks record actual native release/acquire order and counts. @param id - ID. @returns Original three callback-slot record. */
  function witness(id: number) {
    const w = { acquire: null, release: null, pDispatcher: null, id, count: 10 } as {
      acquire: ((p: unknown) => void) | null;
      release: ((p: unknown) => void) | null;
      pDispatcher: null;
      id: number;
      count: number;
    };
    /** Original caller acquisition observation. @param p - Witness. @returns Nothing. */
    w.acquire = (p: unknown): void => {
      const v = p as typeof w;
      emit(1, v.id, ++v.count);
    };
    /** Original caller release observation. @param p - Witness. @returns Nothing. */
    w.release = (p: unknown): void => {
      const v = p as typeof w;
      emit(2, v.id, --v.count);
    };
    return w;
  }
  /** Caller callback forwards only to supplied witness. @param p - Pointer. @returns Nothing. */
  function acquire(p: unknown): void {
    (p as ReturnType<typeof witness>).acquire?.(p);
  }
  /** Caller callback forwards only to supplied witness. @param p - Pointer. @returns Nothing. */
  function release(p: unknown): void {
    (p as ReturnType<typeof witness>).release?.(p);
  }
  /** Actual caller mapping witness; it supplies no generated provider or conversion algorithm. @param target - Original caller return pointer. @param drop - Null result. @returns Mapping record. */
  function mapping(
    target: ReturnType<typeof witness>,
    drop: boolean,
  ): import("../cppu/inc/uno/mapping").uno_Mapping {
    return {
      acquire: null,
      release: null,
      /** Observes original inout initialization/type/arguments, then returns a caller pointer. @param unused - Record. @param out - Inout cell. @param p - Source pointer. @param d - Actual interface description. @returns Nothing. */
      mapInterface(_unused, out, p, d): void {
        emit(
          3,
          (p as ReturnType<typeof witness>).id,
          out[0] === null,
          d.aBase.eTypeClass,
          d.nAllMembers,
        );
        if (drop) out[0] = null;
        else {
          out[0] = target;
          ++target.count;
        }
      },
    };
  }
  /** Observes complete source-initialized Any type/data identity and value; unused reserved high bytes are not a public binary ABI. @param a - Actual Any. @returns Completion. */
  function anyValue(a: uno_Any): void {
    x.ref(a.pType);
    emit(a.pData === a, a.pData === x.copy.reservedDataAddress(a));
    if ((a.pType as R).eTypeClass !== C.VOID) value(a.pData, a.pType as R);
  }
  /** Reads only source-initialized typed values and real held descriptions. @param p - Address. @param r - Type. @returns Nothing. */
  function value(p: unknown, r: R): void {
    const v = (p as [unknown])[0];
    switch (r.eTypeClass) {
      case C.VOID:
        emit(0);
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
        expect(
          typeof v === "boolean" ||
            (booleanBytes && typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= 255),
        ).toBe(true);
        emit(v as boolean);
        break;
      case C.HYPER:
      case C.UNSIGNED_HYPER:
      case C.FLOAT:
      case C.DOUBLE: {
        const buf = new ArrayBuffer(r.eTypeClass === C.FLOAT ? 4 : 8),
          d = new DataView(buf);
        if (r.eTypeClass === C.FLOAT) d.setFloat32(0, v as number, true);
        else if (r.eTypeClass === C.DOUBLE) d.setFloat64(0, v as number, true);
        else d.setBigInt64(0, v as bigint, true);
        for (const word of new Int32Array(buf)) emit(word);
        break;
      }
      case C.STRING:
        x.text(v as rtl_uString);
        break;
      case C.TYPE:
        x.ref(v as R);
        break;
      case C.ANY:
        anyValue(p as uno_Any);
        break;
      case C.INTERFACE:
        emit(v === null);
        if (v !== null) {
          const w = v as ReturnType<typeof witness>;
          emit(w.id, w.count);
        }
        break;
      case C.STRUCT:
      case C.EXCEPTION: {
        const out: [D | null] = [null];
        f.typelib_typedescriptionreference_getDescription(out, r);
        const d = out[0] as unknown as P;
        if (d.pBaseTypeDescription) value(p, d.pBaseTypeDescription.aBase.pWeakRef as R);
        for (let i = d.nMembers; i--;) {
          const offset = (d.pMemberOffsets as Int32Array)[i] as number;
          emit(i, offset);
          value((p as ReadonlyMap<number, unknown>).get(offset), (d.ppTypeRefs as R[])[i] as R);
        }
        f.typelib_typedescription_release(out[0] as D);
        break;
      }
      case C.SEQUENCE: {
        const s = v as import("../cppu/inc/uno/sequence2").uno_Sequence;
        emit(s === x.globals.g_emptySeq, s.nRefCount, s.nElements);
        if (s.nElements) {
          const out: [D | null] = [null];
          f.typelib_typedescriptionreference_getDescription(out, r);
          const e = (
              out[0] as unknown as import("../cppu/inc/typelib/typedescription").typelib_IndirectTypeDescription
            ).pType as R,
            ed: [D | null] = [null];
          f.typelib_typedescriptionreference_getDescription(ed, e);
          for (let i = 0; i < s.nElements; i++)
            value((s.elements as ReadonlyMap<number, unknown>).get((ed[0] as D).nSize * i), e);
          f.typelib_typedescription_release(ed[0] as D);
          f.typelib_typedescription_release(out[0] as D);
        }
        break;
      }
      default:
        throw Error("Unexpected observed class");
    }
  }
  /** Caller fills already constructed storage using actual shared owners, never supplies runtime copy/default implementations. @param p - Actual address. @param r - Type. @param held - Caller held string. @param w - Interface witness. @param variant - Input variant. @returns Nothing. */
  function fill(
    p: unknown,
    r: R,
    held: rtl_uString,
    w: ReturnType<typeof witness>,
    variant: number,
  ): void {
    const cell = p as [unknown];
    switch (r.eTypeClass) {
      case C.CHAR:
        cell[0] = 0xd800;
        break;
      case C.BOOLEAN:
        cell[0] = variant === 0 ? 0 : variant === 1 ? 2 : 255;
        break;
      case C.BYTE:
        cell[0] = -97;
        break;
      case C.SHORT:
        cell[0] = -12345;
        break;
      case C.UNSIGNED_SHORT:
        cell[0] = 54321;
        break;
      case C.LONG:
      case C.ENUM:
        cell[0] = -123456789;
        break;
      case C.UNSIGNED_LONG:
        cell[0] = 0xfedcba98;
        break;
      case C.HYPER:
        cell[0] = -0x123456789abcdefn;
        break;
      case C.UNSIGNED_HYPER:
        cell[0] = 0xfedcba9876543210n;
        break;
      case C.FLOAT:
        cell[0] = Math.fround(-1.2345);
        break;
      case C.DOUBLE:
        cell[0] = -0;
        break;
      case C.STRING:
        x.strings.rtl_uString_release(cell[0] as rtl_uString);
        cell[0] = held;
        x.strings.rtl_uString_acquire(held);
        break;
      case C.TYPE:
        f.typelib_typedescriptionreference_release(cell[0] as R);
        cell[0] = type(C.BYTE);
        f.typelib_typedescriptionreference_acquire(type(C.BYTE));
        break;
      case C.ANY:
        if (variant === 1)
          x.any.uno_type_any_assign(p as uno_Any, [held], type(C.STRING), null, null);
        else if (variant === 2)
          x.any.uno_type_any_assign(p as uno_Any, [w], type(C.INTERFACE), null, null);
        break;
      case C.INTERFACE:
        cell[0] = variant ? w : null;
        break;
      case C.STRUCT:
      case C.EXCEPTION: {
        const out: [D | null] = [null];
        f.typelib_typedescriptionreference_getDescription(out, r);
        fields(p, out[0] as unknown as P, held, w, variant);
        f.typelib_typedescription_release(out[0] as D);
        break;
      }
      case C.SEQUENCE: {
        const s = x.copy.allocSeq(8, 3) as import("../cppu/inc/uno/sequence2").uno_Sequence;
        for (let i = 0; i < 3; i++)
          ((s.elements as ReadonlyMap<number, unknown>).get(8 * i) as [unknown])[0] =
            i === 1 ? null : w;
        x.globals.destructSequence(
          cell[0] as import("../cppu/inc/uno/sequence2").uno_Sequence,
          r,
          null,
          null,
        );
        cell[0] = s;
        break;
      }
      default:
        break;
    }
  }
  /** Follows actual source member offsets and base-first/reverse field input order. @param p - Storage. @param d - Compound. @param held - Held string. @param w - Witness. @param variant - Variant. @returns Nothing. */
  function fields(
    p: unknown,
    d: P,
    held: rtl_uString,
    w: ReturnType<typeof witness>,
    variant: number,
  ): void {
    if (d.pBaseTypeDescription) fields(p, d.pBaseTypeDescription, held, w, variant);
    for (let i = d.nMembers; i--;)
      fill(
        (p as ReadonlyMap<number, unknown>).get((d.pMemberOffsets as Int32Array)[i] as number),
        (d.ppTypeRefs as R[])[i] as R,
        held,
        w,
        variant,
      );
  }
  /** Native caller allocation plus actual default construction and input initialization. @param r - Type. @param held - String. @param w - Witness. @param variant - Variant. @returns Original logical address. */
  function sample(
    r: R,
    held: rtl_uString,
    w: ReturnType<typeof witness>,
    variant: number,
  ): unknown {
    const p = x.copy.allocateUnoStorage();
    x.globals.uno_type_constructData(p, r);
    fill(p, r, held, w, variant);
    return p;
  }
  /** Invokes the eight actual original data-copy forms. @param m - Mode. @param dst - Destination. @param src - Source. @param r - Type. @param d - Description. @param map - Mapping. @returns Nothing. */
  function copyData(
    m: number,
    dst: unknown,
    src: unknown,
    r: R,
    d: D,
    map: import("../cppu/inc/uno/mapping").uno_Mapping,
  ): void {
    switch (m) {
      case 0:
        x.copy._copyConstructData(dst, src, r, null, null, null);
        break;
      case 1:
        x.copy._copyConstructData(dst, src, r, d, acquire, null);
        break;
      case 2:
        x.globals.uno_type_copyData(dst, src, r, acquire);
        break;
      case 3:
        x.globals.uno_copyData(dst, src, d, null);
        break;
      case 4:
        x.copy._copyConstructData(dst, src, r, null, null, map);
        break;
      case 5:
        x.copy._copyConstructData(dst, src, r, d, acquire, map);
        break;
      case 6:
        x.globals.uno_type_copyAndConvertData(dst, src, r, map);
        break;
      case 7:
        x.globals.uno_copyAndConvertData(dst, src, d, map);
        break;
    }
  }
  /** Invokes all actual original Any C boundaries and inline forms. @param m - Mode. @param dst - Destination. @param src - Optional source. @param r - Optional type. @param d - Optional description. @param map - Mapping. @returns Nothing. */
  function copyAny(
    m: number,
    dst: uno_Any,
    src: unknown,
    r: R | null,
    d: D | null,
    map: import("../cppu/inc/uno/mapping").uno_Mapping | null,
  ): void {
    switch (m) {
      case 0:
        x.copy._copyConstructAny(dst, src, r as R, null, null, null);
        break;
      case 1:
        x.copy._copyConstructAny(dst, src, r as R, d, acquire, map);
        break;
      case 2:
        x.any.uno_type_any_construct(dst, src, r, null);
        break;
      case 3:
        x.any.uno_any_construct(dst, src, d, acquire);
        break;
      case 4:
        x.any.uno_type_any_constructAndConvert(dst, src, r, map);
        break;
      case 5:
        x.any.uno_any_constructAndConvert(dst, src, d, map);
        break;
      case 6:
        x.any.uno_type_any_assign(dst, src, r, acquire, release);
        break;
      case 7:
        x.any.uno_any_assign(dst, src, d, acquire, release);
        break;
    }
  }
  /** Original type owners release in native scope order. @returns Nothing. */
  function dispose(): void {
    for (const d of [outer, seq, exc, record, base, en]) f.typelib_typedescription_release(d);
  }
  return {
    ...x,
    type,
    get,
    sequence,
    compound,
    sample,
    fill,
    fields,
    value,
    anyValue,
    witness,
    mapping,
    acquire,
    release,
    copyData,
    copyAny,
    dispose,
    en,
    base,
    record,
    exc,
    seq,
    outer,
  };
}
