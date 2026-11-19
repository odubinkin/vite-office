/** @fileoverview Real generated XStatusIndicator type identity without a replacement progress component. */
import { expect, it } from "vitest";
import { XStatusIndicator, cppu_detail_getUnoType, getCppuType } from "./XStatusIndicator";
import { text } from "../../../../../i18nlangtag/source/isolang/isolang.tables";
it("shares the original implicit-XInterface normal generated type across overloads", /** Actual CPPU cached registration. @returns Nothing. */ () => {
  const type = cppu_detail_getUnoType();
  expect(cppu_detail_getUnoType()).toBe(type);
  expect(XStatusIndicator.static_type()).toBe(type);
  expect(XStatusIndicator.static_type(null)).toBe(type);
  expect(getCppuType()).toBe(type);
  expect(getCppuType(null)).toBe(type);
  const name = type.getTypeName();
  try {
    expect(text(name)).toBe("com.sun.star.task.XStatusIndicator");
  } finally {
    name.dispose();
  }
});
