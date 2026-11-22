/**
 * @fileoverview Reimplements the bounded Writer ODF XML export bridge from pinned LibreOffice `sw/source/filter/xml/xmlexp.cxx`.
 */
import { ExportNumberFormat } from "../../../../xmloff/source/style/xmlnumfe";
import { SwBookmark } from "../../core/doc/docbm";
import { IsSquaredPageMode } from "../../core/doc/docdesc";
import { UseOnPage } from "../../core/layout/pagedesc";
import { PageStyleLayout } from "../../../../offapi/com/sun/star/style/PageStyleLayout";
import { exportPageUsage } from "../../../../xmloff/source/style/PageMasterStyleMap";
import { convertTwipToMm100 } from "../../../../tools/inc/UnitConversion";
import { Converter } from "../../../../sax/source/tools/converter";
import { writeNumberFormatAttributes } from "../../../../xmloff/source/style/numehelp";
import {
  getSwDefaultTextFormat,
  SwTableBoxFormula,
  SwTableBoxNumFormat,
  SwTableBoxValue,
} from "../../core/attr/cellatr";
import type { SvxProtectItem } from "../../../../editeng/source/items/frmitems";
import * as ParaItems from "../../../../editeng/source/items/paraitem.controls";
import {
  getTextFrameExportParagraphs,
  compareParagraphMarkers,
  projectAnchoredTextFrames,
  sectionParagraphs,
  type XMLBoundWriterFrames,
} from "./xmltextframe";
import { exportPageStoryStyles, getOdfPageStories } from "./xmlpageheaderfooter";
import type { SvXMLGraphicHelper } from "../../../../xmloff/source/core/xmlgrhlp";
import { CollectGraphicFlyFrames, CollectTextFlyFrames } from "../../core/layout/flycnt";
import type { XMLTextExportBlock } from "../../../../xmloff/source/table/XMLTableExport";
import {
  getBitmapFillItem,
  getFillProperties,
  XMLBitmapStyleExport,
  XML_FILL_WHICH_IDS,
} from "./xmlexp-fill";
import { RES_CHRATR_ESCAPEMENT, RES_CHRATR_KERNING } from "../../../inc/hintids";
import {
  RES_CHRATR_CROSSEDOUT,
  RES_CHRATR_ROTATE,
  RES_CHRATR_SCALEW,
  RES_CHRATR_EMPHASIS_MARK,
  RES_CHRATR_TWO_LINES,
} from "../../../inc/hintids";
import { RES_CHRATR_WORDLINEMODE, RES_CHRATR_AUTOKERN } from "../../../inc/hintids";
import {
  RES_CHRATR_LANGUAGE,
  RES_CHRATR_CJK_LANGUAGE,
  RES_CHRATR_CTL_LANGUAGE,
} from "../../../inc/hintids";
import { getCharacterProperties, projectXmlTextRuns } from "./xmlexp-character";
export { getCharacterProperties } from "./xmlexp-character";
import { projectWriterLineSpacing } from "../../core/text/itrform2";
import { sw_GetTableBoxColStr } from "../../core/table/swtable";
import { SwXMLTableLines } from "./xmltble";
import { VertOrientation } from "../../../../offapi/com/sun/star/text/VertOrientation";
import {
  exportBoxProperties,
  exportFrameVisualProperties,
  exportPageLayoutBox,
  exportPageWritingAndGrid,
  exportParagraphTabStops,
  XMLPageBackgroundExport,
} from "./xmlexpit";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { SwFrameSize, type SwFormatFrameSize } from "../../../inc/fmtfsize";
import { SvxAdjust, SvxAdjustItem } from "../../../../editeng/inc/adjustitem";
import { SvxTabStopItem } from "../../../../editeng/inc/tstpitem";
import { SvxLineSpacingItem } from "../../../../editeng/inc/lspcitem";
import {
  SvxFirstLineIndentItem,
  SvxRightMarginItem,
  SvxTextLeftMarginItem,
  SvxULSpaceItem,
  type SvxLRSpaceItem,
  SvxBoxItem,
} from "../../../../editeng/source/items/frmitems";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";
import type { SfxUInt16Item } from "../../../../svl/source/items/intitem";
import type { SwNumRule } from "../../core/doc/number";
import { SvxXMLNumRuleExport } from "../../../../xmloff/source/style/xmlnume";
import type { SwNumRuleItem } from "../../core/para/paratr";
import { exportParagraphStyleNumberingAttributes } from "../../../../xmloff/source/style/styleexp";
import { SwFormatPageDesc } from "../../core/attr/fmtpdsc";
import { SwFormatLineNumber } from "../../../inc/fmtline";
import {
  escapeXml,
  exportCharacterPropertyElement,
  exportParagraphAttributes,
  exportParagraphPropertyChildren,
  exportTextParagraphs,
  ODF_NAMESPACES,
  type OdfTextExport,
  type OdfCharacterProperties,
  type OdfParagraphAlignment,
  type OdfParagraphProperties,
  type XMLTextParagraphSource,
  type XMLTextParagraphMarker,
  type XMLTextListRuleSource,
} from "../../../../xmloff/source/text/txtparae";
import {
  RES_CHRATR_CJK_POSTURE,
  RES_BREAK,
  RES_PAGEDESC,
  RES_CHRATR_COLOR,
  RES_CHRATR_GRABBAG,
  RES_CHRATR_CJK_FONT,
  RES_CHRATR_CJK_FONTSIZE,
  RES_CHRATR_CJK_WEIGHT,
  RES_CHRATR_CTL_POSTURE,
  RES_CHRATR_CTL_FONT,
  RES_CHRATR_CTL_FONTSIZE,
  RES_CHRATR_FONT,
  RES_CHRATR_FONTSIZE,
  RES_CHRATR_CTL_WEIGHT,
  RES_CHRATR_BACKGROUND,
  RES_CHRATR_HIGHLIGHT,
  RES_CHRATR_POSTURE,
  RES_CHRATR_UNDERLINE,
  RES_CHRATR_OVERLINE,
  RES_CHRATR_CONTOUR,
  RES_CHRATR_SHADOWED,
  RES_CHRATR_RELIEF,
  RES_CHRATR_WEIGHT,
  RES_MARGIN_FIRSTLINE,
  RES_MARGIN_RIGHT,
  RES_MARGIN_TEXTLEFT,
  RES_PARATR_ADJUST,
  RES_PARATR_GRABBAG,
  RES_PARATR_SPLIT,
  RES_PARATR_ORPHANS,
  RES_PARATR_WIDOWS,
  RES_PARATR_VERTALIGN,
  RES_PARATR_LINESPACING,
  RES_PARATR_TABSTOP,
  RES_PARATR_LIST_ISCOUNTED,
  RES_PARATR_LIST_ID,
  RES_PARATR_LIST_ISRESTART,
  RES_PARATR_LIST_LEVEL,
  RES_PARATR_LIST_RESTARTVALUE,
  RES_PARATR_NUMRULE,
  RES_PARATR_CONNECT_BORDER,
  RES_PARATR_OUTLINELEVEL,
  RES_UL_SPACE,
  RES_FRM_SIZE,
  RES_LR_SPACE,
  RES_HORI_ORIENT,
  RES_LAYOUT_SPLIT,
  RES_COLLAPSING_BORDERS,
  RES_ROW_SPLIT,
  RES_BOX,
  RES_BOXATR_FORMAT,
  RES_BOXATR_FORMULA,
  RES_BOXATR_VALUE,
  RES_PROTECT,
  RES_VERT_ORIENT,
  RES_KEEP,
  RES_LINENUMBER,
} from "../../../inc/hintids";
import type { SwFormatVertOrient, SwFormatHoriOrient } from "../../../inc/fmtornt";
import type { SwFormatRowSplit } from "../../../inc/fmtrowsplt";
import type { SwFormatLayoutSplit } from "../../../inc/fmtlsplt";
import { WRITER_MAX_LIST_LEVEL } from "../../core/doc/list";
import { SwXNumberingRules } from "../../core/unocore/unosett";
import type { SwDoc } from "../../core/doc/doc";
import { SwTableNode, type SwStartNode } from "../../core/docnode/node";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { SwFormatAutoFormat } from "../../core/txtnode/txatbase";
import { RES_PARATR_LIST_AUTOFMT } from "../../../inc/hintids";
import type { SwCharFormat } from "../../../inc/charfmt";
import {
  getCharacterOdfStyleName,
  exportCharacterStyleNameAttributes,
  getParagraphOdfStyleName,
  exportParagraphStyleNameAttributes,
} from "./xmlexp-style-names";
import { createWriterFontAutoStylePool, registerWriterFontFace } from "./xmlfonte";
import { LineNumberPosition } from "../../../inc/lineinfo";
import { exportLineNumberingConfiguration } from "../../../../xmloff/source/text/XMLLineNumberingExport";
import { ExportThemeElement } from "../../../../xmloff/source/style/XMLThemeContext";
import { FontFamily, FontPitch } from "../../../../tools/inc/fontenum";
import { RTL_TEXTENCODING_DONTKNOW } from "../../../../sal/inc/rtl/textenc";
const OFFICE_NAMESPACES = `xmlns:draw="${ODF_NAMESPACES.draw}" xmlns:office="${ODF_NAMESPACES.office}" xmlns:style="${ODF_NAMESPACES.style}" xmlns:text="${ODF_NAMESPACES.text}" xmlns:table="${ODF_NAMESPACES.table}" xmlns:ooow="${ODF_NAMESPACES.ooow}" xmlns:number="${ODF_NAMESPACES.number}" xmlns:fo="${ODF_NAMESPACES.fo}" xmlns:svg="${ODF_NAMESPACES.svg}" xmlns:xlink="${ODF_NAMESPACES.xlink}" xmlns:loext="${ODF_NAMESPACES.loext}"`;

