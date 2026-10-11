/** @fileoverview Complete unchanged native completion observations replayed through the actual portable registry, allocator and ownership owners. */
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { expect, it, vi } from "vitest";
import fixture from "./native-complete-cases.json";
import { typelib_TypeClass as C } from "../../inc/typelib/typeclass";
import type {
  typelib_TypeDescription as D,
  typelib_TypeDescriptionReference as R,
  typelib_InterfaceTypeDescription as I,
  typelib_InterfaceAttributeTypeDescription as A,
  typelib_IndirectTypeDescription as Q,
  typelib_typedescription_Callback,
} from "../../inc/typelib/typedescription";

/** Requires a source-initialized observation field. @param value - Original field. @returns Required field. */
function required<T>(value: T | null | undefined): T {
  if (value == null) throw new Error("Missing original initialized observation");
  return value;
}
/** Retains native allocation identity across original specific-prefix views. @param value - Original allocation. @returns Specific view. */
function cast<T>(value: D): T {
  return value as unknown as T;
}
/** Loads independent process-mode state and complete original stream comparison. @param mode - Original mode. @returns Actual shared owners and observation functions. */
async function context(mode: keyof typeof fixture.captures) {
  vi.resetModules();
  const type = await import("./typelib"),
    completion = await import("./typelib-complete");
  const strings = await import("../../../sal/inc/rtl/ustring");
  const header = await import("../../inc/typelib/typedescription");
  const expected = gunzipSync(Buffer.from(fixture.captures[mode].gzipBase64, "base64"));
  const data = new Int32Array(expected.length / 4);
  let cursor = 0;
  /** Records every original signed32 observation. @param values - Complete row. @returns Nothing. */
  function emit(...values: (number | boolean)[]): void {
    for (const value of values) data[cursor++] = Number(value);
  }
  /** Compares the complete native stream and digest. @returns Nothing. */
  function finish(): void {
    const actual = Buffer.from(data.buffer);
    expect(cursor).toBe(data.length);
    expect(createHash("sha256").update(actual).digest("hex")).toBe(fixture.captures[mode].digest);
    expect(actual.equals(expected)).toBe(true);
  }
  /** Observes every initialized common field selected by the original caller. @param desc - Live original record. @returns Nothing. */
  function observe(desc: D): void {
    emit(
      desc.nRefCount,
      desc.nStaticRefCount,
      desc.eTypeClass,
      desc.pTypeName.refCount,
      desc.pSelf === desc,
      desc.bComplete,
      desc.nSize,
      desc.nAlignment,
      desc.pWeakRef === null,
      desc.bOnDemand,
    );
  }
  const literals = new Map<string, InstanceType<typeof strings.OUStringLiteral>>();
  /** Constructs the original static UTF16 literal record. @param text - Caller literal. @returns Original static name. */
  function literal(text: string) {
    let value = literals.get(text);
    if (value === undefined) {
      value = new strings.OUStringLiteral(
        Uint16Array.from(
          [...text]
            .map(
              /** Converts fixed ASCII caller literal units. @param unit - ASCII character. @returns UTF16 unit. */
              (unit) => unit.charCodeAt(0),
            )
            .concat(0),
        ),
      );
      literals.set(text, value);
    }
    return value.str;
  }
  /** Uses only the actual original allocator for synthetic initialized caller inputs. @param kind - Original class. @param name - Borrowed name. @returns Actual allocation. */
  function empty(kind: C, name: ReturnType<typeof literal>): D {
    const out: [D | null] = [null];
    type.typelib_typedescription_newEmpty(out, kind, name);
    return required(out[0]);
  }
  return { type, completion, header, strings, emit, finish, observe, literal, empty };
}

