/** @fileoverview Consumed SwDefBulletConfig fields from number.cxx over the pinned shipped Writer configuration, without a fake ConfigItem service. */
import { Font, type ConstFont } from "../../../../vcl/source/font/font";
import { FontWeight, FontItalic } from "../../../../tools/inc/fontenum";
import { Size } from "../../../../tools/inc/gen";
import { RTL_TEXTENCODING_SYMBOL } from "../../../../sal/inc/rtl/textenc";
import data from "./number-bullet-data.json";
let font: ConstFont | undefined;
/** Source shipped configuration has no user-set family when its property is void. @returns Native flag. */
export function IsDefBulletFontUserDefined(): boolean {
  return data.values[0] !== null;
}
/** Source constructor default followed by shipped-property override. @returns Family. */
export function GetDefBulletFontname(): string {
  return data.values[0] === null ? data.family : String(data.values[0]);
}
/** Lazily materializes native InitFont fields using the actual VCL value owner. Runtime user ConfigItem subscription is outside this shipped-resource binding. @returns Const font. */
export function GetDefBulletFont(): ConstFont {
  if (font === undefined) {
    const value = new Font();
    value.SetFamilyName(GetDefBulletFontname());
    value.SetFontSize(new Size(0, data.height));
    value.SetWeight(
      (data.values[1] === null ? FontWeight.WEIGHT_DONTKNOW : data.values[1]) as FontWeight,
    );
    value.SetItalic(
      (data.values[2] === null ? FontItalic.ITALIC_NONE : data.values[2]) as FontItalic,
    );
    value.SetCharSet(RTL_TEXTENCODING_SYMBOL);
    font = Object.freeze(value);
  }
  return font;
}
/** Reads source default level glyphs after the shipped-resource overlay. @param level - Native valid level. @returns Glyph. */
export function GetBulletChar(level: number): number {
  level = Math.min(9, level & 0xff);
  return (data.values[level + 3] ?? data.characters[level]) as number;
}
