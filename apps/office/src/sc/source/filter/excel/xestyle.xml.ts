/** @fileoverview Native XLSX font and XF export buffers over Calc cell patterns. */
import type { SvxBrushItem } from "../../../../editeng/inc/brushitem";
import type { SvxColorItem } from "../../../../editeng/inc/colritem";
import type { SvxContourItem } from "../../../../editeng/inc/contouritem";
import type { SvxCrossedOutItem } from "../../../../editeng/inc/crossedoutitem";
import type { SvxFontItem } from "../../../../editeng/inc/fontitem";
import type { SvxEscapementItem } from "../../../../editeng/source/items/textitem.escapement";
import { EE_CHAR_ESCAPEMENT } from "../../../../editeng/inc/eeitem";
import type { SvxUnderlineItem } from "../../../../editeng/inc/udlnitem";
import type { SvxShadowedItem } from "../../../../editeng/inc/shdditem";
import type {
  SvxFontHeightItem,
  SvxPostureItem,
  SvxWeightItem,
} from "../../../../editeng/source/items/textitem";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import type { FastSerializerHelper } from "../../../../sax/inc/fshelper";
import {
  convertColorTransformsToTintOrShade,
  convertThemeColorTypeToExcelThemeNumber,
} from "../../../../oox/inc/export/ColorExportUtils";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SfxItemPool } from "../../../../svl/source/items/itempool";
import type { SfxPoolItem } from "../../../../svl/inc/poolitem";
import { XclExpCellAlign } from "./xestyle.alignment";
import type { XlsxReferenceDevice } from "../oox/unitconverter";
import { Font } from "../../../../vcl/source/font/font";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import type { ScDocument } from "../../../inc/document";
import { ScPatternAttr } from "../../../inc/patattr";
import * as Which from "../../../inc/scitems";
import { spreadsheetNamespace } from "../oox/workbookfragment";
import { XclXmlUtils, type XclExpXmlStream } from "./xestream";
import { XclFontData } from "./xlstyle";
import { XclTools } from "./xltools";
import { XclExpBorderBuffer } from "./xestyle.border";
import { XclExpNumFmtBuffer } from "./xestyle.numfmt";
import { XclExpCellProt } from "./xestyle.protection";

/** Represented original XF references. */
interface CellXf {
  font: number;
  fill: number;
  border: number;
  numberFormat: number;
  alignment: XclExpCellAlign;
  protection: XclExpCellProt;
}

/** Serialized OOXML foreground with either a theme slot or a resolved RGB value. */
interface FillColor {
  theme: string | null;
  tint: string | null;
  rgb: string | null;
}

/** Original spreadsheet font records with native font-data comparison and emission. */
export class XclExpFontBuffer {
  private readonly fonts: XclFontData[] = [];

  /** Borrows the workbook application font at the first reserved index. @returns Font data. */
  GetAppFontData(): XclFontData {
    const font = this.fonts[0];
    if (!font) throw new Error("Workbook application font is missing.");
    return font;
  }

  /** Extracts native properties and reuses the matching Excel font record. @param pattern - Actual native cell pattern. @param escapement - Optional source edit-text item. @returns Font ID. */
  Insert(pattern: ScPatternAttr, escapement?: SvxEscapementItem): number {
    const font = new XclFontData();
    const family = pattern.GetItem(Which.ATTR_FONT) as SvxFontItem;
    const source = unicode(family.GetFamilyName());
    try {
      const name = XclTools.GetXclFontName(source);
      try {
        font.maName.assign(name);
      } finally {
        name.dispose();
      }
    } finally {
      source.dispose();
    }
    font.SetScFamily(family.GetFamily());
    font.SetFontEncoding(family.GetCharSet());
    font.SetScHeight((pattern.GetItem(Which.ATTR_FONT_HEIGHT) as SvxFontHeightItem).GetHeight());
    font.SetScWeight((pattern.GetItem(Which.ATTR_FONT_WEIGHT) as SvxWeightItem).GetValue());
    font.SetScPosture((pattern.GetItem(Which.ATTR_FONT_POSTURE) as SvxPostureItem).GetValue());
    if (escapement) font.SetScEscapement(escapement.GetEsc());
    font.SetScUnderline(
      (pattern.GetItem(Which.ATTR_FONT_UNDERLINE) as SvxUnderlineItem).GetLineStyle(),
    );
    font.SetScStrikeout(
      (pattern.GetItem(Which.ATTR_FONT_CROSSEDOUT) as SvxCrossedOutItem).GetValue(),
    );
    font.mbOutline = (pattern.GetItem(Which.ATTR_FONT_CONTOUR) as SvxContourItem).GetValue();
    font.mbShadow = (pattern.GetItem(Which.ATTR_FONT_SHADOWED) as SvxShadowedItem).GetValue();
    const color = pattern.GetItem(Which.ATTR_FONT_COLOR) as SvxColorItem;
    font.maComplexColor.assign(color.getComplexColor());
    font.maComplexColor.setFinalColor(color.GetValue());
    const existing = this.fonts.findIndex(
      /** Reuses the original Excel font equality. @param entry - Indexed font. @returns Whether equivalent. */
      (entry) => entry.equals(font),
    );
    if (existing >= 0) {
      font.Dispose();
      return existing;
    }
    return this.fonts.push(font) - 1;
  }

