/** @fileoverview Validates storage-neutral medium identity and operation state. */
import { describe, expect, it } from "vitest";

import { acquireSfxMedium, SfxMedium } from "./docfile";

describe("SfxMedium", /** Groups SfxMedium. @returns Test callback result. */ () => {
  it("retains source and operation state across a primary destination", /** Checks retains source and operation state across a primary destination. @returns Test callback result. */ () => {
    const external = { kind: "external" as const, reference: {} };
    const medium = new SfxMedium({
      kind: "primary",
      name: "Draft",
      storageKey: "draft",
      source: external,
    });
    expect(acquireSfxMedium(medium)).toBe(medium);
    expect(medium.source).toBe(external);
    expect(medium.origin).toBe("external");
    expect(medium.destination).toEqual({ kind: "storage", key: "draft" });
    medium.SetOperation("save", "succeeded", 4, "committed");
    expect(medium.GetLastOperation()).toEqual({
      operation: "save",
      state: "succeeded",
      generation: 4,
      message: "committed",
    });
    medium.SetOperation("save", "pending");
    expect(medium.GetLastOperation()).toEqual({ operation: "save", state: "pending" });
    expect(medium.IsOpen()).toBe(true);
    medium.Close();
    expect(medium.IsOpen()).toBe(false);
    expect(
      /** Runs the test callback. @returns Test callback result. */ () =>
        medium.SetOperation("save", "pending"),
    ).toThrow(/Closed media/);
  });

  it("rejects input media without an opaque external reference", /** Checks rejects input media without an opaque external reference. @returns Test callback result. */ () => {
    expect(
      /** Runs the test callback. @returns Test callback result. */ () =>
        new SfxMedium({ kind: "untitled", name: " " }),
    ).toThrow(/Medium name/);
    expect(
      /** Runs the test callback. @returns Test callback result. */ () =>
        new SfxMedium({ kind: "primary", name: "Draft", storageKey: " " }),
    ).toThrow(/Storage key/);
    expect(
      /** Runs the test callback. @returns Test callback result. */ () =>
        new SfxMedium({
          kind: "primary",
          name: "Draft",
          storageKey: undefined as unknown as string,
        }),
    ).toThrow(/Storage key is required/);
    expect(
      /** Runs the test callback. @returns Test callback result. */ () =>
        new SfxMedium({
          kind: "input",
          name: "Broken",
          source: undefined as unknown as { kind: "external"; reference: object },
        }),
    ).toThrow(/external reference/);
    expect(
      /** Runs the test callback. @returns Test callback result. */ () =>
        new SfxMedium({
          kind: "input",
          name: "Broken",
          source: { kind: "external", reference: null as unknown as object },
        }),
    ).toThrow(/external reference/);
    expect(
      /** Runs the test callback. @returns Test callback result. */ () =>
        new SfxMedium({
          kind: "input",
          name: "Broken",
          source: { kind: "external", reference: "text" as unknown as object },
        }),
    ).toThrow(/external reference/);
  });
});