/** Serializes Writer named paragraph styles into styles.xml. @param document - Canonical SwDoc. @param graphicHelper - Optional package graphic owner. @param bitmapStyles - Package bitmap catalogue. @returns Complete XML. */
export function exportStylesXml(
  document: SwDoc,
  graphicHelper?: SvXMLGraphicHelper,
  bitmapStyles = new XMLBitmapStyleExport(graphicHelper),
): string {
  const fonts = createWriterFontAutoStylePool(document);
  const pageBackgrounds = new XMLPageBackgroundExport(bitmapStyles);
  for (const bitmap of document.GetBitmapTable().values()) bitmapStyles.registerBitmap(bitmap);
  if (graphicHelper) {
    for (const frame of document.GetSpzFrameFormats()) {
      const bitmap = getBitmapFillItem(frame.GetAttrSet());
      if (bitmap) bitmapStyles.registerBitmap(bitmap);
    }
  }
  const stories = Array.from(
    { length: document.GetPageDescCnt() },
    /** Selects native sections per page. @param _unused - Array placeholder. @param index - Page position. @returns Story list. */
    (_unused, index) => getOdfPageStories(document.GetPageDesc(index)),
  );
  const sections = [
    ...new Set(
      stories.flat().map(
        /** Shares the XML projection of each native text owner. @param story - Native page story. @returns Section. */
        (story) => story.start,
      ),
    ),
  ];
  const inheritedStyles = exportWriterText(
    document,
    /** Never cancels named style serialization. @returns False. */ () => false,
    /** Registers a font used by an inherited list base. @param family - Font family. @param generic - Generic family. @param styleName - Font style. @param pitch - Native pitch. @param charSet - Native encoding. @returns Face name. */
    (family, generic, styleName, pitch, charSet) =>
      registerWriterFontFace(fonts, family, generic, styleName, pitch, charSet),
    /** Borrows the existing pool without registering a bullet font. @param family - Family. @returns Existing face. */
    (family) =>
      fonts.Find(
        family,
        "",
        FontFamily.FAMILY_DONTKNOW,
        FontPitch.PITCH_DONTKNOW,
        RTL_TEXTENCODING_DONTKNOW,
      ) || undefined,
    sections.length ? sections : undefined,
    graphicHelper,
    bitmapStyles,
  );
  const namedRules = new Map(
    document
      .GetNumRuleTable()
      .filter(
        /** Applies this source-owned operation. @param rule - Native input. @returns Native result. */ (
          rule,
        ) => !rule.IsAutoRule(),
      )
      .map(
        /** Applies this source-owned operation. @param rule - Native input. @returns Native result. */ (
          rule,
        ) => [rule.GetName(), rule],
      ),
  );
  const styles = document.GetTextFormatColls().map(
    /** Emits one named Writer paragraph style. @param collection - Style collection. @returns Style XML. */
    (collection) => {
      assertSupportedItems(
        collection.GetAttrSet().entries(),
        `paragraph style ${collection.id}`,
        false,
        true,
      );
      const ruleItem = collection.GetAttrSet().GetItemIfSet(RES_PARATR_NUMRULE, false) as
        SwNumRuleItem | undefined;
      if (
        ruleItem !== undefined &&
        ruleItem.GetValue() !== "" &&
        ruleItem.GetValue() !== "Outline"
      ) {
        const rule = document.FindNumRulePtr(ruleItem.GetValue());
        if (rule === undefined)
          throw new Error(`ODT export cannot resolve style numbering rule ${ruleItem.GetValue()}.`);
        namedRules.set(rule.GetName(), rule);
      }
      const numberingAttributes = exportParagraphStyleNumberingAttributes(
        (
          collection.GetAttrSet().GetItemIfSet(RES_PARATR_OUTLINELEVEL, false) as
            SfxUInt16Item | undefined
        )?.GetValue(),
        (
          collection.GetAttrSet().GetItemIfSet(RES_PARATR_NUMRULE, false) as
            SwNumRuleItem | undefined
        )?.GetValue(),
      );
      const alignment = getDirectAlignment(
        collection.GetAttrSet().GetItemIfSet(RES_PARATR_ADJUST, false),
      );
      const name = getParagraphOdfStyleName(document, collection.id);
      const parentCollection = collection.DerivedFrom();
      const parent =
        parentCollection instanceof Object && "id" in parentCollection
          ? ` style:parent-style-name="${escapeXml(getParagraphOdfStyleName(document, String(parentCollection.id)))}"`
          : "";
      const leftMargin = getDirectLeftMargin(collection.GetAttrSet());
      const directParagraphProperties = getParagraphProperties(collection.GetAttrSet());
      const masterPage =
        directParagraphProperties?.pageStyleName === undefined
          ? ""
          : ` style:master-page-name="${escapeXml(directParagraphProperties.pageStyleName)}"`;
      const paragraphAttributes = [
        ...(alignment === undefined ? [] : [`fo:text-align="${exportAlignment(alignment)}"`]),
        ...(leftMargin === undefined ? [] : [`fo:margin-left="${exportOdfLength(leftMargin)}"`]),
        ...exportParagraphAttributes(directParagraphProperties ?? {}),
      ];
      const paragraphChildren = exportParagraphPropertyChildren(directParagraphProperties ?? {});
      const paragraphProperties =
        paragraphAttributes.length === 0 && paragraphChildren.length === 0
          ? ""
          : `<style:paragraph-properties${paragraphAttributes.length === 0 ? "" : ` ${paragraphAttributes.join(" ")}`}>${paragraphChildren}</style:paragraph-properties>`;
      const characterProperties = getCharacterProperties(collection.GetAttrSet(), false);
      const textProperties =
        characterProperties === undefined
          ? ""
          : exportCharacterPropertyElement(
              characterProperties,
              /** Registers one used font. @param family - Model family. @param generic - ODF generic family. @param styleName - Font style. @param pitch - Native pitch. @param charSet - Native encoding. @returns Face name. */ (
                family,
                generic,
                styleName,
                pitch,
                charSet,
              ) => registerWriterFontFace(fonts, family, generic, styleName, pitch, charSet),
            );
      const nextName = getParagraphOdfStyleName(document, collection.GetNextTextFormatColl().id);
      const next = nextName === name ? "" : ` style:next-style-name="${escapeXml(nextName)}"`;
      return `<style:style${exportParagraphStyleNameAttributes(collection)} style:family="paragraph"${next}${parent}${masterPage}${numberingAttributes}>${paragraphProperties}${textProperties}</style:style>`;
    },
  );
  const characterStyles = document
    .GetCharFormats()
    .slice(1)
    .map(
      /** Emits a common character style even when it has no direct properties. @param format - Document-owned format. @returns ODF style definition. */
      (format) => {
        const set = format.GetAttrSet();
        assertSupportedItems(set.entries(), `character style ${format.GetName()}`, false);
        const parent = format.DerivedFrom() as SwCharFormat | undefined;
        const basedOn =
          parent && parent !== document.GetDfltCharFormat()
            ? ` style:parent-style-name="${escapeXml(getCharacterOdfStyleName(parent))}"`
            : "";
        const properties = getCharacterProperties(set, false);
        const text =
          properties === undefined
            ? ""
            : exportCharacterPropertyElement(
                properties,
                /** Registers the style's native font with the styles stream. @param family - Font family. @param generic - Generic family. @param styleName - Font style. @param pitch - Native pitch. @param charSet - Native encoding. @returns Face name. */
                (family, generic, styleName, pitch, charSet) =>
                  registerWriterFontFace(fonts, family, generic, styleName, pitch, charSet),
              );
        return `<style:style${exportCharacterStyleNameAttributes(format)} style:family="text"${basedOn}>${text}</style:style>`;
      },
    );
  const pageLayouts: string[] = [];
  const masterPages: string[] = [];
  const gutterAtTop = document.GetDocumentSettingManager().get("GUTTER_AT_TOP");
  for (let index = 0; index < document.GetPageDescCnt(); index += 1) {
    const descriptor = document.GetPageDesc(index);
    const page = descriptor.GetValue();
    const master = descriptor.GetMaster();
    const gutter = Number(convertTwipToMm100(BigInt(master.GetLRSpace().GetGutterMargin())));
    const rtl = master.GetRtlGutter();
    const top = exportPageMargin(page.topMargin, gutterAtTop ? gutter : 0);
    const left = exportPageMargin(page.leftMargin, !gutterAtTop && !rtl ? gutter : 0);
    const right = exportPageMargin(page.rightMargin, !gutterAtTop && rtl ? gutter : 0);
    const usage = descriptor.GetUseOn();
    const layout =
      usage === UseOnPage.Mirror
        ? PageStyleLayout.MIRRORED
        : usage === UseOnPage.Left
          ? PageStyleLayout.LEFT
          : usage === UseOnPage.Right
            ? PageStyleLayout.RIGHT
            : PageStyleLayout.ALL;
    const layoutName = `pm${index + 1}`;
    const background = pageBackgrounds.exportBackground(master);
    const properties = `<style:page-layout-properties fo:page-width="${exportOdfLength(page.width)}" fo:page-height="${exportOdfLength(page.height)}" style:print-orientation="${page.landscape ? "landscape" : "portrait"}" fo:margin-top="${top}" fo:margin-bottom="${exportPageMargin(page.bottomMargin)}" fo:margin-left="${left}" fo:margin-right="${right}"${exportPageLayoutBox(master, exportOdfLength)}${exportPageWritingAndGrid(master)}${background.attributes}`;
    const content = background.children
      ? `${properties}>${background.children}</style:page-layout-properties>`
      : `${properties}/>`;
    pageLayouts.push(
      `<style:page-layout style:name="${layoutName}"${exportPageUsage(layout)}>${content}${exportPageStoryStyles(master, exportOdfLength, pageBackgrounds)}</style:page-layout>`,
    );
    const followName = descriptor.GetFollow().GetName();
    const follow =
      followName === descriptor.GetName()
        ? ""
        : ` style:next-style-name="${escapeXml(followName)}"`;
    const children = stories[index]
      ?.map(
        /** Writes the original ODF page story element. @param story - Variant text. @returns Serialized element. */
        ({ element, start, display }) =>
          `<style:${element}${display ? "" : ' style:display="false"'}>${inheritedStyles.sections?.[sections.indexOf(start)] ?? ""}</style:${element}>`,
      )
      .join("");
    const open = `<style:master-page style:name="${escapeXml(descriptor.GetName())}" style:page-layout-name="${layoutName}"${follow}`;
    masterPages.push(children ? `${open}>${children}</style:master-page>` : `${open}/>`);
  }
  const exporter = new SvxXMLNumRuleExport(
    escapeXml,
    /** Borrows existing declarations. @param family - Family. @returns Existing face. */
    (family) =>
      fonts.Find(
        family,
        "",
        FontFamily.FAMILY_DONTKNOW,
        FontPitch.PITCH_DONTKNOW,
        RTL_TEXTENCODING_DONTKNOW,
      ) || undefined,
  );
  const numberingStyles = [...namedRules.values()]
    .map(
      /** Emits the referenced named numbering definition, including rules absent from the current body. @param rule - Owned rule. @returns Definition XML. */
      (rule) =>
        `<text:list-style style:name="${escapeXml(rule.GetName())}">${projectNumberingRule(rule)
          .levels.map(
            /** Emits one supported native level. @param properties - Level properties. @param level - Level index. @returns XML. */
            (properties, level) => exporter.exportLevelStyle(level, properties),
          )
          .join("")}</text:list-style>`,
    )
    .join("");
  const info = document.GetLineNumberInfo();
  const lineInfo = info.QueryValue();
  const lineStyle = info.GetCharFormat();
  const lineNumbering = exportLineNumberingConfiguration({
    ...lineInfo,
    numberingType: info.GetNumType().GetNumberingType(),
    charStyleName: lineStyle ? getCharacterOdfStyleName(lineStyle) : undefined,
    distance:
      lineInfo.posFromLeft === 65535 ? 0 : Number(convertTwipToMm100(BigInt(lineInfo.posFromLeft))),
    position:
      lineInfo.position === LineNumberPosition.Right
        ? "right"
        : lineInfo.position === LineNumberPosition.Inside
          ? "inside"
          : lineInfo.position === LineNumberPosition.Outside
            ? "outside"
            : "left",
  });
  const defaults = exportDefaultParagraphStyle(document, fonts);
  const defaultPageLayout = IsSquaredPageMode(document)
    ? ""
    : '<style:default-page-layout><style:page-layout-properties style:layout-grid-standard-mode="true"/></style:default-page-layout>';
  return `<?xml version="1.0" encoding="UTF-8"?><office:document-styles ${OFFICE_NAMESPACES} office:version="1.3">${fonts.exportXML()}<office:styles>${defaultPageLayout}${defaults}${styles.join("")}${characterStyles.join("")}${numberingStyles}${inheritedStyles.namedStyles}${lineNumbering}${bitmapStyles.exportStyles()}${ExportThemeElement(document.theme)}</office:styles><office:automatic-styles>${pageLayouts.join("")}${sections.length ? inheritedStyles.automaticStyles : ""}</office:automatic-styles><office:master-styles>${masterPages.join("")}</office:master-styles></office:document-styles>`;
}