  /** Inserts the run's effective font relative to the cell format. @param base - Cell pattern. @param pool - Native EditEngine pool. @param attributes - Run items. @returns Font index. */
  InsertEditFont(
    base: ScPatternAttr,
    pool: SfxItemPool,
    attributes: readonly SfxPoolItem[],
  ): number {
    const editItems = new SfxItemSet(pool);
    const pattern = new ScPatternAttr(base);
    try {
      for (const item of attributes) editItems.Put(item);
      pattern.GetFromEditItemSet(editItems);
      return this.Insert(
        pattern,
        editItems.GetItemIfSet(EE_CHAR_ESCAPEMENT) as SvxEscapementItem | undefined,
      );
    } finally {
      pattern.Dispose();
      editItems.Dispose();
    }
  }

  /** Looks up the font recorded for a formatted string run. @param index - Font index. @returns Borrowed font or absence. */
  GetFont(index: number): XclFontData | undefined {
    return this.fonts[index];
  }

  /** Writes the indexed original font records. @param serializer - Stylesheet stream. @returns Nothing. */
  SaveXml(serializer: FastSerializerHelper): void {
    serializer.startElement(token("fonts"), token("count"), String(this.fonts.length));
    for (const font of this.fonts) {
      serializer.startElement(token("font"));
      XclXmlUtils.WriteFontData(serializer, font, token("name"));
      serializer.endElement(token("font"));
    }
    serializer.endElement(token("fonts"));
  }

  /** Releases the original font values retained by the buffer. @returns Nothing. */
  Dispose(): void {
    for (const font of this.fonts) font.Dispose();
    this.fonts.length = 0;
  }
}

/** Collects style records from the native pattern used by each XLSX cell. */
export class XclExpXFBuffer {
  private readonly fonts = new XclExpFontBuffer();
  private readonly borders = new XclExpBorderBuffer();
  private readonly numberFormats: XclExpNumFmtBuffer;
  private readonly fills: (FillColor | null)[] = [null, null];
  private readonly fillsByColor = new Map<string, number>();
  private readonly space: number;
  private readonly normalUsesProtection: boolean;
  private readonly xfs: CellXf[] = [];
  private readonly byKey = new Map<string, number>();
  private readonly byPattern = new Map<ScPatternAttr, number>();

  /** Seeds the Normal format from the actual workbook defaults. @param document - Native workbook. @param device - Workbook reference device. @returns XF buffer. */
  constructor(document: ScDocument, device?: XlsxReferenceDevice) {
    this.numberFormats = new XclExpNumFmtBuffer(document);
    const pattern = document.getCellAttributeHelper().getDefaultCellAttribute();
    this.normalUsesProtection =
      document
        .GetStyleSheetPool()
        ?.GetDefaultStyle()
        ?.GetItemSet()
        .GetItemIfSet(Which.ATTR_PROTECTION, true) !== undefined;
    this.fonts.Insert(pattern);
    const width = device?.measureTextWidth(this.GetAppFont(), " ") ?? 0;
    this.space = Number.isFinite(width) && width > 0 ? width : 45;
    this.Insert(pattern);
  }

  /** Builds the original VCL reference font for Excel character and space widths. @returns Application font. */
  GetAppFont(): Font {
    const data = this.GetAppFontData();
    const font = new Font();
    font.SetFamilyName(text(data.maName));
    font.SetFontHeight(data.mnHeight);
    font.SetFamily(data.GetScFamily(data.GetFontEncoding()));
    font.SetWeight(data.GetScWeight());
    font.SetItalic(data.GetScPosture());
    return font;
  }

  /** Borrows the actual font written at the application-font index. @returns Source font data. */
  GetAppFontData(): XclFontData {
    return this.fonts.GetAppFontData();
  }

  /** Borrows the workbook font table for shared string export. @returns Native font buffer. */
  GetFontBuffer(): XclExpFontBuffer {
    return this.fonts;
  }

  /** Registers the represented native font, fill and alignment as one XF. @param pattern - Actual cell pattern, or omitted default. @returns XF index. */
  Insert(pattern: ScPatternAttr | null): number {
    if (!pattern) return 0;
    const existing = this.byPattern.get(pattern);
    if (existing !== undefined) return existing;
    const font = this.fonts.Insert(pattern);
    const fill = pattern.GetItem(Which.ATTR_BACKGROUND) as SvxBrushItem;
    const xf: CellXf = {
      font,
      fill: this.InsertFill(fill),
      border: this.borders.Insert(pattern),
      numberFormat: this.numberFormats.Insert(pattern),
      alignment: new XclExpCellAlign(pattern, this.space),
      protection: new XclExpCellProt(pattern),
    };
    const key = JSON.stringify(xf);
    let index = this.byKey.get(key);
    if (index === undefined) {
      index = this.xfs.push(xf) - 1;
      this.byKey.set(key, index);
    }
    this.byPattern.set(pattern, index);
    return index;
  }

