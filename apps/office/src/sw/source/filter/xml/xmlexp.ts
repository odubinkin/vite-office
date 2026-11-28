/**
 * @fileoverview Reimplements the bounded Writer ODF XML export bridge from pinned LibreOffice `sw/source/filter/xml/xmlexp.cxx`.
 */
import { GetRedlineAuthor } from "../../core/doc/docredln";
import type { SwRedlineData } from "../../core/doc/docredln";
import { SwFormatCharFormat } from "../../core/txtnode/fmtatr2";
import { RES_TXTATR_CHARFMT } from "../../../inc/hintids";
import type { XMLRedlineStyleSource } from "../../../../xmloff/source/text/txtparae";
import { SvxHyphenZoneItem } from "../../../../editeng/source/items/paraitem";
import { IsSquaredPageMode } from "../../core/doc/docdesc";
import { UseOnPage } from "../../core/layout/pagedesc";
import { PageStyleLayout } from "../../../../offapi/com/sun/star/style/PageStyleLayout";
import { SvXMLUnitConverter } from "../../../../xmloff/source/core/xmluconv";
import { exportPageUsage } from "../../../../xmloff/source/style/PageMasterStyleMap";
import { convertTwipToMm100 } from "../../../../tools/inc/UnitConversion";
import { Converter } from "../../../../sax/source/tools/converter";
import { RedlineType } from "../../../../svx/inc/ctredlin";
import { RedlineFlags } from "../../../inc/IDocumentRedlineAccess";
import {
  exportTrackedChanges,
  type XMLRedlineChange,
} from "../../../../xmloff/source/text/XMLRedlineExport";
import { exportPageStoryStyles, getOdfPageStories } from "./xmlpageheaderfooter";
import type { SvXMLGraphicHelper } from "../../../../xmloff/source/core/xmlgrhlp";
import { getBitmapFillItem, XMLBitmapStyleExport } from "./xmlexp-fill";
import { RES_CHRATR_AUTOKERN, RES_CHRATR_OPTICAL_SIZING } from "../../../inc/hintids";
import { getCharacterProperties } from "./xmlexp-character";
import { exportPageLayoutBox, exportPageWritingAndGrid, XMLPageBackgroundExport } from "./xmlexpit";
import { SvxTabStopItem } from "../../../../editeng/inc/tstpitem";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SfxUInt16Item } from "../../../../svl/source/items/intitem";
import { SvxXMLNumRuleExport } from "../../../../xmloff/source/style/xmlnume";
import type { SwNumRuleItem } from "../../core/para/paratr";
import {
  exportParagraphStyleNumberingAttributes,
  exportStyleNameAttributes,
} from "../../../../xmloff/source/style/styleexp";
import { encodeStyleName } from "../../../../xmloff/source/core/xmluconv";
import {
  escapeXml,
  exportCharacterPropertyElement,
  exportParagraphAttributes,
  exportParagraphPropertyChildren,
  ODF_NAMESPACES,
} from "../../../../xmloff/source/text/txtparae";
import {
  RES_CHRATR_CJK_FONT,
  RES_CHRATR_CJK_FONTSIZE,
  RES_CHRATR_CTL_FONT,
  RES_CHRATR_CTL_FONTSIZE,
  RES_CHRATR_FONT,
  RES_CHRATR_FONTSIZE,
  RES_PARATR_ADJUST,
  RES_PARATR_HYPHENZONE,
  RES_PARATR_TABSTOP,
  RES_PARATR_NUMRULE,
  RES_PARATR_OUTLINELEVEL,
} from "../../../inc/hintids";
import type { SwDoc } from "../../core/doc/doc";
import type { SwCharFormat } from "../../../inc/charfmt";
import {
  getCharacterOdfStyleName,
  exportCharacterStyleNameAttributes,
  getParagraphOdfStyleName,
  exportParagraphStyleNameAttributes,
} from "./xmlexp-style-names";
import { createWriterFontAutoStylePool, registerWriterFontFace } from "./xmlfonte";
import { LineNumberPosition } from "../../../inc/lineinfo";
import { exportSequenceDeclarations } from "../../../../xmloff/source/text/txtflde";
import { exportLineNumberingConfiguration } from "../../../../xmloff/source/text/XMLLineNumberingExport";
import { ExportThemeElement } from "../../../../xmloff/source/style/XMLThemeContext";
import { FontFamily, FontPitch } from "../../../../tools/inc/fontenum";
import { RTL_TEXTENCODING_DONTKNOW } from "../../../../sal/inc/rtl/textenc";
import {
  exportWriterVariableDeclarations,
  exportWriterText,
  projectNumberingRule,
  assertSupportedItems,
  getParagraphProperties,
  getDirectLeftMargin,
  exportOdfLength,
  getDirectAlignment,
} from "./xmlexp-text";
export { getCharacterProperties } from "./xmlexp-character";

