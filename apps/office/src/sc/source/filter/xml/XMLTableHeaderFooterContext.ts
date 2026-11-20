/** @fileoverview Calc ODF master-page header/footer regions and native EditEngine values. */
import {
  EditTextObjectImpl,
  TextRotation,
  type EditTextObjectConstReference,
} from "../../../../editeng/inc/editobj";
import { CH_FEATURE } from "../../../../editeng/inc/editattr";
import * as EE from "../../../../editeng/inc/eeitem";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import {
  SvxFieldItem,
  SvxFileField,
  SvxPageField,
  SvxPagesField,
  SvxTableField,
  SvxTimeField,
  type SvxFieldData,
} from "../../../../editeng/inc/flditem";
import type { Section } from "../../../../editeng/inc/section";
import { SvtScriptType } from "../../../../svl/inc/languageoptions";
import { MapUnit } from "../../../../tools/inc/mapunit";
import { convert, Length } from "../../../../o3tl/inc/unit_conversion";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { XMLToken as T } from "../../../../xmloff/source/core/xmltoken";
import {
  SvXMLIgnoreContext,
  SvXMLImportContext,
  type FastAttributeList,
} from "../../../../xmloff/source/core/xmlimp";
import { exportText } from "../../../../xmloff/source/text/txtparae";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SvxSetItem } from "../../../../svx/inc/pageitem";
import type { CellTextStylePool } from "./xmlexprt.celltext";
import type { ScXMLImport } from "./xmlimprt";
import { ScPageHFItem } from "../../../inc/attrib";
import * as Which from "../../../inc/scitems";
import * as Field from "../../../../offapi/com/sun/star/text/textfield/Type";

const variants = [
  [
    T.STYLE_HEADER,
    "header",
    Which.ATTR_PAGE_HEADERSET,
    Which.ATTR_PAGE_HEADERRIGHT,
    Which.ATTR_PAGE_ON,
  ],
  [
    T.STYLE_HEADER_LEFT,
    "header-left",
    Which.ATTR_PAGE_HEADERSET,
    Which.ATTR_PAGE_HEADERLEFT,
    Which.ATTR_PAGE_SHARED,
  ],
  [
    T.STYLE_HEADER_FIRST,
    "header-first",
    Which.ATTR_PAGE_HEADERSET,
    Which.ATTR_PAGE_HEADERFIRST,
    Which.ATTR_PAGE_SHARED_FIRST,
  ],
  [
    T.STYLE_FOOTER,
    "footer",
    Which.ATTR_PAGE_FOOTERSET,
    Which.ATTR_PAGE_FOOTERRIGHT,
    Which.ATTR_PAGE_ON,
  ],
  [
    T.STYLE_FOOTER_LEFT,
    "footer-left",
    Which.ATTR_PAGE_FOOTERSET,
    Which.ATTR_PAGE_FOOTERLEFT,
    Which.ATTR_PAGE_SHARED,
  ],
  [
    T.STYLE_FOOTER_FIRST,
    "footer-first",
    Which.ATTR_PAGE_FOOTERSET,
    Which.ATTR_PAGE_FOOTERFIRST,
    Which.ATTR_PAGE_SHARED_FIRST,
  ],
] as const;
const regions = [T.STYLE_REGION_LEFT, T.STYLE_REGION_CENTER, T.STYLE_REGION_RIGHT];
const fieldTokens = new Map([
  [Field.PAGE, "page-number"],
  [Field.PAGES, "page-count"],
  [Field.TABLE, "sheet-name"],
  [Field.DOCINFO_TITLE, "title"],
  [Field.TIME, "time"],
]);

/** Returns the native field belonging to one ODF text element. @param element - XML token. @returns Field value or absence. */
function getField(element: T): SvxFieldData | undefined {
  switch (element) {
    case T.TEXT_PAGE_NUMBER:
      return new SvxPageField();
    case T.TEXT_PAGE_COUNT:
      return new SvxPagesField();
    case T.TEXT_SHEET_NAME:
      return new SvxTableField();
    case T.TEXT_TITLE:
      return new SvxFileField();
    case T.TEXT_TIME:
      return new SvxTimeField();
    default:
      return undefined;
  }
}

/** One ODF paragraph read into the original EditEngine paragraph storage. */
class HeaderFooterParagraph extends SvXMLImportContext {
  private readonly content: ReturnType<EditTextObjectImpl["CreateAndInsertContent"]>;
  private value = "";

  /** Binds the paragraph to its actual edit owner. @param edit - Native edit object. @param importer - Text-style owner. @returns Context. */
  constructor(
    private readonly edit: EditTextObjectImpl,
    private readonly importer: ScXMLImport,
  ) {
    super();
    this.content = edit.CreateAndInsertContent();
  }

