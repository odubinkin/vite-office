/**
 * @fileoverview Reimplements the bounded Writer ODF XML export bridge from pinned LibreOffice `sw/source/filter/xml/xmlexp.cxx`.
 */

import { SvxAdjust, SvxAdjustItem } from "../../../../editeng/source/items/paraitem";
import {
  SvxPostureItem,
  SvxUnderlineItem,
  SvxWeightItem,
} from "../../../../editeng/source/items/textitem";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import {
  escapeXml,
  exportCharacterAttributes,
  exportTextParagraphs,
  ODF_NAMESPACES,
  type OdfCharacterProperties,
  type OdfParagraph,
  type OdfParagraphAlignment,
} from "../../../../xmloff/source/text/txtparae";
import {
  RES_CHRATR_CJK_POSTURE,
  RES_CHRATR_CJK_WEIGHT,
  RES_CHRATR_CTL_POSTURE,
  RES_CHRATR_CTL_WEIGHT,
  RES_CHRATR_POSTURE,
  RES_CHRATR_UNDERLINE,
  RES_CHRATR_WEIGHT,
  RES_PARATR_ADJUST,
  RES_PARATR_LIST_ID,
  RES_PARATR_LIST_LEVEL,
  RES_PARATR_NUMRULE,
} from "../../../inc/hintids";
import { WRITER_MAX_LIST_LEVEL } from "../../core/doc/list";
import type { SwDoc } from "../../core/doc/doc";
import type { SwTextNode } from "../../core/txtnode/ndtxt";

const OFFICE_NAMESPACES = `xmlns:office="${ODF_NAMESPACES.office}" xmlns:style="${ODF_NAMESPACES.style}" xmlns:text="${ODF_NAMESPACES.text}" xmlns:fo="${ODF_NAMESPACES.fo}"`;

/** Serializes Writer named paragraph styles into styles.xml. @param document - Canonical SwDoc. @returns Complete XML. */
export function exportStylesXml(document: SwDoc): string {
  const styles = document.GetTextFormatColls().map(
    /** Emits one named Writer paragraph style. @param collection - Style collection. @returns Style XML. */
    (collection) => {
      assertSupportedItems(collection.GetAttrSet().entries(), `paragraph style ${collection.id}`);
      const alignment = getDirectAlignment(
        collection.GetAttrSet().GetItemIfSet(RES_PARATR_ADJUST, false),
      );
      const name = collection.id === "default" ? "Standard" : "Heading_20_1";
      const parent = collection.id === "heading-1" ? ' style:parent-style-name="Standard"' : "";
      const paragraphProperties =
        alignment === undefined
          ? ""
          : `<style:paragraph-properties fo:text-align="${exportAlignment(alignment)}"/>`;
      const characterProperties = getCharacterProperties(collection.GetAttrSet(), false);
      const textProperties =
        characterProperties === undefined
          ? ""
          : `<style:text-properties${exportCharacterAttributes(characterProperties)}/>`;
      return `<style:style style:name="${name}" style:display-name="${escapeXml(collection.GetName())}" style:family="paragraph"${parent}>${paragraphProperties}${textProperties}</style:style>`;
    },
  );
  return `<?xml version="1.0" encoding="UTF-8"?><office:document-styles ${OFFICE_NAMESPACES} office:version="1.3"><office:styles>${styles.join("")}</office:styles></office:document-styles>`;
}

/** Serializes body nodes and automatic styles into content.xml. @param document - Canonical SwDoc. @returns Complete XML. */
export function exportContentXml(document: SwDoc): string {
  const paragraphs = document.paragraphs.map(projectParagraph);
  const exported = exportTextParagraphs(paragraphs);
  return `<?xml version="1.0" encoding="UTF-8"?><office:document-content ${OFFICE_NAMESPACES} office:version="1.3"><office:automatic-styles>${exported.automaticStyles}</office:automatic-styles><office:body><office:text>${exported.body}</office:text></office:body></office:document-content>`;
}

/** Serializes document title metadata into meta.xml. @param document - Canonical SwDoc. @returns Complete XML. */
export function exportMetaXml(document: SwDoc): string {
  return `<?xml version="1.0" encoding="UTF-8"?><office:document-meta xmlns:office="${ODF_NAMESPACES.office}" xmlns:dc="${ODF_NAMESPACES.dc}" xmlns:meta="${ODF_NAMESPACES.meta}" office:version="1.3"><office:meta><dc:title>${escapeXml(document.document.title)}</dc:title><meta:generator>vite-office LibreOffice TypeScript reimplementation</meta:generator></office:meta></office:document-meta>`;
}

