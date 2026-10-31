/** @fileoverview Original weak registry contracts through explicitly prepared environment C callback records; no runtime environment provider is substituted. */
import { expect, it } from "vitest";
import { EnvironmentsData } from "./lbenv";
import type { uno_Environment } from "../../inc/uno/environment";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
/** Caller-prepared native C environment boundary with observable strong/weak callbacks. */
class Environment {
  readonly name;
  readonly env: uno_Environment;
  strong = 1;
  weak = 0;
  alive = true;
  disposed = 0;
  readonly calls: string[] = [];
  /** Retains caller descriptor/address and declares every original C slot. @param descriptor - Exact descriptor. @param address - Native context address. @returns Test boundary. */
  constructor(descriptor: string, address: bigint | null = null) {
    this.name = unicode(descriptor);
    this.env = {
      pReserved: null,
      pTypeName: this.name.pData,
      pContext: address,
      pExtEnv: null,
      acquire: /** Acquires the prepared strong environment reference. @returns Nothing. */ () => {
        this.calls.push("acquire");
        this.strong++;
      },
      release: /** Releases the prepared strong environment reference. @returns Nothing. */ () => {
        this.calls.push("release");
        this.strong--;
      },
      acquireWeak: /** Acquires the registry weak reference. @returns Nothing. */ () => {
        this.calls.push("acquireWeak");
        this.weak++;
      },
      releaseWeak: /** Releases the registry weak reference. @returns Nothing. */ () => {
        this.calls.push("releaseWeak");
        this.weak--;
      },
      harden:
        /** Hardens only the prepared live environment. @param out - Actual output slot. @returns Nothing. */ (
          out,
        ) => {
          this.calls.push("harden");
          out[0] = this.alive ? this.env : null;
          if (out[0]) this.strong++;
        },
      dispose: /** Observes explicit environment disposal. @returns Nothing. */ () => {
        this.calls.push("dispose");
        this.disposed++;
      },
      environmentDisposing: null,
    };
  }
}
it("substitutes live duplicate environments and replaces dead weak registrations in original callback order", /** Real callback counters prove registry weak ownership and hardened replacement. @returns Nothing. */ () => {
  const registry = new EnvironmentsData(),
    a = new Environment("uno"),
    b = new Environment("uno"),
    c = new Environment("uno");
  const aout: [uno_Environment | null] = [a.env],
    bout: [uno_Environment | null] = [b.env],
    cout: [uno_Environment | null] = [c.env];
  registry.registerEnvironment(aout);
  expect([a.strong, a.weak]).toEqual([1, 1]);
  registry.registerEnvironment(bout);
  expect(bout[0]).toBe(a.env);
  expect(b.calls).toEqual(["release"]);
  expect([a.strong, a.weak]).toEqual([2, 1]);
  a.alive = false;
  registry.registerEnvironment(cout);
  expect(cout[0]).toBe(c.env);
  expect([a.weak, c.weak]).toEqual([0, 1]);
  expect(registry.aName2EnvMap.size).toBe(1);
  registry.dispose();
  expect(registry.isDisposing).toBe(true);
  expect(c.calls).toEqual(["acquireWeak", "harden", "releaseWeak", "dispose", "release"]);
  expect([c.strong, c.weak, c.disposed]).toEqual([1, 0, 1]);
  for (const value of [a, b, c]) value.name.dispose();
});
it("releases and nulls lookup outputs, preserves exact descriptors and signed pointer-key concatenation", /** Distinct input pairs intentionally collide because native keys contain no delimiter. @returns Nothing. */ () => {
  const registry = new EnvironmentsData(),
    a = new Environment("23", 1n),
    collision = new Environment("3", 12n),
    old = new Environment("old"),
    out: [uno_Environment | null] = [a.env];
  registry.registerEnvironment(out);
  out[0] = collision.env;
  registry.registerEnvironment(out);
  expect(out[0]).toBe(a.env);
  const name = unicode("23"),
    wrong = unicode("23\0suffix"),
    lookup: [uno_Environment | null] = [old.env];
  registry.getEnvironment(lookup, name, 1n);
  expect(old.calls).toEqual(["release"]);
  expect(lookup[0]).toBe(a.env);
  registry.getEnvironment(lookup, wrong, 1n);
  expect(lookup[0]).toBeNull();
  const negative = new Environment("uno", 0xffffffffffffffffn),
    negout: [uno_Environment | null] = [negative.env];
  registry.registerEnvironment(negout);
  expect([...registry.aName2EnvMap.keys()].map(text)).toContain("-1uno");
  registry.dispose();
  name.dispose();
  wrong.dispose();
  for (const value of [a, collision, old, negative]) value.name.dispose();
});
it("enumerates only successful exact matches and allocates original pointer bytes only for nonempty results", /** Dead entries and descriptors with embedded NUL are not guessed or prefix-matched. @returns Nothing. */ () => {
  const registry = new EnvironmentsData(),
    java = new Environment("java"),
    suffix = new Environment("java\0suffix", 1n),
    dead = new Environment("java", 2n),
    uno = new Environment("uno"),
    result: [uno_Environment[] | null] = [null],
    length: [number] = [-1],
    requests: number[] = [];
  for (const e of [java, suffix, dead, uno]) registry.registerEnvironment([e.env]);
  dead.alive = false;
  const filter = unicode("java"),
    empty = unicode(""),
    absent = unicode("absent");
  /** Caller-provided pointer-array malloc binding records exact requested bytes. @param bytes - Native allocation size. @returns Caller-owned memory. */
  function allocate(bytes: number): uno_Environment[] {
    requests.push(bytes);
    return new Array(bytes / 8);
  }
  registry.getRegisteredEnvironments(result, length, allocate, filter);
  expect(length[0]).toBe(1);
  expect(result[0]).toEqual([java.env]);
  expect(requests).toEqual([8]);
  registry.getRegisteredEnvironments(result, length, allocate, empty);
  expect(length[0]).toBe(3);
  expect(new Set(result[0])).toEqual(new Set([java.env, suffix.env, uno.env]));
  expect(requests).toEqual([8, 24]);
  registry.getRegisteredEnvironments(result, length, allocate, absent);
  expect([result[0], length[0]]).toEqual([null, 0]);
  expect(requests).toEqual([8, 24]);
  registry.dispose();
  for (const value of [filter, empty, absent, java.name, suffix.name, dead.name, uno.name])
    value.dispose();
});
