/** @fileoverview Replays complete original UNO sequence C engine lifecycle, element helper and size guard captures through the shared native-value observers. */
import { it } from "vitest";
import fixture from "./native-sequence-engine-cases.json";
import { createUnoNativeInputs } from "../../../test/uno-native-values";
import { typelib_TypeClass as C } from "../../inc/typelib/typeclass";
import type {
  typelib_TypeDescription as D,
  typelib_TypeDescriptionReference as R,
} from "../../inc/typelib/typedescription";
import type { uno_Sequence } from "../../inc/uno/sequence2";
/** Native logical byte-address expressions shared with existing actual CPPu allocation. */
type Elements = Pick<ReadonlyMap<number, unknown>, "get">;
/** Creates the actual engine adapters and full initialized native observers. @param mode - Original complete stream. @returns Actual owner APIs and caller boundaries. */
async function caller(mode: keyof typeof fixture.captures) {
  const x = await createUnoNativeInputs(fixture.captures[mode], true),
    engine = await import("./sequence-elements"),
    sequenceAPI = await import("./sequence");
  /** Records native nullness and every initialized sequence element. @param s - Actual sequence. @param d - Actual sequence description. @returns Nothing. */
  function observe(s: uno_Sequence | null, d: D): void {
    x.emit(s === null);
    if (s !== null) x.value([s], d.pWeakRef as R);
  }
  /** Invokes actual C constructors. @param api - Description/reference mode. @param s - Out pointer. @param d - Description. @param source - Caller elements. @param n - Count. @returns Source success. */
  function construct(
    api: number,
    s: [uno_Sequence | null],
    d: D,
    source: Elements | null,
    n: number,
  ): boolean {
    return api
      ? sequenceAPI.uno_sequence_construct(s, d, source, n, x.acquire)
      : sequenceAPI.uno_type_sequence_construct(s, d.pWeakRef as R, source, n, x.acquire);
  }
  /** Invokes actual C reallocation. @param api - Boundary. @param s - Pointer. @param d - Description. @param n - Count. @returns Source success. */
  function resize(api: number, s: [uno_Sequence | null], d: D, n: number): boolean {
    return api
      ? sequenceAPI.uno_sequence_realloc(s, d, n, x.acquire, x.release)
      : sequenceAPI.uno_type_sequence_realloc(s, d.pWeakRef as R, n, x.acquire, x.release);
  }
  /** Invokes actual C copy-on-write. @param api - Boundary. @param s - Pointer. @param d - Description. @returns Source success. */
  function unique(api: number, s: [uno_Sequence | null], d: D): boolean {
    return api
      ? sequenceAPI.uno_sequence_reference2One(s, d, x.acquire, x.release)
      : sequenceAPI.uno_type_sequence_reference2One(s, d.pWeakRef as R, x.acquire, x.release);
  }
  /** Invokes actual C assignment. @param api - Boundary. @param s - Destination. @param from - Source. @param d - Description. @returns Nothing. */
  function assign(api: number, s: [uno_Sequence | null], from: uno_Sequence, d: D): void {
    if (api) sequenceAPI.uno_sequence_assign(s, from, d, x.release);
    else sequenceAPI.uno_type_sequence_assign(s, from, d.pWeakRef as R, x.release);
  }
  return { ...x, engine, sequenceAPI, observe, construct, resize, unique, assign };
}
it("matches complete original sequence construction COW resize assignment and ownership histories", /** Compares every initialized output and ordered reference/callback event. @returns Complete replay. */ async () => {
  const x = await caller("lifecycle");
  for (let c = 1; c <= 22; c++) {
    if ([16, 18, 21].includes(c)) continue;
    const r = x.get(c),
      description: [D | null] = [null];
    x.f.typelib_typedescriptionreference_getDescription(description, r);
    const d = description[0] as D,
      sd = x.sequence(r);
    for (let variant = 0; variant < 3; variant++)
      for (let api = 0; api < 2; api++)
        for (const n of [0, 1, 3])
          for (const shared of [1, 2]) {
            x.emit(c, variant, api, n, shared);
            const held = x.name("Ab"),
              w = x.witness(41);
            w.count = 1000;
            let source: Elements | null = null;
            if (variant) {
              source = x.copy.allocateUnoStorage() as Elements;
              for (let i = 0; i < n; i++) {
                const p = source.get(i * d.nSize);
                x.globals.uno_type_constructData(p, r);
                x.fill(p, r, held.pData, w, variant);
              }
            }
            const s: [uno_Sequence | null] = [null];
            x.emit(x.construct(api, s, sd, source, n));
            x.observe(s[0], sd);
            x.ref(r);
            x.text(held.pData);
            x.emit(w.count);
            const alias = shared === 2 ? s[0] : null;
            if (alias) x.atomic.osl_atomic_increment(x.sequenceAPI.sequenceCountAddress(alias));
            if (variant === 2) {
              x.emit(x.unique(api, s, sd));
              x.observe(s[0], sd);
              x.observe(alias, sd);
            }
            for (const size of [n, n + 2, 1, 0, 3, 3, 0]) {
              x.emit(size, x.resize(api, s, sd, size));
              x.observe(s[0], sd);
              x.observe(alias, sd);
              x.ref(r);
              x.text(held.pData);
              x.emit(w.count);
            }
            x.emit(x.unique(api, s, sd));
            x.observe(s[0], sd);
            const other: [uno_Sequence | null] = [null];
            x.construct(api, other, sd, null, 2);
            x.assign(api, other, s[0] as uno_Sequence, sd);
            x.emit(other[0] === s[0]);
            x.observe(s[0], sd);
            x.assign(api, other, other[0] as uno_Sequence, sd);
            x.observe(other[0], sd);
            x.globals.destructSequence(other[0] as uno_Sequence, sd.pWeakRef as R, sd, x.release);
            x.globals.destructSequence(s[0] as uno_Sequence, sd.pWeakRef as R, sd, x.release);
            if (alias) x.globals.destructSequence(alias, sd.pWeakRef as R, sd, x.release);
            if (source)
              for (let i = 0; i < n; i++)
                x.globals.uno_type_destructData(source.get(i * d.nSize), r, x.release);
            x.ref(r);
            x.text(held.pData);
            x.emit(w.count);
            held.dispose();
          }
    x.f.typelib_typedescription_release(sd);
    x.f.typelib_typedescription_release(d);
  }
  x.dispose();
  x.finish();
}, 120000);
it("matches original sequence element helpers empty ranges and unsupported type diagnostics", /** Uses actual supported type owners and complete marker-only diagnostic observations. @returns Complete replay. */ async () => {
  const x = await caller("helpers");
  for (let c = 1; c <= 22; c++) {
    if ([16, 18, 21].includes(c)) continue;
    const r = x.get(c),
      sd = x.sequence(r),
      s: [uno_Sequence | null] = [null];
    x.emit(c, x.engine.idefaultConstructElements(s, r, 0, 0, 0));
    x.observe(s[0], sd);
    x.emit(x.engine.idefaultConstructElements(s, r, 0, 0, -1));
    x.observe(s[0], sd);
    const copy: [uno_Sequence | null] = [null];
    x.emit(
      x.engine.icopyConstructFromElements(
        copy,
        (s[0] as uno_Sequence).elements as Elements,
        r,
        0,
        x.acquire,
        0,
      ),
    );
    x.observe(copy[0], sd);
    x.globals.destructSequence(copy[0] as uno_Sequence, sd.pWeakRef as R, sd, x.release);
    x.globals.destructSequence(s[0] as uno_Sequence, sd.pWeakRef as R, sd, x.release);
    x.f.typelib_typedescription_release(sd);
  }
  for (const c of [0, 16]) {
    const td: [D | null] = [null];
    let r: R;
    if (c) {
      const name = x.name("sequence.Typedef");
      x.internal.typelib_typedescription_newEmpty(td, C.TYPEDEF, name.pData);
      name.dispose();
      r = td[0] as unknown as R;
    } else r = x.type(C.VOID);
    const s: [uno_Sequence | null] = [x.copy.allocSeq(0, 0)],
      old = s[0] as uno_Sequence;
    x.emit(
      c,
      x.engine.idefaultConstructElements(s, r, 0, 0, 0),
      s[0] === old,
      old.nRefCount,
      old.nElements,
    );
    x.emit(
      x.engine.icopyConstructFromElements(
        s,
        x.copy.allocateUnoStorage() as Elements,
        r,
        0,
        null,
        0,
      ),
      s[0] === old,
      old.nRefCount,
      old.nElements,
    );
    if (td[0]) x.f.typelib_typedescription_release(td[0]);
  }
  x.dispose();
  x.finish();
});
it("matches original sequence arithmetic guard failures and full-description nonpositive construction", /** Header-only source guards read no tail or uninitialized cells. @returns Complete replay. */ async () => {
  const x = await caller("guards");
  for (let c = 1; c <= 22; c++) {
    if ([2, 3, 16, 18, 21].includes(c)) continue;
    const r = x.get(c),
      sd = x.sequence(r);
    for (let api = 0; api < 2; api++)
      for (let copying = 0; copying < 2; copying++) {
        const s: [uno_Sequence | null] = [null];
        x.emit(
          c,
          api,
          copying,
          x.construct(
            api,
            s,
            sd,
            copying ? (x.copy.allocateUnoStorage() as Elements) : null,
            2147483647,
          ),
          s[0] === null,
        );
      }
    for (let api = 0; api < 2; api++) {
      const header: uno_Sequence = {
          nRefCount: 2,
          nElements: 2147483647,
          elements: x.copy.allocateUnoStorage() as Elements,
        },
        s: [uno_Sequence | null] = [header];
      x.emit(c, api, x.unique(api, s, sd), s[0] === header, header.nRefCount, header.nElements);
      const valid: [uno_Sequence | null] = [null];
      x.construct(api, valid, sd, null, 1);
      x.emit(x.resize(api, valid, sd, 2147483647));
      x.observe(valid[0], sd);
      x.globals.destructSequence(valid[0] as uno_Sequence, sd.pWeakRef as R, sd, x.release);
    }
    x.f.typelib_typedescription_release(sd);
  }
  const sd = x.sequence(x.type(C.LONG));
  for (const n of [-1, -2147483648]) {
    const s: [uno_Sequence | null] = [null];
    x.emit(n, x.sequenceAPI.uno_sequence_construct(s, sd, null, n, null));
    x.observe(s[0], sd);
    x.globals.destructSequence(s[0] as uno_Sequence, sd.pWeakRef as R, sd, x.release);
  }
  x.f.typelib_typedescription_release(sd);
  const chars = x.sequence(x.type(C.CHAR)),
    header: uno_Sequence = {
      nRefCount: 2,
      nElements: -1,
      elements: x.copy.allocateUnoStorage() as Elements,
    },
    changed: [uno_Sequence | null] = [header];
  x.emit(
    1,
    x.sequenceAPI.uno_sequence_realloc(changed, chars, 2147483646, x.acquire, x.release),
    changed[0] === header,
    header.nRefCount,
    header.nElements,
  );
  x.observe(changed[0], chars);
  x.f.typelib_typedescription_release(chars);
  const bytes = x.sequence(x.type(C.BYTE));
  const valid: [uno_Sequence | null] = [null];
  x.sequenceAPI.uno_sequence_construct(valid, bytes, null, 1, null);
  const alias = valid[0] as uno_Sequence;
  x.atomic.osl_atomic_increment(x.sequenceAPI.sequenceCountAddress(alias));
  x.emit(
    2,
    x.sequenceAPI.uno_sequence_realloc(valid, bytes, -1, x.acquire, x.release),
    valid[0] === null,
    alias.nRefCount,
    alias.nElements,
  );
  x.observe(alias, bytes);
  x.globals.destructSequence(alias, bytes.pWeakRef as R, bytes, x.release);
  x.f.typelib_typedescription_release(bytes);
  x.dispose();
  x.finish();
});
