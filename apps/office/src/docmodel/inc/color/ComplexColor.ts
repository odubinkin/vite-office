/** @fileoverview Original ComplexColor value state; native source value bodies are co-located here, actual transform application remains unported without a fallback. */
import { Color, ColorTransparency } from "../../../tools/inc/color";
import { hash_combine } from "../../../o3tl/inc/hash_combine";
import { ThemeColorType, ThemeColorUsage } from "../theme/ThemeColorType";
import { Transformation, TransformationType } from "./Transformation";
/** Original representation identifiers. */
export enum ColorType {
  Unused,
  RGB,
  CRGB,
  HSL,
  Theme,
  Palette,
  System,
  Placeholder,
  Finalized,
}
/** Original system palette identifiers. */
export enum SystemColorType {
  Unused,
  DarkShadow3D,
  Light3D,
  ActiveBorder,
  ActiveCaption,
  AppWorkspace,
  Background,
  ButtonFace,
  ButtonHighlight,
  ButtonShadow,
  ButtonText,
  CaptionText,
  GradientActiveCaption,
  GradientInactiveCaption,
  GrayText,
  Highlight,
  HighlightText,
  HotLight,
  InactiveBorder,
  InactiveCaption,
  InactiveCaptionText,
  InfoBack,
  InfoText,
  Menu,
  MenuBar,
  MenuHighlight,
  MenuText,
  ScrollBar,
  Window,
  WindowFrame,
  WindowText,
}
/** Original multi-representation color state with independent value-owned components and transformations. */
export class ComplexColor {
  private meType = ColorType.Unused;
  private mnComponent1 = 0;
  private mnComponent2 = 0;
  private mnComponent3 = 0;
  private meSystemColorType = SystemColorType.Unused;
  private readonly maLastColor = new Color();
  private meThemeColorType = ThemeColorType.Unknown;
  private meThemeColorUsage = ThemeColorUsage.Unknown;
  private readonly maTransformations: Transformation[] = [];
  private readonly maFinalColor = new Color();
  /** Original default and implicit-copy construction. @param source - Optional actual source. @returns Complex color. */
  constructor(source?: Readonly<ComplexColor>) {
    if (source !== undefined) this.assign(source);
  }
  /** Original implicit value assignment; JS objects/arrays retain native owner identity. @param source - Actual source. @returns Recipient. */
  public assign(source: Readonly<ComplexColor>): this {
    const state = source as ComplexColor;
    this.meType = state.meType;
    this.mnComponent1 = state.mnComponent1;
    this.mnComponent2 = state.mnComponent2;
    this.mnComponent3 = state.mnComponent3;
    this.meSystemColorType = state.meSystemColorType;
    this.maLastColor.assign(state.maLastColor);
    this.meThemeColorType = state.meThemeColorType;
    this.meThemeColorUsage = state.meThemeColorUsage;
    this.setTransformations(state.maTransformations);
    this.maFinalColor.assign(state.maFinalColor);
    return this;
  }
  /** Reads native representation. @returns Type. */
  public getType(): ColorType {
    return this.meType;
  }
  /** Changes only native representation discriminator. @param type - Native type. @returns Nothing. */
  public setType(type: ColorType): void {
    this.meType = type;
  }
  /** Reads theme palette index. @returns Theme type. */
  public getThemeColorType(): ThemeColorType {
    return this.meThemeColorType;
  }
  /** Native theme validity requires both discriminator and known index. @returns Whether valid. */
  public isValidThemeType(): boolean {
    return this.meType === ColorType.Theme && this.meThemeColorType !== ThemeColorType.Unknown;
  }
  /** Original unused/system-unused predicate. @returns Whether used. */
  public isUsed(): boolean {
    return !(
      this.meType === ColorType.Unused ||
      (this.meType === ColorType.System && this.meSystemColorType === SystemColorType.Unused)
    );
  }
  /** Original conditional complete value assignment. @param source - Candidate value. @returns Nothing. */
  public assignIfUsed(source: Readonly<ComplexColor>): void {
    if (source.isUsed()) this.assign(source);
  }
  /** Reads native theme usage. @returns Usage. */
  public getThemeColorUsage(): ThemeColorUsage {
    return this.meThemeColorUsage;
  }
  /** Changes only usage. @param usage - Native role. @returns Nothing. */
  public setThemeColorUsage(usage: ThemeColorUsage): void {
    this.meThemeColorUsage = usage;
  }
  /** Reads system palette index. @returns Native type. */
  public getSystemColorType(): SystemColorType {
    return this.meSystemColorType;
  }
  /** Sets system index and representation, without changing last/final color. @param type - Native index. @returns Nothing. */
  public setSystemColorType(type: SystemColorType): void {
    this.meSystemColorType = type;
    this.meType = ColorType.System;
  }
  /** Original raw component-to-byte Color construction, independent of discriminator. @returns Opaque color value. */
  public getRGBColor(): Color {
    return new Color(this.mnComponent1, this.mnComponent2, this.mnComponent3);
  }
  /** Borrows the native const transformation vector. @returns Readonly sequence. */
  public getTransformations(): readonly Readonly<Transformation>[] {
    return this.maTransformations;
  }
  /** Copies original transformation vector values, including self-assignment. @param values - Actual values. @returns Nothing. */
  public setTransformations(values: readonly Readonly<Transformation>[]): void {
    const copies = values.map(
      /** Copies one native transformation value. @param value - Source value. @returns Independent transformation. */ (
        value,
      ) => new Transformation(value),
    );
    this.maTransformations.splice(0, this.maTransformations.length, ...copies);
  }
  /** Appends an independent transformation copy. @param value - Source value. @returns Nothing. */
  public addTransformation(value: Readonly<Transformation>): void {
    this.maTransformations.push(new Transformation(value));
  }
  /** Erases every matching transformation while preserving survivor order. @param type - Native type. @returns Nothing. */
  public removeTransformations(type: TransformationType): void {
    for (let i = this.maTransformations.length - 1; i >= 0; i--)
      if ((this.maTransformations[i] as Transformation).meType === type)
        this.maTransformations.splice(i, 1);
  }
  /** Clears native sequence. @returns Nothing. */
  public clearTransformations(): void {
    this.maTransformations.length = 0;
  }
  /** Reads first raw component. @returns Native component. */
  public getRed(): number {
    return this.mnComponent1;
  }
  /** Reads second raw component. @returns Native component. */
  public getGreen(): number {
    return this.mnComponent2;
  }
  /** Reads third raw component. @returns Native component. */
  public getBlue(): number {
    return this.mnComponent3;
  }
  /** Original CRGB state assignment, without implicit normalization or finalization. @param r - Signed32 component. @param g - Signed32 component. @param b - Signed32 component. @returns Nothing. */
  public setCRGB(r: number, g: number, b: number): void {
    this.mnComponent1 = r;
    this.mnComponent2 = g;
    this.mnComponent3 = b;
    this.meType = ColorType.CRGB;
  }
  /** Original by-value overload. @returns Independent Color. */
  public getRGB(): Color;
  /** Original double-reference overload. @param r - Output red cell. @param g - Output green cell. @param b - Output blue cell. @returns Nothing. */
  public getRGB(r: [number], g: [number], b: [number]): void;
  /** Original Color return form, or typed double output-reference form which writes only for RGB. @param args - Native optional output references. @returns Color or nothing. */
  public getRGB(...args: [] | [r: [number], g: [number], b: [number]]): Color | undefined {
    if (args.length === 0)
      return new Color(this.mnComponent1, this.mnComponent2, this.mnComponent3);
    if (this.meType !== ColorType.RGB) return;
    args[0][0] = this.mnComponent1;
    args[1][0] = this.mnComponent2;
    args[2][0] = this.mnComponent3;
  }
  /** Copies RGB components and actual final Color, retaining alpha in final only. @param color - Native Color. @returns Nothing. */
  public setColor(color: Readonly<Color>): void {
    this.mnComponent1 = color.GetRed();
    this.mnComponent2 = color.GetGreen();
    this.mnComponent3 = color.GetBlue();
    this.maFinalColor.assign(color);
    this.meType = ColorType.RGB;
  }
  /** Original signed32 packed transparency construction. @param rgb - Native signed32 transport. @returns Nothing. */
  public setRGB(rgb: number): void {
    this.setColor(new Color(ColorTransparency, rgb, "ColorTransparencyTag"));
  }
  /** Original raw HSL component assignment. @param h - Native hue. @param s - Native saturation. @param l - Native luminance. @returns Nothing. */
  public setHSL(h: number, s: number, l: number): void {
    this.mnComponent1 = h;
    this.mnComponent2 = s;
    this.mnComponent3 = l;
    this.meType = ColorType.HSL;
  }
  /** Original system-last-color assignment, without finalizing or clearing prior components. @param type - System index. @param rgb - Packed signed32 last color. @returns Nothing. */
  public setSystemColor(type: SystemColorType, rgb: number): void {
    this.maLastColor.assign(new Color(ColorTransparency, rgb, "ColorTransparencyTag"));
    this.meSystemColorType = type;
    this.meType = ColorType.System;
  }
  /** Original transparency scan recognizes an Alpha0 transformation only. @returns Whether transparent. */
  public isTransparent(): boolean {
    return this.maTransformations.some(
      /** Recognizes the native Alpha0 transformation only. @param t - Actual transformation. @returns Native predicate. */ (
        t,
      ) => t.meType === TransformationType.Alpha && t.mnValue === 0,
    );
  }
  /** Changes only representation to Placeholder. @returns Nothing. */
  public setThemePlaceholder(): void {
    this.meType = ColorType.Placeholder;
  }
  /** Changes theme type and representation only. @param type - Native theme index. @returns Nothing. */
  public setThemeColor(type: ThemeColorType): void {
    this.meThemeColorType = type;
    this.meType = ColorType.Theme;
  }
  /** Original comparison intentionally omits usage/final color. @param other - Candidate. @returns Native equality. */
  public equals(other: Readonly<ComplexColor>): boolean {
    const state = other as ComplexColor;
    return (
      this.meType === state.meType &&
      this.mnComponent1 === state.mnComponent1 &&
      this.mnComponent2 === state.mnComponent2 &&
      this.mnComponent3 === state.mnComponent3 &&
      this.meSystemColorType === state.meSystemColorType &&
      this.maLastColor.equals(state.maLastColor) &&
      this.meThemeColorType === state.meThemeColorType &&
      this.maTransformations.length === state.maTransformations.length &&
      this.maTransformations.every(
        /** Compares ordered vector entries after equal lengths. @param t - Actual transformation. @param i - Valid index. @returns Equality. */ (
          t,
          i,
        ) => t.equals(state.maTransformations[i] as Transformation),
      )
    );
  }
  /** Copies final color without changing representation or components. @param color - Native value. @returns Nothing. */
  public setFinalColor(color: Readonly<Color>): void {
    this.maFinalColor.assign(color);
  }
  /** Borrows native const final color. @returns Owned value. */
  public getFinalColor(): Readonly<Color> {
    return this.maFinalColor;
  }
  /** Original field sequence under existing browser32 logical integer hash binding; final participates and theme does not, as native source. Not an ABI std::hash<double> implementation. @returns Logical hash. */
  public getHash(): number {
    const seed: [number] = [0];
    for (const value of [
      this.meType,
      this.mnComponent1,
      this.mnComponent2,
      this.mnComponent3,
      this.meSystemColorType,
      this.maLastColor.toUInt32(),
    ])
      hash_combine(seed, value);
    for (const t of this.maTransformations) hash_combine(seed, t.getHash());
    hash_combine(seed, this.maFinalColor.toUInt32());
    return seed[0];
  }
  /** Original initialized RGB factory. @param color - Native value. @returns Independent complex color. */
  public static createRGB(color: Readonly<Color>): ComplexColor {
    const value = new ComplexColor();
    value.setColor(color);
    return value;
  }
  /** Original initialized theme factory. @param type - Theme index. @returns Complex color. */
  public static Theme(type: ThemeColorType): ComplexColor {
    const value = new ComplexColor();
    value.setThemeColor(type);
    return value;
  }
  /** Original five-row effect modulation table. @param index - Valid luminance row0..4. @param effect - Valid column0..5. @returns Original hundredth-percent value. */
  public static getLumMod(index: number, effect: number): number {
    return (
      [
        [10000, 5000, 6500, 7500, 8500, 9500],
        [10000, 1000, 2500, 5000, 7500, 9000],
        [10000, 2000, 4000, 6000, 7500, 5000],
        [10000, 9000, 7500, 5000, 2500, 1000],
        [10000, 9500, 8500, 7500, 6500, 5000],
      ][index] as number[]
    )[effect] as number;
  }
  /** Original five-row effect offset table, including500last entry in row0. @param index - Valid row. @param effect - Valid column. @returns Original value. */
  public static getLumOff(index: number, effect: number): number {
    return (
      [
        [0, 5000, 3500, 2500, 1500, 500],
        [0, 9000, 7500, 5000, 2500, 1000],
        [0, 8000, 6000, 4000, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
      ][index] as number[]
    )[effect] as number;
  }
  /** Original HSL luminance index via equivalent native JS extrema on normalized channels; unused hue/vector machinery is unnecessary. @param color - Actual Color. @returns Original row. */
  public static getIndexForLuminance(color: Readonly<Color>): number {
    const r = color.GetRed() / 255,
      g = color.GetGreen() / 255,
      b = color.GetBlue() / 255;
    const luminance = ((Math.max(Math.max(r, g), b) + Math.min(Math.min(r, g), b)) / 2) * 255;
    if (luminance < 0.5) return 0;
    if (luminance > 254.5) return 4;
    if (luminance < 50.5) return 1;
    if (luminance > 203.5) return 3;
    return 2;
  }
  /** Original theme effect factory with both transformations, even identity values. @param type - Theme index. @param color - Actual theme color. @param effect - Valid effect0..5. @returns Native defined state. */
  public static create(type: ThemeColorType, color: Readonly<Color>, effect: number): ComplexColor {
    const index = ComplexColor.getIndexForLuminance(color),
      value = ComplexColor.Theme(type);
    value.addTransformation(
      new Transformation(TransformationType.LumMod, ComplexColor.getLumMod(index, effect)),
    );
    value.addTransformation(
      new Transformation(TransformationType.LumOff, ComplexColor.getLumOff(index, effect)),
    );
    return value;
  }
}