it("matches original two-stage completion and every interface call-table composition" /** Replays every original table composition and acquired count. @returns Complete observation comparison. */, async () => {
  const { type, completion, header, emit, finish, observe, literal, empty } =
    await context("tables");
  const names = [
    "complete.Method",
    "complete.ReadOnly",
    "complete.ReadWrite",
    "complete.Missing",
  ].map(literal);
  const anchor = empty(C.INTERFACE, literal("complete.Anchor"));
  const refs: R[] = [],
    attrs: D[] = [];
  for (let i = 0; i < 4; i++) {
    const r: [R | null] = [null];
    type.typelib_typedescriptionreference_new(
      r,
      i === 0 ? C.INTERFACE_METHOD : C.INTERFACE_ATTRIBUTE,
      required(names[i]),
    );
    refs.push(required(r[0]));
  }
  for (let i = 0; i < 2; i++) {
    const d = empty(C.INTERFACE_ATTRIBUTE, required(names[i + 1]));
    const a = cast<A>(d);
    a.bReadOnly = i === 0;
    a.pInterface = cast<I>(anchor);
    type.typelib_typedescription_acquire(anchor);
    const slot: [D | null] = [d];
    type.typelib_typedescription_register(slot);
    attrs.push(required(slot[0]));
  }
  for (let n = 0; n <= 4; n++)
    for (let code = 0; code < 4 ** n; code++) {
      const d = empty(C.INTERFACE, literal("complete.Tables")),
        t = cast<I>(d);
      d.bComplete = false;
      t.nAllMembers = n;
      t.ppAllMembers = new Array<R>(n);
      let v = code;
      for (let i = 0; i < n; i++) {
        t.ppAllMembers[i] = required(refs[v % 4]);
        type.typelib_typedescriptionreference_acquire(required(t.ppAllMembers[i]));
        v = Math.trunc(v / 4);
      }
      const slot: [D | null] = [d];
      emit(
        n,
        code,
        completion.complete(slot, false),
        d.bComplete,
        t.pMapMemberIndexToFunctionIndex === null,
        t.pMapFunctionIndexToMemberIndex === null,
      );
      emit(header.typelib_typedescription_complete(slot));
      observe(d);
      emit(t.nMapFunctionIndexToMemberIndex);
      for (const value of required(t.pMapMemberIndexToFunctionIndex)) emit(value);
      for (const value of required(t.pMapFunctionIndexToMemberIndex)) emit(value);
      const m = t.pMapMemberIndexToFunctionIndex,
        f = t.pMapFunctionIndexToMemberIndex;
      completion.typelib_typedescription_initTables(d);
      emit(m === t.pMapMemberIndexToFunctionIndex, f === t.pMapFunctionIndexToMemberIndex);
      emit(required(attrs[0]).nRefCount, required(attrs[1]).nRefCount, anchor.nRefCount);
      for (const r of refs) emit(r.nRefCount);
      type.typelib_typedescription_release(d);
      for (const r of refs) emit(r.nRefCount);
    }
  for (const a of attrs) type.typelib_typedescription_release(a);
  for (const r of refs) type.typelib_typedescriptionreference_release(r);
  observe(anchor);
  type.typelib_typedescription_release(anchor);
  finish();
});

