/** @fileoverview Calc page styles bound through ODF page layouts and master pages. */
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SfxUInt16Item } from "../../../../svl/inc/intitem";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SvxPageItem } from "../../../../svx/inc/pageitem";
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
import type { ScPageScaleToItem } from "../../../inc/attrib";
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
  ATTR_PAGE_SCALE,
  ATTR_PAGE_SCALETOPAGES,
  ATTR_PAGE_SCALETO,
} from "../../../inc/scitems";

const units = new SvXMLUnitConverter("twip");
const flags = [
  [ATTR_PAGE_NOTES, "annotations"],
  [ATTR_PAGE_GRID, "grid"],
  [ATTR_PAGE_HEADERS, "headers"],
] as const;

/** Reads a bounded ODF scale or first-page integer. @param value - Source lexical value. @returns Native short value or absent. */
function short(value: string | null): number | undefined {
  if (value === null || !/^\+?\d+$/u.test(value)) return undefined;
  return Math.min(32767, Number(value));
}

/** Applies original page-layout properties to the actual page-family item set. @param items - Native style. @param properties - ODF layout properties. @returns Nothing. */
function importLayout(items: SfxItemSet, properties: ReadonlyMap<T, string>): void {
  const get =
    /** Reads one stored layout attribute. @param token - XML token. @returns Lexical value or null. */ (
      token: T,
    ): string | null => properties.get(token) ?? null;
  const landscape = get(T.STYLE_PRINT_ORIENTATION);
  if (landscape === "portrait" || landscape === "landscape") {
    const page = new SvxPageItem(ATTR_PAGE);
    page.SetLandscape(landscape === "landscape");
    items.Put(page);
  }
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

/** Resolves styles.xml master-page assignments against represented layout attributes. */
export class ScXMLPageStyles {
  private readonly layouts = new Map<string, ReadonlyMap<T, string>>();
  private readonly masterNames = new Map<string, string>();

  /** Binds the native style pool. @param document - Target workbook. @returns Import owner. */
  constructor(private readonly document: ScDocument) {}

  /** Creates a page layout SAX context. @param attributes - Layout attributes. @returns Subtree context. */
  CreateLayout(attributes: FastAttributeList): SvXMLImportContext {
    const name = attributes.get(T.STYLE_NAME) ?? "";
    return new XMLPageLayoutContext(this.layouts, name);
  }

  /** Creates a master-page SAX context. @returns Subtree context. */
  CreateMasterStyles(): SvXMLImportContext {
    return new XMLMasterStylesContext(this);
  }

  /** Looks up or creates the master-page style. @param attributes - Master-page attributes. @returns Nothing. */
  AddMasterPage(attributes: FastAttributeList): void {
    const name = attributes.get(T.STYLE_NAME);
    if (!name) return;
    const displayName = attributes.get(T.STYLE_DISPLAY_NAME) ?? name;
    const layout = this.layouts.get(attributes.get(T.STYLE_PAGE_LAYOUT_NAME) ?? "");
    const style = this.document.GetStyleSheetPool()?.GetPageStyle(displayName, true);
    if (!style) return;
    if (layout) importLayout(style.GetItemSet(), layout);
    this.masterNames.set(name, displayName);
  }

  /** Assigns the table family's master-page reference to the native sheet. @param tab - Destination sheet. @param master - XML style identity. @returns Nothing. */
  Apply(tab: number, master: string): void {
    const name = this.masterNames.get(master);
    if (name) this.document.SetPageStyle(tab, name);
  }
}

/** Collects the represented page-layout property element. */
class XMLPageLayoutContext extends SvXMLImportContext {
  /** Binds original layout identity and storage. @param layouts - Collected layouts. @param name - XML name. @returns Context. */
  constructor(
    private readonly layouts: Map<string, ReadonlyMap<T, string>>,
    private readonly name: string,
  ) {
    super();
  }
  /** Records the usable physical page properties. @param element - Child token. @param attributes - Source values. @returns Context. */
  override createFastChildContext(element: T, attributes: FastAttributeList): SvXMLImportContext {
    if (element === T.STYLE_PAGE_LAYOUT_PROPERTIES)
      this.layouts.set(this.name, new Map(attributes));
    return new SvXMLIgnoreContext(true);
  }
}

/** Resolves native master-page elements before Calc table content. */
class XMLMasterStylesContext extends SvXMLImportContext {
  /** Binds the Calc style importer. @param owner - Page style collector. @returns Context. */
  constructor(private readonly owner: ScXMLPageStyles) {
    super();
  }
  /** Imports original names and references while leaving unsupported page stories opaque to the parser. @param element - Child token. @param attributes - Source values. @returns Context. */
  override createFastChildContext(element: T, attributes: FastAttributeList): SvXMLImportContext {
    if (element === T.STYLE_MASTER_PAGE) this.owner.AddMasterPage(attributes);
    return new SvXMLIgnoreContext(true);
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
  const print: string[] = ["charts", "drawings", "objects", "zero-values"];
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
  return `fo:page-width="${measure(size.Width())}" fo:page-height="${measure(size.Height())}" style:print-orientation="${page.IsLandscape() ? "landscape" : "portrait"}" fo:margin-left="${measure(lr.ResolveLeft())}" fo:margin-right="${measure(lr.ResolveRight())}" fo:margin-top="${measure(ul.GetUpper())}" fo:margin-bottom="${measure(ul.GetLower())}" style:print="${print.join(" ")}" style:print-page-order="${flag(ATTR_PAGE_TOPDOWN) ? "ttb" : "ltr"}" style:table-centering="${center}" style:first-page-number="${first || "continue"}"${fitting}`;
}

/** Collects layout and master records needed by the actual document sheets. @param document - Workbook. @returns XML records and style-name associations. */
export function exportPageStyles(document: ScDocument): {
  readonly layouts: string;
  readonly masters: string;
  readonly names: ReadonlyMap<string, string>;
} {
  const names = new Map<string, string>();
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
    layouts += `<style:page-layout style:name="${layout}"><style:page-layout-properties ${exportLayout(style.GetItemSet())}/></style:page-layout>`;
    masters += `<style:master-page style:name="${master}" style:display-name="${escapeXml(name)}" style:page-layout-name="${layout}"/>`;
  }
  return {
    layouts,
    masters: masters ? `<office:master-styles>${masters}</office:master-styles>` : "",
    names,
  };
}
