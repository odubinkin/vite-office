/** @fileoverview Native theme color indices and usage from ThemeColorType.hxx. */
/** Original theme palette offsets. */
export enum ThemeColorType {
  Unknown = -1,
  Dark1,
  Light1,
  Dark2,
  Light2,
  Accent1,
  Accent2,
  Accent3,
  Accent4,
  Accent5,
  Accent6,
  Hyperlink,
  FollowedHyperlink,
  LAST = 11,
}
/** Original theme usage roles. */
export enum ThemeColorUsage {
  Unknown = 0,
  Text = 1,
  Background = 2,
}
/** Original range-checked theme index conversion. @param index - Native signed32 index. @returns Native theme type or Unknown. */
export function convertToThemeColorType(index: number): ThemeColorType {
  if (index < 0 || index > 11) return ThemeColorType.Unknown;
  return index as ThemeColorType;
}
