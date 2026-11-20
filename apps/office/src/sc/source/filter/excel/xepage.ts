/** @fileoverview Native XLSX manual page-break records collected from the actual Calc sheet. */
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import type { ScDocument } from "../../../inc/document";
import type { ScPageHFItem, ScPageScaleToItem } from "../../../inc/attrib";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import type { SfxUInt16Item } from "../../../../svl/inc/intitem";
import type { SvxPageItem } from "../../../../svx/inc/pageitem";
import type { SvxLRSpaceItem } from "../../../../editeng/inc/lrspitem";
import type { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import type { SvxSizeItem } from "../../../../editeng/inc/sizeitem";
import { convert, Length } from "../../../../o3tl/inc/unit_conversion";
import { SetScPaperSize } from "./xlpage";
import { XclExpHFConverter } from "./xehelper.headerfooter";
import type { XclFontData } from "./xlstyle";
import type { SvxSetItem } from "../../../../svx/inc/pageitem";
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
  ATTR_PAGE_SCALE,
  ATTR_PAGE_SCALETOPAGES,
  ATTR_PAGE_SCALETO,
  ATTR_PAGE_HEADERSET,
  ATTR_PAGE_FOOTERSET,
  ATTR_PAGE_HEADERRIGHT,
  ATTR_PAGE_HEADERLEFT,
  ATTR_PAGE_HEADERFIRST,
  ATTR_PAGE_FOOTERRIGHT,
  ATTR_PAGE_FOOTERLEFT,
  ATTR_PAGE_FOOTERFIRST,
  ATTR_PAGE_ON,
  ATTR_PAGE_DYNAMIC,
  ATTR_PAGE_SHARED,
  ATTR_PAGE_SHARED_FIRST,
} from "../../../inc/scitems";
import { MAXCOL, MAXROW } from "../../../inc/address";
import type { ScTable } from "../../../inc/table";
import type { XclExpXmlStream } from "./xestream";

/** Original XLSX page-break record with ordered positions and a UInt16 cross-axis maximum. */
export class XclExpPageBreaks {
  /** Binds the source axis and collected positions. @param rows - Horizontal breaks. @param breaks - Original ordered manual break set. @param maximum - Cross-axis limit. @returns Record. */
  constructor(
    private readonly rows: boolean,
    private readonly breaks: ReadonlySet<number>,
    private readonly maximum: number,
  ) {}

  /** Writes the first 1023 manual positions using the original schema tokens. @param stream - Active worksheet stream. @returns Nothing. */
  SaveXml(stream: XclExpXmlStream): void {
    if (!this.breaks.size) return;
    const count = Math.min(1023, this.breaks.size);
    const serializer = stream.GetCurrentStream();
    const element = token(this.rows ? "rowBreaks" : "colBreaks");
    serializer.startElement(
      element,
      token("count"),
      String(count),
      token("manualBreakCount"),
      String(count),
    );
    let index = 0;
    for (const position of this.breaks) {
      if (index++ === count) break;
      serializer.singleElement(
        token("brk"),
        token("id"),
        String(position),
        token("man"),
        "true",
        token("max"),
        String(this.maximum),
        token("min"),
        "0",
      );
    }
    serializer.endElement(element);
  }
}

/** Collects the two original page settings records after sheet content. @param stream - Worksheet stream. @param table - Native sheet. @returns Nothing. */
export function SaveXmlPageBreaks(stream: XclExpXmlStream, table: ScTable): void {
  const rowBreaks = new Set<number>();
  table.GetAllRowBreaks(rowBreaks, false, true);
  const horizontal = new Set<number>();
  for (const row of rowBreaks) {
    if (row > 0xffff || horizontal.size === 1026) break;
    horizontal.add(row);
  }
  new XclExpPageBreaks(true, horizontal, MAXCOL & 0xffff).SaveXml(stream);
  const columns = new Set<number>();
  table.GetAllColBreaks(columns, false, true);
  new XclExpPageBreaks(false, columns, MAXROW & 0xffff).SaveXml(stream);
}

/** Converted Excel text variants and the body distance owned by one header/footer set. */
interface HeaderFooterData {
  odd: string;
  even: string;
  first: string;
  useEven: boolean;
  useFirst: boolean;
  height?: number;
}

/** Original worksheet page settings obtained from the page-family item set. */
export class XclExpPageSettings {
  private readonly items: SfxItemSet | undefined;
  private readonly scaling: number;
  private readonly fit: readonly [width: number, height: number] | undefined;

