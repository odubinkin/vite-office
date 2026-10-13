/** @fileoverview Replays whole original ObjectEntry constructor, append, lookup and initialized compiler value-lifetime streams through actual shared owners. */
import { it } from "vitest";
import type {
  typelib_TypeDescription as D,
  typelib_TypeDescriptionReference as R,
  typelib_InterfaceTypeDescription as I,
} from "../../inc/typelib/typedescription";
import type { ObjectEntry as Entry, InterfaceEntry, ObjectEntryEnvironment } from "./lbenv";
import type { uno_ExtEnvironment } from "../../inc/uno/environment";
import { typelib_TypeClass as C } from "../../inc/typelib/typeclass";
import fixture from "./native-object-entry-cases.json";
import { createUnoNativeContext } from "../../../test/uno-native-values";

for (const mode of ["construct", "append", "find", "values"] as const) {
  it(`matches complete original ObjectEntry ${mode} stream`, /** Replays all initialized original observations with borrowed caller input records; no environment engine/provider. @returns Whole parity. */ async () => {
    const x = await createUnoNativeContext(fixture.captures[mode]),
      { ObjectEntry } = await import("./lbenv"),
      types: I[] = [],
      pointers: { label: number; count: number }[] = [],
      objects: Entry[] = [];
    /** Original caller-owned proxy cleanup function, never invoked by this owner. @returns Nothing. */
    function freeProxy(): void {}
    /** Pure caller pointer label, preserving null and unknown identities. @param p - Original pointer. @returns Stable caller label. */
    function ptrid(p: unknown): number {
      return p === null
        ? -1
        : pointers.includes(p as (typeof pointers)[number])
          ? pointers.indexOf(p as (typeof pointers)[number])
          : -2;
    }
    /** Pure caller object label. @param p - Original entry. @returns Stable label. */
    function objid(p: Entry | undefined): number {
      return p === undefined ? -1 : objects.includes(p) ? objects.indexOf(p) : -2;
    }
    /** Creates an actual interface via original C factory and optional registration. @param name - Input ASCII name. @param bases - Actual bases. @param reg - Original registration. @returns Actual description. */
    function make(name: string, bases: I[], reg = true): I {
      const n = x.name(name),
        out: [I | null] = [null];
      x.f.typelib_typedescription_newMIInterface(
        out,
        n.pData,
        0,
        0,
        0,
        0,
        0,
        bases.length,
        bases.length
          ? bases.map(
              /** Borrows original weak reference. @param b - Base. @returns Reference. */ (b) =>
                b.aBase.pWeakRef as R,
            )
          : null,
        0,
        null,
      );
      if (reg) x.f.typelib_typedescription_register(out as unknown as [D | null]);
      const d = out[0] as I;
      types.push(d);
      n.dispose();
      return d;
    }
    /** Creates all original registered and distinct equal-name descriptions. @returns Nothing. */
    function setup(): void {
      const out: [D | null] = [null];
      x.f.typelib_typedescriptionreference_getDescription(
        out,
        x.f.typelib_static_type_getByTypeClass(C.INTERFACE)[0] as R,
      );
      const root = (out[0] as D).pSelf as unknown as I;
      types.push(root);
      const a = make("entry.A", [root]),
        b = make("entry.B", [root]),
        mi = make("entry.Multi", [a, b]);
      make("entry.Child", [mi]);
      make("entry.A", [root], false);
      make("entry.C", [root]);
      make("entry.Long", [root]);
    }
    /** Observes every original initialized entry field and acquired type. @param e - Live original entry. @returns Nothing. */
    function snapshot(e: Entry): void {
      x.emit(70, e.nRef, e.mixedObject, e.aInterfaces.length);
      x.text(e.oid.pData);
      for (const i of e.aInterfaces) {
        x.emit(
          i.refCount,
          ptrid(i.pInterface),
          i.fpFreeProxy === freeProxy,
          types.indexOf(i.pTypeDescr),
        );
        x.desc(i.pTypeDescr.aBase);
      }
    }
    /** Creates a fully declared borrowed ext-record; unused slots stay null and no implementation is synthesized. @param label - Actual caller name owner. @returns Borrowed input with original pointer map. */
    function environment(label: InstanceType<typeof x.OUString>): ObjectEntryEnvironment {
      const env: ObjectEntryEnvironment = {
        aBase: {
          pReserved: null,
          pTypeName: label.pData,
          pContext: null,
          pExtEnv: null,
          acquire: null,
          release: null,
          acquireWeak: null,
          releaseWeak: null,
          harden: null,
          dispose: null,
          environmentDisposing: null,
        },
        registerInterface: null,
        registerProxyInterface: null,
        revokeInterface: null,
        getObjectIdentifier: null,
        getRegisteredInterface: null,
        getRegisteredInterfaces: null,
        computeObjectIdentifier: null,
        acquireInterface: acquire,
        releaseInterface: release,
        aPtr2ObjectMap: new Map(),
      };
      env.aBase.pExtEnv = env;
      return env;
      /** Observes caller-owned late acquisition before type/map/vector changes. @param e - Borrowed ext-record. @param p - Caller pointer. @returns Nothing. */
      function acquire(e: uno_ExtEnvironment, p: unknown): void {
        const caller = p as (typeof pointers)[number];
        x.emit(
          30,
          caller.label,
          ++caller.count,
          e === env,
          env.aPtr2ObjectMap.size,
          env.aPtr2ObjectMap.has(p),
        );
      }
    }
    /** Original caller release callback. @param unused - Borrowed ext-record. @param p - Caller pointer. @returns Nothing. */
    function release(_unused: uno_ExtEnvironment, p: unknown): void {
      const caller = p as (typeof pointers)[number];
      x.emit(31, caller.label, --caller.count);
    }
    /** Performs surrounding caller-owned release; ObjectEntry destructor releases no interface/type pointer. @param env - Input map. @param e - Original appended entry. @returns Nothing. */
    function cleanup(env: ObjectEntryEnvironment, e: Entry): void {
      for (const i of e.aInterfaces) {
        x.f.typelib_typedescription_release(i.pTypeDescr.aBase);
        if (i.fpFreeProxy === null) release(env, i.pInterface);
      }
      env.aPtr2ObjectMap.clear();
    }
    if (mode === "construct") {
      const id = x.name("object id"),
        a = new ObjectEntry(id);
      snapshot(a);
      x.text(id.pData);
      a.nRef = -7;
      a.mixedObject = true;
      const b = new ObjectEntry(a);
      snapshot(a);
      snapshot(b);
      const c = ObjectEntry.move(b);
      snapshot(b);
      snapshot(c);
      const different = x.name("different"),
        d = ObjectEntry.fromMovedString(different);
      different.dispose();
      snapshot(d);
      d.assign(a);
      snapshot(d);
      d.assign(d);
      snapshot(d);
      d.moveAssign(c);
      snapshot(d);
      snapshot(c);
      d.moveAssign(d);
      snapshot(d);
      d.dispose();
      c.dispose();
      b.dispose();
      a.dispose();
      x.text(id.pData);
      const value = x.name("rvalue"),
        e = ObjectEntry.fromMovedString(value);
      snapshot(e);
      x.text(value.pData);
      e.dispose();
      x.text(value.pData);
      value.dispose();
      id.dispose();
      x.finish();
      return;
    }
    setup();
    const label = x.name("caller"),
      id = x.name("oid"),
      env = environment(label),
      a = { label: 0, count: 100 },
      b = { label: 1, count: 100 },
      c = { label: 2, count: 100 },
      e = new ObjectEntry(id);
    pointers.push(a, b);
    objects.push(e);
    if (mode === "append") {
      snapshot(e);
      e.append(env, a, types[1] as I, null);
      snapshot(e);
      x.emit(71, objid(env.aPtr2ObjectMap.get(a)), a.count, b.count);
      e.append(env, a, types[2] as I, freeProxy);
      snapshot(e);
      x.emit(71, objid(env.aPtr2ObjectMap.get(a)), a.count, b.count);
      e.append(env, b, types[3] as I, null);
      snapshot(e);
      x.emit(71, objid(env.aPtr2ObjectMap.get(b)), a.count, b.count);
      cleanup(env, e);
      for (const t of types) x.desc(t.aBase);
    } else if (mode === "find") {
      pointers.push(c);
      x.emit(80, e.find(types[0] as I) === null, e.find(a, 0));
      e.append(env, a, types[4] as I, freeProxy);
      for (let n = 0; n < 8; n++) {
        const p = e.find(types[n] as I);
        x.emit(81, n, p === null ? -1 : e.aInterfaces.indexOf(p));
      }
      x.emit(
        82,
        x.f.typelib_typedescriptionreference_isAssignableFrom(
          (types[2] as I).aBase.pWeakRef as R,
          (types[4] as I).aBase.pWeakRef as R,
        ),
      );
      e.append(env, b, types[2] as I, freeProxy);
      e.append(env, a, types[1] as I, freeProxy);
      for (let n = 0; n < 8; n++) {
        const p = e.find(types[n] as I);
        x.emit(83, n, p === null ? -1 : e.aInterfaces.indexOf(p));
      }
      for (const p of pointers)
        for (const n of [0n, 1n, 2n, 3n, (1n << 64n) - 1n])
          x.emit(84, ptrid(p), Number(BigInt.asIntN(32, n)), e.find(p, n));
      snapshot(e);
      cleanup(env, e);
    } else {
      const empty = new ObjectEntry(id);
      objects.push(empty);
      e.append(env, a, types[1] as I, freeProxy);
      e.append(env, b, types[2] as I, freeProxy);
      e.nRef = 23;
      e.mixedObject = true;
      const copied = new ObjectEntry(e);
      snapshot(copied);
      x.emit(
        90,
        copied.aInterfaces === e.aInterfaces,
        (copied.aInterfaces[0] as InterfaceEntry).pInterface ===
          (e.aInterfaces[0] as InterfaceEntry).pInterface,
      );
      const m = ObjectEntry.move(copied);
      snapshot(m);
      snapshot(copied);
      const d = new ObjectEntry(id);
      d.assign(empty);
      snapshot(d);
      d.assign(e);
      snapshot(d);
      const slot = d.find(types[1] as I);
      d.assign(e);
      x.emit(91, slot === d.find(types[1] as I), d.find(types[1] as I) === d.aInterfaces[0]);
      snapshot(d);
      d.assign(d);
      snapshot(d);
      d.moveAssign(m);
      snapshot(d);
      snapshot(m);
      d.moveAssign(d);
      snapshot(d);
      d.dispose();
      m.dispose();
      copied.dispose();
      snapshot(e);
      cleanup(env, e);
      empty.dispose();
    }
    e.dispose();
    id.dispose();
    label.dispose();
    x.finish();
  });
}
