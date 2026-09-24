/**
 * @fileoverview Reimplements the bounded Writer ODF XML export bridge from pinned LibreOffice `sw/source/filter/xml/xmlexp.cxx`.
 */

import {
  SvxAdjust,
  SvxAdjustItem,
  SvxFirstLineIndentItem,
  SvxLineSpacingItem,
  SvxRightMarginItem,
  SvxTabAdjust,
  SvxTabStopItem,
  SvxTextLeftMarginItem,
  SvxULSpaceItem,
} from "../../../../editeng/source/items/paraitem";
import {
  SvxFontItem,
  SvxFontHeightItem,
  SvxPostureItem,
  SvxUnderlineItem,
  SvxWeightItem,
} from "../../../../editeng/source/items/textitem";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SfxStringItem } from "../../../../svl/source/items/stritem";
import {
  escapeXml,
  exportCharacterAttributes,
  exportParagraphAttributes,
  exportParagraphPropertyChildren,
  exportTextParagraphs,
  ODF_NAMESPACES,
  type OdfCharacterProperties,
  type OdfParagraphAlignment,
  type OdfParagraphProperties,
  type XMLTextParagraphSource,
} from "../../../../xmloff/source/text/txtparae";
import {
  RES_CHRATR_CJK_POSTURE,
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
  RES_PARATR_LINESPACING,
  RES_PARATR_TABSTOP,
  RES_PARATR_LIST_ID,
  RES_PARATR_LIST_ISRESTART,
  RES_PARATR_LIST_LEVEL,
  RES_PARATR_LIST_RESTARTVALUE,
  RES_PARATR_NUMRULE,
  RES_UL_SPACE,
  RES_KEEP,
  RES_LINENUMBER,
} from "../../../inc/hintids";
import { WRITER_MAX_LIST_LEVEL } from "../../core/doc/list";
import type { SwDoc } from "../../core/doc/doc";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { projectWriterTextRuns } from "../../core/txtnode/ndtxt";
import { getWriterOdfStyleName } from "../../../inc/poolfmt";
import { createWriterFontAutoStylePool } from "./xmlfonte";
import { LineNumberPosition } from "../../../inc/lineinfo";
import { exportLineNumberingConfiguration } from "../../../../xmloff/source/text/XMLLineNumberingExport";

const OFFICE_NAMESPACES = `xmlns:office="${ODF_NAMESPACES.office}" xmlns:style="${ODF_NAMESPACES.style}" xmlns:text="${ODF_NAMESPACES.text}" xmlns:fo="${ODF_NAMESPACES.fo}" xmlns:svg="${ODF_NAMESPACES.svg}" xmlns:xlink="${ODF_NAMESPACES.xlink}"`;

