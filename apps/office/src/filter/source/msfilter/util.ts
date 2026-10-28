/** @fileoverview MS filter color and native OpenSymbol export conversion from filter/source/msfilter/util.cxx. */
import { OUString } from "../../../sal/inc/rtl/ustring";
import { Color, COL_AUTO } from "../../../tools/inc/color";

/** The sixteen fixed MS Word colors in their RTF index order. */
const WORD_COLORS = [
  0x000000, 0x0000ff, 0x00ffff, 0x00ff00, 0xff00ff, 0xff0000, 0xffff00, 0xffffff, 0x000080,
  0x008080, 0x008000, 0x800080, 0x800000, 0x808000, 0x808080, 0xc0c0c0,
] as const;

/** Calculates the source three-channel chromatic scheme at one variance.  @param color - Color. @param variance - Variance. @returns The readonly number[] result. */
function calculateScheme(color: Readonly<Color>, variance: number): readonly number[] {
  const red = color.GetRed(),
    green = color.GetGreen(),
    blue = color.GetBlue();
  return [
    1 + Number(red < green + variance) + Number(red < blue + variance),
    1 + Number(green < red + variance) + Number(green < blue + variance),
    1 + Number(blue < red + variance) + Number(blue < green + variance),
  ];
}

/** Source `msfilter::util::TransColToIco`: exact palette match, then scheme-aware nearest color.  @param color - Color. @returns The number result. */
export function TransColToIco(color: Readonly<Color>): number {
  if (color.toUInt32() === 0xffffffff) return 0;
  const exact = WORD_COLORS.indexOf(color.toUInt32() as (typeof WORD_COLORS)[number]);
  if (exact >= 0) return exact + 1;
  const palette = WORD_COLORS.map(
    /** Computes the value result. @param value - Value. @returns The computed result. */ (value) =>
      new Color(value),
  );
  for (let variance = 0; variance <= 255; variance++) {
    const sourceScheme = calculateScheme(color, variance);
    let best = -1,
      bestError = 65535;
    for (const [index, candidate] of palette.entries()) {
      const candidateScheme = calculateScheme(candidate, variance);
      if (
        !sourceScheme.every(
          /** Computes the value result. @param value - Value. @param channel - Channel. @returns The computed result. */ (
            value,
            channel,
          ) => value === candidateScheme[channel],
        )
      )
        continue;
      const error =
        Math.abs(color.GetRed() - candidate.GetRed()) +
        Math.abs(color.GetGreen() - candidate.GetGreen()) +
        Math.abs(color.GetBlue() - candidate.GetBlue());
      if (error < bestError) {
        best = index;
        bestError = error;
      }
    }
    if (best >= 0) return best + 1;
  }
  return 1;
}

/** Original six-uppercase-hex color serialization, with exact automatic-color sentinel handling. @param color - Original color. @returns Owned Unicode string. */
export function ConvertColorOU(color: Readonly<Color>): OUString {
  if (color.equals(COL_AUTO))
    return OUString.createFromAscii(new Uint8Array([97, 117, 116, 111, 0]));
  const digits = "0123456789ABCDEF",
    buffer = new Uint16Array(7),
    channels = [color.GetRed(), color.GetGreen(), color.GetBlue()];
  for (let index = 0; index < 3; ++index) {
    const value = channels[index] as number;
    buffer[index * 2] = digits.charCodeAt((value >> 4) & 15);
    buffer[index * 2 + 1] = digits.charCodeAt(value & 15);
  }
  return new OUString(buffer);
}

import { CreateStarSymbolToMSMultiFont } from "../../../unotools/source/misc/fontcvt";
import { GetNextFontToken } from "../../../unotools/inc/fontdefs";
import {
  RTL_TEXTENCODING_SYMBOL,
  RTL_TEXTENCODING_UCS2,
  type rtl_TextEncoding,
} from "../../../sal/inc/rtl/textenc";
/** Original in/out scalar bindings consumed by the MS symbol export helpers. */
export interface SymbolExportEncoding {
  value: rtl_TextEncoding;
}
/** Original family-name in/out binding. */
export interface SymbolExportFontName {
  value: string;
}
/** Original exact reverse-font match, standardized-Unicode fallback and private-area Wingdings fallback. @param character - Native UTF16 unit. @param encoding - Mutable charset. @param family - Mutable family name. @returns Native substituted unit. */
export function bestFitOpenSymbolToMSFont(
  character: number,
  encoding: SymbolExportEncoding,
  family: SymbolExportFontName,
): number {
  const value = { value: character & 0xffff };
  const converter = CreateStarSymbolToMSMultiFont();
  let font: string;
  try {
    font = converter.ConvertChar(value);
  } finally {
    converter.Dispose();
  }
  if (font.length !== 0) {
    value.value |= 0xf000;
    family.value = font;
    encoding.value = RTL_TEXTENCODING_SYMBOL;
  } else if (value.value < 0xe000 || value.value > 0xf8ff) {
    encoding.value = RTL_TEXTENCODING_UCS2;
    const units = new Uint16Array(family.value.length);
    for (let index = 0; index < units.length; ++index)
      units[index] = family.value.charCodeAt(index);
    family.value = String.fromCharCode(...GetNextFontToken(units, { value: 0 }));
  } else {
    family.value = "Wingdings";
    value.value = 0x6c;
  }
  return value.value;
}
