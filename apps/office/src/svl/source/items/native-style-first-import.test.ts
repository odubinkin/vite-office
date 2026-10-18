/** @fileoverview Independent core-owner-first initialization must work without importing the public style header first. */
import { expect, it } from "vitest";
import { SfxStyleSheetBasePool } from "./style-model";
import { SfxItemPool } from "./itempool";
it("initializes actual core owners from their implementation entry before the style facade", /** Checks real module initialization and constructor identity. @returns Nothing. */ () => {
  const items = new SfxItemPool(),
    pool = new SfxStyleSheetBasePool(items);
  expect(pool.GetPool()).toBe(items);
  pool.Dispose();
});
