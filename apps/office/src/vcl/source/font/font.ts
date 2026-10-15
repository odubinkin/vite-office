/** @fileoverview Native stored font identity metadata over immutable JS values; configuration lookup, size/rendering attributes and device resolution remain separate pending responsibilities. */
import { FontFamily, FontPitch } from "../../../tools/inc/fontenum";
import { RTL_TEXTENCODING_DONTKNOW, type rtl_TextEncoding } from "../../../sal/inc/rtl/textenc";

/** Represented ImplFont fields retain their original defaults; no native lifetime machinery. */
interface FontMetadata {
  readonly familyName: string;
  readonly styleName: string;
  readonly family: FontFamily;
  readonly pitch: FontPitch;
  readonly charSet: rtl_TextEncoding;
}
const globalDefault: Readonly<FontMetadata> = Object.freeze({
  familyName: "",
  styleName: "",
  family: FontFamily.FAMILY_DONTKNOW,
  pitch: FontPitch.PITCH_DONTKNOW,
  charSet: RTL_TEXTENCODING_DONTKNOW,
});
/** Const reference excludes every represented native mutator. */
export type ConstFont = Omit<
  Font,
  "SetFamilyName" | "SetStyleName" | "SetFamily" | "SetPitch" | "SetCharSet"
>;
/** Shared VCL value owner; unrepresented native attributes and MaybeAskConfig are not approximated. */
export class Font {
  private mpImplFont: Readonly<FontMetadata>;
  /** Shares immutable default/copied metadata until this handle changes. @param font - Optional source. @returns Nothing. */
  public constructor(font?: ConstFont) {
    this.mpImplFont = font === undefined ? globalDefault : (font as Font).mpImplFont;
  }
  /** Native const family name. @returns Family name. */
  public GetFamilyName(): string {
    return this.mpImplFont.familyName;
  }
  /** Native guarded assignment. @param name - Family name. @returns Nothing. */
  public SetFamilyName(name: string): void {
    if (this.GetFamilyName() !== name)
      this.mpImplFont = Object.freeze({ ...this.mpImplFont, familyName: name });
  }
  /** Native const style name. @returns Style name. */
  public GetStyleName(): string {
    return this.mpImplFont.styleName;
  }
  /** Native guarded style assignment. @param name - Style name. @returns Nothing. */
  public SetStyleName(name: string): void {
    if (this.GetStyleName() !== name)
      this.mpImplFont = Object.freeze({ ...this.mpImplFont, styleName: name });
  }
  /** Native stored family accessor; does not call AskConfig. @returns Family. */
  public GetFamilyType(): FontFamily {
    return this.mpImplFont.family;
  }
  /** Native const reference accessor of the same stored enum. @returns Family. */
  public GetFontFamily(): FontFamily {
    return this.mpImplFont.family;
  }
  /** Native guarded family assignment. @param family - Family. @returns Nothing. */
  public SetFamily(family: FontFamily): void {
    if (this.GetFamilyType() !== family)
      this.mpImplFont = Object.freeze({ ...this.mpImplFont, family });
  }
  /** Native stored pitch accessor; does not call AskConfig. @returns Pitch. */
  public GetPitch(): FontPitch {
    return this.mpImplFont.pitch;
  }
  /** Native guarded pitch assignment. @param pitch - Pitch. @returns Nothing. */
  public SetPitch(pitch: FontPitch): void {
    if (this.GetPitch() !== pitch) this.mpImplFont = Object.freeze({ ...this.mpImplFont, pitch });
  }
  /** Native stored encoding. @returns Encoding. */
  public GetCharSet(): rtl_TextEncoding {
    return this.mpImplFont.charSet;
  }
  /** Native guarded encoding assignment. @param charSet - Encoding. @returns Nothing. */
  public SetCharSet(charSet: rtl_TextEncoding): void {
    if (this.GetCharSet() !== charSet)
      this.mpImplFont = Object.freeze({ ...this.mpImplFont, charSet });
  }
  /** Native shared implementation identity, distinct from value equality. @param other - Font. @returns Shared identity. */
  public IsSameInstance(other: ConstFont): boolean {
    return this.mpImplFont === (other as Font).mpImplFont;
  }
  /** Native value equality for all represented metadata; wider rendering state remains unrepresented. @param other - Font. @returns Equality. */
  public Equals(other: ConstFont): boolean {
    return (
      this.GetFamilyType() === other.GetFamilyType() &&
      this.GetPitch() === other.GetPitch() &&
      this.GetCharSet() === other.GetCharSet() &&
      this.GetFamilyName() === other.GetFamilyName() &&
      this.GetStyleName() === other.GetStyleName()
    );
  }
}