/** Serializes Writer named paragraph styles into styles.xml. @param document - Canonical SwDoc. @returns Complete XML. */
export function exportStylesXml(document: SwDoc): string {
  const fonts = createWriterFontAutoStylePool(document);
  const styles = document.GetTextFormatColls().map(
    /** Emits one named Writer paragraph style. @param collection - Style collection. @returns Style XML. */
    (collection) => {
      assertSupportedItems(collection.GetAttrSet().entries(), `paragraph style ${collection.id}`);
      const alignment = getDirectAlignment(
        collection.GetAttrSet().GetItemIfSet(RES_PARATR_ADJUST, false),
      );
      const name = getWriterOdfStyleName(collection.id);
      const parentCollection = collection.DerivedFrom();
      const parent =
        parentCollection instanceof Object && "id" in parentCollection
          ? ` style:parent-style-name="${getWriterOdfStyleName(String(parentCollection.id))}"`
          : "";
      const leftMargin = getDirectLeftMargin(collection.GetAttrSet());
      const directParagraphProperties = getParagraphProperties(collection.GetAttrSet());
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
              /** Registers one used font. @param family - Model family. @returns Face name. */ (
                family,
              ) => fonts.Add(family),
            )}/>`;
      const nextName = getWriterOdfStyleName(collection.GetNextTextFormatColl().id);
      const next = nextName === name ? "" : ` style:next-style-name="${escapeXml(nextName)}"`;
      return `<style:style style:name="${escapeXml(name)}" style:display-name="${escapeXml(collection.GetName())}" style:family="paragraph"${next}${parent}>${paragraphProperties}${textProperties}</style:style>`;
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
  return `<?xml version="1.0" encoding="UTF-8"?><office:document-styles ${OFFICE_NAMESPACES} office:version="1.3">${fonts.exportXML()}<office:styles>${styles.join("")}${lineNumbering}</office:styles><office:automatic-styles>${pageLayouts.join("")}</office:automatic-styles><office:master-styles>${masterPages.join("")}</office:master-styles></office:document-styles>`;
}

/** Serializes body nodes and automatic styles into content.xml. @param document - Canonical SwDoc. @param isCancelled - Cooperative cancellation probe. @returns Complete XML. */
export function exportContentXml(
  document: SwDoc,
  isCancelled: () => boolean = /** Never cancels. @returns False. */ () => false,
): string {
  const fonts = createWriterFontAutoStylePool(document);
  const exported = exportTextParagraphs(
    {
      /** Iterates live Writer nodes without retaining a projection. @returns Paragraph source iterator. */
      *paragraphs(): Iterable<XMLTextParagraphSource> {
        for (const node of document.paragraphs) yield projectParagraph(node);
      },
    },
    isCancelled,
    /** Registers one used font. @param family - Model family. @returns Face name. */ (family) =>
      fonts.Add(family),
  );
  return `<?xml version="1.0" encoding="UTF-8"?><office:document-content ${OFFICE_NAMESPACES} office:version="1.3">${fonts.exportXML()}<office:automatic-styles>${exported.automaticStyles}</office:automatic-styles><office:body><office:text>${exported.body}</office:text></office:body></office:document-content>`;
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
  if (rule === undefined && (listId.length > 0 || level !== 0))
    throw new Error(
      `ODT export found list id or level without SwNumRule on node ${node.GetIndex()}.`,
    );
  const alignment = getDirectAlignment(
    node.GetpSwAttrSet()?.GetItemIfSet(RES_PARATR_ADJUST, false),
  );
  const hasDirectLeftMargin =
    node.GetpSwAttrSet()?.GetItemIfSet(RES_MARGIN_TEXTLEFT, false) !== undefined;
  const paragraphProperties = getParagraphProperties(node.GetpSwAttrSet());
  const directCharacterProperties = getCharacterProperties(node.GetpSwAttrSet(), false);
  return {
    ...(alignment === undefined ? {} : { alignment }),
    ...(hasDirectLeftMargin ? { leftMargin: node.GetParagraphTextLeftMargin() } : {}),
    ...(paragraphProperties === undefined ? {} : { paragraphProperties }),
    ...(node.DoesListGeometryWin() ? { listGeometryWins: true } : {}),
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
            ...(node.IsListRestart() ? { startValue: node.GetActualListStartValue() } : {}),
            rule: {
              bulletChars: Array.from(
                { length: WRITER_MAX_LIST_LEVEL + 1 },
                /** Projects one SwNumFormat character-special marker. @param _unused - Array value. @param index - Writer list level. @returns Bullet character when applicable. */
                (_unused, index) => {
                  const format = rule.GetNumFormat(index);
                  return format.GetKind() === "bullet" ? format.GetBulletChar() : undefined;
                },
              ),
              formats: Array.from(
                { length: WRITER_MAX_LIST_LEVEL + 1 },
                /** Projects one SwNumFormat family. @param _unused - Array value. @param index - Writer list level. @returns Marker family. */
                (_unused, index) => rule.GetNumFormat(index).GetKind(),
              ),
              levelLayouts: Array.from(
                { length: WRITER_MAX_LIST_LEVEL + 1 },
                /** Projects one canonical list level's label alignment. @param _unused - Array value. @param index - Writer list level. @returns ODF geometry. */
                (_unused, index) => {
                  const format = rule.GetNumFormat(index);
                  return {
                    firstLineIndent: format.GetFirstLineIndent(),
                    indentAt: format.GetIndentAt(),
                    labelFollowedBy: format.GetLabelFollowedBy(),
                    listTabPosition: format.GetListtabPos(),
                  };
                },
              ),
              suffixes: Array.from(
                { length: WRITER_MAX_LIST_LEVEL + 1 },
                /** Projects one numeric label suffix. @param _unused - Array value. @param index - Writer list level. @returns Suffix when numbered. */
                (_unused, index) => rule.GetNumFormat(index).GetSuffix(),
              ),
              name: rule.GetName(),
            },
          },
        }),
    ...(directCharacterProperties === undefined ? {} : { properties: directCharacterProperties }),
    runs: projectWriterTextRuns(node).map(
      /** Projects one canonical direct-format run. @param run - Writer run. @returns Neutral run. */
      (run) => ({
        ...(run.hyperlink === undefined ? {} : { hyperlink: { ...run.hyperlink } }),
        properties: { ...run.attributes },
        text: run.text,
      }),
    ),
    style: node.GetParagraphStyle(),
    styleName: getWriterOdfStyleName(node.GetParagraphStyle()),
  };
}

/** Rejects paragraph items outside this ODT slice. @param items - Direct items. @param owner - Error identity. @param allowListItems - Whether paragraph list items are valid. @returns Nothing. */
function assertSupportedItems(
  items: readonly { Which(): number }[],
  owner: string,
  allowListItems = false,
): void {
  const supported = new Set<number>([
    RES_CHRATR_POSTURE,
    RES_CHRATR_COLOR,
    RES_CHRATR_FONT,
    RES_CHRATR_FONTSIZE,
    RES_CHRATR_UNDERLINE,
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
      RES_PARATR_LIST_ID,
      RES_PARATR_LIST_ISRESTART,
      RES_PARATR_LIST_LEVEL,
      RES_PARATR_LIST_RESTARTVALUE,
      RES_PARATR_NUMRULE,
    ])
      supported.add(which);
  const unsupported = items.find(
    /** Finds a non-alignment item. @param item - Direct pool item. @returns Whether unsupported. */
    (item) => !supported.has(item.Which()),
  );
  if (unsupported !== undefined)
    throw new Error(`ODT export does not support WhichId ${unsupported.Which()} on ${owner}.`);
}

/** Projects synchronized character items to ODF properties. @param set - Optional Writer item set. @param inherited - Whether parent sets participate. @returns Properties when at least one direct item exists. */
function getCharacterProperties(
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
  const directUnderline = set.GetItemIfSet(RES_CHRATR_UNDERLINE, false) !== undefined;
  const color = set.GetItemIfSet(RES_CHRATR_COLOR, inherited);
  const highlight = set.GetItemIfSet(RES_CHRATR_HIGHLIGHT, inherited);
  const fontSizeIds = [RES_CHRATR_FONTSIZE, RES_CHRATR_CJK_FONTSIZE, RES_CHRATR_CTL_FONTSIZE];
  const directFontSize = fontSizeIds.some(
    /** Detects a direct script font size. @param which - Font-size WhichId. @returns Whether set. */ (
      which,
    ) => set.GetItemIfSet(which, false) !== undefined,
  );
  const explicitFontSize = fontSizeIds.some(
    /** Detects an explicitly set script font size in the selected inheritance chain. @param which - Font-size WhichId. @returns Whether set. */ (
      which,
    ) => set.GetItemIfSet(which, inherited) !== undefined,
  );
  const font = set.GetItemIfSet(RES_CHRATR_FONT, inherited);
  if (
    !inherited &&
    !directWeight &&
    !directPosture &&
    !directUnderline &&
    !directFontSize &&
    color === undefined &&
    highlight === undefined &&
    font === undefined
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
  if (
    weight.GetBoolValue() !== asianWeight.GetBoolValue() ||
    weight.GetBoolValue() !== complexWeight.GetBoolValue() ||
    posture.GetBoolValue() !== asianPosture.GetBoolValue() ||
    posture.GetBoolValue() !== complexPosture.GetBoolValue() ||
    fontSize.GetHeight() !== asianFontSize.GetHeight() ||
    fontSize.GetHeight() !== complexFontSize.GetHeight()
  )
    throw new Error("ODT export does not support script-specific character formatting.");
  return {
    ...(color instanceof SfxStringItem ? { color: color.GetValue() } : {}),
    ...(font instanceof SvxFontItem ? { fontFamily: font.GetFamilyName() } : {}),
    ...(explicitFontSize ? { fontSizeTwips: fontSize.GetHeight() } : {}),
    ...(highlight instanceof SfxStringItem ? { highlight: highlight.GetValue() } : {}),
    ...(inherited || directWeight ? { bold: weight.GetBoolValue() } : {}),
    ...(inherited || directPosture ? { italic: posture.GetBoolValue() } : {}),
    ...(inherited || directUnderline ? { underline: underline.GetBoolValue() } : {}),
  };
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
  const lineNumber = set.GetItemIfSet(RES_LINENUMBER, false);
  if (
    (firstLine !== undefined && !(firstLine instanceof SvxFirstLineIndentItem)) ||
    (right !== undefined && !(right instanceof SvxRightMarginItem)) ||
    (spacing !== undefined && !(spacing instanceof SvxULSpaceItem)) ||
    (lineSpacing !== undefined && !(lineSpacing instanceof SvxLineSpacingItem)) ||
    (tabStop !== undefined && !(tabStop instanceof SvxTabStopItem)) ||
    (keep !== undefined && !(keep instanceof SfxBoolItem)) ||
    (lineNumber !== undefined && !(lineNumber instanceof SfxBoolItem))
  )
    throw new Error("ODT paragraph item is invalid.");
  const properties: OdfParagraphProperties = {
    ...(firstLine instanceof SvxFirstLineIndentItem
      ? { firstLineIndent: firstLine.ResolveTextFirstLineOffset() }
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
          ...(lineSpacing.GetMode() === "proportional"
            ? { lineHeightPercent: lineSpacing.GetValue() }
            : lineSpacing.GetMode() === "fixed"
              ? { lineHeightTwips: lineSpacing.GetValue() }
              : lineSpacing.GetMode() === "minimum"
                ? { lineHeightAtLeastTwips: lineSpacing.GetValue() }
                : { lineSpacingTwips: lineSpacing.GetValue() }),
          fontIndependentLineSpacing: lineSpacing.IsFontIndependent(),
        }
      : {}),
    ...(tabStop instanceof SvxTabStopItem
      ? {
          tabStopDetails: tabStop.GetStops().map(
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
  if (value === SvxAdjust.Block || value === SvxAdjust.BlockLine) return "justify";
  throw new Error("ODT paragraph adjustment value is unsupported.");
}

/** Maps model alignment to ODF. @param alignment - Model value. @returns ODF value. */
function exportAlignment(alignment: OdfParagraphAlignment): string {
  if (alignment === "left") return "start";
  if (alignment === "right") return "end";
  return alignment;
}
