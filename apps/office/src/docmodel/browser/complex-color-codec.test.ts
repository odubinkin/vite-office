/** @fileoverview Verifies lossless Worker transport of all represented ComplexColor fields. */
import { expect, it } from "vitest";
import { ComplexColor, ColorType, SystemColorType } from "../inc/color/ComplexColor";
import { ThemeColorType, ThemeColorUsage } from "../inc/theme/ThemeColorType";
import { Transformation, TransformationType } from "../inc/color/Transformation";
import { Color } from "../../tools/inc/color";
import { encodeComplexColor, decodeComplexColor } from "./complex-color-codec";
it("retains independent discriminator, raw doubles, stale system-last, theme usage, transformations and final color", /** Checks state native equality alone cannot certify, and actual value ownership after structured cloning. @returns Nothing. */ () => {
  const color = new ComplexColor();
  color.setSystemColor(SystemColorType.WindowText, 0x123456);
  color.setCRGB(0.125, 0.5, 0.875);
  color.setThemeColor(ThemeColorType.Accent4);
  color.setThemeColorUsage(ThemeColorUsage.Background);
  color.setType(ColorType.HSL);
  color.addTransformation(new Transformation(TransformationType.LumMod, 6543));
  color.addTransformation(new Transformation(TransformationType.Alpha, 7000));
  color.setFinalColor(new Color(0xabcdef));
  const record = encodeComplexColor(color),
    copy = decodeComplexColor(structuredClone(record));
  expect(record.last).toBe(0x123456);
  expect(record.components).toEqual([0.125, 0.5, 0.875]);
  expect(copy.equals(color)).toBe(true);
  expect(copy.getHash()).toBe(color.getHash());
  expect(encodeComplexColor(copy)).toEqual(record);
  copy.setFinalColor(new Color(0));
  copy.setThemeColorUsage(ThemeColorUsage.Text);
  copy.clearTransformations();
  expect(encodeComplexColor(color)).toEqual(record);
});
it.each([
  { version: 2 },
  { components: [0, 1] },
  { components: [0, NaN, 1] },
  { last: -1 },
  { final: 0x100000000 },
  { transformations: [{ type: 999, value: 0 }] },
  { transformations: [{ type: 0, value: 32768 }] },
])(
  "rejects malformed complete records %j",
  /** Keeps untrusted transport validation outside the native value owner. @param patch - Malformed fields. @returns Nothing. */ (
    patch,
  ) => {
    expect(
      /** Decodes a malformed browser value. @returns Unreachable value. */ () =>
        decodeComplexColor({ ...encodeComplexColor(new ComplexColor()), ...patch }),
    ).toThrow(/invalid/);
  },
);
