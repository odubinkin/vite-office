/** @fileoverview Original theme permutation and last-transform luminance arithmetic with actual ComplexColor values. */
import { expect, it } from "vitest";
import { ComplexColor } from "../../../docmodel/inc/color/ComplexColor";
import {
  Transformation,
  TransformationType as T,
} from "../../../docmodel/inc/color/Transformation";
import { ThemeColorType } from "../../../docmodel/inc/theme/ThemeColorType";
import {
  convertColorTransformsToTintOrShade as tint,
  convertThemeColorTypeToExcelThemeNumber as theme,
} from "./ColorExportUtils";
it("retains the Excel text/background permutation and Unknown result", /** Does not validate out-of-enum source pointer domains. @returns Nothing. */ () => {
  expect(theme(ThemeColorType.Unknown)).toBe(-1);
  for (const [type, value] of [1, 0, 3, 2, 4, 5, 6, 7, 8, 9, 10, 11].entries())
    expect(theme(type)).toBe(value);
});
it("uses final LumMod/LumOff with source signed16 arithmetic and positive-offset priority", /** Values outside native tint recommendations are not clamped. @returns Nothing. */ () => {
  const color = new ComplexColor();
  expect(tint(color)).toBe(0);
  color.addTransformation(new Transformation(T.Tint, 1234));
  expect(tint(color)).toBe(0);
  color.addTransformation(new Transformation(T.LumMod, 7500));
  expect(tint(color)).toBe(-0.25);
  color.addTransformation(new Transformation(T.LumOff, 2000));
  expect(tint(color)).toBe(0.2);
  color.addTransformation(new Transformation(T.LumOff, -1));
  expect(tint(color)).toBe(-0.25);
  color.addTransformation(new Transformation(T.LumMod, 15000));
  expect(tint(color)).toBe(0.5);
  color.addTransformation(new Transformation(T.LumMod, 65536));
  expect(tint(color)).toBe(-1);
});