  /** Looks up the native sheet style and selects the original effective fitting mode. @param document - Workbook. @param tab - Sheet index. @param appFont - Workbook font zero. @returns Page settings writer. */
  constructor(
    private readonly document: ScDocument,
    private readonly tab: number,
    private readonly appFont: XclFontData,
  ) {
    this.items = document
      .GetStyleSheetPool()
      ?.GetPageStyle(document.GetPageStyle(tab))
      ?.GetItemSet();
    const fit = this.items?.GetItemIfSet(ATTR_PAGE_SCALETO, false) as ScPageScaleToItem | undefined;
    const pages =
      (
        this.items?.GetItemIfSet(ATTR_PAGE_SCALETOPAGES, false) as SfxUInt16Item | undefined
      )?.GetValue() ?? 0;
    const scale =
      (this.items?.Get(ATTR_PAGE_SCALE) as SfxUInt16Item | undefined)?.GetValue() ?? 100;
    this.fit = fit?.IsValid() ? [fit.GetWidth(), fit.GetHeight()] : pages ? [1, pages] : undefined;
    this.scaling = this.fit ? 100 : scale || 100;
  }

  /** Supplies the fit mode for the preceding worksheet properties. @returns Fit flag when a page style exists. */
  FitToPages(): boolean | undefined {
    return this.items ? Boolean(this.fit) : undefined;
  }

  /** Writes the original print options, margins and page setup records in schema order. @param stream - Worksheet XML stream. @returns Nothing. */
  SaveXml(stream: XclExpXmlStream): void {
    const items = this.items;
    if (!items) return;
    const xml = stream.GetCurrentStream();
    const flag =
      /** Reads one native page boolean. @param which - Item identity. @returns XML boolean. */ (
        which: number,
      ): string => String((items.Get(which) as SfxBoolItem).GetValue());
    xml.singleElement(
      token("printOptions"),
      token("headings"),
      flag(ATTR_PAGE_HEADERS),
      token("gridLines"),
      flag(ATTR_PAGE_GRID),
      token("gridLinesSet"),
      "true",
      token("horizontalCentered"),
      flag(ATTR_PAGE_HORCENTER),
      token("verticalCentered"),
      flag(ATTR_PAGE_VERCENTER),
    );
    const lr = items.Get(ATTR_LRSPACE) as SvxLRSpaceItem;
    const ul = items.Get(ATTR_ULSPACE) as SvxULSpaceItem;
    const inches =
      /** Converts the native export item length to inches. @param length - Margin in twips. @returns Excel margin. */ (
        length: number,
      ): string => String(convert(length, Length.twip, Length.in));
    const headerFooter = String(convert(1300, Length.mm100, Length.in));
    const header = this.readHeaderFooter(items, true);
    const footer = this.readHeaderFooter(items, false);
    xml.singleElement(
      token("pageMargins"),
      token("left"),
      inches(lr.ResolveLeft()),
      token("right"),
      inches(lr.ResolveRight()),
      token("top"),
      inches(ul.GetUpper() + (header.height ?? 0)),
      token("bottom"),
      inches(ul.GetLower() + (footer.height ?? 0)),
      token("header"),
      header.height === undefined ? headerFooter : inches(ul.GetUpper()),
      token("footer"),
      footer.height === undefined ? headerFooter : inches(ul.GetLower()),
    );

    const landscape = (items.Get(ATTR_PAGE) as SvxPageItem).IsLandscape();
    const size = (items.Get(ATTR_PAGE_SIZE) as SvxSizeItem).GetSize();
    const index = SetScPaperSize(size, !landscape);
    const first = (items.Get(ATTR_PAGE_FIRSTPAGENO) as SfxUInt16Item).GetValue();
    const manual =
      first !== 0 &&
      (this.tab === 0 ||
        this.document.GetPageStyle(this.tab) !== this.document.GetPageStyle(this.tab - 1));
    const mm =
      /** Formats one native paper dimension with the original integer millimetre conversion. @param length - Physical length in twips. @returns OOXML measure. */ (
        length: number,
      ): string => `${convert(BigInt(length), Length.twip, Length.mm)}mm`;
    xml.singleElement(
      token("pageSetup"),
      token("paperSize"),
      index ? String(index) : null,
      token("paperWidth"),
      index ? null : mm(landscape ? size.Height() : size.Width()),
      token("paperHeight"),
      index ? null : mm(landscape ? size.Width() : size.Height()),
      token("scale"),
      String(this.scaling),
      token("fitToWidth"),
      String(this.fit?.[0] ?? 1),
      token("fitToHeight"),
      String(this.fit?.[1] ?? 1),
      token("orientation"),
      landscape ? "landscape" : "portrait",
      token("pageOrder"),
      flag(ATTR_PAGE_TOPDOWN) === "true" ? "downThenOver" : "overThenDown",
      token("cellComments"),
      flag(ATTR_PAGE_NOTES) === "true" ? "atEnd" : "none",
      token("firstPageNumber"),
      manual ? String(first) : null,
      token("useFirstPageNumber"),
      manual ? "true" : null,
      token("blackAndWhite"),
      "false",
      token("draft"),
      "false",
      token("horizontalDpi"),
      "300",
      token("verticalDpi"),
      "300",
      token("copies"),
      "1",
    );
    this.saveHeaderFooter(stream, header, footer);
  }

