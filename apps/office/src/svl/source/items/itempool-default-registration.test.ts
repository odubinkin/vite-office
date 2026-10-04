/** @fileoverview Verifies independent default registration and optional browser restoration in the real item pool. */
import { expect, it } from "vitest";
import { SfxItemPool } from "./itempool";
import { SfxStringItem } from "./stritem";

it("owns a cloned default without registering an invented snapshot codec", /** Checks ownership, duplicate guard and explicit missing-restoration rejection. @returns Nothing. */ function defaultOnly(): void {
  const pool = new SfxItemPool(),
    caller = new SfxStringItem(1, "default");
  pool.RegisterDefaultItem(caller);
  const item = pool.GetUserOrPoolDefaultItem(1);
  expect(item).not.toBe(caller);
  expect(item.QueryValue()).toBe("default");
  expect(pool.GetUserOrPoolDefaultItem(1)).toBe(item);
  expect(pool.CreateItem.bind(pool, { which: 1, value: "saved" })).toThrow(
    "Unknown pooled item snapshot: 1",
  );
  expect(pool.RegisterDefaultItem.bind(pool, new SfxStringItem(1, "replacement"))).toThrow(
    "Duplicate pool default: 1",
  );
  expect(pool.GetUserOrPoolDefaultItem(1)).toBe(item);
  expect(pool.GetUserOrPoolDefaultItem.bind(pool, 2)).toThrow("Unknown pool default: 2");
});

it("retains optional concrete factory restoration beside default-only entries", /** Checks independent registry paths and existing WhichId validation. @returns Nothing. */ function restoredDefault(): void {
  const pool = new SfxItemPool();
  pool.RegisterDefaultItem(new SfxStringItem(1, "default"));
  pool.RegisterDefaultItem(
    new SfxStringItem(2, "second"),
    /** Restores the supported string. @param value - Persisted primitive. @returns String item. */ function restore(
      value,
    ) {
      return new SfxStringItem(2, String(value));
    },
  );
  expect(pool.CreateItem({ which: 2, value: "saved" }).QueryValue()).toBe("saved");
  expect(pool.GetUserOrPoolDefaultItem(2).QueryValue()).toBe("second");
  expect(pool.CreateItem.bind(pool, { which: 1, value: "saved" })).toThrow(
    "Unknown pooled item snapshot: 1",
  );
  const broken = new SfxItemPool();
  broken.RegisterDefaultItem(
    new SfxStringItem(3, ""),
    /** Returns a wrong identity. @returns Invalid factory result. */ function wrongIdentity() {
      return new SfxStringItem(4, "");
    },
  );
  expect(broken.CreateItem.bind(broken, { which: 3, value: "" })).toThrow(
    "Pooled item factory changed the WhichId.",
  );
});
