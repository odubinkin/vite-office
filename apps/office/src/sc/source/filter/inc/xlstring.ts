/** @fileoverview Original xlstring.hxx string flags, length/encoding constants and formatting-run values. */
export enum XclStrFlags {
  NONE = 0x0000,
  ForceUnicode = 0x0001,
  EightBitLength = 0x0002,
  SmartFlags = 0x0004,
  SeparateFormats = 0x0008,
  NoHeader = 0x0010,
}
export const EXC_STR_MAXLEN_8BIT = 0x00ff;
export const EXC_STR_MAXLEN = 0x7fff;
export const EXC_STRF_16BIT = 0x01;
export const EXC_STRF_FAREAST = 0x04;
export const EXC_STRF_RICH = 0x08;
export const EXC_STRF_UNKNOWN = 0xf2;
export const EXC_LF_C = 0x0a;
export const EXC_LF = EXC_LF_C;
export const EXC_NUL_C = 0;
export const EXC_NUL = EXC_NUL_C;
/** Original scalar formatting-run value. */
export class XclFormatRun {
  /** Original default/two-value constructors, narrowing native unsigned16 fields. @param mnChar - First character. @param mnFontIdx - Export font index. @returns Run. */
  constructor(
    public mnChar = 0,
    public mnFontIdx = 0,
  ) {
    this.mnChar &= 0xffff;
    this.mnFontIdx &= 0xffff;
  }
  /** Original field equality. @param other - Run. @returns Equality. */
  equals(other: Readonly<XclFormatRun>): boolean {
    return this.mnChar === other.mnChar && this.mnFontIdx === other.mnFontIdx;
  }
  /** Original lexicographic ordering. @param other - Run. @returns Less-than. */
  lessThan(other: Readonly<XclFormatRun>): boolean {
    return (
      this.mnChar < other.mnChar ||
      (this.mnChar === other.mnChar && this.mnFontIdx < other.mnFontIdx)
    );
  }
}
