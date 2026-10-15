/** @fileoverview Public CPPU entry points must initialize the same actual generated exception values regardless of dependency traversal order. */
import { expect, it, vi } from "vitest";

const entries = [
  [
    "Exception",
    /** Loads the base declaration first. @returns Public module. */ () => import("./Exception"),
  ],
  [
    "RuntimeException",
    /** Loads the derived declaration first. @returns Public module. */ () =>
      import("./RuntimeException"),
  ],
  [
    "Reference",
    /** Loads the shared field owner first. @returns Public module. */ () => import("./Reference"),
  ],
  [
    "Any",
    /** Loads the shared query result first. @returns Public module. */ () => import("./Any"),
  ],
  [
    "genfunc",
    /** Loads the typed catch consumer first. @returns Public module. */ () => import("./genfunc"),
  ],
] as const;

for (const [entry, load] of entries)
  it(`initializes actual generated exception values through ${entry} first`, /** Verifies public identity and generated values without a consumer import-order workaround. @returns Completion. */ async () => {
    vi.resetModules();
    await load();
    const { Exception } = await import("./Exception"),
      { RuntimeException, cppu_detail_getUnoType } = await import("./RuntimeException"),
      values = await import("./exception-values"),
      { Reference } = await import("./Reference"),
      { OUString } = await import("../../../../../../sal/inc/rtl/ustring");
    expect(Exception).toBe(values.Exception);
    expect(RuntimeException).toBe(values.RuntimeException);
    const message = new OUString(new Uint8Array([99, 97, 108, 99, 0])),
      context = new Reference(),
      base = new Exception(message, context),
      derived = new RuntimeException(message, context),
      copy = new RuntimeException(derived),
      moved = RuntimeException.move(copy);
    expect(base instanceof Exception).toBe(true);
    expect(base instanceof RuntimeException).toBe(false);
    for (const value of [derived, moved]) {
      expect(value instanceof Exception).toBe(true);
      expect(value instanceof RuntimeException).toBe(true);
      expect(Array.from(value.Message.getStr().subarray(0, 4))).toEqual([99, 97, 108, 99]);
      expect(value.Context.is()).toBe(false);
    }
    expect(cppu_detail_getUnoType()).toBe(cppu_detail_getUnoType());
    moved.dispose();
    copy.dispose();
    derived.dispose();
    base.dispose();
    context.dispose();
    message.dispose();
  });