/** Exports the page margin and independently converted binding allowance in UNO units. @param twips - Base margin in Twips. @param gutter - Gutter in hundredths of a millimetre. @returns XML measure. */
function exportPageMargin(twips: number, gutter = 0): string {
  return Converter.convertMeasureToXML(Number(convertTwipToMm100(BigInt(twips))) + gutter, "mm100");
}

/** Writes the original ODF paragraph default-style tab distance and font properties from Writer's document pool. @param document - Writer document. @param fonts - Styles stream font-face pool. @returns ODF declaration. */
function exportDefaultParagraphStyle(
  document: SwDoc,
  fonts: ReturnType<typeof createWriterFontAutoStylePool>,
): string {
  const pool = document.GetAttrPool();
  const ranges = [
    [RES_CHRATR_FONT, RES_CHRATR_FONTSIZE],
    [RES_CHRATR_CJK_FONT, RES_CHRATR_CJK_FONTSIZE],
    [RES_CHRATR_CTL_FONT, RES_CHRATR_CTL_FONTSIZE],
  ] as const;
  const set = new SfxItemSet(pool, ranges);
  try {
    for (const range of ranges)
      for (const which of range) {
        const item = pool.GetUserDefaultItem(which);
        if (item) set.Put(item);
      }
    const properties = getCharacterProperties(set, false);
    const tabs = pool.GetUserDefaultItem(RES_PARATR_TABSTOP) as SvxTabStopItem | undefined;
    const distance = tabs?.Count() ? tabs.At(0).GetTabPos() : undefined;
    const paragraph =
      distance === undefined
        ? ""
        : `<style:paragraph-properties style:tab-stop-distance="${exportOdfLength(distance)}"/>`;
    if (!properties && !paragraph) return "";
    const element = properties
      ? exportCharacterPropertyElement(
          properties,
          /** Resolves the native declared font. @param family - Family. @param generic - ODF family. @param style - Family style. @param pitch - Pitch. @param charset - Encoding. @returns Face name. */
          (family, generic, style, pitch, charset) =>
            registerWriterFontFace(fonts, family, generic, style, pitch, charset),
        )
      : "";
    return `<style:default-style style:family="paragraph">${paragraph}${element}</style:default-style>`;
  } finally {
    set.Dispose();
  }
}

