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
import { SvXMLUnitConverter } from "../../../../xmloff/source/core/xmluconv";
import { escapeXml } from "../../../../xmloff/source/text/txtparae";
import { SetPageScale } from "../../core/data/stlsheet";
import { ScViewObjectModeItem, type ScPageScaleToItem } from "../../../inc/attrib";
import { ScVObjMode } from "../../../inc/global";
import { CellTextStylePool } from "./xmlexprt.celltext";
import type { XMLFontAutoStylePool } from "../../../../xmloff/source/style/XMLFontAutoStylePool";
import { createHeaderFooterContext, exportHeaderFooter } from "./XMLTableHeaderFooterContext";
import type { ScXMLImport } from "./xmlimprt";
import type { ScDocument } from "../../../inc/document";
import {
  ATTR_BACKGROUND,
  ATTR_BORDER,
  ATTR_WRITINGDIR,
  ATTR_PAGE_CHARTS,
  ATTR_PAGE_DRAWINGS,
  ATTR_PAGE_OBJECTS,
  ATTR_PAGE_FORMULAS,
  ATTR_PAGE_NULLVALS,
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
  ATTR_PAGE_DYNAMIC,
  ATTR_PAGE_ON,
} from "../../../inc/scitems";

const units = new SvXMLUnitConverter("twip");
const flags = [
  [ATTR_PAGE_NOTES, "annotations"],
  [ATTR_PAGE_GRID, "grid"],
  [ATTR_PAGE_HEADERS, "headers"],
  [ATTR_PAGE_FORMULAS, "formulas"],
  [ATTR_PAGE_NULLVALS, "zero-values"],
] as const;
const objects = [
  [ATTR_PAGE_CHARTS, "charts"],
  [ATTR_PAGE_DRAWINGS, "drawings"],
  [ATTR_PAGE_OBJECTS, "objects"],
] as const;
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

/** Reads a bounded ODF scale or first-page integer. @param value - Source lexical value. @returns Native short value or absent. */
function short(value: string | null): number | undefined {
  if (value === null || !/^\+?\d+$/u.test(value)) return undefined;
  return Math.min(32767, Number(value));
}

