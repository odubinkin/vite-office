/**
 * @fileoverview Reimplements the bounded Writer ODF XML export bridge from pinned LibreOffice `sw/source/filter/xml/xmlexp.cxx`.
 */
import { SvxEscapementItem } from "../../../../editeng/inc/escapementitem";
import { RES_CHRATR_ESCAPEMENT } from "../../../inc/hintids";

import { SvxCrossedOutItem } from "../../../../editeng/inc/crossedoutitem";
import { RES_CHRATR_CROSSEDOUT } from "../../../inc/hintids";
import {
  SvxFontItem,
  SvxFontHeightItem,
  SvxWeightItem,
  SvxPostureItem,
  SvxUnderlineItem,
} from "../../../../editeng/source/items/textitem";
import { SfxStringItem } from "../../../../svl/source/items/stritem";
import { ConvertFontWeight, ConvertFontSlant } from "../../../../vcl/inc/unohelp";
import { getFontFamilyGeneric } from "../../../../xmloff/source/style/fonthdl";
import { projectWriterLineSpacing } from "../../core/text/itrform2";

import { SwXMLTableLines } from "./xmltble";
import { VertOrientation } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { exportBoxProperties } from "./xmlexpit";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { SwFrameSize, type SwFormatFrameSize } from "../../../inc/fmtfsize";
import { SvxAdjust, SvxAdjustItem } from "../../../../editeng/inc/adjustitem";
import { SvxTabStopItem, SvxTabAdjust } from "../../../../editeng/inc/tstpitem";
import { SvxLineSpacingItem } from "../../../../editeng/inc/lspcitem";
import {
  SvxFirstLineIndentItem,
  SvxRightMarginItem,
  SvxTextLeftMarginItem,
  SvxULSpaceItem,
  type SvxLRSpaceItem,
  type SvxBoxItem,
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
import {
  escapeXml,
  exportCharacterAttributes,
  exportParagraphAttributes,
  exportParagraphPropertyChildren,
  exportTextParagraphs,
  ODF_NAMESPACES,
  type OdfTextExport,
  type OdfCharacterProperties,
  type OdfParagraphAlignment,
  type OdfParagraphProperties,
  type XMLTextParagraphSource,
  type XMLTextListRuleSource,
} from "../../../../xmloff/source/text/txtparae";
import {
  RES_TXTATR_AUTOFMT,
  RES_TXTATR_INETFMT,
  RES_CHRATR_CJK_POSTURE,
  RES_BREAK,
  RES_PAGEDESC,
  RES_CHRATR_COLOR,
  RES_CHRATR_CJK_FONT,
  RES_CHRATR_CJK_FONTSIZE,
  RES_CHRATR_CJK_WEIGHT,
  RES_CHRATR_CTL_POSTURE,
  RES_CHRATR_CTL_FONT,
  RES_CHRATR_CTL_FONTSIZE,
  RES_CHRATR_FONT,
  RES_CHRATR_FONTSIZE,
  RES_CHRATR_CTL_WEIGHT,
  RES_CHRATR_HIGHLIGHT,
  RES_CHRATR_POSTURE,
  RES_CHRATR_UNDERLINE,
  RES_CHRATR_WEIGHT,
  RES_MARGIN_FIRSTLINE,
  RES_MARGIN_RIGHT,
  RES_MARGIN_TEXTLEFT,
  RES_PARATR_ADJUST,
  RES_PARATR_SPLIT,
  RES_PARATR_ORPHANS,
  RES_PARATR_WIDOWS,
  RES_PARATR_LINESPACING,
  RES_PARATR_TABSTOP,
  RES_PARATR_LIST_ISCOUNTED,
  RES_PARATR_LIST_ID,
  RES_PARATR_LIST_ISRESTART,
  RES_PARATR_LIST_LEVEL,
  RES_PARATR_LIST_RESTARTVALUE,
  RES_PARATR_NUMRULE,
  RES_PARATR_OUTLINELEVEL,
  RES_UL_SPACE,
  RES_FRM_SIZE,
  RES_LR_SPACE,
  RES_HORI_ORIENT,
  RES_LAYOUT_SPLIT,
  RES_COLLAPSING_BORDERS,
  RES_ROW_SPLIT,
  RES_BOX,
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
import { SwTableNode } from "../../core/docnode/node";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { SwFormatAutoFormat } from "../../core/txtnode/txatbase";
import { SwFormatINetFormat } from "../../core/txtnode/fmtatr2";
import { GetTextAttrMode } from "../../../inc/swtypes";
import { getWriterOdfStyleName } from "../../../inc/poolfmt";
import { createWriterFontAutoStylePool, registerWriterFontFace } from "./xmlfonte";
import { LineNumberPosition } from "../../../inc/lineinfo";
import { exportLineNumberingConfiguration } from "../../../../xmloff/source/text/XMLLineNumberingExport";
import { FontFamily, FontPitch } from "../../../../tools/inc/fontenum";
import { RTL_TEXTENCODING_DONTKNOW } from "../../../../sal/inc/rtl/textenc";
const OFFICE_NAMESPACES = `xmlns:office="${ODF_NAMESPACES.office}" xmlns:style="${ODF_NAMESPACES.style}" xmlns:text="${ODF_NAMESPACES.text}" xmlns:table="${ODF_NAMESPACES.table}" xmlns:fo="${ODF_NAMESPACES.fo}" xmlns:svg="${ODF_NAMESPACES.svg}" xmlns:xlink="${ODF_NAMESPACES.xlink}" xmlns:loext="${ODF_NAMESPACES.loext}"`;

/** Serializes Writer named paragraph styles into styles.xml. @param document - Canonical SwDoc. @returns Complete XML. */
export function exportStylesXml(document: SwDoc): string {
  const fonts = createWriterFontAutoStylePool(document);
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
  ).namedStyles;
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
      const name = getWriterOdfStyleName(collection.id);
      const parentCollection = collection.DerivedFrom();
      const parent =
        parentCollection instanceof Object && "id" in parentCollection
          ? ` style:parent-style-name="${escapeXml(getWriterOdfStyleName(String(parentCollection.id)))}"`
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
          : `<style:text-properties${exportCharacterAttributes(
              characterProperties,
              /** Registers one used font. @param family - Model family. @param generic - ODF generic family. @param styleName - Font style. @param pitch - Native pitch. @param charSet - Native encoding. @returns Face name. */ (
                family,
                generic,
                styleName,
                pitch,
                charSet,
              ) => registerWriterFontFace(fonts, family, generic, styleName, pitch, charSet),
            )}/>`;
      const nextName = getWriterOdfStyleName(collection.GetNextTextFormatColl().id);
      const next = nextName === name ? "" : ` style:next-style-name="${escapeXml(nextName)}"`;
      return `<style:style style:name="${escapeXml(name)}" style:display-name="${escapeXml(collection.GetName())}" style:family="paragraph"${next}${parent}${masterPage}${numberingAttributes}>${paragraphProperties}${textProperties}</style:style>`;
    },
  );
  const pageLayouts: string[] = [];
  const masterPages: string[] = [];
  for (let index = 0; index < document.GetPageDescCnt(); index += 1) {
    const descriptor = document.GetPageDesc(index);
    const page = descriptor.GetValue();
    const layoutName = `pm${index + 1}`;
    pageLayouts.push(
      `<style:page-layout style:name="${layoutName}"><style:page-layout-properties fo:page-width="${exportOdfLength(page.width)}" fo:page-height="${exportOdfLength(page.height)}" style:print-orientation="${page.landscape ? "landscape" : "portrait"}" fo:margin-top="${exportOdfLength(page.topMargin)}" fo:margin-bottom="${exportOdfLength(page.bottomMargin)}" fo:margin-left="${exportOdfLength(page.leftMargin)}" fo:margin-right="${exportOdfLength(page.rightMargin)}"/></style:page-layout>`,
    );
    const followName = descriptor.GetFollow().GetName();
    const follow =
      followName === descriptor.GetName()
        ? ""
        : ` style:next-style-name="${escapeXml(followName)}"`;
    masterPages.push(
      `<style:master-page style:name="${escapeXml(descriptor.GetName())}" style:page-layout-name="${layoutName}"${follow}/>`,
    );
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
  const lineInfo = document.GetLineNumberInfo().QueryValue();
  const lineNumbering = exportLineNumberingConfiguration({
    ...lineInfo,
    position:
      lineInfo.position === LineNumberPosition.Right
        ? "right"
        : lineInfo.position === LineNumberPosition.Inside
          ? "inside"
          : lineInfo.position === LineNumberPosition.Outside
            ? "outside"
            : "left",
  });
  return `<?xml version="1.0" encoding="UTF-8"?><office:document-styles ${OFFICE_NAMESPACES} office:version="1.3">${fonts.exportXML()}<office:styles>${styles.join("")}${numberingStyles}${inheritedStyles}${lineNumbering}</office:styles><office:automatic-styles>${pageLayouts.join("")}</office:automatic-styles><office:master-styles>${masterPages.join("")}</office:master-styles></office:document-styles>`;
}