/** Serializes body nodes and automatic styles into content.xml. @param document - Canonical SwDoc. @param isCancelled - Cooperative cancellation probe. @param graphicHelper - Optional package graphic owner. @param bitmapStyles - Package bitmap catalogue. @returns Complete XML. */
export function exportContentXml(
  document: SwDoc,
  isCancelled: () => boolean = /** Never cancels. @returns False. */ () => false,
  graphicHelper?: SvXMLGraphicHelper,
  bitmapStyles?: XMLBitmapStyleExport,
): string {
  const fonts = createWriterFontAutoStylePool(document);
  const exported = exportWriterText(
    document,
    isCancelled,
    /** Registers one used font. @param family - Model family. @param generic - ODF generic family. @param styleName - Font style. @param pitch - Native pitch. @param charSet - Native encoding. @returns Face name. */
    (family, generic, styleName, pitch, charSet) =>
      registerWriterFontFace(fonts, family, generic, styleName, pitch, charSet),
    /** Borrows the existing pool without registering a bullet font. @param family - Family. @returns Existing face. */
    (family) =>
      fonts.Find(
        family,
        "",
        FontFamily.FAMILY_DONTKNOW,
        FontPitch.PITCH_DONTKNOW,
        RTL_TEXTENCODING_DONTKNOW,
      ) || undefined,
    undefined,
    graphicHelper,
    bitmapStyles,
  );
  return `<?xml version="1.0" encoding="UTF-8"?><office:document-content ${OFFICE_NAMESPACES} office:version="1.3">${fonts.exportXML()}<office:automatic-styles>${exported.automaticStyles}</office:automatic-styles><office:body><office:text>${exported.body}</office:text></office:body></office:document-content>`;
}