/** Applies original page-layout properties to the actual page-family item set. @param items - Native style. @param properties - ODF layout properties. @returns Nothing. */
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
  const color = get(T.FO_BACKGROUND_COLOR);
  if (color === "transparent") items.Put(new SvxBrushItem(COL_TRANSPARENT, ATTR_BACKGROUND));
  else if (color && /^#[0-9a-f]{6}$/iu.test(color))
    items.Put(new SvxBrushItem(new Color(Number.parseInt(color.slice(1), 16)), ATTR_BACKGROUND));
  const box = (items.Get(ATTR_BORDER) as SvxBoxItem).Clone();
  if (importPageBoxProperties(box, properties, (value) => units.convertMeasureToCore(value)))
    items.Put(box);
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
  const print = get(T.STYLE_PRINT);
  if (print !== null) {
    const values = new Set(print.trim().split(/\s+/u));
    for (const [which, name] of flags) items.Put(new SfxBoolItem(which, values.has(name)));
    for (const [which, name] of objects)
      items.Put(
        new ScViewObjectModeItem(
          which,
          values.has(name) ? ScVObjMode.VOBJ_MODE_SHOW : ScVObjMode.VOBJ_MODE_HIDE,
        ),
      );
  }
  const center = get(T.STYLE_TABLE_CENTERING);
  if (center !== null) {
    items.Put(new SfxBoolItem(ATTR_PAGE_HORCENTER, center === "horizontal" || center === "both"));
    items.Put(new SfxBoolItem(ATTR_PAGE_VERCENTER, center === "vertical" || center === "both"));
  }
  const order = get(T.STYLE_PRINT_PAGE_ORDER);
  if (order === "ttb" || order === "ltr")
    items.Put(new SfxBoolItem(ATTR_PAGE_TOPDOWN, order === "ttb"));
  const first = get(T.STYLE_FIRST_PAGE_NUMBER);
  const firstPage = first === "continue" ? 0 : short(first);
  if (firstPage !== undefined) items.Put(new SfxUInt16Item(ATTR_PAGE_FIRSTPAGENO, firstPage));
  const x = short(get(T.STYLE_SCALE_TO_X) ?? get(T.LOEXT_SCALE_TO_X));
  const y = short(get(T.STYLE_SCALE_TO_Y) ?? get(T.LOEXT_SCALE_TO_Y));
  const total = short(get(T.STYLE_SCALE_TO_PAGES));
  const percent = get(T.STYLE_SCALE_TO);
  const scale = percent?.endsWith("%") ? short(percent.slice(0, -1)) : undefined;
  if (x !== undefined || y !== undefined || total !== undefined || scale !== undefined)
    SetPageScale(items, scale ?? 100, x || y ? 0 : (total ?? 0), x ?? 0, y ?? 0);
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
    const measure =
      /** Reads one ODF measure. @param token - Source attribute. @returns Twip length. */ (
        token: T,
      ) => units.convertMeasureToCore(properties.get(token) ?? "") ?? 0;
    const fixed = properties.has(T.SVG_HEIGHT);
    const spacing = measure(header ? T.FO_MARGIN_BOTTOM : T.FO_MARGIN_TOP);
    const height = measure(fixed ? T.SVG_HEIGHT : T.FO_MIN_HEIGHT);
    set.Put(new SfxBoolItem(ATTR_PAGE_DYNAMIC, !fixed));
    set.Put(new SvxSizeItem(ATTR_PAGE_SIZE, new Size(0, height + spacing)));
    set.Put(new SvxULSpaceItem(header ? 0 : spacing, header ? spacing : 0, ATTR_ULSPACE));
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
    // A master page enables its header and footer through their child elements.
    for (const which of [ATTR_PAGE_HEADERSET, ATTR_PAGE_FOOTERSET]) {
      const group = (items.Get(which) as SvxSetItem).Clone();
      try {
        group.GetItemSet().Put(new SfxBoolItem(ATTR_PAGE_ON, false));
        items.Put(group);
      } finally {
        group.Dispose();
      }
    }
    this.masterNames.set(name, displayName);
    const importer = this.importer;
    return new /** Native page-specific SAX context. */ (class extends SvXMLImportContext {
      /** Processes master-page header and footer child contexts. @param element - Child token. @param attrs - Child attributes. @returns Native child owner. */
      override createFastChildContext(element: T, attrs: FastAttributeList): SvXMLImportContext {
        return createHeaderFooterContext(items, element, attrs, importer);
      }
    })();
  }

  /** Assigns the table family's master-page reference to the native sheet. @param tab - Destination sheet. @param master - XML style identity. @returns Nothing. */
  Apply(tab: number, master: string): void {
    const name = this.masterNames.get(master);
    if (name) this.document.SetPageStyle(tab, name);
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
  const flag = /** Reads one effective page flag. @param which - Item identity. @returns Flag. */ (
    which: number,
  ): boolean => (items.Get(which) as SfxBoolItem).GetValue();
  const print: string[] = [];
  for (const [which, name] of objects)
    if ((items.Get(which) as ScViewObjectModeItem).GetValue() === ScVObjMode.VOBJ_MODE_SHOW)
      print.push(name);
  for (const [which, name] of flags) if (flag(which)) print.push(name);
  const h = flag(ATTR_PAGE_HORCENTER),
    v = flag(ATTR_PAGE_VERCENTER);
  const center = h && v ? "both" : h ? "horizontal" : v ? "vertical" : "none";
  const first = (items.Get(ATTR_PAGE_FIRSTPAGENO) as SfxUInt16Item).GetValue();
  const fit = items.GetItemIfSet(ATTR_PAGE_SCALETO, false) as ScPageScaleToItem | undefined;
  const pages = (items.Get(ATTR_PAGE_SCALETOPAGES) as SfxUInt16Item).GetValue();
  const scale = (items.Get(ATTR_PAGE_SCALE) as SfxUInt16Item).GetValue();
  const fitting = fit?.IsValid()
    ? ` style:scale-to-X="${fit.GetWidth()}" style:scale-to-Y="${fit.GetHeight()}"`
    : pages
      ? ` style:scale-to-pages="${pages}"`
      : ` style:scale-to="${scale || 100}%"`;
  const brush = items.GetItemIfSet(ATTR_BACKGROUND) as SvxBrushItem | undefined;
  const color = brush?.GetColor();
  const rgb = color?.IsFullyTransparent()
    ? "transparent"
    : "#" + ((color?.toUInt32() ?? 0) & 0xffffff).toString(16).padStart(6, "0");
  const background = brush ? ` fo:background-color="${rgb}"` : "";
  const box = items.GetItemIfSet(ATTR_BORDER) as SvxBoxItem | undefined;
  const borders = box ? exportPageBoxProperties(box, measure) : "";
  const dir = (items.Get(ATTR_WRITINGDIR) as SvxFrameDirectionItem).GetValue();
  const direction = [...directions].find(([, value]) => value === dir)?.[0] ?? "page";
  const number = page.GetNumType();
  const sync = SvXMLUnitConverter.convertNumLetterSync(number);
  const numbering = ` style:num-format="${escapeXml(units.convertNumFormat(number))}"${sync ? ' style:num-letter-sync="true"' : ""}`;
  return `fo:page-width="${measure(size.Width())}" fo:page-height="${measure(size.Height())}" style:print-orientation="${page.IsLandscape() ? "landscape" : "portrait"}" fo:margin-left="${measure(lr.ResolveLeft())}" fo:margin-right="${measure(lr.ResolveRight())}" fo:margin-top="${measure(ul.GetUpper())}" fo:margin-bottom="${measure(ul.GetLower())}" style:print="${print.join(" ")}" style:print-page-order="${flag(ATTR_PAGE_TOPDOWN) ? "ttb" : "ltr"}" style:table-centering="${center}" style:first-page-number="${first || "continue"}"${fitting} style:writing-mode="${direction}"${numbering}${background}${borders}`;
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
  const length = units.convertMeasureToXML(Math.max(0, height - distance));
  return `<style:${key}-style><style:header-footer-properties ${dynamic ? "fo:min-height" : "svg:height"}="${length}" fo:margin-${header ? "bottom" : "top"}="${units.convertMeasureToXML(distance)}" fo:margin-left="${units.convertMeasureToXML(margins.ResolveLeft())}" fo:margin-right="${units.convertMeasureToXML(margins.ResolveRight())}"/></style:${key}-style>`;
}

