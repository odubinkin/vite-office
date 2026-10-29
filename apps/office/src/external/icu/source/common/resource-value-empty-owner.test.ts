/** @fileoverview Original ResourceDataValue reports its unbound type before any borrowed resource is assigned. */
import { expect, it } from "vitest";
import { ResourceDataValue } from "./uresdata";

it("reports no resource type for a freshly constructed value owner", /** Exercises the public initial ownership contract. @returns Nothing. */ () => {
  const owner = new ResourceDataValue();
  expect(owner.getResource()).toBeNull();
  expect(owner.getValidLocaleDataEntry()).toBeNull();
  expect(owner.getType()).toBe(-1);
  const length: [number] = [7],
    status: [number] = [0];
  expect(owner.getString(length, status)).toBeNull();
  expect(length[0]).toBe(0);
  expect(status[0]).toBe(17);
});