/** Projects one canonical text node without leaking Writer ownership into xmloff. @param node - Source text node. @returns Neutral paragraph. */
function projectParagraph(node: SwTextNode): OdfParagraph {
  const directItems = node.GetpSwAttrSet()?.entries() ?? [];
  assertSupportedItems(directItems, `paragraph ${node.id}`, true);
  const ruleName = node.GetNumRuleName();
  const rule = node.GetNumRule();
  if (ruleName.length > 0 && rule === undefined)
    throw new Error(`ODT export cannot resolve SwNumRule ${ruleName} on paragraph ${node.id}.`);
  const listId = node.GetListId();
  const level = node.GetAttrListLevel();
  if (rule === undefined && (listId.length > 0 || level !== 0))
    throw new Error(`ODT export found list id or level without SwNumRule on paragraph ${node.id}.`);
  const alignment = getDirectAlignment(
    node.GetpSwAttrSet()?.GetItemIfSet(RES_PARATR_ADJUST, false),
  );
  const directCharacterProperties = getCharacterProperties(node.GetpSwAttrSet(), false);
  return {
    ...(alignment === undefined ? {} : { alignment }),
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
            rule: {
              formats: Array.from(
                { length: WRITER_MAX_LIST_LEVEL + 1 },
                /** Projects one SwNumFormat family. @param _unused - Array value. @param index - Writer list level. @returns Marker family. */
                (_unused, index) => rule.GetNumFormat(index).GetKind(),
              ),
              name: rule.GetName(),
            },
          },
        }),
    ...(directCharacterProperties === undefined ? {} : { properties: directCharacterProperties }),
    runs: node.runs.map(
      /** Projects one canonical direct-format run. @param run - Writer run. @returns Neutral run. */
      (run) => ({ properties: { ...run.attributes }, text: run.text }),
    ),
    style: node.style,
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
    RES_CHRATR_UNDERLINE,
    RES_CHRATR_WEIGHT,
    RES_CHRATR_CJK_POSTURE,
    RES_CHRATR_CJK_WEIGHT,
    RES_CHRATR_CTL_POSTURE,
    RES_CHRATR_CTL_WEIGHT,
    RES_PARATR_ADJUST,
  ]);
  if (allowListItems)
    for (const which of [RES_PARATR_LIST_ID, RES_PARATR_LIST_LEVEL, RES_PARATR_NUMRULE])
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
  if (!inherited && !directWeight && !directPosture && !directUnderline) return undefined;
  const weight = set.Get(RES_CHRATR_WEIGHT, inherited);
  const asianWeight = set.Get(RES_CHRATR_CJK_WEIGHT, inherited);
  const complexWeight = set.Get(RES_CHRATR_CTL_WEIGHT, inherited);
  const posture = set.Get(RES_CHRATR_POSTURE, inherited);
  const asianPosture = set.Get(RES_CHRATR_CJK_POSTURE, inherited);
  const complexPosture = set.Get(RES_CHRATR_CTL_POSTURE, inherited);
  const underline = set.Get(RES_CHRATR_UNDERLINE, inherited);
  if (
    !(weight instanceof SvxWeightItem) ||
    !(asianWeight instanceof SvxWeightItem) ||
    !(complexWeight instanceof SvxWeightItem) ||
    !(posture instanceof SvxPostureItem) ||
    !(asianPosture instanceof SvxPostureItem) ||
    !(complexPosture instanceof SvxPostureItem) ||
    !(underline instanceof SvxUnderlineItem)
  )
    throw new Error("ODT character item is invalid.");
  if (
    weight.GetBoolValue() !== asianWeight.GetBoolValue() ||
    weight.GetBoolValue() !== complexWeight.GetBoolValue() ||
    posture.GetBoolValue() !== asianPosture.GetBoolValue() ||
    posture.GetBoolValue() !== complexPosture.GetBoolValue()
  )
    throw new Error("ODT export does not support script-specific character formatting.");
  return {
    ...(inherited || directWeight ? { bold: weight.GetBoolValue() } : {}),
    ...(inherited || directPosture ? { italic: posture.GetBoolValue() } : {}),
    ...(inherited || directUnderline ? { underline: underline.GetBoolValue() } : {}),
  };
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