/** Serializes body nodes and automatic styles into content.xml. @param document - Canonical SwDoc. @param isCancelled - Cooperative cancellation probe. @returns Complete XML. */
export function exportContentXml(
  document: SwDoc,
  isCancelled: () => boolean = /** Never cancels. @returns False. */ () => false,
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
  );
  return `<?xml version="1.0" encoding="UTF-8"?><office:document-content ${OFFICE_NAMESPACES} office:version="1.3">${fonts.exportXML()}<office:automatic-styles>${exported.automaticStyles}</office:automatic-styles><office:body><office:text>${exported.body}</office:text></office:body></office:document-content>`;
}

/** Projects the same model source for both package streams. @param document - Writer model. @param isCancelled - Cancellation probe. @param fontFaceName - Font registry. @param existingFontFaceName - Existing face lookup. @returns Style/body fragments. */
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
): OdfTextExport {
  return exportTextParagraphs(
    {
      /** Iterates live Writer nodes without retaining a projection. @returns Paragraph source iterator. */
      *paragraphs(): Iterable<XMLTextParagraphSource> {
        for (const block of document.nodes.getBodyContent()) {
          if (block instanceof SwTableNode) {
            for (const row of block.GetTable().GetTabLines())
              for (const cell of row.GetTabBoxes())
                for (const node of cell.GetParagraphs()) yield projectParagraph(node);
          } else yield projectParagraph(block);
        }
      },
      /** Iterates ordered direct body blocks and projects table cells through the same text exporter. @returns Body blocks. */
      *blocks() {
        for (const block of document.nodes.getBodyContent()) {
          if (!(block instanceof SwTableNode)) {
            yield { kind: "paragraph" as const, paragraph: projectParagraph(block) };
            continue;
          }
          const table = block.GetTable(),
            grid = new SwXMLTableLines(table);
          const items = table.GetFrameFormat().GetAttrSet();
          const size = items.GetItemIfSet(RES_FRM_SIZE, false) as SwFormatFrameSize | undefined;
          const orientation = items.GetItemIfSet(RES_HORI_ORIENT, false) as
            SwFormatHoriOrient | undefined;
          const orient = orientation?.GetHoriOrient();
          // Normal items require direct SET state; the native LR special handler searches parents for its orientation guard.
          const marginOrient = (
            items.GetItemIfSet(RES_HORI_ORIENT) as SwFormatHoriOrient | undefined
          )?.GetHoriOrient();
          const lr = items.GetItemIfSet(RES_LR_SPACE, false) as SvxLRSpaceItem | undefined;
          const ul = items.GetItemIfSet(RES_UL_SPACE, false) as SvxULSpaceItem | undefined;
          const split = items.GetItemIfSet(RES_LAYOUT_SPLIT, false) as
            SwFormatLayoutSplit | undefined;
          const borders = items.GetItemIfSet(RES_COLLAPSING_BORDERS, false) as
            SfxBoolItem | undefined;
          yield {
            kind: "table" as const,
            table: {
              name: table.GetName(),
              format: {
                width: size?.GetWidth(),
                marginTop: ul?.GetUpper(),
                marginBottom: ul?.GetLower(),
                layoutSplit: split?.GetValue(),
                borderModel:
                  borders === undefined
                    ? undefined
                    : borders.GetValue()
                      ? "collapsing"
                      : "separating",
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
                  marginOrient === HoriOrientation.NONE ||
                  marginOrient === HoriOrientation.LEFT_AND_WIDTH
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
                  const size = items.GetItemIfSet(RES_FRM_SIZE, false) as
                    SwFormatFrameSize | undefined;
                  const split = items.GetItemIfSet(RES_ROW_SPLIT, false) as
                    SwFormatRowSplit | undefined;
                  return {
                    format: {
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
                        return {
                          columnSpan: grid.GetColumnSpan(cell),
                          format: {
                            ...exportBoxProperties(box),
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
                          paragraphs: cell.GetParagraphs().map(projectParagraph),
                        };
                      },
                    ),
                  };
                },
              ),
            },
          };
        }
      },
    },
    isCancelled,
    fontFaceName,
    existingFontFaceName,
  );
}

