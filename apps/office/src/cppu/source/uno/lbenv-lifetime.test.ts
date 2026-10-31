/** @fileoverview Complete original DefaultEnvironment lifetime streams over actual atomic count storage, strings and source callbacks; prepared C records remain enclosing input, not a production constructor. */
import { it } from "vitest";
import type { DefaultEnvironmentLifetime } from "./lbenv";
import type { uno_Environment } from "../../inc/uno/environment";
import fixture from "./native-environment-lifetime-cases.json";
import { createUnoNativeContext } from "../../../test/uno-native-values";

for (const mode of ["live", "replace", "reentrant", "registry"] as const) {
  it(`matches complete original environment lifetime ${mode} stream`, /** Replays every initialized source observation and exact callback/output order. @returns Whole-stream parity. */ async () => {
    const x = await createUnoNativeContext(fixture.captures[mode]),
      f = await import("./lbenv");
    let a: uno_Environment | null = null,
      b: uno_Environment | null = null,
      watched: [uno_Environment | null] | null = null,
      revive = false,
      calls = 0;
    /** Caller pointer labels preserve identity without synthesizing native addresses. @param env - Original pointer. @returns Label. */
    function identity(env: uno_Environment | null): number {
      return env === null ? -1 : env === a ? 0 : env === b ? 1 : -2;
    }
    /** Observes actual original addressed counts, maps and type-name ownership. @param env - Live original record. @returns Nothing. */
    function snapshot(env: uno_Environment): void {
      const e = env.pExtEnv as DefaultEnvironmentLifetime;
      x.emit(
        70,
        identity(env),
        e.nRef[0] as number,
        e.nWeakRef[0] as number,
        e.aOId2ObjectMap.size,
        e.aPtr2ObjectMap.size,
      );
      x.text(env.pTypeName);
    }
    /** Observes the actual last-strong callback before weak decrement; original caller may explicitly acquire during callback. @param env - Original record. @returns Nothing. */
    function disposing(env: uno_Environment): void {
      const e = env.pExtEnv as DefaultEnvironmentLifetime;
      x.emit(
        30,
        identity(env),
        e.nRef[0] as number,
        e.nWeakRef[0] as number,
        watched ? identity(watched[0]) : -3,
      );
      x.text(env.pTypeName);
      calls++;
      if (revive && calls === 1) {
        const out: [uno_Environment | null] = [null];
        f.defenv_harden(out, env);
        x.emit(31, identity(out[0]));
        f.defenv_acquire(env);
        snapshot(env);
      }
    }
    /** Prepares the original constructor's consumed fields as enclosing caller input only. @param name - Owned source name. @returns Borrowed original C record. */
    function make(name: InstanceType<typeof x.OUString>): uno_Environment {
      x.strings.rtl_uString_acquire(name.pData);
      const base: uno_Environment = {
        pReserved: null,
        pTypeName: name.pData,
        pContext: null,
        pExtEnv: null,
        acquire: f.defenv_acquire,
        release: f.defenv_release,
        acquireWeak: f.defenv_acquireWeak,
        releaseWeak: f.defenv_releaseWeak,
        harden: f.defenv_harden,
        dispose: f.defenv_dispose,
        environmentDisposing: disposing,
      };
      const record: DefaultEnvironmentLifetime = {
        aBase: base,
        nRef: new Int32Array([0]),
        nWeakRef: new Int32Array([0]),
        aPtr2ObjectMap: new Map(),
        aOId2ObjectMap: new Map(),
        registerInterface: null,
        registerProxyInterface: null,
        revokeInterface: null,
        getObjectIdentifier: null,
        getRegisteredInterface: null,
        getRegisteredInterfaces: null,
        computeObjectIdentifier: null,
        acquireInterface: null,
        releaseInterface: null,
      };
      base.pExtEnv = record;
      return base;
    }
    const name = x.name("lifetime"),
      other = x.name("previous");
    a = make(name);
    snapshot(a);
    f.defenv_acquire(a);
    f.defenv_acquireWeak(a);
    snapshot(a);
    if (mode === "live") {
      f.defenv_acquire(a);
      snapshot(a);
      const out: [uno_Environment | null] = [null];
      f.defenv_harden(out, a);
      x.emit(80, identity(out[0]));
      snapshot(a);
      f.defenv_dispose(a);
      snapshot(a);
      f.defenv_release(a);
      snapshot(a);
      f.defenv_release(a);
      snapshot(a);
      f.defenv_release(a);
      snapshot(a);
      out[0] = null;
      f.defenv_harden(out, a);
      x.emit(81, identity(out[0]));
      snapshot(a);
      f.defenv_releaseWeak(a);
      x.text(name.pData);
    } else if (mode === "replace") {
      b = make(other);
      f.defenv_acquire(b);
      const out: [uno_Environment | null] = [b];
      watched = out;
      f.defenv_harden(out, a);
      x.emit(80, identity(out[0]));
      x.text(other.pData);
      snapshot(a);
      f.defenv_harden(out, a);
      x.emit(81, identity(out[0]));
      snapshot(a);
      f.theEnvironmentsData().isDisposing = true;
      f.defenv_harden(out, a);
      x.emit(82, identity(out[0]));
      snapshot(a);
      f.theEnvironmentsData().isDisposing = false;
      watched = null;
      f.defenv_release(a);
      snapshot(a);
      f.defenv_releaseWeak(a);
      x.text(name.pData);
    } else if (mode === "reentrant") {
      revive = true;
      f.defenv_release(a);
      snapshot(a);
      f.defenv_release(a);
      snapshot(a);
      f.defenv_releaseWeak(a);
      x.text(name.pData);
    } else {
      const out: [uno_Environment | null] = [a],
        registry = f.theEnvironmentsData();
      registry.registerEnvironment(out);
      snapshot(a);
      out[0] = null;
      registry.getEnvironment(out, name, null);
      x.emit(80, identity(out[0]));
      snapshot(a);
      f.defenv_release(out[0] as unknown as uno_Environment);
      f.defenv_release(a);
      f.defenv_releaseWeak(a);
      snapshot(a);
      out[0] = null;
      registry.getEnvironment(out, name, null);
      x.emit(81, identity(out[0]));
      b = make(name);
      f.defenv_acquire(b);
      out[0] = b;
      registry.registerEnvironment(out);
      x.emit(82, identity(out[0]));
      snapshot(b);
      x.text(name.pData);
      f.defenv_release(b);
      snapshot(b);
      x.text(name.pData);
    }
    x.emit(90, calls);
    x.text(other.pData);
    other.dispose();
    name.dispose();
    x.finish();
  });
}