const OFFICE_NAMESPACES = `xmlns:draw="${ODF_NAMESPACES.draw}" xmlns:office="${ODF_NAMESPACES.office}" xmlns:style="${ODF_NAMESPACES.style}" xmlns:text="${ODF_NAMESPACES.text}" xmlns:table="${ODF_NAMESPACES.table}" xmlns:ooow="${ODF_NAMESPACES.ooow}" xmlns:number="${ODF_NAMESPACES.number}" xmlns:fo="${ODF_NAMESPACES.fo}" xmlns:svg="${ODF_NAMESPACES.svg}" xmlns:xlink="${ODF_NAMESPACES.xlink}" xmlns:loext="${ODF_NAMESPACES.loext}" xmlns:dc="${ODF_NAMESPACES.dc}" xmlns:meta="${ODF_NAMESPACES.meta}"`;

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
          : ` style:master-page-name="${escapeXml(encodeStyleName(directParagraphProperties.pageStyleName))}"`;
      const paragraphAttributes = [
        ...(alignment === undefined ? [] : [`fo:text-align="${alignment}"`]),
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
        characterProperties === undefined && directParagraphProperties?.hyphenation === undefined
          ? ""
          : exportCharacterPropertyElement(
              characterProperties ?? {},
              /** Registers one used font. @param family - Model family. @param generic - ODF generic family. @param styleName - Font style. @param pitch - Native pitch. @param charSet - Native encoding. @returns Face name. */ (
                family,
                generic,
                styleName,
                pitch,
                charSet,
              ) => registerWriterFontFace(fonts, family, generic, styleName, pitch, charSet),
              directParagraphProperties ?? {},
              true,
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
                undefined,
                true,
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
    const register = descriptor.GetRegisterFormatColl();
    const registerProperty = register
      ? ` style:register-truth-ref-style-name="${escapeXml(getParagraphOdfStyleName(document, register.id))}"`
      : "";
    const numberingType = descriptor.GetNumType().GetNumberingType();
    const numberingFormat = new SvXMLUnitConverter("mm100").convertNumFormat(numberingType);
    const letterSync = SvXMLUnitConverter.convertNumLetterSync(numberingType);
    const numbering =
      ` style:num-format="${escapeXml(numberingFormat)}"` +
      (letterSync ? ` style:num-letter-sync="${letterSync}"` : "");
    const properties = `<style:page-layout-properties fo:page-width="${exportOdfLength(page.width)}" fo:page-height="${exportOdfLength(page.height)}" style:print-orientation="${page.landscape ? "landscape" : "portrait"}" fo:margin-top="${top}" fo:margin-bottom="${exportPageMargin(page.bottomMargin)}" fo:margin-left="${left}" fo:margin-right="${right}"${exportPageLayoutBox(master, exportOdfLength)}${exportPageWritingAndGrid(master)}${registerProperty}${background.attributes}${numbering}`;
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
        : ` style:next-style-name="${escapeXml(encodeStyleName(followName))}"`;
    const children = stories[index]
      ?.map(
        /** Writes the original ODF page story element. @param story - Variant text. @returns Serialized element. */
        ({ element, start, display }) =>
          `<style:${element}${display ? "" : ' style:display="false"'}>${inheritedStyles.sections?.[sections.indexOf(start)] ?? ""}</style:${element}>`,
      )
      .join("");
    const name = descriptor.GetName();
    const nameAttributes = exportStyleNameAttributes(name, encodeStyleName(name));
    const open = `<style:master-page${nameAttributes} style:page-layout-name="${layoutName}"${follow}`;
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
    graphicHelper,
  );
  const outline = document.GetOutlineNumRule();
  const chapterStyles = projectNumberingRule(outline)
    .levels.map(
      /** Emits a chapter level and its connected label character style. @param properties - Native level properties. @param level - Original level. @returns ODF outline level. */
      (properties, level) => {
        const charStyle = outline.Get(level).GetCharFormat();
        return exporter.exportLevelStyle(
          level,
          {
            ...properties,
            ...(charStyle ? { charStyleName: getCharacterOdfStyleName(charStyle) } : {}),
          },
          true,
        );
      },
    )
    .join("");
  const outlineName = outline.GetName();
  const outlineStyle = `<text:outline-style${exportStyleNameAttributes(outlineName, encodeStyleName(outlineName))}>${chapterStyles}</text:outline-style>`;
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
  return `<?xml version="1.0" encoding="UTF-8"?><office:document-styles ${OFFICE_NAMESPACES} office:version="1.3">${fonts.exportXML()}<office:styles>${defaultPageLayout}${defaults}${styles.join("")}${characterStyles.join("")}${outlineStyle}${numberingStyles}${inheritedStyles.namedStyles}${lineNumbering}${bitmapStyles.exportStyles()}${ExportThemeElement(document.theme)}</office:styles><office:automatic-styles>${pageLayouts.join("")}${sections.length ? inheritedStyles.automaticStyles : ""}</office:automatic-styles><office:master-styles>${masterPages.join("")}</office:master-styles></office:document-styles>`;
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
    [RES_CHRATR_AUTOKERN, RES_CHRATR_AUTOKERN],
    [RES_CHRATR_CJK_FONT, RES_CHRATR_CJK_FONTSIZE],
    [RES_CHRATR_CTL_FONT, RES_CHRATR_CTL_FONTSIZE],
    [RES_CHRATR_OPTICAL_SIZING, RES_CHRATR_OPTICAL_SIZING],
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
    const item = pool.GetUserDefaultItem(RES_PARATR_HYPHENZONE);
    const deltas = item instanceof SvxHyphenZoneItem ? { hyphenation: item.QueryValue() } : {};
    const attributes = [
      ...(distance === undefined ? [] : [`style:tab-stop-distance="${exportOdfLength(distance)}"`]),
      ...exportParagraphAttributes(deltas),
    ];
    const paragraph = attributes.length
      ? `<style:paragraph-properties ${attributes.join(" ")}/>`
      : "";
    if (!properties && !paragraph) return "";
    const element =
      properties || deltas.hyphenation
        ? exportCharacterPropertyElement(
            properties ?? {},
            /** Resolves the native declared font. @param family - Family. @param generic - ODF family. @param style - Family style. @param pitch - Pitch. @param charset - Encoding. @returns Face name. */
            (family, generic, style, pitch, charset) =>
              registerWriterFontFace(fonts, family, generic, style, pitch, charset),
            deltas,
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
  const redlineAccess = document.GetIDocumentRedlineAccess();
  const redlines = redlineAccess.GetRedlineTable().entries();
  const redlineStyles: XMLRedlineStyleSource[] = [];
  const styleKeys = new Map<SwRedlineData, string>();
  for (const range of redlines) {
    const data = range.GetRedlineData();
    const items = data.GetExtraData()?.GetItemSet();
    if (!items) continue;
    const named = items.GetItemIfSet(RES_TXTATR_CHARFMT, false);
    const format = named instanceof SwFormatCharFormat ? named.GetCharFormat() : undefined;
    const parent = format ? getCharacterOdfStyleName(format) : "";
    const properties = getCharacterProperties(items, false);
    const key = String(redlineStyles.length);
    styleKeys.set(data, key);
    redlineStyles.push({ key, parent, ...(properties ? { properties } : {}) });
  }
  const deletionSections = redlines.flatMap(
    /** Projects each actual saved redline section into the shared automatic style pass. @param redline - Change. @returns Saved section if present. */
    (redline) => {
      const section = redline.GetContentStart();
      return section ? [section] : [];
    },
  );
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
    deletionSections.length ? deletionSections : undefined,
    graphicHelper,
    bitmapStyles,
    redlineStyles,
  );
  let deletionIndex = 0;
  const changes = exportTrackedChanges(
    redlines.map(
      /** Reads the change chain and its already formatted deletion section. @param range - Native redline. @returns Changed region. */
      (range) => {
        const changes: XMLRedlineChange[] = [];
        for (let data = range.GetRedlineData(); data;) {
          const type = data.GetType();
          changes.push({
            type:
              type === RedlineType.Insert
                ? "insertion"
                : type === RedlineType.Delete
                  ? "deletion"
                  : "format-change",
            author: GetRedlineAuthor(data.GetAuthor()),
            date: data.GetTimeStamp().GetUNODateTime(),
            comment: data.GetComment(),
            movedId: data.GetMovedID(),
            styleName: exported.redlineStyleNames.get(styleKeys.get(data) ?? "") ?? "",
          });
          const next = data.GetNext();
          if (!next) break;
          data = next;
        }
        if (range.GetContentIdx()) {
          const deletion = exported.sections?.[deletionIndex++];
          const first = changes[0];
          if (first && deletion !== undefined) changes[0] = { ...first, deletion };
        }
        return { id: `ct${range.GetId()}`, mergeLastParagraph: !range.IsDeleteLastPara(), changes };
      },
    ),
    Boolean(redlineAccess.GetRedlineFlags() & RedlineFlags.On),
    escapeXml,
  );
  const sequences = exportSequenceDeclarations(
    Array.from(
      document.getIDocumentFieldsAccess().GetSequenceFieldTypes(),
      /** Reads original master values. @param type - Native sequence field type. @returns ODF declaration properties. */
      (type) => ({
        name: type.GetName(),
        level: (type.GetOutlineLvl() << 24) >> 24,
        separator: type.GetDelimiter(),
      }),
    ),
    escapeXml,
  );
  const { variables, users } = exportWriterVariableDeclarations(document);
  return `<?xml version="1.0" encoding="UTF-8"?><office:document-content ${OFFICE_NAMESPACES} office:version="1.3">${fonts.exportXML()}<office:automatic-styles>${exported.automaticStyles}</office:automatic-styles><office:body><office:text>${changes}${variables}${sequences}${users}${exported.body}</office:text></office:body></office:document-content>`;
}

/** Serializes document metadata into meta.xml. @param title - Shell-owned title. @param locale - Stored document language. @param statistics - Generated document statistics element. @returns Complete XML. */
export function exportMetaXml(title: string, locale?: string, statistics = ""): string {
  return `<?xml version="1.0" encoding="UTF-8"?><office:document-meta xmlns:office="${ODF_NAMESPACES.office}" xmlns:dc="${ODF_NAMESPACES.dc}" xmlns:meta="${ODF_NAMESPACES.meta}" office:version="1.3"><office:meta><dc:title>${escapeXml(title)}</dc:title>${locale === undefined ? "" : `<dc:language>${escapeXml(locale)}</dc:language>`}<meta:generator>vite-office LibreOffice TypeScript reimplementation</meta:generator>${statistics}</office:meta></office:document-meta>`;
}
