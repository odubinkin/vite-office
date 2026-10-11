/** @fileoverview Replays complete original normal LP64 copy/default/convert ownership through shared native-value callers. */
import { it } from "vitest";
import fixture from "./native-copy-cases.json";
import { createUnoNativeInputs } from "../../../test/uno-native-values";
import { typelib_TypeClass as C } from "../../inc/typelib/typeclass";
import type {
  typelib_TypeDescription as D,
  typelib_TypeDescriptionReference as R,
} from "../../inc/typelib/typedescription";
import type { uno_Any } from "../../inc/uno/any2";
/** Reuses the unchanged native value observer and caller-owned type setup. @param mode - Actual complete capture. @returns Native input/observation context. */
async function inputs(mode: keyof typeof fixture.captures) {
  return createUnoNativeInputs(fixture.captures[mode]);
}
it("matches complete original initialized data copy and conversion through all boundaries", /** Replays native input, callbacks, initialized values and exact post-release counts. @returns Completion. */ async () => {
  const x = await inputs("data"),
    { f, emit, ref, text } = x;
  for (let c = 0; c <= 22; c++) {
    if (c === 16 || c === 18 || c === 21) continue;
    const r = x.get(c as C),
      out: [D | null] = [null];
    f.typelib_typedescriptionreference_getDescription(out, r);
    const d = out[0] as D;
    for (let m = 0; m < 8; m++)
      for (let v = 0; v < 3; v++) {
        const held = x.name("owned"),
          w = x.witness(41),
          target = x.witness(91),
          map = x.mapping(target, v === 1),
          src = x.sample(r, held.pData, w, v),
          dst = x.copy.allocateUnoStorage();
        emit(c, m, v);
        ref(r);
        text(held.pData);
        x.copyData(m, dst, src, r, d, map);
        x.value(dst, r);
        ref(r);
        text(held.pData);
        emit(w.count, target.count);
        x.globals.uno_type_destructData(dst, r, x.release);
        x.globals.uno_type_destructData(src, r, x.release);
        emit(w.count, target.count);
        ref(r);
        text(held.pData);
        held.dispose();
      }
    f.typelib_typedescription_release(d);
  }
  x.finish();
  x.dispose();
});
it("matches original Any default copy flatten conversion assignment and null-type branches", /** Replays every source/presence/type/description/API branch using real shared ownership. @returns Completion. */ async () => {
  const x = await inputs("any"),
    { f, emit, ref, text } = x;
  const marker = { value: 17 };
  for (let c = 0; c <= 22; c++) {
    if (c === 16 || c === 18 || c === 21) continue;
    const r = x.get(c as C),
      out: [D | null] = [null];
    f.typelib_typedescriptionreference_getDescription(out, r);
    const d = out[0] as D;
    for (let m = 0; m < 8; m++)
      for (let present = 0; present < 2; present++)
        for (let v = 0; v < 3; v++) {
          const held = x.name("any"),
            w = x.witness(41),
            target = x.witness(91),
            map = x.mapping(target, v === 1),
            src = present ? x.sample(r, held.pData, w, v) : null,
            dst: uno_Any = { pType: null, pData: marker, pReserved: marker };
          if (m >= 6) x.any.uno_type_any_construct(dst, [held.pData], x.type(C.STRING), null);
          emit(c, m, present, v);
          ref(r);
          text(held.pData);
          x.copyAny(m, dst, src, r, d, map);
          x.anyValue(dst);
          ref(r);
          text(held.pData);
          emit(w.count, target.count);
          x.any.uno_any_destruct(dst, x.release);
          if (src !== null) x.globals.uno_type_destructData(src, r, x.release);
          ref(r);
          text(held.pData);
          emit(w.count, target.count);
          held.dispose();
        }
    f.typelib_typedescription_release(d);
  }
  for (let m = 2; m < 8; m++) {
    const held = x.name("null-type"),
      a: uno_Any = { pType: null, pData: marker, pReserved: marker };
    if (m >= 6) x.any.uno_type_any_construct(a, [held.pData], x.type(C.STRING), null);
    emit(m);
    text(held.pData);
    x.copyAny(m, a, null, null, null, null);
    x.anyValue(a);
    text(held.pData);
    x.any.uno_any_destruct(a, null);
    held.dispose();
  }
  x.finish();
  x.dispose();
});
it("matches original sequence reference sharing and reverse nested element conversion", /** Replays actual element ownership for primitive string type enum Any compound exception sequence and interface records. @returns Completion. */ async () => {
  const x = await inputs("sequences"),
    { f, emit, ref, text } = x;
  for (const c of [
    C.BYTE,
    C.STRING,
    C.TYPE,
    C.ENUM,
    C.ANY,
    C.STRUCT,
    C.EXCEPTION,
    C.SEQUENCE,
    C.INTERFACE,
  ]) {
    const r = c === C.SEQUENCE ? (x.seq.pWeakRef as R) : x.get(c),
      out: [D | null] = [null];
    f.typelib_typedescriptionreference_getDescription(out, r);
    const d = out[0] as D,
      sd = x.sequence(r);
    for (const n of [0, 3])
      for (let m = 0; m < 3; m++) {
        const held = x.name("sequence"),
          w = x.witness(41),
          target = x.witness(91),
          map = x.mapping(target, m === 2),
          src = x.copy.allocSeq(d.nSize, n) as import("../../inc/uno/sequence2").uno_Sequence;
        for (let i = 0; i < n; i++) {
          const p = (src.elements as ReadonlyMap<number, unknown>).get(d.nSize * i);
          x.globals.uno_type_constructData(p, r);
          x.fill(p, r, held.pData, w, i);
        }
        emit(c, n, m);
        ref(r);
        text(held.pData);
        const dst = x.copy.icopyConstructSequence(
          src,
          r,
          null,
          m ? map : null,
        ) as import("../../inc/uno/sequence2").uno_Sequence;
        emit(dst === src, dst === x.globals.g_emptySeq);
        x.value([dst], sd.pWeakRef as R);
        ref(r);
        text(held.pData);
        emit(w.count, target.count);
        x.globals.destructSequence(dst, sd.pWeakRef as R, sd, x.release);
        x.globals.destructSequence(src, sd.pWeakRef as R, sd, x.release);
        ref(r);
        text(held.pData);
        emit(w.count, target.count);
        held.dispose();
      }
    f.typelib_typedescription_release(sd);
    f.typelib_typedescription_release(d);
  }
  x.finish();
  x.dispose();
});
it("matches original allocation guards diagnostic paths and addressed field aliasing", /** Synthetic untouched-tail header guards certify only original guard behavior; no impossible sequence producer is supplied. @returns Completion. */ async () => {
  const x = await inputs("guards"),
    { f, emit, ref } = x;
  for (const [size, count] of [
    [0, 0],
    [8, 0],
    [1, 3],
    [2147483647, 2147483647],
  ]) {
    const s = x.copy.allocSeq(size as number, count as number);
    emit(size as number, count as number, s === null);
    if (s !== null) emit(s.nRefCount, s.nElements);
  }
  const n = x.name("copy.Typedef"),
    out: [D | null] = [null];
  x.internal.typelib_typedescription_newEmpty(out, C.TYPEDEF, n.pData);
  const td = out[0] as D,
    r = x.internal.referenceViewOf(td),
    marker = { value: 17 };
  let a: uno_Any = { pType: null, pData: marker, pReserved: marker };
  x.copy._copyConstructAnyFromData(a, [marker], x.type(C.ANY), null, null, null);
  emit(a.pData === marker, a.pReserved === marker);
  ref(a.pType);
  f.typelib_typedescriptionreference_release(a.pType as R);
  for (let mode = 0; mode < 2; mode++) {
    a = { pType: null, pData: marker, pReserved: marker };
    if (mode) x.copy._copyConstructAny(a, null, r, null, null, null);
    else x.copy._copyConstructAnyFromData(a, [marker], r, null, null, null);
    emit(mode, a.pData === marker, a.pReserved === marker);
    ref(a.pType);
    f.typelib_typedescriptionreference_release(a.pType as R);
  }
  const target = x.witness(91),
    map = x.mapping(target, false),
    header = { nRefCount: 1, nElements: 2147483647, elements: new Int8Array([0]) };
  for (const e of [
    x.type(C.ANY),
    x.record.pWeakRef as R,
    x.exc.pWeakRef as R,
    x.seq.pWeakRef as R,
    x.type(C.INTERFACE),
    r,
  ]) {
    ref(e);
    const ret = x.copy.icopyConstructSequence(header, e, null, map);
    emit(ret === null, header.nRefCount);
    ref(e);
  }
  f.typelib_typedescription_release(td);
  const mem = x.copy.allocateUnoStorage() as ReadonlyMap<number, unknown>,
    first = mem as unknown as [unknown],
    sub = mem.get(8) as [unknown];
  first[0] = 17;
  sub[0] = 29;
  emit(
    mem.get(0) === mem,
    (sub as unknown as ReadonlyMap<number, unknown>).get(8) === mem.get(16),
    first[0] as number,
    sub[0] as number,
  );
  const pa = mem.get(24) as uno_Any;
  pa.pType = x.type(C.BYTE);
  pa.pData = null;
  pa.pReserved = marker;
  emit(x.copy.reservedDataAddress(pa) === mem.get(40));
  pa.pReserved = first;
  const reserved = x.copy.reservedDataAddress(pa);
  emit(reserved[0] === first);
  reserved[0] = sub;
  emit(pa.pReserved === sub);
  x.finish();
  n.dispose();
  x.dispose();
});
