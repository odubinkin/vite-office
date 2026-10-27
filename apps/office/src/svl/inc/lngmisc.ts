/** @fileoverview Original linguistic scalar control predicate from include/svl/lngmisc.hxx. */
/** Native sal_Unicode parameter conversion and source less-than-space predicate, deliberately excluding DEL and C1. @param character - Native code unit argument. @returns Control flag. */
export function IsControlChar(character: number): boolean {
  return (character & 0xffff) < 32;
}
