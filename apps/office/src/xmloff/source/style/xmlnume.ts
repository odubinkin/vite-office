/** @fileoverview Owns supported ODF 1.3 list label-alignment serialization from pinned xmlnume.cxx. */
import type { OdfListLevelLayout } from "../text/txtparae";
import { SvXMLUnitConverter } from "../core/xmluconv";

/** Emits native mode and conditional label-alignment attributes. @param layout - Native UNO MM100 properties, or no supported alignment. @returns List-level XML. */
export function exportListLevelLayout(layout: OdfListLevelLayout | undefined): string {
  if (layout === undefined) return "";
  const converter = new SvXMLUnitConverter("mm100");
  const follow = layout.labelFollowedBy ?? "listtab";
  const tabPosition = layout.listTabPosition ?? 0;
  const firstLineIndent = layout.firstLineIndent ?? 0;
  const indentAt = layout.indentAt ?? 0;
  const attributes = [`text:label-followed-by="${follow}"`];
  if (follow === "listtab" && tabPosition > 0)
    attributes.push(`text:list-tab-stop-position="${converter.convertMeasureToXML(tabPosition)}"`);
  if (firstLineIndent !== 0)
    attributes.push(`fo:text-indent="${converter.convertMeasureToXML(firstLineIndent)}"`);
  if (indentAt !== 0)
    attributes.push(`fo:margin-left="${converter.convertMeasureToXML(indentAt)}"`);
  return `<style:list-level-properties text:list-level-position-and-space-mode="label-alignment"><style:list-level-label-alignment ${attributes.join(" ")}/></style:list-level-properties>`;
}
