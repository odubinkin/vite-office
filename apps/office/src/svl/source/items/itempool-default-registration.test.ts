/** @fileoverview Verifies independent default registration and optional browser restoration in the real item pool. */
import { expect, it } from "vitest";
import { SfxItemPool } from "./itempool";
import { SfxStringItem } from "./stritem";

it("routes consumed default registrations through original ItemInfo user override and reset semantics", /** Sparse admission changes storage lookup only; original static/user metadata owns every value. @returns Nothing. */ () => {
  const pool = new SfxItemPool();
  pool.RegisterDefaultItem(new SfxStringItem(1, "original"));
  pool.RegisterDefaultItem(
    new SfxStringItem(4, "other"),
    /** Restores one explicit browser payload. @param value - Payload. @returns Item. */ (value) =>
      new SfxStringItem(4, String(value)),
  );
  const original = pool.GetPoolDefaultItem(1);
  expect(original.isStaticDefault()).toBe(true);
  expect(pool.GetUserDefaultItem(1)).toBeNull();
  const caller = new SfxStringItem(1, "custom");
  pool.SetUserDefaultItem(caller);
  const user = pool.GetUserDefaultItem(1);
  expect(user).not.toBe(caller);
  expect(user?.QueryValue()).toBe("custom");
  expect(pool.GetPoolDefaultItem(1)).toBe(original);
  expect(pool.GetUserOrPoolDefaultItem(1)).toBe(user);
  pool.SetUserDefaultItem(new SfxStringItem(1, "custom"));
  expect(pool.GetUserDefaultItem(1)).toBe(user);
  pool.SetUserDefaultItem(new SfxStringItem(1, "replacement"));
  expect(pool.GetUserDefaultItem(1)?.QueryValue()).toBe("replacement");
  expect(pool.GetPoolDefaultItem(1)).toBe(original);
  const copy = pool.Clone();
  expect(copy.GetPoolDefaultItem(1)).toBe(original);
  expect(copy.GetUserDefaultItem(1)).not.toBe(pool.GetUserDefaultItem(1));
  expect(copy.GetUserDefaultItem(1)?.QueryValue()).toBe("replacement");
  expect(copy.CreateItem({ which: 4, value: "saved" }).QueryValue()).toBe("saved");
  pool.ResetUserDefaultItem(1);
  pool.ResetUserDefaultItem(1);
  expect(pool.GetUserDefaultItem(1)).toBeNull();
  expect(pool.GetUserOrPoolDefaultItem(1)).toBe(original);
  expect(copy.GetUserDefaultItem(1)?.QueryValue()).toBe("replacement");
  copy.ResetUserDefaultItem(1);
  expect(copy.GetUserOrPoolDefaultItem(1)).toBe(original);
});

it("retains metadata owner and slot lookup through secondary chains for consumed registrations", /** Uses actual pool chains and original slot/user-default methods. @returns Nothing. */ () => {
  const primary = new SfxItemPool(),
    secondary = new SfxItemPool();
  secondary.RegisterDefaultItem(new SfxStringItem(4, "original"), undefined, 6001);
  expect(
    /** Duplicate native slot identity is rejected by the consumed registration boundary. @returns Never. */ () =>
      secondary.RegisterDefaultItem(new SfxStringItem(7, "duplicate"), undefined, 6001),
  ).toThrow("Duplicate pool slot");
  primary.SetSecondaryPool(secondary);
  expect(primary.GetSlotId(4)).toBe(6001);
  expect(primary.GetWhichIDFromSlotID(6001)).toBe(4);
  expect(primary.GetWhichIDFromSlotID(6001, false)).toBe(6001);
  expect(primary.GetUserDefaultItem(4)).toBeNull();
  primary.SetUserDefaultItem(new SfxStringItem(4, "custom"));
  expect(secondary.GetUserDefaultItem(4)?.QueryValue()).toBe("custom");
  expect(primary.GetPoolDefaultItem(4).QueryValue()).toBe("original");
  primary.ResetUserDefaultItem(4);
  expect(primary.GetUserDefaultItem(4)).toBeNull();
});

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

it("owns and resets a user default for bounded registered items", /** Checks owns and resets a user default for bounded registered items. @returns Test completion or assertion result. */ () => {
  const pool = new SfxItemPool();
  pool.RegisterDefaultItem(new SfxStringItem(1, "original"));
  const caller = new SfxStringItem(1, "override");
  pool.SetUserDefaultItem(caller);
  expect(pool.GetPoolDefaultItem(1).QueryValue()).toBe("original");
  expect(pool.GetUserDefaultItem(1)?.QueryValue()).toBe("override");
  expect(pool.GetUserDefaultItem(1)).not.toBe(caller);
  expect(pool.GetUserOrPoolDefaultItem(1).QueryValue()).toBe("override");
  const copy = pool.Clone();
  expect(copy.GetUserDefaultItem(1)?.QueryValue()).toBe("override");
  expect(copy.GetUserDefaultItem(1)).not.toBe(pool.GetUserDefaultItem(1));
  copy.ResetUserDefaultItem(1);
  expect(copy.GetUserOrPoolDefaultItem(1).QueryValue()).toBe("original");
  expect(pool.GetUserOrPoolDefaultItem(1).QueryValue()).toBe("override");
  pool.ResetUserDefaultItem(1);
  expect(pool.GetUserDefaultItem(1)).toBeNull();
  expect(pool.GetUserOrPoolDefaultItem(1).QueryValue()).toBe("original");
});
