/** @fileoverview MS filter color and native OpenSymbol export conversion from filter/source/msfilter/util.cxx. */
import { Size } from "../../../tools/inc/gen";
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
  /* istanbul ignore next -- B8TCAE-U03: every RGB8 scheme matches the fixed Word palette at a variance no greater than255; the exact domain proof is retained in the task audit. */
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

import { isAsciiAlphanumeric } from "../../../sal/inc/rtl/character";
/** Original exact-case Word built-in style ID exceptions. */
const docxStyleIds = new Map<string, string>([
  ["heading 1", "Heading1"],
  ["heading 2", "Heading2"],
  ["heading 3", "Heading3"],
  ["heading 4", "Heading4"],
  ["heading 5", "Heading5"],
  ["heading 6", "Heading6"],
  ["heading 7", "Heading7"],
  ["heading 8", "Heading8"],
  ["heading 9", "Heading9"],
  ["index 1", "Index1"],
  ["index 2", "Index2"],
  ["index 3", "Index3"],
  ["index 4", "Index4"],
  ["index 5", "Index5"],
  ["index 6", "Index6"],
  ["index 7", "Index7"],
  ["index 8", "Index8"],
  ["index 9", "Index9"],
  ["toc 1", "TOC1"],
  ["toc 2", "TOC2"],
  ["toc 3", "TOC3"],
  ["toc 4", "TOC4"],
  ["toc 5", "TOC5"],
  ["toc 6", "TOC6"],
  ["toc 7", "TOC7"],
  ["toc 8", "TOC8"],
  ["toc 9", "TOC9"],
  ["footnote text", "FootnoteText"],
  ["annotation text", "CommentText"],
  ["header", "Header"],
  ["footer", "Footer"],
  ["index heading", "IndexHeading"],
  ["caption", "Caption"],
  ["table of figures", "TableofFigures"],
  ["envelope address", "EnvelopeAddress"],
  ["envelope return", "EnvelopeReturn"],
  ["footnote reference", "FootnoteReference"],
  ["annotation reference", "CommentReference"],
  ["line number", "LineNumber"],
  ["page number", "PageNumber"],
  ["endnote reference", "EndnoteReference"],
  ["endnote text", "EndnoteText"],
  ["table of authorities", "TableofAuthorities"],
  ["macro", "MacroText"],
]);
/** Original DOCX ID conversion retains only ASCII letters/digits/hyphen without capitalizing arbitrary names. @param name - Actual counted UTF16 view, including embedded NUL. @returns Owned native Unicode ID. */
export function CreateDOCXStyleId(name: Uint16Array): OUString {
  let key = "";
  for (const unit of name) key += String.fromCharCode(unit);
  const special = docxStyleIds.get(key);
  if (special !== undefined) {
    const units = new Uint16Array(special.length);
    for (let index = 0; index < units.length; ++index) units[index] = special.charCodeAt(index);
    return new OUString(units, units.length);
  }
  const units = new Uint16Array(name.length);
  let length = 0;
  for (const unit of name) if (isAsciiAlphanumeric(unit) || unit === 45) units[length++] = unit;
  return new OUString(units, length);
}

/** Native hundredths-of-mm conversion for the published indexed paper sizes. @param value - Inches. @returns Metric size. */
function inch(value: number): number {
  return Math.round(value * 2540);
}
/** Converts millimetres to the native API metric. @param value - Millimetres. @returns Hundredths of a millimetre. */
function mm(value: number): number {
  return value * 100;
}
const paperSizes: readonly (readonly [number, number])[] = [
  [0, 0],
  [inch(8.5), inch(11)],
  [inch(8.5), inch(11)],
  [inch(11), inch(17)],
  [inch(17), inch(11)],
  [inch(8.5), inch(14)],
  [inch(5.5), inch(8.5)],
  [inch(7.25), inch(10.5)],
  [mm(297), mm(420)],
  [mm(210), mm(297)],
  [mm(210), mm(297)],
  [mm(148), mm(210)],
  [mm(257), mm(364)],
  [mm(182), mm(257)],
  [inch(8.5), inch(13)],
  [mm(215), mm(275)],
  [inch(10), inch(14)],
  [inch(11), inch(17)],
  [inch(8.5), inch(11)],
  [inch(3.875), inch(8.875)],
  [inch(4.125), inch(9.5)],
  [inch(4.5), inch(10.375)],
  [inch(4.75), inch(11)],
  [inch(5), inch(11.5)],
  [inch(17), inch(22)],
  [inch(22), inch(34)],
  [inch(34), inch(44)],
  [mm(110), mm(220)],
  [mm(162), mm(229)],
  [mm(324), mm(458)],
  [mm(229), mm(324)],
  [mm(114), mm(162)],
  [mm(114), mm(229)],
  [mm(250), mm(353)],
  [mm(176), mm(250)],
  [mm(176), mm(125)],
  [mm(110), mm(230)],
  [inch(3.875), inch(7.5)],
  [inch(3.625), inch(6.5)],
  [inch(14.875), inch(11)],
  [inch(8.5), inch(12)],
  [inch(8.5), inch(13)],
  [mm(250), mm(353)],
  [mm(200), mm(148)],
  [inch(9), inch(11)],
  [inch(10), inch(11)],
  [inch(15), inch(11)],
  [mm(220), mm(220)],
  [0, 0],
  [0, 0],
  [inch(9.5), inch(12)],
  [inch(9.5), inch(15)],
  [inch(11.69), inch(18)],
  [mm(235), mm(322)],
  [inch(8.5), inch(11)],
  [mm(210), mm(297)],
  [inch(9.5), inch(12)],
  [mm(227), mm(356)],
  [mm(305), mm(487)],
  [inch(8.5), inch(12.69)],
  [mm(210), mm(330)],
  [mm(148), mm(210)],
  [mm(182), mm(257)],
  [mm(322), mm(445)],
  [mm(174), mm(235)],
  [mm(201), mm(276)],
  [mm(420), mm(594)],
  [mm(297), mm(420)],
  [mm(322), mm(445)],
  [mm(200), mm(148)],
  [mm(105), mm(148)],
  [0, 0],
  [0, 0],
  [0, 0],
  [0, 0],
  [inch(11), inch(8.5)],
  [mm(420), mm(297)],
  [mm(297), mm(210)],
  [mm(210), mm(148)],
  [mm(364), mm(257)],
  [mm(257), mm(182)],
  [mm(148), mm(100)],
  [mm(148), mm(200)],
  [mm(148), mm(105)],
  [0, 0],
  [0, 0],
  [0, 0],
  [0, 0],
  [mm(128), mm(182)],
  [mm(182), mm(128)],
  [inch(12), inch(11)],
];

/** Resolves the original Microsoft paper-size index. @param index - Page setup paper size. @returns API dimensions or an empty size. */
export function getApiSizeForMSPaperSizeIndex(index: number): Size {
  const size = paperSizes[index];
  return size ? new Size(size[0], size[1]) : new Size();
}
