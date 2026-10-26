/** @fileoverview Complete original interface-factory observations replayed through actual shared CPPU/SAL owners; compares every captured initialized field and byte. */
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { expect, it, vi } from "vitest";
import fixture from "./native-interface-factories-cases.json";
import { typelib_TypeClass as C } from "../../inc/typelib/typeclass";
import type {
  typelib_TypeDescriptionReference as R,
  typelib_InterfaceTypeDescription as I,
} from "../../inc/typelib/typedescription";
import type { rtl_uString } from "../../../sal/inc/rtl/ustring.h";

/** Loads independent native-process state and every complete initialized observation. @param mode - Original process mode. @returns Actual owners and stream recording. */
async function context(mode: keyof typeof fixture.captures) {
  vi.resetModules();
  const t = await import("./typelib"),
    f = {
      ...(await import("../../inc/typelib/typedescription")),
      BaseList: (await import("./typelib-interface-factories")).BaseList,
    },
    { OUString, StringConcat } = {
      ...(await import("../../../sal/inc/rtl/ustring")),
      ...(await import("../../../sal/inc/rtl/stringconcat")),
    };
  const expected = gunzipSync(Buffer.from(fixture.captures[mode].gzipBase64, "base64")),
    data = new Int32Array(expected.length / 4);
  let cursor = 0;
  /** Records every native signed32 observation. @param values - Complete row. @returns Nothing. */
  function emit(...values: (number | boolean)[]): void {
    for (const value of values) data[cursor++] = Number(value);
  }
  /** Records every initialized name unit and terminator. @param s - Original string. @returns Nothing. */
  function text(s: rtl_uString): void {
    emit(s.refCount, s.length);
    for (let i = 0; i < s.length; i++) emit(s.buffer[i] as number);
    emit(s.buffer[s.length] as number);
  }
  /** Records acquired reference fields and owned name. @param r - Original reference. @returns Nothing. */
  function reference(r: R): void {
    emit(r.nRefCount, r.nStaticRefCount, r.eTypeClass, r.pType !== null);
    text(r.pTypeName);
  }
  /** Records original interface fields, identities and BaseList offsets. @param i - Live original interface. @returns Nothing. */
  function observe(i: I): void {
    const d = i.aBase;
    emit(
      d.nRefCount,
      d.nStaticRefCount,
      d.eTypeClass,
      d.pSelf === d,
      d.bComplete,
      d.nSize,
      d.nAlignment,
      d.pWeakRef === t.referenceViewOf(d),
      d.bOnDemand,
    );
    text(d.pTypeName);
    emit(
      i.nMembers,
      i.nAllMembers,
      i.nBaseTypes,
      i.ppBaseTypes === null,
      i.pBaseTypeDescription === null,
      i.ppMembers === null,
      i.ppAllMembers === null,
      i.pMapMemberIndexToFunctionIndex === null,
      i.nMapFunctionIndexToMemberIndex,
      i.pMapFunctionIndexToMemberIndex === null,
      i.aUik.m_Data1,
      i.aUik.m_Data2,
      i.aUik.m_Data3,
      i.aUik.m_Data4,
      i.aUik.m_Data5,
    );
    if (i.nBaseTypes) emit(i.pBaseTypeDescription === (i.ppBaseTypes as I[])[0]);
    for (const base of i.ppBaseTypes as I[]) {
      emit(base.aBase.nRefCount);
      text(base.aBase.pTypeName);
    }
    if (i.nMembers)
      emit(
        (i.ppMembers as R[]).every(
          /** Observes original corresponding in-bounds pointer identity. @param m - Own member. @param j - Original offset. @returns Shared pointer identity. */
          (m, j) => m === (i.ppAllMembers as R[])[i.nAllMembers - i.nMembers + j],
        ),
      );
    for (const member of i.ppAllMembers ?? []) reference(member);
    const list = new f.BaseList(i);
    emit(list.getBaseMembers(), list.getList().length);
    for (const e of list.getList()) {
      emit(e.memberOffset, e.directBaseIndex, e.directBaseMemberOffset);
      text(e.base.aBase.pTypeName);
    }
  }
  /** Constructs a real owned known-length original name. @param value - Literal units. @returns Original owner. */
  function name(value: string) {
    return new OUString(
      Uint16Array.from(
        value,
        /** Converts each literal UTF16 unit without normalization. @param c - Literal unit. @returns Original unit. */
        (c) => c.charCodeAt(0),
      ),
      value.length,
    );
  }
  /** Uses actual original lazy expressions and reference factory for caller input members. @param value - Borrowed interface name. @param count - Member count. @returns Acquired input references. */
  function members(value: InstanceType<typeof OUString>, count: number): R[] {
    const result: R[] = [];
    for (let j = 0; j < count; j++) {
      const n = new OUString(
          new StringConcat(
            new StringConcat(value, new Uint8Array([58, 58, 77, 0])),
            OUString.number(j),
          ),
        ),
        ref: [R | null] = [null];
      t.typelib_typedescriptionreference_new(
        ref,
        j % 2 ? C.INTERFACE_ATTRIBUTE : C.INTERFACE_METHOD,
        n.pData,
      );
      result.push(ref[0] as R);
      n.dispose();
    }
    return result;
  }
  /** Calls actual original interface factories. @param value - Borrowed name. @param bases - Borrowed base references. @param own - Borrowed own members. @param single - Select original single-base wrapper. @param old - Optional owned old output. @returns Original output, including null on failure. */
  function make(
    value: InstanceType<typeof OUString>,
    bases: R[],
    own: R[],
    single = false,
    old: I | null = null,
  ): I {
    const result: [I | null] = [old];
    if (single)
      f.typelib_typedescription_newInterface(
        result,
        value.pData,
        17,
        18,
        19,
        20,
        21,
        bases[0] ?? null,
        own.length,
        own.length ? own : null,
      );
    else
      f.typelib_typedescription_newMIInterface(
        result,
        value.pData,
        17,
        18,
        19,
        20,
        21,
        bases.length,
        bases.length ? bases : null,
        own.length,
        own.length ? own : null,
      );
    return result[0] as I;
  }
  /** Records each original acquired count. @param v - References. @returns Nothing. */
  function refs(v: R[]): void {
    for (const r of v) emit(r.nRefCount);
  }
  /** Releases actual caller-owned references. @param v - References. @returns Nothing. */
  function release(v: R[]): void {
    for (const r of v) t.typelib_typedescriptionreference_release(r);
  }
  /** Releases actual original interface ownership. @param i - Owned interface. @returns Nothing. */
  function destroy(i: I): void {
    t.typelib_typedescription_release(i.aBase);
  }
  /** Compares every byte of the complete stream and its digest. @returns Nothing. */
  function finish(): void {
    const actual = Buffer.from(data.buffer);
    expect(cursor).toBe(data.length);
    expect(createHash("sha256").update(actual).digest("hex")).toBe(fixture.captures[mode].digest);
    expect(actual.equals(expected)).toBe(true);
  }
  return { t, OUString, emit, text, observe, name, members, make, refs, release, destroy, finish };
}
it("matches original interface defaults, unused Uik arguments and old-output ownership" /** Replays a complete unchanged original native process mode. @returns Completed stream comparison. */, async () => {
  const c = await context("simple");
  for (const single of [false, true])
    for (const old of [false, true])
      for (const count of [0, 1, 3]) {
        const name = c.name("factory.Simple"),
          prior = c.name("factory.Prior"),
          own = c.members(name, count),
          previous = c.members(prior, 2);
        let i = old ? c.make(prior, [], previous) : null;
        c.emit(single, old, count, name.pData.refCount, prior.pData.refCount);
        c.refs(own);
        c.refs(previous);
        i = c.make(name, [], own, single, i);
        c.observe(i);
        c.emit(name.pData.refCount, prior.pData.refCount);
        c.refs(own);
        c.refs(previous);
        c.destroy(i);
        c.emit(name.pData.refCount, prior.pData.refCount);
        c.refs(own);
        c.refs(previous);
        c.release(own);
        c.release(previous);
        name.dispose();
        prior.dispose();
      }
  c.finish();
});
it("matches original diamond order, duplicate direct bases, derived names and shared array writes" /** Replays a complete unchanged original native process mode. @returns Completed stream comparison. */, async () => {
  const c = await context("diamond"),
    rn = c.name("factory.Root"),
    ln = c.name("factory.Left"),
    qn = c.name("factory.Right"),
    dn = c.name("factory.Derived"),
    rm = c.members(rn, 2),
    lm = c.members(ln, 1),
    qm = c.members(qn, 2),
    dm = c.members(dn, 3),
    r = c.make(rn, [], rm),
    l = c.make(ln, [r.aBase.pWeakRef as R], lm),
    q = c.make(qn, [r.aBase.pWeakRef as R], qm),
    paths = [
      [l.aBase.pWeakRef, q.aBase.pWeakRef],
      [q.aBase.pWeakRef, l.aBase.pWeakRef],
      [l.aBase.pWeakRef, l.aBase.pWeakRef],
      [q.aBase.pWeakRef, l.aBase.pWeakRef, q.aBase.pWeakRef],
      [r.aBase.pWeakRef, l.aBase.pWeakRef, q.aBase.pWeakRef],
    ];
  for (let path = 0; path < 5; path++)
    for (const count of [0, 1, 3]) {
      const own = dm.slice(0, count);
      c.emit(path, count);
      const d = c.make(dn, paths[path] as R[], own);
      c.observe(d);
      c.emit(r.aBase.nRefCount, l.aBase.nRefCount, q.aBase.nRefCount);
      c.refs(rm);
      c.refs(lm);
      c.refs(qm);
      c.refs(dm);
      if (count) {
        const offset = d.nAllMembers - d.nMembers,
          all = d.ppAllMembers as R[],
          ownView = d.ppMembers as R[],
          a = ownView[0],
          b = all[offset];
        ownView[0] = dm[2] as R;
        c.emit(all[offset] === dm[2]);
        all[offset] = b as R;
        c.emit(ownView[0] === a);
      }
      c.destroy(d);
      c.emit(r.aBase.nRefCount, l.aBase.nRefCount, q.aBase.nRefCount);
      c.refs(dm);
    }
  const s = c.make(dn, [l.aBase.pWeakRef as R], dm, true);
  c.observe(s);
  c.destroy(s);
  c.destroy(q);
  c.destroy(l);
  c.destroy(r);
  c.refs(rm);
  c.refs(lm);
  c.refs(qm);
  c.refs(dm);
  c.release(rm);
  c.release(lm);
  c.release(qm);
  c.release(dm);
  rn.dispose();
  ln.dispose();
  qn.dispose();
  dn.dispose();
  c.finish();
});
it("matches original completed empty-base allocation without inventing call tables" /** Replays a complete unchanged original native process mode. @returns Completed stream comparison. */, async () => {
  const c = await context("empty-base"),
    bn = c.name("factory.EmptyBase"),
    dn = c.name("factory.EmptyDerived"),
    b = c.make(bn, [], []);
  b.aBase.bComplete = true;
  const d = c.make(dn, [b.aBase.pWeakRef as R], []);
  c.observe(d);
  c.emit(b.aBase.nRefCount);
  c.destroy(d);
  c.emit(b.aBase.nRefCount);
  c.destroy(b);
  bn.dispose();
  dn.dispose();
  c.finish();
});
// Exhaustive native fixture replay retains every assertion under full-suite coverage instrumentation.
it(
  "matches original inherited member construction for every65536 UTF16 unit" /** Replays a complete unchanged original native process mode. @returns Completed stream comparison. */,
  async () => {
    const c = await context("unicode");
    for (let unit = 0; unit < 65536; unit++) {
      const bn = new c.OUString(new Uint16Array([70, 46, unit, 88]), 4),
        dn = c.name("factory.Unicode"),
        own = c.members(bn, 2),
        b = c.make(bn, [], own),
        d = c.make(dn, [b.aBase.pWeakRef as R], []);
      c.emit(unit);
      c.observe(d);
      c.emit(b.aBase.nRefCount, bn.pData.refCount, dn.pData.refCount);
      c.refs(own);
      c.destroy(d);
      c.destroy(b);
      c.emit(bn.pData.refCount, dn.pData.refCount);
      c.refs(own);
      c.release(own);
      bn.dispose();
      dn.dispose();
    }
    c.finish();
  },
  60000,
  300_000,
);
it("matches original missing or incomplete base early return and retained acquisitions" /** Replays a complete unchanged original native process mode. @returns Completed stream comparison. */, async () => {
  const c = await context("failure");
  for (const old of [false, true])
    for (const missing of [false, true]) {
      const bn = c.name("factory.Unavailable"),
        dn = c.name("factory.Failure"),
        pn = c.name("factory.Previous"),
        ref: [R | null] = [null];
      if (missing) c.t.typelib_typedescriptionreference_new(ref, C.INTERFACE_METHOD, bn.pData);
      else ref[0] = c.make(bn, [], []).aBase.pWeakRef;
      const b = ref[0] as R,
        own = c.members(pn, 1);
      let d = old ? c.make(pn, [], own) : null;
      c.emit(old, missing, b.nRefCount, bn.pData.refCount, dn.pData.refCount, pn.pData.refCount);
      c.refs(own);
      d = c.make(dn, [b], [], false, d);
      c.emit(d === null, b.nRefCount, bn.pData.refCount, dn.pData.refCount, pn.pData.refCount);
      c.refs(own);
      c.t.typelib_typedescriptionreference_release(b);
      c.emit(bn.pData.refCount, dn.pData.refCount, pn.pData.refCount);
      c.refs(own);
      c.release(own);
      bn.dispose();
      dn.dispose();
      pn.dispose();
    }
  c.finish();
});
it("matches original nested diamond, canonical registration transfer and completed call maps" /** Replays original nested inheritance and registered pointer-array ownership through completion. @returns Complete native stream comparison. */, async () => {
  const c = await context("nested"),
    rn = c.name("nested.Root"),
    ln = c.name("nested.Left"),
    qn = c.name("nested.Right"),
    dn = c.name("nested.Diamond"),
    en = c.name("nested.Deep"),
    rm = c.members(rn, 2),
    lm = c.members(ln, 1),
    qm = c.members(qn, 1),
    dm = c.members(dn, 1),
    em = c.members(en, 2),
    r = c.make(rn, [], rm),
    l = c.make(ln, [r.aBase.pWeakRef as R], lm),
    q = c.make(qn, [r.aBase.pWeakRef as R], qm),
    d = c.make(dn, [l.aBase.pWeakRef as R, q.aBase.pWeakRef as R], dm),
    placeholder: [R | null] = [null];
  c.t.typelib_typedescriptionreference_new(placeholder, C.INTERFACE, en.pData);
  const ref = placeholder[0] as R,
    target = ref.pType;
  let e = c.make(en, [d.aBase.pWeakRef as R], em);
  c.emit(e.aBase === target);
  c.observe(e);
  const slot: [import("../../inc/typelib/typedescription").typelib_TypeDescription | null] = [
    e.aBase,
  ];
  c.t.typelib_typedescription_register(slot);
  e = slot[0] as unknown as I;
  c.emit(e.aBase === target, e.aBase.pWeakRef === ref);
  c.observe(e);
  const own = e.ppMembers as R[],
    all = e.ppAllMembers as R[],
    offset = e.nAllMembers - e.nMembers,
    a = own[0],
    b = all[offset];
  own[0] = em[1] as R;
  c.emit(all[offset] === em[1]);
  all[offset] = b as R;
  c.emit(own[0] === a);
  const header = await import("../../inc/typelib/typedescription");
  c.emit(header.typelib_typedescription_complete(slot));
  e = slot[0] as unknown as I;
  c.observe(e);
  for (const index of e.pMapMemberIndexToFunctionIndex as Int32Array) c.emit(index);
  for (const index of e.pMapFunctionIndexToMemberIndex as Int32Array) c.emit(index);
  c.destroy(e);
  c.emit(ref.nRefCount);
  c.t.typelib_typedescriptionreference_release(ref);
  c.emit(d.aBase.nRefCount);
  c.destroy(d);
  c.destroy(q);
  c.destroy(l);
  c.destroy(r);
  c.refs(rm);
  c.refs(lm);
  c.refs(qm);
  c.refs(dm);
  c.refs(em);
  c.release(rm);
  c.release(lm);
  c.release(qm);
  c.release(dm);
  c.release(em);
  rn.dispose();
  ln.dispose();
  qn.dispose();
  dn.dispose();
  en.dispose();
  c.finish();
});
