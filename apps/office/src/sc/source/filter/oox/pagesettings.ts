/** @fileoverview Native SpreadsheetML print properties converted to the sheet's actual Calc page style. */
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import type { AttributeList } from "../../../../oox/source/helper/attributelist";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { Converter } from "../../../../sax/source/tools/converter";
import { convert, Length } from "../../../../o3tl/inc/unit_conversion";
import { getApiSizeForMSPaperSizeIndex } from "../../../../filter/source/msfilter/util";
import { Size } from "../../../../tools/inc/gen";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SfxUInt16Item } from "../../../../svl/inc/intitem";
import { SvxPageItem } from "../../../../svx/inc/pageitem";
import { SvxSizeItem } from "../../../../editeng/inc/sizeitem";
import { SvxIndentValue, SvxLRSpaceItem } from "../../../../editeng/inc/lrspitem";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { SetPageScale } from "../../core/data/stlsheet";
import type { ScDocument } from "../../../inc/document";
import {
  ATTR_LRSPACE,
  ATTR_ULSPACE,
  ATTR_PAGE,
  ATTR_PAGE_SIZE,
  ATTR_PAGE_FIRSTPAGENO,
  ATTR_PAGE_HORCENTER,
  ATTR_PAGE_VERCENTER,
  ATTR_PAGE_GRID,
  ATTR_PAGE_HEADERS,
  ATTR_PAGE_NOTES,
  ATTR_PAGE_TOPDOWN,
} from "../../../inc/scitems";

const defaultLeftRight = 0.748,
  defaultTopBottom = 0.984;

/** Reads the original custom paper measure. @param attributes - Typed source attributes. @param name - Attribute name. @returns Hundredths of a millimetre or zero. */
function readMeasure(attributes: AttributeList, name: string): number {
  const value = attributes.getStringDefaulted(token(name));
  try {
    return Converter.convertMeasure(text(value)) ?? 0;
  } finally {
    value.dispose();
  }
}

/** Converts the API page property from mm100 to the paper item's core unit. @param value - API dimension. @returns Twips. */
function toTwips(value: number): number {
  return Number(convert(BigInt(value), Length.mm100, Length.twip));
}

/** Original margin conversion rounds at the API unit before projecting to the item. @param value - Inches. @returns Twips. */
function margin(value: number): number {
  const mm100 = convert(value, Length.in, Length.mm100);
  return toTwips(Math.sign(mm100) * Math.round(Math.abs(mm100)));
}

/** Original PageSettings worksheet property accumulator. */
export class PageSettings {
  private left = defaultLeftRight;
  private right = defaultLeftRight;
  private top = defaultTopBottom;
  private bottom = defaultTopBottom;
  private landscape = false;
  private topDown = true;
  private paper = 1;
  private width = 0;
  private height = 0;
  private firstPage = 0;
  private scale = 100;
  private fitWidth = 1;
  private fitHeight = 1;
  private fit = false;
  private printerDefaults = true;
  private horizontalCenter = false;
  private verticalCenter = false;
  private grid = false;
  private headers = false;
  private notes = false;

  /** Applies the worksheet's original fitting mode. @param attributes - Source pageSetUpPr attributes. @returns Nothing. */
  importPageSetupPr(attributes: AttributeList): void {
    this.fit = attributes.getBool(token("fitToPage"), false);
  }

  /** Reads the source centered, grid and heading flags. @param attributes - Source printOptions attributes. @returns Nothing. */
  importPrintOptions(attributes: AttributeList): void {
    this.horizontalCenter = attributes.getBool(token("horizontalCentered"), false);
    this.verticalCenter = attributes.getBool(token("verticalCentered"), false);
    this.grid = attributes.getBool(token("gridLines"), false);
    this.headers = attributes.getBool(token("headings"), false);
  }

  /** Reads physical sheet area margins in inches. @param attributes - Source pageMargins attributes. @returns Nothing. */
  importPageMargins(attributes: AttributeList): void {
    this.left = attributes.getDouble(token("left"), defaultLeftRight);
    this.right = attributes.getDouble(token("right"), defaultLeftRight);
    this.top = attributes.getDouble(token("top"), defaultTopBottom);
    this.bottom = attributes.getDouble(token("bottom"), defaultTopBottom);
  }

