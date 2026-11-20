/** @fileoverview SpreadsheetML font, fill and XF records finalized into native Calc cell patterns. */
import type { Border } from "./stylesbuffer.border";
import { Protection } from "./stylesbuffer.protection";
import { SvxBrushItem } from "../../../../editeng/inc/brushitem";
import { SvxColorItem } from "../../../../editeng/inc/colritem";
import { SvxContourItem } from "../../../../editeng/inc/contouritem";
import { SvxCrossedOutItem } from "../../../../editeng/inc/crossedoutitem";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import { SvxLanguageItem } from "../../../../editeng/inc/langitem";
import { SvxUnderlineItem } from "../../../../editeng/inc/udlnitem";
import { SvxShadowedItem } from "../../../../editeng/inc/shdditem";
import * as EE from "../../../../editeng/inc/eeitem";
import { SvxEscapement } from "../../../../editeng/inc/svxenum";
import { SvxEscapementItem } from "../../../../editeng/source/items/textitem.escapement";
import {
  SvxFontHeightItem,
  SvxPostureItem,
  SvxWeightItem,
} from "../../../../editeng/source/items/textitem";
import { RTL_TEXTENCODING_DONTKNOW } from "../../../../sal/inc/rtl/textenc";
import { rtl_getTextEncodingFromWindowsCharset } from "../../../../sal/textenc/tencinfo";
import type { SfxPoolItem } from "../../../../svl/inc/poolitem";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxUInt32Item } from "../../../../svl/source/items/intitem";
import { COL_TRANSPARENT } from "../../../../tools/inc/color";
import {
  FontFamily,
  FontItalic,
  FontLineStyle,
  FontPitch,
  FontStrikeout,
  FontWeight,
} from "../../../../tools/inc/fontenum";
import { Alignment } from "./stylesbuffer.alignment";
import { UnitConverter } from "./unitconverter";
import type { ScDocument } from "../../../inc/document";
import { CellAttributeHolder, ScPatternAttr } from "../../../inc/patattr";
import * as Which from "../../../inc/scitems";
import { NumberFormatsBuffer } from "./numberformatsbuffer";
import { Font as VclFont } from "../../../../vcl/source/font/font";
import { convertTwipToMm100 } from "../../../../tools/inc/UnitConversion";
import { ExcelGraphicHelper, type XlsColor } from "./stylesbuffer.color";
import type { Dxf } from "./stylesbuffer.dxf";

const editFontWhich = new Map<number, readonly number[]>([
  [Which.ATTR_FONT, [EE.EE_CHAR_FONTINFO, EE.EE_CHAR_FONTINFO_CJK, EE.EE_CHAR_FONTINFO_CTL]],
  [Which.ATTR_FONT_WEIGHT, [EE.EE_CHAR_WEIGHT, EE.EE_CHAR_WEIGHT_CJK, EE.EE_CHAR_WEIGHT_CTL]],
  [Which.ATTR_FONT_POSTURE, [EE.EE_CHAR_ITALIC, EE.EE_CHAR_ITALIC_CJK, EE.EE_CHAR_ITALIC_CTL]],
  [Which.ATTR_FONT_COLOR, [EE.EE_CHAR_COLOR]],
  [Which.ATTR_FONT_UNDERLINE, [EE.EE_CHAR_UNDERLINE]],
  [Which.ATTR_FONT_CROSSEDOUT, [EE.EE_CHAR_STRIKEOUT]],
  [Which.ATTR_FONT_CONTOUR, [EE.EE_CHAR_OUTLINE]],
  [Which.ATTR_FONT_SHADOWED, [EE.EE_CHAR_SHADOW]],
]);

const fontFamilies = [
  FontFamily.FAMILY_DONTKNOW,
  FontFamily.FAMILY_ROMAN,
  FontFamily.FAMILY_SWISS,
  FontFamily.FAMILY_MODERN,
  FontFamily.FAMILY_SCRIPT,
  FontFamily.FAMILY_DECORATIVE,
] as const;

/** Reads an OOXML boolean attribute with the default chosen by its owner. @param value - XML spelling. @param fallback - Default when no recognized value is present. @returns Boolean value. */
export function readStyleBool(value: string, fallback: boolean): boolean {
  if (value === "1" || value === "true") return true;
  if (value === "0" || value === "false") return false;
  return fallback;
}

/** Original workbook font record. */
export class Font {
  private name = "Cambria";
  private family = 0;
  private charset = 1;
  private height = 220;
  private color: XlsColor | undefined;
  private bold = false;
  private italic = false;
  private underline = FontLineStyle.LINESTYLE_NONE;
  private strikeout = false;
  private outline = false;
  private shadow = false;
  private escapement = SvxEscapement.Off;

  /** Binds colors to the actual workbook helper. @param graphicHelper - Workbook color owner. @returns Font. */
  constructor(private readonly graphicHelper = new ExcelGraphicHelper()) {}