  /** Reuses the original empty fill or the native foreground and theme transforms. @param brush - Native background item. @returns Fill index. */
  private InsertFill(brush: SvxBrushItem): number {
    const color = brush.GetColor();
    if (color.IsTransparent()) return 0;
    const complex = brush.getComplexColor();
    const tint = convertColorTransformsToTintOrShade(complex);
    const value: FillColor = complex.isValidThemeType()
      ? {
          theme: String(convertThemeColorTypeToExcelThemeNumber(complex.getThemeColorType())),
          tint: tint === 0 ? null : String(tint),
          rgb: null,
        }
      : { theme: null, tint: null, rgb: new TextDecoder().decode(XclXmlUtils.ToOString(color)) };
    const key = JSON.stringify(value);
    const old = this.fillsByColor.get(key);
    if (old !== undefined) return old;
    const index = this.fills.push(value) - 1;
    this.fillsByColor.set(key, index);
    return index;
  }

  /** Writes original OOXML indexed styles in schema order. @param stream - Active XLSX export. @returns Nothing. */
  SaveXml(stream: XclExpXmlStream): void {
    const serializer = stream.GetCurrentStream();
    const styleSheet = token("styleSheet");
    serializer.startElement(styleSheet, token("xmlns"), spreadsheetNamespace);
    this.numberFormats.SaveXml(serializer);
    this.fonts.SaveXml(serializer);
    const fills = token("fills"),
      fill = token("fill"),
      patternFill = token("patternFill");
    serializer.startElement(fills, token("count"), String(this.fills.length));
    for (const [index, color] of this.fills.entries()) {
      serializer.startElement(fill);
      if (color) {
        serializer.startElement(patternFill, token("patternType"), "solid");
        serializer.singleElement(
          token("fgColor"),
          token("theme"),
          color.theme,
          token("tint"),
          color.tint,
          token("rgb"),
          color.rgb,
        );
        serializer.endElement(patternFill);
      } else
        serializer.singleElement(
          patternFill,
          token("patternType"),
          index === 0 ? "none" : "gray125",
        );
      serializer.endElement(fill);
    }
    serializer.endElement(fills);
    this.borders.SaveXml(serializer);
    serializer.startElement(token("cellStyleXfs"), token("count"), "1");
    this.SaveXf(serializer, this.xfs[0] as CellXf, false);
    serializer.endElement(token("cellStyleXfs"));
    serializer.startElement(token("cellXfs"), token("count"), String(this.xfs.length));
    for (const xf of this.xfs) this.SaveXf(serializer, xf, true);
    serializer.endElement(token("cellXfs"));
    serializer.startElement(token("cellStyles"), token("count"), "1");
    serializer.singleElement(
      token("cellStyle"),
      token("name"),
      "Normal",
      token("xfId"),
      "0",
      token("builtinId"),
      "0",
    );
    serializer.endElement(token("cellStyles"));
    serializer.endElement(styleSheet);
    serializer.endDocument();
  }

  /** Writes one native XF and its represented alignment and protection. @param serializer - Stylesheet writer. @param xf - Indexed format. @param cell - Cell XF or parent style record. @returns Nothing. */
  private SaveXf(serializer: FastSerializerHelper, xf: CellXf, cell: boolean): void {
    const normal = this.xfs[0];
    const alignment =
      !xf.alignment.isDefault() ||
      (cell && normal !== undefined && !xf.alignment.equals(normal.alignment));
    const applyProtection = cell ? xf.protection.used : this.normalUsesProtection;
    const protection = applyProtection ? xf.protection : cell ? normal?.protection : undefined;
    const attributes = [
      token("numFmtId"),
      String(xf.numberFormat),
      token("fontId"),
      String(xf.font),
      token("fillId"),
      String(xf.fill),
      token("borderId"),
      String(xf.border),
      token("xfId"),
      cell ? "0" : null,
      token("applyFont"),
      cell && xf.font !== 0 ? "1" : null,
      token("applyFill"),
      cell && xf.fill !== this.xfs[0]?.fill ? "1" : null,
      token("applyBorder"),
      cell && xf.border !== this.xfs[0]?.border ? "1" : null,
      token("applyNumberFormat"),
      cell && xf.numberFormat !== this.xfs[0]?.numberFormat ? "1" : null,
      token("applyAlignment"),
      alignment ? "1" : null,
      token("applyProtection"),
      String(applyProtection),
    ];
    if (!alignment && !protection) {
      serializer.singleElement(token("xf"), ...attributes);
      return;
    }
    serializer.startElement(token("xf"), ...attributes);
    if (alignment) xf.alignment.SaveXml(serializer);
    protection?.SaveXml(serializer);
    serializer.endElement(token("xf"));
  }

  /** Releases the font data owned by the export. @returns Nothing. */
  Dispose(): void {
    this.fonts.Dispose();
    this.numberFormats.Dispose();
  }
}
