/** @fileoverview Owns the currently implemented vcl::Font family value and independent copy-on-write handles; other native font attributes remain unimplemented. */
const globalDefault = Object.freeze({ familyName: "" });
/** Const native font reference at the numbering-format boundary. */
export type ConstFont = Omit<Font, "SetFamilyName">;
/** The existing font-family slice of native vcl::Font. */
export class Font {
  private mpImplFont: Readonly<{ familyName: string }>;
  /** Shares the default or copied immutable font value. @param font - Optional source font. @returns Nothing. */
  public constructor(font?: ConstFont) {
    this.mpImplFont = font === undefined ? globalDefault : (font as Font).mpImplFont;
  }
  /** Reads the native family value. @returns Family name. */
  public GetFamilyName(): string {
    return this.mpImplFont.familyName;
  }
  /** Changes this handle only when the family differs. @param name - Family name. @returns Nothing. */
  public SetFamilyName(name: string): void {
    if (this.GetFamilyName() !== name) this.mpImplFont = Object.freeze({ familyName: name });
  }
  /** Compares the currently implemented family value; native size/style/metrics are not represented. @param other - Const font. @returns Family equality. */
  public Equals(other: ConstFont): boolean {
    return this.GetFamilyName() === other.GetFamilyName();
  }
}