  /** Copies the workbook font model for an independent header/footer portion. @returns Mutable font copy. */
  clone(): Font {
    return Object.assign(new Font(this.graphicHelper), this);
  }

  /** Toggles an original worksheet header/footer font control. @param control - Excel character control. @returns Nothing. */
  toggleHeaderFooter(control: string): void {
    if (control === "B") this.bold = !this.bold;
    else if (control === "I") this.italic = !this.italic;
    else if (control === "S") this.strikeout = !this.strikeout;
    else if (control === "O") this.outline = !this.outline;
    else if (control === "H") this.shadow = !this.shadow;
    else if (control === "U" || control === "E") {
      const line =
        control === "U" ? FontLineStyle.LINESTYLE_SINGLE : FontLineStyle.LINESTYLE_DOUBLE;
      this.underline = this.underline === line ? FontLineStyle.LINESTYLE_NONE : line;
    } else if (control === "X" || control === "Y") {
      const position = control === "X" ? SvxEscapement.Superscript : SvxEscapement.Subscript;
      this.escapement = this.escapement === position ? SvxEscapement.Off : position;
    }
  }

  /** Reads the original size retained by the workbook font model. @returns Font height in twips. */
  getHeight(): number {
    return this.height;
  }

  /** Retains the source font color until native style and text resolution. @param color - Source workbook color. @returns Nothing. */
  setColor(color: XlsColor): void {
    this.color = color;
  }

  /** Supplies the actual native workbook font to the reference device. @returns VCL font. */
  getVclFont(): VclFont {
    const font = new VclFont();
    font.SetFamilyName(this.name);
    font.SetFontHeight(this.height);
    font.SetFamily(fontFamilies[this.family] ?? FontFamily.FAMILY_DONTKNOW);
    font.SetWeight(this.bold ? FontWeight.WEIGHT_BOLD : FontWeight.WEIGHT_NORMAL);
    font.SetItalic(this.italic ? FontItalic.ITALIC_NORMAL : FontItalic.ITALIC_NONE);
    return font;
  }

  /** Identifies the source cell font property requiring rich text storage. @returns Whether escapement is active. */
  needsRichTextFormat(): boolean {
    return this.escapement !== SvxEscapement.Off;
  }

  /** Reads the source font child record. @param element - Local token name. @param value - Value attribute. @returns Nothing. */
  importAttribs(element: string, value: string): void {
    switch (element) {
      case "name":
      case "rFont":
        this.name = value;
        break;
      case "family":
        this.family = Number(value);
        break;
      case "charset":
        if (value !== "") this.charset = Number(value);
        break;
      case "sz": {
        const points = Number(value);
        if (value.trim() && Number.isFinite(points))
          this.height = (Math.trunc(points * 20) << 16) >> 16;
        break;
      }
      case "b":
        this.bold = readStyleBool(value, true);
        break;
      case "i":
        this.italic = readStyleBool(value, true);
        break;
      case "u":
        this.underline =
          value === "double" || value === "doubleAccounting"
            ? FontLineStyle.LINESTYLE_DOUBLE
            : value === "none"
              ? FontLineStyle.LINESTYLE_NONE
              : FontLineStyle.LINESTYLE_SINGLE;
        break;
      case "strike":
        this.strikeout = readStyleBool(value, true);
        break;
      case "outline":
        this.outline = readStyleBool(value, true);
        break;
      case "shadow":
        this.shadow = readStyleBool(value, true);
        break;
      case "vertAlign":
        this.escapement =
          value === "superscript"
            ? SvxEscapement.Superscript
            : value === "subscript"
              ? SvxEscapement.Subscript
              : SvxEscapement.Off;
        break;
    }
  }

  /** Writes represented native font items. @returns Owned items. */
  createItems(): SfxPoolItem[] {
    const items: SfxPoolItem[] = [
      new SvxWeightItem(
        this.bold ? FontWeight.WEIGHT_BOLD : FontWeight.WEIGHT_NORMAL,
        Which.ATTR_FONT_WEIGHT,
      ),
      new SvxPostureItem(
        this.italic ? FontItalic.ITALIC_NORMAL : FontItalic.ITALIC_NONE,
        Which.ATTR_FONT_POSTURE,
      ),
      new SvxUnderlineItem(this.underline, Which.ATTR_FONT_UNDERLINE),
      new SvxCrossedOutItem(
        this.strikeout ? FontStrikeout.STRIKEOUT_SINGLE : FontStrikeout.STRIKEOUT_NONE,
        Which.ATTR_FONT_CROSSEDOUT,
      ),
      new SvxContourItem(this.outline, Which.ATTR_FONT_CONTOUR),
      new SvxShadowedItem(this.shadow, Which.ATTR_FONT_SHADOWED),
    ];
    if (this.name)
      items.push(
        new SvxFontItem(
          fontFamilies[this.family] ?? FontFamily.FAMILY_DONTKNOW,
          this.name,
          "",
          FontPitch.PITCH_DONTKNOW,
          this.charset >= 0 && this.charset <= 255
            ? rtl_getTextEncodingFromWindowsCharset(this.charset)
            : RTL_TEXTENCODING_DONTKNOW,
          Which.ATTR_FONT,
        ),
      );
    if (this.height > 0)
      items.push(new SvxFontHeightItem(this.height, 100, Which.ATTR_FONT_HEIGHT));
    if (this.color)
      items.push(
        new SvxColorItem(
          this.color.getColor(this.graphicHelper),
          this.color.createComplexColor(),
          Which.ATTR_FONT_COLOR,
        ),
      );
    return items;
  }

