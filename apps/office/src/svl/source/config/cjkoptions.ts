/** @fileoverview Calc's consumed Asian typography and vertical text eligibility from native CJK options. */

/** Reports the original desktop page eligibility. @returns Whether Asian typography is available. */
export function IsAsianTypographyEnabled(): boolean {
  return true;
}

/** Reports the pinned desktop vertical text eligibility after tdf#168719. @returns Whether vertical Asian text is available. */
export function IsVerticalTextEnabled(): boolean {
  return true;
}