  /** Applies lexical text, inheriting a span's original item set. @param value - Text. @param style - ODF text style. @param field - Optional native field. @returns Nothing. */
  append(value: string, style: string, field?: SvxFieldData): void {
    if (!value) return;
    const start = this.value.length;
    this.value += value;
    const attributes = this.content.GetCharAttribs();
    for (const item of this.importer.GetTextStyle(style)?.entries() ?? []) {
      const which = item.Which();
      if (
        which === EE.EE_CHAR_FONTHEIGHT ||
        which === EE.EE_CHAR_FONTHEIGHT_CJK ||
        which === EE.EE_CHAR_FONTHEIGHT_CTL
      ) {
        const height = Number(
          convert(BigInt((item as SvxFontHeightItem).GetHeight()), Length.mm100, Length.twip),
        );
        attributes.push(
          this.edit.CreateAttrib(
            new SvxFontHeightItem(height, 100, which),
            start,
            this.value.length,
          ),
        );
      } else attributes.push(this.edit.CreateAttrib(item, start, this.value.length));
    }
    if (field)
      attributes.push(
        this.edit.CreateAttrib(
          new SvxFieldItem(field, EE.EE_FEATURE_FIELD),
          start,
          this.value.length,
        ),
      );
  }

  /** Appends unformatted text. @param value - SAX characters. @returns Nothing. */
  override characters(value: string): void {
    this.append(value, "");
  }

  /** Dispatches styled spans and native text features. @param element - Child token. @param attributes - Source attributes. @returns Context. */
  override createFastChildContext(element: T, attributes: FastAttributeList): SvXMLImportContext {
    return this.child(element, attributes, "");
  }

  /** Applies the represented child in the current text style. @param element - Child token. @param attrs - Attributes. @param style - Inherited span style. @returns Context. */
  child(element: T, attrs: FastAttributeList, style: string): SvXMLImportContext {
    if (element === T.TEXT_SPAN)
      return new HeaderFooterSpan(this, attrs.get(T.TEXT_STYLE_NAME) ?? style);
    const field = getField(element);
    if (field) this.append(String.fromCharCode(CH_FEATURE), style, field);
    else if (element === T.TEXT_TAB) this.append("\t", style);
    else if (element === T.TEXT_LINE_BREAK) this.append("\n", style);
    else if (element === T.TEXT_S)
      this.append(
        " ".repeat(Math.max(1, Math.min(65535, attrs.getAsInteger(T.TEXT_C) ?? 1))),
        style,
      );
    return new SvXMLIgnoreContext();
  }

  /** Finalizes the paragraph's native text after its attributes are recorded. @returns Nothing. */
  override endFastElement(): void {
    const value = unicode(this.value);
    try {
      this.content.SetText(value);
    } finally {
      value.dispose();
    }
  }
}

/** Preserves an ODF text span's style through character and field callbacks. */
class HeaderFooterSpan extends SvXMLImportContext {
  /** Binds the actual paragraph and style name. @param paragraph - Native paragraph owner. @param style - ODF automatic style. @returns Context. */
  constructor(
    private readonly paragraph: HeaderFooterParagraph,
    private readonly style: string,
  ) {
    super();
  }
  /** Emits the span text. @param value - SAX characters. @returns Nothing. */
  override characters(value: string): void {
    this.paragraph.append(value, this.style);
  }
  /** Routes text features and nested spans. @param element - Child token. @param attrs - Attributes. @returns Context. */
  override createFastChildContext(element: T, attrs: FastAttributeList): SvXMLImportContext {
    return this.paragraph.child(element, attrs, this.style);
  }
}

/** Routes paragraph children into one original region. */
class XMLHeaderFooterRegionContext extends SvXMLImportContext {
  /** Retains the native edit owner and style resolver. @param edit - Region edit object. @param importer - Actual importer. @returns Context. */
  constructor(
    private readonly edit: EditTextObjectImpl,
    private readonly importer: ScXMLImport,
  ) {
    super();
  }
  /** Opens one edit paragraph. @param element - Child token. @returns Context. */
  override createFastChildContext(element: T): SvXMLImportContext {
    return element === T.TEXT_P
      ? new HeaderFooterParagraph(this.edit, this.importer)
      : new SvXMLIgnoreContext();
  }
}

/** Original master-page context for one header/footer variant. */
export class XMLTableHeaderFooterContext extends SvXMLImportContext {
  private readonly areas: readonly [EditTextObjectImpl, EditTextObjectImpl, EditTextObjectImpl];