  /** Writes the represented font into an EditEngine text item set. @param target - Actual edit pool set. @param twips - Uses the header/footer editor's original unit. @returns Nothing. */
  fillToItemSet(target: SfxItemSet, twips = false): void {
    for (const item of this.createItems()) {
      try {
        for (const which of editFontWhich.get(item.Which()) ?? [])
          target.PutAsTargetWhich(item, which);
      } finally {
        item.Dispose();
      }
    }
    if (this.height > 0) {
      const height = twips ? this.height : Number(convertTwipToMm100(BigInt(this.height)));
      for (const which of [
        EE.EE_CHAR_FONTHEIGHT,
        EE.EE_CHAR_FONTHEIGHT_CJK,
        EE.EE_CHAR_FONTHEIGHT_CTL,
      ])
        target.Put(new SvxFontHeightItem(height, 100, which), true);
    }
    target.Put(new SvxEscapementItem(this.escapement, EE.EE_CHAR_ESCAPEMENT), true);
  }
}

/** Style XF or cell XF and its flags. */
export class Xf {
  alignment: Alignment | undefined;
  private protection = new Protection();
  private pattern: CellAttributeHolder | undefined;

  /** Records the original graphic and parent style indices. @param fontId - Font index. @param fillId - Fill index. @param borderId - Border index. @param numFmtId - Number format index. @param styleXfId - Style XF index. @param fontUsed - Font apply flag. @param fillUsed - Fill apply flag. @param borderUsed - Border apply flag. @param numFmtUsed - Number-format apply flag. @param alignmentUsed - Alignment apply flag. @param protectionUsed - Protection apply flag. @param cellXf - Whether this is a cell XF. @returns XF. */
  constructor(
    readonly fontId: number,
    readonly fillId: number,
    readonly borderId: number,
    readonly numFmtId: number,
    readonly styleXfId: number,
    private readonly fontUsed: boolean,
    private readonly fillUsed: boolean,
    private readonly borderUsed: boolean,
    private readonly numFmtUsed: boolean,
    private readonly alignmentUsed: boolean,
    private protectionUsed: boolean,
    private readonly cellXf: boolean,
  ) {}

  /** Reads source flags and applies explicit cell-XF protection despite its apply flag. @param locked - Original locked flag. @param hidden - Original hidden flag. @returns Nothing. */
  importProtection(locked: boolean, hidden: boolean): void {
    this.protection = new Protection(locked, hidden);
    if (this.cellXf) this.protectionUsed = true;
  }

  /** Resolves the effective font using the source cell-style override. @param styles - Workbook style records. @returns Workbook font. */
  getFont(styles: StylesBuffer): Font | undefined {
    const parent = styles.styleXfs[this.styleXfId];
    const font =
      !parent || (this.fontId >= 0 && (this.fontUsed || this.fontId !== parent.fontId))
        ? this.fontId
        : parent.fontId;
    return styles.fonts[font];
  }

