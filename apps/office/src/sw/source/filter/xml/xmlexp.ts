/**
 * @fileoverview Reimplements the bounded Writer ODF XML export bridge from pinned LibreOffice `sw/source/filter/xml/xmlexp.cxx`.
 */

import { SvxAdjust, SvxAdjustItem } from "../../../../editeng/source/items/paraitem";
import {
  escapeXml,
  exportTextParagraphs,
  ODF_NAMESPACES,
  type OdfParagraph,
  type OdfParagraphAlignment,
} from "../../../../xmloff/source/text/txtparae";
import { RES_PARATR_ADJUST } from "../../../inc/hintids";
import type { SwDoc } from "../../core/doc/doc";
import type { SwTextNode } from "../../core/txtnode/ndtxt";

const OFFICE_NAMESPACES = `xmlns:office="${ODF_NAMESPACES.office}" xmlns:style="${ODF_NAMESPACES.style}" xmlns:text="${ODF_NAMESPACES.text}" xmlns:fo="${ODF_NAMESPACES.fo}"`;

/** Serializes Writer named paragraph styles into styles.xml. @param document - Canonical SwDoc. @returns Complete XML. */
export function exportStylesXml(document: SwDoc): string {
  const styles = document.GetTextFormatColls().map(
    /** Emits one named Writer paragraph style. @param collection - Style collection. @returns Style XML. */
    (collection) => {
      assertOnlyAlignment(collection.GetAttrSet().entries(), `paragraph style ${collection.id}`);
      const alignment = getDirectAlignment(
        collection.GetAttrSet().GetItemIfSet(RES_PARATR_ADJUST, false),
      );
      const name = collection.id === "default" ? "Standard" : "Heading_20_1";
      const parent = collection.id === "heading-1" ? ' style:parent-style-name="Standard"' : "";
      const properties =
        alignment === undefined
          ? ""
          : `<style:paragraph-properties fo:text-align="${exportAlignment(alignment)}"/>`;
      return `<style:style style:name="${name}" style:display-name="${escapeXml(collection.GetName())}" style:family="paragraph"${parent}>${properties}</style:style>`;
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
  if (node.list.kind !== "none" || node.list.level !== 0 || node.list.styleId !== undefined)
    throw new Error(`ODT export does not yet support Writer lists: ${node.id}`);
  const directItems = node.GetpSwAttrSet()?.entries() ?? [];
  assertOnlyAlignment(directItems, `paragraph ${node.id}`);
  const alignment = getDirectAlignment(
    node.GetpSwAttrSet()?.GetItemIfSet(RES_PARATR_ADJUST, false),
  );
  return {
    ...(alignment === undefined ? {} : { alignment }),
    runs: node.runs.map(
      /** Projects one canonical direct-format run. @param run - Writer run. @returns Neutral run. */
      (run) => ({ properties: { ...run.attributes }, text: run.text }),
    ),
    style: node.style,
  };
}

/** Rejects paragraph items outside this ODT slice. @param items - Direct items. @param owner - Error identity. @returns Nothing. */
function assertOnlyAlignment(items: readonly { Which(): number }[], owner: string): void {
  const unsupported = items.find(
    /** Finds a non-alignment item. @param item - Direct pool item. @returns Whether unsupported. */
    (item) => item.Which() !== RES_PARATR_ADJUST,
  );
  if (unsupported !== undefined)
    throw new Error(`ODT export does not support WhichId ${unsupported.Which()} on ${owner}.`);
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
