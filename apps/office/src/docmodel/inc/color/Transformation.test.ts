/** @fileoverview Verifies native transformation state, copy and logical hash field order. */
import { expect, it } from "vitest";
import { hash_combine } from "../../../o3tl/inc/hash_combine";
import { Transformation, TransformationType as T } from "./Transformation";
it("retains every native type and independent implicit-copy values", /** Checks exact names/values and equality fields. @returns Nothing. */ () => {
  expect([
    T.Undefined,
    T.Red,
    T.RedMod,
    T.RedOff,
    T.Green,
    T.GreenMod,
    T.GreenOff,
    T.Blue,
    T.BlueMod,
    T.BlueOff,
    T.Alpha,
    T.AlphaMod,
    T.AlphaOff,
    T.Hue,
    T.HueMod,
    T.HueOff,
    T.Sat,
    T.SatMod,
    T.SatOff,
    T.Lum,
    T.LumMod,
    T.LumOff,
    T.Shade,
    T.Tint,
    T.Gray,
    T.Comp,
    T.Inv,
    T.Gamma,
    T.InvGamma,
  ]).toEqual(
    Array.from(
      { length: 29 },
      /** Supplies literal enum position. @param _ - Unused slot. @param i - Position. @returns Position. */ (
        _,
        i,
      ) => i,
    ),
  );
  const a = new Transformation(T.Tint, 5000),
    copy = new Transformation(a);
  expect(copy).not.toBe(a);
  expect(copy.equals(a)).toBe(true);
  copy.mnValue = 2500;
  expect(copy.equals(a)).toBe(false);
  copy.meType = T.Shade;
  expect(copy.equals(a)).toBe(false);
  const seed: [number] = [0];
  hash_combine(seed, T.Tint);
  hash_combine(seed, 5000);
  expect(a.getHash()).toBe(seed[0]);
});
