/** @fileoverview Original linguistic scalar constants and control predicate from include/svl/lngmisc.hxx. */
/** Native sal_Unicode parameter conversion and source less-than-space predicate, deliberately excluding DEL and C1. @param character - Native code unit argument. @returns Control flag. */
export function IsControlChar(character: number): boolean {
  return (character & 0xffff) < 32;
}

/** Original linguistic soft-hyphen sal_Unicode macro. */
export const SVT_SOFT_HYPHEN = 0x00ad;
/** Original linguistic hard-hyphen sal_Unicode macro. */
export const SVT_HARD_HYPHEN = 0x2011;
/** Original linguistic hard-space sal_Unicode macro. */
export const SVT_HARD_SPACE = 0x00a0;
