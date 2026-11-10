/** @fileoverview Replays complete original default-environment registration streams; caller records do not replace the missing production environment constructor or invocation stack. */
import { it } from "vitest";
import type { DefaultEnvironmentRegistration } from "./lbenv";
import type { uno_ExtEnvironment } from "../../inc/uno/environment";
import type {
  typelib_InterfaceTypeDescription as I,
  typelib_TypeDescription as D,
  typelib_TypeDescriptionReference as R,
} from "../../inc/typelib/typedescription";
import type { rtl_uString, rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
import { typelib_TypeClass as C } from "../../inc/typelib/typeclass";
import { createUnoNativeContext } from "../../../test/uno-native-values";
import fixture from "./native-environment-registration-cases.json";

for (const mode of ["original", "proxy", "mixed"] as const) {
  it(`matches complete original environment registration ${mode} stream`, /** Replays every initialized native observation and callback in original order. @returns Whole-stream parity. */ async () => {
    const x = await createUnoNativeContext(fixture.captures[mode]),
      f = await import("./lbenv"),
      types: I[] = [],
      pointers = [0, 1, 2].map(
        /** Creates caller-owned pointer observations. @param label - Stable label. @returns Input pointer. */ (
          label,
        ) => ({ label, count: 100, frees: 0 }),
      );
    let activeOut: [unknown] | null = null,
      activeLength: [number] | null = null;
    /** Labels only original caller pointer identity. @param pointer - Original pointer. @returns Input label. */
    function pointerid(pointer: unknown): number {
      return pointer === null
        ? -1
        : pointers.indexOf(pointer as (typeof pointers)[number]) >= 0
          ? pointers.indexOf(pointer as (typeof pointers)[number])
          : -2;
    }
    /** Constructs an actual original interface description. @param label - Exact ASCII name. @param bases - Actual direct bases. @param register - Original registration choice. @returns Owned description. */
    function make(label: string, bases: I[], register = true): I {
      const name = x.name(label),
        out: [I | null] = [null];
      x.f.typelib_typedescription_newMIInterface(
        out,
        name.pData,
        0,
        0,
        0,
        0,
        0,
        bases.length,
        bases.length
          ? bases.map(
              /** Borrows the actual weak base reference. @param base - Base. @returns Weak reference. */ (
                base,
              ) => base.aBase.pWeakRef as R,
            )
          : null,
        0,
        null,
      );
      if (register) x.f.typelib_typedescription_register(out as unknown as [D | null]);
      const result = out[0] as I;
      types.push(result);
      name.dispose();
      return result;
    }
    const root: [D | null] = [null];
    x.f.typelib_typedescriptionreference_getDescription(
      root,
      x.f.typelib_static_type_getByTypeClass(C.INTERFACE)[0] as R,
    );
    types.push((root[0] as D).pSelf as unknown as I);
    const aType = make("registration.A", [types[0] as I]);
    make("registration.B", [types[0] as I]);
    make("registration.Child", [aType]);
    make("registration.A", [types[0] as I], false);
    make("registration.C", [types[0] as I]);
    const label = x.name("uno"),
      oid = x.name("registered"),
      missing = x.name("missing");
    /** Observes unchanged callback timing, maps, outputs and actual type lifetimes. @param kind - Event kind. @param record - Input environment. @param pointer - Caller pointer. @param count - Updated counter. @returns Nothing. */
    function event(
      kind: number,
      record: uno_ExtEnvironment,
      pointer: unknown,
      count: number,
    ): void {
      const p = pointer as (typeof pointers)[number];
      x.emit(
        kind,
        p.label,
        count,
        record === env,
        env.aOId2ObjectMap.size,
        env.aPtr2ObjectMap.size,
        activeOut ? pointerid(activeOut[0]) : -1,
        activeLength ? activeLength[0] : -1,
      );
      for (const type of types) x.desc(type.aBase);
    }
    /** Original caller acquisition callback. @param record - Environment. @param pointer - Pointer. @returns Nothing. */
    function acquire(record: uno_ExtEnvironment, pointer: unknown): void {
      event(30, record, pointer, ++(pointer as (typeof pointers)[number]).count);
    }
    /** Original caller release callback. @param record - Environment. @param pointer - Pointer. @returns Nothing. */
    function release(record: uno_ExtEnvironment, pointer: unknown): void {
      event(31, record, pointer, --(pointer as (typeof pointers)[number]).count);
    }
    /** Original caller proxy-free callback. @param record - Environment. @param pointer - Pointer. @returns Nothing. */
    function free(record: uno_ExtEnvironment, pointer: unknown): void {
      event(32, record, pointer, ++(pointer as (typeof pointers)[number]).frees);
    }
    const env: DefaultEnvironmentRegistration = {
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
      aOId2ObjectMap: new Map(),
      aPtr2ObjectMap: new Map(),
      registerInterface: f.defenv_registerInterface,
      registerProxyInterface: f.defenv_registerProxyInterface,
      revokeInterface: null,
      getObjectIdentifier: f.defenv_getObjectIdentifier,
      getRegisteredInterface: f.defenv_getRegisteredInterface,
      getRegisteredInterfaces: f.defenv_getRegisteredInterfaces,
      acquireInterface: acquire,
      releaseInterface: release,
      computeObjectIdentifier:
        /** Observes the actual enclosing computation boundary. @param record - Environment. @param output - Output string. @param pointer - Caller input. @returns Nothing. */ (
          _record,
          output,
          pointer,
        ) => {
          x.emit(
            35,
            (pointer as (typeof pointers)[number]).label,
            output[0] === null,
            env.aOId2ObjectMap.size,
            env.aPtr2ObjectMap.size,
          );
          const value = x.name("computed");
          x.strings.rtl_uString_assign(output, value.pData);
          value.dispose();
        },
    };
    env.aBase.pExtEnv = env;
    /** Observes all original initialized fields and ownership without sorting callbacks. @returns Nothing. */
    function snapshot(): void {
      x.emit(70, env.aOId2ObjectMap.size, env.aPtr2ObjectMap.size);
      for (const pointer of pointers) {
        const object = env.aPtr2ObjectMap.get(pointer);
        x.emit(71, pointer.label, pointer.count, pointer.frees, object !== undefined);
        if (object) {
          x.emit(72, object.nRef, object.mixedObject, object.aInterfaces.length);
          x.text(object.oid.pData);
          for (const entry of object.aInterfaces) {
            x.emit(
              73,
              entry.refCount,
              pointerid(entry.pInterface),
              types.indexOf(entry.pTypeDescr),
              entry.fpFreeProxy === free,
            );
            x.desc(entry.pTypeDescr.aBase);
          }
        }
      }
    }
    /** Executes the original registration entry point. @param pointer - Caller input. @param type - Actual type index. @param proxy - Proxy choice. @returns Nothing. */
    function register(pointer: unknown, type: number, proxy = false): void {
      const out: [unknown] = [pointer];
      activeOut = out;
      if (proxy) f.defenv_registerProxyInterface(env, out, free, oid.pData, types[type] as I);
      else f.defenv_registerInterface(env, out, oid.pData, types[type] as I);
      x.emit(proxy ? 81 : 80, pointerid(out[0]));
      activeOut = null;
      snapshot();
    }
    /** Executes only the original raw revoke callee, without pretending to implement Environment_invoke. @param pointer - Registered pointer. @returns Nothing. */
    function revoke(pointer: unknown): void {
      f.s_stub_defenv_revokeInterface([env, pointer].values());
      snapshot();
    }
    /** Replays zero/one-pointer enumeration with actual supplied allocation ownership. @returns Nothing. */
    function enumerate(): void {
      const out: [unknown[] | null] = [null],
        length: [number] = [-3];
      activeLength = length;
      f.defenv_getRegisteredInterfaces(
        env,
        out,
        length,
        /** Observes exact requested byte count before output publication. @param bytes - Original allocation size. @returns Caller storage. */ (
          bytes,
        ) => {
          x.emit(90, bytes, activeLength ? activeLength[0] : -1);
          return [];
        },
      );
      x.emit(91, length[0], out[0] !== null);
      for (let i = 0; i < length[0]; i++) {
        const pointer = (out[0] as unknown[])[i];
        x.emit(92, pointerid(pointer));
        release(env, pointer);
      }
      activeLength = null;
    }
    /** Queries the actual type owner while observing pre-publication output. @param out - Original inout pointer. @param id - Original identifier. @param type - Actual type index. @returns Nothing. */
    function query(out: [unknown], id: InstanceType<typeof x.OUString>, type: number): void {
      activeOut = out;
      f.defenv_getRegisteredInterface(env, out, id.pData, types[type] as I);
      x.emit(82, pointerid(out[0]));
      activeOut = null;
    }
    const [a, b, c] = pointers;
    if (mode === "original") {
      enumerate();
      register(a, 3);
      register(a, 3);
      register(b, 1);
      const out: [unknown] = [c];
      query(out, oid, 4);
      query(out, oid, 2);
      query(out, missing, 0);
      const seed = x.name("old output"),
        id: rtl_uStringSlot = [seed.pData];
      x.strings.rtl_uString_acquire(seed.pData);
      f.defenv_getObjectIdentifier(env, id, a);
      x.text(id[0]);
      f.defenv_getObjectIdentifier(env, id, b);
      x.text(id[0]);
      x.strings.rtl_uString_release(id[0] as rtl_uString);
      x.text(seed.pData);
      seed.dispose();
      enumerate();
      revoke(a);
      revoke(a);
      revoke(a);
      enumerate();
    } else if (mode === "proxy") {
      register(a, 1, true);
      register(a, 1, true);
      register(b, 4, true);
      register(b, 2, true);
      revoke(a);
      revoke(b);
      revoke(a);
    } else {
      register(a, 1);
      register(b, 2, true);
      register(b, 2, true);
      register(b, 5, true);
      revoke(b);
      revoke(b);
      revoke(b);
      revoke(a);
    }
    snapshot();
    for (const type of types) x.desc(type.aBase);
    missing.dispose();
    oid.dispose();
    label.dispose();
    x.finish();
  });
}
