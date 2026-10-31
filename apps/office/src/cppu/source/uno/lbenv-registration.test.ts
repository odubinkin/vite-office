/** @fileoverview Original default-environment interface registration contracts over actual ObjectEntry, OUString and typelib owners. Enclosing C records/callbacks are prepared caller inputs; no production environment constructor, invocation stack or identifier provider is substituted. */
import { expect, it } from "vitest";
import {
  defenv_registerInterface,
  defenv_registerProxyInterface,
  s_stub_defenv_revokeInterface,
  defenv_getObjectIdentifier,
  defenv_getRegisteredInterface,
  defenv_getRegisteredInterfaces,
  type DefaultEnvironmentRegistration,
  type ObjectEntry,
} from "./lbenv";
import type { uno_Environment, uno_freeProxyFunc } from "../../inc/uno/environment";
import {
  typelib_typedescription_newMIInterface,
  typelib_typedescription_register,
  typelib_typedescription_release,
  typelib_typedescriptionreference_getDescription,
  typelib_static_type_getByTypeClass,
  type typelib_TypeDescription as D,
  type typelib_TypeDescriptionReference as R,
  type typelib_InterfaceTypeDescription as I,
} from "../../inc/typelib/typedescription";
import { typelib_TypeClass as C } from "../../inc/typelib/typeclass";
import { OUString } from "../../../sal/inc/rtl/ustring";
import {
  rtl_uString_assign,
  rtl_uString_release,
  type rtl_uStringSlot,
} from "../../../sal/inc/rtl/ustring.h";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
/** Prepared caller interface pointer; counters observe only callbacks invoked by the original registration owner. */
interface Pointer {
  label: string;
  count: number;
  frees: number;
}
/** Actual typelib factories supply every queried descriptor; no hand-written interface type provider is used. */
class Types {
  readonly owned: I[] = [];
  readonly root: I;
  readonly a: I;
  readonly b: I;
  readonly child: I;
  readonly equalA: I;
  readonly c: I;
  /** Builds original root/base/derived/equal-name/unrelated descriptors through the real C factories. @returns Owned descriptors. */
  constructor() {
    const root: [D | null] = [null];
    typelib_typedescriptionreference_getDescription(
      root,
      typelib_static_type_getByTypeClass(C.INTERFACE)[0] as R,
    );
    this.root = (root[0] as D).pSelf as unknown as I;
    this.owned.push(this.root);
    this.a = this.make("registration.unit.A", [this.root]);
    this.b = this.make("registration.unit.B", [this.root]);
    this.child = this.make("registration.unit.Child", [this.a]);
    this.equalA = this.make("registration.unit.A", [this.root], false);
    this.c = this.make("registration.unit.C", [this.root]);
  }
  /** Original actual descriptor creation and optional registration. @param label - Exact type name. @param bases - Actual direct bases. @param register - Original registration choice. @returns Owned descriptor. */
  private make(label: string, bases: I[], register = true): I {
    const name = unicode(label),
      out: [I | null] = [null];
    try {
      typelib_typedescription_newMIInterface(
        out,
        name.pData,
        0,
        0,
        0,
        0,
        0,
        bases.length,
        bases.map(
          /** Borrows an actual direct base reference. @param base - Original description. @returns Borrowed reference. */ (
            base,
          ) => base.aBase.pWeakRef as R,
        ),
        0,
        null,
      );
      if (register) typelib_typedescription_register(out as unknown as [D | null]);
      const result = out[0] as I;
      this.owned.push(result);
      return result;
    } finally {
      name.dispose();
    }
  }
  /** Releases only the caller's actual descriptor references. @returns Nothing. */
  dispose(): void {
    for (const type of this.owned) typelib_typedescription_release(type.aBase);
  }
}
/** Prepared complete C record and original-map projection. Unconsumed environment/stack slots remain null; no constructor or missing callback is manufactured by production code. */
class Caller {
  readonly name = unicode("uno");
  readonly oid = unicode("object\0Ω");
  readonly env: DefaultEnvironmentRegistration;
  readonly events: Array<[string, string, number, number, unknown]> = [];
  readonly pointers: Pointer[] = [];
  activeOut: [unknown] | null = null;
  computations = 0;
  readonly free: uno_freeProxyFunc;
  /** Installs explicitly prepared acquisition/release/free/computation boundaries around the real registration functions. @returns Caller input. */
  constructor() {
    const base: uno_Environment = {
      pReserved: null,
      pTypeName: this.name.pData,
      pContext: null,
      pExtEnv: null,
      acquire: null,
      release: null,
      acquireWeak: null,
      releaseWeak: null,
      harden: null,
      dispose: null,
      environmentDisposing: null,
    };
    const env: DefaultEnvironmentRegistration = {
      aBase: base,
      aPtr2ObjectMap: new Map(),
      aOId2ObjectMap: new Map(),
      registerInterface: defenv_registerInterface,
      registerProxyInterface: defenv_registerProxyInterface,
      revokeInterface: null,
      getObjectIdentifier: defenv_getObjectIdentifier,
      getRegisteredInterface: defenv_getRegisteredInterface,
      getRegisteredInterfaces: defenv_getRegisteredInterfaces,
      acquireInterface:
        /** Observes source acquisition and current pre-publication maps/output. @param record - Actual passed record. @param pointer - Caller pointer. @returns Nothing. */ (
          record,
          pointer,
        ) => {
          expect(record).toBe(env);
          const p = pointer as Pointer;
          p.count++;
          this.event("acquire", p);
        },
      releaseInterface:
        /** Observes source release without replacing its order or callback. @param record - Actual passed record. @param pointer - Caller pointer. @returns Nothing. */ (
          record,
          pointer,
        ) => {
          expect(record).toBe(env);
          const p = pointer as Pointer;
          p.count--;
          this.event("release", p);
        },
      computeObjectIdentifier:
        /** Prepared enclosing computation proves invocation only for absent pointer registrations. @param record - Actual passed record. @param output - Original field. @param pointer - Caller pointer. @returns Nothing. */ (
          record,
          output,
          pointer,
        ) => {
          expect(record).toBe(env);
          expect(output[0]).toBeNull();
          expect(this.pointers).toContain(pointer);
          this.computations++;
          const value = unicode("caller-computed\0id");
          try {
            rtl_uString_assign(output, value.pData);
          } finally {
            value.dispose();
          }
        },
    };
    base.pExtEnv = env;
    this.env = env;
    this.free =
      /** Observes original proxy destruction with the real maps already updated. @param record - Actual passed record. @param pointer - Caller proxy. @returns Nothing. */ (
        record,
        pointer,
      ) => {
        expect(record).toBe(env);
        const p = pointer as Pointer;
        p.frees++;
        this.event("free", p);
      };
  }
  /** Records callback-visible map counts and the original inout slot before publication. @param kind - Actual callback. @param pointer - Caller pointer. @returns Nothing. */
  private event(kind: string, pointer: Pointer): void {
    this.events.push([
      kind,
      pointer.label,
      this.env.aOId2ObjectMap.size,
      this.env.aPtr2ObjectMap.size,
      this.activeOut?.[0] ?? null,
    ]);
  }
  /** Allocates an explicitly caller-owned pointer value. @param label - Observation label. @returns Actual caller input. */
  pointer(label: string): Pointer {
    const value = { label, count: 100, frees: 0 };
    this.pointers.push(value);
    return value;
  }
  /** Invokes the actual source original-registration callback. @param pointer - Caller input. @param type - Actual descriptor. @returns Original normalized pointer. */
  original(pointer: Pointer, type: I): unknown {
    const out: [unknown] = [pointer];
    this.activeOut = out;
    try {
      defenv_registerInterface(this.env, out, this.oid.pData, type);
      return out[0];
    } finally {
      this.activeOut = null;
    }
  }
  /** Invokes the actual source proxy-registration callback. @param pointer - Caller proxy. @param type - Actual descriptor. @returns Original normalized pointer. */
  proxy(pointer: Pointer, type: I): unknown {
    const out: [unknown] = [pointer];
    this.activeOut = out;
    try {
      defenv_registerProxyInterface(this.env, out, this.free, this.oid.pData, type);
      return out[0];
    } finally {
      this.activeOut = null;
    }
  }
  /** Runs only the real original callee, not a replacement for Environment_invoke. @param pointer - Valid registered pointer. @returns Nothing. */
  revoke(pointer: Pointer): void {
    s_stub_defenv_revokeInterface([this.env, pointer][Symbol.iterator]());
  }
  /** Borrows an actual map entry for field/lifetime assertions. @param pointer - Registered pointer. @returns Actual source object entry. */
  object(pointer: Pointer): ObjectEntry {
    return this.env.aPtr2ObjectMap.get(pointer) as ObjectEntry;
  }
  /** Releases caller strings after all source registrations have been revoked. @returns Nothing. */
  dispose(): void {
    expect(this.env.aOId2ObjectMap.size).toBe(0);
    expect(this.env.aPtr2ObjectMap.size).toBe(0);
    this.oid.dispose();
    this.name.dispose();
  }
}
it("allocates and publishes complete-vector output even when there are zero registered pointers", /** Unlike registry environment enumeration, this source always invokes the supplied allocator. @returns Nothing. */ () => {
  const caller = new Caller(),
    old: unknown[] = [{}],
    out: [unknown[] | null] = [old],
    length: [number] = [-9],
    memory: unknown[] = [];
  let allocations = 0;
  try {
    defenv_getRegisteredInterfaces(
      caller.env,
      out,
      length,
      /** Exact source output remains unpublished inside allocation. @param bytes - Native pointer bytes. @returns Caller memory. */ (
        bytes,
      ) => {
        allocations++;
        expect(bytes).toBe(0);
        expect(length[0]).toBe(-9);
        expect(out[0]).toBe(old);
        return memory;
      },
    );
    expect(allocations).toBe(1);
    expect(out[0]).toBe(memory);
    expect(length[0]).toBe(0);
  } finally {
    caller.dispose();
  }
});
it("registers original values, normalizes a derived/base candidate and preserves acquire-release-publish order", /** Real entries/counts and actual type references distinguish registration from an alias-only cache. @returns Nothing. */ () => {
  const types = new Types(),
    caller = new Caller(),
    a = caller.pointer("original"),
    b = caller.pointer("candidate");
  try {
    expect(caller.original(a, types.child)).toBe(a);
    const object = caller.object(a);
    expect([
      object.nRef,
      object.aInterfaces.length,
      object.aInterfaces[0]?.refCount,
      a.count,
    ]).toEqual([1, 1, 1, 101]);
    expect(caller.events[0]).toEqual(["acquire", "original", 1, 0, a]);
    caller.original(a, types.child);
    expect(object.nRef).toBe(2);
    caller.events.length = 0;
    expect(caller.original(b, types.equalA)).toBe(a);
    expect([object.nRef, object.aInterfaces.length, object.aInterfaces[0]?.refCount]).toEqual([
      3, 1, 3,
    ]);
    expect(caller.events).toEqual([
      ["acquire", "original", 1, 1, b],
      ["release", "candidate", 1, 1, b],
    ]);
    caller.revoke(a);
    caller.revoke(a);
    expect(object.aInterfaces[0]?.refCount).toBe(3);
    caller.revoke(a);
    expect(caller.events.at(-1)).toEqual(["release", "original", 0, 0, null]);
  } finally {
    caller.dispose();
    types.dispose();
  }
});
it("exchanges a different proxy without adding a source-absent registration or interface count", /** Proxy candidate destruction happens after target acquisition and before publishing the replacement. @returns Nothing. */ () => {
  const types = new Types(),
    caller = new Caller(),
    a = caller.pointer("retained"),
    b = caller.pointer("candidate");
  try {
    caller.proxy(a, types.a);
    const object = caller.object(a);
    caller.events.length = 0;
    expect(caller.proxy(b, types.equalA)).toBe(a);
    expect([object.nRef, object.aInterfaces[0]?.refCount]).toEqual([1, 1]);
    expect(caller.events).toEqual([
      ["acquire", "retained", 1, 1, b],
      ["free", "candidate", 1, 1, b],
    ]);
    caller.revoke(a);
    expect(a.frees).toBe(1);
  } finally {
    caller.dispose();
    types.dispose();
  }
});
it("retains a mixed proxy pointer until its last separate interface entry is removed", /** Every original per-object/per-interface count and map cleanup precedes the matching destruction callback. @returns Nothing. */ () => {
  const types = new Types(),
    caller = new Caller(),
    original = caller.pointer("original"),
    proxy = caller.pointer("proxy");
  try {
    caller.original(original, types.a);
    caller.proxy(proxy, types.b);
    caller.proxy(proxy, types.b);
    caller.proxy(proxy, types.c);
    const object = caller.object(original);
    expect([object.nRef, object.mixedObject, object.aInterfaces.length]).toEqual([4, true, 3]);
    caller.revoke(proxy);
    expect([object.nRef, object.aInterfaces[1]?.refCount, proxy.frees]).toEqual([3, 1, 0]);
    caller.revoke(proxy);
    expect(caller.env.aPtr2ObjectMap.has(proxy)).toBe(true);
    expect([object.nRef, object.aInterfaces.length, proxy.frees]).toEqual([2, 2, 1]);
    caller.revoke(proxy);
    expect(caller.env.aPtr2ObjectMap.has(proxy)).toBe(false);
    expect([object.nRef, object.mixedObject, object.aInterfaces.length, proxy.frees]).toEqual([
      1,
      true,
      1,
      2,
    ]);
    expect(
      caller.events
        .filter(
          /** Selects actual proxy destruction callbacks. @param event - Observed callback. @returns Proxy destruction. */ (
            event,
          ) => event[0] === "free",
        )
        .map(
          /** Selects callback-visible map counts. @param event - Actual callback. @returns Source map sizes. */ (
            event,
          ) => event.slice(2, 4),
        ),
    ).toEqual([
      [1, 2],
      [1, 1],
    ]);
    caller.revoke(original);
  } finally {
    caller.dispose();
    types.dispose();
  }
});
it("cleans pure proxy registrations only at final object revocation and frees entries in reverse order", /** Non-mixed revocation preserves individual entries until the source global count reaches zero. @returns Nothing. */ () => {
  const types = new Types(),
    caller = new Caller(),
    a = caller.pointer("first"),
    b = caller.pointer("second");
  try {
    caller.proxy(a, types.a);
    caller.proxy(b, types.b);
    const object = caller.object(a);
    caller.events.length = 0;
    caller.revoke(a);
    expect([object.nRef, object.aInterfaces.length, a.frees, b.frees]).toEqual([1, 2, 0, 0]);
    caller.revoke(b);
    expect(caller.events).toEqual([
      ["free", "second", 0, 0, null],
      ["free", "first", 0, 0, null],
    ]);
  } finally {
    caller.dispose();
    types.dispose();
  }
});
it("releases old query output, then resolves original derived/base and equal-name descriptions", /** The real ObjectEntry lookup retains source type equality; no duck-typed interface test is introduced. @returns Nothing. */ () => {
  const types = new Types(),
    caller = new Caller(),
    a = caller.pointer("registered"),
    old = caller.pointer("old"),
    out: [unknown] = [old],
    missing = unicode("missing");
  try {
    caller.original(a, types.child);
    caller.events.length = 0;
    caller.activeOut = out;
    defenv_getRegisteredInterface(caller.env, out, caller.oid.pData, types.equalA);
    expect(out[0]).toBe(a);
    expect(caller.events).toEqual([
      ["release", "old", 1, 1, old],
      ["acquire", "registered", 1, 1, null],
    ]);
    defenv_getRegisteredInterface(caller.env, out, caller.oid.pData, types.b);
    expect(out[0]).toBeNull();
    defenv_getRegisteredInterface(caller.env, out, missing.pData, types.a);
    expect(out[0]).toBeNull();
    caller.activeOut = null;
    caller.revoke(a);
  } finally {
    missing.dispose();
    caller.dispose();
    types.dispose();
  }
});
it("returns the original registered identifier owner and calls enclosing computation only for an absent pointer", /** Embedded NUL/Unicode units, output release/null and ownership are source data, not inferred identifiers. @returns Nothing. */ () => {
  const types = new Types(),
    caller = new Caller(),
    a = caller.pointer("registered"),
    b = caller.pointer("unknown"),
    old = unicode("old"),
    out: rtl_uStringSlot = [null];
  try {
    caller.original(a, types.a);
    rtl_uString_assign(out, old.pData);
    defenv_getObjectIdentifier(caller.env, out, a);
    expect(out[0]).toBe(caller.object(a).oid.pData);
    expect(text(OUString.unacquired(out))).toBe("object\0Ω");
    expect(old.pData.refCount).toBe(1);
    expect(caller.computations).toBe(0);
    defenv_getObjectIdentifier(caller.env, out, b);
    expect(text(OUString.unacquired(out))).toBe("caller-computed\0id");
    expect(caller.computations).toBe(1);
    caller.revoke(a);
  } finally {
    if (out[0]) rtl_uString_release(out[0]);
    old.dispose();
    caller.dispose();
    types.dispose();
  }
});
it("enumerates each distinct pointer once and acquires it before publishing outputs", /** Source unordered-map order is deliberately unspecified; ownership and complete membership are asserted. @returns Nothing. */ () => {
  const types = new Types(),
    caller = new Caller(),
    a = caller.pointer("first"),
    b = caller.pointer("second"),
    other = unicode("other"),
    out: [unknown[] | null] = [null],
    length: [number] = [-7];
  try {
    caller.original(a, types.a);
    const bslot: [unknown] = [b];
    defenv_registerInterface(caller.env, bslot, other.pData, types.b);
    const allocated: unknown[] = [];
    defenv_getRegisteredInterfaces(
      caller.env,
      out,
      length,
      /** Actual caller memory has exactly the requested native pointer-array extent. @param bytes - Native request. @returns Caller array. */ (
        bytes,
      ) => {
        expect(bytes).toBe(16);
        expect(out[0]).toBeNull();
        expect(length[0]).toBe(-7);
        return allocated;
      },
    );
    expect(out[0]).toBe(allocated);
    expect(length[0]).toBe(2);
    expect(new Set(out[0])).toEqual(new Set([a, b]));
    expect([a.count, b.count]).toEqual([102, 102]);
    caller.revoke(a);
    caller.revoke(b);
  } finally {
    other.dispose();
    caller.dispose();
    types.dispose();
  }
});
