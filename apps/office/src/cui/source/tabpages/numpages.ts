/** @fileoverview Pinned English numbering presets used by the original CUI pick pages. */
import { SvxNumType as Type } from "../../../editeng/inc/svxenum";
import {
  SvxNumberFormat,
  type ConstSvxNumberFormat,
  type SvxNumRule,
} from "../../../editeng/inc/numitem";
import { Font } from "../../../vcl/source/font/font";

/** Common.xcs DefaultBullets in gallery order. */
export const defaultBullets = ["●", "○", "□", "►", "→", "-", "–", "✸"] as const;
/** LC_NumberingLevel from en_US.xml. */
export const orderedPresets = [
  [4, " ", ")"],
  [4, " ", "."],
  [4, "(", ")"],
  [2, " ", "."],
  [0, " ", ")"],
  [1, " ", ")"],
  [1, "(", ")"],
  [3, " ", "."],
] as const;
/** LC_OutLineNumberingLevel from en_US.xml. */
export const outlinePresets = [
  [
    [2, " ", ".", 32, "", 0],
    [0, " ", ".", 32, "", 0],
    [4, " ", ".", 32, "", 0],
    [1, " ", ".", 32, "", 0],
    [3, " ", ".", 32, "", 0],
    [6, " ", " ", 8226, "StarSymbol", 0],
  ],
  [
    [0, " ", ".", 32, "", 0],
    [4, " ", ".", 32, "", 0],
    [1, " ", ".", 32, "", 0],
    [4, " ", ".", 32, "", 0],
    [6, " ", ".", 8226, "StarSymbol", 0],
    [6, " ", " ", 8226, "StarSymbol", 0],
  ],
  [
    [4, " ", ".", 32, "", 0],
    [4, " ", ".", 32, "", 0],
    [4, " ", ".", 32, "", 0],
    [4, " ", ".", 32, "", 0],
    [4, " ", ".", 32, "", 0],
    [4, " ", " ", 32, "", 0],
  ],
  [
    [4, " ", ".", 32, "", 0],
    [4, " ", ".", 32, "", 1],
    [1, " ", ")", 32, "", 0],
    [6, " ", " ", 8226, "StarSymbol", 0],
    [6, " ", " ", 8226, "StarSymbol", 0],
    [6, " ", " ", 8226, "StarSymbol", 0],
  ],
  [
    [0, " ", ".", 32, "", 0],
    [2, " ", ".", 32, "", 0],
    [1, " ", ".", 32, "", 0],
    [3, " ", ".", 32, "", 0],
    [6, " ", " ", 8226, "StarSymbol", 0],
    [6, " ", " ", 8226, "StarSymbol", 0],
  ],
  [
    [4, " ", ")", 32, "", 0],
    [1, " ", ")", 32, "", 0],
    [4, " ", ")", 32, "", 0],
    [0, " ", ")", 32, "", 0],
    [6, " ", " ", 8226, "StarSymbol", 0],
    [6, " ", " ", 8226, "StarSymbol", 0],
  ],
  [
    [4, " ", " ", 32, "", 0],
    [4, " ", " ", 32, "", 1],
    [4, " ", " ", 32, "", 2],
    [4, " ", " ", 32, "", 3],
    [4, " ", " ", 32, "", 4],
    [4, " ", " ", 32, "", 5],
  ],
  [
    [6, " ", " ", 10146, "StarSymbol", 0],
    [6, " ", " ", 57350, "StarSymbol", 0],
    [6, " ", ")", 57348, "StarSymbol", 0],
    [6, " ", " ", 8226, "StarSymbol", 0],
    [6, " ", " ", 8226, "StarSymbol", 0],
    [6, " ", " ", 8226, "StarSymbol", 0],
  ],
] as const;

/** Applies the original unordered gallery item over the selected numbering rule. @param rule - Native editable rule. @param character - Configured gallery glyph. @param style - Writer bullet character style. @returns Nothing. */
export function applyBulletPreset(rule: SvxNumRule, character: string, style: string): void {
  const font = new Font();
  font.SetFamilyName("OpenSymbol");
  for (let index = 0; index < rule.GetLevelCount(); index++) {
    const level = new SvxNumberFormat(rule.GetLevel(index));
    level.SetNumberingType(Type.SVX_NUM_CHAR_SPECIAL);
    level.SetListFormat("", "", index);
    level.SetBulletChar(character.codePointAt(0) ?? 0);
    level.SetBulletFont(font);
    level.SetCharFormatName(style);
    level.SetBulletRelSize(45);
    rule.SetLevel(index, level);
  }
}

/** Applies a locale ordered numbering preset to every level. @param rule - Native editable rule. @param preset - Locale type and affixes. @returns Nothing. */
export function applyOrderedPreset(
  rule: SvxNumRule,
  [type, prefix, suffix]: (typeof orderedPresets)[number],
): void {
  for (let index = 0; index < rule.GetLevelCount(); index++) {
    const level = new SvxNumberFormat(rule.GetLevel(index));
    level.SetNumberingType(type);
    level.SetListFormat(prefix === " " ? "" : prefix, suffix, index);
    level.SetCharFormatName("");
    level.SetBulletRelSize(100);
    rule.SetLevel(index, level);
  }
}

/** Applies the native outline locale preset without changing indentation. @param rule - Native editable rule. @param preset - Source outline sequence. @param bulletStyle - Bullet character style. @param numberingStyle - Numeric character style. @returns Nothing. */
export function applyOutlinePreset(
  rule: SvxNumRule,
  preset: (typeof outlinePresets)[number],
  bulletStyle: string,
  numberingStyle: string,
): void {
  for (const [index, [type, prefix, suffix, glyph, family, parent]] of preset.entries()) {
    const level = new SvxNumberFormat(rule.GetLevel(index));
    level.SetNumberingType(type);
    if ((type as Type) === Type.SVX_NUM_CHAR_SPECIAL) {
      const font = new Font();
      font.SetFamilyName(family || "OpenSymbol");
      level.SetListFormat("", "", index);
      level.SetBulletChar(glyph);
      level.SetBulletFont(font);
      level.SetCharFormatName(bulletStyle);
      level.SetBulletRelSize(45);
    } else {
      level.SetIncludeUpperLevels(parent ? rule.GetLevelCount() : 1);
      level.SetListFormat(prefix, suffix, index);
      level.SetCharFormatName(numberingStyle);
      level.SetBulletRelSize(100);
    }
    rule.SetLevel(index, level);
  }
}

/** Reads a control value only when the selected levels agree with the first. @param levels - Nonempty selected native formats. @param read - Native field accessor. @returns Agreed value, or undefined for a mixed field. */
export function getUniformNumberingValue<T>(
  levels: readonly ConstSvxNumberFormat[],
  read: (format: ConstSvxNumberFormat) => T,
): T | undefined {
  const first = levels[0];
  if (!first) return undefined;
  const value = read(first);
  return levels.every(
    /** Compares one selected level to the first value. @param format - Selected format. @returns Whether the field agrees. */
    (format) => read(format) === value,
  )
    ? value
    : undefined;
}