  /** Builds a native Calc pattern once per XF against the sheet's style defaults. @param styles - Workbook style data. @param document - Native workbook. @param standard - Whether the XF defines Standard itself. @returns Borrowed pattern. */
  createPattern(styles: StylesBuffer, document: ScDocument, standard = false): CellAttributeHolder {
    if (this.pattern) return this.pattern;
    const parent = styles.styleXfs[this.styleXfId];
    const fill =
      !parent || (this.fillId >= 0 && (this.fillUsed || this.fillId !== parent.fillId))
        ? this.fillId
        : parent.fillId;
    const border =
      !parent || (this.borderId >= 0 && (this.borderUsed || this.borderId !== parent.borderId))
        ? this.borderId
        : parent.borderId;
    const alignment =
      this.alignment ??
      (this.alignmentUsed || (parent?.alignment && !parent.alignment.isDefault())
        ? new Alignment()
        : parent?.alignment);
    const format =
      !parent || (this.numFmtId >= 0 && (this.numFmtUsed || this.numFmtId !== parent.numFmtId))
        ? this.numFmtId
        : parent.numFmtId;
    const items = this.getFont(styles)?.createItems() ?? [];
    if (
      this.protectionUsed ||
      (parent && (!parent.protectionUsed || !this.protection.equals(parent.protection)))
    )
      items.push(this.protection.createItem());
    else if (parent?.protectionUsed) items.push(parent.protection.createItem());
    const borderItems = styles.borders[border]?.createItems(styles.graphicHelper);
    if (borderItems) items.push(...borderItems);
    if (format === 0) items.push(new SfxUInt32Item(Which.ATTR_VALUE_FORMAT, 0));
    else if (format > 0) {
      const formatter = document.GetFormatTable();
      const key = styles.numberFormats.getNumberFormat(format, formatter);
      if (key > 0) {
        items.push(new SfxUInt32Item(Which.ATTR_VALUE_FORMAT, key));
        const entry = formatter.GetEntry(key);
        const parentEntry = formatter.GetEntry(0);
        if (entry && parentEntry && entry.GetLanguage() !== parentEntry.GetLanguage())
          items.push(new SvxLanguageItem(entry.GetLanguage(), Which.ATTR_LANGUAGE_FORMAT));
      }
    }
    const background = styles.fills[fill];
    if (background) {
      const value = background.color?.getColor(styles.graphicHelper) ?? COL_TRANSPARENT;
      const brush = new SvxBrushItem(value, Which.ATTR_BACKGROUND);
      if (background.color && !value.IsTransparent())
        brush.setComplexColor(background.color.createComplexColor());
      items.push(brush);
    }
    if (alignment) {
      const outer = borderItems?.[0];
      const bordered = Boolean(
        outer && (outer.GetLeft() || outer.GetRight() || outer.GetTop() || outer.GetBottom()),
      );
      items.push(...alignment.createItems(styles.units.twipsPerSpace, bordered));
    }

    const pattern = new ScPatternAttr(document.getCellAttributeHelper());
    if (!standard)
      pattern.SetStyleSheet(document.GetStyleSheetPool()?.GetDefaultStyle() ?? null, false);
    const set = pattern.GetItemSetWritable();
    for (const item of items) {
      try {
        if (!item.equals(set.Get(item.Which()))) set.Put(item);
      } finally {
        item.Dispose();
      }
    }
    this.pattern = new CellAttributeHolder(pattern, true);
    return this.pattern;
  }

  /** Releases the importer's pattern reference. @returns Nothing. */
  dispose(): void {
    this.pattern?.Dispose();
    this.pattern = undefined;
  }
}

/** Original workbook owner of indexed formatting records. */
export class StylesBuffer {
  units = new UnitConverter();
  readonly numberFormats = new NumberFormatsBuffer();
  readonly fonts: Font[] = [];
  readonly dxfs: Dxf[] = [];
  readonly fills: { color?: XlsColor }[] = [];
  readonly borders: Border[] = [];
  readonly styleXfs: Xf[] = [];
  readonly cellXfs: Xf[] = [];
  defaultStyleXf = -1;

  /** Binds the original workbook graphic helper before reading the indexed styles. @param graphicHelper - Theme and palette resolver. @returns Style buffer. */
  constructor(readonly graphicHelper = new ExcelGraphicHelper()) {}

  /** Selects the Normal style font, then falls back to the first workbook font. @returns Workbook font or absence. */
  getDefaultFont(): Font | undefined {
    const fontId = this.styleXfs[this.defaultStyleXf]?.fontId;
    return (fontId === undefined ? undefined : this.fonts[fontId]) ?? this.fonts[0];
  }

  /** Materializes the workbook Normal XF on the original Calc Standard style. @param document - Native workbook. @returns Nothing. */
  finalizeImport(document: ScDocument): void {
    const normal = this.styleXfs[this.defaultStyleXf];
    if (!normal) return;
    const pattern = normal.createPattern(this, document, true).getScPatternAttr();
    if (pattern) document.GetStyleSheetPool()?.SetDefaultCellStyle(pattern.GetItemSet());
  }

  /** Resolves a cell-format index through the workbook's native buffer. @param index - Zero-based XF index. @returns Native XF owner. */
  getCellXf(index: number): Xf | undefined {
    return this.cellXfs[index];
  }

  /** Releases cached native style entries when the workbook import completes. @returns Nothing. */
  dispose(): void {
    for (const xf of this.cellXfs) xf.dispose();
    for (const xf of this.styleXfs) xf.dispose();
  }
}

/** Interprets an original indexed format reference and absent sentinel. @param value - Lexical attribute. @returns Nonnegative index or -1. */
export function styleIndex(value: string): number {
  if (!/^\d+$/.test(value)) return -1;
  const index = Number(value);
  return index <= 0x7fffffff ? index : -1;
}
