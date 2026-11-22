/** @fileoverview Calc page styles bound through ODF page layouts and master pages. */
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SfxUInt16Item } from "../../../../svl/inc/intitem";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SvxPageItem, SvxPageUsage, SvxSetItem } from "../../../../svx/inc/pageitem";
import { Color, COL_TRANSPARENT } from "../../../../tools/inc/color";
import { SvxBrushItem } from "../../../../editeng/inc/brushitem";
import { SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import { SvxFrameDirection } from "../../../../editeng/inc/frmdir";
import { SvxFrameDirectionItem } from "../../../../editeng/inc/frmdiritem";
import { importPageBoxProperties, exportPageBoxProperties } from "./xmlstyle.borders";
import { SvxSizeItem } from "../../../../editeng/inc/sizeitem";
import { SvxIndentValue, SvxLRSpaceItem } from "../../../../editeng/inc/lrspitem";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { Size } from "../../../../tools/inc/gen";
import { XMLToken as T } from "../../../../xmloff/source/core/xmltoken";
import {
  SvXMLIgnoreContext,
  SvXMLImportContext,
  type FastAttributeList,
} from "../../../../xmloff/source/core/xmlimp";
import { SvXMLUnitConverter, encodeStyleName } from "../../../../xmloff/source/core/xmluconv";
import {
  importPagePrint,
  pagePrintTokens,
} from "../../../../xmloff/source/style/PageMasterStyleMap";
import { escapeXml } from "../../../../xmloff/source/text/txtparae";
import { ScPageHFItem, ScPageScaleToItem, ScViewObjectModeItem } from "../../../inc/attrib";
import { ScVObjMode } from "../../../inc/global";
import { SfxStyleFamily } from "../../../../svl/inc/style-values";
import { SfxStyleSheetBase } from "../../../../svl/source/items/style-model";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { Converter } from "../../../../sax/source/tools/converter";
import { CellTextStylePool } from "./xmlexprt.celltext";
import type { XMLFontAutoStylePool } from "../../../../xmloff/source/style/XMLFontAutoStylePool";
import { createHeaderFooterContext, exportHeaderFooter } from "./XMLTableHeaderFooterContext";
import type { ScXMLImport } from "./xmlimprt";
import type { ScDocument } from "../../../inc/document";
import {
  ATTR_BACKGROUND,
  ATTR_BORDER,
  ATTR_WRITINGDIR,
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
  ATTR_PAGE_CHARTS,
  ATTR_PAGE_DRAWINGS,
  ATTR_PAGE_FORMULAS,
  ATTR_PAGE_OBJECTS,
  ATTR_PAGE_NULLVALS,
  ATTR_PAGE_TOPDOWN,
  ATTR_PAGE_SCALE,
  ATTR_PAGE_SCALETOPAGES,
  ATTR_PAGE_SCALETO,
  ATTR_PAGE_HEADERSET,
  ATTR_PAGE_HEADERRIGHT,
  ATTR_PAGE_FOOTERSET,
  ATTR_PAGE_FOOTERRIGHT,
  ATTR_PAGE_DYNAMIC,
} from "../../../inc/scitems";

const units = new SvXMLUnitConverter("twip");
const printItems: Readonly<Record<(typeof pagePrintTokens)[number], number>> = {
  annotations: ATTR_PAGE_NOTES,
  charts: ATTR_PAGE_CHARTS,
  drawings: ATTR_PAGE_DRAWINGS,
  formulas: ATTR_PAGE_FORMULAS,
  grid: ATTR_PAGE_GRID,
  headers: ATTR_PAGE_HEADERS,
  objects: ATTR_PAGE_OBJECTS,
  "zero-values": ATTR_PAGE_NULLVALS,
};
const usages = new Map([
  ["all", SvxPageUsage.All],
  ["left", SvxPageUsage.Left],
  ["right", SvxPageUsage.Right],
  ["mirrored", SvxPageUsage.Mirror],
]);
const directions = new Map([
  ["lr-tb", SvxFrameDirection.Horizontal_LR_TB],
  ["rl-tb", SvxFrameDirection.Horizontal_RL_TB],
  ["page", SvxFrameDirection.Environment],
]);

/** Reads a signed16 UNO print value using the original number or percent handler. @param value - XML value. @param percent - Whether the property uses a percent. @returns Parsed and saturated value or absence. */
function short(value: string | null, percent = false): number | undefined {
  if (value === null) return undefined;
  const number: [number] = [0];
  const valid = percent
    ? Converter.convertPercent(number, value)
    : Converter.convertNumber(number, value);
  return valid ? Math.max(-32768, Math.min(32767, number[0])) : undefined;
}

/** Applies the original alphabetical UNO page-scale setters and their direct-item resets. @param items - Native style. @param properties - ODF layout attributes. @returns Nothing. */
function importPageScale(items: SfxItemSet, properties: ReadonlyMap<T, string>): void {
  for (const [which, token] of [
    [ATTR_PAGE_SCALE, T.STYLE_SCALE_TO],
    [ATTR_PAGE_SCALETOPAGES, T.STYLE_SCALE_TO_PAGES],
  ] as const) {
    const value = short(properties.get(token) ?? null, which === ATTR_PAGE_SCALE);
    if (value === undefined) continue;
    items.ClearItem(ATTR_PAGE_SCALE);
    items.ClearItem(ATTR_PAGE_SCALETOPAGES);
    items.ClearItem(ATTR_PAGE_SCALETO);
    items.Put(new SfxUInt16Item(which, value & 0xffff));
  }
  const x =
    short(properties.get(T.STYLE_SCALE_TO_X) ?? null) ??
    short(properties.get(T.LOEXT_SCALE_TO_X) ?? null);
  const y =
    short(properties.get(T.STYLE_SCALE_TO_Y) ?? null) ??
    short(properties.get(T.LOEXT_SCALE_TO_Y) ?? null);
  if (x === undefined && y === undefined) return;
  const fit = new ScPageScaleToItem(items.Get(ATTR_PAGE_SCALETO) as ScPageScaleToItem);
  if (x !== undefined) fit.SetWidth(x);
  if (y !== undefined) fit.SetHeight(y);
  items.Put(fit);
  items.ClearItem(ATTR_PAGE_SCALE);
  items.ClearItem(ATTR_PAGE_SCALETOPAGES);
}

/** Applies the shared brush and box properties to a page or its nested header/footer set. @param items - Native style group. @param properties - ODF properties. @returns Nothing. */
function importPageDecorations(items: SfxItemSet, properties: ReadonlyMap<T, string>): void {
  const color = properties.get(T.FO_BACKGROUND_COLOR);
  if (color === "transparent") items.Put(new SvxBrushItem(COL_TRANSPARENT, ATTR_BACKGROUND));
  else if (color && /^#[0-9a-f]{6}$/iu.test(color))
    items.Put(new SvxBrushItem(new Color(Number.parseInt(color.slice(1), 16)), ATTR_BACKGROUND));
  const box = (items.Get(ATTR_BORDER) as SvxBoxItem).Clone();
  if (
    importPageBoxProperties(
      box,
      properties,
      /** Converts an ODF border measure. @param value - Lexical length. @returns Twip length or absence. */
      (value) => units.convertMeasureToCore(value),
    )
  )
    items.Put(box, true);
  else box.Dispose();
}

/** Applies original page-layout properties to the actual page-family item set. @param items - Native style. @param properties - ODF layout properties. @param usage - ODF page usage. @returns Nothing. */
function importLayout(items: SfxItemSet, properties: ReadonlyMap<T, string>, usage: string): void {
  const get =
    /** Reads one stored layout attribute. @param token - XML token. @returns Lexical value or null. */ (
      token: T,
    ): string | null => properties.get(token) ?? null;
  const landscape = get(T.STYLE_PRINT_ORIENTATION);
  const num = get(T.STYLE_NUM_FORMAT);
  const page = (items.Get(ATTR_PAGE) as SvxPageItem).Clone();
  const pageUsage = usages.get(usage);
  if (landscape === "portrait" || landscape === "landscape")
    page.SetLandscape(landscape === "landscape");
  if (pageUsage !== undefined) page.SetPageUsage(pageUsage);
  if (num !== null) {
    const type = { value: page.GetNumType() };
    if (units.convertNumFormat(type, num, get(T.STYLE_NUM_LETTER_SYNC) ?? "", true))
      page.SetNumType(type.value);
  }
  if (landscape !== null || pageUsage !== undefined || num !== null) items.Put(page);
  const direction = directions.get(get(T.STYLE_WRITING_MODE) ?? "");
  if (direction !== undefined) items.Put(new SvxFrameDirectionItem(direction, ATTR_WRITINGDIR));
  importPageDecorations(items, properties);
  const measure =
    /** Reads one native measure in the existing page unit. @param token - Source attribute. @returns Twip length or absent. */ (
      token: T,
    ): number | undefined => {
      const value = get(token);
      return value === null ? undefined : (units.convertMeasureToCore(value) ?? undefined);
    };
  const width = measure(T.FO_PAGE_WIDTH),
    height = measure(T.FO_PAGE_HEIGHT);
  if (width !== undefined || height !== undefined) {
    const size = (items.Get(ATTR_PAGE_SIZE) as SvxSizeItem).GetSize();
    items.Put(
      new SvxSizeItem(ATTR_PAGE_SIZE, new Size(width ?? size.Width(), height ?? size.Height())),
    );
  }
  const all = measure(T.FO_MARGIN);
  const left = measure(T.FO_MARGIN_LEFT) ?? all,
    right = measure(T.FO_MARGIN_RIGHT) ?? all;
  const top = measure(T.FO_MARGIN_TOP) ?? all,
    bottom = measure(T.FO_MARGIN_BOTTOM) ?? all;
  if (left !== undefined || right !== undefined) {
    const old = items.Get(ATTR_LRSPACE) as SvxLRSpaceItem;
    items.Put(
      new SvxLRSpaceItem(
        SvxIndentValue.twips(left ?? old.ResolveLeft()),
        SvxIndentValue.twips(right ?? old.ResolveRight()),
        SvxIndentValue.zero(),
        ATTR_LRSPACE,
      ),
    );
  }
  if (top !== undefined || bottom !== undefined) {
    const old = items.Get(ATTR_ULSPACE) as SvxULSpaceItem;
    items.Put(new SvxULSpaceItem(top ?? old.GetUpper(), bottom ?? old.GetLower(), ATTR_ULSPACE));
  }
  const print = importPagePrint(get(T.STYLE_PRINT));
  if (print)
    for (const token of pagePrintTokens) {
      const which = printItems[token];
      const enabled = print.has(token);
      items.Put(
        items.Get(which) instanceof ScViewObjectModeItem
          ? new ScViewObjectModeItem(
              which,
              enabled ? ScVObjMode.VOBJ_MODE_SHOW : ScVObjMode.VOBJ_MODE_HIDE,
            )
          : new SfxBoolItem(which, enabled),
      );
    }
  const center = get(T.STYLE_TABLE_CENTERING);
  if (center === "horizontal" || center === "both")
    items.Put(new SfxBoolItem(ATTR_PAGE_HORCENTER, true));
  if (center === "vertical" || center === "both")
    items.Put(new SfxBoolItem(ATTR_PAGE_VERCENTER, true));
  const order = get(T.STYLE_PRINT_PAGE_ORDER);
  if (order === "ttb" || order === "ltr")
    items.Put(new SfxBoolItem(ATTR_PAGE_TOPDOWN, order === "ttb"));
  const first = get(T.STYLE_FIRST_PAGE_NUMBER);
  const firstPage = first === "continue" ? 0 : short(first);
  if (firstPage !== undefined)
    items.Put(new SfxUInt16Item(ATTR_PAGE_FIRSTPAGENO, firstPage & 0xffff));
  importPageScale(items, properties);
}

/** Attributes grouped by the native page layout child contexts. */
interface PageLayout {
  readonly usage: string;
  page?: ReadonlyMap<T, string>;
  header?: ReadonlyMap<T, string>;
  footer?: ReadonlyMap<T, string>;
}

/** Applies header/footer geometry in the original separate page-layout branches. @param items - Page style. @param properties - Original geometry. @param header - Header or footer selector. @returns Nothing. */
function importHeaderFooterLayout(
  items: SfxItemSet,
  properties: ReadonlyMap<T, string>,
  header: boolean,
): void {
  const group = (
    items.Get(header ? ATTR_PAGE_HEADERSET : ATTR_PAGE_FOOTERSET) as SvxSetItem
  ).Clone();
  try {
    const set = group.GetItemSet();
    /** Reads an authored native measure, retaining absent values. @param token - Source attribute. @returns Twip length or absence. */
    function measure(token: T): number | undefined {
      const lexical = properties.get(token);
      return lexical === undefined ? undefined : (units.convertMeasureToCore(lexical) ?? undefined);
    }
    const minimum = measure(T.FO_MIN_HEIGHT);
    const height = minimum ?? measure(T.SVG_HEIGHT);
    if (height !== undefined) {
      const size = (set.Get(ATTR_PAGE_SIZE) as SvxSizeItem).GetSize();
      set.Put(new SvxSizeItem(ATTR_PAGE_SIZE, new Size(size.Width(), height)));
      set.Put(new SfxBoolItem(ATTR_PAGE_DYNAMIC, minimum !== undefined));
    }
    const all = measure(T.FO_MARGIN);
    const left = measure(T.FO_MARGIN_LEFT) ?? all;
    const right = measure(T.FO_MARGIN_RIGHT) ?? all;
    if (left !== undefined || right !== undefined) {
      const margins = (set.Get(ATTR_LRSPACE) as SvxLRSpaceItem).Clone();
      if (left !== undefined) margins.SetLeft(SvxIndentValue.twips(left));
      if (right !== undefined) margins.SetRight(SvxIndentValue.twips(right));
      set.Put(margins, true);
    }
    const distance = measure(header ? T.FO_MARGIN_BOTTOM : T.FO_MARGIN_TOP) ?? all;
    if (distance !== undefined) {
      const spacing = (set.Get(ATTR_ULSPACE) as SvxULSpaceItem).Clone();
      if (header) spacing.SetLower(distance);
      else spacing.SetUpper(distance);
      set.Put(spacing, true);
    }
    importPageDecorations(set, properties);
    items.Put(group);
  } finally {
    group.Dispose();
  }
}

/** Resolves styles.xml master-page assignments against represented layout attributes. */
export class ScXMLPageStyles {
  private readonly layouts = new Map<string, PageLayout>();
  private readonly masterNames = new Map<string, string>();

  /** Binds the native style pool. @param document - Target workbook. @param importer - Actual text-style owner. @returns Import owner. */
  constructor(
    private readonly document: ScDocument,
    private readonly importer: ScXMLImport,
  ) {}

  /** Creates a page layout SAX context. @param attributes - Layout attributes. @returns Subtree context. */
  CreateLayout(attributes: FastAttributeList): SvXMLImportContext {
    const name = attributes.get(T.STYLE_NAME) ?? "";
    const layout: PageLayout = { usage: attributes.get(T.STYLE_PAGE_USAGE) ?? "" };
    this.layouts.set(name, layout);
    return new XMLPageLayoutContext(layout);
  }

  /** Creates a master-page SAX context. @returns Subtree context. */
  CreateMasterStyles(): SvXMLImportContext {
    return new XMLMasterStylesContext(this);
  }

  /** Looks up or creates the master-page style. @param attributes - Master-page attributes. @returns Native header/footer importer. */
  CreateMasterPage(attributes: FastAttributeList): SvXMLImportContext {
    const name = attributes.get(T.STYLE_NAME);
    if (!name) return new SvXMLIgnoreContext(true);
    const displayName = attributes.get(T.STYLE_DISPLAY_NAME) ?? name;
    const layout = this.layouts.get(attributes.get(T.STYLE_PAGE_LAYOUT_NAME) ?? "");
    const style = this.document.GetStyleSheetPool()?.GetPageStyle(displayName, true);
    if (!style) return new SvXMLIgnoreContext(true);
    const items = style.GetItemSet();
    if (layout?.page) importLayout(items, layout.page, layout.usage);
    if (layout?.header) importHeaderFooterLayout(items, layout.header, true);
    if (layout?.footer) importHeaderFooterLayout(items, layout.footer, false);
    this.masterNames.set(name, displayName);
    return new ScMasterPageContext(items, this.importer);
  }

  /** Assigns the table family's master-page reference to the native sheet. @param tab - Destination sheet. @param master - XML style identity. @returns Nothing. */
  Apply(tab: number, master: string): void {
    const name = this.masterNames.get(master);
    if (name) this.document.SetPageStyle(tab, name);
  }
}

/** Tracks the original master-page header/footer content presence through the end of its import. */
class ScMasterPageContext extends SvXMLImportContext {
  private containsRightHeader = false;
  private containsRightFooter = false;

  /** Binds the master to its native page-family item set. @param items - Page style. @param importer - Actual text importer. @returns Context. */
  constructor(
    private readonly items: SfxItemSet,
    private readonly importer: ScXMLImport,
  ) {
    super();
  }

  /** Opens a header or footer and records native non-left content presence. @param element - Child token. @param attrs - Child attributes. @returns Native child owner. */
  override createFastChildContext(element: T, attrs: FastAttributeList): SvXMLImportContext {
    if (element === T.STYLE_HEADER || element === T.STYLE_HEADER_FIRST)
      this.containsRightHeader = true;
    if (element === T.STYLE_FOOTER || element === T.STYLE_FOOTER_FIRST)
      this.containsRightFooter = true;
    return createHeaderFooterContext(this.items, element, attrs, this.importer);
  }

  /** Clears absent right content while retaining the page style flags. @returns Nothing. */
  override endFastElement(): void {
    if (!this.containsRightHeader) this.items.Put(new ScPageHFItem(ATTR_PAGE_HEADERRIGHT), true);
    if (!this.containsRightFooter) this.items.Put(new ScPageHFItem(ATTR_PAGE_FOOTERRIGHT), true);
  }
}

/** Collects the represented page-layout property element. */
class XMLPageLayoutContext extends SvXMLImportContext {
  /** Binds original page-layout storage. @param layout - Collected layout attributes. @returns Context. */
  constructor(private readonly layout: PageLayout) {
    super();
  }

  /** Records root and nested page dimensions. @param element - Child token. @param attributes - Source values. @returns Context. */
  override createFastChildContext(element: T, attributes: FastAttributeList): SvXMLImportContext {
    if (element === T.STYLE_PAGE_LAYOUT_PROPERTIES) this.layout.page = new Map(attributes);
    if (element === T.STYLE_HEADER_STYLE || element === T.STYLE_FOOTER_STYLE) {
      const layout = this.layout;
      const key = element === T.STYLE_HEADER_STYLE ? "header" : "footer";
      return new /** Native page-specific SAX context. */ (class extends SvXMLImportContext {
        /** Captures header/footer style properties at the original XML boundary. @param child - Child token. @param values - Source geometry. @returns Context. */
        override createFastChildContext(child: T, values: FastAttributeList): SvXMLImportContext {
          if (child === T.STYLE_HEADER_FOOTER_PROPERTIES) layout[key] = new Map(values);
          return new SvXMLIgnoreContext(true);
        }
      })();
    }
    return new SvXMLIgnoreContext(true);
  }
}

/** Resolves native master-page elements before Calc table content. */
class XMLMasterStylesContext extends SvXMLImportContext {
  /** Binds the Calc style importer. @param owner - Page style collector. @returns Context. */
  constructor(private readonly owner: ScXMLPageStyles) {
    super();
  }
  /** Imports original master names, layout references, and header/footer stories. @param element - Child token. @param attributes - Source values. @returns Context. */
  override createFastChildContext(element: T, attributes: FastAttributeList): SvXMLImportContext {
    return element === T.STYLE_MASTER_PAGE
      ? this.owner.CreateMasterPage(attributes)
      : new SvXMLIgnoreContext(true);
  }
}

/** Serializes core page items as original layout attributes. @param items - Native page style. @returns Attributes. */
function exportLayout(items: SfxItemSet): string {
  const size = (items.Get(ATTR_PAGE_SIZE) as SvxSizeItem).GetSize();
  const page = items.Get(ATTR_PAGE) as SvxPageItem;
  const lr = items.Get(ATTR_LRSPACE) as SvxLRSpaceItem,
    ul = items.Get(ATTR_ULSPACE) as SvxULSpaceItem;
  const measure =
    /** Formats the actual physical length. @param value - Twip length. @returns ODF measure. */ (
      value: number,
    ): string => units.convertMeasureToXML(value);
  const directFlag =
    /** Reads one explicitly supplied flag. @param which - Item identity. @returns Flag or absence. */ (
      which: number,
    ): boolean | undefined =>
      (items.GetItemIfSet(which, false) as SfxBoolItem | undefined)?.GetValue();
  const h = directFlag(ATTR_PAGE_HORCENTER),
    v = directFlag(ATTR_PAGE_VERCENTER);
  const center = h && v ? "both" : h ? "horizontal" : v ? "vertical" : undefined;
  const down = directFlag(ATTR_PAGE_TOPDOWN);
  const first = (
    items.GetItemIfSet(ATTR_PAGE_FIRSTPAGENO, false) as SfxUInt16Item | undefined
  )?.GetValue();
  let attributes = `fo:page-width="${measure(size.Width())}" fo:page-height="${measure(size.Height())}" style:print-orientation="${page.IsLandscape() ? "landscape" : "portrait"}" fo:margin-left="${measure(lr.ResolveLeft())}" fo:margin-right="${measure(lr.ResolveRight())}" fo:margin-top="${measure(ul.GetUpper())}" fo:margin-bottom="${measure(ul.GetLower())}"`;
  if (
    pagePrintTokens.some(
      /** Checks whether this option was explicitly set. @param token - ODF print option. @returns Direct item or absence. */
      (token) => items.GetItemIfSet(printItems[token], false),
    )
  ) {
    const print = pagePrintTokens.filter(
      /** Selects enabled print options. @param token - ODF print option. @returns Whether the option is enabled. */
      (token) => {
        const item = items.Get(printItems[token]) as SfxBoolItem | ScViewObjectModeItem;
        return item instanceof ScViewObjectModeItem
          ? item.GetValue() === ScVObjMode.VOBJ_MODE_SHOW
          : item.GetValue();
      },
    );
    attributes += ` style:print="${print.join(" ")}"`;
  }
  if (down !== undefined) attributes += ` style:print-page-order="${down ? "ttb" : "ltr"}"`;
  if (center) attributes += ` style:table-centering="${center}"`;
  if (first !== undefined)
    attributes += ` style:first-page-number="${first ? (first << 16) >> 16 : "continue"}"`;
  const dir = (items.Get(ATTR_WRITINGDIR) as SvxFrameDirectionItem).GetValue();
  const direction =
    [...directions].find(
      /** Matches the native writing direction. @param entry - ODF token and native direction. @returns Whether the entry matches. */
      ([, value]) => value === dir,
    )?.[0] ?? "page";
  const number = page.GetNumType();
  const sync = SvXMLUnitConverter.convertNumLetterSync(number);
  const numbering = ` style:num-format="${escapeXml(units.convertNumFormat(number))}"${sync ? ' style:num-letter-sync="true"' : ""}`;
  return (
    attributes +
    exportPageScale(items) +
    ` style:writing-mode="${direction}"` +
    numbering +
    exportPageDecorations(items, measure)
  );
}

/** Omits individually zero or default scale properties as the original export mapper does. @param items - Native page style. @returns Scale attributes. */
function exportPageScale(items: SfxItemSet): string {
  const fit = items.GetItemIfSet(ATTR_PAGE_SCALETO, false) as ScPageScaleToItem | undefined;
  const pages = (
    items.GetItemIfSet(ATTR_PAGE_SCALETOPAGES, false) as SfxUInt16Item | undefined
  )?.GetValue();
  const scale = (
    items.GetItemIfSet(ATTR_PAGE_SCALE, false) as SfxUInt16Item | undefined
  )?.GetValue();
  const width = fit?.GetWidth(),
    height = fit?.GetHeight();
  return `${scale ? ` style:scale-to="${(scale << 16) >> 16}%"` : ""}${pages ? ` style:scale-to-pages="${(pages << 16) >> 16}"` : ""}${width ? ` style:scale-to-X="${(width << 16) >> 16}"` : ""}${height ? ` style:scale-to-Y="${(height << 16) >> 16}"` : ""}`;
}

/** Emits the shared page or header/footer brush and box properties. @param items - Native style group. @param measure - ODF length formatter. @returns ODF attributes. */
function exportPageDecorations(items: SfxItemSet, measure: (value: number) => string): string {
  const brush = items.GetItemIfSet(ATTR_BACKGROUND) as SvxBrushItem | undefined;
  const color = brush?.GetColor();
  const rgb = color?.IsFullyTransparent()
    ? "transparent"
    : "#" + ((color?.toUInt32() ?? 0) & 0xffffff).toString(16).padStart(6, "0");
  const background = brush ? ` fo:background-color="${rgb}"` : "";
  const box = items.GetItemIfSet(ATTR_BORDER) as SvxBoxItem | undefined;
  const borders = box ? exportPageBoxProperties(box, measure) : "";
  return background + borders;
}

/** Writes header/footer layout dimensions and adjacent body spacing from the actual nested page set. @param items - Page style. @param header - Header or footer selector. @returns XML fragment. */
function exportHeaderFooterLayout(items: SfxItemSet, header: boolean): string {
  const key = header ? "header" : "footer";
  const set = (
    items.Get(header ? ATTR_PAGE_HEADERSET : ATTR_PAGE_FOOTERSET) as SvxSetItem
  ).GetItemSet();
  if (!set.Count()) return "";
  const spacing = set.Get(ATTR_ULSPACE) as SvxULSpaceItem;
  const margins = set.Get(ATTR_LRSPACE) as SvxLRSpaceItem;
  const distance = header ? spacing.GetLower() : spacing.GetUpper();
  const height = (set.Get(ATTR_PAGE_SIZE) as SvxSizeItem).GetSize().Height();
  const dynamic = (set.Get(ATTR_PAGE_DYNAMIC) as SfxBoolItem).GetValue();
  /** Formats dimensions in the same output unit as the page layout. @param value - Native length. @returns ODF measure. */
  function measure(value: number): string {
    return units.convertMeasureToXML(value);
  }
  return `<style:${key}-style><style:header-footer-properties ${dynamic ? "fo:min-height" : "svg:height"}="${measure(height)}" fo:margin-${header ? "bottom" : "top"}="${measure(distance)}" fo:margin-left="${measure(margins.ResolveLeft())}" fo:margin-right="${measure(margins.ResolveRight())}"${exportPageDecorations(set, measure)}/></style:${key}-style>`;
}

/** Collects all native page styles and their automatic layouts. @param document - Workbook. @param fonts - Shared package font declarations. @returns XML records and style-name associations. */
export function exportPageStyles(
  document: ScDocument,
  fonts: XMLFontAutoStylePool,
): {
  readonly layouts: string;
  readonly masters: string;
  readonly names: ReadonlyMap<string, string>;
} {
  const names = new Map<string, string>();
  const layoutNames = new Map<string, string>();
  const textStyles = new CellTextStylePool(document, fonts, "HF");
  const styles = document.GetStyleSheetPool()?.CreateIterator(SfxStyleFamily.Page);
  let layouts = "",
    masters = "";
  for (let style = styles?.First(); style; style = styles?.Next()) {
    if (!(style instanceof SfxStyleSheetBase)) continue;
    const name = text(style.GetName());
    const master = encodeStyleName(name);
    names.set(name, master);
    const items = style.GetItemSet();
    const pageUsage = (items.Get(ATTR_PAGE) as SvxPageItem).GetPageUsage();
    const usage =
      [...usages].find(
        /** Matches the native page usage. @param entry - ODF token and native usage. @returns Whether the entry matches. */
        ([, value]) => value === pageUsage,
      )?.[0] ?? "all";
    const layoutBody = `<style:page-layout-properties ${exportLayout(items)}/>${exportHeaderFooterLayout(items, true)}${exportHeaderFooterLayout(items, false)}`;
    const layoutKey = `${usage}:${layoutBody}`;
    let layout = layoutNames.get(layoutKey);
    if (layout === undefined) {
      layout = `Mpm${layoutNames.size + 1}`;
      layoutNames.set(layoutKey, layout);
      layouts += `<style:page-layout style:name="${layout}" style:page-usage="${usage}">${layoutBody}</style:page-layout>`;
    }
    const display = master === name ? "" : ` style:display-name="${escapeXml(name)}"`;
    masters += `<style:master-page style:name="${master}"${display} style:page-layout-name="${layout}">${exportHeaderFooter(items, textStyles)}</style:master-page>`;
  }
  return {
    layouts: textStyles.exportStyles() + layouts,
    masters: masters ? `<office:master-styles>${masters}</office:master-styles>` : "",
    names,
  };
}