/** Collects layout and master records needed by the actual document sheets. @param document - Workbook. @param fonts - Shared package font declarations. @returns XML records and style-name associations. */
export function exportPageStyles(
  document: ScDocument,
  fonts: XMLFontAutoStylePool,
): {
  readonly layouts: string;
  readonly masters: string;
  readonly names: ReadonlyMap<string, string>;
} {
  const names = new Map<string, string>();
  const textStyles = new CellTextStylePool(document, fonts, "HF");
  const pool = document.GetStyleSheetPool();
  let layouts = "",
    masters = "";
  for (let tab = 0; tab < document.GetTableCount(); tab++) {
    const name = document.GetPageStyle(tab);
    if (names.has(name)) continue;
    const style = pool?.GetPageStyle(name);
    if (!style) continue;
    const layout = `pm${names.size + 1}`;
    const master = `MP${names.size + 1}`;
    names.set(name, master);
    const items = style.GetItemSet();
    const pageUsage = (items.Get(ATTR_PAGE) as SvxPageItem).GetPageUsage();
    const usage = [...usages].find(([, value]) => value === pageUsage)?.[0] ?? "all";
    layouts += `<style:page-layout style:name="${layout}" style:page-usage="${usage}"><style:page-layout-properties ${exportLayout(items)}/>${exportHeaderFooterLayout(items, true)}${exportHeaderFooterLayout(items, false)}</style:page-layout>`;
    masters += `<style:master-page style:name="${master}" style:display-name="${escapeXml(name)}" style:page-layout-name="${layout}">${exportHeaderFooter(items, textStyles)}</style:master-page>`;
  }
  return {
    layouts: textStyles.exportStyles() + layouts,
    masters: masters ? `<office:master-styles>${masters}</office:master-styles>` : "",
    names,
  };
}