/** Projects the same model source for both package streams. @param document - Writer model. @param isCancelled - Cancellation probe. @param fontFaceName - Font registry. @param existingFontFaceName - Existing face lookup. @param sections - Master-page text owners in the styles stream. @param graphicHelper - Optional package graphic owner. @param bitmapStyles - Package bitmap catalogue. @returns Style/body fragments. */
function exportWriterText(
  document: SwDoc,
  isCancelled: () => boolean,
  fontFaceName: (
    family: string,
    generic?: string,
    styleName?: string,
    pitch?: FontPitch,
    charSet?: number,
  ) => string,
  existingFontFaceName: (family: string) => string | undefined,
  sections?: readonly SwStartNode[],
  graphicHelper?: SvXMLGraphicHelper,
  bitmapStyles?: XMLBitmapStyleExport,
): OdfTextExport {
  const anchored: XMLBoundWriterFrames = {
    text: CollectTextFlyFrames(document),
    ...(bitmapStyles ? { bitmapStyles } : {}),
    ...(graphicHelper ? { graphicHelper, graphics: CollectGraphicFlyFrames(document, true) } : {}),
  };
  const dataStyles = new Map<number, { name: string; xml: string } | null>();
  const exported = exportTextParagraphs(
    {
      /** Registers one referenced Writer format. @param key - Formatter identity. @returns ODF number style name. */
      exportNumberStyle(key) {
        if (!dataStyles.has(key)) {
          const name = `N${dataStyles.size + 1}`;
          const xml = ExportNumberFormat(document.GetNumberFormatter(), key, name);
          dataStyles.set(key, xml ? { name, xml } : null);
        }
        return dataStyles.get(key)?.name;
      },
      commonCharacterStyleNames: document.GetCharFormats().slice(1).map(getCharacterOdfStyleName),
      /** Iterates live Writer nodes without retaining a projection. @returns Paragraph source iterator. */
      *paragraphs(): Iterable<XMLTextParagraphSource> {
        for (const node of getTextFrameExportParagraphs(document, anchored.text))
          yield projectParagraph(node);
        for (const section of sections ?? [])
          for (const node of sectionParagraphs(document.nodes.GetSectionContent(section)))
            yield projectParagraph(node);
      },
      /** Iterates ordered direct body blocks and projects table cells through the same text exporter. @returns Body blocks. */
      *blocks() {
        for (const block of document.nodes.getBodyContent()) yield projectBlock(block, anchored);
      },
      ...(sections === undefined
        ? {}
        : {
            /** Projects all master-page text under the shared automatic style owner. @returns Ordered sections. */
            sections() {
              return sections.map(
                /** Projects one direct native text section. @param start - Section. @returns First-level XML blocks. */
                (start) =>
                  document.nodes.GetSectionContent(start).map(
                    /** Connects paragraphs and tables to the existing exporter. @param block - Direct section block. @returns XML block source. */
                    (block) => projectBlock(block, anchored),
                  ),
              );
            },
          }),
    },
    isCancelled,
    fontFaceName,
    existingFontFaceName,
  );
  let automaticStyles = "";
  for (const style of dataStyles.values()) if (style) automaticStyles += style.xml;
  return { ...exported, automaticStyles: automaticStyles + exported.automaticStyles };
}

/** Projects one original text or table node, including interleaved cell sections. @param block - Native node. @param anchored - Actual bound frame sets. @returns Neutral ODF body block. */
function projectBlock(
  block: SwTextNode | SwTableNode,
  anchored: XMLBoundWriterFrames,
): XMLTextExportBlock {
  if (!(block instanceof SwTableNode))
    return { kind: "paragraph", paragraph: projectParagraph(block, anchored) };
  const table = block.GetTable(),
    grid = new SwXMLTableLines(table);
  const items = table.GetFrameFormat().GetAttrSet();
  const size = items.GetItemIfSet(RES_FRM_SIZE, false) as SwFormatFrameSize | undefined;
  const orientation = items.GetItemIfSet(RES_HORI_ORIENT, false) as SwFormatHoriOrient | undefined;
  const orient = orientation?.GetHoriOrient();
  // Normal items require direct SET state; the native LR special handler searches parents for its orientation guard.
  const marginOrient = (
    items.GetItemIfSet(RES_HORI_ORIENT) as SwFormatHoriOrient | undefined
  )?.GetHoriOrient();
  const lr = items.GetItemIfSet(RES_LR_SPACE, false) as SvxLRSpaceItem | undefined;
  const ul = items.GetItemIfSet(RES_UL_SPACE, false) as SvxULSpaceItem | undefined;
  const split = items.GetItemIfSet(RES_LAYOUT_SPLIT, false) as SwFormatLayoutSplit | undefined;
  const borders = items.GetItemIfSet(RES_COLLAPSING_BORDERS, false) as SfxBoolItem | undefined;
  return {
    kind: "table" as const,
    table: {
      name: table.GetName(),
      columnName: sw_GetTableBoxColStr,
      format: {
        ...exportFrameVisualProperties(items),
        width: size?.GetWidthPercent() ? undefined : size?.GetWidth(),
        relativeWidth: size?.GetWidthPercent() || undefined,
        marginTop: ul?.GetUpper(),
        marginBottom: ul?.GetLower(),
        layoutSplit: split?.GetValue(),
        borderModel:
          borders === undefined ? undefined : borders.GetValue() ? "collapsing" : "separating",
        headerRows: table.GetRowsToRepeat(),
        repeatHeaderRows: table.GetRowsToRepeat() !== 0,
        align:
          orient === HoriOrientation.LEFT || orient === HoriOrientation.LEFT_AND_WIDTH
            ? "left"
            : orient === HoriOrientation.RIGHT
              ? "right"
              : orient === HoriOrientation.CENTER
                ? "center"
                : orient === HoriOrientation.FULL || orient === HoriOrientation.NONE
                  ? "margins"
                  : orient === undefined
                    ? undefined
                    : "",
        marginLeft:
          marginOrient === HoriOrientation.NONE || marginOrient === HoriOrientation.LEFT_AND_WIDTH
            ? lr?.ResolveLeft()
            : undefined,
        marginRight: marginOrient === HoriOrientation.NONE ? lr?.ResolveRight() : undefined,
      },
      columnWidths: grid.GetColumnWidths(),
      softPageBreakRows: table.GetSoftPageBreakRows(),
      rows: table.GetTabLines().map(
        /** Exports direct original row items. @param row - Original table line. @returns Filter-only row values. */ (
          row,
        ) => {
          const items = row.GetFrameFormat().GetAttrSet();
          const size = items.GetItemIfSet(RES_FRM_SIZE, false) as SwFormatFrameSize | undefined;
          const split = items.GetItemIfSet(RES_ROW_SPLIT, false) as SwFormatRowSplit | undefined;
          return {
            format: {
              background: exportFrameVisualProperties(items).background,
              keepTogether: split === undefined ? undefined : !split.GetValue(),
              ...(size?.GetHeightSizeType() === SwFrameSize.Minimum
                ? { minHeight: size.GetHeight() }
                : size?.GetHeightSizeType() === SwFrameSize.Fixed
                  ? { height: size.GetHeight() }
                  : {}),
            },
            cells: row.GetTabBoxes().map(
              /** Exports direct original box items. @param cell - Original table box. @returns Filter-only cell values. */ (
                cell,
              ) => {
                const items = cell.GetFrameFormat().GetAttrSet();
                const box = items.GetItemIfSet(RES_BOX, false) as SvxBoxItem | undefined;
                const orientation = items.GetItemIfSet(RES_VERT_ORIENT, false) as
                  SwFormatVertOrient | undefined;
                const orient = orientation?.GetVertOrient();
                const format = items.GetItemIfSet(RES_BOXATR_FORMAT, false) as
                  SwTableBoxNumFormat | undefined;
                const formula = items.GetItemIfSet(RES_BOXATR_FORMULA) as
                  SwTableBoxFormula | undefined;
                const value = items.GetItemIfSet(RES_BOXATR_VALUE) as SwTableBoxValue | undefined;
                const protect = items.GetItemIfSet(RES_PROTECT) as SvxProtectItem | undefined;
                const formatKey = format?.GetValue() ?? getSwDefaultTextFormat();
                const cellText = cell.GetParagraphs().some(
                  /** Checks the represented cell's text. @param paragraph - Cell text node. @returns Whether nonempty. */
                  (paragraph) => paragraph.GetText().length > 0,
                );
                let valueAttributes =
                  formatKey === getSwDefaultTextFormat() ? ' office:value-type="string"' : "";
                if (formatKey !== getSwDefaultTextFormat() && value && cellText) {
                  const formatter = cell.GetFrameFormat().GetDoc().GetNumberFormatter();
                  if (formatter.GetEntry(formatKey))
                    valueAttributes = writeNumberFormatAttributes(
                      formatter,
                      formatKey,
                      value.GetValue(),
                      formatter.GetNullDate(),
                    );
                }
                return {
                  valueAttributes,
                  formula: formula?.GetFormula(),
                  protected: protect?.IsContentProtected(),
                  columnSpan: grid.GetColumnSpan(cell),
                  rowSpan: cell.getRowSpan(),
                  format: {
                    ...exportBoxProperties(box),
                    ...exportFrameVisualProperties(items),
                    numberFormat: format?.GetValue(),
                    verticalAlign:
                      orient === undefined
                        ? undefined
                        : orient === VertOrientation.CENTER
                          ? "middle"
                          : orient === VertOrientation.BOTTOM
                            ? "bottom"
                            : orient === VertOrientation.TOP
                              ? "top"
                              : "",
                  },
                  content: cell.GetContentNodes().map(
                    /** Projects one actual cell text or table block. @param child - Native block. @returns ODF block. */
                    (child) => projectBlock(child, anchored),
                  ),
                };
              },
            ),
          };
        },
      ),
    },
  };
}