it("matches original completion providers, typedef outcomes, identity and full cache eviction" /** Replays original callback, identity and cache outcomes. @returns Complete observation comparison. */, async () => {
  const { type, completion, header, strings, emit, finish, observe, literal, empty } =
    await context("provider");
  const p = { kind: 0, calls: 0 };
  /** Original provider caller initializes only source-defined factory fields. @param context - Caller context. @param out - Original result slot. @param name - Requested name. @returns Nothing. */
  const callback: typelib_typedescription_Callback =
    /** Initializes the actual original provider result. @param context - Provider state. @param out - Result slot. @param name - Original name. @returns Nothing. */
    (context, out, name) => {
      const state = context as typeof p;
      state.calls++;
      if (
        state.kind === 0 ||
        strings.OUString.unacquired([name]).equals(
          strings.OUString.unacquired([literal("complete.AbsentTarget")]),
        )
      )
        return;
      if (state.kind === 1) type.typelib_typedescription_newEnum(out, name, 17, 0, null, null);
      else if (state.kind === 2) {
        out[0] = empty(C.INTERFACE, name);
        out[0].bComplete = false;
        const iface = cast<I>(out[0]);
        iface.aUik = { m_Data1: 0, m_Data2: 0, m_Data3: 0, m_Data4: 0, m_Data5: 0 };
        iface.ppAllMembers = [];
      } else {
        const target = state.kind === 3 ? name : literal("complete.AbsentTarget"),
          r: [R | null] = [null];
        type.typelib_typedescriptionreference_new(r, C.ENUM, target);
        out[0] = empty(C.SEQUENCE, name);
        out[0].eTypeClass = C.TYPEDEF;
        cast<Q>(out[0]).pType = required(r[0]);
      }
    };
  type.typelib_typedescription_registerCallback(p, callback);
  for (let k = 0; k < 260; k++) {
    const units = Uint16Array.from(
      [...`complete.Enum${k}`].map(
        /** Converts actual dynamic caller name. @param unit - ASCII character. @returns UTF16 unit. */
        (unit) => unit.charCodeAt(0),
      ),
    );
    const name = new strings.OUString(units, units.length);
    const r: [R | null] = [null];
    type.typelib_typedescriptionreference_new(r, C.ENUM, name.pData);
    const ref = required(r[0]),
      slot: [D | null] = [required(ref.pType)];
    type.typelib_typedescription_acquire(required(slot[0]));
    observe(required(slot[0]));
    let calls = p.calls;
    emit(header.typelib_typedescription_complete(slot), p.calls - calls);
    observe(required(slot[0]));
    p.kind = 1;
    calls = p.calls;
    const old = slot[0];
    const result = header.typelib_typedescription_complete(slot);
    emit(result, p.calls - calls, slot[0] === old);
    observe(required(slot[0]));
    emit(type.Init().maCache.length);
    calls = p.calls;
    emit(completion.complete(slot, false), p.calls - calls);
    type.typelib_typedescription_release(required(slot[0]));
    emit(ref.nRefCount);
    type.typelib_typedescriptionreference_release(ref);
    p.kind = 0;
    name.dispose();
  }
  for (const init of [false, true]) {
    p.kind = 2;
    const r: [R | null] = [null];
    type.typelib_typedescriptionreference_new(
      r,
      C.INTERFACE,
      literal(init ? "complete.InterfaceTrue" : "complete.InterfaceFalse"),
    );
    const ref = required(r[0]),
      slot: [D | null] = [required(ref.pType)];
    type.typelib_typedescription_acquire(required(slot[0]));
    const old = slot[0],
      calls = p.calls;
    const result = completion.complete(slot, init);
    emit(result, p.calls - calls, slot[0] === old);
    observe(required(slot[0]));
    const iface = cast<I>(required(slot[0]));
    emit(
      iface.ppAllMembers !== null,
      iface.pMapMemberIndexToFunctionIndex !== null,
      iface.pMapFunctionIndexToMemberIndex !== null,
      iface.nMapFunctionIndexToMemberIndex,
    );
    type.typelib_typedescription_release(required(slot[0]));
    type.typelib_typedescriptionreference_release(ref);
  }
  for (const kind of [3, 4]) {
    p.kind = 1;
    const name = literal(kind === 3 ? "complete.Alias" : "complete.AliasMissing"),
      target: [D | null] = [null];
    if (kind === 3) {
      type.typelib_typedescription_newEnum(target, name, 9, 0, null, null);
      type.typelib_typedescription_register(target);
    }
    const d = empty(C.ENUM, name);
    d.bComplete = false;
    const slot: [D | null] = [d];
    p.kind = kind;
    const calls = p.calls,
      result = completion.complete(slot, true);
    emit(result, p.calls - calls, slot[0] === d);
    observe(required(slot[0]));
    type.typelib_typedescription_release(required(slot[0]));
    if (target[0] !== null) type.typelib_typedescription_release(target[0]);
  }
  type.typelib_typedescription_revokeCallback(p, callback);
  finish();
});
