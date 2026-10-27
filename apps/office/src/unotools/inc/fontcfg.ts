/** @fileoverview Original font-substitution type flags and complete FontNameAttr value fields from unotools/fontcfg.hxx. */
import type { FontWeight, FontWidth } from "../../tools/inc/fontenum";
/** Source unsigned32 typed flags; bitwise results are normalized to unsigned32 at native storage boundaries. */
export enum ImplFontAttrs {
  None = 0x00000000,
  Default = 0x00000001, // Default-Font like Andale Sans UI, Palace Script, Albany, Thorndale, Cumberland, ...
  Standard = 0x00000002, // Standard-Font like Arial, Times, Courier, ...
  Normal = 0x00000004, // Normal Font for writing text like Arial, Verdana, Arial Narrow, Trebuchet, Times, Courier, ...
  Symbol = 0x00000008, // Font with symbols
  Fixed = 0x00000010,
  SansSerif = 0x00000020,
  Serif = 0x00000040,
  Decorative = 0x00000080, // Readable and normally used for drawings
  Special = 0x00000100, // Very special design
  Italic = 0x00000200,
  Titling = 0x00000400, // Only uppercase characters
  Capitals = 0x00000800, // Only uppercase characters, but lowercase characters smaller as the uppercase characters
  CJK = 0x00001000,
  CJK_JP = 0x00002000,
  CJK_SC = 0x00004000,
  CJK_TC = 0x00008000,
  CJK_KR = 0x00010000,
  CTL = 0x00020000,
  NoneLatin = 0x00040000,
  Full = 0x00080000, // Font with normally all characters
  Outline = 0x00100000,
  Shadow = 0x00200000,
  Rounded = 0x00400000,
  Typewriter = 0x00800000, // Like a typewriter: Courier, ...
  Script = 0x01000000, // Handwriting or Script
  Handwriting = 0x02000000, // More Handwriting with normal letters
  Chancery = 0x04000000, // Like Zapf Chancery
  Comic = 0x08000000, // Like Comic Sans MS
  BrushScript = 0x10000000, // More Script
  Gothic = 0x20000000,
  Schoolbook = 0x40000000,
  OtherStyle = 0x80000000, // OldStyle, ... so negative points
  CJK_AllLang = 0x1e000,
  AllScript = 0x1f000000,
  AllSubscript = 0x1e000000,
  AllSerifStyle = 0x7f300270,
}
/** Source configured substitution and classification fields; JS strings/vectors are the existing configuration resource binding. */
export interface FontNameAttr {
  readonly Name: string;
  readonly Substitutions: readonly string[];
  readonly MSSubstitutions: readonly string[];
  readonly Weight: FontWeight;
  readonly Width: FontWidth;
  readonly Type: ImplFontAttrs;
}
export { FontSubstConfiguration } from "../source/config/fontcfg";
