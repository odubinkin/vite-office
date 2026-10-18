/** @fileoverview Original logical Color header values, channels and Any operators; advanced color spaces and strings remain unported. */
import { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import {
  GetWCAGLuminance,
  IsDark,
  IncreaseLuminance,
  DecreaseLuminance,
  DecreaseContrast,
} from "../source/generic/color";
/** Original transparency tag enum. */
export enum ColorTransparencyTag {
  ColorTransparency = 0,
}
/** Original alpha tag enum. */
export enum ColorAlphaTag {
  ColorAlpha = 0,
}
/** Original unscoped transparency tag value. */
export const ColorTransparency = ColorTransparencyTag.ColorTransparency;
/** Original unscoped alpha tag value. */
export const ColorAlpha = ColorAlphaTag.ColorAlpha;
/** Original erased enum type family, required to distinguish the two numeric0tag overloads in JS. */
type TagFamily = "ColorTransparencyTag" | "ColorAlphaTag";
/** Original channel merge arithmetic. @param dst - Destination byte. @param src - Source byte. @param transparency - Source transparency byte. @returns Merged byte. */
export function ColorChannelMerge(dst: number, src: number, transparency: number): number {
  return (((dst - src) * transparency + ((src << 8) | dst)) >> 8) & 255;
}
/** One ordinary unsigned32 logical value; no union byte buffer, endian storage, native allocator or memory engine. */
export class Color {
  private mValue = 0;
  /** Original default/copy/opaque/RGB/tagged forms. Trailing family selects only erased native tag type; original tag numeric value is preserved. @param args - Original selected form plus explicit erased tag family when needed. @returns Color value. */
  constructor(
    ...args:
      | []
      | [source: Readonly<Color>]
      | [rgb: number]
      | [r: number, g: number, b: number]
      | [tag: ColorTransparencyTag | ColorAlphaTag, packed: number, family: TagFamily]
      | [
          tag: ColorTransparencyTag | ColorAlphaTag,
          channel: number,
          r: number,
          g: number,
          b: number,
          family: TagFamily,
        ]
  ) {
    if (args.length === 0) return;
    if (args.length === 1) {
      const source = args[0];
      if (typeof source !== "number") {
        this.mValue = source.toUInt32();
        return;
      }
      if (!Number.isInteger(source) || source < 0 || source > 0xffffff)
        throw new Error("Color opaque value is outside RGB24.");
      this.mValue = source;
      return;
    }
    if (args.length === 3 && typeof args[2] === "number") {
      this.mValue = pack(0, args[0], args[1], args[2]);
      return;
    }
    const family = args[args.length - 1] as TagFamily;
    const packed =
      args.length === 3 ? args[1] >>> 0 : pack(args[1], args[2] as number, args[3], args[4]);
    this.mValue =
      family === "ColorAlphaTag"
        ? ((packed & 0xffffff) | ((255 - (packed >>> 24)) << 24)) >>> 0
        : packed;
  }
  /** Original implicit copy assignment. @param source - Actual value. @returns Recipient. */
  public assign(source: Readonly<Color>): this {
    this.mValue = source.toUInt32();
    return this;
  }
  /** Original unsigned32 cast. @returns Logical packed value. */
  public toUInt32(): number {
    return this.mValue;
  }
  /** Original signed32 cast for UNO transport. @returns Signed value. */
  public toInt32(): number {
    return this.mValue | 0;
  }
  /** Original red byte. @returns Red. */
  public GetRed(): number {
    return (this.mValue >>> 16) & 255;
  }
  /** Original green byte. @returns Green. */
  public GetGreen(): number {
    return (this.mValue >>> 8) & 255;
  }
  /** Original blue byte. @returns Blue. */
  public GetBlue(): number {
    return this.mValue & 255;
  }
  /** Original alpha is255minusstoredtransparency. @returns Alpha. */
  public GetAlpha(): number {
    return 255 - (this.mValue >>> 24);
  }
  /** Original any-transparency predicate. @returns Alpha differs255. */
  public IsTransparent(): boolean {
    return this.GetAlpha() !== 255;
  }
  /** Original full-transparency predicate. @returns Alpha0. */
  public IsFullyTransparent(): boolean {
    return this.GetAlpha() === 0;
  }
  /** Original red assignment preserves other channels. @param value - Native byte. @returns Nothing. */
  public SetRed(value: number): void {
    this.mValue = ((this.mValue & 0xff00ffff) | ((value & 255) << 16)) >>> 0;
  }
  /** Original green assignment. @param value - Native byte. @returns Nothing. */
  public SetGreen(value: number): void {
    this.mValue = ((this.mValue & 0xffff00ff) | ((value & 255) << 8)) >>> 0;
  }
  /** Original blue assignment. @param value - Native byte. @returns Nothing. */
  public SetBlue(value: number): void {
    this.mValue = ((this.mValue & 0xffffff00) | (value & 255)) >>> 0;
  }
  /** Original alpha assignment converts to transparency. @param value - Native alpha byte. @returns Nothing. */
  public SetAlpha(value: number): void {
    this.mValue = ((this.mValue & 0xffffff) | ((255 - (value & 255)) << 24)) >>> 0;
  }
  /** Original opaque RGB copy. @returns Independent value. */
  public GetRGBColor(): Color {
    return new Color(this.GetRed(), this.GetGreen(), this.GetBlue());
  }
  /** Original RGB comparison ignores transparency. @param other - Actual color. @returns RGB equality. */
  public IsRGBEqual(other: Readonly<Color>): boolean {
    return (this.mValue & 0xffffff) === (other.toUInt32() & 0xffffff);
  }
  /** Original unsigned value ordering. @param other - Actual color. @returns Less than. */
  public lessThan(other: Readonly<Color>): boolean {
    return this.mValue < other.toUInt32();
  }
  /** Original unsigned value ordering. @param other - Actual color. @returns Greater than. */
  public greaterThan(other: Readonly<Color>): boolean {
    return this.mValue > other.toUInt32();
  }
  /** Original full value equality. @param other - Actual color. @returns Equality. */
  public equals(other: Readonly<Color>): boolean {
    return this.mValue === other.toUInt32();
  }
  /** Original RGB absolute error sum. @param other - Actual color. @returns Error0..765. */
  public GetColorError(other: Readonly<Color>): number {
    return (
      Math.abs(this.GetBlue() - other.GetBlue()) +
      Math.abs(this.GetGreen() - other.GetGreen()) +
      Math.abs(this.GetRed() - other.GetRed())
    );
  }
  /** Original integer weighted luminance. @returns Luminance byte. */
  public GetLuminance(): number {
    return (this.GetBlue() * 29 + this.GetGreen() * 151 + this.GetRed() * 76) >> 8;
  }
  /** Original source-owned WCAG luminance. @returns Byte. */
  public GetWCAGLuminance(): number {
    return GetWCAGLuminance(this);
  }
  /** Original packed default-shape exception and WCAG threshold. @returns Dark predicate. */
  public IsDark(): boolean {
    return IsDark(this);
  }
  /** Original inverse dark predicate. @returns Bright predicate. */
  public IsBright(): boolean {
    return !this.IsDark();
  }
  /** Original source-owned saturation of channel increase. @param value - Native byte. @returns Nothing. */
  public IncreaseLuminance(value: number): void {
    IncreaseLuminance(this, value & 255);
  }
  /** Original source-owned channel decrease. @param value - Native byte. @returns Nothing. */
  public DecreaseLuminance(value: number): void {
    DecreaseLuminance(this, value & 255);
  }
  /** Original source-owned contrast change. @param value - Native byte. @returns Nothing. */
  public DecreaseContrast(value: number): void {
    DecreaseContrast(this, value & 255);
  }
  /** Original RGB inversion retains alpha. @returns Nothing. */
  public Invert(): void {
    this.SetRed(~this.GetRed());
    this.SetGreen(~this.GetGreen());
    this.SetBlue(~this.GetBlue());
  }
  /** Original RGB merge retains destinationalpha. @param other - Merge RGB value. @param transparency - Source transparency byte. @returns Nothing. */
  public Merge(other: Readonly<Color>, transparency: number): void {
    transparency &= 255;
    this.SetRed(ColorChannelMerge(this.GetRed(), other.GetRed(), transparency));
    this.SetGreen(ColorChannelMerge(this.GetGreen(), other.GetGreen(), transparency));
    this.SetBlue(ColorChannelMerge(this.GetBlue(), other.GetBlue(), transparency));
  }
}
/** Original channel assembly with declared native unsigned8 casts. @param t - Transparency. @param r - Red. @param g - Green. @param b - Blue. @returns Unsigned32 value. */
function pack(t: number, r: number, g: number, b: number): number {
  return ((b & 255) | ((g & 255) << 8) | ((r & 255) << 16) | ((t & 255) << 24)) >>> 0;
}
/** Original Any extraction operator; failed extraction leaves destinationunchanged. @param input - Actual Any. @param value - Actual mutable destination. @returns Native success. */
export function extractColor(input: Any, value: Color): boolean {
  const out: [number] = [0];
  if (!input.extract(out, "sal_Int32")) return false;
  value.assign(new Color(ColorTransparency, out[0], "ColorTransparencyTag"));
  return true;
}
/** Original Any insertion operator in its Tools owner. @param output - Actual Any. @param value - Actual color. @returns Nothing. */
export function insertColor(output: Any, value: Readonly<Color>): void {
  output.insert([value.toInt32()], "sal_Int32");
}
/** Original Any(Color const&) specialization, explicitly selecting the erasedC++constructor. @param value - Actual color. @returns Actual Any. */
export function ColorToAny(value: Readonly<Color>): Any {
  return new Any([value.toInt32()], "sal_Int32");
}
/** Original fully transparent white sentinel. */
export const COL_TRANSPARENT = Object.freeze(
  new Color(ColorTransparency, 255, 255, 255, 255, "ColorTransparencyTag"),
);
/** Original automatic-color sentinel, same logical value as transparentwhite. */
export const COL_AUTO = Object.freeze(
  new Color(ColorTransparency, 255, 255, 255, 255, "ColorTransparencyTag"),
);
/** Original separate alpha-channel transparent value. */
export const COL_ALPHA_TRANSPARENT = Object.freeze(new Color(0, 0, 0));
/** Original separate alpha-channel opaque value. */
export const COL_ALPHA_OPAQUE = Object.freeze(new Color(255, 255, 255));
/** Original black. */
export const COL_BLACK = Object.freeze(new Color(0, 0, 0));
/** Original blue. */
export const COL_BLUE = Object.freeze(new Color(0, 0, 128));
/** Original green. */
export const COL_GREEN = Object.freeze(new Color(0, 128, 0));
/** Original cyan. */
export const COL_CYAN = Object.freeze(new Color(0, 128, 128));
/** Original red. */
export const COL_RED = Object.freeze(new Color(128, 0, 0));
/** Original magenta. */
export const COL_MAGENTA = Object.freeze(new Color(128, 0, 128));
/** Original brown. */
export const COL_BROWN = Object.freeze(new Color(128, 128, 0));
/** Original gray. */
export const COL_GRAY = Object.freeze(new Color(128, 128, 128));
/** Original gray3. */
export const COL_GRAY3 = Object.freeze(new Color(204, 204, 204));
/** Original gray7. */
export const COL_GRAY7 = Object.freeze(new Color(102, 102, 102));
/** Original lightgray. */
export const COL_LIGHTGRAY = Object.freeze(new Color(192, 192, 192));
/** Original lightblue. */
export const COL_LIGHTBLUE = Object.freeze(new Color(0, 0, 255));
/** Original lightgreen. */
export const COL_LIGHTGREEN = Object.freeze(new Color(0, 255, 0));
/** Original lightcyan. */
export const COL_LIGHTCYAN = Object.freeze(new Color(0, 255, 255));
/** Original lightred. */
export const COL_LIGHTRED = Object.freeze(new Color(255, 0, 0));
/** Original lightmagenta. */
export const COL_LIGHTMAGENTA = Object.freeze(new Color(255, 0, 255));
/** Original lightgrayblue. */
export const COL_LIGHTGRAYBLUE = Object.freeze(new Color(224, 224, 255));
/** Original yellow. */
export const COL_YELLOW = Object.freeze(new Color(255, 255, 0));
/** Original white. */
export const COL_WHITE = Object.freeze(new Color(255, 255, 255));
/** Original inserted author table color. */
export const COL_AUTHOR_TABLE_INS = Object.freeze(new Color(225, 242, 250));
/** Original deleted author table color. */
export const COL_AUTHOR_TABLE_DEL = Object.freeze(new Color(252, 230, 244));