  /** Reads native page content and shared variants. @param items - Page style. @param header - Header selector. @returns Worksheet record values. */
  private readHeaderFooter(items: SfxItemSet, header: boolean): HeaderFooterData {
    const set = (
      items.Get(header ? ATTR_PAGE_HEADERSET : ATTR_PAGE_FOOTERSET) as SvxSetItem
    ).GetItemSet();
    const flag = /** Reads one native slot. @param which - Item ID. @returns Boolean. */ (
      which: number,
    ) => (set.Get(which) as SfxBoolItem).GetValue();
    if (!flag(ATTR_PAGE_ON))
      return { odd: "", even: "", first: "", useEven: false, useFirst: false };
    const converter = new XclExpHFConverter(this.appFont);
    const read =
      /** Encodes one native variant from its three actual areas. @param which - Variant ID. @returns Encoded result. */ (
        which: number,
      ) => {
        const value = items.Get(which) as ScPageHFItem;
        return converter.GenerateString([
          value.GetLeftArea(),
          value.GetCenterArea(),
          value.GetRightArea(),
        ]);
      };
    const useEven =
      set.GetItemIfSet(ATTR_PAGE_SHARED, false) !== undefined && !flag(ATTR_PAGE_SHARED);
    const useFirst =
      set.GetItemIfSet(ATTR_PAGE_SHARED_FIRST, false) !== undefined &&
      !flag(ATTR_PAGE_SHARED_FIRST);
    const odd = read(header ? ATTR_PAGE_HEADERRIGHT : ATTR_PAGE_FOOTERRIGHT);
    const even = useEven ? read(header ? ATTR_PAGE_HEADERLEFT : ATTR_PAGE_FOOTERLEFT) : odd;
    const first = useFirst ? read(header ? ATTR_PAGE_HEADERFIRST : ATTR_PAGE_FOOTERFIRST) : odd;
    const spacing = set.Get(ATTR_ULSPACE) as SvxULSpaceItem;
    const outHeight = flag(ATTR_PAGE_DYNAMIC)
      ? (useFirst ? first : useEven ? even : odd).height +
        (header ? spacing.GetLower() : spacing.GetUpper())
      : (set.Get(ATTR_PAGE_SIZE) as SvxSizeItem).GetSize().Height();
    // An enabled default style with empty text is equivalent to a style without a header record.
    const height = odd.value || even.value || first.value ? outHeight : undefined;
    return {
      odd: odd.value,
      even: even.value,
      first: first.value,
      useEven,
      useFirst,
      ...(height === undefined ? {} : { height }),
    };
  }

  /** Writes normal, even and first-page variants using the original worksheet-wide sharing semantics. @param stream - Worksheet XML owner. @param header - Header records. @param footer - Footer records. @returns Nothing. */
  private saveHeaderFooter(
    stream: XclExpXmlStream,
    header: HeaderFooterData,
    footer: HeaderFooterData,
  ): void {
    const xml = stream.GetCurrentStream();
    const even = header.useEven || footer.useEven;
    const first = header.useFirst || footer.useFirst;
    xml.startElement(
      token("headerFooter"),
      token("differentFirst"),
      String(first),
      token("differentOddEven"),
      String(even),
    );
    const variants = [
      ["oddHeader", header.odd],
      ["oddFooter", footer.odd],
      ["evenHeader", even ? header.even : ""],
      ["evenFooter", even ? footer.even : ""],
      ["firstHeader", first ? header.first : ""],
      ["firstFooter", first ? footer.first : ""],
    ] as const;
    for (const [index, [name, value]] of variants.entries()) {
      if ((index === 2 || index === 3) && !even) continue;
      if (index >= 4 && !first) continue;
      const element = token(name);
      xml.startElement(element);
      xml.writeEscaped(value);
      xml.endElement(element);
    }
    xml.endElement(token("headerFooter"));
  }
}