/** Serializes document metadata into meta.xml. @param title - Shell-owned title. @param locale - Stored document language. @returns Complete XML. */
export function exportMetaXml(title: string, locale?: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?><office:document-meta xmlns:office="${ODF_NAMESPACES.office}" xmlns:dc="${ODF_NAMESPACES.dc}" xmlns:meta="${ODF_NAMESPACES.meta}" office:version="1.3"><office:meta><dc:title>${escapeXml(title)}</dc:title>${locale === undefined ? "" : `<dc:language>${escapeXml(locale)}</dc:language>`}<meta:generator>vite-office LibreOffice TypeScript reimplementation</meta:generator></office:meta></office:document-meta>`;
}

/** Projects one canonical text node without leaking Writer ownership into xmloff. @param node - Source text node. @returns Neutral paragraph. */
function projectParagraph(node: SwTextNode): XMLTextParagraphSource {
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
  const markers = [
    ...marks
      .GetBookmarks()
      .filter(
        /** Selects bookmarks on this paragraph. @param mark - Mark. @returns Whether owned. */
        (mark) => mark.GetMarkPos().GetNode() === node,
      )
      .map(
        /** Projects a bookmark to ODF. @param mark - Mark. @returns Neutral marker. */
        (mark) => ({
          kind: "bookmark" as const,
          name: mark.GetName(),
          offset: mark.GetMarkPos().GetContentIndex(),
        }),
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
    /** Orders zero-width markers by content offset. @param left - First. @param right - Second. @returns Signed order. */
    (left, right) => left.offset - right.offset,
  );
  const directCharacterProperties = getCharacterProperties(node.GetpSwAttrSet(), false);
  return {
    ...(alignment === undefined ? {} : { alignment }),
    ...(hasDirectLeftMargin ? { leftMargin: node.GetParagraphTextLeftMargin() } : {}),
    ...(paragraphProperties === undefined ? {} : { paragraphProperties }),
    ...(markers.length === 0 ? {} : { markers }),
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
    styleName: getWriterOdfStyleName(node.GetParagraphStyle()),
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
    RES_CHRATR_POSTURE,
    RES_CHRATR_COLOR,
    RES_CHRATR_FONT,
    RES_CHRATR_FONTSIZE,
    RES_CHRATR_UNDERLINE,
    RES_CHRATR_ESCAPEMENT,
    RES_CHRATR_CROSSEDOUT,
    RES_CHRATR_WEIGHT,
    RES_CHRATR_CJK_POSTURE,
    RES_CHRATR_CJK_FONT,
    RES_CHRATR_CJK_FONTSIZE,
    RES_CHRATR_CJK_WEIGHT,
    RES_CHRATR_CTL_POSTURE,
    RES_CHRATR_CTL_FONT,
    RES_CHRATR_CTL_FONTSIZE,
    RES_CHRATR_CTL_WEIGHT,
    RES_CHRATR_HIGHLIGHT,
    RES_PARATR_ADJUST,
    RES_PARATR_SPLIT,
    RES_PARATR_ORPHANS,
    RES_PARATR_WIDOWS,
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
  ]);
  if (allowListItems)
    for (const which of [
      RES_PARATR_LIST_ISCOUNTED,
      RES_PARATR_LIST_ID,
      RES_PARATR_LIST_ISRESTART,
      RES_PARATR_LIST_LEVEL,
      RES_PARATR_LIST_RESTARTVALUE,
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
  const paragraphBreak = set.GetItemIfSet(RES_BREAK, false);
  const pageDesc = set.GetItemIfSet(RES_PAGEDESC, false);
  const lineNumber = set.GetItemIfSet(RES_LINENUMBER, false);
  if (
    (firstLine !== undefined && !(firstLine instanceof SvxFirstLineIndentItem)) ||
    (right !== undefined && !(right instanceof SvxRightMarginItem)) ||
    (spacing !== undefined && !(spacing instanceof SvxULSpaceItem)) ||
    (lineSpacing !== undefined && !(lineSpacing instanceof SvxLineSpacingItem)) ||
    (tabStop !== undefined && !(tabStop instanceof SvxTabStopItem)) ||
    (keep !== undefined && !(keep instanceof SfxBoolItem)) ||
    (split !== undefined && !(split instanceof SfxBoolItem)) ||
    (orphans !== undefined && !(orphans instanceof SfxInt16Item)) ||
    (widows !== undefined && !(widows instanceof SfxInt16Item)) ||
    (paragraphBreak !== undefined && !(paragraphBreak instanceof SfxInt16Item)) ||
    (pageDesc !== undefined && !(pageDesc instanceof SwFormatPageDesc)) ||
    (lineNumber !== undefined && !(lineNumber instanceof SfxBoolItem))
  )
    throw new Error("ODT paragraph item is invalid.");
  const properties: OdfParagraphProperties = {
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
          tabStopDetails: Array.from(
            { length: tabStop.Count() },
            /** Reads one original const tab. @param unused - Empty array slot. @param index - Native index. @returns Borrowed tab. */ (
              unused,
              index,
            ) => {
              void unused;
              return tabStop.At(index);
            },
          ).map(
            /** Projects one Writer tab to ODF properties. @param stop - Writer tab stop. @returns ODF tab. */
            (stop) => ({
              position: stop.GetTabPos(),
              alignment:
                stop.GetAdjustment() === SvxTabAdjust.Right
                  ? ("right" as const)
                  : stop.GetAdjustment() === SvxTabAdjust.Center
                    ? ("center" as const)
                    : stop.GetAdjustment() === SvxTabAdjust.Decimal
                      ? ("char" as const)
                      : stop.GetAdjustment() === SvxTabAdjust.Default
                        ? ("default" as const)
                        : ("left" as const),
              decimal: stop.GetDecimal(),
              fill: stop.GetFill(),
            }),
          ),
        }
      : {}),
    ...(keep instanceof SfxBoolItem ? { keepWithNext: keep.GetValue() } : {}),
    ...(split instanceof SfxBoolItem ? { keepTogether: !split.GetValue() } : {}),
    ...(orphans instanceof SfxInt16Item ? { orphans: orphans.GetValue() } : {}),
    ...(widows instanceof SfxInt16Item ? { widows: widows.GetValue() } : {}),
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
    ...(lineNumber instanceof SfxBoolItem ? { countLineNumbers: lineNumber.GetValue() } : {}),
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

/** Enumerates actual native hint boundaries without merging through browser booleans. @param node - Canonical text owner. @returns Source item-based XML runs. */
function projectXmlTextRuns(node: SwTextNode): XMLTextParagraphSource["runs"] {
  const boundaries = new Set([0, node.Len()]);
  for (const hint of node.GetpSwpHints()?.entries() ?? []) {
    boundaries.add(hint.GetStart());
    boundaries.add(hint.end);
  }
  const ordered = [...boundaries].sort(
    /** Orders UTF16 source positions. @param a - First. @param b - Second. @returns Ordering. */ (
      a,
      b,
    ) => a - b,
  );
  return ordered.slice(0, -1).map(
    /** Reads the native items and independent hyperlink for one source segment. @param start - Segment start. @param index - Boundary index. @returns XML run. */ (
      start,
      index,
    ) => {
      const end = ordered[index + 1] as number;
      const items = new SfxItemSet(node.GetSwAttrSet());
      const auto = node.GetTextAttrAt(start, RES_TXTATR_AUTOFMT, GetTextAttrMode.Default);
      if (auto?.format instanceof SwFormatAutoFormat) items.PutSet(auto.format.GetStyleHandle());
      const link = node.GetTextAttrAt(start, RES_TXTATR_INETFMT, GetTextAttrMode.Default);
      return {
        text: node.GetText().slice(start, end),
        properties: getCharacterProperties(items, true) as OdfCharacterProperties,
        ...(link?.format instanceof SwFormatINetFormat
          ? { hyperlink: link.format.GetHyperlink() }
          : {}),
      };
    },
  );
}

/** Projects independent native character items to ODF properties. @param set - Optional Writer item set. @param inherited - Whether parent sets participate. @returns Properties when at least one direct item exists. */
export function getCharacterProperties(
  set: SfxItemSet | undefined,
  inherited: boolean,
): Partial<OdfCharacterProperties> | undefined {
  if (set === undefined) return undefined;
  const weightIds = [RES_CHRATR_WEIGHT, RES_CHRATR_CJK_WEIGHT, RES_CHRATR_CTL_WEIGHT];
  const postureIds = [RES_CHRATR_POSTURE, RES_CHRATR_CJK_POSTURE, RES_CHRATR_CTL_POSTURE];
  const directWeight = weightIds.some(
    /** Detects a direct script weight. @param which - Weight WhichId. @returns Whether set. */
    (which) => set.GetItemIfSet(which, false) !== undefined,
  );
  const directPosture = postureIds.some(
    /** Detects a direct script posture. @param which - Posture WhichId. @returns Whether set. */
    (which) => set.GetItemIfSet(which, false) !== undefined,
  );
  const escapement = set.GetItemIfSet(RES_CHRATR_ESCAPEMENT, inherited);
  const crossedOut = set.GetItemIfSet(RES_CHRATR_CROSSEDOUT, inherited);
  const directUnderline = set.GetItemIfSet(RES_CHRATR_UNDERLINE, false) !== undefined;
  const color = set.GetItemIfSet(RES_CHRATR_COLOR, inherited);
  const highlight = set.GetItemIfSet(RES_CHRATR_HIGHLIGHT, inherited);
  const fontSizeIds = [RES_CHRATR_FONTSIZE, RES_CHRATR_CJK_FONTSIZE, RES_CHRATR_CTL_FONTSIZE];
  const directFontSize = fontSizeIds.some(
    /** Detects a direct script font size. @param which - Font-size WhichId. @returns Whether set. */ (
      which,
    ) => set.GetItemIfSet(which, false) !== undefined,
  );
  const font = set.GetItemIfSet(RES_CHRATR_FONT, inherited);
  const asianFont = set.GetItemIfSet(RES_CHRATR_CJK_FONT, inherited);
  const complexFont = set.GetItemIfSet(RES_CHRATR_CTL_FONT, inherited);
  if (
    !inherited &&
    !directWeight &&
    !directPosture &&
    !directUnderline &&
    crossedOut === undefined &&
    escapement === undefined &&
    !directFontSize &&
    color === undefined &&
    highlight === undefined &&
    font === undefined &&
    asianFont === undefined &&
    complexFont === undefined
  )
    return undefined;
  const weight = set.Get(RES_CHRATR_WEIGHT, inherited);
  const asianWeight = set.Get(RES_CHRATR_CJK_WEIGHT, inherited);
  const complexWeight = set.Get(RES_CHRATR_CTL_WEIGHT, inherited);
  const posture = set.Get(RES_CHRATR_POSTURE, inherited);
  const asianPosture = set.Get(RES_CHRATR_CJK_POSTURE, inherited);
  const complexPosture = set.Get(RES_CHRATR_CTL_POSTURE, inherited);
  const underline = set.Get(RES_CHRATR_UNDERLINE, inherited);
  const fontSize = set.Get(RES_CHRATR_FONTSIZE, inherited);
  const asianFontSize = set.Get(RES_CHRATR_CJK_FONTSIZE, inherited);
  const complexFontSize = set.Get(RES_CHRATR_CTL_FONTSIZE, inherited);
  if (
    !(weight instanceof SvxWeightItem) ||
    !(asianWeight instanceof SvxWeightItem) ||
    !(complexWeight instanceof SvxWeightItem) ||
    !(posture instanceof SvxPostureItem) ||
    !(asianPosture instanceof SvxPostureItem) ||
    !(complexPosture instanceof SvxPostureItem) ||
    !(underline instanceof SvxUnderlineItem) ||
    (color !== undefined && !(color instanceof SfxStringItem)) ||
    (highlight !== undefined && !(highlight instanceof SfxStringItem)) ||
    !(fontSize instanceof SvxFontHeightItem) ||
    !(asianFontSize instanceof SvxFontHeightItem) ||
    !(complexFontSize instanceof SvxFontHeightItem)
  )
    throw new Error("ODT character item is invalid.");
  const fontFamilyGeneric =
      font instanceof SvxFontItem ? getFontFamilyGeneric(font.GetFamily()) : undefined,
    asianGeneric =
      asianFont instanceof SvxFontItem ? getFontFamilyGeneric(asianFont.GetFamily()) : undefined,
    complexGeneric =
      complexFont instanceof SvxFontItem
        ? getFontFamilyGeneric(complexFont.GetFamily())
        : undefined;
  return {
    ...(color instanceof SfxStringItem ? { color: color.GetValue() } : {}),
    ...(font instanceof SvxFontItem
      ? {
          fontFamily: font.GetFamilyName(),
          fontStyleName: font.GetStyleName(),
          fontPitch: font.GetPitch(),
          fontCharSet: font.GetCharSet(),
          ...(fontFamilyGeneric === undefined ? {} : { fontFamilyGeneric }),
        }
      : {}),
    ...(asianFont instanceof SvxFontItem
      ? {
          fontFamilyAsian: asianFont.GetFamilyName(),
          fontStyleNameAsian: asianFont.GetStyleName(),
          fontPitchAsian: asianFont.GetPitch(),
          fontCharSetAsian: asianFont.GetCharSet(),
          ...(asianGeneric === undefined ? {} : { fontFamilyGenericAsian: asianGeneric }),
        }
      : {}),
    ...(complexFont instanceof SvxFontItem
      ? {
          fontFamilyComplex: complexFont.GetFamilyName(),
          fontStyleNameComplex: complexFont.GetStyleName(),
          fontPitchComplex: complexFont.GetPitch(),
          fontCharSetComplex: complexFont.GetCharSet(),
          ...(complexGeneric === undefined ? {} : { fontFamilyGenericComplex: complexGeneric }),
        }
      : {}),
    ...(set.GetItemIfSet(RES_CHRATR_FONTSIZE, inherited) !== undefined
      ? { fontSizeTwips: fontSize.GetHeight() }
      : {}),
    ...(set.GetItemIfSet(RES_CHRATR_CJK_FONTSIZE, inherited) !== undefined
      ? { fontSizeTwipsAsian: asianFontSize.GetHeight() }
      : {}),
    ...(set.GetItemIfSet(RES_CHRATR_CTL_FONTSIZE, inherited) !== undefined
      ? { fontSizeTwipsComplex: complexFontSize.GetHeight() }
      : {}),
    ...(highlight instanceof SfxStringItem ? { highlight: highlight.GetValue() } : {}),
    ...(inherited || set.GetItemIfSet(RES_CHRATR_WEIGHT, false) !== undefined
      ? { fontWeight: ConvertFontWeight(weight.GetValue(), "FontWeight") }
      : {}),
    ...(inherited || set.GetItemIfSet(RES_CHRATR_CJK_WEIGHT, false) !== undefined
      ? { fontWeightAsian: ConvertFontWeight(asianWeight.GetValue(), "FontWeight") }
      : {}),
    ...(inherited || set.GetItemIfSet(RES_CHRATR_CTL_WEIGHT, false) !== undefined
      ? { fontWeightComplex: ConvertFontWeight(complexWeight.GetValue(), "FontWeight") }
      : {}),
    ...(inherited || set.GetItemIfSet(RES_CHRATR_POSTURE, false) !== undefined
      ? { fontPosture: ConvertFontSlant(posture.GetValue(), "FontItalic") }
      : {}),
    ...(inherited || set.GetItemIfSet(RES_CHRATR_CJK_POSTURE, false) !== undefined
      ? { fontPostureAsian: ConvertFontSlant(asianPosture.GetValue(), "FontItalic") }
      : {}),
    ...(inherited || set.GetItemIfSet(RES_CHRATR_CTL_POSTURE, false) !== undefined
      ? { fontPostureComplex: ConvertFontSlant(complexPosture.GetValue(), "FontItalic") }
      : {}),
    ...(escapement instanceof SvxEscapementItem
      ? { escapement: escapement.GetEsc(), escapementHeight: escapement.GetProportionalHeight() }
      : {}),
    ...(crossedOut instanceof SvxCrossedOutItem ? { strikeout: crossedOut.GetStrikeout() } : {}),
    ...(inherited || directUnderline
      ? {
          underlineStyle: underline.GetLineStyle(),
          underlineColor: underline.GetColor().toUInt32() & 0xffffff,
          underlineHasColor: underline.GetColor().GetAlpha() === 255,
        }
      : {}),
  };
}
