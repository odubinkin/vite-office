/** @fileoverview Native XlsColor, ExcelGraphicHelper and ColorPalette responsibilities from stylesbuffer.cxx. */
import type { SaxesAttributeNS } from "saxes";
import { ComplexColor } from "../../../../docmodel/inc/color/ComplexColor";
import { Transformation, TransformationType } from "../../../../docmodel/inc/color/Transformation";
import type { ColorSet } from "../../../../docmodel/inc/theme/ColorSet";
import {
  convertToThemeColorType,
  ThemeColorType,
} from "../../../../docmodel/inc/theme/ThemeColorType";
import { applyExcelTint } from "../../../../oox/source/drawingml/color";
import { getSystemColor } from "../../../../oox/source/helper/graphichelper";
import { Color, COL_TRANSPARENT, COL_WHITE } from "../../../../tools/inc/color";

const ega = [0x000000, 0xffffff, 0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
const palette = [
  ...ega,
  ...ega,
  0x800000,
  0x008000,
  0x000080,
  0x808000,
  0x800080,
  0x008080,
  0xc0c0c0,
  0x808080,
  0x9999ff,
  0x993366,
  0xffffcc,
  0xccffff,
  0x660066,
  0xff8080,
  0x0066cc,
  0xccccff,
  0x000080,
  0xff00ff,
  0xffff00,
  0x00ffff,
  0x800080,
  0x800000,
  0x008080,
  0x0000ff,
  0x00ccff,
  0xccffff,
  0xccffcc,
  0xffff99,
  0x99ccff,
  0xff99cc,
  0xcc99ff,
  0xffcc99,
  0x3366ff,
  0x33cccc,
  0x99cc00,
  0xffcc00,
  0xff9900,
  0xff6600,
  0x666699,
  0x969696,
  0x003366,
  0x339966,
  0x003300,
  0x333300,
  0x993300,
  0x993366,
  0x333399,
  0x333333,
];
const systemPalette = new Map([
  [64, "windowText"],
  [65, "window"],
  [67, "btnFace"],
  [77, "windowText"],
  [78, "window"],
  [79, "windowText"],
  [80, "infoBk"],
  [81, "infoText"],
]);
const excelThemes = [1, 0, 3, 2, 4, 5, 6, 7, 8, 9, 10, 11];

/** Original package color resolver used by both file styles and rich text portions. */
export class ExcelGraphicHelper {
  private readonly overrides: Color[] = [];

  /** Binds the workbook theme palette. @param colors - Colors read before the workbook styles. @returns Color resolver. */
  constructor(private readonly colors?: ColorSet) {}

  /** Original indexedColors entries replace default indices from zero. @param rgb - OOXML hexadecimal scalar. @returns Nothing. */
  appendColor(rgb: string): void {
    this.overrides.push(parseRgb(rgb) ?? new Color(COL_WHITE));
  }

  /** Resolves the installed theme slot. @param type - Native theme index. @returns Borrowed RGB or absence. */
  getSchemeColor(type: ThemeColorType): Readonly<Color> | undefined {
    return this.colors?.findColor(type);
  }

  /** Resolves explicit workbook overrides, the standard palette and system role colors. @param index - Excel palette index. @returns RGB or absence. */
  getPaletteColor(index: number): Readonly<Color> | undefined {
    const override = this.overrides[index];
    if (override) return override;
    const defaultColor = palette[index];
    if (defaultColor !== undefined) return new Color(defaultColor);
    return getSystemColor(systemPalette.get(index) ?? "");
  }
}

/** Reads the original packed value and ignores its transparency byte. @param rgb - ARGB value. @returns RGB or absence. */
function parseRgb(rgb: string): Color | undefined {
  return /^[\da-f]{1,8}$/i.test(rgb) ? new Color(Number.parseInt(rgb, 16) & 0xffffff) : undefined;
}

/** Parses an original signed decimal color index. @param value - Source value. @returns Index or invalid sentinel. */
function index(value: string): number {
  return /^-?\d+$/.test(value) ? Number(value) : -1;
}

/** The original indexed, theme, literal or placeholder color source. */
type ColorSource =
  | readonly ["theme", ThemeColorType]
  | readonly ["rgb", Color]
  | readonly ["indexed", number]
  | readonly ["auto"];

/** Original SpreadsheetML color value retaining the source and tint until workbook resolution. */
export class XlsColor {
  private source: ColorSource = ["auto"];
  private tint = 0;

  /** Original attribute presence precedence from Excel. @param attributes - Source attributes. @returns Parsed color. */
  static importColor(attributes: readonly SaxesAttributeNS[]): XlsColor {
    const values = new Map<string, string>();
    for (const item of attributes) if (!item.uri) values.set(item.local, item.value);
    const color = new XlsColor();
    const theme = values.get("theme");
    const rgb = values.get("rgb");
    const indexed = values.get("indexed");
    if (theme !== undefined)
      color.source = ["theme", convertToThemeColorType(excelThemes[index(theme)] ?? -1)];
    else if (rgb !== undefined) color.source = ["rgb", parseRgb(rgb) ?? new Color(COL_WHITE)];
    else if (indexed !== undefined) color.source = ["indexed", index(indexed)];
    const tint = Number(values.get("tint") ?? 0);
    if (Number.isFinite(tint)) color.tint = tint;
    return color;
  }

  /** Sets the native indexed color used for automatic border text. @param value - Palette index. @returns Nothing. */
  setIndexed(value: number): void {
    this.source = ["indexed", value];
    this.tint = 0;
  }

  /** Resolves the original native displayed color. @param helper - Workbook palette. @param automatic - Source caller’s automatic color. @returns Resolved RGB or automatic. */
  getColor(
    helper: ExcelGraphicHelper,
    automatic: Readonly<Color> = COL_TRANSPARENT,
  ): Readonly<Color> {
    const [kind, value] = this.source;
    const base =
      kind === "theme"
        ? helper.getSchemeColor(value)
        : kind === "rgb"
          ? value
          : kind === "indexed"
            ? helper.getPaletteColor(value)
            : undefined;
    if (!base) return automatic;
    return this.tint === 0 ? base : applyExcelTint(base, this.getTintAmount(), this.tint > 0);
  }

  /** Creates the native OOXML color metadata before its separate display resolution. @returns Complex color. */
  createComplexColor(): ComplexColor {
    const [kind, value] = this.source;
    const complex = kind === "rgb" ? ComplexColor.createRGB(value) : new ComplexColor();
    if (kind === "theme") complex.setThemeColor(value);
    if (kind !== "theme" && kind !== "rgb") return complex;
    const amount = this.getTintAmount();
    const modulation = Math.trunc((100_000 - amount) / 10);
    if (modulation !== 10_000)
      complex.addTransformation(new Transformation(TransformationType.LumMod, modulation));
    if (this.tint > 0 && amount >= 10)
      complex.addTransformation(
        new Transformation(TransformationType.LumOff, Math.trunc(amount / 10)),
      );
    return complex;
  }

  /** Quantizes XML tint to the original DrawingML percentage units. @returns Unsigned tint amount. */
  private getTintAmount(): number {
    return Math.min(100_000, Math.round(Math.abs(this.tint) * 100_000));
  }
}