  /** Reads worksheet setup, keeping the original absent-attribute defaults. @param attributes - Source pageSetup attributes. @returns Nothing. */
  importPageSetup(attributes: AttributeList): void {
    this.paper = attributes.getInteger(token("paperSize"), 1);
    this.width = readMeasure(attributes, "paperWidth");
    this.height = readMeasure(attributes, "paperHeight");
    this.landscape =
      attributes.getToken(token("orientation"), token("default")) === token("landscape");
    this.topDown =
      attributes.getToken(token("pageOrder"), token("downThenOver")) === token("downThenOver");
    this.scale = attributes.getInteger(token("scale"), 100);
    this.firstPage = attributes.getBool(token("useFirstPageNumber"), false)
      ? attributes.getInteger(token("firstPageNumber"), 1)
      : 0;
    this.fitWidth = attributes.getInteger(token("fitToWidth"), 1);
    this.fitHeight = attributes.getInteger(token("fitToHeight"), 1);
    this.notes = attributes.getToken(token("cellComments"), token("none")) === token("asDisplayed");
    this.printerDefaults = attributes.getBool(token("usePrinterDefaults"), false);
  }

  /** Creates PageStyle_<sheet> and applies the original worksheet conversion. @param document - Destination workbook. @param tab - Destination sheet. @returns Nothing. */
  finalizeImport(document: ScDocument, tab: number): void {
    const table = document.FetchTable(tab);
    if (!table) return;
    const name = "PageStyle_" + text(table.GetName());
    const style = document.GetStyleSheetPool()?.GetPageStyle(name, true);
    if (!style) throw new Error("Cannot create the Calc page style.");
    const items = style.GetItemSet();
    const page = new SvxPageItem(ATTR_PAGE);
    page.SetLandscape(this.landscape);
    items.Put(page);
    if (!this.printerDefaults) {
      const size =
        this.width > 0 && this.height > 0
          ? new Size(this.width, this.height)
          : getApiSizeForMSPaperSizeIndex(this.paper);
      if (size.Width() && size.Height()) {
        const width = toTwips(this.landscape ? size.Height() : size.Width());
        const height = toTwips(this.landscape ? size.Width() : size.Height());
        items.Put(new SvxSizeItem(ATTR_PAGE_SIZE, new Size(width, height)));
      }
    }
    items.Put(
      new SvxLRSpaceItem(
        SvxIndentValue.twips(margin(this.left)),
        SvxIndentValue.twips(margin(this.right)),
        SvxIndentValue.zero(),
        ATTR_LRSPACE,
      ),
    );
    items.Put(new SvxULSpaceItem(margin(this.top), margin(this.bottom), ATTR_ULSPACE));
    items.Put(
      new SfxUInt16Item(ATTR_PAGE_FIRSTPAGENO, Math.min(9999, Math.max(0, this.firstPage))),
    );
    const scale = this.scale > 0 ? Math.min(400, Math.max(10, this.scale)) : 100;
    const fitWidth = this.fit ? Math.min(1000, Math.max(0, this.fitWidth)) : 0;
    const fitHeight = this.fit ? Math.min(1000, Math.max(0, this.fitHeight)) : 0;
    SetPageScale(items, this.fit ? 0 : scale, 0, fitWidth, fitHeight);
    items.Put(new SfxBoolItem(ATTR_PAGE_HORCENTER, this.horizontalCenter));
    items.Put(new SfxBoolItem(ATTR_PAGE_VERCENTER, this.verticalCenter));
    items.Put(new SfxBoolItem(ATTR_PAGE_GRID, this.grid));
    items.Put(new SfxBoolItem(ATTR_PAGE_HEADERS, this.headers));
    items.Put(new SfxBoolItem(ATTR_PAGE_NOTES, this.notes));
    items.Put(new SfxBoolItem(ATTR_PAGE_TOPDOWN, this.topDown));
    document.SetPageStyle(tab, name);
  }
}
