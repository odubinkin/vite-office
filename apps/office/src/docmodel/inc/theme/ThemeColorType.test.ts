/** @fileoverview Verifies every native theme index and range boundary. */
import { expect, it } from "vitest";
import { ThemeColorType, ThemeColorUsage, convertToThemeColorType } from "./ThemeColorType";
it("retains all original indices, aliases and usage roles", /** Checks literal native identifiers. @returns Nothing. */ () => {
  expect([
    ThemeColorType.Unknown,
    ThemeColorType.Dark1,
    ThemeColorType.Light1,
    ThemeColorType.Dark2,
    ThemeColorType.Light2,
    ThemeColorType.Accent1,
    ThemeColorType.Accent2,
    ThemeColorType.Accent3,
    ThemeColorType.Accent4,
    ThemeColorType.Accent5,
    ThemeColorType.Accent6,
    ThemeColorType.Hyperlink,
    ThemeColorType.FollowedHyperlink,
    ThemeColorType.LAST,
  ]).toEqual([-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 11]);
  expect([ThemeColorUsage.Unknown, ThemeColorUsage.Text, ThemeColorUsage.Background]).toEqual([
    0, 1, 2,
  ]);
  for (let i = 0; i < 12; i++) expect(convertToThemeColorType(i)).toBe(i);
  expect(convertToThemeColorType(-1)).toBe(-1);
  expect(convertToThemeColorType(12)).toBe(-1);
});
