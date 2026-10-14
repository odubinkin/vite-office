/** @fileoverview Verifies native complex-color state and ownership without a fake resolver. */
import { expect, it } from "vitest";
import { Color, ColorTransparency } from "../../../tools/inc/color";
import { hash_combine } from "../../../o3tl/inc/hash_combine";
import { ThemeColorType as Theme, ThemeColorUsage as Usage } from "../theme/ThemeColorType";
import { Transformation, TransformationType as T } from "./Transformation";
import { ComplexColor, ColorType as C, SystemColorType as S } from "./ComplexColor";
it("retains native default, representation, system and theme rules", /** Checks actual state without theme/config service substitutes. @returns Nothing. */ () => {
  const a = new ComplexColor();
  expect([
    a.getType(),
    a.getRed(),
    a.getGreen(),
    a.getBlue(),
    a.getSystemColorType(),
    a.getThemeColorType(),
    a.getThemeColorUsage(),
    a.getFinalColor().toUInt32(),
  ]).toEqual([0, 0, 0, 0, 0, -1, 0, 0]);
  expect(a.getTransformations()).toEqual([]);
  expect(a.isUsed()).toBe(false);
  expect(a.isValidThemeType()).toBe(false);
  expect(a.isTransparent()).toBe(false);
  a.setSystemColorType(S.Unused);
  expect(a.isUsed()).toBe(false);
  a.setSystemColorType(S.Window);
  expect(a.isUsed()).toBe(true);
  expect(a.getSystemColorType()).toBe(28);
  a.setThemeColor(Theme.Unknown);
  expect(a.isValidThemeType()).toBe(false);
  a.setThemeColor(Theme.Accent1);
  expect(a.isValidThemeType()).toBe(true);
  expect(a.getThemeColorType()).toBe(4);
  a.setThemeColorUsage(Usage.Text);
  expect(a.getThemeColorUsage()).toBe(1);
  a.setThemePlaceholder();
  expect(a.getType()).toBe(C.Placeholder);
  expect(a.isValidThemeType()).toBe(false);
  a.setType(C.Finalized);
  expect(a.getType()).toBe(C.Finalized);
  expect(a.isUsed()).toBe(true);
  expect([
    C.Unused,
    C.RGB,
    C.CRGB,
    C.HSL,
    C.Theme,
    C.Palette,
    C.System,
    C.Placeholder,
    C.Finalized,
  ]).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  expect([
    S.Unused,
    S.DarkShadow3D,
    S.Light3D,
    S.ActiveBorder,
    S.ActiveCaption,
    S.AppWorkspace,
    S.Background,
    S.ButtonFace,
    S.ButtonHighlight,
    S.ButtonShadow,
    S.ButtonText,
    S.CaptionText,
    S.GradientActiveCaption,
    S.GradientInactiveCaption,
    S.GrayText,
    S.Highlight,
    S.HighlightText,
    S.HotLight,
    S.InactiveBorder,
    S.InactiveCaption,
    S.InactiveCaptionText,
    S.InfoBack,
    S.InfoText,
    S.Menu,
    S.MenuBar,
    S.MenuHighlight,
    S.MenuText,
    S.ScrollBar,
    S.Window,
    S.WindowFrame,
    S.WindowText,
  ]).toEqual(
    Array.from(
      { length: 31 },
      /** Supplies literal enum position. @param _ - Unused slot. @param i - Position. @returns Position. */ (
        _,
        i,
      ) => i,
    ),
  );
});
it("keeps raw component forms, conditional outputs and final color distinct", /** Checks source-defined mutation boundaries and actual Color copies. @returns Nothing. */ () => {
  const a = new ComplexColor(),
    r: [number] = [9],
    g: [number] = [8],
    b: [number] = [7];
  a.getRGB(r, g, b);
  expect([r, g, b]).toEqual([[9], [8], [7]]);
  a.setCRGB(100000, -1, 50);
  expect([a.getType(), a.getRed(), a.getGreen(), a.getBlue()]).toEqual([C.CRGB, 100000, -1, 50]);
  expect(a.getFinalColor().toUInt32()).toBe(0);
  a.setHSL(1200000, 50000, 75000);
  expect([a.getType(), a.getRed(), a.getGreen(), a.getBlue()]).toEqual([
    C.HSL,
    1200000,
    50000,
    75000,
  ]);
  const color = new Color(ColorTransparency, 0x80112233, "ColorTransparencyTag");
  a.setColor(color);
  color.SetRed(255);
  expect(a.getFinalColor().toUInt32()).toBe(0x80112233);
  expect(a.getRGBColor().toUInt32()).toBe(0x112233);
  expect((a.getRGB() as Color).toUInt32()).toBe(0x112233);
  a.getRGB(r, g, b);
  expect([r, g, b]).toEqual([[17], [34], [51]]);
  a.setRGB(-1);
  expect(a.getFinalColor().toUInt32()).toBe(0xffffffff);
  expect(a.getRGBColor().toUInt32()).toBe(0xffffff);
  const final = a.getFinalColor();
  a.setSystemColor(S.Menu, 0x123456);
  expect(a.getType()).toBe(C.System);
  expect(a.getRGBColor().toUInt32()).toBe(0xffffff);
  expect(final.toUInt32()).toBe(0xffffffff);
  a.setFinalColor(new Color(0x654321));
  expect(a.getFinalColor()).toBe(final);
  expect(final.toUInt32()).toBe(0x654321);
  expect(a.getType()).toBe(C.System);
});
it("owns transformation copies and complete implicit copies, preserving original transparency scan", /** Checks borrowed sequence stability, erase order and self-assignment. @returns Nothing. */ () => {
  const a = new ComplexColor(),
    t = new Transformation(T.Alpha, 0),
    vector = a.getTransformations();
  a.addTransformation(t);
  t.mnValue = 10000;
  expect(a.isTransparent()).toBe(true);
  a.setTransformations([
    new Transformation(T.Tint, 2000),
    new Transformation(T.Alpha, 10000),
    new Transformation(T.AlphaMod, 0),
  ]);
  expect(a.getTransformations()).toBe(vector);
  expect(a.isTransparent()).toBe(false);
  a.addTransformation(new Transformation(T.Alpha, 0));
  a.addTransformation(new Transformation(T.Alpha, 0));
  a.removeTransformations(T.Alpha);
  expect(
    a
      .getTransformations()
      .map(
        /** Reads the surviving native type. @param t - Actual transformation. @returns Type. */ (
          t,
        ) => t.meType,
      ),
  ).toEqual([T.Tint, T.AlphaMod]);
  a.setSystemColor(S.Window, 0x123456);
  a.setThemeColorUsage(Usage.Background);
  a.setFinalColor(new Color(0xabcdef));
  const copy = new ComplexColor(a);
  expect(copy.equals(a)).toBe(true);
  expect(copy.getThemeColorUsage()).toBe(Usage.Background);
  expect(copy.getFinalColor().toUInt32()).toBe(0xabcdef);
  expect(copy.getTransformations()[0]).not.toBe(a.getTransformations()[0]);
  a.assign(a);
  expect(a.equals(copy)).toBe(true);
  a.setTransformations(a.getTransformations());
  expect(a.getTransformations()).toHaveLength(2);
  a.clearTransformations();
  expect(vector).toHaveLength(0);
  expect(copy.getTransformations()).toHaveLength(2);
  const target = new ComplexColor();
  target.assignIfUsed(new ComplexColor());
  expect(target.isUsed()).toBe(false);
  target.assignIfUsed(copy);
  expect(target.equals(copy)).toBe(true);
});
it("preserves every original comparison field and the final-color hash inconsistency", /** Checks original fields rather than repairing suspicious upstream behavior. @returns Nothing. */ () => {
  const base = ComplexColor.createRGB(new Color(0x112233));
  base.addTransformation(new Transformation(T.LumMod, 5000));
  const mutations = [
    /** Changes one independently initialized equality field. @param a - Actual copy. @returns Nothing. */ (
      a: ComplexColor,
    ) => a.setCRGB(18, 34, 51),
    /** Changes one independently initialized equality field. @param a - Actual copy. @returns Nothing. */ (
      a: ComplexColor,
    ) => a.setCRGB(17, 35, 51),
    /** Changes one independently initialized equality field. @param a - Actual copy. @returns Nothing. */ (
      a: ComplexColor,
    ) => a.setCRGB(17, 34, 52),
    /** Changes one independently initialized equality field. @param a - Actual copy. @returns Nothing. */ (
      a: ComplexColor,
    ) => a.setSystemColorType(S.Window),
    /** Changes one independently initialized equality field. @param a - Actual copy. @returns Nothing. */ (
      a: ComplexColor,
    ) => a.setSystemColor(S.Unused, 1),
    /** Changes one independently initialized equality field. @param a - Actual copy. @returns Nothing. */ (
      a: ComplexColor,
    ) => a.setThemeColor(Theme.Accent1),
    /** Changes one independently initialized equality field. @param a - Actual copy. @returns Nothing. */ (
      a: ComplexColor,
    ) => a.clearTransformations(),
    /** Changes one independently initialized equality field. @param a - Actual copy. @returns Nothing. */ (
      a: ComplexColor,
    ) => a.setTransformations([new Transformation(T.LumMod, 6000)]),
  ];
  for (const mutate of mutations) {
    const a = new ComplexColor(base);
    mutate(a);
    if (a.getType() !== C.RGB) a.setType(C.RGB);
    expect(a.equals(base)).toBe(false);
  }
  const type = new ComplexColor(base);
  type.setType(C.HSL);
  expect(type.equals(base)).toBe(false);
  const same = new ComplexColor(base);
  same.setThemeColorUsage(Usage.Background);
  expect(same.equals(base)).toBe(true);
  expect(same.getHash()).toBe(base.getHash());
  same.setFinalColor(new Color(0xffffff));
  expect(same.equals(base)).toBe(true);
  expect(same.getHash()).not.toBe(base.getHash());
  const seed: [number] = [0];
  for (const n of [C.RGB, 17, 34, 51, S.Unused, 0]) hash_combine(seed, n);
  hash_combine(seed, new Transformation(T.LumMod, 5000).getHash());
  hash_combine(seed, 0x112233);
  expect(base.getHash()).toBe(seed[0]);
  const dark = ComplexColor.Theme(Theme.Dark1),
    light = ComplexColor.Theme(Theme.Light1);
  expect(dark.equals(light)).toBe(false);
  expect(dark.getHash()).toBe(light.getHash());
});
it("retains all effect table cells, normalized HSL luminance thresholds and original factory sequence", /** Checks literal table values and boundary colors using JS Math only. @returns Nothing. */ () => {
  const mods = [
      [10000, 5000, 6500, 7500, 8500, 9500],
      [10000, 1000, 2500, 5000, 7500, 9000],
      [10000, 2000, 4000, 6000, 7500, 5000],
      [10000, 9000, 7500, 5000, 2500, 1000],
      [10000, 9500, 8500, 7500, 6500, 5000],
    ],
    offs = [
      [0, 5000, 3500, 2500, 1500, 500],
      [0, 9000, 7500, 5000, 2500, 1000],
      [0, 8000, 6000, 4000, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
    ];
  for (let i = 0; i < 5; i++)
    for (let e = 0; e < 6; e++) {
      expect(ComplexColor.getLumMod(i, e)).toBe(mods[i]?.[e]);
      expect(ComplexColor.getLumOff(i, e)).toBe(offs[i]?.[e]);
    }
  for (const [rgb, index] of [
    [0, 0],
    [0x010000, 1],
    [0x650000, 2],
    [0xff9898, 2],
    [0xfffefe, 3],
    [0x010101, 1],
    [0x323232, 1],
    [0x333333, 2],
    [0xcbcbcb, 2],
    [0xcccccc, 3],
    [0xfefefe, 3],
    [0xffffff, 4],
    [0xff0000, 2],
  ] as const)
    expect(ComplexColor.getIndexForLuminance(new Color(rgb))).toBe(index);
  const a = ComplexColor.create(Theme.Accent2, new Color(0), 5);
  expect(a.getThemeColorType()).toBe(Theme.Accent2);
  expect(a.getTransformations()).toEqual([
    new Transformation(T.LumMod, 9500),
    new Transformation(T.LumOff, 500),
  ]);
  expect(a.getFinalColor().toUInt32()).toBe(0);
});