/** Serializes document metadata into meta.xml. @param title - Shell-owned title. @param locale - Stored document language. @returns Complete XML. */
export function exportMetaXml(title: string, locale?: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?><office:document-meta xmlns:office="${ODF_NAMESPACES.office}" xmlns:dc="${ODF_NAMESPACES.dc}" xmlns:meta="${ODF_NAMESPACES.meta}" office:version="1.3"><office:meta><dc:title>${escapeXml(title)}</dc:title>${locale === undefined ? "" : `<dc:language>${escapeXml(locale)}</dc:language>`}<meta:generator>vite-office LibreOffice TypeScript reimplementation</meta:generator></office:meta></office:document-meta>`;
}

/** Projects one canonical text node without leaking Writer ownership into xmloff. @param node - Source text node. @param anchored - Actual frame sets during body export. @returns Neutral paragraph. */
function projectParagraph(
  node: SwTextNode,
  anchored?: XMLBoundWriterFrames,
): XMLTextParagraphSource {
  const directItems = node.GetpSwAttrSet()?.entries() ?? [];
  assertSupportedItems(directItems, `paragraph at node ${node.GetIndex()}`, true);
  const ruleName = node.GetNumRuleName();
  const rule = node.GetNumRule();
  if (ruleName.length > 0 && rule === undefined)
    throw new Error(`ODT export cannot resolve SwNumRule ${ruleName} on node ${node.GetIndex()}.`);
  const listId = node.GetListId();
  const level = node.GetAttrListLevel();
  if (
    rule === undefined &&
    (listId.length > 0 ||
      (level !== 0 && !node.GetTextFormatColl().IsAssignedToListLevelOfOutlineStyle()))
  )
    throw new Error(
      `ODT export found list id or level without SwNumRule on node ${node.GetIndex()}.`,
    );
  const alignment = getDirectAlignment(
    node.GetpSwAttrSet()?.GetItemIfSet(RES_PARATR_ADJUST, false),
  );
  const hasDirectLeftMargin =
    node.GetpSwAttrSet()?.GetItemIfSet(RES_MARGIN_TEXTLEFT, false) !== undefined;
  const paragraphProperties = getParagraphProperties(node.GetpSwAttrSet());
  const marks = node.GetDoc().GetIDocumentMarkAccess();
  const frames = projectAnchoredTextFrames(node, anchored, projectBlock);
  const floatingOffsets = new Set<number>();
  for (const marker of frames)
    if (marker.kind === "frame" && marker.frame.anchor !== "as-char")
      floatingOffsets.add(marker.offset);
  const markers: XMLTextParagraphMarker[] = [
    ...frames,
    ...marks.GetAllMarks().flatMap(
      /** Projects bookmark endpoints on this paragraph. @param mark - Native bookmark. @returns Local ODF markers. */
      (mark): XMLTextParagraphMarker[] => {
        if (!(mark instanceof SwBookmark)) return [];
        const [start, end] = mark.GetMarkStartEnd();
        const name = mark.GetName();
        const offset = start.GetContentIndex();
        const collapsed = start.compare(end) === 0;
        const collapsedAroundFrame = collapsed && floatingOffsets.has(offset);
        const local: XMLTextParagraphMarker[] = [];
        if (start.GetNode() === node)
          local.push({
            kind: collapsed && !collapsedAroundFrame ? "bookmark" : "bookmark-start",
            name,
            offset,
            hidden: mark.IsHidden(),
            condition: mark.GetHideCondition(),
            collapsedAroundFrame,
          });
        if (end.GetNode() === node && (!collapsed || collapsedAroundFrame))
          local.push({
            kind: "bookmark-end",
            name,
            offset: end.GetContentIndex(),
            collapsedAroundFrame,
          });
        return local;
      },
    ),
    ...marks
      .GetSoftPageBreaks()
      .filter(
        /** Selects soft hints on this paragraph. @param position - Hint. @returns Whether owned. */
        (position) => position.GetNode() === node,
      )
      .map(
        /** Projects one soft hint. @param position - Hint. @returns Neutral marker. */
        (position) => ({
          kind: "soft-page-break" as const,
          offset: position.GetContentIndex(),
        }),
      ),
  ].sort(
    /** Orders portions in the source export phases. @param left - First portion. @param right - Second portion. @returns Portion order. */
    (left, right) => compareParagraphMarkers(left, right, floatingOffsets),
  );
  const directCharacterProperties = getCharacterProperties(node.GetpSwAttrSet(), false);
  const marker = node.GetSwAttrSet().GetItemIfSet(RES_PARATR_LIST_AUTOFMT, true);
  const markerProperties =
    marker instanceof SwFormatAutoFormat
      ? getCharacterProperties(marker.GetStyleHandle(), false)
      : undefined;
  return {
    ...(alignment === undefined ? {} : { alignment }),
    ...(hasDirectLeftMargin ? { leftMargin: node.GetParagraphTextLeftMargin() } : {}),
    ...(paragraphProperties === undefined ? {} : { paragraphProperties }),
    ...(markers.length === 0 ? {} : { markers }),
    ...(markerProperties === undefined ? {} : { markerProperties }),
    ...(rule !== undefined &&
    node.GetpSwAttrSet()?.GetItemIfSet(RES_PARATR_NUMRULE, false) !== undefined
      ? { directListRule: rule.GetName() }
      : {}),
    inheritedProperties: getCharacterProperties(
      node.GetSwAttrSet(),
      true,
    ) as OdfCharacterProperties,
    ...(rule === undefined
      ? {}
      : {
          list: {
            listId,
            level,
            counted: node.IsCountedInList(),
            restart: node.IsListRestart(),
            ...(node.IsListRestart() && node.HasAttrListRestartValue()
              ? { startValue: node.GetAttrListRestartValue() }
              : {}),
            rule: projectNumberingRule(rule),
          },
        }),
    ...(directCharacterProperties === undefined ? {} : { properties: directCharacterProperties }),
    runs: projectXmlTextRuns(node),
    style: node.GetParagraphStyle(),
    styleName: getParagraphOdfStyleName(node.GetDoc(), node.GetParagraphStyle()),
  };
}

/** Projects an owned numbering rule for common and automatic ODF definitions. @param rule - Native rule. @returns Neutral per-level properties. */
function projectNumberingRule(rule: SwNumRule): XMLTextListRuleSource {
  const properties = new SwXNumberingRules(rule);
  return {
    levels: Array.from(
      { length: WRITER_MAX_LIST_LEVEL + 1 },
      /** Reads the represented native numbering properties from their actual service owner. @param _unused - Array slot. @param index - Writer list level. @returns Level properties. */
      (_unused, index) => properties.GetPropertiesByIndex(index),
    ),
    name: rule.GetName(),
    isAutomatic: rule.IsAutoRule(),
  };
}

/** Rejects paragraph items outside this ODT slice. @param items - Direct items. @param owner - Error identity. @param allowListItems - Whether paragraph list items are valid. @param allowStyleNumbering - Whether named numbering style items are emitted. @returns Nothing. */
function assertSupportedItems(
  items: readonly { Which(): number }[],
  owner: string,
  allowListItems: boolean,
  allowStyleNumbering = false,
): void {
  const supported = new Set<number>([
    ...XML_FILL_WHICH_IDS,
    RES_PARATR_GRABBAG,
    RES_CHRATR_POSTURE,
    RES_CHRATR_COLOR,
    RES_CHRATR_GRABBAG,
    RES_CHRATR_FONT,
    RES_CHRATR_FONTSIZE,
    RES_CHRATR_UNDERLINE,
    RES_CHRATR_OVERLINE,
    RES_CHRATR_CONTOUR,
    RES_CHRATR_SHADOWED,
    RES_CHRATR_RELIEF,
    RES_CHRATR_ROTATE,
    RES_CHRATR_SCALEW,
    RES_CHRATR_EMPHASIS_MARK,
    RES_CHRATR_TWO_LINES,
    RES_CHRATR_ESCAPEMENT,
    RES_CHRATR_CROSSEDOUT,
    RES_CHRATR_WEIGHT,
    RES_CHRATR_WORDLINEMODE,
    RES_CHRATR_AUTOKERN,
    RES_CHRATR_KERNING,
    RES_CHRATR_CJK_POSTURE,
    RES_CHRATR_CJK_FONT,
    RES_CHRATR_CJK_FONTSIZE,
    RES_CHRATR_CJK_WEIGHT,
    RES_CHRATR_CTL_POSTURE,
    RES_CHRATR_CTL_FONT,
    RES_CHRATR_CTL_FONTSIZE,
    RES_CHRATR_CTL_WEIGHT,
    RES_CHRATR_BACKGROUND,
    RES_CHRATR_HIGHLIGHT,
    RES_CHRATR_LANGUAGE,
    RES_CHRATR_CJK_LANGUAGE,
    RES_CHRATR_CTL_LANGUAGE,
    RES_PARATR_ADJUST,
    RES_PARATR_SPLIT,
    RES_PARATR_ORPHANS,
    RES_PARATR_WIDOWS,
    RES_PARATR_VERTALIGN,
    RES_BREAK,
    RES_PAGEDESC,
    RES_PARATR_LINESPACING,
    RES_PARATR_TABSTOP,
    RES_MARGIN_FIRSTLINE,
    RES_MARGIN_RIGHT,
    RES_MARGIN_TEXTLEFT,
    RES_UL_SPACE,
    RES_KEEP,
    RES_LINENUMBER,
    RES_PARATR_CONNECT_BORDER,
    RES_BOX,
  ]);
  if (allowListItems)
    for (const which of [
      RES_PARATR_LIST_ISCOUNTED,
      RES_PARATR_LIST_ID,
      RES_PARATR_LIST_ISRESTART,
      RES_PARATR_LIST_LEVEL,
      RES_PARATR_LIST_RESTARTVALUE,
      RES_PARATR_LIST_AUTOFMT,
      RES_PARATR_NUMRULE,
    ])
      supported.add(which);
  if (allowStyleNumbering) {
    supported.add(RES_PARATR_NUMRULE);
    supported.add(RES_PARATR_OUTLINELEVEL);
  }
  const unsupported = items.find(
    /** Finds a non-alignment item. @param item - Direct pool item. @returns Whether unsupported. */
    (item) => !supported.has(item.Which()),
  );
  if (unsupported !== undefined)
    throw new Error(`ODT export does not support WhichId ${unsupported.Which()} on ${owner}.`);
}

/** Projects direct paragraph items to ODF properties. @param set - Optional item set. @returns Properties when present. */
function getParagraphProperties(set: SfxItemSet | undefined): OdfParagraphProperties | undefined {
  if (set === undefined) return undefined;
  const firstLine = set.GetItemIfSet(RES_MARGIN_FIRSTLINE, false);
  const right = set.GetItemIfSet(RES_MARGIN_RIGHT, false);
  const spacing = set.GetItemIfSet(RES_UL_SPACE, false);
  const lineSpacing = set.GetItemIfSet(RES_PARATR_LINESPACING, false);
  const tabStop = set.GetItemIfSet(RES_PARATR_TABSTOP, false);
  const keep = set.GetItemIfSet(RES_KEEP, false);
  const split = set.GetItemIfSet(RES_PARATR_SPLIT, false);
  const orphans = set.GetItemIfSet(RES_PARATR_ORPHANS, false);
  const widows = set.GetItemIfSet(RES_PARATR_WIDOWS, false);
  const verticalAlign = set.GetItemIfSet(RES_PARATR_VERTALIGN, false);
  const paragraphBreak = set.GetItemIfSet(RES_BREAK, false);
  const pageDesc = set.GetItemIfSet(RES_PAGEDESC, false);
  const lineNumber = set.GetItemIfSet(RES_LINENUMBER, false);
  const joinBorder = set.GetItemIfSet(RES_PARATR_CONNECT_BORDER, false);
  const box = set.GetItemIfSet(RES_BOX, false);
  if (
    (firstLine !== undefined && !(firstLine instanceof SvxFirstLineIndentItem)) ||
    (right !== undefined && !(right instanceof SvxRightMarginItem)) ||
    (spacing !== undefined && !(spacing instanceof SvxULSpaceItem)) ||
    (lineSpacing !== undefined && !(lineSpacing instanceof SvxLineSpacingItem)) ||
    (tabStop !== undefined && !(tabStop instanceof SvxTabStopItem)) ||
    (keep !== undefined && !(keep instanceof SfxBoolItem)) ||
    (split !== undefined && !(split instanceof ParaItems.SvxFormatSplitItem)) ||
    (orphans !== undefined && !(orphans instanceof ParaItems.SvxOrphansItem)) ||
    (widows !== undefined && !(widows instanceof ParaItems.SvxWidowsItem)) ||
    (verticalAlign !== undefined && !(verticalAlign instanceof ParaItems.SvxParaVertAlignItem)) ||
    (paragraphBreak !== undefined && !(paragraphBreak instanceof SfxInt16Item)) ||
    (pageDesc !== undefined && !(pageDesc instanceof SwFormatPageDesc)) ||
    (lineNumber !== undefined && !(lineNumber instanceof SwFormatLineNumber)) ||
    (joinBorder !== undefined && !(joinBorder instanceof SfxBoolItem)) ||
    (box !== undefined && !(box instanceof SvxBoxItem))
  )
    throw new Error("ODT paragraph item is invalid.");
  const properties: OdfParagraphProperties = {
    ...getFillProperties(set),
    ...(firstLine instanceof SvxFirstLineIndentItem
      ? {
          firstLineIndent: firstLine.ResolveTextFirstLineOffset(),
          autoTextIndent: firstLine.IsAutoFirst(),
        }
      : {}),
    ...(right instanceof SvxRightMarginItem ? { rightMargin: right.ResolveRight() } : {}),
    ...(spacing instanceof SvxULSpaceItem
      ? {
          upperSpacing: spacing.GetUpper(),
          lowerSpacing: spacing.GetLower(),
          contextualSpacing: spacing.GetContext(),
        }
      : {}),
    ...(lineSpacing instanceof SvxLineSpacingItem
      ? {
          ...(projectWriterLineSpacing(lineSpacing).mode === "proportional"
            ? { lineHeightPercent: projectWriterLineSpacing(lineSpacing).value }
            : projectWriterLineSpacing(lineSpacing).mode === "fixed"
              ? { lineHeightTwips: projectWriterLineSpacing(lineSpacing).value }
              : projectWriterLineSpacing(lineSpacing).mode === "minimum"
                ? { lineHeightAtLeastTwips: projectWriterLineSpacing(lineSpacing).value }
                : { lineSpacingTwips: projectWriterLineSpacing(lineSpacing).value }),
        }
      : {}),
    ...(tabStop instanceof SvxTabStopItem
      ? {
          tabStopDetails: exportParagraphTabStops(tabStop),
        }
      : {}),
    ...(keep instanceof SfxBoolItem ? { keepWithNext: keep.GetValue() } : {}),
    ...(split instanceof ParaItems.SvxFormatSplitItem ? { keepTogether: !split.GetValue() } : {}),
    ...(orphans instanceof ParaItems.SvxOrphansItem ? { orphans: orphans.GetValue() } : {}),
    ...(widows instanceof ParaItems.SvxWidowsItem ? { widows: widows.GetValue() } : {}),
    ...(verticalAlign instanceof ParaItems.SvxParaVertAlignItem
      ? { verticalAlign: verticalAlign.GetValue() }
      : {}),
    ...(paragraphBreak instanceof SfxInt16Item
      ? {
          breakBefore:
            paragraphBreak.GetValue() === 4 || paragraphBreak.GetValue() === 6
              ? ("page" as const)
              : ("auto" as const),
          breakAfter:
            paragraphBreak.GetValue() === 5 || paragraphBreak.GetValue() === 6
              ? ("page" as const)
              : ("auto" as const),
        }
      : {}),
    ...(pageDesc instanceof SwFormatPageDesc
      ? {
          pageStyleName: pageDesc.GetPageDescName(),
          pageNumber: pageDesc.GetNumOffset() ?? ("auto" as const),
        }
      : {}),
    ...(lineNumber instanceof SwFormatLineNumber
      ? { countLineNumbers: lineNumber.IsCount(), lineNumberStart: lineNumber.GetStartValue() }
      : {}),
    ...(joinBorder instanceof SfxBoolItem ? { joinBorder: joinBorder.GetValue() } : {}),
    ...(box instanceof SvxBoxItem ? exportBoxProperties(box) : {}),
  };
  return Object.keys(properties).length === 0 ? undefined : properties;
}

/** Projects a direct text-left margin. @param set - Item set. @returns Twips when directly set. */
function getDirectLeftMargin(set: SfxItemSet): number | undefined {
  const item = set.GetItemIfSet(RES_MARGIN_TEXTLEFT, false);
  if (item === undefined) return undefined;
  if (!(item instanceof SvxTextLeftMarginItem)) throw new Error("ODT left-margin item is invalid.");
  return item.ResolveTextLeft();
}

/** Serializes twips as a bounded ODF centimetre length. @param twips - Length. @returns ODF length. */
function exportOdfLength(twips: number): string {
  return `${Number(((twips * 2.54) / 1440).toFixed(4))}cm`;
}

/** Converts a direct adjustment item to model alignment. @param item - Optional pool item. @returns Alignment when directly set. */
function getDirectAlignment(item: unknown): OdfParagraphAlignment | undefined {
  if (item === undefined) return undefined;
  if (!(item instanceof SvxAdjustItem))
    throw new Error("ODT paragraph adjustment item is invalid.");
  const value = item.GetAdjust();
  if (value === SvxAdjust.Left || value === SvxAdjust.ParaStart) return "left";
  if (value === SvxAdjust.Right || value === SvxAdjust.ParaEnd) return "right";
  if (value === SvxAdjust.Center) return "center";
  if (value === SvxAdjust.Block) return "justify";
  throw new Error("ODT paragraph adjustment value is unsupported.");
}

/** Maps model alignment to ODF. @param alignment - Model value. @returns ODF value. */
function exportAlignment(alignment: OdfParagraphAlignment): string {
  if (alignment === "left") return "start";
  if (alignment === "right") return "end";
  return alignment;
}
