/** @fileoverview Complete original public Environment ownership/accessor streams integrated with actual DefaultEnvironment atomic lifetime callbacks. Enclosing C records are caller input, not a production constructor. */
import { it } from "vitest";
import type { Environment as Owner } from "./environment.hxx";
import type { uno_Environment } from "./environment";
import type { DefaultEnvironmentLifetime } from "../../source/uno/lbenv";
import fixture from "./native-public-environment-cases.json";
import { createUnoNativeContext } from "../../../test/uno-native-values";

for (const mode of ["ownership", "accessors"] as const) {
  it(`matches complete original public Environment ${mode} stream`, /** Replays every initialized source counter, field, string unit and callback before publication. @returns Whole-stream parity. */ async () => {
    const x = await createUnoNativeContext(fixture.captures[mode]),
      { Environment } = await import("./environment.hxx"),
      f = await import("../../source/uno/lbenv"),
      tokens = [{}, {}];
    let a: uno_Environment | null = null,
      b: uno_Environment | null = null,
      watched: Owner | null = null;
    /** Caller-only pointer labels do not synthesize a native address. @param env - Original pointer. @returns Stable label. */
    function identity(env: uno_Environment | null): number {
      return env === null ? -1 : env === a ? 0 : env === b ? 1 : -2;
    }
    /** Observes actual original addressed counts and string ownership. @param kind - Caller event. @param env - Live native record projection. @returns Nothing. */
    function counts(kind: number, env: uno_Environment): void {
      const e = env.pExtEnv as DefaultEnvironmentLifetime;
      x.emit(
        kind,
        identity(env),
        e.nRef[0] as number,
        e.nWeakRef[0] as number,
        watched ? identity(watched.get()) : -3,
      );
      x.text(env.pTypeName);
    }
    /** Caller observer invokes the actual original acquisition before reporting its result. @param env - Original record. @returns Nothing. */
    function acquired(env: uno_Environment): void {
      f.defenv_acquire(env);
      counts(30, env);
    }
    /** Caller observer invokes the actual original release before reporting its result. @param env - Original record. @returns Nothing. */
    function released(env: uno_Environment): void {
      f.defenv_release(env);
      counts(31, env);
    }
    /** Original late-bound disposing boundary reports original pre-weak-release state. @param env - Original record. @returns Nothing. */
    function disposing(env: uno_Environment): void {
      counts(32, env);
    }
    /** Prepares the consumed constructor fields and actual original callbacks as enclosing input only. @param name - Actual descriptor. @param context - Original borrowed opaque pointer. @returns Source C record. */
    function make(name: InstanceType<typeof x.OUString>, context: unknown): uno_Environment {
      x.strings.rtl_uString_acquire(name.pData);
      const base: uno_Environment = {
        pReserved: null,
        pTypeName: name.pData,
        pContext: context,
        pExtEnv: null,
        acquire: acquired,
        release: released,
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
      f.defenv_acquire(base);
      f.defenv_acquireWeak(base);
      return base;
    }
    /** Original public wrapper observations. @param value - Live owner. @returns Nothing. */
    function snapshot(value: Owner): void {
      x.emit(70, identity(value.get()), value.is());
    }
    const name = new x.OUString(
        new Uint16Array([101, 110, 118, 0, 937, 58, 112, 117, 114, 112, 111, 115, 101]),
        13,
      ),
      other = x.name("other");
    a = make(name, tokens[0]);
    b = make(other, tokens[1]);
    if (mode === "ownership") {
      const empty = new Environment();
      watched = empty;
      snapshot(empty);
      const emptyCopy = new Environment(empty);
      snapshot(emptyCopy);
      emptyCopy.dispose();
      const value = new Environment(a);
      watched = value;
      snapshot(value);
      const copy = new Environment(value);
      snapshot(copy);
      const moved = Environment.move(copy);
      snapshot(copy);
      snapshot(moved);
      value.assign(a);
      snapshot(value);
      value.assign(value);
      snapshot(value);
      value.assign(b);
      snapshot(value);
      value.moveAssign(moved);
      snapshot(value);
      snapshot(moved);
      value.moveAssign(value);
      snapshot(value);
      value.assign(null);
      snapshot(value);
      value.assign(b);
      value.clear();
      snapshot(value);
      value.clear();
      snapshot(value);
      value.assign(empty);
      snapshot(value);
      value.moveAssign(moved);
      snapshot(value);
      moved.dispose();
      copy.dispose();
      value.assign(a);
      snapshot(value);
      watched = null;
      value.dispose();
      empty.dispose();
    } else {
      const value = new Environment(a);
      watched = value;
      const copied = value.getTypeName();
      x.text(copied.pData);
      x.text(name.pData);
      x.emit(80, value.getContext() === tokens[0]);
      copied.assign(other);
      x.text(copied.pData);
      x.text(name.pData);
      x.text(other.pData);
      copied.dispose();
      x.text(name.pData);
      x.text(other.pData);
      snapshot(value);
      const moved = Environment.move(value);
      snapshot(value);
      snapshot(moved);
      watched = moved;
      x.emit(81, moved.getContext() === tokens[0]);
      const returned = moved.getTypeName();
      x.text(returned.pData);
      watched = null;
      returned.dispose();
      moved.dispose();
      value.dispose();
    }
    counts(90, b);
    f.defenv_release(b);
    counts(91, b);
    f.defenv_releaseWeak(b);
    x.text(other.pData);
    counts(92, a);
    f.defenv_release(a);
    counts(93, a);
    f.defenv_releaseWeak(a);
    x.text(name.pData);
    other.dispose();
    name.dispose();
    x.finish();
  });
}