  /** Configures original visibility and sharing, then allocates the owned edit values. @param items - Page style. @param variant - Header/footer record. @param attributes - Source element attributes. @param importer - ODF importer. @returns Context. */
  constructor(
    private readonly items: SfxItemSet,
    private readonly variant: (typeof variants)[number],
    attributes: FastAttributeList,
    private readonly importer: ScXMLImport,
  ) {
    super();
    const display = (attributes.get(T.STYLE_DISPLAY) ?? "true") === "true";
    const setting = variant[4];
    const group = (items.Get(variant[2]) as SvxSetItem).Clone();
    try {
      const set = group.GetItemSet();
      const enabled = (set.Get(Which.ATTR_PAGE_ON) as SfxBoolItem).GetValue();
      set.Put(
        new SfxBoolItem(
          setting,
          setting === Which.ATTR_PAGE_ON
            ? display
            : !(display && (setting === Which.ATTR_PAGE_SHARED_FIRST || enabled)),
        ),
      );
      items.Put(group);
    } finally {
      group.Dispose();
    }
    const pool = importer.GetDocument().GetEditEnginePool();
    const make = /** Creates the native region object. @returns Edit text. */ () =>
      new EditTextObjectImpl(pool, MapUnit.MapTwip, false, TextRotation.NONE, SvtScriptType.NONE);
    this.areas = [make(), make(), make()];
  }

  /** Opens the original region or an unwrapped center paragraph. @param element - Child token. @returns Context. */
  override createFastChildContext(element: T): SvXMLImportContext {
    const area = this.areas[regions.indexOf(element)];
    if (area) return new XMLHeaderFooterRegionContext(area, this.importer);
    return element === T.TEXT_P
      ? new HeaderFooterParagraph(this.areas[1], this.importer)
      : new SvXMLIgnoreContext();
  }

  /** Places three region objects in the actual page style. @returns Nothing. */
  override endFastElement(): void {
    const item = new ScPageHFItem(this.variant[3]);
    try {
      const [left, center, right] = this.areas;
      item.SetLeftArea(left);
      item.SetCenterArea(center);
      item.SetRightArea(right);
      this.items.Put(item);
    } finally {
      item.dispose();
      for (const area of this.areas) area.dispose();
    }
  }
}

/** Selects the original master-page child context. @param items - Page style. @param element - Child token. @param attributes - Element attributes. @param importer - Actual import owner. @returns Context. */
export function createHeaderFooterContext(
  items: SfxItemSet,
  element: T,
  attributes: FastAttributeList,
  importer: ScXMLImport,
): SvXMLImportContext {
  const variant = variants.find(
    /** Matches the native variant token. @param value - Variant record. @returns Match. */
    (value) => value[0] === element,
  );
  return variant
    ? new XMLTableHeaderFooterContext(items, variant, attributes, importer)
    : new SvXMLIgnoreContext(true);
}

/** Writes all represented text and fields in one ODF region. @param area - Actual edit text. @param styles - ODF automatic text style pool. @returns Region paragraphs. */
function exportArea(area: EditTextObjectConstReference, styles: CellTextStylePool): string {
  const sections: Section[] = [];
  area.GetAllSections(sections);
  let output = "";
  let index = 0;
  for (let paragraph = 0; paragraph < area.GetParagraphCount(); ++paragraph) {
    const native = area.GetText(paragraph);
    try {
      const value = text(native);
      output += "<text:p>";
      while (sections[index]?.mnParagraph === paragraph) {
        const section = sections[index++];
        if (!section || section.mnStart === section.mnEnd) continue;
        const attr = section.maAttributes.find(
          /** Identifies an edit feature field. @param item - Section item. @returns Whether field. */ (
            item,
          ) => item instanceof SvxFieldItem,
        );
        const field =
          attr instanceof SvxFieldItem
            ? fieldTokens.get(attr.GetField()?.GetClassId() ?? 0)
            : undefined;
        const span = field
          ? `<text:${field}/>`
          : attr
            ? ""
            : exportText(value.slice(section.mnStart, section.mnEnd));
        const style = styles.add(area, section, true);
        output += style ? `<text:span text:style-name="${style}">${span}</text:span>` : span;
      }
      output += "</text:p>";
    } finally {
      native.dispose();
    }
  }
  return output;
}

/** Serializes the native master page's headers and footers. @param items - Page style. @param styles - Text style pool. @returns ODF master-page children. */
export function exportHeaderFooter(items: SfxItemSet, styles: CellTextStylePool): string {
  let output = "";
  for (const [, tag, group, which, flag] of variants) {
    const value = items.GetItemIfSet(which) as ScPageHFItem | undefined;
    const set = (items.Get(group) as SvxSetItem).GetItemSet();
    const active = (set.Get(Which.ATTR_PAGE_ON) as SfxBoolItem).GetValue();
    const display =
      flag === Which.ATTR_PAGE_ON ? active : active && !(set.Get(flag) as SfxBoolItem).GetValue();
    if (!value && (flag === Which.ATTR_PAGE_ON ? set.Count() === 0 : !display)) continue;
    const areas = [value?.GetLeftArea(), value?.GetCenterArea(), value?.GetRightArea()];
    let child = "";
    for (const [index, area] of areas.entries()) {
      if (!area?.GetParagraphCount()) continue;
      const region = ["left", "center", "right"][index];
      child += `<style:region-${region}>${exportArea(area, styles)}</style:region-${region}>`;
    }
    output += `<style:${tag}${display ? "" : ' style:display="false"'}>${child}</style:${tag}>`;
  }
  return output;
}
